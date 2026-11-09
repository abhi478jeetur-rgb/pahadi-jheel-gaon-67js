/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/texture-set.js
var e = Object.freeze([
	"color",
	"normal",
	"roughness",
	"height"
]), t = Object.freeze({
	color: "srgb",
	normal: "linear",
	roughness: "linear",
	height: "linear"
});
async function n(e) {
	let t = await fetch(e);
	if (!t.ok) throw Error(`Texture request failed with status ${t.status}: ${e}`);
	return t.blob();
}
function r(e) {
	return createImageBitmap(e, {
		premultiplyAlpha: "none",
		colorSpaceConversion: "none"
	});
}
function i(e, t) {
	return `${e.replace(/\/+$/, "")}/${t}`;
}
function a(t) {
	if (!Array.isArray(t) || t.length === 0) throw TypeError("channels must be a non-empty array.");
	for (let n of t) if (!e.includes(n)) throw RangeError(`Unknown texture channel: ${n}. Use ${e.join(", ")}.`);
}
async function o(o, { channels: s, extension: c = "webp", fetchBlob: l = n, decodeBlob: u = r, colorSpaces: d = {} } = {}) {
	if (typeof o != "string" || o.length === 0) throw TypeError("baseUrl must be a non-empty string.");
	let f = s !== void 0, p = s ?? e;
	a(p);
	let m = await Promise.all(p.map(async (e) => {
		try {
			return [e, {
				image: await u(await l(i(o, `${e}.${c}`))),
				colorSpace: d[e] ?? t[e]
			}];
		} catch (e) {
			if (f) throw e;
			return null;
		}
	})), h = Object.fromEntries(m.filter(Boolean));
	if (Object.keys(h).length === 0) throw Error(`No texture channels found under ${o}.`);
	return h;
}
var s = Object.freeze([
	"broadleaf",
	"birch",
	"bush",
	"conifer"
]), c = 33071;
async function l(e, { species: t = s, extension: a = "webp", fetchBlob: o = n, decodeBlob: l = r } = {}) {
	if (typeof e != "string" || e.length === 0) throw TypeError("baseUrl must be a non-empty string.");
	let u = [
		["color", "srgb"],
		["normal", "linear"],
		["crown", "srgb"]
	], d = await Promise.all(t.map(async (t) => {
		let n = await Promise.all(u.map(async ([n, r]) => [n, {
			image: await l(await o(i(e, `${t}/${n}.${a}`))),
			colorSpace: r,
			wrapS: c,
			wrapT: c
		}]));
		return [t, Object.fromEntries(n)];
	}));
	return Object.fromEntries(d);
}
export { s as LEAF_TEXTURE_SPECIES, e as TEXTURE_SET_CHANNELS, l as loadLeafTextures, o as loadTextureSet };
