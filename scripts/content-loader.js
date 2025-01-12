"use strict";

// TODO: Implement sorting function
class ContentLoader {
  static async load(file, parent) {
    const data = await this.read(file);
    const fragment = document.createDocumentFragment();
    data.root.forEach((node) => {
      fragment.appendChild(this.build(node, null));
    });
    parent.appendChild(fragment);
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
}
