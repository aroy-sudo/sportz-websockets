import { eq, and } from 'drizzle-orm';
import { db, pool } from './db.js';
import { matches, commentary } from './db/schema.js';

async function main() {
  try {
    console.log('Performing CRUD operations for a sports match...');

    // CREATE: Insert a new match
    const [newMatch] = await db
      .insert(matches)
      .values({
        sport: 'Football',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        startTime: new Date(),
      })
      .returning();

    if (!newMatch) {
      throw new Error('Failed to create match');
    }
    console.log('✅ CREATE: New match created:', newMatch);

    // CREATE: Add a commentary to the match
    const [newComment] = await db
      .insert(commentary)
      .values({
        matchId: newMatch.id,
        message: 'The match has officially started!',
        minute: 0,
        eventType: 'match_start',
      })
      .returning();
    console.log('✅ CREATE: New commentary added:', newComment);

    // READ: Select the match with its commentary
    const matchWithCommentary = await db
      .select()
      .from(matches)
      .leftJoin(commentary, eq(matches.id, commentary.matchId))
      .where(eq(matches.id, newMatch.id));
    console.log('✅ READ: Found match with commentary:', matchWithCommentary);

    // UPDATE: Change the match status and score
    const [updatedMatch] = await db
      .update(matches)
      .set({ status: 'live', homeScore: 1 })
      .where(eq(matches.id, newMatch.id))
      .returning();
    
    if (!updatedMatch) {
      throw new Error('Failed to update match');
    }
    console.log('✅ UPDATE: Match updated:', updatedMatch);
    
    // DELETE: Remove the commentary
    await db.delete(commentary).where(eq(commentary.id, newComment.id));
    console.log('✅ DELETE: Commentary deleted.');

    // DELETE: Remove the match
    await db.delete(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ DELETE: Match deleted.');


    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    // If the pool exists, end it to close the connection
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();
