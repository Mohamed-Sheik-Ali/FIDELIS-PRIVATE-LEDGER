/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Transaction, Category, ViewType } from '../types';
import LucideIcon from './LucideIcon';
import { Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, DollarSign, Wallet, ArrowRight, Activity, Calendar } from 'lucide-react';

interface DashboardViewProps {
  transactions: Transaction[];
  categories: Category[];
  onNavigate: (view: ViewType) => void;
  onOpenQuickAdd: () => void;
  userName: string;
}

export default function DashboardView({
  transactions,
  categories,
  onNavigate,
  onOpenQuickAdd,
  userName,
}: DashboardViewProps) {
  const [activeDonutIdx, setActiveDonutIdx] = useState<number | null>(null);

  // Math totals calculation
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Group Expenses by Category
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const expenseByCategory = expenseTransactions.reduce((acc: Record<string, number>, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {});

  const categorySlices = Object.entries(expenseByCategory)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Other',
        amount,
        color: cat?.color || 'zinc',
        icon: cat?.icon || 'Sparkles',
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // SVG Donut metrics
  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  // Mini Chart data calculation for trend sparkline (simulated date distribution)
  const sortedByDate = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const trendPoints = sortedByDate.slice(-8).map((t, idx) => ({
    x: (idx / 7) * 100,
    y: t.type === 'income' ? 50 - (t.amount / 3000) * 30 : 50 + (t.amount / 3000) * 30,
  }));

  const trendPath = trendPoints.length > 0
    ? `M ${trendPoints[0].x} ${trendPoints[0].y} ` + trendPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : '';

  // Tailwind category colors map to SVGs matching
  const getColorHex = (tailwindColor: string) => {
    const map: Record<string, string> = {
      emerald: '#10b981',
      teal: '#14b8a6',
      cyan: '#06b6d4',
      blue: '#3b82f6',
      indigo: '#6366f1',
      purple: '#a855f7',
      violet: '#8b5cf6',
      pink: '#ec4899',
      rose: '#f43f5e',
      red: '#ef4444',
      orange: '#f97316',
      amber: '#f59e0b',
    };
    return map[tailwindColor] || '#71717a';
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-350">
      
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight">
            Welcome back, <span className="text-emerald-600 dark:text-emerald-400">{userName}</span>
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 mt-0.5">
            Your personal treasury is healthy. Here is your overview for this month.
          </p>
        </div>
        <button
          onClick={onOpenQuickAdd}
          type="button"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-97 transition-all w-full md:w-auto cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Summary Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Net Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 text-white p-6 md:p-7 shadow-xl border border-slate-800 dark:border-slate-800/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Net Net Assets
            </span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Wallet size={18} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-display font-bold tracking-tight">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Safe to spend</span> liquid reserves
            </p>
          </div>
          {/* Sparkline decoration */}
          <div className="mt-4 h-8 opacity-45">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-emerald-400 fill-none stroke-2" preserveAspectRatio="none">
              <path d={trendPath || "M 0 50 L 100 50"} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 md:p-7 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
              Total Inflow
            </span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              From <span className="font-semibold">{transactions.filter((t) => t.type === 'income').length} direct sources</span> this month
            </p>
          </div>
          {/* Static green sparkline */}
          <div className="mt-4 h-8 opacity-30">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-emerald-500 fill-none stroke-2 animate-pulse" preserveAspectRatio="none">
              <path d="M0,80 L20,70 L40,85 L60,40 L80,50 L100,10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 md:p-7 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
              Total Outflow
            </span>
            <span className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl">
              <ArrowDownLeft size={18} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              Distributed across <span className="font-semibold">{categorySlices.length} categories</span>
            </p>
          </div>
          {/* Static red sparkline */}
          <div className="mt-4 h-8 opacity-30">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-rose-400 fill-none stroke-2" preserveAspectRatio="none">
              <path d="M0,20 L20,35 L40,15 L60,70 L80,55 L100,90" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* Visual Analytics and Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Expense overview Donut (3 Cols on Desktop) */}
        <div className="lg:col-span-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  Outflow Structuring
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Visual breakdown of where your cash went
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 rounded-lg uppercase tracking-wider border border-slate-100 dark:border-slate-800">
                All metrics
              </span>
            </div>

            {/* Empty Outflow Chart check */}
            {categorySlices.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-950/25 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 mt-6">
                <span className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                  <Activity size={20} />
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No expenses recorded yet</p>
                <p className="text-xs text-slate-450 dark:text-slate-500 max-w-xs mt-1">Add expense entries in the ledger to render allocation structuring</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-6">
                
                {/* SVG Donut Illustration */}
                <div className="relative flex justify-center py-4">
                  <svg viewBox="0 0 160 160" className="w-36 h-36 md:w-44 md:h-44 transform -rotate-90">
                    {/* Circle base backdrop */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="url(#donutBackdrop)"
                      strokeWidth={strokeWidth}
                      className="opacity-5 dark:opacity-10"
                    />
                    
                    {/* Slice mappings */}
                    {categorySlices.map((slice, idx) => {
                      const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -accumulatedAngle;
                      accumulatedAngle += (slice.percentage / 100) * circumference;
                      
                      const isHovered = activeDonutIdx === idx;
                      
                      return (
                        <circle
                          key={slice.id}
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke={getColorHex(slice.color)}
                          strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-300 cursor-pointer"
                          onMouseEnter={() => setActiveDonutIdx(idx)}
                          onMouseLeave={() => setActiveDonutIdx(null)}
                          style={{
                            transformOrigin: '80px 80px',
                            filter: isHovered ? `drop-shadow(0 4px 6px ${getColorHex(slice.color)}33)` : '',
                          }}
                        />
                      );
                    })}
                    
                    <defs>
                      <radialGradient id="donutBackdrop">
                        <stop offset="70%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#475569" />
                      </radialGradient>
                    </defs>
                  </svg>

                  {/* Absolute Center Content */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      {activeDonutIdx !== null ? categorySlices[activeDonutIdx].name : 'Total Debt'}
                    </span>
                    <span className="text-lg md:text-xl font-display font-black text-slate-800 dark:text-slate-100">
                      ${(activeDonutIdx !== null ? categorySlices[activeDonutIdx].amount : totalExpense).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-400 block mt-0.5">
                      {activeDonutIdx !== null ? `${categorySlices[activeDonutIdx].percentage.toFixed(1)}%` : 'Allocated'}
                    </span>
                  </div>
                </div>

                {/* Categorical details listing */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {categorySlices.slice(0, 5).map((slice, idx) => (
                    <div
                      key={slice.id}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                        activeDonutIdx === idx 
                          ? 'bg-slate-50 dark:bg-slate-800/80 translate-x-1.5' 
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-850/50'
                      }`}
                      onMouseEnter={() => setActiveDonutIdx(idx)}
                      onMouseLeave={() => setActiveDonutIdx(null)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg text-white bg-${slice.color}-500 flex items-center justify-center`}>
                          <LucideIcon name={slice.icon} size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {slice.name}
                          </p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400">
                            {slice.percentage.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        ${slice.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Showing top spending categories</span>
            <button
              onClick={() => onNavigate('categories')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-500 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage categories</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Dynamic Static Balance progression / Bi-weekly Flow chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Financial Progression
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
              Net income velocity mapping
            </p>

            {/* Custom SVG line Chart */}
            <div className="h-48 mt-9 relative flex items-end">
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Horizontal reference lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(148,163,184,0.06)" strokeWidth="1" strokeDasharray="3,3" />

                {/* Shaded Area underneath the income velocity line */}
                <path
                  d="M0,90 Q 20,40 40,55 T 80,30 T 100,20 L 100,100 L 0,100 Z"
                  fill="url(#progressionGradient)"
                  className="opacity-30 dark:opacity-20"
                />
                
                {/* progression curves */}
                <path
                  d="M0,90 Q 20,40 40,55 T 80,30 T 100,20"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Glow markers on peaks */}
                <circle cx="100" cy="20" r="5" fill="#10b981" />
                <circle cx="100" cy="20" r="9" fill="none" stroke="#10b981" strokeWidth="2" className="animate-ping" style={{ transformOrigin: '100px 20px' }} />

                {/* SVG Definitions */}
                <defs>
                  <linearGradient id="progressionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Grid Labelings */}
              <div className="absolute right-2 top-2 py-0.5 px-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-sm text-[8px] font-bold uppercase">
                Peak Liquid Range
              </div>
            </div>

            {/* Scale Legends */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
              <span>W1 (Start)</span>
              <span>W2</span>
              <span>W3</span>
              <span>W4 (Current)</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3.5 border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Savings Rate</p>
              <p className="text-lg font-display font-black text-slate-800 dark:text-white mt-1">
                {totalIncome > 0 ? `${((totalIncome - totalExpense) / totalIncome * 105).toFixed(0)}%` : '0%'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Debt To Income</p>
              <p className="text-lg font-display font-black text-slate-800 dark:text-white mt-1">
                {totalIncome > 0 ? `${(totalExpense / totalIncome * 100).toFixed(0)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Ledger Entries Sections */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-7 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
              Your latest financial movements
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold hover:bg-slate-100/85 transition-all flex items-center gap-1 border border-slate-100 dark:border-slate-700 cursor-pointer"
          >
            <span>View All Ledger</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Empty list checker */}
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 mt-6">
            <span className="p-4 bg-slate-50 dark:bg-slate-850 rounded-full text-slate-400 dark:text-slate-500 mb-3">
              <Activity size={24} />
            </span>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your ledger is empty</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">Record a grocery bill, subscription expense, or payroll entry to configure this dashboard.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {transactions.slice(0, 4).map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-850/60 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 transition-all flex-wrap md:flex-nowrap gap-3"
                >
                  <div className="flex items-center gap-4">
                    {/* Category color circle mapping */}
                    <div className={`p-3 rounded-2xl bg-${cat?.color || 'zinc'}-500/10 text-${cat?.color || 'zinc'}-600 dark:text-${cat?.color || 'zinc'}-400 flex items-center justify-center shrink-0`}>
                      <LucideIcon name={cat?.icon || 'DollarSign'} size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                        {tx.note}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-100 dark:border-slate-755">
                          {cat?.name || 'Unassigned'}
                        </span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{tx.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className={`text-sm md:text-base font-display font-extrabold tracking-tight ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
