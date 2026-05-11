import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal Content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal Content')).toBeInTheDocument()
  })

  it('should display error UI when child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText(/出了点问题/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /重试/i })).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should recover on retry click', async () => {
    const user = userEvent.setup()
    let shouldThrow = true

    const ThrowSometimes = () => {
      if (shouldThrow) throw new Error('Error')
      return <div>Recovered</div>
    }

    render(
      <ErrorBoundary>
        <ThrowSometimes />
      </ErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /重试/i })
    shouldThrow = false
    await user.click(retryButton)

    expect(screen.getByText('Recovered')).toBeInTheDocument()
  })

  it('should show custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary fallback={<div>Custom Fallback</div>}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
