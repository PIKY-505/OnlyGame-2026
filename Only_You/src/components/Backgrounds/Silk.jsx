/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from "@react-three/fiber";
import { forwardRef, useRef, useMemo, useEffect } from "react";
import { Color } from "three";

// Conversor de Hex a RGB normalizado (para WebGL)
const hexToNormalizedRGB = (hex) => {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  // FIX: Usar coordenadas de clip directas para llenar la pantalla siempre
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

const SilkPlane = forwardRef(function SilkPlane({ uniforms }, ref) {
  useFrame((_, delta) => {
    ref.current.material.uniforms.uTime.value += 0.1 * delta;
  });

  return (
    <mesh ref={ref}>
      {/* FIX: Geometría 2x2 para cubrir el espacio de clip (-1 a 1) completo */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
});
SilkPlane.displayName = "SilkPlane";

const Silk = ({
  speed = 1,
  scale = 2,
  color = "#ff99cc",
  noiseIntensity = 0.5,
  rotation = 0,
}) => {
  const meshRef = useRef();

  const uniforms = useMemo(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 },
    }),
    [], // Inicializar solo una vez para evitar reinicios de uTime
  );

  // Actualizar uniformes dinámicamente cuando cambian las props
  useEffect(() => {
    if (meshRef.current) {
      const u = meshRef.current.material.uniforms;
      u.uSpeed.value = speed;
      u.uScale.value = scale;
      u.uNoiseIntensity.value = noiseIntensity;
      u.uColor.value.set(...hexToNormalizedRGB(color));
      u.uRotation.value = rotation;
    }
  }, [speed, scale, noiseIntensity, color, rotation]);

  // FIX: Forzar actualización de tamaño durante la transición de desbloqueo
  useEffect(() => {
    const handleResize = () => window.dispatchEvent(new Event("resize"));
    // Disparar resize periódicamente durante la animación (1.2s) para asegurar
    // que R3F detecte el tamaño final correcto y elimine los bordes negros.
    const interval = setInterval(handleResize, 50);
    const timeout = setTimeout(() => clearInterval(interval), 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="always"
      resize={{ debounce: 0 }} // FIX: Respuesta inmediata al cambio de tamaño
      // ESTILO AÑADIDO: Para que funcione como fondo
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0, // Fondo
        background: "black", // Fondo de seguridad por si tarda en cargar el shader
      }}>
      <SilkPlane ref={meshRef} uniforms={uniforms} />
    </Canvas>
  );
};

export default Silk;
