import {fetchSource} from "./utils";
import scopedCSS from "./scopedcss";

export default function loadHtml(app) {
	fetchSource(app.url).then(html => {
		html = html
			.replace(/<head[^>]*>[\s\S]*?<\/head>/i, (match) => {
				// 替换head标签 web页面只允许有一个head标签
				return match
					.replace(/<head/i, '<micro-app-head')
					.replace(/<\/head>/i, '</micro-app-head')
		})
			.replace(/<body[^>]*>[\s\S]*?<\/body>/i, (match) => {
				// 将body标签替换为micro-app-body，防止与基座应用的body标签重复导致的问题。
				return match
					.replace(/<body/i, '<micro-app-body')
					.replace(/<\/body>/i, '</micro-app-body>')
			})
		const htmlDom = document.createElement('div')
		htmlDom.innerHTML = html
		console.log('html:', htmlDom)

		// 提取和处理 js css
		extractSourceDom(htmlDom, app)

		// 获取微应用head标签
		const microAppHead = htmlDom.querySelector('micro-app-head')
		if (app.source.links.size) {
			// 远程css资源 进行请求
			fetchLinksFromHtml(app, microAppHead, htmlDom)
		} else {
			app.onLoad(htmlDom)
		}
		if (app.source.scripts.size) {
			// 远程js资源 进行请求
			fetchScriptsFromHtml(app, microAppHead, htmlDom)
		} else {
			app.onLoad(htmlDom)
		}
	}).catch(e => {
		console.log('加载html出错', e)
	})
}

/**
 *
 * @param parent
 * @param app
 */
function extractSourceDom(parent, app) {
	const children = Array.from(parent.children)
	// 递归每一个子元素
	children.length && children.forEach(child => {
		extractSourceDom(child, app)
	})
	for (const child of children) {
		if (child instanceof HTMLLinkElement) {
			// 提取css地址
			const href = child.getAttribute('href')
			if (child.getAttribute('rel') === 'stylesheet' && href) {
				// 存入缓存
				app.source.links.set(href, {
					code: ''
				})
			}
			parent.removeChild(child)
		} else if (child instanceof HTMLScriptElement) {
			// 提取js地址
			const src = child.getAttribute('src')
			if (src) {
				app.source.scripts.set(src, {
					code: '',
					isExternal: true
				})
			} else if (child.textContent) {
				// 内联script标签
				const nodeStr = Math.random().toString(36).substring(2, 15)
				app.source.scripts.set(nodeStr, {
					code: child.textContent,
					isExternal: false
				})
			}
			parent.removeChild(child)
		} else if (child instanceof HTMLStyleElement) {
			// 样式隔离
			scopedCSS(child, app.name)
		}
	}
}

/**
 * 获取link远程资源
 * @param app
 * @param microAppHead
 * @param htmlDom
 */
export function fetchLinksFromHtml(app, microAppHead, htmlDom) {
	const linkEntries = Array.from(app.source.links.entries())
	const fetchLinkPromise = []
	for (const [url] of linkEntries) {
		fetchLinkPromise.push(fetchSource(url))
	}
	Promise.all(fetchLinkPromise).then((res) => {
		for (let i = 0; i < res.length; i++) {
			const code = res[i]
			const link2Style = document.createElement('style')
			link2Style.textContent = code
			scopedCSS(link2Style, app.name)
			microAppHead.appendChild(link2Style)
			linkEntries[i][1].code = code
		}
		app.onLoad(htmlDom)
	}).catch(e => {
		console.error('加载css出错', e)
	})
}

/**
 * 获取js资源
 * @param app
 * @param microAppHead
 * @param htmlDom
 */
export function fetchScriptsFromHtml(app, microAppHead, htmlDom) {
	const scriptEntries = Array.from(app.source.scripts.entries())
	const fetchScriptPromise = []
	for (const [url, info] of scriptEntries) {
		// 内联script不需要请求资源
		fetchScriptPromise.push(info.code ? Promise.resolve(info.code) : fetchSource(url))
	}
	Promise.all(fetchScriptPromise).then((res) => {
		for (let i = 0; i < res.length; i++) {
			scriptEntries[i][1].code = res[i]
		}
		app.onLoad(htmlDom)
	}).catch(e => {
		console.error('加载js出错', e)
	})
}
