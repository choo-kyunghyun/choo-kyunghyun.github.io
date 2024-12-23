"use strict";

import { Showcase } from "./showcase.js";

class Playlist extends Showcase {
    constructor(_div, _file) {
        super(_div, _file);
    }

    display() {
        this.div.innerHTML = "";
        let items = [];
        for (const item of this.collection) {
            items.push(item);
        }
        items.sort((a, b) => a.title.localeCompare(b.title));
        for (const item of items) {
            let card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <div style="background-image: url('${item.thumbnail}'); background-position: center center; background-size: cover; display: inline-block; width: 320px; height: 320px; border-radius: 0.5rem 0.5rem 0 0;"></div>
                <p style="font-weight: bold;">${item.title}</p>
                ${item.album !== null ? `<p>${item.release_year == null ? item.album : item.album + " (" + item.release_year + ")"}</p>` : ""}
                <p>${item.artists !== null ? item.artists.join(", ") : ""}</p>
                <p>${item.duration_string}</p>
                <a href="${item.url}" target="_blank"><img class="icon" src="/images/youtube-music-icon.svg" alt="YouTube Music"></a>
                <p style="display: none;">${item.tags.join(", ")}</p>
            `;
            this.div.appendChild(card);
        }
    }
}

const playlists = document.getElementById("playlists");
const playlist = new Playlist(document.getElementById("playlist"), playlists.value);

playlists.addEventListener("change", () => {
    playlist.load(playlists.value);
});

document.getElementById("search").addEventListener("input", (event) => {
    let query = event.target.value.toLowerCase();
    playlist.search(query);
});
