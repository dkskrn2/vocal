// src/pages/ProfilePage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

export const ProfilePage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">내 프로필</h1>
        <p className="text-sm text-muted-foreground">
          스트리머 정보를 관리하고 보컬 스타일 요약을 확인할 수 있습니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-1">
            <Label htmlFor="nickname">닉네임</Label>
            <Input id="nickname" placeholder="닉네임을 입력해 주세요." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="channel">주요 채널 링크</Label>
            <Input
              id="channel"
              placeholder="유튜브 또는 방송 채널 주소를 입력해 주세요."
            />
          </div>
          <Button type="button" size="sm">
            가짜 저장
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">보컬 스타일 프로필</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex flex-wrap gap-1">
            <span className="rounded-full bg-muted px-2 py-0.5">
              저음 안정형
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5">
              담백 발라드
            </span>
          </div>
          <div className="text-muted-foreground">
            편안한 음역: A3 &#x007E; D5
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
