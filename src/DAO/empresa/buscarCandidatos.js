import { conexao } from '../conn.js';

export async function candidatosDaVaga(vaga_id) {
    const conn = await conexao();

    const [rows] = await conn.execute(
        `
        SELECT 
            u.nome,
            u.email,
            u.telefone,
            c.dataCandidatura as dataCandidatura,
            c.curriculo
        FROM tb_candidatos c
        JOIN tb_usuarios u ON u.id = c.usuarios_id
        WHERE c.vaga_id = ?
        ORDER BY c.dataCandidatura DESC
        `,
        [vaga_id]
    );

    return rows;
}
