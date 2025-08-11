# **App Name**: Night's Reign Timer

## Core Features:

- Automatic Timer Control: Uses OCR via Tesseract to detect in-game text cues like 'ДЕНЬ I', 'ДЕНЬ II', 'ДЕНЬ III', 'ПОРАЖЕНИЕ', or 'НОЧНОЙ ВЛАДЫКА ПОВЕРЖЕН', using reasoning tool, to automatically start, advance, and stop timers.
- Main Timer Display: Displays a main timer showing the time remaining until the next game event.
- Total Timer Display: Displays a total time elapsed since the start of the first timer.
- Manual Timer Control: Allows manual starting of timers using hotkeys for flexibility and control.
- Save App Settings: Stores the scale, font size, alpha, and window position settings to a config.json file
- UI Configuration: Settings window (scale, font size, alpha) that can be shown or hidden with hotkeys.
- System Tray Icon: Uses tempfile to properly display icon in the system tray.

## Style Guidelines:

- Primary color: Deep indigo (#4B0082), reminiscent of a night sky, conveys a sense of mystery and focus.
- Background color: Dark slate gray (#37474F), nearly desaturated indigo, provides a high-contrast backdrop without being distracting.
- Accent color: Pale lavender (#D1C4E9), an analogous color, offers a gentle highlight for interactive elements without overwhelming the interface.
- Body and headline font: 'Inter', a grotesque-style sans-serif, gives a modern, machined, objective, neutral look, suitable for headlines or body text
- Uses minimalist icons for system tray, settings and other UI elements.
- Employs a clean, tabular layout for timer information, with sufficient padding and clear demarcation to avoid visual clutter.
- Use a subtle pulsating effect on the timer value when the timer is actively counting down, drawing attention to the most critical information.