(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("route-canvas");
  var ctx = canvas.getContext("2d");
  var width = 0;
  var height = 0;
  var dpr = 1;
  var routes = [];
  var pointer = { x: 0.5, y: 0.5 };
  var colors = [
    "rgba(100, 242, 138, 0.78)",
    "rgba(75, 224, 210, 0.72)",
    "rgba(247, 201, 95, 0.72)",
    "rgba(239, 111, 143, 0.62)"
  ];

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildRoutes();
    if (reduceMotion) {
      draw(0);
    }
  }

  function buildRoutes() {
    routes = [];
    var count = Math.max(12, Math.floor(width / 110));
    var lanes = Math.max(5, Math.floor(height / 140));

    for (var i = 0; i < count; i += 1) {
      var y = ((i % lanes) + 0.8) * (height / (lanes + 0.8));
      var offset = (i * 47) % 130;
      var startX = -80 - offset;
      var endX = width + 120 + offset;
      var midX = width * (0.22 + ((i % 5) * 0.13));
      var drift = ((i % 3) - 1) * 54;
      var points = [
        { x: startX, y: y },
        { x: midX, y: y + drift },
        { x: midX + width * 0.18, y: y + drift },
        { x: endX, y: y + ((i % 2) * 36 - 18) }
      ];

      routes.push({
        color: colors[i % colors.length],
        dash: 58 + ((i * 13) % 44),
        gap: 170 + ((i * 19) % 90),
        speed: 0.55 + ((i % 6) * 0.08),
        phase: i * 31,
        points: points
      });
    }
  }

  function drawGrid() {
    var shiftX = (pointer.x - 0.5) * 18;
    var shiftY = (pointer.y - 0.5) * 18;

    ctx.save();
    ctx.translate(shiftX, shiftY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(244, 241, 232, 0.045)";

    for (var x = -120; x < width + 160; x += 96) {
      ctx.beginPath();
      ctx.moveTo(x, -40);
      ctx.lineTo(x, height + 40);
      ctx.stroke();
    }

    for (var y = -120; y < height + 160; y += 96) {
      ctx.beginPath();
      ctx.moveTo(-40, y);
      ctx.lineTo(width + 40, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function strokeRoute(route, time) {
    ctx.beginPath();
    route.points.forEach(function (point, index) {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(244, 241, 232, 0.08)";
    ctx.setLineDash([]);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = route.color;
    ctx.setLineDash([route.dash, route.gap]);
    ctx.lineDashOffset = -(time * route.speed * 0.12 + route.phase);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(7, 8, 7, 0.96)";
    ctx.fillRect(0, 0, width, height);
    drawGrid();

    ctx.save();
    ctx.translate((pointer.x - 0.5) * -14, (pointer.y - 0.5) * -14);
    routes.forEach(function (route) {
      strokeRoute(route, time);
    });
    ctx.restore();

    if (!reduceMotion) {
      window.requestAnimationFrame(draw);
    }
  }

  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
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
      { threshold: 0.14 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initActiveNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
    var sections = links
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    if (!("IntersectionObserver" in window)) {
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          links.forEach(function (link) {
            link.classList.toggle("is-current", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-34% 0px -58% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initPointerHighlights() {
    var targets = Array.prototype.slice.call(document.querySelectorAll(".route-card, .route-node"));

    targets.forEach(function (target) {
      target.addEventListener("pointermove", function (event) {
        var rect = target.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width) * 100;
        var y = ((event.clientY - rect.top) / rect.height) * 100;
        target.style.setProperty("--pointer-x", x.toFixed(2) + "%");
        target.style.setProperty("--pointer-y", y.toFixed(2) + "%");
      });

      target.addEventListener("pointerleave", function () {
        target.style.removeProperty("--pointer-x");
        target.style.removeProperty("--pointer-y");
      });
    });
  }

  function initAvatarFallback() {
    var avatar = document.querySelector(".avatar");
    var fallback = document.querySelector(".avatar-fallback");

    if (!avatar || !fallback) {
      return;
    }

    avatar.addEventListener("error", function () {
      avatar.hidden = true;
      fallback.hidden = false;
    });
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener(
    "pointermove",
    function (event) {
      pointer.x = event.clientX / Math.max(window.innerWidth, 1);
      pointer.y = event.clientY / Math.max(window.innerHeight, 1);
    },
    { passive: true }
  );

  resizeCanvas();
  initReveal();
  initActiveNav();
  initPointerHighlights();
  initAvatarFallback();
  draw(0);
})();
