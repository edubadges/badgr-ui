
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
        includeVerifyButton: false
    };

    const blockquote = document.createElement("blockquote");
    blockquote.className = "badgr-badge";

    const a = document.createElement("a");
    a.href = options.shareUrl;
    const img = document.createElement("img");
    img.setAttribute("width", "120px");
    img.setAttribute("height", "120px");
    img.src = options.imageUrl;
    a.appendChild(img);
    blockquote.appendChild(a);

    if (options.includeBadgeClassName && options.badgeClassName) {
        const nameP = document.createElement("p");
        nameP.className = "badgr-badge-name";
        nameP.setAttribute("style", "font-size: 16px; font-weight: 600; font-style: normal; font-stretch: normal; line-height: 1.25; letter-spacing: normal; text-align: left; color: #05012c;");
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
        dateP.setAttribute("style", "font-size: 12px; font-weight: 600; font-style: normal; font-stretch: normal; line-height: 1.67; letter-spacing: normal; text-align: left; color: #47587f;");

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
        recipientP.setAttribute("style", "font-size: 12px; font-weight: 600; font-style: normal; font-stretch: normal; line-height: 1.67; letter-spacing: normal; text-align: left; color: #47587f;");
        recipientP.innerHTML += " "+options.recipientName;
        blockquote.appendChild(recipientP);
    }

    if (options.includeVerifyButton) {
        const verifyTag = document.createElement("a");
        verifyTag.className = "badgr-badge-verify";
        verifyTag.setAttribute("target", "_blank");
        verifyTag.setAttribute("href", "https://badgecheck.io?url="+options.shareUrl);
        verifyTag.innerHTML = "VERIFY";
        verifyTag.setAttribute("style", "font-size:14px; font-weight: bold;  width: 48px; height: 14px; border-radius: 4px; background-color: #f7f7f7; border: solid 1px #a09eaf;   color: #49447f; text-decoration: none; padding: 6px 16px; margin: 16px 0; display: block");
        blockquote.appendChild(verifyTag);
    }

    const widgetTag = document.createElement("script");
    widgetTag.setAttribute("async","async");
    widgetTag.setAttribute("src", "http://localhost:4000/widgets.bundle.js");
    blockquote.appendChild(widgetTag);

    return blockquote;
}

