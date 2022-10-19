import Axis from "axis-api"
import { Mesh, MeshNormalMaterial, Object3D, SphereGeometry, Vector3 } from "three"

import { BLOCK_DEPTH, BLOCK_HEIGHT } from "./Block"

const SPHERE_RAY = 0.3

export default class Player {
	constructor(options) {
    this.id = options.id

    this.container = new Object3D()
    this.position = new Vector3(0, 0, 0)
    this.speed = 0.08

    this.init()
	}

  // INITIALIZERS

  init() {
    this.initControls()
    this.initModel()
    this.initPosition()
  }

  initControls() {
    this.player = Axis.createPlayer({
      id: this.id,
      joysticks: this.id === 1 ? Axis.joystick1 : Axis.joystick2,
      buttons: Axis.buttonManager.getButtonsById(this.id),
    })

    this.player.addEventListener("joystick:move", this.handleMove);
  }

  initModel() {
    const geometry = new SphereGeometry(SPHERE_RAY, 32, 16)
		const material = new MeshNormalMaterial({})
		const sphere = new Mesh(geometry, material)

    this.container.add(sphere)
  }

  initPosition() {
    const z = BLOCK_DEPTH * 0.25
    this.position.set(
      0,
      BLOCK_HEIGHT * 0.5 + SPHERE_RAY,
      this.id === 1 ? z : - z
    )
    this.container.position.copy(this.position)
  }

  // EVENT HANDLERS

  handleMove = (e) => {
    const position = e.position

    if (position.x === 0 && position.y === 0) return

    this.position.x += position.x * this.speed
    this.position.z += position.y * this.speed * -1
  }

  // RENDER

  render() {
    this.container.position.lerp(this.position, 0.3)
  }
}