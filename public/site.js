import "./estimate-form.js";
const menu = document.querySelector(".menu-toggle"),
  nav = document.querySelector("#main-nav");
menu.hidden = false;
nav.classList.add("js-menu");
function closeMenu() {
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
  if (open) nav.querySelector("a").focus();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menu.focus();
  }
});
// Touch can blur the focused link before the toggle's click arrives. Closing
// on blur would make that same click reopen the menu instead of closing it.
document.addEventListener("click", (event) => {
  if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
});
matchMedia("(min-width: 801px)").addEventListener("change", closeMenu);
const filters = document.querySelector(".filters");
if (filters) {
  filters.hidden = false;
  filters.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    filters
      .querySelectorAll("button")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    let count = 0;
    document.querySelectorAll("[data-category]").forEach((f) => {
      f.hidden =
        button.dataset.filter !== "All" &&
        f.dataset.category !== button.dataset.filter;
      if (!f.hidden) count++;
    });
    document.querySelectorAll(".project-set").forEach((section) => {
      section.hidden = !section.querySelector("figure:not([hidden])");
    });
    document.querySelector("#gallery-status").textContent =
      `${count} photographs shown.`;
  });
}
