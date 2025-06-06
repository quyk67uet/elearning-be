"use client";

import { Progress } from "@/components/ui/progress";

export function ProgressBarDisplay({
  currentQuestionDisplayNumber,
  totalQuestions,
  completedCount,
}) {
  const progressPercentage =
    totalQuestions > 0
      ? Math.round((completedCount / totalQuestions) * 100)
      : 0;

  return (
    <div className="mb-6">
      <Progress value={progressPercentage} className="h-2" />
      <div className="flex flex-col sm:flex-row justify-between mt-1.5 text-xs sm:text-sm text-gray-600 gap-1">
        {" "}
        <span>
          Câu hỏi {currentQuestionDisplayNumber} trên {totalQuestions} câu
        </span>
        <span>
          {completedCount} trên {totalQuestions} câu đã hoàn thành (
          {progressPercentage}%)
        </span>
      </div>
    </div>
  );
}
