import { createUsuario, loginUsuario, getUsuarioInfoById } from '../servicios/usuarios.js';

export function usuarioRoutes(app) {
  app.post('/api/v1/usuario/signup', async (req, res) => {
    try {
      const usuario = await createUsuario(req.body);
      return res.status(201).json({ username: usuario.username });
    } catch (err) {
      return res.status(400).json({
        error: 'Falló al crear el usuario, El usuario ya existe?',
      });
    }
  });

 // En src/rutas/usuarios.js - VERSIÓN TEMPORAL PARA DEPURAR
app.post('/api/v1/usuario/login', async (req, res) => {
  try {
    const token = await loginUsuario(req.body)
    return res.status(200).send({ token })
  } catch (err) {
    // 👇 Esto te mostrará el error real en la consola
    console.log('❌ Error de login:', err.message)
    console.log('📦 Body recibido:', req.body)
    
    return res.status(400).send({
      error: 'Login Falló, Ingresas el Usuario/Contraseña correcta?',
      debug: err.message // 👈 Temporal, para ver el error exacto
    })
  }
})
  app.get('/api/v1/usuarios/:id', async (req, res) => {
    // CORRECCIÓN: Usa el nombre correcto de la función importada
    const userInfo = await getUsuarioInfoById(req.params.id);
    return res.status(200).send(userInfo);
  });
}