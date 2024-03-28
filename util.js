/**Clase de utilidades */
export class UtilNative {
  /**
   * expresion regular para dividir un string
   * de fecha con separadores:
   *
   * `"-"` ej. formato: `"dd-mm-yyyy"`
   *
   * `"/"` ej. formato: `dd/mm/yyyy`
   *
   * `"_"` ej. formato: `dd_mm_yyyy`
   *
   * `"#"` ej. formato: `dd#mm#yyyy`
   *
   * `"."` ej. formato: `dd.mm.yyyy`
   */
  sepDateRegExp = /\-|\/|\.|\#|\_|\:/;
  /**carcater de separador de ruta logica:
   *
   * ````
   * const charSeparatorLogicPath = ".";
   * const sp = charSeparatorLogicPath;
   * const path = `root${sp}object${sp}subObject`;
   * console.log(path); //salida "root.object.subobject"
   * ````
   */
  charSeparatorLogicPath = ".";
  /**carcater de separador de ruta para url:
   *
   * ````
   * const charSeparatorUrlPath = "/";
   * const sp = charSeparatorUrlPath;
   * const path = `root${sp}object${sp}subObject`;
   * console.log(path); //salida "root/object/subobject"
   * ````
   */
  charSeparatorUrlPath = "/";
  constructor() {}
  //████Booleanos███████████████████████████████████████████████████
  /**determina si un valor es booleano */
  isBoolean(bool) {
    return typeof bool === "boolean";
  }
  /**
   * Convierte cualquier valor a un tipo booleano.
   *
   * @param {any} anyToCast - El valor a cambiar (castear).
   * @param {Array<"isEmptyAsTrue" | "isZeroAsTrue" | "isNullAsTrue">} [castExceptions=["isZeroAsTrue"]] - Array con configuración de excepciones para hacer el cast. Las opciones son:
   *   - `"isEmptyAsTrue"`: Los objetos vacíos (incluyendo arrays) son `true`.
   *   - `"isZeroAsTrue"`: El valor `0` se asume como `true`.
   *   - `"isNullAsTrue"`: El valor `null` se asume como `true`.
   * @returns {boolean} - Retorna el booleano correspondiente al valor recibido.
   */
  anyToBoolean(anyToCast, castExceptions = ["isZeroAsTrue"]) {
    let r = false;
    if (!this.isArray(castExceptions, true))
      throw new Error(
        `${castExceptions} is not array of cast exceptions valid`
      );
    if (typeof anyToCast === "string") {
      r =
        anyToCast !== "" ||
        (anyToCast === "" && castExceptions.includes("isEmptyAsTrue"));
    } else if (typeof anyToCast === "object" && anyToCast !== null) {
      //incluye arrays
      const isNotEmpty = Object.keys(anyToCast).length > 0;
      r =
        isNotEmpty || (!isNotEmpty && castExceptions.includes("isEmptyAsTrue"));
    } else if (anyToCast === 0) {
      //el caso especial de numero 0
      r = castExceptions.includes("isZeroAsTrue");
    } else if (anyToCast === null) {
      //el caso especial de numero 0
      r = castExceptions.includes("isNullAsTrue");
    } else {
      //lo demas
      r = !!anyToCast; //cast
    }
    return r;
  }
  //████Numeros██████████████████████████████████████████████████████
  /**
   * Determina si el valor proporcionado es un número.
   *
   * @param {any} num El valor a verificar.
   * @param {boolean} allowString = `false` Determina si se permite que el número se reciba en tipo string.
   * @returns {boolean} Retorna `true` si el valor es un número, `false` de lo contrario.
   */
  isNumber(num, allowString = false) {
    const parse = parseFloat(num);
    allowString = this.anyToBoolean(allowString);
    const r =
      (typeof num === "number" || (typeof num === "string" && allowString)) &&
      !isNaN(parse) &&
      isFinite(parse);
    return r;
  }
  /**
   * Obtiene un reporte básico del tipo de número.
   *
   * @param {number | string} num - El número o string numérico a analizar.
   * @returns {object} - Retorna un objeto con las siguientes propiedades:
   *   - `polarity`: Indica si el número es "positive" o "negative".
   *   - `genericType`: Indica si el valor es un "number" o un "string-number".
   *   - `estrictType`: Indica si el número es un "int", "bigInt" o "float".
   *
   * Ejemplo de uso:
   * ```javascript
   * const report = getTypeNumber("123");
   * console.log(report);
   * // Salida: { polarity: "positive", genericType: "string-number", estrictType: "int" }
   * ```
   */
  getTypeNumber(num) {
    let r = {
      polarity: "",
      genericType: "",
      estrictType: "",
    };
    let n = this.stringToNumber(num);
    r.polarity = n < 0 ? "negative" : "positive"; //el `0` se considera positivo
    r.genericType = this.isString(num) ? "string-number" : "number";
    r.estrictType = !Number.isInteger(n)
      ? "float"
      : typeof n !== "bigint"
      ? "int"
      : "bigInt";
    return r;
  }
  /**
   * Convierte un string a número si es posible.
   *
   * @param {string | number} strNum El string numérico a convertir. Si se recibe un número, se retornará sin hacer proceso.
   * @returns {number} Retorna el número ya convertido.
   * @throws {Error} Lanza un error si `strNum` no es un número válido o no se puede convertir.
   * El mensaje de error es `${strNum} is not a valid number or string-number`.
   */
  stringToNumber(strNum) {
    if (!this.isNumber(strNum, true))
      throw new Error(`${strNum} is not number or string-number valid`);
    if (this.isNumber(strNum, false)) return strNum; //ya es un numero no haga nada mas
    //determinar si es un flotante
    const floatNum = parseFloat(strNum);
    if (!isNaN(floatNum)) return floatNum;
    //determinar si es un entero
    const intNum = parseInt(strNum, 10);
    if (!isNaN(intNum)) return intNum;
    //normalmente no retornaria por aqui, se deja por protocolo
    return strNum;
  }
  /**
   * Redondea un número y ajusta los decimales. Esta implementación se basa en la documentación oficial de Mozilla:
   * MDN Web Docs - Math.round
   *
   * @param {"round" | "floor" | "ceil"} type - Define el tipo de redondeo:
   * - `"none"`: Sin redondeo.
   * - `"round"`: Redondeo estándar (arriba si es >=5 y abajo si es <5).
   * - `"floor"`: Redondeo hacia abajo.
   * - `"ceil"`: Redondeo hacia arriba.
   *
   * @param {number | string} num - El número a redondear. Si no es un número válido, se retorna este valor.
   *
   * @param {number} exponential - El factor exponencial a redondear. El formato es el siguiente:
   * - Enteros Positivos:
   *   - `exp = 0`: Redondeo predefinido por la librería Math.
   *   - `exp = 1`: Redondeo en decenas.
   *   - `exp = 2`: Redondeo en centenas.
   *   - `exp = 3`: Redondeo en miles.
   *   - ...
   * - Enteros Negativos:
   *   - `exp = -1`: Redondeo en décimas.
   *   - `exp = -2`: Redondeo en centésimas.
   *   - `exp = -3`: Redondeo en milésimas.
   *   - ...
   *
   * @returns {number} Retorna el número redondeado si fue posible redondearlo, de lo contrario retorna el mismo número.
   * @throws instancia `Error`, mensajes casos:
   * - `${type} is not type valid`
   * - `${num} is not a valid number or string-number`
   */
  roundNumber(type, num, exponential) {
    let n = this.stringToNumber(num); //garantizar que es un numero
    let exp = this.stringToNumber(exponential); //garantizar que es un numero
    if (!this.isString(type, true))
      throw new Error(`${type} is not type valid`);
    if (this.getTypeNumber(exp).estrictType !== "int")
      throw new Error(`${exponential} is not exponential factor valid`);
    //caso especial si es 0 (no hay forma de redondear)
    if (n === 0) return n;
    // Si el exp es cero...
    if (+exp === 0) return Math[type](n);
    n = +n; //+num intentar convertir a numero cualquier cosa
    exp = +exp; //+exp intentar convertir a numero culaquier cosa
    // Si  el exp no es un entero
    if (!this.isNumber(exp) || exp % 1 !== 0) throw new Error("not round" + n);
    // Shift
    let aStrN = n.toString().split("e");
    n = Math[type](+(aStrN[0] + "e" + (aStrN[1] ? +aStrN[1] - exp : -exp)));
    // Shift back
    aStrN = n.toString().split("e");
    n = +(aStrN[0] + "e" + (aStrN[1] ? +aStrN[1] + exp : exp));
    return n;
  }
  /**
   * Determina si un número está en el rango solicitado.
   *
   * @param {number} num El número a verificar.
   * @param {[number, number]} range Tupla que contiene el rango definido.
   *   - `range[0]`: Valor mínimo del rango.
   *   - `range[1]`: Valor máximo del rango.
   * @param {boolean} isInclusive Determina si el rango es incluyente o excluyente.
   *
   * @example
   * ```javascript
   * const num = 1;
   * let r: boolean;
   * r = isNumberInRange(num, [1,5], true); // Salida: true (es incluyente)
   * r = isNumberInRange(num, [1,5], false); // Salida: false (es excluyente)
   * ```
   * @returns {boolean} Retorna `true` si el número está dentro del rango, `false` de lo contrario.
   */
  isNumberInRange(num, range, isInclusive) {
    let r = false;
    if (!this.isNumber(num)) return r;
    if (!Array.isArray(range) || range.length != 2) return r;
    let [min, max] = range;
    if (!this.isNumber(min) || !this.isNumber(max)) return r;
    r = isInclusive
      ? min <= num && num <= max // incluyente
      : min < num && num < max; //excluyente
    return r;
  }
  /**
   * Adapta un número al rango definido.
   *
   * @param {number} num El número a adaptar al rango.
   * @param {[number, number]} range Tupla que contiene el rango definido para adaptar el número.
   *   - `range[0]`: Valor mínimo del rango.
   *   - `range[1]`: Valor máximo del rango.
   * @returns {number} Retorna el número adaptado a los límites del rango (límites incluyentes).
   *
   * @example
   * ````typescript
   * let num;
   * let r;
   *
   * //Dentro del rango:
   * num = 5;
   * r = adaptNumberByRange(num, [0,10]);
   * console.log(r);// Salida: 5
   *
   * //Fuera del rango, por encima:
   * num = 11;
   * r = adaptNumberByRange(num, [0,10]);
   * console.log(r);// Salida: 10
   *
   * //Fuera del rango, por debajo:
   * num = -2;
   * r = adaptNumberByRange(num, [0,10]);
   * console.log(r);// Salida: 0
   * ````
   */
  adaptNumberByRange(num, range) {
    num = this.stringToNumber(num); //garantizar que es un numero
    if (!Array.isArray(range) || range.length != 2)
      throw new Error(`${range} is not tuple [number, number] valid`);
    let [min, max] = range;
    min = this.stringToNumber(min); //garantizar que es un numero
    max = this.stringToNumber(max); //garantizar que es un numero
    if (num < min || num > max) {
      num = num < min ? min : num;
      num = num > max ? max : num;
    }
    return num;
  }
  //████Textos█████████████████████████████████████████████████████
  /**
   * Determina si un valor es un string, con la opción de aceptar o no string vacíos.
   *
   * Ejemplo:
   * ```javascript
   * let a = "";
   * isString(a, true); // salida `true` (es un string válido aunque está vacío)
   * isString(a, false); // salida `false` (no es un string válido porque está vacío)
   * !isString(a); // salida `true` permite vacios y cualquier tipo de valor menos string
   * !isString(a, true); // salida `false` negar vacios
   * !isString(a, false); // salida `true` niega el negar vacios (vacios prmitidos)
   * ```
   *
   * @param {any} str El valor a analizar.
   * @param {boolean} allowEmpty = `false` Determina si se permite que el string vacío sea válido.
   * @returns {boolean} Retorna `true` si el valor es un string, `false` de lo contrario.
   */
  isString(str, allowEmpty = false) {
    allowEmpty = this.anyToBoolean(allowEmpty);
    const r = typeof str === "string" && (allowEmpty || str !== "");
    return r;
  }
  /**
   * Permite capitalizar una palabra (la primera letra en mayúscula).
   *
   * ⚠ Importante:
   * Debe ser una palabra, si es una frase solo capitaliza la primera palabra.
   *
   * @param {string} word La palabra a transformar.
   * @returns {string} Retorna la palabra ya transformada con la primera letra en mayúscula,
   * si la `word` no es un string valido es retornado sin modificaciones.
   *
   * @example
   * ````typescript
   *
   * ````
   */
  capitalizeWordFirstLetter(word) {
    if (!this.isString(word, true))
      // "" no lanza throw
      throw new Error(`${word} is not a valid string`);
    const r = word.charAt(0).toUpperCase() + word.slice(1);
    return r;
  }
  //████Objetos████████████████████████████████████████████████████
  /**determina si el valor recibido
   * corresponde a un objeto
   *
   * Ejemplo:
   * ````
   * let a = {};
   * isObject(a, true) //salida `true` (es un objeto valido aunque esté vacio)
   * isObject(a, false) //salida `false` (NO es un objeto valido porque está vacio)
   * !isObject(a); // salida `true` permite vacios y cualquier tipo de valor menos object
   * !isObject(a, true) //salida `false` niega permitir vacios
   * !isObject(a, false) //salida `true` niega a negar vacios (vacios aprobados)
   * let b = [];
   * isObject(b); //retorna `false`
   *              //(un array (vacio o poblado) no lo considera objeto literal)
   * ````
   * ____
   * @param value el valor a analizar
   * @param allowEmpty determina si en
   * el analisis un objeto vacio (sin
   * propiedades) se permite asumir como objeto
   * (predefinido `false` no se
   * permite asumirlo como objeto)
   * ____
   * @return `true` si es un objeto de
   * lo contrario `false`
   *
   */
  isObject(value, allowEmpty = false) {
    allowEmpty = this.anyToBoolean(allowEmpty);
    const r =
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      (allowEmpty || Object.keys(value).length > 0);
    return r;
  }
  /**
   * Verifica si un valor es un objeto y si determinadas propiedades cumplen la condición `"propCondition"`.
   *
   * ⚠ **no** reconoce arrays, solo objetos
   *
   * @param {object} obj El objeto a verificar.
   * @param {boolean} allowEmpty `= false`, Determina si se permite que el objeto vacío sea válido.
   * @param {string | string[]} keyOrKeysPath = `[]` Las claves identificadoras de las propiedades a verificar.
   * @param {"it-exist" | "is-not-undefined" | "is-not-null"| "is-not-undefined-and-not-null"} propCondition `= "is-not-undefined-and-not-null"` determina la condición que debe cumplir cada propiedad referenciada en `keyOrKeys`
   * - `"it-exist"` verifica si la propiedad existe (asi tenga asignado valor undefined o null).
   * - `"is-not-undefined"` verifica que la propiedad no sea undefined.
   * - `"is-not-null"` verifica que la propiedad no sea null.
   * - `"is-not-undefined-and-not-null"` (predefinidio) verifica que la propiedad no sea undefined o null.
   * @returns {boolean} Retorna `true` si es un objeto y tiene dichas propiedades, `false` de lo contrario.
   *
   * @example
   * ````typescript
   * let obj;
   * let r;
   *
   * //ejemplo básico (evalua como `isObject()`):
   * obj = { p1: "hola", p2: 31 };
   * r = util.isObjectAndExistEveryProperty(data);
   * console.log(r); //salida: `true`, es un objeto
   *
   * //ejemplo verificando propiedad (no undefined y no null):
   * obj = { p1: "hola", p2: 31 };
   * r = util.isObjectAndExistEveryProperty(data, "p1", "is-not-undefined-and-not-null");
   * console.log(r); //salida: `true`, es un objeto y `p1` no es undefined o null
   *
   * //ejemplo verificando propiedad (es undefined o es null):
   * obj = { p1: "hola", p2: 31 };
   * r = util.isObjectAndExistEveryProperty(data, "p3", "is-not-undefined-and-not-null");
   * console.log(r); //salida: `false`, es un objeto pero `p3`es undefined
   *
   * //ejemplo diferencias de comprobacion ("it-exist"):
   * obj = { p1: "hola", p2: 31 p3: undefined};
   * r = util.isObjectAndExistEveryProperty(data, "p3", "it-exist");
   * console.log(r); //salida: `true`, es un objeto y `p3` existe (apesar de tener asignado undefined)
   *
   * //ejemplo diferencias de comprobacion ("is-not-undefined"):
   * obj = { p1: "hola", p2: 31 p3: undefined};
   * r = util.isObjectAndExistEveryProperty(data, "p3", "is-not-undefined");
   * console.log(r); //salida: `false`, es un objeto y `p3` tiene asignado undefined
   *
   * //ejemplo comprobacion profunda:
   * obj = { p1: "hola", p2:{p21:3}};
   * r = util.isObjectAndExistEveryProperty(data, "p2.p21", "is-not-undefined-and-not-null");
   * console.log(r); //salida: `true`, permite verificacion profunda (hasta 16 niveles probados)
   * ````
   */
  isObjectAndExistEveryDeepProperty(
    obj,
    allowEmpty = false,
    keyOrKeysPath,
    propCondition = "is-not-undefined-and-not-null"
  ) {
    if (
      this.isNotUndefinedAndNotNull(keyOrKeysPath) &&
      !this.isString(keyOrKeysPath) && //❗Obligario negar string vacio❗
      !this.isArray(keyOrKeysPath, true) //❗Obligario permitir array vacio❗
    )
      throw new Error(`${keyOrKeysPath} is not key or keys path valid`);
    if (!this.isString(propCondition))
      throw new Error(`${propCondition} is not property condition mode valid`);
    let keysPath = this.isArray(keyOrKeysPath, true)
      ? [...keyOrKeysPath]
      : this.isString(keyOrKeysPath)
      ? [keyOrKeysPath]
      : [];
    keysPath = [...new Set(keysPath)]; //eliminacion de repetidos sencilla
    let r = false;
    if (!this.isObject(obj, allowEmpty)) {
      r = false;
    } else {
      const sp = this.charSeparatorLogicPath;
      if (keysPath.length > 0) {
        r = keysPath.every((key) => {
          const keysSplitPath = key.split(sp);
          const cKey = keysSplitPath[0];
          let lenKP = keysSplitPath.length;
          //seleccion de condicion de propiedad
          let r =
            propCondition === "it-exist"
              ? key in obj
              : propCondition === "is-not-undefined"
              ? obj[cKey] !== undefined
              : propCondition === "is-not-null"
              ? obj[cKey] !== null
              : this.isNotUndefinedAndNotNull(obj[cKey]);
          //determinar si recorre profundidad
          if (r && lenKP > 1) {
            keysSplitPath.shift();
            lenKP = keysSplitPath.length; //actualiza
            const subKeyOrKeysPath = lenKP > 0 ? [keysSplitPath.join(sp)] : [];
            const sObj = obj[cKey];
            r = this.isObjectAndExistEveryDeepProperty(
              sObj,
              allowEmpty,
              subKeyOrKeysPath,
              propCondition
            );
          }
          return r;
        });
      } else {
        r = true;
      }
    }
    return r;
  }
  /**
   * Determina si un objeto es literal (no es instanciado o fue creado por medio de `new`).
   *
   * @param {any} obj El objeto a analizar.
   * @returns {boolean} Retorna `true` si el objeto es literal, de lo contrario retorna `false`.
   *
   * @example
   * ```typescript
   * let obj;
   * let r;
   *
   * //comprobando literal
   * obj = { a: 1, b: 2 };
   * r = isLiteralObject(obj);
   * console.log(r); // salida: true
   *
   * //comprobando instancia
   * class MyClass{};
   * obj = new MyClass();
   * r = isLiteralObject(obj);
   * console.log(r); // salida: false
   * ```
   */
  isLiteralObject(obj) {
    let r = false;
    //vacios validos
    if (!this.isObject(obj, true)) return r;
    if (obj.constructor === Object) r = true;
    return r;
  }
  /**
   * Determina si un objeto es instanciado o fue creado por medio de `new`.
   *
   * @param {any} obj El objeto a analizar.
   * @returns {boolean} Retorna `true` si el objeto es una instancia, de lo contrario retorna `false`.
   *
   * @example
   * ```typescript
   * let obj;
   * let r;
   * class MyClass {};
   *
   * //comprobando instancia
   * const obj = new MyClass();
   * const r = isInstance(obj);
   * console.log(r); // salida: true
   *
   * //comprobando literal
   * const obj = {p1:"hola"};
   * const r = isInstance(obj);
   * console.log(r); // salida: false
   * ```
   */
  isInstance(obj) {
    let r = false;
    if (!this.isObject(obj, true)) return r;
    if (obj.constructor !== Object) r = true;
    return r;
  }
  /**
   * Obtiene el nombre de la clase de la instancia recibida.
   *
   * @param {object} instance - La instancia de la cual se desea obtener el nombre.
   * @returns {string} - Retorna el nombre de la instancia a la que corresponde el objeto o `undefined` si no fue posible obtener el nombre (porque no es un objeto, o es un objeto literal o anónimo).
   * @throws {Error} - Lanza un error si la instancia no es una instancia de una clase.
   *
   * @example
   * ```typescript
   * class MyClass {};
   * const obj = new MyClass();
   * const className = getClassName(obj);
   * console.log(className); // salida: "MyClass"
   * ```
   */
  getClassName(instance) {
    if (!this.isInstance(instance))
      throw new Error(`${instance} is not instance of class`);
    let name = instance.constructor.name;
    return name;
  }
  /**
   * Convierte las claves identificadoras de un objeto literal a un formato específico (snakeCase, kebabCase, camelCase o pascalCase).
   *
   * ⚠ Las claves identificadoras que tienen el prefijo "_" serán eliminadas.
   *
   * ⚠ Realiza la conversión en profundidad (tener cuidado con el stack si no es muy profundo).
   *
   * @param {object} objBase El objeto a convertir sus claves identificadoras.
   * @param {"Snake" | "Kebab" | "Camel" | "Pascal"} caseType El tipo de case al cual se desea convertir las claves (Camel, Snake, Kebab o Pascal).
   * @returns {object} Retorna el objeto con las claves de propiedades modificadas.
   *
   * @example
   * ```typescript
   * const objBase = {
   *   campo_a: "dato a",
   *   _campo_b: "dato b",
   *   campo_c: "dato c.1", // Sin prefijo
   *   _campo_c: "dato c.2",
   * };
   * const objCase = objCastKeyPropertiesToCase(objBase, "Camel");
   * console.log(objCase);
   * // Salida:
   * // {
   * //   campoA: "dato a",
   * //   campoB: "dato b", // ❗ Quitó el prefijo "_" ❗
   * //   campoC: "dato c.2", // ❗ Quitó el prefijo "_" ❗
   * //                      // y ❗ sobrescribió la propiedad sin prefijo ❗
   * // }
   * ```
   */
  objectKeyPropertiesToCase(objBase, caseType) {
    if (!this.isObject(objBase))
      throw new Error(`${objBase} is not object valid`);
    let objCase = {};
    for (let key in objBase) {
      const keyC = this.convertStringToCase(key, caseType);
      objCase[keyC] = this.isObject(objBase[key])
        ? this.objectKeyPropertiesToCase(objBase[key], caseType)
        : objBase[key];
    }
    return objCase;
  }
  /**
   * Fusiona 2 objetos a nivel profundo, donde el nuevo objeto será fusionado
   * al objeto base. Las propiedades de nuevo objeto serán sobreescritas en las
   * propiedades de en el objeto base de acuerdo a la configuración `mode`.
   *
   * ⚠ **No** aplica para profundidad en arrays (ni en propiedades ni subpropiedades).
   *
   * @param {[object, object]} tObjToMerge - Tupla que representa:
   *   - `tObjToMerge[0]`: Objeto base al cual se fusionará el nuevo objeto.
   *   - `tObjToMerge[1]`: Objeto a fusionar con el objeto base.
   * @param {object} config - Configuración para el proceso de fusión:
   *   - `mode`: Modo de fusión par alos objetos
   *   - `isNullAsUndefined` Determina si se debe asumir que
   *     el valor `null` tiene el mismo peso comparativo que el valor `undefined`.
   * @returns {object} - Retorna el objeto fusionado.
   *
   * @example
   * ````typescript
   * let baseObj;
   * let newObj;
   * let r;
   *
   * // fusion en modo "soft"
   * baseObj = {
   *   p1: "does not spanish",
   *   p2: 31,
   *   p3: true,
   *   p4: 255,
   *   p5: "A",
   * },
   * newObj = {
   *   p1: "ahora si es español",
   *   p2: 31,
   *   p3: false,
   *   p4: undefined,
   *   p5: null,
   * }
   * r = objectDeepMerge([baseObj, newObj], {mode: "soft"});
   * console.log(r); //Salida:
   * //{
   * //  p1: "ahora si es español", //se fusionó
   * //  p2: 31, //se fusionó
   * //  p3: false, //se fusionó
   * //  p4: 255, //al ser "soft" no lo debe fusionar
   * //  p5: null, //al ser "soft" y no esta habilitado `isNullAsUndefined` si debe fusionarlo
   * //}
   *
   * // fusion en modo "hard"
   * baseObj = {
   *   p1: "does not spanish",
   *   p2: 31,
   *   p3: true,
   *   p4: 255,
   *   p5: "A",
   * },
   * newObj = {
   *   p1: "ahora si es español",
   *   p2: 31,
   *   p3: false,
   *   p4: undefined,
   *   p5: null,
   * }
   * r = objectDeepMerge([baseObj, newObj], {mode: "hard"});
   * console.log(r); //Salida:
   * //{
   * //  p1: "ahora si es español", //se fusionó
   * //  p2: 31, //se fusionó
   * //  p3: false, //se fusionó
   * //  p4: undefined, //al ser "hard" lo fusiona
   * //  p5: null, //al ser "hard" lo fusiona
   * //}
   *
   * ````
   */
  objectDeepMerge(tObjToMerge, config) {
    if (!this.isArray(tObjToMerge) || tObjToMerge.length > 2)
      throw new Error(`${tObjToMerge} is not tuple of objects valid`);
    let [objBase, objNew] = tObjToMerge;
    const isObjBase = this.isObject(objBase, true);
    const isObjNew = this.isObject(objNew, true);
    if (!isObjBase || !isObjNew) {
      if (!isObjBase && isObjNew) return objNew;
      if (!isObjNew && isObjBase) return objBase;
      throw new Error(`${objBase} and ${objNew} is not objects valid`);
    }
    if (!this.isObject(config, true))
      throw new Error(
        `${config} is not object of configuration to deep merge valid`
      );
    if (!this.isString(config.mode))
      throw new Error(`${config.mode} is not mode for merge valid`);
    let {
      mode,
      isNullAsUndefined = false, //predefinido
    } = config;
    const uKeys = [
      ...new Set([...Object.keys(objBase), ...Object.keys(objNew)]),
    ];
    let rObj = {};
    for (const key of uKeys) {
      const propB = objBase[key];
      const propN = objNew[key];
      if (this.isObject(propB, true) && this.isObject(propN, true)) {
        if (Object.keys(propB).length === 0) {
          //caso especial objeto vacio en propiedad base
          if (mode === "soft") {
            rObj[key] =
              propN === undefined || (isNullAsUndefined && propN === null)
                ? propB
                : propN;
          } else if (mode === "hard") {
            rObj[key] = propN;
          } else {
            throw new Error(`${mode} is not mode for merge valid`);
          }
        } else if (Object.keys(propN).length === 0) {
          //caso especial objeto vacio en propiedad nuevo
          rObj[key] = mode === "hard" ? propN : propB;
        } else {
          rObj[key] = this.objectDeepMerge([propB, propN], {
            mode,
            isNullAsUndefined,
          });
        }
      } else {
        if (mode === "soft") {
          rObj[key] =
            propB === undefined || (isNullAsUndefined && propB === null)
              ? propN
              : propN === undefined || (isNullAsUndefined && propN === null)
              ? propB
              : propN;
        } else if (mode === "hard") {
          //comprobacion de existencia de propiedad
          const isPropB = key in objBase;
          const isPropN = key in objNew;
          rObj[key] = isPropN ? propN : propB;
        } else {
          throw new Error(`${mode} is not mode for merge valid`);
        }
      }
    }
    return rObj;
  }
  //█████Arrays██████████████████████████████████████████████████████
  /**
   * Determina si es un array, con la opción de aceptar o no arrays vacíos.
   *
   * Ejemplo:
   * ```javascript
   * let a = [];
   * isArray(a, true); // salida `true` (es un array válido aunque esté vacío)
   * isArray(a, false); // salida `false` (NO es un array válido porque está vacío)
   * !isArray(a); // salida `true` permite vacios y cualquier tipo de valor menos array
   * !isArray(a, true) //salida `false` niega permitir vacios
   * !isArray(a, false) //salida `true` niega a negar vacios (vacios aprobados)
   * ```
   *
   * @param {any} value El valor a analizar.
   * @param {boolean} allowEmpty = `false`, Determina si se permite que el array vacío sea válido.
   * @returns {boolean} Retorna `true` si el valor es un array, `false` de lo contrario.
   */
  isArray(value, allowEmpty = false) {
    const r = Array.isArray(value) && (allowEmpty || value.length > 0);
    return r;
  }
  //████Generales████████████████████████████████████████████████████
  /**
   * Realiza la clonación de objetos JSON o Arrays de JSONs a diferentes niveles de profundidad.
   *
   * @param {object} objOrArray El objeto a clonar. El tipo `T` se asume implícitamente al enviar el parámetro.
   * @param {"stringify" | "structuredClone"} driver `= "structuredClone"` el driver o libreria para hacer clonación.
   * @returns {object} Retorna el objeto (o array) clonado. Si no es un objeto (o array), el retorno es el mismo valor.
   *
   * @example
   * ```typescript
   * const obj = { a: 1, b: 2 };
   * const clonedObj = clone(obj);
   * console.log(clonedObj); // salida: { a: 1, b: 2 }
   * ```
   */
  clone(objOrArray, driver = "structuredClone") {
    if (
      typeof objOrArray != "object" || //❗solo clona los objetos (incluye array)❗
      objOrArray === null
    ) {
      return objOrArray;
    }
    let dataCopia;
    if (driver === "stringify") {
      dataCopia = JSON.parse(JSON.stringify(objOrArray)); //metodo antiguo
    } else if (driver === "structuredClone") {
      dataCopia = structuredClone(objOrArray); //Se implementará en typescript ^4.7.x
    } else {
      throw new Error(`${driver} does not driver valid`);
    }
    return dataCopia;
  }
  /**
   * @param v variable a comprobar
   * ____
   * @returns `true` si es `undefined` o `null`
   * `false` si no no lo es
   * ____
   */
  isUndefinedOrNull(v) {
    return v === undefined || v === null;
  }
  /**
   * @param v variable a comprobar
   * ____
   * @returns `true` si NO es `undefined` ni `null`
   * `false` si lo es
   * ____
   */
  isNotUndefinedAndNotNull(v) {
    return v != undefined && v != null;
  }
  /**
   * Este método convierte para:
   *  - primitivos: valor `undefined` a `null`
   *  - objetos (incluidos arrays): las propiedades con valor `undefined` de un objeto o array en valor `null`.
   *
   * @param {object | any[]} value El primitivo, objeto o array que se va a procesar.
   * @param {boolean} isDeep `= false`, (solo para objetos o arrays) Si es `true`, el método procesará el objeto o array de forma recursiva. Si es `false` solo se procesará el primer nivel del objeto.
   * @returns {object | any[]}
   *  -Si `value` tiene asignado el valor `undefined` entonces retorna `null`, de lo contrario retorna el valor actual de `value`
   *  -Si `value`es un objeto o array, retorna todas su propiedas (o items) que hallan tenido valor `undefined` en valor `null`, las demas propiedades no son modificadas
   *
   * @example
   * ```typescript
   * const obj = { a: undefined, b: { c: undefined } };
   * const result = undefinedToNull(obj, true);
   * console.log(result); // salida { a: null, b: { c: null } }
   * ```
   */
  undefinedToNull(value, isDeep = false) {
    //caso primitivo
    if (typeof value !== "object") return value === undefined ? null : value;
    //caso null directo
    if (value === null) return null;
    //caso objetos o arrays
    isDeep = this.anyToBoolean(isDeep);
    let newObjOrArray = !Array.isArray(value)
      ? Object.assign({}, value)
      : [...value]; //clonacion superficial array
    Object.keys(newObjOrArray).forEach((key) => {
      if (newObjOrArray[key] === undefined) {
        newObjOrArray[key] = null;
      } else if (
        isDeep &&
        typeof newObjOrArray[key] === "object" && //acepta arrays
        newObjOrArray[key] !== null
      ) {
        newObjOrArray[key] = this.undefinedToNull(newObjOrArray[key], isDeep);
      } else {
      }
    });
    return newObjOrArray;
  }
  /**
   * Este método convierte para:
   *  - primitivos: valor `null` a `undefined`
   *  - objetos (incluidos arrays): las propiedades con valor `null` de un objeto o array en valor `undefined`.
   *
   * @param {object | any[]} value El primitivo, objeto o array que se va a procesar.
   * @param {boolean} isDeep `= false`, (solo para objetos o arrays) Si es `true`, el método procesará el objeto o array de forma recursiva. Si es `false` solo se procesará el primer nivel del objeto.
   * @returns {object | any[]}
   *  -Si `value` tiene asignado el valor `null` entonces retorna `undefined`, de lo contrario retorna el valor actual de `value`
   *  -Si `value`es un objeto o array, retorna todas su propiedas (o items) que hallan tenido valor `null` en valor `undefined`, las demas propiedades no son modificadas
   *
   * @example
   * ```typescript
   * const obj = { a: null, b: { c: null } };
   * const result = undefinedToNull(obj, true);
   * console.log(result); // salida { a: undefined, b: { c: undefined } }
   * ```
   */
  nullToUndefined(value, isDeep = false) {
    //caso primitivo
    if (typeof value !== "object" || value === null)
      return value === null ? undefined : value;
    //caso objetos o arrays
    isDeep = this.anyToBoolean(isDeep);
    let newObjOrArray = !Array.isArray(value)
      ? Object.assign({}, value)
      : [...value]; //clonacion superficial array
    Object.keys(newObjOrArray).forEach((key) => {
      if (newObjOrArray[key] === null) {
        newObjOrArray[key] = undefined;
      } else if (
        isDeep &&
        typeof newObjOrArray[key] === "object" //acepta arrays
      ) {
        newObjOrArray[key] = this.nullToUndefined(newObjOrArray[key], isDeep);
      } else {
      }
    });
    return newObjOrArray;
  }
  /**
   * Comprueba si un valor corresponde a un tipo definido.
   *
   * ❗Aunque puede comparar valores primitivos (y objetos), su eso es
   * mas enfocado para arrays❗
   *
   *
   * los tipos son:
   *
   * ````javascript
   * "string"
   * "number"
   * "bigint"
   * "boolean"
   * "symbol"
   * "undefined"
   * "null"
   * "object"
   * "array"
   * "function"
   * ````
   *
   * @param {any} anyValue - Valor a comprobar el tipo.
   * @param {"is" | "is-not"} condition - `"is"`  Determina si corresponde al tipo o a uno de los tipos, `"is-not"` determina que no es ninguno de los tipos.
   * @param {Array<"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "null" | "object" | "array" | "function">} types - Los tipos a comprobar.
   * @param {"allow-empty" | "deny-empty"} [emptyMode = "allow-empty"] - Solo se aplica a valores estructurados (objetos o arrays), determina si se consideran los objetos o arrays vacíos. Para el caso de la condición `"is"`, es lógica positiva mientras que para la condición `"is-not"`, la configuración `"deny-empty"` indicaría que un valor como `[]` no corresponde a un array válido.
   * @param {Array<"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "null" | "object" | "array" | "function">} subTypes - (Opcional y solo para estructuras objeto o arrays) Determina qué subtipos debe comprobar en cada elemento (para los arrays) o cada propiedad (para los objetos).
   * @returns {boolean} - Retorna un booleano indicando si corresponde al tipo y sus características.
   *
   * @example
   *
   * ````typescript
   * let v;
   * let r;
   *
   * //primitivos basicos
   * v = 2;
   * r = isValueType(v, "is-not", "number");
   * console.log(r); //Salida: false (por que numero)
   *
   * //primitivos basicos (string-number)
   * v = "2";
   * r = isValueType(v, "is", "number");
   * console.log(r); //Salida: false (por que es un string, antes que un numero)
   *
   * //primitivos basicos (varios tipos)
   * v = "hola";
   * r = isValueType(v, "is", ["number", "string"]); //funciona como OR
   * console.log(r); //Salida: true (por que es string)
   *
   * //objetos
   * v = {id:1, name: "juan"};
   * r = isValueType(v, "is", ["boolean", "number", "string"]); //funciona como OR
   * console.log(r); //Salida: false
   *
   * //array (de numeros)
   * v = [1, 2];
   * r = isValueType(v, "is", "array", "allow-empty", ["boolean", "string"]); //funciona como OR
   * console.log(r); //Salida: false (es un array de numbers)
   *
   * //array (vacio)
   * v = [];
   * r = isValueType(v, "is", "array", "allow-empty", ["boolean", "string"]); //funciona como OR
   * console.log(r); //Salida: true (se permite vacio)
   *
   * //array (varios tipos)
   * v = [1, "hola"];
   * r = isValueType(v, "is", "array", "allow-empty", ["number", "string"]); //funciona como OR
   * console.log(r); //Salida: true (es un arryay de numeros o strings)
   *
   * //array (varios tipos (2))
   * v = [1, "hola", false];
   * r = isValueType(v, "is", "array", "allow-empty", ["number", "string"]); //funciona como OR
   * console.log(r); //Salida: false (uno o mas de los elementos no es number o string)
   *
   * ````
   */
  isValueType(anyValue, condition, types, emptyMode = "allow-empty", subTypes) {
    if (!this.isString(condition))
      throw new Error(`${condition} is not condition valid`);
    if (!this.isString(types) && !this.isArray(types))
      throw new Error(
        `${types} is not selector types valid (must be key-type or must be array of keys-type)`
      );
    if (!this.isString(emptyMode))
      throw new Error(`${emptyMode} is not empty mode valid`);
    if (
      this.isNotUndefinedAndNotNull(subTypes) &&
      !this.isString(subTypes) &&
      !this.isArray(subTypes)
    )
      throw new Error(
        `${subTypes} is not selector subTypes valid (must be key-type or must be array of keys-type)`
      );
    //cast arrays
    types = Array.isArray(types) ? types : [types];
    if (this.isNotUndefinedAndNotNull(subTypes)) {
      subTypes = Array.isArray(subTypes) ? subTypes : [subTypes];
    }
    // callback de verificacion de tipo
    const validateTypeFn = ((anyValue, type, subTypes) => {
      let r = false;
      switch (type) {
        case "array":
          r =
            Array.isArray(anyValue) &&
            (emptyMode === "allow-empty" ||
              (emptyMode === "deny-empty" && anyValue.length > 0));
          if (r && this.isArray(subTypes, false)) {
            r = anyValue.every((aV) =>
              this.isValueType(aV, "is", subTypes, emptyMode)
            );
          }
          break;
        case "bigint":
          r = typeof anyValue === "bigint";
          break;
        case "boolean":
          r = typeof anyValue === "boolean";
          break;
        case "function":
          r = typeof anyValue === "function";
          break;
        case "number":
          r = typeof anyValue === "number"; //extricto no se admite string de numero Ej: ("45") es false
          break;
        case "object":
          r =
            typeof anyValue === "object" &&
            anyValue != null &&
            (emptyMode === "allow-empty" ||
              (emptyMode === "deny-empty" && Object.keys(anyValue).length > 0));
          if (r && this.isArray(subTypes, false)) {
            r = Object.values(anyValue).every((pV) =>
              this.isValueType(pV, "is", subTypes, emptyMode)
            );
          }
          break;
        case "string":
          r =
            typeof anyValue === "string" &&
            (emptyMode === "allow-empty" ||
              (emptyMode === "deny-empty" && anyValue !== ""));
          break;
        case "symbol":
          r = typeof anyValue === "symbol";
          break;
        case "undefined":
          r = anyValue === undefined;
          break;
        case "null":
          r = anyValue === null;
          break;
        default:
          r = false;
          break;
      }
      return r;
    }).bind(this);
    let r = false;
    if (condition === "is") {
      r = types.some((type) => validateTypeFn(anyValue, type, subTypes));
    }
    if (condition === "is-not") {
      //❗invertir la configuracion para logica negativa❗
      emptyMode = emptyMode === "allow-empty" ? "deny-empty" : "deny-empty";
      r = types.every((type) => !validateTypeFn(anyValue, type, subTypes));
    }
    return r;
  }
  /**
   * Permite comparar dos valores para determinar si son equivalentes.
   *
   * ⚠ funciona en base a equivalencia (no igualdad),
   * porque los objetos no se igualan `{} === {}` ya que eso
   * compara referencia no contenido.
   *
   * **⚠⚠ Importante los pesos de los tipos ⚠⚠**
   *
   * Lista de pesos (de menor a mayor peso):
   *
   * - `undefined`
   * - `null`
   * - `function`
   * - `boolean`
   * - `number`
   * - `string-number` cuando esta activada `isCompareStringToNumber`
   * - `string`
   * - `object`
   * - `array`
   *
   * los pesos son estrictos y tienen en cuenta el tipo. Ejemplo:
   *  - `A` es mas pesado que `a` //cuando es case sensitive
   *  - `0` es mas pesado que `true`.
   *  - `true` es mas pesado que `false`.
   *  - `false` es mas pesado que null
   *  - `null` es mas pesado que `undefined`
   *
   * @param {[any, any]} compareValues Tupla con los valores a comparar.
   * @param {object} config Configuración para realizar la comparación:
   *   - `keyOrKeysPath`: (solo para objetos o array de objetos) claves identificadoras de las propiedades que se usarán para comparar.
   *   - `isCompareLength`: (solo arrays) determina si se compara el tamaño de los arrays.
   *   - `isCompareSize`: (solo para objetos) determina si se comparan la cantidad de objetos.
   *   - `isCompareStringToNumber`: (solo para string posiblemente numérico) determina que en la comparación los string numéricos sean comparados como si fueran números (`2` sería equivalente a `"2"`).
   *   - `isCaseSensitiveForString`: (solo para string) si la comparación es sensitiva a mayúsculas y minúsculas.
   *   - `isStringLocaleMode`: (solo para string) si se usan métodos de comparación asumiendo la configuración regional del sistema.
   * @returns {boolean} Retorna `true` si los valores son equivalentes según los criterios definidos, `false` de lo contrario.
   *
   * @example
   * ````typescript
   * let a;
   * let b;
   * let r;
   *
   * //comparacion basica de primitivos (mismo tipo (1))
   * a = 1;
   * b = 1;
   * r = isEquivalentTo([a, b], {}); //sin configuracion
   * console.log(r); // Salida: true
   *
   * //comparacion basica de primitivos (mismo tipo (2))
   * a = -1;
   * b = 1;
   * r = isEquivalentTo([a, b], {}); //sin configuracion
   * console.log(r); // Salida: false
   *
   * //comparacion basica de primitivos (mismo tipo (3))
   * a = ()=>"hola";
   * b = (p)=>p;
   * r = isEquivalentTo([a, b], {}); //sin configuracion
   * console.log(r); // Salida: false (son diferentes funciones)
   *
   * //comparacion basica de primitivos (diferente tipo (1))
   * a = undefined;
   * b = null;
   * r = isEquivalentTo([a, b], {}); //sin configuracion
   * console.log(r); // Salida: false
   *
   * //comparacion basica de primitivos (diferente tipo (2))
   * a = "1";
   * b = 1;
   * r = isEquivalentTo([a, b], {}); //sin configuracion
   * console.log(r); // Salida: false ("1" es string y es diferente a number)
   *
   * //comparacion basica de primitivos
   * //(diferente tipo, con `isCompareStringToNumber` (3))
   * a = "1";
   * b = 1;
   * r = isEquivalentTo([a, b], {
   *   isCompareStringToNumber: true
   * });
   * console.log(r); // Salida: true
   *
   * //comparacion basica de objetos
   * a = {a: "hola", b:31};
   * b = {a: "hola", b:15};
   * r = isEquivalentTo([a, b], {}); //sin configuracion
   * console.log(r); // Salida: false (la propiedad `b` es diferente)
   *
   * //comparacion basica de objetos (con keysOrKeysPath)
   * a = {a: "hola", b:31};
   * b = {a: "hola", b:15};
   * r = isEquivalentTo([a, b], {
   *   keyOrKeysPath: "a" //comparar por esta propiedad
   * }); //sin configuracion
   * console.log(r); // Salida: true (la propiedad `b` es diferente,
   * //pero se esta comparando solo por la propiedad `a`)
   *
   * //comparacion de objetos (con keysOrKeysPath y profundidad)
   * a = {a: "hola", b:{c: 31, d: 15}};
   * b = {a: "hola", b:{c: 0, d: 15}};
   * r = isEquivalentTo([a, b], {
   *   keyOrKeysPath: ["a", "b.d"] //comparar por estas propiedades (recordar "b.d" es la ruta a la propiedad profunda)
   * });
   * console.log(r); // Salida: true
   *
   * //comparacion basica de arrays
   * a = ["a", 1, false];
   * b = ["a", 1, true];
   * r = isEquivalentTo([a, b], {}); //sin configuracion
   * console.log(r); // Salida: false (el ultimo elemento es diferente)
   *
   * //comparacion basica de arrays
   * a = ["a", 1, false];
   * b = ["a", 1, false];
   * r = isEquivalentTo([a, b], {}); //sin configuracion
   * console.log(r); // Salida: true
   *
   * //comparacion basica de arrays (no tamaños)
   * a = ["a", 1, false, 2];
   * b = ["a", 1, false];
   * r = isEquivalentTo([a, b], {}); //sin configuracion
   * console.log(r); // Salida: true (porque no se esta comprando tamaños y
   * //se compararán los elementos del array mas pequeño con el mas grande
   * //en la misma posicion donde estan)
   *
   * //comparacion basica de arrays (no tamaños)
   * a = ["a", 1, 2, false,];
   * b = ["a", 1, false];
   * r = isEquivalentTo([a, b], {}); //sin configuracion
   * console.log(r); // Salida: false (porque no se esta comprando tamaños pero
   * //se compararán los elementos del array mas pequeño con el mas grande
   * //en la misma posicion donde estan (`2` es diferente a `false`))
   *
   * //comparacion basica de arrays (si tamaños)
   * a = ["a", 1, false, 2];
   * b = ["a", 1, false];
   * r = isEquivalentTo([a, b], {
   *   isCompareLength: true
   * }); //sin configuracion
   * console.log(r); // Salida: fasle (los tamaños son difernetes,
   * //las demas comparaciones internas se ignoran)
   *
   * ````
   */
  isEquivalentTo(compareValues, config) {
    if (!this.isArray(compareValues, true) || compareValues.length > 2)
      throw new Error(`${config} is not tuple of compare values valid`);
    //si es vacio es como comparar `undefined === undefined`
    if (compareValues.length === 0) return true;
    //si solo tiene un elemento es como si comparara a `any === undefined`
    if (compareValues.length === 1) return false;

    if (!this.isObject(config, true))
      throw new Error(`${config} is not object of configuration valid`);
    if (
      this.isNotUndefinedAndNotNull(config.keyOrKeysPath) &&
      !this.isString(config.keyOrKeysPath) && //❗Obligario negar string vacio❗
      !this.isArray(config.keyOrKeysPath, true) //❗Obligario permitir array vacio❗
    )
      throw new Error(`${config.keyOrKeysPath} is not key or keys path valid`);
    let {
      isCompareLength = false, //❗Obligatorio `false` predefinido❗
      isCompareSize = false, //❗Obligatorio `false` predefinido❗
      keyOrKeysPath,
      isCompareStringToNumber = false, //predefinido
      isCaseSensitiveForString = true, //predefinido
      isStringLocaleMode = true, //predefinido
    } = config;
    //Inicio de proceso
    const [valueBase, valueToCompare] = compareValues;
    let keysPath = this.isArray(keyOrKeysPath, true)
      ? [...keyOrKeysPath]
      : this.isString(keyOrKeysPath)
      ? [keyOrKeysPath]
      : [];
    isCompareLength = this.anyToBoolean(isCompareLength);
    isCompareSize = this.anyToBoolean(isCompareSize);
    isCompareStringToNumber = this.anyToBoolean(isCompareStringToNumber);
    isCaseSensitiveForString = this.anyToBoolean(isCaseSensitiveForString);
    isStringLocaleMode = this.anyToBoolean(isStringLocaleMode);
    let isEquivalent = true; //obligatorio iniciar con true
    //eliminar claves identificadoras repetidas
    const isKPTCArray = this.isArray(keysPath, false); //❗no se aceptan vacios
    if (isKPTCArray) keysPath = [...new Set(keysPath)];
    const sp = this.charSeparatorLogicPath;
    //comparar array
    if (this.isArray(valueBase, true) && this.isArray(valueToCompare, true)) {
      const lenItemBase = valueBase.length;
      const lenItemToCompare = valueToCompare.length;
      const isEmpty = lenItemBase === 0 && lenItemToCompare === 0;
      //comparar tamaños
      if ((isCompareLength && lenItemBase != lenItemToCompare) || isEmpty) {
        isEquivalent = isEmpty;
      } else {
        //el len a usar como base de recorrido
        let lenItemRun =
          lenItemBase <= lenItemToCompare ? lenItemBase : lenItemToCompare;
        //comprobar elemento por elemento
        for (let sIdx = 0; sIdx < lenItemRun; sIdx++) {
          const sValueBase = valueBase[sIdx];
          const sValueToCompare = valueToCompare[sIdx];
          isEquivalent = this.isEquivalentTo([sValueBase, sValueToCompare], {
            keyOrKeysPath: isKPTCArray ? keysPath : undefined,
            isCompareLength,
            isCompareSize,
            isCaseSensitiveForString,
            isCompareStringToNumber,
            isStringLocaleMode,
          });
          if (isEquivalent === false) break;
        }
      }
    }
    //comparar objeto
    else if (
      this.isObject(valueBase, true) &&
      this.isObject(valueToCompare, true)
    ) {
      if (isKPTCArray) {
        const lenVB = Object.keys(valueBase).length;
        const lenVC = Object.keys(valueToCompare).length;
        if (lenVB === 0 && lenVC === 0) {
          isEquivalent = true;
        } else {
          for (const itemKeyPath of keysPath) {
            const keysSplitPath = itemKeyPath.split(sp);
            const key = keysSplitPath[0];
            keysSplitPath.shift();
            const subKeyOrKeysPath =
              keysSplitPath.length > 0 ? [keysSplitPath.join(sp)] : [];
            const sValueBase = valueBase[key];
            const sValueToCompare = valueToCompare[key];
            isEquivalent = this.isEquivalentTo([sValueBase, sValueToCompare], {
              keyOrKeysPath: subKeyOrKeysPath,
              isCompareLength,
              isCompareSize,
              isCaseSensitiveForString,
              isCompareStringToNumber,
              isStringLocaleMode,
            });
            if (isEquivalent === false) break;
          }
        }
      } else {
        const keysVB = Object.keys(valueBase).sort();
        const keysVC = Object.keys(valueToCompare).sort();
        const lenVB = keysVB.length;
        const lenVC = keysVC.length;
        const isEmpty = lenVB === 0 && lenVC === 0;
        if ((isCompareSize && lenVB != lenVC) || isEmpty) {
          isEquivalent = isEmpty;
        } else {
          //las claves identificadoras a recorrer
          let keysRun = lenVB <= lenVC ? keysVB : keysVC;
          //comprobar subobjeto por subobjeto
          for (const keyR of keysRun) {
            const sValueBase = valueBase[keyR];
            const sValueToCompare = valueToCompare[keyR];
            isEquivalent = this.isEquivalentTo([sValueBase, sValueToCompare], {
              keyOrKeysPath: undefined,
              isCompareLength,
              isCompareSize,
              isCaseSensitiveForString,
              isCompareStringToNumber,
              isStringLocaleMode,
            });
            if (isEquivalent === false) break;
          }
        }
      }
    }
    //comparar funciones
    else if (
      typeof valueBase === "function" &&
      typeof valueToCompare === "function"
    ) {
      const regExpCompress = /(\r\n|\n|\r| |;)/gm; //quitar caracteres
      const str_fnItemBase = valueBase.toString().replace(regExpCompress, "");
      const str_fnItem = valueToCompare.toString().replace(regExpCompress, "");
      isEquivalent = str_fnItemBase === str_fnItem;
    }
    //comparar strings
    else if (this.isString(valueBase) && this.isString(valueToCompare)) {
      let strVB = valueBase;
      let strVC = valueToCompare;
      if (!isCaseSensitiveForString) {
        strVB = isStringLocaleMode
          ? valueBase.toLocaleUpperCase()
          : valueBase.toUpperCase();
        strVC = isStringLocaleMode
          ? valueToCompare.toLocaleUpperCase()
          : valueToCompare.toUpperCase();
      }
      isEquivalent = strVB === strVC;
    }
    //comparar number
    else if (this.isNumber(valueBase) && this.isNumber(valueToCompare)) {
      isEquivalent = valueBase === valueToCompare;
    }
    //comparar caso especial string a number
    else if (
      isCompareStringToNumber &&
      this.isNumber(valueBase, true) &&
      this.isNumber(valueToCompare, true)
    ) {
      isEquivalent =
        this.stringToNumber(valueBase) === this.stringToNumber(valueToCompare);
    }
    //comparar primitivos
    else {
      isEquivalent = valueBase === valueToCompare;
    }
    return isEquivalent;
  }
  /**
   * Permite comparar dos valores para determinar si el primero es mayor que el segundo.
   *
   * ⚠ funciona en base a equivalencia (no igualdad),
   * porque los objetos no se comparan como `{} > {}` ya que eso
   * compara que una referencia sea mayor a la otra, mas no su contenido.
   *
   * **⚠⚠ Importante los pesos de los tipos ⚠⚠**
   *
   * Lista de pesos (de menor a mayor peso):
   *
   * - `undefined`
   * - `null`
   * - `function`
   * - `boolean`
   * - `number`
   * - `string-number` cuando esta activada `isCompareStringToNumber`
   * - `string`
   * - `object`
   * - `array`
   *
   * los pesos son estrictos y tienen en cuenta el tipo. Ejemplo:
   *  - `A` es mas pesado que `a` //cuando es case sensitive
   *  - `0` es mas pesado que `true`.
   *  - `true` es mas pesado que `false`.
   *  - `false` es mas pesado que null
   *  - `null` es mas pesado que `undefined`
   *
   * @param {[any, any]} compareValues Tupla con los valores a comparar donde:
   * - `compareValues[0]` el supuesto valor mayor.
   * - `compareValues[1]` el supuesto valor menor.
   * @param {object} config Configuración para realizar la comparación:
   *   - `isAllowEquivalent` (**Obligatorio**) determina si se permite la equivalencia en la compracion
   *   - `keyOrKeysPath`: (solo para objetos o array de objetos) claves identificadoras de las propiedades que se usarán para comparar.
   *   - `isCompareLength`: (solo arrays) determina si se compara el tamaño de los arrays.
   *   - `isCompareSize`: (solo para objetos) determina si se comparan la cantidad de objetos.
   *   - `isCompareStringToNumber`: (solo para string posiblemente numérico) determina que en la comparación los string numéricos sean comparados como si fueran números (`2` sería equivalente a `"2"`).
   *   - `isCaseSensitiveForString`: (solo para string) si la comparación es sensitiva a mayúsculas y minúsculas.
   *   - `isStringLocaleMode`: (solo para string) si se usan métodos de comparación asumiendo la configuración regional del sistema.
   * @returns {boolean} Retorna `true` si los valores son equivalentes según los criterios definidos, `false` de lo contrario.
   *
   * @example
   * ````typescript
   * let a;
   * let b;
   * let r;
   *
   * //comparacion basica de primitivos (mismo tipo (1))
   * a = 1;
   * b = -1;
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: true
   *
   * //comparacion basica de primitivos
   * //(mismo tipo (2), sin permitir equivalencia)
   * a = 1;
   * b = 1;
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: false (la equivalencia no esta permitida)
   *
   * //comparacion basica de primitivos
   * //(mismo tipo (2), con permitir equivalencia)
   * a = 1;
   * b = 1;
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: true
   * });
   * console.log(r); // Salida: true (la equivalencia si esta permitida)
   *
   * //comparacion basica de primitivos (mismo tipo (3))
   * a = ()=>"hola";
   * b = (p)=>p;
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: true (internamente las
   * //funciones se comparan transformandolas en
   * //string y comparando sus tamaños, esta trasformacion
   * //elimina caracteres no necesarios para la comparacion
   * //(saltos de linea, tabulaciones y demas))
   *
   * //comparacion basica de primitivos (mismo tipo (4))
   * a = "Edificio";
   * b = "Casa";
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: true (`"E"` de `"Edificio"` pesa mas que `"C"` de casa)
   *
   * //comparacion de primitivos (mismo tipo (5))
   * a = "Edificio";
   * b = "Edificacion";
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: true
   * // (`"Edifici"` pesa mas que `"Edifica"`)
   *
   * //comparacion de primitivos (mismo tipo (6), si sensitivo)
   * a = "juan";
   * b = "Juan";
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false,
   *   isCaseSensitiveForString: true,
   * });
   * console.log(r); // Salida: false (`"j"` pesa menos que `"J"`)
   *
   * //comparacion de primitivos (mismo tipo (7),si equivalencia y no sensitivo)
   * a = "juan";
   * b = "Juan";
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: true,
   *   isCaseSensitiveForString: false,
   * });
   * console.log(r); // Salida: true (`"j"` pesa menos que `"J"`
   * //pero al no se sensitivo, se asume que pesan igual)
   *
   * //comparacion basica de primitivos (diferente tipo (1))
   * a = undefined;
   * b = null;
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: false (por que undefined es menos pesado que null)
   *
   * //comparacion basica de primitivos (diferente tipo (2))
   * a = "1";
   * b = 2;
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: true (`"1"` es string es mas pesado que `2` number)
   *
   * //comparacion basica de primitivos
   * //(diferente tipo, con `isCompareStringToNumber` (3))
   * a = "1";
   * b = 2;
   * r = isGreaterTo([a, b], {
   *   isCompareStringToNumber: true
   * });
   * console.log(r); // Salida: false (`"1"` se comparará a`2` como si ambos fueran number)
   *
   * //comparacion basica de objetos
   * a = {a: "hola", b:31};
   * b = {a: "hola", b:15};
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: true (la propiedad `b` es mayor en el primer objeto)
   *
   * //comparacion basica de objetos (con keysOrKeysPath)
   * a = {a: "hola", b:31};
   * b = {a: "hola", b:15};
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false,
   *   keyOrKeysPath: "a" //comparar por esta propiedad
   * });
   * console.log(r); // Salida: false (la propiedad `b` es mayor
   * //pero se esta comparando solo por la propiedad `a`)
   *
   * //comparacion basica de objetos (con keysOrKeysPath y equivalencia permitida)
   * a = {a: "hola", b:15, c:1};
   * b = {a: "hola", b:15, c:6};
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: true,
   *   keyOrKeysPath: ["a", "b"] //comparar por estas propiedades
   * });
   * console.log(r); // Salida: true (las propiedades `a` y `b` que
   * //se estan comparando son equivalentes)
   *
   * //comparacion basica de objetos (con keysOrKeysPath y equivalencia permitida)
   * a = {a: "adios", b:15000, c: 1000};
   * b = {a: "hola", b:15, c: 6};
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: true,
   *   keyOrKeysPath: ["a", "b"] //comparar por estas propiedades ❗El orden es IMPORTANTE❗
   * });
   * console.log(r); // Salida: false (si bien la propiedad `b` es mayor en el primer objeto
   * //la primera comparacion se hace en la propiedad `a` y la letra `"a"` es pesa menos que la letra `"h"`)
   *
   * //comparacion de objetos (con keysOrKeysPath y profundidad)
   * a = {a: "Que Mas", b:{c: 31, d: 15}};
   * b = {a: "hola", b:{c: 0, d: 15}};
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false,
   *   keyOrKeysPath: ["a", "b.d"] //comparar por estas propiedades (recordar "b.d" es la ruta a la propiedad profunda)
   *                               //❗el orden es IMPORTANTE❗
   * });
   * console.log(r); // Salida: true
   *
   * //comparacion basica de arrays
   * a = ["a", 1, false];
   * b = ["a", 1, true];
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: false (el ultimo elemento `false`
   * //del primer array pesa menos que el ultimo elemento `true`
   * //del segundo array)
   *
   * //comparacion basica de arrays
   * a = ["a", 1, false];
   * b = ["a", 1, false];
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: false (no se permite la equivalencia)
   *
   * //comparacion basica de arrays (no tamaños)
   * a = ["a", 1, true];
   * b = ["a", 1, false, 2];
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: true (porque no se esta comparando tamaños y
   * //se compararán los elementos del array mas pequeño con el mas grande
   * //en la misma posicion donde se encuentran)
   *
   * //comparacion basica de arrays (no tamaños)
   * a = ["a", 1, null, false];
   * b = ["a", 1, false];
   * r = isGreaterTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: false (porque no se esta comprando tamaños pero
   * //se compararán los elementos del array mas pequeño con el mas grande
   * //en la misma posicion donde se encuentran (`null` pesa menos que `false`))
   *
   * //comparacion basica de arrays (si tamaños)
   * a = ["a", 1, false, 2];
   * b = ["a", 1, false];
   * r = isGreaterTo([a, b], {,
   *   isAllowEquivalent: false,
   *   isCompareLength: true
   * }); //sin configuracion
   * console.log(r); // Salida: true (el primer array es mas grande que el segundo,
   * //las demas comparaciones internas se ignoran)
   *
   * ````
   */
  isGreaterTo(compareValues, config) {
    if (!this.isArray(compareValues, true) || compareValues.length > 2)
      throw new Error(`${config} is not tuple of compare values valid`);
    if (!this.isObject(config, true))
      throw new Error(`${config} is not object of configuration valid`);
    //si es vacio es como comparar `undefined > undefined` (no es mayor a si mismo, puede ser equivalente)
    if (compareValues.length === 0) return config.isAllowEquivalent;
    //si solo tiene un elemento es como si comparara a `any > undefined` (si es mayord)
    if (compareValues.length === 1)
      return (
        compareValues[0] !== undefined || //solo si no es `undefined`
        (compareValues[0] === undefined && config.isAllowEquivalent)
      );
    if (
      this.isNotUndefinedAndNotNull(config.keyOrKeysPath) &&
      !this.isString(config.keyOrKeysPath) && //❗Obligario negar string vacio❗
      !this.isArray(config.keyOrKeysPath, true) //❗Obligario permitir array vacio❗
    )
      throw new Error(`${config.keyOrKeysPath} is not key or keys path valid`);
    let {
      isCompareLength = false, //❗Obligatorio `false` predefinido❗
      isCompareSize = false, //❗Obligatorio `false` predefinido❗
      keyOrKeysPath,
      isAllowEquivalent = false, //predefinidos
      isCompareStringToNumber = false, //predefinidos
      isCaseSensitiveForString = true, //predefinidos
      isStringLocaleMode = true, //predefinidos
    } = config;
    //Inicio de proceso
    const [valueBase, valueToCompare] = compareValues;
    let keysPath = this.isArray(keyOrKeysPath, true)
      ? [...keyOrKeysPath]
      : this.isString(keyOrKeysPath)
      ? [keyOrKeysPath]
      : [];
    isCompareLength = this.anyToBoolean(isCompareLength);
    isCompareSize = this.anyToBoolean(isCompareSize);
    isAllowEquivalent = this.anyToBoolean(isAllowEquivalent);
    isCompareStringToNumber = this.anyToBoolean(isCompareStringToNumber);
    isStringLocaleMode = this.anyToBoolean(isStringLocaleMode);
    let isGreater = true; //obligatorio iniciar con true
    //eliminar claves identificadoras repetidas
    const isKPTCArray = this.isArray(keysPath, false); //❗no se aceptan vacios
    if (isKPTCArray) keysPath = [...new Set(keysPath)];
    const sp = this.charSeparatorLogicPath;
    //comparar arrays
    if (this.isArray(valueBase, true) && this.isArray(valueToCompare, true)) {
      const lenItemBase = valueBase.length;
      const lenItemToCompare = valueToCompare.length;
      //comparar tamaños
      if (
        (isCompareLength && lenItemBase <= lenItemToCompare) ||
        (lenItemBase === 0 && lenItemToCompare === 0)
      ) {
        isGreater = lenItemBase < lenItemToCompare ? false : isAllowEquivalent;
      } else {
        let lenItemRun =
          lenItemBase <= lenItemToCompare
            ? //se selecciona el len mas pequeño para recorrer
              lenItemBase
            : lenItemToCompare;
        //comparar todos loes elementos
        for (let idx = 0; idx < lenItemRun; idx++) {
          const sValueBase = valueBase[idx];
          const sValueToCompare = valueToCompare[idx];
          const isEquivalent = this.isEquivalentTo(
            [sValueBase, sValueToCompare],
            {
              isCaseSensitiveForString,
              isCompareLength,
              isCompareSize,
              isCompareStringToNumber,
              isStringLocaleMode,
              keyOrKeysPath: keysPath,
            }
          );
          //tratamiento de equivalencias (para seguir al siguinte objeto)
          if (isEquivalent) {
            if (idx < lenItemRun - 1) continue; //solo continuará si esquivalente y no el ultimo
            isGreater = isAllowEquivalent;
            break;
          }
          isGreater = this.isGreaterTo([sValueBase, sValueToCompare], {
            isAllowEquivalent,
            keyOrKeysPath: isKPTCArray ? keysPath : undefined,
            isCompareLength,
            isCompareSize,
            isCompareStringToNumber,
            isCaseSensitiveForString,
            isStringLocaleMode,
          });
          break;
        }
      }
    }
    //comparar objetos
    else if (
      this.isObject(valueBase, true) &&
      this.isObject(valueToCompare, true)
    ) {
      if (isKPTCArray) {
        const lenKP = keysPath.length;
        const lenVB = Object.keys(valueBase).length; //no necesitan ordenarse
        const lenVC = Object.keys(valueToCompare).length; //no necesitan ordenarse
        if (lenVB === 0 && lenVC === 0) {
          isGreater = isAllowEquivalent;
        } else {
          for (let idx = 0; idx < lenKP; idx++) {
            const itemKeyPath = keysPath[idx];
            const keysSplitPath = itemKeyPath.split(sp);
            const key = keysSplitPath[0];
            keysSplitPath.shift();
            const subKeysPathToCompare =
              keysSplitPath.length > 0 ? [keysSplitPath.join(sp)] : [];
            const sValueBase = valueBase[key];
            const sValueToCompare = valueToCompare[key];
            //obligatoria para seguir al otro objeto (si son equivalentes)
            const isEquivalent = this.isEquivalentTo(
              [sValueBase, sValueToCompare],
              {
                isCaseSensitiveForString,
                isCompareLength,
                isCompareSize,
                isCompareStringToNumber,
                isStringLocaleMode,
                keyOrKeysPath: subKeysPathToCompare,
              }
            );
            //tratamiento de equivalencias (para seguir al siguinte objeto)
            if (isEquivalent) {
              if (idx < lenKP - 1) continue; //solo continuará si esquivalente y no el ultmo
              isGreater = isAllowEquivalent;
              break;
            }
            //compare mayor
            isGreater = this.isGreaterTo([sValueBase, sValueToCompare], {
              isAllowEquivalent,
              keyOrKeysPath: subKeysPathToCompare,
              isCompareLength,
              isCompareSize,
              isCompareStringToNumber,
              isCaseSensitiveForString,
              isStringLocaleMode,
            });
            break;
          }
        }
      } else {
        const keysVB = Object.keys(valueBase).sort();
        const keysVC = Object.keys(valueToCompare).sort();
        const lenVB = keysVB.length;
        const lenVC = keysVC.length;
        if ((isCompareSize && lenVB <= lenVC) || (lenVB === 0 && lenVC === 0)) {
          isGreater = keysVB.length < keysVC.length ? false : isAllowEquivalent;
        } else {
          //las claves identificadoras a recorrer
          let keysRun = lenVB <= lenVC ? keysVB : keysVC;
          const lenKR = keysRun.length;
          //comprobar subobjeto por subobjeto
          for (let idx = 0; idx < lenKR; idx++) {
            const keyR = keysRun[idx];
            const sValueBase = valueBase[keyR];
            const sValueToCompare = valueToCompare[keyR];
            //obligatoria para seguir al otro objeto (si son equivalentes)
            const isEquivalent = this.isEquivalentTo(
              [sValueBase, sValueToCompare],
              {
                isCaseSensitiveForString,
                isCompareLength,
                isCompareSize,
                isCompareStringToNumber,
                isStringLocaleMode,
                keyOrKeysPath,
              }
            );
            //tratamiento de equivalencias (para seguir al siguinte objeto)
            if (isEquivalent) {
              if (idx < lenKR - 1) continue;
              isGreater = isAllowEquivalent;
              break;
            }
            isGreater = this.isGreaterTo([sValueBase, sValueToCompare], {
              isAllowEquivalent,
              keyOrKeysPath: undefined,
              isCompareLength,
              isCompareSize,
              isCaseSensitiveForString,
              isCompareStringToNumber,
              isStringLocaleMode,
            });
            break;
          }
        }
      }
    }
    //comparar strings
    else if (this.isString(valueBase) && this.isString(valueToCompare)) {
      let strVB = valueBase;
      let strVC = valueToCompare;
      if (!isCaseSensitiveForString) {
        strVB = isStringLocaleMode
          ? valueBase.toLocaleUpperCase()
          : valueBase.toUpperCase();
        strVC = isStringLocaleMode
          ? valueToCompare.toLocaleUpperCase()
          : valueToCompare.toUpperCase();
      }
      //comara 2 string sin usar locale
      const stringCompareNotLocaleFn = (a, b) => {
        if (a > b) return 1;
        else if (a < b) return -1;
        else return 0;
      };
      const modulus = isStringLocaleMode
        ? strVB.localeCompare(strVC)
        : stringCompareNotLocaleFn(strVB, strVC);
      isGreater = modulus > 0 ? true : isAllowEquivalent && modulus === 0;
    }
    //comparar number
    else if (this.isNumber(valueBase) && this.isNumber(valueToCompare)) {
      const modulus = valueBase - valueToCompare;
      isGreater = modulus > 0 ? true : isAllowEquivalent && modulus === 0;
    }
    //comparar caso especial string a number
    else if (
      this.isNumber(valueBase, isCompareStringToNumber) &&
      this.isNumber(valueToCompare, isCompareStringToNumber)
    ) {
      const modulus =
        this.stringToNumber(valueBase) - this.stringToNumber(valueToCompare);
      isGreater = modulus > 0 ? true : isAllowEquivalent && modulus === 0;
    }
    //comparar caso especial boolean (true pesa mas que false)
    else if (this.isBoolean(valueBase) && this.isBoolean(valueToCompare)) {
      const modulus = valueBase - valueToCompare; //que locura javascript 🤯
      isGreater = modulus > 0 ? true : isAllowEquivalent && modulus === 0;
    }
    //comparar funciones
    else if (
      typeof valueBase === "function" &&
      typeof valueToCompare === "function"
    ) {
      const regExpCompress = /(\r\n|\n|\r| |;)/gm; //quitar caracteres
      const str_fnItemBase = valueBase.toString().replace(regExpCompress, "");
      const str_fnItem = valueToCompare.toString().replace(regExpCompress, "");
      const modulus = str_fnItemBase.length - str_fnItem.length;
      isGreater = modulus > 0 ? true : isAllowEquivalent && modulus === 0;
    }
    //comparar caso especial null
    else if (valueBase === null && valueToCompare === null) {
      isGreater = isAllowEquivalent;
    }
    //comparar caso especial undefined
    else if (valueBase === undefined && valueToCompare === undefined) {
      isGreater = isAllowEquivalent;
    }
    //comparar primitivos
    else {
      if (valueBase === undefined) {
        isGreater = false;
      } else if (valueBase === null) {
        isGreater = valueToCompare === undefined;
      } else if (typeof valueBase === "function") {
        isGreater = valueToCompare === undefined || valueToCompare === null;
      } else if (this.isBoolean(valueBase)) {
        isGreater =
          valueToCompare === undefined ||
          valueToCompare === null ||
          typeof valueToCompare === "function";
      } else if (this.isNumber(valueBase, false)) {
        isGreater =
          valueToCompare === undefined ||
          valueToCompare === null ||
          typeof valueToCompare === "function" ||
          this.isBoolean(valueToCompare);
      } else if (this.isString(valueBase, true)) {
        isGreater =
          valueToCompare === undefined ||
          valueToCompare === null ||
          typeof valueToCompare === "function" ||
          this.isBoolean(valueToCompare) ||
          this.isNumber(valueToCompare);
      } else if (this.isObject(valueBase, true)) {
        isGreater =
          valueToCompare === undefined ||
          valueToCompare === null ||
          typeof valueToCompare === "function" ||
          this.isBoolean(valueToCompare) ||
          this.isNumber(valueToCompare) ||
          this.isString(valueToCompare, true);
      } else if (this.isArray(valueBase, true)) {
        isGreater =
          valueToCompare === undefined ||
          valueToCompare === null ||
          typeof valueToCompare === "function" ||
          this.isBoolean(valueToCompare) ||
          this.isNumber(valueToCompare) ||
          this.isString(valueToCompare, true) ||
          this.isObject(valueToCompare, true);
      } else {
        isGreater = true;
      }
    }
    return isGreater;
  }
  /**
   * Permite comparar dos valores para determinar si el primero es menor que el segundo.
   *
   * ⚠ funciona en base a equivalencia (no igualdad),
   * porque los objetos no se comparan como `{} < {}` ya que eso
   * compara que una referencia sea menor a la otra, mas no su contenido.
   *
   * **⚠⚠ Importante los pesos de los tipos ⚠⚠**
   *
   * Lista de pesos (de menor a mayor peso):
   *
   * - `undefined`
   * - `null`
   * - `function`
   * - `boolean`
   * - `number`
   * - `string-number` cuando esta activada `isCompareStringToNumber`
   * - `string`
   * - `object`
   * - `array`
   *
   * los pesos son estrictos y tienen en cuenta el tipo. Ejemplo:
   *  - `A` es mas pesado que `a` //cuando es case sensitive
   *  - `0` es mas pesado que `true`.
   *  - `true` es mas pesado que `false`.
   *  - `false` es mas pesado que null
   *  - `null` es mas pesado que `undefined`
   *
   * @param {[any, any]} compareValues Tupla con los valores a comparar donde:
   * - `compareValues[0]` el supuesto valor menor.
   * - `compareValues[1]` el supuesto valor mayor.
   * @param {object} config Configuración para realizar la comparación:
   *   - `isAllowEquivalent` (**Obligatorio**) determina si se permite la equivalencia en la compracion
   *   - `keyOrKeysPath`: (solo para objetos o array de objetos) claves identificadoras de las propiedades que se usarán para comparar.
   *   - `isCompareLength`: (solo arrays) determina si se compara el tamaño de los arrays.
   *   - `isCompareSize`: (solo para objetos) determina si se comparan la cantidad de objetos.
   *   - `isCompareStringToNumber`: (solo para string posiblemente numérico) determina que en la comparación los string numéricos sean comparados como si fueran números (`2` sería equivalente a `"2"`).
   *   - `isCaseSensitiveForString`: (solo para string) si la comparación es sensitiva a mayúsculas y minúsculas.
   *   - `isStringLocaleMode`: (solo para string) si se usan métodos de comparación asumiendo la configuración regional del sistema.
   * @returns {boolean} Retorna `true` si los valores son equivalentes según los criterios definidos, `false` de lo contrario.
   *
   * @example
   * ````typescript
   * let a;
   * let b;
   * let r;
   *
   * //comparacion basica de primitivos (mismo tipo (1))
   * a = -1;
   * b = 1;
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: true
   *
   * //comparacion basica de primitivos
   * //(mismo tipo (2), sin permitir equivalencia)
   * a = 1;
   * b = 1;
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: false (la equivalencia no esta permitida)
   *
   * //comparacion basica de primitivos
   * //(mismo tipo (2), con permitir equivalencia)
   * a = 1;
   * b = 1;
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: true
   * });
   * console.log(r); // Salida: true (la equivalencia si esta permitida)
   *
   * //comparacion basica de primitivos (mismo tipo (3))
   * a = ()=>"hola";
   * b = (p)=>p;
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: false (internamente las
   * //funciones se comparan transformandolas en
   * //string y comparando sus tamaños, esta trasformacion
   * //elimina caracteres no necesarios para la comparacion
   * //(saltos de linea, tabulaciones y demas))
   *
   * //comparacion basica de primitivos (mismo tipo (4))
   * a = "Casa";
   * b = "Edificio";
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: true (`"C"` de casa` pesa menos que "E"` de `"Edificio"`)
   *
   * //comparacion de primitivos (mismo tipo (5))
   * a = "Edificio";
   * b = "Edificacion";
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: false
   * // (`"Edifici"` pesa mas que `"Edifica"`)
   *
   * //comparacion de primitivos (mismo tipo (6), si sensitivo)
   * a = "Juan";
   * b = "juan";
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false,
   *   isCaseSensitiveForString: true,
   * });
   * console.log(r); // Salida: false (`"J"` pesa mas que `"j"`)
   *
   * //comparacion de primitivos (mismo tipo (7),si equivalencia y no sensitivo)
   * a = "Juan";
   * b = "juan";
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: true,
   *   isCaseSensitiveForString: false,
   * });
   * console.log(r); // Salida: true (`"J"` pesa mas que `"j"`
   * //pero al no se sensitivo, se asume que pesan igual)
   *
   * //comparacion basica de primitivos (diferente tipo (1))
   * a = undefined;
   * b = null;
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false
   * });
   * console.log(r); // Salida: true (por que `undefined` es pesa menos que `null`)
   *
   * //comparacion basica de primitivos (diferente tipo (2))
   * a = "1";
   * b = 2;
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: false (`"1"` es string es mas pesado que `2` number)
   *
   * //comparacion basica de primitivos
   * //(diferente tipo, con `isCompareStringToNumber` (3))
   * a = "1";
   * b = 2;
   * r = isLesserTo([a, b], {
   *   isCompareStringToNumber: true
   * });
   * console.log(r); // Salida: true (`"1"` se comparará a`2` como si ambos fueran number)
   *
   * //comparacion basica de objetos
   * a = {a: "hola", b:31};
   * b = {a: "hola", b:15};
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: false (la propiedad `b` es mayor en el primer objeto)
   *
   * //comparacion basica de objetos (con keysOrKeysPath)
   * a = {a: "hola", b:15};
   * b = {a: "hola", b:31};
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false,
   *   keyOrKeysPath: "a" //comparar por esta propiedad
   * });
   * console.log(r); // Salida: false (la propiedad `b` es menor
   * //pero se esta comparando solo por la propiedad `a`)
   *
   * //comparacion basica de objetos (con keysOrKeysPath y equivalencia permitida)
   * a = {a: "hola", b:15, c:1};
   * b = {a: "hola", b:15, c:6};
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: true,
   *   keyOrKeysPath: ["a", "b"] //comparar por estas propiedades
   * });
   * console.log(r); // Salida: true (las propiedades `a` y `b` que
   * //se estan comparando son equivalentes)
   *
   * //comparacion basica de objetos (con keysOrKeysPath y equivalencia permitida)
   * a = {a: "adios", b:15000, c: 1000};
   * b = {a: "hola", b:15, c: 6};
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: true,
   *   keyOrKeysPath: ["a", "b"] //comparar por estas propiedades ❗El orden es IMPORTANTE❗
   * });
   * console.log(r); // Salida: true (si bien la propiedad `b` es mayor en el primer objeto
   * //la primera comparacion se hace en la propiedad `a` y la letra `"a"` es pesa menos que la letra `"h"`)
   *
   * //comparacion de objetos (con keysOrKeysPath y profundidad)
   * a = {a: "hola", b:{c: 31, d: 15}};
   * b = {a: "que Mas", b:{c: 0, d: 15}};
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false,
   *   keyOrKeysPath: ["a", "b.d"] //comparar por estas propiedades (recordar "b.d" es la ruta a la propiedad profunda)
   *                               //❗el orden es IMPORTANTE❗
   * });
   * console.log(r); // Salida: true
   *
   * //comparacion basica de arrays
   * a = ["a", 1, false];
   * b = ["a", 1, true];
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: true (el ultimo elemento `false`
   * //del primer array pesa menos que el ultimo elemento `true`
   * //del segundo array)
   *
   * //comparacion basica de arrays
   * a = ["a", 1, false];
   * b = ["a", 1, false];
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: false (no se permite la equivalencia)
   *
   * //comparacion basica de arrays (no tamaños)
   * a = ["a", 1, true];
   * b = ["a", 1, false, 2];
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: true (porque no se esta comparando tamaños y
   * //se compararán los elementos del array mas pequeño con el mas grande
   * //en la misma posicion donde se encuentran)
   *
   * //comparacion basica de arrays (no tamaños)
   * a = ["a", 1, null, false];
   * b = ["a", 1, false];
   * r = isLesserTo([a, b], {
   *   isAllowEquivalent: false,
   * });
   * console.log(r); // Salida: true (porque no se esta comprando tamaños pero
   * //se compararán los elementos del array mas pequeño con el mas grande
   * //en la misma posicion donde se encuentran (`null` pesa menos que `false`))
   *
   * //comparacion basica de arrays (si tamaños)
   * a = ["a", 1, false, 2];
   * b = ["a", 1, false];
   * r = isLesserTo([a, b], {,
   *   isAllowEquivalent: false,
   *   isCompareLength: true
   * }); //sin configuracion
   * console.log(r); // Salida: false (el primer array es mas grande que el segundo,
   * //las demas comparaciones internas se ignoran)
   *
   * ````
   */
  isLesserTo(compareValues, config) {
    if (!this.isArray(compareValues, true) || compareValues.length > 2)
      throw new Error(`${config} is not tuple of compare values valid`);
    if (!this.isObject(config, true))
      throw new Error(`${config} is not object of configuration valid`);
    //si es vacio es como comparar `undefined < undefined` (no es menor a si mismo, puede ser equivalente)
    if (compareValues.length === 0) return config.isAllowEquivalent;
    //si solo tiene un elemento es como si comparara a `any < undefined`
    if (compareValues.length === 1)
      return compareValues[0] === undefined && config.isAllowEquivalent;
    if (
      this.isNotUndefinedAndNotNull(config.keyOrKeysPath) &&
      !this.isString(config.keyOrKeysPath) && //❗Obligario negar string vacio❗
      !this.isArray(config.keyOrKeysPath, true) //❗Obligario permitir array vacio❗
    )
      throw new Error(`${config.keyOrKeysPath} is not key or keys path valid`);
    let {
      isCompareLength = false, //❗Obligatorio `false` predefinido❗
      isCompareSize = false, //❗Obligatorio `false` predefinido❗
      keyOrKeysPath,
      isAllowEquivalent = false, //predefinidos
      isCompareStringToNumber = false, //predefinidos
      isCaseSensitiveForString = true, //predefinidos
      isStringLocaleMode = true, //predefinidos
    } = config;
    //Inicio de proceso
    const [valueBase, valueToCompare] = compareValues;
    let keysPath = this.isArray(keyOrKeysPath, true)
      ? [...keyOrKeysPath]
      : this.isString(keyOrKeysPath)
      ? [keyOrKeysPath]
      : [];
    isCompareLength = this.anyToBoolean(isCompareLength);
    isCompareSize = this.anyToBoolean(isCompareSize);
    isAllowEquivalent = this.anyToBoolean(isAllowEquivalent);
    isCompareStringToNumber = this.anyToBoolean(isCompareStringToNumber);
    isStringLocaleMode = this.anyToBoolean(isStringLocaleMode);
    let isLesser = true; //obligatorio iniciar con true
    //eliminar claves identificadoras repetidas
    const isKPTCArray = this.isArray(keysPath, false); //❗no se aceptan vacios
    if (isKPTCArray) keysPath = [...new Set(keysPath)];
    const sp = this.charSeparatorLogicPath;
    //comparar arrays
    if (this.isArray(valueBase, true) && this.isArray(valueToCompare, true)) {
      const lenItemBase = valueBase.length;
      const lenItemToCompare = valueToCompare.length;
      //comparar tamaños
      if (
        (isCompareLength && lenItemBase >= lenItemToCompare) ||
        (lenItemBase === 0 && lenItemToCompare === 0)
      ) {
        isLesser = lenItemBase > lenItemToCompare ? false : isAllowEquivalent;
      } else {
        let lenItemRun =
          lenItemBase <= lenItemToCompare
            ? //se selecciona el len mas pequeño para recorrer
              lenItemBase
            : lenItemToCompare;
        //comparar todos loes elementos
        for (let idx = 0; idx < lenItemRun; idx++) {
          const sValueBase = valueBase[idx];
          const sValueToCompare = valueToCompare[idx];
          const isEquivalent = this.isEquivalentTo(
            [sValueBase, sValueToCompare],
            {
              isCaseSensitiveForString,
              isCompareLength,
              isCompareSize,
              isCompareStringToNumber,
              isStringLocaleMode,
              keyOrKeysPath: keysPath,
            }
          );
          //tratamiento de equivalencias (para seguir al siguinte objeto)
          if (isEquivalent) {
            if (idx < lenItemRun - 1) continue; //solo continuará si esquivalente y no el ultimo
            isLesser = isAllowEquivalent;
            break;
          }
          isLesser = this.isLesserTo([sValueBase, sValueToCompare], {
            isAllowEquivalent,
            keyOrKeysPath: isKPTCArray ? keysPath : undefined,
            isCompareLength,
            isCompareSize,
            isCompareStringToNumber,
            isCaseSensitiveForString,
            isStringLocaleMode,
          });
          break;
        }
      }
    }
    //comparar objetos
    else if (
      this.isObject(valueBase, true) &&
      this.isObject(valueToCompare, true)
    ) {
      if (isKPTCArray) {
        const lenKP = keysPath.length;
        const lenVB = Object.keys(valueBase).length; //no necesitan ordenarse
        const lenVC = Object.keys(valueToCompare).length; //no necesitan ordenarse
        if (lenVB === 0 && lenVC === 0) {
          isLesser = isAllowEquivalent;
        } else {
          for (let idx = 0; idx < lenKP; idx++) {
            const itemKeyPath = keysPath[idx];
            const keysSplitPath = itemKeyPath.split(sp);
            const key = keysSplitPath[0];
            keysSplitPath.shift();
            const subKeysPathToCompare =
              keysSplitPath.length > 0 ? [keysSplitPath.join(sp)] : [];
            const sValueBase = valueBase[key];
            const sValueToCompare = valueToCompare[key];
            //obligatoria para seguir al otro objeto (si son equivalentes)
            const isEquivalent = this.isEquivalentTo(
              [sValueBase, sValueToCompare],
              {
                isCaseSensitiveForString,
                isCompareLength,
                isCompareSize,
                isCompareStringToNumber,
                isStringLocaleMode,
                keyOrKeysPath: subKeysPathToCompare,
              }
            );
            //tratamiento de equivalencias (para seguir al siguinte objeto)
            if (isEquivalent) {
              if (idx < lenKP - 1) continue; //solo continuará si esquivalente y no el ultmo
              isLesser = isAllowEquivalent;
              break;
            }
            //compare mayor
            isLesser = this.isLesserTo([sValueBase, sValueToCompare], {
              isAllowEquivalent,
              keyOrKeysPath: subKeysPathToCompare,
              isCompareLength,
              isCompareSize,
              isCompareStringToNumber,
              isCaseSensitiveForString,
              isStringLocaleMode,
            });
            break;
          }
        }
      } else {
        const keysVB = Object.keys(valueBase).sort();
        const keysVC = Object.keys(valueToCompare).sort();
        const lenVB = keysVB.length;
        const lenVC = keysVC.length;
        if ((isCompareSize && lenVB >= lenVC) || (lenVC === 0 && lenVC === 0)) {
          isLesser = keysVB.length > keysVC.length ? false : isAllowEquivalent;
        } else {
          //las claves identificadoras a recorrer
          let keysRun = lenVB <= lenVC ? keysVB : keysVC;
          const lenKR = keysRun.length;
          //comprobar subobjeto por subobjeto
          for (let idx = 0; idx < lenKR; idx++) {
            const keyR = keysRun[idx];
            const sValueBase = valueBase[keyR];
            const sValueToCompare = valueToCompare[keyR];
            //obligatoria para seguir al otro objeto (si son equivalentes)
            const isEquivalent = this.isEquivalentTo(
              [sValueBase, sValueToCompare],
              {
                isCaseSensitiveForString,
                isCompareLength,
                isCompareSize,
                isCompareStringToNumber,
                isStringLocaleMode,
                keyOrKeysPath,
              }
            );
            //tratamiento de equivalencias (para seguir al siguinte objeto)
            if (isEquivalent) {
              if (idx < lenKR - 1) continue;
              isLesser = isAllowEquivalent;
              break;
            }
            isLesser = this.isLesserTo([sValueBase, sValueToCompare], {
              isAllowEquivalent,
              keyOrKeysPath: undefined,
              isCompareLength,
              isCompareSize,
              isCaseSensitiveForString,
              isCompareStringToNumber,
              isStringLocaleMode,
            });
            break;
          }
        }
      }
    }
    //comparar strings
    else if (this.isString(valueBase) && this.isString(valueToCompare)) {
      let strVB = valueBase;
      let strVC = valueToCompare;
      if (!isCaseSensitiveForString) {
        strVB = isStringLocaleMode
          ? valueBase.toLocaleUpperCase()
          : valueBase.toUpperCase();
        strVC = isStringLocaleMode
          ? valueToCompare.toLocaleUpperCase()
          : valueToCompare.toUpperCase();
      }
      //comara 2 string sin usar locale
      const stringCompareNotLocaleFn = (a, b) => {
        if (a > b) return 1;
        else if (a < b) return -1;
        else return 0;
      };
      const modulus = isStringLocaleMode
        ? strVB.localeCompare(strVC)
        : stringCompareNotLocaleFn(strVB, strVC);
      isLesser = modulus < 0 ? true : isAllowEquivalent && modulus === 0;
    }
    //comparar number
    else if (this.isNumber(valueBase) && this.isNumber(valueToCompare)) {
      const modulus = valueBase - valueToCompare;
      isLesser = modulus < 0 ? true : isAllowEquivalent && modulus === 0;
    }
    //comparar caso especial string a number
    else if (
      this.isNumber(valueBase, isCompareStringToNumber) &&
      this.isNumber(valueToCompare, isCompareStringToNumber)
    ) {
      const modulus =
        this.stringToNumber(valueBase) - this.stringToNumber(valueToCompare);
      isLesser = modulus < 0 ? true : isAllowEquivalent && modulus === 0;
    }
    //comparar caso especial boolean (true pesa mas que false)
    else if (this.isBoolean(valueBase) && this.isBoolean(valueToCompare)) {
      const modulus = valueBase - valueToCompare;
      isLesser = modulus < 0 ? true : isAllowEquivalent && modulus === 0;
    }
    //comparar funciones
    else if (
      typeof valueBase === "function" &&
      typeof valueToCompare === "function"
    ) {
      const regExpCompress = /(\r\n|\n|\r| |;)/gm; //quitar caracteres
      const str_fnItemBase = valueBase.toString().replace(regExpCompress, "");
      const str_fnItem = valueToCompare.toString().replace(regExpCompress, "");
      const modulus = str_fnItemBase.length - str_fnItem.length;
      isLesser = modulus < 0 ? true : isAllowEquivalent && modulus === 0;
    }
    //comparar caso especial null
    else if (valueBase === null && valueToCompare === null) {
      isLesser = isAllowEquivalent;
    }
    //comparar caso especial undefined
    else if (valueBase === undefined && valueToCompare === undefined) {
      isLesser = isAllowEquivalent;
    }
    //comparar primitivos
    else {
      if (valueBase === undefined) {
        isLesser = true;
      } else if (valueBase === null) {
        isLesser = valueToCompare !== undefined;
      } else if (typeof valueBase === "function") {
        isLesser = valueToCompare !== undefined && valueToCompare !== null;
      } else if (this.isBoolean(valueBase)) {
        isLesser =
          valueToCompare !== undefined &&
          valueToCompare !== null &&
          typeof valueToCompare !== "function";
      } else if (this.isNumber(valueBase, false)) {
        isLesser =
          valueToCompare !== undefined &&
          valueToCompare !== null &&
          typeof valueToCompare !== "function" &&
          !this.isBoolean(valueToCompare);
      } else if (this.isString(valueBase, true)) {
        isLesser =
          valueToCompare !== undefined &&
          valueToCompare !== null &&
          typeof valueToCompare !== "function" &&
          !this.isBoolean(valueToCompare) &&
          !this.isNumber(valueToCompare);
      } else if (this.isObject(valueBase, true)) {
        isLesser =
          valueToCompare !== undefined &&
          valueToCompare !== null &&
          typeof valueToCompare !== "function" &&
          !this.isBoolean(valueToCompare) &&
          !this.isNumber(valueToCompare) &&
          !this.isString(valueToCompare, true);
      } else if (this.isArray(valueBase, true)) {
        isLesser =
          valueToCompare !== undefined &&
          valueToCompare !== null &&
          typeof valueToCompare !== "function" &&
          !this.isBoolean(valueToCompare) &&
          !this.isNumber(valueToCompare) &&
          !this.isString(valueToCompare, true) &&
          !this.isObject(valueToCompare, true);
      } else {
        isLesser = false;
      }
    }
    return isLesser;
  }
  /**... */
  anyCompareTo(compareValues, config) {
    const isEquivalent = this.isEquivalentTo(
      compareValues,
      Object.assign({}, config)
    );
    if (isEquivalent) return 0;
    const isGreater = this.isGreaterTo(
      compareValues,
      Object.assign(Object.assign({}, config), { isAllowEquivalent: true })
    );
    if (isGreater) return 1;
    const isLesser = this.isLesserTo(
      compareValues,
      Object.assign(Object.assign({}, config), { isAllowEquivalent: true })
    );
    if (isLesser) return -1;
    throw new Error(`Internal Errror in anyCompareTo() method`);
  }
}
