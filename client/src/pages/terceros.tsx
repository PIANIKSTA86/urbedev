import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { TercerosTable } from "@/components/terceros/terceros-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function Terceros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Gestión de Terceros" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Gestión de Terceros</h1>
            <p className="text-muted-foreground">Administra propietarios, inquilinos y proveedores</p>
          </div>
          
          {/* Barra de filtros y búsqueda */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, documento o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search-terceros"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                    <SelectTrigger className="w-48" data-testid="select-tipo-tercero">
                      <SelectValue placeholder="Tipo de Tercero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los tipos</SelectItem>
                      <SelectItem value="propietario">Propietario</SelectItem>
                      <SelectItem value="inquilino">Inquilino</SelectItem>
                      <SelectItem value="proveedor">Proveedor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-add-tercero"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Tercero
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabla de terceros */}
          <TercerosTable searchTerm={searchTerm} tipoFiltro={tipoFiltro} />
        </main>
      </div>
    </div>
  );
}
