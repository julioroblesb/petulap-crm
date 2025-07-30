import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Users, TrendingUp, DollarSign, MessageSquare, Database, Settings, 
  Plus, Search, Filter, Download, Upload, RefreshCw, Phone, Mail,
  Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Target,
  BarChart3, PieChart, TrendingDown, CreditCard, Receipt, ArrowRight,
  ArrowLeft, Edit, Trash2, Eye, FileText, Calculator
} from 'lucide-react'
import './App.css'

// Configuración de Google Sheets
const GOOGLE_SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1kgAlVkdtgofYTYyqKycGwtmnYuiMU-41_geAcKIp8mE'
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

// Configuración del pipeline
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
  const [showEditLeadForm, setShowEditLeadForm] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVendedor, setFilterVendedor] = useState('all')
  const [filterFuente, setFilterFuente] = useState('all')
  const [filterEstado, setFilterEstado] = useState('Activo')

  // Formulario nuevo lead
  const [newLead, setNewLead] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fuente: '',
    tienda: '',
    producto_interes: '',
    valor_estimado: '',
    comentarios: ''
  })

  // Formulario editar lead
  const [editLead, setEditLead] = useState({
    id: '',
    nombre: '',
    telefono: '',
    email: '',
    fuente: '',
    tienda: '',
    estado_lead: '',
    pipeline_etapa: '',
    producto_interes: '',
    valor_estimado: '',
    vendedor_asignado: '',
    comentarios: '',
    proxima_accion: '',
    fecha_proxima_accion: ''
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

      // Cargar leads desde LEADS_MASTER
      const leadsResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/LEADS_MASTER!A2:T1000?key=${GOOGLE_SHEETS_API_KEY}`
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
          tienda: row[6] || '',
          estado_lead: row[7] || 'Activo',
          pipeline_etapa: row[8] || 'Prospección',
          vendedor_id: row[9] || '',
          vendedor_nombre: row[10] || '',
          producto_interes: row[11] || '',
          valor_estimado: parseFloat(row[12]) || 0,
          probabilidad: parseInt(row[13]) || 10,
          comentarios: row[14] || '',
          fecha_ultimo_contacto: row[15] || '',
          proxima_accion: row[16] || '',
          fecha_proxima_accion: row[17] || '',
          created_by: row[18] || '',
          updated_at: row[19] || ''
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
      console.log(`Cargados ${formattedLeads.length} leads exitosamente`)
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

  // Función para mover leads en el pipeline
  const moveLeadToStage = (leadId, newStage) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId 
          ? { 
              ...lead, 
              pipeline_etapa: newStage,
              probabilidad: getProbabilityByStage(newStage),
              updated_at: new Date().toISOString()
            }
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

  // Función para cambiar estado del lead
  const toggleLeadStatus = (leadId) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId 
          ? { 
              ...lead, 
              estado_lead: lead.estado_lead === 'Activo' ? 'Inactivo' : 'Activo',
              updated_at: new Date().toISOString()
            }
          : lead
      )
    )
  }

  // Función para obtener probabilidad por etapa
  const getProbabilityByStage = (stage) => {
    const probabilities = {
      'Prospección': 10,
      'Contacto': 25,
      'Negociación': 50,
      'Cierre': 75
    }
    return probabilities[stage] || 10
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
      tienda: newLead.tienda,
      estado_lead: 'Activo',
      pipeline_etapa: 'Prospección',
      vendedor_id: getVendedorIdByFuente(newLead.fuente),
      vendedor_nombre: getVendedorByFuente(newLead.fuente),
      producto_interes: newLead.producto_interes,
      valor_estimado: parseFloat(newLead.valor_estimado) || 0,
      probabilidad: 10,
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
      tienda: '',
      producto_interes: '',
      valor_estimado: '',
      comentarios: ''
    })
    setShowNewLeadForm(false)
    alert('Lead agregado exitosamente!')
  }

  // Función para editar lead
  const handleEditLead = () => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === editLead.id 
          ? { 
              ...lead,
              ...editLead,
              valor_estimado: parseFloat(editLead.valor_estimado) || 0,
              updated_at: new Date().toISOString()
            }
          : lead
      )
    )
    setShowEditLeadForm(false)
    setEditLead({})
    alert('Lead actualizado exitosamente!')
  }

  // Función para abrir formulario de edición
  const openEditForm = (lead) => {
    setEditLead({
      id: lead.id,
      nombre: lead.nombre,
      telefono: lead.telefono,
      email: lead.email || '',
      fuente: lead.fuente,
      tienda: lead.tienda || '',
      estado_lead: lead.estado_lead,
      pipeline_etapa: lead.pipeline_etapa,
      producto_interes: lead.producto_interes || '',
      valor_estimado: lead.valor_estimado.toString(),
      vendedor_asignado: lead.vendedor_nombre,
      comentarios: lead.comentarios || '',
      proxima_accion: lead.proxima_accion || '',
      fecha_proxima_accion: lead.fecha_proxima_accion || ''
    })
    setShowEditLeadForm(true)
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
      vendedor: selectedLead.vendedor_nombre,
      fecha_venta: new Date().toISOString().split('T')[0],
      notas_venta: ventaForm.notas_venta
    }

    setVentas([venta, ...ventas])

    // Actualizar lead a "vendido"
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === selectedLead.id 
          ? { 
              ...lead, 
              pipeline_etapa: 'Cierre',
              probabilidad: 100,
              estado_lead: 'Vendido',
              updated_at: new Date().toISOString()
            }
          : lead
      )
    )

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
        vendedor_responsable: selectedLead.vendedor_nombre,
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

  // Función auxiliar para asignar ID de vendedor
  const getVendedorIdByFuente = (fuente) => {
    const asignaciones = {
      'Facebook': 'gema_vendedor_2025',
      'TIKTOK': 'josue_vendedor_2025', 
      'Tienda': 'kevin_vendedor_2025',
      'Referido': 'andre_vendedor_2025',
      'BOT': 'gema_vendedor_2025',
      'WHATSAPP META': 'josue_vendedor_2025'
    }
    return asignaciones[fuente] || 'sin_asignar'
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
    const matchesVendedor = filterVendedor === 'all' || lead.vendedor_nombre === filterVendedor
    const matchesFuente = filterFuente === 'all' || lead.fuente === filterFuente
    const matchesEstado = filterEstado === 'all' || lead.estado_lead === filterEstado
    return matchesSearch && matchesVendedor && matchesFuente && matchesEstado
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
                Sistema Profesional
              </Badge>
              <Badge 
                variant="outline" 
                className={connected ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
              >
                {connected ? `Conectado (${leads.length} leads)` : 'Desconectado'}
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

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error de conexión</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="kanban">Pipeline Kanban</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="leads">Gestión Leads</TabsTrigger>
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
            <div className="flex gap-4 items-center flex-wrap">
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Activo">Activos</SelectItem>
                  <SelectItem value="Inactivo">Inactivos</SelectItem>
                  <SelectItem value="Vendido">Vendidos</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Kanban Board */}
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
                  
                  <div className="min-h-[500px] space-y-3 p-2 rounded-lg bg-gray-50">
                    {leadsByStage[stage.id]?.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-900">{lead.nombre}</h4>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditForm(lead)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleLeadStatus(lead.id)}
                              >
                                {lead.estado_lead === 'Activo' ? (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
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
                            <div className="flex space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {lead.fuente}
                              </Badge>
                              {lead.tienda && (
                                <Badge variant="secondary" className="text-xs">
                                  {lead.tienda}
                                </Badge>
                              )}
                            </div>
                            <span className="font-bold text-green-600">
                              S/ {lead.valor_estimado.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {lead.vendedor_nombre}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${lead.probabilidad}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{lead.probabilidad}%</span>
                          </div>
                          
                          {lead.comentarios && (
                            <p className="text-xs text-gray-600 italic">
                              {lead.comentarios.substring(0, 50)}...
                            </p>
                          )}
                          
                          {/* Botones para mover entre etapas */}
                          <div className="flex gap-1 mt-3 flex-wrap">
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

          {/* Gestión Leads Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Gestión Completa de Leads</CardTitle>
                <CardDescription>
                  Vista detallada de todos los leads con opciones de edición
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLeads.slice(0, 20).map((lead) => (
                    <div key={lead.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-semibold">{lead.nombre}</div>
                            <div className="text-sm text-gray-600">{lead.telefono}</div>
                            {lead.email && <div className="text-sm text-gray-500">{lead.email}</div>}
                          </div>
                          <div>
                            <Badge variant="outline">{lead.fuente}</Badge>
                            {lead.tienda && <Badge variant="secondary" className="ml-1">{lead.tienda}</Badge>}
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">{lead.pipeline_etapa}</div>
                            <div className="text-sm text-gray-500">{lead.vendedor_nombre}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            S/ {lead.valor_estimado.toLocaleString()}
                          </div>
                          <Badge variant={lead.estado_lead === 'Activo' ? 'default' : 'secondary'}>
                            {lead.estado_lead}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openEditForm(lead)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleLeadStatus(lead.id)}
                          >
                            {lead.estado_lead === 'Activo' ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ventas Tab */}
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
                          <div className="text-sm text-gray-500">Vendedor: {venta.vendedor}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            S/ {venta.monto_total.toLocaleString()}
                          </div>
                          <div className="flex space-x-2 mt-1">
                            <Badge variant={venta.tipo_pago === 'Completo' ? 'default' : 'secondary'}>
                              {venta.tipo_pago}
                            </Badge>
                            <Badge variant={venta.con_comprobante === 'Sí' ? 'default' : 'destructive'}>
                              {venta.con_comprobante === 'Sí' ? 'Con comprobante' : 'Sin comprobante'}
                            </Badge>
                          </div>
                          {venta.saldo_pendiente > 0 && (
                            <div className="text-sm text-red-600 mt-1">
                              Pendiente: S/ {venta.saldo_pendiente.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cobranzas Tab */}
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
                        {cobranza.notas_cobranza && (
                          <div className="text-sm text-gray-500 mt-1">
                            {cobranza.notas_cobranza}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          S/ {cobranza.monto_pendiente.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          de S/ {cobranza.monto_original.toLocaleString()}
                        </div>
                        <Badge variant={cobranza.estado_cobranza === 'Al día' ? 'default' : 'destructive'} className="mt-1">
                          {cobranza.estado_cobranza}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reportes Tab */}
          <TabsContent value="reportes">
            <Card>
              <CardHeader>
                <CardTitle>Reportes y Análisis</CardTitle>
                <CardDescription>Métricas avanzadas del negocio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Conversión por Fuente</h4>
                    {['Facebook', 'TIKTOK', 'Tienda', 'Referido', 'BOT', 'WHATSAPP META'].map(fuente => {
                      const totalFuente = leads.filter(l => l.fuente === fuente).length
                      const vendidosFuente = leads.filter(l => l.fuente === fuente && l.estado_lead === 'Vendido').length
                      const conversion = totalFuente > 0 ? ((vendidosFuente / totalFuente) * 100).toFixed(1) : 0
                      return (
                        <div key={fuente} className="flex justify-between text-sm">
                          <span>{fuente}</span>
                          <span>{conversion}% ({vendidosFuente}/{totalFuente})</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Performance por Vendedor</h4>
                    {['Gema Rodriguez', 'Josue Martinez', 'Kevin Lopez', 'Andre Silva'].map(vendedor => {
                      const totalVendedor = leads.filter(l => l.vendedor_nombre === vendedor).length
                      const vendidosVendedor = leads.filter(l => l.vendedor_nombre === vendedor && l.estado_lead === 'Vendido').length
                      const valorVendedor = leads.filter(l => l.vendedor_nombre === vendedor && l.estado_lead === 'Vendido')
                        .reduce((sum, lead) => sum + lead.valor_estimado, 0)
                      return (
                        <div key={vendedor} className="text-sm">
                          <div className="flex justify-between">
                            <span>{vendedor}</span>
                            <span>{vendidosVendedor}/{totalVendedor}</span>
                          </div>
                          <div className="text-green-600 font-semibold">
                            S/ {valorVendedor.toLocaleString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Resumen Mensual</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Leads nuevos:</span>
                        <span>{leadsNuevos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ventas cerradas:</span>
                        <span>{ventasDelMes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor vendido:</span>
                        <span className="text-green-600 font-semibold">
                          S/ {ventas.filter(v => {
                            const fechaVenta = new Date(v.fecha_venta)
                            const hoy = new Date()
                            return fechaVenta.getMonth() === hoy.getMonth() && fechaVenta.getFullYear() === hoy.getFullYear()
                          }).reduce((sum, v) => sum + v.monto_total, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Por cobrar:</span>
                        <span className="text-red-600 font-semibold">
                          S/ {cobranzasPendientes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Formulario de Edición de Lead */}
      <Dialog open={showEditLeadForm} onOpenChange={setShowEditLeadForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>
              Actualizar información del lead
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_nombre">Nombre *</Label>
              <Input
                id="edit_nombre"
                value={editLead.nombre}
                onChange={(e) => setEditLead({...editLead, nombre: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_telefono">Teléfono *</Label>
              <Input
                id="edit_telefono"
                value={editLead.telefono}
                onChange={(e) => setEditLead({...editLead, telefono: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={editLead.email}
                onChange={(e) => setEditLead({...editLead, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_pipeline">Etapa del Pipeline</Label>
              <Select value={editLead.pipeline_etapa} onValueChange={(value) => setEditLead({...editLead, pipeline_etapa: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prospección">Prospección</SelectItem>
                  <SelectItem value="Contacto">Contacto</SelectItem>
                  <SelectItem value="Negociación">Negociación</SelectItem>
                  <SelectItem value="Cierre">Cierre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_producto">Producto de Interés</Label>
              <Input
                id="edit_producto"
                value={editLead.producto_interes}
                onChange={(e) => setEditLead({...editLead, producto_interes: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_valor">Valor Estimado (S/)</Label>
              <Input
                id="edit_valor"
                type="number"
                value={editLead.valor_estimado}
                onChange={(e) => setEditLead({...editLead, valor_estimado: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_comentarios">Comentarios</Label>
              <Textarea
                id="edit_comentarios"
                value={editLead.comentarios}
                onChange={(e) => setEditLead({...editLead, comentarios: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit_proxima_accion">Próxima Acción</Label>
              <Input
                id="edit_proxima_accion"
                value={editLead.proxima_accion}
                onChange={(e) => setEditLead({...editLead, proxima_accion: e.target.value})}
                placeholder="Llamar, enviar cotización, etc."
              />
            </div>
            <div>
              <Label htmlFor="edit_fecha_proxima">Fecha Próxima Acción</Label>
              <Input
                id="edit_fecha_proxima"
                type="date"
                value={editLead.fecha_proxima_accion}
                onChange={(e) => setEditLead({...editLead, fecha_proxima_accion: e.target.value})}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleEditLead} className="flex-1">
                Actualizar Lead
              </Button>
              <Button variant="outline" onClick={() => setShowEditLeadForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              © 2025 PETULAP CRM - Sistema Profesional de Gestión
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Pipeline: {totalLeads} leads activos</span>
              <span>Valor: S/ {valorPipeline.toLocaleString()}</span>
              <span>Cobranzas: S/ {cobranzasPendientes.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

