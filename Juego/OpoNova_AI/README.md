# OpoNova AI - Comprehensive Architecture, Security Hardening & Product Roadmap

## 1. System Overview & Value Proposition
OpoNova AI is a cost-effective, high-performance SaaS platform tailored for public service exam candidates (*oposiciones*) and tech professionals. Priced competitively at **€5.99/month**, it bridges the gap between generalist LLMs and specialized academic tools by combining real-time web scraping of exam questions, Retrieval-Augmented Generation (RAG) over legal frameworks, gamified study modules (Flashcards and "El Rosco"), and multi-stack software/game development capabilities (*vibe coding*).

---

## 2. Technology Stack & Infrastructure
The architecture is containerized using Docker Compose, optimized for low overhead, horizontal scalability, and low-latency deployments.

* **Frontend:** Next.js (TypeScript & Tailwind CSS) leveraging App Router for optimal SEO performance and integrated API routes.
* **Backend Core:** Python 3.11 with FastAPI for asynchronous execution, high-performance web scraping, and robust AI orchestration.
* **Database & Vector Storage:** PostgreSQL enhanced with the `pgvector` extension (`vector(1536)`) for semantic search and efficient vector embeddings of legal syllabi.
* **Caching & Rate Limiting:** Redis for fast session management, query result caching, and strict freemium usage quota enforcement.
* **Reverse Proxy & Security Edge:** Nginx/Caddy with automated TLS/SSL certificate provisioning and strict security headers (HSTS, CSP, X-Frame-Options).

---

## 3. Security, Hardening & Compliance
To ensure enterprise-grade protection from day zero, OpoNova AI implements a **Zero-Trust Defense-in-Depth** model:

* **Authentication & Cryptography:** 
    * Google OAuth 2.0 delegated authentication for seamless user onboarding.
    * Traditional credential registration secured via **Argon2id** password hashing with strict memory and CPU parameters to mitigate brute-force attacks.
* **Session Management:** Cryptographically signed JWTs stored exclusively in **HttpOnly, Secure, and SameSite=Strict** cookies to entirely prevent cross-site scripting (XSS) token theft.
* **Data Protection & GDPR Compliance:** End-to-end encryption for data in transit (TLS 1.3) and at rest (PostgreSQL storage encryption). Complete data isolation and user deletion protocols in compliance with Spanish and European data protection regulations (RGPD).
* **Input Sanitization & WAF:** FastAPI middleware implementing rigorous input filtering against Prompt Injection, SQL Injection, and Cross-Site Scripting (XSS).

---

## 4. Core Features & Functional Modules
* **Dynamic Exam Generator:** Automated ethical web scraping pipelines targeting recent official public exam convocations, indexed via RAG to deliver accurate, non-hallucinated multiple-choice tests with detailed explanations.
* **Gamified Study Engine:** 
    * *Flashcards:* Automated micro-learning card generation derived from uploaded syllabus PDFs.
    * *"El Rosco" (Pasapalabra):* Algorithmic A-to-Z definition generator matching legal terminology, administrative procedures, and technical concepts for active recall training.
* **Vibe Coding & Game Dev Suite:** Multi-file repository context ingestion (RAG) supporting stacks like Unity, Godot, Python, and Node.js, combined with an optional **Smart Model Routing** engine to switch between cost-effective base models and advanced reasoning models for heavy architectural tasks.

---

## 5. Monetization & Token Economy
* **Freemium Tier:** Free access restricted to daily query limits, lightweight models, and standard study templates to drive user acquisition.
* **Pro Subscription (€5.99/mo):** Unlimited access to standard AI queries, advanced test generators, "El Rosco" modes, and priority Redis-cached responses.
* **Power User Tier (Credit-Based Upsell):** Pay-per-use allocation for heavy frontier models required during complex game development and deep repository refactoring.

---

## 6. End-to-End Implementation Roadmap

| Phase | Milestone | Core Objectives & Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Core & Infrastructure | Docker Compose setup, PostgreSQL (`pgvector`) + Redis, Argon2id auth, and Google OAuth integration. | **Completed** |
| **Phase 2** | Syllabus Ingestion & RAG | Python PDF parsing pipeline, vector embedding storage, and Redis semantic caching layer. | **Completed** |
| **Phase 3** | Gamification & Study | Dynamic test generator, Flashcard engine, and interactive "El Rosco" frontend module. | In Progress |
| **Phase 4** | Monetization & Billing | Stripe API integration, webhook event handling, and Redis-based rate limiting per user tier. | Pending |
| **Phase 5** | Hardening & Production | TLS/SSL enforcement, WAF integration, automated backups, and VPS cloud deployment. | Pending |

---

## 7. Disaster Recovery & Backup Strategy (ASIR Standard)
To guarantee high availability and prevent data loss:
* **Automated Database Dumps:** Scheduled daily `pg_dump` backups compressed and encrypted, pushed to an off-site secondary storage instance following the **3-2-1 Backup Rule**.
* **Ephemeral Sandboxing:** User-generated code execution strictly isolated within resource-constrained, ephemeral Docker containers to prevent host compromise.

---

## 8. Directory Structure & File Architecture
```text
/projects/oponova-ai/
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── requirements.txt
│   └── services/
│       └── ingest.py
├── database/
│   └── init.sql
├── frontend/
│   ├── src/app/
│   └── src/components/
├── .env
├── OpoNovaAI.sh
├── CleanUP.sh
└── ingest-data.sh
```

---

## 9. Security Baseline & Environment Variables
The system utilizes isolated internal Docker networks and cryptographically secure environment variables generated via `openssl` and protected with strict file permissions (`chmod 600`).

```env
DB_PASSWORD=<high-entropy-random-string>
REDIS_PASSWORD=<high-entropy-random-string>
JWT_SECRET_KEY=<high-entropy-cryptographic-secret>
```

---

## 10. Backend API Endpoints & RAG Engine Implementation

### Health Check (`GET /health`)
Verifies active connection strings and network reachability across microservices:
```json
{
  "status": "secure_operational",
  "system": "OpoNova AI Oposiciones Engine",
  "database": "connected",
  "redis": "connected"
}
```

### Semantic Search & RAG Query (`POST /api/v1/query`)
Executes vector similarity search using `pgvector` cosine distance (`<=>`) operators over stored legal chunks (`Administrativo AGE` and `Biblioteconomía`):
- **Request Payload:**
  ```json
  {
    "question": "¿Cuáles son los derechos electrónicos de los ciudadanos?",
    "subject_category": "Administrativo"
  }
  ```
- **Verified Response Payload:**
  ```json
  {
    "query": "¿Cuáles son los derechos electrónicos de los ciudadanos?",
    "category": "Administrativo",
    "retrieved_context": [
      {
        "reference": "CE 1978 - Article 103",
        "content": "Public Administration serves the general interest with objectivity and acts in accordance with the principles of efficacy, hierarchy, decentralization, coordination, and deconcentration.",
        "score": 0.0049
      },
      {
        "reference": "Ley 39/2015 - Article 13",
        "content": "Rights of individuals in their relations with Public Administrations: to be assisted in the use of electronic means, to access public records and archives, and to data protection.",
        "score": -0.0132
      }
    ],
    "ai_response": "Based on official regulations for Administrativo, the relevant legal framework indicates that..."
  }
  ```