@echo off
chcp 65001 >nul
title 端口清理工具

echo ====================================
echo  清理占用端口的进程
echo ====================================
echo.

set PORTS=3000 3001 4000 8080

for %%P in (%PORTS%) do (
    echo 检查端口 %%P ...
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":%%P " ^| findstr "LISTENING"') do (
        echo   发现进程 PID=%%A，正在终止...
        taskkill /PID %%A /F >nul 2>&1
        if errorlevel 1 (
            echo   [失败] PID %%A 无法终止
        ) else (
            echo   [成功] PID %%A 已终止
        )
    )
)

echo.
echo ====================================
echo  清理完成
echo ====================================
pause
