/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e, t } from "./path-tracer-light-tree-BZYzVWXO.js";
import { a as n, c as r, i, n as a, o, r as s, s as c, t as l, u } from "./path-tracer-gpu-pack-B_ap1Af7.js";
import "./path-tracer-subsurface-Dyu5_MBA.js";
// src/path-tracer-webgpu-medium.js
var d = "\nvar<private> volumeSpan: vec2<f32>;\n\nfn clipAxis(origin: f32, axisDirection: f32, minimum: f32, maximum: f32, span: ptr<function, vec2<f32>>) -> bool {\n  if (axisDirection == 0.0) { return origin >= minimum && origin <= maximum; }\n  let first = (minimum - origin) / axisDirection;\n  let second = (maximum - origin) / axisDirection;\n  (*span).x = max((*span).x, min(first, second));\n  (*span).y = min((*span).y, max(first, second));\n  return true;\n}\n\nfn volumeInterval(origin: vec3<f32>, rayDirection: vec3<f32>, limit: f32) -> bool {\n  var span = vec2<f32>(0.0, min(limit, params.volumeAlbedoDistance.w));\n  let minimum = params.volumeMinimumDensity.xyz;\n  let maximum = params.volumeMaximumAnisotropy.xyz;\n  if (!clipAxis(origin.x, rayDirection.x, minimum.x, maximum.x, &span)) { return false; }\n  if (!clipAxis(origin.y, rayDirection.y, minimum.y, maximum.y, &span)) { return false; }\n  if (!clipAxis(origin.z, rayDirection.z, minimum.z, maximum.z, &span)) { return false; }\n  if (!(span.x < span.y)) { return false; }\n  volumeSpan = span;\n  return true;\n}\n\nfn henyeyGreensteinPhase(anisotropy: f32, cosine: f32) -> f32 {\n  let squared = anisotropy * anisotropy;\n  return (1.0 - squared) / (4.0 * PI * pow(1.0 + squared - 2.0 * anisotropy * cosine, 1.5));\n}\n\nfn sampleHenyeyGreensteinCosine(anisotropy: f32, unit: f32) -> f32 {\n  if (abs(anisotropy) < 1e-3) { return 1.0 - 2.0 * unit; }\n  let squared = anisotropy * anisotropy;\n  let ratio = (1.0 - squared) / (1.0 - anisotropy + 2.0 * anisotropy * unit);\n  return clamp((1.0 + squared - ratio * ratio) / (2.0 * anisotropy), -1.0, 1.0);\n}\n\nfn fogTransmittance(origin: vec3<f32>, distance: f32) -> f32 {\n  if (!volumeInterval(origin, lightDirection, distance)) { return 1.0; }\n  return exp(-params.volumeMinimumDensity.w * (volumeSpan.y - volumeSpan.x));\n}\n\n// Draws the next scattering event along the segment; when there is one it becomes hitPoint.\nfn scatterInFog(origin: vec3<f32>, segmentLength: f32) -> bool {\n  if (!volumeInterval(origin, direction, segmentLength)) { return false; }\n  let eventDistance = volumeSpan.x - log(1.0 - nextRandom()) / params.volumeMinimumDensity.w;\n  if (eventDistance >= volumeSpan.y) { return false; }\n  hitPoint = origin + direction * eventDistance;\n  return true;\n}\n", f = "\nconst WALK_STEPS: i32 = 32;\nconst WALK_EXIT: i32 = 0;\nconst WALK_THIN: i32 = 1;\nconst WALK_LOST: i32 = 2;\nconst SUBSURFACE_TEXELS: i32 = 2;\n\nvar<private> subsurfaceWeight: f32 = 0.0;\nvar<private> surfaceSubsurfaceChance: f32 = 0.0;\nvar<private> walkWeight: vec3<f32>;\nvar<private> walkDirection: vec3<f32>;\nvar<private> subsurfaceNormal: vec3<f32>;\n\nfn subsurfaceVector(material: i32, offset: i32) -> vec4<f32> {\n  return materials[i32(params.seedAndAtlas.z) + material * SUBSURFACE_TEXELS + offset];\n}\n\n// Moves the subsurface share of the diffuse lobe to the walk; returns the material's weight.\nfn splitSubsurface() -> f32 {\n  let weight = subsurfaceVector(hitMaterialIndex, 0).x;\n  surfaceSubsurfaceChance = surfaceDiffuseChance * weight;\n  surfaceDiffuseChance -= surfaceSubsurfaceChance;\n  surfaceDiffuse *= 1.0 - weight;\n  return weight;\n}\n\nfn singleScatterAlbedo(multipleScatterAlbedo: f32) -> f32 {\n  let albedo = clamp(multipleScatterAlbedo, 0.0, 1.0);\n  let root = sqrt(9.59217 + 41.6808 * albedo + 17.7126 * albedo * albedo);\n  let offset = 4.09712 + 4.20863 * albedo - root;\n  return clamp(1.0 - offset * offset, 0.0, 1.0);\n}\n\n// Walks inward from the entry point until the walk meets the part's own surface; leaves its throughput in walkWeight.\nfn randomWalk(point: vec3<f32>, normal: vec3<f32>, meanFreePath: vec3<f32>, color: vec3<f32>, material: i32) -> i32 {\n  let extinction = 1.0 / meanFreePath;\n  let albedo = vec3<f32>(singleScatterAlbedo(color.r), singleScatterAlbedo(color.g), singleScatterAlbedo(color.b));\n  var position = point - normal * params.environmentRotationAndRays.z;\n  let frame = buildFrame(normal);\n  let radius = sqrt(nextRandom());\n  let angle = TWO_PI * nextRandom();\n  let height = sqrt(max(0.0, 1.0 - radius * radius));\n  walkDirection = frame[0] * (radius * cos(angle)) + frame[1] * (radius * sin(angle)) - normal * height;\n  for (var scatters = 0; scatters <= WALK_STEPS; scatters++) {\n    let found = intersectScene(position, walkDirection);\n    if (!found || hitMaterialIndex != material) { return select(WALK_LOST, WALK_THIN, scatters == 0); }\n    // One channel draws the distance; weighting by the mean density over the three channels keeps every channel unbiased.\n    let hero = min(2, i32(floor(nextRandom() * 3.0)));\n    let distance = -log(1.0 - nextRandom()) / extinction[hero];\n    if (distance >= hitDistance) {\n      let attenuation = exp(-extinction * hitDistance);\n      let survival = (attenuation.x + attenuation.y + attenuation.z) / 3.0;\n      if (!(survival > 0.0)) { return WALK_LOST; }\n      walkWeight *= attenuation / survival;\n      return WALK_EXIT;\n    }\n    if (scatters == WALK_STEPS) { return WALK_LOST; }\n    let falloff = exp(-extinction * distance);\n    let scatterDensity = extinction * falloff;\n    let density = (scatterDensity.x + scatterDensity.y + scatterDensity.z) / 3.0;\n    if (!(density > 0.0)) { return WALK_LOST; }\n    walkWeight *= albedo * scatterDensity / density;\n    position += walkDirection * distance;\n    let up = 2.0 * nextRandom() - 1.0;\n    let azimuth = TWO_PI * nextRandom();\n    let ring = sqrt(max(0.0, 1.0 - up * up));\n    walkDirection = vec3<f32>(ring * cos(azimuth), up, ring * sin(azimuth));\n  }\n  return WALK_LOST;\n}\n\n// Sends the diffuse light of the hit through its walk. On success the path stands where the walk left, subsurfaceNormal\n// faces out of that point, the surface is white diffuse there with its lights added, and the throughput carries the walk.\n// False when the walk ended inside the part.\nfn enterSubsurface(depth: i32, entryNormal: vec3<f32>) -> bool {\n  let block = subsurfaceVector(hitMaterialIndex, 0);\n  let colorBlock = subsurfaceVector(hitMaterialIndex, 1);\n  let color = select(colorBlock.rgb, hitColor, colorBlock.x < 0.0);\n  let material = hitMaterialIndex;\n  let entryPoint = hitPoint;\n  let entryMask = hitMask;\n  let entryScale = surfaceDiffuseShare * block.x / surfaceSubsurfaceChance;\n  walkWeight = vec3<f32>(1.0);\n  subsurfaceNormal = entryNormal;\n  let outcome = randomWalk(entryPoint, entryNormal, block.yzw, color, material);\n  if (outcome == WALK_LOST) { return false; }\n  if (outcome == WALK_EXIT) {\n    subsurfaceNormal = hitNormal * select(1.0, -1.0, dot(hitNormal, walkDirection) < 0.0);\n    throughput *= walkWeight * entryScale;\n  } else {\n    // A card: half of the colour is reflected on the side the ray came from and half is transmitted diffusely through it.\n    hitPoint = entryPoint;\n    hitMask = entryMask;\n    if (nextRandom() < 0.5) { subsurfaceNormal = -entryNormal; }\n    throughput *= color * entryScale;\n  }\n  surfaceFrame = buildFrame(subsurfaceNormal);\n  surfaceDiffuse = vec3<f32>(1.0);\n  surfaceDiffuseChance = 1.0;\n  surfaceSubsurfaceChance = 0.0;\n  surfaceSpecularChance = 0.0;\n  surfaceCoatChance = 0.0;\n  surfaceCoatWeight = 0.0;\n  addLights(depth, subsurfaceNormal);\n  return true;\n}\n", p = ({ hasVolume: e = !1 } = {}) => `
const PI: f32 = 3.14159265358979;
const TWO_PI: f32 = 6.28318530717959;
const TRIANGLE_TEXELS: i32 = 9;
const MATERIAL_TEXELS: i32 = 10;
const LIGHT_TEXELS: i32 = 6;
const STACK_SIZE: i32 = 128;
const ALPHA_STEP_LIMIT: i32 = 64;
const RUSSIAN_ROULETTE_START: i32 = 3;
const MINIMUM_ALPHA: f32 = 1e-3;
const MIRROR_ALPHA: f32 = 2e-3;
const DIELECTRIC_COAT_REFLECTANCE: f32 = 0.04;

struct Params {
  eye: vec4<f32>,
  forward: vec4<f32>,
  right: vec4<f32>,
  above: vec4<f32>,
  sunDirection: vec4<f32>,
  sunColorAndCosine: vec4<f32>,
  environmentShape: vec4<f32>,
  environmentRotationAndRays: vec4<f32>,
  cameraAndClamp: vec4<f32>,
  sizeBouncesLights: vec4<i32>,
  emittersFlagsSample: vec4<i32>,
  seedAndAtlas: vec4<u32>,
  tileAndDepth: vec4<u32>,
  shadowSlots: vec4<u32>,
  volumeMinimumDensity: vec4<f32>,
  volumeMaximumAnisotropy: vec4<f32>,
  volumeAlbedoDistance: vec4<f32>,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> nodes: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> triangles: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> materials: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> lights: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read> atlas: array<u32>;
@group(0) @binding(6) var<storage, read> environmentColors: array<vec4<f32>>;
@group(0) @binding(7) var<storage, read> environmentTables: array<f32>;
// Four planes of pixelCount vec4 each: radiance and depth, albedo, normal, luminance statistics.
@group(0) @binding(8) var<storage, read_write> accumulation: array<vec4<f32>>;

var<private> rngState: u32 = 1u;

fn resetRandom(pixel: u32, sampleIndex: u32, seed: u32) {
  var mixed = ((pixel + 0x9e3779b9u) * 0x85ebca6bu) ^ ((sampleIndex + 0x7f4a7c15u) * 0xc2b2ae35u) ^ ((seed + 0x165667b1u) * 0x27d4eb2fu);
  mixed = (mixed ^ (mixed >> 15u)) * 0x2c1b3c6du;
  mixed = (mixed ^ (mixed >> 12u)) * 0x297a2d39u;
  mixed ^= mixed >> 15u;
  rngState = select(mixed, 1u, mixed == 0u);
}

fn nextRandom() -> f32 {
  rngState = rngState * 747796405u + 2891336453u;
  var word = ((rngState >> ((rngState >> 28u) + 4u)) ^ rngState) * 277803737u;
  word = (word >> 22u) ^ word;
  return f32(word >> 8u) / 16777216.0;
}

fn hashJitter(pixel: u32, sampleIndex: u32, seed: u32, dimension: u32) -> f32 {
  var mixed = ((pixel ^ 0x51ed270bu) * 0x9e3779b1u) ^ ((sampleIndex + dimension * 0x632be5abu) * 0x85ebca6bu) ^ ((seed + 0x1b873593u) * 0xc2b2ae35u);
  mixed = (mixed ^ (mixed >> 16u)) * 0x7feb352du;
  mixed = (mixed ^ (mixed >> 15u)) * 0x846ca68bu;
  mixed ^= mixed >> 16u;
  return f32(mixed >> 8u) / 16777216.0;
}

fn luminance(color: vec3<f32>) -> f32 {
  return dot(color, vec3<f32>(0.2126, 0.7152, 0.0722));
}

// ---- Ray queries ----

var<private> nearestDistance: f32;
var<private> nearestSlot: i32;
var<private> nearestU: f32;
var<private> nearestV: f32;
var<private> nodeStack: array<i32, 128>;
var<private> entryStack: array<f32, 128>;

fn safeInverseComponent(component: f32) -> f32 {
  if (abs(component) > 1e-20) { return 1.0 / component; }
  return select(1e20, -1e20, component < 0.0);
}

fn safeInverse(direction: vec3<f32>) -> vec3<f32> {
  return vec3<f32>(safeInverseComponent(direction.x), safeInverseComponent(direction.y), safeInverseComponent(direction.z));
}

fn boxEntry(node: i32, origin: vec3<f32>, inverse: vec3<f32>) -> f32 {
  let low = nodes[node * 2];
  let high = nodes[node * 2 + 1];
  let first = (low.xyz - origin) * inverse;
  let second = (high.xyz - origin) * inverse;
  let nearest = min(first, second);
  let farthest = max(first, second);
  let entry = max(max(max(nearest.x, nearest.y), nearest.z), 0.0);
  let exitDistance = min(min(farthest.x, farthest.y), farthest.z);
  return select(1e30, entry, entry <= exitDistance * (1.0 + 1e-6) + 1e-6);
}

fn visitLeaf(node: i32, origin: vec3<f32>, direction: vec3<f32>, anyHit: bool) -> bool {
  let range = nodes[node * 2 + 1];
  let header = nodes[node * 2];
  let start = i32(range.w);
  let end = start + i32(-header.w);
  for (var slot = start; slot < end; slot++) {
    let base = slot * TRIANGLE_TEXELS;
    let corner = triangles[base].xyz;
    let edgeFirst = triangles[base + 1].xyz;
    let edgeSecond = triangles[base + 2].xyz;
    let pivot = cross(direction, edgeSecond);
    let determinant = dot(edgeFirst, pivot);
    if (determinant == 0.0) { continue; }
    let offset = origin - corner;
    let firstWeight = dot(offset, pivot) / determinant;
    if (firstWeight < 0.0 || firstWeight > 1.0) { continue; }
    let query = cross(offset, edgeFirst);
    let secondWeight = dot(direction, query) / determinant;
    if (secondWeight < 0.0 || firstWeight + secondWeight > 1.0) { continue; }
    let distance = dot(edgeSecond, query) / determinant;
    if (distance < 0.0 || distance >= nearestDistance) { continue; }
    nearestDistance = distance;
    nearestSlot = slot;
    nearestU = firstWeight;
    nearestV = secondWeight;
    if (anyHit) { return true; }
  }
  return false;
}

fn traceRay(origin: vec3<f32>, direction: vec3<f32>, limit: f32, anyHit: bool) {
  nearestDistance = limit;
  nearestSlot = -1;
  let inverse = safeInverse(direction);
  var stackSize = 1;
  nodeStack[0] = 0;
  entryStack[0] = 0.0;
  while (stackSize > 0) {
    stackSize--;
    let node = nodeStack[stackSize];
    if (!(entryStack[stackSize] < nearestDistance)) { continue; }
    let header = nodes[node * 2];
    if (header.w < 0.0) {
      if (visitLeaf(node, origin, direction, anyHit)) { return; }
      continue;
    }
    let left = node + 1;
    let right = i32(header.w);
    let leftEntry = boxEntry(left, origin, inverse);
    let rightEntry = boxEntry(right, origin, inverse);
    let nearFirst = leftEntry <= rightEntry;
    nodeStack[stackSize] = select(left, right, nearFirst);
    entryStack[stackSize] = select(leftEntry, rightEntry, nearFirst);
    nodeStack[stackSize + 1] = select(right, left, nearFirst);
    entryStack[stackSize + 1] = select(rightEntry, leftEntry, nearFirst);
    stackSize += 2;
  }
}

// ---- Hits ----

var<private> hitDistance: f32;
var<private> hitPoint: vec3<f32>;
var<private> hitNormal: vec3<f32>;
var<private> hitColor: vec3<f32>;
var<private> hitEmission: vec3<f32>;
var<private> hitMetallic: f32;
var<private> hitRoughness: f32;
var<private> hitClearcoat: f32;
var<private> hitClearcoatRoughness: f32;
var<private> hitTransmission: f32;
var<private> hitIor: f32;
var<private> hitCutoff: f32;
var<private> hitMask: u32;
var<private> hitMaterialIndex: i32;

fn srgbToLinear(encoded: vec3<f32>) -> vec3<f32> {
  return select(pow((encoded + 0.055) / 1.055, vec3<f32>(2.4)), encoded / 12.92, encoded <= vec3<f32>(0.04045));
}

fn atlasTexel(x: i32, y: i32) -> vec4<f32> {
  return unpack4x8unorm(atlas[u32(y) * params.seedAndAtlas.y + u32(x)]);
}

fn sampleAtlas(rectangle: vec4<f32>, flags: f32, uv: vec2<f32>) -> vec4<f32> {
  if (rectangle.z <= 0.0) { return vec4<f32>(1.0); }
  let width = i32(rectangle.z);
  let height = i32(rectangle.w);
  let repeat = (flags % 2.0) >= 1.0;
  let encoded = flags >= 2.0;
  let x = uv.x * rectangle.z - 0.5;
  let y = uv.y * rectangle.w - 0.5;
  let left = floor(x);
  let top = floor(y);
  let shareX = x - left;
  let shareY = y - top;
  var total = vec4<f32>(0.0);
  for (var corner = 0; corner < 4; corner++) {
    var column = i32(left) + (corner & 1);
    var row = i32(top) + (corner >> 1u);
    if (repeat) {
      column = ((column % width) + width) % width;
      row = ((row % height) + height) % height;
    } else {
      column = clamp(column, 0, width - 1);
      row = clamp(row, 0, height - 1);
    }
    let weight = select(1.0 - shareX, shareX, (corner & 1) == 1) * select(1.0 - shareY, shareY, (corner >> 1u) == 1);
    let texel = atlasTexel(i32(rectangle.x) + column, i32(rectangle.y) + row);
    let color = select(texel.rgb, srgbToLinear(texel.rgb), encoded);
    total += weight * vec4<f32>(color, texel.a);
  }
  return total;
}

fn applyNormalMap(rectangle: vec4<f32>, flags: f32, scale: vec2<f32>, edgeOne: vec3<f32>, edgeTwo: vec3<f32>, uvOne: vec2<f32>, uvTwo: vec2<f32>, uv: vec2<f32>) {
  let determinant = uvOne.x * uvTwo.y - uvTwo.x * uvOne.y;
  if (abs(determinant) < 1e-12) { return; }
  let normal = hitNormal;
  var tangent = (edgeOne * uvTwo.y - edgeTwo * uvOne.y) / determinant;
  let bitangent = (edgeTwo * uvOne.x - edgeOne * uvTwo.x) / determinant;
  tangent -= normal * dot(tangent, normal);
  let tangentLength = length(tangent);
  if (tangentLength == 0.0) { return; }
  tangent /= tangentLength;
  var across = cross(normal, tangent);
  var acrossLength = length(across);
  if (acrossLength == 0.0) { acrossLength = 1.0; }
  let handedness = select(1.0, -1.0, dot(across, bitangent) < 0.0);
  across *= handedness / acrossLength;
  let texel = sampleAtlas(rectangle, flags, uv).rgb;
  let sideways = (texel.x * 2.0 - 1.0) * scale.x;
  let forwards = (texel.y * 2.0 - 1.0) * scale.y;
  let outwards = texel.z * 2.0 - 1.0;
  let mapped = tangent * sideways + across * forwards + normal * outwards;
  let mappedLength = length(mapped);
  if (!(mappedLength > 1e-6)) { return; }
  hitNormal = mapped / mappedLength;
}

// Fills the hit globals from the triangle in nearestSlot; returns the alpha of the colour map.
fn fillHit(origin: vec3<f32>, direction: vec3<f32>, distance: f32) -> f32 {
  let base = nearestSlot * TRIANGLE_TEXELS;
  let cornerData = triangles[base];
  let edgeOne = triangles[base + 1].xyz;
  let edgeTwo = triangles[base + 2].xyz;
  let normalOneData = triangles[base + 3];
  let normalTwoData = triangles[base + 4];
  let normalThreeData = triangles[base + 5];
  let colorOneData = triangles[base + 6];
  let colorTwoData = triangles[base + 7];
  let colorThreeData = triangles[base + 8];
  let secondWeight = nearestU;
  let thirdWeight = nearestV;
  let firstWeight = 1.0 - secondWeight - thirdWeight;
  hitDistance = distance;
  hitPoint = origin + direction * distance;
  let normal = firstWeight * normalOneData.xyz + secondWeight * normalTwoData.xyz + thirdWeight * normalThreeData.xyz;
  let normalLength = length(normal);
  hitNormal = normal / select(normalLength, 1.0, normalLength == 0.0);
  let vertexColor = firstWeight * colorOneData.xyz + secondWeight * colorTwoData.xyz + thirdWeight * colorThreeData.xyz;
  let uv = firstWeight * vec2<f32>(normalOneData.w, colorOneData.w) + secondWeight * vec2<f32>(normalTwoData.w, colorTwoData.w) + thirdWeight * vec2<f32>(normalThreeData.w, colorThreeData.w);
  hitMaterialIndex = i32(cornerData.w);
  let material = hitMaterialIndex * MATERIAL_TEXELS;
  let colorMetallic = materials[material];
  let emissionRoughness = materials[material + 1];
  let coating = materials[material + 2];
  let shape = materials[material + 3];
  let flagsOne = materials[material + 4];
  let flagsTwo = materials[material + 5];
  hitColor = colorMetallic.rgb * vertexColor;
  hitEmission = emissionRoughness.rgb;
  hitMetallic = colorMetallic.w;
  hitRoughness = emissionRoughness.w;
  hitClearcoat = coating.x;
  hitClearcoatRoughness = coating.y;
  hitTransmission = coating.z;
  hitIor = coating.w;
  hitCutoff = shape.z;
  hitMask = u32(shape.w) | (u32(flagsOne.x) << 16u);
  var alpha = 1.0;
  let mapRectangle = materials[material + 6];
  if (mapRectangle.z > 0.0) {
    let texel = sampleAtlas(mapRectangle, flagsOne.y, uv);
    hitColor *= texel.rgb;
    alpha = texel.a;
  }
  let emissiveRectangle = materials[material + 9];
  if (emissiveRectangle.z > 0.0) { hitEmission *= sampleAtlas(emissiveRectangle, flagsTwo.x, uv).rgb; }
  let surfaceRectangle = materials[material + 8];
  if (surfaceRectangle.z > 0.0) {
    let texel = sampleAtlas(surfaceRectangle, flagsOne.w, uv);
    hitRoughness *= texel.g;
    hitMetallic *= texel.b;
  }
  let normalRectangle = materials[material + 7];
  if (normalRectangle.z > 0.0) {
    let uvOne = vec2<f32>(normalTwoData.w - normalOneData.w, colorTwoData.w - colorOneData.w);
    let uvTwo = vec2<f32>(normalThreeData.w - normalOneData.w, colorThreeData.w - colorOneData.w);
    applyNormalMap(normalRectangle, flagsOne.z, shape.xy, edgeOne, edgeTwo, uvOne, uvTwo, uv);
  }
  return alpha;
}

// The nearest solid hit, stepping through the transparent texels of cutout materials.
fn intersectScene(origin: vec3<f32>, direction: vec3<f32>) -> bool {
  var start = origin;
  var travelled = 0.0;
  let farDistance = params.environmentRotationAndRays.w;
  let surfaceOffset = params.environmentRotationAndRays.z;
  for (var attempt = 0; attempt < ALPHA_STEP_LIMIT; attempt++) {
    traceRay(start, direction, farDistance, false);
    if (nearestSlot < 0) { return false; }
    let foundDistance = nearestDistance;
    let alpha = fillHit(start, direction, foundDistance);
    if (hitCutoff == 0.0 || alpha >= hitCutoff) {
      hitDistance += travelled;
      return true;
    }
    let advance = foundDistance + surfaceOffset;
    travelled += advance;
    start += direction * advance;
  }
  return false;
}

// The alpha of the colour map at the nearest hit, without touching the hit globals a shadow ray must not disturb.
fn alphaAtNearestHit() -> f32 {
  let base = nearestSlot * TRIANGLE_TEXELS;
  let secondWeight = nearestU;
  let thirdWeight = nearestV;
  let firstWeight = 1.0 - secondWeight - thirdWeight;
  let first = triangles[base + 3];
  let second = triangles[base + 4];
  let third = triangles[base + 5];
  let uv = firstWeight * vec2<f32>(first.w, triangles[base + 6].w) + secondWeight * vec2<f32>(second.w, triangles[base + 7].w) + thirdWeight * vec2<f32>(third.w, triangles[base + 8].w);
  let material = i32(triangles[base].w) * MATERIAL_TEXELS;
  let mapRectangle = materials[material + 6];
  if (mapRectangle.z <= 0.0) { return 1.0; }
  return sampleAtlas(mapRectangle, materials[material + 4].y, uv).a;
}

fn occluded(origin: vec3<f32>, direction: vec3<f32>, limit: f32) -> bool {
  var start = origin;
  var remaining = limit;
  let surfaceOffset = params.environmentRotationAndRays.z;
  // A solid any-hit shadows the point wherever it lies; a transparent one hides what sits before it, so retrace for nearest hits.
  var anyHit = true;
  for (var attempt = 0; attempt < ALPHA_STEP_LIMIT; attempt++) {
    traceRay(start, direction, remaining, anyHit);
    if (nearestSlot < 0) { return false; }
    let material = i32(triangles[nearestSlot * TRIANGLE_TEXELS].w) * MATERIAL_TEXELS;
    let cutoff = materials[material + 3].z;
    if (cutoff == 0.0) { return true; }
    if (alphaAtNearestHit() >= cutoff) { return true; }
    if (anyHit) {
      anyHit = false;
      continue;
    }
    let advance = nearestDistance + surfaceOffset;
    remaining -= advance;
    if (remaining <= 0.0) { return false; }
    start += direction * advance;
  }
  return true;
}

// ---- Frames ----

fn buildFrame(normal: vec3<f32>) -> mat3x3<f32> {
  let helperIsX = abs(normal.x) < 0.9;
  let helperX = select(0.0, 1.0, helperIsX);
  let helperY = select(1.0, 0.0, helperIsX);
  let tangent = normalize(vec3<f32>(-normal.z * helperY, normal.z * helperX, normal.x * helperY - normal.y * helperX));
  return mat3x3<f32>(tangent, cross(normal, tangent), normal);
}

fn localToWorld(frame: mat3x3<f32>, local: vec3<f32>) -> vec3<f32> {
  return frame * local;
}

fn worldToLocal(frame: mat3x3<f32>, world: vec3<f32>) -> vec3<f32> {
  return transpose(frame) * world;
}

// ---- Environment map ----

fn environmentRadiance(direction: vec3<f32>) -> vec3<f32> {
  let width = params.environmentShape.x;
  let height = params.environmentShape.y;
  let cosine = params.environmentRotationAndRays.x;
  let sine = params.environmentRotationAndRays.y;
  let mapX = cosine * direction.x - sine * direction.z;
  let mapZ = sine * direction.x + cosine * direction.z;
  let column = (atan2(mapX, -mapZ) / TWO_PI + 0.5) * width - 0.5;
  let row = acos(clamp(direction.y, -1.0, 1.0)) / PI * height - 0.5;
  let left = floor(column);
  let top = floor(row);
  let shareX = column - left;
  let shareY = row - top;
  let columns = i32(width);
  let rows = i32(height);
  var total = vec3<f32>(0.0);
  for (var corner = 0; corner < 4; corner++) {
    let cornerColumn = ((i32(left) + (corner & 1)) % columns + columns) % columns;
    let cornerRow = clamp(i32(top) + (corner >> 1u), 0, rows - 1);
    let weight = select(1.0 - shareX, shareX, (corner & 1) == 1) * select(1.0 - shareY, shareY, (corner >> 1u) == 1);
    total += weight * environmentColors[cornerRow * columns + cornerColumn].rgb * params.environmentShape.z;
  }
  return total;
}

fn environmentPdf(direction: vec3<f32>) -> f32 {
  let width = params.environmentShape.x;
  let height = params.environmentShape.y;
  let cosine = params.environmentRotationAndRays.x;
  let sine = params.environmentRotationAndRays.y;
  let mapX = cosine * direction.x - sine * direction.z;
  let mapZ = sine * direction.x + cosine * direction.z;
  let column = min(i32(width) - 1, i32(floor((atan2(mapX, -mapZ) / TWO_PI + 0.5) * width)));
  let polar = acos(clamp(direction.y, -1.0, 1.0));
  let row = min(i32(height) - 1, i32(floor(polar / PI * height)));
  let sinePolar = max(sin(polar), 1e-6);
  let rowWeight = sin(PI * (f32(row) + 0.5) / height);
  let texel = environmentColors[row * i32(width) + column].rgb;
  let weight = (luminance(texel) + 1e-6) * rowWeight;
  return weight / params.environmentShape.w * width * height / (TWO_PI * PI * sinePolar);
}

// The cumulative row table sits first in environmentTables, the per-pixel tables follow it.
fn firstIndexAbove(tableOffset: i32, start: i32, end: i32, threshold: f32) -> i32 {
  var low = start;
  var high = end - 1;
  for (var step = 0; step < 24; step++) {
    if (low >= high) { break; }
    let middle = (low + high) >> 1u;
    if (environmentTables[tableOffset + middle] < threshold) { low = middle + 1; } else { high = middle; }
  }
  return low;
}

var<private> sampledDirection: vec3<f32>;

// Draws a direction in proportion to the map's light into sampledDirection; returns its pdf.
fn sampleEnvironment(rowUnit: f32, columnUnit: f32, columnJitter: f32, rowJitter: f32) -> f32 {
  let width = i32(params.environmentShape.x);
  let height = i32(params.environmentShape.y);
  let row = firstIndexAbove(0, 0, height, rowUnit);
  let rowBase = row * width;
  let column = firstIndexAbove(height, rowBase, rowBase + width, columnUnit) - rowBase;
  let polar = PI * (f32(row) + rowJitter) / f32(height);
  let azimuth = ((f32(column) + columnJitter) / f32(width) - 0.5) * TWO_PI;
  let sinePolar = sin(polar);
  let mapX = sinePolar * sin(azimuth);
  let mapZ = -sinePolar * cos(azimuth);
  let cosine = params.environmentRotationAndRays.x;
  let sine = params.environmentRotationAndRays.y;
  sampledDirection = vec3<f32>(cosine * mapX + sine * mapZ, cos(polar), -sine * mapX + cosine * mapZ);
  return environmentPdf(sampledDirection);
}

// ---- Microfacet pieces ----

fn ggxDistribution(alpha: f32, cosineHalf: f32) -> f32 {
  let alphaSquared = alpha * alpha;
  let denominator = cosineHalf * cosineHalf * (alphaSquared - 1.0) + 1.0;
  return alphaSquared / (PI * denominator * denominator);
}

fn smithMasking(alpha: f32, cosine: f32) -> f32 {
  let alphaSquared = alpha * alpha;
  return 2.0 * cosine / (cosine + sqrt(alphaSquared + (1.0 - alphaSquared) * cosine * cosine));
}

fn schlick(reflectanceAtNormal: f32, cosine: f32) -> f32 {
  let weight = pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);
  return reflectanceAtNormal + (1.0 - reflectanceAtNormal) * weight;
}

fn schlickColor(reflectanceAtNormal: vec3<f32>, cosine: f32) -> vec3<f32> {
  let weight = pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);
  return reflectanceAtNormal + (1.0 - reflectanceAtNormal) * weight;
}

fn sampleVisibleNormal(view: vec3<f32>, alpha: f32, firstUnit: f32, secondUnit: f32) -> vec3<f32> {
  var stretched = vec3<f32>(alpha * view.x, alpha * view.y, view.z);
  let stretchedLength = length(stretched);
  stretched /= stretchedLength;
  let heightAxis = stretched.z;
  let planeLength = length(stretched.xy);
  let planeDirection = select(vec2<f32>(0.0), stretched.xy / planeLength, planeLength > 0.0);
  let tangent = select(vec2<f32>(1.0, 0.0), vec2<f32>(-stretched.y, stretched.x) / planeLength, planeLength > 0.0);
  let bitangentXY = -heightAxis * planeDirection;
  let bitangentZ = planeLength;
  let radius = sqrt(firstUnit);
  let angle = TWO_PI * secondUnit;
  let diskX = radius * cos(angle);
  var diskY = radius * sin(angle);
  let blend = 0.5 * (1.0 + heightAxis);
  diskY = (1.0 - blend) * sqrt(1.0 - diskX * diskX) + blend * diskY;
  let lift = sqrt(max(0.0, 1.0 - diskX * diskX - diskY * diskY));
  let normalXY = diskX * tangent + diskY * bitangentXY + lift * stretched.xy;
  let normalZ = diskY * bitangentZ + lift * heightAxis;
  let unstretched = vec3<f32>(alpha * normalXY.x, alpha * normalXY.y, max(0.0, normalZ));
  return unstretched / length(unstretched);
}

fn roughnessToAlpha(roughness: f32) -> f32 {
  return max(roughness * roughness, MINIMUM_ALPHA);
}

// ---- The layered surface ----

var<private> surfaceFrame: mat3x3<f32>;
var<private> surfaceView: vec3<f32>;
var<private> surfaceViewCosine: f32;
var<private> surfaceDiffuse: vec3<f32>;
var<private> surfaceSpecularNormal: vec3<f32>;
var<private> surfaceSpecularWeight: f32;
var<private> surfaceSpecularAlpha: f32;
var<private> surfaceCoatWeight: f32;
var<private> surfaceCoatChance: f32;
var<private> surfaceSampledCoat: bool;
var<private> surfaceCoatAlpha: f32;
var<private> surfaceDiffuseChance: f32;
var<private> surfaceDiffuseShare: f32;
var<private> surfaceSpecularChance: f32;
var<private> surfaceValue: vec3<f32>;
var<private> surfacePdf: f32;

fn dielectricSpecularAlbedo(normalReflectance: f32, roughness: f32, viewCosine: f32) -> f32 {
  let smoothness = 1.0 - roughness;
  let slope = min(smoothness * smoothness, exp2(-9.28 * viewCosine)) * smoothness + (0.0425 - 0.0275 * roughness);
  let scale = 1.04 - 0.572 * roughness - 1.04 * slope;
  let offset = 1.04 * slope + 0.022 * roughness - 0.04;
  return clamp(normalReflectance * scale + offset, 0.0, 1.0);
}

fn prepareSurface(normal: vec3<f32>, view: vec3<f32>) {
  surfaceFrame = buildFrame(normal);
  surfaceView = view;
  let viewCosine = max(dot(normal, view), 1e-4);
  surfaceViewCosine = viewCosine;
  let ratio = (hitIor - 1.0) / (hitIor + 1.0);
  let dielectricNormalReflectance = ratio * ratio;
  let dielectricFresnel = dielectricSpecularAlbedo(dielectricNormalReflectance, hitRoughness, viewCosine);
  surfaceCoatWeight = select(0.0, hitClearcoat * schlick(DIELECTRIC_COAT_REFLECTANCE, viewCosine), hitClearcoat > 0.0);
  let underCoat = 1.0 - surfaceCoatWeight;
  let diffuseShare = (1.0 - hitMetallic) * (1.0 - dielectricFresnel) * underCoat;
  surfaceDiffuse = hitColor * diffuseShare;
  surfaceDiffuseShare = diffuseShare;
  surfaceSpecularNormal = vec3<f32>(dielectricNormalReflectance * (1.0 - hitMetallic)) + hitColor * hitMetallic;
  let specularLuminance = luminance(surfaceSpecularNormal);
  surfaceSpecularWeight = underCoat;
  surfaceSpecularAlpha = roughnessToAlpha(hitRoughness);
  surfaceCoatAlpha = roughnessToAlpha(hitClearcoatRoughness);
  let diffuseLuminance = luminance(surfaceDiffuse);
  let specularChance = schlick(specularLuminance, viewCosine) * underCoat;
  let coatChance = surfaceCoatWeight;
  let sum = diffuseLuminance + specularChance + coatChance;
  surfaceDiffuseChance = select(1.0, diffuseLuminance / sum, sum > 0.0);
  surfaceSpecularChance = select(0.0, specularChance / sum, sum > 0.0);
  surfaceCoatChance = select(0.0, coatChance / sum, sum > 0.0);
}

fn microfacetTerm(alpha: f32, viewCosine: f32, lightCosine: f32, halfCosine: f32) -> f32 {
  return ggxDistribution(alpha, halfCosine) * smithMasking(alpha, viewCosine) * smithMasking(alpha, lightCosine) / (4.0 * viewCosine * lightCosine);
}

fn evaluateSurface(lightDirection: vec3<f32>) {
  surfaceValue = vec3<f32>(0.0);
  surfacePdf = 0.0;
  let normal = surfaceFrame[2];
  let lightCosine = dot(normal, lightDirection);
  if (lightCosine <= 0.0) { return; }
  var halfVector = surfaceView + lightDirection;
  let halfLength = length(halfVector);
  halfVector /= select(halfLength, 1.0, halfLength == 0.0);
  let halfCosine = dot(normal, halfVector);
  let viewHalfCosine = max(dot(surfaceView, halfVector), 0.0);
  let viewCosine = surfaceViewCosine;
  surfacePdf += surfaceDiffuseChance * lightCosine / PI;
  surfaceValue += surfaceDiffuse / PI;
  if (surfaceSpecularChance > 0.0 && surfaceSpecularAlpha > MIRROR_ALPHA) {
    let alpha = surfaceSpecularAlpha;
    let term = microfacetTerm(alpha, viewCosine, lightCosine, halfCosine) * surfaceSpecularWeight;
    surfaceValue += schlickColor(surfaceSpecularNormal, viewHalfCosine) * term;
    surfacePdf += surfaceSpecularChance * smithMasking(alpha, viewCosine) * ggxDistribution(alpha, halfCosine) / (4.0 * viewCosine);
  }
  if (surfaceCoatChance > 0.0 && surfaceCoatAlpha > MIRROR_ALPHA) {
    let alpha = surfaceCoatAlpha;
    let reflectance = schlick(DIELECTRIC_COAT_REFLECTANCE, viewHalfCosine) * microfacetTerm(alpha, viewCosine, lightCosine, halfCosine) * (surfaceCoatWeight / max(schlick(DIELECTRIC_COAT_REFLECTANCE, viewCosine), 1e-6));
    surfaceValue += vec3<f32>(reflectance);
    surfacePdf += surfaceCoatChance * smithMasking(alpha, viewCosine) * ggxDistribution(alpha, halfCosine) / (4.0 * viewCosine);
  }
}

// The next direction of a path goes into sampledDirection; returns true for a mirror lobe, which is followed exactly.
fn sampleSurface(lobeUnit: f32, firstUnit: f32, secondUnit: f32) -> bool {
  if (lobeUnit < surfaceDiffuseChance) {
    let radius = sqrt(firstUnit);
    let angle = TWO_PI * secondUnit;
    sampledDirection = localToWorld(surfaceFrame, vec3<f32>(radius * cos(angle), radius * sin(angle), sqrt(max(0.0, 1.0 - firstUnit))));
    return false;
  }
  let isCoat = lobeUnit >= surfaceDiffuseChance + surfaceSpecularChance;
  surfaceSampledCoat = isCoat;
  let alpha = select(surfaceSpecularAlpha, surfaceCoatAlpha, isCoat);
  let localView = worldToLocal(surfaceFrame, surfaceView);
  if (alpha <= MIRROR_ALPHA) {
    sampledDirection = 2.0 * surfaceViewCosine * surfaceFrame[2] - surfaceView;
    return true;
  }
  let localHalf = sampleVisibleNormal(localView, alpha, firstUnit, secondUnit);
  let localLight = 2.0 * dot(localView, localHalf) * localHalf - localView;
  sampledDirection = localToWorld(surfaceFrame, localLight);
  return false;
}

fn mirrorWeight() -> vec3<f32> {
  if (surfaceSampledCoat) { return vec3<f32>(surfaceCoatWeight / surfaceCoatChance); }
  return schlickColor(surfaceSpecularNormal, surfaceViewCosine) * surfaceSpecularWeight / surfaceSpecularChance;
}

fn dielectricFresnelTerm(cosineIncident: f32, relativeIndex: f32) -> f32 {
  let sineSquared = relativeIndex * relativeIndex * (1.0 - cosineIncident * cosineIncident);
  if (sineSquared >= 1.0) { return 1.0; }
  let cosineTransmitted = sqrt(1.0 - sineSquared);
  let parallel = (relativeIndex * cosineIncident - cosineTransmitted) / (relativeIndex * cosineIncident + cosineTransmitted);
  let perpendicular = (cosineIncident - relativeIndex * cosineTransmitted) / (cosineIncident + relativeIndex * cosineTransmitted);
  return 0.5 * (parallel * parallel + perpendicular * perpendicular);
}

// The glass direction goes into sampledDirection; returns false when the path must end.
fn sampleGlass(normal: vec3<f32>, view: vec3<f32>, entering: bool, ior: f32, alpha: f32, selectionUnit: f32, firstUnit: f32, secondUnit: f32) -> bool {
  let frame = buildFrame(normal);
  var halfVector = normal;
  if (alpha > MIRROR_ALPHA) {
    let localView = worldToLocal(frame, view);
    halfVector = localToWorld(frame, sampleVisibleNormal(localView, alpha, firstUnit, secondUnit));
  }
  let relativeIndex = select(ior, 1.0 / ior, entering);
  let cosineIncident = max(dot(view, halfVector), 1e-6);
  let reflectChance = dielectricFresnelTerm(cosineIncident, relativeIndex);
  if (selectionUnit < reflectChance) {
    sampledDirection = 2.0 * dot(view, halfVector) * halfVector - view;
    return dot(sampledDirection, normal) > 0.0;
  }
  let cosineTransmitted = sqrt(max(0.0, 1.0 - relativeIndex * relativeIndex * (1.0 - cosineIncident * cosineIncident)));
  let bend = relativeIndex * cosineIncident - cosineTransmitted;
  sampledDirection = bend * halfVector - relativeIndex * view;
  return dot(sampledDirection, normal) < 0.0;
}

// ---- One path ----

var<private> throughput: vec3<f32>;
var<private> radiance: vec3<f32>;
var<private> direction: vec3<f32>;
var<private> lightDirection: vec3<f32>;
var<private> lightRadiance: vec3<f32>;
var<private> selectionProbability: f32 = 1.0;
var<private> environmentSampledPdf: f32 = 0.0;
var<private> sunFrame: mat3x3<f32>;
var<private> featureAlbedo: vec3<f32>;
var<private> featureNormal: vec3<f32>;
var<private> featureDepth: f32;
var<private> firstLegEscaped: f32 = 0.0;
var<private> inMedium: bool = false;

fn addRadiance(depth: i32, amountIn: vec3<f32>) {
  var amount = amountIn;
  if (depth > 0) {
    let peak = max(amount.x, max(amount.y, amount.z));
    if (peak > params.cameraAndClamp.z) { amount *= params.cameraAndClamp.z / peak; }
  }
  radiance += amount;
}

fn environmentWeight(candidatePdf: f32) -> f32 {
  let lightPdf = environmentSampledPdf * selectionProbability;
  let total = lightPdf * lightPdf + candidatePdf * candidatePdf;
  return lightPdf * lightPdf / total / lightPdf;
}

fn directWeight(mode: i32, candidatePdf: f32) -> f32 {
  if (mode == 1) { return environmentWeight(candidatePdf); }
  return 1.0 / selectionProbability;
}

// Same shape as the GLSL: addDirect records one shadow ray and flushShadowRay traces it, so the shader holds one copy of the
// shadow-ray traversal.
var<private> shadowOrigin: vec3<f32>;
var<private> shadowDirection: vec3<f32>;
var<private> shadowLimit: f32;
var<private> shadowAmount: vec3<f32>;
var<private> shadowDepth: i32;
var<private> shadowPending: bool = false;

fn addDirect(depth: i32, normal: vec3<f32>, distance: f32, weightMode: i32) {
  ${e ? "if (inMedium) {\n    let phase = henyeyGreensteinPhase(params.volumeMaximumAnisotropy.w, dot(lightDirection, direction));\n    let scale = phase * fogTransmittance(hitPoint, distance) * directWeight(weightMode, phase);\n    shadowOrigin = hitPoint;\n    shadowAmount = throughput * lightRadiance * scale;\n    shadowDepth = depth + 1;\n  } else {" : "{"}
    let cosine = dot(normal, lightDirection);
    if (cosine <= 0.0) { return; }
    evaluateSurface(lightDirection);
    let value = surfaceValue;
    if (value.x + value.y + value.z <= 0.0) { return; }
    shadowOrigin = hitPoint + normal * params.environmentRotationAndRays.z;
    ${e ? "let transmittance = fogTransmittance(shadowOrigin, distance);" : "let transmittance = 1.0;"}
    let scale = cosine * directWeight(weightMode, surfacePdf) * transmittance;
    shadowAmount = throughput * value * lightRadiance * scale;
    shadowDepth = depth;
  }
  shadowDirection = lightDirection;
  shadowLimit = distance;
  shadowPending = true;
}

${e ? d : ""}
fn flushShadowRay() {
  if (!shadowPending) { return; }
  shadowPending = false;
  if (!occluded(shadowOrigin, shadowDirection, shadowLimit)) { addRadiance(shadowDepth, shadowAmount); }
}

fn reaches(bit: i32) -> bool {
  return inMedium || ((hitMask >> u32(bit)) & 1u) == 1u;
}

// Aims lightDirection at the target and returns the distance; distanceSquared goes into aimedDistanceSquared.
var<private> aimedDistanceSquared: f32;

fn aimAt(aimPoint: vec3<f32>) -> f32 {
  let delta = aimPoint - hitPoint;
  aimedDistanceSquared = dot(delta, delta);
  let distance = sqrt(aimedDistanceSquared);
  lightDirection = delta / distance;
  return distance;
}

fn randomOnSphere(radius: f32) -> vec3<f32> {
  let height = 2.0 * nextRandom() - 1.0;
  let angle = TWO_PI * nextRandom();
  let ring = sqrt(1.0 - height * height);
  return vec3<f32>(radius * ring * cos(angle), radius * height, radius * ring * sin(angle));
}

fn pointLightFalloff(distanceSquared: f32, range: f32, radius: f32) -> f32 {
  var cutoff = 1.0;
  if (range > 0.0) {
    let ratio = distanceSquared / (range * range);
    let fade = max(1.0 - ratio * ratio, 0.0);
    cutoff = fade * fade;
  }
  return cutoff / max(distanceSquared, radius * radius);
}

// The light tree (path-tracer-light-tree.js) follows the light table in the same buffer, four vectors a node; the word
// params.cameraAndClamp.w holds the index of its first vector, 0 when the scene draws lights uniformly.
const LIGHT_TREE_TEXELS: i32 = 4;
const LIGHT_TREE_FIRST_HIT_LIGHTS: i32 = 16;
const LIGHT_TREE_MINIMUM_SHARE: f32 = ${t.toFixed(4)};
var<private> treeChoiceProbability: f32 = 1.0;

fn lightTreeActive() -> bool {
  return params.cameraAndClamp.w > 0.0;
}

// Past this many lights the tree also draws one light at the first hit; below it the first hit lights from every emitter.
fn firstHitByTree() -> bool {
  return lightTreeActive() && params.sizeBouncesLights.w > LIGHT_TREE_FIRST_HIT_LIGHTS;
}

// The maximum and the minimum importance measure of one tree node for the current hit point.
fn lightTreeImportance(node: i32, normal: vec3<f32>) -> vec2<f32> {
  let base = i32(params.cameraAndClamp.w) + node * LIGHT_TREE_TEXELS;
  let minimumEnergy = lights[base];
  let maximumCosineO = lights[base + 1];
  let axisCosineE = lights[base + 2];
  let energy = minimumEnergy.w;
  let delta = 0.5 * (minimumEnergy.xyz + maximumCosineO.xyz) - hitPoint;
  let halfDiagonal = 0.5 * length(maximumCosineO.xyz - minimumEnergy.xyz);
  let centerDistance = length(delta);
  let nearest = max(max(centerDistance, halfDiagonal), 1e-4);
  let farthest = centerDistance + halfDiagonal;
  let minimumMeasure = energy / max(farthest * farthest, 1e-8);
  if (centerDistance <= halfDiagonal) { return vec2<f32>(energy / (nearest * nearest), minimumMeasure); }
  let toward = delta / centerDistance;
  let ratio = halfDiagonal / centerDistance;
  let thetaU = acos(sqrt(max(0.0, 1.0 - ratio * ratio)));
  let theta = acos(clamp(-dot(axisCosineE.xyz, toward), -1.0, 1.0));
  let thetaO = acos(clamp(maximumCosineO.w, -1.0, 1.0));
  let thetaE = acos(clamp(axisCosineE.w, -1.0, 1.0));
  let thetaPrime = max(theta - thetaO - thetaU, 0.0);
  if (thetaPrime >= thetaE) { return vec2<f32>(0.0, minimumMeasure); }
  let surfaceTheta = acos(clamp(dot(normal, toward), -1.0, 1.0));
  let surfaceCosine = max(cos(max(surfaceTheta - thetaU, 0.0)), 0.0);
  return vec2<f32>(energy * cos(thetaPrime) * surfaceCosine / (nearest * nearest), minimumMeasure);
}

// Draws the emitter of a later hit and sets selectionProbability to the chance of the draw. Without a tree it is the uniform
// choice; with one the sun and the sky keep their uniform share and a local light is reached by walking the tree from the
// root. Returns -1 when no light is worth sampling.
fn chooseEmitter(normal: vec3<f32>) -> i32 {
  let emitterCount = params.emittersFlagsSample.x;
  let uniformShare = 1.0 / f32(emitterCount);
  let emitter = min(i32(floor(nextRandom() * f32(emitterCount))), emitterCount - 1);
  selectionProbability = uniformShare;
  if (!lightTreeActive()) { return emitter; }
  let firstLightEmitter = select(0, 1, params.emittersFlagsSample.y != 0);
  let lightIndex = emitter - firstLightEmitter;
  let lightCount = params.sizeBouncesLights.w;
  if (lightIndex < 0 || lightIndex >= lightCount) { return emitter; }
  var node = 0;
  var pathProbability = 1.0;
  for (var step = 0; step < 64; step++) {
    let links = lights[i32(params.cameraAndClamp.w) + node * LIGHT_TREE_TEXELS + 3];
    if (links.x < 0.0) {
      selectionProbability = f32(lightCount) * uniformShare * pathProbability;
      return firstLightEmitter + i32(links.z);
    }
    let left = lightTreeImportance(i32(links.x), normal);
    let right = lightTreeImportance(i32(links.y), normal);
    let totalMaximum = left.x + right.x;
    let totalMinimum = left.y + right.y;
    if (!(totalMinimum > 0.0)) { return -1; }
    var leftProbability = left.y / totalMinimum;
    if (totalMaximum > 0.0) { leftProbability = (1.0 - LIGHT_TREE_MINIMUM_SHARE) * (left.x / totalMaximum) + LIGHT_TREE_MINIMUM_SHARE * leftProbability; }
    if (nextRandom() < leftProbability) {
      node = i32(links.x);
      pathProbability *= leftProbability;
    } else {
      node = i32(links.y);
      pathProbability *= 1.0 - leftProbability;
    }
  }
  return -1;
}

// True when the hit lights from every emitter: the first hit, unless the tree draws one there too, and any hit with one emitter.
fn lightsFromEveryEmitter(depth: i32, emitterCount: i32) -> bool {
  return (depth == 0 && !firstHitByTree()) || emitterCount <= 1;
}

// Draws one emitter's contribution into the pending shadow ray: emitter 0 is the sun when there is one, then the lights, then the sky.
fn sampleEmitter(depth: i32, normal: vec3<f32>, emitter: i32) {
  var distance = 0.0;
  var weightMode = 0;
  let hasSun = params.emittersFlagsSample.y != 0;
  let lightCount = params.sizeBouncesLights.w;
  if (hasSun && emitter == 0) {
    if (!reaches(0)) { return; }
    let cosineTheta = 1.0 - nextRandom() * (1.0 - params.sunColorAndCosine.w);
    let sineTheta = sqrt(max(0.0, 1.0 - cosineTheta * cosineTheta));
    let phi = TWO_PI * nextRandom();
    lightDirection = sunFrame[0] * (sineTheta * cos(phi)) + sunFrame[1] * (sineTheta * sin(phi)) + sunFrame[2] * cosineTheta;
    lightRadiance = params.sunColorAndCosine.rgb;
    distance = params.environmentRotationAndRays.w;
  } else {
    let index = emitter - select(0, 1, hasSun);
    if (index < lightCount) {
      let base = index * LIGHT_TEXELS;
      let positionType = lights[base];
      let colorBit = lights[base + 1];
      let directionRadius = lights[base + 2];
      let acrossCone = lights[base + 3];
      let alongBlend = lights[base + 4];
      let intensityRange = lights[base + 5];
      let lightType = i32(positionType.w);
      if (!reaches(i32(colorBit.w))) { return; }
      if (lightType == 2) {
        let across = (nextRandom() - 0.5) * directionRadius.w;
        let along = (nextRandom() - 0.5) * acrossCone.w;
        let point = positionType.xyz + acrossCone.xyz * across + alongBlend.xyz * along;
        distance = aimAt(point);
        let emitCosine = -dot(directionRadius.xyz, lightDirection);
        if (distance < 1e-6 || emitCosine <= 0.0) { return; }
        lightRadiance = colorBit.rgb * (intensityRange.x * emitCosine / aimedDistanceSquared);
      } else {
        let jitter = randomOnSphere(directionRadius.w);
        distance = aimAt(positionType.xyz + jitter);
        if (distance < 1e-6) { return; }
        var mask = 1.0;
        if (lightType == 1) {
          let inside = -dot(directionRadius.xyz, lightDirection) - acrossCone.w;
          if (inside <= 0.0) { return; }
          if (alongBlend.w > 0.0 && inside < alongBlend.w) {
            let unit = inside / alongBlend.w;
            mask = unit * unit * (3.0 - 2.0 * unit);
          }
        }
        lightRadiance = colorBit.rgb * (intensityRange.x * pointLightFalloff(aimedDistanceSquared, intensityRange.y, directionRadius.w) * mask);
      }
      distance -= params.environmentRotationAndRays.z;
    } else {
      let rowUnit = nextRandom();
      let columnUnit = nextRandom();
      let columnJitter = nextRandom();
      let rowJitter = nextRandom();
      environmentSampledPdf = sampleEnvironment(rowUnit, columnUnit, columnJitter, rowJitter);
      lightDirection = sampledDirection;
      if (!(environmentSampledPdf > 0.0)) { return; }
      lightRadiance = environmentRadiance(lightDirection);
      distance = params.environmentRotationAndRays.w;
      weightMode = 1;
    }
  }
  addDirect(depth, normal, distance, weightMode);
}

fn addEscape(depth: i32, previousPdf: f32, afterMirror: bool) {
  if (params.emittersFlagsSample.z == 0) { return; }
  let sky = environmentRadiance(direction);
  var weight = 1.0;
  if (!afterMirror) {
    let environmentSide = environmentPdf(direction) * selectionProbability;
    weight = previousPdf * previousPdf / (previousPdf * previousPdf + environmentSide * environmentSide);
  }
  addRadiance(depth, throughput * sky * weight);
}

fn survivesRoulette(depth: i32) -> bool {
  if (depth < RUSSIAN_ROULETTE_START) { return true; }
  let survival = min(0.95, max(0.05, max(throughput.x, max(throughput.y, throughput.z))));
  if (nextRandom() >= survival) { return false; }
  throughput /= survival;
  return true;
}
`, m = p(), h = "\n@compute @workgroup_size(8, 8, 1)\nfn main(@builtin(global_invocation_id) id: vec3<u32>) {\n  let width = params.sizeBouncesLights.x;\n  let height = params.sizeBouncesLights.y;\n  if (i32(id.x) >= width || i32(id.y) >= height) { return; }\n  let pixel = id.y * u32(width) + id.x;\n  let sampleIndex = u32(params.emittersFlagsSample.w);\n  let seed = params.seedAndAtlas.x;\n  if (params.emittersFlagsSample.y != 0) { sunFrame = buildFrame(params.sunDirection.xyz); }\n  let jitterX = hashJitter(pixel, sampleIndex, seed, 1u);\n  let jitterY = hashJitter(pixel, sampleIndex, seed, 2u);\n  let screenX = ((f32(id.x) + jitterX) / f32(width) * 2.0 - 1.0) * params.cameraAndClamp.x;\n  let screenY = (1.0 - (f32(id.y) + jitterY) / f32(height) * 2.0) * params.cameraAndClamp.y;\n  let rayDirection = normalize(params.forward.xyz + params.right.xyz * screenX + params.above.xyz * screenY);\n  tracePath(params.eye.xyz, rayDirection, pixel, sampleIndex);\n  if (!(all(radiance >= vec3<f32>(0.0)) && all(radiance < vec3<f32>(1e30)))) { radiance = vec3<f32>(0.0); }\n  if (!(featureDepth >= 0.0 && featureDepth < 1e30)) { featureDepth = 0.0; }\n  if (!(all(featureNormal >= vec3<f32>(-1.5)) && all(featureNormal < vec3<f32>(1.5)))) { featureNormal = vec3<f32>(0.0, 0.0, 1.0); }\n  if (!(all(featureAlbedo >= vec3<f32>(0.0)) && all(featureAlbedo < vec3<f32>(1e30)))) { featureAlbedo = vec3<f32>(1.0); }\n  let sampleLuminance = luminance(radiance);\n  let pixelCount = u32(width * height);\n  accumulation[pixel] += vec4<f32>(radiance, featureDepth);\n  accumulation[pixelCount + pixel] += vec4<f32>(featureAlbedo, 0.0);\n  accumulation[2u * pixelCount + pixel] += vec4<f32>(featureNormal, 0.0);\n  accumulation[3u * pixelCount + pixel] += vec4<f32>(sampleLuminance, sampleLuminance * sampleLuminance, firstLegEscaped, 0.0);\n}\n", g = "\n@group(0) @binding(9) var<storage, read_write> texelPoints: array<vec4<f32>>;\n@group(0) @binding(10) var<storage, read_write> texelNormals: array<vec4<f32>>;\n\n@compute @workgroup_size(64)\nfn bakeTexels(@builtin(global_invocation_id) id: vec3<u32>, @builtin(num_workgroups) groups: vec3<u32>) {\n  let texelCount = u32(params.sizeBouncesLights.x);\n  let texelIndex = id.y * groups.x * 64u + id.x;\n  if (texelIndex >= texelCount) { return; }\n  let sampleIndex = u32(params.emittersFlagsSample.w);\n  let seed = params.seedAndAtlas.x;\n  if (params.emittersFlagsSample.y != 0) { sunFrame = buildFrame(params.sunDirection.xyz); }\n  let normal = texelNormals[texelIndex].xyz;\n  let origin = texelPoints[texelIndex].xyz + normal * params.environmentRotationAndRays.z;\n  let firstUnit = (f32(sampleIndex) + hashJitter(texelIndex, sampleIndex, seed, 1u)) / f32(params.shadowSlots.z);\n  let secondUnit = hashJitter(texelIndex, sampleIndex, seed, 2u);\n  let coneRadius = sqrt(firstUnit);\n  let angle = TWO_PI * secondUnit;\n  let rayDirection = buildFrame(normal) * vec3<f32>(coneRadius * cos(angle), coneRadius * sin(angle), sqrt(max(0.0, 1.0 - firstUnit)));\n  tracePath(origin, rayDirection, texelIndex, sampleIndex);\n  if (!(all(radiance >= vec3<f32>(0.0)) && all(radiance < vec3<f32>(1e30)))) { radiance = vec3<f32>(0.0); }\n  accumulation[texelIndex] += vec4<f32>(radiance, 0.0);\n  accumulation[texelCount + texelIndex] += vec4<f32>(firstLegEscaped, 0.0, 0.0, 0.0);\n}\n", _ = ({ hasVolume: e = !1, hasSubsurface: t = !1, texelBake: n = !1, realtime: r = null } = {}) => p({ hasVolume: e }) + `
${r ? r.declarations + r.addLights : "// The first hit lights from every emitter; later hits draw one, and divide by the chance of drawing it.\nfn addLights(depth: i32, normal: vec3<f32>) {\n  let emitterCount = params.emittersFlagsSample.x;\n  if (lightsFromEveryEmitter(depth, emitterCount)) {\n    selectionProbability = 1.0;\n    for (var emitter = 0; emitter < emitterCount; emitter++) {\n      sampleEmitter(depth, normal, emitter);\n      flushShadowRay();\n    }\n    return;\n  }\n  let chosen = chooseEmitter(normal);\n  if (chosen >= 0) {\n    sampleEmitter(depth, normal, chosen);\n    flushShadowRay();\n  }\n  // The sky is drawn with its uniform share whatever light was chosen: that share weighs the next escape ray.\n  selectionProbability = 1.0 / f32(emitterCount);\n}"}
${t ? f : ""}
fn tracePath(origin: vec3<f32>, startDirection: vec3<f32>, pixel: u32, sampleIndex: u32) {
  resetRandom(pixel, sampleIndex, params.seedAndAtlas.x);
  radiance = vec3<f32>(0.0);
  throughput = vec3<f32>(1.0);
  featureAlbedo = vec3<f32>(1.0);
  featureNormal = vec3<f32>(0.0, 0.0, 1.0);
  featureDepth = 0.0;
  var featuresRecorded = false;
  direction = startDirection;
  var position = origin;
  var previousPdf = 0.0;
  var afterMirror = true;
  var normal = vec3<f32>(0.0, 1.0, 0.0);
  let bounces = params.sizeBouncesLights.z;
  let surfaceOffset = params.environmentRotationAndRays.z;
  for (var depth = 0; depth <= bounces; depth++) {
    let found = intersectScene(position, direction);
    ${e ? "let inFog = scatterInFog(position, select(params.environmentRotationAndRays.w, hitDistance, found));" : "let inFog = false;"}
    if (!inFog && !found) {
      if (depth == 0) { firstLegEscaped = 1.0; }
      addEscape(depth, previousPdf, afterMirror);
      break;
    }
    var isGlass = false;
    var entering = true;
    var needsLights = true;
    if (inFog) {
      throughput *= params.volumeAlbedoDistance.xyz;
      inMedium = true;
    } else {
      entering = dot(hitNormal, direction) < 0.0;
      normal = select(-hitNormal, hitNormal, entering);
      isGlass = hitTransmission > 0.0 && nextRandom() < hitTransmission;
      ${r ? r.firstHit : ""}
      if (!featuresRecorded) {
        featureAlbedo = select(hitColor, vec3<f32>(1.0), isGlass);
        featureNormal = normal;
        featureDepth = hitDistance;
        featuresRecorded = true;
      }
      addRadiance(depth, throughput * hitEmission);
      needsLights = !isGlass;
      if (needsLights) {
        prepareSurface(normal, -direction);
        ${t ? "subsurfaceWeight = splitSubsurface();" : ""}
      }
    }
    if (needsLights) { addLights(depth, normal); }
    inMedium = false;
    ${r ? r.terminal : ""}
    ${e ? "if (inFog) {\n      let phaseCosine = sampleHenyeyGreensteinCosine(params.volumeMaximumAnisotropy.w, nextRandom());\n      let phaseSine = sqrt(max(0.0, 1.0 - phaseCosine * phaseCosine));\n      let azimuth = TWO_PI * nextRandom();\n      let frame = buildFrame(direction);\n      direction = frame[0] * phaseSine * cos(azimuth) + frame[1] * phaseSine * sin(azimuth) + frame[2] * phaseCosine;\n      previousPdf = henyeyGreensteinPhase(params.volumeMaximumAnisotropy.w, phaseCosine);\n      afterMirror = false;\n      position = hitPoint;\n      if (!survivesRoulette(depth)) { break; }\n      continue;\n    }" : ""}
    if (isGlass) {
      let alpha = roughnessToAlpha(hitRoughness);
      let selectionUnit = nextRandom();
      let firstUnit = nextRandom();
      let secondUnit = nextRandom();
      if (!sampleGlass(normal, -direction, entering, hitIor, alpha, selectionUnit, firstUnit, secondUnit)) { break; }
      direction = sampledDirection;
      if (dot(direction, normal) < 0.0) { throughput *= hitColor; }
      afterMirror = true;
    } else {
      var lobeUnit = nextRandom();
      ${t ? "if (subsurfaceWeight > 0.0) {\n        if (lobeUnit < surfaceSubsurfaceChance) {\n          if (!enterSubsurface(depth, normal)) { break; }\n          normal = subsurfaceNormal;\n          lobeUnit = 0.0;\n        } else {\n          lobeUnit -= surfaceSubsurfaceChance;\n        }\n      }" : ""}
      let firstUnit = nextRandom();
      let secondUnit = nextRandom();
      let isMirror = sampleSurface(lobeUnit, firstUnit, secondUnit);
      direction = sampledDirection;
      let cosine = dot(direction, normal);
      if (cosine <= 0.0) { break; }
      if (isMirror) {
        throughput *= mirrorWeight();
        afterMirror = true;
      } else {
        evaluateSurface(direction);
        if (!(surfacePdf > 0.0)) { break; }
        throughput *= surfaceValue * cosine / surfacePdf;
        previousPdf = surfacePdf;
        afterMirror = false;
      }
      ${r ? r.record : ""}
    }
    position = hitPoint + direction * surfaceOffset;
    if (!survivesRoulette(depth)) { break; }
  }
}

${n ? g : r ? r.main : h}
`;
_();
var v = m + "\n// Path state: PATH_STATE_VECTORS vec4<u32> per path (floats are stored as their bits, so nothing is ever rounded or\n// canonicalised on the way through memory), then the shadow records, three vec4 per emitter slot of a path.\n//   0 origin, previous pdf   1 direction, selection probability   2 throughput   3 radiance, first leg escaped\n//   4 albedo   5 normal, depth   6 start of the last ray segment, distance in it   7 u, v, distance before the segment\n//   8 random state, flags, hit triangle slot, material\n// Shadow record: 0 origin, limit   1 direction, unused   2 amount, 1 when the ray is pending.\n@group(0) @binding(9) var<storage, read_write> pathState: array<vec4<u32>>;\n// Word 0 counts the hits of this bounce; then per material the count and the write cursor; then the hits sorted by material.\n@group(0) @binding(10) var<storage, read_write> binQueue: array<atomic<u32>>;\n\nconst PATH_STATE_VECTORS: u32 = 9u;\nconst FLAG_ALIVE: u32 = 1u;\nconst FLAG_AFTER_MIRROR: u32 = 2u;\nconst FLAG_HIT: u32 = 4u;\nconst FLAG_SHADED: u32 = 8u;\n\nfn loadVector(index: u32) -> vec4<f32> {\n  return bitcast<vec4<f32>>(pathState[index]);\n}\n\nfn storeVector(index: u32, value: vec4<f32>) {\n  pathState[index] = bitcast<vec4<u32>>(value);\n}\n\nfn tilePathCount() -> u32 {\n  return params.tileAndDepth.y;\n}\n\nfn currentDepth() -> i32 {\n  return i32(params.tileAndDepth.z);\n}\n\nfn materialCount() -> u32 {\n  return params.tileAndDepth.w;\n}\n\n// How many shadow rays a path casts at this depth: every emitter at the first hit, one afterwards.\nfn emitterSlotCount(depth: i32) -> u32 {\n  let emitterCount = u32(max(params.emittersFlagsSample.x, 0));\n  if (lightsFromEveryEmitter(depth, i32(emitterCount))) { return emitterCount; }\n  return 1u;\n}\n\nfn shadowRecordBase(path: u32, slot: u32) -> u32 {\n  return tilePathCount() * PATH_STATE_VECTORS + (path * params.shadowSlots.x + slot) * 3u;\n}\n\nfn storeShadowRecord(path: u32, slot: u32) {\n  let base = shadowRecordBase(path, slot);\n  if (shadowPending) {\n    storeVector(base, vec4<f32>(shadowOrigin, shadowLimit));\n    storeVector(base + 1u, vec4<f32>(shadowDirection, 0.0));\n    storeVector(base + 2u, vec4<f32>(shadowAmount, 1.0));\n  } else {\n    storeVector(base + 2u, vec4<f32>(0.0));\n  }\n}\n\n// Paths are numbered in blocks of 8 by 8 pixels, so the 64 paths of a workgroup look at neighbouring pixels (rays that start\n// close together traverse the same part of the BVH). Numbers past the edge of the image have no pixel.\nfn blockedPixel(globalPath: u32) -> vec2<u32> {\n  let blocksPerRow = (u32(params.sizeBouncesLights.x) + 7u) / 8u;\n  let block = globalPath / 64u;\n  let within = globalPath % 64u;\n  return vec2<u32>((block % blocksPerRow) * 8u + within % 8u, (block / blocksPerRow) * 8u + within / 8u);\n}\n\nfn queuedPath(position: u32) -> u32 {\n  return atomicLoad(&binQueue[1u + 2u * materialCount() + position]);\n}\n\n@compute @workgroup_size(64)\nfn generatePaths(@builtin(global_invocation_id) id: vec3<u32>) {\n  if (id.x >= tilePathCount()) { return; }\n  let width = u32(params.sizeBouncesLights.x);\n  let height = u32(params.sizeBouncesLights.y);\n  let coordinates = blockedPixel(params.tileAndDepth.x + id.x);\n  let pixelX = coordinates.x;\n  let pixelY = coordinates.y;\n  if (pixelX >= width || pixelY >= height) {\n    pathState[id.x * PATH_STATE_VECTORS + 8u] = vec4<u32>(0u);\n    return;\n  }\n  let pixel = pixelY * width + pixelX;\n  let sampleIndex = u32(params.emittersFlagsSample.w);\n  let seed = params.seedAndAtlas.x;\n  let jitterX = hashJitter(pixel, sampleIndex, seed, 1u);\n  let jitterY = hashJitter(pixel, sampleIndex, seed, 2u);\n  let screenX = ((f32(pixelX) + jitterX) / f32(width) * 2.0 - 1.0) * params.cameraAndClamp.x;\n  let screenY = (1.0 - (f32(pixelY) + jitterY) / f32(height) * 2.0) * params.cameraAndClamp.y;\n  let rayDirection = normalize(params.forward.xyz + params.right.xyz * screenX + params.above.xyz * screenY);\n  resetRandom(pixel, sampleIndex, seed);\n  let base = id.x * PATH_STATE_VECTORS;\n  storeVector(base, vec4<f32>(params.eye.xyz, 0.0));\n  storeVector(base + 1u, vec4<f32>(rayDirection, 1.0));\n  storeVector(base + 2u, vec4<f32>(1.0, 1.0, 1.0, 0.0));\n  storeVector(base + 3u, vec4<f32>(0.0));\n  storeVector(base + 4u, vec4<f32>(1.0, 1.0, 1.0, 0.0));\n  storeVector(base + 5u, vec4<f32>(0.0, 0.0, 1.0, 0.0));\n  pathState[base + 8u] = vec4<u32>(rngState, FLAG_ALIVE | FLAG_AFTER_MIRROR, 0u, 0u);\n}\n\n@compute @workgroup_size(64)\nfn resetBins(@builtin(global_invocation_id) id: vec3<u32>) {\n  if (id.x == 0u) { atomicStore(&binQueue[0], 0u); }\n  if (id.x < materialCount()) { atomicStore(&binQueue[1u + id.x], 0u); }\n}\n\n// Finds the nearest solid hit of every live path (stepping through the transparent texels of cutout materials), adds the\n// sky to paths that left the scene, and counts the hits per material.\n@compute @workgroup_size(64)\nfn extendPaths(@builtin(global_invocation_id) id: vec3<u32>) {\n  if (id.x >= tilePathCount()) { return; }\n  let base = id.x * PATH_STATE_VECTORS;\n  var pathMeta = pathState[base + 8u];\n  let flags = pathMeta.y;\n  if ((flags & FLAG_ALIVE) == 0u) { return; }\n  let originPrevious = loadVector(base);\n  let directionSelection = loadVector(base + 1u);\n  let rayDirection = directionSelection.xyz;\n  let farDistance = params.environmentRotationAndRays.w;\n  let surfaceOffset = params.environmentRotationAndRays.z;\n  var start = originPrevious.xyz;\n  var travelled = 0.0;\n  var found = false;\n  for (var attempt = 0; attempt < ALPHA_STEP_LIMIT; attempt++) {\n    traceRay(start, rayDirection, farDistance, false);\n    if (nearestSlot < 0) { break; }\n    let material = i32(triangles[nearestSlot * TRIANGLE_TEXELS].w) * MATERIAL_TEXELS;\n    let cutoff = materials[material + 3].z;\n    if (cutoff == 0.0 || alphaAtNearestHit() >= cutoff) {\n      found = true;\n      break;\n    }\n    let advance = nearestDistance + surfaceOffset;\n    travelled += advance;\n    start += rayDirection * advance;\n  }\n  if (found) {\n    let materialIndex = u32(triangles[nearestSlot * TRIANGLE_TEXELS].w);\n    storeVector(base + 6u, vec4<f32>(start, nearestDistance));\n    storeVector(base + 7u, vec4<f32>(nearestU, nearestV, travelled, 0.0));\n    pathMeta = vec4<u32>(pathMeta.x, flags | FLAG_HIT, u32(nearestSlot), materialIndex);\n    pathState[base + 8u] = pathMeta;\n    if (params.shadowSlots.y == 1u) { atomicAdd(&binQueue[1u + materialIndex], 1u); }\n    return;\n  }\n  var radianceData = loadVector(base + 3u);\n  if (currentDepth() == 0) { radianceData.w = 1.0; }\n  direction = rayDirection;\n  throughput = loadVector(base + 2u).xyz;\n  radiance = radianceData.xyz;\n  selectionProbability = directionSelection.w;\n  addEscape(currentDepth(), originPrevious.w, (flags & FLAG_AFTER_MIRROR) != 0u);\n  storeVector(base + 3u, vec4<f32>(radiance, radianceData.w));\n  pathMeta.y = flags & ~(FLAG_ALIVE | FLAG_HIT);\n  pathState[base + 8u] = pathMeta;\n}\n\n@compute @workgroup_size(1)\nfn scanBins() {\n  let count = materialCount();\n  var running = 0u;\n  for (var material = 0u; material < count; material++) {\n    atomicStore(&binQueue[1u + count + material], running);\n    running += atomicLoad(&binQueue[1u + material]);\n  }\n  atomicStore(&binQueue[0], running);\n}\n\n@compute @workgroup_size(64)\nfn scatterPaths(@builtin(global_invocation_id) id: vec3<u32>) {\n  if (id.x >= tilePathCount()) { return; }\n  let pathMeta = pathState[id.x * PATH_STATE_VECTORS + 8u];\n  if ((pathMeta.y & FLAG_HIT) == 0u) { return; }\n  let count = materialCount();\n  let position = atomicAdd(&binQueue[1u + count + pathMeta.w], 1u);\n  atomicStore(&binQueue[1u + 2u * count + position], id.x);\n}\n\n// Shades the hits in material order: emission, features, one shadow record per emitter, then the next direction. Draws\n// random numbers in the order of the megakernel, so the picture is the same.\n@compute @workgroup_size(64)\nfn shadePaths(@builtin(global_invocation_id) id: vec3<u32>) {\n  var path = id.x;\n  if (params.shadowSlots.y == 1u) {\n    if (id.x >= atomicLoad(&binQueue[0])) { return; }\n    path = queuedPath(id.x);\n  } else {\n    if (id.x >= tilePathCount()) { return; }\n    if ((pathState[id.x * PATH_STATE_VECTORS + 8u].y & FLAG_HIT) == 0u) { return; }\n  }\n  let base = path * PATH_STATE_VECTORS;\n  let depth = currentDepth();\n  let originPrevious = loadVector(base);\n  let directionSelection = loadVector(base + 1u);\n  let radianceData = loadVector(base + 3u);\n  let hitStart = loadVector(base + 6u);\n  let hitInfo = loadVector(base + 7u);\n  var pathMeta = pathState[base + 8u];\n  rngState = pathMeta.x;\n  direction = directionSelection.xyz;\n  selectionProbability = directionSelection.w;\n  throughput = loadVector(base + 2u).xyz;\n  radiance = radianceData.xyz;\n  nearestSlot = i32(pathMeta.z);\n  nearestU = hitInfo.x;\n  nearestV = hitInfo.y;\n  _ = fillHit(hitStart.xyz, direction, hitStart.w);\n  hitDistance += hitInfo.z;\n  let entering = dot(hitNormal, direction) < 0.0;\n  let normal = select(-hitNormal, hitNormal, entering);\n  let isGlass = hitTransmission > 0.0 && nextRandom() < hitTransmission;\n  if (depth == 0) {\n    storeVector(base + 4u, vec4<f32>(select(hitColor, vec3<f32>(1.0), isGlass), 0.0));\n    storeVector(base + 5u, vec4<f32>(normal, hitDistance));\n  }\n  addRadiance(depth, throughput * hitEmission);\n  if (params.emittersFlagsSample.y != 0) { sunFrame = buildFrame(params.sunDirection.xyz); }\n  if (isGlass) {\n    let slotCount = emitterSlotCount(depth);\n    for (var slot = 0u; slot < slotCount; slot++) {\n      shadowPending = false;\n      storeShadowRecord(path, slot);\n    }\n  } else {\n    prepareSurface(normal, -direction);\n    let emitterCount = params.emittersFlagsSample.x;\n    if (lightsFromEveryEmitter(depth, emitterCount)) {\n      selectionProbability = 1.0;\n      for (var emitter = 0; emitter < emitterCount; emitter++) {\n        shadowPending = false;\n        sampleEmitter(depth, normal, emitter);\n        storeShadowRecord(path, u32(emitter));\n      }\n    } else {\n      let chosen = chooseEmitter(normal);\n      shadowPending = false;\n      if (chosen >= 0) { sampleEmitter(depth, normal, chosen); }\n      storeShadowRecord(path, 0u);\n      selectionProbability = 1.0 / f32(emitterCount);\n    }\n  }\n  var alive = depth < params.sizeBouncesLights.z;\n  var afterMirror = (pathMeta.y & FLAG_AFTER_MIRROR) != 0u;\n  var previousPdf = originPrevious.w;\n  if (alive && isGlass) {\n    let alpha = roughnessToAlpha(hitRoughness);\n    let selectionUnit = nextRandom();\n    let firstUnit = nextRandom();\n    let secondUnit = nextRandom();\n    if (sampleGlass(normal, -direction, entering, hitIor, alpha, selectionUnit, firstUnit, secondUnit)) {\n      direction = sampledDirection;\n      if (dot(direction, normal) < 0.0) { throughput *= hitColor; }\n      afterMirror = true;\n    } else {\n      alive = false;\n    }\n  } else if (alive) {\n    let lobeUnit = nextRandom();\n    let firstUnit = nextRandom();\n    let secondUnit = nextRandom();\n    let isMirror = sampleSurface(lobeUnit, firstUnit, secondUnit);\n    direction = sampledDirection;\n    let cosine = dot(direction, normal);\n    if (cosine <= 0.0) {\n      alive = false;\n    } else if (isMirror) {\n      throughput *= mirrorWeight();\n      afterMirror = true;\n    } else {\n      evaluateSurface(direction);\n      if (surfacePdf > 0.0) {\n        throughput *= surfaceValue * cosine / surfacePdf;\n        previousPdf = surfacePdf;\n        afterMirror = false;\n      } else {\n        alive = false;\n      }\n    }\n  }\n  var nextOrigin = originPrevious.xyz;\n  if (alive) {\n    nextOrigin = hitPoint + direction * params.environmentRotationAndRays.z;\n    alive = survivesRoulette(depth);\n  }\n  storeVector(base, vec4<f32>(nextOrigin, previousPdf));\n  storeVector(base + 1u, vec4<f32>(direction, selectionProbability));\n  storeVector(base + 2u, vec4<f32>(throughput, 0.0));\n  storeVector(base + 3u, vec4<f32>(radiance, radianceData.w));\n  pathMeta.x = rngState;\n  pathMeta.y = select(0u, FLAG_ALIVE, alive) | select(0u, FLAG_AFTER_MIRROR, afterMirror) | FLAG_SHADED;\n  pathState[base + 8u] = pathMeta;\n}\n\n// Traces the shadow rays the shade kernel recorded and adds the light that gets through. It walks the paths in pixel order\n// (not material order) so that neighbouring invocations cast rays from neighbouring points.\n@compute @workgroup_size(64)\nfn shadowPaths(@builtin(global_invocation_id) id: vec3<u32>) {\n  if (id.x >= tilePathCount()) { return; }\n  let path = id.x;\n  let base = path * PATH_STATE_VECTORS;\n  var pathMeta = pathState[base + 8u];\n  if ((pathMeta.y & FLAG_SHADED) == 0u) { return; }\n  pathMeta.y = pathMeta.y & ~FLAG_SHADED;\n  pathState[base + 8u] = pathMeta;\n  let depth = currentDepth();\n  let radianceData = loadVector(base + 3u);\n  radiance = radianceData.xyz;\n  let slotCount = emitterSlotCount(depth);\n  for (var slot = 0u; slot < slotCount; slot++) {\n    let recordBase = shadowRecordBase(path, slot);\n    let amount = loadVector(recordBase + 2u);\n    if (amount.w == 0.0) { continue; }\n    let origin = loadVector(recordBase);\n    let rayDirection = loadVector(recordBase + 1u).xyz;\n    if (!occluded(origin.xyz, rayDirection, origin.w)) { addRadiance(depth, amount.xyz); }\n  }\n  storeVector(base + 3u, vec4<f32>(radiance, radianceData.w));\n}\n\n// Adds the finished sample of every path of the tile to the accumulation planes, dropping non-finite values as the megakernel does.\n@compute @workgroup_size(64)\nfn resolvePaths(@builtin(global_invocation_id) id: vec3<u32>) {\n  if (id.x >= tilePathCount()) { return; }\n  let coordinates = blockedPixel(params.tileAndDepth.x + id.x);\n  if (coordinates.x >= u32(params.sizeBouncesLights.x) || coordinates.y >= u32(params.sizeBouncesLights.y)) { return; }\n  let base = id.x * PATH_STATE_VECTORS;\n  let radianceData = loadVector(base + 3u);\n  let normalDepth = loadVector(base + 5u);\n  var sampleRadiance = radianceData.xyz;\n  var sampleAlbedo = loadVector(base + 4u).xyz;\n  var sampleNormal = normalDepth.xyz;\n  var sampleDepth = normalDepth.w;\n  if (!(all(sampleRadiance >= vec3<f32>(0.0)) && all(sampleRadiance < vec3<f32>(1e30)))) { sampleRadiance = vec3<f32>(0.0); }\n  if (!(sampleDepth >= 0.0 && sampleDepth < 1e30)) { sampleDepth = 0.0; }\n  if (!(all(sampleNormal >= vec3<f32>(-1.5)) && all(sampleNormal < vec3<f32>(1.5)))) { sampleNormal = vec3<f32>(0.0, 0.0, 1.0); }\n  if (!(all(sampleAlbedo >= vec3<f32>(0.0)) && all(sampleAlbedo < vec3<f32>(1e30)))) { sampleAlbedo = vec3<f32>(1.0); }\n  let sampleLuminance = luminance(sampleRadiance);\n  let pixel = coordinates.y * u32(params.sizeBouncesLights.x) + coordinates.x;\n  let pixelCount = u32(params.sizeBouncesLights.x * params.sizeBouncesLights.y);\n  accumulation[pixel] += vec4<f32>(sampleRadiance, sampleDepth);\n  accumulation[pixelCount + pixel] += vec4<f32>(sampleAlbedo, 0.0);\n  accumulation[2u * pixelCount + pixel] += vec4<f32>(sampleNormal, 0.0);\n  accumulation[3u * pixelCount + pixel] += vec4<f32>(sampleLuminance, sampleLuminance * sampleLuminance, radianceData.w, 0.0);\n}\n", y = ["megakernel", "wavefront"], b = "megakernel", x = !1, S = 272, C = 512, w = 10, T = 1 << 19, E = 1 << 27, D = 1 << 30, O = [
	"generatePaths",
	"resetBins",
	"extendPaths",
	"scanBins",
	"scatterPaths",
	"shadePaths",
	"shadowPaths",
	"resolvePaths"
];
function k() {
	return typeof navigator < "u" && !!navigator.gpu;
}
var A = null, j = 0;
function M() {
	return j;
}
async function N() {
	if (!k()) throw Error("The WebGPU path tracer needs navigator.gpu, which this page does not have. Use backend \"gpu\" (WebGL2) or \"cpu\".");
	let e = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
	if (!e) throw Error("The WebGPU path tracer found no WebGPU adapter. Use backend \"gpu\" (WebGL2) or \"cpu\".");
	if (e.limits.maxStorageBuffersPerShaderStage < w) throw Error(`The WebGPU path tracer needs ${w} storage buffers per shader stage and this adapter allows ${e.limits.maxStorageBuffersPerShaderStage}. Use backend "gpu".`);
	let t = await e.requestDevice({ requiredLimits: {
		maxStorageBuffersPerShaderStage: w,
		maxStorageBufferBindingSize: Math.min(e.limits.maxStorageBufferBindingSize, D),
		maxBufferSize: Math.min(e.limits.maxBufferSize, D)
	} }), n = [{
		binding: 0,
		visibility: GPUShaderStage.COMPUTE,
		buffer: {
			type: "uniform",
			hasDynamicOffset: !0,
			minBindingSize: S
		}
	}];
	for (let e = 1; e < 11; e++) n.push({
		binding: e,
		visibility: GPUShaderStage.COMPUTE,
		buffer: { type: e <= 7 ? "read-only-storage" : "storage" }
	});
	let r = t.createBindGroupLayout({ entries: n }), i = e.info ?? {};
	return {
		device: t,
		bindGroupLayout: r,
		pipelineLayout: t.createPipelineLayout({ bindGroupLayouts: [r] }),
		gpu: `${i.vendor ?? "webgpu"} ${i.architecture ?? ""}`.trim(),
		kernels: /* @__PURE__ */ new Map()
	};
}
async function P() {
	return A ??= N().catch((e) => {
		throw A = null, e;
	}), A;
}
function F({ kernel: e, hasVolume: t, hasSubsurface: n, texelBake: r, realtime: i }) {
	return e === "wavefront" ? {
		code: v,
		entryPoints: O
	} : i ? {
		code: _({
			hasVolume: t,
			hasSubsurface: n,
			realtime: i
		}),
		entryPoints: ["traceRealtime"]
	} : {
		code: _({
			hasVolume: t,
			hasSubsurface: n,
			texelBake: r
		}),
		entryPoints: [r ? "bakeTexels" : "main"]
	};
}
async function I(e, t) {
	let { device: n, pipelineLayout: r } = e, i = performance.now(), { code: a, entryPoints: o } = F(t), s = n.createShaderModule({
		label: `path tracer ${t.kernel}`,
		code: a
	}), c = (await s.getCompilationInfo()).messages.filter((e) => e.type === "error");
	if (c.length > 0) throw Error(`The WebGPU path tracer shader did not compile: ${c.slice(0, 8).map((e) => `${e.lineNum}: ${e.message}`).join("; ")}`);
	let l = await Promise.all(o.map((e) => n.createComputePipelineAsync({
		layout: r,
		compute: {
			module: s,
			entryPoint: e
		}
	})));
	return j++, {
		pipelines: Object.fromEntries(o.map((e, t) => [e, l[t]])),
		compileSeconds: (performance.now() - i) / 1e3
	};
}
async function L(e, t) {
	let n = [
		t.kernel,
		t.hasVolume,
		t.hasSubsurface,
		t.texelBake,
		!!t.realtime
	].join(":");
	return e.kernels.has(n) || e.kernels.set(n, I(e, t)), e.kernels.get(n);
}
function R(e) {
	return {
		hasVolume: !!e.volume,
		hasSubsurface: u(e.materials),
		texelBake: !1
	};
}
function z(e, t, n) {
	let r = new Uint8Array(t.buffer, t.byteOffset, t.byteLength), i = e.createBuffer({
		label: n,
		size: Math.max(16, Math.ceil(r.byteLength / 4) * 4),
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
	});
	return e.queue.writeBuffer(i, 0, r), i;
}
function B(e) {
	return new Uint32Array(e.data.buffer, e.data.byteOffset, Math.floor(e.data.byteLength / 4));
}
function V(t, d, f = "uniform") {
	let p = l(d.materials), m = i(d.lights), h = e(f, d.lights) === "tree" && m.count > 1, g = m.table.data, _ = h ? g.length / 4 : 0, v = h ? s(d.lights).data : /* @__PURE__ */ new Float32Array(), y = new Float32Array(g.length + v.length);
	y.set(g), y.set(v, g.length);
	let b = a(d.environment), x = new Float32Array(b ? b.height + b.width * b.height : 4);
	b && (x.set(b.rows.data.subarray(0, b.height), 0), x.set(b.pixels.data.subarray(0, b.width * b.height), b.height));
	let S = n(d.materials, p).data, C = S.length / 4, w = u(d.materials) ? c(d.materials).data : /* @__PURE__ */ new Float32Array(), T = new Float32Array(S.length + w.length);
	return T.set(S), T.set(w, S.length), {
		buffers: [
			z(t, o(d.bvh).data, "bvh nodes"),
			z(t, r(d).data, "triangles"),
			z(t, T, "materials"),
			z(t, y, "lights"),
			z(t, B(p), "texture atlas"),
			z(t, b?.colors ?? /* @__PURE__ */ new Float32Array(4), "environment colors"),
			z(t, x, "environment tables")
		],
		lightCount: m.count,
		lightTreeBase: _,
		atlasWidth: p.width,
		subsurfaceOffset: C
	};
}
function H(e, t, n, r, i) {
	let a = /* @__PURE__ */ new ArrayBuffer(S), o = new Float32Array(a), s = new Int32Array(a), c = new Uint32Array(a), { sun: l } = e.lights, { environment: u } = e;
	o.set([...t.eye, 0], 0), o.set([...t.forward, 0], 4), o.set([...t.right, 0], 8), o.set([...t.above, 0], 12), o.set([...l?.direction ?? [
		0,
		1,
		0
	], 0], 16), o.set([...l?.color ?? [
		0,
		0,
		0
	], Math.cos(Math.PI / 360)], 20), o.set([
		u?.width ?? 1,
		u?.height ?? 1,
		u?.intensity ?? 1,
		u?.total ?? 1
	], 24), o.set([
		u?.cosine ?? 1,
		u?.sine ?? 0,
		e.surfaceOffset,
		e.farDistance
	], 28), o.set([
		t.halfWidth,
		t.halfHeight,
		n.fireflyClamp,
		r.lightTreeBase
	], 32), s.set([
		n.width,
		n.height,
		n.bounces,
		r.lightCount
	], 36), s.set([
		i,
		+!!l,
		+!!u,
		0
	], 40), c.set([
		n.seed >>> 0,
		r.atlasWidth,
		r.subsurfaceOffset,
		0
	], 44);
	let { volume: d } = e;
	return o.set([...d?.minimum ?? [
		0,
		0,
		0
	], d?.density ?? 0], 56), o.set([...d?.maximum ?? [
		0,
		0,
		0
	], d?.anisotropy ?? 0], 60), o.set([...d?.albedo ?? [
		1,
		1,
		1
	], d?.maxDistance ?? 0], 64), {
		unsigned: c,
		integers: s
	};
}
var U = 43, W = 48, G = 52, K = 53, q = 54;
function J(e, t, n, r, i, a, o) {
	let s = new Uint8Array(n.length * r * C);
	return n.forEach((n, c) => {
		for (let l = 0; l < r; l++) {
			let u = new Uint32Array(s.buffer, (c * r + l) * C, S / 4);
			u.set(e.unsigned), u[U] = t, u.set([
				n.start,
				n.count,
				l,
				i
			], W), u[G] = a, u[K] = +!!o;
		}
	}), s;
}
function Y(e, t, n) {
	let r = Math.ceil(e / 8) * Math.ceil(t / 8) * 64, i = (9 + 3 * n) * 16, a = Math.min(r, Math.floor(Math.min(T, E / i) / 64) * 64), o = [];
	for (let e = 0; e < r; e += a) o.push({
		start: e,
		count: Math.min(a, r - e)
	});
	return {
		tiles: o,
		tilePaths: a,
		stateBytes: a * i
	};
}
function X(e, t, n) {
	let r = {
		color: new Float32Array(t * 3),
		albedo: new Float32Array(t * 3),
		normal: new Float32Array(t * 3),
		depth: new Float32Array(t),
		variance: new Float32Array(t),
		samplesTaken: new Uint16Array(t).fill(n)
	}, i = t * 4, a = t * 8, o = t * 12;
	for (let s = 0; s < t; s++) {
		for (let t = 0; t < 3; t++) r.color[s * 3 + t] = e[s * 4 + t] / n, r.albedo[s * 3 + t] = e[i + s * 4 + t] / n, r.normal[s * 3 + t] = e[a + s * 4 + t] / n;
		r.depth[s] = e[s * 4 + 3] / n;
		let t = e[o + s * 4] / n;
		r.variance[s] = Math.max(0, e[o + s * 4 + 1] / n - t * t) / Math.max(n - 1, 1);
	}
	return r;
}
function Z(e, t, n, r, i, a, o) {
	let s = (e) => Math.ceil(e / 64), c = (n, r) => {
		e.setPipeline(t[n]), e.dispatchWorkgroups(r);
	};
	r.forEach((t, r) => {
		let l = (t) => e.setBindGroup(0, n, [(r * i + t) * C]);
		l(0), c("generatePaths", s(t.count));
		for (let e = 0; e < i; e++) l(e), o && c("resetBins", s(Math.max(a, 1))), c("extendPaths", s(t.count)), o && (c("scanBins", 1), c("scatterPaths", s(t.count))), c("shadePaths", s(t.count)), c("shadowPaths", s(t.count));
		l(0), c("resolvePaths", s(t.count));
	});
}
async function Q(e, t, n, r) {
	let i = n.kernel ?? "megakernel";
	if (!y.includes(i)) throw RangeError(`The WebGPU path tracer kernel must be one of ${y.join(", ")}.`);
	let a = R(e);
	if (i === "wavefront" && (a.hasVolume || a.hasSubsurface)) throw RangeError("The WebGPU wavefront kernel does not trace volume fog or subsurface scattering. Use the megakernel, the default.");
	let o = await P(), { device: s } = o, { pipelines: c, compileSeconds: l } = await L(o, {
		kernel: i,
		...a
	}), { width: u, height: d, samples: f } = n, p = u * d, m = p * 16;
	if (m * 4 > s.limits.maxStorageBufferBindingSize) throw RangeError(`A ${u} by ${d} image is too large for this WebGPU adapter. Lower the size or use backend "gpu".`);
	let h = V(s, e, n.lightSelection), g = +!!e.lights.sun + h.lightCount + +!!e.environment, _ = Math.max(g, 1), v = e.materials.length, b = n.bounces + 1, x = i === "wavefront", w = n.sortByMaterial ?? !1, { tiles: T, tilePaths: E, stateBytes: D } = Y(u, d, _), O = x ? T.length * b : 1, k = s.createBuffer({
		label: "accumulation",
		size: m * 4,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
	}), A = s.createBuffer({
		label: "parameters",
		size: O * C,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	}), j = s.createBuffer({
		label: "path state",
		size: x ? D : 16,
		usage: GPUBufferUsage.STORAGE
	}), M = 1 + 2 * v + E, N = s.createBuffer({
		label: "material bins",
		size: x ? M * 4 : 16,
		usage: GPUBufferUsage.STORAGE
	}), F = s.createBindGroup({
		layout: o.bindGroupLayout,
		entries: [{
			binding: 0,
			resource: {
				buffer: A,
				size: S
			}
		}, ...[
			...h.buffers,
			k,
			j,
			N
		].map((e, t) => ({
			binding: t + 1,
			resource: { buffer: e }
		}))]
	}), I = H(e, t, n, h, g);
	for (let e = 0; e < f; e++) {
		let t = J(I, e, x ? T : [{
			start: 0,
			count: p
		}], x ? b : 1, v, _, w);
		s.queue.writeBuffer(A, 0, t);
		let n = s.createCommandEncoder(), i = n.beginComputePass();
		x ? Z(i, c, F, T, b, v, w) : (i.setPipeline(c.main), i.setBindGroup(0, F, [0]), i.dispatchWorkgroups(Math.ceil(u / 8), Math.ceil(d / 8))), i.end(), s.queue.submit([n.finish()]), await s.queue.onSubmittedWorkDone(), r();
	}
	let z = s.createBuffer({
		size: m * 4,
		usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
	}), B = s.createCommandEncoder();
	B.copyBufferToBuffer(k, 0, z, 0, m * 4), s.queue.submit([B.finish()]), await z.mapAsync(GPUMapMode.READ);
	let U = X(new Float32Array(z.getMappedRange()), p, f);
	z.destroy();
	for (let e of [
		...h.buffers,
		k,
		A,
		j,
		N
	]) e.destroy();
	return Object.assign(U, {
		gpu: o.gpu,
		compileSeconds: l
	});
}
async function ee(e, t, n) {
	let r = await P(), { device: i } = r, { pipelines: a, compileSeconds: o } = await L(r, {
		kernel: "megakernel",
		...R(e),
		realtime: n
	}), s = V(i, e), c = +!!e.lights.sun + s.lightCount + +!!e.environment;
	return {
		device: i,
		gpu: r.gpu,
		compileSeconds: o,
		uploaded: s,
		bindGroupLayout: r.bindGroupLayout,
		pipeline: a.traceRealtime,
		parameterBytes: S,
		parameterWords: (n) => H(e, n, t, s, c).unsigned
	};
}
var te = 4096, ne = 16;
function $(e, t) {
	let n = new Float32Array(Math.max(t, 1) * 4);
	for (let r = 0; r < t; r++) n.set(e.subarray(r * 3, r * 3 + 3), r * 4);
	return n;
}
async function re(e, t, n, r) {
	let i = await P(), { device: a } = i, { count: o, points: s, normals: c } = t, { samples: l, seed: u } = n, { pipelines: d, compileSeconds: f } = await L(i, {
		kernel: "megakernel",
		...R(e),
		texelBake: !0
	}), p = Math.max(o, 1) * 16 * 2;
	if (p > a.limits.maxStorageBufferBindingSize) throw RangeError(`${o} lightmap texels are too many for this WebGPU adapter. Lower the lightmap resolution or use backend "gpu".`);
	let m = V(a, e), h = +!!e.lights.sun + m.lightCount + +!!e.environment, g = H(e, {
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
		width: o,
		height: 1,
		seed: u,
		bounces: n.bounces - 1,
		fireflyClamp: n.fireflyClamp
	}, m, h);
	g.unsigned[q] = l;
	let _ = a.createBuffer({
		label: "accumulation",
		size: p,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
	}), v = a.createBuffer({
		label: "parameters",
		size: C,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	}), y = [$(s, o), $(c, o)].map((e, t) => z(a, e, t === 0 ? "texel points" : "texel normals")), b = a.createBindGroup({
		layout: i.bindGroupLayout,
		entries: [{
			binding: 0,
			resource: {
				buffer: v,
				size: S
			}
		}, ...[
			...m.buffers,
			_,
			...y
		].map((e, t) => ({
			binding: t + 1,
			resource: { buffer: e }
		}))]
	}), x = Math.max(1, Math.ceil(o / 64)), w = Math.min(x, te);
	for (let e = 0; e < l; e++) {
		a.queue.writeBuffer(v, 0, J(g, e, [{
			start: 0,
			count: o
		}], 1, 0, 1, !1));
		let t = a.createCommandEncoder(), n = t.beginComputePass();
		n.setPipeline(d.bakeTexels), n.setBindGroup(0, b, [0]), n.dispatchWorkgroups(w, Math.ceil(x / w)), n.end(), a.queue.submit([t.finish()]), ((e + 1) % ne === 0 || e === l - 1) && (await a.queue.onSubmittedWorkDone(), r());
	}
	let T = a.createBuffer({
		size: p,
		usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
	}), E = a.createCommandEncoder();
	E.copyBufferToBuffer(_, 0, T, 0, p), a.queue.submit([E.finish()]), await T.mapAsync(GPUMapMode.READ);
	let D = new Float32Array(T.getMappedRange()), O = new Float32Array(o * 3), k = new Float32Array(o);
	for (let e = 0; e < o; e++) {
		for (let t = 0; t < 3; t++) O[e * 3 + t] = D[e * 4 + t] / l;
		k[e] = D[(o + e) * 4] / l;
	}
	T.destroy();
	for (let e of [
		...m.buffers,
		_,
		v,
		...y
	]) e.destroy();
	return {
		radiance: O,
		escaped: k,
		gpu: i.gpu,
		compileSeconds: f
	};
}
export { x as DEFAULT_SORT_BY_MATERIAL, b as DEFAULT_WEBGPU_KERNEL, y as WEBGPU_KERNELS, M as gpuKernelCompileCount, M as webGpuKernelCompileCount, k as isWebGpuTracerAvailable, ee as prepareRealtimeKernel, Q as traceOnGpu, Q as traceOnWebGpu, re as traceTexelsOnWebGpu };
