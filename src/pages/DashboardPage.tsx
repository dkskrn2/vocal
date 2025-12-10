// src/pages/DashboardPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">대시보드</h1>
        <p className="text-sm text-muted-foreground">
          오늘 할 수 있는 행동을 한눈에 확인할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">나의 보컬 스타일</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-1">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                저음 안정형
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                담백 발라드
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                느린 곡 선호
              </span>
            </div>
            <div className="text-muted-foreground">
              편안한 음역: A3 &#x007E; D5
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/vocal-analysis">보컬 분석 상세 보기</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">추천 액션</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/vocal-analysis">보컬 분석 다시 하기</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/songs">곡 &amp; 세트리스트 추천 받기</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/reports">성과 리포트 확인하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">이번 달 롤모델 스트리머</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm">
          <div>
            <div className="font-medium">StreamerName</div>
            <div className="text-xs text-muted-foreground">
              나와 스타일 유사도: 72&#x0025;
            </div>
          </div>
          <Button asChild size="sm">
            <Link to="/reports">스타일 비교 보러 가기</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">최근 성장 하이라이트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">최근 커버 영상 제목</div>
              <div className="text-xs text-muted-foreground">
                조회수 1&#x00A0;234 · 좋아요 120
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              Before 대비 조회수 +45&#x0025;
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
