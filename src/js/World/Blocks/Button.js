import gsap from 'gsap'
import { Object3D, Audio } from 'three'

import { store } from '../../Tools/Store'
import { SPHERE_RAY } from '../Player'
import { BLOCK_DEPTH, BLOCK_HEIGHT } from './Block'

export default class Button {
	constructor(options) {
		this.time = options.time
		this.block = options.block
		this.assets = options.assets
		this.isLeft = options.isLeft
		this.listener = options.listener
		this.isCenter = options.isCenter
		this.material = options.material
		this.dangerManager = options.dangerManager

		this.geometries = []

		this.container = new Object3D()

		this.activated = false

		this.init()
	}

	init() {
		this.initModel()
		this.initSounds()

		this.time.on('tick', this.render)
	}

	initModel() {
		// MODEL

		const button = this.assets.models.button.scene.children[0].clone()
		const buttonOutside = button.children[0]
		const buttonInside = button.children[1]
		const geometries = [buttonOutside.geometry, buttonInside.geometry]
		buttonOutside.material = this.material

		this.geometries.push(...geometries)

		this.container.add(button)
		this.container.position.y = 1

		this.container.position.z = this.isCenter
			? 0
			: this.isLeft
			? -BLOCK_DEPTH * 0.25
			: BLOCK_DEPTH * 0.25

		const x = this.block.container.position.x + this.container.position.x
		const z = this.block.container.position.z + this.container.position.z

		this.buttonLeft = x - this.block.width * 0.2
		this.buttonRight = x + this.block.width * 0.2
		this.buttonFar = z - BLOCK_DEPTH * 0.33
		this.buttonNear = z + BLOCK_DEPTH * 0.33
	}

	initSounds() {
		this.s_button = new Audio(this.listener)
		this.s_button.setBuffer(this.assets.sounds.button)
		this.s_button.setVolume(0.4)
	}

	handlePlayerOn(player) {
		const insideX =
			player.container.position.x + SPHERE_RAY >= this.buttonLeft &&
			player.container.position.x - SPHERE_RAY <= this.buttonRight

		const insideY =
			player.container.position.y - SPHERE_RAY >= BLOCK_HEIGHT * 0.5 &&
			player.container.position.y - SPHERE_RAY <= BLOCK_HEIGHT * 0.5 + 0.5

		const insideZ =
			player.container.position.z - SPHERE_RAY >= this.buttonFar &&
			player.container.position.z + SPHERE_RAY <= this.buttonNear

		if (!insideX || !insideZ || !insideY) {
			return
		}

		this.activated = true
		this.activateButton()
	}

	activateButton() {
		const pos = this.container.position
		gsap.to(this.container.position, {
			y: pos.y - 0.04,
			duration: 0.3,
			ease: 'power1.easeOut',
		})
		this.dangerManager.slowDown()
		this.s_button.play()
	}

	render = () => {
		if (this.activated === true || !store.isFusion) return
		this.handlePlayerOn(this.block.playerManager.players[0])
	}
}
