
window.__importKeyStats = { rejected: 0, accepted: 0 };
const __origIK = window.crypto.subtle.importKey.bind(window.crypto.subtle);
window.crypto.subtle.importKey = async function(format, keyData, ...rest){
  if (format === 'raw' && keyData instanceof ArrayBuffer) {
    window.__importKeyStats.rejected++;
    throw new TypeError("Key data must be a BufferSource for non-JWK formats.");
  }
  const r = await __origIK(format, keyData, ...rest);
  if (format === 'raw') window.__importKeyStats.accepted++;
  return r;
};
window.__userjsErrors = [];
window.addEventListener('error', e => window.__userjsErrors.push(String(e.error || e.message)));
window.addEventListener('unhandledrejection', e => window.__userjsErrors.push('unhandledrejection: ' + String(e.reason)));


(function(){
  // unsafeWindow: Tampermonkey global. user.js reads it at IIFE top level
  // (readerHook.ts uses (unsafeWindow as typeof unsafeWindow & {...}) — without
  // TM, this is undefined and the script throws ReferenceError immediately).
  if (typeof window.unsafeWindow === 'undefined') {
    try { Object.defineProperty(window, 'unsafeWindow', { get: () => window }); } catch(e){}
  }
  const __gmStore = JSON.parse(localStorage.getItem('fqa.gmStore') || '{}');
  function save(){ try { localStorage.setItem('fqa.gmStore', JSON.stringify(__gmStore)); } catch(e){} }
  window.GM_addStyle = function(css){
    const s = document.createElement('style'); s.textContent = css; (document.head || document.documentElement).appendChild(s);
    return s;
  };
  window.GM_setValue = function(k, v){ __gmStore[k] = v; save(); };
  window.GM_getValue = function(k, def){ return k in __gmStore ? __gmStore[k] : def; };
  window.GM_deleteValue = function(k){ delete __gmStore[k]; save(); };
  // GM_xmlhttpRequest: NOT mocked. Pass straight through. user.js calls it
  // synchronously-with-callbacks so we wrap fetch() and adapt the shape.
  window.GM_xmlhttpRequest = function(opts){
    const url = opts.url, method = opts.method || 'GET', data = opts.data, headers = opts.headers || {}, user = opts.user, password = opts.password;
    const onload = opts.onload, onerror = opts.onerror, onprogress = opts.onprogress, ontimeout = opts.ontimeout;
    const ctrl = new AbortController();
    const p = fetch(url, { method, headers, body: data, credentials: opts.anonymous ? 'omit' : 'include', signal: ctrl.signal })
      .then(async resp => {
        const text = await resp.text();
        const finalUrl = resp.url || url;
        const headersObj = {};
        resp.headers.forEach((v, k) => { headersObj[k] = v; });
        // emulate xhr-style events so user.js can read responseText/finalUrl/etc.
        let progressLoaded = 0, progressTotal = text.length;
        if (onprogress) onprogress({ lengthComputable: true, loaded: progressLoaded, total: progressTotal, finalUrl });
        onload && onload({
          readyState: 4,
          status: resp.status,
          statusText: resp.statusText,
          responseHeaders: Object.entries(headersObj).map(([k,v]) => `${k}: ${v}`).join('\r\n'),
          responseText: text,
          finalUrl: finalUrl,
          context: opts.context
        });
      })
      .catch(err => {
        if (err.name === 'AbortError') { ontimeout && ontimeout(); return; }
        onerror && onerror({ error: String(err), readyState: 4, finalUrl: url });
      });
    return { abort: () => ctrl.abort() };
  };
})();


// vue param shim: user.js expects `vue` to be a namespace object with every
// Vue 3 API as a property (reactive, ref, computed, watch, h, createApp,
// onMounted, etc.). Vue 3's runtime-global build is itself a function
// (Vue.createApp etc. hang off it), so we Proxy into it.
var Vue = (function(){
/**
* vue v3.5.40
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/var Vue=function(e){"use strict";var t,n,r;let i,l,s,o,a,c,u,d,h,f,p,g,m;function y(e){let t=Object.create(null);for(let n of e.split(","))t[n]=1;return e=>e in t}let b={},_=[],S=()=>{},x=()=>!1,C=e=>111===e.charCodeAt(0)&&110===e.charCodeAt(1)&&(e.charCodeAt(2)>122||97>e.charCodeAt(2)),k=e=>e.startsWith("onUpdate:"),T=Object.assign,w=(e,t)=>{let n=e.indexOf(t);n>-1&&e.splice(n,1)},N=Object.prototype.hasOwnProperty,A=(e,t)=>N.call(e,t),E=Array.isArray,I=e=>"function"==typeof e,R=e=>"string"==typeof e,O=e=>"symbol"==typeof e,M=e=>null!==e&&"object"==typeof e,P=e=>(M(e)||I(e))&&I(e.then)&&I(e.catch),F=Object.prototype.toString,L=e=>R(e)&&"NaN"!==e&&"-"!==e[0]&&""+parseInt(e,10)===e,$=y(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),D=y("bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"),V=e=>{let t=Object.create(null);return n=>t[n]||(t[n]=e(n))},B=/-\w/g,j=V(e=>e.replace(B,e=>e.slice(1).toUpperCase())),U=/\B([A-Z])/g,H=V(e=>e.replace(U,"-$1").toLowerCase()),q=V(e=>e.charAt(0).toUpperCase()+e.slice(1)),W=V(e=>e?`on${q(e)}`:""),K=(e,t)=>!Object.is(e,t),z=(e,...t)=>{for(let n=0;n<e.length;n++)e[n](...t)},J=(e,t,n,r=!1)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,writable:r,value:n})},G=e=>{let t=parseFloat(e);return isNaN(t)?e:t},X=e=>{let t=R(e)?Number(e):NaN;return isNaN(t)?e:t},Q=()=>i||(i="u">typeof globalThis?globalThis:"u">typeof self?self:"u">typeof window?window:"u">typeof global?global:{}),Z=y("Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol");function Y(e){if(E(e)){let t={};for(let n=0;n<e.length;n++){let r=e[n],i=R(r)?er(r):Y(r);if(i)for(let e in i)t[e]=i[e]}return t}if(R(e)||M(e))return e}let ee=/;(?![^(]*\))/g,et=/:([^]+)/,en=/\/\*[^]*?\*\//g;function er(e){let t={};return e.replace(en,"").split(ee).forEach(e=>{if(e){let n=e.split(et);n.length>1&&(t[n[0].trim()]=n[1].trim())}}),t}function ei(e){let t="";if(R(e))t=e;else if(E(e))for(let n=0;n<e.length;n++){let r=ei(e[n]);r&&(t+=r+" ")}else if(M(e))for(let n in e)e[n]&&(t+=n+" ");return t.trim()}let el=y("html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot"),es=y("svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view"),eo=y("annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics"),ea=y("area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr"),ec=y("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly");function eu(e,t){let n,r;if(e===t)return!0;let i="[object Date]"===(n=e,F.call(n)),l="[object Date]"===(r=t,F.call(r));if(i||l)return!!i&&!!l&&e.getTime()===t.getTime();if(i=O(e),l=O(t),i||l)return e===t;if(i=E(e),l=E(t),i||l)return!!i&&!!l&&function(e,t){if(e.length!==t.length)return!1;let n=!0;for(let r=0;n&&r<e.length;r++)n=eu(e[r],t[r]);return n}(e,t);if(i=M(e),l=M(t),i||l){if(!i||!l||Object.keys(e).length!==Object.keys(t).length)return!1;for(let n in e){let r=e.hasOwnProperty(n),i=t.hasOwnProperty(n);if(r&&!i||!r&&i||!eu(e[n],t[n]))return!1}}return String(e)===String(t)}function ed(e,t){return e.findIndex(e=>eu(e,t))}let eh=e=>!!(e&&!0===e.__v_isRef),ef=e=>R(e)?e:null==e?"":E(e)||M(e)&&(e.toString===F||!I(e.toString))?eh(e)?ef(e.value):JSON.stringify(e,ep,2):String(e),ep=(e,t)=>{let n;if(eh(t))return ep(e,t.value);if("[object Map]"===(n=t,F.call(n)))return{[`Map(${t.size})`]:[...t.entries()].reduce((e,[t,n],r)=>(e[eg(t,r)+" =>"]=n,e),{})};{let e;if("[object Set]"===(e=t,F.call(e)))return{[`Set(${t.size})`]:[...t.values()].map(e=>eg(e))};else{if(O(t))return eg(t);let e;if(M(t)&&!E(t)&&"[object Object]"!==(e=t,F.call(e)))return String(t)}}return t},eg=(e,t="")=>{var n;return O(e)?`Symbol(${null!=(n=e.description)?n:t})`:e};class em{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this._warnOnRun=!0,this.__v_skip=!0,!e&&l&&(l.active?(this.parent=l,this.index=(l.scopes||(l.scopes=[])).push(this)-1):(this._active=!1,this._warnOnRun=!1))}get active(){return this._active}pause(){if(this._active){let e,t;if(this._isPaused=!0,this.scopes){let n=this.scopes.slice();for(e=0,t=n.length;e<t;e++)n[e].pause()}for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){let e,t;if(this._isPaused=!1,this.scopes){let n=this.scopes.slice();for(e=0,t=n.length;e<t;e++)n[e].resume()}let n=this.effects.slice();for(e=0,t=n.length;e<t;e++)n[e].resume()}}run(e){if(this._active){let t=l;try{return l=this,e()}finally{l=t}}}on(){1==++this._on&&(this.prevScope=l,l=this)}off(){if(this._on>0&&0==--this._on){if(l===this)l=this.prevScope;else{let e=l;for(;e;){if(e.prevScope===this){e.prevScope=this.prevScope;break}e=e.prevScope}}this.prevScope=void 0}}stop(e){if(this._active){let t,n;for(this._active=!1,t=0,n=this.effects.length;t<n;t++)this.effects[t].stop();for(this.effects.length=0,t=0,n=this.cleanups.length;t<n;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){let e=this.scopes.slice();for(t=0,n=e.length;t<n;t++)e[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){let e=this.parent.scopes.pop();e&&e!==this&&(this.parent.scopes[this.index]=e,e.index=this.index)}this.parent=void 0}}}let ev=new WeakSet;class ey{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,l&&(l.active?l.effects.push(this):this.flags&=-2)}pause(){this.flags|=64}resume(){64&this.flags&&(this.flags&=-65,ev.has(this)&&(ev.delete(this),this.trigger()))}notify(){(!(2&this.flags)||32&this.flags)&&(8&this.flags||e_(this))}run(){if(!(1&this.flags))return this.fn();this.flags|=2,eR(this),ex(this);let e=s,t=eN;s=this,eN=!0;try{return this.fn()}finally{eC(this),s=e,eN=t,this.flags&=-3}}stop(){if(1&this.flags){for(let e=this.deps;e;e=e.nextDep)ew(e);this.deps=this.depsTail=void 0,eR(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){64&this.flags?ev.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){ek(this)&&this.run()}get dirty(){return ek(this)}}let eb=0;function e_(e,t=!1){if(e.flags|=8,t){e.next=a,a=e;return}e.next=o,o=e}function eS(){let e;if(!(--eb>0)){if(a){let e=a;for(a=void 0;e;){let t=e.next;e.next=void 0,e.flags&=-9,e=t}}for(;o;){let t=o;for(o=void 0;t;){let n=t.next;if(t.next=void 0,t.flags&=-9,1&t.flags)try{t.trigger()}catch(t){e||(e=t)}t=n}}if(e)throw e}}function ex(e){for(let t=e.deps;t;t=t.nextDep)t.version=-1,t.prevActiveLink=t.dep.activeLink,t.dep.activeLink=t}function eC(e){let t,n=e.depsTail,r=n;for(;r;){let e=r.prevDep;-1===r.version?(r===n&&(n=e),ew(r),function(e){let{prevDep:t,nextDep:n}=e;t&&(t.nextDep=n,e.prevDep=void 0),n&&(n.prevDep=t,e.nextDep=void 0)}(r)):t=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=e}e.deps=t,e.depsTail=n}function ek(e){for(let t=e.deps;t;t=t.nextDep)if(t.dep.version!==t.version||t.dep.computed&&(eT(t.dep.computed)||t.dep.version!==t.version))return!0;return!!e._dirty}function eT(e){if(4&e.flags&&!(16&e.flags)||(e.flags&=-17,e.globalVersion===eO)||(e.globalVersion=eO,!e.isSSR&&128&e.flags&&(!e.deps&&!e._dirty||!ek(e))))return;e.flags|=2;let t=e.dep,n=s,r=eN;s=e,eN=!0;try{ex(e);let n=e.fn(e._value);(0===t.version||K(n,e._value))&&(e.flags|=128,e._value=n,t.version++)}catch(e){throw t.version++,e}finally{s=n,eN=r,eC(e),e.flags&=-3}}function ew(e,t=!1){let{dep:n,prevSub:r,nextSub:i}=e;if(r&&(r.nextSub=i,e.prevSub=void 0),i&&(i.prevSub=r,e.nextSub=void 0),n.subs===e&&(n.subs=r,!r&&n.computed)){n.computed.flags&=-5;for(let e=n.computed.deps;e;e=e.nextDep)ew(e,!0)}t||--n.sc||!n.map||n.map.delete(n.key)}let eN=!0,eA=[];function eE(){eA.push(eN),eN=!1}function eI(){let e=eA.pop();eN=void 0===e||e}function eR(e){let{cleanup:t}=e;if(e.cleanup=void 0,t){let e=s;s=void 0;try{t()}finally{s=e}}}let eO=0;class eM{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class eP{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!s||!eN||s===this.computed)return;let t=this.activeLink;if(void 0===t||t.sub!==s)t=this.activeLink=new eM(s,this),s.deps?(t.prevDep=s.depsTail,s.depsTail.nextDep=t,s.depsTail=t):s.deps=s.depsTail=t,function e(t){if(t.dep.sc++,4&t.sub.flags){let n=t.dep.computed;if(n&&!t.dep.subs){n.flags|=20;for(let t=n.deps;t;t=t.nextDep)e(t)}let r=t.dep.subs;r!==t&&(t.prevSub=r,r&&(r.nextSub=t)),t.dep.subs=t}}(t);else if(-1===t.version&&(t.version=this.version,t.nextDep)){let e=t.nextDep;e.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=e),t.prevDep=s.depsTail,t.nextDep=void 0,s.depsTail.nextDep=t,s.depsTail=t,s.deps===t&&(s.deps=e)}return t}trigger(e){this.version++,eO++,this.notify(e)}notify(e){eb++;try{for(let e=this.subs;e;e=e.prevSub)e.sub.notify()&&e.sub.dep.notify()}finally{eS()}}}let eF=new WeakMap,eL=Symbol(""),e$=Symbol(""),eD=Symbol("");function eV(e,t,n){if(eN&&s){let t=eF.get(e);t||eF.set(e,t=new Map);let r=t.get(n);r||(t.set(n,r=new eP),r.map=t,r.key=n),r.track()}}function eB(e,t,n,r,i,l){let s=eF.get(e);if(!s)return void eO++;let o=e=>{e&&e.trigger()};if(eb++,"clear"===t)s.forEach(o);else{let i=E(e),l=i&&L(n);if(i&&"length"===n){let e=Number(r);s.forEach((t,n)=>{("length"===n||n===eD||!O(n)&&n>=e)&&o(t)})}else switch((void 0!==n||s.has(void 0))&&o(s.get(n)),l&&o(s.get(eD)),t){case"add":if(i)l&&o(s.get("length"));else{let t;o(s.get(eL));"[object Map]"===(t=e,F.call(t))&&o(s.get(e$))}break;case"delete":if(!i){let t;o(s.get(eL));"[object Map]"===(t=e,F.call(t))&&o(s.get(e$))}break;case"set":let a;"[object Map]"===(a=e,F.call(a))&&o(s.get(eL))}}eS()}function ej(e){let t=tm(e);return t===e?t:(eV(t,"iterate",eD),tp(e)?t:t.map(ty))}function eU(e){return eV(e=tm(e),"iterate",eD),e}function eH(e,t){return tf(e)?th(e)?tb(ty(t)):tb(t):ty(t)}let eq={__proto__:null,[Symbol.iterator](){return eW(this,Symbol.iterator,e=>eH(this,e))},concat(...e){return ej(this).concat(...e.map(e=>E(e)?ej(e):e))},entries(){return eW(this,"entries",e=>(e[1]=eH(this,e[1]),e))},every(e,t){return ez(this,"every",e,t,void 0,arguments)},filter(e,t){return ez(this,"filter",e,t,e=>e.map(e=>eH(this,e)),arguments)},find(e,t){return ez(this,"find",e,t,e=>eH(this,e),arguments)},findIndex(e,t){return ez(this,"findIndex",e,t,void 0,arguments)},findLast(e,t){return ez(this,"findLast",e,t,e=>eH(this,e),arguments)},findLastIndex(e,t){return ez(this,"findLastIndex",e,t,void 0,arguments)},forEach(e,t){return ez(this,"forEach",e,t,void 0,arguments)},includes(...e){return eG(this,"includes",e)},indexOf(...e){return eG(this,"indexOf",e)},join(e){return ej(this).join(e)},lastIndexOf(...e){return eG(this,"lastIndexOf",e)},map(e,t){return ez(this,"map",e,t,void 0,arguments)},pop(){return eX(this,"pop")},push(...e){return eX(this,"push",e)},reduce(e,...t){return eJ(this,"reduce",e,t)},reduceRight(e,...t){return eJ(this,"reduceRight",e,t)},shift(){return eX(this,"shift")},some(e,t){return ez(this,"some",e,t,void 0,arguments)},splice(...e){return eX(this,"splice",e)},toReversed(){return ej(this).toReversed()},toSorted(e){return ej(this).toSorted(e)},toSpliced(...e){return ej(this).toSpliced(...e)},unshift(...e){return eX(this,"unshift",e)},values(){return eW(this,"values",e=>eH(this,e))}};function eW(e,t,n){let r=eU(e),i=r[t]();return r===e||tp(e)||(i._next=i.next,i.next=()=>{let e=i._next();return e.done||(e.value=n(e.value)),e}),i}let eK=Array.prototype;function ez(e,t,n,r,i,l){let s=eU(e),o=s!==e&&!tp(e),a=s[t];if(a!==eK[t]){let t=a.apply(e,l);return o?ty(t):t}let c=n;s!==e&&(o?c=function(t,r){return n.call(this,eH(e,t),r,e)}:n.length>2&&(c=function(t,r){return n.call(this,t,r,e)}));let u=a.call(s,c,r);return o&&i?i(u):u}function eJ(e,t,n,r){let i=eU(e),l=i!==e&&!tp(e),s=n,o=!1;i!==e&&(l?(o=0===r.length,s=function(t,r,i){return o&&(o=!1,t=eH(e,t)),n.call(this,t,eH(e,r),i,e)}):n.length>3&&(s=function(t,r,i){return n.call(this,t,r,i,e)}));let a=i[t](s,...r);return o?eH(e,a):a}function eG(e,t,n){let r=tm(e);eV(r,"iterate",eD);let i=r[t](...n);return(-1===i||!1===i)&&tg(n[0])?(n[0]=tm(n[0]),r[t](...n)):i}function eX(e,t,n=[]){eE(),eb++;let r=tm(e)[t].apply(e,n);return eS(),eI(),r}let eQ=y("__proto__,__v_isRef,__isVue"),eZ=new Set(Object.getOwnPropertyNames(Symbol).filter(e=>"arguments"!==e&&"caller"!==e).map(e=>Symbol[e]).filter(O));function eY(e){O(e)||(e=String(e));let t=tm(this);return eV(t,"has",e),t.hasOwnProperty(e)}class e0{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,n){if("__v_skip"===t)return e.__v_skip;let r=this._isReadonly,i=this._isShallow;if("__v_isReactive"===t)return!r;if("__v_isReadonly"===t)return r;if("__v_isShallow"===t)return i;if("__v_raw"===t)return n===(r?i?to:ts:i?tl:ti).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(n)?e:void 0;let l=E(e);if(!r){let e;if(l&&(e=eq[t]))return e;if("hasOwnProperty"===t)return eY}let s=Reflect.get(e,t,t_(e)?e:n);if((O(t)?eZ.has(t):eQ(t))||(r||eV(e,"get",t),i))return s;if(t_(s)){let e=l&&L(t)?s:s.value;return r&&M(e)?tu(e):e}return M(s)?r?tu(s):ta(s):s}}class e1 extends e0{constructor(e=!1){super(!1,e)}set(e,t,n,r){let i=e[t],l=E(e)&&L(t);if(!this._isShallow){let e=tf(i);if(tp(n)||tf(n)||(i=tm(i),n=tm(n)),!l&&t_(i)&&!t_(n))if(e)return!0;else return i.value=n,!0}let s=l?Number(t)<e.length:A(e,t),o=Reflect.set(e,t,n,t_(e)?e:r);return e===tm(r)&&o&&(s?K(n,i)&&eB(e,"set",t,n):eB(e,"add",t,n)),o}deleteProperty(e,t){let n=A(e,t);e[t];let r=Reflect.deleteProperty(e,t);return r&&n&&eB(e,"delete",t,void 0),r}has(e,t){let n=Reflect.has(e,t);return O(t)&&eZ.has(t)||eV(e,"has",t),n}ownKeys(e){return eV(e,"iterate",E(e)?"length":eL),Reflect.ownKeys(e)}}class e2 extends e0{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}let e3=new e1,e6=new e2,e4=new e1(!0),e8=new e2(!0),e5=e=>e;function e9(e){return function(){return"delete"!==e&&("clear"===e?void 0:this)}}function e7(e,t){let n,r=(T(n={get(n){let r=this.__v_raw,i=tm(r),l=tm(n);e||(K(n,l)&&eV(i,"get",n),eV(i,"get",l));let{has:s}=Reflect.getPrototypeOf(i),o=t?e5:e?tb:ty;return s.call(i,n)?o(r.get(n)):s.call(i,l)?o(r.get(l)):void(r!==i&&r.get(n))},get size(){let t=this.__v_raw;return e||eV(tm(t),"iterate",eL),t.size},has(t){let n=this.__v_raw,r=tm(n),i=tm(t);return e||(K(t,i)&&eV(r,"has",t),eV(r,"has",i)),t===i?n.has(t):n.has(t)||n.has(i)},forEach(n,r){let i=this,l=i.__v_raw,s=tm(l),o=t?e5:e?tb:ty;return e||eV(s,"iterate",eL),l.forEach((e,t)=>n.call(r,o(e),o(t),i))}},e?{add:e9("add"),set:e9("set"),delete:e9("delete"),clear:e9("clear")}:{add(e){let n=tm(this),r=Reflect.getPrototypeOf(n),i=tm(e),l=t||tp(e)||tf(e)?e:i;return r.has.call(n,l)||K(e,l)&&r.has.call(n,e)||K(i,l)&&r.has.call(n,i)||(n.add(l),eB(n,"add",l,l)),this},set(e,n){t||tp(n)||tf(n)||(n=tm(n));let r=tm(this),{has:i,get:l}=Reflect.getPrototypeOf(r),s=i.call(r,e);s||(e=tm(e),s=i.call(r,e));let o=l.call(r,e);return r.set(e,n),s?K(n,o)&&eB(r,"set",e,n):eB(r,"add",e,n),this},delete(e){let t=tm(this),{has:n,get:r}=Reflect.getPrototypeOf(t),i=n.call(t,e);i||(e=tm(e),i=n.call(t,e)),r&&r.call(t,e);let l=t.delete(e);return i&&eB(t,"delete",e,void 0),l},clear(){let e=tm(this),t=0!==e.size,n=e.clear();return t&&eB(e,"clear",void 0,void 0),n}}),["keys","values","entries",Symbol.iterator].forEach(r=>{n[r]=function(...n){let i,l=this.__v_raw,s=tm(l),o="[object Map]"===(i=s,F.call(i)),a="entries"===r||r===Symbol.iterator&&o,c=l[r](...n),u=t?e5:e?tb:ty;return e||eV(s,"iterate","keys"===r&&o?e$:eL),T(Object.create(c),{next(){let{value:e,done:t}=c.next();return t?{value:e,done:t}:{value:a?[u(e[0]),u(e[1])]:u(e),done:t}}})}}),n);return(t,n,i)=>"__v_isReactive"===n?!e:"__v_isReadonly"===n?e:"__v_raw"===n?t:Reflect.get(A(r,n)&&n in t?r:t,n,i)}let te={get:e7(!1,!1)},tt={get:e7(!1,!0)},tn={get:e7(!0,!1)},tr={get:e7(!0,!0)},ti=new WeakMap,tl=new WeakMap,ts=new WeakMap,to=new WeakMap;function ta(e){return tf(e)?e:td(e,!1,e3,te,ti)}function tc(e){return td(e,!1,e4,tt,tl)}function tu(e){return td(e,!0,e6,tn,ts)}function td(e,t,n,r,i){let l;if(!M(e)||e.__v_raw&&!(t&&e.__v_isReactive)||e.__v_skip||!Object.isExtensible(e))return e;let s=i.get(e);if(s)return s;let o=function(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}((l=e,F.call(l)).slice(8,-1));if(0===o)return e;let a=new Proxy(e,2===o?r:n);return i.set(e,a),a}function th(e){return tf(e)?th(e.__v_raw):!!(e&&e.__v_isReactive)}function tf(e){return!!(e&&e.__v_isReadonly)}function tp(e){return!!(e&&e.__v_isShallow)}function tg(e){return!!e&&!!e.__v_raw}function tm(e){let t=e&&e.__v_raw;return t?tm(t):e}function tv(e){return!A(e,"__v_skip")&&Object.isExtensible(e)&&J(e,"__v_skip",!0),e}let ty=e=>M(e)?ta(e):e,tb=e=>M(e)?tu(e):e;function t_(e){return!!e&&!0===e.__v_isRef}function tS(e){return tC(e,!1)}function tx(e){return tC(e,!0)}function tC(e,t){return t_(e)?e:new tk(e,t)}class tk{constructor(e,t){this.dep=new eP,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:tm(e),this._value=t?e:ty(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){let t=this._rawValue,n=this.__v_isShallow||tp(e)||tf(e);K(e=n?e:tm(e),t)&&(this._rawValue=e,this._value=n?e:ty(e),this.dep.trigger())}}function tT(e){return t_(e)?e.value:e}let tw={get:(e,t,n)=>"__v_raw"===t?e:tT(Reflect.get(e,t,n)),set:(e,t,n,r)=>{let i=e[t];return t_(i)&&!t_(n)?(i.value=n,!0):Reflect.set(e,t,n,r)}};function tN(e){return th(e)?e:new Proxy(e,tw)}class tA{constructor(e){this.__v_isRef=!0,this._value=void 0;const t=this.dep=new eP,{get:n,set:r}=e(t.track.bind(t),t.trigger.bind(t));this._get=n,this._set=r}get value(){return this._value=this._get()}set value(e){this._set(e)}}function tE(e){return new tA(e)}class tI{constructor(e,t,n){this._object=e,this._defaultValue=n,this.__v_isRef=!0,this._value=void 0,this._key=O(t)?t:String(t),this._raw=tm(e);let r=!0,i=e;if(!E(e)||O(this._key)||!L(this._key))do r=!tg(i)||tp(i);while(r&&(i=i.__v_raw));this._shallow=r}get value(){let e=this._object[this._key];return this._shallow&&(e=tT(e)),this._value=void 0===e?this._defaultValue:e}set value(e){if(this._shallow&&t_(this._raw[this._key])){let t=this._object[this._key];if(t_(t)){t.value=e;return}}this._object[this._key]=e}get dep(){var e,t;let n;return e=this._raw,t=this._key,(n=eF.get(e))&&n.get(t)}}class tR{constructor(e){this._getter=e,this.__v_isRef=!0,this.__v_isReadonly=!0,this._value=void 0}get value(){return this._value=this._getter()}}class tO{constructor(e,t,n){this.fn=e,this.setter=t,this._value=void 0,this.dep=new eP(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=eO-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=n}notify(){if(this.flags|=16,!(8&this.flags)&&s!==this)return e_(this,!0),!0}get value(){let e=this.dep.track();return eT(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}let tM={},tP=new WeakMap;function tF(e,t=!1,n=g){if(n){let t=tP.get(n);t||tP.set(n,t=[]),t.push(e)}}function tL(e,t=1/0,n){if(t<=0||!M(e)||e.__v_skip||((n=n||new Map).get(e)||0)>=t)return e;if(n.set(e,t),t--,t_(e))tL(e.value,t,n);else if(E(e))for(let r=0;r<e.length;r++)tL(e[r],t,n);else{let r,i;if("[object Set]"===(r=e,F.call(r))||"[object Map]"===(i=e,F.call(i)))e.forEach(e=>{tL(e,t,n)});else{let r;if("[object Object]"===(r=e,F.call(r))){for(let r in e)tL(e[r],t,n);for(let r of Object.getOwnPropertySymbols(e))Object.prototype.propertyIsEnumerable.call(e,r)&&tL(e[r],t,n)}}}return e}function t$(e,t,n,r){try{return r?e(...r):e()}catch(e){tV(e,t,n)}}function tD(e,t,n,r){if(I(e)){let i=t$(e,t,n,r);return i&&P(i)&&i.catch(e=>{tV(e,t,n)}),i}if(E(e)){let i=[];for(let l=0;l<e.length;l++)i.push(tD(e[l],t,n,r));return i}}function tV(e,t,n,r=!0){let i=t?t.vnode:null,{errorHandler:l,throwUnhandledErrorInProduction:s}=t&&t.appContext.config||b;if(t){let r=t.parent,i=t.proxy,s=`https://vuejs.org/error-reference/#runtime-${n}`;for(;r;){let t=r.ec;if(t){for(let n=0;n<t.length;n++)if(!1===t[n](e,i,s))return}r=r.parent}if(l){eE(),t$(l,null,10,[e,i,s]),eI();return}}!function(e,t=!0,n=!1){if(n)throw e;console.error(e)}(e,r,s)}let tB=[],tj=-1,tU=[],tH=null,tq=0,tW=Promise.resolve(),tK=null;function tz(e){let t=tK||tW;return e?t.then(this?e.bind(this):e):t}function tJ(e){if(!(1&e.flags)){let t=tY(e),n=tB[tB.length-1];!n||!(2&e.flags)&&t>=tY(n)?tB.push(e):tB.splice(function(e){let t=tj+1,n=tB.length;for(;t<n;){let r=t+n>>>1,i=tB[r],l=tY(i);l<e||l===e&&2&i.flags?t=r+1:n=r}return t}(t),0,e),e.flags|=1,tG()}}function tG(){tK||(tK=tW.then(function e(t){try{for(tj=0;tj<tB.length;tj++){let e=tB[tj];e&&!(8&e.flags)&&(4&e.flags&&(e.flags&=-2),t$(e,e.i,e.i?15:14),4&e.flags||(e.flags&=-2))}}finally{for(;tj<tB.length;tj++){let e=tB[tj];e&&(e.flags&=-2)}tj=-1,tB.length=0,tZ(),tK=null,(tB.length||tU.length)&&e()}}))}function tX(e){E(e)?tU.push(...e):tH&&-1===e.id?tH.splice(tq+1,0,e):1&e.flags||(tU.push(e),e.flags|=1),tG()}function tQ(e,t,n=tj+1){for(;n<tB.length;n++){let t=tB[n];if(t&&2&t.flags){if(e&&t.id!==e.uid)continue;tB.splice(n,1),n--,4&t.flags&&(t.flags&=-2),t(),4&t.flags||(t.flags&=-2)}}}function tZ(e){if(tU.length){let e=[...new Set(tU)].sort((e,t)=>tY(e)-tY(t));if(tU.length=0,tH)return void tH.push(...e);for(tH=e,tq=0;tq<tH.length;tq++){let e=tH[tq];4&e.flags&&(e.flags&=-2),8&e.flags||e(),e.flags&=-2}tH=null,tq=0}}let tY=e=>null==e.id?2&e.flags?-1:1/0:e.id,t0=null,t1=null;function t2(e){let t=t0;return t0=e,t1=e&&e.type.__scopeId||null,t}function t3(e,t=t0,n){if(!t||e._n)return e;let r=(...n)=>{let i;r._d&&is(-1);let l=t2(t),s=ie.length;try{i=e(...n)}finally{for(let e=ie.length;e>s;e--)ii();t2(l),r._d&&is(1)}return i};return r._n=!0,r._c=!0,r._d=!0,r}function t6(e,t,n,r){let i=e.dirs,l=t&&t.dirs;for(let s=0;s<i.length;s++){let o=i[s];l&&(o.oldValue=l[s].value);let a=o.dir[r];a&&(eE(),tD(a,n,8,[e.el,o,e,t]),eI())}}function t4(e,t){if(iN){let n=iN.provides,r=iN.parent&&iN.parent.provides;r===n&&(n=iN.provides=Object.create(r)),n[e]=t}}function t8(e,t,n=!1){let r=iA();if(r||rx){let i=rx?rx._context.provides:r?null==r.parent||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(i&&e in i)return i[e];if(arguments.length>1)return n&&I(t)?t.call(r&&r.proxy):t}}let t5=Symbol.for("v-scx");function t9(e,t){return t7(e,null,{flush:"sync"})}function t7(e,t,n=b){let{flush:r}=n,i=T({},n),s=iN;i.call=(e,t,n)=>tD(e,s,t,n);let o=!1;return"post"===r?i.scheduler=e=>{rW(e,s&&s.suspense)}:"sync"!==r&&(o=!0,i.scheduler=(e,t)=>{t?e():tJ(e)}),i.augmentJob=e=>{t&&(e.flags|=4),o&&(e.flags|=2,s&&(e.id=s.uid,e.i=s))},function(e,t,n=b){let r,i,s,o,{immediate:a,deep:c,once:u,scheduler:d,augmentJob:h,call:f}=n,p=e=>c?e:tp(e)||!1===c||0===c?tL(e,1):tL(e),m=!1,y=!1;if(t_(e)?(i=()=>e.value,m=tp(e)):th(e)?(i=()=>p(e),m=!0):E(e)?(y=!0,m=e.some(e=>th(e)||tp(e)),i=()=>e.map(e=>t_(e)?e.value:th(e)?p(e):I(e)?f?f(e,2):e():void 0)):i=I(e)?t?f?()=>f(e,2):e:()=>{if(s){eE();try{s()}finally{eI()}}let t=g;g=r;try{return f?f(e,3,[o]):e(o)}finally{g=t}}:S,t&&c){let e=i,t=!0===c?1/0:c;i=()=>tL(e(),t)}let _=l,x=()=>{r.stop(),_&&_.active&&w(_.effects,r)};if(u&&t){let e=t;t=(...t)=>{let n=e(...t);return x(),n}}let C=y?Array(e.length).fill(tM):tM,k=e=>{if(1&r.flags&&(r.dirty||e))if(t){let n=r.run();if(e||c||m||(y?n.some((e,t)=>K(e,C[t])):K(n,C))){s&&s();let e=g;g=r;try{let e=[n,C===tM?void 0:y&&C[0]===tM?[]:C,o];C=n,f?f(t,3,e):t(...e)}finally{g=e}}}else r.run()};return h&&h(k),(r=new ey(i)).scheduler=d?()=>d(k,!1):k,o=e=>tF(e,!1,r),s=r.onStop=()=>{let e=tP.get(r);if(e){if(f)f(e,4);else for(let t of e)t();tP.delete(r)}},t?a?k(!0):C=r.run():d?d(k.bind(null,!0),!0):r.run(),x.pause=r.pause.bind(r),x.resume=r.resume.bind(r),x.stop=x,x}(e,t,i)}function ne(e,t,n){let r,i=this.proxy,l=R(e)?e.includes(".")?nt(i,e):()=>i[e]:e.bind(i,i);I(t)?r=t:(r=t.handler,n=t);let s=iE(this),o=t7(l,r.bind(i),n);return s(),o}function nt(e,t){let n=t.split(".");return()=>{let t=e;for(let e=0;e<n.length&&t;e++)t=t[n[e]];return t}}let nn=new WeakMap,nr=Symbol("_vte"),ni=e=>e&&(e.disabled||""===e.disabled),nl=e=>"u">typeof SVGElement&&e instanceof SVGElement,ns=e=>"function"==typeof MathMLElement&&e instanceof MathMLElement,no=(e,t)=>{let n=e&&e.to;return R(n)?t?t(n):null:n};function na(e,t,n,{o:{insert:r},m:i},l=2){0===l&&r(e.targetAnchor,t,n);let{el:s,anchor:o,shapeFlag:a,children:c,props:u}=e,d=2===l;if(d&&r(s,t,n),!nn.has(e)&&(!d||ni(u))&&16&a)for(let e=0;e<c.length;e++)i(c[e],t,n,2);d&&r(o,t,n)}function nc(e,t){let n=e.ctx;if(n&&n.ut){let r,i;for(t?(r=e.el,i=e.anchor):(r=e.targetStart,i=e.targetAnchor);r&&r!==i;)1===r.nodeType&&r.setAttribute("data-v-owner",n.uid),r=r.nextSibling;n.ut()}}function nu(e,t,n,r,i=null){let l=t.targetStart=n(""),s=t.targetAnchor=n("");return l[nr]=s,e&&(r(l,e,i),r(s,e,i)),s}let nd=Symbol("_leaveCb"),nh=Symbol("_enterCb");function nf(){let e={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return n0(()=>{e.isMounted=!0}),n3(()=>{e.isUnmounting=!0}),e}let np=[Function,Array],ng={mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:np,onEnter:np,onAfterEnter:np,onEnterCancelled:np,onBeforeLeave:np,onLeave:np,onAfterLeave:np,onLeaveCancelled:np,onBeforeAppear:np,onAppear:np,onAfterAppear:np,onAppearCancelled:np},nm=e=>{let t=e.subTree;return t.component?nm(t.component):t};function nv(e){let t=e[0];if(e.length>1){for(let n of e)if(n.type!==r9){t=n;break}}return t}let ny={name:"BaseTransition",props:ng,setup(e,{slots:t}){let n=iA(),r=nf();return()=>{let i=t.default&&nk(t.default(),!0),l=i&&i.length?nv(i):n.subTree?ib():void 0;if(!l)return;let s=tm(e),{mode:o}=s;if(r.isLeaving)return nS(l);let a=nx(l);if(!a)return nS(l);let c=n_(a,s,r,n,e=>c=e);a.type!==r9&&nC(a,c);let u=n.subTree&&nx(n.subTree);if(u&&u.type!==r9&&!iu(u,a)&&nm(n).type!==r9){let e=n_(u,s,r,n);if(nC(u,e),"out-in"===o&&a.type!==r9)return r.isLeaving=!0,e.afterLeave=()=>{r.isLeaving=!1,8&n.job.flags||n.update(),delete e.afterLeave,u=void 0},nS(l);"in-out"===o&&a.type!==r9?e.delayLeave=(e,t,n)=>{nb(r,u)[String(u.key)]=u,e[nd]=()=>{t(),e[nd]=void 0,delete c.delayedLeave,u=void 0},c.delayedLeave=()=>{n(),delete c.delayedLeave,u=void 0}}:u=void 0}else u&&(u=void 0);return l}}};function nb(e,t){let{leavingVNodes:n}=e,r=n.get(t.type);return r||(r=Object.create(null),n.set(t.type,r)),r}function n_(e,t,n,r,i){let{appear:l,mode:s,persisted:o=!1,onBeforeEnter:a,onEnter:c,onAfterEnter:u,onEnterCancelled:d,onBeforeLeave:h,onLeave:f,onAfterLeave:p,onLeaveCancelled:g,onBeforeAppear:m,onAppear:y,onAfterAppear:b,onAppearCancelled:_}=t,S=String(e.key),x=nb(n,e),C=(e,t)=>{e&&tD(e,r,9,t)},k=(e,t)=>{let n=t[1];C(e,t),E(e)?e.every(e=>e.length<=1)&&n():e.length<=1&&n()},T={mode:s,persisted:o,beforeEnter(t){let r=a;if(!n.isMounted)if(!l)return;else r=m||a;t[nd]&&t[nd](!0);let i=x[S];i&&iu(e,i)&&i.el[nd]&&i.el[nd](),C(r,[t])},enter(t){if(x[S]===e)return;let r=c,i=u,s=d;if(!n.isMounted)if(!l)return;else r=y||c,i=b||u,s=_||d;let o=!1;t[nh]=e=>{o||(o=!0,e?C(s,[t]):C(i,[t]),T.delayedLeave&&T.delayedLeave(),t[nh]=void 0)};let a=t[nh].bind(null,!1);r?k(r,[t,a]):a()},leave(t,r){let i=String(e.key);if(t[nh]&&t[nh](!0),n.isUnmounting)return r();C(h,[t]);let l=!1;t[nd]=n=>{l||(l=!0,r(),n?C(g,[t]):C(p,[t]),t[nd]=void 0,x[i]===e&&delete x[i])};let s=t[nd].bind(null,!1);x[i]=e,f?k(f,[t,s]):s()},clone(e){let l=n_(e,t,n,r,i);return i&&i(l),l}};return T}function nS(e){if(nq(e))return(e=iv(e)).children=null,e}function nx(e){if(!nq(e))return e.type.__isTeleport&&e.children?nv(e.children):e;if(e.component)return e.component.subTree;let{shapeFlag:t,children:n}=e;if(n){if(16&t)return n[0];if(32&t&&I(n.default))return n.default()}}function nC(e,t){6&e.shapeFlag&&e.component?(e.transition=t,nC(e.component.subTree,t)):128&e.shapeFlag?(e.ssContent.transition=t.clone(e.ssContent),e.ssFallback.transition=t.clone(e.ssFallback)):e.transition=t}function nk(e,t=!1,n){let r=[],i=0;for(let l=0;l<e.length;l++){let s=e[l],o=null==n?s.key:String(n)+String(null!=s.key?s.key:l);s.type===r8?(128&s.patchFlag&&i++,r=r.concat(nk(s.children,t,o))):(t||s.type!==r9)&&r.push(null!=o?iv(s,{key:o}):s)}if(i>1)for(let e=0;e<r.length;e++)r[e].patchFlag=-2;return r}function nT(e,t){return I(e)?T({name:e.name},t,{setup:e}):e}function nw(e){e.ids=[e.ids[0]+e.ids[2]+++"-",0,0]}function nN(e,t){let n;return!!((n=Object.getOwnPropertyDescriptor(e,t))&&!n.configurable)}let nA=new WeakMap;function nE(e,t,n,r,i=!1){if(E(e))return void e.forEach((e,l)=>nE(e,t&&(E(t)?t[l]:t),n,r,i));if(nU(r)&&!i){512&r.shapeFlag&&r.type.__asyncResolved&&r.component.subTree.component&&nE(e,t,n,r.component.subTree);return}let l=4&r.shapeFlag?iD(r.component):r.el,s=i?null:l,{i:o,r:a}=e,c=t&&t.r,u=o.refs===b?o.refs={}:o.refs,d=o.setupState,h=tm(d),f=d===b?x:e=>!nN(u,e)&&A(h,e),p=(e,t)=>!(t&&nN(u,t));if(null!=c&&c!==a&&(nI(t),R(c)?(u[c]=null,f(c)&&(d[c]=null)):t_(c)&&(p(c,t.k)&&(c.value=null),t.k&&(u[t.k]=null))),I(a))t$(a,o,12,[s,u]);else{let t=R(a),r=t_(a);if(t||r){let o=()=>{if(e.f){let n=t?f(a)?d[a]:u[a]:p()||!e.k?a.value:u[e.k];if(i)E(n)&&w(n,l);else if(E(n))n.includes(l)||n.push(l);else if(t)u[a]=[l],f(a)&&(d[a]=u[a]);else{let t=[l];p(a,e.k)&&(a.value=t),e.k&&(u[e.k]=t)}}else t?(u[a]=s,f(a)&&(d[a]=s)):r&&(p(a,e.k)&&(a.value=s),e.k&&(u[e.k]=s))};if(s){let t=()=>{o(),nA.delete(e)};t.id=-1,nA.set(e,t),rW(t,n)}else nI(e),o()}}}function nI(e){let t=nA.get(e);t&&(t.flags|=8,nA.delete(e))}let nR=!1,nO=()=>{nR||(console.error("Hydration completed but contains mismatches."),nR=!0)},nM=e=>{if(1===e.nodeType){if(e.namespaceURI.includes("svg")&&"foreignObject"!==e.tagName)return"svg";if(e.namespaceURI.includes("MathML"))return"mathml"}},nP=e=>8===e.nodeType;function nF(e){let{mt:t,p:n,o:{patchProp:r,createText:i,nextSibling:l,parentNode:s,remove:o,insert:a,createComment:c}}=e,u=(n,r,o,c,b,_=!1)=>{_=_||!!r.dynamicChildren;let S=nP(n)&&"["===n.data,x=()=>p(n,r,o,c,b,S),{type:C,ref:k,shapeFlag:T,patchFlag:w}=r,N=n.nodeType;r.el=n,-2===w&&(_=!1,r.dynamicChildren=null);let A=null;switch(C){case r5:3!==N?""===r.children?(a(r.el=i(""),s(n),n),A=n):A=x():(n.data!==r.children&&(nO(),n.data=r.children),A=l(n));break;case r9:y(n)?(A=l(n),m(r.el=n.content.firstChild,n,o)):A=8!==N||S?x():l(n);break;case r7:if(S&&(N=(n=l(n)).nodeType),1===N||3===N){A=n;let e=!r.children.length;for(let t=0;t<r.staticCount;t++)e&&(r.children+=1===A.nodeType?A.outerHTML:A.data),t===r.staticCount-1&&(r.anchor=A),A=l(A);return S?l(A):A}x();break;case r8:A=S?f(n,r,o,c,b,_):x();break;default:if(1&T)A=1===N&&r.type.toLowerCase()===n.tagName.toLowerCase()||y(n)?d(n,r,o,c,b,_):x();else if(6&T){r.slotScopeIds=b;let e=s(n);if(A=S?g(n):nP(n)&&"teleport start"===n.data?g(n,n.data,"teleport end"):l(n),t(r,e,null,o,c,nM(e),_),nU(r)&&!r.type.__asyncResolved){let t;S?(t=ig(r8)).anchor=A?A.previousSibling:e.lastChild:t=3===n.nodeType?iy(""):ig("div"),t.el=n,r.component.subTree=t}}else 64&T?A=8!==N?x():r.type.hydrate(n,r,o,c,b,_,e,h):128&T&&(A=r.type.hydrate(n,r,o,c,nM(s(n)),b,_,e,u))}return null!=k&&nE(k,null,c,r),A},d=(e,t,n,i,l,s)=>{s=s||!!t.dynamicChildren;let{type:a,dynamicProps:c,props:u,patchFlag:d,shapeFlag:f,dirs:p,transition:g}=t,b="input"===a||"option"===a,_=!!c;if(b||_||-1!==d){let a;p&&t6(t,null,n,"created");let S=!1;if(y(e)){S=rX(null,g)&&n&&n.vnode.props&&n.vnode.props.appear;let r=e.content.firstChild;if(S){let e=r.getAttribute("class");e&&(r.$cls=e),g.beforeEnter(r)}m(r,e,n),t.el=e=r}if(16&f&&!(u&&(u.innerHTML||u.textContent))){let r=h(e.firstChild,t,e,n,i,l,s);for(r&&!nD(e,1)&&nO();r;){let e=r;r=r.nextSibling,o(e)}}else if(8&f){let n=t.children;`
`===n[0]&&("PRE"===e.tagName||"TEXTAREA"===e.tagName)&&(n=n.slice(1));let{textContent:r}=e;r!==n&&r!==n.replace(/\r\n|\r/g,`
`)&&(nD(e,0)||nO(),e.textContent=t.children)}if(u){if(b||_||!s||48&d){let t=e.tagName.includes("-"),i=e.namespaceURI.includes("svg")?"svg":e.namespaceURI.includes("MathML")?"mathml":void 0;for(let l in u)(b&&(l.endsWith("value")||"indeterminate"===l)||C(l)&&!$(l)||"."===l[0]||t&&!$(l)||c&&c.includes(l))&&r(e,l,null,u[l],i,n)}else if(u.onClick)r(e,"onClick",null,u.onClick,void 0,n);else if(4&d&&th(u.style))for(let e in u.style)u.style[e]}(a=u&&u.onVnodeBeforeMount)&&ik(a,n,t),p&&t6(t,null,n,"beforeMount"),((a=u&&u.onVnodeMounted)||p||S)&&r6(()=>{a&&ik(a,n,t),S&&g.enter(e),p&&t6(t,null,n,"mounted")},i)}return e.nextSibling},h=(e,t,r,s,o,c,d)=>{d=d||!!t.dynamicChildren;let h=t.children,f=h.length,p=!1;for(let t=0;t<f;t++){let g=d?h[t]:h[t]=i_(h[t]),m=g.type===r5;e?(m&&!d&&t+1<f&&i_(h[t+1]).type===r5&&(a(i(e.data.slice(g.children.length)),r,l(e)),e.data=g.children),e=u(e,g,s,o,c,d)):m&&!g.children?a(g.el=i(""),r):(!p&&(p=!0,nD(r,1)||nO()),n(null,g,r,null,s,o,nM(r),c))}return e},f=(e,t,n,r,i,o)=>{let{slotScopeIds:u}=t;u&&(i=i?i.concat(u):u);let d=s(e),f=h(l(e),t,d,n,r,i,o);return f&&nP(f)&&"]"===f.data?l(t.anchor=f):(nO(),a(t.anchor=c("]"),d,f),f)},p=(e,t,r,i,a,c)=>{var u,d,h;if(u=e,d=t,nD(u.parentElement,1)||1===(h=u).nodeType&&nV(h.getAttribute(nL),1)||function({props:e}){let t=e&&e[nL];return"string"==typeof t&&nV(t,1)}(d)||nO(),t.el=null,c){let t=g(e);for(;;){let n=l(e);if(n&&n!==t)o(n);else break}}let f=l(e),p=s(e);return o(e),n(null,t,p,f,r,i,nM(p),a),r&&(r.vnode.el=t.el,rO(r,t.el)),f},g=(e,t="[",n="]")=>{let r=0;for(;e;)if((e=l(e))&&nP(e)&&(e.data===t&&r++,e.data===n))if(0===r)return l(e);else r--;return e},m=(e,t,n)=>{let r=t.parentNode;r&&r.replaceChild(e,t);let i=n;for(;i;)i.vnode.el===t&&(i.vnode.el=i.subTree.el=e),i=i.parent},y=e=>1===e.nodeType&&"TEMPLATE"===e.tagName;return[(e,t)=>{if(!t.hasChildNodes()){n(null,e,t),tZ(),t._vnode=e;return}u(t.firstChild,e,null,null,null),tZ(),t._vnode=e},u]}let nL="data-allow-mismatch",n$={0:"text",1:"children",2:"class",3:"style",4:"attribute"};function nD(e,t){if(0===t||1===t)for(;e&&!e.hasAttribute(nL);)e=e.parentElement;return nV(e&&e.getAttribute(nL),t)}function nV(e,t){if(null==e)return!1;{if(""===e)return!0;let n=e.split(",");return!!(0===t&&n.includes("children"))||n.includes(n$[t])}}let nB=Q().requestIdleCallback||(e=>setTimeout(e,1)),nj=Q().cancelIdleCallback||(e=>clearTimeout(e)),nU=e=>!!e.type.__asyncLoader;function nH(e,t){let{ref:n,props:r,children:i,ce:l}=t.vnode,s=ig(e,r,i);return s.ref=n,s.ce=l,delete t.vnode.ce,s}let nq=e=>e.type.__isKeepAlive;function nW(e,t){let n;if(E(e))return e.some(e=>nW(e,t));if(R(e))return e.split(",").includes(t);return"[object RegExp]"===(n=e,F.call(n))&&(e.lastIndex=0,e.test(t))}function nK(e,t){nJ(e,"a",t)}function nz(e,t){nJ(e,"da",t)}function nJ(e,t,n=iN){let r=e.__wdc||(e.__wdc=()=>{let t=n;for(;t;){if(t.isDeactivated)return;t=t.parent}return e()});if(nQ(t,r,n),n){let e=n.parent;for(;e&&e.parent;)nq(e.parent.vnode)&&function(e,t,n,r){let i=nQ(t,e,r,!0);n6(()=>{w(r[t],i)},n)}(r,t,n,e),e=e.parent}}function nG(e){e.shapeFlag&=-257,e.shapeFlag&=-513}function nX(e){return 128&e.shapeFlag?e.ssContent:e}function nQ(e,t,n=iN,r=!1){if(n){let i=n[e]||(n[e]=[]),l=t.__weh||(t.__weh=(...r)=>{eE();let i=iE(n),l=tD(t,n,e,r);return i(),eI(),l});return r?i.unshift(l):i.push(l),l}}let nZ=e=>(t,n=iN)=>{iO&&"sp"!==e||nQ(e,(...e)=>t(...e),n)},nY=nZ("bm"),n0=nZ("m"),n1=nZ("bu"),n2=nZ("u"),n3=nZ("bum"),n6=nZ("um"),n4=nZ("sp"),n8=nZ("rtg"),n5=nZ("rtc");function n9(e,t=iN){nQ("ec",e,t)}let n7="components",re=Symbol.for("v-ndc");function rt(e,t,n=!0,r=!1){let i=t0||iN;if(i){let n=i.type;if(e===n7){let e=iV(n,!1);if(e&&(e===t||e===j(t)||e===q(j(t))))return n}let l=rn(i[e]||n[e],t)||rn(i.appContext[e],t);return!l&&r?n:l}}function rn(e,t){return e&&(e[t]||e[j(t)]||e[q(j(t))])}let rr=e=>e?iR(e)?iD(e):rr(e.parent):null,ri=T(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>e.props,$attrs:e=>e.attrs,$slots:e=>e.slots,$refs:e=>e.refs,$parent:e=>rr(e.parent),$root:e=>rr(e.root),$host:e=>e.ce,$emit:e=>e.emit,$options:e=>rh(e),$forceUpdate:e=>e.f||(e.f=()=>{tJ(e.update)}),$nextTick:e=>e.n||(e.n=tz.bind(e.proxy)),$watch:e=>ne.bind(e)}),rl=(e,t)=>e!==b&&!e.__isScriptSetup&&A(e,t),rs={get({_:e},t){let n,r;if("__v_skip"===t)return!0;let{ctx:i,setupState:l,data:s,props:o,accessCache:a,type:c,appContext:u}=e;if("$"!==t[0]){let e=a[t];if(void 0!==e)switch(e){case 1:return l[t];case 2:return s[t];case 4:return i[t];case 3:return o[t]}else{if(rl(l,t))return a[t]=1,l[t];if(s!==b&&A(s,t))return a[t]=2,s[t];if(A(o,t))return a[t]=3,o[t];if(i!==b&&A(i,t))return a[t]=4,i[t];ru&&(a[t]=0)}}let d=ri[t];return d?("$attrs"===t&&eV(e.attrs,"get",""),d(e)):(n=c.__cssModules)&&(n=n[t])?n:i!==b&&A(i,t)?(a[t]=4,i[t]):A(r=u.config.globalProperties,t)?r[t]:void 0},set({_:e},t,n){let{data:r,setupState:i,ctx:l}=e;return rl(i,t)?(i[t]=n,!0):r!==b&&A(r,t)?(r[t]=n,!0):!A(e.props,t)&&!("$"===t[0]&&t.slice(1)in e)&&(l[t]=n,!0)},has({_:{data:e,setupState:t,accessCache:n,ctx:r,appContext:i,props:l,type:s}},o){let a;return!!(n[o]||e!==b&&"$"!==o[0]&&A(e,o)||rl(t,o)||A(l,o)||A(r,o)||A(ri,o)||A(i.config.globalProperties,o)||(a=s.__cssModules)&&a[o])},defineProperty(e,t,n){return null!=n.get?e._.accessCache[t]=0:A(n,"value")&&this.set(e,t,n.value,null),Reflect.defineProperty(e,t,n)}},ro=T({},rs,{get(e,t){if(t!==Symbol.unscopables)return rs.get(e,t,e)},has:(e,t)=>"_"!==t[0]&&!Z(t)});function ra(e){let t=iA();return t.setupContext||(t.setupContext=i$(t))}function rc(e){return E(e)?e.reduce((e,t)=>(e[t]=null,e),{}):e}let ru=!0;function rd(e,t,n){tD(E(e)?e.map(e=>e.bind(t.proxy)):e.bind(t.proxy),t,n)}function rh(e){let t,n=e.type,{mixins:r,extends:i}=n,{mixins:l,optionsCache:s,config:{optionMergeStrategies:o}}=e.appContext,a=s.get(n);return a?t=a:l.length||r||i?(t={},l.length&&l.forEach(e=>rf(t,e,o,!0)),rf(t,n,o)):t=n,M(n)&&s.set(n,t),t}function rf(e,t,n,r=!1){let{mixins:i,extends:l}=t;for(let s in l&&rf(e,l,n,!0),i&&i.forEach(t=>rf(e,t,n,!0)),t)if(r&&"expose"===s);else{let r=rp[s]||n&&n[s];e[s]=r?r(e[s],t[s]):t[s]}return e}let rp={data:rg,props:rb,emits:rb,methods:ry,computed:ry,beforeCreate:rv,created:rv,beforeMount:rv,mounted:rv,beforeUpdate:rv,updated:rv,beforeDestroy:rv,beforeUnmount:rv,destroyed:rv,unmounted:rv,activated:rv,deactivated:rv,errorCaptured:rv,serverPrefetch:rv,components:ry,directives:ry,watch:function(e,t){if(!e)return t;if(!t)return e;let n=T(Object.create(null),e);for(let r in t)n[r]=rv(e[r],t[r]);return n},provide:rg,inject:function(e,t){return ry(rm(e),rm(t))}};function rg(e,t){return t?e?function(){return T(I(e)?e.call(this,this):e,I(t)?t.call(this,this):t)}:t:e}function rm(e){if(E(e)){let t={};for(let n=0;n<e.length;n++)t[e[n]]=e[n];return t}return e}function rv(e,t){return e?[...new Set([].concat(e,t))]:t}function ry(e,t){return e?T(Object.create(null),e,t):t}function rb(e,t){return e?E(e)&&E(t)?[...new Set([...e,...t])]:T(Object.create(null),rc(e),rc(null!=t?t:{})):t}function r_(){return{app:null,config:{isNativeTag:x,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let rS=0,rx=null,rC=(e,t)=>"modelValue"===t||"model-value"===t?e.modelModifiers:e[`${t}Modifiers`]||e[`${j(t)}Modifiers`]||e[`${H(t)}Modifiers`];function rk(e,t,...n){let r;if(e.isUnmounted)return;let i=e.vnode.props||b,l=n,s=t.startsWith("update:"),o=s&&rC(i,t.slice(7));o&&(o.trim&&(l=n.map(e=>R(e)?e.trim():e)),o.number&&(l=n.map(G)));let a=i[r=W(t)]||i[r=W(j(t))];!a&&s&&(a=i[r=W(H(t))]),a&&tD(a,e,6,l);let c=i[r+"Once"];if(c){if(e.emitted){if(e.emitted[r])return}else e.emitted={};e.emitted[r]=!0,tD(c,e,6,l)}}let rT=new WeakMap;function rw(e,t){return!!e&&!!C(t)&&(A(e,(t="Once"===(t=t.slice(2))?t:t.replace(/Once$/,""))[0].toLowerCase()+t.slice(1))||A(e,H(t))||A(e,t))}function rN(e){let t,n,{type:r,vnode:i,proxy:l,withProxy:s,propsOptions:[o],slots:a,attrs:c,emit:u,render:d,renderCache:h,props:f,data:p,setupState:g,ctx:m,inheritAttrs:y}=e,b=t2(e);try{if(4&i.shapeFlag){let e=s||l;t=i_(d.call(e,e,h,f,g,p,m)),n=c}else t=i_(r.length>1?r(f,{attrs:c,slots:a,emit:u}):r(f,null)),n=r.props?c:rA(c)}catch(n){ie.length=0,tV(n,e,1),t=ig(r9)}let _=t;if(n&&!1!==y){let e=Object.keys(n),{shapeFlag:t}=_;e.length&&7&t&&(o&&e.some(k)&&(n=rE(n,o)),_=iv(_,n,!1,!0))}return i.dirs&&((_=iv(_,null,!1,!0)).dirs=_.dirs?_.dirs.concat(i.dirs):i.dirs),i.transition&&nC(_,i.transition),t=_,t2(b),t}let rA=e=>{let t;for(let n in e)("class"===n||"style"===n||C(n))&&((t||(t={}))[n]=e[n]);return t},rE=(e,t)=>{let n={};for(let r in e)k(r)&&r.slice(9)in t||(n[r]=e[r]);return n};function rI(e,t,n){let r=Object.keys(t);if(r.length!==Object.keys(e).length)return!0;for(let i=0;i<r.length;i++){let l=r[i];if(rR(t,e,l)&&!rw(n,l))return!0}return!1}function rR(e,t,n){let r=e[n],i=t[n];return"style"===n&&M(r)&&M(i)?!eu(r,i):r!==i}function rO({vnode:e,parent:t,suspense:n},r){for(;t;){let n=t.subTree;if(n.suspense&&n.suspense.activeBranch===e&&(n.suspense.vnode.el=n.el=r,e=n),n===e)(e=t.vnode).el=r,t=t.parent;else break}n&&n.activeBranch===e&&(n.vnode.el=r)}let rM={},rP=e=>Object.getPrototypeOf(e)===rM;function rF(e,t,n,r){let i,[l,s]=e.propsOptions,o=!1;if(t)for(let a in t){let c;if($(a))continue;let u=t[a];l&&A(l,c=j(a))?s&&s.includes(c)?(i||(i={}))[c]=u:n[c]=u:rw(e.emitsOptions,a)||a in r&&u===r[a]||(r[a]=u,o=!0)}if(s){let t=tm(n),r=i||b;for(let i=0;i<s.length;i++){let o=s[i];n[o]=rL(l,t,o,r[o],e,!A(r,o))}}return o}function rL(e,t,n,r,i,l){let s=e[n];if(null!=s){let e=A(s,"default");if(e&&void 0===r){let e=s.default;if(s.type!==Function&&!s.skipFactory&&I(e)){let{propsDefaults:l}=i;if(n in l)r=l[n];else{let s=iE(i);r=l[n]=e.call(null,t),s()}}else r=e;i.ce&&i.ce._setProp(n,r)}s[0]&&(l&&!e?r=!1:s[1]&&(""===r||r===H(n))&&(r=!0))}return r}let r$=new WeakMap;function rD(e){return!("$"===e[0]||$(e))}let rV=e=>"_"===e||"_ctx"===e||"$stable"===e,rB=e=>E(e)?e.map(i_):[i_(e)],rj=(e,t,n)=>{if(t._n)return t;let r=t3((...e)=>rB(t(...e)),n);return r._c=!1,r},rU=(e,t,n)=>{let r=e._ctx;for(let n in e){if(rV(n))continue;let i=e[n];if(I(i))t[n]=rj(n,i,r);else if(null!=i){let e=rB(i);t[n]=()=>e}}},rH=(e,t)=>{let n=rB(t);e.slots.default=()=>n},rq=(e,t,n)=>{for(let r in t)(n||!rV(r))&&(e[r]=t[r])},rW=r6;function rK(e){return rz(e,nF)}function rz(e,t){var n;let r,i;Q().__VUE__=!0;let{insert:l,remove:s,patchProp:o,createElement:a,createText:c,createComment:d,setText:h,setElementText:f,parentNode:p,nextSibling:g,setScopeId:m=S,insertStaticContent:y}=e,x=(e,t,n,r=null,i=null,l=null,s,o=null,a=!!t.dynamicChildren)=>{if(e===t)return;e&&!iu(e,t)&&(r=es(e),et(e,i,l,!0),e=null),-2===t.patchFlag&&(a=!1,t.dynamicChildren=null);let{type:c,ref:u,shapeFlag:d}=t;switch(c){case r5:C(e,t,n,r);break;case r9:k(e,t,n,r);break;case r7:null==e&&w(t,n,r,s);break;case r8:B(e,t,n,r,i,l,s,o,a);break;default:1&d?N(e,t,n,r,i,l,s,o,a):6&d?U(e,t,n,r,i,l,s,o,a):64&d?c.process(e,t,n,r,i,l,s,o,a,ec):128&d&&c.process(e,t,n,r,i,l,s,o,a,ec)}null!=u&&i?nE(u,e&&e.ref,l,t||e,!t):null==u&&e&&null!=e.ref&&nE(e.ref,null,l,e,!0)},C=(e,t,n,r)=>{if(null==e)l(t.el=c(t.children),n,r);else{let n=t.el=e.el;t.children!==e.children&&h(n,t.children)}},k=(e,t,n,r)=>{null==e?l(t.el=d(t.children||""),n,r):t.el=e.el},w=(e,t,n,r)=>{[e.el,e.anchor]=y(e.children,t,n,r,e.el,e.anchor)},N=(e,t,n,r,i,l,s,o,a)=>{if("svg"===t.type?s="svg":"math"===t.type&&(s="mathml"),null==e)R(t,n,r,i,l,s,o,a);else{let n=e.el&&e.el._isVueCE?e.el:null;try{n&&n._beginPatch(),L(e,t,i,l,s,o,a)}finally{n&&n._endPatch()}}},R=(e,t,n,r,i,s,c,u)=>{let d,h,{props:p,shapeFlag:g,transition:m,dirs:y}=e;if(d=e.el=a(e.type,s,p&&p.is,p),8&g?f(d,e.children):16&g&&F(e.children,d,null,r,i,rJ(e,s),c,u),y&&t6(e,null,r,"created"),O(d,e,e.scopeId,c,r),p){for(let e in p)"value"===e||$(e)||o(d,e,null,p[e],s,r);"value"in p&&o(d,"value",null,p.value,s),(h=p.onVnodeBeforeMount)&&ik(h,r,e)}y&&t6(e,null,r,"beforeMount");let b=rX(i,m);b&&m.beforeEnter(d),l(d,t,n),((h=p&&p.onVnodeMounted)||b||y)&&rW(()=>{h&&ik(h,r,e),b&&m.enter(d),y&&t6(e,null,r,"mounted")},i)},O=(e,t,n,r,i)=>{if(n&&m(e,n),r)for(let t=0;t<r.length;t++)m(e,r[t]);if(i){let n=i.subTree;if(t===n||rY(n.type)&&(n.ssContent===t||n.ssFallback===t)){let t=i.vnode;O(e,t,t.scopeId,t.slotScopeIds,i.parent)}}},F=(e,t,n,r,i,l,s,o,a=0)=>{for(let c=a;c<e.length;c++)x(null,e[c]=o?iS(e[c]):i_(e[c]),t,n,r,i,l,s,o)},L=(e,t,n,r,i,l,s)=>{let a,c=t.el=e.el,{patchFlag:u,dynamicChildren:d,dirs:h}=t;u|=16&e.patchFlag;let p=e.props||b,g=t.props||b;if(n&&rG(n,!1),(a=g.onVnodeBeforeUpdate)&&ik(a,n,t,e),h&&t6(t,e,n,"beforeUpdate"),n&&rG(n,!0),d&&(!e.dynamicChildren||e.dynamicChildren.length!==d.length)&&(u=0,s=!1,d=null),(p.innerHTML&&null==g.innerHTML||p.textContent&&null==g.textContent)&&f(c,""),d?D(e.dynamicChildren,d,c,n,r,rJ(t,i),l):s||X(e,t,c,null,n,r,rJ(t,i),l,!1),u>0){if(16&u)V(c,p,g,n,i);else if(2&u&&p.class!==g.class&&o(c,"class",null,g.class,i),4&u&&o(c,"style",p.style,g.style,i),8&u){let e=t.dynamicProps;for(let t=0;t<e.length;t++){let r=e[t],l=p[r],s=g[r];(s!==l||"value"===r)&&o(c,r,l,s,i,n)}}1&u&&e.children!==t.children&&f(c,t.children)}else s||null!=d||V(c,p,g,n,i);((a=g.onVnodeUpdated)||h)&&rW(()=>{a&&ik(a,n,t,e),h&&t6(t,e,n,"updated")},r)},D=(e,t,n,r,i,l,s)=>{for(let o=0;o<t.length;o++){let a=e[o],c=t[o],u=a.el&&(a.type===r8||!iu(a,c)||198&a.shapeFlag)?p(a.el):n;x(a,c,u,null,r,i,l,s,!0)}},V=(e,t,n,r,i)=>{if(t!==n){if(t!==b)for(let l in t)$(l)||l in n||o(e,l,t[l],null,i,r);for(let l in n){if($(l))continue;let s=n[l],a=t[l];s!==a&&"value"!==l&&o(e,l,a,s,i,r)}"value"in n&&o(e,"value",t.value,n.value,i)}},B=(e,t,n,r,i,s,o,a,u)=>{let d=t.el=e?e.el:c(""),h=t.anchor=e?e.anchor:c(""),{patchFlag:f,dynamicChildren:p,slotScopeIds:g}=t;g&&(a=a?a.concat(g):g),null==e?(l(d,n,r),l(h,n,r),F(t.children||[],n,h,i,s,o,a,u)):f>0&&64&f&&p&&e.dynamicChildren&&e.dynamicChildren.length===p.length?(D(e.dynamicChildren,p,n,i,s,o,a),(null!=t.key||i&&t===i.subTree)&&rQ(e,t,!0)):X(e,t,n,h,i,s,o,a,u)},U=(e,t,n,r,i,l,s,o,a)=>{t.slotScopeIds=o,null==e?512&t.shapeFlag?i.ctx.activate(t,n,r,s,a):q(t,n,r,i,l,s,a):W(e,t,a)},q=(e,t,n,r,i,l,s)=>{var o,a,c;let d,h,f,p=(o=e,a=r,c=i,d=o.type,h=(a?a.appContext:o.appContext)||iT,(f={uid:iw++,vnode:o,type:d,parent:a,appContext:h,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new em(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:a?a.provides:Object.create(h.provides),ids:a?a.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:function e(t,n,r=!1){let i=r?r$:n.propsCache,l=i.get(t);if(l)return l;let s=t.props,o={},a=[],c=!1;if(!I(t)){let i=t=>{c=!0;let[r,i]=e(t,n,!0);T(o,r),i&&a.push(...i)};!r&&n.mixins.length&&n.mixins.forEach(i),t.extends&&i(t.extends),t.mixins&&t.mixins.forEach(i)}if(!s&&!c)return M(t)&&i.set(t,_),_;if(E(s))for(let e=0;e<s.length;e++){let t=j(s[e]);rD(t)&&(o[t]=b)}else if(s)for(let e in s){let t=j(e);if(rD(t)){let n=s[e],r=o[t]=E(n)||I(n)?{type:n}:T({},n),i=r.type,l=!1,c=!0;if(E(i))for(let e=0;e<i.length;++e){let t=i[e],n=I(t)&&t.name;if("Boolean"===n){l=!0;break}"String"===n&&(c=!1)}else l=I(i)&&"Boolean"===i.name;r[0]=l,r[1]=c,(l||A(r,"default"))&&a.push(t)}}let u=[o,a];return M(t)&&i.set(t,u),u}(d,h),emitsOptions:function e(t,n,r=!1){let i=r?rT:n.emitsCache,l=i.get(t);if(void 0!==l)return l;let s=t.emits,o={},a=!1;if(!I(t)){let i=t=>{let r=e(t,n,!0);r&&(a=!0,T(o,r))};!r&&n.mixins.length&&n.mixins.forEach(i),t.extends&&i(t.extends),t.mixins&&t.mixins.forEach(i)}return s||a?(E(s)?s.forEach(e=>o[e]=null):T(o,s),M(t)&&i.set(t,o),o):(M(t)&&i.set(t,null),null)}(d,h),emit:null,emitted:null,propsDefaults:b,inheritAttrs:d.inheritAttrs,ctx:b,data:b,props:b,attrs:b,slots:b,refs:b,setupState:b,setupContext:null,suspense:c,suspenseId:c?c.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null}).ctx={_:f},f.root=a?a.root:f,f.emit=rk.bind(null,f),o.ce&&o.ce(f),e.component=f);if(nq(e)&&(p.ctx.renderer=ec),function(e,t=!1,n=!1){t&&u(t);let{props:r,children:i}=e.vnode,l=iR(e);!function(e,t,n,r=!1){let i={},l=Object.create(rM);for(let n in e.propsDefaults=Object.create(null),rF(e,t,i,l),e.propsOptions[0])n in i||(i[n]=void 0);n?e.props=r?i:tc(i):e.type.props?e.props=i:e.props=l,e.attrs=l}(e,r,l,t);var s=n||t;let o=e.slots=Object.create(rM);if(32&e.vnode.shapeFlag){let e=i._;e?(rq(o,i,s),s&&J(o,"_",e,!0)):rU(i,o)}else i&&rH(e,i);l&&function(e,t){let n=e.type;e.accessCache=Object.create(null),e.proxy=new Proxy(e.ctx,rs);let{setup:r}=n;if(r){eE();let n=e.setupContext=r.length>1?i$(e):null,i=iE(e),l=t$(r,e,0,[e.props,n]),s=P(l);if(eI(),i(),(s||e.sp)&&!nU(e)&&nw(e),s){if(l.then(iI,iI),t)return l.then(n=>{iM(e,n,t)}).catch(t=>{tV(t,e,0)});e.asyncDep=l}else iM(e,l,t)}else iF(e,t)}(e,t),t&&u(!1)}(p,!1,s),p.asyncDep){if(i&&i.registerDep(p,K,s),!e.el){let r=p.subTree=ig(r9);k(null,r,t,n),e.placeholder=r.el}}else K(p,e,t,n,i,l,s)},W=(e,t,n)=>{let r=t.component=e.component;if(function(e,t,n){let{props:r,children:i,component:l}=e,{props:s,children:o,patchFlag:a}=t,c=l.emitsOptions;if(t.dirs||t.transition)return!0;if(!n||!(a>=0))return(!!i||!!o)&&(!o||!o.$stable)||r!==s&&(r?!s||rI(r,s,c):!!s);if(1024&a)return!0;if(16&a)return r?rI(r,s,c):!!s;if(8&a){let e=t.dynamicProps;for(let t=0;t<e.length;t++){let n=e[t];if(rR(s,r,n)&&!rw(c,n))return!0}}return!1}(e,t,n))if(r.asyncDep&&!r.asyncResolved)return void G(r,t,n);else r.next=t,r.update();else t.el=e.el,r.vnode=t},K=(e,t,n,r,l,s,o)=>{e.scope.on();let a=e.effect=new ey(()=>{if(e.isMounted){let t,{next:n,bu:r,u:i,parent:a,vnode:u}=e;{let t=function e(t){let n=t.subTree.component;if(n)if(n.asyncDep&&!n.asyncResolved)return n;else return e(n)}(e);if(t){n&&(n.el=u.el,G(e,n,o)),t.asyncDep.then(()=>{rW(()=>{e.isUnmounted||c()},l)});return}}let d=n;rG(e,!1),n?(n.el=u.el,G(e,n,o)):n=u,r&&z(r),(t=n.props&&n.props.onVnodeBeforeUpdate)&&ik(t,a,n,u),rG(e,!0);let h=rN(e),f=e.subTree;e.subTree=h,x(f,h,p(f.el),es(f),e,l,s),n.el=h.el,null===d&&rO(e,h.el),i&&rW(i,l),(t=n.props&&n.props.onVnodeUpdated)&&rW(()=>ik(t,a,n,u),l)}else{let o,{el:a,props:c}=t,{bm:u,m:d,parent:h,root:f,type:p}=e,g=nU(t);if(rG(e,!1),u&&z(u),!g&&(o=c&&c.onVnodeBeforeMount)&&ik(o,h,t),rG(e,!0),a&&i){let t=()=>{e.subTree=rN(e),i(a,e.subTree,e,l,null)};g&&p.__asyncHydrate?p.__asyncHydrate(a,e,t):t()}else{f.ce&&f.ce._hasShadowRoot()&&f.ce._injectChildStyle(p,e.parent?e.parent.type:void 0);let i=e.subTree=rN(e);x(null,i,n,r,e,l,s),t.el=i.el}if(d&&rW(d,l),!g&&(o=c&&c.onVnodeMounted)){let e=t;rW(()=>ik(o,h,e),l)}(256&t.shapeFlag||h&&nU(h.vnode)&&256&h.vnode.shapeFlag)&&e.a&&rW(e.a,l),e.isMounted=!0,t=n=r=null}});e.scope.off();let c=e.update=a.run.bind(a),u=e.job=a.runIfDirty.bind(a);u.i=e,u.id=e.uid,a.scheduler=()=>tJ(u),rG(e,!0),c()},G=(e,t,n)=>{t.component=e;let r=e.vnode.props;e.vnode=t,e.next=null,function(e,t,n,r){let{props:i,attrs:l,vnode:{patchFlag:s}}=e,o=tm(i),[a]=e.propsOptions,c=!1;if((r||s>0)&&!(16&s)){if(8&s){let n=e.vnode.dynamicProps;for(let r=0;r<n.length;r++){let s=n[r];if(rw(e.emitsOptions,s))continue;let u=t[s];if(a)if(A(l,s))u!==l[s]&&(l[s]=u,c=!0);else{let t=j(s);i[t]=rL(a,o,t,u,e,!1)}else u!==l[s]&&(l[s]=u,c=!0)}}}else{let r;for(let s in rF(e,t,i,l)&&(c=!0),o)t&&(A(t,s)||(r=H(s))!==s&&A(t,r))||(a?n&&(void 0!==n[s]||void 0!==n[r])&&(i[s]=rL(a,o,s,void 0,e,!0)):delete i[s]);if(l!==o)for(let e in l)t&&A(t,e)||(delete l[e],c=!0)}c&&eB(e.attrs,"set","")}(e,t.props,r,n),((e,t,n)=>{let{vnode:r,slots:i}=e,l=!0,s=b;if(32&r.shapeFlag){let e=t._;e?n&&1===e?l=!1:rq(i,t,n):(l=!t.$stable,rU(t,i)),s=t}else t&&(rH(e,t),s={default:1});if(l)for(let e in i)rV(e)||null!=s[e]||delete i[e]})(e,t.children,n),eE(),tQ(e),eI()},X=(e,t,n,r,i,l,s,o,a=!1)=>{let c=e&&e.children,u=e?e.shapeFlag:0,d=t.children,{patchFlag:h,shapeFlag:p}=t;if(h>0){if(128&h)return void Y(c,d,n,r,i,l,s,o,a);else if(256&h)return void Z(c,d,n,r,i,l,s,o,a)}8&p?(16&u&&el(c,i,l),d!==c&&f(n,d)):16&u?16&p?Y(c,d,n,r,i,l,s,o,a):el(c,i,l,!0):(8&u&&f(n,""),16&p&&F(d,n,r,i,l,s,o,a))},Z=(e,t,n,r,i,l,s,o,a)=>{let c;e=e||_,t=t||_;let u=e.length,d=t.length,h=Math.min(u,d);for(c=0;c<h;c++){let r=t[c]=a?iS(t[c]):i_(t[c]);x(e[c],r,n,null,i,l,s,o,a)}u>d?el(e,i,l,!0,!1,h):F(t,n,r,i,l,s,o,a,h)},Y=(e,t,n,r,i,l,s,o,a)=>{let c=0,u=t.length,d=e.length-1,h=u-1;for(;c<=d&&c<=h;){let r=e[c],u=t[c]=a?iS(t[c]):i_(t[c]);if(iu(r,u))x(r,u,n,null,i,l,s,o,a);else break;c++}for(;c<=d&&c<=h;){let r=e[d],c=t[h]=a?iS(t[h]):i_(t[h]);if(iu(r,c))x(r,c,n,null,i,l,s,o,a);else break;d--,h--}if(c>d){if(c<=h){let e=h+1,d=e<u?t[e].el:r;for(;c<=h;)x(null,t[c]=a?iS(t[c]):i_(t[c]),n,d,i,l,s,o,a),c++}}else if(c>h)for(;c<=d;)et(e[c],i,l,!0),c++;else{let f,p=c,g=c,m=new Map;for(c=g;c<=h;c++){let e=t[c]=a?iS(t[c]):i_(t[c]);null!=e.key&&m.set(e.key,c)}let y=0,b=h-g+1,S=!1,C=0,k=Array(b);for(c=0;c<b;c++)k[c]=0;for(c=p;c<=d;c++){let r,u=e[c];if(y>=b){et(u,i,l,!0);continue}if(null!=u.key)r=m.get(u.key);else for(f=g;f<=h;f++)if(0===k[f-g]&&iu(u,t[f])){r=f;break}void 0===r?et(u,i,l,!0):(k[r-g]=c+1,r>=C?C=r:S=!0,x(u,t[r],n,null,i,l,s,o,a),y++)}let T=S?function(e){let t,n,r,i,l,s=e.slice(),o=[0],a=e.length;for(t=0;t<a;t++){let a=e[t];if(0!==a){if(e[n=o[o.length-1]]<a){s[t]=n,o.push(t);continue}for(r=0,i=o.length-1;r<i;)e[o[l=r+i>>1]]<a?r=l+1:i=l;a<e[o[r]]&&(r>0&&(s[t]=o[r-1]),o[r]=t)}}for(r=o.length,i=o[r-1];r-- >0;)o[r]=i,i=s[i];return o}(k):_;for(f=T.length-1,c=b-1;c>=0;c--){let e=g+c,d=t[e],h=t[e+1],p=e+1<u?h.el||function e(t){if(t.placeholder)return t.placeholder;let n=t.component;return n?e(n.subTree):null}(h):r;0===k[c]?x(null,d,n,p,i,l,s,o,a):S&&(f<0||c!==T[f]?ee(d,n,p,2):f--)}}},ee=(e,t,n,r,i=null)=>{let{el:o,type:a,transition:c,children:u,shapeFlag:d}=e;if(6&d)return void ee(e.component.subTree,t,n,r);if(128&d)return void e.suspense.move(t,n,r);if(64&d)return void a.move(e,t,n,ec);if(a===r8){l(o,t,n);for(let e=0;e<u.length;e++)ee(u[e],t,n,r);l(e.anchor,t,n);return}if(a===r7)return void(({el:e,anchor:t},n,r)=>{let i;for(;e&&e!==t;)i=g(e),l(e,n,r),e=i;l(t,n,r)})(e,t,n);if(2!==r&&1&d&&c)if(0===r)c.persisted&&!o[nd]?l(o,t,n):(c.beforeEnter(o),l(o,t,n),rW(()=>c.enter(o),i));else{let{leave:r,delayLeave:i,afterLeave:a}=c,u=()=>{e.ctx.isUnmounted?s(o):l(o,t,n)},d=()=>{let e=o._isLeaving||!!o[nd];o._isLeaving&&o[nd](!0),c.persisted&&!e?u():r(o,()=>{u(),a&&a()})};i?i(o,u,d):d()}else l(o,t,n)},et=(e,t,n,r=!1,i=!1)=>{let l,{type:s,props:o,ref:a,children:c,dynamicChildren:u,shapeFlag:d,patchFlag:h,dirs:f,cacheIndex:p,memo:g}=e;if(-2===h&&(i=!1),null!=a&&(eE(),nE(a,null,n,e,!0),eI()),null!=p&&(t.renderCache[p]=void 0),256&d)return void t.ctx.deactivate(e);let m=1&d&&f,y=!nU(e);if(y&&(l=o&&o.onVnodeBeforeUnmount)&&ik(l,t,e),6&d)ei(e.component,n,r);else{if(128&d)return void e.suspense.unmount(n,r);m&&t6(e,null,t,"beforeUnmount"),64&d?e.type.remove(e,t,n,ec,r):u&&!u.hasOnce&&(s!==r8||h>0&&64&h)?el(u,t,n,!1,!0):(s===r8&&384&h||!i&&16&d)&&el(c,t,n),r&&en(e)}let b=null!=g&&null==p;(y&&(l=o&&o.onVnodeUnmounted)||m||b)&&rW(()=>{l&&ik(l,t,e),m&&t6(e,null,t,"unmounted"),b&&(e.el=null)},n)},en=e=>{let{type:t,el:n,anchor:r,transition:i}=e;if(t===r8)return void er(n,r);if(t===r7)return void(({el:e,anchor:t})=>{let n;for(;e&&e!==t;)n=g(e),s(e),e=n;s(t)})(e);let l=()=>{s(n),i&&!i.persisted&&i.afterLeave&&i.afterLeave()};if(1&e.shapeFlag&&i&&!i.persisted){let{leave:t,delayLeave:r}=i,s=()=>t(n,l);r?r(e.el,l,s):s()}else l()},er=(e,t)=>{let n;for(;e!==t;)n=g(e),s(e),e=n;s(t)},ei=(e,t,n)=>{let{bum:r,scope:i,job:l,subTree:s,um:o,m:a,a:c}=e;rZ(a),rZ(c),r&&z(r),i.stop(),l&&(l.flags|=8,et(s,e,t,n)),o&&rW(o,t),rW(()=>{e.isUnmounted=!0},t)},el=(e,t,n,r=!1,i=!1,l=0)=>{for(let s=l;s<e.length;s++)et(e[s],t,n,r,i)},es=e=>{if(6&e.shapeFlag)return es(e.component.subTree);if(128&e.shapeFlag)return e.suspense.next();let t=g(e.anchor||e.el),n=t&&t[nr];return n?g(n):t},eo=!1,ea=(e,t,n)=>{let r;null==e?t._vnode&&(et(t._vnode,null,null,!0),r=t._vnode.component):x(t._vnode||null,e,t,null,null,null,n),t._vnode=e,eo||(eo=!0,tQ(r),tZ(),eo=!1)},ec={p:x,um:et,m:ee,r:en,mt:q,mc:F,pc:X,pbc:D,n:es,o:e};return t&&([r,i]=t(ec)),{render:ea,hydrate:r,createApp:(n=r,function(e,t=null){I(e)||(e=T({},e)),null==t||M(t)||(t=null);let r=r_(),i=new WeakSet,l=[],s=!1,o=r.app={_uid:rS++,_component:e,_props:t,_container:null,_context:r,_instance:null,version:iH,get config(){return r.config},set config(v){},use:(e,...t)=>(i.has(e)||(e&&I(e.install)?(i.add(e),e.install(o,...t)):I(e)&&(i.add(e),e(o,...t))),o),mixin:e=>(r.mixins.includes(e)||r.mixins.push(e),o),component:(e,t)=>t?(r.components[e]=t,o):r.components[e],directive:(e,t)=>t?(r.directives[e]=t,o):r.directives[e],mount(i,l,a){if(!s){let c=o._ceVNode||ig(e,t);return c.appContext=r,!0===a?a="svg":!1===a&&(a=void 0),l&&n?n(c,i):ea(c,i,a),s=!0,o._container=i,i.__vue_app__=o,iD(c.component)}},onUnmount(e){l.push(e)},unmount(){s&&(tD(l,o._instance,16),ea(null,o._container),delete o._container.__vue_app__)},provide:(e,t)=>(r.provides[e]=t,o),runWithContext(e){let t=rx;rx=o;try{return e()}finally{rx=t}}};return o})}}function rJ({type:e,props:t},n){return"svg"===n&&"foreignObject"===e||"mathml"===n&&"annotation-xml"===e&&t&&t.encoding&&t.encoding.includes("html")?void 0:n}function rG({effect:e,job:t},n){n?(e.flags|=32,t.flags|=4):(e.flags&=-33,t.flags&=-5)}function rX(e,t){return(!e||e&&!e.pendingBranch)&&t&&!t.persisted}function rQ(e,t,n=!1){let r=e.children,i=t.children;if(E(r)&&E(i))for(let e=0;e<r.length;e++){let t=r[e],l=i[e];1&l.shapeFlag&&!l.dynamicChildren&&((l.patchFlag<=0||32===l.patchFlag)&&((l=i[e]=iS(i[e])).el=t.el),n||-2===l.patchFlag||rQ(t,l)),l.type===r5&&(-1===l.patchFlag&&(l=i[e]=iS(l)),l.el=t.el),l.type!==r9||l.el||(l.el=t.el)}}function rZ(e){if(e)for(let t=0;t<e.length;t++)e[t].flags|=8}let rY=e=>e.__isSuspense,r0=0;function r1(e,t){let n=e.props&&e.props[t];I(n)&&n()}function r2(e,t,n,r,i,l,s,o,a,c,u=!1){var d;let h,f,{p:p,m:g,um:m,n:y,o:{parentNode:b,remove:_}}=c,S=null!=(h=(d=e).props&&d.props.suspensible)&&!1!==h;S&&t&&t.pendingBranch&&(f=t.pendingId,t.deps++);let x=e.props?X(e.props.timeout):void 0,C=l,k={vnode:e,parent:t,parentComponent:n,namespace:s,container:r,hiddenContainer:i,deps:0,pendingId:r0++,timeout:"number"==typeof x?x:-1,activeBranch:null,isFallbackMountPending:!1,pendingBranch:null,isInFallback:!u,isHydrating:u,isUnmounted:!1,effects:[],resolve(e=!1,n=!1){let{vnode:r,activeBranch:i,pendingBranch:s,pendingId:o,effects:a,parentComponent:c,container:u,isInFallback:d}=k,h=!1;if(k.isHydrating)k.isHydrating=!1;else if(!e){h=i&&s.transition&&"out-in"===s.transition.mode;let e=!1;h&&(i.transition.afterLeave=()=>{o===k.pendingId&&(g(s,u,l!==C||e?l:y(i),0),tX(a),d&&r.ssFallback&&(r.ssFallback.el=null))}),i&&!k.isFallbackMountPending&&(b(i.el)===u&&(l=y(i),e=!0),m(i,c,k,!0),!h&&d&&r.ssFallback&&rW(()=>r.ssFallback.el=null,k)),h||g(s,u,l,0)}k.isFallbackMountPending=!1,r4(k,s),k.pendingBranch=null,k.isInFallback=!1;let p=k.parent,_=!1;for(;p;){if(p.pendingBranch){p.effects.push(...a),_=!0;break}p=p.parent}_||h||tX(a),k.effects=[],S&&t&&t.pendingBranch&&f===t.pendingId&&(t.deps--,0!==t.deps||n||t.resolve()),r1(r,"onResolve")},fallback(e){if(!k.pendingBranch)return;let{vnode:t,activeBranch:n,parentComponent:r,container:i,namespace:l}=k;r1(t,"onFallback");let s=y(n),c=()=>{k.isFallbackMountPending=!1,k.isInFallback&&(p(null,e,i,s,r,null,l,o,a),r4(k,e))},u=e.transition&&"out-in"===e.transition.mode;u&&(k.isFallbackMountPending=!0,n.transition.afterLeave=c),k.isInFallback=!0,m(n,r,null,!0),u||c()},move(e,t,n){k.activeBranch&&g(k.activeBranch,e,t,n),k.container=e},next:()=>k.activeBranch&&y(k.activeBranch),registerDep(e,t,n){let r=!!k.pendingBranch;r&&k.deps++;let i=e.vnode.el;e.asyncDep.catch(t=>{tV(t,e,0)}).then(l=>{if(e.isUnmounted||k.isUnmounted||k.pendingId!==e.suspenseId)return;iI(),e.asyncResolved=!0;let{vnode:o}=e;iM(e,l,!1),i&&(o.el=i);let a=!i&&e.subTree.el;t(e,o,b(i||e.subTree.el),i?null:y(e.subTree),k,s,n),a&&(o.placeholder=null,_(a)),rO(e,o.el),r&&0==--k.deps&&k.resolve()})},unmount(e,t){k.isUnmounted=!0,k.activeBranch&&m(k.activeBranch,n,e,t),k.pendingBranch&&m(k.pendingBranch,n,e,t)}};return k}function r3(e){let t;if(I(e)){let n=il&&e._c;n&&(e._d=!1,ir()),e=e(),n&&(e._d=!0,t=it,ii())}return E(e)&&(e=function(e){let t;for(let n=0;n<e.length;n++){let r=e[n];if(!ic(r))return;if(r.type!==r9||"v-if"===r.children)if(t)return;else t=r}return t}(e)),e=i_(e),t&&!e.dynamicChildren&&(e.dynamicChildren=t.filter(t=>t!==e)),e}function r6(e,t){t&&t.pendingBranch?E(e)?t.effects.push(...e):t.effects.push(e):tX(e)}function r4(e,t){e.activeBranch=t;let{vnode:n,parentComponent:r}=e,i=t.el;for(;!i&&t.component;)i=(t=t.component.subTree).el;n.el=i,r&&r.subTree===n&&(r.vnode.el=i,rO(r,i))}let r8=Symbol.for("v-fgt"),r5=Symbol.for("v-txt"),r9=Symbol.for("v-cmt"),r7=Symbol.for("v-stc"),ie=[],it=null;function ir(e=!1){ie.push(it=e?null:[])}function ii(){ie.pop(),it=ie[ie.length-1]||null}let il=1;function is(e,t=!1){il+=e,e<0&&it&&t&&(it.hasOnce=!0)}function io(e){return e.dynamicChildren=il>0?it||_:null,ii(),il>0&&it&&it.push(e),e}function ia(e,t,n,r,i){return io(ig(e,t,n,r,i,!0))}function ic(e){return!!e&&!0===e.__v_isVNode}function iu(e,t){return e.type===t.type&&e.key===t.key}let id=({key:e})=>null!=e?e:null,ih=({ref:e,ref_key:t,ref_for:n})=>("number"==typeof e&&(e=""+e),null!=e?R(e)||t_(e)||I(e)?{i:t0,r:e,k:t,f:!!n}:e:null);function ip(e,t=null,n=null,r=0,i=null,l=+(e!==r8),s=!1,o=!1){let a={__v_isVNode:!0,__v_skip:!0,type:e,props:t,key:t&&id(t),ref:t&&ih(t),scopeId:t1,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:l,patchFlag:r,dynamicProps:i,dynamicChildren:null,appContext:null,ctx:t0};return o?(ix(a,n),128&l&&e.normalize(a)):n&&(a.shapeFlag|=R(n)?8:16),il>0&&!s&&it&&(a.patchFlag>0||6&l)&&32!==a.patchFlag&&it.push(a),a}let ig=function(e,t=null,n=null,r=0,i=null,l=!1){var s;if(e&&e!==re||(e=r9),ic(e)){let r=iv(e,t,!0);return n&&ix(r,n),il>0&&!l&&it&&(6&r.shapeFlag?it[it.indexOf(e)]=r:it.push(r)),r.patchFlag=-2,r}if(I(s=e)&&"__vccOpts"in s&&(e=e.__vccOpts),t){let{class:e,style:n}=t=im(t);e&&!R(e)&&(t.class=ei(e)),M(n)&&(tg(n)&&!E(n)&&(n=T({},n)),t.style=Y(n))}let o=R(e)?1:rY(e)?128:e.__isTeleport?64:M(e)?4:2*!!I(e);return ip(e,t,n,r,i,o,l,!0)};function im(e){return e?tg(e)||rP(e)?T({},e):e:null}function iv(e,t,n=!1,r=!1){let{props:i,ref:l,patchFlag:s,children:o,transition:a}=e,c=t?iC(i||{},t):i,u={__v_isVNode:!0,__v_skip:!0,type:e.type,props:c,key:c&&id(c),ref:t&&t.ref?n&&l?E(l)?l.concat(ih(t)):[l,ih(t)]:ih(t):l,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:o,target:e.target,targetStart:e.targetStart,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==r8?-1===s?16:16|s:s,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:a,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&iv(e.ssContent),ssFallback:e.ssFallback&&iv(e.ssFallback),placeholder:e.placeholder,el:e.el,anchor:e.anchor,ctx:e.ctx,ce:e.ce};return a&&r&&nC(u,a.clone(u)),u}function iy(e=" ",t=0){return ig(r5,null,e,t)}function ib(e="",t=!1){return t?(ir(),ia(r9,null,e)):ig(r9,null,e)}function i_(e){return null==e||"boolean"==typeof e?ig(r9):E(e)?ig(r8,null,e.slice()):ic(e)?iS(e):ig(r5,null,String(e))}function iS(e){return null===e.el&&-1!==e.patchFlag||e.memo?e:iv(e)}function ix(e,t){let n=0,{shapeFlag:r}=e;if(null==t)t=null;else if(E(t))n=16;else if("object"==typeof t)if(65&r){let n=t.default;n&&(n._c&&(n._d=!1),ix(e,n()),n._c&&(n._d=!0));return}else{n=32;let r=t._;r||rP(t)?3===r&&t0&&(1===t0.slots._?t._=1:(t._=2,e.patchFlag|=1024)):t._ctx=t0}else if(I(t)){if(65&r)return void ix(e,{default:t});t={default:t,_ctx:t0},n=32}else t=String(t),64&r?(n=16,t=[iy(t)]):n=8;e.children=t,e.shapeFlag|=n}function iC(...e){let t={};for(let n=0;n<e.length;n++){let r=e[n];for(let e in r)if("class"===e)t.class!==r.class&&(t.class=ei([t.class,r.class]));else if("style"===e)t.style=Y([t.style,r.style]);else if(C(e)){let n=t[e],i=r[e];i&&n!==i&&!(E(n)&&n.includes(i))?t[e]=n?[].concat(n,i):i:null!=i||null!=n||k(e)||(t[e]=i)}else""!==e&&(t[e]=r[e])}return t}function ik(e,t,n,r=null){tD(e,t,7,[n,r])}let iT=r_(),iw=0,iN=null,iA=()=>iN||t0;c=e=>{iN=e},u=e=>{iO=e};let iE=e=>{let t=iN;return c(e),e.scope.on(),()=>{e.scope.off(),c(t)}},iI=()=>{iN&&iN.scope.off(),c(null)};function iR(e){return 4&e.vnode.shapeFlag}let iO=!1;function iM(e,t,n){I(t)?e.render=t:M(t)&&(e.setupState=tN(t)),iF(e,n)}function iP(e){d=e,h=e=>{e.render._rc&&(e.withProxy=new Proxy(e.ctx,ro))}}function iF(e,t,n){let r=e.type;if(!e.render){if(!t&&d&&!r.render){let t=r.template||rh(e).template;if(t){let{isCustomElement:n,compilerOptions:i}=e.appContext.config,{delimiters:l,compilerOptions:s}=r,o=T(T({isCustomElement:n,delimiters:l},i),s);r.render=d(t,o)}}e.render=r.render||S,h&&h(e)}{let t=iE(e);eE();try{!function(e){let t=rh(e),n=e.proxy,r=e.ctx;ru=!1,t.beforeCreate&&rd(t.beforeCreate,e,"bc");let{data:i,computed:l,methods:s,watch:o,provide:a,inject:c,created:u,beforeMount:d,mounted:h,beforeUpdate:f,updated:p,activated:g,deactivated:m,beforeUnmount:y,unmounted:b,render:_,renderTracked:x,renderTriggered:C,errorCaptured:k,serverPrefetch:T,expose:w,inheritAttrs:N,components:A,directives:O}=t;if(c&&function(e,t){for(let n in E(e)&&(e=rm(e)),e){let r,i=e[n];t_(r=M(i)?"default"in i?t8(i.from||n,i.default,!0):t8(i.from||n):t8(i))?Object.defineProperty(t,n,{enumerable:!0,configurable:!0,get:()=>r.value,set:e=>r.value=e}):t[n]=r}}(c,r),s)for(let e in s){let t=s[e];I(t)&&(r[e]=t.bind(n))}if(i){let t=i.call(n,n);M(t)&&(e.data=ta(t))}if(ru=!0,l)for(let e in l){let t=l[e],i=I(t)?t.bind(n,n):I(t.get)?t.get.bind(n,n):S,s=iB({get:i,set:!I(t)&&I(t.set)?t.set.bind(n):S});Object.defineProperty(r,e,{enumerable:!0,configurable:!0,get:()=>s.value,set:e=>s.value=e})}if(o)for(let e in o)!function e(t,n,r,i){let l=i.includes(".")?nt(r,i):()=>r[i];if(R(t)){let e=n[t];I(e)&&t7(l,e,void 0)}else if(I(t))t7(l,t.bind(r),void 0);else if(M(t))if(E(t))t.forEach(t=>e(t,n,r,i));else{let e=I(t.handler)?t.handler.bind(r):n[t.handler];I(e)&&t7(l,e,t)}}(o[e],r,n,e);if(a){let e=I(a)?a.call(n):a;Reflect.ownKeys(e).forEach(t=>{t4(t,e[t])})}function P(e,t){E(t)?t.forEach(t=>e(t.bind(n))):t&&e(t.bind(n))}if(u&&rd(u,e,"c"),P(nY,d),P(n0,h),P(n1,f),P(n2,p),P(nK,g),P(nz,m),P(n9,k),P(n5,x),P(n8,C),P(n3,y),P(n6,b),P(n4,T),E(w))if(w.length){let t=e.exposed||(e.exposed={});w.forEach(e=>{Object.defineProperty(t,e,{get:()=>n[e],set:t=>n[e]=t,enumerable:!0})})}else e.exposed||(e.exposed={});_&&e.render===S&&(e.render=_),null!=N&&(e.inheritAttrs=N),A&&(e.components=A),O&&(e.directives=O)}(e)}finally{eI(),t()}}}let iL={get:(e,t)=>(eV(e,"get",""),e[t])};function i$(e){return{attrs:new Proxy(e.attrs,iL),slots:e.slots,emit:e.emit,expose:t=>{e.exposed=t||{}}}}function iD(e){return e.exposed?e.exposeProxy||(e.exposeProxy=new Proxy(tN(tv(e.exposed)),{get:(t,n)=>n in t?t[n]:n in ri?ri[n](e):void 0,has:(e,t)=>t in e||t in ri})):e.proxy}function iV(e,t=!0){return I(e)?e.displayName||e.name:e.name||t&&e.__name}let iB=(e,t)=>(function(e,t=!1){let n,r;return I(e)?n=e:(n=e.get,r=e.set),new tO(n,r,t)})(e,iO);function ij(e,t,n){try{is(-1);let r=arguments.length;if(2!==r)return r>3?n=Array.prototype.slice.call(arguments,2):3===r&&ic(n)&&(n=[n]),ig(e,t,n);if(!M(t)||E(t))return ig(e,null,t);if(ic(t))return ig(e,null,[t]);return ig(e,t)}finally{is(1)}}function iU(e,t){let n=e.memo;if(n.length!=t.length)return!1;for(let e=0;e<n.length;e++)if(K(n[e],t[e]))return!1;return il>0&&it&&it.push(e),!0}let iH="3.5.40",iq="u">typeof window&&window.trustedTypes;if(iq)try{m=iq.createPolicy("vue",{createHTML:e=>e})}catch(e){}let iW=m?e=>m.createHTML(e):e=>e,iK="u">typeof document?document:null,iz=iK&&iK.createElement("template"),iJ={insert:(e,t,n)=>{t.insertBefore(e,n||null)},remove:e=>{let t=e.parentNode;t&&t.removeChild(e)},createElement:(e,t,n,r)=>{let i="svg"===t?iK.createElementNS("http://www.w3.org/2000/svg",e):"mathml"===t?iK.createElementNS("http://www.w3.org/1998/Math/MathML",e):n?iK.createElement(e,{is:n}):iK.createElement(e);return"select"===e&&r&&null!=r.multiple&&i.setAttribute("multiple",r.multiple),i},createText:e=>iK.createTextNode(e),createComment:e=>iK.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>iK.querySelector(e),setScopeId(e,t){e.setAttribute(t,"")},insertStaticContent(e,t,n,r,i,l){let s=n?n.previousSibling:t.lastChild;if(i&&(i===l||i.nextSibling))for(;t.insertBefore(i.cloneNode(!0),n),i!==l&&(i=i.nextSibling););else{iz.innerHTML=iW("svg"===r?`<svg>${e}</svg>`:"mathml"===r?`<math>${e}</math>`:e);let i=iz.content;if("svg"===r||"mathml"===r){let e=i.firstChild;for(;e.firstChild;)i.appendChild(e.firstChild);i.removeChild(e)}t.insertBefore(i,n)}return[s?s.nextSibling:t.firstChild,n?n.previousSibling:t.lastChild]}},iG="transition",iX="animation",iQ=Symbol("_vtc"),iZ={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String},iY=T({},ng,iZ),i0=((t=(e,{slots:t})=>ij(ny,i3(e),t)).displayName="Transition",t.props=iY,t),i1=(e,t=[])=>{E(e)?e.forEach(e=>e(...t)):e&&e(...t)},i2=e=>!!e&&(E(e)?e.some(e=>e.length>1):e.length>1);function i3(e){let t={};for(let n in e)n in iZ||(t[n]=e[n]);if(!1===e.css)return t;let{name:n="v",type:r,duration:i,enterFromClass:l=`${n}-enter-from`,enterActiveClass:s=`${n}-enter-active`,enterToClass:o=`${n}-enter-to`,appearFromClass:a=l,appearActiveClass:c=s,appearToClass:u=o,leaveFromClass:d=`${n}-leave-from`,leaveActiveClass:h=`${n}-leave-active`,leaveToClass:f=`${n}-leave-to`}=e,p=function(e){if(null==e)return null;{if(M(e))return[function(e){return X(e)}(e.enter),function(e){return X(e)}(e.leave)];let t=function(e){return X(e)}(e);return[t,t]}}(i),g=p&&p[0],m=p&&p[1],{onBeforeEnter:y,onEnter:b,onEnterCancelled:_,onLeave:S,onLeaveCancelled:x,onBeforeAppear:C=y,onAppear:k=b,onAppearCancelled:w=_}=t,N=(e,t,n,r)=>{e._enterCancelled=r,i4(e,t?u:o),i4(e,t?c:s),n&&n()},A=(e,t)=>{e._isLeaving=!1,i4(e,d),i4(e,f),i4(e,h),t&&t()},E=e=>(t,n)=>{let i=e?k:b,s=()=>N(t,e,n);i1(i,[t,s]),i8(()=>{i4(t,e?a:l),i6(t,e?u:o),i2(i)||i9(t,r,g,s)})};return T(t,{onBeforeEnter(e){i1(y,[e]),i6(e,l),i6(e,s)},onBeforeAppear(e){i1(C,[e]),i6(e,a),i6(e,c)},onEnter:E(!1),onAppear:E(!0),onLeave(e,t){e._isLeaving=!0;let n=()=>A(e,t);i6(e,d),e._enterCancelled?(i6(e,h),ln(e)):(ln(e),i6(e,h)),i8(()=>{e._isLeaving&&(i4(e,d),i6(e,f),i2(S)||i9(e,r,m,n))}),i1(S,[e,n])},onEnterCancelled(e){N(e,!1,void 0,!0),i1(_,[e])},onAppearCancelled(e){N(e,!0,void 0,!0),i1(w,[e])},onLeaveCancelled(e){A(e),i1(x,[e])}})}function i6(e,t){t.split(/\s+/).forEach(t=>t&&e.classList.add(t)),(e[iQ]||(e[iQ]=new Set)).add(t)}function i4(e,t){t.split(/\s+/).forEach(t=>t&&e.classList.remove(t));let n=e[iQ];n&&(n.delete(t),n.size||(e[iQ]=void 0))}function i8(e){requestAnimationFrame(()=>{requestAnimationFrame(e)})}let i5=0;function i9(e,t,n,r){let i=e._endId=++i5,l=()=>{i===e._endId&&r()};if(null!=n)return setTimeout(l,n);let{type:s,timeout:o,propCount:a}=i7(e,t);if(!s)return r();let c=s+"end",u=0,d=()=>{e.removeEventListener(c,h),l()},h=t=>{t.target===e&&++u>=a&&d()};setTimeout(()=>{u<a&&d()},o+1),e.addEventListener(c,h)}function i7(e,t){let n=window.getComputedStyle(e),r=e=>(n[e]||"").split(", "),i=r(`${iG}Delay`),l=r(`${iG}Duration`),s=le(i,l),o=r(`${iX}Delay`),a=r(`${iX}Duration`),c=le(o,a),u=null,d=0,h=0;t===iG?s>0&&(u=iG,d=s,h=l.length):t===iX?c>0&&(u=iX,d=c,h=a.length):h=(u=(d=Math.max(s,c))>0?s>c?iG:iX:null)?u===iG?l.length:a.length:0;let f=u===iG&&/\b(?:transform|all)(?:,|$)/.test(r(`${iG}Property`).toString());return{type:u,timeout:d,propCount:h,hasTransform:f}}function le(e,t){for(;e.length<t.length;)e=e.concat(e);return Math.max(...t.map((t,n)=>lt(t)+lt(e[n])))}function lt(e){return"auto"===e?0:1e3*Number(e.slice(0,-1).replace(",","."))}function ln(e){return(e?e.ownerDocument:document).body.offsetHeight}let lr=Symbol("_vod"),li=Symbol("_vsh");function ll(e,t){e.style.display=t?e[lr]:"none",e[li]=!t}let ls=Symbol("");function lo(e,t){if(1===e.nodeType){let r=e.style,i="";for(let e in t){var n;let l=null==(n=t[e])?"initial":"string"==typeof n?""===n?" ":n:String(n);r.setProperty(`--${e}`,l),i+=`--${e}: ${l};`}r[ls]=i}}let la=/(?:^|;)\s*display\s*:/,lc=/\s*!important$/;function lu(e,t,n){if(E(n))n.forEach(n=>lu(e,t,n));else if(null==n&&(n=""),t.startsWith("--"))e.setProperty(t,n);else{let r=function(e,t){let n=lh[t];if(n)return n;let r=j(t);if("filter"!==r&&r in e)return lh[t]=r;r=q(r);for(let n=0;n<ld.length;n++){let i=ld[n]+r;if(i in e)return lh[t]=i}return t}(e,t);lc.test(n)?e.setProperty(H(r),n.replace(lc,""),"important"):e[r]=n}}let ld=["Webkit","Moz","ms"],lh={},lf="http://www.w3.org/1999/xlink";function lp(e,t,n,r,i,l=ec(t)){if(r&&t.startsWith("xlink:"))null==n?e.removeAttributeNS(lf,t.slice(6,t.length)):e.setAttributeNS(lf,t,n);else null==n||l&&!(n||""===n)?e.removeAttribute(t):e.setAttribute(t,l?"":O(n)?String(n):n)}function lg(e,t,n,r,i){if("innerHTML"===t||"textContent"===t){null!=n&&(e[t]="innerHTML"===t?iW(n):n);return}let l=e.tagName;if("value"===t&&"PROGRESS"!==l&&!l.includes("-")){let r="OPTION"===l?e.getAttribute("value")||"":e.value,i=null==n?"checkbox"===e.type?"on":"":String(n);r===i&&"_value"in e||(e.value=i),null==n&&e.removeAttribute(t),e._value=n;return}let s=!1;if(""===n||null==n){let r=typeof e[t];if("boolean"===r){var o;n=!!(o=n)||""===o}else null==n&&"string"===r?(n="",s=!0):"number"===r&&(n=0,s=!0)}try{e[t]=n}catch(e){}s&&e.removeAttribute(i||t)}function lm(e,t,n,r){e.addEventListener(t,n,r)}let lv=Symbol("_vei"),ly=/(Once|Passive|Capture)$/,lb=/^on:?(?:Once|Passive|Capture)$/,l_=0,lS=Promise.resolve(),lx=e=>111===e.charCodeAt(0)&&110===e.charCodeAt(1)&&e.charCodeAt(2)>96&&123>e.charCodeAt(2),lC=(e,t,n,r,i,l)=>{let s="svg"===i;if("class"===t){var o;let t;o=r,(t=e[iQ])&&(o=(o?[o,...t]:[...t]).join(" ")),null==o?e.removeAttribute("class"):s?e.setAttribute("class",o):e.className=o}else"style"===t?function(e,t,n){let r=e.style,i=R(n),l=!1;if(n&&!i){if(t)if(R(t))for(let e of t.split(";")){let t=e.slice(0,e.indexOf(":")).trim();null==n[t]&&lu(r,t,"")}else for(let e in t)null==n[e]&&lu(r,e,"");for(let i in n){var s,o,a,c;"display"===i&&(l=!0);let u=n[i];null!=u?(s=e,o=i,a=!R(t)&&t?t[i]:void 0,c=u,"TEXTAREA"===s.tagName&&("width"===o||"height"===o)&&R(c)&&a===c||lu(r,i,u)):lu(r,i,"")}}else if(i){if(t!==n){let e=r[ls];e&&(n+=";"+e),r.cssText=n,l=la.test(n)}}else t&&e.removeAttribute("style");lr in e&&(e[lr]=l?r.display:"",e[li]&&(r.display="none"))}(e,n,r):C(t)?k(t)||function(e,t,n,r=null){let i=e[lv]||(e[lv]={}),l=i[t];if(n&&l)l.value=n;else{let[a,c]=function(e){let t,n;for(;(n=e.match(ly))&&!lb.test(e);)t||(t={}),e=e.slice(0,e.length-n[1].length),t[n[1].toLowerCase()]=!0;return[":"===e[2]?e.slice(3):H(e.slice(2)),t]}(t);if(n){var s,o;let l;lm(e,a,i[t]=(s=n,o=r,(l=e=>{if(e._vts){if(e._vts<=l.attached)return}else e._vts=Date.now();let t=l.value;if(E(t)){let n=e.stopImmediatePropagation;e.stopImmediatePropagation=()=>{n.call(e),e._stopped=!0};let r=t.slice(),i=[e];for(let t=0;t<r.length&&!e._stopped;t++){let e=r[t];e&&tD(e,o,5,i)}}else tD(t,o,5,[e])}).value=s,l.attached=l_||(lS.then(()=>l_=0),l_=Date.now()),l),c)}else l&&(e.removeEventListener(a,l,c),i[t]=void 0)}}(e,t,r,l):("."===t[0]?(t=t.slice(1),0):"^"===t[0]?(t=t.slice(1),1):!function(e,t,n,r){if(r)return!!("innerHTML"===t||"textContent"===t||t in e&&lx(t)&&I(n));if("spellcheck"===t||"draggable"===t||"translate"===t||"autocorrect"===t||"sandbox"===t&&"IFRAME"===e.tagName||"form"===t||"list"===t&&"INPUT"===e.tagName||"type"===t&&"TEXTAREA"===e.tagName)return!1;if("width"===t||"height"===t){let t=e.tagName;if("IMG"===t||"VIDEO"===t||"CANVAS"===t||"SOURCE"===t)return!1}return!(lx(t)&&R(n))&&t in e}(e,t,r,s))?e._isVueCE&&(function(e,t){let n=e._def.props;if(!n)return!1;let r=j(t);return Array.isArray(n)?n.some(e=>j(e)===r):Object.keys(n).some(e=>j(e)===r)}(e,t)||e._def.__asyncLoader&&(/[A-Z]/.test(t)||!R(r)))?lg(e,j(t),r,l,t):("true-value"===t?e._trueValue=r:"false-value"===t&&(e._falseValue=r),lp(e,t,r,s)):(lg(e,t,r),e.tagName.includes("-")||"value"!==t&&"checked"!==t&&"selected"!==t||lp(e,t,r,s,l,"value"!==t))},lk={};function lT(e,t,n){let r,i=nT(e,t);"[object Object]"===(r=i,F.call(r))&&(i=T({},i,t));class l extends lN{constructor(e){super(i,e,n)}}return l.def=i,l}let lw="u">typeof HTMLElement?HTMLElement:class{};class lN extends lw{constructor(e,t={},n=l4){super(),this._def=e,this._props=t,this._createApp=n,this._isVueCE=!0,this._instance=null,this._app=null,this._nonce=this._def.nonce,this._connected=!1,this._resolved=!1,this._patching=!1,this._dirty=!1,this._numberProps=null,this._styleChildren=new WeakSet,this._styleAnchors=new WeakMap,this._ob=null,this.shadowRoot&&n!==l4?this._root=this.shadowRoot:!1!==e.shadowRoot?(this.attachShadow(T({},e.shadowRootOptions,{mode:"open"})),this._root=this.shadowRoot):this._root=this}connectedCallback(){if(!this.isConnected)return;this.shadowRoot||this._resolved||this._parseSlots(),this._connected=!0;let e=this;for(;e=e&&(e.assignedSlot||e.parentNode||e.host);)if(e instanceof lN){this._parent=e;break}this._instance||(this._resolved?this._mount(this._def):e&&e._pendingResolve?this._pendingResolve=e._pendingResolve.then(()=>{this._pendingResolve=void 0,this._resolveDef()}):this._resolveDef())}_setParent(e=this._parent){e&&(this._instance.parent=e._instance,this._inheritParentContext(e))}_inheritParentContext(e=this._parent){e&&this._app&&Object.setPrototypeOf(this._app._context.provides,e._instance.provides)}disconnectedCallback(){this._connected=!1,tz(()=>{!this._connected&&(this._ob&&(this._ob.disconnect(),this._ob=null),this._app&&this._app.unmount(),this._instance&&(this._instance.ce=void 0),this._app=this._instance=null,this._teleportTargets&&(this._teleportTargets.clear(),this._teleportTargets=void 0))})}_processMutations(e){for(let t of e)this._setAttr(t.attributeName)}_resolveDef(){if(this._pendingResolve)return;for(let e=0;e<this.attributes.length;e++)this._setAttr(this.attributes[e].name);this._ob=new MutationObserver(this._processMutations.bind(this)),this._ob.observe(this,{attributes:!0});let e=(e,t=!1)=>{let n;this._resolved=!0,this._pendingResolve=void 0;let{props:r,styles:i}=e;if(r&&!E(r))for(let e in r){let t=r[e];(t===Number||t&&t.type===Number)&&(e in this._props&&(this._props[e]=X(this._props[e])),(n||(n=Object.create(null)))[j(e)]=!0)}this._numberProps=n,this._resolveProps(e),this.shadowRoot&&this._applyStyles(i),this._mount(e)},t=this._def.__asyncLoader;t?this._pendingResolve=t().then(t=>{t.configureApp=this._def.configureApp,e(this._def=t,!0)}):e(this._def)}_mount(e){this._app=this._createApp(e),this._inheritParentContext(),e.configureApp&&e.configureApp(this._app),this._app._ceVNode=this._createVNode(),this._app.mount(this._root);let t=this._instance&&this._instance.exposed;if(t)for(let e in t)A(this,e)||Object.defineProperty(this,e,{get:()=>tT(t[e])})}_resolveProps(e){let{props:t}=e,n=E(t)?t:Object.keys(t||{});for(let e of Object.keys(this))"_"!==e[0]&&n.includes(e)&&this._setProp(e,this[e]);for(let e of n.map(j))Object.defineProperty(this,e,{get(){return this._getProp(e)},set(t){this._setProp(e,t,!0,!this._patching)}})}_setAttr(e){if(e.startsWith("data-v-"))return;let t=this.hasAttribute(e),n=t?this.getAttribute(e):lk,r=j(e);t&&this._numberProps&&this._numberProps[r]&&(n=X(n)),this._setProp(r,n,!1,!0)}_getProp(e){return this._props[e]}_setProp(e,t,n=!0,r=!1){if(t!==this._props[e]&&(this._dirty=!0,t===lk?delete this._props[e]:(this._props[e]=t,"key"===e&&this._app&&(this._app._ceVNode.key=t)),r&&this._instance&&this._update(),n)){let n=this._ob;n&&(this._processMutations(n.takeRecords()),n.disconnect()),!0===t?this.setAttribute(H(e),""):"string"==typeof t||"number"==typeof t?this.setAttribute(H(e),t+""):t||this.removeAttribute(H(e)),n&&n.observe(this,{attributes:!0})}}_update(){let e=this._createVNode();this._app&&(e.appContext=this._app._context),l6(e,this._root)}_createVNode(){let e={};this.shadowRoot||(e.onVnodeMounted=e.onVnodeUpdated=this._renderSlots.bind(this));let t=ig(this._def,T(e,this._props));return this._instance||(t.ce=e=>{this._instance=e,e.ce=this,e.isCE=!0;let t=(e,t)=>{let n;this.dispatchEvent(new CustomEvent(e,"[object Object]"===(n=t[0],F.call(n))?T({detail:t},t[0]):{detail:t}))};e.emit=(e,...n)=>{t(e,n),H(e)!==e&&t(H(e),n)},this._setParent()}),t}_applyStyles(e,t,n){if(!e)return;if(t){if(t===this._def||this._styleChildren.has(t))return;this._styleChildren.add(t)}let r=this._nonce,i=this.shadowRoot,l=n?this._getStyleAnchor(n)||this._getStyleAnchor(this._def):this._getRootStyleInsertionAnchor(i),s=null;for(let o=e.length-1;o>=0;o--){let a=document.createElement("style");r&&a.setAttribute("nonce",r),a.textContent=e[o],i.insertBefore(a,s||l),s=a,0===o&&(n||this._styleAnchors.set(this._def,a),t&&this._styleAnchors.set(t,a))}}_getStyleAnchor(e){if(!e)return null;let t=this._styleAnchors.get(e);return t&&t.parentNode===this.shadowRoot?t:(t&&this._styleAnchors.delete(e),null)}_getRootStyleInsertionAnchor(e){for(let t=0;t<e.childNodes.length;t++){let n=e.childNodes[t];if(!(n instanceof HTMLStyleElement))return n}return null}_parseSlots(){let e,t=this._slots={};for(;e=this.firstChild;){let n=1===e.nodeType&&e.getAttribute("slot")||"default";(t[n]||(t[n]=[])).push(e),this.removeChild(e)}}_renderSlots(){let e=this._getSlots(),t=this._instance.type.__scopeId;for(let n=0;n<e.length;n++){let r=e[n],i=r.getAttribute("name")||"default",l=this._slots[i],s=r.parentNode;if(l)for(let e of l){if(t&&1===e.nodeType){let n,r=t+"-s",i=document.createTreeWalker(e,1);for(e.setAttribute(r,"");n=i.nextNode();)n.setAttribute(r,"")}s.insertBefore(e,r)}else for(;r.firstChild;)s.insertBefore(r.firstChild,r);s.removeChild(r)}}_getSlots(){let e=[this];this._teleportTargets&&e.push(...this._teleportTargets);let t=new Set;for(let n of e){let e=n.querySelectorAll("slot");for(let n=0;n<e.length;n++)t.add(e[n])}return Array.from(t)}_injectChildStyle(e,t){this._applyStyles(e.styles,e,t)}_beginPatch(){this._patching=!0,this._dirty=!1}_endPatch(){this._patching=!1,this._dirty&&this._instance&&this._update()}_hasShadowRoot(){return!1!==this._def.shadowRoot}_removeChildStyle(e){}}function lA(e){let t=iA(),n=t&&t.ce;return n||null}let lE=new WeakMap,lI=new WeakMap,lR=Symbol("_moveCb"),lO=Symbol("_enterCb"),lM=(n={name:"TransitionGroup",props:T({},iY,{tag:String,moveClass:String}),setup(e,{slots:t}){let n,r,i=iA(),l=nf();return n2(()=>{if(!n.length)return;let t=e.moveClass||`${e.name||"v"}-move`;if(!function(e,t,n){let r=e.cloneNode(),i=e[iQ];i&&i.forEach(e=>{e.split(/\s+/).forEach(e=>e&&r.classList.remove(e))}),n.split(/\s+/).forEach(e=>e&&r.classList.add(e)),r.style.display="none";let l=1===t.nodeType?t:t.parentNode;l.appendChild(r);let{hasTransform:s}=i7(r);return l.removeChild(r),s}(n[0].el,i.vnode.el,t)){n=[];return}n.forEach(lP),n.forEach(lF);let r=n.filter(lL);ln(i.vnode.el),r.forEach(e=>{let n=e.el,r=n.style;i6(n,t),r.transform=r.webkitTransform=r.transitionDuration="";let i=n[lR]=e=>{(!e||e.target===n)&&(!e||e.propertyName.endsWith("transform"))&&(n.removeEventListener("transitionend",i),n[lR]=null,i4(n,t))};n.addEventListener("transitionend",i)}),n=[]}),()=>{let s=tm(e),o=i3(s),a=s.tag||r8;if(n=[],r)for(let e=0;e<r.length;e++){let t=r[e];t.el&&t.el instanceof Element&&!t.el[li]&&(n.push(t),nC(t,n_(t,o,l,i)),lE.set(t,l$(t.el)))}r=t.default?nk(t.default()):[];for(let e=0;e<r.length;e++){let t=r[e];null!=t.key&&nC(t,n_(t,o,l,i))}return ig(a,null,r)}}},delete n.props.mode,n);function lP(e){let t=e.el;t[lR]&&t[lR](),t[lO]&&t[lO]()}function lF(e){lI.set(e,l$(e.el))}function lL(e){let t=lE.get(e),n=lI.get(e),r=t.left-n.left,i=t.top-n.top;if(r||i){let t=e.el,n=t.style,l=t.getBoundingClientRect(),s=1,o=1;return t.offsetWidth&&(s=l.width/t.offsetWidth),t.offsetHeight&&(o=l.height/t.offsetHeight),Number.isFinite(s)&&0!==s||(s=1),Number.isFinite(o)&&0!==o||(o=1),.01>Math.abs(s-1)&&(s=1),.01>Math.abs(o-1)&&(o=1),n.transform=n.webkitTransform=`translate(${r/s}px,${i/o}px)`,n.transitionDuration="0s",e}}function l$(e){let t=e.getBoundingClientRect();return{left:t.left,top:t.top}}let lD=e=>{let t=e.props["onUpdate:modelValue"]||!1;return E(t)?e=>z(t,e):t};function lV(e){e.target.composing=!0}function lB(e){let t=e.target;t.composing&&(t.composing=!1,t.dispatchEvent(new Event("input")))}let lj=Symbol("_assign");function lU(e,t,n){return t&&(e=e.trim()),n&&(e=G(e)),e}let lH={created(e,{modifiers:{lazy:t,trim:n,number:r}},i){e[lj]=lD(i);let l=r||i.props&&"number"===i.props.type;lm(e,t?"change":"input",t=>{t.target.composing||e[lj](lU(e.value,n,l))}),(n||l)&&lm(e,"change",()=>{e.value=lU(e.value,n,l)}),t||(lm(e,"compositionstart",lV),lm(e,"compositionend",lB),lm(e,"change",lB))},mounted(e,{value:t}){e.value=null==t?"":t},beforeUpdate(e,{value:t,oldValue:n,modifiers:{lazy:r,trim:i,number:l}},s){if(e[lj]=lD(s),e.composing)return;let o=(l||"number"===e.type)&&!/^0\d/.test(e.value)?G(e.value):e.value,a=null==t?"":t;if(o===a)return;let c=e.getRootNode();(c instanceof Document||c instanceof ShadowRoot)&&c.activeElement===e&&"range"!==e.type&&(r&&t===n||i&&e.value.trim()===a)||(e.value=a)}},lq={deep:!0,created(e,t,n){e[lj]=lD(n),lm(e,"change",()=>{let t=e._modelValue,n=lG(e),r=e.checked,i=e[lj];if(E(t)){let e=ed(t,n),l=-1!==e;if(r&&!l)i(t.concat(n));else if(!r&&l){let n=[...t];n.splice(e,1),i(n)}}else{let l;if("[object Set]"===(l=t,F.call(l))){let e=new Set(t);r?e.add(n):e.delete(n),i(e)}else i(lX(e,r))}})},mounted:lW,beforeUpdate(e,t,n){e[lj]=lD(n),lW(e,t,n)}};function lW(e,{value:t,oldValue:n},r){let i;if(e._modelValue=t,E(t))i=ed(t,r.props.value)>-1;else{let l;if("[object Set]"===(l=t,F.call(l)))i=t.has(r.props.value);else{if(t===n)return;i=eu(t,lX(e,!0))}}e.checked!==i&&(e.checked=i)}let lK={created(e,{value:t},n){e.checked=eu(t,n.props.value),e[lj]=lD(n),lm(e,"change",()=>{e[lj](lG(e))})},beforeUpdate(e,{value:t,oldValue:n},r){e[lj]=lD(r),t!==n&&(e.checked=eu(t,r.props.value))}},lz={deep:!0,created(e,{value:t,modifiers:{number:n}},r){e._modelValue=t,lm(e,"change",()=>{let t,r=Array.prototype.filter.call(e.options,e=>e.selected).map(e=>n?G(lG(e)):lG(e));e[lj](e.multiple?"[object Set]"===(t=e._modelValue,F.call(t))?new Set(r):r:r[0]),e._assigning=!0,tz(()=>{e._assigning=!1})}),e[lj]=lD(r)},mounted(e,{value:t}){lJ(e,t)},beforeUpdate(e,{value:t},n){e._modelValue=t,e[lj]=lD(n)},updated(e,{value:t}){e._assigning||lJ(e,t)}};function lJ(e,t){let n,r=e.multiple,i=E(t);if(!r||i||"[object Set]"===(n=t,F.call(n))){for(let n=0,l=e.options.length;n<l;n++){let l=e.options[n],s=lG(l);if(r)if(i){let e=typeof s;"string"===e||"number"===e?l.selected=t.some(e=>String(e)===String(s)):l.selected=ed(t,s)>-1}else l.selected=t.has(s);else if(eu(lG(l),t)){e.selectedIndex!==n&&(e.selectedIndex=n);return}}r||-1===e.selectedIndex||(e.selectedIndex=-1)}}function lG(e){return"_value"in e?e._value:e.value}function lX(e,t){let n=t?"_trueValue":"_falseValue";return n in e?e[n]:t}function lQ(e,t,n,r,i){let l=function(e,t){switch(e){case"SELECT":return lz;case"TEXTAREA":return lH;default:switch(t){case"checkbox":return lq;case"radio":return lK;default:return lH}}}(e.tagName,n.props&&n.props.type)[i];l&&l(e,t,n,r)}let lZ=["ctrl","shift","alt","meta"],lY={stop:e=>e.stopPropagation(),prevent:e=>e.preventDefault(),self:e=>e.target!==e.currentTarget,ctrl:e=>!e.ctrlKey,shift:e=>!e.shiftKey,alt:e=>!e.altKey,meta:e=>!e.metaKey,left:e=>"button"in e&&0!==e.button,middle:e=>"button"in e&&1!==e.button,right:e=>"button"in e&&2!==e.button,exact:(e,t)=>lZ.some(n=>e[`${n}Key`]&&!t.includes(n))},l0={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},l1=T({patchProp:lC},iJ),l2=!1;function l3(){return f=l2?f:rK(l1),l2=!0,f}let l6=(...e)=>{(f||(f=rz(l1))).render(...e)},l4=(...e)=>{let t=(f||(f=rz(l1))).createApp(...e),{mount:n}=t;return t.mount=e=>{let r=l9(e);if(!r)return;let i=t._component;I(i)||i.render||i.template||(i.template=r.innerHTML),1===r.nodeType&&(r.textContent="");let l=n(r,!1,l5(r));return r instanceof Element&&(r.removeAttribute("v-cloak"),r.setAttribute("data-v-app","")),l},t},l8=(...e)=>{let t=l3().createApp(...e),{mount:n}=t;return t.mount=e=>{let t=l9(e);if(t)return n(t,!0,l5(t))},t};function l5(e){return e instanceof SVGElement?"svg":"function"==typeof MathMLElement&&e instanceof MathMLElement?"mathml":void 0}function l9(e){return R(e)?document.querySelector(e):e}let l7=Symbol(""),se=Symbol(""),st=Symbol(""),sn=Symbol(""),sr=Symbol(""),si=Symbol(""),sl=Symbol(""),ss=Symbol(""),so=Symbol(""),sa=Symbol(""),sc=Symbol(""),su=Symbol(""),sd=Symbol(""),sh=Symbol(""),sf=Symbol(""),sp=Symbol(""),sg=Symbol(""),sm=Symbol(""),sv=Symbol(""),sy=Symbol(""),sb=Symbol(""),s_=Symbol(""),sS=Symbol(""),sx=Symbol(""),sC=Symbol(""),sk=Symbol(""),sT=Symbol(""),sw=Symbol(""),sN=Symbol(""),sA=Symbol(""),sE=Symbol(""),sI=Symbol(""),sR=Symbol(""),sO=Symbol(""),sM=Symbol(""),sP=Symbol(""),sF=Symbol(""),sL=Symbol(""),s$=Symbol(""),sD={[l7]:"Fragment",[se]:"Teleport",[st]:"Suspense",[sn]:"KeepAlive",[sr]:"BaseTransition",[si]:"openBlock",[sl]:"createBlock",[ss]:"createElementBlock",[so]:"createVNode",[sa]:"createElementVNode",[sc]:"createCommentVNode",[su]:"createTextVNode",[sd]:"createStaticVNode",[sh]:"resolveComponent",[sf]:"resolveDynamicComponent",[sp]:"resolveDirective",[sg]:"resolveFilter",[sm]:"withDirectives",[sv]:"renderList",[sy]:"renderSlot",[sb]:"createSlots",[s_]:"toDisplayString",[sS]:"mergeProps",[sx]:"normalizeClass",[sC]:"normalizeStyle",[sk]:"normalizeProps",[sT]:"guardReactiveProps",[sw]:"toHandlers",[sN]:"camelize",[sA]:"capitalize",[sE]:"toHandlerKey",[sI]:"setBlockTracking",[sR]:"pushScopeId",[sO]:"popScopeId",[sM]:"withCtx",[sP]:"unref",[sF]:"isRef",[sL]:"withMemo",[s$]:"isMemoSame"},sV={start:{line:1,column:1,offset:0},end:{line:1,column:1,offset:0},source:""};function sB(e,t,n,r,i,l,s,o=!1,a=!1,c=!1,u=sV){var d,h,f,p;return e&&(o?(e.helper(si),e.helper((d=e.inSSR,h=c,d||h?sl:ss))):e.helper((f=e.inSSR,p=c,f||p?so:sa)),s&&e.helper(sm)),{type:13,tag:t,props:n,children:r,patchFlag:i,dynamicProps:l,directives:s,isBlock:o,disableTracking:a,isComponent:c,loc:u}}function sj(e,t=sV){return{type:17,loc:t,elements:e}}function sU(e,t=sV){return{type:15,loc:t,properties:e}}function sH(e,t){return{type:16,loc:sV,key:R(e)?sq(e,!0):e,value:t}}function sq(e,t=!1,n=sV,r=0){return{type:4,loc:n,content:e,isStatic:t,constType:t?3:r}}function sW(e,t=sV){return{type:8,loc:t,children:e}}function sK(e,t=[],n=sV){return{type:14,loc:n,callee:e,arguments:t}}function sz(e,t,n=!1,r=!1,i=sV){return{type:18,params:e,returns:t,newline:n,isSlot:r,loc:i}}function sJ(e,t,n,r=!0){return{type:19,test:e,consequent:t,alternate:n,newline:r,loc:sV}}function sG(e,{helper:t,removeHelper:n,inSSR:r}){if(!e.isBlock){var i,l;e.isBlock=!0,n((i=e.isComponent,r||i?so:sa)),t(si),t((l=e.isComponent,r||l?sl:ss))}}let sX=new Uint8Array([123,123]),sQ=new Uint8Array([125,125]);function sZ(e){return e>=97&&e<=122||e>=65&&e<=90}function sY(e){return 32===e||10===e||9===e||12===e||13===e}function s0(e){return 47===e||62===e||sY(e)}function s1(e){let t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}let s2={Cdata:new Uint8Array([67,68,65,84,65,91]),CdataEnd:new Uint8Array([93,93,62]),CommentEnd:new Uint8Array([45,45,62]),ScriptEnd:new Uint8Array([60,47,115,99,114,105,112,116]),StyleEnd:new Uint8Array([60,47,115,116,121,108,101]),TitleEnd:new Uint8Array([60,47,116,105,116,108,101]),TextareaEnd:new Uint8Array([60,47,116,101,120,116,97,114,101,97])};function s3(e){throw e}function s6(e){}function s4(e,t,n,r){let i=SyntaxError(String(`https://vuejs.org/error-reference/#compiler-${e}`));return i.code=e,i.loc=t,i}let s8=e=>4===e.type&&e.isStatic;function s5(e){switch(e){case"Teleport":case"teleport":return se;case"Suspense":case"suspense":return st;case"KeepAlive":case"keep-alive":return sn;case"BaseTransition":case"base-transition":return sr}}let s9=/^$|^\d|[^\$\w\xA0-\uFFFF]/,s7=/[A-Za-z_$\xA0-\uFFFF]/,oe=/[\.\?\w$\xA0-\uFFFF]/,ot=/\s+[.[]\s*|\s*[.[]\s+/g,on=e=>4===e.type?e.content:e.loc.source,or=e=>{let t=on(e).trim().replace(ot,e=>e.trim()),n=0,r=[],i=0,l=0,s=null;for(let e=0;e<t.length;e++){let o=t.charAt(e);switch(n){case 0:if("["===o)r.push(n),n=1,i++;else if("("===o)r.push(n),n=2,l++;else if(!(0===e?s7:oe).test(o))return!1;break;case 1:"'"===o||'"'===o||"`"===o?(r.push(n),n=3,s=o):"["===o?i++:"]"!==o||--i||(n=r.pop());break;case 2:if("'"===o||'"'===o||"`"===o)r.push(n),n=3,s=o;else if("("===o)l++;else if(")"===o){if(e===t.length-1)return!1;--l||(n=r.pop())}break;case 3:o===s&&(n=r.pop(),s=null)}}return!i&&!l},oi=/^\s*(?:async\s*)?(?:\([^)]*?\)|[\w$_]+)\s*(?::[^=]+)?=>|^\s*(?:async\s+)?function(?:\s+[\w$]+)?\s*\(/;function ol(e,t,n=!1){for(let r=0;r<e.props.length;r++){let i=e.props[r];if(7===i.type&&(n||i.exp)&&(R(t)?i.name===t:t.test(i.name)))return i}}function os(e,t,n=!1,r=!1){for(let i=0;i<e.props.length;i++){let l=e.props[i];if(6===l.type){if(n)continue;if(l.name===t&&(l.value||r))return l}else if("bind"===l.name&&(l.exp||r)&&oo(l.arg,t))return l}}function oo(e,t){return!!(e&&s8(e)&&e.content===t)}function oa(e){return 5===e.type||2===e.type}function oc(e){return 7===e.type&&"pre"===e.name}function ou(e){return 7===e.type&&"slot"===e.name}function od(e){return 1===e.type&&3===e.tagType}function oh(e){return 1===e.type&&2===e.tagType}let of=new Set([sk,sT]);function op(e,t=[]){if(e&&!R(e)&&14===e.type){let n=e.callee;if(!R(n)&&of.has(n))return op(e.arguments[0],t.concat(e))}return[e,t]}function og(e,t,n){let r,i;if(13!==e.type&&function(e,t){var n,r,i;if(4!==t.key.type||"key"!==t.key.content)return!1;let l=e.arguments[2];if(l&&!R(l)){let[e]=op(l);if(e&&!R(e)&&15===e.type&&om(t,e))return!0}return(n=e.arguments)[2]||(n[2]="{}"),(r=e.arguments)[3]||(r[3]="undefined"),(i=e.arguments)[4]||(i[4]="undefined"),e.arguments[5]=t.value,!0}(e,t))return;let l=13===e.type?e.props:e.arguments[2],s=[];if(l&&!R(l)&&14===l.type){let e=op(l);l=e[0],i=(s=e[1])[s.length-1]}if(null==l||R(l))r=sU([t]);else if(14===l.type){let e=l.arguments[0];R(e)||15!==e.type?l.callee===sw?r=sK(n.helper(sS),[sU([t]),l]):l.arguments.unshift(sU([t])):om(t,e)||e.properties.unshift(t),r||(r=l)}else 15===l.type?(om(t,l)||l.properties.unshift(t),r=l):(r=sK(n.helper(sS),[sU([t]),l]),i&&i.callee===sT&&(i=s[s.length-2]));13===e.type?i?i.arguments[0]=r:e.props=r:i?i.arguments[0]=r:e.arguments[2]=r}function om(e,t){let n=!1;if(4===e.key.type){let r=e.key.content;n=t.properties.some(e=>4===e.key.type&&e.key.content===r)}return n}function ov(e,t){return`_${t}_${e.replace(/[^\w]/g,(t,n)=>"-"===t?"_":e.charCodeAt(n).toString())}`}let oy=/([\s\S]*?)\s+(?:in|of)\s+(\S[\s\S]*)/;function ob(e){for(let t=0;t<e.length;t++)if(!sY(e.charCodeAt(t)))return!1;return!0}function o_(e){return 2===e.type&&ob(e.content)||12===e.type&&o_(e.content)}function oS(e){return 3===e.type||o_(e)}let ox={parseMode:"base",ns:0,delimiters:["{{","}}"],getNamespace:()=>0,isVoidTag:x,isPreTag:x,isIgnoreNewlineTag:x,isCustomElement:x,onError:s3,onWarn:s6,comments:!1,prefixIdentifiers:!1},oC=ox,ok=null,oT="",ow=null,oN=null,oA="",oE=-1,oI=-1,oR=0,oO=!1,oM=null,oP=[],oF=new class{constructor(e,t){this.stack=e,this.cbs=t,this.state=1,this.buffer="",this.sectionStart=0,this.index=0,this.entityStart=0,this.baseState=1,this.inRCDATA=!1,this.inXML=!1,this.inVPre=!1,this.newlines=[],this.mode=0,this.delimiterOpen=sX,this.delimiterClose=sQ,this.delimiterIndex=-1,this.currentSequence=void 0,this.sequenceIndex=0}get inSFCRoot(){return 2===this.mode&&0===this.stack.length}reset(){this.state=1,this.mode=0,this.buffer="",this.sectionStart=0,this.index=0,this.baseState=1,this.inRCDATA=!1,this.currentSequence=void 0,this.newlines.length=0,this.delimiterOpen=sX,this.delimiterClose=sQ}getPos(e){let t=1,n=e+1,r=this.newlines.length,i=-1;if(r>100){let t=-1,n=r;for(;t+1<n;){let r=t+n>>>1;this.newlines[r]<e?t=r:n=r}i=t}else for(let t=r-1;t>=0;t--)if(e>this.newlines[t]){i=t;break}return i>=0&&(t=i+2,n=e-this.newlines[i]),{column:n,line:t,offset:e}}peek(){return this.buffer.charCodeAt(this.index+1)}stateText(e){60===e?(this.index>this.sectionStart&&this.cbs.ontext(this.sectionStart,this.index),this.state=5,this.sectionStart=this.index):this.inVPre||e!==this.delimiterOpen[0]||(this.state=2,this.delimiterIndex=0,this.stateInterpolationOpen(e))}stateInterpolationOpen(e){if(e===this.delimiterOpen[this.delimiterIndex])if(this.delimiterIndex===this.delimiterOpen.length-1){let e=this.index+1-this.delimiterOpen.length;e>this.sectionStart&&this.cbs.ontext(this.sectionStart,e),this.state=3,this.sectionStart=e}else this.delimiterIndex++;else this.inRCDATA?(this.state=32,this.stateInRCDATA(e)):(this.state=1,this.stateText(e))}stateInterpolation(e){e===this.delimiterClose[0]&&(this.state=4,this.delimiterIndex=0,this.stateInterpolationClose(e))}stateInterpolationClose(e){e===this.delimiterClose[this.delimiterIndex]?this.delimiterIndex===this.delimiterClose.length-1?(this.cbs.oninterpolation(this.sectionStart,this.index+1),this.inRCDATA?this.state=32:this.state=1,this.sectionStart=this.index+1):this.delimiterIndex++:(this.state=3,this.stateInterpolation(e))}stateSpecialStartSequence(e){let t=this.sequenceIndex===this.currentSequence.length;if(t?s0(e):(32|e)===this.currentSequence[this.sequenceIndex]){if(!t)return void this.sequenceIndex++}else this.inRCDATA=!1;this.sequenceIndex=0,this.state=6,this.stateInTagName(e)}stateInRCDATA(e){if(this.sequenceIndex===this.currentSequence.length){if(62===e||sY(e)){let t=this.index-this.currentSequence.length;if(this.sectionStart<t){let e=this.index;this.index=t,this.cbs.ontext(this.sectionStart,t),this.index=e}this.sectionStart=t+2,this.stateInClosingTagName(e),this.inRCDATA=!1;return}this.sequenceIndex=0}(32|e)===this.currentSequence[this.sequenceIndex]?this.sequenceIndex+=1:0===this.sequenceIndex?this.currentSequence!==s2.TitleEnd&&(this.currentSequence!==s2.TextareaEnd||this.inSFCRoot)?this.fastForwardTo(60)&&(this.sequenceIndex=1):this.inVPre||e!==this.delimiterOpen[0]||(this.state=2,this.delimiterIndex=0,this.stateInterpolationOpen(e)):this.sequenceIndex=Number(60===e)}stateCDATASequence(e){e===s2.Cdata[this.sequenceIndex]?++this.sequenceIndex===s2.Cdata.length&&(this.state=28,this.currentSequence=s2.CdataEnd,this.sequenceIndex=0,this.sectionStart=this.index+1):(this.sequenceIndex=0,this.state=23,this.stateInDeclaration(e))}fastForwardTo(e){for(;++this.index<this.buffer.length;){let t=this.buffer.charCodeAt(this.index);if(10===t&&this.newlines.push(this.index),t===e)return!0}return this.index=this.buffer.length-1,!1}stateInCommentLike(e){e===this.currentSequence[this.sequenceIndex]?++this.sequenceIndex===this.currentSequence.length&&(this.currentSequence===s2.CdataEnd?this.cbs.oncdata(this.sectionStart,this.index-2):this.cbs.oncomment(this.sectionStart,this.index-2),this.sequenceIndex=0,this.sectionStart=this.index+1,this.state=1):0===this.sequenceIndex?this.fastForwardTo(this.currentSequence[0])&&(this.sequenceIndex=1):e!==this.currentSequence[this.sequenceIndex-1]&&(this.sequenceIndex=0)}startSpecial(e,t){this.enterRCDATA(e,t),this.state=31}enterRCDATA(e,t){this.inRCDATA=!0,this.currentSequence=e,this.sequenceIndex=t}stateBeforeTagName(e){33===e?(this.state=22,this.sectionStart=this.index+1):63===e?(this.state=24,this.sectionStart=this.index+1):sZ(e)?(this.sectionStart=this.index,0===this.mode?this.state=6:this.inSFCRoot?this.state=34:this.inXML?this.state=6:116===e?this.state=30:this.state=115===e?29:6):47===e?this.state=8:(this.state=1,this.stateText(e))}stateInTagName(e){s0(e)&&this.handleTagName(e)}stateInSFCRootTagName(e){if(s0(e)){let t=this.buffer.slice(this.sectionStart,this.index);"template"!==t&&this.enterRCDATA(s1("</"+t),0),this.handleTagName(e)}}handleTagName(e){this.cbs.onopentagname(this.sectionStart,this.index),this.sectionStart=-1,this.state=11,this.stateBeforeAttrName(e)}stateBeforeClosingTagName(e){sY(e)||(62===e?(this.state=1,this.sectionStart=this.index+1):(this.state=sZ(e)?9:27,this.sectionStart=this.index))}stateInClosingTagName(e){(62===e||sY(e))&&(this.cbs.onclosetag(this.sectionStart,this.index),this.sectionStart=-1,this.state=10,this.stateAfterClosingTagName(e))}stateAfterClosingTagName(e){62===e&&(this.state=1,this.sectionStart=this.index+1)}stateBeforeAttrName(e){62===e?(this.cbs.onopentagend(this.index),this.inRCDATA?this.state=32:this.state=1,this.sectionStart=this.index+1):47===e?this.state=7:60===e&&47===this.peek()?(this.cbs.onopentagend(this.index),this.state=5,this.sectionStart=this.index):sY(e)||this.handleAttrStart(e)}handleAttrStart(e){118===e&&45===this.peek()?(this.state=13,this.sectionStart=this.index):46===e||58===e||64===e||35===e?(this.cbs.ondirname(this.index,this.index+1),this.state=14,this.sectionStart=this.index+1):(this.state=12,this.sectionStart=this.index)}stateInSelfClosingTag(e){62===e?(this.cbs.onselfclosingtag(this.index),this.state=1,this.sectionStart=this.index+1,this.inRCDATA=!1):sY(e)||(this.state=11,this.stateBeforeAttrName(e))}stateInAttrName(e){(61===e||s0(e))&&(this.cbs.onattribname(this.sectionStart,this.index),this.handleAttrNameEnd(e))}stateInDirName(e){61===e||s0(e)?(this.cbs.ondirname(this.sectionStart,this.index),this.handleAttrNameEnd(e)):58===e?(this.cbs.ondirname(this.sectionStart,this.index),this.state=14,this.sectionStart=this.index+1):46===e&&(this.cbs.ondirname(this.sectionStart,this.index),this.state=16,this.sectionStart=this.index+1)}stateInDirArg(e){61===e||s0(e)?(this.cbs.ondirarg(this.sectionStart,this.index),this.handleAttrNameEnd(e)):91===e?this.state=15:46===e&&(this.cbs.ondirarg(this.sectionStart,this.index),this.state=16,this.sectionStart=this.index+1)}stateInDynamicDirArg(e){93===e?this.state=14:(61===e||s0(e))&&(this.cbs.ondirarg(this.sectionStart,this.index+1),this.handleAttrNameEnd(e))}stateInDirModifier(e){61===e||s0(e)?(this.cbs.ondirmodifier(this.sectionStart,this.index),this.handleAttrNameEnd(e)):46===e&&(this.cbs.ondirmodifier(this.sectionStart,this.index),this.sectionStart=this.index+1)}handleAttrNameEnd(e){this.sectionStart=this.index,this.state=17,this.cbs.onattribnameend(this.index),this.stateAfterAttrName(e)}stateAfterAttrName(e){61===e?this.state=18:47===e||62===e?(this.cbs.onattribend(0,this.sectionStart),this.sectionStart=-1,this.state=11,this.stateBeforeAttrName(e)):sY(e)||(this.cbs.onattribend(0,this.sectionStart),this.handleAttrStart(e))}stateBeforeAttrValue(e){34===e?(this.state=19,this.sectionStart=this.index+1):39===e?(this.state=20,this.sectionStart=this.index+1):sY(e)||(this.sectionStart=this.index,this.state=21,this.stateInAttrValueNoQuotes(e))}handleInAttrValue(e,t){(e===t||this.fastForwardTo(t))&&(this.cbs.onattribdata(this.sectionStart,this.index),this.sectionStart=-1,this.cbs.onattribend(34===t?3:2,this.index+1),this.state=11)}stateInAttrValueDoubleQuotes(e){this.handleInAttrValue(e,34)}stateInAttrValueSingleQuotes(e){this.handleInAttrValue(e,39)}stateInAttrValueNoQuotes(e){sY(e)||62===e?(this.cbs.onattribdata(this.sectionStart,this.index),this.sectionStart=-1,this.cbs.onattribend(1,this.index),this.state=11,this.stateBeforeAttrName(e)):(39===e||60===e||61===e||96===e)&&this.cbs.onerr(18,this.index)}stateBeforeDeclaration(e){91===e?(this.state=26,this.sequenceIndex=0):this.state=45===e?25:23}stateInDeclaration(e){(62===e||this.fastForwardTo(62))&&(this.state=1,this.sectionStart=this.index+1)}stateInProcessingInstruction(e){(62===e||this.fastForwardTo(62))&&(this.cbs.onprocessinginstruction(this.sectionStart,this.index),this.state=1,this.sectionStart=this.index+1)}stateBeforeComment(e){45===e?(this.state=28,this.currentSequence=s2.CommentEnd,this.sequenceIndex=2,this.sectionStart=this.index+1):this.state=23}stateInSpecialComment(e){(62===e||this.fastForwardTo(62))&&(this.cbs.oncomment(this.sectionStart,this.index),this.state=1,this.sectionStart=this.index+1)}stateBeforeSpecialS(e){e===s2.ScriptEnd[3]?this.startSpecial(s2.ScriptEnd,4):e===s2.StyleEnd[3]?this.startSpecial(s2.StyleEnd,4):(this.state=6,this.stateInTagName(e))}stateBeforeSpecialT(e){e===s2.TitleEnd[3]?this.startSpecial(s2.TitleEnd,4):e===s2.TextareaEnd[3]?this.startSpecial(s2.TextareaEnd,4):(this.state=6,this.stateInTagName(e))}startEntity(){}stateInEntity(){}parse(e){for(this.buffer=e;this.index<this.buffer.length;){let e=this.buffer.charCodeAt(this.index);switch(10===e&&33!==this.state&&this.newlines.push(this.index),this.state){case 1:this.stateText(e);break;case 2:this.stateInterpolationOpen(e);break;case 3:this.stateInterpolation(e);break;case 4:this.stateInterpolationClose(e);break;case 31:this.stateSpecialStartSequence(e);break;case 32:this.stateInRCDATA(e);break;case 26:this.stateCDATASequence(e);break;case 19:this.stateInAttrValueDoubleQuotes(e);break;case 12:this.stateInAttrName(e);break;case 13:this.stateInDirName(e);break;case 14:this.stateInDirArg(e);break;case 15:this.stateInDynamicDirArg(e);break;case 16:this.stateInDirModifier(e);break;case 28:this.stateInCommentLike(e);break;case 27:this.stateInSpecialComment(e);break;case 11:this.stateBeforeAttrName(e);break;case 6:this.stateInTagName(e);break;case 34:this.stateInSFCRootTagName(e);break;case 9:this.stateInClosingTagName(e);break;case 5:this.stateBeforeTagName(e);break;case 17:this.stateAfterAttrName(e);break;case 20:this.stateInAttrValueSingleQuotes(e);break;case 18:this.stateBeforeAttrValue(e);break;case 8:this.stateBeforeClosingTagName(e);break;case 10:this.stateAfterClosingTagName(e);break;case 29:this.stateBeforeSpecialS(e);break;case 30:this.stateBeforeSpecialT(e);break;case 21:this.stateInAttrValueNoQuotes(e);break;case 7:this.stateInSelfClosingTag(e);break;case 23:this.stateInDeclaration(e);break;case 22:this.stateBeforeDeclaration(e);break;case 25:this.stateBeforeComment(e);break;case 24:this.stateInProcessingInstruction(e);break;case 33:this.stateInEntity()}this.index++}this.cleanup(),this.finish()}cleanup(){this.sectionStart!==this.index&&(1===this.state||32===this.state&&0===this.sequenceIndex?(this.cbs.ontext(this.sectionStart,this.index),this.sectionStart=this.index):(19===this.state||20===this.state||21===this.state)&&(this.cbs.onattribdata(this.sectionStart,this.index),this.sectionStart=this.index))}finish(){this.handleTrailingData(),this.cbs.onend()}handleTrailingData(){let e=this.buffer.length;this.sectionStart>=e||(28===this.state?this.currentSequence===s2.CdataEnd?this.cbs.oncdata(this.sectionStart,e):this.cbs.oncomment(this.sectionStart,e):6===this.state||11===this.state||18===this.state||17===this.state||12===this.state||13===this.state||14===this.state||15===this.state||16===this.state||20===this.state||19===this.state||21===this.state||9===this.state||this.cbs.ontext(this.sectionStart,e))}emitCodePoint(e,t){}}(oP,{onerr:oQ,ontext(e,t){oB(oD(e,t),e,t)},ontextentity(e,t,n){oB(e,t,n)},oninterpolation(e,t){if(oO)return oB(oD(e,t),e,t);let n=e+oF.delimiterOpen.length,r=t-oF.delimiterClose.length;for(;sY(oT.charCodeAt(n));)n++;for(;sY(oT.charCodeAt(r-1));)r--;let i=oD(n,r);i.includes("&")&&(i=oC.decodeEntities(i,!1)),oz({type:5,content:oX(i,!1,oJ(n,r)),loc:oJ(e,t)})},onopentagname(e,t){let n=oD(e,t);ow={type:1,tag:n,ns:oC.getNamespace(n,oP[0],oC.ns),tagType:0,props:[],children:[],loc:oJ(e-1,t),codegenNode:void 0}},onopentagend(e){oV(e)},onclosetag(e,t){let n=oD(e,t);if(!oC.isVoidTag(n)){let r=!1;for(let e=0;e<oP.length;e++)if(oP[e].tag.toLowerCase()===n.toLowerCase()){r=!0,e>0&&oP[0].loc.start.offset;for(let n=0;n<=e;n++)oj(oP.shift(),t,n<e);break}r||oU(e,60)}},onselfclosingtag(e){let t=ow.tag;ow.isSelfClosing=!0,oV(e),oP[0]&&oP[0].tag===t&&oj(oP.shift(),e)},onattribname(e,t){oN={type:6,name:oD(e,t),nameLoc:oJ(e,t),value:void 0,loc:oJ(e)}},ondirname(e,t){let n=oD(e,t),r="."===n||":"===n?"bind":"@"===n?"on":"#"===n?"slot":n.slice(2);if(oO||""===r)oN={type:6,name:n,nameLoc:oJ(e,t),value:void 0,loc:oJ(e)};else if(oN={type:7,name:r,rawName:n,exp:void 0,arg:void 0,modifiers:"."===n?[sq("prop")]:[],loc:oJ(e)},"pre"===r){oO=oF.inVPre=!0,oM=ow;let e=ow.props;for(let t=0;t<e.length;t++)7===e[t].type&&(e[t]=function(e){let t={type:6,name:e.rawName,nameLoc:oJ(e.loc.start.offset,e.loc.start.offset+e.rawName.length),value:void 0,loc:e.loc};if(e.exp){let n=e.exp.loc;n.end.offset<e.loc.end.offset&&(n.start.offset--,n.start.column--,n.end.offset++,n.end.column++),t.value={type:2,content:e.exp.content,loc:n}}return t}(e[t]))}},ondirarg(e,t){if(e===t)return;let n=oD(e,t);if(oO&&!oc(oN))oN.name+=n,oG(oN.nameLoc,t);else{let r="["!==n[0];oN.arg=oX(r?n:n.slice(1,-1),r,oJ(e,t),3*!!r)}},ondirmodifier(e,t){let n=oD(e,t);if(oO&&!oc(oN))oN.name+="."+n,oG(oN.nameLoc,t);else if("slot"===oN.name){let e=oN.arg;e&&(e.content+="."+n,oG(e.loc,t))}else{let r=sq(n,!0,oJ(e,t));oN.modifiers.push(r)}},onattribdata(e,t){oA+=oD(e,t),oE<0&&(oE=e),oI=t},onattribentity(e,t,n){oA+=e,oE<0&&(oE=t),oI=n},onattribnameend(e){let t=oD(oN.loc.start.offset,e);7===oN.type&&(oN.rawName=t),ow.props.some(e=>(7===e.type?e.rawName:e.name)===t)},onattribend(e,t){ow&&oN&&(oG(oN.loc,t),0!==e&&(oA.includes("&")&&(oA=oC.decodeEntities(oA,!0)),6===oN.type?("class"===oN.name&&(oA=oK(oA).trim()),oN.value={type:2,content:oA,loc:1===e?oJ(oE,oI):oJ(oE-1,oI+1)},oF.inSFCRoot&&"template"===ow.tag&&"lang"===oN.name&&oA&&"html"!==oA&&oF.enterRCDATA(s1("</template"),0)):(oN.exp=oX(oA,!1,oJ(oE,oI),0,0),"for"===oN.name&&(oN.forParseResult=function(e){let t=e.loc,n=e.content,r=n.match(oy);if(!r)return;let[,i,l]=r,s=(e,n,r=!1)=>{let i=t.start.offset+n,l=i+e.length;return oX(e,!1,oJ(i,l),0,+!!r)},o={source:s(l.trim(),n.indexOf(l,i.length)),value:void 0,key:void 0,index:void 0,finalized:!1},a=i.trim().replace(o$,"").trim(),c=i.indexOf(a),u=a.match(oL);if(u){let e;a=a.replace(oL,"").trim();let t=u[1].trim();if(t&&(e=n.indexOf(t,c+a.length),o.key=s(t,e,!0)),u[2]){let r=u[2].trim();r&&(o.index=s(r,n.indexOf(r,o.key?e+t.length:c+a.length),!0))}}return a&&(o.value=s(a,c,!0)),o}(oN.exp)))),(7!==oN.type||"pre"!==oN.name)&&ow.props.push(oN)),oA="",oE=oI=-1},oncomment(e,t){oC.comments&&oz({type:3,content:oD(e,t),loc:oJ(e-4,t+3)})},onend(){let e=oT.length;for(let t=0;t<oP.length;t++)oj(oP[t],e-1),oP[t].loc.start.offset},oncdata(e,t){(oP[0]?oP[0].ns:oC.ns)!==0&&oB(oD(e,t),e,t)},onprocessinginstruction(e){(oP[0]?oP[0].ns:oC.ns)===0&&oQ(21,e-1)}}),oL=/,([^,\}\]]*)(?:,([^,\}\]]*))?$/,o$=/^\(|\)$/g;function oD(e,t){return oT.slice(e,t)}function oV(e){oF.inSFCRoot&&(ow.innerLoc=oJ(e+1,e+1)),oz(ow);let{tag:t,ns:n}=ow;0===n&&oC.isPreTag(t)&&oR++,oC.isVoidTag(t)?oj(ow,e):(oP.unshift(ow),(1===n||2===n)&&(oF.inXML=!0)),ow=null}function oB(e,t,n){{let t=oP[0]&&oP[0].tag;"script"!==t&&"style"!==t&&e.includes("&")&&(e=oC.decodeEntities(e,!1))}let r=oP[0]||ok,i=r.children[r.children.length-1];i&&2===i.type?(i.content+=e,oG(i.loc,n)):r.children.push({type:2,content:e,loc:oJ(t,n)})}function oj(e,t,n=!1){n?oG(e.loc,oU(t,60)):oG(e.loc,function(e){let t=e;for(;62!==oT.charCodeAt(t)&&t<oT.length-1;)t++;return t}(t)+1),oF.inSFCRoot&&(e.children.length?e.innerLoc.end=T({},e.children[e.children.length-1].loc.end):e.innerLoc.end=T({},e.innerLoc.start),e.innerLoc.source=oD(e.innerLoc.start.offset,e.innerLoc.end.offset));let{tag:r,ns:i,children:l}=e;if(!oO&&("slot"===r?e.tagType=2:!function({tag:e,props:t}){if("template"===e){for(let e=0;e<t.length;e++)if(7===t[e].type&&oH.has(t[e].name))return!0}return!1}(e)?function({tag:e,props:t}){var n;if(oC.isCustomElement(e))return!1;if("component"===e||(n=e.charCodeAt(0))>64&&n<91||s5(e)||oC.isBuiltInComponent&&oC.isBuiltInComponent(e)||oC.isNativeTag&&!oC.isNativeTag(e))return!0;for(let e=0;e<t.length;e++){let n=t[e];if(6===n.type&&"is"===n.name&&n.value&&n.value.content.startsWith("vue:"))return!0}return!1}(e)&&(e.tagType=1):e.tagType=3),oF.inRCDATA||(e.children=oW(l)),0===i&&oC.isIgnoreNewlineTag(r)){let e=l[0];e&&2===e.type&&(e.content=e.content.replace(/^\r?\n/,""))}0===i&&oC.isPreTag(r)&&oR--,oM===e&&(oO=oF.inVPre=!1,oM=null),oF.inXML&&(oP[0]?oP[0].ns:oC.ns)===0&&(oF.inXML=!1)}function oU(e,t){let n=e;for(;oT.charCodeAt(n)!==t&&n>=0;)n--;return n}let oH=new Set(["if","else","else-if","for","slot"]),oq=/\r\n/g;function oW(e){let t="preserve"!==oC.whitespace,n=!1;for(let r=0;r<e.length;r++){let i=e[r];if(2===i.type)if(oR)i.content=i.content.replace(oq,`
`);else if(ob(i.content)){let l=e[r-1]&&e[r-1].type,s=e[r+1]&&e[r+1].type;!l||!s||t&&(3===l&&(3===s||1===s)||1===l&&(3===s||1===s&&function(e){for(let t=0;t<e.length;t++){let n=e.charCodeAt(t);if(10===n||13===n)return!0}return!1}(i.content)))?(n=!0,e[r]=null):i.content=" "}else t&&(i.content=oK(i.content))}return n?e.filter(Boolean):e}function oK(e){let t="",n=!1;for(let r=0;r<e.length;r++)sY(e.charCodeAt(r))?n||(t+=" ",n=!0):(t+=e[r],n=!1);return t}function oz(e){(oP[0]||ok).children.push(e)}function oJ(e,t){return{start:oF.getPos(e),end:null==t?t:oF.getPos(t),source:null==t?t:oD(e,t)}}function oG(e,t){e.end=oF.getPos(t),e.source=oD(e.start.offset,t)}function oX(e,t=!1,n,r=0,i=0){return sq(e,t,n,r)}function oQ(e,t,n){oC.onError(s4(e,oJ(t,t)))}function oZ(e){let t=e.children.filter(e=>3!==e.type);return 1!==t.length||1!==t[0].type||oh(t[0])?null:t[0]}function oY(e,t){let{constantCache:n}=t;switch(e.type){case 1:if(0!==e.tagType)return 0;let r=n.get(e);if(void 0!==r)return r;let i=e.codegenNode;if(13!==i.type||i.isBlock&&"svg"!==e.tag&&"foreignObject"!==e.tag&&"math"!==e.tag)return 0;if(void 0!==i.patchFlag)return n.set(e,0),0;{let r=3,c=o1(e,t);if(0===c)return n.set(e,0),0;c<r&&(r=c);for(let i=0;i<e.children.length;i++){let l=oY(e.children[i],t);if(0===l)return n.set(e,0),0;l<r&&(r=l)}if(r>1)for(let i=0;i<e.props.length;i++){let l=e.props[i];if(7===l.type&&"bind"===l.name&&l.exp){let i=oY(l.exp,t);if(0===i)return n.set(e,0),0;i<r&&(r=i)}}if(i.isBlock){var l,s,o,a;for(let t=0;t<e.props.length;t++)if(7===e.props[t].type)return n.set(e,0),0;t.removeHelper(si),t.removeHelper((l=t.inSSR,s=i.isComponent,l||s?sl:ss)),i.isBlock=!1,t.helper((o=t.inSSR,a=i.isComponent,o||a?so:sa))}return n.set(e,r),r}case 2:case 3:return 3;case 9:case 11:case 10:default:return 0;case 5:case 12:return oY(e.content,t);case 4:return e.constType;case 8:let c=3;for(let n=0;n<e.children.length;n++){let r=e.children[n];if(R(r)||O(r))continue;let i=oY(r,t);if(0===i)return 0;i<c&&(c=i)}return c;case 20:return 2}}let o0=new Set([sx,sC,sk,sT]);function o1(e,t){let n=3,r=o2(e);if(r&&15===r.type){let{properties:e}=r;for(let r=0;r<e.length;r++){let i,{key:l,value:s}=e[r],o=oY(l,t);if(0===o)return o;if(o<n&&(n=o),0===(i=4===s.type?oY(s,t):14===s.type?function e(t,n){if(14===t.type&&!R(t.callee)&&o0.has(t.callee)){let r=t.arguments[0];if(4===r.type)return oY(r,n);if(14===r.type)return e(r,n)}return 0}(s,t):0))return i;i<n&&(n=i)}}return n}function o2(e){let t=e.codegenNode;if(13===t.type)return t.props}function o3(e,t){t.currentNode=e;let{nodeTransforms:n}=t,r=[];for(let i=0;i<n.length;i++){let l=n[i](e,t);if(l&&(E(l)?r.push(...l):r.push(l)),!t.currentNode)return;e=t.currentNode}switch(e.type){case 3:t.ssr||t.helper(sc);break;case 5:t.ssr||t.helper(s_);break;case 9:for(let n=0;n<e.branches.length;n++)o3(e.branches[n],t);break;case 10:case 11:case 1:case 0:var i=e;let l=0,s=()=>{l--};for(;l<i.children.length;l++){let e=i.children[l];R(e)||(t.grandParent=t.parent,t.parent=i,t.childIndex=l,t.onNodeRemoved=s,o3(e,t))}}t.currentNode=e;let o=r.length;for(;o--;)r[o]()}function o6(e,t){let n=R(e)?t=>t===e:t=>e.test(t);return(e,r)=>{if(1===e.type){let{props:i}=e;if(3===e.tagType&&i.some(ou))return;let l=[];for(let s=0;s<i.length;s++){let o=i[s];if(7===o.type&&n(o.name)){i.splice(s,1),s--;let n=t(e,o,r);n&&l.push(n)}}return l}}}let o4="/*@__PURE__*/",o8=e=>`${sD[e]}: _${sD[e]}`;function o5(e,t,{helper:n,push:r,newline:i,isTS:l}){let s=n("component"===t?sh:sp);for(let n=0;n<e.length;n++){let o=e[n],a=o.endsWith("__self");a&&(o=o.slice(0,-6)),r(`const ${ov(o,t)} = ${s}(${JSON.stringify(o)}${a?", true":""})${l?"!":""}`),n<e.length-1&&i()}}function o9(e,t){let n=e.length>3;t.push("["),n&&t.indent(),o7(e,t,n),n&&t.deindent(),t.push("]")}function o7(e,t,n=!1,r=!0){let{push:i,newline:l}=t;for(let s=0;s<e.length;s++){let o=e[s];R(o)?i(o,-3):E(o)?o9(o,t):ae(o,t),s<e.length-1&&(n?(r&&i(","),l()):r&&i(", "))}}function ae(e,t){var n,r,i;if(R(e))return void t.push(e,-3);if(O(e))return void t.push(t.helper(e));switch(e.type){case 1:case 9:case 11:case 12:ae(e.codegenNode,t);break;case 2:n=e,t.push(JSON.stringify(n.content),-3,n);break;case 4:at(e,t);break;case 5:!function(e,t){let{push:n,helper:r,pure:i}=t;i&&n(o4),n(`${r(s_)}(`),ae(e.content,t),n(")")}(e,t);break;case 8:an(e,t);break;case 3:!function(e,t){let{push:n,helper:r,pure:i}=t;i&&n(o4),n(`${r(sc)}(${JSON.stringify(e.content)})`,-3,e)}(e,t);break;case 13:!function(e,t){var n,r;let i,{push:l,helper:s,pure:o}=t,{tag:a,props:c,children:u,patchFlag:d,dynamicProps:h,directives:f,isBlock:p,disableTracking:g,isComponent:m}=e;d&&(i=String(d)),f&&l(s(sm)+"("),p&&l(`(${s(si)}(${g?"true":""}), `),o&&l(o4),l(s(p?(n=t.inSSR,n||m?sl:ss):(r=t.inSSR,r||m?so:sa))+"(",-2,e),o7(function(e){let t=e.length;for(;t--&&null==e[t];);return e.slice(0,t+1).map(e=>e||"null")}([a,c,u,i,h]),t),l(")"),p&&l(")"),f&&(l(", "),ae(f,t),l(")"))}(e,t);break;case 14:!function(e,t){let{push:n,helper:r,pure:i}=t,l=R(e.callee)?e.callee:r(e.callee);i&&n(o4),n(l+"(",-2,e),o7(e.arguments,t),n(")")}(e,t);break;case 15:!function(e,t){let{push:n,indent:r,deindent:i,newline:l}=t,{properties:s}=e;if(!s.length)return n("{}",-2,e);let o=s.length>1;n(o?"{":"{ "),o&&r();for(let e=0;e<s.length;e++){let{key:r,value:i}=s[e];!function(e,t){let{push:n}=t;if(8===e.type)n("["),an(e,t),n("]");else if(e.isStatic){let t;n((t=e.content,s9.test(t))?JSON.stringify(e.content):e.content,-2,e)}else n(`[${e.content}]`,-3,e)}(r,t),n(": "),ae(i,t),e<s.length-1&&(n(","),l())}o&&i(),n(o?"}":" }")}(e,t);break;case 17:r=e,i=t,o9(r.elements,i);break;case 18:!function(e,t){let{push:n,indent:r,deindent:i}=t,{params:l,returns:s,body:o,newline:a,isSlot:c}=e;c&&n(`_${sD[sM]}(`),n("(",-2,e),E(l)?o7(l,t):l&&ae(l,t),n(") => "),(a||o)&&(n("{"),r()),s?(a&&n("return "),E(s)?o9(s,t):ae(s,t)):o&&ae(o,t),(a||o)&&(i(),n("}")),c&&n(")")}(e,t);break;case 19:!function(e,t){let{test:n,consequent:r,alternate:i,newline:l}=e,{push:s,indent:o,deindent:a,newline:c}=t;if(4===n.type){let e,r=(e=n.content,!!s9.test(e));r&&s("("),at(n,t),r&&s(")")}else s("("),ae(n,t),s(")");l&&o(),t.indentLevel++,l||s(" "),s("? "),ae(r,t),t.indentLevel--,l&&c(),l||s(" "),s(": ");let u=19===i.type;!u&&t.indentLevel++,ae(i,t),!u&&t.indentLevel--,l&&a(!0)}(e,t);break;case 20:!function(e,t){let{push:n,helper:r,indent:i,deindent:l,newline:s}=t,{needPauseTracking:o,needArraySpread:a}=e;a&&n("[...("),n(`_cache[${e.index}] || (`),o&&(i(),n(`${r(sI)}(-1`),e.inVOnce&&n(", true"),n("),"),s(),n("(")),n(`_cache[${e.index}] = `),ae(e.value,t),o&&(n(`).cacheIndex = ${e.index},`),s(),n(`${r(sI)}(1),`),s(),n(`_cache[${e.index}]`),l()),n(")"),a&&n(")]")}(e,t);break;case 21:o7(e.body,t,!0,!1)}}function at(e,t){let{content:n,isStatic:r}=e;t.push(r?JSON.stringify(n):n,-3,e)}function an(e,t){for(let n=0;n<e.children.length;n++){let r=e.children[n];R(r)?t.push(r,-3):ae(r,t)}}let ar=o6(/^(?:if|else|else-if)$/,(e,t,n)=>(function(e,t,n,r){if("else"!==t.name&&(!t.exp||!t.exp.content.trim())){let r=t.exp?t.exp.loc:e.loc;n.onError(s4(28,t.loc)),t.exp=sq("true",!1,r)}if("if"===t.name){var i;let l=ai(e,t),s={type:9,loc:oJ((i=e.loc).start.offset,i.end.offset),branches:[l]};if(n.replaceNode(s),r)return r(s,l,!0)}else{let i=n.parent.children,l=i.indexOf(e);for(;l-- >=-1;){let s=i[l];if(s&&oS(s)){n.removeNode(s);continue}if(s&&9===s.type){("else-if"===t.name||"else"===t.name)&&void 0===s.branches[s.branches.length-1].condition&&n.onError(s4(30,e.loc)),n.removeNode();let i=ai(e,t);s.branches.push(i);let l=r&&r(s,i,!1);o3(i,n),l&&l(),n.currentNode=null}else n.onError(s4(30,e.loc));break}}})(e,t,n,(e,t,r)=>{let i=n.parent.children,l=i.indexOf(e),s=0;for(;l-- >=0;){let e=i[l];e&&9===e.type&&(s+=e.branches.length)}return()=>{r?e.codegenNode=al(t,s,n):function(e){for(;;)if(19===e.type)if(19!==e.alternate.type)return e;else e=e.alternate;else 20===e.type&&(e=e.value)}(e.codegenNode).alternate=al(t,s+e.branches.length-1,n)}}));function ai(e,t){let n=3===e.tagType;return{type:10,loc:e.loc,condition:"else"===t.name?void 0:t.exp,children:n&&!ol(e,"for")?e.children:[e],userKey:os(e,"key"),isTemplateIf:n}}function al(e,t,n){return e.condition?sJ(e.condition,as(e,t,n),sK(n.helper(sc),['""',"true"])):as(e,t,n)}function as(e,t,n){let{helper:r}=n,i=sH("key",sq(`${t}`,!1,sV,2)),{children:l}=e,s=l[0];if(1!==l.length||1!==s.type)if(1!==l.length||11!==s.type)return sB(n,r(l7),sU([i]),l,64,void 0,void 0,!0,!1,!1,e.loc);else{let e=s.codegenNode;return og(e,i,n),e}{let e=s.codegenNode,t=14===e.type&&e.callee===sL?e.arguments[1].returns:e;return 13===t.type&&sG(t,n),og(t,i,n),e}}let ao=o6("for",(e,t,n)=>{let{helper:r,removeHelper:i}=n;return function(e,t,n,r){if(!t.exp)return void n.onError(s4(31,t.loc));let i=t.forParseResult;if(!i)return void n.onError(s4(32,t.loc));aa(i);let{scopes:l}=n,{source:s,value:o,key:a,index:c}=i,u={type:11,loc:t.loc,source:s,valueAlias:o,keyAlias:a,objectIndexAlias:c,parseResult:i,children:od(e)?e.children:[e]};n.replaceNode(u),l.vFor++;let d=r&&r(u);return()=>{l.vFor--,d&&d()}}(e,t,n,t=>{let l=sK(r(sv),[t.source]),s=od(e),o=ol(e,"memo"),a=os(e,"key",!1,!0);a&&a.type;let c=a&&(6===a.type?a.value?sq(a.value.content,!0):void 0:a.exp),u=c?sH("key",c):null,d=4===t.source.type&&t.source.constType>0,h=d?64:a?128:256;return t.codegenNode=sB(n,r(l7),void 0,l,h,void 0,void 0,!0,!d,!1,e.loc),()=>{let a,{children:h}=t,f=1!==h.length||1!==h[0].type,p=oh(e)?e:s&&1===e.children.length&&oh(e.children[0])?e.children[0]:null;if(p)a=p.codegenNode,s&&u&&og(a,u,n);else if(f)a=sB(n,r(l7),u?sU([u]):void 0,e.children,64,void 0,void 0,!0,void 0,!1);else{var g,m,y,b,_,S,x,C;a=h[0].codegenNode,s&&u&&og(a,u,n),!d!==a.isBlock&&(a.isBlock?(i(si),i((g=n.inSSR,m=a.isComponent,g||m?sl:ss))):i((y=n.inSSR,b=a.isComponent,y||b?so:sa))),(a.isBlock=!d,a.isBlock)?(r(si),r((_=n.inSSR,S=a.isComponent,_||S?sl:ss))):r((x=n.inSSR,C=a.isComponent,x||C?so:sa))}if(o){let e=sz(ac(t.parseResult,[sq("_cached")]));e.body={type:21,body:[sW(["const _memo = (",o.exp,")"]),sW(["if (_cached && _cached.el",...c?[" && _cached.key === ",c]:[],` && ${n.helperString(s$)}(_cached, _memo)) return _cached`]),sW(["const _item = ",a]),sq("_item.memo = _memo"),sq("return _item")],loc:sV},l.arguments.push(e,sq("_cache"),sq(String(n.cached.length))),n.cached.push(null)}else l.arguments.push(sz(ac(t.parseResult),a,!0))}})});function aa(e,t){e.finalized||(e.finalized=!0)}function ac({value:e,key:t,index:n},r=[]){var i=[e,t,n,...r];let l=i.length;for(;l--&&!i[l];);return i.slice(0,l+1).map((e,t)=>e||sq("_".repeat(t+1),!1))}let au=sq("undefined",!1),ad=(e,t)=>{if(1===e.type&&(1===e.tagType||3===e.tagType)){let n=ol(e,"slot");if(n)return n.exp,t.scopes.vSlot++,()=>{t.scopes.vSlot--}}};function ah(e,t,n){let r=[sH("name",e),sH("fn",t)];return null!=n&&r.push(sH("key",sq(String(n),!0))),sU(r)}let af=new WeakMap,ap=(e,t)=>function(){let n,r,i,l,s;if(1!==(e=t.currentNode).type||0!==e.tagType&&1!==e.tagType)return;let{tag:o,props:a}=e,c=1===e.tagType,u=c?function(e,t,n=!1){let{tag:r}=e,i=av(r),l=os(e,"is",!1,!0);if(l)if(i){let e;if(6===l.type?e=l.value&&sq(l.value.content,!0):(e=l.exp)||(e=sq("is",!1,l.arg.loc)),e)return sK(t.helper(sf),[e])}else 6===l.type&&l.value.content.startsWith("vue:")&&(r=l.value.content.slice(4));let s=s5(r)||t.isBuiltInComponent(r);return s?(n||t.helper(s),s):(t.helper(sh),t.components.add(r),ov(r,"component"))}(e,t):`"${o}"`,d=M(u)&&u.callee===sf,h=0,f=d||u===se||u===st||!c&&("svg"===o||"foreignObject"===o||"math"===o);if(a.length>0){let r=ag(e,t,void 0,c,d);n=r.props,h=r.patchFlag,l=r.dynamicPropNames;let i=r.directives;s=i&&i.length?sj(i.map(e=>(function(e,t){let n=[],r=af.get(e);r?n.push(t.helperString(r)):(t.helper(sp),t.directives.add(e.name),n.push(ov(e.name,"directive")));let{loc:i}=e;if(e.exp&&n.push(e.exp),e.arg&&(e.exp||n.push("void 0"),n.push(e.arg)),Object.keys(e.modifiers).length){e.arg||(e.exp||n.push("void 0"),n.push("void 0"));let t=sq("true",!1,i);n.push(sU(e.modifiers.map(e=>sH(e,t)),i))}return sj(n,e.loc)})(e,t))):void 0,r.shouldUseBlock&&(f=!0)}if(e.children.length>0)if(u===sn&&(f=!0,h|=1024),c&&u!==se&&u!==sn){let{slots:n,hasDynamicSlots:i}=function(e,t,n=(e,t,n,r)=>sz(e,n,!1,!0,n.length?n[0].loc:r)){t.helper(sM);let{children:r,loc:i}=e,l=[],s=[],o=t.scopes.vSlot>0||t.scopes.vFor>0,a=ol(e,"slot",!0);if(a){let{arg:e,exp:t}=a;e&&!s8(e)&&(o=!0),l.push(sH(e||sq("default",!0),n(t,void 0,r,i)))}let c=!1,u=!1,d=[],h=new Set,f=0;for(let e=0;e<r.length;e++){let i,p,g,m,y=r[e];if(!od(y)||!(i=ol(y,"slot",!0))){3!==y.type&&d.push(y);continue}if(a){t.onError(s4(37,i.loc));break}c=!0;let{children:b,loc:_}=y,{arg:S=sq("default",!0),exp:x,loc:C}=i;s8(S)?p=S?S.content:"default":o=!0;let k=ol(y,"for"),T=n(x,k,b,_);if(g=ol(y,"if"))o=!0,s.push(sJ(g.exp,ah(S,T,f++),au));else if(m=ol(y,/^else(?:-if)?$/,!0)){let n,i=e;for(;i--&&oS(n=r[i]););if(n&&od(n)&&ol(n,/^(?:else-)?if$/)){let e=s[s.length-1];for(;19===e.alternate.type;)e=e.alternate;e.alternate=m.exp?sJ(m.exp,ah(S,T,f++),au):ah(S,T,f++)}else t.onError(s4(30,m.loc))}else if(k){o=!0;let e=k.forParseResult;e?(aa(e),s.push(sK(t.helper(sv),[e.source,sz(ac(e),ah(S,T),!0)]))):t.onError(s4(32,k.loc))}else{if(p){if(h.has(p)){t.onError(s4(38,C));continue}h.add(p),"default"===p&&(u=!0)}l.push(sH(S,T))}}if(!a){let e=(e,t)=>sH("default",n(e,void 0,t,i));c?d.length&&!d.every(o_)&&(u?t.onError(s4(39,d[0].loc)):l.push(e(void 0,d))):l.push(e(void 0,r))}let p=o?2:!function e(t){for(let n=0;n<t.length;n++){let r=t[n];switch(r.type){case 1:if(2===r.tagType||e(r.children))return!0;break;case 9:if(e(r.branches))return!0;break;case 10:case 11:if(e(r.children))return!0}}return!1}(e.children)?1:3,g=sU(l.concat(sH("_",sq(p+"",!1))),i);return s.length&&(g=sK(t.helper(sb),[g,sj(s)])),{slots:g,hasDynamicSlots:o}}(e,t);r=n,i&&(h|=1024)}else if(1===e.children.length&&u!==se){let n=e.children[0],i=n.type,l=5===i||8===i;l&&0===oY(n,t)&&(h|=1),r=l||2===i?n:e.children}else r=e.children;l&&l.length&&(i=function(e){let t="[";for(let n=0,r=e.length;n<r;n++)t+=JSON.stringify(e[n]),n<r-1&&(t+=", ");return t+"]"}(l)),e.codegenNode=sB(t,u,n,r,0===h?void 0:h,i,s,!!f,!1,c,e.loc)};function ag(e,t,n=e.props,r,i,l=!1){let s,{tag:o,loc:a,children:c}=e,u=[],d=[],h=[],f=c.length>0,p=!1,g=0,m=!1,y=!1,b=!1,_=!1,S=!1,x=!1,k=[],T=e=>{u.length&&(d.push(sU(am(u),a)),u=[]),e&&d.push(e)},w=()=>{t.scopes.vFor>0&&u.push(sH(sq("ref_for",!0),sq("true")))},N=({key:e,value:n})=>{if(s8(e)){let l=e.content,s=C(l);s&&(!r||i)&&"onclick"!==l.toLowerCase()&&"onUpdate:modelValue"!==l&&!$(l)&&(_=!0),s&&$(l)&&(x=!0),s&&14===n.type&&(n=n.arguments[0]),20===n.type||(4===n.type||8===n.type)&&oY(n,t)>0||("ref"===l?m=!0:"class"===l?y=!0:"style"===l?b=!0:"key"===l||k.includes(l)||k.push(l),r&&("class"===l||"style"===l)&&!k.includes(l)&&k.push(l))}else S=!0};for(let i=0;i<n.length;i++){let s=n[i];if(6===s.type){let{loc:e,name:t,nameLoc:n,value:r}=s;if("ref"===t&&(m=!0,w()),"is"===t&&(av(o)||r&&r.content.startsWith("vue:")))continue;u.push(sH(sq(t,!0,n),sq(r?r.content:"",!0,r?r.loc:e)))}else{let{name:n,arg:i,exp:c,loc:m,modifiers:y}=s,b="bind"===n,_="on"===n;if("slot"===n){r||t.onError(s4(40,m));continue}if("once"===n||"memo"===n||"is"===n||b&&oo(i,"is")&&av(o)||_&&l)continue;if((b&&oo(i,"key")||_&&f&&oo(i,"vue:before-update"))&&(p=!0),b&&oo(i,"ref")&&w(),!i&&(b||_)){S=!0,c?b?(w(),T(),d.push(c)):T({type:14,loc:m,callee:t.helper(sw),arguments:r?[c]:[c,"true"]}):t.onError(s4(b?34:35,m));continue}b&&y.some(e=>"prop"===e.content)&&(g|=32);let x=t.directiveTransforms[n];if(x){let{props:n,needRuntime:r}=x(s,e,t);l||n.forEach(N),_&&i&&!s8(i)?T(sU(n,a)):u.push(...n),r&&(h.push(s),O(r)&&af.set(s,r))}else!D(n)&&(h.push(s),f&&(p=!0))}}if(d.length?(T(),s=d.length>1?sK(t.helper(sS),d,a):d[0]):u.length&&(s=sU(am(u),a)),S?g|=16:(y&&!r&&(g|=2),b&&!r&&(g|=4),k.length&&(g|=8),_&&(g|=32)),!p&&(0===g||32===g)&&(m||x||h.length>0)&&(g|=512),!t.inSSR&&s)switch(s.type){case 15:let A=-1,E=-1,I=!1;for(let e=0;e<s.properties.length;e++){let t=s.properties[e].key;s8(t)?"class"===t.content?A=e:"style"===t.content&&(E=e):t.isHandlerKey||(I=!0)}let R=s.properties[A],M=s.properties[E];I?s=sK(t.helper(sk),[s]):(R&&!s8(R.value)&&(R.value=sK(t.helper(sx),[R.value])),M&&(b||4===M.value.type&&"["===M.value.content.trim()[0]||17===M.value.type)&&(M.value=sK(t.helper(sC),[M.value])));break;case 14:break;default:s=sK(t.helper(sk),[sK(t.helper(sT),[s])])}return{props:s,directives:h,patchFlag:g,dynamicPropNames:k,shouldUseBlock:p}}function am(e){let t=new Map,n=[];for(let l=0;l<e.length;l++){var r,i;let s=e[l];if(8===s.key.type||!s.key.isStatic){n.push(s);continue}let o=s.key.content,a=t.get(o);a?("style"===o||"class"===o||C(o))&&(r=a,i=s,17===r.value.type?r.value.elements.push(i.value):r.value=sj([r.value,i.value],r.loc)):(t.set(o,s),n.push(s))}return n}function av(e){return"component"===e||"Component"===e}let ay=(e,t)=>{if(oh(e)){let{children:n,loc:r}=e,{slotName:i,slotProps:l}=function(e,t){let n,r='"default"',i=[];for(let t=0;t<e.props.length;t++){let n=e.props[t];if(6===n.type)n.value&&("name"===n.name?r=JSON.stringify(n.value.content):(n.name=j(n.name),i.push(n)));else if("bind"===n.name&&oo(n.arg,"name")){if(n.exp)r=n.exp;else if(n.arg&&4===n.arg.type){let e=j(n.arg.content);r=n.exp=sq(e,!1,n.arg.loc)}}else"bind"===n.name&&n.arg&&s8(n.arg)&&(n.arg.content=j(n.arg.content)),i.push(n)}if(i.length>0){let{props:r,directives:l}=ag(e,t,i,!1,!1);n=r,l.length&&t.onError(s4(36,l[0].loc))}return{slotName:r,slotProps:n}}(e,t),s=[t.prefixIdentifiers?"_ctx.$slots":"$slots",i,"{}","undefined","true"],o=2;l&&(s[2]=l,o=3),n.length&&(s[3]=sz([],n,!1,!1,r),o=4),t.scopeId&&!t.slotted&&(o=5),s.splice(o),e.codegenNode=sK(t.helper(sy),s,r)}},ab=(e,t,n,r)=>{let i,{loc:l,modifiers:s,arg:o}=e;if(!e.exp&&!s.length,4===o.type)if(o.isStatic){let e=o.content;e.startsWith("vue:")&&(e=`vnode-${e.slice(4)}`),i=sq(0!==t.tagType||e.startsWith("vnode")||!/[A-Z]/.test(e)?W(j(e)):`on:${e}`,!0,o.loc)}else i=sW([`${n.helperString(sE)}(`,o,")"]);else(i=o).children.unshift(`${n.helperString(sE)}(`),i.children.push(")");let a=e.exp;a&&!a.content.trim()&&(a=void 0);let c=n.cacheHandlers&&!a&&!n.inVOnce;if(a){let e,t=or(a),n=!(t||(e=a,oi.test(on(e)))),r=a.content.includes(";");(n||c&&t)&&(a=sW([`${n?"$event":"(...args)"} => ${r?"{":"("}`,a,r?"}":")"]))}let u={props:[sH(i,a||sq("() => {}",!1,l))]};return r&&(u=r(u)),c&&(u.props[0].value=n.cache(u.props[0].value)),u.props.forEach(e=>e.key.isHandlerKey=!0),u},a_=(e,t,n)=>{let{modifiers:r}=e,i=e.arg,{exp:l}=e;return l&&4===l.type&&!l.content.trim()&&(l=void 0),4!==i.type?(i.children.unshift("("),i.children.push(') || ""')):i.isStatic||(i.content=i.content?`${i.content} || ""`:'""'),r.some(e=>"camel"===e.content)&&(4===i.type?i.isStatic?i.content=j(i.content):i.content=`${n.helperString(sN)}(${i.content})`:(i.children.unshift(`${n.helperString(sN)}(`),i.children.push(")"))),!n.inSSR&&(r.some(e=>"prop"===e.content)&&aS(i,"."),r.some(e=>"attr"===e.content)&&aS(i,"^")),{props:[sH(i,l)]}},aS=(e,t)=>{4===e.type?e.isStatic?e.content=t+e.content:e.content=`\`${t}\${${e.content}}\``:(e.children.unshift(`'${t}' + (`),e.children.push(")"))},ax=(e,t)=>{if(0===e.type||1===e.type||11===e.type||10===e.type)return()=>{let n,r=e.children,i=!1;for(let e=0;e<r.length;e++){let t=r[e];if(oa(t)){i=!0;for(let i=e+1;i<r.length;i++){let l=r[i];if(oa(l))n||(n=r[e]=sW([t],t.loc)),n.children.push(" + ",l),r.splice(i,1),i--;else{n=void 0;break}}}}if(i&&(1!==r.length||0!==e.type&&(1!==e.type||0!==e.tagType||e.props.find(e=>7===e.type&&!t.directiveTransforms[e.name]))))for(let e=0;e<r.length;e++){let n=r[e];if(oa(n)||8===n.type){let i=[];(2!==n.type||" "!==n.content)&&i.push(n),t.ssr||0!==oY(n,t)||i.push("1"),r[e]={type:12,content:n,loc:n.loc,codegenNode:sK(t.helper(su),i)}}}}},aC=new WeakSet,ak=(e,t)=>{if(1===e.type&&ol(e,"once",!0)&&!aC.has(e)&&!t.inVOnce&&!t.inSSR)return aC.add(e),t.inVOnce=!0,t.helper(sI),()=>{t.inVOnce=!1;let e=t.currentNode;e.codegenNode&&(e.codegenNode=t.cache(e.codegenNode,!0,!0))}},aT=(e,t,n)=>{let r,{exp:i,arg:l}=e;if(!i)return n.onError(s4(41,e.loc)),aw();let s=i.loc.source.trim(),o=4===i.type?i.content:s,a=n.bindingMetadata[s];if("props"===a||"props-aliased"===a||"literal-const"===a||"setup-const"===a)return i.loc,aw();if(!o.trim()||!or(i))return n.onError(s4(42,i.loc)),aw();let c=l||sq("modelValue",!0),u=l?s8(l)?`onUpdate:${j(l.content)}`:sW(['"onUpdate:" + ',l]):"onUpdate:modelValue",d=n.isTS?"($event: any)":"$event";r=sW([`${d} => ((`,i,") = $event)"]);let h=[sH(c,e.exp),sH(u,r)];if(e.modifiers.length&&1===t.tagType){let t=e.modifiers.map(e=>e.content).map(e=>(s9.test(e)?JSON.stringify(e):e)+": true").join(", "),n=l?s8(l)?`${l.content}Modifiers`:sW([l,' + "Modifiers"']):"modelModifiers";h.push(sH(n,sq(`{ ${t} }`,!1,e.loc,2)))}return aw(h)};function aw(e=[]){return{props:e}}let aN=new WeakSet,aA=(e,t)=>{if(1===e.type){let n=ol(e,"memo");if(!(!n||aN.has(e))&&!t.inSSR)return aN.add(e),()=>{let r=e.codegenNode||t.currentNode.codegenNode;r&&13===r.type&&(1!==e.tagType&&sG(r,t),e.codegenNode=sK(t.helper(sL),[n.exp,sz(void 0,r),"_cache",String(t.cached.length)]),t.cached.push(null))}}},aE=(e,t)=>{if(1===e.type){for(let n of e.props)if(7===n.type&&"bind"===n.name&&(!n.exp||4===n.exp.type&&!n.exp.content.trim())&&n.arg){let e=n.arg;if(4===e.type&&e.isStatic){let t=j(e.content);(s7.test(t[0])||"-"===t[0])&&(n.exp=sq(t,!1,e.loc))}else t.onError(s4(53,e.loc)),n.exp=sq("",!0,e.loc)}}},aI=Symbol(""),aR=Symbol(""),aO=Symbol(""),aM=Symbol(""),aP=Symbol(""),aF=Symbol(""),aL=Symbol(""),a$=Symbol(""),aD=Symbol(""),aV=Symbol("");Object.getOwnPropertySymbols(r={[aI]:"vModelRadio",[aR]:"vModelCheckbox",[aO]:"vModelText",[aM]:"vModelSelect",[aP]:"vModelDynamic",[aF]:"withModifiers",[aL]:"withKeys",[a$]:"vShow",[aD]:"Transition",[aV]:"TransitionGroup"}).forEach(e=>{sD[e]=r[e]});let aB={parseMode:"html",isVoidTag:ea,isNativeTag:e=>el(e)||es(e)||eo(e),isPreTag:e=>"pre"===e,isIgnoreNewlineTag:e=>"pre"===e||"textarea"===e,decodeEntities:function(e,t=!1){return(p||(p=document.createElement("div")),t)?(p.innerHTML=`<div foo="${e.replace(/"/g,"&quot;")}">`,p.children[0].getAttribute("foo")):(p.innerHTML=e,p.textContent)},isBuiltInComponent:e=>"Transition"===e||"transition"===e?aD:"TransitionGroup"===e||"transition-group"===e?aV:void 0,getNamespace(e,t,n){let r=t?t.ns:n;if(t&&2===r)if("annotation-xml"===t.tag){if("svg"===e)return 1;t.props.some(e=>6===e.type&&"encoding"===e.name&&null!=e.value&&("text/html"===e.value.content||"application/xhtml+xml"===e.value.content))&&(r=0)}else/^m(?:[ions]|text)$/.test(t.tag)&&"mglyph"!==e&&"malignmark"!==e&&(r=0);else t&&1===r&&("foreignObject"===t.tag||"desc"===t.tag||"title"===t.tag)&&(r=0);if(0===r){if("svg"===e)return 1;if("math"===e)return 2}return r}},aj=y("passive,once,capture"),aU=y("stop,prevent,self,ctrl,shift,alt,meta,exact,middle"),aH=y("left,right"),aq=y("onkeyup,onkeydown,onkeypress"),aW=(e,t)=>s8(e)&&"onclick"===e.content.toLowerCase()?sq(t,!0):4!==e.type?sW(["(",e,`) === "onClick" ? "${t}" : (`,e,")"]):e,aK=(e,t)=>{1===e.type&&0===e.tagType&&("script"===e.tag||"style"===e.tag)&&t.removeNode()},az=[e=>{1===e.type&&e.props.forEach((t,n)=>{let r,i;6===t.type&&"style"===t.name&&t.value&&(e.props[n]={type:7,name:"bind",arg:sq("style",!0,t.loc),exp:(r=t.value.content,i=t.loc,sq(JSON.stringify(er(r)),!1,i,3)),modifiers:[],loc:t.loc})})}],aJ={cloak:()=>({props:[]}),html:(e,t,n)=>{let{exp:r,loc:i}=e;return r||n.onError(s4(54,i)),t.children.length&&(n.onError(s4(55,i)),t.children.length=0),{props:[sH(sq("innerHTML",!0,i),r||sq("",!0))]}},text:(e,t,n)=>{let{exp:r,loc:i}=e;return r||n.onError(s4(56,i)),t.children.length&&(n.onError(s4(57,i)),t.children.length=0),{props:[sH(sq("textContent",!0),r?oY(r,n)>0?r:sK(n.helperString(s_),[r],i):sq("",!0))]}},model:(e,t,n)=>{let r=aT(e,t,n);if(!r.props.length||1===t.tagType)return r;e.arg&&n.onError(s4(59,e.arg.loc));let{tag:i}=t,l=n.isCustomElement(i);if("input"===i||"textarea"===i||"select"===i||l){let s=aO,o=!1;if("input"===i||l){let r=os(t,"type");if(r){if(7===r.type)s=aP;else if(r.value)switch(r.value.content){case"radio":s=aI;break;case"checkbox":s=aR;break;case"file":o=!0,n.onError(s4(60,e.loc))}}else t.props.some(e=>7===e.type&&"bind"===e.name&&(!e.arg||4!==e.arg.type||!e.arg.isStatic))&&(s=aP)}else"select"===i&&(s=aM);o||(r.needRuntime=n.helper(s))}else n.onError(s4(58,e.loc));return r.props=r.props.filter(e=>4!==e.key.type||"modelValue"!==e.key.content),r},on:(e,t,n)=>ab(e,t,n,t=>{let{modifiers:r}=e;if(!r.length)return t;let{key:i,value:l}=t.props[0],{keyModifiers:s,nonKeyModifiers:o,eventOptionModifiers:a}=((e,t,n,r)=>{let i=[],l=[],s=[];for(let n=0;n<t.length;n++){let r=t[n].content;aj(r)?s.push(r):aH(r)?s8(e)?aq(e.content.toLowerCase())?i.push(r):l.push(r):(i.push(r),l.push(r)):aU(r)?l.push(r):i.push(r)}return{keyModifiers:i,nonKeyModifiers:l,eventOptionModifiers:s}})(i,r,0,e.loc);if(o.includes("right")&&(i=aW(i,"onContextmenu")),o.includes("middle")&&(i=aW(i,"onMouseup")),o.length&&(l=sK(n.helper(aF),[l,JSON.stringify(o)])),s.length&&(!s8(i)||aq(i.content.toLowerCase()))&&(l=sK(n.helper(aL),[l,JSON.stringify(s)])),a.length){let e=a.map(q).join("");i=s8(i)?sq(`${i.content}${e}`,!0):sW(["(",i,`) + "${e}"`])}return{props:[sH(i,l)]}}),show:(e,t,n)=>{let{exp:r,loc:i}=e;return r||n.onError(s4(62,i)),{props:[],needRuntime:n.helper(a$)}}},aG=Object.create(null);function aX(e,t){if(!R(e))if(!e.nodeType)return S;else e=e.innerHTML;let n=e+JSON.stringify(t,(e,t)=>"function"==typeof t?t.toString():t),r=aG[n];if(r)return r;if("#"===e[0]){let t=document.querySelector(e);e=t?t.innerHTML:""}let i=T({hoistStatic:!0,onError:void 0,onWarn:S},t);!i.isCustomElement&&"u">typeof customElements&&(i.isCustomElement=e=>!!customElements.get(e));let{code:l}=function(e,t={}){return function(e,t={}){var n;let r,i=t.onError||s3,l="module"===t.mode;!0===t.prefixIdentifiers?i(s4(48)):l&&i(s4(49)),t.cacheHandlers&&i(s4(50)),t.scopeId&&!l&&i(s4(51));let s=T({},t,{prefixIdentifiers:!1}),o=R(e)?function(e,t){if(oF.reset(),ow=null,oN=null,oA="",oE=-1,oI=-1,oP.length=0,oT=e,oC=T({},ox),t){let e;for(e in t)null!=t[e]&&(oC[e]=t[e])}oF.mode="html"===oC.parseMode?1:2*("sfc"===oC.parseMode),oF.inXML=1===oC.ns||2===oC.ns;let n=t&&t.delimiters;n&&(oF.delimiterOpen=s1(n[0]),oF.delimiterClose=s1(n[1]));let r=ok=function(e,t=""){return{type:0,source:t,children:e,helpers:new Set,components:[],directives:[],hoists:[],imports:[],cached:[],temps:0,codegenNode:void 0,loc:sV}}([],e);return oF.parse(oT),r.loc=oJ(0,e.length),r.children=oW(r.children),ok=null,r}(e,s):e,[a,c]=[[aE,ak,ar,aA,ao,ay,ap,ad,ax],{on:ab,bind:a_,model:aT}];return r=function(e,{filename:t="",prefixIdentifiers:n=!1,hoistStatic:r=!1,hmr:i=!1,cacheHandlers:l=!1,nodeTransforms:s=[],directiveTransforms:o={},transformHoist:a=null,isBuiltInComponent:c=S,isCustomElement:u=S,expressionPlugins:d=[],scopeId:h=null,slotted:f=!0,ssr:p=!1,inSSR:g=!1,ssrCssVars:m="",bindingMetadata:y=b,inline:_=!1,isTS:x=!1,onError:C=s3,onWarn:k=s6,compatConfig:T}){let w=t.replace(/\?.*$/,"").match(/([^/\\]+)\.\w+$/),N={filename:t,selfName:w&&q(j(w[1])),prefixIdentifiers:n,hoistStatic:r,hmr:i,cacheHandlers:l,nodeTransforms:s,directiveTransforms:o,transformHoist:a,isBuiltInComponent:c,isCustomElement:u,expressionPlugins:d,scopeId:h,slotted:f,ssr:p,inSSR:g,ssrCssVars:m,bindingMetadata:y,inline:_,isTS:x,onError:C,onWarn:k,compatConfig:T,root:e,helpers:new Map,components:new Set,directives:new Set,hoists:[],imports:[],cached:[],constantCache:new WeakMap,vForMemoKeyedNodes:new WeakSet,temps:0,identifiers:Object.create(null),scopes:{vFor:0,vSlot:0,vPre:0,vOnce:0},parent:null,grandParent:null,currentNode:e,childIndex:0,inVOnce:!1,helper(e){let t=N.helpers.get(e)||0;return N.helpers.set(e,t+1),e},removeHelper(e){let t=N.helpers.get(e);if(t){let n=t-1;n?N.helpers.set(e,n):N.helpers.delete(e)}},helperString:e=>`_${sD[N.helper(e)]}`,replaceNode(e){N.parent.children[N.childIndex]=N.currentNode=e},removeNode(e){let t=N.parent.children,n=e?t.indexOf(e):N.currentNode?N.childIndex:-1;e&&e!==N.currentNode?N.childIndex>n&&(N.childIndex--,N.onNodeRemoved()):(N.currentNode=null,N.onNodeRemoved()),N.parent.children.splice(n,1)},onNodeRemoved:S,addIdentifiers(e){},removeIdentifiers(e){},hoist(e){R(e)&&(e=sq(e)),N.hoists.push(e);let t=sq(`_hoisted_${N.hoists.length}`,!1,e.loc,2);return t.hoisted=e,t},cache(e,t=!1,n=!1){let r=function(e,t,n=!1,r=!1){return{type:20,index:e,value:t,needPauseTracking:n,inVOnce:r,needArraySpread:!1,loc:sV}}(N.cached.length,e,t,n);return N.cached.push(r),r}};return N}(o,n=T({},s,{nodeTransforms:[...a,...t.nodeTransforms||[]],directiveTransforms:T({},c,t.directiveTransforms||{})})),o3(o,r),n.hoistStatic&&function e(t,n,r,i=!1,l=!1){let{children:s}=t,o=[];for(let n=0;n<s.length;n++){let a=s[n];if(1===a.type&&0===a.tagType){let e=i?0:oY(a,r);if(e>0){if(e>=2){a.codegenNode.patchFlag=-1,o.push(a);continue}}else{let e=a.codegenNode;if(13===e.type){let t=e.patchFlag;if((void 0===t||512===t||1===t)&&o1(a,r)>=2){let t=o2(a);t&&(e.props=r.hoist(t))}e.dynamicProps&&(e.dynamicProps=r.hoist(e.dynamicProps))}}}else if(12===a.type&&(i?0:oY(a,r))>=2){14===a.codegenNode.type&&a.codegenNode.arguments.length>0&&a.codegenNode.arguments.push("-1"),o.push(a);continue}if(1===a.type){let n=1===a.tagType;n&&r.scopes.vSlot++,e(a,t,r,!1,l),n&&r.scopes.vSlot--}else if(11===a.type)e(a,t,r,1===a.children.length,!0);else if(9===a.type)for(let n=0;n<a.branches.length;n++)e(a.branches[n],t,r,1===a.branches[n].children.length,l)}let a=!1;if(o.length===s.length&&1===t.type){if(0===t.tagType&&t.codegenNode&&13===t.codegenNode.type&&E(t.codegenNode.children))t.codegenNode.children=c(sj(t.codegenNode.children)),a=!0;else if(1===t.tagType&&t.codegenNode&&13===t.codegenNode.type&&t.codegenNode.children&&!E(t.codegenNode.children)&&15===t.codegenNode.children.type){let e=u(t.codegenNode,"default");e&&(e.returns=c(sj(e.returns)),a=!0)}else if(3===t.tagType&&n&&1===n.type&&1===n.tagType&&n.codegenNode&&13===n.codegenNode.type&&n.codegenNode.children&&!E(n.codegenNode.children)&&15===n.codegenNode.children.type){let e=ol(t,"slot",!0),r=e&&e.arg&&u(n.codegenNode,e.arg);r&&(r.returns=c(sj(r.returns)),a=!0)}}if(!a)for(let e of o)e.codegenNode=r.cache(e.codegenNode);function c(e){let t=r.cache(e);return t.needArraySpread=!0,t}function u(e,t){if(e.children&&!E(e.children)&&15===e.children.type){let n=e.children.properties.find(e=>e.key===t||e.key.content===t);return n&&n.value}}o.length&&r.transformHoist&&r.transformHoist(s,r,t)}(o,void 0,r,!!oZ(o)),n.ssr||function(e,t){let{helper:n}=t,{children:r}=e;if(1===r.length){let n=oZ(e);if(n&&n.codegenNode){let r=n.codegenNode;13===r.type&&sG(r,t),e.codegenNode=r}else e.codegenNode=r[0]}else r.length>1&&(e.codegenNode=sB(t,n(l7),void 0,e.children,64,void 0,void 0,!0,void 0,!1))}(o,r),o.helpers=new Set([...r.helpers.keys()]),o.components=[...r.components],o.directives=[...r.directives],o.imports=r.imports,o.hoists=r.hoists,o.temps=r.temps,o.cached=r.cached,o.transformed=!0,function(e,t={}){let n=function(e,{mode:t="function",prefixIdentifiers:n="module"===t,sourceMap:r=!1,filename:i="template.vue.html",scopeId:l=null,optimizeImports:s=!1,runtimeGlobalName:o="Vue",runtimeModuleName:a="vue",ssrRuntimeModuleName:c="vue/server-renderer",ssr:u=!1,isTS:d=!1,inSSR:h=!1}){let f={mode:t,prefixIdentifiers:n,sourceMap:r,filename:i,scopeId:l,optimizeImports:s,runtimeGlobalName:o,runtimeModuleName:a,ssrRuntimeModuleName:c,ssr:u,isTS:d,inSSR:h,source:e.source,code:"",column:1,line:1,offset:0,indentLevel:0,pure:!1,map:void 0,helper:e=>`_${sD[e]}`,push(e,t=-2,n){f.code+=e},indent(){p(++f.indentLevel)},deindent(e=!1){e?--f.indentLevel:p(--f.indentLevel)},newline(){p(f.indentLevel)}};function p(e){f.push(`
`+"  ".repeat(e),0)}return f}(e,t);t.onContextCreated&&t.onContextCreated(n);let{mode:r,push:i,prefixIdentifiers:l,indent:s,deindent:o,newline:a,ssr:c}=n,u=Array.from(e.helpers),d=u.length>0,h=!l&&"module"!==r;!function(e,t){let{push:n,newline:r,runtimeGlobalName:i}=t,l=Array.from(e.helpers);if(l.length>0&&(n(`const _Vue = ${i}
`,-1),e.hoists.length)){let e=[so,sa,sc,su,sd].filter(e=>l.includes(e)).map(o8).join(", ");n(`const { ${e} } = _Vue
`,-1)}(function(e,t){if(!e.length)return;t.pure=!0;let{push:n,newline:r}=t;r();for(let i=0;i<e.length;i++){let l=e[i];l&&(n(`const _hoisted_${i+1} = `),ae(l,t),r())}t.pure=!1})(e.hoists,t),r(),n("return ")}(e,n);let f=(c?["_ctx","_push","_parent","_attrs"]:["_ctx","_cache"]).join(", ");if(i(`function ${c?"ssrRender":"render"}(${f}) {`),s(),h&&(i("with (_ctx) {"),s(),d&&(i(`const { ${u.map(o8).join(", ")} } = _Vue
`,-1),a())),e.components.length&&(o5(e.components,"component",n),(e.directives.length||e.temps>0)&&a()),e.directives.length&&(o5(e.directives,"directive",n),e.temps>0&&a()),e.temps>0){i("let ");for(let t=0;t<e.temps;t++)i(`${t>0?", ":""}_temp${t}`)}return(e.components.length||e.directives.length||e.temps)&&(i(`
`,0),a()),c||i("return "),e.codegenNode?ae(e.codegenNode,n):i("null"),h&&(o(),i("}")),o(),i("}"),{ast:e,code:n.code,preamble:"",map:n.map?n.map.toJSON():void 0}}(o,s)}(e,T({},aB,t,{nodeTransforms:[aK,...az,...t.nodeTransforms||[]],directiveTransforms:T({},aJ,t.directiveTransforms||{}),transformHoist:null}))}(e,i),s=Function(l)();return s._rc=!0,aG[n]=s}return iP(aX),e.BaseTransition=ny,e.BaseTransitionPropsValidators=ng,e.Comment=r9,e.DeprecationTypes=null,e.EffectScope=em,e.ErrorCodes={SETUP_FUNCTION:0,0:"SETUP_FUNCTION",RENDER_FUNCTION:1,1:"RENDER_FUNCTION",NATIVE_EVENT_HANDLER:5,5:"NATIVE_EVENT_HANDLER",COMPONENT_EVENT_HANDLER:6,6:"COMPONENT_EVENT_HANDLER",VNODE_HOOK:7,7:"VNODE_HOOK",DIRECTIVE_HOOK:8,8:"DIRECTIVE_HOOK",TRANSITION_HOOK:9,9:"TRANSITION_HOOK",APP_ERROR_HANDLER:10,10:"APP_ERROR_HANDLER",APP_WARN_HANDLER:11,11:"APP_WARN_HANDLER",FUNCTION_REF:12,12:"FUNCTION_REF",ASYNC_COMPONENT_LOADER:13,13:"ASYNC_COMPONENT_LOADER",SCHEDULER:14,14:"SCHEDULER",COMPONENT_UPDATE:15,15:"COMPONENT_UPDATE",APP_UNMOUNT_CLEANUP:16,16:"APP_UNMOUNT_CLEANUP"},e.ErrorTypeStrings=null,e.Fragment=r8,e.KeepAlive={name:"KeepAlive",__isKeepAlive:!0,props:{include:[String,RegExp,Array],exclude:[String,RegExp,Array],max:[String,Number]},setup(e,{slots:t}){let n=iA(),r=n.ctx,i=new Map,l=new Set,s=null,o=n.suspense,{renderer:{p:a,m:c,um:u,o:{createElement:d}}}=r,h=d("div");function f(e){nG(e),u(e,n,o,!0)}function p(e){i.forEach((t,n)=>{let r=iV(nU(t)?t.type.__asyncResolved||{}:t.type);r&&!e(r)&&g(n)})}function g(e){let t=i.get(e);!t||s&&iu(t,s)?s&&nG(s):f(t),i.delete(e),l.delete(e)}r.activate=(e,t,n,r,i)=>{let l=e.component;c(e,t,n,0,o),a(l.vnode,e,t,n,l,o,r,e.slotScopeIds,i),rW(()=>{l.isDeactivated=!1,l.a&&z(l.a);let t=e.props&&e.props.onVnodeMounted;t&&ik(t,l.parent,e)},o)},r.deactivate=e=>{let t=e.component;rZ(t.m),rZ(t.a),c(e,h,null,1,o),rW(()=>{t.da&&z(t.da);let n=e.props&&e.props.onVnodeUnmounted;n&&ik(n,t.parent,e),t.isDeactivated=!0},o)},t7(()=>[e.include,e.exclude],([e,t])=>{e&&p(t=>nW(e,t)),t&&p(e=>!nW(t,e))},{flush:"post",deep:!0});let m=null,y=()=>{null!=m&&(rY(n.subTree.type)?rW(()=>{i.set(m,nX(n.subTree))},n.subTree.suspense):i.set(m,nX(n.subTree)))};return n0(y),n2(y),n3(()=>{i.forEach(e=>{let{subTree:t,suspense:r}=n,i=nX(t);if(e.type===i.type&&e.key===i.key){nG(i);let e=i.component.da;e&&rW(e,r);return}f(e)})}),()=>{if(m=null,!t.default)return s=null;let n=t.default(),r=n[0];if(n.length>1)return s=null,n;if(!ic(r)||!(4&r.shapeFlag)&&!(128&r.shapeFlag))return s=null,r;let o=nX(r);if(o.type===r9)return s=null,o;let a=o.type,c=iV(nU(o)?o.type.__asyncResolved||{}:a),{include:u,exclude:d,max:h}=e;if(u&&(!c||!nW(u,c))||d&&c&&nW(d,c))return o.shapeFlag&=-257,s=o,r;let f=null==o.key?a:o.key,p=i.get(f);return o.el&&(o=iv(o),128&r.shapeFlag&&(r.ssContent=o)),m=f,p?(o.el=p.el,o.component=p.component,o.transition&&nC(o,o.transition),o.shapeFlag|=512,l.delete(f),l.add(f)):(l.add(f),h&&l.size>parseInt(h,10)&&g(l.values().next().value)),o.shapeFlag|=256,s=o,rY(r.type)?r:o}}},e.ReactiveEffect=ey,e.Static=r7,e.Suspense={name:"Suspense",__isSuspense:!0,process(e,t,n,r,i,l,s,o,a,c){if(null==e)!function(e,t,n,r,i,l,s,o,a){let{p:c,o:{createElement:u}}=a,d=u("div"),h=e.suspense=r2(e,i,r,t,d,n,l,s,o,a);c(null,h.pendingBranch=e.ssContent,d,null,r,h,l,s),h.deps>0?(r1(e,"onPending"),r1(e,"onFallback"),c(null,e.ssFallback,t,n,r,null,l,s),r4(h,e.ssFallback)):h.resolve(!1,!0)}(t,n,r,i,l,s,o,a,c);else{if(l&&l.deps>0&&!e.suspense.isInFallback){t.suspense=e.suspense,t.suspense.vnode=t,t.el=e.el;return}!function(e,t,n,r,i,l,s,o,{p:a,um:c,o:{createElement:u}}){let d=t.suspense=e.suspense;d.vnode=t,t.el=e.el;let h=t.ssContent,f=t.ssFallback,{activeBranch:p,pendingBranch:g,isInFallback:m,isHydrating:y}=d;if(g)d.pendingBranch=h,iu(g,h)?(a(g,h,d.hiddenContainer,null,i,d,l,s,o),d.deps<=0?d.resolve():m&&!y&&(a(p,f,n,r,i,null,l,s,o),r4(d,f))):(d.pendingId=r0++,y?(d.isHydrating=!1,d.activeBranch=g):c(g,i,d),d.deps=0,d.effects.length=0,d.hiddenContainer=u("div"),m?(a(null,h,d.hiddenContainer,null,i,d,l,s,o),d.deps<=0?d.resolve():(a(p,f,n,r,i,null,l,s,o),r4(d,f))):p&&iu(p,h)?(a(p,h,n,r,i,d,l,s,o),d.resolve(!0)):(a(null,h,d.hiddenContainer,null,i,d,l,s,o),d.deps<=0&&d.resolve()));else if(p&&iu(p,h))a(p,h,n,r,i,d,l,s,o),r4(d,h);else if(r1(t,"onPending"),d.pendingBranch=h,512&h.shapeFlag?d.pendingId=h.component.suspenseId:d.pendingId=r0++,a(null,h,d.hiddenContainer,null,i,d,l,s,o),d.deps<=0)d.resolve();else{let{timeout:e,pendingId:t}=d;e>0?setTimeout(()=>{d.pendingId===t&&d.fallback(f)},e):0===e&&d.fallback(f)}}(e,t,n,r,i,s,o,a,c)}},hydrate:function(e,t,n,r,i,l,s,o,a){let c=t.suspense=r2(t,r,n,e.parentNode,document.createElement("div"),null,i,l,s,o,!0),u=a(e,c.pendingBranch=t.ssContent,n,c,l,s);return 0===c.deps&&c.resolve(!1,!0),u},normalize:function(e){let{shapeFlag:t,children:n}=e,r=32&t;e.ssContent=r3(r?n.default:n),e.ssFallback=r?r3(n.fallback):ig(r9)}},e.Teleport={name:"Teleport",__isTeleport:!0,process(e,t,n,r,i,l,s,o,a,c){let{mc:u,pc:d,pbc:h,o:{insert:f,querySelector:p,createText:g,parentNode:m}}=c,y=ni(t.props),{dynamicChildren:b}=t,_=(e,t,n)=>{16&e.shapeFlag&&u(e.children,t,n,i,l,s,o,a)},S=(e=t)=>{let n=ni(e.props),r=e.target=no(e.props,p),l=nu(r,e,g,f);r&&("svg"!==s&&nl(r)?s="svg":"mathml"!==s&&ns(r)&&(s="mathml"),i&&i.isCE&&(i.ce._teleportTargets||(i.ce._teleportTargets=new Set)).add(r),n||(_(e,r,l),nc(e,!1)))},x=e=>{let t=()=>{if(nn.get(e)===t){if(nn.delete(e),ni(e.props)){let t=m(e.el)||n;_(e,t,e.anchor),nc(e,!0)}S(e)}};nn.set(e,t),rW(t,l)};if(null==e){let e,i=t.el=g(""),s=t.anchor=g("");if(f(i,n,r),f(s,n,r),(e=t.props)&&(e.defer||""===e.defer)||l&&l.pendingBranch)return void x(t);y&&(_(t,n,s),nc(t,!0)),S()}else{t.el=e.el;let r=t.anchor=e.anchor,u=nn.get(e);if(u){u.flags|=8,nn.delete(e),x(t);return}t.targetStart=e.targetStart;let f=t.target=e.target,g=t.targetAnchor=e.targetAnchor,m=ni(e.props),_=m?n:f,S=m?r:g;if("svg"===s||nl(f)?s="svg":("mathml"===s||ns(f))&&(s="mathml"),b?(h(e.dynamicChildren,b,_,i,l,s,o),rQ(e,t,!0)):a||d(e,t,_,S,i,l,s,o,!1),y)m?t.props&&e.props&&t.props.to!==e.props.to&&(t.props.to=e.props.to):na(t,n,r,c,1);else if((t.props&&t.props.to)!==(e.props&&e.props.to)){let e=no(t.props,p);e&&(t.target=e,na(t,e,null,c,0))}else m&&na(t,f,g,c,1);nc(t,y)}},remove(e,t,n,{um:r,o:{remove:i}},l){let{shapeFlag:s,children:o,anchor:a,targetStart:c,targetAnchor:u,target:d,props:h}=e,f=ni(h),p=l||!f,g=nn.get(e);if(g&&(g.flags|=8,nn.delete(e)),d&&(i(c),i(u)),l&&i(a),!g&&(f||d)&&16&s)for(let e=0;e<o.length;e++){let i=o[e];r(i,t,n,p,!!i.dynamicChildren)}},move:na,hydrate:function(e,t,n,r,i,l,{o:{nextSibling:s,parentNode:o,querySelector:a,insert:c,createText:u}},d){function h(e,n){let r=n;for(;r;){if(r&&8===r.nodeType){if("teleport start anchor"===r.data)t.targetStart=r;else if("teleport anchor"===r.data){t.targetAnchor=r,e._lpa=t.targetAnchor&&s(t.targetAnchor);break}}r=s(r)}}function f(e,t){t.anchor=d(s(e),t,o(e),n,r,i,l)}let p=t.target=no(t.props,a),g=ni(t.props);if(p){let a=p._lpa||p.firstChild;16&t.shapeFlag&&(g?(f(e,t),h(p,a),t.targetAnchor||nu(p,t,u,c,o(e)===p?e:null)):(t.anchor=s(e),h(p,a),t.targetAnchor||nu(p,t,u,c),d(a&&s(a),t,p,n,r,i,l))),nc(t,g)}else g&&16&t.shapeFlag&&(f(e,t),t.targetStart=e,t.targetAnchor=s(e));return t.anchor&&s(t.anchor)}},e.Text=r5,e.TrackOpTypes={GET:"get",HAS:"has",ITERATE:"iterate"},e.Transition=i0,e.TransitionGroup=lM,e.TriggerOpTypes={SET:"set",ADD:"add",DELETE:"delete",CLEAR:"clear"},e.VueElement=lN,e.assertNumber=function(e,t){},e.callWithAsyncErrorHandling=tD,e.callWithErrorHandling=t$,e.camelize=j,e.capitalize=q,e.cloneVNode=iv,e.compatUtils=null,e.compile=aX,e.computed=iB,e.createApp=l4,e.createBlock=ia,e.createCommentVNode=ib,e.createElementBlock=function(e,t,n,r,i,l){return io(ip(e,t,n,r,i,l,!0))},e.createElementVNode=ip,e.createHydrationRenderer=rK,e.createPropsRestProxy=function(e,t){let n={};for(let r in e)t.includes(r)||Object.defineProperty(n,r,{enumerable:!0,get:()=>e[r]});return n},e.createRenderer=function(e){return rz(e)},e.createSSRApp=l8,e.createSlots=function(e,t){for(let n=0;n<t.length;n++){let r=t[n];if(E(r))for(let t=0;t<r.length;t++)e[r[t].name]=r[t].fn;else r&&(e[r.name]=r.key?(...e)=>{let t=r.fn(...e);return t&&(t.key=r.key),t}:r.fn)}return e},e.createStaticVNode=function(e,t){let n=ig(r7,null,e);return n.staticCount=t,n},e.createTextVNode=iy,e.createVNode=ig,e.customRef=tE,e.defineAsyncComponent=function(e){let t;I(e)&&(e={loader:e});let{loader:n,loadingComponent:r,errorComponent:i,delay:l=200,hydrate:s,timeout:o,suspensible:a=!0,onError:c}=e,u=null,d=0,h=()=>{let e;return u||(e=u=n().catch(e=>{if(e=e instanceof Error?e:Error(String(e)),c)return new Promise((t,n)=>{c(e,()=>t((d++,u=null,h())),()=>n(e),d+1)});throw e}).then(n=>e!==u&&u?u:(n&&(n.__esModule||"Module"===n[Symbol.toStringTag])&&(n=n.default),t=n,n)))};return nT({name:"AsyncComponentWrapper",__asyncLoader:h,__asyncHydrate(e,n,r){let i=e.isConnected,l=!1;(n.bu||(n.bu=[])).push(()=>l=!0);let o=()=>{l||e.parentNode&&(!i||e.isConnected)&&r()},a=s?()=>{let t=s(o,t=>(function(e,t){if(nP(e)&&"["===e.data){let n=1,r=e.nextSibling;for(;r;){if(1===r.nodeType){if(!1===t(r))break}else if(nP(r))if("]"===r.data){if(0==--n)break}else"["===r.data&&n++;r=r.nextSibling}}else t(e)})(e,t));t&&(n.bum||(n.bum=[])).push(t)}:o;t?a():h().then(()=>!n.isUnmounted&&a())},get __asyncResolved(){return t},setup(){let e,n,s=iN;if(nw(s),t)return()=>nH(t,s);let c=e=>{u=null,tV(e,s,13,!i)};if(a&&s.suspense)return h().then(e=>()=>nH(e,s)).catch(e=>(c(e),()=>i?ig(i,{error:e}):null));let d=tS(!1),f=tS(),p=tS(!!l);return n6(()=>{null!=e&&clearTimeout(e),null!=n&&clearTimeout(n)}),l&&(n=setTimeout(()=>{s.isUnmounted||(p.value=!1)},l)),null!=o&&(e=setTimeout(()=>{if(!s.isUnmounted&&!d.value&&!f.value){let e=Error(`Async component timed out after ${o}ms.`);c(e),f.value=e}},o)),h().then(()=>{!s.isUnmounted&&(d.value=!0,s.parent&&nq(s.parent.vnode)&&s.parent.update())}).catch(e=>{if(s.isUnmounted){u=null;return}c(e),f.value=e}),()=>d.value&&t?nH(t,s):f.value&&i?ig(i,{error:f.value}):r&&!p.value?nH(r,s):void 0}})},e.defineComponent=nT,e.defineCustomElement=lT,e.defineEmits=function(){return null},e.defineExpose=function(e){},e.defineModel=function(){},e.defineOptions=function(e){},e.defineProps=function(){return null},e.defineSSRCustomElement=(e,t)=>lT(e,t,l8),e.defineSlots=function(){return null},e.devtools=void 0,e.effect=function(e,t){e.effect instanceof ey&&(e=e.effect.fn);let n=new ey(e);t&&T(n,t);try{n.run()}catch(e){throw n.stop(),e}let r=n.run.bind(n);return r.effect=n,r},e.effectScope=function(e){return new em(e)},e.getCurrentInstance=iA,e.getCurrentScope=function(){return l},e.getCurrentWatcher=function(){return g},e.getTransitionRawChildren=nk,e.guardReactiveProps=im,e.h=ij,e.handleError=tV,e.hasInjectionContext=function(){return!!(iA()||rx)},e.hydrate=(...e)=>{l3().hydrate(...e)},e.hydrateOnIdle=(e=1e4)=>t=>{let n=nB(t,{timeout:e});return()=>nj(n)},e.hydrateOnInteraction=(e=[])=>(t,n)=>{R(e)&&(e=[e]);let r=!1,i=e=>{r||(r=!0,l(),t(),e.target.dispatchEvent(new e.constructor(e.type,e)))},l=()=>{n(t=>{for(let n of e)t.removeEventListener(n,i)})};return n(t=>{for(let n of e)t.addEventListener(n,i,{once:!0})}),l},e.hydrateOnMediaQuery=e=>t=>{if(e){let n=matchMedia(e);if(!n.matches)return n.addEventListener("change",t,{once:!0}),()=>n.removeEventListener("change",t);t()}},e.hydrateOnVisible=e=>(t,n)=>{let r=new IntersectionObserver(e=>{for(let n of e)if(n.isIntersecting){r.disconnect(),t();break}},e);return n(e=>{if(e instanceof Element){if(function(e){let{top:t,left:n,bottom:r,right:i}=e.getBoundingClientRect(),{innerHeight:l,innerWidth:s}=window;return(t>0&&t<l||r>0&&r<l)&&(n>0&&n<s||i>0&&i<s)}(e))return t(),r.disconnect(),!1;r.observe(e)}}),()=>r.disconnect()},e.initCustomFormatter=function(){},e.initDirectivesForSSR=S,e.inject=t8,e.isMemoSame=iU,e.isProxy=tg,e.isReactive=th,e.isReadonly=tf,e.isRef=t_,e.isRuntimeOnly=()=>!d,e.isShallow=tp,e.isVNode=ic,e.markRaw=tv,e.mergeDefaults=function(e,t){let n=rc(e);for(let e in t){if(e.startsWith("__skip"))continue;let r=n[e];r?E(r)||I(r)?r=n[e]={type:r,default:t[e]}:r.default=t[e]:null===r&&(r=n[e]={default:t[e]}),r&&t[`__skip_${e}`]&&(r.skipFactory=!0)}return n},e.mergeModels=function(e,t){return e&&t?E(e)&&E(t)?e.concat(t):T({},rc(e),rc(t)):e||t},e.mergeProps=iC,e.nextTick=tz,e.nodeOps=iJ,e.normalizeClass=ei,e.normalizeProps=function(e){if(!e)return null;let{class:t,style:n}=e;return t&&!R(t)&&(e.class=ei(t)),n&&(e.style=Y(n)),e},e.normalizeStyle=Y,e.onActivated=nK,e.onBeforeMount=nY,e.onBeforeUnmount=n3,e.onBeforeUpdate=n1,e.onDeactivated=nz,e.onErrorCaptured=n9,e.onMounted=n0,e.onRenderTracked=n5,e.onRenderTriggered=n8,e.onScopeDispose=function(e,t=!1){l&&l.cleanups.push(e)},e.onServerPrefetch=n4,e.onUnmounted=n6,e.onUpdated=n2,e.onWatcherCleanup=tF,e.openBlock=ir,e.patchProp=lC,e.popScopeId=function(){t1=null},e.provide=t4,e.proxyRefs=tN,e.pushScopeId=function(e){t1=e},e.queuePostFlushCb=tX,e.reactive=ta,e.readonly=tu,e.ref=tS,e.registerRuntimeCompiler=iP,e.render=l6,e.renderList=function(e,t,n,r){let i,l=n&&n[r],s=E(e);if(s||R(e)){let n=s&&th(e),r=!1,o=!1;n&&(r=!tp(e),o=tf(e),e=eU(e)),i=Array(e.length);for(let n=0,s=e.length;n<s;n++)i[n]=t(r?o?tb(ty(e[n])):ty(e[n]):e[n],n,void 0,l&&l[n])}else if("number"==typeof e){i=Array(e);for(let n=0;n<e;n++)i[n]=t(n+1,n,void 0,l&&l[n])}else if(M(e))if(e[Symbol.iterator])i=Array.from(e,(e,n)=>t(e,n,void 0,l&&l[n]));else{let n=Object.keys(e);i=Array(n.length);for(let r=0,s=n.length;r<s;r++){let s=n[r];i[r]=t(e[s],s,r,l&&l[r])}}else i=[];return n&&(n[r]=i),i},e.renderSlot=function(e,t,n={},r,i,l){let s;if(t0.ce||t0.parent&&nU(t0.parent)&&t0.parent.ce){let e=null!=l&&null==n.key?T({},n,{key:l}):n,i=Object.keys(e).length>0;return"default"!==t&&(e.name=t),ir(),ia(r8,null,[ig("slot",e,r&&r())],i?-2:64)}let o=e[t];o&&o._c&&(o._d=!1);let a=ie.length;ir();try{let i=o&&function e(t){return t.some(t=>!ic(t)||t.type!==r9&&(t.type!==r8||!!e(t.children)))?t:null}(o(n)),a=n.key||l||i&&i.key;s=ia(r8,{key:(a&&!O(a)?a:`_${t}`)+(!i&&r?"_fb":"")},i||(r?r():[]),i&&1===e._?64:-2)}catch(e){for(let e=ie.length;e>a;e--)ii();throw e}finally{o&&o._c&&(o._d=!0)}return!i&&s.scopeId&&(s.slotScopeIds=[s.scopeId+"-s"]),s},e.resolveComponent=function(e,t){return rt(n7,e,!0,t)||e},e.resolveDirective=function(e){return rt("directives",e)},e.resolveDynamicComponent=function(e){return R(e)?rt(n7,e,!1)||e:e||re},e.resolveFilter=null,e.resolveTransitionHooks=n_,e.setBlockTracking=is,e.setDevtoolsHook=S,e.setTransitionHooks=nC,e.shallowReactive=tc,e.shallowReadonly=function(e){return td(e,!0,e8,tr,to)},e.shallowRef=tx,e.ssrContextKey=t5,e.ssrUtils=null,e.stop=function(e){e.effect.stop()},e.toDisplayString=ef,e.toHandlerKey=W,e.toHandlers=function(e,t){let n={};for(let r in e)n[t&&/[A-Z]/.test(r)?`on:${r}`:W(r)]=e[r];return n},e.toRaw=tm,e.toRef=function(e,t,n){if(t_(e))return e;if(I(e))return new tR(e);if(!M(e)||!(arguments.length>1))return tS(e);return new tI(e,t,n)},e.toRefs=function(e){let t=E(e)?Array(e.length):{};for(let n in e)t[n]=new tI(e,n,void 0);return t},e.toValue=function(e){return I(e)?e():tT(e)},e.transformVNodeArgs=function(e){},e.triggerRef=function(e){e.dep&&e.dep.trigger()},e.unref=tT,e.useAttrs=function(){return ra().attrs},e.useCssModule=function(e="$style"){return b},e.useCssVars=function(e){let t=iA();if(!t)return;let n=t.ut=(n=e(t.proxy))=>{Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach(e=>lo(e,n))},r=()=>{let r=e(t.proxy);t.ce?lo(t.ce,r):function e(t,n){if(128&t.shapeFlag){let r=t.suspense;t=r.activeBranch,r.pendingBranch&&!r.isHydrating&&r.effects.push(()=>{e(r.activeBranch,n)})}for(;t.component;)t=t.component.subTree;if(1&t.shapeFlag&&t.el)lo(t.el,n);else if(t.type===r8)t.children.forEach(t=>e(t,n));else if(t.type===r7){let{el:e,anchor:r}=t;for(;e&&(lo(e,n),e!==r);)e=e.nextSibling}}(t.subTree,r),n(r)};n1(()=>{tX(r)}),n0(()=>{t7(r,S,{flush:"post"});let e=new MutationObserver(r);e.observe(t.subTree.el.parentNode,{childList:!0}),n6(()=>e.disconnect())})},e.useHost=lA,e.useId=function(){let e=iA();return e?(e.appContext.config.idPrefix||"v")+"-"+e.ids[0]+e.ids[1]++:""},e.useModel=function(e,t,n=b){let r=iA(),i=j(t),l=H(t),s=rC(e,i),o=tE((s,o)=>{let a,c,u=b;return t9(()=>{let t=e[i];K(a,t)&&(a=t,o())}),{get:()=>(s(),n.get?n.get(a):a),set(e){let s=n.set?n.set(e):e;if(!K(s,a)&&!(u!==b&&K(e,u)))return;let d=r.vnode.props,h=!!(d&&(t in d||i in d||l in d)&&(`onUpdate:${t}`in d||`onUpdate:${i}`in d||`onUpdate:${l}`in d));h||(a=e,o()),r.emit(`update:${t}`,s),K(e,u)&&(K(e,s)&&!K(s,c)||h&&u!==b&&!K(s,a))&&o(),u=e,c=s}}});return o[Symbol.iterator]=()=>{let e=0;return{next:()=>e<2?{value:e++?s||b:o,done:!1}:{done:!0}}},o},e.useSSRContext=()=>{},e.useShadowRoot=function(){let e=lA();return e&&e.shadowRoot},e.useSlots=function(){return ra().slots},e.useTemplateRef=function(e){let t=iA(),n=tx(null);return t&&Object.defineProperty(t.refs===b?t.refs={}:t.refs,e,{enumerable:!0,get:()=>n.value,set:e=>n.value=e}),n},e.useTransitionState=nf,e.vModelCheckbox=lq,e.vModelDynamic={created(e,t,n){lQ(e,t,n,null,"created")},mounted(e,t,n){lQ(e,t,n,null,"mounted")},beforeUpdate(e,t,n,r){lQ(e,t,n,r,"beforeUpdate")},updated(e,t,n,r){lQ(e,t,n,r,"updated")}},e.vModelRadio=lK,e.vModelSelect=lz,e.vModelText=lH,e.vShow={name:"show",beforeMount(e,{value:t},{transition:n}){e[lr]="none"===e.style.display?"":e.style.display,n&&t?n.beforeEnter(e):ll(e,t)},mounted(e,{value:t},{transition:n}){n&&t&&n.enter(e)},updated(e,{value:t,oldValue:n},{transition:r}){!t!=!n&&(r?t?(r.beforeEnter(e),ll(e,!0),r.enter(e)):r.leave(e,()=>{ll(e,!1)}):ll(e,t))},beforeUnmount(e,{value:t}){ll(e,t)}},e.version=iH,e.warn=S,e.watch=function(e,t,n){return t7(e,t,n)},e.watchEffect=function(e,t){return t7(e,null,t)},e.watchPostEffect=function(e,t){return t7(e,null,{flush:"post"})},e.watchSyncEffect=t9,e.withAsyncContext=function(e){let t=iA(),n=iO,r=e();iI(),n&&u(!1);let i=()=>{iE(t),n&&u(!0)},l=()=>{iA()!==t&&t.scope.off(),iI(),n&&u(!1)};return P(r)&&(r=r.catch(e=>{throw i(),Promise.resolve().then(()=>Promise.resolve().then(l)),e})),[r,()=>{i(),Promise.resolve().then(l)}]},e.withCtx=t3,e.withDefaults=function(e,t){return null},e.withDirectives=function(e,t){if(null===t0)return e;let n=iD(t0),r=e.dirs||(e.dirs=[]);for(let e=0;e<t.length;e++){let[i,l,s,o=b]=t[e];i&&(I(i)&&(i={mounted:i,updated:i}),i.deep&&tL(l),r.push({dir:i,instance:n,value:l,oldValue:void 0,arg:s,modifiers:o}))}return e},e.withKeys=(e,t)=>{let n=e._withKeys||(e._withKeys={}),r=t.join(".");return n[r]||(n[r]=n=>{if(!("key"in n))return;let r=H(n.key);if(t.some(e=>e===r||l0[e]===r))return e(n)})},e.withMemo=function(e,t,n,r){let i=n[r];if(i&&iU(i,e))return i;let l=t();return l.memo=e.slice(),l.cacheIndex=r,n[r]=l},e.withModifiers=(e,t)=>{if(!e)return e;let n=e._withMods||(e._withMods={}),r=t.join(".");return n[r]||(n[r]=(n,...r)=>{for(let e=0;e<t.length;e++){let r=lY[t[e]];if(r&&r(n,t))return}return e(n,...r)})},e.withScopeId=e=>t3,e}({});

return window.Vue; }).call(window);
var moment = (function(){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.moment=t()}(this,function(){"use strict";var H;function _(){return H.apply(null,arguments)}function y(e){return e instanceof Array||"[object Array]"===Object.prototype.toString.call(e)}function F(e){return null!=e&&"[object Object]"===Object.prototype.toString.call(e)}function c(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function L(e){if(Object.getOwnPropertyNames)return 0===Object.getOwnPropertyNames(e).length;for(var t in e)if(c(e,t))return;return 1}function g(e){return void 0===e}function w(e){return"number"==typeof e||"[object Number]"===Object.prototype.toString.call(e)}function V(e){return e instanceof Date||"[object Date]"===Object.prototype.toString.call(e)}function G(e,t){for(var n=[],s=e.length,i=0;i<s;++i)n.push(t(e[i],i));return n}function E(e,t){for(var n in t)c(t,n)&&(e[n]=t[n]);return c(t,"toString")&&(e.toString=t.toString),c(t,"valueOf")&&(e.valueOf=t.valueOf),e}function l(e,t,n,s){return Wt(e,t,n,s,!0).utc()}function p(e){return null==e._pf&&(e._pf={empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidEra:null,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],era:null,meridiem:null,rfc2822:!1,weekdayMismatch:!1}),e._pf}function A(e){var t,n,s=e._d&&!isNaN(e._d.getTime());return s&&(t=p(e),n=j.call(t.parsedDateParts,function(e){return null!=e}),s=t.overflow<0&&!t.empty&&!t.invalidEra&&!t.invalidMonth&&!t.invalidWeekday&&!t.weekdayMismatch&&!t.nullInput&&!t.invalidFormat&&!t.userInvalidated&&(!t.meridiem||t.meridiem&&n),e._strict)&&(s=s&&0===t.charsLeftOver&&0===t.unusedTokens.length&&void 0===t.bigHour),null!=Object.isFrozen&&Object.isFrozen(e)?s:(e._isValid=s,e._isValid)}function I(e){var t=l(NaN);return null!=e?E(p(t),e):p(t).userInvalidated=!0,t}var j=Array.prototype.some||function(e){for(var t=Object(this),n=t.length>>>0,s=0;s<n;s++)if(s in t&&e.call(this,t[s],s,t))return!0;return!1},Z=_.momentProperties=[],z=!1;function q(e,t){var n,s,i,r=Z.length;if(g(t._isAMomentObject)||(e._isAMomentObject=t._isAMomentObject),g(t._i)||(e._i=t._i),g(t._f)||(e._f=t._f),g(t._l)||(e._l=t._l),g(t._strict)||(e._strict=t._strict),g(t._tzm)||(e._tzm=t._tzm),g(t._isUTC)||(e._isUTC=t._isUTC),g(t._offset)||(e._offset=t._offset),g(t._pf)||(e._pf=p(t)),g(t._locale)||(e._locale=t._locale),0<r)for(n=0;n<r;n++)g(i=t[s=Z[n]])||(e[s]=i);return e}function $(e){q(this,e),this._d=new Date(null!=e._d?e._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),!1===z&&(z=!0,_.updateOffset(this),z=!1)}function k(e){return e instanceof $||null!=e&&null!=e._isAMomentObject}function B(e){!1===_.suppressDeprecationWarnings&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+e)}function e(r,a){var o=!0;return E(function(){if(null!=_.deprecationHandler&&_.deprecationHandler(null,r),o){for(var e,t,n=[],s=arguments.length,i=0;i<s;i++){if(e="","object"==typeof arguments[i]){for(t in e+="\n["+i+"] ",arguments[0])c(arguments[0],t)&&(e+=t+": "+arguments[0][t]+", ");e=e.slice(0,-2)}else e=arguments[i];n.push(e)}B(r+"\nArguments: "+Array.prototype.slice.call(n).join("")+"\n"+(new Error).stack),o=!1}return a.apply(this,arguments)},a)}var J={};function Q(e,t){null!=_.deprecationHandler&&_.deprecationHandler(e,t),J[e]||(B(t),J[e]=!0)}function a(e){return"undefined"!=typeof Function&&e instanceof Function||"[object Function]"===Object.prototype.toString.call(e)}function X(e,t){var n,s=E({},e);for(n in t)c(t,n)&&(F(e[n])&&F(t[n])?(s[n]={},E(s[n],e[n]),E(s[n],t[n])):null!=t[n]?s[n]=t[n]:delete s[n]);for(n in e)c(e,n)&&!c(t,n)&&F(e[n])&&(s[n]=E({},s[n]));return s}function K(e){null!=e&&this.set(e)}_.suppressDeprecationWarnings=!1,_.deprecationHandler=null;var ee=Object.keys||function(e){var t,n=[];for(t in e)c(e,t)&&n.push(t);return n};function r(e,t,n){var s=""+Math.abs(e);return(0<=e?n?"+":"":"-")+Math.pow(10,Math.max(0,t-s.length)).toString().substr(1)+s}var te=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,ne=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,se={},ie={};function s(e,t,n,s){var i="string"==typeof s?function(){return this[s]()}:s;e&&(ie[e]=i),t&&(ie[t[0]]=function(){return r(i.apply(this,arguments),t[1],t[2])}),n&&(ie[n]=function(){return this.localeData().ordinal(i.apply(this,arguments),e)})}function re(e,t){return e.isValid()?(t=ae(t,e.localeData()),se[t]=se[t]||function(s){for(var e,i=s.match(te),t=0,r=i.length;t<r;t++)ie[i[t]]?i[t]=ie[i[t]]:i[t]=(e=i[t]).match(/\[[\s\S]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"");return function(e){for(var t="",n=0;n<r;n++)t+=a(i[n])?i[n].call(e,s):i[n];return t}}(t),se[t](e)):e.localeData().invalidDate()}function ae(e,t){var n=5;function s(e){return t.longDateFormat(e)||e}for(ne.lastIndex=0;0<=n&&ne.test(e);)e=e.replace(ne,s),ne.lastIndex=0,--n;return e}var oe={D:"date",dates:"date",date:"date",d:"day",days:"day",day:"day",e:"weekday",weekdays:"weekday",weekday:"weekday",E:"isoWeekday",isoweekdays:"isoWeekday",isoweekday:"isoWeekday",DDD:"dayOfYear",dayofyears:"dayOfYear",dayofyear:"dayOfYear",h:"hour",hours:"hour",hour:"hour",ms:"millisecond",milliseconds:"millisecond",millisecond:"millisecond",m:"minute",minutes:"minute",minute:"minute",M:"month",months:"month",month:"month",Q:"quarter",quarters:"quarter",quarter:"quarter",s:"second",seconds:"second",second:"second",gg:"weekYear",weekyears:"weekYear",weekyear:"weekYear",GG:"isoWeekYear",isoweekyears:"isoWeekYear",isoweekyear:"isoWeekYear",w:"week",weeks:"week",week:"week",W:"isoWeek",isoweeks:"isoWeek",isoweek:"isoWeek",y:"year",years:"year",year:"year"};function o(e){return"string"==typeof e?oe[e]||oe[e.toLowerCase()]:void 0}function ue(e){var t,n,s={};for(n in e)c(e,n)&&(t=o(n))&&(s[t]=e[n]);return s}var le={date:9,day:11,weekday:11,isoWeekday:11,dayOfYear:4,hour:13,millisecond:16,minute:14,month:8,quarter:7,second:15,weekYear:1,isoWeekYear:1,week:5,isoWeek:5,year:1};var de=/\d/,t=/\d\d/,he=/\d{3}/,ce=/\d{4}/,fe=/[+-]?\d{6}/,n=/\d\d?/,me=/\d\d\d\d?/,_e=/\d\d\d\d\d\d?/,ye=/\d{1,3}/,ge=/\d{1,4}/,we=/[+-]?\d{1,6}/,pe=/\d+/,ke=/[+-]?\d+/,Me=/Z|[+-]\d\d:?\d\d/gi,ve=/Z|[+-]\d\d(?::?\d\d)?/gi,i=/[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,u=/^[1-9]\d?/,d=/^([1-9]\d|\d)/;function h(e,n,s){Ye[e]=a(n)?n:function(e,t){return e&&s?s:n}}function De(e,t){return c(Ye,e)?Ye[e](t._strict,t._locale):new RegExp(f(e.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(e,t,n,s,i){return t||n||s||i})))}function f(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function m(e){return e<0?Math.ceil(e)||0:Math.floor(e)}function M(e){var e=+e,t=0;return t=0!=e&&isFinite(e)?m(e):t}var Ye={},Se={};function v(e,n){var t,s,i=n;for("string"==typeof e&&(e=[e]),w(n)&&(i=function(e,t){t[n]=M(e)}),s=e.length,t=0;t<s;t++)Se[e[t]]=i}function Oe(e,i){v(e,function(e,t,n,s){n._w=n._w||{},i(e,n._w,n,s)})}function be(e){return e%4==0&&e%100!=0||e%400==0}var D=0,Y=1,S=2,O=3,b=4,T=5,Te=6,xe=7,Ne=8;function We(e){return be(e)?366:365}s("Y",0,0,function(){var e=this.year();return e<=9999?r(e,4):"+"+e}),s(0,["YY",2],0,function(){return this.year()%100}),s(0,["YYYY",4],0,"year"),s(0,["YYYYY",5],0,"year"),s(0,["YYYYYY",6,!0],0,"year"),h("Y",ke),h("YY",n,t),h("YYYY",ge,ce),h("YYYYY",we,fe),h("YYYYYY",we,fe),v(["YYYYY","YYYYYY"],D),v("YYYY",function(e,t){t[D]=2===e.length?_.parseTwoDigitYear(e):M(e)}),v("YY",function(e,t){t[D]=_.parseTwoDigitYear(e)}),v("Y",function(e,t){t[D]=parseInt(e,10)}),_.parseTwoDigitYear=function(e){return M(e)+(68<M(e)?1900:2e3)};var x,Pe=Re("FullYear",!0);function Re(t,n){return function(e){return null!=e?(Ue(this,t,e),_.updateOffset(this,n),this):Ce(this,t)}}function Ce(e,t){if(!e.isValid())return NaN;var n=e._d,s=e._isUTC;switch(t){case"Milliseconds":return s?n.getUTCMilliseconds():n.getMilliseconds();case"Seconds":return s?n.getUTCSeconds():n.getSeconds();case"Minutes":return s?n.getUTCMinutes():n.getMinutes();case"Hours":return s?n.getUTCHours():n.getHours();case"Date":return s?n.getUTCDate():n.getDate();case"Day":return s?n.getUTCDay():n.getDay();case"Month":return s?n.getUTCMonth():n.getMonth();case"FullYear":return s?n.getUTCFullYear():n.getFullYear();default:return NaN}}function Ue(e,t,n){var s,i,r;if(e.isValid()&&!isNaN(n)){switch(s=e._d,i=e._isUTC,t){case"Milliseconds":return i?s.setUTCMilliseconds(n):s.setMilliseconds(n);case"Seconds":return i?s.setUTCSeconds(n):s.setSeconds(n);case"Minutes":return i?s.setUTCMinutes(n):s.setMinutes(n);case"Hours":return i?s.setUTCHours(n):s.setHours(n);case"Date":return i?s.setUTCDate(n):s.setDate(n);case"FullYear":break;default:return}t=n,r=e.month(),e=29!==(e=e.date())||1!==r||be(t)?e:28,i?s.setUTCFullYear(t,r,e):s.setFullYear(t,r,e)}}function He(e,t){var n;return isNaN(e)||isNaN(t)?NaN:(n=(t%(n=12)+n)%n,e+=(t-n)/12,1==n?be(e)?29:28:31-n%7%2)}x=Array.prototype.indexOf||function(e){for(var t=0;t<this.length;++t)if(this[t]===e)return t;return-1},s("M",["MM",2],"Mo",function(){return this.month()+1}),s("MMM",0,0,function(e){return this.localeData().monthsShort(this,e)}),s("MMMM",0,0,function(e){return this.localeData().months(this,e)}),h("M",n,u),h("MM",n,t),h("MMM",function(e,t){return t.monthsShortRegex(e)}),h("MMMM",function(e,t){return t.monthsRegex(e)}),v(["M","MM"],function(e,t){t[Y]=M(e)-1}),v(["MMM","MMMM"],function(e,t,n,s){s=n._locale.monthsParse(e,s,n._strict);null!=s?t[Y]=s:p(n).invalidMonth=e});var Fe="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),Le="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),Ve=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,Ge=i,Ee=i;function Ae(e,t){if(e.isValid()){if("string"==typeof t)if(/^\d+$/.test(t))t=M(t);else if(!w(t=e.localeData().monthsParse(t)))return;var n=(n=e.date())<29?n:Math.min(n,He(e.year(),t));e._isUTC?e._d.setUTCMonth(t,n):e._d.setMonth(t,n)}}function Ie(e){return null!=e?(Ae(this,e),_.updateOffset(this,!0),this):Ce(this,"Month")}function je(){function e(e,t){return t.length-e.length}for(var t,n,s=[],i=[],r=[],a=0;a<12;a++)n=l([2e3,a]),t=f(this.monthsShort(n,"")),n=f(this.months(n,"")),s.push(t),i.push(n),r.push(n),r.push(t);s.sort(e),i.sort(e),r.sort(e),this._monthsRegex=new RegExp("^("+r.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+i.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+s.join("|")+")","i")}function Ze(e,t,n,s,i,r,a){var o;return e<100&&0<=e?(o=new Date(e+400,t,n,s,i,r,a),isFinite(o.getFullYear())&&o.setFullYear(e)):o=new Date(e,t,n,s,i,r,a),o}function ze(e){var t;return e<100&&0<=e?((t=Array.prototype.slice.call(arguments))[0]=e+400,t=new Date(Date.UTC.apply(null,t)),isFinite(t.getUTCFullYear())&&t.setUTCFullYear(e)):t=new Date(Date.UTC.apply(null,arguments)),t}function qe(e,t,n){n=7+t-n;return n-(7+ze(e,0,n).getUTCDay()-t)%7-1}function $e(e,t,n,s,i){var r,t=1+7*(t-1)+(7+n-s)%7+qe(e,s,i),n=t<=0?We(r=e-1)+t:t>We(e)?(r=e+1,t-We(e)):(r=e,t);return{year:r,dayOfYear:n}}function Be(e,t,n){var s,i,r=qe(e.year(),t,n),r=Math.floor((e.dayOfYear()-r-1)/7)+1;return r<1?s=r+N(i=e.year()-1,t,n):r>N(e.year(),t,n)?(s=r-N(e.year(),t,n),i=e.year()+1):(i=e.year(),s=r),{week:s,year:i}}function N(e,t,n){var s=qe(e,t,n),t=qe(e+1,t,n);return(We(e)-s+t)/7}s("w",["ww",2],"wo","week"),s("W",["WW",2],"Wo","isoWeek"),h("w",n,u),h("ww",n,t),h("W",n,u),h("WW",n,t),Oe(["w","ww","W","WW"],function(e,t,n,s){t[s.substr(0,1)]=M(e)});function Je(e,t){return e.slice(t,7).concat(e.slice(0,t))}s("d",0,"do","day"),s("dd",0,0,function(e){return this.localeData().weekdaysMin(this,e)}),s("ddd",0,0,function(e){return this.localeData().weekdaysShort(this,e)}),s("dddd",0,0,function(e){return this.localeData().weekdays(this,e)}),s("e",0,0,"weekday"),s("E",0,0,"isoWeekday"),h("d",n),h("e",n),h("E",n),h("dd",function(e,t){return t.weekdaysMinRegex(e)}),h("ddd",function(e,t){return t.weekdaysShortRegex(e)}),h("dddd",function(e,t){return t.weekdaysRegex(e)}),Oe(["dd","ddd","dddd"],function(e,t,n,s){s=n._locale.weekdaysParse(e,s,n._strict);null!=s?t.d=s:p(n).invalidWeekday=e}),Oe(["d","e","E"],function(e,t,n,s){t[s]=M(e)});var Qe="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),Xe="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),Ke="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),et=i,tt=i,nt=i;function st(){function e(e,t){return t.length-e.length}for(var t,n,s,i=[],r=[],a=[],o=[],u=0;u<7;u++)s=l([2e3,1]).day(u),t=f(this.weekdaysMin(s,"")),n=f(this.weekdaysShort(s,"")),s=f(this.weekdays(s,"")),i.push(t),r.push(n),a.push(s),o.push(t),o.push(n),o.push(s);i.sort(e),r.sort(e),a.sort(e),o.sort(e),this._weekdaysRegex=new RegExp("^("+o.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+a.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+r.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+i.join("|")+")","i")}function it(){return this.hours()%12||12}function rt(e,t){s(e,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),t)})}function at(e,t){return t._meridiemParse}s("H",["HH",2],0,"hour"),s("h",["hh",2],0,it),s("k",["kk",2],0,function(){return this.hours()||24}),s("hmm",0,0,function(){return""+it.apply(this)+r(this.minutes(),2)}),s("hmmss",0,0,function(){return""+it.apply(this)+r(this.minutes(),2)+r(this.seconds(),2)}),s("Hmm",0,0,function(){return""+this.hours()+r(this.minutes(),2)}),s("Hmmss",0,0,function(){return""+this.hours()+r(this.minutes(),2)+r(this.seconds(),2)}),rt("a",!0),rt("A",!1),h("a",at),h("A",at),h("H",n,d),h("h",n,u),h("k",n,u),h("HH",n,t),h("hh",n,t),h("kk",n,t),h("hmm",me),h("hmmss",_e),h("Hmm",me),h("Hmmss",_e),v(["H","HH"],O),v(["k","kk"],function(e,t,n){e=M(e);t[O]=24===e?0:e}),v(["a","A"],function(e,t,n){n._isPm=n._locale.isPM(e),n._meridiem=e}),v(["h","hh"],function(e,t,n){t[O]=M(e),p(n).bigHour=!0}),v("hmm",function(e,t,n){var s=e.length-2;t[O]=M(e.substr(0,s)),t[b]=M(e.substr(s)),p(n).bigHour=!0}),v("hmmss",function(e,t,n){var s=e.length-4,i=e.length-2;t[O]=M(e.substr(0,s)),t[b]=M(e.substr(s,2)),t[T]=M(e.substr(i)),p(n).bigHour=!0}),v("Hmm",function(e,t,n){var s=e.length-2;t[O]=M(e.substr(0,s)),t[b]=M(e.substr(s))}),v("Hmmss",function(e,t,n){var s=e.length-4,i=e.length-2;t[O]=M(e.substr(0,s)),t[b]=M(e.substr(s,2)),t[T]=M(e.substr(i))});i=Re("Hours",!0);var ot,ut={calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},longDateFormat:{LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},invalidDate:"Invalid date",ordinal:"%d",dayOfMonthOrdinalParse:/\d{1,2}/,relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",w:"a week",ww:"%d weeks",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},months:Fe,monthsShort:Le,week:{dow:0,doy:6},weekdays:Qe,weekdaysMin:Ke,weekdaysShort:Xe,meridiemParse:/[ap]\.?m?\.?/i},W={},lt={};function dt(e){return e&&e.toLowerCase().replace("_","-")}function ht(e){for(var t,n,s,i,r=0;r<e.length;){for(t=(i=dt(e[r]).split("-")).length,n=(n=dt(e[r+1]))?n.split("-"):null;0<t;){if(s=ct(i.slice(0,t).join("-")))return s;if(n&&n.length>=t&&function(e,t){for(var n=Math.min(e.length,t.length),s=0;s<n;s+=1)if(e[s]!==t[s])return s;return n}(i,n)>=t-1)break;t--}r++}return ot}function ct(t){var e,n;if(void 0===W[t]&&"undefined"!=typeof module&&module&&module.exports&&(n=t)&&n.match("^[^/\\\\]*$"))try{e=ot._abbr,require("./locale/"+t),ft(e)}catch(e){W[t]=null}return W[t]}function ft(e,t){return e&&((t=g(t)?P(e):mt(e,t))?ot=t:"undefined"!=typeof console&&console.warn&&console.warn("Locale "+e+" not found. Did you forget to load it?")),ot._abbr}function mt(e,t){if(null===t)return delete W[e],null;var n,s=ut;if(t.abbr=e,null!=W[e])Q("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),s=W[e]._config;else if(null!=t.parentLocale)if(null!=W[t.parentLocale])s=W[t.parentLocale]._config;else{if(null==(n=ct(t.parentLocale)))return lt[t.parentLocale]||(lt[t.parentLocale]=[]),lt[t.parentLocale].push({name:e,config:t}),null;s=n._config}return W[e]=new K(X(s,t)),lt[e]&&lt[e].forEach(function(e){mt(e.name,e.config)}),ft(e),W[e]}function P(e){var t;if(!(e=e&&e._locale&&e._locale._abbr?e._locale._abbr:e))return ot;if(!y(e)){if(t=ct(e))return t;e=[e]}return ht(e)}function _t(e){var t=e._a;return t&&-2===p(e).overflow&&(t=t[Y]<0||11<t[Y]?Y:t[S]<1||t[S]>He(t[D],t[Y])?S:t[O]<0||24<t[O]||24===t[O]&&(0!==t[b]||0!==t[T]||0!==t[Te])?O:t[b]<0||59<t[b]?b:t[T]<0||59<t[T]?T:t[Te]<0||999<t[Te]?Te:-1,p(e)._overflowDayOfYear&&(t<D||S<t)&&(t=S),p(e)._overflowWeeks&&-1===t&&(t=xe),p(e)._overflowWeekday&&-1===t&&(t=Ne),p(e).overflow=t),e}var yt=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,gt=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,wt=/Z|[+-]\d\d(?::?\d\d)?/,pt=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/],["YYYYMM",/\d{6}/,!1],["YYYY",/\d{4}/,!1]],kt=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Mt=/^\/?Date\((-?\d+)/i,vt=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,Dt={UT:0,GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function Yt(e){var t,n,s,i,r,a,o=e._i,u=yt.exec(o)||gt.exec(o),o=pt.length,l=kt.length;if(u){for(p(e).iso=!0,t=0,n=o;t<n;t++)if(pt[t][1].exec(u[1])){i=pt[t][0],s=!1!==pt[t][2];break}if(null==i)e._isValid=!1;else{if(u[3]){for(t=0,n=l;t<n;t++)if(kt[t][1].exec(u[3])){r=(u[2]||" ")+kt[t][0];break}if(null==r)return void(e._isValid=!1)}if(s||null==r){if(u[4]){if(!wt.exec(u[4]))return void(e._isValid=!1);a="Z"}e._f=i+(r||"")+(a||""),xt(e)}else e._isValid=!1}}else e._isValid=!1}function St(e,t,n,s,i,r){e=[function(e){e=parseInt(e,10);{if(e<=49)return 2e3+e;if(e<=999)return 1900+e}return e}(e),Le.indexOf(t),parseInt(n,10),parseInt(s,10),parseInt(i,10)];return r&&e.push(parseInt(r,10)),e}function Ot(e){var t,n,s=vt.exec(e._i.replace(/\([^()]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").replace(/^\s\s*/,"").replace(/\s\s*$/,""));s?(t=St(s[4],s[3],s[2],s[5],s[6],s[7]),function(e,t,n){if(!e||Xe.indexOf(e)===new Date(t[0],t[1],t[2]).getDay())return 1;p(n).weekdayMismatch=!0,n._isValid=!1}(s[1],t,e)&&(e._a=t,e._tzm=(t=s[8],n=s[9],s=s[10],t?Dt[t]:n?0:60*(((t=parseInt(s,10))-(n=t%100))/100)+n),e._d=ze.apply(null,e._a),e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),p(e).rfc2822=!0)):e._isValid=!1}function bt(e,t,n){return null!=e?e:null!=t?t:n}function Tt(e){var t,n,s,i,r,a,o,u,l,d,h,c=[];if(!e._d){for(s=e,i=new Date(_.now()),n=s._useUTC?[i.getUTCFullYear(),i.getUTCMonth(),i.getUTCDate()]:[i.getFullYear(),i.getMonth(),i.getDate()],e._w&&null==e._a[S]&&null==e._a[Y]&&(null!=(i=(s=e)._w).GG||null!=i.W||null!=i.E?(u=1,l=4,r=bt(i.GG,s._a[D],Be(R(),1,4).year),a=bt(i.W,1),((o=bt(i.E,1))<1||7<o)&&(d=!0)):(u=s._locale._week.dow,l=s._locale._week.doy,h=Be(R(),u,l),r=bt(i.gg,s._a[D],h.year),a=bt(i.w,h.week),null!=i.d?((o=i.d)<0||6<o)&&(d=!0):null!=i.e?(o=i.e+u,(i.e<0||6<i.e)&&(d=!0)):o=u),a<1||a>N(r,u,l)?p(s)._overflowWeeks=!0:null!=d?p(s)._overflowWeekday=!0:(h=$e(r,a,o,u,l),s._a[D]=h.year,s._dayOfYear=h.dayOfYear)),null!=e._dayOfYear&&(i=bt(e._a[D],n[D]),(e._dayOfYear>We(i)||0===e._dayOfYear)&&(p(e)._overflowDayOfYear=!0),d=ze(i,0,e._dayOfYear),e._a[Y]=d.getUTCMonth(),e._a[S]=d.getUTCDate()),t=0;t<3&&null==e._a[t];++t)e._a[t]=c[t]=n[t];for(;t<7;t++)e._a[t]=c[t]=null==e._a[t]?2===t?1:0:e._a[t];24===e._a[O]&&0===e._a[b]&&0===e._a[T]&&0===e._a[Te]&&(e._nextDay=!0,e._a[O]=0),e._d=(e._useUTC?ze:Ze).apply(null,c),r=e._useUTC?e._d.getUTCDay():e._d.getDay(),null!=e._tzm&&e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),e._nextDay&&(e._a[O]=24),e._w&&void 0!==e._w.d&&e._w.d!==r&&(p(e).weekdayMismatch=!0)}}function xt(e){if(e._f===_.ISO_8601)Yt(e);else if(e._f===_.RFC_2822)Ot(e);else{e._a=[],p(e).empty=!0;for(var t,n,s,i,r,a=""+e._i,o=a.length,u=0,l=ae(e._f,e._locale).match(te)||[],d=l.length,h=0;h<d;h++)n=l[h],(t=(a.match(De(n,e))||[])[0])&&(0<(s=a.substr(0,a.indexOf(t))).length&&p(e).unusedInput.push(s),a=a.slice(a.indexOf(t)+t.length),u+=t.length),ie[n]?(t?p(e).empty=!1:p(e).unusedTokens.push(n),s=n,r=e,null!=(i=t)&&c(Se,s)&&Se[s](i,r._a,r,s)):e._strict&&!t&&p(e).unusedTokens.push(n);p(e).charsLeftOver=o-u,0<a.length&&p(e).unusedInput.push(a),e._a[O]<=12&&!0===p(e).bigHour&&0<e._a[O]&&(p(e).bigHour=void 0),p(e).parsedDateParts=e._a.slice(0),p(e).meridiem=e._meridiem,e._a[O]=function(e,t,n){if(null==n)return t;return null!=e.meridiemHour?e.meridiemHour(t,n):null!=e.isPM?((e=e.isPM(n))&&t<12&&(t+=12),t=e||12!==t?t:0):t}(e._locale,e._a[O],e._meridiem),null!==(o=p(e).era)&&(e._a[D]=e._locale.erasConvertYear(o,e._a[D])),Tt(e),_t(e)}}function Nt(e){var t,n,s,i=e._i,r=e._f;if(e._locale=e._locale||P(e._l),null===i||void 0===r&&""===i)return I({nullInput:!0});if("string"==typeof i&&(e._i=i=e._locale.preparse(i)),k(i))return new $(_t(i));if(V(i))e._d=i;else if(y(r)){var a,o,u,l,d,h,c=e,f=!1,m=c._f.length;if(0===m)p(c).invalidFormat=!0,c._d=new Date(NaN);else{for(l=0;l<m;l++)d=0,h=!1,a=q({},c),null!=c._useUTC&&(a._useUTC=c._useUTC),a._f=c._f[l],xt(a),A(a)&&(h=!0),d=(d+=p(a).charsLeftOver)+10*p(a).unusedTokens.length,p(a).score=d,f?d<u&&(u=d,o=a):(null==u||d<u||h)&&(u=d,o=a,h)&&(f=!0);E(c,o||a)}}else if(r)xt(e);else if(g(r=(i=e)._i))i._d=new Date(_.now());else V(r)?i._d=new Date(r.valueOf()):"string"==typeof r?(n=i,null!==(t=Mt.exec(n._i))?n._d=new Date(+t[1]):(Yt(n),!1===n._isValid&&(delete n._isValid,Ot(n),!1===n._isValid)&&(delete n._isValid,n._strict?n._isValid=!1:_.createFromInputFallback(n)))):y(r)?(i._a=G(r.slice(0),function(e){return parseInt(e,10)}),Tt(i)):F(r)?(t=i)._d||(s=void 0===(n=ue(t._i)).day?n.date:n.day,t._a=G([n.year,n.month,s,n.hour,n.minute,n.second,n.millisecond],function(e){return e&&parseInt(e,10)}),Tt(t)):w(r)?i._d=new Date(r):_.createFromInputFallback(i);return A(e)||(e._d=null),e}function Wt(e,t,n,s,i){var r={};return!0!==t&&!1!==t||(s=t,t=void 0),!0!==n&&!1!==n||(s=n,n=void 0),(F(e)&&L(e)||y(e)&&0===e.length)&&(e=void 0),r._isAMomentObject=!0,r._useUTC=r._isUTC=i,r._l=n,r._i=e,r._f=t,r._strict=s,(i=new $(_t(Nt(i=r))))._nextDay&&(i.add(1,"d"),i._nextDay=void 0),i}function R(e,t,n,s){return Wt(e,t,n,s,!1)}_.createFromInputFallback=e("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(e){e._d=new Date(e._i+(e._useUTC?" UTC":""))}),_.ISO_8601=function(){},_.RFC_2822=function(){};me=e("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var e=R.apply(null,arguments);return this.isValid()&&e.isValid()?e<this?this:e:I()}),_e=e("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var e=R.apply(null,arguments);return this.isValid()&&e.isValid()?this<e?this:e:I()});function Pt(e,t){var n,s;if(!(t=1===t.length&&y(t[0])?t[0]:t).length)return R();for(n=t[0],s=1;s<t.length;++s)t[s].isValid()&&!t[s][e](n)||(n=t[s]);return n}var Rt=["year","quarter","month","week","day","hour","minute","second","millisecond"];function Ct(e){var e=ue(e),t=e.year||0,n=e.quarter||0,s=e.month||0,i=e.week||e.isoWeek||0,r=e.day||0,a=e.hour||0,o=e.minute||0,u=e.second||0,l=e.millisecond||0;this._isValid=function(e){var t,n,s=!1,i=Rt.length;for(t in e)if(c(e,t)&&(-1===x.call(Rt,t)||null!=e[t]&&isNaN(e[t])))return!1;for(n=0;n<i;++n)if(e[Rt[n]]){if(s)return!1;parseFloat(e[Rt[n]])!==M(e[Rt[n]])&&(s=!0)}return!0}(e),this._milliseconds=+l+1e3*u+6e4*o+1e3*a*60*60,this._days=+r+7*i,this._months=+s+3*n+12*t,this._data={},this._locale=P(),this._bubble()}function Ut(e){return e instanceof Ct}function Ht(e){return e<0?-1*Math.round(-1*e):Math.round(e)}function Ft(e,n){s(e,0,0,function(){var e=this.utcOffset(),t="+";return e<0&&(e=-e,t="-"),t+r(~~(e/60),2)+n+r(~~e%60,2)})}Ft("Z",":"),Ft("ZZ",""),h("Z",ve),h("ZZ",ve),v(["Z","ZZ"],function(e,t,n){n._useUTC=!0,n._tzm=Vt(ve,e)});var Lt=/([\+\-]|\d\d)/gi;function Vt(e,t){var t=(t||"").match(e);return null===t?null:0===(t=60*(e=((t[t.length-1]||[])+"").match(Lt)||["-",0,0])[1]+M(e[2]))?0:"+"===e[0]?t:-t}function Gt(e,t){var n;return t._isUTC?(t=t.clone(),n=(k(e)||V(e)?e:R(e)).valueOf()-t.valueOf(),t._d.setTime(t._d.valueOf()+n),_.updateOffset(t,!1),t):R(e).local()}function Et(e){return-Math.round(e._d.getTimezoneOffset())}function At(){return!!this.isValid()&&this._isUTC&&0===this._offset}_.updateOffset=function(){};var It=/^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,jt=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;function C(e,t){var n,s=e;return Ut(e)?s={ms:e._milliseconds,d:e._days,M:e._months}:w(e)||!isNaN(+e)?(s={},t?s[t]=+e:s.milliseconds=+e):(t=It.exec(e))?(n="-"===t[1]?-1:1,s={y:0,d:M(t[S])*n,h:M(t[O])*n,m:M(t[b])*n,s:M(t[T])*n,ms:M(Ht(1e3*t[Te]))*n}):(t=jt.exec(e))?(n="-"===t[1]?-1:1,s={y:Zt(t[2],n),M:Zt(t[3],n),w:Zt(t[4],n),d:Zt(t[5],n),h:Zt(t[6],n),m:Zt(t[7],n),s:Zt(t[8],n)}):null==s?s={}:"object"==typeof s&&("from"in s||"to"in s)&&(t=function(e,t){var n;if(!e.isValid()||!t.isValid())return{milliseconds:0,months:0};t=Gt(t,e),e.isBefore(t)?n=zt(e,t):((n=zt(t,e)).milliseconds=-n.milliseconds,n.months=-n.months);return n}(R(s.from),R(s.to)),(s={}).ms=t.milliseconds,s.M=t.months),n=new Ct(s),Ut(e)&&c(e,"_locale")&&(n._locale=e._locale),Ut(e)&&c(e,"_isValid")&&(n._isValid=e._isValid),n}function Zt(e,t){e=e&&parseFloat(e.replace(",","."));return(isNaN(e)?0:e)*t}function zt(e,t){var n={};return n.months=t.month()-e.month()+12*(t.year()-e.year()),e.clone().add(n.months,"M").isAfter(t)&&--n.months,n.milliseconds=+t-+e.clone().add(n.months,"M"),n}function qt(s,i){return function(e,t){var n;return null===t||isNaN(+t)||(Q(i,"moment()."+i+"(period, number) is deprecated. Please use moment()."+i+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),n=e,e=t,t=n),$t(this,C(e,t),s),this}}function $t(e,t,n,s){var i=t._milliseconds,r=Ht(t._days),t=Ht(t._months);e.isValid()&&(s=null==s||s,t&&Ae(e,Ce(e,"Month")+t*n),r&&Ue(e,"Date",Ce(e,"Date")+r*n),i&&e._d.setTime(e._d.valueOf()+i*n),s)&&_.updateOffset(e,r||t)}C.fn=Ct.prototype,C.invalid=function(){return C(NaN)};Fe=qt(1,"add"),Qe=qt(-1,"subtract");function Bt(e){return"string"==typeof e||e instanceof String}function Jt(e){return k(e)||V(e)||Bt(e)||w(e)||function(t){var e=y(t),n=!1;e&&(n=0===t.filter(function(e){return!w(e)&&Bt(t)}).length);return e&&n}(e)||function(e){var t,n,s=F(e)&&!L(e),i=!1,r=["years","year","y","months","month","M","days","day","d","dates","date","D","hours","hour","h","minutes","minute","m","seconds","second","s","milliseconds","millisecond","ms"],a=r.length;for(t=0;t<a;t+=1)n=r[t],i=i||c(e,n);return s&&i}(e)||null==e}function Qt(e,t){var n,s;return e.date()<t.date()?-Qt(t,e):-((n=12*(t.year()-e.year())+(t.month()-e.month()))+(t-(s=e.clone().add(n,"months"))<0?(t-s)/(s-e.clone().add(n-1,"months")):(t-s)/(e.clone().add(1+n,"months")-s)))||0}function Xt(e){return void 0===e?this._locale._abbr:(null!=(e=P(e))&&(this._locale=e),this)}_.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",_.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";Ke=e("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(e){return void 0===e?this.localeData():this.locale(e)});function Kt(){return this._locale}var en=126227808e5;function tn(e,t){return(e%t+t)%t}function nn(e,t,n){return e<100&&0<=e?new Date(e+400,t,n)-en:new Date(e,t,n).valueOf()}function sn(e,t,n){return e<100&&0<=e?Date.UTC(e+400,t,n)-en:Date.UTC(e,t,n)}function rn(e,t){return t.erasAbbrRegex(e)}function an(){for(var e,t,n,s=[],i=[],r=[],a=[],o=this.eras(),u=0,l=o.length;u<l;++u)e=f(o[u].name),t=f(o[u].abbr),n=f(o[u].narrow),i.push(e),s.push(t),r.push(n),a.push(e),a.push(t),a.push(n);this._erasRegex=new RegExp("^("+a.join("|")+")","i"),this._erasNameRegex=new RegExp("^("+i.join("|")+")","i"),this._erasAbbrRegex=new RegExp("^("+s.join("|")+")","i"),this._erasNarrowRegex=new RegExp("^("+r.join("|")+")","i")}function on(e,t){s(0,[e,e.length],0,t)}function un(e,t,n,s,i){var r;return null==e?Be(this,s,i).year:(r=N(e,s,i),function(e,t,n,s,i){e=$e(e,t,n,s,i),t=ze(e.year,0,e.dayOfYear);return this.year(t.getUTCFullYear()),this.month(t.getUTCMonth()),this.date(t.getUTCDate()),this}.call(this,e,t=r<t?r:t,n,s,i))}s("N",0,0,"eraAbbr"),s("NN",0,0,"eraAbbr"),s("NNN",0,0,"eraAbbr"),s("NNNN",0,0,"eraName"),s("NNNNN",0,0,"eraNarrow"),s("y",["y",1],"yo","eraYear"),s("y",["yy",2],0,"eraYear"),s("y",["yyy",3],0,"eraYear"),s("y",["yyyy",4],0,"eraYear"),h("N",rn),h("NN",rn),h("NNN",rn),h("NNNN",function(e,t){return t.erasNameRegex(e)}),h("NNNNN",function(e,t){return t.erasNarrowRegex(e)}),v(["N","NN","NNN","NNNN","NNNNN"],function(e,t,n,s){s=n._locale.erasParse(e,s,n._strict);s?p(n).era=s:p(n).invalidEra=e}),h("y",pe),h("yy",pe),h("yyy",pe),h("yyyy",pe),h("yo",function(e,t){return t._eraYearOrdinalRegex||pe}),v(["y","yy","yyy","yyyy"],D),v(["yo"],function(e,t,n,s){var i;n._locale._eraYearOrdinalRegex&&(i=e.match(n._locale._eraYearOrdinalRegex)),n._locale.eraYearOrdinalParse?t[D]=n._locale.eraYearOrdinalParse(e,i):t[D]=parseInt(e,10)}),s(0,["gg",2],0,function(){return this.weekYear()%100}),s(0,["GG",2],0,function(){return this.isoWeekYear()%100}),on("gggg","weekYear"),on("ggggg","weekYear"),on("GGGG","isoWeekYear"),on("GGGGG","isoWeekYear"),h("G",ke),h("g",ke),h("GG",n,t),h("gg",n,t),h("GGGG",ge,ce),h("gggg",ge,ce),h("GGGGG",we,fe),h("ggggg",we,fe),Oe(["gggg","ggggg","GGGG","GGGGG"],function(e,t,n,s){t[s.substr(0,2)]=M(e)}),Oe(["gg","GG"],function(e,t,n,s){t[s]=_.parseTwoDigitYear(e)}),s("Q",0,"Qo","quarter"),h("Q",de),v("Q",function(e,t){t[Y]=3*(M(e)-1)}),s("D",["DD",2],"Do","date"),h("D",n,u),h("DD",n,t),h("Do",function(e,t){return e?t._dayOfMonthOrdinalParse||t._ordinalParse:t._dayOfMonthOrdinalParseLenient}),v(["D","DD"],S),v("Do",function(e,t){t[S]=M(e.match(n)[0])});ge=Re("Date",!0);s("DDD",["DDDD",3],"DDDo","dayOfYear"),h("DDD",ye),h("DDDD",he),v(["DDD","DDDD"],function(e,t,n){n._dayOfYear=M(e)}),s("m",["mm",2],0,"minute"),h("m",n,d),h("mm",n,t),v(["m","mm"],b);var ln,ce=Re("Minutes",!1),we=(s("s",["ss",2],0,"second"),h("s",n,d),h("ss",n,t),v(["s","ss"],T),Re("Seconds",!1));for(s("S",0,0,function(){return~~(this.millisecond()/100)}),s(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),s(0,["SSS",3],0,"millisecond"),s(0,["SSSS",4],0,function(){return 10*this.millisecond()}),s(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),s(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),s(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),s(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),s(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),h("S",ye,de),h("SS",ye,t),h("SSS",ye,he),ln="SSSS";ln.length<=9;ln+="S")h(ln,pe);function dn(e,t){t[Te]=M(1e3*("0."+e))}for(ln="S";ln.length<=9;ln+="S")v(ln,dn);fe=Re("Milliseconds",!1),s("z",0,0,"zoneAbbr"),s("zz",0,0,"zoneName");u=$.prototype;function hn(e){return e}u.add=Fe,u.calendar=function(e,t){1===arguments.length&&(arguments[0]?Jt(arguments[0])?(e=arguments[0],t=void 0):function(e){for(var t=F(e)&&!L(e),n=!1,s=["sameDay","nextDay","lastDay","nextWeek","lastWeek","sameElse"],i=0;i<s.length;i+=1)n=n||c(e,s[i]);return t&&n}(arguments[0])&&(t=arguments[0],e=void 0):t=e=void 0);var e=e||R(),n=Gt(e,this).startOf("day"),n=_.calendarFormat(this,n)||"sameElse",t=t&&(a(t[n])?t[n].call(this,e):t[n]);return this.format(t||this.localeData().calendar(n,this,R(e)))},u.clone=function(){return new $(this)},u.diff=function(e,t,n){var s,i,r;if(!this.isValid())return NaN;if(!(s=Gt(e,this)).isValid())return NaN;switch(i=6e4*(s.utcOffset()-this.utcOffset()),t=o(t)){case"year":r=Qt(this,s)/12;break;case"month":r=Qt(this,s);break;case"quarter":r=Qt(this,s)/3;break;case"second":r=(this-s)/1e3;break;case"minute":r=(this-s)/6e4;break;case"hour":r=(this-s)/36e5;break;case"day":r=(this-s-i)/864e5;break;case"week":r=(this-s-i)/6048e5;break;default:r=this-s}return n?r:m(r)},u.endOf=function(e){var t,n;if(void 0!==(e=o(e))&&"millisecond"!==e&&this.isValid()){switch(n=this._isUTC?sn:nn,e){case"year":t=n(this.year()+1,0,1)-1;break;case"quarter":t=n(this.year(),this.month()-this.month()%3+3,1)-1;break;case"month":t=n(this.year(),this.month()+1,1)-1;break;case"week":t=n(this.year(),this.month(),this.date()-this.weekday()+7)-1;break;case"isoWeek":t=n(this.year(),this.month(),this.date()-(this.isoWeekday()-1)+7)-1;break;case"day":case"date":t=n(this.year(),this.month(),this.date()+1)-1;break;case"hour":t=this._d.valueOf(),t+=36e5-tn(t+(this._isUTC?0:6e4*this.utcOffset()),36e5)-1;break;case"minute":t=this._d.valueOf(),t+=6e4-tn(t,6e4)-1;break;case"second":t=this._d.valueOf(),t+=1e3-tn(t,1e3)-1;break}this._d.setTime(t),_.updateOffset(this,!0)}return this},u.format=function(e){return e=e||(this.isUtc()?_.defaultFormatUtc:_.defaultFormat),e=re(this,e),this.localeData().postformat(e)},u.from=function(e,t){return this.isValid()&&(k(e)&&e.isValid()||R(e).isValid())?C({to:this,from:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()},u.fromNow=function(e){return this.from(R(),e)},u.to=function(e,t){return this.isValid()&&(k(e)&&e.isValid()||R(e).isValid())?C({from:this,to:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()},u.toNow=function(e){return this.to(R(),e)},u.get=function(e){return a(this[e=o(e)])?this[e]():this},u.invalidAt=function(){return p(this).overflow},u.isAfter=function(e,t){return e=k(e)?e:R(e),!(!this.isValid()||!e.isValid())&&("millisecond"===(t=o(t)||"millisecond")?this.valueOf()>e.valueOf():e.valueOf()<this.clone().startOf(t).valueOf())},u.isBefore=function(e,t){return e=k(e)?e:R(e),!(!this.isValid()||!e.isValid())&&("millisecond"===(t=o(t)||"millisecond")?this.valueOf()<e.valueOf():this.clone().endOf(t).valueOf()<e.valueOf())},u.isBetween=function(e,t,n,s){return e=k(e)?e:R(e),t=k(t)?t:R(t),!!(this.isValid()&&e.isValid()&&t.isValid())&&("("===(s=s||"()")[0]?this.isAfter(e,n):!this.isBefore(e,n))&&(")"===s[1]?this.isBefore(t,n):!this.isAfter(t,n))},u.isSame=function(e,t){var e=k(e)?e:R(e);return!(!this.isValid()||!e.isValid())&&("millisecond"===(t=o(t)||"millisecond")?this.valueOf()===e.valueOf():(e=e.valueOf(),this.clone().startOf(t).valueOf()<=e&&e<=this.clone().endOf(t).valueOf()))},u.isSameOrAfter=function(e,t){return this.isSame(e,t)||this.isAfter(e,t)},u.isSameOrBefore=function(e,t){return this.isSame(e,t)||this.isBefore(e,t)},u.isValid=function(){return A(this)},u.lang=Ke,u.locale=Xt,u.localeData=Kt,u.max=_e,u.min=me,u.parsingFlags=function(){return E({},p(this))},u.set=function(e,t){if("object"==typeof e)for(var n=function(e){var t,n=[];for(t in e)c(e,t)&&n.push({unit:t,priority:le[t]});return n.sort(function(e,t){return e.priority-t.priority}),n}(e=ue(e)),s=n.length,i=0;i<s;i++)this[n[i].unit](e[n[i].unit]);else if(a(this[e=o(e)]))return this[e](t);return this},u.startOf=function(e){var t,n;if(void 0!==(e=o(e))&&"millisecond"!==e&&this.isValid()){switch(n=this._isUTC?sn:nn,e){case"year":t=n(this.year(),0,1);break;case"quarter":t=n(this.year(),this.month()-this.month()%3,1);break;case"month":t=n(this.year(),this.month(),1);break;case"week":t=n(this.year(),this.month(),this.date()-this.weekday());break;case"isoWeek":t=n(this.year(),this.month(),this.date()-(this.isoWeekday()-1));break;case"day":case"date":t=n(this.year(),this.month(),this.date());break;case"hour":t=this._d.valueOf(),t-=tn(t+(this._isUTC?0:6e4*this.utcOffset()),36e5);break;case"minute":t=this._d.valueOf(),t-=tn(t,6e4);break;case"second":t=this._d.valueOf(),t-=tn(t,1e3);break}this._d.setTime(t),_.updateOffset(this,!0)}return this},u.subtract=Qe,u.toArray=function(){var e=this;return[e.year(),e.month(),e.date(),e.hour(),e.minute(),e.second(),e.millisecond()]},u.toObject=function(){var e=this;return{years:e.year(),months:e.month(),date:e.date(),hours:e.hours(),minutes:e.minutes(),seconds:e.seconds(),milliseconds:e.milliseconds()}},u.toDate=function(){return new Date(this.valueOf())},u.toISOString=function(e){var t;return this.isValid()?(t=(e=!0!==e)?this.clone().utc():this).year()<0||9999<t.year()?re(t,e?"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"):a(Date.prototype.toISOString)?e?this.toDate().toISOString():new Date(this.valueOf()+60*this.utcOffset()*1e3).toISOString().replace("Z",re(t,"Z")):re(t,e?"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYY-MM-DD[T]HH:mm:ss.SSSZ"):null},u.inspect=function(){var e,t,n;return this.isValid()?(t="moment",e="",this.isLocal()||(t=0===this.utcOffset()?"moment.utc":"moment.parseZone",e="Z"),t="["+t+'("]',n=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",this.format(t+n+"-MM-DD[T]HH:mm:ss.SSS"+(e+'[")]'))):"moment.invalid(/* "+this._i+" */)"},"undefined"!=typeof Symbol&&null!=Symbol.for&&(u[Symbol.for("nodejs.util.inspect.custom")]=function(){return"Moment<"+this.format()+">"}),u.toJSON=function(){return this.isValid()?this.toISOString():null},u.toString=function(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},u.unix=function(){return Math.floor(this.valueOf()/1e3)},u.valueOf=function(){return this._d.valueOf()-6e4*(this._offset||0)},u.creationData=function(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}},u.eraName=function(){for(var e,t=this.localeData().eras(),n=0,s=t.length;n<s;++n){if(e=this.clone().startOf("day").valueOf(),t[n].since<=e&&e<=t[n].until)return t[n].name;if(t[n].until<=e&&e<=t[n].since)return t[n].name}return""},u.eraNarrow=function(){for(var e,t=this.localeData().eras(),n=0,s=t.length;n<s;++n){if(e=this.clone().startOf("day").valueOf(),t[n].since<=e&&e<=t[n].until)return t[n].narrow;if(t[n].until<=e&&e<=t[n].since)return t[n].narrow}return""},u.eraAbbr=function(){for(var e,t=this.localeData().eras(),n=0,s=t.length;n<s;++n){if(e=this.clone().startOf("day").valueOf(),t[n].since<=e&&e<=t[n].until)return t[n].abbr;if(t[n].until<=e&&e<=t[n].since)return t[n].abbr}return""},u.eraYear=function(){for(var e,t,n=this.localeData().eras(),s=0,i=n.length;s<i;++s)if(e=n[s].since<=n[s].until?1:-1,t=this.clone().startOf("day").valueOf(),n[s].since<=t&&t<=n[s].until||n[s].until<=t&&t<=n[s].since)return(this.year()-_(n[s].since).year())*e+n[s].offset;return this.year()},u.year=Pe,u.isLeapYear=function(){return be(this.year())},u.weekYear=function(e){return un.call(this,e,this.week(),this.weekday()+this.localeData()._week.dow,this.localeData()._week.dow,this.localeData()._week.doy)},u.isoWeekYear=function(e){return un.call(this,e,this.isoWeek(),this.isoWeekday(),1,4)},u.quarter=u.quarters=function(e){return null==e?Math.ceil((this.month()+1)/3):this.month(3*(e-1)+this.month()%3)},u.month=Ie,u.daysInMonth=function(){return He(this.year(),this.month())},u.week=u.weeks=function(e){var t=this.localeData().week(this);return null==e?t:this.add(7*(e-t),"d")},u.isoWeek=u.isoWeeks=function(e){var t=Be(this,1,4).week;return null==e?t:this.add(7*(e-t),"d")},u.weeksInYear=function(){var e=this.localeData()._week;return N(this.year(),e.dow,e.doy)},u.weeksInWeekYear=function(){var e=this.localeData()._week;return N(this.weekYear(),e.dow,e.doy)},u.isoWeeksInYear=function(){return N(this.year(),1,4)},u.isoWeeksInISOWeekYear=function(){return N(this.isoWeekYear(),1,4)},u.date=ge,u.day=u.days=function(e){var t,n,s;return this.isValid()?(t=Ce(this,"Day"),null!=e?(n=e,s=this.localeData(),e="string"!=typeof n?n:isNaN(n)?"number"==typeof(n=s.weekdaysParse(n))?n:null:parseInt(n,10),this.add(e-t,"d")):t):null!=e?this:NaN},u.weekday=function(e){var t;return this.isValid()?(t=(this.day()+7-this.localeData()._week.dow)%7,null==e?t:this.add(e-t,"d")):null!=e?this:NaN},u.isoWeekday=function(e){var t,n;return this.isValid()?null!=e?(t=e,n=this.localeData(),n="string"==typeof t?n.weekdaysParse(t)%7||7:isNaN(t)?null:t,this.day(this.day()%7?n:n-7)):this.day()||7:null!=e?this:NaN},u.dayOfYear=function(e){var t=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==e?t:this.add(e-t,"d")},u.hour=u.hours=i,u.minute=u.minutes=ce,u.second=u.seconds=we,u.millisecond=u.milliseconds=fe,u.utcOffset=function(e,t,n){var s,i=this._offset||0;if(!this.isValid())return null!=e?this:NaN;if(null==e)return this._isUTC?i:Et(this);if("string"==typeof e){if(null===(e=Vt(ve,e)))return this}else Math.abs(e)<16&&!n&&(e*=60);return!this._isUTC&&t&&(s=Et(this)),this._offset=e,this._isUTC=!0,null!=s&&this.add(s,"m"),i!==e&&(!t||this._changeInProgress?$t(this,C(e-i,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,_.updateOffset(this,!0),this._changeInProgress=null)),this},u.utc=function(e){return this.utcOffset(0,e)},u.local=function(e){return this._isUTC&&(this.utcOffset(0,e),this._isUTC=!1,e)&&this.subtract(Et(this),"m"),this},u.parseZone=function(){var e;return null!=this._tzm?this.utcOffset(this._tzm,!1,!0):"string"==typeof this._i&&(null!=(e=Vt(Me,this._i))?this.utcOffset(e):this.utcOffset(0,!0)),this},u.hasAlignedHourOffset=function(e){return!!this.isValid()&&(e=e?R(e).utcOffset():0,(this.utcOffset()-e)%60==0)},u.isDST=function(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()},u.isLocal=function(){return!!this.isValid()&&!this._isUTC},u.isUtcOffset=function(){return!!this.isValid()&&this._isUTC},u.isUtc=At,u.isUTC=At,u.zoneAbbr=function(){return this._isUTC?"UTC":""},u.zoneName=function(){return this._isUTC?"Coordinated Universal Time":""},u.dates=e("dates accessor is deprecated. Use date instead.",ge),u.months=e("months accessor is deprecated. Use month instead",Ie),u.years=e("years accessor is deprecated. Use year instead",Pe),u.zone=e("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",function(e,t){return null!=e?(this.utcOffset(e="string"!=typeof e?-e:e,t),this):-this.utcOffset()}),u.isDSTShifted=e("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",function(){var e,t;return g(this._isDSTShifted)&&(q(e={},this),(e=Nt(e))._a?(t=(e._isUTC?l:R)(e._a),this._isDSTShifted=this.isValid()&&0<function(e,t,n){for(var s=Math.min(e.length,t.length),i=Math.abs(e.length-t.length),r=0,a=0;a<s;a++)(n&&e[a]!==t[a]||!n&&M(e[a])!==M(t[a]))&&r++;return r+i}(e._a,t.toArray())):this._isDSTShifted=!1),this._isDSTShifted});d=K.prototype;function cn(e,t,n,s){var i=P(),s=l().set(s,t);return i[n](s,e)}function fn(e,t,n){if(w(e)&&(t=e,e=void 0),e=e||"",null!=t)return cn(e,t,n,"month");for(var s=[],i=0;i<12;i++)s[i]=cn(e,i,n,"month");return s}function mn(e,t,n,s){t=("boolean"==typeof e?w(t)&&(n=t,t=void 0):(t=e,e=!1,w(n=t)&&(n=t,t=void 0)),t||"");var i,r=P(),a=e?r._week.dow:0,o=[];if(null!=n)return cn(t,(n+a)%7,s,"day");for(i=0;i<7;i++)o[i]=cn(t,(i+a)%7,s,"day");return o}d.calendar=function(e,t,n){return a(e=this._calendar[e]||this._calendar.sameElse)?e.call(t,n):e},d.longDateFormat=function(e){var t=this._longDateFormat[e],n=this._longDateFormat[e.toUpperCase()];return t||!n?t:(this._longDateFormat[e]=n.match(te).map(function(e){return"MMMM"===e||"MM"===e||"DD"===e||"dddd"===e?e.slice(1):e}).join(""),this._longDateFormat[e])},d.invalidDate=function(){return this._invalidDate},d.ordinal=function(e){return this._ordinal.replace("%d",e)},d.preparse=hn,d.postformat=hn,d.relativeTime=function(e,t,n,s){var i=this._relativeTime[n];return a(i)?i(e,t,n,s):i.replace(/%d/i,e)},d.pastFuture=function(e,t){return a(e=this._relativeTime[0<e?"future":"past"])?e(t):e.replace(/%s/i,t)},d.set=function(e){var t,n;for(n in e)c(e,n)&&(a(t=e[n])?this[n]=t:this["_"+n]=t);this._config=e,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)},d.eras=function(e,t){for(var n,s=this._eras||P("en")._eras,i=0,r=s.length;i<r;++i){switch(typeof s[i].since){case"string":n=_(s[i].since).startOf("day"),s[i].since=n.valueOf();break}switch(typeof s[i].until){case"undefined":s[i].until=1/0;break;case"string":n=_(s[i].until).startOf("day").valueOf(),s[i].until=n.valueOf();break}}return s},d.erasParse=function(e,t,n){var s,i,r,a,o,u=this.eras();for(e=e.toUpperCase(),s=0,i=u.length;s<i;++s)if(r=u[s].name.toUpperCase(),a=u[s].abbr.toUpperCase(),o=u[s].narrow.toUpperCase(),n)switch(t){case"N":case"NN":case"NNN":if(a===e)return u[s];break;case"NNNN":if(r===e)return u[s];break;case"NNNNN":if(o===e)return u[s];break}else if(0<=[r,a,o].indexOf(e))return u[s]},d.erasConvertYear=function(e,t){var n=e.since<=e.until?1:-1;return void 0===t?_(e.since).year():_(e.since).year()+(t-e.offset)*n},d.erasAbbrRegex=function(e){return c(this,"_erasAbbrRegex")||an.call(this),e?this._erasAbbrRegex:this._erasRegex},d.erasNameRegex=function(e){return c(this,"_erasNameRegex")||an.call(this),e?this._erasNameRegex:this._erasRegex},d.erasNarrowRegex=function(e){return c(this,"_erasNarrowRegex")||an.call(this),e?this._erasNarrowRegex:this._erasRegex},d.months=function(e,t){return e?(y(this._months)?this._months:this._months[(this._months.isFormat||Ve).test(t)?"format":"standalone"])[e.month()]:y(this._months)?this._months:this._months.standalone},d.monthsShort=function(e,t){return e?(y(this._monthsShort)?this._monthsShort:this._monthsShort[Ve.test(t)?"format":"standalone"])[e.month()]:y(this._monthsShort)?this._monthsShort:this._monthsShort.standalone},d.monthsParse=function(e,t,n){var s,i;if(this._monthsParseExact)return function(e,t,n){var s,i,r,e=e.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],s=0;s<12;++s)r=l([2e3,s]),this._shortMonthsParse[s]=this.monthsShort(r,"").toLocaleLowerCase(),this._longMonthsParse[s]=this.months(r,"").toLocaleLowerCase();return n?"MMM"===t?-1!==(i=x.call(this._shortMonthsParse,e))?i:null:-1!==(i=x.call(this._longMonthsParse,e))?i:null:"MMM"===t?-1!==(i=x.call(this._shortMonthsParse,e))||-1!==(i=x.call(this._longMonthsParse,e))?i:null:-1!==(i=x.call(this._longMonthsParse,e))||-1!==(i=x.call(this._shortMonthsParse,e))?i:null}.call(this,e,t,n);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),s=0;s<12;s++){if(i=l([2e3,s]),n&&!this._longMonthsParse[s]&&(this._longMonthsParse[s]=new RegExp("^"+this.months(i,"").replace(".","")+"$","i"),this._shortMonthsParse[s]=new RegExp("^"+this.monthsShort(i,"").replace(".","")+"$","i")),n||this._monthsParse[s]||(i="^"+this.months(i,"")+"|^"+this.monthsShort(i,""),this._monthsParse[s]=new RegExp(i.replace(".",""),"i")),n&&"MMMM"===t&&this._longMonthsParse[s].test(e))return s;if(n&&"MMM"===t&&this._shortMonthsParse[s].test(e))return s;if(!n&&this._monthsParse[s].test(e))return s}},d.monthsRegex=function(e){return this._monthsParseExact?(c(this,"_monthsRegex")||je.call(this),e?this._monthsStrictRegex:this._monthsRegex):(c(this,"_monthsRegex")||(this._monthsRegex=Ee),this._monthsStrictRegex&&e?this._monthsStrictRegex:this._monthsRegex)},d.monthsShortRegex=function(e){return this._monthsParseExact?(c(this,"_monthsRegex")||je.call(this),e?this._monthsShortStrictRegex:this._monthsShortRegex):(c(this,"_monthsShortRegex")||(this._monthsShortRegex=Ge),this._monthsShortStrictRegex&&e?this._monthsShortStrictRegex:this._monthsShortRegex)},d.week=function(e){return Be(e,this._week.dow,this._week.doy).week},d.firstDayOfYear=function(){return this._week.doy},d.firstDayOfWeek=function(){return this._week.dow},d.weekdays=function(e,t){return t=y(this._weekdays)?this._weekdays:this._weekdays[e&&!0!==e&&this._weekdays.isFormat.test(t)?"format":"standalone"],!0===e?Je(t,this._week.dow):e?t[e.day()]:t},d.weekdaysMin=function(e){return!0===e?Je(this._weekdaysMin,this._week.dow):e?this._weekdaysMin[e.day()]:this._weekdaysMin},d.weekdaysShort=function(e){return!0===e?Je(this._weekdaysShort,this._week.dow):e?this._weekdaysShort[e.day()]:this._weekdaysShort},d.weekdaysParse=function(e,t,n){var s,i;if(this._weekdaysParseExact)return function(e,t,n){var s,i,r,e=e.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],s=0;s<7;++s)r=l([2e3,1]).day(s),this._minWeekdaysParse[s]=this.weekdaysMin(r,"").toLocaleLowerCase(),this._shortWeekdaysParse[s]=this.weekdaysShort(r,"").toLocaleLowerCase(),this._weekdaysParse[s]=this.weekdays(r,"").toLocaleLowerCase();return n?"dddd"===t?-1!==(i=x.call(this._weekdaysParse,e))?i:null:"ddd"===t?-1!==(i=x.call(this._shortWeekdaysParse,e))?i:null:-1!==(i=x.call(this._minWeekdaysParse,e))?i:null:"dddd"===t?-1!==(i=x.call(this._weekdaysParse,e))||-1!==(i=x.call(this._shortWeekdaysParse,e))||-1!==(i=x.call(this._minWeekdaysParse,e))?i:null:"ddd"===t?-1!==(i=x.call(this._shortWeekdaysParse,e))||-1!==(i=x.call(this._weekdaysParse,e))||-1!==(i=x.call(this._minWeekdaysParse,e))?i:null:-1!==(i=x.call(this._minWeekdaysParse,e))||-1!==(i=x.call(this._weekdaysParse,e))||-1!==(i=x.call(this._shortWeekdaysParse,e))?i:null}.call(this,e,t,n);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),s=0;s<7;s++){if(i=l([2e3,1]).day(s),n&&!this._fullWeekdaysParse[s]&&(this._fullWeekdaysParse[s]=new RegExp("^"+this.weekdays(i,"").replace(".","\\.?")+"$","i"),this._shortWeekdaysParse[s]=new RegExp("^"+this.weekdaysShort(i,"").replace(".","\\.?")+"$","i"),this._minWeekdaysParse[s]=new RegExp("^"+this.weekdaysMin(i,"").replace(".","\\.?")+"$","i")),this._weekdaysParse[s]||(i="^"+this.weekdays(i,"")+"|^"+this.weekdaysShort(i,"")+"|^"+this.weekdaysMin(i,""),this._weekdaysParse[s]=new RegExp(i.replace(".",""),"i")),n&&"dddd"===t&&this._fullWeekdaysParse[s].test(e))return s;if(n&&"ddd"===t&&this._shortWeekdaysParse[s].test(e))return s;if(n&&"dd"===t&&this._minWeekdaysParse[s].test(e))return s;if(!n&&this._weekdaysParse[s].test(e))return s}},d.weekdaysRegex=function(e){return this._weekdaysParseExact?(c(this,"_weekdaysRegex")||st.call(this),e?this._weekdaysStrictRegex:this._weekdaysRegex):(c(this,"_weekdaysRegex")||(this._weekdaysRegex=et),this._weekdaysStrictRegex&&e?this._weekdaysStrictRegex:this._weekdaysRegex)},d.weekdaysShortRegex=function(e){return this._weekdaysParseExact?(c(this,"_weekdaysRegex")||st.call(this),e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(c(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=tt),this._weekdaysShortStrictRegex&&e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)},d.weekdaysMinRegex=function(e){return this._weekdaysParseExact?(c(this,"_weekdaysRegex")||st.call(this),e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(c(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=nt),this._weekdaysMinStrictRegex&&e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)},d.isPM=function(e){return"p"===(e+"").toLowerCase().charAt(0)},d.meridiem=function(e,t,n){return 11<e?n?"pm":"PM":n?"am":"AM"},ft("en",{eras:[{since:"0001-01-01",until:1/0,offset:1,name:"Anno Domini",narrow:"AD",abbr:"AD"},{since:"0000-12-31",until:-1/0,offset:1,name:"Before Christ",narrow:"BC",abbr:"BC"}],dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(e){var t=e%10;return e+(1===M(e%100/10)?"th":1==t?"st":2==t?"nd":3==t?"rd":"th")}}),_.lang=e("moment.lang is deprecated. Use moment.locale instead.",ft),_.langData=e("moment.langData is deprecated. Use moment.localeData instead.",P);var _n=Math.abs;function yn(e,t,n,s){t=C(t,n);return e._milliseconds+=s*t._milliseconds,e._days+=s*t._days,e._months+=s*t._months,e._bubble()}function gn(e){return e<0?Math.floor(e):Math.ceil(e)}function wn(e){return 4800*e/146097}function pn(e){return 146097*e/4800}function kn(e){return function(){return this.as(e)}}de=kn("ms"),t=kn("s"),ye=kn("m"),he=kn("h"),Fe=kn("d"),_e=kn("w"),me=kn("M"),Qe=kn("Q"),i=kn("y"),ce=de;function Mn(e){return function(){return this.isValid()?this._data[e]:NaN}}var we=Mn("milliseconds"),fe=Mn("seconds"),ge=Mn("minutes"),Pe=Mn("hours"),d=Mn("days"),vn=Mn("months"),Dn=Mn("years");var Yn=Math.round,Sn={ss:44,s:45,m:45,h:22,d:26,w:null,M:11};function On(e,t,n,s){var i=C(e).abs(),r=Yn(i.as("s")),a=Yn(i.as("m")),o=Yn(i.as("h")),u=Yn(i.as("d")),l=Yn(i.as("M")),d=Yn(i.as("w")),i=Yn(i.as("y")),r=(r<=n.ss?["s",r]:r<n.s&&["ss",r])||(a<=1?["m"]:a<n.m&&["mm",a])||(o<=1?["h"]:o<n.h&&["hh",o])||(u<=1?["d"]:u<n.d&&["dd",u]);return(r=(r=null!=n.w?r||(d<=1?["w"]:d<n.w&&["ww",d]):r)||(l<=1?["M"]:l<n.M&&["MM",l])||(i<=1?["y"]:["yy",i]))[2]=t,r[3]=0<+e,r[4]=s,function(e,t,n,s,i){return i.relativeTime(t||1,!!n,e,s)}.apply(null,r)}var bn=Math.abs;function Tn(e){return(0<e)-(e<0)||+e}function xn(){var e,t,n,s,i,r,a,o,u,l,d;return this.isValid()?(e=bn(this._milliseconds)/1e3,t=bn(this._days),n=bn(this._months),(o=this.asSeconds())?(s=m(e/60),i=m(s/60),e%=60,s%=60,r=m(n/12),n%=12,a=e?e.toFixed(3).replace(/\.?0+$/,""):"",u=Tn(this._months)!==Tn(o)?"-":"",l=Tn(this._days)!==Tn(o)?"-":"",d=Tn(this._milliseconds)!==Tn(o)?"-":"",(o<0?"-":"")+"P"+(r?u+r+"Y":"")+(n?u+n+"M":"")+(t?l+t+"D":"")+(i||s||e?"T":"")+(i?d+i+"H":"")+(s?d+s+"M":"")+(e?d+a+"S":"")):"P0D"):this.localeData().invalidDate()}var U=Ct.prototype;return U.isValid=function(){return this._isValid},U.abs=function(){var e=this._data;return this._milliseconds=_n(this._milliseconds),this._days=_n(this._days),this._months=_n(this._months),e.milliseconds=_n(e.milliseconds),e.seconds=_n(e.seconds),e.minutes=_n(e.minutes),e.hours=_n(e.hours),e.months=_n(e.months),e.years=_n(e.years),this},U.add=function(e,t){return yn(this,e,t,1)},U.subtract=function(e,t){return yn(this,e,t,-1)},U.as=function(e){if(!this.isValid())return NaN;var t,n,s=this._milliseconds;if("month"===(e=o(e))||"quarter"===e||"year"===e)switch(t=this._days+s/864e5,n=this._months+wn(t),e){case"month":return n;case"quarter":return n/3;case"year":return n/12}else switch(t=this._days+Math.round(pn(this._months)),e){case"week":return t/7+s/6048e5;case"day":return t+s/864e5;case"hour":return 24*t+s/36e5;case"minute":return 1440*t+s/6e4;case"second":return 86400*t+s/1e3;case"millisecond":return Math.floor(864e5*t)+s;default:throw new Error("Unknown unit "+e)}},U.asMilliseconds=de,U.asSeconds=t,U.asMinutes=ye,U.asHours=he,U.asDays=Fe,U.asWeeks=_e,U.asMonths=me,U.asQuarters=Qe,U.asYears=i,U.valueOf=ce,U._bubble=function(){var e=this._milliseconds,t=this._days,n=this._months,s=this._data;return 0<=e&&0<=t&&0<=n||e<=0&&t<=0&&n<=0||(e+=864e5*gn(pn(n)+t),n=t=0),s.milliseconds=e%1e3,e=m(e/1e3),s.seconds=e%60,e=m(e/60),s.minutes=e%60,e=m(e/60),s.hours=e%24,t+=m(e/24),n+=e=m(wn(t)),t-=gn(pn(e)),e=m(n/12),n%=12,s.days=t,s.months=n,s.years=e,this},U.clone=function(){return C(this)},U.get=function(e){return e=o(e),this.isValid()?this[e+"s"]():NaN},U.milliseconds=we,U.seconds=fe,U.minutes=ge,U.hours=Pe,U.days=d,U.weeks=function(){return m(this.days()/7)},U.months=vn,U.years=Dn,U.humanize=function(e,t){var n,s;return this.isValid()?(n=!1,s=Sn,"object"==typeof e&&(t=e,e=!1),"boolean"==typeof e&&(n=e),"object"==typeof t&&(s=Object.assign({},Sn,t),null!=t.s)&&null==t.ss&&(s.ss=t.s-1),e=this.localeData(),t=On(this,!n,s,e),n&&(t=e.pastFuture(+this,t)),e.postformat(t)):this.localeData().invalidDate()},U.toISOString=xn,U.toString=xn,U.toJSON=xn,U.locale=Xt,U.localeData=Kt,U.toIsoString=e("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",xn),U.lang=Ke,s("X",0,0,"unix"),s("x",0,0,"valueOf"),h("x",ke),h("X",/[+-]?\d+(\.\d{1,3})?/),v("X",function(e,t,n){n._d=new Date(1e3*parseFloat(e))}),v("x",function(e,t,n){n._d=new Date(M(e))}),_.version="2.30.1",H=R,_.fn=u,_.min=function(){return Pt("isBefore",[].slice.call(arguments,0))},_.max=function(){return Pt("isAfter",[].slice.call(arguments,0))},_.now=function(){return Date.now?Date.now():+new Date},_.utc=l,_.unix=function(e){return R(1e3*e)},_.months=function(e,t){return fn(e,t,"months")},_.isDate=V,_.locale=ft,_.invalid=I,_.duration=C,_.isMoment=k,_.weekdays=function(e,t,n){return mn(e,t,n,"weekdays")},_.parseZone=function(){return R.apply(null,arguments).parseZone()},_.localeData=P,_.isDuration=Ut,_.monthsShort=function(e,t){return fn(e,t,"monthsShort")},_.weekdaysMin=function(e,t,n){return mn(e,t,n,"weekdaysMin")},_.defineLocale=mt,_.updateLocale=function(e,t){var n,s;return null!=t?(s=ut,null!=W[e]&&null!=W[e].parentLocale?W[e].set(X(W[e]._config,t)):(t=X(s=null!=(n=ct(e))?n._config:s,t),null==n&&(t.abbr=e),(s=new K(t)).parentLocale=W[e],W[e]=s),ft(e)):null!=W[e]&&(null!=W[e].parentLocale?(W[e]=W[e].parentLocale,e===ft()&&ft(e)):null!=W[e]&&delete W[e]),W[e]},_.locales=function(){return ee(W)},_.weekdaysShort=function(e,t,n){return mn(e,t,n,"weekdaysShort")},_.normalizeUnits=o,_.relativeTimeRounding=function(e){return void 0===e?Yn:"function"==typeof e&&(Yn=e,!0)},_.relativeTimeThreshold=function(e,t){return void 0!==Sn[e]&&(void 0===t?Sn[e]:(Sn[e]=t,"s"===e&&(Sn.ss=t-1),!0))},_.calendarFormat=function(e,t){return(e=e.diff(t,"days",!0))<-6?"sameElse":e<-1?"lastWeek":e<0?"lastDay":e<1?"sameDay":e<2?"nextDay":e<7?"nextWeek":"sameElse"},_.prototype=u,_.HTML5_FMT={DATETIME_LOCAL:"YYYY-MM-DDTHH:mm",DATETIME_LOCAL_SECONDS:"YYYY-MM-DDTHH:mm:ss",DATETIME_LOCAL_MS:"YYYY-MM-DDTHH:mm:ss.SSS",DATE:"YYYY-MM-DD",TIME:"HH:mm",TIME_SECONDS:"HH:mm:ss",TIME_MS:"HH:mm:ss.SSS",WEEK:"GGGG-[W]WW",MONTH:"YYYY-MM"},_});
//# sourceMappingURL=moment.min.js.map
return window.moment; }).call(window);
var vue = new Proxy({}, { get: function(_, k){ var v = Vue[k]; return typeof v === 'function' ? v.bind(Vue) : v; }, has: function(){ return true; } });
(function (vue, moment) {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  const shared_key = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]).buffer;
  const fetch$1 = unsafeWindow.fetch;
  unsafeWindow.XMLHttpRequest;
  const defaultConfig = {
    install_id: "2187355326270644",
    device_id: "2187355326004404",
    device_type: "P30"
  };
  const _config = {
    currentConfig: defaultConfig
  };
  const scriptcss = `/* 移除章节锁定图标 */\r
.muyeicon-lock {\r
	display: none;\r
}\r
/* 移除APP推广图标 */\r
.muye-to-fanqie {\r
	display: none!important;\r
}\r
.reader-toolbar-item-download {\r
	display: none!important;\r
}\r
.download-btn {\r
	display: none!important;\r
}\r
.download-icon {\r
	display: none!important;\r
}\r
\r
.fqa-hide {\r
	display: none!important;\r
}\r
/* 404 */\r
.no-content {\r
	display: none!important;\r
}\r
\r
.fqa-comic-img {\r
	width: 100%!important;\r
	height: 100%!important;\r
	max-width: 100%!important;\r
	max-height: 100%!important;\r
	padding-top: 0!important;\r
	padding-bottom: 0!important;\r
	margin-top: 0!important;\r
	margin-bottom: 0!important;\r
}\r
\r
.fqa-comic-reader {\r
	line-height: 0!important;\r
}\r
\r
.fqa-menu-item,\r
.arco-menu-item {\r
	width: 100%!important;\r
}\r
\r
#dynamic-el {\r
	display: none!important;\r
}\r
\r
.fqa-footnote-ref {\r
	display: inline-block;\r
	margin: 0 0.15em;\r
	padding: 0 0.25em;\r
	font-size: 0.7em;\r
	line-height: 1.4;\r
	vertical-align: super;\r
	color: var(--web-brand_normal, #f14646);\r
	cursor: pointer;\r
	user-select: none;\r
	border-radius: 3px;\r
	text-indent: 0;\r
}\r
\r
.fqa-footnote-ref:hover,\r
.fqa-footnote-ref:focus-visible {\r
	background: var(--web-brand_light, rgba(241, 70, 70, 0.12));\r
	outline: none;\r
}\r
\r
\r
.fqa-footnote {\r
	margin-top: 2em;\r
	padding-top: 1em;\r
	border-top: 1px solid var(--web-gray_20, rgba(128, 128, 128, 0.25));\r
	font-size: var(--fqa-body-size, 1.6rem);\r
}\r
\r
.muye-reader-content-16 .fqa-footnote { font-size: var(--fqa-body-size, 1.6rem); }\r
.muye-reader-content-20 .fqa-footnote { font-size: var(--fqa-body-size, 2rem); }\r
.muye-reader-content-24 .fqa-footnote { font-size: var(--fqa-body-size, 2.4rem); }\r
.muye-reader-content-28 .fqa-footnote { font-size: var(--fqa-body-size, 2.8rem); }\r
.muye-reader-content-32 .fqa-footnote { font-size: var(--fqa-body-size, 3.2rem); }\r
\r
.fqa-footnote-title {\r
	margin-bottom: 0.6em;\r
	font-size: 0.85em;\r
	font-weight: 600;\r
	color: var(--web-gray_40, #8a8a8a);\r
	text-indent: 0;\r
}\r
\r
.fqa-footnote-list {\r
	margin: 0;\r
	padding-left: 1.6em;\r
	font-size: 0.85em;\r
	line-height: 1.7;\r
	color: var(--web-gray_40, #8a8a8a);\r
}\r
\r
.fqa-footnote-list li {\r
	margin-bottom: 0.5em;\r
	text-indent: 0;\r
	transition: background-color 0.3s ease;\r
}\r
\r
.fqa-footnote-list li.fqa-footnote-active {\r
	background: var(--web-brand_light, rgba(241, 70, 70, 0.12));\r
	border-radius: 4px;\r
}\r
\r
.muye-reader-content > body {\r
	background-color: var(--web-bg)!important;\r
}\r
\r
.fqa-icon-dark {\r
	color: #B3B3B3\r
}\r
\r
/* ----------------------------- 右键菜单 / Toast ----------------------------- */\r
\r
/*\r
 * 书架与搜索共用。两者都把菜单 Teleport 到 body，\r
 * 拿不到各自根节点上的变量，所以在这里声明一份全局色板。\r
 */\r
.fqa-menu {\r
	--fqa-menu-bg: #fff;\r
	--fqa-menu-text: #1f2329;\r
	--fqa-menu-sub: #8f959e;\r
	--fqa-menu-hover: rgba(31, 35, 41, 0.06);\r
	--fqa-menu-danger: #f5222d;\r
\r
	position: fixed;\r
	z-index: 2147483001;\r
	min-width: 132px;\r
	max-width: 240px;\r
	padding: 4px;\r
	box-sizing: border-box;\r
	background: var(--fqa-menu-bg);\r
	border: 1px solid rgba(31, 35, 41, 0.08);\r
	border-radius: 8px;\r
	box-shadow: 0 6px 24px rgba(31, 35, 41, 0.16);\r
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial,\r
		sans-serif;\r
	font-size: 13px;\r
	color: var(--fqa-menu-text);\r
	user-select: none;\r
}\r
\r
/* 二级面板：分组数量多时可滚动 */\r
.fqa-menu-sub {\r
	max-height: 320px;\r
	overflow-y: auto;\r
}\r
\r
.fqa-menu-row {\r
	display: flex;\r
	align-items: center;\r
	justify-content: space-between;\r
	gap: 12px;\r
	padding: 7px 10px;\r
	border-radius: 5px;\r
	line-height: 1.4;\r
	cursor: pointer;\r
	white-space: nowrap;\r
	overflow: hidden;\r
}\r
\r
.fqa-menu-row > span:first-child {\r
	overflow: hidden;\r
	text-overflow: ellipsis;\r
}\r
\r
.fqa-menu-row:hover,\r
.fqa-menu-row.fqa-menu-open {\r
	background: var(--fqa-menu-hover);\r
}\r
\r
.fqa-menu-arrow {\r
	color: var(--fqa-menu-sub);\r
	font-size: 15px;\r
	line-height: 1;\r
}\r
\r
.fqa-menu-danger {\r
	color: var(--fqa-menu-danger);\r
}\r
\r
.fqa-menu-disabled {\r
	color: var(--fqa-menu-sub);\r
	cursor: not-allowed;\r
}\r
\r
.fqa-menu-disabled:hover {\r
	background: transparent;\r
}\r
\r
/* 操作结果提示 */\r
.fqa-toast {\r
	position: fixed;\r
	left: 50%;\r
	bottom: 48px;\r
	transform: translateX(-50%);\r
	z-index: 2147483002;\r
	max-width: 80vw;\r
	padding: 10px 18px;\r
	box-sizing: border-box;\r
	background: rgba(31, 35, 41, 0.88);\r
	color: #fff;\r
	border-radius: 8px;\r
	font-size: 13px;\r
	line-height: 1.4;\r
	box-shadow: 0 6px 24px rgba(31, 35, 41, 0.24);\r
	pointer-events: none;\r
}\r
\r
/* 骨架屏微光。书架与搜索共用同一个动画名 */\r
@keyframes fqa-shimmer {\r
	100% {\r
		transform: translateX(100%);\r
	}\r
}\r
\r
@media (prefers-color-scheme: dark) {\r
	.fqa-menu {\r
		--fqa-menu-bg: #23272e;\r
		--fqa-menu-text: #e5e6eb;\r
		--fqa-menu-sub: #8f959e;\r
		--fqa-menu-hover: rgba(255, 255, 255, 0.08);\r
		border-color: rgba(255, 255, 255, 0.1);\r
	}\r
}\r
\r
.info {\r
	width: 100%!important;\r
}\r
\r
.reader-toolbar {\r
	user-select: none;\r
}\r
\r
/* ----------------------------- 失败恢复弹窗 ----------------------------- */\r
.fqa-recovery-modal {\r
	position: fixed;\r
	inset: 0;\r
	z-index: 999998;\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;\r
	font-size: 14px;\r
	color: #1f2329;\r
}\r
.fqa-recovery-backdrop {\r
	position: absolute;\r
	inset: 0;\r
	background: rgba(0, 0, 0, 0.45);\r
}\r
.fqa-recovery-dialog {\r
	position: relative;\r
	width: min(440px, 90vw);\r
	max-height: 86vh;\r
	overflow-y: auto;\r
	background: #fff;\r
	border-radius: 10px;\r
	box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);\r
	padding: 20px 22px 22px;\r
	box-sizing: border-box;\r
}\r
.fqa-recovery-header {\r
	display: flex;\r
	align-items: center;\r
	gap: 8px;\r
	margin-bottom: 12px;\r
	padding-bottom: 12px;\r
	border-bottom: 1px solid #eee;\r
}\r
.fqa-recovery-icon { font-size: 22px; }\r
.fqa-recovery-title { font-weight: 600; font-size: 16px; }\r
.fqa-recovery-body p.fqa-recovery-reason { margin: 0 0 14px; line-height: 1.55; color: #4a4a4a; }\r
.fqa-recovery-actions {\r
	display: flex;\r
	flex-wrap: wrap;\r
	gap: 8px;\r
	margin-bottom: 14px;\r
}\r
.fqa-recovery-btn {\r
	padding: 6px 14px;\r
	border: 1px solid #d0d0d0;\r
	background: #fff;\r
	color: #1f2329;\r
	border-radius: 6px;\r
	cursor: pointer;\r
	font-size: 13px;\r
	transition: all 0.15s;\r
}\r
.fqa-recovery-btn:hover { border-color: #5e8eff; color: #5e8eff; }\r
.fqa-recovery-btn.primary { background: #5e8eff; color: #fff; border-color: #5e8eff; }\r
.fqa-recovery-btn.primary:hover { background: #4a7af0; }\r
.fqa-recovery-btn.warn { background: #fff7e6; color: #d46b08; border-color: #ffd591; }\r
.fqa-recovery-btn.warn:hover { border-color: #ff7a45; }\r
.fqa-recovery-btn.danger { background: #fff1f0; color: #cf1322; border-color: #ffa39e; }\r
.fqa-recovery-btn.danger:hover { background: #ff7875; color: #fff; border-color: #ff7875; }\r
.fqa-recovery-btn.small { padding: 4px 10px; font-size: 12px; }\r
.fqa-recovery-backoff { display: flex; gap: 6px; flex-wrap: wrap; }\r
.fqa-recovery-diag { margin-top: 8px; }\r
.fqa-recovery-diag[open] summary { display: block; cursor: pointer; color: #888; font-size: 12px; padding: 4px 0; }\r
.fqa-recovery-log {\r
	max-height: 220px;\r
	overflow: auto;\r
	background: #1f1f1f;\r
	color: #eee;\r
	border-radius: 6px;\r
	padding: 8px 10px;\r
	font-family: "SF Mono", Consolas, monospace;\r
	font-size: 11px;\r
	line-height: 1.45;\r
	white-space: pre-wrap;\r
	margin: 0;\r
}\r
.fqa-recovery-diag-actions { margin-top: 8px; display: flex; gap: 6px; }\r
.fqa-recovery-auto-reset {\r
	margin: 0 0 14px;\r
	padding: 12px 14px;\r
	background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);\r
	border: 1px solid #91caff;\r
	border-radius: 8px;\r
}\r
.fqa-recovery-auto-reset-title { font-weight: 600; color: #0958d9; margin-bottom: 6px; font-size: 13px; }\r
.fqa-recovery-auto-reset-body { color: #1f2329; line-height: 1.55; font-size: 13px; margin-bottom: 10px; }\r
.fqa-recovery-auto-reset-body .fqa-countdown {\r
	display: inline-block;\r
	padding: 1px 8px;\r
	background: #0958d9;\r
	color: #fff;\r
	border-radius: 4px;\r
	font-weight: 700;\r
	font-variant-numeric: tabular-nums;\r
	min-width: 32px;\r
	text-align: center;\r
}\r
.fqa-recovery-auto-reset .fqa-recovery-btn { padding: 4px 12px; font-size: 12px; }`;
  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function cloneElement(element) {
    return element.cloneNode(true);
  }
  function concatArrayBuffers(...buffers) {
    const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      result.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }
    return result.buffer;
  }
  async function inject() {
    while (!document.body) {
      console.log("Waiting for body...");
      await sleep(200);
    }
    GM_addStyle(scriptcss);
    console.log("CSS injected successfully!");
  }
  unsafeWindow.localStorage;
  function write(key, value) {
    GM_setValue(key, JSON.stringify(value));
  }
  function read(key) {
    return JSON.parse(GM_getValue(key) || "null");
  }
  function del(key) {
    GM_deleteValue(key);
  }
  const STORE_KEY = "settings";
  const DEFAULT_SETTINGS = {
    decryptFont: true,
    blockReport: true,
    allowCopy: true,
    shelfRemoveConfirm: true,
    logoutConfirm: true,
    readerFont: "",
    customCssEnabled: false,
    customCss: "",
    // 原站书架点封面是继续阅读，保持一致
    bookshelfClickAction: "read",
    enhanceSearch: true,
    // 默认关：携带登录态属于额外的隐私暴露，交给用户显式开启
    searchPersonalized: false,
    enableDownload: true,
    downloadFormat: "epub",
    downloadCharset: "utf-8",
    // 30 是接口单请求返回正文的上限，再大也只回 30 条
    downloadBatchSize: 30,
    // 实测 750ms 能稳定拿满，更短会被限流成每次 1 条
    downloadInterval: 750,
    downloadRetries: 3,
    downloadVolumePage: false,
    downloadImages: true,
    downloadBookCss: true,
    audiobookChapterEnd: "next",
    audiobookFollow: true,
    apiPreference: "app",
    deviceId: "",
    installId: "",
    deviceType: ""
  };
  function normalize(raw) {
    const s = { ...DEFAULT_SETTINGS };
    if (!raw || typeof raw !== "object") return s;
    const o = raw;
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      const v = o[key];
      if (v === void 0 || v === null) continue;
      if (typeof DEFAULT_SETTINGS[key] === typeof v) {
        s[key] = v;
      }
    }
    if (s.apiPreference !== "app" && s.apiPreference !== "redcandle") {
      s.apiPreference = DEFAULT_SETTINGS.apiPreference;
    }
    if (s.downloadFormat !== "epub" && s.downloadFormat !== "txt") {
      s.downloadFormat = DEFAULT_SETTINGS.downloadFormat;
    }
    if (s.downloadCharset !== "utf-8" && s.downloadCharset !== "gbk") {
      s.downloadCharset = DEFAULT_SETTINGS.downloadCharset;
    }
    if (s.bookshelfClickAction !== "read" && s.bookshelfClickAction !== "detail") {
      s.bookshelfClickAction = DEFAULT_SETTINGS.bookshelfClickAction;
    }
    if (s.audiobookChapterEnd !== "next" && s.audiobookChapterEnd !== "stop") {
      s.audiobookChapterEnd = DEFAULT_SETTINGS.audiobookChapterEnd;
    }
    s.downloadBatchSize = clampInt(s.downloadBatchSize, 1, 30, DEFAULT_SETTINGS.downloadBatchSize);
    s.downloadInterval = clampInt(s.downloadInterval, 0, 1e4, DEFAULT_SETTINGS.downloadInterval);
    s.downloadRetries = clampInt(s.downloadRetries, 0, 10, DEFAULT_SETTINGS.downloadRetries);
    return s;
  }
  function clampInt(value, min, max, fallback) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }
  const settings = vue.reactive(normalize(read(STORE_KEY)));
  let saveTimer;
  vue.watch(
    settings,
    () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = void 0;
        write(STORE_KEY, { ...settings });
      }, 200);
    },
    { deep: true }
  );
  const code_ed = 58715;
  const code_st = 58344;
  const mapping = {
    "DNMrHsV173Pd4pgy": [
      "D在主特家军然表场4要只v和?6别还g现儿岁??此象月3出战工相",
      "o男直失世F都平文什VO将真T那当?会立些u是十张学气大爱两命全",
      "后东性通被1它乐接而感车山公了常以何可话先pi叫轻M士w着变尔快",
      "l个说少色里安花远7难师放t报认面道S?克地度I好机U民写把万同",
      "水新没书电吃像斯5为y白几日教看但第加候作上拉住有法r事应位利你",
      "声身国问马女他Y比父xAHNsX边美对所金活回意到z从j知又内因",
      "点Q三定8Rb正或夫向德听更?得告并本q过记L让打f人就者去原满",
      "体做经K走如孩cG给使物?最笑部?员等受k行一条果动光门头见往自",
      "解成处天能于名其发总母的死手入路进心来h时力多开已许d至由很界n",
      "小与Z想代么分生口再妈望次西风种带J?实情才这?E我神格长觉间年",
      "眼无不亲关结0友信下却重己老2音字m呢明之前高PB目太e9起稜她",
      "也W用方子英每理便四数期中C外样a海们任"
    ],
    "fKts9tCXDjS49UhH": [
      "体y十现快使话却月物水的放知爱方?表风理O老也p常克平几最主她s",
      "将法情o光a我呢J员太每望受教w利军已U人如变得要少斯门电m男没",
      "AK国时中走么何口小向问轻Td神下间车fG度D又大面远就写j给通",
      "起实E?它去S到道数吃们加P是无把事西多界?发新外活解孩只作前Y",
      "尔经?u心告父等Q民全这9果安?i母8r说任先和地C张战场g像c",
      "q你使?样总目x性处音头?应乐关能花I当名手4重字声力友然生代内",
      "里本回真入师象?0点R亲V种动英命ZhX做特边高有B为期自年马认",
      "出接至H正方感所明者棱F住学还分意更其n但比觉以由死家让失士L2",
      "I金叫身报听W再原山海白很见5直位第工个开岁好用都于可同3次四?",
      "日信与女笑满并部什不从或机此?了记三e些bN夫会才几眼两美被一公",
      "来立z长对己看k许因相色后往打结格过世气7子条在书之定v拉成进带",
      "着东上想天他妈1文而路那别德6Mt行候难"
    ],
    "_search": [
      "?s?作口在他能并B士4U克才正们字声高全尔活者动其主报多望放h",
      "w次年?中3特于十入要男同G面分方K什再教本己结1等世N?说gu",
      "期Z外美M行给9文将两许张友0英应向像此白安少何打气常定间花见孩",
      "它直风数使道第水已女山解dP的通关性叫几L妈问回神来S?四里前国",
      "些OvIA心平自无车光代是好却c得种就意先立z子过Yj表?么所接",
      "了名金受J满眼没部那m每车度可R斯经现门明V如走命y6E战很上f",
      "月西7长夫想话变海机x到W一成生信笑但父开内东马日小而后带以三几",
      "为认X死员目位之学远入音呢我q乐象重对个被别F也书棱D写还因家发",
      "时i或住德当oI比觉然吃去公a老亲情体太b方C电理?失力更拉物着",
      "原她工实色感记看出相路大你候2和?与p样新只便最不进Tr做格母总",
      "爱身师轻知往加从?天eH?听场由快边让把任8条头事至起点真手这难",
      "都界用法n处下文Q告地5kt岁有会果利民"
    ]
  };
  const NO_GLYPH = "?";
  const flatCache = /* @__PURE__ */ new Map();
  function tableOf(fontId) {
    const cached = flatCache.get(fontId);
    if (cached) return cached;
    const rows = mapping[fontId];
    if (!rows) return null;
    const flat = [...rows.join("")];
    const expected = code_ed - code_st + 1;
    if (flat.length !== expected) {
      console.error(
        `[fqa:font] 码表 ${fontId} 长度异常：${flat.length}，应为 ${expected}，已禁用该字体的解密`
      );
      flatCache.set(fontId, []);
      return [];
    }
    flatCache.set(fontId, flat);
    return flat;
  }
  const enTag = Object.keys(mapping).map((id) => `.font-${id}`).join(", ");
  function fontIdOf(element) {
    for (const cls of element.classList) {
      if (!cls.startsWith("font-")) continue;
      const id = cls.slice(5);
      if (mapping[id]) return id;
    }
    return null;
  }
  function decryptText(text, fontId) {
    if (window.location.pathname.startsWith("/search")) fontId = "_search";
    const table = tableOf(fontId);
    if (!table || table.length === 0) return text;
    let result = "";
    let changed = false;
    for (const char of text) {
      const codePoint = char.codePointAt(0);
      if (typeof codePoint !== "number") {
        return text;
      }
      if (codePoint < code_st || codePoint > code_ed) {
        result += char;
        continue;
      }
      const mapped = table[codePoint - code_st];
      if (mapped && mapped !== NO_GLYPH) {
        result += mapped;
        changed = true;
      } else {
        result += char;
      }
    }
    return changed ? result : text;
  }
  function decryptElement(element) {
    if (!settings.decryptFont) return;
    const fontId = fontIdOf(element);
    if (!fontId) return;
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        // 后代里可能嵌着另一套字体的节点，那部分要用它自己的码表，
        // 交给针对它的 decryptElement 处理，这里跳过整棵子树
        acceptNode(node) {
          var _a;
          const owner = (_a = node.parentElement) == null ? void 0 : _a.closest(enTag);
          return owner && owner !== element ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    let textNode;
    while (textNode = walker.nextNode()) {
      const oldText = textNode.nodeValue;
      if (!oldText) {
        continue;
      }
      const newText = decryptText(oldText, fontId);
      if (newText !== oldText) {
        textNode.nodeValue = newText;
      }
    }
  }
  function decryptPage(root) {
    if (root instanceof Element && root.matches(enTag)) {
      decryptElement(root);
    }
    root.querySelectorAll(enTag).forEach(decryptElement);
  }
  function initFontDecrypt() {
    const observer = new MutationObserver((mutations) => {
      var _a, _b;
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          const encryptedElement = (_a = mutation.target.parentElement) == null ? void 0 : _a.closest(
            enTag
          );
          if (encryptedElement) {
            decryptElement(encryptedElement);
          }
          continue;
        }
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            decryptPage(node);
            continue;
          }
          if (node.nodeType === Node.TEXT_NODE) {
            const encryptedElement = (_b = node.parentElement) == null ? void 0 : _b.closest(
              enTag
            );
            if (encryptedElement) {
              decryptElement(encryptedElement);
            }
          }
        }
      }
    });
    observer.observe(document, {
      subtree: true,
      childList: true,
      characterData: true
    });
    decryptPage(document);
    vue.watch(
      () => settings.decryptFont,
      (on) => {
        if (on) decryptPage(document);
      }
    );
  }
  const STYLE_ID$2 = "fqa-user-style";
  const READER_SCOPE = "#fqa-reader-content, .muye-reader-content";
  function buildCss() {
    const parts = [];
    const font = settings.readerFont.trim();
    if (font) {
      const family = /^["']|,/.test(font) ? font : `"${font}"`;
      parts.push(`${READER_SCOPE}, ${READER_SCOPE} p { font-family: ${family}, inherit !important; }`);
    }
    if (settings.customCssEnabled && settings.customCss.trim()) {
      parts.push(settings.customCss);
    }
    return parts.join("\n");
  }
  function apply() {
    const css = buildCss();
    let el = document.getElementById(STYLE_ID$2);
    if (!css) {
      el == null ? void 0 : el.remove();
      return;
    }
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID$2;
      document.head.appendChild(el);
    }
    el.textContent = css;
  }
  function initUserStyle() {
    apply();
    vue.watch(
      () => [settings.readerFont, settings.customCssEnabled, settings.customCss],
      apply
    );
  }
  class EmptyResponseError extends Error {
    constructor(status) {
      super(`服务端返回了空响应体(HTTP ${status})`);
      __publicField(this, "status");
      this.name = "EmptyResponseError";
      this.status = status;
    }
  }
  function isEmptyResponse(res) {
    const text = res.responseText;
    return typeof text !== "string" || text === "";
  }
  const supportedMethods = /* @__PURE__ */ new Set([
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "DELETE"
  ]);
  function apiFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const { signal } = options;
      if (signal == null ? void 0 : signal.aborted) {
        reject(signal.reason ?? new DOMException("The operation was aborted", "AbortError"));
        return;
      }
      const headers = normalizeHeaders$1(options.headers);
      const data = normalizeBody(options.body);
      const method = options.method ?? (data ? "POST" : "GET");
      if (!supportedMethods.has(method)) {
        reject(new TypeError(`Unsupported request method: ${method}`));
        return;
      }
      let request;
      const abort = () => request == null ? void 0 : request.abort();
      function cleanup() {
        signal == null ? void 0 : signal.removeEventListener("abort", abort);
      }
      request = GM_xmlhttpRequest({
        url,
        method,
        headers,
        data,
        anonymous: options.credentials === "omit",
        redirect: options.redirect === "error" ? "error" : "follow",
        onload(response) {
          cleanup();
          resolve(Object.assign(response, {
            json() {
              if (isEmptyResponse(this)) {
                throw new EmptyResponseError(this.status);
              }
              return JSON.parse(this.responseText);
            }
          }));
        },
        onerror(response) {
          cleanup();
          reject(createRequestError("Network request failed", response));
        },
        ontimeout() {
          cleanup();
          reject(createRequestError("Network request timed out", {
            status: 0,
            statusText: "Timeout",
            url
          }));
        },
        onabort() {
          cleanup();
          reject(
            (signal == null ? void 0 : signal.reason) ?? new DOMException("The operation was aborted", "AbortError")
          );
        }
      });
      signal == null ? void 0 : signal.addEventListener("abort", abort, { once: true });
    });
  }
  function fetchArrayBuffer(url) {
    return fetch$1(url, { referrerPolicy: "no-referrer" }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    }).catch((err) => {
      console.debug("[fqa:img] 页面 fetch 失败，改用 GM_xmlhttpRequest:", url, err);
      return gmArrayBuffer(url);
    });
  }
  function gmArrayBuffer(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        url,
        method: "GET",
        responseType: "arraybuffer",
        onload(response) {
          const buf = response.response;
          if (response.status >= 200 && response.status < 300 && (buf == null ? void 0 : buf.byteLength)) {
            resolve(buf);
          } else {
            reject(new Error(`GM 请求失败(${response.status})`));
          }
        },
        onerror() {
          reject(new Error(`GM 请求出错，检查 @connect 是否覆盖该域名: ${url}`));
        },
        ontimeout: () => reject(new Error("GM 请求超时"))
      });
    });
  }
  function normalizeHeaders$1(headers) {
    if (!headers) {
      return void 0;
    }
    return Object.fromEntries(new Headers(headers).entries());
  }
  function normalizeBody(body) {
    if (body == null) {
      return void 0;
    }
    if (body instanceof URLSearchParams) {
      return body.toString();
    }
    if (typeof body === "string" || body instanceof Blob || body instanceof ArrayBuffer || body instanceof FormData) {
      return body;
    }
    if (ArrayBuffer.isView(body)) {
      return body.buffer.slice(
        body.byteOffset,
        body.byteOffset + body.byteLength
      );
    }
    throw new TypeError(
      "GM_xmlhttpRequest does not support ReadableStream request bodies"
    );
  }
  function createRequestError(message, response) {
    const error2 = new TypeError(message);
    Object.defineProperty(error2, "response", {
      configurable: true,
      enumerable: false,
      value: response
    });
    return error2;
  }
  function rotateLeft(value, shiftBits) {
    return value << shiftBits | value >>> 32 - shiftBits;
  }
  function addUnsigned(left, right) {
    return left + right >>> 0;
  }
  function f(x, y, z) {
    return x & y | ~x & z;
  }
  function g(x, y, z) {
    return x & z | y & ~z;
  }
  function h(x, y, z) {
    return x ^ y ^ z;
  }
  function i(x, y, z) {
    return y ^ (x | ~z);
  }
  function ff(a, b, c, d, x, s, ac) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac)), s), b);
  }
  function gg(a, b, c, d, x, s, ac) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac)), s), b);
  }
  function hh(a, b, c, d, x, s, ac) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac)), s), b);
  }
  function ii(a, b, c, d, x, s, ac) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac)), s), b);
  }
  function convertToWordArray(bytes) {
    const wordCount = Math.ceil((bytes.length + 9) / 64) * 16;
    const words = new Array(wordCount).fill(0);
    for (let byteIndex = 0; byteIndex < bytes.length; byteIndex++) {
      const wordIndex = Math.floor(byteIndex / 4);
      const bytePosition = byteIndex % 4 * 8;
      words[wordIndex] = words[wordIndex] | bytes[byteIndex] << bytePosition;
    }
    const paddingWordIndex = Math.floor(bytes.length / 4);
    const paddingBytePosition = bytes.length % 4 * 8;
    words[paddingWordIndex] = words[paddingWordIndex] | 128 << paddingBytePosition;
    words[wordCount - 2] = bytes.length << 3;
    words[wordCount - 1] = bytes.length >>> 29;
    return words;
  }
  function wordToHex(value) {
    let hex2 = "";
    for (let byteIndex = 0; byteIndex < 4; byteIndex++) {
      const byte = value >>> byteIndex * 8 & 255;
      hex2 += byte.toString(16).padStart(2, "0");
    }
    return hex2;
  }
  function md5(input) {
    const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
    const words = convertToWordArray(bytes);
    let a = 1732584193;
    let b = 4023233417;
    let c = 2562383102;
    let d = 271733878;
    for (let k = 0; k < words.length; k += 16) {
      const aa = a;
      const bb = b;
      const cc = c;
      const dd = d;
      a = ff(a, b, c, d, words[k], 7, 3614090360);
      d = ff(d, a, b, c, words[k + 1], 12, 3905402710);
      c = ff(c, d, a, b, words[k + 2], 17, 606105819);
      b = ff(b, c, d, a, words[k + 3], 22, 3250441966);
      a = ff(a, b, c, d, words[k + 4], 7, 4118548399);
      d = ff(d, a, b, c, words[k + 5], 12, 1200080426);
      c = ff(c, d, a, b, words[k + 6], 17, 2821735955);
      b = ff(b, c, d, a, words[k + 7], 22, 4249261313);
      a = ff(a, b, c, d, words[k + 8], 7, 1770035416);
      d = ff(d, a, b, c, words[k + 9], 12, 2336552879);
      c = ff(c, d, a, b, words[k + 10], 17, 4294925233);
      b = ff(b, c, d, a, words[k + 11], 22, 2304563134);
      a = ff(a, b, c, d, words[k + 12], 7, 1804603682);
      d = ff(d, a, b, c, words[k + 13], 12, 4254626195);
      c = ff(c, d, a, b, words[k + 14], 17, 2792965006);
      b = ff(b, c, d, a, words[k + 15], 22, 1236535329);
      a = gg(a, b, c, d, words[k + 1], 5, 4129170786);
      d = gg(d, a, b, c, words[k + 6], 9, 3225465664);
      c = gg(c, d, a, b, words[k + 11], 14, 643717713);
      b = gg(b, c, d, a, words[k], 20, 3921069994);
      a = gg(a, b, c, d, words[k + 5], 5, 3593408605);
      d = gg(d, a, b, c, words[k + 10], 9, 38016083);
      c = gg(c, d, a, b, words[k + 15], 14, 3634488961);
      b = gg(b, c, d, a, words[k + 4], 20, 3889429448);
      a = gg(a, b, c, d, words[k + 9], 5, 568446438);
      d = gg(d, a, b, c, words[k + 14], 9, 3275163606);
      c = gg(c, d, a, b, words[k + 3], 14, 4107603335);
      b = gg(b, c, d, a, words[k + 8], 20, 1163531501);
      a = gg(a, b, c, d, words[k + 13], 5, 2850285829);
      d = gg(d, a, b, c, words[k + 2], 9, 4243563512);
      c = gg(c, d, a, b, words[k + 7], 14, 1735328473);
      b = gg(b, c, d, a, words[k + 12], 20, 2368359562);
      a = hh(a, b, c, d, words[k + 5], 4, 4294588738);
      d = hh(d, a, b, c, words[k + 8], 11, 2272392833);
      c = hh(c, d, a, b, words[k + 11], 16, 1839030562);
      b = hh(b, c, d, a, words[k + 14], 23, 4259657740);
      a = hh(a, b, c, d, words[k + 1], 4, 2763975236);
      d = hh(d, a, b, c, words[k + 4], 11, 1272893353);
      c = hh(c, d, a, b, words[k + 7], 16, 4139469664);
      b = hh(b, c, d, a, words[k + 10], 23, 3200236656);
      a = hh(a, b, c, d, words[k + 13], 4, 681279174);
      d = hh(d, a, b, c, words[k], 11, 3936430074);
      c = hh(c, d, a, b, words[k + 3], 16, 3572445317);
      b = hh(b, c, d, a, words[k + 6], 23, 76029189);
      a = hh(a, b, c, d, words[k + 9], 4, 3654602809);
      d = hh(d, a, b, c, words[k + 12], 11, 3873151461);
      c = hh(c, d, a, b, words[k + 15], 16, 530742520);
      b = hh(b, c, d, a, words[k + 2], 23, 3299628645);
      a = ii(a, b, c, d, words[k], 6, 4096336452);
      d = ii(d, a, b, c, words[k + 7], 10, 1126891415);
      c = ii(c, d, a, b, words[k + 14], 15, 2878612391);
      b = ii(b, c, d, a, words[k + 5], 21, 4237533241);
      a = ii(a, b, c, d, words[k + 12], 6, 1700485571);
      d = ii(d, a, b, c, words[k + 3], 10, 2399980690);
      c = ii(c, d, a, b, words[k + 10], 15, 4293915773);
      b = ii(b, c, d, a, words[k + 1], 21, 2240044497);
      a = ii(a, b, c, d, words[k + 8], 6, 1873313359);
      d = ii(d, a, b, c, words[k + 15], 10, 4264355552);
      c = ii(c, d, a, b, words[k + 6], 15, 2734768916);
      b = ii(b, c, d, a, words[k + 13], 21, 1309151649);
      a = ii(a, b, c, d, words[k + 4], 6, 4149444226);
      d = ii(d, a, b, c, words[k + 11], 10, 3174756917);
      c = ii(c, d, a, b, words[k + 2], 15, 718787259);
      b = ii(b, c, d, a, words[k + 9], 21, 3951481745);
      a = addUnsigned(a, aa);
      b = addUnsigned(b, bb);
      c = addUnsigned(c, cc);
      d = addUnsigned(d, dd);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
  }
  function rotl(value, shift) {
    const normalizedShift = shift & 31;
    return value << normalizedShift | value >>> 32 - normalizedShift;
  }
  function p0(value) {
    return value ^ rotl(value, 9) ^ rotl(value, 17);
  }
  function p1(value) {
    return value ^ rotl(value, 15) ^ rotl(value, 23);
  }
  function sm3(input) {
    const inputLength = input.length;
    const paddedLength = Math.ceil((inputLength + 9) / 64) * 64;
    const message = new Uint8Array(paddedLength);
    message.set(input);
    message[inputLength] = 128;
    const bitLength = BigInt(inputLength) * 8n;
    for (let i2 = 0; i2 < 8; i2++) {
      message[paddedLength - 1 - i2] = Number(bitLength >> BigInt(i2 * 8) & 0xffn);
    }
    const dataView = new DataView(message.buffer);
    const state2 = new Uint32Array([
      1937774191,
      1226093241,
      388252375,
      3666478592,
      2842636476,
      372324522,
      3817729613,
      2969243214
    ]);
    const words = new Uint32Array(68);
    const expandedWords = new Uint32Array(64);
    for (let block = 0; block < message.length / 64; block++) {
      const start = block * 64;
      for (let i2 = 0; i2 < 16; i2++) {
        words[i2] = dataView.getUint32(start + i2 * 4, false);
      }
      for (let i2 = 16; i2 < 68; i2++) {
        words[i2] = p1(words[i2 - 16] ^ words[i2 - 9] ^ rotl(words[i2 - 3], 15)) ^ rotl(words[i2 - 13], 7) ^ words[i2 - 6];
      }
      for (let i2 = 0; i2 < 64; i2++) {
        expandedWords[i2] = words[i2] ^ words[i2 + 4];
      }
      let a = state2[0];
      let b = state2[1];
      let c = state2[2];
      let d = state2[3];
      let e = state2[4];
      let f2 = state2[5];
      let g2 = state2[6];
      let h2 = state2[7];
      for (let i2 = 0; i2 < 64; i2++) {
        const t = i2 <= 15 ? 2043430169 : 2055708042;
        const ss1 = rotl(rotl(a, 12) + e + rotl(t, i2), 7);
        const ss2 = ss1 ^ rotl(a, 12);
        const tt1 = (i2 <= 15 ? a ^ b ^ c : a & b | a & c | b & c) + d + ss2 + expandedWords[i2];
        const tt2 = (i2 <= 15 ? e ^ f2 ^ g2 : e & f2 | ~e & g2) + h2 + ss1 + words[i2];
        d = c;
        c = rotl(b, 9);
        b = a;
        a = tt1;
        h2 = g2;
        g2 = rotl(f2, 19);
        f2 = e;
        e = p0(tt2);
      }
      state2[0] = state2[0] ^ a;
      state2[1] = state2[1] ^ b;
      state2[2] = state2[2] ^ c;
      state2[3] = state2[3] ^ d;
      state2[4] = state2[4] ^ e;
      state2[5] = state2[5] ^ f2;
      state2[6] = state2[6] ^ g2;
      state2[7] = state2[7] ^ h2;
    }
    const result = new Uint8Array(32);
    for (let i2 = 0; i2 < state2.length; i2++) {
      const word = state2[i2];
      result[i2 * 4] = word >>> 24;
      result[i2 * 4 + 1] = word >>> 16;
      result[i2 * 4 + 2] = word >>> 8;
      result[i2 * 4 + 3] = word;
    }
    return result;
  }
  function getCrypto() {
    const c = globalThis.crypto ?? unsafeWindow.crypto;
    if (!(c == null ? void 0 : c.subtle)) {
      throw new Error("Crypto API不可用，请检查浏览器版本是否支持该API");
    }
    return c;
  }
  function getSubtle() {
    return getCrypto().subtle;
  }
  function b64decode(b64) {
    const binaryString = atob(b64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i2 = 0; i2 < len; i2++) {
      bytes[i2] = binaryString.charCodeAt(i2);
    }
    return bytes.buffer;
  }
  function b64encode(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 32768;
    const chunks = [];
    for (let i2 = 0; i2 < bytes.length; i2 += chunkSize) {
      chunks.push(
        String.fromCharCode(...bytes.subarray(i2, i2 + chunkSize))
      );
    }
    return btoa(chunks.join(""));
  }
  function unhex(hex2) {
    if (hex2.length % 2 !== 0) {
      throw new Error("Invalid hex string");
    }
    const bytes = new Uint8Array(hex2.length / 2);
    for (let i2 = 0; i2 < hex2.length; i2 += 2) {
      const byte = parseInt(hex2.slice(i2, i2 + 2), 16);
      if (Number.isNaN(byte)) {
        throw new Error("Invalid hex string");
      }
      bytes[i2 / 2] = byte;
    }
    return bytes.buffer;
  }
  function hex(buffer) {
    const bytes = new Uint8Array(buffer);
    let hexString = "";
    for (let i2 = 0; i2 < bytes.length; i2++) {
      hexString += bytes[i2].toString(16).padStart(2, "0");
    }
    return hexString;
  }
  function pkcs7Pad(data, blockSize = 16) {
    const padLength = blockSize - data.length % blockSize;
    const padded = new Uint8Array(data.length + padLength);
    padded.set(data);
    padded.fill(padLength, data.length);
    return padded;
  }
  function randomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const array = new Uint8Array(length);
    getCrypto().getRandomValues(array);
    for (let i2 = 0; i2 < length; i2++) {
      result += chars.charAt(array[i2] % chars.length);
    }
    return result;
  }
  function toBytes$1(input) {
    if (typeof input === "string") {
      return new TextEncoder().encode(input);
    }
    if (input instanceof Uint8Array) {
      return new Uint8Array(input);
    }
    return new Uint8Array(input);
  }
  const hash = {
    sha256: async (input) => {
      const subtle = getSubtle();
      const digest = await subtle.digest("SHA-256", toBytes$1(input));
      return hex(digest);
    },
    sha256bytes: async (input) => {
      const subtle = getSubtle();
      return subtle.digest("SHA-256", toBytes$1(input));
    },
    sha512: async (input) => {
      const subtle = getSubtle();
      const digest = await subtle.digest("SHA-512", toBytes$1(input));
      return hex(digest);
    },
    sha512bytes: async (input) => {
      const subtle = getSubtle();
      return subtle.digest("SHA-512", toBytes$1(input));
    },
    md5: async (input) => md5(
      typeof input === "string" ? input : toBytes$1(input).buffer
    ),
    md5bytes: async (input) => unhex(md5(
      typeof input === "string" ? input : toBytes$1(input).buffer
    )),
    sm3: async (input) => hex(sm3(toBytes$1(input)).buffer),
    sm3bytes: async (input) => sm3(toBytes$1(input)).buffer
  };
  const WIRE_VARINT = 0;
  const WIRE_BYTES = 2;
  const WIRE_FIXED32 = 5;
  class ProtobufWriter {
    constructor() {
      __publicField(this, "buf", []);
    }
    writeVarint(value) {
      let v = value >>> 0;
      while (v >= 128) {
        this.buf.push(v & 127 | 128);
        v >>>= 7;
      }
      this.buf.push(v & 127);
      return this;
    }
    writeKey(fieldNumber, wireType) {
      return this.writeVarint(fieldNumber << 3 | wireType);
    }
    varint(fieldNumber, value) {
      return this.writeKey(fieldNumber, WIRE_VARINT).writeVarint(value);
    }
    fixed32(fieldNumber, value) {
      this.writeKey(fieldNumber, WIRE_FIXED32);
      const v = value >>> 0;
      this.buf.push(v & 255, v >>> 8 & 255, v >>> 16 & 255, v >>> 24 & 255);
      return this;
    }
    bytes(fieldNumber, data) {
      this.writeKey(fieldNumber, WIRE_BYTES).writeVarint(data.length);
      for (let i2 = 0; i2 < data.length; i2++) {
        this.buf.push(data[i2] & 255);
      }
      return this;
    }
    string(fieldNumber, value) {
      return this.bytes(fieldNumber, new TextEncoder().encode(value));
    }
    message(fieldNumber, build) {
      const sub = new ProtobufWriter();
      build(sub);
      return this.bytes(fieldNumber, sub.toBytes());
    }
    toBytes() {
      return Uint8Array.from(this.buf);
    }
  }
  const ROUNDS$1 = 72;
  const MASK64$1 = 0xffffffffffffffffn;
  const Z4 = 0x3dc94c3a046d678bn;
  function getBit(value, position) {
    return value >> BigInt(position) & 1n;
  }
  function rotateLeft64(v, n) {
    return (v << n | v >> 64n - n) & MASK64$1;
  }
  function rotateRight64(v, n) {
    return (v << 64n - n | v >> n) & MASK64$1;
  }
  function keyExpansion(key) {
    const k = [key[0] & MASK64$1, key[1] & MASK64$1, key[2] & MASK64$1, key[3] & MASK64$1];
    for (let i2 = 4; i2 < ROUNDS$1; i2++) {
      let tmp = rotateRight64(k[i2 - 1], 3n);
      tmp ^= k[i2 - 3];
      tmp ^= rotateRight64(tmp, 1n);
      k.push((~k[i2 - 4] ^ tmp ^ getBit(Z4, (i2 - 4) % 62) ^ 3n) & MASK64$1);
    }
    return k;
  }
  function simonEncrypt(plaintext, key) {
    const k = keyExpansion(key);
    let x = plaintext[0] & MASK64$1;
    let y = plaintext[1] & MASK64$1;
    for (let i2 = 0; i2 < ROUNDS$1; i2++) {
      const tmp = y;
      const f2 = rotateLeft64(y, 1n) & rotateLeft64(y, 8n);
      y = (x ^ f2 ^ rotateLeft64(y, 2n) ^ k[i2]) & MASK64$1;
      x = tmp;
    }
    return [x, y];
  }
  const LOW_RAND = new Uint8Array([242, 129]);
  const HIGH_RAND = new Uint8Array([97, 111]);
  const XOR_PREFIX = new Uint8Array([242, 247, 252, 255, 242, 247, 252, 255]);
  function sm3Prefix6(data) {
    return sm3(data).slice(0, 6);
  }
  function decodeStub(xssStub) {
    const bytes = new Uint8Array(16);
    if (xssStub.length >= 32) {
      for (let i2 = 0; i2 < 16; i2++) {
        bytes[i2] = parseInt(xssStub.slice(i2 * 2, i2 * 2 + 2), 16) & 255;
      }
    }
    return bytes;
  }
  function buildProtobuf(query, xssStub, timestamp, config2) {
    const params = new URLSearchParams(query);
    const deviceId = params.get("device_id") ?? "";
    const versionName = params.get("version_name") ?? "";
    const bodyHash = sm3Prefix6(xssStub === "" ? new Uint8Array(16) : decodeStub(xssStub));
    const queryHash = sm3Prefix6(
      query === "" ? new Uint8Array(16) : new TextEncoder().encode(query)
    );
    const rand = getCrypto().getRandomValues(new Uint32Array(1))[0] % 2147483647;
    return new ProtobufWriter().varint(1, 538970409 * 2).varint(2, 2).varint(3, rand).string(4, config2.aid).string(5, deviceId).string(6, config2.licenseId).string(7, versionName).string(8, config2.sdkVersion).varint(9, config2.sdkVersionInt).bytes(10, new Uint8Array(8)).varint(11, 0).varint(12, timestamp * 2).bytes(13, bodyHash).bytes(14, queryHash).message(15, (sub) => {
      sub.varint(1, 1).varint(2, 1).varint(3, 1).varint(7, 3348294860);
    }).string(16, "").string(20, "none").varint(21, config2.callType).message(23, (sub) => {
      sub.string(1, "NX551J").varint(2, 8196).varint(4, 2162219008);
    }).varint(25, 2).toBytes();
  }
  async function getArgus(query, xssStub, timestamp, config2) {
    const { signKey } = config2;
    if (signKey.length !== 32) {
      throw new Error(`Sign key must be 32 bytes, got ${signKey.length}`);
    }
    const protobuf = pkcs7Pad(buildProtobuf(query, xssStub, timestamp, config2), 16);
    const sm3Input = new Uint8Array(signKey.length * 2 + LOW_RAND.length + HIGH_RAND.length);
    sm3Input.set(signKey, 0);
    sm3Input.set(LOW_RAND, signKey.length);
    sm3Input.set(HIGH_RAND, signKey.length + LOW_RAND.length);
    sm3Input.set(signKey, signKey.length + LOW_RAND.length + HIGH_RAND.length);
    const sm3Output = sm3(sm3Input);
    const keyView = new DataView(sm3Output.buffer, sm3Output.byteOffset, sm3Output.byteLength);
    const simonKey = [
      keyView.getBigUint64(0, true),
      keyView.getBigUint64(8, true),
      keyView.getBigUint64(16, true),
      keyView.getBigUint64(24, true)
    ];
    const encrypted = new Uint8Array(protobuf.length);
    const pbView = new DataView(protobuf.buffer, protobuf.byteOffset, protobuf.byteLength);
    const encView = new DataView(encrypted.buffer);
    for (let offset = 0; offset < protobuf.length; offset += 16) {
      const [low, high] = simonEncrypt(
        [pbView.getBigUint64(offset, true), pbView.getBigUint64(offset + 8, true)],
        simonKey
      );
      encView.setBigUint64(offset, low, true);
      encView.setBigUint64(offset + 8, high, true);
    }
    const data = new Uint8Array(XOR_PREFIX.length + encrypted.length);
    data.set(XOR_PREFIX);
    data.set(encrypted, XOR_PREFIX.length);
    for (let i2 = XOR_PREFIX.length; i2 < data.length; i2++) {
      data[i2] ^= data[i2 % 8];
    }
    data.reverse();
    const header = new Uint8Array([166, 110, 173, 159, 119, 1, 208, 12, 24]);
    const plaintext = new Uint8Array(header.length + data.length + HIGH_RAND.length);
    plaintext.set(header);
    plaintext.set(data, header.length);
    plaintext.set(HIGH_RAND, header.length + data.length);
    const subtle = getSubtle();
    const aesKey = await subtle.importKey(
      "raw",
      new Uint8Array(await hash.md5bytes(signKey.slice(0, 16))),
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );
    const iv = new Uint8Array(await hash.md5bytes(signKey.slice(16)));
    const ciphertext = new Uint8Array(
      await subtle.encrypt({ name: "AES-CBC", iv }, aesKey, plaintext)
    );
    const result = new Uint8Array(LOW_RAND.length + ciphertext.length);
    result.set(LOW_RAND);
    result.set(ciphertext, LOW_RAND.length);
    return b64encode(result.buffer);
  }
  const ROUNDS = 34;
  const MASK64 = 0xffffffffffffffffn;
  const WORD_SIZE = 64n;
  const ALPHA = 8n;
  const BETA = 3n;
  function readUint64LE(view, offset) {
    return view.getBigUint64(offset, true);
  }
  function keySchedule(key) {
    const view = new DataView(key.buffer, key.byteOffset, key.byteLength);
    const ks = [readUint64LE(view, 0) & MASK64];
    const numWords = key.length * 8 / Number(WORD_SIZE);
    const ls = [];
    for (let i2 = 1; i2 < numWords; i2++) {
      ls.push(readUint64LE(view, i2 * 8) & MASK64);
    }
    for (let x = 0; x < ROUNDS - 1; x++) {
      const rsX = (ls[x] << WORD_SIZE - ALPHA) + (ls[x] >> ALPHA) & MASK64;
      const addSxy = rsX + ks[x] & MASK64;
      const newX = BigInt(x) ^ addSxy;
      const lsY = (ks[x] >> WORD_SIZE - BETA) + (ks[x] << BETA) & MASK64;
      ls.push(newX);
      ks.push(newX ^ lsY);
    }
    return ks;
  }
  function encryptBlock(ks, block, out, outOffset) {
    const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
    let y = readUint64LE(view, 0);
    let x = readUint64LE(view, 8);
    for (const k of ks) {
      const rsX = (x << WORD_SIZE - ALPHA) + (x >> ALPHA) & MASK64;
      const addSxy = rsX + y & MASK64;
      x = k ^ addSxy;
      const lsY = (y >> WORD_SIZE - BETA) + (y << BETA) & MASK64;
      y = x ^ lsY;
    }
    const outView = new DataView(out.buffer, out.byteOffset, out.byteLength);
    outView.setBigUint64(outOffset, y & MASK64, true);
    outView.setBigUint64(outOffset + 8, x & MASK64, true);
  }
  function speckEncrypt(key, plaintext) {
    if (key.length !== 32) {
      throw new Error(`Speck key must be 32 bytes, got ${key.length}`);
    }
    const padded = pkcs7Pad(plaintext, 16);
    const ks = keySchedule(key);
    const out = new Uint8Array(padded.length);
    for (let i2 = 0; i2 < padded.length; i2 += 16) {
      encryptBlock(ks, padded.subarray(i2, i2 + 16), out, i2);
    }
    return out;
  }
  async function generateLadonKey(randomBytes, aid) {
    const aidBytes = new TextEncoder().encode(aid);
    const input = new Uint8Array(randomBytes.length + aidBytes.length);
    input.set(randomBytes);
    input.set(aidBytes, randomBytes.length);
    const hex2 = await hash.md5(input);
    return new TextEncoder().encode(hex2);
  }
  async function getLadon(timestamp, config2) {
    const randomBytes = getCrypto().getRandomValues(new Uint8Array(4));
    const plaintext = new TextEncoder().encode(
      `${timestamp}-${config2.licenseId}-${config2.aid}`
    );
    const key = await generateLadonKey(randomBytes, config2.aid);
    const encrypted = speckEncrypt(key, plaintext);
    const result = new Uint8Array(randomBytes.length + encrypted.length);
    result.set(randomBytes);
    result.set(encrypted, randomBytes.length);
    return b64encode(result.buffer);
  }
  const defaultUnidbgConfig = {
    signKey: new Uint8Array(
      unhex("ac1adaae95a7af94a5114ab3b3a97dd80050aa0a39314c40528caec95256c28c")
    ),
    aid: "1967",
    licenseId: "1611921764",
    sdkVersion: "v04.04.05-ov-android",
    sdkVersionInt: 134744640,
    callType: 738
  };
  async function generateHeaders(rawQuery, xssStub = "", timestamp = Math.floor(Date.now() / 1e3), config2 = defaultUnidbgConfig) {
    const [argus, ladon] = await Promise.all([
      getArgus(rawQuery, xssStub, timestamp, config2),
      getLadon(timestamp, config2)
    ]);
    return {
      "x-argus": argus,
      "x-ladon": ladon,
      "x-khronos": String(timestamp)
    };
  }
  async function signRequest(url, body, config2 = defaultUnidbgConfig) {
    const rawQuery = new URL(url).search.replace(/^\?/, "");
    const hasBody = typeof body === "string" ? body.length > 0 : ((body == null ? void 0 : body.byteLength) ?? 0) > 0;
    const xssStub = hasBody ? await hash.md5(body) : "";
    const now = Date.now();
    const headers = await generateHeaders(
      rawQuery,
      xssStub,
      Math.floor(now / 1e3),
      config2
    );
    headers["x-ss-req-ticket"] = String(now);
    if (hasBody) {
      headers["X-SS-STUB"] = xssStub;
    }
    return headers;
  }
  async function gzip(data) {
    if (typeof data === "string") {
      data = new TextEncoder().encode(data).buffer;
    }
    const encoder = new CompressionStream("gzip");
    const stream = new Blob([data]).stream().pipeThrough(encoder);
    const compressed = new Response(stream).arrayBuffer();
    return compressed;
  }
  async function gunzip(data) {
    const decoder = new DecompressionStream("gzip");
    const stream = new Blob([data]).stream().pipeThrough(decoder);
    const decompressed = new Response(stream).arrayBuffer();
    return decompressed;
  }
  const FIXED_STRING = b64decode(
    "TdTC5rgxYgkOUrPHpnM7pByyRiuCmrWKGWs521cXdST0m69/COjWjSanLjfBqVovHwWlGJKu8pSXMrYqOKrdWA=="
  );
  async function encrypt(data) {
    const crypto = getCrypto();
    const subtle = getSubtle();
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const hashValue = await hash.sha512bytes(
      concatArrayBuffers(await hash.sha512bytes(randomBytes), FIXED_STRING)
    );
    const k = hashValue.slice(0, 16);
    const iv = new Uint8Array(hashValue.slice(16, 32));
    const compressedData = await gzip(data);
    const hashedData = concatArrayBuffers(
      await hash.sha512bytes(compressedData),
      compressedData
    );
    const key = await subtle.importKey("raw", new Uint8Array(k), { name: "AES-CBC", length: 128 }, false, ["encrypt"]);
    const encryptedData = await subtle.encrypt({ name: "AES-CBC", iv }, key, hashedData);
    return concatArrayBuffers(
      new Uint8Array([116, 99, 5, 16, 0, 0]).buffer,
      randomBytes.buffer,
      encryptedData
    );
  }
  const ANDROID_VERSIONS = [
    { version: "9", api: 29 },
    { version: "10", api: 30 },
    { version: "11", api: 31 },
    { version: "12", api: 32 },
    { version: "13", api: 33 },
    { version: "14", api: 34 }
  ];
  const DEVICE_MODELS = [
    "RMX1931",
    "MI8",
    "Honor10",
    "P30",
    "V1921A",
    "Redmi Note 7",
    "Redmi K20 Pro",
    "MI 9",
    "Mi 10 Pro",
    "SM-G9750",
    "Pixel 6",
    "HD1910",
    "M2011K2C",
    "LIO-AN00",
    "VOG-TL00",
    "PCLM10",
    "GM1900",
    "Pixel 7 Pro",
    "Pixel 6a",
    "SM-N9760",
    "POCO F1"
  ];
  const DEVICE_BRANDS = [
    "realme",
    "Xiaomi",
    "Huawei",
    "OPPO",
    "vivo",
    "samsung",
    "OnePlus",
    "google",
    "Redmi",
    "HONOR",
    "motorola",
    "POCO"
  ];
  const HEX_LOW = "0123456789abcdef";
  const deviceValue = {
    aid: "1967",
    appName: "novelapp",
    channel: "0",
    platform: "android",
    osVersion: "0",
    versionCode: {
      str: "6.3.9.32",
      val: "63932"
    }
  };
  function randomInt(max) {
    return getCrypto().getRandomValues(new Uint32Array(1))[0] % max;
  }
  function randomItem(list) {
    return list[randomInt(list.length)];
  }
  function randomHex(k) {
    if (k <= 0) return "";
    const bytes = getCrypto().getRandomValues(new Uint8Array(k));
    let result = "";
    for (let i2 = 0; i2 < k; i2++) {
      result += HEX_LOW[bytes[i2] % 16];
    }
    return result;
  }
  function uuid() {
    const c = getCrypto();
    if (typeof c.randomUUID === "function") {
      return c.randomUUID();
    }
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = b[6] & 15 | 64;
    b[8] = b[8] & 63 | 128;
    const h2 = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
    return `${h2.slice(0, 8)}-${h2.slice(8, 12)}-${h2.slice(12, 16)}-${h2.slice(16, 20)}-${h2.slice(20)}`;
  }
  function ipv6LinkLocal() {
    return "::1";
  }
  function ipv6UniqueLocal() {
    const x = randomInt(1 << 8);
    let result = `fd${HEX_LOW[x >> 4]}${HEX_LOW[x & 15]}`;
    for (let i2 = 0; i2 < 7; i2++) {
      const v = randomInt(1 << 16);
      result += ":" + HEX_LOW[v >> 12 & 15] + HEX_LOW[v >> 8 & 15] + HEX_LOW[v >> 4 & 15] + HEX_LOW[v & 15];
    }
    return result;
  }
  function generateRequestBody() {
    const osInfo = randomItem(ANDROID_VERSIONS);
    const deviceBrand = randomItem(DEVICE_BRANDS);
    const genTime = Date.now();
    const romVersion = "coloros__" + randomHex(4).toUpperCase() + "." + String(randomInt(1e6)).padStart(6, "0") + "." + String(randomInt(1e8)).padStart(8, "0") + " release-keys";
    return {
      magic_tag: "ss_app_log",
      header: {
        display_name: "番茄免费小说",
        aid: 1967,
        channel: "43536163a",
        package: "com.dragon.read",
        sdk_version: "3.7.0-rc.25-fanqie-xiaoshuo",
        sdk_target_version: 29,
        git_hash: "711d1a7",
        density_dpi: 240,
        display_density: "hdpi",
        resolution: "720x1280",
        language: "zh",
        timezone: 8,
        access: "wifi",
        not_request_sender: 0,
        carrier: "CHINA MOBILE",
        mcc_mnc: "46000",
        region: "CN",
        tz_name: "Asia/Shanghai",
        tz_offset: 28800,
        sim_region: "cn",
        sim_serial_number: [],
        oaid_may_support: false,
        device_platform: "android",
        custom: { host_bit: 32, dragon_device_type: 0 },
        pre_installed_channel: "",
        is_system_app: 0,
        sdk_flavor: "china",
        guest_mode: 0,
        // 设备硬件与系统信息
        os: "Android",
        os_version: osInfo.version,
        os_api: osInfo.api,
        device_model: randomItem(DEVICE_MODELS),
        device_brand: deviceBrand,
        device_manufacturer: deviceBrand,
        cpu_abi: "arm64-v8a",
        release_build: randomHex(7),
        cdid: uuid(),
        sig_hash: "a4a27c2633195374c15651ffc3c4a497",
        openudid: randomHex(20),
        clientudid: uuid(),
        req_id: uuid(),
        // 可选字段
        rom: randomHex(14).toUpperCase(),
        rom_version: romVersion,
        apk_first_install_time: genTime - randomInt(365) * 864e5,
        ipv6_list: [
          { type: "client_anpi", value: ipv6LinkLocal() },
          { type: "client_anpi", value: ipv6UniqueLocal() },
          { type: "client_anpi", value: ipv6UniqueLocal() }
        ]
      },
      _gen_time: genTime
    };
  }
  const REGISTER_URL = "https://i.snssdk.com/service/2/device_register/?tt_data=a";
  const READING_BASE = "https://reading.snssdk.com";
  const USER_AGENT = "com.dragon.read";
  const APP_REQUEST = { credentials: "omit" };
  function buildQuery(device, versionCode, extra) {
    return new URLSearchParams({
      device_id: device.device_id,
      iid: device.install_id,
      device_type: device.device_type,
      aid: deviceValue.aid,
      app_name: deviceValue.appName,
      channel: deviceValue.channel,
      device_platform: deviceValue.platform,
      os_version: deviceValue.osVersion,
      version_code: versionCode,
      ...extra
    });
  }
  async function registerDevice() {
    const body = generateRequestBody();
    const encrypted = await encrypt(
      new TextEncoder().encode(JSON.stringify(body)).buffer
    );
    const res = await apiFetch(REGISTER_URL, {
      ...APP_REQUEST,
      method: "POST",
      headers: {
        "User-Agent": "okhttp/4.10.0",
        "Content-Type": "application/octet-stream; tt-data=a"
      },
      body: encrypted
    });
    if (res.status !== 200) {
      throw new Error(`设备注册失败: HTTP ${res.status} ${res.statusText}`);
    }
    const json = res.json();
    if (!(json == null ? void 0 : json.device_id) || !json.device_id_str || !json.install_id_str) {
      throw new Error(`设备注册失败: device_id 无效, 响应=${res.responseText}`);
    }
    const device = {
      device_id: json.device_id_str,
      install_id: json.install_id_str,
      device_type: body.header.device_model
    };
    console.log("设备注册成功！", device);
    return device;
  }
  async function activatePremium(device) {
    var _a;
    const url = `${READING_BASE}/reading/user/privilege/add/v?` + buildQuery(device, deviceValue.versionCode.val, {
      manifest_version_code: deviceValue.versionCode.val,
      update_version_code: deviceValue.versionCode.val
    }).toString();
    const body = `{"add_count_daily":0,"amount":2592000,"privilege_id":7210376203117531962,"from":8,"unique_key":"${Date.now()}"}`;
    try {
      const headers = await signRequest(url, body);
      const res = await apiFetch(url, {
        ...APP_REQUEST,
        method: "POST",
        headers: {
          ...headers,
          "User-Agent": USER_AGENT,
          "Content-Type": "application/json; charset=utf-8"
        },
        body
      });
      const json = res.json();
      if ((json == null ? void 0 : json.code) !== 0) {
        console.warn("设备会员激活失败:", res.responseText);
        return "";
      }
      const expireTime = ((_a = json.data) == null ? void 0 : _a.expire_time) ?? "";
      console.log("设备会员已成功激活！过期时间:", expireTime);
      return expireTime;
    } catch (e) {
      console.warn("设备会员激活失败:", e);
      return "";
    }
  }
  async function registerKey(device) {
    var _a, _b;
    const url = `${READING_BASE}/reading/crypt/registerkey?` + buildQuery(device, deviceValue.versionCode.str).toString();
    const idBytes = new Uint8Array(16);
    let id = BigInt(device.device_id);
    for (let i2 = 15; i2 >= 0; i2--) {
      idBytes[i2] = Number(id & 0xffn);
      id >>= 8n;
    }
    idBytes.reverse();
    const subtle = getSubtle();
    const iv = getCrypto().getRandomValues(new Uint8Array(16));
    const key = await subtle.importKey("raw", new Uint8Array(shared_key), { name: "AES-CBC" }, false, ["encrypt"]);
    const encrypted = new Uint8Array(
      await subtle.encrypt({ name: "AES-CBC", iv }, key, idBytes)
    );
    const content = new Uint8Array(iv.length + encrypted.length);
    content.set(iv);
    content.set(encrypted, iv.length);
    const plainBody = JSON.stringify({ content: b64encode(content.buffer) });
    const gzipped = await gzip(plainBody);
    const headers = await signRequest(url, gzipped);
    const res = await apiFetch(url, {
      ...APP_REQUEST,
      method: "POST",
      headers: {
        ...headers,
        "User-Agent": USER_AGENT,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Encoding": "gzip"
      },
      body: gzipped
    });
    if (res.status !== 200) {
      throw new Error(`密钥注册失败: HTTP ${res.status} ${res.statusText}`);
    }
    const json = res.json();
    const encryptedKey = (_a = json == null ? void 0 : json.data) == null ? void 0 : _a.key;
    if (!encryptedKey) {
      throw new Error(`密钥注册失败: 响应缺少 key, 响应=${res.responseText}`);
    }
    const buf = b64decode(encryptedKey);
    const decryptKey = await subtle.importKey(
      "raw",
      new Uint8Array(shared_key),
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    const finalKey = await subtle.decrypt(
      { name: "AES-CBC", iv: buf.slice(0, 16) },
      decryptKey,
      buf.slice(16)
    );
    const keyInfo = { key: finalKey, keyver: (_b = json.data) == null ? void 0 : _b.keyver };
    console.log("密钥获取成功，版本:", keyInfo.keyver, "key:", hex(finalKey));
    return keyInfo;
  }
  const STORAGE_KEY = "fqa.diagnostic_log";
  const MAX_ENTRIES = 200;
  const PERSIST_DEBOUNCE_MS = 500;
  let ringBuffer = [];
  const listeners$1 = /* @__PURE__ */ new Set();
  let persistTimer = null;
  let initialized = false;
  function load() {
    try {
      const raw = GM_getValue(STORAGE_KEY, "[]");
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.slice(-MAX_ENTRIES);
    } catch {
      return [];
    }
  }
  function persist() {
    try {
      GM_setValue(STORAGE_KEY, JSON.stringify(ringBuffer));
    } catch (e) {
      console.warn("[fqa:logger] persist failed:", e);
    }
  }
  function schedulePersist() {
    if (persistTimer) return;
    persistTimer = setTimeout(() => {
      persistTimer = null;
      persist();
    }, PERSIST_DEBOUNCE_MS);
  }
  function notify$1() {
    listeners$1.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn("[fqa:logger] listener error:", e);
      }
    });
  }
  function initLogger() {
    if (initialized) return;
    ringBuffer = load();
    initialized = true;
    info("logger", `日志系统就绪（历史 ${ringBuffer.length} 条）`);
  }
  function log(level, category, message, meta) {
    const entry = meta ? { ts: Date.now(), level, category, message, meta } : { ts: Date.now(), level, category, message };
    ringBuffer.push(entry);
    if (ringBuffer.length > MAX_ENTRIES) {
      ringBuffer = ringBuffer.slice(-MAX_ENTRIES);
    }
    const tag = `[fqa:${category}]`;
    switch (level) {
      case "error":
        console.error(tag, message, meta ?? "");
        break;
      case "warn":
        console.warn(tag, message, meta ?? "");
        break;
      case "info":
        console.info(tag, message, meta ?? "");
        break;
      default:
        console.debug(tag, message, meta ?? "");
    }
    notify$1();
    schedulePersist();
  }
  const debug = (category, message, meta) => log("debug", category, message, meta);
  const info = (category, message, meta) => log("info", category, message, meta);
  const warn = (category, message, meta) => log("warn", category, message, meta);
  const error = (category, message, meta) => log("error", category, message, meta);
  function getLog() {
    return ringBuffer.slice();
  }
  function clearLog() {
    ringBuffer = [];
    persist();
    notify$1();
    info("logger", "诊断日志已清空");
  }
  function subscribe$1(fn) {
    listeners$1.add(fn);
    return () => {
      listeners$1.delete(fn);
    };
  }
  function exportLogText() {
    const lines = [];
    for (const e of ringBuffer) {
      const t = new Date(e.ts).toISOString().slice(11, 23);
      const tag = e.level.toUpperCase().padEnd(5);
      lines.push(`${t} [${tag}] [${e.category}] ${e.message}`);
      if (e.meta) {
        for (const [k, v] of Object.entries(e.meta)) {
          lines.push(`         ${k} = ${typeof v === "string" ? v : JSON.stringify(v)}`);
        }
      }
    }
    return lines.join("\n");
  }
  const POOL_STORAGE_KEY = "fqa.device_pool.v1";
  const POOL_SIZE = 3;
  const FAILURE_THRESHOLD = 2;
  const REFILL_COOLDOWN_MS = 24 * 60 * 60 * 1e3;
  const STAGGER_REGISTER_MS = [0, 1e4, 3e4];
  const AUTO_RESET_DELAY_MS = 5 * 60 * 1e3;
  const AUTO_RESET_THROTTLE_MS = 24 * 60 * 60 * 1e3;
  const AUTO_RESET_PLAN_KEY = "fqa.auto_reset_plan.v1";
  const EMPTY_POOL = {
    slots: [],
    activeIndex: 0
  };
  const listeners = /* @__PURE__ */ new Set();
  let autoResetPlan = null;
  let autoResetCancelListeners = /* @__PURE__ */ new Set();
  let autoResetExecuteListeners = /* @__PURE__ */ new Set();
  function loadPool() {
    const raw = read(POOL_STORAGE_KEY);
    if (!raw || !Array.isArray(raw.slots)) return structuredClone(EMPTY_POOL);
    return raw;
  }
  function savePool(p) {
    write(POOL_STORAGE_KEY, p);
  }
  function notify() {
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn("[fqa:pool] listener error:", e);
      }
    });
  }
  async function initPool() {
    var _a;
    const { deviceId, installId } = settings;
    if (deviceId.trim() && installId.trim()) {
      info("pool", "手填设备模式，跳过池子初始化");
      await ensureSingleDeviceFromSettings();
      return;
    }
    let pool = loadPool();
    if (pool.slots.length === 0) {
      info("pool", "池子为空，开始首次注册…");
      const slot0 = await provisionSingleSlot();
      if (!slot0) {
        warn("pool", "首槽注册失败，回退到内置匿名设备");
        _config.currentConfig = defaultConfig;
        return;
      }
      pool = {
        slots: [slot0],
        activeIndex: 0
      };
      savePool(pool);
      scheduleBackgroundFills();
    } else {
      info("pool", `复用池子（${pool.slots.length} 个槽位）`, {
        activeIndex: pool.activeIndex,
        healthy: pool.slots.filter((s) => s.health === "healthy").length
      });
    }
    pushActiveToConfig(pool);
    if (((_a = getActiveSlot(pool)) == null ? void 0 : _a.health) === "dead") {
      const next = findHealthySlotIndex(pool, pool.activeIndex);
      if (next !== -1) {
        info("pool", `当前槽位 dead,自动切换到槽 ${next}`);
        pool.activeIndex = next;
        savePool(pool);
        pushActiveToConfig(pool);
      } else {
        warn("pool", "当前槽位 dead 且无备用槽位,请手动补员");
        detectAllDeadAndSchedule();
      }
    } else if (pool.slots.every((s) => s.health === "dead")) {
      warn("pool", "所有槽位 dead, 调度自动 reset");
      detectAllDeadAndSchedule();
    }
    notify();
  }
  async function ensureSingleDeviceFromSettings() {
    const cached = read("device");
    if (cached) {
      _config.currentConfig = cached;
      return;
    }
    try {
      const dev = await registerDevice();
      const vip = await activatePremium(dev);
      const keyInfo = await registerKey(dev);
      const c = {
        device_id: dev.device_id,
        install_id: dev.install_id,
        device_type: dev.device_type,
        key_info: keyInfo
      };
      _config.currentConfig = c;
      write("device", c);
      write("keyinfo", { key: b64encode(keyInfo.key), keyver: keyInfo.keyver });
      info("pool", "手填模式注册新设备完成", { device_id: c.device_id });
      if (vip) debug("pool", `VIP 到期 ${vip}`);
    } catch (e) {
      warn("pool", "手填模式注册失败", { error: String(e) });
      _config.currentConfig = defaultConfig;
    }
  }
  function scheduleBackgroundFills(_pool) {
    for (let i2 = 1; i2 < POOL_SIZE; i2++) {
      const delay = STAGGER_REGISTER_MS[i2] ?? i2 * 3e4;
      setTimeout(() => {
        void fillSlotIfEmpty(i2);
      }, delay);
    }
  }
  async function fillSlotIfEmpty(index) {
    const pool = loadPool();
    if (pool.slots.length > index && pool.slots[index]) {
      debug("pool", `槽 ${index} 已有设备，跳过`);
      return;
    }
    info("pool", `开始填充槽 ${index}…`);
    const slot = await provisionSingleSlot();
    if (!slot) {
      warn("pool", `槽 ${index} 注册失败`);
      return;
    }
    const newPool = {
      slots: [...pool.slots],
      activeIndex: pool.activeIndex
    };
    while (newPool.slots.length <= index) {
      newPool.slots.push(slot);
    }
    newPool.slots[index] = slot;
    savePool(newPool);
    notify();
    info("pool", `槽 ${index} 已填充`, { device_id: slot.device_id });
  }
  async function provisionSingleSlot() {
    try {
      const dev = await registerDevice();
      const vip = await activatePremium(dev);
      const keyInfo = await registerKey(dev);
      return {
        index: 0,
        // 后续会被填到正确位置
        device_id: dev.device_id,
        install_id: dev.install_id,
        device_type: dev.device_type,
        key_info: keyInfo,
        vip_expire_time: vip || void 0,
        health: "healthy",
        failureStreak: 0,
        lastFailureAt: 0,
        registeredAt: Date.now(),
        lastSuccessAt: 0,
        refillCooldownUntil: 0
      };
    } catch (e) {
      error("pool", "provisionSingleSlot 失败", { error: String(e) });
      return null;
    }
  }
  function pushActiveToConfig(pool) {
    const slot = getActiveSlot(pool);
    if (!slot) return;
    _config.currentConfig = {
      device_id: slot.device_id,
      install_id: slot.install_id,
      device_type: slot.device_type,
      key_info: slot.key_info
    };
    if (slot.key_info) {
      write("keyinfo", { key: b64encode(slot.key_info.key), keyver: slot.key_info.keyver });
    }
  }
  function getActiveSlot(pool) {
    return pool.slots[pool.activeIndex];
  }
  function findHealthySlotIndex(pool, fromIndex) {
    var _a;
    if (pool.slots.length === 0) return -1;
    for (let offset = 1; offset <= pool.slots.length; offset++) {
      const idx = (fromIndex + offset) % pool.slots.length;
      if (((_a = pool.slots[idx]) == null ? void 0 : _a.health) === "healthy") return idx;
    }
    return -1;
  }
  function recordSuccess() {
    const pool = loadPool();
    const slot = getActiveSlot(pool);
    if (!slot) return;
    if (slot.failureStreak !== 0 || slot.lastSuccessAt === 0) {
      slot.failureStreak = 0;
      slot.lastSuccessAt = Date.now();
      savePool(pool);
      notify();
    }
  }
  function recordFailure() {
    const pool = loadPool();
    const slot = getActiveSlot(pool);
    if (!slot) return { switched: false, reason: "no active slot" };
    slot.failureStreak += 1;
    slot.lastFailureAt = Date.now();
    if (slot.failureStreak < FAILURE_THRESHOLD) {
      savePool(pool);
      notify();
      return {
        switched: false,
        reason: `失败 ${slot.failureStreak}/${FAILURE_THRESHOLD}，未触发切换`
      };
    }
    slot.health = "dead";
    slot.refillCooldownUntil = Date.now() + REFILL_COOLDOWN_MS;
    info("pool", `槽 ${pool.activeIndex} 已标记 dead`, {
      device_id: slot.device_id,
      failureStreak: slot.failureStreak
    });
    const next = findHealthySlotIndex(pool, pool.activeIndex);
    if (next === -1) {
      savePool(pool);
      notify();
      warn("pool", "无可用 healthy 槽位，池子空了");
      detectAllDeadAndSchedule();
      return { switched: false, reason: "no healthy slot available" };
    }
    pool.activeIndex = next;
    savePool(pool);
    pushActiveToConfig(pool);
    notify();
    const nextSlot = pool.slots[next];
    info("pool", `已切换到槽 ${next}`, { device_id: (nextSlot == null ? void 0 : nextSlot.device_id) ?? "unknown" });
    return { switched: true, reason: `auto-switched to slot ${next}` };
  }
  function manualSwitch(toIndex) {
    const pool = loadPool();
    if (toIndex < 0 || toIndex >= pool.slots.length) {
      return { ok: false, reason: `槽 ${toIndex} 不存在` };
    }
    const target = pool.slots[toIndex];
    if (!target) return { ok: false, reason: `槽 ${toIndex} 为空` };
    if (target.health === "dead") {
      return { ok: false, reason: `槽 ${toIndex} 已 dead，请先补员` };
    }
    pool.activeIndex = toIndex;
    target.failureStreak = 0;
    savePool(pool);
    pushActiveToConfig(pool);
    notify();
    info("pool", `手动切换到槽 ${toIndex}`, { device_id: target.device_id });
    return { ok: true };
  }
  async function manualRefill(index) {
    const pool = loadPool();
    if (index < 0 || index >= POOL_SIZE) {
      return { ok: false, reason: `槽 ${index} 不存在（池容量 ${POOL_SIZE}）` };
    }
    if (index >= pool.slots.length) {
      return { ok: false, reason: `槽 ${index} 尚未注册，无法补员` };
    }
    const slot = pool.slots[index];
    if (!slot) return { ok: false, reason: `槽 ${index} 为空` };
    if (slot.health === "healthy") {
      return { ok: false, reason: `槽 ${index} 健康，不需要补员` };
    }
    if (slot.refillCooldownUntil > Date.now()) {
      const remain = Math.ceil((slot.refillCooldownUntil - Date.now()) / 1e3 / 60);
      return { ok: false, reason: `槽 ${index} 补员冷却中，还剩 ${remain} 分钟` };
    }
    info("pool", `开始手动补员槽 ${index}…`);
    const newSlot = await provisionSingleSlot();
    if (!newSlot) {
      return { ok: false, reason: "新设备注册失败，请查看诊断" };
    }
    newSlot.index = index;
    pool.slots[index] = newSlot;
    if (pool.activeIndex === index) {
      pushActiveToConfig(pool);
    }
    savePool(pool);
    notify();
    info("pool", `槽 ${index} 补员完成`, { device_id: newSlot.device_id });
    return { ok: true };
  }
  function getPoolState() {
    return loadPool();
  }
  async function resetPool() {
    info("pool", "正在重置整个设备池…");
    if (autoResetPlan == null ? void 0 : autoResetPlan.timerId) {
      clearTimeout(autoResetPlan.timerId);
    }
    autoResetPlan = null;
    del(AUTO_RESET_PLAN_KEY);
    del(POOL_STORAGE_KEY);
    del("device");
    del("keyinfo");
    _config.currentConfig = defaultConfig;
    notify();
    await initPool();
  }
  function subscribe(fn) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }
  function getAutoResetPlan() {
    if (!autoResetPlan) {
      const persisted = read(AUTO_RESET_PLAN_KEY);
      if (persisted && persisted.plannedAt > Date.now()) {
        const remaining = persisted.plannedAt - Date.now();
        scheduleAutoResetInternal(remaining, persisted.scheduledAt);
        return persisted;
      }
      return null;
    }
    return {
      plannedAt: autoResetPlan.plannedAt,
      scheduledAt: autoResetPlan.scheduledAt
    };
  }
  function scheduleAutoResetInternal(remainingMs, originalScheduledAt) {
    if (autoResetPlan == null ? void 0 : autoResetPlan.timerId) {
      clearTimeout(autoResetPlan.timerId);
    }
    autoResetPlan = {
      timerId: null,
      plannedAt: Date.now() + remainingMs,
      scheduledAt: originalScheduledAt
    };
    write(AUTO_RESET_PLAN_KEY, {
      plannedAt: autoResetPlan.plannedAt,
      scheduledAt: autoResetPlan.scheduledAt
    });
    info("pool", `自动 reset 已调度: ${Math.round(remainingMs / 1e3)}s 后执行 (可手动取消)`);
    autoResetPlan.timerId = setTimeout(() => {
      void executeAutoReset();
    }, remainingMs);
  }
  function detectAllDeadAndSchedule() {
    const pool = loadPool();
    if (pool.slots.length === 0) return;
    const allDead = pool.slots.every((s) => s.health === "dead");
    if (!allDead) return;
    if (autoResetPlan) return;
    const lastAt = read("fqa.last_auto_reset.v1") ?? 0;
    if (Date.now() - lastAt < AUTO_RESET_THROTTLE_MS) {
      debug("pool", "24h 内已自动 reset 过, 不重复调度");
      return;
    }
    info("pool", "全 dead 状态检测到, 调度 5min 后自动 reset 整个池子");
    scheduleAutoResetInternal(AUTO_RESET_DELAY_MS, Date.now());
  }
  async function executeAutoReset() {
    if (!autoResetPlan) return;
    info("pool", "执行自动 reset (全 dead 状态恢复)");
    write("fqa.last_auto_reset.v1", Date.now());
    del(AUTO_RESET_PLAN_KEY);
    if (autoResetPlan.timerId) {
      clearTimeout(autoResetPlan.timerId);
    }
    autoResetPlan = null;
    del(POOL_STORAGE_KEY);
    del("device");
    del("keyinfo");
    _config.currentConfig = defaultConfig;
    notify();
    try {
      await initPool();
      info("pool", "自动 reset 完成, 新池子已生效");
    } catch (e) {
      error("pool", "自动 reset 后 initPool 失败", { error: String(e) });
    }
    for (const fn of autoResetExecuteListeners) {
      try {
        fn();
      } catch (e) {
        warn("pool", "autoResetExecute listener 异常", { error: String(e) });
      }
    }
  }
  function cancelAutoReset() {
    if (!autoResetPlan) return false;
    if (autoResetPlan.timerId) {
      clearTimeout(autoResetPlan.timerId);
    }
    autoResetPlan = null;
    del(AUTO_RESET_PLAN_KEY);
    info("pool", "用户取消了自动 reset 计划");
    for (const fn of autoResetCancelListeners) {
      try {
        fn();
      } catch (e) {
        warn("pool", "autoResetCancel listener 异常", { error: String(e) });
      }
    }
    return true;
  }
  function subscribeAutoResetCancel(fn) {
    autoResetCancelListeners.add(fn);
    return () => {
      autoResetCancelListeners.delete(fn);
    };
  }
  function subscribeAutoResetExecute(fn) {
    autoResetExecuteListeners.add(fn);
    return () => {
      autoResetExecuteListeners.delete(fn);
    };
  }
  const DEFAULT_CONFIG$1 = {
    enabled: true,
    minMs: 5e3,
    maxMs: 25e3,
    longPauseChance: 0.03,
    longPauseMinMs: 3e4,
    longPauseMaxMs: 9e4
  };
  let config$1 = { ...DEFAULT_CONFIG$1 };
  let lastReleaseTime = 0;
  function uniformInRange(min, max) {
    return Math.floor(min + Math.random() * (max - min));
  }
  function normalDelay(mean, stddev, min, max) {
    const u1 = Math.random() || 1e-9;
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const v = mean + z * stddev;
    return Math.max(min, Math.min(max, Math.floor(v)));
  }
  function computeDelay() {
    if (Math.random() < config$1.longPauseChance) {
      const long = uniformInRange(config$1.longPauseMinMs, config$1.longPauseMaxMs);
      debug("throttle", `L4 长停顿触发`, { ms: long });
      return long;
    }
    const mean = (config$1.minMs + config$1.maxMs) * 0.45;
    const stddev = (config$1.maxMs - config$1.minMs) * 0.25;
    return normalDelay(mean, stddev, config$1.minMs, config$1.maxMs);
  }
  async function waitForThrottle() {
    if (!config$1.enabled) return;
    const now = Date.now();
    if (lastReleaseTime === 0) {
      lastReleaseTime = now;
      debug("throttle", "节流器首次放行");
      return;
    }
    const desiredDelay = computeDelay();
    const elapsed = now - lastReleaseTime;
    const wait = desiredDelay - elapsed;
    if (wait <= 0) {
      lastReleaseTime = now;
      return;
    }
    debug("throttle", `节流等待 ${Math.ceil(wait / 1e3)}s`, {
      elapsedMs: elapsed,
      targetMs: desiredDelay
    });
    await new Promise((resolve) => setTimeout(resolve, wait));
    lastReleaseTime = Date.now();
  }
  function getCountdownSeconds() {
    if (!config$1.enabled) return 0;
    if (lastReleaseTime === 0) return 0;
    const elapsed = Date.now() - lastReleaseTime;
    const earliestWait = config$1.minMs - elapsed;
    return earliestWait > 0 ? Math.ceil(earliestWait / 1e3) : 0;
  }
  function resetThrottle() {
    lastReleaseTime = 0;
    info("throttle", "节流器已重置");
  }
  function getThrottleConfig() {
    return { ...config$1 };
  }
  function setThrottleConfig(patch) {
    config$1 = { ...config$1, ...patch };
    info("throttle", "配置已更新", { ...config$1 });
  }
  const MODAL_ID = "fqa-recovery-modal";
  let currentContext = null;
  let mounted$1 = false;
  function mountRecoveryUI() {
    if (mounted$1) return;
    mounted$1 = true;
    subscribe(handlePoolChange);
    subscribeAutoResetExecute(() => {
      info("recovery", "自动 reset 已完成, 重新加载页面");
      stopAutoResetCountdown();
      removeModal();
      currentContext = null;
      location.reload();
    });
    subscribeAutoResetCancel(() => {
      info("recovery", "自动 reset 被取消, 移除倒计时区块");
      const modal = document.getElementById(MODAL_ID);
      if (modal) {
        const block = modal.querySelector("#fqa-recovery-auto-reset");
        if (block) block.remove();
      }
      stopAutoResetCountdown();
    });
    const plan = getAutoResetPlan();
    if (plan) {
      info("recovery", `检测到持久化的自动 reset 计划, 剩余 ${Math.round((plan.plannedAt - Date.now()) / 1e3)}s`);
    }
    info("recovery", "恢复弹窗模块已挂载");
  }
  function handlePoolChange() {
    const state2 = getPoolState();
    if (state2.slots.length === 0) return;
    const active = state2.slots[state2.activeIndex];
    if (!active) return;
    if (active.health === "dead") {
      const healthyCount = state2.slots.filter((s) => s.health === "healthy").length;
      if (healthyCount === 0) {
        showModal({
          reason: { kind: "all_dead" },
          shownAt: Date.now()
        });
      }
    }
  }
  function notifyFailure(switchedFrom, switchedTo) {
    if (typeof switchedFrom === "number" && typeof switchedTo === "number") {
      showModal({
        reason: { kind: "auto_switched", fromIndex: switchedFrom, toIndex: switchedTo },
        shownAt: Date.now()
      });
    } else {
      const state2 = getPoolState();
      const healthyCount = state2.slots.filter((s) => s.health === "healthy").length;
      showModal({
        reason: healthyCount === 0 ? { kind: "all_dead" } : { kind: "pool_empty" },
        shownAt: Date.now()
      });
    }
  }
  function showModal(ctx) {
    if (currentContext && contextsEqual(currentContext.reason, ctx.reason)) return;
    currentContext = ctx;
    removeModal();
    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "fqa-recovery-modal";
    modal.innerHTML = renderModalHTML(ctx);
    document.body.appendChild(modal);
    bindActions$1(modal);
    if (getAutoResetPlan()) {
      startAutoResetCountdown(modal);
    }
    info("recovery", "弹出失败恢复提示", { reason: ctx.reason });
  }
  function removeModal() {
    const old = document.getElementById(MODAL_ID);
    if (old) old.remove();
  }
  function contextsEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  function renderModalHTML(ctx) {
    const reasonText = renderReason(ctx.reason);
    const autoReset = getAutoResetPlan();
    const autoResetBlock = autoReset ? `<div class="fqa-recovery-auto-reset" id="fqa-recovery-auto-reset">
                <div class="fqa-recovery-auto-reset-title">🤖 自动恢复已启用</div>
                <div class="fqa-recovery-auto-reset-body">
                    检测到所有设备 dead, 系统将在
                    <strong id="fqa-auto-reset-countdown" class="fqa-countdown">--</strong>
                    秒后自动重置整个设备池并重新注册 3 个新设备。
                </div>
                <button data-action="cancel_auto_reset" class="fqa-recovery-btn">取消自动重置</button>
            </div>` : "";
    return `
        <div class="fqa-recovery-backdrop">
            <div class="fqa-recovery-dialog" role="dialog" aria-modal="true">
                <div class="fqa-recovery-header">
                    <span class="fqa-recovery-icon">⚠️</span>
                    <span class="fqa-recovery-title">阅读遇到问题</span>
                </div>
                <div class="fqa-recovery-body">
                    <p class="fqa-recovery-reason">${reasonText}</p>
                    ${autoResetBlock}
                    <div class="fqa-recovery-actions">
                        <button data-action="retry_now" class="fqa-recovery-btn primary">立即重试</button>
                        <button data-action="manual_switch" class="fqa-recovery-btn">切换设备</button>
                        <div class="fqa-recovery-backoff">
                            <button data-action="backoff" data-seconds="10" class="fqa-recovery-btn small">10s 后重试</button>
                            <button data-action="backoff" data-seconds="30" class="fqa-recovery-btn small">30s 后重试</button>
                            <button data-action="backoff" data-seconds="60" class="fqa-recovery-btn small">60s 后重试</button>
                            <button data-action="backoff" data-seconds="120" class="fqa-recovery-btn small">120s 后重试</button>
                        </div>
                        <button data-action="diagnostic" class="fqa-recovery-btn">查看诊断 ▼</button>
                        <button data-action="reset_pool" class="fqa-recovery-btn danger">⚠ 重置整个池子</button>
                        <button data-action="giveup" class="fqa-recovery-btn warn">放弃本次</button>
                    </div>
                    <details class="fqa-recovery-diag" id="fqa-recovery-diag">
                        <summary style="display:none">诊断日志</summary>
                        <pre class="fqa-recovery-log">${escapeHtml$1(exportLogText() || "（暂无日志）")}</pre>
                        <div class="fqa-recovery-diag-actions">
                            <button data-action="copy_log" class="fqa-recovery-btn small">复制日志</button>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    `;
  }
  function renderReason(r) {
    switch (r.kind) {
      case "auto_switched":
        return `当前设备失效，已自动切换到槽 ${r.toIndex}。继续阅读前可手动确认或重试。`;
      case "pool_empty":
        return `设备池为空，所有槽位都不可用。请检查诊断或稍后重试。`;
      case "all_dead":
        return `所有 ${getPoolState().slots.length} 个设备都已 dead，无法继续阅读。请在控制面板手动补员。`;
    }
  }
  function bindActions$1(modal) {
    modal.addEventListener("click", (ev) => {
      const target = ev.target;
      if (!target.dataset.action) {
        return;
      }
      const action = target.dataset.action;
      switch (action) {
        case "retry_now":
          handleRetryNow();
          break;
        case "manual_switch":
          handleManualSwitch$1();
          break;
        case "backoff":
          handleBackoff(parseInt(target.dataset.seconds ?? "30", 10));
          break;
        case "diagnostic":
          toggleDiagnostic(modal);
          break;
        case "copy_log":
          copyLogToClipboard$1();
          break;
        case "reset_pool":
          handleResetPool$1();
          break;
        case "cancel_auto_reset":
          handleCancelAutoReset(modal);
          break;
        case "giveup":
          handleGiveup();
          break;
      }
    });
    requestAnimationFrame(() => toggleDiagnostic(modal));
  }
  let autoResetTickTimer = null;
  function startAutoResetCountdown(modal) {
    stopAutoResetCountdown();
    const tick = () => {
      const plan = getAutoResetPlan();
      const el = modal.querySelector("#fqa-auto-reset-countdown");
      if (!el) {
        stopAutoResetCountdown();
        return;
      }
      if (!plan) {
        el.textContent = "--";
        stopAutoResetCountdown();
        return;
      }
      const remainingSec = Math.max(0, Math.round((plan.plannedAt - Date.now()) / 1e3));
      el.textContent = String(remainingSec);
      if (remainingSec <= 0) {
        stopAutoResetCountdown();
      }
    };
    tick();
    autoResetTickTimer = setInterval(tick, 1e3);
  }
  function stopAutoResetCountdown() {
    if (autoResetTickTimer) {
      clearInterval(autoResetTickTimer);
      autoResetTickTimer = null;
    }
  }
  function handleResetPool$1(_modal) {
    info("recovery", "用户从恢复弹窗触发：重置整个池子");
    if (!confirm("重置整个池子会清空所有 3 个设备 ID 并重新注册。继续？")) return;
    stopAutoResetCountdown();
    removeModal();
    currentContext = null;
    void resetPool().then(() => {
      info("recovery", "重置完成, 重新加载页面让 readerHook 重试");
      location.reload();
    });
  }
  function handleCancelAutoReset(modal) {
    const ok = cancelAutoReset();
    if (ok) {
      info("recovery", "用户取消了自动重置");
      const block = modal.querySelector("#fqa-recovery-auto-reset");
      if (block) block.remove();
      stopAutoResetCountdown();
    }
  }
  function handleRetryNow() {
    info("recovery", "用户选择立即重试");
    removeModal();
    currentContext = null;
    location.reload();
  }
  function handleManualSwitch$1() {
    var _a;
    info("recovery", "用户选择手动切换设备");
    const state2 = getPoolState();
    const fromIndex = state2.activeIndex;
    for (let offset = 1; offset <= state2.slots.length; offset++) {
      const idx = (fromIndex + offset) % state2.slots.length;
      if (((_a = state2.slots[idx]) == null ? void 0 : _a.health) === "healthy") {
        const r = manualSwitch(idx);
        if (r.ok) {
          removeModal();
          currentContext = null;
          location.reload();
          return;
        }
      }
    }
    warn("recovery", "手动切换失败：无 healthy 槽位");
  }
  function handleBackoff(seconds) {
    info("recovery", `用户选择 ${seconds}s 后自动重试`);
    removeModal();
    currentContext = null;
    setTimeout(() => {
      location.reload();
    }, seconds * 1e3);
  }
  function toggleDiagnostic(modal) {
    const details = modal.querySelector("#fqa-recovery-diag");
    if (!details) return;
    details.open = !details.open;
    if (details.open) {
      const pre = details.querySelector("pre");
      if (pre) pre.scrollTop = pre.scrollHeight;
    }
  }
  function copyLogToClipboard$1() {
    var _a;
    const text = exportLogText();
    if ((_a = navigator.clipboard) == null ? void 0 : _a.writeText) {
      navigator.clipboard.writeText(text).then(
        () => info("recovery", "诊断日志已复制到剪贴板"),
        (e) => warn("recovery", "复制失败", { error: String(e) })
      );
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      info("recovery", "诊断日志已复制（execCommand 兜底）");
    } catch (e) {
      warn("recovery", "复制失败", { error: String(e) });
    }
    ta.remove();
  }
  function handleGiveup() {
    info("recovery", "用户选择放弃本次");
    removeModal();
    currentContext = null;
  }
  function escapeHtml$1(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  const appBaseUrl = "https://reading.snssdk.com/reading";
  const redcandleBaseUrl = "https://api5-sinfonlinec.jxbhmy.com/reading";
  const appUserAgent = "com.dragon.read";
  function buildAppQuery(extra) {
    const c = _config.currentConfig;
    return new URLSearchParams({
      iid: c.install_id,
      device_id: c.device_id,
      ac: "wifi",
      channel: "43536163a",
      aid: "1967",
      app_name: "novelapp",
      version_code: "70132",
      version_name: "7.0.1.32",
      device_platform: "android",
      os: "android",
      ssmix: "a",
      os_version: "10",
      device_type: c.device_type || "P30",
      device_brand: c.device_brand || "realme",
      update_version_code: "70132",
      manifest_version_code: "70132",
      pv_player: "70132",
      ...extra
    });
  }
  function isUsable(res) {
    if (!res || res.status !== 200) return false;
    try {
      const j = res.json();
      return !j || j.code === void 0 || j.code === 0;
    } catch {
      return false;
    }
  }
  async function requestApp(path, query, headers) {
    const url = `${appBaseUrl}${path}?${buildAppQuery(query).toString()}`;
    const signed = await signRequest(url);
    return apiFetch(url, {
      method: "GET",
      headers: { ...signed, "User-Agent": appUserAgent, ...headers }
    });
  }
  async function requestRedcandle(path, query, headers) {
    const url = `${redcandleBaseUrl}${path}?${buildAppQuery(query).toString()}`;
    return apiFetch(url, {
      method: "GET",
      headers: { "User-Agent": appUserAgent, ...headers }
    });
  }
  async function requestAppWithRecovery(path, query, headers) {
    await waitForThrottle();
    const res = await requestApp(path, query, headers);
    if (!isEmptyResponse(res)) {
      recordSuccess();
      return res;
    }
    console.warn(`[fqa:api] ${path} 返回空响应体，上报池子失败`);
    const failureResult = recordFailure();
    if (failureResult.switched) {
      const state2 = getPoolState();
      notifyFailure(state2.activeIndex - 1 < 0 ? 0 : state2.activeIndex - 1, state2.activeIndex);
    }
    const retry = await requestApp(path, query, headers);
    if (!isEmptyResponse(retry)) {
      recordSuccess();
      return retry;
    }
    return retry;
  }
  async function appGet(path, query, headers) {
    if (settings.apiPreference === "redcandle") {
      try {
        const res = await requestRedcandle(path, query, headers);
        if (isUsable(res)) return res;
        console.warn(`[fqa:api] 红烛接口数据不全，回落到番茄 APP: ${path}`);
      } catch (e) {
        console.warn(`[fqa:api] 红烛接口请求失败，回落到番茄 APP: ${path}`, e);
      }
    }
    return requestAppWithRecovery(path, query, headers);
  }
  async function appPost(path, body, query, headers) {
    return postSigned(appBaseUrl + path, body, query, headers);
  }
  async function postSigned(base, body, query, headers) {
    const url = `${base}?${buildAppQuery(query).toString()}`;
    const signed = await signRequest(url, body);
    console.log("---start--- APP POST ", url);
    const res = await apiFetch(url, {
      method: "POST",
      headers: {
        ...signed,
        "User-Agent": appUserAgent,
        "Content-Type": "application/json; charset=utf-8",
        ...headers
      },
      body
    });
    console.log("---complete--- APP POST ", url, res);
    return res;
  }
  async function decryptChapter(encrypted, rawData, config2 = defaultConfig) {
    var _a;
    if (!encrypted) {
      throw new Error("Invalid encrypted chapter");
    }
    const buf = b64decode(encrypted);
    const iv = buf.slice(0, 16);
    const data = buf.slice(16);
    const key = (_a = config2.key_info) == null ? void 0 : _a.key;
    if (!key) {
      throw new Error("Missing decrypt key");
    }
    const subtle = getSubtle();
    const cryptoKey = await subtle.importKey(
      "raw",
      new Uint8Array(key),
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    return subtle.decrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      data
    ).then(async (decrypted) => {
      if (rawData && (rawData == null ? void 0 : rawData.compress_status) === 1) {
        decrypted = await gunzip(decrypted);
      }
      const decoder = new TextDecoder();
      const plain = decoder.decode(decrypted);
      if (plain.trim().startsWith("<")) {
        return plain;
      }
      try {
        return JSON.parse(plain);
      } catch (e) {
        console.warn("Invalid chapter content: ", plain, e);
        return void 0;
      }
    });
  }
  async function decryptComicImage(image, key) {
    const subtle = getSubtle();
    const cryptoKey = await subtle.importKey(
      "raw",
      unhex(key),
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    const iv = image.slice(0, 12);
    const data = image.slice(12);
    return await subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      data
    );
  }
  function reverseHex(value) {
    const be = BigInt(value).toString(16).padStart(32, "0");
    let result = "";
    for (let i2 = be.length; i2 > 0; i2 -= 2) result += be.slice(i2 - 2, i2);
    return result;
  }
  async function encryptKeyinfoBody(config2) {
    const deviceId = config2.device_id;
    const iv = new TextEncoder().encode(randomString(16));
    const data = new Uint8Array(unhex(reverseHex(deviceId))).slice(0, 8);
    console.log(data);
    const subtle = getSubtle();
    const k = await subtle.importKey(
      "raw",
      new Uint8Array(shared_key),
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );
    const encrypted = await subtle.encrypt(
      { name: "AES-CBC", iv },
      k,
      data
    );
    const final = new Uint8Array(iv.length + encrypted.byteLength);
    console.log(final);
    final.set(iv, 0);
    final.set(new Uint8Array(encrypted), iv.length);
    return JSON.stringify({
      content: b64encode(final.buffer)
    });
  }
  async function decryptKeyinfoResponse(encrypted) {
    const buf = b64decode(encrypted);
    const iv = buf.slice(0, 16);
    const data = buf.slice(16);
    const subtle = getSubtle();
    const k = await subtle.importKey(
      "raw",
      new Uint8Array(shared_key),
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    return subtle.decrypt(
      { name: "AES-CBC", iv },
      k,
      data
    );
  }
  async function refreshKeyinfo() {
    var _a, _b, _c;
    const b = await encryptKeyinfoBody(_config.currentConfig);
    const res = await appPost("/crypt/registerkey", b);
    const j = res.json();
    const ek = (_a = j == null ? void 0 : j.data) == null ? void 0 : _a.key;
    if (!ek) {
      throw new Error(`Failed to get key info: ${res.responseText}`);
    }
    const key = await decryptKeyinfoResponse(ek);
    const keyinfo = {
      key,
      keyver: (_b = j == null ? void 0 : j.data) == null ? void 0 : _b.keyver
    };
    console.log("Refreshed key info:", keyinfo);
    _config.currentConfig.key_info = keyinfo;
    write("keyinfo", {
      key: b64encode(key),
      keyver: (_c = j == null ? void 0 : j.data) == null ? void 0 : _c.keyver
    });
  }
  let refreshInflight = null;
  function refreshKey() {
    if (!refreshInflight) {
      refreshInflight = refreshKeyinfo().finally(() => {
        refreshInflight = null;
      });
    }
    return refreshInflight;
  }
  async function ensureKeyinfo(expectedKeyVersion) {
    const keyinfo = _config.currentConfig.key_info;
    const cachedKeyInfo = read("keyinfo");
    console.log("cached key info: ", cachedKeyInfo);
    if (cachedKeyInfo) {
      const cki = {
        key: b64decode(cachedKeyInfo.key),
        keyver: cachedKeyInfo.keyver
      };
      if (typeof expectedKeyVersion === "undefined" || cki.keyver === expectedKeyVersion) {
        _config.currentConfig.key_info = cki;
        return;
      }
    }
    if (!keyinfo) {
      return await refreshKey();
    }
    if ((keyinfo == null ? void 0 : keyinfo.keyver) !== expectedKeyVersion) {
      return await refreshKey();
    }
  }
  async function getChapter(itemId2, _retry) {
    var _a, _b;
    if (typeof _retry === "undefined") _retry = 0;
    if (_retry > 5) {
      throw new Error(`Failed to get chapter: ${itemId2}`);
    }
    if (!_config.currentConfig.key_info) {
      await ensureKeyinfo();
    }
    const res = await appGet("/reader/full/v", { item_id: itemId2, req_type: "1" });
    const j = (_a = res.json()) == null ? void 0 : _a.data;
    if (!j) {
      console.warn("Failed to get chapter: ", itemId2, ", response: ", res.responseText);
      return await getChapter(itemId2, _retry + 1);
    }
    if ((j == null ? void 0 : j.content) === "Invalid" || (j == null ? void 0 : j.key_version) !== ((_b = _config.currentConfig.key_info) == null ? void 0 : _b.keyver)) {
      console.warn("Key reg expired, regster again and retrying...");
      if ((j == null ? void 0 : j.content) === "Invalid") {
        await refreshKey();
      } else {
        await ensureKeyinfo(parseInt(j == null ? void 0 : j.key_version));
      }
      return await getChapter(itemId2, _retry + 1);
    }
    j.content = await decryptChapter(j == null ? void 0 : j.content, j, _config.currentConfig);
    return j;
  }
  async function getCatalogRaw(bookId2) {
    var _a;
    const response = await appGet("/bookapi/directory/all_items/v", { book_id: bookId2 });
    const j = response.json();
    const items = (_a = j == null ? void 0 : j.data) == null ? void 0 : _a.item_data_list;
    if ((j == null ? void 0 : j.code) !== 0 || !Array.isArray(items) || items.length === 0) {
      return [null, null];
    }
    return [items, items.map((it) => String(it.item_id))];
  }
  async function webCatalog(bookId2) {
    const url = `https://fanqienovel.com/api/reader/directory/detail?bookId=${bookId2}`;
    const response = await apiFetch(url);
    const rj = response.json();
    const d = rj.data;
    const allItems = d.allItemIds;
    const cs = [];
    const vname = d.volumeNameList;
    for (let i2 = 0; i2 < vname.length; i2++) {
      const volumeName = vname[i2];
      if (volumeName !== void 0) {
        cs.push(...d.chapterListWithVolume[i2]);
      }
    }
    return [cs, allItems];
  }
  async function getCatalog(bookId2) {
    const r = await getCatalogRaw(bookId2);
    let catalogRaw = r[0];
    let allItemIds = r[1];
    console.log("catalogRaw", catalogRaw, "allItemIds", allItemIds);
    if (!catalogRaw || !allItemIds) {
      const rw = await webCatalog(bookId2);
      catalogRaw = rw[0];
      allItemIds = rw[1];
      console.log("webCatalog", catalogRaw, "allItemIds", allItemIds);
    }
    const vmap = {};
    const chapters = [];
    catalogRaw.forEach((item) => {
      const volumeName = item.volume_name ?? "";
      const chapterItem = {
        item_id: String(item.item_id || item.itemId),
        title: item.title,
        // YYYY-MM-DD HH:mm:ss
        update_time: moment((item.first_pass_time || item.firstPassTime) * 1e3).format("YYYY-MM-DD HH:mm:ss"),
        char_count: item.chapter_word_number || 0,
        volume_title: volumeName
      };
      chapters.push(chapterItem);
      if (!vmap[volumeName]) {
        vmap[volumeName] = {
          title: volumeName,
          book_id: bookId2,
          chapter_list: []
        };
      }
      vmap[volumeName].chapter_list.push(chapterItem);
    });
    return {
      book_id: bookId2,
      volume_list: Object.values(vmap),
      chapter_list: chapters,
      all_item_ids: allItemIds
    };
  }
  function mappingCreationStatus(status) {
    switch (status) {
      case "0":
        return "完结";
      case "1":
        return "连载";
      case "4":
        return "断更";
      default:
        return "未知";
    }
  }
  async function getBookInfoRaw(bookId2) {
    const response = await appGet("/bookapi/detail/v", { book_id: bookId2 });
    const j = response.json();
    console.log("Book Info:", j);
    return j.data;
  }
  async function getBookInfo(bookId2) {
    const bookInfo = await getBookInfoRaw(bookId2);
    if (!bookInfo) {
      throw new Error("Book not found");
    }
    return {
      book_id: bookInfo.book_id,
      title: bookInfo.book_name || bookInfo.original_book_name,
      author: bookInfo.author,
      cover_url: bookInfo.thumb_url,
      summary: bookInfo.abstract,
      // volume_list: bookInfo.volume_list,
      update_time: moment(bookInfo.last_chapter_first_pass_time * 1e3).format("YYYY-MM-DD HH:mm:ss"),
      status: mappingCreationStatus(bookInfo.creation_status)
      // chapter_count: bookInfo.chapter_count,
    };
  }
  async function getBookInfoAndCatalog(book) {
    if (typeof book !== "string") {
      book = book.book_id;
    }
    const bookInfo = await getBookInfo(book);
    if (!bookInfo) {
      throw new Error("Book not found");
    }
    const catalog = await getCatalog(bookInfo.book_id);
    console.log("Catalog:", catalog);
    bookInfo.volume_list = catalog.volume_list;
    bookInfo.chapter_list = catalog.chapter_list;
    return bookInfo;
  }
  const CDN_PREFIX = "https://p3-novel.byteimg.com/origin/";
  const cssCache = /* @__PURE__ */ new Map();
  function stripComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, "");
  }
  function scopeSelector(selector, scope) {
    const s = selector.trim();
    if (!s) return "";
    const where = `:where(${scope})`;
    if (/^(body|html|:root)$/i.test(s)) return where;
    const m = s.match(/^(body|html)\b([\s\S]*)$/i);
    if (m) return `${where}${m[2]}`;
    return `${where} ${s}`;
  }
  function stripRootDecls(body) {
    return body.split(";").filter((decl) => !/^\s*(color|background|background-color|font-size)\s*:/i.test(decl)).join(";");
  }
  function scopeCss(css, scope) {
    const src = stripComments(css);
    let out = "";
    let buf = "";
    let i2 = 0;
    while (i2 < src.length) {
      const ch = src[i2];
      if (ch === "{") {
        const prelude = buf.trim();
        buf = "";
        i2++;
        if (prelude.startsWith("@")) {
          if (/^@(media|supports|document)\b/i.test(prelude)) {
            const inner2 = readBlock(src, i2);
            out += `${prelude}{${scopeCss(inner2.text, scope)}}`;
            i2 = inner2.end;
          } else {
            const inner2 = readBlock(src, i2);
            out += `${prelude}{${inner2.text}}`;
            i2 = inner2.end;
          }
          continue;
        }
        const inner = readBlock(src, i2);
        const selectors = prelude.split(",").map((s) => scopeSelector(s, scope)).filter(Boolean);
        const isRoot = selectors.length === 1 && selectors[0] === `:where(${scope})`;
        const declarations = isRoot ? stripRootDecls(inner.text) : inner.text;
        if (selectors.length && declarations.trim()) {
          out += `${selectors.join(",")}{${declarations}}`;
        }
        i2 = inner.end;
        continue;
      }
      if (ch === ";" && buf.trim().startsWith("@")) {
        buf = "";
        i2++;
        continue;
      }
      buf += ch;
      i2++;
    }
    return out;
  }
  function readBlock(src, start) {
    let depth = 1;
    let i2 = start;
    while (i2 < src.length && depth > 0) {
      const c = src[i2];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      if (depth === 0) break;
      i2++;
    }
    return { text: src.slice(start, i2), end: Math.min(i2 + 1, src.length) };
  }
  function parseCssMap(cssMap) {
    if (!cssMap || typeof cssMap !== "string") return {};
    try {
      const parsed = JSON.parse(cssMap);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  async function fetchCss(uri) {
    const cached = cssCache.get(uri);
    if (cached !== void 0) return cached;
    try {
      const res = await fetch(CDN_PREFIX + uri);
      const text = res.ok ? await res.text() : "";
      cssCache.set(uri, text);
      return text;
    } catch (e) {
      console.warn("获取书籍样式表失败:", uri, e);
      cssCache.set(uri, "");
      return "";
    }
  }
  async function getScopedBookCss(cssMap, scope) {
    const map = parseCssMap(cssMap);
    const uris = Object.values(map).filter(Boolean);
    if (uris.length === 0) return "";
    const sheets = await Promise.all(uris.map(fetchCss));
    return sheets.filter(Boolean).map((css) => scopeCss(css, scope)).join("\n");
  }
  async function applyBookCss(cssMap, scope, styleId = "fqa-book-style") {
    const css = await getScopedBookCss(cssMap, scope);
    let el = document.getElementById(styleId);
    if (!css) {
      el == null ? void 0 : el.remove();
      return false;
    }
    if (!el) {
      el = document.createElement("style");
      el.id = styleId;
      document.head.appendChild(el);
    }
    el.textContent = css;
    return true;
  }
  const FOOTNOTE_CLASS = "fqa-footnote";
  const FOOTNOTE_REF_CLASS = "fqa-footnote-ref";
  const FOOTNOTE_LIST_CLASS = "fqa-footnote-list";
  function byAttr(root, tag, attr, value) {
    return [...root.querySelectorAll(tag)].filter((el) => {
      const v = el.getAttribute(attr);
      if (v === null) return false;
      return value === void 0 || v === value;
    });
  }
  function processFootnotes(root) {
    const notes = /* @__PURE__ */ new Map();
    const sections = byAttr(root, "section", "epub:type", "footnotes");
    for (const section of sections) {
      for (const aside of section.querySelectorAll("aside")) {
        const id = aside.getAttribute("id");
        if (id) notes.set(id, aside.innerHTML.trim());
      }
    }
    if (notes.size === 0) {
      for (const aside of byAttr(root, "aside", "epub:type", "footnote")) {
        const id = aside.getAttribute("id");
        if (id) notes.set(id, aside.innerHTML.trim());
      }
    }
    const collectRefs = (scope) => {
      const set = new Set(byAttr(scope, "a", "epub:type", "noteref"));
      for (const img of scope.querySelectorAll("img.bdFootnote")) {
        const a = img.closest('a[href^="#"]');
        if (a && scope.contains(a)) set.add(a);
      }
      return [...scope.querySelectorAll("a")].filter((a) => set.has(a));
    };
    const inSection = (el) => sections.some((s) => s.contains(el));
    const refs = collectRefs(root).filter((a) => !inSection(a));
    if (refs.length === 0 && notes.size === 0) return 0;
    const ordered = [];
    const numberOf = /* @__PURE__ */ new Map();
    let counter = 0;
    const makeSup = (num, text) => {
      const sup = document.createElement("sup");
      sup.className = FOOTNOTE_REF_CLASS;
      sup.textContent = String(num);
      sup.setAttribute("role", "button");
      sup.setAttribute("tabindex", "0");
      sup.title = stripTags(text);
      return sup;
    };
    refs.forEach((ref) => {
      const href = ref.getAttribute("href") ?? "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      const text = notes.get(id);
      if (text === void 0) return;
      counter += 1;
      numberOf.set(id, counter);
      ordered.push({ num: counter, text });
      ref.replaceWith(makeSup(counter, text));
    });
    for (const [id, text] of notes) {
      if (numberOf.has(id)) continue;
      counter += 1;
      numberOf.set(id, counter);
      ordered.push({ num: counter, text });
    }
    for (const section of sections) section.remove();
    if (ordered.length > 0) {
      const list = document.createElement("ol");
      list.className = FOOTNOTE_LIST_CLASS;
      for (const { num, text } of ordered) {
        const li = document.createElement("li");
        li.id = `fqa-fn-${num}`;
        li.innerHTML = text;
        for (const inner of collectRefs(li)) {
          const innerId = (inner.getAttribute("href") ?? "").replace(/^#/, "");
          const innerNum = numberOf.get(innerId);
          const innerText = notes.get(innerId);
          if (innerNum && innerText !== void 0) {
            inner.replaceWith(makeSup(innerNum, innerText));
          } else {
            inner.remove();
          }
        }
        list.appendChild(li);
      }
      const wrapper = document.createElement("section");
      wrapper.className = FOOTNOTE_CLASS;
      const heading = document.createElement("div");
      heading.className = "fqa-footnote-title";
      heading.textContent = "注释";
      wrapper.appendChild(heading);
      wrapper.appendChild(list);
      root.appendChild(wrapper);
    }
    for (const img of root.querySelectorAll("img.bdFootnote")) img.remove();
    return ordered.length;
  }
  function stripTags(html) {
    const el = document.createElement("div");
    el.innerHTML = html;
    return (el.textContent ?? "").replace(/\s+/g, " ").trim();
  }
  const KNOWN_TIERS = /muye-reader-content-(16|20|24|28|32)\b/;
  function syncFootnoteFontSize(container2) {
    const box = container2.closest('[class*="muye-reader-content-"]');
    const apply2 = () => {
      container2.style.removeProperty("--fqa-body-size");
      if (!box || KNOWN_TIERS.test(box.className)) return;
      const p = container2.querySelector("p");
      if (!p) return;
      const size = getComputedStyle(p).fontSize;
      if (size) container2.style.setProperty("--fqa-body-size", size);
    };
    apply2();
    if (!box) return;
    const holder = container2;
    if (holder.fqaFontObserver) return;
    const observer = new MutationObserver(apply2);
    observer.observe(box, { attributes: true, attributeFilter: ["class"] });
    holder.fqaFontObserver = observer;
  }
  function bindFootnoteInteraction(container2) {
    syncFootnoteFontSize(container2);
    if (container2.dataset.fqaFootnoteBound === "1") return;
    container2.dataset.fqaFootnoteBound = "1";
    const activate = (sup) => {
      var _a;
      const num = (_a = sup.textContent) == null ? void 0 : _a.trim();
      if (!num) return;
      const target = container2.querySelector(`#fqa-fn-${num}`);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("fqa-footnote-active");
      setTimeout(() => target.classList.remove("fqa-footnote-active"), 1600);
    };
    container2.addEventListener("click", (e) => {
      var _a, _b;
      const sup = (_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, `.${FOOTNOTE_REF_CLASS}`);
      if (sup) {
        e.preventDefault();
        activate(sup);
      }
    });
    container2.addEventListener("keydown", (e) => {
      var _a, _b;
      const ke = e;
      if (ke.key !== "Enter" && ke.key !== " ") return;
      const sup = (_b = (_a = ke.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, `.${FOOTNOTE_REF_CLASS}`);
      if (sup) {
        ke.preventDefault();
        activate(sup);
      }
    });
  }
  const leftIcon = '<?xml version="1.0" ?><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><title/><g data-name="1" id="_1"><path fill="currentColor" d="M353,450a15,15,0,0,1-10.61-4.39L157.5,260.71a15,15,0,0,1,0-21.21L342.39,54.6a15,15,0,1,1,21.22,21.21L189.32,250.1,363.61,424.39A15,15,0,0,1,353,450Z"/></g></svg>';
  const playingIcon = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\r\n\r\n<svg\r\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\r\n   xmlns:cc="http://creativecommons.org/ns#"\r\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\r\n   xmlns:svg="http://www.w3.org/2000/svg"\r\n   xmlns="http://www.w3.org/2000/svg"\r\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\r\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\r\n   width="22"\r\n   height="22"\r\n   viewBox="0 0 5.8208332 5.8208335"\r\n   version="1.1"\r\n   id="svg8"\r\n   inkscape:version="0.92.2 (5c3e80d, 2017-08-06)"\r\n   sodipodi:docname="stock_media-pause.svg">\r\n  <defs\r\n     id="defs2" />\r\n  <sodipodi:namedview\r\n     id="base"\r\n     pagecolor="#ffffff"\r\n     bordercolor="#666666"\r\n     borderopacity="1.0"\r\n     inkscape:pageopacity="0.0"\r\n     inkscape:pageshadow="2"\r\n     inkscape:zoom="7.9999996"\r\n     inkscape:cx="7.3825825"\r\n     inkscape:cy="8.7516629"\r\n     inkscape:document-units="mm"\r\n     inkscape:current-layer="layer1"\r\n     showgrid="true"\r\n     units="px"\r\n     inkscape:window-width="1360"\r\n     inkscape:window-height="718"\r\n     inkscape:window-x="0"\r\n     inkscape:window-y="24"\r\n     inkscape:window-maximized="1">\r\n    <inkscape:grid\r\n       type="xygrid"\r\n       id="grid10"\r\n       spacingx="0.52916667"\r\n       spacingy="0.52916667" />\r\n  </sodipodi:namedview>\r\n  <metadata\r\n     id="metadata5">\r\n    <rdf:RDF>\r\n      <cc:Work\r\n         rdf:about="">\r\n        <dc:format>image/svg+xml</dc:format>\r\n        <dc:type\r\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\r\n        <dc:title></dc:title>\r\n      </cc:Work>\r\n    </rdf:RDF>\r\n  </metadata>\r\n  <g\r\n     inkscape:label="Capa 1"\r\n     inkscape:groupmode="layer"\r\n     id="layer1"\r\n     transform="translate(0,-291.17915)">\r\n    <path\r\n       style="fill:currentColor;fill-opacity:1;stroke:currentColor;stroke-width:1.29999995;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"\r\n       d="m 1.5875,292.23748 v 4.23334"\r\n       id="path892"\r\n       inkscape:connector-curvature="0" />\r\n    <path\r\n       inkscape:connector-curvature="0"\r\n       id="path894"\r\n       d="m 3.7041667,292.23748 v 4.23334"\r\n       style="fill:currentColor;fill-opacity:1;stroke:currentColor;stroke-width:1.29999995;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />\r\n  </g>\r\n</svg>\r\n';
  const pausedIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\r\n    <g>\r\n        <path fill="none" d="M0 0h24v24H0z"/>\r\n        <path d="M16.394 12L10 7.737v8.526L16.394 12zm2.982.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z" fill="currentColor"/>\r\n    </g>\r\n</svg>\r\n';
  function decodeBase36(c) {
    if (c >= 48 && c <= 57) return c - 48;
    if (c >= 97 && c <= 122) return c - 97 + 10;
    return 255;
  }
  function bitCount(n) {
    n = n - (n >> 1 & 1431655765);
    n = (n & 858993459) + (n >> 2 & 858993459);
    return (n + (n >> 4) & 252645135) * 16843009 >> 24;
  }
  function decryptSpadeInner(spadeKey) {
    const result = new Uint8Array(spadeKey);
    const buff = new Uint8Array(2 + spadeKey.length);
    buff.set([250, 85], 0);
    buff.set(spadeKey, 2);
    for (let i2 = 0; i2 < result.length; i2++) {
      let v = (spadeKey[i2] ^ buff[i2]) - bitCount(i2) - 21;
      while (v < 0) {
        v += 255;
      }
      result[i2] = v;
    }
    return result;
  }
  function decryptSpade(spadeKeyBytes) {
    const spadeKeyLen = spadeKeyBytes.length;
    if (spadeKeyLen < 3) return "";
    const paddingLen = (spadeKeyBytes[0] ^ spadeKeyBytes[1] ^ spadeKeyBytes[2]) - 48;
    if (spadeKeyLen < paddingLen + 2) return "";
    const innerInput = spadeKeyBytes.slice(1, spadeKeyLen - paddingLen);
    const tmpBuff = decryptSpadeInner(innerInput);
    if (tmpBuff.length === 0) return "";
    const skipBytes = decodeBase36(tmpBuff[0]);
    const decodedMessageLen = spadeKeyLen - paddingLen - 2;
    const endIndex = 1 + decodedMessageLen - skipBytes;
    if (endIndex > tmpBuff.length) return "";
    const finalBytes = tmpBuff.slice(1, endIndex);
    return new TextDecoder("utf-8").decode(finalBytes);
  }
  function decryptSpadeA(spadeAStr) {
    try {
      const bytes = new Uint8Array(b64decode(spadeAStr));
      return decryptSpade(bytes);
    } catch (e) {
      console.error("Spade parsing error", e);
      return "";
    }
  }
  async function getPlayInfo(item_id, tone_id) {
    const item_ids = Array.isArray(item_id) ? item_id.join(",") : item_id;
    const resp = await appGet("/reader/audio/playinfo/", {
      item_ids,
      tone_id: tone_id.toString()
    });
    const j = resp.json();
    const results = [];
    if (Array.isArray(j.data)) {
      for (let i2 of j.data) {
        results.push({
          urls: [i2.main_url, i2.backup_url].filter(Boolean),
          vid: i2.vid,
          key: i2.is_encrypt ? decryptSpadeA(i2.encryption_key) : "",
          item_id: i2.item_id
        });
      }
    }
    return results;
  }
  async function getBookAvailableTones(book_id) {
    var _a;
    const resp = await appGet("/bookapi/audio/toneinfo/", { book_id });
    const j = resp.json();
    const results = [];
    if (Array.isArray((_a = j == null ? void 0 : j.data) == null ? void 0 : _a.tts_tones)) {
      for (let i2 of j.data.tts_tones) {
        results.push({
          id: i2.id,
          name: i2.title,
          gender: i2.tone_gender,
          icon: i2.icon_url,
          description: i2.description
        });
      }
    }
    return results;
  }
  async function getChapterParagraphTimeTag(item_id, tone_id) {
    var _a;
    const resp = await appGet("/reader/audio/timepoint/", {
      item_id,
      tone_id: tone_id.toString(),
      req_type: "1"
    });
    const j = resp.json();
    const results = [];
    if (Array.isArray((_a = j == null ? void 0 : j.data) == null ? void 0 : _a.time_points)) {
      for (let i2 of j.data.time_points) {
        results.push({
          startms: i2.start_time,
          endms: i2.end_time,
          startidx: i2.start_para,
          endidx: i2.end_para,
          is_title: i2.start_para === 1e4
        });
      }
    }
    return results;
  }
  function asBytes(value) {
    if (value instanceof Uint8Array) {
      return new Uint8Array(value);
    }
    return new Uint8Array(value);
  }
  function concatBytes(...arrays) {
    const length = arrays.reduce((sum, array) => sum + array.byteLength, 0);
    const result = new Uint8Array(length);
    let offset = 0;
    for (const array of arrays) {
      result.set(array, offset);
      offset += array.byteLength;
    }
    return result;
  }
  function ascii(text) {
    const result = new Uint8Array(text.length);
    for (let i2 = 0; i2 < text.length; i2++) {
      result[i2] = text.charCodeAt(i2) & 255;
    }
    return result;
  }
  function hexToBytes(text) {
    const hex2 = text.replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]*$/.test(hex2) || hex2.length % 2 !== 0) {
      throw new Error("无效的十六进制数据");
    }
    const result = new Uint8Array(hex2.length / 2);
    for (let i2 = 0; i2 < result.length; i2++) {
      result[i2] = parseInt(hex2.slice(i2 * 2, i2 * 2 + 2), 16);
    }
    return result;
  }
  function uintBytes(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`无效的无符号整数: ${value}`);
    }
    if (value === 0) return new Uint8Array([0]);
    const result = [];
    let current = value;
    while (current > 0) {
      result.unshift(current & 255);
      current = Math.floor(current / 256);
    }
    return new Uint8Array(result);
  }
  function be16(value) {
    const result = new Uint8Array(2);
    new DataView(result.buffer).setUint16(0, value);
    return result;
  }
  function be32(value) {
    const result = new Uint8Array(4);
    new DataView(result.buffer).setUint32(0, value >>> 0);
    return result;
  }
  function be64(value) {
    const result = new Uint8Array(8);
    new DataView(result.buffer).setBigUint64(0, BigInt(value));
    return result;
  }
  function findBytes(buffer, fourcc, from = 0, to = buffer.length - 4) {
    if (fourcc.length !== 4) throw new Error(`fourcc 必须是 4 个字符: ${fourcc}`);
    const c0 = fourcc.charCodeAt(0);
    const c1 = fourcc.charCodeAt(1);
    const c2 = fourcc.charCodeAt(2);
    const c3 = fourcc.charCodeAt(3);
    for (let i2 = from; i2 <= to; i2++) {
      if (buffer[i2] === c0 && buffer[i2 + 1] === c1 && buffer[i2 + 2] === c2 && buffer[i2 + 3] === c3) return i2;
    }
    return -1;
  }
  function strBytes(text) {
    return new TextEncoder().encode(text);
  }
  function readFourcc(buffer, offset) {
    return String.fromCharCode(
      buffer[offset] ?? 0,
      buffer[offset + 1] ?? 0,
      buffer[offset + 2] ?? 0,
      buffer[offset + 3] ?? 0
    );
  }
  const CONTAINERS = /* @__PURE__ */ new Set([
    "moov",
    "trak",
    "mdia",
    "minf",
    "stbl",
    "edts",
    "dinf",
    "udta",
    "mvex",
    "meta"
  ]);
  function readBox(buffer, offset, limit) {
    if (offset + 8 > limit) return null;
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const size32 = view.getUint32(offset);
    const type = readFourcc(buffer, offset + 4);
    let headerSize = 8;
    let size;
    if (size32 === 1) {
      if (offset + 16 > limit) return null;
      const extended = view.getBigUint64(offset + 8);
      if (extended > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error(`MP4 box 过大: ${type}`);
      }
      size = Number(extended);
      headerSize = 16;
    } else if (size32 === 0) {
      size = limit - offset;
    } else {
      size = size32;
    }
    if (size < headerSize || offset + size > limit) return null;
    return { type, offset, size, headerSize, end: offset + size };
  }
  function walkBoxes(buffer, start, end, visit, depth = 0) {
    if (depth > 16) return;
    let offset = start;
    while (offset + 8 <= end) {
      const box = readBox(buffer, offset, end);
      if (!box) return;
      visit(box);
      if (CONTAINERS.has(box.type)) {
        const childStart = box.offset + box.headerSize + (box.type === "meta" ? 4 : 0);
        if (childStart < box.end) walkBoxes(buffer, childStart, box.end, visit, depth + 1);
      }
      offset = box.end;
    }
  }
  function findBox(boxes, type) {
    return boxes.find((box) => box.type === type);
  }
  function findMdatStart(buffer) {
    let offset = 0;
    while (offset + 8 <= buffer.length) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const size32 = view.getUint32(offset);
      const type = readFourcc(buffer, offset + 4);
      const headerSize = size32 === 1 ? 16 : 8;
      if (type === "mdat") return offset + headerSize;
      if (size32 === 0) return -1;
      if (size32 === 1) {
        if (offset + 16 > buffer.length) return -1;
        const size = view.getBigUint64(offset + 8);
        if (size > BigInt(Number.MAX_SAFE_INTEGER)) return -1;
        offset += Number(size);
      } else {
        offset += size32;
      }
    }
    return -1;
  }
  function parseSampleSizes(box, view) {
    if (box.offset + 20 > box.end) throw new Error("stsz box 不完整");
    const sampleSize = view.getUint32(box.offset + 12);
    const count = view.getUint32(box.offset + 16);
    const sizes = new Uint32Array(count);
    if (sampleSize !== 0) {
      sizes.fill(sampleSize);
      return sizes;
    }
    if (box.offset + 20 + count * 4 > box.end) throw new Error("stsz 采样表不完整");
    for (let i2 = 0; i2 < count; i2++) sizes[i2] = view.getUint32(box.offset + 20 + i2 * 4);
    return sizes;
  }
  function parseDurations(box, sampleCount, view) {
    if (box.offset + 16 > box.end) throw new Error("stts box 不完整");
    const entryCount = view.getUint32(box.offset + 12);
    const durations = new Uint32Array(sampleCount);
    let index = 0;
    for (let i2 = 0; i2 < entryCount; i2++) {
      const offset = box.offset + 16 + i2 * 8;
      if (offset + 8 > box.end) throw new Error("stts 采样表不完整");
      const count = view.getUint32(offset);
      const duration = view.getUint32(offset + 4);
      for (let j = 0; j < count && index < sampleCount; j++) durations[index++] = duration;
    }
    if (index !== sampleCount) throw new Error(`stts 采样数不一致: ${index}/${sampleCount}`);
    return durations;
  }
  function parseIvs(box, sampleCount, view) {
    if (box.offset + 16 > box.end) throw new Error("senc box 不完整");
    const flags = view.getUint32(box.offset + 8) & 16777215;
    if ((flags & 2) !== 0) throw new Error("暂不支持带 subsample encryption 的音频");
    const count = view.getUint32(box.offset + 12);
    if (count !== sampleCount) throw new Error(`senc 采样数不一致: ${count}/${sampleCount}`);
    const dataStart = box.offset + 16;
    const dataLength = box.end - dataStart;
    if (count === 0 || dataLength % count !== 0) throw new Error("senc IV 表不完整");
    const ivLength = dataLength / count;
    if (ivLength !== 8 && ivLength !== 16) throw new Error(`不支持的 CENC IV 长度: ${ivLength}`);
    return asBytes(new Uint8Array(view.buffer, view.byteOffset + dataStart, dataLength));
  }
  function parseTimescale(box, view) {
    if (box.offset + 24 > box.end) throw new Error("mdhd box 不完整");
    const version2 = view.getUint8(box.offset + 8);
    const offset = version2 === 1 ? box.offset + 28 : box.offset + 20;
    if (offset + 4 > box.end) throw new Error("mdhd timescale 缺失");
    const timescale = view.getUint32(offset);
    if (timescale === 0) throw new Error("MP4 timescale 为 0");
    return timescale;
  }
  function parseCodec(buffer, mdatStart) {
    const end = Math.max(0, Math.min(mdatStart - 1, buffer.length - 4));
    const dOps = findBytes(buffer, "dOps", 0, end);
    if (dOps >= 0) {
      const channels2 = buffer[dOps + 5] ?? 1;
      const preSkip = (buffer[dOps + 6] ?? 0) << 8 | (buffer[dOps + 7] ?? 0);
      return { codec: "opus", channels: channels2, preSkip };
    }
    const encodedEntry = findBytes(buffer, "enca", 0, end);
    const plainEntry = findBytes(buffer, "mp4a", 0, end);
    const entryType = encodedEntry >= 0 ? encodedEntry : plainEntry;
    const channels = entryType >= 0 && entryType + 22 <= buffer.length ? new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength).getUint16(entryType + 20) : 1;
    if (findBytes(buffer, "dfLa", 0, end) >= 0) {
      return { codec: "flac", channels: channels || 1, preSkip: 0 };
    }
    if (entryType >= 0) {
      return { codec: "aac", channels: channels || 1, preSkip: 0 };
    }
    throw new Error("未识别的音频编码（需要 Opus、AAC 或 FLAC）");
  }
  function parseCencMetadata(head) {
    const mdatStart = findMdatStart(head);
    if (mdatStart < 0) throw new Error("未找到 mdat，MP4 头可能尚未拉完整");
    const boxes = [];
    walkBoxes(head, 0, Math.min(mdatStart - 8, head.length), (box) => boxes.push(box));
    const stsz = findBox(boxes, "stsz");
    const stts = findBox(boxes, "stts");
    const senc = findBox(boxes, "senc");
    const mdhd = findBox(boxes, "mdhd");
    if (!stsz || !stts || !senc || !mdhd) {
      throw new Error("CENC MP4 头缺少 stsz/stts/senc/mdhd");
    }
    const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
    const sizes = parseSampleSizes(stsz, view);
    const durations = parseDurations(stts, sizes.length, view);
    const ivs = parseIvs(senc, sizes.length, view);
    const timescale = parseTimescale(mdhd, view);
    const codec = parseCodec(head, mdatStart);
    const offsets = new Float64Array(sizes.length + 1);
    for (let i2 = 0; i2 < sizes.length; i2++) {
      offsets[i2 + 1] = offsets[i2] + sizes[i2];
      if (!Number.isSafeInteger(offsets[i2 + 1])) throw new Error("音频采样数据超过 JavaScript 安全整数范围");
    }
    let totalTicks = 0;
    for (const duration of durations) {
      totalTicks += duration;
      if (!Number.isSafeInteger(totalTicks)) throw new Error("音频总时长超过 JavaScript 安全整数范围");
    }
    return {
      ...codec,
      sampleCount: sizes.length,
      sizes,
      ivs,
      durations,
      timescale,
      mdatStart,
      offsets,
      totalTicks
    };
  }
  function cencIvSize(meta) {
    return meta.ivs.length / meta.sampleCount;
  }
  function normalizeCencKey(value) {
    if (typeof value === "string") {
      const bytes2 = hexToBytes(value);
      if (bytes2.length !== 16) throw new Error("AES-128 key 必须是 32 位 hex");
      return bytes2;
    }
    const bytes = asBytes(value);
    if (bytes.length !== 16) throw new Error("AES-128 key 必须是 16 字节");
    return bytes.slice();
  }
  async function importCencKey(value) {
    return getSubtle().importKey(
      "raw",
      normalizeCencKey(value),
      { name: "AES-CTR" },
      false,
      ["decrypt"]
    );
  }
  function makeCencCounter(iv, counterStart) {
    if (iv.length !== 8 && iv.length !== 16) throw new Error(`无效的 CENC IV 长度: ${iv.length}`);
    const counter = new Uint8Array(16);
    counter.set(iv);
    if (counterStart === 1) counter[15] = 1;
    return counter;
  }
  async function decryptCencSample(key, iv, ciphertext, counterStart) {
    const data = asBytes(ciphertext);
    const plain = await getSubtle().decrypt(
      { name: "AES-CTR", counter: makeCencCounter(iv, counterStart), length: 64 },
      key,
      data
    );
    return new Uint8Array(plain);
  }
  function ebmlVint(value, length) {
    if (!Number.isSafeInteger(value) || value < 0 || length < 1 || length > 8) {
      throw new Error(`无效的 EBML VINT: ${value}`);
    }
    const result = new Uint8Array(length);
    result[0] = 128 >> length - 1;
    let current = value;
    for (let i2 = length - 1; i2 > 0; i2--) {
      result[i2] = current & 255;
      current = Math.floor(current / 256);
    }
    const max = Math.pow(2, 7 * length);
    if (current >= max) throw new Error(`EBML VINT 溢出: ${value}`);
    result[0] |= current;
    return result;
  }
  function ebmlSize(value) {
    for (let length = 1; length <= 8; length++) {
      if (value < Math.pow(2, 7 * length) - 1) return ebmlVint(value, length);
    }
    throw new Error(`EBML size 过大: ${value}`);
  }
  function ebmlElement(id, payload) {
    return concatBytes(hexToBytes(id), ebmlSize(payload.length), payload);
  }
  function mp4Box(type, payload) {
    return concatBytes(be32(8 + payload.length), ascii(type), payload);
  }
  function matrixIdentity() {
    const matrix = new Uint8Array(36);
    const view = new DataView(matrix.buffer);
    view.setUint32(0, 65536);
    view.setUint32(16, 65536);
    view.setUint32(32, 1073741824);
    return matrix;
  }
  function signedBe16(value) {
    const result = new Uint8Array(2);
    new DataView(result.buffer).setInt16(0, value);
    return result;
  }
  function buildWebmInit(channels, preSkip, durationSeconds) {
    const ebml = ebmlElement("1A45DFA3", concatBytes(
      ebmlElement("4286", hexToBytes("01")),
      ebmlElement("42F7", hexToBytes("01")),
      ebmlElement("42F2", hexToBytes("04")),
      ebmlElement("42F3", hexToBytes("08")),
      ebmlElement("4282", strBytes("webm")),
      ebmlElement("4287", hexToBytes("04")),
      ebmlElement("4285", hexToBytes("02"))
    ));
    const codecDelayNs = Math.round(preSkip * 1e9 / 48e3);
    const duration = new Uint8Array(8);
    new DataView(duration.buffer).setFloat64(0, durationSeconds, false);
    const info2 = ebmlElement("1549A966", concatBytes(
      ebmlElement("2AD7B1", uintBytes(1e6)),
      ebmlElement("4489", duration),
      ebmlElement("4D80", strBytes("clearKeyStreamer")),
      ebmlElement("5741", strBytes("clearKeyStreamer"))
    ));
    const sampleRate = new Uint8Array(4);
    new DataView(sampleRate.buffer).setFloat32(0, 48e3, false);
    const audio2 = ebmlElement("E1", concatBytes(
      ebmlElement("B5", sampleRate),
      ebmlElement("9F", uintBytes(channels))
    ));
    const track = ebmlElement("AE", concatBytes(
      ebmlElement("D7", hexToBytes("01")),
      ebmlElement("73C5", uintBytes(1)),
      ebmlElement("83", hexToBytes("02")),
      ebmlElement("86", strBytes("A_OPUS")),
      ebmlElement("63A2", buildOpusHead(channels, preSkip)),
      ebmlElement("56AA", uintBytes(codecDelayNs)),
      ebmlElement("56BB", uintBytes(8e7)),
      audio2
    ));
    const tracks = ebmlElement("1654AE6B", track);
    return concatBytes(ebml, hexToBytes("18538067"), hexToBytes("01FFFFFFFFFFFFFF"), info2, tracks);
  }
  function buildOpusHead(channels, preSkip) {
    const head = new Uint8Array(19);
    head.set([79, 112, 117, 115, 72, 101, 97, 100], 0);
    const view = new DataView(head.buffer);
    head[8] = 1;
    head[9] = channels;
    view.setUint16(10, preSkip, true);
    view.setUint32(12, 48e3, true);
    view.setInt16(16, 0, true);
    head[18] = 0;
    return head;
  }
  function buildWebmCluster(baseMs, relativeMs, packets) {
    if (relativeMs.length !== packets.length) throw new Error("WebM 时间戳和采样数不一致");
    const blocks = [];
    for (let i2 = 0; i2 < packets.length; i2++) {
      const relative = relativeMs[i2];
      if (relative === void 0 || relative < -32768 || relative > 32767) {
        throw new Error(`WebM 相对时间戳超出 Int16: ${relative}`);
      }
      const trackAndFlags = new Uint8Array([129, 128]);
      blocks.push(ebmlElement("A3", concatBytes(
        trackAndFlags.slice(0, 1),
        signedBe16(relative),
        trackAndFlags.slice(1),
        packets[i2]
      )));
    }
    return ebmlElement("1F43B675", concatBytes(
      ebmlElement("E7", uintBytes(baseMs)),
      concatBytes(...blocks)
    ));
  }
  function replaceFourcc(buffer, offset, type) {
    buffer.set(ascii(type), offset);
  }
  function extractSampleEntry(head, mdatStart) {
    const encoded = findBytes(head, "enca", 0, mdatStart - 1);
    const plain = findBytes(head, "mp4a", 0, mdatStart - 1);
    const typeOffset = encoded >= 0 ? encoded : plain;
    if (typeOffset < 4) throw new Error("未找到 AAC 音频采样入口");
    const entryOffset = typeOffset - 4;
    const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
    const size = view.getUint32(entryOffset);
    if (size < 8 || entryOffset + size > head.length) throw new Error("AAC 采样入口不完整");
    const entry = new Uint8Array(head.slice(entryOffset, entryOffset + size));
    const enca = findBytes(entry, "enca", 0);
    if (enca >= 0) replaceFourcc(entry, enca, "mp4a");
    const sinf = findBytes(entry, "sinf", 8);
    if (sinf >= 0) replaceFourcc(entry, sinf, "free");
    return entry;
  }
  function extractFlacEntry(head, mdatStart) {
    const encoded = findBytes(head, "enca", 0, mdatStart - 1);
    if (encoded < 4) throw new Error("未找到 FLAC 加密采样入口");
    const entryOffset = encoded - 4;
    const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
    const size = view.getUint32(entryOffset);
    if (size < 8 || entryOffset + size > head.length) throw new Error("FLAC 采样入口不完整");
    const entry = new Uint8Array(head.slice(entryOffset, entryOffset + size));
    replaceFourcc(entry, encoded - entryOffset, "fLaC");
    const sinf = findBytes(entry, "sinf", 8);
    if (sinf >= 0) replaceFourcc(entry, sinf, "free");
    return entry;
  }
  function buildMp4Init(sampleEntry, timescale, totalTicks) {
    const totalSeconds = totalTicks / timescale;
    const matrix = matrixIdentity();
    const mvhd = mp4Box("mvhd", concatBytes(
      be32(0),
      be32(0),
      be32(0),
      be32(1e3),
      be32(Math.round(totalSeconds * 1e3)),
      be32(65536),
      be16(256),
      be16(0),
      new Uint8Array(8),
      matrix,
      new Uint8Array(24),
      be32(2)
    ));
    const tkhd = mp4Box("tkhd", concatBytes(
      be32(7),
      be32(0),
      be32(0),
      be32(1),
      be32(0),
      be32(0),
      new Uint8Array(8),
      be16(0),
      be16(0),
      be16(256),
      be16(0),
      matrix,
      be32(0),
      be32(0)
    ));
    const mdhd = mp4Box("mdhd", concatBytes(
      be32(0),
      be32(0),
      be32(0),
      be32(timescale),
      be32(totalTicks),
      be16(21956),
      be16(0)
    ));
    const hdlr = mp4Box("hdlr", concatBytes(
      be32(0),
      be32(0),
      ascii("soun"),
      new Uint8Array(12)
    ));
    const smhd = mp4Box("smhd", concatBytes(be32(0), be16(0), be16(0)));
    const url = mp4Box("url ", be32(1));
    const dref = mp4Box("dref", concatBytes(be32(0), be32(1), url));
    const dinf = mp4Box("dinf", dref);
    const stsd = mp4Box("stsd", concatBytes(be32(0), be32(1), sampleEntry));
    const stts = mp4Box("stts", concatBytes(be32(0), be32(0)));
    const stsc = mp4Box("stsc", concatBytes(be32(0), be32(0)));
    const stsz = mp4Box("stsz", concatBytes(be32(0), be32(0), be32(0)));
    const stco = mp4Box("stco", concatBytes(be32(0), be32(0)));
    const stbl = mp4Box("stbl", concatBytes(stsd, stts, stsc, stsz, stco));
    const minf = mp4Box("minf", concatBytes(smhd, dinf, stbl));
    const mdia = mp4Box("mdia", concatBytes(mdhd, hdlr, minf));
    const trak = mp4Box("trak", concatBytes(tkhd, mdia));
    const trex = mp4Box("trex", concatBytes(be32(0), be32(1), be32(1), be32(0), be32(0), be32(0)));
    const mvex = mp4Box("mvex", trex);
    const moov = mp4Box("moov", concatBytes(mvhd, trak, mvex));
    const ftyp = mp4Box("ftyp", concatBytes(ascii("isom"), be32(512), ascii("isomiso2mp41dash")));
    return concatBytes(ftyp, moov);
  }
  function buildMp4Segment(baseDecodeTick, samples, sequence) {
    if (samples.length === 0) throw new Error("MP4 segment 不能没有采样");
    const sampleTable = samples.flatMap((sample) => [be32(sample.duration), be32(sample.data.length)]);
    const mfhd = mp4Box("mfhd", concatBytes(be32(0), be32(sequence)));
    const tfhd = mp4Box("tfhd", concatBytes(be32(131072), be32(1)));
    const tfdt = mp4Box("tfdt", concatBytes(be32(16777216), be64(baseDecodeTick)));
    const makeTrun = (offset) => mp4Box("trun", concatBytes(
      be32(769),
      be32(samples.length),
      be32(offset),
      concatBytes(...sampleTable)
    ));
    const makeMoof = (offset) => mp4Box("moof", concatBytes(
      mfhd,
      mp4Box("traf", concatBytes(tfhd, tfdt, makeTrun(offset)))
    ));
    const mediaPayload = concatBytes(...samples.map((sample) => sample.data));
    const dataOffset = makeMoof(0).length + 8;
    return concatBytes(makeMoof(dataOffset), mp4Box("mdat", mediaPayload));
  }
  function codecMime(codec) {
    if (codec === "opus") return 'audio/webm;codecs="opus"';
    if (codec === "flac") return 'audio/mp4; codecs="fLaC"';
    return 'audio/mp4; codecs="mp4a.40.2"';
  }
  function initSegment(meta, sampleEntry) {
    if (meta.codec === "opus") {
      const playableTicks = Math.max(0, meta.totalTicks - meta.preSkip);
      return buildWebmInit(meta.channels, meta.preSkip, playableTicks / meta.timescale);
    }
    if (!sampleEntry) throw new Error("MP4 编码缺少 sample entry");
    return buildMp4Init(sampleEntry, meta.timescale, meta.totalTicks);
  }
  const DEFAULT_HEAD_BYTES = 512 * 1024;
  const DEFAULT_MAX_HEAD_BYTES = 8 * 1024 * 1024;
  const DEFAULT_SEGMENT_SECONDS = 15;
  const MAX_WEBM_SEGMENT_SECONDS = 30;
  const DEFAULT_MAX_BUFFER_AHEAD = 40;
  const DEFAULT_KEEP_BEHIND = 10;
  const DEFAULT_DECRYPT_CONCURRENCY = 24;
  function asError(value) {
    return value instanceof Error ? value : new Error(String(value));
  }
  function abortError$1() {
    return new DOMException("播放器会话已取消", "AbortError");
  }
  function isAbort(value) {
    return value instanceof DOMException && value.name === "AbortError";
  }
  function waitForSourceBufferIdle(sourceBuffer, signal) {
    if (!sourceBuffer.updating) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => {
        sourceBuffer.removeEventListener("updateend", done);
        sourceBuffer.removeEventListener("abort", done);
        sourceBuffer.removeEventListener("error", done);
        signal.removeEventListener("abort", done);
        resolve();
      };
      sourceBuffer.addEventListener("updateend", done);
      sourceBuffer.addEventListener("abort", done);
      sourceBuffer.addEventListener("error", done);
      signal.addEventListener("abort", done, { once: true });
    });
  }
  function describeMediaError(audio2) {
    const error2 = audio2.error;
    if (!error2) return "";
    const names = {
      1: "MEDIA_ERR_ABORTED",
      2: "MEDIA_ERR_NETWORK",
      3: "MEDIA_ERR_DECODE（数据不是合法音频，多半在传输中被破坏）",
      4: "MEDIA_ERR_SRC_NOT_SUPPORTED"
    };
    const name2 = names[error2.code] ?? `code ${error2.code}`;
    return `：${name2}${error2.message ? ` - ${error2.message}` : ""}`;
  }
  function validatePositive(value, fallback, name2) {
    const result = value ?? fallback;
    if (!Number.isFinite(result) || result <= 0) throw new Error(`${name2} 必须是正数`);
    return result;
  }
  async function mapLimit(items, limit, worker) {
    const results = new Array(items.length);
    let next = 0;
    async function consume() {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index]);
      }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => consume()));
    return results;
  }
  class SequentialByteStream {
    constructor(initial = new Uint8Array(), reader = null, openReader = null) {
      __publicField(this, "chunks", []);
      __publicField(this, "chunkOffset", 0);
      __publicField(this, "available", 0);
      __publicField(this, "reader");
      __publicField(this, "openReader");
      __publicField(this, "eof", false);
      if (initial.length > 0) {
        const copy = new Uint8Array(initial);
        this.chunks.push(copy);
        this.available = copy.length;
      }
      this.reader = reader;
      this.openReader = openReader;
    }
    /** 至少缓存 length 字节；流先结束时返回 false。 */
    async bufferAtLeast(length) {
      while (this.available < length && !this.eof) await this.pull();
      return this.available >= length;
    }
    /** 复制当前全部未消费数据，不移动读取位置。 */
    snapshot() {
      const result = new Uint8Array(this.available);
      let output = 0;
      for (let i2 = 0; i2 < this.chunks.length; i2++) {
        const chunk = this.chunks[i2];
        const start = i2 === 0 ? this.chunkOffset : 0;
        result.set(chunk.subarray(start), output);
        output += chunk.length - start;
      }
      return result;
    }
    async skip(length) {
      await this.readExactly(length);
    }
    async readExactly(length) {
      if (!Number.isSafeInteger(length) || length < 0) {
        throw new Error(`无效的流读取长度: ${length}`);
      }
      if (length === 0) return new Uint8Array();
      if (!await this.bufferAtLeast(length)) {
        throw new Error(`音频流提前结束（还需 ${length - this.available} 字节）`);
      }
      const result = new Uint8Array(length);
      let output = 0;
      while (output < length) {
        const chunk = this.chunks[0];
        const take = Math.min(length - output, chunk.length - this.chunkOffset);
        result.set(chunk.subarray(this.chunkOffset, this.chunkOffset + take), output);
        output += take;
        this.chunkOffset += take;
        this.available -= take;
        if (this.chunkOffset === chunk.length) {
          this.chunks.shift();
          this.chunkOffset = 0;
        }
      }
      return result;
    }
    async cancel() {
      var _a;
      this.eof = true;
      try {
        await ((_a = this.reader) == null ? void 0 : _a.cancel());
      } catch {
      }
      this.reader = null;
    }
    async pull() {
      if (!this.reader && this.openReader) this.reader = await this.openReader();
      if (!this.reader) {
        this.eof = true;
        return;
      }
      const { value, done } = await this.reader.read();
      if (done) {
        this.eof = true;
        return;
      }
      if (value == null ? void 0 : value.length) {
        const copy = new Uint8Array(value);
        this.chunks.push(copy);
        this.available += copy.length;
      }
    }
  }
  class CencAudioPlayer {
    constructor(audio2, options = {}) {
      __publicField(this, "audio");
      __publicField(this, "options");
      __publicField(this, "state", "idle");
      __publicField(this, "session", 0);
      __publicField(this, "streamToken", 0);
      __publicField(this, "seekToken", 0);
      __publicField(this, "sessionController", null);
      __publicField(this, "streamController", null);
      __publicField(this, "sourceBuffer", null);
      __publicField(this, "mediaSource", null);
      __publicField(this, "objectUrl", null);
      __publicField(this, "sourceBufferChain", Promise.resolve());
      __publicField(this, "context", null);
      __publicField(this, "info", null);
      __publicField(this, "autoplay", false);
      __publicField(this, "segmentSequence", 0);
      __publicField(this, "onSeeking", () => {
        const context = this.context;
        if (!context || this.state === "destroyed" || this.session === 0) return;
        if (this.audio.error) return;
        const target = this.audio.currentTime;
        if (!Number.isFinite(target) || this.isTimeBuffered(target)) return;
        const wasPlaying = !this.audio.paused;
        void this.restartAt(target, wasPlaying);
      });
      __publicField(this, "onPlay", () => {
        if (this.context && this.state !== "destroyed") this.emitState("playing");
      });
      __publicField(this, "onPause", () => {
        if (this.context && this.state === "playing" && !this.audio.ended) this.emitState("paused");
      });
      __publicField(this, "onEnded", () => {
        if (this.context && this.state !== "destroyed") this.emitState("ended");
      });
      this.audio = audio2;
      const fetcher = (options.fetch ?? fetch$1).bind(unsafeWindow);
      this.options = {
        headBytes: validatePositive(options.headBytes, DEFAULT_HEAD_BYTES, "headBytes"),
        maxHeadBytes: validatePositive(options.maxHeadBytes, DEFAULT_MAX_HEAD_BYTES, "maxHeadBytes"),
        segmentSeconds: validatePositive(options.segmentSeconds, DEFAULT_SEGMENT_SECONDS, "segmentSeconds"),
        maxBufferAheadSeconds: validatePositive(options.maxBufferAheadSeconds, DEFAULT_MAX_BUFFER_AHEAD, "maxBufferAheadSeconds"),
        keepBehindSeconds: validatePositive(options.keepBehindSeconds, DEFAULT_KEEP_BEHIND, "keepBehindSeconds"),
        decryptConcurrency: Math.max(1, Math.floor(validatePositive(options.decryptConcurrency, DEFAULT_DECRYPT_CONCURRENCY, "decryptConcurrency"))),
        onStateChange: options.onStateChange,
        onProgress: options.onProgress,
        onMessage: options.onMessage,
        // config.fetch 保存的是页面 fetch 的原始引用，避免被字节 SDK 改写。
        fetch: fetcher
      };
      this.audio.addEventListener("seeking", this.onSeeking);
      this.audio.addEventListener("play", this.onPlay);
      this.audio.addEventListener("pause", this.onPause);
      this.audio.addEventListener("ended", this.onEnded);
    }
    get currentState() {
      return this.state;
    }
    get mediaInfo() {
      return this.info;
    }
    get element() {
      return this.audio;
    }
    /** 加载并开始后台缓冲；autoplay 只表示首次缓冲后尝试调用 audio.play。 */
    async load(source, autoplay = false) {
      this.ensureAlive();
      const session = this.beginSession();
      this.autoplay = autoplay;
      this.emitState("loading");
      let initialStream = null;
      try {
        const url = this.validateUrl(source.url);
        this.streamController = new AbortController();
        initialStream = this.createNetworkStream(url, 0, this.streamController.signal);
        let { head, meta } = await this.parseHeadFromStream(initialStream, session);
        this.assertSession(session);
        const key = await importCencKey(source.key);
        this.assertSession(session);
        let counterStart = 0;
        if (meta.codec === "opus") {
          const probeEnd = meta.mdatStart + meta.offsets[Math.min(6, meta.sampleCount)];
          if (head.length < probeEnd) {
            await initialStream.bufferAtLeast(probeEnd);
            head = initialStream.snapshot();
          }
          counterStart = await this.detectCounterStart(meta, head, key);
        }
        this.assertSession(session);
        const sampleEntry = meta.codec === "aac" ? extractSampleEntry(head, meta.mdatStart) : meta.codec === "flac" ? extractFlacEntry(head, meta.mdatStart) : void 0;
        const mime = codecMime(meta.codec);
        const ctor = this.mediaSourceConstructor();
        if (!ctor.isTypeSupported(mime)) throw new Error(`浏览器不支持 MSE 音频格式: ${mime}`);
        const mediaSource = new ctor();
        this.mediaSource = mediaSource;
        this.objectUrl = unsafeWindow.URL.createObjectURL(mediaSource);
        const opened = this.waitForSourceOpen(mediaSource, session);
        this.audio.src = this.objectUrl;
        await opened;
        this.assertSession(session);
        this.sourceBuffer = mediaSource.addSourceBuffer(mime);
        this.segmentSequence = 0;
        const init = initSegment(meta, sampleEntry);
        this.emitMessage(`追加 init 段 ${init.byteLength} 字节 (${mime})`, "info");
        await this.enqueueSourceBuffer(session, (sourceBuffer) => {
          sourceBuffer.appendBuffer(this.toPageBuffer(init));
        });
        this.assertSession(session);
        const ticks = new Float64Array(meta.sampleCount + 1);
        for (let i2 = 0; i2 < meta.sampleCount; i2++) {
          ticks[i2 + 1] = ticks[i2] + meta.durations[i2];
        }
        const durationSeconds = meta.totalTicks / meta.timescale;
        const samplesPerSecond = meta.sampleCount / durationSeconds;
        const segmentSeconds = meta.codec === "opus" ? Math.min(this.options.segmentSeconds, MAX_WEBM_SEGMENT_SECONDS) : this.options.segmentSeconds;
        this.context = {
          url,
          head,
          meta,
          key,
          counterStart,
          ticks,
          samplesPerSecond,
          samplesPerSegment: Math.max(1, Math.round(samplesPerSecond * segmentSeconds))
        };
        this.info = {
          codec: meta.codec,
          sampleCount: meta.sampleCount,
          durationSeconds,
          timescale: meta.timescale,
          channels: meta.channels,
          encryptedBytes: meta.offsets[meta.sampleCount]
        };
        await initialStream.skip(meta.mdatStart);
        this.assertSession(session);
        this.emitState("ready");
        this.startStream(0, initialStream);
        initialStream = null;
        return this.info;
      } catch (error2) {
        void (initialStream == null ? void 0 : initialStream.cancel());
        if (this.isCurrent(session) && !isAbort(error2)) {
          this.emitMessage(asError(error2).message, "error");
          void this.reportAppendFailure();
          this.emitState("error");
        }
        throw error2;
      }
    }
    /** load(..., true) 的便捷形式。 */
    start(source) {
      return this.load(source, true);
    }
    play() {
      this.ensureAlive();
      return this.audio.play().then(() => void 0);
    }
    pause() {
      this.audio.pause();
    }
    /** 停止当前流并释放 MSE URL，但保留播放器实例以便再次 load。 */
    stop() {
      if (this.state === "destroyed") return;
      this.beginSession();
      this.emitState("idle");
    }
    destroy() {
      if (this.state === "destroyed") return;
      this.beginSession();
      this.audio.removeEventListener("seeking", this.onSeeking);
      this.audio.removeEventListener("play", this.onPlay);
      this.audio.removeEventListener("pause", this.onPause);
      this.audio.removeEventListener("ended", this.onEnded);
      this.emitState("destroyed");
    }
    ensureAlive() {
      if (this.state === "destroyed") throw new Error("播放器已销毁");
    }
    beginSession() {
      var _a, _b;
      this.session++;
      this.streamToken++;
      this.seekToken++;
      (_a = this.sessionController) == null ? void 0 : _a.abort();
      (_b = this.streamController) == null ? void 0 : _b.abort();
      this.sessionController = new AbortController();
      this.streamController = null;
      this.context = null;
      this.info = null;
      this.autoplay = false;
      this.sourceBuffer = null;
      this.mediaSource = null;
      this.sourceBufferChain = Promise.resolve();
      this.audio.pause();
      if (this.audio.src) {
        this.audio.removeAttribute("src");
        this.audio.load();
      }
      if (this.objectUrl) {
        unsafeWindow.URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = null;
      }
      return this.session;
    }
    validateUrl(raw) {
      const url = raw.trim();
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("音频 URL 必须是 HTTP(S) 地址");
      }
      return parsed.toString();
    }
    mediaSourceConstructor() {
      const win2 = unsafeWindow;
      const ctor = win2.MediaSource ?? globalThis.MediaSource;
      if (!ctor) throw new Error("当前浏览器没有 MediaSource 支持");
      return ctor;
    }
    /**
     * 把字节搬到页面 realm，再交给 appendBuffer。
     *
     * MediaSource 取自 unsafeWindow（页面 realm），而我们构造的 Uint8Array
     * 属于用户脚本沙箱 realm。跨 realm 的 ArrayBuffer 传进 appendBuffer 会被拒，
     * 表现是 SourceBuffer 立刻抛 error 事件、而 <audio>.error 仍是 null
     * —— 只看报错完全看不出是 realm 问题。
     *
     * 页面 realm 没暴露 Uint8Array 时（少见）就原样返回，交给浏览器自己判断。
     */
    toPageBuffer(bytes) {
      const win2 = unsafeWindow;
      const PageUint8Array = win2.Uint8Array;
      if (!PageUint8Array || PageUint8Array === Uint8Array) return bytes;
      const copy = new PageUint8Array(bytes.byteLength);
      copy.set(bytes);
      return copy;
    }
    async parseHeadFromStream(stream, session) {
      let size = Math.min(this.options.headBytes, this.options.maxHeadBytes);
      let lastError = null;
      while (size <= this.options.maxHeadBytes) {
        const complete = await stream.bufferAtLeast(size);
        this.assertSession(session);
        const head = stream.snapshot();
        try {
          return { head, meta: parseCencMetadata(head) };
        } catch (error2) {
          lastError = error2;
          const message = asError(error2).message;
          const incomplete = /未找到|不完整|缺少/.test(message);
          if (!incomplete || !complete || size === this.options.maxHeadBytes) throw error2;
          size = Math.min(this.options.maxHeadBytes, size * 2);
        }
      }
      throw lastError instanceof Error ? lastError : new Error("无法解析音频 MP4 头");
    }
    createNetworkStream(url, start, signal, initial = new Uint8Array()) {
      return new SequentialByteStream(
        initial,
        null,
        () => this.openAudioReader(url, start, signal)
      );
    }
    /**
     * 打开一条从指定字节一直到文件末尾的流。
     * 所有 CDN 请求都明确禁止 Referer、Cookie；顺序播放期间只会打开一次。
     */
    async openAudioReader(url, start, signal) {
      this.emitMessage(`打开音频流：bytes=${start}-`, "info");
      const response = await this.options.fetch(url, {
        method: "GET",
        headers: { Range: `bytes=${start}-` },
        credentials: "omit",
        // 两项都设：policy 禁止浏览器生成 Referer，空 referrer 防止调用方 Request 继承。
        referrer: "",
        referrerPolicy: "no-referrer",
        signal
      });
      if (!response.ok && response.status !== 206) {
        throw new Error(`音频 CDN 请求失败(HTTP ${response.status})`);
      }
      if (start > 0 && response.status !== 206) {
        throw new Error("音频 CDN 忽略了 Range，无法从拖动位置续流");
      }
      if (response.body) return response.body.getReader();
      const bytes = await response.arrayBuffer();
      const fallback = new Response(bytes).body;
      if (!fallback) throw new Error("浏览器不支持流式读取 Response");
      return fallback.getReader();
    }
    sessionSignal(session) {
      this.assertSession(session);
      return this.sessionController.signal;
    }
    assertSession(session) {
      if (!this.isCurrent(session)) throw abortError$1();
    }
    isCurrent(session) {
      var _a;
      return this.session === session && !((_a = this.sessionController) == null ? void 0 : _a.signal.aborted);
    }
    async waitForSourceOpen(mediaSource, session) {
      const signal = this.sessionSignal(session);
      await new Promise((resolve, reject) => {
        if (mediaSource.readyState === "open") {
          resolve();
          return;
        }
        const onOpen = () => {
          cleanup();
          resolve();
        };
        const onError = () => {
          cleanup();
          reject(new Error("MediaSource 打开失败"));
        };
        const onAbort = () => {
          cleanup();
          reject(abortError$1());
        };
        const cleanup = () => {
          mediaSource.removeEventListener("sourceopen", onOpen);
          mediaSource.removeEventListener("error", onError);
          signal.removeEventListener("abort", onAbort);
        };
        mediaSource.addEventListener("sourceopen", onOpen, { once: true });
        mediaSource.addEventListener("error", onError, { once: true });
        signal.addEventListener("abort", onAbort, { once: true });
      });
    }
    enqueueSourceBuffer(session, operation) {
      const sourceBuffer = this.sourceBuffer;
      if (!sourceBuffer) return Promise.reject(new Error("SourceBuffer 尚未创建"));
      const signal = this.sessionSignal(session);
      const run = async () => {
        if (signal.aborted) throw abortError$1();
        await waitForSourceBufferIdle(sourceBuffer, signal);
        if (signal.aborted) throw abortError$1();
        return new Promise((resolve, reject) => {
          let settled = false;
          const finish = (error2) => {
            if (settled) return;
            settled = true;
            sourceBuffer.removeEventListener("updateend", onUpdateEnd);
            sourceBuffer.removeEventListener("error", onError);
            signal.removeEventListener("abort", onAbort);
            if (error2) reject(error2);
            else resolve();
          };
          const onUpdateEnd = () => finish();
          const onError = () => finish(new Error("SourceBuffer 更新失败"));
          const onAbort = () => finish(abortError$1());
          sourceBuffer.addEventListener("updateend", onUpdateEnd);
          sourceBuffer.addEventListener("error", onError);
          signal.addEventListener("abort", onAbort, { once: true });
          try {
            operation(sourceBuffer);
          } catch (error2) {
            finish(asError(error2));
          }
        });
      };
      const next = this.sourceBufferChain.catch(() => void 0).then(run);
      this.sourceBufferChain = next;
      return next;
    }
    startStream(startSample, existingStream) {
      var _a;
      const context = this.context;
      if (!context || this.state === "destroyed") return;
      if (!existingStream) {
        (_a = this.streamController) == null ? void 0 : _a.abort();
        this.streamController = new AbortController();
      }
      const controller = this.streamController;
      if (!controller) return;
      const token = ++this.streamToken;
      void this.runStream(
        context,
        this.session,
        token,
        startSample,
        controller.signal,
        existingStream
      );
    }
    async runStream(context, session, token, startSample, signal, existingStream) {
      var _a;
      let sample = startSample;
      let first = true;
      let stream = existingStream ?? null;
      try {
        stream ?? (stream = this.createSampleStream(context, startSample, signal));
        while (this.isStreamCurrent(session, token, signal) && sample < context.meta.sampleCount) {
          await this.waitForRoom(session, token, signal);
          if (!this.isStreamCurrent(session, token, signal)) return;
          const endSample = Math.min(context.meta.sampleCount, sample + context.samplesPerSegment);
          const byteLength = context.meta.offsets[endSample] - context.meta.offsets[sample];
          const encrypted = await stream.readExactly(byteLength);
          if (!this.isStreamCurrent(session, token, signal)) return;
          const plain = await this.decryptRange(context, encrypted, sample, endSample);
          if (!this.isStreamCurrent(session, token, signal)) return;
          const segment = context.meta.codec === "opus" ? buildWebmCluster(
            Math.round(context.ticks[sample] * 1e3 / context.meta.timescale),
            plain.map((_, index) => Math.round(
              context.ticks[sample + index] * 1e3 / context.meta.timescale
            ) - Math.round(context.ticks[sample] * 1e3 / context.meta.timescale)),
            plain
          ) : buildMp4Segment(
            context.ticks[sample],
            plain.map((data, index) => ({
              data,
              duration: context.meta.durations[sample + index]
            })),
            ++this.segmentSequence
          );
          await this.enqueueSourceBuffer(session, (sourceBuffer) => {
            sourceBuffer.appendBuffer(this.toPageBuffer(segment));
          });
          if (first) {
            const toc = (_a = plain[0]) == null ? void 0 : _a[0];
            this.emitMessage(
              `首段 samples=${sample}..${endSample} 密文${encrypted.byteLength}B 段长${segment.byteLength}B TOC=0x${(toc ?? 0).toString(16)}`,
              "info"
            );
          }
          if (!this.isStreamCurrent(session, token, signal)) return;
          await this.evictBehind(session);
          sample = endSample;
          this.emitProgress({
            processedSamples: sample,
            totalSamples: context.meta.sampleCount,
            percent: Math.round(sample / context.meta.sampleCount * 100),
            bufferedAhead: this.bufferedAhead(),
            durationSeconds: context.meta.totalTicks / context.meta.timescale
          });
          if (first && this.autoplay) {
            first = false;
            void this.audio.play().catch(() => {
              this.emitMessage("自动播放被浏览器拦截，请点击音频控件播放", "warn");
            });
          } else {
            first = false;
          }
        }
        if (this.isStreamCurrent(session, token, signal)) {
          await this.finishStream(session, sample);
          this.emitMessage("音频已缓冲到结尾", "info");
        }
      } catch (error2) {
        if (this.isStreamCurrent(session, token, signal) && !isAbort(error2)) {
          this.emitMessage(asError(error2).message, "error");
          void this.reportAppendFailure();
          this.emitState("error");
        }
      } finally {
        void (stream == null ? void 0 : stream.cancel());
      }
    }
    /**
     * 补报媒体元素的错误码。
     *
     * SourceBuffer 的 error 事件先于媒体元素错误传播，同步读 audio.error
     * 大概率是 null。让出一轮事件循环再读，才能拿到真正的 MediaError。
     */
    async reportAppendFailure() {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const detail = describeMediaError(this.audio);
      if (detail) this.emitMessage(`媒体元素错误${detail}`, "error");
    }
    isStreamCurrent(session, token, signal) {
      return this.isCurrent(session) && this.streamToken === token && !signal.aborted;
    }
    /**
     * 全部样本都送进 SourceBuffer 后收口 MediaSource。
     *
     * 只有真的跑到最后一个样本才收口。seek 之后的流也会走到循环末尾，
     * 但那时前面还有没缓冲的区间，提前 endOfStream 会把 duration 定在错的位置。
     */
    async finishStream(session, lastSample) {
      const context = this.context;
      const mediaSource = this.mediaSource;
      if (!context || !mediaSource) return;
      if (lastSample < context.meta.sampleCount) return;
      if (mediaSource.readyState !== "open") return;
      await this.sourceBufferChain.catch(() => void 0);
      if (!this.isCurrent(session)) return;
      if (this.sourceBuffer) {
        await waitForSourceBufferIdle(this.sourceBuffer, this.sessionSignal(session));
      }
      if (!this.isCurrent(session) || mediaSource.readyState !== "open") return;
      try {
        mediaSource.endOfStream();
      } catch (error2) {
        this.emitMessage(`标记音频结尾失败: ${asError(error2).message}`, "warn");
      }
    }
    async waitForRoom(session, token, signal) {
      while (this.isStreamCurrent(session, token, signal) && this.bufferedAhead() >= this.options.maxBufferAheadSeconds) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      if (!this.isStreamCurrent(session, token, signal)) throw abortError$1();
    }
    /**
     * seek 后的新流。目标仍在已保存的 MP4 头内时先复用内存字节，读完再从
     * head.length 开一条网络流；否则直接从目标 sample 的绝对偏移续传。
     */
    createSampleStream(context, startSample, signal) {
      const start = context.meta.mdatStart + context.meta.offsets[startSample];
      if (start < context.head.length) {
        return this.createNetworkStream(
          context.url,
          context.head.length,
          signal,
          context.head.slice(start)
        );
      }
      return this.createNetworkStream(context.url, start, signal);
    }
    async decryptRange(context, encrypted, startSample, endSample) {
      const ivSize = cencIvSize(context.meta);
      const jobs = [];
      for (let i2 = startSample; i2 < endSample; i2++) {
        const relative = context.meta.offsets[i2] - context.meta.offsets[startSample];
        const size = context.meta.sizes[i2];
        jobs.push({
          iv: context.meta.ivs.slice(i2 * ivSize, (i2 + 1) * ivSize),
          ciphertext: encrypted.slice(relative, relative + size)
        });
      }
      return mapLimit(jobs, this.options.decryptConcurrency, (job) => decryptCencSample(
        context.key,
        job.iv,
        job.ciphertext,
        context.counterStart
      ));
    }
    async detectCounterStart(meta, head, key) {
      const count = Math.min(6, meta.sampleCount);
      if (count === 0) return 0;
      const start = meta.mdatStart + meta.offsets[0];
      const end = meta.mdatStart + meta.offsets[count] - 1;
      if (end >= head.length) throw new Error("Opus counter 探测数据不完整");
      const encrypted = head.slice(start, end + 1);
      const ivSize = cencIvSize(meta);
      for (const candidate of [0, 1]) {
        const firstBytes = /* @__PURE__ */ new Set();
        for (let i2 = 0; i2 < count; i2++) {
          const relative = meta.offsets[i2];
          const ciphertext = encrypted.slice(relative, relative + meta.sizes[i2]);
          const plain = await decryptCencSample(
            key,
            meta.ivs.slice(i2 * ivSize, (i2 + 1) * ivSize),
            ciphertext,
            candidate
          );
          if (plain.length > 0) firstBytes.add(plain[0]);
        }
        if (firstBytes.size === 1) {
          this.emitMessage(`CENC counter 低位起始=${candidate}`, "info");
          return candidate;
        }
      }
      this.emitMessage("CENC counter 未收敛，按 0 继续", "warn");
      return 0;
    }
    async evictBehind(session) {
      const sourceBuffer = this.sourceBuffer;
      if (!sourceBuffer || !sourceBuffer.buffered.length) return;
      const current = this.audio.currentTime;
      if (current <= this.options.keepBehindSeconds + 5) return;
      const start = sourceBuffer.buffered.start(0);
      const end = current - this.options.keepBehindSeconds;
      if (start < end) {
        try {
          await this.enqueueSourceBuffer(session, (buffer) => buffer.remove(start, end));
        } catch {
        }
      }
    }
    async restartAt(target, wasPlaying) {
      var _a, _b;
      const context = this.context;
      if (!context) return;
      if (this.audio.error) {
        this.emitMessage("播放元素已进入错误态，无法跳转，请重新开始听书", "warn");
        return;
      }
      const session = this.session;
      const seek = ++this.seekToken;
      this.streamToken++;
      (_a = this.streamController) == null ? void 0 : _a.abort();
      let low = 0;
      let high = context.meta.sampleCount - 1;
      let index = 0;
      const targetTicks = target * context.meta.timescale;
      while (low <= high) {
        const middle = low + high >> 1;
        if (context.ticks[middle] <= targetTicks) {
          index = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      const preSamples = Math.max(1, Math.round(context.samplesPerSecond * 2));
      const startSample = Math.max(0, index - preSamples);
      this.emitMessage(`跳转到 ${target.toFixed(1)} 秒`, "info");
      await this.sourceBufferChain.catch(() => void 0);
      if (seek !== this.seekToken || !this.isCurrent(session)) return;
      const bufferedEnd = ((_b = this.sourceBuffer) == null ? void 0 : _b.buffered.length) ? this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1) : 0;
      if (bufferedEnd > 0) {
        try {
          await this.enqueueSourceBuffer(session, (sourceBuffer) => sourceBuffer.remove(0, bufferedEnd + 0.5));
        } catch {
        }
      }
      if (seek !== this.seekToken || !this.isCurrent(session)) return;
      if (this.mediaSource && this.mediaSource.readyState === "closed") {
        this.emitMessage("媒体源已关闭，无法跳转", "warn");
        return;
      }
      this.startStream(startSample);
      if (wasPlaying) void this.audio.play().catch(() => void 0);
    }
    isTimeBuffered(time) {
      var _a;
      const ranges = (_a = this.sourceBuffer) == null ? void 0 : _a.buffered;
      if (!ranges) return false;
      for (let i2 = 0; i2 < ranges.length; i2++) {
        if (time >= ranges.start(i2) - 0.05 && time <= ranges.end(i2) + 0.05) return true;
      }
      return false;
    }
    bufferedAhead() {
      var _a;
      const ranges = (_a = this.sourceBuffer) == null ? void 0 : _a.buffered;
      if (!ranges || !ranges.length) return 0;
      const current = this.audio.currentTime;
      for (let i2 = 0; i2 < ranges.length; i2++) {
        if (current >= ranges.start(i2) - 0.05 && current <= ranges.end(i2) + 0.05) {
          return Math.max(0, ranges.end(i2) - current);
        }
      }
      return Math.max(0, ranges.end(ranges.length - 1) - current);
    }
    emitState(state2) {
      var _a, _b;
      this.state = state2;
      (_b = (_a = this.options).onStateChange) == null ? void 0 : _b.call(_a, state2);
    }
    emitProgress(progress) {
      var _a, _b;
      (_b = (_a = this.options).onProgress) == null ? void 0 : _b.call(_a, progress);
    }
    emitMessage(message, level) {
      var _a, _b;
      (_b = (_a = this.options).onMessage) == null ? void 0 : _b.call(_a, message, level);
    }
  }
  function gmAudioFetch(input, init = {}) {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const headers = normalizeHeaders(init.headers);
    const signal = init.signal ?? null;
    return new Promise((resolve, reject) => {
      if (signal == null ? void 0 : signal.aborted) {
        reject(abortError());
        return;
      }
      let settled = false;
      let request;
      const onAbort = () => {
        try {
          request == null ? void 0 : request.abort();
        } catch {
        }
        if (settled) return;
        settled = true;
        reject(abortError());
      };
      signal == null ? void 0 : signal.addEventListener("abort", onAbort, { once: true });
      const cleanup = () => {
        signal == null ? void 0 : signal.removeEventListener("abort", onAbort);
      };
      const succeed = (res, body) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(makeResponse(res, body));
      };
      const fail = (error2) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error2);
      };
      request = GM_xmlhttpRequest({
        method: "GET",
        url,
        headers,
        responseType: "stream",
        // GM 请求不带页面 Referer；anonymous 同时也不带 Cookie
        anonymous: true,
        onreadystatechange(res) {
          if (settled || res.readyState < 3) return;
          const stream = res.response;
          if (stream instanceof ReadableStream) succeed(res, stream);
        },
        onload(res) {
          if (settled) return;
          const stream = res.response;
          if (stream instanceof ReadableStream) {
            succeed(res, stream);
            return;
          }
          const bytes = toBytes(res);
          if (!bytes) {
            fail(new Error(
              "GM_xmlhttpRequest 未返回二进制音频数据（请确认 Tampermonkey 版本支持 responseType）"
            ));
            return;
          }
          if (bytes.byteLength === 0 && res.status !== 204 && res.status !== 304) {
            fail(new Error("音频响应为空"));
            return;
          }
          succeed(res, bytes);
        },
        onerror(res) {
          fail(new Error(`音频 CDN 请求失败：${describe(res)}`));
        },
        ontimeout() {
          fail(new Error("音频 CDN 请求超时"));
        }
      });
    });
  }
  function abortError() {
    return new DOMException("音频请求已取消", "AbortError");
  }
  function parseHeaders(raw) {
    const headers = new Headers();
    if (!raw) return headers;
    for (const line of raw.split(/\r?\n/)) {
      const colon = line.indexOf(":");
      if (colon <= 0) continue;
      const name2 = line.slice(0, colon).trim();
      const value = line.slice(colon + 1).trim();
      if (!name2) continue;
      try {
        headers.append(name2, value);
      } catch {
      }
    }
    return headers;
  }
  function makeResponse(res, body) {
    return new Response(body ?? new Uint8Array(), {
      status: res.status || 200,
      statusText: res.statusText || "",
      headers: parseHeaders(res.responseHeaders)
    });
  }
  function toBytes(res) {
    const raw = res.response;
    if (raw instanceof ArrayBuffer) return new Uint8Array(raw);
    if (raw instanceof Uint8Array) return raw;
    return null;
  }
  function normalizeHeaders(init) {
    const out = {};
    if (!init) return out;
    if (init instanceof Headers) {
      init.forEach((value, key) => {
        out[key] = value;
      });
      return out;
    }
    if (Array.isArray(init)) {
      for (const [key, value] of init) {
        if (key !== void 0 && value !== void 0) out[key] = value;
      }
      return out;
    }
    return { ...init };
  }
  function describe(res) {
    if ("error" in res && res.error) return String(res.error);
    const status = res.status;
    return status ? `HTTP ${status}` : "网络错误";
  }
  const CONTENT_SELECTOR = "#fqa-reader-content";
  const TITLE_SELECTOR = "h1.muye-reader-title";
  const ACTIVE_CLASS = "fqa-audio-active";
  function collectParagraphs() {
    const map = /* @__PURE__ */ new Map();
    const container2 = document.querySelector(CONTENT_SELECTOR);
    if (!container2) return map;
    for (const node of container2.querySelectorAll("p[idx]")) {
      const idx = Number(node.getAttribute("idx"));
      if (!Number.isFinite(idx)) continue;
      const list = map.get(idx);
      if (list) list.push(node);
      else map.set(idx, [node]);
    }
    return map;
  }
  function titleTarget(tags) {
    const titles = tags.filter((t) => t.is_title);
    if (titles.length !== 1) return null;
    return document.querySelector(TITLE_SELECTOR);
  }
  function tagIndexAt(tags, timeMs) {
    let low = 0;
    let high = tags.length - 1;
    let found = -1;
    while (low <= high) {
      const middle = low + high >> 1;
      if (tags[middle].startms <= timeMs) {
        found = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    if (found < 0) return -1;
    return found;
  }
  class ParagraphHighlighter {
    constructor() {
      __publicField(this, "paragraphs", /* @__PURE__ */ new Map());
      __publicField(this, "tags", []);
      __publicField(this, "active", []);
      __publicField(this, "activeTagIndex", -1);
    }
    /** 换章或正文重新插入后调用，重建索引 */
    reset(tags) {
      this.clear();
      this.tags = tags;
      this.paragraphs = collectParagraphs();
      this.activeTagIndex = -1;
    }
    /** 正文 DOM 被替换过（切音色不会换 DOM，但切章会），重新抓一遍段落 */
    refresh() {
      this.paragraphs = collectParagraphs();
      this.activeTagIndex = -1;
    }
    get timeTags() {
      return this.tags;
    }
    /** 当前高亮对应的时间点下标，用于切音色时保持段落 */
    get currentTagIndex() {
      return this.activeTagIndex;
    }
    clear() {
      for (const node of this.active) node.classList.remove(ACTIVE_CLASS);
      this.active = [];
    }
    /**
     * 按播放时间更新高亮。
     *
     * @param scroll 是否把高亮段落滚进视口
     * @returns 当前时间点下标，没有变化时返回原值
     */
    update(timeMs, scroll) {
      if (this.tags.length === 0) return -1;
      const index = tagIndexAt(this.tags, timeMs);
      if (index < 0 || index === this.activeTagIndex) return this.activeTagIndex;
      this.activeTagIndex = index;
      this.applyTag(index, scroll);
      return index;
    }
    /** 直接高亮第 index 个时间点，供切音色后恢复位置用 */
    applyTag(index, scroll) {
      const tag = this.tags[index];
      if (!tag) return;
      this.clear();
      const targets = tag.is_title ? [titleTarget(this.tags)].filter((n) => n !== null) : this.rangeTargets(tag.startidx, tag.endidx);
      for (const node of targets) node.classList.add(ACTIVE_CLASS);
      this.active = targets;
      if (scroll && targets[0]) {
        targets[0].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    rangeTargets(startidx, endidx) {
      const targets = [];
      for (let idx = startidx; idx <= endidx; idx++) {
        const nodes = this.paragraphs.get(idx);
        if (nodes) targets.push(...nodes);
      }
      return targets;
    }
    /**
     * 点段落跳转用：找出这个节点属于哪个时间点。
     *
     * 从点击目标往上找最近的 <p[idx]>（点到 blk 或行内标签上也能命中），
     * 再拿 idx 去时间点表里查覆盖它的那一段。
     */
    tagIndexOfNode(node) {
      var _a;
      const paragraph = nearestParagraph(node);
      if (paragraph) {
        const idx = Number(paragraph.getAttribute("idx"));
        if (Number.isFinite(idx)) return this.tagIndexOfIdx(idx);
      }
      if (node instanceof Node && ((_a = titleTarget(this.tags)) == null ? void 0 : _a.contains(node))) {
        return this.tags.findIndex((t) => t.is_title);
      }
      return -1;
    }
    /** idx 落在哪个时间点区间。时间点可能跨多段，所以按区间判断 */
    tagIndexOfIdx(idx) {
      return this.tags.findIndex((t) => !t.is_title && idx >= t.startidx && idx <= t.endidx);
    }
    /** 第 index 个时间点的起始秒数，供 seek 用 */
    startSecondsOf(index) {
      const tag = this.tags[index];
      return tag ? tag.startms / 1e3 : null;
    }
  }
  function nearestParagraph(node) {
    let current = node;
    while (current) {
      if (current instanceof HTMLElement && current.matches("p[idx]")) return current;
      if (current instanceof HTMLElement && current.id === "fqa-reader-content") return null;
      current = current.parentNode;
    }
    return null;
  }
  const TONE_STORE_KEY = "audiobook_tone";
  const state = vue.reactive({
    open: false,
    collapsed: false,
    tonePickerOpen: false,
    loading: false,
    playing: false,
    spinning: false,
    tones: [],
    toneId: null,
    toneName: "",
    cover: "",
    title: "",
    error: ""
  });
  const highlighter = new ParagraphHighlighter();
  let audio = null;
  let player = null;
  let itemId = "";
  let bookId = "";
  let trackTimer = null;
  let pendingTagIndex = -1;
  let playToken = 0;
  let paragraphClickBound = false;
  const onParagraphClick = (event) => {
    if (!state.open || state.toneId === null) return;
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("a, button, sup")) return;
    const index = highlighter.tagIndexOfNode(target);
    if (index < 0) return;
    const seconds = highlighter.startSecondsOf(index);
    if (seconds === null || !audio) return;
    audio.currentTime = seconds;
    highlighter.applyTag(index, false);
    if (!state.playing) void togglePlay();
  };
  function bindParagraphClick() {
    if (paragraphClickBound) return;
    document.addEventListener("click", onParagraphClick);
    paragraphClickBound = true;
  }
  function unbindParagraphClick() {
    if (!paragraphClickBound) return;
    document.removeEventListener("click", onParagraphClick);
    paragraphClickBound = false;
  }
  function ensurePlayer() {
    if (player) return player;
    audio = document.createElement("audio");
    audio.preload = "none";
    audio.style.display = "none";
    document.body.appendChild(audio);
    player = new CencAudioPlayer(audio, {
      // 音频 CDN 不在页面 CSP 的 connect-src 里，页面 fetch 会被 report-only
      // 策略上报到 mon.zijieapi.com。走 GM 通道绕开上报，详见 gmFetch
      fetch: gmAudioFetch,
      onStateChange: onPlayerState,
      onMessage: (message, level) => {
        if (level === "error") {
          console.error("[fqa:audio]", message);
          state.error = message;
        } else {
          console.log("[fqa:audio]", message);
        }
      }
    });
    return player;
  }
  function onPlayerState(playerState) {
    state.playing = playerState === "playing";
    state.spinning = playerState === "playing" || playerState === "loading";
    if (playerState === "playing") state.error = "";
    if (playerState === "playing") startTracking();
    else stopTracking();
    if (playerState === "ended") {
      highlighter.clear();
      onChapterEnd();
    }
  }
  const NEXT_CHAPTER_SELECTOR = "div.chapter-btn.next";
  function onChapterEnd() {
    var _a;
    if (settings.audiobookChapterEnd !== "next") {
      state.spinning = false;
      return;
    }
    const next = (_a = document.querySelector(NEXT_CHAPTER_SELECTOR)) == null ? void 0 : _a.firstChild;
    if (typeof (next == null ? void 0 : next.click) !== "function") {
      state.spinning = false;
      state.error = "已经是最后一章";
      return;
    }
    state.spinning = true;
    const before = itemId;
    next.click();
    unsafeWindow.setTimeout(() => {
      var _a2;
      if (!state.open || itemId !== before) return;
      const current = ((_a2 = window.location.pathname.split("/").pop()) == null ? void 0 : _a2.substring(0, 19)) || "";
      if (current && current !== before) {
        void switchChapter(current, { cover: state.cover, title: state.title });
      } else {
        state.spinning = false;
        state.error = "自动切章失败";
      }
    }, 3e3);
  }
  function startTracking() {
    if (trackTimer !== null) return;
    trackTimer = unsafeWindow.setInterval(() => {
      if (!audio) return;
      highlighter.update(audio.currentTime * 1e3, settings.audiobookFollow);
    }, 120);
  }
  function stopTracking() {
    if (trackTimer === null) return;
    unsafeWindow.clearInterval(trackTimer);
    trackTimer = null;
  }
  function storedToneId() {
    const raw = read(TONE_STORE_KEY);
    return typeof raw === "number" ? raw : null;
  }
  async function openAudiobook(chapter, book, meta) {
    itemId = chapter;
    bookId = book;
    state.cover = meta.cover;
    state.title = meta.title;
    state.error = "";
    state.open = true;
    state.collapsed = false;
    if (state.tones.length === 0) {
      try {
        state.tones = await getBookAvailableTones(bookId);
      } catch (e) {
        state.error = "取音色列表失败";
        console.error("[fqa:audio] 取音色列表失败:", e);
        return;
      }
    }
    if (state.tones.length === 0) {
      state.error = "这本书没有可用音色";
      return;
    }
    const remembered = storedToneId();
    if (remembered !== null && state.tones.some((t) => t.id === remembered)) {
      await selectTone(remembered);
      return;
    }
    state.tonePickerOpen = true;
  }
  async function selectTone(toneId) {
    state.tonePickerOpen = false;
    const tone = state.tones.find((t) => t.id === toneId);
    state.toneId = toneId;
    state.toneName = (tone == null ? void 0 : tone.name) ?? "";
    write(TONE_STORE_KEY, toneId);
    await playCurrent();
  }
  function openTonePicker() {
    state.tonePickerOpen = true;
  }
  function closeTonePicker() {
    state.tonePickerOpen = false;
    if (state.toneId === null) closeAudiobook();
  }
  async function changeTone(toneId) {
    if (toneId === state.toneId) {
      state.tonePickerOpen = false;
      return;
    }
    pendingTagIndex = highlighter.currentTagIndex;
    await selectTone(toneId);
  }
  async function playCurrent() {
    const toneId = state.toneId;
    if (toneId === null || !itemId) return;
    const token = ++playToken;
    const chapter = itemId;
    state.loading = true;
    state.spinning = true;
    state.error = "";
    try {
      const [contexts, tags] = await Promise.all([
        getPlayInfo(chapter, toneId),
        getChapterParagraphTimeTag(chapter, toneId)
      ]);
      if (token !== playToken) return;
      const context = contexts.find((c) => c.item_id === chapter) ?? contexts[0];
      const url = context == null ? void 0 : context.urls[0];
      if (!context || !url) {
        state.error = "这一章没有音频";
        return;
      }
      highlighter.reset(tags);
      bindParagraphClick();
      const instance = ensurePlayer();
      await instance.start({ url, key: context.key });
      if (token !== playToken) return;
      if (pendingTagIndex >= 0) {
        const tag = tags[pendingTagIndex];
        if (tag && audio) {
          audio.currentTime = tag.startms / 1e3;
          highlighter.applyTag(pendingTagIndex, true);
        }
        pendingTagIndex = -1;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      state.error = message;
      console.error("[fqa:audio] 播放失败:", e);
    } finally {
      state.loading = false;
      if (!state.playing) state.spinning = false;
    }
  }
  async function togglePlay() {
    if (!player) return;
    if (state.playing) {
      player.pause();
      return;
    }
    if (player.currentState === "ended" && audio) audio.currentTime = 0;
    try {
      await player.play();
    } catch (e) {
      console.warn("[fqa:audio] play() 被拒:", e);
    }
  }
  function toggleCollapsed() {
    state.collapsed = !state.collapsed;
  }
  async function switchChapter(chapter, meta) {
    if (!state.open || state.toneId === null) return;
    itemId = chapter;
    state.cover = meta.cover;
    state.title = meta.title;
    pendingTagIndex = -1;
    await playCurrent();
  }
  function refreshParagraphs() {
    if (state.open) highlighter.refresh();
  }
  function closeAudiobook() {
    stopTracking();
    unbindParagraphClick();
    playToken++;
    highlighter.clear();
    player == null ? void 0 : player.stop();
    state.open = false;
    state.collapsed = false;
    state.tonePickerOpen = false;
    state.playing = false;
    state.spinning = false;
    state.loading = false;
    state.error = "";
  }
  const _hoisted_1$1 = {
    class: "fqa-tone-box",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "选择音色"
  };
  const _hoisted_2$1 = { class: "fqa-tone-title" };
  const _hoisted_3$1 = { class: "fqa-tone-list" };
  const _hoisted_4$1 = ["onClick"];
  const _hoisted_5$1 = ["src", "alt"];
  const _hoisted_6$1 = {
    key: 1,
    class: "fqa-tone-icon fqa-tone-icon-empty"
  };
  const _hoisted_7$1 = { class: "fqa-tone-text" };
  const _hoisted_8$1 = { class: "fqa-tone-name" };
  const _hoisted_9$1 = {
    key: 0,
    class: "fqa-tone-gender"
  };
  const _hoisted_10$1 = {
    key: 0,
    class: "fqa-tone-desc"
  };
  const _hoisted_11 = { class: "fqa-tone-actions" };
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "TonePicker",
    props: {
      tones: {},
      current: {}
    },
    emits: ["select", "close"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      function genderLabel(gender) {
        if (gender === 1) return "男声";
        if (gender === 2) return "女声";
        return "";
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", {
          class: "fqa-tone-mask",
          onClick: _cache[1] || (_cache[1] = vue.withModifiers(($event) => emit("close"), ["self"]))
        }, [
          vue.createElementVNode("div", _hoisted_1$1, [
            vue.createElementVNode("h3", _hoisted_2$1, vue.toDisplayString(props.current === null ? "选择音色" : "切换音色"), 1),
            _cache[2] || (_cache[2] = vue.createElementVNode("p", { class: "fqa-tone-sub" }, "切换后会从当前段落开头继续", -1)),
            vue.createElementVNode("div", _hoisted_3$1, [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.tones, (tone) => {
                return vue.openBlock(), vue.createElementBlock("button", {
                  key: tone.id,
                  type: "button",
                  class: vue.normalizeClass(["fqa-tone-item", { "fqa-tone-item-active": tone.id === props.current }]),
                  onClick: ($event) => emit("select", tone.id)
                }, [
                  tone.icon ? (vue.openBlock(), vue.createElementBlock("img", {
                    key: 0,
                    class: "fqa-tone-icon",
                    src: tone.icon,
                    alt: tone.name
                  }, null, 8, _hoisted_5$1)) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_6$1, vue.toDisplayString(tone.name.slice(0, 1)), 1)),
                  vue.createElementVNode("span", _hoisted_7$1, [
                    vue.createElementVNode("span", _hoisted_8$1, [
                      vue.createTextVNode(vue.toDisplayString(tone.name) + " ", 1),
                      genderLabel(tone.gender) ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_9$1, vue.toDisplayString(genderLabel(tone.gender)), 1)) : vue.createCommentVNode("", true)
                    ]),
                    tone.description ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_10$1, vue.toDisplayString(tone.description), 1)) : vue.createCommentVNode("", true)
                  ])
                ], 10, _hoisted_4$1);
              }), 128))
            ]),
            vue.createElementVNode("div", _hoisted_11, [
              vue.createElementVNode("button", {
                type: "button",
                class: "fqa-tone-btn",
                onClick: _cache[0] || (_cache[0] = ($event) => emit("close"))
              }, "取消")
            ])
          ])
        ]);
      };
    }
  });
  const _hoisted_1 = ["innerHTML"];
  const _hoisted_2 = {
    key: 1,
    class: "fqa-audio-bar"
  };
  const _hoisted_3 = ["title", "aria-label"];
  const _hoisted_4 = ["src"];
  const _hoisted_5 = {
    key: 1,
    class: "fqa-audio-cover-empty"
  };
  const _hoisted_6 = ["innerHTML"];
  const _hoisted_7 = { class: "fqa-audio-meta" };
  const _hoisted_8 = { class: "fqa-audio-title" };
  const _hoisted_9 = { class: "fqa-audio-sub" };
  const _hoisted_10 = ["innerHTML"];
  const _sfc_main = /* @__PURE__ */ vue.defineComponent({
    __name: "AudioBar",
    setup(__props) {
      function onSelect(id) {
        if (state.toneId === null) void selectTone(id);
        else void changeTone(id);
      }
      return (_ctx, _cache) => {
        return vue.unref(state).open ? (vue.openBlock(), vue.createElementBlock("div", {
          key: 0,
          class: vue.normalizeClass(["fqa-audio-root", { "fqa-audio-collapsed": vue.unref(state).collapsed }])
        }, [
          vue.unref(state).collapsed ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "fqa-audio-expand",
            title: "展开听书栏",
            "aria-label": "展开听书栏",
            onClick: _cache[0] || (_cache[0] = //@ts-ignore
            (...args) => vue.unref(toggleCollapsed) && vue.unref(toggleCollapsed)(...args))
          }, [
            vue.createElementVNode("span", {
              class: "fqa-audio-icon fqa-audio-icon-flip",
              innerHTML: vue.unref(leftIcon)
            }, null, 8, _hoisted_1)
          ])) : (vue.openBlock(), vue.createElementBlock("div", _hoisted_2, [
            vue.createElementVNode("button", {
              type: "button",
              class: "fqa-audio-cover",
              title: vue.unref(state).playing ? "暂停" : "播放",
              "aria-label": vue.unref(state).playing ? "暂停" : "播放",
              onClick: _cache[1] || (_cache[1] = //@ts-ignore
              (...args) => vue.unref(togglePlay) && vue.unref(togglePlay)(...args))
            }, [
              vue.createElementVNode("span", {
                class: vue.normalizeClass(["fqa-audio-disc", { "fqa-audio-spin": vue.unref(state).spinning }])
              }, [
                vue.unref(state).cover ? (vue.openBlock(), vue.createElementBlock("img", {
                  key: 0,
                  src: vue.unref(state).cover,
                  alt: ""
                }, null, 8, _hoisted_4)) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_5, "听"))
              ], 2),
              vue.createElementVNode("span", {
                class: "fqa-audio-state",
                innerHTML: vue.unref(state).playing ? vue.unref(playingIcon) : vue.unref(pausedIcon)
              }, null, 8, _hoisted_6)
            ], 8, _hoisted_3),
            vue.createElementVNode("div", _hoisted_7, [
              vue.createElementVNode("span", _hoisted_8, vue.toDisplayString(vue.unref(state).title), 1),
              vue.createElementVNode("span", _hoisted_9, vue.toDisplayString(vue.unref(state).error || (vue.unref(state).loading ? "缓冲中…" : vue.unref(state).toneName)), 1)
            ]),
            vue.createElementVNode("button", {
              type: "button",
              class: "fqa-audio-btn",
              title: "切换音色",
              "aria-label": "切换音色",
              onClick: _cache[2] || (_cache[2] = //@ts-ignore
              (...args) => vue.unref(openTonePicker) && vue.unref(openTonePicker)(...args))
            }, [..._cache[5] || (_cache[5] = [
              vue.createElementVNode("span", { class: "fqa-audio-dots" }, null, -1)
            ])]),
            vue.createElementVNode("button", {
              type: "button",
              class: "fqa-audio-btn",
              title: "收起",
              "aria-label": "收起听书栏",
              onClick: _cache[3] || (_cache[3] = //@ts-ignore
              (...args) => vue.unref(toggleCollapsed) && vue.unref(toggleCollapsed)(...args))
            }, [
              vue.createElementVNode("span", {
                class: "fqa-audio-icon",
                innerHTML: vue.unref(leftIcon)
              }, null, 8, _hoisted_10)
            ]),
            vue.createElementVNode("button", {
              type: "button",
              class: "fqa-audio-btn fqa-audio-close",
              title: "关闭听书",
              "aria-label": "关闭听书",
              onClick: _cache[4] || (_cache[4] = //@ts-ignore
              (...args) => vue.unref(closeAudiobook) && vue.unref(closeAudiobook)(...args))
            }, " × ")
          ])),
          vue.unref(state).tonePickerOpen ? (vue.openBlock(), vue.createBlock(_sfc_main$1, {
            key: 2,
            tones: vue.unref(state).tones,
            current: vue.unref(state).toneId,
            onSelect,
            onClose: vue.unref(closeTonePicker)
          }, null, 8, ["tones", "current", "onClose"])) : vue.createCommentVNode("", true)
        ], 2)) : vue.createCommentVNode("", true);
      };
    }
  });
  const audiobookcss = `/* 听书悬浮栏与音色弹窗。\r
 * 暗色跟随页面的 div.muye-reader-dark（与 userHook 的判定一致）。 */\r
\r
.fqa-audio-root {\r
	--fqa-audio-bg: #fff;\r
	--fqa-audio-text: #1f2329;\r
	--fqa-audio-sub: #8f959e;\r
	--fqa-audio-hover: rgba(31, 35, 41, 0.06);\r
	--fqa-audio-border: rgba(31, 35, 41, 0.1);\r
	--fqa-audio-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);\r
\r
	position: fixed;\r
	left: 20px;\r
	bottom: 20px;\r
	z-index: 2147483000;\r
	font-size: 14px;\r
	color: var(--fqa-audio-text);\r
}\r
\r
/*\r
 * 暗色反色。悬浮栏挂在 body 下，够不到 .muye-reader-dark 的后代选择器，\r
 * 所以 audioPanel 在 #fqa-audio-root 容器上打 .fqa-audio-dark 类；\r
 * 真正的 .fqa-audio-root（Vue 根）是容器的子节点，用后代选择器作用到它。\r
 */\r
.fqa-audio-dark .fqa-audio-root {\r
	--fqa-audio-bg: #2b2b2b;\r
	--fqa-audio-text: #b3b3b3;\r
	--fqa-audio-sub: #7a7a7a;\r
	--fqa-audio-hover: rgba(255, 255, 255, 0.08);\r
	--fqa-audio-border: rgba(255, 255, 255, 0.12);\r
	--fqa-audio-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);\r
}\r
\r
.fqa-audio-bar {\r
	display: flex;\r
	align-items: center;\r
	gap: 10px;\r
	padding: 8px 10px 8px 8px;\r
	border-radius: 999px;\r
	background: var(--fqa-audio-bg);\r
	box-shadow: var(--fqa-audio-shadow);\r
}\r
\r
/* ------------------------------- 旋转封面 ------------------------------- */\r
\r
.fqa-audio-cover {\r
	position: relative;\r
	flex: 0 0 auto;\r
	width: 44px;\r
	height: 44px;\r
	padding: 0;\r
	border: none;\r
	border-radius: 50%;\r
	background: var(--fqa-audio-hover);\r
	cursor: pointer;\r
}\r
\r
/*\r
 * 只有这一层转。状态图标是 .fqa-audio-state，放在旋转层外面，\r
 * 否则会跟着封面一起转，反而更看不清。\r
 * 播放/缓冲时转，暂停时停在当前角度（animation-play-state 比移除动画更平滑）\r
 */\r
.fqa-audio-disc {\r
	position: absolute;\r
	inset: 0;\r
	border-radius: 50%;\r
	overflow: hidden;\r
	animation: fqa-audio-rotate 8s linear infinite;\r
	animation-play-state: paused;\r
}\r
\r
.fqa-audio-disc.fqa-audio-spin {\r
	animation-play-state: running;\r
}\r
\r
.fqa-audio-disc img {\r
	display: block;\r
	width: 100%;\r
	height: 100%;\r
	object-fit: cover;\r
}\r
\r
.fqa-audio-cover-empty {\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	width: 100%;\r
	height: 100%;\r
	color: var(--fqa-audio-sub);\r
	font-size: 18px;\r
}\r
\r
/* 播放/暂停状态。压一层遮罩，浅色封面上也看得清 */\r
.fqa-audio-state {\r
	position: absolute;\r
	inset: 0;\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	border-radius: 50%;\r
	background: rgba(0, 0, 0, 0.38);\r
	color: #fff;\r
	transition: background 0.2s ease;\r
}\r
\r
.fqa-audio-cover:hover .fqa-audio-state {\r
	background: rgba(0, 0, 0, 0.55);\r
}\r
\r
/*\r
 * 只给尺寸，不写 fill：paused.svg 里那块透明点击区是 fill="none"，\r
 * CSS 的 fill 优先级高于表现属性，会把它填成一个白方块盖住图标。\r
 * 两个 svg 自身已经用 currentColor，跟着上面的 color 走。\r
 */\r
.fqa-audio-state svg {\r
	width: 18px;\r
	height: 18px;\r
}\r
\r
@keyframes fqa-audio-rotate {\r
	from { transform: rotate(0deg); }\r
	to { transform: rotate(360deg); }\r
}\r
\r
@media (prefers-reduced-motion: reduce) {\r
	.fqa-audio-disc { animation: none; }\r
}\r
\r
/* -------------------------------- 文字区 -------------------------------- */\r
\r
.fqa-audio-meta {\r
	display: flex;\r
	flex-direction: column;\r
	justify-content: center;\r
	min-width: 0;\r
	max-width: 180px;\r
	line-height: 1.35;\r
}\r
\r
.fqa-audio-title,\r
.fqa-audio-sub {\r
	overflow: hidden;\r
	white-space: nowrap;\r
	text-overflow: ellipsis;\r
}\r
\r
.fqa-audio-sub {\r
	color: var(--fqa-audio-sub);\r
	font-size: 12px;\r
}\r
\r
/* -------------------------------- 按钮 -------------------------------- */\r
\r
.fqa-audio-btn,\r
.fqa-audio-expand {\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	flex: 0 0 auto;\r
	width: 32px;\r
	height: 32px;\r
	padding: 0;\r
	border: none;\r
	border-radius: 50%;\r
	background: transparent;\r
	color: var(--fqa-audio-text);\r
	cursor: pointer;\r
}\r
\r
.fqa-audio-btn:hover,\r
.fqa-audio-expand:hover {\r
	background: var(--fqa-audio-hover);\r
}\r
\r
.fqa-audio-close {\r
	font-size: 20px;\r
	line-height: 1;\r
}\r
\r
/* svg 用 currentColor，跟着按钮的 color 走 */\r
.fqa-audio-icon {\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	width: 16px;\r
	height: 16px;\r
}\r
\r
.fqa-audio-icon svg {\r
	width: 100%;\r
	height: 100%;\r
	fill: currentColor;\r
}\r
\r
/* 收起后箭头水平翻转朝右 */\r
.fqa-audio-icon-flip {\r
	transform: scaleX(-1);\r
}\r
\r
.fqa-audio-expand {\r
	background: var(--fqa-audio-bg);\r
	box-shadow: var(--fqa-audio-shadow);\r
	width: 36px;\r
	height: 36px;\r
}\r
\r
/* 三个点 */\r
.fqa-audio-dots,\r
.fqa-audio-dots::before,\r
.fqa-audio-dots::after {\r
	width: 4px;\r
	height: 4px;\r
	border-radius: 50%;\r
	background: currentColor;\r
}\r
\r
.fqa-audio-dots {\r
	position: relative;\r
}\r
\r
.fqa-audio-dots::before,\r
.fqa-audio-dots::after {\r
	content: '';\r
	position: absolute;\r
	top: 0;\r
}\r
\r
.fqa-audio-dots::before { left: -7px; }\r
.fqa-audio-dots::after { left: 7px; }\r
\r
/* ----------------------------- 段落高亮 ----------------------------- */\r
\r
.fqa-audio-active {\r
	background: var(--web-brand_light, rgba(241, 70, 70, 0.12));\r
	border-radius: 4px;\r
	transition: background 0.2s ease;\r
}\r
\r
/* ----------------------------- 音色弹窗 ----------------------------- */\r
\r
.fqa-tone-mask {\r
	position: fixed;\r
	inset: 0;\r
	z-index: 2147483002;\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	background: rgba(0, 0, 0, 0.45);\r
}\r
\r
.fqa-tone-box {\r
	width: min(420px, calc(100vw - 32px));\r
	max-height: min(560px, calc(100vh - 64px));\r
	display: flex;\r
	flex-direction: column;\r
	padding: 20px;\r
	border-radius: 12px;\r
	background: var(--fqa-audio-bg, #fff);\r
	color: var(--fqa-audio-text, #1f2329);\r
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.24);\r
}\r
\r
.fqa-tone-title {\r
	margin: 0 0 4px;\r
	font-size: 17px;\r
	font-weight: 600;\r
}\r
\r
.fqa-tone-sub {\r
	margin: 0 0 14px;\r
	color: var(--fqa-audio-sub, #8f959e);\r
	font-size: 12px;\r
}\r
\r
.fqa-tone-list {\r
	flex: 1 1 auto;\r
	overflow-y: auto;\r
	display: flex;\r
	flex-direction: column;\r
	gap: 6px;\r
}\r
\r
.fqa-tone-item {\r
	display: flex;\r
	align-items: center;\r
	gap: 10px;\r
	padding: 8px 10px;\r
	border: 1px solid transparent;\r
	border-radius: 8px;\r
	background: transparent;\r
	color: inherit;\r
	text-align: left;\r
	cursor: pointer;\r
}\r
\r
.fqa-tone-item:hover {\r
	background: var(--fqa-audio-hover, rgba(31, 35, 41, 0.06));\r
}\r
\r
.fqa-tone-item-active {\r
	border-color: var(--web-brand, #f14646);\r
}\r
\r
.fqa-tone-icon {\r
	flex: 0 0 auto;\r
	width: 36px;\r
	height: 36px;\r
	border-radius: 50%;\r
	object-fit: cover;\r
}\r
\r
.fqa-tone-icon-empty {\r
	display: flex;\r
	align-items: center;\r
	justify-content: center;\r
	background: var(--fqa-audio-hover, rgba(31, 35, 41, 0.06));\r
	color: var(--fqa-audio-sub, #8f959e);\r
}\r
\r
.fqa-tone-text {\r
	display: flex;\r
	flex-direction: column;\r
	min-width: 0;\r
}\r
\r
.fqa-tone-name {\r
	display: flex;\r
	align-items: center;\r
	gap: 6px;\r
	font-size: 14px;\r
}\r
\r
.fqa-tone-gender {\r
	color: var(--fqa-audio-sub, #8f959e);\r
	font-size: 11px;\r
}\r
\r
.fqa-tone-desc {\r
	overflow: hidden;\r
	color: var(--fqa-audio-sub, #8f959e);\r
	font-size: 12px;\r
	white-space: nowrap;\r
	text-overflow: ellipsis;\r
}\r
\r
.fqa-tone-actions {\r
	display: flex;\r
	justify-content: flex-end;\r
	margin-top: 14px;\r
}\r
\r
.fqa-tone-btn {\r
	padding: 6px 16px;\r
	border: 1px solid var(--fqa-audio-border, rgba(31, 35, 41, 0.1));\r
	border-radius: 6px;\r
	background: transparent;\r
	color: inherit;\r
	cursor: pointer;\r
}\r
\r
.fqa-tone-btn:hover {\r
	background: var(--fqa-audio-hover, rgba(31, 35, 41, 0.06));\r
}\r
`;
  const CONTAINER_ID = "fqa-audio-root";
  const STYLE_ID$1 = "fqa-audio-style";
  let app = null;
  let container = null;
  let themeObserver = null;
  function injectStyle() {
    if (document.getElementById(STYLE_ID$1)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID$1;
    style.textContent = audiobookcss;
    document.head.appendChild(style);
  }
  function syncTheme() {
    if (!container) return;
    const dark = document.querySelector("div.muye-reader-dark") !== null;
    container.classList.toggle("fqa-audio-dark", dark);
  }
  function watchTheme() {
    if (themeObserver) return;
    themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  }
  function initAudioPanel() {
    if (app) return;
    injectStyle();
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
    syncTheme();
    watchTheme();
    app = vue.createApp({ render: () => vue.h(_sfc_main) });
    app.config.errorHandler = (err, _instance, info2) => {
      console.error(`[fqa:audio] Vue error (${info2}):`, err);
    };
    app.mount(container);
  }
  const SHELF_BASE = "https://fanqienovel.com/reading/bookapi/bookshelf";
  function identify(bookId2, modifyTime = 0) {
    return {
      asterisked: false,
      book_id: bookId2,
      book_type: 0,
      modify_time: modifyTime
    };
  }
  async function shelfPost(path, body) {
    const res = await fetch$1(`${SHELF_BASE}${path}/v?aid=1967`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || json && json.code !== 0 && json.code !== void 0) {
      throw new Error(`书架操作失败(${path}): ${(json == null ? void 0 : json.message) ?? res.status}`);
    }
    return json;
  }
  async function addToBookshelf(bookId2) {
    await shelfPost("/add", {
      add_book_source: 0,
      identify_data: [identify(bookId2)]
    });
  }
  async function removeFromBookshelf(bookId2) {
    await shelfPost("/delete", {
      identify_data: [identify(bookId2, Date.now())]
    });
  }
  async function isInBookshelf(book_id) {
    const response = await fetch$1(`https://fanqienovel.com/reading/bookapi/bookshelf/check/v:version/?aid=1967&iid=0&version_code=57700&update_version_code=57700&book_id=${book_id}`);
    const data = await response.json();
    return Boolean(data.data);
  }
  function addResponseModifier(modifier) {
    modifiers.push(modifier);
    return () => {
      const i2 = modifiers.indexOf(modifier);
      if (i2 >= 0) modifiers.splice(i2, 1);
    };
  }
  const modifiers = [];
  const blackList = [
    "mcs.zijieapi.com",
    "vcs.zijieapi.com/vc/setting",
    "mon.zijieapi.com",
    "mssdk.bytedance.com/web/common",
    "hm.baidu.com"
  ];
  const BLOCKED_BODY = JSON.stringify({
    e: 0,
    sc: 10,
    tc: 10
  });
  function checkBlack(url) {
    if (!settings.blockReport) return false;
    return blackList.some((black) => url.includes(black));
  }
  function toLocalArrayBuffer(buf) {
    const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    const out = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(out).set(bytes);
    return out;
  }
  function textToBody(text) {
    return toLocalArrayBuffer(new TextEncoder().encode(text));
  }
  function bodyToText(body) {
    if (typeof body === "string") return body;
    return new TextDecoder().decode(body);
  }
  function bodyToBuffer(body) {
    if (typeof body === "string") return textToBody(body);
    return body;
  }
  function resolveSimple(simple) {
    return { ...simple, responseBody: bodyToBuffer(simple.responseBody) };
  }
  function matchingModifiers(url) {
    return modifiers.filter((m) => m.matcher(url));
  }
  function applyModifiers(url, matched, simple) {
    let current = simple;
    for (const m of matched) {
      if (m.modify_response) current = m.modify_response(url, current);
    }
    return current;
  }
  function responseAllowsBody(status) {
    return status !== 204 && status !== 205 && status !== 304;
  }
  function simpleToResponse(simple) {
    return new Response(responseAllowsBody(simple.statusCode) ? simple.responseBody : null, {
      status: simple.statusCode,
      headers: simple.responseHeaders
    });
  }
  async function responseToSimple(res) {
    const body = toLocalArrayBuffer(await res.arrayBuffer());
    const headers = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { responseBody: body, statusCode: res.status, responseHeaders: headers };
  }
  const originalFetch = unsafeWindow.fetch.bind(unsafeWindow);
  unsafeWindow.fetch = async function fetch2(input, init) {
    let url;
    if (input instanceof Request) {
      url = input.url;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = input;
    }
    if (checkBlack(url)) {
      console.log("blocked request: " + url);
      return new Response(BLOCKED_BODY, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const matched = matchingModifiers(url);
    if (matched.length === 0) return originalFetch(input, init);
    const breaker = matched.find((m) => m.should_break(url));
    if (breaker == null ? void 0 : breaker.make_response) {
      return simpleToResponse(breaker.make_response(url));
    }
    if (!matched.some((m) => m.modify_response)) return originalFetch(input, init);
    const res = await originalFetch(input, init);
    try {
      const simple = await responseToSimple(res.clone());
      return simpleToResponse(applyModifiers(url, matched, simple));
    } catch (error2) {
      console.error("[fqa:fetch] 修改响应失败，回退原始响应:", error2);
      return res;
    }
  };
  const originalXMLHttpRequest = unsafeWindow.XMLHttpRequest;
  const XHR_PROTO = originalXMLHttpRequest.prototype;
  const XHR_DESC = {
    status: Object.getOwnPropertyDescriptor(XHR_PROTO, "status"),
    responseText: Object.getOwnPropertyDescriptor(XHR_PROTO, "responseText"),
    response: Object.getOwnPropertyDescriptor(XHR_PROTO, "response")
  };
  const XHR_GETALL = XHR_PROTO.getAllResponseHeaders;
  const XHR_GETONE = XHR_PROTO.getResponseHeader;
  function readXhrHeaders(self) {
    const headers = {};
    const all = XHR_GETALL.call(self);
    if (!all) return headers;
    for (const line of all.trim().split(/[\r\n]+/)) {
      const idx = line.indexOf(":");
      if (idx > 0) {
        headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
    }
    return headers;
  }
  function readXhrBody(self) {
    const type = self.responseType;
    if (type === "arraybuffer") {
      return toLocalArrayBuffer(XHR_DESC.response.get.call(self));
    }
    if (type === "json") {
      const parsed = XHR_DESC.response.get.call(self);
      return textToBody(JSON.stringify(parsed));
    }
    return textToBody(XHR_DESC.responseText.get.call(self));
  }
  unsafeWindow.XMLHttpRequest = class XMLHttpRequest extends originalXMLHttpRequest {
    constructor() {
      super(...arguments);
      __publicField(this, "_blockedUrl");
      __publicField(this, "_fxaUrl", "");
      __publicField(this, "_fxaMatched", null);
      __publicField(this, "_fxaBreaker", null);
      __publicField(this, "_fxaApplied", false);
      __publicField(this, "_fxaSimple", null);
    }
    open(method, url, async = true, user, password) {
      this._fxaUrl = url;
      this._fxaMatched = null;
      this._fxaBreaker = null;
      this._fxaApplied = false;
      this._fxaSimple = null;
      if (checkBlack(url)) {
        console.log("blocked request: " + url);
        this._blockedUrl = url;
        return;
      }
      this._blockedUrl = void 0;
      const matched = matchingModifiers(url);
      const breaker = matched.find((m) => m.should_break(url));
      if (breaker == null ? void 0 : breaker.make_response) {
        this._fxaBreaker = breaker;
        this._fxaMatched = matched;
      } else if (matched.some((m) => m.modify_response)) {
        this._fxaMatched = matched;
      }
      super.open(method, url, async, user, password);
    }
    setRequestHeader(name2, value) {
      if (this._blockedUrl !== void 0) return;
      super.setRequestHeader(name2, value);
    }
    send(body) {
      var _a, _b;
      if (this._blockedUrl !== void 0) {
        this._synthesizeFromSimple({
          responseBody: textToBody(BLOCKED_BODY),
          statusCode: 200,
          responseHeaders: { "content-type": "application/json" }
        });
        return;
      }
      if ((_a = this._fxaBreaker) == null ? void 0 : _a.make_response) {
        this._synthesizeFromSimple(this._fxaBreaker.make_response(this._fxaUrl));
        return;
      }
      if ((_b = this._fxaMatched) == null ? void 0 : _b.length) this._armTransform();
      super.send(body);
    }
    abort() {
      if (this._blockedUrl !== void 0) return;
      super.abort();
    }
    getAllResponseHeaders() {
      if (this._blockedUrl !== void 0) return "content-type: application/json\r\n";
      return super.getAllResponseHeaders();
    }
    getResponseHeader(name2) {
      if (this._blockedUrl !== void 0) {
        return name2.toLowerCase() === "content-type" ? "application/json" : null;
      }
      return super.getResponseHeader(name2);
    }
    /**
     * 中断请求后合成一个假响应并手动派发完成事件。
     * 与 fetch 的 make_response 对齐，也复用了黑名单那条原本的 setTimeout 派发逻辑。
     */
    _synthesizeFromSimple(raw) {
      const url = this._blockedUrl ?? this._fxaUrl;
      const simple = resolveSimple(raw);
      const headers = simple.responseHeaders;
      const shadow = (prop, value) => Object.defineProperty(this, prop, { configurable: true, get: () => value });
      setTimeout(() => {
        const text = bodyToText(simple.responseBody);
        shadow("readyState", 4);
        shadow("status", simple.statusCode);
        shadow("statusText", "OK");
        shadow("responseURL", url);
        const type = this.responseType;
        shadow("responseText", type === "" || type === "text" ? text : "");
        let value;
        if (type === "json") {
          try {
            value = JSON.parse(text);
          } catch {
            value = text;
          }
        } else if (type === "arraybuffer") {
          value = simple.responseBody;
        } else if (type === "blob") {
          value = new Blob([simple.responseBody]);
        } else {
          value = text;
        }
        shadow("response", value);
        shadow(
          "getAllResponseHeaders",
          () => Object.entries(headers).map(([k, v]) => `${k}: ${v}\r
`).join("")
        );
        shadow("getResponseHeader", (name2) => {
          const lower = name2.toLowerCase();
          const key = Object.keys(headers).find((k) => k.toLowerCase() === lower);
          return key ? headers[key] : null;
        });
        this.dispatchEvent(new Event("readystatechange"));
        this.dispatchEvent(new ProgressEvent("load"));
        this.dispatchEvent(new ProgressEvent("loadend"));
      }, 0);
    }
    /**
     * 在实例上挂影子属性：等真实响应就绪（readyState=4），
     * 页面第一次读取时才同步套用 modify_response 并缓存结果。
     * 这样不用跟页面的 onload / onreadystatechange 争先后顺序。
     */
    _armTransform() {
      const type = this.responseType;
      if (type === "blob" || type === "document") return;
      const self = this;
      const matched = this._fxaMatched;
      const url = this._fxaUrl;
      const ensure = () => {
        if (self._fxaApplied || self.readyState !== 4) return;
        self._fxaSimple = resolveSimple(applyModifiers(url, matched, {
          responseBody: readXhrBody(self),
          statusCode: XHR_DESC.status.get.call(self),
          responseHeaders: readXhrHeaders(self)
        }));
        self._fxaApplied = true;
      };
      Object.defineProperty(this, "status", {
        configurable: true,
        get() {
          ensure();
          if (self._fxaApplied) return self._fxaSimple.statusCode;
          return XHR_DESC.status.get.call(self);
        }
      });
      Object.defineProperty(this, "responseText", {
        configurable: true,
        get() {
          ensure();
          const t = self.responseType;
          if (!self._fxaApplied || t !== "" && t !== "text") {
            return XHR_DESC.responseText.get.call(self);
          }
          return bodyToText(self._fxaSimple.responseBody);
        }
      });
      Object.defineProperty(this, "response", {
        configurable: true,
        get() {
          ensure();
          if (!self._fxaApplied) return XHR_DESC.response.get.call(self);
          const body = self._fxaSimple.responseBody;
          switch (self.responseType) {
            case "":
            case "text":
              return bodyToText(body);
            case "json":
              return JSON.parse(bodyToText(body));
            case "arraybuffer":
              return body;
            default:
              return XHR_DESC.response.get.call(self);
          }
        }
      });
      this.getAllResponseHeaders = function getAllResponseHeaders() {
        ensure();
        if (!self._fxaApplied) return XHR_GETALL.call(self);
        return Object.entries(self._fxaSimple.responseHeaders).map(([k, v]) => `${k}: ${v}\r
`).join("");
      };
      this.getResponseHeader = function getResponseHeader(name2) {
        ensure();
        if (!self._fxaApplied) return XHR_GETONE.call(self, name2);
        const lower = name2.toLowerCase();
        const key = Object.keys(self._fxaSimple.responseHeaders).find((k) => k.toLowerCase() === lower);
        return key ? self._fxaSimple.responseHeaders[key] : null;
      };
    }
  };
  const _exports$1 = [];
  let userState = {
    isLogin: false,
    userInfo: null
  };
  if (read("userState")) {
    userState = read("userState");
  }
  console.log("userState:", userState);
  const DB_NAME = "fqa-cache";
  const DB_VERSION = 1;
  const STORE_CHAPTERS = "chapters";
  const STORE_PINS = "pinnedBooks";
  const DEFAULT_PIN_BOOK_LIMIT = 50;
  const DEFAULT_PIN_CHAPTER_LIMIT = 5e3;
  const DEFAULT_CONFIG = {
    pinBookLimit: DEFAULT_PIN_BOOK_LIMIT,
    pinChapterLimit: DEFAULT_PIN_CHAPTER_LIMIT
  };
  let db = null;
  let config = { ...DEFAULT_CONFIG };
  let openingPromise = null;
  function openDb() {
    if (db) return Promise.resolve(db);
    if (openingPromise) return openingPromise;
    openingPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(STORE_CHAPTERS)) {
          const store = d.createObjectStore(STORE_CHAPTERS, { keyPath: "id" });
          store.createIndex("bookId", "bookId", { unique: false });
          store.createIndex("scope", "scope", { unique: false });
        }
        if (!d.objectStoreNames.contains(STORE_PINS)) {
          d.createObjectStore(STORE_PINS, { keyPath: "id" });
        }
      };
      req.onsuccess = () => {
        db = req.result;
        resolve(db);
      };
      req.onerror = () => {
        openingPromise = null;
        reject(req.error ?? new Error("IDB open failed"));
      };
      req.onblocked = () => {
        warn("cache", "IndexedDB 升级被阻塞，旧版本页面未关闭？");
      };
    });
    return openingPromise;
  }
  function reqToPromise(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function initCache() {
    await openDb();
    await clearSessionScope();
    info("cache", `缓存系统就绪（DB: ${DB_NAME} v${DB_VERSION}）`);
  }
  async function cacheChapter(bookId2, bookName, itemId2, content) {
    const id = makeId(bookId2, itemId2);
    const d = await openDb();
    const t = d.transaction(STORE_CHAPTERS, "readwrite");
    const store = t.objectStore(STORE_CHAPTERS);
    const existing = await reqToPromise(
      store.get(id)
    );
    if (existing) {
      store.put({ ...existing, lastReadAt: Date.now() });
    } else {
      const entry = {
        id,
        bookId: bookId2,
        bookName,
        itemId: itemId2,
        content,
        createdAt: Date.now(),
        lastReadAt: Date.now(),
        scope: "session"
      };
      store.add(entry);
    }
    await txDone(t);
    debug("cache", `已缓存章节 ${id}`, { scope: "session" });
  }
  async function getCachedChapter(bookId2, itemId2) {
    const id = makeId(bookId2, itemId2);
    const d = await openDb();
    const t = d.transaction(STORE_CHAPTERS, "readonly");
    const store = t.objectStore(STORE_CHAPTERS);
    const entry = await reqToPromise(
      store.get(id)
    );
    if (!entry) return null;
    const t2 = d.transaction(STORE_CHAPTERS, "readwrite");
    t2.objectStore(STORE_CHAPTERS).put({ ...entry, lastReadAt: Date.now() });
    await txDone(t2);
    return entry;
  }
  async function pinBook(bookId2, bookName) {
    const d = await openDb();
    const t0 = d.transaction(STORE_PINS, "readonly");
    const existing = await reqToPromise(
      t0.objectStore(STORE_PINS).get(bookId2)
    );
    if (existing) {
      debug("cache", `书已被 pin，跳过`, { bookId: bookId2 });
      return { ok: true };
    }
    const tCount = d.transaction(STORE_PINS, "readonly");
    const count = await reqToPromise(tCount.objectStore(STORE_PINS).count());
    if (count >= config.pinBookLimit) {
      return { ok: false, reason: `已 pin ${count} 本，达到上限 ${config.pinBookLimit}，请先 unpin 其他书` };
    }
    const t = d.transaction([STORE_CHAPTERS, STORE_PINS], "readwrite");
    const chapterStore = t.objectStore(STORE_CHAPTERS);
    const idx = chapterStore.index("bookId");
    const cursorReq = idx.openCursor(IDBKeyRange.only(bookId2));
    let chapterCount = 0;
    let totalBytes = 0;
    let firstChapterId = null;
    let lastReadItemId = null;
    let lastReadAt = 0;
    await new Promise((resolve, reject) => {
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) {
          resolve();
          return;
        }
        const ch = cursor.value;
        cursor.update({ ...ch, scope: "pin" });
        chapterCount++;
        totalBytes += ch.content.length;
        if (firstChapterId === null) firstChapterId = ch.itemId;
        if (ch.lastReadAt > lastReadAt) {
          lastReadAt = ch.lastReadAt;
          lastReadItemId = ch.itemId;
        }
        cursor.continue();
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
    const meta = {
      id: bookId2,
      bookName,
      pinnedAt: Date.now(),
      chapterCount,
      totalBytes,
      lastReadItemId,
      lastReadIndex: 0
    };
    t.objectStore(STORE_PINS).put(meta);
    await txDone(t);
    info("cache", `已 pin 书`, { bookId: bookId2, bookName, chapterCount, totalBytes });
    return { ok: true };
  }
  async function unpinBook(bookId2) {
    const d = await openDb();
    const t = d.transaction([STORE_CHAPTERS, STORE_PINS], "readwrite");
    const chapterStore = t.objectStore(STORE_CHAPTERS);
    const idx = chapterStore.index("bookId");
    const cursorReq = idx.openCursor(IDBKeyRange.only(bookId2));
    await new Promise((resolve, reject) => {
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) {
          resolve();
          return;
        }
        const ch = cursor.value;
        if (ch.scope === "pin") cursor.delete();
        cursor.continue();
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
    await reqToPromise(t.objectStore(STORE_PINS).delete(bookId2));
    await txDone(t);
    info("cache", `已 unpin 书`, { bookId: bookId2 });
  }
  async function listPinnedBooks() {
    const d = await openDb();
    const t = d.transaction(STORE_PINS, "readonly");
    const all = await reqToPromise(
      t.objectStore(STORE_PINS).getAll()
    );
    return all.sort((a, b) => b.pinnedAt - a.pinnedAt);
  }
  async function isPinned(bookId2) {
    const d = await openDb();
    const t = d.transaction(STORE_PINS, "readonly");
    const m = await reqToPromise(
      t.objectStore(STORE_PINS).get(bookId2)
    );
    return Boolean(m);
  }
  async function updateReadingProgress(bookId2, itemId2, index) {
    const d = await openDb();
    const t = d.transaction(STORE_PINS, "readwrite");
    const store = t.objectStore(STORE_PINS);
    const m = await reqToPromise(
      store.get(bookId2)
    );
    if (!m) return;
    await reqToPromise(store.put({
      ...m,
      lastReadItemId: itemId2,
      lastReadIndex: index
    }));
    await txDone(t);
  }
  async function clearSessionScope() {
    const d = await openDb();
    const t = d.transaction(STORE_CHAPTERS, "readwrite");
    const store = t.objectStore(STORE_CHAPTERS);
    const idx = store.index("scope");
    const cursorReq = idx.openCursor(IDBKeyRange.only("session"));
    let cleared = 0;
    await new Promise((resolve, reject) => {
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) {
          resolve();
          return;
        }
        cursor.delete();
        cleared++;
        cursor.continue();
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
    await txDone(t);
    if (cleared > 0) info("cache", `已清理 ${cleared} 条 session 缓存`);
  }
  function makeId(bookId2, itemId2) {
    return `${bookId2}:${itemId2}`;
  }
  function txDone(t) {
    return new Promise((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error("tx aborted"));
    });
  }
  let currentBook = null;
  let latestItemId = null;
  let currentChapterWithContent = null;
  const SCRIPT_CONTAINER_ID = "fqa-reader-content";
  let comicObserver = null;
  addResponseModifier({
    matcher: (url) => url.indexOf("/reading/bookapi/bookshelf/check/") !== -1 && location.pathname.startsWith("/reader"),
    should_break: () => true,
    make_response: () => {
      const body = JSON.stringify({
        code: 0,
        message: "SUCCESS",
        data: 0
      });
      return {
        responseBody: body,
        statusCode: 200,
        responseHeaders: {
          "content-type": "application/json; charset=utf-8",
          "content-length": String(new TextEncoder().encode(body).length)
        }
      };
    }
  });
  function ensureScriptContainer(readerContainer, comic) {
    let scriptContainer = document.getElementById(SCRIPT_CONTAINER_ID);
    if (!scriptContainer) {
      scriptContainer = cloneElement(readerContainer);
      scriptContainer.id = SCRIPT_CONTAINER_ID;
      scriptContainer.classList.add("fqa");
      readerContainer.insertAdjacentElement("beforebegin", scriptContainer);
    }
    scriptContainer.classList.toggle("fqa-comic-reader", comic);
    if (settings.allowCopy) scriptContainer.classList.remove("noselect");
    comicObserver == null ? void 0 : comicObserver.disconnect();
    comicObserver = null;
    scriptContainer.innerHTML = "";
    readerContainer.classList.add("fqa-hide");
    return scriptContainer;
  }
  function injectPinButton(bookId2, bookName) {
    var _a;
    if (!bookId2) return;
    const existing = document.getElementById("fqa-pin-btn");
    if (existing) existing.remove();
    const muyeReaderSubtitle = document.querySelector(".muye-reader-subtitle, .reader-subtitle, .chapter-info");
    const anchor = muyeReaderSubtitle ?? ((_a = document.getElementById("fqa-current-chapter-volume")) == null ? void 0 : _a.parentElement) ?? document.body;
    const btn = document.createElement("button");
    btn.id = "fqa-pin-btn";
    btn.className = "fqa-pin-topbar-btn";
    btn.style.cssText = "margin-left:8px;padding:2px 10px;border:1px solid #ff9d5c;background:transparent;color:#ff9d5c;border-radius:4px;cursor:pointer;font-size:12px;";
    isPinned(bookId2).then((pinned) => {
      btn.textContent = pinned ? "📌 已 Pin（点击取消）" : "📌 Pin 此书";
      btn.dataset.pinned = pinned ? "1" : "0";
    });
    btn.addEventListener("click", async () => {
      const isCurrentlyPinned = btn.dataset.pinned === "1";
      if (isCurrentlyPinned) {
        if (!confirm(`确认取消 Pin "${bookName}"？
（这会删除该书的所有本地缓存）`)) return;
        btn.disabled = true;
        btn.textContent = "处理中…";
        await unpinBook(bookId2);
        info("reader", `已 unpin ${bookName}`, { bookId: bookId2 });
        btn.textContent = "📌 Pin 此书";
        btn.dataset.pinned = "0";
        btn.disabled = false;
      } else {
        btn.disabled = true;
        btn.textContent = "Pin 中…";
        const r = await pinBook(bookId2, bookName || `书 ${bookId2.slice(-6)}`);
        if (!r.ok) {
          alert(`Pin 失败: ${r.reason}`);
          btn.textContent = "📌 Pin 此书";
          btn.disabled = false;
          return;
        }
        info("reader", `已 pin ${bookName}`, { bookId: bookId2 });
        btn.textContent = "📌 已 Pin（点击取消）";
        btn.dataset.pinned = "1";
        btn.disabled = false;
      }
    });
    anchor.appendChild(btn);
  }
  async function insertContent() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    const itemId2 = ((_a = window.location.pathname.split("/").pop()) == null ? void 0 : _a.substring(0, 19)) || "";
    if (!itemId2) {
      console.warn("No item_id found in URL");
      return;
    }
    latestItemId = itemId2;
    let chapter = null;
    if (currentBook == null ? void 0 : currentBook.book_id) {
      const cached = await getCachedChapter(currentBook.book_id, itemId2);
      if (cached) {
        debug("reader", `缓存命中 ${currentBook.book_id}:${itemId2}`, {
          scope: cached.scope,
          ageMs: Date.now() - cached.createdAt
        });
        chapter = {
          content: cached.content,
          novel_data: {
            book_id: cached.bookId,
            item_id: cached.itemId,
            title: ""
          }
        };
      }
    }
    if (!chapter) {
      chapter = await getChapter(itemId2);
    }
    if (!chapter) {
      console.warn("No chapter found for item_id:", itemId2);
      return;
    }
    if (((_b = chapter.novel_data) == null ? void 0 : _b.book_id) && typeof chapter.content === "string") {
      void cacheChapter(
        chapter.novel_data.book_id,
        (currentBook == null ? void 0 : currentBook.title) ?? "",
        itemId2,
        chapter.content
      ).catch((e) => warn("reader", "cacheChapter failed", { error: String(e) }));
      if (currentBook == null ? void 0 : currentBook.chapter_list) {
        const idx = currentBook.chapter_list.findIndex((c) => c.item_id === itemId2);
        if (idx >= 0) {
          void updateReadingProgress(chapter.novel_data.book_id, itemId2, idx);
        }
      }
      void injectPinButton(chapter.novel_data.book_id, (currentBook == null ? void 0 : currentBook.title) ?? "");
    }
    if (latestItemId !== itemId2) {
      console.debug("Stale chapter response discarded:", itemId2);
      return;
    }
    console.log("Chapter:", chapter);
    currentChapterWithContent = chapter;
    const pageState = unsafeWindow.__INITIAL_STATE__;
    const chapterTitle = ((_c = chapter.novel_data) == null ? void 0 : _c.title) || ((_e = (_d = pageState == null ? void 0 : pageState.reader) == null ? void 0 : _d.chapterData) == null ? void 0 : _e.title);
    if (typeof chapter.content === "string") {
      void applyBookCss((_f = chapter.novel_data) == null ? void 0 : _f.css_map, "#fqa-reader-content");
      const dp = new DOMParser();
      const doc = dp.parseFromString(chapter.content, "text/html");
      const body = doc.body;
      body.querySelectorAll('link[rel="stylesheet"]').forEach((el) => el.remove());
      let article = body.querySelector("article");
      let toProcess = article || body;
      processFootnotes(toProcess);
      for (let i2 = 0; i2 < toProcess.childNodes.length; i2++) {
        if (i2 < 2 && ((_h = (_g = toProcess.childNodes[i2]) == null ? void 0 : _g.innerHTML) == null ? void 0 : _h.includes(chapterTitle))) {
          toProcess.removeChild(toProcess.childNodes[i2]);
          break;
        }
      }
      if (!article) {
        article = document.createElement("article");
        article.innerHTML = toProcess.innerHTML;
        toProcess = article;
      }
      const readerContainer = document.querySelector("div.muye-reader-content:not(.fqa)");
      if (readerContainer) {
        const scriptContainer = ensureScriptContainer(readerContainer, false);
        scriptContainer.appendChild(toProcess);
        bindFootnoteInteraction(scriptContainer);
      }
    } else if (chapter.content.picInfos) {
      if (chapter.content.encrypt) {
        const imgs = [];
        for (let i2 = 0; i2 < chapter.content.picInfos.length; i2++) {
          const picInfo = chapter.content.picInfos[i2];
          const img = document.createElement("img");
          img.className = "fqa-comic-img fqa-comic-encrypted";
          img.alt = `第${i2 + 1}页`;
          img.dataset.encryptedUrl = picInfo.picUrl;
          img.dataset.encryptKey = chapter.content.encrypt_key;
          img.dataset.pageIndex = i2.toString();
          img.style.minHeight = "500px";
          img.style.backgroundColor = "#f0f0f0";
          imgs.push(img);
        }
        const readerContainer = document.querySelector("div.muye-reader-content:not(.fqa)");
        if (readerContainer) {
          const scriptContainer = ensureScriptContainer(readerContainer, true);
          imgs.forEach((img) => scriptContainer.appendChild(img));
          const observer = new IntersectionObserver(
            async (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) {
                  const img = entry.target;
                  if (img.dataset.encryptedUrl && img.dataset.encryptKey && !img.src) {
                    observer.unobserve(img);
                    try {
                      const encryptedBuffer = await fetchArrayBuffer(
                        img.dataset.encryptedUrl
                      );
                      const decryptedBuffer = await decryptComicImage(
                        encryptedBuffer,
                        img.dataset.encryptKey
                      );
                      const blob = new Blob([decryptedBuffer], { type: "image/jpeg" });
                      const blobUrl = URL.createObjectURL(blob);
                      img.src = blobUrl;
                      img.style.minHeight = "";
                      img.style.backgroundColor = "";
                      img.onload = () => {
                        URL.revokeObjectURL(blobUrl);
                      };
                    } catch (error2) {
                      console.error(`解密图片失败 (页 ${img.dataset.pageIndex}):`, error2);
                      img.alt = `第${Number(img.dataset.pageIndex) + 1}页 - 解密失败`;
                      img.style.backgroundColor = "#ffebee";
                    }
                  }
                }
              }
            },
            {
              rootMargin: "200px"
            }
          );
          comicObserver = observer;
          imgs.forEach((img) => observer.observe(img));
        }
      } else {
        const imgs = [];
        for (let i2 = 0; i2 < chapter.content.picInfos.length; i2++) {
          const picInfo = chapter.content.picInfos[i2];
          const img = document.createElement("img");
          img.className = "fqa-comic-img";
          img.alt = `第${i2 + 1}页`;
          img.src = picInfo.picUrl;
          imgs.push(img);
        }
        const readerContainer = document.querySelector("div.muye-reader-content:not(.fqa)");
        if (readerContainer) {
          const scriptContainer = ensureScriptContainer(readerContainer, true);
          imgs.forEach((img) => scriptContainer.appendChild(img));
        }
      }
    }
    const muyeReaderTitle = document.querySelector("h1.muye-reader-title");
    let muyeReaderSubtitle = document.querySelector("div.muye-reader-subtitle");
    (_i = document.querySelector("#fqa-subtitle")) == null ? void 0 : _i.remove();
    if (muyeReaderSubtitle) {
      let _cloned = cloneElement(muyeReaderSubtitle);
      muyeReaderSubtitle.classList.add("fqa-hide");
      _cloned.id = "fqa-subtitle";
      muyeReaderSubtitle.insertAdjacentElement("afterend", _cloned);
      muyeReaderSubtitle = _cloned;
      _cloned.classList.remove("fqa-hide");
      console.log("clone subtitle: ", _cloned);
    }
    if (muyeReaderTitle) {
      muyeReaderTitle.textContent = chapterTitle;
    }
    console.log("Current book:", currentBook);
    if (!currentBook || currentBook == null || currentBook.book_id !== ((_j = chapter.novel_data) == null ? void 0 : _j.book_id)) {
      currentBook = await getBookInfoAndCatalog((_k = chapter.novel_data) == null ? void 0 : _k.book_id);
      console.log("Current book:", currentBook);
    }
    if (currentBook && currentBook.chapter_list) {
      const currentChapterItem = currentBook.chapter_list.find((c) => c.item_id === itemId2);
      if (currentChapterItem) {
        console.log("Current chapter:", currentChapterItem);
        document.title = currentChapterItem.title + " - " + currentBook.title + " - 番茄小说";
        if (document.getElementById("fqa-current-chapter-volume")) {
          const c = document.getElementById("fqa-current-chapter-volume");
          if (c) {
            c.textContent = currentChapterItem.volume_title;
          }
        } else {
          const volSpan = document.createElement("span");
          volSpan.className = "desc-item";
          volSpan.id = "fqa-current-chapter-volume";
          volSpan.textContent = currentChapterItem.volume_title;
          const c = muyeReaderSubtitle == null ? void 0 : muyeReaderSubtitle.firstChild;
          if (c) {
            c.insertAdjacentElement("beforebegin", volSpan);
          }
        }
        let updateTimeSpans = (muyeReaderSubtitle == null ? void 0 : muyeReaderSubtitle.querySelectorAll("span.desc-item")) || [];
        console.log("spans len", updateTimeSpans.length, "assertIsOffshelf", updateTimeSpans.length < 3);
        if (updateTimeSpans.length >= 3) {
          console.log("if");
          let updateTimeSpan = updateTimeSpans[updateTimeSpans.length - 1];
          let uttspan = updateTimeSpan.firstChild;
          uttspan == null ? void 0 : uttspan.remove();
          updateTimeSpan.innerHTML = "更新时间：" + currentChapterItem.update_time;
        } else {
          console.log("else");
          (_l = updateTimeSpans[updateTimeSpans.length - 1]) == null ? void 0 : _l.remove();
          const updateTimeSpan = document.createElement("span");
          updateTimeSpan.className = "desc-item";
          updateTimeSpan.textContent = `更新时间：${currentChapterItem.update_time}`;
          console.log("assert equal", currentChapterItem.item_id === ((_m = currentChapterWithContent == null ? void 0 : currentChapterWithContent.novel_data) == null ? void 0 : _m.item_id));
          console.log("wordcnt", (_n = currentChapterWithContent == null ? void 0 : currentChapterWithContent.novel_data) == null ? void 0 : _n.chapter_word_number);
          const c = document.getElementById("fqa-current-chapter-volume");
          let b = null;
          if (currentChapterItem.item_id === ((_o = currentChapterWithContent == null ? void 0 : currentChapterWithContent.novel_data) == null ? void 0 : _o.item_id)) {
            const wordCntSpan = document.createElement("span");
            wordCntSpan.className = "desc-item";
            wordCntSpan.textContent = `本章字数：${(_p = currentChapterWithContent == null ? void 0 : currentChapterWithContent.novel_data) == null ? void 0 : _p.chapter_word_number}字`;
            console.log(wordCntSpan);
            if (c) {
              console.log("insert wordcnt");
              c.insertAdjacentElement("afterend", wordCntSpan);
            }
            b = wordCntSpan;
          }
          console.log("insert update time");
          (_q = b || c) == null ? void 0 : _q.insertAdjacentElement("afterend", updateTimeSpan);
        }
      }
    }
    if (state.open) {
      await switchChapter(itemId2, {
        cover: (currentBook == null ? void 0 : currentBook.cover_url) ?? "",
        title: (currentBook == null ? void 0 : currentBook.title) ?? document.title
      });
    } else {
      refreshParagraphs();
    }
  }
  async function startAudioPlay() {
    var _a;
    if (state.open) {
      closeAudiobook();
      return;
    }
    const itemId2 = ((_a = window.location.pathname.split("/").pop()) == null ? void 0 : _a.substring(0, 19)) || "";
    if (!itemId2) return;
    initAudioPanel();
    await openAudiobook(itemId2, (currentBook == null ? void 0 : currentBook.book_id) ?? "", {
      cover: (currentBook == null ? void 0 : currentBook.cover_url) ?? "",
      title: (currentBook == null ? void 0 : currentBook.title) ?? document.title
    });
  }
  async function onUrlChange$1(_previous) {
    await insertContent();
  }
  async function onHashChange$1(_previous) {
  }
  async function onLoad$1() {
    var _a;
    async function fetchBookInfo() {
      var _a2, _b;
      const pageState = unsafeWindow.__INITIAL_STATE__;
      const bid = (_b = (_a2 = pageState == null ? void 0 : pageState.reader) == null ? void 0 : _a2.chapterData) == null ? void 0 : _b.bookId;
      currentBook = await getBookInfoAndCatalog(bid);
    }
    void fetchBookInfo();
    const toolbar = document.querySelector("div.reader-toolbar > div");
    const toolbarButton = document.querySelector("div.reader-toolbar > div > div:nth-child(3)");
    if (toolbarButton && toolbar) {
      const c = cloneElement(toolbarButton);
      c.id = "fqa-toggle-audiobook";
      const listenIcon = document.createElement("span");
      listenIcon.textContent = "听";
      listenIcon.style.width = "24px";
      listenIcon.style.height = "24px";
      listenIcon.style.fontSize = "24px";
      listenIcon.style.lineHeight = "24px";
      listenIcon.classList.add("muyeicon-icon");
      listenIcon.classList.add("reader-toolbar-item-icon");
      (_a = c.firstChild) == null ? void 0 : _a.replaceWith(listenIcon);
      const l = c.lastChild;
      if (l) {
        l.textContent = "听书";
      }
      c.addEventListener("click", () => void startAudioPlay());
      toolbar.appendChild(c);
    }
    const bookshelfButton = document.querySelector("div.reader-toolbar-item");
    if (userState.isLogin && bookshelfButton && bookshelfButton.innerHTML.includes("书架")) {
      const shelf = cloneElement(bookshelfButton);
      bookshelfButton.replaceWith(shelf);
      let inShelf = false;
      let ready = false;
      let busy = false;
      async function ensureBookshelfState() {
        while (!currentBook) {
          await sleep(50);
        }
        inShelf = await isInBookshelf(currentBook.book_id);
        shelf.classList.toggle("reader-toolbar-item-disabled", inShelf);
        const label = shelf.lastChild;
        if (label) label.textContent = inShelf ? "已在书架" : "加入书架";
        ready = true;
      }
      void ensureBookshelfState();
      shelf.addEventListener("click", async () => {
        const book = currentBook;
        if (!ready || busy || !book) return;
        busy = true;
        try {
          if (inShelf) {
            if (settings.shelfRemoveConfirm) {
              if (!unsafeWindow.confirm(`确定要把《${book.title ?? "这本书"}》从书架移出吗？`)) return;
            }
            await removeFromBookshelf(book.book_id);
          } else {
            await addToBookshelf(book.book_id);
          }
          await ensureBookshelfState();
        } catch (error2) {
          console.error("[fqa:reader] 书架操作失败:", error2);
          unsafeWindow.alert(error2 instanceof Error ? error2.message : "书架操作失败");
        } finally {
          busy = false;
        }
      });
    }
    document.querySelector("div.muye-reader-btns");
    await insertContent();
  }
  function readerFilter(path, _query, _hash) {
    return path.startsWith("/reader") || path.startsWith("reader");
  }
  const _exports = [
    {
      id: "readerHook_load",
      event: "load",
      handler: onLoad$1,
      filter: readerFilter
    },
    {
      id: "readerHook_urlChange",
      event: "onUrlChange",
      handler: onUrlChange$1,
      filter: readerFilter
    },
    {
      id: "readerHook_hashChange",
      event: "onHashChange",
      handler: onHashChange$1,
      filter: readerFilter
    }
  ];
  const PANEL_ID = "fqa-control-panel";
  const POPOVER_ID = "fqa-control-popover";
  const SIDEBAR_ID = "fqa-control-sidebar";
  const STYLE_ID = "fqa-control-styles";
  let mode = GM_getValue("fqa.panel.mode", "popover");
  let mounted = false;
  let countdownTimer = null;
  let refreshTimer = null;
  const unsubs = [];
  function mountPanel() {
    if (mounted) return;
    mounted = true;
    injectStyles();
    attachTriggerButton();
    unsubs.push(subscribe(scheduleRefresh));
    unsubs.push(subscribe$1(scheduleRefresh));
    info("panel", `控制面板已挂载（模式: ${mode}）`);
  }
  function attachTriggerButton() {
    if (!document.body) return;
    if (document.getElementById(PANEL_ID)) return;
    const button = document.createElement("button");
    button.id = PANEL_ID;
    button.className = "fqa-control-trigger";
    button.title = "番茄助手控制面板";
    button.textContent = "⚙️";
    button.addEventListener("click", toggleMode);
    document.body.appendChild(button);
  }
  function ensurePanelButton() {
    if (!mounted) return;
    attachTriggerButton();
  }
  function toggleMode() {
    var _a, _b;
    if (mode === "popover") {
      const existing = document.getElementById(POPOVER_ID);
      if (existing) {
        existing.remove();
        stopCountdown();
        return;
      }
      (_a = document.getElementById(SIDEBAR_ID)) == null ? void 0 : _a.remove();
      renderPopover();
      startCountdown();
      mode = "popover";
    } else {
      mode = "popover";
      GM_setValue("fqa.panel.mode", mode);
      (_b = document.getElementById(SIDEBAR_ID)) == null ? void 0 : _b.remove();
      renderPopover();
      startCountdown();
    }
  }
  function switchToSidebar() {
    var _a;
    mode = "sidebar";
    GM_setValue("fqa.panel.mode", mode);
    (_a = document.getElementById(POPOVER_ID)) == null ? void 0 : _a.remove();
    stopCountdown();
    renderSidebar();
  }
  function renderPopover() {
    const pop = document.createElement("div");
    pop.id = POPOVER_ID;
    pop.className = "fqa-control-popover";
    pop.innerHTML = buildHTML(true);
    document.body.appendChild(pop);
    bindActions(pop);
    setTimeout(() => {
      document.addEventListener("click", onDocClickClosePopover);
    }, 0);
  }
  function renderSidebar() {
    const sb = document.createElement("div");
    sb.id = SIDEBAR_ID;
    sb.className = "fqa-control-sidebar";
    sb.innerHTML = buildHTML(false);
    document.body.appendChild(sb);
    bindActions(sb);
  }
  function onDocClickClosePopover(ev) {
    var _a;
    const pop = document.getElementById(POPOVER_ID);
    if (!pop) {
      document.removeEventListener("click", onDocClickClosePopover);
      return;
    }
    const target = ev.target;
    if (pop.contains(target)) return;
    if (((_a = ev.target) == null ? void 0 : _a.id) === PANEL_ID) return;
    pop.remove();
    stopCountdown();
    document.removeEventListener("click", onDocClickClosePopover);
  }
  function startCountdown() {
    if (countdownTimer) return;
    countdownTimer = setInterval(() => {
      const el = document.querySelector(".fqa-throttle-countdown");
      if (el) {
        const s = getCountdownSeconds();
        el.textContent = s > 0 ? `${s}s` : "就绪";
      }
    }, 1e3);
  }
  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }
  function scheduleRefresh() {
    if (refreshTimer) return;
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      refreshContent();
    }, 100);
  }
  function refreshContent() {
    const pop = document.getElementById(POPOVER_ID);
    const sb = document.getElementById(SIDEBAR_ID);
    if (!pop && !sb) return;
    const target = pop ?? sb;
    if (!target) return;
    const newHTML = buildHTML(Boolean(pop));
    target.innerHTML = newHTML;
    bindActions(target);
  }
  function buildHTML(isPopover) {
    var _a, _b;
    const poolState = getPoolState();
    const throttleCfg = getThrottleConfig();
    const countdown = getCountdownSeconds();
    const logs = getLog().slice(-30).reverse();
    return `
        <div class="fqa-panel-header">
            <span class="fqa-panel-title">🍅 番茄助手 控制面板</span>
            <div class="fqa-panel-mode-switch">
                ${isPopover ? '<button data-act="to_sidebar" title="固定为侧栏">⮮</button>' : '<button data-act="to_popover" title="切回浮窗">⮯</button>'}
                <button data-act="help" title="帮助">?</button>
            </div>
        </div>

        <section class="fqa-panel-section">
            <h3>📊 状态</h3>
            <div class="fqa-panel-grid">
                <div>当前设备</div>
                <div class="fqa-mono">${((_b = (_a = poolState.slots[poolState.activeIndex]) == null ? void 0 : _a.device_id) == null ? void 0 : _b.slice(-6)) ?? "—"}</div>
                <div>节流倒计时</div>
                <div><span class="fqa-throttle-countdown fqa-mono">${countdown > 0 ? `${countdown}s` : "就绪"}</span></div>
                <div>池子容量</div>
                <div>${poolState.slots.length} / 3 槽</div>
                <div>健康</div>
                <div>${poolState.slots.filter((s) => s.health === "healthy").length} 健康</div>
            </div>
        </section>

        <section class="fqa-panel-section">
            <h3>📱 设备池</h3>
            <div class="fqa-pool-list">
                ${renderPoolList(poolState)}
            </div>
            <div class="fqa-panel-actions">
                <button data-act="reset_pool" class="fqa-danger-btn">⚠ 重置整个池子</button>
            </div>
        </section>

        <section class="fqa-panel-section">
            <h3>📌 已 Pin 的书</h3>
            <div class="fqa-pin-list" id="fqa-pin-list">
                <div class="fqa-pin-loading">加载中…</div>
            </div>
        </section>

        <section class="fqa-panel-section">
            <h3>⏱ 节流</h3>
            <label><input type="checkbox" data-cfg="throttle.enabled" ${throttleCfg.enabled ? "checked" : ""}> 启用</label>
            <div class="fqa-panel-grid">
                <div>最小 (秒)</div>
                <input type="number" min="0" max="60" data-cfg="throttle.minSec" value="${Math.floor(throttleCfg.minMs / 1e3)}">
                <div>最大 (秒)</div>
                <input type="number" min="5" max="180" data-cfg="throttle.maxSec" value="${Math.floor(throttleCfg.maxMs / 1e3)}">
            </div>
            <button data-act="reset_throttle" class="fqa-small-btn">重置节流计时</button>
        </section>

        <section class="fqa-panel-section">
            <h3>📋 诊断日志 <span class="fqa-panel-sub">(${getLog().length}/200)</span></h3>
            <div class="fqa-log-list">
                ${renderLogs(logs)}
            </div>
            <div class="fqa-panel-actions">
                <button data-act="copy_log" class="fqa-small-btn">复制全部日志</button>
                <button data-act="clear_log" class="fqa-small-btn">清空日志</button>
            </div>
        </section>
    `;
  }
  function renderPoolList(state2) {
    if (state2.slots.length === 0) {
      return '<div class="fqa-pool-empty">池子为空。请刷新页面重新注册。</div>';
    }
    return state2.slots.map((slot) => {
      var _a;
      const isActive = state2.slots.indexOf(slot) === state2.activeIndex;
      const healthBadge = slot.health === "healthy" ? '<span class="fqa-badge healthy">健康</span>' : '<span class="fqa-badge dead">已封</span>';
      const activeBadge = isActive ? '<span class="fqa-badge active">当前</span>' : "";
      const cooldownRemain = slot.refillCooldownUntil > Date.now() ? `<div class="fqa-pool-cooldown">冷却 ${Math.ceil((slot.refillCooldownUntil - Date.now()) / 1e3 / 60)} 分钟</div>` : "";
      return `
            <div class="fqa-pool-item">
                <div class="fqa-pool-item-head">
                    <span class="fqa-pool-item-idx">槽 ${state2.slots.indexOf(slot)}</span>
                    ${healthBadge} ${activeBadge}
                    <span class="fqa-mono fqa-pool-item-id">...${((_a = slot.device_id) == null ? void 0 : _a.slice(-6)) ?? "—"}</span>
                </div>
                <div class="fqa-pool-item-meta">
                    注册 ${formatRelative(slot.registeredAt)} · 失败 ${slot.failureStreak} 连
                </div>
                ${cooldownRemain}
                <div class="fqa-pool-item-actions">
                    ${!isActive && slot.health === "healthy" ? `<button data-act="manual_switch" data-slot="${state2.slots.indexOf(slot)}" class="fqa-small-btn">切到此槽</button>` : ""}
                    ${slot.health === "dead" ? `<button data-act="manual_refill" data-slot="${state2.slots.indexOf(slot)}" class="fqa-small-btn">补新设备</button>` : ""}
                </div>
            </div>
        `;
    }).join("");
  }
  async function renderPinnedAsync() {
    try {
      const list = await listPinnedBooks();
      const el = document.getElementById("fqa-pin-list");
      if (!el) return;
      if (list.length === 0) {
        el.innerHTML = '<div class="fqa-pin-empty">尚未 pin 任何书。阅读时顶栏会有 pin 按钮。</div>';
        return;
      }
      el.innerHTML = list.map((b) => renderPinItem(b)).join("");
    } catch (e) {
      warn("panel", "Pin 列表加载失败", { error: String(e) });
    }
  }
  function renderPinItem(b) {
    const sizeKb = (b.totalBytes / 1024).toFixed(1);
    const progress = b.lastReadIndex > 0 ? `<div class="fqa-pin-progress">📖 读至第 ${b.lastReadIndex + 1} 章</div>` : "";
    return `
        <div class="fqa-pin-item">
            <div class="fqa-pin-item-head">
                <span class="fqa-pin-item-name">${escapeHtml(b.bookName)}</span>
                <button data-act="unpin" data-book="${b.id}" class="fqa-danger-btn">删除</button>
            </div>
            <div class="fqa-pin-item-meta">
                ${b.chapterCount} 章 · ${sizeKb} KB · pin 于 ${formatRelative(b.pinnedAt)}
            </div>
            ${progress}
        </div>
    `;
  }
  function renderLogs(logs) {
    if (logs.length === 0) {
      return '<div class="fqa-log-empty">暂无日志</div>';
    }
    return logs.map((e) => {
      const t = new Date(e.ts).toISOString().slice(11, 19);
      return `<div class="fqa-log-entry fqa-log-${e.level}">[${t}] [${e.category}] ${escapeHtml(e.message)}</div>`;
    }).join("");
  }
  function bindActions(root) {
    root.addEventListener("click", (ev) => {
      const target = ev.target;
      const act = target.dataset.act;
      if (!act) return;
      ev.stopPropagation();
      switch (act) {
        case "to_sidebar":
          switchToSidebar();
          break;
        case "to_popover":
          toggleMode();
          break;
        case "help":
          showHelp();
          break;
        case "manual_switch":
          handleManualSwitch(parseInt(target.dataset.slot ?? "-1", 10));
          break;
        case "manual_refill":
          handleManualRefill(parseInt(target.dataset.slot ?? "-1", 10));
          break;
        case "reset_pool":
          handleResetPool();
          break;
        case "reset_throttle":
          resetThrottle();
          scheduleRefresh();
          break;
        case "copy_log":
          copyLogToClipboard();
          break;
        case "clear_log":
          if (confirm("确认清空所有诊断日志？")) {
            clearLog();
            scheduleRefresh();
          }
          break;
        case "unpin":
          handleUnpin(target.dataset.book ?? "");
          break;
      }
    });
    root.querySelectorAll("[data-cfg]").forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.dataset.cfg ?? "";
        if (key === "throttle.enabled") {
          setThrottleConfig({ enabled: input.checked });
        } else if (key === "throttle.minSec") {
          setThrottleConfig({ minMs: Math.max(0, parseInt(input.value, 10)) * 1e3 });
        } else if (key === "throttle.maxSec") {
          setThrottleConfig({ maxMs: Math.max(5, parseInt(input.value, 10)) * 1e3 });
        }
      });
    });
    void renderPinnedAsync();
  }
  function handleManualSwitch(slotIdx) {
    if (slotIdx < 0) return;
    const r = manualSwitch(slotIdx);
    if (!r.ok) {
      alert(`切换失败: ${r.reason}`);
      return;
    }
    scheduleRefresh();
  }
  async function handleManualRefill(slotIdx) {
    if (slotIdx < 0) return;
    const btn = document.querySelector(
      `button[data-act="manual_refill"][data-slot="${slotIdx}"]`
    );
    if (btn) {
      btn.disabled = true;
      btn.textContent = "注册中…";
    }
    const r = await manualRefill(slotIdx);
    if (!r.ok) {
      alert(`补员失败: ${r.reason}`);
      if (btn) {
        btn.disabled = false;
        btn.textContent = "补新设备";
      }
      return;
    }
    scheduleRefresh();
  }
  async function handleResetPool() {
    if (!confirm("重置整个池子会清空所有 3 个设备 ID 并重新注册。继续？")) return;
    info("panel", "用户触发：重置整个池子");
    await resetPool();
    scheduleRefresh();
  }
  async function handleUnpin(bookId2) {
    if (!bookId2) return;
    if (!confirm("确认删除这本书的缓存？")) return;
    await unpinBook(bookId2);
    scheduleRefresh();
  }
  function copyLogToClipboard() {
    var _a;
    const text = exportLogText();
    if ((_a = navigator.clipboard) == null ? void 0 : _a.writeText) {
      navigator.clipboard.writeText(text).then(
        () => info("panel", "日志已复制"),
        (e) => warn("panel", "复制失败", { error: String(e) })
      );
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
      }
      ta.remove();
    }
  }
  function showHelp() {
    alert(`🍅 番茄助手 控制面板 帮助

【设备池】
- 默认 3 个槽位，注册后会同时持有
- 某个被服务端封禁时，自动切换到下一个
- "补新设备"按钮手动注册替换 dead 槽（24h 冷却）

【节流】
- 5-25 秒随机间隔，避免请求模式被识别
- 偶发 30-90 秒长停顿，模拟真人阅读节奏

【Pin】
- 阅读器顶栏会有 📌 按钮
- 持久化保存整本书，可离线翻阅
- 最多 50 本 / 本最多 5000 章

【诊断日志】
- 最近 200 条（环形缓冲）
- 失败时会自动展开
- 可复制粘贴到工单/issue
`);
  }
  function formatRelative(ts) {
    if (!ts) return "—";
    const diff = Date.now() - ts;
    if (diff < 6e4) return "刚刚";
    if (diff < 36e5) return `${Math.floor(diff / 6e4)} 分钟前`;
    if (diff < 864e5) return `${Math.floor(diff / 36e5)} 小时前`;
    return `${Math.floor(diff / 864e5)} 天前`;
  }
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        #${PANEL_ID} {
            position: fixed; bottom: 20px; right: 20px; z-index: 999998;
            width: 40px; height: 40px; border-radius: 50%;
            background: #ff6b35; color: #fff; border: none; cursor: pointer;
            font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform .2s;
        }
        #${PANEL_ID}:hover { transform: scale(1.1); }
        .fqa-control-popover {
            position: fixed; bottom: 70px; right: 20px; z-index: 999999;
            width: 380px; max-height: 80vh; overflow-y: auto;
            background: #1f1f1f; color: #eee; border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4); padding: 0;
            font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 13px; line-height: 1.5;
        }
        .fqa-control-sidebar {
            position: fixed; top: 0; right: 0; bottom: 0; width: 320px; z-index: 999999;
            background: #1f1f1f; color: #eee;
            box-shadow: -4px 0 16px rgba(0,0,0,0.3);
            overflow-y: auto; padding: 16px;
            font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 13px; line-height: 1.5;
        }
        .fqa-panel-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 16px; border-bottom: 1px solid #333;
        }
        .fqa-panel-title { font-weight: 600; font-size: 14px; }
        .fqa-panel-mode-switch button {
            background: transparent; color: #aaa; border: 1px solid #444;
            padding: 2px 8px; border-radius: 4px; margin-left: 4px; cursor: pointer;
        }
        .fqa-panel-mode-switch button:hover { background: #333; }
        .fqa-panel-section {
            padding: 12px 16px; border-bottom: 1px solid #2a2a2a;
        }
        .fqa-panel-section h3 { margin: 0 0 8px; font-size: 13px; color: #ff9d5c; }
        .fqa-panel-sub { color: #888; font-size: 11px; font-weight: normal; }
        .fqa-panel-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px;
        }
        .fqa-panel-grid > div:nth-child(odd) { color: #aaa; }
        .fqa-mono { font-family: "SF Mono", Consolas, monospace; }
        .fqa-pool-item {
            background: #2a2a2a; border-radius: 6px; padding: 8px 10px;
            margin-bottom: 6px;
        }
        .fqa-pool-item-head {
            display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
        }
        .fqa-pool-item-idx { color: #ff9d5c; font-weight: 600; }
        .fqa-badge {
            font-size: 10px; padding: 1px 6px; border-radius: 3px; font-weight: 600;
        }
        .fqa-badge.healthy { background: #2d6a4f; color: #d8f3dc; }
        .fqa-badge.dead { background: #9d0208; color: #ffcdd2; }
        .fqa-badge.active { background: #ff6b35; color: #fff; }
        .fqa-pool-item-id { color: #888; font-size: 11px; margin-left: auto; }
        .fqa-pool-item-meta { color: #888; font-size: 11px; margin: 2px 0; }
        .fqa-pool-cooldown { color: #f4a261; font-size: 11px; }
        .fqa-pool-item-actions { margin-top: 6px; display: flex; gap: 4px; }
        .fqa-small-btn, .fqa-danger-btn {
            background: #444; color: #fff; border: none; padding: 4px 10px;
            border-radius: 4px; cursor: pointer; font-size: 12px;
        }
        .fqa-small-btn:hover { background: #555; }
        .fqa-danger-btn { background: #6a040f; }
        .fqa-danger-btn:hover { background: #9d0208; }
        .fqa-pin-item {
            background: #2a2a2a; border-radius: 6px; padding: 8px 10px; margin-bottom: 6px;
        }
        .fqa-pin-item-head {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;
        }
        .fqa-pin-item-name { font-weight: 600; }
        .fqa-pin-item-meta { color: #888; font-size: 11px; }
        .fqa-pin-progress { color: #ff9d5c; font-size: 11px; margin-top: 4px; }
        .fqa-pin-empty, .fqa-pin-loading, .fqa-pool-empty, .fqa-log-empty {
            color: #888; font-size: 12px; font-style: italic; padding: 8px 0;
        }
        .fqa-log-list {
            max-height: 200px; overflow-y: auto;
            background: #0d0d0d; border-radius: 4px; padding: 6px 8px;
        }
        .fqa-log-entry {
            font-family: "SF Mono", Consolas, monospace; font-size: 11px;
            padding: 2px 0; border-bottom: 1px solid #1a1a1a;
            word-break: break-word;
        }
        .fqa-log-entry:last-child { border-bottom: none; }
        .fqa-log-error { color: #ff6b6b; }
        .fqa-log-warn { color: #f4a261; }
        .fqa-log-info { color: #87ceeb; }
        .fqa-log-debug { color: #888; }
        .fqa-panel-actions { margin-top: 8px; display: flex; gap: 6px; }
        .fqa-throttle-countdown { color: #5eead4; font-weight: 600; }
        input[type="checkbox"] { margin-right: 4px; }
        input[type="number"] {
            background: #2a2a2a; color: #fff; border: 1px solid #444;
            padding: 2px 6px; border-radius: 3px; width: 100%; box-sizing: border-box;
        }
    `;
    document.head.appendChild(style);
  }
  if (document.body) {
    mountPanel();
  } else {
    document.addEventListener("DOMContentLoaded", mountPanel, { once: true });
  }
  const hooks = [
    ..._exports,
    ..._exports$1
  ];
  async function onEvent(event, previous) {
    const path = window.location.pathname;
    const hash2 = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const tasks = [];
    for (const hook of hooks) {
      if (hook.event === event && hook.filter(path, params, hash2)) {
        tasks.push(async () => {
          try {
            await hook.handler(previous);
          } catch (err) {
            console.error(`[hook:${hook.id}] handler failed:`, err);
          }
        });
      }
    }
    if (tasks.length > 0) {
      await Promise.allSettled(tasks.map((task) => task()));
    }
  }
  async function onUrlChange(previous) {
    ensurePanelButton();
    return await onEvent("onUrlChange", previous);
  }
  async function onHashChange(previous) {
    ensurePanelButton();
    return await onEvent("onHashChange", previous);
  }
  async function onLoad() {
    ensurePanelButton();
    return await onEvent("load");
  }
  async function onEnter() {
    return await onEvent("enter");
  }
  const name = "fanqie-assistant";
  const version = "0.1.4";
  const win = unsafeWindow;
  let previousUrl = win.location.href;
  let previousHash = win.location.hash;
  function installNavigationHooks() {
    for (const method of ["pushState", "replaceState"]) {
      const original = win.history[method];
      win.history[method] = function(...args) {
        const result = original.apply(this, args);
        void onUrlChange(previousUrl);
        previousUrl = win.location.href;
        return result;
      };
    }
    win.addEventListener("popstate", () => {
      void onUrlChange(previousUrl);
      previousUrl = win.location.href;
    });
    win.addEventListener("hashchange", () => {
      void onHashChange(previousHash);
      previousHash = win.location.hash;
    });
  }
  async function mainInit() {
    initLogger();
    console.log(`================================================`);
    console.log(`==  ${name} - ${version}                       ==`);
    console.log(`==  L1-L6 反封禁 + 设备池 + Pin              ==`);
    console.log(`================================================`);
    info("main", `${name} ${version} 启动`);
    installNavigationHooks();
    void onEnter();
    initFontDecrypt();
    void inject();
    initUserStyle();
    mountRecoveryUI();
    await whenBodyReady();
    mountPanel();
    await Promise.allSettled([
      initCache().catch((e) => console.error("[fqa:main] initCache failed:", e)),
      initPool().catch((e) => console.error("[fqa:main] initPool failed:", e))
    ]);
    try {
      const state2 = getPoolState();
      if (state2.slots.length > 0 && state2.slots.every((s) => s.health === "dead")) {
        const healthyCount = state2.slots.filter((s) => s.health === "healthy").length;
        if (healthyCount === 0) {
          info("main", "initPool 后池子全 dead, 显式触发恢复弹窗");
          notifyFailure();
        }
      }
    } catch (e) {
      console.warn("[fqa:main] 自愈检查失败:", e);
    }
    void onLoad();
    ensurePanelButton();
    info("main", "主流程初始化完成");
  }
  function whenBodyReady() {
    return new Promise((resolve) => {
      if (document.body) {
        resolve();
        return;
      }
      document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
    });
  }
  mainInit();

})(vue, moment);
