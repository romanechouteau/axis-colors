import {
	ActiveCollisionTypes,
	ActiveEvents,
	ColliderDesc,
	RigidBodyDesc,
} from '@dimforge/rapier3d-compat'
import Axis from 'axis-api'
import { Object3D, Audio } from 'three'

import { store } from '../Tools/Store'
import { BLOCK_HEIGHT } from './Blocks/Block'

import Player, { SPHERE_RAY } from './Player'

export default class PlayerManager {
	constructor(options) {
		this.time = options.time
		this.assets = options.assets
		this.physicsWorld = options.physicsWorld
		this.listener = options.listener
		this.hdr = options.hdr

		this.container = new Object3D()
		this.players = []
		this.actions = []
		this.firstJoystick = null

		this.init()
	}

	init() {
		this.initEmulator()
		this.initPhysics()
		this.initPlayers()
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

	initPlayers() {
		for (let i = 1; i <= 2; i++) {
			const player = new Player({
				id: i,
				time: this.time,
				assets: this.assets,
				listener: this.listener,
				fusionBody: this.fusionBody,
				physicsWorld: this.physicsWorld,
				hdr: this.hdr,
			})
			this.players.push(player)
			this.container.add(player.container)

			player.keyEvent.on('keydown', (key) =>
				this.checkSynchro(player.id, key)
			)
			player.joystickEvent.on('move', (position) =>
				this.checkJoystick(player.id, position)
			)
		}

		this.players[0].fusionEvent.on('fusion', this.handleFusion)
		this.players[0].fusionEvent.on('defusion', this.handleDefusion)
	}

	initPhysics() {
		const rigidBody = RigidBodyDesc.dynamic()
			.setLinvel(0, 0, 0)
			.lockRotations()
		this.fusionBody = this.physicsWorld.createRigidBody(rigidBody)

		const collider = ColliderDesc.capsule(SPHERE_RAY * 2, SPHERE_RAY)
			.setDensity(1)
			.setActiveEvents(ActiveEvents.COLLISION_EVENTS)
			.setActiveCollisionTypes(
				ActiveCollisionTypes.DEFAULT |
					ActiveCollisionTypes.KINEMATIC_FIXED
			)

		this.physicsWorld.createCollider(collider, this.fusionBody)
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
		document.getElementById('start').classList.add('is-hidden')
		setTimeout(() => {
			document.getElementById('colors').classList.add('is-hidden')
		}, 3000)
		setTimeout(() => {
			document.getElementById('start').style.display = 'none'
		}, 10000)
	}

	toggleFusion(value) {
		if (
			!store.started ||
			store.isFusion === value ||
			this.players[0].inTunnel ||
			this.players[1].inTunnel
		)
			return

		if (!value) {
			store.isFusion = value
			this.s_defusion.play()
			for (let i = 0; i < 2; i++) {
				this.players[i].handleDefusion()
			}
			return
		}

		if (value && !store.messageFusion) {
			document.getElementById('sync').classList.remove('is-hidden')
			setTimeout(() => {
				document.getElementById('sync').classList.add('is-hidden')
			}, 3000)
			store.messageFusion = true
		}

		store.isFusion = value
		this.s_fusion.play()

		for (let i = 0; i < 2; i++) {
			this.players[i].handleFusion()
		}
	}

	handleFusion = () => {
		const middle =
			(this.players[0].container.position.x +
				this.players[1].container.position.x) /
			2
		this.fusionBody.setTranslation({
			x: middle,
			y: BLOCK_HEIGHT * 0.5 + SPHERE_RAY * 2.5,
			z: 0,
		})
		this.fusionBody.wakeUp()
	}

	handleDefusion = () => {
		this.fusionBody.setTranslation({
			x: 0,
			y: 0,
			z: -10,
		})
		this.fusionBody.sleep()
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

	checkJoystickSameDirection(position) {
		const sameX = Math.abs(position.x - this.firstJoystick.position.x) <= 1
		const sameY = Math.abs(position.y - this.firstJoystick.position.y) <= 1
		return sameX && sameY
	}

	checkJoystick(id, position) {
		if (this.firstJoystick !== null) {
			const joystick = this.firstJoystick

			if (joystick.id === id) {
				this.handleFirstJoystick(id, position)
				return
			}

			if (!this.checkJoystickSameDirection(position)) {
				this.toggleFusion(false)
			} else {
				this.handleSyncedJoystick(position)
			}
		} else {
			this.handleFirstJoystick(id, position)
		}
	}

	handleFirstJoystick(id, position) {
		this.firstJoystick = { id, position }
	}

	handleSyncedJoystick(position) {
		const x =
			Math.abs(position.x) >= Math.abs(this.firstJoystick.position.x)
				? position.x
				: this.firstJoystick.position.x
		const y =
			Math.abs(position.y) >= Math.abs(this.firstJoystick.position.y)
				? position.y
				: this.firstJoystick.position.y

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
