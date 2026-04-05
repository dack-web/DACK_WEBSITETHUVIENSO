# 📚 WEBSITE THƯ VIỆN SỐ

Một dự án xây dựng hệ thống **Thư viện số** với đầy đủ chức năng quản lý người dùng, xác thực (AUTH), và nền tảng mở rộng cho các tính năng thư viện hiện đại.

---

## 🚀 Giới thiệu

Dự án được chia thành 2 phần riêng biệt:

* 🔹 **Frontend (FE)** – Giao diện người dùng
* 🔹 **Backend (BE)** – Xử lý logic, API, database

Hệ thống đã tích hợp sẵn:

* ✅ Xác thực người dùng (Authentication)
* ✅ Kết nối database
* ✅ Tự động tạo bảng khi chạy server

---

## 🛠️ Công nghệ sử dụng

* **Frontend:** (React / Vite / ... tùy bạn đang dùng)
* **Backend:** Node.js + Express
* **Database:** MySQL (chạy qua XAMPP)
* **Khác:** dotenv, nodemailer,...

---

## 📦 Cài đặt dự án

### 1. Clone project

```bash
git clone <your-repo-link>
```

---

### 2. Cài đặt dependencies

👉 Mỗi folder cài riêng:

#### 🔹 Backend

```bash
cd backend
npm install
```

#### 🔹 Frontend

```bash
cd frontend
npm install
```

---

## ⚙️ Cấu hình môi trường

Tạo file `.env` trong thư mục **backend** và cấu hình các biến cần thiết (DB, PORT, MAIL,...)

Ví dụ:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=thuvien
```

---

## ▶️ Chạy dự án

### 🔹 Bước 1: Khởi động database

* Mở XAMPP
* Start:

  * ✅ Apache
  * ✅ MySQL

---

### 🔹 Bước 2: Chạy Backend

```bash
cd backend
node server.js
```

👉 Server sẽ:

* Tự động tạo bảng database (nếu chưa có)
* Load API AUTH sẵn

---

### 🔹 Bước 3: Chạy Frontend

```bash
cd frontend
npm run dev
```

---

## 🔐 Authentication

Backend đã được tích hợp sẵn API AUTH:

* Đăng ký
* Đăng nhập
* Xác thực người dùng

👉 Có thể dùng trực tiếp để build tiếp các tính năng khác.

---

## 📁 Cấu trúc thư mục (tham khảo)

```
DACK_WEBSITETHUVIENSO/
│
├── backend/
│   ├── utils/
│   ├── routes/
│   ├── controllers/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   └── ...
```

---

## ⚠️ Lưu ý quan trọng

* ❗ Sau khi clone về **phải chạy `npm start` ở backend folder**
* ❗ Backend cần chạy XAMPP trước
* ❗ Nếu lỗi package → thử xoá `node_modules` và cài lại
* ❗ Khuyến nghị dùng Node.js LTS (18 hoặc 20)

---

## 🤝 Đóng góp

Mọi người có thể fork và phát triển thêm các tính năng như:

* 📖 Quản lý sách
* 🔍 Tìm kiếm nâng cao
* ❤️ Wishlist / yêu thích
* 📊 Dashboard quản trị

---

## 💡 Ghi chú

Project đã chia sẵn cấu trúc và API cơ bản, chỉ cần dựa vào đó để phát triển tiếp 🚀

---



---
