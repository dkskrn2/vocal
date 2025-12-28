"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChevronLeft, X, Plus, Save } from "lucide-react"

type ProfileSettings = {
    nickname: string
    channelUrl: string
    favoriteGenres: string[]
    favoriteArtists: string[]
}

export const ProfileSettingsPage = () => {
    const router = useRouter()
    const [nickname, setNickname] = useState("")
    const [channelUrl, setChannelUrl] = useState("")
    const [favoriteGenres, setFavoriteGenres] = useState<string[]>([])
    const [favoriteArtists, setFavoriteArtists] = useState<string[]>([])

    // Temp inputs for adding tags
    const [newGenre, setNewGenre] = useState("")
    const [newArtist, setNewArtist] = useState("")

    useEffect(() => {
        // Load from localStorage or mock defaults
        const stored = localStorage.getItem("vocal-profile-settings")
        if (stored) {
            try {
                const parsed: ProfileSettings = JSON.parse(stored)
                setNickname(parsed.nickname || "")
                setChannelUrl(parsed.channelUrl || "")
                setFavoriteGenres(parsed.favoriteGenres || [])
                setFavoriteArtists(parsed.favoriteArtists || [])
            } catch (e) {
                console.error("Failed to parse settings", e)
            }
        } else {
            // Default mock data (matching profile-page.tsx defaults)
            setFavoriteGenres(["발라드", "R&B", "인디"])
            setFavoriteArtists(["아이유", "박효신", "폴킴"])
        }
    }, [])

    const handleSave = () => {
        const settings: ProfileSettings = {
            nickname,
            channelUrl,
            favoriteGenres,
            favoriteArtists,
        }
        localStorage.setItem("vocal-profile-settings", JSON.stringify(settings))
        router.push("/profile")
    }

    const addGenre = () => {
        if (newGenre && !favoriteGenres.includes(newGenre)) {
            setFavoriteGenres([...favoriteGenres, newGenre])
            setNewGenre("")
        }
    }

    const removeGenre = (tag: string) => {
        setFavoriteGenres(favoriteGenres.filter((g) => g !== tag))
    }

    const addArtist = () => {
        if (newArtist && !favoriteArtists.includes(newArtist)) {
            setFavoriteArtists([...favoriteArtists, newArtist])
            setNewArtist("")
        }
    }

    const removeArtist = (tag: string) => {
        setFavoriteArtists(favoriteArtists.filter((g) => g !== tag))
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-20 fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold">프로필 설정</h1>
                    <p className="text-sm text-muted-foreground">내 정보와 관심사를 수정합니다</p>
                </div>
            </div>

            {/* Basic Info */}
            <Card className="glass-panel">
                <CardHeader>
                    <CardTitle className="text-base text-white">기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nickname" className="text-white">닉네임</Label>
                        <Input
                            id="nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임 입력"
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="channel" className="text-white">채널 링크</Label>
                        <Input
                            id="channel"
                            value={channelUrl}
                            onChange={(e) => setChannelUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Interests */}
            <Card className="glass-panel">
                <CardHeader>
                    <CardTitle className="text-base text-white">관심사 설정</CardTitle>
                    <CardDescription className="text-gray-400">추천 받고 싶은 장르와 가수를 등록하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Genres */}
                    <div className="space-y-3">
                        <Label className="text-white">선호 장르</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {favoriteGenres.map((tag) => (
                                <div
                                    key={tag}
                                    className="flex items-center gap-1 bg-primary/20 text-primary-foreground px-3 py-1 rounded-full text-sm border border-primary/30"
                                >
                                    {tag}
                                    <button onClick={() => removeGenre(tag)} className="hover:text-red-400 ml-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newGenre}
                                onChange={(e) => setNewGenre(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addGenre()}
                                placeholder="장르 추가 (Enter)"
                                className="max-w-[200px] bg-white/5 border-white/10 text-white"
                            />
                            <Button variant="outline" size="icon" onClick={addGenre} className="bg-white/5 border-white/10 hover:bg-white/10">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    {/* Artists */}
                    <div className="space-y-3">
                        <Label className="text-white">선호 가수</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {favoriteArtists.map((tag) => (
                                <div
                                    key={tag}
                                    className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                                >
                                    {tag}
                                    <button onClick={() => removeArtist(tag)} className="hover:text-red-400 ml-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newArtist}
                                onChange={(e) => setNewArtist(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addArtist()}
                                placeholder="가수 추가 (Enter)"
                                className="max-w-[200px] bg-white/5 border-white/10 text-white"
                            />
                            <Button variant="outline" size="icon" onClick={addArtist} className="bg-white/5 border-white/10 hover:bg-white/10">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSave} className="w-full md:w-auto gap-2 gradient-brand-main text-white border-0">
                    <Save className="h-4 w-4" />
                    저장하기
                </Button>
            </div>
        </div>
    )
}
