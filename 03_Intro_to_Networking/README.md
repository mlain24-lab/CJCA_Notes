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
