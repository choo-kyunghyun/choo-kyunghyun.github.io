"use strict";

const github_mark = document.getElementById("github-mark");

function theme_set(theme) {
    document.body.setAttribute("theme", theme);
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
        github_mark.src = "/images/github-mark-white.svg";
    } else if (theme === "light") {
        github_mark.src = "/images/github-mark.svg";
    }
}

function theme_get() {
    return localStorage.getItem("theme");
}

document.getElementById("theme-select").addEventListener("change", (event) => {
    theme_set(event.target.value);
    event.target.selectedIndex = 0;
});

theme_set(theme_get() || "dark");