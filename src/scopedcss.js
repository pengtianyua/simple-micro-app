let templateStyle

/**
 * 样式隔离
 * @param {HTMLStyleElement} styleElement style元素
 * @param {string} appName 应用名称
 */
export default function scopedCSS(styleElement, appName) {
	// 前缀
	const prefix = `micro-app[name=${appName}]`

	// 初始化创建模板标签
	if (!templateStyle) {
		templateStyle = document.createElement('style')
		document.body.appendChild(templateStyle)
		// 设置样式表无效 防止对应用造成影响
		templateStyle.sheet.disabled = true // https://developer.mozilla.org/zh-CN/docs/Web/API/StyleSheet
	}

	if (styleElement.textContent) {
		templateStyle.textContent = styleElement.textContent
		// 格式化规则 并将格式化后的规则赋值给style元素
		styleElement.textContent = scopedRule(Array.from(templateStyle.sheet?.cssRules ?? []), prefix)
		templateStyle.textContent = ''
	} else {
		const observer = new MutationObserver(() => {
			observer.disconnect()
			styleElement.textContent = scopedRule(Array.from(styleElement.sheet?.cssRules ?? []), prefix)
		})
		observer.observe(styleElement, {childList: true})
	}
}

/**
 * 处理每个cssRule
 * @param rules cssRule
 * @param prefix
 * @returns {string}
 */
function scopedRule(rules, prefix) {
	let result = ''
	for (const rule of rules) {
		// https://developer.mozilla.org/en-US/docs/Web/API/CSSRule/type
		switch (rule.type) {
			case 1: // STYLE_RULE
				result += scopedStyleRule(rule, prefix)
				break
			case 4: // MEDIA_RULE
				result += scopedPackRule(rule, prefix, 'media')
				break
			case 12: // SUPPORTS_RULE
				result += scopedPackRule(rule, prefix, 'supports')
				break
			default:
				result += rule.cssText
				break
		}
	}
	return result
}

/**
 * 处理media和supports规则
 * @param rule
 * @param prefix
 * @param packName
 * @returns {string}
 */
function scopedPackRule(rule, prefix, packName) {
	// 递归处理 media 和 supports 内部规则
	const result = scopedRule(Array.from(rule.cssRules), prefix)
	// https://developer.mozilla.org/en-US/docs/Web/API/CSSConditionRule
	return `@${packName} ${rule.conditionText} {${result}}`
}

/**
 * 修改CSS规则 添加前缀
 * @param {CSSRule} rule
 * @param {string} prefix
 * @returns {string}
 */
function scopedStyleRule(rule, prefix) {
	// 获取CSS规则对象的选择器和内容
	const {selectorText, cssText} = rule

	// 处理顶层选择器 如 body html 都转换为 micro-app[name=xxx]
	if (/^((html[\s>~,]+body)|(html|body|:root))$/.test(selectorText)) {
		return cssText.replace(/^((html[\s>~,]+body)|(html|body|:root))/, prefix)
	} else if (selectorText === '*') {
		// 选择器 * 替换为 micro-app[name=xxx] *
		return cssText.replace('*', `${prefix} *`)
	}

	const builtInRootSelectorRE = /(^|\s+)((html[\s>~]+body)|(html|body|:root))(?=[\s>~]+|$)/

	// 匹配查询选择器
	return cssText.replace(/^[\s\S]+{/, (selectors) => {
		return selectors.replace(/(^|,)([^,]+)/g, (all, $1, $2) => {
			// 如果含有顶层选择器，需要单独处理
			if (builtInRootSelectorRE.test($2)) {
				// body[name=xx]|body.xx|body#xx 等都不需要转换
				return all.replace(builtInRootSelectorRE, prefix)
			}
			// 在选择器前加上前缀
			return `${$1} ${prefix} ${$2.replace(/^\s*/, '')}`
		})
	})
}
