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
import { useState, useEffect } from 'react'
import './App.css'

// Configuración de Google Sheets con Service Account
const GOOGLE_SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1kgAlVkdtgofYTYyqKycGwtmnYuiMU-41_geAcKIp8mE'
const GOOGLE_SERVICE_ACCOUNT_KEY = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_KEY

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

// Usuarios del sistema
const USUARIOS = [
  { usuario: 'diego', contraseña: 'admin2025', rol: 'admin', nombre: 'Diego' },
  { usuario: 'gema', contraseña: 'gema2025', rol: 'vendedor', nombre: 'Gema' },
  { usuario: 'andre', contraseña: 'andre2025', rol: 'vendedor', nombre: 'Andre' },
  { usuario: 'josue', contraseña: 'josue2025', rol: 'vendedor', nombre: 'Josue' },
  { usuario: 'alejandro', contraseña: 'alejandro2025', rol: 'vendedor', nombre: 'Alejandro' },
  { usuario: 'kevin', contraseña: 'kevin2025', rol: 'vendedor', nombre: 'Kevin' },
  { usuario: 'jefry', contraseña: 'jefry2025', rol: 'vendedor', nombre: 'Jefry' },
  { usuario: 'adrian', contraseña: 'adrian2025', rol: 'vendedor', nombre: 'Adrian' }
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
  const [tareas, setTareas] = useState([])
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
  const [showAssignLeadForm, setShowAssignLeadForm] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVendedor, setFilterVendedor] = useState('all')
  const [filterFuente, setFilterFuente] = useState('all')
  const [filterEstado, setFilterEstado] = useState('Activo')
  const [filterPipeline, setFilterPipeline] = useState('all')

  // Estados para calendario y tareas
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [upcomingTasks, setUpcomingTasks] = useState([])

  // Formulario nuevo lead
  const [newLead, setNewLead] = useState({
    nombre: '',
    telefono: '',
    fuente: '',
    producto_interes: '',
    email: '',
    comentarios: '',
    vendedor_asignado: ''
  })

  // Formulario editar lead
  const [editLead, setEditLead] = useState({
    nombre: '',
    telefono: '',
    fuente: '',
    producto_interes: '',
    email: '',
    comentarios: '',
    vendedor_asignado: '',
    activo: 'Activo'
  })

  // Formulario venta
  const [ventaForm, setVentaForm] = useState({
    monto_total: '',
    pago_inicial: '',
    tipo_pago: 'completo',
    sin_comprobante: false,
    plazo_credito: '',
    fecha_vencimiento: ''
  })

  // Formulario tarea
  const [taskForm, setTaskForm] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    tipo: 'seguimiento',
    lead_id: ''
  })

  // Función para obtener token de acceso usando Service Account
  const getAccessToken = async () => {
    try {
      if (!GOOGLE_SERVICE_ACCOUNT_KEY) {
        throw new Error('Service Account Key no configurada')
      }

      // En un entorno real, esto se haría en el backend por seguridad
      // Por ahora, simulamos la autenticación
      console.log('Obteniendo token de acceso...')
      
      // Retornamos un token simulado para desarrollo
      // En producción, esto debe manejarse en el backend
      return 'SIMULATED_ACCESS_TOKEN'
    } catch (error) {
      console.error('Error obteniendo token:', error)
      throw error
    }
  }

  // Función para hacer peticiones autenticadas a Google Sheets API
  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      // Si tenemos Service Account configurado, usar autenticación
      if (GOOGLE_SERVICE_ACCOUNT_KEY) {
        const token = await getAccessToken()
        return fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        })
      } else {
        // Fallback a API Key para solo lectura
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
        const separator = url.includes('?') ? '&' : '?'
        return fetch(`${url}${separator}key=${apiKey}`, options)
      }
    } catch (error) {
      console.error('Error en petición autenticada:', error)
      throw error
    }
  }

  // Función para leer datos de Google Sheets
  const fetchGoogleSheetsData = async () => {
    try {
      setLoading(true)
      setError('')

      if (!GOOGLE_SHEETS_ID) {
        throw new Error('ID de Google Sheets no configurado')
      }

      // Leer hoja LEADS_MASTER
      const leadsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/LEADS_MASTER!A:Z`
      const leadsResponse = await makeAuthenticatedRequest(leadsUrl)

      if (!leadsResponse.ok) {
        throw new Error(`Error al leer datos: ${leadsResponse.status} ${leadsResponse.statusText}`)
      }

      const leadsData = await leadsResponse.json()
      
      if (leadsData.values && leadsData.values.length > 1) {
        const headers = leadsData.values[0]
        const rows = leadsData.values.slice(1)
        
        const formattedLeads = rows.map((row, index) => {
          const lead = {}
          headers.forEach((header, i) => {
            const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')
            lead[key] = row[i] || ''
          })
          lead.id = index + 1
          lead.row_number = index + 2 // Para referencia en Google Sheets
          return lead
        }).filter(lead => lead.nombre) // Filtrar filas vacías

        setLeads(formattedLeads)
        setTotalPages(Math.ceil(formattedLeads.length / leadsPerPage))
        console.log(`Cargados ${formattedLeads.length} leads`)
      }

      // Leer otras hojas si existen
      try {
        const ventasUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/VENTAS!A:Z`
        const ventasResponse = await makeAuthenticatedRequest(ventasUrl)
        
        if (ventasResponse.ok) {
          const ventasData = await ventasResponse.json()
          if (ventasData.values && ventasData.values.length > 1) {
            const ventasHeaders = ventasData.values[0]
            const ventasRows = ventasData.values.slice(1)
            const formattedVentas = ventasRows.map((row, index) => {
              const venta = {}
              ventasHeaders.forEach((header, i) => {
                const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')
                venta[key] = row[i] || ''
              })
              venta.id = index + 1
              return venta
            }).filter(venta => venta.nombre)
            setVentas(formattedVentas)
          }
        }
      } catch (error) {
        console.log('Hoja VENTAS no encontrada:', error)
      }

      // Leer hoja de TAREAS si existe
      try {
        const tareasUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/TAREAS!A:Z`
        const tareasResponse = await makeAuthenticatedRequest(tareasUrl)
        
        if (tareasResponse.ok) {
          const tareasData = await tareasResponse.json()
          if (tareasData.values && tareasData.values.length > 1) {
            const tareasHeaders = tareasData.values[0]
            const tareasRows = tareasData.values.slice(1)
            const formattedTareas = tareasRows.map((row, index) => {
              const tarea = {}
              tareasHeaders.forEach((header, i) => {
                const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')
                tarea[key] = row[i] || ''
              })
              tarea.id = index + 1
              return tarea
            }).filter(tarea => tarea.titulo)
            setTareas(formattedTareas)
            
            // Filtrar tareas próximas (próximos 7 días)
            const today = new Date()
            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
            const upcoming = formattedTareas.filter(tarea => {
              if (!tarea.fecha) return false
              const taskDate = new Date(tarea.fecha)
              return taskDate >= today && taskDate <= nextWeek
            })
            setUpcomingTasks(upcoming)
          }
        }
      } catch (error) {
        console.log('Hoja TAREAS no encontrada:', error)
      }

      setConnected(true)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error.message)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  // Función para escribir datos en Google Sheets
  const writeToGoogleSheets = async (range, values) => {
    try {
      if (!GOOGLE_SERVICE_ACCOUNT_KEY) {
        throw new Error('Service Account no configurado. Solo lectura disponible.')
      }

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${range}?valueInputOption=RAW`
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          values: values
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Error escribiendo en Google Sheets: ${response.status} - ${errorData}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error escribiendo datos:', error)
      throw error
    }
  }

  // Función para agregar fila a Google Sheets
  const appendToGoogleSheets = async (range, values) => {
    try {
      if (!GOOGLE_SERVICE_ACCOUNT_KEY) {
        throw new Error('Service Account no configurado. Solo lectura disponible.')
      }

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${range}:append?valueInputOption=RAW`
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          values: values
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Error agregando a Google Sheets: ${response.status} - ${errorData}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error agregando datos:', error)
      throw error
    }
  }

  // Función para agregar nuevo lead
  const addNewLead = async () => {
    try {
      setLoading(true)
      
      if (!newLead.nombre || !newLead.telefono || !newLead.fuente) {
        throw new Error('Nombre, teléfono y fuente son obligatorios')
      }

      const newRow = [
        new Date().toISOString().split('T')[0], // fecha
        newLead.nombre,
        newLead.telefono,
        newLead.email || '',
        newLead.fuente,
        'EJERCITO', // tienda por defecto
        'Prospección', // estado inicial
        newLead.vendedor_asignado || '', // vendedor asignado
        newLead.producto_interes || '',
        newLead.comentarios || '',
        'Activo', // estado por defecto
        '', // fecha_seguimiento
        '', // monto_estimado
        10 // probabilidad inicial
      ]

      await appendToGoogleSheets('LEADS_MASTER', [newRow])
      
      // Actualizar datos locales
      await fetchGoogleSheetsData()
      
      // Limpiar formulario
      setNewLead({
        nombre: '',
        telefono: '',
        fuente: '',
        producto_interes: '',
        email: '',
        comentarios: '',
        vendedor_asignado: ''
      })
      
      setShowNewLeadForm(false)
      alert('Lead agregado exitosamente')
    } catch (error) {
      console.error('Error agregando lead:', error)
      alert('Error al agregar lead: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar lead existente
  const updateLead = async (leadData) => {
    try {
      setLoading(true)
      
      if (!selectedLead) {
        throw new Error('No hay lead seleccionado')
      }

      const leadIndex = leads.findIndex(lead => lead.id === selectedLead.id)
      if (leadIndex === -1) {
        throw new Error('Lead no encontrado')
      }

      const rowNumber = selectedLead.row_number || leadIndex + 2
      
      // Crear array con todos los valores actualizados
      const currentLead = leads[leadIndex]
      const updatedRow = [
        currentLead.fecha || new Date().toISOString().split('T')[0],
        leadData.nombre || currentLead.nombre,
        leadData.telefono || currentLead.telefono,
        leadData.email || currentLead.email || '',
        leadData.fuente || currentLead.fuente,
        currentLead.tienda || 'EJERCITO',
        leadData.estado || currentLead.estado || 'Prospección',
        leadData.vendedor_asignado || currentLead.vendedor_id || '',
        leadData.producto_interes || currentLead.producto_interes || '',
        leadData.comentarios || currentLead.comentarios || '',
        leadData.activo || currentLead.activo || 'Activo',
        leadData.fecha_seguimiento || currentLead.fecha_seguimiento || '',
        leadData.monto_estimado || currentLead.monto_estimado || '',
        leadData.probabilidad || currentLead.probabilidad || 10
      ]

      await writeToGoogleSheets(`LEADS_MASTER!A${rowNumber}:N${rowNumber}`, [updatedRow])
      
      // Actualizar datos locales
      await fetchGoogleSheetsData()
      
      setShowEditLeadForm(false)
      setSelectedLead(null)
      alert('Lead actualizado exitosamente')
    } catch (error) {
      console.error('Error actualizando lead:', error)
      alert('Error al actualizar lead: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para registrar venta
  const registrarVenta = async () => {
    try {
      setLoading(true)
      
      if (!selectedLead) {
        throw new Error('No hay lead seleccionado')
      }

      if (!ventaForm.monto_total) {
        throw new Error('El monto total es obligatorio')
      }

      // Actualizar estado del lead a "Venta"
      await updateLead({ 
        estado: 'Venta',
        probabilidad: 100
      })

      // Agregar registro de venta
      const ventaRow = [
        new Date().toISOString().split('T')[0], // fecha
        selectedLead.nombre,
        selectedLead.telefono,
        ventaForm.monto_total,
        ventaForm.tipo_pago,
        ventaForm.sin_comprobante ? 'Sí' : 'No',
        ventaForm.pago_inicial || '0',
        ventaForm.fecha_vencimiento || ''
      ]

      try {
        await appendToGoogleSheets('VENTAS', [ventaRow])
      } catch (error) {
        console.log('Error agregando a VENTAS, continuando...', error)
      }

      // Si es venta a crédito, agregar a cobranzas
      if (ventaForm.tipo_pago === 'credito') {
        const saldoPendiente = parseFloat(ventaForm.monto_total) - parseFloat(ventaForm.pago_inicial || 0)
        
        const cobranzaRow = [
          new Date().toISOString().split('T')[0], // fecha
          selectedLead.nombre,
          selectedLead.telefono,
          ventaForm.monto_total,
          ventaForm.pago_inicial || 0,
          saldoPendiente,
          ventaForm.fecha_vencimiento || '',
          'Pendiente'
        ]

        try {
          await appendToGoogleSheets('PAGOS', [cobranzaRow])
        } catch (error) {
          console.log('Error agregando a PAGOS, continuando...', error)
        }
      }

      // Limpiar formulario
      setVentaForm({
        monto_total: '',
        pago_inicial: '',
        tipo_pago: 'completo',
        sin_comprobante: false,
        plazo_credito: '',
        fecha_vencimiento: ''
      })
      
      setShowVentaForm(false)
      setSelectedLead(null)
      
      alert('Venta registrada exitosamente')
    } catch (error) {
      console.error('Error registrando venta:', error)
      alert('Error al registrar venta: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para agregar tarea
  const addTask = async () => {
    try {
      setLoading(true)
      
      if (!taskForm.titulo || !taskForm.fecha) {
        throw new Error('Título y fecha son obligatorios')
      }

      const taskRow = [
        taskForm.titulo,
        taskForm.descripcion || '',
        taskForm.fecha,
        taskForm.hora || '',
        taskForm.tipo,
        taskForm.lead_id || selectedLead?.id || '',
        selectedLead?.nombre || '',
        currentUser?.nombre || '',
        'Pendiente',
        new Date().toISOString().split('T')[0] // fecha_creacion
      ]

      try {
        await appendToGoogleSheets('TAREAS', [taskRow])
      } catch (error) {
        // Si la hoja TAREAS no existe, crearla con headers
        const headers = [
          'TITULO', 'DESCRIPCION', 'FECHA', 'HORA', 'TIPO', 
          'LEAD_ID', 'LEAD_NOMBRE', 'VENDEDOR', 'ESTADO', 'FECHA_CREACION'
        ]
        await writeToGoogleSheets('TAREAS!A1:J1', [headers])
        await appendToGoogleSheets('TAREAS', [taskRow])
      }
      
      // Actualizar datos locales
      await fetchGoogleSheetsData()
      
      // Limpiar formulario
      setTaskForm({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        tipo: 'seguimiento',
        lead_id: ''
      })
      
      setShowTaskForm(false)
      alert('Tarea agregada exitosamente')
    } catch (error) {
      console.error('Error agregando tarea:', error)
      alert('Error al agregar tarea: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Función de login
  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    const user = USUARIOS.find(u => 
      u.usuario === loginForm.usuario && u.contraseña === loginForm.contraseña
    )

    if (user) {
      setCurrentUser(user)
      setIsLoggedIn(true)
      setLoginForm({ usuario: '', contraseña: '' })
    } else {
      setLoginError('Usuario o contraseña incorrectos')
    }
  }

  // Función de logout
  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    setActiveTab('leads')
  }

  // Función para mover lead en pipeline
  const moveLeadToPipeline = async (leadId, newStage) => {
    try {
      const lead = leads.find(l => l.id === leadId)
      if (!lead) return

      const stageNames = {
        'prospeccion': 'Prospección',
        'contacto': 'Contacto',
        'negociacion': 'Negociación',
        'cierre': 'Cierre'
      }

      const probabilidades = {
        'prospeccion': 10,
        'contacto': 25,
        'negociacion': 50,
        'cierre': 75
      }

      // Actualizar temporalmente el lead seleccionado
      setSelectedLead(lead)

      await updateLead({
        estado: stageNames[newStage],
        probabilidad: probabilidades[newStage]
      })

      // Si se mueve a cierre, abrir formulario de venta
      if (newStage === 'cierre') {
        setShowVentaForm(true)
      }
    } catch (error) {
      console.error('Error moviendo lead:', error)
      alert('Error al mover lead: ' + error.message)
    }
  }

  // Función para asignar lead a vendedor
  const assignLeadToSeller = async (leadId, vendedor) => {
    try {
      const lead = leads.find(l => l.id === leadId)
      if (!lead) return

      setSelectedLead(lead)
      await updateLead({
        vendedor_asignado: vendedor
      })
    } catch (error) {
      console.error('Error asignando lead:', error)
      alert('Error al asignar lead: ' + error.message)
    }
  }

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.telefono?.includes(searchTerm) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesVendedor = filterVendedor === 'all' || 
                           lead.vendedor_nombre === filterVendedor ||
                           lead.vendedor_asignado === filterVendedor
    const matchesFuente = filterFuente === 'all' || lead.fuente === filterFuente
    const matchesEstado = filterEstado === 'all' || lead.activo === filterEstado
    const matchesPipeline = filterPipeline === 'all' || lead.estado === filterPipeline

    // Si es vendedor, solo mostrar sus leads
    if (currentUser?.rol === 'vendedor') {
      const matchesUserLeads = lead.vendedor_nombre === currentUser.nombre ||
                              lead.vendedor_asignado === currentUser.nombre
      return matchesSearch && matchesVendedor && matchesFuente && matchesEstado && matchesPipeline && matchesUserLeads
    }

    return matchesSearch && matchesVendedor && matchesFuente && matchesEstado && matchesPipeline
  })

  // Paginación
  const indexOfLastLead = currentPage * leadsPerPage
  const indexOfFirstLead = indexOfLastLead - leadsPerPage
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead)

  // Calcular métricas
  const totalLeads = filteredLeads.length
  const leadsActivos = filteredLeads.filter(lead => lead.activo === 'Activo').length
  const ventasDelMes = ventas.filter(venta => {
    const ventaDate = new Date(venta.fecha)
    const currentDate = new Date()
    return ventaDate.getMonth() === currentDate.getMonth() && 
           ventaDate.getFullYear() === currentDate.getFullYear()
  }).length

  const ingresosTotales = ventas.reduce((total, venta) => {
    return total + (parseFloat(venta.monto_total) || 0)
  }, 0)

  // Cargar datos al iniciar
  useEffect(() => {
    if (isLoggedIn) {
      fetchGoogleSheetsData()
    }
  }, [isLoggedIn])

  // Pantalla de login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">CRM PETULAP</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="usuario">Usuario</Label>
                <Input
                  id="usuario"
                  type="text"
                  value={loginForm.usuario}
                  onChange={(e) => setLoginForm({...loginForm, usuario: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contraseña">Contraseña</Label>
                <Input
                  id="contraseña"
                  type="password"
                  value={loginForm.contraseña}
                  onChange={(e) => setLoginForm({...loginForm, contraseña: e.target.value})}
                  required
                />
              </div>
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">CRM PETULAP</h1>
              <Badge variant="outline" className="ml-3">
                {connected ? 'Conectado' : 'Desconectado'}
              </Badge>
              {GOOGLE_SERVICE_ACCOUNT_KEY && (
                <Badge variant="default" className="ml-2">
                  Escritura Habilitada
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchGoogleSheetsData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{currentUser?.nombre}</span>
                <Badge variant={currentUser?.rol === 'admin' ? 'default' : 'secondary'}>
                  {currentUser?.rol}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="cobranzas">Cobranzas</TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
            {currentUser?.rol === 'admin' && (
              <TabsTrigger value="configuracion">Configuración</TabsTrigger>
            )}
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
                  <p className="text-xs text-muted-foreground">
                    {leadsActivos} activos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ventasDelMes}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% vs mes anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">S/ {ingresosTotales.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% vs mes anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalLeads > 0 ? ((ventasDelMes / totalLeads) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% vs mes anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline de Ventas</CardTitle>
                <CardDescription>Estado actual de todos los leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {PIPELINE_STAGES.map(stage => {
                    const stageLeads = filteredLeads.filter(lead => 
                      lead.estado?.toLowerCase() === stage.title.toLowerCase()
                    )
                    const stageValue = stageLeads.reduce((total, lead) => 
                      total + (parseFloat(lead.monto_estimado) || 0), 0
                    )

                    return (
                      <div key={stage.id} className={`p-4 rounded-lg border-2 ${stage.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-medium ${stage.textColor}`}>{stage.title}</h3>
                          <Badge variant="secondary">{stageLeads.length}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          S/ {stageValue.toLocaleString()}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads */}
          <TabsContent value="leads" className="space-y-6">
            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button onClick={() => setShowNewLeadForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Lead
                </Button>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {VENDEDORES.map(vendedor => (
                      <SelectItem key={vendedor} value={vendedor}>{vendedor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterFuente} onValueChange={setFilterFuente}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {FUENTES.map(fuente => (
                      <SelectItem key={fuente} value={fuente}>{fuente}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Vista Tabla */}
            {viewMode === 'table' && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Fuente</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead>Probabilidad</TableHead>
                          <TableHead>Activo</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.nombre}</TableCell>
                            <TableCell>{lead.telefono}</TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{lead.fuente}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                lead.estado === 'Venta' ? 'default' :
                                lead.estado === 'Negociación' ? 'secondary' :
                                'outline'
                              }>
                                {lead.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{lead.vendedor_nombre || lead.vendedor_asignado}</span>
                                {currentUser?.rol === 'admin' && (
                                  <Select
                                    value={lead.vendedor_asignado || ''}
                                    onValueChange={(value) => assignLeadToSeller(lead.id, value)}
                                  >
                                    <SelectTrigger className="w-24 h-6 text-xs">
                                      <SelectValue placeholder="Asignar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {VENDEDORES.map(vendedor => (
                                        <SelectItem key={vendedor} value={vendedor}>{vendedor}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{lead.producto_interes}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${lead.probabilidad || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{lead.probabilidad || 0}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={lead.activo === 'Activo' ? 'default' : 'secondary'}>
                                {lead.activo}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLead(lead)
                                    setEditLead({
                                      nombre: lead.nombre || '',
                                      telefono: lead.telefono || '',
                                      email: lead.email || '',
                                      fuente: lead.fuente || '',
                                      producto_interes: lead.producto_interes || '',
                                      comentarios: lead.comentarios || '',
                                      vendedor_asignado: lead.vendedor_asignado || '',
                                      activo: lead.activo || 'Activo'
                                    })
                                    setShowEditLeadForm(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLead(lead)
                                    setShowVentaForm(true)
                                  }}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLead(lead)
                                    setTaskForm({
                                      ...taskForm,
                                      lead_id: lead.id,
                                      titulo: `Seguimiento - ${lead.nombre}`
                                    })
                                    setShowTaskForm(true)
                                  }}
                                >
                                  <CalendarIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-gray-500">
                      Mostrando {indexOfFirstLead + 1} a {Math.min(indexOfLastLead, filteredLeads.length)} de {filteredLeads.length} leads
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="px-3 py-1 text-sm">
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
                </CardContent>
              </Card>
            )}

            {/* Vista Kanban */}
            {viewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {PIPELINE_STAGES.map(stage => {
                  const stageLeads = filteredLeads.filter(lead => 
                    lead.estado?.toLowerCase() === stage.title.toLowerCase()
                  )

                  return (
                    <Card key={stage.id} className={stage.color}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className={`text-sm ${stage.textColor}`}>
                            {stage.title}
                          </CardTitle>
                          <Badge variant="secondary">{stageLeads.length}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {stageLeads.slice(0, 10).map(lead => (
                          <Card key={lead.id} className="p-3 bg-white shadow-sm">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{lead.nombre}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {lead.probabilidad || 0}%
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600">{lead.telefono}</p>
                              <p className="text-xs text-gray-500">{lead.producto_interes}</p>
                              
                              <div className="flex flex-wrap gap-1 pt-2">
                                {PIPELINE_STAGES.map(targetStage => {
                                  if (targetStage.id === stage.id) return null
                                  
                                  return (
                                    <Button
                                      key={targetStage.id}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs px-2 py-1 h-6"
                                      onClick={() => moveLeadToPipeline(lead.id, targetStage.id)}
                                    >
                                      {targetStage.title}
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          </Card>
                        ))}
                        
                        {stageLeads.length > 10 && (
                          <div className="text-center text-sm text-gray-500 pt-2">
                            +{stageLeads.length - 10} más
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Cobranzas */}
          <TabsContent value="cobranzas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Cobranzas</CardTitle>
                <CardDescription>Control de pagos pendientes y créditos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Módulo de cobranzas en desarrollo</p>
                  <p className="text-sm">Próximamente: gestión completa de pagos y créditos</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendario */}
          <TabsContent value="calendario" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Calendario de Tareas</CardTitle>
                  <CardDescription>Programa y gestiona tus seguimientos</CardDescription>
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

              <Card>
                <CardHeader>
                  <CardTitle>Tareas Próximas</CardTitle>
                  <CardDescription>Recordatorios y seguimientos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingTasks.length > 0 ? (
                      upcomingTasks.map(task => (
                        <div key={task.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <div>
                            <p className="text-sm font-medium">{task.titulo}</p>
                            <p className="text-xs text-gray-500">
                              {task.fecha} {task.hora && `- ${task.hora}`}
                            </p>
                            {task.lead_nombre && (
                              <p className="text-xs text-blue-600">{task.lead_nombre}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay tareas próximas</p>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowTaskForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Tarea
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configuración (Solo Admin) */}
          {currentUser?.rol === 'admin' && (
            <TabsContent value="configuracion" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                  <CardDescription>Gestión de usuarios y configuraciones generales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Usuarios del Sistema</h3>
                      <div className="space-y-2">
                        {USUARIOS.map(usuario => (
                          <div key={usuario.usuario} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <User className="h-4 w-4" />
                              <div>
                                <p className="font-medium">{usuario.nombre}</p>
                                <p className="text-sm text-gray-500">@{usuario.usuario}</p>
                              </div>
                            </div>
                            <Badge variant={usuario.rol === 'admin' ? 'default' : 'secondary'}>
                              {usuario.rol}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Configuración de Google Sheets</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Estado de Conexión</p>
                            <p className="text-sm text-gray-500">
                              {connected ? 'Conectado correctamente' : 'Error de conexión'}
                            </p>
                          </div>
                          <Badge variant={connected ? 'default' : 'destructive'}>
                            {connected ? 'Activo' : 'Error'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Modo de Escritura</p>
                            <p className="text-sm text-gray-500">
                              {GOOGLE_SERVICE_ACCOUNT_KEY ? 'Service Account (Lectura + Escritura)' : 'API Key (Solo Lectura)'}
                            </p>
                          </div>
                          <Badge variant={GOOGLE_SERVICE_ACCOUNT_KEY ? 'default' : 'secondary'}>
                            {GOOGLE_SERVICE_ACCOUNT_KEY ? 'Completo' : 'Limitado'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">ID de Google Sheets</p>
                            <p className="text-sm text-gray-500 font-mono">
                              {GOOGLE_SHEETS_ID}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Formulario Nuevo Lead */}
        <Dialog open={showNewLeadForm} onOpenChange={setShowNewLeadForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Lead</DialogTitle>
              <DialogDescription>
                Completa la información del nuevo lead
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={newLead.nombre}
                  onChange={(e) => setNewLead({...newLead, nombre: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={newLead.telefono}
                  onChange={(e) => setNewLead({...newLead, telefono: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="fuente">Fuente *</Label>
                <Select value={newLead.fuente} onValueChange={(value) => setNewLead({...newLead, fuente: value})}>
                  <SelectTrigger>
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
                <Label htmlFor="vendedor_asignado">Vendedor Asignado</Label>
                <Select value={newLead.vendedor_asignado} onValueChange={(value) => setNewLead({...newLead, vendedor_asignado: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDEDORES.map(vendedor => (
                      <SelectItem key={vendedor} value={vendedor}>{vendedor}</SelectItem>
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
                  placeholder="Ej: Laptop Gaming, PC Oficina..."
                />
              </div>

              <div>
                <Label htmlFor="comentarios">Comentarios</Label>
                <Textarea
                  id="comentarios"
                  value={newLead.comentarios}
                  onChange={(e) => setNewLead({...newLead, comentarios: e.target.value})}
                  placeholder="Información adicional..."
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={addNewLead} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Lead
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowNewLeadForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Formulario Editar Lead */}
        <Dialog open={showEditLeadForm} onOpenChange={setShowEditLeadForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Lead</DialogTitle>
              <DialogDescription>
                {selectedLead && `Editando información de: ${selectedLead.nombre}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_nombre">Nombre Completo *</Label>
                <Input
                  id="edit_nombre"
                  value={editLead.nombre}
                  onChange={(e) => setEditLead({...editLead, nombre: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit_telefono">Teléfono *</Label>
                <Input
                  id="edit_telefono"
                  value={editLead.telefono}
                  onChange={(e) => setEditLead({...editLead, telefono: e.target.value})}
                  required
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
                <Label htmlFor="edit_fuente">Fuente *</Label>
                <Select value={editLead.fuente} onValueChange={(value) => setEditLead({...editLead, fuente: value})}>
                  <SelectTrigger>
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
                <Label htmlFor="edit_vendedor">Vendedor Asignado</Label>
                <Select value={editLead.vendedor_asignado} onValueChange={(value) => setEditLead({...editLead, vendedor_asignado: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDEDORES.map(vendedor => (
                      <SelectItem key={vendedor} value={vendedor}>{vendedor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_producto">Producto de Interés</Label>
                <Input
                  id="edit_producto"
                  value={editLead.producto_interes}
                  onChange={(e) => setEditLead({...editLead, producto_interes: e.target.value})}
                  placeholder="Ej: Laptop Gaming, PC Oficina..."
                />
              </div>

              <div>
                <Label htmlFor="edit_activo">Estado</Label>
                <Select value={editLead.activo} onValueChange={(value) => setEditLead({...editLead, activo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_comentarios">Comentarios</Label>
                <Textarea
                  id="edit_comentarios"
                  value={editLead.comentarios}
                  onChange={(e) => setEditLead({...editLead, comentarios: e.target.value})}
                  placeholder="Información adicional..."
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={() => updateLead(editLead)} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Actualizar Lead
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowEditLeadForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Formulario Registro de Venta */}
        <Dialog open={showVentaForm} onOpenChange={setShowVentaForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Venta</DialogTitle>
              <DialogDescription>
                {selectedLead && `Registrar venta para: ${selectedLead.nombre}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="monto_total">Monto Total *</Label>
                <Input
                  id="monto_total"
                  type="number"
                  value={ventaForm.monto_total}
                  onChange={(e) => setVentaForm({...ventaForm, monto_total: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo_pago">Tipo de Pago</Label>
                <Select value={ventaForm.tipo_pago} onValueChange={(value) => setVentaForm({...ventaForm, tipo_pago: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completo">Pago Completo</SelectItem>
                    <SelectItem value="credito">Pago a Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {ventaForm.tipo_pago === 'credito' && (
                <>
                  <div>
                    <Label htmlFor="pago_inicial">Pago Inicial</Label>
                    <Input
                      id="pago_inicial"
                      type="number"
                      value={ventaForm.pago_inicial}
                      onChange={(e) => setVentaForm({...ventaForm, pago_inicial: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                    <Input
                      id="fecha_vencimiento"
                      type="date"
                      value={ventaForm.fecha_vencimiento}
                      onChange={(e) => setVentaForm({...ventaForm, fecha_vencimiento: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sin_comprobante"
                  checked={ventaForm.sin_comprobante}
                  onCheckedChange={(checked) => setVentaForm({...ventaForm, sin_comprobante: checked})}
                />
                <Label htmlFor="sin_comprobante">Venta sin comprobante (ahorro IGV)</Label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={registrarVenta} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registrar Venta
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowVentaForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Formulario Nueva Tarea */}
        <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Tarea</DialogTitle>
              <DialogDescription>
                Programa un recordatorio o seguimiento
                {selectedLead && ` para ${selectedLead.nombre}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo_tarea">Título *</Label>
                <Input
                  id="titulo_tarea"
                  value={taskForm.titulo}
                  onChange={(e) => setTaskForm({...taskForm, titulo: e.target.value})}
                  placeholder="Ej: Llamar a cliente"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion_tarea">Descripción</Label>
                <Textarea
                  id="descripcion_tarea"
                  value={taskForm.descripcion}
                  onChange={(e) => setTaskForm({...taskForm, descripcion: e.target.value})}
                  placeholder="Detalles de la tarea..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha_tarea">Fecha *</Label>
                  <Input
                    id="fecha_tarea"
                    type="date"
                    value={taskForm.fecha}
                    onChange={(e) => setTaskForm({...taskForm, fecha: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hora_tarea">Hora</Label>
                  <Input
                    id="hora_tarea"
                    type="time"
                    value={taskForm.hora}
                    onChange={(e) => setTaskForm({...taskForm, hora: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tipo_tarea">Tipo</Label>
                <Select value={taskForm.tipo} onValueChange={(value) => setTaskForm({...taskForm, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="llamada">Llamada</SelectItem>
                    <SelectItem value="reunion">Reunión</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={addTask} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Tarea
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowTaskForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default App

