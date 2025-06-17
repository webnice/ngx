export class UUID {
  private static pad4(num: number): string {
    let ret: string = num.toString(16);
    while (ret.length < 4) {
      ret = "0" + ret;
    }
    return ret;
  }

  private static random4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  /** Генерация UUID v4. */
  public static UuidV4(): string {
    if (typeof (window) !== "undefined" &&
      typeof (window.crypto) !== "undefined" &&
      typeof (window.crypto.getRandomValues) !== "undefined") {
      // Если найден криптографически защищённый PRNG, используем его.
      // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
      let buf: Uint16Array = new Uint16Array(8);
      window.crypto.getRandomValues(buf);
      return (
        this.pad4(buf[0]) +
        this.pad4(buf[1]) + "-" +
        this.pad4(buf[2]) + "-" +
        this.pad4(buf[3]) + "-" +
        this.pad4(buf[4]) + "-" +
        this.pad4(buf[5]) +
        this.pad4(buf[6]) +
        this.pad4(buf[7])
      );
    } else {
      // Иначе, используем библиотеку Math.random.
      // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
      // https://stackoverflow.com/questions/11605068/why-does-jshint-argue-against-bitwise-operators-how-should-i-express-this-code
      return (
        this.random4() +
        this.random4() + "-" +
        this.random4() + "-" +
        this.random4() + "-" +
        this.random4() + "-" +
        this.random4() +
        this.random4() +
        this.random4()
      );
    }
  }
}
