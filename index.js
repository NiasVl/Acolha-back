import express from "express";
import cors from "cors";

import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import jwt  from "jsonwebtoken";

const app = express(); 

import { conexao, testarConexao }  from './src/DAO/conn.js';

import { addUsuario }  from './src/DAO/usuario/addUsuarios.js';
import { buscarUsuarios }  from './src/DAO/usuario/buscarUsuarios.js';

import { addEmpresa }  from './src/DAO/empresa/addEmpresa.js';


import { autenticarToken }  from './src/DAO/middleware/Auth.js';
import gerarTokens  from './src/DAO/auth/gerarTokens.js';

dotenv.config();

app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"]
}));

app.use(express.json());



app.post('/acolha/v1/add_usuarios', async (req, res) => {
  try {
    const {nome, email, senha, nacionalidade, cpf, telefone, dataNasc } = req.body;

    if ( !nome || !email || !senha || !nacionalidade || !cpf || !telefone || !dataNasc ) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const usuario = {nome, email, senha, nacionalidade, cpf, telefone, dataNasc };
    const result = await addUsuario(usuario);

    res.status(201).json({ mensagem: "Usuário inserido com sucesso", usuario: result });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }

    console.error("Erro ao inserir usuário:", err);
    res.status(500).json({ erro: "Erro interno ao inserir usuário" });
  }
});

app.post('/acolha/v1/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  try {
    const usuarios = await buscarUsuarios();
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const { accessToken, refreshToken } = gerarTokens(usuario);

    if(usuario.email === "user@ADM.com" && senhaCorreta === true){
      usuario.role = 'admin'; 
      res.status(200).json({ 
        mensagem: "Login bem-sucedido", 
        accessToken, 
        refreshToken,
        role: usuario.role,
      });
      return;

    }
 
   usuario.role = 'user';
    res.status(200).json({ 
      mensagem: "Login bem-sucedido", 
      accessToken, 
      refreshToken,
      role: usuario.role,
    });
  

  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).json({ erro: "Erro interno ao buscar usuários" });
  }
});
;

app.post('/acolha/v1/add_empresa', async (req, res) => {

    const {nome,email,senha,cnpj,telefone,nomeRep,cargoRep,nichoEmpresa,msg} = req.body;
    
        if ( !nome || !email || !senha || !cnpj || !telefone || !nomeRep || !cargoRep || !nichoEmpresa || !msg ) {
          return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
        }
    
    const empresa = {nome,email,senha,cnpj,telefone,nomeRep,cargoRep,nichoEmpresa,msg };

    try {
        const result = await addEmpresa(empresa);
        res.status(201).json({ mensagem: "Empresa inserida com sucesso", empresa: result });

        
    } catch (err) {
       
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ erro: "Email já cadastrado" });
        }
    
        console.error("Erro ao inserir empresa:", err);
        res.status(500).json({ erro: "Erro interno ao inserir empresa" });  
      }
});

app.post('/acolha/v1/token/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ erro: 'Refresh token não fornecido' });
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ erro: 'Refresh token inválido ou expirado' });
    }

    const novoAccessToken = jwt.sign(
      {
        id: usuario.id,
        
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: novoAccessToken });
  });
});


app.listen(process.env.PORT, (err) => {
  if (err) {
    console.error('Erro ao iniciar o servidor:', err);
    return;
  }
  console.log("API rodando na porta " + process.env.PORT);
  testarConexao();
});
