import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});

// Set up global DOM environment
globalThis.window = dom.window as unknown as Window & typeof globalThis;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;

// Copy all window properties to global
Object.keys(dom.window).forEach((key) => {
  if (!(key in globalThis)) {
    (globalThis as Record<string, unknown>)[key] = (
      dom.window as unknown as Record<string, unknown>
    )[key];
  }
});

// React 18+ needs these
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
