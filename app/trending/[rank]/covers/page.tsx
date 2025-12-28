import { AllCoversPage } from "@/components/pages/all-covers-page"

export default function Page({
  params,
}: {
  params: { rank: string }
}) {
  return <AllCoversPage rank={Number.parseInt(params.rank)} />
}
