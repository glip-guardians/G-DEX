/* ==========================================================
   pool.js (G-DEX Pool helper)
   - Add UX: one-side input -> auto quote the other side
   - Primary: reserves-based quote (pair exists)
   - Fallback: price-card based quote (pair not created yet)
   ========================================================== */

(function(){
  // ---- safe selectors ----
  const $$ = (s)=> document.querySelector(s);
  const $ = window.$ || $$;

  // ---- internal state ----
  let __poolQuoteTimer = null;
  let __poolTyping = 0; // 0 none, 1 user typed amt0, 2 user typed amt1
  let __poolLastPairKey = "";
  let __poolCachedReserves = null; // {pair, tokenA, tokenB, reserveA, reserveB, ts}

  // ---- core math: UniswapV2 quote ----
  function quote(amountIn, reserveIn, reserveOut) {
    // amountOut = amountIn * reserveOut / reserveIn
    if (!amountIn || reserveIn.isZero() || reserveOut.isZero()) return window.ethers.BigNumber.from(0);
    return amountIn.mul(reserveOut).div(reserveIn);
  }

  async function getReservesForPairOrdered(pairAddr, tokenA, tokenB, provider){
    const ethers = window.ethers;
    const pair = new ethers.Contract(pairAddr, [
      "function getReserves() view returns (uint112,uint112,uint32)",
      "function token0() view returns (address)"
    ], provider);

    const [r0, r1] = await pair.getReserves();
    const t0 = (await pair.token0()).toLowerCase();

    const reserveA = (tokenA.toLowerCase() === t0) ? r0 : r1;
    const reserveB = (tokenA.toLowerCase() === t0) ? r1 : r0;

    return { reserveA, reserveB };
  }

  // ---------- Fallback price-based quote (when pair not created) ----------
  // Reads #pPrice text like:
  //  - "1 GLIP ≈ 0.0000170 ETH"
  //  - "1 ETH ≈ 58823 GLIP"
  function parsePriceFromCard() {
    const el = document.getElementById("pPrice");
    if (!el) return null;

    const txt = String(el.textContent || "").replace(/\s+/g, " ").trim();
    const m = txt.match(/1\s+([A-Za-z0-9]+)\s*(?:≈|=|~)\s*([0-9]*\.?[0-9]+)\s*([A-Za-z0-9]+)/i);
    if (!m) return null;

    const baseSym  = m[1].toUpperCase();
    const rateNum  = Number(m[2]);
    const quoteSym = m[3].toUpperCase();
    if (!Number.isFinite(rateNum) || rateNum <= 0) return null;

    // meaning: 1 baseSym = rateNum quoteSym
    return { baseSym, quoteNumPerBase: rateNum, quoteSym };
  }

  function fallbackQuoteByPrice(inSym, outSym, inAmountNum) {
    const p = parsePriceFromCard();
    if (!p) return null;

    const IN  = String(inSym  || "").toUpperCase();
    const OUT = String(outSym || "").toUpperCase();
    if (!IN || !OUT) return null;

    if (IN === p.baseSym && OUT === p.quoteSym) return inAmountNum * p.quoteNumPerBase;
    if (IN === p.quoteSym && OUT === p.baseSym) return inAmountNum / p.quoteNumPerBase;

    return null;
  }

  // ---- get currently selected pool tokens ----
  function getPoolMetas(){
    const m0 = window.getSelectedMeta ? window.getSelectedMeta($('#pT0Sym')) : null;
    const m1 = window.getSelectedMeta ? window.getSelectedMeta($('#pT1Sym')) : null;
    return { m0, m1 };
  }

  // ---- debounce auto-quote ----
  function schedulePoolAutoQuote(fromSide){
    if (__poolQuoteTimer) clearTimeout(__poolQuoteTimer);
    __poolQuoteTimer = setTimeout(()=> poolAutoQuote(fromSide).catch(()=>{}), 120);
  }

  // ---- main auto-quote ----
  async function poolAutoQuote(fromSide){
    try{
      const ethers = window.ethers;
      if(!ethers) return;

      const inp0 = $('#pAmt0');
      const inp1 = $('#pAmt1');
      if(!inp0 || !inp1) return;

      // avoid recursion: only proceed if user is typing this side
      if(__poolTyping && __poolTyping !== fromSide) return;

      const { m0, m1 } = getPoolMetas();
      if(!m0 || !m1) return;

      const is0Eth = window.metaIsETH ? window.metaIsETH(m0) : (m0.symbol==="ETH"||m0.address==="ETH");
      const is1Eth = window.metaIsETH ? window.metaIsETH(m1) : (m1.symbol==="ETH"||m1.address==="ETH");
      if(is0Eth && is1Eth) return;

      const inEl  = (fromSide===1) ? inp0 : inp1;
      const outEl = (fromSide===1) ? inp1 : inp0;

      const inStr = String(inEl.value || "").trim();
      const inNum = Number(inStr);
      if(!inStr || !Number.isFinite(inNum) || inNum<=0){
        // if user cleared input, clear other (only if they were typing)
        if(__poolTyping===fromSide) outEl.value = "";
        return;
      }

      // resolve token addresses for pair
      const token0 = window.addrForPath ? window.addrForPath(m0) : (is0Eth ? window.WETH_MAINNET : m0.address);
      const token1 = window.addrForPath ? window.addrForPath(m1) : (is1Eth ? window.WETH_MAINNET : m1.address);

      // ensure web3 (provider exists)
      if(window.ensureWeb3) window.ensureWeb3();
      const provider = window.provider;
      if(!provider) return;

      const key = `${token0.toLowerCase()}-${token1.toLowerCase()}`;
      let pair = null;

      // getPair (read-only)
      if(window.factory && window.factory.getPair){
        pair = await window.factory.getPair(token0, token1);
      }else if(window.poolGetPairAddr){
        pair = await window.poolGetPairAddr(token0, token1);
      }

      const ZERO = ethers.constants.AddressZero;

      // ---- FALLBACK: if pair not created yet, use price card ----
      if(!pair || pair===ZERO){
        const inMeta  = (fromSide===1) ? m0 : m1;
        const outMeta = (fromSide===1) ? m1 : m0;
        const outNum = fallbackQuoteByPrice(inMeta.symbol, outMeta.symbol, inNum);

        if(!Number.isFinite(outNum) || outNum<=0) return;

        __poolTyping = fromSide;
        outEl.value = outNum >= 1 ? outNum.toFixed(6) : outNum.toPrecision(6);
        return;
      }

      // reserves caching (avoid hammering RPC)
      const now = Date.now();
      const cacheOk = __poolCachedReserves
        && __poolCachedReserves.pair?.toLowerCase() === String(pair).toLowerCase()
        && __poolCachedReserves.tokenA?.toLowerCase() === token0.toLowerCase()
        && __poolCachedReserves.tokenB?.toLowerCase() === token1.toLowerCase()
        && (now - __poolCachedReserves.ts) < 1500;

      let reserveA, reserveB;
      if(cacheOk){
        reserveA = __poolCachedReserves.reserveA;
        reserveB = __poolCachedReserves.reserveB;
      }else{
        const r = await getReservesForPairOrdered(pair, token0, token1, provider);
        reserveA = r.reserveA;
        reserveB = r.reserveB;
        __poolCachedReserves = { pair, tokenA: token0, tokenB: token1, reserveA, reserveB, ts: now };
      }

      // compute quote using correct direction
      // If user typed amt0 -> output amt1 = quote(amt0, reserve0, reserve1)
      // If user typed amt1 -> output amt0 = quote(amt1, reserve1, reserve0)
      const inMeta  = (fromSide===1) ? m0 : m1;
      const outMeta = (fromSide===1) ? m1 : m0;

      const inBN = window.bnFromInput
        ? window.bnFromInput(inStr, inMeta.decimals ?? 18)
        : ethers.utils.parseUnits(inStr, inMeta.decimals ?? 18);

      if(inBN.lte(0)) return;

      const outBN = (fromSide===1)
        ? quote(inBN, reserveA, reserveB)
        : quote(inBN, reserveB, reserveA);

      const outStr = ethers.utils.formatUnits(outBN, outMeta.decimals ?? 18);
      const outNum = Number(outStr);

      __poolTyping = fromSide;
      outEl.value = Number.isFinite(outNum)
        ? (outNum >= 1 ? outNum.toFixed(6) : outNum.toPrecision(6))
        : outStr;

    }catch(e){
      // silent fail for UX
    }finally{
      // release typing lock shortly after write
      setTimeout(()=>{ __poolTyping = 0; }, 0);
    }
  }

  // ---- bind inputs ----
  function bindPoolInputs(){
    const a0 = $('#pAmt0');
    const a1 = $('#pAmt1');
    if(a0){
      a0.addEventListener('input', ()=>{
        __poolTyping = 1;
        schedulePoolAutoQuote(1);
      });
      a0.addEventListener('focus', ()=>{ __poolTyping = 1; });
    }
    if(a1){
      a1.addEventListener('input', ()=>{
        __poolTyping = 2;
        schedulePoolAutoQuote(2);
      });
      a1.addEventListener('focus', ()=>{ __poolTyping = 2; });
    }
  }

  // ---- bind token changes / flip to refresh quoting ----
  function bindPoolTokenChanges(){
    const pFlip = $('#pFlip');
    if(pFlip){
      pFlip.addEventListener('click', ()=>{
        __poolCachedReserves = null;
        // re-quote based on whichever field has value
        const v0 = String($('#pAmt0')?.value||"").trim();
        const v1 = String($('#pAmt1')?.value||"").trim();
        if(v0 && Number(v0)>0) schedulePoolAutoQuote(1);
        else if(v1 && Number(v1)>0) schedulePoolAutoQuote(2);
      });
    }

    // if token buttons exist, after selecting token (your main script updates),
    // we just clear cache and trigger quote
    const t0 = $('#pT0Btn');
    const t1 = $('#pT1Btn');
    const onTokChanged = ()=>{
      __poolCachedReserves = null;
      const v0 = String($('#pAmt0')?.value||"").trim();
      const v1 = String($('#pAmt1')?.value||"").trim();
      if(v0 && Number(v0)>0) schedulePoolAutoQuote(1);
      else if(v1 && Number(v1)>0) schedulePoolAutoQuote(2);
    };
    if(t0) t0.addEventListener('click', ()=> setTimeout(onTokChanged, 400));
    if(t1) t1.addEventListener('click', ()=> setTimeout(onTokChanged, 400));
  }

  // ---- boot ----
  function bootPoolJS(){
    bindPoolInputs();
    bindPoolTokenChanges();
  }

  document.addEventListener('DOMContentLoaded', bootPoolJS);

})();
