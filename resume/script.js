(function () {
  var roles = window.resumeRoles || {};
  var defaultRole = "fullstack";
  var roleSelect = document.getElementById("role-select");
  var roleTitle = document.querySelector("[data-role-title]");
  var summaryPrefix = document.querySelector("[data-role-summary-prefix]");
  var summaryBody = document.querySelector("[data-role-summary-body]");
  var availability = document.querySelector("[data-role-availability]");
  var printButton = document.getElementById("print-resume");
  var storageKey = "manchinn-resume-role";

  function getSavedRole() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function saveRole(roleKey) {
    try {
      window.localStorage.setItem(storageKey, roleKey);
    } catch (error) {
      return;
    }
  }

  function getRoleFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get("role");
  }

  function updateUrl(roleKey) {
    var url = new URL(window.location.href);
    url.searchParams.set("role", roleKey);
    window.history.replaceState({}, "", url);
  }

  function getRole(roleKey) {
    return roles[roleKey] ? roleKey : defaultRole;
  }

  function applySkills(skills) {
    document.querySelectorAll("[data-role-skill]").forEach(function (element) {
      var skillKey = element.getAttribute("data-role-skill");

      if (skills[skillKey]) {
        element.textContent = skills[skillKey];
      }
    });
  }

  function applyCopy(copy) {
    document.querySelectorAll("[data-role-copy]").forEach(function (element) {
      var copyKey = element.getAttribute("data-role-copy");

      if (copy[copyKey]) {
        element.textContent = copy[copyKey];
      }
    });
  }

  function setRole(roleKey, shouldPersist) {
    var selectedRoleKey = getRole(roleKey);
    var role = roles[selectedRoleKey];

    roleSelect.value = selectedRoleKey;
    roleTitle.textContent = role.title;
    summaryPrefix.textContent = role.summaryPrefix;
    summaryBody.textContent = role.summaryBody;
    availability.textContent = role.availability;
    document.title = "Chinnakrit Sripan Resume - " + role.title;

    applySkills(role.skills);
    applyCopy(role.copy);

    if (shouldPersist) {
      saveRole(selectedRoleKey);
      updateUrl(selectedRoleKey);
    }
  }

  roleSelect.addEventListener("change", function () {
    setRole(roleSelect.value, true);
  });

  printButton.addEventListener("click", function () {
    setRole(roleSelect.value, true);
    window.print();
  });

  setRole(getRoleFromUrl() || getSavedRole() || defaultRole, false);
})();
