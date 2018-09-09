// i18n text

$("#title").text(chrome.i18n.getMessage("name"));
$("#description").text(chrome.i18n.getMessage("description"));
$("#historyButton").text(chrome.i18n.getMessage("historyButton"));
$("#clearHistoryButton").text(chrome.i18n.getMessage("clearHistory"));
$(".backButton").text(chrome.i18n.getMessage("back"));


// setting button listeners

$("#historyButton").click(() => {
    $("#info").slideUp();
    $("#history").slideDown();
})

$("#infoButton").click(() => {
    $("#history").slideUp();
    $("#info").slideDown();
})

$("#clearHistoryButton").click(() => {
    chrome.storage.sync.set({
        postedTexts: []
    });
})

function loadHistory() {
    chrome.storage.sync.get({
        postedTexts: []
    }, (data) => {
        console.log(data);
        let html = "";
        if (data.postedTexts.length < 1) {
            html = chrome.i18n.getMessage("historyEmpty");
        } else {
            html += "<ul>";
            for (let post of data.postedTexts) {
                html += "<li>" + escapeHtml(post) + "</li>";
            }
            html += "</ul>";
        }
        $("#history-list").html(html);
    })
}

loadHistory();
chrome.storage.onChanged.addListener(function (changes, namespace) {
    loadHistory();
});


// utility functions

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}