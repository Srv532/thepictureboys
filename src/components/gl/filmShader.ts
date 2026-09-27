export const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * "Shot on film" treatment: cover-fit, lens barrel + drift, chromatic aberration,
 * light leak, vignette and animated grain. uHover adds a liquid ripple + RGB split.
 */
export const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uTexRes;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uIntensity;
  uniform float uHover;
  uniform float uFade;
  varying vec2 vUv;

  float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }

  vec2 cover(vec2 uv) {
    float rs = uRes.x / uRes.y;
    float ri = uTexRes.x / uTexRes.y;
    vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c);
    vec2 uv = vUv;
    uv += c * d * d * 0.10 * uIntensity;
    uv = (uv - 0.5) * (1.0 - 0.04 * uIntensity) + 0.5 + uMouse * 0.012 * uIntensity;
    uv += normalize(c + 1e-5) * sin(d * 26.0 - uTime * 4.0) * 0.007 * uHover;
    uv.x += sin(uv.y * 12.0 + uTime * 2.0) * 0.004 * uHover;

    vec2 t = cover(uv);
    float ca = (0.002 + d * 0.007) * uIntensity + 0.012 * uHover;
    vec3 col = vec3(
      texture2D(uTex, t + c * ca).r,
      texture2D(uTex, t).g,
      texture2D(uTex, t - c * ca).b
    );

    float leak = smoothstep(0.85, 0.0, distance(vUv, vec2(0.15 + 0.35 * sin(uTime * 0.13), 0.95)));
    col += vec3(1.0, 0.42, 0.12) * leak * 0.2 * uIntensity;
    col *= mix(1.0, smoothstep(1.0, 0.28, d * 1.15), uIntensity);
    col += (rand(vUv * uRes + fract(uTime * 7.0)) - 0.5) * 0.09 * uIntensity;
    col = mix(col, vec3(0.04, 0.035, 0.03), uFade);
    gl_FragColor = vec4(col, 1.0);
  }
`;
