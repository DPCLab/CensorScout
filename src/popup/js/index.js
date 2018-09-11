// i18n text

$("#title").text(chrome.i18n.getMessage("name"));
$("#description").text(chrome.i18n.getMessage("description"));
$("#historyButton").text(chrome.i18n.getMessage("historyButton"));
$("#clearHistoryButton").text(chrome.i18n.getMessage("clearHistory"));
$(".backButton").text(chrome.i18n.getMessage("back"));
$("#updateButton").text(chrome.i18n.getMessage("updateButton"));

// pulling values
const EXTENSION_VERSION = parseInt(chrome.runtime.getManifest().version);

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

function updateButtonRefresh() {
    chrome.storage.local.get({
        latestVersion: EXTENSION_VERSION,
        updateUrl: null
    }, (data) => {
        if (EXTENSION_VERSION < data.latestVersion) {
            $('#updateButton').on('click', function () {
                chrome.tabs.create({
                    url: data.updateUrl
                });
                return false;
            });
            $("#updateButtonContainer").show();
        } else {
            $("#updateButtonContainer").hide();
        }
    })
}


// setup

$("#updateButtonContainer").hide();
loadHistory();
updateButtonRefresh();
chrome.storage.onChanged.addListener(function (changes, namespace) {
    loadHistory();
    updateButtonRefresh();
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