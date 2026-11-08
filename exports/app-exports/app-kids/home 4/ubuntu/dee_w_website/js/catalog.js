// Initialize the catalog when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCatalog();
    setupFilterButtons();
});

// Load and display all books in the catalog
function loadCatalog() {
    const catalogContainer = document.getElementById('catalog-container');
    
    if (!catalogContainer) {
        console.error('Catalog container not found');
        return;
    }

    catalogContainer.innerHTML = '';

    storyData.forEach(story => {
        const bookCard = createBookCard(story);
        catalogContainer.appendChild(bookCard);
    });
}

// Create a book card element
function createBookCard(story) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.setAttribute('data-category', story.category);

    const coverDiv = document.createElement('div');
    coverDiv.className = 'book-cover placeholder';
    coverDiv.setAttribute('data-title', story.title);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'book-info';

    const titleH3 = document.createElement('h3');
    titleH3.textContent = story.title;

    const categorySpan = document.createElement('span');
    categorySpan.className = 'book-category';
    categorySpan.textContent = story.category;

    const descriptionP = document.createElement('p');
    descriptionP.className = 'book-description';
    descriptionP.textContent = story.description;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'book-actions';

    const readBtn = document.createElement('button');
    readBtn.className = 'btn btn-read';
    readBtn.textContent = 'Read';
    readBtn.onclick = () => readStory(story.id);

    const buyBtn = document.createElement('button');
    buyBtn.className = 'btn btn-buy';
    buyBtn.textContent = 'Buy';
    buyBtn.onclick = () => buyStory(story.id, story.title);

    actionsDiv.appendChild(readBtn);
    actionsDiv.appendChild(buyBtn);

    infoDiv.appendChild(titleH3);
    infoDiv.appendChild(categorySpan);
    infoDiv.appendChild(descriptionP);
    infoDiv.appendChild(actionsDiv);

    card.appendChild(coverDiv);
    card.appendChild(infoDiv);

    return card;
}

// Setup filter button functionality
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter books
            const filter = this.getAttribute('data-filter');
            filterBooks(filter);
        });
    });
}

// Filter books by category
function filterBooks(category) {
    const bookCards = document.querySelectorAll('.book-card');

    bookCards.forEach(card => {
        if (category === 'all') {
            card.classList.remove('hidden');
        } else {
            const cardCategory = card.getAttribute('data-category');
            if (cardCategory === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        }
    });
}

// Handle read button click
function readStory(storyId) {
    alert('Story #' + storyId + ' - Read functionality coming soon!');
    // In a full implementation, this would navigate to the story reader page
    // window.location.href = 'story-reader.html?id=' + storyId;
}

// Handle buy button click
function buyStory(storyId, storyTitle) {
    alert('Adding "' + storyTitle + '" to your cart!\n\nE-commerce functionality coming soon!');
    // In a full implementation, this would add the item to a shopping cart
    // addToCart(storyId, storyTitle);
}
