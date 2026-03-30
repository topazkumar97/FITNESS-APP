// src/utils/prisma.ts
import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

// WHY PrismaNeon instead of PrismaPg:
// PrismaPg uses the pg driver which connects over TCP port 5432.
// PrismaNeon uses @neondatabase/serverless which connects over WebSockets
// on port 443 — this works in environments where port 5432 is blocked.
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });

export const prisma = new PrismaClient({ adapter });
