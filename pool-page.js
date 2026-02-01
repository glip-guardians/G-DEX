(() => {
  "use strict";

  /********************
   * Config
   ********************/
  const CHAIN_ID_REQUIRED = 1;

  // SushiSwap V2 (Ethereum Mainnet)
  const SUSHI_ROUTER  = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
  const SUSHI_FACTORY = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
  const WETH          = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const GLIP          = "0xD0b86b79AE4b8D7bb88b37EBe228ce343D79794e";

  const ETH_SENTINEL = "ETH";
  const DEADLINE_SEC = 60 * 20;
  const MAX_UINT = ethers.constants.MaxUint256;

  /********************
   * Token List (your list)
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
   * ABIs (V2 standard)
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
    "function decimals() external view returns (uint8)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 value) external returns (bool)"
  ];
  const ABI_ROUTER = [
    "function addLiquidity(address tokenA,address tokenB,uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline) external returns (uint amountA,uint amountB,uint liquidity)",
    "function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external payable returns (uint amountToken,uint amountETH,uint liquidity)",
    "function removeLiquidity(address tokenA,address tokenB,uint liquidity,uint amountAMin,uint amountBMin,address to,uint deadline) external returns (uint amountA,uint amountB)",
    "function removeLiquidityETH(address token,uint liquidity,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external returns (uint amountToken,uint amountETH)"
  ];

  /********************
   * DOM
   ********************/
  const dom = {};
  function $(id){ return document.getElementById(id); }
  function cacheDom(){
    dom.btnConnect = $("btnConnect");
    dom.netBadge = $("netBadge");

    dom.tokenA = $("tokenA");
    dom.tokenB = $("tokenB");

    dom.pairAddr = $("pairAddr");
    dom.lpBal = $("lpBal");
    dom.lpSupply = $("lpSupply");
    dom.reserves = $("reserves");

    dom.btnCreatePair = $("btnCreatePair");
    dom.btnRefresh = $("btnRefresh");

    dom.amtA = $("amtA");
    dom.amtB = $("amtB");
    dom.btnApproveA = $("btnApproveA");
    dom.btnApproveB = $("btnApproveB");
    dom.btnAdd = $("btnAdd");

    dom.removePct = $("removePct");
    dom.lpToRemove = $("lpToRemove");
    dom.btnApproveLP = $("btnApproveLP");
    dom.btnRemove = $("btnRemove");

    dom.status = $("status");
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
  function setNetBadge(text){ if (dom.netBadge) dom.netBadge.textContent = text || ""; }
  function short(a){ return a ? a.slice(0,6) + "…" + a.slice(-4) : ""; }
  function isMobile(){ return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent); }
  function hasInjected(){ return !!(window.ethereum && typeof window.ethereum.request === "function"); }
  function mmDeepLink(urlFull){
    const noProto = (urlFull || location.href).replace(/^https?:\/\//, "");
    return `https://metamask.app.link/dapp/${noProto}`;
  }
  function deadline(){ return Math.floor(Date.now()/1000) + DEADLINE_SEC; }
  function fmtUnits(bn, dec, p=6){
    const s = ethers.utils.formatUnits(bn, dec);
    const [i, f=""] = s.split(".");
    if (!f) return i;
    return i + "." + f.slice(0,p).replace(/0+$/,"");
  }

  /********************
   * Token maps
   ********************/
  const byAddr = new Map();
  const bySym = new Map();
  tokenList.forEach(t => {
    bySym.set(t.symbol, t);
    if (t.address !== ETH_SENTINEL) byAddr.set(t.address.toLowerCase(), t);
  });

  function resolveOnchain(addrOrEth){
    if (addrOrEth === ETH_SENTINEL) return WETH;
    return ethers.utils.getAddress(addrOrEth);
  }
  function tokenMeta(addrOrEth){
    if (addrOrEth === ETH_SENTINEL) return bySym.get("ETH");
    const k = String(addrOrEth).toLowerCase();
    return byAddr.get(k);
  }

  /********************
   * Fill selects (compat)
   ********************/
  function fillSelects(){
    const opts = tokenList.map(t => `<option value="${t.address}">${t.symbol} — ${t.name}</option>`).join("");
    dom.tokenA.innerHTML = opts;
    dom.tokenB.innerHTML = opts;

    dom.tokenA.value = GLIP;
    dom.tokenB.value = ETH_SENTINEL;
  }

  /********************
   * ✅ Custom Dropdown: auto-wrap existing <select> (NO HTML changes)
   ********************/
  function injectDropdownStylesOnce(){
    if (document.getElementById("gdex-dd-style")) return;
    const st = document.createElement("style");
    st.id = "gdex-dd-style";
    st.textContent = `
      .gdex-dd-wrap{ position:relative; width:100%; }
      .gdex-dd-select{ display:none !important; } /* hide native select */

      .gdex-dd-trigger{
        display:flex; align-items:center; justify-content:space-between;
        gap:10px;
        width:100%;
        padding:12px 12px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.16);
        background: rgba(255,255,255,.06);
        color: rgba(255,255,255,.92);
        font-weight:800;
        cursor:pointer;
        user-select:none;
        -webkit-tap-highlight-color: transparent;
      }
      .gdex-dd-left{ display:flex; align-items:center; gap:10px; min-width:0; }
      .gdex-dd-left img{ width:22px; height:22px; border-radius:999px; object-fit:cover; flex:0 0 auto; }
      .gdex-dd-text{ display:flex; flex-direction:column; min-width:0; }
      .gdex-dd-sym{ font-weight:900; line-height:1.1; }
      .gdex-dd-name{ font-size:12px; color: rgba(255,255,255,.72); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:220px; }
      .gdex-dd-caret{ opacity:.9; font-weight:900; }

      .gdex-dd-overlay{
        position:fixed; inset:0;
        background: rgba(0,0,0,.55);
        backdrop-filter: blur(6px);
        z-index: 9998;
        display:none;
      }
      .gdex-dd-overlay.open{ display:block; }

      .gdex-dd-menu{
        position:absolute;
        left:0; right:0;
        top: calc(100% + 8px);
        background: rgba(8,14,18,.96);
        border:1px solid rgba(255,255,255,.14);
        border-radius:16px;
        box-shadow: 0 18px 60px rgba(0,0,0,.55);
        z-index: 9999;
        display:none;
        overflow:hidden;
      }
      .gdex-dd-menu.open{ display:block; }

      .gdex-dd-search{
        width:100%;
        border:0;
        outline:none;
        padding:12px 12px;
        color: rgba(255,255,255,.92);
        background: rgba(255,255,255,.06);
        border-bottom:1px solid rgba(255,255,255,.12);
        font-weight:800;
      }
      .gdex-dd-list{
        max-height: 280px;
        overflow-y:auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        touch-action: pan-y;
      }
      .gdex-dd-item{
        display:flex; align-items:center; justify-content:space-between;
        gap:10px;
        padding:10px 12px;
        cursor:pointer;
      }
      .gdex-dd-item:hover{ background: rgba(65,243,162,.10); }
      .gdex-dd-item.active{ background: rgba(65,243,162,.16); }
      .gdex-dd-item .l{ display:flex; align-items:center; gap:10px; min-width:0; }
      .gdex-dd-item img{ width:22px; height:22px; border-radius:999px; object-fit:cover; }
      .gdex-dd-item .t{ display:flex; flex-direction:column; min-width:0; }
      .gdex-dd-item .t .sym{ font-weight:900; color: rgba(255,255,255,.92); line-height:1.1; }
      .gdex-dd-item .t .name{ font-size:12px; color: rgba(255,255,255,.70); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:220px; }
      .gdex-dd-tag{ font-size:12px; font-weight:900; color: rgba(255,255,255,.82); opacity:.9; }
    `;
    document.head.appendChild(st);
  }

  function buildDropdownForSelect(selectEl){
    injectDropdownStylesOnce();

    // wrapper
    const wrap = document.createElement("div");
    wrap.className = "gdex-dd-wrap";

    // overlay (singleton)
    let overlay = document.querySelector(".gdex-dd-overlay");
    if (!overlay){
      overlay = document.createElement("div");
      overlay.className = "gdex-dd-overlay";
      document.body.appendChild(overlay);
    }

    // trigger
    const trigger = document.createElement("div");
    trigger.className = "gdex-dd-trigger";
    trigger.setAttribute("role","button");
    trigger.setAttribute("tabindex","0");
    trigger.innerHTML = `
      <div class="gdex-dd-left">
        <img class="gdex-dd-logo" alt="">
        <div class="gdex-dd-text">
          <div class="gdex-dd-sym">-</div>
          <div class="gdex-dd-name">Select token</div>
        </div>
      </div>
      <div class="gdex-dd-caret">▾</div>
    `;

    // menu
    const menu = document.createElement("div");
    menu.className = "gdex-dd-menu";
    menu.innerHTML = `
      <input class="gdex-dd-search" placeholder="Search token…" />
      <div class="gdex-dd-list" role="listbox"></div>
    `;

    // hide select (keep for logic)
    selectEl.classList.add("gdex-dd-select");

    // place elements
    const parent = selectEl.parentNode;
    parent.insertBefore(wrap, selectEl);
    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    wrap.appendChild(selectEl);

    const logo = trigger.querySelector(".gdex-dd-logo");
    const sym  = trigger.querySelector(".gdex-dd-sym");
    const name = trigger.querySelector(".gdex-dd-name");
    const search = menu.querySelector(".gdex-dd-search");
    const list = menu.querySelector(".gdex-dd-list");

    function close(){
      menu.classList.remove("open");
      overlay.classList.remove("open");
      trigger.setAttribute("aria-expanded","false");
    }
    function open(){
      menu.classList.add("open");
      overlay.classList.add("open");
      trigger.setAttribute("aria-expanded","true");
      search.value = "";
      render("");
      setTimeout(()=>search.focus(), 0);
    }

    function setSelectedFromValue(){
      const v = selectEl.value;
      const m = tokenMeta(v) || (v === ETH_SENTINEL ? bySym.get("ETH") : null) || tokenList[0];
      if (m){
        logo.src = m.logo || "";
        sym.textContent = m.symbol || "-";
        name.textContent = m.name || "Select token";
      }
    }

    function render(filter){
      const f = (filter || "").trim().toLowerCase();
      list.innerHTML = "";

      const current = String(selectEl.value).toLowerCase();
      const arr = tokenList.filter(t => {
        if (!f) return true;
        return (t.symbol||"").toLowerCase().includes(f) || (t.name||"").toLowerCase().includes(f);
      });

      arr.forEach(t => {
        const item = document.createElement("div");
        item.className = "gdex-dd-item" + (String(t.address).toLowerCase() === current ? " active" : "");
        item.innerHTML = `
          <div class="l">
            <img alt="" src="${t.logo || ""}">
            <div class="t">
              <div class="sym">${t.symbol}</div>
              <div class="name">${t.name}</div>
            </div>
          </div>
          <div class="gdex-dd-tag">${t.symbol}</div>
        `;

        item.addEventListener("click", () => {
          selectEl.value = t.address;
          selectEl.dispatchEvent(new Event("change", { bubbles:true }));
          setSelectedFromValue();
          close();
        });

        list.appendChild(item);
      });

      if (!list.children.length){
        const empty = document.createElement("div");
        empty.style.padding = "12px";
        empty.style.color = "rgba(255,255,255,.78)";
        empty.style.fontWeight = "800";
        empty.textContent = "No results.";
        list.appendChild(empty);
      }

      // touch scroll safe
      list.addEventListener("touchstart", e => e.stopPropagation(), {passive:true});
      list.addEventListener("touchmove",  e => e.stopPropagation(), {passive:true});
    }

    // events
    overlay.addEventListener("click", close);
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (menu.classList.contains("open")) close();
      else open();
    });
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger.click(); }
      if (e.key === "Escape") close();
    });

    search.addEventListener("input", () => render(search.value));

    // sync when changed by code
    selectEl.addEventListener("change", () => setSelectedFromValue());

    // initial
    setSelectedFromValue();

    return { close, open };
  }

  function initDropdowns(){
    // IMPORTANT: must exist
    if (!dom.tokenA || !dom.tokenB) return;

    // build UI wrappers around existing selects
    buildDropdownForSelect(dom.tokenA);
    buildDropdownForSelect(dom.tokenB);
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
   * Wallet (swap-like)
   ********************/
  let provider=null, signer=null, account=null, chainId=null;

  async function ensureMainnet(){
    try{
      await window.ethereum.request({ method:"wallet_switchEthereumChain", params:[{ chainId:"0x1" }]});
      return true;
    }catch(_){
      setStatus("Please switch to Ethereum Mainnet in your wallet.", "warn");
      return false;
    }
  }

  async function connectWallet(){
    if (isMobile() && !hasInjected()){
      setStatus("No injected wallet on this mobile browser.\nOpening in MetaMask…", "warn");
      location.href = mmDeepLink(location.href);
      return false;
    }
    if (!hasInjected()){
      setStatus("No wallet detected. Install MetaMask or open in a wallet in-app browser.", "warn");
      return false;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    try{
      await provider.send("eth_requestAccounts", []);
    }catch(err){
      setStatus("Connect cancelled/failed.\n" + (err?.message || err), "error");
      return false;
    }

    signer = provider.getSigner();
    account = await signer.getAddress();
    chainId = Number((await provider.getNetwork()).chainId);

    if (chainId !== CHAIN_ID_REQUIRED){
      setStatus(`Wrong network (chainId=${chainId}). Switching to Mainnet…`, "warn");
      const ok = await ensureMainnet();
      if (!ok) return false;
      chainId = Number((await provider.getNetwork()).chainId);
      if (chainId !== CHAIN_ID_REQUIRED){
        setStatus("Mainnet switch not completed. Please retry.", "warn");
        return false;
      }
    }

    setNetBadge("Connected · " + short(account));
    setStatus("Wallet connected.\n" + account, "ok");

    if (dom.btnConnect){
      dom.btnConnect.textContent = "Connected";
      dom.btnConnect.disabled = true;
    }

    if (!window.__GDEX_POOL_EVENTS__){
      window.__GDEX_POOL_EVENTS__ = true;

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
        setStatus("Network changed.\nRefreshing…", "warn");
        try{
          chainId = Number((await provider.getNetwork()).chainId);
        }catch(_){}
        if (chainId !== CHAIN_ID_REQUIRED) await ensureMainnet();
        refresh().catch(()=>{});
      });
    }

    return true;
  }

  function requireConnected(){
    if (!signer || !account) throw new Error("Connect wallet first.");
  }

  /********************
   * Contracts
   ********************/
  function factory(readOnly=false){
    const p = readOnly ? provider : signer;
    return new ethers.Contract(SUSHI_FACTORY, ABI_FACTORY, p);
  }
  function router(){
    return new ethers.Contract(SUSHI_ROUTER, ABI_ROUTER, signer);
  }
  function erc20(addr){
    return new ethers.Contract(addr, ABI_ERC20, signer);
  }
  function pairAt(addr, readOnly=false){
    const p = readOnly ? provider : signer;
    return new ethers.Contract(addr, ABI_PAIR, p);
  }

  /********************
   * Core logic
   ********************/
  function getSelected(){
    const a = dom.tokenA.value;
    const b = dom.tokenB.value;
    if (!a || !b) throw new Error("Select Token A and Token B.");
    if (String(a).toLowerCase() === String(b).toLowerCase()) throw new Error("Token A and Token B must be different.");
    return { a, b };
  }

  async function getPairAddress(aSel,bSel){
    const aOn = resolveOnchain(aSel);
    const bOn = resolveOnchain(bSel);
    return await factory(true).getPair(aOn, bOn);
  }

  function computeLpToRemove(lpBalBn){
    try{
      const pct = Number(dom.removePct.value || 100);
      const remove = lpBalBn.mul(pct).div(100);
      dom.lpToRemove.value = fmtUnits(remove, 18, 8);
      dom.lpToRemove.dataset.bn = remove.toString();
    }catch(_){
      dom.lpToRemove.value = "";
      dom.lpToRemove.dataset.bn = "";
    }
  }

  async function refresh(){
    try{
      setStatus("Refreshing…", "");
      const { a, b } = getSelected();
      const pair = await getPairAddress(a,b);

      if (!pair || pair === ethers.constants.AddressZero){
        dom.pairAddr.textContent = "-";
        dom.lpBal.textContent = "-";
        dom.lpSupply.textContent = "-";
        dom.reserves.textContent = "-";
        dom.lpToRemove.value = "";
        setStatus("Pair not found. Create Pair if it doesn't exist.", "warn");
        return;
      }

      dom.pairAddr.textContent = pair;

      const p = pairAt(pair, true);
      const [t0, reserves, totalSupply] = await Promise.all([
        p.token0(),
        p.getReserves(),
        p.totalSupply()
      ]);

      const aOn = resolveOnchain(a);
      const bOn = resolveOnchain(b);

      const aMeta = tokenMeta(a) || {symbol:"A", decimals:18};
      const bMeta = tokenMeta(b) || {symbol:"B", decimals:18};

      const r0 = ethers.BigNumber.from(reserves.reserve0);
      const r1 = ethers.BigNumber.from(reserves.reserve1);

      const [resA,resB] =
        String(t0).toLowerCase() === String(aOn).toLowerCase() ? [r0,r1] : [r1,r0];

      dom.lpSupply.textContent = fmtUnits(totalSupply, 18, 6);
      dom.reserves.textContent = `${fmtUnits(resA, aMeta.decimals ?? 18, 6)} ${aMeta.symbol} / ${fmtUnits(resB, bMeta.decimals ?? 18, 6)} ${bMeta.symbol}`;

      if (account){
        const bal = await p.balanceOf(account);
        dom.lpBal.textContent = fmtUnits(bal, 18, 6);
        computeLpToRemove(bal);
      }else{
        dom.lpBal.textContent = "-";
        dom.lpToRemove.value = "";
      }

      setStatus("Refreshed.", "ok");
    }catch(err){
      console.error(err);
      setStatus("Refresh error: " + (err?.message || err), "error");
    }
  }

  async function createPair(){
    try{
      requireConnected();
      const { a,b } = getSelected();
      const aOn = resolveOnchain(a);
      const bOn = resolveOnchain(b);
      setStatus("Creating pair…", "");
      const tx = await factory(false).createPair(aOn,bOn);
      setStatus("Tx sent: " + tx.hash + "\nWaiting…", "warn");
      await tx.wait();
      setStatus("Pair created. Refreshing…", "ok");
      await refresh();
    }catch(err){
      console.error(err);
      setStatus("Create Pair error: " + (err?.message || err), "error");
    }
  }

  async function approveToken(addrOrEth){
    try{
      requireConnected();
      if (addrOrEth === ETH_SENTINEL){
        setStatus("ETH does not require approval.", "ok");
        return;
      }
      const tokenAddr = ethers.utils.getAddress(addrOrEth);
      const t = erc20(tokenAddr);
      const allowance = await t.allowance(account, SUSHI_ROUTER);
      if (allowance.gt(0)){
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
      const { a,b } = getSelected();
      const amtA = (dom.amtA.value || "").trim();
      const amtB = (dom.amtB.value || "").trim();
      if (!amtA || !amtB) throw new Error("Enter both amounts.");

      const aMeta = tokenMeta(a) || {decimals:18};
      const bMeta = tokenMeta(b) || {decimals:18};

      const dl = deadline();
      const r = router();

      setStatus("Adding liquidity…", "");

      if (a === ETH_SENTINEL || b === ETH_SENTINEL){
        const token = (a === ETH_SENTINEL) ? resolveOnchain(b) : resolveOnchain(a);
        const tokenAmt = (a === ETH_SENTINEL)
          ? ethers.utils.parseUnits(amtB, bMeta.decimals ?? 18)
          : ethers.utils.parseUnits(amtA, aMeta.decimals ?? 18);
        const ethAmt = (a === ETH_SENTINEL)
          ? ethers.utils.parseUnits(amtA, 18)
          : ethers.utils.parseUnits(amtB, 18);

        if (a === ETH_SENTINEL) await approveToken(b);
        else await approveToken(a);

        const tx = await r.addLiquidityETH(
          token, tokenAmt, 0, 0, account, dl,
          { value: ethAmt }
        );
        setStatus("Tx sent: " + tx.hash + "\nWaiting…", "warn");
        await tx.wait();
      } else {
        await approveToken(a);
        await approveToken(b);

        const aOn = resolveOnchain(a);
        const bOn = resolveOnchain(b);

        const aAmt = ethers.utils.parseUnits(amtA, aMeta.decimals ?? 18);
        const bAmt = ethers.utils.parseUnits(amtB, bMeta.decimals ?? 18);

        const tx = await r.addLiquidity(aOn,bOn,aAmt,bAmt,0,0,account,dl);
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
      const pair = (dom.pairAddr.textContent || "").trim();
      if (!pair || pair === "-") throw new Error("Pair not found.");
      setStatus("Approving LP…", "");
      const tx = await pairAt(pair, false).approve(SUSHI_ROUTER, MAX_UINT);
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
      const { a,b } = getSelected();
      const pair = (dom.pairAddr.textContent || "").trim();
      if (!pair || pair === "-") throw new Error("Pair not found.");

      const bnStr = dom.lpToRemove.dataset.bn;
      if (!bnStr) throw new Error("LP to remove not calculated.");
      const lpAmt = ethers.BigNumber.from(bnStr);
      if (lpAmt.lte(0)) throw new Error("LP to remove is zero.");

      const r = router();
      const dl = deadline();

      setStatus("Removing liquidity…", "");
      await approveLP();

      if (a === ETH_SENTINEL || b === ETH_SENTINEL){
        const token = (a === ETH_SENTINEL) ? resolveOnchain(b) : resolveOnchain(a);
        const tx = await r.removeLiquidityETH(token, lpAmt, 0, 0, account, dl);
        setStatus("Tx sent: " + tx.hash + "\nWaiting…", "warn");
        await tx.wait();
      }else{
        const aOn = resolveOnchain(a);
        const bOn = resolveOnchain(b);
        const tx = await r.removeLiquidity(aOn,bOn,lpAmt,0,0,account,dl);
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
   * Bind
   ********************/
  function initTabsUI(){
    dom.tabs.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        dom.tabs.forEach(b => b.classList.toggle("active", b === btn));
        dom.panels.forEach(p => p.classList.toggle("active", p.getAttribute("data-panel") === tab));
      });
    });
  }

  function bind(){
    dom.btnConnect?.addEventListener("click", async () => {
      const ok = await connectWallet();
      if (ok) refresh().catch(()=>{});
    });

    dom.btnCreatePair?.addEventListener("click", createPair);
    dom.btnRefresh?.addEventListener("click", () => refresh());

    dom.btnApproveA?.addEventListener("click", async () => {
      const { a } = getSelected(); await approveToken(a);
    });
    dom.btnApproveB?.addEventListener("click", async () => {
      const { b } = getSelected(); await approveToken(b);
    });
    dom.btnAdd?.addEventListener("click", addLiquidity);

    dom.btnApproveLP?.addEventListener("click", approveLP);
    dom.btnRemove?.addEventListener("click", removeLiquidity);

    dom.tokenA?.addEventListener("change", () => refresh().catch(()=>{}));
    dom.tokenB?.addEventListener("change", () => refresh().catch(()=>{}));

    dom.removePct?.addEventListener("change", async () => {
      try{
        const pair = (dom.pairAddr.textContent || "").trim();
        if (!pair || pair === "-" || !account) return;
        const bal = await pairAt(pair, true).balanceOf(account);
        computeLpToRemove(bal);
      }catch(_){}
    });
  }

  /********************
   * Boot
   ********************/
  function boot(){
    cacheDom();
    initTabsUI();

    if (!dom.tokenA || !dom.tokenB){
      setStatus("tokenA/tokenB select not found in HTML.", "error");
      return;
    }

    fillSelects();
    initDropdowns(); // ✅ auto-wrap select => click works now

    bind();
    setNetBadge("Not connected");
    setStatus("Ready.\nSelect tokens and connect wallet.", "");

    refresh().catch(()=>{});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
