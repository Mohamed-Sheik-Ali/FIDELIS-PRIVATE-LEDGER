/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Category, Transaction, TransactionType } from '../types';
import LucideIcon from './LucideIcon';
import { Plus, Edit2, Trash2, Tag, ArrowUpRight, ArrowDownLeft, AlertCircle, Info } from 'lucide-react';

interface CategoriesViewProps {
  categories: Category[];
  transactions: Transaction[];
  onAddCategory: () => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  deleteError: string | null;
  onClearDeleteError: () => void;
}

export default function CategoriesView({
  categories,
  transactions,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  deleteError,
  onClearDeleteError,
}: CategoriesViewProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');

  // Count transactions per category
  const getCategoryCountAndSpend = (catId: string) => {
    const tied = transactions.filter((t) => t.categoryId === catId);
    const sum = tied.reduce((acc, current) => acc + current.amount, 0);
    return {
      count: tied.length,
      amount: sum,
    };
  };

  const filtered = categories.filter((c) => c.type === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-350">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Category Definitions
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400">
            Customize labels and color schemes to map your cash flow
          </p>
        </div>
        <button
          onClick={onAddCategory}
          type="button"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl shadow-md cursor-pointer text-sm"
        >
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {/* Delete lock validation error */}
      {deleteError && (
        <div className="flex items-start justify-between gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/40 rounded-3xl text-rose-600 dark:text-rose-400 text-xs">
          <div className="flex gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Deactivation Rejected</p>
              <p className="mt-0.5 select-all">{deleteError}</p>
            </div>
          </div>
          <button
            onClick={onClearDeleteError}
            className="text-rose-500 hover:text-rose-700 font-bold px-2 py-1 bg-rose-100/30 hover:bg-rose-100/50 rounded-xl"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Segmented control view switch */}
      <div className="flex p-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${
            activeTab === 'expense'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowDownLeft size={14} />
          <span>Expense tags ({categories.filter((c) => c.type === 'expense').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${
            activeTab === 'income'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowUpRight size={14} />
          <span>Income tags ({categories.filter((c) => c.type === 'income').length})</span>
        </button>
      </div>

      {/* Categories Bento Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
          <span className="p-4 bg-slate-50 dark:bg-slate-850 rounded-full text-slate-400 dark:text-slate-500 mb-3">
            <Tag size={24} />
          </span>
          <h3 className="text-base font-semibold text-slate-805 dark:text-slate-200">No custom tags in this tab</h3>
          <p className="text-xs text-slate-450 dark:text-slate-550 max-w-sm mt-1">Add custom labels corresponding to your allocation streams to categorize incoming payouts or outgoing expenses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cat) => {
            const stats = getCategoryCountAndSpend(cat.id);
            return (
              <div
                key={cat.id}
                className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    {/* Visual Badge representing chosen colors */}
                    <div className={`p-3 rounded-2xl bg-${cat.color}-505 bg-${cat.color}-500/10 text-${cat.color}-600 dark:text-${cat.color}-400 flex items-center justify-center shrink-0`}>
                      <LucideIcon name={cat.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        {cat.type} Category
                      </p>
                    </div>
                  </div>

                  {/* Operational Controls panel (Always showing in simple view, highlighted on hover) */}
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditCategory(cat)}
                      title="Edit Category Details"
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      title="Delete Category"
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-450 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Micro Stats Metrics */}
                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Entries linked</p>
                    <p className="text-sm font-black text-slate-850 dark:text-slate-200 mt-0.5">
                      {stats.count === 0 ? 'None' : `${stats.count} transaction${stats.count > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Total Amount</p>
                    <p className="text-sm font-black text-slate-850 dark:text-slate-205 mt-0.5">
                      ${stats.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Helpful Info Tip */}
      <div className="flex items-start gap-2.5 p-4 bg-emerald-50/45 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl text-xs text-emerald-700 dark:text-emerald-400 max-w-2xl mt-8">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p>
          <strong>Automatic ledger protection:</strong> Standard and custom categories currently in use in your ledger cannot be completely deactivated or deleted. This avoids leaving orphan ledger entries with missing mappings. Reassign transactions before deactivating.
        </p>
      </div>

    </div>
  );
}
