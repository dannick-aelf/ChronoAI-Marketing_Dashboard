import { useState, useEffect } from 'react'

interface CodeEntryPageProps {
  email: string
  onCodeSubmit: (code: string) => void
  onBack: () => void
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}

const CodeEntryPage = ({ email, onCodeSubmit, onBack, theme, setTheme }: CodeEntryPageProps) => {
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // Auto-focus code input
  useEffect(() => {
    const input = document.getElementById('code')
    if (input) {
      input.focus()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      onCodeSubmit(code)
      setIsSubmitting(false)
    }, 500)
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    // Simulate API call to resend email
    setTimeout(() => {
      setIsResending(false)
      // Could show a success message here
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

      <div className="w-full max-w-md">
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
        <div className="bg-bg-surface border border-border rounded-card p-6 shadow-elevated relative">
          {/* Back Button - Top Left inside card */}
          <button
            onClick={onBack}
            className="absolute top-6 left-6 text-text-muted hover:text-text-secondary hover:underline transition-all duration-200 flex items-center gap-2 active:opacity-80"
            aria-label="Back to email"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-secondary">Back</span>
          </button>

          {/* Messaging */}
          <div className="text-center mb-6">
            <p className="text-text-secondary text-base mb-2">
              We sent a login code to
            </p>
            <p className="text-text-primary text-base font-medium">
              {email}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code Input */}
            <div>
              <label htmlFor="code" className="block text-sm font-secondary text-text-secondary mb-2">
                Enter the 6-digit code to continue
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="000000"
                className="w-full px-4 py-3 rounded-input border border-border bg-bg-primary text-text-primary font-secondary focus:outline-none focus:border-border text-base text-center tracking-widest"
                style={{ 
                  minHeight: '48px',
                  fontSize: '24px',
                  letterSpacing: '0.5em'
                }}
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={code.length !== 6 || isSubmitting}
              className={`w-full py-3 rounded-button font-secondary font-semibold text-base transition-all duration-200 active:opacity-80 ${
                code.length !== 6 || isSubmitting
                  ? 'bg-grey-bg-3 text-text-muted cursor-not-allowed opacity-50'
                  : 'bg-white text-black hover:bg-white-90'
              }`}
              style={{ minHeight: '52px' }}
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Options */}
          <div className="mt-6 space-y-3">
            {/* Resend Email Button */}
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={isResending}
              className={`w-full text-text-secondary text-sm font-secondary transition-all duration-200 ${
                isResending 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:text-text-primary hover:underline active:opacity-80'
              }`}
            >
              {isResending ? 'Resending...' : 'Resend email'}
            </button>

            {/* Didn't Receive Email Button */}
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="w-full text-text-secondary hover:text-text-primary hover:underline text-sm font-secondary transition-all duration-200 active:opacity-80"
            >
              Didn't receive an email?
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer - Center Bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 text-center z-0">
        <p className="text-text-muted text-xs font-secondary">
          Secured by ChronoAI
        </p>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50"
            onClick={() => setShowHelpModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-bg-surface border border-border rounded-modal shadow-elevated max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowHelpModal(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors duration-200"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Content */}
              <h2 className="text-xl font-primary font-semibold text-text-primary mb-4 pr-8">
                Didn't receive an email?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-text-primary font-semibold flex-shrink-0">1.</span>
                  <p className="text-text-secondary text-sm font-secondary">
                    Confirm you entered the correct email address.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-text-primary font-semibold flex-shrink-0">2.</span>
                  <p className="text-text-secondary text-sm font-secondary">
                    Check your spam folder.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-text-primary font-semibold flex-shrink-0">3.</span>
                  <p className="text-text-secondary text-sm font-secondary">
                    Contact your admin to confirm your permissions.
                  </p>
                </div>
              </div>

              {/* Close Button at Bottom */}
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-6 py-3 rounded-button font-secondary font-semibold text-base bg-white text-black hover:bg-white-90 transition-all duration-200 active:opacity-80"
                style={{ minHeight: '52px' }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CodeEntryPage

