(function () {
  var root = document.getElementById("spyro-root");
  if (!root) return;

  var TODAY = "2026-11-20";
  var LOAN_DAYS = 14;
  var MAX_LOANS = 3;
  var PAGE_SIZE = 4;

  function freshPupils() {
    return [
      { id: "p1", name: "Alex Example", form: "8-Demo", arbor: "0001", upn: "Z0000001", left: false, hasEmail: true },
      { id: "p2", name: "Jordan Demo", form: "9-Demo", arbor: "0002", upn: "Z0000002", left: false, hasEmail: true },
      { id: "p3", name: "Sam Placeholder", form: "7-Demo", arbor: "0003", upn: "Z0000003", left: false, hasEmail: false },
      { id: "p4", name: "Riley Sample", form: "10-Sample", arbor: "0004", upn: "Z0000004", left: false, hasEmail: true },
      { id: "p5", name: "Casey Left", form: "11-Demo", arbor: "0005", upn: "Z0000005", left: true, hasEmail: true }
    ];
  }

  function freshBooks() {
    return [
      { tag: "TAG-1001", title: "The Invented Island", author: "A. Storybook", shelf: "Main Library", isbn: "9780000001001", loan: null },
      { tag: "TAG-1002", title: "Pixels and Potions", author: "J. Demo", shelf: "Main Library", isbn: "9780000001002", loan: { pupilId: "p1", due: "2026-11-27", emailed: "" } },
      { tag: "TAG-1044", title: "A History of Nowhere", author: "R. Sample", shelf: "Reading Room", isbn: "9780000001044", loan: null },
      { tag: "TAG-1100", title: "The Blank Map", author: "C. Fictional", shelf: "Store cupboard", isbn: "9780000001100", loan: { pupilId: "p2", due: "2026-11-01", emailed: "" } },
      { tag: "TAG-1220", title: "Notes from a Made-up Year", author: "A. Example", shelf: "Main Library", isbn: "9780000001220", loan: null },
      { tag: "TAG-1304", title: "The Quiet Barcode", author: "M. Sample", shelf: "Reading Room", isbn: "9780000001304", loan: null },
      { tag: "TAG-1410", title: "Shelf of Placeholders", author: "S. Placeholder", shelf: "Main Library", isbn: "9780000001410", loan: { pupilId: "p5", due: "2026-10-20", emailed: "" } },
      { tag: "TAG-1502", title: "The Invented Island", author: "A. Storybook", shelf: "Main Library", isbn: "9780000001001", loan: null }
    ];
  }

  var pupils = freshPupils();
  var books = freshBooks();
  var area = "desk";
  var tab = "dashboard";
  var dashFilter = "recent";
  var query = "";
  var onShelf = false;
  var page = 0;
  var historyQuery = "";
  var audit = [];
  var queue = [];
  var addIsbn = "";
  var addTitle = "";
  var addAuthor = "";
  var modal = null;
  var notice = "";
  var noticeBad = false;

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

  function addDays(iso, days) {
    var date = new Date(iso + "T00:00:00");
    date.setDate(date.getDate() + days);
    var month = String(date.getMonth() + 1);
    var day = String(date.getDate());
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return date.getFullYear() + "-" + month + "-" + day;
  }

  function pupilById(id) {
    for (var i = 0; i < pupils.length; i += 1) {
      if (pupils[i].id === id) return pupils[i];
    }
    return null;
  }

  function bookByTag(tag) {
    var wanted = tag.trim().toUpperCase();
    for (var i = 0; i < books.length; i += 1) {
      if (books[i].tag.toUpperCase() === wanted) return books[i];
    }
    return null;
  }

  function isIsbn(value) {
    var text = value.trim();
    if (bookByTag(text)) return false;
    return /^\d{10,13}$/.test(text) || books.some(function (book) { return book.isbn === text; });
  }

  function loansFor(pupilId) {
    return books.filter(function (book) { return book.loan && book.loan.pupilId === pupilId; });
  }

  function overdue(book) {
    return Boolean(book.loan && book.loan.due < TODAY);
  }

  function statusText(book) {
    if (!book.loan) return '<span class="shelf">On shelf</span>';
    var pupil = pupilById(book.loan.pupilId);
    var klass = overdue(book) ? "over" : "loan";
    var word = overdue(book) ? "Overdue" : "On loan";
    return '<span class="' + klass + '">' + word + " · " + esc(pupil ? pupil.name : "Unknown") + "</span>";
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
          try { next.setSelectionRange(start, end); } catch (error) { return; }
        }
        return;
      }
    }
    var field = root.querySelector(".modal input");
    if (field) field.focus();
  }

  function shell() {
    return (
      '<div class="app">' +
        '<header class="bar"><div class="logo">Spyro <span class="ver">v1.3</span></div>' +
          '<button type="button" class="staff-btn" data-area="' + (area === "desk" ? "staff" : "desk") + '">' +
            (area === "desk" ? "Staff tools" : "Close staff tools") +
          "</button></header>" +
        '<p class="sample">Sample data · fictional pupils and books · not a real school</p>' +
        '<div class="stage">' +
          (notice ? '<p class="notice' + (noticeBad ? " bad" : "") + '" role="status">' + esc(notice) + "</p>" : "") +
          (area === "desk" ? desk() : staff()) +
        "</div></div>" +
      modalHtml()
    );
  }

  function visibleBooks() {
    var text = query.trim().toLowerCase();
    return books.filter(function (book) {
      if (onShelf && book.loan) return false;
      if (!text) return true;
      var blob = (book.title + " " + book.author + " " + book.shelf + " " + book.tag + " " + book.isbn).toLowerCase();
      return blob.indexOf(text) !== -1;
    });
  }

  function desk() {
    var rows = visibleBooks().map(function (book) {
      return "<tr><td data-label=\"Title\">" + esc(book.title) + "</td><td data-label=\"Author\">" + esc(book.author) + "</td><td data-label=\"Shelf\">" + esc(book.shelf) + '</td><td class="tag" data-label="Asset tag">' + esc(book.tag) + "</td><td data-label=\"Status\">" + statusText(book) + "</td></tr>";
    }).join("");
    if (!rows) rows = '<tr><td colspan="5">No books match.</td></tr>';
    return (
      '<input id="cat-search" type="search" placeholder="Search title, author, shelf or barcode" value="' + esc(query) + '" aria-label="Search the catalogue">' +
      '<div class="actions">' +
        '<button type="button" class="big out" data-open="checkout">Check out book</button>' +
        '<button type="button" class="big back" data-open="return">Return book</button>' +
        '<button type="button" class="chip" data-shelf aria-pressed="' + onShelf + '">On the shelf</button>' +
      "</div>" +
      '<div class="table-scroll"><table><thead><tr><th>Title</th><th>Author</th><th>Shelf</th><th>Asset tag</th><th>Status</th></tr></thead><tbody>' +
        rows + "</tbody></table></div>"
    );
  }

  function staff() {
    var tabs = [
      ["dashboard", "Dashboard"],
      ["loan", "On loan"],
      ["add", "Add books"],
      ["index", "Master index"],
      ["history", "Pupil history"],
      ["audit", "Stock audit"],
      ["email", "Overdue emails"]
    ].map(function (item) {
      var current = tab === item[0] ? ' aria-current="page"' : "";
      return '<button type="button" class="tab" data-tab="' + item[0] + '"' + current + ">" + item[1] + "</button>";
    }).join("");
    return '<div class="tabs" role="tablist">' + tabs + "</div>" + staffPanel();
  }

  function staffPanel() {
    if (tab === "loan") return loanList(books.filter(function (book) { return book.loan; }));
    if (tab === "add") return addPanel();
    if (tab === "index") return indexPanel();
    if (tab === "history") return historyPanel();
    if (tab === "audit") return auditPanel();
    if (tab === "email") return emailPanel();
    return dashboard();
  }

  function dashboard() {
    var onLoan = books.filter(function (book) { return book.loan; });
    var late = onLoan.filter(overdue);
    var available = books.length - onLoan.length;
    var list = books;
    if (dashFilter === "available") list = books.filter(function (book) { return !book.loan; });
    if (dashFilter === "loan") list = onLoan;
    if (dashFilter === "overdue") list = late;
    if (dashFilter === "recent") list = books.slice(0, 4);
    return (
      '<div class="counts">' +
        countButton("all", "Total", books.length) +
        countButton("available", "Available", available) +
        countButton("loan", "On loan", onLoan.length) +
        countButton("overdue", "Overdue", late.length) +
      "</div>" +
      loanList(list, true)
    );
  }

  function countButton(id, label, count) {
    return '<button type="button" data-dash="' + id + '" aria-pressed="' + (dashFilter === id) + '"><b>' + count + "</b>" + label + "</button>";
  }

  function loanList(list, quiet) {
    var rows = list.map(function (book) {
      var renew = "";
      if (book.loan && !quiet) {
        renew = '<button type="button" class="mini" data-renew="' + esc(book.tag) + '">Renew</button>';
      }
      var due = book.loan ? uk(book.loan.due) : "—";
      return "<tr><td data-label=\"Title\">" + esc(book.title) + '</td><td class="tag" data-label="Asset tag">' + esc(book.tag) + "</td><td data-label=\"Status\">" + statusText(book) + "</td><td data-label=\"Due\">" + due + "</td><td data-label=\"Action\">" + renew + "</td></tr>";
    }).join("");
    if (!rows) rows = '<tr><td colspan="5">Nothing in this list.</td></tr>';
    return '<div class="table-scroll"><table><thead><tr><th>Title</th><th>Asset tag</th><th>Status</th><th>Due</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></div>";
  }

  function addPanel() {
    var lines = queue.map(function (item) {
      return "<li>" + esc(item.title) + " · " + esc(item.author) + " · " + esc(item.tag) + "</li>";
    }).join("");
    return (
      "<p>Type an ISBN. 9780000001001 is already in this demo. Anything else can be typed in by hand.</p>" +
      '<label for="add-isbn">ISBN</label><input id="add-isbn" type="text" value="' + esc(addIsbn) + '">' +
      '<div class="row-actions"><button type="button" class="primary" data-action="lookup-isbn">Look up</button></div>' +
      '<label for="add-title">Title</label><input id="add-title" type="text" value="' + esc(addTitle) + '">' +
      '<label for="add-author">Author</label><input id="add-author" type="text" value="' + esc(addAuthor) + '">' +
      '<label for="add-tag">Asset tag</label><input id="add-tag" type="text" placeholder="TAG-…">' +
      '<div class="row-actions"><button type="button" class="primary" data-action="queue-book">Add to queue</button>' +
        '<button type="button" class="primary" data-action="save-batch"' + (queue.length ? "" : " disabled") + ">Save batch</button></div>" +
      (lines ? '<ul class="queue">' + lines + "</ul>" : "")
    );
  }

  function indexPanel() {
    var start = page * PAGE_SIZE;
    var slice = books.slice(start, start + PAGE_SIZE);
    var rows = slice.map(function (book) {
      return "<tr><td data-label=\"Title\">" + esc(book.title) + '</td><td class="tag" data-label="Asset tag">' + esc(book.tag) + "</td><td data-label=\"Status\">" + statusText(book) + "</td><td data-label=\"Due\">" + (book.loan ? uk(book.loan.due) : "—") + "</td></tr>";
    }).join("");
    var pages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
    var leavers = pupils.filter(function (pupil) {
      return pupil.left && loansFor(pupil.id).length;
    }).map(function (pupil) {
      return "<li>" + esc(pupil.name) + " · " + loansFor(pupil.id).map(function (book) { return book.title; }).join(", ") + "</li>";
    }).join("");
    return (
      '<div class="table-scroll"><table><thead><tr><th>Title</th><th>Asset tag</th><th>Status</th><th>Due</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<div class="pager"><button type="button" class="text-btn" data-page="-1"' + (page === 0 ? " disabled" : "") + '>Previous</button><span>Page ' + (page + 1) + " of " + pages + '</span><button type="button" class="text-btn" data-page="1"' + (start + PAGE_SIZE >= books.length ? " disabled" : "") + ">Next</button></div>" +
      "<h3>Leavers still holding books</h3>" +
      (leavers ? "<ul>" + leavers + "</ul>" : "<p>None in this demo.</p>")
    );
  }

  function historyPanel() {
    var text = historyQuery.trim().toLowerCase();
    var hits = [];
    if (text.length >= 2) {
      hits = pupils.filter(function (pupil) {
        return (pupil.name + " " + pupil.upn + " " + pupil.arbor + " " + pupil.form).toLowerCase().indexOf(text) !== -1;
      });
    }
    var blocks = hits.map(function (pupil) {
      var out = loansFor(pupil.id).map(function (book) {
        return "<li>" + esc(book.title) + " · " + esc(book.tag) + " · due " + uk(book.loan.due) + "</li>";
      }).join("");
      return "<article class=\"pupil\"><strong>" + esc(pupil.name) + (pupil.left ? " · LEFT" : "") + "</strong><p class=\"sub\">" + esc(pupil.form) + " · UPN " + esc(pupil.upn) + "</p>" + (out ? "<ul>" + out + "</ul>" : "<p>Nothing out.</p>") + "</article>";
    }).join("");
    return (
      '<input id="history-search" type="search" placeholder="Name, UPN or Arbor ID" value="' + esc(historyQuery) + '" aria-label="Pupil history">' +
      (text.length < 2 ? "<p>Type at least two characters. This search includes leavers.</p>" : (blocks || "<p>No pupil matched.</p>"))
    );
  }

  function auditPanel() {
    var lines = audit.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("");
    return (
      "<p>A stock audit records that a sticker was seen. It does not lend or return the book.</p>" +
      '<label for="audit-tag">Asset tag</label><input id="audit-tag" type="text">' +
      '<div class="row-actions"><button type="button" class="primary" data-action="audit-add">Record</button></div>' +
      (lines ? "<ul>" + lines + "</ul>" : "")
    );
  }

  function emailPanel() {
    return (
      "<p>One note per family, and not again for a book emailed in the last 7 days. This demo does not send anything.</p>" +
      '<button type="button" class="primary" data-open="email">Send overdue emails</button>'
    );
  }

  function modalHtml() {
    if (!modal) return "";
    return '<div class="modal-back"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' + modalBody() + "</div></div>";
  }

  function modalBody() {
    if (modal.type === "checkout") return checkoutModal();
    if (modal.type === "return") return returnModal();
    return (
      '<h2 id="modal-title">Send overdue emails</h2>' +
      "<p>This is a demo. Nothing will be emailed.</p>" +
      '<div class="row-actions"><button type="button" class="primary" data-action="send-email">Show summary</button><button type="button" class="text-btn" data-close="1">Cancel</button></div>'
    );
  }

  function checkoutModal() {
    var text = modal.query.trim().toLowerCase();
    var picks = "";
    if (!modal.pupil && text.length >= 2) {
      picks = '<ul class="picks">' + pupils.filter(function (pupil) {
        if (pupil.left) return false;
        return (pupil.name + " " + pupil.upn + " " + pupil.form + " " + pupil.arbor).toLowerCase().indexOf(text) !== -1;
      }).map(function (pupil) {
        return '<li><button type="button" data-pupil="' + pupil.id + '"><strong>' + esc(pupil.name) + "</strong><div class=\"sub\">" + esc(pupil.form) + " · " + esc(pupil.arbor) + "</div></button></li>";
      }).join("") + "</ul>";
    }
    var chosen = modal.pupil ? '<div class="pupil"><strong>' + esc(modal.pupil.name) + "</strong><p class=\"sub\">Form " + esc(modal.pupil.form) + " · Arbor ID " + esc(modal.pupil.arbor) + " · UPN " + esc(modal.pupil.upn) + "</p><p>" + loansFor(modal.pupil.id).length + " of " + MAX_LOANS + " books out</p></div>" : "";
    var receipt = modal.receipt ? '<div class="receipt"><strong>Receipt</strong><p>' + esc(modal.receipt) + "</p><p class=\"sub\">No email is sent. Scan the next copy, or close.</p></div>" : "";
    var problem = modal.error ? '<p class="notice bad">' + esc(modal.error) + "</p>" : "";
    var limit = modal.limit ? '<p class="notice bad">This pupil already has ' + MAX_LOANS + ' books on loan.</p><button type="button" class="primary" data-action="lend-anyway">Lend anyway</button>' : "";
    return (
      '<h2 id="modal-title">Check out book</h2>' +
      '<p class="step">Step 1 · Pupil</p>' +
      '<input id="pupil-search" type="text" placeholder="Name, UPN, form or Arbor ID" value="' + esc(modal.query) + '">' +
      picks + chosen + receipt + problem +
      '<p class="step">Step 2 · Asset tag</p>' +
      '<input id="checkout-tag" type="text" placeholder="Scan the asset-tag sticker" value="' + esc(modal.tag) + '">' +
      '<p class="sub">An ISBN is not enough. Use the sticker on this copy.</p>' +
      limit +
      '<div class="row-actions"><button type="button" class="primary" data-action="checkout">Submit</button><button type="button" class="text-btn" data-close="1">Close</button></div>'
    );
  }

  function returnModal() {
    var message = modal.message ? "<p>" + esc(modal.message) + "</p>" : "";
    return (
      '<h2 id="modal-title">Return book</h2>' +
      "<p>Scan the asset tag on that copy. An ISBN will be refused.</p>" +
      '<input id="return-tag" type="text" value="' + esc(modal.tag) + '" placeholder="TAG-…">' +
      message +
      '<div class="row-actions"><button type="button" class="primary" data-action="do-return">Return</button><button type="button" class="text-btn" data-close="1">Close</button></div>'
    );
  }

  root.addEventListener("click", function (event) {
    if (event.target.classList.contains("modal-back")) {
      modal = null;
      render();
      return;
    }
    var target = event.target.closest("button");
    if (!target) return;
    if (target.hasAttribute("data-close")) {
      modal = null;
      render();
      return;
    }
    if (target.hasAttribute("data-area")) {
      area = target.getAttribute("data-area");
      notice = "";
      render();
      return;
    }
    if (target.hasAttribute("data-shelf")) {
      onShelf = !onShelf;
      render();
      return;
    }
    if (target.hasAttribute("data-open")) {
      var kind = target.getAttribute("data-open");
      if (kind === "checkout") modal = { type: "checkout", query: "", pupil: null, tag: "", receipt: "", limit: false, error: "" };
      if (kind === "return") modal = { type: "return", tag: "", message: "" };
      if (kind === "email") modal = { type: "email" };
      render();
      return;
    }
    if (target.hasAttribute("data-tab")) {
      tab = target.getAttribute("data-tab");
      render();
      return;
    }
    if (target.hasAttribute("data-dash")) {
      dashFilter = target.getAttribute("data-dash");
      render();
      return;
    }
    if (target.hasAttribute("data-pupil")) {
      modal.pupil = pupilById(target.getAttribute("data-pupil"));
      modal.query = modal.pupil.name;
      modal.limit = false;
      render();
      return;
    }
    if (target.hasAttribute("data-renew")) {
      renew(target.getAttribute("data-renew"));
      return;
    }
    if (target.hasAttribute("data-page")) {
      page += Number(target.getAttribute("data-page"));
      render();
      return;
    }
    var action = target.getAttribute("data-action");
    if (action === "checkout") checkout(false);
    if (action === "lend-anyway") checkout(true);
    if (action === "do-return") doReturn();
    if (action === "lookup-isbn") lookupIsbn();
    if (action === "queue-book") queueBook();
    if (action === "save-batch") saveBatch();
    if (action === "audit-add") auditAdd();
    if (action === "send-email") sendEmail();
  });

  root.addEventListener("input", function (event) {
    var field = event.target;
    if (field.id === "cat-search") {
      query = field.value;
      notice = "";
      render();
    }
    if (field.id === "history-search") {
      historyQuery = field.value;
      render();
    }
    if (field.id === "pupil-search" && modal) {
      modal.query = field.value;
      modal.pupil = null;
      modal.limit = false;
      render();
    }
    if (field.id === "checkout-tag" && modal) modal.tag = field.value;
    if (field.id === "return-tag" && modal) modal.tag = field.value;
    if (field.id === "add-isbn") addIsbn = field.value;
    if (field.id === "add-title") addTitle = field.value;
    if (field.id === "add-author") addAuthor = field.value;
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal) {
      modal = null;
      render();
    }
    if (event.key === "Enter" && modal && event.target.id === "checkout-tag") {
      event.preventDefault();
      checkout(false);
    }
    if (event.key === "Enter" && modal && event.target.id === "return-tag") {
      event.preventDefault();
      doReturn();
    }
  });

  function checkout(override) {
    if (!modal.pupil) {
      modal.error = "Choose a pupil first.";
      modal.receipt = "";
      render();
      return;
    }
    var tag = modal.tag.trim();
    if (!tag) return;
    if (isIsbn(tag)) {
      setBad("Scan the asset tag on that copy. An ISBN is not enough to lend a book.");
      return;
    }
    var book = bookByTag(tag);
    if (!book) {
      setBad("No copy with that asset tag in this demo.");
      return;
    }
    if (book.loan) {
      var holder = pupilById(book.loan.pupilId);
      setBad(book.tag + " is already checked out" + (holder ? " to " + holder.name : "") + ".");
      return;
    }
    if (loansFor(modal.pupil.id).length >= MAX_LOANS && !override) {
      modal.limit = true;
      modal.receipt = "";
      render();
      return;
    }
    book.loan = { pupilId: modal.pupil.id, due: addDays(TODAY, LOAN_DAYS), emailed: "" };
    modal.receipt = book.title + " · " + book.tag + " · due " + uk(book.loan.due) + " · lent to " + modal.pupil.name + (override ? " (limit overridden)" : "");
    modal.tag = "";
    modal.limit = false;
    modal.error = "";
    notice = "";
    render();
  }

  function setBad(message) {
    if (modal) {
      modal.error = message;
      modal.receipt = "";
    }
    render();
  }

  function doReturn() {
    var tag = modal.tag.trim();
    if (!tag) return;
    if (isIsbn(tag)) {
      modal.message = "Scan the asset tag sticker on the book, not the ISBN. Nothing was changed.";
      render();
      return;
    }
    var book = bookByTag(tag);
    if (!book) {
      modal.message = "No copy with that asset tag.";
      render();
      return;
    }
    if (!book.loan) {
      modal.message = book.title + " is already on the shelf.";
      render();
      return;
    }
    var pupil = pupilById(book.loan.pupilId);
    modal.message = "Returned " + book.title + " (" + book.tag + ") from " + (pupil ? pupil.name : "unknown") + ".";
    book.loan = null;
    modal.tag = "";
    notice = modal.message;
    noticeBad = false;
    render();
  }

  function renew(tag) {
    var book = bookByTag(tag);
    if (!book || !book.loan) return;
    if (overdue(book)) {
      notice = book.title + " is already overdue, so it cannot be renewed.";
      noticeBad = true;
      render();
      return;
    }
    var pupil = pupilById(book.loan.pupilId);
    if (pupil && loansFor(pupil.id).length > MAX_LOANS) {
      notice = "Return a book before renewing. This pupil is over the limit.";
      noticeBad = true;
      render();
      return;
    }
    book.loan.due = addDays(TODAY, LOAN_DAYS);
    notice = book.title + " renewed. Due " + uk(book.loan.due) + ".";
    noticeBad = false;
    render();
  }

  function fieldValue(id) {
    var field = document.getElementById(id);
    return field ? field.value.trim() : "";
  }

  function lookupIsbn() {
    addIsbn = fieldValue("add-isbn") || addIsbn;
    var known = null;
    books.forEach(function (book) {
      if (book.isbn === addIsbn) known = book;
    });
    if (known) {
      addTitle = known.title;
      addAuthor = known.author;
      notice = "Title filled in from the demo catalogue.";
      noticeBad = false;
    } else {
      addTitle = "";
      addAuthor = "";
      notice = "This ISBN was not found. Type the title and author, then scan the asset tag.";
      noticeBad = true;
    }
    render();
  }

  function queueBook() {
    var title = fieldValue("add-title") || addTitle;
    var author = fieldValue("add-author") || addAuthor;
    var tag = fieldValue("add-tag").toUpperCase();
    if (!title || title === "Type the title") {
      notice = "Type the title before adding the copy.";
      noticeBad = true;
      render();
      return;
    }
    if (!tag) return;
    if (bookByTag(tag) || queue.some(function (item) { return item.tag === tag; })) {
      notice = tag + " is already in the library or the queue.";
      noticeBad = true;
      render();
      return;
    }
    queue.push({ title: title, author: author || "Unknown", tag: tag, shelf: "Main Library" });
    addTitle = "";
    addAuthor = "";
    addIsbn = "";
    notice = tag + " added to the queue.";
    noticeBad = false;
    render();
  }

  function saveBatch() {
    queue.forEach(function (item) {
      if (!bookByTag(item.tag)) {
        books.push({ tag: item.tag, title: item.title, author: item.author, shelf: item.shelf, isbn: "", loan: null });
      }
    });
    notice = "Saved " + queue.length + " demo " + (queue.length === 1 ? "copy" : "copies") + ".";
    noticeBad = false;
    queue = [];
    render();
  }

  function auditAdd() {
    var tag = fieldValue("audit-tag");
    if (!tag) return;
    var book = bookByTag(tag);
    audit.unshift((book ? book.title : "Unknown tag") + " · " + tag.toUpperCase());
    notice = "Audit recorded. The loan was not changed.";
    noticeBad = false;
    render();
  }

  function daysBetween(earlier, later) {
    var a = new Date(earlier + "T00:00:00").getTime();
    var b = new Date(later + "T00:00:00").getTime();
    return Math.round((b - a) / 86400000);
  }

  function sendEmail() {
    var late = books.filter(overdue);
    var sent = 0;
    var covered = 0;
    var skippedRecent = 0;
    var skippedEmail = 0;
    late.forEach(function (book) {
      var pupil = pupilById(book.loan.pupilId);
      if (book.loan.emailed && daysBetween(book.loan.emailed, TODAY) < 7) {
        skippedRecent += 1;
        return;
      }
      if (!pupil || !pupil.hasEmail) {
        skippedEmail += 1;
        return;
      }
      book.loan.emailed = TODAY;
      sent += 1;
      covered += 1;
    });
    notice = "Demo only. Nothing was sent. " + sent + " emails would go out, covering " + covered + " books. " + late.length + " overdue. " + skippedRecent + " skipped because an email already went out in the last 7 days. " + skippedEmail + " had no parent email address.";
    noticeBad = false;
    modal = null;
    render();
  }

  document.getElementById("spyro-reset").addEventListener("click", function () {
    pupils = freshPupils();
    books = freshBooks();
    area = "desk";
    tab = "dashboard";
    dashFilter = "recent";
    query = "";
    onShelf = false;
    page = 0;
    historyQuery = "";
    audit = [];
    queue = [];
    addIsbn = "";
    addTitle = "";
    addAuthor = "";
    modal = null;
    notice = "Demo reset.";
    noticeBad = false;
    render();
  });

  render();
})();
