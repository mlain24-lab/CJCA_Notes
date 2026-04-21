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

# Network Communication Foundations

## 1. MAC Addresses (Media Access Control)
A MAC address is a unique, hardcoded physical identifier assigned to the Network Interface Card (NIC) of a device. It operates at the Data Link Layer (Layer 2 of the OSI model).

### Useful Commands
* `getmac`: A Windows command-line utility that returns the physical MAC address of every NIC present on the host system.

---

## 2. IP Addresses & Ports

> **IP Addresses:** > * **EN:** A unique numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication. It operates at the Network Layer (Layer 3).
> * **ES:** Una etiqueta numérica única asignada a cada dispositivo conectado a una red informática que utiliza el Protocolo de Internet para comunicarse. Opera en la Capa de Red (Capa 3).

> **Ports:**
> * **EN:** A virtual point where network connections start and end. Ports are associated with specific processes or services, operating at the Transport Layer (Layer 4).
> * **ES:** Un punto virtual donde comienzan y terminan las conexiones de red. Los puertos se asocian a procesos o servicios específicos, operando en la Capa de Transporte (Capa 4).

### Port Categories
* **Well-known Ports (0 - 1023):** * *EN:* System or standard ports assigned by IANA to widely used protocols and core services (e.g., 80/HTTP, 443/HTTPS, 22/SSH).
    * *ES:* Puertos del sistema asignados por la IANA a protocolos y servicios fundamentales ampliamente utilizados.
* **Registered Ports (1024 - 49151):** * *EN:* Ports assigned by IANA for specific applications, vendor services, or custom software upon request.
    * *ES:* Puertos asignados por la IANA para aplicaciones específicas o servicios de software de terceros bajo petición.
* **Dynamic / Private Ports (49152 - 65535):** * *EN:* Also known as ephemeral ports. They are used temporarily by client applications to initiate an outbound connection to a server.
    * *ES:* También conocidos como puertos efímeros. Las aplicaciones cliente los usan de forma temporal para iniciar conexiones de salida hacia un servidor.

### Useful Commands
* `netstat`: Displays active network connections, routing tables, and listening ports (Layer 3/Layer 4).

---

## 3. Browsing the Internet: The Workflow
When navigating to a webpage, the sequence of events is as follows:
1.  **DNS Lookup:** The domain name is resolved to an IP address.
2.  **Data Encapsulation:** The data payload is wrapped with necessary protocol headers (TCP, IP, MAC).
3.  **Data Transmission:** The packets are routed across the network to the destination.
4.  **Server Processing:** The target web server receives the request, processes it, and fetches the required resources.
5.  **Response Transmission:** The server sends the encapsulated web page data back to the client.

---

## 4. DHCP (Dynamic Host Configuration Protocol)
DHCP is a network management protocol used to dynamically assign IP addresses and other core network configuration parameters (like subnet mask and default gateway) to devices, heavily simplifying administration.

### How DHCP Works (The D.O.R.A. Process)

> **1. Discover**
> * **EN:** The client broadcasts a `DHCP Discover` message across the local network to locate available DHCP servers.
> * **ES:** El cliente envía un mensaje de difusión (*broadcast*) `DHCP Discover` por la red local para localizar servidores DHCP disponibles.

> **2. Offer**
> * **EN:** The DHCP server responds with a `DHCP Offer` message, proposing an available IP address and lease terms to the client.
> * **ES:** El servidor DHCP responde con un mensaje `DHCP Offer`, proponiendo al cliente una dirección IP disponible y los términos de la concesión.

> **3. Request**
> * **EN:** The client replies with a `DHCP Request` message, formally requesting the offered IP address from that specific DHCP server.
> * **ES:** El cliente contesta con un mensaje `DHCP Request`, solicitando formalmente la dirección IP ofrecida a ese servidor DHCP en concreto.

> **4. Acknowledge (ACK)**
> * **EN:** The server sends a `DHCP Acknowledge` message, finalizing the IP lease and allowing the client to apply the network configuration.
> * **ES:** El servidor envía un mensaje `DHCP Acknowledge`, finalizando la asignación de la IP y permitiendo al cliente aplicar la configuración de red.

### Useful Commands
To manually trigger the DHCP DORA process on a specific wireless interface in Linux (e.g., renewing an IP lease):
```bash
sudo dhclient wlan0

# Network Address Translation (NAT)

> **What is NAT?**
> * **EN:** A technique used to remap a private IP address space into a public one by modifying network address information in the IP header of packets while they are in transit across a traffic routing device.
> * **ES:** Técnica que permite remapear un espacio de direcciones IP privadas a uno público, modificando la información de red en la cabecera IP de los paquetes mientras transitan por un enrutador.

## 1. Public vs. Private IP Addresses

### Public IP Addresses
Public IP addresses are globally unique identifiers assigned by Internet Service Providers (ISPs). Devices equipped with these IP addresses are directly routable and can be accessed from anywhere on the public internet.

### Private IP Addresses (RFC 1918)
Private IP addresses are designated for internal use within local area networks (LANs), such as corporate offices, schools, and home environments. These addresses are **not** routable on the global internet. 

The IETF established **RFC 1918**, which reserves the following IPv4 address ranges for private networks:
* **Class A:** `10.0.0.0` to `10.255.255.255`
* **Class B:** `172.16.0.0` to `172.31.255.255`
* **Class C:** `192.168.0.0` to `192.168.255.255`

---

## 2. How NAT Works

> **The NAT Process:**
> * **EN:** When a local device wants to send traffic to the internet, the router intercepts the packet, replaces the private source IP address with its own external public IP address, and records this translation in a NAT table. When the return traffic arrives, the router checks the NAT table to map the public IP back to the original internal private IP, forwarding the packet to the correct device.
> * **ES:** Cuando un equipo local envía tráfico a internet, el router intercepta el paquete, sustituye la IP origen privada por su propia IP pública externa y registra esta traducción en una tabla NAT. Al recibir el tráfico de vuelta, el router consulta la tabla NAT para mapear de nuevo la IP pública a la IP privada original, entregando el paquete al dispositivo correcto.

---

## 3. Types of NAT

### Static NAT
> * **EN:** A strict one-to-one mapping between a specific private IP address and a specific public IP address. Often used for servers hosted internally that must be accessible from the outside.
> * **ES:** Un mapeo estricto de uno a uno entre una dirección IP privada específica y una IP pública específica. Se usa habitualmente para servidores alojados internamente que deben ser accesibles desde el exterior.

### Dynamic NAT
> * **EN:** Maps an unregistered private IP address to a registered public IP address selected from a pool of available public IPs provided by the ISP.
> * **ES:** Asigna una dirección IP privada no registrada a una IP pública registrada, seleccionándola de un grupo (*pool*) de direcciones públicas disponibles proporcionadas por el ISP.

### Port Address Translation (PAT) / NAT Overload
> * **EN:** A many-to-one mapping technique. It maps multiple private IP addresses to a single public IP address by assigning unique source ports to distinguish the different traffic sessions. This is the most common configuration in home and small business networks.
> * **ES:** Una técnica de mapeo de muchos a uno. Asigna múltiples direcciones IP privadas a una única IP pública utilizando puertos de origen únicos para distinguir las diferentes sesiones de tráfico. Es la configuración más común en redes domésticas y pymes.

