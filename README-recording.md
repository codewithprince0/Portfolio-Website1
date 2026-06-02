Recording the portfolio to `portfolio_video_demo.mp4` (Windows)

Prerequisites:
- Windows (you're already on Windows).
- `ffmpeg` installed and added to your PATH. Verify by running `ffmpeg -version` in a terminal.

Steps:
1. Open a PowerShell terminal in the project folder (where `index.html` lives).
2. Run the recorder script (example 20 seconds):

```powershell
powershell -ExecutionPolicy Bypass -File .\record_portfolio.ps1 -Duration 20 -Output portfolio_video_demo.mp4
```

Notes and tips:
- The script opens `index.html` in your default browser and records the desktop. When the script warns you, focus the browser window showing your portfolio so the recording captures it.
- Increase `-Duration` if you need a longer demo.
- If you prefer to capture only the browser window, use the `-i title="Window Title"` gdigrab option in the `ffmpeg` command instead of `-i desktop` and replace `"Window Title"` with your browser window title.

Alternative (manual):
- Use any screen-recording app (OBS, Xbox Game Bar) and record the browser while you navigate the page.

If you want, I can generate a cross-platform Node script (Puppeteer + ffmpeg) instead — tell me if you'd like that and I will add it.