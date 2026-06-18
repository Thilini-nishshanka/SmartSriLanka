export class BigIntUtil {
  static toBigInt(value: string | number | bigint): bigint {
    if (typeof value === 'bigint') {
      return value;
    }
    if (typeof value === 'string') {
      return BigInt(value);
    }
    return BigInt(Math.floor(value));
  }

  static toString(value: bigint): string {
    return value.toString();
  }

  static toNumber(value: bigint): number {
    return Number(value);
  }
}