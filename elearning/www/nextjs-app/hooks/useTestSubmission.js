import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { fetchWithAuth } from "@/pages/api/helper";

export function useTestSubmission({
  testId,
  testAttemptId,
  questionsFromAttempt,
  currentSessionQuestionFiles,
  getAnswersForSubmission,
  countdown,
  currentQuestionData, // For lastViewedTestQuestionId
  completedQuestions,
  totalQuestions,
  savedStatus, // from useTestAnswers
  setSavedStatus, // from useTestAnswers
  isSaving, // from useAutoSave
  debouncedSaveProgress, // from useAutoSave
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirmDialog, setShowSubmitConfirmDialog] = useState(false);
  const [submitConfirmMessage, setSubmitConfirmMessage] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState("Thông báo lỗi");
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const executeSubmit = useCallback(async () => {
    setShowSubmitConfirmDialog(false);
    if (!testAttemptId) {
      console.error("ExecuteSubmit: testAttemptId is missing");
      setErrorDialogTitle("Lỗi nộp bài");
      setErrorDialogMessage("Không tìm thấy mã bài làm để nộp.");
      setShowErrorDialog(true);
      return;
    }
    setSavedStatus("saving"); // Visually indicate activity
    setIsSubmitting(true);

    const answersDataForSubmit = getAnswersForSubmission(
      questionsFromAttempt,
      currentSessionQuestionFiles
    );

    const submissionPayload = {
      attempt_id: testAttemptId,
      submission_data: JSON.stringify({
        answers: answersDataForSubmit,
        timeLeft: countdown,
        lastViewedTestQuestionId: currentQuestionData?.question_id, // Using question_id as per save logic
      }),
    };
    console.log("SUBMIT: Final JSON Payload to be sent:", submissionPayload);

    try {
      const result = await fetchWithAuth(
        `test_attempt.test_attempt.submit_test_attempt`,
        {
          method: "POST",
          // 1. Thêm header để chỉ định đây là request JSON
          headers: {
            "Content-Type": "application/json",
          },
          // 2. Chuyển đổi toàn bộ payload thành một chuỗi JSON
          body: JSON.stringify(submissionPayload),
        }
      );
      const resultData = result?.message || result;
      const finalAttemptId = resultData?.attemptId || testAttemptId;
      router.push(`/test/${testId}/test-result/${finalAttemptId}`);
    } catch (error) {
      console.error("Error submitting test:", error);
      setErrorDialogTitle("Lỗi nộp bài");
      setErrorDialogMessage(
        `Lỗi khi nộp bài: ${error.message || "Đã xảy ra lỗi không xác định."}`
      );
      setShowErrorDialog(true);
      setSavedStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    testAttemptId,
    setSavedStatus,
    getAnswersForSubmission,
    questionsFromAttempt,
    currentSessionQuestionFiles,
    countdown,
    currentQuestionData,
    fetchWithAuth, // Assuming fetchWithAuth is stable
    router,
    testId,
  ]);

  const handleSubmitTest = useCallback(async () => {
    if (!testAttemptId || isSubmitting) return;

    if (savedStatus === "unsaved" || savedStatus === "error") {
      console.log("Attempting a final save before submitting test...");
      debouncedSaveProgress("pre-submit");

      let waitAttempts = 0;
      const maxWaitAttempts = 15; // ~3 seconds
      while (
        (isSaving || savedStatus === "saving") && // check isSaving from useAutoSave
        waitAttempts < maxWaitAttempts
      ) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        waitAttempts++;
      }
    }

    const completedCount =
      Object.values(completedQuestions).filter(Boolean).length;
    const unansweredCount = totalQuestions - completedCount;
    const confirmMsg =
      unansweredCount > 0
        ? `Bạn còn ${unansweredCount} câu chưa được đánh dấu hoàn thành. Bạn có chắc chắn muốn nộp bài?`
        : "Bạn có chắc chắn muốn nộp bài? Bạn không thể thay đổi sau khi nộp.";

    setSubmitConfirmMessage(confirmMsg);
    setShowSubmitConfirmDialog(true);
  }, [
    testAttemptId,
    isSubmitting,
    savedStatus,
    debouncedSaveProgress,
    isSaving,
    completedQuestions,
    totalQuestions,
  ]);

  const closeErrorDialog = () => setShowErrorDialog(false);
  const cancelSubmitDialog = () => {
    setShowSubmitConfirmDialog(false);
    // If you need to reset submitting state here, do it.
    // setIsSubmitting(false); // Only if submission process was prematurely indicated as started
  };

  return {
    isSubmitting,
    showSubmitConfirmDialog,
    submitConfirmMessage,
    showErrorDialog,
    errorDialogTitle,
    errorDialogMessage,
    handleSubmitTest,
    executeSubmit,
    closeErrorDialog,
    cancelSubmitDialog,
    setShowSubmitConfirmDialog, // Expose for direct control from AlertDialog's onOpenChange
    setShowErrorDialog, // Expose for direct control
  };
}
