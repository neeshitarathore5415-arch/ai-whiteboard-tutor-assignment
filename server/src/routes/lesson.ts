
import type { FastifyInstance } from "fastify";
import Groq from "groq-sdk";

export async function lessonRoutes(app: FastifyInstance) {
    app.post<{ Body: { topic: string } }>(
        "/generate",
        async (request, reply) => {
            try {
                const { topic } = request.body ?? {};

                if (!topic || typeof topic !== "string" || !topic.trim()) {
                    return reply.code(400).send({
                        success: false,
                        message: "Please provide a valid topic.",
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


                const prompt = `
You are a professional visual teacher and instructional designer.

Create a 90-second beginner-friendly visual lesson about: "${topic.trim()}".

The lesson will be displayed on an 800 x 500 interactive SVG whiteboard.
The whiteboard uses a coordinate system where x ranges from 0 to 800
and y ranges from 0 to 500.

Return ONLY valid JSON. Do not use markdown or code fences.

Use this exact structure:
{
  "topic": "topic name",
  "title": "Understanding topic",
  "description": "Short lesson description",
  "totalDuration": 90,
  "segments": [
    {
      "id": "segment-1",
      "narration": "Clear spoken explanation",
      "startTime": 0,
      "duration": 30,
      "boardActions": [
        {
          "id": "unique-action-1",
          "type": "title",
          "content": "Main Heading",
          "x": 40,
          "y": 55,
          "startTime": 0,
          "duration": 25,
          "color": "#4f46e5"
        }
      ]
    }
  ]
}

LESSON STRUCTURE:
- Exactly 3 segments.
- Segment 1: startTime 0, duration 30.
- Segment 2: startTime 30, duration 30.
- Segment 3: startTime 60, duration 30.
- Explain introduction, main concept, and summary progressively.

VISUAL DESIGN RULES:
1. Create exactly ONE main title, in segment 1 only.
2. Never repeat the main title in later segments.
3. Keep all text within x: 35-760 and y: 50-450.
4. Keep at least 25 pixels of space between separate text elements.
5. Never overlap text with circles or rectangles.
6. Use a clean, balanced layout with plenty of whitespace.
7. Prefer 2-3 connected visual elements instead of many random shapes.
8. Each segment should contain 3-5 meaningful board actions.
9. Use short labels instead of long paragraphs.
10. Use consistent colors:
    - Titles: #4f46e5
    - Text: #26334a
    - Shapes: #6366f1
    - Arrows: #f59e0b

TIMING RULES:
- All board action startTime values must use GLOBAL lesson time.
- Segment 1 actions must start between 0 and 29.
- Segment 2 actions must start between 30 and 59.
- Segment 3 actions must start between 60 and 89.
- Each action duration must be at least 5 seconds.
- Do not let an action extend beyond its segment.
- Make actions appear progressively with the narration.

BOARD ACTION RULES:
- Allowed types: title, text, circle, rectangle, arrow.
- Every action requires id, type, x, y, startTime and duration.
- Text and title require content.
- Circle requires width as radius.
- Rectangle requires width and height as dimensions.
- Arrow requires width as the absolute ending X coordinate
  and height as the absolute ending Y coordinate.
- Keep all shapes within the whiteboard boundaries.
- Give every action a unique ID.
- Never create duplicate or meaningless actions.

TEACHING RULES:

1. Explain technical concepts using simple, beginner-friendly language.
2. Use realistic and relatable examples.
3. Make every diagram directly relevant to the topic.

NARRATION AND WHITEBOARD SYNCHRONIZATION:

4. Every important text or title displayed on the whiteboard
   MUST also be mentioned in the narration of the same segment.

5. When introducing a whiteboard label, mention its exact text
   and immediately explain what it means.

6. Explain visual elements in the same order in which their
   boardActions appear.

7. When a diagram contains connected boxes or arrows,
   explain what each box represents and what the arrow means.

8. Never create a visual element that is unrelated to the narration.

9. Do not simply read labels aloud.
   Explain their meaning as a teacher would explain on a real whiteboard.

10. Keep narration natural and conversational,
    as if teaching a student in a classroom.

11. Each 30-second segment should contain approximately
    35-50 spoken words.

12. Organize narration so that the explanation of each visual
    corresponds approximately to its boardAction startTime.

13. The final segment must explain the complete diagram
    and summarize the most important concepts.

14. Do not introduce important concepts in narration
    without representing them visually whenever possible.
    
Return exactly 3 segments and valid JSON only.
`;


                const response = await groq.chat.completions.create({
                    model: "openai/gpt-oss-20b",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a visual teaching assistant. Return only valid JSON.",
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    response_format: {
                        type: "json_object",
                    },
                    temperature: 0.6,
                    max_completion_tokens: 5000,
                });

                const content = response.choices[0]?.message?.content;

                if (!content) {
                    throw new Error("Groq returned an empty response.");
                }

                const lesson = JSON.parse(content);

                return reply.send({
                    success: true,
                    lesson: {
                        ...lesson,
                        id: crypto.randomUUID(),
                    },
                });
            } catch (error) {
                app.log.error(error);

                return reply.code(500).send({
                    success: false,
                    message: "Failed to generate lesson. Please try again.",
                });
            }
        }
    );
}
