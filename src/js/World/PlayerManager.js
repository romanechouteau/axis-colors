import Axis from 'axis-api'
import { Object3D, Audio } from 'three'

import { store } from '../Tools/Store'

import Player from './Player'

export default class PlayerManager {
	constructor(options) {
		this.time = options.time
		this.assets = options.assets
		this.physicsWorld = options.physicsWorld
		this.listener = options.listener

		this.container = new Object3D()
		this.players = []
		this.actions = []

		this.init()
	}

	init() {
		this.initEmulator()

		for (let i = 1; i <= 2; i++) {
			const player = new Player({
				id: i,
				time: this.time,
				assets: this.assets,
				listener: this.listener,
				physicsWorld: this.physicsWorld,
			})
			this.players.push(player)
			this.container.add(player.container)

			player.keyEvent.on('keydown', (key) => this.checkSynchro(player.id, key))
		}

		this.initSounds()

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

	initSounds() {
		this.s_fusion = new Audio(this.listener)
		this.s_fusion.setBuffer(this.assets.sounds.fusion)
		this.s_fusion.setVolume(0.4)

		this.s_defusion = new Audio(this.listener)
		this.s_defusion.setBuffer(this.assets.sounds.defusion)
		this.s_defusion.setVolume(0.4)
	}

	// HANDLERS

	handleStart() {
		store.started = true
		document.getElementById('start').style.display = 'none'
	}

	toggleFusion() {
		if (store.isFusion) {
			store.isFusion = false
			this.s_defusion.play()
			return
		}
		store.isFusion = true
		this.s_fusion.play()

		for (let i = 0; i < 2; i++) {
			this.players[i].handleFusion()
		}
	}

	handleJump() {
		for (let i = 0; i < 2; i++) {
			this.players[i].handleJump()
		}
	}

	checkSynchro(id, key) {
		if (this.actions.length > 0) {
			const action = this.actions[0]

			if (action.id === id) {
				this.handleFirstAction(id, key)
			} else if (action.key !== key) {
				this.toggleFusion()
			} else {
				this.handleSyncedAction(key)
			}
		} else {
			this.handleFirstAction(id, key)
		}
	}

	handleFirstAction(id, key) {
		if (this.timeout) clearTimeout(this.timeout)
		this.actions = [{ id, key }]
		this.timeout = setTimeout(this.handleEndSynchro.bind(this), 1000)
	}

	handleSyncedAction(key) {
		if (this.timeout) clearTimeout(this.timeout)
		this.actions = []

		switch (key) {
			case 'a':
				this.handleJump()
				break
			case 'w':
				if (store.started) this.toggleFusion()
				else this.handleStart()
				break;
		}
	}

	handleEndSynchro() {
		this.toggleFusion()
	}

	// RENDER

	render() {
		if (this.gamepadEmulator) {
			this.gamepadEmulator.update()
		}

		this.players.forEach((player) => player.render(this.time.delta))
	}
}
