// api/orders.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderDetails: req.body.orderDetails })
    });

    const data = await response.json();
    
    // Trả về kết quả từ Apps Script
    res.status(200).json(data);
  } catch (error) {
    console.error("Error posting data to Apps Script:", error);
    res.status(500).json({ success: false, message: "Failed to place order." });
  }
}