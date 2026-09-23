Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, IntPtr extra);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, IntPtr extra);
}
public struct RECT { public int Left, Top, Right, Bottom; }
'@ -Language CSharp

$h = [IntPtr]28510354
[W]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 300

# "重置整个池子" 按钮位置: Edge window 1468x781, 按钮约 (1174, 552) 屏幕绝对坐标
$x = 1174; $y = 552
Write-Host ("Clicking reset pool button at: " + $x + "," + $y)
[W]::SetCursorPos($x, $y) | Out-Null
Start-Sleep -Milliseconds 150
[W]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero) | Out-Null
Start-Sleep -Milliseconds 60
[W]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero) | Out-Null
Write-Host "Reset pool click sent"

# 等 confirm() 弹窗出来 (500ms 足够)
Start-Sleep -Milliseconds 800

# 按 Enter 确认
Write-Host "Sending Enter to confirm..."
[W]::keybd_event(0x0D, 0, 0, [IntPtr]::Zero) | Out-Null  # VK_RETURN down
[W]::keybd_event(0x0D, 0, 2, [IntPtr]::Zero) | Out-Null  # VK_RETURN up (KEYEVENTF_KEYUP=2)
Write-Host "Enter sent"