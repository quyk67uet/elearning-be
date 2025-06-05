"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function TestResultActions({
  onReviewAnswers,
  onRetakeTest,
  onNextTest,
}) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        className="bg-blue-50 hover:bg-blue-100 border-blue-100 text-gray-700 justify-between h-14 font-medium"
        onClick={onReviewAnswers}
      >
        Xem lại bài làm
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>

      <Button
        variant="outline"
        className="bg-amber-50 hover:bg-amber-100 border-amber-100 text-gray-700 justify-between h-14"
        onClick={onRetakeTest}
      >
        Làm lại bài kiểm tra
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>

      <Button
        variant="outline"
        className="bg-green-50 hover:bg-green-100 border-green-100 text-gray-700 justify-between h-14"
        onClick={onNextTest}
      >
        Bài tiếp theo
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
