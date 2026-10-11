import { type CoalitionRequest, winningCoalitionPage } from "./coalition-page";

self.onmessage = (event: MessageEvent<CoalitionRequest>) => {
  self.postMessage(winningCoalitionPage(event.data));
};
