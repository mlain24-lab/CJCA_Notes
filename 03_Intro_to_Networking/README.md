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

| Layer Type | The OSI Model | Common Protocols / Devices | The TCP/IP Model |
| :--- | :--- | :--- | :--- |
| **Host Layers** | 7. Application Layer | FTP, HTTP, DNS | **4. Application** (Maps to OSI 5, 6, 7) |
| | 6. Presentation Layer | JPG, PNG, SSL, TLS | |
| | 5. Session Layer | NetBIOS, RPC | |
| | 4. Transport Layer | TCP, UDP | **3. Transport** |
| **Media Layers** | 3. Network Layer | IP, ICMP / Router, L3 Switch | **2. Internet** |
| | 2. Data-Link Layer | MAC, ARP / Switch, Bridge | **1. Link** (Maps to OSI 1, 2) |
| | 1. Physical Layer | Ethernet, Wi-Fi / Network Card | |

### Packet Transfers and Encapsulation

Data does not travel across a network as a single block; it is formatted and packaged as it moves through the layers. The unit of data at any given layer is called a **Protocol Data Unit (PDU)**.

| OSI Layer | Protocol Data Unit (PDU) | Encapsulation Element Added |
| :--- | :--- | :--- |
| 7, 6, 5 (App/Pres/Sess) | **Data** | Application Headers |
| 4. Transport | **Segment** (TCP) / **Datagram** (UDP) | Transport Header (Source/Dest Ports) |
| 3. Network | **Packet** | Network Header (Source/Dest IPs) |
| 2. Data-Link | **Frame** | Frame Header (MACs) + Trailer (FCS) |
| 1. Physical | **Bits** | None (Raw electrical/optical signal) |

**The Transmission Process (Encapsulation):**
1. When a user requests a website, the application passes the data to the highest layer (Application Layer).
2. As the data travels *down* the layers on the sending host, each layer performs its specific function and attaches its own control information, known as a **header**, to the data received from the layer above. 
3. This process of adding headers to build the final network packet is called **Encapsulation**. (The header plus the data payload becomes the new PDU for the layer below it).
4. The fully encapsulated data reaches the Physical Layer and is transmitted across the medium (cable/wireless) as raw bits.

**The Reception Process (De-encapsulation):**
1. The receiving host captures the bits at the Physical Layer.
2. As the data travels *up* the layers, each layer reads its corresponding header, processes the instructions, strips the header off, and passes the remaining payload to the layer above.
3. This reverse process continues until the original data is successfully unpacked and presented to the receiving application.

# 03 - Introduction to Networking

## The OSI Reference Model

The primary objective of the ISO/OSI (Open Systems Interconnection) standard is to establish a universal reference framework. This model ensures interoperability and seamless communication across diverse hardware, vendors, and technologies. 

The OSI model dissects the complex process of network communication into **seven hierarchical layers**. Each layer represents a distinct phase in the connection lifecycle and performs strictly defined operations on the data packets. This modular approach is critical for network engineers and penetration testers to visualize, troubleshoot, and exploit network connections systematically.

### The 7 Layers of the OSI Model

| Layer | Name | Core Functionality |
| :---: | :--- | :--- |
| **7** | **Application** | Serves as the interface between the network and the application software. Controls data I/O and provides network services directly to the user's applications. |
| **6** | **Presentation** | Acts as the network's data translator. Formats, encrypts, and compresses system-dependent data into a standardized, application-independent syntax. |
| **5** | **Session** | Establishes, maintains, and terminates logical communication sessions between two hosts. It prevents connection drops and handles graceful session teardowns. |
| **4** | **Transport** | Manages end-to-end communication and data integrity. Handles flow control, congestion avoidance, and segments large data streams into manageable chunks. |
| **3** | **Network** | Handles logical addressing and routing. Determines the optimal path for data to travel across the entire network from the sender to the ultimate receiver. |
| **2** | **Data Link** | Facilitates reliable, error-free data transfer across the immediate physical medium. It packages raw bitstreams from Layer 1 into structured data **frames**. |
| **1** | **Physical** | Manages the physical hardware specifications. Transmits raw bitstreams via electrical, optical, or electromagnetic signals over wired or wireless media. |

### Layer Categorization & Data Flow

The OSI stack is conceptually divided into two functional groups:
* **Upper Layers (5-7):** Application-oriented. These layers deal primarily with application-level data formatting, session management, and user interfaces.
* **Lower Layers (1-4):** Transport and media-oriented. These layers manage the actual segmentation, routing, and physical transmission of data across the network infrastructure.

**Inter-Layer Communication:**
Each layer is strictly siloed; it provides services exclusively to the layer directly above it while consuming services from the layer directly below it. 

When two systems communicate, the payload traverses the entire OSI stack at least twice to ensure secure, reliable, and high-performance communication:
1. **Encapsulation (Sender):** The transmitting host processes the data top-down, starting at Layer 7 (Application) and wrapping the payload with specific headers at each step until it is transmitted as raw bits at Layer 1 (Physical).
2. **De-encapsulation (Receiver):** The receiving host processes the incoming bits bottom-up, starting at Layer 1 and unpacking the headers layer by layer until the original data payload reaches the target application at Layer 7.

## The TCP/IP Reference Model

The TCP/IP model, commonly referred to as the Internet Protocol Suite, is a streamlined, four-layer reference model that serves as the architectural backbone of the modern Internet. Named after its two foundational protocols—Transmission Control Protocol (TCP) and Internet Protocol (IP)—it focuses on practicality and implementation over the rigid theoretical boundaries of the OSI model. Structurally, IP operates at the Network level (OSI Layer 3), while TCP operates at the Transport level (OSI Layer 4).

### The 4 Layers of the TCP/IP Model

| Layer | Name | Core Functionality |
| :---: | :--- | :--- |
| **4** | **Application** | Consolidates OSI Layers 5, 6, and 7. It defines the protocols (e.g., HTTP, FTP, SSH) that software applications use to interact with the network and exchange payload data. |
| **3** | **Transport** | Maps directly to OSI Layer 4. Responsible for host-to-host communication, providing either reliable, connection-oriented sessions (TCP) or fast, connectionless datagram delivery (UDP). |
| **2** | **Internet** | Maps to OSI Layer 3. Handles logical addressing (IP addresses), packet encapsulation, and the routing of data across multiple independent networks to its final destination. |
| **1** | **Link** | Also known as the Network Access layer, it merges OSI Layers 1 and 2. It places TCP/IP packets onto the physical medium and receives them, functioning completely independent of the underlying hardware (e.g., Ethernet, Wi-Fi, Fiber) or frame formatting. |

By decoupling the application logic from the physical network infrastructure, the TCP/IP suite guarantees that software can communicate across completely disparate networks globally. IP acts as the navigator, ensuring the packet reaches the correct geographical/logical destination, while TCP acts as the delivery manager, ensuring the data stream arrives intact and in order.

### Core Mechanisms of the TCP/IP Suite

To understand how the suite operates in a real-world enterprise or pentesting scenario, we must break down its critical administrative and operational tasks:

| Core Task | Primary Protocol | Technical Description |
| :--- | :---: | :--- |
| **Logical Addressing** | IP | Given the massive scale of the Internet, hierarchical structuring is mandatory. IP handles the logical addressing of networks and individual nodes. It ensures packets are delivered strictly to the correct network segment utilizing methodologies like Subnetting, legacy Network Classes, and CIDR (Classless Inter-Domain Routing). |
| **Routing** | IP | At every hop (router) between the sender and receiver, the packet's destination IP is evaluated against a routing table to determine the optimal next node. This allows packets to traverse complex architectures even if the sender has no knowledge of the total path. |
| **Error & Flow Control** | TCP | TCP establishes a stateful, "virtual" connection between endpoints (via the 3-way handshake). It continuously utilizes sequence numbers, acknowledgments (ACKs), and control messages to monitor connection health, prevent network congestion, and guarantee packet delivery. |
| **Application Multiplexing** | TCP / UDP | Ports (ranging from 0 to 65535) provide a software abstraction layer that allows a single IP address to simultaneously handle traffic for multiple different services (e.g., Port 80 for HTTP, Port 22 for SSH) without data streams crossing. |
| **Name Resolution** | DNS | The Domain Name System translates human-readable Fully Qualified Domain Names (FQDNs, like `www.hackthebox.com`) into routable numerical IP addresses, acting as the directory service for the network. |

## Network Layer (Layer 3)

The **Network Layer** (Layer 3) is responsible for the delivery of packets across multiple networks. Unlike the Data Link Layer, which handles node-to-node delivery within the same segment, Layer 3 manages end-to-end communication by determining the optimal path through various routing nodes.

### Core Responsibilities

* **Logical Addressing:** While MAC addresses are physical and hardcoded, Layer 3 uses logical addressing (IP addresses) to identify hosts and networks globally.
* **Routing:** This is the primary function of Layer 3. Routers evaluate the destination IP address of incoming packets and use **Routing Tables** to forward them toward their final destination through intermediate nodes.
* **Encapsulation/Decapsulation:** Data from the Transport Layer is encapsulated into **Packets**. At each hop, routers may decapsulate the packet to read the IP header before forwarding it to the next destination.
* **Fragmentation and Reassembly:** If a packet is too large for the Maximum Transmission Unit (MTU) of a specific network segment, the Network Layer splits it into smaller fragments and reassembles them at the destination.



### Technical Protocols

Protocols at this layer define the rules for logical communication. They are transparent to the layers above and below, ensuring that the Transport Layer remains unaware of the underlying routing complexity.

| Protocol | Description |
| :--- | :--- |
| **IPv4 / IPv6** | The standard protocols for logical addressing and packet routing. |
| **IPsec** | Provides security, integrity, and confidentiality for IP communication. |
| **ICMP** | Used for diagnostics and error reporting (e.g., `ping`, `traceroute`). |
| **IGMP** | Manages IP multicast group memberships. |
| **OSPF / RIP** | Interior Gateway Protocols (IGP) used by routers to exchange routing table information. |

### Intermediate Node Processing

A critical aspect of Layer 3 is that intermediate nodes (routers) typically do not process data in layers higher than L3. When a packet arrives at a router:
1.  The router inspects the **Layer 3 header**.
2.  It determines the next hop based on its routing logic.
3.  It assigns a new intermediate destination (at the Data Link Layer) and forwards the packet.
4.  The data payload remains untouched, ensuring high-speed delivery through the network fabric.

This mechanism allows for seamless communication between subnets that may use different addressing schemes or physical media, effectively bridging disparate network environments.

# Network Addressing & IPv4 Fundamentals

## 1. MAC vs. IP Addresses (Layer 2 vs. Layer 3)
To establish communication across networks, relying solely on a **Media Access Control (MAC)** address is insufficient. While MAC addresses handle local physical delivery within the same segment, routing data across different networks—like the Internet—requires logical addressing via **IPv4** or **IPv6**.

Regardless of the network's scale (from a simple Homelab to the global Internet), the IP address ensures packet delivery to the correct destination. 

**Analogy:**
* **IPv4 / IPv6 (Layer 3):** The postal code and street address of a building (routes the packet to the right location).
* **MAC (Layer 2):** The specific floor and apartment number (delivers the packet to the exact NIC).

*Note: A single IP can address multiple receivers (Multicast/Broadcast), and a single interface can bind multiple IPs. However, within a standard subnet, each IP must be unique to avoid IP conflicts.*

---

## 2. IPv4 Structure and Architecture
**IPv4** is a 32-bit binary number divided into four 8-bit groups called **octets** (4 bytes total). For human readability, these are converted into decimal numbers (ranging from `0` to `255`) and formatted using **dotted-decimal notation**.

**Example Structure:**
| Notation | Representation | Binary Breakdown | Decimal |
| :--- | :--- | :--- | :--- |
| **Localhost** | Loopback Address | `0111 1111.0000 0000.0000 0000.0000 0001` | `127.0.0.1` |

The 32-bit architecture limits the global pool to 4,294,967,296 unique addresses. Every IP is logically divided into two parts:
1. **Network Part:** Identifies the specific network segment (assigned by IANA globally, or by the network administrator locally).
2. **Host Part:** Identifies the specific device (router, workstation, printer) within that network.

---

## 3. Legacy Network Classes (Classful Addressing)
Historically, the IP space was rigidly divided into predefined Classes (A through E). The class dictates the default length of the network and host portions. 

* **Network Address:** The first IP of the subnet, used to identify the subnet itself.
* **Broadcast Address:** The last IP of the subnet, used to send packets to all hosts in the network simultaneously.
* **Usable IPs:** Calculated as `Total IPs - 2` (reserving the Network and Broadcast addresses).

| Class | Network Address | First Usable IP | Last Usable IP | Default Subnet Mask | CIDR | Usable Hosts |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | `1.0.0.0` | `1.0.0.1` | `127.255.255.254` | `255.0.0.0` | `/8` | 16,777,214 |
| **B** | `128.0.0.0` | `128.0.0.1` | `191.255.255.254` | `255.255.0.0` | `/16` | 65,534 |
| **C** | `192.0.0.0` | `192.0.0.1` | `223.255.255.254` | `255.255.255.0` | `/24` | 254 |
| **D** | `224.0.0.0` | *Multicast* | *Multicast* | *N/A* | *N/A* | *Multicast Traffic* |
| **E** | `240.0.0.0` | *Reserved* | *Reserved* | *N/A* | *N/A* | *Experimental* |

### Default Gateway
The **Default Gateway** is the IP address of the router interface connected to the local subnet. It routes traffic destined for external networks. By de-facto industry standard, network admins typically assign either the **first** or **last** usable IP address of the subnet to the gateway.

---

## 4. Binary to Decimal Conversion
To understand subnetting, you must be comfortable with Base-2 (Binary) math. Each bit in an octet represents a power of 2.

**Bit Values:** `128 | 64 | 32 | 16 | 8 | 4 | 2 | 1`

Let's break down the IP address `192.168.10.39`:

| Octet | Binary Representation | Bit Math (Sum of active '1' bits) | Decimal |
| :---: | :--- | :--- | :---: |
| **1st** | `1100 0000` | 128 + 64 | **192** |
| **2nd** | `1010 1000` | 128 + 32 + 8 | **168** |
| **3rd** | `0000 1010` | 8 + 2 | **10** |
| **4th** | `0010 0111` | 32 + 4 + 2 + 1 | **39** |

---

## 5. Subnetting & CIDR (Classless Inter-Domain Routing)
Classful addressing resulted in massive IP wastage. Modern networking relies on **CIDR**, which allows us to borrow bits from the host portion to create custom-sized subnets.

The **Subnet Mask** dictates exactly which bits belong to the network (represented by `1`s) and which belong to the host (represented by `0`s).

**Example: `/24` Subnet Mask**
The CIDR suffix (e.g., `/24`) simply counts the number of `1`s in the subnet mask.

```text
Octet:             1st         2nd         3rd         4th
Binary:         1111 1111 . 1111 1111 . 1111 1111 . 0000 0000 
Decimal:           255    .    255    .    255    .     0

```

