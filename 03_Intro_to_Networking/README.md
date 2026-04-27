# 03 - Introduction to Networking

## Networking Overview

A network facilitates communication between devices. While deploying a flat network (e.g., a single `/24` subnet) is operationally simple, it represents a massive security flaw. Effective security requires Defense in Depth through strict network segmentation, Access Control Lists (ACLs), and Intrusion Detection Systems (IDS) like Snort or Suricata to restrict and monitor lateral movement. 

**Subnetting Pitfalls for Pentesters:**
Junior penetration testers often default to a `/24` CIDR mask without verifying the actual routing table. If a target environment utilizes `/25` subnets, an attacker using a `/24` configuration might successfully compromise a local workstation but falsely conclude that critical infrastructure (like a Domain Controller located in the other half of the subnet) is offline, completely missing high-value pivoting opportunities.

**Traffic Routing & DNS:**
Web requests rely on FQDNs (specifying the exact host) and URLs (specifying the exact resource path). The ISP queries DNS to resolve the FQDN to a routable IP, and the local Default Gateway routes the packets across the WAN.

**Enterprise Segmentation Best Practices:**
Proper infrastructure design isolates assets into dedicated VLANs:
* **DMZ:** Public-facing assets (Web Servers) to prevent direct access to the internal LAN if compromised.
* **Workstations:** End-user devices protected by Host-Based Firewalls to mitigate ARP Spoofing and MitM attacks.
* **Administration:** Management VLANs for network infrastructure to prevent unprivileged packet sniffing and OSPF spoofing.
* **VoIP (IP Phones):** Dedicated telephony networks for QoS prioritization and to prevent eavesdropping.
* **IoT & Printers:** Highly vulnerable endpoints. Printers are notorious for forced NTLMv2 authentication relays and reverse shell persistence. They must be isolated with strict outbound internet and SMB (Port 445) restrictions.

## Network Types

Networks are classified by geographic scope, routing protocols, and IP schema.

**Common Infrastructure:**
* **WAN (Wide Area Network):** Large-scale interconnected LANs or the Internet, typically utilizing public IPs and BGP.
* **LAN / WLAN (Local/Wireless Area Network):** Internal networks using private RFC 1918 addressing. WLANs simply introduce wireless transmission at Layer 1/2.
* **VPN (Virtual Private Network):** Encrypted tunnels. 
    * *Site-to-Site:* Connects distinct physical locations via border routers/firewalls.
    * *Remote Access:* Client-to-LAN (e.g., OpenVPN). *Security Note:* Split-tunneling (routing only corporate traffic via VPN) poses a risk, as malware communicating over the local ISP bypasses corporate network-based IDS.
    * *SSL VPN:* Clientless, browser-based access (e.g., HTB Pwnbox).

**Academic Classifications:**
* **GAN (Global Area Network):** Worldwide infrastructure (e.g., the Internet).
* **MAN (Metropolitan Area Network):** City-wide high-speed fiber networks connecting multiple LANs.
* **PAN / WPAN (Personal Area Network):** Short-range connections like Bluetooth or IoT protocols (ZigBee, Z-Wave).

## Networking Topologies

Network topology defines the physical layout (cabling) and the logical flow of data across nodes (NICs, switches, routers). 

**Standard Architectures:**
* **Point-to-Point:** A direct, dedicated link between two hosts.
* **Bus:** Hosts share a single transmission medium. High risk of data collisions.
* **Star:** All hosts connect to a central aggregation device (Switch/Router). The modern LAN standard, despite the central node being a Single Point of Failure (SPoF).
* **Ring:** Hosts connect in a closed loop. Often utilizes token-passing protocols to manage traffic direction and prevent collisions.
* **Mesh:** Highly interconnected nodes for fault tolerance. *Full Mesh* connects every node (common in core routing); *Partial Mesh* interlinks only critical nodes.
* **Tree:** A hierarchical mix of Star and Bus topologies, standard in enterprise Access/Distribution/Core models.
* **Hybrid:** Complex architectures combining multiple standard topologies to meet specific requirements.
* **Daisy Chain:** Hosts connected in series, passing signals sequentially. Frequently deployed in ICS/OT environments and automation.

## Proxies

A **proxy** is a device or service that sits between a client and a server, acting as a mediator for network traffic. Crucially, a true proxy must be able to inspect the contents of the traffic (Layer 7 of the OSI Model); if it only routes traffic without inspection, it is technically a *gateway*, not a proxy. 

While the term is used broadly (e.g., developers thinking of WAFs, security pros thinking of Burp Suite, or average users confusing them with VPNs), the fundamental concept remains the same: mediation.

### Key Types of Proxies

#### 1. Forward Proxy (Dedicated Proxy)
A forward proxy sits between the client and the internet. When a client makes a request, the proxy intercepts it, evaluates it against a set of rules (e.g., a web filter), and if permitted, forwards the request to the destination server on the client's behalf. The destination server sees the request as coming from the proxy, not the original client.

* **Security Application:** In enterprise networks, forward proxies (often web filters) restrict direct internet access. For malware to successfully communicate with its Command and Control (C2) server, it must be "proxy-aware." 
    * If malware uses the native Windows API (WinSock), it often inherits the system's proxy settings.
    * If an organization strictly uses browsers like Firefox (which uses `libcurl` instead of the system's WinSock settings), malware is less likely to successfully pull proxy configurations, hindering its C2 communication.
* **Pentesting Example:** Burp Suite is primarily used as a forward proxy, intercepting and allowing the modification of HTTP requests from the client before they reach the web server.

#### 2. Reverse Proxy
A reverse proxy sits in front of one or more web servers, intercepting incoming requests from clients (often from the internet) before they reach the internal servers. 

* **Security & Performance:** Organizations use reverse proxies (like Cloudflare or Nginx) to protect backend servers. They provide load balancing, SSL termination, and protection against DDoS attacks by filtering traffic before it hits the actual web server.
* **Web Application Firewalls (WAF):** ModSecurity is a common reverse proxy that acts as a WAF, inspecting incoming HTTP requests for malicious payloads (like SQL injection or XSS) and blocking them based on rulesets (e.g., the ModSecurity Core Rule Set).
* **Pentesting Example:** An attacker might configure a reverse proxy on a compromised internal host. If the attacker has an SSH session, they can use a reverse proxy to route external tools (like a web scanner) through the SSH tunnel, effectively bypassing the perimeter firewall and evading the external Intrusion Detection System (IDS).

#### 3. Transparent vs. Non-Transparent Proxies

Proxies can operate transparently or non-transparently, regardless of whether they are forward or reverse proxies.

* **Transparent Proxy:** The client is completely unaware that their traffic is being intercepted and mediated. The network infrastructure automatically redirects the client's requests to the proxy without requiring any configuration on the client's device. 
* **Non-Transparent Proxy (Explicit Proxy):** The client must be explicitly configured to use the proxy (e.g., setting the proxy IP and port in the operating system or browser settings). If the client is not configured to use the proxy, it will typically have no route to the internet, as the proxy is the only permitted path out of the network.

# 03 - Introduction to Networking

## Networking Models

To standardize how data is transmitted and received across different hardware and software, the industry relies on conceptual frameworks known as networking models. The two foundational frameworks are the **OSI (Open Systems Interconnection) Model** and the **TCP/IP Model**. 

These models break down the complex process of network communication into manageable, functional "layers." Each layer represents a step in transforming human-readable data down to electrical bits on a wire, and vice versa.

### The OSI Model

The **ISO/OSI Model** is the primary theoretical reference model used to teach and define system communication. Maintained by the ISO (International Organization for Standardization) and ITU, it strictly divides network communication into **seven** distinct layers, each with clearly defined responsibilities. 

Because of its strict, granular separation, the OSI model is incredibly useful for troubleshooting and detailed network analysis.

### The TCP/IP Model

The **TCP/IP Model** is a more practical, streamlined framework. It is the actual protocol suite that powers the modern Internet. While named after its two most prominent protocols (Transmission Control Protocol and Internet Protocol), "TCP/IP" serves as a generic term for the entire family of internet protocols (including UDP, ICMP, etc.). 

Unlike the strict 7-layer OSI model, the TCP/IP model generally condenses these functions into **four** broader layers. It focuses less on strict rules and more on general guidelines that enable flexible, real-world internet connectivity.

### ISO/OSI vs. TCP/IP Comparison

* **OSI Model:** The older, stricter conceptual reference. It acts as the definitive gateway for understanding how networks interact with end-users. It is highly detailed but less representative of how real-world code is written.
* **TCP/IP Model:** The practical, implemented standard. It represents the actual suite of protocols used by applications on the Internet. It is more flexible and consolidates the OSI's upper layers.

*Pentester Perspective:* Both are vital. TCP/IP helps us quickly grasp the overall connection flow, while the OSI model allows us to dissect and analyze intercepted network traffic (e.g., in Wireshark) layer by layer.

### Packet Transfers and Encapsulation

Data does not travel across a network as a single block; it is formatted and packaged as it moves through the layers. The unit of data at any given layer is called a **Protocol Data Unit (PDU)**.

**The Transmission Process (Encapsulation):**
1. When a user requests a website, the application passes the data to the highest layer (Application Layer).
2. As the data travels *down* the layers on the sending host, each layer performs its specific function and attaches its own control information, known as a **header**, to the data received from the layer above. 
3. This process of adding headers to build the final network packet is called **Encapsulation**. (The header plus the data payload becomes the new PDU for the layer below it).
4. The fully encapsulated data reaches the Physical Layer and is transmitted across the medium (cable/wireless) as raw bits.

**The Reception Process (De-encapsulation):**
1. The receiving host captures the bits at the Physical Layer.
2. As the data travels *up* the layers, each layer reads its corresponding header, processes the instructions, strips the header off, and passes the remaining payload to the layer above.
3. This reverse process continues until the original data is successfully unpacked and presented to the receiving application.
