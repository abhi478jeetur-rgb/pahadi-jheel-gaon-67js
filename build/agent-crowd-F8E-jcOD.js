/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { createCrowd as e } from "./retarget.js";
import { bakeCrowdPalette as t, createCrowdParts as n, createCrowdRig as r } from "./crowd-skinning.js";
import { i, o as a, r as o } from "./agent-scene-assets-DOtKzpCq.js";
// src/agent-crowd.js
var s = Object.freeze({
	maxInstances: 1e3,
	maxCachedCrowds: 4
}), c = [
	"clip",
	"count",
	"seed",
	"layout",
	"spacing",
	"columns",
	"size",
	"rateJitter",
	"randomYaw",
	"speed",
	"frameRate",
	"morphs",
	"lods",
	"farDistance",
	"farRate"
];
function l(e, t, n, r) {
	if (!Number.isFinite(e) || e < t || e > n) throw RangeError(`crowd ${r} must be a number from ${t} to ${n}.`);
	return e;
}
function u(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError("crowd must be an object.");
	for (let t of Object.keys(e)) if (!c.includes(t)) throw TypeError(`Unknown crowd field: ${t}. Allowed fields: ${c.join(", ")}.`);
	if (!Number.isInteger(e.count) || e.count < 1 || e.count > s.maxInstances) throw RangeError(`crowd count must be an integer from 1 to ${s.maxInstances}.`);
	let t = e.layout ?? "grid";
	if (t !== "grid" && t !== "scatter") throw RangeError("crowd layout must be grid or scatter.");
	let n = e.clip ?? 0;
	if (!Number.isInteger(n) || n < 0) throw RangeError("crowd clip must be a non-negative clip index.");
	let r = {
		clip: n,
		count: e.count,
		seed: l(e.seed ?? 1, -2147483648, 2147483647, "seed"),
		layout: t,
		spacing: l(e.spacing ?? 1.5, .05, 1e3, "spacing"),
		rateJitter: l(e.rateJitter ?? .15, 0, .9, "rateJitter"),
		speed: l(e.speed ?? 1, .05, 16, "speed"),
		frameRate: l(e.frameRate ?? 30, 4, 60, "frameRate")
	};
	e.columns !== void 0 && (r.columns = Math.round(l(e.columns, 1, s.maxInstances, "columns"))), e.size !== void 0 && (r.size = l(e.size, .1, 1e5, "size"));
	for (let t of [
		"randomYaw",
		"morphs",
		"lods"
	]) if (e[t] !== void 0 && typeof e[t] != "boolean") throw TypeError(`crowd ${t} must be boolean.`);
	if (r.randomYaw = e.randomYaw ?? !1, r.morphs = e.morphs ?? !1, r.lods = e.lods ?? !0, e.farDistance === void 0 != (e.farRate === void 0)) throw TypeError("crowd farDistance and farRate go together.");
	return e.farDistance !== void 0 && (r.farDistance = l(e.farDistance, .1, 1e5, "farDistance"), r.farRate = l(e.farRate, 1, 60, "farRate")), r;
}
function d(a, o, s) {
	let c = a.animations[s.clip], l = r(a.parts, { morphs: s.morphs }), u = t(l, (e) => a.stagePose({
		animation: {
			clip: s.clip,
			time: e
		},
		nodeOverrides: []
	}).commit(), {
		duration: c.duration,
		frameRate: s.frameRate
	}), d = e({
		count: s.count,
		clip: {
			duration: c.duration,
			tracks: []
		},
		seed: s.seed,
		layout: s.layout,
		spacing: s.spacing,
		columns: s.columns,
		size: s.size,
		rateJitter: s.rateJitter,
		randomYaw: s.randomYaw
	}), f = s.farDistance ? {
		distance: s.farDistance,
		rate: s.farRate
	} : null;
	return {
		asset: a,
		rig: l,
		palette: u,
		crowd: d,
		set: n({
			rig: l,
			palette: u,
			instances: d.instances,
			lods: s.lods,
			farPose: f,
			name: o.slice(0, 12)
		}),
		materialOutputs: l.parts.map((e) => i(e.material, {})),
		clipName: c.name ?? `clip ${s.clip}`,
		duration: c.duration
	};
}
function f(e, t, n, r, i, a, c) {
	let { id: l, crowd: u } = t.asset;
	if (!n.animations[u.clip]) throw RangeError(`Node ${t.id}: asset ${l.slice(0, 12)} has ${n.animations.length} clips, so crowd clip ${u.clip} does not exist.`);
	let f = `crowd:${t.id}:${l}:${r}:${JSON.stringify(u)}`;
	if (i.get(f)?.asset !== n) {
		let e = [...i.keys()].filter((e) => e.startsWith("crowd:"));
		e.length >= s.maxCachedCrowds && i.delete(e[0]);
		try {
			i.set(f, d(n, l, u));
		} catch (e) {
			throw e.message = `Node ${t.id} crowd: ${e.message}`, e;
		}
	}
	let p = i.get(f), m = p.rig.parts.length;
	if (e.nodes.length + u.count * m > c.maxNodes) throw RangeError(`Node ${t.id}: a crowd of ${u.count} makes ${u.count * m} part nodes (${m} per instance), which with the ${e.nodes.length} authored nodes exceeds maxNodes ${c.maxNodes}. Lower count or raise maxNodes.`);
	let h = `crowd:${l.slice(0, 12)}:${r}`, g = p.rig.parts.map((t, n) => {
		let i = `${h}:${n}`;
		return a.materialOutputs.set(i, p.materialOutputs[n]), e.materials.push({
			id: i,
			...o(t.material),
			assetSource: !0
		}), a.geometryParts.set(i, t.geometry), e.geometries.push({
			id: i,
			type: "asset",
			assetId: l,
			copy: r,
			part: n
		}), i;
	}), _ = [], v = [];
	p.set.parts.forEach((e, n) => {
		let r = Math.floor(n / m), i = n % m, o = `${t.id}/${r}/${i}`;
		v.push(o), _.push({
			id: o,
			parent: t.id,
			label: `${p.clipName} ${r}`,
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
			geometry: `${h}:${i}`,
			material: g[i],
			assetPart: {
				placement: t.id,
				index: r,
				matrix: Array.from(e.matrix)
			}
		}), a.partExtras.set(o, {
			crowd: e.crowd,
			assembly: e.assembly,
			...e.lods ? { lods: e.lods } : {},
			...e.morph ? { morph: e.morph } : {}
		});
	});
	let y = e.camera?.eye ?? null;
	return {
		nodes: _,
		record: {
			node: t.id,
			assetId: l,
			copy: r,
			asset: n,
			partNodeIds: v,
			clip: null,
			drive: null,
			drivePose: null,
			crowd: {
				stage(e) {
					let t = e * u.speed;
					return {
						commit: () => p.set.setTimes((e) => p.crowd.clipTime(e, t), y),
						discard() {}
					};
				},
				describe() {
					return {
						node: t.id,
						assetId: l,
						kind: "crowd",
						instances: u.count,
						parts: v.length,
						batches: m,
						clip: {
							index: u.clip,
							name: p.clipName,
							duration: p.duration
						},
						frames: p.palette.frameCount,
						paletteBytes: p.palette.data.byteLength,
						boundsRadius: p.palette.bounds.radius,
						lods: u.lods,
						morphs: p.rig.parts.filter((e) => e.morph).length,
						...u.farDistance ? { farPose: {
							distance: u.farDistance,
							rate: u.farRate
						} } : {}
					};
				}
			}
		}
	};
}
a({
	normalizeCrowd: u,
	expandCrowd: f
});
export { s as CROWD_LIMITS, f as expandCrowd, u as normalizeCrowd };
