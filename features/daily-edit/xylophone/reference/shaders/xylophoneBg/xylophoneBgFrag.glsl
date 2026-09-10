uniform vec3 u_color;
uniform float u_debugPattern;

varying vec2 v_uv;

void main() {
  vec3 color = vec3(1.0);

  /* ----------------------------------- dev ---------------------------------- */
  // checkerboard — makes the frosted transmission obvious while tuning
  if (u_debugPattern > 0.5) {
    vec2 c = step(0.5, fract(v_uv * 10.0));
    color = vec3(abs(c.x - c.y));
  }

  /* ---------------------------------- main ---------------------------------- */
  gl_FragColor = vec4(color, 1.0);
}
