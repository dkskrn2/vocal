import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const runtime = "nodejs"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
    }

    // 1) 차트에서 상위 20곡 가져오기
    const chartSongs = await sql`
      SELECT DISTINCT ce.video_id, ce.artist, ce.title
      FROM chart_entries ce
      JOIN chart_snapshots cs ON ce.snapshot_id = cs.id
      ORDER BY cs.week_ending DESC, ce.rank ASC
      LIMIT 20
    `

    if (chartSongs.length === 0) {
      return NextResponse.json({ message: "No chart songs found" }, { status: 404 })
    }

    let totalSaved = 0

    // 2) 각 곡에 대해 커버 수집
    for (const song of chartSongs) {
      const query = `${song.title} ${song.artist} cover`

      // 2-1) search.list로 후보 50개 수집 (order=viewCount는 힌트일 뿐)
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search")
      searchUrl.searchParams.set("part", "snippet")
      searchUrl.searchParams.set("q", query)
      searchUrl.searchParams.set("type", "video")
      searchUrl.searchParams.set("maxResults", "50")
      searchUrl.searchParams.set("order", "viewCount")
      searchUrl.searchParams.set("key", apiKey)

      const searchRes = await fetch(searchUrl.toString())
      if (!searchRes.ok) continue

      const searchData = await searchRes.json()
      const candidateIds = (searchData.items || []).map((item: any) => item.id.videoId).filter(Boolean)

      if (candidateIds.length === 0) continue

      // 2-2) videos.list로 실제 조회수 + 채널명 가져오기 (50개 배치)
      const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos")
      videosUrl.searchParams.set("part", "snippet,statistics")
      videosUrl.searchParams.set("id", candidateIds.join(","))
      videosUrl.searchParams.set("key", apiKey)

      const videosRes = await fetch(videosUrl.toString())
      if (!videosRes.ok) continue

      const videosData = await videosRes.json()
      const videos = videosData.items || []

      // 2-3) 필터링: dance, official, lyrics, karaoke, reaction 제외
      const filtered = videos.filter((v: any) => {
        const title = (v.snippet?.title || "").toLowerCase()
        const channelTitle = (v.snippet?.channelTitle || "").toLowerCase()
        const desc = (v.snippet?.description || "").toLowerCase()

        // 제외 키워드
        if (title.includes("dance") || channelTitle.includes("dance")) return false
        if (title.includes("official") || channelTitle.includes("official")) return false
        if (title.includes("lyrics") || title.includes("lyric")) return false
        if (title.includes("karaoke") || title.includes("instrumental")) return false
        if (title.includes("reaction") || desc.includes("reaction")) return false

        return true
      })

      // 2-4) 조회수 기준으로 정렬 후 Top 5
      const sorted = filtered
        .map((v: any) => ({
          video_id: v.id,
          title: v.snippet?.title || "",
          channel: v.snippet?.channelTitle || "",
          view_count: Number.parseInt(v.statistics?.viewCount || "0", 10),
          thumbnail: v.snippet?.thumbnails?.medium?.url || "",
        }))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5)

      // 2-5) DB에 저장
      for (const cover of sorted) {
        await sql`
          INSERT INTO curated_covers (
            original_video_id,
            cover_video_id,
            cover_title,
            cover_artist,
            thumbnail_url,
            view_count
          ) VALUES (
            ${song.video_id},
            ${cover.video_id},
            ${cover.title},
            ${cover.channel},
            ${cover.thumbnail},
            ${cover.view_count}
          )
          ON CONFLICT (original_video_id, cover_video_id) 
          DO UPDATE SET
            view_count = EXCLUDED.view_count,
            cover_title = EXCLUDED.cover_title,
            cover_artist = EXCLUDED.cover_artist,
            thumbnail_url = EXCLUDED.thumbnail_url
        `
        totalSaved++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully collected covers for ${chartSongs.length} songs`,
      totalCovers: totalSaved,
    })
  } catch (error: any) {
    console.error("Error collecting covers:", error)
    return NextResponse.json({ error: error.message || "Failed to collect covers" }, { status: 500 })
  }
}
