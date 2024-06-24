# Modules
import csv
import yt_dlp

# Get metadata from YouTube URL
def get_metadata(youtube_url, cookie):
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
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        meta = ydl.extract_info(youtube_url, download=False)
    return meta

# Separate playlist URL to Video URLs
def get_playlist_videos(youtube_url, cookie):
    meta = get_metadata(youtube_url, cookie)
    return [video["url"] for video in meta["entries"]] if "entries" in meta else []

# Select thumbnail URL
def select_thumbnail(thumbnails, square):
    best_resolution = 0
    best_url = None
    for thumbnail in thumbnails:
        resolution = thumbnail.get("width", 0) * thumbnail.get("height", 0)
        if square and thumbnail.get("width") == thumbnail.get("height") and resolution > best_resolution:
            best_resolution = resolution
            best_url = thumbnail["url"]
        elif not square and resolution > best_resolution:
            best_resolution = resolution
            best_url = thumbnail["url"]
    if not best_url and square:
        best_url = select_thumbnail(thumbnails, False)
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
        "original_url": meta.get("original_url", meta.get("webpage_url")),
        "acodec": meta.get("acodec"),
        "asr": meta.get("asr"),
        "abr": meta.get("abr"),
        "audio_channels": meta.get("audio_channels"),
        "tags": meta.get("tags"),
    }
    return metadata

# Process a YouTube URL
def process_youtube_url(youtube_url, csv_writer, cookie):
    # Check if "&si=" is in the URL and remove it along with everything after it
    if "&si=" in youtube_url:
       youtube_url = youtube_url.split("&si=", 1)[0]

    # Print the YouTube URL
    print(youtube_url)

    # Extract metadata from the YouTube URL
    meta = filter_meta(get_metadata(youtube_url, cookie))

    # Write metadata to output file
    # csv_writer.writerow(meta.values())
    csv_writer.writerow([value if value is not None and value != "" else "None" for value in meta.values()])

# Set names of input and output files
input_file_name = "playlists-youtube-urls.txt"
output_file_name = "playlists.csv"
cookie_file_name = "cookie-youtube.txt"

# Block cookies
bBlockCookies = True

# Open input file
try:
    input_file = open(input_file_name, "r", encoding="utf-8")
except FileNotFoundError:
    open(input_file_name, "w").close()
    print(f"{input_file_name} created. Please add youtube video URLs to it and run the script again.")
    exit(1)

# Open output file
output_file = open(output_file_name, "a", encoding="utf-8", newline="")

# Create CSV writer
csv_writer = csv.writer(output_file)

# Check if cookie file exists
cookie = None
try:
    with open(cookie_file_name, "r"):
        cookie = cookie_file_name
except FileNotFoundError:
    pass

# Check if cookies are blocked
if bBlockCookies:
    cookie = None

# Read input file
youtube_urls = input_file.readlines()

# Count number of YouTube URLs
count = 0

# Read all lines from input file
for youtube_url in youtube_urls:
    # Remove leading and trailing whitespaces
    youtube_url = youtube_url.strip()

    # Skip empty lines
    if not youtube_url:
        continue

    # Skip comments
    if youtube_url.startswith("#"):
        continue

    # If the URL is a playlist, extract video URLs from it
    if "list=" in youtube_url:
        playlist_videos = get_playlist_videos(youtube_url, cookie)
        for video_url in playlist_videos:
            process_youtube_url(video_url, csv_writer, cookie)
            count += 1
    else:
        process_youtube_url(youtube_url, csv_writer, cookie)
        count += 1

# Print success message
print(f"Metadata extracted from {count} YouTube URLs and saved to {output_file_name}")

# Close input and output files
input_file.close()
output_file.close()
