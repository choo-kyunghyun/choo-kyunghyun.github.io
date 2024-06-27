# Modules
import os
import csv
import yt_dlp
import ctypes
import threading
import tkinter as tk
from tkinter import ttk
from datetime import datetime, timezone

# Run the command in a separate thread
def run_command(target, *args):
    threading.Thread(target=target, args=args).start()

# Print the output to the text widget
def print_output(text):
    output_text.insert(tk.END, text)
    output_text.see(tk.END)

# Get metadata from YouTube URL
def get_metadata(youtube_url, cookie):
    # Options
    ydl_opts = {
        "quiet": True,
        "simulate": True,
        "extract_flat": True,
        "skip_download": True,
        "force_generic_extractor": True,
        "extractor_args": {
            "youtube": {
                "youtube_include_dash_manifest": False
            }
        },
        "cookiefile": cookie,
    }
    # Extract metadata
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            meta = ydl.extract_info(youtube_url, download=False)
    except yt_dlp.utils.DownloadError as e:
        print_output(f"Error: {e}\n")
        return {}
    # Return metadata
    return meta

# Separate playlist URL to Video URLs
def get_playlist_videos(youtube_url, cookie):
    # Get metadata
    meta = get_metadata(youtube_url, cookie)
    # Return video URLs
    return [video["url"] for video in meta["entries"]] if "entries" in meta else []

# Select thumbnail URL
def select_thumbnail(thumbnails, square):
    # Variables
    best_resolution = 0
    best_url = None
    # Select thumbnail
    for thumbnail in thumbnails:
        resolution = thumbnail.get("width", 0) * thumbnail.get("height", 0)
        if square and thumbnail.get("width") == thumbnail.get("height") and resolution > best_resolution:
            best_resolution = resolution
            best_url = thumbnail["url"]
        elif not square and resolution > best_resolution:
            best_resolution = resolution
            best_url = thumbnail["url"]
    # Recursive call if no square thumbnail found
    if not best_url and square:
        best_url = select_thumbnail(thumbnails, False)
    # Return best thumbnail URL
    return best_url

# Filter metadata fields
def filter_meta(meta):
    metadata = {
        "track": meta.get("track", meta.get("title")),
        "artists": meta.get("artists", [meta.get("uploader")]),
        "album": meta.get("album"),
        "release_year": meta.get("release_year"),
        "duration_string": meta.get("duration_string"),
        "thumbnail": select_thumbnail(meta.get("thumbnails"), True),
        "url": meta.get("original_url", meta.get("webpage_url")),
        "tags": meta.get("tags"),
    }
    return metadata

# Process a YouTube URL
def process_youtube_url(youtube_url, csv_writer, cookie):
    # Check if "&si=" is in the URL and remove it along with everything after it
    if "&si=" in youtube_url:
       youtube_url = youtube_url.split("&si=", 1)[0]
    # Print the YouTube URL
    print_output(youtube_url + "\n")
    # Extract metadata from the YouTube URL
    meta = filter_meta(get_metadata(youtube_url, cookie))
    # Write metadata to output file
    csv_writer.writerow([value if value is not None and value != "" else "None" for value in meta.values()])

# Generate playlists
def generate_playlists(path_urls, path_cookie, path_playlists, blockCookie):
    # Open the input file
    try:
        file_urls = open(path_urls, "r", encoding="utf-8")
    except FileNotFoundError:
        print_output(f"Please add the YouTube URLs to {path_urls} and run again.\n")
        return
    # Check the cookie
    if blockCookie:
        path_cookie = None
    else:
        try:
            open(path_cookie, "r", encoding="utf-8")
        except FileNotFoundError:
            print_output(f"{path_cookie} not found. Please add the cookie file and run again.\n")
            return
    
    # Open the playlists file
    file_playlists = open(path_playlists, "a", encoding="utf-8", newline="")
    csv_writer = csv.writer(file_playlists)
    # Ready to count
    count = 0
    # Process each URL
    for url in file_urls.readlines():
        # Strip the URL
        url = url.strip()
        # Skip empty lines
        if not url:
            continue
        # Skip comments
        if url.startswith("#"):
            continue
        # If it is a playlist URL, extract video URLs
        if "list=" in url:
            for video_url in get_playlist_videos(url, path_cookie):
                try:
                    process_youtube_url(video_url, csv_writer, path_cookie)
                    count += 1
                except:
                    pass
        # If it is a video URL, process it
        else:
            try:
                process_youtube_url(url, csv_writer, path_cookie)
                count += 1
            except:
                pass
    # Close the files
    file_urls.close()
    file_playlists.close()
    # Print success message
    print_output(f"Metadata of {count} videos extracted and saved to {path_playlists}.\n")
    # Return the count
    return count

# Extract URLs
def extract_urls(path_playlists, path_youtube_urls, col):
    # Open the playlists file
    try:
        file_playlists = open(path_playlists, "r", encoding="utf-8")
    except FileNotFoundError:
        print_output(f"Playlists file not found.\n")
        return
    # Create the reader
    reader = csv.reader(file_playlists)
    # Ready to count
    count = 0
    # Open the output file
    file_youtube_urls = open(path_youtube_urls, "a", encoding="utf-8")
    # Read the playlists file
    for row in reader:
        if len(row) > col:
            file_youtube_urls.write(row[col] + "\n")
            count += 1
    # Close the files
    file_playlists.close()
    file_youtube_urls.close()
    # Print success message
    print_output(f"Metadata of {count} videos extracted and saved to {path_youtube_urls}.\n")
    # Return the count
    return count

# Check duplicates
def check_duplicates(path_playlists, cols):
    # Open the playlists file
    try:
        file_playlists = open(path_playlists, "r", encoding="utf-8")
    except FileNotFoundError:
        print_output(f"Playlists file not found.\n")
        return
    # Create the reader
    reader = csv.reader(file_playlists)
    # Main variables
    seen_sets = {col: set() for col in cols}
    duplicated_rows = set()
    # Read the playlists file
    for row_num, row in enumerate(reader, start=1):
        for col in cols:
            if len(row) > col:
                if row[col] in seen_sets[col]:
                    duplicated_rows.add((row_num, tuple(row[col] for col in cols if len(row) > col)))
                else:
                    seen_sets[col].add(row[col])
    # Close the file
    file_playlists.close()
    # Count the number of duplicated rows
    duplicated_rows = list(duplicated_rows)
    # Print the results
    if len(duplicated_rows) == 0:
        print_output("No duplicated rows found.\n")
    else:
        print_output("Duplicated rows:\n")
        for row_num, row in duplicated_rows:
            print_output(f"Row {row_num}: {row}\n")
        print_output(f"Total: {len(duplicated_rows)} duplicated rows.\n")
    # Return the count
    return len(duplicated_rows)

# Add dot to the front of the domain
def add_dot(domain):
    if domain.startswith("."):
        return domain
    return "." + domain

# Convert T/F to boolean
def str_to_bool(str):
    if str == "✓":
        return "TRUE"
    else:
        return "FALSE"
    
# Convert ISO 8601 to Unix timestamp
def iso8601_to_unix(iso8601):
    if iso8601 == "Session":
        return "0"
    return str(int(datetime.fromisoformat(iso8601).replace(tzinfo=timezone.utc).timestamp()))

# Cookie Converter
def cookie_converter(path_cookie_chrome, path_cookie):
    # Open the input file
    try:
        input_file = open(path_cookie_chrome, "r", encoding="utf-8")
    except FileNotFoundError:
        print_output(f"{path_cookie_chrome} not found. Please add the Chrome cookie file and run again.\n")
        return
    # Open the cookie file
    cookie_file = open(path_cookie, "a", encoding="utf-8")
    cookie_file.write("# Netscape HTTP Cookie File\n")
    # Read the input file
    lines = input_file.readlines()
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
    # Close the files
    input_file.close()
    cookie_file.close()
    # Print success message
    print_output(f"Cookie data extracted and saved to {path_cookie}.\n")

# Open the text file with default application
def open_text_file(file_path):
    try:
        os.startfile(file_path)
    except FileNotFoundError:
        open(file_path, "a").close()
        open_text_file(file_path)
    except:
        pass

# File paths
path_playlists = "playlists.csv"
path_cookie = "cookie-youtube.txt"
path_youtube_urls = "playlists-youtube-urls.txt"
path_cookie_chrome = "cookie-chrome.txt"

# Windows Scaling
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
except:
    pass

# Root
root = tk.Tk()
root.title("Playlists Manager")
root.geometry("800x600")
root.configure(bg="#0d1117")

# Styles
style = ttk.Style()
style.theme_create("dark", parent="alt", settings={
    "TNotebook": {
        "configure": {
            "tabmargins": [2, 5, 2, 0],
            "background": "#0d1117"
        }
    },
    "TNotebook.Tab": {
        "configure": {
            "padding": [8, 10],
            "background": "#0d1117",
            "foreground": "#c9d1d9",
            "font": ("Arial", 12)
        },
        "map": {
            "background": [("selected", "#58a6ff")],
            "expand": [("selected", [1, 1, 1, 0])]
        },
    }
})

# Apply style
style.theme_use("dark")

# Title
title = tk.Label(root, text="Playlists Manager", font=("Arial", 24), bg="#0d1117", fg="#c9d1d9")
title.pack(pady=16)

# Container of tabs
notebook = ttk.Notebook(root)
notebook.pack(fill="both", expand=True)

# Generate tab
tab_generate = tk.Frame(notebook, bg="#0d1117")
notebook.add(tab_generate, text="Generate")

# Add cookie block checkbox for generate tab
blockCookie = tk.BooleanVar()
chk_block_cookie = tk.Checkbutton(tab_generate, text="Block Cookie", variable=blockCookie, onvalue=True, offvalue=False, bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
chk_block_cookie.pack(pady=16)

# Add open urls button for generate tab
btn_open_urls = tk.Button(tab_generate, text="Open YouTube URLs", command=lambda: run_command(open_text_file, path_youtube_urls), bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
btn_open_urls.pack(pady=16)

# Add generate button for generate tab
btn_generate = tk.Button(tab_generate, text="Generate Playlists", command=lambda: run_command(generate_playlists, path_youtube_urls, path_cookie, path_playlists, blockCookie.get()), bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
btn_generate.pack(pady=16)

# Add open playlists button for generate tab
btn_open_playlists = tk.Button(tab_generate, text="Open Playlists", command=lambda: run_command(open_text_file, path_playlists), bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
btn_open_playlists.pack(pady=16)

# Extract URLs tab
tab_extract = tk.Frame(notebook, bg="#0d1117")
notebook.add(tab_extract, text="Extract URLs")

# Add extract button for extract tab
btn_extract = tk.Button(tab_extract, text="Extract URLs", command=lambda: run_command(extract_urls, path_playlists, path_youtube_urls, 6), bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
btn_extract.pack(pady=16)

# Add open urls button for extract tab
btn_open_urls = tk.Button(tab_extract, text="Open YouTube URLs", command=lambda: run_command(open_text_file, path_youtube_urls), bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
btn_open_urls.pack(pady=16)

# Check duplicates tab
tab_check = tk.Frame(notebook, bg="#0d1117")
notebook.add(tab_check, text="Check Duplicates")

# Add check button for check tab
btn_check = tk.Button(tab_check, text="Check Duplicates", command=lambda: run_command(check_duplicates, path_playlists, [6]), bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
btn_check.pack(pady=16)

# Add check duplicates title for check tab
btn_check = tk.Button(tab_check, text="Check Duplicates Titles", command=lambda: run_command(check_duplicates, path_playlists, [0]), bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
btn_check.pack(pady=16)

# Cookie Converter tab
tab_cookie = tk.Frame(notebook, bg="#0d1117")
notebook.add(tab_cookie, text="Cookie Converter")

# Add open chrome cookie button for check tab
btn_open_cookie = tk.Button(tab_cookie, text="Open Chrome Cookie", command=lambda: run_command(open_text_file, path_cookie_chrome), bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
btn_open_cookie.pack(pady=16)

# Add convert cookie button for cookie tab
btn_convert_cookie = tk.Button(tab_cookie, text="Convert Cookie", command=lambda: run_command(cookie_converter, path_cookie_chrome, path_cookie), bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
btn_convert_cookie.pack(pady=16)

# Add open cookie button for cookie tab
btn_open_cookie = tk.Button(tab_cookie, text="Open Cookie", command=lambda: run_command(open_text_file, path_cookie), bg="#0d1117", fg="#c9d1d9", font=("Arial", 12))
btn_open_cookie.pack(pady=16)

# Add Output widget
output_text = tk.Text(root, bg="#0d1117", fg="#c9d1d9", font=("Arial", 12), wrap="word")
output_text.pack(fill="both", expand=True)

# Main loop
root.mainloop()
