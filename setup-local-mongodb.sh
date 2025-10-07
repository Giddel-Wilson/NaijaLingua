#!/bin/bash

# Setup Local MongoDB for NaijaLingua (Temporary Development)

echo ""
echo "🔧 Setting up Local MongoDB as temporary solution..."
echo ""

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "📥 MongoDB not installed. Installing..."
    brew tap mongodb/brew
    brew install mongodb-community@7.0
else
    echo "✅ MongoDB already installed"
fi

# Start MongoDB service
echo ""
echo "🚀 Starting MongoDB service..."
brew services start mongodb-community

# Wait for MongoDB to start
sleep 3

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running!"
else
    echo "⚠️  Starting MongoDB manually..."
    mongod --config /opt/homebrew/etc/mongod.conf --fork
    sleep 2
fi

echo ""
echo "📋 Creating backup of current .env..."
cp .env .env.atlas-backup

echo ""
echo "🔄 Updating .env to use local MongoDB..."

# Update DATABASE_URL in .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's|DATABASE_URL=.*|DATABASE_URL="mongodb://localhost:27017/naijalingua"|g' .env
else
    sed -i 's|DATABASE_URL=.*|DATABASE_URL="mongodb://localhost:27017/naijalingua"|g' .env
fi

echo "✅ .env updated!"

echo ""
echo "🔄 Pushing schema to local MongoDB..."
npx prisma db push --accept-data-loss

echo ""
echo "👤 Creating admin user for local database..."

# Create admin user
node -e "
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  try {
    await db.user.create({
      data: {
        name: 'Local Admin',
        email: 'admin@naijalingua.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        bio: 'Local Development Admin',
        suspended: false,
        banned: false
      }
    });
    console.log('✅ Admin user created: admin@naijalingua.com / admin123');
  } catch (e) {
    console.log('⚠️  Admin user might already exist');
  } finally {
    await db.\$disconnect();
  }
}

createAdmin();
"

echo ""
echo "═════════════════════════════════════════════════════════"
echo "✅ LOCAL MONGODB SETUP COMPLETE!"
echo "═════════════════════════════════════════════════════════"
echo ""
echo "📝 Changes made:"
echo "   - MongoDB installed and running locally"
echo "   - .env updated to use local MongoDB"
echo "   - Original .env backed up to .env.atlas-backup"
echo "   - Database schema pushed"
echo "   - Admin user created"
echo ""
echo "🎯 You can now:"
echo "   - Run: bun dev"
echo "   - Login: admin@naijalingua.com / admin123"
echo ""
echo "⚠️  To switch back to Atlas later:"
echo "   - Stop local MongoDB: brew services stop mongodb-community"
echo "   - Restore .env: mv .env.atlas-backup .env"
echo "   - Fix your Atlas cluster"
echo ""
echo "═════════════════════════════════════════════════════════"
