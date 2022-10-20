import { Vector3 } from "three"

import { store } from "../Tools/Store"
import LivesManager from "./LivesManager"

export default class DangerManager {
	constructor(options) {
    this.time = options.time
    this.camera = options.camera
    this.dangerPass = options.dangerPass
    this.totalWidth = options.totalWidth
    this.worldPosition = options.worldPosition
    this.playerManager = options.playerManager

    this.init()
  }

  init() {
    this.x = - this.totalWidth * 0.6
    this.pos = new Vector3()

    this.time.on('tick', this.render)
  }

  updatePosition() {
    const elapsed = store.startTime === null ? 0 : this.time.current - store.startTime
    const speed = 0.0005 + elapsed * 0.0000001

		this.x += this.time.delta * speed

    this.pos.set(this.worldPosition.x + this.x, 0, 0)
    const screenPos = this.pos.clone()
    screenPos.project(this.camera.camera)

    this.dangerPass.material.uniforms['uProgress'].value = Math.min(Math.max(screenPos.x * 0.5 + 0.5, 0), 1)
    this.dangerPass.material.uniforms['uProgress'].needsUpdate = true
  }

  checkLoose() {
    if (store.hasLost) return

    const playerX = Math.min(
      this.playerManager.players[0].container.position.x,
      this.playerManager.players[1].container.position.x
    )

    if (playerX - this.x <= 0) {
      LivesManager.loose()
    }
  }

  render = () => {
    if (!store.started && !store.hasLost) return
    this.updatePosition()
    this.checkLoose()
  }
}
