# 🚶 WakeupBuddy - User Journeys & Morning Scenarios

This document details the step-by-step user experience across common real-world scenarios.

---

## Journey 1: First-Time Onboarding & Permissions Setup

```
[Install App] ➔ [Sign Up / Profile Creation] ➔ [Permissions Guide Screen] ➔ [Home Dashboard]
```

1. **Account Registration**:
   - The user enters Name, Email, Password, and Phone Number.
   - An initial username is generated from the email prefix.
   - A unique DiceBear avatar is generated based on their profile seed.
2. **System Permissions Flow (`PermissionsGuide.jsx`)**:
   - Because Android aggressively shuts down background apps and restricts alarms, the app walks the user through granting **5 mandatory core permissions**:
     1. **Exact Alarm Permission**: Allows triggering at the exact second.
     2. **Disable Battery Optimization**: Prevents Android Doze mode from sleeping the app.
     3. **Display Over Other Apps (Overlay)**: Enables waking up the screen over the lock screen.
     4. **Full Screen Intent**: Android 14 requirement for alarm activities.
     5. **Phone Call Permission (`CALL_PHONE`)**: Allows direct automated dialing to buddies.
     6. *(Optional)* **Phone State & Call Log Permissions**: Allows tracking call duration to automatically verify 60-second conversations.
3. **Arrival at Home Dashboard**:
   - Initial streak set to 0. Empty heatmap ready to track daily progress.

---

## Journey 2: Setting Up Alarms (Solo, Buddy, Stranger)

### Scenario A: Creating a Solo Alarm
1. User navigates to the **Alarms** tab and taps the `+` button.
2. Selects time (e.g., `06:30 AM`), selects repeat days, and leaves **Solo Mode** checked.
3. Taps **Save Alarm**.
4. The app schedules an exact native Android alarm via `AlarmManager`.

### Scenario B: Inviting a Friend to Buddy Alarm
1. User taps `+` on the Alarms screen and toggles off **Solo Mode**.
2. Selects **Select Buddy** and picks a friend from their connected list (or enters their friend's email).
3. Taps **Save Alarm**.
4. A notification is sent to the friend's inbox.
5. Once the friend accepts, an alarm is automatically created on the friend's device for the exact same time.

### Scenario C: Stranger Match Alarm
1. User creates an alarm at `05:45 AM`, unchecks Solo Mode, but leaves buddy empty.
2. The Explore screen and Alarms screen show "Waiting for match".
3. If another user in the world creates an alarm for `05:45 AM`, both alarms are immediately paired in the cloud.
4. If no immediate match is present, the cloud cron job scans and pairs them 2 minutes before the alarm time.

---

## Journey 3: The Morning Wake-Up Protocol

```
06:30:00 AM ── Exact Alarm Triggers
               │
               ▼
           Both User A and User B phones ring loudly with custom sound + vibration
               │
               ▼
06:30:15 AM ── User A taps "I'm Awake" on their screen
               │
               ├─────────────────────────────────────────┐
               ▼                                         ▼
           User A's alarm silences locally           Convex receives dismissal event
                                                         │
                                                         ▼
                                                     User B's phone receives real-time update
                                                     and silences automatically
               │
               ▼
06:30:16.5 AM ─ User A's app automatically dials User B's phone number
               │
               ▼
06:30:20 AM ── Call connects. Both users speak to each other.
               │
               ▼
06:31:25 AM ── Call ends (duration: 65 seconds).
               Call duration is logged to Convex.
               Because duration >= 60 seconds, both users' streaks increment!
```

---

## Journey 4: The Unmatched Stranger Fallback
What happens if no stranger is waking up at 4:17 AM?
1. User sets Stranger alarm for 4:17 AM.
2. At 4:15 AM (2 minutes before), the server cron runs and finds no compatible match.
3. The alarm executes safely as a **Solo Alarm**.
4. The user's alarm rings reliably. When dismissed, the user's streak increments immediately without requiring a phone call.
5. Result: The user is never left without an alarm.

---

## Journey 5: Streak Loss & The Appeals Process
1. A user experiences a dropped call due to cellular carrier failure or network outage.
2. Their morning wake-up is recorded, but call duration shows only 15 seconds.
3. If their account gets flagged or their streak breaks:
   - They navigate to `Account Settings ➔ Appeal Streak / Ban`.
   - They submit an explanation with their situation.
   - The admin dashboard reviews the appeal in Convex and restores their streak.
