import type { Pool } from 'pg';

async function clientConnectDB(db: Pool) {
    try {
        await db.connect();
        console.log("Postgres connected");
    } catch (error) {
        console.error(error);
        process.exit(1)
    }
}

export default clientConnectDB
