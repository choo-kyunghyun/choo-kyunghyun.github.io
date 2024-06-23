# Modules
import sys
import yt_dlp

# Check the YouTube URL is playlist or not
def is_playlist(youtube_url):
    return "list=" in youtube_url

# Separate playlist URL to Video URLs
def extract_playlist_videos(youtube_url):
    ydl_opts = {
        'quiet': True,
        'simulate': True,
        'extract_flat': True,
        'skip_download': True,
        'force_generic_extractor': True,
        'extractor_args': {
            'youtube': {
                'youtube_include_dash_manifest': False
            }
        }
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        meta = ydl.extract_info(youtube_url, download=False)
    return [video['url'] for video in meta['entries']] if 'entries' in meta else []

# Extract video metadata from a YouTube URL
def extract_video_meta(youtube_url):
    ydl_opts = {
        'quiet': True,
        'simulate': True,
        'extract_flat': True,
        'skip_download': True,
        'force_generic_extractor': True,
        'extractor_args': {
            'youtube': {
                'youtube_include_dash_manifest': False
            }
        }
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        meta = ydl.extract_info(youtube_url, download=False)
    return meta

# Select highest resolution square thumbnail
def select_square_thumbnail(thumbnails):
    highest_resolution = 0
    selected_thumbnail_url = None
    for thumbnail in thumbnails:
        if thumbnail.get('width') == thumbnail.get('height'):
            resolution = thumbnail.get('width', 0) * thumbnail.get('height', 0)
            if resolution > highest_resolution:
                highest_resolution = resolution
                selected_thumbnail_url = thumbnail['url']
    return selected_thumbnail_url

# Extract necessary metadata
def extract_necessary_meta(meta, youtube_url):
    necessary_meta = {
        'track': meta.get('track'),
        'artists': meta.get('artists'),
        'album': meta.get('album'),
        'release_year': meta.get('release_year'),
        'duration_string': meta.get('duration_string'),
        'thumbnail': select_square_thumbnail(meta.get('thumbnails')),
        'url': youtube_url,
        'original_url': meta.get('webpage_url'),
        'acodec': meta.get('acodec'),
        'asr': meta.get('asr'),
        'abr': meta.get('abr'),
        'audio_channels': meta.get('audio_channels'),
        'tags': meta.get('tags'),
    }
    return necessary_meta

# Extract metadata from YouTube URLs and return as CSV string
def extract_metadata(youtube_url):
    # Extract video metadata from a YouTube URL
    meta = extract_video_meta(youtube_url)

    # Select required metadata fields
    selected_meta = extract_necessary_meta(meta, youtube_url)

    # If any field have ',' character, cover it with double quotes
    for key, value in selected_meta.items():
        value_str = str(value)
        if "," in value_str and not value_str.startswith('"') and not value_str.endswith('"'):
            selected_meta[key] = f'"{value_str}"'

    # Convert selected_meta to CSV string
    csv_line = ','.join(str(value) for value in selected_meta.values())

    # Return metadata as CSV string
    return csv_line

# Process a YouTube URL
def process_youtube_url(youtube_url, output_file):
    # Check if "&si=" is in the URL and remove it along with everything after it
    if '&si=' in youtube_url:
        youtube_url = youtube_url.split('&si=', 1)[0]

    # Print the YouTube URL
    print(youtube_url)

    # Extract metadata from the YouTube URL
    csv_line = extract_metadata(youtube_url)

    # Write metadata to output file
    output_file.write(f"{csv_line}\n")

# Set names of input and output files
input_file_name = "playlists-youtube-urls.txt"
output_file_name = "playlists.csv"

# Open input file
try:
    input_file = open(input_file_name, "r", encoding="utf-8")
except FileNotFoundError:
    open(input_file_name, "w").close()
    print(f"{input_file_name} created. Please add youtube video URLs to it and run the script again.")
    sys.exit(1)

# Open output file
output_file = open(output_file_name, "a", encoding="utf-8")

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
    if is_playlist(youtube_url):
        playlist_videos = extract_playlist_videos(youtube_url)
        for video_url in playlist_videos:
            process_youtube_url(video_url, output_file)
            count += 1
    else:
        process_youtube_url(youtube_url, output_file)
        count += 1

# Print success message
print(f"Metadata extracted from {count} YouTube URLs and saved to {output_file_name}")

# Close input and output files
input_file.close()
output_file.close()

# Exit the script
sys.exit(0)
