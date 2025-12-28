import { scrapeKworbChart, saveChartToDatabase, matchYouTubeVideoIds } from "@/lib/kworb-scraper"
import { NextResponse } from "next/server"

export const maxDuration = 60

export async function GET() {
  try {
    console.log("[v0] Starting kworb chart collection...")

    const chartData = await scrapeKworbChart()

    const result = await saveChartToDatabase(chartData)

    console.log("[v0] Starting YouTube video ID matching (top 20)...")
    const matchResult = await matchYouTubeVideoIds(result.snapshotId, 5, 20)

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
