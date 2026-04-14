import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { ensureTursoSchema } from "./ensureTursoSchema";
await ensureTursoSchema();
function createPrisma() {
    const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
    const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();
    if (tursoUrl && tursoToken) {
        // Prisma schema still requires DATABASE_URL; the libSQL adapter handles the real connection.
        if (!process.env.DATABASE_URL) {
            process.env.DATABASE_URL = "file:./.turso-prisma-placeholder.db";
        }
        const adapter = new PrismaLibSQL({
            url: tursoUrl,
            authToken: tursoToken,
        });
        return new PrismaClient({ adapter });
    }
    if (!process.env.DATABASE_URL) {
        throw new Error("Missing DATABASE_URL. For Turso, set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN (DATABASE_URL is optional). For SQLite, set DATABASE_URL (e.g. file:./prisma/dev.db).");
    }
    return new PrismaClient();
}
export const prisma = createPrisma();
