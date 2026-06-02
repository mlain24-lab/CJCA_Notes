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

# Windows Operating System Structure

In Windows operating systems, the root directory is typically assigned the `<drive_letter>:\` (commonly the `C:\` drive). The root directory, also referred to as the boot partition, is where the operating system is installed. Auxiliary physical and virtual drives are allocated subsequent letters (e.g., `E:\` for Data).

## Boot Partition Directory Structure

| Directory | Function |
| :--- | :--- |
| **Perflogs** | Stores Windows performance logs (empty by default). |
| **Program Files** | On 32-bit systems, hosts all 16-bit and 32-bit applications. On 64-bit systems, it is strictly reserved for 64-bit applications. |
| **Program Files (x86)** | Dedicated to 32-bit and 16-bit applications on 64-bit Windows editions. |
| **ProgramData** | A hidden directory containing essential, machine-wide application data. This data is accessible to programs regardless of the active user context. |
| **Users** | Contains user profiles for all authenticated accounts on the system, alongside the `Public` and `Default` directories. |
| **Default** | The standard user profile template. Any newly provisioned user on the system derives its baseline configuration from this profile. |
| **Public** | Designed for shared access among all local users. Shared over the network by default, though requiring a valid network account for remote access. |
| **AppData** | A hidden subfolder within each user's profile (e.g., `C:\Users\mlain\AppData`) storing per-user application data and configurations. It contains three key subdirectories:<br><br> - **Roaming:** Machine-independent data synced across the network (e.g., custom dictionaries).<br> - **Local:** Machine-specific data, never synchronized across the network.<br> - **LocalLow:** Similar to `Local` but operates with a lower integrity level (ideal for sandboxed apps like web browsers in protected mode). |
| **Windows** | The core repository for the majority of files critical to the execution of the Windows OS. |
| **System, System32, SysWOW64** | Houses all Dynamic Link Libraries (DLLs) required for core Windows features and the Windows API. The OS queries these directories whenever an executable requests to load a DLL without specifying an absolute path. |
| **WinSxS** | The Windows Component Store; maintains copies of all Windows components, updates, and service packs. |

## Command-Line Directory Enumeration

We can enumerate and explore the file system using the `dir` command. Passing the `/a` flag displays all files, including hidden and system files.

```cmd
C:\htb> dir c:\ /a
 Volume in drive C has no label.
 Volume Serial Number is F416-77BE

 Directory of c:\

08/16/2020  10:33 AM    <DIR>          $Recycle.Bin
06/25/2020  06:25 PM    <DIR>          $WinREAgent
07/02/2020  12:55 PM             1,024 AMTAG.BIN
06/25/2020  03:38 PM    <JUNCTION>     Documents and Settings [C:\Users]
08/13/2020  06:03 PM             8,192 DumpStack.log
08/17/2020  12:11 PM             8,192 DumpStack.log.tmp
08/27/2020  10:42 AM    37,752,373,248 hiberfil.sys
08/17/2020  12:11 PM    13,421,772,800 pagefile.sys
12/07/2019  05:14 AM    <DIR>          PerfLogs
08/24/2020  10:38 AM    <DIR>          Program Files
07/09/2020  06:08 PM    <DIR>          Program Files (x86)
08/24/2020  10:41 AM    <DIR>          ProgramData
06/25/2020  03:38 PM    <DIR>          Recovery
06/25/2020  03:57 PM             2,918 RHDSetup.log
08/17/2020  12:11 PM        16,777,216 swapfile.sys
08/26/2020  02:51 PM    <DIR>          System Volume Information
08/16/2020  10:33 AM    <DIR>          Users
08/17/2020  11:38 PM    <DIR>          Windows
               7 File(s) 51,190,943,590 bytes
              13 Dir(s)  261,310,697,472 bytes free
```

For a topological and graphical representation of a path or disk, the `tree` utility is highly effective. 

```cmd
C:\htb> tree "c:\Program Files (x86)\VMware"
Folder PATH listing
Volume serial number is F416-77BE
C:\PROGRAM FILES (X86)\VMWARE
├───VMware VIX
│   ├───doc
│   │   ├───errors
│   │   ├───features
│   │   ├───lang
│   │   │   └───c
│   │   │       └───functions
│   │   └───types
│   ├───samples
│   └───Workstation-15.0.0
│       ├───32bit
│       └───64bit
└───VMware Workstation
    ├───env
    ├───hostd
    │   ├───coreLocale
    │   │   └───en
    │   ├───docroot
    │   │   ├───client
    │   │   └───sdk
    │   ├───extensions
    │   │   └───hostdiag
    │   │       └───locale
    │   │           └───en
    │   └───vimLocale
    │       └───en
    ├───ico
    ├───messages
    │   ├───ja
    │   └───zh_CN
    ├───OVFTool
    │   ├───env
    │   │   └───en
    │   └───schemas
    │       ├───DMTF
    │       └───vmware
    ├───Resources
    ├───tools-upgraders
    └───x64
```

> **SysAdmin Tip:** The `tree` command can generate an overwhelming amount of output on large filesystems. To recursively list all files (`/f`) across the entire `C:\` drive and paginate the output one screen at a time, pipe the standard output to the `more` command:

```cmd
tree c:\ /f | more
```
