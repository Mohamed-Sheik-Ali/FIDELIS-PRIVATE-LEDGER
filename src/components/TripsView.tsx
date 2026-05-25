/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trip, TripExpense, Category, Transaction, User } from '../types';
import { SUPPORTED_CURRENCIES, convertCurrency, formatCurrencyValue } from '../services/currencyService';
import { Plane, Calendar, MapPin, Plus, Trash2, AlertTriangle, CheckCircle2, DollarSign, Sparkles, HelpCircle, ArrowRight, Save, Search, Loader2, Compass } from 'lucide-react';

interface TripsViewProps {
  trips: Trip[];
  categories: Category[];
  transactions: Transaction[];
  user: User;
  onSaveTrip: (trip: Omit<Trip, 'id'> & { id?: string }) => void;
  onDeleteTrip: (id: string) => void;
  onPostTripToLedger: (expense: TripExpense, trip: Trip) => void;
}

export default function TripsView({
  trips,
  categories,
  transactions,
  user,
  onSaveTrip,
  onDeleteTrip,
  onPostTripToLedger,
}: TripsViewProps) {
  const baseCurrency = user.baseCurrency || 'USD';
  
  // View mode management
  const [selectedTripId, setSelectedTripId] = useState<string | null>(trips[0]?.id || null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // New Trip form state
  const [destination, setDestination] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [budget, setBudget] = useState<number>(1500);
  const [tripCurrency, setTripCurrency] = useState<string>(baseCurrency);
  const [notes, setNotes] = useState<string>('');

  // Geographic Location API and details state
  const [selectedLat, setSelectedLat] = useState<number | undefined>(undefined);
  const [selectedLon, setSelectedLon] = useState<number | undefined>(undefined);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | undefined>(undefined);
  const [geoSuggestions, setGeoSuggestions] = useState<any[]>([]);
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedFromSuggestions, setSelectedFromSuggestions] = useState<boolean>(false);

  // Currency utility mapper for countries mapped to base/major currencies
  const mapCountryToCurrency = (countryCode?: string): string | null => {
    if (!countryCode) return null;
    const cc = countryCode.toLowerCase();
    
    // Eurozone countries mapping
    const eurozone = [
      'at', 'be', 'cy', 'ee', 'fi', 'fr', 'de', 'gr', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pt', 'sk', 'si', 'es',
      'ad', 'mc', 'sm', 'va', 'me', 'xk'
    ];
    if (eurozone.includes(cc)) return 'EUR';
    
    switch (cc) {
      case 'us': return 'USD';
      case 'gb': return 'GBP';
      case 'in': return 'INR';
      case 'jp': return 'JPY';
      case 'ca': return 'CAD';
      case 'au': return 'AUD';
      case 'ch': return 'CHF';
      case 'sg': return 'SGD';
      default: return null;
    }
  };

  // Perform debounced live search against Nominatim Keyless Geocode API
  useEffect(() => {
    if (destination.trim().length < 3 || selectedFromSuggestions) {
      setGeoSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delay = setTimeout(async () => {
      setIsLoadingGeo(true);
      try {
        const query = destination.trim();
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en'
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          setGeoSuggestions(data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Error in OSM Nominatim query:', err);
      } finally {
        setIsLoadingGeo(false);
      }
    }, 550);

    return () => clearTimeout(delay);
  }, [destination, selectedFromSuggestions]);

  // Click suggestion from autocompletion panel
  const handleSelectSuggestion = (suggestion: any) => {
    setDestination(suggestion.display_name);
    setSelectedLat(suggestion.lat ? Number(suggestion.lat) : undefined);
    setSelectedLon(suggestion.lon ? Number(suggestion.lon) : undefined);
    
    const cc = suggestion.address?.country_code || undefined;
    setSelectedCountryCode(cc);
    
    // Auto preset trip currency based on location detection
    const matchedCurr = mapCountryToCurrency(cc);
    if (matchedCurr) {
      setTripCurrency(matchedCurr);
    }

    setSelectedFromSuggestions(true);
    setGeoSuggestions([]);
    setShowSuggestions(false);
  };

  // Individual Expense Item form state
  const [expenseName, setExpenseName] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState<string>(categories[0]?.id || 'cat-exp-1');

  // Currently selected trip helper
  const activeTrip = trips.find(t => t.id === selectedTripId);

  // Calculate Net Assets
  const totalIncomeValue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, tx) => sum + (tx.convertedAmount !== undefined ? tx.convertedAmount : tx.amount), 0);

  const totalExpenseValue = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, tx) => sum + (tx.convertedAmount !== undefined ? tx.convertedAmount : tx.amount), 0);

  const currentNetAssets = totalIncomeValue - totalExpenseValue;

  // Compute stats of active trip
  const totalPlannedInTripCurrency = activeTrip?.expenses.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const totalPlannedInBaseCurrency = activeTrip?.expenses.reduce((sum, exp) => {
    return sum + convertCurrency(exp.amount, activeTrip.currency, baseCurrency);
  }, 0) || 0;

  const tripBudgetInBaseCurrency = activeTrip ? convertCurrency(activeTrip.budget, activeTrip.currency, baseCurrency) : 0;
  const projectedAssetsAfterFullBudget = currentNetAssets - tripBudgetInBaseCurrency;
  const projectedAssetsAfterPlannedExpenses = currentNetAssets - totalPlannedInBaseCurrency;

  const budgetUsagePercent = activeTrip ? Math.min(100, Math.round((totalPlannedInTripCurrency / activeTrip.budget) * 100)) : 0;

  // Create Trip submit
  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    onSaveTrip({
      destination: destination.trim(),
      startDate,
      endDate,
      budget: Number(budget),
      currency: tripCurrency,
      notes: notes.trim(),
      expenses: [],
      userId: user.uid || '',
      createdAt: new Date().toISOString(),
      lat: selectedLat,
      lon: selectedLon,
      countryCode: selectedCountryCode
    });

    // Reset fields
    setDestination('');
    setBudget(1000);
    setNotes('');
    setSelectedLat(undefined);
    setSelectedLon(undefined);
    setSelectedCountryCode(undefined);
    setSelectedFromSuggestions(false);
    setIsCreating(false);
  };

  // Add sub-expense to active trip
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || !expenseName.trim() || expenseAmount <= 0) return;

    const newExpense: TripExpense = {
      id: `exp-${Date.now()}`,
      name: expenseName.trim(),
      amount: Number(expenseAmount),
      currency: activeTrip.currency,
      categoryId: expenseCategory
    };

    const updatedExpenses = [...activeTrip.expenses, newExpense];

    onSaveTrip({
      ...activeTrip,
      expenses: updatedExpenses
    });

    // Reset item input
    setExpenseName('');
    setExpenseAmount(0);
  };

  // Remove sub-expense from active trip
  const handleRemoveExpense = (expenseId: string) => {
    if (!activeTrip) return;

    const updatedExpenses = activeTrip.expenses.filter(e => e.id !== expenseId);
    onSaveTrip({
      ...activeTrip,
      expenses: updatedExpenses
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="trips-view-container">
      {/* SECTION HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-905 dark:text-white">
            Trip Portfolio & Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate trips, construct mock expense ledger lists, and preview asset depreciation instantly.
          </p>
        </div>

        <div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl tracking-wide transition-all shadow-md shadow-emerald-500/10 cursor-pointer active:scale-98"
            >
              <Plus size={15} />
              <span>Draft New Trip</span>
            </button>
          )}
        </div>
      </div>

      {/* RENDER DRAFTING MODAL / FORM INLINE IF CREATING */}
      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md max-w-2xl mx-auto space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plane size={16} className="text-emerald-500" />
              <span>Drafting Travel Objective</span>
            </h2>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-slate-650 font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2 relative">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex justify-between items-center">
                  <span>Destination / Name</span>
                  {selectedLat && selectedLon && (
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded-sm flex items-center gap-1 select-none">
                      <Compass size={10} className="animate-pulse" /> Geolocated
                    </span>
                  )}
                </label>
                <div className="relative">
                  {isLoadingGeo ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" size={14} />
                  ) : (
                    <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 ${selectedLat ? 'text-emerald-500' : 'text-slate-400'}`} size={14} />
                  )}
                  <input
                    type="text"
                    required
                    placeholder="Search locations (e.g., Paris, Tokyo, Grand Canyon)..."
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setSelectedFromSuggestions(false);
                      if (e.target.value.trim() === '') {
                        setSelectedLat(undefined);
                        setSelectedLon(undefined);
                        setSelectedCountryCode(undefined);
                      }
                    }}
                    className="w-full pl-9 pr-16 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                  {destination && (
                    <button
                      type="button"
                      onClick={() => {
                        setDestination('');
                        setSelectedLat(undefined);
                        setSelectedLon(undefined);
                        setSelectedCountryCode(undefined);
                        setSelectedFromSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 hover:text-slate-200 px-1 py-0.5 bg-slate-800 hover:bg-slate-750 rounded-md transition-all select-none"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Autocomplete list dropdown overlay */}
                {showSuggestions && geoSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto divide-y divide-slate-800">
                    {geoSuggestions.map((suggestion) => {
                      const flagUrl = suggestion.address?.country_code 
                        ? `https://flagcdn.com/w40/${suggestion.address.country_code.toLowerCase()}.png`
                        : null;
                      
                      return (
                        <button
                          key={suggestion.place_id || `${suggestion.lat}-${suggestion.lon}`}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-between gap-3 text-ellipsis overflow-hidden"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Compass size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">{suggestion.display_name}</span>
                          </div>
                          {flagUrl && (
                            <img
                              src={flagUrl}
                              alt=""
                              className="w-5 h-3.5 object-cover rounded-xs shrink-0 border border-slate-200/50 dark:border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {showSuggestions && geoSuggestions.length === 0 && destination.trim().length >= 3 && !isLoadingGeo && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 p-4 text-center text-xs text-slate-400 font-semibold">
                    No coordinates match. Enter a custom travel destination...
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Budget Limit</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={budget}
                  onChange={(e) => setBudget(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-205 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Trip Currency</label>
                <select
                  value={tripCurrency}
                  onChange={(e) => setTripCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-255 dark:border-slate-800 rounded-xl text-xs font-semibold"
                >
                  {Object.values(SUPPORTED_CURRENCIES).map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol}) - {curr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Departure Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-205 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Return Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-205 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Trip Notes & Description</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Provide travel targets, flight booking references or outline basic plans here..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-205 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <Save size={14} />
              <span>Generate Travel Blueprint</span>
            </button>
          </form>
        </div>
      )}

      {/* RENDER TRIPS LIST & ACTIVE DETAILS SPLIT SCREEN */}
      {trips.length === 0 && !isCreating ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center max-w-lg mx-auto">
          <Plane className="w-10 h-10 text-emerald-500/40 animate-pulse stroke-[1.5] mb-4" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No active trip blueprint found</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
            Configure simulated vacation bounds, plan flight or lodging estimates, and see the realistic asset impacts before checking out.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-5 px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white text-xs text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Create First Travel Blueprint
          </button>
        </div>
      ) : (
        !isCreating && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* LEFT COLUMN: Blueprint Selection list */}
            <div className="col-span-1 lg:col-span-4 space-y-3">
              <h3 className="text-[10px] uppercase font-extrabold text-slate-450 dark:text-slate-400 tracking-wider">
                Travel Blueprints ({trips.length})
              </h3>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {trips.map((trip) => {
                  const isSelected = trip.id === selectedTripId;
                  const durationDays = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86450000);
                  const expSum = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

                  return (
                    <button
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`w-full p-4 border text-left rounded-2xl transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/10'
                          : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 select-none">
                            {trip.countryCode && (
                              <img 
                                src={`https://flagcdn.com/w40/${trip.countryCode.toLowerCase()}.png`}
                                alt={trip.countryCode}
                                className="w-4 h-2.5 rounded-xs object-cover shrink-0 border border-slate-800"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <p className="text-xs font-bold text-white leading-tight truncate">
                              {trip.destination}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-1.5 font-semibold">
                            <span className="flex items-center gap-0.5">
                              <Calendar size={10} />
                              {trip.startDate}
                            </span>
                            <span>•</span>
                            <span>{durationDays} Days</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold bg-slate-955 px-2 py-1 rounded-md text-slate-300">
                          {trip.currency}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Expense Progress</p>
                          <p className="text-[11px] font-black text-white mt-0.5">
                            {formatCurrencyValue(expSum, trip.currency)} <span className="text-[9px] text-slate-400 font-medium">/ {formatCurrencyValue(trip.budget, trip.currency)}</span>
                          </p>
                        </div>

                        <div className="w-12 h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${Math.min(100, Math.round((expSum / trip.budget) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Selective Details and Live Asset Impact */}
            <div className="col-span-1 lg:col-span-8">
              {activeTrip ? (
                <div className="space-y-6">
                  {/* DETAIL BOX */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-start pb-4 border-b border-slate-50 dark:border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {activeTrip.countryCode && (
                            <img 
                              src={`https://flagcdn.com/w40/${activeTrip.countryCode.toLowerCase()}.png`}
                              alt={activeTrip.countryCode}
                              className="w-5 h-3.5 rounded-xs object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">{activeTrip.destination}</h2>
                          <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 dark:bg-slate-950 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                            Itinerary Workspace
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                          Itinerary window: {activeTrip.startDate} to {activeTrip.endDate} 
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          onDeleteTrip(activeTrip.id);
                          setSelectedTripId(trips[0]?.id || null);
                        }}
                        className="p-1.5 border border-slate-100 dark:border-slate-800/80 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-500/5 transition-all cursor-pointer"
                        title="Delete Blueprint"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* DYNAMIC MAP AND GEOLOCATION PANEL */}
                    {activeTrip.lat && activeTrip.lon && (
                      <div className="rounded-2xl border border-slate-100/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Compass size={12} className="text-emerald-500 animate-spin-slow" />
                            <span>Geographic Coordinates</span>
                          </div>
                          <a 
                            href={`https://www.openstreetmap.org/?mlat=${activeTrip.lat}&mlon=${activeTrip.lon}#map=14/${activeTrip.lat}/${activeTrip.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-505 dark:hover:text-emerald-300 font-bold hover:underline"
                          >
                            Explore OSM Map ↗
                          </a>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Latitude</span>
                            <span className="text-xs font-mono font-bold text-slate-300">{activeTrip.lat.toFixed(5)}</span>
                          </div>
                          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Longitude</span>
                            <span className="text-xs font-mono font-bold text-slate-300">{activeTrip.lon.toFixed(5)}</span>
                          </div>
                          {activeTrip.countryCode && (
                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between col-span-2 sm:col-span-1">
                              <div>
                                <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Country ISO</span>
                                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-350 uppercase">{activeTrip.countryCode}</span>
                              </div>
                              <img 
                                src={`https://flagcdn.com/w40/${activeTrip.countryCode.toLowerCase()}.png`}
                                alt={activeTrip.countryCode}
                                className="w-6 h-4 rounded-sm object-cover border border-slate-200/50 dark:border-slate-800 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                        </div>

                        {/* OSM Embed */}
                        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200/40 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            title="Interactive Location Preview Map"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeTrip.lon - 0.08}%2C${activeTrip.lat - 0.04}%2C${activeTrip.lon + 0.08}%2C${activeTrip.lat + 0.04}&layer=mapnik&marker=${activeTrip.lat}%2C${activeTrip.lon}`}
                            className="opacity-90 dark:opacity-75 transition-opacity"
                          />
                        </div>
                      </div>
                    )}

                    {/* NET ASSET IMPACT COMPONENT */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 p-5 rounded-2xl space-y-4" id="net-asset-impact-widget">
                      <div>
                        <h4 className="text-[10px] font-extrabold uppercase text-slate-450 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                          <Sparkles size={11} className="text-emerald-500" />
                          <span>Ledger & Liquid Net Assets Projection</span>
                        </h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">Understanding exactly how this travel catalog depresses your static capital reserves.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Current reserves */}
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                          <p className="text-[8px] text-slate-400 font-extrabold uppercase">Current Net Assets</p>
                          <p className="text-sm font-black text-white">
                            {formatCurrencyValue(currentNetAssets, baseCurrency)}
                          </p>
                          <p className="text-[8px] text-slate-400">Ledger balance anchor</p>
                        </div>

                        {/* Impact after planned expenses */}
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                          <p className="text-[8px] text-indigo-400 font-extrabold uppercase">Asset Margin after Plans</p>
                          <p className={`text-sm font-black ${projectedAssetsAfterPlannedExpenses >= 0 ? 'text-indigo-400' : 'text-rose-500'}`}>
                            {formatCurrencyValue(projectedAssetsAfterPlannedExpenses, baseCurrency)}
                          </p>
                          <p className="text-[8px] text-slate-400">
                            Impact: -{formatCurrencyValue(totalPlannedInBaseCurrency, baseCurrency)}
                          </p>
                        </div>

                        {/* Impact after full budget ceiling */}
                        <div className="p-3 bg-slate-955 border border-slate-800 rounded-xl space-y-1">
                          <p className="text-[8px] text-slate-400 font-extrabold uppercase">If Full Budget Realized</p>
                          <p className={`text-sm font-black ${projectedAssetsAfterFullBudget >= 0 ? 'text-slate-700 dark:text-slate-300' : 'text-rose-500'}`}>
                            {formatCurrencyValue(projectedAssetsAfterFullBudget, baseCurrency)}
                          </p>
                          <p className="text-[8px] text-slate-400">
                            Ceiling: -{formatCurrencyValue(tripBudgetInBaseCurrency, baseCurrency)}
                          </p>
                        </div>
                      </div>

                      {/* Visual depreciation bridge */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Portfolio Leverage Impact</span>
                          <span>
                            {currentNetAssets > 0 
                              ? `${((totalPlannedInBaseCurrency / currentNetAssets) * 100).toFixed(1)}% of your capital used` 
                              : 'Insufficient initial ledger capital'}
                          </span>
                        </div>

                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-indigo-500 h-full transition-all" 
                            style={{ 
                              width: `${currentNetAssets > 0 ? Math.min(100, (totalPlannedInBaseCurrency / currentNetAssets) * 100) : 100}%` 
                            }} 
                          />
                          <div className="bg-slate-350 dark:bg-slate-800 h-full flex-1" />
                        </div>

                        {projectedAssetsAfterPlannedExpenses < 0 ? (
                          <div className="flex items-center gap-1.5 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-[10px] font-semibold mt-2.5">
                            <AlertTriangle size={12} className="stroke-[2.5]" />
                            <span>High Warning: Planned trip expenses exceed total capital holdings. Liquidate other assets or reduce budget indices.</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-450 text-[10px] font-semibold mt-2.5">
                            <CheckCircle2 size={12} className="stroke-[2.5]" />
                            <span>Vault Check: Net financial impact remains safe. Projected liquid capital preserves comfortable padding.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BUDGET UTILIZATION & EXPENSE BLUEPRINT DOCK */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Active Budget Utilization</h3>
                          <p className="text-[9px] text-slate-400">How much of your trip limit you have accounted for</p>
                        </div>

                        <span className={`text-xs font-black uppercase ${
                          budgetUsagePercent > 90 ? 'text-rose-500' : budgetUsagePercent > 70 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {budgetUsagePercent}% Used
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-3 bg-slate-50 dark:bg-slate-950 border border-slate-201/50 dark:border-slate-850 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            budgetUsagePercent > 90 
                              ? 'bg-rose-500' 
                              : budgetUsagePercent > 70 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${budgetUsagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* ADD INDIVIDUAL EXPENSE ITEM COMPACT INLINE FORM */}
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850 rounded-2xl space-y-3">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-450 dark:text-slate-400 tracking-wider">
                        Add Planned Trip Expenditure
                      </h4>

                      <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-4 space-y-1">
                          <label className="text-[9px] font-bold text-slate-400">Expense Label / Item</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Flight to Rome, Hotel nights"
                            value={expenseName}
                            onChange={(e) => setExpenseName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[9px] font-bold text-slate-400">Value ({activeTrip.currency})</label>
                          <input
                            type="number"
                            required
                            min={0.01}
                            step={0.01}
                            placeholder="Amount"
                            value={expenseAmount || ''}
                            onChange={(e) => setExpenseAmount(Math.max(0, Number(e.target.value)))}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[9px] font-bold text-slate-400">Ledger Category Mapping</label>
                          <select
                            value={expenseCategory}
                            onChange={(e) => setExpenseCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold"
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <button
                            type="submit"
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Add Plan
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* LIST OF CURRENT PLANNED TRIP EXPENSES */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-450 dark:text-slate-400 tracking-wider">
                        Planned Expenditure Ledger ({activeTrip.expenses.length})
                      </h4>

                      {activeTrip.expenses.length === 0 ? (
                        <div className="p-5 text-center text-[11px] text-slate-400 bg-slate-50/20 dark:bg-slate-950/10 border border-dashed border-slate-100 dark:border-slate-850 rounded-2xl">
                          Your draft planned expense index is empty. Complete form elements above to list transport, boarding, or culinary plans.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {activeTrip.expenses.map((exp) => {
                            const mapCat = categories.find(c => c.id === exp.categoryId);
                            return (
                              <div
                                key={exp.id}
                                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4 group hover:bg-slate-900 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                  <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-white">{exp.name}</p>
                                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                                      <span className="font-semibold text-slate-500 dark:text-slate-350">{mapCat?.name || 'General Expense'}</span>
                                      {baseCurrency !== activeTrip.currency && (
                                        <>
                                          <span>•</span>
                                          <span>Converts to: {formatCurrencyValue(convertCurrency(exp.amount, activeTrip.currency, baseCurrency), baseCurrency)}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                    {formatCurrencyValue(exp.amount, activeTrip.currency)}
                                  </span>

                                  {/* Action 1: Post to Real Transactions Ledger */}
                                  <button
                                    onClick={() => onPostTripToLedger(exp, activeTrip)}
                                    className="px-2 py-1 bg-emerald-500/5 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100 relative"
                                    title="Post to real finance ledger"
                                  >
                                    Post Ledger
                                  </button>

                                  {/* Action 2: Trash */}
                                  <button
                                    onClick={() => handleRemoveExpense(exp.id)}
                                    className="p-1 hover:bg-rose-500/5 text-slate-350 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                    title="Exclude planned expense"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
                  Select a Travel Blueprint document from the sidebar left to inspect statistics or append planning items.
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
