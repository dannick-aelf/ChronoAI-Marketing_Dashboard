import { useState } from 'react'

interface LoginPageProps {
  onEmailSubmit: (email: string) => void
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}

const LoginPage = ({ onEmailSubmit, theme, setTheme }: LoginPageProps) => {
  const [emailPrefix, setEmailPrefix] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailPrefix.trim()) return

    setIsSubmitting(true)
    const fullEmail = `${emailPrefix.trim()}@aelf.io`
    // Simulate API call
    setTimeout(() => {
      onEmailSubmit(fullEmail)
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative">
      {/* Theme Toggle Button - Bottom Left of Page */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed bottom-6 left-6 w-10 h-10 rounded-lg bg-button-bg text-button-text border border-border hover:bg-button-bg-hover transition-all duration-200 active:opacity-80 flex items-center justify-center z-10"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-md relative">

        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img 
              src={theme === 'dark' ? '/Icons/Logo_dark.png' : '/Icons/Logo_light.png'}
              alt="ChronoAI"
              className="h-auto object-contain"
              style={{ maxHeight: '30px' }}
            />
          </div>
          <h1 className="text-2xl font-primary font-normal text-text-primary mb-2">
            Marketing Dashboard
          </h1>
        </div>

        {/* Card */}
        <div className="bg-bg-surface border border-border rounded-card p-6 shadow-elevated">
          {/* Messaging */}
          <p className="text-text-secondary text-base mb-6 text-center">
            Log in with your aelf email
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-secondary text-text-secondary mb-2">
                Email
              </label>
              <div className="relative flex items-center">
                <input
                  id="email"
                  type="text"
                  value={emailPrefix}
                  onChange={(e) => setEmailPrefix(e.target.value)}
                  placeholder="yourname"
                  className="w-full px-4 py-3 pr-20 rounded-input border border-border bg-bg-primary text-text-primary font-secondary focus:outline-none focus:border-border text-base"
                  style={{ minHeight: '48px' }}
                  autoComplete="username"
                  autoFocus
                />
                <span className="absolute right-4 text-text-secondary pointer-events-none select-none">
                  @aelf.io
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!emailPrefix.trim() || isSubmitting}
              className={`w-full py-3 rounded-button font-secondary font-semibold text-base transition-all duration-200 active:opacity-80 ${
                !emailPrefix.trim() || isSubmitting
                  ? 'bg-grey-bg-3 text-text-muted cursor-not-allowed opacity-50'
                  : 'bg-white text-black hover:bg-white-90'
              }`}
              style={{ minHeight: '52px' }}
            >
              {isSubmitting ? 'Sending...' : 'Get log in code'}
            </button>
          </form>
        </div>
      </div>

      {/* Disclaimer - Center Bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 text-center z-0">
        <p className="text-text-muted text-xs font-secondary">
          Secured by ChronoAI
        </p>
      </div>
    </div>
  )
}

export default LoginPage

