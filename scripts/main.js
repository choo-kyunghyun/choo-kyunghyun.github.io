"use strict";

// Get the GitHub mark element
const github_mark = document.getElementById("github-mark");

// Set theme and save to local storage
function theme_set(theme) {
    // Set the theme
    document.body.setAttribute("theme", theme);
    // Save the theme to local storage
    localStorage.setItem("theme", theme);
    // Change the GitHub mark color
    if (theme === "dark") {
        github_mark.src = "/images/github-mark-white.svg";
    } else if (theme === "light") {
        github_mark.src = "/images/github-mark.svg";
    }
}

// Get theme from local storage
function theme_get() {
    return localStorage.getItem("theme");
}

// Theme selector event listener
document.getElementById("theme-select").addEventListener("change", (event) => {
    theme_set(event.target.value);
    event.target.selectedIndex = 0;
});

// Set the theme on page load
theme_set(theme_get() || "dark");
