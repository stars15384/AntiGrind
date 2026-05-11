import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoadingProvider, useLoading, PageLoader } from '@/app/contexts/LoadingContext'

// Test component to access loading context
function TestComponent() {
  const { isLoading, loadingCount, setLoading } = useLoading()

  return (
    <div>
      <span data-testid="loading-status">{isLoading ? 'loading' : 'idle'}</span>
      <span data-testid="loading-count">{loadingCount}</span>
      <button onClick={() => setLoading(true)}>Start Loading</button>
      <button onClick={() => setLoading(false)}>Stop Loading</button>
    </div>
  )
}

describe('LoadingContext', () => {
  it('should start with idle state', () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    )

    expect(screen.getByTestId('loading-status').textContent).toBe('idle')
    expect(screen.getByTestId('loading-count').textContent).toBe('0')
  })

  it('should show global loading indicator when loading', async () => {
    const user = userEvent.setup()

    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    )

    await user.click(screen.getByText('Start Loading'))

    expect(screen.getByTestId('loading-status').textContent).toBe('loading')
    expect(screen.getByText(/加载中/i)).toBeInTheDocument()
  })

  it('should handle concurrent loading states correctly', async () => {
    const user = userEvent.setup()

    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    )

    // Start multiple loading operations
    await user.click(screen.getByText('Start Loading'))
    await user.click(screen.getByText('Start Loading'))
    await user.click(screen.getByText('Start Loading'))

    expect(screen.getByTestId('loading-count').textContent).toBe('3')

    // Stop one - should still be loading
    await user.click(screen.getByText('Stop Loading'))
    expect(screen.getByTestId('loading-count').textContent).toBe('2')
    expect(screen.getByTestId('loading-status').textContent).toBe('loading')

    // Stop all
    await user.click(screen.getByText('Stop Loading'))
    await user.click(screen.getByText('Stop Loading'))
    expect(screen.getByTestId('loading-count').textContent).toBe('0')
    expect(screen.getByTestId('loading-status').textContent).toBe('idle')
  })
})

describe('PageLoader', () => => {
  it('should render with default message', () => {
    render(<PageLoader />)

    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('should render custom message', () => {
    render(<PageLoader message="Custom loading message" />)

    expect(screen.getByText('Custom loading message')).toBeInTheDocument()
  })
})
