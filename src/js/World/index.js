import {
	BufferAttribute,
	BufferGeometry,
	LineBasicMaterial,
	LineSegments,
	Object3D,
	Vector3,
	AudioListener,
	Audio,
} from 'three'

import Background from './Background'
import BlockManager from './Blocks/BlockManager'
import DangerManager from './DangerManager'
import PlayerManager from './PlayerManager'
import AmbientLightSource from './lights/AmbientLight'
import PointLightSource from './lights/PointLight'
import { store } from '../Tools/Store'
import { getRapier } from './Rapier'
import { World as PhysicsWorld, EventQueue } from '@dimforge/rapier3d-compat'

export const COLORS = {
	1: 0x29a4e6,
	2: 0xe6603c,
}

export default class World {
	constructor(options) {
		// Set options
		this.time = options.time
		this.debug = options.debug
		this.assets = options.assets
		this.camera = options.camera
		this.dangerPass = options.dangerPass

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

		this.setAudioPlayer()

		this.setPlayerManager()
		this.setDangerManager()
		this.setBlockManager()

		this.setBackground()

		this.setTimer()

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

	// AUDIO

	setAudioPlayer() {
		this.listener = new AudioListener()
		this.camera.camera.add(this.listener)

		const s_backgroundMusic = new Audio(this.listener)
		s_backgroundMusic.setBuffer(this.assets.sounds.background)
		s_backgroundMusic.setLoop(true)
		s_backgroundMusic.setVolume(0.2)
		s_backgroundMusic.play()
	}

	// BLOCKS

	setBlockManager() {
		this.blockManager = new BlockManager({
			time: this.time,
			assets: this.assets,
			listener: this.listener,
			totalWidth: this.totalWidth,
			totalHeight: this.totalHeight,
			physicsWorld: this.physicsWorld,
			worldPosition: this.container.position,
			playerManager: this.playerManager,
			dangerManager: this.dangerManager
		})
		this.container.add(this.blockManager.container)
	}

	// PLAYERS

	setPlayerManager() {
		this.playerManager = new PlayerManager({
			time: this.time,
			assets: this.assets,
			physicsWorld: this.physicsWorld,
			listener: this.listener,
		})
		this.container.add(this.playerManager.container)
	}

	// DANGER

	setDangerManager() {
		this.dangerManager = new DangerManager({
			time: this.time,
			camera: this.camera,
			totalWidth: this.totalWidth,
			dangerPass: this.dangerPass,
			worldPosition: this.container.position,
			playerManager: this.playerManager,
		})
	}

	// BACKGROUND

	setBackground() {
		this.background = new Background({
			time: this.time,
			assets: this.assets,
			camera: this.camera,
			totalWidth: this.totalWidth,
			worldPosition: this.container.position,
		})
		this.container.add(this.background.container)
	}

	// PHYSICS

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

	setTimer() {
		this.timerDiv = document.getElementById('timer')
		this.updateTimer()
	}

	updateWorldPosition() {
		const currentX = Math.min(
			this.playerManager.players[0].container.position.x,
			this.playerManager.players[1].container.position.x
		)

		this.container.position.x = -currentX
	}

	updateTimer() {
		if (!this.timerDiv) return

		const time = new Date(this.time.current - store.startTime)
		this.timerDiv.innerHTML = store.startTime === null
			? '0'
			: `${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}:${time.getMilliseconds().toString().padStart(3, '0')}`
	}

	render() {
		this.updateTimer()
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
		})
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
