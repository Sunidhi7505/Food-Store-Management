
if (!isLoggedIn()) {
  alert("Please login to access cart");
  window.location.href = "login.html";
}


document.addEventListener("DOMContentLoaded", () => {
  loadCart();
});


async function loadCart() {
  try {
    const cart = await apiFetch(API.GET_CART);

    const cartItemsDiv = document.getElementById("cartItems");
    const cartFooter = document.getElementById("cartFooter");
    const emptyCart = document.getElementById("emptyCart");

    cartItemsDiv.innerHTML = "";

    if (!cart || !cart.items || cart.items.length === 0) {
      emptyCart.style.display = "block";
      cartFooter.style.display = "none";
      return;
    }

    emptyCart.style.display = "none";
    cartFooter.style.display = "block";

    let total = 0;

    cart.items.forEach(item => {
      total += item.price * item.quantity;

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="card-row">
          <div>
            <h4>${item.name}</h4>
            <p style="font-size:14px;color:var(--gray);">
              ₹${item.price} × ${item.quantity}
            </p>
          </div>
          <button class="btn btn-danger"
                  onclick="removeItem('${item.productId}')">
            Remove
          </button>
        </div>
      `;

      cartItemsDiv.appendChild(card);
    });

    document.getElementById("totalAmount").innerText = `₹${total}`;
  } catch (err) {
    console.error(err);
  }
}


async function removeItem(productId) {
  try {
    await apiFetch(`${API.CLEAR_CART.replace("/clear", "")}/remove/${productId}`, {
      method: "DELETE"
    });
    loadCart();
  } catch (err) {
    console.error(err);
  }
}

async function placeOrder() {
  try {
    await apiFetch(API.PLACE_ORDER, { method: "POST" });
    alert("Order placed successfully 🎉");
    window.location.href = "orders.html";
  } catch (err) {
    console.error(err);
  }
}
