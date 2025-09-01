import { Sidebar } from "@/components/layout/sidebar";
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

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Módulo de Contabilidad" />
        <main className="flex-1 p-6 overflow-auto">
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
                  {comprobantes?.slice(0, 3).map((comprobante: any, index: number) => (
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
                    {periodoActual ? `${periodoActual.ano}-${periodoActual.mes.toString().padStart(2, '0')}` : "2024-12"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {periodoActual?.nombre || "Diciembre 2024"}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="text-green-600 mr-2" />
                    <span className="text-foreground font-medium">Estado</span>
                  </div>
                  <p className="text-lg font-bold text-secondary">
                    {periodoActual?.estado?.toUpperCase() || "ABIERTO"}
                  </p>
                  <p className="text-muted-foreground text-sm">Acepta movimientos</p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <FileText className="text-yellow-600 mr-2" />
                    <span className="text-foreground font-medium">Comprobantes</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {comprobantes?.length || 0}
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
