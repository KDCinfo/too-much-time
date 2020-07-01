<<< Clear/Reload Extension (from extensions page) >>>

- Console was cleared
- background.js:299 [2] ___: checkAndSetTimer sync.get
- background.js:211 foundItemUrl chrome://extensions/ undefined
- background.js:329 [2c] Site not timed.

<<< Switching to Dev Tools >>>

- [1b] onFocusChanged -> inFocus [window] true -1 -1

<<< On another app >>>

    <<< Enter timed URL >>>

> [1b] onFocusChanged -> inFocus [window] false -1 134

    <<< Switching to Dev Tools >>>

> background.js:83 [1b] onFocusChanged -> inFocus [window] true -1 -1

    <<< Blur app >>>

    <<< Enter same timed URL >>>

    <<< Blur app >>>

    <<< Enter non-timed URL >>>

    <<< Blur app >>>

    <<< Switch to timed URL >>>

<<< On timed tab >>>

    <<< Switch to non-timed URL >>>

    <<< Switch back to timed tab >>>

    <<< Switch to new matched URL >>>

<<< Alternative Test for "Opening browser"]>>>

    <<< Close active tab >>>

    <<< Undo closed tab (Ctrl-Shft T) >>>

    <<< Switch to non-timed tab >>>
