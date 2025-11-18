import { useState, useRef, useEffect } from 'react'
import logoMark from '../../assets/logos/logo-mark.svg'

interface OTPVerificationProps {
  username: string
  onVerify: (otp: string) => void
  onBack: () => void
  isLoading?: boolean
  error?: string
}

export default function OTPVerification({ username, onVerify, onBack, isLoading = false, error }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length === 6) {
      onVerify(otpString)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((digit, index) => index >= pastedData.length && !digit)
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className="min-h-screen bg-gray-100 bg-[#F9FAFB] flex items-center justify-center py-12">
      <div className="w-full px-4 md:w-[582px]">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 rounded-[4px] p-[40px] border-[rgba(0,0,51,0.0588)]">
          {/* Logo and Brand */}
          <div className="mb-4">
            <div className="flex items-center">
              <img src={logoMark} alt="Procon logo" className="w-10 h-10" />
              <span className="ml-3 text-2xl font-bold text-primary-600">Procon Gaming</span>
            </div>
            <h2 className="mt-5 font-inter font-bold text-xl tracking-normal text-gray-900">
              Enter the verification code
            </h2>
          </div>

          {/* Instructions */}
          <div className="mb-3">
            <p className="font-medium text-sm text-gray-900">
                We've sent a 6-digit code to your email:
              </p>
              <p className="font-medium text-sm text-gray-900 mt-1">
                Please check your inbox and enter the code below to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium text-sm text-gray-900">Enter 6-digit code</label>
              <label className="block text-sm font-medium text-sm text-gray-900 mt-4 mb-2">Verification Code</label>
              {/* OTP Input Fields */}
              <div className="flex justify-start space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                   className="w-12 h-12 border-0 text-center text-xl font-semibold rounded-sm bg-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-primary-500"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Expiry Info */}
           <div className="text-md text-[rgba(17,17,17,1)]">
              This code expires in 10 minutes.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={otp.join('').length !== 6 || isLoading}
              className="text-sm w-full h-8 flex items-center justify-center gap-2 bg-primary-600 text-white rounded-md px-3 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"  
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {/* Back Button */}
          {/* <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-primary-600 hover:text-primary-500 font-medium text-sm"
              disabled={isLoading}
            >
              ← Back to login
            </button>
          </div> */}

          {/* Resend Code */}
          <div className="mt-4 text-center">
            <button
              className="text-sm text-[rgba(17,17,17,1)] font-light underline"
              disabled={isLoading}
            >
              Resend code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
