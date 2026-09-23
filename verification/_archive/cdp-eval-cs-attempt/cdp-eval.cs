using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public class Cdp {
    public static async Task<string> Run(string url, string expr, int waitMs) {
        var ws = new ClientWebSocket();
        await ws.ConnectAsync(new Uri("ws://127.0.0.1:9333/devtools/page/16F1BBC1EADB302F47F2C58CB7F16B98"), new CancellationToken());
        var buf = new byte[65536];
        await Send(ws, 1, "Page.navigate", "{\"url\":\"" + url + "\"}");
        await Task.Delay(waitMs);
        var s = new ArraySegment<byte>(buf);
        await ws.ReceiveAsync(s, new CancellationToken());
        var evalParams = "{\"expression\":\"" + expr.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\",\"returnByValue\":true}";
        await Send(ws, 2, "Runtime.evaluate", evalParams);
        await Task.Delay(500);
        s = new ArraySegment<byte>(buf);
        var t1 = await ws.ReceiveAsync(s, new CancellationToken());
        var r1 = Encoding.UTF8.GetString(buf, 0, t1.Count);
        ws.Dispose();
        return r1;
    }

    static async Task Send(ClientWebSocket ws, int id, string method, string paramsJson) {
        var msg = "{\"id\":" + id + ",\"method\":\"" + method + "\",\"params\":" + paramsJson + "}";
        var bytes = Encoding.UTF8.GetBytes(msg);
        await ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, new CancellationToken());
    }
}