
var sha256 = require('tiny-sha256');
var generateEmbedHtml = require('./generate-embed-html').generateEmbedHtml;

(function() {

    function _message_to_sha256_hextring(message) {
        return sha256(message);
    }

    function format_date(str) {
        var date = new Date(str);
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames[monthIndex] + ' ' + day + ", " + year;
    }

    var badges = document.getElementsByClassName("badgr-badge");

    for (var i = 0; i < badges.length; i++) {
        var badge = badges[i];

        var includeAwardDate = badge.getElementsByClassName("badgr-badge-date").length > 0;
        var includeBadgeName = badge.getElementsByClassName("badgr-badge-name").length > 0;
        var includeRecipientName = badge.getElementsByClassName("badgr-badge-recipient").length > 0;
        var includeVerifyButton = badge.getElementsByClassName("badgr-badge-verify").length > 0;

        var els = badge.getElementsByTagName("script");
        var staticPrefix = (els.length > 0) ? els[0].getAttribute("src").replace("widgets.bundle.js",'') : "https://badgr.io/";

        var as = badge.getElementsByTagName("a");
        if (as.length > 0) {
            var a = as[0];
            var badge_url = a.getAttribute("href");
            var expand_badge_url = badge_url + (badge_url.indexOf('?') === -1 ? '?' : '&') + 'expand=badge';

            var xhr = new XMLHttpRequest();
            xhr.open('GET', expand_badge_url, true);
            xhr.setRequestHeader('accept', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    if (data.revoked) {
                        var reason = badge.revocationReason ? badge.revocationReason : "";
                        badge.innerHTML = "This assertion has been revoked. "+reason;
                        return;
                    }

                    var recipientName = ('extensions:recipientProfile' in data) ? data['extensions:recipientProfile']['name'] : undefined;

                    var verified = false;
                    if (data.recipient.type === "url") {
                        var current_location = window.location.toString();
                        if (data.recipient.hashed) {
                            var parts = data.recipient.identity.split("$", 2);
                            var expected = parts[1];
                            var hash = _message_to_sha256_hextring(current_location + data.recipient.salt);
                            if (hash === expected) {
                                verified = true;
                            }
                        } else {
                            verified = (data.recipient.identity === current_location);
                        }
                    }

                    var blockquote = generateEmbedHtml({
                        shareUrl: badge_url,
                        imageUrl: data.image,
                        includeBadgeClassName: includeBadgeName,
                        includeRecipientName: includeRecipientName && recipientName,
                        includeAwardDate: includeAwardDate,
                        includeVerifyButton: includeVerifyButton,
                        badgeClassName: data.badge.name,
                        recipientName: recipientName,
                        awardDate: format_date(data.issuedOn),
                        verified: verified,
                        includeScript: false,
                        staticPrefix: staticPrefix,
                    });
                    badge.innerHTML = blockquote.innerHTML;
                    badge.setAttribute("style", 'border: none; font-family: Helvetica, Roboto, \"Segoe UI\", Calibri, sans-serif; border-radius: 4px; max-width: 500px; margin: 0; padding: 30px; position: unset; quotes: unset;');
                }
            };
            xhr.send();

        }
    }

})();
