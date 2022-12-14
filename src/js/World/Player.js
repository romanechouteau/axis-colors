import gsap from 'gsap'
import Axis from 'axis-api'
import {
	Object3D,
	Vector2,
	Audio,
	AnimationClip,
	AnimationMixer,
	MeshStandardMaterial,
	Color,
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
export const SPHERE_FEET = 0.1
const CONTAINER_SCALE = 0.3

const PLAYER_COLORS = {
	pink: 0xef397a,
	blue: 0x1dcce4,
	purple: 0xac78ff,
}

export default class Player {
	constructor(options) {
		this.id = options.id
		this.time = options.time
		this.assets = options.assets
		this.listener = options.listener
		this.fusionBody = options.fusionBody
		this.physicsWorld = options.physicsWorld
		this.hdr = options.hdr

		this.container = new Object3D()
		this.velocity = new Vector2()
		this.speed = 3
		this.isFusion = false
		this.inTunnel = false

		this.keyEvent = new Emitter()
		this.joystickEvent = new Emitter()
		this.fusionEvent = new Emitter()

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

		this.player.addEventListener('joystick:move', this.handleJoystickMove)
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
			metalness: 0.6,
			envMap: this.hdr,
			map: this.assets.textures[this.id === 1 ? 'pink' : 'blue'],
		})

		this.initFootColor()

		this.initAnimations()

		this.container.add(this.player)
		this.container.scale.set(
			CONTAINER_SCALE,
			CONTAINER_SCALE,
			CONTAINER_SCALE
		)
	}

	initAnimations() {
		const animations = this.assets.models.player.animations
		this.mixer = new AnimationMixer(this.player)
		this.walkAnim = AnimationClip.findByName(animations, 'walk')
		this.a_walk = this.mixer.clipAction(this.walkAnim)
		this.walkSitAnim = AnimationClip.findByName(animations, 'walksit')
		this.a_walkSit = this.mixer.clipAction(this.walkSitAnim)
		this.jumpAnim = AnimationClip.findByName(animations, 'jump')
		this.a_jump = this.mixer.clipAction(this.jumpAnim)
		this.jumpSitAnim = AnimationClip.findByName(animations, 'jumpsit')
		this.a_jumpSit = this.mixer.clipAction(this.jumpSitAnim)
		// this.sitAnim = AnimationClip.findByName(animations, 'sitREST')
		// this.a_sit = this.mixer.clipAction(this.sitAnim)
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

		const collider = ColliderDesc.ball(SPHERE_RAY + SPHERE_FEET)
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

		this.s_end = new Audio(this.listener)
		this.s_end.setBuffer(this.assets.sounds.end)
		this.s_end.setVolume(0.4)
	}

	initFootColor() {
		this.pink = new Color(PLAYER_COLORS['pink'])
		this.blue = new Color(PLAYER_COLORS['blue'])
		this.purple = new Color(PLAYER_COLORS['purple'])

		const footMaterial = new MeshStandardMaterial({
			color: PLAYER_COLORS[this.id === 1 ? 'pink' : 'blue'],
			emissive: 0x000000,
			metalness: 0.5,
		})
		this.player.children[1].children[0].material = footMaterial
		this.player.children[2].children[0].material = footMaterial
	}

	defineFootColor(isFusion) {
		const color = isFusion
			? this.purple
			: this.id === 1
			? this.pink
			: this.blue

		this.player.children[1].children[0].material.color = color
		this.player.children[2].children[0].material.color = color
	}

	// EVENT HANDLERS

	handleJoystickMove = (e) => {
		const position = e.position

		if (store.isFusion) {
			this.joystickEvent.trigger('move', [position])
			return
		}

		this.handleMove(position)
	}

	handleKeyDown = (e) => {
		switch (e.key) {
			case 'a':
				if (store.isFusion) this.keyEvent.trigger('keydown', [e.key])
				else if (store.started) this.handleJump()
				break
			case 's':
				if (
					store.hasLost &&
					!store.virtualKeyboardOpen &&
					store.canRestart
				)
					this.handleRestart()
				break
			case 'w':
				this.keyEvent.trigger('keydown', [e.key])
				break
		}
	}

	handleMove(position) {
		if (
			position.x === 0 &&
			position.y === 0 &&
			this.velocity.x === 0 &&
			this.velocity.y === 0
		)
			return

		const animation =
			this.isFusion && this.id !== 1 ? this.a_walkSit : this.a_walk
		if (!animation.isRunning()) {
			animation
				.setDuration(1620 / this.speed)
				.fadeIn(100)
				.play()
		} else if (position.x === 0 && position.y === 0) {
			animation.fadeOut(100).stop()
			if (this.isFusion && this.id !== 1) {
				// this.a_sit.fadeIn(100).play()
			}
		}

		this.velocity.x = position.x * this.speed
		this.velocity.y = position.y * -this.speed
	}

	handleJump() {
		this.s_jump.play()

		if (this.isFusion && this.id !== 1) {
			this.a_jumpSit.fadeIn(100).play()
			return
		}

		this.a_jump.fadeIn(100).play()

		if (this.isFusion) {
			this.fusionBody.applyImpulse({ x: 0.0, y: 2, z: 0.0 }, true)
			return
		}
		this.playerBody.applyImpulse({ x: 0.0, y: 1.2, z: 0.0 }, true)
	}

	handleFusion() {
		this.scale = CONTAINER_SCALE

		gsap.timeline()
			.to(this, {
				scale: 0,
				duration: 0.25,
				ease: 'power1.easeIn',
				onUpdate: () => {
					this.container.scale.set(this.scale, this.scale, this.scale)
				},
				onComplete: () => {
					this.defineFootColor(true)
					this.fusionEvent.trigger('fusion')
					this.isFusion = true

					if (this.id !== 1) {
						// this.a_sit.fadeIn(100).play()
					}

					this.playerBody.setTranslation({
						x: 0,
						y: 0,
						z: -10,
					})
					this.playerBody.sleep()
				},
			})
			.to(this, {
				scale: CONTAINER_SCALE,
				duration: 0.25,
				ease: 'power1.easeOut',
				onUpdate: () => {
					this.container.scale.set(this.scale, this.scale, this.scale)
				},
			})
	}

	handleDefusion() {
		this.scale = CONTAINER_SCALE

		gsap.timeline()
			.to(this, {
				scale: 0,
				duration: 0.25,
				ease: 'power1.easeIn',
				onUpdate: () => {
					this.container.scale.set(this.scale, this.scale, this.scale)
				},
				onComplete: () => {
					this.fusionEvent.trigger('defusion')
					this.isFusion = false
					this.defineFootColor()

					// this.a_sit.stop()
					this.a_jumpSit.stop()
					this.a_walkSit.stop()

					const offset = this.id === 1 ? SPHERE_RAY : -SPHERE_RAY
					this.playerBody.setTranslation({
						x: this.container.position.x,
						y: BLOCK_HEIGHT * 0.5 + SPHERE_RAY,
						z: offset,
					})
					this.playerBody.wakeUp()
				},
			})
			.to(this, {
				scale: CONTAINER_SCALE,
				duration: 0.25,
				ease: 'power1.easeOut',
				onUpdate: () => {
					this.container.scale.set(this.scale, this.scale, this.scale)
				},
			})
	}

	handleRestart() {
		location.reload()
	}

	checkFall() {
		if (this.container.position.y < -BLOCK_HEIGHT * 0.5 && !store.hasLost) {
			LivesManager.loose()
			this.s_end.play()
		}
	}

	enterTunnel() {
		this.inTunnel = true
	}

	leaveTunnel() {
		this.inTunnel = false
	}

	// RENDER

	render() {
		const currentBody = this.isFusion ? this.fusionBody : this.playerBody

		if (!this.isFusion || this.id === 1) {
			currentBody.setLinvel(
				{
					x: this.velocity.x,
					y: currentBody.linvel().y,
					z: this.velocity.y,
				},
				true
			)
		}

		const t = currentBody.translation()
		const offset = this.isFusion
			? this.id === 1
				? -SPHERE_RAY - SPHERE_FEET
				: SPHERE_RAY - SPHERE_FEET
			: 0
		this.container.position.set(t.x, t.y + offset, t.z)

		this.mixer.update(this.time.delta)

		const elapsed =
			store.startTime === null ? 0 : this.time.current - store.startTime
		this.speed = 3 + elapsed * 0.0001

		this.checkFall()
	}
}
