import { conexao } from '../conn.js'


export async function listarTodasAsVagas() {
  const conn = await conexao();
  const [rows] = await conn.execute('SELECT * FROM tb_vagas');
  return rows;
}