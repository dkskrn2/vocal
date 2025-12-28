"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import type { VocalEvaluation } from "@/types/domain"
import { Sparkles, TrendingUp, Award, AlertCircle } from "lucide-react"

type EvaluationStatus = "idle" | "uploading" | "analyzing" | "completed"

export const VocalEvaluationPage = () => {
  const [status, setStatus] = useState<EvaluationStatus>("idle")
  const [fileName, setFileName] = useState<string>("")
  const [songTitle, setSongTitle] = useState<string>("")
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [evaluation, setEvaluation] = useState<VocalEvaluation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleStartEvaluation = () => {
    setIsDialogOpen(true)
    setStatus("uploading")
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const handleAnalyze = () => {
    if (!fileName) return

    setStatus("analyzing")
    setAnalysisProgress(0)

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            const mockEvaluation: VocalEvaluation = {
              id: "eval-1",
              songTitle: songTitle || "좋은날",
              originalArtist: "IU",
              evaluatedAt: new Date().toISOString().split("T")[0],
              overallScore: 86,
              scores: {
                pitch: 88,
                rhythm: 92,
                pronunciation: 78,
                emotion: 87,
              },
              strengths: ["박자 안정성이 뛰어납니다", "감정 표현이 풍부합니다"],
              improvements: ["발음을 좀 더 명확하게 하면 좋겠습니다", "고음 구간에서 약간의 흔들림이 있습니다"],
              recommendedPracticeSongs: ["나의 옛날이야기 - 아이유", "밤편지 - 아이유"],
            }
            setEvaluation(mockEvaluation)
            setStatus("completed")
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 400)
  }

  const getAnalysisStepText = () => {
    if (analysisProgress < 25) return "음정 분석 중..."
    if (analysisProgress < 50) return "박자 분석 중..."
    if (analysisProgress < 75) return "발음 분석 중..."
    return "감정 표현 분석 중..."
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">보컬 평가</h1>
        <p className="text-xs md:text-sm text-muted-foreground">커버 노래를 분석하고 AI 피드백을 받아보세요</p>
      </div>

      {!evaluation ? (
        <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
                <Award className="relative h-16 w-16 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">커버 노래를 평가받아보세요</h3>
              <p className="text-sm text-muted-foreground">
                AI가 음정, 박자, 발음, 감정 표현을 분석하고 성장 포인트를 알려드립니다
              </p>
            </div>
            <Button variant="gradient" size="lg" onClick={handleStartEvaluation} className="gap-2">
              <Sparkles className="h-4 w-4" />
              평가 시작하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">{evaluation.overallScore}점</h3>
                <p className="text-sm text-muted-foreground">
                  {evaluation.songTitle} - {evaluation.originalArtist}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleStartEvaluation}>
                새 평가하기
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">음정 정확도</p>
                  <p className={`text-2xl font-bold ${getScoreColor(evaluation.scores.pitch)}`}>
                    {evaluation.scores.pitch}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">박자 안정성</p>
                  <p className={`text-2xl font-bold ${getScoreColor(evaluation.scores.rhythm)}`}>
                    {evaluation.scores.rhythm}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">발음 명확도</p>
                  <p className={`text-2xl font-bold ${getScoreColor(evaluation.scores.pronunciation)}`}>
                    {evaluation.scores.pronunciation}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">감정 표현력</p>
                  <p className={`text-2xl font-bold ${getScoreColor(evaluation.scores.emotion)}`}>
                    {evaluation.scores.emotion}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  강점
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {evaluation.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-1 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    </div>
                    <p className="text-muted-foreground">{strength}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  개선 포인트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {evaluation.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-1 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                    </div>
                    <p className="text-muted-foreground">{improvement}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {evaluation.recommendedPracticeSongs && evaluation.recommendedPracticeSongs.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm">추천 연습곡</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {evaluation.recommendedPracticeSongs.map((song, index) => (
                    <div key={index} className="rounded-lg border bg-card p-3 text-sm">
                      {song}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {status === "uploading" && "보컬 평가 시작"}
              {status === "analyzing" && "평가 진행 중"}
              {status === "completed" && "평가 완료!"}
            </DialogTitle>
            <DialogDescription>
              {status === "uploading" && "커버 노래 파일을 업로드해주세요"}
              {status === "analyzing" && "AI가 당신의 노래를 분석하고 있습니다"}
              {status === "completed" && "보컬 평가가 완료되었습니다!"}
            </DialogDescription>
          </DialogHeader>

          {status === "uploading" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover-file">커버 파일</Label>
                <Input id="cover-file" type="file" accept=".mp3,.wav,.m4a" onChange={handleFileChange} />
                <p className="text-xs text-muted-foreground">MP3, WAV, M4A 파일을 업로드할 수 있습니다</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="song-title">곡 제목 (선택사항)</Label>
                <Input
                  id="song-title"
                  placeholder="예: 좋은날 - IU"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                />
              </div>
              <Button variant="gradient" onClick={handleAnalyze} disabled={!fileName} className="w-full">
                평가 시작
              </Button>
            </div>
          )}

          {status === "analyzing" && (
            <div className="space-y-4 py-4">
              <Progress value={analysisProgress} className="h-2" />
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">{analysisProgress}%</p>
                <p className="text-xs text-muted-foreground">{getAnalysisStepText()}</p>
                <p className="text-xs text-muted-foreground">예상 소요 시간: 약 40초</p>
              </div>
            </div>
          )}

          {status === "completed" && (
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <Sparkles className="h-16 w-16 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">평가 결과를 확인해보세요!</p>
              <Button variant="gradient" onClick={() => setIsDialogOpen(false)} className="w-full">
                결과 보기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
