import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { MeshStandardMaterial, Object3D } from 'three'

import LivesManager from '../LivesManager'
import { store } from '../../Tools/Store'
import { SPHERE_RAY } from '../Player'
import { BLOCK_DEPTH } from './Block'

export const PLATFORM_COLORS = {
	pink: 0xffafd2,
	blue: 0x5deff,
	purple: 0xac78ff,
}

export default class Plateform {
	constructor(options) {
		this.id = options.id
		this.time = options.time
		this.block = options.block
		this.assets = options.assets
		this.isLeft = options.isLeft
		this.isDouble = options.isDouble
		this.isCenter = options.isCenter
		this.physicsWorld = options.physicsWorld

		this.geometries = []
		this.materials = []
		this.colliders = []

		this.container = new Object3D()

		this.activated = false
		this.error = false

		this.init()
	}

	init() {
		const { geometry, x, y, z } = this.initModel()
		this.initPhysics(geometry, x, y, z)

		this.time.on('tick', this.render)
	}

	initModel() {
		// MODEL

		const plateform = this.assets.models.plateform.scene.children[0].clone()
		const geometry = plateform.geometry
		const material = new MeshStandardMaterial({
			color: PLATFORM_COLORS[
				this.isCenter ? 'purple' : this.id === 1 ? 'blue' : 'pink'
			],
			emissive: 0x000000,
			roughness: 0,
			// metalness: 1,
		})
		plateform.material = material

		this.geometries.push(geometry)
		this.materials.push(material)

		this.container.add(plateform)
		this.container.position.y = 2

		this.container.position.z = this.isCenter
			? 0
			: this.isLeft
				? -BLOCK_DEPTH * 0.25
				: BLOCK_DEPTH * 0.25

		const x = this.block.container.position.x + this.container.position.x
		const y = this.block.container.position.y + this.container.position.y
		const z = this.block.container.position.z + this.container.position.z

		this.plateformLeft = x - this.block.width * 0.25
		this.plateformRight = x + this.block.width * 0.25
		this.plateformFar = z - BLOCK_DEPTH * 0.33
		this.plateformNear = z + BLOCK_DEPTH * 0.33

		return { geometry, x, y, z }
	}

	initPhysics(geometry, x, y, z) {
		const rigidBody = RigidBodyDesc.fixed().setTranslation(x, y, z)
		const plateformBody = this.physicsWorld.createRigidBody(rigidBody)

		const collider = ColliderDesc.trimesh(
			geometry.attributes.position.array,
			geometry.index.array
		)

		this.physicsWorld.createCollider(collider, plateformBody)

		this.colliders.push(collider)
	}

	handlePlayerAfter(player) {
		if (
			!this.activated && (this.id === player.id || this.isCenter) &&
			player.container.position.x - SPHERE_RAY >= this.plateformRight
		) {
			this.handleError()
		}
	}

	handlePlayerOn(player) {
		const insideX =
			player.container.position.x + SPHERE_RAY >= this.plateformLeft &&
			player.container.position.x - SPHERE_RAY <= this.plateformRight

		const insideY = player.container.position.y - SPHERE_RAY >= 2.1

		const insideZ =
			player.container.position.z - SPHERE_RAY >= this.plateformFar &&
			player.container.position.z + SPHERE_RAY <= this.plateformNear

		if (!insideX || !insideZ || !insideY) {
			return
		}

		if (this.isCenter) {
			if (store.isFusion) {
				this.activated = true
				return
			}
			this.handleError()
			return
		}

		if (player.id !== this.id) this.handleError()
		else this.activated = true
	}

	handleError() {
		if (this.error) return
		this.error = true
		LivesManager.removeLife()
		this.s_error?.play()
	}

	render = () => {
		if (this.error) return
		this.block.playerManager.players.forEach((player) => {
			this.handlePlayerOn(player)
			this.handlePlayerAfter(player)
		})
	}
}
