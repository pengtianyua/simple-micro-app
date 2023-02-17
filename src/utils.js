/**
 * 获取静态资源
 * @param url 静态资源地址
 * @returns {Promise<string>}
 * 浏览器自带且支持promise 要求子应用静态资源支持跨域访问
 */
export function fetchSource(url) {
	return fetch(url).then((res) => {
		return res.text()
	})
}
