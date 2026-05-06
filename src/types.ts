export enum MediaType {
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  PRESENTATION = 'presentation',
  QUIZ = 'quiz',
  DATA_TABLE = 'table',
  INFOGRAPHIC = 'infographic',
  MIND_MAP = 'mindmap',
}

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  altSources?: {
    type: MediaType;
    url: string;
    title?: string;
  }[];
}

export interface AppState {
  lastViewedId: string | null;
  lastProgress: number; // e.g. for video/audio
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  upsellProducts?: string[];
  videoUrl?: string;
  pdfUrl?: string;
  complementaryProductId?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  recommendations?: Product[];
  sourceUrl?: string; // Link to the Google Drive source used
  navigationId?: string; // ID of media to navigate to
}
