"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import "katex/dist/katex.min.css"; // Make sure KaTeX CSS is imported if parseLatex uses it

export function AnswerInput({
  questionContent, // Contains { id (testQuestionId), type, options, ... }
  multipleChoiceAnswer, // string: ID of the selected MC option
  shortAnswer, // string
  longAnswer, // string
  onMultipleChoiceChange, // (value: string, optionObject: object) => void
  onShortAnswerChange, // (value: string) => void
  onLongAnswerChange, // (value: string) => void
  parseLatex, // (text: string) => JSX.Element or string
}) {
  // questionContent.id is the testQuestionId, used for unique IDs in HTML elements
  const localQuestionIdForDOM = questionContent?.id;

  if (!questionContent || !localQuestionIdForDOM) {
    return (
      <div className="p-4 text-gray-500">
        Answer input cannot be displayed (missing question content or ID).
      </div>
    );
  }

  switch (questionContent.type) {
    case "Multiple Choice":
    case "multiple_select": // Assuming this is a valid type string from your data
      const options = Array.isArray(questionContent.options)
        ? questionContent.options // Options are pre-formatted by QuestionCard: {id, text, label}
        : [];

      return (
        <div className="space-y-3 mt-6">
          <RadioGroup
            value={multipleChoiceAnswer || ""} // Expects the ID of the selected option
            onValueChange={(selectedValueId) => {
              // selectedValueId is the 'id' of the chosen option
              if (onMultipleChoiceChange) {
                const selectedOptionObject = options.find(
                  (opt) => opt.id === selectedValueId
                );

                if (selectedOptionObject) {
                  // Call with (value, optionObject) as expected by QuestionCard's prop
                  // The 'value' could be option.text or option.id, depending on what useTestAnswers hook needs.
                  // Based on previous refactor, QuestionCard expects (option.text, optionObject).
                  onMultipleChoiceChange(
                    selectedOptionObject.text,
                    selectedOptionObject
                  );
                } else {
                  console.warn(
                    `AnswerInput: Selected option with ID '${selectedValueId}' not found. Available options:`,
                    options
                  );
                  // Optionally, call with a fallback or just the ID if absolutely necessary,
                  // but this indicates a potential mismatch.
                  // onMultipleChoiceChange(selectedValueId, { id: selectedValueId, text: selectedValueId, label: '?' });
                }
              }
            }}
            aria-label={`Answer options for question ${localQuestionIdForDOM}`}
          >
            {options.map((option) => (
              <Label
                key={option.id}
                htmlFor={`option-${localQuestionIdForDOM}-${option.id}`} // Unique ID for label-input association
                className={`flex items-start p-3 sm:p-4 rounded-lg border transition-colors cursor-pointer ${
                  multipleChoiceAnswer === option.id // Check against option's unique ID
                    ? "bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400 dark:bg-indigo-900/30 dark:border-indigo-600"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                }`}
              >
                <RadioGroupItem
                  value={option.id} // Each radio item's value IS the option's unique ID
                  id={`option-${localQuestionIdForDOM}-${option.id}`}
                  className="border-gray-400 data-[state=checked]:border-indigo-600 data-[state=checked]:text-indigo-600 mt-0.5 mr-3 flex-shrink-0 dark:border-gray-500 dark:data-[state=checked]:border-indigo-500 dark:data-[state=checked]:text-indigo-500"
                  aria-label={`Option ${option.label || option.text}`}
                />
                <span className="flex-1 text-sm prose prose-sm max-w-none dark:prose-invert">
                  {option.label && (
                    <strong className="mr-1">{option.label}.</strong>
                  )}
                  {typeof parseLatex === "function"
                    ? parseLatex(option.text)
                    : option.text}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      );

    case "Self Write":
    case "short_answer":
      return (
        <div className="space-y-2 mt-6">
          <Label
            htmlFor={`short-answer-${localQuestionIdForDOM}`}
            className="block font-medium text-gray-700 dark:text-gray-300"
          >
            Your Answer
          </Label>
          <Input
            id={`short-answer-${localQuestionIdForDOM}`}
            placeholder="Type your answer here..."
            value={shortAnswer || ""}
            onChange={(e) => {
              if (onShortAnswerChange) {
                // Call with only the value, as questionId is pre-bound
                onShortAnswerChange(e.target.value);
              }
            }}
            className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Short answer input"
          />
        </div>
      );

    // case "Essay":
    // case "long_answer":
    //   return (
    //     <div className="space-y-2 mt-6">
    //       <Label
    //         htmlFor={`long-answer-${localQuestionIdForDOM}`}
    //         className="block font-medium text-gray-700 dark:text-gray-300"
    //       >
    //         Your Answer
    //       </Label>
    //       <Textarea
    //         id={`long-answer-${localQuestionIdForDOM}`}
    //         placeholder="Type your detailed answer here..."
    //         value={longAnswer || ""}
    //         onChange={(e) => {
    //           if (onLongAnswerChange) {
    //             // Call with only the value, as questionId is pre-bound
    //             onLongAnswerChange(e.target.value);
    //           }
    //         }}
    //         className="w-full min-h-[150px] sm:min-h-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    //         aria-label="Long answer input"
    //       />
    //     </div>
    //   );

    case "drawing":
      // Drawing is handled by the DrawingArea component directly within QuestionCard,
      // so AnswerInput doesn't need to render anything for it.
      return null;

    default:
      console.warn(
        "AnswerInput: Unhandled or externally managed question type:",
        questionContent.type
      );
      return (
        <div className="p-4 text-sm text-gray-400">
          Học sinh có thể tải lên bài làm hoặc viết trực tiếp vào bảng vẽ
        </div>
      );
  }
}
