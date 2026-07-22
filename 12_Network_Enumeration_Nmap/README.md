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
