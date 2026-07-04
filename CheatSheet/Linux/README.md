# The Ultimate Linux Commands Cheat Sheet (2026)

## 1. Core System & File Operations
| Command | Description |
| :--- | :--- |
| `ls` | List directory contents. |
| `ls -al` | Detailed list including hidden files, sizes, and permissions. |
| `cd [dir]` | Navigate to directory (e.g., `cd ..` for parent, `cd ~` for home). |
| `cat > [file]` | Create and write to a file. |
| `mv [src] [dst]` | Move or rename file/directory. |
| `rm [file]` | Remove file. |
| `rm -rf [dir]` | Recursive force-delete of directory. |
| `sudo` ?? | "SuperUser Do": Allows execution of commands with root/administrative privileges. |
| `history` | List command execution history. |
| `clear` | Clear terminal output. |
| `mkdir [dir]` | Create directory. |
| `man [cmd]` | Open manual page for a command. |

## 2. System Information
*Systems Specialist Insight:* Use `systemd-detect-virt` to detect if the host is a VM or container (e.g., Oracle, VMware, Docker) instead of parsing `dmesg`.

| Command | Description |
| :--- | :--- |
| `uname -a` | Full system info (kernel/architecture). |
| `lsb_release -a` | Distribution ID, release, and codename. |
| `uptime` | System activity duration and load average. |
| `hostname -I` | Display current IP addresses. |
| `whoami` | Current effective user. |

## 3. File Permissions
*Systems Specialist Insight:* Avoid `chmod -R 777`. Use `stat -c "%a" [file]` to inspect octal permissions accurately during security audits.

| Command | Description |
| :--- | :--- |
| `ls -l` | View file permissions. |
| `chown [u]:[g] [f]` | Change owner/group. |
| `chmod 755 [file]` | Owner: rwx, Group/Others: r-x. |
| `chgrp` | Change group ownership. |

## 4. Networking
*Systems Specialist Insight:* Use `ip link show` to identify dynamic interface identifiers (e.g., `ens33`) before configuration.

| Command | Description |
| :--- | :--- |
| `ssh [user]@[ip]` | Establish remote connection. |
| `ping [host]` | Verify connectivity. |
| `ip addr` | View interface IP assignments. |
| `ss -tulnp` ?? | Replaces `netstat`. Queries the kernel's netlink subsystem for faster socket stats. |
| `dig [domain]` | DNS lookup. |
| `wget [url]` | Download file from network. |
| `ethtool [iface]` | Manage network driver/hardware settings. |

## 5. Archives & Compression
| Command | Description |
| :--- | :--- |
| `tar -cvf [file.tar] [dir]` | Create tar archive. |
| `tar -xvf [file.tar]` | Extract tar archive. |
| `tar -czvf [archive.tgz]` | Gzip-compressed archive. |
| `gzip / gunzip` | Compress/Decompress .gz files. |
| `zip / unzip` | Compress/Decompress .zip files. |

## 6. Package Management
| Command | Description |
| :--- | :--- |
| `apt install [pkg]` | Install package (Debian/Ubuntu). |
| `dnf install [pkg]` | Install package (RHEL/Fedora). |
| `yum search [key]` | Search packages. |
| `rpm -i [file.rpm]` | Install local RPM package. |

## 7. Search & Processing
| Command | Description |
| :--- | :--- |
| `grep [pat] [file]` | Search text pattern. |
| `grep -r [pat] [dir]` | Recursive search in directory. |
| `find [path] -name [p]` | Find files matching pattern. |
| `locate [name]` | File lookup based on database (fast). |
| `tail -f [file]` | Follow file log output in real-time. |

## 8. Disk Utilities & Storage
*Systems Specialist Insight:* To identify disk hogs: `df -h` (space overview) followed by `du -ah [path] | sort -hr | head -n 10`.

| Command | Description |
| :--- | :--- |
| `lsblk` | List block devices. |
| `fdisk -l` | Partition table details. |
| `df -i` ?? | Inode report. Reveals available filesystem structural nodes. |
| `mount / unmount` | Manage filesystem mount points. |

## 9. Process Management
| Command | Description |
| :--- | :--- |
| `top` / `htop` | Real-time process monitoring. |
| `ps aux` | Snapshot of all active processes. |
| `kill [PID]` | Terminate process by PID. |
| `killall [name]` | Terminate all processes by name. |
| `nice` / `renice` | Set process execution priority. |
| `free -h` | RAM/Swap usage stats. |

## 10. VIM Editor (Standard Terminal Editor)
| Mode | Action |
| :--- | :--- |
| **Insert** | Press `i` to start typing. |
| **Normal** | Press `ESC` to exit insert mode. |
| **Commands** | `:wq` (Save/Quit), `:q!` (Quit no save), `:set number` (Show lines). |
| **Edits** | `dd` (Delete line), `yy` (Copy line), `p` (Paste). |

## 11. Scripting & Environment
| Command | Description |
| :--- | :--- |
| `#!/bin/bash` ?? | Shebang: Specifies the Bash interpreter for script execution. |
| `export [VAR]` | Set environment variable. |
| `alias [n]=[cmd]` | Create command shortcut. |
| `exit 0` | Terminate with success code. |

## 12. Keyboard Shortcuts
| Shortcut | Action |
| :--- | :--- |
| `Ctrl + C` | Interrupt process. |
| `Ctrl + Z` | Suspend process. |
| `Ctrl + R` | Search history. |
| `!!` | Execute last command. |
| `Ctrl + W` | Cut word. |

---

## Interactive VM Verification (Ubuntu 26.04)

**Disk Usage:**
`df -h /`
`Filesystem      Size  Used Avail Use% Mounted on`
`/dev/sda2        30G   28G  1.2G  97% /`

**Memory Status:**
`free -h`
`              total        used        free      shared buff/cache   available`
`Mem:          3.3Gi       1.2Gi       748Mi        19Mi      1.6Gi       2.1Gi`
`Swap:         3.3Gi          0B       3.3Gi`

**Network Interfaces:**
`ip -brief address show`
`lo               UNKNOWN        127.0.0.1/8 ::1/128`
`ens33            UP             192.168.144.134/24 fe80::20c:29ff:fe1c:f133/64`
