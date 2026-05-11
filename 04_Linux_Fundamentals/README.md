# Linux Fundamentals: Structure, Architecture, and File System

Linux is a foundational pillar in cybersecurity and systems administration, renowned for its robustness, flexibility, modularity, and open-source nature. This documentation covers the core structure, architecture, and file system hierarchy of Linux—essential knowledge for navigating, securing, and administrating enterprise environments.

## 1. Operating System Overview

An Operating System (OS) is the foundational software that manages a computer's hardware resources, acting as the critical bridge between software applications and physical components (CPU, RAM, I/O devices). Unlike proprietary operating systems (such as Windows or macOS), Linux is distributed in hundreds of variations called **distributions** (or "distros"), which are tailored environments built on top of the Linux kernel.

For our security and penetration testing environments (such as HTB Pwnbox), we primarily utilize **Parrot OS**—a Debian-based Linux distribution heavily optimized for security, privacy, and development.

## 2. History & Evolution

The development of Linux is deeply tied to the evolution of Unix:
*   **1970:** Unix is released by Ken Thompson and Dennis Ritchie at AT&T.
*   **1977:** The Berkeley Software Distribution (BSD) is released, but its growth is stunted by AT&T lawsuits over proprietary code.
*   **1983:** Richard Stallman launches the GNU Project to create a free, Unix-like OS, leading to the creation of the GNU General Public License (GPL).
*   **1991:** Linus Torvalds, a Finnish student, initiates a personal project to develop a free OS kernel. This becomes the **Linux Kernel**.

Today, the Linux kernel contains over 23 million lines of code and operates under the GNU GPLv2. It powers everything from enterprise servers and mainframes to embedded systems (routers, IoT devices) and mobile ecosystems (Android). While it presents a steeper learning curve than Windows, Linux offers unparalleled stability, performance, and a significantly smaller attack surface against malware.

## 3. Core Philosophy

The Linux philosophy is driven by simplicity, modularity, and openness. It champions the deployment of small, single-purpose utilities that can be chained together to execute complex operations.

| Principle | Description |
| :--- | :--- |
| **Everything is a file** | All system resources (hardware devices, processes, network sockets) are represented as files. They can be read from and written to using standard I/O commands. |
| **Small, single-purpose programs** | The ecosystem relies on lightweight, specialized tools designed to do one specific task flawlessly. |
| **Chaining programs** | Utilities can be piped (  &#124;  )  and integrated to parse, filter, and process data for complex tasks. |
| **Avoid captive interfaces** | Linux is optimized for the Command Line Interface (CLI/Shell), granting administrators granular control without GUI overhead. |
| **Plain-text configuration** | Configuration data is stored in human-readable text files (e.g., `/etc/passwd`), simplifying management and automation. |

## 4. System Components

Think of a Linux system as a well-structured organization where every component has a strictly defined operational role:

| Component | Description |
| :--- | :--- |
| **Bootloader** | The initial code executed to load the OS into memory. Parrot OS and most modern distros use **GRUB** (Grand Unified Bootloader). |
| **Kernel** | The core of the OS. It operates at the hardware level, managing CPU scheduling, memory allocation, and I/O devices. |
| **Daemons** | Background services (processes) initialized during boot or runtime to handle core functions like logging, scheduling (`cron`), and networking. |
| **Shell** | The CLI interpreter that acts as the interface between the user and the kernel. Common shells include **Bash**, **Zsh**, and **Fish**. |
| **Graphics Server** | The subsystem (e.g., X11 or Wayland) that provides the framework to draw windows and handle GUI interactions. |
| **Window Manager** | The Desktop Environment (DE) or GUI (e.g., GNOME, KDE, MATE) that provides a visual workspace for the user. |
| **Utilities** | Standard applications and binaries used to perform administrative or user-level tasks. |

## 5. Architectural Layers

The architecture of Linux is strictly layered to ensure stability and isolate processes:


| Layer | Function |
| :--- | :--- |
| **Hardware** | The physical infrastructure: CPU, RAM, Disk, and Network Interfaces. |
| **Kernel** | Virtualizes hardware resources, allocating them safely to isolated processes to prevent resource conflicts. |
| **Shell** | The command-line interface where administrators input commands to interact with the kernel. |
| **System Utilities** | Daemons and binaries that leverage the shell and kernel to execute operational tasks. |

## 6. Filesystem Hierarchy Standard (FHS)

Linux organizes files in a strict, tree-like structure defined by the Filesystem Hierarchy Standard (FHS). Understanding this layout is non-negotiable for system administration and privilege escalation.


| Path | Description |
| :--- | :--- |
| `/` | **Root:** The absolute top-level directory. It contains all files required to boot the OS and acts as the mount point for all other filesystems. |
| `/bin` | **Essential Binaries:** Core executable commands available to all users (e.g., `ls`, `cat`, `grep`). |
| `/boot` | **Bootloader Files:** Contains the static kernel executable (`vmlinuz`), initramfs, and GRUB configurations. |
| `/dev` | **Device Files:** Virtual files representing attached hardware and pseudo-devices (e.g., `/dev/sda`, `/dev/null`). |
| `/etc` | **Configuration:** Host-specific system and application configuration files (strictly static text). |
| `/home` | **User Profiles:** Individual home directories for standard users, storing personal files and local configurations. |
| `/lib` | **Libraries:** Essential shared object libraries (`.so`) required by binaries in `/bin` and `/sbin`, as well as kernel modules. |
| `/media` | **Removable Media:** Standard mount points for dynamically attached external storage (USB, CD-ROMs). |
| `/mnt` | **Temporary Mounts:** Directory used by administrators to manually mount filesystems. |
| `/opt` | **Optional Software:** Installation directory for self-contained, third-party software packages. |
| `/root` | **Root Home:** The dedicated home directory for the administrative `root` user. |
| `/sbin` | **System Binaries:** Executables intended exclusively for system administration (e.g., `fdisk`, `iptables`). |
| `/tmp` | **Temporary Files:** Ephemeral storage used by applications. Typically cleared out upon system reboot. |
| `/usr` | **User Programs:** Secondary hierarchy containing read-only user data, binaries, libraries, and documentation (`man` pages). |
| `/var` | **Variable Data:** Files expected to change dynamically during system operation, including logs (`/var/log`), caches, and web roots (`/var/www`). |

# Linux Distributions Overview

## Introduction to Linux Distributions
Linux distributions, commonly known as "distros," are operating systems built upon the Linux kernel. They are highly adaptable and deployed across a wide spectrum of environments, from enterprise servers and embedded IoT devices to personal desktops and mobile architectures. 

To draw a parallel: if Linux were a corporate franchise, the kernel and core architecture would represent the shared corporate infrastructure and philosophy. Each specific distro, however, acts as an independent branch, offering customized software packages, configurations, and user experiences tailored to specific market demands, all while operating under the unified banner of Linux.

### Mainstream General-Purpose Distributions
Each distribution distinguishes itself through unique feature sets, default package managers, and pre-installed tooling. Prominent general-purpose distros include:
* Ubuntu
* Fedora
* CentOS
* Debian
* Red Hat Enterprise Linux (RHEL)

Many users migrate to desktop Linux due to its free, open-source nature and granular customizability. **Ubuntu** and **Fedora** are optimal entry points for beginners. In enterprise environments, Linux is the de-facto standard for server operating systems due to its robust security architecture, high stability, reliability, and aggressive update cycles.

---

## Linux in Cybersecurity
As cybersecurity specialists, Linux is our weapon of choice primarily because it is open-source. This transparency allows for deep code scrutiny, security auditing, and extensive customization. We can strip down the OS to minimize the attack surface or configure it strictly for specialized use cases (e.g., penetration testing, digital forensics).

Linux architectures scale seamlessly across web servers, mobile devices, embedded systems, cloud infrastructures, and standard desktops. 

### Security-Focused & IT Distributions
The primary differentiators among distros are the default repositories (packages), desktop environments (GUI/CLI), and pre-installed toolchains. Notable distros in our field include:
* **Kali Linux:** The industry standard for offensive security, pre-loaded with a massive arsenal of security-focused packages and pentesting tools.
* **ParrotOS:** A lightweight, security-focused alternative to Kali.
* **BackBox:** An Ubuntu-based distro tailored for network analysis and ethical hacking.
* **BlackArch:** An Arch Linux-based penetration testing distribution.
* **Pentoo:** A security-focused Live CD based on Gentoo.
* **Ubuntu / Debian:** Widely used for homelabs, servers, and embedded systems (like Raspberry Pi OS).
* **RHEL / CentOS:** The industry standard for enterprise-level server computing.

---

## Deep Dive: Debian
**Debian** is a foundational, highly respected distribution renowned for its rock-solid stability and reliability. It is the upstream source for many other distros (including Ubuntu and Kali) and is widely deployed in mission-critical servers, embedded systems, and daily-driver desktops.

### Package Management & Security Updates
Debian utilizes the **Advanced Package Tool (`apt`)** to manage software installations, updates, and security patches. This package manager is critical for maintaining system integrity, allowing sysadmins to automate security patching or maintain strict manual control over updates to ensure the environment remains secure against emerging threats.

### Learning Curve & Granular Control
While Debian presents a steeper learning curve compared to user-friendly forks, it offers unparalleled flexibility. The initial configuration and setup require a deeper technical understanding, but this yields absolute administrative control over the system. 

*SysAdmin Note:* Increased control inherently feels more complex due to the sheer volume of possibilities and configurations available. However, mastering this complexity through deep-dive learning is vastly more efficient in the long run. Relying on GUI tools for "easy" tasks wastes time compared to mastering core CLI concepts, which we will explore further in the *Filter Contents* and *Find Files and Directories* sections.

### Stability & Long-Term Support (LTS)
Debian's core strength is its stability. Its Long-Term Support (LTS) release model guarantees updates and security patches for up to five years. This makes it a top-tier choice for servers requiring 24/7 High Availability (HA). 

While vulnerabilities inevitably surface in any OS, Debian's robust development community and dedicated security teams ensure rapid deployment of patches. Its proven security track record and commitment to privacy make Debian an elite, versatile choice for both system administration and cybersecurity operations.

# Introduction to the Linux Shell

Mastering the Linux shell is a fundamental requirement for any IT infrastructure or cybersecurity professional. Given its stability, security, and lower overhead compared to Windows server environments, Linux is the industry standard for hosting web servers and critical enterprise infrastructure. Effectively administering a Linux operating system requires a deep understanding of its core interface: the **Shell**. 

When transitioning from a Windows environment to Linux, the initial command-line interface typically looks like this:


A Linux terminal—often referred to interchangeably as the shell, command line, or console—provides a text-based Input/Output (I/O) interface that bridges the gap between the user and the system's kernel. Strictly speaking, a true console operates entirely in text mode, independent of a window manager. Through this interface, system commands are executed to control the OS at a granular level. 

Fundamentally, the shell operates as a highly versatile, text-based GUI. It processes commands for directory navigation, file manipulation, and system enumeration, offering significantly more power, speed, and flexibility than standard graphical interfaces.

## Terminal Emulators & Multiplexers

**Terminal Emulation** refers to software that replicates the functionality of a physical hardware terminal, allowing users to execute text-based programs within a Graphical User Interface (GUI). Ultimately, the terminal emulator acts as the front-end communication gateway to the underlying back-end shell interpreter.

**The Architecture Analogy:**
* **The Shell (The Server Room):** The core engine that processes all system data and executes commands.
* **The Terminal (The Reception Desk):** The communication endpoint where you submit instructions to be processed by the server room.
* **Terminal Emulator (The Virtual Interface):** Software acting as a virtual reception desk on your GUI screen, allowing you to interact with the shell without being restricted to a pure TTY text-mode environment.
* **CLI/Multiplexing (Multiple Desks):** Opening multiple virtual desks simultaneously, allowing parallel instruction streams to the server room through the same primary interface.

To maximize operational efficiency, system administrators and pentesters rely on terminal emulators and **multiplexers** (such as `tmux` or `screen`). These tools provide advanced workspace management, enabling you to split a single terminal window into multiple panes, persist background sessions, and work across multiple directories simultaneously.


## The Shell Ecosystem

The default and most ubiquitous shell in Linux environments is the **Bourne-Again Shell (BASH)**, developed as part of the GNU project. Any administrative action performable via a GUI can be replicated—and often executed far more efficiently—via the shell. It provides unparalleled access to system processes and allows for the automation of complex, repetitive tasks through bash scripting.

While Bash is the industry standard, several other powerful shells are widely used depending on user preference and environment:
* **Zsh (Z Shell):** Highly popular in development and pentesting (often standard in modern Kali Linux builds) for its advanced auto-completion and robust plugin frameworks (e.g., Oh My Zsh).
* **Fish (Friendly Interactive Shell):** Known for its intelligent auto-suggestions and out-of-the-box syntax highlighting.
* **Ksh (KornShell)** and **Tcsh/Csh (C Shell):** Frequently encountered when auditing or maintaining legacy UNIX environments.

# Linux Fundamentals: Bash Prompt & PS1 Configuration

The Bash prompt is the primary interface indicator that signals the system is ready to accept commands. By default, it provides critical environmental context, such as the current user identity, host machine, and the working directory.

## 1. Prompt Structure and Privilege Levels

The standard syntax for a prompt is typically represented as:
`<username>@<hostname>:<current_working_directory><symbol>`

The terminal uses specific symbols to denote the current shell's privilege level:

*   **Unprivileged User (`$`):** Indicates the session is running under standard user permissions.
*   **Privileged/Root User (`#`):** Indicates an administrative or root session.

> **Root ??**
> **English:** The superuser account in Unix-like operating systems with full system access and administrative privileges.
> **Español:** La cuenta de superusuario en sistemas operativos tipo Unix con acceso total al sistema y privilegios administrativos.

In scenarios where a reverse shell is executed or the environment is not fully initialized, the prompt may default to a simple `$` or `#` because the **PS1** variable has not been exported or defined.

## 2. The PS1 Variable

The **PS1** (Prompt String 1) is an environment variable that defines the primary prompt structure. Customizing this variable is essential for maintaining situational awareness during penetration tests (e.g., displaying the target IP or a timestamp for logging purposes).

> **PS1 ??**
> **English:** The primary prompt string environment variable that defines the appearance and information displayed in the command-line prompt.
> **Español:** La variable de entorno de la cadena de prompt primario que define la apariencia y la información mostrada en el prompt de la línea de comandos.

### Special Characters for Customization

# Advanced Bash Prompt: Full PS1 Escape Sequences Reference

The **PS1** variable is highly extensible, allowing administrators and security researchers to embed real-time system data directly into the shell interface. Beyond basic identity, these sequences enable precise logging and situational awareness.

> **Bash Escape Sequences ??**
> **English:** Special backslash-escaped characters that Bash interprets as dynamic commands to insert specific system information into the prompt string.
> **Español:** Caracteres especiales precedidos por una barra invertida que Bash interpreta como comandos dinámicos para insertar información específica del sistema en la cadena del prompt.

## 1. Complete Escape Sequence Table

| Sequence | Description |
| :--- | :--- |
| `\a` | An ASCII bell character (07). |
| `\d` | The date in "Weekday Month Date" format (e.g., "Tue May 26"). |
| `\D{format}` | Custom date format (passed to `strftime(3)`). Use `{}` for local time. |
| `\e` | An ASCII escape character (033). Used for adding colors. |
| `\h` | The hostname up to the first dot ('.'). |
| `\H` | The full hostname (FQDN). |
| `\j` | The number of jobs currently managed by the shell. |
| `\l` | The basename of the shell’s terminal device name (tty). |
| `\n` | Newline character (creates multi-line prompts). |
| `\r` | Carriage return. |
| `\s` | The name of the shell (the basename of `$0`). |
| `\t` | Current time in 24-hour HH:MM:SS format. |
| `\T` | Current time in 12-hour HH:MM:SS format. |
| `\@` | Current time in 12-hour AM/PM format. |
| `\A` | Current time in 24-hour HH:MM format. |
| `\u` | The username of the current user. |
| `\v` | The version of Bash (e.g., 5.1). |
| `\V` | The release of Bash (version + patch level). |
| `\w` | The current working directory (full path, with $HOME as `~`). |
| `\W` | The basename of the current working directory. |
| `\!` | The history number of the current command. |
| `\#` | The command number of the current command (resets every session). |
| `\$` | Displays `#` if the effective UID is 0 (root), otherwise `$`. |
| `\nnn` | The character corresponding to the octal number `nnn`. |
| `\\` | A literal backslash. |
| `\[` | Begin a sequence of non-printing characters (essential for color codes). |
| `\]` | End a sequence of non-printing characters. |

## 2. Practical Pentesting Implementation

During an engagement, it is recommended to include the command number (`\!`) and a timestamp (`\t`) to ensure that `script` logs and `.bash_history` are easy to correlate with server logs.

### Recommended "Audit-Ready" Prompt:
`export PS1="\[\e[32m\][\t] \[\e[31m\]\u@\h\[\e[m\]:\w (\!) \$ "`

### Key Symbols Summary
*   **~**: Current User's Home Directory.
*   **$**: Unprivileged user.
*   **#**: Root/Privileged user.

## 3. Advanced Customization & Tools

For complex environments, external tools can automate the generation of high-visibility prompts:

*   **Bash Prompt Generator:** Web-based tools to visually construct PS1 strings.
*   **Powerline:** A status line plugin that provides highly detailed, color-coded information for Vim, Bash, and other applications.

Leveraging these configurations ensures that all actions captured via `script` or `.bash_history` are contextualized with timing and location data, which is vital for professional reporting and incident post-mortems.

# 01. Getting Help in the Linux CLI

## Overview
Having established a solid foundation in Linux directory structures and the shell, the next operational phase is mastering command-line execution and self-reliance. In daily SysAdmin or pentesting workflows, encountering unfamiliar binaries or forgetting specific syntax flags is standard. Efficiently retrieving local documentation using native help functions and manual pages is a critical skill for troubleshooting and system enumeration.

## Basic Enumeration: The `ls` Command
The `ls` command is the standard utility for listing files and directories. Like most GNU core utilities, it supports various optional parameters to format or filter standard output.

```shell
MikyRedHat@htb[/htb]$ ls
cacert.der  Documents  Music     Public     Videos
Desktop     Downloads  Pictures  Templates
```

## Native Documentation: Manual Pages (`man`)
The `man` command interfaces with the system's reference manuals, providing exhaustive documentation on commands, daemons, configuration files, and system calls. 

**Syntax:**
```shell
MikyRedHat@htb[/htb]$ man <tool>
```

**Example:**
```shell
MikyRedHat@htb[/htb]$ man ls

LS(1)                            User Commands                           LS(1)
NAME
       ls - list directory contents
SYNOPSIS
       ls [OPTION]... [FILE]...
DESCRIPTION
       List  information  about  the FILEs (the current directory by default).
...
```

## Quick Syntax Reference: Help Flags
For rapid parameter lookup without invoking a pager, most utilities support the `--help` flag or its short-form `-h`. This outputs the tool's usage synopsis directly to the terminal, which is ideal for quick checks while scripting or chaining commands.

**Syntax:**
```shell
MikyRedHat@htb[/htb]$ <tool> --help
MikyRedHat@htb[/htb]$ <tool> -h
```

**Examples:**
```shell
MikyRedHat@htb[/htb]$ ls --help
Usage: ls [OPTION]... [FILE]...
List information about the FILEs (the current directory by default).
...
```

```shell
MikyRedHat@htb[/htb]$ curl -h
Usage: curl [options...] <url>
     --abstract-unix-socket <path> Connect via abstract Unix domain socket
...
```

## Keyword Searching: `apropos`
When the exact binary name is unknown, the `apropos` command searches the short descriptions of all local man pages for a given keyword, effectively mapping required functions to available tools.

**Syntax:**
```shell
MikyRedHat@htb[/htb]$ apropos <keyword>
```

**Example:**
```shell
MikyRedHat@htb[/htb]$ apropos sudo
sudo (8)             - execute a command as another user
sudo.conf (5)        - configuration for sudo front end
sudo_plugin (8)      - Sudo Plugin API
sudo_root (8)        - How to run administrative commands
...
```

## External Resources
When analyzing complex, heavily chained pipelines, [ExplainShell](https://explainshell.com/) is an excellent external resource that visually breaks down standard Linux commands and their respective flags.

# System Information & Enumeration in Linux

Understanding the structure of Linux systems—including processes, network configurations, user permissions, and directory structures—is fundamental for both routine system administration and security assessments. Properly leveraging native binaries is critical for identifying misconfigurations, discovering vulnerabilities, and mapping potential vectors for privilege escalation.

## Essential Enumeration Tools

The following utilities are pre-installed on most Linux distributions and are essential for situational awareness upon obtaining shell access.

| Command | Description |
| :--- | :--- |
| `whoami` | Displays the current logged-in username. |
| `id` | Returns the user's identity, including UID, GID, and effective group memberships. |
| `hostname` | Sets or prints the name of the current host system. |
| `uname` | Prints basic information about the OS kernel and system hardware. |
| `pwd` | Returns the absolute path of the current working directory. |
| `ifconfig` | Configures network interface parameters and assigns/views IP addresses (Deprecated; replaced by `ip`). |
| `ip` | Shows or manipulates routing, network devices, interfaces, and tunnels. |
| `netstat` | Displays network connections, routing tables, and interface statistics. |
| `ss` | Investigates sockets (faster and more detailed alternative to `netstat`). |
| `ps` | Displays the status of current running processes. |
| `who` | Displays a list of users currently logged into the system. |
| `env` | Prints the environment variables or sets/executes commands in a modified environment. |
| `lsblk` | Lists information about all available or specified block devices. |
| `lsusb` | Lists connected USB devices. |
| `lsof` | Lists open files and the processes that opened them. |
| `lspci` | Lists all PCI devices. |

---

## Secure Shell (SSH) Access

**SSH (Secure Shell)** is the industry-standard protocol for executing commands on remote Unix-like hosts. It operates without a GUI, occupying minimal overhead while providing encrypted, secure administrative access.

To initiate a connection to a target machine:

```bash
MikyRedHat@htb[/htb]$ ssh htb-student@[Target_IP]
```

---

## Post-Exploitation & Situational Awareness

Once reverse shell or SSH access is established, the immediate priority is situational awareness.

### 1. Host Identification (`hostname`)
Identifies the target machine within the network topology.

```bash
MikyRedHat@htb[/htb]$ hostname
nixfund
```

### 2. User Context (`whoami` & `id`)
Determines current privileges and execution context. The `id` command is crucial for auditing account permissions and group memberships to identify escalation paths.

```bash
MikyRedHat@htb[/htb]$ whoami
cry0l1t3

MikyRedHat@htb[/htb]$ id
uid=1000(cry0l1t3) gid=1000(cry0l1t3) groups=1000(cry0l1t3),1337(hackthebox),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),116(lpadmin),126(sambashare)
```
*Security Note:* Group memberships often reveal potential attack vectors.
*   `adm`: Allows reading log files (e.g., `/var/log`), potentially leaking sensitive data or credentials.
*   `sudo`: Grants the ability to execute commands as `root`, serving as a direct path to privilege escalation.

### 3. System Architecture & Kernel Enumeration (`uname`)
Retrieves kernel and OS details to cross-reference against known CVEs and kernel exploits.

```bash
# Print all available system information
MikyRedHat@htb[/htb]$ uname -a
Linux box 4.15.0-99-generic #100-Ubuntu SMP Wed Apr 22 20:32:56 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux

# Isolate the kernel release version for exploit hunting
MikyRedHat@htb[/htb]$ uname -r
4.15.0-99-generic
```
*Workflow Application:* With the output of `uname -r`, a Pentester can immediately query exploit databases (e.g., SearchSploit) for terms like `4.15.0-99-generic exploit` to identify potential local privilege escalation (LPE) vulnerabilities.

---

## Continuous Learning Methodology

Navigating unfamiliar systems relies heavily on native documentation. Utilizing `man [command]` or `[command] --help` is mandatory for understanding flag options and uncovering advanced, non-standard execution methods. In a technical environment, discomfort when encountering undocumented scenarios is expected; systematic enumeration and documentation review are the primary mechanisms to overcome these technical hurdles.

# Linux File System Navigation

Navigating the Linux file system via the command-line interface (CLI) is a core competency for any SysAdmin or Cybersecurity professional. Efficient directory traversal and file enumeration are critical during both daily administration and post-exploitation phases. This module covers essential commands for spatial awareness, directory listing, terminal optimization, and path navigation. 

*Note: It is highly recommended to experiment with these commands in a local virtual machine (Homelab). Always ensure you have an active snapshot before executing unfamiliar commands.*

## Spatial Awareness (`pwd`)

To identify your current working directory within the file system hierarchy, use the `pwd` (Print Working Directory) command. This outputs the absolute path of your current location.

```bash
cry0l1t3@htb[~]$ pwd
/home/cry0l1t3
```

## Directory Enumeration (`ls`)

The `ls` command is used to list directory contents. By default, running it without arguments displays visible files and directories in the current location.

```bash
cry0l1t3@htb[~]$ ls
Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos
```

### Detailed Output (`ls -l`)
For a more comprehensive view, including file permissions, ownership, and timestamps, append the `-l` (long format) flag.

```bash
cry0l1t3@htb[~]$ ls -l
total 32
drwxr-xr-x 2 cry0l1t3 htbacademy 4096 Nov 13 17:37 Desktop
drwxr-xr-x 2 cry0l1t3 htbacademy 4096 Nov 13 17:34 Documents
drwxr-xr-x 3 cry0l1t3 htbacademy 4096 Nov 15 03:26 Downloads
...
```
*The `total 32` output indicates the amount of 1024-byte blocks used by the contents (32 blocks * 1024 bytes = 32 KB).*

**Understanding the `-l` Output Columns:**

| Column Content | Description |
| :--- | :--- |
| `drwxr-xr-x` | File type (`d` for directory) and access permissions. |
| `2` | Number of hard links pointing to the file/directory. |
| `cry0l1t3` | User owner of the file/directory. |
| `htbacademy` | Group owner of the file/directory. |
| `4096` | Size of the file or the number of blocks used to store directory info. |
| `Nov 13 17:37` | Last modification date and time. |
| `Desktop` | File or directory name. |

### Hidden Files (`ls -la`)
Standard enumeration omits hidden files (prefixed with a `.`, such as `.bashrc` or `.bash_history`). To display absolutely all contents, combine the all and long flags (`-la`).

```bash
cry0l1t3@htb[~]$ ls -la
total 403188
drwxr-xr-x 2 cry0l1t3 htbacademy 4096 Nov 13 17:37 .bash_history
drwxr-xr-x 2 cry0l1t3 htbacademy 4096 Nov 13 17:37 .bashrc
drwxr-xr-x 2 cry0l1t3 htbacademy 4096 Nov 13 17:37 Desktop
...
```

You can also enumerate target directories remotely by passing the absolute path as an argument, bypassing the need to navigate there first:

```bash
cry0l1t3@htb[~]$ ls -l /var/
total 52
drwxr-xr-x  2 root root     4096 Mai 15 18:54 backups
drwxr-xr-x 18 root root     4096 Nov 15 16:55 cache
...
```

## Path Navigation (`cd`)

The `cd` (Change Directory) command is utilized for file system traversal. You can use absolute paths (starting from the root `/`) or relative paths.

```bash
cry0l1t3@htb[~]$ cd /dev/shm
cry0l1t3@htb[/dev/shm]$
```

**Essential Navigation Shortcuts:**
*   **Previous Directory (`cd -`):** Quickly toggles back to the last directory you were in.
    ```bash
    cry0l1t3@htb[/dev/shm]$ cd -
    cry0l1t3@htb[~]$
    ```
*   **Parent Directory (`cd ..`):** Moves you one level up in the directory hierarchy. The `..` represents the parent directory, while a single `.` represents the current directory.

```bash
    cry0l1t3@htb[/dev/shm]$ cd ..
    cry0l1t3@htb[/dev]$
    
```

## Terminal Optimization & Shortcuts

Agility in the CLI is vital. Use these built-in shortcuts to streamline your workflow:

*   **Tab Completion:** Pressing `[TAB]` auto-completes file paths and commands. If multiple matches exist, pressing `[TAB]` twice will list all possible entries starting with your input.
    ```bash
    cry0l1t3@htb[~]$ cd /dev/s [TAB 2x]
    shm/ snd/
    ```
*   **Clear Terminal:** The `clear` command or the `[Ctrl] + [L]` shortcut wipes the terminal screen, providing a clean workspace. You can chain commands using the `&&` operator (e.g., `cd shm && clear`).
*   **Command History:** Use the Up/Down arrow keys (`↑` or `↓`) to scroll through your recently executed commands. For faster retrieval, `[Ctrl] + [R]` initiates a reverse search through your shell history.

# Linux File System Operations: Working with Files & Directories

## Overview
As SysAdmins and Junior Pentesters, manipulating the file system via the Command Line Interface (CLI) is a fundamental skill. Unlike Windows environments that rely heavily on graphical tools (e.g., File Explorer), Linux file management through the terminal provides unparalleled speed, efficiency, and automation capabilities. 

Interacting directly via shell commands allows us to:
* Bypass the overhead of interactive text editors (`vim`, `nano`) for rapid modifications.
* Apply regular expressions (regex) for granular file selection.
* Leverage stdout/stdin redirection to automate batch tasks across multiple files simultaneously.

---

## Core Operations: Create, Move, and Copy

Before executing these operations, ensure you have established an SSH connection to the target host. 

### File and Directory Creation
The foundational commands for establishing a directory tree are `touch` (for empty file provisioning) and `mkdir` (for directory creation).

**Syntax Definitions:**
```bash
# Create an empty file
touch <filename>

# Create a directory
mkdir <directory_name>
```

**Implementation Example:**
Let's provision a baseline structure by creating an `info.txt` file and a `Storage` directory.
```bash
MikyRedHat@htb[/htb]$ touch info.txt
MikyRedHat@htb[/htb]$ mkdir Storage
```

#### Creating Parent Directories (`mkdir -p`)
When architecting complex directory trees, running `mkdir` sequentially for each nested folder is highly inefficient. The `-p` (parents) flag streamlines this by generating the entire directory path in a single execution.

```bash
MikyRedHat@htb[/htb]$ mkdir -p Storage/local/user/documents
```

We can verify the filesystem structure using the `tree` utility:
```bash
MikyRedHat@htb[/htb]$ tree .
.
├── info.txt
└── Storage
    └── local
        └── user
            └── documents

4 directories, 1 file
```

#### Relative Pathing
Files can be provisioned directly into nested directories using relative paths. The single dot (`.`) references the Current Working Directory (CWD).

```bash
MikyRedHat@htb[/htb]$ touch ./Storage/local/user/userinfo.txt
```

### Moving and Renaming (`mv`)
In Unix-like systems, the `mv` command serves a dual purpose: relocating files across the directory tree and renaming them (which is fundamentally moving a file to the same location with a new string identifier).

**Syntax Definition:**
```bash
mv <source_item> <destination_item>
```

**Implementation Example:**
Rename `info.txt` to `information.txt`, then relocate it alongside a newly created `readme.txt` into the `Storage/` directory.

```bash
# Rename the file
MikyRedHat@htb[/htb]$ mv info.txt information.txt

# Create a secondary file
MikyRedHat@htb[/htb]$ touch readme.txt

# Move both files to the target directory concurrently
MikyRedHat@htb[/htb]$ mv information.txt readme.txt Storage/
```

### Copying Files (`cp`)
To duplicate data without removing the source file, we utilize the `cp` command.

**Implementation Example:**
Duplicate `readme.txt` from the `Storage/` root into the nested `local/` subdirectory.

```bash
MikyRedHat@htb[/htb]$ cp Storage/readme.txt Storage/local/
```

**Post-Operation Verification:**
```bash
MikyRedHat@htb[/htb]$ tree .
.
└── Storage
    ├── information.txt
    ├── local
    │   ├── readme.txt
    │   └── user
    │       ├── documents
    │       └── userinfo.txt
    └── readme.txt

4 directories, 4 files
```

---

## Next Steps: Advanced Manipulation
Beyond foundational file operations, mastering Linux requires fluency in I/O redirection and CLI text editors. Redirection allows for the seamless manipulation of data streams between commands and files, optimizing file modifications. Subsequent modules will cover interactive editing via `vim` and `nano` to solidify your incident handling and system administration workflows.


# Linux File Editing: Nano and Vim

## Introduction to Text Editors
After mastering file and directory creation, the next logical step in command-line proficiency is file editing. Linux offers several text editors, with **Vi** and **Vim** being the industry standards. However, for initial familiarization, we will begin with **Nano**, a straightforward and user-friendly editor.

## The Nano Editor
To create or edit a file using Nano, append the target filename as an argument to the command. For instance, to initialize a new file named `notes.txt`, execute:

```bash
MikyRedHat@htb[/htb]$ nano notes.txt
```

This command drops you directly into the Nano interface (often referred to as a "pager"), allowing immediate text input. Nano's low barrier to entry makes it an excellent tool for quick file modifications, especially during initial reconnaissance or rapid payload tweaking.

### Nano Interface and Shortcuts
Within Nano, the bottom of the terminal displays a cheat sheet of essential commands. The caret symbol (`^`) represents the `[CTRL]` key.

```text
  GNU nano 2.9.3                                    notes.txt                                              
Here we can type everything we want and make our notes.

^G Get Help    ^O Write Out   ^W Where Is    ^K Cut Text    ^J Justify     ^C Cur Pos     M-U Undo
^X Exit        ^R Read File   ^\ Replace     ^U Uncut Text  ^T To Spell    ^_ Go To Line  M-E Redo
```

* **Searching:** Press `[CTRL + W]` ("Where Is") to trigger the search prompt. Typing a string (e.g., "we") and pressing `[ENTER]` moves the cursor to the first match. To jump to the next occurrence, press `[CTRL + W]` followed immediately by `[ENTER]`.
* **Saving Output:** Press `[CTRL + O]` ("Write Out") and confirm the filename with `[ENTER]` to save your buffer to disk.
* **Exiting:** Press `[CTRL + X]` to terminate the editor and return to the shell.

### Verifying File Contents
Once back in the shell, use the `cat` command to output the file's contents to the standard output (stdout):

```bash
MikyRedHat@htb[/htb]$ cat notes.txt
Here we can type everything we want and make our notes.
```

## Security Context: Critical System Files
In Linux environments, improper file permissions frequently provide penetration testers with privilege escalation vectors. A prime target is the `/etc/passwd` file. This file stores core user attributes, including usernames, User IDs (UIDs), Group IDs (GIDs), and home directory paths.

Historically, `/etc/passwd` also contained password hashes. Modern systems have migrated these hashes to the `/etc/shadow` file, which enforces stricter access controls. However, if an administrator misconfigures the permissions on `/etc/passwd` or `/etc/shadow`, it can expose sensitive data or allow unauthorized user creation. Identifying such misconfigurations is a critical phase when assessing a system's security posture.

## The Vim Editor
**Vim** (Vi IMproved) is an open-source, highly efficient text editor favored by system administrators and penetration testers. Unlike Nano, Vim adheres to the Unix philosophy: it focuses strictly on text editing and relies on external utilities (`grep`, `awk`, `sed`) for complex data manipulation. This modular approach makes Vim lightweight, fast, flexible, and incredibly powerful.

### Launching Vim
```bash
MikyRedHat@htb[/htb]$ vim
```

### Vim Operating Modes
Vim is a **modal editor**, meaning the behavior of keystrokes changes depending on the active mode. Mastering these six fundamental modes is key to leveraging Vim's full potential for fast configuration file edits during an engagement:

| Mode | Description |
| :--- | :--- |
| **Normal** | The default state upon launch. Keystrokes are interpreted as editor commands (e.g., navigation, deletion, copying) rather than text input. |
| **Insert** | Activated to type text into the buffer, functioning similarly to standard text editors. |
| **Visual** | Used to highlight contiguous text blocks. The highlighted area can then be manipulated (deleted, copied, replaced) using standard commands. |
| **Command** | Accessed by typing `:` from Normal mode. Allows execution of single-line commands at the bottom of the screen (e.g., saving, quitting, global string substitution). |
| **Replace** | Overwrites existing characters at the cursor's position. If the cursor reaches the end of the line, it appends the new text. |
| **Ex** | Emulates the legacy 'Ex' editor, allowing the execution of batch commands sequentially without reverting to Normal mode after each execution. |

### Exiting Vim
To exit Vim, ensure you are in Normal mode (press `[ESC]`), type `:` to enter Command mode, followed by `q` (quit), and hit `[ENTER]`.
```text
:q
```

### VimTutor
Vim includes a built-in interactive tutorial called `vimtutor`. While Vim's learning curve can seem steep initially, dedicating 20-30 minutes to this tutorial rapidly builds the muscle memory and efficiency required for advanced system administration. Launch it directly from your terminal:

```bash
MikyRedHat@htb[/htb]$ vimtutor
```
# Enumerating Files and Directories in Linux

During post-exploitation or standard system administration troubleshooting, locating configuration files, user-created scripts, and hidden directories is critical. Instead of manually traversing the file system, we leverage built-in Linux utilities to automate and expedite this process.

## 1. The `which` Command

The `which` tool is used to identify the absolute path of executables located within the system's `$PATH` environment variable. It is a highly effective way to determine if specific programming languages or utilities (e.g., `python`, `curl`, `netcat`, `gcc`) are installed and accessible on the target host.

```bash
MikyRedHat@htb[/htb]$ which python
/usr/bin/python
```
> **Note:** If the binary is not installed or not present in the user's `$PATH`, the command returns no output.

## 2. The `find` Command

The `find` command is a powerful enumeration tool that searches for files and directories within a specified directory hierarchy. Unlike `which`, `find` includes extensive filtering capabilities based on file size, modification dates, ownership, and permissions.

**Basic Syntax:**
```bash
find <target_location> <options>
```

**Advanced Usage Example:**
The following command searches the entire root filesystem (`/`) for configuration files, applying multiple filters and executing an action on the results, while cleanly discarding any access-denied errors.

```bash
MikyRedHat@htb[/htb]$ find / -type f -name "*.conf" -user root -size +20k -newermt 2020-03-03 -exec ls -al {} \; 2>/dev/null
```

**Parameter Breakdown:**
*   `-type f`: Specifies the object type to search for (`f` stands for files, `d` for directories).
*   `-name "*.conf"`: Filters results by name, using the `*` wildcard to match any file ending with the `.conf` extension.
*   `-user root`: Restricts the search to files owned by the `root` user.
*   `-size +20k`: Filters the output to display only files larger than 20 KiB.
*   `-newermt 2020-03-03`: Matches files modified more recently than the specified timestamp.
*   `-exec ls -al {} \;`: Executes the `ls -al` command against each matched file. The `{}` acts as a placeholder for the file path, and the escaped semicolon `\;` terminates the `-exec` statement.
*   `2>/dev/null`: Redirects standard error (`STDERR`) to the null device. This suppresses "Permission denied" warnings, keeping the terminal output clean and readable.

## 3. The `locate` Command

When speed is a priority and granular filtering is not required, `locate` is the preferred tool. Instead of querying the live filesystem directly, `locate` searches through a pre-compiled local database, making it significantly faster than `find`.

**Updating the Database:**
To ensure the search results are accurate and include recently created files, the database must be updated first using sudo privileges:

```bash
MikyRedHat@htb[/htb]$ sudo updatedb
```

**Executing a Search:**
```bash
MikyRedHat@htb[/htb]$ locate *.conf
/etc/GeoIP.conf
/etc/NetworkManager/NetworkManager.conf
/etc/UPower/UPower.conf
/etc/adduser.conf
<SNIP>
```

**Key Takeaway (`find` vs. `locate`):**
Use `locate` for rapid, broad queries when you already know parts of the filename. Pivot to `find` when you need granular filtering (e.g., identifying files by size, date, or ownership) or when searching dynamic paths that might not yet be indexed by `updatedb`.

# Linux File Descriptors, Redirections, and Pipes

## 1. Overview: File Descriptors (FD)
In Unix/Linux operating systems, a **File Descriptor (FD)** is a unique, kernel-managed reference used to handle Input/Output (I/O) operations. It serves as an identifier for open files, sockets, or other I/O resources (analogous to a *file handle* in Windows environments). 

*Analogy*: Consider an FD as a coatroom claim ticket. The ticket (FD) maps to your coat (the I/O resource). To retrieve your coat, you present the ticket to the attendant (the OS/kernel). Without it, the system cannot efficiently locate or interact with the active connection.

### Standard Data Streams
By default, Linux environments allocate the first three file descriptors as follows:
* **`0` (STDIN)**: Standard Input (Data stream for input)
* **`1` (STDOUT)**: Standard Output (Data stream for standard output)
* **`2` (STDERR)**: Standard Error (Data stream for error messages and diagnostics)

---

## 2. Stream Redirection Techniques

### 2.1 STDIN and STDOUT Fundamentals (`cat`)
When executing a program like `cat`, the system waits for STDIN (FD 0). Once input is confirmed via `[ENTER]`, the kernel processes the data and returns it to the terminal as STDOUT (FD 1).

### 2.2 Handling STDOUT and STDERR (`find`)
Errors during command execution, such as attempting to read protected files without adequate privileges, are routed to STDERR (FD 2).
```bash
MikyRedHat@htb[/htb]$ find /etc/ -name shadow
```
*Expected Result*: The terminal displays `Permission denied` output via STDERR.

### 2.3 Discarding STDERR (`2>/dev/null`)
During reconnaissance or routine searches, error noise can clutter the terminal. We can suppress this by redirecting STDERR (FD 2) to the null device (`/dev/null`), effectively dropping the error data into a black hole.
```bash
MikyRedHat@htb[/htb]$ find /etc/ -name shadow 2>/dev/null
```

### 2.4 Redirecting STDOUT to a File (`>`)
To capture clean output, we can discard STDERR and redirect STDOUT to a text file. The `>` operator will overwrite the target file if it already exists.
```bash
MikyRedHat@htb[/htb]$ find /etc/ -name shadow 2>/dev/null > results.txt
```

### 2.5 Segregating STDOUT and STDERR (`1>` and `2>`)
For proper auditing and log management, it is often necessary to separate standard output from error logs without losing data. We achieve this by redirecting each FD to its respective file.
```bash
MikyRedHat@htb[/htb]$ find /etc/ -name shadow 2> stderr.txt 1> stdout.txt
```

### 2.6 Redirecting STDIN (`<`)
Just as `>` directs output to a destination, `<` feeds input from a source. We can inject the contents of a file as STDIN directly into a command.
```bash
MikyRedHat@htb[/htb]$ cat < stdout.txt
```

### 2.7 Appending STDOUT (`>>`)
To preserve existing file contents while appending new output, use the double greater-than operator `>>`.
```bash
MikyRedHat@htb[/htb]$ find /etc/ -name passwd >> stdout.txt 2>/dev/null
```

### 2.8 Here-Documents / Stream to File (`<< EOF`)
To input multi-line strings or interactively feed a stream until a specific delimiter (End-Of-File) is met, we use the `<<` operator.
```bash
MikyRedHat@htb[/htb]$ cat << EOF > stream.txt
```

---

## 3. Command Chaining with Pipes (`|`)
Pipes (`|`) are a powerful mechanism used to pass the STDOUT of one command directly as the STDIN of another, enabling modular data processing and complex command-line execution.

### 3.1 Filtering Output (`grep`)
In this example, we search for `.conf` files, discard error messages, and pipe the clean STDOUT into `grep` to filter for the pattern `systemd`.
```bash
MikyRedHat@htb[/htb]$ find /etc/ -name *.conf 2>/dev/null | grep systemd
```

### 3.2 Counting Pipeline Results (`wc -l`)
Pipes can be chained sequentially to refine data further. Here, we pipe the filtered `grep` output into `wc -l` to count the exact number of matching lines.
```bash
MikyRedHat@htb[/htb]$ find /etc/ -name *.conf 2>/dev/null | grep systemd | wc -l
```

---

## Summary
A fundamental understanding of File Descriptors, stream redirections, and pipes is critical for robust system administration and security auditing. Mastering these mechanics allows for precise data flow manipulation, avoiding unnecessary I/O steps, and efficiently filtering critical information from system logs and terminal outputs.

```bash

dpkg -l | grep "ii" | wc -l

```
sirve para ver los paquetes correctamente instalados en el host.
