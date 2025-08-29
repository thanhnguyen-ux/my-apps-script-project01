export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Nhận dữ liệu từ client
      const orderDetails = req.body;

      // Gửi sang Google Apps Script Web App
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxGNGtt04zpIrOahbkCQwj3p6U_9dQmrVernFf0SSZcdoQvquSOLbhHBAMQHKu0Vk26/exec?action=placeOrder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderDetails),
        }
      );

      const data = await response.json();

      // Trả lại client
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error: " + err.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
