import {appInstanceMap} from "./app";

// 发布订阅
class EventCenter {
	// 缓存数据和绑定函数
	eventList = new Map()

	/**
	 * 绑定监听函数
	 * @param name
	 * @param f
	 */
	on(name, f) {
		let eventInfo = this.eventList.get(name)
		if (!eventInfo) {
			eventInfo = {
				data: {},
				callbacks: new Set()
			}
			this.eventList.set(name, eventInfo)
		}
		eventInfo.callbacks.add(f)
	}

	off(name, f) {
		const eventInfo = this.eventList.get(name)
		if (eventInfo && typeof f === 'function') {
			eventInfo.callbacks.delete(f)
		}
	}

	dispatch(name, data) {
		const eventInfo = this.eventList.get(name)
		if (eventInfo && eventInfo.data !== data) {
			eventInfo.data = data
			for (const f of eventInfo.callbacks) {
				f(data)
			}
		}
	}
}

const eventCenter = new EventCenter()

/**
 * 格式化事件名称 保证基座应用和子应用的绑定通信
 * @param appName
 * @param fromBaseApp
 * @returns {string}
 */
function formatEventName(appName, fromBaseApp) {
	if (typeof appName !== 'string'|| !appName) return ''
	return fromBaseApp ? `__from_base_app_${appName}__` : `__from_micro_app_${appName}__`
}


export class EventCenterForBaseApp {
	/**
	 * 向指定子应用发送数据
	 * @param appName
	 * @param data
	 */
	setData(appName, data) {
		eventCenter.dispatch(formatEventName(appName, true), data)
	}

	/**
	 * 清空某个应用的监听函数
	 * @param appName
	 */
	clearDataListener(appName) {
		eventCenter.off(formatEventName(appName, false))
	}
}

export class EventCenterForMicroApp {
	constructor(appName) {
		this.appName = appName
	}

	/**
	 * 监听基座应用发送的数据
	 * @param cb
	 */
	addDataListener(cb) {
		eventCenter.on(formatEventName(this.appName, true), cb)
	}

	/**
	 * 解除监听函数
	 * @param cb
	 */
	removeDataListener(cb) {
		if (typeof cb === 'function') {
			eventCenter.off(formatEventName(this.appName, true), cb)
		}
	}

	/**
	 * 向基座应用发送数据
	 * @param data
	 */
	dispatch(data) {
		const app = appInstanceMap.get(this.appName)
		if (app?.container) {
			// 以自定义事件的形式发送
			const event = new CustomEvent('datachange', {
				detail: {
					data
				}
			})
			app.container.dispatchEvent(event)
		}
	}

	clearDataListener() {
		eventCenter.off(formatEventName(this.appName, true))
	}
}
