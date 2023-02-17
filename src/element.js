import CreatApp, {appInstanceMap} from "./app";

// https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements
class MyElement extends HTMLElement {
    // 需要监听的属性名 变换会触发 attributeChangedCallback
    static get observedAttributes() {
        return ['name', 'url']
    }

    constructor() {
        super()
    }

    // 元素插入到文档DOM时触发
    connectedCallback() {
        console.log('micro-app is connected');
        // 创建微应用实例
        const app = new CreatApp({
            name: this.name,
            url: this.url,
            container: this
        })

        // 存入缓存
        appInstanceMap.set(this.name, app)
    }

    // 元素从文档DOM中删除时触发
    disconnectedCallback() {
        console.log('micro-app has disconnected');
        const app = appInstanceMap.get(this.name)
        app.unMount(this.hasAttribute('destroy'))
    }

    // 元素增加、删除、修改自身属性时触发
    attributeChangedCallback(attrName, oldVal, newVal) {
        console.log(`attribute ${attrName}: ${newVal}`);
        // 分别记录属性值
        if (attrName === 'name' && !this.name && newVal) {
           this.name = newVal
        } else if (attrName === 'url' && !this.url && newVal) {
            this.url = newVal
        }
    }
}

export function defineElement() {
    // 重复定义判断
    if (!window.customElements.get('micro-app')) {
        // 注册元素 像标签一样使用
        window.customElements.define('micro-app', MyElement)
    }
}
