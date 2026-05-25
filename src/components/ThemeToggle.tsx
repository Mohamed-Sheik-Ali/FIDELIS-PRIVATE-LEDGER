/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Moon } from 'lucide-react';

export default function ThemeToggle() {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('fin_theme', 'dark');
  }, []);

  return (
    <div
      className="p-2 md:p-2.5 rounded-xl border border-slate-800 text-emerald-400 bg-slate-900 flex items-center justify-center relative select-none"
      title="Private Vault locked to Premium Dark Mode"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Moon size={18} className="text-emerald-400" />
      </div>
    </div>
  );
}
