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
