import {
	Object3D,
	MeshLambertMaterial,
} from 'three'
import { ColliderDesc, RigidBodyDesc, ActiveEvents, ActiveCollisionTypes, ActiveHooks } from '@dimforge/rapier3d-compat'

import { COLORS } from '..'
import {
	BLOCK_DEPTH,
	BLOCK_HEIGHT,
} from './Block'

export default class Tunnel {
	constructor(options) {
		this.id = options.id
		this.block = options.block
		this.assets = options.assets
		this.isLeft = options.isLeft
		this.physicsWorld = options.physicsWorld

		this.geometries = []
		this.materials = []

		this.container = new Object3D()

		this.init()
	}

	init() {
		const tunnel = this.assets.models.tunnel.scene.children[0].clone()
		const radius = BLOCK_DEPTH * 0.27
		const geometry = tunnel.geometry
		const material = new MeshLambertMaterial({
			color: COLORS[this.id]
		})
		tunnel.material = material

		this.container.add(tunnel)

		this.container.position.y = BLOCK_HEIGHT * 0.5 + radius
		this.container.position.z = this.isLeft ? -radius : radius

		this.container.scale.set(1, 0.8, 0.8)

		const rigidBody = RigidBodyDesc.fixed()
			.setTranslation(
				this.block.container.position.x + this.container.position.x,
				this.block.container.position.y + this.container.position.y,
				this.block.container.position.z + this.container.position.z
			)
		this.tunnelBody = this.physicsWorld.createRigidBody(rigidBody)

		this.collider = ColliderDesc
			.trimesh(geometry.attributes.position.array, geometry.index.array)

		this.physicsWorld.createCollider(this.collider, this.tunnelBody)

		this.geometries.push(geometry)
		this.materials.push(material)
	}

	collisionEvents(handle1, handle2, started) {
		if (this.tunnelBody.handle === handle1 || this.tunnelBody.handle === handle2) {
			this.block.playerManager.players.forEach(player => {
				if (player.playerBody.handle === handle1 || player.playerBody.handle === handle2) {
					if (player.id !== this.id) {
						console.log('pas bien lol')
					}
				}
			})
		}
	}
}
