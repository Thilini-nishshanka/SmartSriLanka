///  <reference types="node" />

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const policies = [
    {
      slug: 'terms-and-conditions',
      title: 'Terms and Conditions',
      content: '<h1>Terms and Conditions</h1><p>Please add your terms and conditions content here.</p>',
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: '<h1>Privacy Policy</h1><p>Please add your privacy policy content here.</p>',
    },
    {
      slug: 'refund-policy',
      title: 'Refund Policy',
      content: '<h1>Refund Policy</h1><p>Please add your refund policy content here.</p>',
    },
  ];

  for (const policy of policies) {
    await prisma.policyPage.upsert({
      where: { slug: policy.slug },
      update: {},
      create: policy,
    });
    console.log(`✅ Policy page seeded: ${policy.title}`);
  }

  // // Create Admin user
  // const hashedPasswordAdmin = await bcrypt.hash('DSadmin@123', 12);

  // const adminProfile = await prisma.profile.upsert({
  //   where: { email: 'adminsl@gmail.com' },
  //   update: {},
  //   create: {
  //     email: 'adminsl@gmail.com',
  //     name: 'Admin User',
  //     phone: '0781234567',
  //     password: hashedPasswordAdmin,
  //     role: UserRole.admin,
  //   },
  // });

  // console.log('✅ Admin profile seeded:', adminProfile.email);

  // // Create standard user
  // const hashedPasswordUser = await bcrypt.hash('GNadmin@123', 12);

  // const userProfile = await prisma.profile.upsert({
  //   where: { email: 'user@slnicbridge.lk' },
  //   update: {},
  //   create: {
  //     email: 'user@slnicbridge.lk',
  //     name: 'Standard User',
  //     phone: '0779876543',
  //     password: hashedPasswordUser,
  //     role: UserRole.user,
  //   },
  // });

  // console.log('✅ Standard user profile seeded:', userProfile.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🌱 Database seeding completed!');
  });