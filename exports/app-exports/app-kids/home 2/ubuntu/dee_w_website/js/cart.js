const CART_KEY = 'ge_cart';
const UNIT_PRICE = 4.99;
const CONTACT_EMAIL = 'damoneward38@gmail.com';

function readCart() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function findStory(id) {
    return (window.storyData || []).find(story => story.id === id);
}

function renderCart() {
    const list = document.getElementById('cart-list');
    const totalEl = document.getElementById('cart-total');
    if (!list) return;
    const items = readCart();
    list.innerHTML = '';

    if (items.length === 0) {
        list.innerHTML = '<p class="empty">Your cart is empty. Add a story from the catalog.</p>';
        if (totalEl) totalEl.textContent = '';
        return;
    }

    items.forEach(item => {
        const story = findStory(item.id);
        const row = document.createElement('div');
        row.className = 'cart-item';

        const info = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = story ? story.title : 'Story #' + item.id;
        const cat = document.createElement('span');
        cat.className = 'cat';
        cat.textContent = story ? story.category + ' · $' + UNIT_PRICE.toFixed(2) + ' each' : '$' + UNIT_PRICE.toFixed(2) + ' each';
        info.appendChild(title);
        info.appendChild(cat);

        const controls = document.createElement('div');
        controls.className = 'qty';
        const minus = document.createElement('button');
        minus.textContent = '−';
        minus.setAttribute('aria-label', 'Decrease quantity');
        minus.onclick = () => changeQty(item.id, -1);
        const count = document.createElement('span');
        count.textContent = item.qty;
        const plus = document.createElement('button');
        plus.textContent = '+';
        plus.setAttribute('aria-label', 'Increase quantity');
        plus.onclick = () => changeQty(item.id, 1);
        const remove = document.createElement('button');
        remove.textContent = 'Remove';
        remove.onclick = () => removeItem(item.id);
        controls.appendChild(minus);
        controls.appendChild(count);
        controls.appendChild(plus);
        controls.appendChild(remove);

        row.appendChild(info);
        row.appendChild(controls);
        list.appendChild(row);
    });

    const total = items.reduce((sum, item) => sum + item.qty * UNIT_PRICE, 0);
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    totalEl.textContent = count + ' item' + (count === 1 ? '' : 's') + ' · Total $' + total.toFixed(2);
}

function changeQty(id, delta) {
    const items = readCart();
    const item = items.find(entry => entry.id === id);
    if (!item) return;
    item.qty += delta;
    writeCart(items.filter(entry => entry.qty > 0));
    renderCart();
}

function removeItem(id) {
    writeCart(readCart().filter(entry => entry.id !== id));
    renderCart();
}

function checkout() {
    const items = readCart();
    if (items.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    const lines = items.map(item => {
        const story = findStory(item.id);
        return (story ? story.title : 'Story #' + item.id) + ' x' + item.qty + ' — $' + (item.qty * UNIT_PRICE).toFixed(2);
    });
    const total = items.reduce((sum, item) => sum + item.qty * UNIT_PRICE, 0);
    const subject = encodeURIComponent('Story Time order');
    const body = encodeURIComponent('Hi,\n\nI would like to order:\n\n' + lines.join('\n') + '\n\nTotal: $' + total.toFixed(2) + '\n\nPlease send payment instructions.\n');
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
}

document.addEventListener('DOMContentLoaded', function () {
    renderCart();
    const clear = document.getElementById('clear-cart');
    if (clear) clear.addEventListener('click', () => { writeCart([]); renderCart(); });
    const pay = document.getElementById('checkout');
    if (pay) pay.addEventListener('click', checkout);
});
