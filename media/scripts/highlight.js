import hljs from 'highlight.js'

[...document.getElementsByTagName('code')].forEach((e) => {
    const text = e.textContent
    const lines = text.split('\n')
    let indentAmount = Infinity
    for(const line of lines) {
        const indent = line.match(/^\s*\S/)
        console.log(indent?.[0])
        if(line.search(/\S/) !== -1) {
            const thisIndentAmount = indent[0].length - 1
            indentAmount = Math.min(thisIndentAmount, indentAmount)
        }
    }
    for(let n in lines) {
        lines[n] = lines[n].substring(indentAmount)
    }
    console.log(indentAmount)
    console.log(lines)
    e.textContent = lines.join('\n')

})
hljs.highlightAll()