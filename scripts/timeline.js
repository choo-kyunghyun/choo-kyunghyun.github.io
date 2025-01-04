"use strict";

class Event {
    constructor(name, date, description) {
        this.name = name;
        this.date = date;
        this.description = description;
    }
}

class Timeline {
    constructor(div, file) {
        this.events = [];
        this.div = div;
        this.load(file);
    }

    add(event) {
        this.events.push(event);
    }

    load(file) {
        if (!file) {
            return;
        }
        fetch(file).then((response) => response.json())
            .then((json) => {
                for (let year in json) {
                    for (let month in json[year]) {
                        for (let day in json[year][month]) {
                            let date = new Date(year, month - 1, day);
                            for (let event of json[year][month][day]) {
                                this.add(new Event(event.title, date, event.description));
                            }
                        }
                    }
                }
            })
            .then(() => {
                this.draw();
            })
            .catch((error) => console.error(error));
    }

    draw() {
        this.div.innerHTML = "";
        for (let event of this.events) {
            let container = document.createElement("div");
            container.classList.add("alert");
            let year = event.date.getFullYear();
            let month = String(event.date.getMonth() + 1).padStart(2, '0');
            let day = String(event.date.getDate()).padStart(2, '0');
            container.innerHTML = `
                <h3 style="width: 8rem;">${year}-${month}-${day}</h3>
                <div>
                    <h4>${event.name}</h4>
                    <p>${event.description}</p>
                </div>
            `;
            this.div.appendChild(container);
        }
    }
}

const div = document.getElementById("timeline");
let timeline = new Timeline(div, div.getAttribute("data-file"));
