/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Category, TransactionType } from '../types';
import { X, Plus, Edit2, Info } from 'lucide-react';
import LucideIcon from './LucideIcon';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cat: Omit<Category, 'id'> & { id?: string }) => void;
  category: Category | null;
}

const AVAILABLE_ICONS = [
  'Briefcase', 'Laptop', 'TrendingUp', 'Home', 'ShoppingCart', 
  'Zap', 'Coffee', 'Car', 'Play', 'HeartPulse', 'BookOpen', 
  'Gift', 'PiggyBank', 'BadgeAlert', 'Sparkles', 'User'
];

const AVAILABLE_COLORS = [
  { name: 'emerald', class: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500' },
  { name: 'teal', class: 'teal', bg: 'bg-teal-500', text: 'text-teal-500' },
  { name: 'cyan', class: 'cyan', bg: 'bg-cyan-500', text: 'text-cyan-500' },
  { name: 'blue', class: 'blue', bg: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'indigo', class: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { name: 'purple', class: 'purple', bg: 'bg-purple-500', text: 'text-purple-500' },
  { name: 'violet', class: 'violet', bg: 'bg-violet-500', text: 'text-violet-500' },
  { name: 'pink', class: 'pink', bg: 'bg-pink-500', text: 'text-pink-500' },
  { name: 'rose', class: 'rose', bg: 'bg-rose-500', text: 'text-rose-500' },
  { name: 'red', class: 'red', bg: 'bg-red-500', text: 'text-red-500' },
  { name: 'orange', class: 'orange', bg: 'bg-orange-500', text: 'text-orange-500' },
  { name: 'amber', class: 'amber', bg: 'bg-amber-500', text: 'text-amber-500' },
];

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
}: CategoryModalProps) {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [icon, setIcon] = useState<string>('Sparkles');
  const [color, setColor] = useState<string>('blue');
  const [errorText, setErrorText] = useState<string>('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setIcon(category.icon);
      setColor(category.color);
      setErrorText('');
    } else {
      setName('');
      setType('expense');
      setIcon('Sparkles');
      setColor('blue');
      setErrorText('');
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!name.trim()) {
      setErrorText('Please enter a category name.');
      return;
    }

    onSave({
      id: category?.id,
      name: name.trim(),
      type,
      icon,
      color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400`}>
              {category ? <Edit2 size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white">
                {category ? 'Edit Category' : 'Create Category'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize transactions with clean custom branding
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
          {/* Tag Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Category Title
            </label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="e.g. Gym, Subscriptions, Side-hustle"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl outline-none text-white transition-all text-sm font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Allocation Type toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Allocation Type
            </label>
            <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                onClick={() => setType('income')}
              >
                Income
              </button>
            </div>
          </div>

          {/* Vector Icon Preset Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Launcher Icon
            </label>
            <div className="grid grid-cols-8 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl max-h-32 overflow-y-auto">
              {AVAILABLE_ICONS.map((ico) => (
                <button
                  key={ico}
                  type="button"
                  title={ico}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                    icon === ico
                      ? 'bg-emerald-600 text-white scale-110 shadow-md'
                      : 'hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  onClick={() => setIcon(ico)}
                >
                  <LucideIcon name={ico} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Color Pallettes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Color Accent Badge
            </label>
            <div className="grid grid-cols-6 gap-2.5 p-3 bg-slate-950 border border-slate-805 rounded-2xl">
              {AVAILABLE_COLORS.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  className={`w-full h-8 rounded-xl relative transition-all flex items-center justify-center ${col.bg} ${
                    color === col.class
                      ? 'ring-4 ring-emerald-500/25 dark:ring-emerald-500/40 scale-105 shadow-sm'
                      : 'opacity-80 hover:opacity-100 hover:scale-102'
                  }`}
                  onClick={() => setColor(col.class)}
                  title={col.name}
                >
                  {color === col.class && (
                    <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error Feedbacks */}
          {errorText && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-400 text-xs">
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              className="flex-1 py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700/50 transition-all"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-sm text-white font-semibold rounded-2xl shadow-lg bg-emerald-600 hover:bg-emerald-555 shadow-emerald-200 dark:shadow-emerald-900/10 hover:bg-emerald-500 transition-all font-semibold"
            >
              {category ? 'Save Changes' : 'Build Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
