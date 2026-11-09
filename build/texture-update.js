/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e } from "./renderer-GTkED2u-.js";
import { g as t } from "./shader-registry-DHYkwAg5.js";
// src/texture-update.js
function n(e, t, n) {
	let { x: r, y: i, width: a, height: o, data: s } = e ?? {};
	for (let [e, t] of Object.entries({
		x: r,
		y: i,
		width: a,
		height: o
	})) if (!Number.isInteger(t)) throw TypeError(`updateTexture region.${e} must be an integer.`);
	if (r < 0 || i < 0 || a <= 0 || o <= 0 || r + a > t || i + o > n) throw RangeError(`updateTexture region ${a}x${o} at ${r},${i} does not fit the ${t}x${n} texture.`);
	if (!(s instanceof Uint8Array || s instanceof Uint8ClampedArray)) throw TypeError("updateTexture region.data must be a Uint8Array or Uint8ClampedArray of RGBA bytes.");
	let c = a * o * 4;
	if (s.length !== c) throw RangeError(`updateTexture region.data has ${s.length} bytes, expected ${c} (${a}x${o} RGBA).`);
}
function r(e, t, n) {
	return {
		x: e.x,
		y: n ? t - e.y - e.height : e.y
	};
}
function i(t, i, a) {
	let o = t.context;
	if (!i || !t.textures.has(i)) throw Error("updateTexture needs a descriptor this renderer already uploaded with a part or createTexture(descriptor).");
	if (i.image.compressed) throw Error("Compressed textures cannot be updated because their mip levels come from the file. Use an RGBA image.");
	let s = e(i, o.getParameter(o.MAX_TEXTURE_SIZE)), { image: c, region: l } = a;
	if (c && l) throw Error("updateTexture takes image or region, not both.");
	if (c && ((c.naturalWidth ?? c.width) !== s.width || (c.naturalHeight ?? c.height) !== s.height)) throw RangeError(`updateTexture image must be ${s.width}x${s.height} like the uploaded texture. Create a new renderer to change the size.`);
	l && n(l, s.width, s.height);
	let u = i.flipY ?? !1, d = o.getParameter(o.UNPACK_FLIP_Y_WEBGL), f = o.getParameter(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL), p = o.getParameter(o.UNPACK_COLORSPACE_CONVERSION_WEBGL), m = o.getParameter(o.TEXTURE_BINDING_2D);
	try {
		if (o.bindTexture(o.TEXTURE_2D, t.textures.get(i)), o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL, u), o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL, o.NONE), l) {
			let e = r(l, s.height, u);
			o.texSubImage2D(o.TEXTURE_2D, 0, e.x, e.y, l.width, l.height, o.RGBA, o.UNSIGNED_BYTE, l.data);
		} else o.texSubImage2D(o.TEXTURE_2D, 0, 0, 0, o.RGBA, o.UNSIGNED_BYTE, c ?? i.image);
		s.mipmaps && o.generateMipmap(o.TEXTURE_2D);
	} finally {
		o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL, d), o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL, f), o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL, p), o.bindTexture(o.TEXTURE_2D, m);
	}
}
t.update = i;
export { r as textureRegionOffset, i as updateRendererTexture, n as validateTextureRegion };
