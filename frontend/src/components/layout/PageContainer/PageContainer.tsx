import type { ReactNode } from 'react'
import { MobileNavbar } from '../MobileNavbar'
import { Sidebar } from '../Sidebar'

interface PageContainerProps {
  children: ReactNode
  withSidebar?: boolean
  outputMode?: boolean
}

export function PageContainer({ children, withSidebar = true, outputMode = false }: PageContainerProps) {
  return (
    <div className="min-h-screen text-[#252525]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px]">
        {withSidebar ? <Sidebar /> : null}
        <main data-output-mode={outputMode ? 'true' : 'false'} className="relative min-w-0 flex-1 pb-[106px]">
          {children}
        </main>
      </div>
      <MobileNavbar />
    </div>
  )
}
