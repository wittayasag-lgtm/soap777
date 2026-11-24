/* ==========================================================
   soap Scent — script.js (ปรับปรุงให้รันได้ทันทีโดยไม่ต้องใช้ Server)
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

  /* ---------- ข้อมูลสินค้า (ฝังไว้ในโค้ดเพื่อให้เปิดดูได้ทันที) ---------- */
  var PRODUCTS_DATA = [
    {
      "id": "soap-fresh-30",
      "name": "สบู่ Fresh เล็ก",
      "mood": "fresh",
      "type": "spray",
      "size": "30ml",
      "price": 89,
      "image": "images/fresh.jpg",
      "fallbackImage": "imagesfresh.jpg.jpg",
      "description": "สบู่กลิ่นสดชื่น ขนาดพกพา 30ml เหมาะกับการใช้ระหว่างวันและการเดินทาง"
    },
    {
      "id": "soap-fresh-100",
      "name": "สบู่ Fresh ใหญ่",
      "mood": "fresh",
      "type": "spray",
      "size": "100ml",
      "price": 199,
      "image": "images/fresh.jpg",
      "fallbackImage": "imagesfresh.jpg.jpg",
      "description": "สบู่กลิ่นสดชื่น ขนาดใหญ่ 100ml คุ้มค่าสำหรับใช้ประจำทุกวัน"
    },
    {
      "id": "soap-sweet-30",
      "name": "สบู่ Sweet เล็ก",
      "mood": "sweet",
      "type": "spray",
      "size": "30ml",
      "price": 89,
      "image": "images/sweet.jpg",
      "fallbackImage": "imagessweet.jpg.jpg",
      "description": "สบู่กลิ่นหวานละมุน ขนาดพกพา 30ml เหมาะกับการใช้ระหว่างวันและการเดินทาง"
    },
    {
      "id": "soap-sweet-100",
      "name": "สบู่ Sweet ใหญ่",
      "mood": "sweet",
      "type": "spray",
      "size": "100ml",
      "price": 199,
      "image": "images/sweet.jpg",
      "fallbackImage": "imagessweet.jpg.jpg",
      "description": "สบู่กลิ่นหวานละมุน ขนาดใหญ่ 100ml คุ้มค่าสำหรับใช้ประจำทุกวัน"
    },
    {
      "id": "soap-confident-30",
      "name": "สบู่ Confident เล็ก",
      "mood": "confident",
      "type": "spray",
      "size": "30ml",
      "price": 89,
      "image": "images/confident.jpg",
      "fallbackImage": "imagesconfident.jpg.jpg",
      "description": "สบู่กลิ่นมั่นใจ ขนาดพกพา 30ml เหมาะกับการใช้ระหว่างวันและการเดินทาง"
    },
    {
      "id": "soap-confident-100",
      "name": "สบู่ Confident ใหญ่",
      "mood": "confident",
      "type": "spray",
      "size": "100ml",
      "price": 199,
      "image": "images/confident.jpg",
      "fallbackImage": "imagesconfident.jpg.jpg",
      "description": "สบู่กลิ่นมั่นใจ ขนาดใหญ่ 100ml คุ้มค่าสำหรับใช้ประจำทุกวัน"
    },
    {
      "id": "soap-romance-30",
      "name": "สบู่ Romance เล็ก",
      "mood": "romance",
      "type": "spray",
      "size": "30ml",
      "price": 89,
      "image": "images/romance.jpg",
      "fallbackImage": "imagesromance.jpg.jpg",
      "description": "สบู่กลิ่นโรแมนติก ขนาดพกพา 30ml เหมาะกับการใช้ระหว่างวันและการเดินทาง"
    },
    {
      "id": "soap-romance-100",
      "name": "สบู่ Romance ใหญ่",
      "mood": "romance",
      "type": "spray",
      "size": "100ml",
      "price": 199,
      "image": "images/romance.jpg",
      "fallbackImage": "imagesromance.jpg.jpg",
      "description": "สบู่กลิ่นโรแมนติก ขนาดใหญ่ 100ml คุ้มค่าสำหรับใช้ประจำทุกวัน"
    },
    {
      "id": "rollon-fresh",
      "name": "น้ำหอมทาตัว Fresh",
      "mood": "fresh",
      "type": "rollon",
      "size": "",
      "price": 149,
      "image": "images/fresh.jpg",
      "fallbackImage": "imagesfresh.jpg.jpg",
      "description": "น้ำหอมทาตัวแบบโรลออน กลิ่นสดชื่น พกพาง่าย ใช้ได้ทุกเวลา"
    },
    {
      "id": "rollon-sweet",
      "name": "น้ำหอมทาตัว Sweet",
      "mood": "sweet",
      "type": "rollon",
      "size": "",
      "price": 149,
      "image": "images/sweet.jpg",
      "fallbackImage": "imagessweet.jpg.jpg",
      "description": "น้ำหอมทาตัวแบบโรลออน กลิ่นหวานละมุน พกพาง่าย ใช้ได้ทุกเวลา"
    }
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

    var products = PRODUCTS_DATA;
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
      
      // หากหาภาพในโฟลเดอร์ images/ ไม่เจอ ให้ลองเรียกชื่อไฟล์สำรองที่อยู่นอกโฟลเดอร์
      img.onerror = function () {
        if (p.fallbackImage && !this.dataset.triedFallback) {
          this.dataset.triedFallback = "true";
          this.src = p.fallbackImage;
        }
      };

      thumb.appendChild(img);
      card.appendChild(thumb);

      var title = el("h3");
      title.appendChild(el("span", "dot"));
      title.appendChild(document.createTextNode(p.name));
      card.appendChild(title);

      if (p.size) card.appendChild(el("p", "meta", p.size));
      if (p.description) card.appendChild(el("p", "desc", p.description));

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
        try {
          var url = new URL(window.location.href);
          if (currentMood === "all") url.searchParams.delete("mood");
          else url.searchParams.set("mood", currentMood);
          history.replaceState(null, "", url);
        } catch (e) {
          // ข้ามการอัปเดต URL หากเปิดผ่าน file:/// แล้วเบราว์เซอร์ไม่อนุญาต
        }
      }
    }

    buildFilterBar();

    var initialMood = (
      new URLSearchParams(window.location.search).get("mood") || "all"
    ).toLowerCase();

    applyFilter(initialMood, false);
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
  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;

    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

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

    if (field !== "" || row.length) {
      row.push(field);
      rows.push(row);
    }

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

    var COLUMNS = 6;

    function showMessage(text, className) {
      tbody.textContent = "";
      var tr = el("tr");
      var td = el("td", className || "muted", text);
      td.colSpan = COLUMNS;
      tr.appendChild(td);
      tbody.appendChild(tr);
    }

    showMessage("กำลังโหลดข้อมูล...");

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
        rows.shift();

        if (!rows.length) {
          showMessage("ยังไม่มีรายการสั่งซื้อ");
          return;
        }

        rows.reverse();

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