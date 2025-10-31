"use client"

import { useState, useEffect } from "react"

interface HeaderProps {
  companyName?: string
}

const Header = ({ companyName }: HeaderProps) => {
  const [logoUrl, setLogoUrl] = useState<string>("")

  useEffect(() => {
    if (companyName) {
      setLogoUrl(`https://logo.clearbit.com/${companyName}.com`)
    }
  }, [companyName])

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#335441] to-[#46704A] bg-clip-text text-transparent">
        Company-wise Leetcode Problems
      </h1>
      <p className="text-[#6B8F60] text-base md:text-lg mb-8 max-w-2xl mx-auto">
        Discover and practice coding problems from top tech companies. Track your progress and improve your interview
        preparation.
      </p>
      {companyName && (
        <div className="flex items-center justify-center space-x-4 bg-gradient-to-br from-white to-[#F9F6EE] rounded-2xl p-6 shadow-lg max-w-md mx-auto border border-[#A9B782]/40">
          {logoUrl && (
            <img
              src={logoUrl || "/placeholder.svg"}
              alt={`${companyName} logo`}
              className="h-14 w-14 md:h-16 md:w-16 rounded-full shadow-md object-cover"
            />
          )}
          <span className="text-xl md:text-2xl font-semibold text-[#335441]">
            {companyName.charAt(0).toUpperCase() + companyName.slice(1)}
          </span>
        </div>
      )}
    </div>
  )
}

export default Header
