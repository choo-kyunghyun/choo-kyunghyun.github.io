"use strict";

function theme_set(theme) {
    document.body.setAttribute("theme", theme);
    localStorage.setItem("theme", theme);
}

function theme_get() {
    return localStorage.getItem("theme");
}

document.getElementById("theme-select").addEventListener("change", (event) => {
    theme_set(event.target.value);
    event.target.selectedIndex = 0;
});

theme_set(theme_get() || "dark");