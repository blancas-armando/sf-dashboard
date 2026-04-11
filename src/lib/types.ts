export type TransitDeparture = {
  routeName: string;
  destination: string;
  etaMinutes: number;
};

export type TransitStop = {
  stopName: string;
  departures: TransitDeparture[];
};

export type TransitData = {
  stops: TransitStop[];
};

export type WeatherData = {
  temp: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
};

export type Game = {
  team: "Giants" | "Warriors";
  opponent: string;
  time: string;
  status: "scheduled" | "in_progress" | "final";
  score?: string;
  isHome: boolean;
};

export type GamesData = {
  games: Game[];
};

export type ChecklistItem = {
  id: string;
  label: string;
};

export type DashboardData = {
  transit: TransitData | null;
  weather: WeatherData | null;
  games: GamesData | null;
  checklist: ChecklistItem[];
  updatedAt: string;
};
