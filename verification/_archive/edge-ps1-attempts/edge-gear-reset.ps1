Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, IntPtr extra);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, IntPtr extra);
}
'@ -Language CSharp

$h = [IntPtr]28510354
[W]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 400

# Step 1: click ⚙ button (pin-btn) to open popover
$gx = 1408; $gy = 721
Write-Host ("[1] Click gear at: " + $gx + "," + $gy)
[W]::SetCursorPos($gx, $gy) | Out-Null
Start-Sleep -Milliseconds 200
[W]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero) | Out-Null
Start-Sleep -Milliseconds 60
[W]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero) | Out-Null
Start-Sleep -Milliseconds 1500

# Step 2: take screenshot to find reset button
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 1468, 781
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1468, 781)))
$bmp.Save("D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\edge-popover-1.png")
Write-Host "Saved edge-popover-1.png"

# Step 3: try clicking reset pool button. Its actual position in popover...
# Based on previous screenshot: "重置整个池子" appeared in popover at displayed (2055, 966) of 2000x1063 (scaled from 1468x781)
# Real coords = (2055 * 1468 / 2000, 966 * 781 / 1063) = (1509, 710) - OUT of bounds (1468)
# So reset button is partially clipped! Need to scroll popover or click within bounds.
# Approximate reset button y position: 710 (but clipped at 781). Let's click at (1400, 705) which should hit the button.
$rx = 1400; $ry = 705
Write-Host ("[2] Click reset at: " + $rx + "," + $ry)
[W]::SetCursorPos($rx, $ry) | Out-Null
Start-Sleep -Milliseconds 200
[W]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero) | Out-Null
Start-Sleep -Milliseconds 60
[W]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero) | Out-Null
Start-Sleep -Milliseconds 1500

# Step 4: screenshot for confirm dialog
$bmp2 = New-Object System.Drawing.Bitmap 1468, 781
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1468, 781)))
$bmp2.Save("D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\edge-confirm-1.png")
Write-Host "Saved edge-confirm-1.png"

# Step 5: send Enter to confirm
Write-Host "[3] Sending Enter..."
[W]::keybd_event(0x0D, 0, 0, [IntPtr]::Zero) | Out-Null
Start-Sleep -Milliseconds 80
[W]::keybd_event(0x0D, 0, 2, [IntPtr]::Zero) | Out-Null
Write-Host "[3] Enter sent"

Start-Sleep -Milliseconds 3000

# Step 6: screenshot post-reset
$bmp3 = New-Object System.Drawing.Bitmap 1468, 781
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size(1468, 781)))
$bmp3.Save("D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification\edge-post-reset.png")
Write-Host "Saved edge-post-reset.png"