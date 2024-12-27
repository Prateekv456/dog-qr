const express = require('express');
const QRCode = require('qrcode');
const app = express();

app.use(express.json());

// In-memory database for storing QR codes (use a real database in production)
const qrDatabase = [];

// Generate QR Code API
app.post('/generate-qr', async (req, res) => {
  const uniqueId = `ID-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const qrData = `https://yourapp.com/dog?id=${uniqueId}`;

  try {
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Save to database
    qrDatabase.push({ id: uniqueId, qrData, qrCodeImage });

    res.json({ id: uniqueId, qrCodeImage });
  } catch (error) {
    res.status(500).json({ error: 'Error generating QR Code' });
  }
});

// Get all QR Codes API
app.get('/get-qr-codes', (req, res) => {
  res.json(qrDatabase);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
