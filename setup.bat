@echo off
echo 🇳🇬 Setting up NaijaLingua - Nigerian Language Learning Platform
echo ==================================================================

REM Check if .env file exists
if not exist .env (
    echo ⚠️  Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created. Please update it with your database URL and secrets.
) else (
    echo ✅ .env file already exists.
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Generate Prisma client
echo 🗄️  Generating Prisma client...
npx prisma generate

echo.
echo 🚀 Setup Complete!
echo.
echo Next steps:
echo 1. Update .env with your database URL and secrets
echo 2. Run 'npm run db:push' to create the database schema
echo 3. Run 'npm run dev' to start the development server
echo.
echo Visit http://localhost:5173 to see your application!
echo.
echo 📚 Documentation:
echo - README.md - Getting started guide
echo - METHODOLOGY.md - Development philosophy and architecture
echo.
echo Happy coding! 🎉
pause
