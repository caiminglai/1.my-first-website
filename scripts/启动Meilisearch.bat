@echo off
chcp 65001 >nul
echo ========================================
echo   Meilisearch 搜索引擎
echo   地址: http://localhost:7700
echo   密钥: twym-meili-key-2026
echo   数据: backend\meili_data\
echo ========================================
echo.
cd /d "%~dp0\.."
backend\bin\meilisearch.exe --db-path backend\meili_data --master-key "twym-meili-key-2026" --env production --no-analytics
pause
