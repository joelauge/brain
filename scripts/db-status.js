#!/usr/bin/env node

/**
 * Database Status Check Script
 * 
 * This script verifies that the database is properly set up and accessible.
 * Run with: node scripts/db-status.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseStatus() {
    console.log('🔍 Checking database status...\n');

    try {
        // Check database connection
        await prisma.$connect();
        console.log('✅ Database connection: OK');

        // Check if tables exist
        const tables = await prisma.$queryRaw`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name;
        `;
        
        console.log('📊 Database tables:');
        tables.forEach(table => {
            console.log(`   - ${table.name}`);
        });

        // Check user count
        const userCount = await prisma.user.count();
        console.log(`\n👥 Users: ${userCount}`);

        // Check project count
        const projectCount = await prisma.project.count();
        console.log(`📁 Projects: ${projectCount}`);

        // Check project request count
        const requestCount = await prisma.projectRequest.count();
        console.log(`📝 Project Requests: ${requestCount}`);

        // Check resource request count
        const resourceCount = await prisma.resourceRequest.count();
        console.log(`💰 Resource Requests: ${resourceCount}`);

        // Check project step count
        const stepCount = await prisma.projectStep.count();
        console.log(`📋 Project Steps: ${stepCount}`);

        // Sample data check
        if (userCount > 0) {
            const sampleUser = await prisma.user.findFirst({
                include: {
                    projects: true,
                    projectRequests: true
                }
            });
            
            console.log('\n📄 Sample User Data:');
            console.log(`   Name: ${sampleUser.firstName} ${sampleUser.lastName}`);
            console.log(`   Email: ${sampleUser.email}`);
            console.log(`   Projects: ${sampleUser.projects.length}`);
            console.log(`   Requests: ${sampleUser.projectRequests.length}`);
        }

        // Check for admin users
        const adminUsers = await prisma.user.findMany({
            where: {
                email: {
                    in: [
                        'joelauge@gmail.com',
                        'joel@brainmediaconsulting.com',
                        'david@brainmediaconsulting.com'
                    ]
                }
            }
        });

        console.log(`\n👑 Admin Users: ${adminUsers.length}`);
        adminUsers.forEach(admin => {
            console.log(`   - ${admin.email}`);
        });

        console.log('\n🎉 Database status check completed successfully!');

    } catch (error) {
        console.error('❌ Database error:', error.message);
        
        if (error.message.includes('ENOENT')) {
            console.log('\n💡 Suggestion: Run "npm run db:reset" to initialize the database');
        } else if (error.message.includes('SQLITE_CORRUPT')) {
            console.log('\n💡 Suggestion: Database file may be corrupted. Delete dev.db and run "npm run db:reset"');
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the check
checkDatabaseStatus();
