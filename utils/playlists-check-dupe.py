# Modules
import csv

# Constants
file_path = "playlists.csv"
cols = [6]

# Open the file
try:
    file = open(file_path, mode="r", encoding="utf-8")
except FileNotFoundError:
    print("File not found.")
    exit(1)

# Main variables
seen_sets = {col: set() for col in cols}
duplicated_rows = set()
reader = csv.reader(file)

# Read the file
for row_num, row in enumerate(reader, start=1):
    for col in cols:
        if len(row) > col:
            if row[col] in seen_sets[col]:
                duplicated_rows.add((row_num, tuple(row)))
            else:
                seen_sets[col].add(row[col])

# Close the file
file.close()

# Print the results
if len(duplicated_rows) == 0:
    print("No duplicated rows found.")
else:
    print("Duplicated rows:")
    for row_num, row in duplicated_rows:
        print(f"Row {row_num}: {row}")
