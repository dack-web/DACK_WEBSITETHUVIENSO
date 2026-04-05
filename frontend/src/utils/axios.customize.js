import axios from "axios";

// Tạo instance axios
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// Request Interceptor: Thêm Access Token vào Header
instance.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (token && token !== "null" && token !== "undefined") {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
);

// Response Interceptor: Xử lý lỗi 401 (Hết hạn token)
instance.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error) {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa thử refresh lần nào
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log("🔄 Access token expired, attempting to refresh...");
                
                // Gọi API refresh token (sử dụng Refresh Token từ Cookie)
                const res = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                if (res.data && res.data.accessToken) {
                    const newToken = res.data.accessToken;
                    
                    // Lưu token mới vào storage (ưu tiên nơi đang lưu cũ)
                    if (localStorage.getItem("accessToken")) {
                        localStorage.setItem("accessToken", newToken);
                    } else {
                        sessionStorage.setItem("accessToken", newToken);
                    }

                    // Thêm token mới vào header của request cũ và thực hiện lại
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                console.error("❌ Refresh token failed:", refreshError);
                // Nếu refresh thất bại -> Logout người dùng
                localStorage.removeItem("accessToken");
                sessionStorage.removeItem("accessToken");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    },
);

export default instance;
