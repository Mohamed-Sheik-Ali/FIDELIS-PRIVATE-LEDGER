/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User } from '../types';
import { SUPPORTED_CURRENCIES, convertCurrency, formatCurrencyValue, fetchLatestRates, ratesLastUpdated } from '../services/currencyService';
import { RefreshCw, Coins, ArrowRightLeft, Check, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

interface CurrencyViewProps {
  user: User;
  onUpdateBaseCurrency: (currency: string) => void;
}

export default function CurrencyView({ user, onUpdateBaseCurrency }: CurrencyViewProps) {
  const baseCurrency = user.baseCurrency || 'USD';
  
  // Converter Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcFrom, setCalcFrom] = useState<string>('USD');
  const [calcTo, setCalcTo] = useState<string>('EUR');
  const [ratesDate, setRatesDate] = useState<string>(ratesLastUpdated);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch rates on mount to get current day values
  const handleFetchRates = async () => {
    setIsRefreshing(true);
    await fetchLatestRates();
    setRatesDate(ratesLastUpdated);
    setIsRefreshing(false);
  };

  useEffect(() => {
    handleFetchRates();
  }, []);

  const calculatedResult = convertCurrency(calcAmount, calcFrom, calcTo);

  // Quick swap conversion
  const handleSwap = () => {
    const temp = calcFrom;
    setCalcFrom(calcTo);
    setCalcTo(temp);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="currency-view-container">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-905 dark:text-white">
            Currency Treasury
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure default ledger representation, manage real-time conversion rates, and inspect trade impacts.
          </p>
        </div>

        {/* Sync Active Banner */}
        <button
          onClick={handleFetchRates}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl border border-emerald-500/15 dark:border-emerald-400/15 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-all cursor-pointer font-sans select-none disabled:opacity-75"
          title="Click to manually refresh to current day rates"
        >
          <TrendingUp className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-[11px] font-extrabold uppercase tracking-wider">
            {isRefreshing ? 'Syncing...' : `Current Day: ${ratesDate}`}
          </span>
        </button>
      </div>

      {/* DASHBOARD-STYLE BENTO GRID GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6.5">
        
        {/* CARD 1: BASE CURRENCY PREFERENCE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5.5 shadow-sm space-y-5 flex flex-col justify-between" id="base-currency-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-slate-850 text-emerald-600 dark:text-emerald-400">
                <Coins size={18} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Base Ledger Currency</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Select preference for global asset reports</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Changing your base currency converts all historic balances, incomes, and expenditures into your chosen standard automatically inside reports, charts, and summary metrics.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.values(SUPPORTED_CURRENCIES).map((curr) => {
                const isSelected = baseCurrency === curr.code;
                return (
                  <button
                    key={curr.code}
                    onClick={() => {
                      onUpdateBaseCurrency(curr.code);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400 font-bold'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-extrabold blocking tracking-wide">{curr.code}</span>
                      <span className="block text-[9px] text-slate-400 font-medium truncate max-w-[80px]">{curr.name}</span>
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center scale-90">
                        <Check size={11} className="stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">{curr.symbol}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-450 font-semibold bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Current active base: {SUPPORTED_CURRENCIES[baseCurrency]?.name} ({baseCurrency})</span>
            </div>
          </div>
        </div>

        {/* CARD 2: REAL-TIME CONVERSION CALCULATOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5.5 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between" id="converter-calculator-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <ArrowRightLeft size={18} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Exchange Converter</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Calculate instant capital conversion values</p>
                </div>
              </div>
            </div>

            {/* Conversion inputs */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* Input Amount */}
                <div className="col-span-1 md:col-span-5 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sell Amount</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                      {SUPPORTED_CURRENCIES[calcFrom]?.symbol}
                    </span>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Sell Currency */}
                <div className="col-span-1 md:col-span-3 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">From</label>
                  <select
                    value={calcFrom}
                    onChange={(e) => setCalcFrom(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SWAP BUTTON */}
                <div className="col-span-1 md:col-span-1 flex justify-center pt-5">
                  <button
                    onClick={handleSwap}
                    className="p-2 rounded-full border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                    title="Swap Currencies"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                {/* Buy Currency */}
                <div className="col-span-1 md:col-span-3 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">To</label>
                  <select
                    value={calcTo}
                    onChange={(e) => setCalcTo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.symbol}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* Big Beautiful Conversion Result */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
              <div>
                <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wide">Dynamic Conversion Ledger Result</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrencyValue(calculatedResult, calcTo)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    {calcTo}
                  </span>
                </div>
              </div>
              <div className="text-right md:text-right text-[10px] text-slate-450 dark:text-slate-400">
                <p className="font-semibold text-slate-600 dark:text-slate-350 text-xs text-indigo-600 dark:text-indigo-400">
                  1 {calcFrom} = {SUPPORTED_CURRENCIES[calcTo] && formatCurrencyValue(convertCurrency(1, calcFrom, calcTo), calcTo)}
                </p>
                <p className="mt-1 font-sans">
                  Rates active for: <span className="font-bold text-emerald-600 dark:text-emerald-405 bg-emerald-500/5 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">{ratesDate}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-white">Why Use Multiple Currencies?</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                Helpful when categorizing travel ledger items, managing remote contractor pipelines, or maintaining foreign investments without distorting basic local accounting portfolios.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-white">Safe Exchange Arbitrage</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                Exchange rates use realistic international asset baselines to calculate value indices inside reports and dashboards. Set your preferences above.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* COMPACT EXCHANGE RATES GRID CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5.5 shadow-sm space-y-4">
        <div>
          <h2 className="text-xs uppercase font-extrabold text-slate-450 dark:text-slate-400 tracking-wider">
            Exchange Rate Index (Relating to {baseCurrency})
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Overview of conversion metrics for all other active currencies in reference to 1.00 {baseCurrency}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.values(SUPPORTED_CURRENCIES).map((curr) => {
            const isBase = curr.code === baseCurrency;
            const ratesRelative = convertCurrency(1, baseCurrency, curr.code);
            return (
              <div
                key={curr.code}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-1.5 ${
                  isBase
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 dark:bg-emerald-500/10'
                    : 'bg-slate-950 border border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{curr.code}</span>
                  <span className="text-xs text-slate-400 font-semibold">{curr.symbol}</span>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">
                    {ratesRelative.toFixed(isBase ? 2 : 4)}
                  </p>
                  <p className="text-[8px] font-bold uppercase text-slate-400 mt-0.5 tracking-wide">
                    {isBase ? 'Anchor Base' : `${curr.code} per 1 ${baseCurrency}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
