import { Filter, Search } from 'lucide-react'
import { Input } from '../../common/Input'

interface AssignmentFiltersProps {
  searchValue: string
  onSearchValueChange: (value: string) => void
}

export function AssignmentFilters({ searchValue, onSearchValueChange }: AssignmentFiltersProps) {
  return (
    <div className="mb-[12px] flex min-h-[58px] justify-between gap-[14px] rounded-[18px] bg-white p-[10px_15px] shadow-[0_18px_38px_rgba(0,0,0,0.06)] max-lg:mb-[18px] max-lg:h-[57px] max-lg:rounded-[12px] max-lg:p-[9px]">
      <button type="button" className="flex min-w-[145px] items-center justify-center gap-[8px] rounded-full px-[2px] text-[16px] font-medium text-[#8c8c8c] transition hover:text-[#252525] max-lg:min-w-[88px]">
        <Filter className="h-[20px] w-[20px]" />
        <span className="max-lg:hidden">Filter By</span>
        <span className="lg:hidden">Filter</span>
      </button>
      <Input
        icon={<Search className="h-[18px] w-[18px]" />}
        placeholder="Search Assignment"
        value={searchValue}
        onChange={(event) => onSearchValueChange(event.target.value)}
        className="ml-auto max-w-[340px] max-lg:max-w-none max-lg:text-[12px]"
      />
    </div>
  )
}
