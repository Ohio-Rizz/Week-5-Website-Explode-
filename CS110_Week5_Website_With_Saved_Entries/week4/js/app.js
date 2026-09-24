"use strict";
const canvas = document.getElementById("renderCanvas");
const statusText = document.getElementById("scene-status");
const resetButton = document.getElementById("reset-view");
const explodeButton = document.getElementById("explode-sphere");
const reassembleButton = document.getElementById("reassemble-sphere");
let engine, scene, camera, sphere, fragments = [], exploded = false, transitioning = false;

function setReady(ready) {
  [resetButton, explodeButton, reassembleButton].forEach(b => { if (b) b.disabled = !ready; });
}
function createScene() {
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.035, 0.055, 0.105, 1);
  camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI / 2, 1.12, 8.5, new BABYLON.Vector3(0, 0.9, 0), scene);
  camera.attachControl(canvas, true);
  camera.wheelPrecision = 55;
  camera.lowerRadiusLimit = 4;
  camera.upperRadiusLimit = 18;
  const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 1.05;
  const key = new BABYLON.PointLight("key", new BABYLON.Vector3(-3, 6, -4), scene);
  key.intensity = 0.7;

  sphere = BABYLON.MeshBuilder.CreateSphere("themeSphere", { diameter: 2.35, segments: 32 }, scene);
  sphere.position.y = 1.25;
  const sm = new BABYLON.StandardMaterial("sphereMat", scene);
  sm.diffuseColor = new BABYLON.Color3(.16, .45, 1);
  sm.emissiveColor = new BABYLON.Color3(.06, .18, .55);
  sm.specularColor = new BABYLON.Color3(.9, .95, 1);
  sphere.material = sm;

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
  const gm = new BABYLON.StandardMaterial("groundMat", scene);
  gm.diffuseColor = new BABYLON.Color3(.09, .13, .24);
  gm.specularColor = new BABYLON.Color3(.2, .25, .35);
  ground.material = gm;

  // Sphere-like fragments are hidden until the explode action is clicked.
  const fm = new BABYLON.StandardMaterial("fragmentMat", scene);
  fm.diffuseColor = new BABYLON.Color3(.38, .68, 1);
  fm.emissiveColor = new BABYLON.Color3(.08, .2, .5);
  const count = 100, golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const yy = 1 - 2 * (i + .5) / count;
    const rr = Math.sqrt(1 - yy * yy), theta = golden * i;
    const dir = new BABYLON.Vector3(Math.cos(theta) * rr, yy, Math.sin(theta) * rr);
    const size = .105 + Math.random() * .045;
    const m = BABYLON.MeshBuilder.CreateSphere("shard" + i, { diameter: size, segments: 5 }, scene);
    m.material = fm;
    const home = sphere.position.add(dir.scale(1.12));
    m.position.copyFrom(home);
    m.setEnabled(false);
    fragments.push({ mesh: m, home, end: home.add(dir.scale(1.8 + Math.random() * 2.3)) });
  }
  return scene;
}
function transition(toExploded) {
  if (transitioning || exploded === toExploded) return;
  transitioning = true;
  exploded = toExploded;
  sphere.setEnabled(false);
  let finished = 0;
  const duration = 850, start = performance.now();
  fragments.forEach(f => {
    f.mesh.setEnabled(true);
    f.from = f.mesh.position.clone();
    f.to = (toExploded ? f.end : f.home).clone();
  });
  const observer = scene.onBeforeRenderObservable.add(() => {
    const t = Math.min(1, (performance.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    fragments.forEach(f => f.mesh.position = BABYLON.Vector3.Lerp(f.from, f.to, eased));
    if (t >= 1) {
      scene.onBeforeRenderObservable.remove(observer);
      transitioning = false;
      if (!exploded) {
        fragments.forEach(f => f.mesh.setEnabled(false));
        sphere.setEnabled(true);
      }
      statusText.textContent = exploded ? "Sphere exploded — choose Reassemble to restore it." : "Sphere reassembled.";
    }
  });
  statusText.textContent = toExploded ? "Breaking the sphere into fragments…" : "Reassembling the sphere…";
}

setReady(false);
try {
  if (!window.BABYLON) throw new Error("Babylon.js did not load. Keep the week4/vendor folder beside this page.");
  engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  createScene();
  engine.runRenderLoop(() => { if (scene) scene.render(); });
  window.addEventListener("resize", () => engine && engine.resize());
  explodeButton.addEventListener("click", () => transition(true));
  reassembleButton.addEventListener("click", () => transition(false));
  resetButton.addEventListener("click", () => {
    camera.alpha = -Math.PI / 2; camera.beta = 1.12; camera.radius = 8.5;
    camera.setTarget(new BABYLON.Vector3(0, .9, 0));
    statusText.textContent = "Camera reset.";
  });
  setReady(true);
  statusText.textContent = "Scene ready — sphere and ground plane are visible.";
  console.info("CS110 3D scene initialized successfully.");
} catch (err) {
  console.error("CS110 3D startup error:", err);
  statusText.textContent = "3D startup failed: " + (err && err.message ? err.message : String(err)) + " — check that the complete week4 folder is together and WebGL is enabled.";
  canvas.hidden = true;
  setReady(false);
}
