"use server"

import { neon } from "@neondatabase/serverless"
import * as cheerio from "cheerio"

interface KworbEntry {
  rank: number
  artist: string
  title: string
  videoId: string | null // weekly에선 없음(대부분 null)
  streams: number
  streamsDelta: number | null // 빈칸 가능
  rankChange: string | null // "=", "+1", "-3", "NEW", "RE"
  peakRank: number | null
  weeksOnChart: number | null
  peakMultiplier: string | null // (x3) 같은 값
  trackText: string // 원문 "ARTIST - TITLE"
}

interface ChartData {
  weekEnding: string // YYYY-MM-DD
  entries: KworbEntry[]
}

const KWORB_URL = "https://kworb.net/youtube/insights/kr.html"

/** 숫자 파서: "6,064,962" / "" / null 대응 */
function parseNumber(text: string | undefined | null): number | null {
  if (!text) return null
  const t = text.replace(/\s+/g, " ").trim()
  if (!t) return null
  const normalized = t.replace(/,/g, "").replace(/\+/g, "")
  const n = Number.parseInt(normalized, 10)
  return Number.isFinite(n) ? n : null
}

/** "Week ending 2025/12/11" -> "2025-12-11" */
function parseWeekEnding(html: string): string {
  const m = html.match(/Week ending\s+(\d{4})\/(\d{2})\/(\d{2})/i)
  if (!m) {
    // 못 찾으면 오늘 날짜로 fallback
    const today = new Date().toISOString().slice(0, 10)
    console.warn("[kworb] weekEnding not found; fallback to", today)
    return today
  }
  return `${m[1]}-${m[2]}-${m[3]}`
}

/** "ARTIST - TITLE" split */
function splitArtistTitle(trackText: string): { artist: string; title: string } {
  const t = trackText.replace(/\s+/g, " ").trim()
  // kworb는 보통 " - " 사용
  if (t.includes(" - ")) {
    const [a, ...rest] = t.split(" - ")
    return { artist: a.trim() || "Unknown", title: rest.join(" - ").trim() || t }
  }
  // 혹시 구분자 없으면 전체를 title로
  return { artist: "Unknown", title: t || "Unknown" }
}

export const scrapeKworbChart = async (): Promise<ChartData> => {
  console.log("[kworb] Fetching...", KWORB_URL)

  const response = await fetch(KWORB_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch kworb data: ${response.status}`)
  }

  const html = await response.text()
  console.log("[kworb] HTML length:", html.length)

  const weekEnding = parseWeekEnding(html)
  console.log("[kworb] weekEnding:", weekEnding)

  const $ = cheerio.load(html)

  const table = $("#weeklytable")
  if (table.length === 0) {
    throw new Error("Could not find #weeklytable in HTML")
  }

  const entries: KworbEntry[] = []

  // 헤더 컬럼 확인(디버깅 도움)
  const headers = table
    .find("thead th")
    .map((_, th) => $(th).text().trim())
    .get()
  console.log("[kworb] headers:", headers)

  table.find("tbody tr").each((_, tr) => {
    const tds = $(tr).find("td")
    if (tds.length < 7) return // 최소 컬럼 가드

    // 실제 구조:
    // 0 Pos, 1 P+, 2 Track(div text), 3 Wks, 4 Pk, 5 (x?), 6 Streams, 7 Streams+
    const rank = parseNumber($(tds.get(0)).text()) ?? entries.length + 1

    const rankChangeRaw = $(tds.get(1)).text().trim()
    const rankChange = rankChangeRaw ? rankChangeRaw : null

    const trackText = $(tds.get(2)).text().replace(/\s+/g, " ").trim()
    if (!trackText) return

    const { artist, title } = splitArtistTitle(trackText)

    const weeksOnChart = parseNumber($(tds.get(3)).text())
    const peakRank = parseNumber($(tds.get(4)).text())

    const peakMultiplierText = $(tds.get(5)).text().replace(/\s+/g, " ").trim()
    const peakMultiplier = peakMultiplierText ? peakMultiplierText : null

    const streams = parseNumber($(tds.get(6)).text()) ?? 0

    const streamsDelta = tds.length >= 8 ? parseNumber($(tds.get(7)).text()) : null

    // weekly HTML에는 videoId 링크가 없음 → null
    const videoId: string | null = null

    entries.push({
      rank,
      artist,
      title,
      videoId,
      streams,
      streamsDelta,
      rankChange,
      peakRank,
      weeksOnChart,
      peakMultiplier,
      trackText,
    })
  })

  console.log(`[kworb] Scraped entries: ${entries.length}`)

  // Top100이 보장되는 건 아니니 안전하게 rank 기준 정렬
  entries.sort((a, b) => a.rank - b.rank)

  return { weekEnding, entries }
}

export const saveChartToDatabase = async (chartData: ChartData) => {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL is not set")

  const sql = neon(dbUrl)

  console.log(`[kworb] Saving chart data for weekEnding=${chartData.weekEnding}, entries=${chartData.entries.length}`)

  // snapshot upsert
  const snapshotResult = await sql<{ id: number }[]>`
    insert into chart_snapshots (week_ending)
    values (${chartData.weekEnding})
    on conflict (country, source, week_ending)
    do update set week_ending = excluded.week_ending
    returning id
  `

  const snapshotId = snapshotResult[0]?.id
  if (!snapshotId) throw new Error("Failed to create/get snapshot id")

  console.log(`[kworb] Snapshot ID: ${snapshotId}`)

  // 기존 entries 삭제 후 재삽입(멱등)
  await sql`delete from chart_entries where snapshot_id = ${snapshotId}`

  // bulk insert
  if (chartData.entries.length > 0) {
    for (const e of chartData.entries) {
      await sql`
        insert into chart_entries (
          snapshot_id, rank, video_id, artist, title, track_text,
          streams, streams_delta, rank_change, peak_rank, weeks_on_chart, peak_multiplier
        )
        values (
          ${snapshotId}, ${e.rank}, ${e.videoId}, ${e.artist}, ${e.title}, ${e.trackText},
          ${e.streams}, ${e.streamsDelta ?? 0}, ${e.rankChange},
          ${e.peakRank}, ${e.weeksOnChart}, ${e.peakMultiplier}
        )
      `
    }
  }

  console.log(`[kworb] Saved entries: ${chartData.entries.length}`)

  return { success: true, snapshotId, entriesCount: chartData.entries.length }
}

/**
 * YouTube API로 차트 항목의 video_id를 검색하여 DB 업데이트
 * @param snapshotId 스냅샷 ID
 * @param batchSize 한 번에 처리할 항목 수 (기본 10)
 * @param maxItems 최대 처리할 항목 수 (기본 50)
 */
export const matchYouTubeVideoIds = async (snapshotId: number, batchSize = 10, maxItems = 50) => {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL is not set")

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.warn("[kworb] YOUTUBE_API_KEY not set, skipping video ID matching")
    return { success: false, matched: 0, message: "API key not configured" }
  }

  const sql = neon(dbUrl)

  console.log(
    `[kworb] Starting YouTube video ID matching for snapshot ${snapshotId} (batch size: ${batchSize}, max: ${maxItems})`,
  )

  // video_id가 null인 항목 조회
  const entries = await sql<{ rank: number; artist: string; title: string }[]>`
    select rank, artist, title 
    from chart_entries 
    where snapshot_id = ${snapshotId} 
    and video_id is null
    order by rank
    limit ${maxItems}
  `

  console.log(`[kworb] Found ${entries.length} entries without video_id`)

  let matched = 0
  let rateLimitReached = false
  const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

  for (let i = 0; i < entries.length; i += batchSize) {
    if (rateLimitReached) {
      console.log(`[kworb] Stopping due to rate limit`)
      break
    }

    const batch = entries.slice(i, i + batchSize)
    console.log(
      `[kworb] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entries.length / batchSize)} (${batch.length} items)`,
    )

    for (const entry of batch) {
      if (rateLimitReached) break

      try {
        // 아티스트 + 곡 제목으로 검색
        const searchQuery = `${entry.artist} ${entry.title} official music video`

        const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`)
        searchUrl.searchParams.append("part", "snippet")
        searchUrl.searchParams.append("q", searchQuery)
        searchUrl.searchParams.append("type", "video")
        searchUrl.searchParams.append("videoCategoryId", "10") // Music category
        searchUrl.searchParams.append("maxResults", "1")
        searchUrl.searchParams.append("key", apiKey)

        const response = await fetch(searchUrl.toString())

        const contentType = response.headers.get("content-type")
        const isJson = contentType?.includes("application/json")

        if (!response.ok) {
          if (response.status === 429) {
            console.warn(`[kworb] Rate limit reached at rank ${entry.rank}, stopping`)
            rateLimitReached = true
            break
          }

          let errorMessage = response.statusText
          if (isJson) {
            try {
              const errorData = await response.json()
              errorMessage = errorData.error?.message || errorMessage
            } catch {
              // Ignore JSON parse errors
            }
          }

          console.error(`[kworb] YouTube API error for rank ${entry.rank}: ${errorMessage}`)
          continue
        }

        if (!isJson) {
          console.error(`[kworb] Non-JSON response for rank ${entry.rank}, skipping`)
          continue
        }

        const data = await response.json()

        if (data.items && data.items.length > 0) {
          const videoId = data.items[0].id.videoId

          // DB 업데이트
          await sql`
            update chart_entries
            set video_id = ${videoId}, matched_by = 'youtube_api'
            where snapshot_id = ${snapshotId} 
            and rank = ${entry.rank}
          `

          console.log(`[kworb] ✓ Matched rank ${entry.rank}: ${entry.artist} - ${entry.title} -> ${videoId}`)
          matched++
        } else {
          console.log(`[kworb] ✗ No results for rank ${entry.rank}: ${entry.artist} - ${entry.title}`)
        }

        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`[kworb] Error matching rank ${entry.rank}:`, error)
        continue
      }
    }

    if (i + batchSize < entries.length && !rateLimitReached) {
      console.log(`[kworb] Waiting 2s before next batch...`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  console.log(`[kworb] Completed: matched ${matched} out of ${entries.length} entries`)

  return { success: true, matched, total: entries.length, rateLimitReached }
}
