# SysAdmin & Pentesting: Core Troubleshooting Cheatsheet
Author: Miguel Ángel Laín Pinto
Scope: Modules 1-10 (Foundation, Network, OS, and Web)

## 1. Network Connectivity & Troubleshooting
When diagnosing network reachability, follow the OSI layers. Verify Layer 2 (ARP) before assuming Layer 3 (Routing) issues.

*   **Layer 2 (ARP Table):** `arp -a` or `ip neigh`
*   **Layer 3 (ICMP):** `ping -c 4 <Target_IP>`
*   **Layer 4 (Port Status):** `nc -zv <Target_IP> <Port>`
*   **Windows Network Audit:** `ipconfig /all`

?? nc -zv
- English: Netcat utility used for scanning. `-z` sets zero-I/O mode (scanning only), and `-v` provides verbose feedback to confirm the connection status.
- Español: Utilidad Netcat para escaneo. `-z` establece el modo sin I/O (solo escaneo), y `-v` ofrece feedback detallado para confirmar el estado de la conexión.

## 2. Windows System Auditing (CLI)
Essential commands for auditing local accounts and connectivity on Windows Server Core environments.

*   **List all local users:** `Get-LocalUser`
*   **Audit specific user details:** `net user <username>`
*   **List Admin members:** `Get-LocalGroupMember -Name "Administrators"`
*   **Purge local DNS cache:** `Clear-DnsClientCache` (PowerShell) or `ipconfig /flushdns` (CMD)

?? Clear-DnsClientCache
- English: A PowerShell cmdlet that purges the local DNS client resolver cache. Essential when a host fails to resolve a domain due to stale records.
- Español: Cmdlet de PowerShell que purga la caché local del resolver DNS. Esencial cuando un host no resuelve un dominio debido a registros obsoletos.

## 3. Web Technologies & API Interaction
Standard tools for testing web application endpoints and inspecting server responses.

*   **Inspect Headers only:** `curl -I http://<Target_IP>/<path>`
*   **POST JSON Payload:** `curl -X POST <URL> -H "Content-Type: application/json" -d '{"key":"value"}'`
*   **Quiet HTTP check:** `curl -i -s -o /dev/null http://<Target_IP>/<path>`

?? -d (data)
- English: A flag used in curl to send specified data in a POST request. JSON payloads must be wrapped in single quotes to maintain object integrity.
- Español: Flag utilizada en curl para enviar datos en una petición POST. Los payloads JSON deben ir entre comillas simples para mantener la integridad del objeto.

## 4. Incident Handling & Linux Administration
Commands for securing environments, managing permissions, and ejecting unauthorized sessions.

*   **File Permissions (Strict):** `chmod 700 <filename>`
*   **Identify Active Sessions:** `who -u`
*   **Force Terminate Session:** `kill -9 <PID>`

?? kill -9
- English: Sends the SIGKILL signal to a process, terminating it immediately at the kernel level without allowing for clean-up operations or graceful exit.
- Español: Envía la señal SIGKILL a un proceso, finalizándolo inmediatamente a nivel de kernel sin permitir operaciones de limpieza ni salida controlada.

?? chmod 700
- English: Sets read/write/execute permissions (4+2+1=7) only for the file owner, completely restricting access for group and others.
- Español: Establece permisos de lectura/escritura/ejecución (4+2+1=7) solo para el propietario, restringiendo completamente el acceso a grupos y otros usuarios.
