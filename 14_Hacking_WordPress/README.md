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