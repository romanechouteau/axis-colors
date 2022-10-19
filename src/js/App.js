import { Scene, sRGBEncoding, WebGLRenderer } from 'three'

import Camera from './Camera'
import World from './World'

import { store } from './tools/Store'
import Raycaster from './tools/Raycasters'
import Mouse from './tools/Mouse'
import Debug from './tools/Debug'

import Keyboard from './tools/Keyboard'

export default class App {
	static instance
	constructor(options) {
		// Set options
		this.canvas = options.canvas
		this.time = options.time
		this.sizes = options.sizes
		this.assets = options.assets

		App.instance = this

		// Set up
		console.log('✨ Init app ✨')
		this.setRenderer()
		this.setCamera()
		this.initDebug()
		this.initEvents()
		this.setWorld()
	}

	initEvents() {
		this.keyboard = new Keyboard()

		this.mouse = new Mouse()
		// this.raycaster = new Raycaster()
		// this.raycaster.on('raycast', (e) => {
		// 	console.log('RAYCAST : ', e)
		// })
	}

	initDebug() {
		this.debug = new Debug()
	}

	setRenderer() {
		// Set scene
		this.scene = new Scene()
		// Set renderer
		this.renderer = new WebGLRenderer({
			canvas: this.canvas,
			alpha: true,
			antialias: true,
			powerPreference: 'high-performance',
		})
		this.renderer.outputEncoding = sRGBEncoding
		// Set background color
		this.renderer.setClearColor(0xffffff, 1)
		// Set renderer pixel ratio & sizes
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(store.resolution.width, store.resolution.height)
		// Resize renderer on resize event
		this.sizes.on('resize', () => {
			this.renderer.setSize(
				store.resolution.width,
				store.resolution.height
			)
		})

		this.time.on('tick', () => {
			this.renderer.render(this.scene, this.camera.camera)
			if (this.raycaster) this.raycaster.update()
			if (this.debug.stats) this.debug.stats.update()
		})
	}

	setCamera() {
		// Create camera instance
		this.camera = new Camera({
			sizes: this.sizes,
			renderer: this.renderer,
		})
		// Add camera to scene
		this.scene.add(this.camera.container)
	}

	setWorld() {
		// Create world instance
		this.world = new World({
			time: this.time,
			debug: this.debug,
			assets: this.assets,
			camera: this.camera,
		})
		// Add world to scene
		this.scene.add(this.world.container)
	}
}

export const getWebgl = (options) => {
	if (App.instance) return App.instance

	return new App(options)
}
