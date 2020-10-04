## Too-Much-Time

> A productivity-based browser extension.

The information provided on this page is the TMT project's source of truth.

In addition to providing the same information available within the extension's 'Informational' pop-up panel, it also provides a list of known issues, version history, and @TODOs, making it the project's most inclusive resource.

---

### #1 - Overview

*Too-Much-Time is a simple browser extension that allows you to 'time' the time you spend on certain websites.*

> When the time you specify is up, you'll get an alert offering you the opportunity to stop or snooze.

Situational Examples:
  - If you find you've been spending a little more time than you would prefer on your favorite social networking site.
  - Or perhaps you'd like to time your shopping on your favorite shopping site.

The intent of this extension was to be an annoyance to help get you (okay, me) off websites that you (*I) spend a tad too much time on.

### #2 - Installation

  - From within your favorite browser^, navigate to the [Chrome Web Store](https://chrome.google.com/webstore/detail/too-much-time/okogpcjdmbagmocinoialgklbbjalbfn?hl=en&authuser=0) and click the "Add to Browser" button.

**Chrome Browser Note:** As of July 2020, after installing a browser extension, the Chrome Browser **hides the extension icon by default**.

  - In order to see the badge counter and badge colors on the extension's icon in the Chrome browser, after installing, you will need to:

  1. Open the Chrome extension panel (click the puzzle piece icon on the toolbar),
  2. Find the TMT extension, and
  3. Click the pin icon.

**^Browser Compatibility:** Although there can be some nuances (and bugs), browser extensions available from the Chrome Web Store are also available for other [Chromium-based browsers][1] such as Microsoft Edge, Brave, Opera, Vivaldi, Comodo Dragon, etc.

### #3 - Usage Instructions

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

### #4 - Disclaimer (aka, 'edge cases' suck)

The "disclaimer" would be that, at least for the initial versions of the app, **there can be various edge cases unaccounted for.** I did a LOT of testing, but there were multiple layered factors that went into various coding decision points.

[2020-07-01 Update] - Some major bug fixes have helped with tab and app focus and navigation, with a mindset for only creating an alarm on 'an initial visit' of a 'matching and active page'. However, navigational bugs may still exist.

### #5 - Important Storage FAQs

The 'storage' that your URL info list is stored on is inside the browser and is only available if the browser supports the 'chrome.storage.sync' API.

> **DO NOT save sensitive info in this app!!** The provided storage is not encrypted.

Your list should be considered as 'vulnerable and **susceptible to deletion**.' For instance, **if you uninstall your browser with sync turned off, or, or, or... in some manner of speaking, you just may not be able to get your list back.** Ergo, it is **strongly encouraged** to export your data often!

The storage pertains only to the browser you're using (unless your Chrome account is synced).

### #6 - Important Reminder

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

### #7 - App History

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

### #8 - Known Issues

- This browser extension **requires access to localStorage**. By default all browser's support this. However, if you or an admin on your system have made changes to the browser settings, in which local storage is not enabled, the extension will not work. There are currently no thoughts for determining a workaround as all browsers support this functionality by default.

- If you find your browser is unresponsive in some ways, such as copy/paste not working, you may have clicked outside a browser's timed tab, and that tab's timer has gone off (perhaps even more than once). Check to see if you have a timer alarm (an "Ok/Cancel" confirm dialog box) that went off from the last page you were on. While the confirm dialog box is open, it can adversely affect the browser's normal operations. If this becomes a problem, we can look to implement desktop notifications as an option, and/or possibly make that the default option.

- Some Chromium-based browsers (e.g. Vivaldi) do not support the use of (alert|confirm) dialog boxes when sent from an extension's background script. @TODO: Desktop Notifications appear to be the most viable alternative.

This in mind, in some browsers, the confirm alerts do not work: You will only see the badge icon counter increment, and the badge icon's color should turn a dark red.

- If you 'miss' clicking OK or Cancel on three or more confirms, the extension's icon stops counting after the first two increments. If your last click was Cancel, the next Cancel will increment the counter normally again.

- If you find a timer will not start on a page it should, and the timer is indeed active, AND if you can recreate it, please send me the steps to recreate it via the issues tab in GitHub.

  *To try to fix the issue*; try going to another tab, and then returning to the tab expected to start a timer.

### #9 - Contact / Support

If you have a bug or feature request, please feel free to [submit a new issue on GitHub](https://github.com/KDCinfo/too-much-time/issues). Feel free to [submit Pull Requests](https://github.com/KDCinfo/too-much-time/pulls) for consideration as well.If you need to contact me directly, you can use [the contact form on my portfolio site](https://kdcinfo.com/?contact).

### #10 - Open Source

As with my first two Chrome extensions, the code is open source and available on GitHub.
If you come across a bug, feel free to look at the code, and see if you can find a fix.
I'm also open to Pull Requests and possibly even contributors.

### #11 - Ancillary and Miscellaneous

*Chrome Web Store Permissions Information*

> Storage

Storage is used to store a list of the user's extension information (partial URL names and their individual settings). That stored information is used to determine if an alarm should be set for a matched page, or not.

> Alarms

When a user's current page matches an item in the user's storage list, an alarm is set according to the settings that the user set for that item.

> Tabs

Detection of switching between tabs and other tab activity allows storage to be updated as well as for alarms to be stopped or started.

> Host permission

When a page is first hit*, the background script grabs the URL from the content script. A user has the ability to match any URL they visit. And for any matched page, an alarm will be set for that matched host.
*On initial page load, for `onUpdated`: `changeInfo.url` wasn't available, so a `sendMessage` is sent to the content script requesting the `location.href` be sent back for matching. Otherwise, the URL is retrieved from: `chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // tabs[0].url }`

### #12 - Version History

> 0.0.1 - 0.0.7

- Initial launch: Versions were for manifest and Chrome store configuration adjustments.

> 0.0.8

- Fixed major issue with timer resetting when browser regained focus from another app; both for 'already open' and 'new' timed pages.
  - A detailed breakdown for these two issues can be found on [Google Groups](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/2Qr1aFfWoj4).
- Fixed issue with some browsers not reapplying the badge color; leaving it on the default, orange.
- Turned off background console logs (oops).

> 0.0.9 - 2020-07-16

- Previous fix turned out to be more of a band-aid: Had to apply a splint.

  After posting in the [Chromium Extensions](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/2Qr1aFfWoj4) Google Group (per ^^^ above) about the previous issues not being present when the Background Page DevTools are open, I learned I needed to understand how persistence works with Background Pages.

  That one fundamental observation allowed me to see that both the `inFocus` and `lastMatch` variables were merely temporary, as I was attempting to set these as global variables in a script that doesn't hold state.

  Ergo, unless `persistence` is set to `true` in the manifest, variables defined in the Background Script cannot be 'global', and setting persistence to true is not encouraged (unless using the `webRequest` API).

  One approach for storing state accessible to the Background Script---being there are only two variables used in limited fashion---is to use HTML5's `window.localStorage`. Once applied, it also appeared to fix a newfound issue---simply refreshing the page was also resetting the timer.

  I'm hopeful this fix is a keeper. :-)

> 0.0.10 - 2020-07-17

- Previous fix turned out to be solid, but only partial. 10th time is a charm.

  As was done previously with the two primary navigational variables (`inFocus` and `lastMatch`), the remaining variables in the Background Page script have also been swapped out with `localStorage`.

- As an added bonus, the badge icon now also changes to a dark red color if the madness isn't stopped (i.e. the Cancel button is clicked).

- These FAQs have been added and updated (instructions, known issues, and version history).

- The TMT [https://kdcinfo.com/app/tmt/](landing page) was generic'd down. Removed a triple copy of these FAQs---now just providing an overview and a link to the Chrome Store or back here to GitHub.

> 0.0.11 - 2020-09-23

- Removed two `console.log`s.

### #13 - @TODO:

- Make it optional to stop the timer when the browser loses focus.

- Make color of icon alerts customizable.

Optional items would be done in the extension's pop-up page.

> Technical Approach Thoughts

  - From the pop-up script, an onMessage can be sent to the background script to set the preferences in localStorage alongside their 'arrayToMatchFromStorage' and 'mapFromStorage' equivalents.
  - Then pop-up would send a request to the background script to 'get' the values for display in the pop-up options.
  - I believe the localStorage differs between pop-up and background scripts.
  - Maybe can use `sync`, but might be overboard. Messaging isn't difficult; just might want to better document the key entry points.
Free Countdown Timer for Your Website
Our free countdown timer is an accurate timer that you can use for your website or blog. It can help you count down to any special event, such as a birthday or anniversary. There are many ways for you personalize your own countdown timer, simply by filling out the gray form below on this page.

We also have Free Clocks available for your website or blog.

Main Features
Our free countdown timer is also referred to as a countdown clock. Here are some reasons why people use our countdown timer:

The countdown is accurate — the clocks display current time, even if the user's computer clock is wrong.
You have choices regarding DST — there are different options on how to deal with daylight saving time (DST) with regard to your countdown timer. Read more about the countdown timer and DST.
The countdown takes into account any time zone — all the major time zones are supported.
It is highly configurable — choose different backgrounds, text options, colors and fonts.
You can choose units to display — from days to milliseconds.
No registration is needed — the HTML code is available immediately.
Use the form below to customize your own countdown timer. A small preview window at the bottom right corner of your web page should also appear next to the form.

You may place up to six clocks and countdown timers on a single page. If more than two clocks/timers are used, a separate link to timeanddate.com should be provided on the page. To use the service you must be able to add HTML directly to your web page and IFRAME tags must be allowed.


### #14 - References

> `*`Chromium-based Browser References:

 ➡  https://en.wikipedia.org/wiki/Chromium_(web_browser)#Active
 ➡ https://www.quora.com/Can-Chrome-extensions-be-used-in-other-web-browsers-How

---

[1]: https://en.wikipedia.org/wiki/Chromium_(web_browser)#Active
