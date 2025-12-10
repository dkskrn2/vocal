// src/pages/SongsPage.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { mockSongs } from "../data/mockSongs";
import { SongRouletteTab } from "../components/songs/SongRouletteTab";

export const SongsPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          곡 &amp; 세트리스트 추천
        </h1>
        <p className="text-sm text-muted-foreground">
          보컬 스타일을 기준으로 곡과 방송용 콘텐츠를 추천합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">내 보컬 스타일 요약</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-muted px-2 py-0.5">
            저음 안정형
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5">
            담백 발라드
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5">
            느린 곡 선호
          </span>
          <span className="text-muted-foreground">
            편안한 음역: A3 &#x007E; D5
          </span>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommend" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="recommend">추천 곡 리스트</TabsTrigger>
          <TabsTrigger value="setlist">라이브 세트리스트</TabsTrigger>
          <TabsTrigger value="cover">이번 달 커버 후보</TabsTrigger>
          <TabsTrigger value="roulette">곡 룰렛(방송 모드)</TabsTrigger>
        </TabsList>

        <TabsContent value="recommend" className="space-y-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">추천 곡</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {mockSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex flex-col rounded border bg-card p-3 text-xs"
                >
                  <div className="text-sm font-medium">
                    {song.title}
                    <span className="ml-1 text-xs text-muted-foreground">
                      {song.artist}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    장르: {song.genre} / 난이도: {song.difficulty} / 언어:{" "}
                    {song.language}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setlist">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">라이브 세트리스트 예시</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="font-medium">오프닝</span>
                <span className="ml-2 text-muted-foreground">
                  밝은 미디엄 템포 곡
                </span>
              </div>
              <div>
                <span className="font-medium">주력곡 1</span>
                <span className="ml-2 text-muted-foreground">
                  현재 스타일에 가장 잘 맞는 발라드
                </span>
              </div>
              <div>
                <span className="font-medium">도전곡</span>
                <span className="ml-2 text-muted-foreground">
                  고음 비중이 조금 더 높은 곡
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cover">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                이번 달 커버 후보 곡
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-muted-foreground">
                트렌드와 보컬 스타일을 기준으로 커버에 적합한 곡을 추천합니다.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roulette">
          <SongRouletteTab userStyleTagSummary="저음 안정형 · 담백 발라드" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
