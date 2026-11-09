/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/mesh-operations.js
var e = 64, t = /* @__PURE__ */ Object.freeze({
	weld: {
		fields: ["distance"],
		tags: []
	},
	triangulate: {
		fields: ["minVertices"],
		tags: []
	},
	edge_split: {
		fields: ["angle"],
		tags: []
	},
	smooth: {
		fields: ["factor", "iterations"],
		tags: []
	},
	simple_deform: {
		fields: [
			"mode",
			"axis",
			"angle",
			"factor"
		],
		tags: []
	},
	cast: {
		fields: ["factor", "size"],
		tags: []
	},
	screw: {
		fields: [
			"axis",
			"angle",
			"steps",
			"iterations",
			"lift"
		],
		tags: []
	},
	wireframe: {
		fields: [
			"thickness",
			"offset",
			"evenOffset",
			"replace"
		],
		tags: []
	},
	skin: {
		fields: ["radius"],
		tags: []
	},
	lattice: {
		fields: ["divisions", "moves"],
		tags: []
	},
	curve: {
		fields: ["path", "axis"],
		tags: []
	},
	hook: {
		fields: [
			"center",
			"radius",
			"translation",
			"strength",
			"falloff"
		],
		tags: []
	},
	wave: {
		fields: [
			"height",
			"width",
			"narrowness",
			"speed",
			"time",
			"timeOffset",
			"start",
			"cyclic",
			"axes",
			"normal"
		],
		tags: []
	},
	weighted_normal: {
		fields: ["angle", "weight"],
		tags: []
	},
	smooth_by_angle: {
		fields: ["angle", "ignoreSharp"],
		tags: []
	},
	bounding_box: {
		fields: [],
		tags: []
	},
	convex_hull: {
		fields: [],
		tags: []
	}
}), n = /* @__PURE__ */ Object.freeze({
	extrude_face_region: {
		fields: [
			"select",
			"name",
			"offset",
			"direction",
			"alongNormals"
		],
		tags: ["cap", "side"]
	},
	extrude_individual: {
		fields: [
			"select",
			"name",
			"offset",
			"direction"
		],
		tags: ["cap", "side"]
	},
	inset_region: {
		fields: [
			"select",
			"name",
			"thickness",
			"depth"
		],
		tags: ["cap", "rim"]
	},
	inset_individual: {
		fields: [
			"select",
			"name",
			"thickness",
			"depth"
		],
		tags: ["cap", "rim"]
	},
	delete: {
		fields: ["select"],
		tags: []
	},
	flip_normals: {
		fields: ["select"],
		tags: []
	},
	translate: {
		fields: [
			"select",
			"offset",
			"falloff"
		],
		tags: []
	},
	merge_by_distance: {
		fields: ["distance"],
		tags: []
	},
	tag: {
		fields: ["select", "name"],
		tags: []
	},
	boolean: {
		fields: [
			"name",
			"operation",
			"cutter",
			"translation",
			"rotation",
			"scale"
		],
		tags: ["cut"]
	},
	mirror: {
		fields: [
			"name",
			"axis",
			"merge"
		],
		tags: ["mirrored"]
	},
	array: {
		fields: [
			"name",
			"count",
			"offset",
			"relativeOffset",
			"merge"
		],
		tags: ["last"]
	},
	solidify: {
		fields: [
			"name",
			"thickness",
			"offset",
			"evenThickness"
		],
		tags: ["inner", "rim"]
	},
	bevel: {
		fields: [
			"name",
			"edges",
			"width",
			"segments",
			"profile",
			"clampOverlap"
		],
		tags: ["strip", "corner"]
	},
	loop_cut: {
		fields: [
			"name",
			"edges",
			"cuts",
			"factor"
		],
		tags: ["band-<k>"]
	},
	uv_unwrap: {
		fields: [
			"seams",
			"margin",
			"maxDistortion"
		],
		tags: []
	},
	subdivide: {
		fields: [
			"levels",
			"crease",
			"sharpness"
		],
		tags: []
	},
	fill_holes: {
		fields: ["name", "sides"],
		tags: ["fill"]
	},
	dissolve_faces: {
		fields: ["select", "name"],
		tags: ["merged"]
	},
	dissolve_edges: {
		fields: ["edges", "name"],
		tags: ["merged"]
	},
	dissolve_verts: {
		fields: ["verts", "name"],
		tags: ["merged"]
	},
	dissolve_limited: {
		fields: [
			"edges",
			"angle",
			"name"
		],
		tags: ["merged"]
	},
	bisect_plane: {
		fields: [
			"name",
			"point",
			"normal",
			"distance",
			"clearInner",
			"clearOuter",
			"fill"
		],
		tags: [
			"inner",
			"outer",
			"cap"
		]
	},
	bridge_edge_loops: {
		fields: [
			"edges",
			"name",
			"segments",
			"twistOffset"
		],
		tags: ["bridge"]
	},
	subdivide_edges: {
		fields: [
			"edges",
			"name",
			"cuts"
		],
		tags: ["split"]
	},
	grid_fill: {
		fields: ["edges", "name"],
		tags: ["fill"]
	},
	knife_project: {
		fields: [
			"name",
			"path",
			"direction"
		],
		tags: ["cut"]
	},
	set_position: {
		fields: [
			"select",
			"position",
			"offset"
		],
		tags: []
	},
	displace: {
		fields: [
			"select",
			"field",
			"strength",
			"midlevel",
			"direction",
			"group"
		],
		tags: []
	},
	vertex_group: {
		fields: [
			"select",
			"name",
			"weight",
			"field",
			"gradient"
		],
		tags: []
	},
	vertex_color: {
		fields: [
			"select",
			"color",
			"field",
			"gradient"
		],
		tags: []
	},
	decimate: {
		fields: ["ratio"],
		tags: []
	},
	remesh: {
		fields: ["voxelSize", "resolution"],
		tags: []
	},
	sculpt: {
		fields: ["select", "strokes"],
		tags: []
	},
	shrinkwrap: {
		fields: [
			"select",
			"target",
			"translation",
			"rotation",
			"scale",
			"mode",
			"direction",
			"offset",
			"maxDistance",
			"onMiss"
		],
		tags: []
	},
	...t
}), r = /* @__PURE__ */ Object.freeze([
	"inflate",
	"displace",
	"smooth"
]), i = 5e6, a = /* @__PURE__ */ Object.freeze(["nearest", "project"]), o = 2e7, s = /* @__PURE__ */ Object.freeze([
	"mirror",
	"array",
	"solidify",
	"bevel",
	"uv_unwrap",
	"subdivide",
	"set_position",
	"displace",
	"decimate",
	"remesh",
	...Object.keys(t)
]), c = 16, l = 25e4, u = 8e6, d = /* @__PURE__ */ Object.freeze([
	"position",
	"normal",
	"index",
	"tag",
	"group"
]), f = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ "add.mul.min.max.sub.div.mod.pow.atan2.clamp.mix.smoothstep.neg.abs.sqrt.sin.cos.floor.ceil.round.fract.sign.saturate.lt.lte.gt.gte.eq.and.or.not.if.vec.dot.cross.distance.length.normalize.x.y.z.rotate.align.transform.attr.noise.random.nearest.raycast".split(".")), p = /* @__PURE__ */ Object.freeze([
	"grid",
	"scatter",
	"surface",
	"curve"
]), m = 2048, h = /* @__PURE__ */ Object.freeze({
	maxTransferFraction: .25,
	maxEditedParts: 64
}), g = 40;
function _(e) {
	let t;
	if (e === void 0) t = "undefined";
	else if (typeof e == "number" || typeof e == "bigint") t = String(e);
	else if (typeof e == "function" || typeof e == "symbol") t = typeof e;
	else try {
		t = JSON.stringify(e) ?? String(e);
	} catch {
		t = Object.prototype.toString.call(e);
	}
	return t.length > g ? `${t.slice(0, 37)}...` : t;
}
function v(e, t, n, r = RangeError) {
	let i = new r(`${e}: got ${_(t)}; expected ${n}.`);
	return i.fieldPath = e, i;
}
function y(e, t) {
	try {
		return t();
	} catch (t) {
		throw typeof t?.fieldPath == "string" && t.message.startsWith(t.fieldPath) && (t.message = `${e}.${t.message}`, t.fieldPath = `${e}.${t.fieldPath}`), t;
	}
}
export { a as _, h as a, u as c, i as d, o as f, r as g, t as h, f as i, m as l, n as m, y as n, p as o, c as p, d as r, l as s, v as t, e as u, s as v };
