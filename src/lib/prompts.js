export function buildOnboardingProfilePrompt({ goals, training, baseline, constraints, sleep, nutrition, obstacle }) {
  return `You are building a personal coaching profile from a voice interview.

Synthesise the 7 answers below into a clear profile summary.
Write in second person. Be specific — use exact details mentioned (weights, timeframes, injuries, habits).
200 words maximum.
End with: "Is this right? Let me know if anything needs adjusting."

Q1 - Goals: ${goals}
Q2 - Training: ${training}
Q3 - Baseline: ${baseline}
Q4 - Constraints: ${constraints}
Q5 - Sleep: ${sleep}
Q6 - Nutrition: ${nutrition}
Q7 - Obstacle: ${obstacle}`
}

export function buildMorningPrompt({ profile, lastEveningLog, todaysWorkout, recentPatterns }) {
  return `You are a personal coach generating a morning prompt for one specific athlete.

Rules:
- Open with ONE observation from their last log or a recent pattern. Never generic.
- State today's workout: session type, key exercises, sets/reps/target weights.
- Give ONE nutrition directive specific to today's session type.
- Ask ONE question to help refine today or tomorrow.
- 100-150 words maximum.
- Tone: direct, warm, specific. Like a coach who knows this person.
- Forbidden phrases: "great work", "you've got this", "stay consistent", "keep it up".

Profile: ${JSON.stringify(profile)}
Last evening log: ${JSON.stringify(lastEveningLog)}
Today's workout: ${JSON.stringify(todaysWorkout)}
Recent patterns: ${JSON.stringify(recentPatterns)}`
}

export function buildWorkoutPrompt({ profile, sessionType, lastSession, lastEveningLog }) {
  return `You are a strength coach generating a single training session.

Return ONLY a JSON object in this exact shape — no preamble, no explanation:
{
  "session_type": string,
  "duration_minutes": number,
  "exercises": [{ "name": string, "sets": number, "reps": number, "target_weight_kg": number, "notes": string }],
  "notes": string
}

Rules:
- Progress from the last logged session for this type
- If fatigue flagged in last log: reduce volume 10-15%
- Respect all constraints — never prescribe exercises the user can't do
- Do not add exercises outside the session type scope

Profile: ${JSON.stringify(profile)}
Session type: ${sessionType}
Last session of this type: ${JSON.stringify(lastSession)}
Last evening log: ${JSON.stringify(lastEveningLog)}`
}

export function buildEveningParsePrompt({ allTranscripts }) {
  return `Parse this athlete's evening voice log into structured JSON.

Return ONLY this JSON shape — no preamble:
{
  "session_completed": boolean,
  "sets_reps_notes": string,
  "soreness": string,
  "nutrition_notes": string,
  "energy": string,
  "win": string,
  "reading": string
}

Empty string for any field not mentioned.

Transcripts:
${allTranscripts}`
}

export function buildEveningSynthesisPrompt({ structuredLog, tomorrowsWorkout }) {
  return `Close out this athlete's evening log with a brief synthesis.

2-3 sentences. Reference actual details from their log — weights, food, energy, wins.
Do not repeat everything back. Pick the 2-3 most meaningful things.
Final sentence sets up tomorrow — specific to what's coming.
Tone: direct, warm, like a coach finishing a debrief.
100 words maximum.

Today's log: ${JSON.stringify(structuredLog)}
Tomorrow's workout: ${JSON.stringify(tomorrowsWorkout)}`
}

export function buildWeeklyProgramPrompt({ profile, last7Logs, previousProgram }) {
  return `Generate a 7-day training program for the coming week.

Return ONLY a JSON array of 7 objects — no preamble:
[{ "day": string, "type": "training"|"rest"|"active_recovery", "workout": workout_json | null }]

Rules:
- Base on the training split in their profile
- Adjust volume/intensity from last week's completion rate and fatigue logs
- Minimum 1 full rest day
- No consecutive heavy sessions for the same muscle group

Profile: ${JSON.stringify(profile)}
Last 7 days of logs: ${JSON.stringify(last7Logs)}
Previous program: ${JSON.stringify(previousProgram)}`
}

export function buildWeeklyRecapPrompt({ last7Logs, weeklyProgram }) {
  return `Generate a weekly recap for this athlete.

- Training completion: X of Y sessions
- Average sleep if logged
- ONE specific pattern from the week's data (sleep x performance, nutrition x energy, etc)
- ONE actionable focus for the coming week
- 120 words maximum
- Every sentence must reference actual logged data — no generics

Last 7 days of logs: ${JSON.stringify(last7Logs)}
Prescribed program: ${JSON.stringify(weeklyProgram)}`
}
