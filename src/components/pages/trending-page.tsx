"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Play, Music, Flame, Trophy, ExternalLink, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { SongCategory } from "@/types/domain"
import {
  getLatestChartAction,
  getMonthlyChartAction,
  getChartCoverVideosAction,
  type ChartEntry,
  type CoverVideo as ChartCoverVideo,
} from "@/app/actions/chart-actions"

type TrendingPeriod = "weekly" | "monthly"

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

interface CoverVideo {
  rank: number
  youtuber: string
  channelName: string
  views: number
  youtubeUrl: string
  uploadDate: string
  thumbnailUrl: string
  vocalStyle: string[]
}

interface TrendingSong {
  rank: number
  previousRank: number
  title: string
  artist: string
  videoId: string
  viewCount: number
  category: SongCategory
  isNew?: boolean
  rankChange: number
  topCovers: CoverVideo[]
}

export const TrendingPage = () => {
  const [period, setPeriod] = useState<TrendingPeriod>("weekly")
  const [category, setCategory] = useState<SongCategory | "all">("all")
  const [expandedSong, setExpandedSong] = useState<number | null>(null)
  const [trendingSongs, setTrendingSongs] = useState<TrendingSong[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingCovers, setLoadingCovers] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const fetchTrendingSongs = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = period === "weekly" ? await getLatestChartAction() : await getMonthlyChartAction()

        if (!result.success || !result.data) {
          setError(result.error || "데이터를 불러올 수 없습니다")
          setTrendingSongs([])
        } else {
          // Transform ChartEntry to TrendingSong format
          const songs: TrendingSong[] = result.data.map((entry: ChartEntry) => {
            const rankChange = parseRankChange(entry.rankChange)

            return {
              rank: entry.rank,
              previousRank: entry.rank - rankChange,
              title: entry.title,
              artist: entry.artist,
              videoId: entry.videoId,
              viewCount: entry.streams,
              category: determineCategoryFromTitle(entry.title),
              isNew: entry.rankChange === "NEW",
              rankChange,
              topCovers: [],
            }
          })

          setTrendingSongs(songs)
        }
      } catch (err) {
        console.error("[v0] Error fetching trending songs:", err)
        setError("데이터를 불러오는 중 오류가 발생했습니다.")
        setTrendingSongs([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingSongs()
  }, [period])

  const parseRankChange = (rankChange: string | null): number => {
    if (!rankChange || rankChange === "-") return 0
    if (rankChange === "NEW" || rankChange === "RE") return 0

    const num = Number.parseInt(rankChange.replace("+", ""))
    return isNaN(num) ? 0 : num
  }

  const handleSongExpand = async (songRank: number) => {
    if (expandedSong === songRank) {
      setExpandedSong(null)
      return
    }

    setExpandedSong(songRank)

    const song = trendingSongs.find((s) => s.rank === songRank)
    if (!song || song.topCovers.length > 0) return

    console.log("[v0] Fetching covers for videoId:", song.videoId)

    setLoadingCovers((prev) => ({ ...prev, [songRank]: true }))

    try {
      const result = await getChartCoverVideosAction(song.videoId, 5)

      console.log("[v0] Cover videos result:", result)

      if (result.success && result.data) {
        const covers: CoverVideo[] = result.data.map((video: ChartCoverVideo, index: number) => ({
          rank: index + 1,
          youtuber: video.title,
          channelName: video.artist || extractChannelName(video.title),
          views: video.viewCount,
          youtubeUrl: video.youtubeUrl,
          uploadDate: new Date().toISOString(),
          thumbnailUrl: video.thumbnailUrl,
          vocalStyle: ["청아한"],
        }))

        setTrendingSongs((prev) => prev.map((s) => (s.rank === songRank ? { ...s, topCovers: covers } : s)))
      }
    } catch (err) {
      console.error("[v0] Error loading covers:", err)
    } finally {
      setLoadingCovers((prev) => ({ ...prev, [songRank]: false }))
    }
  }

  const determineCategoryFromTitle = (title: string): SongCategory => {
    const lowerTitle = title.toLowerCase()

    if (lowerTitle.includes("kpop") || lowerTitle.includes("k-pop")) return "kpop_idol"
    if (lowerTitle.includes("ballad") || lowerTitle.includes("발라드")) return "ballad"
    if (lowerTitle.includes("rock") || lowerTitle.includes("락")) return "rock_band"
    if (lowerTitle.includes("r&b") || lowerTitle.includes("rnb")) return "rnb_soul"
    if (lowerTitle.includes("hiphop") || lowerTitle.includes("hip hop") || lowerTitle.includes("랩")) return "hiphop"
    if (lowerTitle.includes("anime") || lowerTitle.includes("애니")) return "anime"
    if (lowerTitle.includes("game") || lowerTitle.includes("게임")) return "game"
    if (lowerTitle.includes("vocaloid") || lowerTitle.includes("보컬로이드")) return "vocaloid"
    if (lowerTitle.includes("jpop") || lowerTitle.includes("j-pop")) return "jpop"
    if (lowerTitle.includes("ost") || lowerTitle.includes("드라마") || lowerTitle.includes("영화"))
      return "ost_drama_movie"

    return "pop_song" // Default category
  }

  const extractVocalStyleFromTitle = (title: string): string[] => {
    const styles: string[] = []
    const lowerTitle = title.toLowerCase()

    if (lowerTitle.includes("청아") || lowerTitle.includes("clear")) styles.push("청아한")
    if (lowerTitle.includes("파워") || lowerTitle.includes("powerful")) styles.push("파워풀")
    if (lowerTitle.includes("허스키") || lowerTitle.includes("husky")) styles.push("허스키")
    if (lowerTitle.includes("감성") || lowerTitle.includes("emotional")) styles.push("섬세한 감성")
    if (lowerTitle.includes("고음") || lowerTitle.includes("high note")) styles.push("시원한 고음")

    if (styles.length === 0) styles.push("안정적인")

    return styles
  }

  // Helper function to extract channel name from video title
  function extractChannelName(title: string): string {
    // Try to extract channel name from various title patterns
    // Pattern 1: "- Cover by ChannelName"
    const coverByMatch = title.match(/(?:Cover|cover)\s+by\s+([^|【\]]+?)(?:\s*$|\s*[|【])/)
    if (coverByMatch) return coverByMatch[1].trim()

    // Pattern 2: "| ChannelName"
    const pipeMatch = title.match(/\|\s*([^【\]]+?)(?:\s*$|【)/)
    if (pipeMatch) return pipeMatch[1].trim()

    // Pattern 3: "【ChannelName】"
    const bracketsMatch = title.match(/【([^】]+)】/)
    if (bracketsMatch) return bracketsMatch[1].trim()

    // Pattern 4: "[ChannelName]" at the end
    const squareBracketsMatch = title.match(/\[([^\]]+)\]\s*$/)
    if (squareBracketsMatch) return squareBracketsMatch[1].trim()

    return "Unknown Artist"
  }

  const filteredTrending = trendingSongs.filter((song) => {
    if (category === "all") return true
    return song.category === category
  })

  const getPeriodLabel = () => {
    const today = new Date()
    const startDate = new Date(today)

    if (period === "weekly") {
      startDate.setDate(today.getDate() - 7)
    } else {
      startDate.setDate(today.getDate() - 30)
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}.${month}.${day}`
    }

    return `${formatDate(startDate)} - ${formatDate(today)}`
  }

  const getRankChangeIcon = (change: number, isNew?: boolean) => {
    if (isNew)
      return (
        <Badge variant="default" className="bg-emerald-500 text-white text-xs px-2">
          NEW
        </Badge>
      )
    if (change > 0)
      return <span className="text-green-500 text-xs md:text-sm flex items-center gap-0.5">▲ {change}</span>
    if (change < 0)
      return <span className="text-red-500 text-xs md:text-sm flex items-center gap-0.5">▼ {Math.abs(change)}</span>
    return <span className="text-muted-foreground text-xs md:text-sm">-</span>
  }

  const getTrophyIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
    if (rank === 2) return <Trophy className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
    if (rank === 3) return <Trophy className="h-5 w-5 md:h-6 md:w-6 text-amber-700" />
    return null
  }

  const totalViews = filteredTrending.reduce((sum, song) => sum + song.viewCount, 0)
  const topSong = filteredTrending.length > 0 ? filteredTrending[0] : null

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-gradient-to-br from-red-500 to-pink-500 p-2 md:p-3 rounded-xl">
              <Flame className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">인기곡 차트</h1>
              <p className="text-muted-foreground text-xs md:text-sm hidden sm:block">
                실시간으로 업데이트되는 커버곡 인기 순위
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">전체 조회수</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center gap-1 md:gap-2">
                <Play className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                <span className="text-lg md:text-2xl font-bold">{totalViews.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">차트 진입곡</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center gap-1 md:gap-2">
                <Music className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                <span className="text-lg md:text-2xl font-bold">{filteredTrending.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">가장 인기있는 곡</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center gap-1 md:gap-2">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                <span className="text-base md:text-lg font-bold truncate">{topSong?.title || "-"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period and Category Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 justify-between">
            <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{getPeriodLabel()}</span>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as TrendingPeriod)}>
              <TabsList className="h-8 md:h-10">
                <TabsTrigger value="weekly" className="text-xs md:text-sm">
                  주간
                </TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs md:text-sm">
                  월간
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 scrollbar-hide">
            <Button
              variant={category === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("all")}
              className="whitespace-nowrap text-xs md:text-sm flex-shrink-0"
            >
              전체
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={category === key ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(key as SongCategory)}
                className="whitespace-nowrap text-xs md:text-sm flex-shrink-0"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">인기곡 차트를 불러오는 중...</p>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">데이터를 불러올 수 없습니다</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Songs List */}
      {!isLoading && !error && (
        <div className="space-y-2 md:space-y-3">
          {filteredTrending.map((song) => (
            <Card
              key={song.rank}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSongExpand(song.rank)}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 min-w-[48px] sm:min-w-[60px]">
                      <div className="text-xl md:text-2xl font-bold text-muted-foreground w-6 md:w-8 text-right">
                        {song.rank}
                      </div>
                      {getTrophyIcon(song.rank)}
                    </div>

                    {song.videoId ? (
                      <a
                        href={`https://www.youtube.com/watch?v=${song.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`}
                          alt={song.title}
                          className="w-full sm:w-32 h-24 sm:h-20 object-cover rounded-lg hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ) : (
                      <div className="w-full sm:w-32 h-24 sm:h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Music className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base md:text-lg line-clamp-1">{song.title}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {getRankChangeIcon(song.rankChange, song.isNew)}
                        <Badge variant="secondary" className="text-xs">
                          {categoryLabels[song.category]}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Play className="h-3 w-3 md:h-4 md:w-4" />
                        <span>{song.viewCount.toLocaleString()} 조회</span>
                      </div>
                    </div>

                    {expandedSong === song.rank && (
                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t space-y-2 md:space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm md:text-base font-semibold flex items-center gap-2">
                            <Trophy className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                            인기 커버 Top 5
                          </h4>
                          <Link href={`/trending/${song.rank}/covers`}>
                            <Button variant="ghost" size="sm" className="text-xs gap-1 h-8">
                              전체보기
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>

                        {loadingCovers[song.rank] && (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        )}

                        {!loadingCovers[song.rank] && song.topCovers.length === 0 && (
                          <p className="text-xs md:text-sm text-muted-foreground text-center py-4">
                            커버 영상을 찾을 수 없습니다
                          </p>
                        )}

                        {!loadingCovers[song.rank] &&
                          song.topCovers.map((cover) => (
                            <div
                              key={cover.rank}
                              className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="text-xs md:text-sm font-semibold text-muted-foreground w-5 md:w-6">
                                {cover.rank}
                              </div>

                              <img
                                src={cover.thumbnailUrl || "/placeholder.svg"}
                                alt={cover.youtuber}
                                className="w-12 h-12 md:w-16 md:h-16 object-cover rounded flex-shrink-0"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="text-sm md:text-base font-medium line-clamp-1">{cover.youtuber}</div>
                                <div className="text-xs text-muted-foreground truncate">{cover.channelName}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {cover.vocalStyle.map((style) => (
                                    <Badge key={style} variant="outline" className="text-xs px-1.5 py-0">
                                      #{style}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 md:gap-2 flex-shrink-0">
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                  {cover.views.toLocaleString()}
                                </div>
                                <a
                                  href={cover.youtubeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 bg-transparent h-7 md:h-8 px-2 md:px-3"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    <span className="hidden sm:inline">보기</span>
                                  </Button>
                                </a>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredTrending.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">해당 카테고리의 곡이 없습니다</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
