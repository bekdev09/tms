import {prisma} from "../src/prisma/client.ts"
import bcrypt from 'bcryptjs';
async function main() {
  const hashedPassword = await bcrypt.hash('secret', 10);

  await prisma.user.createMany({
    data: [
      {
        username: 'test-admin',
        firstname: 'John',
        lastname: 'Doe',
        patronymic: 'Michaelovich',
        email: 'admin@example.com',
        phone: '+998901234567',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      {
        username: 'test-employee',
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'employee@example.com',
        phone: '+998909876543',
        password: hashedPassword,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
      },
    ],
    skipDuplicates: true, // ✅ avoids duplicate seed errors
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
