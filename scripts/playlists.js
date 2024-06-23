"use strict";

const playlists = document.getElementById("playlists");
const search = document.getElementById("search");

function playlist_add(name, artists, url) {
    let card = document.createElement("div");
    let cover = document.createElement("img");
    let title = document.createElement("h3");
    let artist = document.createElement("p");
    card.classList.add("card");
    cover.src = url;
    cover.alt = name;
    cover.classList.add("logo");
    title.textContent = name;
    artist.textContent = artists.join(", ");
    card.appendChild(cover);
    card.appendChild(title);
    card.appendChild(artist);
    playlists.appendChild(card);
}

function load_csv() {
    fetch(playlists.getAttribute("url"))
        .then(response => response.text())
        .then(text => {
            let lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
            let items = lines.map(line => {
                let [name, artists, url] = line.split(",").map(element => element.trim());
                return { name, artists: artists.split(";").map(artist => artist.trim()), url };
            });
            items.sort((a, b) => {
                let comp = a.artists[0].localeCompare(b.artists[0]);
                if (comp === 0) {
                    return a.name.localeCompare(b.name);
                } else {
                    return comp;
                }
            });
            items.forEach(item => {
                playlist_add(item.name, item.artists, item.url);
            });
        });
}

search.addEventListener("input", () => {
    let query = search.value.toLowerCase();
    let cards = playlists.getElementsByClassName("card");
    for (let card of cards) {
        let title = card.getElementsByTagName("h3")[0].textContent.toLowerCase();
        let artist = card.getElementsByTagName("p")[0].textContent.toLowerCase();
        if (title.includes(query) || artist.includes(query)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    }
});

load_csv();
