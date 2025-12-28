import { type NextRequest, NextResponse } from "next/server"
import { searchSongCovers } from "@/lib/youtube-api"

/**
 * GET /api/youtube/covers
 * 특정 곡의 커버 영상 목록 API
 *
 * Query Parameters:
 * - songTitle: 노래 제목 (필수)
 * - artist: 아티스트명 (필수)
 * - maxResults: 최대 결과 수 (기본값: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const songTitle = searchParams.get("songTitle")
    const artist = searchParams.get("artist")
    const maxResults = Number.parseInt(searchParams.get("maxResults") || "50")

    if (!songTitle || !artist) {
      return NextResponse.json(
        {
          success: false,
          error: "songTitle과 artist 파라미터가 필요합니다.",
        },
        { status: 400 },
      )
    }

    const covers = await searchSongCovers(songTitle, artist, maxResults)

    return NextResponse.json({
      success: true,
      data: covers,
      songTitle,
      artist,
      count: covers.length,
    })
  } catch (error) {
    console.error("[API] 커버 영상 API 오류:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "커버 영상을 가져오는데 실패했습니다.",
      },
      { status: 500 },
    )
  }
}
