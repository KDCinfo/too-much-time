/**
 * Too-Much-Time - Content Script Page
 *
 * The 'content script' part of this extension has one job.
 *
 * On any initial page load, the extension's background script
 * doesn't have access to to the URL. So the background script
 * notifies this script, which simply sends the URL back to the background script.
 *
 * Developer: Keith D Commiskey (https://kdcinfo.com) 2020-06
 *
 */

/**
 *   TIMER RETURN FUNCTION
 *
 */

function returnTheUrl() { // async / returns a Promise

  // console.log('[3] [content] -> returnTheUrl');

  return new Promise((resolve, reject) => {
    if (isGood('chrome') && isGood('chrome.runtime') && isGood('chrome.runtime.sendMessage')) {
      try {
        chrome.runtime.sendMessage({
          action: 'checkURL',
          url: window.location.href,
        }, (response) => {
          resolve(response); // responseOrFalse
        });
      } catch(e) {
        resolve(false);      // responseOrFalse
      }
    } else {
      resolve(false);        // responseOrFalse
    }
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //              ^^^ https://developer.chrome.com/extensions/runtime#event-onMessage
  //              ___ console.log(request);      // {message: "TabUpdated"}
  //              ___ console.log(sender);       // {id: "helhgfihaejomkikjadlnjdknkbinkac", origin: "null"}
  //              ___ console.log(sendResponse); // () { [native code] }

  // console.log('[2] content -> onMessage');

  if (request.message === 'TabUpdated') {

    returnTheUrl().then(responseOrFalse => {
      // @TODO: Change icon to be a green color?
      // When clearing (in background) set to be normal icon color.
    }).catch(reason => {
      // @TODO: Change icon to be a red color?
      // console.log(reason);
    });
  }
})

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
