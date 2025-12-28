"use server"

import { neon } from "@neondatabase/serverless"

type YtSearchItem = {
  videoId: string
  title: string
  channelTitle: string
  publishedAt: string
}

type YtVideoMeta = {
  id: string
  title: string | null
  channelTitle: string | null
  channelId: string | null
  publishedAt: string | null
  duration: string | null
  tags: string[]
  viewCount: number | null
  likeCount: number | null
  commentCount: number | null
  categoryId: string | null
}

const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
const YT_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set`)
  return v
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  let i = 0

  async function worker() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx])
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/$$.*?$$/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function hasCoverSignal(title: string): boolean {
  const t = title.toLowerCase()
  return (
    t.includes("cover") ||
    t.includes("커버") ||
    t.includes("노래해봤") ||
    t.includes("불러") ||
    t.includes("ver") ||
    t.includes("버전")
  )
}

function looksLikeNoise(title: string): boolean {
  const t = title.toLowerCase()
  return (
    t.includes("lyrics") ||
    t.includes("가사") ||
    t.includes("karaoke") ||
    t.includes("노래방") ||
    t.includes("mr") ||
    t.includes("instrumental") ||
    t.includes("reaction") ||
    t.includes("리액션") ||
    t.includes("nightcore") ||
    t.includes("sped up") ||
    t.includes("1hour") ||
    t.includes("1 hour") ||
    t.includes("mix") ||
    t.includes("playlist")
  )
}

function isTopicOrOfficial(channelTitle: string): boolean {
  const t = channelTitle.toLowerCase()
  return t.includes(" - topic") || t.includes("official") || t.includes("vevo")
}

function durationToSeconds(iso: string | null): number | null {
  if (!iso) return null
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if (!m) return null
  const h = m[1] ? Number.parseInt(m[1], 10) : 0
  const mm = m[2] ? Number.parseInt(m[2], 10) : 0
  const s = m[3] ? Number.parseInt(m[3], 10) : 0
  return h * 3600 + mm * 60 + s
}

function tokenMatchRatio(seedTitle: string, candTitle: string): number {
  const seed = normalize(seedTitle)
  const cand = normalize(candTitle)

  const tokens = seed.split(" ").filter((t) => t.length >= 2)
  if (tokens.length === 0) return 0

  const hit = tokens.filter((t) => cand.includes(t)).length
  return hit / tokens.length
}

function safeLog(n: number | null): number {
  if (!n || n <= 0) return 0
  return Math.log10(n)
}

async function ytSearch(apiKey: string, q: string, order: "relevance" | "viewCount", maxResults: number) {
  const url = new URL(YT_SEARCH_URL)
  url.searchParams.set("part", "snippet")
  url.searchParams.set("type", "video")
  url.searchParams.set("q", q)
  url.searchParams.set("order", order)
  url.searchParams.set("maxResults", String(maxResults))
  url.searchParams.set("regionCode", "KR")
  url.searchParams.set("relevanceLanguage", "ko")
  url.searchParams.set("key", apiKey)

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`)
  const json = (await res.json()) as unknown

  const items = (json as { items?: unknown[] }).items ?? []
  const out: YtSearchItem[] = []

  for (const it of items) {
    const obj = it as {
      id?: { videoId?: string }
      snippet?: {
        title?: string
        channelTitle?: string
        publishedAt?: string
      }
    }

    const videoId = obj.id?.videoId
    const title = obj.snippet?.title
    const channelTitle = obj.snippet?.channelTitle
    const publishedAt = obj.snippet?.publishedAt

    if (videoId && title && channelTitle && publishedAt) {
      out.push({ videoId, title, channelTitle, publishedAt })
    }
  }

  return out
}

async function ytVideos(apiKey: string, ids: string[]): Promise<YtVideoMeta[]> {
  if (ids.length === 0) return []
  const url = new URL(YT_VIDEOS_URL)
  url.searchParams.set("part", "snippet,contentDetails,statistics")
  url.searchParams.set("id", ids.join(","))
  url.searchParams.set("key", apiKey)

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) throw new Error(`YouTube videos.list failed: ${res.status}`)
  const json = (await res.json()) as unknown

  const items = (json as { items?: unknown[] }).items ?? []
  const out: YtVideoMeta[] = []

  for (const it of items) {
    const obj = it as {
      id?: string
      snippet?: {
        title?: string
        channelTitle?: string
        channelId?: string
        publishedAt?: string
        tags?: string[]
        categoryId?: string
      }
      contentDetails?: { duration?: string }
      statistics?: {
        viewCount?: string
        likeCount?: string
        commentCount?: string
      }
    }

    const id = obj.id
    if (!id) continue

    const sn = obj.snippet ?? {}
    const cd = obj.contentDetails ?? {}
    const st = obj.statistics ?? {}

    out.push({
      id,
      title: sn.title ?? null,
      channelTitle: sn.channelTitle ?? null,
      channelId: sn.channelId ?? null,
      publishedAt: sn.publishedAt ?? null,
      duration: cd.duration ?? null,
      tags: Array.isArray(sn.tags) ? sn.tags : [],
      viewCount: st.viewCount ? Number(st.viewCount) : null,
      likeCount: st.likeCount ? Number(st.likeCount) : null,
      commentCount: st.commentCount ? Number(st.commentCount) : null,
      categoryId: sn.categoryId ?? null,
    })
  }

  return out
}

type ScoredCandidate = {
  videoId: string
  score: number
  reason: string
  meta: YtVideoMeta
}

function scoreCoverCandidate(args: {
  seedArtist: string
  seedTitle: string
  originalVideoId: string
  originalDurationSec: number | null
  meta: YtVideoMeta
}): ScoredCandidate | null {
  const { seedArtist, seedTitle, originalVideoId, originalDurationSec, meta } = args

  if (meta.id === originalVideoId) return null
  if (!meta.title || !meta.channelTitle) return null

  if (looksLikeNoise(meta.title)) return null
  if (!hasCoverSignal(meta.title)) return null
  if (isTopicOrOfficial(meta.channelTitle)) return null

  const ratio = tokenMatchRatio(seedTitle, meta.title)
  if (ratio < 0.45) return null

  const candSec = durationToSeconds(meta.duration)
  if (originalDurationSec && candSec) {
    const r = candSec / originalDurationSec
    if (r < 0.6 || r > 1.6) return null
  }

  const artistNorm = normalize(seedArtist)
  const text = normalize(`${meta.title} ${meta.channelTitle}`)

  let score = 0
  score += ratio * 8
  if (text.includes(artistNorm)) score += 1
  score += 1.5
  score += safeLog(meta.viewCount) * 0.6
  if (meta.categoryId === "10") score += 0.3

  const reason = `ratio=${ratio.toFixed(2)}, views=${meta.viewCount ?? 0}`

  return { videoId: meta.id, score, reason, meta }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function ytVideosBatch(apiKey: string, ids: string[]): Promise<Map<string, YtVideoMeta>> {
  const m = new Map<string, YtVideoMeta>()
  const batches = chunk(ids, 50)
  for (const b of batches) {
    const metas = await ytVideos(apiKey, b)
    for (const meta of metas) m.set(meta.id, meta)
    await sleep(120)
  }
  return m
}

export async function generateCoverCandidatesForLatestChart(opts?: {
  limitSongs?: number
  topK?: number
  concurrency?: number
  maxResultsRelevance?: number
  maxResultsViewCountFallback?: number
}) {
  const apiKey = requireEnv("YOUTUBE_API_KEY")
  const sql = neon(requireEnv("DATABASE_URL"))

  const limitSongs = opts?.limitSongs ?? 25
  const topK = opts?.topK ?? 5
  const concurrency = opts?.concurrency ?? 2
  const maxResultsRelevance = opts?.maxResultsRelevance ?? 25
  const maxResultsViewCountFallback = opts?.maxResultsViewCountFallback ?? 10

  const charts = await sql<{ id: number; snapshot_date: string }[]>`
    SELECT id, week_ending::text as snapshot_date
    FROM chart_snapshots
    ORDER BY week_ending DESC
    LIMIT 1
  `
  if (charts.length === 0) throw new Error("No charts found")

  const snapshotId = charts[0].id
  const snapshotDate = charts[0].snapshot_date

  const songs = await sql<
    {
      rank: number
      artist: string
      title: string
      video_id: string
      rank_change: string | null
      streams_delta: number | null
    }[]
  >`
    SELECT rank, artist, title, video_id, rank_change, streams_delta
    FROM chart_entries
    WHERE snapshot_id = ${snapshotId}
      AND video_id IS NOT NULL AND video_id <> ''
    ORDER BY
      CASE WHEN rank_change IN ('NEW','RE') THEN 0 ELSE 1 END,
      COALESCE(streams_delta, -999999999) DESC,
      rank ASC
    LIMIT ${limitSongs}
  `

  if (songs.length === 0) {
    return {
      ok: true,
      snapshotId,
      snapshotDate,
      message: "No songs with video_id to generate covers.",
    }
  }

  const originalIds = songs.map((s) => s.video_id)
  const originalMap = await ytVideosBatch(apiKey, originalIds)

  const results = await mapLimit(songs, concurrency, async (s) => {
    const originalMeta = originalMap.get(s.video_id)
    const originalDurationSec = durationToSeconds(originalMeta?.duration ?? null)

    const q1 = `${s.artist} ${s.title} cover`
    const q2 = `${s.artist} ${s.title} 커버`

    const cand = new Map<string, YtSearchItem>()

    for (const it of await ytSearch(apiKey, q1, "relevance", maxResultsRelevance)) cand.set(it.videoId, it)
    await sleep(120)
    for (const it of await ytSearch(apiKey, q2, "relevance", maxResultsRelevance)) cand.set(it.videoId, it)
    await sleep(120)

    if (cand.size < topK * 2) {
      for (const it of await ytSearch(apiKey, q1, "viewCount", maxResultsViewCountFallback)) cand.set(it.videoId, it)
      await sleep(120)
    }

    cand.delete(s.video_id)

    const candIds = Array.from(cand.keys())
    const candMetaMap = await ytVideosBatch(apiKey, candIds)

    const scored: ScoredCandidate[] = []
    for (const meta of candMetaMap.values()) {
      const sc = scoreCoverCandidate({
        seedArtist: s.artist,
        seedTitle: s.title,
        originalVideoId: s.video_id,
        originalDurationSec,
        meta,
      })
      if (sc) scored.push(sc)
    }

    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, topK)

    for (let i = 0; i < top.length; i++) {
      const c = top[i]

      await sql`
        INSERT INTO curated_covers (
          original_video_id,
          cover_video_id,
          cover_artist,
          cover_title,
          thumbnail_url,
          view_count
        ) VALUES (
          ${s.video_id},
          ${c.videoId},
          ${c.meta.channelTitle},
          ${c.meta.title},
          ${"https://i.ytimg.com/vi/" + c.videoId + "/hqdefault.jpg"},
          ${c.meta.viewCount}
        )
        ON CONFLICT (original_video_id, cover_video_id)
        DO UPDATE SET
          cover_artist = EXCLUDED.cover_artist,
          cover_title = EXCLUDED.cover_title,
          thumbnail_url = EXCLUDED.thumbnail_url,
          view_count = EXCLUDED.view_count,
          added_at = CURRENT_TIMESTAMP
      `
    }

    return {
      rank: s.rank,
      artist: s.artist,
      title: s.title,
      original: s.video_id,
      saved: top.length,
    }
  })

  const totalSaved = results.reduce((acc, r) => acc + r.saved, 0)
  return {
    ok: true,
    snapshotId,
    snapshotDate,
    songs: songs.length,
    totalSaved,
    results,
  }
}

export async function getCoverCandidates(videoId: string, limit = 10) {
  const sql = neon(requireEnv("DATABASE_URL"))

  const candidates = await sql<
    {
      cover_video_id: string
      cover_title: string
      cover_artist: string
      view_count: number
    }[]
  >`
    SELECT 
      cover_video_id,
      cover_title,
      cover_artist,
      view_count
    FROM curated_covers
    WHERE original_video_id = ${videoId}
    ORDER BY view_count DESC
    LIMIT ${limit}
  `

  return candidates
}

export async function generateCoversForChart() {
  try {
    const result = await generateCoverCandidatesForLatestChart({
      limitSongs: 20,
      topK: 5,
      concurrency: 2,
    })

    return {
      success: true,
      ...result,
      totalSaved: result.totalSaved,
      results: result.results.map((r) => ({
        song: `${r.artist} - ${r.title}`,
        coversFound: r.saved,
      })),
    }
  } catch (error) {
    console.error("Cover generation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
