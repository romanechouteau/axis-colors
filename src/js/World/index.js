import {
	BufferAttribute,
	BufferGeometry,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	MeshNormalMaterial,
	MeshPhysicalMaterial,
	Object3D,
	SphereGeometry,
	TorusGeometry,
	Vector3,
} from 'three'

import BlockManager from './Blocks/BlockManager'
import PlayerManager from './PlayerManager'
import AmbientLightSource from './lights/AmbientLight'
import PointLightSource from './lights/PointLight'
import { store } from '../tools/Store'
import { getRapier } from './Rapier'
import { World as PhysicsWorld, EventQueue } from '@dimforge/rapier3d-compat'

export const COLORS = {
	1: 0x29A4E6,
	2: 0xE6603C,
}

export default class World {
	constructor(options) {
		// Set options
		this.time = options.time
		this.debug = options.debug
		this.assets = options.assets
		this.camera = options.camera

		// Set up
		this.container = new Object3D()
		this.container.name = 'World'

		if (this.debug) {
			this.debug.setFolder('Test')
		}

		this.setLoader()
	}
	async init() {
		await getRapier()
		this.eventQueue = new EventQueue(true)

		this.setPhysics()

		this.setSize()

		this.setAmbientLight()
		this.setPointLight()

		// this.setCube()
		this.setPlayerManager()
		this.setBlockManager()

		this.time.on('tick', () => {
			this.render()
		})
	}

	setLoader() {
		this.assets.on('ressourcesReady', () => {
			this.init()
		})
	}

	setSize() {
		const cameraZ = this.camera.camera.position.z
		const aspect = store.resolution.width / store.resolution.height
		const vFov = (this.camera.camera.fov * Math.PI) / 180

		this.totalHeight = 2 * Math.tan(vFov / 2) * cameraZ
		this.totalWidth = this.totalHeight * aspect
	}

	// LIGHTS
	setAmbientLight() {
		this.ambientlight = new AmbientLightSource()
		this.container.add(this.ambientlight.container)
	}
	setPointLight() {
		this.light = new PointLightSource()
		this.container.add(this.light.container)
	}

	// BLOCKS

	setBlockManager() {
		this.blockManager = new BlockManager({
			time: this.time,
			assets: this.assets,
			totalWidth: this.totalWidth,
			totalHeight: this.totalHeight,
			physicsWorld: this.physicsWorld,
			worldPosition: this.container.position,
			playerManager: this.playerManager
		})
		this.container.add(this.blockManager.container)
	}

	// PLAYERS

	setPlayerManager() {
		this.playerManager = new PlayerManager({
			time: this.time,
			physicsWorld: this.physicsWorld,
		})
		this.container.add(this.playerManager.container)
	}

	setPhysics() {
		const gravity = new Vector3(0.0, -9.81, 0.0)
		this.physicsWorld = new PhysicsWorld(gravity)

		// DEBUG

		const geometry = new BufferGeometry()
		const material = new LineBasicMaterial({
			color: 0xffffff,
			vertexColors: true,
		})
		this.lines = new LineSegments(geometry, material)
		this.container.add(this.lines)
	}

	updateWorldPosition() {
		const currentX = Math.min(
			this.playerManager.players[0].container.position.x,
			this.playerManager.players[1].container.position.x
		)

		this.container.position.x = -currentX
	}

	render() {
		this.updateWorldPosition()

		// DEBUG

		// const buffers = this.physicsWorld.debugRender()
		// this.lines.visible = true
		// this.lines.geometry.setAttribute(
		// 	'position',
		// 	new BufferAttribute(buffers.vertices, 3)
		// )
		// this.lines.geometry.setAttribute(
		// 	'color',
		// 	new BufferAttribute(buffers.colors, 4)
		// )

		this.physicsWorld.step(this.eventQueue)

		this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
			this.blockManager.collisionEvents(handle1, handle2, started)
		});
	}

	// TEST RAPIDE
	// setCube() {
	// 	const geometry = new TorusGeometry( 2, 1, 16, 40 )
	// 	const material = new MeshPhysicalMaterial({
	// 		roughness: 0.6,
	// 		transmission: 1,
	// 		reflectivity: 0.3,
	// 		thickness: 0.3,
	// 		color: 0x47CFFF,
	// 		clearcoat: 0.1,
	// 		clearcoatRoughness: 0.1,
	// 	})
	// 	const cube = new Mesh(geometry, material)
	// 	cube.rotation.y = 90

	// 	const geometry_sphere = new SphereGeometry(0.5, 32, 16)
	// 	const material_sphere = new MeshNormalMaterial({})
	// 	const sphere = new Mesh(geometry_sphere, material_sphere)

	// 	this.time.on('tick', () => {
	// 		sphere.position.x = Math.sin(this.time.current * 0.001)
	// 	})

	// 	this.container.add(cube)
	// 	this.container.add(sphere)
	// }
}
