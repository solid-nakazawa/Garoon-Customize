// Push通知ライブラリ
const pushjs = document.createElement("script");
pushjs.src = "https://cdnjs.cloudflare.com/ajax/libs/push.js/1.0.9/push.min.js";
document.getElementsByTagName("body")[0].appendChild(pushjs);

window.onload = () => {
  // 通知数の初期化
  let notifCount = 0;
  let notifCountOld = notifCount;
  let pushSkipCount = 0;

  const pushNotification = () => {
    if (document.querySelectorAll("#notification_number")[0]) {
      notifCount = 0;
      pushSkipCount++;
      const headerNotifElem = document.querySelectorAll(
        "#cloudHeader-grnNotificationTitle-grn"
      )[0];
      if (headerNotifElem.getAttribute("aria-expanded") === "true") {
        // 既に通知を開いていたら閉じる
        headerNotifElem.click();
      }

      // 通知が閉じるのを待ってから
      setTimeout(() => {
        headerNotifElem.click();

        // 通知が開くのを待ってから
        setTimeout(() => {
          // 数字を確認
          const notifCollection = document.querySelectorAll(
            "#js_page_header_notification"
          )[0].children[2].children;
          notifCount = parseInt(
            document.querySelectorAll("#notification_number")[0].textContent,
            10
          );
          if (pushSkipCount > 60 && notifCollection.length > 0) {
            pushSkipCount = 0;
          } else if (
            notifCollection.length === 0 ||
            notifCount <= notifCountOld
          ) {
            // 通知なければ or デスクトップ通知済みなら閉じておく
            headerNotifElem.click();
            return;
          }
          notifCountOld = notifCount;
          let pushBody = "";
          var notifElems = Array.prototype.slice.call(notifCollection);
          notifElems.forEach((elem, index) => {
            const dateCharIndex = elem.outerText[2] === ":" ? 5 : 8;
            pushBody += `${index + 1}件目\r\n`;
            pushBody += `${elem.outerText.substring(
              0,
              dateCharIndex
            )} - ${elem.outerText.substring(dateCharIndex)}\r\n`;
          });

          // 通知欄は閉じておく
          headerNotifElem.click();

          // デスクトップ通知
          Push.create("Garoonに通知が" + notifCount + "件あります。", {
            body: pushBody,
            icon: "/cbgrn/grn/image/cybozu/garoon.ico",
            timeout: 3600000,
            tag: "garoon",
            onClick: () => {
              // 通知欄を開いてフォーカス
              headerNotifElem.click();
              window.focus();
            },
          });
        }, 1 * 1000);
      }, 1 * 1000);

      // 60秒ごとに通知をチェック
      setTimeout(() => {
        pushNotification();
      }, 60 * 1000);
    }
  };

  const isSupport = (() => {
    const ua = window.navigator.userAgent.toLowerCase();
    // IE, Android, iOS系以外をサポート
    if (
      ua.indexOf("msie") === -1 &&
      ua.indexOf("trident") === -1 &&
      ua.indexOf("iphone") === -1 &&
      ua.indexOf("ipod") === -1 &&
      ua.indexOf("android") === -1 &&
      ua.indexOf("mobile") === -1 &&
      ua.indexOf("ipad") === -1
    ) {
      return true;
    }
    return false;
  })();

  // Push通知許可リクエスト
  if (isSupport) {
    Push.Permission.request(() => {
      // 許可が出れば通知チェック開始
      pushNotification();
    });
  }
};
