# 05_Intro_to_Bash_Scripting
# Bourne Again Shell (Bash) Scripting

The **Bourne Again Shell (Bash)** is the standard command-line interpreter and scripting language used to interact with Unix-based operating systems. Since the integration of the Windows Subsystem for Linux (WSL) in 2019, Bash has also become natively accessible within Windows environments. 

Unlike compiled programming languages (e.g., C, Rust), Bash is an interpreted scripting language. This means the code is executed directly by the interpreter without requiring a prior compilation step, allowing for rapid development and execution.

## Operational Relevance for IT & Security Professionals

For system administrators and penetration testers, OS-agnostic proficiency is mandatory. Operational efficiency—particularly during the enumeration, data parsing, and privilege escalation phases—relies heavily on terminal mastery. 

In large-scale enterprise environments, you will handle massive amounts of raw data. The ability to automate command chaining, filter out noise, and parse relevant outputs via Bash scripting is critical for rapidly identifying potential attack vectors, misconfigurations, or critical infrastructure information.

### Core Scripting Components
Similar to standard programming languages, a robust Bash script relies on several core structural elements:
* **Input & Output (I/O)**
* **Arguments, Variables & Arrays**
* **Conditional Execution (if/else)**
* **Arithmetic Operations**
* **Loops (for/while)**
* **Comparison Operators**
* **Functions**

---

## Script Execution Syntax

A script does not spawn its own process independently; it requires an interpreter to execute the instructions. To execute a Bash script, you must specify the interpreter (either explicitly or via the script's shebang) followed by the script file and any required arguments.

```shell
# Explicitly invoking the Bash interpreter
MikyRedHat@htb[/htb]$ bash script.sh <optional arguments>

# Explicitly invoking the standard shell interpreter
MikyRedHat@htb[/htb]$ sh script.sh <optional arguments>

# Executing the script directly (requires execution permissions: chmod +x)
MikyRedHat@htb[/htb]$ ./script.sh <optional arguments>
```

---

## Practical Implementation: Network Enumeration Script (CIDR.sh)

To illustrate these concepts, let's analyze CIDR.sh, an automated network enumeration script that identifies the IPv4 address of a target domain, extracts its corresponding CIDR network range, and performs host discovery via ICMP ping sweeps.

### 1. Expected Output Example
When executing the script against a target domain (inlanefreight.com), it provides an interactive menu to control the flow of execution:

```shell
MikyRedHat@htb[/htb]$ ./CIDR.sh inlanefreight.com

Discovered IP address(es):
165.22.119.202

Additional options available:
    1) Identify the corresponding network range of target domain.
    2) Ping discovered hosts.
    3) All checks.
    *) Exit.
Select your option: 3

NetRange for 165.22.119.202:
NetRange:       165.22.0.0 - 165.22.255.255
CIDR:           165.22.0.0/16

Pinging host(s):
165.22.119.202 is up.

1 out of 1 hosts are up.
```

### 2. Source Code Breakdown

Below is the complete source code for CIDR.sh. It has been divided into logical, modular functions for maintainability and scalability.

```bash
#!/bin/bash

# 1. Check for given arguments
# Ensures the user provides exactly one argument (the target domain). If not, it prints the usage syntax and exits.
if [ $# -eq 0 ]
then
    echo -e "You need to specify the target domain.\n"
    echo -e "Usage:"
    echo -e "\t$0 <domain>"
    exit 1
else
    domain=$1
fi

# 2. Identify network range for the specified IP address(es)
# Queries the WHOIS database for the discovered IP, extracts the NetRange/CIDR using grep/awk, and parses it.
function network_range {
    for ip in $ipaddr
    do
        netrange=$(whois $ip | grep "NetRange\|CIDR" | tee -a CIDR.txt)
        cidr=$(whois $ip | grep "CIDR" | awk '{print $2}')
        cidr_ips=$(prips $cidr)
        echo -e "\nNetRange for $ip:"
        echo -e "$netrange"
    done
}

# 3. Ping discovered IP address(es)
# Iterates through the generated CIDR IPs using a while loop and ICMP echo requests to verify host availability.
function ping_host {
    hosts_up=0
    hosts_total=0
    
    echo -e "\nPinging host(s):"
    for host in $cidr_ips
    do
        stat=1
        while [ $stat -eq 1 ]
        do
            # Discards standard output and error to keep the terminal clean
            ping -c 2 $host > /dev/null 2>&1
            if [ $? -eq 0 ]
            then
                echo "$host is up."
                ((stat--))
                ((hosts_up++))
                ((hosts_total++))
            else
                echo "$host is down."
                ((stat--))
                ((hosts_total++))
            fi
        done
    done
    
    echo -e "\n$hosts_up out of $hosts_total hosts are up."
}

# 4. Identify IP address(es) of the specified domain
# Resolves the target domain to its IPv4 address, formats the output, and stores it in a variable.
hosts=$(host $domain | grep "has address" | cut -d" " -f4 | tee discovered_hosts.txt)
echo -e "Discovered IP address:\n$hosts\n"
ipaddr=$(host $domain | grep "has address" | cut -d" " -f4 | tr "\n" " ")

# 5. Available options (Interactive Menu)
# Presents a case statement menu allowing the user to select specific functions dynamically.
echo -e "Additional options available:"
echo -e "\t1) Identify the corresponding network range of target domain."
echo -e "\t2) Ping discovered hosts."
echo -e "\t3) All checks."
echo -e "\t*) Exit.\n"

read -p "Select your option: " opt
case $opt in
    "1") network_range ;;
    "2") ping_host ;;
    "3") network_range && ping_host ;;
    "*") exit 0 ;;
esac
```

### Code Logic Analysis:
1. **Argument Validation:** The if [ $# -eq 0 ] block acts as a safety net. It prevents the script from executing with missing variables, which would otherwise result in backend command errors.
2. **Domain Resolution:** Utilizing standard binaries like host, grep, cut, and tr, the script isolates the raw IPv4 payload and formats it cleanly for further processing.
3. **Piping & Redirection:** The script makes heavy use of terminal piping (|) and redirection (> /dev/null 2>&1, tee -a) to manipulate output silently, logging necessary data while maintaining a clean user interface.
4. **Execution Flow Control:** The case statement at the end ties the entire script together, demonstrating how modular functions can be called individually or chained (&&) based on user input.

# Bash Scripting: Conditional Execution & Control Flow

## 1. Overview
Conditional execution dictates the control flow of a script by evaluating specific conditions. Without it, scripts would be limited to strictly linear, sequential command execution. By defining conditions, we instruct the interpreter to execute or bypass specific code blocks based on given values, variables, or command exit codes. Once a conditional block completes, the script resumes executing the subsequent lines of code.

## 2. Core Components & Syntax
Let's analyze a standard conditional block to validate user input:

```bash
#!/bin/bash

# Check for given argument
if [ $# -eq 0 ]; then
    echo -e "Error: You need to specify the target domain.\n"
    echo -e "Usage:"
    echo -e "\t$0 <domain>"
    exit 1
else
    domain=$1
fi
```

### Component Breakdown:
*   #!/bin/bash (**Shebang**): Defines the absolute path to the interpreter used to parse the script.
*   if-else-fi (**Control Flow**): The conditional structure used to evaluate statements.
*   echo (**Standard Output**): Prints specific output to the terminal.
*   $# / $0 / $1 (**Special Variables**): 
    *   $#: Holds the total number of arguments passed to the script.
    *   $0: Holds the name of the script itself.
    *   $1: Holds the first argument passed by the user.
*   domain (**Variables**): A user-defined variable storing the assigned value.

Conditions are typically evaluated using variables ($#, $0, $1, domain), integers (0), or strings, paired with specific comparison operators (e.g., -eq for "equal to").

---

## 3. The Shebang (#!)
The shebang line must always be the very first line of a script. It dictates which interpreter the operating system should use to execute the file. 

```bash
#!/bin/bash            # Bash interpreter
#!/usr/bin/env python  # Python interpreter (env lookup)
#!/usr/bin/env perl    # Perl interpreter (env lookup)
```

---

## 4. Conditional Structures (if-elif-else)
Checking conditions is fundamental to scripting. It allows us to handle variables, sanitize user input, and catch errors. In Bash, this is typically handled via if-else statements or case switches.

### Standard if Statement
The most basic form simply evaluates a single condition:

```bash
#!/bin/bash
value=$1

if [ "$value" -gt 10 ]; then
    echo "The given argument is greater than 10."
fi
```

**Execution:**
```shellsession
MikyRedHat@htb[/htb]$ bash if-only.sh 5
MikyRedHat@htb[/htb]$ bash if-only.sh 12
The given argument is greater than 10.
```

### Handling Alternatives with elif and else
To handle multiple potential states and define a fallback for unexpected input, we implement elif (else if) and else blocks:

```bash
#!/bin/bash
value=$1

if [ "$value" -gt 10 ]; then
    echo "The given argument is greater than 10."
elif [ "$value" -lt 10 ]; then
    echo "The given argument is less than 10."
else
    echo "Error: The given argument is not a valid number."
fi
```

**Execution:**
```shellsession
MikyRedHat@htb[/htb]$ bash if-elif-else.sh 5
The given argument is less than 10.

MikyRedHat@htb[/htb]$ bash if-elif-else.sh 12
The given argument is greater than 10.

MikyRedHat@htb[/htb]$ bash if-elif-else.sh HTB
if-elif-else.sh: line 5: [: HTB: integer expression expected
if-elif-else.sh: line 8: [: HTB: integer expression expected
Error: The given argument is not a valid number.
```
*(Note: Bash outputs an error on lines 5 and 8 because it attempts to evaluate a string ("HTB") using integer comparison operators -gt and -lt before hitting the else fallback).*

### Expanding Conditions (Input Validation)
A practical SysAdmin/Pentester use case is validating that the correct number of parameters are passed before the script continues execution:

```bash
#!/bin/bash

# Check the exact number of provided arguments
if [ $# -eq 0 ]; then
    echo -e "Error: You need to specify the target domain.\n"
    echo -e "Usage:"
    echo -e "\t$0 <domain>"
    exit 1
elif [ $# -eq 1 ]; then
    domain=$1
    echo "Target domain set to: $domain"
else
    echo -e "Error: Too many arguments given."
    exit 1
fi
```
*   exit 1: Terminates the script immediately and returns a non-zero exit code to the OS, indicating an error.

---

## 5. Practical Exercise: Base64 Encoding Loop
The following script demonstrates a basic for loop used to encode a string multiple times.

```bash
#!/bin/bash
# Note: To count the number of characters in a variable: echo -n "$variable" | wc -m

# Variable to encode
var="nef892na9s1p9asn2aJs71nIsm"

# Iteratively encode the variable in Base64 40 times
for counter in {1..40}; do
    var=$(echo -n "$var" | base64)
done

echo "Final encoded payload generated."
```
# Bash Scripting: Arguments, Variables, and Arrays

## 1. Command-Line Arguments
Bash scripts can accept up to nine positional arguments natively ($1 through $9), with $0 permanently reserved for the name of the executed script. These positional parameters allow us to pass data dynamically at runtime without hardcoding targets.

```bash
# Execution syntax and variable mapping
./script.sh ARG1 ARG2 ARG3 ... ARG9
# $0        $1   $2   $3   ... $9
```

## 2. Special Variables
Bash provides built-in special variables to manage script execution states and handle arguments. They rely on the Internal Field Separator (IFS) to parse argument boundaries.

| Variable | Description |
| :--- | :--- |
| $# | Returns the total number of arguments passed to the script. Useful for input validation. |
| $@ | Retrieves the entire list of command-line arguments as an array. |
| $n | Positional parameter (e.g., $1, $2) to retrieve specific arguments. |
| $$ | Returns the Process ID (PID) of the currently executing process. |
| $? | Returns the exit status of the last executed command (0 = Success, 1 = Failure). |

### Practical Implementation: Target Validation
Before executing a script, ensure it has the correct permissions (chmod +x script.sh). The following snippet demonstrates basic input validation leveraging special variables to ensure a target is provided:

```bash
#!/bin/bash
# Check if exactly one argument is provided
if [ $# -eq 0 ]; then
    echo -e "Error: Target domain required.\n"
    echo -e "Usage:\n\t$0 <domain>"
    exit 1
else
    domain=$1
fi
```

## 3. Variable Declaration and Assignment
Unlike strictly typed programming languages, Bash treats all variable values as strings by default. Arithmetic functions are only evaluated if explicitly requested or if the variable contains exclusively numeric values.

**Critical Syntax Rule:** Variable assignment must **not** contain spaces around the equals sign (=).

```bash
# INCORRECT: Bash interprets 'variable' as a command
variable = "Error string"

# CORRECT: Direct assignment
variable="Valid string"
echo $variable
```
*Note: We only use the $ prefix when referencing/calling the variable's value, not during its declaration.*

## 4. Arrays
Arrays allow us to store an ordered sequence of values under a single variable—highly beneficial when scripting scans across multiple domains or IP addresses. Bash arrays are zero-indexed.

### Declaration and Expansion
To define an array, wrap the space-separated elements in parentheses. To retrieve an element, use curly braces for variable expansion, specifying the required index enclosed in square brackets.

```bash
#!/bin/bash
# Declaring an array of target domains
domains=(www.inlanefreight.com ftp.inlanefreight.com vpn.inlanefreight.com)

# Retrieving the first element (index 0)
echo ${domains[0]}
# Output: www.inlanefreight.com
```

### String Quoting Behavior
Enclosing multiple items within single (' ') or double (" ") quotes nullifies the default IFS space separation. Bash will treat everything inside the quotes as a single, contiguous string assigned to a single array index.

```bash
#!/bin/bash
# The first three domains are treated as a single element at index 0 due to quotes
domains=("www.inlanefreight.com ftp.inlanefreight.com vpn.inlanefreight.com" www2.inlanefreight.com)

echo ${domains[0]}
# Output: www.inlanefreight.com ftp.inlanefreight.com vpn.inlanefreight.com
```
# Bash Scripting: Comparison & Logical Operators

In Bash scripting, comparison operators are essential elements used to evaluate and compare specific values. Depending on the data type and the condition we need to check, these operators are categorized into four main groups: **String**, **Integer**, **File**, and **Boolean/Logical** operators.

---

## 1. String Operators

Used to evaluate and compare string values. When working with strings, it is a best practice to enclose the variables in double quotes (e.g., `"$1"`) to prevent word splitting and ensure Bash treats the variable's content strictly as a string.

| Operator | Description |
| :--- | :--- |
| `==` | Is equal to |
| `!=` | Is not equal to |
| `<` | Is less than (in ASCII alphabetical order)* |
| `>` | Is greater than (in ASCII alphabetical order)* |
| `-z` | Returns true if the string is empty (null) |
| `-n` | Returns true if the string is not null |

> **Note:** The `<` and `>` operators only work properly within double square brackets `[[ <condition> ]]`. They evaluate strings based on the **ASCII table** (American Standard Code for Information Interchange), which assigns specific decimal/hexadecimal values to characters. 

### String Comparison Example
```bash
#!/bin/bash

# Check the given argument
if [ "$1" != "HackTheBox" ]; then
    echo -e "[-] You need to provide 'HackTheBox' as an argument."
    exit 1
elif [ $# -gt 1 ]; then
    echo -e "[-] Too many arguments provided."
    exit 1
else
    domain=$1
    echo -e "[+] Success! Domain set to: $domain"
fi
```

---

## 2. Integer Operators

Used exclusively for comparing numerical integer values. This is particularly useful for controlling script logic based on numerical limits, argument counts, or calculated thresholds.

| Operator | Description |
| :--- | :--- |
| `-eq` | Is equal to |
| `-ne` | Is not equal to |
| `-lt` | Is less than |
| `-le` | Is less than or equal to |
| `-gt` | Is greater than |
| `-ge` | Is greater than or equal to |

### Integer Comparison Example
```bash
#!/bin/bash

# Evaluate the number of arguments passed to the script
if [ $# -lt 1 ]; then
    echo -e "[-] Number of given arguments is less than 1."
    exit 1
elif [ $# -gt 1 ]; then
    echo -e "[-] Number of given arguments is greater than 1."
    exit 1
else
    domain=$1
    echo -e "[+] Number of given arguments equals 1."
fi
```

---

## 3. File Operators

Critical for SysAdmin and Pentesting workflows. File operators allow the script to verify the existence, type, and specific permissions of files and directories before executing actions on them.

| Operator | Description |
| :--- | :--- |
| `-e` | Returns true if the file exists |
| `-f` | Tests if it is a regular file |
| `-d` | Tests if it is a directory |
| `-L` | Tests if it is a symbolic link |
| `-N` | Checks if the file was modified after it was last read |
| `-O` | Returns true if the current user owns the file |
| `-G` | Returns true if the file's group ID matches the current user's |
| `-s` | Tests if the file has a size greater than 0 bytes |
| `-r` | Tests if the file has read permission |
| `-w` | Tests if the file has write permission |
| `-x` | Tests if the file has execute permission |

### File Operator Example
```bash
#!/bin/bash

# Check if the specified file exists
if [ -e "$1" ]; then
    echo -e "[+] The file exists."
    exit 0
else
    echo -e "[-] The file does not exist."
    exit 2
fi
```

---

## 4. Boolean and Logical Operators

Boolean operators return a `true` or `false` value. Logical operators allow us to chain multiple conditions together. For the entire statement to execute, the combined conditions must evaluate correctly according to the logic used.

| Operator | Description |
| :--- | :--- |
| `!` | Logical negation (NOT) |
| `&&` | Logical AND (both conditions must be true) |
| `||` | Logical OR (at least one condition must be true) |

### Logical AND / NOT Example
```bash
#!/bin/bash

# Validate file existence and read permissions
if [[ -e "$1" && -r "$1" ]]; then
    echo -e "[+] Target file exists and is readable."
    exit 0
elif [[ ! -e "$1" ]]; then
    echo -e "[-] Target file does not exist."
    exit 2
elif [[ -e "$1" && ! -r "$1" ]]; then
    echo -e "[-] Target file exists, but read permission is denied."
    exit 1
else
    echo -e "[!] An unexpected error occurred."
    exit 5
fi
```

---

## 5. Practical Exercise

**Objective:** Encode a string multiple times using `base64` and set up an `if` condition to break the loop once the generated string matches a specific target value.

```bash
#!/bin/bash

var="8dm7KsjU28B7v621Jls"
value="ERmFRMVZ0U2paTlJYTkxDZz09Cg"

for i in {1..40}; do
    # Encode the current variable into base64
    var=$(echo "$var" | base64)
    
    # Check if the current encoded string matches our target value
    if [[ "$var" == "$value" ]]; then
        echo -e "[+] Match found at iteration $i!"
        echo -e "[+] Payload: $var"
        break
    fi
done
```
