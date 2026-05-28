import { ChevronDown, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useGoogleSignIn } from '../../../providers/GoogleSignInProvider'
import { useAuthStore } from '../../../store/authStore'

const headerNavigation: Record<string, { label: string; icon: string }> = {
  '/': { label: 'Home', icon: '/home.svg' },
  '/groups': { label: 'My Groups', icon: '/my_groups.svg' },
  '/dashboard': { label: 'Assignments', icon: '/assignments.svg' },
  '/output': { label: "AI Teacher's Toolkit", icon: '/ai_teacher_toolkit.svg' },
  '/create': { label: 'My Library', icon: '/my_library.svg' },
}

function HeaderNavIcon({ src }: { src: string }) {
  return (
    <span
      aria-hidden="true"
      className="h-[20px] w-[20px] shrink-0"
      style={{
        backgroundColor: '#a9a9a9',
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskImage: `url(${src})`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
      }}
    />
  )
}

interface HeaderProps {
  title?: string
  centeredTitle?: string
}

export function Header({ title = 'Assignment', centeredTitle }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { promptSignIn, clearAuthError } = useGoogleSignIn()
  const activeHeaderItem = headerNavigation['/dashboard'] ?? headerNavigation[pathname] ?? null
  const displayName = user?.name ?? 'Sign In'
  const avatarSrc = user?.picture ?? '/profile.svg'

  const handleSignOut = () => {
    window.google?.accounts?.id?.disableAutoSelect()
    logout()
    setOpen(false)
    router.replace('/')
  }

  return (
    <>
      <header className="hidden h-[56px] w-[calc(100%-24px)] items-center justify-start rounded-[16px] bg-white/75 px-[24px] pr-[12px] shadow-[0_18px_45px_rgba(0,0,0,0.05)] backdrop-blur min-[791px]:mx-[12px] min-[791px]:mt-[12px] min-[791px]:mb-[22px] min-[791px]:flex">
        <Link href="/dashboard" className="grid h-[40px] w-[40px] shrink-0 place-items-center rounded-full bg-[#f5f5f5] text-[#1f1f1f]">
          <img src="/back.svg" alt="Back" className="h-[40px] w-[40px]" />
        </Link>
        <div className="ml-[12px] flex h-[20px] min-w-0 flex-1 max-w-[801px] items-center gap-[8px] text-[#a9a9a9]">
          {activeHeaderItem ? <HeaderNavIcon src={activeHeaderItem.icon} /> : null}
          <span
            className="flex items-center whitespace-nowrap"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '140%',
              letterSpacing: '-0.04em',
              color: '#a9a9a9',
            }}
          >
            {activeHeaderItem?.label ?? centeredTitle ?? title}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-[10px]">
          <div className="relative">
            <button
              type="button"
              onClick={user ? () => setOpen((value) => !value) : () => { clearAuthError(); promptSignIn(() => router.replace('/dashboard')) }}
              className="flex h-[44px] w-[190px] shrink-0 items-center gap-[10px] rounded-[3px] px-[8px]"
            >
              <img src={avatarSrc} alt={`${displayName} profile`} className="h-[32px] w-[32px] shrink-0 rounded-[10px] object-contain" referrerPolicy="no-referrer" />
              <div className="flex h-[24px] w-[93px] min-w-0 items-center gap-[4px]">
                <span
                  className="min-w-0 truncate whitespace-nowrap text-left text-primary"
                  style={{
                    fontFamily: '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '100%',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {displayName}
                </span>
                {user ? <ChevronDown className="h-[24px] w-[24px] shrink-0 text-primary" /> : null}
              </div>
            </button>
            {open && user ? (
              <div className="absolute right-0 top-[48px] z-50 w-[160px] rounded-[10px] bg-white p-[6px] shadow-[0_18px_45px_rgba(0,0,0,0.14)]">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="h-[36px] w-full rounded-[7px] px-[10px] text-left text-[14px] font-semibold tracking-[-0.02em] text-primary hover:bg-[#f0f0f0]"
                >
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
          <button className="relative grid h-[36px] w-[36px] place-items-center rounded-full bg-white">
            <img src="/notification.svg" alt="Notifications" className="h-[36px] w-[36px]" />
          </button>
        </div>
      </header>

      <header className="hidden max-[790px]:block">
        <div className="m-[10px] flex h-[56px] items-center justify-between rounded-[13px] bg-white px-[12px]">
          <div className="flex items-center gap-[8px]">
            <img src="/logo.jpeg" alt="Logo" className="h-[28px] w-[28px]" />
            <span className="text-[20px] font-bold tracking-[-0.06em] text-primary">VedaAI</span>
          </div>
          <div className="flex items-center gap-[10px]">
            <button className="relative grid h-[34px] w-[34px] place-items-center rounded-full bg-[#f7f7f7]">
              <img src="/notification.svg" alt="Notifications" className="h-[36px] w-[36px]" />
            </button>
            {user ? (
              <button type="button" onClick={() => setOpen((value) => !value)} className="relative">
                <img src={avatarSrc} alt={`${displayName} profile`} className="h-[32px] w-[32px] rounded-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  clearAuthError()
                  promptSignIn(() => router.replace('/dashboard'))
                }}
                className="grid h-[28px] w-[66px] place-items-center rounded-full bg-[#222] text-[12px] font-semibold text-white"
              >
                Sign In
              </button>
            )}
            <Menu className="h-[24px] w-[24px]" />
          </div>
        </div>
        {centeredTitle ? (
          <div className="relative flex h-[58px] mx-[6px] items-center justify-center">
            <h1 className="text-[16px] font-bold text-primary">{centeredTitle}</h1>
          </div>
        ) : null}
        {open && user ? (
          <div className="fixed right-[12px] top-[60px] z-50 w-[150px] rounded-[10px] bg-white p-[6px] shadow-[0_18px_45px_rgba(0,0,0,0.14)]">
            <button
              type="button"
              onClick={handleSignOut}
              className="h-[36px] w-full rounded-[7px] px-[10px] text-left text-[14px] font-semibold tracking-[-0.02em] text-primary hover:bg-[#f0f0f0]"
            >
              Sign Out
            </button>
          </div>
        ) : null}
      </header>
    </>
  )
}
