import Axis from 'axis-api'
import {
	Object3D,
	Vector2,
	Audio,
	AnimationClip,
	AnimationMixer,
	MeshStandardMaterial,
} from 'three'
import {
	ColliderDesc,
	RigidBodyDesc,
	ActiveEvents,
	ActiveCollisionTypes,
} from '@dimforge/rapier3d-compat'

import Emitter from '../Tools/EventEmitter'
import LivesManager from './LivesManager'
import { BLOCK_DEPTH, BLOCK_HEIGHT } from './Blocks/Block'
import { store } from '../Tools/Store'

export const SPHERE_RAY = 0.3

export default class Player {
	constructor(options) {
		this.id = options.id
		this.time = options.time
		this.assets = options.assets
		this.listener = options.listener
		this.physicsWorld = options.physicsWorld

		this.container = new Object3D()
		this.velocity = new Vector2()
		this.speed = 3

		this.keyEvent = new Emitter()

		this.init()
	}

	// INITIALIZERS

	init() {
		this.initControls()
		this.initModel()
		this.initPosition()
		this.initPhysics()

		this.initSounds()
	}

	initControls() {
		this.player = Axis.createPlayer({
			id: this.id,
			joysticks: this.id === 1 ? Axis.joystick1 : Axis.joystick2,
			buttons: Axis.buttonManager.getButtonsById(this.id),
		})

		this.player.addEventListener('joystick:move', this.handleMove)
		this.player.addEventListener('keydown', this.handleKeyDown)
	}

	initModel() {
		const player = this.assets.models.player.scene.children[0]

		this.player = player.clone()
		this.player.position.y = 0.3
		this.player.position.z = 0

		const body = this.player.children[0].children[0]
		body.material = new MeshStandardMaterial({
			roughness: 0,
			metalness: 0,
			map: this.assets.textures[this.id === 1 ? 'pink' : 'blue'],
		})

		this.initAnimations()

		this.container.add(this.player)
		this.container.scale.set(0.3, 0.3, 0.3)
	}

	initAnimations() {
		const animations = this.assets.models.player.animations
		this.mixer = new AnimationMixer(this.player)
		this.walkAnim = AnimationClip.findByName(animations, 'walk')
		this.a_walk = this.mixer.clipAction(this.walkAnim)
		this.jumpAnim = AnimationClip.findByName(animations, 'jump')
		this.a_jump = this.mixer.clipAction(this.jumpAnim)
		this.jumpFusionAnim = AnimationClip.findByName(animations, 'jump')
		this.a_jumpFusion = this.mixer.clipAction(this.jumpFusionAnim)
	}

	initPosition() {
		const z = BLOCK_DEPTH * 0.25
		this.container.position.set(
			0,
			BLOCK_HEIGHT * 0.5 + SPHERE_RAY,
			this.id === 1 ? z : -z
		)
	}

	initPhysics() {
		const rigidBody = RigidBodyDesc.dynamic()
			.setTranslation(
				this.container.position.x,
				this.container.position.y,
				this.container.position.z
			)
			.setLinvel(0, 0, 0)
			.lockRotations()
		this.playerBody = this.physicsWorld.createRigidBody(rigidBody)

		const collider = ColliderDesc.ball(SPHERE_RAY)
			.setDensity(1)
			.setActiveEvents(ActiveEvents.COLLISION_EVENTS)
			.setActiveCollisionTypes(
				ActiveCollisionTypes.DEFAULT |
					ActiveCollisionTypes.KINEMATIC_FIXED
			)
		this.physicsWorld.createCollider(collider, this.playerBody)
	}

	initSounds() {
		this.s_jump = new Audio(this.listener)
		this.s_jump.setBuffer(this.assets.sounds.jump)
		this.s_jump.setVolume(0.2)
	}

	// EVENT HANDLERS

	handleMove = (e) => {
		const position = e.position

		if (
			position.x === 0 &&
			position.y === 0 &&
			this.velocity.x === 0 &&
			this.velocity.y === 0
		)
			return

		if (!this.a_walk.isRunning()) {
			this.a_walk.setDuration(this.speed * 180).play()
		} else if (position.x === 0 && position.y === 0) {
			this.a_walk.stop()
		}

		this.velocity.x = position.x * this.speed
		this.velocity.y = position.y * -this.speed
	}

	handleKeyDown = (e) => {
		switch (e.key) {
			case 'a':
				if (store.hasLost) this.handleRestart()
				else if (store.isFusion) this.keyEvent.trigger('keydown', [e.key])
				else if (store.started) this.handleJump()
				break
			case 'w':
				this.keyEvent.trigger('keydown', [e.key])
				break;
		}
	}

	handleJump() {
		this.s_jump.play()
		this.playerBody.applyImpulse({ x: 0.0, y: 0.5, z: 0.0 }, true)
	}

	handleFusion() {
		console.log('fusion')
	}

	handleRestart() {
		location.reload()
	}

	checkFall() {
		if (this.container.position.y < - BLOCK_HEIGHT * 0.5 && !store.hasLost) {
			LivesManager.loose()
		}
	}

	// RENDER

	render(delta) {
		this.playerBody.setLinvel(
			{
				x: this.velocity.x,
				y: this.playerBody.linvel().y,
				z: this.velocity.y,
			},
			true
		)

		const t = this.playerBody.translation()
		this.container.position.set(t.x, t.y, t.z)

		this.mixer.update(delta)

		this.checkFall()
	}
}
