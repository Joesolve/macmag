import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#0D4A2C] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-[12px] shadow-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#E24B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-[#1A1A18] mb-2">Authentication error</h1>
        <p className="text-sm text-[#5A5A52] mb-6">
          Something went wrong during sign in. Please try again.
        </p>
        <Link href="/auth/login" className="btn-primary inline-block text-center">
          Back to login
        </Link>
      </div>
    </div>
  )
}
