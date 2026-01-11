
const BASE_URL = "http://localhost:8080";


const API = {

  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,

 
  PRODUCTS: `${BASE_URL}/api/products`,
  PRODUCT_BY_ID: (id) => `${BASE_URL}/api/products/${id}`,


  ADD_TO_CART: (productId, quantity = 1) =>
    `${BASE_URL}/api/cart/add/${productId}?quantity=${quantity}`,
  GET_CART: `${BASE_URL}/api/cart`,
  CLEAR_CART: `${BASE_URL}/api/cart/clear`,


  PLACE_ORDER: `${BASE_URL}/api/orders/place`,
  GET_ORDERS: `${BASE_URL}/api/orders`, 


  ADD_REVIEW: (productId) =>
    `${BASE_URL}/api/reviews/${productId}`, 
  GET_REVIEWS: (productId) =>
    `${BASE_URL}/api/reviews/${productId}`,


  ADD_PRODUCT: `${BASE_URL}/api/products`,
  UPDATE_PRODUCT: (id) => `${BASE_URL}/api/products/${id}`,
  DELETE_PRODUCT: (id) => `${BASE_URL}/api/products/${id}`,
  ADMIN_DASHBOARD: `${BASE_URL}/api/admin/dashboard`,
  ADMIN_REVENUE: `${BASE_URL}/api/orders/admin/revenue`,
};


function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function getToken() {
  return getUser()?.token || null;
}

function isLoggedIn() {
  return !!getUser();
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}


async function apiFetch(url, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });


    if (response.status === 401) {
      if (isLoggedIn()) {
        console.warn("Session expired");
        logout();
      }
      return null;
    }


    if (response.status === 403) {
      console.warn("Access forbidden:", url);
      return null;
    }


if (!response.ok) {
  let errorMessage = "Request failed";

  try {
    const errorJson = await response.json();
    errorMessage = errorJson.message || errorMessage;
  } catch (e) {

    const text = await response.text();
    if (text) errorMessage = text;
  }

  throw new Error(errorMessage);
}


    if (response.status === 204) return null;

    return await response.json();
  } catch (err) {
    console.error("API ERROR:", err.message);
    throw err;
  }
}
