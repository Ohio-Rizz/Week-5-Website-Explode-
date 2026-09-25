# CS110 Week 5 Dashboard — Quick Guide

## 1. Open the website
1. Extract the **entire ZIP file** into one folder.
2. Open that folder.
3. Double-click **`index.html`** to open the dashboard in your browser.
4. Keep the **`week4`** folder in the same place as `index.html`. Do not move or rename its files.

> If the 3D view does not load when opened directly, try running the folder through a local web server. The 3D page uses files inside `week4/`.

## 2. Where to find things

| File or folder | What it does |
|---|---|
| **`index.html`** | Main dashboard page and its sections/content. Start here to find the page layout. |
| **`styles.css`** | Main dashboard appearance: colors, layout, spacing, and responsive styling. |
| **`script.js`** | Main dashboard behavior: navigation, saving entries, and dashboard interactions. |
| **`week4/3d.html`** | The separate 3D view page. |
| **`week4/js/app.js`** | 3D scene code: sphere, ground/plane, camera, and 3D controls/animation. Edit this file to change the 3D scene. |
| **`week4/css/styles.css`** | Styling for the 3D view. |
| **`week4/vendor/babylon.js`** | Babylon.js library used to display the 3D scene. Usually, you do not need to edit this. |
| **`week4/TestNotes.txt`** | Notes from the original Week 4 starter project. |
| **`export-assets.js`** | Files used by the dashboard's website-export feature. Usually, you do not need to edit this. |

## 3. Change the sphere or 3D scene
1. Open **`week4/js/app.js`** in a code editor (for example, VS Code).
2. Find the code that creates the sphere, ground, camera, or buttons.
3. Make your changes and save the file.
4. Reload the 3D view in your browser to see the update.

## 4. Change the dashboard
- To edit text or page sections: open **`index.html`**.
- To change the design: open **`styles.css`**.
- To change dashboard interactions or save behavior: open **`script.js`**.

## 5. Important
- Keep the folder structure intact—especially **`week4/`** and its subfolders.
- Do not delete `week4/vendor/babylon.js`; the 3D scene depends on it.
- If something is broken, open the browser developer console (usually **F12 → Console**) and check for errors.
