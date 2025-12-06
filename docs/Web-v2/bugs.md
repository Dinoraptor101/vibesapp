# KNOWN BUGS

## Location Prompt Cache Issue
Location is requested every time the app is loaded. The app should attempt to obtain location from cache first, then from the database, and only prompt the user if both attempts fail.
**Reported:** 2 days ago

## Location Prompt After Submission
Location is still being prompted even when it has already been submitted. Create a method to get location by cache, fallback on database, do not prompt user for location outside of the location component during signup or when user updates location in the Settings -> Account page.
**Reported:** 6 hours ago

## Loading Indicator Enhancement Needed
Loading indicator on first load should be enhanced for better user experience.
Use our company logo and rotate it slowly (very slowly) clock-wise, with a shadow backdrop.
**Reported:** 5 hours ago

## Settings Pages Bottom Padding Overlap
Settings pages are covered by bottom padding, making content inaccessible.
(This is similar to the issue we had and fixed in Activities and Post Details page. See how these pages handle it and apply the same solution to the Settings page.)
**Reported:** 5 hours ago

## Messages Page Padding Issue
The Messages page, specifically the conversations list and requests, experience excessive padding on the sides (conversation boxes appear ~50px narrower than they should be, inconsistent with UserProfile Posts and Create Posts standards).
Same as the bug above (Mobile horizontal padding inconsistency)
**Reported:** 5 hours ago

## Settings Pages Mobile Padding Problem
Settings pages have the mobile view padding problem, inconsistent with other pages.
Same as above two bugs
**Reported:** 5 hours ago

## Show Recent Button Clipping in Messages
"Show recent" button in messages is clipping at the top due to iPhone's notch/status bar overlay in Mobile/Kiosk mode.
**Reported:** 4 minutes ago



-----
# COULD NOT REPRODUCE

## Activity Page Scrollable When Empty ( could not reproduce, possibly a bug in kiosk ios mode ? )
When the Activity page is empty, the min-height is still longer than the mobile vertical viewport, making the empty page unnecessarily scrollable, which is unexpected.
**Reported:** Just now

## Mobile Horizontal Padding Inconsistency ( could not reproduce on desktop, is this iOS Kiosk mode only? )
Mobile view horizontal padding was fixed for posts in UserProfile page but the same standards were not applied to PostFeed (Homepage, Nearby, Following) and PostDetailPage. This affects only Mobile View. Like Bluesky, the distance between the image/post cards and the side of the screen should be minimal.
**Reported:** 5 hours ago


## PolarityStep should default to neutral state and next button disabled
Similar to SexStep. we need a neutral circle state, with disabled button. encouraging users to make a choice rather than pressing the next button subconciously.

## Show Recent hides the Unread
Show recent should only show read activities
unread activities should be displayed immeidately.
once marked as read should disappear into show Recent.