Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, IntPtr extra);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
}
public struct RECT { public int Left, Top, Right, Bottom; }
'@ -Language CSharp

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Capture-Window([IntPtr]$h, [string]$path) {
  $r = New-Object RECT
  [W]::GetWindowRect($h, [ref]$r) | Out-Null
  $bmp = New-Object System.Drawing.Bitmap ($r.Right-$r.Left), ($r.Bottom-$r.Top)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($r.Left, $r.Top, 0, 0, (New-Object System.Drawing.Size(($r.Right-$r.Left), ($r.Bottom-$r.Top))))
  $bmp.Save($path)
  $bmp.Dispose()
  return @{L=$r.Left; T=$r.Top; W=($r.Right-$r.Left); H=($r.Bottom-$r.Top)}
}

function Click-At([int]$x, [int]$y) {
  [W]::SetCursorPos($x, $y) | Out-Null
  Start-Sleep -Milliseconds 200
  [W]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero) | Out-Null
  Start-Sleep -Milliseconds 80
  [W]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero) | Out-Null
  Start-Sleep -Milliseconds 1500
}

$h = [IntPtr]28510354
[W]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 500

# Try multiple clicks to toggle popover
$attempts = 0
while ($attempts -lt 4) {
  $attempts++
  Write-Host ("=== Attempt $attempts ===")
  $info = Capture-Window $h "D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\edge-toggle-$attempts.png"
  Write-Host ("Saved edge-toggle-$attempts.png size=" + $info.W + "x" + $info.H)

  # ⚙ button center (relative to window client area 1454x773)
  # Click at (1414, 733) - exact CSS center
  Click-At 1414 733
}

# Last state
Capture-Window $h "D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\edge-final.png" | Out-Null
Write-Host "Saved edge-final.png"