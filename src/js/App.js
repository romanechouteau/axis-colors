import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { EffectComposer } from './PostProcess/EffectComposer'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { Scene, sRGBEncoding, WebGLRenderer, ShaderMaterial } from 'three'

import AmbientLightSource from './World/lights/AmbientLight'
import PointLightSource from './World/lights/PointLight'

import Camera from './Camera'
import World from './World'

import { store } from './Tools/Store'

import dangerVertShader from '../shaders/dangerVert.glsl'
import dangerFragShader from '../shaders/dangerFrag.glsl'

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

		// WORLD
		this.setRenderer()
		this.setCamera()
		this.setPostProcessing()
		this.setWorld()
		this.setLights()

		// UI
		this.setScreens()
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
		this.renderer.setPixelRatio(1)
		this.renderer.setSize(store.resolution.width, store.resolution.height)
		// Resize renderer on resize event
		this.sizes.on('resize', () => {
			this.renderer.setSize(
				store.resolution.width,
				store.resolution.height
			)
		})
	}

	setPostProcessing() {
		this.composer = new EffectComposer(this.renderer)

		const renderScene = new RenderPass(this.scene, this.camera.camera)

		const gammaCorrection = new ShaderPass(GammaCorrectionShader)

		this.dangerPass = new ShaderPass(
			new ShaderMaterial({
				uniforms: {
					baseTexture: {
						value: null,
					},
					uProgress: {
						value: 0,
					},
				},
				vertexShader: dangerVertShader,
				fragmentShader: dangerFragShader,
				defines: {},
			}),
			'baseTexture'
		)
		this.dangerPass.needsSwap = true

		this.composer.addPass(renderScene)
		this.composer.addPass(gammaCorrection)
		this.composer.addPass(this.dangerPass)

		this.time.on('tick', () => {
			this.composer.render()
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
			dangerPass: this.dangerPass,
		})
		// Add world to scene
		this.scene.add(this.world.container)
	}

	setLights() {
		// LIGHTS
		this.ambientlight = new AmbientLightSource()
		this.scene.add(this.ambientlight.container)

		this.light = new PointLightSource()
		this.scene.add(this.light.container)
	}

	setScreens() {
		document.getElementById('start').style.display = 'block'
		document.getElementById('end').style.display = 'block'

		document.getElementById('lives').style.display = 'flex'
		document.getElementById('colors').style.display = 'block'
		document.getElementById('sync').style.display = 'block'
		document.getElementById('buttons').style.display = 'block'
	}
}

export const getWebgl = (options) => {
	if (App.instance) return App.instance

	return new App(options)
}
