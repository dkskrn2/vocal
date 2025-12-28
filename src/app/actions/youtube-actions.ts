"use server"

import { searchTrendingSongs, searchSongCovers, type TrendingSong, type CoverVideo } from "@/lib/youtube-api"

/**
 * 트렌딩 노래 목록 가져오기 (Server Action)
 */
export async function getTrendingSongsAction(
  days: number,
  maxResults = 20,
): Promise<{ success?: boolean; data?: TrendingSong[]; error?: string }> {
  try {
    const period = days <= 7 ? "weekly" : "monthly"
    const songs = await searchTrendingSongs(period, maxResults)
    return { success: true, data: songs }
  } catch (error) {
    console.error("[Server Action] 트렌딩 노래 가져오기 오류:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "트렌딩 노래를 가져오는데 실패했습니다.",
    }
  }
}

/**
 * 특정 곡의 커버 영상 목록 가져오기 (Server Action)
 */
export async function getSongCoversAction(
  songTitle: string,
  originalArtist: string,
  maxResults = 5,
): Promise<{ success: boolean; data?: CoverVideo[]; error?: string }> {
  try {
    console.log("[Server Action] Searching covers:", { songTitle, originalArtist, maxResults })

    const covers = await searchSongCovers(songTitle, originalArtist, maxResults)

    console.log("[Server Action] Found covers:", covers.length)

    return { success: true, data: covers }
  } catch (error) {
    console.error("[Server Action] 커버 영상 가져오기 오류:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "커버 영상을 가져오는데 실패했습니다.",
    }
  }
}
