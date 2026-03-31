import { Loader2 } from "lucide-react"

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex justify-center items-center">
      <Loader2 className={`animate-spin text-brand-600 h-8 w-8 ${className || ''}`} />
    </div>
  )
}
