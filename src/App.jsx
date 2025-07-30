import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { 
  Users, TrendingUp, DollarSign, MessageSquare, Database, Settings, 
  Plus, Search, Filter, Download, Upload, RefreshCw, Phone, Mail,
  Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Target,
  BarChart3, PieChart, TrendingDown, CreditCard, Receipt, ArrowRight
} from 'lucide-react'
import './App.css'

// Configuración de Google Sheets
const GOOGLE_SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1kgAlVkdtgofYTYyqKycGwtmnYuiMU-41_geAcKIp8mE'
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

// Configuración del pipeline Kanban
const PIPELINE_STAGES = [
  { id: 'prospeccion', title: 'Prospección', color: 'bg-blue-100 border-blue-300', textColor: 'text-blue-800' },
  { id: 'contacto', title: 'Contacto', color: 'bg-yellow-100 border-yellow-300', textColor: 'text-yellow-800' },
  { id: 'negociacion', title: 'Negociación', color: 'bg-orange-100 border-orange-300', textColor: 'text-orange-800' },
  { id: 'cierre', title: 'Cierre', color: 'bg-green-100 border-green-300', textColor: 'text-green-800' }
]

function App() {
  // Estados principales
  const [activeTab, setActiveTab] = useState('kanban')
  const [leads, setLeads] = useState([])
  const [ventas, setVentas] = useState([])
  const [cobranzas, setCobranzas] = useState([])
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')

  // Estados para formularios
  const [showNewLeadForm, setShowNewLeadForm] = useState(false)
  const [showVentaForm, setShowVentaForm] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVendedor, setFilterVendedor] = useState('all')
  const [filterFuente, setFilterFuente] = useState('all')

  // Formulario nuevo lead
  const [newLead, setNewLead] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fuente: '',
    producto_interes: '',
    valor_estimado: '',
    comentarios: ''
  })

  // Formulario venta
  const [ventaForm, setVentaForm] = useState({
    producto_vendido: '',
    monto_total: '',
    tipo_pago: 'Completo',
    con_comprobante: 'Sí',
    monto_inicial: '',
    plazo_credito: '',
    notas_venta: ''
  })

  // Función para cargar datos desde Google Sheets
  const loadDataFromSheets = useCallback(async () => {
    if (!GOOGLE_SHEETS_API_KEY) {
      setError('API Key no configurada')
      return false
    }

    try {
      setError('')
      setLoading(true)

      // Cargar leads
      const leadsResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/LEADS_MASTER!A2:Q1000?key=${GOOGLE_SHEETS_API_KEY}`
      )
      
      if (!leadsResponse.ok) {
        throw new Error(`Error cargando leads: ${leadsResponse.status}`)
      }
      
      const leadsData = await leadsResponse.json()
      const leadsRows = leadsData.values || []
      
      const formattedLeads = leadsRows
        .filter(row => row[0] && row[2]) // Filtrar filas con ID y nombre
        .map((row, index) => ({
          id: row[0] || `lead_${index}`,
          timestamp: row[1] || '',
          nombre: row[2] || '',
          telefono: row[3] || '',
          email: row[4] || '',
          fuente: row[5] || '',
          estado_lead: row[6] || 'Activo',
          pipeline_etapa: row[7] || 'Prospección',
          producto_interes: row[8] || '',
          valor_estimado: parseFloat(row[9]) || 0,
          vendedor_asignado: row[10] || '',
          comentarios: row[11] || '',
          fecha_ultimo_contacto: row[12] || '',
          proxima_accion: row[13] || '',
          fecha_proxima_accion: row[14] || '',
          created_by: row[15] || '',
          updated_at: row[16] || ''
        }))

      // Cargar ventas
      try {
        const ventasResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/VENTAS!A2:N1000?key=${GOOGLE_SHEETS_API_KEY}`
        )
        
        if (ventasResponse.ok) {
          const ventasData = await ventasResponse.json()
          const ventasRows = ventasData.values || []
          
          const formattedVentas = ventasRows
            .filter(row => row[0] && row[1])
            .map((row, index) => ({
              venta_id: row[0] || `venta_${index}`,
              lead_id: row[1] || '',
              cliente_nombre: row[2] || '',
              producto_vendido: row[3] || '',
              monto_total: parseFloat(row[4]) || 0,
              tipo_pago: row[5] || 'Completo',
              con_comprobante: row[6] || 'Sí',
              monto_inicial: parseFloat(row[7]) || 0,
              saldo_pendiente: parseFloat(row[8]) || 0,
              plazo_credito: parseInt(row[9]) || 0,
              fecha_vencimiento: row[10] || '',
              vendedor: row[11] || '',
              fecha_venta: row[12] || '',
              notas_venta: row[13] || ''
            }))
          
          setVentas(formattedVentas)
        }
      } catch (ventasError) {
        console.warn('No se pudieron cargar las ventas:', ventasError)
      }

      // Cargar cobranzas
      try {
        const cobranzasResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/COBRANZAS!A2:K1000?key=${GOOGLE_SHEETS_API_KEY}`
        )
        
        if (cobranzasResponse.ok) {
          const cobranzasData = await cobranzasResponse.json()
          const cobranzasRows = cobranzasData.values || []
          
          const formattedCobranzas = cobranzasRows
            .filter(row => row[0] && row[1])
            .map((row, index) => ({
              cobranza_id: row[0] || `cobranza_${index}`,
              venta_id: row[1] || '',
              cliente_nombre: row[2] || '',
              monto_original: parseFloat(row[3]) || 0,
              monto_pendiente: parseFloat(row[4]) || 0,
              dias_vencido: parseInt(row[5]) || 0,
              estado_cobranza: row[6] || 'Al día',
              fecha_ultimo_pago: row[7] || '',
              monto_ultimo_pago: parseFloat(row[8]) || 0,
              vendedor_responsable: row[9] || '',
              notas_cobranza: row[10] || ''
            }))
          
          setCobranzas(formattedCobranzas)
        }
      } catch (cobranzasError) {
        console.warn('No se pudieron cargar las cobranzas:', cobranzasError)
      }
      
      setLeads(formattedLeads)
      setConnected(true)
      return true
    } catch (error) {
      console.error('Error cargando datos:', error)
      setError(`Error: ${error.message}`)
      setConnected(false)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para mover leads en el pipeline (sin drag & drop)
  const moveLeadToStage = (leadId, newStage) => {
    // Actualizar estado local
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId 
          ? { ...lead, pipeline_etapa: newStage }
          : lead
      )
    )

    // Si se mueve a "Cierre", abrir formulario de venta
    if (newStage === 'Cierre') {
      const lead = leads.find(l => l.id === leadId)
      if (lead) {
        setSelectedLead(lead)
        setShowVentaForm(true)
      }
    }

    console.log(`Lead ${leadId} movido a ${newStage}`)
  }

  // Función para agregar nuevo lead
  const handleAddLead = async () => {
    if (!newLead.nombre || !newLead.telefono) {
      alert('Nombre y teléfono son obligatorios')
      return
    }

    const lead = {
      id: `lead_${Date.now()}`,
      timestamp: new Date().toISOString(),
      nombre: newLead.nombre,
      telefono: newLead.telefono,
      email: newLead.email,
      fuente: newLead.fuente,
      estado_lead: 'Activo',
      pipeline_etapa: 'Prospección',
      producto_interes: newLead.producto_interes,
      valor_estimado: parseFloat(newLead.valor_estimado) || 0,
      vendedor_asignado: getVendedorByFuente(newLead.fuente),
      comentarios: newLead.comentarios,
      fecha_ultimo_contacto: new Date().toISOString().split('T')[0],
      proxima_accion: 'Contactar por WhatsApp',
      fecha_proxima_accion: '',
      created_by: 'CRM_Web',
      updated_at: new Date().toISOString()
    }

    setLeads([lead, ...leads])
    setNewLead({
      nombre: '',
      telefono: '',
      email: '',
      fuente: '',
      producto_interes: '',
      valor_estimado: '',
      comentarios: ''
    })
    setShowNewLeadForm(false)
    alert('Lead agregado exitosamente!')
  }

  // Función para registrar venta
  const handleRegistrarVenta = async () => {
    if (!selectedLead || !ventaForm.producto_vendido || !ventaForm.monto_total) {
      alert('Complete todos los campos obligatorios')
      return
    }

    const venta = {
      venta_id: `venta_${Date.now()}`,
      lead_id: selectedLead.id,
      cliente_nombre: selectedLead.nombre,
      producto_vendido: ventaForm.producto_vendido,
      monto_total: parseFloat(ventaForm.monto_total),
      tipo_pago: ventaForm.tipo_pago,
      con_comprobante: ventaForm.con_comprobante,
      monto_inicial: parseFloat(ventaForm.monto_inicial) || 0,
      saldo_pendiente: ventaForm.tipo_pago === 'Crédito' 
        ? parseFloat(ventaForm.monto_total) - parseFloat(ventaForm.monto_inicial || 0)
        : 0,
      plazo_credito: parseInt(ventaForm.plazo_credito) || 0,
      fecha_vencimiento: ventaForm.tipo_pago === 'Crédito' 
        ? new Date(Date.now() + parseInt(ventaForm.plazo_credito || 0) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : '',
      vendedor: selectedLead.vendedor_asignado,
      fecha_venta: new Date().toISOString().split('T')[0],
      notas_venta: ventaForm.notas_venta
    }

    setVentas([venta, ...ventas])

    // Si es crédito, crear registro de cobranza
    if (ventaForm.tipo_pago === 'Crédito' && venta.saldo_pendiente > 0) {
      const cobranza = {
        cobranza_id: `cobranza_${Date.now()}`,
        venta_id: venta.venta_id,
        cliente_nombre: selectedLead.nombre,
        monto_original: venta.saldo_pendiente,
        monto_pendiente: venta.saldo_pendiente,
        dias_vencido: 0,
        estado_cobranza: 'Al día',
        fecha_ultimo_pago: '',
        monto_ultimo_pago: 0,
        vendedor_responsable: selectedLead.vendedor_asignado,
        notas_cobranza: 'Crédito generado automáticamente'
      }
      setCobranzas([cobranza, ...cobranzas])
    }

    // Resetear formularios
    setVentaForm({
      producto_vendido: '',
      monto_total: '',
      tipo_pago: 'Completo',
      con_comprobante: 'Sí',
      monto_inicial: '',
      plazo_credito: '',
      notas_venta: ''
    })
    setSelectedLead(null)
    setShowVentaForm(false)
    alert('Venta registrada exitosamente!')
  }

  // Función auxiliar para asignar vendedor por fuente
  const getVendedorByFuente = (fuente) => {
    const asignaciones = {
      'Facebook': 'Gema Rodriguez',
      'TIKTOK': 'Josue Martinez', 
      'Tienda': 'Kevin Lopez',
      'Referido': 'Andre Silva',
      'BOT': 'Gema Rodriguez',
      'WHATSAPP META': 'Josue Martinez'
    }
    return asignaciones[fuente] || 'Sin asignar'
  }

  // Cargar datos al iniciar
  useEffect(() => {
    if (GOOGLE_SHEETS_API_KEY) {
      loadDataFromSheets()
    }
  }, [loadDataFromSheets])

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.telefono.includes(searchTerm) ||
                         (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesVendedor = filterVendedor === 'all' || lead.vendedor_asignado === filterVendedor
    const matchesFuente = filterFuente === 'all' || lead.fuente === filterFuente
    return matchesSearch && matchesVendedor && matchesFuente && lead.estado_lead === 'Activo'
  })

  // Agrupar leads por etapa para Kanban
  const leadsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredLeads.filter(lead => lead.pipeline_etapa === stage.title)
    return acc
  }, {})

  // Calcular métricas
  const totalLeads = leads.filter(l => l.estado_lead === 'Activo').length
  const leadsNuevos = leads.filter(l => l.pipeline_etapa === 'Prospección' && l.estado_lead === 'Activo').length
  const valorPipeline = leads
    .filter(l => l.estado_lead === 'Activo')
    .reduce((sum, lead) => sum + lead.valor_estimado, 0)
  const ventasDelMes = ventas.filter(v => {
    const fechaVenta = new Date(v.fecha_venta)
    const hoy = new Date()
    return fechaVenta.getMonth() === hoy.getMonth() && fechaVenta.getFullYear() === hoy.getFullYear()
  }).length
  const cobranzasPendientes = cobranzas
    .filter(c => c.estado_cobranza !== 'Pagado')
    .reduce((sum, c) => sum + c.monto_pendiente, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">PETULAP CRM</h1>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Sistema Avanzado
              </Badge>
              <Badge 
                variant="outline" 
                className={connected ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
              >
                {connected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={loadDataFromSheets} 
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="kanban">Pipeline Kanban</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="cobranzas">Cobranzas</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          {/* Pipeline Kanban Tab */}
          <TabsContent value="kanban" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Pipeline de Ventas</h2>
              <Dialog open={showNewLeadForm} onOpenChange={setShowNewLeadForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Lead
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Lead</DialogTitle>
                    <DialogDescription>
                      Complete la información del nuevo prospecto
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={newLead.nombre}
                        onChange={(e) => setNewLead({...newLead, nombre: e.target.value})}
                        placeholder="Nombre completo"
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
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLead.email}
                        onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                        placeholder="cliente@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fuente">Fuente *</Label>
                      <Select value={newLead.fuente} onValueChange={(value) => setNewLead({...newLead, fuente: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar fuente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="TIKTOK">TIKTOK</SelectItem>
                          <SelectItem value="Tienda">Tienda</SelectItem>
                          <SelectItem value="Referido">Referido</SelectItem>
                          <SelectItem value="BOT">BOT</SelectItem>
                          <SelectItem value="WHATSAPP META">WHATSAPP META</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="producto">Producto de Interés</Label>
                      <Input
                        id="producto"
                        value={newLead.producto_interes}
                        onChange={(e) => setNewLead({...newLead, producto_interes: e.target.value})}
                        placeholder="Laptop Gaming, PC Oficina, etc."
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
                    <div>
                      <Label htmlFor="comentarios">Comentarios</Label>
                      <Textarea
                        id="comentarios"
                        value={newLead.comentarios}
                        onChange={(e) => setNewLead({...newLead, comentarios: e.target.value})}
                        placeholder="Observaciones iniciales..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleAddLead} className="flex-1">
                        Agregar Lead
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewLeadForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filtros */}
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los vendedores</SelectItem>
                  <SelectItem value="Gema Rodriguez">Gema Rodriguez</SelectItem>
                  <SelectItem value="Josue Martinez">Josue Martinez</SelectItem>
                  <SelectItem value="Kevin Lopez">Kevin Lopez</SelectItem>
                  <SelectItem value="Andre Silva">Andre Silva</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFuente} onValueChange={setFilterFuente}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por fuente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fuentes</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="TIKTOK">TIKTOK</SelectItem>
                  <SelectItem value="Tienda">Tienda</SelectItem>
                  <SelectItem value="Referido">Referido</SelectItem>
                  <SelectItem value="BOT">BOT</SelectItem>
                  <SelectItem value="WHATSAPP META">WHATSAPP META</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Kanban Board (Sin Drag & Drop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PIPELINE_STAGES.map((stage) => (
                <div key={stage.id} className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${stage.color}`}>
                    <h3 className={`font-semibold ${stage.textColor}`}>
                      {stage.title}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm ${stage.textColor}`}>
                        {leadsByStage[stage.id]?.length || 0} leads
                      </span>
                      <span className={`text-sm font-bold ${stage.textColor}`}>
                        S/ {(leadsByStage[stage.id]?.reduce((sum, lead) => sum + lead.valor_estimado, 0) || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="min-h-[400px] space-y-3 p-2 rounded-lg bg-gray-50">
                    {leadsByStage[stage.id]?.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">{lead.nombre}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{lead.telefono}</span>
                          </div>
                          {lead.email && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span>{lead.email}</span>
                            </div>
                          )}
                          <p className="text-sm text-gray-700">{lead.producto_interes}</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-xs">
                              {lead.fuente}
                            </Badge>
                            <span className="font-bold text-green-600">
                              S/ {lead.valor_estimado.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {lead.vendedor_asignado}
                          </div>
                          {lead.comentarios && (
                            <p className="text-xs text-gray-600 italic">
                              {lead.comentarios.substring(0, 50)}...
                            </p>
                          )}
                          
                          {/* Botones para mover entre etapas */}
                          <div className="flex gap-1 mt-3">
                            {PIPELINE_STAGES.map((targetStage) => {
                              if (targetStage.title === lead.pipeline_etapa) return null
                              return (
                                <Button
                                  key={targetStage.id}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => moveLeadToStage(lead.id, targetStage.title)}
                                >
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  {targetStage.title}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Ejecutivo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads Activos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLeads}</div>
                  <p className="text-xs text-muted-foreground">En pipeline activo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nuevos Prospectos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadsNuevos}</div>
                  <p className="text-xs text-muted-foreground">Requieren contacto</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Pipeline</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">S/ {valorPipeline.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Oportunidades totales</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ventasDelMes}</div>
                  <p className="text-xs text-muted-foreground">Cierres exitosos</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución del Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PIPELINE_STAGES.map((stage) => {
                    const count = leadsByStage[stage.id]?.length || 0
                    const percentage = totalLeads > 0 ? (count / totalLeads * 100).toFixed(1) : 0
                    return (
                      <div key={stage.id} className="flex justify-between items-center">
                        <span className="text-sm">{stage.title}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{count} leads</Badge>
                          <span className="text-sm text-gray-500">{percentage}%</span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cobranzas Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-4">
                    S/ {cobranzasPendientes.toLocaleString()}
                  </div>
                  <div className="space-y-2">
                    {cobranzas.filter(c => c.estado_cobranza !== 'Pagado').slice(0, 3).map((cobranza) => (
                      <div key={cobranza.cobranza_id} className="flex justify-between items-center text-sm">
                        <span>{cobranza.cliente_nombre}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">S/ {cobranza.monto_pendiente.toLocaleString()}</span>
                          {cobranza.dias_vencido > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {cobranza.dias_vencido}d vencido
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Otras tabs simplificadas */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Leads</CardTitle>
                <CardDescription>Vista detallada de todos los leads</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Use el Pipeline Kanban para gestión visual de leads
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ventas">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Ventas</CardTitle>
                <CardDescription>Historial de ventas realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ventas.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay ventas registradas. Las ventas se crean automáticamente al mover leads a "Cierre".
                    </p>
                  ) : (
                    ventas.slice(0, 10).map((venta) => (
                      <div key={venta.venta_id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <div className="font-semibold">{venta.cliente_nombre}</div>
                          <div className="text-sm text-gray-600">{venta.producto_vendido}</div>
                          <div className="text-sm text-gray-500">{venta.fecha_venta}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            S/ {venta.monto_total.toLocaleString()}
                          </div>
                          <Badge variant={venta.tipo_pago === 'Completo' ? 'default' : 'secondary'}>
                            {venta.tipo_pago}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cobranzas">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Cobranzas</CardTitle>
                <CardDescription>
                  Total pendiente: S/ {cobranzasPendientes.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cobranzas.filter(c => c.estado_cobranza !== 'Pagado').map((cobranza) => (
                    <div key={cobranza.cobranza_id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{cobranza.cliente_nombre}</div>
                        <div className="text-sm text-gray-600">
                          Vendedor: {cobranza.vendedor_responsable}
                        </div>
                        {cobranza.dias_vencido > 0 && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            {cobranza.dias_vencido} días vencido
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          S/ {cobranza.monto_pendiente.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          de S/ {cobranza.monto_original.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reportes">
            <Card>
              <CardHeader>
                <CardTitle>Reportes y Análisis</CardTitle>
                <CardDescription>Métricas avanzadas del negocio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Reportes avanzados en desarrollo. Próximamente análisis de conversión, performance por vendedor y más.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Formulario de Venta Modal */}
      <Dialog open={showVentaForm} onOpenChange={setShowVentaForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Venta</DialogTitle>
            <DialogDescription>
              Lead: {selectedLead?.nombre} - {selectedLead?.telefono}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="producto_vendido">Producto Vendido *</Label>
              <Input
                id="producto_vendido"
                value={ventaForm.producto_vendido}
                onChange={(e) => setVentaForm({...ventaForm, producto_vendido: e.target.value})}
                placeholder="Laptop Gaming HP Pavilion"
              />
            </div>
            <div>
              <Label htmlFor="monto_total">Monto Total (S/) *</Label>
              <Input
                id="monto_total"
                type="number"
                value={ventaForm.monto_total}
                onChange={(e) => setVentaForm({...ventaForm, monto_total: e.target.value})}
                placeholder="3500"
              />
            </div>
            <div>
              <Label htmlFor="tipo_pago">Tipo de Pago</Label>
              <Select 
                value={ventaForm.tipo_pago} 
                onValueChange={(value) => setVentaForm({...ventaForm, tipo_pago: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completo">Pago Completo</SelectItem>
                  <SelectItem value="Crédito">Pago a Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {ventaForm.tipo_pago === 'Crédito' && (
              <>
                <div>
                  <Label htmlFor="monto_inicial">Pago Inicial (S/)</Label>
                  <Input
                    id="monto_inicial"
                    type="number"
                    value={ventaForm.monto_inicial}
                    onChange={(e) => setVentaForm({...ventaForm, monto_inicial: e.target.value})}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="plazo_credito">Plazo (días)</Label>
                  <Input
                    id="plazo_credito"
                    type="number"
                    value={ventaForm.plazo_credito}
                    onChange={(e) => setVentaForm({...ventaForm, plazo_credito: e.target.value})}
                    placeholder="30"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sin_comprobante"
                checked={ventaForm.con_comprobante === 'No'}
                onCheckedChange={(checked) => 
                  setVentaForm({...ventaForm, con_comprobante: checked ? 'No' : 'Sí'})
                }
              />
              <Label htmlFor="sin_comprobante" className="text-sm">
                Sin comprobante (ahorro IGV)
              </Label>
            </div>
            
            <div>
              <Label htmlFor="notas_venta">Notas de la Venta</Label>
              <Textarea
                id="notas_venta"
                value={ventaForm.notas_venta}
                onChange={(e) => setVentaForm({...ventaForm, notas_venta: e.target.value})}
                placeholder="Observaciones adicionales..."
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleRegistrarVenta} className="flex-1">
                <Receipt className="h-4 w-4 mr-2" />
                Registrar Venta
              </Button>
              <Button variant="outline" onClick={() => setShowVentaForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 PETULAP CRM - Sistema Avanzado de Gestión
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Pipeline: {totalLeads} leads activos</span>
              <span>Valor: S/ {valorPipeline.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

