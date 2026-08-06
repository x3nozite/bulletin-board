import { useWsStore } from "../store/useWsStore"

export function ConnectionStatus() {
  const status = useWsStore(w => w.status)

  if (status === "CONNECTED") return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center gap-2 text-sm z-50">
      <div className={`w-2 h-2 rounded-full`} />
      {status}
    </div>
  )
}
