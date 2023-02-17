import loadHtml from "./source";
import SandBox from "./sandbox";

export const appInstanceMap = new Map()

export default class CreatApp {
	constructor({name, url, container}) {
		this.name = name
		this.url = url
		this.container = container
		this.status = 'loading'
		this.sandbox = new SandBox(name)
		loadHtml(this)
	}

	// 组件状态 包括 created/loading/mount/unmount
	status = 'created'

	// 存放应用静态资源
	source = {
		links: new Map(),
		scripts: new Map()
	}

	// 资源加载完时执行
	onLoad(htmlDom) {
		this.loadCount = this.loadCount ? this.loadCount + 1 : 1
		// 第二次执行且组件未卸载执行挂载
		if (this.loadCount === 2 && this.status !== 'unmount') {
			// 记录DOM结构
			this.source.html = htmlDom
			this.mount()
		}
	}

	// 资源加载完后进行挂载
	mount() {
		// 克隆DOM节点
		const cloneHtml = this.source.html.cloneNode(true)
		const fragment = document.createDocumentFragment()
		Array.from(cloneHtml.childNodes).forEach(node => {
			fragment.appendChild(node)
		})

		this.container.appendChild(fragment)

		this.sandbox.start()

		// 执行JS
		this.source.scripts.forEach(info => {
			// (0, eval)(info.code)
			(0, eval)(this.sandbox.bindScope(info.code))
		})

		this.status = 'mounted'
	}

	// 卸载应用
	unMount(destroy) {
		this.status = 'unmount'
		this.container = null
		this.sandbox.stop()
		if (destroy) {
			appInstanceMap.delete(this.name)
		}
	}
}
