import './scss/main.scss'
// Tools
import Sizes from './js/Tools/Sizes.js'
import Time from './js/Tools/Time.js'
import Assets from './js/Tools/Loader.js'
// App
import App from './js/App'

/// #if DEBUG
console.log('🚧 Debug 🚧')
/// #endif

// LOADER UI
const loader = `
<div class="loaderScreen">
  <div class="loaderScreen__progressBar">
    <div class="loaderScreen__progress"></div>
  </div>
  <h1 class="loaderScreen__load">0%</h1>
  <div class="loaderScreen__progressBar">
    <div class="loaderScreen__progress"></div>
  </div>
</div>
`

// SET TOOLS
const time = new Time()
const sizes = new Sizes()
const assets = new Assets({
	template: loader,
})

// SET APP
new App({
	canvas: document.querySelector('#_canvas'),
	time: time,
	sizes: sizes,
	assets: assets,
})
