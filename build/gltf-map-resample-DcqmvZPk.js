/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/gltf-map-resample.js
var e = JSON.stringify([
	[0, 0],
	0,
	[1, 1]
]), t = 10497, n = 1e-6, r = 4, i = {
	baseColorTexture: "map",
	metallicRoughnessTexture: "metalnessMap",
	occlusionTexture: "aoMap",
	emissiveTexture: "emissiveMap"
}, a = (e) => e.texCoord ?? 0;
function o(t) {
	let n = JSON.stringify([
		t.offset,
		t.rotation,
		t.scale
	]);
	return n === e ? "" : n;
}
function s(e, t) {
	return e?.name ? `"${e.name}" (material ${t})` : `material ${t}`;
}
function c({ rotation: e, scale: t }) {
	let n = Math.cos(e), r = Math.sin(e);
	return [
		n * t[0],
		r * t[1],
		-r * t[0],
		n * t[1]
	];
}
function l([e, t, n, r], [i, a, o, s]) {
	return [
		e * i + t * o,
		e * a + t * s,
		n * i + r * o,
		n * a + r * s
	];
}
function u([e, t, n, r]) {
	let i = e * r - t * n;
	return !Number.isFinite(i) || Math.abs(i) < 1e-12 ? null : [
		r / i,
		-t / i,
		-n / i,
		e / i
	];
}
function d(e, t) {
	let r = u(c(e));
	if (!r) return null;
	let i = l(c(t), r), a = i.map(Math.round);
	if (i.some((e, t) => Math.abs(e - a[t]) > n)) return null;
	let [o, s, d, f] = a;
	return {
		linear: a,
		offset: [t.offset[0] - (o * e.offset[0] + s * e.offset[1]), t.offset[1] - (d * e.offset[0] + f * e.offset[1])]
	};
}
function f(e, n) {
	let r = e.samplers?.[e.textures?.[n.index]?.sampler] ?? {};
	return (r.wrapS ?? t) === t && (r.wrapT ?? t) === t;
}
function p(e, { materialTextureReferences: t, textureUvTransform: n }) {
	return t(e).filter(([e, t]) => e !== "normalTexture" && a(t) === 0).map(([e, t]) => [
		e,
		t,
		n(t)
	]);
}
function m(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let [, , e] of t) {
		let t = o(e);
		n.set(t, {
			transform: e,
			count: (n.get(t)?.count ?? 0) + 1
		});
	}
	let r = [...n.entries()].sort((e, t) => t[1].count - e[1].count), i = null;
	for (let [n, { transform: a }] of r) {
		let r = [], s = 0;
		for (let [i, c, l] of t) {
			if (o(l) === n) continue;
			let t = f(e, c) ? d(a, l) : null;
			if (!t) {
				s = Infinity;
				break;
			}
			s += Math.abs(t.linear[0] * t.linear[3] - t.linear[1] * t.linear[2]), r.push({
				property: i,
				...t
			});
		}
		s < (i?.growth ?? Infinity) && (i = {
			shared: a,
			resamples: r,
			growth: s
		});
	}
	return i;
}
function h(e, t) {
	let { KHR_texture_transform: n, ...r } = e.extensions ?? {}, i = o(t) === "" ? r : {
		...r,
		KHR_texture_transform: {
			...n,
			offset: t.offset,
			rotation: t.rotation,
			scale: t.scale
		}
	};
	Object.keys(i).length ? e.extensions = i : delete e.extensions;
}
function g(e, t) {
	let n = /* @__PURE__ */ new Map();
	return (e.materials ?? []).forEach((r, i) => {
		let a = p(r ?? {}, t);
		if (new Set(a.map(([, , e]) => o(e))).size < 2) return;
		let c = m(e, a);
		if (!c) {
			let e = a.map(([e]) => e).join(", ");
			throw Error(`Maps of ${s(r, i)} have KHR_texture_transform values that cannot share one UV space (${e}). They must repeat, read TEXCOORD_0, and differ by whole-number tilings of one of them.`);
		}
		for (let [, e, t] of a) o(t) !== o(c.shared) && h(e, c.shared);
		n.set(i, c.resamples);
	}), n.size ? { apply: (t, r) => S(t, n, e, r) } : null;
}
function _(e, t) {
	if (e.data) return e.data;
	if (typeof OffscreenCanvas != "function" && typeof document > "u") throw Error(`${t} cannot be read back to resample it: this runtime has no canvas.`);
	let n = (typeof OffscreenCanvas == "function" ? new OffscreenCanvas(e.width, e.height) : Object.assign(document.createElement("canvas"), {
		width: e.width,
		height: e.height
	})).getContext("2d", { willReadFrequently: !0 });
	if (!n) throw Error(`${t} cannot be read back to resample it.`);
	return n.drawImage(e, 0, 0), n.getImageData(0, 0, e.width, e.height).data;
}
function v(e, t) {
	return (e % t + t) % t;
}
function y(e, t, n, r, i, a, o) {
	let s = r * t - .5, c = i * n - .5, l = Math.floor(s), u = Math.floor(c), d = s - l, f = c - u;
	for (let r = 0; r < 4; r++) {
		let i = (i, a) => e[(v(a, n) * t + v(i, t)) * 4 + r], s = i(l, u) * (1 - d) + i(l + 1, u) * d, c = i(l, u + 1) * (1 - d) + i(l + 1, u + 1) * d;
		a[o + r] = Math.round(s * (1 - f) + c * f);
	}
}
function b(e, { linear: t }, n) {
	let [i, a, o, s] = t, c = Math.max(1, Math.round(Math.hypot(i * e.width, o * e.height))), l = Math.max(1, Math.round(Math.hypot(a * e.width, s * e.height))), u = Math.min(r * e.width * e.height, n), d = c * l > u;
	if (d) {
		let e = Math.sqrt(u / (c * l));
		c = Math.max(1, Math.floor(c * e)), l = Math.max(1, Math.floor(l * e));
	}
	return {
		width: c,
		height: l,
		capped: d
	};
}
function x(e, t, n, r) {
	if (e.isCompressedTexture || !e.image) throw Error(`${n} is a compressed texture and cannot be resampled to a shared KHR_texture_transform.`);
	let { image: i } = e, a = _(i, n), { width: o, height: s, capped: c } = b(i, t, r), [l, u, d, f] = t.linear, p = new Uint8Array(o * s * 4);
	for (let e = 0; e < s; e++) {
		let n = (e + .5) / s;
		for (let r = 0; r < o; r++) {
			let s = (r + .5) / o;
			y(a, i.width, i.height, l * s + u * n + t.offset[0], d * s + f * n + t.offset[1], p, (e * o + r) * 4);
		}
	}
	return {
		texture: {
			...e,
			image: {
				width: o,
				height: s,
				data: p
			}
		},
		from: [i.width, i.height],
		to: [o, s],
		capped: c
	};
}
function S(e, t, n, r) {
	let a = [], o = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Set();
	return e.scene.traverse((e) => {
		let l = e.isMesh ? e.material : null;
		if (!l || c.has(l) || !t.has(l.materialIndex)) return;
		c.add(l);
		let u = s(n.materials[l.materialIndex], l.materialIndex);
		for (let e of t.get(l.materialIndex)) {
			let t = i[e.property] ? l : l.layerTextures, n = i[e.property] ?? e.property, s = t?.[n];
			if (!s) continue;
			let c = `${e.linear}|${e.offset}`;
			o.has(s) || o.set(s, /* @__PURE__ */ new Map());
			let d = `${e.property} of ${u}`;
			if (!o.get(s).has(c)) {
				let t = x(s, e, d, r.maxTextureImagePixels);
				o.get(s).set(c, t.texture), a.push(`Resampled ${d} from ${t.from.join("x")} to ${t.to.join("x")} to share the UV transform of the other maps${t.capped ? " (capped at 4 times the source pixels or maxTextureImagePixels)" : ""}.`);
			}
			t[n] = o.get(s).get(c);
		}
	}), a;
}
export { g as planMapResampling };
