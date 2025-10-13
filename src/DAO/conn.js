import mysql from "mysql2/promise"
import { config } from "dotenv"
 
config()
 
export async function conexao(){
    const pool = mysql.createPool({
        host: process.env.DB_HOST, 
        port:  process.env.DB_PORT,
        user: process.env.DB_USER, 
        password: process.env.DB_PASS, 
        database: process.env.DB_NAME,
    })
 
    return pool
}

export async function closeConexao(pool) {
    if (pool) {
        console.log("Fechando a conexão com o banco de dados")
        await pool.end()
    } else {
        console.log("Conexão já fechada")
    }
}
 
export async function testarConexao() {
  try {
    const pool = await conexao();
    const conn = await pool.getConnection();
    await conn.ping();
    console.log("✅ Conexão com o MySQL bem-sucedida!");
    conn.release();
  } catch (erro) {
    console.error("❌ Falha ao conectar com o MySQL:", erro.message);
  }
}
 
