import { conexao } from '../conn.js'
import bcrypt from 'bcrypt'; 

export async function addEmpresa(empresa) {
  const conn = await conexao();

  const senhaHash = await bcrypt.hash(empresa.senha, 10);

  const [result] = await conn.execute(
    'INSERT INTO tb_empresa (nomeEmpresa, emailEmpresa, senhaEmpresa, CNPJ, telefone, nomeRep, cargoRep, nichoEmpresa, msgToADM, is_aproved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [empresa.nome, empresa.email, senhaHash, empresa.cnpj, empresa.telefone, empresa.nomeRep, empresa.cargoRep, empresa.nichoEmpresa, empresa.msg, false]
  );

  return {nome: empresa.nome, email: empresa.email };
}
