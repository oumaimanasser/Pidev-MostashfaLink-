import PDFDocument from 'pdfkit';
import MedicalRecord from '../models/MedicalRecord.js';
import Consultation from '../models/Consultation.js';

export const exportMedicalRecordPDF = async (req, res) => {
    try {
        const { recordId } = req.params;

        // Récupérer le dossier médical avec ses consultations
        const medicalRecord = await MedicalRecord.findById(recordId);
        if (!medicalRecord) {
            return res.status(404).json({ message: 'Dossier médical non trouvé' });
        }

        const consultations = await Consultation.find({ medicalRecord: recordId });

        // Créer le document PDF
        const doc = new PDFDocument();
        const filename = `dossier_medical_${medicalRecord.idRecord || recordId}.pdf`;

        // Configurer les headers pour le téléchargement
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Lier le document PDF à la réponse
        doc.pipe(res);

        // Ajouter le contenu au PDF
        doc.fontSize(20).text('Dossier Médical', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14)
            .text(`Nom patient: ${medicalRecord.patientName|| 'Non spécifié'}`)
            .text(`Numéro dossier: ${medicalRecord.idRecord || recordId}`)
            .text(`Créé le: ${medicalRecord.creationDate ? medicalRecord.creationDate.toLocaleDateString() : 'Non spécifié'}`);
        doc.moveDown();

        doc.fontSize(16).text('Informations Médicales', { underline: true });
        doc.fontSize(12)
            .text(`Allergies: ${medicalRecord.allergies || 'Aucune'}`)
            .text(`Médicaments: ${medicalRecord.medications || 'Aucun'}`)
            .text(`Diagnostics: ${medicalRecord.diagnostics || 'Aucun'}`);
        doc.moveDown();

        doc.fontSize(16).text('Consultations', { underline: true });
        if (consultations.length > 0) {
            consultations.forEach(consult => {
                doc.fontSize(12)
                    .text(`Date: ${consult.consultationDate ? consult.consultationDate.toLocaleDateString() : 'Non spécifiée'}`)
                    .text(`Médecin: ${consult.doctor || 'Non spécifié'}`)
                    .text(`Prescription: ${consult.prescription || 'Aucune'}`)
                    .text(`Traitement: ${consult.treatment || 'Aucun'}`)
                    .moveDown();
            });
        } else {
            doc.fontSize(12).text('Aucune consultation enregistrée');
        }

        // Finaliser le PDF
        doc.end();
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
    }
};