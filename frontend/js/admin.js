document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadAdminDashboard();
});


async function loadProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  try {
    const products = await apiFetch(API.PRODUCTS);
    if (!products) return;

    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "admin-product";

      div.innerHTML = `
        <div>
          <h4>${p.name}</h4>
          <small>₹${p.price} | Stock: ${p.stock}</small><br/>
          <span class="${p.available ? "badge-green" : "badge-red"}">
            ${p.available ? "Available" : "Unavailable"}
          </span>
        </div>

        <div>
          <button type="button" class="btn btn-outline"
                  onclick="editProduct('${p.id}')">Edit</button>
          <button type="button" class="btn btn-danger"
                  onclick="deleteProduct('${p.id}')">Delete</button>
        </div>
      `;

      list.appendChild(div);
    });
  } catch (err) {
    alert("Failed to load products");
    console.error(err);
  }
}

async function loadAdminDashboard() {
  try {
    const totalRevenue = await apiFetch(API.ADMIN_REVENUE);
    if (totalRevenue == null) return;

    setTimeout(() => {
      renderRevenueChart(totalRevenue);
    }, 0);

  } catch (err) {
    console.error("Failed to load revenue", err);
  }
}

function renderRevenueChart(totalRevenue) {
  const canvas = document.getElementById("revenueChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (window.revenueChart) {
    window.revenueChart.destroy();
  }

  window.revenueChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Total Revenue"],
      datasets: [{
        label: "Revenue ₹",
        data: [totalRevenue],
        backgroundColor: "#ff4d4d",
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, 
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

async function saveProduct() {
  try {
    const id = document.getElementById("productId").value;

    const payload = {
      name: document.getElementById("name").value.trim(),
      price: Number(document.getElementById("price").value),
      imageUrl: document.getElementById("imageUrl").value.trim(),
      stock: Number(document.getElementById("stock").value),
      description: document.getElementById("description").value.trim()
    };

    if (!payload.name || payload.price < 0 || payload.stock < 0) {
      alert("Please enter valid product details");
      return;
    }

    if (id) {
      await apiFetch(API.UPDATE_PRODUCT(id), {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      alert("Product updated successfully ✅");
    } else {
      await apiFetch(API.ADD_PRODUCT, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      alert("Product added successfully ✅");
    }

    resetForm();
    loadProducts();
    loadAdminDashboard();

  } catch (err) {
    alert("Failed to save product ❌\n" + err.message);
    console.error(err);
  }
}

async function editProduct(id) {
  const p = await apiFetch(API.PRODUCT_BY_ID(id));
  if (!p) return;

  document.getElementById("formTitle").innerText = "Update Product";
  document.getElementById("productId").value = p.id;
  document.getElementById("name").value = p.name;
  document.getElementById("price").value = p.price;
  document.getElementById("imageUrl").value = p.imageUrl || "";
  document.getElementById("stock").value = p.stock;
  document.getElementById("description").value = p.description || "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteProduct(id) {
  if (!confirm("Delete product?")) return;

  await apiFetch(API.DELETE_PRODUCT(id), { method: "DELETE" });
  alert("Product deleted ✅");
  loadProducts();
  loadAdminDashboard();
}

function resetForm() {
  document.getElementById("formTitle").innerText = "Add Product";
  document.getElementById("productId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("imageUrl").value = "";
  document.getElementById("stock").value = "";
  document.getElementById("description").value = "";
}
