import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import { mobileNavigation } from '../../../constants/assignments'
import { cn } from '../../../utils/cn'

export function MobileNavbar() {
  const pathname = usePathname()
  const showCreateShortcut = pathname === '/dashboard'

  return (
    <>
      {showCreateShortcut ? (
        <Link
          href="/create"
          aria-label="Create Assignment"
          className="fixed bottom-[92px] right-[16px] z-50 hidden h-[48px] w-[48px] place-items-center rounded-full bg-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition active:scale-95 max-[790px]:grid"
        >
          <Plus className="h-[24px] w-[24px] text-[#ff4b1f]" strokeWidth={2.5} />
        </Link>
      ) : null}
      <nav className="fixed bottom-[20px] left-[12px] right-[12px] z-40 mx-auto hidden h-[64px] max-w-[420px] items-center justify-around rounded-[18px] bg-[#151515] px-[10px] shadow-[0_16px_40px_rgba(0,0,0,0.35)] max-[790px]:flex">
        {mobileNavigation.map((item) => {
          const active = item.label === 'Assignments' && (pathname === '/dashboard' || pathname === '/create' || pathname === '/output')

          if (item.label === 'Assignments') {
            return (
              <Link key={item.label} href="/dashboard" className={cn('flex min-w-[62px] flex-col items-center gap-[4px] text-[#6d6d6d]', active && 'text-white')}>
                <span
                  className="h-[18px] w-[18px]"
                  style={{
                    backgroundColor: active ? '#ffffff' : '#6d6d6d',
                    WebkitMaskImage: `url(${item.mobileIconSrc ?? '/assignments.svg'})`,
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    maskImage: `url(${item.mobileIconSrc ?? '/assignments.svg'})`,
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    maskSize: 'contain',
                  }}
                />
                <span className="text-[12px] font-semibold">{item.label}</span>
              </Link>
            )
          }

          return (
            <div key={item.label} className="flex min-w-[62px] flex-col items-center gap-[4px] text-[#6d6d6d] opacity-70" aria-disabled="true">
              <span
                className="h-[18px] w-[18px]"
                style={{
                  backgroundColor: '#6d6d6d',
                  WebkitMaskImage: `url(${item.mobileIconSrc ?? '/icons.svg'})`,
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskImage: `url(${item.mobileIconSrc ?? '/icons.svg'})`,
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'contain',
                }}
              />
              <span className="text-[12px] font-semibold">{item.label}</span>
            </div>
          )
        })}
      </nav>
    </>
  )
}
