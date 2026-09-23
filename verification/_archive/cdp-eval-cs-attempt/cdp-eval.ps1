Add-Type -TypeDefinition @'
using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public static class Cdp {
    public static async Task<string> Run(string url, string expr, int waitMs) {
        var ws = new ClientWebSocket();
        var ct = new CancellationToken();
        var pageId = "16F1BBC1EADB302F47F2C58CB7F16B98";
        await ws.ConnectAsync(new Uri($"ws://127.0.0.1:9333/devtools/page/{pageId}"), ct);
        var buf = new byte[65536];

        // Navigate
        await Send(ws, 1, "Page.navigate", $"{{\"url\":\"{url}\"}}", ct);
        await Task.Delay(waitMs);
        // Read any response (will be loading event)
        var s = new ArraySegment<byte>(buf);
        await ws.ReceiveAsync(s, ct);

        // Eval expr1 (initial check)
        var evalParams = $"{{\"expression\":\"{expr.Replace("\\","\\\\").Replace("\"","\\\"")}\",\"returnByValue\":true}}";
        await Send(ws, 2, "Runtime.evaluate", evalParams, ct);
        await Task.Delay(300);
        s = new ArraySegment<byte>(buf);
        var t1 = await ws.ReceiveAsync(s, ct);
        var r1 = Encoding.UTF8.GetString(buf, 0, t1.Count);

        ws.Dispose();
        return r1;
    }

    static async Task Send(ClientWebSocket ws, int id, string method, string paramsJson, CancellationToken ct) {
        var msg = $"{{\"id\":{id},\"method\":\"{method}\",\"params\":{paramsJson}}}";
        var bytes = Encoding.UTF8.GetBytes(msg);
        await ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, ct);
    }
}
'@ -ReferencedAssemblies "System.Net.WebSockets.Client","System.Net.WebSockets"

# Just call Run for initial check
$expr = '(()=>{const r=document.querySelector("div.muye-reader-content:not(.fqa)");const t=r?r.innerText:"";const f=document.querySelector(".fqa-reader-content");return JSON.stringify({readerLen:t.length,fqaLen:f?f.innerText.length:0,hasGear:!!document.getElementById("fqa-control-panel"),hasFqa:!!window.__fqa})})()'

$initial = [Cdp]::Run("https://fanqienovel.com/reader/7445246192578986520", $expr, 18000)
Write-Host "INITIAL: $initial"
$initial | Out-File "D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\cdp-result.txt" -Encoding UTF8