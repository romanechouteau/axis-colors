import { Object3D, Audio } from 'three'
import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'

import LivesManager from '../LivesManager'
import { store } from '../../Tools/Store'
import { SPHERE_RAY } from '../Player'
import { BLOCK_DEPTH, BLOCK_HEIGHT } from './Block'

export default class Tunnel {
	constructor(options) {
		this.id = options.id
		this.time = options.time
		this.block = options.block
		this.assets = options.assets
		this.isLeft = options.isLeft
		this.isLoop = options.isLoop
		this.material = options.material
		this.listener = options.listener
		this.physicsWorld = options.physicsWorld

		this.geometries = []
		this.colliders = []

		this.container = new Object3D()

		this.playersInside = []

		this.init()
	}

	init() {
		let values
		if (!this.isLoop) {
			values = this.initSimpleModel()
		} else {
			values = this.initLoopModel()
		}

		this.initPhysics(values.geometry, values.x, values.y, values.z)

		this.time.on('tick', this.render)
	}

	initSimpleModel() {
		// MODEL

		const tunnel = this.assets.models.tunnel.scene.children[0].clone()
		const radius = BLOCK_DEPTH * 0.27
		const geometry = tunnel.geometry
		tunnel.material = this.material

		this.geometries.push(geometry)

		this.container.add(tunnel)

		// POSITION

		this.container.position.y = BLOCK_HEIGHT * 0.5 + radius
		this.container.position.z = this.isLeft ? -radius : radius

		const x = this.block.container.position.x + this.container.position.x
		const y = this.block.container.position.y + this.container.position.y
		const z = this.block.container.position.z + this.container.position.z

		this.tunnelLeft = x - this.block.width * 0.27
		this.tunnelRight = x + this.block.width * 0.27
		this.tunnelFar = z - radius
		this.tunnelNear = z + radius

		return { geometry, x, y, z }
	}

	initLoopModel() {
		// MODEL

		let tunnel
		if (!this.isLeft) {
			tunnel = this.assets.models.looptunnel1.scene.children[0].clone()
		} else {
			tunnel = this.assets.models.looptunnel2.scene.children[0].clone()
		}
		const radius = BLOCK_DEPTH * 0.27
		const geometry = tunnel.geometry
		tunnel.material = this.material

		this.geometries.push(geometry)

		this.container.add(tunnel)

		// POSITION

		this.container.position.y = BLOCK_HEIGHT * 0.5 + radius

		const x = this.block.container.position.x + this.container.position.x
		const y = this.block.container.position.y + this.container.position.y
		const z = this.block.container.position.z + this.container.position.z
		const _z =
			this.block.container.position.z + (this.isLeft ? -radius : radius)

		this.tunnelLeft = x - this.block.width * 0.27
		this.tunnelRight = x + this.block.width * 0.27

		this.tunnelFar = _z - radius
		this.tunnelNear = _z + radius

		return { geometry, x, y, z }
	}

	initPhysics(geometry, x, y, z) {
		const rigidBody = RigidBodyDesc.fixed().setTranslation(x, y, z)
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
		const index = this.playersInside.indexOf(player.id)

		const insideX =
			player.container.position.x + SPHERE_RAY >= this.tunnelLeft &&
			player.container.position.x - SPHERE_RAY <= this.tunnelRight

		const inside =
			index !== -1
				? insideX
				: insideX &&
				  player.container.position.z - SPHERE_RAY >= this.tunnelFar &&
				  player.container.position.z + SPHERE_RAY <= this.tunnelNear

		if (inside === false) {
			if (index === -1) return
			player.leaveTunnel()
			this.playersInside.splice(index, 1)
			return
		}

		if (index !== -1 || player.inTunnel) return

		this.playersInside.push(player.id)
		player.enterTunnel()
		this.handleWrongTunnel(player.id)
	}

	handleWrongTunnel(id) {
		if (store.hasLost) return

		if (id !== this.id) {
			LivesManager.removeLife()
			this.s_error?.play()
		}
	}

	render = () => {
		this.block.playerManager.players.forEach((player) => {
			this.handlePlayerInside(player)
		})
	}
}
