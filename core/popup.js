/**
 * Too-Much-Time - Popup Script Page
 *
 * The 'popup script' part of this extension provides the
 * ability to add/remove URLs, and set their preferences.
 *
 * Developer: Keith D Commiskey (https://kdcinfo.com) 2020-06
 *
 * A general URL info object is outlined at the bottom of this file.
 *
 */

const isTesting = false;

let ourState = [],
    importErrors = [];

const
      MIN_ITEMS_TO_SHOW_SCROLL = 8,
      maxDelay = 60,
      maxSnooze = 60,
      maxDays = 70,
      maxWeeks = 10,
      defaultDelay = 5,
      defaultSnooze = 2,
      stateLocation = 'chrome', // chrome|local|session|cookie
      ourKeys = new Set(['title']), // No: 'id', 'active'
      sampleJSON = '[{"id": 1, "title": "//twitter.com", "active": true, "delay": 5, "snooze": 2, "alarmType": "alerts"}, {"id": 2, "title": "//google.com", "active": true, "delay": 10, "snooze": 3, "alarmType": "alerts"}, {"id": 3, "title": "//www.google.com", "active": true, "delay": 10, "snooze": 3, "alarmType": "alerts"}]';

function displayIt() { // [window|document].onload = function() {}

  //
  // Set Listeners
  //

  document.addEventListener('click', (e) => {
    // Thanks to:
       // https://stackoverflow.com/a/35294561/638153
       // https://css-tricks.com/dangers-stopping-event-propagation/
       // https://developer.mozilla.org/en-US/docs/Web/API/Element/closest

    // if (e.defaultPrevented) return;

    if (!e.target.closest('.footer-menu-toggle-button') &&
        !e.target.closest('.footer-menu-div') &&
        !e.target.closest('.footer-faq-toggle-button') &&
        !e.target.closest('.footer-faq-div')) {
      toggleMenu('close');
    }
    // return; // No returns; let it pass through.
  });

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'escape') {
      let menuElem = document.querySelector('.footer-menu-div').classList;
      let faqElem = document.querySelector('.footer-faq-div').classList;

      if (menuElem.contains('open')) {
        menuElem.toggle('open', false);
        e.preventDefault();
      } else if (faqElem.contains('open')) {
        faqElem.toggle('open', false);
        e.preventDefault();
      }
    }
  });

  // <button>: Save
  document.querySelector('.input-save').addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      document.querySelector('.input-save').click();
    }
  });
  document.querySelector('.input-save').addEventListener('click', (e) => {
    e.preventDefault();
    saveChanges();
  });

  // <button>: Reset
  document.querySelector('.input-reset').addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      document.querySelector('.input-reset').click();
    }
  });
  document.querySelector('.input-reset').addEventListener('click', (e) => {
    e.preventDefault();
    let itemId = parseInt(e.target.parentNode.querySelector('.input-id').value, 10);
    updateForm(itemId);
  });

  // <button>: Clear
  document.querySelector('.input-new').addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      document.querySelector('.input-new').click();
    }
  });
  document.querySelector('.input-new').addEventListener('click', (e) => {
    e.preventDefault();
    setItemEdit();
    updateForm();
  });

  // document
  // <div>: List Options
  document.querySelector('.footer-menu-toggle-button').addEventListener('click', (e) => {
    toggleMenu();
  });

  // document
  // <div>: List Options
  document.querySelector('.footer-faq-toggle-button').addEventListener('click', (e) => {
    toggleFAQ();
  });

  // <button>: Clear All
  document.getElementById('InputClearAll').addEventListener('click', (e) => {
    clearTimersAndStorage();
  });

  // <button>: Export All
  document.getElementById('InputExportAll').addEventListener('click', (e) => {
    exportTimers();
  });

  // <button>: Import - Toggle Import Options
  document.getElementById('InputImportButton').addEventListener('click', (e) => {
    showImportTextarea();
  });

  // <button>: Import - Execute Import
  document.querySelector('#InputImportAction').addEventListener('click', (e) => {
    importTimersRun();
  });

  // <a>: Import - FillSampleJSON
  document.getElementById('FillSampleJSON').addEventListener('click', (e) => {
    e.preventDefault();
    importSamples();
  });

  // <a>: Import - FillSampleJSON
  document.getElementById('TooMuchTimeClearTimer').addEventListener('click', (e) => {
    e.preventDefault();
    clearTimerPrep().then(responseOrFalse => {
      // @TODO: Change icon to be a green color.
      // When clearing (in background) set to be normal icon color.
    }).catch(reason => {
      // @TODO: Change icon to be a red color.
      if (isTesting) { console.log('reason', reason); }
    });
  });

  storeStateLocal(showList); // Store Chrome Storage locally, then display the list (if any).
}

/**
 * Let the FUN Begin!!
 */

document.addEventListener('DOMContentLoaded', displayIt, false);
  // window.onload = function() {
  // displayIt();

const tmtStorage = (function() {
  return {
    get: async function(whichStore) { // tmtStorage.get

      // console.log(whichStore); // tmtList, tmtPrefs

      if (isGood('chrome') && isGood('chrome.storage') && isGood('chrome.storage.sync')) {

        return new Promise( (resolve, reject) => {
          chrome.storage.sync.get(whichStore, itemList => {

            // console.log(itemList); // {tmtList: Array(18)}, {tmtPrefs: {sortPref: "3u"}}

            resolve(itemList);
          });
        });

      } else {
        return new Promise( (resolve, reject) => {
          alert("Your browsing device has no access to \'chrome.storage.sync\' (ie, no data persistence). " +
                "You can still run this extension\'s popup, but without saving data, sites cannot be timed.");
          resolve({[whichStore]: ourState});
        });
      }
    },
    set: function(storeObj) {

      // [ourState] is updated prior to 'tmtStorage.set' being called.

      let msgDone = '',
          whichList = 'tmtList',
          whichData, // Can/will either be an array [] or an object {}
          isPrefs = false,
          isSortUpdate = false;

      whichData = ourState;

      if (typeof(storeObj.isLastImport) !== 'undefined') {
        finishImport();

      } else if (typeof(storeObj.prefsObj) !== 'undefined') {

        // Currently, this should ONLY be used by the X2B SPA.

        if (storeObj.isNew !== true) {
          msgDone = message('Your preferences have been updated.', true);
        }
        isPrefs = true;
        whichList = 'tmtPrefs';
        whichData = Object.assign({}, ourExpirations.getPrefs(), storeObj.prefsObj);
        // console.log('Hope this combines and updates ourExpirations.getPrefs() objects.', storeObj.prefsObj, whichData);

      } else if (typeof(storeObj.newPrefObj) !== 'undefined') { // tmtStorage.set()

        // Currently, this is only used to update the sorting preference (once a sort is clicked).

        // msgDone = message('Your preferences have been updated.', true); // No message; let it sort and record it.
        isPrefs = true;             // We're just sorting -- it's already looping through the showList()
        isSortUpdate = true;
        whichList = 'tmtPrefs'; // chrome.storage.sync.remove('tmtPrefs')

        if (typeof ourExpirations !== 'undefined') {
          whichData = Object.assign({}, ourExpirations.getPrefs(), storeObj.newPrefObj);
                                     // ourExpirations.getPrefs() --> is synchronous
                                     // typeof ourExpirations === isGood('chrome.storage.sync')
        } else {
          whichData = Object.assign({}, storeObj.newPrefObj);
        }

      } else if (storeObj.id === 0) {
        msgDone = message('Your URL info was successfully created.', false);
      } else if (storeObj.id < 0) {
        msgDone = message('Your URL info was successfully removed.', false);
      } else {
        msgDone = message('Your URL info was successfully updated.', false);
      }

      if (isGood('chrome') && isGood('chrome.storage') && isGood('chrome.storage.sync')) {

        // Save it using the Chrome extension storage API.
        chrome.storage.sync.set({[whichList]: whichData}, () => {
          msgDone;

          if (!isPrefs) {
            updateBackgroundData().then(responseOrFalse => {
              if (isTesting) {
                console.log('[popup.js] responseOrFalse', responseOrFalse);
              } // request: {action: "formSave"}
            }).catch(reason => {
              // @TODO: Change icon to be a red color.
              message('Please Note: There were live data update issues. This is uncommon. Please reload to see if your changes persisted.', false);
              if (isTesting) { console.log('reason', reason); }
            });
            showList();
          } else if (isSortUpdate) {
            showList('', true); // '' = close any open menus; true = don't update alarms
          }
        });

      } else if (isGood('window.localStorage')) {

        setStorageItem(localStorage, whichList, JSON.stringify(whichData)); // Local Storage is synchronous.
        msgDone;
        if (!isPrefs) {
          showList();
        } else if (isSortUpdate) {
          showList('', true); // '' = close any open menus; true = don't update alarms
        }
      }
    },
    clear: function(thisId) { // tmtStorage.clear
      tmtStorage.set({id: -1});
    },
    which: function() {
      return stateLocation; // Possible future use, or termination.
    }
  };
})(); // <-- Does not work without IIFE (same with how MDN wrote 'LocalStorageState' interface (far below).)

function clearTimerPrep() { // async / returns a Promise

  return new Promise((resolve, reject) => {
    if (isGood('chrome') && isGood('chrome.runtime') && isGood('chrome.runtime.sendMessage')) {
      try {
        chrome.runtime.sendMessage({
          action: 'clear'
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

function updateBackgroundData() { // async / returns a Promise

  return new Promise((resolve, reject) => {
    if (isGood('chrome') && isGood('chrome.runtime') && isGood('chrome.runtime.sendMessage')) {
      try {
        chrome.runtime.sendMessage({
          action: 'formSave'
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

function importSamples() {
  document.getElementById('InputImport').value = sampleJSON;
}

function finishImport() {
  let finalImportMsg = importErrors.join(' ');
  finalImportMsg += ' Import Successful !!!';
  message(finalImportMsg, true);

  toggleProgressBar('off');
}

function toggleProgressBar(which = 'off') {

  let progressBarElement = document.getElementById('ImportProgress');

  if (which === 'off') {

    setTimeout( () => {
      progressBarElement.classList.remove('opacity100');
      progressBarElement.classList.add('opacity0');
      setTimeout( () => {
        progressBarElement.classList.add('hidden');
      }, 500);
    }, 1000);

  } else {
    progressBarElement.classList.remove('hidden');

    setTimeout( () => {
      progressBarElement.classList.remove('opacity0');
      progressBarElement.classList.add('opacity100');
    }, 1); // Near-after hidden is removed, the element will take up space on screen, then fade in.
  }
}

function storeStateLocal(thenFunc) {
  getState().then( data => {

    if (data && data.length > 0) {

      ourState = ourState.concat(data);

      if (thenFunc) {
        thenFunc.call();
        // I'd never done this before, but I just plugged it in as
        // I imagined it should go and it just worked - like cool!
      }
    } else {
      showEmptyList();
    }
  });
}

async function getState() {
  // Get current timers (array of objects)

  // This (getState function) should only be called once on page load; then stored locally.
  // Both local and storage will be updated together.

  return new Promise( (resolve, reject) => {
    tmtStorage.get('tmtList').then( itemList => {

      let returnIt = [];

      if (!isEmpty(itemList.tmtList)) {
        // This only runs on initial page load through 'storeStateLocal'
        message('Or you can edit your items from below.', false);

        returnIt = returnIt.concat(itemList.tmtList);
      }
      resolve(returnIt);
    });
  });
}

function showList(noClose = '', prefUpdate = false) { // showList('', true) // Sorting

  if (noClose.length === 0) {
    toggleMenu('close');
  }

  clearDOMList();

  if (ourState.length > 0) {

    if (!prefUpdate) {
      // Turn on the 'Clear All' and 'Export All' buttons.
      let inputOptions = document.querySelectorAll('.input-options-with-items');
      for (let i = 0; i < inputOptions.length; i++) {
        inputOptions[i].style.display = 'inline-block';
      }
    }

    let sortState = ourState.slice();

    tmtStorage.get('tmtPrefs').then( prefsList => {

      const sortColumns = ['title'];

      let listOptions = prefsList,
          // hasSort = false,
          sortColKey = '1u';  // If left at this default, this will get flipped to '1u'
                              // [column | direction] --> [1u] [1d] [2u] [2d] [3u] [3d]
                              // Column 1 = Title; 2 = Delay; 3 = Snooze; 4 = Alarm Typhe; 5 = Active

      if (typeof prefsList.tmtPrefs !== 'undefined') {
        listOptions = prefsList.tmtPrefs;
      }

      if (typeof listOptions.sortPref !== 'undefined') {
        // hasSort = true;
        sortColKey = listOptions.sortPref;
        // console.log('listOptions.sortPref is set: ', listOptions.sortPref);
      }

      printListHead(listOptions);

      let sortColNum = parseInt(sortColKey.substring(0, 1), 10),
          sortColName = sortColumns[sortColNum - 1],
          newSortDir = sortColKey.substring(1, 2); // === 'u' ? 'd' : 'u';
          // newSortDir = sortColKey.substr(1, 1); // === 'u' ? 'd' : 'u';

      sortState = sortState.sort( (a, b) => {
        // 0 : {id: 1, title: "twitter.com", delay: 5, snooze: 2, ...}

        if (newSortDir === 'u') {
          return a[sortColName] > b[sortColName] ? 1 : -1;
        } else {
          return a[sortColName] < b[sortColName] ? 1 : -1;
        }
      });

      sortState.forEach( item => {
        printList(item);
      });

      // @TODO: Arrow focus losing element because elements are being redrawn
      setItemEdit();

    }); // End of: tmtStorage.get('tmtPrefs') Promise
        // (and the enclosed printList())

  } else {
    // No expirations saved in storage.

    showEmptyList();

    // Turn off the 'Clear All' and 'Export All' buttons (nothing to clear or export).
    let inputOptions = document.querySelectorAll('.input-options-with-items');
    for (let i = 0; i < inputOptions.length; i++) {
      inputOptions[i].style.display = 'none';
    }

    message('No URLs; Storage is empty.', true);
  }
}

function showEmptyList() {
  //
  // ExpiresTable - Empty
  //
  let tempChildD = document.createElement('div');
  tempChildD.classList.add('temp-text');

  let tempChildS = document.createElement('span');
  tempChildS.innerText = 'Enter URLs you would like timed using the form above.';

  let parentTable = document.getElementById('ExpiresTable'); // <table>
  tempChildD.appendChild(tempChildS);
  parentTable.appendChild(tempChildD);
}

function printListHead(prefsList) {

  let itemTCH = document.createElement('div'),  // thead
      itemTCR = document.createElement('div'),  // tr
      itemTCH1 = document.createElement('div'), // th - title
      itemTCH1D = document.createElement('div');
      itemTCH1L = document.createElement('span'),
      itemTCH1R = document.createElement('span'),
      itemTCH1Ru = document.createElement('a'),
      itemTCH1Rd = document.createElement('a'),
      itemTCH2 = document.createElement('div'), // th - delay
      itemTCH3 = document.createElement('div'), // th - snooze
      itemTCH4 = document.createElement('div'), // th - alarmType
      itemTCH6 = document.createElement('div'), // th
      itemTCH6S = document.createElement('span'),
      itemTCH7 = document.createElement('div'), // th
      itemTCH8 = document.createElement('div'), // th
      itemTB = document.createElement('div'),   // tbody
      sortArrowActive = '1u';

      itemTCH.classList.add('thead');
      if (ourState.length > MIN_ITEMS_TO_SHOW_SCROLL) {
        itemTCH.classList.add('show-scroll');
      }
      itemTCR.classList.add('tr');
      itemTCH1.classList.add('th');
      itemTCH2.classList.add('th');
      itemTCH3.classList.add('th');
      itemTCH4.classList.add('th');
      itemTCH6.classList.add('th');
      itemTCH7.classList.add('th');
      itemTCH8.classList.add('th');
      itemTB.classList.add('tbody');

      if (typeof prefsList !== 'undefined' && typeof prefsList.sortPref !== 'undefined') {
        if (prefsList.sortPref === '1d') {
          itemTCH1Rd.classList.add('active');
          sortArrowActive = '1d';
        } else { // if (prefsList.sortPref === '1u') {
          itemTCH1Ru.classList.add('active');
        }
      } else {
        itemTCH1Ru.classList.add('active');
      }

        itemTCH1L.innerText = 'Text to match in URL';
        itemTCH1.classList.add('text-left');
        itemTCH1L.classList.add('paginate-title');
        itemTCH1R.classList.add('paginate');
        itemTCH1Ru.classList.add('arrow-up');
        itemTCH1Rd.classList.add('arrow-down');
          itemTCH1Ru.name = '1u';
          itemTCH1Rd.name = '1d';
          itemTCH1Ru.innerHTML = '&#x25b2';
          itemTCH1Rd.innerHTML = '&#x25bc';
            if (sortArrowActive !== '1u') {
              itemTCH1Ru.setAttribute('aria-label', 'Sort by: Title - Ascending');
              itemTCH1Ru.setAttribute("tabindex", "0");
              itemTCH1Ru.addEventListener('click', (e) => {
                sortRun(e.target.name, true); // true = isClick
              });
              itemTCH1Ru.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
                  e.preventDefault();
                  sortRun(e.target.name);
                }
              });
            }
            if (sortArrowActive !== '1d') {
              itemTCH1Rd.setAttribute('aria-label', 'Sort by: Title - Descending');
              itemTCH1Rd.setAttribute("tabindex", "0");
              itemTCH1Rd.addEventListener('click', (e) => {
                sortRun(e.target.name, true); // true = isClick
              });
              itemTCH1Rd.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
                  e.preventDefault();
                  sortRun(e.target.name);
                }
              });
            }
          itemTCH1R.appendChild(itemTCH1Ru);
          itemTCH1R.appendChild(itemTCH1Rd);
          itemTCH1D.appendChild(itemTCH1R);
          itemTCH1D.appendChild(itemTCH1L);
          itemTCH1.appendChild(itemTCH1D);
        itemTCR.appendChild(itemTCH1);

      itemTCH2.innerHTML = 'Delay';
        itemTCR.appendChild(itemTCH2);
      itemTCH3.innerHTML = 'Snooze';
        itemTCR.appendChild(itemTCH3);
      itemTCH4.innerHTML = 'Alarm Type';
        itemTCR.appendChild(itemTCH4);

      itemTCH6.innerHTML = '<span class="alarm">Alarm/</span><br/>Active';
        itemTCR.appendChild(itemTCH6);

      itemTCH7.innerHTML = '&nbsp;';
        itemTCR.appendChild(itemTCH7);
      itemTCH8.innerHTML = '&nbsp;';
        itemTCR.appendChild(itemTCH8);

  itemTCH.appendChild(itemTCR);

  let parentTable = document.getElementById('ExpiresTable'); // <table>

  parentTable.appendChild(itemTCH);
  parentTable.appendChild(itemTB);
}

function sortRun(setObj, isClick = false) { // sortRun(true); // If mouse, remove focus from clicked arrow element.
  tmtStorage.set({newPrefObj: {sortPref: setObj}});

  let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  // let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    // ^^^ https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript/36132694#36132694
    // ^^^ Not the most reliable, but should work in normal case scenarios
    // ... just don't test with Chrome emulator :)

  if (isClick && w > 500) {
    document.getElementById('EntryTitle').focus();
  }
}

function printList(item) {
  let itemTR = document.createElement('div'), // tr
      itemSpan1 = document.createElement('div'), // td // 1 :title
      itemSpan3 = document.createElement('div'), // td // 3 :delay
      itemSpan4 = document.createElement('div'), // td // 4 :snooze
      itemSpan5 = document.createElement('div'), // td // 5 :alarmType
      itemSpan6 = document.createElement('div'), // td // 6 <Active>
      itemSpan6Container = document.createElement('span'), // Container for active and blue sun
      itemSpan7 = document.createElement('div'), // td // 7 <Edit>
      itemSpan8 = document.createElement('div'); // td // 8 <Delete>

  itemTR.classList.add('tr');
  itemSpan1.classList.add('td');
  itemSpan3.classList.add('td');
  itemSpan4.classList.add('td');
  itemSpan5.classList.add('td');
  itemSpan6.classList.add('td');
  itemSpan7.classList.add('td');
  itemSpan8.classList.add('td');

  let trClassList = ['tmt-listitem-' + item.id];

  itemTR.classList.add(...trClassList);
    // itemSpan1.innerText = htmlUnescape(item.title);
    itemSpan1.innerText = item.title;
      itemSpan1.classList.add('cellCol1');

    itemSpan3.innerText = item.delay;
    itemSpan4.innerText = item.snooze;
    itemSpan5.innerText = item.alarmType;

  itemTR.appendChild(itemSpan1);
  itemTR.appendChild(itemSpan3);
  itemTR.appendChild(itemSpan4);
  itemTR.appendChild(itemSpan5);

  // <input class="toggle-active" type="checkbox" checked />
    itemSpan6Input = document.createElement('input');
      itemSpan6Input.type = 'checkbox';
      itemSpan6Input.checked = item.active ? true : false;
      itemSpan6Input.classList.add('toggle-active', 'active-is-' + item.active, 'item-' + item.id);
      itemSpan6Input.addEventListener('click', toggleActive);
      // `click` listener works for spacebar toggle also.

    itemSpan6Container.appendChild(itemSpan6Input);
    // This is where the 'alarm set' overlay would have gone... (will now go post-table creation).
    itemSpan6.appendChild(itemSpan6Container);

  itemTR.appendChild(itemSpan6);

  // <span><button class="edit">Edit</button></span>
    itemSpan7Button = document.createElement('button');
      itemSpan7Button.classList.add('edit', 'item-' + item.id);
      itemSpan7Button.innerText = 'Edit';
      itemSpan7Button.addEventListener('click', itemUpdate);

    itemSpan7.appendChild(itemSpan7Button);

  itemTR.appendChild(itemSpan7);

  // <span><button class="delete">Delete</button></span>
    itemSpan8Button = document.createElement('button');
      itemSpan8Button.classList.add('delete', 'item-' + item.id);
      itemSpan8Button.innerText = 'Del';
      itemSpan8Button.addEventListener('click', itemUpdate);

    itemSpan8.appendChild(itemSpan8Button);

  itemTR.appendChild(itemSpan8);

  let parentTable = document.querySelector('#ExpiresTable .tbody'); // <table>

  parentTable.appendChild(itemTR); // Adding the current item from global array of items
}

function toggleActive(e) {
  // classList = ['toggle-active', 'item-' + item.id]

  message('', true); // Clear message/notification board (div)

  let eChecked = e.target.checked.toString(),
      eTargetChecked = e.target.checked,
      thisId = parseInt(
                 Array.from(e.target.classList)
                      .find(thisClass => thisClass.substring(0, 5) === 'item-')
                      .substring(5),
                 10);

  let itemCurState = Array.from(e.target.classList)
                          .find(thisClass => {
                              // console.log('itemCurState: [', thisClass, '] [', thisClass.substr(0,10), ']');
                              // itemCurState: [ toggle-active ] [ toggle-act ]
                              // itemCurState: [ active-is-true ] [ active-is- ]
                              // return thisClass.substr(0, 10) === 'active-is-';
                              return thisClass.substring(0, 10) === 'active-is-';
                            })
                          // .substr(10); // 'true'|'false'
                          .substring(10); // 'true'|'false'

  // If `active` was off, `.checked` will be true.
  if (eChecked !== itemCurState) {
    // Should always be true; unless there is a way (in some browser)
    // to click the checkbox without changing its checked status.

    let stateItem = ourState.find(stateObj => stateObj.id === thisId),
        stateItemIdx = ourState.findIndex(stateObj => stateObj.id === thisId);

        // [stateItem] = {id: 1, title: 'twitter.com', active: true, delay: 5, snooze: 2, ...}
        // [stateItemIdx] = [ 0 ]

    passthruUpdateStorage(stateItem, stateItemIdx, eTargetChecked, false); // false = not creating a timer
  }
}

function passthruUpdateStorage(stateItem, stateItemIdx, itemActive, withTimer) {
  // `passthruUpdateStorage` was created to enforce DRY on 2 calls from the `toggleActive()` function (above).
  let localStateItem = stateItem,
      newState = ourState.slice();

  localStateItem.active = itemActive;               // Update relevant storage item.
  newState.splice(stateItemIdx, 1, localStateItem); // Overwrite it in the newState.
  ourState = newState;                              // Update global ourState.

  // updateStorageWithState(localStateItem.id);     // Update '.sync' storage.
  tmtStorage.set({id: localStateItem.id});
}

function itemUpdate(e) {
  // itemEdit:  <button class=​"edit item-4">Edit</button>​
  // itemDelete:  <button class=​"delete item-4">​Del​</button>​
  e.preventDefault();

  // let whichFunc = e.target.innerText.substr(0, 3).toLowerCase(), // [edi|del]
  //     itemId = parseInt(Array.from(e.target.classList).find(thisClass => thisClass.substr(0, 5) === 'item-').substr(5), 10);
  let whichFunc = e.target.innerText.substring(0, 3).toLowerCase(), // [edi|del]
      itemId = parseInt(Array.from(e.target.classList).find(thisClass => thisClass.substring(0, 5) === 'item-').substring(5), 10);

  if (whichFunc === 'edi') {
    updateForm(itemId);
  }

  if (whichFunc === 'del') {
    clearItem(itemId);
  }
}

function updateForm(itemId) {
  if (itemId) {
    let ourObj = ourState.find(item => item.id === itemId);

    document.querySelector('.input-id').value = itemId;
    // document.querySelector('.input-title').value = htmlUnescape(ourObj.title);
    document.querySelector('.input-title').value = ourObj.title;
    document.querySelector('.input-active').checked = ourObj.active;
    document.querySelector('.input-delay').value = ourObj.delay;
    document.querySelector('.input-snooze').value = ourObj.snooze;
    // document.querySelector('.input-select-alarm-type').value = htmlUnescape(ourObj.alarmType);
    document.querySelector('.input-select-alarm-type').value = ourObj.alarmType;

    document.querySelector('.input-title').focus();

    setItemEdit(itemId);
  } else {
    document.querySelector('.input-id').value = 0;
    document.querySelector('.input-title').value = ''; // input-title
    document.querySelector('.input-active').checked = true;
    document.querySelector('.input-delay').value = defaultDelay;
    document.querySelector('.input-snooze').value = defaultSnooze;
    document.querySelector('.input-select-alarm-type').value = 'alerts';

    document.querySelector('.input-title').focus();

    setItemEdit();
  }
}

function setItemEdit(itemId) {
  // Apply CSS class name to TR of the item that's currently in the form (if >0).
  let expiresTable = document.getElementById('ExpiresTable'),
      ourItemId = 0;

  // First; Remove any previous Edits (Recursive CSS Class Removal)
  // let trEdit = expiresTable.querySelector('div[class^="tmt-listitem"].is-edit');
  let trEdit = expiresTable.querySelector('div[class*="tmt-listitem"].is-edit');
  while (trEdit) {
    trEdit.classList.remove('is-edit');
    // trEdit = expiresTable.querySelector('div[class^="tmt-listitem"].is-edit');
    trEdit = expiresTable.querySelector('div[class*="tmt-listitem"].is-edit');
  }

  // Second; Let's make it editable!
  let formItemId = parseInt(document.querySelector('.input-id').value, 10);
    // We will try to highlight the param's `itemId` first ('Edit' button was clicked).
    // If no `itemId` was passed, and we're just clearning the board,
    // reset to whatever item is in the form, if any, else 0.
  if (!itemId && formItemId > 0) {
    ourItemId = formItemId;
  } else if (itemId) {
    ourItemId = itemId;
  } else {
    ourItemId = 0;
  }

  if (ourItemId > 0) {
    expiresTable
      .querySelector('.tr.tmt-listitem-' + ourItemId)
      .classList
      .add('is-edit');
  }
}

function saveChanges(itemToSave = {}, lastImport) {

  // The 'import' function is the only reference that passes a param to saveChanges().
  const isImport = typeof(itemToSave.title) !== 'undefined';

  // - id: 0,
  // - active: 1,
  // - url: window.location.href,
  // - delay: 5,
  // - snooze: 2,
  // - alarmType: 'alerts' // prefNotification: 'alerts', // alerts|modals|notifications|none (only passive)

  let itemId,
      isActive,
      textTitle,
      textDelay,
      textSnooze,
      textAlarmType,
      itemIdOrig;
      // selectNum,
      // selectName,

  if (!isImport) {
    // Get values from form.
    itemId = document.querySelector('.input-id').value;
    isActive = document.querySelector('.input-active').checked;
    textTitle = document.querySelector('.input-title').value; // input-title
    textDelay = document.querySelector('.input-delay').value;
    textSnooze = document.querySelector('.input-snooze').value;
    textAlarmType = 'alerts';
    // textAlarmType = document.querySelector('.input-select-alarm-type').value;
    itemIdOrig = parseInt(itemId, 10);

  } else {
    // Importing: Optional ID, no Active (determined below)

    let idToUse = '0';
    if (typeof(itemToSave.id) !== 'undefined') { // Check for an ID that's passed in.

      // If an item exists in `ourState`, zero out the ID and get a new one. Else, use it.
      let getItem = ourState.find(item => item.id === itemToSave.id);

      if (getItem === undefined) {
        idToUse = itemToSave.id.toString();
      }
    }
    itemId = idToUse; // "number" (number in a string).
    isActive = itemToSave.active;
    textTitle = itemToSave.title;
    textDelay = itemToSave.delay;
    textSnooze = itemToSave.snooze;
    textAlarmType = itemToSave.alarmType;
    itemIdOrig = 0;
  }

  // console.log('saveChanges: ', itemId, textTitle, selectNum, selectName);
  // saveChanges:                   2   | 2018-02-16 | t6     | 1        | days

  let stopShort = false,
      importMsg = '[Failed Title: <' + textTitle + '>]',
      errMsg = '';
      //importMsg = 'Import of Title: [' + textTitle + '] failed. All items "before" this were successfully imported.';

  // Simple Validation --> PR's are welcome.

  // @TODO: Check that alarm type value is in a preset array (when alarm types are added).

  if (!itemId || !textTitle || !textDelay || !textSnooze || !textAlarmType) {
    errMsg = 'All non-optional fields are required in order to setup a proper URL timer.';

    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);

    stopShort = true;

  } else if (
    !testVal(itemId, 'number') ||
    !testVal(isActive, 'boolean') ||
    !testVal(textTitle, 'string', 25) ||
    !testVal(textDelay, 'number') ||
    !testVal(textSnooze, 'number') ||
    !testVal(textAlarmType, 'string', 15))
  {

    errMsg = 'Error: Something appears to be wrong with one of your field entries.';
    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);
    stopShort = true;

  } else if (textDelay < 1 || textDelay > maxDelay) {
    errMsg = `Error: with 'Delay' input; largest number should be [${maxDelay}].`;
    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);
    stopShort = true;

  } else if (textSnooze < 1 || textSnooze > maxSnooze) {
    errMsg = `Error: with 'Snooze' input; largest number should be [${maxSnooze}].`;
    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);
    stopShort = true;

  }

  if (stopShort) {
    if (isImport) {
      importErrors.push(importMsg);
      message('Errors will show when complete.', true);
    } else {
      message(errMsg, true);
    }

    if (lastImport) {
      finishImport();
    }
    return; // Stop. Nothing further to do.
  }

  let thisId = parseInt(itemId, 10), // 'itemId' is updated if item is edited.
      numDelay = parseInt(textDelay, 10),
      numSnooze = parseInt(textSnooze, 10);

  if (thisId === 0) {
    thisId = getNewId(); // Gets next biggest ID in `ourState` array of objects.
  } else {
    // @TONOT: Get 'active' status for existing item in ourState. (Why?)
  }

  message('', true); // Clear message/notification board (div)

  let ourItem = {
        id: thisId,                   // <number> 1, 2, 3, ...
        active: isActive,
        title: textTitle, // (25 chars)
        delay: numDelay,
        snooze: numSnooze,
        alarmType: textAlarmType // (15 chars)
      };

  if (itemIdOrig === 0) {
    ourState.push(ourItem);

  } else {
    // Existing ID; needs to update itself in the list.

    let newState = ourState.slice(),
        stateItemIdx = newState.findIndex(stateObj => stateObj.id === thisId);

    newState.splice(stateItemIdx, 1, ourItem); // Overwrite it in the newState.
    ourState = newState;                       // Update global ourState.
  }

  // Clear the form (they can now edit individual items from the list below the form).
  updateForm();

  //
  // Save item using storage APIs.

  if (lastImport) {
    tmtStorage.set({id: itemIdOrig, isLastImport: true});
  } else {
    tmtStorage.set({id: itemIdOrig});
  }
}

function showImportTextarea(forceOff = '') { // Show the import <textarea> and other info.

  setParsingImportError();

  let forceClose = forceOff.length > 0,
      isOpen = true;

  if (document.getElementById('InputImport').classList.contains('closed')) {
    isOpen = false;
  }

  if (isOpen || forceClose) {
    document.getElementById('InputImport').classList.add('closed');
  } else {
    document.getElementById('InputImport').classList.toggle('closed');
  }

  setTimeout( () => {
    let importElements = document.querySelectorAll('.show-import-elements');
    for (let i = 0; i < importElements.length; i++) {
      if (isOpen || forceClose) {
        importElements[i].classList.add('hidden');
      } else {
        importElements[i].classList.remove('hidden');
      }
    }
  }, 250);
}

function importTimersRun() {
  setParsingImportError();
  importErrors.length = 0;

  if (document.getElementById('InputImport').value.length > 120000) {
    // Max Length: 120000 (allows for up to ~999 expirations.)
    setParsingImportError('on', 'Import only supports up to 999 expiration items.');
    return;
  }

  let ourJSON = getJson(document.getElementById('InputImport').value);

  if (ourJSON.results === 'success') {

    let importList = ourJSON.tmtList; // Array of objects [{}, {}]

    toggleMenu('close');
    toggleProgressBar('on');

    let percent = 0,
        fraction = 100 / importList.length,
        newFraction = 0,
        progressBarElement = document.getElementById('ImportProgressBar');

        // 100 / 1    = 100%
        // 100 / 2    = 50%
        // 100 / 10   = 10%
        // 100 / 100  = 1%
        // 100 / 200  = 0.5%
        // 100 / 1000 = 0.01%

    // Run each newObjs through saveChanges()
    for (let ii = 0; ii < importList.length; ii++) {

      if (ii + 1 === importList.length) { // Last item in list
        window.setTimeout( () => {
          saveChanges(importList[(ii)], 'last');
          progressBarElement.style.width = fraction * (ii + 1) + '%';
        }, 1500 * ii);

      } else {
        window.setTimeout( () => {
          saveChanges(importList[(ii)]);
          progressBarElement.style.width = fraction * (ii + 1) + '%';
        }, 1500 * ii);
      }
      newFraction = fraction * (ii + 1) + '%';
    }
    // showList() should close the menu...

  } else {
    setParsingImportError('on',
                       'There were issues with your JSON-like input value. ' +
                       'Empty the contents of the text area to see an example.');
  }
}

function getJson(item) {

  let thisItem,
      thisItem2,
      itemStr = JSON.stringify(item); // [{'title': 'Test'}]

  // 1. Check that item can be parsed with JSON.parse. If not, return with error.
  // 2. If that '1st pass' object is the Array we expect, assign it to the '2nd pass' object and move to #5.
  // 3. If not, check that the '1st pass' object can be parsed with JSON.parse. If not, return with error.
  // 4. If that result is the Array we expect, move to #5. If not, return error with expected format: [{}, {}]

  // 5. Check the array length > 0.
  // 6. Check if each element in the array has a constructor of Object.
  // 7. Check each successful object for 7 specific keys:
        // let newItem = {
        //       id: thisId,                   // <number> 1, 2, 3, ...
        //       title: textTitle, // (25 chars)
        //       ...
        //       active: isActive              // Can be 0 or 1 (initially based on date calcs)
        //     };
  //    7a. Successful objects will be stored for next test.
  // 8. Run each successful object through the `saveChanges` function (may need to populate form first?).

  try {
    thisItem = JSON.parse(itemStr);               // #1
  } catch (e) {
    return {'tmtList': [], 'results': 'error', 'msg': 'Initial JSON parser failed to parse your string.'};
  }

  if (thisItem.constructor !== Array) {
    try {
      thisItem2 = JSON.parse(thisItem);           // #3
    } catch (e) {
      return {'tmtList': [], 'results': 'error', 'msg': 'Follow-up JSON parser failed to parse your string.'};
    }
  } else {
    thisItem2 = thisItem;                         // #2
  }

  if (thisItem2.constructor !== Array) {          // #4
    return {'tmtList': [], 'results': 'error', 'msg': 'Our JSON format expects (e.g., 2 items): [{}, {}].'};

  } else { // (thisItem2.constructor === Array)

    if (thisItem2.length === 0) {                 // #5
      return {'tmtList': [], 'results': 'error', 'msg': 'Your list appears to be void of expiration items.'};
    }

    let newObjs = [];

    for (var i = 0; i < thisItem2.length; i++) {

      if (thisItem2[i].constructor === Object) {  // #6

        if (hasCorrectProps(thisItem2[i])) {      // #7
          newObjs.push(thisItem2[i]); // Got one! // #7a
        } // else; discard.

      } // else; discard.
    }

    if (newObjs.length > 0) {
      return {'tmtList': newObjs, 'results': 'success', 'msg': 'Success: Check object.'};

    } else {
      return {'tmtList': newObjs, 'results': 'error', 'msg': 'Success: But no objects survived the import.'};
    }
  }

  return {'tmtList': [], 'results': 'error', 'msg': 'Parses as JSON, but not...'};
}

function hasCorrectProps(testObj = {}) {

  let isGood = 0,
      testKeys = Object.keys(testObj);

  testKeys.forEach( thisKey => {
    if (ourKeys.has(thisKey)) {
      isGood++;
    }
    // console.log('key: ', thisKey, ourKeys.has(thisKey));
  });

  if (isGood === ourKeys.size) {
    return true;
  } else {
    return false;
  }
  // id: thisId,        // <number> 1, 2, 3, ...
  // title: textTitle,  // (25 chars)
  // active: isActive   // Can be 0 or 1 (initially based on date calcs)
}

function setParsingImportError(onOff = 'off', msg = '') {
  if (onOff === 'on') {
    document.getElementById('ImportError').classList.remove('hidden');
  } else {
    document.getElementById('ImportError').classList.add('hidden');
  }
  document.getElementById('ImportError').innerText = msg;
}

function exportTimers() {
  toggleMenu('close');

  message('Exporting...', true);

  // <a id="InputExportDownload" style="display:none"></a>

  tmtStorage.get('tmtList').then( itemList => {
    if (!isEmpty(itemList.tmtList)) {

      // Saving JSON to a local file thanks to:
         // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
         // https://stackoverflow.com/a/30800715/638153

      const storageObj = itemList.tmtList,
            dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj));

      let dlAnchorElem = document.getElementById('InputExportDownload');

      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", "tmt-url-info-list.json");
      dlAnchorElem.click();

      message('Your \'TMT URLs List\' file has either been saved, or opened for you to save.', true);
    } else {
      message('It would seem you have an empty list: there doesn\'t appear to be anything to export.', true);
    }
  });
}

function clearItem(itemId) { // deleteAlarm
  // alarm:     alarmId = "tmt-" + itemId;
  // storage:   'tmtList': [ourState] -> [{ id, title }]
  // ourState:  [{ id, title }]
  // DOM List:  Just redraw the list: showList() -> it will clear it first

  let storeId = 'tmt-' + itemId,
      newState = ourState.filter( item => item.id !== itemId);

  // @TODO: Should not reference 'tmt-' anywhere, or even its length (via index).
     // Set one global name at top and use its name and length.

  // When deleting, if current item ID is in Edit Form, zero it out (ID's should not be used again).
  let currentEditId = document.querySelector('.input-id').value;

  if (parseInt(currentEditId, 10) === itemId) {
    document.querySelector('.input-id').value = 0;
  }

  message('', true);

  ourState = newState;

  // Running `tmtStorage.set(-1);` after setting ourState will update storage with state, then run showList()
  tmtStorage.set({id: -1});
}

function clearDOMList() {
  let parentTable = document.getElementById('ExpiresTable');
  // There should really only be 2 elements to remove; <thead> and <tbody>
  while (parentTable.firstChild) {
    parentTable.removeChild(parentTable.firstChild);
  }
}

function toggleMenu(which = 'toggle') {
  let menuElem = document.querySelector('.footer-menu-div').classList;
  let faqElem = document.querySelector('.footer-faq-div').classList;

  if (faqElem.contains('open')) {
    faqElem.toggle('open', false); // Remove 'open' class.
  }

  if (menuElem.contains('open')) {
    showImportTextarea('close');
  }

  if (which === 'close') { // Force close
    menuElem.toggle('open', false); // Remove 'open' class.
  } else {
    menuElem.toggle('open');
  }
}

function toggleFAQ(which = 'toggle') {
  let menuElem = document.querySelector('.footer-menu-div').classList;
  let faqElem = document.querySelector('.footer-faq-div').classList;

  if (menuElem.contains('open')) {
    showImportTextarea('close');
    menuElem.toggle('open', false); // Remove 'open' class.
  }

  if (which === 'close') { // Force close
    faqElem.toggle('open', false); // Remove 'open' class.
  } else {
    faqElem.toggle('open');
  }
}

/**
 *   TIMER FUNCTIONS
 *
 */

function clearTimersAndStorage() {

  if (isGood('chrome') && isGood('chrome.alarms') && isGood('chrome.storage')) {
    if (window.confirm('Click OK if you are certain you\'d like to remove all of your expiration items and alarms.')) {
      chrome.alarms.clearAll( () => {
        chrome.storage.sync.clear( () => {
          ourState.length = 0;
          showList();
          updateForm();
        });
      });
    }
  } else {

    if (isGood('window.localStorage')) {
      if (window.confirm('Click OK if you are certain you\'d like to remove all of your expiration items from local storage.')) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Storage/clear
        localStorage.removeItem('tmtList'); // Synchronous call to clear local storage.
        ourState.length = 0;

        const removeItem = {
          whichEvent: 'clearall',
          expiredId: -1 // Required field
        };

        ourExpirations.processItem(removeItem);
        window.reRender();
        ourExpirations.removeItem(-1);
        window.reRender();

        showList();
        updateForm();
      }
    }
  }
}

/**
 *   SYSTEM MESSAGING FUNCTIONS
 *
 */

function message(msg, clearMsg, data) {

  let msgsDiv = document.getElementById('MsgsDiv'); // The <div> where all the notifications are headed.

  msgsDiv.classList.add('msg-transition');

  setTimeout( () => {

    if (clearMsg) {
      msgsDiv.innerText = msg;
    } else {
      msgsDiv.innerText = msgsDiv.innerText + ' ' + msg;
    }

    if (data) {
      msgsDiv.innerText = msgsDiv.innerText + ' [' + data + ']';
    }

    setTimeout( () => {
      msgsDiv.classList.remove('msg-transition');
    }, 250);

  }, 250);
}

function clearMessage() {
  document.getElementById('MsgsDiv').innerText = '';
}

/**
 *   UTILITY FUNCTIONS
 *
 */

function getNewId() {
  return ourState.reduce((a, v) => (v.id > a) ? v.id : a, 0) + 1;
}

function isEmpty(obj) {
  // Thanks to: https://stackoverflow.com/a/34491966/638153
  for (var x in obj) { if (obj.hasOwnProperty(x))  return false; }
  return true;
}

// Form Field Type and Value Validation
function testVal(val, valType, valLen = 0) {
  if (valType === 'number') {

    return !isNaN(parseInt(val, 10));

  } else if (valType === 'boolean') {

    return val === true || val === false;

  } else if (valLen > 0) {

    // All strings should have maxLengths. This clause covers strings.

    return (typeof(val) === valType && val.length <= valLen);

    // Trying to stay away from 'whitelist' and 'blacklist' characters.
       // if (typeof(val) === valType && val.length <= valLen) {
       //   return val.test(\[^<>]\g); // ' <-- Syntax corrector
       // }
  }
  return false;
}

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

/**
 *   Escaping: Was shooting for some XSS coverage.
 *
 */

  // Refs:
     // Q: https://stackoverflow.com/questions/1219860/html-encoding-lost-when-attribute-read-from-input-field
     // A: https://stackoverflow.com/a/7124052/638153

     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/escape
     // What's the difference? The spec doesn't escape the forward slash (recommended by OWASP).
     // https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content

     // https://stackoverflow.com/questions/8839112/if-function-does-not-exist-write-function-javascript#answer-8839136

  // Other Refs:
    //  https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
    //  https://stackoverflow.com/questions/46561795/notification-requestpermission-then-always-return-promise-object-instead-of
    //  https://bugs.chromium.org/p/chromium/issues/detail?id=704771
    //  https://developer.mozilla.org/en-US/docs/Web/API/Notification/permission
    //  https://stackoverflow.com/questions/38114266/web-notifications-not-appearing-in-safari#answer-39282539

  // Test strings: (25 chars.)
  // <script>alert(1)</script>
  // <_>-\/!@#$%^&*();'?+"[`~]

/*  STORAGE FUNCTIONS  */

/**
 *   Storage (local; client-side [window])
 *   https://developer.mozilla.org/en-US/docs/Web/API/Storage
 *
 *   STORAGE MOCKUP (jsdom)
 *
 *   - All storage code below borrowed from
 *       [my 'Done (for now)' code](https://github.com/KDCinfo/done-for-now) and
 *       [my 'Expired To Be (X2B)' code](https://github.com/KDCinfo/expired-to-be)
 */

if (typeof(window.localStorage) === 'undefined' || window.localStorage === null) {

    // For Testing: Apparently you can disregard the TypeScript errors.

    var localStorage = (function () {
      return {
        getItem: function (key) {
          return store[key];
        },
        setItem: function (key, value) {
          store[key] = value.toString();
        },
        clear: function () {
          store = {};
        },
        removeItem: function (key) {
          delete store[key];
        }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorage });
}

const setStorageItem = (storage, key, value) => {
  try {
    storage.setItem(key, value);
  } catch (e) {
    message('Error: ' + e);
  }
};

const getStorageItem = (storage, key) => {
  let newItem = {
        id: 0,                        // <number> 1, 2, 3, ...
        active: true,
        title: 'Empty Temp Placeholder...', // (25 chars)
        delay: 5,
        snooze: 2,
        alarmType: 'alerts'
      },
      keyItem = storage.getItem(key),
      testObj = {};

  if (key === 'tmtPrefs') { // tmtPrefs
    testObj = (keyItem) ? JSON.parse(keyItem) : {};
  } else { // tmtList
    testObj = (keyItem) ? { 'tmtList': JSON.parse(keyItem) } : { 'tmtList': ourState };
    // testObj = (keyItem) ? JSON.parse(keyItem) : ourState;
  }

  /**
   *  testObj0 = { 'tmtList': ourState },
   *  testObj1 = { 'tmtList': [ newItem ] },
   *  testObj2 = (keyItem) ? { 'tmtList': JSON.parse(keyItem) } : testObj0;
   */
  // console.log('getStorageItem: ', keyItem, testObj);

  try {
    return testObj;
  } catch (e) {
    message('Error: ' + e, false);
    return { [key]: [] };
  }
};

/*
    // const _tmtData = {
    //                     id: 0,
    //                     active: 1,
    //                     url: window.location.href,
    //                     delay: 5,
    //                     snooze: 2,
    //                     alarmType: 'alerts' // prefNotification: 'alerts', // alerts|modals|notifications|none (only passive)
    //                   };

   .-----------------------------.-----------------------------.
   |                             |                             |
   |           url               |                             |
   |                             |                             |
   | delay  snoooze  active |_|  |     Clear Active Timer      |
   |                             |                             |
   |  New    Reset    Save       |                             |
   |                             |                             |
   `-----------------------------^-----------------------------'
*/
