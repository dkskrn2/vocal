// src/components/songs/SongRouletteTab.tsx
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import type {
  RouletteConcept,
  RouletteConfig,
  Song,
  SongDifficulty,
  SongLanguage,
} from "../../types/domain";
import { mockSongs } from "../../data/mockSongs";
import { cn } from "../../lib/utils";

const difficultyOptions: Array<SongDifficulty | "any"> = [
  "any",
  "easy",
  "medium",
  "hard",
];

const languageOptions: Array<SongLanguage | "any"> = [
  "any",
  "ko",
  "jp",
  "en",
  "etc",
];

type RouletteResult = {
  song: Song;
};

const conceptLabels: Record<RouletteConcept, string> = {
  superHigh: "엄청 높은 곡",
  superCute: "엄청 귀여운 곡",
  emotionalBallad: "감성 발라드",
  meme: "밈/웃긴 곡",
};

type SongRouletteTabProps = {
  userStyleTagSummary?: string;
};

export const SongRouletteTab = ({ userStyleTagSummary }: SongRouletteTabProps) => {
  const [concept, setConcept] = useState<RouletteConcept>("superHigh");
  const [difficulty, setDifficulty] = useState<SongDifficulty | "any">("any");
  const [language, setLanguage] = useState<SongLanguage | "any">("any");
  const [songCount, setSongCount] = useState<number>(6);
  const [respectUserStyle, setRespectUserStyle] = useState<boolean>(true);
  const [result, setResult] = useState<RouletteResult | null>(null);

  const candidates = useMemo<Song[]>(() => {
    return mockSongs.filter((song) => {
      if (!song.rouletteTags.includes(concept)) {
        return false;
      }
      if (difficulty !== "any" && song.difficulty !== difficulty) {
        return false;
      }
      if (language !== "any" && song.language !== language) {
        return false;
      }
      if (respectUserStyle) {
        // v1에서는 간단한 조건만 사용
        return true;
      }
      return true;
    });
  }, [concept, difficulty, language, respectUserStyle]);

  const handleSpin = () => {
    if (candidates.length === 0) {
      setResult(null);
      return;
    }
    const limited = candidates.slice(0, songCount);
    const randomIndex = Math.floor(Math.random() * limited.length);
    const song = limited[randomIndex];
    setResult({ song });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">룰렛 컨셉 선택</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-4">
          {(
            Object.keys(conceptLabels) as Array<keyof typeof conceptLabels>
          ).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setConcept(key)}
              className={cn(
                "flex flex-col rounded border p-2 text-left text-xs transition-colors",
                concept === key
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted",
              )}
            >
              <span className="font-medium">{conceptLabels[key]}</span>
              <span className="mt-1 text-[11px] text-muted-foreground">
                방송에서 이 컨셉으로 곡을 뽑을 수 있습니다.
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">필터 설정</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">난이도</Label>
            <Select
              value={difficulty}
              onValueChange={(value) =>
                setDifficulty(value as SongDifficulty | "any")
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map((valueOption) => (
                  <SelectItem key={valueOption} value={valueOption}>
                    {valueOption === "any"
                      ? "전체"
                      : valueOption === "easy"
                        ? "쉬움"
                        : valueOption === "medium"
                          ? "보통"
                          : "어려움"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">언어</Label>
            <Select
              value={language}
              onValueChange={(value) =>
                setLanguage(value as SongLanguage | "any")
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((valueOption) => (
                  <SelectItem key={valueOption} value={valueOption}>
                    {valueOption === "any"
                      ? "전체"
                      : valueOption === "ko"
                        ? "한국어"
                        : valueOption === "jp"
                          ? "일본어"
                          : valueOption === "en"
                            ? "영어"
                            : "기타"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">후보 곡 개수</Label>
            <Select
              value={String(songCount)}
              onValueChange={(value) => setSongCount(Number(value))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6곡</SelectItem>
                <SelectItem value="8">8곡</SelectItem>
                <SelectItem value="10">10곡</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded border px-3 py-2">
            <div className="space-y-0.5">
              <Label className="text-xs">내 스타일 반영</Label>
              <p className="text-[11px] text-muted-foreground">
                분석된 보컬 스타일을 기준으로 필터합니다.
              </p>
            </div>
            <Switch
              checked={respectUserStyle}
              onCheckedChange={setRespectUserStyle}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">곡 룰렛 방송 화면</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userStyleTagSummary && (
            <p className="text-xs text-muted-foreground">
              현재 보컬 스타일: {userStyleTagSummary}
            </p>
          )}
          <div className="flex flex-col items-center justify-center rounded bg-background/80 py-8 shadow-inner">
            <div className="mb-4 text-xs text-muted-foreground">
              브라우저 소스로 이 화면을 방송에 띄우고 버튼을 눌러 주세요.
            </div>
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-primary/40 bg-primary/5 text-center text-xs font-medium">
              {result ? (
                <span>
                  {result.song.title}
                  <br />
                  <span className="text-[11px] text-muted-foreground">
                    {result.song.artist}
                  </span>
                </span>
              ) : candidates.length === 0 ? (
                <span>조건에 맞는 후보 곡이 없습니다.</span>
              ) : (
                <span>곡 룰렛을 시작해 보세요.</span>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="button" size="sm" onClick={handleSpin}>
                룰렛 돌리기
              </Button>
            </div>
          </div>
          {result && (
            <div className="rounded border bg-muted/40 p-3 text-xs">
              <div className="font-medium">
                선택된 곡: {result.song.title} &mdash; {result.song.artist}
              </div>
              <div className="mt-1 text-muted-foreground">
                난이도: {result.song.difficulty} / 최고음:{" "}
                {result.song.peakNote}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
