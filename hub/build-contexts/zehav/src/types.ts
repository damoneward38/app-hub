export enum Page {
  Landing = 'landing',
  PDFStore = 'pdf-store',
  SaaSStore = 'saas-store',
  AppStore = 'app-store',
  CodePulse = 'codepulse',
  Quantum = 'quantum',
  Pricing = 'pricing',
  Dashboard = 'dashboard',
  VaultDrop = 'vaultdrop',
  Auth = 'auth',
  About = 'about',
  WhiteLabel = 'white-label',
  Admin = 'admin'
}

export interface AppItem {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  revenue: number;
  unlocks: number;
  icon: string;
  locked: boolean;
  color: 'gold' | 'green' | 'purple' | 'red' | 'cyan';
  live: boolean;
}

export interface Alert {
  id: string;
  type: 'sale' | 'info' | 'error';
  message: string;
  time: string;
  amount?: string;
  icon: string;
}
