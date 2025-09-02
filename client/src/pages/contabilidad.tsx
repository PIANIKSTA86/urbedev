import React from "react";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { TopNavigation } from "@/components/layout/top-navigation";
import { PlanCuentas } from "@/components/contabilidad/plan-cuentas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  FileText, 
  Calendar, 
  DollarSign,
  CheckCircle
} from "lucide-react";

export default function Contabilidad() {
  const { data: periodoActual } = useQuery({
    queryKey: ["/api/contabilidad/periodo-actual"],
  });

  const { data: comprobantes } = useQuery({
    queryKey: ["/api/contabilidad/comprobantes"],
  });

  // Estadísticas contables simuladas (en una implementación real vendrían del backend)
  const estadisticasContables = {
    balanceGeneral: 125800000,
    ingresos: 45200000,
    gastos: 32100000,
    utilidad: 13100000
  };

  // Filtros para reportes
  const [filtros, setFiltros] = React.useState({
    desde: '',
    hasta: '',
    cuentaCodigo: '',
    terceroId: ''
  });

  // Estado para reportes
  const [balancePrueba, setBalancePrueba] = React.useState<any>(null);
  const [balanceGeneral, setBalanceGeneral] = React.useState<any>(null);
  const [estadoResultados, setEstadoResultados] = React.useState<any>(null);
  const [libroDiario, setLibroDiario] = React.useState<any>(null);

  // Función para cargar reportes
  const cargarReportes = async () => {
    const params = new URLSearchParams();
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    if (filtros.cuentaCodigo) params.append('cuentaCodigo', filtros.cuentaCodigo);
    if (filtros.terceroId) params.append('terceroId', filtros.terceroId);
    const [bp, bg, er, ld] = await Promise.all([
      fetch(`/api/contabilidad/reportes/balance-prueba?${params}`).then(r => r.json()),
      fetch(`/api/contabilidad/reportes/balance-general?${params}`).then(r => r.json()),
      fetch(`/api/contabilidad/reportes/estado-resultados?${params}`).then(r => r.json()),
      fetch(`/api/contabilidad/reportes/libro-diario?${params}`).then(r => r.json())
    ]);
    setBalancePrueba(bp);
    setBalanceGeneral(bg);
    setEstadoResultados(er);
    setLibroDiario(ld);
  };

  React.useEffect(() => {
    cargarReportes();
    // eslint-disable-next-line
  }, [filtros]);

  // Función para exportar reportes
  const exportarReporte = (tipo: string, formato: string) => {
    const params = new URLSearchParams();
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    if (filtros.cuentaCodigo) params.append('cuentaCodigo', filtros.cuentaCodigo);
    if (filtros.terceroId) params.append('terceroId', filtros.terceroId);
    params.append('export', formato);
    window.open(`/api/contabilidad/reportes/${tipo}?${params}`, '_blank');
  };

  return (
    <div className="flex h-screen">
  <SidebarNew />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Módulo de Contabilidad" />
        <main className="flex-1 p-6 overflow-auto">
          {/* Filtros avanzados para reportes */}
          <div className="mb-6 flex gap-4 flex-wrap">
            <input type="date" value={filtros.desde} onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))} className="border rounded px-2 py-1" placeholder="Desde" />
            <input type="date" value={filtros.hasta} onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))} className="border rounded px-2 py-1" placeholder="Hasta" />
            <input type="text" value={filtros.cuentaCodigo} onChange={e => setFiltros(f => ({ ...f, cuentaCodigo: e.target.value }))} className="border rounded px-2 py-1" placeholder="Código de cuenta" />
            <input type="text" value={filtros.terceroId} onChange={e => setFiltros(f => ({ ...f, terceroId: e.target.value }))} className="border rounded px-2 py-1" placeholder="ID Tercero" />
            <Button onClick={cargarReportes}>Filtrar</Button>
          </div>

          {/* Sección de reportes contables */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Reportes Contables</h2>
            <div className="flex gap-2 mb-4">
              <Button onClick={() => exportarReporte('balance-prueba', 'excel')}>Exportar Balance de Prueba (Excel)</Button>
              <Button onClick={() => exportarReporte('balance-prueba', 'pdf')}>Exportar Balance de Prueba (PDF)</Button>
              <Button onClick={() => exportarReporte('balance-general', 'excel')}>Exportar Balance General (Excel)</Button>
              <Button onClick={() => exportarReporte('balance-general', 'pdf')}>Exportar Balance General (PDF)</Button>
              <Button onClick={() => exportarReporte('estado-resultados', 'excel')}>Exportar Estado de Resultados (Excel)</Button>
              <Button onClick={() => exportarReporte('estado-resultados', 'pdf')}>Exportar Estado de Resultados (PDF)</Button>
              <Button onClick={() => exportarReporte('libro-diario', 'excel')}>Exportar Libro Diario (Excel)</Button>
              <Button onClick={() => exportarReporte('libro-diario', 'pdf')}>Exportar Libro Diario (PDF)</Button>
            </div>
            {/* Balance de Prueba */}
            {balancePrueba && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Balance de Prueba</h3>
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border px-2">Código</th>
                      <th className="border px-2">Nombre</th>
                      <th className="border px-2">Débito</th>
                      <th className="border px-2">Crédito</th>
                      <th className="border px-2">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(balancePrueba).map(([codigo, data]: any) => (
                      <tr key={codigo}>
                        <td className="border px-2">{codigo}</td>
                        <td className="border px-2">{data.nombre}</td>
                        <td className="border px-2">{data.debito}</td>
                        <td className="border px-2">{data.credito}</td>
                        <td className="border px-2">{data.saldo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Balance General */}
            {balanceGeneral && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Balance General</h3>
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border px-2">Clase</th>
                      <th className="border px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(balanceGeneral.resumen).map(([clase, total]: any) => (
                      <tr key={clase}>
                        <td className="border px-2">{clase}</td>
                        <td className="border px-2">{total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Estado de Resultados */}
            {estadoResultados && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Estado de Resultados</h3>
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border px-2">Ingresos</th>
                      <th className="border px-2">Gastos</th>
                      <th className="border px-2">Utilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-2">{estadoResultados.ingresos}</td>
                      <td className="border px-2">{estadoResultados.gastos}</td>
                      <td className="border px-2">{estadoResultados.utilidad}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {/* Libro Diario */}
            {libroDiario && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Libro Diario</h3>
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border px-2">Fecha</th>
                      <th className="border px-2">Descripción</th>
                      <th className="border px-2">Documento</th>
                      <th className="border px-2">Cuenta</th>
                      <th className="border px-2">Débito</th>
                      <th className="border px-2">Crédito</th>
                      <th className="border px-2">Tercero</th>
                    </tr>
                  </thead>
                  <tbody>
                    {libroDiario.map((tx: any) => (
                      tx.cuentas.map((c: any, idx: number) => (
                        <tr key={tx.id + '-' + idx}>
                          <td className="border px-2">{tx.fecha}</td>
                          <td className="border px-2">{tx.descripcion}</td>
                          <td className="border px-2">{tx.documento}</td>
                          <td className="border px-2">{c.codigo}</td>
                          <td className="border px-2">{c.debito}</td>
                          <td className="border px-2">{c.credito}</td>
                          <td className="border px-2">{tx.terceroId || ''}</td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Módulo de Contabilidad</h1>
            <p className="text-muted-foreground">Gestión completa del sistema contable y financiero</p>
          </div>
          
          {/* Estadísticas contables */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Balance General</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${estadisticasContables.balanceGeneral.toLocaleString()}
                    </p>
                    <p className="text-secondary text-sm">Total Activos</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Calculator className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Ingresos</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${estadisticasContables.ingresos.toLocaleString()}
                    </p>
                    <p className="text-secondary text-sm">Este período</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Gastos</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${estadisticasContables.gastos.toLocaleString()}
                    </p>
                    <p className="text-destructive text-sm">Este período</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <TrendingDown className="text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Utilidad</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${estadisticasContables.utilidad.toLocaleString()}
                    </p>
                    <p className="text-secondary text-sm">+28.9% vs anterior</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <BarChart3 className="text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sección de acciones contables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Plan de Cuentas */}
            <PlanCuentas />
            
            {/* Transacciones Recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Transacciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(comprobantes as any)?.slice(0, 3).map((comprobante: any, index: number) => (
                    <div key={index} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-foreground font-medium">
                          Comp. {comprobante.numeroComprobante}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {new Date(comprobante.fecha).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{comprobante.concepto}</p>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Debe: ${comprobante.totalDebito?.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Haber: ${comprobante.totalCredito?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-8">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay transacciones registradas</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  data-testid="button-new-transaction"
                >
                  Nueva Transacción
                </Button>
              </CardContent>
            </Card>
            
            {/* Reportes Disponibles */}
            <Card>
              <CardHeader>
                <CardTitle>Reportes Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { nombre: "Balance de Prueba", icon: FileText, color: "blue" },
                    { nombre: "Balance General", icon: BarChart3, color: "green" },
                    { nombre: "Estado de Resultados", icon: TrendingUp, color: "red" },
                    { nombre: "Libro Diario", icon: Calendar, color: "purple" }
                  ].map((reporte, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-between p-3 h-auto"
                      data-testid={`button-report-${reporte.nombre.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center">
                        <reporte.icon className={`text-${reporte.color}-600 mr-3`} />
                        <span className="text-foreground">{reporte.nombre}</span>
                      </div>
                      <span className="text-muted-foreground">📄</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Período Contable Actual */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Período Contable Actual</CardTitle>
              <Button 
                variant="outline"
                data-testid="button-manage-periods"
              >
                Gestionar Períodos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Calendar className="text-blue-600 mr-2" />
                    <span className="text-foreground font-medium">Período Actual</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {periodoActual ? `${(periodoActual as any).ano}-${(periodoActual as any).mes.toString().padStart(2, '0')}` : "2024-12"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {(periodoActual as any)?.nombre || "Diciembre 2024"}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="text-green-600 mr-2" />
                    <span className="text-foreground font-medium">Estado</span>
                  </div>
                  <p className="text-lg font-bold text-secondary">
                    {(periodoActual as any)?.estado?.toUpperCase() || "ABIERTO"}
                  </p>
                  <p className="text-muted-foreground text-sm">Acepta movimientos</p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <FileText className="text-yellow-600 mr-2" />
                    <span className="text-foreground font-medium">Comprobantes</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {(comprobantes as any)?.length || 0}
                  </p>
                  <p className="text-muted-foreground text-sm">Este período</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
