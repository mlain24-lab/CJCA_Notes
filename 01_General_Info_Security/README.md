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
