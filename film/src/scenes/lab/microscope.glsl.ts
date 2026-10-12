// S23 — one continuous dive: grain -> longitudinal section -> aleurone / endosperm cells -> nucleus -> DNA.
// Anatomy follows docs/factcheck.md 12c: hull (lemma/palea), a thin cavity, pericarp+testa, a single aleurone
// cell layer, starchy endosperm (polyhedral starch granules), a small embryo at the base on one side.
export const MICRO_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uT;      // 0..1 through the shot
uniform float uL;      // log zoom
uniform vec2 uC;       // camera centre (world)
uniform float uTime;   // seconds
uniform float uSec;    // 0 whole grain -> 1 cut open (longitudinal section)
varying vec2 vUv;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
vec2 hash2(vec2 p){ float n = hash(p); return vec2(n, hash(p+n+17.3)); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p=p*2.02+vec2(1.7,9.2); a*=0.5; } return v; }

// voronoi: returns (distance to border, cell id hash, distance to cell centre)
vec3 voronoi(vec2 x, float jit){
  vec2 n = floor(x), f = fract(x);
  vec2 mg, mr; float md = 8.0;
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 g = vec2(float(i),float(j)); vec2 o = 0.5 + jit*(hash2(n+g)-0.5);
    vec2 r = g + o - f; float d = dot(r,r);
    if(d<md){ md=d; mr=r; mg=g; }
  }
  float bd = 8.0;
  for(int j=-2;j<=2;j++) for(int i=-2;i<=2;i++){
    vec2 g = mg + vec2(float(i),float(j)); vec2 o = 0.5 + jit*(hash2(n+g)-0.5);
    vec2 r = g + o - f;
    if(dot(mr-r,mr-r)>0.00001) bd = min(bd, dot(0.5*(mr+r), normalize(r-mr)));
  }
  return vec3(bd, hash(n+mg), sqrt(md));
}

float band(float x, float a, float b, float s){ return smoothstep(a-s, a, x) * (1.0 - smoothstep(b, b+s, x)); }
float win(float L, float a, float b, float s){ return smoothstep(a-s, a+s, L) * (1.0 - smoothstep(b-s, b+s, L)); }

// grain ellipse (world units): long axis x
const vec2 GR = vec2(0.34, 0.25);
float grainSd(vec2 w){ vec2 q = w / GR; float k = length(q); return (k - 1.0) * min(GR.x, GR.y); }

vec3 CYAN = vec3(0.30, 0.86, 0.95);
vec3 TEAL = vec3(0.10, 0.55, 0.62);
vec3 DEEP = vec3(0.02, 0.10, 0.16);

vec3 sectionLayer(vec2 w, float px){
  float sd = grainSd(w);               // <0 inside
  float d = -sd;                        // depth from the outer surface
  vec3 c = vec3(0.0);
  // hull (lemma/palea): bright fibrous ring
  float hull = band(d, 0.0, 0.018, px*1.5);
  float fib = 0.6 + 0.4*sin(atan(w.y, w.x)*180.0 + fbm(w*60.0)*4.0);
  c += hull * CYAN * (0.55 + 0.45*fib) * 0.9;
  // cavity: dark gap
  // pericarp + testa: thin line
  c += band(d, 0.026, 0.031, px) * CYAN * 0.8;
  // aleurone: one row of boxy cells
  float al = band(d, 0.031, 0.045, px);
  float ang = atan(w.y, w.x);
  float cellA = fract(ang * 70.0 / 6.2831);
  float walls = smoothstep(0.08, 0.0, min(cellA, 1.0-cellA)) + band(d, 0.044, 0.046, px);
  c += al * (TEAL*0.55 + CYAN*0.8*walls);
  // starchy endosperm: polygonal cells filled with granules
  float en = smoothstep(0.045, 0.05, d);
  vec3 v = voronoi(w*38.0, 0.9);
  float cw = smoothstep(0.06, 0.0, v.x);
  vec3 g = voronoi(w*420.0, 0.95);
  float gran = smoothstep(0.5, 0.15, g.z) * 0.35;
  c += en * (DEEP*1.4 + TEAL*0.18 + CYAN*cw*0.55 + CYAN*gran*0.25);
  // embryo at the base, on one side (small: ~1/9 of the grain volume)
  vec2 e = (w - vec2(-0.255, -0.06)) / vec2(0.085, 0.12);
  float emb = 1.0 - smoothstep(0.92, 1.0, length(e));
  float scut = band(length(e), 0.86, 0.96, 0.02);
  vec3 ve = voronoi(w*120.0, 0.8);
  c = mix(c, DEEP*1.2 + TEAL*0.35 + CYAN*smoothstep(0.08,0.0,ve.x)*0.5, emb*smoothstep(0.03,0.06,d));
  c += scut * CYAN * 0.9 * smoothstep(0.03,0.06,d);
  // outside: void with faint debris
  float outside = smoothstep(0.0, px*2.0, sd);
  c = mix(c, DEEP*0.4 + CYAN*0.05*smoothstep(0.75,1.0,noise(w*30.0)), outside);
  // fluorescent rim glow
  c += CYAN * 0.35 * exp(-abs(sd)*60.0);
  return c;
}

vec3 grainWhole(vec2 w, float px){
  float sd = grainSd(w);
  float inside = 1.0 - smoothstep(-px, px, sd);
  float shade = 0.35 + 0.65*clamp(dot(normalize(vec3(-w/GR, 0.6)), normalize(vec3(-0.4,0.6,0.7))), 0.0, 1.0);
  vec3 body = mix(DEEP, TEAL*0.7, shade) + CYAN*0.15*fbm(w*40.0);
  vec3 c = mix(DEEP*0.3, body, inside);
  c += CYAN * 0.9 * exp(-abs(sd)*90.0);
  // longitudinal veins
  c += inside * CYAN * 0.12 * smoothstep(0.96, 1.0, sin(w.y/GR.y*14.0 + w.x*2.0)*0.5+0.5);
  return c;
}

vec3 cellLayer(vec2 w, float px, vec2 target, vec2 nucAt){
  // aleurone cells (boxy) near the target, with bright nuclei
  vec2 q = (w - target) * 900.0;
  vec3 v = voronoi(q, 0.55);
  float wall = smoothstep(0.07, 0.0, v.x);
  float nuc = smoothstep(0.23, 0.17, v.z);
  // the nucleus we dive into sits exactly at nucAt
  vec2 qn = (w - nucAt) * 900.0;
  nuc = max(nuc, smoothstep(0.23, 0.17, length(qn)));
  vec3 c = DEEP*1.6 + TEAL*0.25*(0.6+0.4*v.y);
  c += CYAN * wall * 0.9;
  c += mix(TEAL, CYAN, 0.7) * nuc * 0.9;
  // aleurone grains (protein bodies) speckle the cytoplasm
  vec3 g = voronoi(q*7.0, 0.9);
  c += CYAN * 0.18 * smoothstep(0.35, 0.1, g.z) * (1.0-nuc);
  return c;
}

vec3 nucleusLayer(vec2 w, float px, vec2 target){
  vec2 q = (w - target) * 4500.0;
  float r = length(q);
  float inside = 1.0 - smoothstep(0.95, 1.0, r);
  float chrom = fbm(q*3.0 + vec2(uTime*0.05, 0.0));
  float fil = smoothstep(0.55, 0.75, fbm(q*7.0 + chrom*2.0));
  vec3 c = DEEP*0.8;
  c = mix(c, DEEP*1.6 + TEAL*0.35*chrom + CYAN*fil*0.65, inside);
  c += CYAN * 0.7 * exp(-abs(r-1.0)*18.0);
  // nucleolus
  c += CYAN * 0.5 * smoothstep(0.32, 0.22, length(q - vec2(0.28, -0.2)));
  return c;
}

vec3 dnaLayer(vec2 w, float px, vec2 target){
  vec2 q = (w - target) * 30000.0;       // DNA units: helix radius ~0.42
  float ang = 0.32;
  q = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * q;
  float k = 3.2; float phase = uTime * 2.6;
  float y1 = 0.42 * sin(k*q.x + phase);
  float y2 = 0.42 * sin(k*q.x + phase + 3.14159);
  float z1 = cos(k*q.x + phase);
  float z2 = -z1;
  float s1 = exp(-pow((q.y - y1)/0.045, 2.0));
  float s2 = exp(-pow((q.y - y2)/0.045, 2.0));
  vec3 c = DEEP*0.5;
  // base pairs: rungs every 2*pi/(k*10.5) along the axis (10.5 bp per turn)
  float bp = q.x * k * 10.5 / 6.2831;
  float rung = smoothstep(0.12, 0.0, abs(fract(bp)-0.5)-0.38) ;
  float between = step(min(y1,y2), q.y) * step(q.y, max(y1,y2));
  float baseHue = hash(vec2(floor(bp), 3.0));
  vec3 rc = mix(TEAL, CYAN, baseHue) * (0.45 + 0.35*abs(z1));
  c += rung * between * rc * 0.8;
  c += s1 * mix(TEAL*0.5, CYAN*1.3, z1*0.5+0.5);
  c += s2 * mix(TEAL*0.5, CYAN*1.3, z2*0.5+0.5);
  // glow
  c += CYAN * 0.12 * (exp(-abs(q.y-y1)*6.0) + exp(-abs(q.y-y2)*6.0));
  return c;
}

void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float s = exp(uL);
  vec2 w = p / s + uC;
  float px = 1.0 / (uRes.y * s);

  vec2 T1 = vec2(0.06, 0.2155);                 // on the aleurone layer
  vec2 T2 = T1 + vec2(0.00042, -0.00031);        // a nucleus
  vec2 T3 = T2 + vec2(0.000021, 0.000012);       // inside the nucleus

  vec3 col = vec3(0.0);
  float grainWin = win(uL, -3.0, 4.1, 0.45);
  col += grainWhole(w, px) * (1.0 - uSec) * grainWin;
  col += sectionLayer(w, px) * uSec * grainWin;
  col += cellLayer(w, px, T1, T2) * win(uL, 4.1, 6.6, 0.45);
  col += nucleusLayer(w, px, T2) * win(uL, 6.6, 8.6, 0.4);
  col += dnaLayer(w, px, T3) * win(uL, 8.6, 20.0, 0.35);

  // eyepiece: circular field with soft chromatic edge, opens up near the end
  float open = smoothstep(0.82, 1.0, uT);
  float r = length(p);
  float field = 1.0 - smoothstep(0.43 + open*0.6, 0.47 + open*0.62, r);
  col *= field;
  col += vec3(0.05, 0.25, 0.3) * exp(-pow((r - 0.45 - open*0.6)/0.01, 2.0)) * 0.35 * (1.0-open);
  // sensor noise
  col += (hash(uv*uRes + uTime) - 0.5) * 0.025;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`;

export const MICRO_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
