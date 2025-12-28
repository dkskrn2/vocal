"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function CollectDataPage() {
    const [loading, setLoading] = useState(false)
    const [matchingLoading, setMatchingLoading] = useState(false)
    const [result, setResult] = useState<string>("")
    const [matchResult, setMatchResult] = useState<string>("")

    const handleCollect = async () => {
        setLoading(true)
        setResult("")

        try {
            console.log("[v0] Starting kworb data collection...")
            const response = await fetch("/api/cron/collect-kworb-chart", {
                method: "GET",
            })

            const data = await response.json()
            console.log("[v0] Collection result:", data)

            if (response.ok) {
                setResult(
                    `✅ 성공! ${data.entriesCount || 0}개의 차트 항목을 수집했습니다.\n📹 ${data.videoIdsMatched || 0}개의 YouTube Video ID를 매칭했습니다.`,
                )
            } else {
                setResult(`❌ 오류: ${data.error || "알 수 없는 오류"}`)
            }
        } catch (error) {
            console.error("[v0] Collection error:", error)
            setResult(`❌ 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
        } finally {
            setLoading(false)
        }
    }

    const handleMatchVideoIds = async () => {
        setMatchingLoading(true)
        setMatchResult("")

        try {
            console.log("[v0] Starting additional video ID matching...")
            const response = await fetch("/api/match-video-ids", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    batchSize: 5,
                    maxItems: 20,
                }),
            })

            const data = await response.json()
            console.log("[v0] Match result:", data)

            if (response.ok) {
                setMatchResult(
                    `✅ 추가 매칭 완료! ${data.matched || 0}/${data.total || 0}개의 Video ID를 매칭했습니다.${data.rateLimitReached ? "\n⚠️ API Rate Limit에 도달했습니다. 잠시 후 다시 시도해주세요." : ""}`,
                )
            } else {
                setMatchResult(`❌ 오류: ${data.error || "알 수 없는 오류"}`)
            }
        } catch (error) {
            console.error("[v0] Matching error:", error)
            setMatchResult(`❌ 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
        } finally {
            setMatchingLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Kworb 차트 데이터 수집</CardTitle>
                    <CardDescription>
                        kworb.net에서 한국 YouTube 주간 차트를 크롤링하여 데이터베이스에 저장합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleCollect} disabled={loading} size="lg" className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "데이터 수집 중..." : "지금 데이터 수집하기"}
                    </Button>

                    {result && (
                        <div
                            className={`p-4 rounded-lg whitespace-pre-line ${result.includes("✅") ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"
                                }`}
                        >
                            {result}
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <Button
                            onClick={handleMatchVideoIds}
                            disabled={matchingLoading}
                            variant="outline"
                            size="lg"
                            className="w-full bg-transparent"
                        >
                            {matchingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {matchingLoading ? "Video ID 매칭 중..." : "추가 Video ID 매칭 (20개)"}
                        </Button>

                        {matchResult && (
                            <div
                                className={`mt-4 p-4 rounded-lg whitespace-pre-line ${matchResult.includes("✅") ? "bg-blue-50 text-blue-900" : "bg-red-50 text-red-900"
                                    }`}
                            >
                                {matchResult}
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-2">
                        <p>• 수집되는 데이터: 순위, 아티스트, 곡 제목, 조회수</p>
                        <p>• 자동 매칭: 상위 20개 항목의 YouTube Video ID</p>
                        <p>• 소스: kworb.net/youtube/insights/kr.html</p>
                        <p>• 주간 단위로 업데이트됩니다</p>
                        <p className="text-xs text-orange-600">💡 Rate Limit 방지를 위해 한 번에 20개씩만 매칭됩니다</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
