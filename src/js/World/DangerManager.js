import { Vector3, Audio } from 'three'

import LivesManager from './LivesManager'
import { store } from '../Tools/Store'

export default class DangerManager {
	constructor(options) {
		this.assets = options.assets
		this.time = options.time
		this.camera = options.camera
		this.dangerPass = options.dangerPass
		this.totalWidth = options.totalWidth
		this.worldPosition = options.worldPosition
		this.playerManager = options.playerManager
		this.listener = options.listener

		this.offset = 0

		this.init()
	}

	init() {
		this.x = -this.totalWidth * 0.6
		this.pos = new Vector3()

		this.initSounds()

		this.time.on('tick', this.render)
	}

	initSounds() {
		this.s_end = new Audio(this.listener)
		this.s_end.setBuffer(this.assets.sounds.end)
		this.s_end.setVolume(0.4)
	}

	updatePosition() {
		const elapsed =
			store.startTime === null
				? 0
				: this.time.current - store.startTime + this.offset
		const speed = 0.0005 + Math.max(elapsed, 0) * 0.0000001

		this.x += this.time.delta * speed

		this.pos.set(this.worldPosition.x + this.x, 0, 0)
		const screenPos = this.pos.clone()
		screenPos.project(this.camera.camera)

		this.dangerPass.material.uniforms['uProgress'].value = Math.min(
			Math.max(screenPos.x * 0.5 + 0.5, 0),
			1
		)
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
			this.s_end.play()
		}
	}

	slowDown() {
		this.offset -= 8000
	}

	render = () => {
		if (!store.started && !store.hasLost) return
		this.updatePosition()
		this.checkLoose()
	}
}
