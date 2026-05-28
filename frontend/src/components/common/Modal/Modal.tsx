import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  children: ReactNode
}

export function Modal({ open, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-[20px]">
      <div className="w-full max-w-[420px] rounded-[24px] bg-white p-[24px] shadow-[0_30px_80px_rgba(0,0,0,0.24)]">
        {children}
      </div>
    </div>
  )
}
