(function () {
  var root = document.getElementById("crash-root");
  if (!root) return;

  var TODAY = "2026-11-20";
  var CATEGORIES = [
    "Screen",
    "Power Issues",
    "Battery Replacement",
    "Hinge Repair",
    "Keyboard Replacement",
    "Operating System",
    "Touchpad Problem",
    "WIFI Issues",
    "Water Damage",
    "Other"
  ];
  var STATUSES = ["New", "Awaiting Collection", "Awaiting Payment", "3rd Party", "Resolved"];

  function freshDevices() {
    return [
      { serial: "DEMO-5CD10421", name: "Alex Example", email: "alex.example@demodata.test", lastLogin: "alex.example@demodata.test", lastDate: "18/11/2026, 09:12", model: "Acer Chromebook 314", status: "ACTIVE", loan: false },
      { serial: "DEMO-5CD10488", name: "Jordan Demo", email: "jordan.demo@demodata.test", lastLogin: "jordan.demo@demodata.test", lastDate: "12/11/2026, 14:02", model: "Lenovo 300e", status: "ACTIVE", loan: true },
      { serial: "DEMO-5CD11002", name: "", email: "", lastLogin: "", lastDate: "", model: "HP Chromebook 11 G9", status: "ACTIVE", loan: false },
      { serial: "DEMO-5CD10814", name: "Sam Placeholder", email: "sam.placeholder@demodata.test", lastLogin: "riley.sample@demodata.test", lastDate: "16/11/2026, 11:40", model: "Dell Chromebook 3100", status: "ACTIVE", loan: false },
      { serial: "DEMO-5CD10990", name: "IT Office", email: "", lastLogin: "", lastDate: "", model: "Acer Chromebook Spin 511", status: "ACTIVE", loan: false },
      { serial: "DEMO-5CD11220", name: "Library trolley", email: "", lastLogin: "", lastDate: "", model: "Lenovo 100e", status: "ACTIVE", loan: false },
      { serial: "DEMO-5CD11550", name: "Riley Sample", email: "riley.sample@demodata.test", lastLogin: "riley.sample@demodata.test", lastDate: "19/11/2026, 08:16", model: "ASUS Chromebook CX1", status: "ACTIVE", loan: false }
    ];
  }

  var nextRepairId = 1;

  function repairId() {
    var id = nextRepairId;
    nextRepairId += 1;
    return id;
  }

  function freshRepairs() {
    return [
      { id: repairId(), serial: "DEMO-5CD10421", student: "Alex Example", category: "Screen", status: "New", notes: "Cracked top-left corner. Demo only.", booked: "2026-11-17", repaired: "", resolved: "" },
      { id: repairId(), serial: "DEMO-5CD10770", student: "Jordan Demo", category: "Keyboard Replacement", status: "Awaiting Collection", notes: "Several keys missing on the demo unit.", booked: "2026-11-14", repaired: "2026-11-18", resolved: "" },
      { id: repairId(), serial: "DEMO-5CD11102", student: "Riley Sample", category: "Battery Replacement", status: "Awaiting Payment", notes: "Battery no longer holds a charge.", booked: "2026-11-09", repaired: "2026-11-12", resolved: "" },
      { id: repairId(), serial: "DEMO-5CD10044", student: "Sam Placeholder", category: "Hinge Repair", status: "3rd Party", notes: "Sent to the demo repair bench.", booked: "2026-11-02", repaired: "", resolved: "" },
      { id: repairId(), serial: "DEMO-5CD10330", student: "Alex Example", category: "WIFI Issues", status: "Resolved", notes: "Reconnected on the demo network.", booked: "2026-10-28", repaired: "2026-10-30", resolved: "2026-11-03" },
      { id: repairId(), serial: "DEMO-5CD11550", student: "Jordan Demo", category: "Power Issues", status: "New", notes: "Will not charge. Fictional job.", booked: "2026-10-21", repaired: "", resolved: "" }
    ];
  }

  function freshPeople() {
    return [
      { name: "Alex Example", email: "alex.example@demodata.test", info: "Year 8" },
      { name: "Jordan Demo", email: "jordan.demo@demodata.test", info: "Year 9" },
      { name: "Sam Placeholder", email: "sam.placeholder@demodata.test", info: "Year 7" },
      { name: "Riley Sample", email: "riley.sample@demodata.test", info: "Year 10" },
      { name: "IT Office", email: "", info: "Storage" },
      { name: "Library trolley", email: "", info: "Storage" },
      { name: "Science trolley", email: "", info: "Storage" }
    ];
  }

  var devices = freshDevices();
  var repairs = freshRepairs();
  var people = freshPeople();
  var view = "devices";
  var deviceQuery = "";
  var showUnmatched = false;
  var showLoaned = false;
  var repairQuery = "";
  var repairStatus = "All";
  var lookupQuery = "";
  var modal = null;
  var changelogOpen = false;
  var showInsights = false;
  var notice = "";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function uk(iso) {
    if (!iso) return "—";
    var parts = iso.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function isPlace(device) {
    return device.name && !device.email;
  }

  function isUnassigned(device) {
    return !device.name;
  }

  function isUnmatched(device) {
    if (isUnassigned(device) || isPlace(device)) return false;
    if (!device.lastLogin || device.lastLogin.indexOf("@") === -1) return false;
    return device.email.split("@")[0] !== device.lastLogin.split("@")[0];
  }

  function repeatCount(serial, student) {
    var n = 0;
    repairs.forEach(function (repair) {
      if (repair.serial === serial || repair.student === student) n += 1;
    });
    return n;
  }

  function visibleDevices() {
    var query = deviceQuery.trim().toLowerCase();
    return devices.filter(function (device) {
      var blob = (device.serial + " " + device.name + " " + device.email).toLowerCase();
      if (query && blob.indexOf(query) === -1) return false;
      if (showUnmatched && !isUnmatched(device)) return false;
      if (showLoaned && !device.loan) return false;
      return true;
    });
  }

  function visibleRepairs() {
    var query = repairQuery.trim().toLowerCase();
    return repairs.filter(function (repair) {
      var blob = (repair.serial + " " + repair.student + " " + repair.category + " " + repair.notes).toLowerCase();
      if (query && blob.indexOf(query) === -1) return false;
      if (repairStatus !== "All" && repair.status !== repairStatus) return false;
      return true;
    });
  }

  function findDevice(serial) {
    for (var i = 0; i < devices.length; i += 1) {
      if (devices[i].serial === serial) return devices[i];
    }
    return null;
  }

  function render() {
    var active = document.activeElement;
    var id = active && active.id ? active.id : "";
    var start = active && typeof active.selectionStart === "number" ? active.selectionStart : null;
    var end = active && typeof active.selectionEnd === "number" ? active.selectionEnd : null;
    root.innerHTML = shell();
    if (id) {
      var next = document.getElementById(id);
      if (next) {
        next.focus();
        if (start != null && next.setSelectionRange) {
          try {
            next.setSelectionRange(start, end);
          } catch (error) {
            return;
          }
        }
        return;
      }
    }
    var field = root.querySelector(".modal input, .modal select, .modal textarea");
    if (field) field.focus();
  }

  function shell() {
    return (
      '<div class="app" data-view="' + esc(view) + '">' +
        '<header class="bar">' +
          '<div class="name">CRASH <em>v1.6</em></div>' +
          '<nav class="views" aria-label="CRASH pages">' +
            navButton("devices", "Devices") +
            navButton("repairs", "Repairs") +
            navButton("lookup", "Teacher lookup") +
          "</nav>" +
          '<div class="pills">' +
            '<span class="pill g">Google synced 20/11/2026, 07:40</span>' +
            '<span class="pill a">Arbor synced 20/11/2026, 06:15</span>' +
          "</div>" +
        "</header>" +
        '<p class="sample">Sample data · fictional names and serials · not a real school</p>' +
        '<div class="stage">' +
          (notice ? '<p class="notice" role="status">' + esc(notice) + "</p>" : "") +
          pageBody() +
          '<details class="log" id="crash-log"' + (changelogOpen ? " open" : "") + ">" +
            "<summary>Changelog</summary>" +
            "<ul>" +
              "<li><strong>v1.6 — Current:</strong> Cool colours, dated sync pills, and an IT staff list.</li>" +
              "<li><strong>v1.5:</strong> Loan devices return to IT Office in one step. Nightly backup.</li>" +
              "<li><strong>v1.4 — Nitro:</strong> Repair insights and the repair email.</li>" +
              "<li><strong>v1.3 — Warped:</strong> Sorting, repaired and resolved dates, frequent flyer flag.</li>" +
              "<li><strong>v1.2 — Cortex:</strong> Locations, trolleys, and the count widgets.</li>" +
              "<li><strong>v1.1 — N.Sanity:</strong> Top 100 results, total count.</li>" +
              "<li><strong>v1.0 — Crash:</strong> Initial launch.</li>" +
            "</ul>" +
          "</details>" +
        "</div>" +
      "</div>" +
      modalHtml()
    );
  }

  function navButton(id, label) {
    var current = view === id ? ' aria-current="page"' : "";
    return '<button type="button" data-view="' + id + '"' + current + ">" + label + "</button>";
  }

  function pageBody() {
    if (view === "repairs") return repairsPage();
    if (view === "lookup") return lookupPage();
    return devicesPage();
  }

  function devicesPage() {
    var rows = visibleDevices();
    var unmatched = devices.filter(isUnmatched).length;
    var loaned = devices.filter(function (device) { return device.loan; }).length;
    var body = rows.map(deviceRow).join("");
    if (!body) body = '<tr><td colspan="6">No devices match.</td></tr>';
    return (
      '<div class="toolbar">' +
        '<input id="device-search" type="search" placeholder="Search serial, name, or email" value="' + esc(deviceQuery) + '" aria-label="Search devices">' +
        '<button type="button" class="stat un" data-filter="unmatched" aria-pressed="' + showUnmatched + '"><b>' + unmatched + '</b><span>UNMATCHED</span></button>' +
        '<button type="button" class="stat lo" data-filter="loaned" aria-pressed="' + showLoaned + '"><b>' + loaned + '</b><span>LOANED</span></button>' +
      "</div>" +
      '<p class="meta">Signed in as it.demo@demodata.test · showing ' + rows.length + " of " + devices.length + "</p>" +
      '<div class="table-scroll"><table><thead><tr><th>Serial</th><th>Assignment</th><th>Last login</th><th>Model</th><th>Status</th><th></th></tr></thead><tbody>' +
        body +
      "</tbody></table></div>"
    );
  }

  function deviceRow(device) {
    var stripe = device.loan ? "#6d28d9" : (isUnmatched(device) ? "#e11d48" : (isUnassigned(device) ? "#0369a1" : "#047857"));
    var who = isUnassigned(device) ? "—" : device.name;
    var sub = isUnassigned(device) ? "Unassigned" : (device.email || "Storage location");
    var loan = device.loan ? ' <span class="tag loan">LOAN</span>' : "";
    var login = device.lastLogin || "No history";
    var when = device.lastDate || "Never";
    var unmatched = isUnmatched(device) ? '<div><span class="tag bad">Unmatched</span></div>' : "";
    var action;
    if (isUnassigned(device)) {
      action = '<button type="button" class="mini assign" data-assign="' + esc(device.serial) + '">Assign</button>';
    } else if (device.loan) {
      action = '<button type="button" class="mini ret" data-return="' + esc(device.serial) + '">Return to IT Office</button>';
    } else {
      action = '<button type="button" class="mini unassign" data-unassign="' + esc(device.serial) + '">Unassign</button>';
    }
    return (
      '<tr style="--stripe:' + stripe + '">' +
        "<td data-label=\"Serial\"><span class=\"serial\">" + esc(device.serial) + "</span></td>" +
        "<td data-label=\"Assignment\"><strong>" + esc(who) + "</strong>" + loan + '<div class="sub">' + esc(sub) + "</div></td>" +
        "<td data-label=\"Last login\"><strong>" + esc(login) + '</strong><div class="sub">' + esc(when) + "</div>" + unmatched + "</td>" +
        "<td data-label=\"Model\">" + esc(device.model) + "</td>" +
        '<td data-label="Status"><span class="ok">' + esc(device.status) + "</span></td>" +
        "<td data-label=\"Action\">" + action + "</td>" +
      "</tr>"
    );
  }

  function repairsPage() {
    var rows = visibleRepairs();
    var chips = [
      ["All", "c-all"],
      ["New", "c-new"],
      ["Awaiting Collection", "c-col", "Collection"],
      ["Awaiting Payment", "c-pay", "Payment"],
      ["3rd Party", "c-third"],
      ["Resolved", "c-res"]
    ].map(function (chip) {
      var pressed = repairStatus === chip[0] ? "true" : "false";
      return '<button type="button" class="chip ' + chip[1] + '" data-status="' + esc(chip[0]) + '" aria-pressed="' + pressed + '">' + esc(chip[2] || chip[0]) + "</button>";
    }).join("");
    var body = rows.map(repairRow).join("");
    if (!body) body = '<tr><td colspan="7">No repairs match.</td></tr>';
    return (
      '<div class="toolbar"><input id="repair-search" type="search" placeholder="Search serial, student, category, or notes" value="' + esc(repairQuery) + '" aria-label="Search repairs"></div>' +
      '<p class="meta">Last updated: 20/11/2026, 08:05 · Signed in as it.demo@demodata.test</p>' +
      '<div class="filters">' + chips +
        '<button type="button" class="chip c-third" data-insights aria-pressed="' + showInsights + '">Insights</button>' +
        '<button type="button" class="add" data-new-repair>New repair</button>' +
      "</div>" +
      insightsHtml() +
      '<div class="table-scroll"><table><thead><tr><th>Booked</th><th>Serial</th><th>Student</th><th>Category</th><th>Status</th><th>Notes</th><th></th></tr></thead><tbody>' +
        body +
      "</tbody></table></div>" +
      '<p class="meta">Total repair records: ' + repairs.length + "</p>"
    );
  }

  function insightsHtml() {
    if (!showInsights) return "";
    var byStatus = STATUSES.map(function (status) {
      var count = repairs.filter(function (repair) { return repair.status === status; }).length;
      return "<div>" + esc(status) + ": " + count + "</div>";
    }).join("");
    return '<div class="insights" aria-label="Repair insights">' + byStatus + "</div>";
  }

  function repairRow(repair) {
    var stripe = {
      "New": "#b91c1c",
      "Awaiting Collection": "#eab308",
      "Awaiting Payment": "#1d4ed8",
      "3rd Party": "#6d28d9",
      "Resolved": "#047857"
    }[repair.status] || "#334155";
    var fly = repeatCount(repair.serial, repair.student) > 1 ? ' <span class="tag fly">Repeat</span>' : "";
    var mail = repair.status === "Resolved" ? "" : '<button type="button" class="mini mail" data-email="' + repair.id + '">Email tutor</button>';
    return (
      '<tr style="--stripe:' + stripe + '">' +
        "<td data-label=\"Booked\">" + esc(uk(repair.booked)) + "</td>" +
        '<td data-label="Serial"><span class="serial">' + esc(repair.serial) + "</span></td>" +
        "<td data-label=\"Student\"><strong>" + esc(repair.student) + "</strong>" + fly + "</td>" +
        '<td data-label="Category"><span class="cat">' + esc(repair.category) + "</span></td>" +
        '<td data-label="Status"><span class="st" data-tone="' + esc(repair.status) + '">' + esc(repair.status) + "</span></td>" +
        "<td data-label=\"Notes\">" + esc(repair.notes) + "</td>" +
        "<td data-label=\"Action\">" + mail + '<button type="button" class="mini edit" data-edit="' + repair.id + '">Edit</button></td>' +
      "</tr>"
    );
  }

  function lookupPage() {
    var query = lookupQuery.trim().toLowerCase();
    var hits = [];
    if (query.length >= 2) {
      hits = devices.filter(function (device) {
        return (device.serial + " " + device.name + " " + device.email).toLowerCase().indexOf(query) !== -1;
      });
    }
    var cards = hits.map(function (device) {
      var open = repairs.filter(function (repair) {
        return repair.serial === device.serial && repair.status !== "Resolved";
      })[0];
      var repairText = open ? "In repair: " + open.status + " · " + open.category : "No active repairs";
      return (
        '<article class="card"><p class="sub">Serial</p><p class="serial">' + esc(device.serial) + "</p>" +
        "<p><strong>" + esc(device.name || "Unassigned") + "</strong></p>" +
        '<p class="sub">' + esc(device.email || "No email") + "</p>" +
        "<p>" + esc(repairText) + "</p></article>"
      );
    }).join("");
    var message = query.length < 2 ? "<p>Type at least two characters.</p>" : (cards || "<p>No device or student found.</p>");
    return (
      '<div class="toolbar"><input id="lookup-search" type="search" placeholder="Search serial or student name" value="' + esc(lookupQuery) + '" aria-label="Teacher lookup"></div>' +
      message
    );
  }

  function modalHtml() {
    if (!modal) return "";
    return '<div class="modal-back" data-close="1"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' + modalBody() + "</div></div>";
  }

  function modalBody() {
    if (modal.type === "assign") return assignModal();
    if (modal.type === "unassign") return confirmModal("Confirm unassign", "Take " + modal.serial + " off " + modal.name + "?", "Unassign", "warn", "do-unassign");
    if (modal.type === "return") return confirmModal("Return to IT Office", "Return the loan for " + modal.serial + " (" + modal.name + ") to the IT office?", "Return to IT Office", "good", "do-return");
    if (modal.type === "new") return newRepairModal();
    if (modal.type === "edit") return editModal();
    if (modal.type === "email") return emailModal();
    return "";
  }

  function confirmModal(title, text, button, tone, action) {
    return "<h2 id=\"modal-title\">" + esc(title) + "</h2><p>" + esc(text) + '</p><div class="row-actions"><button type="button" class="primary ' + tone + '" data-action="' + action + '">' + esc(button) + '</button><button type="button" class="text-btn" data-close="1">Cancel</button></div>';
  }

  function assignModal() {
    var query = modal.query.trim().toLowerCase();
    var picks = "";
    if (query.length >= 2 && !modal.selected) {
      picks = "<ul class=\"picks\">" + people.filter(function (person) {
        return (person.name + " " + person.email).toLowerCase().indexOf(query) !== -1;
      }).map(function (person) {
        return '<li><button type="button" data-pick="' + esc(person.name) + '"><strong>' + esc(person.name) + '</strong><div class="sub">' + esc(person.email || person.info) + "</div></button></li>";
      }).join("") + "</ul>";
    }
    var selected = modal.selected ? "<p>Assigning to <strong>" + esc(modal.selected.name) + "</strong></p>" + (modal.selected.email ? '<label><input id="loan-flag" type="checkbox"' + (modal.loan ? " checked" : "") + "> Mark as loan device</label>" : "<p class=\"sub\">Storage location</p>") : "";
    return (
      "<h2 id=\"modal-title\">Assign " + esc(modal.serial) + "</h2>" +
      '<label for="assign-search">Search name or email</label>' +
      '<input id="assign-search" type="text" value="' + esc(modal.query) + '">' +
      picks + selected +
      '<div class="row-actions"><button type="button" class="primary" data-action="do-assign"' + (modal.selected ? "" : " disabled") + '>Confirm assignment</button><button type="button" class="text-btn" data-close="1">Cancel</button></div>'
    );
  }

  function categoryOptions(selected) {
    return CATEGORIES.map(function (category) {
      return '<option' + (category === selected ? " selected" : "") + ">" + esc(category) + "</option>";
    }).join("");
  }

  function statusOptions(selected) {
    return STATUSES.map(function (status) {
      return '<option' + (status === selected ? " selected" : "") + ">" + esc(status) + "</option>";
    }).join("");
  }

  function newRepairModal() {
    var found = modal.found ? "<p>Found: <strong>" + esc(modal.found.name || "Unassigned") + "</strong> · " + esc(modal.found.model) + "</p>" : (modal.miss ? "<p>No device with that serial in this demo.</p>" : "");
    var rest = modal.found ? (
      '<label for="repair-name">Student name</label><input id="repair-name" type="text" value="' + esc(modal.student) + '">' +
      '<label for="repair-category">Category</label><select id="repair-category">' + categoryOptions(modal.category) + "</select>" +
      '<label for="repair-notes">Notes</label><textarea id="repair-notes">' + esc(modal.notes) + "</textarea>" +
      '<div class="row-actions"><button type="button" class="primary" data-action="save-repair">Save repair record</button></div>'
    ) : "";
    return (
      "<h2 id=\"modal-title\">Log new repair</h2>" +
      '<label for="repair-serial">Scan device serial</label>' +
      '<input id="repair-serial" type="text" value="' + esc(modal.serial) + '" placeholder="DEMO-…">' +
      '<div class="row-actions"><button type="button" class="primary" data-action="find-serial">Find device</button><button type="button" class="text-btn" data-close="1">Cancel</button></div>' +
      found + rest
    );
  }

  function editModal() {
    return (
      "<h2 id=\"modal-title\">Update repair " + esc(modal.serial) + "</h2>" +
      "<p>" + esc(modal.student) + "</p>" +
      '<label for="edit-status">Status</label><select id="edit-status">' + statusOptions(modal.status) + "</select>" +
      '<label for="edit-category">Category</label><select id="edit-category">' + categoryOptions(modal.category) + "</select>" +
      '<label for="edit-notes">Notes</label><textarea id="edit-notes">' + esc(modal.notes) + "</textarea>" +
      "<p class=\"sub\">Booked " + esc(uk(modal.booked)) + " · Repaired " + esc(uk(modal.repaired)) + " · Resolved " + esc(uk(modal.resolved)) + "</p>" +
      '<div class="row-actions"><button type="button" class="primary" data-action="save-edit">Save</button><button type="button" class="text-btn" data-close="1">Cancel</button></div>'
    );
  }

  function emailModal() {
    return (
      "<h2 id=\"modal-title\">Email tutor</h2>" +
      "<p>Demo only. No email is sent.</p>" +
      "<p>To: tutor.demo@demodata.test</p>" +
      "<p>Subject: Repair update for " + esc(modal.student) + "</p>" +
      "<p>" + esc(modal.serial) + " · " + esc(modal.category) + " · " + esc(modal.status) + "</p>" +
      '<div class="row-actions"><button type="button" class="primary" data-close="1">Close</button></div>'
    );
  }

  root.addEventListener("click", function (event) {
    var target = event.target.closest("button, summary");
    if (event.target.closest("[data-close]")) {
      if (event.target.classList.contains("modal-back") || event.target.closest("[data-close]")) {
        if (event.target.hasAttribute("data-close") || event.target.classList.contains("modal-back")) {
          modal = null;
          render();
          return;
        }
      }
    }
    if (!target) return;
    if (target.hasAttribute("data-view")) {
      view = target.getAttribute("data-view");
      modal = null;
      notice = "";
      render();
      return;
    }
    if (target.hasAttribute("data-filter")) {
      var filter = target.getAttribute("data-filter");
      if (filter === "unmatched") showUnmatched = !showUnmatched;
      if (filter === "loaned") showLoaned = !showLoaned;
      render();
      return;
    }
    if (target.hasAttribute("data-assign")) {
      modal = { type: "assign", serial: target.getAttribute("data-assign"), query: "", selected: null, loan: false };
      render();
      return;
    }
    if (target.hasAttribute("data-unassign")) {
      var serial = target.getAttribute("data-unassign");
      var device = findDevice(serial);
      modal = { type: "unassign", serial: serial, name: device.name };
      render();
      return;
    }
    if (target.hasAttribute("data-return")) {
      var returnSerial = target.getAttribute("data-return");
      var loanDevice = findDevice(returnSerial);
      modal = { type: "return", serial: returnSerial, name: loanDevice.name };
      render();
      return;
    }
    if (target.hasAttribute("data-status")) {
      repairStatus = target.getAttribute("data-status");
      render();
      return;
    }
    if (target.hasAttribute("data-insights")) {
      showInsights = !showInsights;
      render();
      return;
    }
    if (target.hasAttribute("data-new-repair")) {
      modal = { type: "new", serial: "", found: null, miss: false, student: "", category: "Screen", notes: "" };
      render();
      return;
    }
    if (target.hasAttribute("data-edit")) {
      var editId = Number(target.getAttribute("data-edit"));
      var repair = repairs.filter(function (item) { return item.id === editId; })[0];
      modal = {
        type: "edit",
        id: repair.id,
        serial: repair.serial,
        student: repair.student,
        status: repair.status,
        category: repair.category,
        notes: repair.notes,
        booked: repair.booked,
        repaired: repair.repaired,
        resolved: repair.resolved
      };
      render();
      return;
    }
    if (target.hasAttribute("data-email")) {
      var emailId = Number(target.getAttribute("data-email"));
      var emailed = repairs.filter(function (item) { return item.id === emailId; })[0];
      modal = { type: "email", serial: emailed.serial, student: emailed.student, category: emailed.category, status: emailed.status };
      render();
      return;
    }
    if (target.hasAttribute("data-pick")) {
      var pickedName = target.getAttribute("data-pick");
      modal.selected = people.filter(function (person) { return person.name === pickedName; })[0];
      modal.query = modal.selected.name;
      modal.loan = false;
      render();
      return;
    }
    var action = target.getAttribute("data-action");
    if (action === "do-assign") doAssign();
    if (action === "do-unassign") doUnassign();
    if (action === "do-return") doReturn();
    if (action === "find-serial") findSerial();
    if (action === "save-repair") saveRepair();
    if (action === "save-edit") saveEdit();
  });

  root.addEventListener("input", function (event) {
    var field = event.target;
    if (field.id === "device-search") deviceQuery = field.value;
    if (field.id === "repair-search") repairQuery = field.value;
    if (field.id === "lookup-search") lookupQuery = field.value;
    if (field.id === "assign-search") {
      modal.query = field.value;
      modal.selected = null;
    }
    if (field.id === "loan-flag") modal.loan = field.checked;
    if (field.id === "repair-serial") modal.serial = field.value;
    if (field.id === "repair-name") modal.student = field.value;
    if (field.id === "repair-category") modal.category = field.value;
    if (field.id === "repair-notes") modal.notes = field.value;
    if (field.id === "edit-status") modal.status = field.value;
    if (field.id === "edit-category") modal.category = field.value;
    if (field.id === "edit-notes") modal.notes = field.value;
    if (field.id === "device-search" || field.id === "repair-search" || field.id === "lookup-search" || field.id === "assign-search") {
      notice = "";
      render();
    }
  });

  root.addEventListener("change", function (event) {
    var field = event.target;
    if (field.id === "loan-flag" && modal) modal.loan = field.checked;
    if (field.id === "repair-category" && modal) modal.category = field.value;
    if (field.id === "edit-status" && modal) modal.status = field.value;
    if (field.id === "edit-category" && modal) modal.category = field.value;
  });

  root.addEventListener("toggle", function (event) {
    if (event.target.id === "crash-log") changelogOpen = event.target.open;
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal) {
      modal = null;
      render();
    }
  });

  document.querySelectorAll('a[href="#crash-log"]').forEach(function (link) {
    link.addEventListener("click", function () {
      changelogOpen = true;
      render();
    });
  });

  function doAssign() {
    var device = findDevice(modal.serial);
    device.name = modal.selected.name;
    device.email = modal.selected.email;
    device.loan = Boolean(modal.loan && modal.selected.email);
    notice = device.serial + " assigned to " + device.name + (device.loan ? " as a loan" : "") + ".";
    modal = null;
    render();
  }

  function doUnassign() {
    var device = findDevice(modal.serial);
    device.name = "";
    device.email = "";
    device.loan = false;
    notice = device.serial + " unassigned.";
    modal = null;
    render();
  }

  function doReturn() {
    var device = findDevice(modal.serial);
    device.name = "IT Office";
    device.email = "";
    device.loan = false;
    notice = "Loan returned to IT Office.";
    modal = null;
    render();
  }

  function findSerial() {
    var device = findDevice(modal.serial.trim());
    modal.found = device;
    modal.miss = !device;
    if (device) {
      modal.student = device.name || "";
      modal.serial = device.serial;
    }
    render();
  }

  function saveRepair() {
    if (!modal.found) return;
    repairs.unshift({
      id: repairId(),
      serial: modal.found.serial,
      student: modal.student || "Unassigned",
      category: modal.category,
      status: "New",
      notes: modal.notes,
      booked: TODAY,
      repaired: "",
      resolved: ""
    });
    notice = "Repair logged for " + modal.found.serial + ".";
    view = "repairs";
    modal = null;
    render();
  }

  function saveEdit() {
    var repair = repairs.filter(function (item) { return item.id === modal.id; })[0];
    var previous = repair.status;
    repair.status = modal.status;
    repair.category = modal.category;
    repair.notes = modal.notes;
    if (previous === "New" && repair.status !== "New" && !repair.repaired) repair.repaired = TODAY;
    if (repair.status === "Resolved" && !repair.resolved) repair.resolved = TODAY;
    notice = "Repair updated.";
    modal = null;
    render();
  }

  document.getElementById("crash-reset").addEventListener("click", function () {
    devices = freshDevices();
    repairs = freshRepairs();
    view = "devices";
    deviceQuery = "";
    showUnmatched = false;
    showLoaned = false;
    repairQuery = "";
    repairStatus = "All";
    lookupQuery = "";
    modal = null;
    changelogOpen = false;
    showInsights = false;
    notice = "Demo reset.";
    render();
  });

  render();
})();
