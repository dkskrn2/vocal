// src/types/domain.ts
export type VocalProfile = {
  id: string;
  tags: string[];
  comfortableRange: string;
  maxRange: string;
  lastAnalyzedAt: string;
};

export type SongDifficulty = "easy" | "medium" | "hard";

export type SongLanguage = "ko" | "en" | "jp" | "etc";

export type Song = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  difficulty: SongDifficulty;
  language: SongLanguage;
  peakNote: string;
  rouletteTags: string[];
};

export type RouletteConcept =
  | "superHigh"
  | "superCute"
  | "emotionalBallad"
  | "meme";

export type RouletteConfig = {
  concept: RouletteConcept;
  difficulty: SongDifficulty | "any";
  language: SongLanguage | "any";
  songCount: number;
  respectUserStyle: boolean;
};
