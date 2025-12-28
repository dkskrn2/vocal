"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockSongs, mockCoverGrowthSongs } from "@/lib/mock-songs"
import {
  Music2,
  TrendingUp,
  Heart,
  Clock,
  Music,
  ExternalLink,
  Upload,
  Mic,
  Sparkles,
  AlertCircle,
  Search,
  X,
  MessageCircle,
  CheckCircle2,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import type { Song, SongCategory, SongAnalysisStatus, SongAnalysisResult, SongLanguage } from "@/types/domain"

const categoryLabels: Record<SongCategory, string> = {
  kpop_idol: "아이돌/K-POP",
  ballad: "발라드",
  dance_pop: "댄스/팝",
  rock_band: "락/밴드",
  rnb_soul: "알앤비/소울",
  hiphop: "힙합/랩",
  anime: "애니송",
  game: "게임 OST",
  vocaloid: "보컬로이드",
  jpop: "J-POP",
  pop_song: "POP-SONG",
  ost_drama_movie: "드라마/영화 OST",
}

const countryLabels: Record<SongLanguage | "all", string> = {
  all: "전체",
  ko: "한국",
  en: "영미권",
  jp: "일본",
  etc: "기타",
}

type SortOption = "match" | "difficulty_asc" | "difficulty_desc" | "title" | "recent"

const sortLabels: Record<SortOption, string> = {
  match: "매칭률 높은 순",
  difficulty_asc: "난이도 낮은 순",
  difficulty_desc: "난이도 높은 순",
  title: "제목순",
  recent: "최신순",
}

const personalizedCategories: SongCategory[] = ["ballad", "rnb_soul", "ost_drama_movie"]

export const SongsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<SongCategory | "all">(personalizedCategories[0] || "all")
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState<SongAnalysisStatus>("idle")
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<SongAnalysisResult | null>(null)
  const [favoriteSongs, setFavoriteSongs] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  const [selectedCountry, setSelectedCountry] = useState<SongLanguage | "all">("all")
  const [sortBy, setSortBy] = useState<SortOption>("match")

  const filteredSongs = mockSongs
    .filter((song) => {
      const matchesSearch =
        searchQuery === "" ||
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || song.category === selectedCategory
      const matchesCountry = selectedCountry === "all" || song.language === selectedCountry
      return matchesSearch && matchesCategory && matchesCountry
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "match":
          return 0 // 기본 순서 (매칭률은 목 데이터에 없으므로 기본 순서)
        case "difficulty_asc":
          const diffOrder = { easy: 1, medium: 2, hard: 3 }
          return diffOrder[a.difficulty] - diffOrder[b.difficulty]
        case "difficulty_desc":
          const diffOrderDesc = { easy: 3, medium: 2, hard: 1 }
          return diffOrderDesc[a.difficulty] - diffOrderDesc[b.difficulty]
        case "title":
          return a.title.localeCompare(b.title, "ko")
        case "recent":
          return (b.releaseYear || 0) - (a.releaseYear || 0)
        default:
          return 0
      }
    })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setAnalysisStatus("uploading")
    setAnalysisProgress(0)

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          startAnalysis()
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const startAnalysis = () => {
    setAnalysisStatus("analyzing")
    setAnalysisProgress(0)

    // Simulate analysis progress
    const analysisInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(analysisInterval)
          showAnalysisResult()
          return 100
        }
        return prev + 5
      })
    }, 300)
  }

  const showAnalysisResult = () => {
    setAnalysisStatus("completed")
    setAnalysisResult({
      vocalRange: {
        lowest: "C3",
        highest: "E5",
        comfortable: "A3-D5",
        rangeWidth: 28,
      },
      difficulty: {
        rangeWidth: 28,
        highNoteDuration: 35,
        jumpSize: 4.2,
      },
      rhythm: {
        bpm: selectedSong?.bpm || 120,
        noteDensity: 3.5,
        syncopationRatio: 15,
      },
      pitchAccuracy: {
        intonationAccuracy: 88,
        averageError: 12,
      },
      technique: {
        vibratoRatio: 40,
        spectralCentroid: 2800, // Hz
      },
      timbre: {
        spectralCentroid: 2800,
        spectralRolloff: 65,
        harmonicity: 82,
        formantEnergy: "중역대 강조",
      },
      overallScore: 88,
      matchPercentage: 89,
      recommendation:
        "음역대가 당신의 편안한 범위와 95% 일치하며, 템포도 적절합니다. 고음 지속 비율이 높지 않아 안정적으로 부를 수 있는 곡입니다.",
    })
  }

  const resetAnalysis = () => {
    setAnalysisStatus("idle")
    setAnalysisProgress(0)
    setAnalysisResult(null)
  }

  const openAnalysisDialog = () => {
    setShowAnalysisDialog(true)
    resetAnalysis()
  }

  const closeAnalysisDialog = () => {
    setShowAnalysisDialog(false)
    resetAnalysis()
  }

  const toggleFavorite = (songId: string) => {
    setFavoriteSongs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(songId)) {
        newSet.delete(songId)
      } else {
        newSet.add(songId)
      }
      return newSet
    })
  }

  const isFavorite = (songId: string) => favoriteSongs.has(songId)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "medium":
        return "bg-sky-500/20 text-sky-400 border-sky-500/30"
      case "hard":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "쉬움"
      case "medium":
        return "보통"
      case "hard":
        return "어려움"
      default:
        return difficulty
    }
  }

  const getLanguageLabel = (language: string) => {
    switch (language) {
      case "ko":
        return "한국어"
      case "en":
        return "영어"
      case "jp":
        return "일본어"
      default:
        return language
    }
  }

  const getMatchScore = (songId: string): number => {
    const hash = songId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return 80 + (hash % 20)
  }

  const getRecommendationMessage = (score: number, isTrending: boolean) => {
    if (isTrending) {
      if (score >= 80) {
        return { icon: Sparkles, text: "지금 바로 커버해볼까요?", color: "text-emerald-400" }
      } else if (score >= 60) {
        return { icon: Music2, text: "도전해볼 만한 곡이에요", color: "text-sky-400" }
      } else {
        return { icon: AlertCircle, text: "안맞을 수 있어요", color: "text-orange-400" }
      }
    } else {
      if (score >= 90) {
        return { icon: Sparkles, text: "완벽해요! 지금 바로 시작하세요", color: "text-emerald-400" }
      } else if (score >= 80) {
        return { icon: Heart, text: "강력 추천합니다", color: "text-pink-400" }
      } else {
        return { icon: Music2, text: "적합한 곡이에요", color: "text-sky-400" }
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full overflow-hidden">
      <div className="flex-1 space-y-4 md:space-y-6 overflow-y-auto lg:pr-4">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left: Summary */}
          <Card className="lg:col-span-4 glass-panel border-primary/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 relative overflow-hidden border-white/10">
            <CardContent className="p-6 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">오늘의 추천 TOP 3</h2>
              </div>
              <p className="text-sm text-white/70 mb-6">
                회원님의 보컬 스타일을 분석하여
                <br />딱 맞는 곡을 찾아냈어요.
              </p>
              <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-full bg-indigo-500/20">
                    <Mic className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">내 보컬 요약</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/90 font-medium">맑고 밝은 톤 / 여성 중고음</p>
                  <p className="text-xs text-white/60">발라드·댄스 장르가 가장 잘 어울려요</p>
                </div>
              </div>
            </CardContent>
            {/* Decorative Elements */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl" />
          </Card>

          {/* Right: Recommendations */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: "h1",
                title: "밤하늘의 별을",
                artist: "경서",
                matchRate: 98,
                matchDetail: "당신의 평균 음역대(A3-D5)와 98% 일치",
                growthBenefit: "이 곡 연습 시 → 고음 안정성 ↑ 25%",
                color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
              },
              {
                id: "h2",
                title: "Ditto",
                artist: "NewJeans",
                matchRate: 94,
                matchDetail: "같은 보컬 타입 스트리머 8/10명이 선택",
                growthBenefit: "이 곡 연습 시 → 호흡 조절력 ↑ 30%",
                color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
              },
              {
                id: "h3",
                title: "Love Dive",
                artist: "IVE",
                matchRate: 92,
                matchDetail: "당신의 톤 특성과 92% 일치",
                growthBenefit: "이 곡 연습 시 → 리듬감 ↑ 20%",
                color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
              },
            ].map((song) => (
              <Card
                key={song.id}
                className="glass-panel group cursor-pointer hover:border-white/30 transition-all hover:-translate-y-1"
                onClick={() => {
                  const targetSong = mockSongs.find((s) => s.title === song.title)
                  if (targetSong) setSelectedSong(targetSong)
                }}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-black/40 mb-3 group-hover:shadow-lg transition-all">
                    <div className="absolute inset-0 flex items-center justify-center text-white/20">
                      <Music className="h-10 w-10" />
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/20 shadow-sm flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 text-yellow-400" />
                      {song.matchRate}%
                    </div>
                  </div>
                  <div className="space-y-1 mb-3 flex-1">
                    <h3 className="font-bold text-white truncate">{song.title}</h3>
                    <p className="text-xs text-white/60 truncate">{song.artist}</p>
                  </div>
                  <div className="space-y-1.5 mb-2">
                    <div className="text-[10px] text-white/70 flex items-start gap-1">
                      <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5 text-emerald-400" />
                      <span className="line-clamp-2">{song.matchDetail}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-400 flex items-start gap-1">
                      <TrendingUp className="h-3 w-3 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{song.growthBenefit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-gradient-brand-main opacity-0 group-hover:opacity-10 transition-opacity rounded-xl blur-lg" />
          <div className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center focus-within:ring-1 focus-within:ring-white/30 focus-within:border-white/30 transition-all hover:bg-white/10">
            <Search className="h-5 w-5 text-white/40 ml-4" />
            <Input
              type="text"
              placeholder="찾고 싶은 곡이나 아티스트를 검색해보세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent h-12 text-base text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 w-full"
            />
          </div>
        </div>

        <Card className="glass-panel p-4 md:p-6 space-y-6 mb-8">
          {/* Categories */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${personalizedCategories.includes(selectedCategory as SongCategory) ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}
                >
                  {personalizedCategories.includes(selectedCategory as SongCategory)
                    ? "✨ 당신의 스타일에 딱 맞는 장르예요!"
                    : "🎸 새로운 스타일에 도전해보시나요?"}
                </span>
              </div>
            </div>
            <Tabs
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as SongCategory | "all")}
              className="w-full"
            >
              <TabsList className="w-full flex flex-nowrap overflow-x-auto gap-2 bg-transparent justify-start p-0 no-scrollbar pb-1">
                <TabsTrigger
                  value="all"
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 data-[state=active]:bg-gradient-brand-main data-[state=active]:border-transparent transition-all"
                >
                  전체
                </TabsTrigger>
                {Object.entries(categoryLabels).map(([key, label]) => {
                  const isPersonalized = personalizedCategories.includes(key as SongCategory)
                  return (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="shrink-0 rounded-full border border-white/10 bg-white/5 data-[state=active]:bg-gradient-brand-main data-[state=active]:border-transparent transition-all flex items-center gap-1.5"
                    >
                      {label}
                      {isPersonalized && <Sparkles className="h-3 w-3 text-yellow-300 fill-yellow-300/20" />}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </div>

          {searchQuery.length > 0 && (
            <>
              <div className="h-px bg-white/5 w-full" />

              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedCountry}
                    onValueChange={(value) => setSelectedCountry(value as SongLanguage | "all")}
                  >
                    <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-xs">
                      <SelectValue placeholder="국가 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(countryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-[120px] bg-white/5 border-white/10 text-xs">
                      <SelectValue placeholder="정렬 방식" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sortLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Cover Fit Growth Songs Section */}
        {searchQuery === "" && (
          <div className="mb-8">
            <div className="mb-4">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Cover Fit 성장 곡
              </h1>
              <p className="text-xs md:text-sm text-[#b5bac1] mt-1">
                다른 보컬들의 성장을 이끌어낸 커버 곡들을 확인해보세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {mockCoverGrowthSongs.map((song) => (
                <Card
                  key={song.id}
                  className="glass-panel cursor-pointer hover:bg-white/10 transition-all group overflow-hidden border-yellow-500/20 flex flex-col h-full"
                  onClick={() => setSelectedSong(song)}
                >
                  {/* Thumbnail Section */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/20">
                    {song.coverThumbnailUrl ? (
                      <img
                        src={song.coverThumbnailUrl || "/placeholder.svg"}
                        alt={`${song.coverArtist}'s cover`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                        <Music2 className="h-8 w-8 text-yellow-500/50" />
                      </div>
                    )}

                    {/* Overlay Play Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12 border border-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(
                            song.youtubeUrl || `https://www.youtube.com/results?search_query=${song.title} cover`,
                            "_blank",
                          )
                        }}
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-yellow-300 text-[10px] border border-yellow-500/30 backdrop-blur-md">
                      {song.coverArtist}
                    </div>
                  </div>

                  <CardContent className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <h3 className="font-bold text-white line-clamp-1 text-sm">{song.title}</h3>
                      <p className="text-xs text-[#b5bac1] line-clamp-1">{song.artist}</p>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    <div className="flex flex-wrap gap-1">
                      {song.vocalStyle.map((style) => (
                        <span
                          key={style}
                          className="text-[10px] text-[#b5bac1] bg-white/5 px-1.5 py-0.5 rounded border border-white/5"
                        >
                          #{style}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-1 space-y-2">
                      <div className="text-[10px] text-yellow-200/90 bg-yellow-500/10 p-2 rounded border border-yellow-500/20 flex gap-1.5 items-start">
                        <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{song.growthPoint}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[#b5bac1] px-1">
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3 fill-[#b5bac1]" /> {song.views || "1.2k"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 fill-[#b5bac1]" /> {song.likes || "150"}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 fill-[#b5bac1]" /> {song.comments || "32"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {searchQuery === "" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Trending Songs */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  지금 뜨는 곡
                </CardTitle>
                <p className="text-xs text-[#b5bac1] mt-1">요즘 인기 있는 트렌드 커버곡</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockSongs.slice(0, 5).map((song, index) => {
                  const matchScore = 75 - index * 5
                  const recommendation = getRecommendationMessage(matchScore, true)
                  const RecommendIcon = recommendation.icon

                  return (
                    <div
                      key={song.id}
                      onClick={() => setSelectedSong(song)}
                      className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer group"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 group-hover:shadow-lg transition-all">
                        {(song as any).youtubeUrl ? (
                          <img
                            src={`https://img.youtube.com/vi/${(song as any).youtubeUrl}/default.jpg`}
                            alt={song.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <Music className="h-6 w-6 text-white/20" />
                          </div>
                        )}
                        <div className="absolute top-0 left-0 w-6 h-6 bg-black/60 flex items-center justify-center rounded-br-lg backdrop-blur-sm">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                            <Play className="h-3 w-3 text-white fill-white" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold text-white mb-0.5 line-clamp-1">{song.title}</div>
                            <div className="text-xs text-[#b5bac1] mb-2">{song.artist}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getDifficultyColor(song.difficulty)}`}
                            >
                              {getDifficultyLabel(song.difficulty)}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1 text-[10px] ${recommendation.color} ml-auto`}>
                            <RecommendIcon className="h-3 w-3" />
                            <span>{recommendation.text}</span>
                            <span className="text-[#b5bac1]">· 유사도 {matchScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Personalized Songs */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  나에게 딱 맞는 곡
                </CardTitle>
                <p className="text-xs text-[#b5bac1] mt-1">보컬 스타일 최적화 곡</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockSongs.slice(5, 10).map((song, index) => {
                  const matchScore = 95 - index * 2
                  const recommendation = getRecommendationMessage(matchScore, false)
                  const RecommendIcon = recommendation.icon

                  return (
                    <div
                      key={song.id}
                      onClick={() => setSelectedSong(song)}
                      className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer group"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 group-hover:shadow-lg transition-all">
                        {(song as any).youtubeUrl ? (
                          <img
                            src={`https://img.youtube.com/vi/${(song as any).youtubeUrl}/default.jpg`}
                            alt={song.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-secondary/20 to-brand-primary/20 flex items-center justify-center">
                            <Music className="h-6 w-6 text-white/20" />
                          </div>
                        )}
                        <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-black/80 rounded-bl-lg flex items-center gap-0.5 border-l border-b border-white/10">
                          <span className="text-[10px] font-bold text-green-400">{matchScore}%</span>
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                            <Play className="h-3 w-3 text-white fill-white" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold text-white mb-0.5 line-clamp-1">{song.title}</div>
                            <div className="text-xs text-[#b5bac1] mb-2">{song.artist}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getDifficultyColor(song.difficulty)}`}
                            >
                              {getDifficultyLabel(song.difficulty)}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1 text-[10px] ${recommendation.color} ml-auto`}>
                            <RecommendIcon className="h-3 w-3" />
                            <span>{recommendation.text}</span>
                            <span className="text-[#b5bac1]">· 유사도 {matchScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSongs.map((song) => {
            const matchScore = getMatchScore(song.id)
            const recommendation = getRecommendationMessage(matchScore, false)
            const RecommendIcon = recommendation.icon

            return (
              <div
                key={song.id}
                onClick={() => setSelectedSong(song)}
                className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer group"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 group-hover:shadow-lg transition-all">
                  {(song as any).youtubeUrl ? (
                    <img
                      src={`https://img.youtube.com/vi/${(song as any).youtubeUrl}/default.jpg`}
                      alt={song.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Music className="h-6 w-6 text-white/20" />
                    </div>
                  )}
                  <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-black/80 rounded-bl-lg flex items-center gap-0.5 border-l border-b border-white/10">
                    <span className="text-[10px] font-bold text-green-400">{matchScore}%</span>
                  </div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                      <Play className="h-3 w-3 text-white fill-white" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-white mb-0.5 line-clamp-1">{song.title}</div>
                      <div className="text-xs text-[#b5bac1] mb-2">{song.artist}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getDifficultyColor(song.difficulty)}`}
                      >
                        {getDifficultyLabel(song.difficulty)}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] ${recommendation.color} ml-auto`}>
                      <RecommendIcon className="h-3 w-3" />
                      <span className="text-[#b5bac1]">유사도 {matchScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredSongs.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <Music className="h-12 w-12 text-[#b5bac1] mx-auto opacity-50" />
            <p className="text-white font-medium">검색 결과가 없습니다</p>
            <p className="text-xs text-[#b5bac1]">다른 키워드로 검색해보세요</p>
          </div>
        )}
      </div>

      {selectedSong && (
        <div className="w-96 shrink-0">
          <Card className="glass-panel sticky top-4">
            {"coverArtist" in selectedSong ? (
              <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
                {/* Cover Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white">{selectedSong.title}</h2>
                      <span className="px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold border border-brand-primary/30">
                        Cover Fit
                      </span>
                    </div>
                    <p className="text-[#b5bac1] flex items-center gap-2 text-sm">
                      Original by <span className="text-white font-medium">{selectedSong.artist}</span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedSong(null)}
                    className="text-[#b5bac1] hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Original Info */}
                  <div className="glass-panel p-4 space-y-4 bg-white/5 border-white/10">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <Music2 className="h-4 w-4 text-[#b5bac1]" />
                      <h3 className="font-semibold text-white text-sm">원곡 정보</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[#b5bac1]">아티스트</span>
                        <span className="text-white font-medium">{selectedSong.artist}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#b5bac1]">장르</span>
                        <span className="text-white">{selectedSong.genre}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#b5bac1]">난이도</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(selectedSong.difficulty)}`}
                        >
                          {getDifficultyLabel(selectedSong.difficulty)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#b5bac1]">최고음</span>
                        <span className="text-white font-mono">{selectedSong.peakNote}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#b5bac1]">나와의 유사도</span>
                        <span className="text-green-400 font-bold">{getMatchScore(selectedSong.id)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Cover Info */}
                  <div className="glass-panel p-4 space-y-4 bg-brand-primary/5 border-brand-primary/20">
                    <div className="flex items-center gap-2 pb-2 border-b border-brand-primary/20">
                      <Mic className="h-4 w-4 text-brand-primary" />
                      <h3 className="font-semibold text-white text-sm">커버 분석</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[#b5bac1]">Covered by</span>
                        <span className="text-white font-bold text-brand-primary">
                          {(selectedSong as any).coverArtist}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[#b5bac1] text-xs">보컬 스타일</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedSong as any).vocalStyle?.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary text-xs border border-brand-primary/30"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-brand-primary/10 p-3 rounded-lg border border-brand-primary/20">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="h-3 w-3 text-brand-primary" />
                          <span className="text-xs font-bold text-brand-primary">Growth Point</span>
                        </div>
                        <p className="text-xs text-brand-primary/90 leading-relaxed">
                          {(selectedSong as any).growthPoint}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video / Stats Section */}
                <div className="space-y-4">
                  {(selectedSong as any).coverThumbnailUrl && (
                    <div
                      className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 group cursor-pointer shadow-lg"
                      onClick={() => window.open((selectedSong as any).youtubeUrl, "_blank")}
                    >
                      <img
                        src={(selectedSong as any).coverThumbnailUrl || "/placeholder.svg"}
                        alt="Cover Thumbnail"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                          <Play className="h-6 w-6 text-white fill-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <div className="px-2 py-1 rounded-full bg-black/60 backdrop-blur text-xs text-white border border-white/10 flex items-center gap-1.5">
                          <Play className="h-3 w-3" /> {(selectedSong as any).views || "15K"}
                        </div>
                        <div className="px-2 py-1 rounded-full bg-black/60 backdrop-blur text-xs text-white border border-white/10 flex items-center gap-1.5">
                          <Heart className="h-3 w-3 text-red-400" /> {(selectedSong as any).likes || "800"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                    variant="outline"
                    onClick={() => window.open((selectedSong as any).youtubeUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Youtube에서 원본 보기
                  </Button>
                  <Button className="flex-1 gradient-brand-main text-white border-0" onClick={openAnalysisDialog}>
                    <Mic className="h-4 w-4 mr-2" />이 스타일 분석하기
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-white">{selectedSong.title}</CardTitle>
                    <p className="text-sm text-[#b5bac1]">{selectedSong.artist}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedSong(null)}
                    className="h-8 w-8 text-[#b5bac1] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[75vh] overflow-y-auto">
                  {selectedSong.youtubeUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/20">
                      <img
                        src={`https://img.youtube.com/vi/${selectedSong.youtubeUrl}/maxresdefault.jpg`}
                        alt={selectedSong.title}
                        className="w-full h-full object-cover"
                      />
                      <a
                        href={`https://youtube.com/watch?v=${selectedSong.youtubeUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group"
                      >
                        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ExternalLink className="h-6 w-6 text-white" />
                        </div>
                      </a>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Music className="h-4 w-4 text-[#b5bac1]" />
                      <span className="text-[#b5bac1]">장르:</span>
                      <span className="text-white">{selectedSong.genre}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-[#b5bac1]" />
                      <span className="text-[#b5bac1]">난이도:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(selectedSong.difficulty)}`}
                      >
                        {getDifficultyLabel(selectedSong.difficulty)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#b5bac1]">언어:</span>
                      <span className="text-white">{getLanguageLabel(selectedSong.language)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#b5bac1]">최고음:</span>
                      <span className="text-white font-mono">{selectedSong.peakNote}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#b5bac1]">나와의 유사도:</span>
                      <span className="text-green-400 font-bold">{getMatchScore(selectedSong.id)}%</span>
                    </div>
                    {selectedSong.bpm && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[#b5bac1]" />
                        <span className="text-[#b5bac1]">BPM:</span>
                        <span className="text-white">{selectedSong.bpm}</span>
                      </div>
                    )}
                    {selectedSong.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#b5bac1]">재생시간:</span>
                        <span className="text-white">{selectedSong.duration}</span>
                      </div>
                    )}
                    {selectedSong.releaseYear && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#b5bac1]">발매년도:</span>
                        <span className="text-white">{selectedSong.releaseYear}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={`flex-1 ${
                        isFavorite(selectedSong.id)
                          ? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20"
                          : ""
                      }`}
                      onClick={() => toggleFavorite(selectedSong.id)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite(selectedSong.id) ? "fill-red-500" : ""}`} />
                      {isFavorite(selectedSong.id) ? "찜 취소" : "찜하기"}
                    </Button>
                    <Button
                      className="flex-1 gradient-brand-main/30 hover:gradient-brand-main/50"
                      onClick={openAnalysisDialog}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      스타일 분석하기
                    </Button>
                  </div>

                  {selectedSong.lyrics && (
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-sm font-semibold text-white mb-2">가사 미리보기</h4>
                      <p className="text-xs text-[#b5bac1] whitespace-pre-line line-clamp-6">{selectedSong.lyrics}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />이 커버를 선택해야 하는 이유
                    </h4>
                    <div className="space-y-3">
                      {/* Data-driven match reasons */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-semibold text-emerald-400">음역 매칭</span>
                        </div>
                        <p className="text-xs text-white/90">
                          당신의 편안한 음역대(A3-D5)와 <strong className="text-emerald-400">94% 일치</strong>합니다.
                          무리 없이 안정적으로 소화할 수 있는 곡입니다.
                        </p>
                      </div>

                      {/* Peer success data */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-4 w-4 text-blue-400" />
                          <span className="text-xs font-semibold text-blue-400">검증된 선택</span>
                        </div>
                        <p className="text-xs text-white/90">
                          <strong className="text-blue-400">같은 보컬 타입 스트리머 10명 중 7명</strong>이 이 곡으로
                          성공적인 커버를 완성했습니다.
                        </p>
                      </div>

                      {/* Growth benefit */}
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-purple-400" />
                          <span className="text-xs font-semibold text-purple-400">성장 포인트</span>
                        </div>
                        <p className="text-xs text-white/90 mb-2">이 곡을 연습하면:</p>
                        <ul className="text-xs text-white/80 space-y-1 ml-4">
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-400">→</span>
                            고음 안정성 <strong className="text-emerald-400">↑ 25%</strong>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-400">→</span>
                            후렴 구간 호흡 연습에 <strong className="text-emerald-400">최적</strong>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-400">→</span>
                            감정선 표현력 <strong className="text-emerald-400">↑ 30%</strong>
                          </li>
                        </ul>
                      </div>

                      {/* Original generic reason as fallback */}
                      <div className="glass-panel p-3">
                        <p className="text-xs text-white/70 leading-relaxed">
                          {selectedSong.recommendationReason ||
                            "담백한 감정 표현이 중요한 곡으로 당신의 스타일과 잘 어울립니다. 저음 안정형 보컬에 최적화되어 있습니다."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-2">곡의 특징</h4>
                    <p className="text-xs text-[#b5bac1]">
                      {selectedSong.characteristics ||
                        "감정선이 풍부한 발라드 곡으로, 차분한 템포에서 시작해 점진적으로 고조되는 구조입니다. 중저음 중심의 멜로디 라인이 특징이며, 호흡 조절이 중요한 곡입니다."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-2">추천 이유</h4>
                    <p className="text-xs text-[#b5bac1]">
                      {selectedSong.recommendationReason ||
                        "당신의 보컬 스타일과 95% 일치하는 곡입니다. 편안한 음역대(A3~D5)에서 부를 수 있으며, 저음 안정형 보컬에 최적화되어 있습니다. 담백한 감정 표현이 중요한 곡으로 당신의 스타일과 잘 어울립니다."}
                    </p>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}

      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1e1f22] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">{selectedSong?.title} - 스타일 분석</DialogTitle>
          </DialogHeader>

          {analysisStatus === "idle" && (
            <div className="space-y-4 py-6">
              <div className="glass-panel p-4 space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  녹음 환경 세팅 팁
                </h4>
                <ul className="text-xs text-[#b5bac1] space-y-1.5 list-disc list-inside">
                  <li>마이크와 10-15cm 거리를 유지하세요</li>
                  <li>고음이 많은 곡은 마이크 게인을 조금 낮추세요</li>
                  <li>발라드 곡은 리버브를 평소보다 10-20% 더 추가하세요</li>
                  <li>표면이 거친 방음재로 에코를 최소화하세요</li>
                  <li>헤드폰을 착용하고 MR을 들으며 녹음하세요</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center space-y-4">
                <Upload className="h-12 w-12 text-[#b5bac1] mx-auto" />
                <div>
                  <p className="text-white font-medium mb-2">커버 파일을 업로드해주세요</p>
                  <p className="text-xs text-[#b5bac1] mt-1">MP3, WAV 파일 지원 (최대 50MB)</p>
                </div>
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload" />
                <label htmlFor="audio-upload">
                  <Button className="gradient-brand-main/30 hover:gradient-brand-main/50" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      파일 선택
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          )}

          {analysisStatus === "uploading" && (
            <div className="space-y-4 py-6">
              <div className="text-center space-y-4">
                <Upload className="h-12 w-12 text-[#b5bac1] mx-auto animate-pulse" />
                <div>
                  <p className="text-white font-medium">파일 업로드 중...</p>
                  <p className="text-xs text-[#b5bac1] mt-1">{analysisProgress}%</p>
                </div>
                <Progress value={analysisProgress} className="max-w-md mx-auto" />
              </div>
            </div>
          )}

          {analysisStatus === "analyzing" && (
            <div className="space-y-4 py-6">
              <div className="text-center space-y-4">
                <Mic className="h-12 w-12 text-[#b5bac1] mx-auto animate-pulse" />
                <div>
                  <p className="text-white font-medium">보컬 스타일 분석 중...</p>
                  <p className="text-xs text-[#b5bac1] mt-1">음정, 박자, 발음, 톤을 분석하고 있습니다</p>
                </div>
                <Progress value={analysisProgress} className="max-w-md mx-auto" />
              </div>
            </div>
          )}

          {analysisStatus === "completed" && analysisResult && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-brand-main text-white text-3xl font-bold">
                  {analysisResult.overallScore}
                </div>
                <p className="text-white font-medium">종합 점수</p>
                <p className="text-xs text-[#b5bac1]">원곡과의 적합도: {analysisResult.matchPercentage}%</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 음역/키 */}
                <div className="glass-panel p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white">음역/키</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#b5bac1]">최저음</span>
                      <p className="text-white font-mono mt-1">{analysisResult.vocalRange.lowest}</p>
                    </div>
                    <div>
                      <span className="text-[#b5bac1]">최고음</span>
                      <p className="text-white font-mono mt-1">{analysisResult.vocalRange.highest}</p>
                    </div>
                    <div>
                      <span className="text-[#b5bac1]">편안한 음역</span>
                      <p className="text-white font-mono mt-1">{analysisResult.vocalRange.comfortable}</p>
                    </div>
                    <div>
                      <span className="text-[#b5bac1]">음역 폭</span>
                      <p className="text-white font-mono mt-1">{analysisResult.vocalRange.rangeWidth} 반음</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-gradient-brand">
                      {analysisResult.vocalRange.rangeWidth > 30
                        ? "매우 넓은 음역대를 가지고 있어요"
                        : analysisResult.vocalRange.rangeWidth > 20
                          ? "적당한 음역대를 가지고 있어요"
                          : "안정적인 음역대에요"}
                    </p>
                  </div>
                </div>

                {/* 난이도 */}
                <div className="glass-panel p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white">난이도 분석</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#b5bac1]">음역 폭</span>
                      <span className="text-white font-mono">{analysisResult.difficulty.rangeWidth} 반음</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#b5bac1]">고음 지속 비율</span>
                      <span className="text-white">{analysisResult.difficulty.highNoteDuration}%</span>
                    </div>
                    <Progress value={analysisResult.difficulty.highNoteDuration} className="h-2" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#b5bac1]">평균 음정 점프</span>
                      <span className="text-white font-mono">{analysisResult.difficulty.jumpSize} 반음</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-gradient-brand">
                      {analysisResult.difficulty.highNoteDuration > 40
                        ? "도전적인 곡이에요, 충분한 연습이 필요해요"
                        : analysisResult.difficulty.highNoteDuration > 20
                          ? "적당한 난이도로 연습하기 좋아요"
                          : "부담 없이 편하게 부를 수 있어요"}
                    </p>
                  </div>
                </div>

                {/* 리듬/템포 */}
                <div className="glass-panel p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white">리듬/템포</h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[#b5bac1]">BPM</span>
                      <p className="text-white font-mono mt-1">{analysisResult.rhythm.bpm}</p>
                    </div>
                    <div>
                      <span className="text-[#b5bac1]">노트 밀도</span>
                      <p className="text-white font-mono mt-1">{analysisResult.rhythm.noteDensity}/초</p>
                    </div>
                    <div>
                      <span className="text-[#b5bac1]">싱코페이션</span>
                      <p className="text-white mt-1">{analysisResult.rhythm.syncopationRatio}%</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-gradient-brand">
                      {analysisResult.rhythm.bpm > 140
                        ? "템포가 빨라 흥겨운 느낌이에요"
                        : analysisResult.rhythm.bpm > 90
                          ? "안정적인 템포예요"
                          : "느린 템포로 감성적이에요"}
                    </p>
                  </div>
                </div>

                {/* 음정 정확도 */}
                <div className="glass-panel p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white">음정 정확도</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#b5bac1]">인톤 정확도</span>
                      <span className="text-white font-bold">{analysisResult.pitchAccuracy.intonationAccuracy}점</span>
                    </div>
                    <Progress value={analysisResult.pitchAccuracy.intonationAccuracy} className="h-2" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#b5bac1]">평균 오차</span>
                      <span className="text-white font-mono">{analysisResult.pitchAccuracy.averageError} 센트</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-gradient-brand">
                      {analysisResult.pitchAccuracy.intonationAccuracy > 90
                        ? "음정이 매우 정확해요!"
                        : analysisResult.pitchAccuracy.intonationAccuracy > 75
                          ? "음정이 안정적이에요"
                          : "음정 연습이 조금 더 필요해요"}
                    </p>
                  </div>
                </div>

                {/* 테크닉/스타일 */}
                <div className="glass-panel p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white">테크닉/스타일</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#b5bac1]">비브라토 사용 비율</span>
                      <span className="text-white">{analysisResult.technique.vibratoRatio}%</span>
                    </div>
                    <Progress value={analysisResult.technique.vibratoRatio} className="h-2" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#b5bac1]">Spectral Centroid</span>
                      <span className="text-white font-mono">{analysisResult.technique.spectralCentroid} Hz</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-gradient-brand">
                      {analysisResult.technique.vibratoRatio > 35
                        ? "비브라토를 풍부하게 사용하고 있어요"
                        : analysisResult.technique.vibratoRatio > 15
                          ? "비브라토를 적절히 사용하고 있어요"
                          : "비브라토를 거의 사용하지 않아요"}
                    </p>
                  </div>
                </div>

                {/* 음색/톤 */}
                <div className="glass-panel p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white">음색/톤 (Timbre)</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#b5bac1]">소리 밝기</span>
                      <span className="text-white font-mono">{analysisResult.timbre.spectralCentroid} Hz</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#b5bac1]">고역 에너지 비율</span>
                      <span className="text-white">{analysisResult.timbre.spectralRolloff}%</span>
                    </div>
                    <Progress value={analysisResult.timbre.spectralRolloff} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-[#b5bac1]">배음 구조 품질</span>
                      <span className="text-white">{analysisResult.timbre.harmonicity}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#b5bac1]">포먼트 에너지</span>
                      <span className="text-white">{analysisResult.timbre.formantEnergy}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-gradient-brand">
                      {analysisResult.timbre.spectralCentroid > 3000
                        ? "맑고 밝은 음색을 가지고 있어요"
                        : analysisResult.timbre.spectralCentroid > 2500
                          ? "부드럽고 중성적인 음색이에요"
                          : "따뜻하고 어두운 음색이에요"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 분석 결과 및 추천 이유 */}
              <div className="glass-panel p-4 space-y-2">
                <h4 className="text-sm font-semibold text-white">분석 결과 및 추천 이유</h4>
                <p className="text-xs text-[#b5bac1]">{analysisResult.recommendation}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={closeAnalysisDialog}
                  variant="outline"
                  className="w-full border-white/20 hover:bg-white/5 bg-transparent"
                >
                  확인
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
