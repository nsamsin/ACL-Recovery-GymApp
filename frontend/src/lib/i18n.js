import { createContext, useContext } from "react";

const en = {
  // Tabs
  tabHome: "Home",
  tabSession: "Session",
  tabJournal: "Journal",
  tabProgress: "Progress",
  tabMore: "More",

  // App
  appTitle: "ACL Recovery",
  startingSession: "Starting session...",
  finishingSession: "Finishing session...",
  savingJournal: "Saving journal...",
  loadingShareData: "Loading share data...",
  offlineSessionQueued: "Offline: session start queued",
  offlineSessionUpdates: "Offline: session updates queued",
  offlineJournalQueued: "Offline: journal entry queued",
  offlineNameQueued: "Offline: name change queued",
  offlineExAddQueued: "Offline: add exercise queued",
  offlineExDelQueued: "Offline: delete exercise queued",
  offlineReorderQueued: "Offline: reorder queued",
  couldNotLoad: "Could not load data",

  // Login
  welcomeBack: "Welcome back!",
  setupPrompt: "Set up your name and PIN",
  name: "Name",
  pin4: "PIN (4 digits)",
  busy: "Loading...",
  logIn: "Log in",
  createAccount: "Create account",

  // Dashboard
  welcome: "Welcome,",
  nextSession: "Next session:",
  unknown: "unknown",
  sessionsWeek: "Sessions this week",
  streak: "Streak",
  days: "days",
  lastPainSwelling: "Last pain/swelling",
  pain: "Pain",
  swelling: "Swelling",
  noJournalData: "No journal data yet",
  startSession: "Start Session",
  fillJournal: "Fill in Journal",

  // Session
  progress: "Progress:",
  exercisesDone: "exercises completed",
  finishSession: "Finish Session",
  sets: "sets",
  reps: "Reps",
  weight: "Weight",
  meniscusWarn: "Max 70-80° knee flexion due to meniscus.",

  // Timer
  pause: "Pause",
  start: "Start",
  reset: "Reset",

  // Health log
  date: "Date",
  stiffness: "Stiffness",
  fullExtension: "Full extension reached",
  flexion: "Flexion:",
  notes: "Notes",
  save: "Save",

  // Progress
  painTrend: "Pain / Swelling Trend",
  sessionHistory: "Session History (cumulative)",
  weightPerExercise: "Weight Progress per Exercise",
  completedSessions: "Completed Sessions",
  noSessions: "No completed sessions.",
  loading: "Loading...",

  // More / Settings
  preferences: "Preferences",
  darkMode: "Dark Mode",
  language: "Language",
  account: "Account",
  changeName: "Change name",
  saveName: "Save Name",
  nameUpdated: "Name updated",
  changePin: "Change PIN",
  currentPin: "Current PIN",
  newPin: "New PIN",
  savePin: "Save PIN",
  pinUpdated: "PIN updated",
  sharing: "Sharing",
  shareDesc: "Share link for physiotherapist",
  loadOverview: "Load Overview",
  copyLink: "Copy Link",
  readOnlySummary: "Read-only summary",
  sessions: "Sessions",
  healthLogs: "Health logs",
  exerciseLogs: "Exercise logs",
  recentExercises: "Recent exercises",
  schedule: "Workout Schedule",
  up: "Up",
  down: "Down",
  deleteLabel: "Delete",
  exDeleted: "Exercise deleted",
  orderUpdated: "Order updated",
  addExercise: "Add Exercise",
  idPlaceholder: "ID (e.g. c_side_plank)",
  add: "Add",
  exAdded: "Exercise added",
  dataSection: "Data",
  exportJson: "Export Data (JSON)",

  // Categories
  catWarmup: "Warm-up",
  catBlokA: "Block A — Knee Rehab",
  catBlokB: "Block B — Upper Body",
  catBlokC: "Block C — Stability",
  catCooldown: "Cool Down",

  // ShareRoute
  readOnly: "ACL Recovery - Read-only",
  patient: "Patient:",
  painTrendShare: "Pain/swelling trend",
  progressPerEx: "Progress per exercise",
  completed: "completed",
  weightProgress: "Weight progress",
};

const nl = {
  tabHome: "Home",
  tabSession: "Sessie",
  tabJournal: "Dagboek",
  tabProgress: "Progressie",
  tabMore: "Meer",

  appTitle: "ACL Revalidatie",
  startingSession: "Sessie starten...",
  finishingSession: "Sessie afronden...",
  savingJournal: "Dagboek opslaan...",
  loadingShareData: "Share data laden...",
  offlineSessionQueued: "Offline: sessie start in wachtrij",
  offlineSessionUpdates: "Offline: sessie-updates in wachtrij",
  offlineJournalQueued: "Offline: dagboekentry in wachtrij",
  offlineNameQueued: "Offline: naamwijziging in wachtrij",
  offlineExAddQueued: "Offline: oefening toevoegen in wachtrij",
  offlineExDelQueued: "Offline: oefening verwijderen in wachtrij",
  offlineReorderQueued: "Offline: volgorde in wachtrij",
  couldNotLoad: "Kon data niet laden",

  welcomeBack: "Welkom terug!",
  setupPrompt: "Stel je naam en PIN in",
  name: "Naam",
  pin4: "PIN (4 cijfers)",
  busy: "Bezig...",
  logIn: "Inloggen",
  createAccount: "Account maken",

  welcome: "Welkom,",
  nextSession: "Volgende sessie:",
  unknown: "onbekend",
  sessionsWeek: "Sessies deze week",
  streak: "Streak",
  days: "dagen",
  lastPainSwelling: "Laatste pijn/zwelling",
  pain: "Pijn",
  swelling: "Zwelling",
  noJournalData: "Nog geen dagboekdata",
  startSession: "Start Sessie",
  fillJournal: "Dagboek invullen",

  progress: "Voortgang:",
  exercisesDone: "oefeningen voltooid",
  finishSession: "Sessie afronden",
  sets: "sets",
  reps: "Reps",
  weight: "Gewicht",
  meniscusWarn: "Max 70-80° knieflexie i.v.m. meniscus.",

  pause: "Pauze",
  start: "Start",
  reset: "Reset",

  date: "Datum",
  stiffness: "Stijfheid",
  fullExtension: "Volle extensie bereikt",
  flexion: "Flexie:",
  notes: "Notities",
  save: "Opslaan",

  painTrend: "Pijn / Zwelling trend",
  sessionHistory: "Sessiehistorie (cumulatief)",
  weightPerExercise: "Gewichtprogressie per oefening",
  completedSessions: "Afgeronde sessies",
  noSessions: "Geen afgeronde sessies.",
  loading: "Laden...",

  preferences: "Voorkeuren",
  darkMode: "Donker thema",
  language: "Taal",
  account: "Account",
  changeName: "Naam wijzigen",
  saveName: "Naam opslaan",
  nameUpdated: "Naam bijgewerkt",
  changePin: "PIN wijzigen",
  currentPin: "Huidige PIN",
  newPin: "Nieuwe PIN",
  savePin: "PIN opslaan",
  pinUpdated: "PIN bijgewerkt",
  sharing: "Delen",
  shareDesc: "Deellink voor fysiotherapeut",
  loadOverview: "Laad overzicht",
  copyLink: "Kopieer link",
  readOnlySummary: "Read-only samenvatting",
  sessions: "Sessies",
  healthLogs: "Health logs",
  exerciseLogs: "Exercise logs",
  recentExercises: "Recente oefeningen",
  schedule: "Schema aanpassen",
  up: "Omhoog",
  down: "Omlaag",
  deleteLabel: "Verwijder",
  exDeleted: "Oefening verwijderd",
  orderUpdated: "Volgorde bijgewerkt",
  addExercise: "Oefening toevoegen",
  idPlaceholder: "ID (bijv. c_side_plank)",
  add: "Toevoegen",
  exAdded: "Oefening toegevoegd",
  dataSection: "Data",
  exportJson: "Data exporteren (JSON)",

  catWarmup: "Warming-up",
  catBlokA: "Blok A — Knie-revalidatie",
  catBlokB: "Blok B — Upper body",
  catBlokC: "Blok C — Stabiliteit",
  catCooldown: "Cooling down",

  readOnly: "ACL Revalidatie - Read-only",
  patient: "Patiënt:",
  painTrendShare: "Pijn/zwelling trend",
  progressPerEx: "Progressie per oefening",
  completed: "afgerond",
  weightProgress: "Gewichtsprogressie",
};

const translations = { en, nl };

export const LangContext = createContext({ lang: "en", setLang: () => {} });

export function useT() {
  const { lang } = useContext(LangContext);
  return (key) => translations[lang]?.[key] || translations.en[key] || key;
}

export function useLang() {
  return useContext(LangContext);
}

export function getLocale(lang) {
  return lang === "nl" ? "nl-NL" : "en-US";
}
