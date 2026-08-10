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

# Nmap Scripting Engine (NSE)

The **Nmap Scripting Engine (NSE)** is one of Nmap's most powerful and flexible features. It allows users to write and share simple scripts (using the Lua programming language) to automate a wide variety of networking tasks. 

These scripts can seamlessly interact with specific services, making NSE invaluable for network discovery, sophisticated version detection, vulnerability identification, and even exploitation.

## 1. NSE Script Categories

Nmap categorizes its scripts into 14 distinct groups based on their functionality and invasiveness:

| Category | Description |
| :--- | :--- |
| **auth** | Identifies authentication credentials on target systems. |
| **broadcast** | Discovers hosts by broadcasting on the local network; discovered hosts can be automatically added to the scan queue. |
| **brute** | Executes brute-force attacks against specific services to guess authentication credentials. |
| **default** | The baseline scripts executed when using the `-sC` flag. Balances speed, usefulness, and reliability. |
| **discovery** | Actively queries target services to evaluate and discover accessible information (e.g., DNS servers, SNMP). |
| **dos** | Tests services for Denial of Service (DoS) vulnerabilities. *Note: Can disrupt services, use with caution.* |
| **exploit** | Attempts to actively exploit known vulnerabilities identified on the scanned ports. |
| **external** | Leverages third-party external services or databases (e.g., WHOIS) for further information processing. |
| **fuzzer** | Sends unexpected or randomized fields/packets to identify vulnerabilities or unexpected handling. Time-consuming. |
| **intrusive** | Highly aggressive scripts that pose a significant risk of crashing the target system or generating excessive noise. |
| **malware** | Checks the target system for active malware infections or backdoors. |
| **safe** | Defensive, non-intrusive scripts designed not to crash services, consume large amounts of bandwidth, or exploit holes. |
| **version** | Advanced scripts used by the `-sV` (Version Detection) feature to probe for specific service details. |
| **vuln** | Scans for specific, widely known vulnerabilities (often linking them to CVEs). |

---

## 2. Executing NSE Scripts

Nmap provides multiple flags to define which scripts should be loaded during a scan.

### Default Scripts
Executes the standard set of safe, useful scripts (equivalent to `--script=default`).
```bash
sudo nmap <target> -sC
```

### Specific Script Category
Runs all scripts belonging to a specific category (e.g., `vuln`, `exploit`).
```bash
sudo nmap <target> --script <category>
```

### Multiple Defined Scripts
Executes a comma-separated list of specific scripts.
```bash
sudo nmap <target> -p 25 --script banner,smtp-commands
```

**Output Example (SMTP Enumeration):**
```text
PORT   STATE SERVICE
25/tcp open  smtp
|_banner: 220 inlane ESMTP Postfix (Ubuntu)
|_smtp-commands: inlane, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8,
MAC Address: DE:AD:00:00:BE:EF (Intel Corporate)
```
*Insight: The `banner` script identifies the OS (Ubuntu), while `smtp-commands` enumerates available SMTP verbs, which is critical for finding out if we can perform user enumeration (e.g., via `VRFY`).*

---

## 3. Aggressive Scanning (-A)

The Aggressive scan option (`-A`) bundles multiple Nmap features into a single command. It performs:
1. **OS detection** (`-O`)
2. **Service version detection** (`-sV`)
3. **Script scanning** (`-sC`)
4. **Traceroute** (`--traceroute`)

```bash
sudo nmap <target> -p 80 -A
```

**Output Example:**
```text
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-generator: WordPress 5.3.4
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: blog.inlanefreight.com
MAC Address: DE:AD:00:00:BE:EF (Intel Corporate)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 2.6.32 (96%), Linux 3.2 - 4.9 (96%) [...]
Network Distance: 1 hop
```
*Insight: This scan immediately gives us the web server version (Apache 2.4.29), the CMS running on it (WordPress 5.3.4), and a high-probability OS guess (Linux 96%).*

---

## 4. Vulnerability Assessment (`vuln`)

Moving beyond standard enumeration, we can use the `vuln` category to check services against known vulnerability databases (like Vulners) and common misconfigurations.

```bash
sudo nmap <target> -p 80 -sV --script vuln 
```

**Output Example:**
```text
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
| http-enum:
|   /wp-login.php: Possible admin folder
|   /: WordPress version: 5.3.4
|   /wp-login.php: Wordpress login page.
|_  /readme.html: Interesting, a readme.
| http-wordpress-users:
| Username found: admin
| vulners:
|   cpe:/a:apache:http_server:2.4.29:
|       CVE-2019-0211   7.2 [https://vulners.com/cve/CVE-2019-0211](https://vulners.com/cve/CVE-2019-0211)
|       CVE-2018-1312   6.8 [https://vulners.com/cve/CVE-2018-1312](https://vulners.com/cve/CVE-2018-1312)
```
*Insight: By chaining `-sV` (to accurately identify the service) with `--script vuln`, Nmap queries CVE databases based on the specific version found, while also enumerating CMS-specific data like valid usernames (`admin`) and interesting directories.*

> **Reference:** For exhaustive documentation on all NSE scripts and their arguments, visit the [Nmap Scripting Engine Documentaion](https://nmap.org/nsedoc/index.html).

# Nmap Performance & Optimization Tuning

Scanning performance is a critical factor during network enumeration, especially when dealing with extensive network scopes or low-bandwidth environments. Nmap provides robust options to balance **speed, accuracy, and stealth** by fine-tuning packet rates, timeouts, and retries.

## 1. Timeouts (Round-Trip-Time / RTT)
When Nmap sends a packet, it waits for a response (Round-Trip-Time). By default, Nmap starts with a high RTT timeout (100ms). Lowering these values accelerates the scan but introduces the risk of overlooking active hosts due to network latency.

```bash
# Optimized RTT Scan
sudo nmap 10.129.2.0/24 -F --initial-rtt-timeout 50ms --max-rtt-timeout 100ms
```

| Flag | Description |
| :--- | :--- |
| `-F` | Fast scan (Scans the top 100 most common ports instead of 1000). |
| `--initial-rtt-timeout` | Sets the initial timeout value for packet responses. |
| `--max-rtt-timeout` | Sets the absolute maximum time Nmap will wait for a response. |

## 2. Max Retries
If Nmap does not receive a response from a port, it retries sending the probe (default is 10 times). Dropping the retry rate to `0` forces Nmap to skip the port immediately upon no response, massively speeding up the scan at the cost of potential false negatives.

```bash
# Zero-Retry Scan (Aggressive Speed)
sudo nmap 10.129.2.0/24 -F --max-retries 0
```

| Flag | Description |
| :--- | :--- |
| `--max-retries <number>` | Caps the number of times Nmap will resend a probe to a slow or unresponsive port. |

## 3. Packet Rates
In white-box penetration tests where bandwidth limits are known and stealth is not a primary concern, enforcing a minimum packet rate drastically reduces scan times. Nmap will attempt to maintain the specified volume of packets sent per second.

```bash
# High-Speed Rate Scan
sudo nmap 10.129.2.0/24 -F -oN tnet.minrate300 --min-rate 300
```

| Flag | Description |
| :--- | :--- |
| `--min-rate <number>` | Sets the minimum number of packets Nmap must send simultaneously per second. |
| `-oN <file>` | Outputs the scan results in standard format to the specified file. |

## 4. Timing Templates
For black-box environments where manual optimization is complex, Nmap offers six built-in timing templates (`-T <0-5>`). These templates automatically adjust timeouts, retries, and rates to match the desired aggressiveness.

*   **-T 0 (Paranoid) / -T 1 (Sneaky):** Extremely slow, utilized primarily for IDS evasion.
*   **-T 2 (Polite):** Slows down the scan to consume less bandwidth and target machine resources.
*   **-T 3 (Normal):** The default behavior if no `-T` flag is specified.
*   **-T 4 (Aggressive):** Assumes a fast, reliable network. Speeds up scans significantly.
*   **-T 5 (Insane):** Assumes an extraordinarily fast network. Very noisy; prone to packet loss and likely to trigger security appliances.

```bash
# Insane Timing Scan
sudo nmap 10.129.2.0/24 -F -oN tnet.T5 -T 5
```

> **Technical Insight:** Pushing Nmap to its maximum speed (e.g., `-T 5`, `--max-retries 0`, or high `--min-rate`) inevitably degrades accuracy. Security appliances (Firewalls, IDS/IPS) are highly likely to drop excessive traffic, causing Nmap to report open ports as `filtered` or miss hosts entirely. Always tailor performance flags to the specific engagement scope (White-box vs. Black-box) and the target's network stability.

# Nmap: Firewall and IDS/IPS Evasion

Nmap provides advanced capabilities to bypass firewall rules and evade Intrusion Detection/Prevention Systems (IDS/IPS). These methodologies—ranging from packet fragmentation and decoy usage to source port manipulation—are critical for accurately mapping out heavily defended target networks.

## 1. Core Security Mechanisms

*   **Firewalls:** Security appliances (hardware or software) that monitor and control incoming and outgoing network traffic based on predetermined security rules. They evaluate packets and typically either pass, drop, or reject connections to prevent unauthorized access.
*   **Intrusion Detection Systems (IDS):** Passive monitoring solutions that scan network traffic for known attack signatures or anomalous patterns. Upon detection, they alert administrators but do not block traffic on their own.
*   **Intrusion Prevention Systems (IPS):** Active monitoring solutions that complement the IDS. If a malicious pattern is detected, the IPS automatically takes defensive actions, such as dropping the connection or blocking the source IP address.

---

## 2. Determining Firewalls and Their Rules

When an Nmap scan reports a port as `filtered`, it usually implies a firewall is actively dropping or rejecting the packets. 
*   **Dropped Packets:** The firewall silently discards the packet. Nmap receives no response.
*   **Rejected Packets:** The firewall explicitly refuses the connection. TCP requests typically receive an `RST` flag in response, while ICMP requests return specific error codes (e.g., *Net Unreachable*, *Port Unreachable*, *Host Prohibited*).

### SYN Scan (`-sS`) vs. ACK Scan (`-sA`)

Standard `SYN` scans (`-sS`) initiate a connection attempt, which external-facing firewalls are explicitly configured to block. However, an `ACK` scan (`-sA`) sends a TCP packet with only the `ACK` flag set. 

Because `ACK` packets simulate an already established TCP connection, stateless firewalls often allow them to pass through, unable to determine if the connection originated internally or externally. If the port is open or closed (but unfiltered), the target host must respond with an `RST` flag. This technique is invaluable for mapping firewall rule sets.

#### Example: SYN Scan (Filtered by Firewall)
```bash
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p 21,22,25 -sS -Pn -n --disable-arp-ping --packet-trace

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-21 14:56 CEST
SENT (0.0278s) TCP 10.10.14.2:57347 > 10.129.2.28:22 S ttl=53 id=22412 iplen=44  seq=4092255222 win=1024 <mss 1460>
SENT (0.0278s) TCP 10.10.14.2:57347 > 10.129.2.28:25 S ttl=50 id=62291 iplen=44  seq=4092255222 win=1024 <mss 1460>
SENT (0.0278s) TCP 10.10.14.2:57347 > 10.129.2.28:21 S ttl=58 id=38696 iplen=44  seq=4092255222 win=1024 <mss 1460>
RCVD (0.0329s) ICMP [10.129.2.28 > 10.10.14.2 Port 21 unreachable (type=3/code=3) ] IP [ttl=64 id=40884 iplen=72 ]
RCVD (0.0341s) TCP 10.129.2.28:22 > 10.10.14.2:57347 SA ttl=64 id=0 iplen=44  seq=1153454414 win=64240 <mss 1460>
[...]
PORT   STATE    SERVICE
21/tcp filtered ftp
22/tcp open     ssh
25/tcp filtered smtp
```
*Note the `SA` (SYN-ACK) response for port 22, indicating an open port, and the ICMP unreachable error for port 21.*

#### Example: ACK Scan (Bypassing Stateless Rules)
```bash
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p 21,22,25 -sA -Pn -n --disable-arp-ping --packet-trace

Starting Nmap 7.80 ( [https://nmap.org](https://nmap.org) ) at 2020-06-21 14:57 CEST
SENT (0.0422s) TCP 10.10.14.2:49343 > 10.129.2.28:21 A ttl=49 id=12381 iplen=40  seq=0 win=1024
[...]
RCVD (0.1268s) TCP 10.129.2.28:22 > 10.10.14.2:49343 R ttl=64 id=0 iplen=40  seq=1660784500 win=0
[...]
PORT   STATE      SERVICE
21/tcp filtered   ftp
22/tcp unfiltered ssh
25/tcp filtered   smtp
```
*Here, we receive an `R` (RST) flag from port 22, proving the port is unfiltered.*

| Target & Flag | Description |
| :--- | :--- |
| `10.129.2.28` | Specifies the target IP. |
| `-p 21,22,25` | Limits the scan to the specified ports. |
| `-sS` | Executes a TCP SYN (Stealth) scan. |
| `-sA` | Executes a TCP ACK scan. |
| `-Pn` | Disables ICMP Echo requests (skips host discovery). |
| `-n` | Disables DNS resolution to minimize noise. |
| `--disable-arp-ping` | Prevents ARP ping discovery. |
| `--packet-trace` | Traces and displays all packets sent and received. |

---

## 3. IDS/IPS Detection Strategy

Detecting an active IDS/IPS is fundamentally more challenging than identifying firewall rules because these systems monitor traffic passively. 

During a penetration test, using multiple Virtual Private Servers (VPS) with different IP addresses is considered best practice. If a target administrator or IPS detects aggressive scanning patterns from a single host, the source IP will likely be blocked. If the host loses all access to the target network abruptly, it confirms the presence of active defensive measures (IPS). Consequently, the pentester must switch to a new VPS and drastically reduce the scan's noise level by disguising interactions and pacing the traffic.

---

## 4. Evasion Techniques

### Decoys (`-D`)
To prevent an IPS from accurately pinpointing the source of an attack, or to bypass geolocation-based subnet blocking, we can use Decoys. Nmap generates spoofed packets from random IP addresses and interleaves them with our actual IP address. The target's logs are consequently flooded with multiple source IPs.

*Requirement: The decoy IPs must be online (alive). If they are offline, the target's SYN-ACK responses will go unanswered, potentially triggering SYN-flood protection mechanisms and rendering the service temporarily unreachable.*

```bash
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p 80 -sS -Pn -n --disable-arp-ping --packet-trace -D RND:5

# Output shows multiple SYN packets originating from random IPs, masking our real IP (10.10.14.2)
SENT (0.0378s) TCP 102.52.161.59:59289 > 10.129.2.28:80 S ttl=42 id=29822 iplen=44  seq=3687542010 win=1024 <mss 1460>
SENT (0.0378s) TCP 10.10.14.2:59289 > 10.129.2.28:80 S ttl=59 id=29822 iplen=44  seq=3687542010 win=1024 <mss 1460>
[...]
```

### Source IP Spoofing (`-S`)
In scenarios where ISPs or edge routers filter entirely random decoy IPs, we can manually specify the IP addresses of other VPS machines we control, or spoof an internal IP address to bypass access controls.

```bash
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -n -Pn -p 445 -O -S 10.129.2.200 -e tun0
```

| Evasion Flag | Description |
| :--- | :--- |
| `-D RND:5` | Generates 5 random decoy IP addresses to mask the actual source IP. |
| `-S 10.129.2.200` | Manually spoofs the source IP address (useful if internal subnets are trusted). |
| `-e tun0` | Forces Nmap to route all traffic through the specified network interface. |

### DNS Proxying & Source Port Manipulation (`--source-port`)

Firewalls are frequently misconfigured to blindly trust incoming traffic originating from specific ports, such as UDP/TCP port 53 (DNS). By forcing our Nmap scan to originate from port 53, we can often bypass overly permissive ingress rules.

**Standard SYN-Scan (Blocked):**
```bash
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p50000 -sS -Pn -n --disable-arp-ping --packet-trace
# Port 50000 shows as 'filtered'
```

**SYN-Scan Forcing Source Port 53 (Allowed):**
```bash
MikyRedHat@htb[/htb]$ sudo nmap 10.129.2.28 -p50000 -sS -Pn -n --disable-arp-ping --packet-trace --source-port 53

SENT (0.0482s) TCP 10.10.14.2:53 > 10.129.2.28:50000 S ttl=58 id=27470 iplen=44  seq=4003923435 win=1024 <mss 1460>
RCVD (0.0608s) TCP 10.129.2.28:50000 > 10.10.14.2:53 SA ttl=64 id=0 iplen=44  seq=540635485 win=64240 <mss 1460>

PORT      STATE SERVICE
50000/tcp open  ibm-db2
```

Once a bypass port is identified, we can leverage tools like Netcat to explicitly connect to the target port by mimicking the trusted source port:

```bash
MikyRedHat@htb[/htb]$ ncat -nv --source-port 53 10.129.2.28 50000
Ncat: Version 7.80 ( [https://nmap.org/ncat](https://nmap.org/ncat) )
Ncat: Connected to 10.129.2.28:50000.
220 ProFTPd
```

# Firewall and IDS/IPS Evasion

## Overview
When auditing infrastructure protected by IDS (e.g., Snort, Suricata) or IPS, stealth is mandatory to avoid threshold-based bans. In lab environments where monitoring is available (such as a `status.php` feedback loop), the primary objective is to fine-tune Nmap parameters to maintain the alert count strictly below the lockout threshold.

## Evasion Techniques (Nmap)

### 1. Timing & Rate Limiting
Rapid scans generate massive traffic spikes, immediately triggering IPS rate-limit rules.
* **`-T2` (Polite):** Slows down the execution, adding deliberate delays between packet transmissions.
* **`--max-rate <number>`:** Hard limits the maximum packets sent per second (e.g., `--max-rate 10`).

### 2. Packet Fragmentation
Evades IDS engines that either fail to properly reassemble fragmented packets or skip deep packet inspection on fragments to conserve CPU cycles.
* **`-f`:** Splits IP packets into 8-byte fragments.
* **`-ff`:** Splits IP packets into 16-byte fragments.
* **`--mtu <size>`:** Sets a custom Maximum Transmission Unit (must be a multiple of 8, e.g., `--mtu 24`).

### 3. Decoys (Source Spoofing)
Masks the real source IP by generating concurrent scans from spoofed addresses. The IDS logs a distributed attack, preventing it from isolating and dropping the true attacker's IP.
* **`-D RND:<number>`:** Generates random decoy IP addresses alongside the real one (e.g., `-D RND:10`).

### 4. Source Port Manipulation
Exploits poorly configured firewall rules that explicitly allow inbound traffic originating from "trusted" external ports (stateless filtering).
* **`-g <port>` / `--source-port <port>`:** Spoofs the source port (e.g., forcing DNS port 53 or HTTP port 80).

## Practical Execution: Stealth SYN Scan
Combining techniques to perform a comprehensive port discovery while keeping a low profile. Raw packet crafting (required for SYN scans and fragmentation) demands root privileges.

sudo nmap -sS --top-ports 100 --max-rate 30 -f -D RND:5 <target_IP>

---

### DNS Enumeration & Banner Grabbing (Port 53 UDP)
When performing a UDP port scan and service detection (`-sU -sV`) against port 53 (DNS), Nmap triggers a specific reconnaissance technique. It sends a CHAOS class TXT query for `version.bind` to map the exact software release running on the target.

In CTF environments or hardened corporate infrastructures (applying *Security Through Obscurity*), SysAdmins can spoof this response modifying the `named.conf` file. Instead of leaking the real **BIND** daemon version, they can output custom strings to mislead attackers or, in this case, inject a flag.

#### Execution & Output Analysis
```bash
sudo nmap --max-rate 30 -f -D RND:5 -sV -sU -p 53 10.129.105.110
```
*   `-sU`: UDP Scan (Standard protocol for DNS queries).
*   `-sV`: Service Version detection (Triggers the `version.bind` query).
*   `-f`: Packet fragmentation (IDS/Firewall evasion technique).
*   `-D RND:5`: Generates 5 random decoys to mask the real attacker IP.

**Nmap Results:**
```text
PORT   STATE SERVICE VERSION
53/udp open  domain  (unknown banner: HTB{GoTtgUnyze9Psw4vGjcuMpHRp})
```
By analyzing the raw Service Fingerprint dumped by Nmap, we can spot the exact payload and response:
`%r(DNSVersionBindReq,57,"\0\x06\x85\0\0\x01\0\x01\0\x01\0\0\x07version\x04bind... HTB{GoTtgUnyze9Psw4vGjcuMpHRp} ...`

**Conclusion:** The underlying service is **BIND**. The target was successfully enumerated, and the configuration file yielded the HTB flag directly on the service banner.

---

### Service Version Detection & Evasion Tactics
When conducting internal or external audits, identifying the exact version of running services is a critical phase. It allows us to map the attack surface and cross-reference the discovered software with known vulnerabilities (CVEs) using tools like `searchsploit` or the NVD database. 

#### Execution & Output Analysis
```bash
sudo nmap --max-rate 30 -f -D RND:5 -sV --top-ports 100 10.129.105.118
```
*   `--top-ports 100`: Scans the 100 most common ports (optimizing execution time while retaining a high probability of finding standard services).
*   `-sV`: Service Version detection (grabs banners and matches Nmap's `nmap-service-probes` database to determine the exact software release).
*   `-f`: Packet fragmentation (MTU manipulation to bypass strict IDS/IPS/Firewall rules).
*   `-D RND:5`: Decoy scan generating 5 random IP addresses to obfuscate the real source IP of the probe.
*   `--max-rate 30`: Throttles the scan to send a maximum of 30 packets per second, preventing network congestion or triggering rate-limiting alerts.

**Nmap Results (Discovered Services):**
*   **Port 22/tcp (SSH):** `OpenSSH 7.6p1 Ubuntu 4ubuntu0.7` (Ubuntu Linux; protocol 2.0)
*   **Port 80/tcp (HTTP):** `Apache httpd 2.4.29` ((Ubuntu))

**Conclusion:** The `-sV` flag successfully fingerprinted two core services. The explicit version disclosure provides a clear vector for the subsequent vulnerability assessment and exploitation phases.

---

### Firewall Evasion & Packet Tracing
When auditing hardened environments, standard scans might get dropped or filtered by perimeter firewalls. In these scenarios, we can leverage Nmap's advanced options to manipulate our packets and trace the TCP responses, applying deep network troubleshooting techniques.

#### Source Port Manipulation & Stealth Execution
```bash
sudo nmap 10.129.105.118 --top-ports 100 -sS -Pn -n --disable-arp-ping --packet-trace --source-port 53
```
*   `--source-port 53`: Source port spoofing. By forcing our Nmap probes to originate from port 53 (DNS), we attempt to bypass poorly configured firewall rules (ACLs) that blindly trust traffic coming from common service ports.
*   `--packet-trace`: Enables verbose packet-level debugging. It prints a summary of every packet sent or received, which is crucial for Layer 4 troubleshooting.
*   `-sS`: SYN Scan (stealth). Leaves the TCP connection half-open.
*   `-Pn`: Disables ICMP host discovery. Assumes the target is alive, bypassing ping-blocking firewalls.
*   `-n`: Disables DNS resolution to speed up the scan and prevent leaking our IP to the target's DNS servers.
*   `--disable-arp-ping`: Prevents ARP requests, enforcing stealth mode within local network segments.

#### Packet Trace Output Analysis
By analyzing the `--packet-trace` dump, we can interpret the raw TCP flags to determine port states without relying solely on Nmap's final summary:
*   **Probes (SENT):** `SENT (...) TCP 10.10.15.53:53 > 10.129.105.118:22 S ...` -> Nmap sends a `SYN` (S) packet to initiate the connection.
*   **Open Ports (RCVD SA):** `RCVD (...) TCP 10.129.105.118:22 > 10.10.15.53:53 SA ...` -> The target responds with a `SYN-ACK` (SA), confirming the port is open and listening.
*   **Closed Ports (RCVD RA):** `RCVD (...) TCP 10.129.105.118:23 > 10.10.15.53:53 RA ...` -> The target responds with a `RST-ACK` (RA), explicitly resetting the connection because no service is bound to that port.

**Conclusion:** Using source port evasion successfully mapped the attack surface. Ports 22 (SSH) and 80 (HTTP) returned `SYN-ACK` packets, confirming they are accessible from the outside.

---

### Advanced IDS/IPS Evasion & Non-Standard Port Discovery
When a target infrastructure is actively defended by a properly configured Intrusion Detection/Prevention System (IDS/IPS), conventional port scanning methodologies will trigger alerts and inevitably lead to an IP ban. Furthermore, SysAdmins often implement *Security Through Obscurity* by moving critical daemons to non-standard, high-range ports to avoid automated scanners.

#### Scenario Analysis & Strategy
*   **IDS/IPS in place:** Strict packet filtering and traffic analysis are active. We must enforce low-profile techniques (fragmentation, decoys, and rate-limiting).
*   **Modified services:** The target daemons have been migrated from their default ports. A full TCP port scan (`-p 1-65535` or `-p-`) is mandatory.

#### Execution Plan
To map this hardened surface, we combine stealth SYN scanning with multiple evasion tactics across all TCP ports.
```bash
sudo nmap -p- -sS -sV -f -D RND:5 --max-rate 30 <TARGET_IP>
```

---

### Scan Optimization: The "Divide & Conquer" Tactic
Executing a full port sweep (`-p-`) combined with strict rate-limiting (`--max-rate 30`) and service versioning (`-sV`) is highly inefficient and time-consuming. To optimize the auditing workflow while bypassing IDS/IPS appliances, we split the reconnaissance into two phases, leveraging ACL misconfigurations.

#### Phase 1: Fast Port Sweep via Source Port Evasion
If the perimeter firewall trusts traffic originating from specific ports (e.g., DNS/53), we can spoof our source port to bypass rate-limiting alerts, allowing us to increase the packet rate safely.
```bash
sudo nmap -p- -sS -Pn -n --disable-arp-ping --source-port 53 --min-rate 1000 <TARGET_IP>
```
*   `--min-rate 1000`: Forces Nmap to send at least 1000 packets per second, drastically reducing the scan time for all 65,535 ports.
*   `--source-port 53`: Bypasses firewall rules and potentially IDS rate-limiting thresholds by masking the traffic as legitimate DNS responses.

#### Phase 2: Targeted Service Versioning
Once the non-standard port is discovered (e.g., a hidden FTP or SMB share), we run the intrusive service probe exclusively against that target.
```bash
sudo nmap -p <DISCOVERED_PORT> -sV --source-port 53 <TARGET_IP>
```

---

### Troubleshooting: The 'tcpwrapped' State
Encountering a `tcpwrapped` state during a `-sV` (Service Version) scan implies that a full TCP connection was established, but the connection was immediately dropped before the application payload could be evaluated. 

This behavior is typically enforced by **TCP Wrappers** limiting access via IP ACLs, or by an active IPS blocking Nmap's specific service probes. Alternatively, the underlying daemon might require the client to initiate the data exchange.

#### Manual Banner Grabbing with Netcat
To bypass Nmap's probe signatures and manually interact with the daemon, we can use `nc` (Netcat) while preserving our firewall evasion tactic (Source Port Spoofing).

```bash
nc -nv -p 53 <TARGET_IP> <TARGET_PORT>
```
*   `-n`: Disables DNS resolution (speeds up connection and prevents leaks).
*   `-v`: Verbose output (confirms connection establishment).
*   `-p 53`: Binds the local source port to 53 to bypass standard perimeter firewall ACLs.

Once connected, if the server does not immediately present a banner, send raw input (e.g., `ENTER`, `HELP`, or `GET / HTTP/1.0`) to trigger an application-layer response and identify the software version.

#### Netcat Results & Output Analysis
```text
220 HTB{kjnsdf2n982n1827eh76238s98di1w6}
214-The following commands are recognized (* =>'s unimplemented):
214-CWD     XCWD    CDUP    XCUP    SMNT*   QUIT    PORT    PASV    
...
214 Direct comments to root@nix-nmap-hard
```
**Conclusion:** The hidden service on port 50000 was successfully identified as an **FTP Server**. The output confirms standard FTP operational commands (`CWD`, `PASV`, `RETR`, `STOR`). Furthermore, the sysadmin modified the initial 220 banner greeting, which leaked the objective flag.

---

### Module Conclusion & Key Takeaways
This module provided an in-depth exploration of **Nmap**, the industry-standard network enumeration and scanning utility. It reinforced core SysAdmin troubleshooting skills and offensive network auditing techniques through practical challenges, ultimately validating these concepts in a comprehensive skills assessment.

#### Core Competencies Acquired
*   **Advanced Network Mapping:** Mastery of host discovery and port scanning methodologies to accurately map network topologies and attack surfaces.
*   **Service & OS Fingerprinting:** Execution of service enumeration (`-sV`) and Operating System detection (`-O`) to identify underlying infrastructure and software versions.
*   **Extensibility via NSE:** Leveraging the Nmap Scripting Engine (NSE) to automate vulnerability scanning, bypass security controls, and perform advanced service enumeration.
*   **Evasion Tactics:** Applying stealth methodologies—such as packet fragmentation (`-f`), decoy scans (`-D`), source port spoofing (`--source-port`), and rate limiting (`--max-rate`)—to bypass strict perimeter firewalls and IDS/IPS appliances.
*   **Output Management:** Parsing and managing Nmap scan results (`-oA`) effectively for reporting, documentation, and subsequent exploitation phases.

# Cheatsheet - "12_Network_Enumeration_Nmap" :
* nmap <scan types> <options> <target> - Estructura básica de ejecución de Nmap para análisis y auditoría perimetral
* sudo nmap -sS localhost - Ejecuta un TCP-SYN (Stealth Scan) rápido y eficiente contra localhost
* sudo nmap 10.129.2.0/24 -sn -oA tnet | grep for | cut -d" " -f5 - Realiza Host Discovery (ping sweep) en un rango CIDR exportando resultados en todos los formatos
* sudo nmap -sn -oA tnet -iL hosts.lst | grep for | cut -d" " -f5 - Ejecuta descubrimiento de hosts leyendo objetivos masivos desde un archivo de lista IP
* sudo nmap -sn -oA tnet 10.129.2.18 10.129.2.19 10.129.2.20 | grep for | cut -d" " -f5 - Realiza Host Discovery sobre múltiples direcciones IP específicas separadas por espacios
* sudo nmap -sn -oA tnet 10.129.2.18-20 | grep for | cut -d" " -f5 - Ejecuta descubrimiento de hosts especificando un rango de octetos IP
* sudo nmap 10.129.2.18 -sn -oA host -PE --packet-trace - Realiza Host Discovery mediante ICMP Echo Request con registro detallado de paquetes a nivel de red
* sudo nmap 10.129.2.18 -sn -oA host -PE --reason - Muestra la razón explícita por la cual un host es marcado como activo (ej. respuesta ARP)
* sudo nmap 10.129.2.18 -sn -oA host -PE --packet-trace --disable-arp-ping - Fuerza la validación Layer 3 ICMP omitiendo el ping ARP predeterminado en redes locales
* sudo nmap 10.129.2.28 --top-ports=10 - Escanea los 10 puertos TCP más frecuentes según la base de datos de Nmap
* sudo nmap 10.129.2.28 -p 21 --packet-trace -Pn -n --disable-arp-ping - Analiza el comportamiento de paquetes SYN aislando el ruido de red (desactivando ICMP, DNS y ARP)
* sudo nmap 10.129.2.28 -p 443 --packet-trace --disable-arp-ping -Pn -n --reason -sT - Ejecuta un TCP Connect Scan completo completando el handshake de 3 vías con traza de paquetes
* sudo nmap 10.129.2.28 -p 445 --packet-trace -n --disable-arp-ping -Pn - Analiza puertos filtrados por firewall y respuestas de puerto inalcanzable ICMP (Type 3 / Code 3)
* sudo nmap 10.129.2.28 -F -sU - Realiza un escaneo rápido de puertos UDP sobre los 100 puertos más comunes
* sudo nmap 10.129.2.28 -Pn -n --disable-arp-ping --packet-trace -p 445 --reason -sV - Ejecuta detección de versión de servicio con traza de paquetes sobre un puerto específico
* sudo nmap 10.129.2.28 -p- -oA target - Escanea los 65,535 puertos TCP y exporta resultados simultáneamente en formatos Normal, Grepable y XML
* xsltproc target.xml -o target.html - Convierte la salida XML de Nmap en un reporte HTML estructurado usando hojas de estilo XSL
* sudo nmap 10.129.2.28 -p- -sV --stats-every=5s - Escanea todos los puertos con versionado automatizando informes de progreso cada 5 segundos
* sudo nmap 10.129.2.28 -p- -sV -v - Escanea todos los puertos con detección de versiones y alta verbosity para visualizar puertos abiertos en tiempo real
* sudo tcpdump -i eth0 host 10.10.14.2 and 10.129.2.28 - Captura tráfico de red para analizar handshakes TCP y banners de servicio a nivel de socket
* nc -nv 10.129.2.28 25 - Conecta manualmente mediante Netcat para capturar banners de servicio sin filtrar
* sudo nmap <target> -sC - Ejecuta el conjunto predeterminado de scripts seguros del Nmap Scripting Engine (NSE)
* sudo nmap <target> --script <category> - Ejecuta todos los scripts NSE pertenecientes a una categoría específica (ej. vuln, auth, exploit)
* sudo nmap <target> -p 25 --script banner,smtp-commands - Ejecuta scripts NSE específicos contra un puerto para enumeración avanzada de servicios
* sudo nmap <target> -p 80 -A - Realiza un escaneo agresivo agrupando detección de OS, versionado, scripts NSE y traceroute
* sudo nmap <target> -p 80 -sV --script vuln - Ejecuta scripts de evaluación de vulnerabilidades NSE contra un servicio detectado
* sudo nmap 10.129.2.0/24 -F --initial-rtt-timeout 50ms --max-rtt-timeout 100ms - Optimiza tiempos de espera RTT (Round-Trip-Time) para acelerar escaneos en redes rápidas
* sudo nmap 10.129.2.0/24 -F --max-retries 0 - Acelera drásticamente el escaneo descartando reintentos de paquetes ante falta de respuesta
* sudo nmap 10.129.2.0/24 -F -oN tnet.minrate300 --min-rate 300 - Fuerza un caudal mínimo de paquetes por segundo para optimizar la velocidad de sondeo
* sudo nmap 10.129.2.0/24 -F -oN tnet.T5 -T 5 - Ejecuta una plantilla de temporización agresiva e intrusiva (-T5) para máxima velocidad
* sudo nmap 10.129.2.28 -p 21,22,25 -sA -Pn -n --disable-arp-ping --packet-trace - Ejecuta un TCP ACK Scan para mapear reglas de firewalls sin estado (stateless)
* sudo nmap 10.129.2.28 -p 80 -sS -Pn -n --disable-arp-ping --packet-trace -D RND:5 - Genera direcciones IP señuelo (decoys) aleatorias para enmascarar la IP de origen ante sistemas IDS/IPS
* sudo nmap 10.129.2.28 -n -Pn -p 445 -O -S 10.129.2.200 -e tun0 - Suplanta la dirección IP de origen y fuerza el tráfico a través de una interfaz de red específica
* sudo nmap 10.129.2.28 -p50000 -sS -Pn -n --disable-arp-ping --packet-trace --source-port 53 - Modifica el puerto de origen a 53 (DNS) para evadir reglas restrictivas de firewall y ACLs
* ncat -nv --source-port 53 10.129.2.28 50000 - Conecta mediante Ncat utilizando un puerto de origen suplantado para interacción manual con servicios ocultos
* sudo nmap -sS --top-ports 100 --max-rate 30 -f -D RND:5 <target_IP> - Realiza un SYN scan sigiloso con fragmentación de paquetes y señuelos para evasión avanzada de IDS/IPS
* sudo nmap --max-rate 30 -f -D RND:5 -sV -sU -p 53 <target_IP> - Ejecuta un escaneo UDP versionado contra el puerto 53 para extracción de información de bindings DNS
* sudo nmap -p- -sS -Pn -n --disable-arp-ping --source-port 53 --min-rate 1000 <TARGET_IP> - Ejecuta un escaneo masivo de alta velocidad en todos los puertos utilizando suplantación de puerto origen (DNS)