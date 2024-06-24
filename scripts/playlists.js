"use strict";

// Get playlists and search bar
const playlists = document.getElementById("playlists");
const search = document.getElementById("search");

// Add playlist card
function playlist_add(_track, _artists, _album, _release_year, _duration_string, _thumbnail, _url, _acodec, _asr, _abr, _audio_channels, _tags) {
    // Create track
    let track = document.createElement("p");
    track.style.fontWeight = "bold";
    track.textContent = _track;
    // Create artists
    let artists = document.createElement("p");
    artists.textContent = _artists.join(", ");
    // Create album
    let album = document.createElement("p");
    if (_release_year === "None") {
        album.textContent = _album;
    } else {
        album.textContent = _album + " (" + _release_year + ")";
    }
    // Create duration
    let duration = document.createElement("p");
    duration.textContent = _duration_string;
    // Create thumbnail
    let thumbnail = document.createElement("img");
    thumbnail.classList.add("logo");
    thumbnail.src = _thumbnail;
    thumbnail.alt = _track;
    // Create icon
    let icon = document.createElement("img");
    icon.classList.add("icon");
    icon.src = "/images/youtube-music-icon.svg";
    icon.alt = "YouTube Music";
    // Create url
    let url = document.createElement("a");
    url.href = _url;
    url.target = "_blank";
    // Add icon to link
    url.appendChild(icon);
    // Create tags
    let tags = document.createElement("p");
    tags.textContent = _tags.join(", ");
    tags.style.display = "none";
    // Create card
    let card = document.createElement("div");
    card.classList.add("card");
    // Add elements to card
    card.appendChild(thumbnail);
    card.appendChild(track);
    if (_album === "None") {
        album.remove();
    } else {
        card.appendChild(album);
    }
    card.appendChild(artists);
    card.appendChild(duration);
    card.appendChild(url);
    card.appendChild(tags);
    // Add card to playlists
    playlists.appendChild(card);
}

// Parse CSV
function parse_csv_line(line) {
    const regex = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\")|([^,]+)/g;
    let matches = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
        matches.push(match[1] ? match[1].replace(/\"\"/g, '"') : match[2]);
    }
    return matches;
}

// Parse CSV list
function convert_list(field) {
    // Check if field is empty
    if (field === "None") {
        return [];
    }
    // Remove [ and ] from field
    field = field.substring(1, field.length - 1);
    // Split field by comma
    let items = field.split(",").map(item => item.trim()).filter(item => item.length > 0);
    // Remove single quotes of beginning and end of items
    items = items.map(item => item.replace(/^'/, "").replace(/'$/, ""));
    // Return items
    return items;
}

// Process CSV
function process_csv(text) {
    let lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    let items = lines.map(line => {
        let [track, artists, album, release_year, duration_string, thumbnail, url, acodec, asr, abr, audio_channels, tags] = parse_csv_line(line);
        artists = convert_list(artists);
        tags = convert_list(tags);
        return { track, artists, album, release_year, duration_string, thumbnail, url, acodec, asr, abr, audio_channels, tags };
    });
    return items;
}

// Load playlists from CSV
function load_csv() {
    // Fetch CSV
    fetch(playlists.getAttribute("url"))
        // Parse CSV
        .then(response => response.text())
        .then(text => {
            // Parse CSV lines
            let items = process_csv(text);
            // Sort items
            items.sort((a, b) => {
                let cmp = a.artists[0].localeCompare(b.artists[0]);
                if (cmp === 0) {
                    return a.track.localeCompare(b.track);
                } else {
                    return cmp;
                }
            });
            // Add items to playlists
            items.forEach(item => {
                playlist_add(item.track, item.artists, item.album, item.release_year, item.duration_string, item.thumbnail, item.url, item.acodec, item.asr, item.abr, item.audio_channels, item.tags);
            });
        });
}

// Search playlists
search.addEventListener("input", () => {
    let query = search.value.toLowerCase();
    let cards = playlists.getElementsByClassName("card");
    for (let card of cards) {
        let keywords = card.getElementsByTagName("p");
        let found = false;
        for (let keyword of keywords) {
            if (keyword.textContent.toLowerCase().includes(query)) {
                found = true;
                break;
            }
        }
        if (found) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    }
});

// Load playlists
load_csv();
