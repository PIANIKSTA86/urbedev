import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import { insertTerceroSchema, insertUnidadSchema } from "@shared/schema";
import { z } from "zod";

// Middleware de autenticación JWT
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token de acceso requerido' });
  }

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido' });
  }
};

// Schema para login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // =================
  // RUTAS DE AUTENTICACIÓN
  // =================
  
  // Endpoint para iniciar sesión
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Validar credenciales
      const usuario = await storage.validarContrasena(email, password);
      if (!usuario) {
        return res.status(401).json({ mensaje: "Credenciales inválidas" });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          rol: usuario.rol 
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.json({
        mensaje: "Autenticación exitosa",
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(400).json({ mensaje: "Datos de entrada inválidos" });
    }
  });

  // Endpoint para obtener información del usuario autenticado
  app.get("/api/auth/usuario", authenticateToken, async (req: any, res) => {
    try {
      const usuario = await storage.getUsuario(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      res.json({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol
      });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  });

  // =================
  // RUTAS DEL DASHBOARD
  // =================
  
  // Endpoint para obtener estadísticas del dashboard
  app.get("/api/dashboard/estadisticas", authenticateToken, async (req, res) => {
    try {
      const estadisticas = await storage.getEstadisticasDashboard();
      res.json(estadisticas);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).json({ mensaje: "Error al obtener estadísticas del dashboard" });
    }
  });

  // =================
  // RUTAS DE TERCEROS
  // =================
  
  // Obtener lista de terceros con filtros
  app.get("/api/terceros", authenticateToken, async (req: any, res) => {
    try {
      const { tipo, busqueda, limite = 10, offset = 0 } = req.query;
      
      const resultado = await storage.getTerceros({
        tipo,
        busqueda,
        limite: parseInt(limite),
        offset: parseInt(offset)
      });
      
      res.json(resultado);
    } catch (error) {
      console.error("Error al obtener terceros:", error);
      res.status(500).json({ mensaje: "Error al obtener lista de terceros" });
    }
  });

  // Obtener un tercero específico
  app.get("/api/terceros/:id", authenticateToken, async (req, res) => {
    try {
      const tercero = await storage.getTercero(req.params.id);
      if (!tercero) {
        return res.status(404).json({ mensaje: "Tercero no encontrado" });
      }
      res.json(tercero);
    } catch (error) {
      console.error("Error al obtener tercero:", error);
      res.status(500).json({ mensaje: "Error al obtener información del tercero" });
    }
  });

  // Crear nuevo tercero
  app.post("/api/terceros", authenticateToken, async (req, res) => {
    try {
      const datosTercero = insertTerceroSchema.parse(req.body);
      const nuevoTercero = await storage.crearTercero(datosTercero);
      
      res.status(201).json({
        mensaje: "Tercero creado exitosamente",
        tercero: nuevoTercero
      });
    } catch (error) {
      console.error("Error al crear tercero:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          mensaje: "Datos de entrada inválidos",
          errores: error.errors
        });
      }
      res.status(500).json({ mensaje: "Error al crear tercero" });
    }
  });

  // Actualizar tercero
  app.put("/api/terceros/:id", authenticateToken, async (req, res) => {
    try {
      const datosActualizacion = insertTerceroSchema.partial().parse(req.body);
      const terceroActualizado = await storage.actualizarTercero(req.params.id, datosActualizacion);
      
      res.json({
        mensaje: "Tercero actualizado exitosamente",
        tercero: terceroActualizado
      });
    } catch (error) {
      console.error("Error al actualizar tercero:", error);
      res.status(500).json({ mensaje: "Error al actualizar tercero" });
    }
  });

  // Eliminar tercero (soft delete)
  app.delete("/api/terceros/:id", authenticateToken, async (req, res) => {
    try {
      await storage.eliminarTercero(req.params.id);
      res.json({ mensaje: "Tercero eliminado exitosamente" });
    } catch (error) {
      console.error("Error al eliminar tercero:", error);
      res.status(500).json({ mensaje: "Error al eliminar tercero" });
    }
  });

  // =================
  // RUTAS DE UNIDADES HABITACIONALES
  // =================
  
  // Obtener lista de unidades
  app.get("/api/unidades", authenticateToken, async (req: any, res) => {
    try {
      const { propietarioId, busqueda, limite = 10, offset = 0 } = req.query;
      
      const resultado = await storage.getUnidades({
        propietarioId,
        busqueda,
        limite: parseInt(limite),
        offset: parseInt(offset)
      });
      
      res.json(resultado);
    } catch (error) {
      console.error("Error al obtener unidades:", error);
      res.status(500).json({ mensaje: "Error al obtener lista de unidades" });
    }
  });

  // Obtener una unidad específica
  app.get("/api/unidades/:id", authenticateToken, async (req, res) => {
    try {
      const unidad = await storage.getUnidad(req.params.id);
      if (!unidad) {
        return res.status(404).json({ mensaje: "Unidad no encontrada" });
      }
      res.json(unidad);
    } catch (error) {
      console.error("Error al obtener unidad:", error);
      res.status(500).json({ mensaje: "Error al obtener información de la unidad" });
    }
  });

  // Crear nueva unidad
  app.post("/api/unidades", authenticateToken, async (req, res) => {
    try {
      const datosUnidad = insertUnidadSchema.parse(req.body);
      const nuevaUnidad = await storage.crearUnidad(datosUnidad);
      
      res.status(201).json({
        mensaje: "Unidad creada exitosamente",
        unidad: nuevaUnidad
      });
    } catch (error) {
      console.error("Error al crear unidad:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          mensaje: "Datos de entrada inválidos",
          errores: error.errors
        });
      }
      res.status(500).json({ mensaje: "Error al crear unidad" });
    }
  });

  // Actualizar unidad
  app.put("/api/unidades/:id", authenticateToken, async (req, res) => {
    try {
      const datosActualizacion = insertUnidadSchema.partial().parse(req.body);
      const unidadActualizada = await storage.actualizarUnidad(req.params.id, datosActualizacion);
      
      res.json({
        mensaje: "Unidad actualizada exitosamente",
        unidad: unidadActualizada
      });
    } catch (error) {
      console.error("Error al actualizar unidad:", error);
      res.status(500).json({ mensaje: "Error al actualizar unidad" });
    }
  });

  // Eliminar unidad (soft delete)
  app.delete("/api/unidades/:id", authenticateToken, async (req, res) => {
    try {
      await storage.eliminarUnidad(req.params.id);
      res.json({ mensaje: "Unidad eliminada exitosamente" });
    } catch (error) {
      console.error("Error al eliminar unidad:", error);
      res.status(500).json({ mensaje: "Error al eliminar unidad" });
    }
  });

  // =================
  // RUTAS DE CONTABILIDAD
  // =================
  
  // Obtener plan de cuentas
  app.get("/api/contabilidad/plan-cuentas", authenticateToken, async (req, res) => {
    try {
      const planCuentas = await storage.getPlanCuentas();
      res.json(planCuentas);
    } catch (error) {
      console.error("Error al obtener plan de cuentas:", error);
      res.status(500).json({ mensaje: "Error al obtener plan de cuentas" });
    }
  });

  // Obtener períodos contables
  app.get("/api/contabilidad/periodos", authenticateToken, async (req, res) => {
    try {
      const periodos = await storage.getPeriodos();
      res.json(periodos);
    } catch (error) {
      console.error("Error al obtener períodos:", error);
      res.status(500).json({ mensaje: "Error al obtener períodos contables" });
    }
  });

  // Obtener período actual
  app.get("/api/contabilidad/periodo-actual", authenticateToken, async (req, res) => {
    try {
      const periodoActual = await storage.getPeriodoActual();
      if (!periodoActual) {
        return res.status(404).json({ mensaje: "No hay período activo" });
      }
      res.json(periodoActual);
    } catch (error) {
      console.error("Error al obtener período actual:", error);
      res.status(500).json({ mensaje: "Error al obtener período actual" });
    }
  });

  // Obtener comprobantes contables
  app.get("/api/contabilidad/comprobantes", authenticateToken, async (req: any, res) => {
    try {
      const { periodoId } = req.query;
      const comprobantes = await storage.getComprobantes(periodoId);
      res.json(comprobantes);
    } catch (error) {
      console.error("Error al obtener comprobantes:", error);
      res.status(500).json({ mensaje: "Error al obtener comprobantes contables" });
    }
  });

  // =================
  // ENDPOINTS ADICIONALES PARA OPERACIONES ESPECIALIZADAS
  // =================

  // Endpoint para obtener propietarios (terceros de tipo propietario)
  app.get("/api/propietarios", authenticateToken, async (req: any, res) => {
    try {
      const { busqueda, limite = 50, offset = 0 } = req.query;
      
      const resultado = await storage.getTerceros({
        tipo: 'propietario',
        busqueda,
        limite: parseInt(limite),
        offset: parseInt(offset)
      });
      
      res.json(resultado);
    } catch (error) {
      console.error("Error al obtener propietarios:", error);
      res.status(500).json({ mensaje: "Error al obtener lista de propietarios" });
    }
  });

  // Crear servidor HTTP
  const httpServer = createServer(app);

  return httpServer;
}
