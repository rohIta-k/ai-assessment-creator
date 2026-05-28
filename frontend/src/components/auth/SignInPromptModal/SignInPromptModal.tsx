'use client'

import type { ReactNode } from 'react'
import { Modal } from '../../common/Modal/Modal'

interface SignInPromptModalProps {
  open: boolean
  onClose: () => void
  onSignIn: () => void
  title?: string
  message?: ReactNode
  errorMessage?: string | null
}

export function SignInPromptModal({
  open,
  onClose,
  onSignIn,
  title = 'Sign in required',
  message = 'Please sign in to continue.',
  errorMessage,
}: SignInPromptModalProps) {
  return (
    <Modal open={open}>
      <div className="text-left">
        <h3 className="text-[18px] font-semibold text-primary">{title}</h3>
        <p className="mt-3 text-[14px] text-muted-90">{message}</p>
        {errorMessage ? <p className="mt-3 text-[13px] text-[#c0350a]">{errorMessage}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-[14px] font-medium text-primary hover:bg-[#f5f5f5]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-lg bg-[#272727] px-3 py-2 text-[14px] font-medium text-white hover:bg-[#333333]"
          >
            Sign in
          </button>
        </div>
      </div>
    </Modal>
  )
}