import hljs from 'highlight.js'

[...document.getElementsByClassName('remove-indent')].forEach((e) => {

    const text = e.textContent
    const lines = text.split('\n')
    let indentAmount = Infinity
    while(lines[0].search(/\S/) == -1) {
        lines.shift()
    }
    while(lines[lines.length - 1].search(/\S/) == -1) {
        lines.pop()
    }
    for(const line of lines) {
        const indent = line.match(/^\s*\S/)
        console.log(indent?.[0])
        if(line.search(/\S/) !== -1) {
            const thisIndentAmount = indent[0].length - 1
            indentAmount = Math.min(thisIndentAmount, indentAmount)
        }
    }
    for(const n in lines) {
        console.log(n)
        lines[n] = lines[n].substring(indentAmount)
    }
    console.log(indentAmount)
    console.log(lines)
    e.textContent = ''
    e.textContent = lines.join('\n')

})
hljs.highlightAll()