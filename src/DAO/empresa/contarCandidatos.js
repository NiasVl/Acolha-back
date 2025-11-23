import { conexao } from "../conn.js";

export async function contarCandidatosPorVaga(empresa_id) {
    const conn = await conexao();

    const query = `
        SELECT 
            v.id AS vaga_id,
            v.titulo,
            COUNT(c.id) AS total_candidatos
        FROM tb_vagas v
        LEFT JOIN tb_candidatos c ON c.vaga_id = v.id
        WHERE v.empresa_id = ?
        GROUP BY v.id
        ORDER BY v.dataCriacao DESC
    `;

    const [rows] = await conn.execute(query, [empresa_id]);
    return rows;
}
