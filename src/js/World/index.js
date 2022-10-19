import {
	Mesh,
	MeshNormalMaterial,
	MeshPhysicalMaterial,
	Object3D,
	SphereGeometry,
	TorusGeometry
} from 'three'

import BlockManager from './BlockManager'
import PlayerManager from './PlayerManager'
import AmbientLightSource from './lights/AmbientLight'
import PointLightSource from './lights/PointLight'
import { store } from '../tools/Store'

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
	init() {
		this.setSize()

		this.setAmbientLight()
		this.setPointLight()

		// this.setCube()
		this.setBlockManager()
		this.setPlayerManager()
	}
	setLoader() {
		this.assets.on('ressourcesReady', () => {
			this.init()
		})
	}

	setSize() {
    const cameraZ = this.camera.camera.position.z
    const aspect = store.resolution.width / store.resolution.height
    const vFov = this.camera.camera.fov * Math.PI / 180

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
			totalWidth: this.totalWidth,
			totalHeight: this.totalHeight
		})
		this.container.add(this.blockManager.container)
	}

	// PLAYERS
	setPlayerManager() {
		this.playerManager = new PlayerManager({
			time: this.time
		})
		this.container.add(this.playerManager.container)
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
