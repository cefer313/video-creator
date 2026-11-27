// Stilizə olunmuş gənc oğlan: oturmuş poza, iki sümüklü IK ilə qollar, üz ifadələri (göz, qapaq, qaş, ağız).
// Koordinatlar metrlə; personaj +z istiqamətinə (kameraya) baxır, onun sol əli +x tərəfdədir.
import React, { useMemo } from 'react';
import * as THREE from 'three';

export type V3 = [number, number, number];
export type Look = {
  skin: string;
  hair: string;
  top: string;
  topDark: string;
  inner: string;
  pants: string;
  shoe: string;
  sole: string;
  style: 'quiff' | 'curly';
  hoodie: boolean;
};
export type Arm = { t: V3; pole: V3; wrist?: V3 };
export type CharPose = {
  x: number;
  lean: number;
  twist: number;
  tilt: number;
  hy: number;
  hp: number;
  hr: number;
  la: Arm;
  ra: Arm;
  browUp: number;
  browIn: number;
  smile: number;
  mouth: number;
  lid: number;
  eyeX: number;
  eyeY: number;
};

const PELVIS: V3 = [0, 0.5, -0.03];
const SHOULDER_Y = 0.47;
const SHOULDER_X = 0.205;
const L1 = 0.26;
const L2 = 0.28;
const NECK_Y = 0.61;
// Baş ellipsoidi (boyun nöqtəsinə nəzərən)
const HC = 0.15;
const RX = 0.147;
const RY = 0.164;
const RZ = 0.152;
const surfZ = (x: number, y: number) => RZ * Math.sqrt(Math.max(0, 1 - (x / RX) ** 2 - ((y - HC) / RY) ** 2));

const v = (a: V3) => new THREE.Vector3(a[0], a[1], a[2]);

/** Personajın kök fəzasındakı nöqtəni gövdə (torso) fəzasına keçirir. */
export const torsoMatrix = (p: Pick<CharPose, 'lean' | 'twist' | 'tilt'>) => {
  const m = new THREE.Matrix4();
  m.compose(v(PELVIS), new THREE.Quaternion().setFromEuler(new THREE.Euler(p.lean, p.twist, p.tilt, 'YXZ')), new THREE.Vector3(1, 1, 1));
  return m;
};
/** Gövdə fəzasındakı çiyin nöqtəsinin kök fəzasındakı yeri (başqa personajın əli üçün). */
export const shoulderInRoot = (p: CharPose, side: 1 | -1): V3 => {
  const w = new THREE.Vector3(side * SHOULDER_X, SHOULDER_Y + 0.02, 0.02).applyMatrix4(torsoMatrix(p));
  return [w.x + p.x, w.y, w.z];
};
const headMatrix = (p: CharPose) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(0, NECK_Y, 0),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(p.hp, p.hy, p.hr, 'YXZ')),
    new THREE.Vector3(1, 1, 1),
  );
/** Baş fəzasındakı nöqtənin dünya fəzasındakı yeri. */
export const headPoint = (p: CharPose, local: V3): V3 => {
  const w = v(local).applyMatrix4(headMatrix(p)).applyMatrix4(torsoMatrix(p));
  return [w.x + p.x, w.y, w.z];
};
/** Qulağın dünya fəzasındakı yeri (side: 1 = sol, -1 = sağ). */
export const earWorld = (p: CharPose, side: 1 | -1): V3 => headPoint(p, [side * RX, 0.145, -0.005]);
/** Ağızın dünya fəzasındakı təxmini yeri. */
export const mouthWorld = (p: CharPose): V3 => {
  const head = new THREE.Matrix4().compose(
    new THREE.Vector3(0, NECK_Y, 0),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(p.hp, p.hy, p.hr, 'YXZ')),
    new THREE.Vector3(1, 1, 1),
  );
  const w = new THREE.Vector3(0, 0.085, 0.16).applyMatrix4(head).applyMatrix4(torsoMatrix(p));
  return [w.x + p.x, w.y, w.z];
};

type Solved = { q: THREE.Quaternion; bend: number };
const solveArm = (S: THREE.Vector3, T: THREE.Vector3, pole: THREE.Vector3): Solved => {
  const d = T.clone().sub(S);
  const dist = THREE.MathUtils.clamp(d.length(), 0.08, L1 + L2 - 0.003);
  const u = d.normalize();
  const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const w = pole.clone().sub(u.clone().multiplyScalar(pole.dot(u)));
  if (w.lengthSq() < 1e-6) w.set(0, 0, 1);
  w.normalize();
  const E = S.clone().add(u.clone().multiplyScalar(a)).add(w.clone().multiplyScalar(h));
  const H = S.clone().add(u.clone().multiplyScalar(dist));
  const d1 = E.clone().sub(S).normalize();
  const d2 = H.clone().sub(E).normalize();
  const yl = d1.clone().negate();
  let zl = d2.clone().sub(d1.clone().multiplyScalar(d2.dot(d1)));
  if (zl.lengthSq() < 1e-6) zl = w.clone();
  zl.normalize();
  const xl = new THREE.Vector3().crossVectors(yl, zl).normalize();
  const m = new THREE.Matrix4().makeBasis(xl, yl, zl);
  return { q: new THREE.Quaternion().setFromRotationMatrix(m), bend: Math.acos(THREE.MathUtils.clamp(d1.dot(d2), -1, 1)) };
};

// ---------- ortaq həndəsələr (bir dəfə yaradılır) ----------
const G = {
  sphere: new THREE.SphereGeometry(1, 28, 20),
  sphereLo: new THREE.SphereGeometry(1, 14, 10),
  torso: new THREE.CapsuleGeometry(0.165, 0.26, 8, 20),
  upper: new THREE.CapsuleGeometry(0.058, 0.17, 6, 14),
  fore: new THREE.CapsuleGeometry(0.05, 0.16, 6, 14),
  thigh: new THREE.CapsuleGeometry(0.078, 0.34, 6, 14),
  shin: new THREE.CapsuleGeometry(0.063, 0.33, 6, 14),
  neck: new THREE.CylinderGeometry(0.05, 0.055, 0.1, 16),
  brow: new THREE.CapsuleGeometry(0.0072, 0.034, 4, 8),
  lash: new THREE.CapsuleGeometry(0.0035, 0.05, 4, 8),
  thumb: new THREE.CapsuleGeometry(0.016, 0.03, 4, 8),
  string: new THREE.CylinderGeometry(0.005, 0.005, 0.16, 6),
  shoe: (() => {
    const g = new THREE.CapsuleGeometry(0.055, 0.15, 6, 14);
    g.rotateX(Math.PI / 2);
    g.scale(1, 0.75, 1);
    return g;
  })(),
  hairCap: new THREE.SphereGeometry(1, 30, 18, 0, Math.PI * 2, 0, Math.PI * 0.47),
};

const useMats = (look: Look) =>
  useMemo(() => {
    const m = (c: string, r = 0.72, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0, ...extra });
    return {
      skin: m(look.skin, 0.55),
      hair: m(look.hair, 0.85, { side: THREE.DoubleSide }),
      top: m(look.top, 0.8),
      topDark: m(look.topDark, 0.85),
      inner: m(look.inner, 0.8),
      pants: m(look.pants, 0.85),
      shoe: m(look.shoe, 0.6),
      sole: m(look.sole, 0.6),
      white: m('#fbfaf6', 0.35),
      iris: m('#3b2416', 0.3),
      dark: m('#22150f', 0.6),
      mouth: m('#4a1717', 0.65, { side: THREE.DoubleSide }),
      teeth: m('#fffdf6', 0.4),
      shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      cheek: m('#e88f7a', 0.6, { transparent: true, opacity: 0.22, depthWrite: false }),
    };
  }, [look]);

const Mesh: React.FC<{
  g: THREE.BufferGeometry;
  m: THREE.Material;
  p?: V3;
  r?: V3;
  s?: V3 | number;
  shadow?: boolean;
}> = ({ g, m, p, r, s, shadow = true }) => (
  <mesh
    geometry={g}
    material={m}
    position={p}
    rotation={r ? new THREE.Euler(r[0], r[1], r[2], 'YXZ') : undefined}
    scale={s as any}
    castShadow={shadow}
    receiveShadow
  />
);

// ---------- ağız: açıqlıq və təbəssümdən qurulan forma ----------
const mouthGeometry = (open: number, smile: number) => {
  const w = 0.064 + smile * 0.012 - open * 0.006;
  const hw = w / 2;
  const cy = smile * 0.011;
  const up = 0.003 + open * 0.004 - smile * 0.004;
  const lo = -(0.006 + open * 0.042) - Math.max(0, smile) * 0.013;
  const s = new THREE.Shape();
  s.moveTo(-hw, cy);
  s.quadraticCurveTo(0, up, hw, cy);
  s.quadraticCurveTo(0, lo, -hw, cy);
  return new THREE.ShapeGeometry(s, 14);
};

const Face: React.FC<{ pose: CharPose; mats: ReturnType<typeof useMats>; look: Look }> = ({ pose, mats, look }) => {
  const open = THREE.MathUtils.clamp(pose.mouth, 0, 1);
  const sm = THREE.MathUtils.clamp(pose.smile, -1, 1);
  const q = (x: number) => Math.round(x * 40) / 40;
  const mouthG = useMemo(() => mouthGeometry(q(open), q(sm)), [q(open), q(sm)]);
  const lid = THREE.MathUtils.clamp(pose.lid, 0.06, 1.25);
  const eyes = [1, -1].map((s) => {
    const ex = s * 0.057;
    const ey = 0.176;
    const ez = surfZ(ex, ey) - 0.008;
    const ix = ex + pose.eyeX * 0.012 - s * 0.002;
    const iy = ey + pose.eyeY * 0.009;
    const wl = Math.max(lid, 0.06);
    return (
      <group key={s}>
        <Mesh g={G.sphere} m={mats.white} p={[ex, ey, ez]} s={[0.039, 0.046 * wl, 0.024]} shadow={false} />
        <Mesh g={G.sphere} m={mats.iris} p={[ix, iy, ez + 0.017]} s={[0.022, 0.025 * Math.min(1, wl), 0.01]} shadow={false} />
        <Mesh g={G.sphereLo} m={mats.dark} p={[ix, iy, ez + 0.0215]} s={[0.011, 0.012 * Math.min(1, wl), 0.007]} shadow={false} />
        {lid > 0.35 ? <Mesh g={G.sphereLo} m={mats.shine} p={[ix + 0.008, iy + 0.009, ez + 0.027]} s={0.0055} shadow={false} /> : null}
        <Mesh
          g={G.brow}
          m={mats.dark}
          p={[s * 0.058, 0.243 + pose.browUp * 0.016, surfZ(s * 0.058, 0.243) - 0.002]}
          r={[0, s * 0.4, Math.PI / 2 - s * pose.browIn * 0.24]}
          shadow={false}
        />
      </group>
    );
  });
  return (
    <group>
      {eyes}
      <Mesh g={G.sphere} m={mats.skin} p={[0, 0.128, surfZ(0, 0.128) + 0.004]} s={[0.02, 0.024, 0.024]} shadow={false} />
      <mesh geometry={mouthG} material={mats.mouth} position={[0, 0.084, surfZ(0, 0.084) + 0.002]} />
      {open > 0.3 ? (
        <Mesh g={G.sphereLo} m={mats.teeth} p={[0, 0.084 - 0.004, surfZ(0, 0.084) + 0.0028]} s={[0.018, 0.0035, 0.001]} shadow={false} />
      ) : null}
    </group>
  );
};

const Hair: React.FC<{ look: Look; mats: ReturnType<typeof useMats> }> = ({ look, mats }) => {
  const curls = useMemo(() => {
    if (look.style !== 'curly') return [];
    const out: { p: V3; s: number }[] = [];
    const N = 240;
    for (let i = 0; i < N; i++) {
      const y = 1 - (i + 0.5) / N; // yuxarı yarımkürə
      const r = Math.sqrt(1 - y * y);
      const a = i * 2.399963;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (y < 0.12) continue;
      if (z > 0.3 && y < 0.62) continue; // alın açıq qalsın
      out.push({ p: [x * RX * 1.07, HC + 0.012 + y * RY * 1.03, z * RZ * 1.06 - 0.008], s: 0.024 + ((i * 0.37) % 1) * 0.008 });
    }
    return out;
  }, [look.style]);
  return (
    <group>
      <mesh
        geometry={G.hairCap}
        material={mats.hair}
        position={[0, HC + 0.012, -0.012]}
        rotation={[-0.42, 0, 0]}
        scale={[RX * 1.06, RY * 1.02, RZ * 1.05]}
        castShadow
      />
      {look.style === 'quiff' ? (
        <>
          <Mesh g={G.sphere} m={mats.hair} p={[0.012, HC + 0.138, 0.052]} r={[0.55, 0, -0.12]} s={[0.12, 0.05, 0.085]} />
          <Mesh g={G.sphere} m={mats.hair} p={[0.0, HC + 0.155, -0.01]} r={[0.2, 0, 0]} s={[0.125, 0.055, 0.12]} />
        </>
      ) : (
        curls.map((c, i) => <Mesh key={i} g={G.sphereLo} m={mats.hair} p={c.p} s={c.s} />)
      )}
    </group>
  );
};

export const Character: React.FC<{ look: Look; pose: CharPose; rightHand?: React.ReactNode; leftHand?: React.ReactNode }> = ({
  look,
  pose,
  rightHand,
  leftHand,
}) => {
  const mats = useMats(look);
  const tm = torsoMatrix(pose);
  const inv = tm.clone().invert();
  const arms = ([1, -1] as const).map((s) => {
    const a = s === 1 ? pose.la : pose.ra;
    const S = new THREE.Vector3(s * SHOULDER_X, SHOULDER_Y, 0);
    const T = v([a.t[0] - pose.x, a.t[1], a.t[2]]).applyMatrix4(inv);
    const P = v(a.pole).transformDirection(inv);
    const { q, bend } = solveArm(S, T, P);
    const wr = a.wrist ?? [0, 0, 0];
    return (
      <group key={s} position={S} quaternion={q}>
        <Mesh g={G.upper} m={mats.top} p={[0, -0.13, 0]} />
        <group position={[0, -L1, 0]} rotation={[-bend, 0, 0]}>
          <Mesh g={G.fore} m={mats.top} p={[0, -0.11, 0]} />
          <Mesh g={G.sphereLo} m={mats.topDark} p={[0, -0.205, 0]} s={[0.054, 0.02, 0.054]} />
          <group position={[0, -0.235, 0]} rotation={new THREE.Euler(wr[0], wr[1], wr[2], 'YXZ')}>
            <Mesh g={G.sphere} m={mats.skin} p={[0, -0.043, 0]} s={[0.043, 0.05, 0.03]} />
            <Mesh g={G.thumb} m={mats.skin} p={[-s * 0.03, -0.03, 0.022]} r={[0.5, 0, s * 0.6]} />
            {s === -1 ? rightHand : leftHand}
          </group>
        </group>
      </group>
    );
  });
  return (
    <group position={[pose.x, 0, 0]}>
      {/* ayaqlar (oturmuş) */}
      {[1, -1].map((s) => (
        <group key={s}>
          <Mesh g={G.thigh} m={mats.pants} p={[s * 0.098, PELVIS[1] - 0.005, PELVIS[2] + 0.2]} r={[Math.PI / 2, 0, 0]} />
          <Mesh g={G.shin} m={mats.pants} p={[s * 0.105, 0.27, 0.42]} r={[-0.05, 0, 0]} />
          <Mesh g={G.shoe} m={mats.shoe} p={[s * 0.108, 0.05, 0.47]} />
          <Mesh g={G.sphereLo} m={mats.sole} p={[s * 0.108, 0.018, 0.47]} s={[0.058, 0.018, 0.13]} />
        </group>
      ))}
      <group position={PELVIS} rotation={new THREE.Euler(pose.lean, pose.twist, pose.tilt, 'YXZ')}>
        <Mesh g={G.torso} m={mats.top} p={[0, 0.27, 0]} s={[1.12, 1, 0.82]} />
        {look.hoodie ? (
          <>
            <Mesh g={G.sphere} m={mats.topDark} p={[0, 0.5, -0.1]} s={[0.15, 0.08, 0.1]} />
            <Mesh g={G.sphere} m={mats.topDark} p={[0, 0.13, 0.125]} s={[0.12, 0.06, 0.02]} />
            <Mesh g={G.string} m={mats.inner} p={[-0.035, 0.44, 0.135]} r={[0.12, 0, 0.05]} shadow={false} />
            <Mesh g={G.string} m={mats.inner} p={[0.035, 0.44, 0.135]} r={[0.12, 0, -0.05]} shadow={false} />
          </>
        ) : (
          <>
            <Mesh g={G.sphere} m={mats.topDark} p={[0, 0.535, -0.005]} s={[0.135, 0.05, 0.118]} />
            <Mesh g={G.sphere} m={mats.inner} p={[0, 0.548, 0.004]} s={[0.085, 0.03, 0.08]} />
            <Mesh g={G.sphere} m={mats.topDark} p={[0, 0.03, 0.0]} s={[0.19, 0.05, 0.142]} />
          </>
        )}
        <Mesh g={G.neck} m={mats.skin} p={[0, 0.565, 0]} />
        <group position={[0, NECK_Y, 0]} rotation={new THREE.Euler(pose.hp, pose.hy, pose.hr, 'YXZ')}>
          <Mesh g={G.sphere} m={mats.skin} p={[0, HC, 0]} s={[RX, RY, RZ]} />
          <Mesh g={G.sphereLo} m={mats.skin} p={[RX - 0.004, 0.145, -0.005]} s={[0.018, 0.034, 0.026]} />
          <Mesh g={G.sphereLo} m={mats.skin} p={[-RX + 0.004, 0.145, -0.005]} s={[0.018, 0.034, 0.026]} />
          <Hair look={look} mats={mats} />
          <Face pose={pose} mats={mats} look={look} />
        </group>
        {arms}
      </group>
    </group>
  );
};

export const TURAL: Look = {
  skin: '#e9b48e',
  hair: '#2a1a10',
  top: '#e9742b',
  topDark: '#c95f1c',
  inner: '#f7f3ea',
  pants: '#2f4068',
  shoe: '#f3f3f1',
  sole: '#e9742b',
  style: 'quiff',
  hoodie: true,
};
export const KENAN: Look = {
  skin: '#d39c74',
  hair: '#17110c',
  top: '#1f7a78',
  topDark: '#17605e',
  inner: '#f4f1ea',
  pants: '#545a66',
  shoe: '#2b2b2e',
  sole: '#f1f1ee',
  style: 'curly',
  hoodie: false,
};

/** Əllər dizin üstündə — əsas poza. */
export const restPose = (x: number): CharPose => ({
  x,
  lean: 0.04,
  twist: 0,
  tilt: 0,
  hy: 0,
  hp: 0,
  hr: 0,
  la: { t: [x + 0.13, 0.6, 0.33], pole: [0.5, -0.7, 0.1] },
  ra: { t: [x - 0.13, 0.6, 0.33], pole: [-0.5, -0.7, 0.1] },
  browUp: 0,
  browIn: 0,
  smile: 0.1,
  mouth: 0,
  lid: 0.92,
  eyeX: 0,
  eyeY: 0,
});
