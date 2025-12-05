/**
 * Database setup script for Vercel
 * This runs prisma db push using the non-pooling connection
 */
const { execSync } = require('child_process');

// Use non-pooling connection for migrations
const nonPoolingUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!nonPoolingUrl) {
    console.error('❌ DATABASE_URL or POSTGRES_URL_NON_POOLING not set');
    process.exit(1);
}

try {
    console.log('🔄 Pushing Prisma schema to database...');
    // Temporarily set DATABASE_URL to non-pooling for db push
    process.env.DATABASE_URL = nonPoolingUrl;
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: nonPoolingUrl }
    });
    console.log('✅ Database schema pushed successfully');
} catch (error) {
    console.error('❌ Error pushing schema:', error.message);
    process.exit(1);
}

