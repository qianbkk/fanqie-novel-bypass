import apiFetch from '../utils/request'
import { getCookie } from '../localStorage'
import config from '../config'

/* 
  关于 baseUrl: 
   - baseUrl 是番茄小说旗下红烛小说的接口，与番茄数据基本通用。
   - 但与番茄小说相比，红烛小说的 API 风控更低，不要签名。
   - 该为第一方 API 而非第三方，所以请注意这一点。
   - 之后如果遇到一些功能需要把 Cookie 传到这里的，请不要来造谣“这个脚本把你的凭据发给了第三方”之类的。
   - 本项目重视您的账号数据安全，不会泄露您的账号数据，接受大家审查。
*/
export const baseUrl = 'https://api5-sinfonlinec.jxbhmy.com/redcandle/search';
export const baseQuery = {
    aid: '1967',
    app_name: 'novelapp'
}

export async function get(path: string, cookie?: boolean, query?: any, headers?: any, optionsOverride?: any): Promise<any> {
    let url = baseUrl + path;
    const sessid = getCookie('sessionid')
    let ck = sessid ? `sessionid=${sessid}` : ''
    const h = {
        Cookie: cookie ? ck : '',
        ...headers
    }
    const deviceQuery = {
        device_id: config.currentConfig.device_id,
        iid: config.currentConfig.install_id,
    }
    const finalQuery = {
        ...baseQuery,
        ...deviceQuery,
        ...query
    }
    url += '?' + new URLSearchParams(finalQuery).toString();
    const options = {
        method: 'GET',
        headers: h,
        ...optionsOverride
    }
    console.log('---start--- GET ', url, options)
    const res = await apiFetch(url, options)
    console.log('---complete--- GET ', url, res)
    return res
}

export async function post(path: string, cookie?: boolean, query?: any, body?: any, headers?: any, optionsOverride?: any): Promise<any> {
    let url = baseUrl + path;
    const sessid = getCookie('sessionid')
    let ck = sessid ? `sessionid=${sessid}` : ''
    const h = {
        Cookie: cookie ? ck : '',
        ...headers
    }
    const deviceQuery = {
        device_id: config.currentConfig.device_id,
        iid: config.currentConfig.install_id,
    }
    const finalQuery = {
        ...baseQuery,
        ...deviceQuery,
        ...query
    }
    url += '?' + new URLSearchParams(finalQuery).toString();
    const options = {
        method: 'POST',
        headers: h,
        body: body,
        ...optionsOverride
    }
    console.log('---start--- POST ', url, options)
    const res = await apiFetch(url, options)
    console.log('---complete--- POST ', url, res)
    return res
}
