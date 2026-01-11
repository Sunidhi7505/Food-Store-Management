
if (!isLoggedIn()) {
  alert("Please login to view orders");
  window.location.href = "login.html";
}


document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});


async function loadOrders() {
  try {
    const orders = await apiFetch(API.GET_ORDERS);

    const ordersList = document.getElementById("ordersList");
    const emptyOrders = document.getElementById("emptyOrders");

    ordersList.innerHTML = "";

    if (!orders || orders.length === 0) {
      emptyOrders.style.display = "block";
      return;
    }

    emptyOrders.style.display = "none";

    orders.forEach(order => {
      let itemsHtml = "";
      let total = 0;

      order.items.forEach(item => {
        total += item.price * item.quantity;
        itemsHtml += `
          <p style="font-size:14px;">
            ${item.name} × ${item.quantity}
          </p>
        `;
      });


      const statusColor =
        order.status === "DELIVERED" ? "#28a745" : "#ff9800";

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h4>Order #${order.id}</h4>

        <p style="font-size:13px;color:var(--gray);">
          ${new Date(order.orderTime).toLocaleString()}
        </p>

        <span style="
          display:inline-block;
          margin:6px 0;
          padding:4px 12px;
          border-radius:20px;
          font-size:12px;
          background:${statusColor};
          color:white;
        ">
          ${order.status}
        </span>

        <div style="margin:10px 0;">
          ${itemsHtml}
        </div>

        <div class="total">₹${total}</div>
      `;

      ordersList.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}
