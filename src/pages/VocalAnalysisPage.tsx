// src/pages/VocalAnalysisPage.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import type { VocalProfile } from "../types/domain";

export const VocalAnalysisPage = () => {
  const [fileName, setFileName] = useState<string>("");
  const [profile, setProfile] = useState<VocalProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleMockAnalyze = () => {
    if (!fileName) {
      return;
    }
    setIsAnalyzing(true);
    window.setTimeout(() => {
      const mock: VocalProfile = {
        id: "mock",
        tags: ["저음 안정형", "담백 발라드", "느린 곡 선호"],
        comfortableRange: "A3 &#x007E; D5",
        maxRange: "F3 &#x007E; F5",
        lastAnalyzedAt: "2025-12-10",
      };
      setProfile(mock);
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">보컬 분석</h1>
        <p className="text-sm text-muted-foreground">
          당신의 음성을 기반으로 보컬 스타일을 분석합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">녹음 체크리스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>- 조용한 환경에서 녹음해 주세요.</p>
            <p>- 마이크는 입에서 한 뼘 정도 떨어뜨려 주세요.</p>
            <p>- 20초 &#x007E; 60초 길이의 노래 구간을 추천합니다.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">음성 업로드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="file">노래 파일</Label>
              <Input
                id="file"
                type="file"
                onChange={(event) => {
                  const value =
                    event.target.files && event.target.files[0]
                      ? event.target.files[0].name
                      : "";
                  setFileName(value);
                }}
              />
              <p className="text-xs text-muted-foreground">
                mp3, wav, m4a 파일을 업로드할 수 있습니다.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleMockAnalyze}
              disabled={!fileName || isAnalyzing}
            >
              {isAnalyzing ? "분석 중입니다..." : "가짜 분석 실행"}
            </Button>
            {fileName && (
              <p className="text-xs text-muted-foreground">
                선택된 파일: {fileName}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">분석 결과</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-medium text-muted-foreground">
                스타일 태그
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  편안한 음역
                </div>
                <div>{profile.comfortableRange}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  최대 음역
                </div>
                <div>{profile.maxRange}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              마지막 분석일: {profile.lastAnalyzedAt}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
