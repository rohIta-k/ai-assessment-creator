'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '../Button'
import { useAuthStore } from '../../../store/authStore'
import { useGoogleSignIn } from '../../../providers/GoogleSignInProvider'
import { SignInPromptModal } from '../../auth/SignInPromptModal/SignInPromptModal'

export function EmptyState() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const expiresAt = useAuthStore((state) => state.expiresAt)
  const isAuthenticated = Boolean(user && token && expiresAt)
  const { promptSignIn, authError, clearAuthError } = useGoogleSignIn()
  const [showSignInModal, setShowSignInModal] = useState(false)

  return (
    <motion.section
      className="mx-auto flex h-169.5 w-full max-w-121.5 flex-col items-center justify-center text-center"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative mb-7 h-60 w-71.5 max-md:h-[176px] max-md:w-[210px]">
        <img
          src="/no_assignment.svg"
          alt="No assignments"
          className="h-full w-full object-contain"
        />
      </div>
      <h1 className="text-[20px] font-bold text-primary">
        No assignments yet
      </h1>
      <p className="mt-5 max-w-486 text-[16px] leading-[140%] tracking-[-0.04em] text-muted-80 font-regular">
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics,
        define marking criteria, and let AI assist with grading.
      </p>
      <Button
        className="mt-9 h-11.5! w-69.25! px-5.5!"
        size="md"
        onClick={() => {
          if (isAuthenticated) {
            router.push('/create')
            return
          }

          clearAuthError()
          setShowSignInModal(true)
        }}
      >
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <div
            className="font-[inherit] text-[16px] font-medium leading-[140%] tracking-[-0.04em]"
            style={{
              fontFamily: '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            Create Your First Assignment
          </div>
        </div>
      </Button>

      <SignInPromptModal
        open={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignIn={() => {
          promptSignIn(() => router.push('/create'))
        }}
        message="Please sign in before creating assignments."
        errorMessage={authError}
      />
    </motion.section>
  )
}
