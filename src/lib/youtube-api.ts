/**
 * YouTube Data API v3 클라이언트
 * 환경 변수: YOUTUBE_API_KEY 필요
 */

export interface YouTubeVideo {
  id: string
  title: string
  channelTitle: string
  channelId: string
  thumbnailUrl: string
  viewCount: number
  likeCount: number
  publishedAt: string
  duration: string
  description: string
}

export interface TrendingSong {
  rank: number
  videoId: string
  title: string
  artist: string
  channelTitle: string
  thumbnailUrl: string
  viewCount: number
  likeCount: number
  publishedAt: string
  trendingScore: number // 조회수 + 좋아요*10 등의 가중치 점수
}

export interface CoverVideo extends YouTubeVideo {
  rank: number
  coverArtist: string
}

/**
 * YouTube API 기본 URL
 */
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

/**
 * API 키 가져오기
 */
function getApiKey(): string {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY 환경 변수가 설정되지 않았습니다.")
  }
  return apiKey
}

/**
 * 기간 계산 (ISO 8601 형식)
 */
export function getPublishedAfterDate(period: "weekly" | "monthly"): string {
  const now = new Date()
  const pastDate = new Date()

  if (period === "weekly") {
    pastDate.setDate(now.getDate() - 7)
  } else {
    pastDate.setMonth(now.getMonth() - 1)
  }

  return pastDate.toISOString()
}

/**
 * 동영상 길이를 ISO 8601 duration에서 사람이 읽을 수 있는 형식으로 변환
 */
function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return "0:00"

  const hours = match[1] ? Number.parseInt(match[1].replace("H", "")) : 0
  const minutes = match[2] ? Number.parseInt(match[2].replace("M", "")) : 0
  const seconds = match[3] ? Number.parseInt(match[3].replace("S", "")) : 0

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * 트렌딩 점수 계산
 * 조회수와 좋아요 수를 기반으로 가중치 계산
 */
function calculateTrendingScore(viewCount: number, likeCount: number): number {
  return viewCount + likeCount * 10
}

/**
 * 특정 기간 동안 조회수가 높은 노래 검색
 * @param period 기간 (weekly | monthly)
 * @param maxResults 최대 결과 수
 * @param category 노래 카테고리 (옵션)
 */
export async function searchTrendingSongs(
  period: "weekly" | "monthly",
  maxResults = 20,
  category?: string,
): Promise<TrendingSong[]> {
  try {
    const apiKey = getApiKey()
    const publishedAfter = getPublishedAfterDate(period)

    // 카테고리별 검색 쿼리 조합
    let searchQuery = "official music video"
    if (category && category !== "전체") {
      searchQuery = `${category} ${searchQuery}`
    }

    // 1. 검색 API로 비디오 ID 목록 가져오기
    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`)
    searchUrl.searchParams.append("part", "snippet")
    searchUrl.searchParams.append("q", searchQuery)
    searchUrl.searchParams.append("type", "video")
    searchUrl.searchParams.append("videoCategoryId", "10") // Music category
    searchUrl.searchParams.append("order", "viewCount")
    searchUrl.searchParams.append("publishedAfter", publishedAfter)
    searchUrl.searchParams.append("maxResults", maxResults.toString())
    searchUrl.searchParams.append("key", apiKey)
    searchUrl.searchParams.append("regionCode", "KR") // 한국 지역

    const searchResponse = await fetch(searchUrl.toString())
    if (!searchResponse.ok) {
      throw new Error(`YouTube Search API 오류: ${searchResponse.statusText}`)
    }

    const searchData = await searchResponse.json()
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",")

    if (!videoIds) {
      return []
    }

    // 2. 비디오 상세 정보 가져오기 (조회수, 좋아요 등)
    const videosUrl = new URL(`${YOUTUBE_API_BASE}/videos`)
    videosUrl.searchParams.append("part", "snippet,statistics,contentDetails")
    videosUrl.searchParams.append("id", videoIds)
    videosUrl.searchParams.append("key", apiKey)

    const videosResponse = await fetch(videosUrl.toString())
    if (!videosResponse.ok) {
      throw new Error(`YouTube Videos API 오류: ${videosResponse.statusText}`)
    }

    const videosData = await videosResponse.json()

    // 3. 트렌딩 점수 계산 및 정렬
    const trendingSongs: TrendingSong[] = videosData.items.map((item: any, index: number) => {
      const viewCount = Number.parseInt(item.statistics.viewCount || "0")
      const likeCount = Number.parseInt(item.statistics.likeCount || "0")

      return {
        rank: index + 1,
        videoId: item.id,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
        viewCount,
        likeCount,
        publishedAt: item.snippet.publishedAt,
        trendingScore: calculateTrendingScore(viewCount, likeCount),
      }
    })

    // 트렌딩 점수로 재정렬
    trendingSongs.sort((a, b) => b.trendingScore - a.trendingScore)

    // 순위 재조정
    trendingSongs.forEach((song, index) => {
      song.rank = index + 1
    })

    return trendingSongs
  } catch (error) {
    console.error("[YouTube API] 트렌딩 노래 검색 오류:", error)
    throw error
  }
}

/**
 * 아티스트 이름 정제
 */
function cleanArtistName(artist: string): string {
  return artist
    .replace(/Official/gi, "")
    .replace(/VEVO/gi, "")
    .replace(/Channel/gi, "")
    .trim()
}

/**
 * 특정 곡의 커버 영상 검색
 * @param songTitle 노래 제목
 * @param originalArtist 원곡 아티스트
 * @param maxResults 최대 결과 수
 */
export async function searchSongCovers(
  songTitle: string,
  originalArtist: string,
  maxResults = 5,
): Promise<CoverVideo[]> {
  try {
    const apiKey = getApiKey()

    const cleanedTitle = cleanSongTitle(songTitle)
    const cleanedArtist = cleanArtistName(originalArtist)

    // 제목에 이미 아티스트가 포함되어 있는 경우가 많으므로 분리
    const titleParts = cleanedTitle.split("-").map((p) => p.trim())
    const actualSongTitle = titleParts.length > 1 ? titleParts.slice(1).join(" ") : cleanedTitle

    // 따옴표 제거하고 단순화된 검색어 사용
    const searchQuery = `${actualSongTitle} cover`

    console.log("[YouTube API] Cover search query:", searchQuery)

    // 1. 검색 API로 커버 영상 찾기
    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`)
    searchUrl.searchParams.append("part", "snippet")
    searchUrl.searchParams.append("q", searchQuery)
    searchUrl.searchParams.append("type", "video")
    searchUrl.searchParams.append("videoCategoryId", "10") // Music category
    searchUrl.searchParams.append("order", "viewCount")
    searchUrl.searchParams.append("maxResults", maxResults.toString())
    searchUrl.searchParams.append("key", apiKey)

    const searchResponse = await fetch(searchUrl.toString())
    if (!searchResponse.ok) {
      throw new Error(`YouTube Search API 오류: ${searchResponse.statusText}`)
    }

    const searchData = await searchResponse.json()
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",")

    if (!videoIds) {
      return []
    }

    // 2. 비디오 상세 정보 가져오기
    const videosUrl = new URL(`${YOUTUBE_API_BASE}/videos`)
    videosUrl.searchParams.append("part", "snippet,statistics,contentDetails")
    videosUrl.searchParams.append("id", videoIds)
    videosUrl.searchParams.append("key", apiKey)

    const videosResponse = await fetch(videosUrl.toString())
    if (!videosResponse.ok) {
      throw new Error(`YouTube Videos API 오류: ${videosResponse.statusText}`)
    }

    const videosData = await videosResponse.json()

    // 3. 커버 영상 목록 생성
    const coverVideos: CoverVideo[] = videosData.items.map((item: any, index: number) => ({
      rank: index + 1,
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      coverArtist: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
      viewCount: Number.parseInt(item.statistics.viewCount || "0"),
      likeCount: Number.parseInt(item.statistics.likeCount || "0"),
      publishedAt: item.snippet.publishedAt,
      duration: parseDuration(item.contentDetails.duration),
      description: item.snippet.description,
    }))

    // 조회수 기준 정렬
    coverVideos.sort((a, b) => b.viewCount - a.viewCount)

    // 순위 재조정
    coverVideos.forEach((video, index) => {
      video.rank = index + 1
    })

    return coverVideos
  } catch (error) {
    console.error("[YouTube API] 커버 영상 검색 오류:", error)
    throw error
  }
}

/**
 * 비디오 상세 정보 가져오기
 * @param videoId YouTube 비디오 ID
 */
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const apiKey = getApiKey()

    const url = new URL(`${YOUTUBE_API_BASE}/videos`)
    url.searchParams.append("part", "snippet,statistics,contentDetails")
    url.searchParams.append("id", videoId)
    url.searchParams.append("key", apiKey)

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`YouTube Videos API 오류: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const item = data.items[0]

    return {
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
      viewCount: Number.parseInt(item.statistics.viewCount || "0"),
      likeCount: Number.parseInt(item.statistics.likeCount || "0"),
      publishedAt: item.snippet.publishedAt,
      duration: parseDuration(item.contentDetails.duration),
      description: item.snippet.description,
    }
  } catch (error) {
    console.error("[YouTube API] 비디오 상세 정보 가져오기 오류:", error)
    return null
  }
}

/**
 * 제목 정제 함수 - 불필요한 부분 제거
 */
function cleanSongTitle(title: string): string {
  const cleaned = title
    // Official 관련 제거
    .replace(/$$Official Music Video$$/gi, "")
    .replace(/\[Official Music Video\]/gi, "")
    .replace(/Official Music Video/gi, "")
    .replace(/$$Official Video$$/gi, "")
    .replace(/\[Official Video\]/gi, "")
    .replace(/Official Video/gi, "")
    .replace(/$$Official Audio$$/gi, "")
    .replace(/\[Official Audio\]/gi, "")
    .replace(/Official Audio/gi, "")
    // MV, M/V 제거
    .replace(/$$MV$$/gi, "")
    .replace(/\[MV\]/gi, "")
    .replace(/$$M\/V$$/gi, "")
    .replace(/\[M\/V\]/gi, "")
    // Lyric Video 제거
    .replace(/$$Lyric Video$$/gi, "")
    .replace(/\[Lyric Video\]/gi, "")
    // 파이프 기호와 뒤의 내용 제거
    .replace(/\|.*/g, "")
    // 여러 공백을 하나로
    .replace(/\s+/g, " ")
    .trim()

  return cleaned
}

/**
 * 아티스트와 곡 제목으로 YouTube 검색
 * @param artist 아티스트명
 * @param title 곡 제목
 * @returns 비디오 ID 또는 null
 */
export async function searchYouTube(artist: string, title: string): Promise<string | null> {
  try {
    const apiKey = getApiKey()

    // 검색 쿼리 구성: 아티스트 + 곡 제목 + "official music video"
    const searchQuery = `${artist} ${title} official music video`

    console.log(`[v0] Searching YouTube for: "${searchQuery}"`)

    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`)
    searchUrl.searchParams.append("part", "snippet")
    searchUrl.searchParams.append("q", searchQuery)
    searchUrl.searchParams.append("type", "video")
    searchUrl.searchParams.append("videoCategoryId", "10") // Music category
    searchUrl.searchParams.append("maxResults", "1")
    searchUrl.searchParams.append("key", apiKey)
    searchUrl.searchParams.append("regionCode", "KR")

    const response = await fetch(searchUrl.toString())

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.log(`[v0] Non-JSON response from YouTube API for "${searchQuery}"`)
      return null
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] YouTube API error (${response.status}): ${errorText}`)
      return null
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      console.log(`[v0] No results found for: "${searchQuery}"`)
      return null
    }

    const videoId = data.items[0].id.videoId
    console.log(`[v0] Found video ID: ${videoId} for "${artist} - ${title}"`)

    return videoId
  } catch (error) {
    console.error(`[v0] Error searching YouTube for "${artist} - ${title}":`, error)
    return null
  }
}
