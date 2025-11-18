import { conexao } from '../conn.js';

export async function deletarUsuario(id) {
  const conn = await conexao();

  const [rows] = await conn.execute('DELETE FROM tb_usuarios WHERE id = ?', [id]);
  return rows;
}

