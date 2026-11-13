import { initializeComparisons } from "./project-comparison.js";
initializeComparisons();
const menu = document.querySelector(".menu-toggle"),
  nav = document.querySelector("#main-nav");
menu.hidden = false;
nav.classList.add("js-menu");
function closeMenu() {
  closeDropdown();
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
  if (open) nav.querySelector("a").focus();
});
const dropdown = document.querySelector('.ref-dropdown');
const dropdownToggle = document.querySelector('.ref-dropdown-toggle');
function closeDropdown() {
  dropdown?.classList.remove('is-open');
  dropdownToggle?.setAttribute('aria-expanded', 'false');
}
function openDropdown() {
  dropdown.classList.add('is-open');
  dropdownToggle.setAttribute('aria-expanded', 'true');
}
if (dropdown) {
  dropdown.classList.add('is-enhanced');
  dropdownToggle.hidden = false;
  dropdownToggle.addEventListener('click', () => {
    if (dropdownToggle.getAttribute('aria-expanded') === 'true') closeDropdown();
    else openDropdown();
  });
  dropdown.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && matchMedia('(min-width:1024px)').matches) openDropdown();
  });
  dropdown.addEventListener('pointerleave', () => {
    if (!dropdown.contains(document.activeElement)) closeDropdown();
  });
  document.addEventListener('focusin', event => {
    if (!dropdown.contains(event.target)) closeDropdown();
  });
  document.addEventListener('click', event => { if (!dropdown.contains(event.target)) closeDropdown(); });
}
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (dropdownToggle?.getAttribute('aria-expanded') === 'true') {
    closeDropdown(); dropdownToggle.focus();
  } else if (menu.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menu.focus();
  }
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
const tablist = document.querySelector('.ref-tabs');
if (tablist) {
  const tabs = [...tablist.querySelectorAll('[role=tab]')];
  const panels = [...document.querySelectorAll('.ref-step-panel')];
  function selectStep(index, focus = false) {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; panels[i].hidden = i !== index; });
    if (focus) tabs[index].focus();
  }
  tablist.hidden = false;
  selectStep(0);
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectStep(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectStep(next, true); }
    });
  });
}
// Touch can blur the focused link before the toggle's click arrives. Closing
// on blur would make that same click reopen the menu instead of closing it.
document.addEventListener("click", (event) => {
  if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
});
matchMedia("(min-width: 1024px)").addEventListener("change", closeMenu);
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
