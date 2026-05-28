export function PageTitle() {
  return (
    <div className="mt-[14px] w-full max-sm:mt-[18px]">
      <div className="relative flex min-h-[66px] items-center gap-[16px] max-xl:min-h-[48px] max-xl:justify-center max-xl:gap-[12px] max-sm:min-h-[64px] max-sm:flex-col max-sm:justify-center max-sm:gap-[8px]">
        <span className="grid h-[12px] w-[12px] place-items-center rounded-full bg-[#4fc47d] ring-4 ring-[#b6e9c9] max-xl:hidden" />
        <div className="max-xl:text-center max-sm:text-center">
          <h1 className="text-[22px] font-bold leading-[140%] tracking-[-0.04em] text-primary">
            Review Assignment
          </h1>
          <p className="mt-[3px] text-[14px] font-normal leading-[140%] tracking-[-0.04em] text-muted-80 max-lg:hidden max-[655px]:leading-[1.25]">
            Review, edit and export your generated assignment
          </p>
        </div>
      </div>
    </div>
  )
}