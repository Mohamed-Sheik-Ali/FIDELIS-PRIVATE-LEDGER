/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Transaction, Category, ViewType, Trip, TripExpense } from './types';
import { DEFAULT_CATEGORIES } from './services/financeService';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './services/firebase';

// Layout / Pages / View imports
import AuthContainer from './components/AuthContainer';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import CategoriesView from './components/CategoriesView';
import SettingsView from './components/SettingsView';
import CurrencyView from './components/CurrencyView';
import TripsView from './components/TripsView';

// Overlay Components
import TransactionModal from './components/TransactionModal';
import CategoryModal from './components/CategoryModal';
import ThemeToggle from './components/ThemeToggle';
import LucideIcon from './components/LucideIcon';
import { useLanguage } from './services/languageService';

// Standard Lucide icons supporting structural navigation
import { LayoutDashboard, Compass, Settings, LogOut, Bell, Plus, Check, Info, AlertTriangle, Menu, X, ArrowUpRight, ArrowDownLeft, Plane, Coins } from 'lucide-react';

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  // Authentication & Session state
  const [user, setUser] = useState<User | null>(null);

  // Database Ledger states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  // Navigation tab states
  const [activeTab, setActiveTab] = useState<ViewType>('dashboard');

  // Modal Control states
  const [isTxOpen, setIsTxOpen] = useState<boolean>(false);
  const [isCatOpen, setIsCatOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Deletion locks warnings
  const [catDeleteError, setCatDeleteError] = useState<string | null>(null);

  // Toast States
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Mobile drawer utility controls
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Trigger auto-fading toast alerts
  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  };

  // Enforce dark mode on mount
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('fin_theme', 'dark');
  }, []);

  // Track Firebase authenticated state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        let name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
        let bCurr = 'USD';
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            name = userSnap.data().name || name;
            bCurr = userSnap.data().baseCurrency || 'USD';
          }
        } catch (e) {
          console.error("Error fetching profile", e);
        }
        setUser({
          email: firebaseUser.email || '',
          name,
          isAuthenticated: true,
          uid: firebaseUser.uid,
          baseCurrency: bCurr
        });
      } else {
        setUser(null);
        setCategories([]);
        setTransactions([]);
        setTrips([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore real-time collections
  useEffect(() => {
    if (!user || !user.uid) return;

    // Real-time listener for user categories
    const unsubscribeCategories = onSnapshot(
      collection(db, 'users', user.uid, 'categories'),
      (snapshot) => {
        const catsList: Category[] = [];
        snapshot.forEach((docSnap) => {
          catsList.push(docSnap.data() as Category);
        });
        setCategories(catsList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user?.uid}/categories`);
      }
    );

    // Real-time listener for user transactions
    const unsubscribeTransactions = onSnapshot(
      collection(db, 'users', user.uid, 'transactions'),
      (snapshot) => {
        const txsList: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          txsList.push(docSnap.data() as Transaction);
        });
        // Sort local view chronologically descending
        txsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(txsList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user?.uid}/transactions`);
      }
    );

    // Real-time listener for user trips
    const unsubscribeTrips = onSnapshot(
      collection(db, 'users', user.uid, 'trips'),
      (snapshot) => {
        const tripsList: Trip[] = [];
        snapshot.forEach((docSnap) => {
          tripsList.push(docSnap.data() as Trip);
        });
        setTrips(tripsList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user?.uid}/trips`);
      }
    );

    return () => {
      unsubscribeCategories();
      unsubscribeTransactions();
      unsubscribeTrips();
    };
  }, [user]);

  // Login handler
  const handleLogin = (authenticatedUser: User) => {
    // Note: States will be updated reactively via Auth listeners
    showToast(`Successfully unlocked Capital Vault! Welcome, ${authenticatedUser.name}.`, 'success');
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActiveTab('dashboard');
      showToast('Secure vault locked successfully. Session closed.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Secure vault de-authorization failed.', 'error');
    }
  };

  // Profile Update handler
  const handleUpdateUser = async (updated: User) => {
    if (!user || !user.uid) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: updated.email,
        name: updated.name
      }, { merge: true });
      showToast('Vault keys updated with updated preferences!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to sync updated preferences to cloud ledger.', 'error');
    }
  };

  // Reset database showcase
  const handleResetDatabase = async () => {
    if (!user || !user.uid) return;
    try {
      showToast('Resetting capital database baseline...', 'info');
      // Delete all current transactions
      for (const tx of transactions) {
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', tx.id));
      }
      // Delete all current categories
      for (const cat of categories) {
        await deleteDoc(doc(db, 'users', user.uid, 'categories', cat.id));
      }
      // Re-seed original default starting categories
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'users', user.uid, 'categories', cat.id), {
          id: cat.id,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      }
      showToast('Database reset to baseline catalog entries.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to reset database baseline entries.', 'error');
    }
  };

  // ==================== TRANSACTION CRUD OPERATIONS ====================
  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsTxOpen(true);
  };

  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxOpen(true);
  };

  const handleSaveTx = async (txData: Omit<Transaction, 'id'> & { id?: string; currency?: string }) => {
    if (!user || !user.uid) return;
    try {
      const txId = txData.id || `tx-${Date.now()}`;
      await setDoc(doc(db, 'users', user.uid, 'transactions', txId), {
        id: txId,
        amount: Number(txData.amount),
        type: txData.type,
        categoryId: txData.categoryId,
        note: txData.note || '',
        date: txData.date,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        currency: txData.currency || user.baseCurrency || 'USD'
      });

      if (txData.id) {
        showToast('Ledger entry updated successfully.', 'success');
      } else {
        showToast(`Recorded dynamic ${txData.type} of $${Number(txData.amount).toFixed(2)} in ledger.`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Permission denied. Cannot write transaction.', 'error');
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (!user || !user.uid) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      showToast('Ledger entry deleted permanently.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete transaction entry.', 'error');
    }
  };

  // ==================== CATEGORY CRUD OPERATIONS ====================
  const handleOpenAddCat = () => {
    setEditingCat(null);
    setIsCatOpen(true);
  };

  const handleOpenEditCat = (cat: Category) => {
    setEditingCat(cat);
    setIsCatOpen(true);
  };

  const handleSaveCat = async (catData: Omit<Category, 'id'> & { id?: string }) => {
    if (!user || !user.uid) return;
    try {
      const catId = catData.id || `cat-${Date.now()}`;
      await setDoc(doc(db, 'users', user.uid, 'categories', catId), {
        id: catId,
        name: catData.name,
        type: catData.type,
        icon: catData.icon,
        color: catData.color,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      showToast(`Category "${catData.name}" created and styled successfully.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save category information.', 'error');
    }
  };

  const handleDeleteCat = async (id: string) => {
    if (!user || !user.uid) return;
    setCatDeleteError(null);
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    // Lock condition checking (categories that contain active log entries cannot be deleted)
    const isInUse = transactions.some((t) => t.categoryId === id);
    if (isInUse) {
      setCatDeleteError(`Category "${cat.name}" is locked. There are existing transactions linked to it in your ledger.`);
      showToast('Deactivation rejected. Inspect locked warning blocks.', 'error');
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'categories', id));
      showToast(`Category "${cat.name}" removed securely.`, 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete category.', 'error');
    }
  };

  // ==================== BASE CURRENCY OPERATIONS ====================
  const handleUpdateBaseCurrency = async (newBase: string) => {
    if (!user || !user.uid) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        baseCurrency: newBase
      }, { merge: true });

      setUser(prev => prev ? { ...prev, baseCurrency: newBase } : null);
      showToast(`Base portfolio currency migrated to ${newBase} successfully!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not register base currency change.', 'error');
    }
  };

  // ==================== TRIP PLANNER CRUD OPERATIONS ====================
  const handleSaveTrip = async (tripInput: Omit<Trip, 'id'> & { id?: string }) => {
    if (!user || !user.uid) return;
    try {
      const tripId = tripInput.id || `trip-${Date.now()}`;
      const tripRef = doc(db, 'users', user.uid, 'trips', tripId);
      const tripToSave: Trip = {
        ...tripInput,
        id: tripId,
        userId: user.uid,
        expenses: tripInput.expenses || [],
      };
      await setDoc(tripRef, tripToSave);
      showToast(tripInput.id ? 'Trip configuration updated.' : 'Adventure draft registered successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not register trip blueprint.', 'error');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!user || !user.uid) return;
    try {
      const tripRef = doc(db, 'users', user.uid, 'trips', tripId);
      await deleteDoc(tripRef);
      showToast('Adventure blueprint archived successfully.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to archive adventure blueprint.', 'error');
    }
  };

  const handlePostTripToLedger = async (expense: TripExpense, trip: Trip) => {
    if (!user || !user.uid) return;
    try {
      const categoryId = expense.categoryId || categories[0]?.id || 'cat-exp-1';
      const txId = `tx-${Date.now()}`;
      const txRef = doc(db, 'users', user.uid, 'transactions', txId);

      const txToSave = {
        id: txId,
        amount: expense.amount,
        type: 'expense',
        categoryId,
        note: `[${trip.destination}] ${expense.name}`,
        date: new Date().toISOString().split('T')[0],
        userId: user.uid,
        createdAt: new Date().toISOString(),
        currency: expense.currency || 'USD',
      };

      await setDoc(txRef, txToSave);
      showToast(`Successfully posted "${expense.name}" as live private transaction!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not post planned expense to ledger.', 'error');
    }
  };

  // If user is not logged in, render the Auth split-screen
  if (!user || !user.isAuthenticated) {
    return <AuthContainer onAuthenticate={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors">
      
      {/* Dynamic Floating Toast Alerts */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-55 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-320">
          <div className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 border ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-150 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-300' 
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-150 text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300'
              : 'bg-emerald-50 border-emerald-150 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-300'
          }`}>
            <span className={`p-1.5 rounded-lg ${
              toast.type === 'success' ? 'bg-emerald-500/10' : toast.type === 'error' ? 'bg-rose-500/10' : 'bg-emerald-500/10'
            }`}>
              {toast.type === 'success' && <Check size={16} />}
              {toast.type === 'error' && <AlertTriangle size={16} />}
              {toast.type === 'info' && <Info size={16} />}
            </span>
            <p className="text-xs font-semibold leading-relaxed select-all">
              {toast.msg}
            </p>
          </div>
        </div>
      )}

      {/* DESKTOP & TABLET SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 shadow-xs select-none relative z-10">
        <div className="space-y-8">
          {/* Logo Identity */}
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/fidelis_logo_1779728166630.png"
              alt="FIDELIS Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
            />
            <div>
              <p className="font-display font-bold text-slate-905 dark:text-white leading-tight">
                FIDELIS
              </p>
              <p className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-400 tracking-wider">
                {t('privateLedger')}
              </p>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
              { id: 'transactions', label: t('transactions'), icon: Compass },
              { id: 'trips', label: t('trips'), icon: Plane },
              { id: 'currency', label: t('currencies'), icon: Coins },
              { id: 'categories', label: t('categories'), icon: LucideIcon, special: 'Tag' },
              { id: 'settings', label: t('settings'), icon: Settings },
            ].map((tab) => {
              const IconComp = tab.special ? () => <LucideIcon name={tab.special!} size={18} /> : tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as ViewType);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50/70 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <IconComp className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User context panel */}
        <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/45 border border-slate-100/50 dark:border-slate-805">
            <div className="flex items-center gap-2.5">
              {/* Profile icon */}
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="max-w-[100px] truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">
                  {t('secureAccess')}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-slate-250/50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
              title={t('lockVault')}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

      </aside>

      {/* MOBILE HEADER (Upper bar with navigation menu trigger) */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/src/assets/images/fidelis_logo_1779728166630.png"
            alt="FIDELIS Logo"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-lg object-cover border border-emerald-500/20"
          />
          <span className="font-display font-bold text-slate-900 dark:text-white text-base tracking-tight leading-none">
            FIDELIS
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer outline-none focus:border-emerald-500"
          >
            <option value="en">EN</option>
            <option value="ta">தமிழ்</option>
            <option value="te">తెలుగు</option>
          </select>
          <ThemeToggle />
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border border-slate-205 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            title="Menu options"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* MOBILE POPUP SIDE MENU (When toggled via mobile hamburger) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] z-25 bg-white dark:bg-slate-950/95 backdrop-blur-sm p-6 flex flex-col justify-between">
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
              { id: 'transactions', label: t('transactions'), icon: Compass },
              { id: 'trips', label: t('trips'), icon: Plane },
              { id: 'currency', label: t('currencies'), icon: Coins },
              { id: 'categories', label: t('categories'), icon: LucideIcon, special: 'Tag' },
              { id: 'settings', label: t('settings'), icon: Settings },
            ].map((tab) => {
              const IconComp = tab.special ? () => <LucideIcon name={tab.special!} size={16} /> : tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as ViewType);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">{t('secureSandbox')}</p>
              </div>
            </div>
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>{t('lockVault')}</span>
            </button>
          </div>
        </div>
      )}

      {/* CORE VIEW MODULES SHELL */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto pb-28 md:pb-10 relative">
        
        {/* UPPER DESKTOP STATS BAR CONTROLS */}
        <div className="hidden md:flex justify-end items-center gap-3.5 mb-8 pb-5 border-b border-slate-100 dark:border-slate-800">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-350 px-2.5 py-1.5 rounded-xl text-xs font-semibold outline-hidden cursor-pointer hover:border-emerald-500 transition-all shadow-xs"
          >
            <option value="en">English (EN)</option>
            <option value="ta">தமிழ் (TA)</option>
            <option value="te">తెలుగు (TE)</option>
          </select>

          <ThemeToggle />
          
          <div className="p-2.2 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-550 rounded-xl relative cursor-pointer" title="Alert logs">
            <Bell size={18} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-2 right-2.5 animate-pulse" />
          </div>

          <div className="flex items-center gap-2.5 px-4.5 py-2.2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-550 dark:text-slate-400 font-medium">{t('vaultSynchronized')}</span>
          </div>
        </div>

        {/* Dynamic Inner views routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            categories={categories}
            onNavigate={setActiveTab}
            onOpenQuickAdd={handleOpenAddTx}
            userName={user.name}
            baseCurrency={user.baseCurrency || 'USD'}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            onEditTransaction={handleOpenEditTx}
            onDeleteTransaction={handleDeleteTx}
            onOpenQuickAdd={handleOpenAddTx}
            baseCurrency={user.baseCurrency || 'USD'}
          />
        )}

        {activeTab === 'trips' && (
          <TripsView
            trips={trips}
            categories={categories}
            transactions={transactions}
            user={user}
            onSaveTrip={handleSaveTrip}
            onDeleteTrip={handleDeleteTrip}
            onPostTripToLedger={handlePostTripToLedger}
          />
        )}

        {activeTab === 'currency' && (
          <CurrencyView
            user={user}
            onUpdateBaseCurrency={handleUpdateBaseCurrency}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            transactions={transactions}
            onAddCategory={handleOpenAddCat}
            onEditCategory={handleOpenEditCat}
            onDeleteCategory={handleDeleteCat}
            deleteError={catDeleteError}
            onClearDeleteError={() => setCatDeleteError(null)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            user={user}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onResetDatabase={handleResetDatabase}
          />
        )}

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 px-4 py-2.5 bottom-inset-safe flex items-center justify-around z-20 shadow-lg select-none">
        
        {/* Dashboard Home tab */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard size={18} className={activeTab === 'dashboard' ? 'scale-110 transition-transform' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t('home')}</span>
        </button>

        {/* Transactions Ledger tab */}
        <button
          onClick={() => {
            setActiveTab('transactions');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            activeTab === 'transactions' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Compass size={18} className={activeTab === 'transactions' ? 'scale-110 transition-transform' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t('ledger')}</span>
        </button>

        {/* Floating Quick Action Button (+) */}
        <button
          onClick={handleOpenAddTx}
          className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-555 transform -translate-y-3 shrink-0 cursor-pointer active:scale-95 transition-all"
          title="Floating Ledger Add"
        >
          <Plus size={22} className="stroke-[3]" />
        </button>

        {/* Categories tag labels tab */}
        <button
          onClick={() => {
            setActiveTab('categories');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            activeTab === 'categories' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}
        >
          <LucideIcon name="Tag" size={18} className={activeTab === 'categories' ? 'scale-110 transition-transform text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t('tags')}</span>
        </button>

        {/* Settings/Profile Preferences tab */}
        <button
          onClick={() => {
            setActiveTab('settings');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            activeTab === 'settings' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Settings size={18} className={activeTab === 'settings' ? 'scale-110 transition-transform' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t('settings')}</span>
        </button>

      </nav>

      {/* OVERLAY TRANSACTION AND CATEGORY MODALS TRIGGER PORTS */}
      <TransactionModal
        isOpen={isTxOpen}
        onClose={() => setIsTxOpen(false)}
        onSave={handleSaveTx}
        categories={categories}
        transaction={editingTx}
      />

      <CategoryModal
        isOpen={isCatOpen}
        onClose={() => setIsCatOpen(false)}
        onSave={handleSaveCat}
        category={editingCat}
      />

    </div>
  );
}
