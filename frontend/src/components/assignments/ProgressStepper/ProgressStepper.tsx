interface ProgressStepperProps {
  firstLineClassName?: string
  secondLineClassName?: string
}

export function ProgressStepper({
  firstLineClassName = 'bg-[#5d5d5d]',
  secondLineClassName = 'bg-[#ffffff]',
}: ProgressStepperProps) {
  return (
    <div className="mx-auto mb-[28px] mt-[32px] flex w-full max-w-[815px] items-center gap-[8px] max-xl:mt-[28px] max-lg:mb-[20px] max-lg:mt-[24px] max-sm:mt-[30px]">
      <span className={`h-[4px] flex-1 rounded-full ${firstLineClassName}`} />
      <span className={`h-[4px] flex-1 rounded-full ${secondLineClassName}`} />
    </div>
  )
}
