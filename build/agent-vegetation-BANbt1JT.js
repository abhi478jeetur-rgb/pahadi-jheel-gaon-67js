/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, n as t, o as n } from "./mat4-BCZClxna.js";
import { _ as r, a as i, c as a, g as o, i as s } from "./vegetation-D85OlXr8.js";
import { createRecipeTerrain as c } from "./agent-terrain-KbhXrb-y.js";
// src/agent-vegetation.js
var l = Object.freeze({
	maxInstances: 1e3,
	maxVariants: 4,
	maxExclusions: 32,
	maxCandidates: 4e3,
	maxCachedSets: 4
}), u = [
	...Object.keys(r),
	"grass",
	"flowers"
], d = [
	"species",
	"mix",
	"seed",
	"height",
	"leaves",
	"season",
	"cullDistance",
	"distanceScale",
	"scatter"
], f = [
	"ground",
	"density",
	"slopeLimit",
	"area",
	"exclude",
	"variants",
	"scale"
], p = [
	"center",
	"radius",
	"min",
	"max",
	"node"
], m = .5, h = Object.freeze([
	[.35, [
		196,
		150,
		40
	]],
	[.6, [
		186,
		84,
		26
	]],
	[.85, [
		112,
		66,
		34
	]]
]), g = [
	80,
	128,
	40
], _ = .9, v = /* @__PURE__ */ new Set([
	"broadleaf",
	"birch",
	"bush"
]);
function y(e, t, n) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${n} must be an object.`);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`Unknown ${n} field: ${r}. Allowed fields: ${t.join(", ")}.`);
}
function b(e, t, n, r) {
	if (!Number.isFinite(e) || e < t || e > n) throw RangeError(`${r} must be a number from ${t} to ${n}.`);
	return e;
}
function x(e, t) {
	if (!Array.isArray(e) || e.length !== 2 || e.some((e) => !Number.isFinite(e))) throw TypeError(`${t} must be [x, z] in metres.`);
	return [...e];
}
function S(e) {
	if (y(e, p, "vegetation exclusion"), e.min !== void 0 || e.max !== void 0) {
		let t = x(e.min, "exclusion min"), n = x(e.max, "exclusion max");
		if (n[0] <= t[0] || n[1] <= t[1]) throw RangeError("exclusion max must be above min on both axes.");
		return {
			min: t,
			max: n
		};
	}
	let t = b(e.radius, .01, 2e3, "exclusion radius");
	if (e.node !== void 0) {
		if (typeof e.node != "string" || !e.node) throw TypeError("exclusion node must be a node ID.");
		return {
			node: e.node,
			radius: t
		};
	}
	return {
		center: x(e.center, "exclusion center"),
		radius: t
	};
}
function C(e) {
	if (y(e, f, "vegetation scatter"), typeof e.ground != "string" || !e.ground) throw TypeError("vegetation scatter needs ground: the ID of a terrain node.");
	let t = {
		ground: e.ground,
		density: b(e.density ?? .012, 1e-4, 4, "scatter density"),
		slopeLimit: b(e.slopeLimit ?? 32, 0, 90, "scatter slopeLimit"),
		variants: b(e.variants ?? 3, 1, l.maxVariants, "scatter variants"),
		exclude: []
	};
	if (!Number.isInteger(t.variants)) throw RangeError("scatter variants must be a whole number.");
	if (e.exclude !== void 0) {
		if (!Array.isArray(e.exclude) || e.exclude.length > l.maxExclusions) throw RangeError(`scatter exclude lists at most ${l.maxExclusions} areas.`);
		t.exclude = e.exclude.map(S);
	}
	if (e.area !== void 0 && (y(e.area, ["min", "max"], "scatter area"), t.area = {
		min: x(e.area.min, "area min"),
		max: x(e.area.max, "area max")
	}, t.area.max[0] <= t.area.min[0] || t.area.max[1] <= t.area.min[1])) throw RangeError("scatter area max must be above min on both axes.");
	if (e.scale !== void 0) {
		if (!Array.isArray(e.scale) || e.scale.length !== 2) throw TypeError("scatter scale must be [min, max].");
		if (t.scale = [b(e.scale[0], .1, 10, "scatter scale min"), b(e.scale[1], .1, 10, "scatter scale max")], t.scale[1] < t.scale[0]) throw RangeError("scatter scale max must not be below min.");
	}
	return t;
}
function w(e) {
	return y(e, ["strength", "direction"], "wind"), {
		strength: b(e.strength ?? .3, 0, 4, "wind.strength"),
		direction: b(e.direction ?? 0, -360, 360, "wind.direction")
	};
}
function T(e, t) {
	return {
		...e,
		vegetation: t.report,
		geometryParts: new Map([...e.geometryParts, ...t.geometryParts]),
		materialOutputs: new Map([...e.materialOutputs, ...t.materialOutputs]),
		partExtras: new Map([...e.partExtras, ...t.partExtras])
	};
}
function E(e, t) {
	if (t && (t.geometry !== void 0 || t.skin !== void 0 || t.asset !== void 0)) throw TypeError(`Node ${t.id}: a node that grows vegetation is a group; drop geometry, material, skin and asset.`);
	y(e, d, "vegetation");
	let n = {};
	if (e.species === void 0 == (e.mix === void 0)) throw TypeError("vegetation needs exactly one of species (one tree) or mix (a scatter, species weights).");
	if (e.species !== void 0) {
		if (!u.includes(e.species) || !e.scatter && !r[e.species]) throw RangeError(`vegetation species must be one of ${(e.scatter ? u : Object.keys(r)).join(", ")}.`);
		n.species = e.species;
	} else {
		if (!e.scatter) throw TypeError("vegetation mix needs scatter. A single tree takes species.");
		if (!e.mix || typeof e.mix != "object" || Array.isArray(e.mix)) throw TypeError("vegetation mix must map species to weights.");
		n.mix = {};
		for (let [t, r] of Object.entries(e.mix)) {
			if (!u.includes(t)) throw RangeError(`vegetation mix species must be among ${u.join(", ")}; got ${t}.`);
			n.mix[t] = b(r, 0, 100, `mix ${t}`);
		}
		if (!Object.values(n.mix).some((e) => e > 0)) throw RangeError("vegetation mix needs one positive weight.");
	}
	if (n.seed = b(e.seed ?? 1, -2147483648, 2147483647, "vegetation seed"), e.height !== void 0 && (n.height = b(e.height, .2, 80, "vegetation height")), n.leaves = e.leaves ?? "cards", n.leaves !== "cards" && n.leaves !== "mesh") throw RangeError("vegetation leaves must be cards or mesh.");
	return n.season = b(e.season ?? 0, 0, 1, "vegetation season"), e.cullDistance !== void 0 && (n.cullDistance = b(e.cullDistance, 1, 1e5, "vegetation cullDistance")), n.distanceScale = b(e.distanceScale ?? 1, .1, 10, "vegetation distanceScale"), e.scatter !== void 0 && (n.scatter = C(e.scatter)), n;
}
function D(e, t) {
	let n = [[0, e], ...h];
	if (t >= n[n.length - 1][0]) return [...n[n.length - 1][1]];
	let r = 0;
	for (; t > n[r + 1][0];) r++;
	let [i, a] = n[r], [o, s] = n[r + 1], c = (t - i) / (o - i);
	return a.map((e, t) => Math.round(e + (s[t] - e) * c));
}
function O(e, t, n, i) {
	if (e.map) {
		let a = r[n], s = n === "grass" ? "grass" : e === t.materials.crown ? "clump" : a.leaf.texture, c = n === "grass" ? g : a.leaf.color;
		return {
			...e,
			map: o(s, D(c, i))
		};
	}
	let a = e.color.map((e) => e ** (1 / 2.2) * 255);
	return {
		...e,
		color: D(a, i).map((e) => (e / 255) ** 2.2)
	};
}
function k(r, i) {
	let a = new Map(r.map((e) => [e.id, e])), o = n(t(), i.rotation, i.translation, i.scale), s = i.parent === null ? null : a.get(i.parent);
	for (let r = 0; s && r < 256; r++) {
		let r = n(t(), s.rotation, s.translation, s.scale);
		o = e(t(), r, o), s = s.parent === null ? null : a.get(s.parent);
	}
	return o;
}
function A(e, t) {
	let n = e.nodes.find((e) => e.id === t.ground), r = n && e.geometries.find((e) => e.id === n.geometry);
	if (r?.type !== "terrain") throw RangeError(`vegetation scatter ground ${JSON.stringify(t.ground.slice(0, 48))} must be a node drawing a terrain geometry. Give the group node the same transform as the ground.`);
	return {
		definition: r,
		terrain: c(r)
	};
}
function j(e, t) {
	let n = (t.size ?? 40) / 2 - m, r = e.area ?? {
		min: [-n, -n],
		max: [n, n]
	};
	return {
		minX: Math.max(r.min[0], -n),
		maxX: Math.min(r.max[0], n),
		minZ: Math.max(r.min[1], -n),
		maxZ: Math.min(r.max[1], n)
	};
}
function M(e, t, n) {
	let r = t.exclude.map((t) => {
		if (t.min) return (e, n) => e >= t.min[0] && e <= t.max[0] && n >= t.min[1] && n <= t.max[1];
		let n = t.center;
		if (t.node) {
			let r = e.nodes.find((e) => e.id === t.node);
			if (!r) throw RangeError(`vegetation exclusion names node ${JSON.stringify(t.node.slice(0, 48))}, which is not in the recipe.`);
			n = [r.translation[0], r.translation[2]];
		}
		return (e, r) => Math.hypot(e - n[0], r - n[1]) <= t.radius;
	});
	return (e, t) => n.isHole(e, t) || r.some((n) => n(e, t));
}
function N(e, t) {
	let { scatter: n } = t, { definition: r, terrain: i } = A(e, n), a = j(n, r), o = (a.maxX - a.minX) * (a.maxZ - a.minZ) * n.density;
	if (o > l.maxCandidates) throw RangeError(`This scatter would try about ${Math.round(o)} trees. Lower density or give a smaller area; the limit is ${l.maxInstances} placed instances.`);
	return {
		area: a,
		density: n.density,
		terrainHeight: i.heightAt,
		slopeLimit: n.slopeLimit,
		exclusion: M(e, n, i),
		seed: t.seed,
		mix: t.mix ?? { [t.species]: 1 },
		variants: n.variants,
		leaves: t.leaves,
		...n.scale ? { scale: n.scale } : {}
	};
}
function P(e, n) {
	if (!n.scatter) {
		let e = s({
			species: n.species,
			leaves: n.leaves,
			...n.height ? { height: n.height } : {}
		}, n.seed);
		return {
			variants: [e],
			instances: [{
				variant: e,
				matrix: t(),
				species: n.species
			}]
		};
	}
	let r = a(N(e, n));
	if (r.instances.length > l.maxInstances) throw RangeError(`This scatter placed ${r.instances.length} instances; the limit is ${l.maxInstances}. Lower density or give a smaller area.`);
	return {
		variants: Object.values(r.variants).flat(),
		instances: r.instances
	};
}
function F(e, t) {
	let { vegetation: n } = t, r = n.scatter ? e.geometries.find((t) => t.id === e.nodes.find((e) => e.id === n.scatter.ground)?.geometry) : null, i = n.scatter?.exclude.filter((e) => e.node).map((t) => e.nodes.find((e) => e.id === t.node)?.translation), { season: a, cullDistance: o, distanceScale: s, ...c } = n;
	return JSON.stringify([
		c,
		r,
		i
	]);
}
function I(e) {
	return {
		tag: e.tag ?? "surface",
		color: [...e.color],
		metallic: e.metallic ?? 0,
		roughness: e.roughness ?? .5,
		emission: e.emission ?? 0,
		opacity: 1,
		alphaMode: e.alphaMode ?? "opaque",
		doubleSided: !!e.doubleSided
	};
}
function L(e, t, n, r) {
	n.serial ??= 0;
	let a = e.nodes.filter((e) => e.vegetation), o = {
		geometryParts: /* @__PURE__ */ new Map(),
		materialOutputs: /* @__PURE__ */ new Map(),
		partExtras: /* @__PURE__ */ new Map(),
		report: []
	}, s = [], c = /* @__PURE__ */ new Set(), u = e.camera?.eye ?? [
		0,
		0,
		0
	];
	for (let t of a) {
		let { vegetation: r } = t, a = `vegetation:${F(e, t)}`;
		if (!n.has(a)) {
			let t = [...n.keys()].filter((e) => e.startsWith("vegetation:"));
			t.length >= l.maxCachedSets && n.delete(t[0]), n.set(a, {
				serial: ++n.serial,
				grown: P(e, r),
				outputs: /* @__PURE__ */ new Map()
			});
		}
		let d = n.get(a), f = r.season >= _, p = k(e.nodes, t), m = new Map(d.grown.variants.map((e, t) => [e, t])), h = /* @__PURE__ */ new Map(), g = {}, y = 0, b = 0;
		d.grown.instances.forEach((n, a) => {
			let l = [
				n.matrix[12],
				n.matrix[13],
				n.matrix[14]
			], _ = [
				p[0] * l[0] + p[4] * l[1] + p[8] * l[2] + p[12],
				p[1] * l[0] + p[5] * l[1] + p[9] * l[2] + p[13],
				p[2] * l[0] + p[6] * l[1] + p[10] * l[2] + p[14]
			], x = Math.hypot(u[0] - _[0], u[1] - _[1], u[2] - _[2]), S = i(x, n.variant, {
				distanceScale: r.distanceScale,
				cullDistance: r.cullDistance
			}), C = g[n.species] ??= {
				instances: 0,
				levels: []
			};
			if (C.instances++, S < 0) {
				b++;
				return;
			}
			C.levels[S] = (C.levels[S] ?? 0) + 1;
			let w = f && v.has(n.species), T = v.has(n.species) || n.species === "grass";
			n.variant.levels[S].parts.forEach((i, l) => {
				if (w && i.tintable) return;
				let u = `vegetation:${d.serial}:${m.get(n.variant)}:${S}:${l}`;
				c.has(u) || (c.add(u), e.geometries.push({
					id: u,
					type: "asset",
					vegetation: d.serial
				}), o.geometryParts.set(u, i.geometry));
				let f = i.tintable && T && r.season > 0;
				h.has(i.material) || h.set(i.material, h.size);
				let p = `vegetation:${d.serial}:${m.get(n.variant)}:${h.get(i.material)}:${f ? `s${r.season}` : "plain"}`;
				o.materialOutputs.has(p) || (d.outputs.has(p) || d.outputs.set(p, Object.freeze(f ? O(i.material, n.variant, n.species, r.season) : { ...i.material })), o.materialOutputs.set(p, d.outputs.get(p)), e.materials.push({
					id: p,
					...I(d.outputs.get(p)),
					assetSource: !0
				}));
				let g = `${t.id}/${a}/${i.role}`;
				s.push({
					id: g,
					parent: t.id,
					label: `${n.species} ${i.role}`,
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
					geometry: u,
					material: p,
					assetPart: {
						placement: t.id,
						index: a,
						matrix: Array.from(n.matrix)
					}
				}), i.shadowLods && o.partExtras.set(g, { shadowLods: i.shadowLods }), y += i.geometry.indices.length / 3;
			});
		}), o.report.push({
			node: t.id,
			mode: r.scatter ? "scatter" : "tree",
			instances: d.grown.instances.length,
			culled: b,
			season: r.season,
			bare: f,
			triangles: y,
			species: Object.fromEntries(Object.entries(g).map(([e, t]) => [e, {
				instances: t.instances,
				levels: Array.from(t.levels, (e) => e ?? 0)
			}]))
		});
	}
	if (e.nodes.length + s.length > t.maxNodes) throw RangeError(`Vegetation expands to ${s.length} part nodes, which with the ${e.nodes.length} authored nodes exceeds maxNodes ${t.maxNodes}. Lower density or cull far trees with cullDistance.`);
	return e.nodes.push(...s), T(r, o);
}
export { l as VEGETATION_LIMITS, L as expandVegetation, E as normalizeVegetation, w as normalizeWind, N as scatterOptionsFor, D as seasonLeafColor };
