# Healthcare-Management-Application
A Healthcare application with multiple microservices managed by Docker and Kubernetics

## 🏥 Healthcare Management System (Microservices Architecture)

A full-stack Healthcare Management System built using microservices architecture, containerized with Docker and orchestrated using Kubernetes (Minikube). The platform supports Patients, Doctors, and Admins with secure role-based access and scalable service design.

# 🚀 Project Overview

This system simulates a real-world healthcare platform with independent services for authentication, patients, appointments, billing, analytics, and doctor management.

##✨ Key Features

JWT-based Authentication & Authorization
Role-based dashboards (Patient, Doctor, Admin)
Patient records with medical history
Appointment booking & management
Billing system with Pay Now feature
Real-time analytics dashboard (Recharts)
Doctor approval workflow (Admin-controlled)
Doctor discovery with maps (Leaflet + OpenStreetMap)
Separate MongoDB database per microservice
Docker + Kubernetes deployment ready

## 🏗️ Architecture

This project follows a Microservices Architecture where each service:

Runs independently
Has its own database
Communicates via REST APIs
System Layers
Layer	Component	Description
Frontend	React + Vite	UI served via Nginx
API Layer	Node.js Microservices	6 independent services
Database	MongoDB	One DB per service
Network	Docker / Kubernetes	Internal communication
Orchestration	Kubernetes (Minikube)	Scaling & management
🔄 Service Communication Flow
Services communicate internally via REST APIs
Auth Service validates JWT tokens for all requests
Analytics Service aggregates data from multiple services

Example:
When a patient books an appointment → Appointment Service → Auth Service (JWT verification)

## 🧩 Microservices
Service	Port	Responsibility
Auth Service	3001	Authentication & JWT
Patient Service	3002	Patient data & history
Appointment Service	3003	Booking & scheduling
Billing Service	3004	Payments & billing
Analytics Service	3005	Reports & statistics
Doctor Service	3006	Doctor profiles & approval
Frontend	80	React UI via Nginx


## 🔐 Authentication Flow
Password hashing using bcrypt
JWT-based stateless authentication
Token verified by Auth Service across all services

## 📡 API Endpoints (Summary)
Auth Service
POST /api/auth/register
POST /api/auth/login
GET /api/auth/verify

Patient Service
GET /api/patients/me
PUT /api/patients/me
Appointment Service
POST /api/appointments
GET /api/appointments/me

Billing Service
PUT /api/billing/:id (Pay Now)
Doctor Service
POST /api/doctors/register
PUT /api/doctors/approve/:id

## 🛠️ Tech Stack
Backend
Node.js (v22)
Express.js
MongoDB
Frontend
React + Vite
Recharts (Analytics)
Leaflet + OpenStreetMap (Maps)
DevOps
Docker
Docker Compose
Kubernetes (Minikube)
Nginx
Security
JWT Authentication
bcrypt password hashing

## 📁 Project Structure
```
healthcare-microservices/
│
├── auth-service/
├── patient-service/
├── appointment-service/
├── billing-service/
├── analytics-service/
├── doctor-service/
│
├── frontend/
│   ├── src/pages/
│   ├── src/components/
│   ├── src/context/
│
├── k8s/
├── docker-compose.yml
└── README.md

```

## ⚙️ Setup & Deployment
```
Option 1: Docker Compose (Development)
docker compose up --build
```
```
Open: http://localhost

Option 2: Kubernetes (Minikube)
minikube start
eval $(minikube docker-env)
```
```
# Build images
docker build -t auth-service ./auth-service
```
```
# Deploy
kubectl apply -f k8s/
```


Check status:
```
kubectl get pods
✅ Testing
Health Checks

All services return:
200 OK → Service Running

Features Verified
User registration & login
JWT authentication
Appointment booking
Doctor approval workflow
Billing & payments
Analytics dashboard
Kubernetes deployment

```

## 📊 Results
All services successfully containerized
Kubernetes deployment stable
Real-time analytics working
Role-based access functioning correctly

## ⚠️ Challenges & Solutions
Challenge	Solution
MongoDB large image	Waited for full pull (~877MB)
CrashLoopBackOff	Ensured DB readiness
Minikube networking	Used minikube service --url
JWT validation across services	Central Auth Service
React Leaflet issues	Fixed icon configuration

## 📚 Lessons Learned
Microservices improve scalability but increase complexity
Database per service ensures loose coupling
Kubernetes is essential for production systems
JWT works well for distributed authentication
Health checks are critical in container orchestration

## 🎯 Future Improvements
API Gateway (Kong / Nginx Gateway)
Service Mesh (Istio)
CI/CD pipeline (GitHub Actions)
Payment Gateway integration (Stripe/Razorpay)
Notification system (Email/SMS)
