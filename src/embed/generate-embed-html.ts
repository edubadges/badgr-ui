
const checkmarkSvg = require("../breakdown/static/images/checkmark-circle.svg");

export function generateEmbedHtml(embedOptions) {
    const options = embedOptions || {
        shareUrl: null,
        imageUrl: null,
        includeBadgeClassName: false,
        badgeClassName: null,
        includeAwardDate: false,
        awardDate: null,
        includeRecipientName: false,
        recipientName: null,
        recipientIdentifier: null,
        recipientType: null,
        includeVerifyButton: false,
        verified: false,
        includeScript: true,
        staticPrefix: null,
    };

    const shareUrl = embedOptions.recipientIdentifier ? (options.shareUrl+"&identity__"+(embedOptions.recipientType || "email")+"="+embedOptions.recipientIdentifier) : options.shareUrl;

    const blockquote = document.createElement("blockquote");
    blockquote.className = "badgr-badge";
    blockquote.setAttribute("style", 'font-family: Helvetica, Roboto, \"Segoe UI\", Calibri, sans-serif;');

    const a = document.createElement("a");
    a.href = shareUrl;
    const img = document.createElement("img");
    img.setAttribute("width", "120px");
    img.setAttribute("height", "120px");
    img.src = options.imageUrl;
    a.appendChild(img);
    blockquote.appendChild(a);

    if (options.includeBadgeClassName && options.badgeClassName) {
        const nameP = document.createElement("p");
        nameP.className = "badgr-badge-name";
        nameP.setAttribute("style", "margin: 0; font-size: 16px; font-weight: 600; font-style: normal; font-stretch: normal; line-height: 1.25; letter-spacing: normal; text-align: left; color: #05012c;");
        nameP.innerHTML = options.badgeClassName;
        blockquote.appendChild(nameP);
    }

    if (options.includeAwardDate) {
        const dateP = document.createElement("p");
        dateP.className = "badgr-badge-date";
        const dateStrong = document.createElement("strong");
        dateStrong.setAttribute("style", "font-size: 12px; font-weight: bold; font-style: normal; font-stretch: normal; line-height: 1.67; letter-spacing: normal; text-align: left; color: #6c6b80;");
        dateStrong.innerHTML = "Awarded:";
        dateP.appendChild(dateStrong);
        dateP.setAttribute("style", "margin: 0; font-size: 12px; font-weight: 600; font-style: normal; font-stretch: normal; line-height: 1.67; letter-spacing: normal; text-align: left; color: #47587f;");

        dateP.innerHTML += " "+options.awardDate;
        blockquote.appendChild(dateP);
    }

    if (options.includeRecipientName && options.recipientName) {
        const recipientP = document.createElement("p");
        recipientP.className = "badgr-badge-recipient";
        const recipientStrong = document.createElement("strong");
        recipientStrong.setAttribute("style", "font-size: 12px; font-weight: bold; font-style: normal; font-stretch: normal; line-height: 1.67; letter-spacing: normal; text-align: left; color: #6c6b80;");
        recipientStrong.innerHTML = "Awarded To:";
        recipientP.appendChild(recipientStrong);
        recipientP.setAttribute("style", "margin: 0; font-size: 12px; font-weight: 600; font-style: normal; font-stretch: normal; line-height: 1.67; letter-spacing: normal; text-align: left; color: #47587f; ");

        const recipientSpan = document.createElement("span");
        recipientSpan.style.display = "block";
        recipientSpan.innerHTML = options.recipientName;
        recipientP.appendChild(recipientSpan);
        blockquote.appendChild(recipientP);
    }

    if (options.includeVerifyButton) {
        const verifyP = document.createElement("p");
        verifyP.setAttribute("style", "margin: 16px 0; padding: 0;");

        const verifyTag = document.createElement("a");
        verifyTag.className = "badgr-badge-verify";
        verifyTag.setAttribute("target", "_blank");
        verifyTag.setAttribute("href", "https://badgecheck.edubadges.nl?url="+options.shareUrl);
        verifyTag.setAttribute("style", "margin: 0; line-height: 14px; font-size:14px; font-weight: bold;  width: 48px; height: 16px; border-radius: 4px; background-color: #f7f7f7; border: solid 1px #a09eaf;   color: #49447f; text-decoration: none; padding: 6px 16px; margin: 16px 0; ");
        if (options.verified) {
            var svgUrl = (options.staticPrefix || window.location.origin)+checkmarkSvg;
            var checkImg = document.createElement("img");
            checkImg.src = svgUrl;
            verifyTag.appendChild(checkImg);
            verifyTag.innerHTML += " VERIFIED!";
            verifyTag.style.width = "90px";
        } else {
            verifyTag.innerHTML = "VERIFY";
        }

        verifyP.appendChild(verifyTag);
        blockquote.appendChild(verifyP);
    }

    if (options.includeScript) {
        var scriptUrl = (options.staticPrefix || window.location.origin)+"/widgets.bundle.js";
        const widgetTag = document.createElement("script");
        widgetTag.setAttribute("async","async");
        widgetTag.setAttribute("src", scriptUrl);
        blockquote.appendChild(widgetTag);
    }

    return blockquote;
}

