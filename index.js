import path from "path";
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
import { listarTodasAsVagas } from "./src/DAO/usuario/buscarTodasVagas.js"; 
import { candidatar } from "./src/DAO/usuario/candidatar.js";
import { uploadCurriculo } from "./src/DAO/middleware/uploadCurriculo.js";


import { addEmpresa } from "./src/DAO/empresa/addEmpresa.js";
import { buscarEmpresas } from "./src/DAO/empresa/buscarEmpresas.js";
import { aprovarEmpresa } from "./src/DAO/empresa/aprovarEmpresa.js";
import { deletarEmpresa } from "./src/DAO/empresa/deletarEmpresa.js";
import { criarVagas } from "./src/DAO/empresa/criarVagas.js";
import { buscarVagas } from "./src/DAO/empresa/buscarVagas.js";
import { contarCandidatosPorVaga } from "./src/DAO/empresa/contarCandidatos.js";
import { candidatosDaVaga } from "./src/DAO/empresa/buscarCandidatos.js";

import { criarSolicitacao } from "./src/DAO/solicitacao/criarSolicitacao.js";
import { gerarProtocolo } from "./src/DAO/utils/gerarProtocolos.js"
import { listarSolicitacoes } from "./src/DAO/solicitacao/listarSolicitacoes.js";
import { listarSolicitacoesEmpresa } from "./src/DAO/solicitacao/listarSolicitacoesEmpresa.js";

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
app.use("/uploads", express.static("uploads"));
app.use("/curriculos", express.static(path.join(process.cwd(), "uploads/curriculos")));


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
      role: empresa.role,
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

app.get("/acolha/v1/buscar_vagas", async (req, res) => {
  let vagas = await listarTodasAsVagas();

  res.status(200).json(vagas);


})

app.post("/acolha/v1/candidatar", uploadCurriculo.single("curriculo"), async (req, res) => {
    try {
        const { usuarios_id, vaga_id } = req.body;

        if (!usuarios_id || !vaga_id) {
            return res.status(400).json({ erro: "Dados incompletos" });
        }

        if (!req.file) {
            return res.status(400).json({ erro: "Currículo PDF é obrigatório" });
        }

        const caminhoPDF = req.file.path;

        const result = await candidatar(usuarios_id, vaga_id, caminhoPDF);

        res.status(201).json({
            mensagem: "Candidatura registrada com sucesso!",
            id: result.insertId,
            curriculo: caminhoPDF
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: err.message });
    }
});


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

app.post("/acolha/v1/candidatos_vaga", async (req, res) => {
    try {
        const { vaga_id } = req.body;

        if (!vaga_id) {
            return res.status(400).json({ erro: "vaga_id é obrigatório" });
        }

        const candidatos = await candidatosDaVaga(vaga_id);
        res.json(candidatos);

    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post("/acolha/v1/total_candidatos", async (req, res) => {
    const { empresa_id } = req.body;

    if (!empresa_id) {
        return res.status(400).json({ erro: "ID da empresa é obrigatório" });
    }

    try {
        const contagem = await contarCandidatosPorVaga(empresa_id);
        res.status(200).json(contagem);
    } catch (err) {
        console.error("Erro ao contar candidatos:", err);
        res.status(500).json({ erro: "Erro interno ao contar candidatos" });
    }
});




// OUTROS

app.post("/acolha/v1/solicitacao/criar", async (req, res) => {
  try {
    const { usuario_id, empresa_id, assunto, descricao } = req.body;

    if (!assunto || !descricao) {
      return res.status(400).json({ erro: "Assunto e descrição são obrigatórios" });
    }

    const protocolo = gerarProtocolo();

    const resultado = await criarSolicitacao({
      protocolo,
      usuario_id,
      empresa_id,
      assunto,
      descricao
    });

    res.status(201).json({
      mensagem: "Solicitação criada com sucesso!",
      protocolo: protocolo,
      id: resultado.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar solicitação" });
  }
});

app.post("/acolha/v1/solicitacao/minhas", async (req, res) => {
  try {
    const { usuario_id } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ erro: "ID do usuário é obrigatório" });
    }

    const solicitacoes = await listarSolicitacoes(usuario_id);
    res.status(200).json(solicitacoes);


  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar solicitações" });
  }
});

app.post("/acolha/v1/solicitacao/empresa", async (req, res) => {
  try {
    const { empresa_id } = req.body;

    if (!empresa_id) {
      return res.status(400).json({ erro: "ID do usuário é obrigatório" });
    }

    const solicitacoes = await listarSolicitacoesEmpresa(empresa_id);
    res.status(200).json(solicitacoes);


  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar solicitações" });
  }
});

app.get("/acolha/v1/solicitacao/todas", async (req, res) => {
  try {
    const conn = await conexao();
    const [rows] = await conn.execute(`
      SELECT *
      FROM tb_solicitacoes
      ORDER BY id DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar solicitações" });
  }
});

app.post("/acolha/v1/solicitacao/excluir", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ erro: "ID da solicitação é obrigatório" });
    }

    const conn = await conexao();
    await conn.execute("DELETE FROM tb_solicitacoes WHERE id = ?", [id]);

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao excluir solicitação" });
  }
});

app.post("/acolha/v1/solicitacao/responder", async (req, res) => {
  try {
    const { id, resposta } = req.body;

    if (!id || !resposta) {
      return res.status(400).json({ erro: "ID e resposta são obrigatórios" });
    }

    const conn = await conexao();
    
    await conn.execute(
      "UPDATE tb_solicitacoes SET resposta_admin = ?, status = 'Respondida' WHERE id = ?",
      [resposta, id]
    );

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao responder solicitação" });
  }
});

app.post("/acolha/v1/solicitacao/protocolo", async (req, res) => {
  try {
    const { protocolo } = req.body;

    if (!protocolo) {
      return res.status(400).json({ erro: "O protocolo é obrigatório" });
    }

    const conn = await conexao();

    const [rows] = await conn.execute(
      `
      SELECT 
        id,
        usuario_id,
        empresa_id,
        assunto,
        descricao,
        resposta_admin AS resposta,
        status,
        protocolo,
        data_criacao
      FROM tb_solicitacoes
      WHERE protocolo = ?
      `,
      [protocolo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Solicitação não encontrada" });
    }

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar solicitação por protocolo" });
  }
});





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
