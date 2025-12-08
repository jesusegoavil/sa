// ========================================
// CONFIGURACIÓN DE SUPABASE
// ========================================
const SUPABASE_URL = 'https://mckuokmmzjtcckxexpve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ja3Vva21temp0Y2NreGV4cHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzE0MDgsImV4cCI6MjA4MDcwNzQwOH0.qMscyDAhwHC7Fjmc8FUi4OzbwJlT-OYQ9rKi4pk3Hs4';

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// FUNCIÓN PARA HASHEAR CONTRASEÑAS (Simple)
// ========================================
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ========================================
// REGISTRO
// ========================================
async function registrarUsuario(username, password) {
  try {
    if (!username || !password) {
      return { ok: false, msg: 'Completa todos los campos' };
    }

    if (password.length < 6) {
      return { ok: false, msg: 'La contraseña debe tener al menos 6 caracteres' };
    }

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return { ok: false, msg: 'Este usuario ya existe' };
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Insertar usuario
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ username: username, password: hashedPassword }])
      .select();

    if (error) throw error;

    return { 
      ok: true, 
      msg: 'Usuario registrado correctamente',
      user: data[0]
    };

  } catch (error) {
    console.error('Error en registro:', error);
    return { 
      ok: false, 
      msg: error.message || 'Error al registrar usuario' 
    };
  }
}

// ========================================
// LOGIN
// ========================================
async function loginUsuario(username, password) {
  try {
    if (!username || !password) {
      return { ok: false, msg: 'Completa todos los campos' };
    }

    // Buscar el usuario
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, username, password')
      .eq('username', username)
      .maybeSingle();

    if (userError || !userData) {
      return { ok: false, msg: 'Usuario no encontrado' };
    }

    // Verificar contraseña
    const hashedPassword = await hashPassword(password);
    
    if (hashedPassword !== userData.password) {
      return { ok: false, msg: 'Contraseña incorrecta' };
    }

    // Guardar en localStorage
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('username', userData.username);

    return { 
      ok: true, 
      msg: 'Inicio de sesión exitoso',
      usuario: { 
        id: userData.id, 
        username: userData.username 
      }
    };

  } catch (error) {
    console.error('Error en login:', error);
    return { 
      ok: false, 
      msg: 'Error al iniciar sesión' 
    };
  }
}

// ========================================
// LOGOUT
// ========================================
function logoutUsuario() {
  localStorage.clear();
  return true;
}

// ========================================
// VERIFICAR SESIÓN
// ========================================
function verificarSesion() {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  
  if (!userId || !username) {
    return null;
  }
  
  return { id: userId, username: username };
}

// ========================================
// PROTEGER PÁGINAS
// ========================================
function protegerPagina() {
  const user = verificarSesion();
  
  if (!user) {
    window.location.href = 'index.html';
    return false;
  }
  
  return true;
}