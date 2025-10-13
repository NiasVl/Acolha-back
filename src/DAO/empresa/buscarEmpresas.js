import { conexao } from '../conn.js';

export async function buscarEmpresas() {
  const conn = await conexao();

  const [rows] = await conn.execute('SELECT * FROM tb_empresa');
  return rows;
}


