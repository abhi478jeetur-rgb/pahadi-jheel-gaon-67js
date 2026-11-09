/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { d as e, g as t, h as n, l as r, m as i, n as a, o, p as s, r as c, t as l, u } from "./mat4-BCZClxna.js";
import { r as d, t as f } from "./mat3-BUCH0Dej.js";
import { a as p, c as m, i as h, n as g, o as _, r as v, s as ee, t as y } from "./geometry-C1ukZMAo.js";
import { t as b } from "./scene-graph-D7m1CRQ0.js";
import { n as x, t as S } from "./field-error-DPtscRqU.js";
import { n as C, s as te, t as w } from "./camera-DqWdI22s.js";
import { i as ne, n as T, t as re } from "./lighting-Dfe9GFwf.js";
import { n as ie } from "./volumetric-D8WftbY1.js";
import { n as E, t as D } from "./liquid-optics-DJcQhRHD.js";
import { r as O } from "./environment-H0LjiCAj.js";
import { c as k, h as ae, l as A, n as oe, s as j, t as M } from "./agent-scene-capabilities-BGAS_VVR.js";
import { a as N, n as se, o as ce, r as le, s as ue, t as de } from "./look-catalog-BW-KqP3u.js";
import { a as fe, s as pe } from "./shader-registry-DHYkwAg5.js";
import { n as me, t as he } from "./view-transform-names-CDWKtFlr.js";
import { r as ge, s as _e } from "./material-layers-C6j9cFSS.js";
import { r as ve } from "./closed-room-CB0A9B5C.js";
import { t as ye } from "./depth-layer-DecVVixZ.js";
import { a as P, c as be, d as xe, m as Se, s as Ce, x as we, y as Te } from "./vec3-BRYC6f_g.js";
import { r as Ee } from "./animation-IxY9GETP.js";
import { i as De, t as Oe } from "./skinning-DjFQA5hH.js";
// src/lighting-setups.js
var ke = 128, Ae = 64, je = Object.freeze({
	daylight: Object.freeze({
		sky: {
			zenith: [
				.28,
				.46,
				.95
			],
			horizon: [
				.95,
				1,
				1.05
			],
			ground: [
				.32,
				.29,
				.25
			]
		},
		panels: [],
		fields: {
			lightDirection: [
				-3,
				6,
				4
			],
			keyColor: [
				3,
				2.8,
				2.5
			],
			keyIntensity: 1,
			fillIntensity: 0,
			ambientIntensity: 1,
			skyTop: [
				.2,
				.38,
				.52
			],
			skyBottom: [
				.62,
				.7,
				.67
			]
		}
	}),
	overcast: Object.freeze({
		sky: {
			zenith: [
				.85,
				.88,
				.92
			],
			horizon: [
				.6,
				.62,
				.65
			],
			ground: [
				.28,
				.28,
				.28
			]
		},
		panels: [],
		fields: {
			lightDirection: [
				-1,
				6,
				2
			],
			keyColor: [
				.9,
				.9,
				.92
			],
			keyIntensity: 1,
			fillIntensity: 0,
			ambientIntensity: 1,
			skyTop: [
				.6,
				.62,
				.66
			],
			skyBottom: [
				.55,
				.57,
				.6
			]
		}
	}),
	sunset: Object.freeze({
		sky: {
			zenith: [
				.12,
				.18,
				.42
			],
			horizon: [
				1.7,
				.75,
				.32
			],
			ground: [
				.22,
				.13,
				.1
			]
		},
		panels: [{
			direction: [
				-6,
				1.5,
				3
			],
			radius: .35,
			color: [
				6,
				2.6,
				.9
			]
		}],
		fields: {
			lightDirection: [
				-6,
				1.5,
				3
			],
			keyColor: [
				3.4,
				1.8,
				.85
			],
			keyIntensity: 1,
			fillIntensity: 0,
			ambientIntensity: 1,
			skyTop: [
				.1,
				.16,
				.38
			],
			skyBottom: [
				.9,
				.45,
				.25
			]
		}
	}),
	studio: Object.freeze({
		sky: {
			zenith: [
				.5,
				.5,
				.5
			],
			horizon: [
				.3,
				.3,
				.31
			],
			ground: [
				.22,
				.22,
				.22
			]
		},
		panels: [
			{
				direction: [
					-3,
					6,
					4
				],
				radius: .7,
				color: [
					5,
					4.9,
					4.7
				]
			},
			{
				direction: [
					0,
					1,
					0
				],
				radius: .8,
				color: [
					3,
					3,
					3.1
				]
			},
			{
				direction: [
					4,
					1.5,
					-3
				],
				radius: .5,
				color: [
					1.8,
					2,
					2.4
				]
			}
		],
		fields: {
			lightDirection: [
				-3,
				6,
				4
			],
			keyColor: [
				2.4,
				2.3,
				2.2
			],
			keyIntensity: 1,
			fillIntensity: 0,
			ambientIntensity: 1,
			skyTop: [
				.45,
				.45,
				.46
			],
			skyBottom: [
				.3,
				.3,
				.32
			]
		}
	})
}), Me = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Map(), Ne = 16;
function Pe(e) {
	if (!A.includes(e)) throw RangeError(`Unknown lighting setup: ${String(e)}. Use ${A.join(", ")}.`);
	return je[e];
}
function Fe(e) {
	return structuredClone(Pe(e).fields);
}
function Ie(e) {
	let t = Math.hypot(...e);
	return e.map((e) => e / t);
}
function Le(e, t, n) {
	return e.map((e, r) => e + (t[r] - e) * n);
}
function Re(e, t) {
	return t >= 0 ? Le(e.horizon, e.zenith, Math.sqrt(t)) : Le(e.horizon, e.ground, Math.min(1, (-t) ** .4 * 1.4));
}
function ze(e, t) {
	let n = Ie(e.direction), r = n[0] * t[0] + n[1] * t[1] + n[2] * t[2], i = Math.cos(e.radius), a = Math.cos(e.radius * 1.6), o = Math.min(1, Math.max(0, (r - a) / (i - a)));
	return o * o * (3 - 2 * o);
}
function Be(e) {
	let t = /* @__PURE__ */ new Float32Array(24576);
	for (let n = 0; n < Ae; n++) {
		let r = (n + .5) / Ae * Math.PI;
		for (let i = 0; i < ke; i++) {
			let a = ((i + .5) / ke - .5) * 2 * Math.PI, o = [
				Math.sin(r) * Math.sin(a),
				Math.cos(r),
				-Math.sin(r) * Math.cos(a)
			], s = Re(e.sky, o[1]);
			for (let t of e.panels) {
				let e = ze(t, o);
				for (let n = 0; n < 3; n++) s[n] += t.color[n] * e;
			}
			t.set(s, (n * ke + i) * 3);
		}
	}
	return t;
}
function Ve(e, { intensity: t = 1, rotation: n = 0, showBackground: r = !1 } = {}) {
	let i = Pe(e), a = [
		e,
		t,
		n,
		r
	].join("|");
	if (F.has(a)) return F.get(a);
	Me.has(e) || Me.set(e, Be(i)), F.size >= Ne && F.clear();
	let o = O({
		width: ke,
		height: Ae,
		data: Me.get(e),
		intensity: t,
		rotation: n,
		showBackground: r
	});
	return F.set(a, o), o;
}
function He(e, { intensity: t = 1, rotation: n = 0, showBackground: r = !1 } = {}) {
	let i = [
		"catalog",
		e,
		N(),
		t,
		n,
		r
	].join("|");
	return F.has(i) || (F.size >= Ne && F.clear(), F.set(i, O({
		...le(e),
		intensity: t,
		rotation: n,
		showBackground: r
	}))), F.get(i);
}
// src/agent-scene-modules.js
var Ue = {
	mesh: () => import("./agent-mesh-engine-UV2lTngb.js"),
	modeling: () => import("./modeling.js"),
	text: () => import("./text-geometry-CCklRRmT.js"),
	motion: () => import("./agent-motion-BumZoRED.js").then((e) => e.t),
	drive: () => import("./agent-drive-CGZiar0P.js"),
	physics: () => import("./agent-physics-Jczt4byN.js"),
	cloth: () => import("./agent-cloth-E2NGVfNo.js"),
	particles: () => import("./agent-particles-sny_ffgy.js"),
	bake: () => import("./agent-bake-DekR6ZC4.js").then((e) => e.t),
	reflections: () => import("./agent-reflections-DAnkQL9h.js"),
	patterns: () => import("./material-patterns-B30t3HSN.js").then((e) => e.n),
	relations: () => import("./agent-relations-BLhRiEnB.js"),
	timeline: () => import("./film-timeline-BWbn7SRV.js"),
	layerShaders: () => import("./material-layer-shaders.js"),
	liquidShader: () => import("./liquid-shader.js"),
	subsurfaceShader: () => import("./subsurface-shader.js"),
	fogShader: () => import("./fog-shader.js"),
	worldMaterials: () => import("./world-material-shader.js"),
	terrain: () => import("./agent-terrain-KbhXrb-y.js"),
	navigation: () => import("./agent-navigation-CQ6KXisE.js"),
	lightLinking: () => import("./light-linking.js"),
	cascades: () => import("./light-modules-Dt5NnxhT.js"),
	assets: () => import("./agent-scene-assets-DOtKzpCq.js").then((e) => e.t),
	vegetation: () => import("./agent-vegetation-BANbt1JT.js"),
	crowd: () => import("./agent-crowd-F8E-jcOD.js"),
	lineArt: () => import("./line-art.js"),
	viewTransform: () => import("./view-transform-shader.js"),
	coplanar: () => import("./coplanar-overlap.js"),
	floorSky: () => import("./floor-sky-visibility.js"),
	userPass: () => import("./user-pass.js"),
	objectMotionBlur: () => import("./object-motion-blur-M2_MxYjg.js"),
	postSteps: () => import("./post-steps-bDV4GSy_.js"),
	materialSnippet: () => import("./material-snippet-GktRrUjO.js")
}, I = {}, We = {}, Ge = null, Ke = null, qe = {
	mesh: ["\"type\":\"mesh\"", "\"instances\""],
	modeling: [
		"\"type\":\"lathe\"",
		"\"type\":\"extrude\"",
		"\"type\":\"tube\"",
		"\"type\":\"curve\""
	],
	text: ["\"type\":\"text\""],
	motion: ["\"motion\":{"],
	drive: ["\"drive\":{"],
	physics: ["\"physics\":{"],
	cloth: ["\"cloth\":{"],
	particles: ["\"particles\":{"],
	bake: ["\"bake\":{"],
	reflections: [/"metallic":(0\.[5-9]|1(?![0-9]))/],
	patterns: ["\"pattern\""],
	relations: ["\"relations\":"],
	timeline: ["\"timeline\":{"],
	layerShaders: ["\"anisotropy\"", "\"iridescence\""],
	liquidShader: [
		"\"transmission\"",
		"\"liquid\"",
		"\"foam\""
	],
	subsurfaceShader: ["\"subsurface\""],
	fogShader: ["volumeFog"],
	worldMaterials: [
		"\"tag\":\"water\"",
		"\"waterPreset\"",
		"\"absorption\"",
		"\"turbidity\"",
		"\"vegetation\":{",
		"\"tag\":\"foliage\"",
		"\"tag\":\"grass\"",
		"\"tag\":\"terrain\"",
		"\"tag\":\"fire\"",
		"\"tag\":\"smoke\"",
		"\"moss\""
	],
	terrain: ["\"type\":\"terrain\""],
	navigation: [],
	lightLinking: ["\"affects\"", "\"keyAffects\""],
	cascades: [/"(?:shadowCascades|sunAngularRadius|ies)"|"areaLights":\[\{/],
	assets: ["\"asset\":{", "\"sequence\":{"],
	vegetation: ["\"vegetation\":{", "\"wind\":{"],
	crowd: ["\"crowd\":{"],
	lineArt: ["\"lines\":{", "\"toon\":"],
	viewTransform: [
		"\"viewTransform\":\"agx\"",
		"\"viewTransform\":\"neutral\"",
		"\"look\":\""
	],
	coplanar: ["\"resolveCoplanar\""],
	floorSky: ["\"keyColor\"", "\"keyIntensity\""],
	userPass: ["\"postPasses\""],
	materialSnippet: ["\"snippet\":{"],
	objectMotionBlur: [/"motionBlur":\{[^}]*"objects":(?!0[,}])/],
	postSteps: [/"(?:colorBalance|glare|lensDistortion)"/]
};
function Je(e) {
	return JSON.stringify(e ?? null).includes("\"op\":\"boolean\"");
}
function Ye(e) {
	return JSON.stringify(e ?? null).includes("\"physics\":{");
}
function Xe(e) {
	let t;
	try {
		t = JSON.stringify(e ?? null);
	} catch {
		return Object.keys(Ue);
	}
	let n = t.replace(/"\s*:\s*/g, "\":");
	return Object.keys(qe).filter((e) => qe[e].some((e) => e instanceof RegExp ? e.test(n) : n.includes(e)));
}
function Ze(e) {
	return I[e] ? Promise.resolve(I[e]) : (We[e] ??= Ue[e]().then((t) => (I[e] = t, e === "mesh" && Ge && t.setManifoldModuleLoader(Ge), e === "physics" && Ke && t.setPhysicsModuleLoader(Ke), t)), We[e]);
}
async function Qe(e) {
	await Promise.all(Xe(e).map(Ze));
}
async function $e() {
	await Promise.all(Object.keys(Ue).map(Ze));
}
function et(e, t) {
	I[e] ??= t;
}
function L(e) {
	let t = I[e];
	if (!t) throw Error(`This recipe needs the ${e} code, which loads on demand: await loadAgentSceneModules(recipe) before createAgentScene or apply.`);
	return t;
}
function tt() {
	return Object.keys(Ue).every((e) => I[e]);
}
function nt(e) {
	return !!I[e];
}
async function rt(e, t) {
	(await Ze("text")).registerFont(e, t);
}
function it(e) {
	if (typeof e != "function") throw TypeError("The Manifold loader must be a function returning a module promise.");
	Ge = e, I.mesh?.setManifoldModuleLoader(e);
}
async function at(e) {
	return (await Ze("mesh")).loadMeshBooleans(e);
}
function ot() {
	return I.mesh?.meshBooleansLoaded() ?? !1;
}
function st(e) {
	if (typeof e != "function") throw TypeError("The physics loader must be a function returning a module promise.");
	Ke = e, I.physics?.setPhysicsModuleLoader(e);
}
async function ct(e) {
	return (await Ze("physics")).loadPhysicsEngine(e);
}
function lt() {
	return I.physics?.physicsEngineLoaded() ?? !1;
}
// src/agent-look.js
var ut = 16, dt = /* @__PURE__ */ "world.ground.setup.hdri.environmentIntensity.environmentRotation.lightDirection.keyColor.keyIntensity.fillIntensity.ambientIntensity.daylight.pointLights.spotLights.areaLights.skyTop.skyBottom.fogColor.fogDensity.volumeFog.liquid.shadowCascades.keyAffects.objectReflections.floorSkyTrace.sunBounce.specularAntiAliasing.sunAngularRadius.lines.resolveCoplanar.viewTransform.look.wind".split("."), ft = [
	"exposure",
	"saturation",
	"contrast",
	"temperature",
	"vignette",
	"grain",
	"ambientOcclusion",
	"ambientOcclusionRadius",
	"bloom",
	"depthOfField",
	"motionBlur"
], pt = [
	"target",
	"extent",
	"distance",
	"near",
	"far"
], mt = [
	"position",
	"color",
	"intensity",
	"radius",
	"range",
	"castShadow",
	"affects"
], ht = [
	"position",
	"direction",
	"angle",
	"penumbra",
	"color",
	"intensity",
	"radius",
	"range",
	"castShadow",
	"ies",
	"affects"
], gt = [
	"position",
	"direction",
	"up",
	"width",
	"height",
	"color",
	"intensity",
	"castShadow",
	"ies",
	"affects"
], _t = [
	"minimum",
	"maximum",
	"color",
	"ambient",
	"drift"
], vt = [
	"density",
	"steps",
	"anisotropy",
	"noiseAmount",
	"noiseScale",
	"maxDistance",
	"shadowAmbient",
	"heightFalloff",
	"detailOctaves",
	"detailAmount",
	"warp",
	"contrast",
	"profileSoftness",
	"keyScattering",
	"scatterOctaves",
	"multiScatter",
	"multiExtinction",
	"multiAnisotropy",
	"keyTransmittance",
	"surfaceTransmittance"
], yt = Object.freeze([..._t, ...vt]), bt = [
	"strength",
	"threshold",
	"radius"
], xt = ["blur", "focusDistance"], St = ["shutter", "objects"], Ct = 4, wt = 1024;
function Tt(e, t) {
	if (e.affects === void 0) return {};
	let n = e.affects;
	if (!Array.isArray(n) || n.length > wt || n.some((e) => typeof e != "string" || e.length < 1 || e.length > 128)) throw TypeError(`${t} affects must be a list of at most ${wt} node IDs.`);
	return { affects: [...n] };
}
function Et(e) {
	if (!Number.isInteger(e) || e < 0 || e > Ct) throw RangeError(`environment.shadowCascades must be an integer from 1 to ${Ct}, or 0 for the single shadow map.`);
	return e;
}
function Dt(e) {
	let t = [
		...e.pointLights ?? [],
		...e.spotLights ?? [],
		...e.areaLights ?? []
	];
	return e.keyAffects !== void 0 || t.some((e) => e.affects !== void 0);
}
function Ot(e, t) {
	if (!e || typeof e != "object" || Array.isArray(e) || Object.getPrototypeOf(e) !== Object.prototype && Object.getPrototypeOf(e) !== null) throw TypeError(`${t} must be a plain JSON object.`);
}
function R(e, t, n) {
	Ot(e, n);
	for (let r of Reflect.ownKeys(e)) if (typeof r != "string" || !t.includes(r)) throw TypeError(`Unknown ${n} field: ${String(r)}.`);
}
function z(e, t = 0, n = /* @__PURE__ */ new Set()) {
	if (t > 32) throw RangeError("Look JSON nesting exceeds 32 levels.");
	if (e === null || typeof e == "boolean" || typeof e == "string") return e;
	if (typeof e == "number") {
		if (!Number.isFinite(e) || !Number.isFinite(Math.fround(e))) throw TypeError("Look JSON numbers must be finite Float32 values.");
		return e;
	}
	if (!e || typeof e != "object" || n.has(e)) throw TypeError("Look must contain acyclic plain JSON data.");
	let r = Array.isArray(e);
	if (r && (Object.getPrototypeOf(e) !== Array.prototype || e.length > ut)) throw TypeError(`Look JSON arrays must be ordinary arrays with at most ${ut} entries.`);
	r || Ot(e, "Look"), n.add(e);
	let i = r ? [] : {};
	for (let a of Reflect.ownKeys(e)) {
		if (r && a === "length") continue;
		if (typeof a != "string" || a === "__proto__") throw TypeError("Look JSON keys must be ordinary strings.");
		let o = Object.getOwnPropertyDescriptor(e, a);
		if (!o.enumerable || !Object.hasOwn(o, "value")) throw TypeError("Look JSON accessors and hidden fields are unsupported.");
		if (r && a !== String(i.length)) throw TypeError("Look JSON arrays must be dense without extra fields.");
		i[a] = z(o.value, t + 1, n);
	}
	if (r && i.length !== e.length) throw TypeError("Look JSON arrays cannot contain trailing holes.");
	return n.delete(e), i;
}
function kt(e, t) {
	return e <= 1 && t >= 1 ? "1" : String(e > 0 ? e : t);
}
function B(e, t, n, r) {
	if (typeof e != "number" || !Number.isFinite(e) || !Number.isFinite(Math.fround(e)) || e < t || e > n) throw S(r, e, t < -1e30 && n > 1e30 ? "a finite number, such as 0.5" : `a number from ${t} to ${n}, such as ${kt(t, n)}`);
	return e;
}
function V(e, t, n, r) {
	if (!Array.isArray(e) || e.length !== 3) {
		let i = kt(t, n);
		throw S(r, e, `an array of three numbers from ${t} to ${n}, such as [${i}, ${i}, ${i}]`, TypeError);
	}
	return e.map((e, i) => B(e, t, n, `${r}[${i}]`));
}
function H(e, t) {
	return e === void 0 ? t : e;
}
function At(e, t = "lightDirection") {
	let n = V(e, -1e6, 1e6, t), r = Math.hypot(...n);
	if (r < 1e-6) throw S(t, n, "a direction that is not all zero, such as [0, -1, 0]");
	return {
		direction: n,
		unitDirection: n.map((e) => e / r)
	};
}
function jt(e, t, n) {
	let r = H(e, []);
	if (!Array.isArray(r) || r.length > t) throw S(n, Array.isArray(r) ? `${r.length} entries` : r, `an array of at most ${t} lights, such as []`);
	return r;
}
function Mt(e) {
	let t = B(H(e.range, 0), 0, 1e6, "range");
	if (t !== 0 && t < .001) throw S("range", t, "0 for unlimited, or at least 0.001, such as 10");
	return t;
}
function Nt(e) {
	let t = H(e.castShadow, !1);
	if (typeof t != "boolean") throw S("castShadow", t, "true or false", TypeError);
	return t ? { castShadow: t } : {};
}
function Pt(e) {
	return R(e, mt, "point light"), {
		position: V(e.position, -1e6, 1e6, "position"),
		color: V(H(e.color, [
			1,
			1,
			1
		]), 0, 1, "color"),
		intensity: B(H(e.intensity, 1), 0, 1e5, "intensity"),
		radius: B(H(e.radius, .05), .001, 1e6, "radius"),
		range: Mt(e),
		...Nt(e),
		...Tt(e, "point light")
	};
}
function Ft(e) {
	return R(e, ht, "spot light"), {
		position: V(e.position, -1e6, 1e6, "position"),
		direction: At(e.direction, "direction").direction,
		angle: B(H(e.angle, Math.PI / 4), .01, Math.PI / 2 - .01, "angle"),
		penumbra: B(H(e.penumbra, .15), 0, 1, "penumbra"),
		color: V(H(e.color, [
			1,
			1,
			1
		]), 0, 1, "color"),
		intensity: B(H(e.intensity, 1), 0, 1e5, "intensity"),
		radius: B(H(e.radius, .05), .001, 1e6, "radius"),
		range: Mt(e),
		...Nt(e),
		...Tt(e, "spot light")
	};
}
function It(e) {
	R(e, gt, "area light");
	let t = {
		position: V(e.position, -1e6, 1e6, "position"),
		direction: At(e.direction, "direction").direction,
		width: B(e.width, .001, 1e4, "width"),
		height: B(e.height, .001, 1e4, "height"),
		color: V(H(e.color, [
			1,
			1,
			1
		]), 0, 1, "color"),
		intensity: B(H(e.intensity, 1), 0, 1e5, "intensity")
	};
	return e.up !== void 0 && (t.up = At(e.up, "up").direction), {
		...t,
		...Tt(e, "area light")
	};
}
function Lt(e = {}) {
	R(e, yt, "volumeFog");
	for (let t of _t) Object.hasOwn(e, t) && V(e[t], -1e5, 1e5, `volumeFog.${t}`);
	for (let t of vt) Object.hasOwn(e, t) && B(e[t], -Number.MAX_VALUE, Number.MAX_VALUE, `volumeFog.${t}`);
	return z(ie(e));
}
function Rt(e = {}) {
	R(e, dt, "environment");
	let t = H(e.world, !1);
	if (typeof t != "boolean") throw S("environment.world", t, "true or false", TypeError);
	let n = H(e.setup, k);
	if (!A.includes(n)) throw S("environment.setup", n, `one of ${A.join(", ")}`);
	let r = Fe(n), i = {
		world: t,
		setup: n,
		environmentIntensity: B(H(e.environmentIntensity, 1), 0, 100, "environment.environmentIntensity"),
		environmentRotation: B(H(e.environmentRotation, 0), -100, 100, "environment.environmentRotation"),
		lightDirection: At(H(e.lightDirection, r.lightDirection), "environment.lightDirection").direction,
		keyColor: V(H(e.keyColor, r.keyColor), 0, 1e3, "environment.keyColor"),
		keyIntensity: B(H(e.keyIntensity, r.keyIntensity), 0, 100, "environment.keyIntensity"),
		fillIntensity: B(H(e.fillIntensity, r.fillIntensity), 0, 100, "environment.fillIntensity"),
		ambientIntensity: B(H(e.ambientIntensity, r.ambientIntensity), 0, 100, "environment.ambientIntensity"),
		daylight: B(H(e.daylight, 1), 0, 100, "environment.daylight"),
		pointLights: jt(e.pointLights, 16, "environment.pointLights").map((e, t) => x(`environment.pointLights[${t}]`, () => Pt(e))),
		skyTop: V(H(e.skyTop, r.skyTop), 0, 1, "environment.skyTop"),
		skyBottom: V(H(e.skyBottom, r.skyBottom), 0, 1, "environment.skyBottom"),
		fogColor: V(H(e.fogColor, [
			.35,
			.43,
			.43
		]), 0, 1, "environment.fogColor"),
		fogDensity: e.fogDensity === void 0 || e.fogDensity === null ? null : B(e.fogDensity, 0, 10, "environment.fogDensity"),
		volumeFog: Lt(e.volumeFog)
	};
	if (e.ground !== void 0) {
		if (typeof e.ground != "boolean") throw S("environment.ground", e.ground, "true or false", TypeError);
		i.ground = e.ground;
	}
	if (e.objectReflections !== void 0) {
		if (typeof e.objectReflections != "boolean") throw S("environment.objectReflections", e.objectReflections, "true or false", TypeError);
		i.objectReflections = e.objectReflections;
	}
	if (e.floorSkyTrace !== void 0) {
		if (typeof e.floorSkyTrace != "boolean") throw S("environment.floorSkyTrace", e.floorSkyTrace, "true or false", TypeError);
		i.floorSkyTrace = e.floorSkyTrace;
	}
	if (e.sunBounce !== void 0) {
		if (!Number.isFinite(e.sunBounce) || e.sunBounce < 0) throw S("environment.sunBounce", e.sunBounce, "a number of 0 or more, such as 1", TypeError);
		i.sunBounce = e.sunBounce;
	}
	if (e.specularAntiAliasing !== void 0 && (i.specularAntiAliasing = B(e.specularAntiAliasing, 0, 4, "environment.specularAntiAliasing")), e.lines !== void 0 && e.lines !== null && (i.lines = z(L("lineArt").resolveLineArt(e.lines))), e.resolveCoplanar !== void 0) {
		if (e.resolveCoplanar !== "offset" && e.resolveCoplanar !== !1) throw S("environment.resolveCoplanar", e.resolveCoplanar, "'offset' or false", TypeError);
		i.resolveCoplanar = e.resolveCoplanar;
	}
	if (e.spotLights !== void 0 && (i.spotLights = jt(e.spotLights, 8, "environment.spotLights").map((e, t) => x(`environment.spotLights[${t}]`, () => Ft(e)))), e.areaLights !== void 0 && (i.areaLights = jt(e.areaLights, 7, "environment.areaLights").map((e, t) => x(`environment.areaLights[${t}]`, () => It(e)))), e.shadowCascades !== void 0 && (i.shadowCascades = Et(e.shadowCascades)), e.wind !== void 0 && e.wind !== null && (i.wind = L("vegetation").normalizeWind(e.wind)), e.hdri !== void 0 && e.hdri !== null) {
		if (typeof e.hdri != "string" || !ue(e.hdri)) throw S("environment.hdri", e.hdri, `one of ${se.join(", ")} or the 64-character ID of a .hdr file in the asset catalog`);
		i.hdri = e.hdri;
	}
	if (e.viewTransform !== void 0) {
		if (!me.includes(e.viewTransform)) throw S("environment.viewTransform", e.viewTransform, `one of ${me.join(", ")}`);
		i.viewTransform = e.viewTransform;
	}
	if (e.look !== void 0 && e.look !== null) {
		if (!he.includes(e.look) && !ce(e.look)) throw S("environment.look", e.look, `one of ${[...he, ...de].join(", ")} or the 64-character ID of a .cube file in the asset catalog`);
		i.look = e.look;
	}
	return e.keyAffects !== void 0 && (i.keyAffects = Tt({ affects: e.keyAffects }, "environment keyAffects").affects), e.liquid !== void 0 && (R(e.liquid, Object.keys(D), "liquid"), i.liquid = z(E(z(e.liquid)))), fe.normalize?.(e, i), T(re(), i, { world: t }), i;
}
function zt(e) {
	return e.setup === void 0 ? e : {
		...Fe(e.setup),
		...e
	};
}
function Bt(e) {
	return e.hdri ? He(e.hdri, {
		intensity: e.environmentIntensity,
		rotation: e.environmentRotation,
		showBackground: e.world
	}) : Ve(e.setup, {
		intensity: e.environmentIntensity,
		rotation: e.environmentRotation,
		showBackground: e.world
	});
}
function Vt(e = {}) {
	R(e, [...ft, ...pe.fields], "effects");
	let t = {
		bloom: bt,
		depthOfField: xt,
		motionBlur: St
	};
	for (let n of ft) !(n in t) && Object.hasOwn(e, n) && B(e[n], -Number.MAX_VALUE, Number.MAX_VALUE, `effects.${n}`);
	let n = {};
	for (let [r, i] of Object.entries(t)) {
		n[r] = H(e[r], {}), R(n[r], i, r);
		for (let e of i) Object.hasOwn(n[r], e) && B(n[r][e], -Number.MAX_VALUE, Number.MAX_VALUE, `${r}.${e}`);
	}
	let r = H(e.ambientOcclusion, 0);
	return {
		...ne({
			...e,
			ambientOcclusion: r,
			...n,
			bloom: {
				strength: .12,
				threshold: 1,
				radius: 1,
				...n.bloom
			}
		}),
		exposure: B(H(e.exposure, 1), .01, 16, "exposure"),
		...pe.resolve?.(e)
	};
}
function Ht(e = {}) {
	R(e, pt, "shadow");
	let t = {
		target: V(H(e.target, [
			0,
			1,
			0
		]), -1e6, 1e6, "shadow target"),
		extent: B(H(e.extent, 3.5), .01, 1e5, "shadow extent"),
		distance: B(H(e.distance, 8), .01, 1e6, "shadow distance"),
		near: B(H(e.near, .1), .001, 1e6, "shadow near"),
		far: B(H(e.far, 15), .001, 1e6, "shadow far")
	};
	if (Math.fround(t.near) >= Math.fround(t.far)) throw RangeError("Shadow needs near < far at Float32 precision.");
	return t;
}
function Ut(e, r) {
	let { unitDirection: o } = At(r), s = e.target.map((t, n) => t + o[n] * e.distance);
	if (!s.every((e) => Number.isFinite(Math.fround(e))) || s.every((t, n) => Math.fround(t) === Math.fround(e.target[n]))) throw RangeError("Shadow eye and target must remain finite and distinguishable at Float32 precision.");
	let l = Math.abs(o[1]) > .99 ? [
		0,
		0,
		1
	] : [
		0,
		1,
		0
	], u = i(a(), s, e.target, l), d = t(a(), -e.extent, e.extent, -e.extent, e.extent, e.near, e.far), f = n(a(), d, u);
	for (let e of [
		u,
		d,
		f
	]) {
		let t = c(e);
		if (!e.every(Number.isFinite) || !Number.isFinite(t) || t === 0) throw RangeError("Shadow view, projection, and combined matrices must remain finite and nonsingular at Float32 precision.");
	}
	return {
		eye: s,
		target: [...e.target],
		up: l,
		extent: e.extent,
		near: e.near,
		far: e.far
	};
}
function Wt(e = {}, t = [
	-3,
	6,
	4
]) {
	return Ut(Ht(z(e)), z(t));
}
function Gt(e = {}) {
	R(e, [
		"environment",
		"effects",
		"shadow"
	], "look");
	let t = z(e), n = Rt(t.environment), r = Vt(t.effects), i = Ht(t.shadow);
	return Ut(i, n.lightDirection), {
		environment: n,
		effects: r,
		shadow: i
	};
}
// src/agent-diagnostics.js
var Kt = [
	"clearcoat",
	"sheenColor",
	"specular",
	"specularColor",
	"anisotropy",
	"iridescence"
], qt = ["anisotropy", "iridescence"], Jt = [
	"thickness",
	"attenuationColor",
	"attenuationDistance"
];
function U(e, t, n, r, i) {
	return {
		kind: e,
		severity: t,
		target: n,
		message: r,
		fix: i
	};
}
function Yt(e, t) {
	let n = e[t];
	return Array.isArray(n) ? n.some((e) => e !== 0) : typeof n == "number" && n !== 0;
}
function Xt(e) {
	let t = [], n = e.tag ?? "surface", r = Yt(e, "transmission");
	if (n !== "surface" && n !== "liquid") for (let r of Kt.filter((t) => Yt(e, t))) t.push(U("ignored-material-field", "warning", e.id, `${r} is ignored on a material with tag ${n}.`, `Remove ${r}, or set the material tag to surface with scene_apply set-material.`));
	if (r) for (let n of qt.filter((t) => Yt(e, t))) t.push(U("ignored-material-field", "warning", e.id, `${n} is ignored on a transmitting material.`, `Set transmission to 0 to see ${n}, or remove ${n}.`));
	else for (let n of Jt.filter((t) => Yt(e, t))) t.push(U("ignored-material-field", "warning", e.id, `${n} only matters with transmission, and transmission is 0.`, `Set transmission above 0 for glass or gems, or remove ${n}.`));
	return r && (e.alphaMode === "blend" || e.opacity < 1) && t.push(U("transmission-blended", "warning", e.id, "A transmitting material that is also blended does not refract what is behind it.", "Set opacity to 1 and alphaMode to opaque for refraction, or drop transmission and keep the blended look.")), e.pattern && (n === "liquid" || n === "foam" || n === "unlit") && t.push(U("ignored-material-field", "warning", e.id, `pattern is not applied to a material with tag ${n}.`, "Move the pattern to a surface material, or remove it.")), t;
}
function Zt(e) {
	let t = e.materials.flatMap(Xt), n = new Set(e.nodes.map((e) => e.material).filter(Boolean)), r = new Set(e.nodes.map((e) => e.geometry).filter(Boolean));
	for (let r of e.materials.filter((e) => !n.has(e.id))) t.push(U("unused-material", "info", r.id, `Material ${r.id} is used by no node.`, "Assign it to a node with scene_apply set-node, or remove it with remove-material."));
	for (let n of e.geometries.filter((e) => !r.has(e.id))) t.push(U("unused-geometry", "info", n.id, `Geometry ${n.id} is used by no node, so nothing draws it.`, "Add a node that uses it with scene_apply add-node, or remove it with remove-geometry."));
	return t;
}
function Qt(e, t = !1) {
	return t ? U("closed-room-without-bake", "warning", "bake", `${Math.round(e * 100)} percent of rays from the middle of the scene hit a wall, so this is a closed room lit only by its point, spot or area lights. Without a bake the walls bounce light only as one average colour over the whole room: no brighter corner beside a lamp, no colour bleeding off a red wall onto the floor next to it.`, "Add \"bake\": { \"preset\": \"standard\" } (scene_apply set-bake) for bounced light that follows the lamps and the wall colours.") : U("closed-room-without-bake", "warning", "bake", `${Math.round(e * 100)} percent of rays from the middle of the scene hit a wall, so this is a closed room, and without a bake the world's light still reaches it: the room renders lifted and grey, with weak contact shadows.`, "Add \"bake\": { \"preset\": \"standard\" } (scene_apply set-bake). It darkens what the sky cannot see and adds bounced light, halving the indirect-light error of a closed room.");
}
function $t({ assetId: e, warnings: t = [], skinnedParts: n, jointCount: r, clipCount: i }) {
	let a = t.map((t) => U("unsupported-asset-feature", "warning", e, String(t), "The asset loads without it. Remove the feature from the GLB, or bake it into the base colour texture."));
	return n > 0 && r === 0 && a.push(U("rig-without-joints", "error", e, `${n} meshes are skinned but the asset has no joint nodes, so no pose or ik can move them.`, "Re-export the GLB with its armature, or use an asset that has joints.")), n === 0 && r > 0 && a.push(U("rig-without-skin", "warning", e, `The asset has ${r} joint nodes but no mesh is skinned to them, so moving a joint changes nothing you can see.`, "Move the parent node with set-asset-node instead, or fix the skin binding in the source file.")), i === 0 && a.push(U("asset-without-clips", "info", e, "The asset has no animation clips, so set-animation and the export clip option are unavailable.", "Pose it with motion tracks or ik, or choose an asset that ships clips.")), a;
}
// src/rig-presets.js
var en = Object.freeze(["humanoid", "quadruped"]), tn = .012, nn = -.012;
function rn(e) {
	return {
		size: e.max.map((t, n) => t - e.min[n]),
		center: e.max.map((t, n) => (t + e.min[n]) / 2),
		floorY: e.min[1],
		minimumZ: e.min[2]
	};
}
function an(e) {
	let { size: t, center: n, floorY: r } = rn(e), i = t[1], a = (e, t, a) => [
		n[0] + e * i,
		r + t * i,
		n[2] + a * i
	], o = [
		{
			name: "hips",
			parent: null,
			head: a(0, .52, 0)
		},
		{
			name: "spine",
			parent: "hips",
			head: a(0, .58, 0)
		},
		{
			name: "chest",
			parent: "spine",
			head: a(0, .68, 0)
		},
		{
			name: "neck",
			parent: "chest",
			head: a(0, .8, 0)
		},
		{
			name: "head",
			parent: "neck",
			head: a(0, .86, 0),
			tail: a(0, 1, 0)
		}
	];
	for (let [e, t] of [["left", 1], ["right", -1]]) {
		let n = (t) => `${e}${t}`;
		o.push({
			name: n("Shoulder"),
			parent: "chest",
			head: a(t * .03, .77, 0)
		}, {
			name: n("UpperArm"),
			parent: n("Shoulder"),
			head: a(t * .1, .77, 0)
		}, {
			name: n("LowerArm"),
			parent: n("UpperArm"),
			head: a(t * .12, .6, nn)
		}, {
			name: n("Hand"),
			parent: n("LowerArm"),
			head: a(t * .135, .45, 0),
			tail: a(t * .145, .37, 0)
		}, {
			name: n("UpperLeg"),
			parent: "hips",
			head: a(t * .06, .5, 0)
		}, {
			name: n("LowerLeg"),
			parent: n("UpperLeg"),
			head: a(t * .065, .28, tn)
		}, {
			name: n("Foot"),
			parent: n("LowerLeg"),
			head: a(t * .065, .05, 0)
		}, {
			name: n("Toes"),
			parent: n("Foot"),
			head: a(t * .065, .02, .07),
			tail: a(t * .065, .02, .12)
		});
	}
	return o;
}
function on(e) {
	let { size: t, center: n, floorY: r, minimumZ: i } = rn(e), [a, o, s] = t, c = (e, t, c) => [
		n[0] + e * a,
		r + t * o,
		i + c * s
	], l = [
		{
			name: "hips",
			parent: null,
			head: c(0, .62, .25)
		},
		{
			name: "spine",
			parent: "hips",
			head: c(0, .64, .45)
		},
		{
			name: "chest",
			parent: "spine",
			head: c(0, .64, .65)
		},
		{
			name: "neck",
			parent: "chest",
			head: c(0, .72, .78)
		},
		{
			name: "head",
			parent: "neck",
			head: c(0, .85, .86),
			tail: c(0, .85, 1)
		},
		{
			name: "tail1",
			parent: "hips",
			head: c(0, .64, .18)
		},
		{
			name: "tail2",
			parent: "tail1",
			head: c(0, .6, .1)
		},
		{
			name: "tail3",
			parent: "tail2",
			head: c(0, .55, .04),
			tail: c(0, .5, 0)
		}
	];
	for (let [e, t] of [["left", 1], ["right", -1]]) {
		let n = t * .28;
		l.push({
			name: `${e}FrontUpperLeg`,
			parent: "chest",
			head: c(n, .6, .65)
		}, {
			name: `${e}FrontLowerLeg`,
			parent: `${e}FrontUpperLeg`,
			head: c(n, .33, .638)
		}, {
			name: `${e}FrontFoot`,
			parent: `${e}FrontLowerLeg`,
			head: c(n, .1, .65),
			tail: c(n, 0, .68)
		}, {
			name: `${e}HindUpperLeg`,
			parent: "hips",
			head: c(n, .6, .25)
		}, {
			name: `${e}HindLowerLeg`,
			parent: `${e}HindUpperLeg`,
			head: c(n, .33, .298)
		}, {
			name: `${e}HindFoot`,
			parent: `${e}HindLowerLeg`,
			head: c(n, .1, .25),
			tail: c(n, 0, .28)
		});
	}
	return l;
}
var sn = {
	humanoid: an,
	quadruped: on
};
function cn(e, t, n = {}) {
	if (!Object.hasOwn(sn, e)) throw RangeError(`Armature preset must be one of ${en.join(", ")}.`);
	let r = /* @__PURE__ */ new Set(), i = sn[e](t).map((e) => (r.add(e.name), {
		...e,
		head: n[e.name] ?? e.head,
		...e.tail || n[`${e.name}Tail`] ? { tail: n[`${e.name}Tail`] ?? e.tail } : {}
	}));
	for (let t of Object.keys(n)) {
		let n = t.endsWith("Tail") ? t.slice(0, -4) : t;
		if (!r.has(n)) throw RangeError(`Landmark ${t} does not name a ${e} bone. Bones: ${[...r].join(", ")}.`);
	}
	return i;
}
var ln = 4, un = 4, dn = .02, fn = .25, pn = .002, mn = 1e-6, hn = 256, gn = [
	0,
	0,
	1
];
function _n(e, t) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${t} must be an object.`);
}
function vn(e, t, n) {
	_n(e, n);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`${n} has an unsupported field: ${JSON.stringify(r.slice(0, 48))}.`);
}
function yn(e, t) {
	if (typeof e != "string" || !e.trim() || e.length > 64) throw TypeError(`${t} must be a name of 1 to 64 characters.`);
	return e;
}
function W(e, t, n) {
	if (!Array.isArray(e) || e.length !== t || e.some((e) => !Number.isFinite(e))) throw TypeError(`${n} must be an array of ${t} finite numbers.`);
	return e.slice();
}
function bn(e, t) {
	vn(e, ["min", "max"], t);
	let n = {
		min: W(e.min, 3, `${t} min`),
		max: W(e.max, 3, `${t} max`)
	};
	if (n.max.some((e, t) => e <= n.min[t])) throw RangeError(`${t} must have max above min on every axis.`);
	return n;
}
function xn(e, t) {
	let n = new Map(e.map((e) => [e.name, e])), r = [], i = /* @__PURE__ */ new Map();
	function a(e) {
		if (i.get(e.name) !== 2) {
			if (i.get(e.name) === 1) throw RangeError(`Armature ${t} bones form a cycle at ${e.name}.`);
			i.set(e.name, 1), e.parent !== null && a(n.get(e.parent)), i.set(e.name, 2), r.push(e);
		}
	}
	return e.forEach(a), r;
}
function Sn(e, t) {
	if (!Array.isArray(e) || e.length < 1 || e.length > 128) throw RangeError(`Armature ${t} needs 1 to 128 bones.`);
	let n = /* @__PURE__ */ new Set(), r = e.map((e, r) => {
		let i = `Armature ${t} bone ${r}`;
		vn(e, [
			"name",
			"parent",
			"head",
			"tail"
		], i);
		let a = yn(e.name, `${i} name`);
		if (n.has(a)) throw RangeError(`Armature ${t} repeats bone ${a}.`);
		n.add(a);
		let o = {
			name: a,
			parent: e.parent === void 0 || e.parent === null ? null : yn(e.parent, `${i} parent`),
			head: W(e.head, 3, `${i} head`)
		};
		return e.tail !== void 0 && (o.tail = W(e.tail, 3, `${i} tail`)), o;
	});
	for (let e of r) if (e.parent !== null && !n.has(e.parent)) throw RangeError(`Armature ${t} bone ${e.name} names an unknown parent ${e.parent}.`);
	return xn(r, t);
}
function Cn(e, t, n) {
	if (t === void 0) throw TypeError(`Armature ${e.id} preset needs fit: { node } or fit: { bounds }.`);
	if (vn(t, [
		"node",
		"bounds",
		"landmarks"
	], `Armature ${e.id} fit`), t.node === void 0 == (t.bounds === void 0)) throw TypeError(`Armature ${e.id} fit takes node or bounds, not both.`);
	return t.bounds === void 0 ? n(e, t.node) : bn(t.bounds, `Armature ${e.id} fit bounds`);
}
function wn(e, t) {
	return e === void 0 ? {} : (_n(e, `Armature ${t} landmarks`), Object.fromEntries(Object.entries(e).map(([e, n]) => [e, W(n, 3, `Armature ${t} landmark ${e}`)])));
}
function Tn(e, { resolveBounds: t }) {
	if (!Array.isArray(e) || e.length > 16) throw RangeError("armatures must be an array of at most 16.");
	let n = /* @__PURE__ */ new Set();
	return e.map((e) => {
		vn(e, [
			"id",
			"parent",
			"translation",
			"rotation",
			"prefix",
			"preset",
			"fit",
			"bones"
		], "armature");
		let r = yn(e.id, "armature id");
		if (n.has(r)) throw RangeError(`Duplicate armature ID: ${r}.`);
		n.add(r);
		let i = W(e.rotation ?? [
			0,
			0,
			0,
			1
		], 4, `Armature ${r} rotation`), a = Math.hypot(...i);
		if (a === 0) throw RangeError(`Armature ${r} rotation must be nonzero.`);
		let o = {
			id: r,
			parent: e.parent === void 0 || e.parent === null ? null : yn(e.parent, `Armature ${r} parent`),
			translation: W(e.translation ?? [
				0,
				0,
				0
			], 3, `Armature ${r} translation`),
			rotation: i.map((e) => e / a),
			prefix: e.prefix === void 0 || e.prefix === "" ? "" : yn(e.prefix, `Armature ${r} prefix`)
		};
		if (e.preset === void 0 == (e.bones === void 0)) throw TypeError(`Armature ${r} needs preset or bones, not both.`);
		if (e.preset === void 0) {
			if (e.fit !== void 0) throw TypeError(`Armature ${r} fit only applies to a preset.`);
			return {
				...o,
				bones: Sn(e.bones, r)
			};
		}
		if (!en.includes(e.preset)) throw RangeError(`Armature ${r} preset must be one of ${en.join(", ")}.`);
		let s = Cn(o, e.fit, t);
		return {
			...o,
			bones: Sn(cn(e.preset, s, wn(e.fit.landmarks, r)), r)
		};
	});
}
function En(e, t) {
	return `${e.prefix}${t}`;
}
function Dn(e) {
	let t = new Map(e.bones.map((e) => [e.name, e.head]));
	return [{
		id: e.id,
		parent: e.parent,
		translation: e.translation,
		rotation: e.rotation,
		scale: [
			1,
			1,
			1
		],
		armature: e.id
	}, ...e.bones.map((n) => {
		let r = n.parent === null ? [
			0,
			0,
			0
		] : t.get(n.parent);
		return {
			id: En(e, n.name),
			parent: n.parent === null ? e.id : En(e, n.parent),
			translation: n.head.map((e, t) => e - r[t]),
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
			armature: e.id
		};
	})];
}
function On(e) {
	return Array.isArray(e) ? e.filter((e) => !Object.hasOwn(e ?? {}, "armature")) : e;
}
function kn(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.bones) n.parent !== null && t.set(n.parent, [...t.get(n.parent) ?? [], n]);
	let n = new Map(e.bones.map((e) => [e.name, e.head]));
	return e.bones.map((e) => {
		if (e.tail) return e.tail;
		let r = t.get(e.name);
		return r ? [
			0,
			1,
			2
		].map((e) => r.reduce((t, n) => t + n.head[e], 0) / r.length) : e.parent === null ? [
			e.head[0],
			e.head[1] + .1,
			e.head[2]
		] : e.head.map((t, r) => t + (t - n.get(e.parent)[r]) * .5);
	});
}
function An(e, t, r = []) {
	let i = a(), s = e;
	for (let c = 0; s != null; c++) {
		if (c > hn) throw RangeError(`Node ${e} has a parent chain that never ends.`);
		let l = t.get(s) ?? r.find((e) => e.id === s);
		if (!l) throw RangeError(`Unknown node or armature ${JSON.stringify(String(s).slice(0, 48))} in a parent chain.`);
		n(i, o(a(), l.rotation, l.translation, l.scale ?? [
			1,
			1,
			1
		]), i), s = l.parent;
	}
	return i;
}
function jn(e, t) {
	let n = [
		Infinity,
		Infinity,
		Infinity
	], r = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let i = 0; i < 8; i++) we(P(), [
		0,
		1,
		2
	].map((t) => i & 1 << t ? e.max[t] : e.min[t]), t).forEach((e, t) => {
		n[t] = Math.min(n[t], e), r[t] = Math.max(r[t], e);
	});
	return {
		min: n,
		max: r
	};
}
function Mn(e, t, n, r, i) {
	let a = i[0] - r[0], o = i[1] - r[1], s = i[2] - r[2], c = a * a + o * o + s * s, l = c === 0 ? 0 : ((e - r[0]) * a + (t - r[1]) * o + (n - r[2]) * s) / c, u = Math.min(1, Math.max(0, l)), d = e - (r[0] + a * u), f = t - (r[1] + o * u), p = n - (r[2] + s * u);
	return d * d + f * f + p * p;
}
function Nn(e, t) {
	let n = [], r = /* @__PURE__ */ new Set();
	for (let i = 0; i < t; i++) {
		let t = -1;
		for (let n = 0; n < e.length; n++) !r.has(n) && (t < 0 || e[n] > e[t]) && (t = n);
		if (t < 0 || e[t] <= 0) break;
		r.add(t), n.push(t);
	}
	return n;
}
function Pn({ positions: e, meshMatrix: t, segments: n, maxInfluences: r = ln, maxDistance: i, softness: a }) {
	let o = e.length / 3, s = new Uint16Array(o * 4), c = new Float32Array(o * 4), l = new Float64Array(n.length), u = new Float64Array(n.length), d = new Float64Array(n.length), f = P(), p = [];
	for (let m = 0; m < o; m++) {
		we(f, [
			e[m * 3],
			e[m * 3 + 1],
			e[m * 3 + 2]
		], t);
		let o = Infinity;
		n.forEach((e, t) => {
			d[t] = Math.sqrt(Mn(f[0], f[1], f[2], e.head, e.tail)), o = Math.min(o, d[t]);
		}), o > i && p.push(m);
		for (let e = 0; e < n.length; e++) u[e] = ((o + a) / (d[e] + a)) ** un;
		let h = Nn(u, r), g = h.reduce((e, t) => e + u[t], 0);
		h.forEach((e, t) => {
			s[m * 4 + t] = e, c[m * 4 + t] = u[e] / g, l[e] += u[e] / g;
		});
	}
	return {
		indices: s,
		weights: c,
		unweighted: p,
		boneTotals: l
	};
}
function Fn(e, t) {
	return {
		maxInfluences: e.maxInfluences ?? ln,
		maxDistance: e.maxDistance ?? t * fn,
		softness: t * dn
	};
}
function In(e, t) {
	let n = kn(e);
	return e.bones.map((e, r) => ({
		head: Array.from(we(P(), e.head, t)),
		tail: Array.from(we(P(), n[r], t))
	}));
}
function Ln(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let { head: r, tail: i } of e) for (let e of [r, i]) e.forEach((e, r) => {
		t[r] = Math.min(t[r], e), n[r] = Math.max(n[r], e);
	});
	return Math.max(...n.map((e, n) => e - t[n]), 1e-6);
}
function Rn(e, t, n) {
	let r = e.bones.length, i = Oe(r), o = new Float32Array(r * 16);
	return t.forEach((e, t) => o.set(s(a(), e), t * 16)), Object.assign(i, {
		joints: e.bones.map((t) => ({
			name: En(e, t.name),
			parent: t.parent === null ? -1 : e.bones.findIndex((e) => e.name === t.parent)
		})),
		inverseBindMatrices: o,
		bindMatrix: Float32Array.from(n),
		jointWorldMatrices: new Float32Array(r * 16)
	});
}
function zn({ recipe: e, graph: t, geometryRecords: n, cache: r }) {
	let i = /* @__PURE__ */ new Map();
	for (let a of e.nodes.filter((e) => e.skin)) {
		let o = e.armatures?.find((e) => e.id === a.skin.armature);
		if (!o) throw RangeError(`Node ${a.id} skin names armature ${a.skin.armature}, which is not in armatures.`);
		let s = n.get(a.geometry), c = t.getNode(a.id).worldMatrix, l = o.bones.map((e) => En(o, e.name)), u = l.map((e) => t.getNode(e).worldMatrix), d = JSON.stringify([
			s.signature,
			o,
			a.skin,
			Array.from(c),
			u.map((e) => Array.from(e))
		]), f = r.get(a.id);
		if (f?.key === d) {
			i.set(a.id, f);
			continue;
		}
		let p = In(o, t.getNode(o.id).worldMatrix), m = Ln(p), h = Pn({
			positions: s.geometry.positions,
			meshMatrix: c,
			segments: p,
			...Fn(a.skin, m)
		}), g = Object.freeze({
			...s.geometry,
			skinIndices: h.indices,
			skinWeights: h.weights
		}), _ = {
			node: a.id,
			armature: o.id,
			vertices: s.geometry.positions.length / 3,
			unweightedVertices: h.unweighted.length,
			boneWeight: h.boneTotals
		}, v = {
			key: d,
			geometry: g,
			skin: Rn(o, u, c),
			armature: o,
			boneIds: l,
			report: _
		};
		r.set(a.id, v), i.set(a.id, v);
	}
	return i;
}
function Bn(e, t) {
	for (let { binding: n, scratch: r, jointWorlds: i, meshNodeId: a } of e) n.boneIds.forEach((e, n) => i.set(t.getNode(e).worldMatrix, n * 16)), De(r, i, n.skin.inverseBindMatrices, t.getNode(a).worldMatrix, n.skin.bindMatrix);
}
function Vn(e) {
	for (let { binding: t, scratch: n, jointWorlds: r } of e) t.skin.jointMatrices.set(n.jointMatrices), t.skin.jointWorldMatrices.set(r);
}
function Hn(e) {
	return [...e].map(([e, t]) => ({
		meshNodeId: e,
		binding: t,
		scratch: Oe(t.boneIds.length),
		jointWorlds: new Float32Array(t.boneIds.length * 16)
	}));
}
function Un(e, t, n, r, i) {
	let a = new Map(e.bones.map((e, n) => [e.name, {
		bone: e,
		tail: t[n]
	}])), o = a.get(n), s = a.get(r), c = a.get(o.bone.parent), l = Te(P(), s.bone.head, c.bone.head), u = Te(P(), o.bone.head, c.bone.head), d = xe(l);
	if (d < mn) return null;
	let f = Se(P(), l, be(u, l) / (d * d)), p = Te(P(), u, f);
	if (xe(p) / d < pn) return {
		bone: n,
		problem: "straight-chain",
		detail: `${c.bone.name}, ${n} and ${r} are collinear at rest, so a two-bone solve has no bend direction unless it gets a pole.`
	};
	let m = be(p, gn);
	return (i ? m < 0 : m > 0) ? {
		bone: n,
		problem: i ? "knee-bends-backward" : "elbow-bends-forward",
		detail: `${n} sits ${i ? "behind" : "in front of"} the line from ${c.bone.name} to ${r} on a character facing +Z, so a poleless solve folds the joint the wrong way.`
	} : null;
}
function Wn(e) {
	let t = kn(e), n = [];
	e.bones.forEach((e, r) => {
		Ce(e.head, t[r]) < mn && n.push({
			bone: e.name,
			problem: "zero-length",
			detail: `${e.name} has its tail at its head.`
		});
	});
	for (let r of e.bones) {
		let i = e.bones.find((e) => e.parent === r.name);
		if (!i || r.parent === null) continue;
		let a = /LowerLeg$/.test(r.name) && !/Front/.test(r.name), o = /LowerArm$/.test(r.name) || /FrontLowerLeg$/.test(r.name);
		if (!a && !o) continue;
		let s = Un(e, t, r.name, i.name, a);
		s && n.push(s);
	}
	return n;
}
function Gn(e, t) {
	return e.armatures.map((e) => {
		let n = [...t.values()].filter((t) => t.armature.id === e.id), r = e.bones.map((e, t) => n.reduce((e, n) => e + n.report.boneWeight[t], 0));
		return {
			id: e.id,
			bones: e.bones.length,
			skinned: n.map((e) => ({
				node: e.report.node,
				vertices: e.report.vertices,
				unweightedVertices: e.report.unweightedVertices
			})),
			bonesWithNoVertices: n.length ? e.bones.filter((e, t) => r[t] < .001).map((e) => e.name) : [],
			jointAxisProblems: Wn(e)
		};
	});
}
function Kn(e, t, n) {
	let r = Math.max(1, Math.ceil(t * n)), i = /* @__PURE__ */ new Map();
	for (let a = 0; a <= r; a++) {
		let r = Math.min(t, a / n);
		for (let [t, n] of e.sample(r).nodes) for (let e of ["rotation", "translation"]) {
			if (!n[e]) continue;
			let a = `${t}\u0000${e}`;
			i.has(a) || i.set(a, {
				target: t,
				property: e,
				interpolation: "LINEAR",
				keyframes: []
			}), i.get(a).keyframes.push({
				time: r,
				value: Array.from(n[e])
			});
		}
	}
	return [...i.values()];
}
function qn(t, n, i, { frameRate: a = 30 } = {}) {
	let o = t.nodes.filter((e) => Object.hasOwn(e, "armature")).map((i) => {
		let a = t.armatures.some((e) => e.id === i.id), o = a ? n.getNode(i.id).worldMatrix : null;
		return {
			id: i.id,
			name: i.id,
			meshIds: [],
			parent: a ? null : i.parent,
			translation: o ? Array.from(e(P(), o)) : i.translation,
			rotation: o ? Array.from(r([
				0,
				0,
				0,
				1
			], o)) : i.rotation,
			scale: o ? Array.from(u(P(), o)) : i.scale
		};
	}), s = new Set(o.map((e) => e.id)), c = i ? Kn(i, t.motion.duration, a).filter((e) => s.has(e.target)) : [], l = c.length ? {
		...Ee({
			duration: t.motion.duration,
			loop: t.motion.loop,
			tracks: c
		}),
		name: "motion"
	} : null;
	return {
		nodes: o,
		clips: l ? [l] : []
	};
}
// src/agent-apply-report.js
var Jn = Object.freeze({
	maxEntries: 20,
	maxDiffIds: 8,
	maxText: 48
}), Yn = Object.freeze({
	node: "nodes",
	material: "materials",
	geometry: "geometries"
}), Xn = Object.freeze({
	"set-environment": "environment",
	"set-effects": "effects",
	"set-shadow": "shadow"
}), Zn = Object.freeze({
	"set-motion": "motion",
	"set-physics": "physics",
	"set-timeline": "timeline",
	"set-cloth": "cloth",
	"set-bake": "bake",
	"set-particles": "particles",
	"set-post-passes": "postPasses",
	"set-armatures": "armatures"
});
function G(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function K(e, t) {
	if (e === t) return !0;
	if (Array.isArray(e) && Array.isArray(t)) return e.length === t.length && e.every((e, n) => K(e, t[n]));
	if (G(e) && G(t)) {
		let n = Object.keys(e);
		return n.length === Object.keys(t).length && n.every((n) => Object.hasOwn(t, n) && K(e[n], t[n]));
	}
	return !1;
}
function Qn(e, t) {
	return !G(t) || !G(e) ? K(e, t) : Object.keys(t).every((n) => Qn(e[n], t[n]));
}
function $n(e, t) {
	if (!G(t) || !G(e)) return structuredClone(t);
	let n = { ...e };
	for (let r of Object.keys(t)) n[r] = $n(e[r], t[r]);
	return n;
}
function er(e, t) {
	return Object.keys(e).filter((e) => !t.includes(e));
}
function tr(e, t) {
	let n = e.join(", ");
	return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function nr(e) {
	let t = e.id ?? e.geometry;
	if (typeof t == "string") return t;
	for (let t of [
		"node",
		"material",
		"geometry"
	]) if (typeof e[t]?.id == "string") return e[t].id;
	return Object.hasOwn(Xn, e.type) ? Xn[e.type] : e.type === "set-camera" ? "camera" : void 0;
}
function rr(e, t, n) {
	let { type: r } = t, i = /^add-(node|material|geometry)$/.exec(r);
	if (i) {
		let [, n] = i;
		return e[Yn[n]].push(structuredClone(t[n])), { changed: `added ${n}` };
	}
	let a = /^remove-(node|material|geometry)$/.exec(r);
	if (a) {
		let [, n] = a, r = e[Yn[n]], i = r.findIndex((e) => e.id === t.id);
		return i >= 0 && r.splice(i, 1), { changed: `removed ${n}` };
	}
	let o = Xn[r] ?? (r === "set-camera" ? "camera" : null);
	if (o) {
		let i = r === "set-camera" ? Object.fromEntries(er(t, ["type"]).map((e) => [e, t[e]])) : t[o];
		if (Qn(e[o], i)) return { warning: "no change, values already set" };
		let a = Object.keys(i).filter((t) => !Qn(e[o]?.[t], i[t]));
		return e[o] = $n(e[o] ?? {}, i), { changed: tr(a, n) };
	}
	if (r === "set-node" || r === "set-material") {
		let i = e[r === "set-node" ? "nodes" : "materials"].find((e) => e.id === t.id), a = er(t, ["type", "id"]);
		if (!i) return { changed: tr(a, n) };
		let o = a.filter((e) => !K(i[e], t[e]));
		if (o.length === 0) return { warning: "no change, values already set" };
		for (let e of o) i[e] = structuredClone(t[e]);
		return { changed: tr(o, n) };
	}
	if (Object.hasOwn(Zn, r)) {
		let n = Zn[r], i = t[n] === null ? void 0 : t[n];
		return K(e[n], i) ? { warning: "no change, section already set" } : (i === void 0 ? delete e[n] : e[n] = structuredClone(i), { changed: t[n] === null ? `cleared ${n}` : `set ${n}` });
	}
	if (r === "edit-mesh") {
		let e = Array.isArray(t.edits) ? t.edits.length : 0;
		return e === 0 && !t.replace ? { warning: "no change, no edits given" } : { changed: `${t.replace ? "replaced the log with" : "appended"} ${e} edit${e === 1 ? "" : "s"}` };
	}
	return { changed: tr(er(t, ["type", "id"]), n) || "applied" };
}
function ir(e, t, n) {
	let r = new Map(e.map((e) => [e.id, e])), i = new Set(t.map((e) => e.id)), a = t.filter((e) => !r.has(e.id)).map((e) => e.id), o = e.filter((e) => !i.has(e.id)).map((e) => e.id), s = t.filter((e) => r.has(e.id) && !K(r.get(e.id), e)).map((e) => e.id), c = {};
	for (let [e, t] of [
		["added", a],
		["removed", o],
		["changed", s]
	]) t.length > 0 && (c[e] = t.length > n ? [...t.slice(0, n), `+${t.length - n} more`] : t);
	return c;
}
function ar(e, t, n, r = Jn) {
	let i = structuredClone(e);
	for (let e of Object.values(Yn)) i[e] ??= [];
	let a = n.map((e, t) => {
		let n = rr(i, e, r.maxText), a = nr(e);
		return {
			i: t,
			op: e.type,
			...a === void 0 ? {} : { target: a },
			...n
		};
	}), o = a.slice(r.maxEntries), s = o.filter((e) => e.warning).length, c = {};
	for (let n of Object.values(Yn)) {
		let i = ir(e[n] ?? [], t[n] ?? [], r.maxDiffIds);
		Object.keys(i).length > 0 && (c[n] = i);
	}
	return {
		results: a.slice(0, r.maxEntries),
		...o.length > 0 ? { omittedResults: o.length } : {},
		...s > 0 ? { omittedWarnings: s } : {},
		diff: c
	};
}
// src/agent-scene.js
var or = oe, sr = 16, cr = Object.freeze({
	eye: [
		4,
		3,
		5
	],
	target: [
		0,
		0,
		0
	],
	up: [
		0,
		1,
		0
	],
	fov: 45,
	near: .1,
	far: 1e3
}), lr = [
	"visible",
	"castShadow",
	"receiveShadow",
	"holdout",
	"shadowCatcher"
], ur = lr.slice(1), dr = [
	"translation",
	"rotation",
	"scale",
	"parent",
	"label",
	"geometry",
	"material",
	"skin",
	"relations",
	"asset",
	"vegetation",
	"decal",
	"depthLayer",
	"blend",
	...lr
], fr = [
	"color",
	"metallic",
	"roughness",
	"emission",
	"emissiveColor",
	"opacity",
	"alphaMode",
	"doubleSided",
	"pattern",
	"map",
	"subsurface",
	"snippet",
	"waterPreset",
	"absorption",
	"turbidity",
	...ge
], pr = [
	"map",
	"normalMap",
	"metallicRoughnessMap",
	"emissiveMap",
	"layerMaps",
	"transmissionMap",
	"boxMapScale",
	"boxMapAxis"
], mr = [...Object.keys(cr), ...w], hr = Object.freeze({
	"set-environment": "environment",
	"set-effects": "effects",
	"set-shadow": "shadow"
}), gr = Object.freeze({
	"set-motion": "motion",
	"set-physics": "physics",
	"set-timeline": "timeline",
	"set-cloth": "cloth",
	"set-bake": "bake",
	"set-particles": "particles",
	"set-post-passes": "postPasses",
	"set-armatures": "armatures"
}), _r = Object.freeze({
	"add-geometry": ["geometries", "geometry"],
	"add-material": ["materials", "material"],
	"add-node": ["nodes", "node"]
}), vr = Object.freeze({
	"remove-geometry": "geometries",
	"remove-material": "materials"
});
function q(e, t, n) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${n} must be an object.`);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`Unknown ${n} field: ${r}. Allowed fields: ${t.join(", ")}.`);
}
function yr(e) {
	q(e, Object.keys(or), "limits");
	let t = {
		...or,
		...e
	};
	for (let [e, n] of Object.entries(t)) if (!Number.isSafeInteger(n) || n <= 0) throw RangeError(`${e} must be a positive safe integer.`);
	if (t.maxNodes > 4096) throw RangeError("maxNodes cannot exceed 4096.");
	return Object.freeze(t);
}
function br(e, t) {
	let n = 0, r = /* @__PURE__ */ new Set(), i = new TextEncoder();
	function a(e) {
		if (n += e, n > t) throw RangeError("JSON exceeds maxRecipeBytes. Reduce the input.");
	}
	function o(e, n) {
		if (n > 64) throw RangeError("JSON nesting exceeds 64 levels.");
		if (e === null || typeof e == "boolean") return a(e === null ? 4 : String(e).length), e;
		if (typeof e == "number" && Number.isFinite(e)) return a(String(e).length), e;
		if (typeof e == "string") {
			if (e.length > t) throw RangeError("JSON exceeds maxRecipeBytes.");
			return a(i.encode(JSON.stringify(e)).length), e;
		}
		if (!e || typeof e != "object" || r.has(e)) throw TypeError("Recipe must contain finite, acyclic JSON data.");
		let s = Array.isArray(e);
		if (s && e.length > t) throw RangeError("JSON exceeds maxRecipeBytes.");
		if (!s && Object.getPrototypeOf(e) !== Object.prototype && Object.getPrototypeOf(e) !== null) throw TypeError("Recipe objects must be plain JSON objects.");
		r.add(e), a(2);
		let c = s ? [] : {}, l = Reflect.ownKeys(e);
		for (let t of l) {
			if (s && t === "length") continue;
			if (typeof t != "string" || t === "__proto__") throw TypeError("Invalid JSON key.");
			let r = Object.getOwnPropertyDescriptor(e, t);
			if (!r.enumerable || !Object.hasOwn(r, "value")) throw TypeError("JSON accessors and hidden fields are unsupported.");
			if (s && t !== String(c.length)) throw TypeError("JSON arrays must be dense without extra fields.");
			a(s ? 1 : i.encode(JSON.stringify(t)).length + 2), c[t] = o(r.value, n + 1);
		}
		if (s && c.length !== e.length) throw TypeError("JSON arrays must be dense without trailing holes.");
		return r.delete(e), c;
	}
	let s = o(e, 0);
	if (i.encode(JSON.stringify(s)).length > t) throw RangeError("JSON exceeds maxRecipeBytes.");
	return s;
}
function J(e, t) {
	if (!Number.isFinite(e) || !Number.isFinite(Math.fround(e))) throw S(t, e, "a finite number that fits Float32, such as 0.5", TypeError);
	return e;
}
function Y(e, t, n) {
	if (!Array.isArray(e) || e.length !== t) {
		let r = `[${Array.from({ length: t }, (e, n) => +(n === t - 1 && t === 4)).join(", ")}]`;
		throw S(n, e, `an array of ${t} numbers, such as ${r}`, TypeError);
	}
	return e.map((e, t) => J(e, `${n}[${t}]`));
}
function X(e, t) {
	return e === void 0 ? t : e;
}
function xr(e, t, n, r) {
	if (!Number.isInteger(e) || e < t || e > n) throw S(r, e, `a whole number from ${t} to ${n}, such as ${t}`);
	return e;
}
function Z(e, t = "id") {
	if (typeof e != "string" || !e.trim() || e.length > 128) throw S(t, e, "a string of 1 to 128 characters, such as \"wall-left\"", TypeError);
	return e;
}
function Sr(e, t, n, r) {
	if (!Array.isArray(e) || e.length > t) throw RangeError(`${n} exceeds its resource limit of ${t} or is not an array. Pass "${n}": [] for none, or remove some.`);
	let i = /* @__PURE__ */ new Set();
	return e.map((e, t) => x(`${n}[${t}]`, () => {
		if (Z(e?.id), i.has(e.id)) throw RangeError(`Duplicate ${n} ID: ${e.id}. IDs must be unique: rename one, or remove the other.`);
		return i.add(e.id), r(e);
	}));
}
function Cr(e, t) {
	for (let n of ge) e[n] !== void 0 && (t[n] = Array.isArray(e[n]) ? Y(e[n], 3, n) : e[n]);
	_e(t), e.subsurface !== void 0 && (t.subsurface = L("subsurfaceShader").copySubsurface(e.subsurface, t.tag)), e.snippet && (t.snippet = L("materialSnippet").normalizeMaterialSnippet(e.snippet, { hasMap: !!(e.map || e.pattern) })), (t.anisotropy > 0 || t.iridescence > 0) && L("layerShaders"), t.toon > 0 && L("lineArt");
}
function wr(e) {
	q(e, [
		"id",
		"tag",
		...fr
	], "material");
	let t = e.pattern === void 0 ? [
		.5,
		.5,
		.5
	] : [
		1,
		1,
		1
	], n = e.pattern?.type === "graph" ? e.pattern.graph : {}, r = (e, t) => Object.hasOwn(n ?? {}, e) ? 1 : t, i = {
		id: e.id,
		tag: X(e.tag, "surface"),
		color: Y(X(e.color, t), 3, "color"),
		...r("clearcoat", 0) && { clearcoat: 1 },
		...r("transmission", 0) && { transmission: 1 },
		metallic: X(e.metallic, r("metallic", 0)),
		roughness: X(e.roughness, r("roughness", .5)),
		emission: X(e.emission, r("emission", 0))
	};
	if (!M.materialTags.includes(i.tag)) throw RangeError(`Material tag must be one of ${M.materialTags.join(", ")}.`);
	if (e.map !== void 0 && L("assets").applyMapSequence(e, i), e.pattern !== void 0) {
		if (i.tag !== "surface") throw RangeError("Material pattern needs the surface tag.");
		i.pattern = L("patterns").normalizeMaterialPattern(e.pattern);
	}
	if (i.opacity = X(e.opacity, 1), J(i.opacity, "opacity"), i.opacity < 0 || i.opacity > 1) throw S("opacity", i.opacity, "a number from 0 to 1, such as 0.5");
	let a = X(e.alphaMode, "opaque");
	if (!ae.includes(a)) throw S("alphaMode", a, `one of ${ae.join(", ")}`);
	let o = r("opacity", 0);
	if (i.alphaMode = (i.opacity < 1 || o) && a === "opaque" ? "blend" : a, i.doubleSided = X(e.doubleSided, !1), typeof i.doubleSided != "boolean") throw S("doubleSided", i.doubleSided, "true or false", TypeError);
	for (let e of ["metallic", "roughness"]) if (J(i[e], e), i[e] < 0 || i[e] > 1) throw S(e, i[e], "a number from 0 to 1, such as 0.5");
	if (J(i.emission, "emission"), i.emission < 0) throw S("emission", i.emission, "a number of 0 or more, such as 1");
	if (i.color.some((e) => e < 0 || e > 1)) throw S("color", i.color, "three numbers from 0 to 1, such as [0.8, 0.2, 0.1]");
	if (e.emissiveColor !== void 0 && (i.emissiveColor = Y(e.emissiveColor, 3, "emissiveColor"), i.emissiveColor.some((e) => e < 0))) throw S("emissiveColor", i.emissiveColor, "three numbers of 0 or more, such as [1, 0.5, 0.2]");
	Cr(e, i), nt("worldMaterials") && L("worldMaterials").copyWaterFields(e, i, Y);
	let s = i.emissiveColor ?? i.color;
	for (let e of s) {
		let t = Math.fround(e) * Math.fround(i.emission);
		if (!Number.isFinite(Math.fround(t))) throw RangeError("Emissive radiance exceeds Float32 range.");
		if (i.tag === "unlit" && t > 65500) throw RangeError("Unlit emissive radiance exceeds the half-float HDR target range.");
	}
	return i;
}
function Tr(e) {
	q(e, [
		"id",
		"geometry",
		"material",
		...dr
	], "node");
	let t = {
		...e,
		parent: e.parent ?? null,
		translation: Y(X(e.translation, [
			0,
			0,
			0
		]), 3, "translation"),
		rotation: Y(X(e.rotation, [
			0,
			0,
			0,
			1
		]), 4, "rotation"),
		scale: Y(X(e.scale, [
			1,
			1,
			1
		]), 3, "scale")
	};
	if (t.parent !== null && Z(t.parent, "parent"), t.label !== void 0 && (typeof t.label != "string" || t.label.length > 256)) throw S("label", t.label, "a string of at most 256 characters, such as \"left wall\"", TypeError);
	if (t.scale.some((e) => e <= 0 || Math.fround(e) <= 0)) throw S("scale", t.scale, "three positive numbers, such as [1, 1, 1]");
	let n = Math.hypot(...t.rotation);
	if (n === 0) throw S("rotation", t.rotation, "a nonzero quaternion [x, y, z, w], such as [0, 0, 0, 1] for no rotation");
	if (t.rotation = t.rotation.map((e) => e / n), e.geometry !== void 0 != (e.material !== void 0)) throw TypeError(`Node ${e.id}: set both geometry and material, or neither for a group node. Name a geometry to draw it, or drop material to make it a group.`);
	if (e.geometry !== void 0 && (Z(e.geometry), Z(e.material)), e.asset !== void 0) {
		if (e.geometry !== void 0 || e.skin !== void 0) throw TypeError(`Node ${e.id}: an asset node is a group; drop geometry, material and skin.`);
		t.asset = L("assets").normalizeAssetPlacement(e.asset);
	}
	if (e.vegetation !== void 0 && (t.vegetation = L("vegetation").normalizeVegetation(e.vegetation, e)), e.decal !== void 0 && typeof e.decal != "boolean") throw TypeError("decal must be boolean.");
	e.depthLayer !== void 0 && xr(e.depthLayer, 0, 4, "depthLayer");
	for (let t of lr) {
		if (e[t] !== void 0 && typeof e[t] != "boolean") throw TypeError(`${t} must be boolean.`);
		if (t !== "visible" && e[t] !== void 0 && e.geometry === void 0) throw TypeError(`Node ${e.id}: ${t} belongs on a mesh node.`);
	}
	if (e.holdout === !0 && e.shadowCatcher === !0) throw TypeError(`Node ${e.id}: a node is a holdout or a shadow catcher, not both.`);
	if (e.skin !== void 0) {
		if (e.geometry === void 0) throw TypeError("Only mesh nodes can have a skin.");
		if (q(e.skin, [
			"armature",
			"maxInfluences",
			"maxDistance"
		], "skin"), Z(e.skin.armature), e.skin.maxInfluences !== void 0 && xr(e.skin.maxInfluences, 1, 4, "skin maxInfluences"), e.skin.maxDistance !== void 0 && !(Number.isFinite(e.skin.maxDistance) && e.skin.maxDistance > 0)) throw RangeError("skin maxDistance must be a positive number of metres.");
	}
	return t;
}
function Er(e, t) {
	Dr(t);
	for (let n of mr) Object.hasOwn(t, n) && (e[n] = t[n]);
	return Object.hasOwn(t, "focalLength") && delete e.fov, t.projection === "perspective" && !Object.hasOwn(t, "orthoScale") && delete e.orthoScale, Object.hasOwn(t, "fov") && (delete e.focalLength, delete e.sensorWidth), e;
}
function Dr(e) {
	if (e.fov !== void 0 && e.focalLength !== void 0) throw RangeError("Give a camera fov or a focalLength, not both. Use focalLength (with sensorWidth) for a lens in millimetres, fov for degrees.");
}
function Or(e) {
	if (e.projection !== void 0 && e.projection !== "perspective" && e.projection !== "orthographic") throw S("camera.projection", e.projection, "perspective or orthographic");
	let t = e.projection === "orthographic";
	if (e.orthoScale !== void 0) {
		if (!t) throw RangeError("Camera orthoScale needs projection orthographic.");
		if (!Number.isFinite(e.orthoScale) || e.orthoScale <= 0) throw S("camera.orthoScale", e.orthoScale, "a positive view height in metres, such as 10");
	}
	if (e.sensorWidth !== void 0 && e.focalLength === void 0) throw RangeError("Camera sensorWidth needs focalLength.");
	if (e.focalLength !== void 0) {
		if (t) throw RangeError("Camera focalLength needs a perspective projection; an orthographic camera is sized by orthoScale.");
		if (!Number.isFinite(e.focalLength) || e.focalLength <= 0 || e.focalLength > 1e4) throw S("camera.focalLength", e.focalLength, "a lens length above 0 and up to 10000 millimetres, such as 35");
		if (e.sensorWidth !== void 0 && !(Number.isFinite(e.sensorWidth) && e.sensorWidth > 0 && e.sensorWidth <= 1e3)) throw S("camera.sensorWidth", e.sensorWidth, "a width above 0 and up to 1000 millimetres, such as 36");
	}
	if (e.shift !== void 0 && te(e.shift), e.fStop !== void 0 && !(Number.isFinite(e.fStop) && e.fStop >= .7 && e.fStop <= 64)) throw S("camera.fStop", e.fStop, "a number from 0.7 to 64, such as 2.8 (smaller numbers blur more)");
}
function kr(e = {}) {
	q(e, mr, "camera"), Dr(e);
	let t = {
		...cr,
		...e
	};
	t.focalLength !== void 0 && delete t.fov, Or(t), t.eye = Y(t.eye, 3, "camera.eye"), t.target = Y(t.target, 3, "camera.target"), t.up = Y(t.up, 3, "camera.up");
	let n = Math.hypot(...t.up);
	if (n === 0) throw S("camera.up", t.up, "a nonzero direction, such as [0, 1, 0]");
	t.up = t.up.map((e) => e / n);
	for (let e of [
		"fov",
		"near",
		"far"
	]) t[e] !== void 0 && J(t[e], `camera.${e}`);
	if (t.fov !== void 0 && (Math.fround(t.fov) <= 0 || Math.fround(t.fov) >= 180) || Math.fround(t.near) <= 0 || Math.fround(t.far) <= Math.fround(t.near)) throw t.fov !== void 0 && (Math.fround(t.fov) <= 0 || Math.fround(t.fov) >= 180) ? S("camera.fov", t.fov, "degrees above 0 and below 180, such as 50") : S("camera.near", [t.near, t.far], "near above 0 and far above near, such as near 0.1 and far 100");
	if (t.eye.every((e, n) => Math.fround(e) === Math.fround(t.target[n]))) throw S("camera.target", t.target, `a point different from eye ${JSON.stringify(t.eye)}, such as [0, 0, 0]`);
	let r = t.target.map((e, n) => e - t.eye[n]), o = Math.hypot(...r), s = r.map((e) => e / o), l = Math.hypot(s[1] * t.up[2] - s[2] * t.up[1], s[2] * t.up[0] - s[0] * t.up[2], s[0] * t.up[1] - s[1] * t.up[0]);
	if (Math.fround(l) === 0) throw RangeError("Camera up must not be collinear with the view direction.");
	let u = i(a(), t.eye, t.target, t.up), d = C(a(), t, 1);
	for (let e of [u, d]) {
		let t = c(e);
		if (!e.every(Number.isFinite) || !Number.isFinite(t) || t === 0) throw RangeError("Camera matrices must remain finite and nonsingular at Float32 precision.");
	}
	return t;
}
var Ar = {
	box: ["bevel", "subdivisions"],
	cylinder: [
		"segments",
		"bevel",
		"bevelSegments"
	],
	sphere: ["segments", "rings"],
	grid: ["segments"],
	plane: ["segments"],
	cone: [
		"radiusTop",
		"radiusBottom",
		"segments"
	],
	icoSphere: ["subdivisions"],
	circle: ["segments", "innerRadius"],
	line: [
		"from",
		"to",
		"radius",
		"radialSegments"
	],
	torus: [
		"tubeRadius",
		"segments",
		"sides",
		"arc",
		"start"
	],
	lathe: [
		"profile",
		"segments",
		"startAngle",
		"sweep"
	],
	extrude: [
		"contour",
		"holes",
		"depth",
		"steps",
		"bevel",
		"bevelThickness",
		"bevelSegments"
	],
	tube: [
		"path",
		"radius",
		"segments",
		"radialSegments",
		"closed"
	],
	curve: [
		"points",
		"closed",
		"radius",
		"taper",
		"profile",
		"resolution",
		"radialSegments"
	],
	text: [
		"text",
		"size",
		"depth",
		"font",
		"align",
		"curveSegments"
	],
	mesh: [
		"base",
		"edits",
		"stack",
		"smoothAngle",
		"shapeKeys"
	],
	terrain: [
		"size",
		"resolution",
		"seed",
		"amplitude",
		"holes"
	]
};
function jr(e) {
	let t = [e.from, e.to];
	for (let e of t) Y(e, 3, "line end");
	if (t[0].every((e, n) => e === t[1][n])) throw RangeError("A line needs two distinct end points.");
	return t;
}
function Mr(e) {
	if (!Object.hasOwn(Ar, e.type)) throw TypeError(`Unsupported geometry type: ${e.type}. Use one of ${Object.keys(Ar).join(", ")}.`);
	q(e, [
		"id",
		"type",
		...Ar[e.type]
	], "geometry");
	function t(t, n, r, i) {
		return xr(e[t] ?? n, r, i, t);
	}
	function n(e, t, n) {
		if (!Array.isArray(e) || e.length < n || e.length > 4096) throw RangeError("Geometry point count exceeds its limit.");
		for (let n of e) Y(n, t, "geometry point");
		return e.length;
	}
	for (let t of Ar[e.type]) e[t] !== void 0 && ![
		"profile",
		"contour",
		"holes",
		"path",
		"closed",
		"base",
		"edits",
		"stack",
		"shapeKeys",
		"points",
		"taper",
		"text",
		"font",
		"align",
		"from",
		"to"
	].includes(t) && J(e[t], t);
	switch (e.type) {
		case "box": return e.bevel === 0 ? 24 : 6 * (2 * t("subdivisions", 6, 1, 128) + 2) ** 2;
		case "cylinder": return (t("segments", 80, 3, 2048) + 1) * 2 * (t("bevelSegments", 6, 1, 128) + 1) + 2 * ((e.segments ?? 80) + 2);
		case "sphere": return (t("segments", 64, 3, 2048) + 1) * (t("rings", 40, 2, 2048) + 1);
		case "grid":
		case "plane": return (t("segments", 16, 1, 64) + 1) ** 2;
		case "cone": return (t("segments", 64, 3, 2048) + 1) * 2 + 2 * ((e.segments ?? 64) + 2);
		case "icoSphere": return 10 * 4 ** t("subdivisions", 2, 0, 7) + 2;
		case "circle": return e.innerRadius > 0 ? (t("segments", 64, 3, 2048) + 1) * 2 : t("segments", 64, 3, 2048) + 2;
		case "line": {
			let n = t("radialSegments", 8, 3, 128);
			return jr(e), 2 * n * 2 + 2 * (n + 1);
		}
		case "torus": return (t("segments", 96, 3, 2048) + 1) * (t("sides", 24, 3, 128) + 1) + 2 * ((e.sides ?? 24) + 2);
		case "lathe": return (t("segments", 64, 3, 2048) + 1) * n(e.profile, 2, 2);
		case "tube":
			if (n(e.path, 3, e.closed ? 3 : 2), e.closed !== void 0 && typeof e.closed != "boolean") throw TypeError("closed must be boolean.");
			return (t("segments", 64, 3, 2048) + 1) * (t("radialSegments", 12, 3, 128) + 1);
		case "curve": {
			let r = e.points;
			if (!Array.isArray(r) || r.length < 2 || r.length > j.maxCurvePoints) throw RangeError("Geometry point count exceeds its limit.");
			let i = e.profile === void 0 ? t("radialSegments", 8, 3, 128) : n(e.profile, 2, 3);
			return ((e.closed ? r.length : r.length - 1) * t("resolution", 12, 1, 64) + 1) * i * 2 + 2 * (i + 1);
		}
		case "text":
			if (typeof e.text != "string") throw TypeError("text must be a string.");
			return [...e.text].filter((e) => !/\s/.test(e)).length * (e.font === void 0 || e.font === "default" ? j.verticesPerCharacterSegment : j.verticesPerCustomCharacterSegment) * t("curveSegments", 4, 1, 16);
		case "terrain": return L("terrain").terrainVertexEstimate(e);
		case "extrude": {
			let r = e.holes ?? [];
			if (!Array.isArray(r) || r.length > 128) throw RangeError("holes must contain at most 128 rings.");
			let i = n(e.contour, 2, 3) + r.reduce((e, t) => e + n(t, 2, 3), 0);
			if (i > 4096) throw RangeError("Extrude exceeds 4096 input points.");
			let a = (e.bevel ?? 0) > 0 || (e.bevelThickness ?? e.bevel ?? 0) > 0;
			return 6 * (i + r.length * 2 - 2) + 6 * i * (t("steps", 1, 1, 256) + (a ? t("bevelSegments", 3, 1, 32) * 2 : 0));
		}
		case "mesh": {
			let t = e.base;
			if (!t || typeof t != "object" || Array.isArray(t) || t.type === "mesh" || Object.hasOwn(t, "id")) throw TypeError("mesh base must be a primitive or profile geometry record without an id (box, cylinder, sphere, torus, lathe, extrude or tube).");
			let n = Mr({
				id: "base",
				...t
			});
			for (let t of L("mesh").normalizeMeshEdits(e.edits ?? [])) t.op === "boolean" && (n += Pr(t.cutter));
			for (let t of L("mesh").normalizeMeshStack(e.stack ?? [])) n *= t.op === "array" ? t.count : 2;
			if (e.shapeKeys !== void 0 && L("mesh").normalizeShapeKeys(e.shapeKeys), e.smoothAngle !== void 0 && (e.smoothAngle < 0 || e.smoothAngle > 180)) throw RangeError("smoothAngle is degrees from 0 to 180.");
			return n * 2;
		}
	}
}
function Nr(e) {
	return !Array.isArray(e) || e.some((e) => e && typeof e == "object" && Object.hasOwn(e, "instances"));
}
function Pr(e) {
	if (e.type === "mesh" || Object.hasOwn(e, "id")) throw TypeError("A boolean cutter must be a primitive or profile record without an id (box, cylinder, sphere, torus, lathe, extrude or tube).");
	return Mr({
		id: "cutter",
		...e
	});
}
function Fr(e, t) {
	return Pr(e), Q(e, t);
}
function Q(e, t) {
	switch (e.type) {
		case "box": return y(e.bevel, e.subdivisions);
		case "cylinder": return h(e.segments, e.bevel, e.bevelSegments);
		case "sphere": return ee(e.segments, e.rings);
		case "grid":
		case "plane": return p(e.segments);
		case "cone": return v(e.radiusTop, e.radiusBottom, e.segments);
		case "icoSphere": return _(e.subdivisions);
		case "circle": return g(e.segments, e.innerRadius);
		case "line": return L("modeling").curve(jr(e), {
			radius: e.radius,
			radialSegments: e.radialSegments,
			resolution: 1,
			maxVertices: t
		});
		case "torus": return m(e.tubeRadius, e.segments, e.sides, e.arc, e.start);
		case "lathe": return L("modeling").lathe(e.profile, {
			...e,
			maxVertices: t
		});
		case "extrude": return L("modeling").extrude(e.contour, {
			...e,
			maxVertices: t
		});
		case "tube": return L("modeling").tube(e.path, {
			...e,
			maxVertices: t
		});
		case "curve": return L("modeling").curve(e.points, {
			...e,
			maxVertices: t
		});
		case "text": return L("text").text(e.text, {
			...e,
			maxVertices: t
		});
		case "terrain": return L("terrain").generateTerrainGeometry(e, t);
		case "mesh": return L("mesh").generateMeshGeometry(() => Q(e.base, t), e.edits ?? [], {
			maxVertices: t,
			smoothAngle: e.smoothAngle ?? 30,
			stack: e.stack ?? [],
			cacheKey: JSON.stringify(e.base),
			shapeKeys: e.shapeKeys ?? [],
			resolveCutter: (e) => (Pr(e), Q(e, t))
		});
	}
}
function Ir(e, t, n, r) {
	let i = new Map(e.materials.map((e) => [e.id, e])), s = b(e.nodes.map((e) => {
		if (e.geometry !== void 0 && (!t.has(e.geometry) || !i.has(e.material))) throw RangeError(`Node ${e.id} uses ${t.has(e.geometry) ? `material ${e.material}` : `geometry ${e.geometry}`}, which does not exist. Use one of: ${(t.has(e.geometry) ? [...i.keys()] : [...t.keys()]).join(", ")}.`);
		return {
			name: e.id,
			parent: e.parent,
			matrix: e.assetPart ? l(e.assetPart.matrix) : o(a(), e.rotation, e.translation, e.scale),
			geometry: t.get(e.geometry),
			material: i.get(e.material)
		};
	}), r);
	return Lr(s, n), s;
}
function Lr(e, t) {
	let n = f();
	for (let r of e.nodes) {
		if (!d(n, r.worldMatrix) || !n.every(Number.isFinite)) throw RangeError(`Node ${r.name} normal transform exceeds Float32 range.`);
		if (r.geometry) {
			let e = t.get(r.geometry);
			for (let t = 0; t < 8; t++) {
				let n = [
					0,
					1,
					2
				].map((n) => t & 1 << n ? e.max[n] : e.min[n]);
				for (let e = 0; e < 3; e++) {
					let t = r.worldMatrix, i = Math.abs(t[e] * n[0]) + Math.abs(t[4 + e] * n[1]) + Math.abs(t[8 + e] * n[2]) + Math.abs(t[12 + e]);
					if (!Number.isFinite(Math.fround(i))) throw RangeError(`Node ${r.name} world geometry bounds exceed Float32 range.`);
				}
			}
		}
	}
}
function $(e, t) {
	let n = [
		Infinity,
		Infinity,
		Infinity
	], r = [
		-Infinity,
		-Infinity,
		-Infinity
	], i = e.positions;
	for (let e = 0; e < i.length; e += 3) for (let a = 0; a < 3; a++) {
		let o = t[a] * i[e] + t[4 + a] * i[e + 1] + t[8 + a] * i[e + 2] + t[12 + a];
		n[a] = Math.min(n[a], o), r[a] = Math.max(r[a], o);
	}
	return {
		min: n,
		max: r
	};
}
function Rr(e, t) {
	if (!Object.hasOwn(e, "armatures")) {
		for (let t of e.nodes) if (t.skin) throw RangeError(`Node ${t.id} has a skin but the recipe has no armatures.`);
		return;
	}
	let r = new Map(e.nodes.map((e) => [e.id, e]));
	e.armatures = Tn(e.armatures, { resolveBounds: (i, o) => {
		let c = r.get(o);
		if (!c?.geometry) throw RangeError(`Armature ${i.id} fit node ${JSON.stringify(String(o).slice(0, 48))} must be a mesh node.`);
		let l = $(Q(e.geometries.find((e) => e.id === c.geometry), Math.min(t.maxVertices, 1e6)), a()), u = s(a(), An(i.id, r, [i])), d = An(c.id, r);
		return jn(l, n(a(), u, d));
	} });
	let i = e.armatures.flatMap(Dn);
	for (let e of i) if (r.has(e.id)) throw RangeError(`Armature node ${e.id} collides with a node of the same ID. Give the armature a prefix.`);
	if (new Set(i.map((e) => e.id)).size !== i.length) throw RangeError("Two armatures generate the same node ID. Give one a prefix.");
	for (let t of e.nodes) if (t.skin && !e.armatures.some((e) => e.id === t.skin.armature)) throw RangeError(`Node ${t.id} skin names armature ${t.skin.armature}, which is not in armatures.`);
	e.nodes = [...i, ...e.nodes];
}
var zr = "default";
function Br(e) {
	let t = e.materials, n = (Array.isArray(e.nodes) ? e.nodes : []).filter((e) => e?.geometry !== void 0 && e.material === void 0);
	if (n.length === 0 || !Array.isArray(t)) return t;
	for (let e of n) e.material = zr;
	return t.some((e) => e?.id === zr) ? t : [...t, { id: zr }];
}
function Vr(e) {
	if (!Dt(e.environment)) return;
	let t = L("lightLinking").unknownLightLinkNames(e.environment, e.nodes);
	if (t.length > 0) throw RangeError(`Light links name nodes that do not exist (${t.slice(0, 4).join("; ")}). scene_inspect lists node IDs.`);
}
function Hr(e) {
	let t = [
		...e.pointLights,
		...e.spotLights ?? [],
		...e.areaLights ?? []
	];
	return JSON.stringify([e.keyAffects ?? null, ...t.map((e) => e.affects ?? null)]);
}
function Ur(e, t, n) {
	let r = n.get(e) ?? /* @__PURE__ */ new Map();
	if (n.set(e, r), !r.has(t)) {
		let n = {};
		for (let t of Object.keys(e)) Object.defineProperty(n, t, {
			enumerable: !0,
			get: () => e[t]
		});
		Object.defineProperty(n, "lightMask", {
			enumerable: !0,
			value: t
		}), r.set(t, Object.freeze(n));
	}
	return r.get(t);
}
function Wr(e, t) {
	let n = br(e, t.maxRecipeBytes);
	if (q(n, [
		"format",
		"schemaVersion",
		"geometries",
		"materials",
		"nodes",
		"armatures",
		"camera",
		"environment",
		"effects",
		"shadow",
		"motion",
		"physics",
		"cloth",
		"timeline",
		"particles",
		"bake",
		"postPasses"
	], "recipe"), n.format !== "67js.scene" || n.schemaVersion !== 1) throw RangeError("Expected 67js.scene schemaVersion 1.");
	n.geometries ??= [], n.materials ??= [], Array.isArray(n.geometries) && (n.geometries = n.geometries.filter((e) => e?.type !== "asset")), Array.isArray(n.materials) && (n.materials = n.materials.filter((e) => !e?.assetSource)), Array.isArray(n.nodes) && (n.nodes = n.nodes.filter((e) => !e?.assetPart)), n.geometries = Sr(n.geometries, t.maxGeometries, "geometries", (e) => {
		Mr(e);
		let t = {
			id: e.id,
			type: e.type === "plane" ? "grid" : e.type
		};
		for (let n of Ar[e.type]) Object.hasOwn(e, n) && (t[n] = e[n]);
		return t;
	}), n.materials = Sr(Br(n), t.maxMaterials, "materials", wr);
	let r = new Set(n.materials.filter((e) => e.pattern).map((e) => JSON.stringify(e.pattern)));
	if (r.size > 16) throw RangeError(`A scene holds at most 16 different material patterns; it has ${r.size}. Reuse one; tint with color.`);
	n.nodes = On(n.nodes), Nr(n.nodes) && (n.nodes = L("mesh").expandInstancedNodes(n.nodes, {
		maxNodes: t.maxNodes,
		resolveSurface: (e) => {
			let r = n.geometries.find((t) => t.id === e);
			if (!r) throw RangeError(`Instances surface geometry ${JSON.stringify(e.slice(0, 48))} is not in geometries.`);
			return Q(r, Math.min(t.maxVertices, 1e6));
		}
	})), n.nodes = Sr(n.nodes, t.maxNodes, "nodes", Tr), Rr(n, t), n.nodes.some((e) => e.relations !== void 0) && (n.nodes = L("relations").normalizeRelations(n.nodes)), n.camera = kr(n.camera);
	let i = {};
	for (let e of [
		"environment",
		"effects",
		"shadow"
	]) Object.hasOwn(n, e) && (i[e] = n[e]);
	if (Object.assign(n, Gt(i)), n.camera.fStop !== void 0 && n.effects?.depthOfField.blur > 0) throw RangeError("Camera fStop drives depth of field; set effects.depthOfField.blur to 0 or remove fStop.");
	return Vr(n), Object.hasOwn(n, "motion") && (n.motion = n.motion === null || n.motion === void 0 ? null : L("motion").normalizeAgentMotion(n.motion, n)), Object.hasOwn(n, "physics") && (n.physics = L("physics").normalizeAgentPhysics(n.physics, n)), Object.hasOwn(n, "cloth") && (n.cloth = L("cloth").normalizeAgentCloth(n.cloth, n)), Object.hasOwn(n, "timeline") && (n.timeline === null ? delete n.timeline : n.timeline = L("timeline").normalizeFilmTimeline(n.timeline, n, { checkCamera: (e) => Gr(n.camera, e) })), Object.hasOwn(n, "particles") && (n.particles = L("particles").normalizeAgentParticles(n.particles, n)), Object.hasOwn(n, "bake") && (n.bake = n.bake === null ? null : L("bake").normalizeAgentBake(n.bake)), Object.hasOwn(n, "postPasses") && (n.postPasses = L("userPass").normalizeUserPasses(n.postPasses ?? [])), n = br(n, t.maxRecipeBytes), n;
}
function Gr(e, t) {
	return kr({
		...e,
		...t
	}), structuredClone(t);
}
function Kr(e) {
	let t = 0, n = 0, r = 0;
	for (let i of e) t += i.vertices, n += i.geometryBytes, r += i.estimatedVertices * 56;
	return {
		vertices: t,
		geometryBytes: n,
		estimatedGeometryBytes: r
	};
}
function qr(e) {
	return `${e.tag}|${e.alphaMode}|${e.opacity}|${e.transmission > 0}|${e.doubleSided}|${JSON.stringify(e.pattern ?? e.map ?? null)}|${JSON.stringify(e.snippet)}`;
}
function Jr(e, t) {
	let n = {
		snapshot: e,
		sequence: t
	}, r = {};
	for (let e of ["tag", ...fr]) Object.defineProperty(r, e, {
		enumerable: !0,
		configurable: !0,
		get() {
			return n.snapshot[e];
		}
	});
	for (let e of pr) Object.defineProperty(r, e, {
		enumerable: !0,
		get() {
			return e === "map" && n.sequence ? n.sequence.descriptor : n.snapshot.pattern ? L("patterns").materialPatternTextures(n.snapshot.pattern)[e] : void 0;
		}
	});
	return {
		holder: n,
		output: Object.freeze(r)
	};
}
function Yr(e) {
	for (let t of [
		"color",
		"emissiveColor",
		"absorption"
	]) e[t] && Object.freeze(e[t]);
	return Object.freeze(e);
}
var Xr = Object.freeze({
	placements: [],
	animators: [],
	geometryParts: /* @__PURE__ */ new Map(),
	materialOutputs: /* @__PURE__ */ new Map(),
	partExtras: /* @__PURE__ */ new Map()
});
function Zr(e, t, ...n) {
	return n.find((e) => e?.output === t) ?? {
		holder: { snapshot: e },
		output: t
	};
}
function Qr(e) {
	for (let t of e) if (t.matrix.length !== 16 || t.matrix.byteLength !== 64) throw RangeError("Retained render matrices must not be detached.");
}
function $r(e) {
	let t = kr({
		eye: Array.from(e.eye),
		target: Array.from(e.target),
		up: Array.from(e.up),
		...e.focalLength === void 0 ? { fov: e.fov } : {},
		near: e.near,
		far: e.far,
		...Object.fromEntries(w.filter((t) => e[t] !== void 0).map((t) => [t, e[t]]))
	}), r = i(a(), t.eye, t.target, t.up);
	for (let e of [1 / 16, 16]) {
		let i = C(a(), t, e);
		if (![i, n(a(), i, r)].every((e) => e.every(Number.isFinite))) throw RangeError("Motion camera matrices exceed the supported Float32 aspect range.");
	}
	return t;
}
function ei(e, t) {
	let n = t === null ? null : e.motionSampler?.sample(t), r = ai(e.recipe, n), i = t === null ? null : e.physicsSampler?.sample(Math.min(t, e.physicsSampler.duration)), a = e.poseGraph ?? e.graph;
	if (e.poseGraph) {
		for (let t of e.recipe.nodes) {
			let e = n?.nodes.get(t.id), r = i?.get(t.id), s = r?.translation ?? e?.translation ?? t.translation, c = r?.rotation ?? e?.rotation ?? t.rotation, l = e?.scale ?? t.scale;
			if (Array.from(l).some((e) => !Number.isFinite(Math.fround(e)) || Math.fround(e) <= 0)) throw RangeError("Motion scale must remain positive at Float32 precision.");
			t.assetPart ? a.getNode(t.id).localMatrix.set(t.assetPart.matrix) : o(a.getNode(t.id).localMatrix, c, s, l);
		}
		a.update(), Lr(a, e.localBounds);
	}
	Bn(e.skinStages, a);
	let s = [];
	for (let t of e.recipe.materials) {
		let r = n?.materials.get(t.id), i = t;
		if (r) {
			let e = {
				...t,
				...r
			};
			for (let t of ["color", "emissiveColor"]) e[t] && (e[t] = Array.from(e[t]));
			i = Yr(wr(e));
		}
		s.push({
			holder: e.materialHandles.get(t.id).holder,
			snapshot: i
		});
	}
	let c = n?.camera ? $r(n.camera) : e.recipe.camera;
	return Qr(e.parts), {
		graph: a,
		materialUpdates: s,
		camera: c,
		time: t,
		clothGeometries: ti(e, t),
		assetClips: e.assetRuntime.animators.length ? L("assets").stageAssetClips(e.assetRuntime, a, t) : null,
		hiddenNodes: r,
		movedLook: e.motionSampler && L("motion").motionMovesLook(n) ? n : null,
		morphs: n?.morphs ?? null
	};
}
function ti(e, t) {
	if (t === null) return null;
	let n = /* @__PURE__ */ new Map();
	for (let r of [e.clothSampler, e.particleSampler]) r?.sample(t)?.forEach((e, t) => n.set(t, e));
	return n.size ? n : null;
}
function ni(e) {
	return Object.fromEntries(ur.filter((t) => e[t] !== void 0).map((t) => [t, e[t]]));
}
function ri(e, t, n, r) {
	return ur.every((n) => e[n] === (t[n] ?? r?.[n])) && !!e.visibility === n;
}
function ii(e) {
	return e.nodes.some((e) => e.visible !== void 0) || !!e.motion?.tracks?.some((e) => e.kind === "node" && e.property === "visible");
}
function ai(e, t) {
	let n = /* @__PURE__ */ new Set();
	if (!ii(e)) return n;
	let r = new Map(e.nodes.map((e) => [e.id, e])), i = (e) => {
		let n = t?.nodes.get(e.id)?.visible;
		return n === void 0 ? e.visible === !1 : n < .5;
	};
	for (let t of e.nodes) for (let e = t, a = 0; e && a < 256; e = r.get(e.parent), a++) if (i(e)) {
		n.add(t.id);
		break;
	}
	return n;
}
function oi(e, t, n) {
	if (!t) return e;
	let r = e.map((e, r) => {
		let i = t.get(e.name);
		return i ? n[r]?.geometry === i ? n[r] : Object.freeze({
			...e,
			geometry: i
		}) : e;
	});
	return r.every((e, t) => e === n[t]) ? n : Object.freeze(r);
}
function si(e, t) {
	let { morphTargetNames: n, morphTargetValues: r } = e.geometry;
	n && e.morph && n.forEach((n, i) => {
		e.morph.weights[i] = t?.get(n)?.weight ?? r[i];
	});
}
function ci(e, t) {
	for (let n of e.restParts) n.visibility && (n.visibility.visible = !t.hiddenNodes.has(n.name)), Float32Array.prototype.set.call(n.matrix, t.graph.getNode(n.name).worldMatrix), si(n, t.morphs);
	for (let e of t.materialUpdates) e.holder.snapshot = e.snapshot;
	if (Vn(e.skinStages), t.assetClips) {
		t.assetClips.commit();
		for (let n of e.restParts) {
			let e = t.assetClips.matrices.get(n.name);
			e && Float32Array.prototype.set.call(n.matrix, e);
		}
	}
	for (let n of e.sequences) n.seek(t.time);
	e.renderCamera = t.camera, e.movedLook = t.movedLook, e.motionTime = t.time;
	let n = oi(e.restParts, t.clothGeometries, e.parts), r = n !== e.parts;
	return e.parts = n, r;
}
function li(e) {
	let t = structuredClone(e);
	return t.nodes = t.nodes.filter((e) => !e.assetPart), t.geometries = t.geometries.filter((e) => e.type !== "asset"), t.materials = t.materials.filter((e) => !e.assetSource), t;
}
function ui(e, t, n) {
	Z(t.geometry);
	let r = e.geometries.find((e) => e.id === t.geometry);
	if (!r) throw RangeError(`Geometry ID was not found: ${t.geometry}. Known geometry IDs: ${[...e.geometries.map((e) => e.id)].join(", ")}.`);
	if (r.type !== "mesh") throw TypeError(`Geometry ${t.geometry} is a ${r.type}. ${n(r.type)}`);
	return r;
}
function di(e, t) {
	q(t, [
		"type",
		"id",
		"recursive"
	], "operation"), Z(t.id);
	let n = t.recursive !== void 0 && t.recursive;
	if (typeof n != "boolean") throw TypeError("recursive must be boolean.");
	if (!e.nodes.some((e) => e.id === t.id)) throw RangeError(`${t.type} target was not found: ${t.id}. scene_inspect lists the IDs.`);
	let r = /* @__PURE__ */ new Map();
	for (let t of e.nodes) {
		let e = r.get(t.parent) ?? [];
		e.push(t.id), r.set(t.parent, e);
	}
	if (!n && (r.get(t.id)?.length ?? 0) > 0) throw RangeError("Nonrecursive removal cannot remove a node with children. Remove children first or use recursive.");
	let i = /* @__PURE__ */ new Set([t.id]), a = [t.id];
	if (n) for (let e = 0; e < a.length; e++) for (let t of r.get(a[e]) ?? []) i.has(t) || (i.add(t), a.push(t));
	return e.nodes = e.nodes.filter((e) => !i.has(e.id)), i;
}
function fi(e, t = {}, n = {}) {
	let r = yr(t), i = /* @__PURE__ */ new Map(), o = null, s = 0, c = 0, l = null, u = null, d = null, f = null, p = null, m = null, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map();
	function _(e, t) {
		Z(e);
		let n = o.recipe.nodes.find((t) => t.id === e), r = n && o.geometries.get(n.geometry);
		if (!r) throw RangeError(`path ${t} ${e} is not a node with a drawn geometry. List node IDs with scene_inspect.`);
		return {
			geometry: r,
			worldMatrix: o.graph.getNode(e).worldMatrix
		};
	}
	let v = (e) => L("navigation").resolvePathQuery(e, _, $);
	function ee() {
		let e = new Set(o?.geometryRecords.values() ?? []);
		for (let t of g.values()) for (let n of t.geometryRecords.values()) e.add(n);
		return e;
	}
	function y(e, t = null, s = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set()) {
		let l = Wr(e, r), u = l.nodes.some((e) => e.asset) ? L("assets").expandAssetPlacements(l, n.assets, r, i, l.nodes.some((e) => e.asset?.drive) ? L("drive").createAssetDrive : null) : Xr, d = l.nodes.some((e) => e.vegetation) ? L("vegetation").expandVegetation(l, r, i, u) : u;
		o && Qr(o.parts);
		let f = ee(), p = /* @__PURE__ */ new Map();
		for (let e of f) p.set(e.signature, e);
		let m = l.geometries.map((e) => {
			let n = JSON.stringify(e);
			return {
				definition: e,
				signature: n,
				existing: [
					t?.geometryRecords.get(e.id),
					o?.geometryRecords.get(e.id),
					p.get(n)
				].find((e) => e?.signature === n),
				estimatedVertices: e.type === "asset" ? 0 : Mr(e)
			};
		}), g = Kr(f), _ = m.filter((e) => !e.existing).reduce((e, t) => e + t.estimatedVertices, 0);
		if (g.vertices + _ > r.maxVertices || g.geometryBytes + _ * 56 > r.maxGeometryBytes) throw RangeError("Geometry preflight exceeds peak maxVertices or maxGeometryBytes across active, checkpoint and staged resources. Reduce detail or release checkpoints");
		let v = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map();
		for (let e of m) {
			let t = e.existing?.geometry ?? Object.freeze({});
			v.set(e.definition.id, t), y.set(t, e.existing?.bounds ?? {
				min: [
					0,
					0,
					0
				],
				max: [
					0,
					0,
					0
				]
			});
		}
		Ir(l, v, y, r);
		let b = /* @__PURE__ */ new Map();
		for (let e of m) {
			let t = e.existing;
			if (!t && e.definition.type === "asset") {
				let n = d.geometryParts.get(e.definition.id);
				t = Object.freeze({
					signature: e.signature,
					geometry: n,
					bounds: $(n, a()),
					vertices: 0,
					geometryBytes: 0,
					estimatedVertices: 0
				});
			} else if (!t) {
				let n = Object.freeze(Q(e.definition, Math.min(r.maxVertices, 1e6))), i = Object.values(n).reduce((e, t) => e + t.byteLength, 0), o = n.positions.length / 3;
				if (e.definition.type === "mesh") {
					if (g.vertices + _ - e.estimatedVertices + o > r.maxVertices) throw RangeError(`Mesh ${e.definition.id} has ${o} render vertices after its edits, which exceeds maxVertices across the scene. Reduce detail or edits.`);
				} else if (o > e.estimatedVertices || i > e.estimatedVertices * 60) throw RangeError("Generated geometry exceeds its conservative preflight bound.");
				t = Object.freeze({
					signature: e.signature,
					geometry: n,
					bounds: $(n, a()),
					vertices: o,
					geometryBytes: i,
					estimatedVertices: e.estimatedVertices
				});
			}
			b.set(e.definition.id, t);
		}
		let x = new Map([...b].map(([e, t]) => [e, t.geometry])), C = new Map([...b.values()].map((e) => [e.geometry, e.bounds]));
		l.nodes.some((e) => e.relations?.length) && (l.nodes = L("relations").solveRelations(l.nodes, (e, t, n) => {
			let r = x.get(e.geometry);
			return $(n === void 0 ? r : L("mesh").taggedFacePositions(r, n), t);
		}));
		let w = Ir(l, x, C, r), ne = zn({
			recipe: l,
			graph: w,
			geometryRecords: b,
			cache: h
		}), T = /* @__PURE__ */ new Map();
		for (let e of l.materials) {
			let r = Yr(e), i = t?.materialHandles.get(e.id), a = c.has(e.id) ? null : o?.materialHandles.get(e.id), s = [i, a].find((t) => t && qr(t.holder.snapshot) === qr(e)), l = d.materialOutputs.get(e.id), u = l ? Zr(r, l, i, a) : s ?? Jr(r, e.map && L("assets").createTextureSequence(e.id, e.map, n.sequenceFrames));
			T.set(e.id, u);
		}
		let re = new Map(o?.sourceRestParts.map((e) => [e.name, e]) ?? []), ie = new Map(t?.sourceRestParts.map((e) => [e.name, e]) ?? []), E = ii(l), D = l.nodes.filter((e) => e.geometry !== void 0).map((e) => {
			let t = ne.get(e.id), n = t?.geometry ?? x.get(e.geometry), r = T.get(e.material).output, i = d.partExtras.get(e.id), a = n.morphTargetValues && !i?.morph ? { weights: Float32Array.from(n.morphTargetValues) } : void 0;
			return [s.has(e.id) ? null : re.get(e.id), ie.get(e.id)].find((o) => o?.geometry === n && o.material === r && o.skin === (i?.skin ?? t?.skin) && (i?.morph ? o.morph === i.morph : !!o.morph == !!a) && ye(o) === ye(e) && ri(o, e, E, i)) ?? Object.freeze({
				name: e.id,
				geometry: n,
				material: r,
				...ye(e) ? { depthLayer: ye(e) } : {},
				...ni(e),
				...E ? { visibility: { visible: !0 } } : {},
				matrix: new Float32Array(w.getNode(e.id).worldMatrix),
				...t ? { skin: t.skin } : {},
				...a ? { morph: a } : {},
				...i
			});
		});
		Qr(D);
		let O = o && o.sourceRestParts.length === D.length && o.sourceRestParts.every((e, t) => e === D[t]) ? o.sourceRestParts : Object.freeze(D), k = te(l, O, w), { reflected: j, restParts: M } = S(l, O, k, w), N = {
			recipe: l,
			geometryRecords: b,
			geometries: x,
			graph: w,
			materialHandles: T,
			sourceRestParts: O,
			parts: M,
			restParts: M,
			bakeReport: k ? {
				...k.report,
				reused: k.reused
			} : null,
			reflectionReport: j ? j.report : null,
			topologyChanged: !(!o || M === o.restParts && o.parts === o.restParts),
			stats: Kr(b.values())
		};
		N.assetRuntime = d, N.sequences = [...T.values()].map((e) => e.holder.sequence).filter(Boolean), N.localBounds = C, N.skinBindings = ne, N.skinStages = Hn(ne), N.motionSampler = l.motion ? L("motion").compileAgentMotion(l.motion, l) : null, N.physicsSampler = ae(l, b), N.clothSampler = A(l, b, N.motionSampler), N.particleSampler = oe(l, b);
		let se = !!(N.motionSampler || N.physicsSampler || N.clothSampler || N.particleSampler || d.animators.length);
		return N.poseGraph = se ? Ir(l, x, C, r) : null, N.initialPose = ei(N, se ? 0 : null), N;
	}
	function b(e, t) {
		if (!Dt(e.environment)) return t;
		let { environment: n } = e, r = Hr(n);
		if (p?.parts === t && p.linksKey === r) return p.linked;
		let i = L("lightLinking").lightMasksFor(t, n), a = /* @__PURE__ */ new Map(), o = Object.freeze(t.map((e, t) => i[t] === -1 ? e : Object.freeze({
			...e,
			material: Ur(e.material, i[t], a)
		})));
		return p = {
			parts: t,
			linksKey: r,
			linked: o
		}, o;
	}
	function x() {
		return f && o.recipe.bake && o.motionSampler ? L("bake").staleBakeProblems(o, f.key) : [];
	}
	function S(e, t, n, r) {
		let i = n?.parts ?? t, a = w(e, t, i, r);
		return {
			reflected: a,
			restParts: D(e, b(e, ne(e, a ? a.parts : i)))
		};
	}
	function C(e) {
		let t = o.recipe.bake?.rebake && L("bake").bakeAtSampledPose(f, o.recipe, e);
		t && (o.restParts = S(o.recipe, o.sourceRestParts, t, e.graph).restParts, o.bakeReport = t.report);
	}
	function te(e, t, n) {
		if (!e.bake) return null;
		let r = new Map(t.map((e) => [e.name, new Float32Array(n.getNode(e.name).worldMatrix)])), i = L("bake").bakeGenerators(e), a = L("bake").lightBakeKey(e, i, e.environment, r);
		if (f?.key === a && f.sourceRestParts === t) return f.currentKey = a, {
			...f,
			reused: !0
		};
		let o = L("bake").bakeAgentParts(t, r, e.environment, e.bake, i);
		return f = {
			key: a,
			currentKey: a,
			sourceRestParts: t,
			parts: o.parts,
			report: o.report
		}, {
			...f,
			reused: !1
		};
	}
	function w(e, t, n, r) {
		return e.environment.objectReflections === !1 || !nt("reflections") ? null : (m = L("reflections").stageObjectReflections(m, e, t, n, r, Bt(e.environment)), m.result);
	}
	function ne(e, t) {
		return nt("floorSky") ? L("floorSky").stageFloorSky(e.environment, t) : t;
	}
	function T(e) {
		let t = (e.pointLights?.length ?? 0) + (e.spotLights?.length ?? 0) + (e.areaLights?.length ?? 0), n = e.keyColor ?? [
			1,
			1,
			1
		], r = (e.keyIntensity ?? 1) * (n[0] + n[1] + n[2]);
		return t > 0 && r === 0;
	}
	let re = null;
	function ie() {
		if (o.recipe.bake) return [];
		if (re?.revision !== s) {
			let e = new Map(o.parts.map((e) => [e.name, o.graph.getNode(e.name).worldMatrix]));
			re = {
				revision: s,
				share: ve(o.parts, e)
			};
		}
		let { share: e } = re;
		return e !== null && e >= .9 ? [Qt(e, T(o.recipe.environment))] : [];
	}
	let E = null;
	function D(e, t) {
		if (e.environment.resolveCoplanar !== "offset") return t;
		if (E?.parts === t) return E.resolved;
		let n = Object.freeze(L("coplanar").resolveCoplanarParts(t));
		return E = {
			parts: t,
			resolved: n
		}, n;
	}
	let O = null;
	function k() {
		if (!nt("coplanar")) return [];
		if (O?.revision !== s) {
			let e = L("coplanar");
			O = {
				revision: s,
				problems: e.coplanarOverlapDiagnostics(e.findCoplanarOverlaps(o.parts))
			};
		}
		return O.problems;
	}
	function ae(e, t) {
		if (!e.physics) return null;
		let n = L("physics").physicsBakeKey(e, t);
		if (l?.key !== n) {
			let r = new Map([...t].map(([e, t]) => [e, t.geometry]));
			l = {
				key: n,
				sampler: L("physics").bakeAgentPhysics(e.physics, e, r)
			};
		}
		return l.sampler;
	}
	function A(e, t, n) {
		if (!e.cloth) return null;
		let r = new Set([...e.cloth.sheets, ...e.cloth.colliders ?? []].map((e) => e.node)), i = e.nodes.filter((e) => r.has(e.id)), a = e.cloth.sheets.some((e) => e.pinTo) || (e.cloth.colliders ?? []).some((e) => e.node === void 0), o = JSON.stringify([
			e.cloth,
			i,
			i.map((e) => t.get(e.geometry)?.signature),
			a ? [
				e.motion,
				e.nodes,
				e.armatures
			] : null
		]);
		if (u?.key !== o) {
			let r = new Map([...t].map(([e, t]) => [e, t.geometry]));
			u = {
				key: o,
				sampler: L("cloth").bakeAgentCloth(e.cloth, e, r, n)
			};
		}
		return u.sampler;
	}
	function oe(e, t) {
		if (!e.particles) return null;
		let n = e.nodes.filter((t) => e.particles.systems.some((e) => e.node === t.id)), r = JSON.stringify([
			e.particles,
			n,
			n.map((e) => t.get(e.geometry).signature)
		]);
		if (d?.key !== r) {
			let n = new Map([...t].map(([e, t]) => [e, t.geometry]));
			d = {
				key: r,
				sampler: L("particles").bakeAgentParticles(e.particles, e, n)
			};
		}
		return d.sampler;
	}
	function j(e, t) {
		return ci(e, e.initialPose), e.topologyChanged && c++, o = e, t && s++, s;
	}
	function N(e) {
		if (q(e, ["expectedRevision"], "transaction options"), !Number.isSafeInteger(e.expectedRevision) || e.expectedRevision !== s) throw RangeError("expectedRevision must match the current revision.");
	}
	return j(y(e), !1), Object.freeze({
		capabilities: M,
		limits: r,
		get parts() {
			return o.parts;
		},
		get revision() {
			return s;
		},
		get topologyRevision() {
			return c;
		},
		get camera() {
			return structuredClone(o.renderCamera);
		},
		get motionTime() {
			return o.motionTime;
		},
		sequenceTextures() {
			return o.sequences;
		},
		sampleMotion(e) {
			if (e !== null && (!Number.isFinite(e) || e < 0 || e > 3600)) throw RangeError("Motion time must be null or within zero and 3600 seconds.");
			if (e !== null && !o.motionSampler && !o.physicsSampler && !o.clothSampler && !o.particleSampler && !o.assetRuntime.animators.length && !o.sequences.length) throw RangeError("This procedural recipe has no motion, physics, cloth or particles, and no placed asset clip.");
			let t = ei(o, e);
			return C(t), ci(o, t) && c++, o.motionTime;
		},
		get environment() {
			let e = structuredClone(o.recipe.environment);
			return o.movedLook ? L("motion").motionEnvironment(e, o.movedLook) : e;
		},
		worldBounds() {
			let e = [], t = new Map(o.restParts.map((e) => [e.name, e]));
			for (let n of o.sourceRestParts) {
				let r = t.get(n.name), i = o.localBounds.get(n.geometry);
				if (!r || !i || r.visibility?.visible === !1) continue;
				let a = [];
				for (let e = 0; e < 8; e++) a.push(e & 1 ? i.max[0] : i.min[0], e & 2 ? i.max[1] : i.min[1], e & 4 ? i.max[2] : i.min[2]);
				e.push({
					name: r.name,
					...$({ positions: a }, r.matrix)
				});
			}
			return e;
		},
		bakeStaleness: x,
		get postPasses() {
			return structuredClone(o.recipe.postPasses ?? []);
		},
		get effects() {
			let e = structuredClone(o.recipe.effects);
			return o.movedLook?.effects ? L("motion").motionEffects(e, o.movedLook) : e;
		},
		get shadow() {
			return structuredClone(o.recipe.shadow);
		},
		exportRecipe() {
			return li(o.recipe);
		},
		rigExport(e = {}) {
			if (!o.recipe.armatures) return {
				nodes: [],
				clips: []
			};
			let t = qn(o.recipe, o.graph, o.motionSampler, e);
			return ci(o, ei(o, o.motionTime)), t;
		},
		apply(e, t = {}) {
			if (N(t), !Array.isArray(e) || e.length === 0 || e.length > r.maxOperations) throw RangeError("operations must contain 1 to maxOperations commands.");
			let n = br(e, r.maxRecipeBytes), i = li(o.recipe), a = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
			for (let e of n) {
				let t = Object.hasOwn(gr, e.type) ? gr[e.type] : null;
				if (t) {
					if (q(e, ["type", t], "operation"), !Object.hasOwn(e, t)) throw TypeError(`${e.type} requires ${t}; use null to clear it.`);
					i[t] = e[t], i.armatures === null && delete i.armatures;
					continue;
				}
				let n = Object.hasOwn(hr, e.type) ? hr[e.type] : null;
				if (n) {
					q(e, ["type", n], "operation");
					let t = e[n], r = n === "environment" ? [
						"ground",
						"spotLights",
						"areaLights",
						"shadowCascades",
						"keyAffects",
						"objectReflections",
						"floorSkyTrace",
						"sunBounce",
						"specularAntiAliasing",
						"sunAngularRadius",
						"lines",
						"resolveCoplanar",
						"viewTransform",
						"look",
						"hdri"
					] : n === "effects" ? pe.fields : [];
					q(t, [...Object.keys(i[n]), ...r], n);
					let a = n === "environment" ? "volumeFog" : "bloom", o = {
						...i[n],
						...n === "environment" ? zt(t) : t
					};
					if (a && Object.hasOwn(t, a)) {
						let e = a === "volumeFog" ? [...Object.keys(i[n][a]), ...yt] : Object.keys(i[n][a]);
						q(t[a], e, a), o[a] = {
							...i[n][a],
							...t[a]
						};
					}
					i[n] = o;
					continue;
				}
				let r = Object.hasOwn(_r, e.type) ? _r[e.type] : null;
				if (r) {
					let [t, n] = r;
					q(e, ["type", n], "operation");
					let a = e[n];
					if (Z(a?.id), e.type === "add-geometry" ? Mr(a) : e.type === "add-material" ? wr(a) : Tr(a), i[t].some((e) => e.id === a.id)) throw RangeError(`Duplicate ${t} ID: ${a.id}. IDs must be unique: pick a new ID, or remove the existing one first.`);
					i[t].push(a);
					continue;
				}
				if (e.type === "edit-mesh") {
					q(e, [
						"type",
						"geometry",
						"edits",
						"replace"
					], "operation");
					let t = ui(i, e, (e) => `Add a mesh geometry with base: { type: '${e}', ... } to edit it.`);
					if (e.replace !== void 0 && typeof e.replace != "boolean") throw TypeError("replace must be boolean.");
					if (!Array.isArray(e.edits)) throw TypeError("edit-mesh needs an edits array.");
					t.edits = e.replace ? e.edits : [...t.edits ?? [], ...e.edits], L("mesh").normalizeMeshEdits(t.edits);
					continue;
				}
				if (e.type === "set-mesh-stack") {
					q(e, [
						"type",
						"geometry",
						"stack",
						"apply"
					], "operation");
					let t = ui(i, e, () => "Only mesh geometries have a modifier stack."), n = e.stack ?? t.stack ?? [];
					L("mesh").normalizeMeshStack(n);
					let r = e.apply ?? 0;
					if (!Number.isInteger(r) || r < 0 || r > n.length) throw RangeError(`apply must be an integer from 0 to the stack length ${n.length}.`);
					t.edits = [...t.edits ?? [], ...n.slice(0, r)], t.stack = n.slice(r), L("mesh").normalizeMeshEdits(t.edits);
					continue;
				}
				if (e.type === "remove-node") {
					for (let t of di(i, e)) a.add(t);
					continue;
				}
				let o = Object.hasOwn(vr, e.type) ? vr[e.type] : null;
				if (o) {
					q(e, ["type", "id"], "operation"), Z(e.id);
					let t = i[o].findIndex((t) => t.id === e.id);
					if (t < 0) throw RangeError(`${e.type} target was not found: ${e.id}. scene_inspect lists the IDs; add it first with an add operation.`);
					i[o].splice(t, 1), e.type === "remove-material" && s.add(e.id);
					continue;
				}
				let c, l;
				if (e.type === "set-node") l = dr, c = i.nodes.find((t) => t.id === e.id);
				else if (e.type === "set-material") l = [...fr, "map"], c = i.materials.find((t) => t.id === e.id);
				else if (e.type === "set-camera") l = mr, c = i.camera;
				else throw TypeError(`Unsupported operation type: ${e.type}. Use one of ${M.operations.join(", ")}.`);
				if (q(e, [
					"type",
					...e.type === "set-camera" ? [] : ["id"],
					...l
				], "operation"), !c) throw RangeError(`${e.type} target was not found: ${e.id}. scene_inspect lists the IDs; add it first with an add operation.`);
				if (e.type === "set-camera") Er(c, e);
				else for (let t of l) Object.hasOwn(e, t) && (c[t] = e[t]);
			}
			return j(y(i, null, a, s), !0);
		},
		inspect(e = {}) {
			q(e, [
				"ids",
				"limit",
				"includeBounds",
				"path"
			], "inspection");
			let t = xr(e.limit ?? Math.min(64, r.maxNodes), 1, r.maxNodes, "inspection limit");
			if (e.includeBounds !== void 0 && typeof e.includeBounds != "boolean") throw TypeError("includeBounds must be boolean.");
			if (e.ids !== void 0 && (!Array.isArray(e.ids) || e.ids.length > r.maxNodes)) throw RangeError("Inspection IDs exceed maxNodes.");
			let n = e.ids === void 0 ? o.recipe.nodes.filter((e) => !e.assetPart) : e.ids.map((e) => {
				Z(e);
				let t = o.recipe.nodes.find((t) => t.id === e);
				if (!t) throw RangeError(`Inspection ID was not found: ${e}. Call scene_inspect without ids to list node IDs.`);
				return t;
			}), i = n.slice(0, t).map((t) => {
				let n = o.geometries.get(t.geometry), r = {
					id: t.id,
					label: t.label ?? t.id,
					parent: t.parent,
					geometry: t.geometry ?? null,
					material: t.material ?? null,
					vertices: n ? n.positions.length / 3 : 0,
					triangles: n ? n.indices.length / 3 : 0
				};
				return e.includeBounds && (r.bounds = n ? $(n, o.graph.getNode(t.id).worldMatrix) : null), r;
			}), a = Kr(ee()), l = [
				...Zt(o.recipe),
				...ie(),
				...x(),
				...k()
			];
			return {
				revision: s,
				topologyRevision: c,
				...o.recipe.motion?.ik?.length ? { motionIk: L("motion").compileAgentMotion(o.recipe.motion, o.recipe).sweepIk() } : {},
				motion: o.recipe.motion ? {
					duration: o.recipe.motion.duration,
					loop: o.recipe.motion.loop,
					tracks: o.recipe.motion.tracks.length,
					time: o.motionTime
				} : null,
				physics: o.physicsSampler ? o.physicsSampler.report() : null,
				...o.clothSampler ? { cloth: o.clothSampler.report() } : {},
				...o.particleSampler ? { particles: o.particleSampler.report() } : {},
				...o.assetRuntime.vegetation ? { vegetation: o.assetRuntime.vegetation } : {},
				...o.assetRuntime.placements.length ? { assets: L("assets").describeAssetPlacements(o.assetRuntime, o.graph, (e) => o.localBounds.get(e)) } : {},
				...o.sequences.length ? { textureSequences: o.sequences.map((e) => e.describe()) } : {},
				...o.bakeReport ? { bake: o.bakeReport } : {},
				...o.recipe.postPasses?.length ? { postPasses: L("userPass").describeUserPasses(o.recipe.postPasses) } : {},
				...o.reflectionReport ? { reflections: o.reflectionReport } : {},
				...o.recipe.armatures ? { rig: Gn(o.recipe, o.skinBindings) } : {},
				boundsSpace: "authored-base-world",
				...l.length ? { diagnostics: l } : {},
				counts: {
					nodes: o.recipe.nodes.length,
					parts: o.parts.length,
					geometries: o.geometries.size,
					materials: o.recipe.materials.length,
					vertices: o.stats.vertices
				},
				geometryBytes: o.stats.geometryBytes,
				estimatedGeometryBytes: o.stats.estimatedGeometryBytes,
				residentGeometryBytes: a.geometryBytes,
				residentGeometryVertices: a.vertices,
				look: {
					world: o.recipe.environment.world,
					pointLights: o.recipe.environment.pointLights.length,
					spotLights: o.recipe.environment.spotLights?.length ?? 0,
					areaLights: o.recipe.environment.areaLights?.length ?? 0,
					volumeFogDensity: o.recipe.environment.volumeFog.density,
					exposure: o.recipe.effects.exposure
				},
				nodes: i,
				truncated: n.length > i.length,
				...e.path === void 0 ? {} : { path: v(e.path) }
			};
		},
		inspectMeshes(e = {}) {
			q(e, ["geometries"], "mesh inspection");
			let t = e.geometries ?? [...o.geometries.keys()];
			if (!Array.isArray(t) || e.geometries !== void 0 && t.length > sr) throw RangeError(`Inspect at most ${sr} geometry IDs per call.`);
			let n = t.slice(0, sr), r = n.map((e) => {
				Z(e);
				let t = o.geometries.get(e);
				if (!t) throw RangeError(`Geometry ID was not found: ${e}. Known IDs: ${[...o.geometries.keys()].join(", ")}.`);
				return {
					geometry: e,
					...L("mesh").meshReport(t)
				};
			});
			return {
				revision: s,
				meshes: r,
				truncated: t.length > n.length
			};
		},
		checkpoint() {
			if (g.size >= r.maxCheckpoints) throw RangeError("Checkpoint budget exhausted. Release a checkpoint.");
			let e = Object.freeze({});
			return g.set(e, {
				recipe: li(o.recipe),
				geometryRecords: new Map(o.geometryRecords),
				materialHandles: new Map(o.materialHandles),
				restParts: o.restParts,
				sourceRestParts: o.sourceRestParts
			}), e;
		},
		restore(e, t = {}) {
			N(t);
			let n = g.get(e);
			if (!n) throw RangeError("Unknown or released checkpoint. Save one with scene_checkpoint, or use a checkpointId that scene_checkpoint returned and you have not released.");
			return j(y(n.recipe, n), !0);
		},
		releaseCheckpoint(e) {
			if (!g.delete(e)) throw RangeError("Unknown or released checkpoint. Save one with scene_checkpoint, or use a checkpointId that scene_checkpoint returned and you have not released.");
		}
	});
}
export { Ye as C, it as D, et as E, st as O, Je as S, rt as T, Qe as _, En as a, ct as b, $t as c, Gt as d, Wt as f, tt as g, Xe as h, ar as i, Bt as l, nt as m, fi as n, kn as o, L as p, Fr as r, An as s, Er as t, zt as u, $e as v, lt as w, ot as x, at as y };
