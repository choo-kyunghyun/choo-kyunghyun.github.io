"use strict";

import { Showcase } from "/scripts/showcase.js";

class ItemShowcase extends Showcase {
  constructor(div, file) {
    super(div, file);
  }

  display() {
    this.collection.sort((a, b) => a.name.localeCompare(b.name));
    super.display();
  }

  card(item) {
    return `
          <h3>${item.name}</h3>
          ${item.description ? `<p>${item.description}</p>` : ""}
        `;
  }
}

const hardware = document.getElementById("hardware");
const software = document.getElementById("software");
const hardwareInstance = new ItemShowcase(
  hardware,
  hardware.getAttribute("data-file")
);
const softwareInstance = new ItemShowcase(
  software,
  software.getAttribute("data-file")
);
