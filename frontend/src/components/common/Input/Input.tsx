import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
}

export function Input({ className, icon, ...props }: InputProps) {
  return (
    <label className="relative block">
      {icon ? <span className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#a4a4a4]">{icon}</span> : null}
      <input
        className={cn(
          'h-[40px] w-full rounded-full border border-[#d5d5d5] bg-white px-[18px] text-[14px] text-[#222] outline-none transition placeholder:text-[#a9a9a9] focus:border-[#202020] focus:ring-4 focus:ring-black/5',
          Boolean(icon) && 'pl-[46px]',
          className,
        )}
        {...props}
      />
    </label>
  )
}
