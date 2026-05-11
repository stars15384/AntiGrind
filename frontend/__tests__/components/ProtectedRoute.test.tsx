import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from '@/app/components/ProtectedRoute'

// Mock AuthContext
vi.mock('@/app/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}))

describe('ProtectedRoute', () => {
  it('should show loading state when authenticating', () => {
    const { useAuth } = await import('@/app/contexts/AuthContext')
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText(/验证身份中/i)).toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', () => {
    const { useAuth } = await import('@/app/contexts/AuthContext')
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Navigate component redirects, so protected content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render children when authenticated', async () => {
    const { useAuth } = await import('@/app/contexts/AuthContext')
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', username: 'test', role: 'employee' },
      isAuthenticated: true,
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should show permission denied for insufficient roles', async () => {
    const { useAuth } = await import('@/app/contexts/AuthContext')
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', username: 'test', role: 'employee' },
      isAuthenticated: true,
      isLoading: false,
    })

    render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText(/权限不足/i)).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })
})
