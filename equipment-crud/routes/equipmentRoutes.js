const express = require("express");
const router = express.Router();
const {
    createEquipment,
    getAllEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment
} = require("../controllers/equipmentController");

// Routes CRUD pour les équipements
router.post("/", createEquipment);
router.get("/", getAllEquipment);
router.get("/:id", getEquipmentById);  // Cette route prend un ID d'équipement
router.put("/:id", updateEquipment);
router.delete("/:id", deleteEquipment);

module.exports = router;
