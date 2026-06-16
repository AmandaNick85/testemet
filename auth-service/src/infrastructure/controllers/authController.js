import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../database/models/User.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

// ==========================================
// 1. REGISTO / CADASTRO (Aberto ou Admin)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, id_institucional, password, role } = req.body;

    if (!id_institucional) {
      return res.status(400).json({ error: 'O ID Institucional é obrigatório.' });
    }

    const userExists = await User.findOne({ where: { id_institucional } });
    if (userExists) {
      return res.status(400).json({ error: 'Este ID Institucional já está registado.' });
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar utilizador com id_institucional
    const newUser = await User.create({
      name,
      id_institucional,
      password: hashedPassword,
      role: role || 'TECNICO'
    });

    res.status(201).json({
      message: 'Utilizador registado com sucesso!',
      user: { id: newUser.id, name: newUser.name, id_institucional: newUser.id_institucional, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registar o utilizador.', details: error.message });
  }
});

// ==========================================
// 2. LOGIN (Gera o Token JWT)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { id_institucional, password } = req.body;

    if (!id_institucional || !password) {
      return res.status(400).json({ error: 'ID Institucional e senha são obrigatórios.' });
    }

    const user = await User.findOne({ where: { id_institucional } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas (ID ou Senha incorretos).' });
    }

    // Validar a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas (ID ou Senha incorretos).' });
    }

    // Gerar o Token JWT com expiração
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'chave_secreta_super_segura_medmetrics',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login efetuado com sucesso!',
      token,
      user: { id: user.id, name: user.name, id_institucional: user.id_institucional, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar o login.', details: error.message });
  }
});

// ==========================================
// 3. CRUD: LISTAR UTILIZADORES (Protegido - Apenas DIRETOR)
// ==========================================
router.get('/users', protect, restrictTo('DIRETOR'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'id_institucional', 'role', 'createdAt']
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar utilizadores.' });
  }
});

// ==========================================
// 4. CRUD: ATUALIZAR UTILIZADOR (Protegido - Apenas DIRETOR)
// ==========================================
router.put('/users/:id', protect, restrictTo('DIRETOR'), async (req, res) => {
  try {
    const { name, id_institucional, role, password } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    // Atualizar dados básicos
    if (name) user.name = name;
    if (id_institucional) user.id_institucional = id_institucional;
    if (role) user.role = role;

    // Se uma nova senha for enviada, criptografa-a
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({ 
      message: 'Utilizador atualizado com sucesso!', 
      user: { id: user.id, name: user.name, id_institucional: user.id_institucional, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o utilizador.' });
  }
});

// ==========================================
// 5. CRUD: REMOVER UTILIZADOR (Protegido - Apenas DIRETOR)
// ==========================================
router.delete('/users/:id', protect, restrictTo('DIRETOR'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    // Impede que o diretor se elimine a si próprio por acidente
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Não pode remover a sua própria conta de Diretor.' });
    }

    await user.destroy();
    res.status(200).json({ message: 'Utilizador removido do ecossistema com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover o utilizador.' });
  }
});

export default router;