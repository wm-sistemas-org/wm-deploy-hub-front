import * as React from "react"
import { cn } from "../../lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number // 0 to 100
}

export function ProgressBar({ progress, className, ...props }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, progress))

  return (
    <div className={cn("w-full bg-slate-200 rounded-full h-2.5", className)} {...props}>
      <div 
        className="bg-brand-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
