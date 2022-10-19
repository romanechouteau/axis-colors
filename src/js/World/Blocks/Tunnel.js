import {
	CylinderGeometry,
	Mesh,
	MeshNormalMaterial,
	Object3D,
	DoubleSide,
	MeshBasicMaterial,
} from 'three'
import { COLORS } from '..'
import {
	BLOCK_DEPTH,
	BLOCK_DIMENSIONS,
	BLOCK_HEIGHT,
	BLOCK_TYPE,
	BLOCK_WIDTH,
} from './Block'

export default class Tunnel {
	constructor(options) {
		this.id = options.id
		this.isLeft = options.isLeft

		this.geometries = []
		this.materials = []

		this.container = new Object3D()

		this.init()
	}

	init() {
		const radius = BLOCK_DEPTH * 0.25
		const geometry = new CylinderGeometry(
			radius,
			radius,
			(BLOCK_DIMENSIONS[BLOCK_TYPE.tunnel] - 2) * BLOCK_WIDTH,
			32,
			1,
			true
		)
		const material = new MeshBasicMaterial({
			side: DoubleSide,
			color: COLORS[this.id],
		})
		const tunnel = new Mesh(geometry, material)

		this.container.add(tunnel)

		this.container.position.y = BLOCK_HEIGHT * 0.5 + radius
		this.container.position.z = this.isLeft ? -radius : radius

		this.container.rotation.set(0, 0, Math.PI / 2)

		this.geometries.push(geometry)
		this.materials.push(material)
	}
}
