"use strict";

// Track class
class Track {
    constructor(_track, _artists, _album, _year, _duration, _thumbnail, _url, _tags) {
        this.track = _track;
        this.artists = _artists;
        this.album = _album;
        this.year = _year;
        this.duration = _duration;
        this.thumbnail = _thumbnail;
        this.url = _url;
        this.tags = _tags;
    }

    card() {
        let card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <img class="logo" src="${this.thumbnail}" alt="${this.track}">
            <p style="font-weight: bold;">${this.track}</p>
            ${this.album !== "None" ? `<p>${this.year == "None" ? this.album : this.album + " (" + this.year + ")"}</p>` : ""}
            <p>${this.artists.join(", ")}</p>
            <p>${this.duration}</p>
            <a href="${this.url}" target="_blank"><img class="icon" src="/images/youtube-music-icon.svg" alt="YouTube Music"></a>
            <p style="display: none;">${this.tags.join(", ")}</p>
        `;
        return card;
    }
}

// Playlist class
class Playlist {
    constructor(_url, _showcase) {
        this.tracks = [];
        this.artists = new Map();
        this.showcase = _showcase;
        this.parse(_url);
    }

    add(track) {
        this.tracks.push(track);
        track.artists.forEach(artist => {
            if (this.artists.has(artist)) {
                this.artists.set(artist, this.artists.get(artist) + 1);
            } else {
                this.artists.set(artist, 1);
            }
        });
    }

    sort() {
        this.tracks.sort((a, b) => {
            let cmp = a.artists[0].localeCompare(b.artists[0]);
            if (cmp === 0) {
                return a.track.localeCompare(b.track);
            }
            return cmp;
        });
        this.artists = new Map([...this.artists.entries()].sort((a, b) => b[0] - a[0]));
    }

    convert_list(_string) {
        const regex = /,\s*(?=(?:[^']*'[^']*')*[^']*$)/;
        const quote = /^'|'$/g;
        return _string.slice(1, -1).split(regex).map(item => item.replace(quote, "").trim());
    }

    parse(_url) {
        const regex = /(?:"([^"]*(?:""[^"]*)*)")|([^,]+)/g;
        this.showcase.innerHTML = "";
        this.tracks = [];
        this.artists = new Map();
        fetch(_url)
            .then(response => response.text())
            .then(text => {
                let lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
                lines.forEach(line => {
                    let [track, artists, album, year, duration, thumbnail, url, tags] = [...line.matchAll(regex)].map(match => match[1] ? match[1].replace(/""/g, '"') : match[2]);
                    this.add(new Track(track, this.convert_list(artists), album, year, duration, thumbnail, url, this.convert_list(tags)));
                });
            })
            .then(() => {
                this.sort();
                this.tracks.forEach(track => {
                    this.showcase.appendChild(track.card());
                });
            })
            .catch(error => console.error(error));
    }
}

// Playlist instance
const playlists = document.getElementById("playlists");
const playlist = new Playlist(playlists.value, document.getElementById("playlist"));

// Change playlist
playlists.addEventListener("change", () => {
    playlist.parse(playlists.value);
});

// Search playlist
document.getElementById("search").addEventListener("input", (event) => {
    let query = event.target.value.toLowerCase();
    let cards = playlist.showcase.getElementsByClassName("card");
    for (let card of cards) {
        let context = card.textContent.toLowerCase();
        card.style.display = context.includes(query) ? "block" : "none";
    }
});
