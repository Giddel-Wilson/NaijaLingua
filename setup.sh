#!/bin/bash

# NaijaLingua Setup Script
echo "🇳🇬 Setting up NaijaLingua - Nigerian Language Learning Platform"
echo "=================================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your database URL and secrets."
else
    echo "✅ .env file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Check if DATABASE_URL is set
if grep -q "postgresql://username:password@localhost:5432/naijalingua" .env; then
    echo "⚠️  WARNING: Please update DATABASE_URL in .env with your actual database connection string"
    echo "   You can use Neon (https://neon.tech) for a free PostgreSQL database"
fi

echo ""
echo "🚀 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database URL and secrets"
echo "2. Run 'npm run db:push' to create the database schema"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "Visit http://localhost:5173 to see your application!"
echo ""
echo "📚 Documentation:"
echo "- README.md - Getting started guide"
echo "- METHODOLOGY.md - Development philosophy and architecture"
echo ""
echo "Happy coding! 🎉"
