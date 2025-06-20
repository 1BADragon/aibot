import {
  EVENT_CHAT_AREA_UPDATE,
  EVENT_MODELS_LOADED,
  EVENT_SESSION_CHANGE,
} from "./events.js";
import { getModels, sendChat } from "./models.js";
import { renderNode } from "./render.js";
import { activeSession } from "./sessionControl.js";

function renderNoSession() {
  const e = document.createElement("div");

  e.className = "chat-empty";

  e.innerText = "No chat session selected";

  return e;
}

function renderTitle(session) {
  const e = document.createElement("div");

  e.className = "chat-title";

  const titleArea = document.createElement("span");
  titleArea.innerText = session.name ?? "New Session";

  const modelSelect = document.createElement("select");
  modelSelect.style.maxWidth = "20vw";

  const modelChildren = _(getModels())
    .map((m) => {
      const o = document.createElement("option");
      o.value = m.name;
      o.innerText = m.name;
      return o;
    })
    .value();

  console.log(session.model);

  modelSelect.replaceChildren(...modelChildren);
  modelSelect.value = session.model;
  modelSelect.onchange = (ev) => {
    session.model = ev.target.value;

    const e = new CustomEvent(EVENT_CHAT_AREA_UPDATE);
    document.dispatchEvent(e);
  };

  e.replaceChildren(titleArea, modelSelect);

  return e;
}

function renderInputArea() {
  const e = document.createElement("div");

  e.className = "chat-input-area";

  const s = document.createElement("span");

  const textarea = document.createElement("textarea");
  const submitButton = document.createElement("button");
  submitButton.innerText = "Submit";
  submitButton.onclick = () => {
    console.log(textarea.value);
    sendChat(activeSession().model, textarea.value);
    textarea.value = "";
  };

  s.replaceChildren(textarea, submitButton);

  e.replaceChildren(s);

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

  document.addEventListener(EVENT_MODELS_LOADED, () => {
    renderNode("main-area", renderChatArea);
  });

  document.addEventListener(EVENT_CHAT_AREA_UPDATE, () => {
    renderNode("main-area", renderChatArea);
  });

  renderNode("main-area", renderChatArea);
}
