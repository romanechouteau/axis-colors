import { BoxGeometry, Mesh, MeshNormalMaterial, Object3D } from 'three'
import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import Tunnel from './Tunnel'

export const BLOCK_TYPE = {
	normal: 0,
	tunnel: 1,
	platform: 2,
	empty: 3,
	empty_plateform: 4,
	button: 5,
	enemy: 6,
}

export const BLOCK_TYPE_LIST = Object.keys(BLOCK_TYPE)

// TYPE DIMENSIONS
export const BLOCK_DIMENSIONS = {
	[BLOCK_TYPE.normal]: 1,
	[BLOCK_TYPE.tunnel]: 6,
	[BLOCK_TYPE.platform]: 3,
	[BLOCK_TYPE.empty]: 1,
	[BLOCK_TYPE.empty_plateform]: 6,
	[BLOCK_TYPE.button]: 3,
	[BLOCK_TYPE.enemy]: 3,
}

// BLOCK DIMENSIONS
export const BLOCK_WIDTH = 1
export const BLOCK_DEPTH = 3
export const BLOCK_HEIGHT = 2

export default class Block {
	constructor(options) {
		this.type = options.type
		this.position = options.position
		this.physicsWorld = options.physicsWorld

		this.container = new Object3D()
		this.init()
	}

	init() {
		this.container.position.set(
			this.position.x,
			this.position.y,
			this.position.z
		)

		switch (this.type) {
			case BLOCK_TYPE.normal:
				this.initNormal()
				break
			case BLOCK_TYPE.tunnel:
				this.initTunnel()
				break
			case BLOCK_TYPE.platform:
				this.initPlatform()
				break
			case BLOCK_TYPE.empty:
				this.initEmpty()
				break
			case BLOCK_TYPE.empty_plateform:
				this.initEmptyPlatform()
				break
			case BLOCK_TYPE.button:
				this.initButton()
				break
			case BLOCK_TYPE.enemy:
				this.initEnemy()
				break
		}
	}

	// BLOCK INITIALIZERS

	initNormal() {
		this.createFloor()
	}

	initTunnel() {
		this.createFloor()

		const isLeft = Math.random() > 0.5
		const tunnel = new Tunnel({ id: 1, isLeft })
		const tunnel2 = new Tunnel({ id: 2, isLeft: !isLeft })
		this.container.add(tunnel.container)
		this.container.add(tunnel2.container)
	}

	initPlatform() {
		this.createFloor()
	}

	initEmpty() {
		return
	}

	initEmptyPlatform() {
		return
	}

	initButton() {
		this.createFloor()
	}

	initEnemy() {
		this.createFloor()
	}

	// OBJECT CREATION

	createFloor() {
		const width = BLOCK_WIDTH * BLOCK_DIMENSIONS[this.type]

		const geometry = new BoxGeometry(width, BLOCK_HEIGHT, BLOCK_DEPTH)
		const material = new MeshNormalMaterial({})
		const cube = new Mesh(geometry, material)
		this.container.add(cube)

		const rigidBody = RigidBodyDesc.fixed().setTranslation(
			this.container.position.x,
			this.container.position.y,
			this.container.position.z
		)
		this.floorBody = this.physicsWorld.createRigidBody(rigidBody)

		const collider = ColliderDesc.cuboid(
			width * 0.5,
			BLOCK_HEIGHT * 0.5,
			BLOCK_DEPTH * 0.5
		)

		this.physicsWorld.createCollider(collider, this.floorBody)
	}
}
