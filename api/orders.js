export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbx-y-H1jLsEjSjyDFIXAQCz_GsKgVsCywo6zqt3lcT0PEL4R5Yj8hFY9xQdC3bwA2ea/exec?action=placeOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();  // lấy raw text để debug
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ success: false, message: "Không parse được JSON", raw: text });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
