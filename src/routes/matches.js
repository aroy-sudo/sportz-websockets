import { Router } from "express";
import { db } from '../db.js';
import { matches } from '../db/schema.js';
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

export const matchesRouter = Router();
const MAX_LIMIT = 100;

matchesRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query parameters.', details: parsed.error.flatten() });
    }

    const limit = Math.min(parsed.data.limit ?? 50 , MAX_LIMIT)

    try {
        const data = await db
        .select()
        .from(matches)
        .orderBy((desc(matches.createdAt)))
        .limit(limit);
        res.json({data});
    } catch (e) {
        console.error('Failed to fetch matches:', e);
+        res.status(500).json({ error: 'Failed to fetch matches.' });
     }
    }
);

matchesRouter.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload.', details: parsed.error.flatten() });
    }

    const { startTime, endTime, ...restOfData } = parsed.data;

    try {
         const [event] = await db.insert(matches).values({
            ...restOfData,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: getMatchStatus(startTime, endTime),
         }).returning();
         if(res.app.locals.broadcastMatchCreated) {
            res.app.locals.broadcastMatchCreated(event);
         }

         res.status(201).json(event);
    } catch (e) {
         console.error('Failed to create match:', e);
               res.status(500).json({ error: 'Failed to create match.' });
    }
});