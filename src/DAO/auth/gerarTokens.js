import jwt from 'jsonwebtoken';

export default function gerarTokens(usuario) {
  const accessToken = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email },
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


