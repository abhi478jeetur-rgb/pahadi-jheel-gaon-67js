/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { C as e } from "./mat4-BCZClxna.js";
// node_modules/gl-matrix/esm/mat3.js
function t() {
	var t = new e(9);
	return e != Float32Array && (t[1] = 0, t[2] = 0, t[3] = 0, t[5] = 0, t[6] = 0, t[7] = 0), t[0] = 1, t[4] = 1, t[8] = 1, t;
}
function n(e, t) {
	var n = t[0], r = t[1], i = t[2], a = t[3], o = n + n, s = r + r, c = i + i, l = n * o, u = r * o, d = r * s, f = i * o, p = i * s, m = i * c, h = a * o, g = a * s, _ = a * c;
	return e[0] = 1 - d - m, e[3] = u - _, e[6] = f + g, e[1] = u + _, e[4] = 1 - l - m, e[7] = p - h, e[2] = f - g, e[5] = p + h, e[8] = 1 - l - d, e;
}
function r(e, t) {
	var n = t[0], r = t[1], i = t[2], a = t[3], o = t[4], s = t[5], c = t[6], l = t[7], u = t[8], d = t[9], f = t[10], p = t[11], m = t[12], h = t[13], g = t[14], _ = t[15], v = n * s - r * o, y = n * c - i * o, b = n * l - a * o, x = r * c - i * s, S = r * l - a * s, C = i * l - a * c, w = u * h - d * m, T = u * g - f * m, E = u * _ - p * m, D = d * g - f * h, O = d * _ - p * h, k = f * _ - p * g, A = v * k - y * O + b * D + x * E - S * T + C * w;
	return A ? (A = 1 / A, e[0] = (s * k - c * O + l * D) * A, e[1] = (c * E - o * k - l * T) * A, e[2] = (o * O - s * E + l * w) * A, e[3] = (i * O - r * k - a * D) * A, e[4] = (n * k - i * E + a * T) * A, e[5] = (r * E - n * O - a * w) * A, e[6] = (h * C - g * S + _ * x) * A, e[7] = (g * b - m * C - _ * y) * A, e[8] = (m * S - h * b + _ * v) * A, e) : null;
}
export { n, r, t };
