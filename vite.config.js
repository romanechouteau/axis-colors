import { defineConfig } from 'vite'
import { glslify } from 'vite-plugin-glslify'
import ifdefRollupPlugin from './config/ifdef/ifdefRollupPlugin'
import handlebars from 'vite-plugin-handlebars'

export default ({}) => {
	const define = { DEBUG: true }
	return defineConfig({
		server: {
			port: '8080',
			https: false,
			open: false,
			host: true,
			hmr: {
				port: 8080,
			},
		},

		resolve: {
			extensions: ['.cjs', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
		},

		plugins: [
			glslify(),
			ifdefRollupPlugin(define),
			handlebars({ reloadOnPartialChange: false }),
		],
		assetsInclude: ['**/*.glb', '**/*.gltf'],
	})
}
