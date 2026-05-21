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
