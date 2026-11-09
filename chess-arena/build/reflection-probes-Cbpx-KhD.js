/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e, r as t } from "./environment-H0LjiCAj.js";
import { r as n } from "./gl-program-KwXE3oHO.js";
import { i as r, l as i } from "./shader-registry-DHYkwAg5.js";
import { o as a, t as o } from "./probe-trace-ALKeQrQp.js";
// src/reflection-probes.js
var s = 19;
function c(e, t) {
	let n = null, r = Infinity;
	for (let i of e) {
		let e = Math.hypot(t[0] - i.position[0], t[1] - i.position[1], t[2] - i.position[2]);
		e <= i.radius && e < r && (n = i, r = e);
	}
	return n;
}
function l(e, t, n) {
	let r = n.get(e) ?? /* @__PURE__ */ new Map();
	if (n.set(e, r), !r.has(t)) {
		let n = {};
		for (let t of Object.keys(e)) Object.defineProperty(n, t, {
			enumerable: !0,
			get: () => e[t]
		});
		Object.defineProperty(n, "environmentProbe", {
			enumerable: !0,
			value: t
		}), r.set(t, Object.freeze(n));
	}
	return r.get(t);
}
function u(e, n, { rotation: r = 0, wrappers: i = /* @__PURE__ */ new Map() } = {}) {
	let s = n.traced.map(({ position: e, radius: n, width: i, height: a, data: o, hitFraction: s, part: c, floorHeight: l = null }) => {
		let u = t({
			width: i,
			height: a,
			data: o,
			intensity: 1,
			rotation: r
		}), d = c !== void 0 && l !== null ? [...e, l] : null;
		return {
			position: e,
			radius: n,
			hitFraction: s,
			part: c,
			map: d ? Object.freeze({
				...u,
				parallax: d
			}) : u
		};
	}), u = new Map(s.filter((e) => e.part !== void 0).map((e) => [e.part, e])), d = s.filter((e) => e.part === void 0), f = e.map((e, t) => {
		let n = u.get(t) ?? c(d, o(a(e)));
		return n ? Object.freeze({
			...e,
			material: l(e.material, n.map, i)
		}) : e;
	}), p = {
		automatic: n.automatic,
		requested: n.requested,
		placed: s.map(({ position: e, radius: t, hitFraction: n }) => ({
			position: e,
			radius: t,
			hitFraction: n
		})),
		skipped: n.skipped,
		glb: s.length > 0 ? "Probes are not written to GLB: glTF has no standard for them." : null,
		partsWithProbe: f.filter((t, n) => t !== e[n]).length
	};
	return {
		parts: Object.freeze(f),
		probes: s,
		report: p
	};
}
i("probe", Object.freeze({
	declarations: "uniform float probeEnabled;\nuniform vec4 probeFloor;\n",
	probeSurroundings: "    if (probeEnabled > 0.5) surroundings = environmentRadiance(reflected, roughness * environmentLevelMax) / max(mix(1.0, 0.5 * daylight, worldMode), 0.05);\n",
	probeReflection: "  if (probeEnabled > 1.5 && reflected.y < -0.01 && worldPosition.y > probeFloor.w) {\n    reflected = normalize(worldPosition + reflected * ((probeFloor.w - worldPosition.y) / reflected.y) - probeFloor.xyz);\n  }\n"
}));
var d = /* @__PURE__ */ new WeakMap();
function f(e) {
	if (!d.has(e)) {
		let t = e.context.getUniformLocation(e.program, "probeEnabled"), n = e.context.getUniformLocation(e.program, "probeFloor");
		d.set(e, {
			resources: /* @__PURE__ */ new Map(),
			enabledLocation: t,
			floorLocation: n,
			bound: !1
		});
	}
	return d.get(e);
}
function p(t, r) {
	let i = t.context, a = i.getParameter(i.FRAMEBUFFER_BINDING), o = i.getParameter(i.VIEWPORT), s = i.getParameter(i.CURRENT_PROGRAM), c = i.getParameter(i.VERTEX_ARRAY_BINDING), l = i.getParameter(i.ACTIVE_TEXTURE);
	i.activeTexture(i.TEXTURE0);
	let u = i.getParameter(i.TEXTURE_BINDING_2D), d = [
		i.DEPTH_TEST,
		i.CULL_FACE,
		i.BLEND,
		i.SCISSOR_TEST
	].map((e) => [e, i.isEnabled(e)]), f = e(i, r, {
		compileProgram: (e, n, r) => t.compileEnvironmentProgram(e, n, r),
		fullscreenVertex: n
	});
	i.bindFramebuffer(i.FRAMEBUFFER, a), i.viewport(...o), i.useProgram(s), i.bindVertexArray(c), i.bindTexture(i.TEXTURE_2D, u), i.activeTexture(l);
	for (let [e, t] of d) t ? i.enable(e) : i.disable(e);
	return i.deleteTexture(f.brdfTexture), t.textures.set(Symbol("reflection-probe"), f.specularTexture), f;
}
function m(e, t) {
	if (!e.shaderFeatures?.has("probe")) return;
	let n = f(e), r = e.context, i = t[s], a = e.activeMap;
	if (!i) {
		if (!n.bound) return;
		n.bound = !1, e.activateEnvironment(a), a && e.applyEnvironmentUniforms(a), r.uniform1f(n.enabledLocation, 0);
		return;
	}
	n.resources.has(i.data) || n.resources.set(i.data, p(e, i));
	let o = n.resources.get(i.data), c = e.uniforms;
	n.bound = !0, e.bindEnvironmentTextures(o.specularTexture, e.environmentResources?.brdfTexture ?? e.whiteTexture), r.uniform1f(c.environmentIntensity, 1), r.uniform2f(c.environmentRotation, Math.cos(i.rotation), Math.sin(i.rotation)), r.uniform1f(c.environmentLevelMax, o.levelCount - 1), a && e.environmentResources && r.uniform3fv(c["environmentIrradiance[0]"], e.environmentResources.irradiance.map((e) => e * a.intensity)), i.parallax && r.uniform4fv(n.floorLocation, i.parallax), r.uniform1f(n.enabledLocation, i.parallax ? 2 : 1);
}
var h = r.bind;
r.bind = (e, t, n, r) => {
	h?.(e, t, n, r), m(e, t);
};
export { u as t };
