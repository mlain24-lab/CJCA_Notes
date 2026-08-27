# OpoNova AI — Autonomous RAG & Oposiciones Study Hub

> Enterprise-grade, containerized microservices architecture designed for automated legal and academic Retrieval-Augmented Generation (RAG), dynamic exam generation, spaced repetition flashcards, interactive vocabulary challenges ("El Rosco"), and real-time weakness analytics.

---

## 🏗️ Architectural Overview

The platform is engineered as a secure, decoupled multi-container ecosystem orchestrated via Docker Compose, enforcing strict network boundaries between internal persistence layers and public-facing services.

    Client (TLS) -> HTTPS (443) -> Nginx Reverse Proxy (oponova_proxy)
                                       |---> /api/* ---> FastAPI Engine (oponova_backend)
                                       |---> /*      ---> Next.js App (oponova_frontend)
                                                             |
                                                       PostgreSQL 15 + pgvector (oponova_db)
                                                       Redis (oponova_redis)

---

## 📂 Repository Structure

    /projects/oponova-ai/
    ├── docker-compose.yml          # Multi-container orchestration stack
    ├── init.sql                    # Database DDL schema & baseline legal seeds (Spanish AGE & Library Science)
    ├── ingest-data.sh              # Automated RAG vector ingestion orchestrator
    ├── backend/
    │   ├── Dockerfile              # Python 3.11 slim hardened runtime with non-root execution
    │   ├── main.py                 # FastAPI application core, routing, and ASGI entrypoint
    │   ├── requirements.txt        # Python dependency manifest (psycopg2, uvicorn, fastapi, pydantic)
    │   └── services/               # Modular business logic (RAG, Exam Gen, Flashcards, Rosco, Analytics)
    ├── frontend/
    │   ├── Dockerfile              # Multi-stage Node.js build (Standalone output optimization)
    │   ├── package.json            # Frontend dependency manifest (React 18, Next.js 14, Tailwind CSS)
    │   └── app/                    # Next.js App Router (Layouts, pages, and UI components)
    └── nginx/
        └── default.conf            # Reverse proxy configuration with SSL/TLS termination & security headers

---

## 🚀 Deployment & Operations Guide

### 1. System Prerequisites & Environment Preparation
Ensure Docker Engine and Docker Compose v2 are installed on your host system (tested on Kali Linux Rolling / Debian Bookworm base):

    sudo apt update && sudo apt install -y curl apt-transport-https ca-certificates gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL [https://download.docker.com/linux/debian/gpg](https://download.docker.com/linux/debian/gpg) | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] [https://download.docker.com/linux/debian](https://download.docker.com/linux/debian) bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl enable --now docker
    sudo usermod -aG docker $USER

### 2. Stack Initialization
Clone or deploy the project files into `/projects/oponova-ai`, configure your environment secrets, and spin up the complete architecture:

    cd /projects/oponova-ai
    sudo docker compose up -d --build

### 3. Database Ingestion & Verification
To populate the vector store with official legal and academic syllabus chunks (e.g., *Ley 39/2015*, *Constitución Española 1978*, *MARC21*, *CDU*), execute the automated ingestion pipeline:

    sudo docker exec -it oponova_backend python services/ingest.py

---

## 🔌 API Endpoints Reference

| Endpoint | Method | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | *None* | System health check (validates PostgreSQL and Redis connectivity). |
| `/api/v1/query` | `POST` | `{"question": "...", "subject_category": "..."}` | Performs vector similarity search (RAG) using `pgvector` cosine distance (`<=>`). |
| `/api/v1/exam/generate` | `POST` | `{"subject_category": "...", "num_questions": int}` | Generates dynamic multiple-choice exams based on retrieved syllabus chunks. |
| `/api/v1/flashcards/generate` | `POST` | `{"subject_category": "...", "limit": int}` | Produces micro-learning flashcards optimized for spaced repetition. |
| `/api/v1/rosco/generate` | `POST` | `{"subject_category": "..."}` | Generates an alphabetical challenge ("El Rosco") mapped to legal definitions. |
| `/api/v1/analytics/heatmap` | `POST` | `{"user_id": int, "subject_category": "..."}` | Computes student weakness heatmaps and risk retention analytics. |

---

## 🔒 Security & Hardening Measures

- **Non-Root Execution:** Backend Python processes run under a restricted unprivileged system user (`appuser`).
- **Network Isolation:** Internal persistence services (`db`, `redis`, `backend`) operate within a private internal bridge network (`oponova-internal`), shielding them from direct external exposure.
- **Edge Security:** Inbound traffic is strictly mediated via an Nginx reverse proxy enforcing TLS encryption and secure HTTP response headers.