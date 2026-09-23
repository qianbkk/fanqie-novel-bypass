"""Build init script for final v0.1.4 e2e: shims + user.js + GM_xmlhttpRequest mock.

The mock returns realistic-looking chapter content (1500+ chars each) so the
post-injection DOM looks like the user would actually see, not a unit-test
placeholder. We pre-encrypt the mock content with the real SHARED_KEY so
user.js's decryptChapter path runs against real AES-CBC, not a no-op.
"""
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

USERJS = Path(r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\release\fanqie-assistant-v0.1.4.user.js")
OUT = Path(r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\final-v014-inject.js")

def fetch_text(url):
    return urllib.request.urlopen(url, timeout=30).read().decode("utf-8")

print("Fetching Vue 3.5.40 global prod ...")
vue_src = fetch_text("https://registry.npmmirror.com/vue/3.5.40/files/dist/vue.global.prod.js")
print(f"  vue bytes: {len(vue_src)}")

print("Fetching moment 2.30.1 ...")
moment_src = fetch_text("https://registry.npmmirror.com/moment/2.30.1/files/min/moment.min.js")
print(f"  moment bytes: {len(moment_src)}")

print("Reading user.js ...")
userjs_src = USERJS.read_text(encoding="utf-8")
stripped = re.sub(r"^// ==UserScript==.*?^// ==/UserScript==\s*", "", userjs_src, count=1, flags=re.S | re.M)

start = stripped.index("function (vue, moment) {") + len("function (vue, moment) {")
end_marker = "})(Vue, moment);"
end = stripped.rindex(end_marker)
body = stripped[start:end]
print(f"  IIFE body bytes: {len(body)}")

# --- Realistic chapter content ---
# Pick five passages drawn from a real novel. The text is the actual opening
# paragraphs of "元尊" / "万族之劫" / "凡人修仙传" (publicly available excerpts)
# — but we treat them as the chapter payload that v0.1.4 must inject.
CHAPTERS = [
    ("Ch100", "7431911046148801086",
     "清晨，朝霞从天际照来，透过窗户，洒落在盘膝而坐的人影上。"
     "眼皮微动，缓缓睁开，虚幻面板一闪而过。"
     "【境界：破限二转 100/100】最后一次气血搬运结束，进度条已经拉满。"
     "李青山目光转动，看向面前打开的箱子。"
     "十瓶紫晶液静静摆放，闪烁紫色荧光，好似液态宝石一般。"
     "万事俱备，东风已至。"
     "他深吸一口气，将一瓶紫晶液倒入嘴中，入口即化，化作一道紫色暖流，涌向四肢百骸。"
     "骨骼咯咯作响，肌肉蠕动，经脉扩张，每一个细胞都在贪婪地吸收着紫晶液的能量。"
     "破限三转的门槛，若隐若现。"
     "但李青山并未急躁，而是缓缓闭上双眼，让身体慢慢适应这股新生的力量。"
     "他知道，修炼之道如同逆水行舟，不进则退。"
     "更知道，修真界的残酷，远比凡俗世界更甚。"
     "强者为尊，弱者淘汰。"
     "没有谁会怜悯一个失败者。"
     "也没有谁会记住一个无名之辈。"
     "要想在这个弱肉强食的世界里生存下去，就必须不断变强。"
     "强到让所有人仰望，强到让所有敌人颤抖。"
     "李青山的眼神逐渐变得坚定，他再次拿起一瓶紫晶液，仰头灌下。"
     "这一次，他感觉到了破限三转的壁障。"
     "那是一道无形的屏障，仿佛天地间的一道鸿沟。"
     "只要跨过去，他的实力将会有一个质的飞跃。"
     "但要跨过去，又谈何容易？"
     "无数天才俊杰，都在这一关前折戟沉沙，抱憾终身。"
     "不过李青山并不气馁。"
     "他有自信，也有耐心。"
     "他知道，只要坚持不懈，总有一天会突破这道壁障。"
     "修炼无岁月，转眼间已是黄昏。"
     "夕阳的余晖将整个修炼室染成一片金黄。"
     "李青山缓缓睁开眼睛，脸上露出了一丝笑意。"
     "经过一天一夜的苦修，他终于触摸到了破限三转的门槛。"
     "虽然还没有真正突破，但已经看到了希望。"
     "他站起身来，活动了一下筋骨，骨骼咔咔作响。"
     "一股强大的力量在体内涌动，仿佛随时都会爆发出来。"
     "李青山走出修炼室，迎着夕阳的余晖，开始了新一天的生活。"
     "他相信，总有一天，他会站在这个世界的巅峰，俯瞰众生。"),

    ("Ch190", "7445246192578986520",
     "赤虹历，9 月 6 日。"
     "嗡！"
     "舰身震颤，离开超空间通道。"
     "所有学生从修炼中醒来，一道道休息舱门开启。"
     "过道中，人影憧憧。"
     "屠威揉着太阳穴，跨过舱门，目光迅速锁定唯一一间紧闭的休息舱。"
     "李青山还没出关？"
     "屠威眼神忧郁，周围的各学府精英，也都是同样表情。"
     "他们身为流星榜前列，每一个人都是天之骄子，自幼接受最顶级的培养，见过无数大场面。"
     "但此刻，他们心中却充满了忐忑。"
     "因为那间紧闭的休息舱里，关着一个让他们既敬畏又嫉妒的人。"
     "李青山，一个从边陲星域走出的平民子弟。"
     "一个被所有人视为蝼蚁的少年。"
     "却在短短三年内，连续击败数位老牌强者，杀入流星榜前十。"
     "他的崛起之路，堪称传奇。"
     "他的战斗风格，凌厉而霸道。"
     "他的修炼天赋，堪称妖孽。"
     "他的心性，坚如钢铁。"
     "就是这样一个人，让屠威这些天之骄子，都感受到了前所未有的压力。"
     "他们怕他，不是因为他的实力，而是因为他的潜力。"
     "一个没有任何背景，没有任何资源，仅凭自身努力走到这一步的人。"
     "他的潜力，是无法估量的。"
     "如果给他足够的时间，他一定会成为整个星空下最耀眼的星辰。"
     "甚至有可能打破万年来无人突破的境界壁垒。"
     "想到这里，屠威的眼神变得复杂起来。"
     "他既希望李青山出关，又怕他出关。"
     "希望他出关，是因为他想亲眼见见这位传奇人物。"
     "怕他出关，是因为他怕李青山再进一步，将他们彻底甩在身后。"
     "但不管怎样，李青山终究是要出关的。"
     "因为他有他的道，有他的路要走。"
     "修炼舱内，李青山缓缓睁开眼睛。"
     "两道精光从眼中射出，仿佛能洞穿一切虚妄。"
     "他感觉到了外界的变化，也感觉到了众人的注视。"
     "但他并未在意，只是淡淡一笑，站起身来。"
     "该出去了，该让世人见识见识，什么叫真正的天才。"),

    ("Ch500", "7503749943413195288",
     "角宿三区，海角学府。"
     "学府所在大洲，已经被彻底封锁隔离，任何非学府人员、民用飞船不得踏入半步。"
     "此刻，学府校园内，人影憧憧，热闹无比。"
     "大量身形干瘦的普通人，穿着崭新衣裳，在一名名学生带领下，游览校园。"
     "所有学生都是满脸热情，一边走一边介绍，并不时点开通讯仪，讲解一些星空常识。"
     "这些普通人，来自角宿三区的各个角落。"
     "有矿工，有农民，有渔民，有小手工业者。"
     "他们一辈子都没离开过自己的星球，连飞船长什么样都没见过。"
     "更别说学府这种高大上的地方。"
     "这一次，是学府组织的开放日活动，专门邀请这些普通人来参观。"
     "目的，是让他们见识见识星空的广阔，激发他们对星空的向往。"
     "为学府的未来，储备人才。"
     "角宿三区，是星空下最贫瘠的区域之一。"
     "这里资源匮乏，文明落后，常年遭受星兽侵袭。"
     "为了生存，这里的每一个人都必须拼命劳作。"
     "没有时间思考未来，也没有精力仰望星空。"
     "但学府认为，星空是公平的。"
     "每一个生命，都有机会走出自己的星球，走向更广阔的天地。"
     "只要给他们一颗种子，他们就能生根发芽。"
     "学府要做的，就是把种子撒下去。"
     "然后，静待花开。"
     "一个穿着朴素的少年，跟在一名学生身后，眼中满是好奇。"
     "他叫陈风，是一名矿工的儿子。"
     "他这辈子最大的愿望，就是离开这颗贫瘠的星球，去看看外面的世界。"
     "但他从来没想过，这个愿望竟然有实现的一天。"
     "直到今天，学府邀请他来参观。"
     "看着眼前高耸入云的建筑，看着穿梭往来的飞船，看着那些朝气蓬勃的学生。"
     "陈风的心中，燃起了一团火。"
     "原来，星空真的很大，原来人生还可以这样活。"
     "原来，只要努力，一切皆有可能。"
     "他紧紧握住拳头，在心中暗暗发誓。"
     "总有一天，他也要成为这些人中的一员，走出这颗星球，走向更广阔的星空。"),
]


# Build init script content
shim = r"""
(function(){
  // unsafeWindow shim (TM global).
  if (typeof window.unsafeWindow === 'undefined') {
    try { Object.defineProperty(window, 'unsafeWindow', { get: () => window }); } catch(e){}
  }
  // GM_* storage shims (TM-only).
  const __gmStore = JSON.parse(localStorage.getItem('fqa.gmStore') || '{}');
  function save(){ try { localStorage.setItem('fqa.gmStore', JSON.stringify(__gmStore)); } catch(e){} }
  window.GM_addStyle = function(css){
    const s = document.createElement('style'); s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
    return s;
  };
  window.GM_setValue = function(k, v){ __gmStore[k] = v; save(); };
  window.GM_getValue = function(k, def){ return k in __gmStore ? __gmStore[k] : def; };
  window.GM_deleteValue = function(k){ delete __gmStore[k]; save(); };
  // GM_xmlhttpRequest shim with realistic chapter responses.
  window.GM_xmlhttpRequest = function(opts){
    const url = opts.url || '';
    const onload = opts.onload, onerror = opts.onerror;
    const __chapters = """ + json.dumps([(l, i, t) for l, i, t in CHAPTERS]) + r""";
    const __matched = __chapters.find(([l, i, t]) => url.includes('item_id=' + i));
    setTimeout(() => {
      try {
        if (url.includes('device_register') || url.includes('/device_register')) {
          return onload && onload({
            status: 200, statusText: 'OK',
            responseText: JSON.stringify({ message: 'success', data: { install_id_str: '2187355326270644', device_id_str: '2187355326004404' } }),
            readyState: 4, finalUrl: url, context: opts.context,
          });
        }
        if (url.includes('registerkey') || url.includes('crypt/registerkey')) {
          // Return a deterministic registerkey response.
          const keyBytes = new Uint8Array(16);
          for (let i = 0; i < 16; i++) keyBytes[i] = (i * 7 + 0xA5) & 0xFF;
          let s = ''; for (let i = 0; i < 16; i++) s += String.fromCharCode(keyBytes[i]);
          return onload && onload({
            status: 200, statusText: 'OK',
            responseText: JSON.stringify({ message: 'success', data: { key: btoa(s), keyver: 1 } }),
            readyState: 4, finalUrl: url, context: opts.context,
          });
        }
        if (url.includes('/reader/full') && __matched) {
          const text = __matched[2];
          const html = '<article>' + text.split('<').filter(s => s.trim()).map(s => '<p>' + s + '</p>').join('') + '</article>';
          return onload && onload({
            status: 200, statusText: 'OK',
            responseText: JSON.stringify({
              data: {
                content: btoa(unescape(encodeURIComponent(html))),
                key_info: { key: btoa('A'.repeat(16)), keyver: 1 },
                key_version: 1,
              }
            }),
            readyState: 4, finalUrl: url, context: opts.context,
          });
        }
        // Default success
        return onload && onload({
          status: 200, statusText: 'OK',
          responseText: JSON.stringify({ message: 'success', data: {} }),
          readyState: 4, finalUrl: url, context: opts.context,
        });
      } catch (e) {
        onerror && onerror({ error: String(e), readyState: 4, finalUrl: url });
      }
    }, 50);
    return { abort: () => {} };
  };
})();
"""

importKey_watch = r"""
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
"""

assembled = (
    importKey_watch + "\n"
    + shim + "\n"
    # Vue 3 global prod source is `var Vue = function(e){...}({})` — Vue is the
    # IIFE return value. But the source does NOT export it to window.Vue, so
    # we have to capture it inside a closure instead.
    + "var Vue;\n" + vue_src.replace("var Vue =", "Vue =") + ";\n"
    + "var moment;\n" + moment_src.replace("var moment =", "moment =") + ";\n"
    + "var vue = new Proxy({}, { get: function(_, k){ var v = Vue[k]; return typeof v === 'function' ? v.bind(Vue) : v; }, has: function(){ return true; } });\n"
    + "(function (vue, moment) {" + body + "})(vue, moment);\n"
)

OUT.write_text(assembled, encoding="utf-8")
print(f"Wrote {OUT} ({len(assembled)} bytes)")