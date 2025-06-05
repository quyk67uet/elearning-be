import { Clock, BarChart2, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDifficultyColor } from "@/utils/test-utils";

export default function TestInformation({ test }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Thông tin Bài kiểm tra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">Độ khó</div>
          <Badge
            className={`${getDifficultyColor(test.difficulty_level)} px-3 py-1`}
          >
            {test.difficulty_level || "Unknown"}
          </Badge>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Thời gian</div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">{test.time_limit_minutes} phút</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Số câu</div>
          <div className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">{test.question_count} câu</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Điểm tối thiểu</div>
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">{test.passing_score}/10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
