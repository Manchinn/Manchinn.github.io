(function () {
  var avatar = document.querySelector(".avatar");
  var fallback = document.querySelector(".avatar-fallback");
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (avatar && fallback) {
    avatar.addEventListener("error", function () {
      avatar.hidden = true;
      fallback.hidden = false;
    });
  }

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach(function (item) {
    observer.observe(item);
  });
})();
