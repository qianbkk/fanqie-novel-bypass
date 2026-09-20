import scriptcss from './assets/script.css?raw';
import { sleep } from './utils';

export default async function inject() {
    while (!document.body) {
        console.log('Waiting for body...');
        await sleep(200);
    }
    GM_addStyle(scriptcss);
    console.log('CSS injected successfully!');
}