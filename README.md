# Caja de herramientas

## Descripción
Caja de herramientas contiene un recopilatorio funcional (estilo librería) de muchas funcionalidades recurrentes para la programación en JavaScript, donde el 95% del código es “vanilla JavaScript” (sin librerías añadidas, salvo funcionalidades muy específicas).

## Requisitos previos
- Conocimiento básico del lenguaje de programación JavaScript.
- Conocimiento de definición, funcionamiento e instanciación de clases en POO.
- Advertencia: el código utiliza JavaScript versión ECMAScript 2020 y lo ideal es usar versiones aún más recientes.

## Instrucciones de instalación
Copia el archivo `util.js` en el entorno donde se quiera usar (en versiones posteriores se manejará como paquete de librería npm).

## Uso básico
Se exporta la clase `UtilNative` y se utiliza como clase de tipo *Singleton* por medio del método `UtilNative.getInstance()`.

```javascript
// Ejemplo de uso
import { UtilNative } from "./util.js";
const util = UtilNative.getInstance(undefined); // o null
const r = util.isBoolean(1);
console.log(r); // false
```
## Contribuciones
Claro que se aceptan y son necesarias, la utilidad SIEMPRE debe estar en constante actualización. Asignar issues de la siguiente manera:

- Bugs:
    - Nombre de método.
    - Código corto de ejecución.
    - Expectativa de resultado.
    - Resultado obtenido.
- agregar funcionalidad:
    - Explicación en comentario de la nueva funcionalidad (incluir nombre)
    - Código corto de ejecución a modo de ejemplo.
    - Expectativa de resultado.
  
## Licencia MIT (libre libre como las aves)
