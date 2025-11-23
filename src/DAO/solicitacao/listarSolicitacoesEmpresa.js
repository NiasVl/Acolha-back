import { conexao } from "../conn.js";

export async function listarSolicitacoesEmpresa(empresa_id) {

    const conn = await conexao();
    const [rows] = await conn.execute(
      "SELECT * FROM tb_solicitacoes WHERE empresa_id = ? ORDER BY id DESC",
      [empresa_id]
    );

    return rows;

}