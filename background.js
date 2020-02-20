/*
* This sets the rules for when the popup activates.

*/

chrome.runtime.onInstalled.addListener(function () {
  return;
  // chrome.storage.sync.set({ color: '#3aa757' }, function () {
  //   console.log('The color is green.');
  // });
});

chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
  // console.log(chrome.tabs);

  chrome.declarativeContent.onPageChanged.addRules([
    {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: 'images.salsify.com' }
        })
      ],
      actions: [
        new chrome.declarativeContent.ShowPageAction(),
      ]
    }
  ], function () {
    // chrome.tabs.query({ 'active': true }, function (tab) {
    //   console.log(tab);
    //   const url = tab.url;

    // });

    // chrome.windows.create({
    //   url: chrome.extension.getURL('index.html')
    // });
    
  });
});