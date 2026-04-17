// ==UserScript==
// @name         mercaso_shopify_staff_notes_enhancement
// @namespace    https://github.com/luisjimenez-Mercaso
// @version      3.5
// @description  Automatically converts the staffNote input into a dropdown menu, piercing through Shadow DOM (Web Components) and compatible with React/Vue.
// @author       Mercaso
// @match        https://admin.shopify.com/store/*
// @updateURL    https://raw.githubusercontent.com/luisjimenez-Mercaso/mercaso_shopify_staff_notes_enhancement/main/mercaso_shopify_staff_notes_enhancement.meta.js
// @downloadURL  https://raw.githubusercontent.com/luisjimenez-Mercaso/mercaso_shopify_staff_notes_enhancement/main/mercaso_shopify_staff_notes_enhancement.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const HOST_SELECTOR = 's-internal-text-field[name="staffNote"]';
    const INTERNAL_INPUT_SELECTOR = 'input[name="staffNote"]';

    const OPTIONS = [
        'Customer changed/cancelled order',
        'Item out of stock/Inventory issue',
        'Payment declined',
        'Fraudulent order',
        'Staff error',
        'Test Orders',
        'Merged Order',
        'Easy Ban',
        'test',
        'Other'
    ];

    function transform(inputEl) {
        if (inputEl.nextSibling && inputEl.nextSibling.className && inputEl.nextSibling.className.includes('tamper-auto-select')) return;

        const selectEl = document.createElement('select');
        selectEl.className = inputEl.className + ' tamper-auto-select';

        selectEl.innerHTML = `<option value="">Select a reason...</option>` +
                             OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('');

        selectEl.style.cssText = window.getComputedStyle(inputEl).cssText;
        selectEl.style.display = 'inline-block';
        selectEl.style.height = window.getComputedStyle(inputEl).height;

        inputEl.style.display = 'none';
        inputEl.parentNode.insertBefore(selectEl, inputEl.nextSibling);

        if (inputEl.value) {
            selectEl.value = inputEl.value;
        }

        selectEl.addEventListener('change', (e) => {
            const val = e.target.value;
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;

            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(inputEl, val);
            } else {
                inputEl.value = val;
            }

            inputEl.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            inputEl.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
        });
    }

    const observer = new MutationObserver(() => {
        const hostEl = document.querySelector(HOST_SELECTOR);
        if (hostEl && !hostEl.dataset.transformed) {
            hostEl.dataset.transformed = "true";
            setTimeout(() => {
                if (document.body.contains(hostEl) && hostEl.shadowRoot) {
                    const inputEl = hostEl.shadowRoot.querySelector(INTERNAL_INPUT_SELECTOR);
                    if (inputEl) {
                        transform(inputEl);
                    } else {
                        delete hostEl.dataset.transformed;
                    }
                } else {
                    delete hostEl.dataset.transformed;
                }
            }, 200);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
