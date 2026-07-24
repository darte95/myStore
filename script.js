// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
    checkAuthState();
    loadProducts();
    loadWorks();
});

// Auth State
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            document.querySelector('.auth-btn')?.remove();
            const nav = document.querySelector('.nav-menu');
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.textContent = 'ผู้ดูแลระบบ';
            adminLink.className = 'admin-link';
            nav.appendChild(adminLink);
            
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'ออกจากระบบ';
            logoutBtn.className = 'btn btn-danger';
            logoutBtn.style.padding = '0.3rem 1rem';
            logoutBtn.onclick = () => {
                auth.signOut();
                location.reload();
            };
            nav.appendChild(logoutBtn);
        }
    });
}

// Cart Functions
function addToCart(productId) {
    db.collection('products').doc(productId).get().then(doc => {
        if (doc.exists) {
            const product = doc.data();
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    image: product.images[0] || '',
                    quantity: 1
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            showToast('เพิ่มสินค้าลงตะกร้าแล้ว', 'success');
        }
    });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Load Products
function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    db.collection('products')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            productGrid.innerHTML = '';
            snapshot.forEach(doc => {
                const product = doc.data();
                const card = createProductCard(doc.id, product);
                productGrid.appendChild(card);
            });
        });
}

function createProductCard(id, product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.images[0] || 'https://via.placeholder.com/300'}" 
             alt="${product.name}" 
             class="product-image"
             onclick="window.location.href='product-detail.html?id=${id}'">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
            <div class="product-meta">
                <span class="product-price">฿${product.price.toLocaleString()}</span>
                <span class="product-sales">ขายแล้ว ${product.sales || 0} ชิ้น</span>
            </div>
            <div class="product-actions">
                <button class="btn btn-secondary" onclick="window.location.href='product-detail.html?id=${id}'">
                    <i class="fas fa-info-circle"></i> ดูรายละเอียด
                </button>
                <button class="btn btn-primary" onclick="addToCart('${id}')">
                    <i class="fas fa-shopping-cart"></i> สั่งซื้อ
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Load Works
function loadWorks() {
    const worksGrid = document.getElementById('worksGrid');
    if (!worksGrid) return;

    db.collection('works')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            worksGrid.innerHTML = '';
            snapshot.forEach(doc => {
                const work = doc.data();
                const card = createWorkCard(doc.id, work);
                worksGrid.appendChild(card);
            });
        });
}

function createWorkCard(id, work) {
    const card = document.createElement('div');
    card.className = 'work-card';
    
    card.innerHTML = `
        <img src="${work.images[0] || 'https://via.placeholder.com/350'}" 
             alt="${work.name}" 
             style="width:100%; height:250px; object-fit:cover;">
        <div class="product-info">
            <h3 class="product-title">${work.name}</h3>
            <p class="product-desc">${work.description}</p>
            <button class="btn btn-primary" onclick="showWorkDetail('${id}')">
                <i class="fas fa-eye"></i> ดูรายละเอียดเพิ่มเติม
            </button>
        </div>
    `;
    
    return card;
}

function showWorkDetail(id) {
    db.collection('works').doc(id).get().then(doc => {
        if (doc.exists) {
            const work = doc.data();
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'flex';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${work.name}</h2>
                        <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1rem;">
                        ${work.images.map(img => `
                            <img src="${img}" alt="${work.name}" style="width:100%; height:200px; object-fit:cover; border-radius:8px;">
                        `).join('')}
                    </div>
                    <p style="line-height:1.8;">${work.description}</p>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
    });
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Render Cart
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center;padding:2rem;">ตะกร้าว่างเปล่า</p>';
        document.getElementById('totalPrice').textContent = '0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        return `
            <div style="display:flex; align-items:center; gap:1rem; padding:1rem; border-bottom:1px solid #dfe6e9;">
                <img src="${item.image}" alt="${item.name}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
                <div style="flex:1;">
                    <h4>${item.name}</h4>
                    <p>฿${item.price.toLocaleString()} x ${item.quantity}</p>
                    <p style="color:#667eea; font-weight:600;">฿${subtotal.toLocaleString()}</p>
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn btn-secondary" onclick="updateQuantity(${index}, -1)">-</button>
                    <span style="padding:0.5rem;">${item.quantity}</span>
                    <button class="btn btn-secondary" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="btn btn-danger" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('totalPrice').textContent = total.toLocaleString();
}

function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        renderCart();
    }
}

// เพิ่มฟังก์ชันนี้ใน script.js

// Validate image URL
function isValidImageUrl(url) {
    // Check if URL ends with image extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const urlLower = url.toLowerCase();
    
    // Check if it's a valid URL
    try {
        new URL(url);
    } catch {
        return false;
    }
    
    // Check if it has image extension
    const hasExtension = imageExtensions.some(ext => urlLower.endsWith(ext));
    
    // Check if it's from common image hosting services
    const imageHosts = ['imgur.com', 'postimage.org', 'postimg.cc', 'ibb.co', 'imageshack.com', 
                       'flickr.com', 'googleusercontent.com', 'cloudinary.com', 'tinypic.com',
                       'i.ibb.co', 'i.imgur.com', 'images.unsplash.com', 'picsum.photos'];
    const isImageHost = imageHosts.some(host => urlLower.includes(host));
    
    return hasExtension || isImageHost;
}

// ฟังก์ชันแสดงรูปเมื่อโหลดไม่สำเร็จ
function handleImageError(img) {
    img.src = 'https://via.placeholder.com/400/ff6b6b/ffffff?text=ไม่พบรูป';
    img.alt = 'ไม่พบรูป';
}