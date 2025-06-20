import { chatAreaInit } from "./modules/chatArea.js";
import { modelInit } from "./modules/models.js";
import { navInit } from "./modules/navbar.js";
import { deinitSessionCtl } from "./modules/sessionControl.js";

document.addEventListener("DOMContentLoaded", () => {
  modelInit();
  navInit();
  chatAreaInit();
});

document.addEventListener("beforeunload", () => {
  deinitSessionCtl();
});
