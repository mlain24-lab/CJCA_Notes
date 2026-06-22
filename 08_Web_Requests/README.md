# 08_Web_Requests
# HTTP & Web Requests Fundamentals

## 1. The HTTP Protocol
Most modern web and mobile applications interact with the internet via web requests utilizing the **HyperText Transfer Protocol (HTTP)**. HTTP is an application-layer protocol designed to access and exchange resources across the World Wide Web. *Hypertext* refers to text containing logical links (hyperlinks) to other resources that a browser or client can interpret.

At its core, HTTP communication operates on a **Client-Server architecture**:
* **Client:** Initiates the interaction by sending an HTTP request for a specific resource.
* **Server:** Processes the request and returns the corresponding resource or status code.

By default, HTTP traffic runs over **TCP port 80** (and **port 443** for HTTPS), although web servers can be configured to listen on any non-standard port. We typically access these resources by entering a **Fully Qualified Domain Name (FQDN)** into our browser.

---

## 2. URL Anatomy (Uniform Resource Locator)
Resources over HTTP are targeted using a URL. A URL provides a highly specific string instructing the client exactly how and where to fetch the resource.

**Example Structure:** `http://admin:password@inlanefreight.com:80/dashboard.php?login=true#status`

| Component | Example | Technical Description |
| :--- | :--- | :--- |
| **Scheme** | `http://` or `https://` | Identifies the protocol used by the client. Ends with `://`. |
| **User Info** | `admin:password@` | *(Optional)* Credentials used to authenticate to the host, formatted as `user:password` and separated from the host by an `@` symbol. |
| **Host** | `inlanefreight.com` | The destination resource location. Can be an FQDN/hostname or a direct IPv4/IPv6 address. |
| **Port** | `:80` | *(Optional)* Separated from the host by a colon (`:`). Defaults to `80` for HTTP and `443` for HTTPS if omitted. |
| **Path** | `/dashboard.php` | Points to the specific file or directory being accessed. If omitted, the server generally serves the default root index (e.g., `index.html`). |
| **Query String** | `?login=true` | Starts with a `?` and passes parameters/values to the server. Multiple parameters are concatenated using `&`. |
| **Fragment** | `#status` | Processed client-side (by the browser) to navigate to specific internal sections of the fetched resource (e.g., scrolling to a specific header). |

> **Note:** Only the **Scheme** and **Host** are strictly mandatory to execute a valid web request.

---

## 3. The HTTP Request Flow
When a user attempts to access a domain (e.g., `inlanefreight.com`), the following sequence occurs:

1.  **Local Resolution Check:** The OS first checks the local `/etc/hosts` file for manual DNS overrides.
2.  **DNS Query:** If no local record is found, the browser queries the configured Domain Name System (DNS) server to resolve the FQDN into an IP address (e.g., `152.153.81.14`). A server cannot be reached at the network layer without an IP.
3.  **HTTP GET Request:** The browser establishes a TCP connection and sends an HTTP `GET` request to the target IP on the default port, asking for the root path (`/`).
4.  **Server Processing & Response:** The web server receives the request, retrieves the configured index file (e.g., `index.html`), and sends it back alongside an HTTP Status Code (e.g., `HTTP/1.1 200 OK`) indicating success.
5.  **Client Rendering:** The browser interprets the HTML/CSS/JS and renders the page for the user.

---

## 4. Interacting with HTTP: Web Browsers vs. cURL
While web browsers (Chrome, Firefox) are designed to render code for end-users, penetration testers require tools that display the raw communication context (headers, status codes, raw body). 

**cURL (Client URL)** is a highly versatile command-line utility and library that supports HTTP(S) and many other protocols. It is an essential tool in a pentester's arsenal for web enumeration, API testing, and script automation.

### Practical cURL Usage
Sending a basic `GET` request to the first website ever created:
```bash
MikyRedHat@htb[/htb]$ curl http://info.cern.ch/

<html><head></head><body><header>
<title>http://info.cern.ch</title>
</header>
...SNIP...
```
Unlike a browser, `cURL` outputs the raw HTML source code directly to `stdout`.

### Downloading Files with cURL
To download a resource, we use the output flags:
* `-O` (uppercase): Saves the file locally using the remote server's file name.
* `-o <filename>` (lowercase): Saves the file locally using a custom name specified by the user.

```bash
MikyRedHat@htb[/htb]$ curl -O http://info.cern.ch/index.html

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   646  100   646    0     0   9773      0 --:--:-- --:--:-- --:--:--  9787

MikyRedHat@htb[/htb]$ ls
index.html
```

### Silencing the Output
When writing Bash scripts, we often want to suppress the download progress meter. This is achieved using the `-s` (silent) flag:
```bash
MikyRedHat@htb[/htb]$ curl -s -O http://info.cern.ch/index.html
```

### Common cURL Flags Summary
Use `curl -h` or `man curl` to access the manual. Here are the most relevant flags for web pentesting:

| Flag | Long Name | Function |
| :--- | :--- | :--- |
| `-d` | `--data <data>` | Sends HTTP POST data. |
| `-i` | `--include` | Includes the HTTP response headers in the output. |
| `-o` | `--output <file>` | Writes output to a specific local file instead of `stdout`. |
| `-O` | `--remote-name` | Writes output to a local file named exactly as the remote file. |
| `-s` | `--silent` | Mutes the progress meter and error messages. |
| `-u` | `--user <user:pass>` | Provides credentials for Server Authentication. |
| `-A` | `--user-agent <name>` | Spoofs or modifies the User-Agent string sent to the server. |
| `-v` | `--verbose` | Makes the operation talkative (useful for debugging connections and headers). |

# Hypertext Transfer Protocol Secure (HTTPS)

## 1. Introduction: The HTTP Clear-Text Vulnerability
While HTTP facilitates basic web communication, its fundamental flaw is that it transmits data in clear-text. This exposes communications to **Man-in-the-Middle (MiTM)** attacks, where an adversary positioned between the source and destination can intercept and read the payload.

To mitigate this vulnerability, **HTTPS (HTTP Secure)** was introduced. HTTPS encapsulates HTTP traffic within an encrypted tunnel (TLS/SSL). Even if traffic is intercepted, the attacker cannot decrypt the payload. Consequently, HTTPS is the modern standard, and clear-text HTTP is actively being deprecated by modern web browsers.

## 2. Traffic Analysis: HTTP vs. HTTPS

### The HTTP Exposure
When analyzing HTTP traffic via packet sniffers (e.g., Wireshark), sensitive data such as POST request payloads (e.g., `username=admin` and `password=password` sent to `/login.php`) are completely visible. This allows attackers on the same network (like a public Wi-Fi hotspot) to harvest credentials effortlessly.

### The HTTPS Protection
In contrast, capturing HTTPS traffic reveals only encrypted application data (e.g., a TLSv1.2 stream communicating over port 443). The payload is transmitted as a single, unintelligible encrypted stream, safeguarding credentials and session tokens.

> **Security Note (DNS Leaks):** While HTTPS encrypts the payload, the initial DNS resolution might still occur in clear-text, revealing the target domain to network observers. To ensure full confidentiality, implement **Encrypted DNS** (e.g., DNS over HTTPS via `8.8.8.8` or `1.1.1.1`) or route traffic through a secure VPN.

## 3. The HTTPS Handshake Flow
When a client attempts to connect to an HTTPS-enforced server using an unencrypted protocol, the following flow occurs:

1. **Initial HTTP Request:** The client sends a clear-text request to port 80.
2. **301 Redirect:** The server enforces SSL/TLS by replying with a `301 Moved Permanently` status code, redirecting the client to port 443 (HTTPS).
3. **Client Hello:** The browser initiates the TLS handshake by sending supported cipher suites and SSL/TLS versions.
4. **Server Hello & Certificate Exchange:** The server responds with its chosen cipher suite and its SSL certificate (containing its public key).
5. **Key Verification:** The client verifies the certificate against its trusted Root Certificate Authorities (CAs).
6. **Encrypted Handshake:** Session keys are securely exchanged, confirming that symmetric encryption is functioning correctly.
7. **Secure Transmission:** Standard HTTP communication proceeds within the encrypted tunnel.

> **Threat Intelligence (Downgrade Attacks):** Attackers may deploy MITM proxies to strip the SSL/TLS encryption, forcing the client to fall back to clear-text HTTP (HTTP Downgrade Attack). Modern infrastructure mitigates this via mechanisms like HSTS (HTTP Strict Transport Security).

## 4. Handling HTTPS with cURL
By default, `curl` handles the TLS handshake automatically. However, as a security measure, it validates the server's SSL certificate against local CA stores. If the target server uses a self-signed, invalid, or expired certificate (common in HTB practice labs or local dev environments), `curl` will abort the connection to prevent potential MITM attacks.

**Error Example (Certificate Validation Failure):**
```bash
MikyRedHat@htb[/htb]$ curl https://inlanefreight.com

curl: (60) SSL certificate problem: Invalid certificate chain
More details here: https://curl.haxx.se/docs/sslcerts.html
...SNIP...
```

**Bypassing Certificate Validation:**
To bypass SSL verification during testing or local enumeration, append the `-k` (or `--insecure`) flag. This forces `curl` to proceed despite certificate errors.

```bash
MikyRedHat@htb[/htb]$ curl -k https://www.inlanefreight.com

<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
...SNIP...
```
# HTTP Communications: Requests and Responses

HTTP communications are fundamentally based on a client-server architecture, consisting primarily of HTTP requests and HTTP responses. Understanding this flow is critical for web penetration testing and traffic analysis.

## 1. HTTP Request Structure

An HTTP request is initiated by the client (e.g., cURL, web browser) and processed by the server (e.g., Nginx, Apache). It contains all the necessary details required from the server, including the target resource, headers, and optional payload data.

**Example of a Raw HTTP GET Request:**
```http
GET /users/login.html HTTP/1.1
Host: inlanefreight.com
User-Agent: Mozilla/5.0
Cookie: PHPSESSID=c4ggt4jull9obt7aupa55o8vbf
```

The first line of an HTTP request always contains three space-separated fields:

| Field | Example | Description |
| :--- | :--- | :--- |
| **Method** | `GET` | The HTTP verb specifying the type of action to perform (e.g., GET, POST, PUT). |
| **Path** | `/users/login.html` | The exact path to the requested resource. This can be suffixed with a query string (e.g., `?username=admin`). |
| **Version** | `HTTP/1.1` | The HTTP protocol version in use. |

Subsequent lines contain **HTTP Headers** (key-value pairs) such as `Host`, `User-Agent`, and `Cookie`, which define specific request attributes. Headers are terminated by a blank line (CRLF), which is mandatory for the server to validate the request. If applicable, the request body (payload) follows this blank line.

> **Technical Note:** HTTP/1.x transmits requests in clear-text, utilizing newline characters to separate fields. Conversely, HTTP/2.x transmits data as binary frames within a dictionary structure.

---

## 2. HTTP Response Structure

Upon processing the request, the server returns an HTTP response indicating the outcome and potentially delivering the requested resource.

**Example of a Raw HTTP Response:**
```http
HTTP/1.1 200 OK
Date: Tue, 21 Jul 2020 05:20:15 GMT
Server: Apache/2.4.41
Set-Cookie: PHPSESSID=m4u64rqlpfthrvvb12ai9voqgf
Content-Type: text/html; charset=UTF-8
```

The initial line of the response contains two main components separated by a space:
1. **HTTP Version:** e.g., `HTTP/1.1`
2. **Status Code & Reason Phrase:** e.g., `200 OK`. This determines the request's status (success, redirection, client error, or server error).

Following the status line, the server appends its own **Response Headers**. A blank line separates the headers from the **Response Body**, which typically contains HTML, JSON, scripts, or binary files.

---

## 3. Web Assessment Tools

### cURL for CLI Interrogation
By default, cURL only outputs the response body. During web application penetration testing or exploit development, analyzing raw headers is critical. Appending the `-v` (verbose) flag exposes the complete HTTP transaction.

**Command:**
```bash
curl http://inlanefreight.com -v
```

**Verbose Output Analysis:**
```http
> GET / HTTP/1.1
> Host: inlanefreight.com
> User-Agent: curl/7.65.3
> Accept: */*
> Connection: close

< HTTP/1.1 401 Unauthorized
< Date: Tue, 21 Jul 2020 05:20:15 GMT
< Server: Apache/X.Y.ZZ (Ubuntu)
< WWW-Authenticate: Basic realm="Restricted Content"
< Content-Length: 464
< Content-Type: text/html; charset=iso-8859-1
```
*Note: Lines starting with `>` denote the outgoing client request, while `<` denotes the incoming server response.*

> **Pro-Tip:** Utilizing the `-vvv` flag provides maximum verbosity, revealing deeper connection details, which is highly useful for advanced network troubleshooting and debugging TLS/SSL handshakes.

### Browser DevTools (Network Tab)
Modern browsers include native Developer Tools (accessed via `F12` or `CTRL+SHIFT+I`), which are essential assets during dynamic web assessments.

* **Network Tab:** Intercepts and logs all web requests generated by the application in real-time.
* **Request Inspection:** Allows for a granular review of request methods, status codes, domains, and paths. The interface includes filtering capabilities to isolate specific URLs or resource types.
* **Raw Traffic Analysis:** By selecting a specific request, you can inspect both the rendered and raw source code of the HTTP headers and the response body, facilitating the discovery of hidden data or misconfigurations.

# HTTP Headers

HTTP headers are fundamental components of web communications, responsible for passing contextual information between the client and the server. While some headers are exclusive to either requests or responses, others are common to both. 

A header consists of a case-insensitive name followed by a colon (`:`) and its corresponding value(s). They are logically divided into the following categories:

- General Headers
- Entity Headers
- Request Headers
- Response Headers
- Security Headers

---

## 1. General Headers
General headers are utilized in both HTTP requests and responses. They provide context about the message itself rather than the payload it carries.

| Header | Example | Description |
| :--- | :--- | :--- |
| **Date** | `Date: Wed, 16 Feb 2022 10:38:44 GMT` | Indicates the date and time the message originated. Standard practice dictates using the UTC time zone. |
| **Connection** | `Connection: close` | Dictates if the network connection should remain alive after the request concludes. Common values are `close` (terminates connection) and `keep-alive` (leaves connection open for further data transfer). |

## 2. Entity Headers
Entity headers are also common to both requests and responses. They describe the content (entity) being transferred and are typically found in server responses and client `POST` or `PUT` requests.

| Header | Example | Description |
| :--- | :--- | :--- |
| **Content-Type** | `Content-Type: text/html` | Describes the resource type being transferred. Browsers add this automatically, and it usually includes a `charset` directive (e.g., UTF-8) for encoding standards. |
| **Media-Type** | `Media-Type: application/pdf` | Similar to `Content-Type`, it specifies the data format. Crucial for ensuring the server parses the input correctly. |
| **Boundary** | `boundary="b4e4fbd93540"` | Acts as a delimiter to separate multiple data parts within the same message (e.g., used extensively in `multipart/form-data`). |
| **Content-Length** | `Content-Length: 385` | Indicates the exact size (in bytes) of the entity body being transmitted. The server relies on this to know when to stop reading data. |
| **Content-Encoding** | `Content-Encoding: gzip` | Specifies any transformations (like compression) applied to the payload to reduce message size before transit. |

## 3. Request Headers
Sent by the client during an HTTP transaction, these headers provide the server with necessary context about the request and the client's capabilities.

| Header | Example | Description |
| :--- | :--- | :--- |
| **Host** | `Host: www.inlanefreight.com` | Specifies the domain name or IP address of the target resource. Crucial for virtual hosting enumeration, as one IP can host multiple domains. |
| **User-Agent** | `User-Agent: curl/7.77.0` | Identifies the client software originating the request (OS, browser, version). Often manipulated during enumeration or exploitation. |
| **Referer** | `Referer: http://www.inlanefreight.com/` | Indicates the absolute or partial address of the previous web page from which a link to the currently requested page was followed. Prone to spoofing. |
| **Accept** | `Accept: */*` | Advertises which content types the client is able to understand. `*/*` means all media types are accepted. |
| **Cookie** | `Cookie: PHPSESSID=b4e4fbd93540` | Transmits stored cookies back to the server to maintain state, track sessions, or authorize the client. Multiple cookies are separated by semicolons. |
| **Authorization** | `Authorization: BASIC cGFzc3dvcmQK` | Carries credentials containing the authentication information of the client for the realm of the resource being requested. |

## 4. Response Headers
Sent by the server to the client, providing context about the response or the server itself.

| Header | Example | Description |
| :--- | :--- | :--- |
| **Server** | `Server: Apache/2.2.14 (Win32)` | Discloses the software and version of the HTTP server handling the request. Highly useful for initial reconnaissance. |
| **Set-Cookie** | `Set-Cookie: PHPSESSID=b4e4fbd93540` | Instructs the client to store a cookie. Follows the same key-value structure as the request `Cookie` header but includes attributes like `Expires` or `HttpOnly`. |
| **WWW-Authenticate** | `WWW-Authenticate: BASIC realm="localhost"` | Defines the authentication method that should be used to gain access to a resource. |

## 5. Security Headers
A specialized subset of response headers designed to mitigate common vulnerabilities (like XSS, clickjacking, and sniffing) by enforcing strict browser policies.

| Header | Example | Description |
| :--- | :--- | :--- |
| **Content-Security-Policy (CSP)** | `Content-Security-Policy: script-src 'self'` | Restricts the resources (such as JavaScript, CSS, Images) that a browser is allowed to load for a given page, heavily mitigating XSS attacks. |
| **Strict-Transport-Security (HSTS)** | `Strict-Transport-Security: max-age=31536000` | Forces the browser to communicate with the server exclusively over secure HTTPS connections, preventing downgrade attacks and traffic sniffing. |
| **Referrer-Policy** | `Referrer-Policy: origin` | Governs how much referrer information (sent via the `Referer` header) should be included with requests, preventing sensitive URL disclosure. |

---

## Interacting with Headers via cURL

Command-line tools like `curl` offer precise control over HTTP headers during testing and enumeration:

- `-v` (Verbose): Outputs the complete HTTP transaction, including both request and response headers.
- `-I` (Head Request): Sends a `HEAD` request to fetch and display **only** the response headers. Useful for quick reconnaissance.
- `-i` (Include): Sends the specified request (e.g., `GET`) and prints **both** the response headers and the body.
- `-H` (Header): Allows injection of custom request headers (e.g., `curl -H "X-Forwarded-For: 127.0.0.1"`).
- `-A` (User-Agent): A shorthand flag dedicated strictly to spoofing the `User-Agent` header.

### Practical Examples

**Fetching Response Headers Only:**
```bash
MikyRedHat@htb[/htb]$ curl -I https://www.inlanefreight.com
```

**Spoofing the User-Agent:**
```bash
MikyRedHat@htb[/htb]$ curl https://www.inlanefreight.com -A 'Mozilla/5.0'
```

## Browser Developer Tools (DevTools)
For GUI-based inspection, the **Network** tab in Browser DevTools is the standard tool. Selecting an individual HTTP transaction reveals both request and response headers. 
- The **Raw** view allows for inspection of the unparsed, raw header strings.
- The **Cookies** tab specifically isolates and breaks down session tracking identifiers for easier manipulation or auditing.

# HTTP Methods & Status Codes: Core Concepts

## Overview
The HTTP protocol utilizes various request methods that dictate how a web server should process and respond to incoming requests from a client (e.g., sending data, submitting forms, or transferring files). 
* **cURL:** When intercepting with `curl -v`, the initial line outputs the HTTP method (e.g., `GET / HTTP/1.1`).
* **DevTools:** Browsers display the HTTP method under the Network tab's "Method" column.
* **Headers:** Server responses inherently include an HTTP status code indicating the outcome of the processed request.

---

## Common HTTP Request Methods

| Method | Description | Security / Operational Context |
| :--- | :--- | :--- |
| **GET** | Requests a specific resource. Appends data to the server via URL query strings (e.g., `?param=value`). | Standard retrieval. Sensitive data or credentials should never be transmitted via GET. |
| **POST** | Submits data to the server. Handled within the request body (post-headers). | Commonly used for forms, logins, and binary payloads (images, PDFs). |
| **HEAD** | Requests identical headers to a GET request, but explicitly omits the response body. | Efficient for checking response length or resource metadata before full download. |
| **PUT** | Creates or overwrites resources on the target server. | **Risk:** If misconfigured without proper access controls, allows attackers to upload malicious payloads. |
| **DELETE** | Removes an existing resource on the web server. | **Risk:** Can lead to Denial of Service (DoS) if critical system files are deleted. |
| **OPTIONS** | Returns communication options and supported methods for the target resource. | Useful during the reconnaissance phase to enumerate allowed server actions. |
| **PATCH** | Applies partial modifications to a specific resource. | Standard in modern API endpoint updates. |

> **REST API Note:** While modern web applications primarily rely on `GET` and `POST`, RESTful architectures heavily utilize `PUT` and `DELETE` for data manipulation on the API endpoints.

---

## HTTP Status Codes
Status codes inform the client about the resolution of the requested operation. They are grouped into five standard hierarchical classes:

| Class | Designation | Description |
| :---: | :--- | :--- |
| **1xx** | Informational | Request received; continuing process. Does not alter request processing. |
| **2xx** | Success | The request was successfully received, understood, and accepted. |
| **3xx** | Redirection | Further routing action must be taken by the client to complete the request. |
| **4xx** | Client Error | The request contains bad syntax or cannot be fulfilled (e.g., malformed format, missing resource). |
| **5xx** | Server Error | The server failed to fulfill an apparently valid request. |

### Notable Status Code Examples

| Code | Meaning | Context |
| :---: | :--- | :--- |
| **200** | OK | Successful request; the response body typically contains the requested payload. |
| **302** | Found | Temporary redirect. Often used to route authenticated users to a post-login dashboard. |
| **400** | Bad Request | Malformed syntax encountered (e.g., missing line terminators, invalid parameters). |
| **403** | Forbidden | The client lacks appropriate access rights. Frequently triggered by WAFs or when malicious input is detected. |
| **404** | Not Found | The requested resource does not exist on the target server. |
| **500** | Internal Server Error | Generic error indicating the server encountered an unexpected condition preventing fulfillment. |

> **Operational Note:** While these are standard RFC codes, infrastructure providers (e.g., AWS, Cloudflare) often implement proprietary 5xx codes to handle specific edge-case routing or timeout issues.


# Web Requests: GET Methods & HTTP Basic Authentication

## 1. The GET Request
By default, web browsers utilize `GET` requests to retrieve remote resources hosted at a specified URL. Once the initial payload is retrieved, the browser may execute subsequent requests using various HTTP methods to load assets, APIs, or scripts. 

> **Assessment Technique:** Monitoring the **Network tab** in browser Developer Tools (DevTools) during navigation is a fundamental enumeration step. This technique maps out how the front-end application interacts with the backend architecture, providing vital telemetry for web application assessments and bug bounty hunting.

## 2. HTTP Basic Authentication
Unlike standard form-based logins that validate credentials via HTTP parameters (e.g., `POST` requests), **HTTP Basic Authentication** is handled directly by the web server (like Apache or Nginx) to restrict access to specific directories or pages, bypassing the web application logic entirely.

When attempting to access a protected directory without credentials, the server responds with a `401 Unauthorized` status and prompts for authentication.

### 2.1. Analyzing the 401 Unauthorized Response
Executing a standard cURL request against a protected endpoint:

```bash
curl -i http://<SERVER_IP>:<PORT>/
```

**Response Headers:**
```http
HTTP/1.1 401 Authorization Required
Date: Mon, 21 Feb 2022 13:11:46 GMT
Server: Apache/2.4.41 (Ubuntu)
WWW-Authenticate: Basic realm="Access denied"
Content-Length: 13
Content-Type: text/html; charset=UTF-8

Access denied
```
The presence of the `WWW-Authenticate: Basic realm="Access denied"` header explicitly confirms the use of HTTP Basic Auth.

### 2.2. Supplying Credentials via cURL
To authenticate and bypass the 401 prompt, we can inject the credentials directly using several methods:

**Method A: Using the `-u` flag**
```bash
curl -u admin:admin http://<SERVER_IP>:<PORT>/
```

**Method B: Embedding credentials in the URL**
```bash
curl http://admin:admin@<SERVER_IP>:<PORT>/
```

## 3. The HTTP Authorization Header
When we supply credentials via the methods above, the HTTP client (browser or cURL) automatically constructs an `Authorization` header. We can inspect this behavior by increasing the verbosity of our cURL request using the `-v` flag:

```bash
curl -v http://admin:admin@<SERVER_IP>:<PORT>/
```

**Verbose Output Snippet:**
```http
> GET / HTTP/1.1
> Host: <SERVER_IP>
> Authorization: Basic YWRtaW46YWRtaW4=
> User-Agent: curl/7.77.0
> Accept: */*
```

The `Authorization` header is set to `Basic YWRtaW46YWRtaW4=`. This string is the base64-encoded value of `admin:admin`. 
*(Note: Modern authentication mechanisms, such as JWT, typically utilize the `Bearer` schema followed by a cryptographic token, rather than `Basic` base64 encoding).*

**Method C: Manual Header Injection**
We can bypass the authentication prompt by manually injecting the base64-encoded header using the `-H` flag. This is highly useful for scripting automated interactions:

```bash
curl -H 'Authorization: Basic YWRtaW46YWRtaW4=' http://<SERVER_IP>:<PORT>/
```

## 4. GET Parameters and Backend Interactivity
Once authenticated, interacting with application features (e.g., a search function) often triggers parameterized `GET` requests to backend scripts.

### 4.1. Monitoring with DevTools
By clearing the DevTools Network tab (`CTRL+SHIFT+E`) and executing a search, we can capture the exact query sent to the backend. For example, searching for "le" triggers a request to a backend PHP script.

**Target URL structure:**
`http://<SERVER_IP>:<PORT>/search.php?search=le`
*(Notice how the GET parameter `search` and its value `le` are appended directly to the URL).*

### 4.2. Replicating Requests via CLI
DevTools allows us to extract these requests for external manipulation and further vulnerability testing (like SQLi or XSS).

**Copy as cURL:**
Right-click the network request -> `Copy` -> `Copy as cURL`. You can execute this directly in the terminal. For cleaner execution, you can strip unnecessary headers and keep only the authentication payload:

```bash
curl 'http://<SERVER_IP>:<PORT>/search.php?search=le' -H 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Copy as Fetch (JavaScript Console):**
Alternatively, right-click the request -> `Copy` -> `Copy as Fetch`. Navigate to the browser's Console tab (`CTRL+SHIFT+K`), paste the fetch command, and execute it to replay the request natively within the browser's context.

# HTTP POST Requests: Methodology & Data Transmission

## 1. POST vs. GET: Core Characteristics
While `GET` requests are typically utilized for data retrieval (search queries, page rendering), web applications rely on `POST` requests for state-changing operations, file transfers, and secure parameter submission. 

Unlike HTTP `GET`, which appends user parameters directly into the URL, HTTP `POST` encapsulates user parameters within the HTTP Request body. This architectural difference provides three key operational advantages:

* **Lack of Logging (OPSEC):** `GET` parameters are permanently recorded in server access logs (e.g., Apache, Nginx) as part of the requested URL. `POST` request bodies are not logged by default, making it the standard for handling sensitive payloads (e.g., credentials) and large file uploads.
* **Encoding Efficiency:** URLs strictly require URL-encoding to conform to valid character sets. `POST` requests transmit data within the body, which natively accepts binary data, minimizing encoding requirements to just parameter delimiters.
* **Data Capacity:** `GET` requests are restricted by URL length limits imposed by browsers, web servers, and CDNs (typically constrained to < 2,000 characters). `POST` requests bypass these URL limitations, allowing for massive data payloads.

---

## 2. Authentication Testing & Payload Delivery
During web application assessments, capturing and manipulating `POST` requests is critical for bypassing authentication forms. Using browser Developer Tools (Network Tab), we can intercept the authentication request and extract the payload.

**Captured Login Payload:**
```text
username=admin&password=admin
```

We can replicate this authentication request via the CLI using `cURL`. The `-X POST` flag specifies the method, while the `-d` (data) flag injects our payload.

**cURL Authentication Request:**
```bash
MikyRedHat@htb[/htb]$ curl -X POST -d 'username=admin&password=admin' http://<SERVER_IP>:<PORT>/
```
*Note: If the application triggers a post-login redirect (e.g., `302 Found` to `/dashboard.php`), append the `-L` flag in cURL to automatically follow the redirection.*

---

## 3. Session Management & Cookie Hijacking
Upon successful authentication, the server provisions a session cookie (e.g., `PHPSESSID`) via the `Set-Cookie` HTTP response header. This token persists the authenticated state.

**Extracting the Session Cookie:**
To view the response headers and capture the cookie, execute the request with the `-i` (include headers) or `-v` (verbose) flags:
```bash
MikyRedHat@htb[/htb]$ curl -X POST -d 'username=admin&password=admin' http://<SERVER_IP>:<PORT>/ -i

HTTP/1.1 200 OK
Server: Apache/2.4.41 (Ubuntu)
Set-Cookie: PHPSESSID=c1nsa6op7vtk7kdis7bcnbadf1; path=/
```

**Authenticating via Cookie Injection:**
Once the valid session token is acquired, we can bypass the login form entirely. We can inject this cookie into subsequent requests using the `-b` flag, or manually pass it as a standard header (`-H`).
```bash
# Method 1: Using the -b (cookie) flag
MikyRedHat@htb[/htb]$ curl -b 'PHPSESSID=c1nsa6op7vtk7kdis7bcnbadf1' http://<SERVER_IP>:<PORT>/

# Method 2: Injecting the Cookie header directly
MikyRedHat@htb[/htb]$ curl -H 'Cookie: PHPSESSID=c1nsa6op7vtk7kdis7bcnbadf1' http://<SERVER_IP>:<PORT>/
```
*GUI Methodology:* In browser DevTools (SHIFT+F9 for Storage/Application tab), we can manually modify or create the `PHPSESSID` cookie value and refresh the page to forcefully assume the authenticated session. This technique is fundamental when chaining vulnerabilities like Cross-Site Scripting (XSS) for session hijacking.

---

## 4. Interacting with JSON APIs
Modern web applications frequently process `POST` requests using structured data formats like JSON instead of standard form data.

**Captured JSON Payload:**
```json
{"search":"london"}
```

When interacting with endpoints expecting JSON, it is mandatory to explicitly declare the payload format using the `Content-Type: application/json` header. Failure to do so usually results in a `400 Bad Request` or silent failure.

**Crafting the JSON cURL Request:**
To query the endpoint directly without relying on the web front-end, we combine our session cookie, the specific headers, and the JSON payload:
```bash
MikyRedHat@htb[/htb]$ curl -X POST \
  -d '{"search":"london"}' \
  -b 'PHPSESSID=c1nsa6op7vtk7kdis7bcnbadf1' \
  -H 'Content-Type: application/json' \
  http://<SERVER_IP>:<PORT>/search.php
```

*Efficiency Tip:* For rapid testing in the browser, you can right-click the intercepted request in the Network tab, select **Copy > Copy as Fetch**, and execute it directly in the DevTools Console to replay or manipulate the request on the fly.

# Interacting with CRUD APIs via cURL

## 1. API and CRUD Fundamentals
Application Programming Interfaces (APIs) are widely utilized to interact with backend databases, allowing clients to query, insert, modify, or drop specific tables and rows via structured HTTP requests. Standard API database operations map directly to the **CRUD** (Create, Read, Update, Delete) model, implemented via standard HTTP request methods.

| Operation | HTTP Method | Target URI Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Create** | `POST` | `/api.php/table/` | Inserts a new record/entity into the specified database table. |
| **Read** | `GET` | `/api.php/table/identifier` | Retrieves records from the specified database entity. |
| **Update** | `PUT` / `PATCH` | `/api.php/table/identifier` | Modifies an existing database record. |
| **Delete** | `DELETE` | `/api.php/table/identifier` | Permanently drops/removes the specified row from the table. |

---

## 2. Read Operations (GET)
To retrieve data from an API endpoint, standard `GET` requests are issued. Appending specific search parameters or resource identifiers filters the returned dataset.

### Retrieve a Specific Entry
By appending the search term to the endpoint, the API filters records. Pipe the output to the `jq` utility for structured JSON parsing and pretty-printing, and utilize the `-s` (silent) flag to suppress cURL status metrics.

```bash
curl -s http://<SERVER_IP>:<PORT>/api.php/city/london | jq
```

**Output:**
```json
[
  {
    "city_name": "London",
    "country_name": "(UK)"
  }
]
```

### Partial Search / Pattern Matching
Providing a partial string returns all entries matching the specified pattern.

```bash
curl -s http://<SERVER_IP>:<PORT>/api.php/city/le | jq
```

### Retrieve All Dataset Entries
Passing an empty parameter or a trailing slash requests the entire table dataset.

```bash
curl -s http://<SERVER_IP>:<PORT>/api.php/city/ | jq
```

---

## 3. Create Operations (POST)
To inject a new record into the database, issue an HTTP `POST` request. Since modern APIs process data payloads natively in JSON format, the `Content-Type: application/json` header must be explicitly defined using the `-H` flag, while the JSON payload is passed via the `-d` data flag.

```bash
curl -X POST http://<SERVER_IP>:<PORT>/api.php/city/ \
     -H 'Content-Type: application/json' \
     -d '{"city_name":"HTB_City", "country_name":"HTB"}'
```

Verify successful insertion by querying the newly created resource endpoint:

```bash
curl -s http://<SERVER_IP>:<PORT>/api.php/city/HTB_City | jq
```

---

## 4. Update Operations (PUT / PATCH)
Modifying data requires targeting a specific resource identifier directly within the URI path to ensure the backend identifies the precise row to alter.

> [!NOTE]
> **PUT vs PATCH:** `PUT` replaces the entire target resource with the uploaded payload; missing fields might be overwritten or nullified depending on backend logic. Conversely, `PATCH` applies partial modifications to the resource, updating only the supplied fields. The `OPTIONS` method can be used to query which verbs are supported by the endpoint.

```bash
curl -X PUT http://<SERVER_IP>:<PORT>/api.php/city/london \
     -H 'Content-Type: application/json' \
     -d '{"city_name":"New_HTB_City", "country_name":"HTB"}'
```

Verify resource replacement (`london` should return empty, while `New_HTB_City` should exist):

```bash
curl -s http://<SERVER_IP>:<PORT>/api.php/city/london | jq
curl -s http://<SERVER_IP>:<PORT>/api.php/city/New_HTB_City | jq
```

---

## 5. Delete Operations (DELETE)
Removing database rows involves sending a `DELETE` request directly to the target resource's specific URI identifier.

```bash
curl -X DELETE http://<SERVER_IP>:<PORT>/api.php/city/New_HTB_City
```

Verify successful deletion (the endpoint should return an empty array `[]` or a `404 Not Found` status code):

```bash
curl -s http://<SERVER_IP>:<PORT>/api.php/city/New_HTB_City | jq
```

# MODULE 08: Web Requests - Technical Cheat Sheet

## 1. URL Anatomy (Uniform Resource Locator)
Reference Structure: `http://admin:password@inlanefreight.com:80/dashboard.php?login=true#status`

| Component | Example | Technical Context |
| :--- | :--- | :--- |
| **Scheme** | `http://` or `https://` | Protocol identifier. HTTPS implies TLS/SSL encapsulation. |
| **User Info** | `admin:password@` | Optional credentials for host authentication (`user:password`). |
| **Host** | `inlanefreight.com` | Destination FQDN, hostname, or IP address. |
| **Port** | `:80` | Defaults: `80` (HTTP), `443` (HTTPS). |
| **Path** | `/dashboard.php` | Target file or directory. Defaults to root index if omitted. |
| **Query String** | `?login=true` | Server parameters. Chained using `&` (e.g., `?id=1&login=true`). |
| **Fragment** | `#status` | Client-side anchor for internal page navigation. |

---

## 2. The HTTP Protocol & Flow
HTTP is a clear-text, application-layer protocol based on a Client-Server architecture.

* **Resolution & Connection Flow:** Local `/etc/hosts` check -> DNS Resolution -> TCP Handshake -> HTTP GET Request -> Server Processing -> HTTP Response -> Client Rendering.
* **HTTPS (HTTP Secure):** Encapsulates traffic within a TLS/SSL encrypted tunnel via port 443 to prevent Man-in-the-Middle (MITM) and clear-text credential harvesting. Handshake process: 301 Redirect -> Client Hello -> Server Hello & Certificate -> Key Verification -> Encrypted Tunnel.

---

## 3. Essential cURL Commands for Pentesting
`curl` is the standard CLI tool for raw HTTP transaction analysis, API enumeration, and payload delivery.

### Global Flags
| Flag | Name | Function |
| :--- | :--- | :--- |
| `-i` | `--include` | Prints HTTP response headers alongside the payload body. |
| `-I` | `--head` | Fetches headers only (sends an HTTP `HEAD` request). |
| `-v` | `--verbose` | Exposes the complete HTTP transaction (useful for debugging). |
| `-s` | `--silent` | Suppresses progress meters and error messages (ideal for Bash scripting). |
| `-k` | `--insecure` | Bypasses SSL/TLS certificate validation (crucial for self-signed lab targets). |
| `-L` | `--location` | Automatically follows HTTP redirects (e.g., `301`, `302`). |

### Data & Output Control
| Flag | Name | Function |
| :--- | :--- | :--- |
| `-O` | `--remote-name` | Downloads and saves the file using its original remote name. |
| `-o <file>`| `--output` | Downloads and saves the file under a custom local name. |
| `-X <METHOD>`| `--request` | Specifies the HTTP method (e.g., `-X POST`, `-X PUT`). |
| `-d <data>`| `--data` | Transmits data in a `POST` request body. |

### Header & Authentication Manipulation
| Flag | Name | Function |
| :--- | :--- | :--- |
| `-H` | `--header` | Injects custom headers (e.g., `-H 'Content-Type: application/json'`). |
| `-A` | `--user-agent` | Spoofs the User-Agent string. |
| `-u` | `--user` | Passes basic authentication credentials (`-u admin:password`). |
| `-b` | `--cookie` | Transmits a session cookie to bypass login (e.g., `-b 'PHPSESSID=1234'`). |

---

## 4. HTTP Methods & Status Codes

### Core HTTP Verbs
* **GET:** Retrieves resources. Parameters are exposed in the URL (not OPSEC safe for sensitive data).
* **POST:** Submits data. Encapsulates parameters in the request body (avoids server logging, bypasses URL length limits).
* **HEAD:** Retrieves HTTP response headers only.
* **PUT / PATCH:** Updates existing resources (PUT replaces completely; PATCH modifies partially).
* **DELETE:** Removes target resources.
* **OPTIONS:** Enumerates allowed HTTP methods on a target endpoint.

### Standard Status Codes
* **1xx (Informational):** Request received, processing continues.
* **2xx (Success):** `200 OK` (Standard success).
* **3xx (Redirection):** `301 Moved Permanently`, `302 Found` (Temporary redirect, common post-authentication).
* **4xx (Client Error):** `400 Bad Request`, `401 Unauthorized` (Basic Auth required), `403 Forbidden` (Access denied/WAF), `404 Not Found`.
* **5xx (Server Error):** `500 Internal Server Error` (Unexpected backend failure).

---

## 5. Critical HTTP Headers
Headers provide transactional context via `Key: Value` pairs.

* **Host:** Essential for Virtual Host routing.
* **User-Agent:** Identifies the client software. Highly spoofable.
* **Cookie / Set-Cookie:** Manages session state (e.g., `PHPSESSID`).
* **Authorization:** Handles HTTP Basic Auth (e.g., `Authorization: Basic YWRtaW46YWRtaW4=`).
* **Content-Type:** Defines payload format (e.g., `application/x-www-form-urlencoded`, `application/json`).
* **Security Headers:** `Content-Security-Policy` (CSP) against XSS, `Strict-Transport-Security` (HSTS) forcing HTTPS.

---

## 6. Authentication & Session Hijacking Examples

**Bypassing Basic Auth (401 Unauthorized):**
```bash
# Method 1: Using the -u flag
curl -u admin:admin http://target.htb/

# Method 2: Manual header injection (Base64 encoded payload)
curl -H 'Authorization: Basic YWRtaW46YWRtaW4=' http://target.htb/
```

**Authenticating via POST & Session Injection:**
```bash
# 1. Send credentials and extract the session cookie (-i)
curl -X POST -d 'username=admin&password=admin' http://target.htb/login.php -i

# 2. Replay the session cookie to access authenticated endpoints
curl -b 'PHPSESSID=c1nsa6op7vtk7kdis7bcnbadf1' http://target.htb/dashboard.php
```

---

## 7. Interacting with REST APIs (CRUD Operations)
Modern endpoints heavily utilize JSON. Always specify the `Content-Type`. Use `jq` to parse the output.

**Read (GET) - Fetch all records or a specific entity:**
```bash
curl -s http://target.htb/api.php/city/london | jq
```

**Create (POST) - Inject new records:**
```bash
curl -X POST http://target.htb/api.php/city/ \
  -H 'Content-Type: application/json' \
  -d '{"city_name":"HTB_City", "country_name":"HTB"}'
```

**Update (PUT/PATCH) - Modify existing records:**
```bash
curl -X PUT http://target.htb/api.php/city/london \
  -H 'Content-Type: application/json' \
  -d '{"city_name":"New_London", "country_name":"UK"}'
```

**Delete (DELETE) - Drop records:**
```bash
curl -X DELETE http://target.htb/api.php/city/New_London
```
# Web Applications: HTML & The DOM

## 1. HTML (HyperText Markup Language) Overview
HTML serves as the foundational skeleton of web applications. It constructs the basic elements of a web page—such as forms, images, titles, and structural containers—which the browser parses and renders to the end-user.

### Basic HTML Structure
Elements are strictly organized in a hierarchical, tree-like structure, heavily resembling XML. The root `<html>` tag encapsulates the entire document.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Page Title</title>
    </head>
    <body>
        <h1 id="main-heading">A Heading</h1>
        <p class="content-text">A Paragraph</p>
    </body>
</html>
```

**Key Tag Mechanics:**
* Elements rely on opening `<tag>` and closing `</tag>` syntax.
* Attributes like `id` (unique identifier) or `class` (group identifier) are embedded within the opening tag. These attributes are critical injection points when crafting CSS or DOM-based exploits.

## 2. Document Object Model (DOM) Tree
The browser constructs a DOM representation of the HTML document. The W3C defines the DOM as a platform- and language-neutral interface allowing scripts (e.g., JavaScript) to dynamically access and update document content, structure, and style.

```text
document
 └── html
     ├── head
     │   └── title
     └── body
         ├── h1
         └── p
```

**DOM Standards Breakdown:**
* **Core DOM:** Standard model for all document types.
* **XML DOM:** Standard model for XML.
* **HTML DOM:** Standard model specifically for HTML documents.

> **Security Implication:** Understanding the HTML DOM hierarchy (e.g., referencing `document.head` or targeting elements via `getElementById()`) is paramount for identifying injection vectors. Manipulating existing DOM elements or forging new ones is the core methodology behind Cross-Site Scripting (XSS) attacks.

## 3. URL Encoding (Percent-Encoding)
Browsers transmit URLs using the standard ASCII character set. Because HTTP requests cannot process raw special characters or spaces within URLs, unsafe characters must be URL-encoded. This process replaces non-ASCII or unsafe characters with a `%` followed by their two-digit Hexadecimal equivalent.

**Common Encoding Reference:**

| Character | URL Encoded | Description |
| :---: | :---: | :--- |
| `[space]` | `%20` or `+` | Space character |
| `!` | `%21` | Exclamation mark |
| `"` | `%22` | Double quote |
| `#` | `%23` | Hash / Fragment identifier |
| `$` | `%24` | Dollar sign |
| `%` | `%25` | Percent (used for encoding) |
| `&` | `%26` | Ampersand (parameter separator) |
| `'` | `%27` | Single quote |

> **Operational Note:** Proficiency in URL encoding/decoding is a fundamental requirement for IT Security and SysAdmins. It is routinely used to obfuscate payloads, troubleshoot HTTP routing issues, or ensure crafted web requests traverse proxies and WAFs (Web Application Firewalls) cleanly. Burp Suite's native Decoder tab is the industry-standard tool for rapid string conversions during web pentesting.

## 4. Operational Usage & Element Context
Understanding the structural separation within an HTML document is crucial for mapping an application's attack surface:
* `<head>`: Contains metadata not directly rendered on the main canvas (e.g., page title, charset, external dependencies).
* `<body>`: Contains the rendered layout payload (text, media, inputs, forms).
* `<style>`: Embeds internal CSS for styling. 
* `<script>`: Embeds JavaScript logic. *High-value target for code injection and execution.*

# Cascading Style Sheets (CSS)

## Overview
CSS (Cascading Style Sheets) is the foundational stylesheet language used in conjunction with HTML to control the presentation, formatting, and overall visual structure of web pages. As web standards evolve, subsequent iterations of CSS introduce advanced rendering capabilities natively supported by modern browsers.

## Fundamental Mechanics
At its core, CSS targets specific HTML elements (such as tags, classes, or IDs) and defines their styling rules. This architecture allows for centralized design management across an entire web application. 

Common target properties include `font-family`, `background-color`, `text-align`, and spatial dimensions like `margin`, `padding`, and `border`.

### Syntax Structure
CSS rulesets consist of a **selector** followed by a declaration block enclosed in curly braces `{}`. Each declaration pairs a property with a specific value, terminated by a semicolon `;`.

```css
/* Target by HTML Tag */
body {
  background-color: #000000;
}

h1 {
  color: #FFFFFF;
  text-align: center;
}

/* Target by specific ID or Class (crucial for JS DOM manipulation) */
.custom-paragraph {
  font-family: 'Helvetica', sans-serif;
  font-size: 14px;
}
```

## Advanced Capabilities
Beyond static formatting, modern CSS handles complex animations and dynamic spatial rendering (e.g., 3D transformations) without relying heavily on client-side scripting.

* **Animations:** Properties like `@keyframes`, `animation-duration`, and `animation-direction` allow elements to transition smoothly between different states, timelines, and coordinates.
* **Extensibility:** CSS syntax and styling principles are frequently adapted for XML formatting, SVG styling, and designing entire User Interfaces (UI) within modern mobile app development platforms.

## Interoperability with JavaScript
In modern web development, CSS works in tandem with JavaScript. While CSS defines the static and animated visual states, JavaScript is leveraged to execute logic and dynamically manipulate CSS classes or properties in real-time. This synergy is used to react to keystrokes and mouse events, or to generate advanced UI behaviors like Parallax depth effects.

## CSS Frameworks & Preprocessors
Manually writing vanilla CSS for enterprise-scale web applications can be inefficient and difficult to scale. To optimize workflows, ensure cross-browser compatibility, and enforce responsive design standards, developers utilize CSS frameworks and preprocessors. These toolkits provide pre-built, reusable stylesheets and components.

Some of the most widely adopted frameworks in modern environments include:

* **Bootstrap:** The industry-standard UI framework for responsive, mobile-first front-end web development.
* **Sass (Syntactically Awesome Style Sheets):** A powerful CSS extension language (preprocessor) that introduces programming concepts like variables, nested rules, and mixins into CSS.
* **Foundation:** A highly customizable, responsive front-end framework heavily used in enterprise-level applications.
* **Bulma:** A modern, lightweight CSS framework based entirely on Flexbox.
* **Pure:** A minimalist, responsive CSS module suite developed by Yahoo, ideal for lightweight footprint requirements.


# Web Architecture: JavaScript Fundamentals

## Overview
JavaScript (JS) is a core programming language of the web, functioning primarily as a client-side scripting language executed directly within the browser. While HTML structures the content and CSS handles the presentation, JavaScript dictates the behavior, logic, and interactivity of a webpage. 

Although traditionally restricted to the front end, modern implementations like **Node.js** allow JavaScript to function as a robust back-end language, enabling full-stack web application development. Without JS, web pages would remain completely static, lacking interactive elements or real-time state changes.

## Implementation Methods
JavaScript interacts with the web page's source code via the `<script>` tag. There are two primary ways to load JS into the Document Object Model (DOM):

### 1. Inline Execution
Code is embedded directly within the HTML document. While useful for quick scripts, it is generally avoided in production environments in favor of modularity.
```html
<script type="text/javascript">
    // JavaScript logic goes here
</script>
```

### 2. External Sourcing
Code is loaded from an external file. This is the industry standard practice as it improves code maintainability and allows the browser to cache the script.
```html
<script src="./script.js"></script>
```

## DOM Manipulation & Core Functionality
A fundamental use case for JavaScript is interacting with and dynamically modifying HTML elements. 

```javascript
// Targeting an HTML element by its ID and altering its inner text
document.getElementById("button1").innerHTML = "Changed Text!";
```
In a functional web application, this type of execution is typically bound to an event listener, meaning the script triggers only when a specific action occurs (e.g., an end-user clicking the "button1" element).

## Advanced Usage & Asynchronous Operations
Modern web browsers are equipped with highly optimized JavaScript engines that execute code locally on the client-side. This drastically reduces server overhead and allows for rapid processing. Key functionalities include:

* **Dynamic DOM Updates:** Altering the webpage view and content in real-time without requiring a full page reload.
* **Asynchronous Requests (AJAX):** Performing HTTP requests in the background to interact with back-end APIs, sending and retrieving data seamlessly.
* **User Input Processing:** Validating and sanitizing data entered by the user before transmission.
* **Advanced Animations:** Driving complex, interactive visual sequences that surpass the limitations of pure CSS.

## Front-End Frameworks
As enterprise web applications scale in complexity, developing entirely in "vanilla" (pure) JavaScript becomes inefficient. To streamline the development pipeline, the industry relies on JavaScript frameworks and libraries. 

These platforms abstract complex backend-like functionalities (such as routing, state management, and user authentication) into modular components, often dynamically generating HTML rather than relying on static files.

Some of the most prominent front-end frameworks and libraries encountered in modern infrastructure include:
* **React**
* **Angular**
* **Vue**
* **jQuery** *(Considered legacy, but still widely deployed in older environments)*

# Front-End Vulnerabilities: Sensitive Data Exposure

## 1. Overview
While the majority of web application penetration testing targets back-end infrastructure, front-end components present a critical attack surface. Although client-side execution isolates the core back-end from direct exploitation, vulnerabilities here can severely compromise end-users. If an attacker leverages a front-end flaw against an administrative user, it can rapidly escalate to unauthorized backend access, sensitive data leaks, and widespread service disruption.

## 2. Information Gathering & Attack Vectors
**Sensitive Data Exposure** occurs when sensitive information is inadvertently transmitted in clear-text to the client-side environment. This data typically resides in the HTML source code, embedded JavaScript, or external asset links.

### Reconnaissance Techniques
* **Page Source Inspection:** Bypassing UI restrictions (like disabled right-clicks) using `Ctrl + U` or intercepting traffic via web proxies such as **Burp Suite**.
* **Targeting 'Low-Hanging Fruit':**
    * Hardcoded login credentials or cryptographic hashes.
    * Leftover developer comments (e.g., ``).
    * Exposed API endpoints, hidden directories, or debugging parameters.
    * Unintended user data leakage.

## 3. Proof of Concept (PoC)
During an assessment, an apparently secure authentication form might conceal critical flaws within its source code. 

**Target:** Standard Login Form
**Finding:** Hardcoded credentials exposed within HTML comments.

```html
<form action="action_page.php" method="post">
    <div class="container">
        <label for="uname"><b>Username</b></label>
        <input type="text" required>

        <label for="psw"><b>Password</b></label>
        <input type="password" required>

        <button type="submit">Login</button>
    </div>
</form>
```

**Impact:** The failure to sanitize developer comments provides immediate, unauthorized access using the `test:test` credentials. Automated source code analyzers can easily scrape this type of leakage to map hidden functionality or escalate privileges across the web application.

## 4. Remediation & DevSecOps Strategies
To mitigate Sensitive Data Exposure on the client-side, the following practices should be implemented:
* **Code Sanitization:** Ensure production front-end code is rigorously stripped of debugging parameters, test directories, and developer comments.
* **Data Classification:** Strictly classify data types and enforce access controls to determine what is permissible for client-side exposure.
* **Obfuscation & Packing:** Utilize JavaScript minification, packing, and obfuscation techniques to complicate reverse-engineering and deter automated scraping tools.
* **Code Review Pipeline:** Integrate mandatory peer reviews and automated SAST (Static Application Security Testing) tools into the CI/CD pipeline prior to deployment to catch exposed information.
