// 1. Cart Management via LocalStorage
function getCart() {
    const cart = localStorage.getItem('demo_shop_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('demo_shop_cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            categoryName: product.categoryName,
            quantity: 1
        });
    }

    saveCart(cart);
    showToast(`"${product.name}" added to cart!`);
}

function updateCartQuantity(productId, newQty) {
    let cart = getCart();
    if (newQty <= 0) {
        cart = cart.filter(item => item.id !== productId);
    } else {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQty;
        }
    }
    saveCart(cart);
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
    showToast("Item removed from cart");
}

function clearCart() {
    localStorage.removeItem('demo_shop_cart');
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badgeEl = document.getElementById('cartBadge');
    if (badgeEl) {
        badgeEl.textContent = totalCount;
    }
}

// 2. Toast Notification System
function showToast(message) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 3. Product Card HTML Template
function createProductCardHTML(product) {
    return `
        <div class="product-card">
            <div class="product-thumb">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.oldPrice ? `<span class="product-badge">SALE</span>` : ''}
            </div>
            <div class="product-info">
                <span class="product-category">${product.categoryName}</span>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <span>${product.rating}</span>
                </div>
                <div class="product-bottom">
                    <div class="product-price">
                        <span class="current-price">${product.price} EGP</span>
                        ${product.oldPrice ? `<span class="old-price">${product.oldPrice} EGP</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                        Add
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 4. Initialize Home Page
function initHomePage() {
    const featuredGrid = document.getElementById('featuredProductsGrid');
    if (featuredGrid) {
        const featuredProducts = PRODUCTS.slice(0, 4);
        featuredGrid.innerHTML = featuredProducts.map(createProductCardHTML).join('');
    }
}

// 5. Initialize Products Shop Page
function initProductsPage() {
    const productsGrid = document.getElementById('allProductsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (!productsGrid) return;

    let currentCategory = 'all';
    let currentSearch = '';

    function filterAndRender() {
        const filtered = PRODUCTS.filter(p => {
            const matchesCat = currentCategory === 'all' || p.category === currentCategory;
            const matchesSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                                  p.description.toLowerCase().includes(currentSearch.toLowerCase());
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>No products found matching your search.</p>
                </div>
            `;
        } else {
            productsGrid.innerHTML = filtered.map(createProductCardHTML).join('');
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.trim();
            filterAndRender();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            filterAndRender();
        });
    });

    filterAndRender();
}

// 6. Render Cart Page
function renderCartPage() {
    const cartContainer = document.getElementById('cartPageContainer');
    if (!cartContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart-view" style="grid-column: 1/-1;">
                <i class="fas fa-shopping-basket"></i>
                <h3>Your Cart is Currently Empty</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">You haven't added any products to your cart yet.</p>
                <a href="products.html" class="btn-primary" style="background: var(--primary-color); color: white;">
                    Browse Products Now
                </a>
            </div>
        `;
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 25;
    const total = subtotal + shipping;

    let cartTableRows = cart.map(item => `
        <tr>
            <td>
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div>
                        <div class="cart-item-title">${item.name}</div>
                        <small style="color: var(--text-muted);">${item.categoryName}</small>
                    </div>
                </div>
            </td>
            <td style="font-weight: 700;">${item.price} EGP</td>
            <td>
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </td>
            <td style="font-weight: 800; color: var(--primary-color);">${item.price * item.quantity} EGP</td>
            <td style="text-align: center;">
                <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');

    cartContainer.innerHTML = `
        <div class="cart-table-wrapper">
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    ${cartTableRows}
                </tbody>
            </table>
        </div>
        <div class="cart-summary">
            <h3 class="summary-title">Order Summary</h3>
            <div class="summary-row">
                <span>Subtotal</span>
                <span>${subtotal} EGP</span>
            </div>
            <div class="summary-row">
                <span>Shipping</span>
                <span>${shipping === 0 ? '<strong style="color: var(--success-color);">Free</strong>' : shipping + ' EGP'}</span>
            </div>
            ${shipping > 0 ? `<small style="color: var(--text-muted); display: block; margin-top: -10px; margin-bottom: 10px;">Free shipping on orders over 500 EGP</small>` : ''}
            <div class="summary-row total">
                <span>Total Amount</span>
                <span class="total-price">${total} EGP</span>
            </div>
            <button class="checkout-btn" onclick="openCheckoutModal()">
                <i class="fas fa-credit-card"></i>
                Proceed to Checkout
            </button>
        </div>
    `;
}

// 7. Modal Control
function openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.add('active');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.remove('active');
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    closeCheckoutModal();
    clearCart();
    if (window.location.pathname.includes('cart.html')) {
        const cartContainer = document.getElementById('cartPageContainer');
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="empty-cart-view" style="grid-column: 1/-1;">
                    <i class="fas fa-check-circle" style="color: var(--success-color); opacity: 1;"></i>
                    <h3>Order Received Successfully!</h3>
                    <p style="color: var(--text-muted); margin-bottom: 25px;">Thank you for shopping with us. Order ID: <strong>#ORD-${Math.floor(100000 + Math.random() * 900000)}</strong></p>
                    <a href="index.html" class="btn-primary" style="background: var(--primary-color); color: white;">
                        Back to Home
                    </a>
                </div>
            `;
        }
    }
}

// 8. Mobile Navigation & Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    if (document.getElementById('featuredProductsGrid')) {
        initHomePage();
    }
    if (document.getElementById('allProductsGrid')) {
        initProductsPage();
    }
    if (document.getElementById('cartPageContainer')) {
        renderCartPage();
    }
});
