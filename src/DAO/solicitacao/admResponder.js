import { conexao } from "../conn.js";

export async function admResponder(resposta, id) {
    
    const conn = await conexao();
    await conn.execute(
      "UPDATE tb_solicitacoes SET resposta_admin = ?, status = 'respondido' WHERE id = ?",
      [resposta, id]
    );

    res.json({ mensagem: "Resposta enviada!" });

}