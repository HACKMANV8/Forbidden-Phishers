"use client"

import type { CompanyData } from "@/types"

interface FiltersProps {
  companyData: CompanyData
  selectedCompany: string
  setSelectedCompany: (company: string) => void
  selectedDuration: string
  setSelectedDuration: (duration: string) => void
  selectedSort: string
  setSelectedSort: (sort: string) => void
  selectedDifficulty: string
  setSelectedDifficulty: (difficulty: string) => void
  isLoading?: boolean
}

const Filters = ({
  companyData,
  selectedCompany,
  setSelectedCompany,
  selectedDuration,
  setSelectedDuration,
  selectedSort,
  setSelectedSort,
  selectedDifficulty,
  setSelectedDifficulty,
  isLoading = false,
}: FiltersProps) => {
  const formatDuration = (duration: string) => {
    return duration
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const selectClasses =
    "bg-white text-[#335441] px-6 py-3 rounded-xl border border-[#A9B782]/50 focus:outline-none focus:ring-2 focus:ring-[#335441] focus:border-[#335441] transition-all duration-200 hover:border-[#46704A] hover:shadow-md min-w-[200px] shadow-sm"
  const disabledClasses = "opacity-50 cursor-not-allowed bg-gray-50"

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10 p-6 md:p-8 bg-gradient-to-br from-white to-[#F9F6EE] backdrop-blur-sm rounded-2xl shadow-lg border border-[#A9B782]/40">
      <div className="relative mb-4 sm:mb-0 min-w-[220px]">
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className={`${selectClasses} ${isLoading ? disabledClasses : ""}`}
          disabled={isLoading}
        >
          <option value="">Select a Company</option>
          {Object.keys(companyData).map((company) => (
            <option key={company} value={company}>
              {company.charAt(0).toUpperCase() + company.slice(1)}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#335441]"></div>
          </div>
        )}
      </div>

      <select
        value={selectedDuration}
        onChange={(e) => setSelectedDuration(e.target.value)}
        className={`${selectClasses} ${!selectedCompany || isLoading ? disabledClasses : ""}`}
        disabled={!selectedCompany || isLoading}
      >
        <option value="">Select Duration</option>
        {selectedCompany &&
          companyData[selectedCompany].map((duration) => (
            <option key={duration} value={duration}>
              {formatDuration(duration)}
            </option>
          ))}
      </select>

      <select
        value={selectedSort}
        onChange={(e) => setSelectedSort(e.target.value)}
        className={`${selectClasses} ${isLoading ? disabledClasses : ""}`}
        disabled={isLoading}
      >
        <option value="">Sort By</option>
        <option value="difficulty-asc">Difficulty Asc</option>
        <option value="difficulty-desc">Difficulty Desc</option>
        <option value="frequency-asc">Freq. Asc</option>
        <option value="frequency-desc">Freq. Desc</option>
      </select>

      <select
        value={selectedDifficulty}
        onChange={(e) => setSelectedDifficulty(e.target.value)}
        className={`${selectClasses} ${isLoading ? disabledClasses : ""}`}
        disabled={isLoading}
      >
        <option value="">Difficulty</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
    </div>
  )
}

export default Filters
