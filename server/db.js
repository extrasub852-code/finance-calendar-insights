import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
function createPrisma() {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;
    if (tursoUrl && tursoToken) {
        const adapter = new PrismaLibSQL({
            url: tursoUrl,
            authToken: tursoToken,
        });
        return new PrismaClient({ adapter });
    }
    return new PrismaClient();
}
export const prisma = createPrisma();
