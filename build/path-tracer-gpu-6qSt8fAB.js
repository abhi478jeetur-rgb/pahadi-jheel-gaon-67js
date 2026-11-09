/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./rolldown-runtime-CvuOiBwx.js";
import { i as t } from "./path-tracer-light-tree-BZYzVWXO.js";
import { a as n, c as r, d as i, f as a, i as o, n as s, o as c, r as l, s as u, t as d, u as f } from "./path-tracer-gpu-pack-B_ap1Af7.js";
// src/path-tracer-gpu.js
var p = /* @__PURE__ */ e({
	averageBuffers: () => A,
	createBandState: () => L,
	createTargets: () => O,
	drawOneSample: () => R,
	getContext: () => M,
	getKernel: () => F,
	gpuKernelCompileCount: () => P,
	isGpuTracerAvailable: () => y,
	readTarget: () => k,
	releaseResources: () => I,
	setSceneUniforms: () => D,
	traceOnGpu: () => B,
	traceTexelsOnGpu: () => H,
	uploadScene: () => E,
	withBlueNoiseTile: () => T
}), m = 4, h = .08, g = 4, _ = .25;
function v() {
	return typeof OffscreenCanvas == "function" ? new OffscreenCanvas(1, 1) : typeof document < "u" ? document.createElement("canvas") : null;
}
function y() {
	let e = v()?.getContext("webgl2");
	return e ? !!(e.getExtension("EXT_color_buffer_float") && e.getExtension("EXT_float_blend")) : !1;
}
function b(e, t, n) {
	let r = e.createShader(t);
	if (e.shaderSource(r, n), e.compileShader(r), !e.getShaderParameter(r, e.COMPILE_STATUS)) throw Error(`The GPU path tracer shader did not compile: ${e.getShaderInfoLog(r)}`);
	return r;
}
function x(e, t) {
	let n = e.createProgram();
	if (e.attachShader(n, b(e, e.VERTEX_SHADER, i)), e.attachShader(n, b(e, e.FRAGMENT_SHADER, a(t))), e.linkProgram(n), !e.getProgramParameter(n, e.LINK_STATUS)) throw Error(`The GPU path tracer program did not link: ${e.getProgramInfoLog(n)}`);
	return n;
}
var S = [], C = null;
function w(e, t, n, r, i, a, o, s) {
	let c = e.createTexture();
	return S.push(c), e.activeTexture(e.TEXTURE0 + t), e.bindTexture(e.TEXTURE_2D, c), e.pixelStorei(e.UNPACK_ALIGNMENT, 1), e.texImage2D(e.TEXTURE_2D, 0, n, a, o, 0, r, i, s), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), c;
}
async function T(e) {
	if (e.samplingPattern !== "blue-noise-first") return e;
	let { BLUE_NOISE_SIZE: t, createBlueNoiseTile: n } = await import("./path-tracer-blue-noise-9F3bwgod.js");
	return {
		...e,
		blueNoiseTile: {
			size: t,
			bytes: n(e.seed ?? 0)
		}
	};
}
function E(e, t, i, a = {}) {
	let p = d(i.materials), m = o(i.lights), h = s(i.environment), g = c(i.bvh), _ = r(i), v = n(i.materials, p), y = [
		["uNodes", g],
		["uTriangles", _],
		["uMaterials", v],
		["uLights", m.table]
	];
	f(i.materials) && y.push(["uSubsurface", u(i.materials)]), a.lightSelection === "tree" && y.push(["uLightTree", l(i.lights)]);
	let b = 0, x = (n) => e.uniform1i(e.getUniformLocation(t, n), b++);
	for (let [t, n] of y) w(e, b, e.RGBA32F, e.RGBA, e.FLOAT, n.width, n.height, n.data), x(t);
	w(e, b, e.RGBA8, e.RGBA, e.UNSIGNED_BYTE, p.width, p.height, p.data), x("uAtlas");
	let S = h?.colors ?? /* @__PURE__ */ new Float32Array(4);
	w(e, b, e.RGBA32F, e.RGBA, e.FLOAT, h?.width ?? 1, h?.height ?? 1, S), x("uEnvironment");
	let C = {
		width: 1,
		height: 1,
		data: /* @__PURE__ */ new Float32Array(1)
	};
	for (let [t, n] of [["uEnvironmentRows", h?.rows ?? C], ["uEnvironmentPixels", h?.pixels ?? C]]) w(e, b, e.R32F, e.RED, e.FLOAT, n.width, n.height, n.data), x(t);
	return a.blueNoiseTile && (w(e, b, e.RGBA8, e.RGBA, e.UNSIGNED_BYTE, a.blueNoiseTile.size, a.blueNoiseTile.size, a.blueNoiseTile.bytes), x("uBlueNoise")), {
		lightCount: m.count,
		nextUnit: b
	};
}
function D(e, t, n, r, i, a) {
	let o = (n) => e.getUniformLocation(t, n), { sun: s } = n.lights, { environment: c, volume: l } = n;
	e.uniform3fv(o("uEye"), r.eye), e.uniform3fv(o("uForward"), r.forward), e.uniform3fv(o("uRight"), r.right), e.uniform3fv(o("uAbove"), r.above), e.uniform2f(o("uHalfSize"), r.halfWidth, r.halfHeight), e.uniform2i(o("uSize"), i.width, i.height), e.uniform1ui(o("uSeed"), i.seed >>> 0), e.uniform1i(o("uBounces"), i.bounces), e.uniform1f(o("uFireflyClamp"), i.fireflyClamp), e.uniform1f(o("uSurfaceOffset"), n.surfaceOffset), e.uniform1f(o("uFarDistance"), n.farDistance), e.uniform1i(o("uLightCount"), a), e.uniform1i(o("uEmitterCount"), +!!s + a + +!!c), e.uniform1i(o("uHasSun"), +!!s), e.uniform3fv(o("uSunDirection"), s?.direction ?? [
		0,
		1,
		0
	]), e.uniform3fv(o("uSunColor"), s?.color ?? [
		0,
		0,
		0
	]), e.uniform1f(o("uSunCosineMax"), Math.cos(s?.angularRadius ?? Math.PI / 360)), e.uniform1i(o("uHasEnvironment"), +!!c), e.uniform4f(o("uEnvironmentShape"), c?.width ?? 1, c?.height ?? 1, c?.intensity ?? 1, c?.total ?? 1), e.uniform2f(o("uEnvironmentRotation"), c?.cosine ?? 1, c?.sine ?? 0), e.uniform1i(o("uHasVolume"), +!!l), e.uniform3fv(o("uVolumeMinimum"), l?.minimum ?? [
		0,
		0,
		0
	]), e.uniform3fv(o("uVolumeMaximum"), l?.maximum ?? [
		0,
		0,
		0
	]), e.uniform3fv(o("uVolumeAlbedo"), l?.albedo ?? [
		1,
		1,
		1
	]), e.uniform3f(o("uVolumeShape"), l?.density ?? 0, l?.anisotropy ?? 0, l?.maxDistance ?? 0);
}
function O(e, t, n) {
	let r = e.createFramebuffer();
	S.push(r), e.bindFramebuffer(e.FRAMEBUFFER, r);
	let i = [];
	for (let r = 0; r < m; r++) {
		let a = e.createTexture();
		S.push(a), e.activeTexture(e.TEXTURE15), e.bindTexture(e.TEXTURE_2D, a), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA32F, t, n, 0, e.RGBA, e.FLOAT, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + r, e.TEXTURE_2D, a, 0), i.push(e.COLOR_ATTACHMENT0 + r);
	}
	if (e.drawBuffers(i), e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw Error("The GPU path tracer cannot render to float targets here.");
	e.clearBufferfv(e.COLOR, 0, [
		0,
		0,
		0,
		0
	]);
	for (let t = 1; t < m; t++) e.clearBufferfv(e.COLOR, t, [
		0,
		0,
		0,
		0
	]);
	return i;
}
function k(e, t, n, r) {
	let i = new Float32Array(n * r * 4);
	return e.readBuffer(e.COLOR_ATTACHMENT0 + t), e.readPixels(0, 0, n, r, e.RGBA, e.FLOAT, i), i;
}
function A(e, t, n, r) {
	let i = t * n, a = k(e, 0, t, n), o = k(e, 1, t, n), s = k(e, 2, t, n), c = k(e, 3, t, n), l = {
		color: new Float32Array(i * 3),
		albedo: new Float32Array(i * 3),
		normal: new Float32Array(i * 3),
		depth: new Float32Array(i),
		variance: new Float32Array(i),
		samplesTaken: new Uint16Array(i).fill(r)
	};
	for (let e = 0; e < i; e++) {
		for (let t = 0; t < 3; t++) l.color[e * 3 + t] = a[e * 4 + t] / r, l.albedo[e * 3 + t] = o[e * 4 + t] / r, l.normal[e * 3 + t] = s[e * 4 + t] / r;
		l.depth[e] = a[e * 4 + 3] / r;
		let t = c[e * 4] / r;
		l.variance[e] = Math.max(0, c[e * 4 + 1] / r - t * t) / Math.max(r - 1, 1);
	}
	return l;
}
var j = () => new Promise((e) => setTimeout(e, 0));
function M() {
	if (C) return C;
	let e = v()?.getContext("webgl2", {
		antialias: !1,
		depth: !1,
		stencil: !1,
		alpha: !1,
		powerPreference: "high-performance"
	});
	if (!e) throw Error("The GPU path tracer needs WebGL2.");
	if (!e.getExtension("EXT_color_buffer_float") || !e.getExtension("EXT_float_blend")) throw Error("The GPU path tracer needs float render targets with blending.");
	let t = e.getExtension("WEBGL_debug_renderer_info");
	return C = {
		gl: e,
		programs: /* @__PURE__ */ new Map(),
		gpu: t ? e.getParameter(t.UNMASKED_RENDERER_WEBGL) : "unknown"
	}, C;
}
var N = 0;
function P() {
	return N;
}
function F(e, t = !1, n = {}) {
	let { gl: r, programs: i } = M(), a = n.samplingPattern === "blue-noise-first", o = n.lightSelection === "importance", s = n.lightSelection === "tree", c = n.radianceCache === !0, l = `${e}:${t}:${a}:${o}:${c}:${s}`;
	if (!i.has(l)) {
		let n = performance.now(), u = x(r, {
			hasSubsurface: e,
			texelBake: t,
			blueNoise: a,
			lightImportance: o,
			radianceCache: c,
			lightTree: s
		});
		r.getProgramParameter(u, r.LINK_STATUS), i.set(l, {
			program: u,
			compileSeconds: (performance.now() - n) / 1e3
		}), t || N++;
	}
	return i.get(l);
}
function I(e) {
	for (let t of S) t instanceof WebGLFramebuffer ? e.deleteFramebuffer(t) : e.deleteTexture(t);
	S.length = 0;
}
function L(e) {
	return {
		bandRows: Math.min(e, 32),
		lastYield: performance.now()
	};
}
async function R(e, t, n, r, i, a, o) {
	e.viewport(0, 0, n, r), e.enable(e.BLEND), e.blendFunc(e.ONE, e.ONE), e.enable(e.SCISSOR_TEST), e.uniform1i(e.getUniformLocation(t, "uSample"), i);
	let s = 0;
	for (; s < r;) {
		let t = Math.min(a.bandRows, r - s), i = s;
		s += t;
		let c = performance.now();
		e.scissor(0, i, n, t), e.drawArrays(e.TRIANGLES, 0, 3), e.finish();
		let l = (performance.now() - c) / 1e3, u = Math.min(2, h / Math.max(l, 1e-4));
		a.bandRows = Math.max(g, Math.min(r, Math.round(t * u))), o(), (performance.now() - a.lastYield) / 1e3 > _ && (await j(), a.lastYield = performance.now());
	}
	e.disable(e.SCISSOR_TEST);
}
async function z(e, t, n, r, i, a) {
	let o = L(r);
	for (let s = 0; s < i; s++) await R(e, t, n, r, s, o, a);
}
async function B(e, n, r, i) {
	let a = await T(r), o = {
		...a,
		lightSelection: t(a.lightSelection, e.lights)
	}, { gl: s, gpu: c } = M(), { program: l, compileSeconds: u } = F(f(e.materials), !1, o), { width: d, height: p, samples: m } = o;
	s.useProgram(l);
	let { lightCount: h } = E(s, l, e, o);
	D(s, l, e, n, o, h), O(s, d, p), await z(s, l, d, p, m, i);
	let g = A(s, d, p, m);
	return I(s), Object.assign(g, {
		gpu: c,
		compileSeconds: u
	});
}
var V = 2048;
async function H(e, t, n, r) {
	let { gl: i, gpu: a } = M(), { program: o, compileSeconds: s } = F(f(e.materials), !0), { count: c, points: l, normals: u } = t, { samples: d, seed: p } = n, m = Math.min(c, V), h = Math.ceil(c / m);
	i.useProgram(o);
	let { lightCount: g, nextUnit: _ } = E(i, o, e);
	D(i, o, e, {
		eye: [
			0,
			0,
			0
		],
		forward: [
			0,
			0,
			1
		],
		right: [
			1,
			0,
			0
		],
		above: [
			0,
			1,
			0
		],
		halfWidth: 1,
		halfHeight: 1
	}, {
		width: m,
		height: h,
		seed: p,
		bounces: n.bounces - 1,
		fireflyClamp: n.fireflyClamp
	}, g);
	let v = (e, t, n) => {
		let r = new Float32Array(m * h * 4);
		for (let e = 0; e < c; e++) r.set(n.subarray(e * 3, e * 3 + 3), e * 4);
		w(i, e, i.RGBA32F, i.RGBA, i.FLOAT, m, h, r), i.uniform1i(i.getUniformLocation(o, t), e);
	};
	v(_, "uTexelPoints", l), v(_ + 1, "uTexelNormals", u), i.uniform1i(i.getUniformLocation(o, "uTexelCount"), c), i.uniform1i(i.getUniformLocation(o, "uSampleCount"), d), O(i, m, h), await z(i, o, m, h, d, r);
	let y = k(i, 0, m, h), b = k(i, 3, m, h);
	I(i);
	let x = new Float32Array(c * 3), S = new Float32Array(c);
	for (let e = 0; e < c; e++) {
		for (let t = 0; t < 3; t++) x[e * 3 + t] = y[e * 4 + t] / d;
		S[e] = b[e * 4 + 2] / d;
	}
	return {
		radiance: x,
		escaped: S,
		gpu: a,
		compileSeconds: s
	};
}
export { M as a, p as c, E as d, T as f, R as i, I as l, L as n, F as o, O as r, y as s, A as t, D as u };
