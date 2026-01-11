document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartCount();
});


async function applyFilters() {
  const params = new URLSearchParams();

  const keyword = searchKeyword.value.trim();
  const min = minPrice.value;
  const max = maxPrice.value;
  const avail = availability.value;
  const sort = sortBy.value;
  const dir = direction.value;

  if (keyword) params.append("keyword", keyword);
  if (min) params.append("minPrice", min);
  if (max) params.append("maxPrice", max);
  if (avail !== "") params.append("available", avail);
  if (sort) params.append("sortBy", sort);
  if (dir) params.append("direction", dir);

  loadProducts(`/search?${params.toString()}`);
}


async function loadProducts(query = "") {
  try {
    const products = await apiFetch(`${API.PRODUCTS}${query}`);

    const grid = document.getElementById("productGrid");
    const emptyState = document.getElementById("emptyState");

    grid.innerHTML = "";

    if (!products || products.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    const user = getUser();
    const isAdmin = user?.role === "ROLE_ADMIN";

    products.forEach(product => {
      const isOutOfStock = !product.available || product.stock === 0;

      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${product.imageUrl}"
             style="width:100%;height:160px;object-fit:cover;border-radius:10px;" />

        <h3>${product.name}</h3>
        <p>${product.description}</p>

        <div class="product-price">₹${product.price}</div>

        <p style="font-size:14px;">
          Stock:
          <strong style="color:${product.stock > 0 ? "green" : "red"}">
            ${product.stock > 0 ? product.stock : "Out of Stock"}
          </strong>
        </p>

        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn btn-outline"
                  onclick="viewProduct('${product.id}')">
            View Details
          </button>

          ${
            !isAdmin
              ? isOutOfStock
                ? `<button class="btn btn-outline" disabled>Unavailable</button>`
                : `<button class="btn btn-primary"
                            onclick="addToCart('${product.id}')">
                     Add to Cart
                   </button>`
              : ``
          }
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}


function viewProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}


async function addToCart(productId) {
  if (!isLoggedIn()) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  await apiFetch(API.ADD_TO_CART(productId, 1), { method: "POST" });
  updateCartCount();
}


async function updateCartCount() {
  if (!isLoggedIn()) return;

  const cart = await apiFetch(API.GET_CART);
  const count =
    cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const badge = document.getElementById("cartCount");
  if (badge) badge.innerText = count;
}
