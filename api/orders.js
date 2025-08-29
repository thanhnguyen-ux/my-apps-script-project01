export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const orderDetails = req.body; // body JSON từ frontend

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxGNGtt04zpIrOahbkCQwj3p6U_9dQmrVernFf0SSZcdoQvquSOLbhHBAMQHKu0Vk26/exec?action=placeOrder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderDetails), // gửi JSON
        }
      );

      // ⚡ kiểm tra nếu response không phải JSON
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch {
        res.status(500).json({ success: false, message: "Apps Script không trả JSON: " + text });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error: " + err.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
