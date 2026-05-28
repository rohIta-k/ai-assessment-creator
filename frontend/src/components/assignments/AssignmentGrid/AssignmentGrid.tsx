import type { Assignment } from '../../../types/assignment'
import { AssignmentCard } from '../AssignmentCard'

interface AssignmentGridProps {
  assignments: Assignment[]
  onViewAssignment: (assignmentId: string) => void
  onDeleteAssignment: (assignmentId: string) => void
  onOpenAssignment: (assignmentId: string) => void
}

export function AssignmentGrid({ assignments, onViewAssignment, onDeleteAssignment, onOpenAssignment }: AssignmentGridProps) {
  return (
    <div className="grid grid-cols-1 gap-[12px] lg:grid-cols-2 lg:gap-[12px]">
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          onOpenAssignment={() => onOpenAssignment(assignment.id)}
          onViewAssignment={() => onViewAssignment(assignment.id)}
          onDeleteAssignment={() => onDeleteAssignment(assignment.id)}
        />
      ))}
    </div>
  )
}
