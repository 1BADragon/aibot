import { EVENT_MODELS_LOADED } from "./events.js";
import { activeSession, appendToLatestChat } from "./sessionControl.js";

var models;
var requestsInProgress = 0;

export function requestInProgress() {
  return requestsInProgress > 0;
}

export function getModels() {
  return models;
}

export function modelInit() {
  fetch("http://localhost:11434/api/tags").then(async (r) => {
    const content = await r.json();

    models = content.models;

    const e = new CustomEvent(EVENT_MODELS_LOADED);
    document.dispatchEvent(e);
  });
}

export async function* sendChat(modelName, userInput) {
  appendToLatestChat(userInput, "user");

  requestsInProgress += 1;

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    body: JSON.stringify({
      model: modelName,
      messages: activeSession().messages,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // incomplete line

    for (const line of lines) {
      yield JSON.parse(line);
    }
  }

  if (buffer) {
    yield JSON.parse(buffer);
  }

  requestsInProgress -= 1;
}
