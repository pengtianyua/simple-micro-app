import { defineElement } from "./element"
import {EventCenterForBaseApp} from "./data";

const SimpleMicroApp = {
    start() {
        defineElement()
    }
}

const BaseAppData = new EventCenterForBaseApp()

const rawSetAttribute = Element.prototype.setAttribute

Element.prototype.setAttribute = function setAttribute(key, value) {
    // 目标位micro-app标签且属性名称为data时候处理
    if (/^micro-app/i.test(this.tagName) && key === 'data') {
        if (toString.call(value) === '[object Object]') {
            const cloneValue = {}
            Object.getOwnPropertyNames(value).forEach(propertyKey => {
                // 过滤框架注入的数据
                if (!(typeof propertyKey === 'string' && propertyKey.indexOf('__') === 0)) {
                    cloneValue[propertyKey] = value[propertyKey]
                }
            })
            BaseAppData.setData(this.getAttribute('name'), cloneValue)
        }
    } else {
        rawSetAttribute.call(this, key, value)
    }
}

export default SimpleMicroApp
