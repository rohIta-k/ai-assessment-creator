'use client'

import { MoreVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Assignment } from '../../../types/assignment'

interface AssignmentCardProps {
  assignment: Assignment
  onViewAssignment?: () => void
  onDeleteAssignment?: () => void
  onOpenAssignment?: () => void
}

export function AssignmentCard({ assignment, onViewAssignment, onDeleteAssignment, onOpenAssignment }: AssignmentCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const cardRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!cardRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <motion.article
      ref={cardRef}
      role={onOpenAssignment ? 'button' : undefined}
      tabIndex={onOpenAssignment ? 0 : undefined}
      onClick={onOpenAssignment}
      onKeyDown={(event) => {
        if (!onOpenAssignment) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenAssignment()
        }
      }}
      whileTap={onOpenAssignment ? { scale: 0.985 } : undefined}
      className="relative min-h-[148px] cursor-pointer select-none rounded-[21px] bg-white p-[25px] shadow-[0_18px_38px_rgba(0,0,0,0.08)] transition hover:-translate-y-[2px] hover:shadow-[0_24px_46px_rgba(0,0,0,0.12)] active:shadow-[0_16px_32px_rgba(0,0,0,0.1)] max-lg:min-h-[104px] max-lg:p-[18px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <div className="flex items-start justify-between gap-[12px]">
        <h2 className="cursor-pointer text-[22px] font-extrabold leading-tight tracking-[-0.035em] underline decoration-[#767676] decoration-[1px] underline-offset-[3px] max-lg:text-[16px]">
          {assignment.title}
        </h2>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setIsMenuOpen((value) => !value)
          }}
          className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full text-[#1d1d1d] transition hover:bg-[#efefef]"
        >
          <MoreVertical className="h-[20px] w-[20px]" />
        </button>
      </div>

      {isMenuOpen ? (
        <div className="absolute right-[54px] top-[48px] z-10 w-[122px] rounded-[8px] bg-white p-[6px] text-[12px] shadow-[0_22px_46px_rgba(0,0,0,0.22)]">
          <button type="button" onClick={(event) => { event.stopPropagation(); setIsMenuOpen(false); onViewAssignment?.() }} className="block h-[34px] w-full rounded-[5px] px-[8px] text-left text-[#252525] hover:bg-[#f1f1f1]">View Assignment</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setIsMenuOpen(false); onDeleteAssignment?.() }} className="block h-[34px] w-full rounded-[5px] bg-[#f6f6f6] px-[8px] text-left text-[#e13d3d] hover:bg-[#f1f1f1]">Delete</button>
        </div>
      ) : null}

      <div className="mt-[50px] flex items-center justify-between gap-[16px] text-[14px] max-lg:mt-[28px] max-lg:text-[14px]">
        <p className="min-w-0">
          <span className="font-extrabold">Assigned on</span>
          <span className="text-[#777]"> : {assignment.assignedOn}</span>
        </p>
        <p className="min-w-0 text-right">
          <span className="font-extrabold">Due</span>
          <span className="text-[#777]"> : {assignment.due}</span>
        </p>
      </div>
    </motion.article>
  )
}
