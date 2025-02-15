"use strict";

class Curator {
  constructor(div) {
    this.div = div;
    this.fields = ["textContent", "attributes", "children", "data"];
    this.tags = ["div", "h1", "h2", "h3", "p", "span", "img"];
    this.data = {
      header: {
        name: "",
        description: "",
        author: "",
        date: "",
      },
      root: [],
    };

    this.setup();
  }

  createButton(text, handler, className = "") {
    const btn = document.createElement("button");
    btn.textContent = text;
    if (className) btn.className = className;
    btn.addEventListener("click", handler);
    return btn;
  }

  renderHeader() {
    const fragment = document.createDocumentFragment();
    for (const [key, value] of Object.entries(this.data.header)) {
      const label = document.createElement("label");
      label.textContent = key;

      const input = document.createElement("input");
      input.placeholder = "value";
      input.value = value;
      input.addEventListener("input", () => {
        this.data.header[key] = input.value;
      });

      const p = document.createElement("p");
      p.appendChild(label);
      p.appendChild(input);
      fragment.appendChild(p);
    }

    const header = document.getElementById("header");
    header.replaceChildren(fragment);
  }

  renderLayoutTag(node) {
    const tag = document.createElement("p");
    tag.textContent = "tag: " + node.tag;
    return tag;
  }

  renderLayoutTextContent(node) {
    const label = document.createElement("label");
    label.textContent = "textContent";

    const input = document.createElement("input");
    input.placeholder = "value";
    input.value = node.textContent;
    input.addEventListener("input", () => {
      node.textContent = input.value;
    });

    const remove = this.createButton(
      "Remove",
      () => {
        delete node.textContent;
        this.renderLayout();
      },
      "warning"
    );

    const p = document.createElement("p");
    p.appendChild(label);
    p.appendChild(input);
    p.appendChild(remove);
    return p;
  }

  renderLayoutAttributes(node) {
    const remove = this.createButton(
      "Remove",
      () => {
        delete node.attributes;
        this.renderLayout();
      },
      "warning"
    );

    const fragment = document.createDocumentFragment();
    for (const [key, value] of Object.entries(node.attributes)) {
      const label = document.createElement("label");
      label.textContent = key;

      const input = document.createElement("input");
      input.placeholder = "value";
      input.value = value;
      input.addEventListener("input", () => {
        node.attributes[key] = input.value;
      });

      const removeAttr = this.createButton(
        "Remove",
        () => {
          delete node.attributes[key];
          this.renderLayout();
        },
        "warning"
      );

      const attribute = document.createElement("p");
      attribute.appendChild(label);
      attribute.appendChild(input);
      attribute.appendChild(removeAttr);
      fragment.appendChild(attribute);
    }

    const key = document.createElement("input");
    key.placeholder = "key";

    const add = this.createButton("Add", () => {
      if (!key.value) return;
      node.attributes[key.value] = "value";
      this.renderLayout();
    });

    const div = document.createElement("div");
    div.className = "alert";
    div.textContent = "attributes";
    div.appendChild(remove);
    div.appendChild(fragment);
    div.appendChild(key);
    div.appendChild(add);
    return div;
  }

  renderLayoutChildren(node) {
    const remove = this.createButton(
      "Remove",
      () => {
        delete node.children;
        this.renderLayout();
      },
      "warning"
    );

    const children = document.createElement("div");
    node.children.forEach((child) => {
      const removeChild = this.createButton(
        "Remove",
        () => {
          node.children = node.children.filter((item) => item !== child);
          this.renderLayout();
        },
        "warning"
      );

      const element = this.renderLayoutElement(child);
      element.appendChild(removeChild);
      children.appendChild(element);
    });

    const p = document.createElement("p");
    this.tags.forEach((tag) => {
      const button = this.createButton(tag, () => {
        node.children.push({ tag });
        this.renderLayout();
      });
      p.appendChild(button);
    });

    const div = document.createElement("div");
    div.className = "alert";
    div.textContent = "children";
    div.appendChild(remove);
    div.appendChild(children);
    div.appendChild(p);
    return div;
  }

  renderLayoutData(node) {
    const remove = document.createElement("button");
    remove.textContent = "Remove";
    remove.className = "warning";
    remove.addEventListener("click", () => {
      delete node.data;
      this.renderLayout();
    });

    const choose = document.createElement("button");
    choose.textContent = "Choose";
    choose.addEventListener("click", () => {
      this.renderContent(node.data);
    });

    const children = document.createElement("div");
    node.data.root.forEach((child) => {
      const remove = document.createElement("button");
      remove.textContent = "Remove";
      remove.className = "warning";
      remove.addEventListener("click", () => {
        node.data.root = node.data.root.filter((item) => item !== child);
        this.renderLayout();
      });

      const element = this.renderLayoutElement(child);
      element.appendChild(remove);
      children.appendChild(element);
    });

    const p = document.createElement("p");
    this.tags.forEach((tag) => {
      const button = document.createElement("button");
      button.textContent = tag;
      button.addEventListener("click", () => {
        node.data.root.push({ tag });
        this.renderLayout();
      });
      p.appendChild(button);
    });

    const div = document.createElement("div");
    div.className = "alert";
    div.textContent = "data";
    div.appendChild(remove);
    div.appendChild(choose);
    div.appendChild(children);
    div.appendChild(p);
    return div;
  }

  renderLayoutElement(node) {
    const element = document.createElement("div");
    element.className = "alert";
    element.appendChild(this.renderLayoutTag(node));
    if (node.textContent) {
      element.appendChild(this.renderLayoutTextContent(node));
    }
    if (node.attributes) {
      element.appendChild(this.renderLayoutAttributes(node));
    }
    if (node.children) {
      element.appendChild(this.renderLayoutChildren(node));
    }
    if (node.data) {
      element.appendChild(this.renderLayoutData(node));
    }

    const p = document.createElement("p");
    this.fields.forEach((field) => {
      if (field in node) return;
      const button = document.createElement("button");
      button.textContent = field;
      button.addEventListener("click", () => {
        if (field === "textContent") {
          node.textContent = "value";
        } else if (field === "attributes") {
          node.attributes = {};
        } else if (field === "children") {
          node.children = [];
        } else if (field === "data") {
          node.data = { root: [], items: [] };
        }
        this.renderLayout();
      });
      p.appendChild(button);
    });
    element.appendChild(p);
    return element;
  }

  renderLayout() {
    const fragment = document.createDocumentFragment();
    this.data.root.forEach((item) => {
      const remove = document.createElement("button");
      remove.textContent = "Remove";
      remove.className = "warning";
      remove.addEventListener("click", () => {
        this.data.root = this.data.root.filter((element) => element !== item);
        this.renderLayout();
      });

      const element = this.renderLayoutElement(item);
      element.appendChild(remove);
      fragment.appendChild(element);
    });

    const p = document.createElement("p");
    this.tags.forEach((tag) => {
      const button = document.createElement("button");
      button.textContent = tag;
      button.addEventListener("click", () => {
        this.data.root.push({ tag });
        this.renderLayout();
      });
      p.appendChild(button);
    });
    fragment.appendChild(p);

    const layout = document.getElementById("layout");
    layout.replaceChildren(fragment);
  }

  extractTemplates(node) {
    let variables = [];
    if (typeof node === "string") {
      const regex = /\${(.*?)}/g;
      const matches = node.match(regex);
      if (matches) {
        variables = matches.map((match) => match.slice(2, -1));
      }
    } else if (Array.isArray(node)) {
      node.forEach((item) => {
        variables = [...variables, ...this.extractTemplates(item)];
      });
    } else if (typeof node === "object") {
      for (const [key, value] of Object.entries(node)) {
        variables = [...variables, ...this.extractTemplates(value)];
      }
    }
    return variables;
  }

  renderContent(data) {
    const fragment = document.createDocumentFragment();
    const variables = this.extractTemplates(data);
    data.items.forEach((item) => {
      const element = document.createElement("div");
      element.className = "alert";
      for (const [key, value] of Object.entries(item)) {
        const label = document.createElement("label");
        label.textContent = key;

        const input = document.createElement("input");
        input.placeholder = "value";
        input.value = value;
        input.addEventListener("input", () => {
          item[key] = input.value;
        });

        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.className = "warning";
        remove.addEventListener("click", () => {
          delete item[key];
          this.renderContent(data);
        });

        const p = document.createElement("p");
        p.appendChild(label);
        p.appendChild(input);
        if (!variables.includes(key)) {
          p.appendChild(remove);
        }
        element.appendChild(p);
      }

      variables.forEach((variable) => {
        if (!(variable in item)) {
          const label = document.createElement("label");
          label.textContent = variable;

          const input = document.createElement("input");
          input.placeholder = "value";
          input.addEventListener("input", () => {
            item[variable] = input.value;
          });

          const p = document.createElement("p");
          p.appendChild(label);
          p.appendChild(input);
          element.appendChild(p);
        }
      });

      const remove = document.createElement("button");
      remove.textContent = "Remove";
      remove.className = "warning";
      remove.addEventListener("click", () => {
        data.items = data.items.filter((element) => element !== item);
        this.renderContent(data);
      });
      element.appendChild(remove);

      fragment.appendChild(element);
    });

    const add = document.createElement("button");
    add.textContent = "Add";
    add.addEventListener("click", () => {
      data.items.push({});
      this.renderContent(data);
    });
    fragment.appendChild(add);

    const content = document.getElementById("content");
    content.replaceChildren(fragment);
  }

  save() {
    const filename = `${this.data.header.name}-${this.data.header.date}.json`;
    const blob = new Blob([JSON.stringify(this.data)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  load(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      this.data = JSON.parse(event.target.result);
      this.renderHeader();
      this.renderLayout();
    };
    reader.readAsText(file);
  }

  example() {
    this.data = {
      header: {
        name: "Kitchen Items",
        description: "A list of kitchen items",
        author: "John Doe",
        date: new Date().toISOString(),
      },
      root: [
        {
          tag: "h2",
          textContent: "Kitchen Items",
        },
        {
          tag: "div",
          attributes: { class: "box" },
          data: {
            root: [
              {
                tag: "div",
                children: [
                  { tag: "h3", textContent: "${name}" },
                  { tag: "p", textContent: "${description}" },
                ],
              },
            ],
            items: [
              { name: "Cooking pot", description: "A pot for cooking" },
              { name: "Frying pan", description: "A pan for frying" },
              { name: "Cutting board", description: "A board for cutting" },
            ],
          },
        },
      ],
    };
  }

  setup() {
    const hHeader = document.createElement("h3");
    hHeader.textContent = "Header";

    const header = document.createElement("div");
    header.id = "header";

    const hLayout = document.createElement("h3");
    hLayout.textContent = "Layout";

    const layout = document.createElement("div");
    layout.id = "layout";

    const hContent = document.createElement("h3");
    hContent.textContent = "Content";

    const content = document.createElement("div");
    content.id = "content";

    const save = document.createElement("button");
    save.textContent = "Save";
    save.addEventListener("click", () => {
      this.save();
    });

    const file = document.createElement("input");
    file.type = "file";
    file.accept = ".json";
    file.style.display = "none";
    file.addEventListener("change", (event) => {
      this.load(event.target.files[0]);
    });

    const load = document.createElement("button");
    load.textContent = "Load";
    load.addEventListener("click", () => {
      file.click();
    });

    this.div.appendChild(save);
    this.div.appendChild(file);
    this.div.appendChild(load);
    this.div.appendChild(hHeader);
    this.div.appendChild(header);
    this.div.appendChild(hLayout);
    this.div.appendChild(layout);
    this.div.appendChild(hContent);
    this.div.appendChild(content);

    this.example();
    this.renderHeader();
    this.renderLayout();
  }
}

const curator = new Curator(document.getElementById("curator"));
