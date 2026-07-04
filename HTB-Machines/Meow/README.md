# HTB: Meow - Vulnerability Remediation & System Hardening (Blue Team Perspective)

## Overview
In the Hack The Box 'Meow' machine, the primary vectors of compromise were the use of an obsolete, cleartext protocol (Telnet on port 23) and the total lack of access controls (default `root` credentials). While 'Meow' is an introductory Tier 0 machine, these vulnerabilities are highly prevalent in real-world industrial and corporate environments, particularly in legacy switches, PLCs, or network printers. 

The following documentation outlines the Blue Team (SysAdmin) perspective: how to audit, remediate, and harden a system against this specific attack vector to ensure operational continuity and infrastructure security.

## Phase 1: Discovery & Reconnaissance
Before modifying any production service, it is critical to gain network visibility and identify all endpoints exposing the vulnerable service to avoid operational downtime.

```bash
# Sweep the production subnet to identify hosts with open Telnet ports
nmap -p 23 --open 192.168.10.0/24 -oG telnet_devices.txt
```

## Phase 2: System Hardening & Remediation
Once the vulnerable endpoints are identified, the corporate security policy mandates migrating away from cleartext protocols.

### 1. Disabling the Telnet Service
The service must be completely disabled and purged to prevent it from restarting upon reboot.

**Linux (Debian/Ubuntu):**
```bash
sudo systemctl stop telnetd
sudo systemctl disable telnetd
sudo apt-get purge telnetd
```

**Windows Server (PowerShell):**
```powershell
Disable-WindowsOptionalFeature -Online -FeatureName TelnetClient
```

### 2. Transitioning to SSH (Secure Shell)
SSH (port 22) is the industry standard replacement, encrypting all network traffic. However, default configurations must be hardened to prevent direct privileged access like the one exploited in 'Meow'.

Edit the SSH daemon configuration file (`/etc/ssh/sshd_config`):
```text
# Prohibit direct login for the superuser (root)
PermitRootLogin no

# Disable password authentication, forcing the use of Public/Private Keys (RSA/Ed25519)
PasswordAuthentication no
```
Apply the security policies by restarting the service:
```bash
sudo systemctl restart sshd
```

## Phase 3: Defense in Depth (Legacy Systems)
In scenarios involving legacy industrial machinery that strictly requires Telnet to function and cannot be upgraded, network architecture and perimeter defense must be implemented to isolate the risk.

1. **Network Segmentation (VLANs):** Isolate the vulnerable equipment into a dedicated VLAN specifically for critical industrial devices. This network must be strictly separated from the corporate office environment and guest Wi-Fi.
2. **Access Control Lists (ACLs) / Firewalling:** Implement strict firewall rules ensuring the Telnet port is completely unreachable, except from a designated Management IP or a secure Bastion Host (Jump Server).

**Example: Internal Hardening using UFW**
```bash
# Deny all incoming traffic to Telnet by default
sudo ufw deny 23/tcp

# Allow access EXCLUSIVELY from the SysAdmin's static management IP
sudo ufw allow from 192.168.10.55 to any port 23 proto tcp
```

## Mitigation Outcome
By executing this workflow, a critically vulnerable system—susceptible to automated malware and trivial network sniffing—is successfully transformed into a segmented, encrypted, and strictly access-controlled architecture.
