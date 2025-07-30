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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Users, TrendingUp, DollarSign, MessageSquare, Database, Settings, 
  Plus, Search, Filter, Download, Upload, RefreshCw, Phone, Mail,
  Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle, XCircle, Target,
  BarChart3, PieChart, TrendingDown, CreditCard, Receipt, ArrowRight,
  ArrowLeft, Edit, Trash2, Eye, FileText, Calculator, Grid3X3, List,
  ChevronRight, ChevronDown, Star, Activity, Zap, Award, TrendingUpIcon,
  LogOut, User, Shield, Bell, CalendarDays, ChevronLeft, Save, UserPlus,
  AlertCircle, Home, Briefcase, PlusCircle, FileSpreadsheet, MoreHorizontal
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

// Vendedores disponibles
const VENDEDORES = [
  'Diego', 'Gema', 'Andre', 'Josue', 'Alejandro', 'Kevin', 'Jefry', 'Adrian'
]

// Fuentes disponibles
const FUENTES = [
  'Facebook', 'TIKTOK', 'Tienda', 'Referido', 'BOT', 'WHATSAPP META'
]

function App() {
  // Estados de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ usuario: '', contraseña: '' })
  const [loginError, setLoginError] = useState('')

  // Estados principales
  const [activeTab, setActiveTab] = useState('leads')
  const [viewMode, setViewMode] = useState('table')
  const [leads, setLeads] = useState([])
  const [ventas, setVentas] = useState([])
  const [cobranzas, setCobranzas] = useState([])
  const [credenciales, setCredenciales] = useState([])
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [leadsPerPage] = useState(50)
  const [totalPages, setTotalPages] = useState(1)

  // Estados para formularios
  const [showNewLeadForm, setShowNewLeadForm] = useState(false)
  const [showVentaForm, setShowVentaForm] = useState(false)
  const [showEditLeadForm, setShowEditLeadForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVendedor, setFilterVendedor] = useState('all')
  const [filterFuente, setFilterFuente] = useState('all')
  const [filterEstado, setFilterEstado] = useState('Activo')
  const [filterPipeline, setFilterPipeline] = useState('all')

  // Estados para calendario y tareas
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])

  // Formulario nuevo lead
  const [newLead, setNewLead] = useState({
    nombre: '',
    telefono: '',
    fuente: '',
    producto_interes: '',
    email: '',
    comentarios: ''
  })

  // Formulario editar lead
  const [editLead, setEditLead] = useState({
    id: '',
    nombre: '',
    telefono: '',
    fuente: '',
    producto_interes: '',
    email: '',
    estado: '',
    pipeline: '',
    vendedor: '',
    comentarios: '',
    fecha_ultimo_contacto: '',
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

  // Formulario tarea
  const [taskForm, setTaskForm] = useState({
    lead_id: '',
    accion: '',
    fecha: '',
    hora: '',
    notas: ''
  })

  // Función para autenticar usuario
  const authenticateUser = useCallback(async () => {
    if (!GOOGLE_SHEETS_API_KEY) {
      setLoginError('API Key no configurada')
      return false
    }

    try {
      setLoginError('')
      setLoading(true)

      // Cargar credenciales desde Google Sheets
      const credencialesResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/CREDENCIALES!A2:C100?key=${GOOGLE_SHEETS_API_KEY}`
      )
      
      if (!credencialesResponse.ok) {
        throw new Error('Error cargando credenciales')
      }
      
      const credencialesData = await credencialesResponse.json()
      const credencialesRows = credencialesData.values || []
      
      const formattedCredenciales = credencialesRows
        .filter(row => row[0] && row[1] && row[2])
        .map(row => ({
          usuario: row[0],
          contraseña: row[1],
          rol: row[2]
        }))

      setCredenciales(formattedCredenciales)

      // Verificar credenciales
      const user = formattedCredenciales.find(
        cred => cred.usuario === loginForm.usuario && cred.contraseña === loginForm.contraseña
      )

      if (user) {
        setCurrentUser(user)
        setIsLoggedIn(true)
        setLoginForm({ usuario: '', contraseña: '' })
        return true
      } else {
        setLoginError('Usuario o contraseña incorrectos')
        return false
      }
    } catch (error) {
      console.error('Error en autenticación:', error)
      setLoginError(`Error: ${error.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }, [loginForm])

  // Función para cargar datos desde Google Sheets
  const loadDataFromSheets = useCallback(async () => {
    if (!GOOGLE_SHEETS_API_KEY || !isLoggedIn) {
      setError('No autenticado o API Key no configurada')
      return false
    }

    try {
      setError('')
      setLoading(true)

      // Cargar leads desde LEADS_MASTER con estructura nueva
      const leadsResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/LEADS_MASTER!A2:M50000?key=${GOOGLE_SHEETS_API_KEY}`
      )
      
      if (!leadsResponse.ok) {
        throw new Error(`Error cargando leads: ${leadsResponse.status}`)
      }
      
      const leadsData = await leadsResponse.json()
      const leadsRows = leadsData.values || []
      
      const formattedLeads = leadsRows
        .filter(row => row[0]) // Filtrar filas con nombre
        .map((row, index) => ({
          id: `lead_${index + 1}`,
          nombre: row[0] || '',
          telefono: row[1] || '',
          fuente: row[2] || '',
          registro: row[3] || '',
          producto_interes: row[4] || '',
          email: row[5] || '',
          estado: row[6] || 'Activo',
          pipeline: row[7] || 'Prospección',
          vendedor: row[8] || '',
          comentarios: row[9] || '',
          fecha_ultimo_contacto: row[10] || '',
          proxima_accion: row[11] || '',
          fecha_proxima_accion: row[12] || '',
          rowIndex: index + 2 // Para actualizar en Google Sheets
        }))

      // Filtrar leads según rol del usuario
      let filteredLeads = formattedLeads
      if (currentUser?.rol === 'vendedor') {
        filteredLeads = formattedLeads.filter(lead => 
          lead.vendedor === currentUser.usuario || lead.vendedor === ''
        )
      }

      setLeads(filteredLeads)
      
      // Calcular paginación
      const totalLeads = filteredLeads.filter(lead => 
        filterEstado === 'all' || lead.estado === filterEstado
      ).length
      setTotalPages(Math.ceil(totalLeads / leadsPerPage))

      // Cargar tareas próximas
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const proximasTareas = filteredLeads
        .filter(lead => lead.fecha_proxima_accion && lead.proxima_accion)
        .filter(lead => {
          const fechaTarea = new Date(lead.fecha_proxima_accion)
          return fechaTarea >= today && fechaTarea <= nextWeek
        })
        .map(lead => ({
          id: lead.id,
          cliente: lead.nombre,
          accion: lead.proxima_accion,
          fecha: lead.fecha_proxima_accion,
          vendedor: lead.vendedor
        }))
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

      setUpcomingTasks(proximasTareas)

      // Cargar ventas y cobranzas (código existente)
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
      
      setConnected(true)
      console.log(`Cargados ${filteredLeads.length} leads exitosamente`)
      return true
    } catch (error) {
      console.error('Error cargando datos:', error)
      setError(`Error: ${error.message}`)
      setConnected(false)
      return false
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn, currentUser, filterEstado, leadsPerPage])

  // Función para actualizar lead en Google Sheets
  const updateLeadInSheets = async (lead) => {
    if (!GOOGLE_SHEETS_API_KEY) {
      console.error('API Key no configurada para escritura')
      return false
    }

    try {
      // Aquí iría la lógica de escritura usando Google Sheets API
      // Por ahora actualizamos localmente
      setLeads(prevLeads => 
        prevLeads.map(l => l.id === lead.id ? { ...l, ...lead } : l)
      )
      
      console.log('Lead actualizado:', lead)
      return true
    } catch (error) {
      console.error('Error actualizando lead:', error)
      return false
    }
  }

  // Función para agregar nuevo lead
  const handleAddLead = async () => {
    if (!newLead.nombre || !newLead.telefono) {
      alert('Nombre y teléfono son obligatorios')
      return
    }

    const lead = {
      id: `lead_${Date.now()}`,
      nombre: newLead.nombre,
      telefono: newLead.telefono,
      fuente: newLead.fuente,
      registro: new Date().toISOString().split('T')[0],
      producto_interes: newLead.producto_interes,
      email: newLead.email,
      estado: 'Activo',
      pipeline: 'Prospección',
      vendedor: currentUser?.rol === 'vendedor' ? currentUser.usuario : '',
      comentarios: newLead.comentarios,
      fecha_ultimo_contacto: new Date().toISOString().split('T')[0],
      proxima_accion: '',
      fecha_proxima_accion: ''
    }

    // Agregar a Google Sheets (implementar escritura)
    await updateLeadInSheets(lead)
    
    setLeads([lead, ...leads])
    setNewLead({
      nombre: '',
      telefono: '',
      fuente: '',
      producto_interes: '',
      email: '',
      comentarios: ''
    })
    setShowNewLeadForm(false)
    alert('Lead agregado exitosamente!')
  }

  // Función para editar lead
  const handleEditLead = async () => {
    const updatedLead = {
      ...editLead,
      fecha_ultimo_contacto: new Date().toISOString().split('T')[0]
    }

    await updateLeadInSheets(updatedLead)
    
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === editLead.id ? { ...lead, ...updatedLead } : lead
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
      fuente: lead.fuente,
      producto_interes: lead.producto_interes,
      email: lead.email || '',
      estado: lead.estado,
      pipeline: lead.pipeline,
      vendedor: lead.vendedor,
      comentarios: lead.comentarios || '',
      fecha_ultimo_contacto: lead.fecha_ultimo_contacto || '',
      proxima_accion: lead.proxima_accion || '',
      fecha_proxima_accion: lead.fecha_proxima_accion || ''
    })
    setShowEditLeadForm(true)
  }

  // Función para mover leads en el pipeline
  const moveLeadToStage = async (leadId, newStage) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    const updatedLead = {
      ...lead,
      pipeline: newStage,
      fecha_ultimo_contacto: new Date().toISOString().split('T')[0]
    }

    await updateLeadInSheets(updatedLead)

    setLeads(prevLeads => 
      prevLeads.map(l => l.id === leadId ? updatedLead : l)
    )

    // Si se mueve a "Cierre", abrir formulario de venta
    if (newStage === 'Cierre') {
      setSelectedLead(updatedLead)
      setShowVentaForm(true)
    }
  }

  // Función para cambiar estado del lead
  const toggleLeadStatus = async (leadId) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    const updatedLead = {
      ...lead,
      estado: lead.estado === 'Activo' ? 'Inactivo' : 'Activo'
    }

    await updateLeadInSheets(updatedLead)

    setLeads(prevLeads => 
      prevLeads.map(l => l.id === leadId ? updatedLead : l)
    )
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
      vendedor: selectedLead.vendedor || currentUser?.usuario,
      fecha_venta: new Date().toISOString().split('T')[0],
      notas_venta: ventaForm.notas_venta
    }

    setVentas([venta, ...ventas])

    // Actualizar lead a "vendido"
    const updatedLead = {
      ...selectedLead,
      pipeline: 'Cierre',
      estado: 'Vendido'
    }

    await updateLeadInSheets(updatedLead)

    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === selectedLead.id ? updatedLead : lead
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
        vendedor_responsable: selectedLead.vendedor || currentUser?.usuario,
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

  // Función para programar tarea
  const handleProgramarTarea = async () => {
    if (!taskForm.lead_id || !taskForm.accion || !taskForm.fecha) {
      alert('Complete todos los campos obligatorios')
      return
    }

    const lead = leads.find(l => l.id === taskForm.lead_id)
    if (!lead) return

    const fechaCompleta = taskForm.hora 
      ? `${taskForm.fecha}T${taskForm.hora}:00`
      : `${taskForm.fecha}T09:00:00`

    const updatedLead = {
      ...lead,
      proxima_accion: taskForm.accion,
      fecha_proxima_accion: taskForm.fecha,
      comentarios: lead.comentarios + `\n[${new Date().toLocaleDateString()}] Tarea programada: ${taskForm.accion}`
    }

    await updateLeadInSheets(updatedLead)

    setLeads(prevLeads => 
      prevLeads.map(l => l.id === taskForm.lead_id ? updatedLead : l)
    )

    // Agregar a tareas próximas
    const newTask = {
      id: `task_${Date.now()}`,
      cliente: lead.nombre,
      accion: taskForm.accion,
      fecha: taskForm.fecha,
      vendedor: lead.vendedor || currentUser?.usuario
    }

    setUpcomingTasks(prev => [...prev, newTask].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)))

    setTaskForm({
      lead_id: '',
      accion: '',
      fecha: '',
      hora: '',
      notas: ''
    })
    setShowTaskForm(false)
    alert('Tarea programada exitosamente!')
  }

  // Función para exportar a Excel
  const exportToExcel = () => {
    const filteredData = filteredLeads.map(lead => ({
      Nombre: lead.nombre,
      Teléfono: lead.telefono,
      Fuente: lead.fuente,
      Registro: lead.registro,
      'Producto Interés': lead.producto_interes,
      Email: lead.email,
      Estado: lead.estado,
      Pipeline: lead.pipeline,
      Vendedor: lead.vendedor,
      Comentarios: lead.comentarios,
      'Último Contacto': lead.fecha_ultimo_contacto,
      'Próxima Acción': lead.proxima_accion,
      'Fecha Próxima Acción': lead.fecha_proxima_accion
    }))

    // Crear CSV
    const headers = Object.keys(filteredData[0] || {})
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n')

    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `leads_petulap_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setLeads([])
    setVentas([])
    setCobranzas([])
    setUpcomingTasks([])
    setActiveTab('leads')
  }

  // Cargar datos al iniciar sesión
  useEffect(() => {
    if (isLoggedIn && GOOGLE_SHEETS_API_KEY) {
      loadDataFromSheets()
    }
  }, [isLoggedIn, loadDataFromSheets])

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.telefono.includes(searchTerm) ||
                         (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesVendedor = filterVendedor === 'all' || lead.vendedor === filterVendedor
    const matchesFuente = filterFuente === 'all' || lead.fuente === filterFuente
    const matchesEstado = filterEstado === 'all' || lead.estado === filterEstado
    const matchesPipeline = filterPipeline === 'all' || lead.pipeline === filterPipeline
    return matchesSearch && matchesVendedor && matchesFuente && matchesEstado && matchesPipeline
  })

  // Paginación
  const indexOfLastLead = currentPage * leadsPerPage
  const indexOfFirstLead = indexOfLastLead - leadsPerPage
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead)

  // Agrupar leads por etapa para Kanban
  const leadsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredLeads.filter(lead => lead.pipeline === stage.title)
    return acc
  }, {})

  // Calcular métricas
  const totalLeads = leads.filter(l => l.estado === 'Activo').length
  const leadsNuevos = leads.filter(l => l.pipeline === 'Prospección' && l.estado === 'Activo').length
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

  // Pantalla de login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PETULAP CRM
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Sistema Empresarial de Gestión
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de acceso</AlertTitle>
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="usuario">Usuario</Label>
                <Input
                  id="usuario"
                  type="text"
                  value={loginForm.usuario}
                  onChange={(e) => setLoginForm({...loginForm, usuario: e.target.value})}
                  placeholder="Ingrese su usuario"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contraseña">Contraseña</Label>
                <Input
                  id="contraseña"
                  type="password"
                  value={loginForm.contraseña}
                  onChange={(e) => setLoginForm({...loginForm, contraseña: e.target.value})}
                  placeholder="Ingrese su contraseña"
                  className="mt-1"
                />
              </div>
            </div>
            
            <Button 
              onClick={authenticateUser} 
              disabled={loading || !loginForm.usuario || !loginForm.contraseña}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-gray-500">
              <p>Acceso seguro con credenciales empresariales</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header empresarial */}
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
                  <p className="text-sm text-gray-500">Sistema Empresarial</p>
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
            
            {/* Notificaciones de tareas */}
            {upcomingTasks.length > 0 && (
              <div className="flex items-center space-x-4">
                <Alert className="bg-yellow-50 border-yellow-200 max-w-md">
                  <Bell className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Tareas Pendientes</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Tienes {upcomingTasks.length} tareas programadas esta semana
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
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
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <User className="h-3 w-3 mr-1" />
                  {currentUser?.usuario} ({currentUser?.rol})
                </Badge>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm border border-gray-200 rounded-lg p-1">
            <TabsTrigger value="leads" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Gestión Leads
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calendario" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendario
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

          {/* Gestión Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Gestión de Leads</h2>
                <p className="text-gray-600 mt-1">
                  {currentUser?.rol === 'admin' 
                    ? 'Administra todos los leads del sistema' 
                    : 'Gestiona tus leads asignados'
                  }
                </p>
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
                
                <Button 
                  onClick={exportToExcel}
                  variant="outline"
                  size="sm"
                  className="hover:bg-green-50 hover:border-green-300"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                
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
                        <Label htmlFor="fuente">Fuente *</Label>
                        <Select value={newLead.fuente} onValueChange={(value) => setNewLead({...newLead, fuente: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar fuente" />
                          </SelectTrigger>
                          <SelectContent>
                            {FUENTES.map(fuente => (
                              <SelectItem key={fuente} value={fuente}>{fuente}</SelectItem>
                            ))}
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
                          <PlusCircle className="h-4 w-4 mr-2" />
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
                  {currentUser?.rol === 'admin' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Vendedor</Label>
                      <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {VENDEDORES.map(vendedor => (
                            <SelectItem key={vendedor} value={vendedor}>{vendedor}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Fuente</Label>
                    <Select value={filterFuente} onValueChange={setFilterFuente}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {FUENTES.map(fuente => (
                          <SelectItem key={fuente} value={fuente}>{fuente}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vista de Tabla con paginación */}
            {viewMode === 'table' && (
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Leads {filterEstado !== 'all' ? filterEstado + 's' : ''}</CardTitle>
                      <CardDescription>
                        Mostrando {indexOfFirstLead + 1}-{Math.min(indexOfLastLead, filteredLeads.length)} de {filteredLeads.length} leads
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        Página {currentPage} de {Math.ceil(filteredLeads.length / leadsPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredLeads.length / leadsPerPage)))}
                        disabled={currentPage >= Math.ceil(filteredLeads.length / leadsPerPage)}
                      >
                        <ChevronRight className="h-4 w-4" />
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
                          <TableHead>Estado</TableHead>
                          <TableHead>Última Acción</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentLeads.map((lead) => (
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
                              <Badge variant="outline" className="text-xs">
                                {lead.fuente}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStageColor(lead.pipeline)}>
                                {lead.pipeline}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">{lead.vendedor || 'Sin asignar'}</div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={lead.estado === 'Activo' ? 'default' : 'secondary'}
                                className={lead.estado === 'Activo' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {lead.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-gray-500">
                                {lead.fecha_ultimo_contacto && (
                                  <div>{lead.fecha_ultimo_contacto}</div>
                                )}
                                {lead.proxima_accion && (
                                  <div className="font-medium text-blue-600">{lead.proxima_accion}</div>
                                )}
                              </div>
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
                                  {lead.estado === 'Activo' ? (
                                    <XCircle className="h-3 w-3 text-red-500" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  )}
                                </Button>
                                {PIPELINE_STAGES.map((stage) => {
                                  if (stage.title === lead.pipeline) return null
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
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="min-h-[600px] space-y-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      {leadsByStage[stage.id]?.slice(0, 20).map((lead) => (
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
                                    {lead.estado === 'Activo' ? (
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
                                <Badge variant="outline" className="text-xs px-2 py-0">
                                  {lead.fuente}
                                </Badge>
                                <div className="text-xs text-gray-500">
                                  {lead.vendedor || 'Sin asignar'}
                                </div>
                              </div>
                              
                              {lead.comentarios && (
                                <p className="text-xs text-gray-600 italic line-clamp-2">
                                  {lead.comentarios}
                                </p>
                              )}
                              
                              {/* Botones para mover entre etapas */}
                              <div className="flex gap-1 flex-wrap">
                                {PIPELINE_STAGES.map((targetStage) => {
                                  if (targetStage.title === lead.pipeline) return null
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
                  <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
                  <Target className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ventasDelMes}</div>
                  <p className="text-xs opacity-80">Cierres exitosos</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
                  <CreditCard className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">S/ {cobranzasPendientes.toLocaleString()}</div>
                  <p className="text-xs opacity-80">Pendiente de pago</p>
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
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tareas Próximas</CardTitle>
                  <CardDescription>Seguimientos programados esta semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{task.cliente}</div>
                          <div className="text-xs text-gray-500">{task.accion}</div>
                          <div className="text-xs text-blue-600">{task.vendedor}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{task.fecha}</div>
                          <Badge variant="outline" className="text-xs">
                            <CalendarIcon className="h-2 w-2 mr-1" />
                            Programada
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {upcomingTasks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No hay tareas programadas</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendario Tab */}
          <TabsContent value="calendario" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Calendario de Tareas</h2>
                <p className="text-gray-600 mt-1">Programa y gestiona seguimientos</p>
              </div>
              <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Tarea
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Programar Tarea</DialogTitle>
                    <DialogDescription>
                      Programa un seguimiento para un lead
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task_lead">Lead *</Label>
                      <Select value={taskForm.lead_id} onValueChange={(value) => setTaskForm({...taskForm, lead_id: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar lead" />
                        </SelectTrigger>
                        <SelectContent>
                          {leads.filter(l => l.estado === 'Activo').map(lead => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.nombre} - {lead.telefono}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="task_accion">Acción *</Label>
                      <Input
                        id="task_accion"
                        value={taskForm.accion}
                        onChange={(e) => setTaskForm({...taskForm, accion: e.target.value})}
                        placeholder="Llamar, enviar cotización, etc."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task_fecha">Fecha *</Label>
                      <Input
                        id="task_fecha"
                        type="date"
                        value={taskForm.fecha}
                        onChange={(e) => setTaskForm({...taskForm, fecha: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task_hora">Hora</Label>
                      <Input
                        id="task_hora"
                        type="time"
                        value={taskForm.hora}
                        onChange={(e) => setTaskForm({...taskForm, hora: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task_notas">Notas</Label>
                      <Textarea
                        id="task_notas"
                        value={taskForm.notas}
                        onChange={(e) => setTaskForm({...taskForm, notas: e.target.value})}
                        placeholder="Observaciones adicionales..."
                        className="mt-1"
                      />
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleProgramarTarea} className="flex-1">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Programar
                      </Button>
                      <Button variant="outline" onClick={() => setShowTaskForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Calendario</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Tareas Programadas</CardTitle>
                  <CardDescription>
                    {upcomingTasks.length} tareas en total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingTasks.map((task) => (
                      <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="font-semibold text-lg">{task.cliente}</div>
                              <div className="text-gray-600">{task.accion}</div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  {task.fecha}
                                </div>
                                <div className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  {task.vendedor}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Programada
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {upcomingTasks.length === 0 && (
                      <div className="text-center py-12">
                        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas programadas</h3>
                        <p className="text-gray-500">Programa seguimientos para gestionar mejor tus leads.</p>
                      </div>
                    )}
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
                                    <CalendarIcon className="h-3 w-3 mr-1" />
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
                    {FUENTES.map(fuente => {
                      const totalFuente = leads.filter(l => l.fuente === fuente).length
                      const vendidosFuente = leads.filter(l => l.fuente === fuente && l.estado === 'Vendido').length
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
                    {VENDEDORES.map(vendedor => {
                      const totalVendedor = leads.filter(l => l.vendedor === vendedor).length
                      const vendidosVendedor = leads.filter(l => l.vendedor === vendedor && l.estado === 'Vendido').length
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>
              Actualizar información del lead
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="edit_fuente">Fuente</Label>
              <Select value={editLead.fuente} onValueChange={(value) => setEditLead({...editLead, fuente: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUENTES.map(fuente => (
                    <SelectItem key={fuente} value={fuente}>{fuente}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="edit_estado">Estado</Label>
              <Select value={editLead.estado} onValueChange={(value) => setEditLead({...editLead, estado: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Vendido">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_pipeline">Pipeline</Label>
              <Select value={editLead.pipeline} onValueChange={(value) => setEditLead({...editLead, pipeline: value})}>
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
            {currentUser?.rol === 'admin' && (
              <div>
                <Label htmlFor="edit_vendedor">Vendedor</Label>
                <Select value={editLead.vendedor} onValueChange={(value) => setEditLead({...editLead, vendedor: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {VENDEDORES.map(vendedor => (
                      <SelectItem key={vendedor} value={vendedor}>{vendedor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="edit_producto">Producto de Interés</Label>
              <Input
                id="edit_producto"
                value={editLead.producto_interes}
                onChange={(e) => setEditLead({...editLead, producto_interes: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
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
            <div className="col-span-2 flex space-x-2 pt-4">
              <Button onClick={handleEditLead} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
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

      {/* Footer empresarial */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm text-gray-600">
                © 2025 PETULAP CRM - Sistema Empresarial de Gestión
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{totalLeads} leads activos</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{ventasDelMes} ventas este mes</span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="h-4 w-4" />
                <span>S/ {cobranzasPendientes.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{currentUser?.usuario} ({currentUser?.rol})</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

