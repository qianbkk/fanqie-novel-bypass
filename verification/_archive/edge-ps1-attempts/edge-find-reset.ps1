Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, IntPtr extra);
}
'@ -Language CSharp

$h = [IntPtr]28510354
[W]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 300

# ⚙ 按钮在 Edge 视口右下角 (1408, 721) (Edge 1468x781)
# 但 Edge 缩到 736 + 不一定是全屏. 用 GetWindowRect 拿真实位置
Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public class WR{[DllImport("user32.dll")]public static extern bool GetWindowRect(IntPtr h,out RECT r);}public struct RECT{int L,T,R,B;}' -Language CSharp
$r = New-Object RECT
[WR]::GetWindowRect($h, [ref]$r) | Out-Null
Write-Host ("Edge: " + $r.L + "," + $r.T + " size=" + ($r.R-$r.L) + "x" + ($r.B-$r.T))

# ⚙ 按钮在 window 底部 - 40px, 右边 - 40px
$wx = $r.R - 40
$wy = $r.B - 40
Write-Host ("Gear at: " + $wx + "," + $wy)
[W]::SetCursorPos($wx, $wy) | Out-Null
Start-Sleep -Milliseconds 200
[W]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero) | Out-Null
Start-Sleep -Milliseconds 80
[W]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero) | Out-Null
Write-Host "Gear clicked"

Start-Sleep -Milliseconds 1500

# 再截屏看 popover 位置
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap ($r.R-$r.L), ($r.B-$r.T)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($r.L, $r.T, 0, 0, (New-Object System.Drawing.Size(($r.R-$r.L), ($r.B-$r.T))))
$bmp.Save("D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\edge-popover-open.png")
Write-Host "Saved"