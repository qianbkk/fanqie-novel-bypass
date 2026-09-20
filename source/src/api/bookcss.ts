// 书籍随正文下发的 CSS 处理。
//
// 番茄的正文 XHTML 会 <link> 到 Styles/main.css 之类的样式表，真实地址在
// novel_data.css_map（JSON 字符串，形如 {"Styles/main.css":"novel-static/xxx"}）。
// 这些样式表是给 EPUB 阅读器用的，直接注入页面会有两个问题：
//   1. 里面有 `body{font-family:宋体;color:#000000}` 这类元素级规则，会命中页面的
//      <body>，把整站字体和颜色改掉，深色模式直接失效；
//   2. `a{text-decoration:none}` 这类裸标签选择器会污染正文以外的元素。
// 所以统一做作用域重写，把所有选择器限制在正文容器内。

/** css_uri 的 CDN 前缀 */
const CDN_PREFIX = 'https://p3-novel.byteimg.com/origin/'

/** uri -> css 文本 */
const cssCache = new Map<string, string>()

/** 去掉 CSS 注释 */
function stripComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * 把单条选择器限定到容器内。
 * body / html 映射为容器自身，其余作为后代选择器。
 *
 * 容器选择器包在 :where() 里，特异性归零——否则 `#fqa-reader-content .body`
 * 是 (1,1,0)，会压过页面控制字号的 `.muye-reader-content-16 p` (0,1,1)，
 * 导致网页的字体大小调节（16/20/24/28/32）失效。包上之后书籍样式只在
 * 页面没有对应规则时生效，字号调节始终归页面管。
 */
function scopeSelector(selector: string, scope: string): string {
    const s = selector.trim()
    if (!s) return ''
    const where = `:where(${scope})`
    if (/^(body|html|:root)$/i.test(s)) return where
    // body.foo / html>p 这类以 body/html 开头的，替换掉开头部分
    const m = s.match(/^(body|html)\b([\s\S]*)$/i)
    if (m) return `${where}${m[2]}`
    return `${where} ${s}`
}

/**
 * 容器自身的规则需要额外去掉两类声明：
 * - color / background：会压过页面主题，深色模式下变成黑字
 * - font-size：书籍样式里是 `font-size:100%` 这种绝对基准，会把 em 的
 *   计算基准钉死在默认字号上，页面调大字号后正文不跟着变
 */
function stripRootDecls(body: string): string {
    return body
        .split(';')
        .filter((decl) => !/^\s*(color|background|background-color|font-size)\s*:/i.test(decl))
        .join(';')
}

/**
 * 将一段 CSS 的所有选择器限定到 scope 内。
 *
 * 逐字符扫描而不是单条正则：@font-face / @media 的 prelude 不是选择器，
 * 不能被加上前缀，@media 内部的规则则仍需要处理。
 */
export function scopeCss(css: string, scope: string): string {
    const src = stripComments(css)
    let out = ''
    let buf = ''
    let i = 0

    while (i < src.length) {
        const ch = src[i]!

        if (ch === '{') {
            const prelude = buf.trim()
            buf = ''
            i++

            if (prelude.startsWith('@')) {
                if (/^@(media|supports|document)\b/i.test(prelude)) {
                    // 条件组：prelude 原样保留，内部递归处理
                    const inner = readBlock(src, i)
                    out += `${prelude}{${scopeCss(inner.text, scope)}}`
                    i = inner.end
                } else {
                    // @font-face / @keyframes 等：整块原样保留
                    const inner = readBlock(src, i)
                    out += `${prelude}{${inner.text}}`
                    i = inner.end
                }
                continue
            }

            // 普通规则
            const inner = readBlock(src, i)
            const selectors = prelude
                .split(',')
                .map((s) => scopeSelector(s, scope))
                .filter(Boolean)
            const isRoot = selectors.length === 1 && selectors[0] === `:where(${scope})`
            const declarations = isRoot ? stripRootDecls(inner.text) : inner.text
            if (selectors.length && declarations.trim()) {
                out += `${selectors.join(',')}{${declarations}}`
            }
            i = inner.end
            continue
        }

        // @import 之类的独立语句直接丢弃，避免把外部样式拉进页面
        if (ch === ';' && buf.trim().startsWith('@')) {
            buf = ''
            i++
            continue
        }

        buf += ch
        i++
    }

    return out
}

/** 从 start（'{' 之后）读到配对的 '}'，返回块内文本与结束位置 */
function readBlock(src: string, start: number): { text: string; end: number } {
    let depth = 1
    let i = start
    while (i < src.length && depth > 0) {
        const c = src[i]!
        if (c === '{') depth++
        else if (c === '}') depth--
        if (depth === 0) break
        i++
    }
    return { text: src.slice(start, i), end: Math.min(i + 1, src.length) }
}

/** 解析 css_map（JSON 字符串）为 { 文件名: uri } */
export function parseCssMap(cssMap: unknown): Record<string, string> {
    if (!cssMap || typeof cssMap !== 'string') return {}
    try {
        const parsed = JSON.parse(cssMap)
        return parsed && typeof parsed === 'object' ? parsed as Record<string, string> : {}
    } catch {
        return {}
    }
}

/** 按 uri 拉取样式表，带内存缓存 */
async function fetchCss(uri: string): Promise<string> {
    const cached = cssCache.get(uri)
    if (cached !== undefined) return cached
    try {
        // CDN 自带 Access-Control-Allow-Origin: *，直接用原生 fetch 即可，
        // 不需要 GM_xmlhttpRequest，也就不必在 @connect 里声明这个域名
        const res = await fetch(CDN_PREFIX + uri)
        const text = res.ok ? await res.text() : ''
        cssCache.set(uri, text)
        return text
    } catch (e) {
        console.warn('获取书籍样式表失败:', uri, e)
        cssCache.set(uri, '')
        return ''
    }
}

/**
 * 取出某本书的正文样式，并限定到 scope 选择器内。
 *
 * 注意 css_map 只覆盖了一部分样式表：正文里常见的 Styles/bd_stylesheet.css
 * 通常不在 map 里，服务端也没给地址，只能忽略——它对应的是番茄自带的
 * 基础排版，缺失时靠页面本身的样式兜底即可。
 *
 * @param cssMap novel_data.css_map 原始值
 * @param scope 正文容器选择器，如 '#fqa-reader-content'
 */
export async function getScopedBookCss(cssMap: unknown, scope: string): Promise<string> {
    const map = parseCssMap(cssMap)
    const uris = Object.values(map).filter(Boolean)
    if (uris.length === 0) return ''

    const sheets = await Promise.all(uris.map(fetchCss))
    return sheets
        .filter(Boolean)
        .map((css) => scopeCss(css, scope))
        .join('\n')
}

/**
 * 把书籍样式注入页面（同一 book 只注入一次，切书时替换）。
 *
 * @returns 是否成功注入了非空样式
 */
export async function applyBookCss(
    cssMap: unknown,
    scope: string,
    styleId = 'fqa-book-style',
): Promise<boolean> {
    const css = await getScopedBookCss(cssMap, scope)
    let el = document.getElementById(styleId) as HTMLStyleElement | null
    if (!css) {
        el?.remove()
        return false
    }
    if (!el) {
        el = document.createElement('style')
        el.id = styleId
        document.head.appendChild(el)
    }
    el.textContent = css
    return true
}
