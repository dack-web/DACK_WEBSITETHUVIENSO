# Library_App
ĐACK_CC&amp;MT
Mọi người clone code về nhớ npm install để tải cd từng folder backend và frontend riêng để npm install nha
FE-Để chạy thì npm start hoặc npm run dev
BE xài xampp start 2 cái đầu lên rồi vô terminal node server.js sẽ tự tạo bảng rồi dựa vào đó làm thôi chia sẵn và đã làm api AUTH rồi nha 
---------
Tâm:
đã xong backend 
Tìm kiếm theo tên
Lọc theo:
thể loại
tác giả
Sắp xếp (A-Z, mới nhất)
Gợi ý sách (related books)
Phân trang
---Chưa có frontend 
Test chức năng ---> thêm dữ liệu sách vào dtb -> test postman
http://localhost:8080/api/books/search?title=tên sách cần tìm
http://localhost:8080/api/books/search?category_id=16 (tìm bằng id)
http://localhost:8080/api/books/search?author_id=3 (tìm bằng id tác giả)
http://localhost:8080/api/books/search?title=tên sách &category_id=1 (tìm bằng tên + id thể loại)
http://localhost:8080/api/books/search?sort_by=az (sắp xếp A-Z)
http://localhost:8080/api/books/search?sort_by=oldest (sắp xếp cũ nhất)
http://localhost:8080/api/books/search?title= tên sách &author_id=4&sort_by=az (tìm tên sách + id tác giả)
http://localhost:8080/api/books/search?page=1&limit=5 (phân trang)
http://localhost:8080/api/books/16/related (gợi ý sách)