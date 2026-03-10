import { z } from 'zod';

/**
 * Constants
 */
export const MATCH_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
});

/**
 * Schemas
 */

// GET /matches
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// GET /matches/:id
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// POST /matches
export const createMatchSchema = z.object({
  sport: z.string({ required_error: 'Sport is required.' }).min(1, 'Sport must not be empty.'),
  homeTeam: z.string({ required_error: 'Home team is required.' }).min(1, 'Home team must not be empty.'),
  awayTeam: z.string({ required_error: 'Away team is required.' }).min(1, 'Away team must not be empty.'),
  startTime: z.string({ required_error: 'Start time is required.' }).datetime({ message: 'Start time must be a valid ISO date string.' }),
  endTime: z.string({ required_error: 'End time is required.' }).datetime({ message: 'End time must be a valid ISO date string.' }),
  homeScore: z.coerce.number().int().nonnegative().optional(),
  awayScore: z.coerce.number().int().nonnegative().optional(),
}).superRefine((data, ctx) => {
  if (new Date(data.startTime) >= new Date(data.endTime)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End time must be chronologically after start time.',
      path: ['endTime'],
    });
  }
});

// PATCH /matches/:id/score
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative({ message: 'Home score must be a non-negative integer.' }),
  awayScore: z.coerce.number().int().nonnegative({ message: 'Away score must be a non-negative integer.' }),
});
