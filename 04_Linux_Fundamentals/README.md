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

![Standard Bash Prompt Layout](img/bash_prompt_overview.png)

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

To modify the prompt, special backslash-escaped characters are used within the `.bashrc` file:

| Character | Description |
| :--- | :--- |
| `\u` | Current username |
| `\h` | Short hostname (up to the first '.') |
| `\H` | Full hostname |
| `\w` | Full path of the current working directory |
| `\W` | Basename of the current working directory |
| `\d` | Date (e.g., "Wed Sep 04") |
| `\t` | Current time (24-hour HH:MM:SS) |
| `\n` | Newline character |

### Implementation Example
To set a descriptive prompt that includes the user, host, and full path, use:
`export PS1="\u@\h:\w\$ "`

## 3. Advanced Customization & Tools

For complex environments, external tools can automate the generation of high-visibility prompts:

*   **Bash Prompt Generator:** Web-based tools to visually construct PS1 strings.
*   **Powerline:** A status line plugin that provides highly detailed, color-coded information for Vim, Bash, and other applications.

Leveraging these configurations ensures that all actions captured via `script` or `.bash_history` are contextualized with timing and location data, which is vital for professional reporting and incident post-mortems.
