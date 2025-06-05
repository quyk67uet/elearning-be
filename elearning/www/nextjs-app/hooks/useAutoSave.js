import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { fetchWithAuth } from "@/pages/api/helper";

const AUTO_SAVE_INTERVAL_MS = 10000;

export function useAutoSave({
  testAttemptId,
  currentQuestionData, // contains testQuestionId
  questionsFromAttempt,
  currentSessionQuestionFiles,
  getAnswersForSubmission, // Function to get formatted answers
  countdown, // Remaining time
  savedStatus, // Current saved status from useTestAnswers ('idle', 'unsaved', 'saving', 'saved', 'error')
  setSavedStatus, // To update saved status
  isSubmitting, // To prevent saving during submission
}) {
  const [isSaving, setIsSaving] = useState(false);

  const debouncedSaveProgress = useDebouncedCallback(
    async (reason = "auto") => {
      if (
        !testAttemptId ||
        isSaving ||
        isSubmitting ||
        savedStatus === "saving"
      )
        return;

      const currentTestQuestionDetailId =
        currentQuestionData?.test_question_detail_id;
      if (!currentTestQuestionDetailId) {
        // Use the detail_id which seems to be the key
        console.warn(
          "AutoSave: Save progress skipped: No current test_question_detail_id."
        );
        return;
      }

      setIsSaving(true);
      setSavedStatus("saving");

      const currentAnswersForSave = getAnswersForSubmission(
        questionsFromAttempt,
        currentSessionQuestionFiles
      );

      const progressPayloadForBackend = {
        answers: currentAnswersForSave,
        remainingTimeSeconds: countdown,
        lastViewedTestQuestionId: currentQuestionData?.question_id, // Use question_id for backend reference
      };

      const payload = {
        attempt_id: testAttemptId,
        progress_data: JSON.stringify(progressPayloadForBackend),
      };
      console.log(`Saving progress (${reason}):`, payload);

      try {
        await fetchWithAuth(`test_attempt.test_attempt.save_attempt_progress`, {
          method: "PATCH",
          body: payload,
          // Removed Content-Type, fetchWithAuth handles it
        });
        setSavedStatus("saved");
      } catch (error) {
        console.error(`Error saving progress (${reason}):`, error);
        setSavedStatus("error");
      } finally {
        setIsSaving(false);
      }
    },
    1000 // Debounce time
  );

  // Auto-save on interval
  useEffect(() => {
    if (
      !testAttemptId ||
      !currentQuestionData?.test_question_detail_id ||
      questionsFromAttempt.length === 0 ||
      isSubmitting
    )
      return;
    const intervalId = setInterval(
      () => debouncedSaveProgress("interval"),
      AUTO_SAVE_INTERVAL_MS
    );
    return () => clearInterval(intervalId);
  }, [
    debouncedSaveProgress,
    testAttemptId,
    currentQuestionData,
    questionsFromAttempt,
    isSubmitting,
  ]);

  // Auto-save on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        testAttemptId &&
        questionsFromAttempt.length > 0 &&
        !isSubmitting
      ) {
        debouncedSaveProgress("visibility");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    debouncedSaveProgress,
    testAttemptId,
    questionsFromAttempt,
    isSubmitting,
  ]);

  return { isSaving, debouncedSaveProgress };
}
