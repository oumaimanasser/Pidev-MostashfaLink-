const PDFDocument = require('pdfkit');

exports.exportEquipmentPDF = (req, res) => {
    try {
        console.log("🔵 Génération PDF démarrée");

        const doc = new PDFDocument();

        // Configuration CRITIQUE des headers
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=equipement.pdf'
        });

        doc.pipe(res);
        doc.text('TEST PDF FONCTIONNEL');
        doc.end();

    } catch (error) {
        console.error('💥 Erreur critique:', error);
        if (!res.headersSent) {
            res.status(500).send('Erreur de génération');
        }
    }
};