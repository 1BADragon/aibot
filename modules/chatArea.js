import {
  EVENT_CHAT_AREA_UPDATE,
  EVENT_MODELS_LOADED,
  EVENT_SESSION_CHANGE,
  EVENT_SESSION_UPDATE,
} from "./events.js";
import { LS_MODEL_LAST_SELECTED } from "./localStoragePaths.js";
import { getModels, sendChat } from "./models.js";
import { renderNode } from "./render.js";
import { activeSession, appendToLatestChat } from "./sessionControl.js";

function parseRaw(raw) {
  const m = new marked.Marked(
    markedHighlight.markedHighlight({
      emptyLangClass: "hljs",
      langPrefix: "hljs language-",
      highlight(code, lang, info) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    }),
  );

  return m.parse(raw);
}

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

  modelSelect.replaceChildren(...modelChildren);
  modelSelect.value = session.model;
  modelSelect.onchange = (ev) => {
    session.model = ev.target.value;

    localStorage.setItem(LS_MODEL_LAST_SELECTED, ev.target.value);

    const e = new CustomEvent(EVENT_CHAT_AREA_UPDATE);
    document.dispatchEvent(e);
  };

  e.replaceChildren(titleArea, modelSelect);

  return e;
}

function renderInputArea() {
  const e = document.createElement("div");

  e.className = "chat-input-area";

  const inner = document.createElement("div");

  const textarea = document.createElement("textarea");
  textarea.autofocus = true;
  textarea.placeholder = "Whats up?";
  textarea.style.border = "none";
  textarea.style.height = "48px";
  textarea.style.outline = "none";

  textarea.onfocus = () => {
    inner.style.outline = "solid";
    inner.style.outlineColor = "lightblue";
  };

  textarea.onblur = () => {
    inner.style.outline = "none";
  };

  const doSubmitInput = async () => {
    const userInput = textarea.value;
    textarea.value = "";

    for await (const fragment of sendChat(activeSession().model, userInput)) {
      appendToLatestChat(fragment.message.content, fragment.message.role);
    }
  };

  textarea.onkeydown = (ev) => {
    if (ev.key === "Enter" && ev.shiftKey) {
      ev.preventDefault();
      ev.stopPropagation();
      doSubmitInput();
    }
  };

  const submitButton = document.createElement("button");
  submitButton.style.marginLeft = "auto";
  submitButton.innerText = "Submit";
  submitButton.onclick = doSubmitInput;

  inner.replaceChildren(textarea, submitButton);

  e.replaceChildren(inner);

  return e;
}

function createBubbleFromMessage(msg) {
  const bubble = document.createElement("div");
  bubble.classList = `chat-bubble chat-bubble-${msg.role}`;
  bubble.id = `chat-${msg.uuid}`;

  const textArea = document.createElement("div");
  textArea.innerHTML = parseRaw(msg.content);

  bubble.replaceChildren(textArea);

  return bubble;
}

function renderChat(session) {
  const outer = document.createElement("div");

  outer.id = "chat-bubble-scroll-area";
  outer.style.overflowX = "hidden";
  outer.style.overflowY = "auto";
  outer.style.height = "100%";

  const p = document.createElement("div");
  p.className = "chat-bubble-area";
  p.id = "chat-bubble-area";

  const bubbles = _(session.messages).map(createBubbleFromMessage).value();
  p.replaceChildren(...bubbles);

  requestAnimationFrame(() => {
    outer.scrollTo({ top: outer.scrollHeight, behavior: "smooth" });
  });

  outer.replaceChildren(p);

  return outer;
}

function renderChatArea() {
  const session = activeSession();

  if (!session) {
    return renderNoSession();
  }

  return [renderTitle(session), renderChat(session), renderInputArea()];
}

function renderUpdatedBubble() {
  const s = activeSession();

  if (!s.messages.length) {
    return;
  }

  const current = s.messages[s.messages.length - 1];

  const bubbleArea = document.getElementById("chat-bubble-area");

  const bubble = document.getElementById(`chat-${current.uuid}`);
  if (bubble) {
    bubble.innerHTML = parseRaw(current.content);
  } else {
    const b = createBubbleFromMessage(current);
    bubbleArea.appendChild(b);
  }

  const threshold = 20; // px tolerance
  const bubbleScrollArea = document.getElementById("chat-bubble-scroll-area");
  const doAutoScroll =
    bubbleScrollArea.scrollHeight -
      bubbleScrollArea.scrollTop -
      bubbleScrollArea.clientHeight <
    threshold;
  if (doAutoScroll) {
    requestAnimationFrame(() => {
      bubbleScrollArea.scrollTo({
        top: bubbleScrollArea.scrollHeight,
        behavior: "smooth",
      });
    });
  }
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

  document.addEventListener(EVENT_SESSION_UPDATE, () => {
    renderUpdatedBubble();
  });

  renderNode("main-area", renderChatArea);
}
