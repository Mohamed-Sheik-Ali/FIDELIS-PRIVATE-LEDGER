/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthView, User } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface AuthContainerProps {
  onAuthenticate: (user: User) => void;
}

export default function AuthContainer({ onAuthenticate }: AuthContainerProps) {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState<string>('m.smith@fintech.io');
  const [password, setPassword] = useState<string>('pass1234');
  const [name, setName] = useState<string>('Marcus Smith');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorWord, setErrorWord] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorWord('');
    setSuccessMsg('');

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorWord('Please enter a valid email address.');
      return;
    }

    if (password.length < 5) {
      setErrorWord('Password must be at least 5 characters.');
      return;
    }

    if (view === 'register' && !name.trim()) {
      setErrorWord('Please enter your full name.');
      return;
    }

    if (view === 'forgot') {
      setSuccessMsg('Reset code sent! Real email triggers require backend configuration.');
      return;
    }

    // Success Authentication
    const finalName = view === 'register' ? name : email.split('@')[0];
    onAuthenticate({
      email,
      name: finalName.charAt(0).toUpperCase() + finalName.slice(1),
      isAuthenticated: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-stretch md:flex-row animate-in fade-in duration-300">
      
      {/* LEFT COLUMN - Beautiful inputs (5 Cols size relative) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white dark:bg-slate-900 shadow-xl border-r border-slate-100 dark:border-slate-800">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-display font-extrabold text-xl shadow-lg shadow-emerald-500/20">
              F
            </div>
            <div>
              <span className="font-display font-black text-slate-900 dark:text-white leading-tight block">
                FIDELIS
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-400 tracking-wider">
                Personal Finance
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Form Body Context */}
        <div className="my-auto max-w-sm w-full mx-auto py-10">
          
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              {view === 'login' && 'Authorize Treasury'}
              {view === 'register' && 'Forge Account'}
              {view === 'forgot' && 'Reset Vault Password'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {view === 'login' && 'Authorize credentials to audit or modify your ledger ledger assets.'}
              {view === 'register' && 'Commence your path to structured liquid assets and wealth monitoring.'}
              {view === 'forgot' && 'Authenticate your registered email to receive vault security reset keys.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (For register layout only) */}
            {view === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 outline-none text-slate-900 dark:text-white rounded-xl text-xs font-semibold transition-all"
                    placeholder="e.g. Marcus Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                Secure Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 outline-none text-slate-900 dark:text-white rounded-xl text-xs font-semibold transition-all"
                  placeholder="m.smith@fintech.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field (Bypassed if forgot mode) */}
            {view !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                    Vault Key Password
                  </label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 outline-none text-slate-900 dark:text-white rounded-xl text-xs font-semibold transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Error messaging boxes */}
            {errorWord && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/25 border border-rose-100 dark:border-rose-900/35 rounded-xl text-rose-600 dark:text-rose-450 text-[11px]">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errorWord}</span>
              </div>
            )}

            {/* Success messaging boxes */}
            {successMsg && (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/35 rounded-xl text-emerald-600 dark:text-emerald-400 text-[11px]">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5 animate-bounce" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Main Submit action */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 cursor-pointer"
            >
              <span>
                {view === 'login' && 'Unlock Treasury'}
                {view === 'register' && 'Generate Account'}
                {view === 'forgot' && 'Reset Vault'}
              </span>
              <ArrowRight size={14} />
            </button>

          </form>

          {/* Quick Mock Bypass tip */}
          <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed text-center">
              💡 <strong>Quick Sandbox Bypass:</strong> Tap any button to enter with clean mockup reserves instantly. Credentials can be custom set!
            </p>
          </div>

          {/* Bottom views shifts */}
          <div className="mt-8 text-center text-xs">
            {view === 'login' && (
              <p className="text-slate-500 dark:text-slate-400">
                New to Fidelis?{' '}
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Configure an account
                </button>
              </p>
            )}
            {(view === 'register' || view === 'forgot') && (
              <p className="text-slate-500 dark:text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Authorize login credentials
                </button>
              </p>
            )}
          </div>

        </div>

        {/* Footer info line */}
        <div className="text-center md:text-left text-[10px] text-slate-400 uppercase tracking-widest font-semibold pt-6 border-t border-slate-100 dark:border-slate-800/60">
          © {new Date().getFullYear()} Fidelis Private Capital LLC. All Rights Reserved.
        </div>

      </div>

      {/* RIGHT COLUMN - Immersive Fintech Visual Banner (Desktop only) */}
      <div className="hidden lg:flex flex-1 bg-slate-950 dark:bg-black p-12 flex-col justify-between relative overflow-hidden text-white border-l border-slate-800/40">
        
        {/* Glow grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Top telemetry lines */}
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 tracking-widest">
          <span>PORTFOLIO SHIELDING ENGAGE</span>
          <span>EST. COLD VAULT LATENCY 0.1MS</span>
        </div>

        {/* Middle graphic showcase */}
        <div className="my-auto max-w-md space-y-9 relative z-10">
          
          {/* Mock Wealth Metrics card */}
          <div className="p-7 bg-slate-900/65 dark:bg-slate-950/60 border border-slate-800/70 backdrop-blur-md rounded-3xl shadow-2xl relative">
            <div className="absolute top-2.5 right-3 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-bold rounded-md tracking-wider border border-emerald-500/20 uppercase">
              Assets active
            </div>
            
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Estimated Liquid Net Worth</p>
            <h3 className="text-3xl font-display font-black text-white mt-1.5 tracking-tight">
              $142,508.64
            </h3>
            
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Avg Monthly Inflow</p>
                <p className="text-sm font-bold text-slate-200 mt-0.5">$6,450.00</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-slate-500">Savings Ratio</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">58.4% Outperform</p>
              </div>
            </div>

            {/* Custom SVG grid visualization */}
            <div className="mt-6 h-20 opacity-90 relative">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,80 Q20,30 40,60 T80,20 T100,10 L100,100 L0,100 Z" fill="url(#authCardGradient)" />
                <path d="M0,80 Q20,30 40,60 T80,20 T100,10" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="authCardGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-display font-black leading-snug">
              Achieve absolute capital clarity and compound growth.
            </h3>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Fidelis helps modern professionals design their long-term security by structuring everyday earnings, sub-budgets, and spending logs with robust offline analytics.
            </p>
          </div>

        </div>

        {/* Quotes list */}
        <div className="text-xs text-slate-500 font-medium">
          "The single greatest tool of capital protection is persistent oversight." – <span className="text-slate-350">Fidelis Advisors</span>
        </div>

      </div>

    </div>
  );
}
