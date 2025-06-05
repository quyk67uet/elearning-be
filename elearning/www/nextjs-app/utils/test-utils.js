export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
    case "dễ":
      return "bg-green-100 text-green-800";
    case "medium":
    case "trung bình":
      return "bg-blue-100 text-blue-800";
    case "hard":
    case "khó":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Return button text based on test status
 */
export const getButtonText = (status) => {
  switch (status) {
    case "In Progress":
      return "Tiếp tục làm bài";
    case "Completed":
      return "Làm lại bài kiểm tra";
    default:
      return "Bắt đầu";
  }
};

export const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve({
        base64Data: base64String,
        originalFilename: file.name,
        mimeType: file.type,
        size: file.size,
        lastModifiedTimeToken: file.lastModified,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
