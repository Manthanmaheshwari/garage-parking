# ParkPulse - Multi-Tenant Enterprise Smart Parking Engine

ParkPulse is a high-performance, enterprise-grade multi-tenant smart garage management and dynamic tiered billing platform engineered with React (TypeScript), Tailwind CSS, Python FastAPI, SQLAlchemy ORM, and SQLite.

---

## 🔑 Default Evaluator Credentials (Copy-Paste Ready)

The database is pre-seeded with multi-tenant garage `AURIGA-01` ("Jaipur Central Hub") and ready for immediate evaluation.

### 1. Garage Owner / Admin Console Access
- **Portal**: [http://localhost:5173/](http://localhost:5173/) -> Click **"Garage Owner Console"**
- **Email**: `admin@auriga.com`
- **Password**: `admin123`
- **Garage Code**: `AURIGA-01`
- **Permissions**: Tariff Rule Configuration, Dynamic Spot Layout, EOD Financial Reports & AI Audits.

### 2. Attendant Operations Portal Access
- **Portal**: [http://localhost:5173/](http://localhost:5173/) -> Click **"Attendant Sign In / Register"**
- **Username**: `attendant_raj`
- **Password**: `pass123`
- **Garage Code**: `AURIGA-01`
- **Permissions**: Vehicle Check-In, Check-Out & Receipt Generation, AI Command Bar, Valet Hand-Off, Plate OCR.

---

## 🛠️ System Overview & Codespaces Quickstart

### Environment Prerequisites
- Python 3.10+
- Node.js 18+ & npm 9+
- SQLite3

### Quick Start Commands

```bash
# 1. Clone repository
git clone https://github.com/your-org/parkpulse.git
cd parkpulse

# 2. Install Python dependencies & initialize multi-tenant database
python -m pip install -r requirements.txt
python -m server.seed

# 3. Build React frontend bundle
cd client
npm install
npm run build
cd ..

# 4. Launch concurrent dev servers
npm run dev
```

### Live Application Ports
- **Frontend App (React + Vite)**: `http://localhost:5173/`
- **FastAPI Engine**: `http://localhost:8000/`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc API Specifications**: `http://localhost:8000/redoc`

---

## 📡 REST API Documentation

| HTTP Method | Endpoint URL | Headers | Request Body Schema | Response Sample |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/admin/login` | `Content-Type: application/json` | `{"email": "admin@auriga.com", "password": "admin123"}` | `{"access_token": "eyJ...", "role": "admin", "tenant_id": 1, "garage_code": "AURIGA-01"}` |
| `POST` | `/api/auth/admin/register` | `Content-Type: application/json` | `{"fullName": "Vikram Singh", "email": "v@auriga.com", "password": "pass", "garageName": "Hub", "garageCode": "AUR-02"}` | `{"access_token": "eyJ...", "role": "admin", "tenant_id": 2}` |
| `POST` | `/api/auth/attendant/login` | `Content-Type: application/json` | `{"username": "attendant_raj", "password": "pass123", "garageCode": "AURIGA-01"}` | `{"access_token": "eyJ...", "role": "attendant", "tenant_id": 1}` |
| `POST` | `/api/auth/attendant/register` | `Content-Type: application/json` | `{"fullName": "Raj", "badgeNumber": "ATT-101", "garageCode": "AURIGA-01", "username": "raj1", "password": "pass"}` | `{"access_token": "eyJ...", "role": "attendant", "tenant_id": 1}` |
| `GET` | `/api/parking/availability` | `Authorization: Bearer <token>` | None | `{"totalSpots": 20, "occupiedSpots": 6, "evAvailable": 3, "spots": [...]}` |
| `POST` | `/api/parking/check-in` | `Authorization: Bearer <token>` | `{"plateNumber": "MH-02-EV-1001", "vehicleType": "EV"}` | `{"id": "TCK-101", "spotCode": "EV-1", "status": "ACTIVE"}` |
| `POST` | `/api/parking/check-out` | `Authorization: Bearer <token>` | `{"identifier": "MH-02-EV-1001"}` | `{"id": "TCK-101", "totalFee": 110.0, "status": "COMPLETED"}` |
| `POST` | `/api/parking/valet-transfer` | `Authorization: Bearer <token>` | `{"ticketId": "TCK-ACT-100", "newPlateNumber": "RJ-14-CZ-9999"}` | `{"success": true, "newPlateNumber": "RJ-14-CZ-9999"}` |
| `GET` | `/api/parking/search` | `Authorization: Bearer <token>` | `Query: search, status_filter, skip, limit` | `[{"id": "TCK-101", "plateNumber": "MH-02-EV-1001", ...}]` |
| `POST` | `/api/ocr/extract-plate` | `Content-Type: multipart/form-data` | `file: UploadFile` | `{"success": true, "plateNumber": "RJ-14-CZ-1234", "confidence": 0.95}` |
| `POST` | `/api/admin/import-rates` | `Authorization: Bearer <token>` | `{"rawText": "### BASE=50 SUBSEQUENT=30 DAILY_CAP=250 ###"}` | `{"success": true, "extractedRates": {"firstHourRate": 50.0, ...}}` |
| `POST` | `/clock` | None | None | `{"processedSessionsCount": 5, "releasedSpots": ["EV-1"]}` |

---

## 🚀 Key Implementations & Value-Add Features

1. **Multi-Tenant SaaS Identity Architecture**: Dedicated `Admin`, `GarageTenant`, and `Attendant` schemas with compound indexing on `(tenant_id, is_occupied, type)` and `(tenant_id, plate_number)` guaranteeing zero data leakage across different garages.
2. **JWT Tenant-Scoping Middleware**: Automatic `get_current_tenant` dependency decoding bearer JWTs and binding spot allocations, check-ins, check-outs, and searches to the user's `tenant_id`.
3. **Strict EV Charger Isolation**: Algorithmic validation preventing non-EV combustion vehicles from occupying high-speed charging stalls.
4. **Pessimistic DB Transaction Locking**: `with_for_update()` row-level locks on spot selection to make double-parking structurally impossible.
5. **Valet Lifecycle Transfer**: `/api/parking/valet-transfer` allowing seamless hand-off of open parking sessions to replacement driver plates while preserving entry timestamp.
6. **Messy Rate Card Importer**: Regex parser in `/api/admin/import-rates` extracting clean hourly rates for EV, Compact, Standard, Base Rate, Subsequent Rate, and Daily Cap from unstructured text.
7. **AI OCR License Plate Scanner**: `/api/ocr/extract-plate` reading uploaded vehicle photos and extracting standard Indian registration marks (`RJ-14-CZ-1234`, `MH-02-AB-5678`, `KA-01-EV-9999`).
8. **Automated Nightly Cron Job**: `/clock` endpoint identifying sessions > 24 hours, computing capped fees, marking sessions completed, and releasing occupied stalls.

---

## 🔮 Future Scope & Architectural Roadmap

- **ALPR Hardware Gate Bridges**: Direct RTSP camera video stream decoding and automated boom gate relay triggers via MQTT.
- **Redis Distributed Lock Manager**: Replacing single-node SQLite row locks with Redlock algorithm across multi-garage deployments.
- **Kafka Audit Event Streaming**: Event-driven streaming for real-time compliance logging, fraudulent ticket detection, and financial auditing.
- **Dynamic Surge Pricing Algorithms**: Machine learning yield management automatically adjusting base rates based on real-time occupancy velocity and nearby event schedules.
