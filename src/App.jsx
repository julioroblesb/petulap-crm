import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  MessageCircle, Bot, Facebook, Instagram, Twitter, Linkedin,
  Sparkles, Flame, Rocket, Crown, Diamond, Heart, ThumbsUp,
  Smile, Frown, Meh, Coffee, Gift, Music, Camera, Video, Image, Mic
} from 'lucide-react'
import './App.css'
import logoPetulap from './assets/logo-petulap.png'

// Configuración de Google Sheets
const GOOGLE_SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1kgAlVkdtgofYTYyqKycGwtmnYuiMU-41_geAcKIp8mE'
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyA3A2v_fljthf71ceuMO0Xysk-4IburkbI'

// Service Account para escritura
const SERVICE_ACCOUNT_KEY = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_KEY ? 
  JSON.parse(import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_KEY) : null

// Mapeo de columnas según la estructura real de Julio
const LEADS_COLUMNS = {
  NOMBRE: 0,                    // A
  TELEFONO: 1,                  // B
  FUENTE: 2,                    // C
  REGISTRO: 3,                  // D
  PRODUCTO_INTERES: 4,          // E
  EMAIL: 5,                     // F
  ESTADO: 6,                    // G
  PIPELINE: 7,                  // H
  VENDEDOR: 8,                  // I
  COMENTARIOS: 9,               // J
  FECHA_ULTIMO_CONTACTO: 10,    // K
  PROXIMA_ACCION: 11,           // L
  FECHA_PROXIMA_ACCION: 12,     // M
  CONVERSACION: 13              // N
}

// Mapeo de columnas para CREDENCIALES
const CREDENCIALES_COLUMNS = {
  USUARIO: 0,        // A
  CONTRASEÑA: 1,     // B
  ROL: 2,           // C
  NOMBRE: 3,        // D
  ESTADO: 4         // E
}

function App() {
  // Estados principales
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Estados para formularios
  const [loginForm, setLoginForm] = useState({ usuario: '', contraseña: '' })
  const [newLead, setNewLead] = useState({
    nombre: '',
    telefono: '',
    fuente: 'BOT',
    producto_interes: 'Laptop Gaming',
    email: '',
    estado: 'Activo',
    pipeline: 'Prospección',
    vendedor: '',
    comentarios: '',
    conversacion: ''
  })
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVendedor, setFilterVendedor] = useState('')
  const [filterPipeline, setFilterPipeline] = useState('')
  const [viewMode, setViewMode] = useState('table')
  
  // Estados para modales
  const [showNewLeadModal, setShowNewLeadModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)

  // Función para obtener token de acceso usando Service Account
  const getAccessToken = async () => {
    if (!SERVICE_ACCOUNT_KEY) {
      throw new Error('Service Account no configurado')
    }

    const jwt = await createJWT()
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    })

    if (!response.ok) {
      throw new Error('Error al obtener token de acceso')
    }

    const data = await response.json()
    return data.access_token
  }

  // Función para crear JWT para Service Account
  const createJWT = async () => {
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: SERVICE_ACCOUNT_KEY.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }

    // Nota: En producción real necesitarías una librería para firmar JWT
    // Por ahora usaremos la API Key para lectura
    return btoa(JSON.stringify(header)) + '.' + btoa(JSON.stringify(payload)) + '.signature'
  }

  // Función para leer datos de Google Sheets
  const readGoogleSheets = async (sheetName, range = '') => {
    try {
      const fullRange = range ? `${sheetName}!${range}` : `${sheetName}`
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${fullRange}?key=${GOOGLE_API_KEY}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.values || []
    } catch (error) {
      console.error('Error al leer Google Sheets:', error)
      throw error
    }
  }

  // Función para escribir datos en Google Sheets
  const writeGoogleSheets = async (sheetName, range, values) => {
    try {
      // Por ahora simularemos la escritura
      // En producción real necesitarías implementar OAuth2 o Service Account completo
      console.log('Escribiendo en Google Sheets:', { sheetName, range, values })
      
      // Simular éxito
      return { success: true }
    } catch (error) {
      console.error('Error al escribir en Google Sheets:', error)
      throw error
    }
  }

  // Cargar usuarios desde la hoja CREDENCIALES
  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const data = await readGoogleSheets('0CREDENCIALES', 'A2:E100')
      
      const usuariosData = data.map(row => ({
        usuario: row[CREDENCIALES_COLUMNS.USUARIO] || '',
        contraseña: row[CREDENCIALES_COLUMNS.CONTRASEÑA] || '',
        rol: row[CREDENCIALES_COLUMNS.ROL] || 'vendedor',
        nombre: row[CREDENCIALES_COLUMNS.NOMBRE] || '',
        estado: row[CREDENCIALES_COLUMNS.ESTADO] || 'activo'
      })).filter(user => user.usuario && user.contraseña && user.estado === 'activo')
      
      setUsuarios(usuariosData)
      console.log('Usuarios cargados:', usuariosData)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      setError('Error al cargar usuarios: ' + error.message)
      
      // Fallback a usuarios hardcodeados si falla la conexión
      setUsuarios([
        { usuario: 'diego', contraseña: 'diego123', rol: 'admin', nombre: 'Diego Robles', estado: 'activo' },
        { usuario: 'gema', contraseña: 'gema123', rol: 'vendedor', nombre: 'Gema Vendedor', estado: 'activo' },
        { usuario: 'andre', contraseña: 'andre123', rol: 'vendedor', nombre: 'Andre Vendedor', estado: 'activo' },
        { usuario: 'josue', contraseña: 'josue123', rol: 'vendedor', nombre: 'Josue Vendedor', estado: 'activo' },
        { usuario: 'alejandro', contraseña: 'alejandro123', rol: 'vendedor', nombre: 'Alejandro Vendedor', estado: 'activo' },
        { usuario: 'kevin', contraseña: 'kevin123', rol: 'vendedor', nombre: 'Kevin Vendedor', estado: 'activo' },
        { usuario: 'jefry', contraseña: 'jefry123', rol: 'vendedor', nombre: 'Jefry Vendedor', estado: 'activo' },
        { usuario: 'adrian', contraseña: 'adrian123', rol: 'vendedor', nombre: 'Adrian Vendedor', estado: 'activo' }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Cargar leads desde la hoja LEADS_MASTER
  const cargarLeads = async () => {
    try {
      setLoading(true)
      const data = await readGoogleSheets('0LEADS_MASTER', 'A2:N1000')
      
      const leadsData = data.map((row, index) => ({
        id: index + 1,
        nombre: row[LEADS_COLUMNS.NOMBRE] || '',
        telefono: row[LEADS_COLUMNS.TELEFONO] || '',
        fuente: row[LEADS_COLUMNS.FUENTE] || '',
        registro: row[LEADS_COLUMNS.REGISTRO] || '',
        producto_interes: row[LEADS_COLUMNS.PRODUCTO_INTERES] || '',
        email: row[LEADS_COLUMNS.EMAIL] || '',
        estado: row[LEADS_COLUMNS.ESTADO] || '',
        pipeline: row[LEADS_COLUMNS.PIPELINE] || '',
        vendedor: row[LEADS_COLUMNS.VENDEDOR] || '',
        comentarios: row[LEADS_COLUMNS.COMENTARIOS] || '',
        fecha_ultimo_contacto: row[LEADS_COLUMNS.FECHA_ULTIMO_CONTACTO] || '',
        proxima_accion: row[LEADS_COLUMNS.PROXIMA_ACCION] || '',
        fecha_proxima_accion: row[LEADS_COLUMNS.FECHA_PROXIMA_ACCION] || '',
        conversacion: row[LEADS_COLUMNS.CONVERSACION] || ''
      })).filter(lead => lead.nombre || lead.telefono)
      
      setLeads(leadsData)
      console.log('Leads cargados:', leadsData.length)
    } catch (error) {
      console.error('Error al cargar leads:', error)
      setError('Error al cargar leads: ' + error.message)
      
      // Datos de ejemplo si falla la conexión
      setLeads([
        {
          id: 1,
          nombre: 'Cliente Ejemplo',
          telefono: '999999999',
          fuente: 'BOT',
          registro: '30/07/2025',
          producto_interes: 'Laptop Gaming',
          email: 'cliente@ejemplo.com',
          estado: 'Activo',
          pipeline: 'Prospección',
          vendedor: 'diego',
          comentarios: 'Lead de ejemplo',
          fecha_ultimo_contacto: '30/07/2025',
          proxima_accion: 'Llamar',
          fecha_proxima_accion: '31/07/2025',
          conversacion: '-A: Hola, gracias por contactarnos\n-B: Hola, quiero información sobre laptops'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Función de login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = usuarios.find(u => 
        u.usuario === loginForm.usuario && 
        u.contraseña === loginForm.contraseña &&
        u.estado === 'activo'
      )

      if (user) {
        setCurrentUser(user)
        setIsLoggedIn(true)
        setNewLead(prev => ({ ...prev, vendedor: user.usuario }))
        await cargarLeads()
      } else {
        setError('Usuario o contraseña incorrectos')
      }
    } catch (error) {
      setError('Error al iniciar sesión: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para agregar nuevo lead
  const handleAddLead = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const leadData = {
        ...newLead,
        registro: new Date().toLocaleDateString('es-PE'),
        fecha_ultimo_contacto: new Date().toLocaleDateString('es-PE'),
        id: leads.length + 1
      }

      // Agregar a la lista local
      setLeads(prev => [...prev, leadData])
      
      // Intentar escribir en Google Sheets
      try {
        await writeGoogleSheets('0LEADS_MASTER', `A${leads.length + 2}:N${leads.length + 2}`, [
          [
            leadData.nombre,
            leadData.telefono,
            leadData.fuente,
            leadData.registro,
            leadData.producto_interes,
            leadData.email,
            leadData.estado,
            leadData.pipeline,
            leadData.vendedor,
            leadData.comentarios,
            leadData.fecha_ultimo_contacto,
            leadData.proxima_accion,
            leadData.fecha_proxima_accion,
            leadData.conversacion
          ]
        ])
      } catch (writeError) {
        console.error('Error al escribir en Google Sheets:', writeError)
        // Continuar aunque falle la escritura
      }

      // Resetear formulario
      setNewLead({
        nombre: '',
        telefono: '',
        fuente: 'BOT',
        producto_interes: 'Laptop Gaming',
        email: '',
        estado: 'Activo',
        pipeline: 'Prospección',
        vendedor: currentUser?.usuario || '',
        comentarios: '',
        conversacion: ''
      })
      
      setShowNewLeadModal(false)
    } catch (error) {
      setError('Error al agregar lead: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para mostrar chat de WhatsApp
  const showChat = (lead) => {
    setSelectedLead(lead)
    setShowChatModal(true)
  }

  // Función para parsear conversación de WhatsApp
  const parseConversation = (conversacion) => {
    if (!conversacion) return []
    
    const messages = conversacion.split('\n').filter(msg => msg.trim())
    return messages.map((msg, index) => {
      if (msg.startsWith('-A:')) {
        return { id: index, type: 'sent', text: msg.substring(3).trim() }
      } else if (msg.startsWith('-B:')) {
        return { id: index, type: 'received', text: msg.substring(3).trim() }
      }
      return { id: index, type: 'system', text: msg }
    })
  }

  // Filtrar leads según criterios
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefono.includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesVendedor = !filterVendedor || lead.vendedor === filterVendedor
    const matchesPipeline = !filterPipeline || lead.pipeline === filterPipeline
    
    // Si es vendedor, solo mostrar sus leads
    const matchesRole = currentUser?.rol === 'admin' || lead.vendedor === currentUser?.usuario
    
    return matchesSearch && matchesVendedor && matchesPipeline && matchesRole
  })

  // Calcular métricas del dashboard
  const metrics = {
    totalLeads: filteredLeads.length,
    leadsActivos: filteredLeads.filter(l => l.estado === 'Activo').length,
    enProspeccion: filteredLeads.filter(l => l.pipeline === 'Prospección').length,
    enNegociacion: filteredLeads.filter(l => l.pipeline === 'Negociación').length,
    cerrados: filteredLeads.filter(l => l.pipeline === 'Cierre').length
  }

  // Cargar datos iniciales
  useEffect(() => {
    cargarUsuarios()
  }, [])

  // Pantalla de login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <img 
                  src={logoPetulap} 
                  alt="PETULAP Logo" 
                  className="h-16 w-auto object-contain"
                />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                PETULAP CRM
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sistema Profesional de Gestión de Leads
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usuario">Usuario</Label>
                  <Input
                    id="usuario"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={loginForm.usuario}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, usuario: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contraseña">Contraseña</Label>
                  <Input
                    id="contraseña"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={loginForm.contraseña}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, contraseña: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </form>
              
              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Usuarios disponibles: {usuarios.length} cargados
                </p>
                {usuarios.length === 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cargarUsuarios}
                    className="mt-2"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recargar usuarios
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Pantalla principal del CRM
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src={logoPetulap} 
                alt="PETULAP" 
                className="h-8 w-auto mr-3"
              />
              <h1 className="text-xl font-bold text-gray-900">PETULAP CRM</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <User className="mr-1 h-3 w-3" />
                {currentUser?.nombre} ({currentUser?.rol})
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsLoggedIn(false)
                  setCurrentUser(null)
                  setLeads([])
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'leads', label: 'Gestión de Leads', icon: Users },
              { id: 'pipeline', label: 'Pipeline', icon: Target },
              { id: 'reportes', label: 'Reportes', icon: FileBarChart }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <Button onClick={cargarLeads} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar datos
              </Button>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { label: 'Total Leads', value: metrics.totalLeads, icon: Users, color: 'blue' },
                { label: 'Activos', value: metrics.leadsActivos, icon: CheckCircle, color: 'green' },
                { label: 'Prospección', value: metrics.enProspeccion, icon: Search, color: 'yellow' },
                { label: 'Negociación', value: metrics.enNegociacion, icon: MessageSquare, color: 'orange' },
                { label: 'Cierre', value: metrics.cerrados, icon: Target, color: 'purple' }
              ].map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <metric.icon className={`h-8 w-8 text-${metric.color}-600`} />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Leads recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Leads Recientes</CardTitle>
                <CardDescription>Últimos leads agregados al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLeads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{lead.nombre}</p>
                          <p className="text-sm text-gray-500">{lead.telefono} • {lead.fuente}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={lead.pipeline === 'Cierre' ? 'default' : 'secondary'}>
                          {lead.pipeline}
                        </Badge>
                        {lead.conversacion && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => showChat(lead)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Leads</h2>
              <div className="flex space-x-2">
                <Dialog open={showNewLeadModal} onOpenChange={setShowNewLeadModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Lead
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Lead</DialogTitle>
                      <DialogDescription>
                        Completa la información del nuevo lead
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleAddLead} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre *</Label>
                          <Input
                            id="nombre"
                            value={newLead.nombre}
                            onChange={(e) => setNewLead(prev => ({ ...prev, nombre: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono">Teléfono *</Label>
                          <Input
                            id="telefono"
                            value={newLead.telefono}
                            onChange={(e) => setNewLead(prev => ({ ...prev, telefono: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fuente">Fuente</Label>
                          <Select value={newLead.fuente} onValueChange={(value) => setNewLead(prev => ({ ...prev, fuente: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BOT">BOT</SelectItem>
                              <SelectItem value="WHATSAPP META">WhatsApp Meta</SelectItem>
                              <SelectItem value="Facebook">Facebook</SelectItem>
                              <SelectItem value="TikTok">TikTok</SelectItem>
                              <SelectItem value="Tienda">Tienda</SelectItem>
                              <SelectItem value="Referido">Referido</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pipeline">Pipeline</Label>
                          <Select value={newLead.pipeline} onValueChange={(value) => setNewLead(prev => ({ ...prev, pipeline: value }))}>
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
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newLead.email}
                          onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="producto_interes">Producto de Interés</Label>
                        <Select value={newLead.producto_interes} onValueChange={(value) => setNewLead(prev => ({ ...prev, producto_interes: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Laptop Gaming">Laptop Gaming</SelectItem>
                            <SelectItem value="Laptop Trabajo">Laptop Trabajo</SelectItem>
                            <SelectItem value="PC Gaming">PC Gaming</SelectItem>
                            <SelectItem value="Accesorios">Accesorios</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comentarios">Comentarios</Label>
                        <Textarea
                          id="comentarios"
                          value={newLead.comentarios}
                          onChange={(e) => setNewLead(prev => ({ ...prev, comentarios: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowNewLeadModal(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Guardando...' : 'Guardar Lead'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <Input
                      placeholder="Buscar por nombre, teléfono o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  {currentUser?.rol === 'admin' && (
                    <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por vendedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los vendedores</SelectItem>
                        {usuarios.map(user => (
                          <SelectItem key={user.usuario} value={user.usuario}>
                            {user.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Select value={filterPipeline} onValueChange={setFilterPipeline}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por pipeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los pipelines</SelectItem>
                      <SelectItem value="Prospección">Prospección</SelectItem>
                      <SelectItem value="Contacto">Contacto</SelectItem>
                      <SelectItem value="Negociación">Negociación</SelectItem>
                      <SelectItem value="Cierre">Cierre</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="rounded-r-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-l-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Leads */}
            <Card>
              <CardHeader>
                <CardTitle>Leads ({filteredLeads.length})</CardTitle>
                <CardDescription>
                  {currentUser?.rol === 'admin' 
                    ? 'Todos los leads del sistema' 
                    : 'Tus leads asignados'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {viewMode === 'table' ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Fuente</TableHead>
                          <TableHead>Pipeline</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Registro</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.map(lead => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.nombre}</TableCell>
                            <TableCell>{lead.telefono}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{lead.fuente}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={lead.pipeline === 'Cierre' ? 'default' : 'secondary'}>
                                {lead.pipeline}
                              </Badge>
                            </TableCell>
                            <TableCell>{lead.vendedor}</TableCell>
                            <TableCell>{lead.registro}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {lead.conversacion && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => showChat(lead)}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLeads.map(lead => (
                      <Card key={lead.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{lead.nombre}</h3>
                                <p className="text-sm text-gray-500">{lead.telefono}</p>
                              </div>
                            </div>
                            {lead.conversacion && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => showChat(lead)}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Fuente:</span>
                              <Badge variant="outline">{lead.fuente}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Pipeline:</span>
                              <Badge variant={lead.pipeline === 'Cierre' ? 'default' : 'secondary'}>
                                {lead.pipeline}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Vendedor:</span>
                              <span className="font-medium">{lead.vendedor}</span>
                            </div>
                            {lead.producto_interes && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Producto:</span>
                                <span className="font-medium">{lead.producto_interes}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 flex space-x-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pipeline Tab */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Pipeline de Ventas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { stage: 'Prospección', leads: filteredLeads.filter(l => l.pipeline === 'Prospección'), color: 'yellow' },
                { stage: 'Contacto', leads: filteredLeads.filter(l => l.pipeline === 'Contacto'), color: 'blue' },
                { stage: 'Negociación', leads: filteredLeads.filter(l => l.pipeline === 'Negociación'), color: 'orange' },
                { stage: 'Cierre', leads: filteredLeads.filter(l => l.pipeline === 'Cierre'), color: 'green' }
              ].map(column => (
                <Card key={column.stage} className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {column.stage}
                      <Badge variant="secondary">{column.leads.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {column.leads.map(lead => (
                      <Card key={lead.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{lead.nombre}</h4>
                            {lead.conversacion && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => showChat(lead)}
                                className="h-6 w-6 p-0"
                              >
                                <MessageCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{lead.telefono}</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-xs">{lead.fuente}</Badge>
                            <span className="text-xs text-gray-500">{lead.vendedor}</span>
                          </div>
                          {lead.producto_interes && (
                            <p className="text-xs text-gray-600">{lead.producto_interes}</p>
                          )}
                        </div>
                      </Card>
                    ))}
                    
                    {column.leads.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay leads en esta etapa</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reportes Tab */}
        {activeTab === 'reportes' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leads por Fuente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['BOT', 'WHATSAPP META', 'Facebook', 'TikTok', 'Tienda', 'Referido'].map(fuente => {
                      const count = filteredLeads.filter(l => l.fuente === fuente).length
                      const percentage = filteredLeads.length > 0 ? (count / filteredLeads.length * 100).toFixed(1) : 0
                      return (
                        <div key={fuente} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{fuente}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 w-12">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento por Vendedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usuarios.filter(u => u.rol === 'vendedor').map(vendedor => {
                      const count = filteredLeads.filter(l => l.vendedor === vendedor.usuario).length
                      const cerrados = filteredLeads.filter(l => l.vendedor === vendedor.usuario && l.pipeline === 'Cierre').length
                      return (
                        <div key={vendedor.usuario} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{vendedor.nombre}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{count} leads</span>
                            <span className="text-sm text-green-600">{cerrados} cerrados</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Modal de Chat WhatsApp */}
        <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span>Chat WhatsApp - {selectedLead?.nombre}</span>
              </DialogTitle>
              <DialogDescription>
                Conversación con el lead
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{selectedLead?.telefono}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{selectedLead?.producto_interes}</span>
                </div>
              </div>
              
              <ScrollArea className="h-64 w-full border rounded-lg p-4">
                <div className="space-y-3">
                  {parseConversation(selectedLead?.conversacion || '').map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.type === 'sent'
                            ? 'bg-blue-600 text-white'
                            : message.type === 'received'
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-yellow-100 text-yellow-800 text-center'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  
                  {(!selectedLead?.conversacion || selectedLead.conversacion.trim() === '') && (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay conversación registrada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Phone className="mr-2 h-4 w-4" />
                  Llamar
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
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

