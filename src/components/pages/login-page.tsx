"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageCircle } from "lucide-react"

export const LoginPage = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleSnsLogin = (provider: string) => {
        setIsLoading(provider)
        // Mock login duration
        setTimeout(() => {
            setIsLoading(null)
            router.push("/")
        }, 1000)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black/90 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />

            <Card className="w-full max-w-md glass-panel border-white/10 relative z-10">
                <CardHeader className="space-y-4 text-center pb-8">
                    <div className="flex justify-center mb-2">
                        <div className="h-14 w-14 rounded-xl gradient-brand-main flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
                            CF
                        </div>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-white">CoverFit 시작하기</CardTitle>
                        <CardDescription className="text-gray-400">
                            SNS 계정으로 간편하게 시작하세요
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 px-8 pb-8">
                    {/* Kakao Login */}
                    <Button
                        className="w-full h-12 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black font-semibold border-none relative overflow-hidden group"
                        onClick={() => handleSnsLogin('kakao')}
                        disabled={!!isLoading}
                    >
                        {isLoading === 'kakao' ? (
                            "로그인 중..."
                        ) : (
                            <>
                                <MessageCircle className="mr-2 h-5 w-5 fill-black" />
                                카카오로 계속하기
                            </>
                        )}
                    </Button>

                    {/* Google Login */}
                    <Button
                        variant="outline"
                        className="w-full h-12 bg-white hover:bg-white/90 text-black font-semibold border-none relative overflow-hidden group"
                        onClick={() => handleSnsLogin('google')}
                        disabled={!!isLoading}
                    >
                        {isLoading === 'google' ? (
                            "로그인 중..."
                        ) : (
                            <>
                                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google로 계속하기
                            </>
                        )}
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                    <p className="text-xs text-center text-gray-500 px-4 leading-relaxed">
                        계속 진행하면 CoverFit의 <span className="underline cursor-pointer hover:text-gray-400">서비스 이용약관</span> 및 <span className="underline cursor-pointer hover:text-gray-400">개인정보 처리방침</span>에 동의하게 됩니다.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
