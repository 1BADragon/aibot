import { chatAreaInit } from "./modules/chatArea.js";
import { navInit } from "./modules/navbar.js";
import { deinitSessionCtl } from "./modules/sessionControl.js";

document.addEventListener("DOMContentLoaded", () => {
  navInit();
  chatAreaInit();
});

document.addEventListener("beforeunload", () => {
  deinitSessionCtl();
});
