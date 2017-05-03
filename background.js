window.onload = function () {

    //calls when user go to some tab
    // chrome.tabs.onActivated.addListener(function (info) {
    // alert('onActivated listener');
    // });

    //calls when tab updates
    chrome.tabs.onUpdated.addListener(function (id, info, tab) {
        // chrome.tabs.executeScript(id, {code: 'var currentTabURL = ' + JSON.stringify(tab.url)});

        chrome.tabs.executeScript(tab.id, {file: 'popup.js'}, function () {
            chrome.tabs.sendMessage(tab.id, tab.url);
        });

    });



};


// Getting an absolute URL. from https://davidwalsh.name/essential-javascript-functions
let getAbsoluteUrl = (function () {
    let a;

    return function (url) {
        if (!a) a = document.createElement('a');
        a.href = url;

        return a.href;
    }
}());
