# Import required libraries
from datetime import datetime, timezone

# Convert ISO 8601 date to Unix timestamp
def iso8601_to_unix(iso8601):
    if iso8601 == "Session":
        return 0
    return int(datetime.strptime(iso8601, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=timezone.utc).timestamp())

# Convert T/F to boolean
def str_to_bool(str):
    if str == "✓":
        return "TRUE"
    else:
        return "FALSE"

# Add dot to the front of the domain
def add_dot(domain):
    if domain.startswith("."):
        return domain
    return "." + domain

# File names
cookie_file_name = "cookie-youtube.txt"
input_file_name = "cookie-chrome.txt"

# Open the input file
try:
    input = open(input_file_name, "r", encoding="utf-8")
except FileNotFoundError:
    open(input_file_name, "w").close()
    print(f"{input_file_name} created. Please paste the cookie data in it and run the script again.")
    exit(1)

# Open the cookie file
cookie_file = open(cookie_file_name, "a", encoding="utf-8")
cookie_file.write("# Netscape HTTP Cookie File\n")

# Read the input file
lines = input.readlines()

# Process each line
for line in lines:
    # Skip empty lines
    if not line:
        continue

    # Split line into parts
    parts = line.split("\t")

    # Extract cookie parts
    name = parts[0]
    value = parts[1]
    domain = add_dot(parts[2])
    path = parts[3]
    expires = iso8601_to_unix(parts[4])
    http_only = str_to_bool(parts[6])

    # Write cookie to file
    cookie_file.write(f"{domain}\tTRUE\t{path}\t{http_only}\t{expires}\t{name}\t{value}\n")

# Close the input file
input.close()

# Close the cookie file
cookie_file.close()

# Print success message
print(f"Cookie written to {cookie_file_name}")
print("Note that # Netscape HTTP Cookie File comment is required for the cookie to work.")
print("The input order is: name, value, domain, path, expires, secure, httponly, session, sameSite")
print("The output order is: domain, flag, path, secure, expiration, name, value")
