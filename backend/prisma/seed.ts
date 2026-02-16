import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.create({
    data: { email: 'alice@example.com', password: hash, name: 'Alice Chen', bio: 'Full-stack developer with 8 years experience', creditBalance: 15, trustScore: 45 }
  });
  const bob = await prisma.user.create({
    data: { email: 'bob@example.com', password: hash, name: 'Bob Martinez', bio: 'Graphic designer and illustrator', creditBalance: 10, trustScore: 30 }
  });
  const carol = await prisma.user.create({
    data: { email: 'carol@example.com', password: hash, name: 'Carol Williams', bio: 'Marketing strategist and copywriter', creditBalance: 20, trustScore: 60 }
  });

  await prisma.skill.createMany({
    data: [
      { name: 'React Development', description: 'Modern React with hooks and TypeScript', creditRate: 5, yearsOfExp: 8, userId: alice.id },
      { name: 'Node.js Backend', description: 'RESTful APIs and microservices', creditRate: 4, yearsOfExp: 6, userId: alice.id },
      { name: 'Logo Design', description: 'Brand identity and logo creation', creditRate: 3, yearsOfExp: 5, userId: bob.id },
      { name: 'UI/UX Design', description: 'User interface and experience design', creditRate: 4, yearsOfExp: 4, userId: bob.id },
      { name: 'Content Marketing', description: 'SEO-optimized content strategy', creditRate: 2, yearsOfExp: 7, userId: carol.id },
      { name: 'Copywriting', description: 'Persuasive copy for web and ads', creditRate: 3, yearsOfExp: 6, userId: carol.id },
    ]
  });

  await prisma.creditTransaction.createMany({
    data: [
      { amount: 5, type: 'bonus', description: 'Welcome bonus', userId: alice.id },
      { amount: 10, type: 'earned', description: 'Completed React project', userId: alice.id },
      { amount: 5, type: 'bonus', description: 'Welcome bonus', userId: bob.id },
      { amount: 5, type: 'earned', description: 'Logo design project', userId: bob.id },
      { amount: 5, type: 'bonus', description: 'Welcome bonus', userId: carol.id },
      { amount: 15, type: 'earned', description: 'Multiple content projects', userId: carol.id },
    ]
  });

  await prisma.review.createMany({
    data: [
      { rating: 5, comment: 'Amazing React developer!', reviewerId: bob.id, revieweeId: alice.id },
      { rating: 4, comment: 'Great work on our API', reviewerId: carol.id, revieweeId: alice.id },
      { rating: 5, comment: 'Beautiful logo design', reviewerId: alice.id, revieweeId: bob.id },
      { rating: 4, comment: 'Excellent content strategy', reviewerId: alice.id, revieweeId: carol.id },
      { rating: 5, comment: 'Top-notch copywriting', reviewerId: bob.id, revieweeId: carol.id },
    ]
  });

  console.log('Seed data created successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
