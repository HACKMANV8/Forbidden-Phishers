"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Problem } from "@/types"

interface ProblemTableProps {
  problems: Problem[]
  selectedSort: string
  selectedDifficulty: string
}

const ProblemTable = ({ problems, selectedSort, selectedDifficulty }: ProblemTableProps) => {
  const [sortedProblems, setSortedProblems] = useState<Problem[]>([])
  const [attemptedProblems, setAttemptedProblems] = useState<Record<string, boolean>>({})
  const [solvedDates, setSolvedDates] = useState<Record<string, string>>({})
  const [visibleProblems, setVisibleProblems] = useState<Problem[]>([])
  const [itemsToShow, setItemsToShow] = useState(15) // Start with 15 items
  const observer = useRef<IntersectionObserver | null>(null)
  const lastProblemRef = useRef<HTMLTableRowElement>(null)

  // Process problems with filters and sorting
  useEffect(() => {
    let filteredProblems = [...problems]

    // Apply difficulty filter
    if (selectedDifficulty) {
      filteredProblems = filteredProblems.filter((problem) => problem.difficulty === selectedDifficulty)
    }

    // Apply sorting
    if (selectedSort) {
      filteredProblems.sort((a, b) => {
        switch (selectedSort) {
          case "difficulty-asc":
            return difficultyWeight(a.difficulty) - difficultyWeight(b.difficulty)
          case "difficulty-desc":
            return difficultyWeight(b.difficulty) - difficultyWeight(a.difficulty)
          case "frequency-asc":
            return a.frequency - b.frequency
          case "frequency-desc":
            return b.frequency - a.frequency
          default:
            return 0
        }
      })
    }

    setSortedProblems(filteredProblems)
    // Reset visible problems and show count when filters change
    setVisibleProblems(filteredProblems.slice(0, itemsToShow))
  }, [problems, selectedSort, selectedDifficulty, itemsToShow])

  // Set up intersection observer for lazy loading
  const lastProblemElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && sortedProblems.length > visibleProblems.length) {
        // Load 10 more items when we reach the bottom
        setItemsToShow(prev => prev + 10)
      }
    })
    if (node) observer.current.observe(node)
  }, [sortedProblems.length, visibleProblems.length])

  useEffect(() => {
    // Load attempted problems from localStorage
    const loadAttemptedProblems = () => {
      const attempted = JSON.parse(localStorage.getItem("attemptedProblems") || "{}")
      const dates = JSON.parse(localStorage.getItem("solvedDates") || "{}")
      setAttemptedProblems(attempted)
      setSolvedDates(dates)
    }

    loadAttemptedProblems()
  }, [])

  const difficultyWeight = (difficulty: string): number => {
    switch (difficulty) {
      case "Easy":
        return 1
      case "Medium":
        return 2
      case "Hard":
        return 3
      default:
        return 0
    }
  }

  const handleAttemptChange = (problemId: string, checked: boolean) => {
    const newAttempted = { ...attemptedProblems, [problemId]: checked }
    const newDates = { ...solvedDates }

    if (checked) {
      newDates[problemId] = new Date().toISOString().split("T")[0]
    } else {
      delete newDates[problemId]
    }

    setAttemptedProblems(newAttempted)
    setSolvedDates(newDates)
    localStorage.setItem("attemptedProblems", JSON.stringify(newAttempted))
    localStorage.setItem("solvedDates", JSON.stringify(newDates))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-[#A9B782]/20 text-[#335441] border-[#A9B782]/30"
      case "Medium":
        return "bg-[#D1B377]/20 text-[#8B7355] border-[#D1B377]/30"
      case "Hard":
        return "bg-[#C45B5B]/20 text-[#7A1F1F] border-[#C45B5B]/30"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (sortedProblems.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-white to-[#F9F6EE] rounded-2xl shadow-lg border border-[#A9B782]/40 mb-8">
        <div className="text-[#A9B782] text-5xl md:text-6xl mb-4">🔍</div>
        <h3 className="text-xl md:text-2xl font-semibold text-[#335441] mb-2">No Problems Found</h3>
        <p className="text-[#6B8F60] text-base md:text-lg">Select a company and duration to view problems.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white to-[#F9F6EE] rounded-2xl shadow-lg border border-[#A9B782]/40 overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-[#F9F6EE] to-[#EFE7D4]">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[#335441] uppercase tracking-wider">ID</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[#335441] uppercase tracking-wider">
                Title
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[#335441] uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[#335441] uppercase tracking-wider">
                Frequency
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[#335441] uppercase tracking-wider">Link</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[#335441] uppercase tracking-wider">
                Attempted
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[#335441] uppercase tracking-wider">
                Date Solved
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A9B782]/30">
            {visibleProblems.map((problem, index) => {
              // Apply ref to the last item for lazy loading
              const isLastItem = index === visibleProblems.length - 1
              return (
                <tr
                  ref={isLastItem ? lastProblemElementRef : null}
                  key={problem.id}
                  className={`hover:bg-[#F9F6EE]/80 transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-[#FCFAF5]"}`}
                >
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-[#335441]">{problem.id}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-[#3C6040] font-medium max-w-xs truncate" title={problem.title}>
                    {problem.title}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-[#6B8F60]">
                    <span className="bg-[#A9B782]/20 text-[#335441] px-2.5 py-1 rounded-full text-xs font-medium min-w-[60px] inline-block text-center">
                      {problem.frequency.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm">
                    <a
                      href={problem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#335441] hover:text-[#46704A] transition-colors duration-200 font-medium"
                      onClick={(e) => {
                        if (!problem.link) {
                          e.preventDefault()
                          return
                        }
                      }}
                    >
                      <span>View</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm">
                    <input
                      type="checkbox"
                      checked={attemptedProblems[problem.id] || false}
                      onChange={(e) => handleAttemptChange(problem.id, e.target.checked)}
                      className="h-4.5 w-4.5 text-[#335441] focus:ring-[#335441] focus:ring-offset-1 border-[#A9B782] rounded transition-colors duration-200"
                    />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-[#6B8F60]">
                    {solvedDates[problem.id] ? (
                      <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">
                        {solvedDates[problem.id]}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visibleProblems.length < sortedProblems.length && (
          <div className="flex justify-center py-6">
            <div className="animate-pulse flex items-center">
              <div className="h-3 w-3 bg-[#A9B782] rounded-full mr-1"></div>
              <div className="h-3 w-3 bg-[#A9B782] rounded-full mr-1"></div>
              <div className="h-3 w-3 bg-[#A9B782] rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProblemTable
