// Biến toàn cục để lưu trạng thái giỏ hàng
let cart = [];

// Hàm này sẽ chạy sau khi toàn bộ cấu trúc HTML đã được tải xong
document.addEventListener('DOMContentLoaded', function() {
  const productGrid = document.getElementById('product-grid');
  const cartItemsContainer = document.getElementById('cart-items');
  const orderForm = document.getElementById('order-form');
  const popup = document.getElementById('popup');
  const popupOverlay = document.getElementById('popup-overlay');
  const closePopupBtn = document.getElementById('close-popup');

  productGrid.addEventListener('click', (e) => handleProductGridClick(e));
  cartItemsContainer.addEventListener('click', (e) => handleCartItemAction(e));
  orderForm.addEventListener('submit', (e) => handleOrderSubmit(e));
  closePopupBtn.addEventListener('click', hidePopup);
  popupOverlay.addEventListener('click', hidePopup);

  setupMobileMenuAndScrolling();
  loadProducts();
});

// -------- POPUP --------
function showPopup(title, message, isSuccess = true) {
  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-message').textContent = message;
  const icon = document.getElementById('popup-icon');
  if (isSuccess) {
    icon.textContent = '✔️';
    icon.style.backgroundColor = 'var(--primary-color)';
  } else {
    icon.textContent = '❌';
    icon.style.backgroundColor = '#E57373';
  }
  document.getElementById('popup').classList.add('active');
  document.getElementById('popup-overlay').classList.add('active');
}

function hidePopup() {
  document.getElementById('popup').classList.remove('active');
  document.getElementById('popup-overlay').classList.remove('active');
}

function handleOrderSubmit(e) {
  e.preventDefault();
  if (cart.length === 0) {
    showPopup("Lỗi!", "Giỏ hàng trống.", false);
    return;
  }

  const customerData = {
    name: document.getElementById("customer-name").value,
    phone: document.getElementById("customer-phone").value,
    address: document.getElementById("customer-address").value,
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderDetails = {
    customer: customerData,
    cart: cart,
    total: totalAmount,
  };

  const btn = e.target.querySelector("button");
  btn.disabled = true;
  btn.textContent = "Đang xử lý...";

fetch("/api/orders", {
  method: "POST",
  body: JSON.stringify(orderDetails),
  headers: { "Content-Type": "application/json" }
})
  .then(res => res.json())
  .then(response => {
    if (response.success) {
      showPopup("Thành công!", response.message);
      cart = [];
      updateCartUI();
      document.getElementById("Orders").reset();
    } else {
      showPopup("Thất bại!", response.message, false);
    }
    btn.disabled = false;
    btn.textContent = "Xác Nhận Đặt Hàng";
  })
  .catch(err => {
    showPopup("Lỗi nghiêm trọng!", "Không thể kết nối máy chủ. " + err.message, false);
    btn.disabled = false;
    btn.textContent = "Xác Nhận Đặt Hàng";
  });


}


// -------- TẢI SẢN PHẨM --------
function loadProducts() {
  const productGrid = document.getElementById('product-grid');
  productGrid.innerHTML = '<p>Đang tải sản phẩm...</p>';

  fetch("https://script.google.com/macros/s/AKfycbx-y-H1jLsEjSjyDFIXAQCz_GsKgVsCywo6zqt3lcT0PEL4R5Yj8hFY9xQdC3bwA2ea/exec?action=getProducts")
    .then(res => res.json())
    .then(data => {
      renderProducts(data);
    })
    .catch(err => {
      console.error("Lỗi getProducts:", err);
      productGrid.innerHTML = "<p>Lỗi tải sản phẩm.</p>";
    });
}


function renderProducts(products) {
  const productGrid = document.getElementById('product-grid');
  productGrid.innerHTML = '';
  const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

  if (!products || products.length === 0) {
    productGrid.innerHTML = '<p>Chưa có sản phẩm nào.</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    card.dataset.name = product.name;
    card.dataset.price = product.price;
    card.dataset.imageUrl = product.imageUrl;
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="price">${formatter.format(product.price)}</p>
      <div class="quantity-selector">
        <button class="quantity-btn quantity-minus">-</button>
        <span class="quantity-display">1</span>
        <button class="quantity-btn quantity-plus">+</button>
      </div>
      <button class="add-to-cart">Thêm vào giỏ</button>
    `;
    productGrid.appendChild(card);
  });
}

// -------- CART --------
function handleProductGridClick(e) {
  const target = e.target;
  if (target.matches('.quantity-minus')) {
    const display = target.nextElementSibling;
    let quantity = parseInt(display.textContent);
    if (quantity > 1) { display.textContent = quantity - 1; }
  } else if (target.matches('.quantity-plus')) {
    const display = target.previousElementSibling;
    let quantity = parseInt(display.textContent);
    display.textContent = quantity + 1;
  } else if (target.matches('.add-to-cart')) {
    const card = target.closest('.product-card');
    const quantity = parseInt(card.querySelector('.quantity-display').textContent);
    const productToAdd = {
      id: card.dataset.id,
      name: card.dataset.name,
      price: parseFloat(card.dataset.price),
      imageUrl: card.dataset.imageUrl,
      quantity: quantity
    };
    addToCart(productToAdd);
  }
}

function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += product.quantity;
  } else {
    cart.push(product);
  }
  updateCartUI();
}

function updateCartUI() {
  const cartItemsContainer = document.getElementById('cart-items');
  const totalPriceEl = document.getElementById('total-price');
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Giỏ hàng của bạn đang trống.</p>';
    totalPriceEl.textContent = '0đ';
  } else {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
    cart.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.quantity} x ${formatter.format(item.price)}</p>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">×</button>
      `;
      cartItemsContainer.appendChild(itemEl);
      total += item.price * item.quantity;
    });
    totalPriceEl.textContent = formatter.format(total);
  }
}

function handleCartItemAction(e) {
  if (e.target.matches('.cart-item-remove')) {
    const idToRemove = e.target.dataset.id;
    cart = cart.filter(item => item.id !== idToRemove);
    updateCartUI();
  }
}

// -------- MENU MOBILE --------
function setupMobileMenuAndScrolling() {
  const header = document.getElementById('main-header');
  const hamburger = document.getElementById('hamburger-menu');
  const navMenu = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) { header.classList.add('scrolled'); }
    else { header.classList.remove('scrolled'); }
  });
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  document.querySelectorAll('.main-nav a, .cta-button').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}
