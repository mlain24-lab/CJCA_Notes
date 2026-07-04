# PowerShell & CMD: Technical Reference for SysAdmin and Pentesting

This reference guide centralizes critical command-line operations for system administration and security assessment, emphasizing "Security by Design" and operational safety.

## 1. Legacy CMD Bridge (Enumeration & Troubleshooting)

Legacy commands are essential during the initial phase of enumeration. They serve as a reliable fallback when modern PowerShell logging mechanisms—such as ScriptBlock Logging or Constrained Language Mode—are active, as these commands are less likely to trigger high-fidelity security alerts in monitored or legacy environments.

### Networking Enumeration
* `ipconfig /all` - Display comprehensive IP configuration.
* `netstat -ano` - List active TCP/UDP connections and associated Process IDs (PIDs).
* `arp -a` - Display the ARP table entries for network resolution.
* `route print` - View the routing table.
* `nbtstat -c` - View the NetBIOS name cache.

### System & Authentication
* `tasklist /v` - List running processes with verbose details.
* `systeminfo` - Query detailed system configuration and patch status.
* `whoami /all` - Retrieve the current security context, including User SID and effective privileges.
* `net localgroup administrators` - Verify members of the local Administrators group.
* `net user` - Query detailed user account information.

---

## 2. PowerShell Core Operations

PowerShell cmdlets represent the industry standard for modern automation, infrastructure management, and the orchestration of complex administrative tasks.

### File System Operations
* `Set-Location -Path C:\Logs` - Change current working directory.
* `Get-Location` - Print the current working path.
* `Get-ChildItem -Path C:\Logs -Recurse` - List files and directories recursively.
* `New-Item -Path C:\Logs\app -ItemType Directory -Force` - Create a new directory.
* `Remove-Item -Path C:\Temp\* -Recurse -Force -Confirm` - **Destructive:** Permanently delete files (requires confirmation).

### Process & Service Management
* `Get-Service | Where-Object Status -ne 'Running'` - Identify all non-running services.
* `Start-Service -Name W3SVC` - Initiate a specific service.
* `Stop-Process -Id 1234 -Force` - Terminate a process by PID.
* `Get-Process | Sort-Object CPU -Descending | Select-Object -First 10` - Monitor resource-heavy processes.

### Network Diagnostics
* `Test-Connection -ComputerName server01 -Count 1` - ICMP Echo Request (Ping).
* `Test-NetConnection -ComputerName server01 -Port 443` - Validate TCP connectivity on a specific port.
* `Resolve-DnsName -Name server01.contoso.com` - Perform DNS lookup.

---

## 3. Data Manipulation & Scripting Logic

### String Operations
* `'hello world'.ToUpper()` - Convert string to uppercase.
* `'hello world' -split ' '` - Split string by delimiter.
* `'a','b','c' -join ';'` - Concatenate array elements.

### Serialization
* `$data | ConvertTo-Json -Depth 5` - Serialize object to JSON format.
* `Import-Csv -Path C:\data.csv | Select-Object Name` - Parse CSV data.

### Error Handling (Robustness)
```powershell
$ErrorActionPreference = 'Stop'
try {
    Get-Content -Path C:\Logs\missing.txt -ErrorAction Stop
} catch {
    Write-Warning "Operation failed: $($_.Exception.Message)"
} finally {
    Write-Host 'Audit operation completed.'
}
```

---

## 4. Advanced Security & Pentesting

Maintaining granular control over the execution environment is a fundamental requirement for privilege escalation, persistent access, and payload staging during security assessments.

* **Execution Policy**: A Windows security configuration that dictates the constraints under which PowerShell scripts and configuration files can be executed. // Una configuración de seguridad de Windows que dicta las restricciones bajo las cuales se pueden ejecutar scripts y archivos de configuración de PowerShell.
    * `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force`

* **ACL (Access Control List)**: A discrete list of permissions associated with an object (e.g., file, directory) that defines which users or system processes are granted specific access rights. // Una lista discreta de permisos asociada a un objeto (p. ej., archivo, directorio) que define qué usuarios o procesos del sistema tienen derechos de acceso específicos.
    * `Get-Acl -Path 'C:\SensitiveData' | Select-Object -ExpandProperty Access`

### Base64 Payload Handling
```powershell
$bytes = [System.Text.Encoding]::UTF8.GetBytes('Payload')
$encoded = [System.Convert]::ToBase64String($bytes)
$decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($encoded))
```

---

## 5. Active Directory (AD) Operations
* `Get-ADUser -Identity 'jsmith' -Properties MemberOf` - Retrieve AD user attributes.
* `Get-ADGroupMember -Identity 'IT-Admins'` - List members of a specific group.
* `Add-ADGroupMember -Identity 'IT-Admins' -Members 'jsmith'` - Add a user to a group.

---

## 6. Production-Ready Guardrails (Safety First)

Operational integrity is non-negotiable. Before executing destructive operations in a production environment, rigorous validation and safety checks must be implemented to prevent accidental data loss or service disruption.

* **-WhatIf**: A built-in parameter that performs a "dry run" of a command, allowing the operator to preview the impact of an action without making permanent changes. // Un parámetro integrado que realiza una "simulación" de un comando, permitiendo al operador obtener una vista previa del impacto de una acción sin realizar cambios permanentes.
    * `Remove-Item -Path 'C:\Logs\*' -Recurse -WhatIf`

### Pipeline Integrity Check
```powershell
$files = Get-ChildItem -Path 'C:\Logs' -Filter *.log
if ($files.Count -gt 0) {
    $files | Remove-Item -Confirm
}
```

---

## 7. Operational One-Liners (Auditing)

* **Audit Local Admin Permissions**:
    `Get-LocalGroupMember -Group 'Administrators' | Select-Object Name, PrincipalSource`

* **Audit Inbound Firewall**:
    `Get-NetFirewallRule -Enabled True -Direction Inbound | Where-Object Action -eq 'Allow' | Select-Object DisplayName, LocalPort`

* **Get System Patch Level**:
    `Get-HotFix | Sort-Object InstalledOn -Descending`
