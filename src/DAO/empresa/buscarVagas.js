import { conexao } from '../conn.js';

export async function buscarVagas(empresa_id) {
  const conn = await conexao();

  const [rows] = await conn.execute(
    'SELECT * FROM tb_vagas WHERE empresa_id = ?',
    [empresa_id]
  );

  return rows;
}