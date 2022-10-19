import Axis from "axis-api"
import { Object3D } from "three"

import Player from "./Player"

export default class PlayerManager {
	constructor(options) {
    this.time = options.time

    this.container = new Object3D()
    this.players = []

    this.init()
	}

  init() {
    this.initEmulator()

    for (let i = 1; i <= 2; i++) {
      const player = new Player({
        id: i
      })
      this.players.push(player)
      this.container.add(player.container)
    }
  }

  initEmulator() {
    const gamepadEmulator = Axis.createGamepadEmulator(0)

    this.time.on('tick', () => {
      gamepadEmulator.update()
    })

    Axis.joystick1.setGamepadEmulatorJoystick(gamepadEmulator, 0)
    Axis.joystick2.setGamepadEmulatorJoystick(gamepadEmulator, 1)
  }
}