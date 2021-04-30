const json2xml = (json) => {
   const getType = (value) => Object.prototype.toString.call(value).toLocaleLowerCase().slice(8, -1);
   const object2xml = (obj, key) => {
      const attributes = [];
      const children = [];
      Object.keys(obj).forEach((k) => {
         const value = obj[k]
         const type = getType(value)
         if (['object', 'array'].includes(type)) {
            children.push(object2xml(value, type === 'array' ? 'item' : k))
         } else {
            attributes.push(`${k}="${value}"`)
         }
      });
      if (key) {
         if (children.length) {
            return `<${key} ${attributes.join(' ')}>${children.join('')}</${key}>`
         }
         return `<${key} ${attributes.join(' ')} />`
      }
      return children.join('')
   }

   const header = '<?xml version="1.0" encoding="UTF-8"?>'
   const result = object2xml(json)
   return header + result;
}

export default json2xml
