const QRCode = require('qrcode');
const { Compra } = require('../model/Compra');
const { Usuario } = require('../model/Usuarios');
const { canonicalize, generateSignature } = require('../utils/signature'); // Importe

async function gerarQRCodeParaCompra(compra_id, usuario_id) {
  try {
    // ... (código existente até payload = JSON.parse(compra.qr_code_data))

    // Gerar assinatura com canonicalize
    const secret = process.env.QR_CODE_SECRET || 'sua-chave-secreta-qrcode';
    const assinatura = generateSignature(payload, secret); // Usa a func helper

    const qrData = {
      ...payload,
      assinatura
    };

    // ... (resto igual, gere qrCodeImage)
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw error;
  }
}

// Mantenha validarQRCodeDados se quiser usá-la em outro lugar, mas atualize similarmente
async function validarQRCodeDados(qr_code_data) {
  try {
    const dados = JSON.parse(qr_code_data);
    const { assinatura, ...payload } = dados;
    const secret = process.env.QR_CODE_SECRET || 'sua-chave-secreta-qrcode';
    const assinaturaEsperada = generateSignature(payload, secret); // Usa helper

    if (assinatura !== assinaturaEsperada) {
      return { valid: false, error: 'Assinatura inválida' };
    }

    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: 'QR Code expirado' };
    }

    return { valid: true, ...payload };
  } catch (error) {
    return { valid: false, error: 'QR Code inválido' };
  }
}

module.exports = { gerarQRCodeParaCompra, validarQRCodeDados };