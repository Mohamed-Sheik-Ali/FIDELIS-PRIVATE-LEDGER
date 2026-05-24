/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { X, DollarSign, Calendar, Edit2, Plus, Info } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'> & { id?: string }) => void;
  categories: Category[];
  transaction: Transaction | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  categories,
  transaction,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [errorWord, setErrorWord] = useState<string>('');

  // Read existing entry data when Edit Mode is triggered
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setCategoryId(transaction.categoryId);
      setNote(transaction.note);
      setDate(transaction.date);
      setErrorWord('');
    } else {
      setType('expense');
      setAmount('');
      setCategoryId('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setErrorWord('');
    }
  }, [transaction, isOpen]);

  // Set default category when type toggles
  useEffect(() => {
    const activeCategories = categories.filter((c) => c.type === type);
    if (activeCategories.length > 0) {
      // Keep category if valid for type, otherwise choose first
      const currentIsValid = activeCategories.some((c) => c.id === categoryId);
      if (!currentIsValid) {
        setCategoryId(activeCategories[0].id);
      }
    } else {
      setCategoryId('');
    }
  }, [type, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorWord('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorWord('Please enter a valid amount greater than 0.');
      return;
    }

    if (!categoryId) {
      setErrorWord('Please select a category first.');
      return;
    }

    if (!date) {
      setErrorWord('Please select a date.');
      return;
    }

    onSave({
      id: transaction?.id,
      amount: parsedAmount,
      type,
      categoryId,
      note: note.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)} draft`,
      date,
    });
    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl transition-all p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${transaction ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
              {transaction ? <Edit2 size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white">
                {transaction ? 'Edit Transaction' : 'Quick Add'}
              </h2>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                {transaction ? 'Make adjustments to your ledger entry' : 'Track your financial movements in real-time'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Segmented Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Transaction Type
            </label>
            <div className="flex p-1 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                onClick={() => setType('income')}
              >
                Income
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Amount Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-semibold text-base">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-950 font-semibold border border-slate-200 dark:border-slate-800 focus:border-emerald-550 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950/50 rounded-2xl outline-none text-slate-900 dark:text-white transition-all text-base"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Date
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550">
                  <Calendar size={18} />
                </span>
                <input
                  type="date"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950/50 rounded-2xl outline-none text-slate-900 dark:text-white transition-all text-sm"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950/50 rounded-2xl outline-none text-slate-900 dark:text-white transition-all text-sm appearance-none"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>Select category</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Memo Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Note & Description
            </label>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950/50 rounded-2xl outline-none text-slate-900 dark:text-white transition-all text-sm h-20 resize-none"
              placeholder="Rent check, supermarket, project payroll memo..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Error Alert Box */}
          {errorWord && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-400 text-xs">
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>{errorWord}</span>
            </div>
          )}

          {/* Buttons Row */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              className="flex-1 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-98 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 transition-all font-semibold"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 text-sm text-white font-semibold active:scale-98 rounded-2xl shadow-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-200 dark:shadow-rose-900/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200 dark:shadow-emerald-900/20'
              }`}
            >
              {transaction ? 'Save Changes' : 'Record Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
