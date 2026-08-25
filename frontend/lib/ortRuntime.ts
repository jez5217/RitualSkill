"use client";

// onnxruntime-web's npm package cannot be `import()`-ed here: every entry
// point (root, "/wasm", etc.) embeds a Node-only ESM chunk that Next's
// production build tries to bundle and Terser then fails to parse
// ("'import'/'export' cannot be used outside of module code") — a known
// bundler-compatibility issue with this package, not code this project owns.
// Instead we load its prebuilt UMD bundle via a plain <script> tag (the
// pattern onnxruntime-web's own browser examples use), which keeps webpack
// from ever touching its internals. `import type` below is compile-time
// only and is erased before webpack sees this file.
import type * as OrtNS from "onnxruntime-web/wasm";

const ORT_SCRIPT_SRC = "/ort/ort.wasm.min.js";
// Must match the onnxruntime-web version pinned in package.json — used to
// point the WASM runtime loader at the matching jsdelivr build for the
// (large) actual .wasm binary; only the small JS shim above is self-hosted.
const ORT_VERSION = "1.29.0";

declare global {
  interface Window {
    ort?: typeof OrtNS;
  }
}

let ortModulePromise: Promise<typeof OrtNS> | null = null;

/** Shared by every ONNX model on this site — loads onnxruntime-web exactly once, however many models use it. */
export async function loadOrt(): Promise<typeof OrtNS> {
  if (!ortModulePromise) {
    ortModulePromise = new Promise((resolve, reject) => {
      if (window.ort) {
        resolve(window.ort);
        return;
      }
      const script = document.createElement("script");
      script.src = ORT_SCRIPT_SRC;
      script.async = true;
      script.onload = () => {
        if (!window.ort) {
          reject(new Error("onnxruntime-web script loaded but window.ort was not set"));
          return;
        }
        window.ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
        resolve(window.ort);
      };
      script.onerror = () => reject(new Error("Failed to load onnxruntime-web script"));
      document.head.appendChild(script);
    });
  }
  return ortModulePromise;
}

export type Ort = typeof OrtNS;
