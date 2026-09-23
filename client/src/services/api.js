import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Tự động gắn token vào mọi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động logout nếu token hết hạn/không hợp lệ (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Không redirect cứng ở đây để tránh vòng lặp, AuthContext sẽ xử lý qua state
    }
    return Promise.reject(error);
  }
);

export default api;