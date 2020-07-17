/**
 * Too-Much-Time - Background Script Page
 *
 * The 'background script' part of this extension will listen for
 * messages from the content script (for creating alarms), listen
 * for those alarms, and update the extension's icon (badge text)
 * when needed. It also handles chrome.storage / data management.
 *
 * Developer: Keith D Commiskey (https://kdcinfo.com) --- 2020-06
 *
 */

chrome.browserAction.setBadgeBackgroundColor({color: 'orange'});

let showConsoleLogs = false;
// let showConsoleLogs = true;

if (showConsoleLogs) { console.clear(); }

  const arrayToMatchFromStorage = [], // ['twitter.com', '//google.com', '//www.google.com']
        mapFromStorage = new Map([]);

        // mapFromStorage = new Map([
        //   ['twitter.com', {id: 0, url: '//twitter.com', active: 1, delay: 5, snooze: 2, alarmType: 'alerts'}],
        //   ['//google.com', {id: 1, url: '//google.com', active: 1, delay: 2, snooze: 2, alarmType: 'none'}],
        //   ['//www.google.com', {id: 2, url: '//google.com', active: 1, delay: 1, snooze: 1, alarmType: 'alerts'}]
        // ]);

  const badgeWatchColor = [10, 10, 240, 255],
        badgeWatchText = 'O_O',
        badgeSleepColor = [0, 220, 0, 255],
        // badgeSleepText = '~.~';
        badgeSleepText = '';

  var inFocus = true, // Global boolean to keep track of window state.
      lastMatch = '';

  try {
    if ('localStorage' in window && window['localStorage'] !== null) {
      localStorage["inFocus"] = 'true'; // Chrome does not have focus
      localStorage["lastMatch"] = ''; // Chrome does not have focus
    }
  } catch (e) {
    inFocus = true; // Chrome does not have focus
    lastMatch = '';
  }

chrome.runtime.onInstalled.addListener(function() {

  syncData('onInstalled').then(syncResponse => {
    checkAndSetTimer('runtime.onInstalled');
    // @TODO: Need an error management messaging system

    // if (syncResponse === false) { console.error('Error: Sync Initialization'); }
  }); // Initialize extension data with storage.

});

  // URL Page Loads and Refreshes - ON URL CHANGE - Trigger URL check and alarm creation.
  //
  // Many thanks to: https://stackoverflow.com/questions/34957319/how-to-listen-for-url-change-with-chrome-extension

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (showConsoleLogs) { console.log('[1c] onUpdated -> sendMessage [changeInfo.status]', changeInfo); }

    // changeInfo object: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated#changeInfo
    //
    if (changeInfo.status === 'complete') {

      // chrome.runtime.sendMessage(tabId, { // Used to send messages to the extension page.
      chrome.tabs.sendMessage(tabId, { //    // Used to send messages to the content script.
        message: 'TabUpdated'
        // , url: changeInfo.url // undefined
        // changeInfo: { status: "complete" }
      });
    }
  })

  // Changing Tabs

  chrome.tabs.onActivated.addListener(function (activeInfo) {

    if (showConsoleLogs) { console.log('[1a] onActivated -> checkAndSetTimer [activeInfo]', activeInfo); }

    // checkAndSetTimer('runtime.onInstalled');

    //  /\ Gonna try to sync data during 'onActivated' due to intermittent issues with validateUrl not matching.
    //  |
    // \/  Happens sometimes when you click on a tab that should be timed, but an alarm isn't set.
    //
    //     Have seen at least three times, but only once with logs turned on (which is how
    //     I know it's the validateUrl; and added logs to see the comparison array and map,
    //     because the compareTo Url was correct, so wondering if the data somehow
    //     wasn't populated maybe?), but haven't been able to recreate hence.

    // The issue may also not be recreateable whilst the background Dev Tools is open, or while
    // console.logging is taking place, as, if there is a race condition somewhere, these could be
    // injecting enough asynchronicity for the issue to pass (like adding a setTimeout(()=>{},0)).

    syncData('onActivated').then(syncResponse => {
      // @TODO: Need an error management messaging system

      checkAndSetTimer('runtime.onInstalled');

      // if (syncResponse === false) { console.error('Error: Sync Initialization'); }
    }); // Initialize extension data with storage.

  })

  // Changing Application Windows
  //
  // Many thanks to: https://stackoverflow.com/questions/2574204/detect-browser-focus-out-of-focus-via-google-chrome-extension

  chrome.windows.onFocusChanged.addListener( function(window) {

    if (showConsoleLogs) { console.log('[1b1] onFocusChanged -> [inFocus] [window]', inFocus, window); }
    if (showConsoleLogs) { console.log('[1b2] onFocusChanged -> [chrome.windows]', chrome.windows); }

    // Cannot try to stop timer onFocusChanged because it doesn't always
    // fire as expected. And in doing this, the timer stops when opening
    // the popup, and sometimes when opening the right-click context menu.

    // In other cases, 'onFocusChanged' IS NEVER HIT.
    //
    //   So unreliable!! (...or maybe just misunderstood. Misnomer perhaps?)
    //
    // deleteAllTimers().then(resp => {
    //   lastMatch = '';
    //   setBadge(badgeSleepColor, badgeSleepText);   // No match; Not timed. Shows the default icon.
    // });

    // I don't understand 'onFocusChanged' deep enough for it to be reliable.
    // So focusing additionally on lastMatch logic inside the checkAndSetTimer function.

    try {
      // return 'localStorage' in window && window['localStorage'] !== null;
      if ('localStorage' in window && window['localStorage'] !== null) {
        if (window == chrome.windows.WINDOW_ID_NONE) {
          localStorage["inFocus"] = 'false'; // Chrome does not have focus
        } else {
          if (JSON.parse(localStorage["inFocus"])) { // Magic Solution to not resetting the timer when the same tab is refocused !!!
            checkAndSetTimer('windows.onFocusChanged inside Else > If -> inFocus');
          }
          localStorage["inFocus"] = 'true';
        }
      } else {
        if (window == chrome.windows.WINDOW_ID_NONE) {
          inFocus = false; // Chrome does not have focus
        } else {
          if (inFocus) { // Magic Solution to not resetting the timer when the same tab is refocused !!!
            checkAndSetTimer('windows.onFocusChanged inside Else > If -> inFocus');
          }
          inFocus = true;
        }
      }
    } catch (e) {
      if (window == chrome.windows.WINDOW_ID_NONE) {
        inFocus = false; // Chrome does not have focus
      } else {
        if (inFocus) { // Magic Solution to not resetting the timer when the same tab is refocused !!!
          checkAndSetTimer('windows.onFocusChanged inside Else > If -> inFocus');
        }
        inFocus = true;
      }
    }
  });

  // Closing Tabs

  chrome.tabs.onRemoved.addListener(function() {
    // @TODO: Closing a random tab---that you're not
    // actively on which is being timed---will remove
    // that active timer for the tab you're currenly on.
    // deleteAllTimers().then(response => {
    //   // console.log('onRemoved deleteAllTimers() complete.');
    // });
    if (showConsoleLogs) { console.log('[1d] onRemoved -> checkAndSetTimer'); }

    checkAndSetTimer('tabs.onRemoved');
  })

/**
 * ALARM MANAGEMENT
 *
 */

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

  // A message sent from [content.js] triggers an alarm to be created or removed.

  if (request.action === 'checkURL') {

    let urlItem = validateUrl(request.url);
    //  urlItem = false || { id: 0, url: '//twitter.com', active: 1, delay: 5, snooze: 2, alarmType: 'alerts' }

    let thisMatch = lastMatch;
    try {
      if ('localStorage' in window && window['localStorage'] !== null) {
        thisMatch = localStorage["lastMatch"];
      }
    } catch (e) {
      thisMatch = lastMatch;
    }

    if (urlItem === false || urlItem.title !== thisMatch) {

      deleteAllTimers().then(resp => {
        if (urlItem !== false) {

          lastMatch = urlItem.title;
          try {
            if ('localStorage' in window && window['localStorage'] !== null) {
              localStorage["lastMatch"] = urlItem.title;
            }
          } catch (e) {
            lastMatch = urlItem.title;
          }

          if (urlItem.active) {
            setBadge(badgeWatchColor, badgeWatchText);
            // setBadge(badgeWatchColor, urlItem.delay + '_' + urlItem.snooze);
            // ^^^ Badge only allows 4 chars.     ^^^ Delay and snooze ^^^ can both be 2 digits.
            createTimer(urlItem).then(response => {
              if (showConsoleLogs) { console.log('createTimer: ' + response); }
            });
          } else {
            setBadge(badgeSleepColor, badgeSleepText); // Matched, but Inactive. @TODO: Maybe change badge text.
          }
        } else {
          lastMatch = '';
          try {
            if ('localStorage' in window && window['localStorage'] !== null) {
              localStorage["lastMatch"] = '';
            }
          } catch (e) {
            lastMatch = '';
          }
          setBadge(badgeSleepColor, badgeSleepText);   // No match; Not timed. Shows the default icon.
        }
        sendResponse({urlItem: urlItem});
      });

    } else {
      // We're on the same matching URL; let the timer run; do nothing.
      sendResponse({urlItem: urlItem});
    }

  } else if (request.action === 'formSave') {

    syncData('onMessage formSave').then(syncResponse => {

      if (showConsoleLogs) { console.log('onMessage -> formSave -> syncData', syncResponse); }

      let syncDataMsg;
      if (syncResponse === false) {
        syncDataMsg = false;
      } else {
        syncDataMsg = "Good 'post-storage.set' live data update.";

        lastMatch = ''; // We're in the popup; A save terminates the lastMatch protocol.
        try {
          if ('localStorage' in window && window['localStorage'] !== null) {
            localStorage["lastMatch"] = '';
          }
        } catch (e) {
          lastMatch = '';
        }

        checkAndSetTimer('request.action === formSave');
      }
      sendResponse({status: syncDataMsg});
    });

  } else if (request.action === 'clear') {

    deleteAllTimers().then(response => {

      if (showConsoleLogs) { console.log('onMessage -> clear -> deleteAllTimers', response); }

      syncData('onMessage formSave').then(syncResponse => {
        let syncDataMsg;
        if (syncResponse === false) {
          syncDataMsg = false;
        } else {
          syncDataMsg = "Good Clear.";
          checkAndSetTimer('request.action === clear');
        }
        sendResponse({status: syncDataMsg});
      });
    }); // true|false
    // deleteTimer(request.itemId).then(response => console.log('deleteTimer: ' + response)); // true|false
  }

  sendResponse({request: request});
});

function setBadge(thisColor, thisText) {
  chrome.browserAction.setBadgeBackgroundColor({color: thisColor}); // Callback is optional.
  chrome.browserAction.setBadgeText({text: thisText});
}

function validateUrl(urlToCheck) {

  // urlToCheck = 'https://kdcinfo.com';

  // const arrayToMatchFromStorage = [
  //   'twitter.com',
  //   '//google.com',
  //   '//www.google.com'
  // ];
  //
  // const mapFromStorage = new Map([
  //   ['twitter.com', {id: 0, url: '//twitter.com', active: 1, delay: 5, snooze: 2, alarmType: 'alerts'}],
  //   ['//google.com', {id: 1, url: '//google.com', active: 1, delay: 2, snooze: 2, alarmType: 'none'}],
  //   ['//www.google.com', {id: 2, url: '//google.com', active: 1, delay: 1, snooze: 1, alarmType: 'alerts'}]
  // ]);

  if (showConsoleLogs) { console.log('|| arrayToMatchFromStorage | mapFromStorage ||'); }
  if (showConsoleLogs) { console.log(arrayToMatchFromStorage, mapFromStorage); }
  if (showConsoleLogs) { console.log('|| _______________________ | ______________ ||'); }
  let foundItemUrl = arrayToMatchFromStorage.find(url => {
    if (showConsoleLogs) { console.log('... ... find [url]', url); }
    return urlToCheck.includes(url);
  });

  if (showConsoleLogs) { console.log('foundItemUrl', urlToCheck, foundItemUrl); }

  if (foundItemUrl !== undefined && foundItemUrl !== 'chrome') {

    // ^^^ Brave returns: 'chrome' | Chrome, Opera, Vivaldi return: undefined

    let foundItem = mapFromStorage.get(foundItemUrl);
    if (foundItemUrl) {
      return foundItem; // Item ID: 0, 1, 2...
    } else {
      return false;
      // return `Error: No such URL found in Map. [${urlToCheck}]`;
    }
  } else {
    return false;
    // return `Error: No such URL found in Array. [${urlToCheck}]`;
  }
}

function createTimer(tmtItem) { // async / returns a Promise
  // tmtItem = { id: 0, url: '//twitter.com', active: 1, delay: 5, snooze: 2, alarmType: 'alerts' }

  const alarmId = "tmt-" + tmtItem.id;

  return new Promise((resolve, reject) => {
    if (tmtItem.active) {
      if (isGood('chrome') && isGood('chrome.alarms')) {
        try {
          // chrome.browserAction.setBadgeText({text: badgeWatchText });
          setBadge(badgeWatchColor, badgeWatchText);
          chrome.alarms.create(alarmId, {delayInMinutes: tmtItem.delay, periodInMinutes: tmtItem.snooze});
          resolve(alarmId);
        } catch(e) {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    } else {
      resolve(false);
    }
  });
}

function deleteTimer(timeId) {

  let alarmId = timeId; // Stored ID (alarm.name) is full string, not just the ID number.
  // let alarmId = "tmt-" + timeId;

  return new Promise((resolve, reject) => {
    if (isGood('chrome') && isGood('chrome.alarms')) {
      try {
        chrome.alarms.clear(alarmId, (wasCleared) => {
          if (wasCleared) {
            // chrome.browserAction.setBadgeText({text: '' });
            setBadge(badgeSleepColor, '');
          }
          resolve(wasCleared); // wasCleared: true|false
        });
      } catch(e) {
        resolve(false);
      }
    } else {
      resolve(false);
    }
  });
}

function deleteAllTimers() {

  return new Promise((resolve, reject) => {
    if (isGood('chrome') && isGood('chrome.alarms')) {
      try {
        chrome.alarms.clearAll((wasCleared) => {
          if (wasCleared) {
            // chrome.browserAction.setBadgeText({text: '' });
            setBadge(badgeSleepColor, '');
          }
          resolve(wasCleared); // wasCleared: true|false
        });
      } catch(e) {
        resolve(false);
      }
    } else {
      resolve(false);
    }
  });
}

function checkAndSetTimer(src = '') {

  if (showConsoleLogs) { console.log('[2] ___: checkAndSetTimer', src); }

  try {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

       // https://stackoverflow.com/questions/6132018/how-can-i-get-the-current-tab-url-for-chrome-extension
       // Since only one tab should be active and in the current window
       // at once, the return variable should only have one entry.
       // var activeTab = tabs[0];
       // var activeTabId = activeTab.id; // or do whatever you need

      if (showConsoleLogs) { console.log('[2_] ___: query tabs', tabs); }

      if (tabs.length > 0) {

        const currentUrl = tabs[0].url;
        // currentTabId = tabs[0].id;

        let urlItem = validateUrl(currentUrl);
        //  urlItem = false || { id: 0, url: '//twitter.com', active: 1, delay: 5, snooze: 2, alarmType: 'alerts' }

        let thisMatch = lastMatch;
        try {
          if ('localStorage' in window && window['localStorage'] !== null) {
            thisMatch = localStorage["lastMatch"];
          }
        } catch (err) {
          thisMatch = lastMatch;
        }

        // if (urlItem === false || urlItem.title !== lastMatch) { // .title .url
        if (urlItem === false || urlItem.title !== thisMatch) { // .title .url

          if (showConsoleLogs) { console.log('[2aa] New Page; or Not Old Page; Delete Timer; Try to create'); }
          if (showConsoleLogs) { console.log('[2ab]', currentUrl, urlItem, lastMatch); }

          deleteAllTimers().then(resp => {
            if (urlItem !== false) {

              lastMatch = urlItem.title;
              try {
                if ('localStorage' in window && window['localStorage'] !== null) {
                  localStorage["lastMatch"] = urlItem.title;
                }
              } catch (e) {
                lastMatch = urlItem.title;
              }

              if (urlItem.active) {

                setBadge(badgeWatchColor, badgeWatchText);
                // setBadge(badgeWatchColor, urlItem.delay + '_' + urlItem.snooze);
                // ^^^ Badge only allows 4 chars.     ^^^ Delay and snooze ^^^ can both be 2 digits.
                if (showConsoleLogs) { console.log('[2b] Matched; Active; Creating Timer'); }
                createTimer(urlItem).then(response => {
                  if (showConsoleLogs) { console.log('createTimer: ' + response); }
                });
              } else {

                setBadge(badgeSleepColor, badgeSleepText); // Matched, but Inactive. @TODO: Maybe change badge text.
                if (showConsoleLogs) { console.log('[2c] Matched; Inactive'); }
              }
            } else {
              lastMatch = '';
              try {
                if ('localStorage' in window && window['localStorage'] !== null) {
                  localStorage["lastMatch"] = '';
                }
              } catch (e) {
                lastMatch = '';
              }
              setBadge(badgeSleepColor, badgeSleepText);   // No match; Not timed. Shows the default icon.
              if (showConsoleLogs) { console.log('[2d] No match; Not timed'); }
            }
          });
        } else {
          if (showConsoleLogs) { console.log('[2e] urlItem: false || url !==', urlItem, lastMatch); }
          // We're on the same matching URL; let the timer run; do nothing.
        }
      } else {
        if (showConsoleLogs) { console.log('[2f] Chrome lost focus. Delete timer; clear lastMatch and badge.'); }
        deleteAllTimers().then(resp => {
          lastMatch = '';
          try {
            if ('localStorage' in window && window['localStorage'] !== null) {
              localStorage["lastMatch"] = '';
            }
          } catch (e) {
            lastMatch = '';
          }
          setBadge(badgeSleepColor, badgeSleepText);   // No tabs; Chrome no longer has focus.
        });
      }
    });

  } catch(err) {
    if (showConsoleLogs) {
      console.log('checkAndSetTimer deleteAllTimers catch error');
      console.log(err);
    }
  }
}

/**
 * ALARM - TRIGGERED
 *
 */

chrome.alarms.onAlarm.addListener(function(alarm) {

  // If an alarm is triggered---and dismissed (canceled),
  // the current snooze count will be shown on the extension's icon.

  // The count will persist in the icon badge text until a confirmation is provided to "Stop the madness!!"

  // @TODO: Add 'alarmType' notifications. By default, for now, they'll all just do 'alerts'.

  // Badge Text Updates
  //
  // console.log(alarm); // {name: "tmt-0", periodInMinutes: 1, scheduledTime: 1593041722115.426}
  //

  if (confirm('Stop the madness!!')) {

    deleteTimer(alarm.name).then(response => {

      if (response) { // Magical fix for queued up confirm dialogs causing mayhem.
        nextTab();    // Different approach (from trying to just create an empty [about:blank] tab).
      }
    });

    // var newURL = "about:blank"; // If you had multiple confirm dialogs piled up, each "OK" click would open a new 'about:blank' page.
    // chrome.tabs.create({ url: newURL });
    // Check if about:blank is already open .tabs currentWindow: true

  } else {

    inFocus = false;

    try {
      if ('localStorage' in window && window['localStorage'] !== null) {
        localStorage["inFocus"] = 'false'; // Chrome does not have focus
      }
    } catch (e) {
      inFocus = false; // Chrome does not have focus
    }

    chrome.browserAction.getBadgeText({}, function(result) {

      var newerCount = (
              typeof(result) === 'undefined' || isNaN(parseInt(result, 10))
            ) ? 0 : parseInt(result, 10);

      newerCount++;

      // *** If you "miss" clicking cancel on three or more confirms,
      // this variable stops counting after the first two increments.
      //
      // chrome.browserAction.setBadgeText({text: newerCount.toString() });
      setBadge(badgeWatchColor, newerCount.toString());
    });
  }
  if (showConsoleLogs) { console.log('What happens after the madness stops??? This is supposed to be the end of the road.'); }
});

//
// Switch to Next Tab
//
// Source and Thanks to: https://stackoverflow.com/questions/16276276/chrome-extension-select-next-tab
//
function nextTab() {

  chrome.tabs.query({currentWindow: true}, function (tabsAll) {

    // We're either going to open a new tab if only one tab is open.
    // Or, we'll switch to the first tab in the window if it is not already
    // the currently active tab, and the second tab if the first is active.

    var numAllTabs = tabsAll.length; // "All" is a misnomer; it's only all tabs in current window.

    if (numAllTabs === 1) {
      var newURL = "about:blank";

      chrome.tabs.create({ url: newURL, index: 1 }, (newTab) => {

        chrome.tabs.update(newTab.id, {active: true}, (thisElm) => {
          // chrome.tabs.highlight({'tabs': 1}, function(fevt) {
          //   // console.log('highlight');
          //   // console.log(fevt);
          // });
        });
        // chrome.tabs.update(newTab.id, {active: true});
        // chrome.tabs.update(tabsAll[1].id, {active: true});
      });
    } else {

      chrome.tabs.query({active: true, currentWindow: true}, function(tabsCurrent) {
        if (tabsCurrent.length) {
          var activeTab = tabsCurrent[0],
              tabId = activeTab.id,
              currentIndex = activeTab.index;

          // Issue here was with the confirm dialog overlaps---If you
          // wait and have multipole confirms queued up for OK/Cancel,
          // --> Adding a new page would add many new pages.
          // --> Switching to either 0 or 1 tabs index switched back to
          //     itself, because it was 0, then always 1 until the last
          //     click, which then switched it back to it's own index at 0.
          // Tested reversing these and it worked, but it may have only
          //     worked due to my having waiting for the
          //     right number of 0-1-0-1-0 index switches.
          //     Maybe if it's at index 1 if it'll not work.
          // Dunno. It worked. "Queued up confirm dialog boxes" are an edge case.

          if (currentIndex === 1) {
            chrome.tabs.update(tabsAll[0].id, {active: true});
          } else {
            chrome.tabs.update(tabsAll[1].id, {active: true});
          }
        }
      });
    }
  });
}

/**
 * STORAGE - GET / ICON BADGE TEXT UPDATES (for expired alarms)
 *
 * This code will execute on browser startup (if extension is active).
 *
 */

function syncData() {

  return new Promise((resolve, reject) => {

    try {

      chrome.storage.sync.get('tmtList', itemList => { // .get
        //
        // Data Structure
        //
        // const arrayToMatchFromStorage = [
        //         'twitter.com',
        //       ],
        //       mapFromStorage = new Map([
        //         ['twitter.com', {id: 0, title: '//twitter.com', active: 1, delay: 5, snooze: 2, alarmType: 'alerts'}],
        //       ]);
        //

        mapFromStorage.clear();
        arrayToMatchFromStorage.length = 0;

        if (!isEmpty(itemList.tmtList)) { // Only do anything if there is an `tmtList` object.
          itemList.tmtList.forEach( item => {
            // let configObj = {};
            // configObj = {...item};

            mapFromStorage.set( item.title, item );
            if (!arrayToMatchFromStorage.includes(item.title)) {
              arrayToMatchFromStorage.push( item.title );
            }
          });
        }

        // checkAndSetTimer('sync.get');
        resolve('Successful data sync.');
      });
    } catch(err) {
      resolve(false);
    }
  }); // Promise
}

/**
 * Helper Functions
 * from [popup.js] to support
 * chrome.storage.sync.get('tmtList'
 */

function isEmpty(obj) {
  // 'Object Quick Check' thanks to: https://stackoverflow.com/a/34491966/638153
  for (var x in obj) { if (obj.hasOwnProperty(x)) return false; }
  return true;
}

/**
 *   UTILITY FUNCTION
 *
 */

function isGood(objStr) {

  // It would seem that "iPad" cannot pass an undefined object as a param.
     // isGood(chrome) would fail (I don't have a Mac to debug with, and alerts provided
     // no useful info). So I opted to go with a manual 1:1 string -> object conversion method.

  if (objStr === 'chrome') {
    return typeof(chrome) !== 'undefined';

  } else if (objStr === 'chrome.alarms') {
    return typeof(chrome.alarms) !== 'undefined';

  } else if (objStr === 'chrome.storage') {
    return typeof(chrome.storage) !== 'undefined';

  } else if (objStr === 'chrome.storage.sync') {
    return typeof(chrome.storage.sync) !== 'undefined';

  } else if (objStr === 'chrome.browserAction') {
    return typeof(chrome.browserAction) !== 'undefined';

  } else if (objStr === 'window.localStorage') {
    return typeof(window.localStorage) !== 'undefined';

  } else {
    return typeof(objStr) !== 'undefined';
  }
}

syncData('[background] inline load - EOF').then(syncResponse => {
  // checkAndSetTimer('runtime.onInstalled');
  // @TODO: Need an error management messaging system

  // if (syncResponse === false) { console.error('Error: Sync Initialization'); }
}); // Initialize extension data with storage.
