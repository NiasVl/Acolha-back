import express from "express";
import cors from "cors";

import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();

import { conexao, testarConexao } from "./src/DAO/conn.js";

import { addUsuario } from "./src/DAO/usuario/addUsuarios.js";
import { buscarUsuarios } from "./src/DAO/usuario/buscarUsuarios.js";
import { deletarUsuario } from "./src/DAO/usuario/deleteUsuario.js";

import { addEmpresa } from "./src/DAO/empresa/addEmpresa.js";
import { buscarEmpresas } from "./src/DAO/empresa/buscarEmpresas.js";
import { aprovarEmpresa } from "./src/DAO/empresa/aprovarEmpresa.js";
import { deletarEmpresa } from "./src/DAO/empresa/deletarEmpresa.js";
import { criarVagas } from "./src/DAO/empresa/criarVagas.js";
import { buscarVagas } from "./src/DAO/empresa/buscarVagas.js";

import { autenticarToken } from "./src/DAO/middleware/Auth.js";
import gerarTokens from "./src/DAO/auth/gerarTokens.js";
import gerarTokensEmpresas from "./src/DAO/auth/gerarTokensEmpresas.js";

dotenv.config();

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  })
);

app.use(express.json());

app.post("/acolha/v1/login_usuario", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  try {
    const usuarios = await buscarUsuarios();
    const usuario = usuarios.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!usuario) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    // Gera tokens
    const { accessToken, refreshToken } = gerarTokens(usuario);

    // 👉 Verificação do domínio ADM
    if (usuario.email.toLowerCase().includes("@adm.com")) {
      usuario.role = "admin";
    } else {
      usuario.role = "user";
    }

    // Resposta final
    return res.status(200).json({
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

app.post("/acolha/v1/login_empresa", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  try {
    const empresas = await buscarEmpresas();
    const empresa = empresas.find((u) => u.emailEmpresa.toLowerCase() === email.toLowerCase());

    if (!empresa) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const senhaCorreta = await bcrypt.compare(senha, empresa.senhaEmpresa);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    // Gera tokens
    const { accessToken, refreshToken } = gerarTokensEmpresas(empresa);

    return res.status(200).json({
      mensagem: "Login bem-sucedido",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Erro ao buscar empresas:", err);
    res.status(500).json({ erro: "Erro interno ao buscar empresas" });
  }
});

// USUARIO

app.get("/acolha/v1/buscar_usuarios", async (req, res) => {
  let usuarios = await buscarUsuarios();
  res.status(200).json(usuarios);
})

app.post("/acolha/v1/add_usuarios", async (req, res) => {
  try {
    const { nome, email, senha, nacionalidade, cpf, telefone, dataNasc } =
      req.body;

    if (
      !nome ||
      !email ||
      !senha ||
      !nacionalidade ||
      !telefone ||
      !dataNasc
    ) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    if (cpf == undefined || cpf === null) {
      cpf = "none";
    }

    const usuario = {
      nome,
      email,
      senha,
      nacionalidade,
      cpf,
      telefone,
      dataNasc,
    };
    const result = await addUsuario(usuario);

    res
      .status(201)
      .json({ mensagem: "Usuário inserido com sucesso", usuario: result });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }

    console.error("Erro ao inserir usuário:", err);
    res.status(500).json({ erro: "Erro interno ao inserir usuário" });
  }
});

app.post("/acolha/v1/delete_usuario", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ erro: "ID do usuário é obrigatório" });
  }

  try {
    await deletarUsuario(id);
    res.status(200).json({ mensagem: "Usuário deletado com sucesso" });
  }
  catch (err) {
    console.error("Erro ao deletar usuário:", err);
    res.status(500).json({ erro: "Erro interno ao deletar usuário" });
  }
})

// EMPRESA

app.post("/acolha/v1/add_empresa", async (req, res) => {
  const {
    nome,
    email,
    senha,
    cnpj,
    telefone,
    nomeRep,
    cargoRep,
    nichoEmpresa,
    msg,
  } = req.body;

  if (
    !nome ||
    !email ||
    !senha ||
    !cnpj ||
    !telefone ||
    !nomeRep ||
    !cargoRep ||
    !nichoEmpresa ||
    !msg
  ) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
  }

  const empresa = {
    nome,
    email,
    senha,
    cnpj,
    telefone,
    nomeRep,
    cargoRep,
    nichoEmpresa,
    msg,
  };

  try {
    const result = await addEmpresa(empresa);
    res
      .status(201)
      .json({
        mensagem:
          "Empresa registrada com sucesso, fique atento ao seu Email, após passar por análise mandaremos um Email dizendo se a empresa foi ACEITA ou NÃO.",
        empresa: result,
      });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }

    console.error("Erro ao inserir empresa:", err);
    res.status(500).json({ erro: "Erro interno ao inserir empresa" });
  }
});

app.get("/acolha/v1/buscar_empresas", async (req, res) => {
  let empresas = await buscarEmpresas();
  res.status(200).json(empresas);
})

app.patch("/acolha/v1/aprovar_empresa", async (req, res) => {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json({ erro: "ID da empresa é obrigatório" });
  }

  try {
    const result = await aprovarEmpresa(id);
    res.status(200).json({ mensagem: "Empresa aprovada com sucesso", empresa: result });
  }
  catch (err) {
    console.error("Erro ao aprovar empresa:", err);
    res.status(500).json({ erro: "Erro interno ao aprovar empresa" });
  }



})

app.post("/acolha/v1/delete_empresa", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ erro: "ID da empresa é obrigatório" });
  }

  try {
    await deletarEmpresa(id);
    res.status(200).json({ mensagem: "Empresa deletada com sucesso" });
  }
  catch (err) {
    console.error("Erro ao deletar empresa:", err);
    res.status(500).json({ erro: "Erro interno ao deletar empresa" });
  }
})

app.post("/acolha/v1/criar_vaga", async (req, res) => {
    const { empresa_id, titulo, descricao, salario, local } = req.body;

    if (!empresa_id || !titulo) {
        return res.status(400).json({ erro: "Dados incompletos" });
    }

    try {
        const result = await criarVagas(empresa_id, titulo, descricao, salario, local);
        

        res.status(201).json({ mensagem: "Vaga criada com sucesso", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao criar vaga" });
    }
}
);

app.post("/acolha/v1/vagas_empresa", (req, res) => {

  const { empresa_id } = req.body;

  if (!empresa_id) {
      return res.status(400).json({ erro: "ID da empresa é obrigatório" });
  }

  buscarVagas(empresa_id)
      .then(vagas => {
          res.status(200).json(vagas);
      })
      .catch(err => {
          console.error("Erro ao buscar vagas:", err);
          res.status(500).json({ erro: "Erro interno ao buscar vagas" });
      });

})

// OUTROS

app.post("/acolha/v1/token/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ erro: "Refresh token não fornecido" });
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res
        .status(403)
        .json({ erro: "Refresh token inválido ou expirado" });
    }

    const novoAccessToken = jwt.sign(
      {
        id: usuario.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: novoAccessToken });
  });
});

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.error("Erro ao iniciar o servidor:", err);
    return;
  }
  console.log("API rodando na porta " + process.env.PORT);
  testarConexao();
});
