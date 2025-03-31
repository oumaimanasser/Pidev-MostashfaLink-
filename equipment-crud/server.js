const express = require('express');
const PDFDocument = require('pdfkit');

// Création de l'application Express
const app = express();
const PORT = 5000;

// Middleware de base
app.use(express.json());

// Route de test OBLIGATOIRE
app.get('/api/test-server', (req, res) => {
    console.log("✅ Serveur fonctionnel");
    res.send("Test réussi - Serveur opérationnel");
});

// Route PDF - Version garantie
app.get('/api/generate-pdf', (req, res) => {
    console.log("📄 Début génération PDF");

    try {
        const doc = new PDFDocument();

        // Configuration CRITIQUE des headers
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=document.pdf'
        });

        // Génération du contenu PDF
        doc.pipe(res);
        doc.font('Helvetica-Bold')
            .fontSize(25)
            .text('PDF FONCTIONNEL', { align: 'center' })
            .moveDown(2)
            .fontSize(12)
            .text(`Généré le: ${new Date().toLocaleString()}`);

        doc.end();

    } catch (error) {
        console.error("💥 Erreur:", error);
        res.status(500).send("Erreur de génération");
    }
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
    console.log('Testez avec:');
    console.log(`1. curl http://localhost:${PORT}/api/test-server`);
    console.log(`2. curl http://localhost:${PORT}/api/generate-pdf --output test.pdf`);
});