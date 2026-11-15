// DitherHelixCarousel — WebGL2 spiral carousel with dither grain dissolve.
// Adapted from the original TypeScript component for this JSX/Vite project.

import * as React from "react";

// ─── GLSL Constants ──────────────────────────────────────────────
const CARD_H  = 2.45;
const RADIUS  = 4.65;
const RADIUS_STEP = 0.055;
const CAMERA_Z = 8.6;
const FOV = 48;
const NEAR = 0.1;
const FAR  = 60;

const WHEEL  = 0.0022;
const DRAG   = 0.007;
const EASE   = 0.092;
const SNAP_IDLE = 260;
const SNAP_EASE = 0.078;
const CLICK_SLOP = 6;

const BEND      = 1.6;
const BEND_EASE = 0.16;
const BEND_MAX  = 0.038;

const HOVER_IN  = 0.095;
const HOVER_OUT = 0.07;
const HOVER_SETTLE   = 8;
const FOCUS_FALLOFF  = 0.7;

const ENTRY_MS         = 1050;
const ENTRY_STAGGER_MS = 60;
const ENTRY_SPIN       = 9.4;
const ENTRY_SPIN_MS    = 2400;

const CLICK_MS    = 620;
const THEME_EVERY = 20;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const inOutCubic = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

// ─── BAYER shared snippet ────────────────────────────────────────
const BAYER = /* glsl */`
float bayer2(vec2 a){a=floor(a);return fract(a.x/2.0+a.y*a.y*0.75);}
#define bayer4(a)(bayer2(0.5*(a))*0.25+bayer2(a))
#define bayer8(a)(bayer4(0.5*(a))*0.25+bayer2(a))
`;

// ─── Shaders ─────────────────────────────────────────────────────
const CARD_VERT = /* glsl */`#version 300 es
in vec2 aPos;
uniform float uIndex,uProgress,uCount,uAngleStep,uPitch,uVelocity;
uniform vec2  uCard;
uniform float uFocal,uAspect;
out vec2 vUv;
out float vDepth;
const float RADIUS=${RADIUS.toFixed(3)},RADIUS_STEP=${RADIUS_STEP.toFixed(4)};
const float CAMERA_Z=${CAMERA_Z.toFixed(1)},NEAR=${NEAR.toFixed(2)},FAR=${FAR.toFixed(1)},BEND=${BEND.toFixed(2)};
void main(){
  vUv=vec2(aPos.x,1.0-aPos.y);
  vec2 local=(aPos-0.5)*uCard;
  float slot=mod(uIndex-uProgress,uCount)-floor(uCount*0.5);
  float baseAngle=slot*uAngleStep;
  float baseY=slot*uPitch;
  float ty=(aPos.y-0.5)*2.0;
  baseAngle+=uVelocity*BEND*ty*ty*uAngleStep*0.5;
  float r=RADIUS+slot*RADIUS_STEP;
  float theta=baseAngle+local.x/r;
  vec3 p=vec3(sin(theta)*r,local.y+baseY,cos(theta)*r);
  float vz=p.z-CAMERA_Z;
  vDepth=-vz;
  gl_Position=vec4(p.x*uFocal/uAspect,p.y*uFocal,((FAR+NEAR)*vz+2.0*FAR*NEAR)/(NEAR-FAR),-vz);
}`;

const CARD_FRAG = /* glsl */`#version 300 es
precision highp float;
in vec2 vUv;
in float vDepth;
uniform sampler2D uMap;
uniform vec2 uImageRatio;
uniform vec3 uBackground;
uniform float uHover,uDim,uEntry,uEntryScale,uEntryAspect;
layout(location=0) out vec4 outScene;
layout(location=1) out vec4 outMeta;
const float FOG_NEAR=6.5,FOG_FAR=26.0,DIM_FADE=0.67,ENTRY_SOFTNESS=0.45;
${BAYER}
bool notArrived(vec2 uv){
  if(uEntry<=0.0)return false;
  vec2 offset=(uv-0.5)*vec2(uEntryAspect,1.0);
  float d=length(offset)/length(vec2(uEntryAspect,1.0)*0.5);
  float front=(1.0-uEntry)*(1.0+ENTRY_SOFTNESS);
  return(front-d)/ENTRY_SOFTNESS<=bayer8(gl_FragCoord.xy/uEntryScale);
}
void main(){
  if(notArrived(vUv))discard;
  vec2 uv=(vUv-0.5)*uImageRatio+0.5;
  vec3 color=texture(uMap,uv).rgb;
  float fog=smoothstep(FOG_NEAR,FOG_FAR,vDepth)*(1.0-uHover);
  color=mix(color,uBackground,fog);
  color=mix(color,uBackground,1.0-pow(1.0-uDim*DIM_FADE,2.2));
  outScene=vec4(color,1.0-fog);
  outMeta=vec4(0.0,uDim,uHover,1.0-uEntry);
}`;

const QUAD_VERT = /* glsl */`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main(){vUv=aPos;gl_Position=vec4(aPos*2.0-1.0,0.0,1.0);}`;

const BLUR_FRAG = /* glsl */`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uMap;
uniform vec2 uTexel;
uniform float uSpread;
out vec4 fragColor;
void main(){
  vec2 stride=vec2(0.0,uTexel.y)*uSpread;
  vec4 sum=vec4(0.0);float total=0.0;
  for(int i=-8;i<=8;i++){float fi=float(i);float w=exp(-fi*fi/18.0);sum+=texture(uMap,vUv+stride*fi)*w;total+=w;}
  fragColor=sum/total;
}`;

const COMPOSITE_FRAG = /* glsl */`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uScene,uMeta,uBlur1,uBlur2,uBlur3,uBlur4;
uniform vec2 uResolution;
uniform vec3 uBackground,uAccent;
uniform float uFocusSize,uDitherScale,uEntryScale;
out vec4 fragColor;
const float EDGE_POWER=1.65,BLUR_STRENGTH=0.47,FADE_STRENGTH=0.4;
const float DITHER_AMOUNT=0.77,DITHER_START=0.64,DITHER_POWER=1.25;
const float LEVELS=8.0,GAMMA=1.8,MONO=0.22;
const float STAGING=0.55,SMEAR_END=0.55,GRAIN_BEGIN=0.45,YIELD=0.75;
const float HOVER_BLUR=0.13,HOVER_DITHER=0.3,HOVER_CURVE=1.9,HOVER_LEVELS=8.0,HOVER_CUTOFF=0.22,HOVER_GAMMA=1.8;
const float ENTRY_DITHER=0.45,ENTRY_LEVELS=4.0,ENTRY_GAMMA=1.5;
${BAYER}
float luma(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}
vec3 blurStack(vec2 uv,float lvl){
  vec3 c=texture(uScene,uv).rgb;
  c=mix(c,texture(uBlur1,uv).rgb,clamp(lvl-0.0,0.0,1.0));
  c=mix(c,texture(uBlur2,uv).rgb,clamp(lvl-1.0,0.0,1.0));
  c=mix(c,texture(uBlur3,uv).rgb,clamp(lvl-2.0,0.0,1.0));
  c=mix(c,texture(uBlur4,uv).rgb,clamp(lvl-3.0,0.0,1.0));
  return c;
}
vec3 towardPage(vec3 c,float fade){return mix(c,uBackground,fade);}
vec2 latticeUv(float cell){return(floor(gl_FragCoord.xy/cell)+0.5)*cell/uResolution;}
vec3 toneScale(float t){return t<0.5?mix(uBackground,uAccent,t*2.0):mix(uAccent,uBackground,(t-0.5)*2.0);}
vec3 quantise(vec3 c,float threshold,float levels,float gamma){
  float steps=max(levels-1.0,1.0);
  vec3 toned=toneScale(floor(pow(clamp(luma(c),0.0,1.0),gamma)*steps+threshold)/steps);
  vec3 quantized=floor(c*steps+threshold)/steps;
  return mix(quantized,toned,MONO);
}
void main(){
  float d=abs(vUv.y-0.5)*2.0;
  float edge=pow(smoothstep(uFocusSize,1.0,d),EDGE_POWER);
  vec4 scene=texture(uScene,vUv);
  vec4 meta=texture(uMeta,vUv);
  float dim=meta.g,entry=1.0-meta.a,keep=1.0-meta.b;
  float distance2=1.0-scene.a;
  float dissolve=max(edge,distance2);
  float grainFree=pow(smoothstep(DITHER_START,1.0,max(d,distance2)),DITHER_POWER);
  float grainStaged=pow(smoothstep(GRAIN_BEGIN,1.0,dissolve),DITHER_POWER);
  float smearStaged=smoothstep(0.0,SMEAR_END,dissolve)*(1.0-grainStaged*YIELD);
  float blurDrive=mix(dissolve,smearStaged,STAGING);
  float ditherDrive=mix(grainFree,grainStaged,STAGING);
  float softness=max(blurDrive,dim*HOVER_BLUR)*keep;
  float lvl=softness*BLUR_STRENGTH*4.0;
  float fade=edge*FADE_STRENGTH*keep;
  vec3 c=towardPage(blurStack(vUv,lvl),fade);
  float threshold=bayer8(gl_FragCoord.xy/uDitherScale);
  vec3 source=uDitherScale>1.0?towardPage(blurStack(latticeUv(uDitherScale),lvl),fade):c;
  vec3 result=mix(c,quantise(source,threshold,LEVELS,GAMMA),DITHER_AMOUNT*ditherDrive*keep);
  float hoverRamp=smoothstep(HOVER_CUTOFF,1.0,pow(dim,HOVER_CURVE))*HOVER_DITHER;
  float hoverThreshold=bayer8(gl_FragCoord.xy/(uDitherScale*1.35));
  vec3 hoverSource=towardPage(blurStack(latticeUv(uDitherScale*1.35),lvl),fade);
  result=mix(result,quantise(hoverSource,hoverThreshold,HOVER_LEVELS,HOVER_GAMMA),hoverRamp);
  float entryThreshold=bayer8(gl_FragCoord.xy/uEntryScale);
  vec3 entrySource=towardPage(blurStack(latticeUv(uEntryScale),lvl),fade);
  result=mix(result,quantise(entrySource,entryThreshold,ENTRY_LEVELS,ENTRY_GAMMA),entry*ENTRY_DITHER);
  fragColor=vec4(clamp(result,0.0,1.0),1.0);
}`;

// ─── WebGL helpers ───────────────────────────────────────────────
function buildProgram(gl, vert, frag) {
  const prog = gl.createProgram();
  if (!prog) return null;
  for (const [type, src] of [[gl.VERTEX_SHADER, vert],[gl.FRAGMENT_SHADER, frag]]) {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s)); return null;
    }
    gl.attachShader(prog, s);
    gl.deleteShader(s);
  }
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog)); return null;
  }
  return prog;
}

function makeUniforms(gl, program) {
  const cache = new Map();
  return name => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
    return cache.get(name);
  };
}

function colorReader() {
  const probe = document.createElement('canvas');
  probe.width = probe.height = 1;
  const ctx = probe.getContext('2d', { willReadFrequently: true });
  return css => {
    if (!ctx) return [0,0,0];
    ctx.fillStyle = '#000'; ctx.fillStyle = css;
    ctx.fillRect(0,0,1,1);
    const [r,g,b] = ctx.getImageData(0,0,1,1).data;
    return [r/255, g/255, b/255];
  };
}

function mkTex(gl, w, h) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

// ─── Main Component ──────────────────────────────────────────────
export const DitherHelixCarousel = React.forwardRef(function DitherHelixCarousel({
  items,
  brand,
  accent,
  cell = 7.5,
  focusBand = 0.25,
  twist = 0.8,
  rise = 0.79,
  cardRatio = 2,
  entry: playEntry = true,
  className = '',
  style,
  onActiveChange,
  onSelect,
  showOverlay = false,
}, ref) {
  const canvasRef   = React.useRef(null);
  const [active, setActive]       = React.useState(0);
  const [reduced, setReduced]     = React.useState(false);
  const [supported, setSupported] = React.useState(true);

  const activeNearRef = React.useRef(0);
  const onActiveChangeRef = React.useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;
  const itemsRef = React.useRef(items);
  itemsRef.current = items;

  const settings = React.useRef({ accent, cell, focusBand, twist, rise, cardRatio });
  settings.current = { accent, cell, focusBand, twist, rise, cardRatio };
  const stepRef = React.useRef(() => {});
  const goToRef = React.useRef(() => {});

  React.useImperativeHandle(ref, () => ({
    step: (by) => stepRef.current(by),
    goTo: (idx) => goToRef.current(idx),
    getActive: () => active,
  }), [active]);

  const count   = items.length;
  const sources = items.map(i => i.image).join(' ');

  React.useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    const read = () => setReduced(q.matches);
    read(); q.addEventListener('change', read);
    return () => q.removeEventListener('change', read);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !count) return;
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false });
    if (!gl) { setSupported(false); return; }

    const readColor  = colorReader();
    const cardProg   = buildProgram(gl, CARD_VERT, CARD_FRAG);
    const blurProg   = buildProgram(gl, QUAD_VERT, BLUR_FRAG);
    const compProg   = buildProgram(gl, QUAD_VERT, COMPOSITE_FRAG);
    if (!cardProg || !blurProg || !compProg) return;
    const cardU = makeUniforms(gl, cardProg);
    const blurU = makeUniforms(gl, blurProg);
    const compU = makeUniforms(gl, compProg);

    // geometry
    const COLS = 40, ROWS = 8;
    const verts = [];
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const [x0,x1,y0,y1] = [x/COLS,(x+1)/COLS,y/ROWS,(y+1)/ROWS];
        verts.push(x0,y0,x1,y0,x0,y1,x0,y1,x1,y0,x1,y1);
      }
    const cardVAO = gl.createVertexArray();
    gl.bindVertexArray(cardVAO);
    const cardBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cardBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    const cardVC = verts.length / 2;

    const quadVAO = gl.createVertexArray();
    gl.bindVertexArray(quadVAO);
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);

    // framebuffers
    const sceneFBO = gl.createFramebuffer();
    let sceneTex = mkTex(gl,1,1), metaTex = mkTex(gl,1,1);
    const depthRB  = gl.createRenderbuffer();
    const blurFBOs = [0,1,2,3].map(() => gl.createFramebuffer());
    let blurTexs   = [0,1,2,3].map(() => mkTex(gl,1,1));

    const attach = (w, h) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFBO);
      gl.deleteTexture(sceneTex); gl.deleteTexture(metaTex);
      sceneTex = mkTex(gl,w,h); metaTex = mkTex(gl,w,h);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,sceneTex,0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT1,gl.TEXTURE_2D,metaTex,0);
      gl.bindRenderbuffer(gl.RENDERBUFFER,depthRB);
      gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depthRB);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0,gl.COLOR_ATTACHMENT1]);
      blurTexs.forEach(t => gl.deleteTexture(t));
      blurTexs = blurFBOs.map((fbo, i) => {
        const t = mkTex(gl, Math.max(1,w>>(i+1)), Math.max(1,h>>(i+1)));
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
        return t;
      });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    // image textures
    const cards = items.map(() => ({ texture: null, aspect: 1.5 }));
    const imgs = items.map((item, i) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        cards[i].texture = tex;
        cards[i].aspect = img.naturalWidth / Math.max(img.naturalHeight, 1);
      };
      img.src = item.image;
      return img;
    });

    // state
    let width=0, height=0, progress=0, goal=0, smoothed=0;
    let lastInput=0, snapped=true, hovered=-1;
    let pointerX=-1, pointerY=-1, pointerSpeed=0;
    let ticks=0, frame=0, entryStart=0;
    let bg = [0,0,0], accentRgb = [1,1,1];
    let tween = null;
    const dim     = new Float32Array(count);
    const hover   = new Float32Array(count);
    const entryOf = new Float32Array(count).fill(playEntry && !reduced ? 1 : 0);
    const order   = items.map((_,i)=>i).sort(()=>Math.random()-0.5);
    const focal   = 1 / Math.tan((FOV*Math.PI)/360);
    const FRONT   = Math.floor(count/2);

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio||1, 2);
      width=w; height=h;
      canvas.width = Math.round(w*dpr);
      canvas.height= Math.round(h*dpr);
      attach(canvas.width, canvas.height);
    };
    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(canvas);

    const project = idx => {
      const slot = ((((idx-progress)%count)+count)%count) - FRONT;
      const angle = slot * settings.current.twist;
      const y     = slot * settings.current.rise * CARD_H;
      const z     = Math.cos(angle) * (RADIUS + slot*RADIUS_STEP);
      const away  = CAMERA_Z - z;
      if (away <= NEAR) return null;
      const asp = width / Math.max(height,1);
      const sx = ((Math.sin(angle)*(RADIUS+slot*RADIUS_STEP)*focal/asp/away)*0.5)+0.5;
      const sy = 0.5 - ((y*focal)/away)*0.5;
      return {
        x: sx*width, y: sy*height,
        halfW: ((CARD_H*settings.current.cardRatio*focal/asp/away)*0.5*width*0.5),
        halfH: ((CARD_H*focal/away)*0.5*height*0.5),
        away,
      };
    };

    const pick = (px, py) => {
      let best=-1, bestAway=Infinity;
      for (let i=0;i<count;i++) {
        const at = project(i);
        if (!at) continue;
        if (Math.abs(px-at.x)>at.halfW || Math.abs(py-at.y)>at.halfH) continue;
        if (at.away<bestAway) { bestAway=at.away; best=i; }
      }
      return best;
    };

    // input — only intercept horizontal trackpad swipes or shift+wheel so vertical page scrolling is buttery smooth
    const onWheel = e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        e.preventDefault();
        tween = null;
        goal += (e.shiftKey ? e.deltaY : e.deltaX) * WHEEL * 1.5;
        lastInput = performance.now();
        snapped = false;
      }
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });

    stepRef.current = by => {
      tween = { from: goal, to: Math.round(goal)+by, at: performance.now() };
      lastInput=performance.now(); snapped=true;
    };

    goToRef.current = targetIndex => {
      const want = (((targetIndex - FRONT) % count) + count) % count;
      const to = want + Math.round((goal - want) / count) * count;
      tween = { from: goal, to, at: performance.now() };
      lastInput = performance.now();
      snapped = true;
    };

    let dragFrom=null, dragTravel=0;
    const onDown = e => { dragFrom=e.clientY; dragTravel=0; tween=null; canvas.setPointerCapture(e.pointerId); };
    const onMove = e => {
      const box = canvas.getBoundingClientRect();
      const nx=e.clientX-box.left, ny=e.clientY-box.top;
      pointerSpeed=Math.hypot(nx-pointerX,ny-pointerY); pointerX=nx; pointerY=ny;
      if (dragFrom!==null) {
        const t=dragFrom-e.clientY; dragTravel+=Math.abs(t); dragFrom=e.clientY;
        goal+=t*DRAG; lastInput=performance.now(); snapped=false;
      }
    };
    const onUp = e => {
      const wasClick = dragFrom!==null && dragTravel<CLICK_SLOP; dragFrom=null;
      if (!wasClick) return;
      const hit=pick(pointerX,pointerY);
      if (hit>=0) {
        const want=(((hit-FRONT)%count)+count)%count;
        const to=want+Math.round((goal-want)/count)*count;
        tween={from:goal,to,at:performance.now()}; snapped=true;
        if (onSelect) onSelect(hit, items[hit]);
      }
    };
    const onLeave=()=>{ pointerX=-1; pointerY=-1; hovered=-1; };

    canvas.addEventListener('pointerdown',onDown);
    canvas.addEventListener('pointermove',onMove);
    canvas.addEventListener('pointerup',onUp);
    canvas.addEventListener('pointercancel',onUp);
    canvas.addEventListener('pointerleave',onLeave);

    const drawQuad = () => { gl.bindVertexArray(quadVAO); gl.drawArrays(gl.TRIANGLES,0,6); };

    const draw = now => {
      frame = requestAnimationFrame(draw);
      if (!width||!height) return;
      const { cell: cellPx, focusBand: band, twist: turn, rise: pitch, cardRatio: ratio } = settings.current;
      const cardW = CARD_H * ratio;

      if (ticks++%THEME_EVERY===0) {
        bg = readColor(getComputedStyle(canvas).backgroundColor);
        accentRgb = readColor(settings.current.accent ?? getComputedStyle(canvas).color);
      }

      const ready = cards.every(c=>c.texture);
      if (ready && !entryStart) entryStart=now;
      const elapsed = entryStart ? now-entryStart : 0;

      if (ready && playEntry && !reduced) {
        for (let rank=0;rank<count;rank++) {
          const t=(elapsed-rank*ENTRY_STAGGER_MS)/ENTRY_MS;
          entryOf[order[rank]]=1-clamp(t,0,1);
        }
        const spin=clamp(elapsed/ENTRY_SPIN_MS,0,1);
        progress=goal-ENTRY_SPIN*(1-inOutCubic(spin));
      } else if (ready) { entryOf.fill(0); }
      const arriving = playEntry&&!reduced&&ready&&elapsed<ENTRY_SPIN_MS;

      if (tween) {
        const t=clamp((now-tween.at)/CLICK_MS,0,1);
        goal=tween.from+(tween.to-tween.from)*inOutCubic(t);
        if (t>=1) tween=null;
      } else if (!snapped&&now-lastInput>SNAP_IDLE) { goal=Math.round(goal); snapped=true; }

      const before=progress;
      if (!arriving) progress+=(goal-progress)*(reduced?1:snapped?SNAP_EASE:EASE);
      const velocity=progress-before;
      smoothed+=( clamp(velocity,-BEND_MAX,BEND_MAX)-smoothed)*BEND_EASE;

      const near=(((Math.round(goal)+FRONT)%count)+count)%count;
      if (activeNearRef.current !== near) {
        activeNearRef.current = near;
        setActive(near);
        if (onActiveChangeRef.current) {
          const fn = onActiveChangeRef.current;
          const it = itemsRef.current[near];
          setTimeout(() => fn(near, it), 0);
        }
      }

      if (pointerX>=0&&pointerSpeed<HOVER_SETTLE) hovered=pick(pointerX,pointerY);
      pointerSpeed*=0.8;
      for (let i=0;i<count;i++) {
        const isHov=i===hovered;
        hover[i]+=(( isHov?1:0)-hover[i])*(isHov?HOVER_IN:HOVER_OUT);
        let wantDim=0;
        if (hovered>=0) {
          let gap=Math.abs(i-hovered); gap=Math.min(gap,count-gap);
          wantDim=clamp(gap/FOCUS_FALLOFF,0,1);
        }
        dim[i]+=((wantDim-dim[i])*(wantDim>dim[i]?HOVER_IN:HOVER_OUT));
      }

      // pass 1: cards
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFBO);
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.enable(gl.DEPTH_TEST);
      gl.clearBufferfv(gl.COLOR,0,[bg[0],bg[1],bg[2],1]);
      gl.clearBufferfv(gl.COLOR,1,[0,0,0,1]);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.useProgram(cardProg);
      gl.bindVertexArray(cardVAO);
      gl.uniform1f(cardU('uCount'),count);
      gl.uniform1f(cardU('uProgress'),progress);
      gl.uniform1f(cardU('uAngleStep'),turn);
      gl.uniform1f(cardU('uPitch'),pitch*CARD_H);
      gl.uniform1f(cardU('uVelocity'),smoothed);
      gl.uniform2f(cardU('uCard'),cardW,CARD_H);
      gl.uniform1f(cardU('uFocal'),focal);
      gl.uniform1f(cardU('uAspect'),width/height);
      gl.uniform3fv(cardU('uBackground'),bg);
      gl.uniform1i(cardU('uMap'),0);
      gl.uniform1f(cardU('uEntryScale'),9.5);
      gl.uniform1f(cardU('uEntryAspect'),ratio);
      gl.activeTexture(gl.TEXTURE0);
      for (let i=0;i<count;i++) {
        const c=cards[i]; if (!c.texture) continue;
        gl.bindTexture(gl.TEXTURE_2D,c.texture);
        gl.uniform1f(cardU('uIndex'),i);
        gl.uniform1f(cardU('uHover'),hover[i]);
        gl.uniform1f(cardU('uDim'),dim[i]);
        gl.uniform1f(cardU('uEntry'),entryOf[i]);
        gl.uniform2f(cardU('uImageRatio'),
          c.aspect<ratio?1:ratio/c.aspect,
          c.aspect<ratio?c.aspect/ratio:1
        );
        gl.drawArrays(gl.TRIANGLES,0,cardVC);
      }
      gl.disable(gl.DEPTH_TEST);

      // pass 2: blur chain
      gl.useProgram(blurProg);
      gl.uniform1i(blurU('uMap'),0);
      gl.uniform1f(blurU('uSpread'),4.5);
      let src=sceneTex;
      for (let i=0;i<4;i++) {
        const w=Math.max(1,canvas.width>>(i+1)), h=Math.max(1,canvas.height>>(i+1));
        gl.bindFramebuffer(gl.FRAMEBUFFER,blurFBOs[i]);
        gl.viewport(0,0,w,h);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,src);
        gl.uniform2f(blurU('uTexel'),1/w,1/h);
        drawQuad(); src=blurTexs[i];
      }

      // pass 3: composite
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.useProgram(compProg);
      const bound=[sceneTex,metaTex,...blurTexs];
      const names=['uScene','uMeta','uBlur1','uBlur2','uBlur3','uBlur4'];
      bound.forEach((tex,unit)=>{
        gl.activeTexture(gl.TEXTURE0+unit);
        gl.bindTexture(gl.TEXTURE_2D,tex);
        gl.uniform1i(compU(names[unit]),unit);
      });
      gl.uniform2f(compU('uResolution'),canvas.width,canvas.height);
      gl.uniform3fv(compU('uBackground'),bg);
      gl.uniform3fv(compU('uAccent'),accentRgb);
      gl.uniform1f(compU('uFocusSize'),band);
      gl.uniform1f(compU('uDitherScale'),cellPx);
      gl.uniform1f(compU('uEntryScale'),9.5);
      drawQuad();
      gl.activeTexture(gl.TEXTURE0);
    };
    frame=requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      obs.disconnect();
      canvas.removeEventListener('wheel',onWheel);
      canvas.removeEventListener('pointerdown',onDown);
      canvas.removeEventListener('pointermove',onMove);
      canvas.removeEventListener('pointerup',onUp);
      canvas.removeEventListener('pointercancel',onUp);
      canvas.removeEventListener('pointerleave',onLeave);
      for (const img of imgs) img.onload=null;
      for (const c of cards) if (c.texture) gl.deleteTexture(c.texture);
      gl.deleteTexture(sceneTex); gl.deleteTexture(metaTex);
      blurTexs.forEach(t=>gl.deleteTexture(t));
      blurFBOs.forEach(f=>gl.deleteFramebuffer(f));
      gl.deleteFramebuffer(sceneFBO);
      gl.deleteRenderbuffer(depthRB);
      gl.deleteBuffer(cardBuf); gl.deleteBuffer(quadBuf);
      gl.deleteVertexArray(cardVAO); gl.deleteVertexArray(quadVAO);
      gl.deleteProgram(cardProg); gl.deleteProgram(blurProg); gl.deleteProgram(compProg);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources, count, reduced, playEntry]);

  if (!supported) {
    return (
      <div style={{ display: 'flex', overflowY: 'auto', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0' }}>
        {items.map(item => (
          <div key={item.image} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={item.image} alt={item.title}
              style={{ width: 120, height: 60, objectFit: 'cover', borderRadius: '0.5rem', background: '#1e2231' }} />
            <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontFamily: "'Space Grotesk', sans-serif" }}>{item.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={brand ?? 'Gallery'}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '24rem',
        overflow: 'hidden',
        userSelect: 'none',
        background: 'transparent',
        ...( style || {} ),
      }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          cursor: 'grab', background: '#060608',
          outline: 'none',
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') stepRef.current(1);
          else if (e.key === 'ArrowUp') stepRef.current(-1);
          else return;
          e.preventDefault();
        }}
      />

      <ul style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', margin: -1 }}>
        {items.map((item, i) => (
          <li key={item.image} aria-selected={i === active}>{item.title}</li>
        ))}
      </ul>

      {brand && showOverlay && (
        <div style={{
          position: 'absolute', top: '6%', left: '5%',
          fontSize: '0.85rem', fontWeight: 500, letterSpacing: 'tight',
          color: '#ffffff', pointerEvents: 'none', fontFamily: "'Space Grotesk', sans-serif",
        }}>{brand}</div>
      )}

      {showOverlay && (
        <>
          <div style={{
            position: 'absolute', bottom: '7%', left: '5%',
            fontSize: '1.5rem', fontWeight: 500, lineHeight: 1,
            color: '#ffffff', pointerEvents: 'none', fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {items[active]?.title}
          </div>

          <div style={{
            position: 'absolute', bottom: '7%', right: '5%',
            fontSize: '0.85rem', color: '#94a3b8', pointerEvents: 'none',
            fontFamily: 'monospace', tabularNums: true,
          }}>
            {String(active+1).padStart(2,'0')}
            <span style={{ opacity: 0.5 }}> / {String(count).padStart(2,'0')}</span>
          </div>
        </>
      )}
    </div>
  );
});

export default DitherHelixCarousel;
