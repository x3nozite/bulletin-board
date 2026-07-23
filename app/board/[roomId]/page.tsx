import Board from "../Board"

interface Props {
  params: Promise<{
    roomId: string;
  }>
}

export default async function Page({ params }: Props) {
  const p = await params
  return (
    <Board roomId={p.roomId}></Board>
  )
}

