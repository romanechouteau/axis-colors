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
		this.firstJoystick = null

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
			player.joystickEvent.on('move', (position) => this.checkJoystick(player.id, position))
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

		Axis.registerGamepadEmulatorKeys(this.gamepadEmulator, 2, 'x', 1)
		Axis.registerGamepadEmulatorKeys(this.gamepadEmulator, 3, 's', 1)

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
		store.startTime = Date.now()
		document.getElementById('start').style.display = 'none'
	}

	toggleFusion(value) {
		if (!store.started) return

		const middle = (this.players[0].container.position.x + this.players[1].container.position.x) / 2
		if (!value) {
			store.isFusion = value
			this.s_defusion.play()
			for (let i = 0; i < 2; i++) {
				this.players[i].handleDefusion({ x: middle, z: 0 })
			}
			return
		}

		store.isFusion = value
		this.s_fusion.play()

		for (let i = 0; i < 2; i++) {
			this.players[i].handleFusion({ x: middle, z: 0 })
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
				this.toggleFusion(false)
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
				if (store.started) this.toggleFusion(!store.isFusion)
				else this.handleStart()
				break
		}
	}

	handleEndSynchro() {
		this.toggleFusion(false)
	}

	// JOYSTICK HANDLERS

	checkJoystickSameDirection(signsX, signsY) {
		const sameX = (signsX[0] === signsX[1]) || (signsX[0] === 0 && signsX[1] !== 0)
			|| (signsX[1] === 0 && signsX[0] !== 0)
		const sameY = (signsY[0] === signsY[1]) || (signsY[0] === 0 && signsY[1] !== 0)
			|| (signsY[1] === 0 && signsY[0] !== 0)

		return sameX && sameY
	}

	checkJoystick(id, position) {
		if (this.firstJoystick !== null) {
			const joystick = this.firstJoystick

			if (joystick.id === id) {
				this.handleFirstJoystick(id, position)
				return
			}

			const signJoyX = Math.sign(joystick.position.x)
			const signPosX = Math.sign(position.x)
			const signJoyY = Math.sign(joystick.position.y)
			const signPosY = Math.sign(position.y)

			if (
				!this.checkJoystickSameDirection([signJoyX, signPosX], [signJoyY, signPosY])
			) {
				this.toggleFusion(false)
			} else {
				this.handleSyncedJoystick(position, [signJoyX, signPosX], [signJoyY, signPosY])
			}
		} else {
			this.handleFirstJoystick(id, position)
		}
	}

	handleFirstJoystick(id, position) {
		this.firstJoystick = { id, position }
	}

	handleSyncedJoystick(position, signsX, signsY) {
		const x = Math.max(Math.abs(position.x), Math.abs(this.firstJoystick.position.x)) * signsX[0]
		const y = Math.max(Math.abs(position.y), Math.abs(this.firstJoystick.position.y)) * signsY[0]
		console.log('synchronizedd', x, y)

		for (let i = 0; i < 2; i++) {
			this.players[i].handleMove({ x, y })
		}

		this.firstJoystick = null
	}

	// RENDER

	render() {
		if (this.gamepadEmulator) {
			this.gamepadEmulator.update()
		}

		this.players.forEach((player) => player.render())
	}
}
