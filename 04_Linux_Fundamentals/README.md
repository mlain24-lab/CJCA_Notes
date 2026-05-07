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
