import React from 'react'

export default function LoginGlass() {
  return (
    <div className="min-h-screen bg-liquid-gradient grid place-items-center p-6">
      <div className="absolute inset-0 bg-[url('/images/bg/noise.svg')] opacity-40 pointer-events-none" />
      <div className="liquid-glass w-full max-w-sm p-6 relative">
        <h1 className="text-ink-900 text-xl font-semibold mb-4">Agent Ascend</h1>
        <form className="grid gap-3">
          <label className="text-sm text-ink-900/80">Email</label>
          <input type="email" className="liquid-stroke rounded-xl px-3 py-2 bg-white/60 focus:outline-none" placeholder="you@example.com" />
          <label className="text-sm text-ink-900/80 mt-2">Password</label>
          <input type="password" className="liquid-stroke rounded-xl px-3 py-2 bg-white/60 focus:outline-none" placeholder="••••••••" />
          <button type="submit" className="mt-4 px-4 py-2 rounded-xl text-white font-semibold"
            style={{ backgroundImage: "url('/images/ui/cta-bg.svg')", backgroundSize: "cover" }}>
            Log in
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <a className="text-ink-900/80 hover:underline" href="/create-account">Create account</a>
          <a className="text-ink-900/80 hover:underline" href="/forgot-password">Forgot password</a>
        </div>
      </div>
    </div>
  )
}