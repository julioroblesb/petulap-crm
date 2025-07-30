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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, TrendingUp, DollarSign, MessageSquare, Database, Settings, 
  Plus, Search, Filter, Download, Upload, RefreshCw, Phone, Mail,
  Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Target,
  BarChart3, PieChart, TrendingDown, CreditCard, Receipt, ArrowRight,
  ArrowLeft, Edit, Trash2, Eye, FileText, Calculator, Grid3X3, List,
  ChevronRight, ChevronDown, Star, Activity, Zap, Award, TrendingUpIcon
} from 'lucide-react'
import './App.css'

// Configuración de Google Sheets
const GOOGLE_SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1kgAlVkdtgofYTYyqKycGwtmnYuiMU-41_geAcKIp8mE'
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

// Configuración del pipeline
const PIPELINE_STAGES = [
  { id: 'prospeccion', title: 'Prospección', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', bgColor: 'bg-blue-100' },
  { id: 'contacto', title: 'Contacto', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { id: 'negociacion', title: 'Negociación', color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700', bgColor: 'bg-orange-100' },
  { id: 'cierre', title: 'Cierre', color: 'bg-green-50 border-green-200', textColor: 'text-green-700', bgColor: 'bg-green-100' }
]

function App() {
  // Estados principales
  const [activeTab, setActiveTab] = useState('leads')
  const [viewMode, setViewMode] = useState('table') // 'table' o 'kanban'
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
  const [filterPipeline, setFilterPipeline] = useState('all')

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
    const matchesPipeline = filterPipeline === 'all' || lead.pipeline_etapa === filterPipeline
    return matchesSearch && matchesVendedor && matchesFuente && matchesEstado && matchesPipeline
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

  // Función para obtener color de badge por etapa
  const getStageColor = (stage) => {
    const colors = {
      'Prospección': 'bg-blue-100 text-blue-800 border-blue-200',
      'Contacto': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Negociación': 'bg-orange-100 text-orange-800 border-orange-200',
      'Cierre': 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header mejorado */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    PETULAP CRM
                  </h1>
                  <p className="text-sm text-gray-500">Sistema Profesional de Gestión</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                  <Award className="h-3 w-3 mr-1" />
                  Nivel Empresarial
                </Badge>
                <Badge 
                  variant="outline" 
                  className={connected 
                    ? "bg-green-50 text-green-700 border-green-200 px-3 py-1" 
                    : "bg-red-50 text-red-700 border-red-200 px-3 py-1"
                  }
                >
                  <Activity className="h-3 w-3 mr-1" />
                  {connected ? `Conectado (${leads.length} leads)` : 'Desconectado'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={loadDataFromSheets} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
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

      {/* Error Display mejorado */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm border border-gray-200 rounded-lg p-1">
            <TabsTrigger value="leads" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Gestión Leads
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="ventas" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Target className="h-4 w-4 mr-2" />
              Ventas
            </TabsTrigger>
            <TabsTrigger value="cobranzas" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <CreditCard className="h-4 w-4 mr-2" />
              Cobranzas
            </TabsTrigger>
            <TabsTrigger value="reportes" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              Reportes
            </TabsTrigger>
          </TabsList>

          {/* Gestión Leads Tab - Vista principal mejorada */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Gestión de Leads</h2>
                <p className="text-gray-600 mt-1">Administra y da seguimiento a todos tus prospectos</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="px-3"
                  >
                    <List className="h-4 w-4 mr-1" />
                    Tabla
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className="px-3"
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    Kanban
                  </Button>
                </div>
                <Dialog open={showNewLeadForm} onOpenChange={setShowNewLeadForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
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
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefono">Teléfono *</Label>
                        <Input
                          id="telefono"
                          value={newLead.telefono}
                          onChange={(e) => setNewLead({...newLead, telefono: e.target.value})}
                          placeholder="987654321"
                          className="mt-1"
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
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fuente">Fuente *</Label>
                        <Select value={newLead.fuente} onValueChange={(value) => setNewLead({...newLead, fuente: value})}>
                          <SelectTrigger className="mt-1">
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
                          <SelectTrigger className="mt-1">
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
                          className="mt-1"
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
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="comentarios">Comentarios</Label>
                        <Textarea
                          id="comentarios"
                          value={newLead.comentarios}
                          onChange={(e) => setNewLead({...newLead, comentarios: e.target.value})}
                          placeholder="Observaciones iniciales..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex space-x-2 pt-4">
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
            </div>

            {/* Filtros mejorados */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <Label htmlFor="search" className="text-sm font-medium text-gray-700">Buscar</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Buscar por nombre, teléfono o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Estado</Label>
                    <Select value={filterEstado} onValueChange={setFilterEstado}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Activo">Activos</SelectItem>
                        <SelectItem value="Inactivo">Inactivos</SelectItem>
                        <SelectItem value="Vendido">Vendidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Pipeline</Label>
                    <Select value={filterPipeline} onValueChange={setFilterPipeline}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las etapas</SelectItem>
                        <SelectItem value="Prospección">Prospección</SelectItem>
                        <SelectItem value="Contacto">Contacto</SelectItem>
                        <SelectItem value="Negociación">Negociación</SelectItem>
                        <SelectItem value="Cierre">Cierre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Vendedor</Label>
                    <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Gema Rodriguez">Gema Rodriguez</SelectItem>
                        <SelectItem value="Josue Martinez">Josue Martinez</SelectItem>
                        <SelectItem value="Kevin Lopez">Kevin Lopez</SelectItem>
                        <SelectItem value="Andre Silva">Andre Silva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Fuente</Label>
                    <Select value={filterFuente} onValueChange={setFilterFuente}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="TIKTOK">TIKTOK</SelectItem>
                        <SelectItem value="Tienda">Tienda</SelectItem>
                        <SelectItem value="Referido">Referido</SelectItem>
                        <SelectItem value="BOT">BOT</SelectItem>
                        <SelectItem value="WHATSAPP META">WHATSAPP META</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vista de Tabla (por defecto) */}
            {viewMode === 'table' && (
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Leads Activos</CardTitle>
                      <CardDescription>
                        {filteredLeads.length} leads encontrados
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Fuente</TableHead>
                          <TableHead>Pipeline</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.slice(0, 50).map((lead) => (
                          <TableRow key={lead.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <div className="font-semibold text-gray-900">{lead.nombre}</div>
                                {lead.producto_interes && (
                                  <div className="text-sm text-gray-500">{lead.producto_interes}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                  {lead.telefono}
                                </div>
                                {lead.email && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                    {lead.email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-xs">
                                  {lead.fuente}
                                </Badge>
                                {lead.tienda && (
                                  <Badge variant="secondary" className="text-xs block w-fit">
                                    {lead.tienda}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <Badge variant="outline" className={getStageColor(lead.pipeline_etapa)}>
                                  {lead.pipeline_etapa}
                                </Badge>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                      style={{ width: `${lead.probabilidad}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">{lead.probabilidad}%</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">{lead.vendedor_nombre}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-green-600">
                                S/ {lead.valor_estimado.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={lead.estado_lead === 'Activo' ? 'default' : 'secondary'}
                                className={lead.estado_lead === 'Activo' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {lead.estado_lead}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost" onClick={() => openEditForm(lead)}>
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
                                {PIPELINE_STAGES.map((stage) => {
                                  if (stage.title === lead.pipeline_etapa) return null
                                  return (
                                    <Button
                                      key={stage.id}
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => moveLeadToStage(lead.id, stage.title)}
                                      title={`Mover a ${stage.title}`}
                                    >
                                      <ArrowRight className="h-3 w-3" />
                                    </Button>
                                  )
                                })}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredLeads.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay leads</h3>
                      <p className="text-gray-500">No se encontraron leads con los filtros aplicados.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Vista Kanban */}
            {viewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PIPELINE_STAGES.map((stage) => (
                  <div key={stage.id} className="space-y-4">
                    <Card className={`${stage.color} border-2`}>
                      <CardContent className="p-4">
                        <h3 className={`font-semibold ${stage.textColor} text-lg`}>
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
                      </CardContent>
                    </Card>
                    
                    <div className="min-h-[600px] space-y-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      {leadsByStage[stage.id]?.map((lead) => (
                        <Card
                          key={lead.id}
                          className="bg-white hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-gray-900 text-sm">{lead.nombre}</h4>
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openEditForm(lead)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleLeadStatus(lead.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {lead.estado_lead === 'Activo' ? (
                                      <XCircle className="h-3 w-3 text-red-500" />
                                    ) : (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  <span>{lead.telefono}</span>
                                </div>
                                {lead.email && (
                                  <div className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    <span className="truncate">{lead.email}</span>
                                  </div>
                                )}
                              </div>
                              
                              {lead.producto_interes && (
                                <p className="text-xs text-gray-700 font-medium">{lead.producto_interes}</p>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <div className="flex space-x-1">
                                  <Badge variant="outline" className="text-xs px-2 py-0">
                                    {lead.fuente}
                                  </Badge>
                                  {lead.tienda && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0">
                                      {lead.tienda}
                                    </Badge>
                                  )}
                                </div>
                                <span className="font-bold text-green-600 text-sm">
                                  S/ {lead.valor_estimado.toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                {lead.vendedor_nombre}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                    style={{ width: `${lead.probabilidad}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{lead.probabilidad}%</span>
                              </div>
                              
                              {lead.comentarios && (
                                <p className="text-xs text-gray-600 italic line-clamp-2">
                                  {lead.comentarios}
                                </p>
                              )}
                              
                              {/* Botones para mover entre etapas */}
                              <div className="flex gap-1 flex-wrap">
                                {PIPELINE_STAGES.map((targetStage) => {
                                  if (targetStage.title === lead.pipeline_etapa) return null
                                  return (
                                    <Button
                                      key={targetStage.id}
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-6 px-2"
                                      onClick={() => moveLeadToStage(lead.id, targetStage.title)}
                                    >
                                      <ArrowRight className="h-2 w-2 mr-1" />
                                      {targetStage.title}
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {leadsByStage[stage.id]?.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-sm">No hay leads en esta etapa</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Dashboard Ejecutivo</h2>
              <p className="text-gray-600 mt-1">Métricas y análisis en tiempo real</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads Activos</CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLeads}</div>
                  <p className="text-xs opacity-80">En pipeline activo</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nuevos Prospectos</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadsNuevos}</div>
                  <p className="text-xs opacity-80">Requieren contacto</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Pipeline</CardTitle>
                  <DollarSign className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">S/ {valorPipeline.toLocaleString()}</div>
                  <p className="text-xs opacity-80">Oportunidades totales</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
                  <Target className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ventasDelMes}</div>
                  <p className="text-xs opacity-80">Cierres exitosos</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución del Pipeline</CardTitle>
                  <CardDescription>Leads por etapa del proceso de ventas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PIPELINE_STAGES.map((stage) => {
                    const count = leadsByStage[stage.id]?.length || 0
                    const percentage = totalLeads > 0 ? (count / totalLeads * 100).toFixed(1) : 0
                    const valor = leadsByStage[stage.id]?.reduce((sum, lead) => sum + lead.valor_estimado, 0) || 0
                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{stage.title}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{count} leads</Badge>
                            <span className="text-sm text-gray-500">{percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${stage.bgColor}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-green-600 font-semibold">
                          S/ {valor.toLocaleString()}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cobranzas Pendientes</CardTitle>
                  <CardDescription>Seguimiento de pagos pendientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-4">
                    S/ {cobranzasPendientes.toLocaleString()}
                  </div>
                  <div className="space-y-3">
                    {cobranzas.filter(c => c.estado_cobranza !== 'Pagado').slice(0, 5).map((cobranza) => (
                      <div key={cobranza.cobranza_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{cobranza.cliente_nombre}</div>
                          <div className="text-xs text-gray-500">{cobranza.vendedor_responsable}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-red-600">S/ {cobranza.monto_pendiente.toLocaleString()}</div>
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
                    <div className="text-center py-12">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ventas registradas</h3>
                      <p className="text-gray-500">Las ventas se crean automáticamente al mover leads a "Cierre".</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {ventas.slice(0, 20).map((venta) => (
                        <Card key={venta.venta_id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="font-semibold text-lg">{venta.cliente_nombre}</div>
                                <div className="text-gray-600">{venta.producto_vendido}</div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {venta.fecha_venta}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    {venta.vendedor}
                                  </div>
                                </div>
                                {venta.notas_venta && (
                                  <div className="text-sm text-gray-600 italic">
                                    {venta.notas_venta}
                                  </div>
                                )}
                              </div>
                              <div className="text-right space-y-2">
                                <div className="text-2xl font-bold text-green-600">
                                  S/ {venta.monto_total.toLocaleString()}
                                </div>
                                <div className="flex space-x-2">
                                  <Badge variant={venta.tipo_pago === 'Completo' ? 'default' : 'secondary'}>
                                    {venta.tipo_pago}
                                  </Badge>
                                  <Badge variant={venta.con_comprobante === 'Sí' ? 'default' : 'destructive'}>
                                    {venta.con_comprobante === 'Sí' ? 'Con comprobante' : 'Sin comprobante'}
                                  </Badge>
                                </div>
                                {venta.saldo_pendiente > 0 && (
                                  <div className="text-sm text-red-600 font-medium">
                                    Pendiente: S/ {venta.saldo_pendiente.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
                  {cobranzas.filter(c => c.estado_cobranza !== 'Pagado').length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">¡Excelente!</h3>
                      <p className="text-gray-500">No hay cobranzas pendientes.</p>
                    </div>
                  ) : (
                    cobranzas.filter(c => c.estado_cobranza !== 'Pagado').map((cobranza) => (
                      <Card key={cobranza.cobranza_id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="font-semibold text-lg">{cobranza.cliente_nombre}</div>
                              <div className="text-sm text-gray-600">
                                Vendedor: {cobranza.vendedor_responsable}
                              </div>
                              {cobranza.dias_vencido > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {cobranza.dias_vencido} días vencido
                                </Badge>
                              )}
                              {cobranza.notas_cobranza && (
                                <div className="text-sm text-gray-500">
                                  {cobranza.notas_cobranza}
                                </div>
                              )}
                            </div>
                            <div className="text-right space-y-2">
                              <div className="text-2xl font-bold text-red-600">
                                S/ {cobranza.monto_pendiente.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                de S/ {cobranza.monto_original.toLocaleString()}
                              </div>
                              <Badge variant={cobranza.estado_cobranza === 'Al día' ? 'default' : 'destructive'}>
                                {cobranza.estado_cobranza}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reportes Tab */}
          <TabsContent value="reportes">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h2>
                <p className="text-gray-600 mt-1">Métricas avanzadas del negocio</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Conversión por Fuente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {['Facebook', 'TIKTOK', 'Tienda', 'Referido', 'BOT', 'WHATSAPP META'].map(fuente => {
                      const totalFuente = leads.filter(l => l.fuente === fuente).length
                      const vendidosFuente = leads.filter(l => l.fuente === fuente && l.estado_lead === 'Vendido').length
                      const conversion = totalFuente > 0 ? ((vendidosFuente / totalFuente) * 100).toFixed(1) : 0
                      return (
                        <div key={fuente} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{fuente}</span>
                            <span>{conversion}% ({vendidosFuente}/{totalFuente})</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${conversion}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance por Vendedor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['Gema Rodriguez', 'Josue Martinez', 'Kevin Lopez', 'Andre Silva'].map(vendedor => {
                      const totalVendedor = leads.filter(l => l.vendedor_nombre === vendedor).length
                      const vendidosVendedor = leads.filter(l => l.vendedor_nombre === vendedor && l.estado_lead === 'Vendido').length
                      const valorVendedor = leads.filter(l => l.vendedor_nombre === vendedor && l.estado_lead === 'Vendido')
                        .reduce((sum, lead) => sum + lead.valor_estimado, 0)
                      const conversion = totalVendedor > 0 ? ((vendidosVendedor / totalVendedor) * 100).toFixed(1) : 0
                      return (
                        <div key={vendedor} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{vendedor}</span>
                            <span className="text-sm">{vendidosVendedor}/{totalVendedor}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${conversion}%` }}
                            ></div>
                          </div>
                          <div className="text-green-600 font-semibold text-sm">
                            S/ {valorVendedor.toLocaleString()}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen Mensual</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">Leads nuevos:</span>
                        <span className="font-bold text-blue-600">{leadsNuevos}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">Ventas cerradas:</span>
                        <span className="font-bold text-green-600">{ventasDelMes}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium">Valor vendido:</span>
                        <span className="font-bold text-purple-600">
                          S/ {ventas.filter(v => {
                            const fechaVenta = new Date(v.fecha_venta)
                            const hoy = new Date()
                            return fechaVenta.getMonth() === hoy.getMonth() && fechaVenta.getFullYear() === hoy.getFullYear()
                          }).reduce((sum, v) => sum + v.monto_total, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium">Por cobrar:</span>
                        <span className="font-bold text-red-600">
                          S/ {cobranzasPendientes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit_telefono">Teléfono *</Label>
              <Input
                id="edit_telefono"
                value={editLead.telefono}
                onChange={(e) => setEditLead({...editLead, telefono: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={editLead.email}
                onChange={(e) => setEditLead({...editLead, email: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit_pipeline">Etapa del Pipeline</Label>
              <Select value={editLead.pipeline_etapa} onValueChange={(value) => setEditLead({...editLead, pipeline_etapa: value})}>
                <SelectTrigger className="mt-1">
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
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit_valor">Valor Estimado (S/)</Label>
              <Input
                id="edit_valor"
                type="number"
                value={editLead.valor_estimado}
                onChange={(e) => setEditLead({...editLead, valor_estimado: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit_comentarios">Comentarios</Label>
              <Textarea
                id="edit_comentarios"
                value={editLead.comentarios}
                onChange={(e) => setEditLead({...editLead, comentarios: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit_proxima_accion">Próxima Acción</Label>
              <Input
                id="edit_proxima_accion"
                value={editLead.proxima_accion}
                onChange={(e) => setEditLead({...editLead, proxima_accion: e.target.value})}
                placeholder="Llamar, enviar cotización, etc."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit_fecha_proxima">Fecha Próxima Acción</Label>
              <Input
                id="edit_fecha_proxima"
                type="date"
                value={editLead.fecha_proxima_accion}
                onChange={(e) => setEditLead({...editLead, fecha_proxima_accion: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="flex space-x-2 pt-4">
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
                className="mt-1"
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
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tipo_pago">Tipo de Pago</Label>
              <Select 
                value={ventaForm.tipo_pago} 
                onValueChange={(value) => setVentaForm({...ventaForm, tipo_pago: value})}
              >
                <SelectTrigger className="mt-1">
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
                    className="mt-1"
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
                    className="mt-1"
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
                className="mt-1"
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
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

      {/* Footer mejorado */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm text-gray-600">
                © 2025 PETULAP CRM - Sistema Profesional de Gestión
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{totalLeads} leads activos</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>S/ {valorPipeline.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="h-4 w-4" />
                <span>S/ {cobranzasPendientes.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

