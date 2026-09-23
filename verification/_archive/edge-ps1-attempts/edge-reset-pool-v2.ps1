Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, IntPtr extra);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, IntPtr extra);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
}
public struct RECT { public int Left, Top, Right, Bottom; }
'@ -Language CSharp

$h = [IntPtr]28510354
$r = New-Object RECT
[W]::GetWindowRect($h, [ref]$r) | Out-Null
$w = $r.Right - $r.Left
$hh = $r.Bottom - $r.Top
Write-Host ("Edge window: " + $r.Left + "," + $r.Top + " size=" + $w + "x" + $hh + " focus=" + [W]::GetForegroundWindow())

# "重置整个池子" 按钮: 在 Edge 视口右下角 popover 内
# 截图位置 2055, 966 → Edge 内部 ≈ (1175, 552)
# 但坐标基于 (2569, 1366) 截图 = 桌面分辨率
# Edge window 占 (0,0)-(1468,781)
$x = 1174; $y = 552
Write-Host ("Clicking reset at screen coord: " + $x + "," + $y)
[W]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 400
[W]::SetCursorPos($x, $y) | Out-Null
Start-Sleep -Milliseconds 200
[W]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero) | Out-Null  # LEFTDOWN
Start-Sleep -Milliseconds 80
[W]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero) | Out-Null  # LEFTUP
Write-Host "Click sent. Waiting for confirm dialog..."
Start-Sleep -Milliseconds 1500

# 截屏看 confirm 是否出现
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap $w, $hh
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($r.Left, $r.Top, 0, 0, (New-Object System.Drawing.Size($w, $hh)))
$bmp.Save("D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\edge-confirm-state.png")
Write-Host "Saved edge-confirm-state.png"

# 按 Enter 确认
Write-Host "Sending Enter..."
[W]::keybd_event(0x0D, 0, 0, [IntPtr]::Zero) | Out-Null
Start-Sleep -Milliseconds 60
[W]::keybd_event(0x0D, 0, 2, [IntPtr]::Zero) | Out-Null
Write-Host "Enter sent"

Start-Sleep -Milliseconds 2000