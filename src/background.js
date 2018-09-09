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

async function getPotentiallyControversialPosts() {
  let dataResponse = await chrome.storage.sync.get({
    postedTexts: []
  });
  return dataResponse.postedTexts;
}

function sendWarningNotification() {
  chrome.notifications.create("controversyNotification", {
    "type": "basic",
    "title": chrome.i18n.getMessage("warningNotificationTitle"),
    "iconUrl": "img/warning-green.png",
    "message": chrome.i18n.getMessage("warningNotificationContent")
  });
}

function interceptRequest(requestDetails) {
  if (requestDetails.method == "POST" && requestDetails.url.indexOf("https://www.weibo.com/aj/mblog/add") != -1) {
    var postText = requestDetails.requestBody.formData.text[0];

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://s.weibo.com/weibo/" + postText, false);
    xhr.send();

    var responseText = xhr.responseText;

    if (responseText.indexOf("\\u6839\\u636e\\u76f8\\u5173\\u6cd5\\u5f8b\\u6cd5\\u89c4\\u548c\\u653f\\u7b56\\uff0c\\u201c") != -1 && responseText.indexOf("\\u201d\\u641c\\u7d22\\u7ed3\\u679c\\u672a\\u4e88\\u663e\\u793a") != -1) {
      xhr = new XMLHttpRequest();
      xhr.open("POST", "https://cs.dpccdn.net/v1", true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
        text: postText
      }));
      storeNewPotentiallyControversialPost(postText);
      sendWarningNotification();
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  interceptRequest, {
    urls: ["*://*.weibo.com/*"]
  },
  ["requestBody"]
);