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
  userId?: string;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note: string;
  date: string; // YYYY-MM-DD format
  userId?: string;
  createdAt?: string;
  currency?: string; // Optional field for multi-currency logging
  convertedAmount?: number; // Amount stored in baseCurrency
}

export interface User {
  email: string;
  name: string;
  isAuthenticated: boolean;
  uid?: string;
  baseCurrency?: string; // 'USD', 'EUR', 'GBP', 'INR', 'JPY', etc.
}

export interface TripExpense {
  id: string;
  name: string;
  amount: number; // in trip currency
  currency: string;
  categoryId: string;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number; // overall budget ceiling
  currency: string;
  notes?: string;
  expenses: TripExpense[];
  userId: string;
  createdAt: string;
  lat?: number;
  lon?: number;
  countryCode?: string;
}

export type ViewType = 'dashboard' | 'transactions' | 'categories' | 'profile' | 'settings' | 'trips' | 'currency';
export type AuthView = 'login' | 'register' | 'forgot';
