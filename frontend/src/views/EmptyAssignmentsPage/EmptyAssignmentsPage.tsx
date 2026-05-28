import { Header } from '../../components/layout/Header'
import { PageContainer } from '../../components/layout/PageContainer'
import { EmptyState } from '../../components/common/EmptyState'

export function EmptyAssignmentsPage() {
  return (
    <PageContainer>
      <Header />
      <div className="mx-auto flex h-[678px] w-full max-w-[1100px] items-center justify-center">
        <EmptyState />
      </div>
    </PageContainer>
  )
}
