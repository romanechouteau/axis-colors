import { Mesh, Object3D, PlaneGeometry, RepeatWrapping, ShaderMaterial } from "three"

import vert from "../../shaders/backgroundVert.glsl"
import frag from "../../shaders/backgroundFrag.glsl"

const Z = -4

export default class Background {
  constructor(options) {
    this.time = options.time
    this.assets = options.assets
    this.camera = options.camera
    this.totalWidth = options.totalWidth
    this.worldPosition = options.worldPosition

    this.container = new Object3D()
    this.background = new Object3D()

    this.init()
  }

  init() {
    const distance = this.camera.camera.position.z - Z
		const vFov = (this.camera.camera.fov * Math.PI) / 180

    const texture = this.assets.textures['background']
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    const texRatio = texture.image.width / texture.image.height

		const height = 2 * Math.tan(vFov / 2) * distance * 1.2
		this.width = height * texRatio

    const geometry = new PlaneGeometry(this.width, height, 48, 48)
		this.material = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        baseTexture: {
          value: this.assets.textures['background']
        },
        uOffset: {
          value: 0
        }
      }
    })
		const plane = new Mesh(geometry, this.material)

    this.container.position.y = - height * 0.1
    this.container.position.z = Z
    this.container.lookAt(this.camera.camera.position)
		this.container.add(plane)

    this.time.on('tick', this.render)
  }

  render = () => {
    this.container.position.x = -this.worldPosition.x
    this.material.uniforms['uOffset'].value = - this.worldPosition.x / this.width
    this.material.uniforms['uOffset'].needsUpdate = true
  }
}