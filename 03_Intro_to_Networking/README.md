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

# IPv4 Subnetting & Network Segmentation

## 1. Core Concepts: Subnetting Basics
From a SysAdmin and Pentester perspective, subnetting is the logical segmentation of a larger IP address space into smaller, isolated networks. Think of it as creating distinct broadcast domains within a corporate infrastructure—each separated by a logical boundary that optimizes network performance and enforces strict access controls.

Key identifiers within any given subnet:
* **Network Address:** The routing identifier for the subnet itself.
* **Broadcast Address:** Used to transmit data packets to all hosts within that specific subnet.
* **First Usable Host:** The first assignable IP (conventionally reserved for the Default Gateway).
* **Last Usable Host:** The final assignable IP before the broadcast address.

## 2. Anatomy of an IPv4 Address
Let's break down a real-world deployment example: `192.168.12.160/26`.
An IPv4 address is split into two components defined by the subnet mask: the **Network Part** (fixed) and the **Host Part** (variable).

| Element | 1st Octet | 2nd Octet | 3rd Octet | 4th Octet | Decimal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IPv4 Address** | `11000000` | `10101000` | `00001100` | `10\|100000` | `192.168.12.160` |
| **Subnet Mask** | `11111111` | `11111111` | `11111111` | `11\|000000` | `255.255.255.192` |
| **CIDR Boundary** | `/8` | `/16` | `/24` | **`/26`** | |

> **Note:** The `1` bits in the subnet mask lock down the network portion. The `0` bits represent the available host space.

## 3. Determining Subnet Boundaries
To route packets correctly, we need to define the absolute boundaries of our `/26` subnet. The subnet mask dictates exactly where the network-to-host separation occurs.

* **Network Address:** Set all host bits to `0`.
  * Binary: `11000000.10101000.00001100.10\|000000`
  * Result: `192.168.12.128`
* **Broadcast Address:** Set all host bits to `1`.
  * Binary: `11000000.10101000.00001100.10\|111111`
  * Result: `192.168.12.191`

**Host Capacity Calculation:**
Total IPs: 64. 
Usable IPs: 64 - 2 (Network & Broadcast) = **62 usable hosts** (`192.168.12.129` - `192.168.12.190`).

## 4. Subnetting into Smaller Networks (VLSM)
**Scenario:** You are tasked with dividing the `192.168.12.128/26` subnet into 4 smaller, equal-sized subnets.

Subnetting relies heavily on powers of 2. To create 4 new subnets, we need to borrow bits from the host portion of our current mask.
* 2^2 = 4 subnets $\rightarrow$ We must borrow **2 bits**.
* New CIDR: `/26` + 2 bits = **`/28`**.
* New Subnet Mask: `255.255.255.240`.

Now, we divide our original block of 64 IPs by 4, giving us **16 IPs per subnet** (14 usable hosts per segment).

### Subnet Allocation Table
| Subnet # | Network Address | First Usable | Last Usable | Broadcast Address | CIDR |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `192.168.12.128` | `192.168.12.129` | `192.168.12.142` | `192.168.12.143` | `/28` |
| **2** | `192.168.12.144` | `192.168.12.145` | `192.168.12.158` | `192.168.12.159` | `/28` |
| **3** | `192.168.12.160` | `192.168.12.161` | `192.168.12.174` | `192.168.12.175` | `/28` |
| **4** | `192.168.12.176` | `192.168.12.177` | `192.168.12.190` | `192.168.12.191` | `/28` |

## 5. Mental Subnetting (Field Ops Trick)
Fast, on-the-fly subnetting without a calculator is critical during network enumerations (e.g., scoping targets for Nmap) or deploying infrastructure. Memorization isn't necessary if you understand the Modulo (`%`) operation on octets.

1. **Identify the Target Octet:** The CIDR dictates which octet changes.
   * `/8` (1st), `/16` (2nd), `/24` (3rd), `/32` (4th).
   * Example: For `192.168.1.1/25`, the CIDR falls in the 4th octet (between `/24` and `/32`). This means `192.168.2.x` is an entirely different network.

2. **Calculate the Subnet Block Size:** Divide the CIDR by 8 and find the remainder (Modulo).
   * Calculation for `/25`: `25 % 8 = 1`.
   * This means 1 bit is borrowed in the 4th octet.
   * Remaining host bits: `8 - 1 = 7`.
   * Block size: 2^7 = **128 IPs** per subnet.

3. **Determine Boundaries:** Since `0` counts as an IP in networking, the first block always spans from `0` to `Block Size - 1`.
   * **Block 1:** `192.168.1.0` - `192.168.1.127` (Usable space: `.1` to `.126`)
   * **Block 2:** `192.168.1.128` - `192.168.1.255` (Usable space: `.129` to `.254`)

# IPv4 Subnetting Reference Table (Class C focus)

| CIDR | Máscara Decimal | Salto (Mágico) | IPs Usables | Inicio de Red (Subnet) | Dirección de Broadcast |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **/24** | 255.255.255.0 | 256 | 254 | .0 | .255 |
| **/25** | 255.255.255.128 | 128 | 126 | .0, .128 | .127, .255 |
| **/26** | 255.255.255.192 | 64 | 62 | .0, .64, .128, .192 | .63, .127, .191, .255 |
| **/27** | 255.255.255.224 | 32 | 30 | Múltiplos de 32 (0, 32, 64...) | (Próxima red) - 1 |
| **/28** | 255.255.255.240 | 16 | 14 | Múltiplos de 16 (0, 16, 32...) | (Próxima red) - 1 |
| **/29** | 255.255.255.248 | 8 | 6 | Múltiplos de 8 (0, 8, 16...) | (Próxima red) - 1 |
| **/30** | 255.255.255.252 | 4 | 2 | Múltiplos de 4 (0, 4, 8, 12...) | (Próxima red) - 1 |
| **/31** | 255.255.255.254 | 2 | 0* | Múltiplos de 2 | (Próxima red) - 1 |
| **/32** | 255.255.255.255 | 1 | 1 | La IP específica (Host) | No aplica |

# Network Fundamentals: Subnetting & VLSM Logic

## 1. The Magic Number Method
In IPv4 networking, the "Magic Number" is the size of the block (total IPs). It is the most efficient way to identify Network IDs and Broadcast addresses without a calculator.

**Calculation:**
`256 - (Decimal Mask) = Magic Number (Jump size)`

| CIDR | Subnet Mask | Magic Number | Total IPs |
| :--- | :--- | :--- | :--- |
| /27 | .224 | 32 | 32 |
| /28 | .240 | 16 | 16 |
| /29 | .248 | 8 | 8 |
| /30 | .252 | 4 | 4 |

## 2. Variable Length Subnet Masking (VLSM) ??
?? VLSM (Variable Length Subnet Masking) allows us to divide a network into subnets of different sizes, maximizing IP address efficiency.
?? VLSM (Máscara de Subred de Longitud Variable) permite dividir una red en subredes de distintos tamaños, optimizando al máximo el uso de direcciones IP y evitando el desperdicio.

### Practical Workflow: Splitting a Subnet
To split a network into equal parts:
1. Identify the total IPs in the parent block.
2. Divide by the number of required subnets to find the new **Magic Number**.
3. Determine the new CIDR based on that jump size.
4. Calculate the boundaries (Subnet & Broadcast).

**Example Case:**
* **Parent Network:** `10.200.20.0/27` (32 IPs)
* **Goal:** Split into 4 subnets.
* **Math:** $32 / 4 = 8$ (New Magic Number = 8).
* **New CIDR:** `/29` (A jump of 8 corresponds to `/29`).

| Subnet # | Network ID | IP Range (Usable) | Broadcast |
| :--- | :--- | :--- | :--- |
| 1st | .0 | .1 - .6 | .7 |
| 2nd | .8 | .9 - .14 | .15 |
| 3rd | .16 | .17 - .22 | .23 |
| 4th | .24 | .25 - .30 | .31 |

## 3. Quick Reference for Pentesting (HTB/CJCA)
* **Subnet Address:** Always a multiple of the Magic Number.
* **First Usable IP:** Network ID + 1.
* **Last Usable IP:** Broadcast Address - 1.
* **Broadcast Address:** (Next Network ID) - 1.

> **Junior SysAdmin Note:** When performing network enumeration with Nmap, always check the CIDR. Attacking a `.0` or a `.255` address might be useless if you are within a `/27` or `/28` range where those aren't the actual boundaries.

# Layer 2 Addressing & Address Resolution Protocol (ARP)

## Media Access Control (MAC) Addresses
In network topology, every host interface requires a 48-bit (6-octet) Media Access Control (MAC) address, represented in hexadecimal format. Operating at OSI Layer 2, the MAC address acts as the physical hardware identifier for network interfaces across various IEEE standards:
- **Ethernet:** IEEE 802.3
- **WLAN:** IEEE 802.11
- **Bluetooth:** IEEE 802.15

While manufacturers hardcode this address into the Network Interface Controller (NIC) during production, it can be easily modified or spoofed via software at the OS level—a crucial mechanic for both system administration troubleshooting and penetration testing.

### Anatomy of a MAC Address
A MAC address spans 6 bytes (48 bits). Let's break down an example: `DE:AD:BE:EF:13:37`

- **First 3 Bytes (24 bits) - OUI:** The *Organizationally Unique Identifier* is defined by the IEEE and assigned to specific hardware manufacturers.
- **Last 3 Bytes (24 bits) - NIC:** The *Network Interface Controller* portion is uniquely assigned by the manufacturer to prevent physical collisions on the network.

### Layer 2 Delivery Mechanics
When IP packets are encapsulated into Ethernet frames, they must be addressed at Layer 2. The delivery flow depends on the subnet architecture:
- **Intra-subnet:** If the destination IP is within the same local network (LAN), the frame is delivered directly to the target's MAC address.
- **Inter-subnet:** If the target resides on a different subnet, the frame is addressed to the MAC address of the default gateway (router). The router then decapsulates the frame and handles the Layer 3 routing to the next hop.

### Address Types & Bit Flags
Specific bit states within the first octet define how the network handles the frame:
- **Unicast (Last bit is 0):** One-to-one communication. The frame targets a single, specific host. Example: `DE:AD:BE:EF:13:37`
- **Multicast (Last bit is 1):** One-to-many communication. The frame is sent to all hosts, but only those configured to listen to that specific multicast group will process it. Example: `01:00:5E:EF:13:37`
- **Broadcast:** Sent to every host on the local network segment. The address is statically set to `FF:FF:FF:FF:FF:FF`. Essential for discovery protocols like ARP and DHCP.
- **Global vs. Locally Administered:** The second-to-last bit of the first octet indicates whether the MAC is a globally unique OUI (0) or if it has been locally administered/overridden by a network admin (1).

---

## Layer 2 Threat Landscape
Since Layer 2 relies on implicit trust without inherent encryption or authentication, it is highly vulnerable during internal network pentesting:
- **MAC Spoofing:** Altering a device's MAC address to impersonate a legitimate host. Often used to bypass Network Access Control (NAC) or captive portals.
- **MAC Flooding:** Overwhelming a switch's CAM (Content Addressable Memory) table by sending thousands of fake MAC addresses. This forces the switch into a "fail-open" state, causing it to act like a legacy hub and broadcast all traffic, which enables passive packet sniffing.
- **MAC Filtering Bypass:** Cloning whitelisted MAC addresses to gain unauthorized access to restricted physical or wireless networks.

---

## Address Resolution Protocol (ARP)
ARP is the bridge between Layer 3 (IP addresses) and Layer 2 (MAC addresses) over an IPv4 LAN. It maps a logical IP to a physical MAC, allowing Ethernet frames to be accurately addressed and delivered.

### How ARP Works
1. **ARP Request:** A device broadcasts a query to the entire LAN: *"Who has IP X.X.X.X? Tell IP Y.Y.Y.Y"*.
2. **ARP Reply:** The host holding the requested IP responds directly (unicast) to the sender with its MAC address.

*Tshark Capture - Normal ARP Flow:*
```bash
1   0.000000 10.129.12.100 -> 10.129.12.255 ARP 60  Who has 10.129.12.101?  Tell 10.129.12.100
2   0.000015 10.129.12.101 -> 10.129.12.100 ARP 60  10.129.12.101 is at AA:AA:AA:AA:AA:AA
```

### ARP Cache Poisoning (ARP Spoofing)
Because ARP is stateless, network hosts will accept and cache ARP replies even if they never sent out a corresponding request (Gratuitous ARP). Attackers leverage tools like `Ettercap` or `Cain & Abel` to exploit this vulnerability.

By broadcasting falsified ARP replies, an attacker associates their own MAC address with the IP address of a critical asset (typically the default gateway). 

*Tshark Capture - ARP Poisoning Attack:*
```bash
# Attacker (10.129.12.100) claims to be the Gateway (10.129.12.255) by sending a spoofed reply to the Target (10.129.12.101)
1   0.000000 10.129.12.100 -> 10.129.12.101 ARP 60 10.129.12.255 is at CC:CC:CC:CC:CC:CC  

# Target queries for the Gateway, but its ARP cache is already poisoned
4   0.000045 10.129.12.101 -> 10.129.12.100 ARP 60 Who has 10.129.12.255? Tell 10.129.12.101
```

**Impact:** By successfully hijacking the routing path, the attacker establishes a Man-in-the-Middle (MITM) position. This allows for total traffic interception, credential harvesting, session hijacking, or DNS spoofing. 

**Mitigation:** Preventing Layer 2 attacks requires infrastructure-level defenses such as Dynamic ARP Inspection (DAI) on managed switches, network segmentation, and enforcing end-to-end encryption protocols (IPSec, SSL/TLS) to render intercepted traffic useless to the attacker.

### Appendix: MAC Address Binary Representation & Bit Flags
Understanding the binary structure of a MAC address is critical for low-level packet analysis and CJCA exam scenarios. A MAC address spans 6 bytes (48 bits). 

Let's break down the hex-to-binary conversion using the example `DE:AD:BE:EF:13:37`:

| Representation | 1st Octet | 2nd Octet | 3rd Octet | 4th Octet | 5th Octet | 6th Octet |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hex** | DE | AD | BE | EF | 13 | 37 |
| **Binary** | 1101 1110 | 1010 1101 | 1011 1110 | 1110 1111 | 0001 0011 | 0011 0111 |

Specific bit states within the **first octet** dictate how the switch handles the Ethernet frame:

**1. Unicast vs. Multicast (Least Significant Bit of 1st Octet):**
- **Unicast (Bit = 0):** One-to-one communication. The frame targets a single, specific host. *(Example Hex: `DE`, Binary: `1101 1110`)*
- **Multicast (Bit = 1):** One-to-many communication. Sent to all hosts, but only processed by those subscribed to the multicast group. *(Example Hex: `01`, Binary: `0000 0001`)*

**2. Global vs. Locally Administered (Second Least Significant Bit of 1st Octet):**
- **Global OUI (Bit = 0):** Uniquely assigned by the IEEE. *(Example Hex: `DC`, Binary: `1101 1100`)*
- **Locally Administered (Bit = 1):** Overridden or assigned manually by a SysAdmin/attacker (MAC Spoofing). *(Example Hex: `DE`, Binary: `1101 1110`)*

**3. Broadcast Address:**
The broadcast address targets every host on the local segment, turning all 48 bits to `1`. Essential for protocols like ARP and DHCP.
- **Hex:** `FF:FF:FF:FF:FF:FF`
- **Binary:** `1111 1111` `1111 1111` `1111 1111` `1111 1111` `1111 1111` `1111 1111`

# IPv6 Addressing: Architecture and Fundamentals

## Overview
Internet Protocol version 6 (IPv6) is the successor to IPv4, designed primarily to resolve the issue of IP address exhaustion. While IPv4 uses a 32-bit addressing scheme, IPv6 utilizes **128-bit addresses**, exponentially increasing the available address space. 

IPv6 is managed by the Internet Assigned Numbers Authority (**IANA**) and is designed for the modern "end-to-end" principle, eliminating the necessity for Network Address Translation (NAT). Most modern systems utilize a **Dual Stack** configuration, allowing IPv4 and IPv6 to operate simultaneously on the same infrastructure.

### Key Advantages over IPv4
* **Massive Address Space:** Supports approximately $340 \times 10^{36}$ (undecillion) addresses.
* **Stateless Address Autoconfiguration (SLAAC):** Allows hosts to generate their own addresses without a DHCP server.
* **Efficiency:** Streamlined headers for faster routing and support for Jumbograms (packets up to 4 GB).
* **No Broadcast:** Replaces broadcast with specialized multicast, reducing network noise.
* **Multi-Homing:** Interfaces can support multiple IPv6 addresses (e.g., Link-Local and Global Unicast).

---

## Technical Comparison: IPv4 vs. IPv6

| Feature | IPv4 | IPv6 |
| :--- | :--- | :--- |
| **Bit Length** | 32-bit | 128-bit |
| **Address Range** | ~4.3 Billion | ~340 Undecillion |
| **Representation** | Dotted Decimal | Hexadecimal |
| **Standard Prefix** | `/24` | `/64` |
| **Address Assignment** | DHCP / Static | SLAAC / DHCPv6 |
| **Security (IPsec)** | Optional Extension | Native / Mandatory Support |

---

## Address Types
IPv6 categorizes communication into three distinct types:

1.  **Unicast:** Communication between a single source and a single destination interface.
2.  **Anycast:** One-to-nearest communication. The packet is routed to the nearest interface (defined by routing distance) sharing the same address.
3.  **Multicast:** One-to-many communication. Packets are delivered to all interfaces belonging to a specific multicast group (e.g., `ff02::1` for all nodes).

> **Note:** IPv6 does not use Broadcast. Network discovery is handled via Multicast groups and the Neighbor Discovery Protocol (NDP).

---

## The Hexadecimal System
IPv6 uses hexadecimal notation (Base 16) to represent the 128-bit address in a human-readable format. Each hex character represents a **4-bit nibble**.

| Decimal | Hex | Binary | Decimal | Hex | Binary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | 0 | 0000 | 8 | 8 | 1000 |
| 1 | 1 | 0001 | 9 | 9 | 1001 |
| 2 | 2 | 0010 | 10 | A | 1010 |
| 3 | 3 | 0011 | 11 | B | 1011 |
| 4 | 4 | 0100 | 12 | C | 1100 |
| 5 | 5 | 0101 | 13 | D | 1101 |
| 6 | 6 | 0110 | 14 | E | 1110 |
| 7 | 7 | 0111 | 15 | F | 1111 |

---

## Address Structure & Notation
An IPv6 address consists of **16 bytes** divided into **8 blocks** (hextets) of 16 bits each. Blocks are separated by colons (`:`).


### Parts of the Address
1.  **Network Prefix (Network Part):** Typically the first 64 bits. It identifies the specific network or subnet assigned by the ISP/IANA.
2.  **Interface Identifier (Host Part):** The final 64 bits. It identifies the specific interface. This can be generated via SLAAC, often using the EUI-64 process which incorporates the device's MAC address.

### Compression Rules (RFC 5952)
To simplify notation, IPv6 addresses should be compressed using the following standard rules:
* **Omit Leading Zeros:** Within a block, leading zeros are removed (e.g., `:00AB:` becomes `:AB:`).
* **Double Colon (::):** One or more consecutive blocks of zeros can be replaced by `::`. This can only be done **once** per address to avoid ambiguity.
* **Lowercase:** All hexadecimal letters (a-f) must be written in lowercase.

**Example Conversion:**
- **Full:** `fe80:0000:0000:0000:dd80:b1a9:6687:2d3b`
- **Compressed:** `fe80::dd80:b1a9:6687:2d3b`

## Networking Fundamentals: Key Terminology & Protocols

In the field of Information Technology, and specifically within Cybersecurity and System Administration, mastering the "alphabet" of networking is non-negotiable. The landscape is vast, comparable to the medical sector in complexity and specialization. A professional can spend an entire career mastering just a few of these domains.

The following list establishes the foundational protocols and terminology required to navigate the CJCA modules and professional environments. While not exhaustive, these represent the most common protocols encountered in enterprise infrastructures.

### Protocol Reference Table

| Protocol / Term | Acronym | Technical Description & Security Context |
| :--- | :--- | :--- |
| **Wired Equivalent Privacy** | **WEP** | A deprecated and highly vulnerable security protocol for 802.11 wireless networks. Easily cracked with modern tools. |
| **Secure Shell** | **SSH** | The industry standard for secure remote administration, providing encrypted command-line access. |
| **File Transfer Protocol** | **FTP** | A legacy protocol for transferring files. Insecure by nature as it transmits credentials in plaintext. |
| **Simple Mail Transfer Protocol** | **SMTP** | The standard communication protocol for sending and relaying outgoing email traffic. |
| **Hypertext Transfer Protocol** | **HTTP** | An application-layer protocol for distributed information systems; the foundation of data communication for the Web. |
| **Server Message Block** | **SMB** | Primarily used in Windows environments for providing shared access to files, printers, and serial ports. High interest for Pentesters. |
| **Network File System** | **NFS** | A distributed file system protocol used primarily in Unix/Linux environments to access files over a network. |
| **Simple Network Management Protocol** | **SNMP** | Used for collecting and organizing information about managed devices on IP networks and for modifying that information. |
| **Wi-Fi Protected Access** | **WPA** | A security standard for wireless networks designed to provide better data encryption and user authentication than WEP. |
| **Temporal Key Integrity Protocol** | **TKIP** | A legacy stopgap security protocol used in WPA to replace WEP without requiring hardware upgrades. Now considered weak. |
| **Network Time Protocol** | **NTP** | Essential for clock synchronization between computer systems over packet-switched, variable-latency data networks. |
| **Virtual Local Area Network** | **VLAN** | A logical partition of a Layer 2 network, used to isolate traffic and improve security/performance. |
| **VLAN Trunking Protocol** | **VTP** | A Cisco proprietary protocol that propagates the definition of VLANs on the whole local area network. |
| **Routing Information Protocol** | **RIP** | A legacy distance-vector routing protocol that uses hop count as a routing metric. |
| **Open Shortest Path First** | **OSPF** | A link-state routing protocol (IGP) used to find the best path for packets as they pass through a set of connected networks. |
| **Interior Gateway Routing Protocol** | **IGRP** | A legacy Cisco proprietary distance-vector routing protocol (superseded by EIGRP). |
| **Enhanced IGRP** | **EIGRP** | An advanced distance-vector routing protocol with features of link-state protocols, proprietary to Cisco. |
| **Pretty Good Privacy** | **PGP** | An encryption program that provides cryptographic privacy and authentication for data communication (Emails/Files). |
| **Network News Transfer Protocol** | **NNTP** | An application protocol used for transporting Usenet news articles between news servers. |
| **Cisco Discovery Protocol** | **CDP** | A proprietary Layer 2 network protocol used by Cisco equipment to share information about other directly connected Cisco equipment. |
| **Hot Standby Router Protocol** | **HSRP** | A Cisco proprietary redundancy protocol for establishing a fault-tolerant default gateway. |
| **Virtual Router Redundancy Protocol** | **VRRP** | A standard-based alternative to HSRP, providing high availability for routers. |
| **Spanning Tree Protocol** | **STP** | A Layer 2 protocol that prevents bridge loops and the resulting broadcast storms in Ethernet networks. |
| **TACACS+** | **TACACS** | A protocol providing centralized AAA (Authentication, Authorization, and Accounting) services for network devices. |
| **Session Initiation Protocol** | **SIP** | A signaling protocol used for initiating, maintaining, and terminating real-time sessions (Voice/Video). |
| **Voice Over IP** | **VoIP** | A group of technologies for the delivery of voice communications and multimedia sessions over IP networks. |
| **Extensible Authentication Protocol** | **EAP** | An authentication framework frequently used in wireless networks and point-to-point connections. |
| **Lightweight EAP** | **LEAP** | A Cisco-proprietary version of EAP. Now considered insecure due to susceptibility to dictionary attacks. |
| **Protected EAP** | **PEAP** | A protocol that encapsulates EAP within a TLS tunnel to enhance security during the authentication process. |
| **Systems Management Server** | **SMS** | (Now SCCM) A systems management software product by Microsoft for managing large groups of computers. |
| **Microsoft Baseline Security Analyzer**| **MBSA** | A legacy tool used to determine the security state of Windows systems by identifying missing updates and misconfigurations. |
| **SCADA** | **SCADA** | A control system architecture used for high-level process supervisory management of industrial infrastructure. |
| **Virtual Private Network** | **VPN** | Creates a secure, encrypted tunnel over a less secure network (like the Internet). |
| **Internet Protocol Security** | **IPsec** | A suite of protocols used to secure IP communications by authenticating and encrypting each IP packet in a stream. |
| **Point-to-Point Tunneling Protocol** | **PPTP** | An obsolete method for implementing VPNs with many known security vulnerabilities. |
| **Network Address Translation** | **NAT** | A method of remapping one IP address space into another, typically used to connect private networks to the Internet. |
| **Carriage Return Line Feed** | **CRLF** | Special control characters used to signify the end of a line of text (CR: \r, LF: \n). |
| **AJAX** | **AJAX** | A set of web development techniques using many web technologies on the client side to create asynchronous web applications. |
| **ISAPI** | **ISAPI** | An N-tier API of Internet Information Services (IIS). |
| **Uniform Resource Identifier** | **URI** | A unique sequence of characters used to identify a logical or physical resource on the web. |
| **Uniform Resource Locator** | **URL** | A specific type of URI that provides a means of locating a resource by describing its primary access mechanism. |
| **Internet Key Exchange** | **IKE** | The protocol used to set up a security association (SA) in the IPsec protocol suite. |
| **Generic Routing Encapsulation** | **GRE** | A tunneling protocol developed by Cisco that can encapsulate a wide variety of network layer protocols inside virtual point-to-point links. |
| **Remote Shell** | **RSH** | A command-line computer program that can execute shell commands as another user, and on a remote computer over the network. Insecure. |

# Network Fundamentals: Common Protocols & Communication Standards

## Overview of Network Protocols
Network protocols are standardized sets of rules defined by **RFCs** (Requests for Comments) that govern how data is exchanged across a network. These standards ensure interoperability between heterogeneous hardware and software environments. At a foundational level, most network communication relies on either **TCP** (Transmission Control Protocol) or **UDP** (User Datagram Protocol).

---

## 1. Transmission Control Protocol (TCP)
TCP is a **connection-oriented** (stateful) protocol. It ensures reliable data delivery by establishing a virtual connection through a **Three-Way Handshake** (SYN, SYN-ACK, ACK).

*   **Reliability:** Provides error-checking, sequencing, and acknowledgment of received packets.
*   **Performance:** Higher overhead due to connection management, making it slower than UDP but essential for data integrity (e.g., Web browsing, File transfers).

(img/tcp_handshake.png)

### Common TCP Protocols
| Protocol | Port | Description |
| :--- | :---: | :--- |
| **SSH** | 22 | Secure encrypted remote access. |
| **Telnet** | 23 | Unencrypted (insecure) remote login service. |
| **SMTP** | 25 | Simple Mail Transfer Protocol for email routing. |
| **DNS** | 53 | Zone transfers and large queries. |
| **HTTP / HTTPS** | 80 / 443 | Web traffic (Cleartext / SSL-TLS Encrypted). |
| **POP3 / IMAP** | 110 / 143 | Email retrieval from servers. |
| **SMB** | 445 | Server Message Block for Windows file sharing. |
| **RDP** | 3389 | Remote Desktop Protocol for GUI-based access. |
| **MSSQL** | 1433 | Microsoft SQL Server database engine. |

---

## 2. User Datagram Protocol (UDP)
UDP is a **connectionless** (stateless) protocol. It broadcasts data to the destination without verifying receipt or establishing a prior session.

*   **Speed:** Minimal overhead makes it ideal for real-time applications.
*   **Use Cases:** Streaming, VoIP, and services where occasional packet loss is acceptable (e.g., YouTube, gaming).

### Common UDP Protocols
| Protocol | Port | Description |
| :--- | :---: | :--- |
| **DNS** | 53 | Standard domain name resolution queries. |
| **DHCP** | 67, 68 | Dynamic assignment of IP addresses and network config. |
| **TFTP** | 69 | Trivial File Transfer Protocol (unauthenticated). |
| **NTP** | 123 | Network Time Protocol for clock synchronization. |
| **SNMP** | 161, 162 | Network device monitoring and management. |
| **Syslog** | 514 | Standard protocol for message logging. |

---

## 3. Internet Control Message Protocol (ICMP)
ICMP is primarily used for diagnostic and error-reporting purposes. It functions at the Network Layer to provide feedback about communication issues.

### ICMP Types & Diagnostic Tools
*   **Echo Request (Type 8):** Used by `ping` and `traceroute` to verify reachability.
*   **Echo Reply (Type 0):** The response sent to an Echo Request.
*   **Destination Unreachable:** Indicates a packet could not be delivered.
*   **Time Exceeded:** Generated when a packet's **TTL (Time-To-Live)** reaches zero.

### OS Fingerprinting via TTL
As a Pentester, the default TTL value in a response can help identify the target's Operating System:

| OS Type | Default TTL |
| :--- | :---: |
| **Linux / macOS** | 64 |
| **Windows** | 128 |
| **Solaris / Network Gear** | 255 |

> **Note:** These values can be manually modified by administrators to obfuscate the system identity.

---

## 4. Voice over IP (VoIP) & Session Initiation Protocol (SIP)
VoIP enables voice and multimedia communication over IP networks. **SIP** is the primary signaling protocol used to manage these sessions.

### SIP Interaction Methods
SIP uses specific "Methods" to control calls and sessions:
*   **INVITE:** Initiates a session.
*   **ACK:** Confirms the final response to an INVITE.
*   **OPTIONS:** Queries a server for supported capabilities/methods.
*   **BYE:** Terminates an active session.

### Security Implications & Information Disclosure
*   **User Enumeration:** Attackers can use the `OPTIONS` method or specialized tools to identify valid extensions/users on a SIP server for future brute-force attempts.
*   **Cisco Configuration Files:** Finding files like `SEPxxxx.cnf` (often via TFTP) is critical. These files contain device-specific configurations (MAC-based naming) and can reveal firmware versions, proxy settings, and other sensitive infrastructure details.

# Wireless Networks Fundamentals & Security



## 1. Overview of Wireless Networks
Wireless networks facilitate data exchange between nodes using **Radio Frequency (RF)** technology, eliminating the need for physical cabling. These networks range from local deployments (**WLAN/WiFi**) to regional coverage via mobile telecommunications (**WWAN** like 4G LTE or 5G).

### Key Components & Operation
*   **Wireless Adapter:** Converts digital data into RF signals and vice versa.
*   **Wireless Access Point (WAP):** Acts as a bridge between the wireless and wired networks.
*   **Frequency Bands:** Typically operates on **2.4 GHz** (longer range, more interference) or **5 GHz** (shorter range, higher throughput).

---

## 2. The IEEE 802.11 Connection Process
To join a WiFi network, a device initiates a handshake using the **802.11 protocol**.

### Association Request Frame
When a client attempts to connect, it sends an **Association Request** containing:
*   **MAC Address:** Unique hardware identifier.
*   **SSID (Service Set Identifier):** The network name.
*   **Supported Data Rates & Channels:** Communication capabilities.
*   **Security Protocols:** Support for encryption like **WPA2/WPA3**.

> [!NOTE]
> Even if the **SSID broadcast** is disabled (Hidden SSID), the identifier can often be recovered by sniffing authentication packets during a client connection.

---

## 3. Legacy Security: WEP (Wired Equivalent Privacy)
WEP is a legacy protocol now considered **insecure** due to fundamental design flaws.

### WEP Challenge-Response Handshake
| Step | Source | Description |
| :--- | :--- | :--- |
| 1 | **Client** | Sends an association request to the WAP. |
| 2 | **WAP** | Responds with a challenge string. |
| 3 | **Client** | Encrypts the challenge using the **Shared Secret Key** and returns it. |
| 4 | **WAP** | Verifies the response; if it matches, authentication is granted. |

### Critical Vulnerabilities
*   **Initialization Vector (IV) Weakness:** WEP uses a small 24-bit IV. Because it is so short, IVs eventually repeat (IV collision), allowing attackers to brute-force the key.
*   **CRC Flaw:** The **Cyclic Redundancy Check (CRC)** ??
    > **CRC (Cyclic Redundancy Check) / Control de Redundancia Cíclica:**
    > *   **EN:** A mathematical algorithm used to detect errors in data transmission. In WEP, it is flawed because it's calculated on plaintext, allowing attackers to manipulate or decrypt packets without knowing the key.
    > *   **ES:** Un algoritmo matemático utilizado para detectar errores en la transmisión de datos. En WEP, es vulnerable porque se calcula sobre el texto en claro, lo que permite a un atacante manipular o descifrar paquetes sin conocer la clave.

---

## 4. Modern Encryption & Authentication
### WPA (WiFi Protected Access)
*   **WPA2/WPA3:** Use **AES (Advanced Encryption Standard)** with 128-bit keys or higher.
*   **WPA-Personal (PSK):** Uses a Pre-Shared Key (password).
*   **WPA-Enterprise:** Uses a centralized server (RADIUS/TACACS+) for individual user authentication.

### EAP Protocols (Extensible Authentication Protocol)
*   **LEAP (Lightweight EAP):** Uses a shared key; susceptible to offline dictionary attacks.
*   **PEAP (Protected EAP):** Encapsulates EAP within a secure **TLS tunnel**, providing much stronger protection.
*   **EAP-TLS:** The gold standard; requires **digital certificates** on both the client and server.

### TACACS+ vs. RADIUS
**TACACS+** ??
> **TACACS+ (Terminal Access Controller Access-Control System Plus):**
> *   **EN:** A Cisco-proprietary AAA protocol that encrypts the *entire* body of the packet, offering better security than RADIUS (which only encrypts passwords).
> *   **ES:** Un protocolo AAA propietario de Cisco que cifra el cuerpo *completo* del paquete, ofreciendo mayor seguridad que RADIUS (que solo cifra las contraseñas).

---

## 5. Wireless Attacks & Hardening
### Disassociation Attack
An attacker sends spoofed **disassociation frames** to a client, forcing them to disconnect from the WAP.
*   **Purpose:** Denial of Service (DoS) or capturing handshakes (WPA 4-way handshake) for offline cracking.

### Hardening Checklist
*   **Disable SSID Broadcasting:** Reduces visibility (though not a complete security solution).
*   **MAC Filtering:** Restricts access to specific hardware addresses.
*   **Implement WPA3:** Latest encryption standard.
*   **Deploy EAP-TLS:** Uses Certificate-Based Authentication for high-security environments.

---

# Virtual Private Networks (VPN) & Secure Tunneling

## Overview
A **Virtual Private Network (VPN)** extends a private network across a public infrastructure, such as the Internet. It enables remote users and branch offices to send and receive data as if their computing devices were directly connected to the local area network (LAN). From an administrative standpoint, VPNs are critical for managing internal infrastructure securely without exposing sensitive services directly to the WAN.

### Key Benefits
*   **Confidentiality:** Uses encryption to create a secure tunnel, preventing unauthorized interception (Man-in-the-Middle attacks).
*   **Encapsulation:** Remote hosts are assigned internal IP addresses, allowing seamless access to internal resources (File servers, Databases, SSH).
*   **Cost-Efficiency:** Replaces expensive leased lines by utilizing existing public internet routing.

---

## VPN Components & Requirements

| Component | Description |
| :--- | :--- |
| **VPN Client** | Software (e.g., OpenVPN, AnyConnect, FortiClient) that initiates the tunnel and handles local encryption/decryption. |
| **VPN Server/Gateway** | The endpoint responsible for authenticating clients, terminating the tunnel, and routing traffic to the internal network. |
| **Encryption** | Cryptographic algorithms (AES-256, ChaCha20) used to ensure data privacy within the tunnel. |
| **Authentication** | Verification of identity via Shared Secrets (PSK), Digital Certificates (X.509), or Multi-Factor Authentication (MFA). |


---

## IPsec (Internet Protocol Security)

IPsec is a suite of protocols used to secure IP communications by authenticating and encrypting each IP packet in a communication session. It operates at the Network Layer (Layer 3) of the OSI model.

### Core Protocols
1.  **Authentication Header (AH):** Provides connectionless integrity and data origin authentication. It protects against replay attacks but **does not provide encryption** (payload is visible).
2.  **Encapsulating Security Payload (ESP):** Provides confidentiality (encryption), origin authentication, and integrity. In modern setups, ESP is preferred over AH as it secures the payload.

### IPsec Operating Modes

| Mode | Use Case | Description |
| :--- | :--- | :--- |
| **Transport Mode** | Host-to-Host | Only the payload is encrypted; the original IP header remains intact. Used for end-to-end security between two specific devices. |
| **Tunnel Mode** | Site-to-Site / Client-to-Site | The entire IP packet (header + payload) is encrypted and encapsulated into a new IP packet. Standard for VPN tunnels. |

### Firewall Configuration for IPsec
To allow IPsec traffic through a stateful firewall, the following ports and protocols must be open:

*   **UDP 500 (IKE):** Used by the Internet Key Exchange to negotiate security associations (SA) and handle Diffie-Hellman exchanges.
*   **UDP 4500 (NAT-T):** Necessary when the VPN traffic passes through a NAT device (NAT Traversal).
*   **IP Protocol 50 (ESP):** To allow the encrypted data packets.
*   **IP Protocol 51 (AH):** To allow authentication headers (if used).

---

## Legacy Protocols: PPTP

**Point-to-Point Tunneling Protocol (PPTP)** is a legacy method for implementing VPNs. While it is easy to configure and natively supported by many older systems, it is considered **security-deprecated**.

*   **Port:** TCP 1723.
*   **Vulnerabilities:** PPTP relies on **MS-CHAPv2** for authentication, which uses the weak **DES** encryption. This is susceptible to offline dictionary attacks and rapid brute-forcing with modern hardware.
*   **Recommendation:** Avoid PPTP in production environments. Transition to **OpenVPN (SSL/TLS)**, **WireGuard**, or **L2TP/IPsec**.

# Cisco IOS & Network Segmentation Fundamentals

## 1. Cisco IOS Overview
**Cisco Internetwork Operating System (IOS)** is the proprietary operating system deployed across Cisco network devices, including routers and switches. It delivers the essential routing, switching, internetworking, and telecommunications functions required to operate modern enterprise networks.

### Core Capabilities
* **IPv6 Support:** Comprehensive dual-stack and native IPv6 routing/switching.
* **Quality of Service (QoS):** Traffic prioritization and bandwidth management.
* **Security:** Native encryption, access control, and robust authentication mechanisms.
* **Virtualization:** Virtual Private LAN Service (VPLS) and Virtual Routing and Forwarding (VRF).

### Management Interfaces
Cisco devices are predominantly administered via the **Command Line Interface (CLI)** through Console, SSH, or Telnet, though Graphical User Interfaces (GUI) are available for certain models.

### Supported Network Protocols
| Protocol Category | Examples | Description |
| :--- | :--- | :--- |
| **Routing** | OSPF, BGP | Dynamic protocols used to calculate paths and route data packets across networks. |
| **Switching** | VTP, STP | Layer 2 protocols to manage VLAN propagation (VTP) and prevent network loops (STP). |
| **Network Services** | DHCP, DNS | Protocols that automate IP assignment and hostname resolution. |
| **Security** | ACLs | Access Control Lists used to filter traffic and mitigate unauthorized access. |

### Cisco IOS Access Control (Passwords)
| Password Type | Description |
| :--- | :--- |
| **User Password** | Secures initial device access (Console, VTY lines). Restricts user to basic execution mode (`>`). |
| **Enable Password** | Secures access to privileged EXEC mode (`#`), granting administrative control. Stored in plaintext by default unless service password-encryption is enabled. |
| **Secret** | A secure, encrypted password used to restrict access to specific remote management tools and services. |
| **Enable Secret** | The secure alternative to the Enable Password. It leverages robust hashing algorithms (e.g., MD5, SHA-256) to secure privileged EXEC mode. |

> **Initial Reconnaissance Note:** When enumerating network services, a Cisco IOS device can often be identified via Telnet/SSH banners.

~~~bash
MikyRedHat@htb[/htb]$ telnet 10.129.10.2
Trying 10.129.10.2...
Connected to 10.129.10.2.
Escape character is '^]'.

User Access Verification
Password:
~~~

---

## 2. Virtual Local Area Networks (VLANs)
A **VLAN** conceptually fragments a single physical switch into multiple isolated, logical mini-switches. It creates distinct broadcast domains that span across multiple physical LAN segments. This logical segmentation is independent of the users' physical locations.

Since each VLAN acts as an independent broadcast domain, it requires its own IP subnet to facilitate inter-VLAN routing (usually handled by a Layer 3 switch or a "Router on a Stick").

**Example Corporate Topology:**
| Department | VLAN ID | Subnet |
| :--- | :--- | :--- |
| Servers | VLAN 10 | 192.168.1.0/24 |
| C-Level | VLAN 20 | 192.168.2.0/24 |
| Finance | VLAN 30 | 192.168.3.0/24 |
| HR | VLAN 40 | 192.168.4.0/24 |
| Marketing | VLAN 50 | 192.168.5.0/24 |
| IT Support | VLAN 60 | 192.168.6.0/24 |

### Strategic Benefits of VLANs
1. **Security Posture:** Isolates sensitive traffic. An attacker on the HR VLAN cannot passively sniff broadcast traffic from the Finance VLAN.
2. **Performance Optimization:** Reduces the size of broadcast domains, mitigating broadcast storms and freeing up bandwidth.
3. **Simplified Administration:** Devices can be logically grouped by function rather than physical location.

### VLAN Ranges (Cisco)
* **Normal-Range (1-1005):** Stored in the `vlan.dat` file in Flash memory.
    * `VLAN 1`: Default VLAN (cannot be deleted).
    * `VLANs 1002-1005`: Reserved for legacy Token Ring/FDDI.
* **Extended-Range (1006-4094):** Saved in the running configuration file, not in `vlan.dat`. Requires VTP Transparent mode in older IOS versions.
* **Reserved (0 & 4095):** Cannot be used.

---

## 3. Switch Port Modes & Memberships

### Static vs. Dynamic Assignment
* **Static VLANs:** Ports are manually assigned to a specific VLAN ID by a SysAdmin. This is the industry standard due to its high security.
* **Dynamic VLANs:** Switch queries a centralized database (like VMPS) to assign a VLAN based on the connecting device's MAC address.
    * *Security Risk:* An attacker can easily bypass this by utilizing tools like `macchanger` to spoof a legitimate MAC address and jump into a restricted VLAN.

### Access Ports vs. Trunk Ports
* **Access Ports:** Configured to carry traffic for exactly **one** VLAN (ignoring auxiliary voice VLANs). Devices connected to access ports are unaware of the VLAN topology.
* **Trunk Ports:** Designed to carry traffic for **multiple** VLANs simultaneously across a single physical link connecting switches or routers.

---

## 4. VLAN Identification (Trunking Protocols)
Because standard 802.3 Ethernet frames lack VLAN data, switches use encapsulation/tagging protocols to maintain VLAN isolation across trunk links.

### Inter-Switch Link (ISL)
* **Legacy Cisco-Proprietary Protocol.**
* Encapsulates the *entire* original Ethernet frame, appending a 26-byte header and a 4-byte trailer. Deprecated in modern networks.

### IEEE 802.1Q (Dot1Q)
* **The Industry Standard.**
* Modifies the original 802.3 frame by injecting a 4-byte Tag Control Information (TCI) header directly into it.
* **TPID (Tag Protocol Identifier):** A 16-bit field set to `0x8100` to denote an 802.1Q tagged frame.
* **TCI (Tag Control Information):** Contains the PCP (Priority), DEI (Drop Eligibility), and the **VID (VLAN Identifier)**.
    * The VID is a 12-bit field. $2^{12} = 4096$, yielding 4094 usable VLAN IDs (excluding 0 and 4095).

---

## 5. Configuring VLAN-Capable NICs
Modern Network Interface Cards (NICs) support 802.1Q tagging directly at the OS level.

### Linux Implementation
We create a logical sub-interface on top of the physical interface. The Kernel module `8021q` must be loaded.

~~~bash
# Load the 8021q module and verify
MikyRedHat@htb[/htb]$ sudo modprobe 8021q
MikyRedHat@htb[/htb]$ lsmod | grep 8021q

# Note: The 'vconfig' tool is deprecated. Use the modern 'iproute2' suite.
# Create a VLAN 20 sub-interface on eth0
MikyRedHat@htb[/htb]$ sudo ip link add link eth0 name eth0.20 type vlan id 20

# Assign an IP address and bring the interface UP
MikyRedHat@htb[/htb]$ sudo ip addr add 192.168.1.1/24 dev eth0.20
MikyRedHat@htb[/htb]$ sudo ip link set up eth0.20

# Verify interface state
MikyRedHat@htb[/htb]$ ip a | grep eth0.20
~~~

### Windows Implementation
VLANs can be configured via the Device Manager GUI (Advanced properties of the NIC) or natively via PowerShell:

~~~powershell
# Enumerate available Network Adapters
PS C:\> Get-NetAdapter | Format-Table -AutoSize

# Retrieve the current VLAN ID of an interface
PS C:\> Get-NetAdapterAdvancedProperty -DisplayName "vlan id"

# Assign an interface to VLAN 10 (Requires NIC driver support)
PS C:\> Set-NetAdapter -Name "Ethernet 2" -VlanID 10
~~~


---

## 6. Packet Analysis: VLAN Traffic
VLAN tags can be intercepted and analyzed using packet sniffers.

**Wireshark / Tshark Filters:**
* Show all tagged traffic: `vlan`
* Filter by specific VLAN: `vlan.id == 10`


~~~bash
# Extract and sort unique VLAN IDs from a PCAP file using Tshark
MikyRedHat@htb[/htb]$ tshark -r "The_Ultimate_PCAP.pcapng" -T fields -e vlan.id | sort -n -u
~~~

---

## 7. Security Implications: VLAN Attacks

### VLAN Hopping (DTP Exploitation)
VLAN Hopping allows an attacker to bypass routing restrictions and inject/sniff traffic in unauthorized VLANs. This typically exploits the **Dynamic Trunking Protocol (DTP)**, which automates trunk negotiation on Cisco switches.
* **Attack Vector:** An attacker configures their host to spoof DTP packets (acting like a switch). If the switch port is left in 'Dynamic Auto' or 'Dynamic Desirable' mode, a trunk link is established, exposing all allowed VLAN traffic to the attacker.
* **Tooling:** `Yersinia` is the industry standard for exploiting DTP and Layer 2 protocols.


### Double-Tagging (802.1Q Encapsulation Attack)
This attack exploits how switches process the "Native VLAN" on trunk links.
* **Prerequisite:** The attacker MUST be connected to a port that belongs to the same VLAN as the trunk's Native VLAN.
* **Execution:**
  1. The attacker crafts a frame with **two** 802.1Q tags: an outer tag (matching the Native VLAN) and a hidden inner tag (the target VLAN, e.g., VLAN 30).
  2. The first switch reads the outer tag, realizes it belongs to the Native VLAN, strips the tag, and forwards it across the trunk.
  3. The receiving switch inspects the frame, finds the *inner* tag (VLAN 30), and forwards the packet into the victim's VLAN.
* **Tooling:** `Scapy` (Python framework) is used to craft customized double-tagged packets.

---

## 8. Data Center Scalability: VXLAN
In modern cloud/data center architectures, the 4,094 VLAN limit of standard 802.1Q is insufficient. Furthermore, Spanning Tree Protocol (STP) blocks redundant links, killing multipathing efficiency.

**Virtual eXtensible Local Area Network (VXLAN) - RFC7348:**
* **Concept:** A Layer 2 overlay mapped over a Layer 3 network infrastructure (MAC-in-UDP encapsulation).
* **VNI (VXLAN Network Identifier):** Uses a 24-bit identifier, expanding the logical segment limit from 4,094 to **16 million**.
* **Impact:** Enables massive multi-tenant scalability and allows VMs to migrate across physical data centers while maintaining the same Layer 2 segment without being bottlenecked by STP loops.

---

## 9. Network Discovery & Telemetry (CDP vs. STP)

### Cisco Discovery Protocol (CDP)
A proprietary Layer 2 protocol used by Cisco devices to broadcast their hardware platform, OS version, IP addresses, and capabilities to directly connected neighbors. 
* *Security Warning:* CDP broadcasts in plaintext. It should be disabled on external-facing interfaces or untrusted access ports to prevent reconnaissance.

~~~text
# Example CDP Packet Capture
22:14:11.563654 CDPv2, ttl: 180s, length: 180
        Device-ID: 'router.inlanefreight.loc'
        IPv4: 10.129.100.1
        Port-ID: 'Ethernet0/0'
        Capability: Router
        Platform: 'Cisco 881 (MPC8300) processor'
        Version String: 'Cisco IOS Software, C880 Software'
~~~

### Spanning Tree Protocol (STP)
A Layer 2 protocol (IEEE 802.1D / 802.1w) that prevents broadcast storms by calculating a loop-free logical topology and blocking redundant links.

~~~text
# Example Rapid STP (802.1w) Packet Capture
22:14:11.563654 STP 802.1w, Rapid STP, Flags [Learn, Forward]
        bridge-id 8001.00:11:22:33:44:55.8000
        root-id 8001.AA:AA:AA:AA:AA:AA, cost 0
        port-id 8001, max-age 20.00s, forward-delay 15.00s
~~~

# Key Exchange Mechanisms

Key exchange mechanisms are critical cryptographic protocols designed to securely distribute and establish **shared secret keys** between communicating parties over an untrusted, insecure channel. Since the fundamental security of encrypted communications relies on the secrecy of these keys, selecting the right mathematical algorithm is paramount.

## Core Algorithms

### 1. Diffie-Hellman (DH)
The **Diffie-Hellman (DH)** key exchange allows two parties to mutually generate a shared secret key without any prior communication or transmission of private data. It forms the foundation of secure channel establishment, prominently featured in the **Transport Layer Security (TLS)** protocol.
* **Drawbacks:** Classic finite-field DH is computationally expensive compared to Elliptic-Curve variants. Crucially, raw DH lacks built-in authentication, making it inherently vulnerable to **Man-In-The-Middle (MITM)** attacks, where an adversary intercepts the traffic and injects rogue keys.

### 2. Rivest–Shamir–Adleman (RSA)
**RSA** is an asymmetric public-key cryptosystem based on the mathematical difficulty of factoring the product of two large prime numbers. Beyond key exchange, RSA is a versatile standard used across the industry for:
* **Confidentiality & Authentication:** Encrypting and digitally signing messages.
* **Data in Transit:** Securing network traffic (e.g., SSL/TLS protocols).
* **Integrity:** Generating and verifying digital signatures for electronic documents.
* **Access Control:** Authenticating users and devices, notably via **PKINIT** in Kerberos environments.

### 3. Elliptic-Curve Cryptography (ECC)
ECC provides equivalent or superior security to classic algorithms but with significantly smaller key sizes, drastically reducing computational overhead (crucial for latency-sensitive or low-power devices).
* **ECDH (Elliptic Curve Diffie-Hellman):** A modern variant of DH leveraging ECC. It establishes secure TLS connections, supports **Perfect Forward Secrecy (PFS)** to protect past sessions from future key compromises, and drives the **Internet Key Exchange (IKE)** protocol in VPNs.
* **ECDSA (Elliptic Curve Digital Signature Algorithm):** Utilizes ECC strictly for generating digital signatures to robustly authenticate parties during a key exchange.

### Algorithm Comparison Matrix

| Algorithm | Acronym | Security Profile & Characteristics |
| :--- | :--- | :--- |
| **Diffie-Hellman** | DH | Secure with strong parameters and external authentication. Computationally heavier/slower than ECDH. |
| **Rivest–Shamir–Adleman** | RSA | Industry-standard security with adequate key lengths. Higher computational footprint than ECC. |
| **Elliptic Curve Diffie-Hellman** | ECDH | Enhanced security and operational speed compared to classic DH. Ideal for modern implementations. |
| **Elliptic Curve Digital Signature** | ECDSA | Highly efficient and secure framework strictly for digital signature generation. |

---

## Internet Key Exchange (IKE)

**Internet Key Exchange (IKE)** is the standard protocol for setting up a Security Association (SA) in the IPsec protocol suite, heavily utilized for establishing encrypted **Virtual Private Network (VPN)** tunnels. IKE blends DH key exchanges with additional cryptographic techniques (like RSA for signatures and AES for payload encryption) to securely negotiate parameters and authenticate clients/servers.

### IKE Operation Modes
IKE negotiations dictate the sequence and parameters of the exchange process. They operate in two primary modes:

* **Main Mode (Default):** Prioritizes security. It executes the key exchange across **three distinct phases** (six messages), allowing for secure negotiation and strict identity protection. The trade-off is higher latency.
* **Aggressive Mode:** Prioritizes speed. It compresses the exchange into just **two phases** (three messages). While performance is faster due to fewer round trips, it completely sacrifices identity protection, making it a weaker security posture compared to Main Mode.

### Pre-Shared Keys (PSK)
A **Pre-Shared Key (PSK)** is a predefined secret value mutually held by both parties. In IKE, a PSK acts as an optional authentication layer before the DH exchange initiates. 
* **Implementation:** PSKs must be distributed via a secure, out-of-band channel (e.g., physical transfer or a secondary secure line) prior to the exchange.
* **Security Impact:** While PSKs add a straightforward layer of authentication, poorly managed or intercepted PSKs completely compromise the IKE session, exposing the VPN tunnel to MITM attacks.

# Authentication Protocols

Authentication protocols are foundational components in networking, designed to verify the identity of devices, users, and systems. They provide a secure, standardized mechanism for identity verification, preventing unauthorized access and mitigating network compromise. Furthermore, these protocols facilitate the secure exchange of information, ensuring data confidentiality and integrity against eavesdropping or Man-In-The-Middle (MITM) attacks.

## Common Authentication Protocols

| Protocol | Description |
| :--- | :--- |
| **Kerberos** | Key Distribution Center (KDC) based authentication protocol utilizing tickets within domain environments (e.g., Active Directory). |
| **SRP** | Secure Remote Password. A password-based authentication protocol using zero-knowledge proofs and cryptography to thwart eavesdropping and MITM attacks. |
| **SSL** | Secure Sockets Layer. A legacy cryptographic protocol for securing network communications (deprecated in modern environments). |
| **TLS** | Transport Layer Security. The modern, secure successor to SSL, providing internet communication security. |
| **OAuth** | Open standard for authorization allowing secure, delegated third-party access to web resources without sharing credentials. |
| **OpenID** | Decentralized authentication protocol enabling users to leverage a single identity across multiple platforms. |
| **SAML** | Security Assertion Markup Language. An XML-based standard for securely exchanging authentication and authorization data between identity and service providers. |
| **2FA** | Two-Factor Authentication. Requires exactly two distinct factors (e.g., knowledge and possession) to verify an identity. |
| **FIDO** | Fast IDentity Online. Open standards developed by the FIDO Alliance to promote strong, passwordless authentication. |
| **PKI** | Public Key Infrastructure. A framework using public and private key pairs for encryption, digital signatures, and secure data exchange. |
| **SSO** | Single Sign-On. Allows users to authenticate once with a single set of credentials to access multiple independent applications. |
| **MFA** | Multi-Factor Authentication. Uses two or more authentication factors (knowledge, possession, inherence/biometrics) for robust identity verification. |
| **PAP** | Password Authentication Protocol. A deprecated, insecure protocol that transmits passwords in clear text over the network. |
| **CHAP** | Challenge-Handshake Authentication Protocol. Uses a three-way handshake and hashing to verify identity without sending cleartext secrets. |
| **EAP** | Extensible Authentication Protocol. A versatile framework supporting multiple authentication mechanisms (e.g., EAP-TLS, PEAP). |
| **SSH** | Secure Shell. Provides encrypted remote command-line access, remote execution, and secure file transfer (replaces Telnet/FTP). |
| **HTTPS** | Hypertext Transfer Protocol Secure. HTTP running over SSL/TLS, ensuring encrypted and authenticated web traffic. |

## In-Depth Analysis: Wireless & Tunneling Authentication

### LEAP vs. PEAP

Protocols like **LEAP** and **PEAP** are typically deployed in enterprise environments to authenticate wireless clients (802.1X) or remote users connecting via VPNs—scenarios where standard SSH or HTTPS are architecturally unsuitable.

*   **LEAP (Lightweight Extensible Authentication Protocol):** Developed by Cisco, LEAP provides mutual authentication between a client and a RADIUS server using EAP and the RC4 cipher.
    *   *Vulnerability:* LEAP relies on a negotiated shared secret and does *not* encrypt the MSCHAPv2 hash, making it highly susceptible to offline dictionary attacks. It is considered legacy and severely insecure.
*   **PEAP (Protected Extensible Authentication Protocol):** A highly secure tunneling protocol based on EAP. It establishes an encrypted TLS tunnel before authenticating the client.
    *   *Security Advantage:* PEAP mandates a server-side public key certificate to validate the server's identity, preventing rogue access point attacks. Crucially, it encrypts the MSCHAPv2 hash within the TLS tunnel and supports robust cryptographic algorithms (AES, 3DES) instead of the weaker RC4 cipher.

Both protocols belong to earlier generations of wireless security. While PEAP remains widely deployed, modern enterprise infrastructures are increasingly migrating to **EAP-TLS** for strict certificate-based mutual authentication.

## Secure Physical & Application Layer Connections

For direct connections and application-layer transport, **SSL/TLS** protocols form the backbone of network security, prominently implemented via **SSH** and **HTTPS**.

These protocols leverage robust symmetric and asymmetric encryption algorithms to safeguard transmitted authentication data against interception or tampering. Furthermore, they integrate seamlessly with **PKI** and digital certificates to mutually authenticate the server and client, neutralizing MITM vectors. Due to their extensive cross-platform support and standardization, SSH and HTTPS are the industry defaults for secure system administration, web communications, and API interactions.


# Technical Documentation: Network Layer and Transport Layer Analysis

## 1. Transport Layer Protocols: TCP vs. UDP

The Transport Layer (Layer 4) utilizes two primary protocols for data transmission across the internet, each optimized for different operational requirements.

### Transmission Control Protocol (TCP)
TCP is a **connection-oriented** protocol designed to guarantee the reliable delivery of data.
* **Mechanism:** It functions similarly to a telephone conversation where a session is established and maintained. It ensures that all segments are received in the correct order.
* **Error Recovery:** If an error or packet loss occurs, the receiver notifies the sender to retransmit the missing data.
* **Characteristics:** High reliability but higher latency due to error-checking and retransmission overhead.
* **Common Uses:** Web traffic (HTTP/S), Email (SMTP/IMAP), and file transfers.

### User Datagram Protocol (UDP)
UDP is a **connectionless** protocol that prioritizes speed and low latency over reliability.
* **Mechanism:** Data is sent without establishing a connection or verifying receipt. There is no acknowledgement (ACK) process.
* **Error Handling:** If a datagram is lost or corrupted, it is not resent.
* **Characteristics:** Fast and lightweight, but prone to data loss.
* **Common Uses:** Real-time applications such as video streaming, VoIP, and online gaming.

---

## 2. The IP Packet Structure

An **Internet Protocol (IP) Packet** is the standard unit of data at the Network Layer (Layer 3). It can be visualized as an envelope: the **Header** contains routing and metadata (sender/recipient), while the **Payload** contains the actual data (the letter).

### IP Header Field Analysis
| Field | Description |
| :--- | :--- |
| **Version** | Indicates IPv4 or IPv6 protocol version. |
| **IHL** | Internet Header Length; specifies header size in 32-bit words. |
| **Class of Service** | Defines packet priority (QoS). |
| **Total Length** | Total packet size (header + payload) in bytes. |
| **Identification (ID)** | A 16-bit unique value used to identify fragments of a packet. |
| **Flags** | Control bits for fragmentation. |
| **Fragment Offset** | Indicates the fragment's position within the original packet. |
| **TTL** | Time to Live; prevents infinite routing loops by limiting hop count. |
| **Protocol** | Defines the encapsulated protocol (TCP=6, UDP=17). |
| **Checksum** | Error detection for the header. |
| **Source/Destination** | Logical addresses of the sender and recipient. |
| **Options/Padding** | Optional routing info and padding to ensure word alignment. |

### Fingerprinting via IP ID
The **IP ID** field is a 16-bit field (0-65535). In security audits, analyzing this field can reveal **multi-homed hosts**. Even if a host uses different IP addresses across different networks, the IP ID often increments sequentially across all interfaces.

**Traffic Capture Analysis:**
```shellsession
IP 10.129.1.100.5060 > 10.129.1.1.5060: SIP, length: 1329, id 1337
IP 10.129.1.100.5060 > 10.129.1.1.5060: SIP, length: 1329, id 1338
IP 10.129.1.100.5060 > 10.129.1.1.5060: SIP, length: 1329, id 1339
IP 10.129.2.200.5060 > 10.129.1.1.5060: SIP, length: 1329, id 1340
IP 10.129.2.200.5060 > 10.129.1.1.5060: SIP, length: 1329, id 1341
```
*In this scenario, the continuous sequence of IDs (1337-1341) confirms that 10.129.1.100 and 10.129.2.200 belong to the same physical host.*

---

## 3. Network Reconnaissance Techniques

### IP Record-Route (RR) Field
The RR field logs the IP addresses of routers that a packet traverses. When the target sends an `ICMP Echo Reply`, the path is revealed in the header.

**Command Example:**
```shellsession
MikyRedHat@htb[/htb]$ ping -c 1 -R 10.129.143.158
RR: 10.10.14.38 -> 10.129.0.1 -> 10.129.143.158
```

### Traceroute Methodology
Traceroute maps the network path by intentionally triggering `ICMP Time-Exceeded` messages through TTL manipulation:
1. **Initial Probe:** A TCP SYN packet is sent with a **TTL of 1**.
2. **Hop 1:** The first router decrements TTL to 0, drops the packet, and returns an `ICMP Time-Exceeded` packet. The attacker records this IP.
3. **Iteration:** The process repeats with an incremented TTL (2, 3, etc.) for each subsequent hop.
4. **Conclusion:** The process ends when the destination is reached and returns a `TCP SYN/ACK` or `TCP RST`. On Unix systems, UDP is typically used, resulting in a `Destination/Port Unreachable` message upon completion.

---

## 4. Layer 4 Segmentation and Payloads

### TCP Segments
TCP headers include critical fields for stateful communication: **Source/Destination Ports**, **Sequence Numbers** (order), **Acknowledgment Numbers** (receipt verification), **Control Flags** (SYN, ACK, PSH, FIN, RST), and **Window Size** (flow control). The payload contains the actual conversation data.

### UDP Datagrams
UDP is a stateless protocol. When performing a `traceroute` via UDP, the target host will typically respond with `Destination Unreachable` and `Port Unreachable` once the packet reaches the target device.

---

## 5. Advanced Attack Vectors: Blind Spoofing

**Blind Spoofing** is a data manipulation technique where an attacker injects forged traffic into a network without being able to see the target's responses.

* **Method:** The attacker forges the IP header (Source/Destination) and must predict the **Initial Sequence Number (ISN)**.
* **ISN (??):** The Initial Sequence Number is a 32-bit value assigned to the first packet of a TCP connection to synchronize sequence tracking. / *El ISN es un valor de 32 bits asignado al primer paquete de una conexión TCP para sincronizar el seguimiento de la secuencia.*
* **Objective:** Establish unauthorized connections or disrupt service by hijacking sessions.
* **Pentest Note:** Successfully predicting an ISN allows an attacker to complete a TCP handshake "blindly," potentially bypassing IP-based authentication.

# Cryptography and Encryption Fundamentals

## Overview
Encryption is the core mechanism used to secure data transmission across the Internet (e.g., payment information, emails, personal data), ensuring confidentiality and integrity against unauthorized manipulation. By applying cryptographic algorithms based on complex mathematical operations, plaintext is transformed into ciphertext. 

Modern encryption relies on digital keys within **symmetric** or **asymmetric** frameworks. The robustness of these methods depends on the algorithm's mathematical complexity and key length. State-of-the-art cryptography with extensive key lengths is currently considered highly secure and nearly impossible to compromise efficiently.

## Symmetric Encryption
Symmetric encryption (secret-key encryption) relies on a single shared key for both encryption and decryption. Both the sender and receiver must possess this exact key to successfully communicate.

*   **Vulnerabilities:** The primary risk lies in key distribution, storage, and exchange. If the secret key is intercepted or leaked, the confidentiality of the data is completely compromised.
*   **Use Cases:** Highly efficient and ideal for encrypting large volumes of data at rest or in transit (e.g., full-disk encryption, bulk network traffic).
*   **Standard Algorithms:** 
    *   **DES** (Data Encryption Standard) - Legacy.
    *   **AES** (Advanced Encryption Standard) - The current industry standard.

## Asymmetric Encryption (Public-Key Cryptography)
Asymmetric encryption utilizes a mathematically linked key pair:
1.  **Public Key:** Used to encrypt the data. It can be freely distributed.
2.  **Private Key:** Used to decrypt the data. It must remain strictly confidential.

Anyone can encrypt a payload using the target's public key, but only the holder of the corresponding private key can decrypt it.

*   **Advantages:** It elegantly bypasses the secret key exchange problem inherent in symmetric encryption. Security relies on computationally intractable mathematical problems. Additionally, asymmetric methods enable authentication and non-repudiation via digital signatures.
*   **Standard Algorithms:** RSA (Rivest–Shamir–Adleman), PGP (Pretty Good Privacy), ECC (Elliptic Curve Cryptography).
*   **Common Implementations:** E-Signatures, SSL/TLS, VPNs, SSH, PKI, Cloud Security.

## Legacy Standards: DES & 3DES
*   **DES (Data Encryption Standard):** A symmetric-key block cipher that processes 64-bit blocks of plaintext into 64-bit ciphertext. While the key is formally 64 bits, 8 bits are reserved for parity checks, resulting in an effective key length of only **56 bits**. This makes it highly vulnerable to modern brute-force attacks.
*   **3DES (Triple DES):** An extension designed to strengthen DES by applying the cipher three times sequentially (Encrypt-Decrypt-Encrypt) using up to three separate keys. While more secure than standard DES, it remains bottlenecked by its 56-bit foundation and is largely considered obsolete for modern applications.

## Modern Standard: AES (Advanced Encryption Standard)
AES is the successor to DES, delivering significantly enhanced security and operational performance.
*   **Key Lengths:** Operates with 128-bit, 192-bit, or 256-bit keys.
*   **Performance:** Features a highly efficient algorithmic structure capable of processing multiple data blocks simultaneously. This parallelism makes AES vastly faster than DES, which is critical for bulk encryption scenarios.
*   **Common Implementations:** WLAN (IEEE 802.11i), IPsec, SSH, VoIP, PGP, OpenSSL.

## Cipher Modes of Operation
A cipher mode dictates how a block cipher algorithm (processing fixed 64 or 128-bit blocks) handles data to securely encrypt messages of arbitrary length.

| Cipher Mode | Full Name | Description & Use Case |
| :--- | :--- | :--- |
| **ECB** | Electronic Code Book | **Not recommended.** Encrypts identical plaintext blocks into identical ciphertext blocks. It fails to hide data patterns, leaving applications vulnerable to statistical analysis. |
| **CBC** | Cipher Block Chaining | The default mode for early AES implementations. Used for disk encryption (TrueCrypt, VeraCrypt) and legacy TLS/SSL. |
| **CFB** | Cipher Feedback | Ideal for real-time data stream encryption, such as network communications or file transit (PKCS, BitLocker). |
| **OFB** | Output Feedback | Used for stream encryption in real-time communications. Generates the keystream independently, making it highly suitable for noisy channels (PKCS, SSH). |
| **CTR** | Counter | High-performance mode that encrypts real-time data streams by turning a block cipher into a stream cipher. Widely used in IPsec and BitLocker. |
| **GCM** | Galois/Counter Mode | The modern gold standard. Protects both confidentiality and data integrity (authenticated encryption). Heavily used in wireless communications, VPNs, and secure protocols (TLS 1.3). |

# 🛠️ Module 03: Introduction to Networking - Master Cheat Sheet

> **Operational Scope:** Quick reference guide for network architecture, OSI/TCP/IP models, subnetting (VLSM), Layer 2/3 attacks, Cisco IOS fundamentals, and cryptography. Optimized for rapid infrastructure enumeration, routing analysis, and post-exploitation pivoting.

## 1. 🧮 IPv4 Subnetting & VLSM (Field Ops)

El cálculo rápido de subredes es crítico para acotar el alcance en escaneos con Nmap o configurar enrutamiento. 

**The "Magic Number" Trick:** $256 - \text{Decimal Mask} = \text{Salto de Red}$

| CIDR | Máscara | Magic Number (Salto) | Usable Hosts | Ejemplo de Inicio de Redes |
| :--- | :--- | :--- | :--- | :--- |
| **/24** | `.0` | $256$ | $254$ | `.0` |
| **/25** | `.128` | $128$ | $126$ | `.0`, `.128` |
| **/26** | `.192` | $64$ | $62$ | `.0`, `.64`, `.128`, `.192` |
| **/27** | `.224` | $32$ | $30$ | Múltiplos de 32 (0, 32, 64...) |
| **/28** | `.240` | $16$ | $14$ | Múltiplos de 16 (0, 16, 32...) |
| **/29** | `.248` | $8$ | $6$ | Múltiplos de 8 (0, 8, 16...) |

> **Pentester Tip:** Si el target es `192.168.1.50/27`, el salto es 32. La red va de `.32` a `.63` (Broadcast). El rango escaneable (usables) es de `.33` a `.62`. No escanees toda la `/24` a ciegas.

---

## 2. 🧠 OSI Model & Data Encapsulation

Conocer la PDU (Protocol Data Unit) es fundamental para analizar tráfico en Wireshark.

| Layer (OSI) | PDU | Hardware / Protocolo | Función Técnica |
| :--- | :--- | :--- | :--- |
| **7. Application** | Data | HTTP, FTP, DNS | Interfaz directa con la aplicación. |
| **4. Transport** | Segment / Datagram | TCP / UDP | End-to-end reliability & ports. |
| **3. Network** | Packet | Router, IPv4/IPv6, ICMP | Logical addressing y enrutamiento (IP). |
| **2. Data-Link** | Frame | Switch, MAC, ARP | Entrega física en el mismo segmento. |
| **1. Physical** | Bits | Cables, Hubs | Transmisión eléctrica/óptica. |

---

## 3. 🛡️ Layer 2 & Layer 3 Attacks

### ARP Spoofing (Cache Poisoning)
* **Objetivo:** Secuestrar el enrutamiento (MitM) falsificando respuestas ARP gratuitas para suplantar al Default Gateway.
* **Triage (Wireshark):** Busca múltiples respuestas ARP para la misma IP resolviendo a diferentes direcciones MAC.

### VLAN Hopping
* **DTP Exploitation:** Explotar el *Dynamic Trunking Protocol* (DTP) en puertos Cisco configurados en `Dynamic Auto/Desirable`. El atacante simula ser un switch para negociar un enlace troncal y ver el tráfico de todas las VLANs. (Herramienta: *Yersinia*).
* **Double-Tagging:** Inyectar una trama 802.1Q con dos etiquetas. El primer switch elimina la etiqueta externa (Native VLAN) y reenvía el paquete con la etiqueta interna hacia la VLAN restringida objetivo. (Herramienta: *Scapy*).

### Network Reconnaissance
* **OS Fingerprinting via TTL:** Linux/macOS = $64$ | Windows = $128$ | Routers (Cisco) = $255$.
* **IP ID Fingerprinting:** Identifica *multi-homed hosts* observando si el campo ID de IP se incrementa secuencialmente al recibir tráfico en diferentes subredes.

---

## 4. ⚙️ Cisco IOS Fundamentals & VLANs

### Administración Básica
* **User EXEC Mode (`>`):** Vista básica de comandos. (Protegido por `User Password`).
* **Privileged EXEC Mode (`#`):** Vista administrativa total. (Protegido por `Enable Secret`, hasheado con MD5/SHA-256).

### VLAN & Trunking (Linux CLI)
Montar subinterfaces lógicas en Linux para auditar tráfico de VLANs específicas.
```bash
# Cargar módulo 802.1Q
sudo modprobe 8021q

# Crear subinterfaz para VLAN 20
sudo ip link add link eth0 name eth0.20 type vlan id 20

# Asignar IP y levantar interfaz
sudo ip addr add 192.168.1.1/24 dev eth0.20
sudo ip link set up eth0.20
```

### CDP (Cisco Discovery Protocol)
* **Peligro:** Transmite en texto claro datos de hardware, IP, VLANs nativas y versión de IOS.
* **Defensa:** Deshabilitar en puertos de acceso o interfaces expuestas al exterior.

---

## 5. 🔐 Cryptography, VPNs & Wireless

### Algoritmos & Modos de Cifrado
* **AES (Advanced Encryption Standard):** El estándar simétrico actual (128, 192 o 256 bits).
* **GCM (Galois/Counter Mode):** *Gold Standard* para modos de cifrado. Garantiza confidencialidad e integridad a la vez. (Usado en TLS 1.3 y VPNs).
* **DH / ECDH:** Diffie-Hellman (y su variante de curva elíptica). Para el intercambio seguro de claves sin transmisión previa.
* **RSA / ECDSA:** Criptografía asimétrica para firmas digitales y autenticación.

### IPsec (Network Layer VPNs)
* **ESP (Encapsulating Security Payload):** Cifra el contenido (Confidencialidad).
* **AH (Authentication Header):** Solo garantiza la integridad y origen, no cifra el *payload*.
* **IKE (Internet Key Exchange):** Usa DH para negociar claves seguras. *Main Mode* es lento pero seguro (6 mensajes). *Aggressive Mode* es rápido pero expone la identidad (3 mensajes).

### Wireless Security & Authentication
* **WPA3 / EAP-TLS:** Estándares corporativos actuales (Autenticación mutua basada en certificados).
* **PEAP:** Establece un túnel TLS antes de autenticar al cliente, protegiendo hashes como MSCHAPv2 de ataques de diccionario.
* **LEAP:** Heredado y vulnerable. Usa RC4 y no cifra el hash. Rompible mediante *offline cracking*.
