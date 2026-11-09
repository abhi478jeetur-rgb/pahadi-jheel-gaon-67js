/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, n as t, o as n, r, u as i } from "./mat4-BCZClxna.js";
import { r as a, t as o } from "./mat3-BUCH0Dej.js";
import { E as s, c, n as l, p as u, r as d, u as f } from "./agent-scene-CyG0Wljh.js";
import { o as p } from "./camera-DqWdI22s.js";
import { a as m, o as ee } from "./skinning-DjFQA5hH.js";
import { i as te, n as h } from "./morph-CbizhGSZ.js";
import { a as g, c as _, i as v, l as y, n as ne, o as b, s as re, t as x } from "./agent-motion-BumZoRED.js";
import { a as S, n as C, t as w } from "./skeleton-pose-DVe89ZSy.js";
import { a as T } from "./field-error-DPtscRqU.js";
import "./agent-scene-capabilities-BGAS_VVR.js";
// src/agent-asset-mesh.js
var E = 25e4;
function D(e) {
	return e.map((e) => e.id).join(", ");
}
function ie(e, t) {
	if (e === void 0) return [];
	if (!Array.isArray(e) || e.length > T.maxEditedParts) throw RangeError(`meshEdits must be an array of at most ${T.maxEditedParts} parts.`);
	let n = /* @__PURE__ */ new Set(), r = [];
	for (let i of e) {
		let e = Object.keys(i ?? {}).find((e) => e !== "id" && e !== "edits");
		if (!i || typeof i != "object" || e || !Array.isArray(i.edits)) throw TypeError("Each meshEdits entry is { id, edits } with an edits array.");
		if (!t.some((e) => e.id === i.id) || n.has(i.id)) throw RangeError(`Unknown or repeated mesh ID: ${i.id}. Imported mesh IDs are ${D(t.slice(0, 8))}...; scene_inspect lists them.`);
		n.add(i.id), u("mesh").normalizeMeshEdits(i.edits), i.edits.length && r.push({
			id: i.id,
			edits: structuredClone(i.edits)
		});
	}
	return r;
}
function ae(e, t, n) {
	if (!n.some((e) => e.id === t.geometry)) throw RangeError(`Unknown mesh ID: ${t.geometry}. Imported mesh IDs are ${D(n.slice(0, 8))}...; scene_inspect lists them.`);
	if (t.replace !== void 0 && typeof t.replace != "boolean") throw TypeError("replace must be boolean.");
	if (!Array.isArray(t.edits)) throw TypeError("edit-mesh needs an edits array.");
	let r = e.find((e) => e.id === t.geometry), i = t.replace || !r ? t.edits : [...r.edits, ...t.edits];
	return [...e.filter((e) => e.id !== t.geometry), {
		id: t.geometry,
		edits: i
	}];
}
function O(e, t) {
	let n = e.source.skin ? "skin weights" : "morph targets";
	return `${e.id} cannot keep its ${n} after this edit: ${t.message} Undo with scene_restore or replace the edit log, and cut within the existing surface.`;
}
function k(e, t, n, r) {
	let i = e.source.geometry, a = u("mesh").editImportedGeometry(i, n, {
		maxVertices: E,
		smoothAngle: 30,
		materialTag: e.material.id,
		resolveCutter: (e) => d(e, E)
	}), o;
	try {
		m(a.geometry, e.source.skin), o = h(a.geometry, e.source.morph);
	} catch (t) {
		throw RangeError(O(e, t));
	}
	return u("mesh").registerEditedMesh(a.geometry, a.mesh, a.results), {
		key: t,
		geometry: a.geometry,
		info: r(a.geometry),
		morphMetadata: o,
		results: a.results,
		transfer: a.transfer
	};
}
function oe(e, t, n, r) {
	let i = /* @__PURE__ */ new Map();
	for (let a of e) {
		let e = JSON.stringify(a.edits), o = t.find((e) => e.id === a.id), s = n.get(a.id);
		try {
			i.set(a.id, s?.key === e ? s : k(o, e, a.edits, r));
		} catch (e) {
			throw e.message.startsWith(a.id) ? e : RangeError(`${a.id}: ${e.message}`);
		}
	}
	return i;
}
function se(e) {
	return [...e].map(([e, t]) => `${e}:${t.key}`).sort().join("|");
}
// src/agent-asset.js
s("motion", x);
var ce = 16, A = 1048576, le = 8, ue = 256, de = 2e6, j = [
	"translation",
	"rotation",
	"scale"
], M = [
	"color",
	"metallic",
	"roughness",
	"emission",
	"emissiveColor"
], fe = [
	"environment",
	"effects",
	"shadow"
], pe = Object.freeze({
	"set-environment": "environment",
	"set-effects": "effects",
	"set-shadow": "shadow"
}), me = Object.freeze({
	format: "67js.asset",
	schemaVersion: 1,
	fixedTopology: !1,
	operations: Object.freeze([
		"set-camera",
		"set-environment",
		"set-effects",
		"set-shadow",
		"set-root",
		"set-animation",
		"set-material",
		"set-asset-node",
		"set-motion",
		"set-physics",
		"edit-mesh"
	]),
	motionDrive: "drive {path | legs [{path, direction forward|reverse, pause}], cruiseSpeed | speed, wheels auto | [{id,node,side,axle,radius}], lights {headlights, tailLights [{material,signal brake|reverse,off,on}]}}: a car along a path; duration may be left out. scene_inspect motionDrive reports wheels, rejectedNames and light signals; docs/vehicle.md has every field",
	ragdoll: "physics {duration, floor?, ragdoll {}}: joints fall limp onto a floor at world height floor (default 0)",
	boundsKind: "authored-base-world"
});
function N(e, t, n) {
	if (!e || typeof e != "object" || Array.isArray(e) || Object.getPrototypeOf(e) !== Object.prototype && Object.getPrototypeOf(e) !== null) throw TypeError(`${n} must be a plain JSON object.`);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`Unknown ${n} field: ${r}. Allowed fields: ${t.join(", ")}.`);
}
function P(e) {
	let t = 0, n = /* @__PURE__ */ new Set(), r = new TextEncoder();
	function i(e) {
		if (t += e, t > A) throw RangeError("Asset recipe JSON exceeds 1 MiB. Reduce the input.");
	}
	function a(e, t) {
		if (t > 64) throw RangeError("Asset recipe JSON nesting exceeds 64 levels.");
		if (e === null || typeof e == "boolean") return i(e === null ? 4 : String(e).length), e;
		if (typeof e == "number" && Number.isFinite(e) && Number.isFinite(Math.fround(e))) return i(String(e).length), e;
		if (typeof e == "string") {
			if (e.length > A) throw RangeError("Asset recipe JSON exceeds 1 MiB.");
			return i(r.encode(JSON.stringify(e)).length), e;
		}
		if (!e || typeof e != "object" || n.has(e)) throw TypeError("Asset recipe requires finite, acyclic JSON data.");
		let o = Array.isArray(e);
		if (o && (e.length > A || Object.getPrototypeOf(e) !== Array.prototype)) throw TypeError("Asset recipe arrays must be ordinary bounded JSON arrays.");
		if (!o && Object.getPrototypeOf(e) !== Object.prototype && Object.getPrototypeOf(e) !== null) throw TypeError("Asset recipe objects must be plain JSON objects.");
		n.add(e), i(2);
		let s = o ? [] : {};
		for (let n of Reflect.ownKeys(e)) {
			if (o && n === "length") continue;
			if (typeof n != "string" || n === "__proto__") throw TypeError("Invalid asset recipe JSON key.");
			let c = Object.getOwnPropertyDescriptor(e, n);
			if (!c.enumerable || !Object.hasOwn(c, "value")) throw TypeError("Asset recipe accessors and hidden fields are unsupported.");
			if (o && n !== String(s.length)) throw TypeError("Asset recipe arrays must be dense without extra fields.");
			i(o ? 1 : r.encode(JSON.stringify(n)).length + 2), s[n] = a(c.value, t + 1);
		}
		if (o && s.length !== e.length) throw TypeError("Asset recipe arrays cannot contain trailing holes.");
		return n.delete(e), s;
	}
	let o = a(e, 0);
	if (r.encode(JSON.stringify(o)).length > A) throw RangeError("Asset recipe JSON exceeds 1 MiB.");
	return o;
}
function F(e, t, n) {
	if (!Array.isArray(e) || e.length !== t || !e.every((e) => typeof e == "number" && Number.isFinite(Math.fround(e)))) throw TypeError(`${n} requires ${t} finite Float32 numbers.`);
	return [...e];
}
function he(e = {}) {
	N(e, j, "root");
	let t = {
		translation: F(e.translation === void 0 ? [
			0,
			0,
			0
		] : e.translation, 3, "root translation"),
		rotation: F(e.rotation === void 0 ? [
			0,
			0,
			0,
			1
		] : e.rotation, 4, "root rotation"),
		scale: F(e.scale === void 0 ? [
			1,
			1,
			1
		] : e.scale, 3, "root scale")
	}, n = Math.hypot(...t.rotation);
	if (n === 0 || t.scale.some((e) => Math.fround(e) <= 0)) throw RangeError("Root needs a nonzero quaternion and positive Float32 scales.");
	return t.rotation = t.rotation.map((e) => e / n), t;
}
function ge(e, t = []) {
	let n = {
		format: "67js.scene",
		schemaVersion: 1,
		geometries: [],
		materials: t,
		nodes: []
	};
	for (let t of ["camera", ...fe]) Object.hasOwn(e, t) && (n[t] = e[t]);
	return l(n, { maxMaterials: Math.max(256, t.length) }).exportRecipe();
}
function _e(e) {
	let t = [
		0,
		0,
		0
	];
	for (let n = 0; n < e.positions.length; n += 3) for (let r = 0; r < 3; r++) t[r] = Math.max(t[r], Math.abs(e.positions[n + r]));
	return t;
}
function ve(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r = 0; r < e.positions.length; r += 3) for (let i = 0; i < 3; i++) t[i] = Math.min(t[i], e.positions[r + i]), n[i] = Math.max(n[i], e.positions[r + i]);
	return {
		min: t,
		max: n
	};
}
function ye(e, t) {
	let n = [
		Infinity,
		Infinity,
		Infinity
	], r = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let i = 0; i < e.length; i++) {
		let a = e[i].bounds, o = t[i];
		for (let e = 0; e < 8; e++) {
			let t = a.min.map((t, n) => e & 1 << n ? a.max[n] : t);
			for (let e = 0; e < 3; e++) {
				let i = o[e] * t[0] + o[e + 4] * t[1] + o[e + 8] * t[2] + o[e + 12];
				n[e] = Math.min(n[e], i), r[e] = Math.max(r[e], i);
			}
		}
	}
	return {
		min: n,
		max: r
	};
}
function be(e, t, n) {
	for (let r = 0; r < 4; r++) {
		let i = 0;
		for (let a = 0; a < 4; a++) {
			let o = Math.abs(t[a * 4 + r]);
			if (n) {
				o = 0;
				for (let e = 0; e < 4; e++) {
					let i = 0;
					for (let t = a * 4 + e; t < n.jointMatrices.length; t += 16) i = Math.max(i, Math.abs(n.jointMatrices[t]));
					if (o += Math.abs(t[e * 4 + r]) * i * (1 + 2 ** -21), !Number.isFinite(Math.fround(o))) throw RangeError("Asset world/skin matrix products exceed Float32 range.");
				}
			}
			if (i += o * (a === 3 ? 1 : e[a]), !Number.isFinite(Math.fround(i))) throw RangeError("Asset world geometry bounds exceed Float32 range.");
		}
	}
}
function xe(e, t) {
	let n = [
		Infinity,
		Infinity,
		Infinity
	], r = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let i = 0; i < e.length; i++) {
		let a = e[i].positions, o = t[i];
		for (let e = 0; e < a.length; e += 3) for (let t = 0; t < 3; t++) {
			let i = o[t] * a[e] + o[4 + t] * a[e + 1] + o[8 + t] * a[e + 2] + o[12 + t];
			n[t] = Math.min(n[t], i), r[t] = Math.max(r[t], i);
		}
	}
	return {
		min: n,
		max: r
	};
}
function Se(e) {
	let t = e.min.map((t, n) => (t + e.max[n]) / 2), n = Math.hypot(...e.max.map((t, n) => (t - e.min[n]) / 2)), r = Math.max(.001, n * .001), i = Math.max(10, n * 10), a = Math.max(1, n), o = Math.hypot(4, 3, 5), s = [
		4,
		3,
		5
	].map((e) => e / o), c = {
		target: t,
		eye: t.map((e, t) => e + s[t] * a),
		up: [
			0,
			1,
			0
		],
		fov: 45,
		near: r,
		far: i
	}, l = p({
		minimum: e.min,
		maximum: e.max
	}, c, 1, 1.2);
	return c.eye = t.map((e, t) => e + s[t] * l), c;
}
function I(s, l, { sources: d } = {}) {
	if (!s || !Array.isArray(s.parts) || !Array.isArray(s.animations) || typeof s.stagePose != "function" || !Array.isArray(s.nodes)) throw TypeError("createAgentAssetScene requires a decoded parseGltf asset.");
	if (!s.parts.length) throw TypeError("This file has no meshes, so there is nothing to draw. A skeleton-only file works as a clip source: set motion.layers[].from on a character that has a mesh.");
	if (s.parts.length > 4096 || s.animations.length > 256 || new Set(s.parts.map((e) => e.material)).size > 4096) throw RangeError("Asset budgets allow 4096 parts, 4096 materials, and 256 animation clips.");
	let p = [...s.parts], x = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), D = p.map((e, t) => {
		if (!x.has(e.material)) {
			let t = `material-${x.size}`, n = {};
			for (let t of M) {
				let r = e.material[t];
				r !== void 0 && (n[t] = Array.isArray(r) ? [...r] : r);
			}
			x.set(e.material, {
				id: t,
				baseline: n
			});
		}
		if (!T.has(e.geometry)) {
			let t = h(e.geometry, e.morph);
			t && E.set(e.geometry, t), T.set(e.geometry, {
				id: `geometry-${T.size}`,
				maxima: _e(e.geometry),
				bounds: ve(e.geometry)
			});
		}
		return m(e.geometry, e.skin), {
			id: `mesh-${t}`,
			label: String(e.name ?? `Mesh ${t}`).slice(0, 256),
			source: e,
			geometry: T.get(e.geometry),
			material: x.get(e.material),
			sourceMatrix: e.matrix,
			jointMatrices: e.skin?.jointMatrices,
			jointWorldMatrices: e.skin?.jointWorldMatrices,
			morphWeights: e.morph?.weights
		};
	}), O = new Map([...x.values()].map((e) => [e.id, e])), k = new Map(s.nodes.map((e) => [e.id, structuredClone(e)])), A = b(s.animations, [...k.values()]);
	function F(e) {
		for (let [t, n] of Object.entries(e ?? {})) /^[a-f0-9]{64}$/i.test(t) && A.external.set(t.toLowerCase(), re(n));
	}
	F(d);
	let I = /* @__PURE__ */ new Map(), Ce = p.map((e) => e.morph ? Float32Array.from(e.morph.weights) : null);
	p.forEach((e, t) => {
		(e.morphTargetNames ?? []).forEach((e, n) => {
			I.has(e) || I.set(e, []), I.get(e).push({
				part: t,
				index: n
			});
		});
	});
	let we = P(l), Te = we?.assetId;
	if (typeof Te != "string" || !/^[a-f0-9]{64}$/i.test(Te)) throw TypeError("assetId must contain 64 SHA256 hexadecimal characters.");
	let L = Te.toLowerCase(), Ee = !Object.hasOwn(we, "camera"), R, De = /* @__PURE__ */ new Map(), z = [], B = 0, Oe = null, V = null, ke = null, Ae = null, H = null, U = null, je, W = /* @__PURE__ */ new Map(), Me = new Map([...x].map(([e, t]) => {
		let n = {};
		for (let [t, r] of Object.entries(e)) M.includes(t) || (n[t] = Array.isArray(r) ? Object.freeze([...r]) : r);
		for (let e of M) Object.defineProperty(n, e, {
			enumerable: !0,
			get() {
				return De.get(t.id)[e];
			}
		});
		return [t.id, Object.freeze(n)];
	})), Ne = D.map((e) => new Float32Array(e.source.matrix)), G = /* @__PURE__ */ new Map(), Pe = se(G), K = 0;
	function Fe(e) {
		let t = D.find((t) => t.id === e);
		if (t) return t;
		let n = k.get(e);
		if (!n) throw RangeError(`Unknown mesh ID: ${e}. Imported mesh IDs look like mesh-0, mesh-1; call scene_inspect without ids to list them, or with kind hierarchy for source nodes.`);
		let r = n.meshIds ?? [];
		if (r.length === 0) throw RangeError(`Source node ${e} has no mesh of its own. Inspect a mesh ID such as mesh-0, or call scene_inspect with kind hierarchy to see which nodes hold parts.`);
		if (r.length > 1) {
			let t = r.slice(0, 8).join(", ");
			throw RangeError(`Source node ${e} holds ${r.length} parts: ${t}${r.length > 8 ? ", ..." : ""}. Pass the part IDs you want.`);
		}
		return D.find((e) => e.id === r[0]);
	}
	function q(e, t = G) {
		return t.get(e.id)?.geometry ?? e.source.geometry;
	}
	function Ie(e, t = G) {
		return t.get(e.id)?.info ?? e.geometry;
	}
	function Le(e, t = G) {
		return t.get(e.id)?.morphMetadata ?? E.get(e.source.geometry);
	}
	function Re(e) {
		return {
			maxima: _e(e),
			bounds: ve(e)
		};
	}
	function ze(e) {
		return Object.freeze(D.map((t, n) => {
			let r = {
				name: t.id,
				geometry: q(t, e),
				matrix: Ne[n],
				material: Me.get(t.material.id)
			};
			return t.source.skin && (r.skin = t.source.skin), t.source.morph && (r.morph = t.source.morph), t.source.castShadow !== void 0 && (r.castShadow = t.source.castShadow), Object.freeze(r);
		}));
	}
	let J = ze(G), Be = Object.freeze({
		...me,
		animations: s.animations.length,
		skinning: J.some((e) => !!e.skin),
		morphTargets: J.some((e) => !!e.morph),
		textures: [...Me.values()].some((e) => !!(e.map || e.normalMap || e.metallicRoughnessMap || e.occlusionMap || e.emissiveMap))
	});
	function Ve(e) {
		let t = P(e);
		if (N(t, [
			"format",
			"schemaVersion",
			"assetId",
			"camera",
			...fe,
			"root",
			"animation",
			"materialOverrides",
			"nodeOverrides",
			"motion",
			"physics",
			"meshEdits"
		], "asset recipe"), t.format !== "67js.asset" || t.schemaVersion !== 1 || typeof t.assetId != "string" || t.assetId.toLowerCase() !== L) throw RangeError("Expected the bound 67js.asset schemaVersion 1 assetId.");
		let n = t.materialOverrides === void 0 ? [] : t.materialOverrides;
		if (!Array.isArray(n) || n.length > O.size) throw RangeError("materialOverrides must be an array within the decoded material count.");
		let r = /* @__PURE__ */ new Set(), i = ge(t, n.map((e) => {
			N(e, ["id", ...M], "material override");
			let t = O.get(e.id);
			if (!t || r.has(e.id)) throw RangeError("Material override IDs must exist and be distinct.");
			return r.add(e.id), {
				id: e.id,
				...t.baseline,
				...e
			};
		})), a = i.materials.map((e) => {
			let t = { id: e.id };
			for (let n of M) e[n] !== void 0 && (t[n] = e[n]);
			return t;
		}), o = t.animation === void 0 ? null : t.animation;
		if (o !== null) {
			N(o, ["clip", "time"], "animation");
			let e = s.animations[o.clip];
			if (!Number.isInteger(o.clip) || !e || !Number.isFinite(o.time) || o.time < 0 || o.time > e.duration) throw RangeError("Animation needs an existing clip and time within its duration.");
		}
		let c = t.nodeOverrides === void 0 ? [] : t.nodeOverrides;
		if (!Array.isArray(c) || c.length > k.size) throw RangeError("nodeOverrides must fit the decoded source-node count.");
		let l = /* @__PURE__ */ new Set(), d = c.map((e) => {
			N(e, ["id", ...j], "node override");
			let t = k.get(e.id);
			if (!t || l.has(e.id) || !t.editable) throw RangeError("Node override IDs must exist, be editable and be distinct.");
			l.add(e.id);
			let n = Object.keys(e).filter((e) => e !== "id");
			if (!n.length) throw RangeError("Node overrides need at least one local transform component.");
			let r = he(Object.fromEntries(n.map((t) => [t, e[t]])));
			return {
				id: e.id,
				...Object.fromEntries(n.map((e) => [e, r[e]]))
			};
		}), f = P({
			format: "67js.asset",
			schemaVersion: 1,
			assetId: L,
			camera: i.camera,
			environment: i.environment,
			effects: i.effects,
			shadow: i.shadow,
			root: he(t.root),
			animation: o,
			materialOverrides: a,
			nodeOverrides: d
		}), p = ie(t.meshEdits, D);
		if (p.length && (f.meshEdits = p), (t.motion?.ik?.length || t.motion?.footLock) && Math.max(...f.root.scale) - Math.min(...f.root.scale) > .001 * Math.max(...f.root.scale)) throw RangeError("Motion ik and footLock need a uniform asset root scale.");
		return f.motion = v(t.motion, X(f)), t.physics !== void 0 && t.physics !== null && (f.physics = u("physics").normalizeAssetPhysics(t.physics)), P(f);
	}
	let Y = /* @__PURE__ */ new Map();
	function He(e) {
		let t = JSON.stringify(e);
		return Y.has(t) || Y.set(t, u("drive").createAssetDrive(s, e, { materialIds: new Set(O.keys()) })), Y.get(t);
	}
	function X(e) {
		let r = new Map([...O].map(([e, t]) => [e, {
			id: e,
			...t.baseline
		}]));
		for (let t of e.materialOverrides) r.set(t.id, {
			...r.get(t.id),
			...t
		});
		let i = e.root;
		return {
			nodes: [...k.values()].filter((e) => e.editable),
			materials: [...r.values()],
			camera: e.camera,
			buildDrive: He,
			normalizeDrive: (e) => u("drive").normalizeDrive(e),
			ikHierarchy: [...k.values()],
			clipLayerContext: A,
			morphTargets: [...I.keys()],
			ikRootMatrix: Array.from(n(t(), i.rotation, i.translation, [
				i.scale[0],
				i.scale[0],
				i.scale[0]
			]))
		};
	}
	function Z(e, t) {
		let n = s.stagePose({
			animation: e,
			nodeOverrides: t
		});
		try {
			return n.nodePoses();
		} finally {
			n.discard();
		}
	}
	let Q = /* @__PURE__ */ new Map();
	function Ue(e, t) {
		let n = JSON.stringify([
			e.from,
			e.scale,
			e.rootMotion,
			t
		]);
		if (!Q.has(n)) {
			let r = A.external.get(e.from.asset), i = w(r.animations[e.from.clip], { loop: t });
			Q.set(n, _(r.nodes, s.nodes, i, {
				scale: e.scale,
				rootMotion: e.rootMotion
			}));
		}
		return Q.get(n);
	}
	function We(e) {
		let t = e.motion;
		return t?.footLock ? g({
			settings: t.footLock,
			nodes: s.nodes,
			rootMatrix: X(e).ikRootMatrix,
			layers: Ke(t.layers),
			duration: t.duration,
			loop: t.loop
		}) : null;
	}
	function Ge(e, t) {
		if (!t?.size) return e;
		let n = new Map(e.map(({ part: e, weights: t }) => [e, t]));
		for (let [e, r] of t) for (let { part: t, index: i } of I.get(e) ?? []) n.has(t) || n.set(t, Array.from(Ce[t])), n.get(t)[i] = r.weight;
		return [...n].map(([e, t]) => ({
			part: e,
			weights: t
		}));
	}
	function Ke(e) {
		return e.map((e) => {
			let t = e.loop !== !1;
			if (e.from) return {
				clip: Ue(e, t),
				weight: e.weight,
				speed: e.speed,
				offset: e.offset,
				additive: e.additive,
				reference: e.reference,
				mask: e.mask
			};
			let n = s.animations[e.clip];
			return {
				clip: w(n, {
					loop: t,
					rename: e.bones
				}),
				...e.morph === !1 ? {} : { morphs: S(n, { loop: t }) },
				weight: e.weight,
				speed: e.speed,
				offset: e.offset,
				additive: e.additive,
				reference: e.reference,
				mask: e.mask
			};
		});
	}
	function qe(e) {
		return e?.layers?.length ? C(s, Ke(e.layers)) : null;
	}
	function Je(e, t, n, r) {
		let i = t?.evaluate(r), a = new Map(e.map((e) => [e.id, e]));
		for (let e of i?.nodeOverrides ?? []) a.set(e.id, {
			...a.get(e.id),
			...e
		});
		return {
			nodeOverrides: Ye([...a.values()], n),
			morphWeights: Ge(i?.morphWeights ?? [], n?.morphs)
		};
	}
	function Ye(e, t) {
		let n = new Map(e.map((e) => [e.id, e]));
		for (let [e, r] of t?.nodes ?? []) {
			let t = Object.fromEntries(Object.entries(r).map(([e, t]) => [e, Array.from(t)]));
			n.set(e, {
				...n.get(e),
				id: e,
				...t
			});
		}
		return n;
	}
	function Xe(e) {
		if (!e.physics) return null;
		let r = JSON.stringify([
			e.physics,
			e.animation,
			e.nodeOverrides,
			e.root
		]);
		if (ke?.key !== r) {
			let i = e.root, a = n(t(), i.rotation, i.translation, i.scale), o = Z(e.animation, e.nodeOverrides);
			ke = {
				key: r,
				sampler: u("physics").bakeAssetRagdoll(e.physics, [...k.values()], o, a)
			};
		}
		return ke.sampler;
	}
	function Ze(e, t) {
		return [...e.sample(Math.min(t, e.duration))].map(([e, t]) => ({
			id: e,
			translation: Array.from(t.translation),
			rotation: Array.from(t.rotation)
		}));
	}
	function $(i, c = !1, l = !0, u = void 0, d = void 0) {
		let f = u === void 0 ? Ve(i) : R;
		d !== void 0 && (f = {
			...f,
			animation: d
		});
		let p = u === void 0 ? ne(f.motion, X(f)) : Oe, m = u === void 0 ? qe(f.motion) : Ae, h = u === void 0 ? We(f) : H, g = u === void 0 ? Xe(f) : V, _ = u === void 0 ? f.motion || f.physics ? 0 : null : u;
		if (_ !== null && !p && !g) throw RangeError("The asset has no authored motion or physics to sample.");
		let v = _ === null ? null : p?.sample(_);
		if (s.parts.length !== D.length) throw RangeError("Decoded part membership must remain fixed.");
		let y = oe(f.meshEdits ?? [], D, G, Re);
		for (let e = 0; e < D.length; e++) {
			let t = D[e], n = t.source;
			if (s.parts[e] !== n || q(t) !== J[e].geometry || n.skin !== J[e].skin || n.morph !== J[e].morph || n.matrix !== t.sourceMatrix || n.skin?.jointMatrices !== t.jointMatrices || n.skin?.jointWorldMatrices !== t.jointWorldMatrices || n.morph?.weights !== t.morphWeights || J[e].matrix.length !== 16 || J[e].matrix.byteLength !== 64) throw RangeError("Decoded resources and retained adapter matrices must not change identity or detach.");
		}
		let { nodeOverrides: b, morphWeights: re } = Je(f.nodeOverrides, _ === null ? null : m, v, _);
		if (_ !== null && h) {
			let e = Z(f.animation, [...b.values()]);
			for (let t of h.solve(_, e)) k.get(t.id)?.editable && b.set(t.id, {
				...b.get(t.id),
				...t
			});
		}
		if (_ !== null && p?.ikUsesStagedPose) {
			let e = Z(f.animation, [...b.values()]);
			for (let t of p.solveStagedPose(_, e)) b.set(t.id, {
				...b.get(t.id),
				...t
			});
		}
		if (_ !== null && g) for (let e of Ze(g, _)) b.set(e.id, {
			...b.get(e.id),
			...e
		});
		let x;
		try {
			x = s.stagePose({
				animation: f.animation,
				nodeOverrides: [...b.values()],
				morphWeights: re
			});
			let i = n(t(), f.root.rotation, f.root.translation, f.root.scale), d = o(), S = D.map((n, o) => {
				let s = x.parts[o], c = e(t(), i, s.matrix), l = r(c);
				if (!c.every(Number.isFinite) || !Number.isFinite(l) || l === 0 || !a(d, c) || !d.every(Number.isFinite)) throw RangeError("Asset root/world matrices must remain finite and nonsingular at Float32 precision.");
				return s.skin && ee(s.skin, q(n, y), c), s.morph ? te(s.morph, Le(n, y), c, s.skin) : be(Ie(n, y).maxima, c, s.skin), c;
			});
			c && (f.camera = Se(ye(D.map((e) => Ie(e, y)), S)), f = Ve(f), p = ne(f.motion, X(f)), v = _ === null ? null : p?.sample(_));
			let C = new Map([...O].map(([e, t]) => [e, { ...t.baseline }]));
			for (let e of f.materialOverrides) C.set(e.id, {
				...C.get(e.id),
				...e
			});
			for (let [e, t] of v?.materials ?? []) {
				let n = Object.fromEntries(Object.entries(t).map(([e, t]) => [e, typeof t == "number" ? t : Array.from(t)]));
				C.set(e, {
					...C.get(e),
					...n
				});
			}
			for (let e of C.values()) {
				for (let t of ["color", "emissiveColor"]) e[t] && Object.freeze(e[t]);
				Object.freeze(e);
			}
			let w = v?.camera ? {
				...f.camera,
				...Object.fromEntries(Object.entries(v.camera).filter(([e]) => e !== "projection").map(([e, t]) => [e, ArrayBuffer.isView(t) ? Array.from(t) : t]))
			} : f.camera;
			ge({ camera: w });
			let T = x;
			x = null, T.commit();
			for (let e = 0; e < J.length; e++) Float32Array.prototype.set.call(J[e].matrix, S[e]);
			let E = se(y);
			return E !== Pe && (G = y, Pe = E, J = ze(G), K++), u === void 0 && (R = f, Oe = p, V = g, Ae = m, H = h), De = C, je = w, U = _, u === void 0 && (z = S), l && B++, B;
		} catch (e) {
			throw x?.discard(), e;
		}
	}
	function Qe() {
		let e = c({
			assetId: L,
			warnings: s.warnings,
			skinnedParts: D.filter((e) => e.source.skin).length,
			jointCount: [...k.values()].filter((e) => e.joint).length,
			clipCount: s.animations.length
		});
		return e.length ? { diagnostics: e } : {};
	}
	function $e() {
		let e = (R.motion?.layers ?? []).flatMap((e, t) => e.from ? [{
			layer: t,
			from: e.from,
			...y(A.external.get(e.from.asset).nodes, [...k.values()], "retarget")
		}] : []);
		return {
			...e.length ? { retargets: e } : {},
			...H ? { footLock: H.report() } : {},
			...I.size ? { morphTargetNames: [...I.keys()].slice(0, 128) } : {}
		};
	}
	function et() {
		if (!R.motion?.drive) return {};
		let e = He(R.motion.drive);
		return { motionDrive: e.describe(U === null ? void 0 : e.sample(U).pose) };
	}
	function tt() {
		if (!R.motion?.ik?.length) return {};
		let e = ne(R.motion, X(R));
		return { motionIk: e.sweepIk((t) => Z(R.animation, [...Je(R.nodeOverrides, Ae, e.sample(t), t).nodeOverrides.values()])) };
	}
	function nt(e) {
		if (N(e, ["expectedRevision"], "transaction options"), !Number.isSafeInteger(e.expectedRevision) || e.expectedRevision !== B) throw RangeError("expectedRevision must match the current revision.");
	}
	return $(we, Ee, !1), Object.freeze({
		capabilities: Be,
		get parts() {
			return J;
		},
		get revision() {
			return B;
		},
		get topologyRevision() {
			return K;
		},
		get camera() {
			return structuredClone(je);
		},
		get motionTime() {
			return U;
		},
		get environment() {
			return structuredClone(R.environment);
		},
		get effects() {
			return structuredClone(R.effects);
		},
		get shadow() {
			return structuredClone(R.shadow);
		},
		exportRecipe() {
			return structuredClone(R);
		},
		provideMotionSources: F,
		sampleMotion(e) {
			if (e !== null && (!Number.isFinite(e) || e < 0 || e > 3600)) throw RangeError("Motion sample time must be null or within zero and 3600.");
			return $(R, !1, !1, e), U;
		},
		sampleFrame(e) {
			let t = P(e);
			N(t, ["animation", "motionTime"], "asset frame");
			let n = t.motionTime === void 0 ? U : t.motionTime;
			if (n !== null && (!Number.isFinite(n) || n < 0 || n > 3600)) throw RangeError("Motion sample time must be null or within zero and 3600.");
			return $(R, !1, !1, n, t.animation), U;
		},
		apply(e, t = {}) {
			if (nt(t), !Array.isArray(e) || !e.length || e.length > ue) throw RangeError("Asset operations must contain 1 to 256 commands.");
			let n = P(e), r = structuredClone(R);
			for (let e of n) {
				let t = Object.hasOwn(pe, e.type) ? pe[e.type] : null;
				if (t) {
					N(e, ["type", t], "operation");
					let n = e[t];
					N(n, Object.keys(r[t]), t);
					let i = t === "environment" ? "volumeFog" : t === "effects" ? "bloom" : null, a = {
						...r[t],
						...t === "environment" ? f(n) : n
					};
					i && Object.hasOwn(n, i) && (N(n[i], Object.keys(r[t][i]), i), a[i] = {
						...r[t][i],
						...n[i]
					}), r[t] = a;
				} else if (e.type === "set-camera") {
					N(e, ["type", ...Object.keys(r.camera)], "operation");
					for (let t of Object.keys(r.camera)) Object.hasOwn(e, t) && (r.camera[t] = e[t]);
				} else if (e.type === "set-root") {
					N(e, ["type", ...j], "operation");
					for (let t of j) Object.hasOwn(e, t) && (r.root[t] = e[t]);
				} else if (e.type === "set-motion") {
					if (N(e, ["type", "motion"], "operation"), !Object.hasOwn(e, "motion")) throw TypeError("set-motion requires a motion record or explicit null.");
					r.motion = e.motion;
				} else if (e.type === "set-physics") {
					if (N(e, ["type", "physics"], "operation"), !Object.hasOwn(e, "physics")) throw TypeError("set-physics requires physics; use null to clear it.");
					r.physics = e.physics;
				} else if (e.type === "set-asset-node") {
					if (N(e, [
						"type",
						"id",
						...j
					], "operation"), !k.has(e.id)) throw RangeError(`Unknown source-node ID: ${e.id}.`);
					let t = j.filter((t) => Object.hasOwn(e, t));
					if (!t.length) throw TypeError("set-asset-node needs a local transform component.");
					let n = r.nodeOverrides.find((t) => t.id === e.id);
					n || (n = { id: e.id }, r.nodeOverrides.push(n));
					for (let r of t) n[r] = e[r];
				} else if (e.type === "set-animation") {
					if (N(e, [
						"type",
						"clip",
						"time"
					], "operation"), e.clip === null) {
						if (Object.hasOwn(e, "time")) throw TypeError("Returning to the initial pose requires clip:null with time omitted.");
						r.animation = null;
					} else {
						let t = e.clip === void 0 ? r.animation?.clip : e.clip, n = r.animation !== null && t === r.animation.clip;
						r.animation = {
							clip: t,
							time: e.time === void 0 ? n ? r.animation.time : 0 : e.time
						};
					}
				} else if (e.type === "set-material") {
					if (N(e, [
						"type",
						"id",
						...M
					], "operation"), !O.has(e.id)) throw RangeError(`Unknown material ID: ${e.id}.`);
					let t = r.materialOverrides.find((t) => t.id === e.id);
					t || (t = { id: e.id }, r.materialOverrides.push(t));
					for (let n of M) Object.hasOwn(e, n) && (t[n] = e[n]);
				} else if (e.type === "edit-mesh") N(e, [
					"type",
					"geometry",
					"edits",
					"replace"
				], "operation"), r.meshEdits = ae(r.meshEdits ?? [], e, D);
				else throw TypeError("Unsupported asset operation. Imported parts take edit-mesh (mesh_edit with a mesh ID such as mesh-0); other geometry changes are unavailable.");
			}
			return $(r);
		},
		inspect(e = {}) {
			let t = P(e);
			N(t, [
				"ids",
				"limit",
				"includeBounds",
				"kind",
				"offset"
			], "inspection");
			let n = t.limit === void 0 ? 64 : t.limit;
			if (!Number.isInteger(n) || n < 1 || n > 256 || t.includeBounds !== void 0 && typeof t.includeBounds != "boolean") throw RangeError("Inspection needs limit from 1 to 256 and boolean includeBounds.");
			let r = t.offset === void 0 ? 0 : t.offset;
			if (!Number.isInteger(r) || r < 0 || r > 4096 || t.kind !== void 0 && !["meshes", "hierarchy"].includes(t.kind)) throw RangeError("Inspection kind must be meshes or hierarchy with an offset from zero to 4096.");
			if (t.kind === "hierarchy") {
				if (t.includeBounds) throw TypeError("Hierarchy inspection has no deformed silhouette bounds. Drop includeBounds, or inspect without kind to get mesh bounds.");
				if (t.ids !== void 0 && (!Array.isArray(t.ids) || t.ids.length > k.size)) throw RangeError("Hierarchy IDs must fit the source-node count.");
				let e = t.ids === void 0 ? [...k.values()] : t.ids.map((e) => {
					if (!k.has(e)) throw RangeError(`Unknown source-node ID: ${e}.`);
					return k.get(e);
				}), i = structuredClone(e.slice(r, r + n));
				return {
					revision: B,
					topologyRevision: K,
					assetId: L,
					kind: "hierarchy",
					...tt(),
					...et(),
					...$e(),
					...Qe(),
					counts: {
						nodes: k.size,
						joints: [...k.values()].filter((e) => e.joint).length
					},
					nodes: i,
					offset: r,
					truncated: r + i.length < e.length,
					motion: R.motion ? {
						duration: R.motion.duration,
						loop: R.motion.loop,
						tracks: R.motion.tracks.length,
						time: U
					} : null
				};
			}
			if (t.ids !== void 0 && (!Array.isArray(t.ids) || t.ids.length > D.length)) throw RangeError("Inspection IDs must be an array within the decoded part count.");
			let i = t.ids === void 0 ? D : t.ids.map((e) => Fe(e)), a = i.slice(r, r + n);
			if (t.includeBounds && a.reduce((e, t) => e + q(t).positions.length / 3, 0) > de) throw RangeError("Bounds inspection exceeds two million authored base vertices. Select fewer meshes.");
			let o = a.map((e) => {
				let n = Number(e.id.slice(5)), r = {
					id: e.id,
					label: e.label,
					geometry: e.geometry.id,
					material: e.material.id,
					vertices: q(e).positions.length / 3,
					triangles: q(e).indices.length / 3,
					skinned: !!e.source.skin,
					morphTargets: q(e).morphTargets?.length ?? 0,
					...G.has(e.id) ? { edited: !0 } : {}
				};
				return t.includeBounds && (r.bounds = xe([q(e)], [z[n]]), r.boundsKind = me.boundsKind), r;
			}), c = 0, l = 0, u = new Set(D.map((e) => q(e)));
			for (let e of u) {
				l += e.positions.length / 3;
				for (let t of Object.values(e)) ArrayBuffer.isView(t) && (c += t.byteLength);
				for (let t of e.morphTargets ?? []) c += (t.positions?.byteLength ?? 0) + (t.normals?.byteLength ?? 0);
			}
			return {
				revision: B,
				topologyRevision: K,
				assetId: L,
				...Qe(),
				counts: {
					nodes: J.length,
					parts: J.length,
					geometries: u.size,
					materials: x.size,
					vertices: l
				},
				geometryBytes: c,
				animation: structuredClone(R.animation),
				motion: R.motion ? {
					duration: R.motion.duration,
					loop: R.motion.loop,
					tracks: R.motion.tracks.length,
					layers: R.motion.layers?.length ?? 0,
					time: U
				} : null,
				physics: V ? V.report() : null,
				animations: s.animations.map((e, t) => ({
					id: t,
					label: String(e.name ?? `Clip ${t}`).slice(0, 256),
					duration: e.duration
				})),
				nodes: o,
				offset: r,
				truncated: i.length > r + o.length
			};
		},
		inspectMeshes(e = {}) {
			N(e, ["geometries"], "mesh inspection");
			let t = e.geometries ?? D.slice(0, ce).map((e) => e.id);
			if (!Array.isArray(t) || t.length > ce) throw RangeError(`Inspect at most ${ce} mesh IDs per call.`);
			let n = t.map((e) => {
				let t = D.findIndex((t) => t.id === e);
				if (t < 0) throw RangeError(`Unknown mesh ID: ${e}. Imported mesh IDs look like mesh-0, mesh-1; scene_inspect lists them.`);
				let n = D[t], r = G.get(e), a = z[t], o = i([
					0,
					0,
					0
				], a).map((e) => Number(e.toPrecision(4))), s = [
					0,
					4,
					8
				].map((e) => {
					let t = Math.hypot(a[e], a[e + 1], a[e + 2]) || 1;
					return [
						0,
						1,
						2
					].map((n) => Number((a[e + n] / t).toFixed(3)));
				});
				return {
					geometry: e,
					...u("mesh").importedMeshReport(q(n)),
					...r ? { transfer: r.transfer } : {},
					localToWorldScale: o,
					localAxesInWorld: s
				};
			});
			return {
				revision: B,
				meshes: n,
				truncated: !1
			};
		},
		queryParts() {
			return D.map((e) => ({
				id: e.id,
				geometry: q(e),
				matrix: z[Number(e.id.slice(5))],
				material: e.material.id
			}));
		},
		checkpoint() {
			if (W.size >= le) throw RangeError("Asset checkpoint budget exhausted. Release a checkpoint.");
			let e = Object.freeze({});
			return W.set(e, structuredClone(R)), e;
		},
		restore(e, t = {}) {
			if (nt(t), !W.has(e)) throw RangeError("Unknown or released asset checkpoint. Save one with scene_checkpoint, or use a checkpointId that scene_checkpoint returned and you have not released.");
			return $(W.get(e));
		},
		releaseCheckpoint(e) {
			if (!W.delete(e)) throw RangeError("Unknown or released asset checkpoint. Save one with scene_checkpoint, or use a checkpointId that scene_checkpoint returned and you have not released.");
		}
	});
}
export { I as n, me as t };
