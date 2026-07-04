# PowerShell & CMD: Technical Reference for SysAdmin and Pentesting

This document consolidates essential commands for System Administration and penetration testing, adhering to "Security by Design" principles and safe execution practices.

## 1. Legacy CMD Bridge (Enumeration & Troubleshooting)
!! Legacy commands are often used during initial enumeration to avoid triggering PowerShell logging/alerting in older or monitored environments. !!

# Networking Enumeration
ipconfig /all                # Detailed IP configuration
netstat -ano                 # Active TCP/UDP connections and PID
arp -a                       # ARP table entries
route print                  # Routing table
nbtstat -c                   # NetBIOS name cache

# System & Authentication
tasklist /v                  # Running processes with verbose details
systeminfo                   # Detailed system configuration
whoami /all                  # Current user context, SID, and privileges
net localgroup administrators # Local admin group members
net user <username>          # User account details

## 2. PowerShell Core Operations
!! PowerShell cmdlets are the standard for modern automation and infrastructure management. !!

# File System Operations
Set-Location -Path C:\Logs             # Change directory (cd)
Get-Location                           # Print current path (pwd)
Get-ChildItem -Path C:\Logs -Recurse   # List files recursively
New-Item -Path C:\Logs\app -ItemType Directory -Force
Remove-Item -Path C:\Temp\* -Recurse -Force -Confirm # Destructive: Use with caution

# Process & Service Management
Get-Service | Where-Object Status -ne 'Running' # Identify stopped services
Start-Service -Name W3SVC
Stop-Process -Id 1234 -Force           # Terminate by PID
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10

# Network Diagnostics
Test-Connection -ComputerName server01 -Count 1 # Ping
Test-NetConnection -ComputerName server01 -Port 443 # TCP port check
Resolve-DnsName -Name server01.contoso.com      # DNS Lookup

## 3. Data Manipulation & Scripting Logic
# String operations
'hello world'.ToUpper()
'hello world' -split ' '
'a','b','c' -join ';'

# Serialization
$data | ConvertTo-Json -Depth 5
Import-Csv -Path C:\data.csv | Select-Object Name

# Error Handling (Robustness)
$ErrorActionPreference = 'Stop'
try {
    Get-Content -Path C:\Logs\missing.txt -ErrorAction Stop
} catch {
    Write-Warning "Operation failed: $($_.Exception.Message)"
} finally {
    Write-Host 'Audit operation completed.'
}

## 4. Advanced Security & Pentesting
!! Mastery of environment manipulation is critical for privilege escalation and payload staging. !!

# ?? Execution Policy: A security feature that controls the conditions under which PowerShell loads configuration files and runs scripts.
# ?? Execution Policy: Una característica de seguridad que controla las condiciones bajo las cuales PowerShell carga archivos de configuración y ejecuta scripts.
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# ?? ACL (Access Control List): A list of permissions attached to an object (file/folder) specifying which users/processes have access.
# ?? ACL (Lista de control de acceso): Una lista de permisos asociada a un objeto (archivo/carpeta) que especifica qué usuarios/procesos tienen acceso.
Get-Acl -Path 'C:\SensitiveData' | Select-Object -ExpandProperty Access

# Base64 Payload Handling
$bytes = [System.Text.Encoding]::UTF8.GetBytes('Payload')
$encoded = [System.Convert]::ToBase64String($bytes)
$decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($encoded))

## 5. Active Directory (AD) Operations
Get-ADUser -Identity 'jsmith' -Properties MemberOf
Get-ADGroupMember -Identity 'IT-Admins'
Add-ADGroupMember -Identity 'IT-Admins' -Members 'jsmith'

## 6. Production-Ready Guardrails (Safety First)
!! Every destructive command must include safety checks to prevent data loss. !!

# ?? -WhatIf: A parameter that simulates the command and shows what would happen without executing changes.
# ?? -WhatIf: Un parámetro que simula el comando y muestra qué sucedería sin ejecutar los cambios.
Remove-Item -Path 'C:\Logs\*' -Recurse -WhatIf

# Pipeline Integrity Check
$files = Get-ChildItem -Path 'C:\Logs' -Filter *.log
if ($files.Count -gt 0) {
    $files | Remove-Item -Confirm
}

## 7. Operational One-Liners (Auditing)
# Audit Local Admin Permissions
Get-LocalGroupMember -Group 'Administrators' | Select-Object Name, PrincipalSource

# Audit Inbound Firewall
Get-NetFirewallRule -Enabled True -Direction Inbound | Where-Object Action -eq 'Allow' | Select-Object DisplayName, LocalPort

# Get System Patch Level
Get-HotFix | Sort-Object InstalledOn -Descending
