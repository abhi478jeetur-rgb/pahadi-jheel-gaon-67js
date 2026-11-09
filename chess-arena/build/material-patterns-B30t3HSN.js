/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./rolldown-runtime-CvuOiBwx.js";
import { d as t, f as n, m as r, p as i, u as a } from "./agent-scene-capabilities-BGAS_VVR.js";
import { a as o, c as s, d as c, f as l, i as u, l as d, n as f, o as p, r as m, s as h, t as g, u as _ } from "./material-texture-kit-DIh3eyE-.js";
import { o as v } from "./kernel-offload-CFdSENYy.js";
// src/material-graph.js
var y = 1e6, b = 2147483647, x = 24, S = 64, ee = 6, te = 8, ne = 3;
function C(e) {
	return /* @__PURE__ */ TypeError(`Material graph: ${e}`);
}
function re(e) {
	let t = e.length > x ? `${e.slice(0, x)}...` : e;
	return JSON.stringify(t);
}
function w(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return !1;
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
function ie(e, t, n) {
	for (let r of Object.keys(e)) if (!t.includes(r)) throw C(`${n} does not take ${re(r)}; fields: ${t.join(", ")}.`);
}
function T(e, t, n, r) {
	if (!Number.isInteger(e) || e < t || e > n) throw C(`${r} must be a whole number from ${t} to ${n}.`);
	return e;
}
function E(e, t, n) {
	if (typeof e != "string" || !t.includes(e)) throw C(`${n} must be one of ${t.join(", ")}.`);
	return e;
}
function D(e) {
	return typeof e == "number" && Number.isFinite(e) && Math.abs(e) <= y;
}
var O = (e) => ({
	kind: "scalar",
	evaluate: e
}), k = (e, t, n) => ({
	kind: "vector",
	parts: [
		e,
		t,
		n
	]
}), ae = (e) => e.kind === "vector" ? e.parts : [
	e.evaluate,
	e.evaluate,
	e.evaluate
];
function A(e, t) {
	if (e.every((e) => e.kind === "scalar")) {
		let [n, r, i] = e.map((e) => e.evaluate);
		return O((e, a) => t(n(e, a), r?.(e, a), i?.(e, a)));
	}
	let [n, r, i] = e.map(ae), a = (e) => (a, o) => t(n[e](a, o), r?.[e](a, o), i?.[e](a, o));
	return k(a(0), a(1), a(2));
}
var j = (e) => Number.isFinite(e) ? e : 0, M = (e) => e - Math.floor(e), N = (e, t, n) => e + (t - e) * n, oe = /* @__PURE__ */ new Map([
	["add", [2, (e, t) => e + t]],
	["sub", [2, (e, t) => e - t]],
	["mul", [2, (e, t) => e * t]],
	["div", [2, (e, t) => t === 0 ? 0 : e / t]],
	["min", [2, (e, t) => Math.min(e, t)]],
	["max", [2, (e, t) => Math.max(e, t)]],
	["pow", [2, (e, t) => Math.abs(e) ** Math.min(Math.max(t, -16), 16)]],
	["abs", [1, Math.abs]],
	["floor", [1, Math.floor]],
	["fract", [1, M]],
	["sqrt", [1, (e) => Math.sqrt(Math.max(e, 0))]],
	["invert", [1, (e) => 1 - e]],
	["clamp", [3, (e, t, n) => Math.min(Math.max(e, t), Math.max(t, n))]],
	["smoothstep", [3, (e, t, n) => e === t ? n < e ? 0 : 1 : c(e, t, n)]],
	["mix", [3, N]]
]);
function se(e) {
	let t = E(e.uv, [
		"u",
		"v",
		"both"
	], "uv");
	if (Object.keys(e).length !== 1) throw C("uv takes no other fields.");
	return t === "u" ? O((e) => e) : t === "v" ? O((e, t) => t) : k((e) => e, (e, t) => t, () => 0);
}
function P(e, t, n) {
	if (e.at === void 0) return [(e) => e, (e, t) => t];
	let r = W(e.at, t, n + 1);
	if (r.kind !== "vector") throw C("\"at\" needs a vector such as {\"uv\":\"both\"}.");
	return r.parts;
}
function F(e, t, n) {
	let r = e[t];
	if (!w(r) || Object.keys(e).length !== 1) throw C(`${t} takes { ${n.join(", ")} } and nothing else.`);
	return ie(r, n, t), r;
}
var I = 3735928580, L = (e, t) => e << t | e >>> 32 - t, ce = .6616, le = .5, ue = 2;
function de(e, t) {
	let n = I + e >>> 0, r = I + t >>> 0, i = I;
	return i = (i ^ r) - L(r, 14), n = ((n ^ i) >>> 0) - L(i, 11), r = ((r ^ n) >>> 0) - L(n, 25), i = ((i ^ r) >>> 0) - L(r, 16), n = ((n ^ i) >>> 0) - L(i, 4), r = ((r ^ n) >>> 0) - L(n, 14), i = ((i ^ r) >>> 0) - L(r, 24), i >>> 0;
}
function R(e, t, n) {
	let r = e & 7, i = r < 4 ? t : n, a = 2 * (r < 4 ? n : t);
	return (r & 1 ? -i : i) + (r & 2 ? -a : a);
}
var z = (e) => e * e * e * (e * (e * 6 - 15) + 10);
function B(e, t, n) {
	return n === 0 ? de(e, t) : de(l(e, n), l(t, n));
}
function fe(e, t, n) {
	let r = Math.floor(e), i = Math.floor(t), a = e - r, o = t - i, s = z(a), c = z(o);
	return ce * N(N(R(B(r, i, n), a, o), R(B(r + 1, i, n), a - 1, o), s), N(R(B(r, i + 1, n), a, o - 1), R(B(r + 1, i + 1, n), a - 1, o - 1), s), c);
}
function pe(e, t, n, r = 0) {
	let i = 0, a = 1, o = 0, s = 1;
	for (let c = 0; c < n; c++) i += fe(e * s, t * s, r * s) * a, o += a, a *= le, s *= ue;
	return .5 * i / o + .5;
}
var me = 7919, he = 104729, V = 1024;
function ge(e, t, n) {
	let r = F(e, "noise", [
		"scale",
		"seed",
		"octaves",
		"tile",
		"at"
	]), i = T(r.scale ?? 4, 1, S, "noise scale"), a = T(r.seed ?? 0, 0, b, "noise seed"), o = T(r.octaves ?? 4, 1, ee, "noise octaves");
	if (r.tile !== void 0 && typeof r.tile != "boolean") throw C("noise tile must be true or false.");
	let s = r.tile === !1 ? 0 : i, c = a * me % V, l = a * he % V;
	t.cost += o * ne;
	let [u, d] = P(r, t, n);
	return O((e, t) => pe(u(e, t) * i + c, d(e, t) * i + l, o, s));
}
var _e = [
	"distance",
	"edge",
	"cell"
];
function ve(e, t, n) {
	let r = F(e, "voronoi", [
		"scale",
		"seed",
		"output",
		"at"
	]), i = T(r.scale ?? 4, 1, S, "voronoi scale"), a = T(r.seed ?? 0, 0, b, "voronoi seed"), o = E(r.output ?? "distance", _e, "voronoi output");
	t.cost += te;
	let [s, c] = P(r, t, n);
	return O((e, t) => {
		let { nearest: n, second: r, cell: l } = g(s(e, t), c(e, t), i, a);
		return o === "cell" ? l / 4294967296 : f(o === "edge" ? r - n : n);
	});
}
var ye = [
	"u",
	"v",
	"diagonal"
], be = [
	"sine",
	"saw",
	"triangle"
];
function xe(e, t, n) {
	let r = F(e, "wave", [
		"frequency",
		"direction",
		"shape",
		"at"
	]), i = T(r.frequency ?? 4, 1, S, "wave frequency"), a = E(r.direction ?? "u", ye, "wave direction"), o = E(r.shape ?? "sine", be, "wave shape"), [s, c] = P(r, t, n);
	return O((e, t) => {
		let n = (a === "u" ? s(e, t) : a === "v" ? c(e, t) : s(e, t) + c(e, t)) * i;
		return o === "sine" ? Math.sin(n * Math.PI * 2) * .5 + .5 : o === "saw" ? M(n) : 1 - Math.abs(M(n) * 2 - 1);
	});
}
function Se(e, t, n) {
	let r = F(e, "checker", ["count", "at"]), i = T(r.count ?? 8, 2, S, "checker count");
	if (i % 2 != 0) throw C("checker count must be even so it tiles.");
	let [a, o] = P(r, t, n);
	return O((e, t) => (Math.floor(a(e, t) * i) + Math.floor(o(e, t) * i)) % 2 == 0 ? 0 : 1);
}
var Ce = [
	"u",
	"v",
	"radial"
];
function we(e, t, n) {
	let r = F(e, "gradient", ["type", "at"]), i = E(r.type ?? "u", Ce, "gradient type"), [a, o] = P(r, t, n);
	return O((e, t) => f(i === "u" ? a(e, t) : i === "v" ? o(e, t) : 1 - Math.hypot(a(e, t) - .5, o(e, t) - .5) * 2));
}
function Te(e, t, n) {
	if (!Array.isArray(e) || e.length !== 2) throw C(`ramp stop ${t} must be [position, value].`);
	let [r, i] = e;
	if (typeof r != "number" || !Number.isFinite(r) || r < 0 || r > 1 || r <= n) throw C("ramp stop positions must rise strictly from 0 to 1.");
	let a = Array.isArray(i);
	if (a ? i.length !== 3 || !i.every(D) : !D(i)) throw C(`ramp stop ${t} value must be a number or [r, g, b] of finite numbers.`);
	return {
		position: r,
		value: i,
		isVector: a
	};
}
function Ee(e, t, n) {
	let r = F(e, "ramp", ["value", "stops"]), { stops: i } = r;
	if (!Array.isArray(i) || i.length < 2 || i.length > a.maxStops) throw C(`ramp needs 2 to ${a.maxStops} stops.`);
	let o = -1, s = i.map((e, t) => {
		let n = Te(e, t, o);
		return o = n.position, n;
	});
	if (!s.every((e) => e.isVector === s[0].isVector)) throw C("ramp stops are all numbers or all [r, g, b].");
	let c = W(r.value, t, n + 1);
	if (c.kind !== "scalar") throw C("ramp \"value\" needs a number.");
	let l = (e) => (t, n) => {
		let r = f(c.evaluate(t, n)), i = (t) => t.isVector ? t.value[e] : t.value;
		if (r <= s[0].position) return i(s[0]);
		for (let e = 1; e < s.length; e++) if (r <= s[e].position) {
			let t = s[e - 1], n = s[e];
			return N(i(t), i(n), (r - t.position) / (n.position - t.position));
		}
		return i(s[s.length - 1]);
	};
	return t.cost += 2, s[0].isVector ? k(l(0), l(1), l(2)) : O(l(0));
}
function De(e, t, n) {
	if (!Array.isArray(e.vec) || e.vec.length !== 3 || Object.keys(e).length !== 1) throw C("vec needs [x, y, z] in an array.");
	let [r, i, a] = e.vec.map((e) => {
		let r = W(e, t, n + 1);
		if (r.kind !== "scalar") throw C("vec parts must be numbers.");
		return r.evaluate;
	});
	return k(r, i, a);
}
function Oe(e, t, n, r) {
	let [i, a] = oe.get(e), o = i === 1 && !Array.isArray(t[e]) ? [t[e]] : t[e];
	if (!Array.isArray(o) || o.length !== i) throw C(`${e} needs ${i} argument${i === 1 ? "" : "s"}.`);
	return A(o.map((e) => W(e, n, r + 1)), a);
}
function H(e, t, n, r) {
	let i = W(e, t, n + 1);
	if (i.kind !== "scalar") throw C(`${r} needs a number.`);
	return i;
}
function ke(e, t, n) {
	let r = F(e, "layer", [
		"base",
		"top",
		"mask",
		"edge",
		"softness"
	]);
	for (let e of [
		"base",
		"top",
		"mask"
	]) if (r[e] === void 0) throw C(`layer needs "${e}".`);
	let i = r.edge ?? .5, a = r.softness ?? .1;
	if (!D(i) || !D(a) || a < 0) throw C("layer edge is a number and softness a number from 0.");
	let o = W(r.base, t, n + 1), s = W(r.top, t, n + 1), l = H(r.mask, t, n, "layer \"mask\"");
	return A([
		o,
		s,
		O((e, t) => {
			let n = l.evaluate(e, t);
			return a === 0 ? +(n >= i) : c(i - a, i + a, n);
		})
	], N);
}
function Ae(e, t, n) {
	let r = Math.max(e, t, n), i = r - Math.min(e, t, n), a = 0;
	return i > 0 && (a = r === e ? ((t - n) / i + 6) % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4), [
		a / 6,
		r === 0 ? 0 : i / r,
		r
	];
}
function je(e, t, n) {
	let r = (r) => {
		let i = (r + e * 6) % 6;
		return n * (1 - t * Math.max(0, Math.min(i, 4 - i, 1)));
	};
	return [
		r(5),
		r(3),
		r(1)
	];
}
function Me(e, t, n) {
	let r = F(e, "hue", [
		"color",
		"shift",
		"saturation",
		"value"
	]), i = r.saturation ?? 1, a = r.value ?? 1;
	for (let e of [i, a]) if (typeof e != "number" || !Number.isFinite(e) || e < 0 || e > 4) throw C("hue saturation and value are numbers from 0 to 4.");
	let o = W(r.color, t, n + 1);
	if (o.kind !== "vector") throw C("hue \"color\" needs a colour such as [r, g, b].");
	let s = H(r.shift ?? 0, t, n, "hue \"shift\"");
	t.cost += 4;
	let [c, l, u] = o.parts, d = NaN, p = NaN, m = [
		0,
		0,
		0
	], h = (e, t) => {
		if (e !== d || t !== p) {
			let [n, r, o] = Ae(j(c(e, t)), j(l(e, t)), j(u(e, t)));
			m = je(M(n + j(s.evaluate(e, t))), f(r * i), o * a), d = e, p = t;
		}
		return m;
	};
	return k((e, t) => h(e, t)[0], (e, t) => h(e, t)[1], (e, t) => h(e, t)[2]);
}
function Ne(e, t, n) {
	let r = F(e, "curve", ["value", "points"]), { points: i } = r;
	if (!Array.isArray(i) || i.length < 2 || i.length > a.maxStops) throw C(`curve needs 2 to ${a.maxStops} points.`);
	let o = -Infinity;
	for (let e of i) {
		if (!Array.isArray(e) || e.length !== 2 || !e.every(D) || e[0] <= o) throw C("curve points are [x, y] with x rising.");
		o = e[0];
	}
	return t.cost += 2, A([W(r.value, t, n + 1)], (e) => {
		if (e <= i[0][0]) return i[0][1];
		for (let t = 1; t < i.length; t++) if (e <= i[t][0]) {
			let [n, r] = i[t - 1], [a, o] = i[t];
			return N(r, o, (e - n) / (a - n));
		}
		return i[i.length - 1][1];
	});
}
var U = /* @__PURE__ */ new Map([
	["noise", ge],
	["voronoi", ve],
	["wave", xe],
	["checker", Se],
	["gradient", we]
]);
function W(e, n, r) {
	if (n.nodeCount++, n.cost++, n.nodeCount > a.maxNodes) throw C(`more than ${a.maxNodes} nodes.`);
	if (r > a.maxDepth) throw C(`nesting deeper than ${a.maxDepth}.`);
	if (typeof e == "number") {
		if (!D(e)) throw C(`numbers must be finite and within ${y}.`);
		return O(() => e);
	}
	if (Array.isArray(e)) {
		if (e.length !== 3 || !e.every(D)) throw C("a vector literal is three finite numbers; build one from expressions with \"vec\".");
		let [t, n, r] = e;
		return k(() => t, () => n, () => r);
	}
	if (!w(e)) throw C("each node is a number, a vector of three numbers or an object with one operator.");
	let i = Object.keys(e);
	if (i.length !== 1) throw C(`a node holds exactly one operator; got ${i.length}.`);
	let o = i[0];
	if (o === "uv") return se(e);
	if (o === "vec") return De(e, n, r);
	if (o === "ramp") return Ee(e, n, r);
	if (o === "layer") return ke(e, n, r);
	if (o === "hue") return Me(e, n, r);
	if (o === "curve") return Ne(e, n, r);
	if (U.has(o)) return U.get(o)(e, n, r);
	if (oe.has(o)) return Oe(o, e, n, r);
	throw C(`unknown operator ${re(o)}. Use one of ${t.join(", ")}.`);
}
var Pe = [
	"roughness",
	"metallic",
	"height",
	"opacity",
	"clearcoat",
	"transmission"
];
function Fe(e) {
	if (!w(e)) throw C(`graph must be an object with outputs: ${n.join(", ")}.`);
	ie(e, n, "graph");
	let t = Object.keys(e);
	if (t.length === 0) throw C(`graph needs at least one output: ${n.join(", ")}.`);
	let r = {
		nodeCount: 0,
		cost: 0
	}, i = {};
	for (let n of t) if (i[n] = W(e[n], r, 0), Pe.includes(n) && i[n].kind !== "scalar") throw C(`${n} needs a number, not a vector.`);
	return {
		outputs: i,
		nodeCount: r.nodeCount,
		cost: r.cost
	};
}
function Ie(e, t) {
	if (e.cost * t * t > a.maxWork) throw RangeError(`Material graph: ${e.cost} work units per pixel at ${t} by ${t} is over the limit of ${a.maxWork}. Use fewer nodes or a smaller resolution.`);
}
function Le(e, t) {
	return Ie(Fe(e), t), JSON.parse(JSON.stringify(e));
}
function Re(e, t, n) {
	if (e.kind === "scalar") {
		let r = j(e.evaluate(t, n));
		return [
			r,
			r,
			r
		];
	}
	return [
		j(e.parts[0](t, n)),
		j(e.parts[1](t, n)),
		j(e.parts[2](t, n))
	];
}
var ze = (e) => Math.round(f(j(e)) * 255);
function Be(e, t, n) {
	e[t] = ze(n), e[t + 3] = 255;
}
function Ve(e, t, n) {
	for (let r = 0; r < 3; r++) e[t + r] = h(n[r]);
	e[t + 3] = 255;
}
function He(e, { resolution: t, bump: n }) {
	let r = Fe(e);
	Ie(r, t);
	let { color: i, roughness: a, metallic: o, emission: c, height: l, opacity: u, clearcoat: d, transmission: p } = r.outputs, h = t * t, g = i || u ? new Uint8ClampedArray(h * 4).fill(255) : null, _ = d ? new Uint8ClampedArray(h * 4) : null, v = p ? new Uint8ClampedArray(h * 4) : null, y = c ? new Uint8ClampedArray(h * 4) : null, b = a || o ? new Uint8ClampedArray(h * 4) : null;
	for (let e = 0; e < t; e++) for (let n = 0; n < t; n++) {
		let r = e * t + n, s = (n + .5) / t, l = (e + .5) / t, m = r * 4;
		i && Ve(g, m, Re(i, s, l)), u && (g[m + 3] = ze(u.evaluate(s, l))), d && Be(_, m, d.evaluate(s, l)), p && Be(v, m, p.evaluate(s, l)), c && Ve(y, m, Re(c, s, l)), b && (b[m] = 255, b[m + 1] = a ? Math.round(f(j(a.evaluate(s, l))) * 255) : 255, b[m + 2] = o ? Math.round(f(j(o.evaluate(s, l))) * 255) : 255, b[m + 3] = 255);
	}
	let x = (e, n) => e ? {
		image: m(e, t, t),
		colorSpace: n
	} : void 0;
	return {
		map: x(g, "srgb"),
		emissiveMap: x(y, "srgb"),
		metallicRoughnessMap: x(b, "linear"),
		layerMaps: _ ? { clearcoatTexture: x(_, "linear") } : void 0,
		transmissionMap: x(v, "linear"),
		normalMap: x(l ? s((e, t) => j(l.evaluate(e, t)), t, n) : null, "linear")
	};
}
// src/material-patterns.js
var Ue = /* @__PURE__ */ e({
	PATTERN_DEFAULTS: () => K,
	bakeMaterialPattern: () => Q,
	cellularNoise: () => g,
	fractalNoise: () => u,
	gradientNoise: () => o,
	materialPatternTextures: () => tt,
	normalizeMaterialPattern: () => Qe,
	ridgedNoise: () => _
});
function G(e, t, n) {
	return p(e, t, n) / 4294967296;
}
function We(e, t, n, r, i, a) {
	let o = t * r, s = Math.floor(o), u = e * n + (s % 2 == 1 ? a : 0), d = Math.floor(u), f = u - d, p = o - s, m = Math.min(f, 1 - f) / n, h = Math.min(p, 1 - p) / r, g = Math.min(m, h);
	return {
		row: s,
		column: l(d, n),
		body: c(i * .5, i * 1.5, g)
	};
}
function Ge(e, t, n, r) {
	let i = u(e, t, 2, 1, n, 3) * 1.6, a = e * r + i, o = a - Math.floor(a), s = o < .85 ? o / .85 : (1 - o) / .15, c = u(e, t, 128, 2, n + 7, 3) * .5 + .5, l = u(e, t, 256, 8, n + 11, 2) * .5 + .5;
	return {
		tone: f(s * .45 + c * .4 + l * .15),
		fibre: c
	};
}
var Ke = {
	noise(e, t, n, r) {
		let i = u(e, t, r, r, n, 6) * .5 + .5;
		return {
			tone: c(.25, .75, i),
			height: i,
			roughness: .75 + i * .25,
			metal: 1
		};
	},
	wood(e, t, n, r) {
		let { tone: i, fibre: a } = Ge(e, t, n, r);
		return {
			tone: i,
			height: i * .5 + a * .5,
			roughness: .75 + (1 - i) * .25,
			metal: 1
		};
	},
	planks(e, t, n, r) {
		let i = e * r, a = Math.floor(i), o = i - a, s = t + G(a, 0, n), u = Math.min(s - Math.floor(s), 1 - (s - Math.floor(s))), d = Math.min(Math.min(o, 1 - o) / r, u), p = c(.0015, .005, d), { tone: m, fibre: h } = Ge(e, qe(t + G(l(a, r), 1, n)), n + l(a, r) * 17, 12), g = f(m * .8 + G(l(a, r), 2, n) * .2);
		return {
			tone: g * p,
			height: (.55 + h * .25) * p,
			roughness: .75 + (1 - g) * .2 + (1 - p) * .05,
			metal: 1
		};
	},
	bricks(e, t, n, r) {
		let i = r * 2, { row: a, column: o, body: s } = We(e, t, r, i, .006, .5), c = G(o, l(a, i), n), d = u(e, t, 24, 24, n + 3, 4) * .5 + .5;
		return {
			tone: f(c * .6 + d * .4),
			joint: 1 - s,
			height: s * (.75 + d * .25),
			roughness: .85 + d * .15,
			metal: 1
		};
	},
	tiles(e, t, n, r) {
		let { row: i, column: a, body: o } = We(e, t, r, r, .004, 0), s = G(a, l(i, r), n), c = u(e, t, 8, 8, n + 5, 3) * .5 + .5;
		return {
			tone: f(.75 + s * .2 + c * .05) * o,
			height: o * (.9 + c * .1),
			roughness: o > .5 ? .45 + c * .15 : 1,
			metal: 1
		};
	},
	marble(e, t, n, r) {
		let i = u(e, t, r, r, n, 5) * .5 + .5, a = _(e, t, r, r, n + 11, 4), o = c(.72, .95, a);
		return {
			tone: f(.75 + i * .25 - o),
			height: .5,
			roughness: .3 + o * .2,
			metal: 1
		};
	},
	stone(e, t, n, r) {
		let i = _(e, t, r, r, n, 5), { nearest: a, second: o } = g(e, t, r * 2, n + 9), s = c(0, .07, o - a), l = f(i * .8 + .1);
		return {
			tone: l * (.6 + s * .4),
			height: l * .7 + s * .3,
			roughness: .85 + (1 - l) * .15,
			metal: 1
		};
	},
	concrete(e, t, n, r) {
		let i = u(e, t, r, r, n, 6) * .5 + .5, { nearest: a } = g(e, t, r * 16, n + 13), o = c(.02, .12, a);
		return {
			tone: f(i * .9 + .05) * (.7 + o * .3),
			height: .5 + (o - 1) * .4 + i * .1,
			roughness: .85 + i * .15,
			metal: 1
		};
	},
	metal(e, t, n, r) {
		let i = u(e, t, r * 16, 2, n, 4) * .5 + .5, a = u(e, t, 4, 4, n + 3, 3) * .5 + .5;
		return {
			tone: f(i * .7 + a * .3),
			height: i * .25,
			roughness: .55 + i * .35 + a * .1,
			metal: 1
		};
	},
	rust(e, t, n, r) {
		let i = u(e, t, r, r, n, 6) * .5 + .5, a = u(e, t, r * 16, r * 16, n + 3, 3) * .5 + .5, o = c(.42, .58, i + (a - .5) * .15);
		return {
			tone: o * (.5 + a * .5),
			height: o * (.4 + a * .6),
			roughness: .45 + o * .55,
			metal: 1 - o
		};
	},
	fabric(e, t, n, r) {
		let i = r * 16, a = Math.sin(e * i * Math.PI * 2) * .5 + .5, o = Math.sin(t * i * Math.PI * 2) * .5 + .5, s = (Math.floor(e * i) + Math.floor(t * i)) % 2 == 0 ? a : o, c = u(e, t, 16, 16, n, 3) * .5 + .5;
		return {
			tone: f(s * .5 + c * .5),
			height: s,
			roughness: .9 + c * .1,
			metal: 1
		};
	}
};
function qe(e) {
	return e - Math.floor(e);
}
var K = {
	noise: {
		colors: [[
			.2,
			.2,
			.2
		], [
			.7,
			.7,
			.7
		]],
		size: 1,
		count: 4,
		bump: .5
	},
	wood: {
		colors: [[
			.16,
			.07,
			.025
		], [
			.5,
			.27,
			.11
		]],
		size: .6,
		count: 12,
		bump: .4
	},
	planks: {
		colors: [[
			.12,
			.055,
			.02
		], [
			.46,
			.25,
			.1
		]],
		size: 1,
		count: 6,
		bump: .8
	},
	bricks: {
		colors: [
			[
				.33,
				.1,
				.06
			],
			[
				.52,
				.2,
				.12
			],
			[
				.45,
				.42,
				.38
			]
		],
		size: 1,
		count: 4,
		bump: 1
	},
	tiles: {
		colors: [[
			.32,
			.32,
			.31
		], [
			.75,
			.75,
			.72
		]],
		size: 1,
		count: 4,
		bump: .8
	},
	marble: {
		colors: [[
			.2,
			.2,
			.22
		], [
			.85,
			.84,
			.82
		]],
		size: 1,
		count: 3,
		bump: 0
	},
	stone: {
		colors: [[
			.09,
			.085,
			.08
		], [
			.42,
			.4,
			.37
		]],
		size: 1.5,
		count: 4,
		bump: 1.4
	},
	concrete: {
		colors: [[
			.24,
			.24,
			.23
		], [
			.5,
			.5,
			.48
		]],
		size: 2,
		count: 4,
		bump: .4
	},
	metal: {
		colors: [[
			.5,
			.5,
			.52
		], [
			.8,
			.8,
			.82
		]],
		size: .5,
		count: 4,
		bump: .15
	},
	rust: {
		colors: [[
			.55,
			.55,
			.56
		], [
			.22,
			.07,
			.025
		]],
		size: 1,
		count: 4,
		bump: .7
	},
	fabric: {
		colors: [[
			.2,
			.2,
			.25
		], [
			.45,
			.45,
			.55
		]],
		size: .25,
		count: 4,
		bump: .5
	}
}, q = [
	256,
	512,
	1024
], Je = 64, J = "graph", Y = {
	size: 1,
	bump: 1
}, Ye = [
	"colors",
	"count",
	"seed"
];
function X(e) {
	return /* @__PURE__ */ RangeError(`Material pattern ${e}`);
}
function Xe(e, t) {
	let n = "colors must be two linear RGB colours from 0 to 1 (three for bricks: the third is the mortar)", r = K[t].colors.length;
	if (!Array.isArray(e) || e.length !== 2 && e.length !== r) throw X(n);
	for (let t of e) if (!Array.isArray(t) || t.length !== 3 || t.some((e) => !Number.isFinite(e) || e < 0 || e > 1)) throw X(n);
	return e.map((e) => [...e]);
}
function Z(e, t, n, r) {
	if (!Number.isFinite(e) || e < n || e > r) throw X(`${t} must be a number from ${n} to ${r}.`);
	return e;
}
function Ze(e, t) {
	for (let t of Ye) if (e[t] !== void 0) throw X(`of type graph does not take ${t}: the graph holds the colours and the noise seeds.`);
	let n = e.axis ?? "y";
	if (![
		"x",
		"y",
		"z"
	].includes(n)) throw X("axis must be x, y or z: the object axis the texture V runs along.");
	let r = e.resolution ?? 512;
	if (!q.includes(r)) throw X(`resolution must be one of ${q.join(", ")}.`);
	return {
		type: J,
		graph: Le(e.graph, r),
		size: Z(e.size ?? Y.size, "size", .01, 100),
		bump: Z(e.bump ?? Y.bump, "bump", 0, 4),
		axis: n,
		resolution: r,
		...t
	};
}
function Qe(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw X(`must be an object such as { "type": "wood" }. Types: ${r.join(", ")}.`);
	let t = [
		"type",
		"colors",
		"size",
		"count",
		"bump",
		"seed",
		"axis",
		"resolution",
		"mapping",
		"graph"
	];
	for (let n of Object.keys(e)) if (!t.includes(n)) throw X(`does not take ${n}. Fields: ${t.join(", ")}.`);
	let n = e.mapping ?? "box";
	if (!i.includes(n)) throw X(`mapping must be one of ${i.join(", ")}: box projects along the object axes, uv follows the geometry's UVs.`);
	let a = n === "uv" ? { mapping: n } : {};
	if (e.type === J) return Ze(e, a);
	if (e.graph !== void 0) throw X("does not take graph unless its type is graph.");
	if (!Object.hasOwn(K, e.type ?? "")) throw X(`type must be one of ${r.join(", ")}.`);
	let o = K[e.type], s = e.count ?? o.count;
	if (!Number.isInteger(s) || s < 1 || s > Je) throw X(`count must be a whole number from 1 to ${Je}.`);
	let c = e.seed ?? 1;
	if (!Number.isInteger(c) || c < 0 || c > 2147483647) throw X("seed must be a nonnegative whole number.");
	let l = e.axis ?? "y";
	if (![
		"x",
		"y",
		"z"
	].includes(l)) throw X("axis must be x, y or z: the object axis the grain runs along.");
	let u = e.resolution ?? 512;
	if (!q.includes(u)) throw X(`resolution must be one of ${q.join(", ")}.`);
	return {
		type: e.type,
		colors: e.colors === void 0 ? o.colors.map((e) => [...e]) : Xe(e.colors, e.type),
		size: Z(e.size ?? o.size, "size", .01, 100),
		count: s,
		bump: Z(e.bump ?? o.bump, "bump", 0, 4),
		seed: c,
		axis: l,
		resolution: u,
		...a
	};
}
function Q(e) {
	let t = {
		boxMapScale: e.mapping === "uv" ? 0 : 1 / e.size,
		boxMapAxis: [
			"x",
			"y",
			"z"
		].indexOf(e.axis)
	};
	if (e.type === J) return {
		...He(e.graph, e),
		...t
	};
	let { resolution: n, type: i, seed: a, count: o, colors: s, bump: c } = e;
	if (!Object.hasOwn(Ke, i)) throw X(`type must be one of ${r.join(", ")}.`);
	let l = Ke[i], u = n * n, p = new Float32Array(u), g = new Uint8ClampedArray(u * 4), _ = new Uint8ClampedArray(u * 4), [v, y, b] = s;
	for (let e = 0; e < n; e++) for (let t = 0; t < n; t++) {
		let r = e * n + t, i = l((t + .5) / n, (e + .5) / n, a, o);
		p[r] = i.height;
		let s = f(i.tone), c = b ? i.joint ?? 0 : 0, u = r * 4;
		for (let e = 0; e < 3; e++) {
			let t = v[e] + (y[e] - v[e]) * s;
			g[u + e] = h(c > 0 ? t + (b[e] - t) * c : t);
		}
		g[u + 3] = 255, _[u] = 255, _[u + 1] = Math.round(f(i.roughness) * 255), _[u + 2] = Math.round(f(i.metal) * 255), _[u + 3] = 255;
	}
	let x = d(p, n, c);
	return {
		map: {
			image: m(g, n, n),
			colorSpace: "srgb"
		},
		normalMap: {
			image: m(x, n, n),
			colorSpace: "linear"
		},
		metallicRoughnessMap: {
			image: m(_, n, n),
			colorSpace: "linear"
		},
		...t
	};
}
var $ = /* @__PURE__ */ new Map(), $e = 32, et = /* @__PURE__ */ new WeakMap();
function tt(e) {
	let t = et.get(e);
	if (t) return t;
	let n = JSON.stringify(e), r = $.get(n);
	return r ? $.delete(n) : (r = v("pattern", [e], Q), $.size >= $e && $.delete($.keys().next().value)), $.set(n, r), et.set(e, r), r;
}
export { Ue as n, Q as t };
