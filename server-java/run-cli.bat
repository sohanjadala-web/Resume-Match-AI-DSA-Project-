@echo off
title ResumeMatch AI - Interactive DSA Console CLI (Java 25)
echo ====================================================================
echo   Compiling ResumeMatch AI DSA Engine...
echo ====================================================================

if not exist bin mkdir bin

javac -d bin -encoding UTF-8 src/main/java/com/resumematch/algorithms/*.java src/main/java/com/resumematch/data/*.java src/main/java/com/resumematch/cli/*.java src/main/java/com/resumematch/server/*.java src/main/java/com/resumematch/Main.java

if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed. Please ensure Java 21+ or Java 25 is installed.
    pause
    exit /b %errorlevel%
)

echo [SUCCESS] Compilation completed. Launching DSA Interactive Workbench...
echo.
java -cp bin com.resumematch.cli.DSACliApplication
pause
