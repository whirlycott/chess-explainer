import { LitElement, css, html, type PropertyValues } from 'lit';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Chess, type Square } from 'chess.js';
import type { Arrow } from '../data/types';
import { track, type TrackedPiece } from '../logic/diff';
import { MoveInput, type BoardMoveDetail } from './chess-board';

const FILES = 'abcdefgh';
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const ARROW_HEX: Record<string, number> = { green: 0x3ddc84, red: 0xff5a4e, blue: 0x4aa8ff, yellow: 0xffd34d };

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function squareToXZ(sq: string): [number, number] {
  return [FILES.indexOf(sq[0]) - 3.5, 3.5 - (Number(sq[1]) - 1)];
}

// ---------------------------------------------------------------- geometry

type Profile = [number, number][];

function arc(cy: number, r: number, fromDeg: number, toDeg: number, steps = 10): Profile {
  const pts: Profile = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180;
    pts.push([Math.max(0, Math.cos(a) * r), cy + Math.sin(a) * r]);
  }
  return pts;
}

const BASE: Profile = [
  [0, 0],
  [0.36, 0],
  [0.37, 0.03],
  [0.36, 0.06],
  [0.31, 0.09],
  [0.33, 0.11],
  [0.3, 0.14],
  [0.24, 0.17],
];

const PROFILES: Record<string, Profile> = {
  p: [...BASE, [0.17, 0.27], [0.12, 0.38], [0.18, 0.41], [0.19, 0.43], [0.11, 0.45], ...arc(0.55, 0.12, -60, 90)],
  r: [...BASE, [0.23, 0.22], [0.21, 0.55], [0.27, 0.6], [0.28, 0.72], [0.2, 0.72], [0.2, 0.68], [0, 0.68]],
  b: [...BASE, [0.17, 0.3], [0.12, 0.48], [0.18, 0.5], [0.18, 0.53], [0.12, 0.55], ...arc(0.67, 0.13, -70, 60), [0.04, 0.8], ...arc(0.84, 0.04, -60, 90, 6)],
  q: [...BASE, [0.2, 0.3], [0.13, 0.58], [0.21, 0.61], [0.21, 0.64], [0.14, 0.66], [0.2, 0.8], [0.24, 0.85], [0.18, 0.86], [0.1, 0.88], ...arc(0.93, 0.05, -60, 90, 6)],
  k: [...BASE, [0.21, 0.3], [0.14, 0.62], [0.22, 0.65], [0.22, 0.68], [0.15, 0.7], [0.21, 0.86], [0.19, 0.9], [0.07, 0.93], [0, 0.93]],
  n: [...BASE, [0.22, 0.2], [0.2, 0.24], [0, 0.24]],
};

const KNIGHT_OUTLINE: [number, number][] = [
  [14, 36], [15, 30], [18, 26], [20.4, 23.4], [22.5, 21], [22.5, 18.1], [19, 19.6], [16.3, 20.7], [13.2, 18.4],
  [14.9, 15.5], [20, 10.6], [23.1, 5.5], [24.6, 8.1], [29.2, 8.5], [33, 12], [35.6, 22.4], [34.6, 30], [33.6, 36],
];

const geometryCache = new Map<string, THREE.BufferGeometry[]>();

function pieceGeometries(type: string): THREE.BufferGeometry[] {
  const cached = geometryCache.get(type);
  if (cached) return cached;
  const lathe = new THREE.LatheGeometry(
    PROFILES[type].map(([x, y]) => new THREE.Vector2(x, y)),
    48,
  );
  const parts: THREE.BufferGeometry[] = [lathe];
  if (type === 'n') {
    const shape = new THREE.Shape(KNIGHT_OUTLINE.map(([x, y]) => new THREE.Vector2((x - 24.5) / 50, (36 - y) / 50)));
    const head = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3 });
    head.translate(0, 0.22, -0.1);
    // Turned 45 degrees so the horse's profile is visible from the player's side.
    head.rotateY(-Math.PI / 4);
    parts.push(head);
  }
  if (type === 'k') {
    const v = new THREE.BoxGeometry(0.06, 0.2, 0.06);
    v.translate(0, 1.02, 0);
    const h = new THREE.BoxGeometry(0.16, 0.055, 0.06);
    h.translate(0, 1.04, 0);
    parts.push(v, h);
  }
  if (type === 'r') {
    for (let i = 0; i < 6; i++) {
      const m = new THREE.BoxGeometry(0.09, 0.08, 0.07);
      m.translate(0, 0.76, 0.24);
      m.rotateY((i / 6) * Math.PI * 2);
      parts.push(m);
    }
  }
  if (type === 'q') {
    for (let i = 0; i < 8; i++) {
      const s = new THREE.SphereGeometry(0.035, 12, 8);
      s.translate(0, 0.87, 0.22);
      s.rotateY((i / 8) * Math.PI * 2);
      parts.push(s);
    }
  }
  geometryCache.set(type, parts);
  return parts;
}

// ---------------------------------------------------------------- component

interface Anim {
  mesh: THREE.Object3D;
  from: THREE.Vector3;
  to: THREE.Vector3;
  start: number;
  duration: number;
  remove?: boolean;
  grow?: boolean;
}

export class ChessBoard3D extends LitElement {
  static properties = {
    fen: { type: String },
    orientation: { type: String },
    arrows: { type: Array },
    highlights: { type: Array },
    lastMove: { type: Array },
    interactive: { type: Boolean },
    label: { type: String },
  };

  declare fen: string;
  declare orientation: 'white' | 'black';
  declare arrows: Arrow[];
  declare highlights: string[];
  declare lastMove: [string, string] | null;
  declare interactive: boolean;
  declare label: string;

  private renderer?: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  private controls?: OrbitControls;
  private pieces: TrackedPiece[] = [];
  private meshes = new Map<number, THREE.Group>();
  private squares: THREE.Mesh[] = [];
  private overlay = new THREE.Group();
  private arrowGroup = new THREE.Group();
  private anims: Anim[] = [];
  private resize?: ResizeObserver;
  private input = new MoveInput(
    () => this.fen,
    () => this.interactive,
  );
  private down: { x: number; y: number } | null = null;
  private materials = {
    w: new THREE.MeshPhysicalMaterial({ color: 0xe9dcc2, roughness: 0.35, clearcoat: 0.55, clearcoatRoughness: 0.25 }),
    b: new THREE.MeshPhysicalMaterial({ color: 0x23262f, roughness: 0.28, metalness: 0.15, clearcoat: 0.9, clearcoatRoughness: 0.15 }),
  };

  constructor() {
    super();
    this.fen = START;
    this.orientation = 'white';
    this.arrows = [];
    this.highlights = [];
    this.lastMove = null;
    this.interactive = false;
    this.label = 'Chess board, 3D view';
  }

  static supported(): boolean {
    try {
      const c = document.createElement('canvas');
      return !!c.getContext('webgl2');
    } catch {
      return false;
    }
  }

  protected firstUpdated(): void {
    const canvas = this.renderRoot.querySelector('canvas')!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    this.renderer = renderer;

    const pmrem = new THREE.PMREMGenerator(renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(-4, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
    sun.shadow.radius = 4;
    this.scene.add(sun, new THREE.HemisphereLight(0xbfd4ff, 0x1a1420, 0.6));

    this.buildBoard();
    this.scene.add(this.overlay, this.arrowGroup);

    this.controls = new OrbitControls(this.camera, canvas);
    Object.assign(this.controls, {
      enablePan: false,
      enableDamping: true,
      minDistance: 10,
      maxDistance: 24,
      minPolarAngle: 0.15,
      maxPolarAngle: 1.25,
    });
    this.resetCamera();

    this.resize = new ResizeObserver(() => this.fit());
    this.resize.observe(this);
    this.fit();

    this.syncPieces(false);
    this.syncOverlay();
    renderer.setAnimationLoop((t) => this.frame(t));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.renderer?.setAnimationLoop(null);
    this.resize?.disconnect();
    this.controls?.dispose();
    this.renderer?.dispose();
  }

  protected updated(changed: PropertyValues<this>): void {
    if (!this.renderer) return;
    if (changed.has('orientation')) this.resetCamera();
    if (changed.has('fen')) {
      this.input.clear();
      this.syncPieces(true);
    }
    this.syncOverlay();
  }

  private fit(): void {
    if (!this.renderer) return;
    const w = this.clientWidth || 400;
    this.renderer.setSize(w, w, false);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
  }

  private resetCamera(): void {
    const z = this.orientation === 'white' ? 1 : -1;
    this.camera.position.set(0, 14, 10.5 * z);
    this.camera.lookAt(0, 0, 0);
    this.controls?.target.set(0, 0, 0);
    this.controls?.update();
  }

  private buildBoard(): void {
    const light = new THREE.MeshStandardMaterial({ color: 0xc3cee2, roughness: 0.5 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x3f5a88, roughness: 0.45 });
    const geo = new THREE.BoxGeometry(1, 0.12, 1);
    for (let f = 0; f < 8; f++) {
      for (let r = 0; r < 8; r++) {
        const sq = FILES[f] + String(r + 1);
        const m = new THREE.Mesh(geo, (f + r) % 2 === 1 ? light : dark);
        const [x, z] = squareToXZ(sq);
        m.position.set(x, -0.06, z);
        m.receiveShadow = true;
        m.userData.square = sq;
        this.squares.push(m);
        this.scene.add(m);
      }
    }
    // Frame with coordinate letters drawn on a canvas texture.
    const c = document.createElement('canvas');
    c.width = c.height = 1024;
    const g = c.getContext('2d')!;
    const grad = g.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#2c3550');
    grad.addColorStop(1, '#161b2b');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1024, 1024);
    g.fillStyle = '#b9c6e4';
    g.font = 'bold 40px system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const cell = 1024 / 9;
    for (let i = 0; i < 8; i++) {
      const p = cell * (i + 1);
      g.fillText(FILES[i], p, 1024 - cell / 4);
      g.fillText(FILES[i], p, cell / 4);
      g.fillText(String(8 - i), cell / 4, p);
      g.fillText(String(8 - i), 1024 - cell / 4, p);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const frameMats = Array(6).fill(new THREE.MeshStandardMaterial({ color: 0x1b2133, roughness: 0.4, metalness: 0.2 }));
    frameMats[2] = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.1 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 9), frameMats);
    frame.position.y = -0.25;
    frame.receiveShadow = true;
    this.scene.add(frame);
  }

  private makePiece(p: TrackedPiece): THREE.Group {
    const group = new THREE.Group();
    for (const geo of pieceGeometries(p.type)) {
      const mesh = new THREE.Mesh(geo, this.materials[p.color]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    if (p.color === 'b') group.rotation.y = Math.PI;
    group.userData = { type: p.type, color: p.color };
    return group;
  }

  private syncPieces(animate: boolean): void {
    const next = track(this.pieces, this.fen);
    const now = performance.now();
    const keep = new Set(next.map((p) => p.id));
    const dur = animate && !reducedMotion() ? 320 : 0;

    for (const [id, mesh] of this.meshes) {
      if (keep.has(id)) continue;
      this.meshes.delete(id);
      this.anims.push({ mesh, from: mesh.position.clone(), to: mesh.position.clone().setY(-0.6), start: now, duration: dur || 1, remove: true });
    }
    for (const p of next) {
      const [x, z] = squareToXZ(p.square);
      const target = new THREE.Vector3(x, 0, z);
      let mesh = this.meshes.get(p.id);
      if (mesh && mesh.userData.type !== p.type) {
        this.scene.remove(mesh);
        mesh = undefined;
      }
      if (!mesh) {
        mesh = this.makePiece(p);
        mesh.position.copy(target);
        this.meshes.set(p.id, mesh);
        this.scene.add(mesh);
        if (dur) {
          mesh.scale.setScalar(0.01);
          this.anims.push({ mesh, from: target, to: target, start: now, duration: dur, grow: true });
        }
        continue;
      }
      if (!mesh.position.equals(target)) {
        if (dur) this.anims.push({ mesh, from: mesh.position.clone(), to: target, start: now, duration: dur });
        else mesh.position.copy(target);
      }
    }
    this.pieces = next;
  }

  private overlayTile(sq: string, color: number, opacity: number, inset = 0.04): THREE.Mesh {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1 - inset * 2, 1 - inset * 2),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
    );
    const [x, z] = squareToXZ(sq);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.005, z);
    m.userData.pulse = opacity;
    return m;
  }

  private syncOverlay(): void {
    for (const g of [this.overlay, this.arrowGroup]) {
      for (const child of [...g.children]) {
        g.remove(child);
        (child as THREE.Mesh).geometry?.dispose();
      }
    }
    const game = new Chess(this.fen);
    for (const sq of this.lastMove ?? []) this.overlay.add(this.overlayTile(sq, 0xffd34d, 0.35, 0));
    for (const sq of this.highlights) {
      const t = this.overlayTile(sq, 0x58e1ff, 0.55);
      t.userData.animate = true;
      this.overlay.add(t);
    }
    if (game.inCheck()) {
      const k = game.board().flat().find((p) => p && p.type === 'k' && p.color === game.turn());
      if (k) this.overlay.add(this.overlayTile(k.square, 0xff3b30, 0.6, 0));
    }
    if (this.input.selected) this.overlay.add(this.overlayTile(this.input.selected, 0x3ddc84, 0.55, 0));
    for (const sq of this.input.targets) {
      const dot = new THREE.Mesh(new THREE.CircleGeometry(game.get(sq as Square) ? 0.42 : 0.14, 32), new THREE.MeshBasicMaterial({ color: 0x1e5a3a, transparent: true, opacity: 0.55, depthWrite: false }));
      const [x, z] = squareToXZ(sq);
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(x, 0.008, z);
      this.overlay.add(dot);
    }
    for (const [from, to, color = 'green'] of this.arrows) this.arrowGroup.add(this.arrowMesh(from, to, ARROW_HEX[color]));
  }

  private arrowMesh(from: string, to: string, color: number): THREE.Mesh {
    const [x1, z1] = squareToXZ(from);
    const [x2, z2] = squareToXZ(to);
    const len = Math.hypot(x2 - x1, z2 - z1) - 0.25;
    const s = new THREE.Shape();
    const w = 0.07;
    const hw = 0.2;
    const hl = 0.32;
    s.moveTo(0, -w);
    s.lineTo(len - hl, -w);
    s.lineTo(len - hl, -hw);
    s.lineTo(len, 0);
    s.lineTo(len - hl, hw);
    s.lineTo(len - hl, w);
    s.lineTo(0, w);
    const m = new THREE.Mesh(
      new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false }),
    );
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = Math.atan2(-(z2 - z1), x2 - x1);
    m.position.set(x1, 0.02, z1);
    m.renderOrder = 10;
    return m;
  }

  private frame(t: number): void {
    const now = performance.now();
    this.anims = this.anims.filter((a) => {
      const k = Math.min(1, (now - a.start) / a.duration);
      const e = 1 - Math.pow(1 - k, 3);
      if (a.grow) a.mesh.scale.setScalar(0.01 + 0.99 * e);
      else {
        a.mesh.position.lerpVectors(a.from, a.to, e);
        if (!a.remove) a.mesh.position.y = Math.sin(Math.PI * k) * 0.45;
      }
      if (k >= 1) {
        if (a.remove) this.scene.remove(a.mesh);
        else a.mesh.position.copy(a.to);
        return false;
      }
      return true;
    });
    if (!reducedMotion()) {
      for (const c of this.overlay.children) {
        if (c.userData.animate) ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.35 + 0.25 * Math.sin(t / 350);
      }
    }
    this.controls?.update();
    this.renderer!.render(this.scene, this.camera);
  }

  private pick(e: PointerEvent): string | null {
    const rect = this.renderer!.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const pieceHit = ray.intersectObjects([...this.meshes.values()], true)[0];
    if (pieceHit) {
      let o: THREE.Object3D | null = pieceHit.object;
      while (o && !this.meshes.has(this.idOf(o))) o = o.parent;
      const id = o ? this.idOf(o) : -1;
      const p = this.pieces.find((x) => x.id === id);
      if (p) return p.square;
    }
    const sqHit = ray.intersectObjects(this.squares)[0];
    return sqHit ? (sqHit.object.userData.square as string) : null;
  }

  private idOf(o: THREE.Object3D): number {
    for (const [id, m] of this.meshes) if (m === o) return id;
    return -1;
  }

  private onDown(e: PointerEvent): void {
    this.down = { x: e.clientX, y: e.clientY };
  }

  private onUp(e: PointerEvent): void {
    if (!this.down || Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) > 6 || !this.interactive) return;
    this.down = null;
    const sq = this.pick(e);
    if (!sq) return;
    if (this.input.selected && this.input.targets.includes(sq)) {
      const m = this.input.attempt(this.input.selected, sq);
      this.input.clear();
      if (m) this.dispatchEvent(new CustomEvent<BoardMoveDetail>('board-move', { detail: m, bubbles: true, composed: true }));
    } else if (this.input.canPick(sq)) {
      this.input.pick(sq);
    } else {
      this.input.clear();
    }
    this.syncOverlay();
  }

  render() {
    return html`<canvas
      role="img"
      aria-label=${this.label}
      @pointerdown=${this.onDown}
      @pointerup=${this.onUp}
    ></canvas>`;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      touch-action: none;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 18px;
      cursor: grab;
    }
  `;
}

customElements.define('chess-board-3d', ChessBoard3D);
