import Axis from 'axis-api'
import {
	Mesh,
	MeshNormalMaterial,
	Object3D,
	SphereGeometry,
	Vector2,
} from 'three'
import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'

import { BLOCK_DEPTH, BLOCK_HEIGHT } from './Block'

const SPHERE_RAY = 0.3

export default class Player {
	constructor(options) {
		this.id = options.id
		this.physicsWorld = options.physicsWorld

		this.container = new Object3D()
		this.speed = 2
		this.velocity = new Vector2()

		this.init()
	}

	// INITIALIZERS

	init() {
		this.initControls()
		this.initModel()
		this.initPosition()
		this.initPhysics()
	}

	initControls() {
		this.player = Axis.createPlayer({
			id: this.id,
			joysticks: this.id === 1 ? Axis.joystick1 : Axis.joystick2,
			buttons: Axis.buttonManager.getButtonsById(this.id),
		})

		this.player.addEventListener('joystick:move', this.handleMove)
	}

	initModel() {
		const geometry = new SphereGeometry(SPHERE_RAY, 32, 16)
		const material = new MeshNormalMaterial({})
		const sphere = new Mesh(geometry, material)

		this.container.add(sphere)
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
			.setLinvel(0, -1, 0)
			.lockRotations()
		this.playerBody = this.physicsWorld.createRigidBody(rigidBody)

		const collider = ColliderDesc.ball(SPHERE_RAY)
		this.physicsWorld.createCollider(collider, this.playerBody)
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

		this.velocity.set(position.x * this.speed, position.y * -this.speed)

		this.playerBody.setLinvel(
			{ x: this.velocity.x, y: -1.0, z: this.velocity.y },
			true
		)
	}

	// RENDER

	render() {
		const t = this.playerBody.translation()
		this.container.position.set(t.x, t.y, t.z)
	}
}
