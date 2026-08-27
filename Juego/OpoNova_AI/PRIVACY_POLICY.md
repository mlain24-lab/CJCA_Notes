# Privacy Policy & Data Protection Compliance

Last updated: August 2026

### 1. Overview & Commitment to Privacy
OpoNova AI ("we", "our", or "us") is committed to protecting user privacy and ensuring compliance with the General Data Protection Regulation (**GDPR - Regulation (EU) 2016/679**) and applicable Spanish data protection laws (LOPD-GDD).

### 2. Data We Collect
To provide a secure and personalized service, we collect and process the minimum necessary data:
*   **Authentication Data:** Profile information obtained via Google OAuth 2.0 (name, email address, avatar) or registration credentials securely hashed using **Argon2id** (plaintext passwords are never stored or logged).
*   **Usage & Telemetry Data:** Interaction logs with study modules, test performance metrics, and caching states strictly required to enforce freemium quotas and optimize platform performance.

### 3. Data Security & Storage
*   **Encryption in Transit & Rest:** All communications are encrypted using TLS 1.3 protocols. Database records are encrypted at rest within secure PostgreSQL instances backed by `pgvector`.
*   **Session Management:** User authentication tokens are securely managed via cryptographically signed JWTs stored exclusively in **HttpOnly, Secure, and SameSite=Strict** cookies to mitigate Cross-Site Scripting (XSS) risks.

### 4. User Rights (GDPR Compliance)
Under GDPR, users hold the right to:
*   Access, rectify, or request the complete deletion of their personal data and account history at any time.
*   Withdraw consent for data processing by terminating their subscription and deleting their account directly from the platform settings.

### 5. Contact
For any privacy-related inquiries, data access requests, or security concerns, please contact the repository administrators via the official GitHub project page (`https://github.com/mlain24-lab/`).