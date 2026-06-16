import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthService, AnalyticsService } from './services/api';
import './App.css';

// ==========================================
// COMPONENTE: TELA DE LOGIN (Apresentação)
// ==========================================
const LoginView = () => {
  const [idInstitucional, setIdInstitucional] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!idInstitucional || !password) {
      setError('Por favor, preencha todos os campos institucionais.');
      return;
    }

    try {
      setLoading(true);
      const data = await AuthService.login(idInstitucional, password);
      
      localStorage.setItem('medmetrics_token', data.token);
      localStorage.setItem('medmetrics_role', data.user.role); 
      localStorage.setItem('medmetrics_username', data.user.name);

      if (data.user.role === 'DIRETOR') {
        navigate('/diretor');
      } else if (data.user.role === 'TECNICO') {
        navigate('/tecnico');
      } else {
        setError('Perfil de acesso não reconhecido pelo sistema.');
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      setError(
        err.response?.data?.error || 
        'Falha na conexão com o servidor de autenticação do DEGASE.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-degase-navy p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card border-t-4 border-degase-gold">
        
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-degase-light text-degase-blue font-bold text-xl mb-3 border border-slate-200">
            ⚖️
          </div>
          <h1 className="text-2xl font-bold text-degase-navy font-sans tracking-tight">MedMetrics</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">Novo DEGASE - Sistema de Saúde</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-danger border border-red-200 font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              ID Institucional (Apenas números)
            </label>
            <input
              type="text"
              value={idInstitucional}
              onChange={(e) => setIdInstitucional(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 1001"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-degase-navy focus:border-degase-blue focus:bg-white focus:outline-none transition-all"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              Senha de Acesso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-degase-navy focus:border-degase-blue focus:bg-white focus:outline-none transition-all"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-degase-blue hover:bg-degase-navy text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Validando Credenciais...' : 'Entrar no Portal'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
          Acesso restrito a servidores autorizados nos termos da lei.
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE: DASHBOARD DO DIRETOR TÉCNICO
// ==========================================
const DiretorDashboard = () => {
  const username = localStorage.getItem('medmetrics_username') || 'Diretor';
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('TECNICO');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await AuthService.listUsers();
      setUsers(data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // CORRIGIDO: Usando useEffect corretamente para evitar quebra no bundler
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newName || !newId || !newPassword) {
      setFormError('Todos os campos são obrigatórios para o cadastro.');
      return;
    }

    try {
      setSubmitting(true);
      await AuthService.registerUser({
        name: newName,
        id_institucional: newId,
        password: newPassword,
        role: newRole
      });

      setFormSuccess('Funcionário registrado com sucesso no ecossistema!');
      setNewName('');
      setNewId('');
      setNewPassword('');
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Erro ao cadastrar usuário.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, idInst) => {
    if (idInst === '1001') {
      alert('Operação negada: Não é possível remover o Diretor master do sistema.');
      return;
    }
    
    if (!window.confirm('Tem certeza que deseja remover este funcionário do sistema?')) return;

    try {
      await AuthService.deleteUser(id);
      alert('Usuário removido com sucesso!');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao remover usuário.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel de Controle do Diretor Técnico</h1>
          <p className="text-sm text-slate-500 mt-0.5">Bem-vindo, <span className="font-semibold text-degase-blue">{username}</span> | Gestão de Recursos Humanos - DEGASE</p>
        </div>
        <button onClick={handleLogout} className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm border border-rose-200/50">
          Sair do Sistema
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>👤</span> Registrar Novo Funcionário
          </h2>
          
          {formError && <div className="mb-4 p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">⚠️ {formError}</div>}
          {formSuccess && <div className="mb-4 p-3 text-xs bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-medium">✅ {formSuccess}</div>}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Carlos Silva" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-degase-blue focus:bg-white transition-all"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Institucional (Apenas números)</label>
              <input type="text" value={newId} onChange={e => setNewId(e.target.value.replace(/\D/g, ''))} placeholder="Ex: 3003" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-degase-blue focus:bg-white transition-all"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha Inicial</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-degase-blue focus:bg-white transition-all"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo / Perfil de Acesso</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-degase-blue focus:bg-white transition-all font-medium text-slate-700">
                <option value="TECNICO">TÉCNICO DE SAÚDE</option>
                <option value="DIRETOR">DIRETOR TÉCNICO</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-degase-blue hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-50 mt-2">
              {submitting ? 'Salvando no Banco...' : 'Cadastrar Servidor'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📋</span> Servidores Ativos no Sistema
            </h2>
            <button onClick={fetchUsers} className="text-xs text-degase-blue hover:underline font-semibold flex items-center gap-1">
              🔄 Atualizar Tabela
            </button>
          </div>

          {loadingUsers ? (
            <div className="text-center py-12 text-sm text-slate-400 font-medium">Buscando dados no PostgreSQL...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400 font-medium">Nenhum servidor cadastrado.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">ID Institucional</th>
                    <th className="px-4 py-3">Perfil</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-slate-900">{u.name}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{u.id_institucional}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-md ${
                          u.role === 'DIRETOR' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.id_institucional)} 
                          className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${
                            u.id_institucional === '1001' ? 'text-slate-300 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-50'
                          }`}
                          disabled={u.id_institucional === '1001'}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// ==========================================
// COMPONENTE: DASHBOARD DO TÉCNICO DE SAÚDE (CORRIGIDO E SEGURO)
// ==========================================
const TecnicoDashboard = () => {
  const username = localStorage.getItem('medmetrics_username') || 'Técnico';
  
  // Estados mapeados corretamente com os requisitos de negócio
  const [adolescenteId, setAdolescenteId] = useState('');
  const [equipe, setEquipe] = useState('EQUIPE_TECNICA'); // Começa com EQUIPE_TECNICA
  const [tipoAtendimento, setTipoAtendimento] = useState('INDIVIDUAL'); // Começa com seu Enum original
  const [descricao, setDescricao] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRecordAtendimento = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!adolescenteId || !descricao) {
      setFormError('Por favor, informe o ID do adolescente e a descrição do atendimento.');
      return;
    }

    try {
      setSubmitting(true);

      await AnalyticsService.recordAtendimento({
        adolescente_id: adolescenteId,
        equipe: equipe,
        tipo: tipoAtendimento,
        descricao: descricao,
        tecnico_responsavel: username
      });

      setFormSuccess('Atendimento clínico registrado e enviado para a base MongoDB!');
      setAdolescenteId('');
      setDescricao('');
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Erro de conexão com o Analytics-Service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Topbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel Operacional de Saúde</h1>
          <p className="text-sm text-slate-500 mt-0.5">Bem-vindo, <span className="font-semibold text-degase-blue">{username}</span> | Lançamentos Clínicos (Ambiente Técnico) - DEGASE</p>
        </div>
        <button onClick={handleLogout} className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm border border-rose-200/50">
          Sair do Sistema
        </button>
      </div>

      {/* Cards de Monitoramento Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xl">🩺</div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atendimentos Registrados</h3>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">--</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl font-bold text-xl">🏢</div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Encaminhados Rede</h3>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">--</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xl">📊</div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sincronização MongoDB</h3>
            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md mt-1 w-fit">ONLINE</p>
          </div>
        </div>
      </div>

      {/* Formulário Operacional */}
      <div className="max-w-4xl bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>📝</span> Registrar Novo Atendimento de Adolescente
        </h2>

        {formError && <div className="mb-4 p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">⚠️ {formError}</div>}
        {formSuccess && <div className="mb-4 p-3 text-xs bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-medium">✅ {formSuccess}</div>}

        <form onSubmit={handleRecordAtendimento} className="space-y-4">
          {/* Grid de 3 Colunas: Alinhamento perfeito dos dados de domínio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID do Adolescente</label>
              <input 
                type="text" 
                value={adolescenteId} 
                onChange={e => setAdolescenteId(e.target.value.replace(/\D/g, ''))} 
                placeholder="Ex: 5005" 
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-degase-blue focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Equipe Responsável</label>
              <select 
                value={equipe} 
                onChange={e => setEquipe(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-degase-blue focus:bg-white transition-all font-medium text-slate-700"
              >
                <option value="EQUIPE_TECNICA">EQUIPE TÉCNICA</option>
                <option value="SAUDE_MENTAL">EQUIPE SAÚDE MENTAL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Intervenção</label>
              <select 
                value={tipoAtendimento} 
                onChange={e => setTipoAtendimento(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-degase-blue focus:bg-white transition-all font-medium text-slate-700"
              >
                <option value="INDIVIDUAL">INDIVIDUAL</option>
                <option value="FAMILIAR">FAMILIAR</option>
                <option value="EM_GRUPO">EM GRUPO</option>
                <option value="VISITA">VISITA PRESENCIAL</option>
                <option value="VISITA_VIRTUAL">VISITA VIRTUAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Evolução Clínica / Descrição Ocorrência</label>
            <textarea 
              rows="4" 
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o quadro do adolescente ou o procedimento realizado..." 
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-degase-blue focus:bg-white transition-all resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={submitting} 
              className="bg-degase-blue hover:bg-slate-900 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Salvando no MongoDB...' : 'Salvar Atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ==========================================
// COMPONENTE: GUARDA DE ROTAS (Segurança/SOLID)
// ==========================================
const GuardedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('medmetrics_token');
  const userRole = localStorage.getItem('medmetrics_role');

  if (!token) return <Navigate to="/login" replace />;
  
  if (roleRequired && userRole !== roleRequired.toUpperCase()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ==========================================
// ORQUESTRADOR CENTRAL DE ROTAS
// ==========================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        
        <Route path="/diretor/*" element = {
          <GuardedRoute roleRequired="DIRETOR">
            <DiretorDashboard />
          </GuardedRoute>
        } />
        
        <Route path="/tecnico/*" element = {
          <GuardedRoute roleRequired="TECNICO">
            <TecnicoDashboard />
          </GuardedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;