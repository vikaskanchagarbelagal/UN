// =================== Scene & Renderer ===================
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1a1206, 0.05);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.65, 5.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//renderer.setSize(window.innerWidth, window.innerHeight);
let width=window.innerWidth;
let height=window.innerHeight;

if(window.innerWidth<640){
  height=window.innerHeight*0.45;
  width=window.innerWidth*0.45;
  
}
renderer.setSize(width,height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.autoClear = false;
document.getElementById("scene-container").appendChild(renderer.domElement);

// =================== Lights ===================
scene.add(new THREE.HemisphereLight(0x77ffe8, 0x091018, 1.15));
const dir = new THREE.DirectionalLight(0xffffff, 1.15);
dir.position.set(3, 7, 5);
scene.add(dir);

// groups
const bgGroup = new THREE.Group();
const modelGroup = new THREE.Group();
scene.add(bgGroup);
scene.add(modelGroup);

// =================== LIVE CONTROLS ===================
const SETTINGS = {
  particles: {
    count: 900, baseY: 0.50, height: 5.0, speedMin: 0.05, speedMax: 0.30
  },
  male: {
    pos: { x: 0, y: 1.6, z: 0.0 }, scale: { x: 2, y: 1.9, z: 2.4 }, rot: { x: 0.1, y: 0, z: 0 }
  },
  female: {
    pos: { x: 0, y: 1.5, z: 0.0 }, scale: {x: 1.6, y: 1.9, z: 3.3 }, rot: { x: 0.1, y: 0, z: 0 }
  },
  dresses: {
    male: [

      {
        // 1st male dress 
        offset: { x: 0.02, y: -0.1, z: 0.02 },
        scale: { x: 1.5, y: 1.45, z: 1.5 },
        rot: { x: 0.02, y: 0.02, z: 0 }, 
        revealLift: 0.25,
        fadeSeconds: 1.5
      },
      {
        // 2nd male dress 
        offset: { x: 0.00, y: -0.1, z: 0.02 },
        scale: { x: 1.6, y: 1.5, z: 1.5 },
        rot: { x: 0.02, y: 0.02, z: 0.0 }, 
        revealLift: 0.25,
        fadeSeconds: 1.5
      }
    ],
    female: [
      {
        // 1st female dress 
        offset: { x: 0.01, y: 0.48, z: 0 },
        scale: { x: 0.72, y: 0.9, z: 1.6 },
        rot: { x: -0.1, y: -0.042, z: 0.0 },
        revealLift: 0.25,
        fadeSeconds: 1.5
      },
      {
        // 2nd female dress 
        offset: { x: 0.0, y: 0.54, z: 0.2 },
        scale: {x: 0.8, y: 0.75, z: 1 },
        rot: { x: -0.1, y: -0.042, z: 0.0 },
        revealLift: 0.25,
        fadeSeconds: 1.5
      }
    ]
  }
};

// =================== Particles ===================
(function makeParticles(){
  
  const particleTexture = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/sprites/disc.png"
  );
  const count = SETTINGS.particles.count;
  const geom = new THREE.BufferGeometry();
  const pos = new Float32Array(count*3);
  const spd = new Float32Array(count);

  for(let i=0;i<count;i++){
    pos[i*3+0] = (Math.random()-0.5)*8;
    pos[i*3+1] = SETTINGS.particles.baseY + Math.random()*SETTINGS.particles.height;
    pos[i*3+2] = (Math.random()-0.5)*8;
    spd[i] = SETTINGS.particles.speedMin + Math.random()*(SETTINGS.particles.speedMax-SETTINGS.particles.speedMin);
  }

  geom.setAttribute("position", new THREE.BufferAttribute(pos,3));
  geom.setAttribute("speed", new THREE.BufferAttribute(spd,1));
  const mat = new THREE.PointsMaterial({ color:0xd4af37, size:0.035, map: particleTexture, transparent:true, opacity:0.9, depthWrite:false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geom,mat);
  bgGroup.add(pts);

  pts.userData.update=(dt)=>{
    const p=pts.geometry.attributes.position.array;
    const s=pts.geometry.attributes.speed.array;
    for(let i=0;i<s.length;i++){
      p[i*3+1]+=s[i]*dt*0.4;
      if(p[i*3+1]>SETTINGS.particles.baseY+SETTINGS.particles.height){ p[i*3+1]=SETTINGS.particles.baseY; }
    }
    pts.geometry.attributes.position.needsUpdate=true;
  };
})();

// =================== Helpers ===================
const loader = new THREE.GLTFLoader();

function centerWrap(obj){
  const box=new THREE.Box3().setFromObject(obj);
  const center=new THREE.Vector3(); box.getCenter(center);
  const wrap=new THREE.Group();
  obj.position.sub(center);
  wrap.add(obj);
  wrap.userData._rawSize=box.getSize(new THREE.Vector3());
  return wrap;
}
function setWorldPosition(o,x,y,z){ o.position.set(x,y,z); }
function setWorldScaleXYZ(o,x,y,z){ o.scale.set(x,y,z); }
function setWorldRotation(o,rx,ry,rz){ o.rotation.set(rx,ry,rz); }

function normalizeAvatar(wrap,targetHeight,cfg){
  const raw=wrap.userData._rawSize;
  const s=(raw.y>0?targetHeight/raw.y:1);
  wrap.scale.set(s,s,s);
  setWorldRotation(wrap,cfg.rot.x,cfg.rot.y,cfg.rot.z);
  setWorldScaleXYZ(wrap,wrap.scale.x*cfg.scale.x,wrap.scale.y*cfg.scale.y,wrap.scale.z*cfg.scale.z);
  setWorldPosition(wrap,cfg.pos.x,cfg.pos.y,cfg.pos.z);
}
function normalizeDressToHeight(wrap,targetHeight){
  const raw=wrap.userData._rawSize;
  const s=(raw.y>0?targetHeight/raw.y:1);
  wrap.scale.set(s,s,s);
}

// =================== Render Targets & Compositor (with depth) ===================
function createRTWithDepth(w,h){
  const rt = new THREE.WebGLRenderTarget(w,h,{
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat
  });
  // attach depth texture so we can compare depths in the composite shader
  rt.depthTexture = new THREE.DepthTexture();
  // UnsignedShort is widely supported; Float could be used if needed
  rt.depthTexture.type = THREE.UnsignedShortType;
  rt.depthBuffer = true;
  return rt;
}

let bodyRT = createRTWithDepth(width, height);
let dressRT = createRTWithDepth(width, height);

const compUniforms = {
  tBody:    { value: bodyRT.texture },
  tDress:   { value: dressRT.texture },
  tBodyDepth:{ value: bodyRT.depthTexture },
  tDressDepth:{ value: dressRT.depthTexture },
  reveal:   { value: 1.0 },
  glitchOn: { value: 0.0 },
  time:     { value: 0.0 },
  glitchAmt:{ value: 0.9 },
  cameraNear:{ value: camera.near },
  cameraFar: { value: camera.far }
};

const compScene = new THREE.Scene();
const compCamera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);

// composite shader: uses depth comparison to occlude dress behind body
const compositeMat = new THREE.ShaderMaterial({
  transparent: true,
  depthTest: false,
  uniforms: compUniforms,
  vertexShader: `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `,
  fragmentShader: `
    varying vec2 vUv;

    uniform sampler2D tBody;
    uniform sampler2D tDress;
    uniform sampler2D tBodyDepth;
    uniform sampler2D tDressDepth;

    uniform float reveal;
    uniform float glitchOn;
    uniform float time;
    uniform float glitchAmt;

    float hash21(vec2 p){
      p = fract(p * vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }

    vec3 rgbShift(sampler2D tex, vec2 uv, float t, float amt){
      float bands = 20.0;
      float offset = (hash21(vec2(floor(uv.y * bands), floor(t * 10.0))) - 0.5) * amt * 0.04;

      vec2 uvR = uv + vec2(offset * 1.2, 0.0);
      vec2 uvG = uv + vec2(offset * 0.6, 0.0);
      vec2 uvB = uv + vec2(offset * 0.2, 0.0);

      vec4 r = texture2D(tex, uvR);
      vec4 g = texture2D(tex, uvG);
      vec4 b = texture2D(tex, uvB);

      return vec3(r.r, g.g, b.b);
    }

    void main(){

      vec4 bodyCol  = texture2D(tBody, vUv);
      vec4 dressCol = texture2D(tDress, vUv);

      // Reveal mask (top to bottom)
      float threshold = 1.0 - clamp(reveal, 0.0, 1.0);
      float revealMask = step(threshold, vUv.y);
      float dressAlpha = dressCol.a * revealMask;

      // Direct depth comparison (NO view space reconstruction)
      float bd = texture2D(tBodyDepth, vUv).x;
      float dd = texture2D(tDressDepth, vUv).x;

      bool bodyHasDepth  = bd < 0.9999;
      bool dressHasDepth = dd < 0.9999;

      // Smaller depth value = closer to camera
      bool dressInFront = false;

      if(dressHasDepth && bodyHasDepth){
        dressInFront = (dd < bd);
      } 
      else if(dressHasDepth && !bodyHasDepth){
        dressInFront = true;
      }

      vec3 finalColor = bodyCol.rgb;
      float finalAlpha = bodyCol.a;

      if(glitchOn > 0.5){

        float t = time * 0.001;
        vec3 gBody  = rgbShift(tBody, vUv, t, glitchAmt);
        vec3 gDress = rgbShift(tDress, vUv, t, glitchAmt);

        finalColor = gBody;

        if(dressAlpha > 0.0001 && dressInFront){
          finalColor = mix(gBody, gDress, dressAlpha);
        }

        float flick = step(0.8, fract(sin(dot(vUv * 1000.0,
                      vec2(12.9898,78.233))) * 43758.5453 + time));
        finalColor *= (1.0 - 0.05 * flick);

        finalAlpha = max(bodyCol.a, (dressInFront ? dressAlpha : bodyCol.a));
      }
      else {

        if(dressAlpha > 0.0001 && dressInFront){
          finalColor = mix(bodyCol.rgb, dressCol.rgb, dressAlpha);
          finalAlpha = max(bodyCol.a, dressAlpha);
        }
      }

      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `

});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), compositeMat);
compScene.add(quad);

// =================== Avatars & Dresses ===================
let maleWrap, femaleWrap;
const outfitWraps = { male: [], female: [] };
const TARGET_HEIGHT = 1.9;

loader.load("models/male.glb", g=>{
  maleWrap = centerWrap(g.scene);
  normalizeAvatar(maleWrap, TARGET_HEIGHT, SETTINGS.male);
  modelGroup.add(maleWrap);
});
loader.load("models/female.glb", g=>{
  femaleWrap = centerWrap(g.scene);
  normalizeAvatar(femaleWrap, TARGET_HEIGHT, SETTINGS.female);
  femaleWrap.visible = false;
  modelGroup.add(femaleWrap);
});

function loadDress(path, gender, index){
  loader.load(path, g=>{
    const wrap = centerWrap(g.scene);
    normalizeDressToHeight(wrap, TARGET_HEIGHT);
    wrap.visible = false;
    outfitWraps[gender][index] = wrap;
    modelGroup.add(wrap);
    alignDressToBody(gender, index);
  });
}

function alignDressToBody(gender, index){
  const body = (gender === "male") ? maleWrap : femaleWrap;
  const wrap = outfitWraps[gender][index];
  if(!body || !wrap) return;

  const cfgBody = SETTINGS[gender];
  const cfgDress = SETTINGS.dresses[gender][index];

  // Reset transform first (prevents scale stacking bugs)
  wrap.position.set(0,0,0);
  wrap.rotation.set(0,0,0);

  // Base on body transform
  setWorldPosition(wrap, cfgBody.pos.x, cfgBody.pos.y, cfgBody.pos.z);
  setWorldRotation(wrap, cfgBody.rot.x, cfgBody.rot.y, cfgBody.rot.z);

  // IMPORTANT: Multiply existing normalized scale (do NOT overwrite)
  wrap.scale.x *= cfgDress.scale.x;
  wrap.scale.y *= cfgDress.scale.y;
  wrap.scale.z *= cfgDress.scale.z;

  // Apply dress offsets
  wrap.position.x += cfgDress.offset.x;
  wrap.position.y += cfgDress.offset.y;
  wrap.position.z += cfgDress.offset.z;

  wrap.rotation.x += cfgDress.rot.x;
  wrap.rotation.y += cfgDress.rot.y;
  wrap.rotation.z += cfgDress.rot.z;
}

loadDress("models/maleDress1.glb","male",0);
loadDress("models/maleDress2.glb","male",1);
loadDress("models/femaleDress1.glb","female",0);
loadDress("models/femaleDress2.glb","female",1);

function realignAllDresses(){
  alignDressToBody("male",0);
  alignDressToBody("male",1);
  alignDressToBody("female",0);
  alignDressToBody("female",1);
}

// =================== Sequence ===================
const sequence = [
  { type:"body", gender:"male" },
  { type:"dress", gender:"male", index:0 },
  { type:"body", gender:"female" },
  { type:"dress", gender:"female", index:0 },
  { type:"body", gender:"male" },
  { type:"dress", gender:"male", index:1 },
  { type:"body", gender:"female" },
  { type:"dress", gender:"female", index:1 }
];
let seqIndex = 0;
const PHASE_SECONDS = 2.0;

let revealState = { active:false, start:0, duration:1000, value:1 };
let glitchState = { active:false, start:0, duration:400 };

function startDressReveal(durationSec){
  revealState.active = true;
  revealState.start = performance.now();
  revealState.duration = Math.max(0.1, durationSec) * 1000;
  revealState.value = 0;
  compUniforms.reveal.value = 0;
}
function startGlitch(ms=450){
  glitchState.active = true;
  glitchState.start = performance.now();
  glitchState.duration = ms;
  compUniforms.glitchOn.value = 1.0;
}
function showPhase(){
  if(!maleWrap || !femaleWrap) return;
  maleWrap.visible = false; femaleWrap.visible = false;
  outfitWraps.male.forEach(w=>w && (w.visible = false));
  outfitWraps.female.forEach(w=>w && (w.visible = false));
  const step = sequence[seqIndex];
  if(step.type === "body"){
    if(step.gender === "male") maleWrap.visible = true;
    else femaleWrap.visible = true;
    startGlitch(450);
  } else {
    const body = (step.gender === "male") ? maleWrap : femaleWrap;
    const wrap = outfitWraps[step.gender][step.index];
    if(body) body.visible = true;
    if(wrap){
      wrap.visible = true;
      startDressReveal(SETTINGS.dresses[step.gender][step.index].fadeSeconds || 1.5);
    } else {
      compUniforms.reveal.value = 1.0;
    }
  }
  seqIndex = (seqIndex + 1) % sequence.length;
}
setInterval(showPhase, PHASE_SECONDS * 1000);
showPhase();

// =================== Render Loop ===================
const clock = new THREE.Clock();
function render(){
  const dt = Math.min(clock.getDelta(), 0.033);

  // update particles
  bgGroup.children.forEach(o => o.userData && o.userData.update && o.userData.update(dt));

  // reveal progression
  if(revealState.active){
    const t = (performance.now() - revealState.start) / revealState.duration;
    const k = Math.min(1, t);
    revealState.value = k;
    compUniforms.reveal.value = k;
    if(k >= 1) revealState.active = false;
  } else {
    compUniforms.reveal.value = 1.0;
  }

  // glitch progression
  if(glitchState.active){
    const elapsed = performance.now() - glitchState.start;
    compUniforms.time.value = elapsed;
    const frac = 1 - Math.min(1, elapsed / glitchState.duration);
    compUniforms.glitchAmt.value = 0.9 * frac;
    if(elapsed >= glitchState.duration){
      glitchState.active = false;
      compUniforms.glitchOn.value = 0.0;
      compUniforms.time.value = 0.0;
      compUniforms.glitchAmt.value = 0.0;
    }
  }

  // background (render everything except models)
  renderer.setRenderTarget(null);
  renderer.clear(true, true, true);
  const prevVis = modelGroup.visible;
  modelGroup.visible = false;
  renderer.render(scene, camera);
  modelGroup.visible = prevVis;

  // ---------- BODY PASS ----------
  // hide dresses while rendering bodyRT
  const savedDressVis = [];
  for(const g of Object.keys(outfitWraps)){
    outfitWraps[g].forEach(w => {
      if(!w) return;
      savedDressVis.push({ w, vis: w.visible });
      w.visible = false;
    });
  }
  const prevMale = maleWrap ? maleWrap.visible : false;
  const prevFem  = femaleWrap ? femaleWrap.visible : false;

  renderer.setClearColor(0x000000, 0);
  renderer.setRenderTarget(bodyRT);
  renderer.clear(true, true, true);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);

  // ---------- DRESS PASS ----------
  // restore dresses and hide bodies while rendering dressRT
  savedDressVis.forEach(s => { s.w.visible = s.vis; });

  if(maleWrap) maleWrap.visible = false;
  if(femaleWrap) femaleWrap.visible = false;

  renderer.setClearColor(0x000000, 0);
  renderer.setRenderTarget(dressRT);
  renderer.clear(true, true, true);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);

  // restore bodies visibility
  if(maleWrap) maleWrap.visible = prevMale;
  if(femaleWrap) femaleWrap.visible = prevFem;

  // update depth uniforms (depthTexture references are stable, but ensure near/far are current)
  compUniforms.tBody.value = bodyRT.texture;
  compUniforms.tDress.value = dressRT.texture;
  compUniforms.tBodyDepth.value = bodyRT.depthTexture;
  compUniforms.tDressDepth.value = dressRT.depthTexture;
  compUniforms.cameraNear.value = camera.near;
  compUniforms.cameraFar.value = camera.far;

  // composite (body + dress depth-aware occlusion + glitch)
  renderer.render(compScene, compCamera);

  requestAnimationFrame(render);
}
render();

// =================== Resize ===================
function resizeRT(w,h){ bodyRT.setSize(w,h); dressRT.setSize(w,h); }
window.addEventListener("resize", () => {
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  // camera always uses full window aspect
  camera.aspect = winW / winH;
  camera.updateProjectionMatrix();

  // canvas size: small on mobile, normal on others
  let newW = winW;
  let newH = winH;
  if (winW < 640) {
    newH = winH * 0.45;
    newW = winW * 0.45;
  }

  renderer.setSize(newW, newH);
  resizeRT(newW, newH);
});


