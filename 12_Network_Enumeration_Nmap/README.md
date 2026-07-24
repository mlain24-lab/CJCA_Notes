# 12_Network_Enumeration_Nmap
# Enumeration: The Core of Penetration Testing

## Overview
Enumeration is arguably the most critical phase of the penetration testing lifecycle. The true art and difficulty of hacking do not lie in gaining access, but rather in identifying **all potential attack vectors** against a target. 

The primary goal is to collect as much actionable information as possible. The broader our information base, the easier it becomes to identify and exploit vulnerabilities.

## The Philosophy of Enumeration: Knowledge Over Tools
Tools are simply aids; they should never replace fundamental knowledge, critical thinking, and attention to detail. It is not enough to blindly run automated scanners. Effective enumeration requires:
- Actively interacting with individual services.
- Analyzing the specific information and capabilities those services expose.
- Deeply understanding how underlying technologies and protocols function.
- Mastering the syntax required for effective communication with target services.

> **The "Lost Keys" Analogy:**
> If you lose your keys and someone tells you they are "in the living room," finding them will be a time-consuming trial-and-error process. However, if they say the keys are "in the living room, on the white shelf, next to the TV, in the third drawer," the search becomes trivial. Enumeration provides this exact level of precision for exploiting a target system.

## Core Objectives of the Enumeration Phase
Once a valid attack vector is mapped out, gaining access is often straightforward. The enumeration phase narrows down the attack surface to two primary focal points:
1. **Interactive Functions & Resources:** Identifying services that allow direct interaction or provide additional system insights.
2. **Pivotal Information:** Discovering data that acts as a stepping stone to uncover deeper vulnerabilities or administrative access points.

### The Root Cause: Misconfigurations
The vast majority of discovered vulnerabilities stem from **misconfigurations** or a weak security posture. These often arise from administrative ignorance or a flawed security mindset—such as relying entirely on perimeter defenses (Firewalls), Group Policy Objects (GPOs), and automated patch management, while neglecting service-level hardening.

## The Pitfalls of Automated Scanning & Manual Enumeration
"Enumeration is the key" is a common industry mantra, yet it is frequently misunderstood. Many beginners assume they are stuck because they haven't deployed the *right tool*. In reality, they lack the foundational understanding of the service they are targeting.

Investing time to understand a service's architecture and intended use cases saves hours (or days) of aimless scanning and troubleshooting.

### Automated Tools vs. Manual Enumeration
While scanning tools significantly accelerate the reconnaissance process, they possess critical blind spots. 

**The Timeout Trap:**
Network scanners (like Nmap) rely on strict timeouts when awaiting a response from a specific port or service. If the service fails to respond within the designated threshold, the scanner will classify the port as *closed*, *filtered*, or *unknown*. 
- If flagged as *filtered* or *unknown*, an analyst knows further investigation is required.
- If falsely flagged as **closed**, a critical entry point is entirely overlooked. This false negative can cost valuable time and potentially mask the only viable attack vector.

**Conclusion:** Manual enumeration is mandatory. Never rely solely on automated tool outputs without verifying edge cases and understanding the underlying network behavior.

# Introduction to Nmap (Network Mapper)

## Overview
**Nmap (Network Mapper)** is an industry-standard, open-source tool written in C, C++, Python, and Lua, widely utilized for network analysis and security auditing. It leverages raw IP packets in novel ways to determine:
- Available hosts on a network (**Host Discovery**).
- Open ports and available services (**Service Enumeration**).
- Operating systems and exact versions (**OS Detection**).
- The presence and configuration of packet filters, firewalls, and Intrusion Detection Systems (IDS).

## Core Use Cases
Nmap is an essential utility for Network Administrators and Penetration Testers. Its primary applications include:
- **Security Auditing:** Evaluating the security posture of network perimeters.
- **Penetration Testing:** Simulating external/internal attacks and mapping attack surfaces.
- **Firewall & IDS/IPS Evasion:** Testing the resilience and rulesets of defensive appliances.
- **Network Mapping:** Visualizing network topologies and identifying possible connection types.
- **Vulnerability Assessment:** Leveraging the Nmap Scripting Engine (NSE) for advanced scanning and exploit detection.

---

## Nmap Architecture & Scanning Phases
Nmap's execution workflow can be logically divided into the following sequential techniques depending on the required depth of the scan:

1. **Host Discovery:** Identifying live targets (e.g., Ping sweeps).
2. **Port Scanning:** Determining open ports on the identified live targets.
3. **Service Enumeration & Detection:** Identifying specific applications and their versions running on open ports.
4. **OS Detection:** Fingerprinting the target's operating system.
5. **Nmap Scripting Engine (NSE):** Scriptable interaction with target services for advanced enumeration or vulnerability detection.

---

## Core Syntax
The basic structure of an Nmap command follows this straightforward syntax:
```bash
nmap <scan types> <options> <target>
```

---

## Scan Techniques
Nmap provides a versatile suite of scanning techniques, manipulating TCP/UDP packets to elicit specific responses from the target network stack.

### Common Scan Flags (From `nmap --help`)
```bash
SCAN TECHNIQUES:
  -sS/sT/sA/sW/sM: TCP SYN/Connect()/ACK/Window/Maimon scans
  -sU:             UDP Scan
  -sN/sF/sX:       TCP Null, FIN, and Xmas scans
  --scanflags <flags>: Customize TCP scan flags
  -sI <zombie host[:probeport]>: Idle scan
  -sY/sZ:          SCTP INIT/COOKIE-ECHO scans
  -sO:             IP protocol scan
  -b <FTP host relay>: FTP bounce scan
```

### TCP-SYN Scan (`-sS`)
Also known as a **Stealth Scan** or **Half-Open Scan**, this is the default Nmap scan method (when run with root/sudo privileges) and the most popular technique. It is extremely fast, capable of scanning thousands of ports per second while remaining relatively stealthy.

**How it works (The Interrupted 3-Way Handshake):**
The TCP-SYN scan sends a single packet with the `SYN` flag set but **never completes the full TCP 3-way handshake**.

- **Open Port:** Target replies with a `SYN-ACK` packet. Nmap logs the port as open and immediately tears down the connection by sending an `RST` (Reset) packet.
- **Closed Port:** Target replies with an `RST` packet. Nmap logs the port as closed.
- **Filtered Port:** No response is received (or an ICMP unreachable error is returned). Nmap assumes a firewall or IDS/IPS is silently dropping the packets.

#### Example: TCP-SYN Scan against Localhost
```bash
MikyRedHat@htb[/htb]$ sudo nmap -sS localhost

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-11 22:50 UTC
Nmap scan report for localhost (127.0.0.1)
Host is up (0.000010s latency).
Not shown: 996 closed ports
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
5432/tcp open  postgresql
5901/tcp open  vnc-1

Nmap done: 1 IP address (1 host up) scanned in 0.18 seconds
```

> **Data Interpretation:** The output displays four discovered open TCP ports. The first column defines the port number and protocol, the second column displays the state (`open`), and the third column maps the standard service associated with that port (e.g., `ssh` for 22, `http` for 80).

# Nmap: Host Discovery & Network Enumeration

## 1. Overview
During an internal penetration test, the first step is to map the network and identify active hosts. Before scanning for open ports or specific vulnerabilities, we must establish which systems are online. 

Nmap offers multiple host discovery strategies to determine the status of a target. The most effective baseline method utilizes **ICMP Echo Requests**, though real-world environments often require bypassing firewall restrictions. Furthermore, maintaining a disciplined methodology by logging every scan is critical for documentation, reporting, and cross-tool comparison.

---

## 2. Scanning Network Ranges
To actively discover systems across a subnet, we can scan an entire Classless Inter-Domain Routing (CIDR) range.

```bash
sudo nmap 10.129.2.0/24 -sn -oA tnet | grep for | cut -d" " -f5
```

| Flag / Option | Description |
| :--- | :--- |
| `10.129.2.0/24` | Target network range (CIDR notation). |
| `-sn` | Disables port scanning (Host discovery only). |
| `-oA tnet` | Outputs the scan results in all three major formats (Normal, XML, Grepable) starting with the filename 'tnet'. |

*Note: This scanning method relies on firewalls permitting ICMP traffic. If hosts silently drop ICMP packets, alternative host discovery techniques (like TCP SYN/ACK pinging) are required to bypass IDS/Firewalls.*

---

## 3. Scanning from Target Lists
In enterprise environments or specific pentest engagements, scope limitations often require testing a predefined list of IPs. Nmap seamlessly handles bulk target ingestion from local files.

**Target File (`hosts.lst`):**
```text
10.129.2.4
10.129.2.10
10.129.2.11
```

**Execution:**
```bash
sudo nmap -sn -oA tnet -iL hosts.lst | grep for | cut -d" " -f5
```

| Flag / Option | Description |
| :--- | :--- |
| `-iL hosts.lst` | Instructs Nmap to read target specifications from the provided input list (`hosts.lst`). |

If Nmap returns fewer active hosts than the list contains, the "missing" hosts might be offline or configured to drop default ICMP Echo Requests.

---

## 4. Scanning Multiple Specific IPs
For localized scanning where a full CIDR or external list is unnecessary, multiple IP addresses can be defined inline.

**Space-separated IPs:**
```bash
sudo nmap -sn -oA tnet 10.129.2.18 10.129.2.19 10.129.2.20 | grep for | cut -d" " -f5
```

**Octet ranges:**
```bash
sudo nmap -sn -oA tnet 10.129.2.18-20 | grep for | cut -d" " -f5
```

---

## 5. Single Host Scanning & Traffic Analysis
To understand Nmap's underlying mechanisms, we can analyze the packet-level behavior during a single IP scan. By default, if we disable port scanning (`-sn`) on a local network target, Nmap attempts an **ARP Ping** before sending an ICMP Echo Request.

```bash
sudo nmap 10.129.2.18 -sn -oA host -PE --packet-trace
```

| Flag / Option | Description |
| :--- | :--- |
| `-PE` | Forces Nmap to perform host discovery using standard ICMP Echo Requests. |
| `--packet-trace` | Displays all network packets sent and received during the scan for deep troubleshooting. |

**Packet Trace Output Analysis:**
Even with `-PE` specified, Nmap prioritizes ARP resolution on local ethernet networks:
1. `SENT: ARP who-has 10.129.2.18 tell 10.10.14.2`
2. `RCVD: ARP reply 10.129.2.18 is-at DE:AD:00:00:BE:EF`

To confirm *why* Nmap marked the host as alive, append the `--reason` flag:
```bash
sudo nmap 10.129.2.18 -sn -oA host -PE --reason
```
*Result:* `Host is up, received arp-response...`

### Bypassing ARP Ping for ICMP Validation
To strictly test ICMP responses and disable Nmap's default ARP behavior, use the `--disable-arp-ping` flag. This forces Nmap to rely purely on Layer 3 routing for discovery.

```bash
sudo nmap 10.129.2.18 -sn -oA host -PE --packet-trace --disable-arp-ping
```

**Packet Trace Output Analysis (Post-ARP Disable):**
1. `SENT: ICMP Echo request (type=8/code=0)`
2. `RCVD: ICMP Echo reply (type=0/code=0)`

### 💡 Key Takeaway
Attention to packet-level details is crucial for a Cybersecurity Analyst or SysAdmin. Understanding whether a host responds to ARP (Layer 2) or ICMP (Layer 3) dictates our enumeration strategy and helps accurately footprint the network topology.

> **Further Reading:** [Nmap Official Documentation: Host Discovery Strategies](https://nmap.org/book/host-discovery-strategies.html)

# Host and Port Scanning

Understanding how scanning tools operate, perform, and process different functions is essential for accurate result interpretation. Analyzing specific scanning methods allows us to build a precise system profile once a target is confirmed alive. 

The primary information required includes:
* Open ports and their associated services
* Service versions
* Service-provided information
* Operating system details

## Port States Overview

Nmap classifies scanned ports into six distinct states:

| State | Description |
| :--- | :--- |
| **open** | The connection to the scanned port has been successfully established (TCP connections, UDP datagrams, or SCTP associations). |
| **closed** | The TCP protocol indicates an `RST` flag in the returned packet, showing the port is accessible but no service is listening. This method can also determine if a target is alive. |
| **filtered** | Nmap cannot definitively identify whether the port is open or closed because no response is returned (dropped) or an error code is received from the target (rejected). |
| **unfiltered** | Occurs exclusively during TCP-ACK scans, indicating the port is accessible but its open/closed status cannot be determined. |
| **open/filtered** | Assigned when no response is received for a specific port, indicating a firewall or packet filter may be protecting it. |
| **closed/filtered** | Occurs exclusively in IP ID idle scans, indicating it is impossible to determine whether the port is closed or filtered. |

## Discovering Open TCP Ports

By default, Nmap scans the top 1000 TCP ports using a SYN scan (`-sS`). This scan defaults to SYN only when executed with root privileges due to the socket permissions required for raw TCP packet creation; otherwise, a TCP connect scan (`-sT`) is performed. 

Ports can be defined individually (`-p 22,25,80,139,445`), by range (`-p 22-445`), via top frequent ports from the Nmap database (`--top-ports=10`), through a full port scan (`-p-`), or via a fast port scan containing the top 100 ports (`-F`).

### Scanning Top 10 TCP Ports

```shellsession
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 --top-ports=10 

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-15 15:36 CEST
Nmap scan report for 10.129.2.28
Host is up (0.021s latency).

PORT     STATE    SERVICE
21/tcp   closed   ftp
22/tcp   open     ssh
23/tcp   closed   telnet
25/tcp   open     smtp
80/tcp   open     http
110/tcp  open     pop3
139/tcp  filtered netbios-ssn
443/tcp  closed   https
445/tcp  filtered microsoft-ds
3389/tcp closed   ms-wbt-server
MAC Address: DE:AD:00:00:BE:EF (Intel Corporate)

Nmap done: 1 IP address (1 host up) scanned in 1.44 seconds
```

To analyze the SYN scan clearly, network noise can be isolated by disabling ICMP echo requests (`-Pn`), DNS resolution (`-n`), and ARP ping scans (`--disable-arp-ping`).

```shellsession
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p 21 --packet-trace -Pn -n --disable-arp-ping

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-15 15:39 CEST
SENT (0.0429s) TCP 10.10.14.2:63090 > 10.129.2.28:21 S ttl=56 id=57322 iplen=44  seq=1699105818 win=1024 <mss 1460>
RCVD (0.0573s) TCP 10.129.2.28:21 > 10.10.14.2:63090 RA ttl=64 id=0 iplen=40  seq=0 win=0
Nmap scan report for 10.129.2.28
Host is up (0.014s latency).

PORT   STATE  SERVICE
21/tcp closed ftp
MAC Address: DE:AD:00:00:BE:EF (Intel Corporate)

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds
```

### Packet Trace Analysis

* **SENT Line:** Indicates Nmap sent a TCP packet with the SYN flag (`S`) from the source IPv4 and port to the target IPv4 and port, along with TCP header parameters (`ttl`, `id`, `iplen`, `seq`, `win`, `mss`).
* **RCVD Line:** Indicates the target responded with a TCP packet containing RST and ACK flags (`RA`) to acknowledge receipt (`ACK`) and terminate the TCP session (`RST`).

## Connect Scan

The Nmap TCP Connect Scan (`-sT`) leverages the standard TCP three-way handshake to determine port states. An SYN packet is sent, expecting an SYN-ACK response for an open port or an RST response for a closed port.

While highly accurate and stable because it completes the full handshake without causing service instability, it is one of the least stealthy techniques. It fully establishes connections, generating logs on most systems and triggering modern IDS/IPS solutions. Conversely, SYN scans (half-open scans) leave the connection incomplete, minimizing log generation footprint.

```shellsession
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p 443 --packet-trace --disable-arp-ping -Pn -n --reason -sT 

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-15 16:26 CET
CONN (0.0385s) TCP localhost > 10.129.2.28:443 => Operation now in progress
CONN (0.0396s) TCP localhost > 10.129.2.28:443 => Connected
Nmap scan report for 10.129.2.28
Host is up, received user-set (0.013s latency).

PORT    STATE SERVICE REASON
443/tcp open  https   syn-ack

Nmap done: 1 IP address (1 host up) scanned in 0.04 seconds
```

## Filtered Ports & Firewall Behavior

Filtered states typically result from firewall rules handling connections via dropped or rejected packets:
* **Dropped Packets:** Nmap receives no response and resends the request based on the retry rate (`--max-retries`, default is 10).
* **Rejected Packets:** Firewalls return an ICMP reply (Type 3, Code 3) indicating the port is unreachable.

```shellsession
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p 445 --packet-trace -n --disable-arp-ping -Pn

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-15 15:55 CEST
SENT (0.0388s) TCP 10.129.2.28:52472 > 10.129.2.28:445 S ttl=49 id=21763 iplen=44  seq=1418633433 win=1024 <mss 1460>
RCVD (0.0487s) ICMP [10.129.2.28 > 10.129.2.28 Port 445 unreachable (type=3/code=3) ] IP [ttl=64 id=20998 iplen=72 ]
Nmap scan report for 10.129.2.28
Host is up (0.0099s latency).

PORT    STATE    SERVICE
445/tcp filtered microsoft-ds
MAC Address: DE:AD:00:00:BE:EF (Intel Corporate)

Nmap done: 1 IP address (1 host up) scanned in 0.05 seconds
```

## Discovering Open UDP Ports

Because UDP is a stateless protocol requiring no three-way handshake, scans (`-sU`) do not receive acknowledgment packets, resulting in longer timeouts and slower scan speeds. Nmap sends empty datagrams; open ports only respond if the target application is configured to do so.

```shellsession
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -F -sU

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-15 16:01 CEST
Nmap scan report for 10.129.2.28
Host is up (0.059s latency).
Not shown: 95 closed ports
PORT     STATE         SERVICE
68/udp   open|filtered dhcpc
137/udp  open          netbios-ns
138/udp  open|filtered netbios-dgm
631/udp  open|filtered ipp
5353/udp open          zeroconf
MAC Address: DE:AD:00:00:BE:EF (Intel Corporate)

Nmap done: 1 IP address (1 host up) scanned in 98.07 seconds
```

* An ICMP response with error code 3 (port unreachable) indicates a closed UDP port.
* Other ICMP responses mark ports as `open|filtered`.

## Version Scan

The version scan option (`-sV`) extracts additional technical details from open ports, identifying specific service names, product versions, and system details through targeted probe responses.

```shellsession
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -Pn -n --disable-arp-ping --packet-trace -p 445 --reason  -sV

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2022-11-04 11:10 GMT
SENT (0.3426s) TCP 10.10.14.2:44641 > 10.129.2.28:445 S ttl=55 id=43401 iplen=44  seq=3589068008 win=1024 <mss 1460>
RCVD (0.3556s) TCP 10.129.2.28:445 > 10.10.14.2:44641 SA ttl=63 id=0 iplen=44  seq=2881527699 win=29200 <mss 1337>
NSOCK INFO [0.4980s] nsock_iod_new2(): nsock_iod_new (IOD #1)
NSOCK INFO [0.4980s] nsock_connect_tcp(): TCP connection requested to 10.129.2.28:445 (IOD #1) EID 8
NSOCK INFO [0.5130s] nsock_trace_handler_callback(): Callback: CONNECT SUCCESS for EID 8 [10.129.2.28:445]
Service scan sending probe NULL to 10.129.2.28:445 (tcp)
NSOCK INFO [0.5130s] nsock_read(): Read request from IOD #1 [10.129.2.28:445] (timeout: 6000ms) EID 18
NSOCK INFO [6.5190s] nsock_trace_handler_callback(): Callback: READ TIMEOUT for EID 18 [10.129.2.28:445]
Service scan sending probe SMBProgNeg to 10.129.2.28:445 (tcp)
NSOCK INFO [6.5190s] nsock_write(): Write request for 168 bytes to IOD #1 EID 27 [10.129.2.28:445]
NSOCK INFO [6.5190s] nsock_read(): Read request from IOD #1 [10.129.2.28:445] (timeout: 5000ms) EID 34
NSOCK INFO [6.5190s] nsock_trace_handler_callback(): Callback: WRITE SUCCESS for EID 27 [10.129.2.28:445]
NSOCK INFO [6.5320s] nsock_trace_handler_callback(): Callback: READ SUCCESS for EID 34 [10.129.2.28:445] (135 bytes)
Service scan match (Probe SMBProgNeg matched with SMBProgNeg line 13836): 10.129.2.28:445 is netbios-ssn.  Version: |Samba smbd|3.X - 4.X|workgroup: WORKGROUP|
NSOCK INFO [6.5320s] nsock_iod_delete(): nsock_iod_delete (IOD #1)
Nmap scan report for 10.129.2.28
Host is up, received user-set (0.013s latency).

PORT    STATE SERVICE      REASON         VERSION
445/tcp open  netbios-ssn  syn-ack ttl 63 Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
Service Info: Host: Ubuntu

Service detection performed. Please report any incorrect results at [https://nmap.org/submit/](https://nmap.org/submit/) .
Nmap done: 1 IP address (1 host up) scanned in 6.55 seconds
```

# Nmap Scan Output Management & Reporting Formats

Maintaining comprehensive records of network scans is a critical operational procedure during any enumeration phase. Persistent scan data enables differential analysis, baseline comparisons, and the parsing of results using various text-processing utilities. Nmap inherently supports multiple output formats to accommodate both programmatic data ingestion and human readability.

## Supported Export Formats

Nmap can generate output in three primary formats, which can be executed individually or simultaneously:

*   **Normal Output (`-oN`):** Generates a `.nmap` file. It mirrors the standard interactive terminal output.
*   **Grepable Output (`-oG`):** Generates a `.gnmap` file. Highly optimized for data extraction and text processing using command-line utilities (e.g., `grep`, `awk`, `sed`).
*   **XML Output (`-oX`):** Generates a `.xml` file. This is the industry standard for programmatic parsing, automation pipelines, and importing scan data into external frameworks like Metasploit.
*   **Output All (`-oA`):** Generates all three aforementioned formats simultaneously, providing full coverage for any subsequent analysis.

### Execution Example

To execute a comprehensive scan across all TCP ports and save the output in all formats, append the `-oA` flag followed by the base filename (e.g., `target`). If no absolute path is specified, the output files will be stored in the current working directory.

```shell
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p- -oA target

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-16 12:14 CEST
Nmap scan report for 10.129.2.28
Host is up (0.0091s latency).
Not shown: 65525 closed ports
PORT   STATE SERVICE
22/tcp open  ssh
25/tcp open  smtp
80/tcp open  http
MAC Address: DE:AD:00:00:BE:EF (Intel Corporate)

Nmap done: 1 IP address (1 host up) scanned in 10.22 seconds
```

**Command Breakdown:**
*   `10.129.2.28`: The designated target IP address.
*   `-p-`: Instructs Nmap to aggressively scan all 65,535 TCP ports.
*   `-oA target`: Directs the tool to output the results in all three core formats, prepending the 'target' prefix to each file extension.

Verifying the generated output files:

```shell
MikyRedHat@htb[/htb]$ ls
target.gnmap target.xml  target.nmap
```

## File Format Analysis & Data Parsing

### 1. Normal Output (`.nmap`)
Retains the human-readable structure exactly as it was presented during the live terminal execution.

```shell
MikyRedHat@htb[/htb]$ cat target.nmap
# Nmap 7.80 scan initiated Tue Jun 16 12:14:53 2020 as: nmap -p- -oA target 10.129.2.28
Nmap scan report for 10.129.2.28
Host is up (0.053s latency).
Not shown: 4 closed ports
...
```

### 2. Grepable Output (`.gnmap`)
Condenses the scan results into single-line entries per host. This formatting streamlines data extraction, allowing SysAdmins and Pentesters to pipe the output directly into Bash scripts.

```shell
MikyRedHat@htb[/htb]$ cat target.gnmap
# Nmap 7.80 scan initiated Tue Jun 16 12:14:53 2020 as: nmap -p- -oA target 10.129.2.28
Host: 10.129.2.28 ()    Status: Up
Host: 10.129.2.28 ()    Ports: 22/open/tcp//ssh///, 25/open/tcp//smtp///, 80/open/tcp//http///  Ignored State: closed (4)
```

### 3. XML Output (`.xml`) & HTML Rendering
The XML structure allows for seamless integration into HTML reports using XSL stylesheets (`.xsl`). This conversion is highly beneficial for generating structured, easily digestible documentation for non-technical stakeholders, management, or auditing purposes.

To convert the raw XML output into a formatted HTML report, utilize the `xsltproc` utility:

```shell
MikyRedHat@htb[/htb]$ xsltproc target.xml -o target.html
```

Once processed, the `.html` file can be rendered in any standard web browser, providing a clear and visually structured presentation of the target's open ports and services.

> **Reference:** For further technical documentation on Nmap output parameters, visit the [official Nmap Output guide](https://nmap.org/book/output.html).

# Service Enumeration & Version Detection

Accurately determining the application and its exact version is a critical phase in network enumeration. We leverage this data to cross-reference known vulnerabilities, analyze specific source code, and pinpoint the exact exploits that match both the service and the target's underlying operating system.

## Service Version Detection with Nmap

Best practices dictate initiating enumeration with a quick port scan to establish a baseline of available ports. This approach generates significantly less network traffic, reducing the likelihood of triggering security mechanisms (such as IDS/IPS) that could block our IP. Once the initial reconnaissance is complete, we can run a comprehensive full port scan (`-p-`) alongside service version detection (`-sV`) in the background.

Given that a full scan on 65,535 ports is time-consuming, you can press the `[Space Bar]` during execution to prompt Nmap to output the current scan status and Estimated Time of Completion (ETC).

    MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p- -sV

    Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-15 19:44 CEST
    [Space Bar]
    Stats: 0:00:03 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
    SYN Stealth Scan Timing: About 3.64% done; ETC: 19:45 (0:00:53 remaining)

To automate this status check, use the `--stats-every` flag, specifying the desired interval in seconds (`s`) or minutes (`m`):

    MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p- -sV --stats-every=5s

    Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-15 19:46 CEST
    Stats: 0:00:05 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
    SYN Stealth Scan Timing: About 13.91% done; ETC: 19:49 (0:00:31 remaining)

Increasing the verbosity level (`-v` or `-vv`) instructs Nmap to display open ports in real-time as soon as they are discovered, rather than waiting for the entire scan to finish.

    MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p- -sV -v 

    Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-15 20:03 CEST
    # <SNIP>
    Discovered open port 995/tcp on 10.129.2.28
    Discovered open port 80/tcp on 10.129.2.28
    # <SNIP>

### Nmap Scanning Options Breakdown
| Flag | Description |
| :--- | :--- |
| **`10.129.2.28`** | Target IP address to scan. |
| **`-p-`** | Scans all 65,535 TCP ports. |
| **`-sV`** | Performs service version detection on open ports. |
| **`--stats-every=5s`** | Automates progress output at 5-second intervals. |
| **`-v`** | Increases verbosity to display detailed, real-time information. |

## Banner Grabbing & Automated Tool Limitations

Once the scan concludes, Nmap lists all active TCP ports, their associated services, and detected versions. Primarily, Nmap parses the banners transmitted by the scanned ports. If a banner is missing or inconclusive, Nmap falls back on a signature-based matching engine, which significantly increases the scan duration.

However, automated scanning has limitations. Security configurations can strip or obfuscate service banners, or Nmap simply might not parse specific strings correctly. We can observe this behavior by enabling packet tracing:

    MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p- -sV -Pn -n --disable-arp-ping --packet-trace

    Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-16 20:10 CEST
    # <SNIP>
    NSOCK INFO [0.4200s] nsock_trace_handler_callback(): Callback: READ SUCCESS for EID 18 [10.129.2.28:25] (35 bytes): 220 inlane ESMTP Postfix (Ubuntu)..
    Service scan match (Probe NULL matched with NULL line 3104): 10.129.2.28:25 is smtp.  Version: |Postfix smtpd|||
    # <SNIP>
    PORT   STATE SERVICE VERSION
    25/tcp open  smtp    Postfix smtpd

*Note on bypass flags:*
* `-Pn`: Disables ICMP Echo requests (treats host as online).
* `-n`: Disables DNS resolution.
* `--disable-arp-ping`: Disables ARP ping.
* `--packet-trace`: Displays all sent and received network packets.

In the output above, the raw `NSOCK INFO` trace reveals that the SMTP server is running on **Ubuntu**, but Nmap's final summarized output omits the OS detail. 

This occurs because, after a successful TCP 3-way handshake, the server pushes an identification banner. At the network level, this is triggered by the `PSH` (Push) flag in the TCP header. If an automated tool fails to parse this properly, manual enumeration is required.

## Manual Traffic Interception & Packet Analysis

To retrieve the full, unedited banner that Nmap missed, we can establish a manual connection using `nc` (Netcat) while concurrently capturing the network traffic with `tcpdump`.

**1. Start packet capture with Tcpdump:**
    
    MikyRedHat@htb[/htb]$ sudo tcpdump -i eth0 host 10.10.14.2 and 10.129.2.28

    tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
    listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes

**2. Execute manual banner grab with Netcat:**
    
    MikyRedHat@htb[/htb]$ nc -nv 10.129.2.28 25

    Connection to 10.129.2.28 port 25 [tcp/*] succeeded!
    220 inlane ESMTP Postfix (Ubuntu)

**3. Analyze the intercepted TCP traffic:**
The captured packets from `tcpdump` clearly illustrate the connection lifecycle:

    18:28:07.128564 IP 10.10.14.2.59618 > 10.129.2.28.smtp: Flags [S]...
    18:28:07.255151 IP 10.129.2.28.smtp > 10.10.14.2.59618: Flags [S.]...
    18:28:07.255281 IP 10.10.14.2.59618 > 10.129.2.28.smtp: Flags [.]...
    18:28:07.319306 IP 10.129.2.28.smtp > 10.10.14.2.59618: Flags [P.]... SMTP: 220 inlane ESMTP Postfix (Ubuntu)
    18:28:07.319426 IP 10.10.14.2.59618 > 10.129.2.28.smtp: Flags [.]...

**Traffic Breakdown:**
1. **`[SYN]`** (`Flags [S]`): The client requests a connection.
2. **`[SYN-ACK]`** (`Flags [S.]`): The target server acknowledges the request and synchronizes.
3. **`[ACK]`** (`Flags [.]`): The client acknowledges the server, successfully completing the 3-way handshake.
4. **`[PSH-ACK]`** (`Flags [P.]`): The target server immediately pushes the data payload containing the banner (`220 inlane ESMTP Postfix (Ubuntu)`) and simultaneously uses the ACK flag to notify that all required data has been transmitted.
5. **`[ACK]`** (`Flags [.]`): The client confirms receipt of the data.