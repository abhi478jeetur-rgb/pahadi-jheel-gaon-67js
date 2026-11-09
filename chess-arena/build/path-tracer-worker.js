/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { r as e } from "./path-tracer-scene-DTz5cgiX.js";
import { renderBand as t } from "./path-tracer.js";
// src/path-tracer-worker.js
var n = null, r = null, i = null;
self.onmessage = (a) => {
	let o = a.data;
	if (o.type === "scene") {
		n = e(o.scene), r = o.camera, i = o.options, self.postMessage({ type: "ready" });
		return;
	}
	let s = t(n, r, i, o.rowStart, o.rowEnd);
	self.postMessage({
		type: "band",
		rowStart: o.rowStart,
		band: s
	}, Object.values(s).map((e) => e.buffer));
};
