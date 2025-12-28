"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ExternalLink, Search, Music, Play, Trophy, Eye } from "lucide-react"

interface CoverVideo {
  rank: number
  youtuber: string
  channelName: string
  views: number
  likes: number
  youtubeUrl: string
  uploadDate: string
  thumbnailUrl?: string
  duration?: string
}

// Mock data for all covers
const generateMockCovers = (songRank: number): CoverVideo[] => {
  const baseNames = [
    "김보컬",
    "이싱어",
    "박가수",
    "최뮤지션",
    "정보이스",
    "강커버",
    "윤보컬",
    "한뮤직",
    "서싱어",
    "조보이스",
    "민커버",
    "송보컬",
    "배싱어",
    "임뮤직",
    "진보이스",
    "류커버",
    "전보컬",
    "황싱어",
    "오뮤직",
    "양보이스",
    "신커버",
    "구보컬",
    "채싱어",
    "남뮤직",
    "추보이스",
    "홍커버",
    "곽보컬",
    "문싱어",
    "장뮤직",
    "안보이스",
  ]

  return Array.from({ length: 50 }, (_, i) => ({
    rank: i + 1,
    youtuber:
      baseNames[i % baseNames.length] + (i >= baseNames.length ? ` ${Math.floor(i / baseNames.length) + 1}` : ""),
    channelName: `@${baseNames[i % baseNames.length].toLowerCase()}${i >= baseNames.length ? Math.floor(i / baseNames.length) + 1 : ""}`,
    views: Math.floor((150000 - i * 2500) * (Math.random() * 0.3 + 0.85)),
    likes: Math.floor((8500 - i * 150) * (Math.random() * 0.3 + 0.85)),
    youtubeUrl: `https://youtube.com/watch?v=cover${songRank}_${i + 1}`,
    uploadDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    duration: `${Math.floor(Math.random() * 3) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
  }))
}

const songTitles: Record<number, { title: string; artist: string; genre: string }> = {
  1: { title: "Ditto", artist: "NewJeans", genre: "K-Pop" },
  2: { title: "Seven", artist: "정국", genre: "K-Pop" },
  3: { title: "Perfect Night", artist: "LE SSERAFIM", genre: "K-Pop" },
  4: { title: "Super Shy", artist: "NewJeans", genre: "K-Pop" },
  5: { title: "Love Lee", artist: "AKMU", genre: "발라드" },
  6: { title: "밤양갱", artist: "비비", genre: "R&B" },
  7: { title: "To X", artist: "태연", genre: "발라드" },
  8: { title: "I AM", artist: "IVE", genre: "K-Pop" },
  9: { title: "Hype Boy", artist: "NewJeans", genre: "K-Pop" },
  10: { title: "건물 사이에 피어난 장미", artist: "H1-KEY", genre: "K-Pop" },
}

export const AllCoversPage = () => {
  const params = useParams()
  const router = useRouter()
  const songRank = Number(params.rank) || 1
  const songInfo = songTitles[songRank] || { title: "알 수 없는 곡", artist: "알 수 없음", genre: "기타" }

  const [searchQuery, setSearchQuery] = useState("")
  const [allCovers] = useState<CoverVideo[]>(generateMockCovers(songRank))

  const filteredCovers = allCovers.filter(
    (cover) =>
      cover.youtuber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cover.channelName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getTopThreeIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />
    if (rank === 2) return <Trophy className="w-4 h-4 text-gray-400" />
    if (rank === 3) return <Trophy className="w-4 h-4 text-amber-700" />
    return null
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{songInfo.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{songInfo.artist}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {songInfo.genre}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground pl-14">전체 커버 영상 {allCovers.length}개</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="유튜버 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            전체 커버 순위
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCovers.map((cover) => (
              <a
                key={cover.rank}
                href={cover.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 md:p-4 rounded-lg hover:bg-accent transition-colors group border"
              >
                <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
                  {getTopThreeIcon(cover.rank) || (
                    <span className="text-lg font-bold text-muted-foreground">{cover.rank}</span>
                  )}
                </div>

                <div className="w-16 h-12 md:w-24 md:h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm md:text-base truncate">{cover.youtuber}</h3>
                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{cover.channelName}</p>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {(cover.views / 1000).toFixed(1)}K
                    </span>
                    <span>•</span>
                    <span>좋아요 {(cover.likes / 1000).toFixed(1)}K</span>
                    <span>•</span>
                    <span>
                      {new Date(cover.uploadDate).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {cover.duration && (
                      <>
                        <span>•</span>
                        <span>{cover.duration}</span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="w-5 h-5" />
                </Button>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
