"use client";

import { useState, useEffect } from "react";

export default function TestResultSummary({ score = 0 }) {
  const [mounted, setMounted] = useState(false);

  // Ensures animation only happens client-side after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure score is within 0-100 range for calculation
  const validScore = Math.max(0, Math.min(100, score || 0));

  // Calculate the circle's stroke-dasharray and stroke-dashoffset
  const radius = 75; // Slightly smaller radius
  const circumference = 2 * Math.PI * radius;
  // Calculate offset based on the valid score percentage
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-4">
      {" "}
      {/* Added space-y */}
      {/* Circular Progress */}
      <div className="relative w-44 h-44">
        {" "}
        {/* Adjusted size */}
        <svg className="w-full h-full" viewBox="0 0 170 170">
          {" "}
          {/* Adjusted viewbox */}
          {/* Background circle */}
          <circle
            cx="85" // Adjusted center
            cy="85" // Adjusted center
            r={radius}
            fill="none"
            stroke="#e5e7eb" // Lighter gray background
            strokeWidth="14" // Slightly thinner stroke
          />
          {/* Progress circle - only render strokeDashoffset if mounted */}
          <circle
            cx="85" // Adjusted center
            cy="85" // Adjusted center
            r={radius}
            fill="none"
            // Dynamic color based on score? Example:
            stroke={
              validScore >= 80
                ? "#10b981"
                : validScore >= 50
                ? "#f59e0b"
                : "#ef4444"
            } // Green, Amber, Red
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? strokeDashoffset : circumference} // Animate from 0
            strokeLinecap="round"
            transform="rotate(-90 85 85)" // Adjusted rotation center
            style={{ transition: "stroke-dashoffset 1s ease-out" }} // Smoother transition
          />
          {/* Center text */}
          <text
            x="85" // Adjusted center
            y="85" // Adjusted center
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-3xl font-bold"
            fill="#111827" // Darker text
          >
            {/* Display score percentage */}
            {validScore.toFixed(0)}% {/* Show integer percentage */}
          </text>
        </svg>
      </div>
    </div>
  );
}
