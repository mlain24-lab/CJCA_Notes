# Quick Reference Cheatsheet: Network & System Troubleshooting

This cheatsheet provides immediate, actionable command-line solutions for common system administration and initial incident response scenarios.

## 1. Network Connectivity & Routing (Linux)
When diagnosing network reachability issues, always follow the OSI model from bottom to top (Layer 1 to Layer 7).

*   **Layer 2 (Data Link) - Check ARP Table:**
    ```bash
    arp -a
    # Or alternatively:
    ip neigh
    ```
*   **Layer 3 (Network) - Check ICMP Connectivity:**
    ```bash
    ping -c 4 <Target_IP>
    ```
*   **Layer 4/7 (Transport/Application) - Check Port Status:**
    ```bash
    # Test if a specific TCP port is open and listening
    nc -zv <Target_IP> <Port>
    ```

**?? nc -zv**:
*   *English:* Netcat command used for port scanning. `-z` sets zero-I/O mode (used for scanning), and `-v` enables verbose output to confirm the connection status.
*   *Español:* Comando Netcat utilizado para escaneo de puertos. `-z` establece el modo sin entrada/salida (solo escaneo), y `-v` activa el modo "verbose" para confirmar si la conexión ha sido exitosa.

## 2. Windows Local User Auditing (PowerShell & CMD)
Rapid commands to audit local users and group memberships in a Windows Server Core environment.

*   **List all local users (PowerShell):**
    ```powershell
    Get-LocalUser
    ```
*   **Check specific user details and group memberships (CMD):**
    ```cmd
    net user <username>
    ```
*   **List members of the local Administrators group (PowerShell):**
    ```powershell
    Get-LocalGroupMember -Name "Administrators"
    ```
    *Note: Use `;` as a command separator in older PowerShell versions instead of `&&`.*

## 3. Web Requests & Header Inspection (Bash)
Methods to retrieve HTTP response headers without downloading the full page body, ideal for scripting and automation.

*   **Standard Method (Sends HTTP HEAD request):**
    ```bash
    curl -I http://<Target_IP>/admin.php
    ```
*   **Alternative Method (Forces HTTP GET request, discards body):**
    ```bash
    curl -i -s -o /dev/null http://<Target_IP>/admin.php
    ```

**?? /dev/null**:
*   *English:* A special file in Unix-like systems that discards all data written to it. Used here to silently drop the HTML body of the web response.
*   *Español:* Un archivo especial en sistemas Unix que descarta todos los datos que se escriben en él. Se usa aquí para eliminar silenciosamente el cuerpo HTML de la respuesta web (la papelera del sistema).

## 4. Active Threat Containment (Linux)
Immediate steps to identify and terminate an unauthorized user session.

*   **Identify active users, IPs, and their shell PIDs:**
    ```bash
    who -u
    ```
*   **Terminate the malicious session forcefully:**
    ```bash
    kill -9 <PID>
    ```

**?? kill -9**:
*   *English:* Sends the SIGKILL signal to a specific Process ID (PID), terminating it instantly at the kernel level without graceful shutdown.
*   *Español:* Envía la señal SIGKILL a un ID de proceso (PID) específico, finalizándolo instantáneamente a nivel de kernel sin permitir un cierre ordenado.
