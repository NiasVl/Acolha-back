import jwt from 'jsonwebtoken';

export default function gerarTokens(empresa) {
  const accessToken = jwt.sign(
    { id: empresa.id, nome: empresa.nomeEmpresa, email: empresa.emailEmpresa },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } 
  );

  const refreshToken = jwt.sign(
    { id: empresa.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } 
  );

  return { accessToken, refreshToken };
}


