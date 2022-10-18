export default {
	input: 'src/main.js',
	output: {
		file: 'main.js',
		format: 'cjs',
	},
	treeshake: {
		moduleSideEffects: false,
		tryCatchDeoptimization: true,
		propertyReadSideEffects: true,
		unknownGlobalSideEffects: true,
	},
}
