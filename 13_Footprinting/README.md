# 13_Footprinting

# Enumeration Principles & Methodology

## 1. Overview: Enumeration vs. OSINT
Enumeration is a continuous, iterative loop of **Information Gathering**, leveraging both active and passive methods to map out a target's attack surface.

*   **OSINT (Open-Source Intelligence):** Strictly passive information gathering from publicly available sources (third-party providers). It does not involve direct interaction with the target's infrastructure.
*   **Enumeration:** Involves active scanning and probing (domains, IPs, accessible services, protocols) based on previously discovered data.

## 2. The Pentester's Philosophy
> **Core Mindset:** Our goal is not to immediately compromise the systems, but to map out all possible attack vectors and paths to get there.

*   **Infrastructure Mapping:** Before attacking, build a comprehensive understanding of the company's architecture, business logic, third-party integrations, and deployed security measures.
*   **Avoid the "Noisy" Trap:** Rushing into brute-forcing authentication services (SSH, RDP, WinRM) without understanding the environment is a rookie mistake. It triggers alarms, leads to **blacklisting/IP banning**, and burns the testing scope.
*   **The Treasure Hunter Analogy:** A professional maps the terrain, studies the environment, and selects the right tools before digging. This approach minimizes collateral damage, saves time, and maximizes efficiency.

## 3. The 8 Analytical Questions
During the enumeration phase, a penetration tester must constantly analyze both the visible and the hidden components of the infrastructure. 

### Analyzing the Visible (The Exposed Attack Surface)
1. What can we see?
2. What reasons can we have for seeing it?
3. What image does what we see create for us?
4. What do we gain from it?
5. How can we use it?

### Analyzing the Invisible (The Restricted Infrastructure)
6. What can we not see? *(e.g., filtered ports, internal subnets)*
7. What reasons can there be that we do not see it? *(e.g., Firewalls, WAFs, ACLs)*
8. What image results for us from what we do not see?

## 4. The 3 Core Principles of Enumeration
When stuck during an assessment, the issue is rarely a lack of exploitation skills, but rather a gap in technical understanding of the target system. Always fall back on these principles:

1. **There is more than meets the eye:** Always consider all points of view and look beyond surface-level configurations.
2. **Distinguish between the visible and the invisible:** What is intentionally hidden or blocked often holds critical value and reveals the network topology.
3. **There are always ways to gain more information:** If you hit a wall, pivot. Deeply understand the target's underlying technologies to uncover new enumeration vectors.

# Enumeration Methodology

Un enfoque estructurado y estático para procesos dinámicos de Penetration Testing (Black/White Box). Esta metodología divide el proceso de enumeración en 6 capas (*layers*) concéntricas que actúan como barreras defensivas. El objetivo es identificar vulnerabilidades (*gaps*) de forma sistemática a nivel de infraestructura, host y sistema operativo, evitando depender exclusivamente de hábitos basados en la experiencia del auditor.

## 1. Internet Presence (Infrastructure-based)
`Target_Identification` - Identificación de la presencia online y la infraestructura accesible externamente. Incluye el mapeo de *Domains*, *Subdomains*, *vHosts*, *ASN*, *Netblocks*, direcciones IP e instancias Cloud. El objetivo es delimitar la superficie de ataque para descubrir todos los sistemas objetivo disponibles.

## 2. Gateway (Infrastructure-based)
`Security_Measures_Mapping` - Análisis de las medidas de seguridad perimetrales e internas que protegen el *target*. Involucra la detección de *Firewalls*, *DMZ*, *IPS/IDS*, *EDR*, *Proxies*, *NAC*, segmentación de red y WAFs (ej. Cloudflare). Fundamental para entender las restricciones de red antes de interactuar directamente con los servicios.

## 3. Accessible Services (Host-based)
`Service_Profiling` - Interrogación de interfaces y servicios accesibles, ya sean externos o internos. Se centra en enumerar el *Service Type*, *Functionality*, *Configuration*, *Port*, y *Version*. Esta capa es vital para entender la lógica del sistema y encontrar los vectores de explotación adecuados para establecer comunicación.

## 4. Processes (Host-based)
`Process_Analysis` - Monitorización y análisis de los procesos internos desencadenados por los servicios interactivos. Implica rastrear el *PID* (Process ID), *Processed Data*, tareas programadas (*Tasks*), *Source* y *Destination*. Nos permite comprender el flujo de datos y las dependencias lógicas dentro del servidor comprometido.

## 5. Privileges (OS-based)
`Permission_Mapping` - Identificación de los permisos internos vinculados a los servicios accesibles. Involucra el análisis de *Users*, *Groups*, *Permissions*, *Restrictions* y variables de entorno. Crítico en infraestructuras corporativas (como *Active Directory*) para detectar *misconfigurations* que permitan una escalada de privilegios (*Privilege Escalation*).

## 6. OS Setup (OS-based)
`System_Configuration_Review` - Auditoría de los componentes internos y la configuración del sistema operativo. Consiste en perfilar el *OS Type*, *Patch Level*, *Network config*, *OS Environment*, archivos de configuración y *sensitive private files*. Refleja el nivel de madurez de la infraestructura y nos da una visión clara de las políticas aplicadas por los *SysAdmins*.

## 7. Methodology Workflow
`Labyrinth_Approach` - El *Penetration Test* es un laberinto con tiempo limitado. No todas las vulnerabilidades conducen a un compromiso total (*root/SYSTEM*). La metodología proporciona un marco de procedimientos sistemáticos, mientras que las herramientas (ej. *Nmap*, *scripts* en *Bash*) son recursos dinámicos y dependientes del contexto que se adaptan a las necesidades de cada capa.

# Domain Information & Passive Reconnaissance Cheatsheet

Este recurso consolida las metodologías de recolección pasiva de información (OSINT) centradas en la enumeración de dominios, análisis de logs de *Certificate Transparency* y auditoría profunda de registros DNS. Diseñado para fases iniciales de *penetration testing* desde una perspectiva *Black-Box*, su objetivo técnico es mapear la huella digital pública de la infraestructura corporativa (*Online Presence*), aislando los *Company Hosted Servers* de los servicios *Third-Party* (AWS, SaaS) y descubriendo vectores de ataque potenciales (APIs, paneles de administración) manteniendo un perfil indetectable frente al *target*.

## 1. Certificate Transparency (SSL/TLS Logs)

`curl -s https://crt.sh/?q=domain.com&output=json | jq .` - Ejecuta una consulta a la API de `crt.sh` para extraer los registros de transparencia de certificados y formatea la salida en JSON puro mediante la utilidad `jq`. Permite auditar *Common Names* e *Issuers* (ej. Let's Encrypt, Cloudflare).

`curl -s https://crt.sh/?q=domain.com&output=json | jq . | grep name | cut -d":" -f2 | grep -v "CN=" | cut -d'"' -f2 | awk '{gsub(/\\n/,"\n");}1;' | sort -u` - Implementa un *pipeline* avanzado en Bash para parsear el JSON, limpiar la salida de artefactos (`CN=`) y generar una *wordlist* estructurada y única (*sort -u*) con todos los subdominios registrados.

## 2. IP & Host Resolution

`for i in $(cat subdomainlist); do host $i | grep "has address" | grep domain.com | cut -d" " -f1,4; done` - Itera sobre la *wordlist* de subdominios resolviendo sus registros A para distinguir la infraestructura *On-Premise* de la compañía frente a servicios alojados en infraestructuras de terceros (ej. *Amazon S3 buckets*).

`for i in $(cat subdomainlist); do host $i | grep "has address" | grep domain.com | cut -d" " -f4 >> ip-addresses.txt; done` - Parsea el *output* DNS extrayendo exclusivamente las direcciones IPv4 válidas y volcándolas en un fichero `.txt` para nutrir la fase de enumeración de servicios.

## 3. Shodan CLI (Service & IoT Enumeration)

`shodan host <IP>` - Audita una dirección IP específica contra la base de datos de Shodan de forma completamente pasiva, enumerando puertos TCP/UDP expuestos a Internet, servicios subyacentes (Nginx, OpenSSH, Apache) y parámetros detallados de configuración SSL/TLS.

`for i in $(cat ip-addresses.txt); do shodan host $i; done` - Automatiza el escaneo pasivo a través del *Command-Line Interface* (CLI) iterando sobre todo el *scope* de IPs recopiladas en la fase de resolución de *hosts*.

## 4. DNS Records & Infrastructure Mapping

`dig any domain.com` - Realiza una consulta DNS global (*ANY query*) para volcar la totalidad de registros asociados al dominio. Es un paso crítico para descubrir integraciones corporativas y delinear la arquitectura *backend* de la red.

`A Record` - Mapea el *Fully Qualified Domain Name* (FQDN) a su IPv4. Su análisis es fundamental para identificar los nodos de red principales administrados directamente por la organización.

`MX Record` - Revela el gestor de *Mail Servers* corporativo (ej. Google Workspace, Office 365). Facilita el mapeo de infraestructuras *Cloud* asociadas (GDrive, OneDrive) y perfila la superficie para ataques de *Social Engineering* o intrusiones de *Phishing*.

`NS Record` - Identifica los *Name Servers* autoritativos, delatando el proveedor de *Hosting* o las soluciones perimetrales y de resolución que soporta la infraestructura de red.

`TXT Record` - Expone claves de verificación de *Third-Party Providers* y políticas de seguridad del correo (SPF, DMARC, DKIM). Su desglose revela el *stack* de herramientas operativas (Atlassian, LogMeIn, Mailgun), abriendo la puerta a vectores de ataque avanzados como el abuso de APIs REST (SSRF, Insecure Direct Object References) o compromisos críticos vía *Password Reuse* en portales de acceso remoto centralizados.

# Footprinting Cloud Resources: AWS, Azure & GCP

## 1. Cloud Infrastructure & Misconfiguration Risks
Cloud adoption (AWS, GCP, Azure) centralizes management but shifts the security responsibility regarding configurations to the administrators. A centralized infrastructure does not equate to immunity against vulnerabilities. The most common entry points during external footprinting are misconfigured cloud storage components that allow unauthenticated access:
*   **AWS:** Amazon S3 Buckets.
*   **Azure:** Azure Blobs.
*   **GCP:** Google Cloud Storage.

## 2. DNS & Subdomain Enumeration for Cloud-Hosted Servers
Cloud storage is frequently mapped to corporate DNS records to streamline administrative access. Identifying these mappings is a critical step in infrastructure enumeration.

### Bash Script for DNS Resolution
This loop iterates through a predefined list of subdomains, queries their DNS records, and filters the output to display only the relevant IP addresses associated with the target domain.

    for i in $(cat subdomainlist); do host $i | grep "has address" | grep targetdomain.com | cut -d" " -f1,4; done

*Example Output:*
    blog.inlanefreight.com 10.129.24.93
    s3-website-us-west-2.amazonaws.com 10.129.95.250

*Note: Spotting an `amazonaws.com` or `blob.core.windows.net` address during DNS enumeration confirms the target's reliance on specific cloud providers.*

## 3. OSINT & Search Engine Discovery (Google Dorking)
Search engines passively index publicly exposed cloud storage. Using specific search operators (Google Dorks) allows for the targeted discovery of sensitive corporate files (PDFs, text documents, source code, etc.).

*   **AWS Discovery:**
    intext:"company_name" inurl:amazonaws.com

*   **Azure Discovery:**
    intext:"company_name" inurl:blob.core.windows.net

## 4. Source Code Analysis
Web applications often offload static assets (images, JavaScript, CSS) to cloud storage to reduce web server load. Inspecting the page source code (HTML) for `crossorigin` attributes, `dns-prefetch`, or `preconnect` tags can reveal the backend cloud infrastructure (e.g., links pointing directly to `blob.core.windows.net`).

## 5. Third-Party Enumeration Tools
Leveraging external intelligence platforms provides a broader attack surface mapping without directly interacting with the target (Passive Footprinting).

*   **Domain.Glass:** Provides comprehensive infrastructure intel, including DNS names, SSL/TLS certificate issuers, and gateway security assessments (e.g., verifying if a Cloudflare WAF is actively shielding the target).
*   **GrayHatWarfare:** A highly specialized search engine for discovering open AWS S3 buckets, Azure Blobs, and GCP storage. It allows filtering by file format, enabling the rapid discovery of exposed data using corporate abbreviations or internal naming conventions.

## 6. Critical Data Leaks & Operational Security (OpSec)
Administrative fatigue or lack of strict access control policies often leads to catastrophic data exposures. During footprinting, always look for exposed sensitive configuration files.

*   **Exposed SSH Keys:** Misconfigured buckets may leak `id_rsa` (Private Key) and `id_rsa.pub` (Public Key) files. Access to a private RSA key can grant immediate, passwordless shell access to corporate infrastructure, leading to severe system compromise and privilege escalation.

# 🕵️‍♂️ OSINT & Passive Reconnaissance: Employee & Infrastructure Profiling

## 1. Overview: Social Media & Staff Reconnaissance
Identifying and profiling employees on professional networks (e.g., LinkedIn, Xing) is a critical passive footprinting technique. This process allows auditors and attackers to map out a target organization's internal infrastructure, technology stack, and security posture without directly interacting with corporate assets.

## 2. Intelligence Gathering Vectors

### 2.1. Job Postings (Infrastructure Blueprinting)
Corporate job listings act as a blueprint of the internal IT environment. By analyzing the *Required* and *Desired Skills*, we can accurately deduce the underlying technologies deployed:
* **Core Stack & Languages:** Identification of backend architectures (Java, C#, C++) and automation scripting ecosystems (Python, Ruby, Perl).
* **Database & ORM Systems:** Exposing the data layer (PostgreSQL, MySQL, Oracle, Redis) and ORM frameworks (Hibernate, SQLAlchemy, Entity Framework).
* **Web & API Architectures:** Revealing the use of specific web frameworks (Django, Spring, ASP.NET MVC) and API models (RESTful, SOA, Microservices).
* **CI/CD & Containerization:** Uncovering deployment pipelines (Agile, Continuous Integration), collaboration suites (Atlassian Suite: Jira, Confluence), version control (Git, SVN, Perforce), and orchestration tools (Docker, Kubernetes).

### 2.2. Employee Profiling & Skill Mapping
Targeted analysis of individual employee profiles yields granular intelligence regarding active projects and corporate workflows:
* **Tech Stack Correlation:** Cross-referencing an employee's title (e.g., *DevSecOps*, *Vice President Software Engineer*) with their endorsed skills (e.g., React, Elastic, Kafka, AngularJS) to confirm active technologies in production environments.
* **Corporate Engagement:** Monitoring shared posts, articles, and network interactions provides situational awareness about current business priorities and internal tech adoption.

### 2.3. Source Code Repositories & Data Leakage
Developers frequently link their open-source contributions (e.g., GitHub, GitLab) to their professional profiles, which often leads to inadvertent data exposure:
* **Configuration Flaws:** Personal repositories mirroring internal projects can reveal systemic misconfigurations (e.g., Django OWASP Top 10 vulnerabilities or poorly implemented security headers).
* **Hardcoded Secrets:** Commits and source code snippets may expose critical assets such as hardcoded JWTs (JSON Web Tokens), API keys, or database connection strings.
* **PII & Internal Naming Conventions:** Source code documentation (JSON structures, commit logs) often leaks internal email addresses, author names, and corporate directory structures.

## 3. Reconnaissance Strategy & Targeting

To maximize OSINT efficiency during footprinting engagements:
* **Targeted Filtering:** Utilize advanced search parameters on platforms like LinkedIn (filtering by company, specific IT roles, and location) to isolate high-value targets and reduce noise.
* **Security Posture Estimation:** Focus searches on personnel within the Cybersecurity, SecOps, or IT Administration departments. Analyzing their specific skill sets (e.g., Splunk, SIEM, Firewalls, Threat Hunting) provides a reliable estimate of the defensive countermeasures and security protocols deployed by the organization.
