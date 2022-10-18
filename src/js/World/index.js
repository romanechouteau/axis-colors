import {
	Mesh,
	MeshNormalMaterial,
	MeshPhysicalMaterial,
	Object3D,
	SphereGeometry,
	TorusGeometry
} from 'three'

import BlockManager from './BlockManager'
import AmbientLightSource from './lights/AmbientLight'
import PointLightSource from './lights/PointLight'

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
		this.setAmbientLight()
		this.setPointLight()

		// this.setCube()
		this.setBlockManager()
	}
	setLoader() {
		this.assets.on('ressourcesReady', () => {
			this.init()
		})
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
		this.blockManager = new BlockManager({ camera: this.camera })
		this.container.add(this.blockManager.container)
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
