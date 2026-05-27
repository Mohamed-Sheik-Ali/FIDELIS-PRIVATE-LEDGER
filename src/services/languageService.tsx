/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta' | 'te';

interface TranslationDictionary {
  [key: string]: {
    en: string;
    ta: string;
    te: string;
  };
}

const DICTIONARY: TranslationDictionary = {
  // Navigation / Tabs
  dashboard: {
    en: 'Dashboard',
    ta: 'டாஷ்போர்டு',
    te: 'డాష్‌బోర్డ్',
  },
  transactions: {
    en: 'Transactions',
    ta: 'பரிவர்த்தனைகள்',
    te: 'లావాదేవీలు',
  },
  trips: {
    en: 'Trip Planner',
    ta: 'பயண திட்டம்',
    te: 'ట్రిప్ ప్లానర్',
  },
  currencies: {
    en: 'Currencies',
    ta: 'நாணயங்கள்',
    te: 'కరెన్సీలు',
  },
  categories: {
    en: 'Categories',
    ta: 'வகைகள்',
    te: 'వర్గాలు',
  },
  settings: {
    en: 'Settings',
    ta: 'அமைப்புகள்',
    te: 'సెట్టింగులు',
  },
  home: {
    en: 'Home',
    ta: 'முகப்பு',
    te: 'హోమ్',
  },
  ledger: {
    en: 'Ledger',
    ta: 'கணக்குப் புத்தகம்',
    te: 'లెడ్జర్',
  },
  tags: {
    en: 'Tags',
    ta: 'குறிச்சொற்கள்',
    te: 'ట్యాగ్‌లు',
  },

  // Sidebar / Header Info
  privateLedger: {
    en: 'Private Ledger',
    ta: 'தனிப்பட்ட கணக்குப்பதிவேடு',
    te: 'వ్యక్తిగత లెడ్జర్',
  },
  secureAccess: {
    en: 'Secure access',
    ta: 'பாதுகாப்பான அணுகல்',
    te: 'సురక్షిత యాక్సెస్',
  },
  secureSandbox: {
    en: 'Secure Sandbox',
    ta: 'பாதுகாப்பான சாண்ட்பாக்ஸ்',
    te: 'సురక్షిత సాండ్‌బాక్స్',
  },
  lockVault: {
    en: 'Lock Vault',
    ta: 'பெட்டகத்தைப் பூட்டு',
    te: 'ఖజానా లాక్ చేయి',
  },
  lockTreasuryVault: {
    en: 'Lock Treasury Vault',
    ta: 'கருவூலப் பெட்டகத்தைப் பூட்டு',
    te: 'ఖజానా లాక్ చేయి',
  },
  vaultSynchronized: {
    en: 'Vault Synchronized',
    ta: 'பெட்டகம் இணைக்கப்பட்டுள்ளது',
    te: 'ఖజానా సమకాలీకరించబడింది',
  },

  // Dashboard View
  welcomeBack: {
    en: 'Welcome back,',
    ta: 'மீண்டும் வருக,',
    te: 'స్వాగతం,',
  },
  financialOverviewDescription: {
    en: 'Audit, filter, and track all inflow and outflow entries in original currency or base portfolio equivalent.',
    ta: 'அசல் நாணயம் அல்லது போர்ட்ஃபோலியோவில் உள்ள அனைத்து பணவரவு மற்றும் செலவுப் பதிவுகளைக் கண்காணித்து நிர்வகிக்கவும்.',
    te: 'అసలు కరెన్シー లేదా బేస్ పోర్ట్‌ఫోలియో ఆధారంగా అన్ని ఆదాయం మరియు ఖర్చుల లావాదేవీలను ట్రాక్ చేయండి.',
  },
  safeToSpendDescription: {
    en: 'Safe to spend liquid reserves',
    ta: 'செலவு செய்யக்கூடிய திரவ இருப்பு',
    te: 'ఖర్చు చేయడానికి అందుబాటులో ఉన్న నిధులు',
  },
  safeToSpend: {
    en: 'Safe to Spend',
    ta: 'செலவிடக்கூடிய இருப்பு',
    te: 'ఖర్చు చేయడానికి అందుబాటులో ఉన్న నిధులు',
  },
  totalInflow: {
    en: 'Total Inflow',
    ta: 'மொத்த வரவு',
    te: 'మొత్తం ఆదాయం',
  },
  totalOutflow: {
    en: 'Total Outflow',
    ta: 'மொத்த செலவு',
    te: 'మొత్తం ఖర్చు',
  },
  baseConversionDisclaimer: {
    en: 'Auto-converted using real-time global fiat metrics',
    ta: 'உலகளாவிய நிகழ்நேர நாணய விகிதங்களின் அடிப்படையில் மாற்றப்பட்டது',
    te: 'నిజ-సమయ ప్రపంచ కరెన్సీ రేట్ల ఆధారంగా మార్చబడింది',
  },
  recentTransactions: {
    en: 'Recent Transactions',
    ta: 'சமீபத்திய பரிவர்த்தனைகள்',
    te: 'ఇటీవలి లావాదేవీలు',
  },
  recentTransactionsDesc: {
    en: 'The latest activity logs recorded securely inside your sandbox.',
    ta: 'உங்கள் சாண்ட்பாக்ஸில் பாதுகாப்பாகப் பதிவுசெய்யப்பட்ட சமீபத்திய நடவடிக்கைகள்.',
    te: 'మీ సాండ్‌బాక్స్‌లో సురక్షితంగా రికార్డ్ చేయబడిన ఇటీవలి లావాదేవీలు.',
  },
  viewLiveLedgerLogs: {
    en: 'View live ledger logs',
    ta: 'பரிவர்த்தனைப் பட்டியலைக் காண்க',
    te: 'లైవ్ లెడ్జర్ లాగ్స్ వీక్షించండి',
  },
  noRecentTransactions: {
    en: 'No recent ledger records registered under your profile active key.',
    ta: 'உங்கள் சுயவிவரத்தின் கீழ் சமீபத்திய பரிவர்த்தனைப் பதிவுகள் எதுவும் இல்லை.',
    te: 'మీ ప్రొఫైల్ కింద ఎటువంటి ఇటీవలి లావాదేవీల రికార్డులు లేవు.',
  },
  distributedAcross: {
    en: 'Distributed across',
    ta: 'பகிர்ந்தளிக்கப்பட்டது',
    te: 'విభజించబడింది',
  },
  categoriesUnit: {
    en: 'categories',
    ta: 'பிரிவுகளில்',
    te: 'విభాగాలుగా',
  },
  assetAllocation: {
    en: 'Relative Asset Concentration',
    ta: 'சொத்து ஒதுக்கீட்டு விகிதம்',
    te: 'ఆస్తి కేటాయింపు నిష్పత్తి',
  },
  assetAllocationDesc: {
    en: 'Percentage dispersion of ledger entries classified by assigned category tags.',
    ta: 'ஒதுக்கப்பட்ட வகை குறிச்சொற்களின்படி பரிவர்த்தனைகளின் சதவீதப் பகிர்வு.',
    te: 'కేటాయించిన వర్గాల ఆధారంగా లావాదేవీల విభజన శాతం.',
  },
  quickRecord: {
    en: 'Quick Record',
    ta: 'விரைவுப் பதிவு',
    te: 'త్వరిత రికార్డు',
  },

  // Transactions View
  transactionsLedger: {
    en: 'Transactions Ledger',
    ta: 'பரிவர்த்தனைப் பேரேடு',
    te: 'లావాదేవీల లెడ్జర్',
  },
  searchPlaceholder: {
    en: 'Search note memos or categories...',
    ta: 'குறிப்புகள் அல்லது வகைகளைத் தேடுங்கள்...',
    te: 'గమనికలు లేదా వర్గాలను శోధించండి...',
  },
  financialFlowAll: {
    en: 'Financial Flow: All',
    ta: 'பரிவர்த்தனை வகை: அனைத்தும்',
    te: 'ఆర్థిక ప్రవాహం: అన్నీ',
  },
  financialFlowIncome: {
    en: 'Financial Flow: Inflow Only',
    ta: 'பரிவர்த்தனை வகை: வரவு மட்டும்',
    te: 'ఆర్థిక ప్రవాహం: ఆదాయం మాత్రమే',
  },
  financialFlowExpense: {
    en: 'Financial Flow: Outflow Only',
    ta: 'பரிவர்த்தனை வகை: செலவு மட்டும்',
    te: 'ఆర్థిక ప్రవాహం: ఖర్చు మాత్రమే',
  },
  categoryTag: {
    en: 'Category Tag',
    ta: 'வகை குறிச்சொல்',
    te: 'వర్గ ట్యాగ్',
  },
  allCategoryTags: {
    en: 'All Category Tags',
    ta: 'அனைத்து வகைகளும்',
    te: 'అన్ని వర్గాల ట్యాగ్‌లు',
  },
  temporalWindow: {
    en: 'Temporal Window',
    ta: 'கால அளவு',
    te: 'సమయ పరిధి',
  },
  historicSpanAll: {
    en: 'Historic Span: All',
    ta: 'காலம்: அனைத்தும்',
    te: 'చారిత్రక పరిధి: అన్నీ',
  },
  historicSpanToday: {
    en: 'Historic Span: Today',
    ta: 'காலம்: இன்று',
    te: 'చారిత్రక పరిధి: ఈ రోజు',
  },
  historicSpanWeek: {
    en: 'Historic Span: This Week',
    ta: 'காலம்: இந்த வாரம்',
    te: 'చారిత్రక పరిధి: ఈ వారం',
  },
  historicSpanMonth: {
    en: 'Historic Span: This Month',
    ta: 'காலம்: இந்த மாதம்',
    te: 'చారిత్రక పరిధి: ఈ నెల',
  },
  sortPriority: {
    en: 'Sort Priority',
    ta: 'வரிசையாக்கம்',
    te: 'క్రమబద్ధీకరణ',
  },
  newestFirst: {
    en: 'Newest First',
    ta: 'புதியது முதலில்',
    te: 'కొత్తవి మొదట',
  },
  oldestFirst: {
    en: 'Oldest First',
    ta: 'பழையது முதலில்',
    te: 'పాతవి మొదట',
  },
  highestValue: {
    en: 'High-to-Low Value',
    ta: 'அதிக மதிப்பு முதலில்',
    te: 'ఎక్కువ విలువ మొదట',
  },
  lowestValue: {
    en: 'Low-to-High Value',
    ta: 'குறைந்த மதிப்பு முதலில்',
    te: 'తక్కువ విలువ మొదట',
  },
  searchResultInfo: {
    en: 'Search results matching filter rules',
    ta: 'வடிகட்டி விதிகளுடன் பொருந்தும் தேடல் முடிவுகள்',
    te: 'ఫిల్టర్ నియమాలకు సరిపోలే శోధన ఫలితాలు',
  },
  sourceNoteMemo: {
    en: 'Source Note & Memo',
    ta: 'குறிப்பு & உரை',
    te: 'లావాదేవీ గమనిక',
  },
  type: {
    en: 'Type',
    ta: 'வகை',
    te: 'రకం',
  },
  date: {
    en: 'Date',
    ta: 'தேதி',
    te: 'తేదీ',
  },
  ledgerValue: {
    en: 'Ledger Value',
    ta: 'மதிப்பு',
    te: 'విలువ',
  },
  controls: {
    en: 'Controls',
    ta: 'கட்டுப்பாடுகள்',
    te: 'నియంత్రణలు',
  },
  noTransactionsFound: {
    en: 'No transactions found matching active filter state criteria.',
    ta: 'வடிகட்டி நிபந்தனைகளுடன் பொருந்தும் பரிவர்த்தனைகள் எதுவும் இல்லை.',
    te: 'సక్రియ ఫిల్టర్ ప్రమాణాలకు సరిపోలే లావాదేవీలు ఏవీ కనుగొనబడలేదు.',
  },

  // Trips Planning View
  tripBlueprints: {
    en: 'Travel Escape Blueprints',
    ta: 'பயண திட்ட வரைபடங்கள்',
    te: 'ప్రయాణ ప్రణాళికలు',
  },
  tripBlueprintsDesc: {
    en: 'Forecast international destinations, construct itinerary budgets, and isolate planned expenses against reserves.',
    ta: 'சர்வதேச பயண திட்டங்களை வகுக்கவும், பட்ஜெட்டுகளை உருவாக்கவும், செலவுகளை திட்டமிடவும்.',
    te: 'అంతర్జాతీయ గమ్యస్థానాలను అంచనా వేయండి, బడ్జెట్‌లను రూపొందించండి మరియు ప్రణాళికాబద్ధమైన ఖర్చులను ట్రాక్ చేయండి.',
  },
  addTripBlueprint: {
    en: 'New Travel Blueprint',
    ta: 'புதிய பயண திட்டம்',
    te: 'కొత్త ప్రయాణ ప్లాన్',
  },
  destinationFieldName: {
    en: 'Destination Country or City',
    ta: 'பயண இலக்கு நாடு அல்லது நகரம்',
    te: 'మొత్తం గమ్యస్థానం',
  },
  startDateFieldName: {
    en: 'Departure Date',
    ta: 'புறப்படும் தேதி',
    te: 'ప్రయాణ ప్రారంభ తేదీ',
  },
  endDateFieldName: {
    en: 'Return Date',
    ta: 'திரும்பும் தேதி',
    te: 'ప్రయాణ ముగింపు తేదీ',
  },
  budgetCeiling: {
    en: 'Total Allocated Budget Ceiling',
    ta: 'மொத்த பட்ஜெட் வரம்பு',
    te: 'మొత్తం కేటాయించిన బడ్జెట్ పరిమితి',
  },
  localCurrencyLabel: {
    en: 'Destination Local Currency',
    ta: 'பயண இலக்கின் உள்ளூர் நாணயம்',
    te: 'స్థానిక కరెన్సీ',
  },
  optionalMemoLabel: {
    en: 'Optional Memory Anchor Notes',
    ta: 'கூடுதல் குறிப்புகள் (தேவையெனில்)',
    te: 'ఐచ్ఛిక నోట్స్ (మెమరీస్)',
  },
  cancelBtn: {
    en: 'Discard Draft',
    ta: 'நிராகரி',
    te: 'రద్దు చేయి',
  },
  createBlueprintBtn: {
    en: 'Create Blueprint Document',
    ta: 'திட்டத்தை உருவாக்கு',
    te: 'ప్రణాళికను సృష్టించండి',
  },
  updateBlueprintBtn: {
    en: 'Save Blueprint Changes',
    ta: 'மாற்றங்களைச் சேமி',
    te: 'మార్పులను సేవ్ చేయి',
  },
  activeTripBlueprintTitle: {
    en: 'Trip Statistics & Budget Logs',
    ta: 'பயண புள்ளிவிவரங்கள் & பட்ஜெட் பதிவுகள்',
    te: 'ప్రయాణ గణాంకాలు & బడ్జెట్ రికార్డులు',
  },
  latitude: {
    en: 'Latitude',
    ta: 'அட்சரேகை (Lat)',
    te: 'అక్షాంశం (Lat)',
  },
  longitude: {
    en: 'Longitude',
    ta: 'தீர்க்கரேகை (Lon)',
    te: 'రేఖాంశం (Lon)',
  },
  countryISO: {
    en: 'Country ISO',
    ta: 'நாட்டின் குறியீடு',
    te: 'దేశం ISO కోడ్',
  },
  currentNetAssets: {
    en: 'Current Net Assets',
    ta: 'தற்போதைய நிகர சொத்துக்கள்',
    te: 'ప్రస్తుత నికర ఆస్తులు',
  },
  assetMarginAfterPlans: {
    en: 'Asset Margin after Plans',
    ta: 'திட்டமிட்ட செலவுக்குப் பின் இருப்பு',
    te: 'ప్రణాళికల తర్వాత మిగిలే ఆస్తి',
  },
  ifFullBudgetRealized: {
    en: 'If Full Budget Realized',
    ta: 'முழு பட்ஜெட்டும் செலவானால்',
    te: 'పూర్తి బడ్జెట్ ఖర్చయితే',
  },
  budgetUtilizedPercent: {
    en: 'Budget Utilized',
    ta: 'பயன்படுத்தப்பட்ட பட்ஜெட்',
    te: 'బడ్జెట్ వినియోగం',
  },
  appendPlanningItem: {
    en: 'Append Expense Ledger Planner',
    ta: 'செலவுத் திட்டத்தைச் சேர்',
    te: 'ఖర్చు ప్రణాళికను జోడించండి',
  },
  planningItemNamePlaceholder: {
    en: 'e.g. Flight to Rome, Hotel nights',
    ta: 'உதாரணம்: விமான டிக்கெட், ஹோட்டல் கட்டணம்',
    te: 'ఉదాహరణ: విమాన టికెట్, హోటల్ ఖర్చులు',
  },
  planningItemAmountPlaceholder: {
    en: 'Amount',
    ta: 'தொகை',
    te: 'మొత్తం',
  },
  planningItemAddBtn: {
    en: 'Lock in Scope',
    ta: 'செலவைச் சேர்',
    te: 'షెడ్యూల్ చేయి',
  },
  postToLiveLedger: {
    en: 'Post to Private Ledger',
    ta: 'செலவைப் பேரேட்டில் பதிவு செய்',
    te: 'లెడ్జర్‌కు జోడించు',
  },
  postToLiveLedgerTooltip: {
    en: 'Add this travel item as a live live expense transaction',
    ta: 'இந்த செலவைத் தற்போதைய செலவுப் பரிவர்த்தனையாகப் பதிவு செய்',
    te: 'ఈ ప్రయాణ ఖర్చును లైవ్ లావాదేవీగా జోడించండి',
  },

  // Settings View
  personalIdentityProfile: {
    en: 'Personal Identity Profile',
    ta: 'தனிப்பட்ட அடையாள விவரங்கள்',
    te: 'వ్యక్తిగత ప్రొఫైల్',
  },
  securityProtocols: {
    en: 'Security Protocols',
    ta: 'பாதுகாப்பு நெறிமுறைகள்',
    te: 'భద్రతా ప్రోటోకాల్స్',
  },
  sandboxDatabaseReset: {
    en: 'Reset System Data',
    ta: 'அனைத்து தரவுகளையும் மீட்டமை',
    te: 'డేటాను రీసెట్ చేయండి',
  },
  sandboxDatabaseResetDesc: {
    en: 'Permanently purge all customized transactions, custom category overrides, and travel blueprints. Reverts database registers to baseline configurations.',
    ta: 'அனைத்து பரிவர்த்தனைகள், தனிப்பயன் வகைகள் மற்றும் பயண திட்டங்களை நிரந்தரமாக நீக்கி ஆரம்ப நிலைக்குக் கொண்டு வரும்.',
    te: 'అన్ని లావాదేవీలు, అనుకూల వర్గాలు మరియు ప్రయాణ ప్రణాళికలను శాశ్వతంగా తొలగించండి. డేటాను ప్రారంభ స్థితికి తీసుకువస్తుంది.',
  },
  resetSandboxBtn: {
    en: 'Reset Sandbox Database',
    ta: 'தரவுத்தளத்தை மீட்டமை',
    te: 'డేటాబేస్ రీసెట్ చేయి',
  },
  lockTreasuryVaultBtn: {
    en: 'Lock Treasury Vault',
    ta: 'கருவூலப் பெட்டகத்தைப் பூட்டு',
    te: 'ఖజానా లాక్ చేయి',
  },
  editProfileName: {
    en: 'Display Identity Name',
    ta: 'காண்பிக்கப்படும் பெயர்',
    te: 'ప్రదర్శన పేరు',
  },
  editProfileEmail: {
    en: 'Secure Contact Email',
    ta: 'பாதுகாப்பான மின்னஞ்சல்',
    te: 'సురక్షిత ఇమెయిల్',
  },
  saveVaultCredentials: {
    en: 'Save Vault Credentials',
    ta: 'சுயவிவரத்தைச் சேமி',
    te: 'రుజువులను సేవ్ చేయి',
  },
  appLanguageTitle: {
    en: 'Application Language',
    ta: 'பயன்பாட்டு மொழி',
    te: 'అప్లికేషన్ భాష',
  },
  appLanguageDesc: {
    en: 'Set your preferred interface localization. Select between English, Tamil, and Telugu.',
    ta: 'உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும். ஆங்கிலம், தமிழ் மற்றும் தெலுங்கு மொழிகளில் தேர்வு செய்யலாம்.',
    te: 'మీకు నచ్చిన భాషను ఎంచుకోండి. ఇంగ్లీష్, తమిళం మరియు తెలుగు మధ్య ఎంచుకోండి.',
  },

  // Modals
  transactionModalTitleAdd: {
    en: 'Record Ledger Entry',
    ta: 'பரிவர்த்தனையை பதிவு செய்',
    te: 'లావాదేవీ రికార్డు నమోదు చేయి',
  },
  transactionModalTitleEdit: {
    en: 'Modify Ledger Reference',
    ta: 'பரிவர்த்தனையை மாற்றி அமை',
    te: 'లావాదేవీని సవరించండి',
  },
  transactionTypeLabel: {
    en: 'Transaction Type',
    ta: 'பரிவர்த்தனை வகை',
    te: 'లావాదేవీ రకం',
  },
  transactionTypeIncome: {
    en: 'Income Credit Flow',
    ta: 'வரவு',
    te: 'ఆదాయం',
  },
  transactionTypeExpense: {
    en: 'Outflow Expense Debit',
    ta: 'செலவு',
    te: 'ఖర్చు',
  },
  currencyUnitsLabel: {
    en: 'Accounting Currency',
    ta: 'பரிவர்த்தனை நாணயம்',
    te: 'లావాదేవీ కరెన్సీ',
  },
  financialCategoryLabel: {
    en: 'Category Classification',
    ta: 'பிரிவு வகை',
    te: 'కేటగిరీ వర్గీకరణ',
  },
  transactionDateLabel: {
    en: 'Transaction Timestamp',
    ta: 'பரிவர்த்தனை தேதி',
    te: 'లావాదేవీ తేదీ',
  },
  transactionNoteLabel: {
    en: 'Note & Description',
    ta: 'விளக்கம் & குறிப்பு',
    te: 'వివరణ & గమనికలు',
  },
  transactionModalCancel: {
    en: 'Cancel',
    ta: 'ரத்து செய்',
    te: 'రద్దు చేయి',
  },
  transactionModalSave: {
    en: 'Save Transaction',
    ta: 'பரிவர்த்தனையைச் சேமி',
    te: 'లావాదేవీని సేవ్ చేయి',
  },

  categoryModalTitleAdd: {
    en: 'Formulate Category Token',
    ta: 'புதிய வகைப்பாட்டை உருவாக்கு',
    te: 'కొత్త వర్గాన్ని సృష్టించండి',
  },
  categoryModalTitleEdit: {
    en: 'Amend Category Token',
    ta: 'வகைப்பாட்டைத் திருத்து',
    te: 'వర్గాన్ని సవరించండి',
  },
  categoryNameLabel: {
    en: 'Category Designation',
    ta: 'வகையின் பெயர்',
    te: 'వర్గం పేరు',
  },
  categoryNamePlaceholder: {
    en: 'e.g. Gym, Subscriptions, Side-hustle',
    ta: 'உதாரணம்: உடற்பயிற்சி கூடம், சந்தாக்கள்',
    te: 'ఉదాహరణ: జిమ్, సభ్యత్వాలు, ఇతర ఆదాయాలు',
  },
  launcherIcon: {
    en: 'Launcher Icon',
    ta: 'சின்னம்',
    te: 'ఐకాన్',
  },
  colorAccentBadge: {
    en: 'Color Accent Badge',
    ta: 'வண்ணக் குறியீடு',
    te: 'రంగు బ్యాడ్జ్',
  },
  categoryModalSave: {
    en: 'Incorporate Category',
    ta: 'வகையைச் சேமி',
    te: 'వర్గాన్ని సేవ్ చేయి',
  },
  ledgerBalanceAnchor: {
    en: 'Ledger balance anchor',
    ta: 'கணக்கு புத்தகத்தின் தற்போதைய இருப்பு',
    te: 'లెడ్జర్ బ్యాలెన్స్ సూచిక',
  },
  currentNetAssetsTitle: {
    en: 'Current Net Assets',
    ta: 'சொத்து மதிப்பு',
    te: 'ప్రస్తుత నికర ఆస్తులు',
  },
  distributedCount: {
    en: 'Distributed across {count} categories',
    ta: '{count} பிரிவுகளில் பிரிக்கப்பட்டுள்ளது',
    te: '{count} వర్గాలుగా విభజించబడింది',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('fin_lang') as Language;
    return (saved === 'en' || saved === 'ta' || saved === 'te') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('fin_lang', lang);
    setLanguageState(lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const entry = DICTIONARY[key];
    if (!entry) {
      // Fallback: If translation key matches dictionary entries but formatted as a phrase, return key
      return key;
    }
    let text = entry[language] || entry['en'] || key;
    
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
