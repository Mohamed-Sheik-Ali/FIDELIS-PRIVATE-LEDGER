/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CurrencyDetails {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = X Currency
}

// Baseline exchange rates (relative to USD)
export const SUPPORTED_CURRENCIES: Record<string, CurrencyDetails> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'Great British Pound', rateToUSD: 0.79 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 83.35 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 157.10 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 1.36 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 1.51 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToUSD: 0.91 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 1.35 },
};

// Tracks the date the rates were last updated (i.e. the current day value)
export let ratesLastUpdated: string = new Date().toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

/**
 * Fetch the latest real-time currency rates from the ECB rates API
 */
export async function fetchLatestRates(): Promise<boolean> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) {
      throw new Error('Exchange rates API returned non-ok response');
    }
    const data = await response.json();
    if (data && data.rates) {
      Object.keys(SUPPORTED_CURRENCIES).forEach((code) => {
        if (data.rates[code] !== undefined) {
          SUPPORTED_CURRENCIES[code].rateToUSD = Number(data.rates[code]);
        }
      });
      if (data.time_last_update_unix) {
        ratesLastUpdated = new Date(data.time_last_update_unix * 1000).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } else {
        ratesLastUpdated = new Date().toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return true;
    }
  } catch (error) {
    console.error('Error fetching dynamic live currency rates:', error);
  }
  return false;
}

/**
 * Convert value from source currency to target currency
 */
export function convertCurrency(amount: number, from: string, to: string): number {
  const fromCurrency = SUPPORTED_CURRENCIES[from] || SUPPORTED_CURRENCIES.USD;
  const toCurrency = SUPPORTED_CURRENCIES[to] || SUPPORTED_CURRENCIES.USD;

  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromCurrency.rateToUSD;
  return amountInUSD * toCurrency.rateToUSD;
}

/**
 * Format currency nicely with appropriate symbol
 */
export function formatCurrencyValue(amount: number, currencyCode: string = 'USD'): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  
  // Custom elegant formatting
  return `${currency.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
