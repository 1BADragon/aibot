/*
 * sessions are stored in local memory in the form:
 * {
 *   [uuid]: {
 *     uuid: uuid;
 *     name: string;
 *     model: strin;
 *     createdOn: Date;
 *     context: [
 *       {
 *          isUser: boolean;
 *          message: string;
 *          createdOn: Date;
 *       }
 *     ];
 *   }
 * }
 */

import {
  EVENT_SESSION_CHANGE,
  EVENT_SESSION_DELETE,
  EVENT_SESSION_NEW,
} from "./events.js";
import { LS_SESSION_ACTIVE, LS_SESSION_STORE } from "./localStoragePaths.js";
import { getModels } from "./models.js";

var sessionData = JSON.parse(localStorage.getItem(LS_SESSION_STORE) ?? "{}");
var activeSessionUuid = localStorage.getItem(LS_SESSION_ACTIVE);

if (!Object.hasOwn(sessionData, activeSessionUuid)) {
  activeSessionUuid = null;
}

export function setSession(uuid) {
  if (uuid && !Object.hasOwn(sessionData, uuid)) {
    throw Error(`Session ${uuid} does not exist`);
  }

  activeSessionUuid = uuid;

  const e = new CustomEvent(EVENT_SESSION_CHANGE, { sessionUuid: uuid });
  document.dispatchEvent(e);
}

export function getSessions() {
  return Object.values(sessionData);
}

export function activeSession() {
  if (!activeSessionUuid) {
    return null;
  }

  return sessionData[activeSessionUuid];
}

export function deleteSession(uuid) {
  delete sessionData[uuid];

  if (activeSessionUuid === uuid) {
    setSession(null);
  }

  const deleteEvent = new CustomEvent(EVENT_SESSION_DELETE);
  document.dispatchEvent(deleteEvent);
}

export function newSession() {
  const newSession = {
    uuid: crypto.randomUUID(),
    name: null,
    model: getModels()[0].name,
    createdOn: new Date(),
    context: [],
  };

  sessionData[newSession.uuid] = newSession;

  const e = new CustomEvent(EVENT_SESSION_NEW, { uuid: newSession.uuid });
  document.dispatchEvent(e);

  return newSession;
}

export function deinitSessionCtl() {
  localStorage.setItem(LS_SESSION_STORE, JSON.stringify(sessionData));
  localStorage.setItem(LS_SESSION_ACTIVE, activeSessionUuid);
}
