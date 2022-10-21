uniform sampler2D baseTexture;
uniform float uProgress;

varying vec2 vUv;

vec3 greyscale(vec3 color) {
  float g = dot(color, vec3(0.299, 0.587, 0.114));
  return vec3(g);
}

void main() {
  vec4 baseColor = texture2D(baseTexture, vUv);

  vec4 greyColor = vec4(greyscale(baseColor.rgb), baseColor.a);

  float stepProgress = smoothstep(uProgress - 0.05, uProgress + 0.05, vUv.x);
  vec4 color = mix(greyColor, baseColor, stepProgress);

  gl_FragColor = color;
}