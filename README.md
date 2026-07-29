# NOTE-WEB

> Hệ thống Full-stack (Go REST API + React) triển khai tự động qua CI/CD GitHub Actions, giám sát thời gian thực bằng Prometheus & Grafana, tích hợp cảnh báo Telegram.

---

## 1. Tổng Quan Kiến Trúc & Luồng Hoạt Động
```text
[ Client / Web Browser ] 
       │ (HTTPS / Port 443)
       ▼
 [ Nginx Reverse Proxy ] ───► Serves Static Files (/dist)
       │
       ├── /api/ ──────────► [ Go Backend REST API ] (Port 5000 - Internal)
       │                            │
       │                            └──► [ Database (Auth Enabled) ]
       └── /metrics & Grafana ──► [ Prometheus & Grafana Stack ]
                                    │
                                    └──► [ Alertmanager ] ──► [ Telegram Bot ]
```
## 2. Công Nghệ & Hạ Tầng
- Frontend: React.js (Build ra static files)
- Backend: Go (REST API với 5 CRUD endpoints & /api/health)
- Database: MongoDB / PostgreSQL (Lưu trữ bền vững, chỉ nghe 127.0.0.1)
- Reverse Proxy: Nginx (Cấu hình HTTPS Certbot, tự động redirect HTTP -> HTTPS)
- Process Manager: PM2 (Tự khởi động lại app khi crash hoặc reboot VPS)
- CI/CD: GitHub Actions (Unit Test -> Build -> Deploy via SSH/SCP -> Health Check -> Telegram Notification)
- Monitoring: Prometheus, Node Exporter, Grafana, Alertmanager

## 3. Cấu Trúc Thư Mục Dự ÁnPlaintext.
```text
├── .github/workflows/
│   ├── ci.yml              # CI Test & Build
│   └── deploy.yml          # Pipeline Deploy tự động hoá hoàn chỉnh
├── be/                     # Go Backend Source Code
│   ├── main.go             # Khởi tạo Server & Endpoints
│   └── main_test.go        # Unit test thật cho logic backend
├── frontend/               # React Frontend Source Code
├── prometheus/
│   ├── prometheus.yml      # Scrape configuration
│   └── alert.rules.yml     # Định nghĩa 3+ quy tắc cảnh báo
└── alertmanager/
    └── alertmanager.yml    # Cấu hình Telegram Webhook & templates
```

## 4. Hướng Dẫn Vận Hành & Khởi Động Hệ Thống
- Bước 1: Chạy Monitoring StackBash
    docker compose up -d
- Bước 2: Quản lý Process Backend với PM2Bash
```text
    #Kích hoạt startup cùng OS
    pm2 startup

    #ưu trạng thái PM2 (Bắt buộc sau mỗi thay đổi)
    pm2 save
```

## 5. Địa Chỉ Truy Cập Dịch Vụ
| Dịch Vụ | Địa Chỉ Truy Cập | Ghi Chú |
| :--- | :--- | :--- |
| **Website chính** | `https://note-web.yetsir.click/` | Chạy qua Nginx HTTPS |
| **Health Check API** | `https://note-web.yetsir.click/api/health` | Dùng cho CI/CD check |
| **Grafana Dashboard** | `https://note-web.yetsir.click/grafana` | Giám sát CPU/RAM/App |
| **Prometheus UI** | `http://127.0.0.1:9090` | Chỉ truy cập nội bộ |

## 6. Cấu Hình Cảnh Báo & Runbook Xử Lý (Actionable Runbook)
1️⃣ Rule AppDown (Mức độ: Critical)
- Điều kiện: Metric up == 0 kéo dài trong 0 phút.
- Nguyên nhân: Backend bị crash, PM2 ngưng hoạt động hoặc VPS sập.
- Runbook xử lý ngay:
```text
    #1. SSH vào VPS và kiểm tra trạng thái PM2
    pm2 status

    #2. Xem log sự cố gần nhất
    pm2 logs note-backend --lines 50

    #3. Khởi động lại ứng dụng
    pm2 restart note-backend
```

2️⃣ Rule HighCpuUsage (Mức độ: Warning)
- Điều kiện: CPU trung bình > 80% trong cửa sổ [2m] và duy trì for: 1m.
- Nguyên nhân: App bị lặp vô tận (infinite loop), bị DDoSS hoặc stress test,
- Runbook xử lý ngay:
```text
    #1. Kiểm tra tiến trình đang ngốn CPU
    top -b -n 1 | head -n 20

    #2. Nếu do stress test: Tắt tiến trình stress
    pkill stress

    #3. Kiểm tra log Nginx xem có bị tấn công traffic lớn hay không
    tail -f /var/log/nginx/access.log
```
3️⃣ Rule DiskSpaceLow (Mức độ: Warning)
- Điều kiện: Dung lượng ổ đĩa trống < 15% duy trì trong 5 phút.
- Nguyên nhân: Log PM2/Nginx quá lớn, Docker build cache tích tụ.
- Runbook xử lý ngay:
```text
    #1. Dọn dẹp log PM2
    pm2 flush

    #2. Dọn dẹp Docker images/cache thừa
    docker system prune -a -f
```

## 7. Sao Lưu & Khôi Phục Dữ Liệu (Backup & Restore DB)
Lệnh Backup Database tự động (Cron job):
```text
    # Dump dữ liệu ra file nén kèm ngày tháng
    mongodump --out=/var/backups/db_$(date +%Y%m%d_%H%M%S)
```
Lệnh Khôi Phục (Restore):
```text
    Bashmongorestore --dir=/var/backups/db_<FOLDER_NAME>/
```