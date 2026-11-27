// Həyət: səki, skamya, çinar ağacı, gül ləki, işıq dirəyi, zibil qabı, arxada beşmərtəbəli bina, eyvanlar və paltar ipi.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { barkTexture, facadeTexture, pavingTexture } from './textures';
import { hash } from '../anim';

const std = (color: string, roughness = 0.8, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });

const Box: React.FC<{ s: [number, number, number]; p: [number, number, number]; r?: [number, number, number]; m: THREE.Material; shadow?: boolean }> = ({
  s,
  p,
  r,
  m,
  shadow = true,
}) => (
  <mesh position={p} rotation={r} material={m} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

export const Bench: React.FC = () => {
  const wood = useMemo(() => std('#a5683c', 0.7), []);
  const woodDark = useMemo(() => std('#8a532d', 0.75), []);
  const iron = useMemo(() => std('#2e3337', 0.55, { metalness: 0.3 }), []);
  return (
    <group>
      {[-0.17, -0.057, 0.057, 0.17].map((z, i) => (
        <Box key={z} s={[1.86, 0.034, 0.1]} p={[0, 0.4, z]} m={i % 2 ? woodDark : wood} />
      ))}
      {[0.6, 0.75].map((y, i) => (
        <Box key={y} s={[1.86, 0.1, 0.032]} p={[0, y, -0.27 - (y - 0.6) * 0.18]} r={[-0.16, 0, 0]} m={i % 2 ? wood : woodDark} />
      ))}
      {[-0.82, 0.82].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Box s={[0.05, 0.38, 0.05]} p={[0, 0.19, 0.17]} m={iron} />
          <Box s={[0.05, 0.84, 0.05]} p={[0, 0.42, -0.25]} r={[-0.1, 0, 0]} m={iron} />
          <Box s={[0.05, 0.04, 0.5]} p={[0, 0.37, -0.03]} m={iron} />
          <Box s={[0.05, 0.035, 0.5]} p={[0, 0.66, 0.0]} m={iron} />
          <Box s={[0.05, 0.3, 0.04]} p={[0, 0.52, 0.22]} m={iron} />
        </group>
      ))}
    </group>
  );
};

const Tree: React.FC<{ p: [number, number, number] }> = ({ p }) => {
  const bark = useMemo(() => std('#ffffff', 0.9, { map: barkTexture() }), []);
  const leaves = useMemo(() => ['#5b9a43', '#6cae4e', '#4d8a3c', '#78b85a'].map((c) => std(c, 0.85, { flatShading: true })), []);
  const blobs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        p: [
          (hash(i * 3.1) - 0.5) * 3.2,
          4.0 + hash(i * 5.7) * 1.9,
          (hash(i * 7.3) - 0.5) * 2.6,
        ] as [number, number, number],
        r: 0.75 + hash(i * 9.1) * 0.65,
        m: i % 4,
      })),
    [],
  );
  return (
    <group position={p}>
      <mesh material={bark} position={[0, 2.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.26, 4.0, 18]} />
      </mesh>
      <mesh material={bark} position={[-0.45, 3.7, 0.1]} rotation={[0.1, 0, 0.6]} castShadow>
        <cylinderGeometry args={[0.07, 0.12, 1.4, 10]} />
      </mesh>
      <mesh material={bark} position={[0.4, 3.9, -0.1]} rotation={[-0.1, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.07, 0.11, 1.3, 10]} />
      </mesh>
      {blobs.map((b, i) => (
        <mesh key={i} material={leaves[b.m]} position={b.p} scale={b.r} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
};

const Building: React.FC = () => {
  const cols = 12;
  const rows = 5;
  const W = cols * 2.2;
  const H = rows * 2.6;
  const facade = useMemo(() => std('#ffffff', 0.95, { map: facadeTexture(cols, rows) }), []);
  const slab = useMemo(() => std('#d9c6a2', 0.9), []);
  const rail = useMemo(() => std('#cfc7b6', 0.8), []);
  const cloth = useMemo(() => ['#d94b4b', '#f2f2f2', '#3d7fc4', '#f2c14e', '#7cb36b'].map((c) => std(c, 0.9, { side: THREE.DoubleSide })), []);
  const z0 = -9.5;
  const balconies: [number, number][] = [
    [2, 1], [5, 1], [8, 2], [3, 3], [6, 2], [9, 3], [1, 2], [4, 4], [7, 4], [10, 1],
  ];
  return (
    <group position={[0, 0, z0]}>
      <mesh material={facade} position={[0, H / 2, 0]} receiveShadow>
        <planeGeometry args={[W, H]} />
      </mesh>
      <Box s={[W + 0.4, 0.4, 1.2]} p={[0, H + 0.2, -0.3]} m={slab} />
      {balconies.map(([c, r]) => {
        const x = -W / 2 + c * 2.2 + 1.1;
        const y = r * 2.6 + 0.3;
        return (
          <group key={`${c}-${r}`} position={[x, y, 0.4]}>
            <Box s={[1.7, 0.12, 0.8]} p={[0, 0, 0]} m={slab} />
            <Box s={[1.7, 0.75, 0.06]} p={[0, 0.42, 0.38]} m={rail} />
            {hash(c * 13 + r) > 0.45
              ? [0, 1, 2].map((k) => (
                  <mesh key={k} material={cloth[(c + r + k) % 5]} position={[-0.5 + k * 0.45, 1.25, 0.2]}>
                    <planeGeometry args={[0.32, 0.45]} />
                  </mesh>
                ))
              : null}
          </group>
        );
      })}
    </group>
  );
};

const Shells: React.FC = () => {
  const mat = useMemo(() => std('#2c2622', 0.6), []);
  const pos = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => [
        (hash(i * 1.3) - 0.5) * 1.5,
        0.006,
        0.35 + hash(i * 2.1) * 0.65,
        hash(i * 3.7) * 3,
      ]),
    [],
  );
  return (
    <group>
      {pos.map(([x, y, z, r], i) => (
        <mesh key={i} material={mat} position={[x, y, z]} rotation={[0, r, 0]} scale={[0.009, 0.004, 0.005]}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
};

export const Courtyard: React.FC = () => {
  const ground = useMemo(() => std('#ffffff', 0.95, { map: pavingTexture() }), []);
  const curb = useMemo(() => std('#a7a397', 0.9), []);
  const soil = useMemo(() => std('#5b4535', 1), []);
  const bush = useMemo(() => ['#4c8a3a', '#3e7a34', '#5d9a45'].map((c) => std(c, 0.9, { flatShading: true })), []);
  const pole = useMemo(() => std('#394046', 0.5, { metalness: 0.4 }), []);
  const lampGlass = useMemo(() => std('#fff6dc', 0.3, { emissive: '#fff1c8', emissiveIntensity: 0.4 }), []);
  const bin = useMemo(() => std('#4e6a4a', 0.6), []);
  return (
    <group>
      <mesh material={ground} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
      </mesh>
      {/* gül ləki skamyanın arxasında */}
      <Box s={[5.6, 0.2, 0.9]} p={[0, 0.1, -1.05]} m={curb} />
      <Box s={[5.4, 0.04, 0.7]} p={[0, 0.21, -1.05]} m={soil} shadow={false} />
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} material={bush[i % 3]} position={[-2.4 + i * 0.6, 0.45 + hash(i) * 0.12, -1.08]} scale={[0.42, 0.36 + hash(i * 2) * 0.12, 0.34]} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
      <Tree p={[2.6, 0, -2.9]} />
      {/* işıq dirəyi */}
      <group position={[-1.75, 0, -0.75]}>
        <mesh material={pole} position={[0, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.06, 3.4, 12]} />
        </mesh>
        <mesh material={pole} position={[0, 3.45, 0]} castShadow>
          <boxGeometry args={[0.3, 0.12, 0.3]} />
        </mesh>
        <mesh material={lampGlass} position={[0, 3.36, 0]}>
          <boxGeometry args={[0.24, 0.06, 0.24]} />
        </mesh>
      </group>
      {/* zibil qabı */}
      <group position={[1.18, 0, 0.05]}>
        <mesh material={bin} position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.17, 0.6, 18]} />
        </mesh>
        <mesh material={pole} position={[0, 0.61, 0]}>
          <torusGeometry args={[0.2, 0.015, 8, 24]} />
        </mesh>
      </group>
      <Shells />
      <Building />
    </group>
  );
};
