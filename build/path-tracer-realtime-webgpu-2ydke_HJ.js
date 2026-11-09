/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e, t } from "./path-tracer-scene-DTz5cgiX.js";
import { createCamera as n } from "./path-tracer.js";
import { prepareRealtimeKernel as r } from "./path-tracer-webgpu-DrdzCEqK.js";
import { m as i, p as a } from "./path-tracer-gpu-pack-B_ap1Af7.js";
import { a as o, o as s, s as c, t as l } from "./path-tracer-realtime-options-DiPfECqi.js";
var u = {
	declarations: `
@group(0) @binding(9) var<storage, read_write> cacheTable: array<vec4<f32>>;
@group(0) @binding(10) var<storage, read_write> cacheRecords: array<vec4<f32>>;
var<private> recordedSlot: f32 = 0.0;
var<private> recordedRadianceBefore: vec3<f32> = vec3<f32>(0.0);
var<private> recordedThroughput: vec3<f32> = vec3<f32>(1.0);
var<private> firstHitMaterial: f32 = 0.0;

fn normalAxisCode(component: f32) -> u32 {
  if (component > ${i}) { return 2u; }
  if (component < -${i}) { return 0u; }
  return 1u;
}

fn cacheHash(point: vec3<f32>, normal: vec3<f32>) -> u32 {
  let cellSize = bitcast<f32>(params.tileAndDepth.x);
  let levelDistance = bitcast<f32>(params.tileAndDepth.y);
  let level = clamp(floor(log2(max(length(point - params.eye.xyz) / levelDistance, 1.0))), 0.0, 8.0);
  let cell = vec3<i32>(floor(point / (cellSize * exp2(level))));
  let normalCode = normalAxisCode(normal.x) + 3u * normalAxisCode(normal.y) + 9u * normalAxisCode(normal.z);
  var hash = (bitcast<u32>(cell.x) * 73856093u) ^ (bitcast<u32>(cell.y) * 19349663u) ^ (bitcast<u32>(cell.z) * 83492791u);
  hash ^= (normalCode + 1u) * 0x9e3779b1u;
  hash ^= u32(level) * 0x85ebca6bu;
  hash ^= hash >> 16u;
  hash *= 0x7feb352du;
  hash ^= hash >> 15u;
  hash *= 0x846ca68bu;
  hash ^= hash >> 16u;
  return hash & ${a - 1}u;
}

// The mean radiance that arrives at the cell of a surface point; black while the cell has no record yet.
fn cacheLookup(point: vec3<f32>, normal: vec3<f32>) -> vec3<f32> {
  let cell = cacheTable[cacheHash(point, normal)];
  return select(vec3<f32>(0.0), cell.xyz, cell.w >= 1.0);
}

// A cheap estimate of the light one local light brings to the hit point, as lightImportance in the WebGL2 kernel.
fn lightImportance(index: i32, normal: vec3<f32>) -> f32 {
  let base = index * LIGHT_TEXELS;
  let positionType = lights[base];
  let colorBit = lights[base + 1];
  let directionRadius = lights[base + 2];
  let acrossCone = lights[base + 3];
  let intensityRange = lights[base + 5];
  let delta = positionType.xyz - hitPoint;
  let distanceSquared = max(dot(delta, delta), 1e-8);
  let toLight = delta * inverseSqrt(distanceSquared);
  let cosine = 0.1 + max(dot(normal, toLight), 0.0);
  let power = luminance(colorBit.rgb) * intensityRange.x;
  let lightType = i32(positionType.w);
  if (lightType == 2) { return power * max(-dot(directionRadius.xyz, toLight), 0.0) * cosine / distanceSquared; }
  var coneFactor = 1.0;
  if (lightType == 1 && -dot(directionRadius.xyz, toLight) - acrossCone.w <= 0.0) { coneFactor = 0.0; }
  return power * coneFactor * cosine * pointLightFalloff(distanceSquared, intensityRange.y, directionRadius.w);
}

// Draws one emitter: the sun and the sky keep a uniform share, the local lights split theirs by importance mixed with a uniform part.
fn chooseEmitterByImportance(normal: vec3<f32>) -> i32 {
  let emitterCount = params.emittersFlagsSample.x;
  let lightCount = params.sizeBouncesLights.w;
  let uniformShare = 1.0 / f32(emitterCount);
  let draw = nextRandom();
  let firstLightEmitter = select(0, 1, params.emittersFlagsSample.y != 0);
  var total = 0.0;
  if (lightCount > 1) {
    for (var index = 0; index < lightCount; index++) { total += lightImportance(index, normal); }
  }
  selectionProbability = uniformShare;
  if (!(total > 0.0)) { return min(i32(floor(draw * f32(emitterCount))), emitterCount - 1); }
  let lightsShare = f32(lightCount) * uniformShare;
  var cumulative = 0.0;
  for (var emitter = 0; emitter < emitterCount; emitter++) {
    let index = emitter - firstLightEmitter;
    var share = uniformShare;
    if (index >= 0 && index < lightCount) { share = lightsShare * (0.9 * lightImportance(index, normal) / total + 0.1 / f32(lightCount)); }
    cumulative += share;
    selectionProbability = share;
    if (draw < cumulative) { return emitter; }
  }
  return emitterCount - 1;
}
`,
	addLights: "\nfn addLights(depth: i32, normal: vec3<f32>) {\n  let emitterCount = params.emittersFlagsSample.x;\n  if (emitterCount <= 1) {\n    selectionProbability = 1.0;\n    for (var emitter = 0; emitter < emitterCount; emitter++) {\n      sampleEmitter(depth, normal, emitter);\n      flushShadowRay();\n    }\n    return;\n  }\n  sampleEmitter(depth, normal, chooseEmitterByImportance(normal));\n  flushShadowRay();\n}\n",
	firstHit: "if (!featuresRecorded) { firstHitMaterial = f32(hitMaterialIndex) + 1.0; }",
	terminal: "\n    if (depth == bounces && !inFog && !isGlass) {\n      addRadiance(depth, throughput * hitColor * cacheLookup(hitPoint, normal));\n      break;\n    }",
	record: "\n      if (depth == max(bounces - 1, 0) && !isMirror) {\n        recordedSlot = f32(cacheHash(hitPoint, normal)) + 1.0;\n        recordedRadianceBefore = radiance;\n        recordedThroughput = throughput;\n      }",
	main: "\n@compute @workgroup_size(8, 8, 1)\nfn traceRealtime(@builtin(global_invocation_id) id: vec3<u32>) {\n  let width = params.sizeBouncesLights.x;\n  let height = params.sizeBouncesLights.y;\n  if (i32(id.x) >= width || i32(id.y) >= height) { return; }\n  let pixel = id.y * u32(width) + id.x;\n  let sampleIndex = u32(params.emittersFlagsSample.w);\n  let seed = params.seedAndAtlas.x;\n  if (params.emittersFlagsSample.y != 0) { sunFrame = buildFrame(params.sunDirection.xyz); }\n  let jitterX = hashJitter(pixel, sampleIndex, seed, 1u);\n  let jitterY = hashJitter(pixel, sampleIndex, seed, 2u);\n  let screenX = ((f32(id.x) + jitterX) / f32(width) * 2.0 - 1.0) * params.cameraAndClamp.x;\n  let screenY = (1.0 - (f32(id.y) + jitterY) / f32(height) * 2.0) * params.cameraAndClamp.y;\n  let rayDirection = normalize(params.forward.xyz + params.right.xyz * screenX + params.above.xyz * screenY);\n  tracePath(params.eye.xyz, rayDirection, pixel, sampleIndex);\n  if (!(all(radiance >= vec3<f32>(0.0)) && all(radiance < vec3<f32>(1e30)))) { radiance = vec3<f32>(0.0); }\n  if (!(featureDepth >= 0.0 && featureDepth < 1e30)) { featureDepth = 0.0; }\n  if (!(all(featureNormal >= vec3<f32>(-1.5)) && all(featureNormal < vec3<f32>(1.5)))) { featureNormal = vec3<f32>(0.0, 0.0, 1.0); }\n  if (!(all(featureAlbedo >= vec3<f32>(0.0)) && all(featureAlbedo < vec3<f32>(1e30)))) { featureAlbedo = vec3<f32>(1.0); }\n  let pixelCount = u32(width * height);\n  accumulation[pixel] = vec4<f32>(radiance, featureDepth);\n  accumulation[pixelCount + pixel] = vec4<f32>(featureAlbedo, 0.0);\n  accumulation[2u * pixelCount + pixel] = vec4<f32>(featureNormal, firstHitMaterial);\n  // The record: the light the rest of the path brought, per unit of the weight at that hit (the incoming radiance).\n  let recordedTail = clamp((radiance - recordedRadianceBefore) / max(recordedThroughput, vec3<f32>(0.05)), vec3<f32>(0.0), vec3<f32>(params.cameraAndClamp.z));\n  cacheRecords[pixel] = select(vec4<f32>(0.0), vec4<f32>(recordedTail, recordedSlot), recordedSlot > 0.0);\n}\n"
}, d = 1024, f = 32, p = .02, m = 4, h = 2.5, g = 8, _ = 256, v = 16, y = 192, b = `
@group(0) @binding(0) var<storage, read> records: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read_write> sums: array<atomic<u32>>;
@group(0) @binding(2) var<storage, read_write> cacheTable: array<vec4<f32>>;
@group(0) @binding(3) var<uniform> recordCount: vec4<u32>;

// A record is the light the rest of a path brought (rgb) and the cell it belongs to (a, one more than the slot; 0 for none).
@compute @workgroup_size(${_})
fn scatterRecords(@builtin(global_invocation_id) id: vec3<u32>, @builtin(num_workgroups) groups: vec3<u32>) {
  let index = id.y * groups.x * ${_}u + id.x;
  if (index >= recordCount.x) { return; }
  let record = records[index];
  if (record.w < 0.5) { return; }
  let slot = u32(record.w) - 1u;
  let fixedValues = vec3<u32>(min(record.xyz, vec3<f32>(${f}.0)) * ${d}.0);
  atomicAdd(&sums[slot * 4u], fixedValues.x);
  atomicAdd(&sums[slot * 4u + 1u], fixedValues.y);
  atomicAdd(&sums[slot * 4u + 2u], fixedValues.z);
  atomicAdd(&sums[slot * 4u + 3u], 1u);
}

// Folds the records of the frame into the running average of each cell, and empties the sums for the next frame.
@compute @workgroup_size(${_})
fn resolveCells(@builtin(global_invocation_id) id: vec3<u32>, @builtin(num_workgroups) groups: vec3<u32>) {
  let slot = id.y * groups.x * ${_}u + id.x;
  if (slot >= ${a}u) { return; }
  let count = f32(atomicLoad(&sums[slot * 4u + 3u]));
  if (count < 0.5) { return; }
  let sum = vec3<f32>(f32(atomicLoad(&sums[slot * 4u])), f32(atomicLoad(&sums[slot * 4u + 1u])), f32(atomicLoad(&sums[slot * 4u + 2u])));
  for (var word = 0u; word < 4u; word++) { atomicStore(&sums[slot * 4u + word], 0u); }
  let previous = cacheTable[slot];
  let weight = count / (min(previous.w, 128.0) + count);
  cacheTable[slot] = vec4<f32>(mix(previous.xyz, sum / ${d}.0 / count, weight), previous.w + count);
}
`, x = `
struct DenoiseParams {
  eye: vec4<f32>,
  forward: vec4<f32>,
  right: vec4<f32>,
  above: vec4<f32>,
  previousEye: vec4<f32>,
  previousForward: vec4<f32>,
  previousRight: vec4<f32>,
  previousAbove: vec4<f32>,
  halves: vec4<f32>,
  sizes: vec4<i32>,
  settings: vec4<f32>,
  outputLayout: vec4<u32>,
}
// sizes: trace width and height, output width and height. settings: far distance, history limit, reset flag, a-trous step.
// outputLayout: words per output row, 1 when the canvas format is bgra.
@group(0) @binding(0) var<uniform> params: DenoiseParams;

const MINIMUM_ALBEDO: f32 = ${p};
const DEPTH_TOLERANCE: f32 = ${o};
const NORMAL_AGREEMENT: f32 = ${s};

fn luminanceOf(color: vec3<f32>) -> f32 {
  return dot(color, vec3<f32>(0.2126, 0.7152, 0.0722));
}

fn distanceOf(radianceAndDistance: vec4<f32>) -> f32 {
  return select(params.settings.x, radianceAndDistance.w, radianceAndDistance.w > 0.0);
}

fn pixelRayDirection(pixelPosition: vec2<f32>, size: vec2<f32>) -> vec3<f32> {
  let screenX = (pixelPosition.x / size.x * 2.0 - 1.0) * params.halves.x;
  let screenY = (1.0 - pixelPosition.y / size.y * 2.0) * params.halves.y;
  return normalize(params.forward.xyz + params.right.xyz * screenX + params.above.xyz * screenY);
}

// Where a world point was on screen in the previous frame (xy), its distance from the previous eye (z), and w = 1 when it was in front of the camera.
fn projectToPrevious(point: vec3<f32>, size: vec2<f32>) -> vec4<f32> {
  let offset = point - params.previousEye.xyz;
  let alongView = dot(offset, params.previousForward.xyz);
  if (!(alongView > 1e-6)) { return vec4<f32>(0.0); }
  let screenX = dot(offset, params.previousRight.xyz) / alongView / params.halves.z;
  let screenY = dot(offset, params.previousAbove.xyz) / alongView / params.halves.w;
  return vec4<f32>(vec2<f32>(screenX * 0.5 + 0.5, 0.5 - screenY * 0.5) * size, length(offset), 1.0);
}

fn isHistoryConsistent(expectedDistance: f32, historyDistance: f32, normal: vec3<f32>, historyNormal: vec3<f32>, material: f32, historyMaterial: f32) -> bool {
  return abs(historyDistance - expectedDistance) <= DEPTH_TOLERANCE * expectedDistance && dot(normal, historyNormal) >= NORMAL_AGREEMENT && abs(material - historyMaterial) < 0.5;
}

fn pixelIndex(texel: vec2<i32>) -> u32 {
  return u32(texel.y * params.sizes.x + texel.x);
}

fn planeSize() -> u32 {
  return u32(params.sizes.x * params.sizes.y);
}

fn insideTraceImage(texel: vec2<i32>) -> bool {
  return all(texel >= vec2<i32>(0)) && all(texel < params.sizes.xy);
}
`, S = x + ((e) => `
@group(0) @binding(${e}) var<storage, read> partMotion: array<vec4<f32>>;

fn previousPointOf(point: vec3<f32>, material: f32) -> vec4<f32> {
  if (material < 0.5) { return vec4<f32>(point, 1.0); }
  let base = u32(material - 1.0) * 4u;
  let kind = partMotion[base + 3u].x;
  if (kind < 0.5) { return vec4<f32>(point, 1.0); }
  if (kind > 2.0 - 0.5) { return vec4<f32>(point, 0.0); }
  let rowX = partMotion[base];
  let rowY = partMotion[base + 1u];
  let rowZ = partMotion[base + 2u];
  return vec4<f32>(dot(rowX.xyz, point) + rowX.w, dot(rowY.xyz, point) + rowY.w, dot(rowZ.xyz, point) + rowZ.w, 1.0);
}
`)(6) + `
@group(0) @binding(1) var<storage, read> traced: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> tracedPrevious: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> historyPrevious: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read_write> historyCurrent: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read_write> filtered: array<vec4<f32>>;

fn illuminationAt(texel: vec2<i32>) -> vec3<f32> {
  let index = pixelIndex(clamp(texel, vec2<i32>(0), params.sizes.xy - vec2<i32>(1)));
  return traced[index].rgb / max(traced[planeSize() + index].rgb, vec3<f32>(MINIMUM_ALBEDO));
}

@compute @workgroup_size(8, 8, 1)
fn accumulate(@builtin(global_invocation_id) id: vec3<u32>) {
  let texel = vec2<i32>(id.xy);
  if (!insideTraceImage(texel)) { return; }
  let plane = planeSize();
  let index = pixelIndex(texel);
  let tracedValue = traced[index];
  let albedo = traced[plane + index].rgb;
  let normalAndMaterial = traced[2u * plane + index];
  let normal = normalAndMaterial.xyz;
  var illumination = tracedValue.rgb / max(albedo, vec3<f32>(MINIMUM_ALBEDO));
  let size = vec2<f32>(params.sizes.xy);
  let point = params.eye.xyz + pixelRayDirection(vec2<f32>(texel) + 0.5, size) * distanceOf(tracedValue);
  let previousPoint = previousPointOf(point, normalAndMaterial.w);

  var history = vec4<f32>(0.0);
  var historyMoments = vec4<f32>(0.0);
  var historyAlbedo = vec3<f32>(0.0);
  var totalWeight = 0.0;
  let projection = projectToPrevious(previousPoint.xyz, size);
  if (params.settings.z < 0.5 && projection.w > 0.5 && previousPoint.w > 0.5) {
    let base = floor(projection.xy - 0.5);
    let fraction = projection.xy - 0.5 - base;
    for (var tap = 0; tap < 4; tap++) {
      let offset = vec2<i32>(tap & 1, tap >> 1u);
      let historyTexel = vec2<i32>(base) + offset;
      if (!insideTraceImage(historyTexel)) { continue; }
      let weight = select(1.0 - fraction.x, fraction.x, offset.x == 1) * select(1.0 - fraction.y, fraction.y, offset.y == 1);
      let historyIndex = pixelIndex(historyTexel);
      let previousNormal = tracedPrevious[2u * plane + historyIndex];
      if (!isHistoryConsistent(projection.z, distanceOf(tracedPrevious[historyIndex]), normal, previousNormal.xyz, normalAndMaterial.w, previousNormal.w)) { continue; }
      history += weight * historyPrevious[historyIndex];
      historyMoments += weight * historyPrevious[plane + historyIndex];
      historyAlbedo += weight * historyPrevious[2u * plane + historyIndex].rgb;
      totalWeight += weight;
    }
  }

  // While the history is short, a sample far above its eight neighbours is a firefly: bring it down to their mean plus a few
  // deviations. A long history averages the spikes in instead, which keeps the energy a clamp would cut.
  var neighbourSum = 0.0;
  var neighbourSumOfSquares = 0.0;
  for (var offsetY = -1; offsetY <= 1; offsetY++) {
    for (var offsetX = -1; offsetX <= 1; offsetX++) {
      if (offsetX == 0 && offsetY == 0) { continue; }
      let neighbour = luminanceOf(illuminationAt(texel + vec2<i32>(offsetX, offsetY)));
      neighbourSum += neighbour;
      neighbourSumOfSquares += neighbour * neighbour;
    }
  }
  let neighbourMean = neighbourSum / 8.0;
  let neighbourDeviation = sqrt(max(0.0, neighbourSumOfSquares / 8.0 - neighbourMean * neighbourMean));
  let luminanceLimit = neighbourMean * 1.05 + ${h} * neighbourDeviation + 0.01;
  var luminance = luminanceOf(illumination);
  let shortHistory = totalWeight <= 1e-3 || history.w < ${g}.0;
  if (shortHistory && luminance > luminanceLimit) {
    illumination *= luminanceLimit / luminance;
    luminance = luminanceLimit;
  }
  let currentMoments = vec2<f32>(luminance, luminance * luminance);
  var color = illumination;
  var blendedAlbedo = albedo;
  var moments = currentMoments;
  var historyLength = 1.0;
  if (totalWeight > 1e-3) {
    history /= totalWeight;
    historyMoments /= totalWeight;
    historyAlbedo /= totalWeight;
    historyLength = min(history.w + 1.0, params.settings.y);
    let blend = 1.0 / historyLength;
    color = mix(history.rgb, illumination, blend);
    blendedAlbedo = mix(historyAlbedo, albedo, blend);
    moments = mix(historyMoments.xy, currentMoments, blend);
  }
  var variance = max(0.0, moments.y - moments.x * moments.x);
  if (historyLength < ${m}.0) {
    let sum = neighbourSum + luminance;
    let sumOfSquares = neighbourSumOfSquares + luminance * luminance;
    variance = max(0.0, sumOfSquares / 9.0 - (sum / 9.0) * (sum / 9.0));
  }
  historyCurrent[index] = vec4<f32>(color, historyLength);
  historyCurrent[plane + index] = vec4<f32>(moments, variance, 0.0);
  historyCurrent[2u * plane + index] = vec4<f32>(blendedAlbedo, 1.0);
  filtered[index] = vec4<f32>(color, variance);
}
`, C = x + "\n@group(0) @binding(1) var<storage, read> traced: array<vec4<f32>>;\n@group(0) @binding(2) var<storage, read> filterIn: array<vec4<f32>>;\n@group(0) @binding(3) var<storage, read_write> filterOut: array<vec4<f32>>;\n\nconst PLANE_SIGMA: f32 = 0.02;\nconst LUMINANCE_SIGMA: f32 = 4.0;\nconst NORMAL_POWER: f32 = 64.0;\n\nfn kernelWeight(offset: i32) -> f32 {\n  if (offset == 0) { return 0.375; }\n  if (offset == 1) { return 0.25; }\n  return 0.0625;\n}\n\n@compute @workgroup_size(8, 8, 1)\nfn atrous(@builtin(global_invocation_id) id: vec3<u32>) {\n  let texel = vec2<i32>(id.xy);\n  if (!insideTraceImage(texel)) { return; }\n  let plane = planeSize();\n  let size = vec2<f32>(params.sizes.xy);\n  let stride = i32(params.settings.w);\n  let index = pixelIndex(texel);\n  let center = filterIn[index];\n  let centerNormal = traced[2u * plane + index].xyz;\n  let centerDistance = distanceOf(traced[index]);\n  let centerPoint = pixelRayDirection(vec2<f32>(texel) + 0.5, size) * centerDistance;\n  let centerLuminance = luminanceOf(center.rgb);\n  var smoothedVariance = 0.0;\n  for (var offsetY = -1; offsetY <= 1; offsetY++) {\n    for (var offsetX = -1; offsetX <= 1; offsetX++) {\n      let neighbour = clamp(texel + vec2<i32>(offsetX, offsetY), vec2<i32>(0), params.sizes.xy - vec2<i32>(1));\n      smoothedVariance += filterIn[pixelIndex(neighbour)].w * select(0.25, 0.5, offsetX == 0) * select(0.25, 0.5, offsetY == 0);\n    }\n  }\n  let luminanceScale = LUMINANCE_SIGMA * sqrt(max(smoothedVariance, 0.0)) + 1e-4;\n\n  var sumColor = vec3<f32>(0.0);\n  var sumVariance = 0.0;\n  var sumWeight = 0.0;\n  for (var offsetY = -2; offsetY <= 2; offsetY++) {\n    for (var offsetX = -2; offsetX <= 2; offsetX++) {\n      let neighbour = texel + vec2<i32>(offsetX, offsetY) * stride;\n      if (!insideTraceImage(neighbour)) { continue; }\n      let neighbourIndex = pixelIndex(neighbour);\n      let value = filterIn[neighbourIndex];\n      let neighbourDistance = distanceOf(traced[neighbourIndex]);\n      let neighbourPoint = pixelRayDirection(vec2<f32>(neighbour) + 0.5, size) * neighbourDistance;\n      let planeDistance = abs(dot(centerNormal, neighbourPoint - centerPoint));\n      let planeWeight = exp(-planeDistance / (PLANE_SIGMA * centerDistance));\n      let normalWeight = pow(max(dot(centerNormal, traced[2u * plane + neighbourIndex].xyz), 0.0), NORMAL_POWER);\n      let luminanceWeight = exp(-abs(luminanceOf(value.rgb) - centerLuminance) / luminanceScale);\n      let weight = kernelWeight(abs(offsetX)) * kernelWeight(abs(offsetY)) * planeWeight * normalWeight * luminanceWeight;\n      sumColor += weight * value.rgb;\n      sumVariance += weight * weight * value.w;\n      sumWeight += weight;\n    }\n  }\n  filterOut[index] = select(center, vec4<f32>(sumColor / sumWeight, sumVariance / (sumWeight * sumWeight)), sumWeight > 1e-6);\n}\n", w = x + "\n@group(0) @binding(1) var<storage, read> traced: array<vec4<f32>>;\n@group(0) @binding(2) var<storage, read> filtered: array<vec4<f32>>;\n@group(0) @binding(3) var<storage, read> history: array<vec4<f32>>;\n@group(0) @binding(4) var<storage, read_write> outputPixels: array<u32>;\n\nfn toneMap(linearColor: vec3<f32>) -> vec3<f32> {\n  let color = max(linearColor, vec3<f32>(0.0));\n  let mapped = clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), vec3<f32>(0.0), vec3<f32>(1.0));\n  return pow(mapped, vec3<f32>(1.0 / 2.2));\n}\n\n@compute @workgroup_size(8, 8, 1)\nfn present(@builtin(global_invocation_id) id: vec3<u32>) {\n  let outputSize = vec2<f32>(params.sizes.zw);\n  if (id.x >= u32(params.sizes.z) || id.y >= u32(params.sizes.w)) { return; }\n  let traceSize = params.sizes.xy;\n  let plane = planeSize();\n  let position = (vec2<f32>(id.xy) + 0.5) / outputSize * vec2<f32>(traceSize);\n  let nearest = clamp(vec2<i32>(floor(position)), vec2<i32>(0), traceSize - vec2<i32>(1));\n  let nearestIndex = pixelIndex(nearest);\n  let nearestDistance = distanceOf(traced[nearestIndex]);\n  let nearestNormal = traced[2u * plane + nearestIndex].xyz;\n  let base = floor(position - 0.5);\n  let fraction = position - 0.5 - base;\n  var illumination = vec3<f32>(0.0);\n  var albedo = vec3<f32>(0.0);\n  var totalWeight = 0.0;\n  for (var tap = 0; tap < 4; tap++) {\n    let offset = vec2<i32>(tap & 1, tap >> 1u);\n    let texel = clamp(vec2<i32>(base) + offset, vec2<i32>(0), traceSize - vec2<i32>(1));\n    let index = pixelIndex(texel);\n    var weight = select(1.0 - fraction.x, fraction.x, offset.x == 1) * select(1.0 - fraction.y, fraction.y, offset.y == 1);\n    weight *= exp(-abs(distanceOf(traced[index]) - nearestDistance) / (0.02 * nearestDistance));\n    weight *= pow(max(dot(nearestNormal, traced[2u * plane + index].xyz), 0.0), 16.0);\n    illumination += weight * filtered[index].rgb;\n    albedo += weight * history[2u * plane + index].rgb;\n    totalWeight += weight;\n  }\n  if (totalWeight < 1e-5) {\n    illumination = filtered[nearestIndex].rgb;\n    albedo = history[2u * plane + nearestIndex].rgb;\n    totalWeight = 1.0;\n  }\n  let color = toneMap(illumination / totalWeight * max(albedo / totalWeight, vec3<f32>(MINIMUM_ALBEDO)));\n  let bytes = vec3<u32>(color * 255.0 + 0.5);\n  let swapped = params.outputLayout.y == 1u;\n  let packedColor = select(bytes.x, bytes.z, swapped) | (bytes.y << 8u) | (select(bytes.z, bytes.x, swapped) << 16u) | (255u << 24u);\n  outputPixels[id.y * params.outputLayout.x + id.x] = packedColor;\n}\n";
function T(e, t, n) {
	return e.createComputePipelineAsync({
		layout: "auto",
		compute: {
			module: t,
			entryPoint: n
		}
	});
}
async function E(e, t, n) {
	let r = e.createShaderModule({
		label: t,
		code: n
	}), i = (await r.getCompilationInfo()).messages.filter((e) => e.type === "error");
	if (i.length > 0) throw Error(`The WebGPU real-time ${t} shader did not compile: ${i.slice(0, 8).map((e) => `${e.lineNum}: ${e.message}`).join("; ")}`);
	return r;
}
var D = (e, t, n, r = 0) => e.createBuffer({
	label: t,
	size: Math.max(16, n),
	usage: GPUBufferUsage.STORAGE | r
}), O = (e, t, n) => e.createBuffer({
	label: t,
	size: n,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
}), k = (e, t, n) => e.createBindGroup({
	layout: t.getBindGroupLayout(0),
	entries: n.map((e, t) => ({
		binding: t,
		resource: { buffer: e }
	}))
});
async function A(e) {
	let t = await E(e, "radiance cache", b), [n, r] = await Promise.all([T(e, t, "scatterRecords"), T(e, t, "resolveCells")]), i = D(e, "radiance cache", a * 16, GPUBufferUsage.COPY_DST), o = D(e, "radiance cache sums", a * 16), s = O(e, "record count", v), c = null, l = null;
	return {
		table: i,
		clear(e) {
			e.clearBuffer(i);
		},
		encode(t, u, d) {
			e.queue.writeBuffer(s, 0, new Uint32Array([
				d,
				0,
				0,
				0
			])), c ??= e.createBindGroup({
				layout: n.getBindGroupLayout(0),
				entries: [
					[0, u],
					[1, o],
					[3, s]
				].map(([e, t]) => ({
					binding: e,
					resource: { buffer: t }
				}))
			}), l ??= e.createBindGroup({
				layout: r.getBindGroupLayout(0),
				entries: [o, i].map((e, t) => ({
					binding: t + 1,
					resource: { buffer: e }
				}))
			}), t.setPipeline(n), t.setBindGroup(0, c);
			let f = Math.ceil(d / _);
			t.dispatchWorkgroups(Math.min(f, 4096), Math.ceil(f / 4096)), t.setPipeline(r), t.setBindGroup(0, l), t.dispatchWorkgroups(4096, a / _ / 4096);
		},
		dispose() {
			for (let e of [
				i,
				o,
				s
			]) e.destroy();
		}
	};
}
var j = (e) => Math.ceil(e * 4 / 256) * 64;
function M(e, t, n, r, i, a, o) {
	let s = /* @__PURE__ */ new ArrayBuffer(y), c = new Float32Array(s), l = new Int32Array(s), u = new Uint32Array(s), { camera: d, previousCamera: f } = n;
	c.set([
		...d.eye,
		0,
		...d.forward,
		0,
		...d.right,
		0,
		...d.above,
		0
	], 0), c.set([
		...f.eye,
		0,
		...f.forward,
		0,
		...f.right,
		0,
		...f.above,
		0
	], 16), c.set([
		d.halfWidth,
		d.halfHeight,
		f.halfWidth,
		f.halfHeight
	], 32), l.set(r, 36), c.set([
		n.farDistance,
		n.historyLimit,
		+!!n.resetHistory,
		i
	], 40), u.set([
		a,
		+!!o,
		0,
		0
	], 44), e.queue.writeBuffer(t, 0, s);
}
async function N(e, { traceWidth: t, traceHeight: n, outputWidth: r, outputHeight: i, tracedBuffers: a, motionBuffer: o, historyLimit: s = 48, filterIterations: c = 4, swapped: l = !1 }) {
	let [u, d, f] = await Promise.all([
		E(e, "accumulate", S),
		E(e, "a-trous", C),
		E(e, "present", w)
	]), [p, m, h] = await Promise.all([
		T(e, u, "accumulate"),
		T(e, d, "atrous"),
		T(e, f, "present")
	]), g = t * n * 16, _ = j(r), v = [
		t,
		n,
		r,
		i
	], b = [0, 1].map((t) => D(e, `history ${t}`, g * 3)), x = [0, 1].map((t) => D(e, `filter ${t}`, g)), A = D(e, "output pixels", _ * 4 * i, GPUBufferUsage.COPY_SRC), N = O(e, "accumulate parameters", y), P = Array.from({ length: c }, () => O(e, "a-trous parameters", y)), F = O(e, "present parameters", y), I = x[c % 2], L = (e, t) => [Math.ceil(e / 8), Math.ceil(t / 8)], R = [0, 1].map((t) => ({
		accumulate: k(e, p, [
			N,
			a[t],
			a[1 - t],
			b[1 - t],
			b[t],
			x[0],
			o
		]),
		atrous: P.map((n, r) => k(e, m, [
			n,
			a[t],
			x[r % 2],
			x[1 - r % 2]
		])),
		present: k(e, h, [
			F,
			a[t],
			I,
			b[t],
			A
		])
	}));
	return {
		outputBuffer: A,
		rowWords: _,
		encode(a, o, c) {
			let u = {
				...c,
				historyLimit: s
			};
			M(e, N, u, v, 1, _, l), P.forEach((t, n) => M(e, t, u, v, 1 << n, _, l)), M(e, F, u, v, 1, _, l), a.setPipeline(p), a.setBindGroup(0, R[o].accumulate), a.dispatchWorkgroups(...L(t, n)), a.setPipeline(m);
			for (let e of R[o].atrous) a.setBindGroup(0, e), a.dispatchWorkgroups(...L(t, n));
			a.setPipeline(h), a.setBindGroup(0, R[o].present), a.dispatchWorkgroups(...L(r, i));
		},
		dispose() {
			for (let e of [
				...b,
				...x,
				A,
				N,
				F,
				...P
			]) e.destroy();
		}
	};
}
// src/path-tracer-realtime-webgpu.js
var P = 48, F = 49, I = 43, L = /* @__PURE__ */ new WeakSet();
function R(e) {
	L.has(e) || (L.add(e), e.addEventListener("uncapturederror", (e) => console.error(`WebGPU real-time tracer: ${e.error.message}`)));
}
function z(e, t) {
	let n = typeof document > "u" ? new OffscreenCanvas(e, t) : document.createElement("canvas");
	return n.width = e, n.height = t, n;
}
async function B(i, a, o) {
	let { outputWidth: s, outputHeight: d, traceWidth: f, traceHeight: p, options: m, historyLimit: h, filterIterations: g, cacheCellSize: _, followPartMotion: v } = a, y = null, b = null, x = null, S = null, C = null, w = null, T = null, E = null, D = null, O = null, k = null, j = null, M = null, L = null, B = !1, V = null, H = null, U = f * p, W = navigator.gpu.getPreferredCanvasFormat() === "bgra8unorm", G = 0, K = 0, q = null, J = !0, Y = !0, X = !1, Z = async (n, i, a = null) => {
		let c = a !== null;
		L = a, j = n, M = i, y = e(n, i);
		let v = await r(y, m, u), P = b;
		b = v, x = b.device, R(x), S || (S = [0, 1].map((e) => x.createBuffer({
			label: `traced ${e}`,
			size: U * 16 * 3,
			usage: GPUBufferUsage.STORAGE
		})), O = x.createBuffer({
			label: "cache records",
			size: U * 16,
			usage: GPUBufferUsage.STORAGE
		}), D = x.createBuffer({
			label: "realtime parameters",
			size: 512,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		}), k = x.createBuffer({
			label: "part motion",
			size: t * 16 * 4,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
		}), C = await A(x), w = await N(x, {
			traceWidth: f,
			traceHeight: p,
			outputWidth: s,
			outputHeight: d,
			tracedBuffers: S,
			motionBuffer: k,
			historyLimit: h,
			filterIterations: g,
			swapped: W
		}), T = o ?? z(s, d), E = T.getContext("webgpu"), E.configure({
			device: x,
			format: navigator.gpu.getPreferredCanvasFormat(),
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
			alphaMode: "opaque"
		})), P?.uploaded.buffers.forEach((e) => e.destroy()), V = [0, 1].map((e) => x.createBindGroup({
			layout: b.bindGroupLayout,
			entries: [{
				binding: 0,
				resource: {
					buffer: D,
					size: b.parameterBytes
				}
			}, ...[
				...b.uploaded.buffers,
				S[e],
				C.table,
				O
			].map((e, t) => ({
				binding: t + 1,
				resource: { buffer: e }
			}))]
		})), H = l(y, _), c || (q = null, J = !0, Y = !0);
	};
	await Z(i.parts, i.environment ?? {});
	let Q = (e) => {
		let t = b.parameterWords(e), n = new Float32Array(t.buffer);
		n[P] = H.cellSize, n[F] = H.levelDistance, t[I] = K + 1, x.queue.writeBuffer(D, 0, t);
	}, $ = () => {
		L ? (x.queue.writeBuffer(k, 0, L), L = null, B = !0) : B &&= (x.queue.writeBuffer(k, 0, c(j, j)), !1);
	}, ee = (e, t) => {
		$();
		let n = x.createCommandEncoder();
		Y &&= (C.clear(n), !1);
		let r = n.beginComputePass();
		r.setPipeline(b.pipeline), r.setBindGroup(0, V[G], [0]), r.dispatchWorkgroups(Math.ceil(f / 8), Math.ceil(p / 8)), C.encode(r, O, U), w.encode(r, G, {
			camera: e,
			previousCamera: t,
			resetHistory: J,
			farDistance: y.farDistance
		}), r.end(), n.copyBufferToTexture({
			buffer: w.outputBuffer,
			bytesPerRow: w.rowWords * 4,
			rowsPerImage: d
		}, { texture: E.getCurrentTexture() }, {
			width: s,
			height: d
		}), x.queue.submit([n.finish()]);
	};
	return {
		gpu: b.gpu,
		backend: "webgpu",
		fallbackReason: null,
		get canvas() {
			return T;
		},
		width: s,
		height: d,
		traceWidth: f,
		traceHeight: p,
		get compileSeconds() {
			return b.compileSeconds;
		},
		get frameCount() {
			return K;
		},
		async update({ parts: e, environment: t }) {
			if (!e) return;
			let n = j?.length === e.length && (t === void 0 || t === M) ? c(j, e) : null, r = n !== null && e.some((e, t) => n[t * 16 + 12] !== 2);
			await Z(e, t ?? M ?? {}, r ? v ? n : c(e, e) : null);
		},
		resetHistory() {
			J = !0;
		},
		frame(e, { wait: t = !1 } = {}) {
			if (X) throw Error("This real-time tracer was disposed.");
			let r = n(e, s, d), i = q ?? r;
			return Q(r), q = r, ee(r, i), J = !1, G = 1 - G, K++, {
				frame: K,
				done: t ? x.queue.onSubmittedWorkDone() : void 0
			};
		},
		async readFrame() {
			let e = w.rowWords * 4, t = x.createBuffer({
				size: e * d,
				usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
			}), n = x.createCommandEncoder();
			n.copyBufferToBuffer(w.outputBuffer, 0, t, 0, e * d), x.queue.submit([n.finish()]), await t.mapAsync(GPUMapMode.READ);
			let r = new Uint8Array(t.getMappedRange()), i = new Uint8ClampedArray(s * d * 4);
			for (let t = 0; t < d; t++) for (let n = 0; n < s; n++) {
				let a = t * e + n * 4, o = (t * s + n) * 4;
				i[o] = r[a + (W ? 2 : 0)], i[o + 1] = r[a + 1], i[o + 2] = r[a + (W ? 0 : 2)], i[o + 3] = 255;
			}
			return t.destroy(), {
				width: s,
				height: d,
				rgba: i
			};
		},
		dispose() {
			X = !0, C.dispose(), w.dispose();
			for (let e of [
				...S,
				O,
				D,
				k,
				...b.uploaded.buffers
			]) e.destroy();
			E.unconfigure();
		}
	};
}
export { B as createWebGpuRealtimeTracer };
