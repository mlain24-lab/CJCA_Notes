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
