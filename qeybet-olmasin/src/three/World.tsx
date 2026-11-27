// 3D dünya: işıqlar, səma, həyət, skamya, iki personaj, telefon, tum qabıqları və kamera.
import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Bench, Courtyard } from './Courtyard';
import { Character, KENAN, TURAL } from './Character';
import { phoneTexture } from './textures';
import type { PhoneState, Shot, Stage } from '../acting';

const CameraRig: React.FC<{ shot: Shot; shake: number }> = ({ shot, shake }) => {
  const { camera } = useThree();
  const [x, y, z] = shot.pos;
  const [tx, ty, tz] = shot.target;
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(x + Math.sin(shake * 1.7) * 0.004, y + Math.sin(shake * 2.3) * 0.003, z);
    cam.fov = shot.fov;
    cam.near = 0.05;
    cam.far = 120;
    cam.lookAt(tx, ty, tz);
    cam.updateProjectionMatrix();
  }, [camera, x, y, z, tx, ty, tz, shot.fov, shake]);
  return null;
};

const Sky: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {},
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.05,0.0,1.0); vec3 a = vec3(0.93,0.95,0.94); vec3 b = vec3(0.45,0.66,0.88); gl_FragColor = vec4(mix(a,b,pow(h,0.8)),1.0); }',
      }),
    [],
  );
  return (
    <mesh material={mat} scale={90}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
};

const PHONE_G = new RoundedBoxGeometry(0.074, 0.152, 0.009, 3, 0.009);
const Phone: React.FC<{ st: PhoneState; fontsReady: boolean }> = ({ st, fontsReady }) => {
  const pq = Math.round(st.pulse * 8) / 8;
  const map = useMemo(() => phoneTexture(st.screen, pq), [st.screen, pq, fontsReady]);
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15171a', roughness: 0.35, metalness: 0.4 }), []);
  if (!st.visible) return null;
  const bz = st.buzz ? 0.08 : 0;
  return (
    <group position={[0.0, -0.07, 0.034]} rotation={[0, 0, bz]}>
      <mesh geometry={PHONE_G} material={body} castShadow />
      <mesh position={[0, 0, 0.0048]}>
        <planeGeometry args={[0.067, 0.142]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
    </group>
  );
};

const SEED = new THREE.SphereGeometry(1, 8, 6);
const Seeds: React.FC<{ n: number }> = ({ n }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2420', roughness: 0.5 }), []);
  return (
    <group position={[0, -0.06, 0.03]}>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} geometry={SEED} material={mat} position={[(i % 3) * 0.012 - 0.012, -Math.floor(i / 3) * 0.01, 0.004 * (i % 2)]} rotation={[0, 0, i]} scale={[0.009, 0.005, 0.004]} />
      ))}
    </group>
  );
};

export const World: React.FC<{ stage: Stage; frame: number; fontsReady: boolean; showSeedsOffer?: boolean }> = ({
  stage,
  frame,
  fontsReady,
  showSeedsOffer,
}) => {
  const shellMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2c2622', roughness: 0.6 }), []);
  return (
    <>
      <CameraRig shot={stage.cam} shake={frame * 0.05} />
      <Sky />
      <fog attach="fog" args={['#dfe9ef', 16, 60]} />
      <hemisphereLight args={['#d6e7ff', '#a58d6c', 1.15]} />
      <directionalLight
        position={[-4.5, 7.5, 6]}
        intensity={2.6}
        color="#fff0d6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <directionalLight position={[3, 2.2, 6]} intensity={0.55} color="#e6eeff" />
      <Courtyard />
      <Bench />
      <Character
        look={TURAL}
        pose={stage.tural}
        rightHand={<Phone st={stage.phone} fontsReady={fontsReady} />}
      />
      <Character look={KENAN} pose={stage.kenan} rightHand={showSeedsOffer ? <Seeds n={7} /> : null} />
      {stage.shells.map((s, i) => (
        <mesh key={i} material={shellMat} position={s.p} rotation={[s.spin, s.spin * 0.7, 0]} scale={[0.009, 0.004, 0.005]}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
      ))}
    </>
  );
};
