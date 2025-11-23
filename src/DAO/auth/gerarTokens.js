import jwt from 'jsonwebtoken';

export default function gerarTokens(usuario) {
  const accessToken = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, cpf: usuario.CPF, telefone: usuario.telefone, dataNasc: usuario.dataNasc, nacionalidade: usuario.nacionalidade, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } 
  );

  const refreshToken = jwt.sign(
    { id: usuario.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } 
  );

  return { accessToken, refreshToken };
}


