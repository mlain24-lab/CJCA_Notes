# 06_Windows_Fundamentals
# Windows Operating System Fundamentals for Pentesting

## 1. Overview
As a penetration tester, maintaining a versatile technical stack is mandatory. A deep understanding of Windows and Linux architectures is critical, as these operating systems form the backbone of both on-premise and cloud infrastructures. Mastery of these systems is essential not only for identifying vulnerabilities but also for leveraging them as platforms for lateral movement, privilege escalation, and persistent access during security assessments.

## 2. The Windows Operating System: Evolution & Threat Landscape
Since its graphical shell debut for MS-DOS in 1985, Microsoft Windows has evolved significantly, merging DOS support with network capabilities in Windows 95, and continually expanding its feature set through Windows 11. 

On the enterprise side, Windows Server launched in 1993 (Windows NT 3.1) and introduced core enterprise services like IIS. The pivotal release of Windows 2000 brought **Active Directory (AD)**, fundamentally changing how sysadmins manage file sharing, encryption, VPNs, and centralized domain authentication. Subsequent iterations (Server 2003 through 2019) introduced critical infrastructure components such as failover clustering, Hyper-V, Event Viewer, Server Core, and container support (Kubernetes/Linux containers).

### 2.1. Legacy Systems & Vulnerability Exposure
As Microsoft releases new OS versions, older iterations reach End of Life (EOL) and no longer receive security patches unless covered by costly long-term support contracts. For instance, Windows Server 2008 and 2012 lost standard security support in January 2020. 

Organizations frequently run unsupported "legacy" systems due to critical application dependencies, budget constraints, or operational inertia. As an assessor, recognizing the target's OS version is crucial for exploiting inherent misconfigurations and unpatched vulnerabilities (e.g., the critical SMBv1 `EternalBlue` flaw, which forced Microsoft to release out-of-band patches for EOL systems).

### 2.2. Windows Versions Index
Understanding the internal build numbers helps rapidly identify the target's patch level and potential exploit vectors.

| Operating System Name | Version Number |
| :--- | :--- |
| Windows NT 4 | 4.0 |
| Windows 2000 | 5.0 |
| Windows XP | 5.1 |
| Windows Server 2003, 2003 R2 | 5.2 |
| Windows Vista, Server 2008 | 6.0 |
| Windows 7, Server 2008 R2 | 6.1 |
| Windows 8, Server 2012 | 6.2 |
| Windows 8.1, Server 2012 R2 | 6.3 |
| Windows 10, Server 2016, Server 2019 | 10.0 |

### 2.3. System Enumeration via WMI
Windows Management Instrumentation (WMI) is a powerful administrative framework. We can leverage the `Get-WmiObject` PowerShell cmdlet to extract low-level system information, query WMI classes, and manipulate remote systems.

To enumerate the exact OS version and build number:

```powershell
PS C:\htb> Get-WmiObject -Class win32_OperatingSystem | select Version,BuildNumber

Version    BuildNumber
-------    -----------
10.0.19041 19041
```

*Note: Other valuable classes include `Win32_Process` (process enumeration), `Win32_Service` (service listing), and `Win32_Bios` (hardware/firmware details). Combining these with the `-ComputerName` parameter allows for robust remote reconnaissance.*

## 3. Access Methodologies
### 3.1. Local vs. Remote Access
While local physical access is standard for traditional office endpoints, the shift towards distributed work and centralized cloud infrastructure relies heavily on **Remote Access**. 

IT departments, SOC teams, and Managed Service Providers (MSPs/MSSPs) depend on remote protocols to administer servers, push updates, and handle incident response. Common remote access technologies encountered during engagements include:
* Virtual Private Networks (VPN)
* Secure Shell (SSH)
* File Transfer Protocol (FTP)
* Virtual Network Computing (VNC)
* Windows Remote Management / PowerShell Remoting (WinRM)
* Remote Desktop Protocol (RDP)

### 3.2. Remote Desktop Protocol (RDP)
RDP operates on a client/server architecture, natively listening on **TCP Port 3389**. In a corporate network, targeting RDP requires routing requests to the specific IP assigned to the host and establishing a connection over this logical port.

By default, RDP is disabled on Windows. However, it is frequently enabled by sysadmins for management purposes. When conducting engagements from a Windows host, we utilize the built-in client: `mstsc.exe` (Remote Desktop Connection).

**Post-Exploitation Loot:** Sysadmins often save their connection profiles for convenience. Locating `.rdp` files during post-exploitation is a high-value finding, as they can contain cached credentials or provide direct pathways to critical infrastructure.

### 3.3. Remote Access from Linux Attack Hosts (`xfreerdp`)
When operating from a Linux attack machine (e.g., Kali Linux/Pwnbox), `xfreerdp` is the standard tool due to its extensive feature set, command-line efficiency, and seamless drive redirection capabilities (crucial for transferring exploits or exfiltrating data).

To establish an RDP session with a Windows target using `xfreerdp`:

```bash
MikyRedHat@htb[/htb]$ xfreerdp /v:<targetIp> /u:htb-student /p:Password
```

*Pro-tip: Leverage drive redirection flags in `xfreerdp` to map local folders to the remote target, bypassing the need to establish secondary file-transfer channels like SMB or HTTP servers during an assessment.*
