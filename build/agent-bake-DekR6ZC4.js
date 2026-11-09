/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./rolldown-runtime-CvuOiBwx.js";
import { t } from "./field-error-DPtscRqU.js";
import { buildWorld as n, createDirectIrradiance as r, createGatherer as i, diffuseAlbedo as a, emittedRadiance as o, estimateBake as s, hashUnit as c, normalizeLights as l, planLightmaps as u, sceneScale as d, traceLightmaps as f, validatePart as p, withReach as m } from "./light-bake.js";
import { o as h } from "./kernel-offload-CFdSENYy.js";
import { r as g } from "./agent-motion-BumZoRED.js";
import { a as _, n as v, o as y } from "./probe-trace-ALKeQrQp.js";
import { t as b } from "./reflection-probes-Cbpx-KhD.js";
import { t as ee } from "./ray-query-CWJhfYYD.js";
import { i as x } from "./triangle-math-CatOnS0A.js";
import { i as S, l as te } from "./shader-registry-DHYkwAg5.js";
import { i as C, n as w, r as T, t as E } from "./path-tracer-volume-CWKqVztb.js";
import { i as D, r as O } from "./agent-recipe-checks-FwGjwFIr.js";
import { a as k, i as A, o as j, r as M } from "./agent-scene-capabilities-BGAS_VVR.js";
// src/grid-medium.js
function ne({ lighting: e, sun: t, tracer: n, scale: r }) {
	let i = w(e.volumeFog);
	if (!i) return null;
	let a = [0, 0], o = [0, 0], s = e.skyMean ?? null, l = r * 1e6;
	function u(e, r, o, s, u, d, f, p, m = null) {
		if (!C(i, e[0], e[1], e[2], r[0], r[1], r[2], o, a)) return !1;
		let h = 1 - Math.exp(-i.density * (a[1] - a[0])), g = p * 4;
		if (c(d, f, g + 200) >= h) return !1;
		let _ = a[0] - Math.log(1 - c(d, f, g + 201) * h) / i.density;
		for (let t = 0; t < 3; t++) e[t] += r[t] * _;
		if (t && !(n.trace(e[0], e[1], e[2], t.direction[0], t.direction[1], t.direction[2], l, !0).nearestTriangle >= 0)) {
			let n = E(i.anisotropy, r[0] * t.direction[0] + r[1] * t.direction[1] + r[2] * t.direction[2]), o = P(i, e, t.direction, a);
			for (let e = 0; e < 3; e++) {
				let r = s[e] * i.albedo[e] * t.color[e] * n * o;
				u[e] += r, m && p === 0 && (m[e] += r);
			}
		}
		for (let e = 0; e < 3; e++) s[e] *= i.albedo[e];
		return F(r, T(i.anisotropy, c(d, f, g + 202)), 2 * Math.PI * c(d, f, g + 203)), !0;
	}
	return u.sunReaching = (e) => t ? P(i, e, t.direction, o) : 1, u.addSky = (e, t) => {
		if (s) for (let n = 0; n < 3; n++) t[n] += e[n] * s[n];
	}, u;
}
function N(e) {
	if (!e?.data) return null;
	let { width: t, height: n, channels: r, data: i, intensity: a } = e, o = [
		0,
		0,
		0
	], s = 0;
	for (let e = 0; e < n; e++) {
		let a = Math.sin((e + .5) / n * Math.PI);
		for (let n = 0; n < t; n++) {
			let c = (e * t + n) * r;
			for (let e = 0; e < 3; e++) o[e] += i[c + e] * a;
			s += a;
		}
	}
	return o.map((e) => e * a / s);
}
function P(e, t, n, r) {
	return C(e, t[0], t[1], t[2], n[0], n[1], n[2], Infinity, r) ? Math.exp(-e.density * (r[1] - r[0])) : 1;
}
function F(e, t, n) {
	let [r, i, a] = e, o = Math.sqrt(Math.max(0, 1 - t * t)), s = Math.abs(r) < .9, c = s ? 0 : -a, l = s ? a : 0, u = s ? -i : r, d = Math.hypot(c, l, u), f = c / d, p = l / d, m = u / d, h = i * m - a * p, g = a * f - r * m, _ = r * p - i * f, v = Math.cos(n) * o, y = Math.sin(n) * o;
	e[0] = r * t + f * v + h * y, e[1] = i * t + p * v + g * y, e[2] = a * t + m * v + _ * y;
}
// src/irradiance-grid.js
var I = Object.freeze({
	resolution: [8, 48],
	samples: [4, 128],
	bounces: [1, 8],
	maxNodes: 65536
}), L = 8192, re = 32, R = U(), z = .5, B = 12, V = 16, ie = 12, H = 16;
function U() {
	let e = [];
	for (let t of [
		0,
		1,
		2
	]) for (let n of [-1, 1]) {
		let r = [
			0,
			0,
			0
		];
		r[t] = n, e.push(r);
	}
	let t = Math.sqrt(1 / 3);
	for (let n of [-1, 1]) for (let r of [-1, 1]) for (let i of [-1, 1]) e.push([
		n * t,
		r * t,
		i * t
	]);
	return e;
}
function ae(e) {
	if (e == null || e === !1) return null;
	if (e === !0) return !0;
	let t = e, [n, r] = I.resolution;
	if (!Number.isInteger(t) || t < n || t > r) throw RangeError(`bake.irradianceGrid must be true or an integer node count from ${n} to ${r}.`);
	return t;
}
function W(e, t, n) {
	let [r, i] = e.size;
	n[0] = e.origin[0] + t % r * e.cellSize, n[1] = e.origin[1] + Math.floor(t / r) % i * e.cellSize, n[2] = e.origin[2] + Math.floor(t / (r * i)) * e.cellSize;
}
function oe(e, t) {
	let n = [
		Infinity,
		Infinity,
		Infinity
	], r = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let t of e) {
		let e = y(t);
		for (let t = 0; t < 3; t++) n[t] = Math.min(n[t], e.minimum[t]), r[t] = Math.max(r[t], e.maximum[t]);
	}
	let i = r.map((e, t) => Math.max(e - n[t], .001)), a = (e) => i.map((t) => Math.max(2, Math.round(t / e) + 1)), o = Math.max(...i) / ((t === !0 ? 48 : t) - 1);
	if (t === !0) for (; a(o).reduce((e, t) => e * t, 1) > L;) o *= 1.05;
	return {
		origin: n,
		cellSize: o,
		size: a(o)
	};
}
function se(e, t, n) {
	let r = /* @__PURE__ */ new Float64Array(9), i = 0, a = 0;
	for (let o of R) {
		let s = t.trace(n[0], n[1], n[2], o[0], o[1], o[2], Infinity, !1);
		if (s.nearestTriangle < 0) continue;
		a++, x(e.positions, e.indices, s.nearestTriangle, r);
		let c = (r[4] - r[1]) * (r[8] - r[2]) - (r[5] - r[2]) * (r[7] - r[1]), l = (r[5] - r[2]) * (r[6] - r[0]) - (r[3] - r[0]) * (r[8] - r[2]), u = (r[3] - r[0]) * (r[7] - r[1]) - (r[4] - r[1]) * (r[6] - r[0]);
		c * o[0] + l * o[1] + u * o[2] > 0 && i++;
	}
	return a > 0 && i / R.length > z;
}
function ce(e, t, n) {
	let [r, i, a] = n, o = [
		1,
		r,
		r * i
	];
	for (let a = 0; a < B; a++) {
		let a = [];
		for (let s = 0; s < t.length; s++) {
			if (t[s]) continue;
			let c = [
				s % r,
				Math.floor(s / r) % i,
				Math.floor(s / (r * i))
			], l = -1, u = Infinity;
			for (let r = 0; r < 3; r++) for (let i of [-1, 1]) {
				let a = c[r] + i;
				if (a < 0 || a >= n[r]) continue;
				let d = s + i * o[r];
				if (!t[d]) continue;
				let f = d * V, p = e[f] + e[f + 4] + e[f + 8];
				p < u && (u = p, l = d);
			}
			if (l >= 0) {
				for (let t = 0; t < V; t++) e[s * V + t] = e[l * V + t];
				a.push(s);
			}
		}
		if (a.length === 0) break;
		for (let e of a) t[e] = 1;
	}
}
function le(e, t, n, r) {
	let [i, a, o] = n, s = Float32Array.from(e), c = [
		1,
		2,
		1
	];
	for (let n = 0; n < t.length; n++) {
		if (!t[n]) continue;
		let l = n % i, u = Math.floor(n / i) % a, d = Math.floor(n / (i * a)), f = new Float64Array(V), p = 0;
		for (let e = -1; e <= 1; e++) for (let m = -1; m <= 1; m++) for (let h = -1; h <= 1; h++) {
			let g = l + h, _ = u + m, v = d + e;
			if (g < 0 || _ < 0 || v < 0 || g >= i || _ >= a || v >= o) continue;
			let y = g + i * (_ + a * v);
			if (!t[y] || y !== n && !r(n, y)) continue;
			let b = c[h + 1] * c[m + 1] * c[e + 1];
			for (let e = 0; e < V; e++) f[e] += b * s[y * V + e];
			p += b;
		}
		for (let t = 0; t < V; t++) e[n * V + t] = f[t] / p;
	}
}
function ue(e, t, { resolution: s = !0, samples: c = re, bounces: u = 3, maxSeconds: f = 60 } = {}) {
	if (!Array.isArray(e) || e.length === 0 || e.length > 256) throw RangeError("The irradiance grid takes from 1 to 256 parts.");
	e.forEach(p);
	let h = oe(e, s), g = h.size[0] * h.size[1] * h.size[2];
	if (g > I.maxNodes) throw RangeError(`The irradiance grid would have ${g} nodes; the limit is ${I.maxNodes}. Lower bake.irradianceGrid.`);
	let _ = l(t), v = n(e), y = d(v.positions), b = y * 1e-4, x = ee(v), S = ne({
		lighting: t,
		sun: _.sun ?? null,
		tracer: x,
		scale: y
	}), te = r(x, m(_, e), b, y, S?.sunReaching), C = e.map((e) => a(e.material)), w = e.map((e) => o(e.material)), T = i({
		world: v,
		tracer: x,
		albedoOfPart: C,
		emissionOfPart: w,
		directIrradiance: te,
		offset: b,
		samples: c,
		bounces: u,
		medium: S,
		fogScatterLimit: 8
	}), E = performance.now(), D = new Float32Array(g * V), O = S ? new Float32Array(g * V) : null, k = new Uint8Array(g), A = [
		0,
		0,
		0
	], j = [/* @__PURE__ */ new Float64Array(3), /* @__PURE__ */ new Float64Array(3)], M = [/* @__PURE__ */ new Float64Array(3), /* @__PURE__ */ new Float64Array(3)], N = [0, 0], P = [
		0,
		0,
		0
	], [F, L] = h.size, R = 0;
	for (let e = 0; e < g; e++) {
		if (performance.now() - E > f * 1e3) throw Error(`Irradiance grid trace passed maxSeconds (${f}).`);
		if (A[0] = h.origin[0] + e % F * h.cellSize, A[1] = h.origin[1] + Math.floor(e / F) % L * h.cellSize, A[2] = h.origin[2] + Math.floor(e / (F * L)) * h.cellSize, se(v, x, A)) R++;
		else {
			k[e] = 1;
			for (let t = 0; t < 3; t++) {
				for (let n = 0; n < 2; n++) P.fill(0), P[t] = n === 0 ? 1 : -1, N[n] = T(A, P, e * 6 + t * 2 + n, j[n], M[n]);
				let n = e * V + ie;
				D[n] += (N[0] + N[1]) / 6, D[n + 1 + t] = (N[0] - N[1]) / 2;
				for (let n = 0; n < 3; n++) {
					let r = e * V + n * 4;
					D[r] += (j[0][n] + j[1][n]) / 6, D[r + 1 + t] = (j[0][n] - j[1][n]) / 2, O && (O[r] += (M[0][n] + M[1][n]) / 6, O[r + 1 + t] = (M[0][n] - M[1][n]) / 2);
				}
			}
		}
	}
	let z = Uint8Array.from(k), B = [
		0,
		0,
		0
	], H = (e, t) => {
		if (!z[e] || !z[t]) return !1;
		W(h, e, A), W(h, t, B);
		let n = B[0] - A[0], r = B[1] - A[1], i = B[2] - A[2], a = Math.hypot(n, r, i);
		return x.trace(A[0], A[1], A[2], n / a, r / a, i / a, a, !0).nearestTriangle < 0;
	};
	O && (ce(O, Uint8Array.from(k), h.size), le(O, k, h.size, H)), ce(D, k, h.size), le(D, k, h.size, H);
	let U = {
		...h,
		data: D,
		nodes: g,
		solidNodes: R,
		seconds: (performance.now() - E) / 1e3
	};
	return O && (U.fogScattered = O), de(U);
}
function de(e) {
	return Object.hasOwn(e, "meanRadiance") || Object.defineProperty(e, "meanRadiance", { value: (t) => {
		let n = pe(e, t, fe);
		if (!e.fogScattered) return n;
		let r = pe({
			...e,
			data: e.fogScattered
		}, t, fe);
		return n.map((e, t) => Math.max(0, e - r[t]));
	} }), e;
}
var fe = Object.freeze([
	0,
	0,
	0
]);
function pe(e, t, n) {
	let r = [
		0,
		1,
		2
	].map((r) => Math.min(Math.max((t[r] + n[r] * e.cellSize * .5 - e.origin[r]) / e.cellSize, 0), e.size[r] - 1)), i = r.map(Math.floor), a = r.map((e, t) => e - i[t]), o = [
		0,
		0,
		0
	];
	for (let t = 0; t < 8; t++) {
		let r = [
			0,
			1,
			2
		].map((n) => Math.min(i[n] + (t >> n & 1), e.size[n] - 1)), s = [
			0,
			1,
			2
		].reduce((e, n) => e * (t >> n & 1 ? a[n] : 1 - a[n]), 1), c = (r[0] + e.size[0] * (r[1] + e.size[1] * r[2])) * V;
		for (let t = 0; t < 3; t++) {
			let r = c + t * 4;
			o[t] += s * (e.data[r] + e.data[r + 1] * n[0] + e.data[r + 2] * n[1] + e.data[r + 3] * n[2]);
		}
	}
	return o.map((e) => Math.max(e, 0));
}
function me(e, t, n) {
	if (!n.has(e)) {
		let r = {};
		for (let t of Object.keys(e)) Object.defineProperty(r, t, {
			enumerable: !0,
			get: () => e[t]
		});
		Object.defineProperty(r, "irradianceGrid", {
			enumerable: !0,
			value: t
		}), n.set(e, Object.freeze(r));
	}
	return n.get(e);
}
function he(e, t) {
	let n = /* @__PURE__ */ new Map();
	return e.map((e) => Object.freeze({
		...e,
		material: me(e.material, t, n)
	}));
}
te("irradianceGrid", Object.freeze({
	declarations: "uniform highp sampler3D irradianceGridTexture;\nuniform float irradianceGridEnabled;\nuniform vec4 irradianceGridOrigin;\nuniform vec3 irradianceGridSize;\nvec4 irradianceGridSample(vec3 position, vec3 normal) {\n  vec3 grid = clamp((position + normal * irradianceGridOrigin.w * 0.5 - irradianceGridOrigin.xyz) / irradianceGridOrigin.w, vec3(0.0), irradianceGridSize - 1.0);\n  float left = floor(grid.x);\n  float right = min(left + 1.0, irradianceGridSize.x - 1.0);\n  float blend = grid.x - left;\n  vec2 across = (grid.yz + 0.5) / irradianceGridSize.yz;\n  float rowWidth = 4.0 * irradianceGridSize.x;\n  vec4 direction = vec4(1.0, normal);\n  vec4 result = vec4(0.0);\n  for (int channel = 0; channel < 4; channel++) {\n    float slot = float(channel) + 0.5;\n    vec4 first = texture(irradianceGridTexture, vec3((4.0 * left + slot) / rowWidth, across));\n    vec4 second = texture(irradianceGridTexture, vec3((4.0 * right + slot) / rowWidth, across));\n    result[channel] = dot(mix(first, second, blend), direction);\n  }\n  return max(result, vec4(0.0));\n}\n",
	irradianceGridOcclusion: "  vec4 irradianceGridValue = irradianceGridEnabled > 0.5 ? irradianceGridSample(worldPosition, normal) : vec4(0.0, 0.0, 0.0, 1.0);\n  occlusion *= min(irradianceGridValue.a, 1.0);\n",
	irradianceGrid: "  if (irradianceGridEnabled > 0.5) radiance += color * (1.0 - metallic) * irradianceGridValue.rgb;\n"
}));
var G = /* @__PURE__ */ new WeakMap();
function ge(e) {
	if (!G.has(e)) {
		let { context: t, program: n } = e, r = (e) => t.getUniformLocation(n, e);
		G.set(e, {
			textures: /* @__PURE__ */ new Map(),
			enabled: r("irradianceGridEnabled"),
			origin: r("irradianceGridOrigin"),
			size: r("irradianceGridSize"),
			bound: void 0
		}), t.uniform1i(r("irradianceGridTexture"), H);
	}
	return G.get(e);
}
function _e(e, t) {
	let n = e.context, [r, i, a] = t.size, o = n.createTexture(), s = n.getParameter(n.TEXTURE_BINDING_3D);
	n.bindTexture(n.TEXTURE_3D, o), n.texImage3D(n.TEXTURE_3D, 0, n.RGBA16F, r * 4, i, a, 0, n.RGBA, n.FLOAT, t.data), n.texParameteri(n.TEXTURE_3D, n.TEXTURE_MIN_FILTER, n.LINEAR), n.texParameteri(n.TEXTURE_3D, n.TEXTURE_MAG_FILTER, n.LINEAR);
	for (let e of [
		n.TEXTURE_WRAP_S,
		n.TEXTURE_WRAP_T,
		n.TEXTURE_WRAP_R
	]) n.texParameteri(n.TEXTURE_3D, e, n.CLAMP_TO_EDGE);
	return n.bindTexture(n.TEXTURE_3D, s), e.textures.set(Symbol("irradiance-grid"), o), o;
}
function ve(e, t) {
	if (!e.shaderFeatures?.has("irradianceGrid")) return;
	let n = ge(e), r = e.context, i = t[21] ?? null;
	i ? (n.textures.has(i) || n.textures.set(i, _e(e, i)), r.activeTexture(r.TEXTURE0 + H), r.bindTexture(r.TEXTURE_3D, n.textures.get(i)), n.bound !== i && (r.uniform1f(n.enabled, 1), r.uniform4f(n.origin, i.origin[0], i.origin[1], i.origin[2], i.cellSize), r.uniform3f(n.size, i.size[0], i.size[1], i.size[2]), n.bound = i)) : n.bound !== null && (r.uniform1f(n.enabled, 0), n.bound = null);
}
var ye = S.bind;
S.bind = (e, t, n, r) => {
	ye?.(e, t, n, r), ve(e, t);
};
// src/agent-bake.js
var be = /* @__PURE__ */ e({
	bakeAgentParts: () => Be,
	bakeAtSampledPose: () => Oe,
	bakeChangedParts: () => Z,
	bakeGenerators: () => q,
	bakeSecondsLimit: () => X,
	changedPartsOf: () => Q,
	fitSettingsToBudget: () => Y,
	lightBakeKey: () => we,
	normalizeAgentBake: () => Ce,
	staleBakeProblems: () => Ee,
	traceGridKernel: () => $
}), K = 16, xe = [
	"preset",
	"samples",
	"bounces",
	"texelsPerUnit",
	"probes",
	"irradianceGrid",
	"gridFog",
	"rebake"
], Se = [
	"emission",
	"emissiveColor",
	"emissiveMap",
	"lightMap",
	"lightMapScale",
	"occlusionMap",
	"occlusionStrength"
];
function Ce(e) {
	if (e == null) return null;
	if (D(e, xe, "bake"), e.preset !== void 0 && !Object.hasOwn(A, e.preset)) throw t("bake.preset", e.preset, `one of ${Object.keys(A).join(", ")}`);
	let n = { ...A[e.preset ?? "standard"] };
	for (let [t, [r, i]] of Object.entries(j)) e[t] !== void 0 && (n[t] = O(e[t], `Bake ${t}`, r, i));
	n.probes = e.probes === void 0 ? "room" : e.probes === !1 || e.probes === "room" ? e.probes : v(e.probes);
	let r = ae(e.irradianceGrid);
	if (r && (n.irradianceGrid = r), e.gridFog !== void 0 && typeof e.gridFog != "boolean") throw t("bake.gridFog", e.gridFog, "true or false");
	if (e.gridFog === !0) {
		if (!r) throw t("bake.gridFog", e.gridFog, "true only together with bake.irradianceGrid, such as irradianceGrid: true");
		n.gridFog = !0;
	}
	if (e.rebake !== void 0 && typeof e.rebake != "boolean") throw t("bake.rebake", e.rebake, "true or false");
	e.rebake === !0 && (n.rebake = !0);
	for (let e of ["samples", "bounces"]) if (!Number.isInteger(n[e])) throw t(`bake.${e}`, n[e], "a whole number, such as 64");
	return n;
}
function we(e, t, n, r) {
	let { pointLights: i, spotLights: a, areaLights: o, keyColor: s, keyIntensity: c, lightDirection: l, keyAffects: u } = n;
	return JSON.stringify([
		{
			...e.bake,
			rebake: void 0
		},
		[...t],
		i,
		a,
		o,
		s,
		c,
		l,
		u,
		e.materials,
		[...r].map(([e, t]) => [e, Array.from(t)])
	]);
}
function q(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.particles?.systems ?? []) t.set(n.node, "a hair or particle system");
	for (let n of e.cloth?.sheets ?? []) t.set(n.node, "a cloth simulation");
	return t;
}
function Te(e, t, n, r) {
	let i = r.movedLook ? g(structuredClone(e.environment), r.movedLook) : e.environment, a = new Map(t.map((e) => [e.name, new Float32Array(r.graph.getNode(e.name).worldMatrix)]));
	return {
		environment: i,
		worldMatrices: a,
		key: we(e, n, i, a)
	};
}
function Ee(e, t) {
	if (e.recipe.bake.rebake) return [];
	let n = {
		graph: e.poseGraph ?? e.graph,
		movedLook: e.movedLook
	};
	return Te(e.recipe, e.sourceRestParts, q(e.recipe), n).key === t ? [] : [ke()];
}
var De = 4;
function Oe(e, t, n) {
	let r = q(t), { key: i, environment: a, worldMatrices: o } = Te(t, e.sourceRestParts, r, n);
	if (i === e.currentKey) return null;
	let s = e.cache ??= /* @__PURE__ */ new Map([[e.key, e]]), c = s.get(i), l = !!c;
	return s.delete(i), c ??= Be(e.sourceRestParts, o, a, t.bake, r), s.set(i, c), s.size > De && s.delete(s.keys().next().value), e.currentKey = i, {
		parts: c.parts,
		report: {
			...c.report,
			reused: l
		}
	};
}
function ke() {
	return {
		kind: "bake-stale",
		severity: "warning",
		target: "bake",
		message: "A light, the sun or a part has moved from the pose the bake was traced at, so the baked light no longer matches the frame.",
		fix: "Bounced light does not follow motion. Bake a pose that stays put, or set bake.rebake true (scene_apply set-bake) to bake each sampled pose. Material animation is not checked."
	};
}
function Ae(e) {
	return Object.values(A).some((t) => Object.keys(t).every((n) => t[n] === e[n]));
}
function J(e, t) {
	return s(e, t).texels * t.samples * t.bounces;
}
function je(e, t) {
	let n = 0, r = t.texelsPerUnit;
	for (let i = 0; i < 12; i++) {
		let i = Math.floor((n + r) / 2 * 100) / 100;
		if (i <= n) break;
		J(e, {
			...t,
			texelsPerUnit: i
		}) <= 24e6 ? n = i : r = i;
	}
	return n >= j.texelsPerUnit[0] ? n : 0;
}
function Me(e, t, n) {
	let r = Math.floor(M * t.samples / n), i = je(e, t), a = [];
	r >= j.samples[0] && a.push(`samples ${r} or fewer with texelsPerUnit ${t.texelsPerUnit}`), i > 0 && a.push(`texelsPerUnit ${i} or less with samples ${t.samples}`);
	let o = a.length > 0 ? `At bounces ${t.bounces} this scene fits ${a.join(", or ")}.` : "Remove parts or lights, or lower bounces.";
	return `The bake would follow ${n} path steps (texels x samples x bounces); the limit for explicit settings is ${M}. ${o}`;
}
function Ne(e) {
	return {
		...e,
		samples: Math.max(K, Math.floor(e.samples * .8)),
		texelsPerUnit: Math.max(j.texelsPerUnit[0], Math.round(e.texelsPerUnit * .9 * 100) / 100)
	};
}
function Y(e, t) {
	if (!Ae(t)) {
		let n = J(e, t);
		if (n > 24e6) throw RangeError(Me(e, t, n));
		return {
			used: t,
			reduced: !1,
			reduction: null
		};
	}
	for (let n = t.bounces; n >= j.bounces[0]; n--) {
		let r = {
			...t,
			bounces: n
		};
		for (; J(e, r) > 5e6 && !Pe(r);) r = Ne(r);
		if (J(e, r) <= 5e6) {
			let e = r.samples !== t.samples || r.bounces !== t.bounces || r.texelsPerUnit !== t.texelsPerUnit;
			return {
				used: r,
				reduced: e,
				reduction: e ? Fe(t, r) : null
			};
		}
	}
	throw RangeError(`Even ${K} samples, 1 bounce and texelsPerUnit ${j.texelsPerUnit[0]} is over the preset budget of ${k} path steps for this scene. Remove parts or lights.`);
}
function Pe(e) {
	return e.samples <= K && e.texelsPerUnit <= j.texelsPerUnit[0];
}
function Fe(e, t) {
	return `The preset asked for samples ${e.samples}, bounces ${e.bounces}, texelsPerUnit ${e.texelsPerUnit}; this scene is too large for that within the preset budget of ${k} path steps, so it baked samples ${t.samples}, bounces ${t.bounces}, texelsPerUnit ${t.texelsPerUnit} (bake.used). For a denser bake pass explicit samples, bounces and texelsPerUnit, up to ${M} path steps and 20 s.`;
}
function Ie(e, t) {
	let n = Math.max(j.samples[0], Math.floor(t.samples / 2));
	return `${e.message} The scene is unchanged. Try samples ${n}, or texelsPerUnit ${Math.max(j.texelsPerUnit[0], Math.round(t.texelsPerUnit / 2 * 100) / 100)}.`;
}
function Le(e, t) {
	let n = {};
	for (let r of Object.keys(t)) {
		let i = Se.includes(r) ? t : e;
		Object.defineProperty(n, r, {
			enumerable: !0,
			get: () => i[r]
		});
	}
	return Object.freeze(n);
}
function Re() {
	return typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
}
function X() {
	return Re() ? 90 : 20;
}
function ze(e, t) {
	try {
		return f(e, t);
	} catch (e) {
		throw /passed maxSeconds/.test(e.message) ? Error(Ie(e, t)) : e;
	}
}
function Z(e, t, n) {
	let r = u(e, t, {
		...n,
		maxSeconds: X()
	}), { used: i, reduced: a, reduction: o } = Y(r, n), { parts: s, report: c } = ze(r, i);
	return {
		changed: Q(s, e),
		report: c,
		used: i,
		reduced: a,
		reduction: o
	};
}
function Q(e, t) {
	let n = [];
	return e.forEach((e, r) => {
		e !== t[r] && n.push([r, e]);
	}), n;
}
function Be(e, t, n, r, i = /* @__PURE__ */ new Map()) {
	let a = n.keyIntensity ?? 1, o = {
		pointLights: n.pointLights,
		spotLights: n.spotLights,
		areaLights: n.areaLights,
		keyColor: Array.from(n.keyColor, (e) => e * a),
		skyTop: n.skyTop,
		skyBottom: n.skyBottom,
		lightDirection: n.lightDirection
	};
	r.gridFog && (o.volumeFog = n.volumeFog, o.skyMean = N(n.map));
	let s = e.map((e) => ({
		...e,
		matrix: t.get(e.name),
		material: { ...e.material },
		generatesGeometry: i.get(e.name) ?? !1
	}));
	if (r.irradianceGrid) return Ue(e, s, o, r);
	let { changed: c, report: l, used: u, reduced: d, reduction: f } = h("lightBake", [
		s,
		o,
		r
	], Z), p = r.probes ? h("probeTrace", [
		s,
		o,
		r.probes,
		{
			environment: o,
			maxSeconds: X()
		}
	], _) : null, m = s.slice();
	for (let [e, t] of c) m[e] = t;
	let g = e.map((e, t) => {
		if (m[t] === s[t]) return e;
		let { geometry: n, material: r } = m[t];
		return Object.freeze({
			...e,
			geometry: n,
			material: Le(e.material, r)
		});
	}), v = p ? b(g, p) : null;
	return {
		parts: Object.freeze(v ? v.parts : g),
		report: {
			...r,
			...v ? { probes: v.report } : {},
			used: u,
			reduced: d,
			reduction: f,
			texels: l.texels,
			rayWork: l.rayWork,
			seconds: l.seconds,
			backend: l.backend,
			...l.gpu ? {
				gpu: l.gpu,
				gpuCompileSeconds: l.gpuCompileSeconds
			} : {},
			bakedParts: l.parts.length,
			skipped: l.skipped
		}
	};
}
var Ve = 4, He = 8;
function $(e, t, n) {
	return ue(e, t, {
		...n,
		maxSeconds: X()
	});
}
function Ue(e, t, n, r) {
	let i = {
		resolution: r.irradianceGrid,
		samples: Math.max(He, Math.round(r.samples / Ve)),
		bounces: r.bounces
	}, a = de(h("gridTrace", [
		t,
		n,
		i
	], $)), o = r.probes ? h("probeTrace", [
		t,
		n,
		r.probes,
		{
			environment: n,
			maxSeconds: X()
		}
	], _) : null, s = he(e, a), c = o ? b(s, o) : null, { data: l, ...u } = a;
	return {
		parts: Object.freeze(c ? c.parts : s),
		report: {
			...r,
			...c ? { probes: c.report } : {},
			used: r,
			reduced: !1,
			reduction: null,
			texels: 0,
			rayWork: 0,
			seconds: a.seconds,
			bakedParts: 0,
			skipped: [],
			irradianceGrid: u
		}
	};
}
export { $ as a, Y as i, Z as n, Q as r, be as t };
