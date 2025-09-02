

// Controlador para el módulo contable
// Gestiona las operaciones CRUD sobre el Plan Único de Cuentas usando MySQL y Drizzle ORM

import { db } from './db.js'; // Importa la instancia de Drizzle ORM

// Obtener todas las cuentas del PUC
export async function getCuentasPUC(req, res) {
  try {
    const cuentas = await db.select().from('puc');
    res.json(cuentas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cuentas PUC', detalle: error.message });
  }
}

// Crear una nueva cuenta en el PUC
export async function createCuentaPUC(req, res) {
  try {
    const nuevaCuenta = req.body;
    const resultado = await db.insert('puc').values(nuevaCuenta);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cuenta PUC', detalle: error.message });
  }
}

// Editar una cuenta existente
export async function updateCuentaPUC(req, res) {
  try {
    const id = parseInt(req.params.id);
    const resultado = await db.update('puc').set(req.body).where({ id });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Cuenta no encontrada' });
    res.json({ mensaje: 'Cuenta actualizada', resultado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cuenta PUC', detalle: error.message });
  }
}

// Eliminar una cuenta
export async function deleteCuentaPUC(req, res) {
  try {
    const id = parseInt(req.params.id);
    const resultado = await db.delete('puc').where({ id });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Cuenta no encontrada' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cuenta PUC', detalle: error.message });
  }
}

