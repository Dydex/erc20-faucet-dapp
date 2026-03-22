import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      
      {/* Modern Web3 Blurs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

      {/* Navbar overlaying background */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-md bg-slate-950/20 mb-8 rounded-b-[32px] shadow-lg shadow-black/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30 font-black text-xl text-white">
            <svg className="w-6 h-6 text-white mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            CritDAO
          </h1>
        </div>
        <div>
          {/* @ts-ignore */}
          <appkit-button />
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-start px-4 min-h-[calc(100vh-140px)] pb-24">
        <Dashboard />
      </main>
    </div>
  )
}
