import { useWsStore } from "../store/useWsStore"

export function ConnectionStatus() {
  const status = useWsStore(w => w.status)

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full`} />
      {status}
    </div>
  )
}
