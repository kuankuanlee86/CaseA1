(function () {
  "use strict";

  var OPTIONS = [
    { id: "donate", label: "如何捐款" },
    { id: "volunteer", label: "我要預約做一日小幫手" }
  ];

  var WELCOME_TEXT = "您好！請問有什麼可以協助您的？";
  var DONATE_REPLY =
    "感謝您的支持！我們的捐款方式如下：\n1. 劃撥\n2. 刷卡\n3. 街口\n4. 銀行轉帳";
  var VOLUNTEER_REPLY = "歡迎加入我們！請寫下您想預約的日期：";
  var MENU_HINT = "還有其他需要幫忙的地方嗎？";

  var state = {
    open: false,
    initialized: false,
    messages: [],
    awaitingDate: false
  };

  var els = {};

  function uid() {
    return "m-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function addMessage(role, text, extras) {
    extras = extras || {};
    state.messages.push({
      id: uid(),
      role: role,
      text: text,
      options: extras.options || null,
      showInput: !!extras.showInput
    });
    render();
  }

  function lastMessage() {
    return state.messages[state.messages.length - 1];
  }

  function initWelcome() {
    if (state.initialized) {
      return;
    }
    state.initialized = true;
    addMessage("bot", WELCOME_TEXT, { options: OPTIONS });
  }

  function handleOption(optionId) {
    var option = OPTIONS.find(function (item) {
      return item.id === optionId;
    });
    if (!option) {
      return;
    }

    state.awaitingDate = false;
    addMessage("user", option.label);

    if (optionId === "donate") {
      addMessage("bot", DONATE_REPLY, {
        options: [{ id: "menu", label: "返回主選單" }].concat(OPTIONS)
      });
      return;
    }

    state.awaitingDate = true;
    addMessage("bot", VOLUNTEER_REPLY, { showInput: true });
  }

  function handleMenu() {
    state.awaitingDate = false;
    addMessage("user", "返回主選單");
    addMessage("bot", MENU_HINT, { options: OPTIONS });
  }

  function handleDateSubmit() {
    var value = (els.input.value || "").trim();
    if (!value) {
      els.input.focus();
      return;
    }

    state.awaitingDate = false;
    addMessage("user", value);
    els.input.value = "";
    addMessage(
      "bot",
      "已收到您的預約日期：「" + value + "」。我們會盡快與您聯繫，感謝您的熱心！",
      { options: [{ id: "menu", label: "返回主選單" }].concat(OPTIONS) }
    );
  }

  function render() {
    els.messages.innerHTML = "";
    var showComposer = false;

    state.messages.forEach(function (message) {
      var row = document.createElement("div");
      row.className =
        "chat-widget__row chat-widget__row--" +
        (message.role === "user" ? "user" : "bot");

      var bubble = document.createElement("p");
      bubble.className = "chat-widget__bubble";
      bubble.textContent = message.text;
      row.appendChild(bubble);

      if (message.options && message.options.length && message.id === lastMessage().id) {
        var optionsWrap = document.createElement("div");
        optionsWrap.className = "chat-widget__options";
        message.options.forEach(function (option) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "chat-widget__option";
          btn.textContent = option.label;
          btn.addEventListener("click", function () {
            if (option.id === "menu") {
              handleMenu();
            } else {
              handleOption(option.id);
            }
          });
          optionsWrap.appendChild(btn);
        });
        row.appendChild(optionsWrap);
      }

      els.messages.appendChild(row);
      showComposer = !!message.showInput && message.id === lastMessage().id;
    });

    els.composer.classList.toggle("is-visible", showComposer);
    els.messages.scrollTop = els.messages.scrollHeight;
    if (showComposer) {
      els.input.focus();
    }
  }

  function setOpen(open) {
    state.open = open;
    els.panel.classList.toggle("is-open", open);
    els.panel.setAttribute("aria-hidden", open ? "false" : "true");
    els.toggle.classList.toggle("is-open", open);
    els.toggle.setAttribute("aria-expanded", open ? "true" : "false");
    els.toggle.setAttribute("aria-label", open ? "關閉線上小助手" : "開啟線上小助手");
    if (open) {
      initWelcome();
    }
  }

  function bind() {
    els.root = document.querySelector("[data-chat-widget]");
    if (!els.root) {
      return;
    }

    els.toggle = els.root.querySelector("[data-chat-toggle]");
    els.panel = els.root.querySelector("[data-chat-panel]");
    els.close = els.root.querySelector("[data-chat-close]");
    els.messages = els.root.querySelector("[data-chat-messages]");
    els.composer = els.root.querySelector("[data-chat-composer]");
    els.input = els.root.querySelector("[data-chat-input]");
    els.send = els.root.querySelector("[data-chat-send]");
    els.form = els.root.querySelector("[data-chat-form]");

    els.toggle.addEventListener("click", function () {
      setOpen(!state.open);
    });

    els.close.addEventListener("click", function () {
      setOpen(false);
    });

    els.form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (state.awaitingDate) {
        handleDateSubmit();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.open) {
        setOpen(false);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
