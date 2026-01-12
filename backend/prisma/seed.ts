import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { username: "alice" },
    update: {},
    create: { username: "alice" },
  });

  const bob = await prisma.user.upsert({
    where: { username: "bob" },
    update: {},
    create: { username: "bob" },
  });

  const trip = await prisma.trip.create({
    data: {
      name: "Tokyo Weekend",
      participants: {
        create: [{ userId: alice.id }, { userId: bob.id }],
      },
    },
  });

  await prisma.expense.create({
    data: {
      tripId: trip.id,
      description: "Sushi dinner",
      amountCents: 4800,
      payerUserId: alice.id,
      shares: {
        create: [
          { userId: alice.id, shareCents: 2400 },
          { userId: bob.id, shareCents: 2400 },
        ],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
