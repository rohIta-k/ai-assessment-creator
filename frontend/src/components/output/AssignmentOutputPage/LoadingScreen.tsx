import { motion } from 'framer-motion'
import { FileText, GraduationCap, Sparkles } from 'lucide-react'
import { useAssignmentStore } from '../../../store/assignmentStore'

const generationSteps = [
    { label: 'Understanding topics & difficulty', caption: 'Extracting key concepts', threshold: 32 },
    { label: 'Generating questions', caption: 'Creating diverse questions', threshold: 55 },
    { label: 'Reviewing & formatting', caption: 'Structuring sections and marks', threshold: 75 },
    { label: 'Finalizing assignment', caption: 'Almost done...', threshold: 92 },
]

function LoadingIllustration() {
    return (
        <div className="hidden justify-end max-lg:hidden xl:flex">
            <div className="relative h-[340px] w-[480px] origin-top-right scale-100 transform-gpu max-[1400px]:h-[300px] max-[1400px]:w-[420px] max-[1400px]:scale-[0.8] max-[1280px]:h-[250px] max-[1280px]:w-[350px] max-[1280px]:scale-[0.6] max-[1120px]:h-[210px] max-[1120px]:w-[290px] max-[1120px]:scale-[0.5]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-[100px] top-[18px] h-[290px] w-[360px] rounded-[50%] border border-dashed border-[#ff7b41]/50"
                />
                <div className="absolute right-[82px] top-[86px] h-[250px] w-[230px] rotate-[7deg] rounded-[16px] bg-white/70 shadow-[0_30px_50px_rgba(0,0,0,0.08)]" />
                <motion.div
                    animate={{ y: [0, -10, 0], rotate: [-6, -3, -6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-[160px] top-[66px] h-[292px] w-[250px] -rotate-[8deg] rounded-[18px] bg-white p-[28px] shadow-[0_34px_60px_rgba(0,0,0,0.13)]"
                >
                    <span className="grid h-[64px] w-[64px] place-items-center rounded-full bg-[#ffe5dc] text-[#ff4b1f]">
                        <Sparkles className="h-[34px] w-[34px]" />
                    </span>
                    <div className="mt-[22px] space-y-[10px]">
                        <span className="block h-[8px] w-[120px] rounded-full bg-[#e7e7e7]" />
                        <span className="block h-[8px] w-[170px] rounded-full bg-[#d5d5d5]" />
                        <span className="block h-[22px] w-[190px] rounded-[8px] bg-[#ffe5dc]" />
                        <span className="block h-[8px] w-[150px] rounded-full bg-[#e7e7e7]" />
                        <span className="block h-[8px] w-[185px] rounded-full bg-[#e7e7e7]" />
                    </div>
                </motion.div>
                <span className="absolute left-[88px] bottom-[36px] grid h-[72px] w-[72px] place-items-center rounded-[16px] bg-[#ffe5dc]">
                    <FileText className="h-[30px] w-[30px]" />
                </span>
                <span className="absolute right-[14px] top-[76px] grid h-[72px] w-[72px] place-items-center rounded-[16px] bg-[#ffe5dc]">
                    <GraduationCap className="h-[34px] w-[34px]" />
                </span>
            </div>
        </div>
    )
}

interface LoadingScreenProps {
    onRetry: () => void
}

export function LoadingScreen({ onRetry }: LoadingScreenProps) {
    const { generationProgress, generationStep, generationStatus, generationError } = useAssignmentStore()
    const progress = generationStatus === 'failed' ? generationProgress : Math.max(generationProgress, 8)

    return (
        <section className="mt-[36px] rounded-[28px] bg-white/55 px-[96px] py-[30px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] max-lg:px-[28px] max-md:mt-[28px] max-md:rounded-[24px] max-md:py-[15px] max-sm:px-[20px] max-sm:py-[18px]">
            <div className="flex items-center justify-center gap-[30px] max-lg:flex-col max-lg:gap-[12px]">
                <div className="w-[430px] max-lg:w-full max-lg:max-w-[580px] max-lg:text-center">
                    <h2 className="mt-[24px] text-[28px] font-bold leading-[1.15] text-primary max-[655px]:text-[24px] max-sm:text-[22px]">
                        Generating your assignment...
                    </h2>
                    <p className="mt-[14px] max-w-[310px] text-[16px] leading-[1.45] text-muted-80 max-lg:mx-auto max-sm:max-w-none max-sm:text-[15px]">
                        Our AI is analysing your inputs and creating a well-structured question paper.
                    </p>

                    <div className="mt-[42px] space-y-[20px] max-lg:mt-[30px] max-sm:mt-[24px] max-sm:space-y-[16px]">
                        {generationSteps.map((step) => {
                            const complete = progress >= step.threshold + 10
                            const active = generationStep === step.label || (!complete && progress >= step.threshold - 10)
                            return (
                                <div key={step.label} className="flex gap-[18px] max-sm:gap-[14px]">
                                    <span
                                        className={`mt-[2px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-[12px] ${complete ? 'bg-[#35c866] text-white' : active ? 'bg-white text-[#ff4b1f] ring-4 ring-[#ff4b1f]/20' : 'bg-[#d1d1d1]'
                                            }`}
                                    >
                                        {complete ? '✓' : active ? '' : ''}
                                    </span>
                                    <div>
                                        <p className="text-[15px] font-bold text-primary max-sm:text-[14px]">{step.label}</p>
                                        <p className="mt-[3px] text-[13px] text-muted-80 max-sm:text-[12px]">{step.caption}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <LoadingIllustration />
            </div>

            <div className="mx-auto mt-[56px] flex max-w-[860px] items-center gap-[26px] max-lg:mt-[40px] max-md:mt-[34px] max-sm:gap-[18px]">
                <div className="h-[14px] flex-1 overflow-hidden rounded-full bg-[#ededed]">
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                        className="h-full rounded-full bg-[linear-gradient(90deg,#ff3718_0%,#ff7b2f_100%)]"
                    />
                </div>
                <span className="w-[54px] text-[24px] font-bold text-primary max-sm:w-[44px] max-sm:text-[18px]">{Math.round(progress)}%</span>
            </div>
            <p className="mt-[18px] text-center text-[16px] text-muted-80 max-sm:text-[14px]">
                <Sparkles className="mr-[8px] inline h-[18px] w-[18px] max-sm:mr-[6px] max-sm:h-[16px] max-sm:w-[16px]" />
                {generationStatus === 'failed' ? generationError : 'This may take a few seconds...'}
            </p>
            {generationStatus === 'failed' ? (
                <button type="button" onClick={onRetry} className="mx-auto mt-[18px] block h-[42px] rounded-full bg-[#242424] px-[24px] text-[15px] font-semibold text-white max-[655px]:h-[58px] max-[655px]:px-[34px] max-[655px]:text-[24px] max-sm:h-[44px] max-sm:px-[22px] max-sm:text-[14px]">
                    Try Again
                </button>
            ) : null}
        </section>
    )
}