import { conexao } from '../conn.js';

export async function buscarUsuarios() {
  const conn = await conexao();

  const [rows] = await conn.execute('SELECT id, nome, email, senha FROM tb_usuarios');
  return rows;
}


