import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prismaDir = path.join(rootDir, "prisma");
const databasePath = path.join(prismaDir, "dev.db");

mkdirSync(prismaDir, { recursive: true });

const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS "Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalUrl" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "customAlias" TEXT,
    "manageTokenHash" TEXT NOT NULL,
    "passwordHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "Link_shortCode_key" ON "Link"("shortCode");
  CREATE UNIQUE INDEX IF NOT EXISTS "Link_customAlias_key" ON "Link"("customAlias");
  CREATE UNIQUE INDEX IF NOT EXISTS "Link_manageTokenHash_key" ON "Link"("manageTokenHash");

  CREATE TABLE IF NOT EXISTS "ClickEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkId" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "country" TEXT,
    "clickedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClickEvent_linkId_fkey"
      FOREIGN KEY ("linkId")
      REFERENCES "Link" ("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "ClickEvent_linkId_clickedAt_idx" ON "ClickEvent"("linkId", "clickedAt");
`);

const linkColumns = db.prepare(`PRAGMA table_info("Link")`).all();
const hasPasswordHashColumn = linkColumns.some((column) => column.name === "passwordHash");

if (!hasPasswordHashColumn) {
  db.exec(`ALTER TABLE "Link" ADD COLUMN "passwordHash" TEXT;`);
}

db.close();

console.log(`Initialized SQLite database at ${databasePath}`);
