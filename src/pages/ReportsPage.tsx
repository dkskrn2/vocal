// src/pages/ReportsPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export const ReportsPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">성과 리포트</h1>
        <p className="text-sm text-muted-foreground">
          Before와 After 성과, 월간 랭킹과 롤모델 비교를 확인할 수 있습니다.
        </p>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="summary">요약</TabsTrigger>
          <TabsTrigger value="videos">영상별 성과</TabsTrigger>
          <TabsTrigger value="ranking">월간 랭킹</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">내 성과 요약</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
              <div className="rounded border bg-card p-3">
                <div className="text-xs text-muted-foreground">
                  평균 조회수
                </div>
                <div className="mt-1 text-lg font-semibold">
                  +35&#x0025;
                </div>
              </div>
              <div className="rounded border bg-card p-3">
                <div className="text-xs text-muted-foreground">
                  평균 좋아요
                </div>
                <div className="mt-1 text-lg font-semibold">
                  +28&#x0025;
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">영상별 성과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded border bg-card px-3 py-2">
                <div>
                  <div className="font-medium">커버 영상 제목 예시</div>
                  <div className="text-[11px] text-muted-foreground">
                    조회수 1&#x00A0;234 · 좋아요 120
                  </div>
                </div>
                <span className="text-[11px] text-emerald-600">
                  After 영상
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">월간 랭킹</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded border bg-card px-3 py-2">
                <div>
                  <div className="font-medium">StreamerName</div>
                  <div className="text-[11px] text-muted-foreground">
                    조회수 성장률 +230&#x0025; / 좋아요 성장률 +150&#x0025;
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-[11px]"
                >
                  롤모델 비교
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
