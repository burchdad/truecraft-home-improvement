import { validateInquiry, projectTypes } from "./validation.js";
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
const form = document.querySelector("#inquiry");
if (form) {
  const check = document.querySelector("#check-details");
  check.hidden = false;
  const method = form.elements.method,
    contact = form.elements.contact;
  method.addEventListener("change", () => {
    contact.value = "";
    contact.type = method.value === "email" ? "email" : "tel";
    contact.autocomplete = method.value === "email" ? "email" : "tel";
    document.querySelector('label[for="contact"]').textContent =
      method.value === "email" ? "Email address" : "Phone number";
    contact.removeAttribute("aria-invalid");
    document.querySelector("#contact-error").textContent = "";
    document.querySelector("#form-status").textContent = "";
  });
  const project = new URLSearchParams(location.search).get("project");
  if (projectTypes.includes(project)) form.elements.project.value = project;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document.querySelector("#form-status").textContent =
      "Preview only, not connected. Nothing was sent or saved.";
  });
  check.addEventListener("click", () => {
    const { errors } = validateInquiry(Object.fromEntries(new FormData(form)));
    const summary = document.querySelector("#error-summary");
    summary.replaceChildren();
    form.querySelectorAll(".field-error").forEach((e) => (e.textContent = ""));
    form
      .querySelectorAll("[aria-invalid]")
      .forEach((e) => e.removeAttribute("aria-invalid"));
    const keys = Object.keys(errors);
    summary.hidden = !keys.length;
    const status = document.querySelector("#form-status");
    status.textContent = "";
    if (keys.length) {
      const heading = document.createElement("strong");
      heading.textContent = "Please check these details:";
      summary.append(heading);
      const list = document.createElement("ul");
      summary.append(list);
      keys.forEach((key) => {
        const control = form.elements[key];
        if (!control) return;
        control.setAttribute("aria-invalid", "true");
        document.getElementById(`${key}-error`).textContent = errors[key];
        const li = document.createElement("li"),
          a = document.createElement("a");
        a.href = `#${key}`;
        a.textContent = `${document.querySelector(`label[for="${key}"]`).textContent}: ${errors[key]}`;
        li.append(a);
        list.append(li);
      });
      summary.focus();
    } else {
      status.textContent =
        "Details checked locally. Nothing was sent or saved. Online inquiries are not connected; please call (903) 275-0361.";
    }
  });
}
