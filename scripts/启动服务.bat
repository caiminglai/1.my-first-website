@echo off
chcp 65001 >nul
title 同物异名+精准匹配 启动器

:: 自动定位项目目录（根据本脚本所在位置推算）
set "TWYM=%~dp0.."
set "JZXR=%~dp0..\..\2.my-two-website"

echo ====================================
echo  同物异名 + 精准匹配 启动器
echo ====================================
echo.
echo  同物异名: %TWYM%
echo  精准匹配: %JZXR%
echo.

:: 检查目录是否存在
if not exist "%TWYM%\backend" (
    echo [错误] 找不到同物异名项目: %TWYM%\backend
    pause
    exit /b 1
)
if not exist "%JZXR%\backend" (
    echo [警告] 找不到精准匹配项目: %JZXR%\backend
    echo         将只启动同物异名
    echo.
)

echo [1/4] 启动同物异名-后端 :3000
start "twym-后端:3000" cmd /k "cd /d "%TWYM%\backend" && npm start"

timeout /t 3 /nobreak >nul

echo [2/4] 启动同物异名-前端 :3001
start "twym-前端:3001" cmd /k "cd /d "%TWYM%\app" && npm run dev"

timeout /t 3 /nobreak >nul

if exist "%JZXR%\backend" (
    echo [3/4] 启动精准匹配-后端 :8080
    start "jzxr-后端:8080" cmd /k "cd /d "%JZXR%\backend" && npm start"

    timeout /t 3 /nobreak >nul

    echo [4/4] 启动精准匹配-前端 :4000
    start "jzxr-前端:4000" cmd /k "cd /d "%JZXR%\app" && npm run dev"
) else (
    echo [3/4] 跳过精准匹配-后端（项目不存在）
    echo [4/4] 跳过精准匹配-前端（项目不存在）
)

echo.
echo ====================================
echo   全部启动完成
echo ====================================
echo.
echo   同物异名  http://localhost:3001/twym/
if exist "%JZXR%\backend" (
    echo   精准匹配  http://localhost:4000/jzxr/
)
echo.
echo   管理后台（需Token）:
echo   twym  http://localhost:3000/admin
if exist "%JZXR%\backend" (
    echo   jzxr  http://localhost:8080/admin
)
echo ====================================
pause
