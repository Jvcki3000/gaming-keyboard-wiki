@echo off
cd /d "%~dp0frontend"
"C:\Users\foshanwuyanzu\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules\vite\bin\vite.js --port 5173 --strictPort --host
