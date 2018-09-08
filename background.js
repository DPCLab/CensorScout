//Runs in the background of the extension

//add a background worker first

function logURL(requestDetails) {
  if(requestDetails.method == "POST" && requestDetails.url.indexOf("https://www.weibo.com/aj/mblog/add") != -1){
    console.log(requestDetails.requestBody);
    var postText = requestDetails.requestBody.formData.text[0];
    console.log("Intercepted " + postText);

    //Initiate a GET request
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://s.weibo.com/weibo/" + postText, false);
    xhr.send();

    var responseText = xhr.responseText;

    // Then POST to the server if it has the correct data
    if(responseText.indexOf("\\u6839\\u636e\\u76f8\\u5173\\u6cd5\\u5f8b\\u6cd5\\u89c4\\u548c\\u653f\\u7b56\\uff0c\\u201c") != -1 && responseText.indexOf("\\u201d\\u641c\\u7d22\\u7ed3\\u679c\\u672a\\u4e88\\u663e\\u793a") != -1){
      console.log("YOU HAVE POSTED CENSORED CONTENT");
      xhr = new XMLHttpRequest();
      xhr.open("POST", "https://cs.dpccdn.net/v1", true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
        text: postText
      }));
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  logURL,
  {urls: ["*://*.weibo.com/*"]},
  ["requestBody"]
);

//sgxsg ↵sdfdfb
