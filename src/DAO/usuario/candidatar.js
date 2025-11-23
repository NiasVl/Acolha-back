import { conexao } from '../conn.js';

export async function candidatar(usuarios_id, vaga_id, curriculo) {
    const conn = await conexao();

    const [existe] = await conn.execute(
        "SELECT id FROM tb_candidatos WHERE usuarios_id = ? AND vaga_id = ?",
        [usuarios_id, vaga_id]
    );

    if (existe.length > 0) {
        throw new Error('Candidatura já existe.');
    }

    const [result] = await conn.execute(
        `INSERT INTO tb_candidatos (usuarios_id, vaga_id, curriculo)
         VALUES (?, ?, ?)`,
        [usuarios_id, vaga_id, curriculo]
    );

    return result;
}
