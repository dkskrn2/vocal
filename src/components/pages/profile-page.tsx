"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import type { VocalProfile, Song } from "@/types/domain"
import { mockSongs } from "@/lib/mock-songs"
import { Music2, Upload, Sparkles, TrendingUp, Info, Award, Mic, Heart, Music, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type AnalysisStatus = "not_started" | "uploading" | "analyzing" | "completed"

export const ProfilePage = () => {
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("not_started")
  const [fileName, setFileName] = useState<string>("")
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [profile, setProfile] = useState<VocalProfile | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isStyleExplanationOpen, setIsStyleExplanationOpen] = useState(false)
  const [selectedCoverSong, setSelectedCoverSong] = useState<Song | null>(null)
  const [coverUrl, setCoverUrl] = useState("")
  const [localSettings, setLocalSettings] = useState<{
    nickname: string
    channelUrl: string
    favoriteGenres: string[]
    favoriteArtists: string[]
  } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("vocal-profile-settings")
    if (stored) {
      setLocalSettings(JSON.parse(stored))
    }
  }, [])

  const handleStartAnalysis = () => {
    setIsDialogOpen(true)
    setAnalysisStatus("uploading")
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const handleAnalyze = () => {
    if (!fileName) return

    setAnalysisStatus("analyzing")
    setAnalysisProgress(0)

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            const mockProfile: VocalProfile = {
              id: "mock",
              tags: ["저음 안정형", "담백 발라드", "감성적"],
              comfortableRange: "A3 ~ D5",
              maxRange: "F3 ~ F5",
              lastAnalyzedAt: new Date().toISOString().split("T")[0],
              favoriteGenres: ["발라드", "R&B", "인디"],
              favoriteArtists: ["아이유", "박효신", "폴킴"],
            }
            setProfile(mockProfile)
            setAnalysisStatus("completed")
            setTimeout(() => {
              setIsDialogOpen(false)
              setIsStyleExplanationOpen(true)
              setAnalysisStatus("not_started")
            }, 1500)
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleReAnalyze = () => {
    setProfile(null)
    setFileName("")
    setAnalysisProgress(0)
    handleStartAnalysis()
  }

  const getAnalysisStepText = () => {
    if (analysisProgress < 30) return "음역대 분석 중..."
    if (analysisProgress < 70) return "스타일 태그 추출 중..."
    return "최종 프로필 생성 중..."
  }

  const getRecommendedGenres = () => {
    if (!profile) return []
    if (profile.tags.includes("담백 발라드") || profile.tags.includes("감성적")) {
      return ["발라드", "R&B", "인디 포크"]
    }
    return ["팝", "발라드", "인디"]
  }

  const mockEvaluationHistory = [
    { id: "1", songTitle: "좋은날 - IU", score: 86, date: "2024-01-15" },
    { id: "2", songTitle: "밤편지 - 아이유", score: 88, date: "2024-01-10" },
    { id: "3", songTitle: "너의 의미 - 아이유", score: 82, date: "2024-01-05" },
  ]

  const mockFavoriteSongs = [
    { id: "1", title: "좋은날", artist: "IU", addedDate: "2024-01-20" },
    { id: "2", title: "밤편지", artist: "아이유", addedDate: "2024-01-18" },
    { id: "3", title: "팔레트", artist: "IU (feat. G-DRAGON)", addedDate: "2024-01-15" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">내 정보</h1>
          <p className="text-xs md:text-sm text-muted-foreground">내 보컬 스타일과 활동 통계를 확인할 수 있습니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-white">
            <Link href="/profile/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-red-400"
            onClick={() => window.location.href = '/login'}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {
        !profile ? (
          <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
                  <Music2 className="relative h-16 w-16 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">아직 보컬 분석을 하지 않았어요</h3>
                <p className="text-sm text-muted-foreground">내 음역대와 스타일을 분석하고 딱 맞는 곡을 추천받아보세요</p>
              </div>
              <Button variant="gradient" size="lg" onClick={handleStartAnalysis} className="gap-2">
                <Sparkles className="h-4 w-4" />
                보컬 분석 시작하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Music2 className="h-5 w-5 text-primary" />내 보컬 스타일
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleReAnalyze}>
                  재분석하기
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">스타일 태그</div>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-medium text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">잘 어울리는 음악 장르</div>
                <div className="flex flex-wrap gap-2">
                  {getRecommendedGenres().map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-sm font-medium text-accent-foreground"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">편안한 음역</div>
                  <div className="text-lg font-semibold">{profile.comfortableRange}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">최대 음역</div>
                  <div className="text-lg font-semibold">{profile.maxRange}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">마지막 분석일: {profile.lastAnalyzedAt}</div>
            </CardContent>
          </Card>
        )
      }

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">선택한 노래</p>
                <p className="text-2xl font-bold mt-1">24곡</p>
              </div>
              <Music2 className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">세트리스트</p>
                <p className="text-2xl font-bold mt-1">3개</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">커버 업로드</p>
                <p className="text-2xl font-bold mt-1">12회</p>
              </div>
              <Upload className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">프로필 정보</TabsTrigger>
          <TabsTrigger value="style-analysis">스타일 분석</TabsTrigger>
          <TabsTrigger value="favorites">찜한 노래</TabsTrigger>
          <TabsTrigger value="evaluation">평가 기록</TabsTrigger>
          <TabsTrigger value="performance">성과 리포트</TabsTrigger>
          <TabsTrigger value="ranking">월간 랭킹</TabsTrigger>
        </TabsList>



        <TabsContent value="profile" className="space-y-4">


          <Card>
            <CardHeader>
              <CardTitle className="text-sm">관심사</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">선호 장르</Label>
                <div className="flex flex-wrap gap-2">
                  {(localSettings?.favoriteGenres || profile?.favoriteGenres) ? (
                    (localSettings?.favoriteGenres || profile?.favoriteGenres || []).map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {genre}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">선호 장르를 설정해주세요</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">선호 가수</Label>
                <div className="flex flex-wrap gap-2">
                  {(localSettings?.favoriteArtists || profile?.favoriteArtists) ? (
                    (localSettings?.favoriteArtists || profile?.favoriteArtists || []).map((artist) => (
                      <span
                        key={artist}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {artist}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">선호 가수를 설정해주세요</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="style-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                스타일 분석 추천 곡
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                회원님의 스타일을 분석하기 좋은 추천 곡들입니다. 커버한 곡이 있다면 등록해보세요!
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockSongs.slice(0, 5).map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-accent/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedCoverSong(song)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-primary/10">
                      {(song as any).youtubeUrl ? (
                        <img
                          src={`https://img.youtube.com/vi/${(song as any).youtubeUrl}/default.jpg`}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="h-5 w-5 text-primary absolute inset-0 m-auto" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{song.title}</p>
                      <p className="text-xs text-muted-foreground">{song.artist}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    커버 등록
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                찜한 노래
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockFavoriteSongs.length > 0 ? (
                mockFavoriteSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <Music className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{song.title}</p>
                        <p className="text-xs text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{song.addedDate}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/songs">보기</a>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>아직 찜한 노래가 없습니다</p>
                  <p className="text-xs mt-1">마음에 드는 곡을 찜해보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  보컬 평가 기록
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="/evaluation">새 평가하기</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockEvaluationHistory.length > 0 ? (
                mockEvaluationHistory.map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <span className="text-lg font-bold text-primary">{evaluation.score}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{evaluation.songTitle}</p>
                        <p className="text-xs text-muted-foreground">{evaluation.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      상세보기
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Mic className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>아직 평가 기록이 없습니다</p>
                  <p className="text-xs mt-1">첫 평가를 시작해보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">성과 요약</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
              <div className="rounded border bg-card p-3 space-y-3">
                <div className="text-xs text-muted-foreground">평균 조회수</div>
                <div className="mt-1 text-lg font-semibold">+35%</div>
              </div>
              <div className="rounded border bg-card p-3 space-y-3">
                <div className="text-xs text-muted-foreground">평균 좋아요</div>
                <div className="mt-1 text-lg font-semibold">+28%</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">영상별 성과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded border bg-card px-3 py-2">
                <div>
                  <div className="font-medium">커버 영상 제목 예시</div>
                  <div className="text-[11px] text-muted-foreground">조회수 1,234 · 좋아요 120</div>
                </div>
                <span className="text-[11px] text-emerald-600">After 영상</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">월간 랭킹</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded border bg-card px-3 py-2">
                <div>
                  <div className="font-medium">StreamerName</div>
                  <div className="text-[11px] text-muted-foreground">조회수 성장률 +230% / 좋아요 성장률 +150%</div>
                </div>
                <button type="button" className="rounded border px-2 py-1 text-[11px]">
                  롤모델 비교
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {analysisStatus === "uploading" && "보컬 분석 시작"}
              {analysisStatus === "analyzing" && "분석 진행 중"}
              {analysisStatus === "completed" && "분석 완료!"}
            </DialogTitle>
            <DialogDescription>
              {analysisStatus === "uploading" && "노래를 부른 음성 파일을 업로드해주세요"}
              {analysisStatus === "analyzing" && "음성을 분석하고 있습니다. 잠시만 기다려주세요."}
              {analysisStatus === "completed" && "보컬 분석이 완료되었습니다!"}
            </DialogDescription>
          </DialogHeader>

          {analysisStatus === "uploading" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vocal-file">음성 파일</Label>
                <Input id="vocal-file" type="file" accept=".mp3,.wav,.m4a" onChange={handleFileChange} />
                <p className="text-xs text-muted-foreground">
                  MP3, WAV, M4A 파일을 업로드할 수 있습니다 (20-60초 권장)
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3 space-y-1 text-xs">
                <p className="font-medium">녹음 팁</p>
                <p className="text-muted-foreground">· 조용한 환경에서 녹음해 주세요</p>
                <p className="text-muted-foreground">· 마이크는 입에서 한 뼘 정도 떨어뜨려 주세요</p>
              </div>
              <Button variant="gradient" onClick={handleAnalyze} disabled={!fileName} className="w-full">
                분석 시작
              </Button>
            </div>
          )}

          {analysisStatus === "analyzing" && (
            <div className="space-y-4 py-4">
              <Progress value={analysisProgress} className="h-2" />
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">{analysisProgress}%</p>
                <p className="text-xs text-muted-foreground">{getAnalysisStepText()}</p>
                <p className="text-xs text-muted-foreground">예상 소요 시간: 약 30초</p>
              </div>
            </div>
          )}

          {analysisStatus === "completed" && (
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <Sparkles className="h-16 w-16 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">프로필 페이지에서 결과를 확인할 수 있습니다</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isStyleExplanationOpen} onOpenChange={setIsStyleExplanationOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              당신은 이런 스타일이에요
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-4 space-y-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">저음 안정형</p>
                  <p className="text-xs text-muted-foreground">
                    낮은 음역대를 편안하고 안정적으로 소화하는 스타일입니다. 차분하고 깊이 있는 음색이 특징이며,
                    발라드나 재즈 장르에 잘 어울립니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">담백 발라드</p>
                  <p className="text-xs text-muted-foreground">
                    과하지 않은 절제된 감정 표현이 돋보입니다. 진솔하고 담백한 창법으로 듣는 이에게 깊은 감동을
                    전달합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">감성적</p>
                  <p className="text-xs text-muted-foreground">
                    노래에 감정을 잘 담아내는 스타일입니다. 청자의 마음을 움직이는 섬세한 표현력이 강점입니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <p className="text-sm font-medium">추천 활용 팁</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-primary">곡 선택</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>· 감성적인 발라드 곡으로 당신의 장점을 극대화하세요</li>
                    <li>· 저음 구간이 많은 곡을 선택하면 안정감 있는 무대를 만들 수 있어요</li>
                    <li>· 담백한 스타일을 살려 어쿠스틱 버전 커버를 시도해보세요</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-primary">세팅 팁</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>· 담백한 사운드를 위해 표면이 거친 방음재를 사용해주세요</li>
                    <li>· 마이크 리버브를 평소보다 15-20% 더 추가하면 감성이 살아납니다</li>
                    <li>· EQ에서 저음(80-200Hz)을 약간 부스트하여 안정감을 강조하세요</li>
                    <li>· 마이크와의 거리를 10-15cm 유지하여 따뜻한 음색을 만들어보세요</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Button variant="gradient" onClick={() => setIsStyleExplanationOpen(false)} className="w-full">
            확인
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCoverSong} onOpenChange={(open) => !open && setSelectedCoverSong(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>커버 인증</DialogTitle>
            <DialogDescription>
              '{selectedCoverSong?.title}' 곡을 커버하셨나요?
              <br />
              분석을 위해 커버 영상 또는 녹음 파일의 링크를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cover-url">커버 URL</Label>
              <Input
                id="cover-url"
                placeholder="https://youtube.com/..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                * 유튜브, 사운드클라우드 등 공개된 링크만 가능합니다.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedCoverSong(null)}>취소</Button>
            <Button
              variant="gradient"
              onClick={() => {
                // Mock submission
                alert("커버가 성공적으로 등록되었습니다! 분석이 시작됩니다.");
                setSelectedCoverSong(null);
                setCoverUrl("");
              }}
              disabled={!coverUrl}
            >
              제출하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}
