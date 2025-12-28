import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const runtime = "nodejs"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type ChartSong = {
  video_id: string
  title: string
  artist: string
  rank: number
}

type YouTubeSearchItem = {
  id: { videoId?: string }
  snippet?: {
    title?: string
    channelTitle?: string
    thumbnails?: Record<string, { url: string }>
  }
}

type YouTubeVideoItem = {
  id: string
  snippet?: {
    title?: string
    channelTitle?: string
    thumbnails?: Record<string, { url: string }>
  }
  statistics?: {
    viewCount?: string
  }
}

function normalize(s: string) {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim()
}

function pickThumb(snippet?: YouTubeVideoItem["snippet"]) {
  const th = snippet?.thumbnails
  return th?.maxres?.url || th?.high?.url || th?.medium?.url || th?.default?.url || ""
}

function shouldExcludeCandidateTitle(title: string) {
  const t = normalize(title)

  const danceWords = [
    "dance",
    "댄스",
    "춤",
    "choreo",
    "choreography",
    "안무",
    "dance cover",
    "댄스 커버",
    "dance practice",
    "안무 연습",
    "연습실",
    "performance",
    "퍼포먼스",
    "challenge",
    "챌린지",
    "tiktok",
    "틱톡",
    "shorts",
    "쇼츠",
  ]

  const officialWords = [
    "official",
    "mv",
    "m/v",
    "music video",
    "official video",
    "official mv",
    "official m/v",
    "vevo",
    "topic",
    "teaser",
    "trailer",
  ]

  const otherBlockWords = [
    "lyrics",
    "가사",
    "karaoke",
    "노래방",
    "reaction",
    "리액션",
    "playlist",
    "플레이리스트",
    "mix",
    "1 hour",
    "1hour",
    "sped up",
    "slowed",
    "instrumental",
    "inst",
    "guide",
    "tutorial",
  ]

  if (danceWords.some((w) => t.includes(w))) return true
  if (officialWords.some((w) => t.includes(w))) return true
  return otherBlockWords.some((w) => t.includes(w))
}

function shouldExcludeChannel(channelTitle: string, originalArtist: string) {
  const c = normalize(channelTitle)
  const a = normalize(originalArtist)

  if (!c) return false

  if (c.includes("- topic")) return true
  if (c.includes("vevo")) return true
  if (c.includes("official")) return true

  // 원곡 아티스트 채널로 보이는 경우 제외(원하는 정책에 따라 제거 가능)
  if (a && c === a) return true

  return false
}

async function ytSearch({
  apiKey,
  q,
  maxResults = 25,
  order = "viewCount",
}: {
  apiKey: string
  q: string
  maxResults?: number
  order?: "relevance" | "viewCount" | "rating" | "date" | "title"
}) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search")
  url.searchParams.set("part", "snippet")
  url.searchParams.set("q", q)
  url.searchParams.set("type", "video")
  url.searchParams.set("maxResults", String(maxResults))
  url.searchParams.set("order", order)
  url.searchParams.set("key", apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`YouTube search failed: ${res.status} ${text}`)
  }
  const data = (await res.json()) as { items?: YouTubeSearchItem[] }
  return data.items ?? []
}

async function ytVideos({ apiKey, ids }: { apiKey: string; ids: string[] }) {
  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50))

  const all: YouTubeVideoItem[] = []
  for (const chunk of chunks) {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos")
    url.searchParams.set("part", "snippet,statistics")
    url.searchParams.set("id", chunk.join(","))
    url.searchParams.set("key", apiKey)

    const res = await fetch(url.toString())
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`YouTube videos failed: ${res.status} ${text}`)
    }
    const data = (await res.json()) as { items?: YouTubeVideoItem[] }
    all.push(...(data.items ?? []))
  }
  return all
}

export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY
    const dbUrl = process.env.DATABASE_URL

    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "YOUTUBE_API_KEY not configured" }, { status: 500 })
    }
    if (!dbUrl) {
      return NextResponse.json({ ok: false, error: "DATABASE_URL not configured" }, { status: 500 })
    }

    const sql = neon(dbUrl)

    // 최신 주차 스냅샷 기준 상위 20곡
    const songs = (await sql`
      SELECT ce.video_id, ce.title, ce.artist, ce.rank
      FROM chart_entries ce
      JOIN chart_snapshots cs ON ce.snapshot_id = cs.id
      WHERE cs.week_ending = (SELECT MAX(week_ending) FROM chart_snapshots)
        AND ce.video_id IS NOT NULL
      ORDER BY ce.rank ASC
      LIMIT 20
    `) as unknown as ChartSong[]

    let songsProcessed = 0
    let candidatesSaved = 0

    for (const song of songs) {
      songsProcessed += 1

      const q1 = `${song.title} ${song.artist} cover`
      const q2 = `${song.title} ${song.artist} 커버`

      const searchItems = [
        ...(await ytSearch({ apiKey, q: q1, maxResults: 25, order: "viewCount" })),
        ...(await ytSearch({ apiKey, q: q2, maxResults: 25, order: "viewCount" })),
      ]

      const filteredIds = Array.from(
        new Set(
          searchItems
            .map((it) => {
              const videoId = it.id?.videoId
              const title = it.snippet?.title ?? ""
              const channelTitle = it.snippet?.channelTitle ?? ""
              if (!videoId) return null

              if (shouldExcludeCandidateTitle(title)) return null
              if (shouldExcludeChannel(channelTitle, song.artist)) return null

              const t = normalize(title)
              const hasCoverSignal =
                t.includes("cover") ||
                t.includes("커버") ||
                t.includes("ver") ||
                t.includes("불러") ||
                t.includes("불러봤") ||
                t.includes("sung by") ||
                t.includes("cover by")

              if (!hasCoverSignal) return null
              return videoId
            })
            .filter((x): x is string => Boolean(x)),
        ),
      ).slice(0, 50)

      if (filteredIds.length === 0) {
        await sleep(500)
        continue
      }

      // videos.list로 채널명 + 조회수 확정
      const videoItems = await ytVideos({ apiKey, ids: filteredIds })

      const top = videoItems
        .map((v) => {
          const viewCount = Number(v.statistics?.viewCount ?? "0")
          const coverTitle = v.snippet?.title ?? ""
          const coverArtist = v.snippet?.channelTitle ?? ""

          return {
            original_video_id: song.video_id,
            cover_video_id: v.id,
            cover_title: coverTitle,
            cover_artist: coverArtist,
            thumbnail_url: pickThumb(v.snippet),
            view_count: Number.isFinite(viewCount) ? viewCount : 0,
          }
        })
        .filter((c) => !!c.cover_video_id)
        .filter((c) => !shouldExcludeCandidateTitle(c.cover_title))
        .filter((c) => !shouldExcludeChannel(c.cover_artist, song.artist))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5)

      for (const c of top) {
        await sql`
          INSERT INTO curated_covers
            (original_video_id, cover_video_id, cover_title, cover_artist, thumbnail_url, view_count)
          VALUES
            (${c.original_video_id}, ${c.cover_video_id}, ${c.cover_title}, ${c.cover_artist}, ${c.thumbnail_url}, ${c.view_count})
          ON CONFLICT (original_video_id, cover_video_id)
          DO UPDATE SET
            cover_title   = EXCLUDED.cover_title,
            cover_artist  = EXCLUDED.cover_artist,
            thumbnail_url = EXCLUDED.thumbnail_url,
            view_count    = EXCLUDED.view_count
        `
        candidatesSaved += 1
      }

      await sleep(800)
    }

    return NextResponse.json({
      ok: true,
      songsProcessed,
      candidatesSaved,
      rules: {
        searchOrder: "viewCount",
        exclude: ["dance/choreo/challenge", "official/mv/vevo/topic", "lyrics/karaoke/reaction/playlist/mix"],
        sortAfterFilter: "view_count desc (videos.list statistics)",
      },
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
