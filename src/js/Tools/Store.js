const store = {
	resolution: {
		width: window.innerWidth,
		height: window.innerHeight,
		dpr: 1,
	},

	aspect: {
		ratio: 0,

		a1: 0,
		a2: 0,
	},

	style: null,
	device: null,
	browser: null,

	views: null,

	started: false,
	hasLost: false,
	isFusion: false,
	startTime: null,

	virtualKeyboardOpen: false,
	canRestart: false,

	messageFusion: false,
}

export { store }
