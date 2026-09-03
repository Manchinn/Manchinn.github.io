(function () {
  var roles = window.resumeRoles || {};
  var defaultRole = "fullstack";
  var defaultTemplate = "standard";
  var roleSelect = document.getElementById("role-select");
  var templateSelect = document.getElementById("template-select");
  var resumeElement = document.querySelector(".resume");
  var roleTitle = document.querySelector("[data-role-title]");
  var summaryPrefix = document.querySelector("[data-role-summary-prefix]");
  var summaryBody = document.querySelector("[data-role-summary-body]");
  var availability = document.querySelector("[data-role-availability]");
  var printButton = document.getElementById("print-resume");
  var storageKey = "manchinn-resume-role";
  var templateStorageKey = "manchinn-resume-template";

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

  function getSavedTemplate() {
    try {
      return window.localStorage.getItem(templateStorageKey);
    } catch (error) {
      return null;
    }
  }

  function saveTemplate(templateKey) {
    try {
      window.localStorage.setItem(templateStorageKey, templateKey);
    } catch (error) {
      return;
    }
  }

  var getRoleFromUrl = function () {
    var params = new URLSearchParams(window.location.search);
    return params.get("role");
  };

  var defaultSkillLabels = {};
  document
    .querySelectorAll("[data-role-skill-label]")
    .forEach(function (element) {
      defaultSkillLabels[element.getAttribute("data-role-skill-label")] =
        element.textContent;
    });

  var getTemplateFromUrl = function () {
    var params = new URLSearchParams(window.location.search);
    return params.get("template");
  };

  function updateUrl(roleKey, templateKey) {
    var url = new URL(window.location.href);
    url.searchParams.set("role", roleKey);
    url.searchParams.set("template", templateKey);
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

  function applySkillLabels(labels) {
    document
      .querySelectorAll("[data-role-skill-label]")
      .forEach(function (element) {
        var labelKey = element.getAttribute("data-role-skill-label");
        var override = labels && labels[labelKey];

        element.textContent = override || defaultSkillLabels[labelKey] || element.textContent;
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
    applySkillLabels(role.skillLabels);
    applyCopy(role.copy);

    if (shouldPersist) {
      saveRole(selectedRoleKey);
      updateUrl(selectedRoleKey, templateSelect.value);
    }
  }

  function setTemplate(templateKey, shouldPersist) {
    var selectedTemplate = (templateKey === "harvard") ? "harvard" : "standard";
    templateSelect.value = selectedTemplate;

    if (selectedTemplate === "harvard") {
      resumeElement.classList.add("resume--harvard");
    } else {
      resumeElement.classList.remove("resume--harvard");
    }

    if (shouldPersist) {
      saveTemplate(selectedTemplate);
      updateUrl(roleSelect.value, selectedTemplate);
    }
  }

  roleSelect.addEventListener("change", function () {
    setRole(roleSelect.value, true);
  });

  templateSelect.addEventListener("change", function () {
    setTemplate(templateSelect.value, true);
  });

  printButton.addEventListener("click", function () {
    setRole(roleSelect.value, true);
    setTemplate(templateSelect.value, true);
    window.print();
  });

  var initRole = getRoleFromUrl() || getSavedRole() || defaultRole;
  var initTemplate = getTemplateFromUrl() || getSavedTemplate() || defaultTemplate;
  setRole(initRole, false);
  setTemplate(initTemplate, false);
})();
