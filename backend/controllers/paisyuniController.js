import {
  getAllPaises,
  getUniversidadesByPais,
} from "../services/paisesUniService.js";

export const getAllPaisesController = async (req, res) => {
  console.log("📥 GET /api/paises recibido");
  try {
    const paises = await getAllPaises();
    console.log("📦 Países encontrados:", paises.length);
    
    if (paises.length === 0) {
      console.warn("⚠️ No hay países en la BD");
      return res.status(404).json({ error: "No se encontraron países" });
    }
    
    res.status(200).json(paises);
  } catch (error) {
    console.error("🔥 Error en getAllPaisesController:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUniversidadesByPaisController = async (req, res) => {
  const { idPais } = req.params;
  console.log(`📥 GET /api/paises/universidades/${idPais} recibido`);

  if (!idPais || isNaN(idPais)) {
    console.warn("⚠️ ID de país inválido:", idPais);
    return res.status(400).json({ error: "ID de país inválido" });
  }

  try {
    const universidades = await getUniversidadesByPais(idPais);
    console.log(`📦 Universidades para país ${idPais}:`, universidades.length);
    
    if (universidades.length === 0) {
      console.warn(`⚠️ No hay universidades para país ${idPais}`);
      return res.status(404).json({ error: "No se encontraron universidades" });
    }
    
    res.status(200).json(universidades);
  } catch (error) {
    console.error("🔥 Error en getUniversidadesByPaisController:", error);
    res.status(500).json({ error: error.message });
  }
};