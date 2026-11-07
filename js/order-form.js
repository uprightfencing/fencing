/* Material order form: lists the chosen items line by line and sends them with the customer's details. */
(function () {
  var form = document.getElementById('order-form');
  if (!form) return;

  var summary = document.getElementById('order-summary');
  var error = document.getElementById('order-error');
  var hidden = document.getElementById('order-materials-field');
  var submitButton = form.querySelector('button[type="submit"]');
  var dateInput = document.getElementById('order-date');
  var dateLabel = document.getElementById('order-date-label');
  var addressGroup = document.getElementById('order-address-group');
  var addressInput = document.getElementById('order-address');
  var finishBoxes = form.querySelectorAll('.order-finish-box');
  var thanks = document.getElementById('order-thanks');
  var cloneCount = 0;

  function titleCase(text) {
    return text.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  // Read every line that has a quantity, adding together identical choices.
  function chosen() {
    var list = [];
    var byName = {};
    form.querySelectorAll('.order-line').forEach(function (line) {
      var qtyInput = line.querySelector('.order-qty');
      var qty = parseInt(qtyInput.value, 10);
      if (!(qty > 0)) return;
      var picks = [];
      var missing = [];
      var firstMissing = null;
      line.querySelectorAll('.order-option, .order-custom, .order-note').forEach(function (field) {
        var hiddenRow = field.closest('.order-qty-row');
        if (hiddenRow && hiddenRow.hidden) return;
        var value = field.value.trim().replace(/\s+/g, ' ');
        var label = field.getAttribute('data-label');
        if (value) {
          picks.push(titleCase(label) + ': ' + value);
        } else if (!field.hasAttribute('data-optional')) {
          missing.push(label);
          if (!firstMissing) firstMissing = field;
        }
      });
      var item = qtyInput.getAttribute('data-item');
      var key = item + '|' + picks.join('|');
      if (!missing.length && byName[key]) {
        byName[key].qty += qty;
        return;
      }
      var row = { qty: qty, item: item, picks: picks, missing: missing, select: firstMissing, routing: qtyInput.hasAttribute('data-routing') };
      if (!missing.length) byName[key] = row;
      list.push(row);
    });
    return list;
  }

  function render() {
    var list = chosen();
    updateFinish(list);
    summary.textContent = '';
    if (!list.length) {
      var empty = document.createElement('li');
      empty.textContent = 'No materials selected yet. Enter a quantity above.';
      empty.className = 'order-summary-empty';
      summary.appendChild(empty);
    }
    list.forEach(function (row) {
      var li = document.createElement('li');
      li.className = 'order-summary-row';
      var qty = document.createElement('span');
      qty.className = 'order-summary-qty';
      qty.textContent = row.qty + ' x';
      var body = document.createElement('div');
      var name = document.createElement('strong');
      name.textContent = row.item;
      body.appendChild(name);
      row.picks.forEach(function (pick) {
        var detail = document.createElement('div');
        detail.className = 'order-summary-detail';
        detail.textContent = pick;
        body.appendChild(detail);
      });
      if (row.missing.length) {
        var needs = document.createElement('div');
        needs.className = 'order-summary-missing';
        needs.textContent = 'Still needs: ' + row.missing.join(', ');
        body.appendChild(needs);
      }
      li.appendChild(qty);
      li.appendChild(body);
      summary.appendChild(li);
    });
    if (list.length && !list.some(function (row) { return row.missing.length; })) error.hidden = true;
  }

  // Blank or Routed is required only when the order has panels, rails or posts.
  function needsFinish(list) {
    return list.some(function (row) { return row.routing; });
  }

  function updateFinish(list) {
    var required = needsFinish(list);
    document.getElementById('order-finish-star').hidden = !required;
    document.getElementById('order-finish-required').hidden = !required;
  }

  function showError(message, target) {
    error.textContent = message;
    error.hidden = false;
    (target || error).scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (target) target.focus({ preventScroll: true });
  }

  // A custom size box appears when height or width is set to Custom.
  function updateCustom(line) {
    var row = line.querySelector('.order-custom-row');
    if (!row) return;
    var custom = false;
    line.querySelectorAll('select[data-custom]').forEach(function (select) {
      if (select.value === 'Custom') custom = true;
    });
    row.hidden = !custom;
  }

  // Chai Gray is carried in privacy only.
  function updateGateColor(line) {
    var style = line.querySelector('select[data-style]');
    var color = line.querySelector('select[data-gate-color]');
    if (!style || !color) return;
    var chai = color.querySelector('option[value="Chai Gray"]');
    chai.disabled = style.value === 'Semi-Privacy';
    if (chai.disabled && color.value === 'Chai Gray') color.value = '';
  }

  function updatePanelRail(line) {
    var rail = line.querySelector('select[data-rail]');
    var height = line.querySelector('select[data-panel-height]');
    if (!rail || !height) return;
    var short = rail.value.indexOf('3 1/2') !== -1;
    var insertNote = line.querySelector('.order-insert-note');
    if (insertNote) insertNote.hidden = !(short && height.value.indexOf("x 8' W") !== -1);
    // Middle rail applies only to 5' and 6' high panels with the 3 1/2" rail.
    var middleRow = line.querySelector('.order-middle-row');
    var middleNote = line.querySelector('.order-middle-note');
    if (!middleRow || !middleNote) return;
    var needsMiddle = short && /^[56]'/.test(height.value);
    middleRow.hidden = !needsMiddle;
    middleNote.hidden = !needsMiddle;
    if (!needsMiddle) middleRow.querySelector('select').value = '';
  }

  function updateAllCustom() {
    form.querySelectorAll('.order-line').forEach(updatePanelRail);
    form.querySelectorAll('.order-line').forEach(updateCustom);
    form.querySelectorAll('.order-line').forEach(updateGateColor);
  }

  // The date field and address follow the pick up or delivery choice.
  function updateFulfillment() {
    var picked = form.querySelector('input[name="Pick Up or Delivery"]:checked');
    var delivery = !!picked && picked.value === 'Delivery';
    var dateName = delivery ? 'Delivery Date' : (picked ? 'Pick-Up Date' : 'Preferred Date');
    dateLabel.textContent = dateName;
    dateInput.name = dateName;
    addressGroup.hidden = !delivery;
    addressInput.disabled = !delivery;
    addressInput.required = delivery;
    document.getElementById('order-date-note').textContent = delivery
      ? 'Deliveries are during working hours. Need a Saturday? Ask our team when they contact you.'
      : 'Our shop is open Monday to Friday.';
    checkDate();
  }

  // Dates start today and must fall on a day the shop is open.
  function localDate(value) {
    var parts = value.split('-');
    return new Date(+parts[0], +parts[1] - 1, +parts[2]);
  }

  function checkDate() {
    var day = dateInput.value ? localDate(dateInput.value).getDay() : 1;
    dateInput.setCustomValidity(day === 0 || day === 6 ? 'Please choose a weekday, Monday to Friday. If you need a Saturday delivery, ask our team when they contact you.' : '');
  }

  var now = new Date();
  dateInput.min = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
  dateInput.addEventListener('change', checkDate);
  dateInput.addEventListener('click', function () {
    try { dateInput.showPicker(); } catch (err) { /* The browser opens its own calendar. */ }
  });

  var phoneInput = document.getElementById('order-phone');
  function checkPhone() {
    var digits = phoneInput.value.replace(/\D/g, '').length;
    phoneInput.setCustomValidity(digits >= 10 ? '' : 'Please enter your phone number with area code.');
  }
  phoneInput.addEventListener('input', checkPhone);
  checkPhone();

  form.addEventListener('input', render);
  form.addEventListener('change', function (e) {
    if (e.target.hasAttribute('data-custom')) updateCustom(e.target.closest('.order-line'));
    if (e.target.hasAttribute('data-style')) updateGateColor(e.target.closest('.order-line'));
    if (e.target.hasAttribute('data-rail') || e.target.hasAttribute('data-panel-height')) updatePanelRail(e.target.closest('.order-line'));
    render();
    if (e.target.name === 'Pick Up or Delivery') {
      updateFulfillment();
      // Prompt for the address as soon as Delivery is chosen.
      if (e.target.value === 'Delivery') addressInput.focus();
    }
  });

  // Let customers order a second color or panel type of the same item.
  form.addEventListener('click', function (e) {
    var button = e.target.closest ? e.target.closest('.order-add-color') : null;
    if (!button) return;
    var lines = button.parentNode.querySelectorAll('.order-line');
    var copy = lines[0].cloneNode(true);
    cloneCount += 1;
    copy.querySelectorAll('select, input, textarea').forEach(function (field) {
      var label = copy.querySelector('label[for="' + field.id + '"]');
      field.id = field.id + '-copy' + cloneCount;
      if (label) label.setAttribute('for', field.id);
      // A dropdown with only one choice stays selected.
      if (field.tagName === 'SELECT' && field.options.length === 1) {
        field.selectedIndex = 0;
      } else {
        field.value = '';
      }
    });
    button.parentNode.insertBefore(copy, button);
    updateCustom(copy);
    updateGateColor(copy);
    updatePanelRail(copy);
    var max = parseInt(button.getAttribute('data-max'), 10);
    if (max && lines.length + 1 >= max) button.hidden = true;
    var first = copy.querySelector('select');
    if (first) first.focus();
  });

  // Back to an empty form after an order goes through.
  function clearForm() {
    form.reset();
    form.querySelectorAll('.order-qtys').forEach(function (group) {
      var lines = group.querySelectorAll('.order-line');
      for (var i = 1; i < lines.length; i++) group.removeChild(lines[i]);
      var button = group.querySelector('.order-add-color');
      if (button) button.hidden = false;
    });
    dateInput.setCustomValidity('');
    checkPhone();
    updateFulfillment();
    updateAllCustom();
    render();
  }

  var THANKS_KEY = 'uprightOrderCopy';
  var thanksClosing = false;

  function openThanks(copy) {
    document.getElementById('order-thanks-list').textContent = copy;
    try { sessionStorage.setItem(THANKS_KEY, copy); } catch (err) { /* Private browsing. */ }
    if (!thanks.open) thanks.showModal();
    thanks.focus();
  }

  function itemizedList(list) {
    return list.map(function (row) {
      return row.item + '\n     Quantity: ' + row.qty +
        row.picks.map(function (pick) { return '\n     ' + pick; }).join('');
    }).join('\n\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var list = chosen();
    if (!list.length) {
      showError('Please enter a quantity for at least one item.');
      return;
    }
    var incomplete = list.filter(function (row) { return row.missing.length; })[0];
    if (incomplete) {
      showError('Please fill in every choice for each item with a quantity.', incomplete.select);
      return;
    }
    var finishes = [];
    finishBoxes.forEach(function (box) { if (box.checked) finishes.push(box.value); });
    if (needsFinish(list) && !finishes.length) {
      showError('Your order includes panels, rails or posts. Please check Blank, Routed or both.', finishBoxes[0]);
      return;
    }
    error.hidden = true;
    hidden.value = itemizedList(list);

    var data = new FormData(form);
    // Send only the itemized list, not a blank field for every product.
    form.querySelectorAll('.order-qty, .order-option').forEach(function (field) {
      if (field.name) data.delete(field.name);
    });
    data.delete('redirect');
    data.delete('First Name');
    data.delete('Last Name');
    data.set('name', document.getElementById('order-first-name').value.trim() + ' ' + document.getElementById('order-last-name').value.trim());
    if (finishes.length) data.set('Blank or Routed', finishes.join(' and '));
    var dateText = '';
    if (dateInput.value) {
      dateText = localDate(dateInput.value).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      data.set(dateInput.name, dateText);
    } else {
      data.delete(dateInput.name);
    }
    // Leave unanswered optional fields off the email.
    if (!String(data.get('message') || '').trim()) data.delete('message');

    // Copy for the thank-you pop-up, kept before the form clears.
    var details = [];
    var method = data.get('Pick Up or Delivery');
    if (method) details.push('Pick Up or Delivery: ' + method);
    if (dateText) details.push(dateInput.name + ': ' + dateText);
    if (!addressInput.disabled) details.push('Delivery Address: ' + addressInput.value.trim());
    if (finishes.length) details.push('Blank or Routed: ' + finishes.join(' and '));
    var customerCopy = hidden.value + (details.length ? '\n\n' + details.join('\n') : '');

    var buttonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: data })
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (!result.success) throw new Error(result.message || 'Not sent');
        clearForm();
        openThanks(customerCopy);
      })
      .catch(function () {
        showError('Sorry, your order did not go through. Please try again or call us at (808) 678-0331.');
      })
      .then(function () {
        submitButton.disabled = false;
        submitButton.textContent = buttonText;
      });
  });

  document.getElementById('order-thanks-print').addEventListener('click', function () {
    window.print();
  });

  document.getElementById('order-thanks-close').addEventListener('click', function () {
    thanksClosing = true;
    try { sessionStorage.removeItem(THANKS_KEY); } catch (err) { /* Private browsing. */ }
    thanks.close();
  });

  // Escape does not dismiss it; customers choose Print / Save or Close.
  thanks.addEventListener('cancel', function (e) { e.preventDefault(); });
  thanks.addEventListener('close', function () {
    if (thanksClosing) { thanksClosing = false; return; }
    if (!thanks.open) thanks.showModal();
    thanks.focus();
  });

  // Browsers can restore typed quantities when someone comes back to the page.
  window.addEventListener('pageshow', function () {
    updateAllCustom();
    updateFulfillment();
    checkDate();
    render();
  });
  // If the page reloaded before they closed it, show their copy again.
  try {
    var savedCopy = sessionStorage.getItem(THANKS_KEY);
    if (savedCopy) openThanks(savedCopy);
  } catch (err) { /* Private browsing. */ }

  updateFulfillment();
  render();

  var motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionOk && window.gsap && window.ScrollTrigger) {
    var page = document.querySelector('main');
    var items = page.querySelectorAll('.order-guide, .order-group > h2, .order-group-note, .order-subhead, .order-item, .order-summary-box, .order-req-note, .order-name-row, .order-details > .form-group:not([hidden]), .order-choice, .order-disclaimer, .order-details > button, .order-faq .text-center, .order-faq .faq-item, .order-legal');
    var show = function (list) {
      gsap.to(list, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', overwrite: true, clearProps: 'opacity,transform' });
    };
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(items, { opacity: 0, y: 24 });
    ScrollTrigger.batch(items, { start: 'top 92%', once: true, onEnter: show });
    // Anything a customer tabs to or an error jumps to shows right away.
    form.addEventListener('focusin', function (e) {
      var item = e.target.closest('.order-item, .form-group, .order-choice');
      if (item) gsap.set(item, { clearProps: 'opacity,transform' });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    var safety = setInterval(function () {
      var waiting = 0;
      items.forEach(function (item) {
        if (+getComputedStyle(item).opacity > 0.01) return;
        if (item.getBoundingClientRect().top < window.innerHeight) show([item]);
        else waiting += 1;
      });
      if (!waiting) clearInterval(safety);
    }, 1000);
  }
})();
