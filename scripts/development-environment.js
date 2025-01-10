"use strict";

import { Showcase } from "/scripts/showcase.js";

class DevelopmentEnvironment extends Showcase {
  constructor(div, file) {
    super(div, file);
  }

  display() {
    this.div.innerHTML = "";
    Object.entries(this.collection).forEach(([key, items]) => {
      this.div.innerHTML += `<h2>${key}</h2>`;
      const subDiv = document.createElement("div");
      subDiv.classList.add("container");
      this.div.appendChild(subDiv);
      items.sort((a, b) => a.name.localeCompare(b.name));
      items.forEach((item) => {
        const card = document.createElement("div");
        card.innerHTML = this.card(item);
        subDiv.appendChild(card);
      });
    });
  }

  card(item) {
    return `
      <h3>${item.name}</h3>
      ${item.description ? `<p>${item.description}</p>` : ""}
    `;
  }
}

const developmentEnvironment = document.getElementById("development-environment");
const developmentEnvironmentInstance = new DevelopmentEnvironment(
  developmentEnvironment,
  developmentEnvironment.getAttribute("data-file")
);
