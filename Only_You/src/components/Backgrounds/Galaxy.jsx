import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform bool uTransparent;
varying vec2 vUv;

// --- OPTIMIZACIÓN 1: Reducimos las capas a 3.0 para equilibrio calidad/rendimiento ---
#define NUM_LAYER 3.0 
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float tri(float x) { return abs(fract(x) * 2.0 - 1.0); }
float tris(float x) { float t = fract(x); return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0)); }
float trisn(float x) { float t = fract(x); return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0; }
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}
vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * size * color;
    }
  }
  return col;
}
void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
  
  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
  vec3 col = vec3(0.0);
  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }
  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

// --- COMPONENTE GALAXY ---
const Galaxy = ({
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.0,
  density = 1.5,
  hueShift = 300,
  disableAnimation = false,
  speed = 0.5,
  glowIntensity = 0.5,
  saturation = 0.8,
  twinkleIntensity = 0.5,
  rotationSpeed = 0.05,
  transparent = true,
  colorCycleSpeed = 10.0,
  rainbow = false,
  warp = false,
  ...rest
}) => {
  const ctnDom = useRef(null);
  const rainbowHueRef = useRef(hueShift);
  const programRef = useRef(null);

  // Guardamos la configuración en un ref para acceder a ella en el loop de animación
  // sin tener que recrear el loop cada vez que cambia una prop.
  const configRef = useRef({
    starSpeed,
    disableAnimation,
    rainbow,
    colorCycleSpeed,
    warp,
    hueShift,
  });

  useEffect(() => {
    configRef.current = {
      starSpeed,
      disableAnimation,
      rainbow,
      colorCycleSpeed,
      warp,
      hueShift,
    };
  }, [starSpeed, disableAnimation, rainbow, colorCycleSpeed, warp, hueShift]);

  // EFECTO 1: Inicialización (Solo al montar o cambiar transparencia)
  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;

    ctn.innerHTML = "";

    const renderer = new Renderer({
      alpha: transparent,
      premultipliedAlpha: false,
      dpr: 1,
    });
    const gl = renderer.gl;

    if (transparent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(0, 0, 0, 1);
    }

    let program;

    function resize() {
      const scale = 1;
      renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);

      if (programRef.current) {
        programRef.current.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        );
      }
    }
    window.addEventListener("resize", resize, false);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height,
          ),
        },
        uFocal: { value: new Float32Array(focal) },
        uRotation: { value: new Float32Array(rotation) },
        uStarSpeed: { value: starSpeed },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uTransparent: { value: transparent },
      },
    });
    programRef.current = program;

    const mesh = new Mesh(gl, { geometry, program });
    let animateId;

    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    function update(t) {
      animateId = requestAnimationFrame(update);

      if (!ctnDom.current || !programRef.current) return;

      const delta = t - lastTime;
      if (delta < interval) return;

      lastTime = t - (delta % interval);

      const {
        starSpeed: currentStarSpeedProp,
        disableAnimation: currentDisable,
        rainbow: currentRainbow,
        colorCycleSpeed: currentCycleSpeed,
        warp: currentWarp,
        hueShift: currentHueShift,
      } = configRef.current;

      if (!currentDisable) {
        program.uniforms.uTime.value = t * 0.001;
        const effectiveStarSpeed = currentWarp
          ? currentStarSpeedProp * 10.0
          : currentStarSpeedProp;
        program.uniforms.uStarSpeed.value =
          (t * 0.001 * effectiveStarSpeed) / 10.0;

        if (currentRainbow) {
          rainbowHueRef.current += currentCycleSpeed * 0.05;
          program.uniforms.uHueShift.value = rainbowHueRef.current % 360;
        } else {
          program.uniforms.uHueShift.value = currentHueShift;
        }
      }

      renderer.render({ scene: mesh });
    }
    animateId = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    gl.canvas.style.willChange = "transform";

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);

      if (ctn && gl.canvas && ctn.contains(gl.canvas)) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      programRef.current = null;
    };
  }, [transparent]); // Solo reiniciamos si cambia la transparencia (configuración del renderer)

  // EFECTO 2: Actualización de Uniforms (Reactivo y rápido)
  useEffect(() => {
    if (!programRef.current) return;
    const u = programRef.current.uniforms;

    u.uFocal.value = new Float32Array(focal);
    u.uRotation.value = new Float32Array(rotation);
    u.uDensity.value = density;
    u.uSpeed.value = speed;
    u.uGlowIntensity.value = glowIntensity;
    u.uSaturation.value = saturation;
    u.uTwinkleIntensity.value = twinkleIntensity;
    u.uRotationSpeed.value = rotationSpeed;
    // Nota: starSpeed, hueShift, rainbow, warp se manejan en el loop de animación via ref
  }, [
    focal,
    rotation,
    density,
    speed,
    glowIntensity,
    saturation,
    twinkleIntensity,
    rotationSpeed,
  ]);

  return (
    <div
      ref={ctnDom}
      className="galaxy-container"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        contain: "strict",
        overflow: "hidden",
      }}
      {...rest}
    />
  );
};

export default React.memo(Galaxy);
