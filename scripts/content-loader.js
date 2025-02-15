"use strict";

class ContentLoader {
  static async file(file, parent) {
    try {
      const data = await this.read(file);
      parent.appendChild(this.load(data));
    } catch (error) {
      console.error("Failed to load data from file:", file);
    }
  }

  static load(data) {
    const fragment = document.createDocumentFragment();
    data.root.forEach((node) => {
      fragment.appendChild(this.build(node, null));
    });
    return fragment;
  }

  static search(rawQuery, parent) {
    const query = rawQuery.toLowerCase();
    Array.from(parent.children).forEach((node) => {
      node.style.display = node.textContent.toLowerCase().includes(query)
        ? "block"
        : "none";
    });
  }

  static async read(file) {
    try {
      const response = await fetch(file);
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static build(node, item) {
    const element = document.createElement(node.tag || "div");
    if (node.textContent) {
      element.textContent = this.renderTemplate(node.textContent, item);
    }
    if (node.attributes) {
      for (const [key, value] of Object.entries(node.attributes)) {
        element.setAttribute(key, this.renderTemplate(value, item));
      }
    }
    if (node.children) {
      node.children.forEach((child) => {
        element.appendChild(this.build(child, item));
      });
    }
    if (node.data) {
      node.data.items.forEach((entry) => {
        node.data.root.forEach((node) => {
          element.appendChild(this.build(node, entry));
        });
      });
    }
    return element;
  }

  static renderTemplate(text, data) {
    if (!data) return text;
    return text.replace(/\$\{(.*?)\}/g, (match, p1) => {
      const value = data[p1] || "";
      return value instanceof Array ? value.join(", ") : value;
    });
  }

  static async setup() {
    const elements = document.querySelectorAll("[data-content]");
    elements.forEach(async (element) => {
      await ContentLoader.file(element.dataset.content, element);
    });

    const sources = document.querySelectorAll("[data-target]");
    sources.forEach((source) => {
      source.addEventListener("change", async () => {
        const targets = document.querySelectorAll(source.dataset.target);
        targets.forEach(async (target) => {
          target.replaceChildren();
          console.log(source.value, target);
          await ContentLoader.file(source.value, target);
        });
      });
    });

    const search = document.querySelectorAll("[data-search]");
    search.forEach((search) => {
      search.addEventListener("input", () => {
        const targets = document.querySelectorAll(
          `${search.dataset.search} > .box`
        );
        targets.forEach((target) => {
          ContentLoader.search(search.value, target);
        });
      });
    });

    const externals = document.querySelectorAll("[data-external]");
    externals.forEach((external) => {
      external.addEventListener("change", async () => {
        const target = document.querySelector(external.dataset.external);
        target.replaceChildren();
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = JSON.parse(e.target.result);
          target.appendChild(this.load(data));
        };
        reader.readAsText(external.files[0]);
      });
    });
  }

  static sort(parent, attribute, order = "asc") {
    const fragment = document.createDocumentFragment();
    const children = Array.from(parent.children);
    children.sort((a, b) => {
      const valueA = a.querySelector(`[data-${attribute}]`).textContent;
      const valueB = b.querySelector(`[data-${attribute}]`).textContent;
      return order === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
    children.forEach((child) => {
      fragment.appendChild(child);
    });
    parent.replaceChildren();
    parent.appendChild(fragment);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await ContentLoader.setup();
});
