const express = require('express');
const QRCode = require('qrcode');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '1905', 
    database: 'qrcode'
  });

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API to Generate QR Code and Save to Database
app.post('/generate-qr', async (req, res) => {
  const uniqueId = `ID-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const qrData = `https://yourapp.com/dog?id=${uniqueId}`;

  try {
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // const base64Data = qrCodeImage.split(",")[1];

    // // Decode base64 string to binary data
    // const binaryData = atob(base64Data);
    // const byteArray = new Uint8Array(binaryData.length);
    // for (let i = 0; i < binaryData.length; i++) {
    //   byteArray[i] = binaryData.charCodeAt(i);
    // }
    // console.log("11111111111111");
    // // Create a Blob from the binary data
    // const imageBlob = new Blob([byteArray], { type: "image/png" });
    // const imageFile = new File([imageBlob], fileName, { type: "image/png" });
    // console.log("imageFile ==> ", imageFile);

    // Save to MySQL database
    const query = 'INSERT INTO qr_codes (unique_id, qr_data, qr_code_image) VALUES (?, ?, ?)';
    db.query(query, [uniqueId, qrData, qrCodeImage], (err, result) => {
      if (err) {
        console.error('Error saving to database:', err);
        res.status(500).json({ error: 'Error saving to database' });
        return;
      }

      res.json({ id: result.insertId, uniqueId, qrData, qrCodeImage });
    });
  } catch (error) {
    console.error('Error generating QR Code:', error);
    res.status(500).json({ error: 'Error generating QR Code' });
  }
});

// API to Retrieve All QR Codes
app.get('/get-qr-codes', (req, res) => {
  const query = 'SELECT * FROM qr_codes';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: 'Error retrieving data' });
      return;
    }

    res.json(results);
  });
});


app.post('/submit-dog-data', (req, res) => {
    const { unique_id, name, breed, age, owner_name, contact_number, medical_conditions } = req.body;
  
    if (!unique_id || !name || !breed || !age || !owner_name || !contact_number) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    // Insert the dog data into the database
    const sql = `
      INSERT INTO dogs (unique_id, name, breed, age, owner_name, contact_number, medical_conditions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const dogData = [unique_id, name, breed, age, owner_name, contact_number, medical_conditions || 'None'];
  
    db.query(sql, dogData, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to insert dog data' });
      }
  
      res.status(201).json({
        message: 'Dog data submitted successfully',
        dogData: {
          unique_id: dogData[0],
          name: dogData[1],
          breed: dogData[2],
          age: dogData[3],
          owner_name: dogData[4],
          contact_number: dogData[5],
          medical_conditions: dogData[6]
        }
      });
    });
  });




  app.get('/get-dog-data/:unique_id', (req, res) => {
    const uniqueId = req.params.unique_id;  // Get unique_id from URL params
  
    // SQL query to find dog data by unique_id
    const sql = 'SELECT * FROM dogs WHERE unique_id = ?';
    
    db.query(sql, [uniqueId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database query error' });
      }
  
      // If no dog data is found
      if (results.length === 0) {
        return res.status(404).json({ message: 'Dog data not found' });
      }
  
      // If dog data is found, return it
      res.status(200).json({
        message: 'Dog data fetched successfully',
        dogData: results[0]
      });
    });
  });  


// PUT API to update dog data by unique_id
app.put('/update-dog-data/:unique_id', (req, res) => {
  const uniqueId = req.params.unique_id; // Get unique_id from URL params
  const { name, breed, age, owner_name, contact_number, medical_conditions } = req.body;

  // SQL query to update dog data by unique_id
  const sql = `
    UPDATE dogs 
    SET 
      name = COALESCE(?, name), 
      breed = COALESCE(?, breed), 
      age = COALESCE(?, age), 
      owner_name = COALESCE(?, owner_name), 
      contact_number = COALESCE(?, contact_number), 
      medical_conditions = COALESCE(?, medical_conditions)
    WHERE unique_id = ?
  `;

  db.query(
    sql,
    [name , breed , age , owner_name , contact_number , medical_conditions , uniqueId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database query error' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Dog data not found for this unique ID' });
      }

      res.status(200).json({ message: 'Dog data updated successfully' });
    }
  );
});



// DELETE API to delete dog data by unique_id
app.delete('/delete-dog-data/:unique_id', (req, res) => {
  const uniqueId = req.params.unique_id;  // Get unique_id from URL params

  // SQL query to delete dog data by unique_id
  const sql = 'DELETE FROM dogs WHERE unique_id = ?';

  db.query(sql, [uniqueId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database query error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Dog data not found for this unique ID' });
    }

    res.status(200).json({ message: 'Dog data deleted successfully' });
  });
});



app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
