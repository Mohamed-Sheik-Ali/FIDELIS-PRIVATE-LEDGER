/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Transaction, Category, ViewType } from '../types';
import LucideIcon from './LucideIcon';
import { convertCurrency, formatCurrencyValue } from '../services/currencyService';
import { Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, ArrowRight, Activity, Calendar } from 'lucide-react';
import { useLanguage } from '../services/languageService';

interface DashboardViewProps {
  transactions: Transaction[];
  categories: Category[];
  onNavigate: (view: ViewType) => void;
  onOpenQuickAdd: () => void;
  userName: string;
  baseCurrency?: string;
}

export default function DashboardView({
  transactions,
  categories,
  onNavigate,
  onOpenQuickAdd,
  userName,
  baseCurrency = 'USD',
}: DashboardViewProps) {
  const { t } = useLanguage();
  const [activeDonutIdx, setActiveDonutIdx] = useState<number | null>(null);

  // Convert and add up totals under the designated portfolio Base Currency
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => {
      const txCurr = t.currency || 'USD';
      return sum + convertCurrency(t.amount, txCurr, baseCurrency);
    }, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => {
      const txCurr = t.currency || 'USD';
      return sum + convertCurrency(t.amount, txCurr, baseCurrency);
    }, 0);

  const balance = totalIncome - totalExpense;

  // Group Expenses by Category (converted to base portfolio currency)
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const expenseByCategory = expenseTransactions.reduce((acc: Record<string, number>, t) => {
    const txCurr = t.currency || 'USD';
    const amountInBase = convertCurrency(t.amount, txCurr, baseCurrency);
    acc[t.categoryId] = (acc[t.categoryId] || 0) + amountInBase;
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

  // Mini Chart data calculation for trend sparkline
  const sortedByDate = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const trendPoints = sortedByDate.slice(-8).map((t, idx) => {
    const txCurr = t.currency || 'USD';
    const valInBase = convertCurrency(t.amount, txCurr, baseCurrency);
    return {
      x: (idx / 7) * 100,
      y: t.type === 'income' ? 50 - (valInBase / 3000) * 30 : 50 + (valInBase / 3000) * 30,
    };
  });

  const trendPath = trendPoints.length > 0
    ? `M ${trendPoints[0].x} ${trendPoints[0].y} ` + trendPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : '';

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
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-350" id="dashboard-container">
      
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-905 dark:text-white leading-tight">
            {t('welcomeBack')} <span className="text-emerald-600 dark:text-emerald-400">{userName}</span>
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
          <span>{t('transactionModalTitleAdd')}</span>
        </button>
      </div>

      {/* Summary Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Net Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 text-white p-6 md:p-7 shadow-xl border border-slate-800 dark:border-slate-800/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('currentNetAssetsTitle')}
            </span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Wallet size={18} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-display font-bold tracking-tight text-white">
              {formatCurrencyValue(balance, baseCurrency)}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">{t('safeToSpend')}</span>
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
        <div className="rounded-3xl bg-slate-900 border border-slate-800/80 p-6 md:p-7 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('totalInflow')}
            </span>
            <span className="p-2 bg-emerald-950/30 text-emerald-400 rounded-xl">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              {formatCurrencyValue(totalIncome, baseCurrency)}
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-2 flex items-center gap-1">
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
        <div className="rounded-3xl bg-slate-900 border border-slate-800/80 p-6 md:p-7 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('totalOutflow')}
            </span>
            <span className="p-2 bg-rose-950/30 text-rose-400 rounded-xl">
              <ArrowDownLeft size={18} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              {formatCurrencyValue(totalExpense, baseCurrency)}
            </h3>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              {t('distributedCount', { count: categorySlices.length })}
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
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-7 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                {t('assetAllocation')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('assetAllocationDesc')}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1.5 bg-slate-850 text-slate-450 rounded-lg uppercase tracking-wider border border-slate-800">
              All metrics
            </span>
          </div>

          {/* Empty Outflow Chart check */}
          {categorySlices.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-950/25 rounded-2xl border border-dashed border-slate-805 mt-6">
              <span className="p-3 bg-slate-800 text-slate-400 rounded-full mb-3">
                <Activity size={20} />
              </span>
              <p className="text-sm font-semibold text-slate-305">No expenses recorded yet</p>
              <p className="text-xs text-slate-450 max-w-xs mt-1">Add expense entries in the ledger to render allocation structuring</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-6">
              
              {/* SVG Donut Illustration */}
              <div className="relative flex justify-center py-4">
                <svg viewBox="0 0 160 160" className="w-36 h-36 md:w-44 md:h-44 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#888888"
                    strokeWidth={strokeWidth}
                    className="opacity-5 dark:opacity-10"
                  />
                  
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
                        className="transition-all duration-305 cursor-pointer"
                        onMouseEnter={() => setActiveDonutIdx(idx)}
                        onMouseLeave={() => setActiveDonutIdx(null)}
                      />
                    );
                  })}
                </svg>
                
                {/* Center percentage info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-805 dark:text-white leading-none">
                    {activeDonutIdx !== null ? `${Math.round(categorySlices[activeDonutIdx].percentage)}%` : `${categorySlices.length}`}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">
                    {activeDonutIdx !== null ? categorySlices[activeDonutIdx].name : 'Slices'}
                  </span>
                </div>
              </div>

              {/* Legend list */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {categorySlices.map((slice, idx) => {
                  const isHovered = activeDonutIdx === idx;
                  return (
                    <div
                      key={slice.id}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                        isHovered 
                          ? 'bg-slate-50 dark:bg-slate-805 border-slate-200 dark:border-slate-800' 
                          : 'border-transparent'
                      }`}
                      onMouseEnter={() => setActiveDonutIdx(idx)}
                      onMouseLeave={() => setActiveDonutIdx(null)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-3 h-3 rounded-full shrink-0 bg-${slice.color}-500`} />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {slice.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white ml-2">
                        {formatCurrencyValue(slice.amount, baseCurrency)}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Recent Ledger Entries Sections */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-7 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-white">
              {t('recentTransactions')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('recentTransactionsDesc')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1 border border-slate-700 cursor-pointer"
          >
            <span>{t('viewLiveLedgerLogs')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Empty list checker */}
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 mt-6">
            <span className="p-4 bg-slate-850 rounded-full text-slate-400 mb-3">
              <Activity size={24} />
            </span>
            <h4 className="text-sm font-semibold text-slate-300">Your ledger is empty</h4>
            <p className="text-xs text-slate-505 max-w-xs mt-1">Record a grocery bill, subscription expense, or payroll entry to configure this dashboard.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {transactions.slice(0, 4).map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-850/60 rounded-2xl border border-slate-800/50 transition-all flex-wrap md:flex-nowrap gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-${cat?.color || 'zinc'}-500/10 text-${cat?.color || 'zinc'}-400 flex items-center justify-center shrink-0`}>
                      <LucideIcon name={cat?.icon || 'DollarSign'} size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white leading-snug">
                        {tx.note}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-755">
                          {cat?.name || 'Unassigned'}
                        </span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{tx.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm md:text-base font-display font-extrabold tracking-tight ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrencyValue(tx.amount, tx.currency || 'USD')}
                    </p>
                    {tx.currency && tx.currency !== baseCurrency && (
                      <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">
                        ≈ {formatCurrencyValue(convertCurrency(tx.amount, tx.currency, baseCurrency), baseCurrency)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
