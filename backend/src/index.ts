import express from "express";
import cors from "cors";
import prisma from "./prisma";

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-User"],
  })
);

app.use(express.json());

type AuthedRequest = express.Request & {
  user?: { id: string; username: string };
};

type AsyncHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<void>;

const asyncHandler = (handler: AsyncHandler) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) =>
    handler(req, res, next).catch(next);

const requireUser = asyncHandler(async (req, res, next) => {
  const username = req.header("X-User");
  if (!username) {
    res.status(401).json({ error: "Missing X-User header" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    res.status(401).json({ error: "Unknown user. Switch user first." });
    return;
  }

  (req as AuthedRequest).user = { id: user.id, username: user.username };
  next();
});

const ensureTripAccess = async (tripId: string, userId: string) => {
  const participant = await prisma.tripParticipant.findUnique({
    where: {
      tripId_userId: {
        tripId,
        userId,
      },
    },
  });
  return Boolean(participant);
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post(
  "/users/switch",
  asyncHandler(async (req, res) => {
    const username = String(req.body?.username || "").trim();
    if (!username) {
      res.status(400).json({ error: "username is required" });
      return;
    }

    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username },
    });

    res.json({ id: user.id, username: user.username });
  })
);

app.post(
  "/trips",
  requireUser,
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const user = (req as AuthedRequest).user!;

    const trip = await prisma.trip.create({
      data: {
        name,
        participants: {
          create: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json({
      id: trip.id,
      name: trip.name,
      createdAt: trip.createdAt,
      participants: trip.participants.map((participant) => ({
        userId: participant.userId,
        username: participant.user.username,
      })),
    });
  })
);

app.get(
  "/trips",
  requireUser,
  asyncHandler(async (req, res) => {
    const user = (req as AuthedRequest).user!;
    const trips = await prisma.trip.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      trips.map((trip) => ({
        id: trip.id,
        name: trip.name,
        createdAt: trip.createdAt,
      }))
    );
  })
);

app.get(
  "/trips/:tripId",
  requireUser,
  asyncHandler(async (req, res) => {
    const user = (req as AuthedRequest).user!;
    const { tripId } = req.params;

    const hasAccess = await ensureTripAccess(tripId, user.id);
    if (!hasAccess) {
      res.status(403).json({ error: "Not a participant" });
      return;
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    if (!trip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    res.json({
      id: trip.id,
      name: trip.name,
      createdAt: trip.createdAt,
      participants: trip.participants.map((participant) => ({
        userId: participant.userId,
        username: participant.user.username,
      })),
    });
  })
);

app.get(
  "/trips/:tripId/participants",
  requireUser,
  asyncHandler(async (req, res) => {
    const user = (req as AuthedRequest).user!;
    const { tripId } = req.params;

    const hasAccess = await ensureTripAccess(tripId, user.id);
    if (!hasAccess) {
      res.status(403).json({ error: "Not a participant" });
      return;
    }

    const participants = await prisma.tripParticipant.findMany({
      where: { tripId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    res.json(
      participants.map((participant) => ({
        userId: participant.userId,
        username: participant.user.username,
      }))
    );
  })
);

app.post(
  "/trips/:tripId/participants",
  requireUser,
  asyncHandler(async (req, res) => {
    const user = (req as AuthedRequest).user!;
    const { tripId } = req.params;
    const username = String(req.body?.username || "").trim();

    if (!username) {
      res.status(400).json({ error: "username is required" });
      return;
    }

    const hasAccess = await ensureTripAccess(tripId, user.id);
    if (!hasAccess) {
      res.status(403).json({ error: "Not a participant" });
      return;
    }

    const targetUser = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username },
    });

    const participant = await prisma.tripParticipant.upsert({
      where: {
        tripId_userId: {
          tripId,
          userId: targetUser.id,
        },
      },
      update: {},
      create: {
        tripId,
        userId: targetUser.id,
      },
      include: { user: true },
    });

    res.json({ userId: participant.userId, username: participant.user.username });
  })
);

app.post(
  "/trips/:tripId/expenses",
  requireUser,
  asyncHandler(async (req, res) => {
    const user = (req as AuthedRequest).user!;
    const { tripId } = req.params;

    const hasAccess = await ensureTripAccess(tripId, user.id);
    if (!hasAccess) {
      res.status(403).json({ error: "Not a participant" });
      return;
    }

    const description = String(req.body?.description || "").trim();
    const amountCents = Number(req.body?.amountCents);
    const payerUserId = String(req.body?.payerUserId || "");
    const split = Array.isArray(req.body?.split) ? req.body.split : [];

    if (!description) {
      res.status(400).json({ error: "description is required" });
      return;
    }
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      res.status(400).json({ error: "amountCents must be a positive integer" });
      return;
    }
    if (!payerUserId) {
      res.status(400).json({ error: "payerUserId is required" });
      return;
    }
    if (!split.length) {
      res.status(400).json({ error: "split must include at least one participant" });
      return;
    }

    const participants = await prisma.tripParticipant.findMany({
      where: { tripId },
    });
    const participantIds = new Set(participants.map((p) => p.userId));

    if (!participantIds.has(payerUserId)) {
      res.status(400).json({ error: "payer must be a trip participant" });
      return;
    }

    const seen = new Set<string>();
    let sum = 0;
    for (const entry of split) {
      const userId = String(entry.userId || "");
      const shareCents = Number(entry.shareCents);

      if (!userId || !participantIds.has(userId)) {
        res.status(400).json({ error: "split participants must be in trip" });
        return;
      }
      if (seen.has(userId)) {
        res.status(400).json({ error: "duplicate split participant" });
        return;
      }
      if (!Number.isInteger(shareCents) || shareCents < 0) {
        res.status(400).json({ error: "shareCents must be non-negative integers" });
        return;
      }
      seen.add(userId);
      sum += shareCents;
    }

    if (sum !== amountCents) {
      res.status(400).json({ error: "split shares must sum to amountCents" });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        tripId,
        description,
        amountCents,
        payerUserId,
        shares: {
          create: split.map((entry: { userId: string; shareCents: number }) => ({
            userId: entry.userId,
            shareCents: entry.shareCents,
          })),
        },
      },
      include: {
        payer: true,
        shares: {
          include: { user: true },
        },
      },
    });

    res.json({
      id: expense.id,
      description: expense.description,
      amountCents: expense.amountCents,
      payerUserId: expense.payerUserId,
      payerUsername: expense.payer.username,
      createdAt: expense.createdAt,
      shares: expense.shares.map((share) => ({
        userId: share.userId,
        username: share.user.username,
        shareCents: share.shareCents,
      })),
    });
  })
);

app.get(
  "/trips/:tripId/expenses",
  requireUser,
  asyncHandler(async (req, res) => {
    const user = (req as AuthedRequest).user!;
    const { tripId } = req.params;

    const hasAccess = await ensureTripAccess(tripId, user.id);
    if (!hasAccess) {
      res.status(403).json({ error: "Not a participant" });
      return;
    }

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
      include: {
        payer: true,
        shares: {
          include: { user: true },
        },
      },
    });

    res.json(
      expenses.map((expense) => ({
        id: expense.id,
        description: expense.description,
        amountCents: expense.amountCents,
        payerUserId: expense.payerUserId,
        payerUsername: expense.payer.username,
        createdAt: expense.createdAt,
        shares: expense.shares.map((share) => ({
          userId: share.userId,
          username: share.user.username,
          shareCents: share.shareCents,
        })),
      }))
    );
  })
);

app.get(
  "/trips/:tripId/summary",
  requireUser,
  asyncHandler(async (req, res) => {
    const user = (req as AuthedRequest).user!;
    const { tripId } = req.params;

    const hasAccess = await ensureTripAccess(tripId, user.id);
    if (!hasAccess) {
      res.status(403).json({ error: "Not a participant" });
      return;
    }

    const participants = await prisma.tripParticipant.findMany({
      where: { tripId },
      include: { user: true },
    });

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      include: {
        payer: true,
        shares: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const paidMap = new Map<string, number>();
    const owedMap = new Map<string, number>();
    const lineItemsMap = new Map<
      string,
      Array<{
        expenseId: string;
        description: string;
        amountCents: number;
        payerUsername: string;
        shareCents: number;
        createdAt: Date;
      }>
    >();

    for (const participant of participants) {
      paidMap.set(participant.userId, 0);
      owedMap.set(participant.userId, 0);
      lineItemsMap.set(participant.userId, []);
    }

    let totalSpendCents = 0;

    for (const expense of expenses) {
      totalSpendCents += expense.amountCents;
      paidMap.set(
        expense.payerUserId,
        (paidMap.get(expense.payerUserId) || 0) + expense.amountCents
      );

      for (const share of expense.shares) {
        owedMap.set(
          share.userId,
          (owedMap.get(share.userId) || 0) + share.shareCents
        );

        const items = lineItemsMap.get(share.userId) || [];
        items.push({
          expenseId: expense.id,
          description: expense.description,
          amountCents: expense.amountCents,
          payerUsername: expense.payer.username,
          shareCents: share.shareCents,
          createdAt: expense.createdAt,
        });
        lineItemsMap.set(share.userId, items);
      }
    }

    const netBalances = participants.map((participant) => {
      const paidCents = paidMap.get(participant.userId) || 0;
      const owedCents = owedMap.get(participant.userId) || 0;
      return {
        userId: participant.userId,
        username: participant.user.username,
        netCents: paidCents - owedCents,
        paidCents,
        owedCents,
      };
    });

    const creditors = netBalances
      .filter((entry) => entry.netCents > 0)
      .map((entry) => ({
        userId: entry.userId,
        amount: entry.netCents,
      }))
      .sort((a, b) => b.amount - a.amount);

    const debtors = netBalances
      .filter((entry) => entry.netCents < 0)
      .map((entry) => ({
        userId: entry.userId,
        amount: Math.abs(entry.netCents),
      }))
      .sort((a, b) => b.amount - a.amount);

    const settlements: Array<{ fromUserId: string; toUserId: string; amountCents: number }> = [];

    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amountCents: amount,
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount === 0) i += 1;
      if (creditor.amount === 0) j += 1;
    }

    const perPersonLineItems = Array.from(lineItemsMap.entries()).map(
      ([userId, items]) => ({
        userId,
        items,
      })
    );

    res.json({
      participants: participants.map((participant) => ({
        userId: participant.userId,
        username: participant.user.username,
      })),
      totalSpendCents,
      netBalances,
      settlements,
      perPersonLineItems,
    });
  })
);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
