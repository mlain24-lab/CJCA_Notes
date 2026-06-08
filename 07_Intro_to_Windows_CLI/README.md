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
