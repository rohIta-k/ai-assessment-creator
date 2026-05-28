import type { ReactNode } from 'react'

export function ActionButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex h-[44px] items-center justify-center gap-[12px] rounded-full  bg-white/70 px-[24px] text-[16px] font-medium text-primary shadow-[0_10px_20px_rgba(0,0,0,0.04)]"
        >
            {children}
        </button>
    )
}