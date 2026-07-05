# Machine Write-Up: Cap (Hack The Box)

## 1. Reconnaissance and Enumeration
Initial network reconnaissance was conducted to identify active services and potential entry points. The following Nmap scan was executed:

nmap -p- -T4 10.129.61.49

The scan results confirmed the presence of three active services:
*   **Port 21 (FTP):** Used for file transfers, often a vector for credential harvesting.
*   **Port 22 (SSH):** Secure Shell, typically used for remote administrative access.
*   **Port 80 (HTTP):** Running a Gunicorn/Werkzeug development server.

Initial efforts to access the FTP server using anonymous credentials (user: anonymous) were unsuccessful, indicating that the service was not misconfigured to allow guest access.

## 2. Web Application Analysis & IDOR Exploitation
Enumeration of the web application identified a "Security Dashboard" function. Testing the URL parameters revealed an Insecure Direct Object Reference (IDOR).

curl -i -L [http://10.129.61.49/data/1](http://10.129.61.49/data/1)

By manipulating the URI integer, we identified that historical network captures were stored on the server. We determined that the relevant capture was indexed at ID 0, which allowed us to download the packet capture file.

curl -sL [http://10.129.61.49/data/0](http://10.129.61.49/data/0) -o capture_0.pcap

## 3. Traffic Analysis & Credential Harvesting
Once the PCAP file was obtained, we performed deep packet inspection using Wireshark to analyze the captured traffic. 

By applying the display filter `tcp.stream eq 3`, we reconstructed the specific TCP session. Within this stream, we identified plaintext credentials transmitted over the FTP protocol. The credentials for the user "nathan" were successfully recovered. Leveraging this credential reuse, we established an SSH connection to the target system.

ssh nathan@10.129.61.49

## 4. Privilege Escalation
Post-exploitation enumeration was focused on identifying vectors for privilege escalation, specifically checking for misconfigured Linux Capabilities assigned to system binaries.

getcap -r / 2>/dev/null

The enumeration identified that `/usr/bin/python3.8` possessed the `cap_setuid` capability. This allows the binary to escalate privileges by modifying the Effective User ID (EUID). The system was compromised by spawning a root shell via the Python interpreter:

/usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash")'

The UID was successfully elevated to 0, granting full root access to the target system.

## Key Technical Concepts

**IDOR (Insecure Direct Object Reference)**
A vulnerability occurring when an application exposes a reference to an internal implementation object (such as a database key or file path) without an authorization check. This allows an attacker to manipulate references to access unauthorized data.

**PCAP (Packet Capture)**
A file format used to store captured network traffic data. These files can be analyzed using tools like Wireshark or tcpdump to troubleshoot connectivity or perform security audits.

**Linux Capabilities**
A feature of the Linux kernel that breaks down the privileges of the "root" user into distinct, granular units. This allows specific processes to perform privileged tasks without requiring full administrative (root) access.
