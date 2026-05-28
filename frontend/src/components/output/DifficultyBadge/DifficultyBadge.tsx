import type { Difficulty } from '../../../types/assignment'
import { cn } from '../../../utils/cn'

const styles: Record<Difficulty, string> = {
  Easy: 'bg-[#eef8ef] text-[#367a44]',
  Moderate: 'bg-[#fff5df] text-[#8a6500]',
  Challenging: 'bg-[#fff0f0] text-[#9d3b3b]',
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={cn('rounded-full px-[7px] py-[2px] text-[10px] font-bold', styles[difficulty])}>
      {difficulty}
    </span>
  )
}
