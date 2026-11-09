/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { a as e, n as t } from "./agent-bake-DekR6ZC4.js";
import { t as n } from "./cloth-fields-CCGzrDE6.js";
import { t as r } from "./material-patterns-B30t3HSN.js";
import { a as i } from "./probe-trace-ALKeQrQp.js";
import { t as a } from "./mesh-uv-YEnc7okb.js";
// src/kernel-registry.js
var o = {
	lightBake: t,
	probeTrace: i,
	gridTrace: e,
	cloth: n,
	pattern: r,
	uvUnwrap: a
};
function s(e, t) {
	if (ArrayBuffer.isView(e)) t.add(e.buffer);
	else if (e && typeof e == "object") for (let n of Array.isArray(e) ? e : Object.values(e)) s(n, t);
}
function c({ name: e, args: t }) {
	try {
		let n = o[e](...t), r = /* @__PURE__ */ new Set();
		return s(n, r), {
			response: { value: n },
			transfer: [...r]
		};
	} catch (e) {
		return {
			response: { error: {
				name: e?.constructor?.name ?? "Error",
				message: String(e?.message ?? e)
			} },
			transfer: []
		};
	}
}
// src/kernel-worker.js
self.onmessage = (e) => {
	let { response: t, transfer: n } = c(e.data);
	self.postMessage(t, n);
};
