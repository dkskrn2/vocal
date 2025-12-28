"use server"

import { neon } from "@neondatabase/serverless"

export interface ChartEntry {
  rank: number
  artist: string
  title: string
  videoId: string
  streams: number
  streamsDelta: number | null
  rankChange: string | null
  youtubeUrl: string
  thumbnailUrl: string
}

export interface CoverVideo {
  videoId: string
  artist: string
  title: string
  thumbnailUrl: string
  viewCount: number
  youtubeUrl: string
}

export const getLatestChartAction = async (): Promise<{ success: boolean; data?: ChartEntry[]; error?: string }> => {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    const results = await sql`
      SELECT 
        ce.rank,
        ce.artist,
        ce.title,
        ce.video_id,
        ce.streams,
        ce.streams_delta,
        ce.rank_change
      FROM chart_entries ce
      JOIN chart_snapshots cs ON ce.snapshot_id = cs.id
      ORDER BY cs.week_ending DESC, ce.rank ASC
      LIMIT 100
    `

    const entries: ChartEntry[] = results.map((row: any) => ({
      rank: Number(row.rank),
      artist: row.artist,
      title: row.title,
      videoId: row.video_id,
      streams: Number(row.streams),
      streamsDelta: row.streams_delta ? Number(row.streams_delta) : null,
      rankChange: row.rank_change,
      youtubeUrl: `https://www.youtube.com/watch?v=${row.video_id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${row.video_id}/hqdefault.jpg`,
    }))

    return { success: true, data: entries }
  } catch (error) {
    console.error("[v0] Error fetching latest chart:", error)
    return { success: false, error: "차트 데이터를 불러올 수 없습니다" }
  }
}

export const getChartCoverVideosAction = async (
  videoId: string,
  limit = 5,
): Promise<{ success: boolean; data?: CoverVideo[]; error?: string }> => {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    const results = await sql`
      SELECT 
        cc.cover_video_id,
        cc.cover_artist,
        cc.cover_title,
        cc.view_count
      FROM curated_covers cc
      WHERE cc.original_video_id = ${videoId}
      ORDER BY cc.view_count DESC
      LIMIT ${limit}
    `

    const covers: CoverVideo[] = results.map((row: any) => ({
      videoId: row.cover_video_id,

      // ✅ 핵심 변경: Unknown Artist를 여기서 “문자열로 박지 않음”
      // 빈 값이면 UI에서 제목 패턴으로 채널명 추출 로직이 동작하게 함
      artist: (row.cover_artist ?? "").trim(),

      title: row.cover_title || "Untitled",
      thumbnailUrl: `https://i.ytimg.com/vi/${row.cover_video_id}/hqdefault.jpg`,
      viewCount: Number(row.view_count || 0),
      youtubeUrl: `https://www.youtube.com/watch?v=${row.cover_video_id}`,
    }))

    return { success: true, data: covers }
  } catch (error) {
    console.error("[v0] Error fetching cover videos:", error)
    return { success: false, error: "커버 영상을 불러올 수 없습니다" }
  }
}

export const getMonthlyChartAction = async (): Promise<{ success: boolean; data?: ChartEntry[]; error?: string }> => {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    const results = await sql`
      WITH ranked_entries AS (
        SELECT 
          ce.artist,
          ce.title,
          ce.video_id,
          ce.streams,
          ce.rank,
          cs.week_ending,
          ROW_NUMBER() OVER (PARTITION BY ce.video_id ORDER BY cs.week_ending DESC) as rn
        FROM chart_entries ce
        JOIN chart_snapshots cs ON ce.snapshot_id = cs.id
        WHERE cs.week_ending >= CURRENT_DATE - INTERVAL '30 days'
      ),
      aggregated AS (
        SELECT 
          artist,
          title,
          video_id,
          SUM(streams) as total_streams,
          MIN(rank) as best_rank
        FROM ranked_entries
        WHERE rn = 1
        GROUP BY artist, title, video_id
      )
      SELECT 
        ROW_NUMBER() OVER (ORDER BY total_streams DESC) as rank,
        artist,
        title,
        video_id,
        total_streams as streams,
        best_rank as peak_rank
      FROM aggregated
      ORDER BY total_streams DESC
      LIMIT 100
    `

    const entries: ChartEntry[] = results.map((row: any, index: number) => {
      const currentRank = index + 1
      const peakRank = row.peak_rank
      const rankImprovement = peakRank < currentRank ? currentRank - peakRank : 0

      return {
        rank: Number(row.rank),
        artist: row.artist,
        title: row.title,
        videoId: row.video_id,
        streams: Number(row.streams),
        streamsDelta: null,
        rankChange: rankImprovement > 0 ? `+${rankImprovement}` : null,
        youtubeUrl: `https://www.youtube.com/watch?v=${row.video_id}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${row.video_id}/hqdefault.jpg`,
      }
    })

    return { success: true, data: entries }
  } catch (error) {
    console.error("[v0] Error fetching monthly chart:", error)
    return { success: false, error: "월간 차트 데이터를 불러올 수 없습니다" }
  }
}
