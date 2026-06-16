import jwt from 'jsonwebtoken';
import User from '../database/models/User.js';

// Middleware para verificar se o utilizador está logado (Possui Token JWT Válido)
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Verificar se o Token foi enviado nos Headers (Authorization: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Acesso negado. Token de autenticação não fornecido.' });
    }

    // 2. Validar e decodificar o Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta_super_segura_medmetrics');

    // 3. Verificar se o utilizador dono do token ainda existe no Postgres
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ error: 'O utilizador dono deste token já não existe no sistema.' });
    }

    // 4. Injetar o utilizador dentro da requisição para os próximos passos usarem
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.', details: error.message });
  }
};

// Middleware para controlo de acesso baseado em Funções / Cargos (RBAC)
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user foi injetado pelo middleware 'protect' executado logo antes
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Acesso Proibido. Esta funcionalidade é exclusiva para cargos do tipo: [${allowedRoles.join(', ')}]. O seu cargo atual é: ${req.user ? req.user.role : 'Nenhum'}` 
      });
    }
    next();
  };
};