"use client";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import {
  Bloom,
  Noise,
  EffectComposer,
  SSAO,
  DepthOfField,
} from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import { fragmentShader, vertexShader } from "@/lib/shaders";

export default function Home() {
  return (
    <>
      <Background />
    </>
  );
}
function Background() {
  return (
    <section className="h-screen relative flex justify-center items-center px-24 py-16 bg-gray-200">
      <NoiseFilter />
      <Canvas
        camera={{ position: [0.0, 0.0, 8.0] }}
        className="min-h-screen"
        style={{ filter: "blur(30px)" }}
      >
        <Blob />
      </Canvas>
    </section>
  );
}

function Blob(props) {
  const mesh = useRef();
  const hover = useRef(false);
  const x = useRef(4);
  const y = useRef(1);
  const z = useRef(0);
  const uniforms = useMemo(() => {
    return {
      u_time: { value: 1 },
      u_intensity: { value: 0.5 },
    };
  }, []);

  useFrame((state) => {
    const { clock } = state;
    if (mesh.current) {
      mesh.current.material.uniforms.u_time.value =
        0.4 * clock.getElapsedTime();
      mesh.current.material.uniforms.u_intensity.value = THREE.MathUtils.lerp(
        mesh.current.material.uniforms.u_intensity.value,
        hover.current ? 2 : 0.5,
        0.02
      );
      const mod = 0.0004 * clock.getElapsedTime();
    }
  });

  return (
    // @ts-ignore
    <mesh
      ref={mesh}
      {...props}
      scale={1.5}
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
      position={[x.current, y.current, z.current]}
    >
      <icosahedronGeometry args={[2, 20]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

function NoiseFilter() {
  const [backgroundPosition, setBackgroundPosition] = useState("0 0");

  useEffect(() => {
    const timer = setInterval(() => {
      const randomX = Math.floor(Math.random() * window.innerWidth);
      const randomY = Math.floor(Math.random() * window.innerHeight);
      setBackgroundPosition(`${randomX}px ${randomY}px`);
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div
      style={{ backgroundPosition }}
      className="absolute z-50 noise  min-h-screen min-w-full top-0 left-0"
    >
      dsdsd
    </div>
  );
}
