/**
 * Script to create an admin user in MongoDB
 * Run with: node create-admin.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection string from .env
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'trip_planner';

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env file');
  process.exit(1);
}

async function createAdminUser() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);
    
    console.log(`✅ Connected to database: ${DB_NAME}`);
    
    // Admin user credentials
    const adminEmail = 'admin@tripplanner.com';
    const adminPassword = 'admin123';
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password: admin123');
      
      // Update role to ADMIN if it's not already
      if (existingAdmin.role !== 'ADMIN') {
        await db.collection('users').updateOne(
          { email: adminEmail },
          { $set: { role: 'ADMIN' } }
        );
        console.log('✅ Updated existing user role to ADMIN');
      }
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user
    const adminUser = {
      userId: `user-${uuidv4()}`,
      name: 'Admin User',
      fullName: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      country: 'Sri Lanka',
      phone: '+94 11 234 5678',
      profilePicture: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    // Insert admin user
    await db.collection('users').insertOne(adminUser);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 User ID:', adminUser.userId);
    console.log('');
    console.log('You can now log in to the admin panel at: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
