import { type NextRequest, NextResponse } from "next/server"
import { searchTrendingSongs } from "@/lib/youtube-api"

/**
 * GET /api/youtube/trending
 * 트렌딩 노래 목록 API
 *
 * Query Parameters:
 * - period: 'weekly' | 'monthly' (기본값: weekly)
 * - category: 카테고리 필터 (옵션)
 * - maxResults: 최대 결과 수 (기본값: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = (searchParams.get("period") || "weekly") as "weekly" | "monthly"
    const category = searchParams.get("category") || undefined
    const maxResults = Number.parseInt(searchParams.get("maxResults") || "20")

    const songs = await searchTrendingSongs(period, maxResults, category)

    return NextResponse.json({
      success: true,
      data: songs,
      period,
      category,
      count: songs.length,
    })
  } catch (error) {
    console.error("[API] 트렌딩 노래 API 오류:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "트렌딩 노래를 가져오는데 실패했습니다.",
      },
      { status: 500 },
    )
  }
}
