"use strict";

class Showcase {
    constructor(_div, _file) {
        this.collection = [];
        this.div = _div;
        this.load(_file);
    }

    load(_file) {
        if (!_file) {
            return;
        }
        fetch(_file).then((response) => response.json())
            .then((json) => this.collection = json)
            .then(() => {
                this.display();
            })
            .catch((error) => console.error(error));
    }

    display() {
        this.div.innerHTML = "";
        let count = 0;
        let items = [];
        for (const item of this.collection) {
            items.push(item);
            count++;
        }
        console.log(count + " items loaded.");
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
const showcase = new Showcase(document.getElementById("playlist"), playlists.value);

playlists.addEventListener("change", () => {
    showcase.load(playlists.value);
});

document.getElementById("search").addEventListener("input", (event) => {
    let query = event.target.value.toLowerCase();
    let cards = showcase.div.getElementsByClassName("card");
    for (let card of cards) {
        let context = card.textContent.toLowerCase();
        card.style.display = context.includes(query) ? "block" : "none";
    }
});
