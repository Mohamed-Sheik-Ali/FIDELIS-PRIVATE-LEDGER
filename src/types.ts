/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string; // Lucide icon name
  color: string; // Tailwind bg color class
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note: string;
  date: string; // YYYY-MM-DD format
}

export interface User {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

export type ViewType = 'dashboard' | 'transactions' | 'categories' | 'profile' | 'settings';
export type AuthView = 'login' | 'register' | 'forgot';
