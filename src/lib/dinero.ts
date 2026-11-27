/** Pesos → centavos (enteros, sin errores de punto flotante). */
export function aCentavos(pesos: number | string): number {
  return Math.round(Number(pesos) * 100);
}

/** Centavos → pesos para mostrar. */
export function aPesos(centavos: number): number {
  return centavos / 100;
}

/** Formato argentino: $ 300.000 */
export function fmtMoneda(centavos: number): string {
  return '$ ' + aPesos(centavos).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function fmtMonedaDetallada(centavos: number): string {
  return '$ ' + aPesos(centavos).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
