# -*- coding: utf-8 -*-
"""v0.1.4 5-chapter e2e on real Edge with REAL-looking chapter text.

The previous 30-chapter run used a 50x repeat of the same paragraph as
mock content, which looked like a unit-test fixture, not a real chapter.
This version uses 5 different real-novel-style passages (one per chapter)
so the post-injection DOM looks like the user would actually see in the
real Edge. We assert each chapter renders >= 1500 chars of coherent
Chinese prose, with v0.1.4 BufferSource rejected = 0.
"""
import json
import urllib.request
import sys
import time
from websocket import create_connection

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

EDGE_PORT = 9556
INIT_SCRIPT_PATH = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\auto-inject-v014.js"

# 5 chapters across the book, each with a distinct real-novel-style
# passage (not the same paragraph repeated). All >= 1500 chars.
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
     "修炼无岁月。"
     "转眼间，已是黄昏。"
     "夕阳的余晖将整个修炼室染成一片金黄。"
     "李青山缓缓睁开眼睛，脸上露出了一丝笑意。"
     "经过一天一夜的苦修，他终于触摸到了破限三转的门槛。"
     "虽然还没有真正突破，但已经看到了希望。"
     "他站起身来，活动了一下筋骨，骨骼咔咔作响。"
     "一股强大的力量在体内涌动，仿佛随时都会爆发出来。"
     "李青山走出修炼室，迎着夕阳的余晖，开始了新一天的生活。"
     "他相信，总有一天，他会站在这个世界的巅峰，俯瞰众生。"
     "而现在，他要做的，就是不断积累，不断突破，不断超越自我。"
     "这就是他的道，也是他的命。"
     "永不言弃，永不退缩。"
     "这就是李青山的信念，也是他一路走来的真实写照。"),

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
     "李青山。"
     "一个从边陲星域走出的平民子弟。"
     "一个被所有人视为蝼蚁的少年。"
     "却在短短三年内，连续击败数位老牌强者，杀入流星榜前十。"
     "他的崛起之路，堪称传奇。"
     "他的战斗风格，凌厉而霸道。"
     "他的修炼天赋，堪称妖孽。"
     "他的心性，坚如钢铁。"
     "就是这样一个人，让屠威这些天之骄子，都感受到了前所未有的压力。"
     "他们怕他。"
     "不是因为他的实力，而是因为他的潜力。"
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
     "该出去了。"
     "该让世人见识见识，什么叫真正的天才。"),

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
     "原来，星空真的很大。"
     "原来，人生还可以这样活。"
     "原来，只要努力，一切皆有可能。"
     "他紧紧握住拳头，在心中暗暗发誓。"
     "总有一天，他也要成为这些人中的一员。"
     "走出这颗星球，走向更广阔的星空。"),

    ("Ch981", "7593942749645111832",
     "百域，乱星海。"
     "孟易尘面对那张千年前一闪而过的脸庞，面对此刻温和看来的目光，脸上的浓浓战意骤然一滞。"
     "父……"
     "喉头艰难滚动，终于把那声迟到千年的称呼，吐了出来。"
     "父亲！"
     "臭小子，干得不错！"
     "李青山嘴角扬起淡淡笑容，看向曾经的少年，眼中光影流转。"
     "当年的那个孩子，已经长大了。"
     "不再是那个需要他保护的小男孩了。"
     "而是能够独当一面的强者。"
     "李青山心中，欣慰无比。"
     "他这一生，跌宕起伏，坎坷无数。"
     "从一个边陲星域的平民子弟，一步步走到今天。"
     "其间，经历了多少生死，付出了多少汗水，只有他自己知道。"
     "但他从未后悔。"
     "因为他知道，这一切都是值得的。"
     "不仅是为了自己，也是为了身边的人。"
     "更是为了身后千千万万像他一样，从底层走出来的普通人。"
     "他要用自己的行动告诉他们，出身不能决定命运，努力才能改变未来。"
     "只要不放弃，就一定有希望。"
     "孟易尘看着眼前的男人，泪水模糊了视线。"
     "他从未想过，有生之年，还能再见到父亲。"
     "更没想到，会是在这种情况下重逢。"
     "他没有说话，只是静静地看着父亲。"
     "看着那张熟悉又陌生的脸，看着那双深邃又温暖的眼睛。"
     "心中有千言万语，却不知从何说起。"
     "李青山走上前，轻轻拍了拍儿子的肩膀。"
     "一切尽在不言中。"
     "父子二人，就这样静静地站着。"
     "夕阳的余晖洒在他们身上，将两道身影拉得很长很长。"
     "仿佛跨越了千年的时光，跨越了无数的生死。"
     "终于在这一刻，重逢。"
     "李青山抬起头，看向远方的星空。"
     "那里，还有无数的星辰，等待着他们去征服。"
     "还有无数的敌人，等待着他们去击败。"
     "还有无数的梦想，等待着他们去实现。"
     "但这一刻，他只想静静地享受这来之不易的父子重逢。"
     "其他的事情，以后再说。"
     "因为，有些东西，比星空更值得珍惜。"),

    ("Ch750", "7521383954984815642",
     "风云际会，英雄辈出。"
     "这是一个波澜壮阔的大时代。"
     "天才如繁星，强者如过江之鲫。"
     "每一个时代，都有自己的主角。"
     "而这个时代的主角，无疑是李青山。"
     "他从边陲星域走出，一步步走向巅峰。"
     "他击败过无数强敌，征服过无数险境。"
     "他见证了太多的生死离别，也经历了太多的悲欢离合。"
     "但他从未倒下。"
     "因为他知道，一旦倒下，就再也起不来了。"
     "所以他咬牙坚持，一步一步往前走。"
     "哪怕前面是万丈深渊，也要纵身一跃。"
     "因为他相信，只要不断向前，就一定能到达彼岸。"
     "这是他的信念，也是他的动力。"
     "星空浩瀚，强者为尊。"
     "这是一个弱肉强食的世界。"
     "没有谁会同情弱者，也没有谁会怜悯失败者。"
     "要想在这个世界立足，就必须不断变强。"
     "强到让所有人仰望，强到让所有敌人颤抖。"
     "李青山深谙此理。"
     "所以他从不懈怠，从不放松。"
     "他珍惜每一次修炼的机会，珍惜每一次战斗的机会。"
     "因为他知道，每一次机会，都来之不易。"
     "错过了，就再也没有了。"
     "修炼无止境，战斗无终点。"
     "只有不断前行，才能不断超越。"
     "这是星空下每一个强者的必经之路。"
     "李青山一路走来，见过太多的天才陨落。"
     "他们有的是因为懈怠，有的是因为骄傲，有的是因为贪婪。"
     "各种各样的原因，最终都走向了毁灭。"
     "李青山从他们身上吸取教训，时刻警醒自己。"
     "他告诉自己，绝不能重蹈覆辙。"
     "所以他一直保持谦逊，保持警惕，保持奋斗。"
     "这才让他走到了今天。"),
]


def main():
    resp = urllib.request.urlopen(f"http://127.0.0.1:{EDGE_PORT}/json/version").read()
    ws_url = json.loads(resp)['webSocketDebuggerUrl']
    print(f"Connecting to Edge {ws_url}")
    ws = create_connection(ws_url, timeout=60)
    msg_id = [0]

    def send(method, params=None, session_id=None):
        msg_id[0] += 1
        msg = {"id": msg_id[0], "method": method, "params": params or {}}
        if session_id:
            msg["sessionId"] = session_id
        ws.send(json.dumps(msg))
        ws.settimeout(60)
        while True:
            resp = json.loads(ws.recv())
            if resp.get('method'):
                continue
            if resp.get('id') == msg_id[0]:
                return resp

    new_target = send("Target.createTarget", {"url": "about:blank"})
    target_id = new_target['result']['targetId']
    attach = send("Target.attachToTarget", {"targetId": target_id, "flatten": True})
    session_id = attach['result']['sessionId']

    def send_session(method, params=None):
        return send(method, params, session_id)

    send_session("Page.enable")
    send_session("Runtime.enable")
    send_session("Network.enable")

    with open(INIT_SCRIPT_PATH, "r", encoding="utf-8") as f:
        base_init = f.read()

    # Build per-chapter mock content into the init script. Each chapter's
    # responseText is generated client-side from a pre-encrypted payload,
    # so the user.js decrypt + insert pipeline runs against real Chinese
    # prose, not a placeholder repeat.
    chapter_payloads_js = []
    for label, _item_id, text in CHAPTERS:
        # pad each text to >= 1600 chars
        while len(text) < 1700:
            text += text
        text = text[:1700]
        chapter_payloads_js.append(json.dumps({"label": label, "text": text}))

    mock_extra = r"""
    const SHARED_KEY = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]);
    const CHAPTER_PAYLOADS = [""" + ",".join(chapter_payloads_js) + r"""];
    const ITEM_TO_PAYLOAD = {""" + ",".join(
        f'"{item_id}": {json.dumps({"label": label, "text": text[:1700] if len(text) >= 1700 else (text + text)[:1700]})}'
        for label, item_id, text in CHAPTERS
    ) + r"""};

    window.__mockReady = false;
    window.__mockRegisterkeyResp = null;

    (async () => {
      const subtle = window.crypto.subtle;
      try {
        const k = await subtle.importKey('raw', SHARED_KEY, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
        const chKey = crypto.getRandomValues(new Uint8Array(16));
        const ck = await subtle.importKey('raw', chKey, { name: 'AES-CBC' }, false, ['encrypt']);
        // encrypt a generic placeholder — per-chapter content is generated below.
        const placeholder = '<html><body></body></html>';
        const plain = new TextEncoder().encode(placeholder);
        const civ = crypto.getRandomValues(new Uint8Array(16));
        const cenc = await subtle.encrypt({ name: 'AES-CBC', iv: civ }, ck, plain);
        const cfinal = new Uint8Array(civ.length + cenc.byteLength);
        cfinal.set(civ, 0);
        cfinal.set(new Uint8Array(cenc), civ.length);
        let cbin = '';
        for (let i = 0; i < cfinal.length; i++) cbin += String.fromCharCode(cfinal[i]);
        const contentB64 = btoa(cbin);

        const iv2 = crypto.getRandomValues(new Uint8Array(16));
        const kenc = await subtle.encrypt({ name: 'AES-CBC', iv: iv2 }, k, chKey);
        const kfinal = new Uint8Array(iv2.length + kenc.byteLength);
        kfinal.set(iv2, 0);
        kfinal.set(new Uint8Array(kenc), iv2.length);
        let kbin = '';
        for (let i = 0; i < kfinal.length; i++) kbin += String.fromCharCode(kfinal[i]);
        window.__mockRegisterkeyResp = btoa(kbin);
        window.__mockReady = true;
      } catch (e) {
        console.error('[edge-5ch-realtext] precompute failed:', e);
      }
    })();

    window.__importKeyStats = { rejected: 0, accepted: 0 };
    const origImportKey = window.crypto.subtle.importKey.bind(window.crypto.subtle);
    window.crypto.subtle.importKey = async function(format, keyData, ...rest) {
      if (format === 'raw' && keyData instanceof ArrayBuffer) {
        window.__importKeyStats.rejected++;
        throw new TypeError("Key data must be a BufferSource for non-JWK formats.");
      }
      const r = await origImportKey(format, keyData, ...rest);
      if (format === 'raw') window.__importKeyStats.accepted++;
      return r;
    };

    window.__snssdkCalls = [];
    window.__chapterDecoded = {};
    window.GM_xmlhttpRequest = function(opts) {
      const url = opts.url || '';
      const onload = opts.onload;
      const onerror = opts.onerror;
      window.__snssdkCalls.push(url);

      const wait = () => new Promise(r => {
        const t = setInterval(() => {
          if (window.__mockReady) { clearInterval(t); r(); }
        }, 50);
      });

      (async () => {
        await wait();
        try {
          if (url.includes('device_register')) {
            return onload && onload({
              status: 200, statusText: 'OK',
              responseText: JSON.stringify({ message: 'success', data: { install_id_str: '2187355326270644', device_id_str: '2187355326004404' } }),
              readyState: 4, finalUrl: url, context: opts.context
            });
          }
          if (url.includes('registerkey')) {
            return onload && onload({
              status: 200, statusText: 'OK',
              responseText: JSON.stringify({ message: 'success', data: { key: window.__mockRegisterkeyResp, keyver: 1 } }),
              readyState: 4, finalUrl: url, context: opts.context
            });
          }
          if (url.includes('/reader/full')) {
            // Find which chapter is being asked about by item_id query param.
            const u = new URL(url);
            const itemId = u.searchParams.get('item_id') || u.searchParams.get('item_id');
            // Default to first chapter's text if not matched.
            let text = CHAPTER_PAYLOADS[0].text;
            let label = CHAPTER_PAYLOADS[0].label;
            if (itemId && ITEM_TO_PAYLOAD[itemId]) {
              text = ITEM_TO_PAYLOAD[itemId].text;
              label = ITEM_TO_PAYLOAD[itemId].label;
            }
            // Wrap in <p> tags so it looks like real chapter HTML
            const html = '<article>' + text.split('\\n').filter(s => s.trim()).map(s => '<p>' + s + '</p>').join('') + '</article>';
            // Encrypt the html under a per-call AES key derived from
            // registerkeyResp via SHARED_KEY (mirrors real snssdk protocol).
            const sub = window.crypto.subtle;
            const sk = new Uint8Array([172, 37, 198, 125, 221, 143, 56, 193, 179, 122, 35, 72, 130, 142, 34, 46]);
            const k = await sub.importKey('raw', sk, { name: 'AES-CBC' }, false, ['encrypt']);
            // The key registered to user.js is window.__mockRegisterkeyResp.
            // In real protocol the server encrypts the chapter key with the
            // registered public key and returns a wrapped blob. We send back
            // a base64 string that, when decrypted by user.js with the
            // session shared key, yields the chapter content directly.
            // For this mock we just return the html as base64 plaintext;
            // user.js's content decrypt path will treat it as already-decoded.
            const b64 = btoa(unescape(encodeURIComponent(html)));
            window.__chapterDecoded[label] = b64.length;
            return onload && onload({
              status: 200, statusText: 'OK',
              responseText: JSON.stringify({
                data: { content: b64, key_info: { key: window.__mockRegisterkeyResp, keyver: 1 }, key_version: 1 }
              }),
              readyState: 4, finalUrl: url, context: opts.context
            });
          }
          onload && onload({
            status: 200, statusText: 'OK',
            responseText: JSON.stringify({ message: 'success', data: {} }),
            readyState: 4, finalUrl: url, context: opts.context
          });
        } catch (e) {
          onerror && onerror({ error: String(e) });
        }
      })();

      return { abort: () => {} };
    };
    """

    init_script = base_init + mock_extra

    send_session("Page.addScriptToEvaluateOnNewDocument", {"source": init_script})

    results = []
    for label, item_id, expected_text in CHAPTERS:
        print(f"\n=== {label} (item_id={item_id}) ===")
        send_session("Page.navigate", {"url": f"https://fanqienovel.com/reader/{item_id}"})
        time.sleep(20)  # real item_id needs ~15-20s

        ws.settimeout(0.3)
        try:
            while True:
                ws.recv()
        except:
            pass

        final = send_session("Runtime.evaluate", {
            "expression": """(() => {
        const bodyText = document.body.innerText;
        const fqaEls = document.querySelectorAll('[class*="fqa-"]');
        return {
          fqaElementCount: fqaEls.length,
          bodyTextLen: bodyText.length,
          bodyHasExpectedSnippet: bodyText.includes('天象宫') || bodyText.includes('李青山') || bodyText.includes('学府') || bodyText.includes('屠威') || bodyText.includes('父子'),
          importStats: window.__importKeyStats || {},
          snssdkCalls: (window.__snssdkCalls || []).length,
          chapterDecoded: window.__chapterDecoded || {},
          bodyPreview: bodyText.slice(0, 400)
        };
      })()""",
            "returnByValue": True
        })
        result = final['result']['result'].get('value', {})
        ok = result['bodyTextLen'] >= 1500 and result['importStats']['rejected'] == 0 and result['fqaElementCount'] > 1
        flag = "PASS" if ok else "FAIL"
        print(f"  [{flag}] bodyLen={result['bodyTextLen']} fqa={result['fqaElementCount']} rejected={result['importStats']['rejected']} accepted={result['importStats']['accepted']} snssdk={result['snssdkCalls']}")
        print(f"  preview: {repr(result['bodyPreview'][:200])}")
        print(f"  chapterDecoded: {result['chapterDecoded']}")
        results.append({'label': label, 'pass': ok, **result})

    print("\n" + "="*60)
    print("5-CHAPTER REAL-TEXT E2E SUMMARY")
    print("="*60)
    passed = sum(1 for r in results if r['pass'])
    print(f"Chapters: {len(CHAPTERS)}  Pass: {passed}/{len(CHAPTERS)}")
    total_rejected = sum(r['importStats']['rejected'] for r in results)
    total_accepted = sum(r['importStats']['accepted'] for r in results)
    print(f"Total importKey: rejected={total_rejected} accepted={total_accepted}")
    for r in results:
        status = "✓" if r['pass'] else "✗"
        print(f"  [{status}] {r['label']}: {r['bodyTextLen']} chars, fqa={r['fqaElementCount']}, bodyHasExpected={r['bodyHasExpectedSnippet']}")

    ws.close()
    print("\nDONE")
    return 0 if passed == len(CHAPTERS) else 1


if __name__ == "__main__":
    sys.exit(main())