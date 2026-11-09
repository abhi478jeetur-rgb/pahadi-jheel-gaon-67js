/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e } from "./renderer-GTkED2u-.js";
import { _ as t } from "./shader-registry-DHYkwAg5.js";
// src/replace-textured-parts.js
function n(e) {
	let t = e.mapState;
	return [
		...t.slice(0, 5),
		t[14],
		...Object.values(t[18] ?? {}),
		t[17]?.maskMap
	].filter(Boolean);
}
function r(t, n) {
	let r = 0;
	for (let i of new Set(n)) t.context.deleteTexture(t.textures.get(i)), t.textures.delete(i), r += e(i).bytes;
	return r;
}
t.begin = (t) => {
	let i = new Map(t.textures), a = () => [...t.textures.keys()].filter((e) => e && !i.has(e));
	return (i, o) => {
		if (!o) {
			r(t, a());
			return;
		}
		let s = new Set(o.flatMap(n)), c = i.flatMap(n).filter((e) => !s.has(e) && t.textures.has(e)), l = a().reduce((t, n) => t + e(n).bytes, 0);
		t.textureBytes += l - r(t, c);
	};
};
export { n as batchTextureDescriptors };
