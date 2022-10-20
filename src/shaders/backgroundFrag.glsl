uniform sampler2D baseTexture;
uniform float uOffset;

varying vec2 vUv;

void main() {
  vec2 coords = vec2(vUv.x + uOffset, vUv.y);
  vec4 baseColor = texture2D(baseTexture, coords);
  gl_FragColor = baseColor;
}