const localStorage = unsafeWindow.localStorage

export function write(key: string, value: any) {
    GM_setValue(key, JSON.stringify(value))
}

export function read(key: string) {
    return JSON.parse(GM_getValue(key) || 'null')
}

export function del(key: string) {
    GM_deleteValue(key)
}

export function writePage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
}

export function readPage(key: string) {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
}

export function delPage(key: string) {
    localStorage.removeItem(key)
}

export function getCookie(key: string) {
    return document.cookie.split(';').find(c => c.trim().startsWith(key + '='))?.split('=')[1] || null
}

