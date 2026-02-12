import bcrypt from 'bcryptjs';
import prisma from './lib/prisma.js';

async function seed() {
  try {
    console.log('🌱 Seeding database...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'sundayschool' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('bestorgever', 10);
    
    await prisma.user.create({
      data: {
        username: 'sundayschool',
        password: hashedPassword
      }
    });
    
    console.log('✅ Admin user created successfully');
    console.log('   Username: sundayschool');
    console.log('   Password: bestorgever');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
