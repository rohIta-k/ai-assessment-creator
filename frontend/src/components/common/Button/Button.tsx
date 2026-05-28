import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-[#191919] text-white shadow-[0_12px_22px_rgba(0,0,0,0.18)] hover:bg-[#2d2d2d]',
  secondary: 'bg-white text-[#202020] shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:bg-[#f4f4f4]',
  ghost: 'bg-transparent text-[#222] hover:bg-[#efefef]',
}

const sizes = {
  sm: 'h-[34px] px-[16px] text-[13px]',
  md: 'h-[44px] px-[20px] text-[14px]',
  lg: 'h-[52px] px-[24px] text-[15px]',
}

export function Button({ children, className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-[8px] rounded-full font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
