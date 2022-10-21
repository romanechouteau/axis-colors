import {
	BoxGeometry,
	Mesh,
	Object3D,
} from 'three'
import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'

import Button from './Button'
import Tunnel from './Tunnel'
import Plateform from './Plateform'

export const BLOCK_TYPE = {
	normal: 0,
	tunnel: 1,
	platform: 2,
	empty: 3,
	button: 4,
	// empty_plateform: 5,
	// enemy: 6,
}

export const BLOCK_TYPE_LIST = Object.keys(BLOCK_TYPE)

// TYPE DIMENSIONS
export const BLOCK_DIMENSIONS = {
	[BLOCK_TYPE.normal]: 1,
	[BLOCK_TYPE.tunnel]: 12,
	[BLOCK_TYPE.platform]: 3,
	[BLOCK_TYPE.empty]: 2,
	[BLOCK_TYPE.empty_plateform]: 6,
	[BLOCK_TYPE.button]: 3,
	[BLOCK_TYPE.enemy]: 3,
}

// TYPE DIMENSIONS
export const BLOCK_PROBABILITY = {
	[BLOCK_TYPE.normal]: 15,
	[BLOCK_TYPE.tunnel]: 2,
	[BLOCK_TYPE.platform]: 2,
	[BLOCK_TYPE.empty]: 3,
	[BLOCK_TYPE.button]: 1,
	[BLOCK_TYPE.empty_plateform]: 1,
	[BLOCK_TYPE.enemy]: 1,
}

// BLOCK DIMENSIONS
export const BLOCK_WIDTH = 1
export const BLOCK_DEPTH = 3
export const BLOCK_HEIGHT = 2

export default class Block {
	constructor(options) {
		this.type = options.type
		this.time = options.time
		this.index = options.index
		this.assets = options.assets
		this.listener = options.listener
		this.matrices = options.matrices
		this.position = options.position
		this.materials = options.materials
		this.physicsWorld = options.physicsWorld
		this.dangerManager = options.dangerManager
		this.playerManager = options.playerManager
		this.hdr = options.hdr

		this.geometries = []
		this.colliders = []

		this.container = new Object3D()
		this.dummy = new Object3D()
		this.init()
	}

	init() {
		this.width = BLOCK_DIMENSIONS[this.type]
		this.container.position.set(
			this.position.x + this.width * BLOCK_WIDTH * 0.5,
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
		const isLoop = Math.random() > 0.5
		this.tunnels = []

		for (let i = 1; i <= 2; i++) {
			const tunnel = new Tunnel({
				id: i,
				time: this.time,
				block: this,
				assets: this.assets,
				isLeft: i === 1 ? isLeft : !isLeft,
				isLoop,
				material: this.materials.tunnelMaterials[i],
				listener: this.listener,
				physicsWorld: this.physicsWorld,
			})

			this.tunnels.push(tunnel)
			this.container.add(tunnel.container)
			this.geometries.push(...tunnel.geometries)
			this.colliders.push(...tunnel.colliders)
		}
	}

	initPlatform() {
		this.createFloor()

		const isLeft = Math.random() > 0.5
		const isDouble = Math.random() > 0.5
		const isCenter = isDouble ? false : Math.random() > 0.5
		const number = isDouble ? 2 : 1
		this.plateforms = []

		for (let i = 1; i <= number; i++) {
			const plateform = new Plateform({
				id: isDouble ? i : Math.random() > 0.5 ? 1 : 2,
				time: this.time,
				block: this,
				assets: this.assets,
				isLeft: i === 1 ? isLeft : !isLeft,
				isDouble,
				material: this.materials.platformMaterials[isCenter ? 0 : i],
				isCenter: isCenter,
				physicsWorld: this.physicsWorld,
			})

			this.plateforms.push(plateform)
			this.container.add(plateform.container)
			this.geometries.push(...plateform.geometries)
			this.colliders.push(...plateform.colliders)
		}
	}

	initEmpty() {
		return
	}

	initEmptyPlatform() {
		this.createFloor(true)
		return
	}

	initButton() {
		this.createFloor()

		this.button = new Button({
			time: this.time,
			block: this,
			assets: this.assets,
			isLeft: Math.random() > 0.5,
			isCenter: Math.random() > 0.5,
			listener: this.listener,
			material: this.materials.buttonMaterial,
			dangerManager: this.dangerManager,
		})

		this.container.add(this.button.container)
		this.geometries.push(...this.button.geometries)
	}

	initEnemy() {
		this.createFloor()
	}

	// OBJECT CREATION

	createFloor() {
		const matrices = []
		for (let i = 0; i < this.width; i++) {
			this.dummy.position.x = this.position.x + i * BLOCK_WIDTH
			this.dummy.updateMatrix()
			matrices.push(this.dummy.matrix.clone())
		}
		this.matrices.floor[this.index] = matrices

		const rigidBody = RigidBodyDesc.fixed().setTranslation(
			this.container.position.x,
			this.container.position.y,
			this.container.position.z
		)
		this.floorBody = this.physicsWorld.createRigidBody(rigidBody)

		const collider = ColliderDesc.cuboid(
			this.width * BLOCK_WIDTH * 0.5,
			BLOCK_HEIGHT * 0.5,
			BLOCK_DEPTH * 0.5
		)

		this.physicsWorld.createCollider(collider, this.floorBody)

		this.colliders.push(collider)
	}

	// DESTROY

	destroy() {
		this.geometries.forEach((geometry) => {
			geometry.dispose()
		})
		this.geometries = []

		this.colliders.forEach((collider) => {
			this.physicsWorld.removeCollider(collider)
		})
		this.colliders = []

		this.container.clear()
		this.container.removeFromParent()
	}
}
