import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import CodeEntryPage from './components/CodeEntryPage'

type AuthStep = 'login' | 'code'

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme')
    return (saved === 'light' || saved === 'dark') ? saved : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const [step, setStep] = useState<AuthStep>('login')
  const [email, setEmail] = useState('')

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail)
    setStep('code')
  }

  const handleCodeSubmit = (code: string) => {
    // TODO: Implement actual authentication logic
    console.log('Login code submitted:', code, 'for email:', email)
    // After successful authentication, redirect or update state
    alert(`Login successful! Code: ${code}, Email: ${email}`)
  }

  const handleBack = () => {
    setStep('login')
    setEmail('')
  }

  return (
    <>
      {step === 'login' && (
        <LoginPage 
          onEmailSubmit={handleEmailSubmit}
          theme={theme}
          setTheme={setTheme}
        />
      )}
      {step === 'code' && (
        <CodeEntryPage 
          email={email} 
          onCodeSubmit={handleCodeSubmit}
          onBack={handleBack}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </>
  )
}

export default App

