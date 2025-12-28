import { scrapeKworbChart, saveChartToDatabase } from "../src/lib/kworb-scraper"

async function main() {
  console.log("[v0] Starting kworb chart data collection...")

  try {
    // Scrape chart data from kworb.net
    console.log("[v0] Scraping kworb.net/youtube/insights/kr.html...")
    const chartData = await scrapeKworbChart()

    console.log(`[v0] Found ${chartData.entries.length} chart entries`)
    console.log(`[v0] Week ending: ${chartData.weekEnding}`)
    console.log(`[v0] Top 5 songs:`)
    chartData.entries.slice(0, 5).forEach((entry) => {
      console.log(`  ${entry.rank}. ${entry.artist} - ${entry.title} (${entry.streams.toLocaleString()} streams)`)
    })

    // Save to database
    console.log("[v0] Saving data to Neon database...")
    await saveChartToDatabase(chartData)

    console.log("[v0] ✅ Successfully collected and saved kworb chart data!")
    console.log(`[v0] Total entries saved: ${chartData.entries.length}`)
  } catch (error) {
    console.error("[v0] ❌ Error collecting chart data:", error)
    throw error
  }
}

main()
