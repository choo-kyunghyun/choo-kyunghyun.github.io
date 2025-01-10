"use strict";

import { Showcase } from "/scripts/showcase.js";

class Playlist extends Showcase {
  constructor(div, file) {
    super(div, file);
  }

  display() {
    this.collection.sort((a, b) => a.channel.localeCompare(b.channel));
    super.display();
  }

  card(item) {
    const albumInfo = item.album
      ? `${item.album}${item.release_year ? ` (${item.release_year})` : ""}`
      : "";
    const artists = item.artists ? item.artists.join(", ") : "";
    const tags = item.tags.join(", ");
    return `
          <div style="background-image: url('${
            item.thumbnail
          }'); background-position: center; background-size: cover; width: 320px; height: 320px; border-radius: 0.5rem 0.5rem 0 0;"></div>
          <p style="font-weight: bold;">${item.title}</p>
          ${albumInfo ? `<p>${albumInfo}</p>` : ""}
          <p>${artists}</p>
          <p>${item.duration_string}</p>
          <p><a href="${
            item.url
          }" target="_blank"><img class="icon" src="/images/play.svg" alt="YouTube Music"></a></p>
          <p style="display: none;">${tags}</p>
        `;
  }
}

const playlists = document.getElementById("playlists");
const playlist = new Playlist(
  document.getElementById("playlist"),
  playlists.value
);

playlists.addEventListener("change", () => playlist.load(playlists.value));
document
  .getElementById("search")
  .addEventListener("input", (event) => playlist.search(event.target.value));
