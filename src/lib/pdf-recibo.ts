import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { fmtMoneda } from './dinero';
import { badRequest, forbidden } from './errores';
import { esInquilinoDelContrato } from '@/services/contratos-service';
import { getRecibo } from '@/services/pagos-service';
import type { UsuarioPublico } from '@/db/schema';

const NAVY = rgb(0.11, 0.17, 0.29);
const GRIS = rgb(0.42, 0.45, 0.5);
const VERDE = rgb(0.10, 0.56, 0.37);
const ROJO = rgb(0.75, 0.22, 0.17);
const LINEA = rgb(0.90, 0.91, 0.93);

export async function generarRecibo(id: number, usuario: UsuarioPublico): Promise<Uint8Array> {
  const fila = await getRecibo(id);
  const pago = fila.pago;

  const esInquilinoAutorizado =
    usuario.rol === 'inquilino' &&
    usuario.inquilinoId != null &&
    (await esInquilinoDelContrato(usuario.inquilinoId, pago.contratoId));

  const tienePermiso =
    usuario.rol === 'admin' ||
    esInquilinoAutorizado ||
    (usuario.rol !== 'inquilino' && usuario.propietarioId === fila.propietarioId);

  if (!tienePermiso) throw forbidden('No tenés permiso para ver este comprobante.');
  if (pago.estado !== 'pagado') {
    throw badRequest('Este pago todavía no fue cobrado, no se puede generar el comprobante.');
  }

  const doc = await PDFDocument.create();
  const normal = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595, 842]); // A4
  let y = 792;

  const texto = (
    s: string,
    x: number,
    yy: number,
    tam = 10,
    font: PDFFont = normal,
    color = NAVY,
  ) => page.drawText(s, { x, y: yy, size: tam, font, color });

  const separador = (yy: number) =>
    page.drawLine({ start: { x: 50, y: yy }, end: { x: 545, y: yy }, thickness: 1, color: LINEA });

  texto('RentAR', 50, y, 18, bold);
  texto('Gestión inteligente de alquileres · Tucumán, Argentina', 50, y - 22, 9, normal, GRIS);
  y -= 62;
  texto('Comprobante de pago', 50, y, 16, bold);
  y -= 22;
  texto(`N° de comprobante: RC-${String(id).padStart(6, '0')}`, 50, y, 10, normal, GRIS);
  texto(
    `Fecha de emisión: ${new Date().toLocaleDateString('es-AR', {
      day: '2-digit', month: 'long', year: 'numeric',
    })}`,
    50, y - 14, 10, normal, GRIS,
  );
  y -= 44;
  separador(y);
  y -= 24;

  const filaDatos = (etiqueta: string, valor: string) => {
    texto(etiqueta, 50, y, 9, normal, GRIS);
    texto(valor || '—', 50, y - 14, 11, bold);
    y -= 42;
  };

  filaDatos('PROPIEDAD', fila.propiedadNombre);
  filaDatos('DIRECCIÓN', fila.propiedadDireccion);
  filaDatos('INQUILINO', `${fila.inquilinoNombre}${fila.inquilinoDni ? ' — DNI ' + fila.inquilinoDni : ''}`);
  filaDatos('PROPIETARIO', fila.propietarioNombre);
  filaDatos('CONTRATO', `#${pago.contratoId} (del ${fila.fechaInicio} al ${fila.fechaFin})`);

  separador(y);
  y -= 24;
  texto('Detalle del pago', 50, y, 12, bold);
  y -= 24;
  texto('CONCEPTO', 50, y, 9, bold, GRIS);
  texto('IMPORTE', 450, y, 9, bold, GRIS);
  y -= 16;
  separador(y);
  y -= 14;

  texto(`Alquiler mensual — ${pago.mes}`, 50, y, 10, normal);
  texto(fmtMoneda(pago.montoCentavos), 450, y, 10, normal);
  y -= 22;

  if (pago.interesCentavos > 0) {
    texto('Interés por mora', 50, y, 10, normal, ROJO);
    texto(fmtMoneda(pago.interesCentavos), 450, y, 10, normal, ROJO);
    y -= 22;
  }

  separador(y);
  y -= 18;
  texto('TOTAL PAGADO', 50, y, 12, bold);
  texto(fmtMoneda(pago.montoCentavos + pago.interesCentavos), 450, y, 12, bold, VERDE);
  y -= 36;
  texto(`Fecha de pago: ${pago.fechaPago ?? '—'}`, 50, y, 9, normal, GRIS);
  texto('Estado: Pagado', 50, y - 14, 9, normal, GRIS);

  texto(
    'Este comprobante fue generado automáticamente por RentAR y no requiere firma.',
    50, 50, 8, normal, GRIS,
  );

  return doc.save();
}

export function cabecerasPdf(id: number): Record<string, string> {
  return {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="recibo-pago-${String(id).padStart(6, '0')}.pdf"`,
    'Cache-Control': 'no-store',
  };
}
