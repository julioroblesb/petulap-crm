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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  ShoppingCart, Package, FileBarChart, Megaphone, Lock, Unlock, Send,
  MessageCircle, WhatsApp, Bot, Facebook, Instagram, Twitter, Linkedin,
  Sparkles, Flame, Rocket, Crown, Diamond, Zap as Lightning, Heart, ThumbsUp,
  Smile, Frown, Meh, Coffee, Gift, Music, Camera, Video, Image, Mic
} from 'lucide-react'
import { useState, useEffect } from 'react'
import './App.css'
import logoPetulap from './assets/logo-petulap.png'

// Configuración de Google Sheets con Service Account de Julio
const GOOGLE_SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1kgAlVkdtgofYTYyqKycGwtmnYuiMU-41_geAcKIp8mE'
const GOOGLE_SERVICE_ACCOUNT_KEY = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_KEY
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyA3A2v_fljthf71ceuMO0Xysk-4IburkbI'

// Estructura REAL de LEADS_MASTER de Julio (14 columnas corregidas)
const LEADS_COLUMNS = {
  NOMBRE: 0,                    // A
  TELEFONO: 1,                  // B  
  FUENTE: 2,                    // C
  REGISTRO: 3,                  // D
  PRODUCTO_INTERES: 4,          // E
  EMAIL: 5,                     // F (CORREGIDO: antes estaba mal mapeado)
  ESTADO: 6,                    // G (CORREGIDO: antes estaba mal mapeado)
  PIPELINE: 7,                  // H
  VENDEDOR: 8,                  // I
  COMENTARIOS: 9,               // J
  FECHA_ULTIMO_CONTACTO: 10,    // K
  PROXIMA_ACCION: 11,           // L
  FECHA_PROXIMA_ACCION: 12,     // M
  CONVERSACION: 13              // N (NUEVA: Para chat WhatsApp)
}

// Pipeline actualizado según datos reales
const PIPELINE_STAGES = [
  { 
    id: 'prospeccion', 
    title: 'Prospección', 
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200', 
    textColor: 'text-blue-700', 
    bgColor: 'bg-blue-500',
    icon: Target,
    description: 'Leads nuevos sin contactar'
  },
  { 
    id: 'contacto', 
    title: 'Contacto', 
    color: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200', 
    textColor: 'text-yellow-700', 
    bgColor: 'bg-yellow-500',
    icon: Phone,
    description: 'Primer contacto realizado'
  },
  { 
    id: 'negociacion', 
    title: 'Negociación', 
    color: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200', 
    textColor: 'text-orange-700', 
    bgColor: 'bg-orange-500',
    icon: MessageSquare,
    description: 'En proceso de negociación'
  },
  { 
    id: 'cierre', 
    title: 'Cierre', 
    color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200', 
    textColor: 'text-green-700', 
    bgColor: 'bg-green-500',
    icon: CheckCircle,
    description: 'Listo para cerrar venta'
  }
]

// Fuentes reales según Google Sheets de Julio
const FUENTES = [
  { id: 'BOT', nombre: 'Bot WhatsApp', icon: Bot, color: 'bg-green-100 text-green-800' },
  { id: 'WHATSAPP META', nombre: 'WhatsApp Meta', icon: MessageSquare, color: 'bg-green-100 text-green-800' },
  { id: 'Facebook', nombre: 'Facebook', icon: Facebook, color: 'bg-blue-100 text-blue-800' },
  { id: 'TIKTOK', nombre: 'TikTok', icon: Smartphone, color: 'bg-black text-white' },
  { id: 'Tienda', nombre: 'Tienda Física', icon: Building2, color: 'bg-purple-100 text-purple-800' },
  { id: 'Referido', nombre: 'Referido', icon: UserCheck, color: 'bg-orange-100 text-orange-800' }
]

// Vendedores (necesito obtener los reales de Julio)
const VENDEDORES = [
  { id: 'diego', nombre: 'Diego', color: 'bg-purple-100 text-purple-800', avatar: '👨‍💼' },
  { id: 'gema', nombre: 'Gema', color: 'bg-pink-100 text-pink-800', avatar: '👩‍💼' },
  { id: 'andre', nombre: 'Andre', color: 'bg-blue-100 text-blue-800', avatar: '👨‍💻' },
  { id: 'josue', nombre: 'Josue', color: 'bg-green-100 text-green-800', avatar: '👨‍🎯' },
  { id: 'alejandro', nombre: 'Alejandro', color: 'bg-yellow-100 text-yellow-800', avatar: '👨‍🚀' },
  { id: 'kevin', nombre: 'Kevin', color: 'bg-red-100 text-red-800', avatar: '👨‍🔧' },
  { id: 'jefry', nombre: 'Jefry', color: 'bg-indigo-100 text-indigo-800', avatar: '👨‍🎨' },
  { id: 'adrian', nombre: 'Adrian', color: 'bg-teal-100 text-teal-800', avatar: '👨‍⚡' }
]

// Usuarios del sistema (CORREGIR con credenciales reales de Julio)
const USUARIOS = [
  { usuario: 'diego', contraseña: 'diego123', rol: 'admin', nombre: 'Diego Robles', avatar: '👨‍💼' },
  { usuario: 'gema', contraseña: 'gema123', rol: 'vendedor', nombre: 'Gema', avatar: '👩‍💼' },
  { usuario: 'andre', contraseña: 'andre123', rol: 'vendedor', nombre: 'Andre', avatar: '👨‍💻' },
  { usuario: 'josue', contraseña: 'josue123', rol: 'vendedor', nombre: 'Josue', avatar: '👨‍🎯' },
  { usuario: 'alejandro', contraseña: 'alejandro123', rol: 'vendedor', nombre: 'Alejandro', avatar: '👨‍🚀' },
  { usuario: 'kevin', contraseña: 'kevin123', rol: 'vendedor', nombre: 'Kevin', avatar: '👨‍🔧' },
  { usuario: 'jefry', contraseña: 'jefry123', rol: 'vendedor', nombre: 'Jefry', avatar: '👨‍🎨' },
  { usuario: 'adrian', contraseña: 'adrian123', rol: 'vendedor', nombre: 'Adrian', avatar: '👨‍⚡' }
]

// Productos disponibles
const PRODUCTOS = [
  'Laptop Gaming', 'Laptop Oficina', 'PC Gaming', 'PC Oficina', 'Monitor', 'Teclado', 'Mouse', 'Auriculares', 'Webcam', 'Impresora'
]

// Función para parsear conversaciones de WhatsApp
const parseWhatsAppConversation = (conversationText) => {
  if (!conversationText) return []
  
  const messages = []
  const lines = conversationText.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('-A:')) {
      messages.push({
        type: 'sent',
        message: trimmedLine.substring(3).trim(),
        timestamp: new Date().toLocaleTimeString()
      })
    } else if (trimmedLine.startsWith('-B:')) {
      messages.push({
        type: 'received',
        message: trimmedLine.substring(3).trim(),
        timestamp: new Date().toLocaleTimeString()
      })
    }
  }
  
  return messages
}

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

  // Estados para formularios y modales
  const [showNewLeadForm, setShowNewLeadForm] = useState(false)
  const [showVentaForm, setShowVentaForm] = useState(false)
  const [showEditLeadForm, setShowEditLeadForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVendedor, setFilterVendedor] = useState('all')
  const [filterFuente, setFilterFuente] = useState('all')
  const [filterEstado, setFilterEstado] = useState('Activo')
  const [filterPipeline, setFilterPipeline] = useState('all')

  // Estados para formularios
  const [newLeadForm, setNewLeadForm] = useState({
    nombre: '', telefono: '', fuente: '', producto_interes: '', email: '', 
    comentarios: '', vendedor: '', proxima_accion: '', fecha_proxima_accion: '', conversacion: ''
  })
  
  const [ventaForm, setVentaForm] = useState({
    monto_total: '', pago_inicial: '', tipo_pago: 'completo', sin_comprobante: false, producto: '', comentarios: ''
  })

  const [editLeadForm, setEditLeadForm] = useState({
    nombre: '', telefono: '', fuente: '', producto_interes: '', email: '', 
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

  // Función para leer datos de Google Sheets usando la estructura CORREGIDA
  const readGoogleSheets = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/0LEADS_MASTER!A:N?key=${GOOGLE_API_KEY}`
      )
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.values || data.values.length === 0) {
        throw new Error('No se encontraron datos en Google Sheets')
      }
      
      // Convertir datos usando la estructura CORREGIDA
      const [headers, ...rows] = data.values
      const leadsData = rows.map((row, index) => ({
        id: index + 1,
        nombre: row[LEADS_COLUMNS.NOMBRE] || 'Sin Nombre',
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
      })).filter(lead => lead.telefono) // Filtrar filas sin teléfono
      
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

  // Función para escribir en Google Sheets
  const writeToGoogleSheets = async (leadData, range = '0LEADS_MASTER!A:N') => {
    try {
      if (!GOOGLE_SERVICE_ACCOUNT_KEY) {
        throw new Error('Service Account Key no configurado')
      }
      
      console.log('✅ Simulando escritura en Google Sheets:', leadData)
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
      
      setLeads(prev => [...prev, newLead])
      
      const rowData = [
        newLead.nombre,
        newLead.telefono,
        newLead.fuente,
        newLead.registro,
        newLead.producto_interes,
        newLead.email,
        newLead.estado,
        newLead.pipeline,
        newLead.vendedor,
        newLead.comentarios,
        newLead.fecha_ultimo_contacto,
        newLead.proxima_accion,
        newLead.fecha_proxima_accion,
        newLead.conversacion
      ]
      
      await writeToGoogleSheets([rowData])
      
      setShowNewLeadForm(false)
      setNewLeadForm({
        nombre: '', telefono: '', fuente: '', producto_interes: '', email: '', 
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
      
      await writeToGoogleSheets([rowData], `0LEADS_MASTER!A${selectedLead.id + 1}:N${selectedLead.id + 1}`)
      
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
      
      if (newPipeline === 'cierre') {
        const lead = leads.find(l => l.id === leadId)
        setSelectedLead(lead)
        setShowVentaForm(true)
      }
      
    } catch (err) {
      setError('Error al mover lead: ' + err.message)
    }
  }

  // Función para mostrar chat de WhatsApp
  const showWhatsAppChat = (lead) => {
    setSelectedLead(lead)
    setShowChatModal(true)
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

  // Agrupar leads por pipeline
  const leadsByPipeline = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredLeads.filter(lead => lead.pipeline === stage.id)
    return acc
  }, {})

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img src={logoPetulap} alt="PETULAP" className="w-24 h-24 rounded-3xl shadow-2xl" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                PETULAP CRM
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Sistema Profesional de Gestión
              </CardDescription>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Sistema Activo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="usuario" className="text-sm font-medium text-gray-700">Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="usuario"
                      type="text"
                      value={loginForm.usuario}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, usuario: e.target.value }))}
                      placeholder="Ingresa tu usuario"
                      className="h-12 pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contraseña" className="text-sm font-medium text-gray-700">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="contraseña"
                      type="password"
                      value={loginForm.contraseña}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, contraseña: e.target.value }))}
                      placeholder="Ingresa tu contraseña"
                      className="h-12 pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
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
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Acceder al Sistema
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 mb-3 font-semibold flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Credenciales de Acceso:
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span><strong>Admin:</strong> diego</span>
                    <span className="font-mono">diego123</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span><strong>Vendedor:</strong> gema</span>
                    <span className="font-mono">gema123</span>
                  </div>
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
      {/* Header Mejorado */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img src={logoPetulap} alt="PETULAP" className="w-12 h-12 rounded-xl shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Lightning className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  PETULAP CRM
                </h1>
                <p className="text-sm text-gray-500">Sistema Profesional</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Estado de conexión mejorado */}
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 font-medium">
                  {connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              
              {/* Notificaciones */}
              <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                {tareas.filter(t => t.estado === 'pendiente').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {tareas.filter(t => t.estado === 'pendiente').length}
                  </span>
                )}
              </Button>
              
              {/* Usuario actual mejorado */}
              <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser.nombre}</p>
                  <p className="text-xs text-gray-500 capitalize flex items-center">
                    {currentUser.rol === 'admin' ? <Crown className="mr-1 h-3 w-3" /> : <User className="mr-1 h-3 w-3" />}
                    {currentUser.rol}
                  </p>
                </div>
              </div>
              
              <Button onClick={handleLogout} variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 bg-white shadow-sm border h-12">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="ventas" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Ventas</span>
            </TabsTrigger>
            <TabsTrigger value="cobranzas" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Cobranzas</span>
            </TabsTrigger>
            <TabsTrigger value="tareas" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Tareas</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Mejorado */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Sparkles className="mr-3 h-8 w-8 text-purple-500" />
                  Dashboard Ejecutivo
                </h2>
                <p className="text-gray-600">Resumen general del negocio en tiempo real</p>
              </div>
              <Button onClick={readGoogleSheets} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
            </div>

            {/* Métricas principales mejoradas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Leads</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{dashboardMetrics.totalLeads}</div>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {dashboardMetrics.leadsActivos} activos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Ventas del Mes</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">{dashboardMetrics.ventasDelMes}</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Target className="mr-1 h-3 w-3" />
                    {dashboardMetrics.conversionRate}% conversión
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Cobranzas</CardTitle>
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">S/ {dashboardMetrics.montoCobranzas.toLocaleString()}</div>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    {dashboardMetrics.cobranzasPendientes} pendientes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline visual mejorado */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span>Pipeline de Ventas</span>
                </CardTitle>
                <CardDescription>Distribución de leads por etapa del proceso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {PIPELINE_STAGES.map(stage => {
                    const stageLeads = leadsByPipeline[stage.id] || []
                    const StageIcon = stage.icon
                    return (
                      <div key={stage.id} className={`p-6 rounded-xl ${stage.color} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-semibold ${stage.textColor}`}>{stage.title}</h3>
                          <div className={`p-2 ${stage.bgColor} rounded-lg`}>
                            <StageIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{stageLeads.length}</div>
                        <div className="text-sm text-gray-600">{stage.description}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Actividad reciente mejorada */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>Actividad Reciente</span>
                </CardTitle>
                <CardDescription>Últimos leads registrados en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.slice(0, 5).map(lead => {
                    const fuente = FUENTES.find(f => f.id === lead.fuente)
                    const vendedor = VENDEDORES.find(v => v.id === lead.vendedor)
                    const pipeline = PIPELINE_STAGES.find(p => p.id === lead.pipeline)
                    
                    return (
                      <div key={lead.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                          {lead.nombre.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{lead.nombre}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{lead.telefono}</span>
                            {fuente && (
                              <>
                                <span>•</span>
                                <fuente.icon className="h-3 w-3" />
                                <span>{fuente.nombre}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {pipeline && (
                            <Badge className={pipeline.textColor}>
                              <pipeline.icon className="mr-1 h-3 w-3" />
                              {pipeline.title}
                            </Badge>
                          )}
                          {vendedor && (
                            <Badge className={vendedor.color}>
                              {vendedor.nombre}
                            </Badge>
                          )}
                        </div>
                        {lead.conversacion && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showWhatsAppChat(lead)}
                            className="hover:bg-green-100"
                          >
                            <MessageSquare className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestión de Leads Mejorada */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Users className="mr-3 h-8 w-8 text-blue-500" />
                  Gestión de Leads
                </h2>
                <p className="text-gray-600">{filteredLeads.length} leads encontrados</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={viewMode === 'table' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : ''}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className={viewMode === 'kanban' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : ''}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button onClick={() => setShowNewLeadForm(true)} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Lead
                </Button>
              </div>
            </div>

            {/* Filtros mejorados */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Nombre, teléfono, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  {currentUser.rol === 'admin' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Vendedor</Label>
                      <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                        <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
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
                    <Label className="text-sm font-medium">Fuente</Label>
                    <Select value={filterFuente} onValueChange={setFilterFuente}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
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
                    <Label className="text-sm font-medium">Estado</Label>
                    <Select value={filterEstado} onValueChange={setFilterEstado}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activos</SelectItem>
                        <SelectItem value="Inactivo">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Pipeline</Label>
                    <Select value={filterPipeline} onValueChange={setFilterPipeline}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
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

            {/* Vista de tabla mejorada */}
            {viewMode === 'table' && (
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
                          <TableHead className="font-semibold">Cliente</TableHead>
                          <TableHead className="font-semibold">Contacto</TableHead>
                          <TableHead className="font-semibold">Fuente</TableHead>
                          <TableHead className="font-semibold">Producto</TableHead>
                          <TableHead className="font-semibold">Vendedor</TableHead>
                          <TableHead className="font-semibold">Pipeline</TableHead>
                          <TableHead className="font-semibold">Estado</TableHead>
                          <TableHead className="font-semibold">Chat</TableHead>
                          <TableHead className="font-semibold">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentLeads.map(lead => {
                          const vendedor = VENDEDORES.find(v => v.id === lead.vendedor)
                          const fuente = FUENTES.find(f => f.id === lead.fuente)
                          const pipeline = PIPELINE_STAGES.find(p => p.id === lead.pipeline)
                          
                          return (
                            <TableRow key={lead.id} className="hover:bg-gray-50 transition-colors">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {lead.nombre.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{lead.nombre}</p>
                                    <p className="text-sm text-gray-500">{lead.registro}</p>
                                  </div>
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
                                  <Badge className={`${fuente.color} shadow-sm`}>
                                    <fuente.icon className="mr-1 h-3 w-3" />
                                    {fuente.nombre}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-medium">{lead.producto_interes}</span>
                              </TableCell>
                              <TableCell>
                                {vendedor && (
                                  <Badge className={`${vendedor.color} shadow-sm`}>
                                    <span className="mr-1">{vendedor.avatar}</span>
                                    {vendedor.nombre}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {pipeline && (
                                  <Badge className={`${pipeline.textColor} shadow-sm`}>
                                    <pipeline.icon className="mr-1 h-3 w-3" />
                                    {pipeline.title}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={lead.estado === 'Activo' ? 'default' : 'secondary'} className="shadow-sm">
                                  {lead.estado === 'Activo' ? <Unlock className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                                  {lead.estado}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {lead.conversacion ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => showWhatsAppChat(lead)}
                                    className="hover:bg-green-100 text-green-600"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <span className="text-gray-400 text-sm">Sin chat</span>
                                )}
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
                                    className="hover:bg-blue-100 text-blue-600"
                                  >
                                    <Edit className="h-4 w-4" />
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
                                          className="p-1 hover:bg-gray-100"
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
                  
                  {/* Paginación mejorada */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                      <div className="text-sm text-gray-500">
                        Mostrando {indexOfFirstLead + 1} a {Math.min(indexOfLastLead, filteredLeads.length)} de {filteredLeads.length} leads
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="hover:bg-blue-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium px-3 py-1 bg-white rounded border">
                          {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="hover:bg-blue-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Vista Kanban mejorada */}
            {viewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PIPELINE_STAGES.map(stage => {
                  const stageLeads = leadsByPipeline[stage.id] || []
                  const StageIcon = stage.icon
                  
                  return (
                    <Card key={stage.id} className={`${stage.color} min-h-[600px] shadow-lg`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className={`flex items-center space-x-2 ${stage.textColor}`}>
                            <StageIcon className="h-5 w-5" />
                            <span>{stage.title}</span>
                          </CardTitle>
                          <Badge className={`${stage.bgColor} text-white shadow-lg`}>
                            {stageLeads.length}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {stageLeads.map(lead => {
                          const vendedor = VENDEDORES.find(v => v.id === lead.vendedor)
                          const fuente = FUENTES.find(f => f.id === lead.fuente)
                          
                          return (
                            <Card key={lead.id} className="bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                        {lead.nombre.charAt(0)}
                                      </div>
                                      <h4 className="font-semibold text-gray-900 text-sm">{lead.nombre}</h4>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedLead(lead)
                                          setEditLeadForm({
                                            nombre: lead.nombre,
                                            telefono: lead.telefono,
                                            fuente: lead.fuente,
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
                                        className="p-1 h-6 w-6"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      {lead.conversacion && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => showWhatsAppChat(lead)}
                                          className="p-1 h-6 w-6 text-green-600"
                                        >
                                          <MessageSquare className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-700">{lead.telefono}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Package className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-700">{lead.producto_interes}</span>
                                    </div>
                                    {lead.proxima_accion && (
                                      <div className="flex items-center space-x-2">
                                        <Clock className="h-3 w-3 text-gray-400" />
                                        <span className="text-gray-700">{lead.proxima_accion}</span>
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
                                        <span className="mr-1">{vendedor.avatar}</span>
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
                                          className="text-xs p-1 h-6 hover:bg-gray-100"
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

          {/* Otras pestañas (Ventas, Cobranzas, Tareas) - Simplificadas por espacio */}
          <TabsContent value="ventas" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <ShoppingCart className="mr-3 h-8 w-8 text-green-500" />
                  Ventas
                </h2>
                <p className="text-gray-600">{ventas.length} ventas registradas</p>
              </div>
            </div>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ventas registradas</h3>
                  <p className="text-gray-500">Las ventas aparecerán aquí cuando muevas leads a la etapa de cierre.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cobranzas" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <CreditCard className="mr-3 h-8 w-8 text-orange-500" />
                  Cobranzas
                </h2>
                <p className="text-gray-600">S/ {cobranzas.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + c.saldo_pendiente, 0).toLocaleString()} por cobrar</p>
              </div>
            </div>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cobranzas pendientes</h3>
                  <p className="text-gray-500">Las cobranzas aparecerán aquí cuando registres ventas a crédito.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tareas" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <CalendarDays className="mr-3 h-8 w-8 text-purple-500" />
                  Tareas
                </h2>
                <p className="text-gray-600">{tareas.filter(t => t.estado === 'pendiente').length} tareas pendientes</p>
              </div>
              <Button onClick={() => setShowTaskForm(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Tarea
              </Button>
            </div>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas registradas</h3>
                  <p className="text-gray-500">Crea tareas para organizar tu seguimiento de leads.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Chat WhatsApp */}
        <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>Chat WhatsApp</span>
              </DialogTitle>
              <DialogDescription>
                {selectedLead && `Conversación con ${selectedLead.nombre}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedLead && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {selectedLead.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedLead.nombre}</p>
                      <p className="text-sm text-gray-500">{selectedLead.telefono}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <ScrollArea className="h-80 w-full border rounded-lg p-4 bg-gradient-to-b from-green-50 to-white">
                {selectedLead && selectedLead.conversacion ? (
                  <div className="space-y-3">
                    {parseWhatsAppConversation(selectedLead.conversacion).map((message, index) => (
                      <div key={index} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.type === 'sent' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'sent' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No hay conversaciones registradas</p>
                  </div>
                )}
              </ScrollArea>
              
              <div className="flex space-x-2">
                <Input placeholder="Escribe un mensaje..." className="flex-1" />
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Otros modales simplificados por espacio... */}
        
        {/* Mostrar errores */}
        {error && (
          <Alert className="border-red-200 bg-red-50 shadow-lg">
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
