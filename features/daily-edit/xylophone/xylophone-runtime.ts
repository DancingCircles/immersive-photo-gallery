import { EffectPass, RenderPass, SMAAEffect, SMAAPreset, SSAOEffect } from 'postprocessing';
import {
  DoubleSide,
  NoToneMapping,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import glassNormalFrag from './reference/shaders/xylophone/glassNormalFrag.glsl?raw';
import xylophoneVert from './reference/shaders/xylophone/xylophoneVert.glsl?raw';
import { FBOHelper } from './reference/js/common/FBOHelper';
import { FluidSim } from './reference/js/components/FluidSim';
import { Xylophone } from './reference/js/components/xylophone/Xylophone';
import { XylophoneBg } from './reference/js/components/XylophoneBg';
import { FLUID, FROST, QUALITY, SSAO } from './reference/js/configs/XylophoneConfig';
import { FrostBackdropPass } from './reference/js/passes/FrostBackdropPass';
import { GlassBufferPass } from './reference/js/passes/GlassBufferPass';
import { Input } from './reference/js/utils/input';
import { Properties } from './reference/js/utils/properties';
import { RAFCollection } from './reference/js/utils/RAFCollection';

const MAX_DELTA = 1 / 20;

/** React lifecycle adapter around the unmodified xylophone rendering modules. */
export class XylophoneRuntime {
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly xylophone = new Xylophone();
  private readonly xylophoneBg = new XylophoneBg();
  private readonly fluid: FluidSim;
  private readonly frostBackdropPass: FrostBackdropPass;
  private readonly renderPass: RenderPass;
  private readonly glassBufferPass: GlassBufferPass;
  private readonly glassNormalMaterial: ShaderMaterial;
  private readonly ssaoPass: EffectPass;
  private readonly aaPass: EffectPass;
  private readonly renderer: WebGLRenderer;
  private size = { width: 0, height: 0 };
  private dateTime = performance.now();
  private contextLost = false;
  private frame = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    Properties.viewportWidth = canvas.clientWidth || window.innerWidth;
    Properties.viewportHeight = canvas.clientHeight || window.innerHeight;

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NoToneMapping;
    this.renderer.setPixelRatio(Properties.dpr);
    Properties.gl = this.renderer;
    Properties.composer.setRenderer(this.renderer);

    this.camera = new PerspectiveCamera(
      45,
      Properties.viewportWidth / Properties.viewportHeight,
      0.1,
      200,
    );
    this.camera.position.set(0, 0, 5);
    Input.init();
    FBOHelper.init();

    this.scene.add(this.xylophone.group);
    this.scene.add(this.xylophoneBg.build());
    this.fluid = new FluidSim(FLUID);
    this.xylophone.setFluid(this.fluid.uniforms.velocity);
    this.xylophone.setMuted(true);

    this.frostBackdropPass = new FrostBackdropPass(this.scene, this.camera);
    this.frostBackdropPass.blurRadius = FROST.strength * FROST.maxBlurPx;
    this.xylophone.uniforms.u_tBackdrop.value = this.frostBackdropPass.blurredTexture;
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.glassNormalMaterial = new ShaderMaterial({
      vertexShader: xylophoneVert,
      fragmentShader: glassNormalFrag,
      side: DoubleSide,
      uniforms: {
        u_time: this.xylophone.uniforms.u_time,
        u_spinSpeed: this.xylophone.uniforms.u_spinSpeed,
        u_swingScale: this.xylophone.uniforms.u_swingScale,
        u_swingAxis: this.xylophone.uniforms.u_swingAxis,
      },
    });
    this.glassBufferPass = new GlassBufferPass(
      this.scene,
      this.camera,
      this.glassNormalMaterial,
      QUALITY.glassBufferScale,
    );
    this.ssaoPass = new EffectPass(
      this.camera,
      new SSAOEffect(this.camera, this.glassBufferPass.glassTexture, SSAO),
    );
    this.aaPass = new EffectPass(
      this.camera,
      new SMAAEffect({
        preset: QUALITY.isMobile ? SMAAPreset.MEDIUM : SMAAPreset.ULTRA,
      }),
    );
    for (const pass of [
      this.frostBackdropPass,
      this.renderPass,
      this.glassBufferPass,
      this.ssaoPass,
      this.aaPass,
    ]) {
      Properties.composer.addPass(pass);
    }

    this.canvas.addEventListener('webglcontextlost', this.onContextLost);
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestored);
    window.addEventListener('resize', this.resize);
    this.resize();
    void this.xylophone.load();
    this.update();
  }

  setSoundEnabled(enabled: boolean) {
    this.xylophone.setMuted(!enabled);
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
    Input.destroy();
    for (const pass of [
      this.frostBackdropPass,
      this.renderPass,
      this.glassBufferPass,
      this.ssaoPass,
      this.aaPass,
    ]) {
      Properties.composer.removePass(pass);
      pass.dispose();
    }
    this.glassNormalMaterial.dispose();
    this.fluid.dispose();
    this.xylophone.dispose();
    this.xylophoneBg.dispose();
    Properties.composer.dispose();
    this.renderer.dispose();
  }

  private resize = () => {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    if (this.size.width === width && this.size.height === height) return;
    this.size = { width, height };
    Properties.viewportWidth = width;
    Properties.viewportHeight = height;
    Properties.globalUniforms.u_resolution.value.set(
      width * Properties.dpr,
      height * Properties.dpr,
    );
    this.renderer.setSize(width, height, false);
    Properties.composer.setSize(width, height);
    Input.resize();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  private update = () => {
    this.frame = requestAnimationFrame(this.update);
    if (this.contextLost) return;
    const now = performance.now();
    const delta = Math.min((now - this.dateTime) / 1000, MAX_DELTA);
    this.dateTime = now;
    Properties.deltaTime = delta;
    Properties.time += delta;
    Properties.globalUniforms.u_deltaTime.value = delta;
    Properties.globalUniforms.u_time.value = Properties.time;
    RAFCollection.forEach((callback) => callback(delta));
    this.xylophone.update(delta, this.camera);
    Properties.composer.render(delta);
    Input.postUpdate();
  };

  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.contextLost = true;
  };

  private onContextRestored = () => {
    this.contextLost = false;
  };
}
