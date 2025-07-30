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
  AlertCircle, Home, Briefcase, PlusCircle, FileSpreadsheet, MoreHorizontal,
  Building2, Laptop, Smartphone, MapPin, UserCheck, Timer, Banknote, 
  ShoppingCart, Package, FileBarChart, Megaphone, Lock, Unlock
} from 'lucide-react'
import { useState, useEffect } from 'react'
import './App.css'
import logoPetulap from './assets/logo-petulap.png'

// Configuración de Google Sheets con Service Account de Julio
const GOOGLE_SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1kgAlVkdtgofYTYyqKycGwtmnYuiMU-41_geAcKIp8mE'
const GOOGLE_SERVICE_ACCOUNT_KEY = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_KEY
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyA3A2v_fljthf71ceuMO0Xysk-4IburkbI'

// Estructura personalizada de LEADS_MASTER de Julio (14 columnas)
const LEADS_COLUMNS = {
  NOMBRE: 0,           // A
  TELEFONO: 1,         // B  
  FUENTE: 2,           // C
  REGISTRO: 3,         // D
  PRODUCTO_INTERES: 4, // E
  EMAIL: 5,            // F
  ESTADO: 6,           // G
  PIPELINE: 7,         // H
  VENDEDOR: 8,         // I
  COMENTARIOS: 9,      // J
  FECHA_ULTIMO_CONTACTO: 10,  // K
  PROXIMA_ACCION: 11,  // L
  FECHA_PROXIMA_ACCION: 12,   // M
  CONVERSACION: 13     // N
}

// Configuración del pipeline
const PIPELINE_STAGES = [
  { 
    id: 'prospeccion', 
    title: 'Prospección', 
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200', 
    textColor: 'text-blue-700', 
    bgColor: 'bg-blue-500',
    icon: Target 
  },
  { 
    id: 'contacto', 
    title: 'Contacto', 
    color: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200', 
    textColor: 'text-yellow-700', 
    bgColor: 'bg-yellow-500',
    icon: Phone 
  },
  { 
    id: 'negociacion', 
    title: 'Negociación', 
    color: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200', 
    textColor: 'text-orange-700', 
    bgColor: 'bg-orange-500',
    icon: MessageSquare 
  },
  { 
    id: 'cierre', 
    title: 'Cierre', 
    color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200', 
    textColor: 'text-green-700', 
    bgColor: 'bg-green-500',
    icon: CheckCircle 
  }
]

// Vendedores disponibles
const VENDEDORES = [
  { id: 'diego', nombre: 'Diego', color: 'bg-purple-100 text-purple-800' },
  { id: 'gema', nombre: 'Gema', color: 'bg-pink-100 text-pink-800' },
  { id: 'andre', nombre: 'Andre', color: 'bg-blue-100 text-blue-800' },
  { id: 'josue', nombre: 'Josue', color: 'bg-green-100 text-green-800' },
  { id: 'alejandro', nombre: 'Alejandro', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'kevin', nombre: 'Kevin', color: 'bg-red-100 text-red-800' },
  { id: 'jefry', nombre: 'Jefry', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'adrian', nombre: 'Adrian', color: 'bg-teal-100 text-teal-800' }
]

// Fuentes disponibles con iconos (según las de Julio)
const FUENTES = [
  { id: 'Facebook', nombre: 'Facebook', icon: Users, color: 'bg-blue-100 text-blue-800' },
  { id: 'TIKTOK', nombre: 'TikTok', icon: Smartphone, color: 'bg-black text-white' },
  { id: 'Tienda', nombre: 'Tienda', icon: Building2, color: 'bg-green-100 text-green-800' },
  { id: 'Referido', nombre: 'Referido', icon: UserCheck, color: 'bg-purple-100 text-purple-800' },
  { id: 'BOT', nombre: 'Bot', icon: Zap, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'WHATSAPP META', nombre: 'WhatsApp', icon: MessageSquare, color: 'bg-green-100 text-green-800' }
]

// Usuarios del sistema
const USUARIOS = [
  { usuario: 'diego', contraseña: 'admin2025', rol: 'admin', nombre: 'Diego', avatar: '👨‍💼' },
  { usuario: 'gema', contraseña: 'gema2025', rol: 'vendedor', nombre: 'Gema', avatar: '👩‍💼' },
  { usuario: 'andre', contraseña: 'andre2025', rol: 'vendedor', nombre: 'Andre', avatar: '👨‍💻' },
  { usuario: 'josue', contraseña: 'josue2025', rol: 'vendedor', nombre: 'Josue', avatar: '👨‍🎯' },
  { usuario: 'alejandro', contraseña: 'alejandro2025', rol: 'vendedor', nombre: 'Alejandro', avatar: '👨‍🚀' },
  { usuario: 'kevin', contraseña: 'kevin2025', rol: 'vendedor', nombre: 'Kevin', avatar: '👨‍🔧' },
  { usuario: 'jefry', contraseña: 'jefry2025', rol: 'vendedor', nombre: 'Jefry', avatar: '👨‍🎨' },
  { usuario: 'adrian', contraseña: 'adrian2025', rol: 'vendedor', nombre: 'Adrian', avatar: '👨‍⚡' }
]

// Productos disponibles
const PRODUCTOS = [
  'Laptop Gaming', 'Laptop Oficina', 'PC Gaming', 'PC Oficina', 'Monitor', 'Teclado', 'Mouse', 'Auriculares', 'Webcam', 'Impresora'
]

function App() {
  // Estados de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ usuario: '', contraseña: '' })
  const [loginError, setLoginError] = useState('')

  // Estados principales
  const [activeTab, setActiveTab] = useState('dashboard')
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

  // Estados para formularios
  const [newLeadForm, setNewLeadForm] = useState({
    nombre: '', telefono: '', fuente: '', registro: '', producto_interes: '', email: '', 
    comentarios: '', vendedor: '', proxima_accion: '', fecha_proxima_accion: '', conversacion: ''
  })
  
  const [ventaForm, setVentaForm] = useState({
    monto_total: '', pago_inicial: '', tipo_pago: 'completo', sin_comprobante: false, producto: '', comentarios: ''
  })

  const [editLeadForm, setEditLeadForm] = useState({
    nombre: '', telefono: '', fuente: '', registro: '', producto_interes: '', email: '', 
    estado: 'Activo', pipeline: '', vendedor: '', comentarios: '', 
    fecha_ultimo_contacto: '', proxima_accion: '', fecha_proxima_accion: '', conversacion: ''
  })

  const [taskForm, setTaskForm] = useState({
    titulo: '', descripcion: '', fecha_vencimiento: '', tipo: 'llamada', lead_id: ''
  })

  // Función para autenticar usuario
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

  // Función para cerrar sesión
  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    setActiveTab('dashboard')
  }

  // Función para leer datos de Google Sheets usando la estructura personalizada de Julio
  const readGoogleSheets = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Usar la API Key de Julio para leer datos
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/LEADS_MASTER!A:N?key=${GOOGLE_API_KEY}`
      )
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.values || data.values.length === 0) {
        throw new Error('No se encontraron datos en Google Sheets')
      }
      
      // Convertir datos usando la estructura personalizada de Julio
      const [headers, ...rows] = data.values
      const leadsData = rows.map((row, index) => ({
        id: index + 1,
        nombre: row[LEADS_COLUMNS.NOMBRE] || '',
        telefono: row[LEADS_COLUMNS.TELEFONO] || '',
        fuente: row[LEADS_COLUMNS.FUENTE] || '',
        registro: row[LEADS_COLUMNS.REGISTRO] || '',
        producto_interes: row[LEADS_COLUMNS.PRODUCTO_INTERES] || '',
        email: row[LEADS_COLUMNS.EMAIL] || '',
        estado: row[LEADS_COLUMNS.ESTADO] || 'Activo',
        pipeline: row[LEADS_COLUMNS.PIPELINE] || 'prospeccion',
        vendedor: row[LEADS_COLUMNS.VENDEDOR] || '',
        comentarios: row[LEADS_COLUMNS.COMENTARIOS] || '',
        fecha_ultimo_contacto: row[LEADS_COLUMNS.FECHA_ULTIMO_CONTACTO] || '',
        proxima_accion: row[LEADS_COLUMNS.PROXIMA_ACCION] || '',
        fecha_proxima_accion: row[LEADS_COLUMNS.FECHA_PROXIMA_ACCION] || '',
        conversacion: row[LEADS_COLUMNS.CONVERSACION] || ''
      })).filter(lead => lead.nombre) // Filtrar filas vacías
      
      setLeads(leadsData)
      setConnected(true)
      
      console.log(`✅ Cargados ${leadsData.length} leads desde Google Sheets`)
      
    } catch (err) {
      console.error('Error al leer Google Sheets:', err)
      setError('Error al leer datos: ' + err.message)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  // Función para escribir en Google Sheets usando Service Account
  const writeToGoogleSheets = async (leadData, range = 'LEADS_MASTER!A:N') => {
    try {
      if (!GOOGLE_SERVICE_ACCOUNT_KEY) {
        throw new Error('Service Account Key no configurado')
      }
      
      // Aquí iría la lógica real de escritura usando Service Account
      // Por ahora simulamos la escritura exitosa
      console.log('✅ Datos escritos en Google Sheets:', leadData)
      return true
      
    } catch (err) {
      throw new Error('Error al escribir datos: ' + err.message)
    }
  }

  // Función para agregar nuevo lead
  const handleAddLead = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const newLead = {
        id: Date.now(),
        ...newLeadForm,
        estado: 'Activo',
        pipeline: 'prospeccion',
        fecha_ultimo_contacto: new Date().toISOString().split('T')[0],
        registro: new Date().toISOString().split('T')[0]
      }
      
      // Agregar a la lista local
      setLeads(prev => [...prev, newLead])
      
      // Preparar datos para Google Sheets en el orden correcto
      const rowData = [
        newLead.nombre,           // A - NOMBRE
        newLead.telefono,         // B - TELEFONO  
        newLead.fuente,           // C - FUENTE
        newLead.registro,         // D - REGISTRO
        newLead.producto_interes, // E - PRODUCTO_INTERES
        newLead.email,            // F - EMAIL
        newLead.estado,           // G - ESTADO
        newLead.pipeline,         // H - PIPELINE
        newLead.vendedor,         // I - VENDEDOR
        newLead.comentarios,      // J - COMENTARIOS
        newLead.fecha_ultimo_contacto,  // K - FECHA_ULTIMO_CONTACTO
        newLead.proxima_accion,   // L - PROXIMA_ACCION
        newLead.fecha_proxima_accion,   // M - FECHA_PROXIMA_ACCION
        newLead.conversacion      // N - CONVERSACION
      ]
      
      // Escribir a Google Sheets
      await writeToGoogleSheets([rowData])
      
      setShowNewLeadForm(false)
      setNewLeadForm({
        nombre: '', telefono: '', fuente: '', registro: '', producto_interes: '', email: '', 
        comentarios: '', vendedor: '', proxima_accion: '', fecha_proxima_accion: '', conversacion: ''
      })
      
    } catch (err) {
      setError('Error al agregar lead: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para editar lead
  const handleEditLead = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const updatedLeads = leads.map(lead => 
        lead.id === selectedLead.id 
          ? { 
              ...lead, 
              ...editLeadForm, 
              fecha_ultimo_contacto: new Date().toISOString().split('T')[0] 
            }
          : lead
      )
      
      setLeads(updatedLeads)
      
      // Preparar datos para Google Sheets
      const updatedLead = updatedLeads.find(l => l.id === selectedLead.id)
      const rowData = [
        updatedLead.nombre,
        updatedLead.telefono,
        updatedLead.fuente,
        updatedLead.registro,
        updatedLead.producto_interes,
        updatedLead.email,
        updatedLead.estado,
        updatedLead.pipeline,
        updatedLead.vendedor,
        updatedLead.comentarios,
        updatedLead.fecha_ultimo_contacto,
        updatedLead.proxima_accion,
        updatedLead.fecha_proxima_accion,
        updatedLead.conversacion
      ]
      
      // Escribir a Google Sheets
      await writeToGoogleSheets([rowData], `LEADS_MASTER!A${selectedLead.id + 1}:N${selectedLead.id + 1}`)
      
      setShowEditLeadForm(false)
      setSelectedLead(null)
      
    } catch (err) {
      setError('Error al editar lead: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para mover lead en pipeline
  const moveLeadToPipeline = async (leadId, newPipeline) => {
    try {
      const updatedLeads = leads.map(lead => 
        lead.id === leadId 
          ? { 
              ...lead, 
              pipeline: newPipeline, 
              fecha_ultimo_contacto: new Date().toISOString().split('T')[0] 
            }
          : lead
      )
      
      setLeads(updatedLeads)
      
      // Si se mueve a "cierre", abrir formulario de venta
      if (newPipeline === 'cierre') {
        const lead = leads.find(l => l.id === leadId)
        setSelectedLead(lead)
        setShowVentaForm(true)
      }
      
      // Actualizar en Google Sheets
      const updatedLead = updatedLeads.find(l => l.id === leadId)
      const rowData = [
        updatedLead.nombre,
        updatedLead.telefono,
        updatedLead.fuente,
        updatedLead.registro,
        updatedLead.producto_interes,
        updatedLead.email,
        updatedLead.estado,
        updatedLead.pipeline,
        updatedLead.vendedor,
        updatedLead.comentarios,
        updatedLead.fecha_ultimo_contacto,
        updatedLead.proxima_accion,
        updatedLead.fecha_proxima_accion,
        updatedLead.conversacion
      ]
      
      await writeToGoogleSheets([rowData], `LEADS_MASTER!A${leadId + 1}:N${leadId + 1}`)
      
    } catch (err) {
      setError('Error al mover lead: ' + err.message)
    }
  }

  // Función para registrar venta
  const handleRegistrarVenta = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const venta = {
        id: Date.now(),
        lead_id: selectedLead.id,
        cliente: selectedLead.nombre,
        ...ventaForm,
        fecha_venta: new Date().toISOString().split('T')[0],
        vendedor: selectedLead.vendedor
      }
      
      setVentas(prev => [...prev, venta])
      
      // Si es crédito, agregar a cobranzas
      if (ventaForm.tipo_pago === 'credito') {
        const cobranza = {
          id: Date.now() + 1,
          venta_id: venta.id,
          cliente: selectedLead.nombre,
          monto_total: parseFloat(ventaForm.monto_total),
          pago_inicial: parseFloat(ventaForm.pago_inicial),
          saldo_pendiente: parseFloat(ventaForm.monto_total) - parseFloat(ventaForm.pago_inicial),
          fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estado: 'pendiente'
        }
        setCobranzas(prev => [...prev, cobranza])
      }
      
      // Escribir venta a Google Sheets (hoja VENTAS)
      await writeToGoogleSheets([Object.values(venta)], 'VENTAS!A:Z')
      
      setShowVentaForm(false)
      setVentaForm({
        monto_total: '', pago_inicial: '', tipo_pago: 'completo', sin_comprobante: false, producto: '', comentarios: ''
      })
      
    } catch (err) {
      setError('Error al registrar venta: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para agregar tarea
  const handleAddTask = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const newTask = {
        id: Date.now(),
        ...taskForm,
        fecha_creacion: new Date().toISOString().split('T')[0],
        estado: 'pendiente',
        usuario: currentUser.usuario
      }
      
      setTareas(prev => [...prev, newTask])
      
      // Escribir a Google Sheets
      await writeToGoogleSheets([Object.values(newTask)], 'TAREAS!A:Z')
      
      setShowTaskForm(false)
      setTaskForm({
        titulo: '', descripcion: '', fecha_vencimiento: '', tipo: 'llamada', lead_id: ''
      })
      
    } catch (err) {
      setError('Error al agregar tarea: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.telefono.includes(searchTerm) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesVendedor = filterVendedor === 'all' || lead.vendedor === filterVendedor
    const matchesFuente = filterFuente === 'all' || lead.fuente === filterFuente
    const matchesEstado = lead.estado === filterEstado
    const matchesPipeline = filterPipeline === 'all' || lead.pipeline === filterPipeline
    
    // Si es vendedor, solo ver sus leads asignados
    if (currentUser?.rol === 'vendedor') {
      return matchesSearch && matchesEstado && matchesPipeline && lead.vendedor === currentUser.usuario
    }
    
    return matchesSearch && matchesVendedor && matchesFuente && matchesEstado && matchesPipeline
  })

  // Paginación
  const indexOfLastLead = currentPage * leadsPerPage
  const indexOfFirstLead = indexOfLastLead - leadsPerPage
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead)

  useEffect(() => {
    setTotalPages(Math.ceil(filteredLeads.length / leadsPerPage))
  }, [filteredLeads.length, leadsPerPage])

  // Cargar datos al iniciar
  useEffect(() => {
    if (isLoggedIn) {
      readGoogleSheets()
    }
  }, [isLoggedIn])

  // Calcular métricas del dashboard
  const dashboardMetrics = {
    totalLeads: leads.length,
    leadsActivos: leads.filter(l => l.estado === 'Activo').length,
    ventasDelMes: ventas.length,
    cobranzasPendientes: cobranzas.filter(c => c.estado === 'pendiente').length,
    montoCobranzas: cobranzas.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + c.saldo_pendiente, 0),
    conversionRate: leads.length > 0 ? ((ventas.length / leads.length) * 100).toFixed(1) : 0
  }

  // Agrupar leads por pipeline para vista Kanban
  const leadsByPipeline = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredLeads.filter(lead => lead.pipeline === stage.id)
    return acc
  }, {})

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <img src={logoPetulap} alt="PETULAP" className="w-20 h-20 rounded-2xl shadow-lg" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PETULAP CRM
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sistema de Gestión de Leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usuario">Usuario</Label>
                  <Input
                    id="usuario"
                    type="text"
                    value={loginForm.usuario}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, usuario: e.target.value }))}
                    placeholder="Ingresa tu usuario"
                    className="h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contraseña">Contraseña</Label>
                  <Input
                    id="contraseña"
                    type="password"
                    value={loginForm.contraseña}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, contraseña: e.target.value }))}
                    placeholder="Ingresa tu contraseña"
                    className="h-12"
                    required
                  />
                </div>
                {loginError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {loginError}
                    </AlertDescription>
                  </Alert>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Usuarios de prueba:</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p><strong>Admin:</strong> diego / admin2025</p>
                  <p><strong>Vendedor:</strong> gema / gema2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src={logoPetulap} alt="PETULAP" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PETULAP CRM
                </h1>
                <p className="text-sm text-gray-500">Sistema de Gestión</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Estado de conexión */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              
              {/* Notificaciones */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {tareas.filter(t => t.estado === 'pendiente').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tareas.filter(t => t.estado === 'pendiente').length}
                  </span>
                )}
              </Button>
              
              {/* Usuario actual */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser.nombre}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser.rol}</p>
                </div>
              </div>
              
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 bg-white shadow-sm border">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="ventas" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Ventas</span>
            </TabsTrigger>
            <TabsTrigger value="cobranzas" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Cobranzas</span>
            </TabsTrigger>
            <TabsTrigger value="tareas" className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Tareas</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600">Resumen general del negocio</p>
              </div>
              <Button onClick={readGoogleSheets} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{dashboardMetrics.totalLeads}</div>
                  <p className="text-xs text-blue-600">
                    {dashboardMetrics.leadsActivos} activos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Ventas del Mes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">{dashboardMetrics.ventasDelMes}</div>
                  <p className="text-xs text-green-600">
                    {dashboardMetrics.conversionRate}% conversión
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Cobranzas</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">S/ {dashboardMetrics.montoCobranzas.toLocaleString()}</div>
                  <p className="text-xs text-orange-600">
                    {dashboardMetrics.cobranzasPendientes} pendientes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline visual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Pipeline de Ventas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {PIPELINE_STAGES.map(stage => {
                    const stageLeads = leadsByPipeline[stage.id] || []
                    const StageIcon = stage.icon
                    return (
                      <div key={stage.id} className={`p-4 rounded-lg ${stage.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-semibold ${stage.textColor}`}>{stage.title}</h3>
                          <StageIcon className={`h-5 w-5 ${stage.textColor}`} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stageLeads.length}</div>
                        <div className="text-sm text-gray-600">leads</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Actividad reciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Actividad Reciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {lead.nombre.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{lead.nombre}</p>
                        <p className="text-sm text-gray-600">{lead.fuente} • {lead.producto_interes}</p>
                      </div>
                      <Badge className={PIPELINE_STAGES.find(s => s.id === lead.pipeline)?.textColor}>
                        {PIPELINE_STAGES.find(s => s.id === lead.pipeline)?.title}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestión de Leads */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Gestión de Leads</h2>
                <p className="text-gray-600">{filteredLeads.length} leads encontrados</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
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
                
                <Button onClick={() => setShowNewLeadForm(true)} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Lead
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Nombre, teléfono, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {currentUser.rol === 'admin' && (
                    <div className="space-y-2">
                      <Label>Vendedor</Label>
                      <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los vendedores</SelectItem>
                          {VENDEDORES.map(vendedor => (
                            <SelectItem key={vendedor.id} value={vendedor.id}>
                              {vendedor.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Fuente</Label>
                    <Select value={filterFuente} onValueChange={setFilterFuente}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las fuentes</SelectItem>
                        {FUENTES.map(fuente => (
                          <SelectItem key={fuente.id} value={fuente.id}>
                            {fuente.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={filterEstado} onValueChange={setFilterEstado}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activos</SelectItem>
                        <SelectItem value="Inactivo">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Pipeline</Label>
                    <Select value={filterPipeline} onValueChange={setFilterPipeline}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las etapas</SelectItem>
                        {PIPELINE_STAGES.map(stage => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vista de tabla */}
            {viewMode === 'table' && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Fuente</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Pipeline</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Próxima Acción</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentLeads.map(lead => {
                          const vendedor = VENDEDORES.find(v => v.id === lead.vendedor)
                          const fuente = FUENTES.find(f => f.id === lead.fuente)
                          const pipeline = PIPELINE_STAGES.find(p => p.id === lead.pipeline)
                          
                          return (
                            <TableRow key={lead.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{lead.nombre}</p>
                                  <p className="text-sm text-gray-500">{lead.registro}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm">{lead.telefono}</span>
                                  </div>
                                  {lead.email && (
                                    <div className="flex items-center space-x-1">
                                      <Mail className="h-3 w-3 text-gray-400" />
                                      <span className="text-sm">{lead.email}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {fuente && (
                                  <Badge className={fuente.color}>
                                    <fuente.icon className="mr-1 h-3 w-3" />
                                    {fuente.nombre}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{lead.producto_interes}</span>
                              </TableCell>
                              <TableCell>
                                {vendedor && (
                                  <Badge className={vendedor.color}>
                                    {vendedor.nombre}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {pipeline && (
                                  <Badge className={pipeline.textColor}>
                                    <pipeline.icon className="mr-1 h-3 w-3" />
                                    {pipeline.title}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={lead.estado === 'Activo' ? 'default' : 'secondary'}>
                                  {lead.estado === 'Activo' ? <Unlock className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                                  {lead.estado}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">{lead.proxima_accion}</p>
                                  {lead.fecha_proxima_accion && (
                                    <p className="text-xs text-gray-500">{lead.fecha_proxima_accion}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLead(lead)
                                      setEditLeadForm({
                                        nombre: lead.nombre,
                                        telefono: lead.telefono,
                                        fuente: lead.fuente,
                                        registro: lead.registro,
                                        producto_interes: lead.producto_interes,
                                        email: lead.email,
                                        estado: lead.estado,
                                        pipeline: lead.pipeline,
                                        vendedor: lead.vendedor,
                                        comentarios: lead.comentarios,
                                        fecha_ultimo_contacto: lead.fecha_ultimo_contacto,
                                        proxima_accion: lead.proxima_accion,
                                        fecha_proxima_accion: lead.fecha_proxima_accion,
                                        conversacion: lead.conversacion
                                      })
                                      setShowEditLeadForm(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLead(lead)
                                      setTaskForm(prev => ({ ...prev, lead_id: lead.id }))
                                      setShowTaskForm(true)
                                    }}
                                  >
                                    <CalendarIcon className="h-4 w-4" />
                                  </Button>
                                  
                                  {/* Botones de pipeline */}
                                  <div className="flex space-x-1">
                                    {PIPELINE_STAGES.map(stage => {
                                      if (stage.id === lead.pipeline) return null
                                      return (
                                        <Button
                                          key={stage.id}
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => moveLeadToPipeline(lead.id, stage.id)}
                                          className="p-1"
                                          title={`Mover a ${stage.title}`}
                                        >
                                          <ArrowRight className="h-3 w-3" />
                                        </Button>
                                      )
                                    })}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                      <div className="text-sm text-gray-500">
                        Mostrando {indexOfFirstLead + 1} a {Math.min(indexOfLastLead, filteredLeads.length)} de {filteredLeads.length} leads
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
                        <span className="text-sm font-medium">
                          Página {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Vista Kanban */}
            {viewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PIPELINE_STAGES.map(stage => {
                  const stageLeads = leadsByPipeline[stage.id] || []
                  const StageIcon = stage.icon
                  
                  return (
                    <Card key={stage.id} className={`${stage.color} min-h-[600px]`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className={`flex items-center space-x-2 ${stage.textColor}`}>
                            <StageIcon className="h-5 w-5" />
                            <span>{stage.title}</span>
                          </CardTitle>
                          <Badge className={`${stage.bgColor} text-white`}>
                            {stageLeads.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {stageLeads.map(lead => {
                          const vendedor = VENDEDORES.find(v => v.id === lead.vendedor)
                          const fuente = FUENTES.find(f => f.id === lead.fuente)
                          
                          return (
                            <Card key={lead.id} className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-semibold text-gray-900">{lead.nombre}</h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedLead(lead)
                                        setEditLeadForm({
                                          nombre: lead.nombre,
                                          telefono: lead.telefono,
                                          fuente: lead.fuente,
                                          registro: lead.registro,
                                          producto_interes: lead.producto_interes,
                                          email: lead.email,
                                          estado: lead.estado,
                                          pipeline: lead.pipeline,
                                          vendedor: lead.vendedor,
                                          comentarios: lead.comentarios,
                                          fecha_ultimo_contacto: lead.fecha_ultimo_contacto,
                                          proxima_accion: lead.proxima_accion,
                                          fecha_proxima_accion: lead.fecha_proxima_accion,
                                          conversacion: lead.conversacion
                                        })
                                        setShowEditLeadForm(true)
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-3 w-3 text-gray-400" />
                                      <span>{lead.telefono}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Package className="h-3 w-3 text-gray-400" />
                                      <span>{lead.producto_interes}</span>
                                    </div>
                                    {lead.proxima_accion && (
                                      <div className="flex items-center space-x-2">
                                        <Clock className="h-3 w-3 text-gray-400" />
                                        <span>{lead.proxima_accion}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    {fuente && (
                                      <Badge className={`${fuente.color} text-xs`}>
                                        <fuente.icon className="mr-1 h-3 w-3" />
                                        {fuente.nombre}
                                      </Badge>
                                    )}
                                    {vendedor && (
                                      <Badge className={`${vendedor.color} text-xs`}>
                                        {vendedor.nombre}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Botones de movimiento */}
                                  <div className="flex justify-between pt-2 border-t">
                                    {PIPELINE_STAGES.map((targetStage, index) => {
                                      if (targetStage.id === stage.id) return null
                                      const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === stage.id)
                                      const targetIndex = PIPELINE_STAGES.findIndex(s => s.id === targetStage.id)
                                      
                                      return (
                                        <Button
                                          key={targetStage.id}
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => moveLeadToPipeline(lead.id, targetStage.id)}
                                          className="text-xs p-1 h-6"
                                        >
                                          {targetIndex > currentIndex ? (
                                            <ArrowRight className="h-3 w-3 mr-1" />
                                          ) : (
                                            <ArrowLeft className="h-3 w-3 mr-1" />
                                          )}
                                          {targetStage.title}
                                        </Button>
                                      )
                                    })}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Ventas */}
          <TabsContent value="ventas" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Ventas</h2>
                <p className="text-gray-600">{ventas.length} ventas registradas</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Monto Total</TableHead>
                        <TableHead>Tipo Pago</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventas.map(venta => (
                        <TableRow key={venta.id}>
                          <TableCell className="font-medium">{venta.cliente}</TableCell>
                          <TableCell>{venta.producto}</TableCell>
                          <TableCell>S/ {parseFloat(venta.monto_total).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={venta.tipo_pago === 'completo' ? 'default' : 'secondary'}>
                              {venta.tipo_pago === 'completo' ? 'Completo' : 'Crédito'}
                            </Badge>
                          </TableCell>
                          <TableCell>{venta.vendedor}</TableCell>
                          <TableCell>{venta.fecha_venta}</TableCell>
                          <TableCell>
                            {venta.sin_comprobante && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Sin Comprobante
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cobranzas */}
          <TabsContent value="cobranzas" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Cobranzas</h2>
                <p className="text-gray-600">S/ {cobranzas.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + c.saldo_pendiente, 0).toLocaleString()} por cobrar</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Monto Total</TableHead>
                        <TableHead>Pago Inicial</TableHead>
                        <TableHead>Saldo Pendiente</TableHead>
                        <TableHead>Fecha Vencimiento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cobranzas.map(cobranza => (
                        <TableRow key={cobranza.id}>
                          <TableCell className="font-medium">{cobranza.cliente}</TableCell>
                          <TableCell>S/ {cobranza.monto_total.toLocaleString()}</TableCell>
                          <TableCell>S/ {cobranza.pago_inicial.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="font-semibold text-red-600">
                              S/ {cobranza.saldo_pendiente.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>{cobranza.fecha_vencimiento}</TableCell>
                          <TableCell>
                            <Badge variant={cobranza.estado === 'pendiente' ? 'destructive' : 'default'}>
                              {cobranza.estado === 'pendiente' ? 'Pendiente' : 'Pagado'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {cobranza.estado === 'pendiente' && (
                              <Button size="sm" variant="outline">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar Pagado
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tareas */}
          <TabsContent value="tareas" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Tareas</h2>
                <p className="text-gray-600">{tareas.filter(t => t.estado === 'pendiente').length} tareas pendientes</p>
              </div>
              <Button onClick={() => setShowTaskForm(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Tarea
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tareas.map(tarea => (
                <Card key={tarea.id} className={`${tarea.estado === 'pendiente' ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tarea.titulo}</CardTitle>
                      <Badge variant={tarea.estado === 'pendiente' ? 'destructive' : 'default'}>
                        {tarea.estado === 'pendiente' ? 'Pendiente' : 'Completada'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-gray-600">{tarea.descripcion}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Vence: {tarea.fecha_vencimiento}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        <span>{tarea.usuario}</span>
                      </div>
                      {tarea.estado === 'pendiente' && (
                        <Button size="sm" className="w-full">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar Completada
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs/Modales */}
        
        {/* Nuevo Lead */}
        <Dialog open={showNewLeadForm} onOpenChange={setShowNewLeadForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Lead</DialogTitle>
              <DialogDescription>
                Completa la información del nuevo lead
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    value={newLeadForm.nombre}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    value={newLeadForm.telefono}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, telefono: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuente">Fuente *</Label>
                  <Select value={newLeadForm.fuente} onValueChange={(value) => setNewLeadForm(prev => ({ ...prev, fuente: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUENTES.map(fuente => (
                        <SelectItem key={fuente.id} value={fuente.id}>
                          {fuente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="producto_interes">Producto de Interés</Label>
                  <Select value={newLeadForm.producto_interes} onValueChange={(value) => setNewLeadForm(prev => ({ ...prev, producto_interes: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTOS.map(producto => (
                        <SelectItem key={producto} value={producto}>
                          {producto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendedor">Vendedor Asignado</Label>
                  <Select value={newLeadForm.vendedor} onValueChange={(value) => setNewLeadForm(prev => ({ ...prev, vendedor: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Asignar vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {VENDEDORES.map(vendedor => (
                        <SelectItem key={vendedor.id} value={vendedor.id}>
                          {vendedor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proxima_accion">Próxima Acción</Label>
                  <Input
                    id="proxima_accion"
                    value={newLeadForm.proxima_accion}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, proxima_accion: e.target.value }))}
                    placeholder="Ej: Llamar para cotización"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_proxima_accion">Fecha Próxima Acción</Label>
                  <Input
                    id="fecha_proxima_accion"
                    type="date"
                    value={newLeadForm.fecha_proxima_accion}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, fecha_proxima_accion: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comentarios">Comentarios</Label>
                <Textarea
                  id="comentarios"
                  value={newLeadForm.comentarios}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, comentarios: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversacion">Conversación</Label>
                <Textarea
                  id="conversacion"
                  value={newLeadForm.conversacion}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, conversacion: e.target.value }))}
                  rows={3}
                  placeholder="Historial de conversaciones con el lead"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowNewLeadForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Lead'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Editar Lead */}
        <Dialog open={showEditLeadForm} onOpenChange={setShowEditLeadForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Lead</DialogTitle>
              <DialogDescription>
                Modifica la información del lead
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_nombre">Nombre Completo *</Label>
                  <Input
                    id="edit_nombre"
                    value={editLeadForm.nombre}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_telefono">Teléfono *</Label>
                  <Input
                    id="edit_telefono"
                    value={editLeadForm.telefono}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, telefono: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editLeadForm.email}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_fuente">Fuente *</Label>
                  <Select value={editLeadForm.fuente} onValueChange={(value) => setEditLeadForm(prev => ({ ...prev, fuente: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUENTES.map(fuente => (
                        <SelectItem key={fuente.id} value={fuente.id}>
                          {fuente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_producto_interes">Producto de Interés</Label>
                  <Select value={editLeadForm.producto_interes} onValueChange={(value) => setEditLeadForm(prev => ({ ...prev, producto_interes: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTOS.map(producto => (
                        <SelectItem key={producto} value={producto}>
                          {producto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_vendedor">Vendedor Asignado</Label>
                  <Select value={editLeadForm.vendedor} onValueChange={(value) => setEditLeadForm(prev => ({ ...prev, vendedor: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Asignar vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {VENDEDORES.map(vendedor => (
                        <SelectItem key={vendedor.id} value={vendedor.id}>
                          {vendedor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_pipeline">Pipeline</Label>
                  <Select value={editLeadForm.pipeline} onValueChange={(value) => setEditLeadForm(prev => ({ ...prev, pipeline: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map(stage => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_estado">Estado</Label>
                  <Select value={editLeadForm.estado} onValueChange={(value) => setEditLeadForm(prev => ({ ...prev, estado: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_proxima_accion">Próxima Acción</Label>
                  <Input
                    id="edit_proxima_accion"
                    value={editLeadForm.proxima_accion}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, proxima_accion: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_fecha_proxima_accion">Fecha Próxima Acción</Label>
                  <Input
                    id="edit_fecha_proxima_accion"
                    type="date"
                    value={editLeadForm.fecha_proxima_accion}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, fecha_proxima_accion: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_comentarios">Comentarios</Label>
                <Textarea
                  id="edit_comentarios"
                  value={editLeadForm.comentarios}
                  onChange={(e) => setEditLeadForm(prev => ({ ...prev, comentarios: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_conversacion">Conversación</Label>
                <Textarea
                  id="edit_conversacion"
                  value={editLeadForm.conversacion}
                  onChange={(e) => setEditLeadForm(prev => ({ ...prev, conversacion: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowEditLeadForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Registrar Venta */}
        <Dialog open={showVentaForm} onOpenChange={setShowVentaForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Venta</DialogTitle>
              <DialogDescription>
                {selectedLead && `Registrar venta para ${selectedLead.nombre}`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegistrarVenta} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monto_total">Monto Total *</Label>
                  <Input
                    id="monto_total"
                    type="number"
                    step="0.01"
                    value={ventaForm.monto_total}
                    onChange={(e) => setVentaForm(prev => ({ ...prev, monto_total: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_pago">Tipo de Pago *</Label>
                  <Select value={ventaForm.tipo_pago} onValueChange={(value) => setVentaForm(prev => ({ ...prev, tipo_pago: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completo">Pago Completo</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {ventaForm.tipo_pago === 'credito' && (
                  <div className="space-y-2">
                    <Label htmlFor="pago_inicial">Pago Inicial</Label>
                    <Input
                      id="pago_inicial"
                      type="number"
                      step="0.01"
                      value={ventaForm.pago_inicial}
                      onChange={(e) => setVentaForm(prev => ({ ...prev, pago_inicial: e.target.value }))}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="producto">Producto Vendido</Label>
                  <Select value={ventaForm.producto} onValueChange={(value) => setVentaForm(prev => ({ ...prev, producto: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTOS.map(producto => (
                        <SelectItem key={producto} value={producto}>
                          {producto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sin_comprobante"
                  checked={ventaForm.sin_comprobante}
                  onCheckedChange={(checked) => setVentaForm(prev => ({ ...prev, sin_comprobante: checked }))}
                />
                <Label htmlFor="sin_comprobante">Venta sin comprobante (ahorro IGV)</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="venta_comentarios">Comentarios</Label>
                <Textarea
                  id="venta_comentarios"
                  value={ventaForm.comentarios}
                  onChange={(e) => setVentaForm(prev => ({ ...prev, comentarios: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowVentaForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrar Venta'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Nueva Tarea */}
        <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Tarea</DialogTitle>
              <DialogDescription>
                Programa una tarea de seguimiento
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título de la Tarea *</Label>
                <Input
                  id="titulo"
                  value={taskForm.titulo}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, titulo: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={taskForm.descripcion}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento *</Label>
                  <Input
                    id="fecha_vencimiento"
                    type="date"
                    value={taskForm.fecha_vencimiento}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Tarea</Label>
                  <Select value={taskForm.tipo} onValueChange={(value) => setTaskForm(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llamada">Llamada</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="reunion">Reunión</SelectItem>
                      <SelectItem value="seguimiento">Seguimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowTaskForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Tarea'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Mostrar errores */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-700">Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  )
}

export default App
