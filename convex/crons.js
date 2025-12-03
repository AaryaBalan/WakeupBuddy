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

export default crons;
