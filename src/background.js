const EXTENSION_VERSION = parseInt(chrome.runtime.getManifest().version);

function storeNewPotentiallyControversialPost(postText) {
  chrome.storage.sync.get({
    postedTexts: []
  }, function (result) {
    postedTexts = result.postedTexts;
    postedTexts.push(postText);
    chrome.storage.sync.set({
      postedTexts: postedTexts
    });
  })
}

function getPotentiallyControversialPosts() {
  return new Promise((resolve, reject) => {
    let dataResponse = chrome.storage.sync.get({
      postedTexts: []
    });
    resolve(dataResponse.postedTexts);
  })
}

function sendWarningNotification() {
  chrome.notifications.create(Math.random().toString(36).substring(7), {
    "type": "basic",
    "title": chrome.i18n.getMessage("warningNotificationTitle"),
    "iconUrl": "img/warning-green.png",
    "message": chrome.i18n.getMessage("warningNotificationContent")
  });
}

function interceptRequest(requestDetails) {
  if (requestDetails.method == "POST" && requestDetails.url.indexOf("https://www.weibo.com/aj/mblog/add") != -1) {
    // TODO: check if the above url is the _only_ post URL
    let postText = requestDetails.requestBody.formData.text[0];

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://s.weibo.com/weibo/" + postText, true);
    xhr.onload = (e) => {
      let responseText = xhr.responseText;
      if (responseText.indexOf("\\u6839\\u636e\\u76f8\\u5173\\u6cd5\\u5f8b\\u6cd5\\u89c4\\u548c\\u653f\\u7b56\\uff0c\\u201c") != -1 && responseText.indexOf("\\u201d\\u641c\\u7d22\\u7ed3\\u679c\\u672a\\u4e88\\u663e\\u793a") != -1) {
        xhr = new XMLHttpRequest();
        xhr.open("POST", "https://cs.dpccdn.net/v1/post", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
          text: postText
        }));
        storeNewPotentiallyControversialPost(postText);
        sendWarningNotification();
      }
    }
    xhr.send();
  }
}

function sendUpdateNotification() {
  chrome.storage.local.get({
    lastUpdateNotification: 0,
    latestVersion: EXTENSION_VERSION,
    updateUrl: null
  }, (data) => {
    if (data.latestVersion > EXTENSION_VERSION) {
      let minumumLatestUpdateNotification = new Date().getTime() - (23 * 60 * 60 * 1000); // every 23 hours, so as to get them at all times of day
      if (data.lastUpdateNotification < minumumLatestUpdateNotification) {
        let id = "update_" + Math.random().toString(36).substring(7);
        chrome.notifications.create(id, {
          "type": "basic",
          "title": chrome.i18n.getMessage("updateNotificationTitle"),
          "iconUrl": "img/update-blue.png",
          "message": chrome.i18n.getMessage("updateNotificationContent")
        });
        chrome.notifications.onClicked.addListener((notificationId) => {
          if(id == notificationId){
            chrome.tabs.create({url: data.updateUrl});
          }
        });
        chrome.storage.local.set({lastUpdateNotification: new Date().getTime()})
      }
    }
  })
}

function checkForUpdate() {
  console.log("checking for update");
  chrome.storage.local.get({
    lastPing: 0 // the beginning of time! Nope. Just 1970.
  }, (data) => {
    console.log(data)
    let lastPing = data.lastPing;
    let minumumLatestPing = new Date().getTime() - (24 * 60 * 60 * 1000);
    if (lastPing < minumumLatestPing) {
      console.log("Pinging server")
      // perform the ping
      xhr = new XMLHttpRequest();
      xhr.open("POST", "https://cs.dpccdn.net/v1/version", true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
        version: EXTENSION_VERSION
      }));
      xhr.onload = (e) => {
        console.log("response: " + e);
        let responseJson = JSON.parse(xhr.responseText);
        let latestVersion = responseJson.latestVersion;
        let updateUrl = responseJson.url;
        chrome.storage.local.set({
          latestVersion: latestVersion,
          updateUrl: updateUrl
        });
        console.log({
          latestVersion: latestVersion,
          updateUrl: updateUrl
        });
        chrome.storage.local.set({lastPing: new Date().getTime()});
      }
    }
  });
  setTimeout(() => {
    sendUpdateNotification(); // will only run if update is available
  }, 10000); // 10 seconds later
}

chrome.webRequest.onBeforeRequest.addListener(
  interceptRequest, {
    urls: ["*://*.weibo.com/*"]
  },
  ["requestBody"]
);

// Setup
checkForUpdate();
setInterval(checkForUpdate, 60 * 1000); // will send new version check at most every 24 hours