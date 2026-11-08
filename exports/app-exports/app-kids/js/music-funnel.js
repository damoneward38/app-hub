// Music Funnel Page - E-commerce Functionality

let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    loadMusicTracks();
    setupEventListeners();
    loadCartFromStorage();
    updateCartDisplay();
});

// Load and display music tracks
function loadMusicTracks() {
    const musicGrid = document.getElementById('musicGrid');
    
    if (!musicGrid) {
        console.error('Music grid not found');
        return;
    }

    musicGrid.innerHTML = '';

    musicTracks.forEach(track => {
        const trackCard = createTrackCard(track);
        musicGrid.appendChild(trackCard);
    });
}

// Create a track card element
function createTrackCard(track) {
    const card = document.createElement('div');
    card.className = 'track-card';
    card.setAttribute('data-genre', track.genre);

    const coverDiv = document.createElement('div');
    coverDiv.className = 'track-cover';
    coverDiv.textContent = track.album.substring(0, 2).toUpperCase();

    const infoDiv = document.createElement('div');
    infoDiv.className = 'track-info';

    const titleH4 = document.createElement('h4');
    titleH4.textContent = track.title;

    const albumP = document.createElement('p');
    albumP.className = 'track-album';
    albumP.textContent = track.album;

    const genreSpan = document.createElement('span');
    genreSpan.className = 'track-genre';
    genreSpan.textContent = track.genre;

    const durationP = document.createElement('p');
    durationP.className = 'track-duration';
    durationP.textContent = `Duration: ${track.duration}`;

    const priceDiv = document.createElement('div');
    priceDiv.className = 'track-price-section';

    const priceP = document.createElement('p');
    priceP.className = 'track-price';
    priceP.textContent = `$${track.price.toFixed(2)}`;

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-add-to-cart';
    addBtn.textContent = 'Add to Cart';
    addBtn.onclick = () => addToCart(track);

    priceDiv.appendChild(priceP);
    priceDiv.appendChild(addBtn);

    infoDiv.appendChild(titleH4);
    infoDiv.appendChild(albumP);
    infoDiv.appendChild(genreSpan);
    infoDiv.appendChild(durationP);
    infoDiv.appendChild(priceDiv);

    card.appendChild(coverDiv);
    card.appendChild(infoDiv);

    return card;
}

// Setup event listeners for search and filter
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (searchInput) {
        searchInput.addEventListener('input', filterTracks);
    }

    if (genreFilter) {
        genreFilter.addEventListener('change', filterTracks);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
}

// Filter tracks by search and genre
function filterTracks() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const genreFilter = document.getElementById('genreFilter').value;
    const trackCards = document.querySelectorAll('.track-card');

    trackCards.forEach(card => {
        const titleH4 = card.querySelector('h4');
        const genre = card.getAttribute('data-genre');
        
        const matchesSearch = titleH4.textContent.toLowerCase().includes(searchInput);
        const matchesGenre = genreFilter === 'all' || genre === genreFilter;

        if (matchesSearch && matchesGenre) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add track to cart
function addToCart(track) {
    // Check if track already in cart
    const existingItem = cart.find(item => item.id === track.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: track.id,
            title: track.title,
            album: track.album,
            price: track.price,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartDisplay();
    showNotification(`"${track.title}" added to cart!`);
}

// Remove track from cart
function removeFromCart(trackId) {
    cart = cart.filter(item => item.id !== trackId);
    saveCartToStorage();
    updateCartDisplay();
}

// Update cart quantity
function updateCartQuantity(trackId, quantity) {
    const item = cart.find(item => item.id === trackId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(trackId);
        } else {
            item.quantity = quantity;
            saveCartToStorage();
            updateCartDisplay();
        }
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!cartItemsDiv) return;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotalSpan.textContent = '$0.00';
        checkoutBtn.disabled = true;
        return;
    }

    cartItemsDiv.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';

        const itemInfo = document.createElement('div');
        itemInfo.className = 'cart-item-info';

        const titleP = document.createElement('p');
        titleP.className = 'cart-item-title';
        titleP.textContent = item.title;

        const albumP = document.createElement('p');
        albumP.className = 'cart-item-album';
        albumP.textContent = item.album;

        itemInfo.appendChild(titleP);
        itemInfo.appendChild(albumP);

        const quantityDiv = document.createElement('div');
        quantityDiv.className = 'cart-item-quantity';

        const quantityLabel = document.createElement('label');
        quantityLabel.textContent = 'Qty: ';

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '1';
        quantityInput.value = item.quantity;
        quantityInput.onchange = (e) => updateCartQuantity(item.id, parseInt(e.target.value));

        quantityDiv.appendChild(quantityLabel);
        quantityDiv.appendChild(quantityInput);

        const priceP = document.createElement('p');
        priceP.className = 'cart-item-price';
        priceP.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-remove';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => removeFromCart(item.id);

        itemDiv.appendChild(itemInfo);
        itemDiv.appendChild(quantityDiv);
        itemDiv.appendChild(priceP);
        itemDiv.appendChild(removeBtn);

        cartItemsDiv.appendChild(itemDiv);

        total += item.price * item.quantity;
    });

    cartTotalSpan.textContent = `$${total.toFixed(2)}`;
    checkoutBtn.disabled = false;
}

// Save cart to local storage
function saveCartToStorage() {
    localStorage.setItem('musicCart', JSON.stringify(cart));
}

// Load cart from local storage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('musicCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Proceed to checkout (simulated)
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const trackList = cart.map(item => `${item.title} (${item.quantity}x)`).join('\n');

    const message = `Thank you for your order!\n\nTracks:\n${trackList}\n\nTotal: $${total.toFixed(2)}\n\nThis is a simulated checkout. In a production environment, this would process payment through a payment gateway like Stripe or PayPal.`;

    alert(message);

    // Clear cart after checkout
    cart = [];
    saveCartToStorage();
    updateCartDisplay();
    showNotification('Order completed! Thank you for supporting original music.');
}

// Show notification
function showNotification(message) {
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
