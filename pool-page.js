(() => {
  "use strict";

  console.log("[POOL] pool-page.js loaded");

  /**********************
   * CONFIG (Mainnet)
   **********************/
  const CHAIN_ID_REQUIRED = 1;
  const ROUTER  = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
  const FACTORY = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
  const WETH    = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  const SLIPPAGE_BPS = 50;     // 0.5%
  const DEADLINE_MINUTES = 20;

  /**********************
   * TOKEN LIST (same)
   **********************/
  const tokenList = [
    {symbol:"ETH", name:"Ethereum", address:"ETH", decimals:18, logo:"https://assets.coingecko.com/coins/images/279/standard/ethereum.png"},
    {symbol:"GLIP", name:"GLIP Token", address:"0xD0b86b79AE4b8D7bb88b37EBe228ce343D79794e", decimals:18, logo:"https://cdn.imweb.me/thumbnail/20251023/7c2d51fa8c1bc.png"},
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

  /**********************
   * ABIs (V2 standard)
   **********************/
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
    "function allowance(address owner, address spender) external view returns (uint256)",
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

  /**********************
   * DOM helpers
   **********************/
  const el = (id) => document.getElementById(id);
  const dom = {
    tokenA: el("tokenA"),
    tokenB: el("tokenB"),
    pairAddr: el("pairAddr"),
    lpBal: el("lpBal"),
    lpSupply: el("lpSupply"),
    reserves: el("reserves"),
    netBadge: el("netBadge"),
    status: el("status"),

    btnConnect: el("btnConnect"),
    btnCreatePair: el("btnCreatePair"),
    btnRefresh: el("btnRefresh"),

    amtA: el("amtA"),
    amtB: el("amtB"),
    btnApproveA: el("btnApproveA"),
    btnApproveB: el("btnApproveB"),
    btnAdd: el("btnAdd"),

    removePct: el("removePct"),
    lpToRemove: el("lpToRemove"),
    btnApproveLP: el("btnApproveLP"),
    btnRemove: el("btnRemove")
  };

  /**********************
   * State
   **********************/
  let provider = null;
  let signer = null;
  let user = null;

  let factoryC = null;
  let routerC  = null;

  let currentPair = null;
  let currentPairC = null;

  let currentTokenA = null;
  let currentTokenB = null;

  const BN = ethers.BigNumber;

  /**********************
   * Utils
   **********************/
  function setStatus(msg, type=""){
    dom.status.textContent = msg;
    dom.status.setAttribute("data-type", type);
  }

  function setNet(text, ok=false){
    dom.netBadge.textContent = text;
    dom.netBadge.style.borderColor = ok ? "rgba(65,243,162,.55)" : "rgba(255,255,255,.20)";
  }

  function shortAddr(a){
    if (!a) return "-";
    return a.slice(0,6) + "…" + a.slice(-4);
  }

  function nowDeadline(){
    return Math.floor(Date.now()/1000) + DEADLINE_MINUTES*60;
  }

  function bpsMin(amountBN){
    return amountBN.mul(10000 - SLIPPAGE_BPS).div(10000);
  }

  function isETH(t){ return t && t.address === "ETH"; }
  function canonicalAddr(t){ return isETH(t) ? WETH : t.address; }

  function findToken(val){
    if (val === "ETH") return tokenList.find(x => x.address === "ETH");
    const v = (val || "").toLowerCase();
    return tokenList.find(x => (x.address || "").toLowerCase() === v) || null;
  }

  function parseAmt(str, decimals){
    const s = (str || "").trim();
    if (!s || s === "." || s === "-") return null;
    return ethers.utils.parseUnits(s, decimals);
  }

  function fmt(amountBN, decimals, maxFrac=6){
    const s = ethers.utils.formatUnits(amountBN, decimals);
    if (!s.includes(".")) return s;
    const [i,f] = s.split(".");
    return `${i}.${f.slice(0,maxFrac)}`;
  }

  function fillSelect(sel){
    sel.innerHTML = "";
    tokenList.forEach(t => {
      const o = document.createElement("option");
      o.value = t.address;
      o.textContent = `${t.symbol} — ${t.name}`;
      sel.appendChild(o);
    });
  }

  function setDefaultTokens(){
    const glip = tokenList.find(t => t.symbol === "GLIP");
    const eth  = tokenList.find(t => t.symbol === "ETH");
    if (glip) dom.tokenA.value = glip.address;
    if (eth)  dom.tokenB.value = eth.address;
  }

  function readTokens(){
    currentTokenA = findToken(dom.tokenA.value);
    currentTokenB = findToken(dom.tokenB.value);
  }

  function initReadOnlyContracts(){
    if (!window.ethereum) return;
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    factoryC = new ethers.Contract(FACTORY, ABI_FACTORY, provider);
    // router는 tx용이라 연결 후 signer로 생성
  }

  async function ensureConnected(){
    if (!provider || !signer || !user) throw new Error("Wallet not connected.");
    const net = await provider.getNetwork();
    if (net.chainId !== CHAIN_ID_REQUIRED){
      throw new Error("Wrong network. Please switch to Ethereum Mainnet.");
    }
  }

  /**********************
   * Tabs
   **********************/
  function setupTabs(){
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".panel");
    tabs.forEach(t => {
      t.addEventListener("click", () => {
        tabs.forEach(x => x.classList.remove("active"));
        t.classList.add("active");
        const key = t.getAttribute("data-tab");
        panels.forEach(p => p.classList.toggle("active", p.getAttribute("data-panel") === key));
      });
    });
  }

  /**********************
   * Refresh (requires provider, LP balance requires user)
   **********************/
  async function refresh(){
    try{
      if (!provider || !factoryC){
        setStatus("Wallet extension not detected. Install/enable MetaMask.", "error");
        return;
      }

      readTokens();
      if (!currentTokenA || !currentTokenB){
        setStatus("Select Token A / Token B.", "warn");
        return;
      }

      const a = canonicalAddr(currentTokenA).toLowerCase();
      const b = canonicalAddr(currentTokenB).toLowerCase();
      if (a === b){
        dom.pairAddr.textContent = "-";
        dom.lpBal.textContent = "-";
        dom.lpSupply.textContent = "-";
        dom.reserves.textContent = "-";
        setStatus("Token A and Token B cannot be the same.", "warn");
        return;
      }

      const pair = await factoryC.getPair(canonicalAddr(currentTokenA), canonicalAddr(currentTokenB));
      if (!pair || pair === ethers.constants.AddressZero){
        currentPair = null;
        currentPairC = null;
        dom.pairAddr.textContent = "-";
        dom.lpBal.textContent = "-";
        dom.lpSupply.textContent = "-";
        dom.reserves.textContent = "-";
        dom.lpToRemove.value = "";
        dom.lpToRemove.removeAttribute("data-raw");
        setStatus("Pair not found. You can create it (Factory) if needed.", "warn");
        return;
      }

      currentPair = pair;
      currentPairC = new ethers.Contract(currentPair, ABI_PAIR, provider);

      dom.pairAddr.textContent = currentPair;

      const [t0, t1] = await Promise.all([currentPairC.token0(), currentPairC.token1()]);
      const res = await currentPairC.getReserves();
      const totalSupply = await currentPairC.totalSupply();

      const aAddr = canonicalAddr(currentTokenA).toLowerCase();
      const bAddr = canonicalAddr(currentTokenB).toLowerCase();

      let reserveA, reserveB;
      if (aAddr === t0.toLowerCase() && bAddr === t1.toLowerCase()){
        reserveA = res.reserve0; reserveB = res.reserve1;
      } else if (aAddr === t1.toLowerCase() && bAddr === t0.toLowerCase()){
        reserveA = res.reserve1; reserveB = res.reserve0;
      } else {
        reserveA = res.reserve0; reserveB = res.reserve1;
      }

      dom.lpSupply.textContent = fmt(totalSupply, 18, 6);
      dom.reserves.textContent = `${fmt(reserveA, currentTokenA.decimals, 6)} / ${fmt(reserveB, currentTokenB.decimals, 6)}`;

      if (user){
        const bal = await currentPairC.balanceOf(user);
        dom.lpBal.textContent = fmt(bal, 18, 6);
        await recomputeLpToRemove();
      } else {
        dom.lpBal.textContent = "-";
      }

      setStatus("Refreshed.", "ok");
    }catch(err){
      console.error(err);
      setStatus(`Refresh error: ${err?.message || err}`, "error");
    }
  }

  async function recomputeLpToRemove(){
    if (!user || !currentPairC) {
      dom.lpToRemove.value = "";
      dom.lpToRemove.removeAttribute("data-raw");
      return;
    }
    const pct = parseInt(dom.removePct.value || "100", 10);
    const bal = await currentPairC.balanceOf(user);
    const toRemove = bal.mul(pct).div(100);
    dom.lpToRemove.value = fmt(toRemove, 18, 6);
    dom.lpToRemove.setAttribute("data-raw", toRemove.toString());
  }

  /**********************
   * Approvals
   **********************/
  async function ensureApprove(tokenAddr, amountBN){
    if (!tokenAddr || tokenAddr === "ETH") return;
    const tokenC = new ethers.Contract(tokenAddr, ABI_ERC20, signer);
    const allowance = await tokenC.allowance(user, ROUTER);
    if (allowance.gte(amountBN)) return;

    setStatus("Approve required. Sending approve…", "warn");
    const tx = await tokenC.approve(ROUTER, amountBN);
    setStatus(`Approve tx sent: ${tx.hash}`, "warn");
    await tx.wait();
    setStatus("Approve confirmed.", "ok");
  }

  /**********************
   * Actions
   **********************/
  async function doConnect(){
    try{
      if (!window.ethereum) throw new Error("No wallet found. Install/enable MetaMask.");
      provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);

      signer = provider.getSigner();
      user = await signer.getAddress();

      const net = await provider.getNetwork();
      if (net.chainId !== CHAIN_ID_REQUIRED){
        setNet("Wrong network", false);
        setStatus("Wrong network. Switch to Ethereum Mainnet.", "error");
      } else {
        setNet("Mainnet", true);
        setStatus(`Connected: ${user}`, "ok");
      }

      dom.btnConnect.textContent = `Connected: ${shortAddr(user)}`;

      factoryC = new ethers.Contract(FACTORY, ABI_FACTORY, provider);
      routerC  = new ethers.Contract(ROUTER, ABI_ROUTER, signer);

      await refresh();

      window.ethereum.on("accountsChanged", async (accs) => {
        if (!accs || !accs.length){
          user = null; signer = null;
          dom.btnConnect.textContent = "Connect Wallet";
          setNet("Not connected", false);
          setStatus("Disconnected.", "warn");
          await refresh();
          return;
        }
        user = accs[0];
        signer = provider.getSigner();
        dom.btnConnect.textContent = `Connected: ${shortAddr(user)}`;
        routerC = new ethers.Contract(ROUTER, ABI_ROUTER, signer);
        setStatus(`Account changed: ${user}`, "ok");
        await refresh();
      });

      window.ethereum.on("chainChanged", () => location.reload());
    }catch(err){
      console.error(err);
      setStatus(err?.message || String(err), "error");
    }
  }

  async function createPair(){
    try{
      await ensureConnected();
      readTokens();
      const a = canonicalAddr(currentTokenA);
      const b = canonicalAddr(currentTokenB);
      if (a.toLowerCase() === b.toLowerCase()) throw new Error("Tokens must be different.");

      setStatus("Sending createPair…", "warn");
      const fac = new ethers.Contract(FACTORY, ABI_FACTORY, signer);
      const tx = await fac.createPair(a,b);
      setStatus(`createPair tx sent: ${tx.hash}`, "warn");
      await tx.wait();
      setStatus("Pair created. Refreshing…", "ok");
      await refresh();
    }catch(err){
      console.error(err);
      setStatus(err?.message || String(err), "error");
    }
  }

  async function approveA(){
    try{
      await ensureConnected();
      readTokens();
      if (isETH(currentTokenA)) { setStatus("Token A is ETH. No approval needed.", "ok"); return; }
      const amt = parseAmt(dom.amtA.value, currentTokenA.decimals);
      if (!amt) throw new Error("Enter Amount Token A first.");
      await ensureApprove(currentTokenA.address, amt);
    }catch(err){ console.error(err); setStatus(err?.message || String(err), "error"); }
  }

  async function approveB(){
    try{
      await ensureConnected();
      readTokens();
      if (isETH(currentTokenB)) { setStatus("Token B is ETH. No approval needed.", "ok"); return; }
      const amt = parseAmt(dom.amtB.value, currentTokenB.decimals);
      if (!amt) throw new Error("Enter Amount Token B first.");
      await ensureApprove(currentTokenB.address, amt);
    }catch(err){ console.error(err); setStatus(err?.message || String(err), "error"); }
  }

  async function addLiquidity(){
    try{
      await ensureConnected();
      readTokens();

      const aIsEth = isETH(currentTokenA);
      const bIsEth = isETH(currentTokenB);
      if (aIsEth && bIsEth) throw new Error("ETH/ETH is not valid.");

      const deadline = nowDeadline();

      if (aIsEth || bIsEth){
        const token = aIsEth ? currentTokenB : currentTokenA;
        const tokenAmtStr = aIsEth ? dom.amtB.value : dom.amtA.value;
        const ethAmtStr   = aIsEth ? dom.amtA.value : dom.amtB.value;

        const amountTokenDesired = parseAmt(tokenAmtStr, token.decimals);
        const amountETHDesired   = parseAmt(ethAmtStr, 18);
        if (!amountTokenDesired || amountTokenDesired.lte(0)) throw new Error("Enter token amount.");
        if (!amountETHDesired || amountETHDesired.lte(0)) throw new Error("Enter ETH amount.");

        await ensureApprove(token.address, amountTokenDesired);

        const amountTokenMin = bpsMin(amountTokenDesired);
        const amountETHMin   = bpsMin(amountETHDesired);

        setStatus("Sending addLiquidityETH…", "warn");
        const tx = await routerC.addLiquidityETH(
          token.address,
          amountTokenDesired,
          amountTokenMin,
          amountETHMin,
          user,
          deadline,
          { value: amountETHDesired }
        );
        setStatus(`Tx sent: ${tx.hash}`, "warn");
        await tx.wait();
        setStatus("Liquidity added. Refreshing…", "ok");
        await refresh();
        return;
      }

      const amountADesired = parseAmt(dom.amtA.value, currentTokenA.decimals);
      const amountBDesired = parseAmt(dom.amtB.value, currentTokenB.decimals);
      if (!amountADesired || amountADesired.lte(0)) throw new Error("Enter Amount Token A.");
      if (!amountBDesired || amountBDesired.lte(0)) throw new Error("Enter Amount Token B.");

      await ensureApprove(currentTokenA.address, amountADesired);
      await ensureApprove(currentTokenB.address, amountBDesired);

      const amountAMin = bpsMin(amountADesired);
      const amountBMin = bpsMin(amountBDesired);

      setStatus("Sending addLiquidity…", "warn");
      const tx = await routerC.addLiquidity(
        currentTokenA.address,
        currentTokenB.address,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        user,
        deadline
      );
      setStatus(`Tx sent: ${tx.hash}`, "warn");
      await tx.wait();
      setStatus("Liquidity added. Refreshing…", "ok");
      await refresh();
    }catch(err){ console.error(err); setStatus(err?.message || String(err), "error"); }
  }

  async function approveLP(){
    try{
      await ensureConnected();
      if (!currentPairC) throw new Error("No pair. Refresh first.");
      const raw = dom.lpToRemove.getAttribute("data-raw");
      if (!raw) throw new Error("LP to Remove is empty. Choose % and Refresh.");
      const lpAmount = BN.from(raw);

      const allowance = await currentPairC.allowance(user, ROUTER);
      if (allowance.gte(lpAmount)){
        setStatus("LP already approved.", "ok");
        return;
      }

      setStatus("Approving LP token…", "warn");
      const tx = await currentPairC.connect(signer).approve(ROUTER, lpAmount);
      setStatus(`Approve LP tx sent: ${tx.hash}`, "warn");
      await tx.wait();
      setStatus("Approve LP confirmed.", "ok");
    }catch(err){ console.error(err); setStatus(err?.message || String(err), "error"); }
  }

  async function removeLiquidity(){
    try{
      await ensureConnected();
      readTokens();
      if (!currentPairC) throw new Error("No pair. Refresh first.");
      const raw = dom.lpToRemove.getAttribute("data-raw");
      if (!raw) throw new Error("LP to Remove is empty. Choose % and Refresh.");

      const liquidity = BN.from(raw);
      if (liquidity.lte(0)) throw new Error("LP to remove must be > 0.");

      const deadline = nowDeadline();

      const aIsEth = isETH(currentTokenA);
      const bIsEth = isETH(currentTokenB);

      // 실패 방지 위해 min=0
      const amountMin0 = BN.from(0);

      if (aIsEth || bIsEth){
        const token = aIsEth ? currentTokenB : currentTokenA;

        setStatus("Sending removeLiquidityETH…", "warn");
        const tx = await routerC.removeLiquidityETH(
          token.address,
          liquidity,
          amountMin0,
          amountMin0,
          user,
          deadline
        );
        setStatus(`Tx sent: ${tx.hash}`, "warn");
        await tx.wait();
        setStatus("Liquidity removed. Refreshing…", "ok");
        await refresh();
        return;
      }

      setStatus("Sending removeLiquidity…", "warn");
      const tx = await routerC.removeLiquidity(
        currentTokenA.address,
        currentTokenB.address,
        liquidity,
        amountMin0,
        amountMin0,
        user,
        deadline
      );
      setStatus(`Tx sent: ${tx.hash}`, "warn");
      await tx.wait();
      setStatus("Liquidity removed. Refreshing…", "ok");
      await refresh();
    }catch(err){ console.error(err); setStatus(err?.message || String(err), "error"); }
  }

  /**********************
   * Bind events (guaranteed)
   **********************/
  function bind(){
    if (!dom.btnConnect) {
      console.error("[POOL] btnConnect not found. Check IDs.");
      return;
    }

    dom.btnConnect.addEventListener("click", doConnect);
    dom.btnRefresh.addEventListener("click", refresh);
    dom.btnCreatePair.addEventListener("click", createPair);

    dom.tokenA.addEventListener("change", () => {
      setStatus("Token changed. Click Refresh (or Connect then Refresh).", "warn");
    });
    dom.tokenB.addEventListener("change", () => {
      setStatus("Token changed. Click Refresh (or Connect then Refresh).", "warn");
    });

    dom.btnApproveA.addEventListener("click", approveA);
    dom.btnApproveB.addEventListener("click", approveB);
    dom.btnAdd.addEventListener("click", addLiquidity);

    dom.removePct.addEventListener("change", recomputeLpToRemove);
    dom.btnApproveLP.addEventListener("click", approveLP);
    dom.btnRemove.addEventListener("click", removeLiquidity);

    console.log("[POOL] events bound");
  }

  function boot(){
    setupTabs();
    fillSelect(dom.tokenA);
    fillSelect(dom.tokenB);
    setDefaultTokens();
    setNet("Not connected", false);
    setStatus("Ready. Click Connect Wallet.", "");

    initReadOnlyContracts(); // read-only provider/factory 준비만
    bind();
  }

  boot();
})();
