(function () {
  // Swap to text fallback if the GitHub avatar fails to load.
  var avatar = document.querySelector(".avatar");
  var fallback = document.querySelector(".avatar-fallback");

  if (avatar && fallback) {
    avatar.addEventListener("error", function () {
      avatar.hidden = true;
      fallback.hidden = false;
    });
  }

  // Live Bangkok time (GMT+7) in the status bar — purely cosmetic.
  var clock = document.querySelector("[data-clock]");

  if (clock) {
    var formatter;
    try {
      formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (error) {
      formatter = null;
    }

    if (formatter) {
      var tick = function () {
        clock.textContent = formatter.format(new Date()) + " GMT+7";
      };
      tick();
      window.setInterval(tick, 1000);
    }
  }
})();
