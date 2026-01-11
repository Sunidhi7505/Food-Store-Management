let productId = null;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  productId = params.get("id");

  if (!productId) {
    alert("Invalid product");
    location.href = "index.html";
    return;
  }

  loadProduct();
  loadReviews();
  updateCartCount();
});


async function loadProduct() {
  const product = await apiFetch(API.PRODUCT_BY_ID(productId));
  const container = document.getElementById("productContainer");

  const isAdmin = getUser()?.role === "ROLE_ADMIN";
  const isOutOfStock = !product.available || product.stock === 0;

  container.innerHTML = `
    <div class="card">
      <div class="product-image-wrapper">
        <img src="${product.imageUrl}" />
      </div>

      <h2>${product.name}</h2>
      <p>${product.description}</p>

      <div class="product-price">₹${product.price}</div>

      <p>
        Stock:
        <strong style="color:${product.stock > 0 ? "green" : "red"}">
          ${product.stock > 0 ? product.stock : "Out of Stock"}
        </strong>
      </p>

      ${
        !isAdmin
          ? isOutOfStock
            ? `<button class="btn btn-outline" disabled>Unavailable</button>`
            : `<button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>`
          : `<p style="color:gray;">Admin view only</p>`
      }
    </div>
  `;

  if (isLoggedIn() && !isAdmin) {
    document.getElementById("reviewForm").style.display = "block";
  }
}


async function loadReviews() {
  const reviews = await apiFetch(API.GET_REVIEWS(productId));
  const list = document.getElementById("reviewsList");

  list.innerHTML = "";

  if (!reviews || reviews.length === 0) {
    list.innerHTML = `<p style="color:gray;">No reviews yet</p>`;
    return;
  }

  reviews.forEach(r => {
    const div = document.createElement("div");
    div.className = "review-card";

    div.innerHTML = `
      <div class="rating">⭐ ${r.rating}/5</div>
      <p>${r.comment}</p>
    `;

    list.appendChild(div);
  });
}


async function submitReview() {
  const rating = +document.getElementById("rating").value;
  const comment = document.getElementById("comment").value.trim();

  if (!rating || rating < 1 || rating > 5) {
    alert("Rating must be between 1 and 5");
    return;
  }

  if (!comment) {
    alert("Please write a comment");
    return;
  }

  await apiFetch(API.ADD_REVIEW(productId), {
    method: "POST",
    body: JSON.stringify({ rating, comment })
  });

  document.getElementById("rating").value = "";
  document.getElementById("comment").value = "";

  loadReviews();
}


async function addToCart(productId) {
  await apiFetch(API.ADD_TO_CART(productId, 1), { method: "POST" });
  updateCartCount();
}

async function updateCartCount() {
  if (!isLoggedIn()) return;

  const cart = await apiFetch(API.GET_CART);
  const count = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const badge = document.getElementById("cartCount");
  if (badge) badge.innerText = count;
}
