"use client";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Model() {
  const { scene } = useGLTF("/model-original.glb");
  const ref = useRef<THREE.Group>(null);

  // Float + slow rotation + lean forward
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 0.7) * 0.1;
    ref.current.rotation.y = state.clock.elapsedTime * 0.25;
  });

  return (
    <group ref={ref} rotation={[-0.12, Math.PI, 0]}>
      <primitive
        object={scene}
        scale={1.7}
        position={[0, 0.3, 0]}
      />
    </group>
  );
}

function Rings() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ring1.current) ring1.current.rotation.z = state.clock.elapsedTime * 0.4;
    if (ring2.current) ring2.current.rotation.z = -state.clock.elapsedTime * 0.25;
  });

  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.008, 16, 100]} />
        <meshBasicMaterial color="#0eb3ff" transparent opacity={0.35} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2.4, 0.3, 0]}>
        <torusGeometry args={[2.2, 0.005, 16, 100]} />
        <meshBasicMaterial color="#7000ff" transparent opacity={0.25} />
      </mesh>
    </>
  );
}

export default function Mascote3D() {
  return (
    <div className="w-full" style={{ height: "100%", minHeight: 500 }}>
      <Canvas
        camera={{ position: [0, 0.5, 8], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-4, 3, 3]} intensity={4} color="#0eb3ff" distance={12} />
        <pointLight position={[4, -1, 3]} intensity={3} color="#7000ff" distance={12} />
        <pointLight position={[0, 0, 5]} intensity={2} color="#0eb3ff" distance={8} />

        <Suspense fallback={null}>
          <Model />
          <Rings />
          <ContactShadows
            position={[0, -1.8, 0]}
            opacity={0.4}
            scale={5}
            blur={2}
            color="#0eb3ff"
          />
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
