"use strict";

class ContentLoader {
  static #DATA_CONTENT = "data-content";
  static #DATA_TARGET = "data-target";
  static #DATA_SEARCH = "data-search";

  static async file(file, parent) {
    const response = await fetch(file);
    const data = JSON.parse(await response.text());
    parent.replaceChildren(this.load(data));
  }

  static load(data) {
    const fragment = document.createDocumentFragment();
    data.root.forEach((node) => {
      fragment.appendChild(this.build(node, null));
    });
    return fragment;
  }

  static search(rawQuery, parent) {
    const query = rawQuery.toLowerCase().trim();
    Array.from(parent.children).forEach((node) => {
      node.style.display = node.textContent.toLowerCase().includes(query)
        ? "block"
        : "none";
    });
  }

  static build(node, item) {
    if (!node.tag && node.data) {
      const fragment = document.createDocumentFragment();
      node.data.items.forEach((entry) => {
        node.data.root.forEach((dataNode) => {
          fragment.appendChild(this.build(dataNode, entry));
        });
      });
      return fragment;
    }
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
    return text.replace(/\$\{(.*?)\}/g, (match, key) => {
      const value = data[key] || "";
      return value instanceof Array ? value.join(", ") : value;
    });
  }

  static async setup() {
    const elements = document.querySelectorAll(`[${this.#DATA_CONTENT}]`);
    elements.forEach((element) => {
      this.file(element.dataset.content, element);
    });

    const sources = document.querySelectorAll(`[${this.#DATA_TARGET}]`);
    sources.forEach((source) => {
      source.addEventListener("click", async () => {
        const targets = document.querySelectorAll(source.dataset.target);
        await Promise.all(
          [...targets].map((target) => this.file(source.value, target))
        );
      });
    });

    const searches = document.querySelectorAll(`[${this.#DATA_SEARCH}]`);
    searches.forEach((search) => {
      search.addEventListener("input", () => {
        const targets = document.querySelectorAll(search.dataset.search);
        targets.forEach((target) => {
          this.search(search.value, target);
        });
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  ContentLoader.setup();
});
