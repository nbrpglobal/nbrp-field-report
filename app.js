/* Field Report – main app logic (flat modular) */
(function () {
  "use strict";

  var SUPABASE_URL = "https://qvymejkjowrkrhrotadr.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_zS66D3dO-j5C3cwDITHZHw_BUaeqc1t";
  var SUPPORT = "support@nbrpglobal.com";
  var PHONE_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;

  var COUNTRY_CODES = [
    { code: "+1", label: "🇺🇸/🇨🇦 USA / Canada (+1)" },
    { code: "+44", label: "🇬🇧 United Kingdom (+44)" },
    { code: "+49", label: "🇩🇪 Germany (+49)" },
    { code: "+41", label: "🇨🇭 Switzerland (+41)" },
    { code: "+33", label: "🇫🇷 France (+33)" },
    { code: "+31", label: "🇳🇱 Netherlands (+31)" },
    { code: "+353", label: "🇮🇪 Ireland (+353)" },
    { code: "+46", label: "🇸🇪 Sweden (+46)" },
    { code: "+47", label: "🇳🇴 Norway (+47)" },
    { code: "+61", label: "🇦🇺 Australia (+61)" },
    { code: "+64", label: "🇳🇿 New Zealand (+64)" },
    { code: "+60", label: "🇲🇾 Malaysia (+60)" },
    { code: "+65", label: "🇸🇬 Singapore (+65)" },
    { code: "+886", label: "🇹🇼 Taiwan (+886)" },
    { code: "+852", label: "🇭🇰 Hong Kong (+852)" },
    { code: "+853", label: "🇲🇴 Macao (+853)" },
    { code: "+81", label: "🇯🇵 Japan (+81)" },
    { code: "+82", label: "🇰🇷 South Korea (+82)" },
    { code: "+86", label: "🇨🇳 Mainland China (+86)" },
    { code: "+971", label: "🇦🇪 UAE (+971)" },
    { code: "+966", label: "🇸🇦 Saudi Arabia (+966)" },
    { code: "+974", label: "🇶🇦 Qatar (+974)" },
    { code: "+965", label: "🇰🇼 Kuwait (+965)" },
    { code: "+34", label: "🇪🇸 Spain (+34)" },
    { code: "+66", label: "🇹🇭 Thailand (+66)" },
    { code: "+52", label: "🇲🇽 Mexico (+52)" },
    { code: "+54", label: "🇦🇷 Argentina (+54)" },
    { code: "+57", label: "🇨🇴 Colombia (+57)" },
  ];

  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  var T = window.T;

  var langSelect = document.getElementById("languageSelect");
  var photoList = document.getElementById("photoList");
  var photoCount = 0;
  var currentUser = null;
  var selectedPlan = null;
  var isYearly = false;
  var draggedItem = null;

  /* Dynamic copyright year */
  document.getElementById("copyrightYear").textContent = new Date().getFullYear();

  function fillCountrySelect(sel, defaultCode) {
    sel.innerHTML = "";
    COUNTRY_CODES.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.code;
      o.textContent = c.label;
      if (c.code === defaultCode) o.selected = true;
      sel.appendChild(o);
    });
  }
  fillCountrySelect(document.getElementById("authCountryCode"), "+1");
  fillCountrySelect(document.getElementById("settingsCountryCode"), "+1");

  function fullPhone(codeEl, phoneEl) {
    return codeEl.value + (phoneEl.value || "").replace(/\D/g, "");
  }
  function checkPhoneCooldown(full) {
    var v = localStorage.getItem("cool_phone_" + full);
    if (!v) return true;
    return Date.now() - parseInt(v, 10) >= PHONE_COOLDOWN_MS;
  }
  function setPhoneCooldown(full) {
    localStorage.setItem("cool_phone_" + full, String(Date.now()));
  }

  function t() {
    return T[langSelect.value] || T.en;
  }

  /* ----- Language switcher (all languages) ----- */
  function applyLanguage(lang) {
    if (!lang || !T[lang]) return;
    var dict = T[lang];

    function setText(id, key) {
      var el = document.getElementById(id);
      if (!el || dict[key] == null) return;
      el.textContent = dict[key];
    }
    function setHtml(id, key) {
      var el = document.getElementById(id);
      if (!el || dict[key] == null) return;
      el.innerHTML = dict[key];
    }

    setText("pageTitle", "pageTitle");
    setHtml("noticeText", "noticeText");
    setText("proLink", "proLink");
    setText("reportInfo", "reportInfo");
    setText("lblProject", "lblProject");
    setText("lblClient", "lblClient");
    setText("lblReportedBy", "lblReportedBy");
    setText("lblDate", "lblDate");
    setText("lblLocation", "lblLocation");
    setText("lblWeather", "lblWeather");
    setText("lblObservation", "lblObservation");
    setText("photoSection", "photoSection");
    setText("photoHint", "photoHint");
    setText("addPhotoBtn", "addPhotoBtn");
    setText("previewSection", "previewSection");
    setText("previewBtn", "previewBtn");
    setText("previewTitle", "previewTitle");
    setText("generateBtn", "generateBtn");
    setText("selectSource", "selectSource");
    setText("cameraBtn", "cameraBtn");
    setText("galleryBtn", "galleryBtn");
    setText("closeModal", "closeModal");
    setText("previewCloseBtn", "closePreviewBtn");
    setText("saveCloudBtn", "saveCloud");
    setText("proTitle", "proTitle");
    setText("proDesc", "proDesc");
    setText("lblProLogo", "lblProLogo");
    setText("lblReportNumber", "lblReportNumber");
    setText("lblDisclaimer", "lblDisclaimer");

    var rn = document.getElementById("reportNumber");
    if (rn && dict.reportNumberPlaceholder) rn.placeholder = dict.reportNumberPlaceholder;
    var di = document.getElementById("disclaimer");
    if (di && dict.disclaimerPlaceholder) di.placeholder = dict.disclaimerPlaceholder;

    var ws = document.getElementById("weather");
    if (ws && dict.weatherSunny) {
      ws.options[0].text = dict.weatherSunny;
      ws.options[1].text = dict.weatherCloudy;
      ws.options[2].text = dict.weatherRainy;
    }

    renumberPhotos();
    document.querySelectorAll(".photo-note").forEach(function (ta) {
      if (dict.notePlaceholder) ta.placeholder = dict.notePlaceholder;
    });
  }

  langSelect.addEventListener("change", function () {
    if (this.value && T[this.value]) {
      applyLanguage(this.value);
      try {
        localStorage.setItem("fieldReport_lang", this.value);
      } catch (e) {}
    }
  });

  /* Draft */
  function saveDraft() {
    try {
      localStorage.setItem(
        "fieldReport_draft",
        JSON.stringify({
          projectName: document.getElementById("projectName").value,
          clientName: document.getElementById("clientName").value,
          reportedBy: document.getElementById("reportedBy").value,
          reportDate: document.getElementById("reportDate").value,
          location: document.getElementById("location").value,
          weather: document.getElementById("weather").value,
          observations: document.getElementById("observations").value,
        })
      );
      document.getElementById("draftStatus").textContent = t().draftSaved;
      clearTimeout(window._ds);
      window._ds = setTimeout(function () {
        document.getElementById("draftStatus").textContent = "";
      }, 2000);
    } catch (e) {}
  }

  function loadDraft() {
    try {
      var raw = localStorage.getItem("fieldReport_draft");
      if (!raw) return;
      var d = JSON.parse(raw);
      document.getElementById("projectName").value = d.projectName || "";
      document.getElementById("clientName").value = d.clientName || "";
      document.getElementById("reportedBy").value = d.reportedBy || "";
      document.getElementById("reportDate").value = d.reportDate || "";
      document.getElementById("location").value = d.location || "";
      if (d.weather) document.getElementById("weather").value = d.weather;
      document.getElementById("observations").value = d.observations || "";
      document.getElementById("draftStatus").textContent = t().draftRestored;
      setTimeout(function () {
        document.getElementById("draftStatus").textContent = "";
      }, 2500);
    } catch (e) {}
  }

  ["projectName", "clientName", "reportedBy", "reportDate", "location", "weather", "observations"].forEach(
    function (id) {
      document.getElementById(id).addEventListener("input", function () {
        clearTimeout(window._dt);
        window._dt = setTimeout(saveDraft, 600);
      });
    }
  );

  /* Cloud save */
  async function saveReportToCloud() {
    var dict = t();
    var statusEl = document.getElementById("syncStatus");
    statusEl.textContent = "";
    var sessionRes = await supabase.auth.getSession();
    var session = sessionRes.data.session;
    if (!session) {
      statusEl.style.color = "#DC2626";
      statusEl.textContent = "Please login first to save to cloud.";
      document.getElementById("authModal").classList.add("active");
      return false;
    }
    var photos = [];
    document.querySelectorAll(".photo-item").forEach(function (it) {
      photos.push({
        name: (it.querySelector(".file-name") && it.querySelector(".file-name").textContent) || "",
        note: (it.querySelector(".photo-note") && it.querySelector(".photo-note").value) || "",
      });
    });
    var payload = {
      user_id: session.user.id,
      project_name: document.getElementById("projectName").value || null,
      client_name: document.getElementById("clientName").value || null,
      reported_by: document.getElementById("reportedBy").value || null,
      report_date: document.getElementById("reportDate").value || null,
      location: document.getElementById("location").value || null,
      weather: document.getElementById("weather").value || null,
      observations: document.getElementById("observations").value || null,
      photos: photos,
    };
    var res = await supabase.from("reports").insert([payload]);
    if (res.error) {
      statusEl.style.color = "#DC2626";
      statusEl.textContent = dict.cloudError + " (" + res.error.message + ")";
      return false;
    }
    statusEl.style.color = "#059669";
    statusEl.textContent = dict.cloudSaved;
    setTimeout(function () {
      statusEl.textContent = "";
    }, 3000);
    return true;
  }
  document.getElementById("saveCloudBtn").addEventListener("click", function () {
    saveReportToCloud();
  });

  /* Photos + drag reorder (mobile long-press / desktop drag) */
  document.getElementById("addPhotoBtn").addEventListener("click", function () {
    document.getElementById("photoModal").classList.add("active");
  });
  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("photoModal").classList.remove("active");
  });
  document.getElementById("cameraBtn").addEventListener("click", addNewPhoto);
  document.getElementById("galleryBtn").addEventListener("click", addNewPhoto);

  function addNewPhoto() {
    photoCount++;
    var dict = t();
    var item = document.createElement("div");
    item.className = "photo-item";
    item.draggable = true;
    item.id = "photo-" + photoCount;
    item.innerHTML =
      '<div class="photo-label">' +
      dict.photoPrefix +
      " " +
      photoCount +
      "</div>" +
      '<img class="photo-preview" id="preview-img-' +
      photoCount +
      '" style="display:none" alt="">' +
      '<input type="file" accept="image/*" id="file-' +
      photoCount +
      '" onchange="window.handleFileSelect(' +
      photoCount +
      ',this)">' +
      '<span class="file-name" id="name-' +
      photoCount +
      '"></span>' +
      '<textarea class="photo-note" id="note-' +
      photoCount +
      '" placeholder="' +
      dict.notePlaceholder +
      '" oninput="window.saveDraft()"></textarea>';

    item.addEventListener("dragstart", function (e) {
      draggedItem = this;
      this.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    item.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      return false;
    });
    item.addEventListener("drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (draggedItem && draggedItem !== this) {
        var all = Array.from(photoList.children);
        var from = all.indexOf(draggedItem);
        var to = all.indexOf(this);
        if (from < to) this.parentNode.insertBefore(draggedItem, this.nextSibling);
        else this.parentNode.insertBefore(draggedItem, this);
        renumberPhotos();
        saveDraft();
      }
      return false;
    });
    item.addEventListener("dragend", function () {
      this.classList.remove("dragging");
      draggedItem = null;
    });

    /* Touch reorder: long-press then move */
    var touchTimer = null;
    var touchDragging = false;
    item.addEventListener(
      "touchstart",
      function (e) {
        var self = this;
        touchTimer = setTimeout(function () {
          touchDragging = true;
          draggedItem = self;
          self.classList.add("dragging");
        }, 400);
      },
      { passive: true }
    );
    item.addEventListener(
      "touchmove",
      function (e) {
        if (!touchDragging || !draggedItem) return;
        var touch = e.touches[0];
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        var target = el && el.closest ? el.closest(".photo-item") : null;
        if (target && target !== draggedItem && target.parentNode === photoList) {
          var all = Array.from(photoList.children);
          var from = all.indexOf(draggedItem);
          var to = all.indexOf(target);
          if (from < to) target.parentNode.insertBefore(draggedItem, target.nextSibling);
          else target.parentNode.insertBefore(draggedItem, target);
        }
      },
      { passive: true }
    );
    item.addEventListener(
      "touchend",
      function () {
        clearTimeout(touchTimer);
        if (touchDragging) {
          touchDragging = false;
          if (draggedItem) draggedItem.classList.remove("dragging");
          draggedItem = null;
          renumberPhotos();
          saveDraft();
        }
      },
      { passive: true }
    );

    photoList.appendChild(item);
    document.getElementById("photoModal").classList.remove("active");
  }

  window.handleFileSelect = function (id, input) {
    if (!input.files || !input.files[0]) return;
    document.getElementById("name-" + id).textContent = input.files[0].name;
    var img = document.getElementById("preview-img-" + id);
    var r = new FileReader();
    r.onload = function (e) {
      img.src = e.target.result;
      img.style.display = "block";
    };
    r.readAsDataURL(input.files[0]);
  };
  window.saveDraft = saveDraft;

  function renumberPhotos() {
    var dict = t();
    photoList.querySelectorAll(".photo-item").forEach(function (it, i) {
      var l = it.querySelector(".photo-label");
      if (l) l.textContent = dict.photoPrefix + " " + (i + 1);
    });
  }

  /* Preview */
  document.getElementById("previewBtn").addEventListener("click", function () {
    var dict = t();
    var ws = document.getElementById("weather");
    var weather = ws.options[ws.selectedIndex] ? ws.options[ws.selectedIndex].text : "-";
    var items = photoList.querySelectorAll(".photo-item");
    var photosHtml = items.length === 0 ? "<p>" + dict.noPhotos + "</p>" : "";
    items.forEach(function (it, idx) {
      var fn = (it.querySelector(".file-name") && it.querySelector(".file-name").textContent) || "-";
      var note = (it.querySelector(".photo-note") && it.querySelector(".photo-note").value) || "-";
      var src = (it.querySelector(".photo-preview") && it.querySelector(".photo-preview").src) || "";
      photosHtml +=
        '<div style="margin:12px 0;padding:12px;background:#f9fafb;border-radius:6px"><strong>' +
        dict.photoPrefix +
        " " +
        (idx + 1) +
        ":</strong> " +
        fn +
        "<br>" +
        (src
          ? '<img src="' +
            src +
            '" style="max-width:100%;max-height:200px;object-fit:contain;margin:8px 0">'
          : "") +
        "<strong>" +
        dict.noteLabel +
        ":</strong> " +
        note +
        "</div>";
    });
    document.getElementById("previewBody").innerHTML =
      "<p><strong>" +
      dict.lblProject +
      ":</strong> " +
      (document.getElementById("projectName").value || "—") +
      "</p>" +
      "<p><strong>" +
      dict.lblClient +
      ":</strong> " +
      (document.getElementById("clientName").value || "—") +
      "</p>" +
      "<p><strong>" +
      dict.lblReportedBy +
      ":</strong> " +
      (document.getElementById("reportedBy").value || "—") +
      "</p>" +
      "<p><strong>" +
      dict.lblDate +
      ":</strong> " +
      (document.getElementById("reportDate").value || "—") +
      "</p>" +
      "<p><strong>" +
      dict.lblLocation +
      ":</strong> " +
      (document.getElementById("location").value || "—") +
      "</p>" +
      "<p><strong>" +
      dict.lblWeather +
      ":</strong> " +
      weather +
      "</p>" +
      '<p style="margin-top:10px"><strong>' +
      dict.lblObservation +
      ":</strong></p>" +
      '<p style="white-space:pre-wrap">' +
      (document.getElementById("observations").value || "—") +
      "</p>" +
      '<div style="margin-top:14px"><strong>' +
      dict.photoSection +
      "</strong><br>" +
      photosHtml +
      "</div>";
    document.getElementById("previewModal").classList.add("active");
  });

  function closePreview() {
    document.getElementById("previewModal").classList.remove("active");
  }
  document.getElementById("previewClose").addEventListener("click", closePreview);
  document.getElementById("previewCloseBtn").addEventListener("click", closePreview);

  /* PDF */
  document.getElementById("generateBtn").addEventListener("click", async function () {
    var dict = t();
    if (typeof html2canvas === "undefined" || typeof window.jspdf === "undefined") {
      alert("PDF libraries failed to load. Check internet.");
      return;
    }
    await saveReportToCloud();
    var btn = document.getElementById("generateBtn");
    btn.disabled = true;
    btn.textContent = dict.generating;
    try {
      var projectName = document.getElementById("projectName").value || dict.pdfTitle;
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF("p", "mm", "a4");
      var page = document.createElement("div");
      page.style.cssText =
        "width:720px;padding:30px;background:#fff;color:#0A2463;font-family:sans-serif";
      page.innerHTML =
        '<h1 style="text-align:center;border-bottom:2px solid #0A2463;padding-bottom:12px">' +
        projectName +
        "</h1>" +
        "<p><strong>Client:</strong> " +
        (document.getElementById("clientName").value || "—") +
        "</p>" +
        "<p><strong>Reported By:</strong> " +
        (document.getElementById("reportedBy").value || "—") +
        "</p>" +
        "<p><strong>Date:</strong> " +
        (document.getElementById("reportDate").value || "—") +
        "</p>" +
        "<p><strong>Location:</strong> " +
        (document.getElementById("location").value || "—") +
        "</p>" +
        '<p style="margin-top:12px;white-space:pre-wrap">' +
        (document.getElementById("observations").value || "") +
        "</p>";
      document.getElementById("pdfContainer").appendChild(page);
      var canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
      });
      document.getElementById("pdfContainer").innerHTML = "";
      var img = canvas.toDataURL("image/jpeg", 0.92);
      var pw = pdf.internal.pageSize.getWidth(),
        m = 12;
      var w = pw - m * 2,
        h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, "JPEG", m, m, w, h);
      pdf.save(
        (projectName.replace(/[<>:"/\\|?*]/g, "_").substring(0, 40) || "report") + ".pdf"
      );
    } catch (err) {
      console.error(err);
      alert("PDF failed: " + (err.message || ""));
    } finally {
      btn.disabled = false;
      btn.textContent = dict.generateBtn;
    }
  });

  /* User menu */
  document.getElementById("userAvatarBtn").addEventListener("click", function (e) {
    e.stopPropagation();
    document.getElementById("userDropdown").classList.toggle("open");
  });
  document.addEventListener("click", function () {
    document.getElementById("userDropdown").classList.remove("open");
  });
  document.getElementById("userDropdown").addEventListener("click", function (e) {
    e.stopPropagation();
  });
  document.getElementById("ddSettings").addEventListener("click", function () {
    document.getElementById("userDropdown").classList.remove("open");
    document.getElementById("settingsEmail").textContent = currentUser
      ? currentUser.email || ""
      : "";
    document.getElementById("settingsError").textContent = "";
    document.getElementById("settingsModal").classList.add("active");
  });
  document.getElementById("closeSettings").addEventListener("click", function () {
    document.getElementById("settingsModal").classList.remove("active");
  });
  document.getElementById("savePhoneBtn").addEventListener("click", function () {
    var full = fullPhone(
      document.getElementById("settingsCountryCode"),
      document.getElementById("settingsPhone")
    );
    var err = document.getElementById("settingsError");
    if (!document.getElementById("settingsPhone").value.trim()) {
      err.textContent = "Enter a phone number.";
      return;
    }
    if (!checkPhoneCooldown(full)) {
      err.textContent = "This phone number is in a 90-day cooldown period.";
      return;
    }
    setPhoneCooldown(full);
    err.style.color = "#059669";
    err.textContent = "Phone updated.";
    setTimeout(function () {
      err.textContent = "";
      err.style.color = "#DC2626";
      document.getElementById("settingsModal").classList.remove("active");
    }, 1000);
  });

  /* Auth */
  document.getElementById("authBtn").addEventListener("click", function () {
    document.getElementById("authModal").classList.add("active");
    document.getElementById("authError").textContent = "";
  });
  document.getElementById("closeAuth").addEventListener("click", function () {
    document.getElementById("authModal").classList.remove("active");
  });
  document.getElementById("registerBtn").addEventListener("click", async function () {
    var email = document.getElementById("authEmail").value.trim().toLowerCase();
    var password = document.getElementById("authPassword").value;
    var full = fullPhone(
      document.getElementById("authCountryCode"),
      document.getElementById("authPhone")
    );
    var err = document.getElementById("authError");
    if (!email || !password) {
      err.textContent = "Email and password required";
      return;
    }
    if (password.length < 6) {
      err.textContent = "Password min 6 characters";
      return;
    }
    if (!document.getElementById("authPhone").value.trim()) {
      err.textContent = "Phone required for trial protection";
      return;
    }
    if (!checkPhoneCooldown(full)) {
      err.textContent = "This phone number is in a 90-day cooldown period.";
      return;
    }
    var res = await supabase.auth.signUp({ email: email, password: password });
    if (res.error) {
      err.textContent = res.error.message;
      return;
    }
    setPhoneCooldown(full);
    currentUser = res.data.user;
    updateAuthUI();
    document.getElementById("authModal").classList.remove("active");
    alert("Account created. Check email if confirmation is required.");
  });
  document.getElementById("loginBtn").addEventListener("click", async function () {
    var email = document.getElementById("authEmail").value.trim().toLowerCase();
    var password = document.getElementById("authPassword").value;
    var err = document.getElementById("authError");
    if (!email || !password) {
      err.textContent = "Email and password required";
      return;
    }
    var res = await supabase.auth.signInWithPassword({ email: email, password: password });
    if (res.error) {
      err.textContent = res.error.message;
      return;
    }
    currentUser = res.data.user;
    updateAuthUI();
    document.getElementById("authModal").classList.remove("active");
  });
  document.getElementById("logoutBtn").addEventListener("click", async function () {
    await supabase.auth.signOut();
    currentUser = null;
    document.getElementById("userDropdown").classList.remove("open");
    updateAuthUI();
  });

  function updateAuthUI() {
    var authBtn = document.getElementById("authBtn");
    var proBtn = document.getElementById("proBtn");
    var wrap = document.getElementById("userMenuWrap");
    if (currentUser) {
      authBtn.style.display = "none";
      wrap.style.display = "block";
      proBtn.style.display = "inline-block";
      document.getElementById("ddEmail").textContent = currentUser.email || "";
    } else {
      authBtn.style.display = "inline-block";
      wrap.style.display = "none";
      proBtn.style.display = "none";
    }
  }

  supabase.auth.getSession().then(function (res) {
    if (res.data.session) {
      currentUser = res.data.session.user;
      updateAuthUI();
    }
  });
  supabase.auth.onAuthStateChange(function (event, session) {
    currentUser = session ? session.user : null;
    updateAuthUI();
  });

  /* Billing */
  function updatePlanPrices() {
    document.querySelectorAll(".plan-option").forEach(function (el) {
      var m = el.dataset.monthly,
        y = el.dataset.yearly;
      var priceEl = el.querySelector(".price");
      if (isYearly)
        priceEl.innerHTML =
          "$" + y + ' <span style="font-size:13px;font-weight:500">/ year</span>';
      else
        priceEl.innerHTML =
          "$" + m + ' <span style="font-size:13px;font-weight:500">/ month</span>';
    });
    document.getElementById("labelMonthly").classList.toggle("active", !isYearly);
    document.getElementById("labelYearly").classList.toggle("active", isYearly);
    document.getElementById("billingToggle").classList.toggle("on", isYearly);
  }
  document.getElementById("billingToggle").addEventListener("click", function () {
    isYearly = !isYearly;
    updatePlanPrices();
  });
  document.getElementById("proLink").addEventListener("click", openPricing);
  document.getElementById("proBtn").addEventListener("click", openPricing);
  document.getElementById("closePro").addEventListener("click", function () {
    document.getElementById("proModal").classList.remove("active");
  });
  function openPricing() {
    if (!currentUser) {
      alert("Please login first.");
      document.getElementById("authModal").classList.add("active");
      return;
    }
    selectedPlan = null;
    document.querySelectorAll(".plan-option").forEach(function (el) {
      el.classList.remove("selected");
    });
    document.getElementById("proceedPaymentBtn").disabled = true;
    updatePlanPrices();
    document.getElementById("proModal").classList.add("active");
  }
  document.querySelectorAll(".plan-option").forEach(function (el) {
    el.addEventListener("click", function () {
      document.querySelectorAll(".plan-option").forEach(function (x) {
        x.classList.remove("selected");
      });
      this.classList.add("selected");
      selectedPlan = {
        plan: this.dataset.plan,
        price: isYearly ? this.dataset.yearly : this.dataset.monthly,
        interval: isYearly ? "year" : "month",
      };
      document.getElementById("proceedPaymentBtn").disabled = false;
    });
  });
  document.getElementById("proceedPaymentBtn").addEventListener("click", function () {
    if (!selectedPlan) return;
    document.getElementById("proModal").classList.remove("active");
    alert(
      "Payment simulation: " +
        selectedPlan.plan.toUpperCase() +
        " $" +
        selectedPlan.price +
        "/" +
        selectedPlan.interval +
        ".\nNo refunds. Access continues until end of billing period after cancellation.\nSupport: " +
        SUPPORT
    );
    document.getElementById("proLogo").disabled = false;
    document.getElementById("reportNumber").disabled = false;
    document.getElementById("disclaimer").disabled = false;
  });

  /* Legal */
  document.getElementById("footerPrivacy").addEventListener("click", function () {
    document.getElementById("privacyModal").classList.add("active");
  });
  document.getElementById("footerTerms").addEventListener("click", function () {
    document.getElementById("termsModal").classList.add("active");
  });
  document.getElementById("closePrivacy").addEventListener("click", function () {
    document.getElementById("privacyModal").classList.remove("active");
  });
  document.getElementById("closeTerms").addEventListener("click", function () {
    document.getElementById("termsModal").classList.remove("active");
  });

  /* Init language from storage */
  try {
    var savedLang = localStorage.getItem("fieldReport_lang");
    if (savedLang && T[savedLang]) {
      langSelect.value = savedLang;
      applyLanguage(savedLang);
    }
  } catch (e) {}

  loadDraft();
})();
