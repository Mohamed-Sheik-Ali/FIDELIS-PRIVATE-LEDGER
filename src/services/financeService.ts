/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Transaction, User } from '../types';

// Standard mockup Categories
export const DEFAULT_CATEGORIES: Category[] = [
  // Income Categories
  { id: 'cat-inc-1', name: 'Salary', type: 'income', icon: 'Briefcase', color: 'emerald' },
  { id: 'cat-inc-2', name: 'Freelance', type: 'income', icon: 'Laptop', color: 'teal' },
  { id: 'cat-inc-3', name: 'Investments', type: 'income', icon: 'TrendingUp', color: 'cyan' },
  // Expense Categories
  { id: 'cat-exp-1', name: 'Housing & Rent', type: 'expense', icon: 'Home', color: 'blue' },
  { id: 'cat-exp-2', name: 'Groceries', type: 'expense', icon: 'ShoppingCart', color: 'amber' },
  { id: 'cat-exp-3', name: 'Utilities', type: 'expense', icon: 'Zap', color: 'purple' },
  { id: 'cat-exp-4', name: 'Dining Out', type: 'expense', icon: 'Coffee', color: 'rose' },
  { id: 'cat-exp-5', name: 'Transport', type: 'expense', icon: 'Car', color: 'indigo' },
  { id: 'cat-exp-6', name: 'Entertainment', type: 'expense', icon: 'Play', color: 'pink' },
  { id: 'cat-exp-7', name: 'Healthcare', type: 'expense', icon: 'HeartPulse', color: 'red' },
  { id: 'cat-exp-8', name: 'Education', type: 'expense', icon: 'BookOpen', color: 'violet' },
];

// Helper to get relative dates
const getPastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// Initial realistic Transactions
const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', amount: 4800, type: 'income', categoryId: 'cat-inc-1', note: 'Monthly Salary Payment', date: getPastDate(1) },
  { id: 'tx-2', amount: 120, type: 'expense', categoryId: 'cat-exp-2', note: 'Organic supermarket haul', date: getPastDate(2) },
  { id: 'tx-3', amount: 1210, type: 'expense', categoryId: 'cat-exp-1', note: 'May Apartment Rent', date: getPastDate(0) },
  { id: 'tx-4', amount: 85, type: 'expense', categoryId: 'cat-exp-4', note: 'Dinner with the team', date: getPastDate(3) },
  { id: 'tx-5', amount: 45, type: 'expense', categoryId: 'cat-exp-5', note: 'Fuel top-up', date: getPastDate(4) },
  { id: 'tx-6', amount: 750, type: 'income', categoryId: 'cat-inc-2', note: 'Website UI Redesign Project', date: getPastDate(5) },
  { id: 'tx-7', amount: 15.99, type: 'expense', categoryId: 'cat-exp-6', note: 'Streaming service premium', date: getPastDate(4) },
  { id: 'tx-8', amount: 95, type: 'expense', categoryId: 'cat-exp-3', note: 'Fiber Broadband Internet', date: getPastDate(6) },
  { id: 'tx-9', amount: 110, type: 'expense', categoryId: 'cat-exp-2', note: 'Weekly grocery list', date: getPastDate(8) },
  { id: 'tx-10', amount: 320, type: 'income', categoryId: 'cat-inc-3', note: 'Quarterly Stock Dividend', date: getPastDate(9) },
  { id: 'tx-11', amount: 250, type: 'expense', categoryId: 'cat-exp-7', note: 'Dental teeth cleaning checkup', date: getPastDate(10) },
  { id: 'tx-12', amount: 50, type: 'expense', categoryId: 'cat-exp-8', note: 'Online Udemy Bootcamp Course', date: getPastDate(12) },
];

export const financeService = {
  // Categories API
  getCategories(): Category[] {
    const data = localStorage.getItem('fin_categories');
    if (!data) {
      localStorage.setItem('fin_categories', JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  },

  saveCategory(category: Omit<Category, 'id'> & { id?: string }): Category {
    const categories = this.getCategories();
    if (category.id) {
      // Edit mode
      const index = categories.findIndex((c) => c.id === category.id);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...category } as Category;
      }
    } else {
      // Add mode
      const newCategory: Category = {
        ...category,
        id: `cat-${Date.now()}`,
      } as Category;
      categories.push(newCategory);
    }
    localStorage.setItem('fin_categories', JSON.stringify(categories));
    return category as Category;
  },

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const transactions = this.getTransactions();
    
    // Check if category is used in transactions
    const isInUse = transactions.some((t) => t.categoryId === id);
    if (isInUse) {
      return false; // Cannot delete category that is currently in use
    }

    const filtered = categories.filter((c) => c.id !== id);
    localStorage.setItem('fin_categories', JSON.stringify(filtered));
    return true;
  },

  // Transactions API
  getTransactions(): Transaction[] {
    const data = localStorage.getItem('fin_transactions');
    if (!data) {
      localStorage.setItem('fin_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(data);
  },

  saveTransaction(transaction: Omit<Transaction, 'id'> & { id?: string }): Transaction {
    const transactions = this.getTransactions();
    let savedTx: Transaction;
    if (transaction.id) {
      // Edit
      const index = transactions.findIndex((t) => t.id === transaction.id);
      if (index !== -1) {
        savedTx = { ...transactions[index], ...transaction } as Transaction;
        transactions[index] = savedTx;
      } else {
        savedTx = { ...transaction, id: `tx-${Date.now()}` } as Transaction;
        transactions.push(savedTx);
      }
    } else {
      // Add
      savedTx = {
        ...transaction,
        id: `tx-${Date.now()}`,
      } as Transaction;
      transactions.unshift(savedTx); // Add new ones on top
    }
    localStorage.setItem('fin_transactions', JSON.stringify(transactions));
    return savedTx;
  },

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    localStorage.setItem('fin_transactions', JSON.stringify(filtered));
  },

  // Auth Operations
  getUser(): User | null {
    const userStr = localStorage.getItem('fin_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  login(email: string, name?: string): User {
    const user: User = {
      email,
      name: name || email.split('@')[0],
      isAuthenticated: true,
    };
    localStorage.setItem('fin_user', JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem('fin_user');
  },

  // Reset to showcase defaults
  resetState(): void {
    localStorage.setItem('fin_categories', JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem('fin_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
  }
};
