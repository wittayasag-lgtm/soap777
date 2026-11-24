/* ==========================================================
   soap Scent — script.js (ใช้ร่วมกันทุกหน้า)
   - product.html : โหลด products.json, การ์ดสินค้า, ปุ่มกรอง mood
   - order.html   : เติม item/price จาก URL, ส่งฟอร์มไป Apps Script
   - admin.html   : อ่าน CSV จาก Google Sheet มาแสดงเป็นตาราง
   แต่ละส่วนทำงานเฉพาะเมื่อหน้านั้นมี element ของตัวเอง
   ========================================================== */

(function () {
  "use strict";

  /* ---------- ค่าตั้งต้น ---------- */
  var APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwZEj94yG9l5RzjDd1WUiMSBpajsnCnjhjoNimU7TPDfMtNCxDULjWfolpHhHbCCcX8Mg/exec";

  var SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSTYq-fh7Ts7hgGvSlcvDN4heD63B0D94SxXlLFO-Xt-n23qG6ICpp98FZKbPs5_oo9XuIZOLFUvVx3/pub?gid=0&single=true&output=csv";

  var MOODS = [
    { key: "all", label: "ทั้งหมด" },
    { key: "fresh", label: "Fresh" },
    { key: "sweet", label: "Sweet" },
    { key: "confident", label: "Confident" },
    { key: "romance", label: "Romance" }
  ];

  /* ---------- ตัวช่วยเล็กๆ ---------- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function setValue(node, value) {
    if (!node) return;
    if ("value" in node) node.value = value;
    else node.textContent = value;
  }

  function getValue(node) {
    if (!node) return "";
    var v = "value" in node ? node.value : node.textContent;
    return String(v).trim();
  }

  function formatPrice(price) {
    return Number(price).toLocaleString("th-TH");
  }

  /* ==========================================================
     1) product.html
     ========================================================== */
  function initProductPage() {
    var filterBar = document.getElementById("filter-bar");
    var list = document.getElementById("product-list");
    if (!filterBar || !list) return;

    var products = [];
    var currentMood = "all";

    function isValidMood(mood) {
      return MOODS.some(function (m) {
        return m.key === mood;
      });
    }

    function buildFilterBar() {
      filterBar.textContent = "";
      MOODS.forEach(function (m) {
        var btn = el("button", "filter-btn", m.label);
        btn.type = "button";
        btn.dataset.mood = m.key;
        btn.addEventListener("click", function () {
          applyFilter(m.key, true);
        });
        filterBar.appendChild(btn);
      });
    }

    function updateButtons() {
      var buttons = filterBar.querySelectorAll("button");
      Array.prototype.forEach.call(buttons, function (btn) {
        var active = btn.dataset.mood === currentMood;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function orderLink(p) {
      var itemName = (p.name + " " + (p.size || "")).trim();
      return (
        "order.html?item=" +
        encodeURIComponent(itemName) +
        "&price=" +
        encodeURIComponent(p.price)
      );
    }

    function buildCard(p) {
      var card = el("article", "product-card");
      card.dataset.mood = p.mood;

      var thumb = el("div", "thumb");
      var img = el("img");
      img.src = p.image;
      img.alt = p.name;
      img.loading = "lazy";
      thumb.appendChild(img);
      card.appendChild(thumb);

      var title = el("h3");
      title.appendChild(el("span", "dot"));
      title.appendChild(document.createTextNode(p.name));
      card.appendChild(title);

      if (p.size) card.appendChild(el("p", "meta", p.size));

      card.appendChild(el("div", "price", formatPrice(p.price) + " บาท"));

      var buy = el("a", "btn btn--gold btn--small", "สั่งซื้อ");
      buy.href = orderLink(p);
      card.appendChild(buy);

      return card;
    }

    function render() {
      list.textContent = "";
      var shown = products.filter(function (p) {
        return currentMood === "all" || p.mood === currentMood;
      });

      if (!shown.length) {
        list.appendChild(el("p", "muted", "ยังไม่มีสินค้าในหมวดนี้"));
        return;
      }
      shown.forEach(function (p) {
        list.appendChild(buildCard(p));
      });
    }

    function applyFilter(mood, updateUrl) {
      currentMood = isValidMood(mood) ? mood : "all";
      updateButtons();
      render();

      if (updateUrl && window.history && history.replaceState) {
        var url = new URL(window.location.href);
        if (currentMood === "all") url.searchParams.delete("mood");
        else url.searchParams.set("mood", currentMood);
        history.replaceState(null, "", url);
      }
    }

    buildFilterBar();

    var initialMood = (
      new URLSearchParams(window.location.search).get("mood") || "all"
    ).toLowerCase();

    fetch("products.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        products = Array.isArray(data) ? data : [];
        applyFilter(initialMood, false);
      })
      .catch(function (error) {
        console.error(error);
        list.textContent = "";
        list.appendChild(
          el("p", "error", "โหลดรายการสินค้าไม่สำเร็จ กรุณาลองรีเฟรชหน้าอีกครั้ง")
        );
      });
  }

  /* ==========================================================
     2) order.html
     ========================================================== */
  function initOrderPage() {
    var form = document.getElementById("orderForm");
    if (!form) return;

    var params = new URLSearchParams(window.location.search);
    var item = params.get("item") || "";
    var price = params.get("price") || "";

    var itemsField = document.getElementById("items");
    var totalField = document.getElementById("total");

    // เติมทั้งชื่อสินค้าและราคาทันทีที่โหลดหน้า
    if (item) setValue(itemsField, item);
    if (price) setValue(totalField, price);

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var payload = {
        customerName: getValue(document.getElementById("customerName")),
        contact: getValue(document.getElementById("contact")),
        items: getValue(itemsField),
        total: getValue(totalField),
        note: getValue(document.getElementById("note"))
      };

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      })
        .then(function () {
          window.location.href = "thankyou.html";
        })
        .catch(function (error) {
          console.error(error);
          alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* ==========================================================
     3) admin.html
     ========================================================== */

  // parse CSV เอง: รองรับ "..." , "" (เครื่องหมายคำพูดซ้อน), ขึ้นบรรทัดใหม่ในช่อง
  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;

    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // ตัด BOM

    for (var i = 0; i < text.length; i++) {
      var c = text[i];

      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += c;
      }
    }

    // แถวสุดท้ายที่ไม่มีขึ้นบรรทัดใหม่ปิดท้าย
    if (field !== "" || row.length) {
      row.push(field);
      rows.push(row);
    }

    // ตัดแถวว่างทั้งแถว
    return rows.filter(function (r) {
      return r.some(function (cell) {
        return cell.trim() !== "";
      });
    });
  }

  function initAdminPage() {
    var table = document.getElementById("ordersTable");
    if (!table) return;

    var tbody = table.querySelector("tbody");
    if (!tbody) return;

    var COLUMNS = 6; // วันเวลา, ชื่อลูกค้า, เบอร์โทร/Line, รายการสินค้า, จำนวนเงินรวม, หมายเหตุ

    function showMessage(text, className) {
      tbody.textContent = "";
      var tr = el("tr");
      var td = el("td", className || "muted", text);
      td.colSpan = COLUMNS;
      tr.appendChild(td);
      tbody.appendChild(tr);
    }

    showMessage("กำลังโหลดข้อมูล...");

    // เติมพารามิเตอร์กันแคช เพื่อให้เห็นออเดอร์ล่าสุดเสมอ
    var url =
      SHEET_CSV_URL +
      (SHEET_CSV_URL.indexOf("?") === -1 ? "?" : "&") +
      "t=" +
      Date.now();

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        var rows = parseCSV(text);
        rows.shift(); // แถวแรกเป็นหัวตาราง

        if (!rows.length) {
          showMessage("ยังไม่มีรายการสั่งซื้อ");
          return;
        }

        rows.reverse(); // ล่าสุดขึ้นก่อน (ชีตเรียงเก่า → ใหม่)

        tbody.textContent = "";
        rows.forEach(function (r) {
          var tr = el("tr");
          for (var i = 0; i < COLUMNS; i++) {
            tr.appendChild(el("td", "", r[i] !== undefined ? r[i] : ""));
          }
          tbody.appendChild(tr);
        });
      })
      .catch(function (error) {
        console.error(error);
        showMessage("โหลดข้อมูลไม่สำเร็จ กรุณาลองรีเฟรชหน้าอีกครั้ง", "error");
      });
  }

  /* ---------- เริ่มทำงาน ---------- */
  function init() {
    initProductPage();
    initOrderPage();
    initAdminPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
