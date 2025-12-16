
export enum HeadshotStyle {
  CORPORATE = 'CORPORATE',
  CREATIVE = 'CREATIVE',
  EXECUTIVE = 'EXECUTIVE',
  SEXY = 'SEXY',
  SENSUAL = 'SENSUAL',
  MEDITATION = 'MEDITATION',
  GLAMOROUS = 'GLAMOROUS',
  VINTAGE = 'VINTAGE',
  FUTURISTIC = 'FUTURISTIC',
  EROTIC = 'EROTIC',
  CYBERPUNK = 'CYBERPUNK',
  ART_DECO = 'ART_DECO',
  FANTASY = 'FANTASY',
  SCIFI = 'SCIFI',
  STEAMPUNK = 'STEAMPUNK',
  THREED = 'THREED',
  ICE_AGE = 'ICE_AGE',
  ARTISTIC_PAINTING = 'ARTISTIC_PAINTING'
}

export enum BackgroundId {
  ORIGINAL = 'ORIGINAL',
  OFFICE = 'OFFICE',
  STUDIO_GREY = 'STUDIO_GREY',
  STUDIO_WHITE = 'STUDIO_WHITE',
  STUDIO_BLACK = 'STUDIO_BLACK',
  BRICK_WALL = 'BRICK_WALL',
  CITY_BOKEH = 'CITY_BOKEH',
  NATURE = 'NATURE',
  BOOKSHELF = 'BOOKSHELF',
  SOLID_BLUE = 'SOLID_BLUE',
  GRADIENT_LUX = 'GRADIENT_LUX',
  EIFFEL_TOWER = 'EIFFEL_TOWER',
  NEW_YORK = 'NEW_YORK',
  SHIP = 'SHIP',
  AIRPORT = 'AIRPORT'
}

export interface StyleConfig {
  id: HeadshotStyle;
  title: string;
  description: string;
  promptModifier: string;
  iconColor: string;
}

export interface BackgroundConfig {
  id: BackgroundId;
  label: string;
  promptModifier: string; // The prompt instruction for this background
  previewColor: string; // CSS class for UI preview
}

export interface GenerationState {
  originalImage: string | null; // Base64
  generatedImage: string | null; // Base64
  generatedVideo: string | null; // URL to blob/file
  isGenerating: boolean;
  error: string | null;
}

export interface Project {
  id?: number;
  timestamp: number;
  style: HeadshotStyle;
  originalImage: string;
  generatedImage: string;
  generatedVideo?: string;
}

export interface CustomPreset {
  id: string;
  name: string;
  styles: HeadshotStyle[];
  createdAt: number;
}

export interface UserProfile {
  id: string; // 'user'
  credits: number;
  isSubscribed: boolean;
  isAdmin?: boolean; // New Admin flag
  subscriptionExpiry?: number;
}

export type Language = 'en' | 'pl';
