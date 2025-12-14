import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run the stranger alarm matching every minute
// This checks for alarms scheduled 2 minutes from now and matches compatible strangers
crons.interval(
    "stranger-alarm-matching",
    { minutes: 1 },
    internal.matching.runMatchingForUpcomingAlarms
);

// Reset daily leaderboard at midnight IST (18:30 UTC = 00:00 IST)
// IST is UTC+5:30, so midnight IST = 18:30 UTC
crons.daily(
    "reset-daily-leaderboard",
    { hourUTC: 18, minuteUTC: 30 }, // Midnight in IST
    internal.leaderboard.resetDailyLeaderboard
);

export default crons;

