import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-[22px] border border-white/70 bg-[#ffffff80] shadow-[0_20px_50px_rgba(0,0,0,0.08)]', className)}
      {...props}
    >
      {children}
    </div>
  )
}
