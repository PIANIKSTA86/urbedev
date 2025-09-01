import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Folder } from "lucide-react";
import { useState } from "react";

interface PlanCuenta {
  id: string;
  codigo: string;
  nombre: string;
  clase: string;
  nombreClase: string;
  nivel: number;
  esDebito: boolean;
  activa: boolean;
}

export function PlanCuentas() {
  const [expandedClases, setExpandedClases] = useState<Set<string>>(new Set());

  const { data: cuentas, isLoading, error } = useQuery({
    queryKey: ["/api/contabilidad/plan-cuentas"],
  });

  const toggleClase = (clase: string) => {
    const newExpanded = new Set(expandedClases);
    if (newExpanded.has(clase)) {
      newExpanded.delete(clase);
    } else {
      newExpanded.add(clase);
    }
    setExpandedClases(newExpanded);
  };

  // Agrupar cuentas por clase
  const cuentasPorClase = (cuentas || []).reduce((acc: Record<string, PlanCuenta[]>, cuenta: PlanCuenta) => {
    if (!acc[cuenta.clase]) {
      acc[cuenta.clase] = [];
    }
    acc[cuenta.clase].push(cuenta);
    return acc;
  }, {});

  // Obtener clases principales (nivel 1)
  const clasesPrincipales = Object.keys(cuentasPorClase).map(clase => {
    const primeracuenta = cuentasPorClase[clase].find(c => c.nivel === 1);
    return {
      codigo: clase,
      nombre: primeracuenta?.nombreClase || `Clase ${clase}`,
      subcuentas: cuentasPorClase[clase].filter(c => c.nivel === 1).length
    };
  }).sort((a, b) => a.codigo.localeCompare(b.codigo));

  const getClaseColor = (clase: string) => {
    switch (clase) {
      case '1': return 'text-blue-600';
      case '2': return 'text-red-600';
      case '3': return 'text-green-600';
      case '4': return 'text-purple-600';
      case '5': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan Único de Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan Único de Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">
            <p>Error al cargar el plan de cuentas</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Único de Cuentas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clasesPrincipales.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay cuentas configuradas</p>
              <p className="text-sm mt-2">Configure el plan de cuentas para comenzar</p>
            </div>
          ) : (
            clasesPrincipales.map((clase) => (
              <div key={clase.codigo}>
                <div 
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => toggleClase(clase.codigo)}
                  data-testid={`plan-cuenta-clase-${clase.codigo}`}
                >
                  <div className="flex items-center">
                    <Folder className={`mr-3 ${getClaseColor(clase.codigo)}`} />
                    <div>
                      <p className="text-foreground font-medium">
                        {clase.codigo}. {clase.nombre}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {clase.subcuentas} subcuentas
                      </p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      expandedClases.has(clase.codigo) ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Mostrar subcuentas cuando está expandida */}
                {expandedClases.has(clase.codigo) && (
                  <div className="ml-6 mt-2 space-y-2">
                    {cuentasPorClase[clase.codigo]
                      .filter(cuenta => cuenta.nivel === 1)
                      .slice(0, 5) // Mostrar solo las primeras 5
                      .map((cuenta) => (
                        <div 
                          key={cuenta.id}
                          className="flex items-center justify-between p-2 border border-border rounded bg-muted/30"
                          data-testid={`plan-cuenta-${cuenta.codigo}`}
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full mr-3"></div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {cuenta.codigo} - {cuenta.nombre}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {cuenta.esDebito ? 'Débito' : 'Crédito'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {cuentasPorClase[clase.codigo].filter(c => c.nivel === 1).length > 5 && (
                      <div className="text-center">
                        <button className="text-xs text-primary hover:text-primary/80">
                          Ver {cuentasPorClase[clase.codigo].filter(c => c.nivel === 1).length - 5} más...
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <Button 
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-manage-plan-cuentas"
        >
          Gestionar PUC
        </Button>
      </CardContent>
    </Card>
  );
}
