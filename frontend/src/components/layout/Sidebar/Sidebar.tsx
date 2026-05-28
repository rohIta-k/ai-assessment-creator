import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'
import { sidebarNavigation } from '../../../constants/assignments'
import { cn } from '../../../utils/cn'
import { useAuthStore } from '../../../store/authStore'
import { SignInPromptModal } from '../../auth/SignInPromptModal/SignInPromptModal'
import { useGoogleSignIn } from '../../../providers/GoogleSignInProvider'

const sidebarNavIcons: Record<string, string> = {
  Home: '/home.svg',
  'My Groups': '/my_groups.svg',
  Assignments: '/assignments.svg',
  "AI Teacher's Toolkit": '/ai_teacher_toolkit.svg',
  'My Library': '/my_library.svg',
}

function SidebarNavIcon({ src, active }: { src: string; active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="h-[17px] w-[17px] shrink-0"
      style={{
        backgroundColor: active ? 'var(--color-primary)' : 'var(--color-muted-80)',
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

function Logo() {
  return (
      <div className="flex h-[40px] items-center gap-[10px]">
      <div className="h-[40px] w-[40px] shrink-0 overflow-hidden rounded-[10px]">
        <img src="/logo.jpeg" alt="VedaAI logo" className="h-full w-full object-cover" />
      </div>
      <span className="self-center text-[28px] font-bold leading-[20px] tracking-[-0.06em] text-primary">VedaAI</span>
    </div>
  )
}

export function Sidebar({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const expiresAt = useAuthStore((state) => state.expiresAt)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const router = useRouter()
  const { promptSignIn, authError, clearAuthError } = useGoogleSignIn()
  const isAuthenticated = Boolean(user && token && expiresAt)

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col bg-white shadow-[0_32px_48px_rgba(0,0,0,0.2),0_16px_48px_rgba(0,0,0,0.12)] min-[791px]:ml-[12px] min-[791px]:mt-[12px] min-[791px]:mb-[12px] min-[791px]:flex',
        compact
          ? 'w-[170px] rounded-[14px] p-[16px]'
          : 'w-[304px] rounded-[16px] p-[24px] md:h-[744px] lg:h-[756px]',
      )}
    >
      <div className="flex h-[418px] w-[251px] flex-col gap-[58px]">
        <Logo />
        <div className="inline-flex rounded-[100px] bg-[linear-gradient(90deg,#ff7950_0%,#c0350a_100%)] p-[4px] shadow-[0_32px_48px_rgba(255,255,255,0.2),0_16px_48px_rgba(255,255,255,0.12)]">
          {isAuthenticated ? (
            <Link
              href="/create"
              className={cn(
                'flex h-[42px] items-center justify-center gap-[10px] rounded-[100px] bg-[#272727] px-[43px] py-[8px] text-[16px] font-medium leading-[28px] tracking-[-0.04em] text-white transition hover:bg-[#333333]',
                pathname === '/create' && 'ring-2 ring-[#ff805f]',
              )}
            >
              <img src="/sparkle.svg" alt="Sparkle" className="h-[17.32px] w-[18.32px] shrink-0" />
              <div
                className="flex h-[28px] items-center self-center whitespace-nowrap text-[16px] font-medium leading-[28px] tracking-[-0.04em] text-white"
                style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
              >
                Create Assignment
              </div>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                clearAuthError()
                setShowSignInModal(true)
              }}
              className={cn(
                'flex h-[42px] items-center justify-center gap-[10px] rounded-[100px] bg-[#272727] px-[43px] py-[8px] text-[16px] font-medium leading-[28px] tracking-[-0.04em] text-white transition hover:bg-[#333333]',
                pathname === '/create' && 'ring-2 ring-[#ff805f]',
              )}
            >
              <img src="/sparkle.svg" alt="Sparkle" className="h-[17.32px] w-[18.32px] shrink-0" />
              <div
                className="flex h-[28px] items-center self-center whitespace-nowrap text-[16px] font-medium leading-[28px] tracking-[-0.04em] text-white"
                style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
              >
                Create Assignment
              </div>
            </button>
          )}

          <SignInPromptModal
            open={showSignInModal}
            onClose={() => setShowSignInModal(false)}
            onSignIn={() => {
              promptSignIn(() => router.push('/create'))
            }}
            message="Please sign in before creating assignments."
            errorMessage={authError}
          />
        </div>

        <nav className="flex h-[224px] flex-col gap-[8px]">
          {sidebarNavigation.map((item) => (
            item.label === 'Assignments' ? (
              <Link
                key={item.label}
                href="/dashboard"
                className="flex h-[40px] w-[254px] items-center gap-[12px] rounded-[8px] bg-[#f0f0f0] px-[12px] py-[9px] text-[16px] font-normal leading-[140%] tracking-[-0.04em] text-primary"
              >
                <SidebarNavIcon src={sidebarNavIcons[item.label]} active />
                <span className="flex flex-1 items-center whitespace-nowrap text-primary" style={{
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '140%',
                    letterSpacing: '-0.04em',
                  }}>
                  {item.label}
                </span>
              </Link>
            ) : (
              <div
                key={item.label}
                className="flex h-[40px] w-[254px] cursor-default items-center gap-[12px] rounded-[8px] px-[12px] py-[9px] text-[16px] font-normal leading-[140%] tracking-[-0.04em] text-muted-80"
              >
                <SidebarNavIcon src={sidebarNavIcons[item.label]} active={false} />
                <span className="flex flex-1 items-center whitespace-nowrap text-muted-80" style={{
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '140%',
                    letterSpacing: '-0.04em',
                  }}>
                  {item.label}
                </span>
              </div>
            )
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <button
          type="button"
          className="mb-[18px] flex h-[38px] w-[256px] items-center gap-[8px] rounded-[8px] px-[12px] py-[8px] text-[16px] font-normal leading-[140%] tracking-[-0.04em] text-muted-80 transition hover:bg-[#efefef] hover:text-primary active:bg-[#f0f0f0] active:text-primary"
        >
          <Settings className="h-[17px] w-[17px] shrink-0" />
          <span
            className="flex items-center whitespace-nowrap"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '140%',
              letterSpacing: '-0.04em',
            }}
          >
            Settings
          </span>
        </button>
        <div className="flex h-[80px] items-center gap-[16px] rounded-[16px] bg-[#eeeeee] p-[12px]">
          <img src={user?.picture ?? '/profile.svg'} alt={`${user?.name ?? 'Default'} profile`} className="h-[56px] w-[59px] shrink-0 rounded-[14px] object-contain" referrerPolicy="no-referrer" />
          <div className="min-w-0 h-[44px] w-[165px] flex flex-col justify-center">
            <p
              className="truncate text-primary"
              style={{
                fontFamily: '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '140%',
                letterSpacing: '-0.04em',
              }}
            >
              {user?.name ?? 'Delhi Public School'}
            </p>
            <p
              className="mt-[3px] truncate text-muted"
              style={{
                fontFamily: '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '140%',
                letterSpacing: '-0.04em',
              }}
            >
              {user?.email ?? 'Bokaro Steel City'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
