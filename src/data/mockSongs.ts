// src/data/mockSongs.ts
import type { Song } from "../types/domain";

export const mockSongs: Song[] = [
  {
    id: "song-1",
    title: "엄청 높은 발라드",
    artist: "Singer A",
    genre: "ballad",
    difficulty: "hard",
    language: "ko",
    peakNote: "C5",
    rouletteTags: ["superHigh"],
  },
  {
    id: "song-2",
    title: "귀여운 아이돌 송",
    artist: "Singer B",
    genre: "idol",
    difficulty: "medium",
    language: "ko",
    peakNote: "A4",
    rouletteTags: ["superCute"],
  },
  {
    id: "song-3",
    title: "찐 감성 발라드",
    artist: "Singer C",
    genre: "ballad",
    difficulty: "medium",
    language: "ko",
    peakNote: "B4",
    rouletteTags: ["emotionalBallad"],
  },
  {
    id: "song-4",
    title: "밈송 챌린지",
    artist: "Singer D",
    genre: "meme",
    difficulty: "easy",
    language: "ko",
    peakNote: "G4",
    rouletteTags: ["meme"],
  },
];
