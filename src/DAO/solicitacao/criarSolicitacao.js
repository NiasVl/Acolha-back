import { conexao } from "../conn.js";

export async function criarSolicitacao(data) {
    const conn = await conexao();

    const sql = `
        INSERT INTO tb_solicitacoes 
        (protocolo, usuario_id, empresa_id, assunto, descricao)
        VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
        data.protocolo,
        data.usuario_id || null,
        data.empresa_id || null,
        data.assunto,
        data.descricao
    ];

    const [result] = await conn.execute(sql, params);
    return result;
}
