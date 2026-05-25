/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import LucideIcon from './LucideIcon';
import { convertCurrency, formatCurrencyValue } from '../services/currencyService';
import { Search, Calendar, Edit, Trash2, ChevronLeft, ChevronRight, Info, Plus } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenQuickAdd: () => void;
  baseCurrency?: string;
}

export default function TransactionsView({
  transactions,
  categories,
  onEditTransaction,
  onDeleteTransaction,
  onOpenQuickAdd,
  baseCurrency = 'USD',
}: TransactionsViewProps) {
  // Filters State
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'this-week' | 'this-month' | 'past-30'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Clear filters helper
  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPeriodFilter('all');
    setPage(1);
  };

  // Run complex filters & sorting memoized
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return (
          t.note.toLowerCase().includes(q) ||
          (cat && cat.name.toLowerCase().includes(q))
        );
      });
    }

    // Class Mode Toggles
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Category Tags
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.categoryId === categoryFilter);
    }

    // Temporal Windows
    if (periodFilter !== 'all') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      result = result.filter((t) => {
        const txDate = new Date(t.date);
        txDate.setHours(0, 0, 0, 0);

        const diffTime = now.getTime() - txDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (periodFilter) {
          case 'today':
            return diffDays === 0;
          case 'this-week':
            return diffDays <= 7;
          case 'this-month': {
            const thisMonthNow = now.getMonth();
            const thisYearNow = now.getFullYear();
            return txDate.getMonth() === thisMonthNow && txDate.getFullYear() === thisYearNow;
          }
          case 'past-30':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Sort order (sorting based on converted value to baseCurrency for uniform comparison!)
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      
      const aVal = convertCurrency(a.amount, a.currency || 'USD', baseCurrency);
      const bVal = convertCurrency(b.amount, b.currency || 'USD', baseCurrency);
      
      if (sortBy === 'amount-desc') return bVal - aVal;
      if (sortBy === 'amount-asc') return aVal - bVal;
      return 0;
    });

    return result;
  }, [transactions, categories, search, typeFilter, categoryFilter, periodFilter, sortBy, baseCurrency]);

  // Handle paginating windows
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, page]);

  // Adjust pagination index bounds
  useMemo(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-350" id="ledger-view-root">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Transactions Ledger
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400">
            Audit, filter, and track all inflow and outflow entries in original currency or base portfolio equivalent.
          </p>
        </div>
        <button
          onClick={onOpenQuickAdd}
          type="button"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl shadow-md cursor-pointer text-sm"
        >
          <Plus size={16} />
          <span>Quick Record</span>
        </button>
      </div>

      {/* Control filters dashboard */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
        
        {/* Search & Class Mode */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search box */}
          <div className="relative md:col-span-7">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500 rounded-2xl outline-none text-xs font-semibold focus:ring-1 focus:ring-emerald-500/20"
              placeholder="Search note memos or categories..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Type dropdown */}
          <div className="md:col-span-5">
            <select
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-100 rounded-2xl text-xs font-bold outline-none cursor-pointer"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all" className="bg-slate-900 text-slate-300">Financial Flow: All</option>
              <option value="income" className="bg-slate-900 text-slate-300">Inflow Only</option>
              <option value="expense" className="bg-slate-900 text-slate-300">Outflow Only</option>
            </select>
          </div>
        </div>

        {/* Categories, Period, and Sorting row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Category Tag</label>
            <select
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs font-semibold outline-none cursor-pointer"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all" className="bg-slate-900 text-slate-300">All Category Tags</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-300">{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Temporal Window</label>
            <select
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs font-semibold outline-none cursor-pointer"
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all" className="bg-slate-900 text-slate-300">Historic Span: All</option>
              <option value="today" className="bg-slate-900 text-slate-300">Today Only</option>
              <option value="this-week" className="bg-slate-900 text-slate-300">Past 7 Days</option>
              <option value="this-month" className="bg-slate-900 text-slate-300">This Month</option>
              <option value="past-30" className="bg-slate-900 text-slate-300">Past 30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Sort Priority</label>
            <select
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs font-semibold outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date-desc" className="bg-slate-900 text-slate-300">Newest First</option>
              <option value="date-asc" className="bg-slate-900 text-slate-300">Oldest First</option>
              <option value="amount-desc" className="bg-slate-900 text-slate-300">Highest Amount</option>
              <option value="amount-asc" className="bg-slate-900 text-slate-300">Lowest Amount</option>
            </select>
          </div>
        </div>

      </div>

      {/* RENDER GRID / EMPTY LISTS */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center max-w-sm mx-auto">
          <Info className="w-8 h-8 text-slate-300 dark:text-slate-605 animate-pulse mb-3.5" />
          <h3 className="text-sm font-bold text-white">Filtered ledger is empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            There are no entry rows matching your active query configurations. Adjust search keywords or time filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-705 text-xs text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Clear Active Filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* DESKTOP VIEW LEDGER (Table) */}
          <div className="hidden md:block overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-850/60 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="py-4.5 px-6">Source Note & Memo</th>
                  <th className="py-4.5 px-4 text-center">Type</th>
                  <th className="py-4.5 px-4">Category Tag</th>
                  <th className="py-4.5 px-4 font-display">Date</th>
                  <th className="py-4.5 px-4 text-right">Ledger Value</th>
                  <th className="py-4.5 px-6 text-center">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedItems.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const txCurr = tx.currency || 'USD';
                  const isDifferentCurrency = txCurr !== baseCurrency;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-850/30 text-white transition-colors"
                    >
                      {/* Name description */}
                      <td className="py-4 px-6 max-w-xs font-medium text-sm">
                        <div className="truncate font-semibold active-text-glow" title={tx.note}>
                          {tx.note}
                        </div>
                      </td>

                      {/* Pill style type indicator */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-wide font-extrabold rounded-md ${
                          tx.type === 'income'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {tx.type}
                        </span>
                      </td>

                      {/* Badge categorization icon */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg bg-${cat?.color || 'zinc'}-500/10 text-${cat?.color || 'zinc'}-600 dark:text-${cat?.color || 'zinc'}-400 flex items-center justify-center shrink-0`}>
                            <LucideIcon name={cat?.icon || 'HelpCircle'} size={14} />
                          </span>
                          <span className="text-xs font-semibold">
                            {cat?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Calendar date representation */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {tx.date}
                      </td>

                      {/* Amount with dual currency equivalent details */}
                      <td className="py-4 px-4 text-right">
                        <div className={`font-display font-black tracking-tight text-sm ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrencyValue(tx.amount, txCurr)}
                        </div>
                        {isDifferentCurrency && (
                          <div className="text-[9px] text-slate-400 mt-0.5 font-semibold">
                            ≈ {formatCurrencyValue(convertCurrency(tx.amount, txCurr, baseCurrency), baseCurrency)}
                          </div>
                        )}
                      </td>

                      {/* CRUD Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit transaction"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Delete transaction"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TABLET & MOBILE VIEW GRID (Cards) */}
          <div className="md:hidden space-y-3">
            {paginatedItems.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const txCurr = tx.currency || 'USD';
              const isDifferentCurrency = txCurr !== baseCurrency;

              return (
                <div
                  key={tx.id}
                  className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-${cat?.color || 'zinc'}-500/10 text-${cat?.color || 'zinc'}-605 dark:text-${cat?.color || 'zinc'}-400 flex items-center justify-center shrink-0`}>
                        <LucideIcon name={cat?.icon || 'HelpCircle'} size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white leading-tight">
                          {tx.note}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {tx.date} • {cat?.name || 'Unassigned'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-display font-black tracking-tight ${
                        tx.type === 'income' ? 'text-emerald-400 font-semibold' : 'text-rose-400'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrencyValue(tx.amount, txCurr)}
                      </p>
                      {isDifferentCurrency && (
                        <p className="text-[9px] text-slate-450 mt-0.5 font-semibold">
                          ≈ {formatCurrencyValue(convertCurrency(tx.amount, txCurr, baseCurrency), baseCurrency)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="inline-flex px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {tx.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 px-3 text-[10px] font-semibold text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/20 rounded-lg flex items-center gap-1 bg-slate-800 cursor-pointer"
                      >
                        <Edit size={10} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 px-3 text-[10px] font-semibold text-slate-400 hover:text-rose-455 hover:bg-rose-950/20 rounded-lg flex items-center gap-1 bg-slate-800 cursor-pointer"
                      >
                        <Trash2 size={10} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION PANEL CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xs">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-slate-400">
                Page <span className="font-extrabold text-white">{page}</span> of <span className="font-extrabold text-white">{totalPages}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
