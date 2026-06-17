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
