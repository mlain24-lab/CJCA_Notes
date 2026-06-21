# 09_Intro_to_Web_Applications
# Web Applications: Architecture & Attack Surface

## 1. Introduction & Architecture
Web applications operate on a **client-server architecture**, functioning dynamically within web browsers. 
* **Client-Side (Front-End):** The user interface (UI) executing in the browser (HTML, CSS, JavaScript).
* **Server-Side (Back-End):** The core source code, business logic, and databases hosted on back-end servers.

This decentralized execution allows organizations to deploy powerful, globally accessible applications with real-time control over functionality and design (e.g., Google Workspace, AWS Management Console).

## 2. Web Applications vs. Static Websites
The transition from Web 1.0 to Web 2.0 marked the shift from static delivery to dynamic interaction.
* **Traditional Websites (Web 1.0):** Static content requiring manual hardcoding to update. No real-time backend processing or dynamic user interactions.
* **Web Applications (Web 2.0):** Fully functional, modular applications generating dynamic content based on user input. They are responsive, scalable, and execute without client-side hardware optimization requirements.

## 3. Web Apps vs. Native OS Applications
### Web Applications
* **Pros:** Platform-independent, zero local storage consumption, and **version unity** (centralized patching ensures all users run the same updated version simultaneously).
* **Cons:** Slower execution compared to native apps; restricted by browser capabilities.

### Native OS Applications
* **Pros:** Faster execution, deep OS integration, and direct hardware/local library utilization.
* **Cons:** High maintenance overhead (requires different builds for Windows, macOS, Linux) and decentralized patching.

> **Note:** Modern environments increasingly utilize Hybrid and Progressive Web Applications (PWAs), leveraging modern frameworks to bridge the gap between web portability and native OS performance.

## 4. Distribution Models
Organizations deploy web applications based on specific infrastructure needs:
* **Open-Source (Customizable):** WordPress, Joomla, OpenCart.
* **Closed-Source/Proprietary (SaaS/Subscription):** Shopify, Wix, DotNetNuke.

## 5. Security Risks & Penetration Testing Methodology
Web applications present a massive, globally exposed attack surface. The complexity of modern app stacks increases the likelihood of critical vulnerabilities being deployed into production. A successful breach can result in severe business interruptions and lateral movement into sensitive corporate databases.

### Testing Methodology (OWASP WSTG)
Security assessments must cover both unauthenticated and authenticated perspectives to maximize coverage:
1. **Front-End Triage:** Inspecting HTML, CSS, and JS for client-side vulnerabilities like Cross-Site Scripting (XSS) and Sensitive Data Exposure.
2. **Back-End & Core Logic:** Analyzing browser-to-server HTTP interactions, enumerating backend technologies, and probing for logic flaws and injection points.

## 6. Common Attack Vectors & Real-World Impact
Web apps rarely present immediate, unauthenticated Remote Code Execution (RCE) out of the box. Exploitation typically involves chaining multiple vulnerabilities.

| Vulnerability | Real-World Attack Scenario | Impact |
| :--- | :--- | :--- |
| **SQL Injection (SQLi)** | Extracting usernames/emails from an Active Directory-backed web app to perform **Password Spraying** attacks against corporate portals (VPN, O365). | Unauthorized data access, network foothold, or potential RCE. |
| **File Inclusion (LFI/RFI)** | Reading backend source code to uncover hidden directories, exposing administrative endpoints. | Source code disclosure, potential RCE. |
| **Unrestricted File Upload** | Bypassing client-side filters on a profile picture upload form to upload a reverse shell payload (`.php`, `.aspx`). | Total web server compromise. |
| **Insecure Direct Object Reference (IDOR)** | Tampering with URI parameters (e.g., changing `/user/701/edit` to `/user/702/edit`) combined with broken access control. | Unauthorized access to other users' sensitive data or functionality. |
| **Broken Access Control** | Manipulating POST request parameters during account registration (e.g., intercepting the request and changing `roleid=3` to `roleid=1`). | Privilege escalation, granting rogue administrative access. |

# Web Application Layout & Architecture

## 1. Executive Overview
Web applications are highly diverse in design, programmatic structure, and backend infrastructure. From a SysAdmin and Pentester perspective, understanding the underlying layout is critical for identifying potential attack vectors and ensuring robust deployment.

The web application layout is divided into three core domains:
* **Infrastructure:** The physical or virtual topology required for the application to function (e.g., web servers, database servers).
* **Components:** The individual elements the application interacts with across the UI/UX, Client, and Server boundaries.
* **Architecture:** The logical relationships, communication flows, and dependencies between the various components.

---

## 2. Infrastructure Deployment Models
Web applications rely on various infrastructure setups, commonly referred to as deployment models. The architecture chosen directly impacts scalability, redundancy, and security.

### 2.1. Client-Server Model
The foundational model where a backend server hosts the application and distributes it to accessing clients (browsers).
* **Workflow:** The client accesses the URL -> The browser sends an HTTP request -> The server processes the request (e.g., authentication, database queries) -> The server returns the response to the client for rendering.
* **Execution:** Frontend components are executed client-side (interpreted by the browser), while backend components are compiled/interpreted server-side.

### 2.2. Single Server Architecture
All components (web application, background services, and the database) are hosted on a single machine.
* **Pros:** Straightforward deployment and low maintenance overhead.
* **Cons (Security & Reliability):** Represents a single point of failure (SPOF). This is an "all eggs in one basket" scenario; if the server is compromised or experiences downtime, all hosted applications and data are exposed or rendered inaccessible.

### 2.3. Many Servers - One Database
A segmented model where the database resides on a dedicated server, accessed by one or multiple web servers.
* **Use Case:** Load balancing, primary/backup replication, or shared datasets across multiple related applications.
* **Security Advantage:** Implements **Asset Segmentation**. If a web server is compromised, the attacker does not automatically gain operating system-level access to the database. Similarly, a SQL Injection (SQLi) vulnerability does not immediately compromise the web server's OS. Strict access controls (Least Privilege) are still mandatory.

### 2.4. Many Servers - Many Databases
A highly distributed model where each web application relies on its own dedicated database, often hosted on separate database servers.
* **Use Case:** High Availability (HA) and enterprise redundancy. Often relies on load balancers and automated failover mechanisms.
* **Security Advantage:** Optimal access control and data isolation. An isolated breach is contained within that specific application's environment.

---

## 3. Core Web Application Components
Regardless of the infrastructure model, modern web applications can be broken down into the following core elements:
* **Client** (Web Browser / Mobile App)
* **Web Server** (e.g., Nginx, Apache, IIS)
* **Application Logic** (The backend code processing requests)
* **Database** (e.g., MySQL, PostgreSQL, MongoDB)
* **Services / Microservices**
* **3rd Party Integrations** (APIs)
* **Serverless Functions**

---

## 4. Three-Tier Architecture
Web application components are logically separated into three distinct layers to maintain a clean separation of concerns:

| Layer | Description |
| :--- | :--- |
| **Presentation Layer** | The UI components that enable system interaction. Accessed by the client via the browser and rendered using HTML, CSS, and JavaScript. |
| **Application Layer** | The logical backend where all client web requests are processed. It handles business logic, authorization, privilege validation, and data routing. |
| **Data Layer** | Works in tandem with the Application Layer to store, retrieve, and manage persistent data securely. |

*Note: Certain web servers can also execute OS-level calls and run localized binaries (e.g., IIS ISAPI, PHP-CGI).*

---

## 5. Modern Architectures: Microservices & Serverless

### 5.1. Microservices (Service-Oriented Architecture - SOA)
Microservices decouple core web application tasks into independent, single-purpose components (e.g., Registration, Payments, Search).
* **Characteristics:** Communication between microservices is **stateless** (requests and responses are completely independent). Each service manages its own data structure and can be written in different programming languages.
* **Benefits:** Agility, flexible scaling, rapid CI/CD deployment, reusable code, and high fault tolerance (Resilience).

### 5.2. Serverless Computing
Cloud-native architectures (AWS Lambda, Azure Functions, GCP Cloud Functions) where the cloud provider dynamically manages the allocation and provisioning of servers.
* **Characteristics:** Applications run in stateless computing containers triggered by specific events.
* **Benefits:** Completely removes the SysAdmin overhead of patching, scaling, and maintaining the underlying host OS. 

---

## 6. Architecture Security & Pentesting Implications
During a penetration test, mapping the underlying architecture is just as critical as finding code-level vulnerabilities. Structural design flaws often lead to the most critical compromises.

* **Access Control Flaws:** An application might have secure code, but a broken architectural design regarding Role-Based Access Control (RBAC) could allow Privilege Escalation or Insecure Direct Object References (IDOR). Fixing these requires costly and time-consuming architectural overhauls.
* **Post-Exploitation Awareness:** If a backend server is compromised but the database cannot be located locally, the architecture likely relies on a segregated database server. Proper enumeration is required to map out the segmented network and identify all connected databases. 
* **DevSecOps:** Security must be integrated into every phase of the Software Development Life Cycle (SDLC) to prevent architectural vulnerabilities before deployment.

# Web Application Architecture & Security: Front End vs. Back End

Modern web applications are built on a Full Stack architecture, divided into two distinct environments with different functional boundaries, technologies, and attack surfaces: the Front End (client-side) and the Back End (server-side).

---

## 1. Front End (Client-Side)

The Front End handles everything the user interacts with directly via their web browser. It relies heavily on client-side processing, meaning performance and rendering happen locally on the user's machine.

* **Core Technologies:** HTML (structure), CSS (presentation), and JavaScript (behavior/logic).
* **Key Requirements:** Must be highly optimized, responsive across device form factors (mobile, desktop), and cross-browser compatible.
* **Roles & Tasks:** Visual Concept Design, User Interface (UI), and User Experience (UX) design.
* **Security Perspective:** The client-side is inherently untrusted. Since the source code is rendered locally, it is fully visible and manipulable by the user (or attacker).

## 2. Back End (Server-Side)

The Back End drives the core business logic, processes data, and handles server-to-client communication. It is isolated from direct user interaction.

### 2.1 Core Infrastructure Components

| Component | Description | Technologies / Examples |
| :--- | :--- | :--- |
| **Servers / OS** | The underlying infrastructure hosting the application and its dependencies. | Linux, Windows Server, Docker Containers. |
| **Web Servers** | Software handling incoming HTTP/HTTPS requests and routing traffic. | Apache, Nginx, IIS. |
| **Databases** | Storage systems for retrieving and managing application data. | **Relational:** MySQL, PostgreSQL, Oracle.<br>**Non-Relational:** MongoDB, NoSQL. |
| **Frameworks** | Core environments used to develop and structure the web application logic. | Laravel (PHP), ASP.NET (C#), Spring (Java), Django (Python), Express (Node.js). |

### 2.2 Operational Logic & Containerization
To enforce logical separation and limit the blast radius of potential compromises, backend services are often containerized (e.g., using Docker). This allows the database and the web application to run in isolated environments, securing the infrastructure against lateral movement.

**Core Back End Responsibilities:**
* Developing APIs for Front End communication.
* Managing database queries and state.
* Implementing business logic and integrating third-party cloud services.

---

## 3. Security Posture & Pentesting Methodologies

Web applications are exposed to various attack vectors, primarily through injection vulnerabilities (e.g., SQL Injection, OS Command Injection) where unsanitized user input is processed by the backend.

* **Whitebox Pentesting:** Involves full source code access. Standard for Front End testing (since code is public) or open-source backend applications. Allows for deep static code analysis to uncover hardcoded credentials or logical flaws.
* **Blackbox Pentesting:** Involves testing the application from the outside without source code access. This is the default approach for proprietary Back Ends. 
* *Note:* Vulnerabilities like Local File Inclusion (LFI) can bridge this gap by allowing attackers to read backend source code, effectively pivoting an assessment from Blackbox to Whitebox.

---

## 4. Threat Landscape: Misconfigurations & Vulnerabilities

### Top 20 Web Developer Security Mistakes
As penetration testers, identifying these common architectural and coding flaws is critical during reconnaissance and exploitation phases:

1. Permitting Invalid Data to Enter the Database
2. Focusing on the System as a Whole (Ignoring modular security)
3. Establishing Personally Developed (Custom) Security Methods
4. Treating Security as the Last Step (Lack of DevSecOps)
5. Plain Text Password Storage
6. Creating Weak Passwords
7. Storing Unencrypted Data in the Database
8. Depending Excessively on Client-Side Validation
9. Being Too Optimistic (Assuming secure user behavior)
10. Permitting Variables via the URL Path Name
11. Trusting Third-Party Code / Dependencies
12. Hard-Coding Backdoor Accounts or Credentials
13. Unverified SQL Injections
14. Remote File Inclusions (RFI)
15. Insecure Data Handling
16. Failing to Encrypt Data Properly
17. Not Using a Secure Cryptographic System
18. Ignoring Layer 8 (Human error/social engineering)
19. Failing to Review User Actions (Lack of logging)
20. Web Application Firewall (WAF) Misconfigurations

### OWASP Top 10 Web Application Vulnerabilities
These developer mistakes directly map to the most critical security risks defined by OWASP:

| Rank | Vulnerability |
| :---: | :--- |
| **1** | Broken Access Control |
| **2** | Cryptographic Failures |
| **3** | Injection |
| **4** | Insecure Design |
| **5** | Security Misconfiguration |
| **6** | Vulnerable and Outdated Components |
| **7** | Identification and Authentication Failures |
| **8** | Software and Data Integrity Failures |
| **9** | Security Logging and Monitoring Failures |
| **10** | Server-Side Request Forgery (SSRF) |
