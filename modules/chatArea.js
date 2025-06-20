import { EVENT_SESSION_CHANGE } from "./events.js";
import { renderNode } from "./render.js";
import { activeSession } from "./sessionControl.js";

var models;

function renderNoSession() {
  const e = document.createElement("div");

  e.className = "chat-empty";

  e.innerText = "No chat session selected";

  return e;
}

function renderTitle(session) {
  const e = document.createElement("div");

  e.className = "chat-title";

  e.innerText = session.name ?? "New Session";

  return e;
}

function renderInputArea() {
  const e = document.createElement("div");

  e.className = "chat-input-area";

  const textarea = document.createElement("textarea");

  e.replaceChildren(textarea);

  return e;
}

function renderChatArea() {
  const session = activeSession();

  if (!session) {
    return renderNoSession();
  }

  return [renderTitle(session), renderInputArea()];
}

export function chatAreaInit() {
  document.addEventListener(EVENT_SESSION_CHANGE, () => {
    renderNode("main-area", renderChatArea);
  });

  fetch("http://localhost:11434/api/tags").then(async (r) => {
    const content = await r.json();

    models = content.models;

    renderNode("main-area", renderChatArea);
  });
}
