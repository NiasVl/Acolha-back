import { conexao } from '../conn.js';

export async function aprovarEmpresa(idEmpresa) {
  const conn = await conexao();

  const [result] = await conn.execute(
    'UPDATE tb_empresa SET is_aproved = ? WHERE id = ?',
    [1, idEmpresa]
  );

  return { id: idEmpresa, is_aproved: 1 };
}
