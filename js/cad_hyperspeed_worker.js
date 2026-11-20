/**
 * CADBRIDGE PRO 4K — HYPER-SPEED 31 WEB WORKER (v31.4-HYPERSPEED)
 * Esegue calcoli geometrici CAD (quote cm, area, perimetro, scarto chiusura, RAI)
 * e generazione script Blender (.py) fuori dal main thread per mantenere 60 FPS costanti.
 */
'use strict';

function computePolygonMetrics(quotes, wallHeightCm = 300, windowsAreaMq = 3.2) {
  let x = 0, y = 0;
  const pts = [[0, 0]];
  for (const seg of (quotes || [])) {
    const dx = Number(seg[0]) || 0;
    const dy = Number(seg[1]) || 0;
    x += dx;
    y += dy;
    pts.push([x, y]);
  }
  const ex = x;
  const ey = y;
  const err = Math.hypot(ex, ey);
  let area2 = 0;
  let perimCm = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    area2 += (x1 * y2 - x2 * y1);
    perimCm += Math.hypot(x2 - x1, y2 - y1);
  }
  const areaMq = Math.abs(area2) / 20000;
  const perimM = perimCm / 100;
  const facadeMq = perimM * (wallHeightCm / 100);
  const rai = areaMq > 0 ? windowsAreaMq / areaMq : 0;
  return {
    ptsCount: pts.length,
    ex: +ex.toFixed(2),
    ey: +ey.toFixed(2),
    err: +err.toFixed(2),
    areaMq: +areaMq.toFixed(2),
    perimM: +perimM.toFixed(2),
    facadeMq: +facadeMq.toFixed(2),
    wallHeightCm: Number(wallHeightCm) || 300,
    rai: +rai.toFixed(3),
    raiOk: rai >= 0.125
  };
}

function buildBlenderScript(cfg = {}) {
  const area = Number(cfg.areaMq) || 145.5;
  const h = +((Number(cfg.heightCm) || 300) / 100).toFixed(2);
  const w = +(Math.sqrt(area * 1.35)).toFixed(2);
  const d = +(area / Math.max(1, w)).toFixed(2);
  const mode = cfg.mode || '2D_TO_3D_BLENDER_SCRIPT';
  return [
    `# CADBridge Pro 4K — Hyper-Speed Web Worker Blender Script (${mode})`,
    `import bpy, math`,
    `bpy.ops.wm.read_factory_settings(use_empty=True)`,
    `scene = bpy.context.scene`,
    `scene.render.engine = 'CYCLES'`,
    `scene.render.resolution_x, scene.render.resolution_y = 3840, 2160`,
    `bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))`,
    `bpy.context.active_object.scale = (${w}, ${d}, 1)`,
    `for n, loc, sc in [('N',(0,${d}/2,${h}/2),(${w},0.3,${h})),('S',(0,-${d}/2,${h}/2),(${w},0.3,${h})),('E',(${w}/2,0,${h}/2),(0.3,${d},${h})),('W',(-${w}/2,0,${h}/2),(0.3,${d},${h}))]:`,
    `    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)`,
    `    bpy.context.active_object.name = 'CB_Wall_' + n`,
    `    bpy.context.active_object.scale = sc`,
    `print('[CADBridge v31.4-HYPERSPEED] Digital Twin ${area}m2 generato.')`
  ].join('\n');
}

self.onmessage = function (ev) {
  const t0 = performance.now();
  const { id, type, payload } = ev.data || {};
  try {
    let result = null;
    if (type === 'COMPUTE_GEOM') {
      result = computePolygonMetrics(payload?.quotes, payload?.heightCm, payload?.windowsAreaMq);
    } else if (type === 'BUILD_BLENDER_PY') {
      result = { py: buildBlenderScript(payload || {}) };
    } else {
      result = { pong: true, version: '31.4-HYPERSPEED' };
    }
    self.postMessage({ id, ok: true, result, elapsedMs: +(performance.now() - t0).toFixed(2) });
  } catch (err) {
    self.postMessage({ id, ok: false, error: err?.message || String(err), elapsedMs: +(performance.now() - t0).toFixed(2) });
  }
};
