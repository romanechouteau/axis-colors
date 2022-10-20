import { Object3D, Audio, MeshStandardMaterial } from 'three'
import {
	ColliderDesc,
	RigidBodyDesc,
} from '@dimforge/rapier3d-compat'

import LivesManager from '../LivesManager'
import { COLORS } from '../index'
import { SPHERE_RAY } from '../Player'
import { BLOCK_DEPTH, BLOCK_HEIGHT } from './Block'

export default class Tunnel {
	constructor(options) {
		this.id = options.id
		this.time = options.time
		this.block = options.block
		this.assets = options.assets
		this.isLeft = options.isLeft
		this.listener = options.listener
		this.physicsWorld = options.physicsWorld

		this.geometries = []
		this.materials = []
		this.colliders = []

		this.container = new Object3D()

		this.playersInside = []

		this.init()
	}

	init() {
		const { geometry, x, y, z } = this.initModel()
		this.initPhysics(geometry, x, y, z)

		this.time.on('tick', this.render)
	}

	initModel() {
		// MODEL

		const tunnel = this.assets.models.tunnel.scene.children[0].clone()
		const radius = BLOCK_DEPTH * 0.27
		const geometry = tunnel.geometry
		const material = new MeshStandardMaterial({
			color: COLORS[this.id],
			transparent: true,
			opacity: 0.5,
			roughness: 0.,
		})
		tunnel.material = material

		this.geometries.push(geometry)
		this.materials.push(material)

		this.container.add(tunnel)

		// POSITION

		this.container.position.y = BLOCK_HEIGHT * 0.5 + radius
		this.container.position.z = this.isLeft ? -radius : radius

		this.container.scale.set(1, 0.8, 0.8)

		const x = this.block.container.position.x + this.container.position.x
		const y = this.block.container.position.y + this.container.position.y
		const z = this.block.container.position.z + this.container.position.z

		this.tunnelLeft = x - this.block.width * 0.35
		this.tunnelRight = x + this.block.width * 0.35
		this.tunnelFar = z - radius
		this.tunnelNear = z + radius

		return { geometry, x, y, z }
	}

	initPhysics(geometry, x, y, z) {
		const rigidBody = RigidBodyDesc.fixed().setTranslation(
			x,
			y,
			z
		)
		this.tunnelBody = this.physicsWorld.createRigidBody(rigidBody)

		const collider = ColliderDesc.trimesh(
			geometry.attributes.position.array,
			geometry.index.array
		)

		this.physicsWorld.createCollider(collider, this.tunnelBody)

		this.colliders.push(collider)
	}

	initSounds() {
		this.s_error = new Audio(this.listener)
		this.s_error.setBuffer(this.assets.sounds.error)
		this.s_error.setVolume(0.4)
	}

	handlePlayerInside(player) {
		const inside = player.container.position.x - SPHERE_RAY >= this.tunnelLeft
			&& player.container.position.x + SPHERE_RAY <= this.tunnelRight
			&& player.container.position.z - SPHERE_RAY >= this.tunnelFar
			&& player.container.position.z + SPHERE_RAY <= this.tunnelNear

		const index = this.playersInside.indexOf(player.id)

		if (inside === false) {
			if (index === -1) return
			this.playersInside.splice(index, 1)
			return
		}

		if (index !== -1) return

		this.playersInside.push(player.id)
		this.handleWrongTunnel(player.id)
	}

	handleWrongTunnel(id) {
		if (id !== this.id) {
			LivesManager.removeLife()
			this.s_error?.play()
		}
	}

	render = () => {
		this.block.playerManager.players.forEach(player => {
			this.handlePlayerInside(player)
		})
	}
}
