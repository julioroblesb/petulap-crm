import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Users, TrendingUp, DollarSign, MessageSquare, Database, Settings, Plus, Search, Filter, Download, Upload } from 'lucide-react'
import './App.css'

// Configuración de Google Sheets
const GOOGLE_SHEETS_ID = '1kgAlVkdtgofYTYyqKycGwtmnYuiMU-41_geAcKIp8mE'
const GOOGLE_SHEETS_API_KEY = 'TU_API_KEY_AQUI' // Julio necesitará configurar esto

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [newLead, setNewLead] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fuente: '',
    tienda: '',
    estado: 'Nuevo',
    producto_interes: '',
    valor_estimado: '',
    notas: ''
  })

  // Datos de ejemplo para demostración
  const sampleLeads = [
    {
      id: 'lead_001',
      nombre: 'Juan Pérez',
      telefono: '987654321',
      email: 'juan@email.com',
      fuente: 'TikTok',
      tienda: 'EJERCITO',
      estado: 'Nuevo',
      vendedor_nombre: 'Gema Rodriguez',
      producto_interes: 'Laptop Gaming',
      valor_estimado: 3500,
      probabilidad: 10,
      fecha_ultima_interaccion: '2025-01-29',
      proxima_accion: 'Contactar por WhatsApp',
      notas: 'Lead interesado en gaming'
    },
    {
      id: 'lead_002',
      nombre: 'María García',
      telefono: '987654322',
      email: 'maria@email.com',
      fuente: 'Facebook',
      tienda: 'LEON',
      estado: 'Contactado',
      vendedor_nombre: 'Josue Martinez',
      producto_interes: 'Laptop Oficina',
      valor_estimado: 2800,
      probabilidad: 25,
      fecha_ultima_interaccion: '2025-01-28',
      proxima_accion: 'Enviar cotización',
      notas: 'Necesita laptop para trabajo remoto'
    },
    {
      id: 'lead_003',
      nombre: 'Carlos López',
      telefono: '987654323',
      email: 'carlos@email.com',
      fuente: 'Tienda',
      tienda: 'EJERCITO',
      estado: 'Interesado',
      vendedor_nombre: 'Kevin Salazar',
      producto_interes: 'Laptop Gaming',
      valor_estimado: 4200,
      probabilidad: 50,
      fecha_ultima_interaccion: '2025-01-27',
      proxima_accion: 'Demostración en tienda',
      notas: 'Visitó tienda, muy interesado'
    }
  ]

  const sampleVentas = [
    {
      id: 'venta_001',
      lead_nombre: 'Ana Rodríguez',
      monto_total: 3500,
      monto_adelanto: 1000,
      monto_pendiente: 2500,
      estado_pago: 'Pendiente',
      fecha_vencimiento: '2025-02-28',
      vendedor: 'Gema Rodriguez'
    },
    {
      id: 'venta_002',
      lead_nombre: 'Pedro Martínez',
      monto_total: 2800,
      monto_adelanto: 2800,
      monto_pendiente: 0,
      estado_pago: 'Pagado',
      fecha_vencimiento: '2025-02-15',
      vendedor: 'Josue Martinez'
    }
  ]

  useEffect(() => {
    // Cargar datos de ejemplo al iniciar
    setLeads(sampleLeads)
  }, [])

  // Función para conectar con Google Sheets (simulada)
  const connectToGoogleSheets = async () => {
    setLoading(true)
    try {
      // Aquí iría la conexión real con Google Sheets API
      console.log('Conectando con Google Sheets:', GOOGLE_SHEETS_ID)
      
      // Simulación de carga de datos
      setTimeout(() => {
        setLeads(sampleLeads)
        setLoading(false)
        alert('¡Conectado exitosamente con Google Sheets!')
      }, 2000)
    } catch (error) {
      console.error('Error conectando con Google Sheets:', error)
      setLoading(false)
      alert('Error conectando con Google Sheets. Verifica la configuración.')
    }
  }

  // Función para agregar nuevo lead
  const handleAddLead = () => {
    if (!newLead.nombre || !newLead.telefono) {
      alert('Nombre y teléfono son obligatorios')
      return
    }

    const lead = {
      ...newLead,
      id: `lead_${Date.now()}`,
      vendedor_nombre: newLead.tienda === 'EJERCITO' ? 'Gema Rodriguez' : 'Josue Martinez',
      probabilidad: 10,
      fecha_ultima_interaccion: new Date().toISOString().split('T')[0],
      proxima_accion: 'Contactar por WhatsApp'
    }

    setLeads([...leads, lead])
    setNewLead({
      nombre: '',
      telefono: '',
      email: '',
      fuente: '',
      tienda: '',
      estado: 'Nuevo',
      producto_interes: '',
      valor_estimado: '',
      notas: ''
    })
    alert('Lead agregado exitosamente!')
  }

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.telefono.includes(searchTerm) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || lead.estado === filterStatus
    return matchesSearch && matchesFilter
  })

  // Calcular métricas
  const totalLeads = leads.length
  const leadsNuevos = leads.filter(l => l.estado === 'Nuevo').length
  const leadsInteresados = leads.filter(l => l.estado === 'Interesado').length
  const valorEstimadoTotal = leads.reduce((sum, lead) => sum + (parseFloat(lead.valor_estimado) || 0), 0)
  const cobranzasPendientes = sampleVentas.reduce((sum, venta) => sum + venta.monto_pendiente, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">PETULAP CRM</h1>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Conectado a Google Sheets
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={connectToGoogleSheets} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
              <Button onClick={() => setActiveTab('settings')} variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Leads</span>
            </TabsTrigger>
            <TabsTrigger value="cobranzas" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Cobranzas</span>
            </TabsTrigger>
            <TabsTrigger value="mensajeria" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Mensajería</span>
            </TabsTrigger>
            <TabsTrigger value="repositorio" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Repositorio</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Base de datos activa</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads Nuevos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{leadsNuevos}</div>
                  <p className="text-xs text-muted-foreground">Requieren atención</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    S/ {valorEstimadoTotal.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Pipeline total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    S/ {cobranzasPendientes.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Cobranzas pendientes</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nuevos</span>
                      <Badge variant="secondary">{leadsNuevos}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Contactados</span>
                      <Badge variant="secondary">{leads.filter(l => l.estado === 'Contactado').length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Interesados</span>
                      <Badge variant="secondary">{leadsInteresados}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">En Negociación</span>
                      <Badge variant="secondary">{leads.filter(l => l.estado === 'Negociación').length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento por Tienda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">EJERCITO</span>
                      <Badge variant="outline">{leads.filter(l => l.tienda === 'EJERCITO').length} leads</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">LEON</span>
                      <Badge variant="outline">{leads.filter(l => l.tienda === 'LEON').length} leads</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gestión de Leads */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-2xl font-bold">Gestión de Leads</h2>
              <div className="flex space-x-2">
                <Button onClick={() => setActiveTab('nuevo-lead')} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Nuevo Lead</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Buscar por nombre, teléfono o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <Label htmlFor="filter">Filtrar por Estado</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Nuevo">Nuevo</SelectItem>
                        <SelectItem value="Contactado">Contactado</SelectItem>
                        <SelectItem value="Interesado">Interesado</SelectItem>
                        <SelectItem value="Negociación">Negociación</SelectItem>
                        <SelectItem value="Venta">Venta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Leads */}
            <div className="grid gap-4">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold text-lg">{lead.nombre}</h3>
                          <Badge 
                            variant={lead.estado === 'Nuevo' ? 'default' : 
                                   lead.estado === 'Interesado' ? 'secondary' : 'outline'}
                          >
                            {lead.estado}
                          </Badge>
                          <Badge variant="outline">{lead.tienda}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <span>📱 {lead.telefono}</span>
                          <span>📧 {lead.email}</span>
                          <span>📍 {lead.fuente}</span>
                          <span>👤 {lead.vendedor_nombre}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Producto:</span> {lead.producto_interes} | 
                          <span className="font-medium"> Valor:</span> S/ {lead.valor_estimado} | 
                          <span className="font-medium"> Probabilidad:</span> {lead.probabilidad}%
                        </div>
                        {lead.notas && (
                          <p className="text-sm text-muted-foreground italic">{lead.notas}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Editar</Button>
                        <Button variant="outline" size="sm">Contactar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredLeads.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No se encontraron leads con los filtros aplicados.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cobranzas */}
          <TabsContent value="cobranzas" className="space-y-6">
            <h2 className="text-2xl font-bold">Gestión de Cobranzas</h2>
            
            <div className="grid gap-4">
              {sampleVentas.map((venta) => (
                <Card key={venta.id} className={venta.estado_pago === 'Pendiente' ? 'border-orange-200 bg-orange-50' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold text-lg">{venta.lead_nombre}</h3>
                          <Badge 
                            variant={venta.estado_pago === 'Pendiente' ? 'destructive' : 'default'}
                          >
                            {venta.estado_pago}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <span><strong>Total:</strong> S/ {venta.monto_total.toLocaleString()}</span>
                          <span><strong>Adelanto:</strong> S/ {venta.monto_adelanto.toLocaleString()}</span>
                          <span><strong>Pendiente:</strong> S/ {venta.monto_pendiente.toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span><strong>Vendedor:</strong> {venta.vendedor} | </span>
                          <span><strong>Vencimiento:</strong> {venta.fecha_vencimiento}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {venta.estado_pago === 'Pendiente' && (
                          <>
                            <Button variant="outline" size="sm">Registrar Pago</Button>
                            <Button variant="outline" size="sm">Contactar</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Mensajería */}
          <TabsContent value="mensajeria" className="space-y-6">
            <h2 className="text-2xl font-bold">Centro de Mensajería</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campañas Programadas</CardTitle>
                  <CardDescription>Mensajes masivos por WhatsApp</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Promoción Gaming Enero</h4>
                        <p className="text-sm text-muted-foreground">AREQUIPA | 500 leads objetivo</p>
                      </div>
                      <Badge variant="outline">Programada</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Ofertas León</h4>
                        <p className="text-sm text-muted-foreground">LEON | 300 leads objetivo</p>
                      </div>
                      <Badge variant="secondary">Enviada</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plantillas de Mensajes</CardTitle>
                  <CardDescription>Rotación anti-baneo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">Plantilla Gaming A</h4>
                      <p className="text-sm text-muted-foreground">🎮 ¡Laptops gaming con descuento especial!</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">Plantilla Gaming B</h4>
                      <p className="text-sm text-muted-foreground">💻 Las mejores laptops para gamers están aquí</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Repositorio */}
          <TabsContent value="repositorio" className="space-y-6">
            <h2 className="text-2xl font-bold">Repositorio de Datos</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credenciales de Redes Sociales</CardTitle>
                  <CardDescription>Accesos seguros encriptados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Facebook Marketplace</h4>
                        <p className="text-sm text-muted-foreground">petulap.oficial@gmail.com</p>
                      </div>
                      <Button variant="outline" size="sm">Ver</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">TikTok Business</h4>
                        <p className="text-sm text-muted-foreground">petulap.tiktok@gmail.com</p>
                      </div>
                      <Button variant="outline" size="sm">Ver</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Catálogo de Productos</CardTitle>
                  <CardDescription>Para diseñador y vendedores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">ASUS ROG Strix G15</h4>
                        <p className="text-sm text-muted-foreground">S/ 4,500 | Stock: 5</p>
                      </div>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">HP Pavilion Gaming</h4>
                        <p className="text-sm text-muted-foreground">S/ 3,200 | Stock: 8</p>
                      </div>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Nuevo Lead (Modal simulado) */}
          <TabsContent value="nuevo-lead" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Agregar Nuevo Lead</h2>
              <Button variant="outline" onClick={() => setActiveTab('leads')}>
                Volver a Leads
              </Button>
            </div>

            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Información del Lead</CardTitle>
                <CardDescription>Completa los datos del nuevo prospecto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      value={newLead.nombre}
                      onChange={(e) => setNewLead({...newLead, nombre: e.target.value})}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      value={newLead.telefono}
                      onChange={(e) => setNewLead({...newLead, telefono: e.target.value})}
                      placeholder="987654321"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    placeholder="juan@email.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fuente">Fuente</Label>
                    <Select value={newLead.fuente} onValueChange={(value) => setNewLead({...newLead, fuente: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TikTok">TikTok</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Tienda">Tienda</SelectItem>
                        <SelectItem value="Referido">Referido</SelectItem>
                        <SelectItem value="Bot">Bot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tienda">Tienda</Label>
                    <Select value={newLead.tienda} onValueChange={(value) => setNewLead({...newLead, tienda: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tienda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EJERCITO">EJERCITO</SelectItem>
                        <SelectItem value="LEON">LEON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="producto">Producto de Interés</Label>
                    <Input
                      id="producto"
                      value={newLead.producto_interes}
                      onChange={(e) => setNewLead({...newLead, producto_interes: e.target.value})}
                      placeholder="Laptop Gaming"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor Estimado (S/)</Label>
                    <Input
                      id="valor"
                      type="number"
                      value={newLead.valor_estimado}
                      onChange={(e) => setNewLead({...newLead, valor_estimado: e.target.value})}
                      placeholder="3500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notas">Notas</Label>
                  <Input
                    id="notas"
                    value={newLead.notas}
                    onChange={(e) => setNewLead({...newLead, notas: e.target.value})}
                    placeholder="Información adicional del lead..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button onClick={handleAddLead} className="flex-1">
                    Agregar Lead
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('leads')}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 PETULAP CRM - Sistema de Gestión de Leads
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Conectado a Google Sheets</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ID: {GOOGLE_SHEETS_ID.substring(0, 8)}...
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

