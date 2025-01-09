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

  async load(file) {
    try {
      const response = await fetch(file);
      const json = await response.json();
      for (let year in json) {
        for (let month in json[year]) {
          for (let day in json[year][month]) {
            let date = new Date(year, month - 1, day);
            for (let event of json[year][month][day]) {
              this.events.push(new Event(event.title, date, event.description));
            }
          }
        }
      }
      this.events.sort((a, b) => a.date - b.date);
      this.display();
    } catch (error) {
      console.error("Failed to load file:", error);
    }
  }

  display() {
    this.div.innerHTML = "";
    this.events.forEach((event) => {
      const container = document.createElement("div");
      container.classList.add("alert");
      const year = event.date.getFullYear();
      const month = String(event.date.getMonth() + 1).padStart(2, "0");
      const day = String(event.date.getDate()).padStart(2, "0");
      container.innerHTML = `
              <h3 style="width: 8rem;">${year}-${month}-${day}</h3>
              <div>
                  <h4>${event.name}</h4>
                  <p>${event.description}</p>
              </div>
            `;
      this.div.appendChild(container);
    });
  }
}

const div = document.getElementById("timeline");
const timeline = new Timeline(div, div.getAttribute("data-file"));
