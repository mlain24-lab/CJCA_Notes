# The Ultimate Linux Commands Cheat Sheet (2026)

This master reference document outlines essential Linux command-line operations for System Administration and Penetration Testing. It incorporates production-grade methodologies and quick-reference syntax for environments ranging from local Homelabs to enterprise infrastructure.

## 1. Core System & File Operations
* `ls` - List directory contents.
* `ls -al` - Detailed list including hidden files, sizes, and permissions.
* `cd [dir]` - Navigate to directory (e.g., `cd ..` for parent, `cd ~` for home).
* `cat > [file]` - Create and write standard input to a file.
* `mv [src] [dst]` - Move or rename a file/directory.
* `rm [file]` - Remove a file.
* `rm -rf [dir]` - Recursive force-delete of a directory. (Use with extreme caution).
* `history` - List command execution history.
* `clear` - Clear terminal output.
* `mkdir [dir]` - Create a directory.
* `man [cmd]` - Open the manual page for a command.
* `sudo` - SuperUser Do. Allows execution of commands with root/administrative privileges. // *sudo: Ejecuta comandos con privilegios de root/administrador.*

## 2. System Information
> Systems Specialist Insight: Use `systemd-detect-virt` to detect if the host is a VM or container instead of parsing dmesg.

* `uname -a` - Print full system info (kernel version, architecture).
* `lsb_release -a` - Display Distribution ID, release, and codename.
* `uptime` - Show system activity duration and load average.
* `hostname -I` - Display current IP addresses assigned to the host.
* `whoami` - Print the current effective user context.

## 3. File Permissions & Security
> Systems Specialist Insight: Avoid `chmod -R 777`. Use `stat -c "%a" [file]` to inspect octal permissions accurately during security audits.

* `ls -l` - View detailed file permissions and ownership.
* `chown [u]:[g] [file]` - Change owner and group of a file.
* `chmod 755 [file]` - Set permissions (Owner: rwx, Group/Others: r-x).
* `chgrp [group] [file]` - Change group ownership.
* `find / -perm -4000 2>/dev/null` - Pentesting: Search for files with the SUID bit set (privilege escalation).

## 4. Networking
> Systems Specialist Insight: Use `ip link show` to identify dynamic interface identifiers (e.g., ens33) before configuration.

* `ssh [user]@[ip]` - Establish a secure remote connection.
* `ping [host]` - Verify connectivity via ICMP.
* `ip addr` - View network interface IP assignments.
* `dig [domain]` - Perform DNS lookups.
* `wget [url]` / `curl [url]` - Download files or interact with web services.
* `nc -lvnp [port]` - Pentesting: Netcat listener for shells or debugging.
* `ethtool [iface]` - Manage network driver and hardware settings.
* `ss -tulnp` - Replaces netstat. Queries the kernel netlink subsystem for faster socket stats. // *ss -tulnp: Reemplaza a netstat. Consulta el subsistema netlink del kernel para obtener estadísticas de sockets más rápidas.*

## 5. Archives & Compression
* `tar -cvf [file.tar] [dir]` - Create an uncompressed tar archive.
* `tar -xvf [file.tar]` - Extract a tar archive.
* `tar -czvf [archive.tgz] [dir]` - Create a Gzip-compressed archive.
* `gzip [file]` / `gunzip [file.gz]` - Compress or decompress .gz files.
* `zip [archive.zip] [file]` / `unzip [archive.zip]` - Compress or decompress .zip files.

## 6. Package Management
* `apt install [pkg]` - Install package (Debian/Ubuntu/Kali).
* `dnf install [pkg]` - Install package (RHEL/Fedora).
* `apt search [key]` / `yum search [key]` - Search repository for packages.
* `dpkg -i [file.deb]` / `rpm -i [file.rpm]` - Install a local package file.

## 7. Search, Processing & Pipeline
* `grep [pattern] [file]` - Search text pattern within a file.
* `grep -r [pattern] [dir]` - Recursive search in directory.
* `find [path] -name [pattern]` - Find files matching a pattern.
* `locate [name]` - Fast file lookup based on a pre-built database.
* `tail -f [file]` - Follow file log output in real-time.
* `awk '{print $1}' [file]` - Extract specific columns from text output.
* `sed 's/old/new/g' [file]` - Stream editor for finding and replacing text.
* `cut -d ':' -f 1 /etc/passwd` - Extract specific fields based on a delimiter.

## 8. Disk Utilities & Storage
> Systems Specialist Insight: To identify disk hogs: `df -h` followed by `du -ah [path] | sort -hr | head -n 10`.

* `lsblk` - List all block devices.
* `fdisk -l` - Partition table details.
* `mount [dev] [dir]` / `umount [dir]` - Manage filesystem mount points.
* `df -i` - Inode report. Reveals available filesystem structural nodes. // *df -i: Informe de inodos. Revela los nodos estructurales del sistema de archivos disponibles.*

## 9. Process Management
* `top` / `htop` - Real-time process monitoring.
* `ps aux` - Snapshot of all active processes.
* `kill [PID]` - Terminate process by PID.
* `kill -9 [PID]` - Forcefully terminate a process (SIGKILL).
* `killall [name]` - Terminate all processes by name.
* `nice` / `renice` - Set process execution priority.
* `free -h` - RAM/Swap usage stats.

## 10. Systemd & Service Management
Standard for modern Linux distributions. Use `systemctl` for service orchestration.

* `systemctl status [service]` - Check service health and status.
* `systemctl start/stop [service]` - Immediate state change.
* `systemctl restart [service]` - Restart service (e.g., after config change).
* `systemctl enable [service]` - Enable service to start on boot (persistence).
* `systemctl disable [service]` - Disable automatic start.
* `systemctl daemon-reload` - Reload systemd configuration after editing unit files.

## 11. Log Management (Incident Handling)
* `journalctl -u [service]` - View logs for a specific service.
* `journalctl -f` - Follow logs in real-time.
* `journalctl --since "1 hour ago"` - Filter logs by time window.
* `journalctl -p err` - Show only error-level logs.

## 12. User & Identity Management
* `id [user]` - Show UID, GID, and groups for a user.
* `groups [user]` - List all groups a user belongs to.
* `useradd -m [user]` - Create a new user with a home directory.
* `usermod -aG [group] [user]` - Add user to a specific group.
* `passwd [user]` - Update user password.

## 13. Advanced Redirection & I/O
* `>` - Redirect output to file (overwrites).
* `>>` - Redirect output to file (appends).
* `2>` - Redirect error output (e.g., `command 2> /dev/null` hides errors).
* `&>` - Redirect both standard output and error to file.
* `|` - Pipeline: pass output of command A as input to command B.
* `<` - Feed file content into a command.

## 14. VIM Editor
* `Insert` - Press `i` to start typing.
* `Normal` - Press `ESC` to exit insert mode.
* `Commands` - `:wq` (Save/Quit), `:q!` (Quit no save), `:set number` (Show lines).
* `Edits` - `dd` (Delete line), `yy` (Copy line), `p` (Paste).

## 15. Scripting & Environment
* `#!/bin/bash` - Shebang: Specifies the Bash interpreter for script execution. // *Shebang: Especifica el intérprete para la ejecución del script.*
* `export [VAR]` - Set environment variable.
* `alias [n]=[cmd]` - Create command shortcut.
* `exit 0` - Terminate with success code.

## 16. Keyboard Shortcuts
* `Ctrl + C` - Interrupt process.
* `Ctrl + Z` - Suspend process.
* `Ctrl + R` - Search history.
* `!!` - Execute last command.
* `Ctrl + W` - Cut word.
* `Ctrl + L` - Clear terminal screen.

## Appendix: Interactive VM Verification (Ubuntu 26.04)
```text
# Disk Usage
$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda2        30G   28G  1.2G  97% /

# Memory Status
$ free -h
               total        used        free      shared  buff/cache   available
Mem:           3.3Gi       1.2Gi       748Mi        19Mi       1.6Gi       2.1Gi
Swap:          3.3Gi          0B       3.3Gi

# Network Interfaces
$ ip -brief address show
lo               UNKNOWN        127.0.0.1/8 ::1/128
ens33            UP             192.168.144.134/24 fe80::20c:29ff:fe1c:f133/64
```
