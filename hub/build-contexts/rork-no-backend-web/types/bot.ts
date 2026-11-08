export interface Bot {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: BotCategory;
  features: string[];
  icon: string;
  gradient: [string, string];
  rating: number;
  users: string;
  isNew?: boolean;
  isFeatured?: boolean;
  systemPrompt: string;
}

export type BotCategory = 
  | 'Music'
  | 'Business'
  | 'Automation'
  | 'Education'
  | 'Faith'
  | 'Utilities'
  | 'Creative'
  | 'Productivity';

export interface Category {
  id: BotCategory;
  name: string;
  icon: string;
  color: string;
}
