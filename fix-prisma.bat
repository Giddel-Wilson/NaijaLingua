echo off
echo Fixing Prisma client issue...

echo Step 1: Stopping all Node processes...
taskkill /f /im node.exe >nul 2>&1

echo Step 2: Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Step 3: Removing old Prisma client...
if exist "node_modules\.prisma" rmdir /s /q "node_modules\.prisma"

echo Step 4: Generating new Prisma client...
npx prisma generate

echo Step 5: Starting development server...
npm run dev

echo Done!
pause
