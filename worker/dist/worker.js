import PgBoss from "pg-boss";
import { env } from "./config/env.js";
import { pool } from "./db/client.js";
import { registerDubbingJobWorker } from "./processes/dubbing-job/index.js";
const boss = new PgBoss({
    connectionString: env.DATABASE_URL,
    schema: env.PG_BOSS_SCHEMA,
});
const startWorker = async () => {
    await boss.start();
    await registerDubbingJobWorker(boss);
    console.info("Worker is listening for jobs");
};
const shutdown = async (signal) => {
    console.info(`${signal} received. Closing worker...`);
    await boss.stop();
    await pool.end();
    process.exit(0);
};
void startWorker().catch(async (error) => {
    console.error("Worker failed to start", error);
    await pool.end();
    process.exit(1);
});
process.on("SIGINT", () => {
    void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});
