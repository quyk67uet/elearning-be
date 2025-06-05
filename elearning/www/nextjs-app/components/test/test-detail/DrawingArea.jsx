// elearning/src/components/test/test-detail/DrawingArea.jsx
"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import {
  Pencil as TitleIcon,
  Camera,
  Eraser as ClearIcon,
  Info,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DrawingArea({
  currentQuestionId,
  onCaptureDrawingAsFile,
  isBlocked = true,
}) {
  const [editor, setEditor] = useState(null);

  const handleTldrawMount = useCallback(
    (editorInstance) => {
      setEditor(editorInstance);
      // console.log(
      //   `tldraw editor mounted for Q${currentQuestionId}. Persistence key: ${
      //     currentQuestionId ? `tldraw_ans_q_${currentQuestionId}` : "none"
      //   }`
      // );

      // ** IMPORTANT FOR PERSISTENCE **
      // The following lines would clear any drawing loaded by persistenceKey.
      // Comment them out or remove them to allow persisted drawings to show on load.
      /*
      if (editorInstance) {
        const allShapesOnPage = editorInstance.getCurrentPageShapes();
        if (allShapesOnPage.length > 0) {
          const shapeIdsToDelete = allShapesOnPage.map((shape) => shape.id);
          editorInstance.deleteShapes(shapeIdsToDelete);
        }
      }
      */
    },
    [] // Removed currentQuestionId as dependency, onMount should ideally run once per Tldraw instance.
    // tldraw will handle persistence based on the persistenceKey prop changing.
  );

  const handleCaptureCanvasAsFile = useCallback(async () => {
    if (isBlocked || !editor) {
      if (!editor) console.warn("tldraw editor not available for capture.");
      return;
    }
    if (!onCaptureDrawingAsFile) {
      console.warn("onCaptureDrawingAsFile prop is missing from DrawingArea.");
      return;
    }
    try {
      const allShapesOnPage = editor.getCurrentPageShapes();
      const shapeIdsToExport = allShapesOnPage.map((shape) => shape.id);

      if (shapeIdsToExport.length === 0) {
        alert("Bảng vẽ đang trống. Vui lòng vẽ gì đó trước khi ghi lại.");
        return;
      }

      const isEditorCurrentlyDark = editor?.instanceState?.isDarkMode ?? false;

      const exportResult = await editor.toImage(shapeIdsToExport, {
        format: "png",
        scale: 1,
        background: true,
        darkMode: isEditorCurrentlyDark,
      });

      if (!exportResult || !exportResult.blob) {
        console.error(
          "Failed to export image: editor.toImage did not return a blob.",
          exportResult
        );
        alert(
          "Không thể tạo ảnh từ bản vẽ (API không trả về dữ liệu blob). Vui lòng thử lại."
        );
        return;
      }

      const imageBlob = exportResult.blob;
      const reader = new FileReader();

      reader.onloadend = () => {
        const dataUrl = reader.result;
        if (
          typeof dataUrl !== "string" ||
          dataUrl === "data:," ||
          dataUrl.length < 100
        ) {
          console.error(
            "Failed to generate valid PNG data URL from blob.",
            dataUrl
          );
          alert(
            "Không thể tạo ảnh từ bản vẽ (dữ liệu trống hoặc lỗi khi đọc blob)."
          );
          return;
        }
        const base64Data = dataUrl.split(",")[1];
        const sizeInBytes = imageBlob.size;
        const capturedFileInfo = {
          base64Data: base64Data,
          originalFilename: `drawing_q-${currentQuestionId}_${Date.now()}.png`,
          mimeType: "image/png",
          size: sizeInBytes,
        };
        onCaptureDrawingAsFile(capturedFileInfo);
        alert(
          "Bản vẽ đã được ghi lại và sẽ được đính kèm vào bài làm của bạn."
        );
      };
      reader.onerror = (error) => {
        console.error("FileReader error converting blob to data URL:", error);
        alert("Lỗi khi xử lý dữ liệu ảnh. Vui lòng thử lại.");
      };
      reader.readAsDataURL(imageBlob);
    } catch (error) {
      console.error(
        "Lỗi trong quá trình chụp bản vẽ tldraw (sử dụng editor.toImage):",
        error
      );
      if (
        error instanceof TypeError &&
        error.message.toLowerCase().includes("is not a function")
      ) {
        alert(
          "Tính năng xuất ảnh này không được hỗ trợ hoặc editor chưa sẵn sàng. Vui lòng thử làm mới trang."
        );
      } else {
        alert(
          "Đã xảy ra lỗi không mong muốn trong quá trình xử lý bản vẽ. Vui lòng thử lại sau."
        );
      }
    }
  }, [editor, currentQuestionId, onCaptureDrawingAsFile, isBlocked]);

  const clearDrawing = () => {
    if (isBlocked || !editor) return;
    const allShapesOnPage = editor.getCurrentPageShapes();
    if (allShapesOnPage.length > 0) {
      editor.deleteShapes(allShapesOnPage.map((shape) => shape.id));
    }
    // After clearing, tldraw should automatically persist this new empty state
    // to localStorage if persistenceKey is active.
  };

  return (
    <div className="bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 rounded-lg mt-6 shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <TitleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-md">
            Bảng vẽ
          </h3>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isBlocked}
              aria-label="Hướng dẫn sử dụng bảng vẽ"
            >
              <Info className="h-4 w-4 text-blue-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="w-auto max-w-xs sm:max-w-sm text-sm p-4 shadow-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                Hướng dẫn nhanh:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-xs">
                <li>
                  Sử dụng các công cụ vẽ có sẵn trên thanh công cụ của bảng vẽ.
                </li>
                <li>
                  Nhấn{" "}
                  <kbd className="px-1.5 py-0.5 border bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    Ctrl
                  </kbd>{" "}
                  +{" "}
                  <kbd className="px-1.5 py-0.5 border bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    Z
                  </kbd>{" "}
                  (hoặc{" "}
                  <kbd className="px-1.5 py-0.5 border bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    Cmd
                  </kbd>{" "}
                  +{" "}
                  <kbd className="px-1.5 py-0.5 border bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    Z
                  </kbd>{" "}
                  trên Mac) để hoàn tác.
                </li>
                <li>
                  Sau khi hoàn thành, nhấn nút "Ghi lại bản vẽ" để lưu hình ảnh.
                </li>
                <li>
                  Nút "Xóa hết" sẽ xóa toàn bộ nội dung trên bảng vẽ hiện tại.
                </li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div
        className={`
          border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 
          relative overflow-hidden 
          h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]
          transition-opacity duration-200 ease-in-out
          ${isBlocked ? "opacity-50 pointer-events-none" : "opacity-100"}
        `}
      >
        <Tldraw
          onMount={handleTldrawMount}
          persistenceKey={
            currentQuestionId ? `tldraw_ans_q_${currentQuestionId}` : undefined
          }
          forceMobile={true}
        />
        <div
          style={{
            position: "absolute",

            bottom: "6px", // Example position, adjust as needed

            right: "6px", // Example position, adjust as needed

            width: "100px", // Example width, tldraw's watermark is approx this

            height: "40px", // Example height

            padding: "2px 4px",

            backgroundColor: "rgba(249, 250, 251, 255)",

            fontSize: "9px",

            color: "rgba(249, 250, 251, 255)",

            zIndex: 800, // Very high z-index to be on top of most tldraw UI elements

            pointerEvents: "none", // Prevents this div from capturing mouse events

            borderRadius: "3px",

            textAlign: "center",

            lineHeight: "normal", // Adjust if you set a fixed height
          }}
        ></div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center mt-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clearDrawing}
          disabled={!editor || isBlocked}
          className="w-full sm:w-auto dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <ClearIcon className="h-4 w-4 mr-1.5" /> Xóa hết
        </Button>
        {onCaptureDrawingAsFile && (
          <Button
            variant="default"
            size="sm"
            onClick={handleCaptureCanvasAsFile}
            disabled={!editor || isBlocked}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Camera className="h-4 w-4 mr-1.5" /> Ghi lại bản vẽ
          </Button>
        )}
      </div>
    </div>
  );
}
