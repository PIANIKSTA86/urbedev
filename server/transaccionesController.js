// Controlador para transacciones contables
// Gestiona las operaciones CRUD sobre las transacciones

import * as transacciones from './models/transacciones.js';
import * as cuentasPUC from './models/puc.js';

// Obtener todas las transacciones
export function getTransacciones(req, res) {
  res.json(transacciones);
}

// Crear una nueva transacción
export function createTransaccion(req, res) {
  const nuevaTransaccion = req.body;
  // Validar que todas las cuentas existan en el PUC
  const codigosPUC = cuentasPUC.map(c => c.codigo);
  let cuentasValidas = true;
  let errorCuentas = [];
  if (!Array.isArray(nuevaTransaccion.cuentas) || nuevaTransaccion.cuentas.length === 0) {
    return res.status(400).json({ error: 'Debe incluir al menos una cuenta en la transacción.' });
  }
  nuevaTransaccion.cuentas.forEach(cuenta => {
    if (!codigosPUC.includes(cuenta.codigo)) {
      cuentasValidas = false;
      errorCuentas.push(cuenta.codigo);
    }
    if (typeof cuenta.debito !== 'number' || typeof cuenta.credito !== 'number' || cuenta.debito < 0 || cuenta.credito < 0) {
      cuentasValidas = false;
      errorCuentas.push(`Monto inválido en cuenta ${cuenta.codigo}`);
    }
  });
  if (!cuentasValidas) {
    return res.status(400).json({ error: 'Cuentas inválidas o no existen en el PUC', detalles: errorCuentas });
  }
  // Validar que la suma de débitos sea igual a la suma de créditos
  const totalDebito = nuevaTransaccion.cuentas.reduce((sum, c) => sum + c.debito, 0);
  const totalCredito = nuevaTransaccion.cuentas.reduce((sum, c) => sum + c.credito, 0);
  if (totalDebito !== totalCredito) {
    return res.status(400).json({ error: 'La suma de débitos y créditos debe ser igual.' });
  }
  nuevaTransaccion.id = transacciones.length + 1;
  transacciones.push(nuevaTransaccion);
  res.status(201).json(nuevaTransaccion);
}

// Editar una transacción existente
export function updateTransaccion(req, res) {
  const id = parseInt(req.params.id);
  const index = transacciones.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Transacción no encontrada' });
  transacciones[index] = { ...transacciones[index], ...req.body };
  res.json(transacciones[index]);
}

// Eliminar una transacción
export function deleteTransaccion(req, res) {
  const id = parseInt(req.params.id);
  const index = transacciones.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Transacción no encontrada' });
  transacciones.splice(index, 1);
  res.status(204).send();
}

