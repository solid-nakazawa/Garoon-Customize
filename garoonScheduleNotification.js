(() => {
  // Push通知ライブラリ
  const pushJs = document.createElement("script");
  pushJs.src =
    "https://cdnjs.cloudflare.com/ajax/libs/push.js/1.0.9/push.min.js";
  document.getElementsByTagName("body")[0].appendChild(pushJs);

  // 10分間隔でチェック
  const DEFAULT_NOTIFICATION_INTERVAL = 20 * 60 * 1000;
  const DEFAULT_NOTIFICATION_TIME_PLUS = 5 * 60 * 1000;
  // 通知時間
  const DEFAULT_NOTIFICATION_TIME = [
    0, // ちょうど
    1 * 60 * 1000, // 1分前
    10 * 60 * 1000, // 10分前
  ];

  let timerList = [];

  const checkSchedules = () => {
    // スケジュール再帰チェック登録
    setTimeout(() => {
      checkSchedules();
    }, DEFAULT_NOTIFICATION_INTERVAL);

    // APIアクセス
    const result = getSchedules(() => {
      const pushIcon = "/cbgrn/grn/image/cybozu/garoon.ico";

      // API動作チェック
      if (result.status !== 200) {
        // デスクトップ通知
        Push.create("取得失敗 : スケジュールAPI", {
          body:
            "スケジュールAPIから応答を正常に取得することができませんでした。\r\nGaroonが正常に動いているか確認の後、ページを再読込してください。",
          icon: pushIcon,
          timeout: 3600000,
          onClick: () => {
            window.focus();
          },
        });
        return;
      }

      // 予約している通知をすべて解除する
      timerList.forEach((timer) => {
        clearTimeout(timer);
      });
      timerList = [];

      const now = new Date();

      // 予定のデスクトップ通知登録
      result.responseJSON.events.forEach((event) => {
        const eventStartDate = new Date(event.start.dateTime);
        const eventPlace =
          event.facilities.length > 0 ? `${event.facilities[0].name}で` : "";
        const eventMenu = event.eventMenu ? `【${event.eventMenu}】 ` : "";
        const time = `${("0" + eventStartDate.getHours()).slice(-2)}:${(
          "0" + eventStartDate.getMinutes()
        ).slice(-2)}`;
        const notes = event.notes.length > 0 ? `\n\n${event.notes}` : "";
        const pushBody =
          event.eventMenu == "休み"
            ? `${time}から ${event.subject} でおやすみです。${notes}`
            : `${time}から ${eventPlace}「${eventMenu}${event.subject}」 があります。${notes}`;

        DEFAULT_NOTIFICATION_TIME.forEach((notificationTime) => {
          const notificationWait =
            eventStartDate.getTime() - now.getTime() - notificationTime;
          if (notificationWait < 0) {
            // すでに通知時刻を過ぎていればスキップ
            return;
          } else if (notificationWait > DEFAULT_NOTIFICATION_INTERVAL) {
            // スケジュールチェック間隔よりも遠い予約はスキップ
            return;
          }

          // ここだいぶ適当だけど、通知時間を分単位で設定すればOKってことにしたい
          let pushTitle = `予定の ${notificationTime / 1000 / 60}分前 です`;
          if (notificationTime === 0) {
            pushTitle = "予定の時間です";
          }

          // デスクトップ通知の登録
          timerList.push(
            setTimeout(() => {
              Push.create(pushTitle, {
                body: pushBody,
                icon: pushIcon,
                timeout: notificationTime + DEFAULT_NOTIFICATION_TIME_PLUS,
                onClick: () => {
                  window.open(
                    `/cgi-bin/cbgrn/grn.exe/schedule/view?event=${event.id}`,
                    "_blank"
                  );
                },
              });
            }, notificationWait)
          );

          // 1分前用にSlack通知の登録
          if (notificationTime === 1 * 60 * 1000 && window.SLACK_WEBHOOK_URL) {
            let mention = "";
            if (event.subject.indexOf("BDS") >= 0) {
              mention = "<!here> ";
            } else {
              mention = `${window.MY_NAME}は`;
            }
            setTimeout(() => {
              jQuery.ajax({
                type: "POST",
                url: window.SLACK_WEBHOOK_URL,
                data:
                  "payload=" +
                  JSON.stringify({
                    text: `${mention}${pushBody}`,
                  }),
              });
            }, notificationWait);
          }
        });
      });
    });
  };

  const getSchedules = (callback) => {
    const SCHEDULE_API_URL = "/cgi-bin/cbgrn/grn.exe/api/v1/schedule/events";
    const now = new Date();
    return jQuery.get(
      SCHEDULE_API_URL,
      {
        limit: 10,
        orderBy: "start asc",
        rangeStart: now.toISOString(),
      },
      callback
    );
  };

  // サポート判定
  const isSupport = (() => {
    const ua = window.navigator.userAgent.toLowerCase();
    // IE系以外をサポート
    if (ua.indexOf("msie") === -1 && ua.indexOf("trident") === -1) {
      return true;
    }
    return false;
  })();

  // スクリプト実行
  (() => {
    if (isSupport) {
      const pushTimer = setInterval(() => {
        // Push.jsを読み込めるまで待機
        if (typeof Push === "object") {
          // Push通知許可リクエスト
          Push.Permission.request(() => {
            // 許可が出ればスケジュールチェック開始
            checkSchedules();
          });
          clearInterval(pushTimer);
        }
      }, 100);
    }
  })();
})();
