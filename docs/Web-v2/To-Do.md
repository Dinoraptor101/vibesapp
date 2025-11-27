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




BUGS
- Logout button is behind the Nav Bar in mobile view (Settings -> Account )

On Logout clear all cached indexDB. so new user logging in fetch new content and data on login 


We need to fix the backend to require images for Post Create API endpoint (this avoids creation of posts without images via API or while creating data for test automation)