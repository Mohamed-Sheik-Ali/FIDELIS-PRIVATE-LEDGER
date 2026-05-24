/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import LucideIcon from './LucideIcon';
import { Search, Filter, Calendar, Edit, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, X, Info, Plus } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenQuickAdd: () => void;
}

export default function TransactionsView({
  transactions,
  categories,
  onEditTransaction,
  onDeleteTransaction,
  onOpenQuickAdd,
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

    // Typo/Note Search
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

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [transactions, categories, search, typeFilter, categoryFilter, periodFilter, sortBy]);

  // Handle paginating windows
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, page]);

  // Adjust pagination index bounds if total list narrows
  useMemo(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-350">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Transactions Ledger
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400">
            Audit, filter, and track all inflow and outflow entries
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
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
        
        {/* Search & Class Mode */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search box (7 Cols) */}
          <div className="relative md:col-span-7">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focused:border-emerald-500 rounded-2xl outline-none text-slate-900 dark:text-white transition-all text-sm font-medium"
              placeholder="Search by notes or category name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Type trigger toggler (5 Cols) */}
          <div className="flex p-1 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl md:col-span-5">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === 'all' ? 'All Ledger' : t}
              </button>
            ))}
          </div>

        </div>

        {/* Categories, Periods, Sorting criteria */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-1">
          
          {/* Category Dropdown */}
          <div className="space-y-1.5Col">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
              Category
            </label>
            <select
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 outline-none focus:border-emerald-500"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Date periods */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
              Date Period
            </label>
            <select
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 outline-none focus:border-emerald-500"
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all">Anytime</option>
              <option value="today">Today</option>
              <option value="this-week">This Week (Last 7 Days)</option>
              <option value="this-month">This Calendar Month</option>
              <option value="past-30">Past 30 Days</option>
            </select>
          </div>

          {/* Sorter selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
              Sort By
            </label>
            <select
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 outline-none focus:border-emerald-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date-desc">Newest to Oldest</option>
              <option value="date-asc">Oldest to Newest</option>
              <option value="amount-desc">Highest Spendings</option>
              <option value="amount-asc">Lowest Spendings</option>
            </select>
          </div>

          {/* Active filter counter / Reset (Spans full on sm, 1 Col on larger scale) */}
          <div className="sm:col-span-3 md:col-span-1 flex items-end">
            <button
              onClick={handleResetFilters}
              disabled={search === '' && typeFilter === 'all' && categoryFilter === 'all' && periodFilter === 'all'}
              className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 disabled:opacity-0 disabled:pointer-events-none hover:bg-slate-100 text-slate-500 dark:hover:bg-slate-750 dark:text-slate-400 font-semibold text-xs border border-slate-200 dark:border-slate-705 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <X size={14} />
              <span>Reset Filters</span>
            </button>
          </div>

        </div>

      </div>

      {/* Grid count stats labels */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Showing {filteredTransactions.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} - {Math.min(page * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results</span>
      </div>

      {/* TABLE/CARD CONTAINER */}
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
          <span className="p-4 bg-slate-50 dark:bg-slate-850 rounded-full text-slate-400 dark:text-slate-500 mb-3">
            <Info size={24} />
          </span>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No matching entries</h3>
          <p className="text-xs text-slate-450 dark:text-slate-550 max-w-sm mt-1">We couldn't locate any records answering your criteria. Review your spelling or lower constraints.</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-semibold rounded-xl border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/20 cursor-pointer"
          >
            Clear Active Filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* DESKTOP VIEW LEDGER (Table) */}
          <div className="hidden md:block overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-450 dark:text-slate-400">
                  <th className="py-4.5 px-6">Source Note & Memo</th>
                  <th className="py-4.5 px-4 text-center">Type</th>
                  <th className="py-4.5 px-4">Category Tag</th>
                  <th className="py-4.5 px-4 font-display">Date</th>
                  <th className="py-4.5 px-4 text-right">Amount</th>
                  <th className="py-4.5 px-6 text-center">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedItems.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/30 dark:hover:bg-slate-850/20 text-slate-900 dark:text-white transition-colors"
                    >
                      {/* Name description */}
                      <td className="py-4 px-6 max-w-xs font-medium text-sm">
                        <div className="truncate font-semibold active-text-glow" title={tx.note}>
                          {tx.note}
                        </div>
                      </td>

                      {/* Pill style type indicator */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-wide font-extrabold rounded-md outline-none ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/10'
                            : 'bg-rose-50 dark:bg-rose-955/20 text-rose-550 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/10'
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

                      {/* Dollar Amount */}
                      <td className={`py-4 px-4 text-right font-display font-black tracking-tight ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-900 dark:text-white'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* CRUD Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit transaction"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Delete transaction"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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
              return (
                <div
                  key={tx.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-${cat?.color || 'zinc'}-500/10 text-${cat?.color || 'zinc'}-600 dark:text-${cat?.color || 'zinc'}-400 flex items-center justify-center shrink-0`}>
                        <LucideIcon name={cat?.icon || 'HelpCircle'} size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                          {tx.note}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {tx.date} • {cat?.name || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-display font-black tracking-tight ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/60">
                    <span className={`inline-flex px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-755`}>
                      {tx.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 px-3 text-[10px] font-semibold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:bg-emerald-955/20 rounded-lg flex items-center gap-1 bg-slate-50 dark:bg-slate-800"
                      >
                        <Edit size={10} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 px-3 text-[10px] font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:bg-rose-950/20 rounded-lg flex items-center gap-1 bg-slate-50 dark:bg-slate-800"
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
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">
                Page <span className="font-extrabold text-slate-900 dark:text-white">{page}</span> of <span className="font-extrabold text-slate-900 dark:text-white">{totalPages}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-colors cursor-pointer"
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
