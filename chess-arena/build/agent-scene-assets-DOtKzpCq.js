/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./rolldown-runtime-CvuOiBwx.js";
import { h as t } from "./mat4-BCZClxna.js";
import { t as n } from "./agent-drive-schema-cTXeEd3n.js";
import { r } from "./material-texture-kit-DIh3eyE-.js";
// src/texture-sequence-limits.js
var i = Object.freeze({
	maxFrames: 64,
	maxFps: 60,
	maxSide: 1024,
	maxDecodedBytes: 67108864
});
Object.freeze({
	field: "material.map = { sequence: { frames: [catalog image asset IDs], fps, loop } }",
	covers: "color map (map) of surface-tag materials; needs UVs (grid, box and similar); not combined with pattern",
	frame: "floor(motionTime * fps), wrapped when loop is true (default) and held on the last frame when false; frame 0 before any motion time",
	clock: "motionTime, also in render jobs (settings.motion.start + elapsed)",
	images: "PNG, JPEG or WebP files in the --assets folder, listed by scene_asset_catalog with kind image; opaque pixels, one size for all frames",
	...i
});
// src/agent-texture-sequence.js
var a = /^[a-f0-9]{64}$/, o = ["sequence"], s = [
	"frames",
	"fps",
	"loop"
];
function c(e, t, n) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${n} must be an object.`);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`Unknown ${n} field: ${r}. Allowed fields: ${t.join(", ")}.`);
}
function l(e) {
	if (c(e, o, "material map"), e.sequence === void 0) throw TypeError("material map needs a sequence: { frames, fps }.");
	let t = e.sequence;
	c(t, s, "map sequence");
	let { frames: n, fps: r, loop: l = !0 } = t;
	if (!Array.isArray(n) || n.length < 2 || n.length > i.maxFrames) throw RangeError(`map sequence frames must list 2 to ${i.maxFrames} catalog image asset IDs.`);
	for (let e of n) if (typeof e != "string" || !a.test(e.toLowerCase())) throw TypeError("Each map sequence frame must be the 64 hexadecimal characters of a catalog image asset id; scene_asset_catalog lists them.");
	if (!Number.isFinite(r) || r <= 0 || r > i.maxFps) throw RangeError(`map sequence fps must be above 0 and at most ${i.maxFps}.`);
	if (typeof l != "boolean") throw TypeError("map sequence loop must be boolean.");
	return { sequence: {
		frames: n.map((e) => e.toLowerCase()),
		fps: r,
		loop: l
	} };
}
function u(e, t) {
	let n = e.frames.length, r = Math.floor(Math.max(0, t ?? 0) * e.fps + 1e-9);
	return e.loop ? r % n : Math.min(r, n - 1);
}
function d(e) {
	let t = /* @__PURE__ */ new Set(), n = (e, r) => {
		if (!e || typeof e != "object" || r > 8) return;
		if (Array.isArray(e)) {
			for (let t of e) n(t, r + 1);
			return;
		}
		let i = e.map?.sequence?.frames;
		if (Array.isArray(i)) for (let e of i) typeof e == "string" && a.test(e.toLowerCase()) && t.add(e.toLowerCase());
		for (let t of Object.values(e)) n(t, r + 1);
	};
	return n(e, 0), [...t];
}
function f(e, t) {
	if (t.tag !== "surface") throw RangeError("Material map needs the surface tag.");
	if (e.pattern !== void 0) throw TypeError("A material takes a pattern or a map sequence, not both.");
	t.map = l(e.map), e.color === void 0 && (t.color = [
		1,
		1,
		1
	]);
}
function p(e, t, n) {
	let { frames: i, fps: a, loop: o } = t.sequence, s = i.map((t) => {
		let r = n?.get(t);
		if (!r) throw Error(`Material ${e}: image ${t.slice(0, 12)} was not loaded. The host decodes catalog images before createAgentScene or apply.`);
		return r;
	}), { width: c, height: l } = s[0];
	if (s.some((e) => e.width !== c || e.height !== l)) throw RangeError(`Material ${e}: every sequence frame must have the same size, ${c}x${l} here. Resize the images in the catalog.`);
	let d = s.map((e) => r(e.data, e.width, e.height)), f = {
		image: d[0],
		colorSpace: "srgb"
	}, p = {
		frames: i,
		fps: a,
		loop: o
	}, m = 0;
	return {
		descriptor: f,
		seek(e) {
			return m = u(p, e), m;
		},
		get index() {
			return m;
		},
		get image() {
			return d[m];
		},
		describe() {
			return {
				material: e,
				frames: i.length,
				fps: a,
				loop: o,
				index: m,
				frame: i[m],
				size: [c, l]
			};
		}
	};
}
// src/agent-scene-assets.js
var m = /* @__PURE__ */ e({
	ASSET_PLACEMENT_LIMITS: () => h,
	applyMapSequence: () => f,
	assetCopyKey: () => M,
	clipTimeAt: () => R,
	createTextureSequence: () => p,
	describeAssetPlacements: () => B,
	expandAssetPlacements: () => I,
	jsonMaterial: () => N,
	materialOutput: () => F,
	normalizeAssetPlacement: () => k,
	normalizeMapSequence: () => l,
	recipeAssetNeeds: () => j,
	registerCrowdModule: () => _,
	sequenceFrameIds: () => d,
	sequenceFrameIndex: () => u,
	stageAssetClips: () => z
}), h = Object.freeze({
	maxPlacements: 512,
	maxAssets: 16,
	maxAnimatedPlacements: 16,
	maxOverrides: 32
}), g = null;
function _(e) {
	g = e;
}
function v() {
	if (!g) throw Error("This recipe places a crowd, which loads on demand: await loadAgentSceneModules(recipe) before createAgentScene or apply.");
	return g;
}
var y = /^[a-f0-9]{64}$/, b = [
	"id",
	"materials",
	"clip",
	"drive",
	"crowd"
], x = [
	"index",
	"start",
	"speed",
	"loop"
], S = ["color", "emissiveColor"], C = [
	"metallic",
	"roughness",
	"opacity"
], w = [
	"name",
	"tag",
	...S,
	...C,
	"emission"
], T = [
	"surface",
	"foliage",
	"grass"
];
function E(e, t, n) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${n} must be an object.`);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`Unknown ${n} field: ${r}. Allowed fields: ${t.join(", ")}.`);
}
function D(e, t) {
	if (!Array.isArray(e) || e.length !== 3 || e.some((e) => !Number.isFinite(e) || e < 0)) throw RangeError(`${t} must be three finite non-negative linear RGB numbers.`);
	return [...e];
}
function O(e) {
	if (E(e, w, "asset material override"), typeof e.name != "string" || !e.name || e.name.length > 256) throw TypeError("An asset material override needs the source material name. scene_inspect lists the names under assets.");
	let t = { name: e.name };
	if (e.tag !== void 0) {
		if (!T.includes(e.tag)) throw RangeError(`asset material override tag must be one of ${T.join(", ")}.`);
		t.tag = e.tag;
	}
	for (let n of S) e[n] !== void 0 && (t[n] = D(e[n], n));
	for (let n of C) if (e[n] !== void 0) {
		if (!Number.isFinite(e[n]) || e[n] < 0 || e[n] > 1) throw RangeError(`${n} must be a number from 0 to 1.`);
		t[n] = e[n];
	}
	if (e.emission !== void 0) {
		if (!Number.isFinite(e.emission) || e.emission < 0) throw RangeError("emission must be a finite non-negative number.");
		t.emission = e.emission;
	}
	return t;
}
function k(e) {
	if (E(e, b, "asset placement"), typeof e.id != "string" || !y.test(e.id.toLowerCase())) throw TypeError("asset id must be the 64 hexadecimal characters of a catalog asset id; asset_catalog lists them.");
	let t = { id: e.id.toLowerCase() };
	if (e.materials !== void 0) {
		if (!Array.isArray(e.materials) || e.materials.length > h.maxOverrides) throw RangeError(`asset materials must list at most ${h.maxOverrides} overrides.`);
		let n = e.materials.map(O);
		if (new Set(n.map((e) => e.name)).size !== n.length) throw RangeError("asset material overrides must name distinct source materials.");
		t.materials = n;
	}
	if (e.clip !== void 0) {
		E(e.clip, x, "asset clip");
		let { index: n, start: r = 0, speed: i = 1, loop: a = !0 } = e.clip;
		if (!Number.isInteger(n) || n < 0) throw RangeError("asset clip index must be a non-negative integer.");
		if (!Number.isFinite(r) || r < 0 || r > 3600) throw RangeError("asset clip start must be seconds from 0 to 3600.");
		if (!Number.isFinite(i) || i <= 0 || i > 16) throw RangeError("asset clip speed must be above 0 and at most 16.");
		if (typeof a != "boolean") throw TypeError("asset clip loop must be boolean.");
		t.clip = {
			index: n,
			start: r,
			speed: i,
			loop: a
		};
	}
	if (e.crowd !== void 0) {
		if (e.clip !== void 0 || e.drive !== void 0) throw TypeError("An asset placement plays a clip, drives along a path or fills a crowd, only one of them.");
		t.crowd = v().normalizeCrowd(e.crowd);
	}
	if (e.drive !== void 0) {
		if (e.clip !== void 0) throw TypeError("An asset placement plays a clip or drives along a path, not both.");
		if (t.drive = n(e.drive), t.drive.lights?.tailLights) throw RangeError("Placed assets share their materials, so tail lights glow only in an asset recipe (motion.drive). Headlight and brake signals are still reported by scene_inspect.");
	}
	return t;
}
function A(e, t, n = 0) {
	if (!e || typeof e != "object" || n > 8) return;
	if (Array.isArray(e)) {
		for (let r of e) A(r, t, n + 1);
		return;
	}
	let r = e.asset;
	r && typeof r == "object" && typeof r.id == "string" && y.test(r.id.toLowerCase()) && t.push(r);
	for (let [r, i] of Object.entries(e)) r !== "asset" && A(i, t, n + 1);
}
function j(e) {
	let t = [];
	A(e, t);
	let n = /* @__PURE__ */ new Map();
	for (let e of t) {
		let t = e.id.toLowerCase(), r = n.get(t) ?? {
			id: t,
			copies: 1
		};
		(e.clip || e.drive || e.crowd) && r.copies++, n.set(t, r);
	}
	return [...n.values()];
}
function M(e, t) {
	return `${e}:${t}`;
}
function N(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) typeof r == "number" || typeof r == "string" || typeof r == "boolean" ? t[n] = r : Array.isArray(r) && r.every((e) => typeof e == "number") && (t[n] = [...r]);
	return t;
}
function P(e) {
	let t = {};
	e?.tag !== void 0 && (t.tag = e.tag);
	for (let n of [
		...S,
		...C,
		"emission"
	]) e?.[n] !== void 0 && (t[n] = e[n]);
	return t;
}
function F(e, t) {
	let n = { ...e };
	for (let [e, r] of Object.entries(t)) n[e] = Array.isArray(r) ? Object.freeze([...r]) : r;
	return t.emission !== void 0 && t.emission > 0 && !n.emissiveColor?.some((e) => e > 0) && (n.emissiveColor = Object.freeze([
		1,
		1,
		1
	])), Object.freeze(n);
}
function I(e, t, n, r = /* @__PURE__ */ new Map(), i = null) {
	let a = e.nodes.filter((e) => e.asset), o = {
		placements: [],
		geometryParts: /* @__PURE__ */ new Map(),
		materialOutputs: /* @__PURE__ */ new Map(),
		partExtras: /* @__PURE__ */ new Map(),
		animators: []
	};
	if (!a.length) return o;
	if (!t) throw Error("This recipe places catalog assets, which a host loads and decodes first. Pass them as the assets option of createAgentScene; MCP does this for scene_create.");
	let s = new Set(a.map((e) => e.asset.id)), c = a.filter((e) => e.asset.clip || e.asset.drive || e.asset.crowd);
	if (a.length > h.maxPlacements || s.size > h.maxAssets || c.length > h.maxAnimatedPlacements) throw RangeError(`A scene places at most ${h.maxPlacements} assets, ${h.maxAssets} different ones, ${h.maxAnimatedPlacements} of them playing a clip; this recipe places ${a.length}, ${s.size} and ${c.length}.`);
	let l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Map(), f = [];
	for (let s of a) {
		let { id: a, materials: c = [], clip: p, drive: m, crowd: h } = s.asset, g = 0;
		(p || m || h) && (g = (l.get(a) ?? 0) + 1, l.set(a, g));
		let _ = t.get(M(a, g));
		if (!_) throw Error(`Asset ${a.slice(0, 12)} copy ${g} is not loaded. The host loads it before createAgentScene or apply.`);
		if (p && !_.animations[p.index]) throw RangeError(`Node ${s.id}: asset ${a.slice(0, 12)} has ${_.animations.length} clips, so clip index ${p.index} does not exist. scene_inspect lists them under assets.`);
		if (h) {
			let t = v().expandCrowd(e, s, _, g, r, o, n);
			f.push(...t.nodes), o.placements.push(t.record), o.animators.push(t.record);
			continue;
		}
		let y = new Set(_.parts.map((e) => e.material.name).filter(Boolean));
		for (let e of c) if (!y.has(e.name)) throw RangeError(`Node ${s.id}: asset has no material named ${JSON.stringify(e.name)}. Names: ${[...y].slice(0, 16).map((e) => JSON.stringify(e)).join(", ") || "none, the asset materials are unnamed"}.`);
		let b = new Map(c.map((e) => [e.name, e])), x = /* @__PURE__ */ new Map(), S = [];
		_.parts.forEach((t, n) => {
			let i = `asset:${a.slice(0, 12)}:${g}:${n}`;
			u.has(i) || (u.add(i), e.geometries.push({
				id: i,
				type: "asset",
				assetId: a,
				copy: g,
				part: n
			}), o.geometryParts.set(i, t.geometry)), x.has(t.material) || x.set(t.material, x.size);
			let c = P(b.get(t.material.name)), l = `asset:${a.slice(0, 12)}:${g}:${x.get(t.material)}:${JSON.stringify(c)}`;
			d.has(l) || (d.set(l, l), e.materials.push({
				id: l,
				...N(t.material),
				...c,
				assetSource: !0
			}), r.get(l)?.source !== t.material && r.set(l, {
				source: t.material,
				output: F(t.material, c)
			}), o.materialOutputs.set(l, r.get(l).output));
			let p = `${s.id}/${n}`;
			S.push(p), f.push({
				id: p,
				parent: s.id,
				label: String(t.name ?? p).slice(0, 256),
				translation: [
					0,
					0,
					0
				],
				rotation: [
					0,
					0,
					0,
					1
				],
				scale: [
					1,
					1,
					1
				],
				geometry: i,
				material: l,
				assetPart: {
					placement: s.id,
					index: n,
					matrix: Array.from(t.matrix)
				}
			}), o.partExtras.set(p, {
				...t.skin ? { skin: t.skin } : {},
				...t.morph ? { morph: t.morph } : {},
				...t.castShadow === void 0 ? {} : { castShadow: t.castShadow }
			});
		});
		let C = {
			node: s.id,
			assetId: a,
			copy: g,
			asset: _,
			partNodeIds: S,
			clip: p ?? null,
			drive: m ? L(s.id, i, _, m) : null,
			drivePose: null
		};
		o.placements.push(C), (p || m) && o.animators.push(C);
	}
	if (e.nodes.length + f.length > n.maxNodes) throw RangeError(`Placed assets expand to ${f.length} part nodes, which with the ${e.nodes.length} authored nodes exceeds maxNodes ${n.maxNodes}. Place fewer copies or simpler assets.`);
	return e.nodes.push(...f), o;
}
function L(e, t, n, r) {
	if (!t) throw Error("This recipe drives a placed asset, which needs the drive code: await loadAgentSceneModules(recipe) before createAgentScene or apply.");
	try {
		return t(n, r);
	} catch (t) {
		throw t.message = `Node ${e} drive: ${t.message}`, t;
	}
}
function R(e, t, n) {
	let r = Math.max(0, ((n ?? 0) - e.start) * e.speed);
	return t <= 0 ? 0 : e.loop ? r % t : Math.min(r, t);
}
function z(e, n, r) {
	let i = [], a = /* @__PURE__ */ new Map();
	try {
		for (let o of e.animators) {
			let e;
			if (o.crowd) {
				i.push(o.crowd.stage(r ?? 0));
				continue;
			}
			if (o.drive) {
				let t = o.drive.sample(r ?? 0);
				o.drivePose = t.pose, e = o.asset.stagePose({ nodeOverrides: t.nodeOverrides });
			} else {
				let t = o.asset.animations[o.clip.index].duration;
				e = o.asset.stagePose({
					animation: {
						clip: o.clip.index,
						time: R(o.clip, t, r)
					},
					nodeOverrides: []
				});
			}
			i.push(e);
			let s = n.getNode(o.node).worldMatrix;
			o.partNodeIds.forEach((n, r) => {
				a.set(n, t(/* @__PURE__ */ new Float32Array(16), s, e.parts[r].matrix));
			});
		}
	} catch (e) {
		for (let e of i) e.discard();
		throw e;
	}
	return {
		matrices: a,
		commit() {
			for (let e of i) e.commit();
		}
	};
}
function B(e, t, n) {
	return e.placements.map((e) => {
		if (e.crowd) return e.crowd.describe();
		let r = [
			Infinity,
			Infinity,
			Infinity
		], i = [
			-Infinity,
			-Infinity,
			-Infinity
		];
		for (let a of e.partNodeIds) {
			let e = t.getNode(a), o = n(e.geometry);
			for (let t = 0; t < 8; t++) {
				let n = [
					0,
					1,
					2
				].map((e) => t & 1 << e ? o.max[e] : o.min[e]);
				for (let t = 0; t < 3; t++) {
					let a = e.worldMatrix[t] * n[0] + e.worldMatrix[4 + t] * n[1] + e.worldMatrix[8 + t] * n[2] + e.worldMatrix[12 + t];
					r[t] = Math.min(r[t], a), i[t] = Math.max(i[t], a);
				}
			}
		}
		return {
			node: e.node,
			assetId: e.assetId,
			parts: e.partNodeIds.length,
			bounds: {
				min: r,
				max: i
			},
			clips: e.asset.animations.map((e, t) => ({
				index: t,
				name: e.name ?? `clip ${t}`,
				duration: e.duration
			})),
			materials: [...new Set(e.asset.parts.map((e) => e.material.name).filter(Boolean))],
			...e.clip ? { playing: e.clip } : {},
			...e.drive ? { drive: e.drive.describe(e.drivePose ?? void 0) } : {}
		};
	});
}
export { j as a, F as i, M as n, _ as o, N as r, i as s, m as t };
