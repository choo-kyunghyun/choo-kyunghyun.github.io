"use strict";

export class Showcase {
  constructor(div, file) {
    this.collection = [];
    this.div = div;
    this.load(file);
  }

  async load(file) {
    try {
      const response = await fetch(file);
      this.collection = await response.json();
      this.display();
    } catch (error) {
      console.error("Failed to load file:", error);
    }
  }

  display() {
    this.div.innerHTML = "";
    if (Array.isArray(this.collection)) {
      this.collection.forEach((item) => {
        const card = document.createElement("div");
        card.innerHTML = this.card(item);
        this.div.appendChild(card);
      });
    } else {
      console.error("Collection is not an array.");
    }
  }

  card(item) {
    return `<p>Override this method in a subclass.</p>`;
  }

  search(query) {
    const lowerCaseQuery = query.toLowerCase();
    Array.from(this.div.children).forEach((item) => {
      item.style.display = item.textContent
        .toLowerCase()
        .includes(lowerCaseQuery)
        ? "block"
        : "none";
    });
  }

  sort(compareFunction) {
    this.collection.sort(compareFunction);
    this.display();
  }
}
