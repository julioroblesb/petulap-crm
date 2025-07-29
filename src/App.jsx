import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Users, TrendingUp, DollarSign, MessageSquare, Database, Settings, Plus, Search, Filter, Download, Upload, RefreshCw } from 'lucide-react'
import './App.css'

// Configuración de Google Sheets desde variables de entorno
const GOOGLE_SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1kgAlVkdtgofYTYyqKycGwtmnYuiMU-41_geAcKIp8mE'
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [leads, setLeads] = useState([])
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
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

  // Función para cargar datos desde Google Sheets
  const loadDataFromSheets = async () => {
    if (!GOOGLE_SHEETS_API_KEY) {
      setError('API Key no configurada en variables de entorno')
      return false
    }

    try {
      setError('')
      console.log('Intentando conectar con Google Sheets...')
      console.log('Sheets ID:', GOOGLE_SHEETS_ID)
      console.log('API Key configurada:', !!GOOGLE_SHEETS_API_KEY)

      // Cargar leads desde la hoja LEADS_MASTER (hoja 0)
      const leadsResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/LEADS_MASTER!A2:U1000?key=${GOOGLE_SHEETS_API_KEY}`
      )
      
      console.log('Response status:', leadsResponse.status)
      
      if (!leadsResponse.ok) {
        const errorData = await leadsResponse.json()
        console.error('Error response:', errorData)
        throw new Error(`Error HTTP ${leadsResponse.status}: ${errorData.error?.message || 'Error desconocido'}`)
      }
      
      const leadsData = await leadsResponse.json()
      console.log('Datos recibidos:', leadsData)
      
      const leadsRows = leadsData.values || []
      console.log('Filas de leads:', leadsRows.length)
      
      const formattedLeads = leadsRows
        .filter(row => row[0] && row[2]) // Filtrar filas con ID y nombre
        .map((row, index) => {
          console.log(`Procesando fila ${index}:`, row)
          return {
            id: row[0] || `lead_${index}`,
            timestamp: row[1] || '',
            nombre: row[2] || '',
            telefono: row[3] || '',
            email: row[4] || '',
            fuente: row[5] || '',
            tienda: row[6] || '',
            estado: row[7] || 'Nuevo',
            vendedor_id: row[8] || '',
            vendedor_nombre: row[9] || '',
            producto_interes: row[10] || '',
            valor_estimado: parseFloat(row[11]) || 0,
            probabilidad: parseFloat(row[12]) || 0,
            activo: row[13] === 'VERDADERO' || row[13] === 'TRUE',
            fecha_ultima_interaccion: row[14] || '',
            proxima_accion: row[15] || '',
            fecha_proxima_accion: row[16] || '',
            notas: row[17] || '',
            created_by: row[18] || '',
            updated_by: row[19] || '',
            updated_at: row[20] || ''
          }
        })
      
      console.log('Leads formateados:', formattedLeads)
      
      // Intentar cargar ventas/cobranzas (opcional)
      try {
        const ventasResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/PAGOS!A2:K1000?key=${GOOGLE_SHEETS_API_KEY}`
        )
        
        if (ventasResponse.ok) {
          const ventasData = await ventasResponse.json()
          const ventasRows = ventasData.values || []
          
          const formattedVentas = ventasRows
            .filter(row => row[0] && row[1]) // Filtrar filas con datos
            .map((row, index) => ({
              id: row[0] || `venta_${index}`,
              lead_id: row[1] || '',
              lead_nombre: row[2] || '',
              monto_total: parseFloat(row[3]) || 0,
              monto_adelanto: parseFloat(row[4]) || 0,
              monto_pendiente: parseFloat(row[5]) || 0,
              estado_pago: row[6] || 'Pendiente',
              fecha_venta: row[7] || '',
              fecha_vencimiento: row[8] || '',
              vendedor: row[9] || '',
              notas_pago: row[10] || ''
            }))
          
          setVentas(formattedVentas)
          console.log('Ventas cargadas:', formattedVentas.length)
        }
      } catch (ventasError) {
        console.warn('No se pudieron cargar las ventas:', ventasError)
      }
      
      setLeads(formattedLeads)
      setConnected(true)
      return true
    } catch (error) {
      console.error('Error cargando datos:', error)
      setError(`Error: ${error.message}`)
      setConnected(false)
      return false
    }
  }

  // Función para conectar con Google Sheets
  const connectToGoogleSheets = async () => {
    setLoading(true)
    setError('')
    try {
      const success = await loadDataFromSheets()
      if (success) {
        alert(`¡Conectado exitosamente! Se cargaron ${leads.length} leads desde Google Sheets.`)
      } else {
        alert('Error conectando con Google Sheets. Revisa la consola para más detalles.')
      }
    } catch (error) {
      console.error('Error:', error)
      setError(`Error de conexión: ${error.message}`)
      alert('Error conectando con Google Sheets.')
    } finally {
      setLoading(false)
    }
  }

  // Función para agregar nuevo lead (simulada - en producción escribiría a Sheets)
  const handleAddLead = async () => {
    if (!newLead.nombre || !newLead.telefono) {
      alert('Nombre y teléfono son obligatorios')
      return
    }

    const lead = {
      ...newLead,
      id: `lead_${Date.now()}`,
      timestamp: new Date().toISOString(),
      vendedor_nombre: newLead.tienda === 'EJERCITO' ? 'Gema Rodriguez' : 'Josue Martinez',
      vendedor_id: newLead.tienda === 'EJERCITO' ? 'gema_vendedor_2025' : 'josue_vendedor_2025',
      probabilidad: 10,
      activo: true,
      fecha_ultima_interaccion: new Date().toISOString().split('T')[0],
      proxima_accion: 'Contactar por WhatsApp',
      created_by: 'CRM_Web',
      updated_by: 'CRM_Web',
      updated_at: new Date().toISOString()
    }

    // En producción, aquí harías un POST a Google Sheets API o Apps Script
    setLeads([lead, ...leads])
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
    alert('Lead agregado exitosamente! (En producción se guardará en Google Sheets)')
  }

  // Cargar datos al iniciar la aplicación
  useEffect(() => {
    if (GOOGLE_SHEETS_API_KEY) {
      loadDataFromSheets()
    } else {
      setError('Variables de entorno no configuradas. Configurar VITE_GOOGLE_API_KEY en Vercel.')
    }
  }, [])

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.telefono.includes(searchTerm) ||
                         (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'all' || lead.estado === filterStatus
    return matchesSearch && matchesFilter && lead.activo
  })

  // Calcular métricas
  const totalLeads = leads.filter(l => l.activo).length
  const leadsNuevos = leads.filter(l => l.estado === 'Nuevo' && l.activo).length
  const leadsContactados = leads.filter(l => l.estado === 'Contactado' && l.activo).length
  const leadsInteresados = leads.filter(l => l.estado === 'Interesado' && l.activo).length
  const leadsNegociacion = leads.filter(l => l.estado === 'Negociación' && l.activo).length
  const valorEstimadoTotal = leads
    .filter(l => l.activo)
    .reduce((sum, lead) => sum + (parseFloat(lead.valor_estimado) || 0), 0)
  const cobranzasPendientes = ventas
    .filter(v => v.estado_pago === 'Pendiente')
    .reduce((sum, venta) => sum + venta.monto_pendiente, 0)

  // Distribución por tienda
  const leadsPorTienda = leads.filter(l => l.activo).reduce((acc, lead) => {
    const tienda = lead.tienda || 'Sin asignar'
    acc[tienda] = (acc[tienda] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">PETULAP CRM</h1>
              <Badge 
                variant="outline" 
                className={connected ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
              >
                {connected ? 'Conectado a Google Sheets' : 'Desconectado'}
              </Badge>
              {error && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Error: {error}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={connectToGoogleSheets} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar
                  </>
                )}
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
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="cobranzas">Cobranzas</TabsTrigger>
            <TabsTrigger value="mensajeria">Mensajería</TabsTrigger>
            <TabsTrigger value="repositorio">Repositorio</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLeads}</div>
                  <p className="text-xs text-muted-foreground">Base de datos activa</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads Nuevos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadsNuevos}</div>
                  <p className="text-xs text-muted-foreground">Requieren atención</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">S/ {valorEstimadoTotal.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Pipeline total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">S/ {cobranzasPendientes.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Cobranzas pendientes</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Estado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nuevos</span>
                    <Badge variant="secondary">{leadsNuevos}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Contactados</span>
                    <Badge variant="secondary">{leadsContactados}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Interesados</span>
                    <Badge variant="secondary">{leadsInteresados}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">En Negociación</span>
                    <Badge variant="secondary">{leadsNegociacion}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento por Tienda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(leadsPorTienda).map(([tienda, cantidad]) => (
                    <div key={tienda} className="flex justify-between items-center">
                      <span className="text-sm">{tienda}</span>
                      <Badge variant="outline">{cantidad} leads</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestión de Leads</h2>
              <Button onClick={() => setActiveTab('nuevo-lead')}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Lead
              </Button>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Nuevo">Nuevo</SelectItem>
                  <SelectItem value="Contactado">Contactado</SelectItem>
                  <SelectItem value="Interesado">Interesado</SelectItem>
                  <SelectItem value="Negociación">Negociación</SelectItem>
                  <SelectItem value="Venta">Venta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                            {leads.length === 0 ? 'No hay leads cargados. Haz clic en "Sincronizar" para cargar desde Google Sheets.' : 'No se encontraron leads con los filtros aplicados.'}
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{lead.nombre}</div>
                                <div className="text-sm text-gray-500">{lead.producto_interes}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-900">{lead.telefono}</div>
                              <div className="text-sm text-gray-500">{lead.email}</div>
                            </td>
                            <td className="px-4 py-4">
                              <Badge variant="outline">{lead.fuente}</Badge>
                              <div className="text-xs text-gray-500 mt-1">{lead.tienda}</div>
                            </td>
                            <td className="px-4 py-4">
                              <Badge 
                                variant={
                                  lead.estado === 'Nuevo' ? 'default' :
                                  lead.estado === 'Contactado' ? 'secondary' :
                                  lead.estado === 'Interesado' ? 'outline' :
                                  lead.estado === 'Negociación' ? 'destructive' :
                                  'default'
                                }
                              >
                                {lead.estado}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-900">{lead.vendedor_nombre}</div>
                              <div className="text-xs text-gray-500">{lead.probabilidad}% prob.</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                S/ {lead.valor_estimado.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">Ver</Button>
                                <Button size="sm" variant="outline">Editar</Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cobranzas Tab */}
          <TabsContent value="cobranzas" className="space-y-6">
            <h2 className="text-2xl font-bold">Gestión de Cobranzas</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Cobranzas Pendientes</CardTitle>
                <CardDescription>
                  Total por cobrar: S/ {cobranzasPendientes.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ventas.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No hay datos de cobranzas. Verifica que la hoja "PAGOS" exista en tu Google Sheets.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {ventas.filter(v => v.estado_pago === 'Pendiente').map((venta) => (
                      <div key={venta.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{venta.lead_nombre}</div>
                          <div className="text-sm text-gray-500">
                            Vencimiento: {venta.fecha_vencimiento}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">
                            S/ {venta.monto_pendiente.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            de S/ {venta.monto_total.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mensajería Tab */}
          <TabsContent value="mensajeria" className="space-y-6">
            <h2 className="text-2xl font-bold">Centro de Mensajería Masiva</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Campañas Programadas</CardTitle>
                <CardDescription>
                  Gestiona tus mensajes masivos y evita el baneo con rotación automática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Funcionalidad en desarrollo. Próximamente podrás programar mensajes masivos.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Repositorio Tab */}
          <TabsContent value="repositorio" className="space-y-6">
            <h2 className="text-2xl font-bold">Repositorio de Datos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Google Sheets ID</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {GOOGLE_SHEETS_ID.substring(0, 12)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>API Key</span>
                    <Badge variant={GOOGLE_SHEETS_API_KEY ? 'default' : 'destructive'}>
                      {GOOGLE_SHEETS_API_KEY ? 'Configurada' : 'No configurada'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Estado de conexión</span>
                    <Badge variant={connected ? 'default' : 'destructive'}>
                      {connected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de Datos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total de leads</span>
                    <Badge variant="outline">{leads.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Leads activos</span>
                    <Badge variant="outline">{totalLeads}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cobranzas</span>
                    <Badge variant="outline">{ventas.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
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
              <span>{connected ? 'Conectado' : 'Desconectado'}</span>
              <Badge 
                variant="outline" 
                className={connected ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
              >
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

