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

