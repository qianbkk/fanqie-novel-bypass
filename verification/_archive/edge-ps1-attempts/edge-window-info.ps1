Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT r);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr hWnd, out RECT r);
}
public struct RECT { public int Left, Top, Right, Bottom; }
'@ -Language CSharp
$h = [IntPtr]28510354
$r = New-Object RECT
$c = New-Object RECT
[W]::GetWindowRect($h, [ref]$r) | Out-Null
[W]::GetClientRect($h, [ref]$c) | Out-Null
Write-Host ("Window rect (screen): " + $r.Left + "," + $r.Top + " - " + $r.Right + "," + $r.Bottom + " size=" + ($r.Right-$r.Left) + "x" + ($r.Bottom-$r.Top))
Write-Host ("Client rect: " + $c.Left + "," + $c.Top + " - " + $c.Right + "," + $c.Bottom + " size=" + $c.Right + "x" + $c.Bottom)