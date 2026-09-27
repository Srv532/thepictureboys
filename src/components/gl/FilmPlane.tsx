"use client";
/* eslint-disable react-hooks/immutability -- three.js uniforms are mutable GPU state, updated every frame by design */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { fragment, vertex } from "./filmShader";

export type FilmSource = { kind: "video"; el: HTMLVideoElement } | { kind: "image"; url: string };

type Props = {
  source: FilmSource;
  intensity?: number;
  /** 0..1, driven from outside (hover state). */
  hover?: { current: number };
  /** 0..1 fade to black (e.g. on scroll). */
  fade?: { current: number };
  /** Follow the pointer (desktop) or drift slowly (touch). */
  pointer?: boolean;
};

function Plane({ source, intensity = 1, hover, fade, pointer = true }: Props) {
  const { size, gl } = useThree();
  const mouse = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector2());

  const texture = useMemo(() => {
    const tex =
      source.kind === "video" ? new THREE.VideoTexture(source.el) : new THREE.TextureLoader().load(source.url, (t) => {
        uniforms.uTexRes.value.set((t.image as HTMLImageElement).width, (t.image as HTMLImageElement).height);
      });
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTexRes: { value: new THREE.Vector2(16, 9) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uIntensity: { value: intensity },
      uHover: { value: 0 },
      uFade: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  uniforms.uTex.value = texture;

  useEffect(() => {
    uniforms.uRes.value.set(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio());
  }, [size, gl, uniforms]);

  useEffect(() => {
    if (source.kind === "video") {
      const v = source.el;
      const set = () => v.videoWidth && uniforms.uTexRes.value.set(v.videoWidth, v.videoHeight);
      set();
      v.addEventListener("loadedmetadata", set);
      return () => v.removeEventListener("loadedmetadata", set);
    }
  }, [source, uniforms]);

  useEffect(() => {
    if (!pointer) return;
    const move = (e: PointerEvent) =>
      target.current.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [pointer]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!pointer) target.current.set(Math.sin(t * 0.3) * 0.6, Math.cos(t * 0.23) * 0.4);
    mouse.current.lerp(target.current, 0.06);
    uniforms.uMouse.value.copy(mouse.current);
    uniforms.uTime.value = t;
    uniforms.uHover.value += ((hover?.current ?? 0) - uniforms.uHover.value) * 0.08;
    uniforms.uFade.value = fade?.current ?? 0;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  );
}

export default function FilmPlane(props: Props & { className?: string; dpr?: [number, number] }) {
  return (
    <Canvas
      className={props.className}
      dpr={props.dpr ?? [1, 2]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1] }}
      aria-hidden
    >
      <Plane {...props} />
    </Canvas>
  );
}
