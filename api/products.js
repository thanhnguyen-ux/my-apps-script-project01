// File: /api/products.js

export default async function handler(req, res) {
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  try {
    const response = await fetch(appsScriptUrl);
    const data = await response.json();
    
    // Trả về dữ liệu từ Apps Script
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from Apps Script:", error);
    res.status(500).json({ status: 'error', message: "Failed to fetch data." });
  }
}