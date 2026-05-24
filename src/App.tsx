/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Transaction, Category, ViewType } from './types';
import { financeService } from './services/financeService';

// Layout / Pages / View imports
import AuthContainer from './components/AuthContainer';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import CategoriesView from './components/CategoriesView';
import SettingsView from './components/SettingsView';

// Overlay Components
import TransactionModal from './components/TransactionModal';
import CategoryModal from './components/CategoryModal';
import ThemeToggle from './components/ThemeToggle';
import LucideIcon from './components/LucideIcon';

// Standard Lucide icons supporting structural navigation
import { LayoutDashboard, Compass, Settings, LogOut, Bell, Plus, Check, Info, AlertTriangle, Menu, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function App() {
  // Authentication & Session state
  const [user, setUser] = useState<User | null>(null);

  // Database Ledger states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

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

  // Initial Boot loader
  useEffect(() => {
    const activeUser = financeService.getUser();
    setUser(activeUser);

    const initialCategories = financeService.getCategories();
    const initialTransactions = financeService.getTransactions();
    
    setCategories(initialCategories);
    setTransactions(initialTransactions);
  }, []);

  // Sync state changes with storage APIs
  const refreshLedger = () => {
    setCategories(financeService.getCategories());
    setTransactions(financeService.getTransactions());
  };

  // Login handler
  const handleLogin = (authenticatedUser: User) => {
    const savedUser = financeService.login(authenticatedUser.email, authenticatedUser.name);
    setUser(savedUser);
    refreshLedger();
    showToast(`Successfully connected to secure cold vault! Welcome back, ${savedUser.name}.`, 'success');
  };

  // Logout handler
  const handleLogout = () => {
    financeService.logout();
    setUser(null);
    setActiveTab('dashboard');
    showToast('Secure treasury vault locked successfully.', 'info');
  };

  // Profile Update handler
  const handleUpdateUser = (updated: User) => {
    localStorage.setItem('fin_user', JSON.stringify(updated));
    setUser(updated);
    showToast('Vault keys updated with updated preferences!', 'success');
  };

  // Reset database showcase
  const handleResetDatabase = () => {
    financeService.resetState();
    refreshLedger();
    showToast('Database reset to baseline catalog entries.', 'info');
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

  const handleSaveTx = (txData: Omit<Transaction, 'id'> & { id?: string }) => {
    const saved = financeService.saveTransaction(txData);
    refreshLedger();
    if (txData.id) {
      showToast('Ledger entry updated successfully.', 'success');
    } else {
      showToast(`Recorded dynamic ${saved.type} of $${saved.amount.toFixed(2)} in ledger.`, 'success');
    }
  };

  const handleDeleteTx = (id: string) => {
    financeService.deleteTransaction(id);
    refreshLedger();
    showToast('Ledger entry deleted permanently.', 'info');
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

  const handleSaveCat = (catData: Omit<Category, 'id'> & { id?: string }) => {
    financeService.saveCategory(catData);
    refreshLedger();
    showToast(`Category "${catData.name}" created and styled successfully.`, 'success');
  };

  const handleDeleteCat = (id: string) => {
    setCatDeleteError(null);
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    const successful = financeService.deleteCategory(id);
    if (successful) {
      refreshLedger();
      showToast(`Category "${cat.name}" removed securely.`, 'info');
    } else {
      setCatDeleteError(`Category "${cat.name}" is locked. There are existing transactions linked to it in your ledger.`);
      showToast('Deactivation rejected. Inspect locked warning blocks.', 'error');
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-display font-black text-xl shadow-lg shadow-emerald-500/15">
              F
            </div>
            <div>
              <p className="font-display font-bold text-slate-905 dark:text-white leading-tight">
                FIDELIS
              </p>
              <p className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-400 tracking-wider">
                Private Ledger
              </p>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'transactions', label: 'Transactions', icon: Compass },
              { id: 'categories', label: 'Categories', icon: LucideIcon, special: 'Tag' },
              { id: 'settings', label: 'Settings', icon: Settings },
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
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-405 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50/70 dark:hover:bg-slate-850/40'
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
                  Secure access
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-slate-250/50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
              title="Lock Vault"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

      </aside>

      {/* MOBILE HEADER (Upper bar with navigation menu trigger) */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-display font-black text-lg">
            F
          </div>
          <span className="font-display font-bold text-slate-900 dark:text-white text-base tracking-tight leading-none">
            FIDELIS
          </span>
        </div>

        <div className="flex items-center gap-2.5">
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
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'transactions', label: 'Transactions', icon: Compass },
              { id: 'categories', label: 'Categories', icon: LucideIcon, special: 'Tag' },
              { id: 'settings', label: 'Settings', icon: Settings },
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
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Secure Sandbox</p>
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
              <span>Lock Vault</span>
            </button>
          </div>
        </div>
      )}

      {/* CORE VIEW MODULES SHELL */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto pb-28 md:pb-10 relative">
        
        {/* UPPER DESKTOP STATS BAR CONTROLS */}
        <div className="hidden md:flex justify-end items-center gap-3.5 mb-8 pb-5 border-b border-slate-100 dark:border-slate-800">
          <ThemeToggle />
          
          <div className="p-2.2 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-550 rounded-xl relative cursor-pointer" title="Alert logs">
            <Bell size={18} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-2 right-2.5 animate-pulse" />
          </div>

          <div className="flex items-center gap-2.5 px-4.5 py-2.2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-550 dark:text-slate-400 font-medium">Vault Synchronized</span>
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
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            onEditTransaction={handleOpenEditTx}
            onDeleteTransaction={handleDeleteTx}
            onOpenQuickAdd={handleOpenAddTx}
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
          <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
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
          <span className="text-[9px] font-bold uppercase tracking-wider">Ledger</span>
        </button>

        {/* Floating Quick Action Button (+) */}
        <button
          onClick={handleOpenAddTx}
          className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-555 transform -translate-y-3 shrink-0 cursor-pointer active:scale-95 transition-all animate-bounce"
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
          <span className="text-[9px] font-bold uppercase tracking-wider">Tags</span>
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
          <span className="text-[9px] font-bold uppercase tracking-wider">Settings</span>
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
