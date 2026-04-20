# 02_Network_Foundations

## 1. Introduction to Networks

> **Local Area Networks (LANs):** > * [EN] A network that connects computers and devices within a limited geographical area, such as a residence, school, or office building.
> * [ES] Red de área local que conecta dispositivos en un área geográfica limitada, como una casa, escuela u oficina.

> **Wide Area Networks (WANs):**
> * [EN] A telecommunications network that extends over a large geographic area, often connecting multiple LANs. The Internet is the largest example of a WAN.
> * [ES] Red de área amplia que cubre grandes distancias geográficas, a menudo conectando múltiples LANs. Internet es el mejor ejemplo.

### What is a network?
A network is a collection of interconnected devices that can communicate with each other. 

**Key Concepts:**
1. **Nodes:** Individual devices connected to a network (e.g., workstations, servers, routers).
2. **Links:** Communication pathways that connect nodes (can be wired or wireless).
3. **Data Sharing:** The primary purpose of a network is to enable data exchange and resource access.

### Why are networks important?
* **Resource Sharing:** Allows multiple users to share hardware (like printers) and software resources.
* **Communication:** Facilitates instant messaging, emails, and VoIP.
* **Data Access:** Provides centralized access to files, databases, and network storage (NAS/SAN).
* **Collaboration:** Enables teams to work together in real-time across different locations.

---

## 2. Types of Networks

### Local Area Network (LAN)
Connects devices over a short distance, such as within a home, school, or single corporate building.

**Characteristics:**
* **Geographical Scope:** * [EN] Limited (Single building or campus). 
  * [ES] Limitado (Un solo edificio o campus).
* **Ownership:** * [EN] Private (Owned and managed by a single organization or individual). 
  * [ES] Privado (Propiedad y gestión de un individuo u organización).
* **Speed:** * [EN] High speed (Typically 1 Gbps to 10/40/100 Gbps in enterprise environments). 
  * [ES] Alta velocidad (Normalmente de 1 Gbps a 10/40/100 Gbps en entornos empresariales).
* **Media:** * [EN] Ethernet cables (Twisted pair / Cat6), Wi-Fi (WLAN). 
  * [ES] Cables Ethernet (Par trenzado / Cat6), Wi-Fi (WLAN).

### Wide Area Network (WAN)
Spans a large geographical area, connecting multiple LANs across cities, countries, or globally.

**Characteristics:**
* **Geographical Scope:** * [EN] Large (Cities, countries, global reach). 
  * [ES] Amplio (Ciudades, países, alcance global).
* **Ownership:** * [EN] Public or leased (Maintained by ISPs or telecommunication companies). 
  * [ES] Público o arrendado (Mantenido por Proveedores de Internet o empresas de telecomunicaciones).
* **Speed:** * [EN] Lower than LAN (Varies widely depending on the link; higher latency). 
  * [ES] Menor que en una LAN (Varía mucho según el enlace; mayor latencia).
* **Media:** * [EN] Fiber optics, satellite, leased lines (MPLS). 
  * [ES] Fibra óptica, satélite, líneas dedicadas (MPLS).

---

## 3. Network Concepts & Architecture

### OSI Model (Open Systems Interconnection)
A conceptual framework used to understand and standardize the functions of a telecommunication or computing system.

1. **Physical Layer:** Deals with the physical connection and transmission of raw bit streams over a physical medium.
2. **Data Link Layer:** Provides node-to-node data transfer. Devices such as switches and bridges operate here, using MAC addresses.
3. **Network Layer:** Handles data routing and logical addressing. Routers operate at this layer, using IP addresses.
4. **Transport Layer:** Ensures complete data transfer.
   * **TCP (Transmission Control Protocol):** Offers reliable, connection-oriented transmission with error recovery.
   * **UDP (User Datagram Protocol):** Provides faster, connectionless communication without guaranteed delivery.
5. **Session Layer:** Establishes, maintains, and manages sessions between interacting applications.
6. **Presentation Layer:**
   * [EN] Formats, encrypts, and compresses data for the application layer. Ensures data is readable by the receiving system.
   * [ES] Formatea, cifra y comprime los datos para la capa de aplicación. Asegura que los datos sean legibles por el sistema receptor.
7. **Application Layer:**
   * [EN] Provides network services directly to end-user applications (e.g., HTTP, FTP, DNS).
   * [ES] Proporciona servicios de red directamente a las aplicaciones del usuario final (ej. HTTP, FTP, DNS).

### TCP/IP Model
A more practical, condensed version of the OSI Model that is the foundation of the modern Internet.

* **Link Layer (Network Access):** * [EN] Corresponds to OSI Layers 1 & 2. Handles MAC addressing and physical transmission of frames.
  * [ES] Corresponde a las capas 1 y 2 del OSI. Maneja el direccionamiento MAC y la transmisión física de tramas.
* **Internet Layer:**
  * [EN] Corresponds to OSI Layer 3. Handles routing and logical IP addressing of packets.
  * [ES] Corresponde a la capa 3 del OSI. Maneja el enrutamiento y direccionamiento lógico IP de paquetes.
* **Transport Layer:**
  * [EN] Corresponds to OSI Layer 4. Manages host-to-host communication (TCP/UDP segments).
  * [ES] Corresponde a la capa 4 del OSI. Gestiona la comunicación host a host (segmentos TCP/UDP).
* **Application Layer:**
  * [EN] Corresponds to OSI Layers 5, 6 & 7. Represents data to the user and handles encoding and dialog control.
  * [ES] Corresponde a las capas 5, 6 y 7 del OSI. Representa los datos al usuario y maneja la codificación y el control de diálogo.

---

## 4. Terminology

> **Protocols:**
> * [EN] A standardized set of rules that govern how data is formatted, transmitted, and received across a network (e.g., IPv4, TCP, HTTPS).
> * [ES] Un conjunto estandarizado de reglas que rigen cómo se formatean, transmiten y reciben los datos a través de una red.

> **Transmission:**
> * [EN] The physical or logical process of sending data, signals, or information over a communication medium from a source to a destination.
> * [ES] El proceso físico o lógico de enviar datos, señales o información a través de un medio de comunicación desde un origen a un destino.

---

## Components of a Network

### 🔑 Core Network Components Glossary / Glosario de Componentes de Red

| English Term | Término en Español | Quick Technical Definition / Definición Técnica Rápida |
| :--- | :--- | :--- |
| **End Device (Host)** | **Dispositivo Final (Host)** | Source or destination of network data (e.g., PC, smartphone). / *Origen o destino final de los datos en la red.* |
| **Intermediary Device** | **Dispositivo Intermediario** | Connects networks and manages data flow (e.g., routers, switches). / *Conecta redes y gestiona el flujo de datos.* |
| **NIC (Network Interface Card)** | **Tarjeta de Interfaz de Red** | Hardware providing the physical connection; contains the MAC address. / *Hardware que provee conexión física; contiene la dirección MAC.* |
| **Router** | **Enrutador (Router)** | **Layer 3** device. Forwards packets between networks using IP addresses and routing protocols (OSPF, BGP). / *Dispositivo de Capa 3. Enruta paquetes entre redes usando IPs.* |
| **Switch** | **Conmutador (Switch)** | **Layer 2** device. Connects devices within a LAN, forwarding data using MAC addresses. / *Dispositivo de Capa 2. Conecta equipos en una LAN usando direcciones MAC.* |
| **Hub** | **Concentrador (Hub)** | Antiquated **Layer 1** device. Broadcasts data to all ports, causing collisions. / *Dispositivo obsoleto de Capa 1. Transmite datos a todos los puertos a ciegas.* |
| **Network Media** | **Medios de Red** | The physical or wireless pathways for data (Ethernet, Fiber, Wi-Fi). / *Las vías físicas o inalámbricas para los datos.* |
| **Network Protocols** | **Protocolos de Red** | Rules governing data transmission (e.g., TCP/IP, HTTP, FTP). / *Reglas que rigen la transmisión de datos.* |
| **Software Firewall** | **Cortafuegos de Software** | Host-based security filtering incoming/outgoing traffic (e.g., Linux IPTables). / *Seguridad a nivel de host que filtra tráfico (ej. IPTables).* |
| **Server** | **Servidor** | Powerful host providing centralized resources/services (Client-Server Model). / *Host potente que provee recursos centralizados (Modelo Cliente-Servidor).* |
