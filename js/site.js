(function () {
  var form = document.querySelector("#contact-form");
  if (!form) return;

  var summary = document.getElementById("error-summary");
  var summaryList = document.getElementById("error-list");
  var sendError = document.getElementById("send-error");
  var thanks = document.getElementById("thanks");
  var thanksDetail = document.getElementById("thanks-detail");
  var resetButton = document.getElementById("thanks-reset");
  var submitButton = document.getElementById("send");

  var checks = [
    {
      id: "name",
      message: "Enter your name.",
      valid: function (value) {
        return value.trim().length > 0;
      },
    },
    {
      id: "email",
      message: "Enter an email address, such as name@school.example.",
      valid: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      },
    },
    {
      id: "message",
      message: "Enter a message.",
      valid: function (value) {
        return value.trim().length > 0;
      },
    },
  ];

  form.noValidate = true;

  form.addEventListener("input", clearErrors);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var problems = validate();
    if (problems.length > 0) {
      showErrors(problems);
      return;
    }
    clearErrors();
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";

    if (isPlaceholder()) {
      showThanks(
        "Your details passed the checks on this page. Nothing was sent, because this form still uses the placeholder id YOUR_FORM_ID. Once a Formspree id is in place, this button delivers the message."
      );
      return;
    }

    var action = form.getAttribute("action");
    fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then(function (response) {
        if (response.ok) {
          showThanks("Your message has been sent. James will reply to the email address you gave.");
          return;
        }
        return response
          .json()
          .catch(function () {
            return null;
          })
          .then(function (payload) {
            var detail = "That message could not be sent. Please try again in a moment.";
            if (payload && typeof payload.error === "string" && payload.error) {
              detail = payload.error;
            }
            showSendError(detail);
          });
      })
      .catch(function () {
        showSendError("That message could not be sent. Check the connection and try again.");
      });
  });

  resetButton.addEventListener("click", function () {
    form.reset();
    form.hidden = false;
    thanks.hidden = true;
    submitButton.disabled = false;
    submitButton.textContent = "Send message";
    var name = document.getElementById("name");
    if (name) name.focus();
  });

  function isPlaceholder() {
    var action = form.getAttribute("action") || "";
    return action.indexOf("YOUR_FORM_ID") !== -1;
  }

  function validate() {
    return checks.filter(function (check) {
      var field = document.getElementById(check.id);
      return !check.valid(field.value);
    });
  }

  function showErrors(problems) {
    summaryList.textContent = "";
    problems.forEach(function (problem) {
      var field = document.getElementById(problem.id);
      var message = document.getElementById(problem.id + "-error");
      field.setAttribute("aria-invalid", "true");
      message.hidden = false;
      message.textContent = problem.message;

      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + problem.id;
      link.textContent = problem.message;
      item.appendChild(link);
      summaryList.appendChild(item);
    });
    summary.hidden = false;
    sendError.hidden = true;
    summary.focus();
  }

  function clearErrors() {
    summary.hidden = true;
    summaryList.textContent = "";
    sendError.hidden = true;
    checks.forEach(function (check) {
      var field = document.getElementById(check.id);
      var message = document.getElementById(check.id + "-error");
      field.removeAttribute("aria-invalid");
      message.hidden = true;
      message.textContent = "";
    });
  }

  function showSendError(detail) {
    submitButton.disabled = false;
    submitButton.textContent = "Send message";
    sendError.hidden = false;
    sendError.textContent = detail;
    sendError.focus();
  }

  function showThanks(detail) {
    thanksDetail.textContent = detail;
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus();
  }
})();
