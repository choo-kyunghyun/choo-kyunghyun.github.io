"use strict";

import { Showcase } from "/scripts/showcase.js";

class Wardrobe extends Showcase {
  constructor(div, file) {
    super(div, file);
  }

  card(item) {
    return `
          <img src="${item.img}" alt="TF2" class="logo">
          <p>${item.items[0]}</p>
          <p>${item.items[1]}</p>
          <p>${item.items[2]}</p>
        `;
  }
}

const div = document.getElementById("wardrobe");
const wardrobe = new Wardrobe(div, div.getAttribute("data-file"));
