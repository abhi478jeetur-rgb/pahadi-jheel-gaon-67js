/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// packages/render-native/pack-input.mjs
var e = Math.cos(Math.PI / 360);
function t(t, n, r, i, a, o) {
	let s = /* @__PURE__ */ new ArrayBuffer(256), c = new Float32Array(s), l = new Int32Array(s), u = new Uint32Array(s), { sun: d } = t.lights, { environment: f } = t;
	c.set([...n.eye, 0], 0), c.set([...n.forward, 0], 4), c.set([...n.right, 0], 8), c.set([...n.above, 0], 12), c.set([...d?.direction ?? [
		0,
		1,
		0
	], 0], 16), c.set([...d?.color ?? [
		0,
		0,
		0
	], e], 20), c.set([
		f?.width ?? 1,
		f?.height ?? 1,
		f?.intensity ?? 1,
		f?.total ?? 1
	], 24), c.set([
		f?.cosine ?? 1,
		f?.sine ?? 0,
		t.surfaceOffset,
		t.farDistance
	], 28), c.set([
		n.halfWidth,
		n.halfHeight,
		r.fireflyClamp ?? 20,
		r.noiseThreshold ?? 0
	], 32), l.set([
		r.width,
		r.height,
		r.bounces,
		i
	], 36), l.set([
		+!!d + i + +!!f,
		+!!d,
		+!!f,
		0
	], 40), u.set([
		r.seed >>> 0,
		a,
		0,
		0
	], 44);
	let { volume: p } = t;
	return c.set([...p?.minimum ?? [
		0,
		0,
		0
	], p?.density ?? 0], 48), c.set([...p?.maximum ?? [
		0,
		0,
		0
	], p?.anisotropy ?? 0], 52), c.set([...p?.albedo ?? [
		1,
		1,
		1
	], p?.maxDistance ?? 0], 56), u.set([
		o,
		0,
		0,
		0
	], 60), new Uint8Array(s);
}
function n(e, n, r, i) {
	let a = i.packAtlas(e.materials), o = i.packLights(e.lights), s = i.packEnvironment(e.environment), c = new Float32Array(s ? s.height + s.width * s.height : 4);
	s && (c.set(s.rows.data.subarray(0, s.height), 0), c.set(s.pixels.data.subarray(0, s.width * s.height), s.height));
	let l = i.packMaterials(e.materials, a).data, u = i.sceneUsesSubsurface(e.materials), d = u ? i.packSubsurface(e.materials).data : /* @__PURE__ */ new Float32Array(), f = new Float32Array(l.length + d.length);
	return f.set(l), f.set(d, l.length), {
		triangles: i.packTriangles(e).data,
		triangleCount: e.bvh.triangleOrder.length,
		materials: f,
		lights: o.table.data,
		atlas: new Uint32Array(a.data.buffer, a.data.byteOffset, Math.floor(a.data.byteLength / 4)),
		environmentColors: s?.colors ?? /* @__PURE__ */ new Float32Array(4),
		environmentTables: c,
		parameters: t(e, n, r, o.count, a.width, u ? l.length / 4 : 0)
	};
}
var r = 46, i = {
	eye: [
		0,
		0,
		0
	],
	forward: [
		0,
		0,
		-1
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
};
function a(e, t, a) {
	let o = n(e, i, {
		...t,
		bounces: t.bounces - 1,
		width: t.texelCount,
		height: 1
	}, a), s = new Uint32Array(o.parameters.buffer, o.parameters.byteOffset, o.parameters.byteLength / 4);
	return s[r] = t.samples, o;
}
export { n as buildNativeInput, a as buildNativeTexelInput };
