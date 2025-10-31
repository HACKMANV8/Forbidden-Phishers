"use client"

import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js"
import { Pie, Bar } from "react-chartjs-2"
import type { Problem } from "@/types"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

interface ChartsProps {
  problems: Problem[]
}

const Charts = ({ problems }: ChartsProps) => {
  const [difficultyData, setDifficultyData] = useState({
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ["#A9B782", "#D1B377", "#C45B5B"],
        borderColor: ["#9A8B5F", "#B89C64", "#A84D4D"],
        borderWidth: 2,
      },
    ],
  })

  const [topProblemsData, setTopProblemsData] = useState({
    labels: [],
    datasets: [
      {
        label: "Frequency (%)",
        data: [],
        backgroundColor: "rgba(107, 143, 96, 0.8)",
        borderColor: "#6B8F60",
        borderWidth: 2,
      },
    ],
  })

  useEffect(() => {
    // Calculate difficulty distribution
    const difficultyCounts = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    }

    problems.forEach((problem) => {
      difficultyCounts[problem.difficulty]++
    })

    setDifficultyData((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          data: [difficultyCounts.Easy, difficultyCounts.Medium, difficultyCounts.Hard],
        },
      ],
    }))

    // Calculate top 10 problems by frequency
    const sortedProblems = [...problems].sort((a, b) => b.frequency - a.frequency).slice(0, 10)
    const topLabels = sortedProblems.map(problem => {
      // Truncate long titles to prevent chart clutter
      return problem.title.length > 20 ? problem.title.substring(0, 20) + "..." : problem.title
    })
    const topFrequencies = sortedProblems.map(problem => problem.frequency)

    setTopProblemsData((prev) => ({
      ...prev,
      labels: topLabels,
      datasets: [
        {
          ...prev.datasets[0],
          data: topFrequencies,
        },
      ],
    }))
  }, [problems])

  if (problems.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <div className="bg-gradient-to-br from-white to-[#F9F6EE] p-6 md:p-8 rounded-2xl shadow-lg border border-[#A9B782]/40">
        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center bg-gradient-to-r from-[#335441] to-[#46704A] bg-clip-text text-transparent">
          Difficulty Distribution
        </h3>
        <div className="h-72 md:h-80">
          <Pie
            data={difficultyData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    padding: 15,
                    font: {
                      size: 12,
                      weight: 500,
                    },
                    color: "#335441",
                    usePointStyle: true,
                    pointStyle: "circle",
                  },
                },
                tooltip: {
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  titleColor: "#335441",
                  bodyColor: "#6B8F60",
                  borderColor: "#A9B782",
                  borderWidth: 1,
                  padding: 12,
                  borderRadius: 8,
                  usePointStyle: true,
                  callbacks: {
                    label: function(context) {
                      return `${context.label}: ${context.parsed} problems`;
                    }
                  }
                }
              },
              cutout: "65%",
              rotation: -90,
              circumference: 180,
              responsive: true,
            }}
          />
        </div>
      </div>
      <div className="bg-gradient-to-br from-white to-[#F9F6EE] p-6 md:p-8 rounded-2xl shadow-lg border border-[#A9B782]/40">
        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center bg-gradient-to-r from-[#335441] to-[#46704A] bg-clip-text text-transparent">
          Top 10 Most Frequent Questions
        </h3>
        <div className="h-72 md:h-80">
          <Bar
            data={topProblemsData}
            options={{
              indexAxis: 'y', // Horizontal bar chart
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  titleColor: "#335441",
                  bodyColor: "#6B8F60",
                  borderColor: "#A9B782",
                  borderWidth: 1,
                  padding: 12,
                  borderRadius: 8,
                  callbacks: {
                    label: function(context) {
                      return `Frequency: ${context.parsed.x}%`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  max: Math.max(...topProblemsData.datasets[0].data) * 1.1, // Add 10% padding to the max value
                  ticks: {
                    color: "#6B8F60",
                    font: {
                      size: 10,
                    },
                  },
                  grid: {
                    color: "rgba(169, 183, 130, 0.2)",
                  },
                },
                y: {
                  ticks: {
                    color: "#6B8F60",
                    font: {
                      size: 10,
                    },
                  },
                  grid: {
                    display: false,
                  },
                },
              },
              responsive: true,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Charts
