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
