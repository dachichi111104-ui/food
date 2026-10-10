import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Tải file ảnh lên Firebase Storage với tiến trình (progress)
 * @param {File} file - File ảnh chọn từ máy tính
 * @param {string} folderName - Tên thư mục lưu trên Firebase (VD: "products", "shops", "avatars")
 * @param {function} onProgress - Callback nhận % tiến trình upload (0 - 100)
 * @returns {Promise<string>} Trả về đường dẫn URL công khai để lưu vào MongoDB
 */
export const uploadImageToFirebase = (file, folderName = "products", onProgress = null) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("Chưa chọn file ảnh"));
    }

    // Tạo tên file ngẫu nhiên để tránh trùng lặp
    const uniqueFileName = `${folderName}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const storageRef = ref(storage, uniqueFileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        console.error("Lỗi upload Firebase Storage:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};
