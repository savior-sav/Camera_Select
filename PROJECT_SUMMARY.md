# Project Summary

Industrial camera selection calculator - single page web app (HTML/CSS/JS, no deps).

## Files

| File | Lines | Role |
|------|-------|------|
| index.html | 209 | HTML structure (9 sections, sidebar dock, rec card, theme btn, print btn, back-to-top) |
| css/style.css | 208 | All styles, dark/light themes via CSS vars, print styles, responsive (640px breakpoint) |
| js/app.js | 204 | All logic: 8 calc funcs + rec summary + theme toggle + dock nav + input binding |

## HTML Structure

```
body
├── nav.dock          # Left sidebar (fixed, 64px, 10 items with icons)
├── div.main
│   ├── header.site-header  # Title + theme-toggle button (#theme-toggle)
│   ├── section#resolution  # 8 calc cards (resolution, focal, exposure, bw, fps, pixelpitch, linescan, dof)
│   ├── section#interfaces  # Interface reference table (USB2/3, GigE, 5GigE, CamLink)
│   ├── section#overview    # Recommendation card (.rec-card)
│   │   ├── #rec-params     # Input params summary (populated by JS)
│   │   └── #rec-grid       # Recommended results (6 items)
│   ├── .action-bar > #btn-refresh
│   └── .footer > print link
└── #back-top          # Back to top button
```

## JS Key Functions

### Data Constants (lines 1-5)
- `SENSORS` - 9 sensor sizes {w, h, label}
- `CAMERA_RECS` - 6 camera tiers {name, w, h, total}
- `INTF_LIMITS`, `INTF_NAMES`, `INTF_IDS` - 5 interfaces

### Calculation Functions (called in order by calcAll)
| Function | Input IDs Read | Output IDs Written | Formula |
|----------|---------------|-------------------|---------|
| calcResolution | res-fov, res-prec, res-k | res-val, res-sub, res-extra, res-k-hint | px = FOV/prec * K |
| calcFocal | foc-wd, foc-fov, foc-sensor | foc-val, foc-sub, foc-extra, exp-beta | f = WD * Hs / FOV |
| calcExposure | exp-v, exp-pixel, exp-beta | exp-val, exp-sub | Tmax = 0.5*p/(v*β) |
| calcBandwidth | bw-w, bw-h, bw-fps, bw-depth | bw-val, bw-sub, bw-extra, intf-* | BW = W*H*D*F/8 |
| calcFps | fps-v, fps-fov, fps-l, fps-margin | fps-val, fps-sub | FPS = v/(FOV-L-margin) |
| calcPixelPitch | pp-fov, pp-res, pp-target | pp-val, pp-sub, pp-extra | pp = FOV/res |
| calcLine | line-v, line-dy, line-fov | line-val, line-sub | lr = v/Δy |
| calcDof | dof-f, dof-beta | dof-val, dof-sub | DOF = 2*F*δ*β |

### Other Functions
- `updateRec()` - Reads all calc results, populates #rec-grid (6 items: camtype, res, focal, intf, light, fps)
- `updateRecInputs()` - Reads all 18 input fields, populates #rec-params (6 groups x 3 params)
- `initDock()` - IntersectionObserver for scroll highlight + click handler for immediate active state
- `initTheme()`, `toggleTheme()`, `updateThemeIcon()` - Theme toggle with localStorage persistence
- `calcAll()` - Runs all 8 calcs + updateRec + updateRecInputs

### Init (DOMContentLoaded)
1. initTheme(), initDock()
2. Bind theme-toggle click
3. Bind 'input' event on 24 input elements → calcAll
4. Bind btn-refresh click → calcAll + scroll to #overview
5. Back-to-top scroll listener
6. calcAll()

## CSS Theme System

CSS vars in `:root` (dark) and `.light-mode` override. ~40 vars total:

| Category | Vars |
|----------|------|
| bg | --bg-body, --bg-card, --bg-dock, --bg-input, --bg-result, --bg-formula, --bg-tag, --bg-rec-card, --bg-rec-item, --bg-rec-badge, --bg-dot |
| text | --text-primary, --text-secondary, --text-muted, --text-accent, --text-green, --text-orange, --text-red, --text-blue |
| border | --border-card, --border-dock, --border-input, --border-table, --border-table-row, --border-rec-card, --border-rec-item |
| shadow | --shadow-card, --shadow-focus, --shadow-target |
| accent | --accent, --accent-hover, --accent-tag, --accent-warn |

Theme toggle: `document.body.classList.toggle('light-mode')`, saved to localStorage key `camera-calc-theme`.

## Print System

- Triggered by "打印" link (href="javascript:void(0)", onclick="window.print()")
- `@media print` hides: .dock, .back-top, .site-header, .action-bar, .footer, and all sections except #overview
- Print style: white background, dark text, #2563eb blue accent, light gray cells (#f5f7fa/#fafbfc)

## Repeating Patterns

- Each calc card: `.card > .card-header(.icon + h2 + .tag) + .formula + .field-group* + .result(.rlabel + .rval(.blue/.green/.orange/.red) + .runit + .rsub) + .extra`
- Input binding: all inputs have `id`, JS reads via `document.getElementById(id).value`, binding via `inputIds` array + forEach
- CSS class for rval color: `blue`=normal, `green`=good, `orange`=warning, `red`=bad

## Key IDs Reference

### Inputs (24 total)
res-fov, res-prec, res-k, foc-wd, foc-fov, foc-sensor, exp-v, exp-pixel, exp-beta, bw-w, bw-h, bw-fps, bw-depth, fps-v, fps-fov, fps-l, fps-margin, pp-fov, pp-res, pp-target, line-v, line-dy, line-fov, dof-f, dof-beta

### Display Outputs
res-val, res-sub, res-extra, foc-val, foc-sub, foc-extra, exp-val, exp-sub, bw-val, bw-sub, bw-extra, fps-val, fps-sub, pp-val, pp-sub, pp-extra, line-val, line-sub, dof-val, dof-sub

### Interface (5)
intf-usb2, intf-usb3, intf-gige, intf-5gige, intf-clink

### Recommendation (12)
rec-camtype, rec-camnote, rec-cambadge, rec-res, rec-resnote, rec-focal, rec-focalnote, rec-intf, rec-intfnote, rec-light, rec-lightnote, rec-fps, rec-fpsnote, rec-subtitle

### Others
theme-toggle, btn-refresh, back-top, rec-params, rec-grid
