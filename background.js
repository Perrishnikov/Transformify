/*
* This sets the rules for when the popup activates.
*/


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