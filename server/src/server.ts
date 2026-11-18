
import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { lessonRoutes } from "./routes/lesson";
import { chatRoutes } from "./routes/chat";

dotenv.config();

const app = Fastify({
    logger: true,
});

const startServer = async () => {
    try {
        const allowedOrigins = [
            "http://localhost:5173",
            process.env.CLIENT_URL,
        ].filter((origin): origin is string => Boolean(origin));

        await app.register(cors, {
            origin: allowedOrigins,
        });

        await app.register(lessonRoutes, { prefix: "/api/lessons" });

        await app.register(chatRoutes, { prefix: "/api/chat" });

        app.get("/", async () => {
            return {
                success: true,
                message: "LearnBoard AI backend is running!",
            };
        });

        app.get("/health", async () => {
            return {
                success: true,
                status: "healthy",
            };
        });

        const port = Number(process.env.PORT) || 5000;

        await app.listen({
            port,
            host: "0.0.0.0",
        });

    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

startServer();
