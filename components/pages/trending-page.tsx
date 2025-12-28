"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Headphones, TrendingUp, Music2 } from "lucide-react"
import { getLatestChartAction, getMonthlyChartAction, getChartCoverVideosAction } from "@/app/actions/chart-actions"

interface TrendingSong {
  rank: number
  title: string
  artist: string
  streams: number
  previousStreams?: number
  rankChange?: number
  isNew?: boolean
  category: SongCategory
  topCovers: CoverVideo[]
  videoId: string
  youtubeUrl: string
  thumbnailUrl: string
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

interface ChartEntry {
  rank: number
  artist: string
  title: string
  videoId: string
  streams: number
  streamsDelta: number | null
  rankChange: string | null
  youtubeUrl: string
  thumbnailUrl: string
}

interface ChartCoverVideo {
  videoId: string
  artist: string
  title: string
  thumbnailUrl: string
  viewCount: number
  youtubeUrl: string
}

type SongCategory =
  | "all"
  | "kpop_idol"
  | "ballad"
  | "dance_pop"
  | "rock_band"
  | "rnb_soul"
  | "hiphop"
  | "anime"
  | "game_ost"
  | "vocaloid"
  | "jpop"
  | "pop_song"
  | "drama_movie_ost"

export const TrendingPage = () => {
  const [category, setCategory] = useState<SongCategory>("all")
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly")
  const [trendingSongs, setTrendingSongs] = useState<TrendingSong[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSong, setExpandedSong] = useState<number | null>(null)
  const [loadingCovers, setLoadingCovers] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const fetchTrendingSongs = async () => {
      setLoading(true)

      try {
        const result = period === "weekly" ? await getLatestChartAction() : await getMonthlyChartAction()

        if (result.success && result.data) {
          const songs: TrendingSong[] = result.data.map((entry: ChartEntry) => ({
            rank: entry.rank,
            title: entry.title,
            artist: entry.artist,
            streams: entry.streams,
            previousStreams: entry.streamsDelta ? entry.streams - entry.streamsDelta : undefined,
            rankChange: parseRankChange(entry.rankChange),
            isNew: entry.rankChange === "NEW" || entry.rankChange === "RE",
            category: determineCategoryFromTitle(`${entry.artist} ${entry.title}`),
            topCovers: [],
            videoId: entry.videoId,
            youtubeUrl: entry.youtubeUrl,
            thumbnailUrl: entry.thumbnailUrl,
          }))

          setTrendingSongs(songs)
        }
      } catch (error) {
        console.error("[v0] Error fetching trending songs:", error)
      } finally {
        setLoading(false)
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

          // ✅ 핵심 변경: 빈값/Unknown Artist면 제목에서 채널명 추출
          channelName:
            video.artist && video.artist !== "Unknown Artist" ? video.artist : extractChannelName(video.title),

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
    if (lowerTitle.includes("ost") && (lowerTitle.includes("game") || lowerTitle.includes("게임"))) return "game_ost"
    if (lowerTitle.includes("vocaloid") || lowerTitle.includes("보컬로이드")) return "vocaloid"
    if (lowerTitle.includes("j-pop") || lowerTitle.includes("jpop")) return "jpop"
    if (lowerTitle.includes("pop")) return "pop_song"
    if (lowerTitle.includes("ost")) return "drama_movie_ost"

    return "all"
  }

  const formatStreams = (streams: number) => {
    if (streams >= 1000000) {
      return `${(streams / 1000000).toFixed(1)}M`
    }
    if (streams >= 1000) {
      return `${(streams / 1000).toFixed(1)}K`
    }
    return streams.toString()
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const getRankChangeBadge = (song: TrendingSong) => {
    if (song.isNew) {
      return <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">NEW</div>
    }

    if (song.rankChange && song.rankChange > 0) {
      return <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">+{song.rankChange}</div>
    }

    if (song.rankChange && song.rankChange < 0) {
      return <div className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">{song.rankChange}</div>
    }

    return null
  }

  const getVocalStylesFromTitle = (title: string): string[] => {
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

    return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${today.getMonth() + 1}/${today.getDate()}`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">차트 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8" />
            인기곡 차트
          </h1>
          <p className="text-muted-foreground mt-1">{getPeriodLabel()}</p>
        </div>

        <div className="flex gap-2 rounded-lg border p-1">
          <Button
            variant={period === "weekly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriod("weekly")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            주간
          </Button>
          <Button
            variant={period === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriod("monthly")}
            className="flex items-center gap-2"
          >
            <Music2 className="w-4 h-4" />
            월간
          </Button>
        </div>
      </div>

      {/* Category buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { value: "all", label: "전체" },
          { value: "kpop_idol", label: "K-POP 아이돌" },
          { value: "ballad", label: "발라드" },
          { value: "dance_pop", label: "댄스/팝" },
          { value: "rock_band", label: "록/밴드" },
          { value: "rnb_soul", label: "R&B/소울" },
          { value: "hiphop", label: "힙합/랩" },
          { value: "anime", label: "애니송" },
          { value: "game_ost", label: "게임 OST" },
          { value: "vocaloid", label: "보컬로이드" },
          { value: "jpop", label: "J-POP" },
          { value: "pop_song", label: "팝송" },
          { value: "drama_movie_ost", label: "드라마/영화 OST" },
        ].map((cat) => (
          <Button
            key={cat.value}
            variant={category === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat.value as SongCategory)}
            className="shrink-0"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTrending.map((song) => (
          <Card key={song.rank} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">#{song.rank}</span>
                    {getRankChangeBadge(song)}
                  </div>

                  <div className="flex items-start gap-3">
                    <img
                      src={song.thumbnailUrl || "/placeholder.svg"}
                      alt={song.title}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=64&width=64"
                      }}
                    />

                    <div>
                      <CardTitle className="text-lg">{song.title}</CardTitle>
                      <p className="text-muted-foreground">{song.artist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="px-2 py-1 text-xs rounded border">{formatStreams(song.streams)} 스트림</div>
                        {song.category !== "all" && (
                          <div className="px-2 py-1 text-xs rounded bg-secondary">{song.category}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => handleSongExpand(song.rank)} className="shrink-0">
                  <Headphones className="w-4 h-4 mr-2" />
                  {expandedSong === song.rank ? "접기" : "커버곡"}
                </Button>
              </div>
            </CardHeader>

            {expandedSong === song.rank && (
              <CardContent className="pt-0">
                {loadingCovers[song.rank] ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Headphones className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
                      <p className="text-sm text-muted-foreground">커버곡을 불러오는 중...</p>
                    </div>
                  </div>
                ) : song.topCovers.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                      인기 커버곡 TOP {song.topCovers.length}
                    </h3>
                    {song.topCovers.map((cover) => (
                      <div
                        key={cover.rank}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-bold text-sm w-6">#{cover.rank}</span>

                        <img
                          src={cover.thumbnailUrl || "/placeholder.svg"}
                          alt={cover.youtuber}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=48&width=48"
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{cover.youtuber}</p>
                          <p className="text-xs text-muted-foreground truncate">{cover.channelName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="px-2 py-1 text-xs rounded border">{formatViews(cover.views)} 조회</div>
                            {getVocalStylesFromTitle(cover.youtuber).map((style) => (
                              <div key={style} className="px-2 py-1 text-xs rounded bg-secondary">
                                {style}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button asChild size="sm" variant="ghost">
                          <a href={cover.youtubeUrl} target="_blank" rel="noreferrer">
                            보기
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Headphones className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">커버곡 데이터를 찾을 수 없습니다</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
