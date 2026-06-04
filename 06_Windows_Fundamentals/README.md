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
# Windows File Systems & NTFS Permissions

## 1. File Systems Overview
Windows primarily supports five file system types: **FAT12, FAT16, FAT32, NTFS, and exFAT**. Modern Windows OS environments predominantly utilize NTFS, while FAT12 and FAT16 are deprecated. For standard operations, troubleshooting, and penetration testing, the focus remains on FAT32 and NTFS.

### 1.1 FAT32 (File Allocation Table)
Commonly deployed on portable storage media (USB drives, SD cards) and legacy hard drives. The "32" denotes the 32-bit data structure used to identify data clusters.

**Pros:**
* **Broad Device Compatibility:** Seamlessly integrates with digital cameras, gaming consoles, smartphones, and legacy hardware.
* **OS Cross-Compatibility:** Natively supported across Windows (95+), macOS, and Linux.

**Cons:**
* **File Size Limit:** Capped at a strict maximum file size of 4GB per file.
* **Lack of Native Security:** No built-in file encryption, compression, or inherent data protection mechanisms (requires third-party tools).

### 1.2 NTFS (New Technology File System)
The default and standard file system for Windows since Windows NT 3.1. It addresses FAT32's limitations by offering superior performance, improved data structuring, and extensive metadata support.

**Pros:**
* **Fault Tolerance & Reliability:** Auto-restores file system consistency post-system crash or power failure via built-in journaling (logs all file additions, modifications, and deletions).
* **Granular Security:** Allows precise permission configurations via Access Control Lists (ACLs) at both the file and directory levels.
* **Scalability:** Supports massive partition sizes.

**Cons:**
* **Limited Native Support:** Most mobile and legacy media devices (e.g., older smart TVs, digital cameras) lack native NTFS read/write capabilities.

---

## 2. NTFS Permissions
NTFS provides robust access control through basic and advanced permissions. For administrative efficiency, files and directories inherit permissions from their parent container by default, though an administrator can explicitly disable inheritance to enforce strict least-privilege policies.

| Permission Type | Description |
| :--- | :--- |
| **Full Control** | Complete authority to read, write, modify, and delete files/folders. |
| **Modify** | Grants read, write, and delete capabilities. |
| **List Folder Contents** | Allows viewing/listing of folders, subfolders, and file execution. *(Folders inherit only)* |
| **Read and Execute** | Allows viewing/listing of files and subfolders, plus file execution. *(Files and folders inherit)* |
| **Write** | Permits adding files to folders/subfolders and modifying file contents. |
| **Read** | Allows viewing folder/subfolder listings and reading file contents. |
| **Traverse Folder** | Permits/denies navigation through restricted directories to access allowed target files/folders (e.g., moving through `C:\users\bsmith\documents\` to reach a specific `.zip` archive without having list permissions on the parent directories). |

---

## 3. Integrity Control Access Control List (`icacls`)
While NTFS permissions are configurable via the File Explorer GUI (Security tab), SysAdmins and Pentesters frequently leverage the `icacls` command-line utility for granular access control, automation, and enumeration.

### 3.1 Enumerating Permissions
To list NTFS permissions for a specific directory, run `icacls` against the target path:

```cmd
C:\htb> icacls c:\windows
c:\windows NT SERVICE\TrustedInstaller:(F)
           NT SERVICE\TrustedInstaller:(CI)(IO)(F)
           NT AUTHORITY\SYSTEM:(M)
           NT AUTHORITY\SYSTEM:(OI)(CI)(IO)(F)
           BUILTIN\Administrators:(M)
           BUILTIN\Administrators:(OI)(CI)(IO)(F)
           BUILTIN\Users:(RX)
           BUILTIN\Users:(OI)(CI)(IO)(GR,GE)
           CREATOR OWNER:(OI)(CI)(IO)(F)
Successfully processed 1 files; Failed processing 0 files
```

**Inheritance Flags:**
* `(CI)`: Container Inherit
* `(OI)`: Object Inherit
* `(IO)`: Inherit Only
* `(NP)`: Do Not Propagate Inherit
* `(I)`: Permission inherited from parent container

*Example:* `NT AUTHORITY\SYSTEM:(OI)(CI)(IO)(F)` indicates the SYSTEM account holds object inherit, container inherit, inherit only, and full access rights over all nested file system objects within that directory.

**Basic Access Rights:**
* `F`: Full access
* `D`: Delete access
* `N`: No access
* `M`: Modify access
* `RX`: Read and execute access
* `R`: Read-only access
* `W`: Write-only access

### 3.2 Modifying Permissions
**Reviewing Current Access:**
```cmd
C:\htb> icacls c:\Users
c:\Users NT AUTHORITY\SYSTEM:(OI)(CI)(F)
         BUILTIN\Administrators:(OI)(CI)(F)
         BUILTIN\Users:(RX)
         BUILTIN\Users:(OI)(CI)(IO)(GR,GE)
         Everyone:(RX)
         Everyone:(OI)(CI)(IO)(GR,GE)
Successfully processed 1 files; Failed processing 0 files
```

**Granting Explicit Rights:**
Granting the user `joe` Full Control (`F`) over the `C:\users` directory. *Note: Because the `(OI)` and `(CI)` flags are omitted, `joe` will only have rights over the parent folder, not the nested subdirectories or files.*
```cmd
C:\htb> icacls c:\users /grant joe:f
processed file: c:\users
Successfully processed 1 files; Failed processing 0 files
```

**Verifying the ACL Change:**
```cmd
C:\htb> icacls c:\users
c:\users WS01\joe:(F)
         NT AUTHORITY\SYSTEM:(OI)(CI)(F)
         BUILTIN\Administrators:(OI)(CI)(F)
         ...
Successfully processed 1 files; Failed processing 0 files
```

**Revoking Access:**
To completely strip a user's explicit permissions from the object:
```cmd
C:\htb> icacls c:\users /remove joe
```

> **SysAdmin/Pentester Note:** `icacls` is highly effective in domain environments for managing object ownership, toggling inheritance permissions, and identifying misconfigured ACLs during privilege escalation vectors.

# NTFS vs. Share Permissions

## Overview
Microsoft Windows holds over 70% of the global desktop operating system market share. This widespread adoption makes it a high-value target for malware authors, leading to the misconception that Windows is inherently less secure. In reality, malicious software can be written for any operating system. A significant vector for malware propagation in Windows environments involves network shares with misconfigured or overly lenient permissions. Notably, legacy vulnerabilities like EternalBlue (SMBv1) continue to be exploited to deploy ransomware and compromise enterprise networks.

The Server Message Block (SMB) protocol facilitates access to shared resources such as files, directories, and printers across enterprise environments of all sizes.

> **Note:** Visualizing concepts like SMB communication is critical for mastering network enumeration and lateral movement. Always analyze architectural diagrams carefully to understand the underlying traffic flow.

## Understanding Permissions: NTFS vs. Share
A common pitfall in system administration is conflating NTFS permissions with Share permissions. While they often apply to the same resource, they operate independently. Access control on a Windows network share hosted on an NTFS volume requires a firm understanding of both layers.

### Share Permissions
Share permissions dictate what access is granted when a user connects to a folder over the network via SMB.

| Permission | Description |
| :--- | :--- |
| **Full Control** | Grants all Change and Read permissions, plus the ability to modify permissions for NTFS files and subfolders. |
| **Change** | Allows reading, editing, adding, and deleting files and subfolders. |
| **Read** | Permits viewing file and subfolder contents. |

### NTFS Basic Permissions
NTFS permissions apply locally at the file system level, regardless of how the user accesses the data (locally, RDP, or SMB).

| Permission | Description |
| :--- | :--- |
| **Full Control** | Add, edit, move, delete files/folders, and modify NTFS permissions for all allowed objects. |
| **Modify** | View and modify files/folders, including adding or deleting files. |
| **Read & Execute** | Read file contents and execute programs/scripts. |
| **List folder contents** | View the directory listing of files and subfolders. |
| **Read** | Read the contents of files. |
| **Write** | Write changes to existing files and add new files to a folder. |
| **Special Permissions** | Granular, advanced permission options. |

### NTFS Special Permissions
These provide highly granular access control over specific file and directory operations, allowing SysAdmins to enforce the Principle of Least Privilege (PoLP).

| Permission | Description |
| :--- | :--- |
| **Full control** | Grants absolute control, including taking ownership and changing permissions. |
| **Traverse folder / execute file** | Allows navigating through folders without explicit permissions to the parent, and permits program execution. |
| **List folder / read data** | Allows viewing directory listings and opening/viewing file contents. |
| **Read attributes** | Allows viewing basic file/folder attributes (e.g., system, archive, read-only, hidden). |
| **Read extended attributes** | Allows viewing program-specific extended attributes. |
| **Create files / write data** | Allows creating files in a folder and modifying file data. |
| **Create folders / append data** | Allows creating subfolders and appending data to existing files (prevents overwriting). |
| **Write attributes** | Allows changing standard file attributes (does not grant file/folder creation). |
| **Write extended attributes** | Allows changing program-specific extended attributes. |
| **Delete subfolders and files** | Allows deleting nested subfolders and files (parent folder remains intact). |
| **Delete** | Allows deleting the specified object (parent, subfolder, or file). |
| **Read permissions** | Allows reading the ACL (permissions) of a file or folder. |
| **Change permissions** | Allows modifying the ACL (permissions) of a file or folder. |
| **Take ownership** | Allows taking ownership of an object. The owner can bypass existing permissions to grant themselves full control. |

> **Key Takeaway:** NTFS permissions apply to the host system. By default, objects inherit permissions from their parent directory (e.g., `C:\`), but inheritance can be disabled to set custom ACLs. Share permissions act as a secondary gatekeeper when data is accessed over SMB. When a user connects over the network, the *most restrictive* effective permission between the Share ACL and the NTFS ACL applies.

## Practical Implementation: Creating a Network Share
To solidify our understanding of SMB and NTFS interaction, we will deploy a network share on a Windows 10 target within the lab environment.

*In enterprise environments, shares typically reside on SAN/NAS infrastructure or dedicated Windows Servers. Encountering shares on a desktop OS during a penetration test usually indicates a small business setup, a misconfiguration, or a beachhead system used by an attacker for data exfiltration.*

### Creating and Configuring the Share (GUI Method)

1. **Folder Creation:** Create a new folder named `Company Data` on the desktop.
2. **Advanced Sharing:** Use the Advanced Sharing settings to configure the share parameters.
   *SysAdmin Note:* The share name defaults to the folder name. Limiting simultaneous user connections is a solid resource management and security practice.
3. **Access Control List (ACL) Configuration:** Like NTFS, shared resources use an ACL containing Access Control Entries (ACEs)—typically security principals (users and groups).
   *For this lab, we will apply the default `Everyone` group with `Read` access to test baseline connectivity.*

## Enumeration and Access (SMBClient & CIFS)

### SMB Enumeration from Linux
Acting as the client (Pwnbox), we query the target server (Windows 10) to list available shares.

```bash
MikyRedHat@htb[/htb]$ smbclient -L SERVER_IP -U htb-student
Enter WORKGROUP\htb-student's password: 

    Sharename       Type      Comment
    ---------       ----      -------
    ADMIN$          Disk      Remote Admin
    C$              Disk      Default share
    Company Data    Disk      
    IPC$            IPC       Remote IPC
```

### Connecting to the Target Share
```bash
MikyRedHat@htb[/htb]$ smbclient '\\SERVER_IP\Company Data' -U htb-student
Password for [WORKGROUP\htb-student]:
Try "help" to get a list of possible commands.

smb: \>
```

### Troubleshooting Connectivity: Windows Defender Firewall
If a connection fails despite correct credentials and ACLs, the primary blocker is often the Windows Defender Firewall. By default, Windows blocks incoming SMB traffic from devices outside its Workgroup or Domain.

* **Workgroup vs. Domain Authentication:** In a Workgroup, authentication relies on the local SAM database. In a Windows Domain, netlogon requests are authenticated centrally against Active Directory (AD). Identifying the environment architecture is crucial for successful authentication.
* **Firewall Profiles:** Windows groups firewall rules into three profiles: Domain, Private, and Public. Modifying specific predefined inbound rules (e.g., `File and Printer Sharing (SMB-In)`) is standard practice over completely deactivating the firewall, which is a severe security risk. (In domains, these are centrally managed via GPOs).

### NTFS Permissions Review
Assuming the firewall allows the connection, our remote access is still bound by the `Everyone: Read` Share permission. Let's examine the underlying NTFS permissions locally on the target:

*SysAdmin Note: Grey checkmarks indicate inherited permissions from the parent directory (`C:\`).*

### Mounting the SMB Share
To interact seamlessly with the share directly from the Linux CLI, we can mount it locally. If we grant `Full control` to `Everyone` at the Share level, our effective access relies entirely on the granular NTFS permissions.

*Ensure the CIFS utilities are installed on your Linux host:*
```bash
MikyRedHat@htb[/htb]$ sudo apt-get install cifs-utils
```

*Create the mount point:*
```bash
MikyRedHat@htb[/htb]$ sudo mount -t cifs -o username=htb-student,password=Academy_WinFun! //SERVER_IP/"Company Data" /home/user/Desktop/
```

## Post-Exploitation and Administration Monitoring

Once connected, System Administrators and Incident Responders leverage built-in Windows utilities to monitor shares, audit access, and track potential breaches.

### Enumerating Shares with `net share`
Administrative shares (`C$`, `ADMIN$`, `IPC$`) are deployed by default upon Windows installation. This means an attacker with appropriate privileges can remotely access the entire `C:\` drive of any Windows system on the network via SMB.

```cmd
C:\Users\htb-student> net share

Share name   Resource                        Remark
-------------------------------------------------------------------------------
C$           C:\                             Default share
IPC$                                         Remote IPC
ADMIN$       C:\WINDOWS                      Remote Admin
Company Data C:\Users\htb-student\Desktop\Company Data

The command completed successfully.
```

### Computer Management and Event Viewer
* **Computer Management (`compmgmt.msc`):** Provides a GUI to monitor active Shares, current Sessions, and Open Files. This is a critical artifact location during Incident Response to track unauthorized SMB access and lateral movement.
* **Event Viewer (`eventvwr.msc`):** Windows logs nearly every system action. Share access, modifications, and authentication attempts generate Security logs (e.g., Event ID 5140 for network share access), providing a detailed audit trail of operations performed on the file system.

# Windows Services & Processes

## 1. Windows Services Overview

Services are a foundational component of the Windows operating system, designed to create and manage long-running background processes. They can be configured to start automatically at system boot without user intervention and continue to run seamlessly even after the user terminates their session.

Applications can also be deployed as services (e.g., network monitoring agents on a Windows Server). Windows services govern critical OS functions, including network stacks, system diagnostics, credential management, and Windows Updates.

### 1.1. Service Management
Services are primarily managed via the **Service Control Manager (SCM)**, accessible through the GUI via the `services.msc` MMC snap-in. This interface displays crucial metadata:
* **Name & Description**
* **Status** (Running, Stopped, Paused, Starting, Stopping)
* **Startup Type** (Manual, Automatic, Automatic - Delayed Start)
* **Log On As** (The account context under which the service executes)

For CLI administration, services can be queried and managed using `sc.exe` or PowerShell cmdlets like `Get-Service`.

```powershell
PS C:\htb> Get-Service | Where-Object {$_.Status -eq "Running"} | Select-Object -First 2 | Format-List

Name                : AdobeARMservice
DisplayName         : Adobe Acrobat Update Service
Status              : Running
DependentServices   : {}
ServicesDependedOn  : {}
CanPauseAndContinue : False
CanShutdown         : False
CanStop             : True
ServiceType         : Win32OwnProcess

Name                : Appinfo
DisplayName         : Application Information
Status              : Running
DependentServices   : {}
ServicesDependedOn  : {RpcSs, ProfSvc}
CanPauseAndContinue : False
CanShutdown         : False
CanStop             : True
ServiceType         : Win32OwnProcess, Win32ShareProcess
```

> **Security Note:** Windows services operate within three primary privilege contexts: **Local Service**, **Network Service**, and **System**. Modifying service states typically requires Administrative privileges. Consequently, misconfigured service permissions (e.g., insecure service executables or unquoted service paths) represent a highly common privilege escalation vector during pentesting.

---

## 2. Critical System Services

Windows relies on several core services that are critical to OS stability. Terminating or updating resources utilized by these services often necessitates a system reboot. 

| Service / Process | Description |
| :--- | :--- |
| **`smss.exe`** | **Session Manager SubSystem:** Responsible for initializing and handling system sessions. |
| **`csrss.exe`** | **Client Server Runtime Process:** The user-mode execution portion of the Windows subsystem. |
| **`wininit.exe`** | **Windows Initialization Process:** Processes the `Wininit.ini` file, applying system changes post-reboot (e.g., after software installations). |
| **`logonui.exe`** | **Logon User Interface:** Facilitates the graphical user login interface. |
| **`lsass.exe`** | **Local Security Authority Subsystem Service:** Verifies user logons, generates authentication processes for `winlogon`, and enforces security policies. |
| **`services.exe`** | **Service Control Manager:** Manages the initialization, pausing, and stopping of background services. |
| **`winlogon.exe`** | **Windows Logon Process:** Handles the Secure Attention Sequence (SAS), loads user profiles, and locks the machine during screensaver execution. |
| **`System`** | A background system process that hosts and executes the Windows kernel space. |
| **`svchost.exe` (RPCSS)** | Manages system services running from dynamic-link libraries (`.dll`) leveraging the Remote Procedure Call (RPC) Service. |
| **`svchost.exe` (Dcom/PnP)** | Manages `.dll`-based system services utilizing the Distributed Component Object Model (DCOM) and Plug and Play (PnP) infrastructures. |

---

## 3. Processes

Processes are instances of executing programs. They operate in the background, either triggered autonomously by the OS or spawned by user applications. While third-party application processes can usually be terminated without systemic impact, killing core OS processes (like `lsass.exe`, `csrss.exe`, or `smss.exe`) will result in system instability or immediate failure (BSOD).

### 3.1. High-Value Target: LSASS (`lsass.exe`)
The **Local Security Authority Subsystem Service** is responsible for enforcing security policies. Upon a logon attempt, LSASS verifies the credentials and generates an access token defining the user's privileges. It also manages password changes and logs security events (logons/logoffs) to the Windows Security Event Log.
> **Pentesting Relevance:** `lsass.exe` is a primary target during post-exploitation. Pentesters frequently dump the LSASS process memory to extract plaintext credentials, NTLM hashes, and Kerberos tickets using tools like Mimikatz or ProcDump.

---

## 4. Sysinternals Tools

The **Sysinternals Suite** is a powerful collection of portable, advanced administration and diagnostic tools for Windows. They do not require formal installation and can be executed dynamically from disk or accessed remotely via a Microsoft-hosted SMB share: `\\live.sysinternals.com\tools`.

**Example: Executing ProcDump directly from the live share:**
```cmd
C:\htb> \\live.sysinternals.com\tools\procdump.exe -accepteula

ProcDump v9.0 - Sysinternals process dump utility
Copyright (C) 2009-2017 Mark Russinovich and Andrew Richards
Sysinternals - www.sysinternals.com

Monitors a process and writes a dump file when the process exceeds the
specified criteria or has an exception.
...
```

**Key Sysinternals Tools:**
* **Process Explorer:** An advanced Task Manager alternative.
* **Process Monitor (ProcMon):** Captures real-time file system, Registry, and network activity.
* **TCPView:** Maps network connections to specific processes.
* **PsExec:** Allows for remote command execution over SMB, a critical tool for lateral movement.

---

## 5. System Monitoring Utilities

### 5.1. Task Manager (`taskmgr.exe`)
The native GUI tool for monitoring system health and process states. Accessible via `Ctrl + Shift + Esc`, `Ctrl + Alt + Del`, or by running `taskmgr` from an administrative console.

| Tab | Functionality |
| :--- | :--- |
| **Processes** | Displays running apps and background processes with real-time CPU, Memory, Disk, and Network usage. |
| **Performance** | Provides telemetry graphs (Uptime, CPU/RAM/Disk/GPU utilization) and acts as a gateway to the Resource Monitor. |
| **App History** | Historical resource usage metrics per application for the current user. |
| **Startup** | Manages applications initialized at boot and measures their impact on boot times. |
| **Users** | Lists active user sessions and their respective process trees and resource consumption. |
| **Details** | Exposes granular process data: Name, PID, Status, Executing User Context, and specific memory allocation. |
| **Services** | Quick view of SCM data (Name, PID, Description, Status) with a shortcut to the `services.msc` MMC. |

### 5.2. Process Explorer
Often referred to as "Task Manager on steroids", Process Explorer provides deep visibility into the OS execution state. 
* **Capabilities:** Tracks loaded DLLs, active memory-mapped files, and specific handles (e.g., identifying which process has locked a specific file). 
* **Troubleshooting:** Highly effective for mapping parent-child process trees, hunting malware persistence, and identifying orphaned processes holding file locks.

# Auditing Windows Service Permissions

## 1. Overview & Threat Landscape
Windows services manage background, long-running processes that are critical to the operating system. Despite their importance, service permission configurations are frequently overlooked by system administrators. This oversight makes them prime targets for attackers looking to:
* Load malicious DLLs (DLL Hijacking).
* Execute unauthorized applications without requiring explicit administrative credentials.
* Achieve Local Privilege Escalation (LPE).
* Maintain stealthy persistence within the compromised host.

These vulnerabilities typically arise from misconfigured service permissions introduced during third-party software installations or administrative oversights.

## 2. Service Accounts & The Principle of Least Privilege
By default, services often run under the context of the user performing the installation. For example, if an administrator installs a DHCP server using their personal account, the service relies on those specific credentials. If that administrator leaves the organization and their account is disabled, the DHCP service will fail to start, leading to network-wide IP allocation failures (a self-inflicted Denial of Service). 

To prevent downtime and mitigate security risks, organizations must implement dedicated **Service Accounts**. Furthermore, applying the **Principle of Least Privilege (PoLP)** is crucial. Not all applications require maximum system authority.

Notable built-in Windows service accounts include:
* `LocalService`: Standard privileges on the local system, presents anonymous credentials on the network.
* `NetworkService`: Standard privileges on the local system, presents the computer's credentials on the network.
* `LocalSystem` (`NT AUTHORITY\SYSTEM`): The highest level of access on a Windows OS. Default for many services, but should be strictly audited and restricted when possible.

## 3. Enumerating & Managing Services

### 3.1 Graphical Interface (`services.msc`)
The `services.msc` snap-in provides a comprehensive view of service configurations. Key properties to audit include:
* **Path to executable:** The absolute path and command-line arguments executed upon service startup. If the target directory has weak NTFS permissions, an attacker can replace the legitimate binary with a malicious executable.
* **Recovery Tab:** Defines actions taken upon service failure (e.g., "Run a program"). This is a known vector for attackers to trigger malicious payloads by intentionally crashing a legitimate service.

### 3.2 Command-Line Interface (`sc.exe`)
The Service Control (`sc`) utility is highly scriptable and essential for rapid enumeration during both offensive operations and incident response.

**Querying Service Configuration:**
```cmd
C:\> sc qc wuauserv
```
*(Note: To query a remote host, append the IP or hostname: `sc \\<IP> query <ServiceName>`)*

**Modifying Service Binaries (Requires Elevation):**
```cmd
C:\> sc config wuauserv binPath="C:\Windows\Temp\malicious_payload.exe"
```

**Starting and Stopping Services:**
```cmd
C:\> sc stop wuauserv
C:\> sc start wuauserv
```

## 4. Security Descriptors & SDDL Auditing
Every securable object in Windows possesses a Security Descriptor, which contains the object's owner, a **Discretionary Access Control List (DACL)** for access control, and a **System Access Control List (SACL)** for auditing/logging.

You can extract a service's security descriptor using `sc sdshow`:
```cmd
C:\> sc sdshow wuauserv
```

### Deciphering SDDL (Security Descriptor Definition Language)
The output of `sdshow` is formatted in SDDL. A sample DACL entry looks like this: `D:(A;;CCLCSWRPLORC;;;AU)`

**Breakdown of `D:(A;;CCLCSWRPLORC;;;AU)`:**
* `D:` Indicates the start of the DACL.
* `A;;` Defines that the proceeding actions are **Allowed** (vs. Denied).
* `CC` (`SERVICE_QUERY_CONFIG`): Permission to query the Service Control Manager (SCM).
* `LC` (`SERVICE_QUERY_STATUS`): Permission to query the current status.
* `SW` (`SERVICE_ENUMERATE_DEPENDENTS`): Permission to list dependent services.
* `RP` (`SERVICE_START`): Permission to start the service.
* `LO` (`SERVICE_INTERROGATE`): Permission to interrogate the service.
* `RC` (`READ_CONTROL`): Permission to read the security descriptor.
* `;;;AU` Defines the Security Principal. In this case, `AU` stands for **Authenticated Users**.

## 5. PowerShell Automation (`Get-Acl`)
For scalable enumeration across Active Directory domains or larger networks, PowerShell provides a more robust and human-readable output than `sc`. By querying the service registry path, we can retrieve explicit Security Identifiers (SIDs) alongside the SDDL.

```powershell
PS C:\> Get-Acl -Path HKLM:\System\CurrentControlSet\Services\wuauserv | Format-List
```
This cmdlet outputs the explicit Owner, Group, detailed Access Control Entries (ACEs), and the full SDDL string, making it an invaluable tool for automated vulnerability discovery and auditing.

# Windows Sessions & Account Types

Understanding Windows session types and account privileges is a foundational concept for both system administration and identifying privilege escalation vectors.

## 1. Interactive Logon Sessions
An interactive (or local) logon session is established when a user explicitly authenticates to a local system or an Active Directory domain by supplying valid credentials.

**Standard Initiation Methods:**
* **Direct/Physical Console:** Logging in locally at the machine interface.
* **Secondary Logon:** Requesting a session under a different security context using the `runas` command via the CLI.
* **Remote Access:** Establishing a GUI session over the network via Remote Desktop Protocol (RDP).

## 2. Non-Interactive Logon Sessions
Unlike standard user profiles, non-interactive accounts do not require explicit login credentials (passwords). These are built-in accounts strictly utilized by the Windows operating system to automatically manage background services, applications, and scheduled tasks upon system boot, without requiring human interaction.

### Non-Interactive Account Tiers

| Account Type | System Identifier | Privilege Level & Description |
| :--- | :--- | :--- |
| **Local System** | `NT AUTHORITY\SYSTEM` | The most powerful built-in account in the Windows OS. It is utilized for critical OS-related tasks (e.g., starting core Windows services). *Note: This account possesses higher execution privileges than the local Administrators group.* |
| **Network Service** | `NT AUTHORITY\NetworkService` | Operates with privileges similar to a standard local user on the host machine but has the capability to establish authenticated sessions for certain network services across the domain. |
| **Local Service** | `NT AUTHORITY\LocalService` | A restricted, less privileged version of the SYSTEM account. It operates with limited local functionality, comparable to a standard user account, and is designed to run isolated local services safely. |
