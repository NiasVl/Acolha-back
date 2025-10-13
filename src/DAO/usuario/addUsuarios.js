import { conexao } from '../conn.js'
import bcrypt from 'bcrypt'; 

export async function addUsuario(usuario) {
  const conn = await conexao();

  const senhaHash = await bcrypt.hash(usuario.senha, 10);

  const [result] = await conn.execute(
    'INSERT INTO tb_usuarios (nome, email, senha, nacionalidade, CPF, telefone, dataNasc) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [usuario.nome, usuario.email, senhaHash, usuario.nacionalidade, usuario.cpf, usuario.telefone, usuario.dataNasc]
  );

  return {nome: usuario.nome, email: usuario.email };
}

