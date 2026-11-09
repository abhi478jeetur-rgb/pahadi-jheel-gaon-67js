/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/kernel-offload.js
var e = {
	RangeError,
	TypeError,
	SyntaxError,
	ReferenceError
}, t = 256, n = null, r = null, i = 16, a = {
	worker: 0,
	page: 0,
	inline: 0,
	fallbacks: []
};
function o() {
	return {
		worker: a.worker,
		page: a.page,
		inline: a.inline,
		fallbacks: a.fallbacks.map((e) => ({ ...e }))
	};
}
function s() {
	a.worker = 0, a.page = 0, a.inline = 0, a.fallbacks = [];
}
function c(e, t) {
	a.fallbacks.length < i && a.fallbacks.push({
		kernel: e,
		reason: t
	}), C() && console.warn(`67js kernel fallback: ${e} ran inline (${t}).`);
}
function l(e, t) {
	return a.inline++, e(...t);
}
var u = class {
	constructor(e) {
		this.job = e;
	}
};
function d(e) {
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
var f = [16777619, 2246822507];
function p() {
	return {
		states: [2166136261, 2538058380],
		length: 0
	};
}
function m(e, t) {
	for (let n = 0; n < t.length; n++) for (let r = 0; r < 2; r++) e.states[r] = Math.imul(e.states[r] ^ t[n], f[r]) >>> 0;
	e.length += t.length;
}
var h = new TextEncoder();
function g(e, t) {
	m(e, h.encode(t));
}
function _(e, t, n) {
	return g(e, `${t}=`), v(e, n);
}
function v(e, t) {
	if (t == null || typeof t == "boolean" || typeof t == "number" || typeof t == "string") return g(e, `${typeof t}:${String(t)};`), !0;
	if (ArrayBuffer.isView(t)) return g(e, `${t.constructor.name}:${t.byteLength};`), m(e, new Uint8Array(t.buffer, t.byteOffset, t.byteLength)), !0;
	if (typeof ImageData == "function" && t instanceof ImageData) return g(e, `ImageData:${t.width}x${t.height}:${t.colorSpace};`), v(e, t.data);
	if (Array.isArray(t)) return g(e, `[${t.length}:`), t.every((t) => v(e, t));
	if (typeof t == "object" && d(t)) {
		let n = Object.keys(t);
		return g(e, `{${n.length}:`), n.every((n) => _(e, n, t[n]));
	}
	return !1;
}
function y(e, t) {
	let n = p();
	return g(n, `${e}:`), v(n, t) ? `${e}:${n.length}:${n.states.map((e) => e.toString(16)).join("")}` : null;
}
function b(e, t, r) {
	if (!n) return l(r, t);
	let i = y(e, t);
	if (i === null) return c(e, "its input is not plain data"), l(r, t);
	if (n.inlineAll || n.inlineKeys.has(i)) return l(r, t);
	if (n.results.has(i)) {
		let e = n.results.get(i);
		if (e.thrown) throw e.thrown;
		return e.value;
	}
	throw new u({
		name: e,
		args: t,
		key: i
	});
}
function x({ name: t, message: n }) {
	return new (e[t] ?? Error)(n);
}
function S() {
	return new Worker(new URL("./kernel-worker.js", import.meta.url), { type: "module" });
}
function C() {
	return typeof Worker == "function";
}
function w(e) {
	return e.reason ?? new DOMException("The build was cancelled.", "AbortError");
}
function T(e, t, n) {
	return new Promise((r, i) => {
		let a = () => n?.removeEventListener("abort", o), o = () => {
			a(), i(w(n));
		};
		n?.addEventListener("abort", o, { once: !0 }), e.onmessage = (e) => {
			a(), r(e.data);
		}, e.onerror = (e) => {
			a(), i(/* @__PURE__ */ Error(`Kernel worker failed: ${e.message}`));
		};
		try {
			e.postMessage({
				name: t.name,
				args: t.args
			});
		} catch (e) {
			a(), i(e);
		}
	});
}
async function E(e, { createWorker: r = S, signal: i, available: a = C(), pageKernels: o } = {}) {
	if (!a || n) return e();
	let s = {
		results: /* @__PURE__ */ new Map(),
		inlineKeys: /* @__PURE__ */ new Set(),
		inlineAll: !1,
		deferrals: 0
	}, l = null;
	try {
		for (;;) {
			if (i?.aborted) throw w(i);
			n = s;
			try {
				return e();
			} catch (e) {
				if (!(e instanceof u)) throw e;
				if (n = null, s.deferrals++, s.deferrals > t && !s.inlineAll && (s.inlineAll = !0, c(e.job.name, "the build asked for more kernels than any scene holds")), await D(s, o, e.job)) continue;
				l ??= O(r), await k(s, l, e.job, i);
			} finally {
				n = null;
			}
		}
	} finally {
		l?.terminate();
	}
}
async function D(e, t, n) {
	let r = t?.[n.name];
	if (!r?.accepts(n.args)) return !1;
	try {
		return e.results.set(n.key, { value: await r.compute(n.args) }), a.page++, !0;
	} catch (e) {
		return c(n.name, `the page kernel failed: ${e.message}`), !1;
	}
}
function O(e) {
	try {
		return e();
	} catch (e) {
		return r = e.message, null;
	}
}
async function k(e, t, n, i) {
	if (!t) {
		e.inlineKeys.add(n.key), c(n.name, `the worker could not start: ${r}`);
		return;
	}
	let o;
	try {
		o = await T(t, n, i);
	} catch (t) {
		if (i?.aborted) throw t;
		e.inlineKeys.add(n.key), c(n.name, `the worker failed: ${t.message}`);
		return;
	}
	a.worker++, e.results.set(n.key, o.error ? { thrown: x(o.error) } : { value: o.value });
}
export { s as a, C as i, E as n, b as o, o as r, u as t };
