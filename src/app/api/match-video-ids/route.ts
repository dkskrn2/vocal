import { neon } from "@neondatabase/serverless"
import { matchYouTubeVideoIds } from "@/lib/kworb-scraper"
import { NextResponse } from "next/server"

export const maxDuration = 60

/**
 * 별도의 video ID 매칭 API
 * 나머지 항목들을 점진적으로 매칭할 수 있음
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { batchSize = 10, maxItems = 30 } = body

    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) throw new Error("DATABASE_URL is not set")

    const sql = neon(dbUrl)

    // 가장 최근 스냅샷 ID 가져오기
    const snapshots = await sql<{ id: number; week_ending: string }[]>`
      select id, week_ending
      from chart_snapshots
      order by week_ending desc
      limit 1
    `

    if (snapshots.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No chart snapshots found",
      })
    }

    const snapshotId = snapshots[0].id

    console.log(`[v0] Matching video IDs for snapshot ${snapshotId} (${snapshots[0].week_ending})`)

    const matchResult = await matchYouTubeVideoIds(snapshotId, batchSize, maxItems)

    return NextResponse.json({
      success: true,
      snapshotId,
      weekEnding: snapshots[0].week_ending,
      matched: matchResult.matched,
      total: matchResult.total,
      rateLimitReached: matchResult.rateLimitReached,
    })
  } catch (error) {
    console.error("[v0] Error in video ID matching:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
