Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class W {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
}
public struct RECT { public int Left, Top, Right, Bottom; }
'@ -Language CSharp

$h = [IntPtr]28510354
$r = New-Object RECT
$c = New-Object RECT
[W]::GetWindowRect($h, [ref]$r) | Out-Null
[W]::GetClientRect($h, [ref]$c) | Out-Null
Write-Host ("Edge window: " + $r.Left + "," + $r.Top + " - " + $r.Right + "," + $r.Bottom)
Write-Host ("Edge client: " + $c.Left + "," + $c.Top + " - " + $c.Right + "," + $c.Bottom)
Write-Host ("Focus: " + [W]::GetForegroundWindow())