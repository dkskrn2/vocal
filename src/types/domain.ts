// src/types/domain.ts
export type VocalProfile = {
  id: string
  tags: string[]
  comfortableRange: string
  maxRange: string
  lastAnalyzedAt: string
  recommendedGenres?: string[]
  favoriteGenres?: string[]
  favoriteArtists?: string[]
}

export type SongDifficulty = "easy" | "medium" | "hard"

export type SongLanguage = "ko" | "en" | "jp" | "etc"

export type SongCategory =
  | "kpop_idol"
  | "ballad"
  | "dance_pop"
  | "rock_band"
  | "rnb_soul"
  | "hiphop"
  | "anime"
  | "game"
  | "vocaloid"
  | "jpop"
  | "pop_song"
  | "ost_drama_movie"

export type Song = {
  id: string
  title: string
  artist: string
  genre: string
  difficulty: SongDifficulty
  language: SongLanguage
  peakNote: string
  rouletteTags: string[]
  category?: SongCategory
  bpm?: number
  duration?: string
  releaseYear?: number
  youtubeUrl?: string
  lyrics?: string
  characteristics?: string // 곡의 특징
  recommendationReason?: string // 추천 이유
}

export type RouletteConcept = "superHigh" | "superCute" | "emotionalBallad" | "meme"

export type RouletteConfig = {
  concept: RouletteConcept
  difficulty: SongDifficulty | "any"
  language: SongLanguage | "any"
  songCount: number
  respectUserStyle: boolean
}

export type VocalEvaluationScore = {
  pitch: number // 음정 정확도 (0-100)
  rhythm: number // 박자 안정성 (0-100)
  pronunciation: number // 발음 명확도 (0-100)
  tone: number // 톤 적합도 (0-100)
  voiceStyle: number // 목소리 스타일 일치도 (0-100)
}

export type VocalEvaluation = {
  id: string
  songTitle: string
  originalArtist: string
  evaluatedAt: string
  overallScore: number // 종합 점수 (0-100)
  scores: VocalEvaluationScore
  strengths: string[] // 강점
  improvements: string[] // 개선점
  recommendedPracticeSongs?: string[] // 추천 연습곡
}

export type SongAnalysisStatus = "idle" | "uploading" | "analyzing" | "completed"

export type SongAnalysisResult = {
  vocalRange: {
    lowest: string // 최저음
    highest: string // 최고음
    comfortable: string // 편안한 음역
    rangeWidth: number // 음역 폭 (반음 단위)
  }
  difficulty: {
    rangeWidth: number // 음역 폭
    highNoteDuration: number // 고음 지속 비율 (%)
    jumpSize: number // 평균 점프 크기 (반음)
  }
  rhythm: {
    bpm: number
    noteDensity: number // 노트 밀도 (노트/초)
    syncopationRatio: number // 싱코페이션 비율 (%)
  }
  pitchAccuracy: {
    intonationAccuracy: number // 인톤 정확도 (0-100)
    averageError: number // 평균 오차 (센트)
  }
  technique: {
    vibratoRatio: number // 비브라토 사용 비율 (%)
    spectralCentroid: number // spectral centroid 평균 (Hz)
  }
  timbre: {
    spectralCentroid: number // 소리 밝기 (밝은지/어두운지)
    spectralRolloff: number // 고역 에너지 비율 (%)
    harmonicity: number // 배음 구조 품질 (0-100)
    formantEnergy: string // 포먼트 대역 에너지 특성
  }
  overallScore: number
  matchPercentage: number // 원곡과의 적합도 (0-100)
  recommendation: string // 추천 이유
}

export type CoverGrowthSong = Song & {
  coverArtist: string
  vocalStyle: string[]
  growthPoint: string
  coverThumbnailUrl?: string
  views?: string
  likes?: string
  comments?: string
}
