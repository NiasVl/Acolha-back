import { conexao } from '../conn.js';

export async function criarVagas(empresa_id, titulo, descricao, salario, local) {

const conn = await conexao();

const [result] = await conn.execute(
            "INSERT INTO tb_vagas (empresa_id, titulo, descricao, salario, local) VALUES (?, ?, ?, ?, ?)",
            [empresa_id, titulo, descricao, salario, local]
        )
    return result;
    }