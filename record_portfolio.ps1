<#
Usage: powershell -ExecutionPolicy Bypass -File .\record_portfolio.ps1 -Duration 20 -Output portfolio_video_demo.mp4
Requirements: ffmpeg installed and available in PATH (https://ffmpeg.org/download.html)

This script will open index.html in your default browser, pause to let you focus the window, then record the desktop for the specified duration.
#>
param(
    [int]$Duration = 15,
    [string]$Output = "portfolio_video_demo.mp4",
    [int]$Framerate = 30,
    [int]$Width = 1280
)

Write-Host "Opening index.html in default browser..."
$path = (Resolve-Path .\index.html).Path
Start-Process -FilePath $path

Write-Host "Switch to the browser window that opened your portfolio. Recording will start in 4 seconds."
Start-Sleep -Seconds 4

$ffmpeg = "ffmpeg"
$scale = "scale=${Width}:-2"
$cmd = "$ffmpeg -f gdigrab -framerate $Framerate -i desktop -t $Duration -vf $scale -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 `"$Output`""

Write-Host "Running: $cmd"
Invoke-Expression $cmd

if(Test-Path $Output){
    Write-Host "Recording complete. Saved to: $Output"
}else{
    Write-Host "Recording failed. Ensure ffmpeg is installed and in PATH." -ForegroundColor Red
}
