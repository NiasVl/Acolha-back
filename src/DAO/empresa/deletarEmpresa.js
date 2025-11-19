import { conexao } from '../conn.js';

export async function deletarEmpresa(id) {
  const conn = await conexao();

  const [rows] = await conn.execute('DELETE FROM tb_empresa WHERE id = ?', [id]);
  return rows;
}

