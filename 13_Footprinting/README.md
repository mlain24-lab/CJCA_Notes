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

Penetration testing and enumeration are highly dynamic processes. To avoid omitting critical aspects and relying solely on unstructured, experience-based habits, we apply a **static enumeration methodology**. This framework is designed for both external and internal assessments and is nested in 6 boundaries (layers) divided into three core levels: **Infrastructure-based**, **Host-based**, and **OS-based**.

## 1. Internet Presence
* **Level:** Infrastructure-based
* **Objective:** Identify the online presence and externally accessible infrastructure to define the attack surface.
* **Key Components:** Domains, Subdomains, vHosts, ASN, Netblocks, IP Addresses, Cloud Instances, and external Security Measures.

## 2. Gateway
* **Level:** Infrastructure-based
* **Objective:** Understand the target's network interface, its network topology location, and how it is protected before direct interaction.
* **Key Components:** Firewalls, DMZs, IPS/IDS, EDRs, Proxies, NACs, Network Segmentation, VPNs, and WAFs (e.g., Cloudflare).

## 3. Accessible Services
* **Level:** Host-based
* **Objective:** Interrogate accessible interfaces to understand the system's logic, functionality, and potential exploitation vectors.
* **Key Components:** Service Type, Functionality, Configuration, Ports, Versions, and specific Interfaces.

## 4. Processes
* **Level:** Host-based
* **Objective:** Analyze internal processes triggered by executed commands or services to identify logical dependencies and data flows.
* **Key Components:** PIDs (Process IDs), Processed Data, Scheduled Tasks, Sources, and Destinations.

## 5. Privileges
* **Level:** OS-based
* **Objective:** Map internal permissions linked to running services to detect misconfigurations and potential Privilege Escalation vectors (crucial in environments like Active Directory).
* **Key Components:** Users, Groups, Permissions, Restrictions, and Environment Variables.

## 6. OS Setup
* **Level:** OS-based
* **Objective:** Audit the internal components and the overall operating system setup to evaluate the SysAdmins' security policies and gather sensitive internal data.
* **Key Components:** OS Type, Patch Level, Network Configuration, OS Environment, Configuration Files, and Sensitive Private Files.

---

## Methodology Workflow: The Labyrinth Approach

A Penetration Test can be visualized as a time-limited labyrinth where the objective is to find the most effective path inside. Key takeaways include:

* **Vulnerability Assessment:** Not all discovered gaps lead to an internal breach. Finding a vulnerability does not guarantee a direct path to a full system compromise (*root/SYSTEM*).
* **Static Framework vs. Dynamic Tooling:** The *methodology* represents the static framework of systematic procedures. The *tools* (e.g., Nmap, custom Bash scripts, web fuzzers) are dynamic, context-dependent resources used to navigate each specific layer.

# Domain Information & Passive Reconnaissance

Passive reconnaissance is a core component of early-stage penetration testing (OSINT). It involves gathering intelligence about a target's internet presence and infrastructure without directly interacting with their systems. This stealthy approach ensures we remain undetected while mapping out the technologies, services, and third-party integrations that sustain the organization's daily operations.

## 1. Certificate Transparency (SSL/TLS Logs)

Analyzing SSL/TLS certificates can reveal hidden subdomains and internal naming conventions. Certificate Transparency (CT) logs, such as those indexed by `crt.sh`, are invaluable for this footprinting phase.

`curl -s https://crt.sh/\?q\=inlanefreight.com\&output\=json | jq .`
This command queries the `crt.sh` API for a specific domain and parses the JSON output using `jq`. It exposes the *Common Name* (CN) and the *Issuer* (e.g., Let's Encrypt, Cloudflare), giving us a first look at the active certificates.

`curl -s https://crt.sh/\?q\=inlanefreight.com\&output\=json | jq . | grep name | cut -d":" -f2 | grep -v "CN=" | cut -d'"' -f2 | awk '{gsub(/\\n/,"\n");}1;' | sort -u`
This is an advanced Bash pipeline that parses the JSON output, strips out formatting artifacts (like `CN=`), and generates a clean, deduplicated wordlist of all discovered subdomains (`sort -u`).

## 2. Infrastructure Mapping & Host Resolution

Once a list of subdomains is acquired, the next step is to resolve their A records to separate company-hosted infrastructure from third-party services (e.g., AWS S3 buckets). Testing third-party hosts without explicit permission falls strictly outside the scope of engagement.

`curl -s "https://crt.sh/?q=instagram.com&output=json" | jq -r '.[].name_value' | sed 's/\*\.//g' | sort -u > subdomains.txt`
`for i in $(cat subdomains.txt); do host $i | grep "has address" | grep instagram.com | cut -d" " -f1,4; done`
This loop iterates through the subdomain wordlist, resolving IP addresses and filtering the output to identify hosts directly tied to the target's primary domain.

`for i in $(cat subdomainlist); do host $i | grep "has address" | grep domain.com | cut -d" " -f4 >> ip-addresses.txt; done`
This variation extracts only the IPv4 addresses from the resolved hosts and appends them to a text file, creating a clean target list for further passive enumeration.

## 3. Passive Service Enumeration (Shodan CLI)

Shodan is a search engine designed for Internet-connected devices (IoT, servers, industrial controllers). Using the Shodan CLI allows for passive reconnaissance of open TCP/UDP ports, running services (e.g., Nginx, OpenSSH, Apache), and SSL/TLS configurations without sending direct packets to the target's firewall.

`shodan host <IP>`
Performs a passive lookup of a specific IP address against the Shodan database, retrieving footprinting data, open ports, and potential known vulnerabilities.

`for i in $(cat ip-addresses.txt); do shodan host $i; done`
Automates the Shodan CLI lookup process, iterating across the entire list of verified, company-hosted IP addresses.

## 4. DNS Records Analysis

DNS records provide a blueprint of the target's backend architecture and cloud integrations. Taking a developer's perspective here helps us understand the functionality behind the services.

`dig any domain.com`
Performs a global DNS query to retrieve all available DNS records for the target domain.

### Key DNS Records to Analyze:

*   **A Records**: Maps the Fully Qualified Domain Name (FQDN) to its corresponding IPv4 address. Crucial for identifying the core infrastructure managed directly by the company.
*   **MX Records**: Identifies the Mail Exchange servers (e.g., Google Workspace, Microsoft 365). This reveals cloud dependencies and broadens the attack surface for Social Engineering or Phishing campaigns, as well as hinting at document management systems (OneDrive, GDrive).
*   **NS Records**: Specifies the authoritative Name Servers, which often discloses the hosting provider or perimeter security solutions in use.
*   **TXT Records**: Used for domain verification and email security policies (SPF, DMARC, DKIM). Extracting these values can expose the internal tech stack:
    *   *Atlassian*: Indicates the use of collaboration tools like Jira or Confluence.
    *   *LogMeIn*: Highlights centralized remote access platforms, which are critical targets; compromising administrative access here via password reuse yields complete system control.
    *   *Mailgun*: Reveals API dependencies for email routing, opening potential vectors for SSRF (Server-Side Request Forgery) or IDOR (Insecure Direct Object References) vulnerabilities.

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

# FTP & TFTP: Service Enumeration and Configuration Assessment

## 1. Protocol Overview

### File Transfer Protocol (FTP)
The File Transfer Protocol (FTP) is a legacy application-layer protocol within the TCP/IP stack (equivalent in layer to HTTP or POP). It facilitates the transfer of files between a client and a server. FTP operations require two dedicated TCP channels:
*   **Control Channel (TCP Port 21):** Used strictly for transmitting client commands and receiving server status codes.
*   **Data Channel (TCP Port 20):** Dedicated exclusively to the actual data transmission. The protocol monitors this channel for errors and supports connection resumption in the event of a drop.

**Active vs. Passive Mode**
*   **Active Mode:** The client establishes the control connection via Port 21 and specifies a local port for the server to connect back to for data transmission. This often fails if the client sits behind a strict firewall that drops inbound connections.
*   **Passive Mode (PASV):** Developed to bypass client-side firewall restrictions. The server opens a random ephemeral port and announces it to the client. The client then initiates the data connection to that specific port.

*Security Note:* Standard FTP is a clear-text protocol. Network conditions permitting, credentials and payloads can be easily intercepted via packet sniffing. 

### Trivial File Transfer Protocol (TFTP)
TFTP is a stripped-down alternative to FTP designed for fundamental file transfers. 
*   **Architecture:** It relies on UDP rather than TCP, lacking built-in session reliability and falling back on application-layer recovery mechanisms.
*   **Authentication & Security:** TFTP does not support user authentication or password-protected logins. Access controls are dictated entirely by the underlying operating system's file permissions (read/write access). Due to these critical security limitations, TFTP should only be deployed within strictly isolated and trusted Local Area Networks (LANs).
*   **Limitations:** Unlike standard FTP clients, TFTP cannot perform directory listings. 

**Standard TFTP Commands:**
*   `connect`: Sets the target remote host (and optional port).
*   `get`: Retrieves files from the remote host.
*   `put`: Uploads files to the remote host.
*   `status`: Displays the current transfer mode (ASCII/binary), timeouts, and connection state.
*   `verbose`: Toggles detailed output during transfers.
*   `quit`: Terminates the session.

---

## 2. FTP Server Configuration (vsFTPd)

The `vsFTPd` (Very Secure FTP Daemon) server is a standard deployment across Linux-based distributions. Its behavior is primarily dictated by its main configuration file located at `/etc/vsftpd.conf`.

### Core Configuration Parameters
Administrators can filter active settings by ignoring commented lines:
~~~bash
cat /etc/vsftpd.conf | grep -v "#"
~~~

**Key Directives:**
*   `listen=NO`: Determines if vsFTPd runs as a standalone daemon or via `inetd`.
*   `anonymous_enable=NO`: Controls unauthenticated access.
*   `local_enable=YES`: Permits local system users to authenticate.
*   `xferlog_enable=YES`: Enables logging of all uploads and downloads.
*   `connect_from_port_20=YES`: Enforces Active FTP data connections from Port 20.
*   `chroot_local_user=YES`: Jails local users within their respective home directories (security mechanism).
*   `ssl_enable=NO`: Toggles TLS/SSL encryption. 

### Access Control via `/etc/ftpusers`
This file acts as a denylist. Any user appended to this list is explicitly denied access to the FTP service, regardless of their existence or privileges on the underlying Linux system.

---

## 3. Vulnerable Configurations & Exploitation

Misconfigured FTP services are prime targets for initial access or lateral movement during penetration tests.

### Anonymous Access
Internal networks often enable anonymous FTP to accelerate internal file sharing. If misconfigured, attackers can list, read, or even upload malicious payloads.
*   `anonymous_enable=YES`: Allows login with the username `anonymous` (password can be blank or any string).
*   `anon_upload_enable=YES`: Permits unauthenticated file uploads.
*   `anon_mkdir_write_enable=YES`: Allows anonymous directory creation.
*   `write_enable=YES`: Grants execution of modifying commands (STOR, DELE, MKD, RMD).

**Connecting as Anonymous:**
~~~bash
ftp <TARGET_IP>
# Name: anonymous
# Password: [Enter]
~~~

### ID Obfuscation (`hide_ids=YES`)
When enabled, the server masks the true UID/GID of files in directory listings, displaying them simply as `ftp`. While this mitigates local user enumeration (which could be leveraged for SSH brute-forcing), it obfuscates file ownership during an audit.

### Recursive Listing & File Extraction
If `ls_recurse_enable=YES` is active, users can map the entire accessible directory tree using a single command:
~~~bash
ftp> ls -R
~~~

**Bulk Extraction:**
To silently map and extract all accessible files from an anonymous FTP share, `wget` can be weaponized:
~~~bash
wget -m --no-passive ftp://anonymous:anonymous@<TARGET_IP>
~~~
This mirrors the remote directory structure locally for offline analysis.

### Upload Vulnerabilities
If upload permissions are granted (e.g., to a webroot directory), attackers can upload reverse shells or use Local File Inclusion (LFI) vulnerabilities to execute system commands:
~~~bash
ftp> put reverse_shell.php
~~~

---

## 4. Footprinting and Service Enumeration

Effective service footprinting is required to identify the FTP daemon version, enabled features, and hidden configurations.

### Nmap Scripting Engine (NSE)
Ensure the local NSE database is up to date:
~~~bash
sudo nmap --script-updatedb
find /usr/share/nmap/scripts/ -type f -name "ftp*"
~~~

**Aggressive Service Scan:**
~~~bash
sudo nmap -sV -p 21 -sC -A <TARGET_IP>
~~~
*   `ftp-anon.nse`: Verifies if anonymous login is permitted and lists root contents.
*   `ftp-syst.nse`: Extracts server status, timeout limits, and detailed daemon versions via the `STAT` command.

**Network-Level Tracing:**
Appending `--script-trace` forces Nmap to output the raw TCP traffic, revealing the exact queries and FTP response codes (e.g., `220 Welcome...`) triggered by the NSE scripts.

### Manual Banner Grabbing & Interaction
When standard clients are restricted, raw socket connections can be established to interact with the service and parse banners:
~~~bash
nc -nv <TARGET_IP> 21
telnet <TARGET_IP> 21
~~~

### SSL/TLS Certificate Inspection
If the FTP server mandates encryption (FTPS), standard clients like `netcat` will fail to extract meaningful data. `OpenSSL` can be used to negotiate the TLS handshake and retrieve the server certificate. This often leaks internal hostnames, corporate email addresses, and organizational structures:
~~~bash
openssl s_client -connect <TARGET_IP>:21 -starttls ftp
~~~

# SMB and Samba: Protocol Analysis and Enumeration Methodology

## 1. Protocol Overview
**Server Message Block (SMB)** is a robust client-server communication protocol designed to regulate access to files, directories, and network resources such as printers and routers. While originally developed for IBM's OS/2 LAN Manager, SMB has become the standard network file-sharing protocol for the Windows operating system ecosystem, offering backward compatibility across older Microsoft architectures. 

To bridge the gap between Unix/Linux distributions and Windows networks, the **Samba** software suite provides a cross-platform implementation of the SMB protocol. 

### 1.1. Network Architecture and Ports
SMB utilizes the TCP/IP suite to establish a reliable connection via a three-way handshake before data transmission.
*   **Legacy Implementations (NetBIOS):** Older NetBIOS-dependent SMB services typically operate over **TCP ports 137, 138, and 139**.
*   **Modern Implementations (CIFS/SMB):** The Common Internet File System (CIFS)—a Microsoft-specific dialect of SMB1—and all subsequent SMB versions operate directly over **TCP port 445** without requiring a separate NetBIOS transport layer.

### 1.2. Protocol Version History
Understanding the SMB version in use is critical during footprinting, as older iterations lack modern security mechanisms like encryption and message signing.

| SMB Version | Introduced In | Key Technical Features |
| :--- | :--- | :--- |
| **CIFS (SMB 1.0)** | Windows NT 4.0 | Communication via NetBIOS interface. Considered highly insecure and obsolete. |
| **SMB 1.0** | Windows 2000 | Direct connection via TCP (Port 445). |
| **SMB 2.0** | Windows Vista / Server 2008 | Performance upgrades, improved message signing, and caching capabilities. |
| **SMB 2.1** | Windows 7 / Server 2008 R2 | Advanced file locking mechanisms. |
| **SMB 3.0** | Windows 8 / Server 2012 | Multichannel connections, end-to-end encryption, remote storage access. |
| **SMB 3.0.2** | Windows 8.1 / Server 2012 R2 | Minor performance updates. |
| **SMB 3.1.1** | Windows 10 / Server 2016 | Pre-authentication integrity checking and AES-128 encryption. |

---

## 2. Samba Configuration and Daemon Architecture

Modern Samba versions (Version 3 and 4) can fully integrate into a Windows Active Directory infrastructure, with Version 4 capable of acting as an Active Directory Domain Controller (AD DC). Samba operates using specialized Unix background daemons:
*   `smbd`: Manages the SMB service, file sharing, and authentication.
*   `nmbd`: Manages NetBIOS name resolution and resource browsing.

### 2.1. Analyzing `smb.conf`
The primary configuration file for Samba is located at `/etc/samba/smb.conf`. It defines global settings and establishes granular Access Control Lists (ACLs) for individual network shares.

**Viewing current clean configuration:**
```bash
cat /etc/samba/smb.conf | grep -v "#\|\;"
```

**Key Parameters & Security Implications:**
Administrators often prioritize user convenience over security, leading to misconfigurations that can be leveraged during a penetration test.

| Parameter | Function | Auditor/Attacker Perspective |
| :--- | :--- | :--- |
| `browseable = yes` | Displays the share in the list of available network shares. | Exposes directory structures to any connected user (authenticated or guest), facilitating reconnaissance. |
| `guest ok = yes` | Permits service connection without a password. | Allows anonymous null sessions, granting unauthenticated access to the share's contents. |
| `read only = no` / `writable = yes` | Permits users to create and modify files. | Enables unauthorized data manipulation or malware payload deployment. |
| `map to guest = bad user` | Maps invalid login attempts to the guest account. | Prevents account lockouts during brute-force attempts and silently drops users into unauthenticated access levels. |
| `enable privileges = yes` | Honors privileges assigned to specific SIDs. | If misconfigured, can lead to privilege escalation within the domain environment. |

*Note: After modifying `/etc/samba/smb.conf`, the service must be restarted:*
```bash
sudo systemctl restart smbd
```

---

## 3. Manual Enumeration Techniques

Before relying on noisy automated scanners, manual enumeration provides precise, stealthy insights into the target's SMB infrastructure.

### 3.1. Interactive Exploration via `smbclient`
`smbclient` acts as an FTP-like client to access SMB/CIFS resources on servers.

**Listing Shares with a Null Session (Anonymous Access):**
```bash
smbclient -N -L //10.129.14.128
```

**Connecting to a Specific Share:**
```bash
smbclient -N //10.129.14.128/notes
```
*Once logged in, you can execute interactive commands such as `ls` to list contents, `get <file>` to download data, and `!<command>` to run local shell commands without terminating the SMB session.*

### 3.2. Administrative Monitoring via `smbstatus`
If administrative or shell access is obtained on the Samba server, `smbstatus` reveals active connections, connected hosts, and locked files.
```bash
sudo smbstatus
```

### 3.3. Initial Footprinting via Nmap
Nmap's default scripting engine can identify the SMB version and exact OS build, though results may sometimes be limited depending on the server's security posture.
```bash
sudo nmap 10.129.14.128 -sV -sC -p139,445
```

---

## 4. Advanced RPC Enumeration

Remote Procedure Call (RPC) functions allow for deep enumeration of domain information, user accounts, and Active Directory structures. The `rpcclient` utility is the standard tool for executing MS-RPC functions against an SMB server.

**Establishing an Anonymous RPC Session:**
```bash
rpcclient -U "" 10.129.14.128
```

### 4.1. Core `rpcclient` Commands

| Command | Output Description |
| :--- | :--- |
| `srvinfo` | Retrieves server details, OS version, and platform ID. |
| `enumdomains` | Lists all domains deployed within the network. |
| `querydominfo` | Extracts detailed domain, server, and user statistics. |
| `netshareenumall` | Enumerates all available shares, including hidden IPC$ shares. |
| `netsharegetinfo <share>` | Retrieves specific ACLs and permissions for a targeted share. |
| `enumdomusers` | Dumps the full list of domain users and their RIDs. |
| `queryuser <RID>` | Provides comprehensive account data for a specific user. |
| `querygroup <RID>` | Retrieves information regarding a specific group. |

### 4.2. Brute-Forcing User RIDs via Bash
If direct user enumeration is restricted, Relative Identifiers (RIDs) can be brute-forced through RPC to map out the user environment logically.
```bash
for i in $(seq 500 1100); do \
    rpcclient -N -U "" 10.129.14.128 -c "queryuser 0x$(printf '%x\n' $i)" | \
    grep "User Name\|user_rid\|group_rid" && echo ""; \
done
```

---

## 5. Automated Enumeration Frameworks

To expedite the reconnaissance phase, several Python-based utilities and frameworks can automate SMB mapping. Relying on multiple tools is highly recommended to cross-reference data accuracy.

### 5.1. Impacket: `samrdump.py`
Leverages the Security Account Manager Remote (SAMR) protocol to extract user endpoints, primary group IDs, and password policies.
```bash
samrdump.py 10.129.14.128
```

### 5.2. SMBMap
A comprehensive utility for identifying available shares, determining user permissions across drives, and mapping overall directory structures.
```bash
smbmap -H 10.129.14.128
```

### 5.3. CrackMapExec (CME)
A post-exploitation framework highly effective in Active Directory environments. It can enumerate shares, test credentials across subnets, and check for SMB signing requirements.
```bash
crackmapexec smb 10.129.14.128 --shares -u '' -p ''
```

### 5.4. Enum4linux-ng
A modernized, Python3 rewrite of the legacy `enum4linux` tool. It automates RPC, LDAP, and NetBIOS queries to aggressively extract OS details, users, groups, shares, and password policies.
```bash
# Execution against a target with full enumeration (-A)
./enum4linux-ng.py 10.129.14.128 -A
```

# Network File System (NFS): Architecture, Configuration, and Enumeration

## 1. Overview
The Network File System (NFS), originally developed by Sun Microsystems, is a distributed file system protocol designed to allow client systems to access directories and files over a network as if they were mounted on local storage. While serving a similar purpose to Server Message Block (SMB), NFS relies on an entirely different underlying protocol and is the standard for Linux and UNIX-based architectures. Consequently, native direct communication between NFS clients and SMB servers is not inherently supported.

NFS relies on the Open Network Computing Remote Procedure Call (ONC-RPC/SUN-RPC) protocol, operating primarily over TCP and UDP port 111. It utilizes External Data Representation (XDR) to ensure system-independent data exchange. 

## 2. Protocol Versions and Capabilities

| Version | Key Characteristics |
| :--- | :--- |
| **NFSv2** | Legacy version. Widely supported but operates entirely over UDP, limiting performance and reliability in modern networks. |
| **NFSv3** | Introduces support for variable file sizes, TCP transport, and improved error reporting. It is not entirely backward-compatible with NFSv2 clients. |
| **NFSv4** | A major overhaul introducing a stateful protocol. Integrates Kerberos authentication, facilitates traversal through firewalls/internet, eliminates the dependency on `portmapper`, supports Access Control Lists (ACLs), and delivers significant security and performance enhancements. |
| **NFSv4.1** | Aims to provide protocol support for cluster server deployments, scalable parallel access across multiple servers (pNFS extension), and session trunking (NFS multipathing). |

**Note on Port Usage:** A critical architectural advantage of NFSv4 is its consolidation of services over a single TCP/UDP port (`2049`), which drastically simplifies firewall configurations compared to the dynamic port allocation used in legacy versions.

## 3. Authentication and Authorization Mechanisms
Historically, the NFS protocol itself lacks built-in authentication or authorization mechanisms. Instead, these responsibilities are delegated to the RPC protocol options, and authorization is inferred from the underlying UNIX file system permissions. 

The server maps the client's UID/GID (User ID / Group ID) and translates these into the appropriate UNIX syntax for file access. 
* **Security Caveat:** Because the server implicitly trusts the UID/GID provided by the client without rigorous secondary verification, traditional NFS deployments should be strictly confined to trusted network segments. If the client and server do not share a centralized identity provider (like LDAP or Active Directory), authorization inconsistencies can occur.

## 4. Server Configuration: The Exports File
NFS configuration is straightforward. Access control for the physical file systems exposed to clients is defined within the `/etc/exports` file. 

### 4.1. Configuration Syntax
The `exports` file maps directories to specific hostnames, IP addresses, or subnets, followed by a set of permission flags.

    cat /etc/exports
    
    # Example for NFSv4:
    # /srv/nfs4        gss/krb5i(rw,sync,fsid=0,crossmnt,no_subtree_check)
    # /srv/nfs4/homes  gss/krb5i(rw,sync,no_subtree_check)

### 4.2. Standard Export Options

| Option | Technical Description |
| :--- | :--- |
| `rw` | Grants read and write permissions to the defined host/subnet. |
| `ro` | Restricts access to read-only. |
| `sync` | Enforces synchronous data transfer, ensuring changes are written to the disk before replying to the client (prioritizes data integrity over speed). |
| `async` | Permits asynchronous data transfer (prioritizes performance but risks data corruption during crashes). |
| `secure` | Restricts connections to source ports below 1024 (privileged ports). |
| `no_subtree_check` | Disables subtree checking, improving reliability and performance by not verifying if an accessed file belongs to a specific subdirectory of an exported volume. |

### 4.3. High-Risk / Dangerous Configurations
During security audits, specific configurations present significant privilege escalation vectors:

| Option | Security Implication |
| :--- | :--- |
| `insecure` | Allows clients to connect from ports above 1024. Bypasses the default security measure that requires the client connection to originate from a `root`-privileged port. |
| `nohide` | If another file system is mounted beneath an exported directory, this option explicitly exposes that secondary file system. |
| `no_root_squash` | **Critical Vulnerability.** Disables the default `root_squash` protection. Any files created by the `root` user on the client machine will retain UID/GID 0 on the server. This effectively grants the client root-level access to the exported file system. |
| `root_squash` | (Default mitigation). Maps requests from UID/GID 0 (`root`) to an anonymous UID/GID, preventing remote root access. |

### 4.4. Applying Configuration Changes
After modifying `/etc/exports`, the NFS server daemon must be restarted, and the exports table re-evaluated:

    echo '/mnt/nfs  10.129.14.0/24(sync,no_subtree_check)' >> /etc/exports
    systemctl restart nfs-kernel-server 
    exportfs
    
    /mnt/nfs        10.129.14.0/24

## 5. Footprinting and Enumeration
When assessing an NFS infrastructure, identifying the active RPC services and querying the target's exposed endpoints is the first phase of enumeration. TCP/UDP ports `111` (RPCbind) and `2049` (NFS Daemon) are the primary targets.

### 5.1. Target Scanning with Nmap
By executing an `nmap` scan against the RPC port, the `rpcinfo` script automatically retrieves the registered RPC services, versions, and dynamically allocated ports (e.g., `mountd`, `nlockmgr`).

    sudo nmap 10.129.14.128 -p111,2049 -sV -sC

### 5.2. Advanced NFS NSE Scripts
Nmap's built-in NFS scripts (`nfs*`) can query the server to enumerate the exported volumes, display internal permissions, and fetch file system statistics without mounting the share manually.

    sudo nmap --script nfs* 10.129.14.128 -sV -p111,2049

## 6. Mounting and Accessing NFS Shares
Once an exported directory is identified, it can be mounted to the local system for deeper inspection. 

### 6.1. Displaying Exports
The `showmount` utility queries the `mountd` daemon on the target to list the export table.

    showmount -e 10.129.14.128
    
    Export list for 10.129.14.128:
    /mnt/nfs 10.129.14.0/24

### 6.2. Mounting the Target Share
To interact with the remote file system, create a local mount point and attach the share. The `-o nolock` flag is often required during penetration testing to bypass file locking mechanisms.

    mkdir target-NFS
    sudo mount -t nfs 10.129.14.128:/ ./target-NFS/ -o nolock
    cd target-NFS

### 6.3. UID/GID Mapping and Privilege Escalation Vectors
When inspecting the mounted share, checking file ownership is crucial. Files may belong to internal network users.

To view usernames and groups:

    ls -l mnt/nfs/

To view explicit UIDs and GIDs:

    ls -n mnt/nfs/

**Exploitation Concept:** If the attacker identifies specific UIDs on the NFS share, they can forge identical UIDs on their local machine. Furthermore, if `no_root_squash` is enabled, or if an attacker has initial SSH access as a low-privileged user, NFS can be leveraged for Privilege Escalation. An attacker can create a malicious binary on the locally mounted NFS share, set the SUID bit using local root, and then execute that payload via SSH on the target server to gain a privileged shell.

### 6.4. Unmounting
Post-engagement, ensure the file system is cleanly detached:

    cd ..
    sudo umount ./target-NFS

    # Domain Name System (DNS): Architecture, Configuration, and Enumeration Methodology

## 1. DNS Architecture and Core Concepts

The Domain Name System (DNS) is a decentralized, hierarchical naming system responsible for resolving human-readable domain names (e.g., `www.hackthebox.com`) into IP addresses. It operates primarily over TCP and UDP port 53. Because it lacks a centralized database, DNS relies on a globally distributed network of servers. 

While DNS traffic is historically unencrypted (posing interception risks), modern security implementations like DNS over TLS (DoT), DNS over HTTPS (DoH), and DNSCrypt are increasingly deployed to encapsulate and secure queries.

### 1.1 DNS Server Typology
The resolution process relies on several specific server roles:

| Server Type | Administrative Description |
| :--- | :--- |
| **DNS Root Server** | The authoritative infrastructure for Top-Level Domains (TLDs). Coordinated by ICANN, there are 13 logical root name servers globally. They act as the central routing interface when lower-level servers cannot resolve a query. |
| **Authoritative Nameserver** | Holds the definitive DNS records for a specific zone. Their responses are binding. If an authoritative server cannot answer, the request cascades up to a root server. |
| **Non-authoritative Nameserver**| Not responsible for a specific zone. These servers accumulate DNS records by performing recursive or iterative queries on behalf of clients. |
| **Caching DNS Server** | Temporarily stores resource records to reduce latency and upstream bandwidth. The storage duration is dictated by the Time-To-Live (TTL) defined by the authoritative server. |
| **Forwarding Server** | A proxy-like server designated specifically to forward incoming DNS queries to upstream DNS servers. |
| **Resolver** | The client-side component (often within local operating systems or edge routers) that initiates the name resolution process. |

---

## 2. DNS Resource Records

Resource Records (RR) dictate how traffic is routed and provide metadata about the domain's services, validation protocols, and administrative boundaries.

*   **A (Address):** Maps a hostname to an IPv4 address.
*   **AAAA (IPv6 Address):** Maps a hostname to an IPv6 address.
*   **MX (Mail Exchange):** Specifies the mail servers responsible for accepting email on behalf of the domain.
*   **NS (Name Server):** Delegates a DNS zone to use the specified authoritative name servers.
*   **TXT (Text):** Holds arbitrary text. Critically used in modern infrastructure for domain verification and email security protocols (SPF, DKIM, DMARC).
*   **CNAME (Canonical Name):** Aliases one name to another (e.g., mapping `www.domain.com` to `domain.com`).
*   **PTR (Pointer):** Resolves an IP address to a Fully Qualified Domain Name (FQDN) to facilitate reverse lookups.
*   **SOA (Start of Authority):** Defines core administrative properties of the zone, including the primary nameserver, the administrator's email, and zone transfer timers. 

*Note: In SOA records, the administrator's email replaces the `@` symbol with a dot (e.g., `awsdns-hostmaster.amazon.com` equates to `awsdns-hostmaster@amazon.com`).*

---

## 3. BIND9 Server Configuration

BIND9 is the de facto standard DNS server software for Linux/Unix environments. It relies on a suite of configuration files to define global operational parameters and specific zone parameters. 

### 3.1 Local Configuration Files
The primary configuration file is `/etc/bind/named.conf`, which typically includes:
*   `named.conf.options`: Global directives affecting all zones (e.g., forwarders, listen-on directives).
*   `named.conf.local`: Local zone declarations.
*   `named.conf.log`: Logging definitions.

**Example `named.conf.local`:**
```conf
// /etc/bind/named.conf.local
zone "inlanefreight.htb" {
    type master;
    file "/etc/bind/db.inlanefreight.htb";
    allow-update { key rndc-key; };
};
```

### 3.2 Forward and Reverse Zone Files
Zone files adhere strictly to the BIND format (RFC 1035). A syntax error usually results in the DNS daemon returning a `SERVFAIL` state for the entire zone.

**Forward Zone File (`db.inlanefreight.htb`):** maps hostnames to IP addresses.
```conf
$ORIGIN inlanefreight.htb.
$TTL 86400
@     IN     SOA    ns1.inlanefreight.htb. admin.inlanefreight.htb. (
                    2023010501 ; Serial
                    21600      ; Refresh
                    3600       ; Retry
                    604800     ; Expire
                    86400 )    ; Minimum TTL

      IN     NS     ns1.inlanefreight.htb.
      IN     MX     10     mail.inlanefreight.htb.
@     IN     A      10.129.14.5
ns1   IN     A      10.129.14.2
mail  IN     A      10.129.14.7
www   IN     CNAME  @
```

**Reverse Zone File (`db.10.129.14`):** Uses PTR records to resolve the last octet of an IP address back to an FQDN.
```conf
$ORIGIN 14.129.10.in-addr.arpa.
$TTL 86400
@     IN     SOA    ns1.inlanefreight.htb. admin.inlanefreight.htb. (
                    2023010501 ; Serial 
                    ... )

      IN     NS     ns1.inlanefreight.htb.
5     IN     PTR    inlanefreight.htb.
2     IN     PTR    ns1.inlanefreight.htb.
7     IN     PTR    mail.inlanefreight.htb.
```

---

## 4. Security Risks and Misconfigurations

Administrative oversight prioritizing functionality over security often leads to severe infrastructure vulnerabilities. In BIND9, improper restriction of the following parameters can compromise the network:

*   **`allow-query`**: If unrestrained, it permits external entities to arbitrarily query the server, exposing domain records.
*   **`allow-recursion`**: Unrestricted recursion allows attackers to utilize the DNS server in distributed reflection denial-of-service (DrDoS) attacks or cache poisoning.
*   **`allow-transfer`**: If set to `any`, it allows unauthorized clients to perform an Asynchronous Full Transfer Zone (AXFR), downloading the entire zone file and exposing internal network topologies.

---

## 5. Enumeration and Footprinting Methodology

In an auditing or penetration testing context, DNS footprinting involves systematically querying the target's nameservers to map its infrastructure.

### 5.1 Basic Enumeration (DIG)
Extracting Name Servers (NS) and attempting to uncover all publicly available records:

```bash
# Querying Name Servers
MikyRedHat@htb[/htb]$ dig ns inlanefreight.htb @10.129.14.128

# Querying all available records (ANY)
MikyRedHat@htb[/htb]$ dig any inlanefreight.htb @10.129.14.128

# Querying BIND version via CHAOS class (Useful for vulnerability mapping)
MikyRedHat@htb[/htb]$ dig CH TXT version.bind 10.129.120.85
```

### 5.2 Zone Transfer (AXFR)
If the `allow-transfer` directive is misconfigured, a secondary server (or an attacker) can replicate the entire DNS database.

```bash
# Attempting a zone transfer on the external domain
MikyRedHat@htb[/htb]$ dig axfr inlanefreight.htb @10.129.14.128

# Attempting a zone transfer on the internal domain (Often yields Active Directory structures)
MikyRedHat@htb[/htb]$ dig axfr internal.inlanefreight.htb @10.129.14.128
```

### 5.3 Subdomain Brute Forcing
When AXFR fails, standard procedure dictates brute-forcing subdomains using a wordlist (e.g., SecLists) to discover hidden application servers, VPN endpoints, or development environments.

**Using a Bash Loop:**
```bash
MikyRedHat@htb[/htb]$ for sub in $(cat /opt/useful/seclists/Discovery/DNS/subdomains-top1million-110000.txt); do \
dig $sub.inlanefreight.htb @10.129.14.128 | grep -v ';\|SOA' | sed -r '/^\s*$/d' | grep $sub | tee -a subdomains.txt; \
done
```

**Using Automated Tools (`dnsenum`):**
```bash
MikyRedHat@htb[/htb]$ dnsenum --dnsserver 10.129.14.128 --enum -p 0 -s 0 -o subdomains.txt -f /opt/useful/seclists/Discovery/DNS/subdomains-top1million-110000.txt inlanefreight.htb
```

# Simple Mail Transfer Protocol (SMTP): Architecture & Enumeration

## 1. Overview and Core Concepts
The **Simple Mail Transfer Protocol (SMTP)** is the standard TCP/IP protocol designated for electronic mail transmission. Operating on a client-server model, SMTP manages the delivery of email from an email client to an outgoing mail server, as well as the routing between different SMTP servers (where a server temporarily acts as a client). SMTP is inherently responsible for *sending* and *forwarding* messages and is universally deployed alongside protocols like **IMAP** or **POP3**, which handle message retrieval.

### 1.1 Standard Port Configuration
*   **Port 25 (TCP):** The default port for unencrypted, legacy SMTP relaying.
*   **Port 587 (TCP):** Modern standard used for mail submission by authenticated users. It typically utilizes the `STARTTLS` command to opportunistically upgrade a plaintext connection to a secure SSL/TLS encrypted session.
*   **Port 465 (TCP):** Deprecated but still encountered port for implicit SSL/TLS encrypted SMTP communication.

### 1.2 Mail Delivery Architecture
The lifecycle of an email transmission relies on several specialized agents:
1.  **Mail User Agent (MUA):** The client application (e.g., Thunderbird, Outlook). It constructs the email (Header and Body) and initiates the upload.
2.  **Mail Submission Agent (MSA):** Often acting as a Relay Server, it validates the email's origin and format before passing it to the MTA.
3.  **Mail Transfer Agent (MTA):** The core software routing engine (e.g., Postfix, Exim). It evaluates attachments, performs spam filtering, resolves the destination domain via DNS (MX records), and routes the message.
4.  **Mail Delivery Agent (MDA):** Upon reaching the destination server, the MDA parses the incoming packets, reassembles the email, and delivers it to the designated user mailbox (accessible via IMAP/POP3).

**Transmission Flow:**  
`Client (MUA) ➞ Submission Agent (MSA) ➞ Transfer Agent (MTA) ➞ Delivery Agent (MDA) ➞ Mailbox`

---

## 2. Inherent Vulnerabilities & ESMTP
Legacy SMTP transmits data, routing details, and credentials in **plaintext**, presenting a severe security risk if intercepted. Additionally, the protocol suffers from two critical architectural flaws:
1.  **Lack of Delivery Assurance:** SMTP does not natively enforce structured delivery confirmations. Bounces or failures return as raw, unformatted error messages.
2.  **Unauthenticated Spoofing (Open Relays):** By default, legacy SMTP does not mandate user authentication. Malicious actors frequently exploit misconfigured servers (Open Relays) to spoof sender addresses (`Mail Spoofing`) and execute massive spam campaigns. 

To mitigate these flaws, modern infrastructure relies on **Extended SMTP (ESMTP)**. ESMTP enforces authentication via the `AUTH PLAIN` extension and encrypts traffic through `STARTTLS`. Furthermore, verification mechanisms like **DomainKeys Identified Mail (DKIM)** and **Sender Policy Framework (SPF)** are implemented to combat domain spoofing and validate sender integrity.

---

## 3. Server Configuration & Dangerous Settings

### 3.1 Analyzing Postfix Default Configuration
Postfix is a widely deployed MTA. System administrators typically configure its parameters in the `/etc/postfix/main.cf` file. 

```bash
MikyRedHat@htb[/htb]$ cat /etc/postfix/main.cf | grep -v "#" | sed -r "/^\s*$/d"

smtpd_banner = ESMTP Server 
biff = no
append_dot_mydomain = no
readme_directory = no
compatibility_level = 2
smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache
myhostname = mail1.inlanefreight.htb
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
smtp_generic_maps = hash:/etc/postfix/generic
mydestination = $myhostname, localhost 
masquerade_domains = $myhostname
mynetworks = 127.0.0.0/8 10.129.0.0/16
mailbox_size_limit = 0
recipient_delimiter = +
smtp_bind_address = 0.0.0.0
inet_protocols = ipv4
smtpd_helo_restrictions = reject_invalid_hostname
home_mailbox = /home/postfix
```

### 3.2 The Open Relay Misconfiguration
A critical finding during internal or external penetration tests is a globally permissive network setting. 
```bash
mynetworks = 0.0.0.0/0
```
When an administrator lacks granular control over authorized subnets and sets `mynetworks` to `0.0.0.0/0`, the SMTP server explicitly trusts *all* IP addresses. This misconfiguration creates an **Open Relay**, allowing unauthenticated external attackers to route malicious payloads or spoofed emails through the trusted corporate infrastructure.

---

## 4. SMTP Command Reference
Interaction with an SMTP server requires specific syntax. Below are the standard commands utilized during enumeration and manual relaying:

| Command | Description |
| :--- | :--- |
| `AUTH PLAIN` | ESMTP extension used to authenticate the client credentials. |
| `HELO` / `EHLO` | Initiates the session. `EHLO` is used for ESMTP, prompting the server to list supported extensions. |
| `MAIL FROM` | Specifies the envelope sender address. |
| `RCPT TO` | Specifies the envelope recipient address. |
| `DATA` | Initiates the transmission of the email payload (headers and body). Ends with `<CR><LF>.<CR><LF>`. |
| `RSET` | Aborts the current transaction without terminating the TCP connection. |
| `VRFY` | Validates whether a specific user or mailbox exists on the server. |
| `EXPN` | Expands a mailing list, checking available mailboxes similarly to `VRFY`. |
| `NOOP` | No Operation. Keeps the session alive to prevent timeout disconnections. |
| `QUIT` | Gracefully terminates the SMTP session. |

---

## 5. Interaction and User Enumeration (Telnet)
Manual interaction via `telnet` (or `netcat`) allows an auditor to evaluate the server's banners, supported extensions, and user existence. *Note: When operating through web proxies, the syntax `CONNECT <IP>:<PORT> HTTP/1.0` can be leveraged.*

### 5.1 Banner Grabbing and VRFY Enumeration
The `VRFY` command is a primary enumeration vector. However, modern MTAs often implement anti-enumeration defenses, returning a generic `252 2.0.0` status code (indicating "cannot verify but will attempt delivery") for both valid and invalid users.

```bash
MikyRedHat@htb[/htb]$ telnet 10.129.14.128 25
Trying 10.129.14.128...
Connected to 10.129.14.128.
Escape character is '^]'.
220 ESMTP Server 

EHLO mail1
250-mail1.inlanefreight.htb
250-PIPELINING
250-SIZE 10240000
250-ETRN
250-ENHANCEDSTATUSCODES
250-8BITMIME
250-DSN
250-SMTPUTF8
250 CHUNKING

VRFY root
252 2.0.0 root

VRFY aaaaaaaaaaaaaaaaaaaaaaaaaaaa
252 2.0.0 aaaaaaaaaaaaaaaaaaaaaaaaaaaa
```
*Takeaway:* Automated enumeration tools relying solely on status codes may trigger false positives if the server applies generic `252` responses. Manual validation is recommended.

### 5.2 Manual Email Transmission
Simulating an entire MUA transaction via CLI validates whether the server permits unauthenticated relaying or internal spoofing.

```bash
MikyRedHat@htb[/htb]$ telnet 10.129.14.128 25
Trying 10.129.14.128...
Connected to 10.129.14.128.
Escape character is '^]'.
220 ESMTP Server

EHLO inlanefreight.htb
250-mail1.inlanefreight.htb

MAIL FROM: <cry0l1t3@inlanefreight.htb>
250 2.1.0 Ok

RCPT TO: <mrb3n@inlanefreight.htb> NOTIFY=success,failure
250 2.1.5 Ok

DATA
354 End data with <CR><LF>.<CR><LF>
From: <cry0l1t3@inlanefreight.htb>
To: <mrb3n@inlanefreight.htb>
Subject: DB Access Troubleshooting
Date: Tue, 28 Sept 2021 16:32:51 +0200

Hey man, I am trying to access our XY-DB but the creds don't work. 
Did you make any changes there?
.
250 2.0.0 Ok: queued as 6E1CF1681AB

QUIT
221 2.0.0 Bye
Connection closed by foreign host.
```

---

## 6. Footprinting with Nmap
Nmap's NSE (Nmap Scripting Engine) provides dedicated scripts for auditing SMTP deployments.

### 6.1 Capability Enumeration (`smtp-commands`)
This script executes an `EHLO` to extract the server's supported parameters and extensions, verifying compatibility and potential attack vectors (like `VRFY` or `EXPN` availability).

```bash
MikyRedHat@htb[/htb]$ sudo nmap 10.129.14.128 -sC -sV -p 25

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2021-09-27 17:56 CEST
Nmap scan report for 10.129.14.128
Host is up (0.00025s latency).

PORT   STATE SERVICE VERSION
25/tcp open  smtp    Postfix smtpd
|_smtp-commands: mail1.inlanefreight.htb, PIPELINING, SIZE 10240000, VRFY, ETRN, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8, CHUNKING, 
MAC Address: 00:00:00:00:00:00 (VMware)
```

### 6.2 Open Relay Detection (`smtp-open-relay`)
Running the `smtp-open-relay` script executes 16 rigorous routing tests to determine if the target MTA will indiscriminately forward unauthorized mail. Passing (or in an attacker's view, failing) these checks confirms a critical vulnerability.

```bash
MikyRedHat@htb[/htb]$ sudo nmap 10.129.14.128 -p 25 --script smtp-open-relay -v

# [...] Scan initialization omitted for brevity
Nmap scan report for 10.129.14.128
Host is up (0.00020s latency).

PORT   STATE SERVICE
25/tcp open  smtp
| smtp-open-relay: Server is an open relay (16/16 tests)
|  MAIL FROM:<> -> RCPT TO:<relaytest@nmap.scanme.org>
|  MAIL FROM:<antispam@nmap.scanme.org> -> RCPT TO:<relaytest@nmap.scanme.org>
|  MAIL FROM:<antispam@ESMTP> -> RCPT TO:<relaytest@nmap.scanme.org>
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<relaytest@nmap.scanme.org>
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<relaytest%nmap.scanme.org@[10.129.14.128]>
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<relaytest%nmap.scanme.org@ESMTP>
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<"relaytest@nmap.scanme.org">
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<"relaytest%nmap.scanme.org">
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<relaytest@nmap.scanme.org@[10.129.14.128]>
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<"relaytest@nmap.scanme.org"@[10.129.14.128]>
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<relaytest@nmap.scanme.org@ESMTP>
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<@[10.129.14.128]:relaytest@nmap.scanme.org>
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<@ESMTP:relaytest@nmap.scanme.org>
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<nmap.scanme.org!relaytest>
|  MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<nmap.scanme.org!relaytest@[10.129.14.128]>
|_ MAIL FROM:<antispam@[10.129.14.128]> -> RCPT TO:<nmap.scanme.org!relaytest@ESMTP>
```
## 7. Advanced User Enumeration: The RCPT TO Fallback Method

During penetration tests, standard enumeration commands like `VRFY` and `EXPN` are frequently disabled by system administrators to prevent directory harvesting attacks. In such fortified environments, automated tools relying on these commands will yield false negatives (zero results), especially when coupled with rate-limiting or high-latency responses from the server.

When `VRFY` fails, the optimal fallback strategy is to abuse the `RCPT TO` command. Because a Mail Transfer Agent (MTA) is strictly required to process destination addresses to route email, this method is significantly harder to mitigate without breaking core mail routing functionality.

### 7.1 Automated Execution via smtp-user-enum
To prevent premature TCP connection drops caused by server-side latency or rate-limiting, it is critical to increase the default query timeout. The `-M RCPT` flag shifts the tool's behavior to simulate a legitimate mail transaction (`MAIL FROM` followed by `RCPT TO`).

```bash
# Execute enumeration with the RCPT method and a 15-second timeout threshold
MikyRedHat@htb[/htb]$ smtp-user-enum -M RCPT -U /path/to/wordlist.txt -t <TARGET_IP> -w 15
```
*Technical Note: The tool analyzes the server's HTTP/SMTP response codes. A `250 2.1.5 Ok` confirms a valid mailbox, whereas a `550 5.1.1 User unknown` indicates an invalid user.*

### 7.2 Manual Validation (Telnet)
If automated tools fail or require verification to eliminate false positives, the process can be manually executed by initializing an ESMTP session.

```bash
MikyRedHat@htb[/htb]$ telnet <TARGET_IP> 25
Trying <TARGET_IP>...
Connected to <TARGET_IP>.

EHLO inlanefreight.htb
250-mail1.inlanefreight.htb

MAIL FROM: <auditor@inlanefreight.htb>
250 2.1.0 Ok

# 1. Testing an invalid user address
RCPT TO: <nonexistent_user@inlanefreight.htb>
550 5.1.1 <nonexistent_user@inlanefreight.htb>: Recipient address rejected: User unknown in local recipient table

# 2. Testing a valid user address (Target confirmed)
RCPT TO: <valid_user@inlanefreight.htb>
250 2.1.5 Ok
```

# Email Services Protocol Analysis: IMAP & POP3

## 1. Protocol Architecture & Overview

When managing email delivery and retrieval, two primary network protocols govern how a Mail User Agent (MUA) interacts with the mail server: the **Internet Message Access Protocol (IMAP)** and the **Post Office Protocol (POP3)**. 

### 1.1 IMAP (Internet Message Access Protocol)
IMAP is a stateful, client-server protocol designed for the online management of emails directly on a remote server. It functions similarly to a network file system for emails, allowing seamless synchronization across multiple independent clients. 
* **Key Features:** Supports hierarchical folder structures, remote message manipulation (reading, deleting, moving) without downloading the entire payload, and simultaneous multi-client access.
* **State & Synchronization:** Emails remain on the server until explicitly deleted. While primarily requiring an active connection, modern MUAs support offline caching, synchronizing changes once the connection is re-established.
* **Ports:** 
  * `143/TCP` (Unencrypted or STARTTLS)
  * `993/TCP` (IMAPS - Implicit SSL/TLS)

### 1.2 POP3 (Post Office Protocol version 3)
In contrast, POP3 is a simpler, stateless protocol designed primarily for retrieving and subsequently deleting emails from the server.
* **Key Features:** Limited to listing, retrieving, and deleting messages. It lacks the advanced synchronization and server-side folder management inherent to IMAP.
* **Ports:** 
  * `110/TCP` (Unencrypted or STARTTLS)
  * `995/TCP` (POP3S - Implicit SSL/TLS)

---

## 2. Authentication & Security Implications

By default, standard IMAP and POP3 protocols operate over unencrypted channels, transmitting commands, payloads, and authentication credentials (usernames/passwords) in cleartext ASCII format. To mitigate packet sniffing and unauthorized access, modern infrastructure enforces encrypted sessions using SSL/TLS wrappers (IMAPS/POP3S) or the `STARTTLS` command to upgrade plaintext connections.

### 2.1 Dangerous Configurations (Dovecot)
In enterprise environments, third-party mail solutions (Google Workspace, Microsoft 365) are standard, but legacy or privacy-focused organizations often maintain on-premise mail servers (e.g., using `dovecot-imapd` and `dovecot-pop3d`). Misconfigurations in these services can lead to severe information disclosure. 

Notable `dovecot.conf` misconfigurations include:

| Configuration Directive | Security Impact & Description |
| :--- | :--- |
| `auth_debug` | Enables comprehensive authentication debug logging, potentially leaking sensitive operational flow. |
| `auth_debug_passwords` | Adjusts log verbosity to include submitted plaintext passwords and the authentication scheme used. |
| `auth_verbose` | Logs unsuccessful authentication attempts and detailed failure reasons, aiding in user enumeration. |
| `auth_verbose_passwords` | Logs the exact passwords used for authentication (often truncated, but still highly sensitive). |
| `auth_anonymous_username` | Specifies the username mapped when logging in via the `ANONYMOUS` SASL mechanism, potentially allowing unauthorized mailbox access. |

---

## 3. Protocol Command Reference

Communication with these servers relies on text-based commands. In IMAP, commands are typically prefixed with a unique identifier (e.g., `1`, `A001`) to asynchronously map server responses to client requests.

### 3.1 IMAP Commands

| Command Syntax | Technical Description |
| :--- | :--- |
| `1 LOGIN <username> <password>` | Authenticates the user session. |
| `1 LIST "" *` | Enumerates all available directories/mailboxes. |
| `1 CREATE "INBOX"` | Provisions a new mailbox with the specified name. |
| `1 DELETE "INBOX"` | Removes a specified mailbox. |
| `1 RENAME "ToRead" "Important"` | Modifies the name of an existing mailbox. |
| `1 LSUB "" *` | Returns a subset of mailboxes the user has subscribed to or declared active. |
| `1 SELECT INBOX` | Mounts a specific mailbox to access its messages. |
| `1 UNSELECT INBOX` | Unmounts the currently selected mailbox. |
| `1 FETCH <ID> all` | Retrieves the payload and metadata associated with a specific message ID. |
| `1 CLOSE` | Purges all messages flagged for deletion in the currently selected mailbox. |
| `1 LOGOUT` | Gracefully terminates the IMAP session. |

### 3.2 POP3 Commands

| Command Syntax | Technical Description |
| :--- | :--- |
| `USER <username>` | Submits the username identifier. |
| `PASS <password>` | Authenticates the session using the corresponding password. |
| `STAT` | Queries the server for the total number of stored emails and overall size. |
| `LIST` | Enumerates message IDs and their respective sizes. |
| `RETR <id>` | Retrieves the full payload of the specified message ID. |
| `DELE <id>` | Flags the specified message ID for deletion. |
| `CAPA` | Queries the server's supported capabilities and extensions. |
| `RSET` | Resets the current session state, unflagging any messages marked for deletion. |
| `QUIT` | Gracefully terminates the POP3 session. |

---

## 4. Footprinting and Enumeration Methodology

During an engagement, analyzing the mail server's footprint allows auditors to map available capabilities, extract software versions (banner grabbing), and validate TLS configurations.

### 4.1 Port Scanning & Capability Enumeration (Nmap)
Leverage Nmap's default scripts to extract server capabilities and SSL/TLS certificate metadata.

```bash
# Nmap scan against standard IMAP/POP3 ports
sudo nmap 10.129.14.128 -sV -p110,143,993,995 -sC

# Output Snippet Analysis:
# 110/tcp open  pop3      Dovecot pop3d
# |_pop3-capabilities: AUTH-RESP-CODE SASL STLS TOP UIDL RESP-CODES CAPA PIPELINING
# 143/tcp open  imap      Dovecot imapd
# |_imap-capabilities: more have post-login STARTTLS Pre-login capabilities...
```
*Reconnaissance takeaway:* Certificate Subject details (e.g., `commonName=mail1.inlanefreight.htb`) often reveal internal domain structures and organizational data.

### 4.2 Banner Grabbing and Application Interaction (cURL)
`cURL` can be utilized to test authentication and inspect TLS handshakes natively.

```bash
# Basic authentication and mailbox enumeration
curl -k 'imaps://10.129.14.128' --user user:p4ssw0rd

# Verbose execution for TLS/SSL certificate inspection and Banner Grabbing
curl -k 'imaps://10.129.14.128' --user robin:robin -v
```

### 4.3 Manual Secure Interaction (OpenSSL)
To manually interact with the services over SSL-encrypted channels (simulating an MUA), utilize the `openssl s_client` module. This is critical for testing commands interactively once valid credentials (e.g., `robin:robin` obtained via SMTP enumeration) are acquired.

**Connecting to POP3S (Port 995):**
```bash
openssl s_client -connect 10.129.14.128:995
# Wait for the handshake to complete and the server banner:
# +OK HTB-Academy POP3 Server
```

**Connecting to IMAPS (Port 993):**
```bash
openssl s_client -connect 10.129.14.128:993
# Wait for the handshake to complete and the server banner:
# * OK [CAPABILITY IMAP4rev1 SASL-IR LOGIN-REFERRALS ID ENABLE IDLE LITERAL+ AUTH=PLAIN] HTB-Academy IMAP4 v.0.21.4
```
*Note:* Once connected, you can manually issue the IMAP or POP3 commands documented in Section 3 to navigate the mailbox, read sensitive correspondence, or retrieve target data.

# Simple Network Management Protocol (SNMP) Architecture and Enumeration

## 1. Introduction to SNMP
Simple Network Management Protocol (SNMP) is an application-layer protocol utilized for monitoring and managing network devices. It enables administrators to handle configuration tasks, assess system health, and modify settings remotely. SNMP is universally supported across a wide array of hardware, including routers, switches, servers, and IoT devices.

The protocol operates primarily over **UDP port 161** for polling operations (where the client actively queries the server or agents) and control commands. Additionally, SNMP employs **UDP port 162** to receive **traps**. Traps are asynchronous notifications sent from the SNMP agent to the management station without an explicit request, triggered by specific predefined system events. 

To successfully exchange data, the available SNMP objects must have unique, mutually recognized addresses. This addressing mechanism is a fundamental prerequisite for effective network monitoring and management.

## 2. Core Components

### Management Information Base (MIB)
To ensure interoperability across heterogeneous environments and different hardware vendors, SNMP utilizes the Management Information Base (MIB). The MIB is an independent, standardized text file formatted in Abstract Syntax Notation One (ASN.1). It organizes queryable SNMP objects into a hierarchical tree structure. While MIBs do not store actual operational data, they serve as a dictionary, defining where specific information resides, the corresponding data types, and access privileges.

### Object Identifier (OID)
An Object Identifier (OID) represents a specific node within the MIB's hierarchical namespace. Nodes are identified by a sequence of integers concatenated by dot notation (e.g., `.1.3.6.1.2.1.1`). The deeper the sequence traverses down the tree, the more granular the information becomes. Higher-level nodes often serve merely as structural references to subordinate nodes. Associated OIDs can be referenced in standard Object Identifier Registries.

### Community Strings
In legacy SNMP versions, community strings function as plaintext passwords governing access control. They determine whether a management station is authorized to view or modify queried information. Given their unencrypted nature, community strings represent a significant security vulnerability if intercepted via network sniffing.

## 3. Protocol Versions

* **SNMPv1:** The inaugural version of the protocol, primarily focused on basic network management and trap notifications. Its critical flaw is the complete lack of built-in authentication and encryption mechanisms; all data, including credentials, is transmitted in plaintext.
* **SNMPv2c:** The most ubiquitous iteration in legacy environments. The "c" denotes its community-based authentication model. While it introduces performance enhancements over v1, it maintains the same fundamental security flaws, relying on plaintext community strings for access control.
* **SNMPv3:** The modern standard, featuring robust security enhancements. It introduces User-based Security Model (USM) authentication (via username and password) and payload encryption (via pre-shared keys). However, this augmented security inherently increases configuration and deployment complexity compared to v2c.

## 4. Service Configuration and Vulnerabilities

### The SNMP Daemon Configuration
The foundational settings for the SNMP service are defined within the daemon's configuration file, typically located at `/etc/snmp/snmpd.conf`. This file dictates listening IP addresses, ports, authorized MIBs, OIDs, and community strings.

To inspect an active configuration (excluding comments and empty lines):

    MikyRedHat@htb[/htb]$ cat /etc/snmp/snmpd.conf | grep -v "#" | sed -r '/^\s*$/d'

    sysLocation    Sitting on the Dock of the Bay
    sysContact     Me <me@example.org>
    sysServices    72
    master  agentx
    agentaddress  127.0.0.1,[::1]
    view   systemonly  included   .1.3.6.1.2.1.1
    rocommunity  public default -V systemonly

*Note: Security analysts and SysAdmins should actively configure and test SNMP daemons in isolated virtualized environments (Homelabs) to thoroughly understand the manpage directives.*

### Dangerous Administrative Settings
Misconfigurations within the daemon can lead to severe data exposure or unauthorized system modifications. Critical misconfigurations include:

| Directive | Security Implication |
| :--- | :--- |
| `rwuser noauth` | Grants read-write access to the entire OID tree without requiring authentication. |
| `rwcommunity <string> <IPv4>` | Grants full read-write access to the OID tree using a community string, often misconfigured to trust arbitrary source IPs. |
| `rwcommunity6 <string> <IPv6>`| The IPv6 equivalent of `rwcommunity`, exposing the same unrestricted access risks. |

## 5. Footprinting and Enumeration

During the reconnaissance phase of a penetration test, identifying valid community strings and enumerating the OID tree can yield critical infrastructure intelligence, including kernel versions, installed software packages, routing tables, and active processes.

### SNMPwalk
`snmpwalk` automates SNMP GETNEXT requests to traverse and query the OID tree. Once a valid community string (e.g., "public") is identified, it extracts extensive system information.

    MikyRedHat@htb[/htb]$ snmpwalk -v2c -c public 10.129.14.128

    iso.3.6.1.2.1.1.1.0 = STRING: "Linux htb 5.11.0-34-generic #36~20.04.1-Ubuntu SMP"
    iso.3.6.1.2.1.1.4.0 = STRING: "mrb3n@inlanefreight.htb"
    iso.3.6.1.2.1.25.1.4.0 = STRING: "BOOT_IMAGE=/boot/vmlinuz-5.11.0-34-generic"

### OneSixtyOne
`onesixtyone` is a high-speed SNMP scanner utilized to brute-force community strings. Administrators frequently map community strings to hostnames or internal naming conventions, making dictionary attacks highly effective when leveraging curated wordlists (e.g., SecLists).

    MikyRedHat@htb[/htb]$ sudo apt install onesixtyone
    MikyRedHat@htb[/htb]$ onesixtyone -c /opt/useful/seclists/Discovery/SNMP/snmp.txt 10.129.14.128

    Scanning 1 hosts, 3220 communities
    10.129.14.128 [public] Linux htb 5.11.0-37-generic

### Braa
Once a valid community string is compromised, `braa` acts as an ultra-fast mass SNMP scanner. It can recursively brute-force individual OIDs at high speeds to extract specific target data.

    MikyRedHat@htb[/htb]$ sudo apt install braa
    MikyRedHat@htb[/htb]$ braa public@10.129.14.128:.1.3.6.*

    10.129.14.128:20ms:.1.3.6.1.2.1.1.1.0:Linux htb 5.11.0-34-generic
    10.129.14.128:20ms:.1.3.6.1.2.1.1.4.0:mrb3n@inlanefreight.htb

# SNMP OID Resolution and Braa Enumeration

## Overview
`braa` is an ultra-fast mass SNMP scanner that implements its own lightweight SNMP stack without relying on standard Net-SNMP libraries. Due to its minimalist design, `braa` **does not include an ASN.1 parser**, which requires operators to supply explicit numerical Object Identifiers (OIDs) rather than symbolic names (e.g., `.1.3.6.1.2.1.1.5.0` instead of `system.sysName.0`).

## Methods to Determine Numerical OIDs

1. **Using Common/Standard OID References:**
   For typical security assessments, specific system branches are universally targeted based on standard MIB-2 and Host-Resources-MIB definitions:
   - System Information: `.1.3.6.1.2.1.1`
   - Network Interfaces: `.1.3.6.1.2.1.2`
   - Running Processes: `.1.3.6.1.2.1.25.4.2.1.2`
   - Installed Software: `.1.3.6.1.2.1.25.6.3.1.2`

2. **Translating Symbolic Names via `snmptranslate`:**
   When a specific MIB object name is known but its numerical OID is required, use the `snmptranslate` utility from the `snmp` package to query the local MIB database:

    snmptranslate -On -m ALL system.sysName.0

3. **Performing Broad Tree Walking with Wildcards:**
   If the exact leaf node is unknown, `braa` supports wildcard syntax (`*`) to traverse entire subtrees asynchronously:

    braa public@10.129.129.6:.1.3.6.1.2.1.25.*

## Execution Example with Braa
To query a specific OID branch or perform a targeted walk using `braa`:

    braa public@10.129.129.6:.1.3.6.1.2.1.25.4.2.1.2.*
    
# MySQL: Architecture, Enumeration, and Security Auditing

## 1. Overview and Architecture
MySQL is a highly performant, open-source Relational Database Management System (RDBMS) currently backed by Oracle. It operates on a client-server architecture, comprising the MySQL server (the core database engine responsible for data storage, processing, and distribution) and multiple MySQL clients.

Data is systematically organized into databases, containing tables comprised of columns, rows, and specific data types. Databases are commonly exported or backed up as standalone `.sql` files (e.g., `wordpress.sql`). MySQL is widely deployed in dynamic web application environments, frequently integrated into **LAMP** (Linux, Apache, MySQL, PHP) or **LEMP** (Linux, Nginx, MySQL, PHP) stacks. 

### MariaDB Fork
MariaDB is a popular, drop-in replacement fork of the original MySQL codebase. It was developed by the original MySQL founders following the Oracle acquisition to ensure an open-source alternative remained actively maintained.

## 2. Client Interaction and Data Management
MySQL clients interface with the database engine by transmitting Structured Query Language (SQL) statements. These queries handle data manipulation (inserting, deleting, modifying) and data retrieval. The service processes these queries and returns the requested data payloads (e.g., user credentials, application configurations, or dynamic content for a CMS like WordPress).

> **Security Note:** While MySQL *can* store sensitive data such as passwords in plain text, standard security practices dictate that web applications (via PHP or other backend languages) must encrypt or hash these credentials (e.g., one-way hashing algorithms) prior to database insertion.

## 3. Server Configuration and Security Posture
Database administration requires meticulous configuration management. The primary configuration file on Linux environments is typically located at `/etc/mysql/mysql.conf.d/mysqld.cnf`.

### Default Configuration Analysis

~~~bash
# Extracting active configurations (ignoring comments and empty lines)
MikyRedHat@htb[/htb]$ cat /etc/mysql/mysql.conf.d/mysqld.cnf | grep -v "#" | sed -r '/^\s*$/d'

[client]
port        = 3306
socket      = /var/run/mysqld/mysqld.sock

[mysqld]
user        = mysql
pid-file    = /var/run/mysqld/mysqld.pid
socket      = /var/run/mysqld/mysqld.sock
port        = 3306
basedir     = /usr
datadir     = /var/lib/mysql
tmpdir      = /tmp
~~~

### Critical Misconfigurations
A compromised server or Local File Inclusion (LFI) vulnerability can expose the MySQL configuration files. If permissions are improperly restricted, threat actors can extract plain-text credentials or exploit verbose debugging variables.

*   **`user`**: Defines the system account executing the MySQL daemon.
*   **`password`**: Hardcoded service passwords (highly critical if exposed).
*   **`admin_address`**: The specific network interface bound for administrative TCP/IP connections.
*   **`debug` & `sql_warnings`**: If enabled in a production environment, these cause information disclosure by outputting verbose backend errors directly to the web application. This data is frequently leveraged by attackers to map database structures for SQL Injection (SQLi) attacks.
*   **`secure_file_priv`**: Restricts data import/export operations (e.g., `LOAD DATA INFILE`). If misconfigured or disabled, it can lead to arbitrary file reads or remote code execution (RCE).

## 4. Service Footprinting and Enumeration
In secure environments, MySQL (default **TCP Port 3306**) should never be exposed to the public internet. However, temporary workarounds or administrative oversights often leave this port open.

### Nmap Scanning
To enumerate an exposed MySQL service, utilize Nmap's default scripting engine (`-sC`) and version detection (`-sV`).

~~~bash
MikyRedHat@htb[/htb]$ sudo nmap 10.129.14.128 -sV -sC -p3306 --script mysql*

PORT     STATE SERVICE      VERSION
3306/tcp open  mysql        MySQL 8.0.26-0ubuntu0.20.04.1
| mysql-enum:
|   Valid usernames:
|     root:<empty> - Valid credentials
|     admin:<empty> - Valid credentials
| mysql-info:
|   Protocol: 10
|   Version: 8.0.26-0ubuntu0.20.04.1
|   Thread ID: 13
|_  Auth Plugin Name: caching_sha2_password
~~~

*Note: Always manually verify automated scan results. Nmap scripts may flag false positives (e.g., indicating an empty root password when a fixed password is actually enforced).*

## 5. Command-Line Interaction
If valid credentials are obtained (via enumeration, brute-forcing, or configuration file extraction), you can authenticate and interact with the database engine.

~~~bash
# Authenticate to a remote MySQL server
# Note: Do NOT append a space between the '-p' flag and the password.
MikyRedHat@htb[/htb]$ mysql -u root -pP4SSw0rd -h 10.129.14.128
~~~

### Essential Administrative Queries
Once authenticated, the following SQL statements are standard for navigating and dumping database contents:

| Query | Technical Description |
| :--- | :--- |
| `show databases;` | Lists all available databases within the server instance. |
| `use <database>;` | Selects a specific database as the current working context. |
| `show tables;` | Enumerates all tables within the currently selected database. |
| `show columns from <table>;` | Displays column headers and data types for a specific table. |
| `select * from <table>;` | Retrieves all records/rows from the specified table. |
| `select * from <table> where <column> = "<string>";` | Executes a targeted query to filter and extract specific string values. |
| `select version();` | Outputs the current MySQL/MariaDB version. |

### System Databases
By default, MySQL contains built-in administrative databases:
*   **`information_schema`**: A standardized (ANSI/ISO) database containing metadata about all other databases, tables, and columns.
*   **`sys`**: A MySQL-specific system catalog containing performance metrics, active sessions, and internal engine configurations.

~~~sql
MySQL [(none)]> use sys;
MySQL [sys]> select host, unique_users from host_summary;
+-------------+--------------+
| host        | unique_users |
+-------------+--------------+
| 10.129.14.1 |            1 |
| localhost   |            2 |
+-------------+--------------+
~~~

# Microsoft SQL Server (MSSQL): Architecture, Configuration, and Enumeration Methodology

## 1. Technology Overview
Microsoft SQL Server (MSSQL) is a proprietary, closed-source relational database management system (RDBMS) developed by Microsoft. Primarily designed to run on Windows operating systems, it boasts native integration with the .NET framework, making it the standard database solution for .NET applications. While cross-platform versions exist for Linux and macOS, penetration testers and systems administrators will predominantly encounter MSSQL instances within Windows environments.

## 2. MSSQL Client Applications
Administrators and developers utilize various client-side applications to interact with the SQL Database Engine. These clients can be installed locally on the administrator's workstation, meaning valid database credentials or active sessions may be extracted from compromised endpoints across the domain, not just the database server itself.

**Common MSSQL Clients:**
*   **SQL Server Management Studio (SSMS):** The standard GUI tool provided by Microsoft for initial configuration, deployment, and long-term database management.
*   **Command-Line & Third-Party Tools:** `mssql-cli`, SQL Server PowerShell, HeidiSQL, and SQLPro.
*   **Impacket's mssqlclient.py:** A highly effective Python-based client integrated into the SecureAuthCorp Impacket library. It is widely used in offensive security for remote authentication and query execution. 

To locate the Impacket MSSQL client on a Linux-based attack host (e.g., Kali Linux):

    MikyRedHat@htb[/htb]$ locate mssqlclient
    /usr/bin/impacket-mssqlclient
    /usr/share/doc/python3-impacket/examples/mssqlclient.py

## 3. Default System Databases
Understanding the default database structure is critical for footprinting a target server. MSSQL deploys with several standard system databases, each serving a specific administrative or structural purpose.

| Database | System Function & Description |
| :--- | :--- |
| **master** | Tracks all system-level information, configurations, and metadata for the SQL Server instance. |
| **model** | Serves as the structural template for all newly created databases. Modifications to `model` are inherited by any subsequent database deployments. |
| **msdb** | Utilized by the SQL Server Agent for scheduling automated jobs, alerts, and backup procedures. |
| **tempdb** | A temporary workspace that stores temporary objects, tables, and intermediate query results. |
| **resource** | A read-only, hidden database containing all system objects deployed with the SQL Server instance. |

## 4. Default Configurations and Security Risks
By default, the SQL service executes under the `NT SERVICE\MSSQLSERVER` account. Network accessibility often relies on **Windows Authentication**, allowing the underlying OS to process login requests via the local SAM database or an Active Directory (AD) Domain Controller. 

While AD integration centralizes auditing and Access Control Lists (ACLs), a compromised AD account can facilitate lateral movement and privilege escalation across the domain via the database instance.

### Misconfiguration Vectors (IT Administrator Perspective)
Due to operational pace and complex deployments, administrators may inadvertently introduce vulnerabilities. Critical misconfigurations to audit include:
*   **Cleartext Authentication:** MSSQL clients connecting to the server without enforced encryption.
*   **Cryptographic Flaws:** The utilization of self-signed certificates for encryption, which are vulnerable to spoofing and Man-in-the-Middle (MitM) attacks.
*   **Protocol Risks:** Unrestricted enablement of Named Pipes over the network.
*   **Default Credentials:** Failure to disable or secure the default `sa` (System Administrator) account, leaving it vulnerable to brute-force attacks.

## 5. Service Footprinting and Enumeration
Detailed enumeration of the MSSQL service (default TCP port `1433`) is required to map the attack surface. 

### Method A: Nmap Scripting Engine (NSE)
Executing targeted NSE scripts retrieves hostname, instance name, versioning, and determines if Named Pipes are active.

    MikyRedHat@htb[/htb]$ sudo nmap --script ms-sql-info,ms-sql-empty-password,ms-sql-xp-cmdshell,ms-sql-config,ms-sql-ntlm-info,ms-sql-tables,ms-sql-hasdbaccess,ms-sql-dac,ms-sql-dump-hashes --script-args mssql.instance-port=1433,mssql.username=sa,mssql.password=,mssql.instance-name=MSSQLSERVER -sV -p 1433 10.129.201.248

    Starting Nmap 7.91 ( https://nmap.org )
    PORT     STATE SERVICE  VERSION
    1433/tcp open  ms-sql-s Microsoft SQL Server 2019 15.00.2000.00; RTM
    | ms-sql-ntlm-info: 
    |   Target_Name: SQL-01
    |   NetBIOS_Domain_Name: SQL-01
    |_  Product_Version: 10.0.17763
    | ms-sql-info: 
    |   Windows server name: SQL-01
    |   10.129.201.248\MSSQLSERVER: 
    |     Instance name: MSSQLSERVER
    |     TCP port: 1433
    |     Named pipe: \\10.129.201.248\pipe\sql\query

### Method B: Metasploit Framework Auxiliary Modules
The `mssql_ping` module provides rapid asset discovery and instance metadata extraction.

    msf6 auxiliary(scanner/mssql/mssql_ping) > set rhosts 10.129.201.248
    msf6 auxiliary(scanner/mssql/mssql_ping) > run

    [*] 10.129.201.248:       - SQL Server information for 10.129.201.248:
    [+] 10.129.201.248:       -    ServerName      = SQL-01
    [+] 10.129.201.248:       -    InstanceName    = MSSQLSERVER
    [+] 10.129.201.248:       -    Version         = 15.0.2000.5
    [+] 10.129.201.248:       -    tcp             = 1433
    [+] 10.129.201.248:       -    np              = \\SQL-01\pipe\sql\query

## 6. Remote Interaction (Impacket)
Upon acquiring valid credentials, `mssqlclient.py` enables direct interaction with the SQL Database Engine using T-SQL (Transact-SQL). The `-windows-auth` flag explicitly forces NTLM/Kerberos authentication.

    MikyRedHat@htb[/htb]$ python3 mssqlclient.py Administrator@10.129.201.248 -windows-auth
    
    Impacket v0.9.22 - Copyright 2020 SecureAuth Corporation
    Password:
    [*] Encryption required, switching to TLS
    [*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
    [*] INFO(SQL-01): Line 1: Changed database context to 'master'.
    
    SQL> select name from sys.databases
    
    name                                                                                                                             
    --------------------------------------------------------------------------------------
    master                                                                                                                           
    tempdb                                                                                                                           
    model                                                                                                                            
    msdb                                                                                                                             
    Transactions

    # Oracle TNS (Transparent Network Substrate) Enumeration & Exploitation

## Overview
The Oracle Transparent Network Substrate (TNS) is a proprietary communication protocol designed to facilitate secure and efficient interaction between Oracle databases and client applications over networks. Originally introduced as a core component of the Oracle Net Services suite, TNS supports multiple networking protocols, including IPX/SPX and TCP/IP stacks. Its robust architecture—featuring built-in encryption, load balancing, and fault tolerance—makes it an industry standard for managing complex databases in highly regulated sectors such as healthcare and finance.

Modern iterations of TNS have been upgraded to support IPv6 and SSL/TLS encryption. This ensures data integrity and protects against unauthorized interception across the network layer. Additionally, the service provides advanced administrative capabilities, including performance monitoring, workload management, and comprehensive error logging.

## Default Configuration and Architecture
The default configuration of the Oracle TNS server varies depending on the specific version and edition of the Oracle software. However, fundamental settings remain consistent across deployments:
*   **Default Port:** The listener operates on `TCP/1521` by default, though this can be modified during installation or via configuration files.
*   **Protocol Support:** Configured to support a wide array of network protocols (TCP/IP, UDP, IPX/SPX, AppleTalk) across multiple network interfaces.
*   **Management Constraints:** Remote management is permitted by default in Oracle 8i/9i but restricted in Oracle 10g/11g.

### Core Configuration Files
TNS configuration relies heavily on two plaintext files typically located in the `$ORACLE_HOME/network/admin` directory:

#### 1. `tnsnames.ora` (Client-Side)
This file is used by client applications to resolve service names to network addresses. Each database or service requires a unique entry containing the service name, network location, and connection parameters.

```text
ORCL =
  (DESCRIPTION =
    (ADDRESS_LIST =
      (ADDRESS = (PROTOCOL = TCP)(HOST = 10.129.11.102)(PORT = 1521))
    )
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = orcl)
    )
  )
```

#### 2. `listener.ora` (Server-Side)
This configuration file defines the listener process's properties and parameters. The listener is responsible for receiving incoming client requests and routing them to the appropriate database instance.

```text
SID_LIST_LISTENER =
  (SID_LIST =
    (SID_DESC =
      (SID_NAME = PDB1)
      (ORACLE_HOME = C:\oracle\product\19.0.0\dbhome_1)
      (GLOBAL_DBNAME = PDB1)
      (SID_DIRECTORY_LIST =
        (SID_DIRECTORY =
          (DIRECTORY_TYPE = TNS_ADMIN)
          (DIRECTORY = C:\oracle\product\19.0.0\dbhome_1\network\admin)
        )
      )
    )
  )

LISTENER =
  (DESCRIPTION_LIST =
    (DESCRIPTION =
      (ADDRESS = (PROTOCOL = TCP)(HOST = orcl.inlanefreight.htb)(PORT = 1521))
      (ADDRESS = (PROTOCOL = IPC)(KEY = EXTPROC1521))
    )
  )

ADR_BASE_LISTENER = C:\oracle
```

### Connection Attributes Reference

| Setting | Description |
| :--- | :--- |
| **DESCRIPTION** | A descriptor providing the database name and connection type. |
| **ADDRESS** | The network address of the database (hostname and port number). |
| **PROTOCOL** | The network protocol utilized for server communication. |
| **PORT** | The specific port number for communication (Default: 1521). |
| **CONNECT_DATA** | Connection attributes, including service name/SID, protocol, and instance identifier. |
| **INSTANCE_NAME** | The target database instance identifier. |
| **SERVICE_NAME** | The specific service the client intends to connect to. |
| **SERVER** | The connection architecture type (e.g., dedicated or shared). |
| **USER / PASSWORD** | Authentication credentials for the database server. |
| **SECURITY** | The security protocol designated for the connection. |
| **VALIDATE_CERT** | Boolean flag to validate the SSL/TLS certificate. |
| **SSL_VERSION** | The designated SSL/TLS version for the connection. |
| **CONNECT_TIMEOUT** | Client timeout limit (in seconds) to establish a connection. |

*Note: Database administrators often deploy a `PlsqlExclusionList` (placed in `$ORACLE_HOME/sqldeveloper`) to serve as a blacklist, preventing the execution of specific PL/SQL packages via the Oracle Application Server.*

---

## Environment Setup for Penetration Testing
Before engaging with the TNS listener, specific toolsets must be deployed. We will configure **ODAT** (Oracle Database Attacking Tool) and **SQL*Plus**.

### 1. Installing ODAT
ODAT is an open-source framework developed in Python, engineered to enumerate and exploit vulnerabilities (SQLi, RCE, Privilege Escalation) within Oracle databases.

```bash
# Update repositories and install dependencies
sudo apt-get update
sudo apt-get install -y build-essential python3-dev libaio1 python3-scapy libgmp-dev

# Install cx_Oracle
cd ~
wget [https://files.pythonhosted.org/packages/source/c/cx_Oracle/cx_Oracle-8.3.0.tar.gz](https://files.pythonhosted.org/packages/source/c/cx_Oracle/cx_Oracle-8.3.0.tar.gz)
tar xzf cx_Oracle-8.3.0.tar.gz
cd cx_Oracle-8.3.0
python3 setup.py build
sudo python3 setup.py install

# Clone and build ODAT
cd ~
git clone [https://github.com/quentinhardy/odat.git](https://github.com/quentinhardy/odat.git)
cd odat/
git submodule init
git submodule update

# Install Python modules
sudo pip3 install colorlog termcolor passlib python-libnmap pycryptodome openpyxl

# Verify ODAT installation
./odat.py -h
```

### 2. Installing SQL*Plus
SQL*Plus is Oracle's standard command-line utility for database interaction.

```bash
sudo apt update
sudo apt upgrade parrot-core
sudo apt install oracle-instantclient-sqlplus

# Troubleshooting missing shared libraries (if required):
sudo sh -c "echo /usr/lib/oracle/12.2/client64/lib > /etc/ld.so.conf.d/oracle-instantclient.conf"
sudo ldconfig

# Verify SQL*Plus installation
sqlplus -v
```

---

## Enumeration and Exploitation Workflow

### 1. Port Scanning and Service Detection
Identify active Oracle TNS instances using Nmap.

```bash
sudo nmap -p1521 -sV 10.129.204.235 --open
```

### 2. SID Enumeration (Bruteforcing)
A System Identifier (SID) uniquely identifies a database instance. If a client provides an invalid SID, the connection drops. We can bruteforce the SID using Nmap scripts.

```bash
sudo nmap -p1521 -sV 10.129.204.235 --open --script oracle-sid-brute
```
*(Expected Output: Identified SID, e.g., `XE`)*

### 3. Credential Harvesting with ODAT
Execute a comprehensive scan against the target to identify valid credentials, locked accounts, and potential vulnerabilities.

```bash
./odat.py all -s 10.129.204.235
```
*(Example finding: `[+] Valid credentials found: scott/tiger`)*

### 4. Database Interaction via SQL*Plus
Authenticate to the database using the compromised credentials and the discovered SID.

```bash
sqlplus scott/tiger@10.129.204.235/XE
```

Once connected, enumerate current privileges and available tables:
```sql
SQL> select table_name from all_tables;
SQL> select * from user_role_privs;
```

### 5. Privilege Escalation (SYSDBA)
If the compromised account possesses administrative rights, attempt to escalate privileges to System Database Admin (`sysdba`).

```bash
sqlplus scott/tiger@10.129.204.235/XE as sysdba
```

Verify the elevated privileges:
```sql
SQL> select * from user_role_privs;
```

### 6. Post-Exploitation: Credential Extraction
With `sysdba` access, extract password hashes directly from the `sys.user$` table for offline cracking.

```sql
SQL> select name, password from sys.user$;
```

### 7. Post-Exploitation: File Upload (Web Shell Deployment)
If the target infrastructure hosts a web server, we can leverage ODAT's `utlfile` module to upload files (e.g., a web shell) to standard web directories (`/var/www/html` for Linux, `C:\inetpub\wwwroot` for Windows).

```bash
# Create a payload file
echo "Oracle File Upload Test" > testing.txt

# Upload via ODAT
./odat.py utlfile -s 10.129.204.235 -d XE -U scott -P tiger --sysdba --putFile C:\\inetpub\\wwwroot testing.txt ./testing.txt
```

Verify the successful upload via a standard HTTP GET request:
```bash
curl -X GET [http://10.129.204.235/testing.txt](http://10.129.204.235/testing.txt)
```