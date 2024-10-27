const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files from the current directory
app.use(express.static(__dirname));

// Endpoint to convert JPG files to PDF
app.post('/convert-to-pdf', upload.array('files'), async (req, res) => {
    const timestamp = Date.now();
    const pdfPath = path.join(__dirname, 'output', `${timestamp}.pdf`);

    // Sort jpg files by file name and filter out empty files
    const jpgFiles = req.files
        .filter(file => file.size > 0) // Check for non-empty files
        .sort((a, b) => {
            const numA = parseInt(a.originalname.match(/(\d+)/)?.[0] || 0, 10);
            const numB = parseInt(b.originalname.match(/(\d+)/)?.[0] || 0, 10);
            return numA - numB;
        });

    if (jpgFiles.length === 0) {
        return res.status(400).json({ error: "No valid JPG files found." });
    }

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    var temp_no = 0;
    // Loop through each JPG file
    for (const file of jpgFiles) {
        temp_no++;
        console.log(`temp_no ${temp_no}`);
        // Log each JPG size and file name
        console.log(`Processing ${file.originalname}: ${file.size} bytes`);

        // Get dimensions of the image
        const { width, height } = await sharp(file.path).metadata();

        // Add a new page and image
        doc.addPage({ size: [width, height] })
           .image(file.path, 0, 0, { width, height });

        // Remove the original JPG file after adding to PDF
        fs.unlinkSync(file.path);
    }

    doc.end();

    // Wait for the PDF to finish writing
    writeStream.on('finish', () => {
        console.log('PDF generation completed.');
        res.json({ pdfUrl: `/output/${timestamp}.pdf` });
    });

    writeStream.on('error', (err) => {
        console.error('Error writing PDF:', err);
        res.status(500).json({ error: "Error generating PDF." });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
