/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { Shield, Key, RefreshCw, LogOut, Check, Save, User as UserIcon, Bell, CreditCard, Sparkles } from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onLogout: () => void;
  onResetDatabase: () => void;
}

export default function SettingsView({
  user,
  onUpdateUser,
  onLogout,
  onResetDatabase,
}: SettingsViewProps) {
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [showSavedMsg, setShowSavedMsg] = useState<boolean>(false);
  const [resetWarn, setResetWarn] = useState<boolean>(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onUpdateUser({
      ...user,
      name: name.trim(),
      email: email.trim(),
    });

    setShowSavedMsg(true);
    setTimeout(() => {
      setShowSavedMsg(false);
    }, 2800);
  };

  const triggerReset = () => {
    onResetDatabase();
    setResetWarn(false);
    window.location.reload(); // Refresh to boot default states from storage
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-350">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          System Preferences
        </h1>
        <p className="text-sm text-slate-550 dark:text-slate-400">
          Calibrate secure profile variables, limits, and developer debug states
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Span (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROFILE CONTROL */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-7 shadow-xs">
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon size={18} className="text-emerald-500" />
              <span>Personal Identity Profile</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure names and communication channels
            </p>

            <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-450 dark:text-slate-400 block mb-1.5">
                    First Name & Pseudonym
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-semibold text-slate-900 dark:text-white focus:border-emerald-500 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-450 dark:text-slate-400 block mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-semibold text-slate-900 dark:text-white focus:border-emerald-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Saved Success Note */}
              {showSavedMsg && (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl border border-emerald-100 dark:border-emerald-900/10">
                  <Check size={14} />
                  <span>Personal details refreshed in localized store!</span>
                </div>
              )}

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <Save size={14} />
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* SECURITY & DELEGATION CONTROLS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-7 shadow-xs">
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield size={18} className="text-indigo-500" />
              <span>Security Protocols</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audit offline protection triggers
            </p>

            <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800/80">
              
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Local Sandbox Mode</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400">Ledger data is shielded inside standard localized storage</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold uppercase rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  Active
                </span>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Multi-factor (MFA)</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400">Asks double checks upon unlocked transitions</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <span className="w-8 h-4.5 bg-slate-200 dark:bg-slate-800 rounded-full transition-colors relative flex items-center p-0.5">
                    <span className="w-3.5 h-3.5 bg-white rounded-full shadow-md transform translate-x-0 transition-transform" />
                  </span>
                </div>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly Summary Reports</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400">Auto compilation delivered straight to inbox</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <span className="w-8 h-4.5 bg-emerald-500 rounded-full transition-colors relative flex items-center p-0.5">
                    <span className="w-3.5 h-3.5 bg-white rounded-full shadow-md transform translate-x-3.5 transition-transform" />
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Span (1 Col) */}
        <div className="space-y-6">
          
          {/* PREMIUM UPGRADE PREVIEW */}
          <div className="bg-slate-905 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
            <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-[8px] font-bold tracking-widest rounded-md uppercase border border-emerald-500/20">
              Fidelis Premium
            </span>
            <h4 className="text-lg font-display font-bold mt-3 leading-tight">
              Unlock Multi-currency & Cloud Banking sync.
            </h4>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Connect real-time accounts utilizing secure Plaid integrations to bypass manual recording.
            </p>
            <button className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1">
              <Sparkles size={14} className="text-amber-400" />
              <span>Explore pricing models</span>
            </button>
          </div>

          {/* SYSTEM SANDBOX RECOVERY ACTIONS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Reset system data
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Running audits require stable metrics. Restore the complete default database to configure instant graph trends back to normal.
              </p>
            </div>

            {resetWarn ? (
              <div className="space-y-3 p-3 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/30 rounded-2xl">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-normal">
                  ⚠️ This action deletes custom changes in this browser. Reload compiles the preloaded 12 default entries.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={triggerReset}
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[10px] rounded-lg transition-colors cursor-pointer"
                  >
                    Yes, Reset It
                  </button>
                  <button
                    onClick={() => setResetWarn(false)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px] rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setResetWarn(true)}
                className="w-full py-2.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:bg-slate-800 dark:hover:bg-rose-950/20 dark:text-slate-300 dark:hover:text-rose-400 font-semibold text-xs border border-slate-200 dark:border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Reset Sandbox Database</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="w-full py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} className="text-slate-400" />
              <span>Lock Treasury Vault</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
