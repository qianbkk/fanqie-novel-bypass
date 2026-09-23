Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, IntPtr extra);
}
public struct RECT { public int Left, Top, Right, Bottom; }
'@ -Language CSharp
$h = [IntPtr]28510354
[W]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 300
$r = New-Object RECT
[W]::GetWindowRect($h, [ref]$r) | Out-Null
$cx = $r.Right - 60
$cy = $r.Bottom - 60
Write-Host ("Window rect: " + $r.Left + "," + $r.Top + " - " + $r.Right + "," + $r.Bottom)
Write-Host ("Clicking at: " + $cx + "," + $cy)
[W]::SetCursorPos($cx, $cy) | Out-Null
Start-Sleep -Milliseconds 200
[W]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero) | Out-Null  # LEFTDOWN
Start-Sleep -Milliseconds 50
[W]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero) | Out-Null  # LEFTUP
Write-Host "Click sent"