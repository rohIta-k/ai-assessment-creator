import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[20px] min-w-[28px] items-center justify-center rounded-full bg-[#ff6f3f] px-[8px] text-[11px] font-bold text-white',
        className,
      )}
    >
      {children}
    </span>
  )
}
