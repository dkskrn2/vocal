import { scrapeKworbChart, saveChartToDatabase, matchYouTubeVideoIds } from "../../../../src/lib/kworb-scraper"
import { NextResponse } from "next/server"

export const maxDuration = 60

export async function GET() {
  try {
    console.log("[v0] Starting kworb chart collection...")

    const chartData = await scrapeKworbChart()
    console.log(`[v0] Scraped ${chartData.entries.length} entries`)

    const result = await saveChartToDatabase(chartData)

    console.log("[v0] Starting YouTube video ID matching (top 20, batch size: 5)...")
    const matchResult = await matchYouTubeVideoIds(result.snapshotId, 5, 20)
    console.log(`[v0] Matched ${matchResult.matched} video IDs`)

    return NextResponse.json({
      success: true,
      message: "Chart data collected successfully",
      weekEnding: chartData.weekEnding,
      entriesCount: result.entriesCount,
      videoIdsMatched: matchResult.matched,
      rateLimitReached: matchResult.rateLimitReached,
    })
  } catch (error) {
    console.error("[v0] Error in kworb chart collection:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
