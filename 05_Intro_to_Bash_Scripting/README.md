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
| <code>\|\|</code> | Logical OR (at least one condition must be true) |

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
# Bash Scripting: Arithmetic Operations

In Bash, arithmetic operators are essential for performing mathematical calculations and dynamically modifying integer variables. There are seven primary operators commonly utilized in scripting.

## Arithmetic Operators

| Operator | Description |
| :---: | :--- |
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |
| `%` | Modulus (Remainder) |
| `variable++` | Post-increment (Increases the value of the variable by 1) |
| `variable--` | Post-decrement (Decreases the value of the variable by 1) |

## Practical Implementation

The following script demonstrates the basic usage of these operators within a practical scenario:

### `Arithmetic.sh`
```bash
#!/bin/bash
increase=1
decrease=1

echo "Addition: 10 + 10 = $((10 + 10))"
echo "Subtraction: 10 - 10 = $((10 - 10))"
echo "Multiplication: 10 * 10 = $((10 * 10))"
echo "Division: 10 / 10 = $((10 / 10))"
echo "Modulus: 10 % 4 = $((10 % 4))"

((increase++))
echo "Increase Variable: $increase"

((decrease--))
echo "Decrease Variable: $decrease"
```

**Execution Output:**
```shellsession
MikyRedHat@htb[/htb]$ ./Arithmetic.sh
Addition: 10 + 10 = 20
Subtraction: 10 - 10 = 0
Multiplication: 10 * 10 = 100
Division: 10 / 10 = 1
Modulus: 10 % 4 = 2
Increase Variable: 2
Decrease Variable: 0
```

## Calculating Variable Length

Bash also provides a built-in parameter expansion to calculate the length of a string stored in a variable. By using the `${#variable}` syntax, the interpreter evaluates and returns the total character count.

### `VarLength.sh`
```bash
#!/bin/bash
htb="HackTheBox"
echo ${#htb}
```

**Execution Output:**
```shellsession
MikyRedHat@htb[/htb]$ ./VarLength.sh
10
```

## Real-World Application: Loop Control

In network enumeration scripts (such as an ICMP sweep), increment and decrement operators are heavily utilized to manage loop states and tally results. Below is an excerpt from a `CIDR.sh` script, demonstrating how these operators control a `while` loop and track live hosts.

### `CIDR.sh` Snippet
```bash
<SNIP>
    echo -e "\nPinging host(s):"
    for host in $cidr_ips
    do
        stat=1
        while [ $stat -eq 1 ]
        do
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
<SNIP>
```

**Technical Breakdown:**
* **Loop Control:** The `stat` variable acts as a flag. Once the `ping` command is executed, `((stat--))` decreases its value to `0`, successfully breaking the `while [ $stat -eq 1 ]` condition.
* **Counters:** `((hosts_up++))` and `((hosts_total++))` function as dynamic counters, incrementing to maintain an accurate record of reachable endpoints versus the total number of scanned hosts.

# Bash Scripting: Input and Output (I/O) Control

## Input Control: Interactive Execution
When automating tasks, we often encounter scenarios that require manual intervention. For instance, you might need to evaluate preliminary scan results before deciding which function to trigger, or specific rules of engagement (RoE) might restrict certain automated activities.

To handle this, we can design scripts that pause and wait for operator instructions. The following snippet from `CIDR.sh` demonstrates how to implement an interactive menu using the `read` command paired with a `case` statement.

### Example: Interactive Menu in `CIDR.sh`
```bash
# Available options menu
echo -e "Additional options available:"
echo -e "\t1) Identify the corresponding network range of the target domain."
echo -e "\t2) Ping discovered hosts."
echo -e "\t3) Execute all checks."
echo -e "\t*) Exit.\n"

# Capture user input
read -p "Select your option: " opt

# Execute functions based on input
case $opt in
    "1") network_range ;;
    "2") ping_host ;;
    "3") network_range && ping_host ;;
    "*") exit 0 ;;
esac
```

**Technical Breakdown:**
* `read -p`: The `-p` (prompt) flag allows us to display the prompt string (`Select your option: `) and capture the user's keystroke on the exact same line, keeping the interface clean. The input is then stored in the `$opt` variable.
* `case`: Evaluates the `$opt` variable and routes the execution flow to the predefined functions (`network_range`, `ping_host`, etc.). This is far more efficient than writing multiple nested `if-elif` statements for menus.

---

## Output Control: Simultaneous Display and Logging
Standard output (`stdout`) redirection (e.g., using `>`) is a fundamental Linux concept, but it introduces a major drawback for long-running scripts: it suppresses the console output, leaving the operator completely blind while the script runs in the background.

To maintain situational awareness without sacrificing our audit trails or logs, we use the `tee` utility. `tee` reads from standard input and duplicates it—sending one copy to `stdout` (your terminal) and another directly to a specified file.

### Example: Dual Output Implementation
```bash
# Identify the network range for the specified IP address(es)
function network_range {
    for ip in $ipaddr; do
        # Use 'tee -a' to append output to CIDR.txt while displaying it live
        netrange=$(whois $ip | grep "NetRange\|CIDR" | tee -a CIDR.txt)
        cidr=$(whois $ip | grep "CIDR" | awk '{print $2}')
        cidr_ips=$(prips $cidr)
        
        echo -e "\nNetRange for $ip:"
        echo -e "$netrange"
    done
}

# Identify the IP address of the specified domain and log it
hosts=$(host $domain | grep "has address" | cut -d" " -f4 | tee discovered_hosts.txt)
```

**Technical Breakdown:**
* `| tee filename.txt`: Pipes the output stream to `tee`, which writes it to both the terminal and the target file simultaneously.
* `| tee -a filename.txt`: The `-a` (`--append`) flag ensures that existing files are not overwritten. Instead, the new results are safely appended to the bottom of the log file.

### Expected Output Validation
When querying the files generated by our `tee` implementation, the logs should accurately reflect exactly what was displayed on the terminal during the script's execution:

```shell
MikyRedHat@htb[/htb]$ cat discovered_hosts.txt CIDR.txt
165.22.119.202
NetRange:       165.22.0.0 - 165.22.255.255
CIDR:           165.22.0.0/16
```
# Bash Scripting: Flow Control and Loops

Controlling the execution flow of our bash scripts is critical for operational efficiency, automation, and reliable error handling. While `if-else` conditionals handle branching, loops allow us to iterate over data sets dynamically. Every control structure relies on logical expressions (boolean values) to dictate execution.

Primary control structures include:
* **Branches:** `if-else` conditions, `case` statements.
* **Loops:** `for` loops, `while` loops, `until` loops.

---

## 1. For Loops

A `for` loop executes commands for every item within a specified list, array, or data stream. It continues iterating as long as it finds corresponding data. In a SysAdmin or Pentesting context, `for` loops are highly effective for iterating through IP arrays to sweep hosts, enumerate ports, or execute commands in bulk.

### Standard Syntax Examples

**Iterating over a simple list:**
```bash
for variable in 1 2 3 4; do
    echo $variable
done
```

**Iterating over files:**
```bash
for variable in file1 file2 file3; do
    echo $variable
done
```

**Iterating over an IP array (Network Sweeping):**
```bash
for ip in "10.10.10.170 10.10.10.174 10.10.10.175"; do
    ping -c 1 $ip
done
```

### One-Liner Execution
For rapid enumeration directly from the terminal, `for` loops can be compressed into a single line:
```bash
MikyRedHat@htb[/htb]$ for ip in 10.10.10.170 10.10.10.174; do ping -c 1 $ip; done
```

### Real-World Implementation: `CIDR.sh`
Below is a snippet demonstrating a `for` loop used to automate OSINT network range mapping. It iterates through an array of IP addresses (`$ipaddr`), queries the WHOIS database, and parses the CIDR notation.

```bash
# Identify Network range for the specified IP address(es)
function network_range {
    for ip in $ipaddr; do
        netrange=$(whois $ip | grep "NetRange\|CIDR" | tee -a CIDR.txt)
        cidr=$(whois $ip | grep "CIDR" | awk '{print $2}')
        cidr_ips=$(prips $cidr)
        
        echo -e "\nNetRange for $ip:"
        echo -e "$netrange"
    done
}
```

---

## 2. While Loops

A `while` loop is conceptually straightforward: **it executes a block of code as long as a specified condition evaluates to TRUE.** When nesting loops or implementing complex conditionals, it is crucial to maintain clean code architecture to prevent infinite loops or logic errors. A `while` loop typically relies on a counter variable or a boolean state to determine its termination point.

### Real-World Implementation: Status Polling
```bash
stat=1
while [ $stat -eq 1 ]; do
    ping -c 2 $host > /dev/null 2>&1
    if [ $? -eq 0 ]; then
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
```

### Interrupting Execution: `break` and `continue`
You can manipulate the flow inside a loop using `break` (to exit the loop entirely) and `continue` (to skip the current iteration and proceed to the next).

**`WhileBreaker.sh` Example:**
```bash
#!/bin/bash
counter=0

while [ $counter -lt 10 ]; do
    ((counter++))
    echo "Counter: $counter"
    
    if [ $counter == 2 ]; then
        continue # Skips the rest of the loop block for this iteration
    elif [ $counter == 4 ]; then
        break    # Exits the loop entirely
    fi
done
```

---

## 3. Until Loops

The `until` loop acts as the inverse of a `while` loop. **It executes a block of code as long as the specified condition evaluates to FALSE.** It continues running *until* the condition is met (becomes true).

**`Until.sh` Example:**
```bash
#!/bin/bash
counter=0

# The loop runs UNTIL the counter equals 10
until [ $counter -eq 10 ]; do
    ((counter++))
    echo "Counter: $counter"
done
```

---

## Loop Control Statements: `break` and `continue`

When writing enumeration or automation scripts, you will frequently need to alter the standard flow of a loop based on dynamic conditions (e.g., finding an open port, encountering an offline host). Bash provides two primary commands for this:

* **`break`**: Immediately terminates the current loop entirely. Execution resumes at the next command following the `done` statement. It is typically used to stop a process once a specific condition is met (e.g., stopping a brute-force loop once valid credentials are found).
* **`continue`**: Skips the remaining commands in the *current iteration* and forces the loop to proceed to the next iteration. This is extremely useful for error handling, such as bypassing an unresponsive IP in a network sweep without terminating the entire scan.

### Syntax and Example: `WhileBreaker.sh`

```bash
#!/bin/bash
counter=0

while [ $counter -lt 10 ]; do
    # Increase $counter by 1
    ((counter++))
    echo "Counter: $counter"
    
    # Condition to skip the current iteration
    if [ $counter == 2 ]; then
        echo "--> Skipping the rest of this iteration..."
        continue
        
    # Condition to kill the loop completely
    elif [ $counter == 4 ]; then
        echo "--> Break condition met. Terminating loop."
        break
    fi
done
```

**Output:**
```shellsession
MikyRedHat@htb[/htb]$ ./WhileBreaker.sh
Counter: 1
Counter: 2
--> Skipping the rest of this iteration...
Counter: 3
Counter: 4
--> Break condition met. Terminating loop.
```
---

## 4. Practical Exercise: Decryption Script

This exercise leverages a script designed to decode a base64 string and decrypt it using OpenSSL. It requires the implementation of a `for` loop to iterate through potential variables to find the correct `$salt`.

```bash
#!/bin/bash

# Decrypt function
function decrypt {
    MzSaas7k=$(echo $hash | sed 's/988sn1/83unasa/g')
    Mzns7293sk=$(echo $MzSaas7k | sed 's/4d298d/9999/g')
    MzSaas7k=$(echo $Mzns7293sk | sed 's/3i8dqos82/873h4d/g')
    Mzns7293sk=$(echo $MzSaas7k | sed 's/4n9Ls/20X/g')
    MzSaas7k=$(echo $Mzns7293sk | sed 's/912oijs01/i7gg/g')
    Mzns7293sk=$(echo $MzSaas7k | sed 's/k32jx0aa/n391s/g')
    MzSaas7k=$(echo $Mzns7293sk | sed 's/nI72n/YzF1/g')
    Mzns7293sk=$(echo $MzSaas7k | sed 's/82ns71n/2d49/g')
    MzSaas7k=$(echo $Mzns7293sk | sed 's/JGcms1a/zIm12/g')
    Mzns7293sk=$(echo $MzSaas7k | sed 's/MS9/4SIs/g')
    MzSaas7k=$(echo $Mzns7293sk | sed 's/Ymxj00Ims/Uso18/g')
    Mzns7293sk=$(echo $MzSaas7k | sed 's/sSi8Lm/Mit/g')
    MzSaas7k=$(echo $Mzns7293sk | sed 's/9su2n/43n92ka/g')
    Mzns7293sk=$(echo $MzSaas7k | sed 's/ggf3iunds/dn3i8/g')
    MzSaas7k=$(echo $Mzns7293sk | sed 's/uBz/TT0K/g')
    
    flag=$(echo $MzSaas7k | base64 -d | openssl enc -aes-128-cbc -a -d -salt -pass pass:$salt)
}

# Variables
var="9M"
salt=""
hash="VTJGc2RHVmtYMTl2ZnYyNTdUeERVRnBtQWVGNmFWWVUySG1wTXNmRi9rQT0K"

# Base64 Encoding Example:
# user@htb$ echo "Some Text" | base64

# TODO: Implement For-Loop here to populate $salt dynamically

# Check if $salt is empty
if [[ ! -z "$salt" ]]; then
    decrypt
    echo $flag
else
    exit 1
fi
```
# Flow Control: Branches & Case Statements

As previously covered in our flow control documentation, branching logic typically relies on `if-else` and `case` constructs. Having thoroughly examined `if-else` statements, we will now focus on the mechanics and implementation of `case` statements in Bash.

## Bash Case Statements

In Bash scripting, `case` statements function similarly to `switch-case` constructs found in languages like C, C++, and C#. The core difference between an `if-else` construct and a `case` statement is their evaluation method:
* `if-else` evaluates arbitrary **boolean expressions** (e.g., greater-than, less-than, or complex logical comparisons).
* `case` strictly evaluates a variable against **exact pattern matches** or string literals. 

### Syntax

The standard structure for a Bash `case` statement is as follows:

```bash
case <expression> in
    pattern_1)
        # Statements to execute if expression matches pattern_1
        statements
        ;;
    pattern_2)
        # Statements to execute if expression matches pattern_2
        statements
        ;;
    pattern_3)
        # Statements to execute if expression matches pattern_3
        statements
        ;;
    *)
        # Catch-all (default) statement
        statements
        ;;
esac
```

**Breakdown:**
* The block initiates with the `case` keyword followed by the variable (`<expression>`) to be evaluated.
* The `in` keyword introduces the patterns.
* When a pattern matches the expression, its corresponding block of `statements` is executed.
* Every statement block must be explicitly terminated with a double semicolon (`;;`).
* The `esac` keyword (`case` written backwards) closes the control block.

### Practical Implementation: `CIDR.sh`

In our `CIDR.sh` enumeration script, we leverage a `case` statement to handle user menu selections. The script defines specific execution paths based on the input provided to `read`:

```bash
# <SNIP>
# Available options menu
echo -e "Additional options available:"
echo -e "\t1) Identify the corresponding network range of the target domain."
echo -e "\t2) Ping discovered hosts."
echo -e "\t3) Execute all checks."
echo -e "\t*) Exit.\n"

read -p "Select your option: " opt

# Flow control based on user input
case $opt in
    "1") 
        network_range 
        ;;
    "2") 
        ping_host 
        ;;
    "3") 
        network_range && ping_host 
        ;;
    *) 
        exit 0 
        ;;
esac
# <SNIP>
```

**Execution Logic:**
* **Options 1 & 2:** Trigger individual, previously defined functions (`network_range` and `ping_host` respectively).
* **Option 3:** Executes both functions consecutively, utilizing the logical AND operator (`&&`) to chain the commands.
* **Catch-all (`*`):** Any input not explicitly defined acts as an exit trigger, safely terminating the script with a status code of `0`.

# Bash Scripting: Functions

## Overview
As scripts scale in complexity, managing recurring routines becomes critical. Functions modularize code, allowing us to group multiple commands into a single, reusable block enclosed in curly brackets (`{ ... }`). This approach drastically reduces script size, enhances readability, and prevents code duplication. 

Because Bash processes scripts sequentially from top to bottom, functions must always be defined *before* they are called in the execution flow.

## Defining Functions
There are two standard methods for defining functions in Bash. Both are valid, though using the `function` keyword (Method 1) is often preferred for readability.

**Method 1: Using the `function` keyword**
```bash
function name {
    <commands>
}
```

**Method 2: Using parentheses**
```bash
name() {
    <commands>
}
```

*Example from `CIDR.sh` (Method 1):*
```bash
<SNIP>
# Identify Network range for the specified IP address(es)
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
<SNIP>
```

## Function Execution
To execute a function, simply call its assigned name as if it were a standard command.

*Example execution via a case statement (`CIDR.sh`):*
```bash
<SNIP>
case $opt in
    "1") network_range ;;
    "2") ping_host ;;
    "3") network_range && ping_host ;;
    "*") exit 0 ;;
esac
```

## Parameter Passing
Functions natively accept parameters, maintaining the same structure used for passing arguments to a shell script. Inside the function, parameters are accessed using standard positional variables (`$1` to `$9`, `${n}`). Each function maintains its own isolated set of parameters, preventing collisions with the main script's arguments or other functions.

**Variable Scope Note:** Unlike many other programming languages, variables defined within a Bash function are treated as **global** by default. If you define a variable inside a function, it can be called later in the main script. To restrict a variable's scope strictly to the function, it must be explicitly declared using the `local` keyword.

*Example (`PrintPars.sh`):*
```bash
#!/bin/bash

function print_pars {
    echo $1 $2 $3
}

one="First parameter"
two="Second parameter"
three="Third parameter"

print_pars "$one" "$two" "$three"
```

*Execution:*
```shellsession
MikyRedHat@htb[/htb]$ ./PrintPars.sh
First parameter Second parameter Third parameter
```

## Return Values and Exit Codes
When a child process (such as a function) terminates, it passes a return code to the parent process (the Bash shell). This exit status informs the parent whether the execution was successful or if specific errors occurred, allowing the script to dictate the subsequent program flow.

### Standard Bash Return Codes
| Return Code | Description |
| :--- | :--- |
| `1` | General errors |
| `2` | Misuse of shell builtins |
| `126` | Command invoked cannot execute |
| `127` | Command not found |
| `128` | Invalid argument to exit |
| `128+n` | Fatal error signal "n" |
| `130` | Script terminated by Control-C |
| `255\*` | Exit status out of range |

We can capture a function's execution status using `$?` (the exit status of the last executed command) or capture its standard output by assigning it to a variable.

*Example (`Return.sh`):*
```bash
#!/bin/bash

function given_args {
    if [ $# -lt 1 ]; then
        echo -e "Number of arguments: $#"
        return 1
    else
        echo -e "Number of arguments: $#"
        return 0
    fi
}

# No arguments given
given_args
echo -e "Function status code: $?\n"

# One argument given
given_args "argument"
echo -e "Function status code: $?\n"

# Pass the function's stdout into a variable
content=$(given_args "argument")
echo -e "Content of the variable: \n\t$content"
```

*Execution:*
```shellsession
MikyRedHat@htb[/htb]$ ./Return.sh
Number of arguments: 0
Function status code: 1

Number of arguments: 1
Function status code: 0

Content of the variable: 
	Number of arguments: 1
```
