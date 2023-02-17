// 记录原生方法
const rawWindowAddEventListener = window.addEventListener
const rawWindowRemoveEventListener = window.removeEventListener

function effect(microWindow) {
	// 存储全局事件
	const eventListenerMap = new Map()

	// 重写监听
	microWindow.addEventListener = function (type, listener, options) {
		const listenerList = eventListenerMap.get(type)
		// 非首次监听则添加缓存
		if (listenerList) {
			listenerList.add(listener)
		} else {
			// 首次监听则初始化数据
			eventListenerMap.set(type, new Set([listener]))
		}
		return rawWindowAddEventListener.call(window, type, listener, options)
	}

	// 重写移除监听
	microWindow.removeEventListener = function (type, listener, options) {
		const listenerList = eventListenerMap.get(type)
		// 从缓存中删除监听函数
		if (listenerList?.size && listenerList.has(listener)) {
			listenerList.delete(listener)
		}
		return rawWindowRemoveEventListener.call(window, type, listener, options)
	}

	// 清空残余事件
	return () => {
		console.log('需要卸载的全局事件', eventListenerMap)
		if (eventListenerMap.size) {
			eventListenerMap.forEach((listenerList, type) => {
				if (listenerList.size) {
					for (const listener of listenerList) {
						rawWindowRemoveEventListener.call(window, type, listener)
					}
				}
			})
			eventListenerMap.clear()
		}
	}
}

export default class SandBox {
	// 沙箱是否在运行
	active = false

	// 代理对象
	microWindow = {}

	// 新增加的属性 卸载时清空
	injectedKeys = new Set()

	constructor() {
		// 卸载钩子函数
		this.releaseEffect = effect(this.microWindow)

		this.proxyWindow = new Proxy(this.microWindow, {
			get(target, p) {
				// 优先从代理对象取值
				if (Reflect.has(target, p)) {
					return Reflect.get(target, p)
				}

				// 使用window对象兜底
				const rawValue = Reflect.get(window, p)

				// 兜底值为函数 需要绑定window对象
				if (typeof rawValue === 'function') {
					const valueStr = rawValue.toString()
					// 排除构造函数
					if (!/^function\s+[A-Z]/.test(valueStr) && !/^class\s+/.test(valueStr)) {
						return rawValue.bind(window)
					}
				}
				return rawValue
			},
			set(target, p, newValue, receiver) {
				if (this.active) {
					Reflect.set(target, p, newValue)

					// 记录添加的属性 用于后续清空操作
					this.injectedKeys.add(p)
				}
				return true
			},
			deleteProperty(target, p) {
				// 需要删除的属性存在于代理对象
				if (target.hasOwnProperty(p)) {
					return Reflect.deleteProperty(target, p)
				}
				return true
			}
		})
	}

	start() {
		if (!this.active) {
			this.active = true
		}
	}

	stop() {
		if (this.active) {
			this.active = false

			// 清空属性
			this.injectedKeys.forEach((key) => {
				Reflect.deleteProperty(this.microWindow, key)
			})
			this.injectedKeys.clear()

			this.releaseEffect()
		}
	}

	bindScope(code) {
		window.proxyWindow = this.proxyWindow
		return `;(function(window, self){with(window){;${code}\n}}).call(window.proxyWindow, window.proxyWindow, window.proxyWindow);`
	}
}
