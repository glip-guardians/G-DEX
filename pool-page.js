/* =========================================================
   G-DEX Pools — pool-page.js (Upgraded)
   - Wallet connect (Swap-like): injected first + mobile deeplink fallback
   - Custom token dropdown: search + logo + scroll fixed (mobile/iOS)
   - SushiSwap V2 Router/Factory + standard V2 ABIs
   Chain: Ethereum Mainnet
========================================================= */

(() => {
  "use strict";

  /********************
   * Config
   ********************/
  const CHAIN_ID_REQUIRED = 1;

  // SushiSwap V2 (Ethereum Mainnet)
  const SUSHI_ROUTER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
  const SUSHI_FACTORY = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  // GLIP
  const GLIP = "0xD0b86b79AE4b8D7bb88b37EBe228ce343D79794e";

  // Sentinel for ETH option
  const ETH_SENTINEL = "ETH";

  /********************
   * Token List (as provided)
   ********************/
  const tokenList = [
    {symbol:"ETH", name:"Ethereum", address:"ETH", decimals:18, logo:"https://assets.coingecko.com/coins/images/279/standard/ethereum.png"},
    {symbol:"GLIP", name:"GLIP Token", address:GLIP, decimals:18, logo:"https://cdn.imweb.me/thumbnail/20251023/7c2d51fa8c1bc.png"},
    {symbol:"USDT", name:"Tether USD", address:"0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals:6, logo:"https://assets.coingecko.com/coins/images/325/standard/Tether.png"},
    {symbol:"USDC", name:"USD Coin", address:"0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", decimals:6, logo:"https://info-blog.to/wp-content/uploads/2025/05/usdc-coin-wallpaper.png"},
    {symbol:"DAI", name:"Dai", address:"0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals:18, logo:"https://images.saymedia-content.com/.image/t_share/MTgyNTk1NDg5MDc2Njg0MTI4/maker-protokoll-dai-stablecoin-and-mkr-token-explained.png"},
    {symbol:"FRAX", name:"Frax", address:"0x853d955aCEf822Db058eb8505911ED77F175b99e", decimals:18, logo:"https://coin-images.coingecko.com/coins/images/13422/large/LFRAX.png?1751911193"},
    {symbol:"WBTC", name:"Wrapped BTC", address:"0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals:8, logo:"https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png"},
    {symbol:"MATIC", name:"Polygon", address:"0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", decimals:18, logo:"https://assets.coingecko.com/coins/images/4713/standard/polygon.png"},
    {symbol:"BNB", name:"BNB", address:"0xB8c77482e45F1F44De1745F52C74426C631bDD52", decimals:18, logo:"https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png"},
    {symbol:"XRP", name:"XRP (ERC20-wrap)", address:"0x1D2F0da169ceB9fC7C8A636a7fB3b73bEccFFa75", decimals:6, logo:"https://assets.coingecko.com/coins/images/44/standard/xrp-symbol-white-128.png"},
    {symbol:"LINK", name:"Chainlink", address:"0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals:18, logo:"https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png"},
    {symbol:"UNI",  name:"Uniswap", address:"0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals:18, logo:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png"},
    {symbol:"AAVE", name:"Aave", address:"0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", decimals:18, logo:"https://assets.coingecko.com/coins/images/12645/standard/AAVE.png"},
    {symbol:"LDO", name:"Lido DAO", address:"0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", decimals:18, logo:"https://assets.coingecko.com/coins/images/13573/standard/Lido_DAO.png"},
    {symbol:"SNX", name:"Synthetix", address:"0xC011A72400E58ecD99Ee497CF89E3775d4bd732F", decimals:18, logo:"https://assets.coingecko.com/coins/images/3406/standard/SNX.png"},
    {symbol:"CRV", name:"Curve DAO", address:"0xD533a949740bb3306d119CC777fa900bA034cd52", decimals:18, logo:"https://assets.coingecko.com/coins/images/12124/standard/Curve.png"},
    {symbol:"COMP", name:"Compound", address:"0xc00e94Cb662C3520282E6f5717214004A7f26888", decimals:18, logo:"https://assets.coingecko.com/coins/images/10775/standard/COMP.png"},
    {symbol:"MKR", name:"Maker", address:"0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", decimals:18, logo:"https://assets.coingecko.com/coins/images/1364/standard/Mark_Maker.png"},
    {symbol:"YFI", name:"yearn.finance", address:"0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", decimals:18, logo:"https://coin-images.coingecko.com/coins/images/11849/large/yearn.jpg"},
    {symbol:"SUSHI", name:"Sushi", address:"0x6B3595068778DD592e39A122f4f5a5CF09C90fE2", decimals:18, logo:"https://coin-images.coingecko.com/coins/images/12271/large/512x512_Logo_no_chop.png"},
    {symbol:"BAL", name:"Balancer", address:"0xba100000625a3754423978a60c9317c58a424e3D", decimals:18, logo:"https://assets.coingecko.com/coins/images/11683/standard/Balancer.png"},
    {symbol:"1INCH", name:"1inch", address:"0x111111111117dC0aa78b770fA6A738034120C302", decimals:18, logo:"https://assets.coingecko.com/coins/images/13469/standard/1inch-token.png"},
    {symbol:"ENS", name:"Ethereum Name Service", address:"0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", decimals:18, logo:"https://coin-images.coingecko.com/coins/images/19785/large/ENS.jpg"},
    {symbol:"OP", name:"Optimism", address:"0x4200000000000000000000000000000000000042", decimals:18, logo:"https://assets.coingecko.com/coins/images/25244/standard/Optimism.png"},
    {symbol:"ARB", name:"Arbitrum", address:"0x912CE59144191C1204E64559FE8253a0e49E6548", decimals:18, logo:"https://coin-images.coingecko.com/coins/images/16547/large/arb.jpg"},
    {symbol:"PEPE", name:"Pepe", address:"0x6982508145454Ce325dDbE47a25d4ec3d2311933", decimals:18, logo:"https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg"},
    {symbol:"SHIB", name:"Shiba Inu", address:"0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", decimals:18, logo:"https://assets.coingecko.com/coins/images/11939/standard/shiba.png"},
    {symbol:"DOGE", name:"Dogecoin (ERC20 wrap)", address:"0x4206931337dc273a630d328da6441786bfad668f", decimals:8, logo:"https://assets.coingecko.com/coins/images/5/standard/dogecoin.png"},
    {symbol:"BAT", name:"Basic Attention", address:"0x0D8775F648430679A709E98d2b0Cb6250d2887EF", decimals:18, logo:"https://assets.coingecko.com/coins/images/677/standard/basic-attention-token.png"},
    {symbol:"MANA", name:"Decentraland", address:"0x0F5D2fB29fb7d3CFeE444a200298f468908cC942", decimals:18, logo:"https://coin-images.coingecko.com/coins/images/878/large/decentraland-mana.png"},
    {symbol:"SAND", name:"The Sandbox", address:"0x3845badAde8e6dFF049820680d1F14bD3903a5d0", decimals:18, logo:"https://coin-images.coingecko.com/coins/images/12129/large/sandbox_logo.jpg"},
    {symbol:"AXS", name:"Axie Infinity", address:"0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b", decimals:18, logo:"https://assets.coingecko.com/coins/images/13029/standard/axie_infinity_logo.png"},
    {symbol:"GRT", name:"The Graph", address:"0xc944E90C64B2c07662A292be6244BDf05Cda44a7", decimals:18, logo:"https://assets.coingecko.com/coins/images/13397/standard/Graph_Token.png"},
    {symbol:"FTM", name:"Fantom", address:"0x4e15361FD6b4BB609Fa63C81A2be19d873717870", decimals:18, logo:"https://coin-images.coingecko.com/coins/images/16036/large/Fantom.png"},
    {symbol:"NEAR", name:"NEAR (ERC20)", address:"0x85F17Cf997934a597031b2E18a9aB6ebD4B9f6a4", decimals:24, logo:"https://coin-images.coingecko.com/coins/images/10365/large/near.jpg"},
    {symbol:"ANKR", name:"Ankr", address:"0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4", decimals:18, logo:"https://assets.coingecko.com/coins/images/4324/standard/U85xTl2.png"}
  ];

  /********************
   * Minimal ABIs (V2 Standard)
   ********************/
  const ABI_FACTORY = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)",
    "function createPair(address tokenA, address tokenB) external returns (address pair)"
  ];

  const ABI_PAIR = [
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address) external view returns (uint256)",
    "function approve(address spender, uint256 value) external returns (bool)"
  ];

  const ABI_ERC20 = [
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function balanceOf(address) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 value) external returns (bool)"
  ];

  const ABI_ROUTER = [
    "function addLiquidity(address tokenA,address tokenB,uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline) external returns (uint amountA,uint amountB,uint liquidity)",
    "function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external payable returns (uint amountToken,uint amountETH,uint liquidity)",
    "function removeLiquidity(address tokenA,address tokenB,uint liquidity,uint amountAMin,uint amountBMin,address to,uint deadline) external returns (uint amountA,uint amountB)",
    "function removeLiquidityETH(address token,uint liquidity,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external returns (uint amountToken,uint amountETH)"
  ];

  const MAX_UINT = ethers.constants.MaxUint256;
  const DEADLINE_SEC = 60 * 20; // 20 min

  /********************
   * DOM
   ********************/
  const dom = {};
  function cacheDom(){
    dom.btnConnect = document.getElementById("btnConnect");
    dom.netBadge = document.getElementById("netBadge");

    dom.tokenA = document.getElementById("tokenA");
    dom.tokenB = document.getElementById("tokenB");

    dom.pairAddr = document.getElementById("pairAddr");
    dom.lpBal = document.getElementById("lpBal");
    dom.lpSupply = document.getElementById("lpSupply");
    dom.reserves = document.getElementById("reserves");

    dom.btnCreatePair = document.getElementById("btnCreatePair");
    dom.btnRefresh = document.getElementById("btnRefresh");

    dom.amtA = document.getElementById("amtA");
    dom.amtB = document.getElementById("amtB");
    dom.btnApproveA = document.getElementById("btnApproveA");
    dom.btnApproveB = document.getElementById("btnApproveB");
    dom.btnAdd = document.getElementById("btnAdd");

    dom.removePct = document.getElementById("removePct");
    dom.lpToRemove = document.getElementById("lpToRemove");
    dom.btnApproveLP = document.getElementById("btnApproveLP");
    dom.btnRemove = document.getElementById("btnRemove");

    dom.status = document.getElementById("status");
    dom.tabs = Array.from(document.querySelectorAll(".tab"));
    dom.panels = Array.from(document.querySelectorAll(".panel"));
  }

  /********************
   * UI helpers
   ********************/
  function setStatus(msg, type=""){
    if (dom.status){
      dom.status.textContent = String(msg ?? "");
      dom.status.setAttribute("data-type", type);
    }
  }
  function setNetBadge(text){
    if (dom.netBadge) dom.netBadge.textContent = text || "";
  }
  function short(a){
    if (!a || typeof a !== "string") return "";
    return a.slice(0,6) + "…" + a.slice(-4);
  }

  function bnToFloatStr(bn, decimals, precision=6){
    if (!bn) return "-";
    const s = ethers.utils.formatUnits(bn, decimals);
    // trim
    const [i, f=""] = s.split(".");
    if (!f) return i;
    return i + "." + f.slice(0, precision).replace(/0+$/,"");
  }

  function nowDeadline(){
    return Math.floor(Date.now()/1000) + DEADLINE_SEC;
  }

  function isMobileUA(){
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function hasInjected(){
    return !!(window.ethereum && typeof window.ethereum.request === "function");
  }

  function mmDeepLink(urlFull){
    const noProto = (urlFull || location.href).replace(/^https?:\/\//, "");
    return `https://metamask.app.link/dapp/${noProto}`;
  }

  async function ensureMainnet(){
    // best-effort switch
    try{
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }]
      });
      return true;
    }catch(err){
      setStatus("Please switch to Ethereum Mainnet in your wallet to use Pools.", "warn");
      return false;
    }
  }

  /********************
   * Global state
   ********************/
  let provider = null;
  let signer = null;
  let account = null;
  let chainId = null;

  function requireConnected(){
    if (!signer || !account) throw new Error("Connect wallet first.");
  }

  /********************
   * Contracts (lazy)
   ********************/
  function getFactory(readOnly=false){
    const p = readOnly ? (provider || new ethers.providers.JsonRpcProvider()) : signer;
    return new ethers.Contract(SUSHI_FACTORY, ABI_FACTORY, p);
  }
  function getRouter(){
    return new ethers.Contract(SUSHI_ROUTER, ABI_ROUTER, signer);
  }
  function erc20(addr, readOnly=false){
    const p = readOnly ? (provider || new ethers.providers.JsonRpcProvider()) : signer;
    return new ethers.Contract(addr, ABI_ERC20, p);
  }
  function pairContract(addr, readOnly=false){
    const p = readOnly ? (provider || new ethers.providers.JsonRpcProvider()) : signer;
    return new ethers.Contract(addr, ABI_PAIR, p);
  }

  /********************
   * Token helpers
   ********************/
  const tokenByAddr = new Map();
  const tokenBySymbol = new Map();
  tokenList.forEach(t => {
    tokenBySymbol.set(t.symbol, t);
    if (t.address !== ETH_SENTINEL) tokenByAddr.set(t.address.toLowerCase(), t);
  });

  function normalizeTokenAddress(addr){
    if (!addr) return addr;
    if (addr === ETH_SENTINEL) return ETH_SENTINEL;
    return ethers.utils.getAddress(addr);
  }

  function resolveToOnchainAddress(addrOrEth){
    // Factory/Pair/Router always deals with ERC20 addresses; ETH => WETH
    if (addrOrEth === ETH_SENTINEL) return WETH;
    return normalizeTokenAddress(addrOrEth);
  }

  function getTokenMeta(addrOrEth){
    if (addrOrEth === ETH_SENTINEL) return tokenBySymbol.get("ETH");
    const key = String(addrOrEth).toLowerCase();
    return tokenByAddr.get(key);
  }

  /********************
   * Fill hidden selects synchronously (prevents dropdown mismatch)
   ********************/
  function fillCompatSelects(){
    if (!dom.tokenA || !dom.tokenB) return;

    const optsHtml = tokenList.map(t => {
      const label = `${t.symbol} — ${t.name}`;
      const value = t.address; // ETH sentinel stays "ETH"
      return `<option value="${value}">${label}</option>`;
    }).join("");

    dom.tokenA.innerHTML = optsHtml;
    dom.tokenB.innerHTML = optsHtml;

    // Defaults: TokenA=GLIP, TokenB=ETH (if present)
    const hasGLIP = tokenList.some(t => t.symbol === "GLIP");
    const hasETH = tokenList.some(t => t.symbol === "ETH");

    if (hasGLIP) dom.tokenA.value = GLIP;
    if (hasETH) dom.tokenB.value = ETH_SENTINEL;
  }

  /********************
   * Custom Dropdown (rebuild + mobile scroll fix)
   * Requires pool.html to have .tokenSelect wrappers (as you already have)
   ********************/
  function initCustomDropdowns(){
    const boxes = Array.from(document.querySelectorAll('.tokenSelect[data-role="tokenSelect"]'));
    if (!boxes.length) return;

    // Create overlay if not exists
    let overlay = document.getElementById("ddOverlay");
    if (!overlay){
      overlay = document.createElement("div");
      overlay.id = "ddOverlay";
      overlay.className = "ddOverlay";
      document.body.appendChild(overlay);
    }

    function closeAll(){
      boxes.forEach(b => {
        const dd = b.querySelector(".dropdown");
        const tr = b.querySelector(".tokenTrigger");
        if (dd) dd.classList.remove("open");
        if (tr) tr.setAttribute("aria-expanded","false");
      });
      overlay.classList.remove("open");
    }

    overlay.addEventListener("click", closeAll);

    window.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") closeAll();
    });

    // helper: render selected view
    function renderSelected(box, token){
      const logo = box.querySelector(".tokenLogo");
      const sym = box.querySelector(".tokenText .sym");
      const name = box.querySelector(".tokenText .name");
      if (logo) logo.src = token.logo || "";
      if (sym) sym.textContent = token.symbol || "-";
      if (name) name.textContent = token.name || "Select token";
    }

    // Build list from tokenList (NOT from select options) => icon always matches
    function renderList(box, filter=""){
      const list = box.querySelector(".ddList");
      if (!list) return;

      const f = filter.trim().toLowerCase();
      list.innerHTML = "";

      const targetId = box.getAttribute("data-target");
      const compat = document.getElementById(targetId);
      const selectedVal = compat ? compat.value : "";

      const tokens = tokenList.filter(t => {
        if (!f) return true;
        return (t.symbol || "").toLowerCase().includes(f) || (t.name || "").toLowerCase().includes(f);
      });

      tokens.forEach(t => {
        const item = document.createElement("div");
        item.className = "ddItem" + (String(selectedVal).toLowerCase() === String(t.address).toLowerCase() ? " active" : "");
        item.setAttribute("role","option");

        item.innerHTML = `
          <div class="ddItemLeft">
            <img class="tokenLogo" src="${t.logo || ""}" alt="">
            <div class="ddItemText">
              <div class="sym">${t.symbol}</div>
              <div class="name">${t.name}</div>
            </div>
          </div>
          <div class="ddTag">${t.symbol}</div>
        `;

        item.addEventListener("click", () => {
          if (!compat) return;
          compat.value = t.address;

          // Fire change event so logic updates
          compat.dispatchEvent(new Event("change", { bubbles:true }));

          renderSelected(box, t);
          closeAll();
        });

        list.appendChild(item);
      });

      if (!list.children.length){
        const empty = document.createElement("div");
        empty.style.padding = "12px";
        empty.style.color = "rgba(255,255,255,.75)";
        empty.style.fontWeight = "800";
        empty.textContent = "No results.";
        list.appendChild(empty);
      }

      // Mobile/iOS scroll fix
      list.style.maxHeight = "260px";
      list.style.overflowY = "auto";
      list.style.webkitOverflowScrolling = "touch";

      // Prevent overlay/body capturing touch scroll
      list.addEventListener("touchstart", (e)=>{ e.stopPropagation(); }, {passive:true});
      list.addEventListener("touchmove", (e)=>{ e.stopPropagation(); }, {passive:true});
    }

    boxes.forEach(box => {
      const targetId = box.getAttribute("data-target");
      const compat = document.getElementById(targetId);

      const trigger = box.querySelector(".tokenTrigger");
      const dd = box.querySelector(".dropdown");
      const search = box.querySelector(".ddSearch");
      const list = box.querySelector(".ddList");

      if (!compat || !trigger || !dd || !search || !list) return;

      // Initial selected
      const initialMeta = getTokenMeta(compat.value) || tokenBySymbol.get("ETH") || tokenList[0];
      if (initialMeta) renderSelected(box, initialMeta);

      // open/close
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = dd.classList.contains("open");
        closeAll();
        if (!isOpen){
          dd.classList.add("open");
          trigger.setAttribute("aria-expanded","true");
          overlay.classList.add("open");
          search.value = "";
          renderList(box, "");
          setTimeout(()=>search.focus(), 0);
        }
      });

      search.addEventListener("input", () => renderList(box, search.value));

      // if compat changes programmatically, sync UI
      compat.addEventListener("change", () => {
        const m = getTokenMeta(compat.value);
        if (m) renderSelected(box, m);
      });
    });
  }

  /********************
   * Tabs
   ********************/
  function initTabs(){
    dom.tabs.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        dom.tabs.forEach(b => b.classList.toggle("active", b === btn));
        dom.panels.forEach(p => p.classList.toggle("active", p.getAttribute("data-panel") === tab));
      });
    });
  }

  /********************
   * Wallet Connect (Swap-like)
   ********************/
  async function connectWallet(){
    // Mobile browser without injected -> deeplink to MetaMask
    if (isMobileUA() && !hasInjected()){
      setStatus("Mobile browser has no injected wallet.\nOpening in MetaMask…", "warn");
      location.href = mmDeepLink(location.href);
      return false;
    }

    if (!hasInjected()){
      setStatus("No wallet detected. Please install MetaMask or open in wallet in-app browser.", "warn");
      return false;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    // IMPORTANT: request accounts directly on click path
    try{
      await provider.send("eth_requestAccounts", []);
    }catch(err){
      setStatus("Connect cancelled/failed.\n" + (err?.message || err), "error");
      return false;
    }

    signer = provider.getSigner();
    account = await signer.getAddress();
    const net = await provider.getNetwork();
    chainId = Number(net.chainId);

    if (chainId !== CHAIN_ID_REQUIRED){
      setStatus(`Wrong network (chainId=${chainId}). Switching to Ethereum Mainnet…`, "warn");
      const ok = await ensureMainnet();
      if (!ok) return false;
      const net2 = await provider.getNetwork();
      chainId = Number(net2.chainId);
      if (chainId !== CHAIN_ID_REQUIRED){
        setStatus("Mainnet switch not completed. Please retry.", "warn");
        return false;
      }
    }

    setNetBadge("Connected · " + short(account));
    setStatus("Wallet connected.\nAccount: " + account, "ok");

    if (dom.btnConnect){
      dom.btnConnect.textContent = "Connected";
      dom.btnConnect.disabled = true;
    }

    // events (swap-like)
    if (!window.__GDEX_POOL_EVENTS_BOUND__){
      window.__GDEX_POOL_EVENTS_BOUND__ = true;

      window.ethereum.on?.("accountsChanged", (accs) => {
        const a = accs && accs[0] ? accs[0] : null;
        account = a;
        if (!a){
          setNetBadge("Not connected");
          if (dom.btnConnect){
            dom.btnConnect.textContent = "Connect Wallet";
            dom.btnConnect.disabled = false;
          }
          setStatus("Disconnected. Please connect again.", "warn");
          return;
        }
        setNetBadge("Connected · " + short(a));
        setStatus("Account changed.\n" + a, "ok");
        refresh().catch(()=>{});
      });

      window.ethereum.on?.("chainChanged", async () => {
        try{
          const net3 = await provider.getNetwork();
          chainId = Number(net3.chainId);
        }catch(e){}
        setStatus("Network changed.\nRefreshing…", "warn");
        if (chainId !== CHAIN_ID_REQUIRED){
          await ensureMainnet();
        }
        refresh().catch(()=>{});
      });
    }

    return true;
  }

  /********************
   * Core: Pair / LP / Reserves
   ********************/
  function getSelected(){
    const a = dom.tokenA?.value;
    const b = dom.tokenB?.value;
    if (!a || !b) throw new Error("Select Token A and Token B.");
    if (String(a).toLowerCase() === String(b).toLowerCase()) throw new Error("Token A and Token B must be different.");
    return { a, b };
  }

  async function findPairAddress(aSel, bSel){
    const aOn = resolveToOnchainAddress(aSel);
    const bOn = resolveToOnchainAddress(bSel);
    const f = getFactory(true);
    const pair = await f.getPair(aOn, bOn);
    return pair;
  }

  async function refresh(){
    try{
      const { a, b } = getSelected();
      setStatus("Refreshing pair info…", "");

      const pair = await findPairAddress(a, b);
      dom.pairAddr.textContent = (pair && pair !== ethers.constants.AddressZero) ? pair : "-";

      if (!pair || pair === ethers.constants.AddressZero){
        dom.lpBal.textContent = "-";
        dom.lpSupply.textContent = "-";
        dom.reserves.textContent = "-";
        dom.lpToRemove.value = "";
        setStatus("Pair not found. Click 'Create Pair' if it doesn't exist.", "warn");
        return;
      }

      // Pair info
      const p = pairContract(pair, true);
      const [t0, t1, reserves, totalSupply] = await Promise.all([
        p.token0(),
        p.token1(),
        p.getReserves(),
        p.totalSupply()
      ]);

      // Determine selected tokens meta/decimals
      const aOn = resolveToOnchainAddress(a);
      const bOn = resolveToOnchainAddress(b);

      const aMeta = (a === ETH_SENTINEL) ? tokenBySymbol.get("ETH") : getTokenMeta(aOn);
      const bMeta = (b === ETH_SENTINEL) ? tokenBySymbol.get("ETH") : getTokenMeta(bOn);

      const aDec = aMeta?.decimals ?? 18;
      const bDec = bMeta?.decimals ?? 18;

      // map reserves to selected order
      const r0 = ethers.BigNumber.from(reserves.reserve0);
      const r1 = ethers.BigNumber.from(reserves.reserve1);

      let resA, resB;
      if (String(t0).toLowerCase() === String(aOn).toLowerCase()){
        resA = r0; resB = r1;
      } else {
        resA = r1; resB = r0;
      }

      dom.lpSupply.textContent = bnToFloatStr(totalSupply, 18, 6);
      dom.reserves.textContent =
        `${bnToFloatStr(resA, aDec, 6)} ${aMeta?.symbol || "A"} / ${bnToFloatStr(resB, bDec, 6)} ${bMeta?.symbol || "B"}`;

      // User LP balance
      if (account){
        const bal = await p.balanceOf(account);
        dom.lpBal.textContent = bnToFloatStr(bal, 18, 6);
        // recompute lpToRemove based on pct
        computeLpToRemove(bal);
      } else {
        dom.lpBal.textContent = "-";
        dom.lpToRemove.value = "";
      }

      setStatus("Refreshed.", "ok");
    }catch(err){
      console.error(err);
      setStatus("Refresh error: " + (err?.message || err), "error");
    }
  }

  function computeLpToRemove(lpBalBn){
    try{
      const pct = Number(dom.removePct?.value || 100);
      if (!lpBalBn || !ethers.BigNumber.isBigNumber(lpBalBn)){
        dom.lpToRemove.value = "";
        return;
      }
      const remove = lpBalBn.mul(pct).div(100);
      dom.lpToRemove.value = bnToFloatStr(remove, 18, 8);
      dom.lpToRemove.dataset.bn = remove.toString();
    }catch(e){
      dom.lpToRemove.value = "";
    }
  }

  /********************
   * Actions
   ********************/
  async function createPair(){
    try{
      requireConnected();
      const { a, b } = getSelected();
      const aOn = resolveToOnchainAddress(a);
      const bOn = resolveToOnchainAddress(b);

      setStatus("Creating pair… (Factory)", "");
      const f = new ethers.Contract(SUSHI_FACTORY, ABI_FACTORY, signer);

      const tx = await f.createPair(aOn, bOn);
      setStatus("Tx sent: " + tx.hash + "\nWaiting…", "warn");
      await tx.wait();

      setStatus("Pair created. Refreshing…", "ok");
      await refresh();
    }catch(err){
      console.error(err);
      setStatus("Create Pair error: " + (err?.message || err), "error");
    }
  }

  async function approveToken(tokenAddrOrEth){
    try{
      requireConnected();
      if (tokenAddrOrEth === ETH_SENTINEL){
        setStatus("ETH does not require approval.", "ok");
        return;
      }
      const tokenAddr = normalizeTokenAddress(tokenAddrOrEth);
      const t = erc20(tokenAddr, false);

      const allowance = await t.allowance(account, SUSHI_ROUTER);
      if (allowance.gte(ethers.utils.parseUnits("1000000000", 18))){
        setStatus("Already approved.", "ok");
        return;
      }
      setStatus("Approving…", "");
      const tx = await t.approve(SUSHI_ROUTER, MAX_UINT);
      setStatus("Approve tx: " + tx.hash + "\nWaiting…", "warn");
      await tx.wait();
      setStatus("Approved.", "ok");
    }catch(err){
      console.error(err);
      setStatus("Approve error: " + (err?.message || err), "error");
    }
  }

  async function addLiquidity(){
    try{
      requireConnected();
      const { a, b } = getSelected();

      const amtA = (dom.amtA?.value || "").trim();
      const amtB = (dom.amtB?.value || "").trim();
      if (!amtA || !amtB) throw new Error("Enter both amounts.");

      const aMeta = (a === ETH_SENTINEL) ? tokenBySymbol.get("ETH") : getTokenMeta(resolveToOnchainAddress(a));
      const bMeta = (b === ETH_SENTINEL) ? tokenBySymbol.get("ETH") : getTokenMeta(resolveToOnchainAddress(b));
      const aDec = aMeta?.decimals ?? 18;
      const bDec = bMeta?.decimals ?? 18;

      const router = getRouter();
      const deadline = nowDeadline();

      // Slippage min: keep simple (0) to reduce reverts in early stage
      const minA = 0;
      const minB = 0;

      setStatus("Adding liquidity…", "");

      // ETH cases
      if (a === ETH_SENTINEL && b === ETH_SENTINEL) throw new Error("ETH/ETH is not valid.");

      if (a === ETH_SENTINEL || b === ETH_SENTINEL){
        const token = (a === ETH_SENTINEL) ? resolveToOnchainAddress(b) : resolveToOnchainAddress(a);
        const tokenAmt = (a === ETH_SENTINEL) ? ethers.utils.parseUnits(amtB, bDec) : ethers.utils.parseUnits(amtA, aDec);
        const ethAmt = (a === ETH_SENTINEL) ? ethers.utils.parseUnits(amtA, 18) : ethers.utils.parseUnits(amtB, 18);

        // Approve token only
        if (a === ETH_SENTINEL){
          await approveToken(b);
        }else{
          await approveToken(a);
        }

        const tx = await router.addLiquidityETH(
          token,
          tokenAmt,
          minA,
          minB,
          account,
          deadline,
          { value: ethAmt }
        );

        setStatus("Tx sent: " + tx.hash + "\nWaiting…", "warn");
        await tx.wait();
      } else {
        const aOn = resolveToOnchainAddress(a);
        const bOn = resolveToOnchainAddress(b);

        await approveToken(a);
        await approveToken(b);

        const aAmt = ethers.utils.parseUnits(amtA, aDec);
        const bAmt = ethers.utils.parseUnits(amtB, bDec);

        const tx = await router.addLiquidity(
          aOn, bOn,
          aAmt, bAmt,
          minA, minB,
          account,
          deadline
        );

        setStatus("Tx sent: " + tx.hash + "\nWaiting…", "warn");
        await tx.wait();
      }

      setStatus("Liquidity added. Refreshing…", "ok");
      await refresh();
    }catch(err){
      console.error(err);
      setStatus("Add Liquidity error: " + (err?.message || err), "error");
    }
  }

  async function approveLP(){
    try{
      requireConnected();
      const pair = dom.pairAddr?.textContent?.trim();
      if (!pair || pair === "-" ) throw new Error("Pair not found.");
      const p = pairContract(pair, false);
      setStatus("Approving LP…", "");
      const tx = await p.approve(SUSHI_ROUTER, MAX_UINT);
      setStatus("Approve LP tx: " + tx.hash + "\nWaiting…", "warn");
      await tx.wait();
      setStatus("LP approved.", "ok");
    }catch(err){
      console.error(err);
      setStatus("Approve LP error: " + (err?.message || err), "error");
    }
  }

  async function removeLiquidity(){
    try{
      requireConnected();
      const { a, b } = getSelected();

      const pair = dom.pairAddr?.textContent?.trim();
      if (!pair || pair === "-" ) throw new Error("Pair not found.");

      // determine LP amount to remove
      const lpBnStr = dom.lpToRemove?.dataset?.bn;
      if (!lpBnStr) throw new Error("No LP amount calculated.");
      const lpAmt = ethers.BigNumber.from(lpBnStr);
      if (lpAmt.lte(0)) throw new Error("LP to remove is zero.");

      const router = getRouter();
      const deadline = nowDeadline();

      setStatus("Removing liquidity…", "");

      const minA = 0;
      const minB = 0;

      if (a === ETH_SENTINEL || b === ETH_SENTINEL){
        const token = (a === ETH_SENTINEL) ? resolveToOnchainAddress(b) : resolveToOnchainAddress(a);
        await approveLP();

        const tx = await router.removeLiquidityETH(
          token,
          lpAmt,
          minA,
          minB,
          account,
          deadline
        );
        setStatus("Tx sent: " + tx.hash + "\nWaiting…", "warn");
        await tx.wait();
      } else {
        const aOn = resolveToOnchainAddress(a);
        const bOn = resolveToOnchainAddress(b);
        await approveLP();

        const tx = await router.removeLiquidity(
          aOn, bOn,
          lpAmt,
          minA, minB,
          account,
          deadline
        );
        setStatus("Tx sent: " + tx.hash + "\nWaiting…", "warn");
        await tx.wait();
      }

      setStatus("Liquidity removed. Refreshing…", "ok");
      await refresh();
    }catch(err){
      console.error(err);
      setStatus("Remove Liquidity error: " + (err?.message || err), "error");
    }
  }

  /********************
   * Bind events
   ********************/
  function bind(){
    if (dom.btnConnect){
      dom.btnConnect.addEventListener("click", async () => {
        const ok = await connectWallet();
        if (ok) refresh().catch(()=>{});
      });
    }

    if (dom.btnCreatePair) dom.btnCreatePair.addEventListener("click", () => createPair());
    if (dom.btnRefresh) dom.btnRefresh.addEventListener("click", () => refresh());

    if (dom.btnApproveA) dom.btnApproveA.addEventListener("click", async () => {
      const { a } = getSelected();
      await approveToken(a);
    });

    if (dom.btnApproveB) dom.btnApproveB.addEventListener("click", async () => {
      const { b } = getSelected();
      await approveToken(b);
    });

    if (dom.btnAdd) dom.btnAdd.addEventListener("click", () => addLiquidity());
    if (dom.btnApproveLP) dom.btnApproveLP.addEventListener("click", () => approveLP());
    if (dom.btnRemove) dom.btnRemove.addEventListener("click", () => removeLiquidity());

    // Token change => auto refresh (and fixes “My Positions” update)
    if (dom.tokenA) dom.tokenA.addEventListener("change", () => refresh().catch(()=>{}));
    if (dom.tokenB) dom.tokenB.addEventListener("change", () => refresh().catch(()=>{}));

    if (dom.removePct){
      dom.removePct.addEventListener("change", async () => {
        try{
          const pair = dom.pairAddr?.textContent?.trim();
          if (!pair || pair === "-" || !account) return;
          const p = pairContract(pair, true);
          const bal = await p.balanceOf(account);
          computeLpToRemove(bal);
        }catch(e){}
      });
    }
  }

  /********************
   * Boot
   ********************/
  function boot(){
    cacheDom();
    initTabs();
    fillCompatSelects();        // MUST be sync before dropdown init
    initCustomDropdowns();      // dropdown built from tokenList => icons match
    bind();

    setNetBadge("Not connected");
    setStatus("Ready.\nSelect tokens and connect wallet.", "");
    // initial refresh without account (reads pair if exists)
    refresh().catch(()=>{});
  }

  // Wait for ethers to exist
  if (typeof ethers === "undefined"){
    console.error("ethers not found");
    return;
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
