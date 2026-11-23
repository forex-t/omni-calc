# OmniCalc - Modern Web Calculator

A sleek, accessible, responsive web calculator built with vanilla HTML5, CSS3, and modern JavaScript. OmniCalc combines clean glassmorphic aesthetics with tactile feedback, comprehensive keyboard controls, history tape, and standard memory functions.

## ✨ Features

- **Standard Arithmetic**: Addition (`+`), Subtraction (`−`), Multiplication (`×`), Division (`÷`), and Percentages (`%`).
- **Precision Floating Point Math**: Automatically handles JavaScript floating point rounding issues (e.g., `0.1 + 0.2 = 0.3`).
- **Safety Handling**: Safe division by zero prevention (`Cannot divide by zero`).
- **Calculation History**: Automatic calculation tape logging results; click on any past calculation to restore it into the calculator.
- **Memory Functions**: `MC` (Clear), `MR` (Recall), `M+` (Add), and `M−` (Subtract) with active memory status badge.
- **Audio Synthesis**: Clean mechanical click feedback generated on the fly via the Web Audio API (no heavy MP3 assets, toggleable sound button).
- **Dark & Light Mode**: Seamless theme switching with system `prefers-color-scheme` support and local storage persistence.
- **One-Click Copy**: Copy results straight to the clipboard with confirmation toast.
- **Responsive & Accessible**: Dynamic display font scaling for long numbers, full ARIA roles, and high contrast styling.
- **Zero Runtime Dependencies**: 100% self-contained client-side application.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `0` – `9` | Enter Digits |
| `.` or `,` | Decimal Point |
| `+`, `-`, `*`, `/` | Add, Subtract, Multiply, Divide |
| `Enter` or `=` | Calculate Result |
| `Backspace` | Delete last entered digit |
| `Esc` or `C` | All Clear (AC) |
| `%` | Percentage |
| `H` | Toggle History Drawer |
| `?` | Show Shortcuts Cheat Sheet |

---

## 🚀 How to Run

### Option 1: Direct in Browser
Simply double-click or open `index.html` in any web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (e.g. Node.js or Python)
Using Python:
```bash
python -m http.server 3000
```
Then navigate to `http://localhost:3000` in your browser.
