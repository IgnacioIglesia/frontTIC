// scripts/user-widget.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://imexctmcesopdfdebsgo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltZXhjdG1jZXNvcGRmZGVic2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDczMDIsImV4cCI6MjA3NDg4MzMwMn0.g1lziVKAuUvMEOkYxJhe2D2z8PlwGJ6xcXo_SSpTj7Q'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const loginBtn   = document.getElementById('loginBtn')
const userWidget = document.getElementById('userWidget')
const avatarEl   = document.getElementById('userAvatar')
const greetEl    = document.getElementById('greeting')
const userMenu   = document.getElementById('userMenu')
const logoutBtn  = document.getElementById('logoutBtn')

/* ===== Funciones auxiliares ===== */
const initialsFrom = (nombre='', apellido='', email='')=>{
  const n = (nombre||'').trim().split(/\s+/)[0] || ''
  const a = (apellido||'').trim().split(/\s+/)[0] || ''
  const ini = (n[0]||'') + (a[0]||'')
  return (ini || (email[0]||'?')).toUpperCase()
}
const firstNameFrom = (nombre='', email='')=>{
  const n = (nombre||'').trim().split(/\s+/)[0]
  return n || (email || '').split('@')[0]
}

/* ===== Actualiza header según sesión ===== */
export async function refreshHeader(){
  const { data: { session } } = await supabase.auth.getSession()
  if (!session){
    userWidget.classList.add('hidden')
    loginBtn.classList.remove('hidden')
    return
  }

  const uid = session.user.id
  let nombre = '', apellido = '', email = session.user.email || ''

  try{
    const { data: perfil } = await supabase
      .from('usuario')
      .select('nombre, apellido, email')
      .eq('id_auth', uid)
      .maybeSingle()

    if (perfil){
      nombre = perfil.nombre || session.user.user_metadata?.nombre || ''
      apellido = perfil.apellido || session.user.user_metadata?.apellido || ''
      email = perfil.email || email
    }else{
      nombre = session.user.user_metadata?.nombre || ''
      apellido = session.user.user_metadata?.apellido || ''
    }
  }catch(_){}

  avatarEl.textContent = initialsFrom(nombre, apellido, email)
  greetEl.textContent  = `Hola, ${firstNameFrom(nombre, email)}!`

  loginBtn.classList.add('hidden')
  userWidget.classList.remove('hidden')
}

/* ===== Inicializar ===== */
await refreshHeader()
supabase.auth.onAuthStateChange((_event, _session) => { refreshHeader() })

/* ===== Menú desplegable ===== */
userWidget.addEventListener('click', (e)=>{
  if(e.target.closest('#userMenu')) return
  userMenu.classList.toggle('hidden')
})
document.addEventListener('click', (e)=>{
  if(!userWidget.contains(e.target)){ userMenu.classList.add('hidden') }
})

/* ===== Cerrar sesión ===== */
logoutBtn.addEventListener('click', async (e)=>{
  e.preventDefault()
  await supabase.auth.signOut()
  location.reload()
})