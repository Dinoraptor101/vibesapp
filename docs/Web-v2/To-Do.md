- We are yet to implement a Vibes Score (Karma engine) into Web-V2 and how to better represent it

- We need a technology approach that will enforce 1 user per account policy... maybe we can track users created using the exact same location or the exact same IP, and flag them with a unique identifier, and then group them under the User Management Admin Dashboard

- We should consider how secure our database is from hacking we do use Atlas MongoDB but is our API access to it best in class? 

- Security Upgrade (Encryption) in the future is needed, can't risk the locations of people being shared, especially if we start collecting real identification in the future, that stuff should probably be encrypted when stored in DB ( PII, financial info, passwords, and location data ). that means building an encryption layer.... 

- **Add birth date collection step to signup process** - Currently SignupWizard has `birthYear` and `birthMonth` fields with default values (defaults to 20 years old, month 1), but there's NO UI step where users actually input their birth date. Need to add a dedicated signup step (probably between steps 3-4) where users select their birth month and year. This is important for age verification and profile completeness.

- **Implement Strike System Frontend UI** - The backend has a complete graduated consequence system (strikes, 24h cooldowns, permanent bans) but there's NO frontend interface to display it to users. Need to implement:
  1. **Strike Warning Modal** - Shows when user opens app after receiving a strike, displays strike count (X/3), violation reason, cooldown duration, and links to community guidelines
  2. **Posting Restriction Checks** - Prevent posting/commenting during cooldown periods, show user-friendly error messages
  3. **Cooldown Timer Display** - Show countdown timer when user tries to post during restriction
  4. **Strike History in Settings** - Display active strikes, reasons, and expiration dates (30-day sliding window)
  5. **Banned User Screen** - Full-screen modal for Strike 4 (permanent ban) with appeal information
  Backend API already returns `canPost`, `canComment`, `strikeCount`, and `cooldownEnd` from `User.getCurrentRestrictions()` method - just need to consume it in the frontend.

- Return of the group chats, they're awesome but they have to provide a big coverage so... two solutions (both of these are just ideas because Telegram already exists for private convos, but public group chats largely depend on the community joining... so far group chats SUCK! can we make a version that doesn't suck? I don't know... Facebook tried and failed LOL. a lot of this depends on cultivating the ethos of encouraging people to use proper language and be kind. )
1. Create the grouped (conversations) where people invite more of their friends into the conversation. 
2. **Regional groups organized and moderated by verified residents of each city**. The goal is to create spaces that feel more like gathering with neighbors than shouting into a crowd. <--- this sounds awesome!


Wu-Wei Scoring Mechanism (Idea and Theory)
- **Wu-Wei Scoring Mechanism**: Replace punitive carrots/sticks with a fluid "Flow Score" that tracks effortless harmony. Users gain points for:
  1. **Compassionate Comments**: Supportive replies that foster understanding.
  2. **Frugal Shares**: Sharing local, non-commercial tips (e.g., free events).
  3. **Humble Actions**: Anonymous acts of kindness or yielding in discussions.

  There are no punishments. Instead, low scorers receive gentle prompts like "Embrace humility: share without seeking likes," which fade as users naturally align with the ethos. Redemption is facilitated through "Sinner Circles," opt-in local groups for open dialogue where all voices coexist without blocks, promoting acceptance and balance in the spirit of Daoist non-interference.

  Hmm: I cannot be the person decising which comment is compasionate and which post is frugal, or which actions (deeds with real life impact) translate to humble actions, maybe a small LLM can do this?
  -----


## Anti-Materialism Safeguards (Important)
Combat materialism by limiting posts to geo-tagged photos of everyday life (no luxury flexing via filters or ads), with AI nudging users toward "simple shares" like neighborhood walks or communal meals. Introduce "Treasure Challenges": daily quests based on Dao De Jing, e.g., "Practice frugality: recommend a free local resource," rewarding with visibility boosts in local feeds rather than tokens. Political dogma dissolves through "Duality Views," pairing opposing local opinions side-by-side without upvote wars, encouraging wu wei reflection over debate.​
---- possible but we don't do algorithims, we need a simple organic approach to this. incuring Wu-Wei reflection over debate?? interesting. difficult... gotta think about this more...---

Some ideas to embody DAOIST principles
Tech Basics: Use GPS for hyper-local (1-5km) feeds; cap daily posts to enforce frugality. - ​ (By ZipCode sounds like a better idea ), I like daily post caps. but allow comments and messages with no limits.

Launch MVP: Test in Chesterfield, VA, with your LLC, focusing on picture posts + Flow prompts. - hmm maybe. we already enforce pictures and have no filters.

Growth: Partner with kindness apps for cross-promos, avoiding VC greed. Measure success by real-world meetups, not DAUs.​ - Kindess Apps? maybe build my own kindness elements into this one? what does Personal Grown social network look like?


## HUMAN ROLE (DEPLOYMENT TO QA)
(BACKUP MONGODB Databases for QA and PROD)
Verify Heroku CLI installed (heroku --version)
Connect GitHub to Heroku apps via Dashboard
Upload environment variables to both dynos
Run database migration scripts via Heroku CLI
Trigger deployments
Verify everything works