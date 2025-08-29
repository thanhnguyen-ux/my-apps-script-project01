fetch("/api/order", {
  method: "POST",
  body: JSON.stringify(orderDetails),
  headers: { "Content-Type": "application/json" }
})
  .then(async res => {
    const text = await res.text();  // lấy raw text
    console.log("🔍 Raw response từ proxy:", text);

    try {
      const data = JSON.parse(text);  // thử parse
      return data;
    } catch (err) {
      throw new Error("Không parse được JSON. Raw = " + text);
    }
  })
  .then(response => {
    if (response.success) {
      showPopup("Thành công!", response.message);
      cart = [];
      updateCartUI();
      document.getElementById("order-form").reset();
    } else {
      showPopup("Thất bại!", response.message, false);
    }
    btn.disabled = false;
    btn.textContent = "Xác Nhận Đặt Hàng";
  })
  .catch(err => {
    console.error("❌ Lỗi:", err);
    showPopup("Lỗi nghiêm trọng!", err.message, false);
    btn.disabled = false;
    btn.textContent = "Xác Nhận Đặt Hàng";
  });
