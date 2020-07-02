## Too-Much-Time

> The information provided herein is the same information available within the extension's 'Informational' pop-up panel.

---

### #1 - Overview

*Too-Much-Time is a simple browser extension that allows you to 'time' the time you spend on certain websites.*

> When the time you specify is up, you'll get an alert offering you the opportunity to stop or snooze.

> To use, you'll simply provide a portion of the URL (domain) you'd like to time your time on.

Situational Examples:
  - If you find you've been spending a little more time than you would prefer on your favorite social networking site.
  - Or perhaps you'd like to time your shopping on your favorite eCommerce site.
  - Perhaps you'd like to time your efforts spent researching through an informational site.
  - Or put in 'just enough' reading on a particular reading site before bed.

The intent of this extension was to be an annoyance to help get you (okay, me) off websites that you (*I) spend a tad too much time on.

Available on 'Chromium-based browsers'* such as Microsoft Edge, Brave, Opera, Vivaldi, Comodo Dragon, etc.

*Chromium-based Browser References:
- https://en.wikipedia.org/wiki/Chromium_(web_browser)#Active
- https://www.quora.com/Can-Chrome-extensions-be-used-in-other-web-browsers-How

### #2 - Instructions

Steps to Use (after installing):

  1.  Click the extension's icon in the browser's toolbar.
  2.  On the pop-up page, enter the portion of a URL you would like to match and time.
  3.  Enter how long [in minutes] you would like to be on that site, before you are alerted (delay).
  4.  Enter how long [in minutes] you would like to continue being on that site after the initial timer has expired (snooze).
  5.  Click the Save button.
  6.  Note: The Alarm Type named "alerts" is a part of a future feature. That is, "alerts" is the only notification type available at this time.

> If you are already on a matched site when adding new URL info, the timer will start immediately. If not, the timer will start when you navigate to a URL that matches the partial URL entered.

> Side Note: You can only have one "active" browser tab "active" at any one time, ergo, you will only have one possible timer going at any given time.

*When a timer is active:*

**>** So long as you stay on one tab, and so long as you stay **within the same matched URL string**, the timer will continue to count down per that matched URL info's settings (i.e. its delay and snooze settings).

**Navigating to another site, another tab, or closing another tab, could all affect (stop or restart) an active timer.**

**>** When your preset number of minutes has expired, the browser will throw up an "Alert" dialog box. More specifically, it's a "Confirm" dialog box, in which you can opt to 'snooze,' and continue browsing the currently matched URL, or you can click OK to "end the madness!!"

*The rules for "Stopping the madness!!" are as follows:*

  Note: This is a likely location for some unaccounted for edge cases (i.e. bugs).

  1. If only one tab is open (the tab you're timing), we'll open a new blank tab.
  2. Or if there is more than one tab open, we'll switch to the first tab---if it is not already
  3. the currently active tab. If it is, we'll instead activate the second tab.

  - _Note:_ If a 'matched page' occupies tab #1 or tab #2, a timer will be started for that matched page.

### #3 - Disclaimer (aka, 'edge cases' suck)

The "disclaimer" would be that, at least for the initial versions of the app, **there can be various edge cases unaccounted for.** I did a LOT of testing, but there were multiple layered factors that went into various coding decision points.

[2020-07-01 Update] - Some major bug fixes have helped with tab and app focus and navigation, with a mindset for only creating an alarm on 'an initial visit' of a 'matching and active page'. However, navigational bugs may still exist.

### #4 - Important Storage FAQs

The 'storage' that your URL info list is stored on is inside the browser and is only available if the browser supports the 'chrome.storage.sync' API.

> **DO NOT save sensitive info in this app!!** The provided storage is not encrypted.

Your list should be considered as 'vulnerable and **susceptible to deletion**.' For instance, **if you uninstall your browser with sync turned off, or, or, or... in some manner of speaking, you just may not be able to get your list back.** Ergo, it is **strongly encouraged** to export your data often!

The storage pertains only to the browser you're using (unless your Chrome account is synced).

### #5 - Important Reminder

Due to the URL info list being stored inside your browser, it is strongly advised to...

**Export your list!!**

  - Especially after adding or editing items.

#### To backup a list (export)

1.  Open the List Options menu.
2.  Click the "Export All" button.
3.  The app will either save the file, or prompt you for a location and filename.

#### To restore a list

1.  Open the file you backed up (exported) in any text editor, such as Notepad.
2.  Select and copy the entire contents of the file to your clipboard, including the square brackets `[]`
3.  Open the List Options menu.
4.  Click the "Import Items" button.
5.  Paste that into the provided textarea box.
6.  Click the "Import JSON" button.
7.  The app will then import each URL item individually, and will provide an import progress status bar during the import process.

### #6 - App History

- This extension was a personal project to accomplish something during—and break the monotony of—my mobile app development learning curve.

- Tue 06/23

  - @12:16 PM - Initial Concept

    - - Created twitter-timer folder.

  - @12:38 PM - Extension Name Thought Process

    - Site Timer
    - Teaser Timer
    - Pomodoro Full Stop
    - Full Stop
    - Halt (or I'll say halt again)
    - Snooze It or Stop It
    - Go Away!
    - > Too Much Time --- TMT

- Wed 06/24

  - @3:15 AM - Formalized

    - - Too-Much-Time

- Sat 06/27

  - @11:21 PM - End of Functional Coding (4.5 days)

    - - Turned off timer on kdcinfo.com (didn't know it was on).
      - After about 8 click thoughts, it switched over to the google tab and started a new timer.
      - I switched it back to kdcinfo, opened the extension, and clicked the Clear Active Timer button.
      - It never went back on. The delete button functionality was the final fix.

- Sun 06/28

  - @12:16 PM - End of Coding (3rd Chrome Extension: 5 days)

    - - Code Cleanup
      - Cleaned up aesthetics with overall scrolling and scrollbars, some slight table cell alignments, and footer adjustments.
      - Went through coding comments for public distribution (e.g. cleaning up console logs and improving legibility).
      - Prep code for publishing to Chrome store.

  - Spent the rest of Sunday going over each file's contents for public exposure, and completing the write-up of this entire informational.

- Although I was really hoping to have this quite simplistic concept developed in one day, at the end, even two days would have been surreal. But in the end, I'm pleased with what the simple concept of trying to limit my time on Twitter became.

- Some causes for development duration include:

  - Business decisions during development
  - Having to create the assets.
  - Details, details, and more details. E.g., What to do when changing tabs. How to handle the extension's pop-up being open. An approach for handling multiple URLs. How to handle overlapping (queued) confirm dialog boxes (this was a doozy!)

### #7 - Known Issues

- If you 'miss' clicking OK or Cancel on three or more confirms,
  the extension's icon stops counting after the first two increments.
  If your last click was Cancel, the next Cancel will increment the counter normally again.

- I ran across an intermittent issue in which, navigating to a 'matched page' did not start the timer as expected.

  > Double check the URL should indeed be a match, and that it is indeed active.

  If you find a timer will not start on a page it should, and these items are in order, and if you can recreate it, please send me the steps to recreate it via the issues tab in GitHub.

  *To fix the issue*, you can just go to the timed page, open the extension's popup, then deactivate and reactive the affected URL. Refreshing the page may also trigger the timer.

  However! I'm actually hoping to never see the issue again as I've applied numerous proactive fixes. <code>:)</code>

- In the Vivaldi browser, alerts do not work. You will only see the badge icon counter increment.
  This is unfortunate being this is the browser I use to peruse Twitter. @TODO: :)

#### Open Source

As with my first two Chrome extensions, the code is open source and available on GitHub.
If you come across a bug, feel free to look at the code, and see if you can find a fix.
I'm also open to Pull Requests and possibly even contributors.

### #8 - Contact / Support

If you have a bug or feature request, please feel free to [submit a new issue on GitHub](https://github.com/KDCinfo/too-much-time/issues). Feel free to [submit Pull Requests](https://github.com/KDCinfo/too-much-time/pulls) for consideration as well.If you need to contact me directly, you can use [the contact form on my portfolio site](https://kdcinfo.com/?contact).

### Ancillary and Miscellaneous

*Chrome Web Store Listing Information*

Too-Much-Time is a simple browser extension that allows you to 'time' the time you spend on certain websites.

> When the time you specify is up, you'll get an alert offering you the opportunity to stop or snooze.
> To use, you'll simply provide a portion of the URL (domain) you'd like to time your time on.

Situational Examples:
  - If you find you've been spending a little more time than you would prefer on your favorite social networking site.
  - Or perhaps you'd like to time your shopping on your favorite eCommerce site.
  - Perhaps you'd like to time your efforts spent researching through an informational site.
  - Or put in 'just enough' reading on a particular reading site before bed.

The intent of this extension was to be an annoyance to help get you (okay, me) off websites that you (*I) spend a tad too much time on.

Available on 'Chromium-based browsers'* such as Microsoft Edge, Brave, Opera, Vivaldi, Comodo Dragon, etc.

> Chromium-based Browser References:

  - https://en.wikipedia.org/wiki/Chromium_(web_browser)#Active
  - https://www.quora.com/Can-Chrome-extensions-be-used-in-other-web-browsers-How

---

> Storage

Storage is used to store a list of the user's extension information (partial URL names and their individual settings). That stored information is used to determine if an alarm should be set for a matched page, or not.

> Alarms

When a user's current page matches an item in the user's storage list, an alarm is set according to the settings that the user set for that item.

> Tabs

Detection of switching between tabs and other tab activity allows storage to be updated as well as for alarms to be stopped or started.

> Host permission

When a page is first hit*, the background script grabs the URL from the content script. A user has the ability to match any URL they visit. And for any matched page, an alarm will be set for that matched host.
*On initial page load, for `onUpdated`: `changeInfo.url` wasn't available, so a `sendMessage` is sent to the content script requesting the `location.href` be sent back for matching. Otherwise, the URL is retrieved from: `chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // tabs[0].url }`

---

Other random app thoughts ...

> Mind your time on sites.

> Pausing this will get on your nerves, but that's it's purpose.

- Provides for unlimited 1 to 60-minute snoozes.
