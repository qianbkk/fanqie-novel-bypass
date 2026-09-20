// 章内注释（EPUB footnote）处理。
//
// 番茄的正文 XHTML 里，注释引用长这样：
//   <a epub:type="noteref" href="#a1"><img class="bdFootnote" src="$bdFootnote"/></a>
// 注释内容集中放在正文末尾：
//   <section epub:type="footnotes"><aside epub:type="footnote" id="a1">…</aside></section>
//
// 直接渲染有几个问题：
//   1. src="$bdFootnote" 是占位符不是真实图片，会变成裂图；页面自带的
//      `.bdFootnote{display:none}` 又会把它整个藏掉，导致注释标记看不见；
//   2. <aside> 全堆在文末，且顺序和正文引用顺序不一致（实测某章引用顺序是
//      a1,2,3,4,a2,a3,5，而 aside 顺序是 a1,a2,a3,2,3,4,5）；
//   3. 点击 href="#a1" 会改 URL hash，触发脚本自身的 hashchange 路由。
//
// 这里把标记替换成可见的上标序号，按正文引用顺序重新编号，并支持点击/悬浮
// 查看，同时保留文末的注释列表作为兜底。

/** 注释区块与标记的类名 */
export const FOOTNOTE_CLASS = 'fqa-footnote'
export const FOOTNOTE_REF_CLASS = 'fqa-footnote-ref'
export const FOOTNOTE_LIST_CLASS = 'fqa-footnote-list'

/**
 * 按属性名 + 属性值筛选元素。
 *
 * 不能用 `[epub\:type="footnote"]` 这类选择器：HTML 解析下 `epub:type` 是一个
 * 含冒号的普通属性名，CSS 无法表达，浏览器会直接抛 SyntaxError（已实测）。
 * 所以退化成遍历 + getAttribute。
 */
function byAttr(root: ParentNode, tag: string, attr: string, value?: string): Element[] {
    return [...root.querySelectorAll(tag)].filter((el) => {
        const v = el.getAttribute(attr)
        if (v === null) return false
        return value === undefined || v === value
    })
}

/**
 * 处理容器内的章内注释。就地修改传入的元素。
 *
 * @returns 处理到的注释条数
 */
export function processFootnotes(root: ParentNode): number {
    const notes = new Map<string, string>() // id -> 注释 HTML
    const sections = byAttr(root, 'section', 'epub:type', 'footnotes')

    for (const section of sections) {
        for (const aside of section.querySelectorAll('aside')) {
            const id = aside.getAttribute('id')
            if (id) notes.set(id, aside.innerHTML.trim())
        }
    }

    // 没有 <section> 包裹时，兜一遍散落的 aside
    if (notes.size === 0) {
        for (const aside of byAttr(root, 'aside', 'epub:type', 'footnote')) {
            const id = aside.getAttribute('id')
            if (id) notes.set(id, aside.innerHTML.trim())
        }
    }

    // 标记：优先按 epub:type=noteref，退回到"内含 bdFootnote 图片的锚点"
    const collectRefs = (scope: ParentNode): Element[] => {
        const set = new Set<Element>(byAttr(scope, 'a', 'epub:type', 'noteref'))
        for (const img of scope.querySelectorAll('img.bdFootnote')) {
            const a = img.closest('a[href^="#"]')
            if (a && scope.contains(a)) set.add(a)
        }
        // 保持文档顺序
        return [...scope.querySelectorAll('a')].filter((a) => set.has(a))
    }

    // 只处理正文里的标记：注释区内部的引用（注释套注释）留到后面单独处理，
    // 否则它们会随 <section> 一起被删掉而丢失编号
    const inSection = (el: Element) => sections.some((s) => s.contains(el))
    const refs = collectRefs(root).filter((a) => !inSection(a))

    if (refs.length === 0 && notes.size === 0) return 0

    // 按正文中出现的顺序重新编号
    const ordered: Array<{ num: number; text: string }> = []
    const numberOf = new Map<string, number>() // note id -> 序号
    let counter = 0

    const makeSup = (num: number, text: string): HTMLElement => {
        const sup = document.createElement('sup')
        sup.className = FOOTNOTE_REF_CLASS
        sup.textContent = String(num)
        sup.setAttribute('role', 'button')
        sup.setAttribute('tabindex', '0')
        // title 作为无脚本兜底：原生 tooltip
        sup.title = stripTags(text)
        return sup
    }

    refs.forEach((ref) => {
        const href = ref.getAttribute('href') ?? ''
        const id = href.startsWith('#') ? href.slice(1) : ''
        const text = notes.get(id)
        if (text === undefined) return

        counter += 1
        numberOf.set(id, counter)
        ordered.push({ num: counter, text })
        ref.replaceWith(makeSup(counter, text))
    })

    // 未被正文直接引用的注释（例如注释里套的注释）也要收录，序号接在后面
    for (const [id, text] of notes) {
        if (numberOf.has(id)) continue
        counter += 1
        numberOf.set(id, counter)
        ordered.push({ num: counter, text })
    }

    // 重建文末注释列表（按新序号排序，去掉 epub 语义标签）
    for (const section of sections) section.remove()

    if (ordered.length > 0) {
        const list = document.createElement('ol')
        list.className = FOOTNOTE_LIST_CLASS
        for (const { num, text } of ordered) {
            const li = document.createElement('li')
            li.id = `fqa-fn-${num}`
            li.innerHTML = text
            // 注释文本里可能又引用了别的注释，同样替换成上标序号
            for (const inner of collectRefs(li)) {
                const innerId = (inner.getAttribute('href') ?? '').replace(/^#/, '')
                const innerNum = numberOf.get(innerId)
                const innerText = notes.get(innerId)
                if (innerNum && innerText !== undefined) {
                    inner.replaceWith(makeSup(innerNum, innerText))
                } else {
                    inner.remove()
                }
            }
            list.appendChild(li)
        }
        const wrapper = document.createElement('section')
        wrapper.className = FOOTNOTE_CLASS
        const heading = document.createElement('div')
        heading.className = 'fqa-footnote-title'
        heading.textContent = '注释'
        wrapper.appendChild(heading)
        wrapper.appendChild(list)
        root.appendChild(wrapper)
    }

    // 清理没有配对上的残留标记（避免留下裂图）
    for (const img of root.querySelectorAll('img.bdFootnote')) img.remove()

    return ordered.length
}

/** 取纯文本，供 title 属性使用 */
function stripTags(html: string): string {
    const el = document.createElement('div')
    el.innerHTML = html
    return (el.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * 兜底：让注释区跟随网页的字号设置。
 *
 * 页面通过外层 .muye-reader-content-N 控制阅读字号，但规则只作用在 `... p` 上
 * （`.muye-reader-content-32 p{font-size:3.2rem}`）。注释区是 <p> 的兄弟节点，
 * 拿不到这个字号，em 会退回根字号——实测 16 档和 32 档都停在 8.5px。
 *
 * 已知的 5 个档位由 script.css 里的规则直接覆盖（纯 CSS，切换即时生效）。
 * 这里只处理"页面新增了未知档位"的情况：此时 CSS 命中不到，
 * 才用正文实际字号写入 --fqa-body-size 兜底。
 */
const KNOWN_TIERS = /muye-reader-content-(16|20|24|28|32)\b/

export function syncFootnoteFontSize(container: HTMLElement): void {
    const box = container.closest('[class*="muye-reader-content-"]')

    const apply = () => {
        // 已知档位交给 CSS，内联变量会盖掉档位规则并在切换时残留旧值，
        // 所以必须清掉
        container.style.removeProperty('--fqa-body-size')
        if (!box || KNOWN_TIERS.test(box.className)) return

        const p = container.querySelector('p')
        if (!p) return
        const size = getComputedStyle(p).fontSize
        if (size) container.style.setProperty('--fqa-body-size', size)
    }
    apply()

    if (!box) return
    const holder = container as HTMLElement & { fqaFontObserver?: MutationObserver }
    if (holder.fqaFontObserver) return
    // 用户改字号时页面会换掉外层容器的 class，监听后重新判断
    const observer = new MutationObserver(apply)
    observer.observe(box, { attributes: true, attributeFilter: ['class'] })
    holder.fqaFontObserver = observer
}

/**
 * 绑定注释的点击交互：点上标滚动到对应注释并高亮。
 * 用事件委托，容器内容更新后无需重新绑定。
 */
export function bindFootnoteInteraction(container: HTMLElement): void {
    syncFootnoteFontSize(container)
    if (container.dataset.fqaFootnoteBound === '1') return
    container.dataset.fqaFootnoteBound = '1'

    const activate = (sup: HTMLElement) => {
        const num = sup.textContent?.trim()
        if (!num) return
        const target = container.querySelector(`#fqa-fn-${num}`)
        if (!target) return
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.classList.add('fqa-footnote-active')
        setTimeout(() => target.classList.remove('fqa-footnote-active'), 1600)
    }

    container.addEventListener('click', (e) => {
        const sup = (e.target as HTMLElement)?.closest?.(`.${FOOTNOTE_REF_CLASS}`)
        if (sup) {
            e.preventDefault()
            activate(sup as HTMLElement)
        }
    })
    container.addEventListener('keydown', (e) => {
        const ke = e as KeyboardEvent
        if (ke.key !== 'Enter' && ke.key !== ' ') return
        const sup = (ke.target as HTMLElement)?.closest?.(`.${FOOTNOTE_REF_CLASS}`)
        if (sup) {
            ke.preventDefault()
            activate(sup as HTMLElement)
        }
    })
}
