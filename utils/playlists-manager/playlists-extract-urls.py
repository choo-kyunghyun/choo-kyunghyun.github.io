# Modules
import csv

# Constants
input_path = "playlists.csv"
output_path = "playlists-urls.txt"
col = 6

# Open output file
output_file = open(output_path, "a", encoding="utf-8")

# Read CSV file
with open(input_path, "r", encoding="utf-8") as file:
    reader = csv.reader(file)
    for row in reader:
        if len(row) > col:
            output_file.write(row[col] + "\n")

# Close output file
output_file.close()

# End of file
print("Done!")
