import { EVENT_SESSION_NEW } from "./events.js";
import { renderNode } from "./render.js";
import { getSessions, newSession, setSession } from "./sessionControl.js";

const openNavBarIconPath =
  "https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Chevron%20Double%20Right/SVG/ic_fluent_chevron_double_right_16_regular.svg";
const closeNavBarIconPath =
  "https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Chevron%20Double%20Left/SVG/ic_fluent_chevron_double_left_16_regular.svg";
var navBarOpen = true;

function renderSessionsListInner() {
  const list = getSessions();

  if (!list.length) {
    const s = document.createElement("span");
    s.style.display = "flex";
    s.style.justifyContent = "space-around";
    s.innerText = "No Sessions";
    return s;
  }

  return _(list)
    .sortBy((l) => l.createdOn)
    .map((session) => {
      const button = document.createElement("button");

      button.innerText = session.name ?? "New Session";
      button.onclick = () => {
        setSession(session.uuid);
      };

      return button;
    })
    .value();
}

function onNewSessionEvent() {
  renderNode("sessions-list", renderSessionsListInner);
}

function navToggleButton() {
  if (navBarOpen) {
    document.getElementById("nav").classList.remove("expanded");
    document.getElementById("nav-icon").src = openNavBarIconPath;
    navBarOpen = false;
  } else {
    document.getElementById("nav").classList.add("expanded");
    document.getElementById("nav-icon").src = closeNavBarIconPath;
    navBarOpen = true;
  }
}

export function navInit() {
  if (navBarOpen) {
    document.getElementById("nav-icon").src = closeNavBarIconPath;
    document.getElementById("nav").classList.add("expanded");
  } else {
    document.getElementById("nav-icon").src = openNavBarIconPath;
    document.getElementById("nav").classList.remove("expanded");
  }

  document
    .getElementById("nav-toggle")
    .addEventListener("click", navToggleButton);

  document
    .getElementById("new-session-button")
    .addEventListener("click", () => {
      newSession();
    });

  document.addEventListener(EVENT_SESSION_NEW, onNewSessionEvent);

  renderNode("sessions-list", renderSessionsListInner);
}
