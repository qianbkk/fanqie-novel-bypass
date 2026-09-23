Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, IntPtr extra);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, IntPtr extra);
}
public struct RECT { public int Left, Top, Right, Bottom; }
'@ -Language CSharp

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Capture([IntPtr]$h, [string]$path) {
  $r = New-Object RECT
  [W]::GetWindowRect($h, [ref]$r) | Out-Null
  $bmp = New-Object System.Drawing.Bitmap ($r.Right-$r.Left), ($r.Bottom-$r.Top)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($r.Left, $r.Top, 0, 0, (New-Object System.Drawing.Size(($r.Right-$r.Left), ($r.Bottom-$r.Top))))
  $bmp.Save($path)
  $bmp.Dispose()
}

function PressKey([byte]$vk) {
  [W]::keybd_event($vk, 0, 0, [IntPtr]::Zero) | Out-Null
  Start-Sleep -Milliseconds 50
  [W]::keybd_event($vk, 0, 2, [IntPtr]::Zero) | Out-Null
  Start-Sleep -Milliseconds 200
}

$h = [IntPtr]28510354

# Step 1: Click ⚙️ button at exact center (1414, 733)
[W]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 600
[W]::SetCursorPos(1414, 733) | Out-Null
Start-Sleep -Milliseconds 200
[W]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero) | Out-Null
Start-Sleep -Milliseconds 80
[W]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero) | Out-Null
Start-Sleep -Milliseconds 1500

Capture $h "D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\edge-step1-after-gear.png"
Write-Host "Step 1 done"

# Step 2: Try Tab key navigation - Tab may not reach hidden ⚙ button or popover buttons
# Alternative: click using SetForegroundWindow + SendInput
# The issue may be that Edge chromium doesn't honor mouse_event from PowerShell
# Try mouse_event with ABSOLUTE_SEND (0x8000)
[W]::SetCursorPos(1414, 733) | Out-Null
Start-Sleep -Milliseconds 200
[W]::mouse_event(0x8002, 0, 0, 0, [IntPtr]::Zero) | Out-Null  # LEFTDOWN + ABSOLUTE
Start-Sleep -Milliseconds 80
[W]::mouse_event(0x8004, 0, 0, 0, [IntPtr]::Zero) | Out-Null  # LEFTUP + ABSOLUTE
Start-Sleep -Milliseconds 1500

Capture $h "D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\edge-step2-after-gear2.png"
Write-Host "Step 2 done"

# Step 3: try a sendinput approach via PowerShell's SendKeys
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class SI {
  [StructLayout(LayoutKind.Sequential)]
  public struct INPUT { public int type; public INPUTUNION u; }
  [StructLayout(LayoutKind.Explicit)]
  public struct INPUTUNION {
    [FieldOffset(0)] public MOUSEINPUT mi;
    [FieldOffset(0)] public KEYBDINPUT ki;
  }
  [StructLayout(LayoutKind.Sequential)]
  public struct MOUSEINPUT { public int dx, dy; public int mouseData; public int dwFlags; public int time; public IntPtr extra; }
  [StructLayout(LayoutKind.Sequential)]
  public struct KEYBDINPUT { public ushort wVk; public ushort wScan; public int dwFlags; public int time; public IntPtr extra; }
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, INPUT[] p, int size);
}
'@ -Language CSharp

# Send mouse click via SendInput
$mi = New-Object SI+MOUSEINPUT
$mi.dx = 1414
$mi.dy = 733
$mi.mouseData = 0
$mi.dwFlags = (0x0001 -bor 0x8000)  # MOVE + ABSOLUTE
$in = New-Object SI+INPUT
$in.type = 0  # INPUT_MOUSE
$in.u = New-Object SI+INPUTUNION
$in.u.mi = $mi
[SI]::SendInput(1, @($in), [System.Runtime.InteropServices.Marshal]::SizeOf($in)) | Out-Null
Start-Sleep -Milliseconds 200
$mi2 = New-Object SI+MOUSEINPUT
$mi2.dx = 1414
$mi2.dy = 733
$mi2.mouseData = 0
$mi2.dwFlags = 0x0002  # LEFTDOWN
$in2 = New-Object SI+INPUT
$in2.type = 0
$in2.u = New-Object SI+INPUTUNION
$in2.u.mi = $mi2
[SI]::SendInput(1, @($in2), [System.Runtime.InteropServices.Marshal]::SizeOf($in2)) | Out-Null
Start-Sleep -Milliseconds 80
$mi3 = New-Object SI+MOUSEINPUT
$mi3.dx = 1414
$mi3.dy = 733
$mi3.mouseData = 0
$mi3.dwFlags = 0x0004  # LEFTUP
$in3 = New-Object SI+INPUT
$in3.type = 0
$in3.u = New-Object SI+INPUTUNION
$in3.u.mi = $mi3
[SI]::SendInput(1, @($in3), [System.Runtime.InteropServices.Marshal]::SizeOf($in3)) | Out-Null
Start-Sleep -Milliseconds 1500

Capture $h "D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\edge-step3-after-sendinput.png"
Write-Host "Step 3 done"