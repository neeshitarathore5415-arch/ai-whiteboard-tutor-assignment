
import type { FastifyInstance } from "fastify";
import Groq from "groq-sdk";

interface ChatRequest {
    topic: string;
    question: string;
    lessonContext?: string;
}

export async function chatRoutes(app: FastifyInstance) {
    app.post<{ Body: ChatRequest }>("/ask", async (request, reply) => {
        try {
            const { topic, question, lessonContext } = request.body ?? {};

            if (!topic?.trim() || !question?.trim()) {
                return reply.code(400).send({
                    success: false,
                    message: "Topic and question are required.",
                });
            }

            const apiKey = process.env.GROQ_API_KEY;

            if (!apiKey) {
                return reply.code(500).send({
                    success: false,
                    message: "Groq API key is not configured.",
                });
            }

            const groq = new Groq({ apiKey });

            const response = await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content: `
You are LearnBoard AI, a friendly technical tutor.

Your job is to answer students' follow-up questions
about the lesson they are currently learning.

Rules:
- Give beginner-friendly explanations.
- Use simple English.
- Explain technical terms clearly.
- Give practical examples wherever useful.
- Keep answers concise but informative.
- Stay relevant to the lesson topic.
- Do not generate a new lesson.
            `,
                    },
                    {
                        role: "user",
                        content: `
Lesson topic: ${topic}

Lesson context:
${lessonContext || "No additional lesson context provided."}

Student's question:
${question}
            `,
                    },
                ],
                temperature: 0.6,
                max_completion_tokens: 1000,
            });

            const answer = response.choices[0]?.message?.content;

            if (!answer) {
                throw new Error("Groq returned an empty answer.");
            }

            return reply.send({
                success: true,
                answer,
            });
        } catch (error) {
            app.log.error(error);

            return reply.code(500).send({
                success: false,
                message: "Failed to generate answer. Please try again.",
            });
        }
    });
}
