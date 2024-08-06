const cosmjs = `
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@cosmjs/proto-signing@0.32.4/build/index.min.js';
script.type = 'module'
script.async = true
script.defer = true

script.onload = () => {
  consoel.log("exports")
  document.head.appendChild(script)
}

`;
export default cosmjs;
// https://cdn.jsdelivr.net/npm/@cosmjs/proto-signing@0.32.4/build/index.min.js

