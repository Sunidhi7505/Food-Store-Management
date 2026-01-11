async function loadReviews(productId) {
  try {
    const reviews = await apiFetch(API.GET_REVIEWS(productId));
    const container = document.getElementById(`reviews-${productId}`);

    if (!container) return;

    container.innerHTML = "";

    if (!reviews || reviews.length === 0) {
      container.innerHTML = `<p style="font-size:13px;color:gray;">No reviews yet</p>`;
      return;
    }

    reviews.forEach(r => {
      const div = document.createElement("div");
      div.style.marginBottom = "8px";
      div.innerHTML = `
        <strong>⭐ ${r.rating}/5</strong>
        <p style="font-size:13px;">${r.comment}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

async function submitReview(productId) {
  const rating = document.getElementById(`rating-${productId}`).value;
  const comment = document.getElementById(`comment-${productId}`).value;

  if (!rating || !comment) {
    alert("Please enter rating and comment");
    return;
  }

  try {
    await apiFetch(API.ADD_REVIEW(productId), {
      method: "POST",
      body: JSON.stringify({ rating: +rating, comment })
    });

    alert("Review submitted ✅");
    loadReviews(productId);
  } catch (err) {
    alert(err.message);
  }
}
