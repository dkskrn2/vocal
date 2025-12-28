"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export const MixingPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">녹음 · 믹싱</h1>
        <p className="text-xs md:text-sm text-muted-foreground">커버용 보컬 파일을 업로드하고 믹싱 결과를 받아볼 수 있습니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">녹음 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>- 반주와 보컬이 분리된 파일을 사용하는 것을 추천합니다.</p>
          <p>- 녹음 시 클리핑이 발생하지 않도록 게인을 조정해 주세요.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">보컬 파일 업로드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1 text-sm">
            <Label htmlFor="mix-title">곡 제목</Label>
            <Input id="mix-title" placeholder="곡 제목을 입력해 주세요." />
          </div>
          <div className="space-y-1 text-sm">
            <Label htmlFor="mix-file">보컬 파일</Label>
            <Input id="mix-file" type="file" />
          </div>
          <Button type="button" variant="gradient" size="sm">
            가짜 믹싱 요청 보내기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
