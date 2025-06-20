import { EVENT_MODELS_LOADED } from "./events.js";

var models;

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

export function sendChat(modelName, context) {
  fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: modelName,
      prompt: context,
    }),
  }).then((response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    function processChunk({ done, value }) {
      if (done) {
        if (buffer) console.log("Final line:", buffer); // leftover line
        return;
      }

      buffer += decoder.decode(value, { stream: true });

      let lines = buffer.split("\n");
      buffer = lines.pop(); // save incomplete line for next chunk

      for (const line of lines) {
        console.log("Line:", JSON.parse(line).response);
      }

      return reader.read().then(processChunk);
    }

    return reader.read().then(processChunk);
  });
}
