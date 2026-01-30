/* =========================================================
   pool.js  (G-DEX Pool UX Patch)
   - Auto-quote other side on Add Liquidity (reserves-based)
   - Fallback quote when pair doesn't exist (uses #pPrice text)
   - Force Supply button to in-app pool actions (block redirect)
   ========================================================= */

(function(){
  /* ---------- tiny utils ---------- */
  const $ = (s)=>document.querySelector(s);
  const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
  const nowSec = ()=>Math.floor(Date.now()/1000);

  function hasEthers(){ return !!window.ethers; }

  function getSymEl0(){ return document.getElementById('pT0Sym'); }
  function getSymEl1(){ return document.getElementById('pT1Sym'); }
  function getAmt0El(){ return document.getElementById('pAmt0'); }
  function getAmt1El(){ return document.getElementById('pAmt1'); }

  function safeNum(x){
    const n = Number(x);
    return Number.isFinite(n) ? n : NaN;
  }

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  /* =========================================================
     Requirements / dependencies expected from main script:
     - window.getSelectedMeta(symEl)
     - window.metaIsETH(meta)
     - window.addrForPath(meta)  (ETH -> WETH)
     - window.ensureWeb3()
     - window.ensureMainnet()
     - window.poolGetPairAddr(tokenA, tokenB) OR factory.getPair
     - window.poolEnsurePairExists(tokenA, tokenB) (optional; not used here)
     - window.poolAddLiquidity()
     - window.poolRemoveLiquidity()
     - window.poolSetMode(mode)  (optional)
     - window.provider (ethers provider) or (ensureWeb3() sets it)
     - window.PAIR_ABI (optional) or we define minimal ABI below
     ========================================================= */

  const MIN_PAIR_ABI = [
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() view returns (address)"
  ];

  /* ---------- quote helpers ---------- */
  function quote(amountIn, reserveIn, reserveOut){
    // amountOut = amountIn * reserveOut / reserveIn
    if(!reserveIn || !reserveOut) return ethers.BigNumber.from(0);
    if(reserveIn.isZero() || reserveOut.isZero()) return ethers.BigNumber.from(0);
    return amountIn.mul(reserveOut).div(reserveIn);
  }

  async function getReservesForPairOrdered(pairAddr, tokenA, tokenB, provider){
    const pair = new ethers.Contract(pairAddr, MIN_PAIR_ABI, provider);
    const [r0, r1] = await pair.getReserves();
    const t0 = (await pair.token0()).toLowerCase();

    const a = tokenA.toLowerCase();
    // reserveA = reserve for tokenA, reserveB = reserve for tokenB
    const reserveA = (a === t0) ? r0 : r1;
    const reserveB = (a === t0) ? r1 : r0;
    return { reserveA, reserveB };
  }

  /* ---------- fallback: parse "Price (T1 per T0)" card text ---------- */
  function parseFallbackPrice_T1perT0(){
    // Main script sets #pPrice like: "1 GLIP ≈ 0.0000170 ETH" (example)
    // We want "T1 per T0" ratio. UI label says "Price (T1 per T0)".
    // We'll try to parse any number in the string and assume it is (T0 per 1 T1) or (T1 per 1 T0)
    // so we also try to infer direction.
    const el = document.getElementById('pPrice');
    if(!el) return null;
    const txt = String(el.textContent||"").trim();
    if(!txt) return null;

    // Extract numbers
    const nums = txt.match(/([0-9]*\.?[0-9]+)/g);
    if(!nums || !nums.length) return null;

    // Heuristic:
    // If text contains "1" then another number, we assume it's "1 <T1> ≈ X <T0>"
    // => T1 per T0 = 1 / X
    // But label says "T1 per T0" and your UI example was "1 GLIP ≈ 0.0000170 ETH" (T1=GLIP, T0=ETH),
    // that would be T1 per T0 = 1 / 0.0000170 = ~58823 GLIP per ETH.
    // We'll implement that: if starts with "1" then take second as X.
    let x = null;
    if(nums.length >= 2 && Math.abs(Number(nums[0]) - 1) < 1e-12){
      x = Number(nums[1]);
      if(Number.isFinite(x) && x > 0){
        return 1 / x; // T1 per T0
      }
    }

    // Otherwise just use first numeric token as already T1 per T0
    const first = Number(nums[0]);
    if(Number.isFinite(first) && first > 0) return first;

    return null;
  }

  function formatToInput(val){
    if(!Number.isFinite(val) || val <= 0) return "";
    // keep UI friendly
    if(val >= 1) return val.toFixed(6);
    // small numbers: precision 6
    return Number(val.toPrecision(6)).toString();
  }

  /* =========================================================
     Auto Quote Engine (Add Liquidity inputs)
     ========================================================= */

  let __poolQuoteTimer = null;
  let __poolQuoteLock = false;     // prevent loop when setting other input
  let __poolLastEdited = 0;        // 1 => amt0 edited, 2 => amt1 edited
  let __poolCachedReserves = null; // {pair, token0, token1, reserve0, reserve1, ts}
  const RESERVE_CACHE_MS = 8000;

  async function getPoolPairAndReserves(m0, m1){
    if(!window.ensureWeb3) throw new Error("ensureWeb3 missing");
    window.ensureWeb3();

    if(!window.provider) throw new Error("provider missing");
    const provider = window.provider;

    const token0 = window.addrForPath ? window.addrForPath(m0) : (m0.address);
    const token1 = window.addrForPath ? window.addrForPath(m1) : (m1.address);

    // Pair address
    let pairAddr = null;
    if(typeof window.poolGetPairAddr === "function"){
      pairAddr = await window.poolGetPairAddr(token0, token1);
    }else if(window.factory && typeof window.factory.getPair === "function"){
      pairAddr = await window.factory.getPair(token0, token1);
    }else{
      throw new Error("poolGetPairAddr/factory.getPair missing");
    }

    if(!pairAddr || pairAddr === ethers.constants.AddressZero){
      return { pairAddr: null, token0, token1, reserves: null };
    }

    // cache
    const key = `${pairAddr.toLowerCase()}_${token0.toLowerCase()}_${token1.toLowerCase()}`;
    const now = Date.now();
    if(__poolCachedReserves && __poolCachedReserves.key === key && (now - __poolCachedReserves.ts) < RESERVE_CACHE_MS){
      return { pairAddr, token0, token1, reserves: __poolCachedReserves.reserves };
    }

    const { reserveA, reserveB } = await getReservesForPairOrdered(pairAddr, token0, token1, provider);
    const reserves = { reserve0: reserveA, reserve1: reserveB };
    __poolCachedReserves = { key, ts: now, reserves };
    return { pairAddr, token0, token1, reserves };
  }

  async function doPoolAutoQuote(changedSide /*1 or 2*/){
    if(__poolQuoteLock) return;
    if(!hasEthers()) return;

    const amt0El = getAmt0El();
    const amt1El = getAmt1El();
    const sym0El = getSymEl0();
    const sym1El = getSymEl1();
    if(!amt0El || !amt1El || !sym0El || !sym1El) return;

    // metas
    if(typeof window.getSelectedMeta !== "function") return;
    const m0 = window.getSelectedMeta(sym0El);
    const m1 = window.getSelectedMeta(sym1El);
    if(!m0 || !m1) return;

    // read inputs
    const v0s = String(amt0El.value||"").trim();
    const v1s = String(amt1El.value||"").trim();
    const v0 = safeNum(v0s);
    const v1 = safeNum(v1s);

    // If user cleared, don't fight them
    if(changedSide === 1 && (!v0s || !(v0 > 0))){
      // user cleared amt0: also clear quote if it was auto
      return;
    }
    if(changedSide === 2 && (!v1s || !(v1 > 0))){
      return;
    }

    // decimals
    const d0 = m0.decimals ?? 18;
    const d1 = m1.decimals ?? 18;

    // try reserves-based quote if pair exists
    let ratio_T1perT0 = null; // fallback ratio
    try{
      const { pairAddr, reserves } = await getPoolPairAndReserves(m0, m1);

      if(pairAddr && reserves && reserves.reserve0 && reserves.reserve1){
        if(changedSide === 1){
          // amt0 -> quote amt1
          const amount0BN = ethers.utils.parseUnits(String(v0s), d0);
          const out1BN = quote(amount0BN, reserves.reserve0, reserves.reserve1);
          const out1 = Number(ethers.utils.formatUnits(out1BN, d1));
          if(Number.isFinite(out1) && out1 > 0){
            __poolQuoteLock = true;
            amt1El.value = formatToInput(out1);
            __poolQuoteLock = false;
            setPoolManualNote(pairAddr ? "Reserves quote" : "Fallback quote");
            return;
          }
        }else{
          // amt1 -> quote amt0
          const amount1BN = ethers.utils.parseUnits(String(v1s), d1);
          const out0BN = quote(amount1BN, reserves.reserve1, reserves.reserve0);
          const out0 = Number(ethers.utils.formatUnits(out0BN, d0));
          if(Number.isFinite(out0) && out0 > 0){
            __poolQuoteLock = true;
            amt0El.value = formatToInput(out0);
            __poolQuoteLock = false;
            setPoolManualNote(pairAddr ? "Reserves quote" : "Fallback quote");
            return;
          }
        }
      }

      // no pair: fallback to #pPrice ratio
      ratio_T1perT0 = parseFallbackPrice_T1perT0();
      if(ratio_T1perT0 && Number.isFinite(ratio_T1perT0) && ratio_T1perT0 > 0){
        if(changedSide === 1){
          // amt0 -> amt1 = amt0 * (T1 per T0)
          const out1 = v0 * ratio_T1perT0;
          if(Number.isFinite(out1) && out1 > 0){
            __poolQuoteLock = true;
            amt1El.value = formatToInput(out1);
            __poolQuoteLock = false;
            setPoolManualNote("Fallback quote (no pair yet)");
            return;
          }
        }else{
          // amt1 -> amt0 = amt1 / (T1 per T0)
          const out0 = v1 / ratio_T1perT0;
          if(Number.isFinite(out0) && out0 > 0){
            __poolQuoteLock = true;
            amt0El.value = formatToInput(out0);
            __poolQuoteLock = false;
            setPoolManualNote("Fallback quote (no pair yet)");
            return;
          }
        }
      }

      setPoolManualNote(pairAddr ? "No quote (low reserves?)" : "No quote (no pair yet)");
    }catch(e){
      // fallback try if reserves fetch failed
      ratio_T1perT0 = parseFallbackPrice_T1perT0();
      if(ratio_T1perT0 && Number.isFinite(ratio_T1perT0) && ratio_T1perT0 > 0){
        if(changedSide === 1 && v0 > 0){
          const out1 = v0 * ratio_T1perT0;
          __poolQuoteLock = true;
          amt1El.value = formatToInput(out1);
          __poolQuoteLock = false;
          setPoolManualNote("Fallback quote");
          return;
        }
        if(changedSide === 2 && v1 > 0){
          const out0 = v1 / ratio_T1perT0;
          __poolQuoteLock = true;
          amt0El.value = formatToInput(out0);
          __poolQuoteLock = false;
          setPoolManualNote("Fallback quote");
          return;
        }
      }
      setPoolManualNote("");
    }
  }

  function schedulePoolAutoQuote(side){
    __poolLastEdited = side;
    if(__poolQuoteTimer) clearTimeout(__poolQuoteTimer);
    __poolQuoteTimer = setTimeout(()=>doPoolAutoQuote(side), 140);
  }

  function setPoolManualNote(msg){
    const el = document.getElementById('pManualNote');
    if(!el) return;
    el.textContent = msg ? String(msg) : "";
  }

  function bindPoolInputs(){
    const a0 = getAmt0El();
    const a1 = getAmt1El();
    if(a0){
      a0.addEventListener('input', ()=>{
        if(__poolQuoteLock) return;
        schedulePoolAutoQuote(1);
      });
    }
    if(a1){
      a1.addEventListener('input', ()=>{
        if(__poolQuoteLock) return;
        schedulePoolAutoQuote(2);
      });
    }
  }

  function bindPoolTokenChanges(){
    // token buttons exist: #pT0Btn, #pT1Btn
    // main script updates token selection; we just clear reserves cache and trigger quote again
    const b0 = document.getElementById('pT0Btn');
    const b1 = document.getElementById('pT1Btn');
    const onTokChanged = ()=>{
      __poolCachedReserves = null;
      // try quote based on whichever side has value
      const v0 = String(getAmt0El()?.value||"").trim();
      const v1 = String(getAmt1El()?.value||"").trim();
      if(v0 && Number(v0)>0) schedulePoolAutoQuote(1);
      else if(v1 && Number(v1)>0) schedulePoolAutoQuote(2);
      else setPoolManualNote("");
    };
    if(b0) b0.addEventListener('click', ()=>setTimeout(onTokChanged, 450));
    if(b1) b1.addEventListener('click', ()=>setTimeout(onTokChanged, 450));
  }

  /* =========================================================
     Force Supply button to in-app pool (block redirect)
     ========================================================= */

  // ✅ bootPoolJS 밖에 둔다
  function forceInAppSupplyButton(){
    const btn = document.getElementById('poolSupply');
    if(!btn) return;

    // 혹시 링크/데이터로 박혀 있으면 제거
    try { btn.removeAttribute('href'); } catch(e){}
    try { btn.dataset.href = ""; } catch(e){}

    // ✅ 기존 리다이렉트/핸들러 차단 (capture=true)
    btn.addEventListener('click', (e) => {
      try{
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }catch(_){}

      // ✅ 인앱 Pool 동작으로 강제 연결
      // (메인 스크립트/전역에 있어야 함)
      try{
        if(typeof window.poolSetMode === "function"){
          // remove 모드면 remove를, 아니면 add
          if(typeof window.__poolMode === "string" && window.__poolMode === "remove"){
            window.poolSetMode("remove");
          }else{
            window.poolSetMode("add");
          }
        }
      }catch(_){}

      try{
        if(typeof window.__poolMode === "string" && window.__poolMode === "remove"){
          if(typeof window.poolRemoveLiquidity === "function") window.poolRemoveLiquidity();
          else if(typeof window.poolRemoveLiquidity !== "function" && typeof window.poolAddLiquidity === "function"){
            // fallback
            window.poolAddLiquidity();
          }
        }else{
          if(typeof window.poolAddLiquidity === "function") window.poolAddLiquidity();
        }
      }catch(err){
        console.warn("[pool.js] supply force failed", err);
      }
    }, true);
  }

  /* =========================================================
     Boot
     ========================================================= */
  function bootPoolJS(){
    // bind auto quote
    bindPoolInputs();
    bindPoolTokenChanges();

    // block redirect + force in-app supply behavior
    forceInAppSupplyButton();

    // optional: initial hint
    setTimeout(()=>{
      const v0 = String(getAmt0El()?.value||"").trim();
      const v1 = String(getAmt1El()?.value||"").trim();
      if(v0 && Number(v0)>0) schedulePoolAutoQuote(1);
      else if(v1 && Number(v1)>0) schedulePoolAutoQuote(2);
    }, 600);
  }

  document.addEventListener('DOMContentLoaded', bootPoolJS);
})();
