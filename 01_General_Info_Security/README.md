# 01_General_Info_Security

## Infrastructure of Information Security
In a standard corporate architecture, we distinguish between external assets and internal defense mechanisms. Clients connect via the Internet to company-hosted or cloud-based servers. 

* **Red Team:** Offensive security professionals who simulate cyberattacks to test defenses (positioned between the client and the infrastructure to emulate external threats).
* **Blue Team:** Defensive security professionals responsible for maintaining internal security, monitoring, and incident response (positioned between the servers and the internet).
* **Purple Team:** A collaborative approach where Red and Blue teams work together to share insights, improving the overall security posture through continuous feedback.
* **Internal Environment:** Employees utilizing enterprise applications and mobile devices within the corporate network perimeter.

---

## Areas of InfoSec: The CIA Triad
The core of Information Security is built upon the **CIA Triad**:
1.  **Confidentiality:** Ensuring data is accessible only to authorized users.
2.  **Integrity:** Guaranteeing that information is accurate and has not been tampered with.
3.  **Availability:** Ensuring systems and data are accessible when needed by authorized users.

### Common Cyber Threats
* **DDoS (Distributed Denial of Service):** An attack that attempts to disrupt normal traffic of a targeted server by overwhelming the target or its surrounding infrastructure with a flood of Internet traffic. *(Ataque que inunda un servidor con tráfico masivo para dejarlo inoperativo).*
* **Ransomware:** A type of malware designed to deny access to a computer system or data until a ransom is paid, usually through encryption. *(Malware que cifra tus archivos y pide un rescate económico para recuperarlos).*
* **APTs (Advanced Persistent Threats):** A broad term used to describe a stealthy threat actor, typically a nation-state or state-sponsored group, which launches a sophisticated, long-term attack. *(Ataques prolongados y sofisticados realizados por grupos con grandes recursos, usualmente estados).*
* **Insider Threats:** Security risks that originate from within the organization (employees, former employees, or contractors). *(Amenazas que provienen de personas internas a la empresa).*

---

## Security Concepts
These concepts are intrinsically interconnected within any risk management framework:

* **Vulnerability:** A weakness or flaw in software, hardware, or processes that could be exploited. *(Una debilidad o fallo en el sistema).*
* **Threat:** Any potential occurrence that can cause undesirable outcomes for a system or organization. *(Cualquier evento potencial que puede causar daño).*
* **Risk:** The potential for loss or damage when a **threat** exploits a **vulnerability**. It is often calculated as: $Risk = Threat \times Vulnerability$. *(La probabilidad de que una amenaza explote una vulnerabilidad).*

---

## Roles in Information Security

* **CISO (Chief Information Security Officer):** The senior-level executive responsible for establishing and maintaining the enterprise vision, strategy, and program to ensure information assets are adequately protected. *(Director de seguridad de la información, responsable de la estrategia global).*
* **Security Architect:** Responsible for designing, building, and overseeing the implementation of complex network and computer security for an organization. *(Diseña y supervisa las arquitecturas de seguridad).*
* **Penetration Tester:** Also known as an Ethical Hacker; they are authorized to simulate cyberattacks on an organization's systems to find vulnerabilities. *(Hacker ético que busca fallos de seguridad mediante ataques simulados).*
* **Incident Response Specialist:** The "firefighters" of cybersecurity; they respond to and manage the aftermath of a security breach or attack. *(Especialista en responder y mitigar ataques una vez que ocurren).*
* **Security Analyst:** Responsible for monitoring networks for security breaches and investigating violations when they occur. *(Monitoriza y analiza alertas de seguridad en el día a día).*
* **Compliance Specialist:** Ensures the organization adheres to external regulations (like GDPR or ISO 27001) and internal security policies. *(Se asegura de que la empresa cumpla con las leyes y normativas de seguridad).*

# 01_General_Info_Security: Principles and Processes

This section establishes the foundational framework for **Information Security (InfoSec)**, defining the core principles, operational processes, and the toolset used to validate security posture.

---

### 1. Core Principles of InfoSec


* **Confidentiality:** Information is accessible only to those authorized.
    * *Controls:* Encryption, Access Control Lists (ACLs).
* **Integrity:** Ensures data remains accurate and unaltered over its lifecycle.
    * *Controls:* Hashing (SHA-256), Digital Signatures.
* **Availability:** Systems and data are accessible to authorized users when needed.
    * *Controls:* Redundancy (RAID), Disaster Recovery (DR) planning.
* **Non-repudiation:** Prevents an entity from denying an action or message.
    * *Controls:* Digital Signatures, Audit Logs.
* **Authentication:** Verification of identity for users, processes, or devices.
    * *Controls:* Passwords, Biometrics, Multi-Factor Authentication (MFA).
* **Privacy:** Proper handling of sensitive personal information and compliance.
    * *Controls:* Data minimization, Consent Management.

---

### 2. Information Security Processes
The operational workflow to maintain the **CIA Triad**.



* **Risk Assessment:**
    * **EN:** Identifying and evaluating potential threats and vulnerabilities to prioritize security efforts.
    * **ES:** Identificación y evaluación de posibles amenazas y vulnerabilidades para priorizar los esfuerzos de seguridad.
* **Security Planning:**
    * **EN:** Developing strategies, policies, and allocating resources to address identified risks.
    * **ES:** Desarrollo de estrategias, políticas y asignación de recursos para abordar los riesgos identificados.
* **Implementation of Security Controls:**
    * **EN:** Deploying technical solutions (firewalls, ACLs) and enforcing organizational policies.
    * **ES:** Despliegue de soluciones técnicas (firewalls, ACLs) y aplicación de políticas organizativas.
* **Monitoring and Detection:**
    * **EN:** Continuous surveillance for security events using tools like SIEM or IDS.
    * **ES:** Vigilancia continua de eventos de seguridad utilizando herramientas como SIEM o IDS.
* **Incident Response:**
    * **EN:** Reacting to detected breaches to contain, mitigate, and recover from threats.
    * **ES:** Reacción ante brechas detectadas para contener, mitigar y recuperarse de las amenazas.
* **Disaster Recovery:**
    * **EN:** Focusing on restoring systems and data after a major disruptive incident.
    * **ES:** Enfoque en la restauración de sistemas y datos tras un incidente disruptivo mayor.
* **Continuous Improvement:**
    * **EN:** Updating security measures based on post-incident reviews and new threat intelligence.
    * **ES:** Actualización de las medidas de seguridad basadas en revisiones post-incidente y nueva inteligencia de amenazas.

---

### 3. Purpose and Objectives

* **Protecting Sensitive Data:** Prevent unauthorized access to records and trade secrets.
* **Ensuring Business Continuity:** Keep critical systems running during attacks.
* **Maintaining Regulatory Compliance:**
    * **EN:** Adherence to laws (GDPR, HIPAA) and standards to avoid legal penalties.
    * **ES:** Cumplimiento de leyes (RGPD, HIPAA) y estándares para evitar sanciones legales.
* **Preserving Brand Reputation:**
    * **EN:** Protecting the organization's public image by preventing data breaches.
    * **ES:** Protección de la imagen pública de la organización mediante la prevención de brechas de datos.
* **Safeguarding Intellectual Property:** Protect inventions and creative works.
* **Enabling Secure Digital Transformation:** Safely adopting new tech (Cloud, IoT).

---

### 4. InfoSec & Pentesting Toolset

| Category | Common Tools |
| :--- | :--- |
| **Network Scanning** | **Nmap** (Network discovery & port scanning) |
| **Traffic Analysis** | **Wireshark** (Network protocol analysis) |
| **Exploitation** | **Metasploit Framework** (Modular exploitation) |
| **Web Assessment** | **Burp Suite** (Web proxy & vulnerability scanning) |
| **Password Cracking**| **John the Ripper** / **Hashcat** |
| **Defense/Monitoring**| Firewalls, IDS/IPS, **SIEM** |

# 01_General_Info_Security: Network Security Overview

Network security acts as the "security system" for digital infrastructure. It is a subset of Information Security focused specifically on protecting the network fabric and the data in transit.

---

### 1. Key Elements of Network Security
These components work in tandem to create a **Defense in Depth** strategy.



| Element | Technical Function | Analogy |
| :--- | :--- | :--- |
| **Firewalls** | Filter traffic based on rules (IP, Port, Protocol) between zones. | Locked door/Gatekeeper. |
| **IDS/IPS** | **IDS**: Monitors/Alerts. **IPS**: Automatically blocks malicious traffic. | Security guard/Motion sensor. |
| **VPNs** | Create an encrypted tunnel over public/untrusted networks. | Secure courier service. |
| **Access Control** | Authentication (Who are you?) and Authorization (What can you do?). | ID badge and keycard permissions. |
| **Encryption** | Protects data **at rest** and **in transit** (TLS/SSL). | Tamper-evident seals / Ciphers. |

---

### 2. The Threat Landscape
As a pentester, you target these "windows" to find bypasses. Modern environments are increasingly difficult to secure due to:
* **Expanded Attack Surface:** IoT devices, Cloud infrastructure, and Remote Work (VPN endpoints).
* **Advanced Persistent Threats (APTs):** State-sponsored or highly organized groups using custom exploits.
* **Impact:** Ransomware (financial), Espionage (data theft), and Operational Disruption.

---

### 3. Roles and Responsibilities
Security is a collaborative effort between defensive and offensive teams.

#### **Defensive (Blue Team)**
* **CISO:** Sets strategy and risk tolerance.
* **Network Security Manager:** Oversees infrastructure design and policy enforcement.
* **Network Admins/Analysts:** Day-to-day monitoring, patching, and SIEM management.
* **Compliance Officers:** Ensure adherence to legal frameworks (GDPR, NIST, etc.).

#### **Offensive (Red Team / Pentesters)**
* **Penetration Testers:** Simulate real-world attacks to identify vulnerabilities.
* **Objective:** Validate the effectiveness of the *Blue Team's* controls and prioritize remediation.

---

### Technical Glossary (??)

* **IDS/IPS (Intrusion Detection/Prevention System):**
    * **EN:** Systems that monitor network traffic for signs of a security breach. IDS only alerts; IPS actively drops the malicious packets.
    * **ES:** Sistemas que monitorean el tráfico de red en busca de signos de una brecha de seguridad. El IDS solo alerta; el IPS descarta activamente los paquetes maliciosos.
* **VPN (Virtual Private Network):**
    * **EN:** A technology that creates a safe and encrypted connection over a less secure network, such as the internet.
    * **ES:** Una tecnología que crea una conexión segura y cifrada sobre una red menos segura, como Internet.
* **Attack Surface:**
    * **EN:** The total sum of all possible points (vulnerabilities) where an unauthorized user can try to enter data to or extract data from an environment.
    * **ES:** La suma total de todos los puntos posibles (vulnerabilidades) donde un usuario no autorizado puede intentar introducir o extraer datos de un entorno.

# Module 01: Introduction to Information Security

## Operational Security (OpSec)

**OpSec** is the analytical process that classifies information assets and determines the controls required to protect them. It involves viewing your operations from the perspective of an adversary to identify vulnerabilities.

### The OpSec Process
1.  **Asset Identification:** Determining what critical information needs protection (the "crown jewels").
2.  **Threat Identification:** Recognizing potential adversaries and their capabilities.
3.  **Vulnerability Identification:** Detecting weaknesses in the current security posture.
4.  **Risk Assessment:** Analyzing the likelihood and impact of a vulnerability being exploited.
5.  **Implementation of Countermeasures:** Executing a plan to mitigate identified risks.

> **Technical Insight (Bilingual):**
> **"At its core, OpSec is about identifying critical information, analyzing threats, assessing vulnerabilities, and implementing appropriate protective measures."**
> * **En español:** En su esencia, OpSec trata de identificar información crítica, analizar amenazas, evaluar vulnerabilidades e implementar las medidas de protección adecuadas.
> * **Concept:** It is a proactive strategy to prevent sensitive data from falling into the wrong hands by identifying "bread crumbs" that an attacker could use.

### Key Pillars
* **Access Control:** Limiting resource access to authorized users only.
* **Asset Management:** Maintaining an up-to-date inventory of all hardware and software.
* **Change Management:** A systematic approach to handling all changes to an IT system to ensure no new vulnerabilities are introduced.

### Responsibility
Typically managed by the Information Security team, led by the **CISO**.

> **Term Definition: CISO (Chief Information Security Officer)**
> * **English:** The senior-level executive responsible for establishing and maintaining the enterprise vision, strategy, and program to ensure information assets and technologies are adequately protected.
> * **Español:** Director de Seguridad de la Información. Es el ejecutivo de alto nivel responsable de la estrategia y ejecución de los programas para proteger los activos tecnológicos de la empresa.

---

## Disaster Recovery (DR) & Business Continuity (BC)

* **Disaster Recovery (DR):** Focuses on the technical recovery of specific IT systems, data, and infrastructure after a catastrophic event. Goal: **Minimize downtime.**
* **Business Continuity (BC):**
    > **Term Definition: BC (Business Continuity)**
    > * **English:** The broader strategic framework that ensures an organization can continue operating its essential functions during and after a disaster.
    > * **Español:** Continuidad de Negocio. Es el marco estratégico que garantiza que una organización pueda seguir operando sus funciones esenciales durante y después de un desastre.

### Metrics and Strategy
* **RTO (Recovery Time Objective):** The maximum tolerable duration of a service outage.
* **RPO (Recovery Point Objective):** The maximum amount of data loss measured in time (e.g., "we can afford to lose 4 hours of data").

---

## Cloud Security & Shared Responsibility Model

Cloud security relies on the **Shared Responsibility Model**. The provider (AWS, Azure, GCP) secures the infrastructure, while the customer secures what they put *in* the cloud.

> **Term Definition: Shared Responsibility Model**
> * **English:** A security framework where the Cloud Service Provider (CSP) manages the security *of* the cloud, and the customer manages security *in* the cloud (data, OS, and access).
> * **Español:** Modelo de Responsabilidad Compartida. Marco donde el proveedor asegura la infraestructura base y el cliente es responsable de asegurar sus datos, sistemas operativos y configuraciones.

### Key Focus Areas
* **Data Protection:** Utilizing encryption (at rest and in transit).
* **Identity and Access Management (IAM):** Managing digital identities and permissions.
* **Network Security:** Implementing Firewalls and VPNs to segment traffic.
* **Compliance and Governance:** Ensuring cloud usage meets legal and regulatory standards.

---

## Physical Security

Physical security involves the protection of personnel, hardware, and software from physical actions and events that could cause serious loss or damage.

> **Term Definition: Physical Security (Hardware protection)**
> * **English:** The implementation of physical barriers and control systems to protect IT assets like server racks, workstations, and cabling from unauthorized physical access or environmental hazards.
> * **Español:** Seguridad Física. Implementación de barreras y sistemas de control para proteger equipos (racks, servidores, cableado) de accesos no autorizados o daños ambientales.

### Regulatory Compliance
> **Term Definition: Regulatory Compliance**
> * **English:** The process of ensuring that an organization adheres to laws, regulations, and guidelines relevant to its business processes (e.g., GDPR, PCI-DSS, ISO 27001).
> * **Español:** Cumplimiento Normativo. Proceso de asegurar que la empresa cumple con las leyes y estándares técnicos aplicables a su sector.

### Vulnerability Assessment: Physical Layer

| Vulnerability | Description |
| :--- | :--- |
| **Unsecured Access Points** | Doors or windows left unlocked or easily bypassed. |
| **Weak Locks** | Outdated or low-quality hardware prone to lock-picking. |
| **Inadequate Perimeter** | Lack of fencing, barriers, or CCTV around the facility. |
| **Poor Key Management** | Improper storage of access cards or physical keys. |
| **Insufficient Lighting** | Dark areas that conceal unauthorized activity. |
| **Exposed Infrastructure** | Physically accessible server rooms or network closets. |
| **Lack of Visitor Logs** | Weak protocols for monitoring non-employees. |
| **Unattended Devices** | Workstations left unlocked in public/shared spaces. |
