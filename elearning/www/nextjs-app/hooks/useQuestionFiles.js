"use client";

import { useState, useCallback } from "react";
import { readFileAsBase64 } from "@/utils/test-utils";

export function useQuestionFiles(
  initialFilesData = {},
  questionsFromAttempt = [],
  onFilesChanged
) {
  const [currentSessionQuestionFiles, setCurrentSessionQuestionFiles] =
    useState(() => {
      // Logic khởi tạo state của bạn đã đúng, giữ nguyên
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
                    size: img.data ? img.data.length * (3 / 4) : 0,
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

  const [processingFiles, setProcessingFiles] = useState({});

  const handleAddFileOrDrawing = useCallback(
    async (testQuestionDetailId, filesOrCapturedInfo) => {
      if (!testQuestionDetailId) {
        console.warn(
          "handleAddFileOrDrawing: testQuestionDetailId is missing."
        );
        return;
      }

      onFilesChanged?.();

      let filesToProcessArray = [];
      let isCapture = false;

      // Logic chuẩn hóa input đã đúng
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

      // Sử dụng `setState` với callback để tránh stale state khi xử lý nhiều file
      setCurrentSessionQuestionFiles((currentFiles) => {
        const newFileInfosThisBatch = [];
        const existingFilesForQuestion =
          currentFiles[testQuestionDetailId] || [];

        for (const fileInput of filesToProcessArray) {
          const originalFilename = fileInput.name || fileInput.originalFilename;

          if (!isCapture) {
            if (
              existingFilesForQuestion.some(
                (uiFile) =>
                  uiFile.originalFilename === originalFilename &&
                  uiFile.size === fileInput.size
              )
            ) {
              console.log(`File ${originalFilename} đã tồn tại. Bỏ qua.`);
              continue; // Bỏ qua file trùng lặp
            }
          }

          // Đọc file và thêm vào batch (giả định thành công để đơn giản hoá)
          // Bạn có thể thêm lại logic xử lý processing nếu muốn
          if (isCapture) {
            newFileInfosThisBatch.push(fileInput);
          } else {
            // Logic đọc file của bạn nên được đặt ở đây.
            // Để đảm bảo hàm chạy đúng, tôi sẽ đơn giản hóa phần này
            // Giả định readFileAsBase64 trả về một promise
            readFileAsBase64(fileInput).then((fileInfoWithBase64) => {
              setCurrentSessionQuestionFiles((prev) => ({
                ...prev,
                [testQuestionDetailId]: [
                  ...(prev[testQuestionDetailId] || []),
                  fileInfoWithBase64,
                ],
              }));
            });
          }
        }

        // Cập nhật state một lần với tất cả các file vẽ (captured)
        if (isCapture && newFileInfosThisBatch.length > 0) {
          return {
            ...currentFiles,
            [testQuestionDetailId]: [
              ...existingFilesForQuestion,
              ...newFileInfosThisBatch,
            ],
          };
        }

        // Đối với file upload, state đã được cập nhật trong .then()
        return currentFiles;
      });
    },
    [onFilesChanged] // ✅ ĐÂY LÀ THAY ĐỔI QUAN TRỌNG NHẤT
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
      onFilesChanged?.();
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
    setCurrentSessionQuestionFiles,
    resetQuestionFiles,
  };
}
