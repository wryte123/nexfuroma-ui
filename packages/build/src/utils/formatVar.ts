function splitVar(Varname: string) {
  const reg = /[A-Z]{2,}(?=[A-Z][a-z]+|[0-9]|[^a-zA-Z0-9])|[A-Z]?[a-z]+|[A-Z]|[0-9]/g;
  return Varname.match(reg) || <string[]>[];
}

/** 将变量名转换为肉串形式：@nexfuromaui/build -> nexfuromaui-build */
export function kebabCase(varName: string) {
  const nameArr = splitVar(varName);
  return nameArr.map((item) => item.toLowerCase()).join('-');
}

/** 将变量名转换为驼峰形式：nexfuromaui-build -> nexfuromauiBuild */
export function camelCase(varName: string, isFirstWordUpperCase = false) {
  const nameArr = splitVar(varName);
  return nameArr
    .map((item, index) => {
      if (index === 0 && !isFirstWordUpperCase) {
        return item.toLowerCase();
      }
      return item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
    })
    .join('');
}