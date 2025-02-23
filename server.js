require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Configuración inicial
const DATA_FILE = path.join(__dirname, 'database.json');
const UPLOAD_DIR = path.join(__dirname, 'public/images');
const JWT_SECRET = process.env.JWT_SECRET || 'hackersecret123';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Configurar Multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  }
});

// Inicializar base de datos
const initializeDB = () => ({
  profiles: [],
  verificationCodes: {}
});

const readDB = () => {
  try {
    // Si el archivo no existe, crea uno con la estructura inicial
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = initializeDB();
      writeDB(initialData);
      return initialData;
    }
    
    // Lee el contenido del archivo como texto
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    
    // Si el archivo está vacío, reinicialízalo
    if (!data.trim()) {
      const initialData = initializeDB();
      writeDB(initialData);
      return initialData;
    }
    
    // Parsear el contenido JSON
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo la base de datos:', error);
    return initializeDB();
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Helper functions
const generateCode = () => Math.floor(100000 + Math.random() * 900000);

// Genera un perfil con imágenes default para avatar y banner
const generateProfile = (username) => ({
  banner: '/images/default-banner.jpg', // Imagen de banner por defecto
  avatar: '/images/default-avatar.jpg', // Imagen de avatar por defecto
  nickname: `H4CK3R_${username.slice(0, 3).toUpperCase()}${Math.floor(Math.random() * 999)}`,
  stats: {
    skill: Math.floor(Math.random() * 100),
    stealth: Math.floor(Math.random() * 100),
    crypto: Math.floor(Math.random() * 100)
  },
  activity: [
    `Joined: ${new Date().toISOString().split('T')[0]}`,
    'Initialized darknet connection'
  ]
});

// Configurar Telegram Bot
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
bot.start((ctx) => ctx.reply(`🔐 Your Cyber ID: ${ctx.from.id}`));
bot.launch();

// Middlewares
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Acceso no autorizado' });
  }
};

// Rutas
app.post('/api/register', async (req, res) => {
  const db = readDB();
  if (!db.profiles) {
    db.profiles = [];
  }
  if (!db.verificationCodes) {
    db.verificationCodes = {};
  }
  const { telegramId, mobile, username, password } = req.body;

  // Validaciones
  if (!telegramId || !mobile || !username || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  if (db.profiles.some(u => u.username === username)) {
    return res.status(409).json({ error: 'Nombre de usuario ya existe' });
  }

  const code = generateCode();
  
  try {
    // Enviar código via Telegram Bot
    await bot.telegram.sendMessage(
      telegramId,
      `🔐 *Código de Verificación DEDSEC*\n\n` +
      `Tu código para ${mobile} es: *${code}*\n` +
      `Valido por 5 minutos.`,
      { parse_mode: 'Markdown' }
    );

    db.verificationCodes[mobile] = {
      code,
      expires: Date.now() + 300000,
      data: { telegramId, mobile, username, password }
    };

    writeDB(db);
    res.json({ success: true, message: 'Código enviado via Telegram' });

  } catch (error) {
    console.error('Error enviando código por Telegram:', error);
    res.status(400).json({ 
      error: 'Error enviando código. Verifica:',
      details: [
        'El ID de Telegram es correcto',
        'Has iniciado chat con el bot',
        'El número tiene prefijo internacional (+xx)'
      ]
    });
  }
});

app.post('/api/verify', async (req, res) => {
  const db = readDB();
  const { mobile, code } = req.body;
  const record = db.verificationCodes[mobile];

  if (!record || record.code !== parseInt(code)) {
    return res.status(401).json({ error: 'Código inválido' });
  }

  if (Date.now() > record.expires) {
    delete db.verificationCodes[mobile];
    writeDB(db);
    return res.status(401).json({ error: 'Código expirado' });
  }

  const hashedPassword = await bcrypt.hash(record.data.password, 10);
  const newProfile = generateProfile(record.data.username);
  
  db.profiles.push({
    ...record.data,
    password: hashedPassword,
    verified: true,
    profile: newProfile
  });

  delete db.verificationCodes[mobile];
  writeDB(db);

  res.json({ success: true, message: 'Cuenta verificada' });
});

app.post('/api/login', async (req, res) => {
  const db = readDB();
  const { username, password } = req.body;
  const user = db.profiles.find(u => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { username: user.username, mobile: user.mobile },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ 
    success: true,
    token,
    profile: user.profile
  });
});

app.get('/api/profile', authMiddleware, (req, res) => {
  const db = readDB();
  const user = db.profiles.find(u => u.username === req.user.username);
  res.json(user.profile);
});

app.post('/api/profile/update', authMiddleware, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), (req, res) => {
  const db = readDB();
  const userIndex = db.profiles.findIndex(u => u.username === req.user.username);
  
  if (userIndex === -1) return res.status(404).json({ error: 'Usuario no encontrado' });

  const updates = {};
  if (req.files.avatar) {
    updates.avatar = `/images/${req.files.avatar[0].filename}`;
  }
  if (req.files.banner) {
    updates.banner = `/images/${req.files.banner[0].filename}`;
  }
  if (req.body.nickname) {
    updates.nickname = req.body.nickname;
  }

  db.profiles[userIndex].profile = { 
    ...db.profiles[userIndex].profile,
    ...updates
  };

  writeDB(db);
  res.json({ success: true, profile: db.profiles[userIndex].profile });
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../WEB-DEDSEC')));
app.use('/images', express.static(UPLOAD_DIR));

// Rutas de vistas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../WEB-DEDSEC/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../WEB-DEDSEC/Auth/login-register.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../WEB-DEDSEC/Auth/login-register.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../WEB-DEDSEC/Profile/profile.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use((err, req, res, next) => {
  console.error("Error centralizado:", err);
  res.status(500).json({ error: 'Error interno del servidor', details: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🛡️ Servidor activo en http://localhost:${PORT}`);
});
