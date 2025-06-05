import { useState, useCallback } from "react";
import { readFileAsBase64 } from "@/utils/test-utils";

export function useQuestionFiles(
  initialFilesData = {},
  questionsFromAttempt = [],
  onFilesChanged
) {
  const [currentSessionQuestionFiles, setCurrentSessionQuestionFiles] =
    useState(() => {
      if (
        initialFilesData &&
        typeof initialFilesData === "object" &&
        questionsFromAttempt.length > 0
      ) {
        try {
          const initialFiles = {};
          for (const tq_detail_id_backend in initialFilesData) {
            const answerData = initialFilesData[tq_detail_id_backend];
            const question = questionsFromAttempt.find(
              (q) => q.test_question_detail_id === tq_detail_id_backend
            );
            if (
              question &&
              (question.question_type === "Essay" ||
                question.question_type === "long_answer")
            ) {
              if (
                Array.isArray(answerData.base64_images) &&
                answerData.base64_images.length > 0
              ) {
                initialFiles[tq_detail_id_backend] =
                  answerData.base64_images.map((img) => ({
                    base64Data: img.data,
                    originalFilename: img.filename,
                    mimeType: img.mime_type,
                    size: img.data ? img.data.length * (3 / 4) : 0, // Approximate size
                  }));
              }
            }
          }
          return initialFiles;
        } catch (error) {
          console.error(
            "Error initializing files from saved data in hook:",
            error
          );
          return {};
        }
      }
      return {};
    });

  const [processingFiles, setProcessingFiles] = useState({}); // Tracks individual file processing status

  const handleAddFileOrDrawing = useCallback(
    async (testQuestionDetailId, filesOrCapturedInfo) => {
      if (!testQuestionDetailId) {
        console.warn(
          "handleAddFileOrDrawing: testQuestionDetailId is missing."
        );
        return;
      }

      onFilesChanged?.(); // Indicate that files have changed, triggering unsaved status

      let filesToProcessArray = [];
      let isCapture = false;

      if (filesOrCapturedInfo instanceof FileList) {
        filesToProcessArray = Array.from(filesOrCapturedInfo);
      } else if (
        typeof filesOrCapturedInfo === "object" &&
        filesOrCapturedInfo.base64Data
      ) {
        filesToProcessArray = [filesOrCapturedInfo];
        isCapture = true;
      } else {
        console.warn(
          "handleAddFileOrDrawing: Invalid input for filesOrCapturedInfo.",
          filesOrCapturedInfo
        );
        return;
      }

      if (filesToProcessArray.length === 0) return;

      const newFileInfosThisBatch = [];

      for (const fileInput of filesToProcessArray) {
        const originalFilename = fileInput.name || fileInput.originalFilename;
        const lastModifiedToken =
          fileInput.lastModified ||
          fileInput.lastModifiedTimeToken ||
          Date.now();
        const processingKey = `${testQuestionDetailId}-${originalFilename}-${lastModifiedToken}`;

        if (!isCapture) {
          const currentUIFilesForQuestion =
            currentSessionQuestionFiles[testQuestionDetailId] || [];
          if (
            currentUIFilesForQuestion.some(
              (uiFile) =>
                uiFile.originalFilename === originalFilename &&
                uiFile.size === fileInput.size
            )
          ) {
            console.log(
              `File ${originalFilename} đã tồn tại cho câu hỏi ${testQuestionDetailId}. Bỏ qua.`
            );
            continue;
          }
        }

        setProcessingFiles((prev) => ({ ...prev, [processingKey]: true }));

        try {
          let fileInfoWithBase64;
          if (isCapture) {
            fileInfoWithBase64 = fileInput;
          } else {
            fileInfoWithBase64 = await readFileAsBase64(fileInput);
          }
          newFileInfosThisBatch.push(fileInfoWithBase64);
        } catch (error) {
          console.error(
            `Lỗi khi đọc/xử lý file ${originalFilename} cho câu hỏi ${testQuestionDetailId}:`,
            error
          );
          setProcessingFiles((prev) => ({
            ...prev,
            [processingKey]: { error: error.message || "Lỗi không xác định" },
          }));
        } finally {
          // Only clear processing status if it wasn't an error, or handle error display elsewhere
          if (!processingFiles[processingKey]?.error) {
            // Check if error was NOT set for this key
            setProcessingFiles((prev) => {
              const newState = { ...prev };
              delete newState[processingKey];
              return newState;
            });
          }
        }
      }

      if (newFileInfosThisBatch.length > 0) {
        setCurrentSessionQuestionFiles((prevQF) => {
          const existingFiles = prevQF[testQuestionDetailId] || [];
          return {
            ...prevQF,
            [testQuestionDetailId]: [
              ...existingFiles,
              ...newFileInfosThisBatch,
            ],
          };
        });
      }
    },
    [currentSessionQuestionFiles, onFilesChanged, processingFiles] // Added processingFiles
  );

  const handleRemoveFileFromState = useCallback(
    (testQuestionDetailId, originalFilenameToRemove) => {
      if (!testQuestionDetailId || !originalFilenameToRemove) return;
      setCurrentSessionQuestionFiles((prevQF) => {
        const filesForQuestion = prevQF[testQuestionDetailId] || [];
        const updatedFiles = filesForQuestion.filter(
          (fileInfo) => fileInfo.originalFilename !== originalFilenameToRemove
        );

        const newState = { ...prevQF };
        if (updatedFiles.length === 0) {
          delete newState[testQuestionDetailId];
        } else {
          newState[testQuestionDetailId] = updatedFiles;
        }
        return newState;
      });
      onFilesChanged?.(); // Indicate that files have changed
    },
    [onFilesChanged]
  );

  const resetQuestionFiles = useCallback(() => {
    setCurrentSessionQuestionFiles({});
    setProcessingFiles({});
  }, []);

  return {
    currentSessionQuestionFiles,
    processingFiles,
    handleAddFileOrDrawing,
    handleRemoveFileFromState,
    setCurrentSessionQuestionFiles, // Expose if direct manipulation is needed for initialization
    resetQuestionFiles,
  };
}
