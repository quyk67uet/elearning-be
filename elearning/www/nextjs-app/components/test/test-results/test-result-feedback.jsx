"use client";

import { CheckCircle, ThumbsUp } from "lucide-react";

/**
 * Displays feedback with support for **bold** and *italic* formatting.
 *
 * @param {object} props - Component props.
 * @param {string} [props.title="Feedback Overall"] - The title for the feedback section.
 * @param {string} [props.feedback=""] - Feedback text (may contain **bold** or *italic*).
 * @param {'checkCircle' | 'thumbsUp'} [props.icon='checkCircle'] - Which icon to display next to the title.
 */
function renderFormattedFeedback(text) {
  if (!text) return null;
  // Replace **bold** and *italic* with <strong> and <em>
  // Handles both * and _ for italic, and ** or __ for bold
  let formatted = text
    .replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>")
    .replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");
  // Replace newlines with <br />
  formatted = formatted.replace(/\n/g, "<br />");
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}

export default function TestResultFeedback({
  title = "Nhận xét tổng thể",
  feedback = "",
  icon = "checkCircle",
}) {
  const IconComponent = icon === "checkCircle" ? CheckCircle : ThumbsUp;
  const iconColor =
    icon === "checkCircle" ? "text-orange-500" : "text-blue-500";

  const feedbackText = typeof feedback === "string" ? feedback.trim() : "";

  return (
    <div>
      <div className="flex items-center mb-4">
        <IconComponent className={`h-5 w-5 ${iconColor} mr-2 shrink-0`} />
        <h3 className="text-lg font-sora font-medium">{title}</h3>
      </div>

      {feedbackText ? (
        <p className="text-sm pl-1">{renderFormattedFeedback(feedbackText)}</p>
      ) : (
        <p className="text-sm text-gray-500 pl-7">
          No {title.toLowerCase()} available.
        </p>
      )}
    </div>
  );
}
