"use strict";

export class Showcase {
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
        let items = [];
        for (const item of this.collection) {
            items.push(item);
        }
        for (const item of items) {
            let card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <p>Override this method in a subclass.</p>
            `;
            this.div.appendChild(card);
        }
    }

    search(query) {
        let cards = this.div.getElementsByClassName("card");
        for (let card of cards) {
            let context = card.textContent.toLowerCase();
            card.style.display = context.includes(query) ? "block" : "none";
        }
    }
}
