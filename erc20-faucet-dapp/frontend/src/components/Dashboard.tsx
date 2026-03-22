import { useEffect, useState, useMemo } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { formatEther } from 'ethers'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useReadContract } from '../hooks/contractHooks/useReadContract'
import { useWriteFunctions } from '../hooks/contractHooks/useWriteContract'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS

type TabType = 'faucet' | 'transfer' | 'mint'

export default function Dashboard() {
  const { address, isConnected } = useAppKitAccount()
  
  const [activeTab, setActiveTab] = useState<TabType>('faucet')  // Public Stats
  const [name, setName] = useState('Token')
  const [symbol, setSymbol] = useState('TKN')
  const [faucetAmount, setFaucetAmount] = useState<bigint | null>(null)
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null)
  const [maxSupply, setMaxSupply] = useState<bigint | null>(null)
  const [contractOwner, setContractOwner] = useState<string>('')
  
  // User Stats
  const [tokenBalance, setTokenBalance] = useState<bigint | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<bigint | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Forms
  const [toAddress, setToAddress] = useState('')
  const [amountStr, setAmountStr] = useState('')

  const { getPublicData, getUserData } = useReadContract()
  const { claimToken, transferToken, mintToken, isClaiming, isTransferring, isMinting } = useWriteFunctions()

  // To trigger re-fetches
  const [txCount, setTxCount] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getPublicData()
      if (data) {
        if (data.name) setName(data.name)
        if (data.symbol) setSymbol(data.symbol)
        if (data.faucetAmount !== null) setFaucetAmount(data.faucetAmount)
        if (data.totalSupply !== null) setTotalSupply(data.totalSupply)
        if (data.maxSupply !== null) setMaxSupply(data.maxSupply)
        if (data.owner) setContractOwner(data.owner)
      }
    }
    fetchStats()
  }, [getPublicData, txCount])

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getUserData()
      if (data) {
        if (data.tokenBalance !== null) setTokenBalance(data.tokenBalance)
        if (data.timeRemaining !== null) setTimeRemaining(data.timeRemaining)
      } else {
        setTokenBalance(null)
        setTimeRemaining(null)
      }
    }
    fetchUser()
  }, [getUserData, txCount, address])

  useEffect(() => {
    if (timeRemaining !== null) {
      setCountdown(Number(timeRemaining))
    } else {
      setCountdown(null)
    }
  }, [timeRemaining])

  useEffect(() => {
    if (countdown === null || countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(prev => (prev && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleClaim = async () => {
    const success = await claimToken();
    if (success) {
      toast.success('Successfully claimed tokens!');
      setTxCount(prev => prev + 1);
      setTimeRemaining(86400n);
    }
  }

  const handleTransfer = async () => {
    if (!toAddress || !amountStr) return toast.error('Address and amount are required')
    const success = await transferToken(amountStr, toAddress);
    if (success) {
      toast.success(`Successfully transferred ${amountStr} ${symbol}`);
      setTxCount(prev => prev + 1);
    }
  }

  const handleMint = async () => {
    if (!toAddress || !amountStr) return toast.error('Address and amount are required')
    const success = await mintToken(amountStr, toAddress);
    if (success) {
      toast.success(`Successfully minted ${amountStr} ${symbol}`);
      setTxCount(prev => prev + 1);
    }
  }

  const isOwner = useMemo(() => {
    if (!address || !contractOwner) return false
    return String(address).toLowerCase() === String(contractOwner).toLowerCase()
  }, [address, contractOwner])

  const fmtBalance = tokenBalance !== null ? formatEther(tokenBalance) : '0'
  const fmtFaucet = faucetAmount !== null ? formatEther(faucetAmount) : '10'
  const fmtMax = maxSupply !== null ? formatEther(maxSupply) : '...'
  const fmtTotal = totalSupply !== null ? formatEther(totalSupply) : '0'

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 relative z-10 transition-all">
      
      {/* 1. Global Token Statistics (Prominent) */}
      <div className="glass-card p-8 relative overflow-hidden">
        {/* Subtle background glow inside the stats card */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          {/* Left: Token Branding & Balance */}
          <div className="flex flex-col space-y-4 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-400">
              {name} ({symbol})
            </h2>
            <div className="inline-block px-4 py-2 mt-2 bg-slate-800/80 rounded-2xl border border-white/5 w-fit mx-auto md:mx-0 shadow-inner">
              <span className="text-slate-400 font-medium text-sm mr-2 uppercase tracking-wider">Your Balance:</span>
              <span className="text-2xl font-bold text-cyan-300">{fmtBalance}</span>
            </div>
            {countdown !== null && countdown > 0 ? (
              <div className="text-amber-400 font-medium bg-amber-500/10 px-4 py-2 rounded-xl text-sm border border-amber-500/20 w-fit mx-auto md:mx-0 animate-pulse">
                Next Claim: {
                  (() => {
                    const h = Math.floor(countdown / 3600);
                    const m = Math.floor((countdown % 3600) / 60);
                    if (h > 0) return `${h}h ${m}m`;
                    if (m > 0) return `${m}m`;
                    return `< 1m`;
                  })()
                } remaining
              </div>
            ) : isConnected && (
              <div className="text-emerald-400 font-medium bg-emerald-500/10 px-4 py-2 rounded-xl text-sm border border-emerald-500/20 w-fit mx-auto md:mx-0">
                Faucet is ready to claim
              </div>
            )}
          </div>
          
          {/* Right: Supply & Faucet Stats */}
          <div className="flex-1 w-full max-w-sm space-y-4">
            <div className="glass-panel p-5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Supply</span>
                <span className="text-lg font-bold text-white">{fmtTotal} <span className="text-slate-500 text-sm font-medium">{symbol}</span></span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-white/5 relative shadow-inner">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full absolute top-0 left-0 transition-all duration-1000 ease-out" 
                  style={{ width: `${maxSupply !== null && totalSupply !== null && maxSupply > 0n ? (parseFloat(fmtTotal) / parseFloat(fmtMax)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="glass-panel p-5 flex justify-between items-center">
               <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Max Supply</span>
               <span className="text-xl font-bold text-white bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 shadow-inner">{fmtMax} {symbol}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Action Interface (Dynamic Cards/Tabs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Operations */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex space-x-2 bg-slate-900/50 p-1.5 rounded-[20px] border border-white/5 shadow-inner">
            <button 
              onClick={() => setActiveTab('faucet')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'faucet' ? 'bg-gradient-to-r from-purple-600/80 to-cyan-600/80 shadow-lg text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Faucet
            </button>
            <button 
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'transfer' ? 'bg-gradient-to-r from-purple-600/80 to-cyan-600/80 shadow-lg text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Transfer
            </button>
            {isOwner && (
              <button 
                onClick={() => setActiveTab('mint')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'mint' ? 'bg-gradient-to-r from-purple-600/80 to-cyan-600/80 shadow-lg text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                Mint (Admin)
              </button>
            )}
          </div>

          <div className="min-h-[260px] flex flex-col justify-center">
            {!isConnected ? (
              <div className="text-center space-y-6">
                 <div className="w-20 h-20 mx-auto bg-slate-800 rounded-3xl border border-white/10 flex items-center justify-center rotate-3 shadow-2xl">
                    <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                 </div>
                 <p className="text-slate-400 font-medium px-4">Connect your Web3 Wallet to claim tokens or manage your portfolio.</p>
                 
                 <div className="flex justify-center"><appkit-button /></div>
              </div>
            ) : (
              <div className="space-y-6 w-full transition-all">
                {activeTab === 'faucet' && (
                  <div className="space-y-6 text-center">
                    <div className="glass-panel p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                       <h3 className="text-xl font-semibold text-slate-300 mb-2">Claim <span className="text-white bg-white/10 px-3 py-1 rounded-lg ml-2">{fmtFaucet} {symbol}</span></h3>
                       <p className="text-sm text-slate-500 mb-6 max-w-[240px] mx-auto">Tokens are sent instantly over the Sepolia Testnet.</p>
                        <button
                          onClick={handleClaim}
                          disabled={isClaiming || (countdown !== null && countdown > 0)}
                          className="w-full bg-white text-slate-950 font-black text-lg py-4 rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-wider"
                        >
                          {isClaiming ? 'Claiming...' : 'Claim Tokens'}
                       </button>
                    </div>
                  </div>
                )}

                {(activeTab === 'transfer' || activeTab === 'mint') && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">To Address</label>
                       <input 
                         type="text" 
                         className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-base placeholder-slate-600 shadow-inner"
                         placeholder="0x..."
                         value={toAddress}
                         onChange={(e) => setToAddress(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Amount</label>
                       <div className="relative">
                         <input 
                           type="number" 
                           className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-lg font-medium placeholder-slate-600 pr-20 shadow-inner"
                           placeholder="0.0"
                           value={amountStr}
                           onChange={(e) => setAmountStr(e.target.value)}
                         />
                         <div className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                           {symbol}
                         </div>
                       </div>
                    </div>
                    
                    <button
                      onClick={activeTab === 'transfer' ? handleTransfer : handleMint}
                      disabled={(activeTab === 'transfer' ? isTransferring : isMinting) || !toAddress || !amountStr}
                      className={`w-full font-black text-lg py-4 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-wider ${activeTab === 'transfer' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]'}`}
                    >
                      {activeTab === 'transfer' ? (isTransferring ? 'Transferring...' : 'Execute Transfer') : (isMinting ? 'Minting...' : 'Mint Tokens')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
 
        {/* Right Side: Network & Feedback */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-cyan-500/20 bg-gradient-to-br from-slate-900/60 to-cyan-900/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse mr-3 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
              Network Connected
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Blockchain</span>
                <span className="font-semibold text-white">Sepolia Testnet</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Contract</span>
                <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" className="font-mono text-cyan-400 hover:text-cyan-300 transition-colors">
                  {CONTRACT_ADDRESS ? `${CONTRACT_ADDRESS.slice(0,6)}...${CONTRACT_ADDRESS.slice(-4)}` : 'Loading...'}
                </a>
              </div>
            </div>
          </div>

          <ToastContainer position="bottom-right" theme="dark" />
        </div>
      </div>
    </div>
  )
}
