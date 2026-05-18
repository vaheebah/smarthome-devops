# 🏠 SmartHome Dashboard — Complete Setup & Assignment Guide
**CSC418 DevOps for Cloud Computing — Terminal Exam**

---

## 📁 Project Structure

```
smarthome/
├── frontend/               # React app (IoT Dashboard UI)
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── DeviceCard.js
│   │   │   ├── StatsPanel.js
│   │   │   └── AddDeviceModal.js
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── server.js
│   │   ├── models/         # Mongoose models
│   │   └── routes/         # API routes
│   └── Dockerfile
├── selenium-tests/         # Selenium test suite
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml
│   ├── mongo-deployment.yaml
│   ├── backend-deployment.yaml
│   └── frontend-deployment.yaml
├── .github/workflows/
│   └── ci-cd.yml           # GitHub Actions pipeline
├── docker-compose.yml
└── mongo-init.js
```

---

## ✅ PART 1 — Run the Project Locally (Without Docker)

### Prerequisites
- Node.js 18+
- MongoDB installed locally OR MongoDB Atlas account

### Step 1: Start MongoDB
```bash
# Option A: Local MongoDB
mongod --dbpath /data/db

# Option B: Use MongoDB Atlas (cloud) — get your connection string
```

### Step 2: Start Backend
```bash
cd smarthome/backend
npm install
cp .env.example .env
# Edit .env: set MONGO_URI to your MongoDB connection string
npm run dev
# Backend runs at http://localhost:5000
# Test it: curl http://localhost:5000/api/health
```

### Step 3: Start Frontend
```bash
cd smarthome/frontend
npm install
# In package.json, the proxy is set to http://backend:5000
# For local dev, change "proxy" to "http://localhost:5000"
npm start
# Frontend runs at http://localhost:3000
```

### Step 4: Load Sample Data
- Open http://localhost:3000
- Click the **"⚡ Load Sample Data"** button (appears when no devices exist)
- You'll see 8 devices across 4 rooms appear on the dashboard

---

## ✅ SECTION A — CONTAINERIZATION (10 Marks)

### Task A1: Docker Images (Build individually)

```bash
cd smarthome

# Build backend image
docker build -t smarthome-backend ./backend
# Screenshot: docker images | grep smarthome

# Build frontend image
docker build -t smarthome-frontend ./frontend
# Screenshot: docker images | grep smarthome

# MongoDB uses official image (no custom Dockerfile needed — mention this in report)
docker pull mongo:6.0
```

### Task A2: Multi-Service Docker Compose

```bash
cd smarthome

# Start all 3 services
docker-compose up --build -d

# Check all containers running (TAKE SCREENSHOT)
docker-compose ps
docker ps

# Expected output: 3 containers running
# smarthome-frontend   Up   0.0.0.0:3000->80/tcp
# smarthome-backend    Up   0.0.0.0:5000->5000/tcp
# smarthome-mongo      Up   0.0.0.0:27017->27017/tcp

# Test the app
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000/api/health

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
# To also remove volumes: docker-compose down -v
```

### 📸 Screenshots needed for Section A:
1. `docker images` showing smarthome-frontend and smarthome-backend
2. `docker-compose ps` or `docker ps` showing all 3 containers running
3. Browser screenshot of http://localhost:3000 working

### 📁 Submit: Dockerfiles (both), docker-compose.yml

---

## ✅ SECTION B — CI/CD AUTOMATION (10 Marks)

### Setup GitHub Repository

```bash
cd smarthome
git init
git add .
git commit -m "Initial SmartHome DevOps project"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/smarthome-devops.git
git push -u origin main
```

### Configure GitHub Secrets

Go to: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:
| Secret Name         | Value                                   |
|---------------------|-----------------------------------------|
| `DOCKERHUB_USERNAME`| Your Docker Hub username                |
| `DOCKERHUB_TOKEN`   | Docker Hub access token (not password)  |
| `AZURE_CREDENTIALS` | JSON from `az ad sp create-for-rbac`    |
| `AKS_RESOURCE_GROUP`| Your Azure resource group name          |
| `AKS_CLUSTER_NAME`  | Your AKS cluster name                   |

### Get Docker Hub Token
1. Go to hub.docker.com → Account Settings → Security → New Access Token
2. Name it "github-actions", copy the token

### Task B1 & B2: The pipeline file is at `.github/workflows/ci-cd.yml`

Pipeline stages:
1. **Build** — installs deps, builds React app
2. **Test** — runs Jest backend tests against real MongoDB
3. **Docker** — builds & pushes images to Docker Hub
4. **Deploy** — deploys to AKS (runs only on `main` branch)

### Trigger the Pipeline

```bash
# Make a small change and push
echo "# SmartHome DevOps Project" >> README.md
git add .
git commit -m "Trigger CI/CD pipeline"
git push origin main

# Watch pipeline at: github.com/YOUR_USERNAME/REPO_NAME/actions
```

### 📸 Screenshots needed for Section B:
1. GitHub Actions page showing all 4 stages GREEN ✅
2. The pipeline YAML file open in your editor

### 📁 Submit: `.github/workflows/ci-cd.yml`

---

## ✅ SECTION C — KUBERNETES ON AZURE AKS (10 Marks)

### Prerequisites
- Azure account (free tier works)
- Azure CLI installed: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

### Step 1: Login to Azure

```bash
az login
```

### Step 2: Create Resource Group and AKS Cluster

```bash
# Create resource group
az group create --name smarthome-rg --location eastus

# Create AKS cluster (free tier - takes ~5 mins)
az aks create \
  --resource-group smarthome-rg \
  --name smarthome-aks \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group smarthome-rg --name smarthome-aks

# Verify connection (TAKE SCREENSHOT)
kubectl get nodes
```

### Step 3: Push Images to Docker Hub First

```bash
# Login to Docker Hub
docker login

# Tag and push backend
docker build -t YOUR_DOCKERHUB/smarthome-backend:latest ./backend
docker push YOUR_DOCKERHUB/smarthome-backend:latest

# Tag and push frontend
docker build -t YOUR_DOCKERHUB/smarthome-frontend:latest ./frontend
docker push YOUR_DOCKERHUB/smarthome-frontend:latest
```

### Step 4: Update K8s Manifests

Edit `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml`:
- Replace `DOCKERHUB_USERNAME` with your actual Docker Hub username
- Replace `IMAGE_TAG` with `latest`

```bash
# In k8s/backend-deployment.yaml, change:
# image: DOCKERHUB_USERNAME/smarthome-backend:IMAGE_TAG
# to:
# image: yourusername/smarthome-backend:latest

# Same for frontend-deployment.yaml
```

### Step 5: Deploy to AKS

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy MongoDB
kubectl apply -f k8s/mongo-deployment.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=available deployment/smarthome-mongo -n smarthome --timeout=120s

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Check all pods running (TAKE SCREENSHOT - Task C2)
kubectl get pods -n smarthome
kubectl get svc -n smarthome
```

### Step 6: Get Public IP

```bash
# Wait for LoadBalancer to get external IP (~2 mins)
kubectl get svc frontend -n smarthome --watch

# Once EXTERNAL-IP shows up (not <pending>)
# Your app is live at: http://EXTERNAL-IP
```

### 📸 Screenshots needed for Section C:
1. `kubectl get nodes` — cluster created
2. `kubectl get pods -n smarthome` — all pods in Running state
3. `kubectl get svc -n smarthome` — services with external IP
4. Browser showing the app live at the public IP

### Task C2 Verification Commands:
```bash
# All pods running
kubectl get pods -n smarthome

# Services created
kubectl get svc -n smarthome

# Check backend logs (frontend → backend connection)
kubectl logs deployment/smarthome-backend -n smarthome

# Check backend can reach MongoDB
kubectl exec -it deployment/smarthome-backend -n smarthome -- wget -q -O- http://localhost:5000/api/health
```

---

## ✅ SECTION D — SELENIUM AUTOMATED TESTING (5 Marks)

### Setup

```bash
cd smarthome/selenium-tests

# Install Python dependencies
pip install -r requirements.txt
# Or: pip install selenium webdriver-manager
```

### Run Tests

```bash
# Make sure the app is running at http://localhost:3000 first!
# (docker-compose up OR npm start in frontend)

python test_smarthome.py
```

### Test Cases in the Suite:
| # | Class | Test | What it checks |
|---|-------|------|----------------|
| TC1.1 | TestHomepage | test_homepage_loads | Page title contains 'SmartHome' |
| TC1.2 | TestHomepage | test_sidebar_visible | Sidebar element is displayed |
| TC1.3 | TestHomepage | test_logo_present | Logo text 'NEXUS' present |
| TC2.1 | TestNavigation | test_room_navigation | Nav items exist in sidebar |
| TC2.2 | TestNavigation | test_sidebar_toggle | Sidebar collapses on toggle |
| TC2.3 | TestNavigation | test_sidebar_toggle | Sidebar reopens on 2nd toggle |
| TC2.4 | TestNavigation | test_all_rooms_link_active | 'All' is active by default |
| TC3.1 | TestApiConnection | test_stats_panel_renders | 4 stat cards from API data |
| TC3.2 | TestApiConnection | test_seed_data_button | Seed button visible when empty |
| TC3.3 | TestApiConnection | test_add_device_modal | Modal opens on button click |
| TC3.4 | TestApiConnection | test_modal_closes | Modal closes on cancel |
| TC4.1 | TestDeviceInteraction | test_device_cards | Counts device cards |
| TC4.2 | TestDeviceInteraction | test_refresh_button | Refresh button clickable |

### To run with visible browser (remove `--headless`):
Edit `test_smarthome.py`, remove the line:
```python
options.add_argument("--headless")
```

### 📸 Screenshots needed for Section D:
1. Terminal showing all tests PASSED
2. (Optional) Chrome browser during visible test run

---

## ✅ SECTION E — Report and Submission (15 Marks)

### Checklist before zipping:

```
YOUR_REG_NO/
├── source-code/
│   ├── frontend/           (all source files)
│   ├── backend/            (all source files)
│   └── selenium-tests/
├── devops-files/
│   ├── docker-compose.yml
│   ├── frontend/Dockerfile
│   ├── backend/Dockerfile
│   ├── .github/workflows/ci-cd.yml
│   └── k8s/*.yaml
├── screenshots/
│   ├── section-a-docker-images.png
│   ├── section-a-containers-running.png
│   ├── section-a-app-browser.png
│   ├── section-b-pipeline-green.png
│   ├── section-c-kubectl-pods.png
│   ├── section-c-kubectl-svc.png
│   ├── section-c-app-live-public-ip.png
│   └── section-d-selenium-tests-passed.png
└── report.pdf              (or report.docx)
```

### Create the zip:
```bash
# Rename folder to your Reg No, e.g. FA23-BCS-001
cp -r smarthome FA23-BCS-001
zip -r FA23-BCS-001.zip FA23-BCS-001/
```

### Report should contain:
1. Project overview (IoT Smart Home Dashboard)
2. Architecture diagram (Frontend → Nginx → Backend API → MongoDB)
3. Screenshots for each section with brief explanation
4. CI/CD pipeline explanation
5. AKS deployment steps with public URL
6. Selenium test results

---

## 🔑 Quick Reference

| Service  | Local URL                         |
|----------|-----------------------------------|
| Frontend | http://localhost:3000             |
| Backend  | http://localhost:5000             |
| API Health | http://localhost:5000/api/health |
| Devices  | http://localhost:5000/api/devices |
| Rooms    | http://localhost:5000/api/rooms   |
| Readings | http://localhost:5000/api/readings/latest |

### Useful Docker commands:
```bash
docker-compose up --build -d     # Start all services
docker-compose ps                 # Check status
docker-compose logs -f backend    # Watch backend logs
docker-compose down               # Stop all
docker-compose down -v            # Stop + delete volumes
```

### Useful kubectl commands:
```bash
kubectl get pods -n smarthome
kubectl get svc -n smarthome
kubectl logs deployment/smarthome-backend -n smarthome
kubectl describe pod <pod-name> -n smarthome
kubectl delete pod <pod-name> -n smarthome   # Force restart
```
