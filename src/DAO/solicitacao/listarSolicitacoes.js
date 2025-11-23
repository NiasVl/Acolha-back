import { conexao } from "../conn.js";

export async function listarSolicitacoes(usuario_id) {

    const conn = await conexao();
    const [rows] = await conn.execute(
      "SELECT * FROM tb_solicitacoes WHERE usuario_id = ? ORDER BY id DESC",
      [usuario_id]
    );

    return rows;

}