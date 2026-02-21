"use client";

import dynamic from "next/dynamic";
import { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const mouseTarget = { x: 0, y: 0 };

function useMouseParallax() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseTarget.y = (1 - e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    const onLeave = () => {
      mouseTarget.x = 0;
      mouseTarget.y = 0;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);
}

function PenguinPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture("/penguin-icon.png");
  const currentRotation = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    currentRotation.current.x += (mouseTarget.y - currentRotation.current.x) * delta * 4;
    currentRotation.current.y += (mouseTarget.x - currentRotation.current.y) * delta * 4;
    meshRef.current.rotation.x = currentRotation.current.x;
    meshRef.current.rotation.y = currentRotation.current.y;
  });

  const mat = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
  }, [texture]);

  return (
    <mesh ref={meshRef} material={mat} scale={[4, 4, 1]} position={[0, 0, -2]}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#0c0f14"]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 4]} intensity={0.6} color="#5ec8e6" />
      <pointLight position={[-2, -1, 3]} intensity={0.3} color="#5ec8e6" />
      <Suspense fallback={null}>
        <PenguinPlane />
      </Suspense>
    </>
  );
}

function Background3DInner() {
  useMouseParallax();
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(94,200,230,0.12) 0%, transparent 55%)",
        }}
      />
    </div>
  );
}

export const Background3D = dynamic(() => Promise.resolve(Background3DInner), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-[#0c0f14]" />,
});
