export function gerarProtocolo() {
  const aleatorio = Math.floor(100000 + Math.random() * 900000);
  return "ACOL-" + aleatorio;
}
