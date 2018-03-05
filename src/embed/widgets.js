
// var shajs = require('sha.js');
var sha256 = require('tiny-sha256');

(function() {

    function _message_to_sha256_hextring(message) {
        // return shajs('sha256').update(message).digest('hex');
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

        var els;

        els = badge.getElementsByClassName("badgr-badge-date");
        var dateTag = els.length > 0 ? els[0] : undefined;

        els = badge.getElementsByClassName("badgr-badge-name");
        var badgenameTag = els.length > 0 ? els[0] : undefined;

        els = badge.getElementsByClassName("badgr-badge-recipient");
        var recipientTag = els.length > 0 ? els[0] : undefined;

        var as = badge.getElementsByTagName("a");
        if (as.length > 0) {
            var a = as[0];
            a.setAttribute("target", "_blank");
            var badge_url = a.getAttribute("href")+"?expand=badge";


            var imgs = a.getElementsByTagName("img");
            var imgTag = imgs.length > 0 ? imgs[0] : undefined;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', badge_url, true);
            xhr.setRequestHeader('accept', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    console.log("assertion", data);

                    badge.style["max-width"] = "440px";
                    badge.style["margin"] = "0px";
                    badge.style["border-radius"] = "4px";
                    badge.style["border"] = "1px solid #efefef";
                    badge.style["padding"] = "32px";

                    badge.style["font-family"] = '"OpenSans", Helvetica, Roboto, "Segoe UI", Calibri, sans-serif';

                    badge.style["font-style"] = "normal";
                    badge.style["font-stretch"] = "normal";
                    badge.style["letter-spacing"] = "normal";
                    badge.style["text-align"] = "left";

                    if (badgenameTag) {
                        badgenameTag.innerHTML = data.badge.name;
                        badgenameTag.style["color"] = "#05012c";
                        badgenameTag.style["line-height"] = "1.25";
                        badgenameTag.style["font-weight"] = "600";
                        badgenameTag.style["font-size"] = "16px";
                        badgenameTag.style["padding"] = "4px 0";
                        badgenameTag.style["margin"] = "0";
                    }
                    if (dateTag) {
                        dateTag.innerHTML = "";
                        dateTag.style["line-height"] = "1.67";
                        dateTag.style["font-weight"] = "600";
                        dateTag.style["font-size"] = "12px";
                        dateTag.style["color"] = "#47587f";
                        dateTag.style["padding"] = "4px 0";
                        dateTag.style["margin"] = "0";

                        var strong = document.createElement("strong");
                        strong.innerHTML = "Awarded:";
                        strong.style["color"] = "#6c6b80";
                        strong.style["font-weight"] = "bold";
                        dateTag.appendChild(strong);

                        dateTag.innerHTML += " "+format_date(data.issuedOn);
                    }
                    if (imgTag) {
                        imgTag.src = data.badge.image;
                        imgTag.style["height"] = "128px";
                        imgTag.style["width"] = "auto";
                    }
                    if (recipientTag) {
                        if (data.extensions && data.extensions["extensions:RecipientProfile"]) {
                            recipientTag.innerHTML = "";
                            recipientTag.style["line-height"] = "1.67";
                            recipientTag.style["font-weight"] = "600";
                            recipientTag.style["font-size"] = "12px";
                            recipientTag.style["color"] = "#47587f";
                            recipientTag.style["padding"] = "4px 0";
                            recipientTag.style["margin"] = "0";

                            var strong = document.createElement("strong");
                            strong.innerHTML = "Awarded To:";
                            strong.style["color"] = "#6c6b80";
                            strong.style["font-weight"] = "bold";
                            recipientTag.appendChild(strong);

                            recipientTag.innerHTML += " " + data.extensions["extensions:RecipientProfile"].name;
                        } else {
                            badge.removeChild(recipientTag);
                        }
                    }


                    if (data.recipient.type === "url") {
                        var verified = false;
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

                        if (verified) {
                            var verifiedDiv = document.createElement("div");

                            var verifiedImg = document.createElement("img");
                            verifiedImg.setAttribute("width", "32px");
                            verifiedImg.src = "https://openclipart.org/download/257462/Checkmark.svg";
                            verifiedDiv.appendChild(verifiedImg);

                            var verifiedLabel = document.createElement("span");
                            verifiedLabel.innerHTML = "Appears on webpage it was awarded to";
                            verifiedDiv.appendChild(verifiedLabel);

                            badge.appendChild(verifiedDiv)
                        }
                    }
                }
            };
            xhr.send();

        }
    }

})();
