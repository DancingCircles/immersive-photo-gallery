'use client';
/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- This canvas surface implements keyboard navigation. */
import NextImage from 'next/image';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { DAILY_PERIOD, DAILY_SPHERE_CENTER_Y, dailyCardCopy, dailyCardPose, dailyRoomPalette, dailyWorks, wrapDailyHeight } from '@/lib/daily';
import { chairYawAfterDrag } from '@/lib/interaction';
import { getThemePalette, type ThemeMode } from '@/lib/theme';

export default function DailyScene({ theme }: { theme: ThemeMode }) {
  const host = useRef<HTMLDivElement>(null);
  const themeRef = useRef(theme);
  const updateTheme = useRef<((value: ThemeMode) => void) | null>(null);
  const [failed, setFailed] = useState(false);
  const [chairFailed, setChairFailed] = useState(false);
  useEffect(() => { themeRef.current = theme; updateTheme.current?.(theme); }, [theme]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    let alive = true;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch {
      queueMicrotask(() => { if (alive) setFailed(true); });
      return () => { alive = false; };
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 70);
    // The viewer stands inside the cylinder, looking slightly upward.
    camera.position.set(0, 1.6, 7.8);
    camera.lookAt(0, 5.4, -7);
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(environment);
    scene.environment = envMap.texture;
    environment.dispose();
    pmrem.dispose();
    const ambient = new THREE.HemisphereLight(0xffffff, 0x97938b, 2.4);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffffff, 4);
    keyLight.position.set(-4, 12, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    Object.assign(keyLight.shadow.camera, { left: -12, right: 12, top: 15, bottom: -10, far: 45 });
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);
    const initialRoom = dailyRoomPalette(themeRef.current);
    const wallMat = new THREE.MeshStandardMaterial({ color: initialRoom.background, roughness: 0.92, side: THREE.BackSide });
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(10.5, 10.5, 34, 96, 1, true), wallMat);
    wall.position.y = 16;
    wall.receiveShadow = true;
    scene.add(wall);
    const floorMat = new THREE.MeshStandardMaterial({ color: initialRoom.floor, roughness: 0.48, metalness: 0.12 });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(10.5, 96), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const chairMaterial = new THREE.MeshStandardMaterial({ color: '#eeeeeb', metalness: 0.82, roughness: 0.24 });
    const textures: THREE.Texture[] = [];
    const cards: { group: THREE.Group; face: THREE.Mesh; row: number; column: number; material: THREE.MeshBasicMaterial; repaint: (activeTheme: ThemeMode, hovered: boolean) => void }[] = [];
    const period = DAILY_PERIOD;
    dailyWorks.forEach((work, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 640; canvas.height = 740;
      const ctx = canvas.getContext('2d')!;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      textures.push(texture);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const copy = dailyCardCopy(work, index, dailyWorks.length);
      let loadedImage: HTMLImageElement | null = null;
      const paint = (activeTheme: ThemeMode, hovered: boolean) => {
        const palette = getThemePalette(activeTheme);
        ctx.fillStyle = palette.surface;
        ctx.fillRect(0, 0, 640, 740);
        if (hovered && loadedImage) {
          const scale = Math.max(640 / loadedImage.width, 740 / loadedImage.height) * 1.2;
          const width = loadedImage.width * scale;
          const height = loadedImage.height * scale;
          ctx.save();
          ctx.globalAlpha = 0.56;
          ctx.filter = 'blur(24px) saturate(1.35)';
          ctx.drawImage(loadedImage, 320 - width / 2, 370 - height / 2, width, height);
          ctx.restore();
          ctx.fillStyle = palette.hoverOverlay;
          ctx.fillRect(0, 0, 640, 740);
        }
        ctx.fillStyle = palette.text;
        ctx.font = '700 24px Arial';
        ctx.fillText(copy.photographer, 24, 42);
        ctx.font = '700 19px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(copy.title, 616, 42);
        ctx.textAlign = 'left';
        ctx.fillStyle = palette.mediaSurface;
        ctx.fillRect(90, 118, 460, 480);
        if (loadedImage) {
          const scale = Math.min(460 / loadedImage.width, 480 / loadedImage.height);
          const width = loadedImage.width * scale;
          const height = loadedImage.height * scale;
          ctx.drawImage(loadedImage, 320 - width / 2, 358 - height / 2, width, height);
        }
        ctx.fillStyle = palette.pill;
        ctx.beginPath();
        ctx.roundRect(24, 680, 195, 30, 15);
        ctx.fill();
        ctx.fillStyle = palette.pillText;
        ctx.font = '700 18px monospace';
        ctx.fillText(copy.category, 37, 700);
        ctx.textAlign = 'right';
        ctx.fillText(`${copy.year}  ·  ${copy.index}`, 612, 700);
        ctx.textAlign = 'left';
        texture.needsUpdate = true;
      };
      paint(themeRef.current, false);
      const image = new Image();
      image.onload = () => { if (alive) { loadedImage = image; paint(themeRef.current, false); } };
      image.src = work.image;
      const group = new THREE.Group();
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const face = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.7), material);
      group.add(face);
      // Four columns and three rows share one angular step on the inner sphere.
      const row = Math.floor(index / 4);
      const column = index % 4;
      scene.add(group);
      cards.push({ group, face, material, row, column, repaint: paint });
    });
    const chairRoot = new THREE.Group();
    const chairMeshes: THREE.Mesh[] = [];
    chairRoot.position.set(0.3, 0.025, -3.6);
    scene.add(chairRoot);
    new GLTFLoader().load('/models/bertoia.glb', (gltf) => {
      const disposeImported = () => gltf.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => m.dispose());
        }
      });
      if (!alive) { disposeImported(); return; }
      const originalMaterials = new Set<THREE.Material>();
      gltf.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => originalMaterials.add(m));
          object.material = chairMaterial;
          object.castShadow = true;
          object.receiveShadow = true;
          chairMeshes.push(object);
        }
      });
      originalMaterials.forEach((m) => m.dispose());
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = 1.7 / size.y;
      gltf.scene.scale.multiplyScalar(scale);
      gltf.scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
      chairRoot.add(gltf.scene);
      const hitArea = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.9, 1.6),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      hitArea.position.y = 0.95;
      chairRoot.add(hitArea);
      chairMeshes.push(hitArea);
      chairRoot.rotation.y = -0.42;
    }, undefined, () => { if (alive) setChairFailed(true); });
    const apply = (value: ThemeMode) => {
      const dark = value === 'dark';
      const room = dailyRoomPalette(value);
      scene.background = new THREE.Color(room.background);
      scene.fog = new THREE.Fog(room.background, 24, 48);
      wallMat.color.set(room.background);
      floorMat.color.set(room.floor);
      ambient.intensity = dark ? 0.7 : 2.4;
      keyLight.intensity = dark ? 2.8 : 4;
      cards.forEach((card) => card.repaint(value, false));
    };
    updateTheme.current = apply;
    apply(themeRef.current);
    const resize = () => {
      renderer.setSize(element.clientWidth, element.clientHeight);
      camera.aspect = element.clientWidth / Math.max(1, element.clientHeight);
      camera.fov = camera.aspect < 0.8 ? 70 : 45;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element); resize();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let down = false, rotatingChair = false, lastX = 0, lastY = 0, offset = 0, velocity = 0, lastMove = 0;
    let raf = 0, previous = performance.now(), inside = false;
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const updatePointer = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
      inside = event.pointerType !== 'touch';
    };
    const pointerMove = (event: PointerEvent) => {
      updatePointer(event);
      if (!down) return;
      if (rotatingChair) {
        chairRoot.rotation.y = chairYawAfterDrag(chairRoot.rotation.y, event.clientX - lastX);
        lastX = event.clientX;
        lastY = event.clientY;
        return;
      }
      const now = performance.now();
      const movement = -(event.clientY - lastY) * 0.018;
      offset = wrapDailyHeight(offset + movement, period);
      velocity = movement / Math.max(0.008, (now - lastMove) / 1000);
      lastY = event.clientY; lastMove = now;
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      updatePointer(event);
      scene.updateMatrixWorld(); camera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, camera);
      rotatingChair = chairMeshes.length > 0 && raycaster.intersectObjects(chairMeshes, false).length > 0;
      down = true; lastX = event.clientX; lastY = event.clientY; lastMove = performance.now(); velocity = 0;
      element.focus({ preventScroll: true });
      element.setPointerCapture(event.pointerId);
      element.classList.add('dragging');
    };
    const pointerUp = () => { down = false; rotatingChair = false; if (reduced) velocity = 0; element.classList.remove('dragging'); };
    const pointerLeave = () => { inside = false; };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1;
      const movement = -event.deltaY * unit * 0.008;
      offset = wrapDailyHeight(offset + movement, period);
      velocity = reduced ? 0 : movement * 12;
    };
    const key = (event: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
      event.preventDefault(); velocity = 0;
      offset = event.key === 'Home' ? 0 : wrapDailyHeight(offset + (event.key === 'ArrowUp' ? 0.6 : -0.6), period);
    };
    element.addEventListener('pointerdown', pointerDown);
    element.addEventListener('pointermove', pointerMove);
    element.addEventListener('pointerup', pointerUp);
    element.addEventListener('pointercancel', pointerUp);
    element.addEventListener('lostpointercapture', pointerUp);
    element.addEventListener('pointerleave', pointerLeave);
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('keydown', key);
    const lost = (event: Event) => { event.preventDefault(); setFailed(true); cancelAnimationFrame(raf); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - previous) / 1000); previous = now;
      if (!down && !reduced) {
        offset = wrapDailyHeight(offset + velocity * dt, period);
        velocity *= Math.exp(-5 * dt);
      }
      cards.forEach(({ group, material, row, column }) => {
        const pose = dailyCardPose(row, column, offset);
        group.position.set(pose.x, pose.y, pose.z);
        group.lookAt(0, DAILY_SPHERE_CENTER_Y, 0);
        material.opacity = 1 - THREE.MathUtils.smoothstep(Math.abs(pose.phi), 0.75, 0.87);
        group.visible = material.opacity > 0.01;
      });
      scene.updateMatrixWorld(); camera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, camera);
      const hovered = inside && !down ? raycaster.intersectObjects(cards.filter(c => c.group.visible).map(c => c.face))[0]?.object : undefined;
      cards.forEach(({ group, face, repaint }) => {
        const target = face === hovered ? 1.025 : 1;
        const wasHovered = group.userData.hovered === true;
        const isHovered = face === hovered;
        if (wasHovered !== isHovered) {
          group.userData.hovered = isHovered;
          repaint(themeRef.current, isHovered);
        }
        group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, target, reduced ? 1 : 1 - Math.exp(-9 * dt)));
      });
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false; cancelAnimationFrame(raf); observer.disconnect(); updateTheme.current = null;
      element.removeEventListener('pointerdown', pointerDown);
      element.removeEventListener('pointermove', pointerMove);
      element.removeEventListener('pointerup', pointerUp);
      element.removeEventListener('pointercancel', pointerUp);
      element.removeEventListener('lostpointercapture', pointerUp);
      element.removeEventListener('pointerleave', pointerLeave);
      element.removeEventListener('wheel', wheel);
      element.removeEventListener('keydown', key);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => { if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
      } });
      materials.add(chairMaterial);
      materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      envMap.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);
  return <>
    <div className="scene daily-scene" ref={host} tabIndex={0} aria-label="每日推荐球幕展厅，上下拖拽或使用方向键循环浏览" />
    {failed && <div className="daily-fallback">{dailyWorks.map(work => <figure key={work.id}>
      <NextImage src={work.image} alt={work.title} width={580} height={550} unoptimized /><figcaption>{work.photographer} · {work.title}</figcaption>
    </figure>)}</div>}
    {chairFailed && <output className="chair-load-note">椅子模型加载失败，请刷新重试。</output>}
    <a className="model-credit" href="/models/ATTRIBUTION.txt" target="_blank" rel="noreferrer">Chair · DELTAHEDRA · CC BY 4.0 ↗</a>
  </>;
}
