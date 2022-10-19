import Axis from 'axis-api'
import { Object3D } from 'three'

import Player from './Player'

export default class PlayerManager {
	constructor(options) {
		this.time = options.time
		this.physicsWorld = options.physicsWorld

		this.container = new Object3D()
		this.players = []

		this.init()
	}

	init() {
		this.initEmulator()

		for (let i = 1; i <= 2; i++) {
			const player = new Player({
				id: i,
				physicsWorld: this.physicsWorld,
			})
			this.players.push(player)
			this.container.add(player.container)
		}

		this.time.on('tick', () => {
			this.render()
		})
	}

	initEmulator() {
		this.gamepadEmulator = Axis.createGamepadEmulator(0)

		Axis.joystick1.setGamepadEmulatorJoystick(this.gamepadEmulator, 0)
		Axis.joystick2.setGamepadEmulatorJoystick(this.gamepadEmulator, 1)

		Axis.registerGamepadEmulatorKeys(this.gamepadEmulator, 4, 'a', 1)
		Axis.registerGamepadEmulatorKeys(this.gamepadEmulator, 5, 'a', 2)
		Axis.registerGamepadEmulatorKeys(this.gamepadEmulator, 6, 'w', 1)
		Axis.registerGamepadEmulatorKeys(this.gamepadEmulator, 7, 'w', 2)
	}

	// RENDER

	render() {
		if (this.gamepadEmulator) {
			this.gamepadEmulator.update()
		}

		this.players.forEach((player) => player.render())
	}
}
