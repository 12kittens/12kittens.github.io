
export function animateCanvas1(img) {
    let top = 0

    let actual = [2, 3], before = [1, 0], shapeTransition = 1;
    let mx = 1, my = 0;
    let cx = 0, cy = 0;
    let plus = 0;
    let canvas, preElement;
    /*
    const dispositions = [
        [1, 0], [6, 7], [2, 5], [2, 7], [3, 4],
        [3, 5], [2, 5], [4, 5], [2, 11], [2, 3],
        [5, 8], [8, 9], [3, 7], [3, 5], [4, 7]
    ]*/
    const dispositions = [
        [1, 0], [2, 3], [2, 5], [2, 7], [2, 9],
        [3, 4], [3, 5], [3, 7], [3, 8], [3, 10],
        [4, 5], [4, 7], [5, 7], [5, 8], [5, 9]
    ]
    document.addEventListener('mousemove', (e) => {
        const amx = Math.floor(e.clientX / window.innerWidth * 5)
        const amy =  Math.floor(e.clientY / window.innerHeight * 3)
        plus += Math.hypot(e.movementX, e.movementY) / 1000
        cx = e.clientX
        cy = e.clientY
        if((amx !== mx || amy !== my) && shapeTransition > 0.9) {
            before = actual
            actual = dispositions[amx + amy * 5]
            shapeTransition = 0
            mx = amx
            my = amy
        }
    })

    const vsSource = `
    attribute float a_index;
    attribute vec4 a_random;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_divide;
    uniform vec2 u_divide_transition;
    uniform float u_transition;
    uniform float u_plus;
    varying float v_grey;
    varying vec4 v_random;
    const float depth = 1.0;
    float scale = max(600.0, u_resolution.x / 2.0);
    vec3 torus_knot(float p, float q, float divide) {
        float dt = a_random.w + 0.5;
        vec3 pos = vec3(0.0, 0.0, 0.0);
        pos.x += sin((a_index + (dt * u_time)) * p + u_time * 1.0 + u_plus);
        pos.y += cos((a_index + (dt * u_time)) * p + u_time * 1.0 + u_plus);
        pos.x += (0.5 - a_random.x) / divide;
        pos.y += (0.5 - a_random.y) / divide;
        pos.z = sin((a_index + (dt * u_time)) * q);
        pos.z += (0.5 - a_random.z) / divide;
        return pos;
    }

    const float pi = 3.14159265;
    void main() {
        float transition = 1.0 - (cos(u_transition * pi) + 1.0) / 2.0;
        vec3 pos;
        pos += torus_knot(u_divide.x, u_divide.y, 1.0 + abs(transition - 0.5) * 14.0) * transition;
        if(transition < 1.0) {
            pos += torus_knot(u_divide_transition.x, u_divide_transition.y, 1.0 + abs(transition - 0.5) * 14.0) * (1.0 - transition);
        }
        gl_PointSize = (0.8 - pos.z * 0.5) * scale / 600.0;
        v_grey = 1.0 - pos.z * 0.25;
        v_random = a_random;
        pos.z += 3.0;
        gl_Position = vec4(pos.x / (pos.z / depth) / u_resolution.x * scale, pos.y / (pos.z / depth) / u_resolution.y * scale, 0.0, 1.0);
    }
    `

    const fsSource = `
    precision lowp float;
    varying float v_grey;
    varying vec4 v_random;
    void main() {
        gl_FragColor = vec4(v_random.x * v_grey * 0.3, v_random.y * v_grey * 0.2, v_random.z * v_grey * 0.3, 1.0);
    }
    
    `
    const loadShader = (gl, type, src) => {

        const shader = gl.createShader(type)
        gl.shaderSource(shader, src)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw gl.getShaderInfoLog(shader)
        }

        return shader
    }

    const vertexCount = 10000

    const indexBuffer = new Float32Array(vertexCount)
    const randomBuffer = new Float32Array(vertexCount * 4)

    for(let n = 0; n < indexBuffer.length; n++) {
        indexBuffer[n] = n
        randomBuffer[n * 4] = Math.random()
        randomBuffer[n * 4 + 1] = Math.random()
        randomBuffer[n * 4 + 2] = Math.random()
        randomBuffer[n * 4 + 3] = Math.random()
    }

    let attribLocations, uniformLocations

    const initWebGl = (previousContext) => {
        img.innerHTML = ''

        preElement = document.createElement('pre')
        preElement.classList.add('header-pre')
        img.appendChild(preElement)

        canvas = document.createElement('canvas')
        canvas.classList.add('header-canvas')
        img.appendChild(canvas)

        const gl = previousContext ?? canvas.getContext('webgl')
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

        const program = gl.createProgram()
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw gl.getProgramInfoLog(program)
        }

        gl.useProgram(program)


        attribLocations = [
            gl.getAttribLocation(program, 'a_index'),
            gl.getAttribLocation(program, 'a_random')
        ]
        uniformLocations = [
            gl.getUniformLocation(program, 'u_time'),
            gl.getUniformLocation(program, 'u_resolution'),
            gl.getUniformLocation(program, 'u_divide'),
            gl.getUniformLocation(program, 'u_divide_transition'),
            gl.getUniformLocation(program, 'u_transition'),
            gl.getUniformLocation(program, 'u_plus'),
        ]

        const indexGLBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, indexGLBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW)
        gl.vertexAttribPointer(attribLocations[0], 1, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(attribLocations[0])

        const randomGLBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, randomGLBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, randomBuffer, gl.STATIC_DRAW)
        gl.vertexAttribPointer(attribLocations[1], 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(attribLocations[1])
        gl.clearColor(0.9, 0.9, 0.9, 1.0)

        return gl
    }

    let gl = initWebGl()

    function loop(f) {
        const pr = canvas.parentElement.getBoundingClientRect()
        canvas.width = pr.width
        canvas.height = Math.max(pr.bottom, 0)
        top = Math.min(pr.height, pr.height - pr.bottom)
        canvas.parentElement.style.paddingTop = top + 'px'
        if(canvas.height > 1 && canvas.width > 1) {

            preElement.textContent = `P=${actual[0]}\nQ=${actual[1]}\nf=${f}\ncx=${cx}\ncy=${cy}`

            if(gl.isContextLost()) {
                gl = initWebGl()
            }

            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.viewport(0, 0, canvas.width, canvas.height)


            gl.uniform1f(uniformLocations[0], f / 5000)
            gl.uniform2f(uniformLocations[1], canvas.width, canvas.height)
            gl.uniform2f(uniformLocations[2], actual[0], actual[1])
            gl.uniform2f(uniformLocations[3], before[0], before[1])
            gl.uniform1f(uniformLocations[4], shapeTransition)
            gl.uniform1f(uniformLocations[5], plus)
            if(shapeTransition < 1) {
                shapeTransition += 0.05;
            } else {
                shapeTransition = 1;
            }
            gl.drawArrays(gl.POINTS, 0, vertexCount)            
        }

        requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
}