import { render, screen } from '@testing-library/react'
import { HomePage } from '@/app/components/HomePage'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'zh',
      changeLanguage: vi.fn(),
    },
  }),
}))

// Mock API
vi.mock('../../api/companies', () => ({
  companiesApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}))

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}))

describe('HomePage', () => {
  it('should render main navigation', () => {
    render(<HomePage />)

    // Should have main navigation elements
    expect(screen.getByText('app.title')).toBeInTheDocument()
  })

  it('should have search functionality', () => {
    render(<HomePage />)

    const searchInput = screen.getByPlaceholderText(/搜索/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('should display certification button', () => {
    render(<HomePage />)

    // Should have certification entry point
    expect(screen.getByText(/home.certification_btn/i)).toBeInTheDocument()
  })
})
