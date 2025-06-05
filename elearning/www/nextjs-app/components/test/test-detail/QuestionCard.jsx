"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  XCircle,
  Loader2,
} from "lucide-react";
import { AnswerInput } from "./AnswerInput";
import { parseLatex } from "@/lib/utils";
import { DrawingArea } from "./DrawingArea";
import { decodeHtmlEntities, formatFileSize } from "@/utils/test-utils";

export function QuestionCard({
  questionData, // Direct question object, replaces currentQuestionIndex & questions
  currentDisplayNumber, // e.g., 1, 2, 3...
  testQuestionId, // This is questionData.test_question_detail_id

  markedForReview = {}, // Object: { [testQuestionId]: true/false }
  completedQuestions = {}, // Object: { [testQuestionId]: true/false }

  onToggleMarkForReview, // (testQuestionId) => void
  onMarkComplete, // (testQuestionId, isComplete) => void

  // Answer state and handlers (handlers are pre-bound with testQuestionId from TestDetail)
  multipleChoiceAnswer, // string (selected option text or value)
  onMultipleChoiceChange, // (value, optionObject) => void
  shortAnswer, // string
  onShortAnswerChange, // (value) => void
  longAnswer, // string
  onLongAnswerChange, // (value) => void

  canvasState, // string (dataURL)
  setCanvasStates, // (newState) => void (pre-bound with testQuestionId)

  currentFiles = [], // Array of { base64Data, originalFilename, mimeType, size, lastModifiedTimeToken }
  onAddFiles, // (testQuestionDetailId, filesOrCapturedInfo) => Promise<void>
  onRemoveFile, // (testQuestionDetailId, originalFilenameToRemove) => void
  processingFiles = {}, // Object: { [processingKey]: true/error }
  blockDrawingAreaInteraction, // <-- Accept the new prop
}) {
  const [showHint, setShowHint] = useState(false);

  // testQuestionId is the definitive ID for the current question context
  const isMarkedForReview = !!markedForReview[testQuestionId];
  const isMarkedComplete = !!completedQuestions[testQuestionId];

  useEffect(() => {
    setShowHint(false); // Reset hint visibility when question changes
  }, [testQuestionId]);

  const questionContentForDisplay = useMemo(() => {
    if (!questionData) return null;

    let formattedOptions = [];
    if (
      questionData.question_type === "Multiple Choice" &&
      Array.isArray(questionData.options)
    ) {
      formattedOptions = questionData.options.map((opt, index) => ({
        // Ensure unique and stable IDs for options
        id: opt.id || `${testQuestionId}-option-${opt.option_text || index}`,
        text: opt.text || opt.option_text || `Option ${index + 1}`, // Ensure text is present
        label: opt.label || String.fromCharCode(65 + index),
      }));
    }

    return {
      id: testQuestionId, // Use the definitive testQuestionId
      type: questionData.question_type || "multiple_choice", // Default or fallback
      question: questionData.content || "Question content is missing.",
      imageUrl: questionData.image_url || questionData.image,
      options: formattedOptions,
      hint: questionData.hint || "",
      explanation: questionData.explanation || "", // Not currently used in render, but good to have
      points: questionData.point_value || questionData.marks || 0,
      // You might want to make color dynamic based on type or other factors
      color: "bg-indigo-500",
    };
  }, [questionData, testQuestionId]);

  const handleToggleReview = () => {
    if (testQuestionId && onToggleMarkForReview) {
      onToggleMarkForReview(testQuestionId); // onToggleMarkForReview expects the ID
    }
  };

  const handleToggleComplete = () => {
    if (testQuestionId && onMarkComplete) {
      onMarkComplete();
    }
  };

  const handleFileSelectionChange = (event) => {
    if (
      event.target.files &&
      event.target.files.length > 0 &&
      onAddFiles &&
      testQuestionId
    ) {
      onAddFiles(testQuestionId, event.target.files);
      event.target.value = null; // Reset file input
    }
  };

  const handleDrawingCapturedAsFile = useCallback(
    (capturedFileInfo) => {
      if (onAddFiles && testQuestionId && capturedFileInfo) {
        onAddFiles(testQuestionId, capturedFileInfo);
      } else {
        console.warn(
          "onAddFiles or testQuestionId or capturedFileInfo is missing in QuestionCard callback"
        );
      }
    },
    [onAddFiles, testQuestionId]
  );

  console.log(
    "Question Completed are:",
    Object.keys(completedQuestions).length
  );

  if (!questionData || !questionContentForDisplay) {
    return (
      <Card className="p-6 mb-6 border shadow-sm bg-white text-center">
        <p className="text-gray-500">Đang tải dữ liệu câu hỏi...</p>
      </Card>
    );
  }

  const showFileUploadSection =
    questionContentForDisplay.type === "Essay" ||
    questionContentForDisplay.type === "long_answer";

  console.log("Question content for display:", questionContentForDisplay);
  return (
    <Card
      key={testQuestionId} // Use testQuestionId for key
      className="p-4 sm:p-6 mb-6 relative overflow-hidden border shadow-sm bg-white"
    >
      <div
        className={`w-1.5 h-full ${questionContentForDisplay.color} absolute left-0 top-0 bottom-0 rounded-l-md`}
        aria-hidden="true"
      ></div>
      <div className="pl-4 sm:pl-6">
        {" "}
        {/* Ensure content is not under the color bar */}
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 pb-4 border-b">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-semibold whitespace-nowrap">
              Câu hỏi {currentDisplayNumber}
            </h2>
            <Badge
              variant="outline"
              className="font-normal capitalize text-xs sm:text-sm"
            >
              {questionContentForDisplay.type.replace(/_/g, " ")}
            </Badge>
            <Badge
              variant="secondary"
              className="font-normal text-xs sm:text-sm"
            >
              {questionContentForDisplay.points} Điểm
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end w-full sm:w-auto">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isMarkedForReview ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleReview}
                    className={`transition-colors ${
                      isMarkedForReview
                        ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-yellow-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-pressed={isMarkedForReview}
                  >
                    <AlertCircle
                      className={`h-4 w-4 mr-1 ${
                        isMarkedForReview ? "" : "text-yellow-600"
                      }`}
                    />
                    Xem lại
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Đánh dấu để xem lại sau</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isMarkedComplete ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleComplete} // Corrected: Does not need arguments
                    className={`transition-colors ${
                      isMarkedComplete
                        ? "bg-green-500 hover:bg-green-600 text-white border-green-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-pressed={isMarkedComplete}
                  >
                    <CheckCircle2
                      className={`h-4 w-4 mr-1 ${
                        isMarkedComplete ? "" : "text-green-600"
                      }`}
                    />
                    {isMarkedComplete ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isMarkedComplete
                      ? "Bỏ đánh dấu hoàn thành"
                      : "Đánh dấu câu này đã hoàn thành"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {questionContentForDisplay.hint && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHint(!showHint)}
                      className="text-gray-700 hover:bg-gray-50"
                      aria-pressed={showHint}
                    >
                      <Lightbulb className="h-4 w-4 mr-1 text-blue-600" /> Gợi ý
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showHint ? "Ẩn" : "Hiện"} gợi ý</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        {/* Question Content */}
        <div className="text-base md:text-lg mb-6 leading-relaxed">
          {parseLatex(questionContentForDisplay.question)}
        </div>
        {/* Hint Display */}
        {showHint && questionContentForDisplay.hint && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">Gợi ý</h3>
            </div>
            <div className="text-sm text-blue-700 prose prose-sm max-w-none">
              {parseLatex(questionContentForDisplay.hint)}
            </div>
          </div>
        )}
        {/* Image Display */}
        {questionContentForDisplay.imageUrl && (
          <div className="mb-6 flex justify-center">
            {/* Ensure your API endpoint for images is correct and handles auth if needed */}
            <img
              src={`/api/method/frappe.core.doctype.file.file.download_file?file_url=${encodeURIComponent(
                questionContentForDisplay.imageUrl
              )}`}
              alt={`Illustration for question ${currentDisplayNumber}`}
              className="max-h-64 w-auto rounded shadow border object-contain"
            />
          </div>
        )}
        {/* Answer Input Section */}
        <AnswerInput
          questionContent={questionContentForDisplay} // Contains type, options etc.
          multipleChoiceAnswer={multipleChoiceAnswer}
          shortAnswer={shortAnswer}
          longAnswer={longAnswer}
          // Handlers are now called without testQuestionId as they are pre-bound
          onMultipleChoiceChange={(optionValue, optionObject) => {
            // optionValue is option.text, optionObject is the full {id, text, label}
            if (onMultipleChoiceChange)
              onMultipleChoiceChange(optionValue, optionObject);
          }}
          onShortAnswerChange={(value) => {
            if (onShortAnswerChange) onShortAnswerChange(value);
          }}
          onLongAnswerChange={(value) => {
            if (onLongAnswerChange) onLongAnswerChange(value);
          }}
          parseLatex={parseLatex} // Pass the LaTeX parser
        />
        {/* File Upload and Drawing Area for Essay/Long Answer */}
        {showFileUploadSection && (
          <>
            <div className="mt-6 p-4 border border-dashed rounded-md bg-slate-50">
              <h3 className="text-md font-semibold mb-3 text-gray-700">
                Đính kèm hình ảnh bài làm
              </h3>
              <label
                htmlFor={`file-upload-${testQuestionId}`}
                className="block mb-3"
              >
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-sm"
                >
                  <span>
                    <Paperclip className="inline h-4 w-4 mr-2 text-blue-600" />
                    Thêm ảnh...
                  </span>
                </Button>
                <input
                  id={`file-upload-${testQuestionId}`} // Unique ID for label association
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/gif"
                  className="hidden"
                  onChange={handleFileSelectionChange}
                />
              </label>

              {currentFiles && currentFiles.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Các ảnh đã chọn:
                  </h4>
                  <ul className="space-y-2">
                    {currentFiles.map((fileInfo, index) => {
                      // Construct the processing key as done in useQuestionFiles
                      const processingKey = `${testQuestionId}-${
                        fileInfo.originalFilename
                      }-${
                        fileInfo.lastModifiedTimeToken || fileInfo.size || index
                      }`;
                      const processingState = processingFiles[processingKey];

                      return (
                        <li
                          key={processingKey} // Use a reliably unique key
                          className="flex items-center justify-between p-2 bg-white border rounded-md text-sm"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            {fileInfo.base64Data &&
                              fileInfo.mimeType?.startsWith("image/") && (
                                <img
                                  src={`data:${fileInfo.mimeType};base64,${fileInfo.base64Data}`}
                                  alt={fileInfo.originalFilename}
                                  className="h-10 w-10 object-cover rounded-sm border"
                                />
                              )}
                            <span
                              className="truncate text-gray-700"
                              title={fileInfo.originalFilename}
                            >
                              {fileInfo.originalFilename} (
                              {formatFileSize(fileInfo.size)})
                            </span>
                            {processingState === true && (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500 ml-2" />
                            )}
                            {/* You might want to show an error icon if processingState is an error object */}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onRemoveFile &&
                              onRemoveFile(
                                testQuestionId,
                                fileInfo.originalFilename
                              )
                            }
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                            aria-label={`Xóa ${fileInfo.originalFilename}`}
                            disabled={processingState === true}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {(!currentFiles || currentFiles.length === 0) && (
                <p className="text-xs text-gray-500 mt-1">
                  Chưa có ảnh nào được đính kèm.
                </p>
              )}
            </div>

            <DrawingArea
              currentQuestionId={testQuestionId} // Pass ID for context if needed inside DrawingArea
              canvasState={canvasState}
              setCanvasState={(newState) => {
                // setCanvasStates is pre-bound with ID
                if (setCanvasStates) setCanvasStates(newState);
              }}
              // markAsCompleted is not directly available as a prop.
              // If drawing something should mark it complete, TestDetail needs to handle that,
              // or this prop needs to be explicitly passed.
              // For now, assuming onMarkComplete handles completion.
              onCaptureDrawingAsFile={handleDrawingCapturedAsFile}
              isBlocked={blockDrawingAreaInteraction} // <-- Pass the prop down
            />
          </>
        )}
      </div>
    </Card>
  );
}
