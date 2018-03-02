
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

        badge.style.border = "1px solid red";
        badge.style.position = "static";
        badge.style.width = "300px";
        badge.style.margin = "0";
        badge.style["min-width"] = "220px";

        var ps = badge.getElementsByTagName("p");
        var awardedP = ps.length > 0 ? ps[0] : undefined;


        var as = badge.getElementsByTagName("a");
        if (as.length > 0) {
            var a = as[0];
            a.setAttribute("target", "_blank");
            var badge_url = a.getAttribute("href")+"?expand=badge";

            var labels = a.getElementsByTagName("span");
            var labelSpan = labels.length > 0 ? labels[0] : undefined;

            var imgs = a.getElementsByTagName("img");
            var imgTag = imgs.length > 0 ? imgs[0] : undefined;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', badge_url, true)
            xhr.setRequestHeader('accept', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    console.log("assertion", data);

                    if (labelSpan) {
                        labelSpan.innerHTML = data.badge.name;
                    }
                    if (awardedP) {
                        awardedP.innerHTML = "Awarded: "+format_date(data.issuedOn);
                    }
                    if (imgTag) {
                        imgTag.src = data.badge.image;
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
