
import * as filters from '/js/filters.js';
import * as misc from '/js/miscelaneus.js';

window.onload = function () {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;

    const lienzo = document.getElementById('lienzo');
    const c1 = document.getElementById('c1');
    const c2 = document.getElementById('c2');
    const buttons = document.getElementById('tool-box').querySelectorAll("button");
    
    let drawing = false;
    let prevX = 0;
    let prevY = 0;
    let tool = 0;
    let mousePressedButton = -1;
    let wmoX = -1;
    let wmoY = -1;
    let mouseX, mouseY;

    // Prev canvas
    const pcanvas = document.getElementById('myCanvasprev');
    const ctxp = pcanvas.getContext('2d');

    // Secondary canvas
    const canvas2 = document.getElementById('canvasReal');
    const ctx2 = canvas2.getContext('2d');

    //Buttons
    buttons.forEach((button, i) => {
        button.addEventListener("click", () => {
            handleButtonClick(i);
        });
        //Erase All
        if (i === 1) {
            button.addEventListener("dblclick", () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });

        }
    });

    //Pencil size
    const cursorCover = document.getElementById('cursor-cover');
    const pencilSize = document.getElementById('pencil-size');
    let pencilSizeClicked = false;
    let pencilSizeValue = 1;
    pencilSize.addEventListener("mousedown", () => {
        pencilSizeClicked = true;
        cursorCover.style.display = "block";
        cursorCover.style.cursor = "e-resize"
    });

    document.addEventListener("mousemove", (event) => {
        if (pencilSizeClicked) {
            pencilSizeValue += event.movementX / 10
            pencilSizeValue = Math.max(1, Math.min(pencilSizeValue, 64))
            pencilSize.innerHTML = Math.floor(pencilSizeValue);
        }
    });

    document.addEventListener("mouseup", () => {
        pencilSizeClicked = false;
        cursorCover.style.display = "none";
        pencilSizeValue = Math.floor(pencilSizeValue)
        pencilSize.innerHTML = pencilSizeValue;
    });

    //Opacidad
    const iOpacity = document.getElementById("opacity")

    const opacityValue = document.getElementById("opacity-value")
    iOpacity.addEventListener("input", changeIOpacity)
    function changeIOpacity() {
        const value = parseFloat(iOpacity.value);
        opacityValue.innerHTML = value;
        iOpacity.hex = misc.intToHex(value);
    }
    changeIOpacity()


    document.addEventListener('mousedown', handleGlobalMouseDown);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleCanvasEnter);
    canvas.addEventListener('mouseleave', () => {
        ctxp.clearRect(0, 0, pcanvas.width, pcanvas.height);
    })
    document.addEventListener('wheel', handleCanvasWheel);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    function handleButtonClick(index) {
        switch (index) {
            case 6:
                resizeLienzo(canvas.width, canvas.height);
                break;
            case 7:
                resizeLienzo(-canvas.width, -canvas.height);
                break;
            case 8:
                swapColors();
                break;
            default:
                setTool(index);
                break;
        }
    }

    function handleMouseDown(e) {
        mousePressedButton = e.button;
        drawing = true;
        const { x, y } = getMousePos(canvas, e);
        prevX = Math.floor(x);
        prevY = Math.floor(y);
        switchTools(x, y, false, mousePressedButton);
    }

    function handleMouseMove(e) {
        const { x, y } = getMousePos(canvas, e);
        if (drawing) {
            switchTools(x, y, true, mousePressedButton);
            prevX = Math.floor(x);
            prevY = Math.floor(y);
        }
        if (tool == 0 || tool == 1) {
            ctxp.clearRect(0, 0, pcanvas.width, pcanvas.height);
            drawPixel(Math.floor(x), Math.floor(y), c1.value + "88", pencilSizeValue, ctxp, true)
        }
    }

    function handleMouseUp() {
        drawing = false;
        mousePressedButton = -1;
        wmoX = -1;
        wmoY = -1;
        cloneCanvas();
    }

    function handleCanvasEnter(e) {
        const { x, y } = getMousePos(canvas, e);
        prevX = Math.floor(x);
        prevY = Math.floor(y);
    }

    function handleCanvasWheel(event) {
        const direction = event.deltaY < 0 ? 1 : -1;
        const change = direction * canvas.width;
        resizeLienzo(change, change);
    }

    function handleGlobalMouseDown(e) {
        mousePressedButton = e.button;
    }

    function handleGlobalMouseMove(e) {
        mouseX = e.x;
        mouseY = e.y;
        if (mousePressedButton == 1) {
            handleCanvasMove();
        }
    }

    function handleContextMenu(event) {
        event.preventDefault();
    }

    function handleCanvasMove() {
        if (wmoX == -1 && wmoY == -1) {
            let l = lienzo.getBoundingClientRect();
            wmoX = Math.floor(mouseX) - Math.floor(l.x + l.width / 2);
            wmoY = Math.floor(mouseY) - Math.floor(l.y + l.height / 2);
        } else {
            lienzo.style.left = `${Math.floor(mouseX) - wmoX}px`;
            lienzo.style.top = `${Math.floor(mouseY) - wmoY}px`;
        }
    }

    //Obtiene la posicion del mouse en el canvas
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) * (canvas.width / rect.width),
            y: (evt.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    //Que hara el canvas dependiendo de la herramienta
    function switchTools(x, y, mm = false, pressedButton) {
        let selectedColor = "";
        const primaryColor = (c1.value + iOpacity.hex).toUpperCase();
        const secondaryColor = (c2.value + iOpacity.hex).toUpperCase();

        if (pressedButton === 0) {
            selectedColor = primaryColor.toUpperCase();
        } else if (pressedButton === 2) {
            selectedColor = secondaryColor.toUpperCase();
        }

        if (selectedColor != "") {
            switch (tool) {
                case 0:
                    mm ? lineAction(prevX, prevY, Math.floor(x), Math.floor(y), selectedColor, pencilSizeValue) : drawPixel(prevX, prevY, selectedColor, pencilSizeValue);
                    break;
                case 1:
                    mm ? lineAction(prevX, prevY, Math.floor(x), Math.floor(y), "#00000000", pencilSizeValue) : drawPixel(prevX, prevY, "#00000000", pencilSizeValue);
                    break;
                case 2:
                    drawFill(prevX, prevY, selectedColor);
                    break;
                case 3:
                    const col = getPixelColor(prevX, prevY);
                    if (pressedButton === 0 && col != primaryColor) {
                        c1.value = col.slice(0, 7);
                        console.log("A");
                    } else if (pressedButton === 2 && col != secondaryColor) {
                        c2.value = col.slice(0, 7);
                        console.log("B");
                    }
                    iOpacity.value = misc.hexToInt(col.slice(7, 9));
                    changeIOpacity();
                    break;
            }
        }
    }

    //Dibuja un pixel dependiendo del tamaño
    function drawPixel(x, y, col, size, context = ctx, outline = false) {
        context.fillStyle = col;
        if (size > 1) {
            const radius = size / 2;
            const centerX = Math.floor(x);
            const centerY = Math.floor(y);

            const isEven = size % 2 === 0;
            const offset = isEven ? 0.5 : 0;

            for (let i = Math.max(centerX - Math.floor(radius), 0); i <= Math.min(centerX + Math.floor(radius) + (isEven ? 0 : 1), canvas.width - 1); i++) {
                for (let j = Math.max(centerY - Math.floor(radius), 0); j <= Math.min(centerY + Math.floor(radius) + (isEven ? 0 : 1), canvas.height - 1); j++) {
                    const dx = i - centerX + offset;
                    const dy = j - centerY + offset;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if ((outline && distance >= radius - 1 && distance <= radius) || (!outline && distance <= radius)) {
                        context.clearRect(i, j, 1, 1);
                        context.fillRect(i, j, 1, 1);
                    }
                }
            }
        } else {
            context.clearRect(x, y, 1, 1);
            context.fillRect(x, y, 1, 1);
        }
    }

    //Dibuja el trayecto de 2 puntos
    function lineAction(x1, y1, x2, y2, col, size) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;
        while (Math.floor(x1) !== Math.floor(x2) || Math.floor(y1) !== Math.floor(y2)) {
            drawPixel(x1, y1, col, size);
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
        drawPixel(x2, y2, col, size);
    }

    //Funcion de rellenado del canvas
    function drawFill(x, y, targetColor, context) {
        const startColor = getPixelColor(x, y);
        if (startColor === targetColor) return;
        const queue = [{ x, y }];

        while (queue.length > 0) {
            const { x, y } = queue.shift();
            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
            const currentColor = getPixelColor(x, y);
            if (currentColor !== startColor) continue;
            drawPixel(x, y, targetColor, 1, context);

            queue.push({ x: x + 1, y });
            queue.push({ x: x - 1, y });
            queue.push({ x, y: y + 1 });
            queue.push({ x, y: y - 1 });
        }

        // Vaciar la cola después de usarla
        queue.length = 0;
    }

    //Obtiene el color del pixel del canvas
    function getPixelColor(x, y) {
        const imageData = ctx.getImageData(x, y, 1, 1);
        const data = imageData.data;
        return `#${misc.intToHex(data[0])}${misc.intToHex(data[1])}${misc.intToHex(data[2])}${misc.intToHex(data[3])}`;
    }

    //Muestra como se veria el dibujo en tamaño real
    function cloneCanvas() {
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        ctx2.drawImage(canvas, 0, 0);
    }

    //Zoom
    function resizeLienzo(changeW, changeH) {
        const { width: lienzoSizeW, height: lienzoSizeH } = lienzo.getBoundingClientRect();
        const newWidth = lienzoSizeW - 2 + changeW;
        const newHeight = lienzoSizeH - 2 + changeH;
        lienzo.style.width = `${Math.max(canvas.width, Math.min(newWidth, canvas.width * 50))}px`;
        lienzo.style.height = `${Math.max(canvas.height, Math.min(newHeight, canvas.height * 50))}px`;
    }

    //Rotar c1 y c2
    function swapColors() {
        let caux = c1.value;
        c1.value = c2.value;
        c2.value = caux;
    }

    let options = document.getElementById("options");

    //Setea la herramienta y las opciones disponibles de esta
    function setTool(index) {
        tool = index;
        buttons.forEach((auxButton, j) => {
            auxButton.style.backgroundColor = j === tool ? "lightgray" : "";
        });
        let divOption = options.querySelectorAll("div");
        switch (tool) {
            case 0:
                divOption[0].classList.remove("hidden");
                divOption[0].querySelector("div>span").innerHTML = "Pencil Size";
                options.style.borderBottom = "1px solid lightgray";//TEMP
                break;
            case 1:
                divOption[0].classList.remove("hidden");
                divOption[0].querySelector("div>span").innerHTML = "Eraser Size";
                options.style.borderBottom = "1px solid lightgray";//TEMP
                break;

            default:
                divOption[0].classList.add("hidden");
                options.style.borderBottom = "0";//TEMP
                break;
        }
    }

    //GRID
    const gridSwitch = document.getElementById("grid-switch");
    const grid = document.getElementById("grid");
    gridSwitch.addEventListener("click", gridSwitchf);

    function gridSwitchf() {
        grid.classList.toggle("hidden");
        gridSwitch.classList.toggle("selected");
    }
    //KEYS

    let keyupdetect = key();
    lienzo.addEventListener("mouseenter", () => {
        document.addEventListener("keydown", keyupdetect);
    });

    lienzo.addEventListener("mouseleave", () => {
        document.removeEventListener("keydown", keyupdetect);
    });

    function key() {
        return (evento) => {
            evento.preventDefault();

            switch (evento.key) {
                case "p":
                    handleButtonClick(0);
                    break;
                case "e":
                    handleButtonClick(1);
                    break;
                case "f":
                    handleButtonClick(2);
                    break;
                case "q":
                    handleButtonClick(3);
                    ctxp.clearRect(0, 0, pcanvas.width, pcanvas.height);
                    break;
                case "t":
                    handleButtonClick(4);
                    ctxp.clearRect(0, 0, pcanvas.width, pcanvas.height);
                    break;
                case "i":
                    handleButtonClick(5);
                    break;
                case "+":
                    handleButtonClick(6);
                    ctxp.clearRect(0, 0, pcanvas.width, pcanvas.height);
                    break;
                case "-":
                    handleButtonClick(7);
                    ctxp.clearRect(0, 0, pcanvas.width, pcanvas.height);
                    break;
                case "c":
                    handleButtonClick(8);
                    break;
                case "<":
                    pencilSizeValue--;
                    pencilSizeValue = Math.max(1, Math.min(pencilSizeValue, 100));
                    pencilSize.innerHTML = Math.floor(pencilSizeValue);
                    handleMouseMove({ clientX: mouseX, clientY: mouseY });
                    break;
                case ">":
                    pencilSizeValue++;
                    pencilSizeValue = Math.max(1, Math.min(pencilSizeValue, 100));
                    pencilSize.innerHTML = Math.floor(pencilSizeValue);
                    handleMouseMove({ clientX: mouseX, clientY: mouseY });
                    break;
                case "r":
                    c1.value = misc.getRandomColor();
                    c2.value = misc.getRandomColor();
                    break;
                default:
                    break;
            }
        };
    }

    const btnFilters = document.querySelectorAll('#filters button');

    btnFilters[0].addEventListener("click", () => {
        filters.blackAndWhite(canvas);
        cloneCanvas();
    });
    btnFilters[1].addEventListener("click", () => {
        filters.sepia(canvas);
        cloneCanvas();
    });
    btnFilters[2].addEventListener("click", () => {
        filters.invertColors(canvas);
        cloneCanvas();
    });
    btnFilters[3].addEventListener("click", () => {
        filters.simpleBlur(canvas);
        cloneCanvas();
    });
    btnFilters[4].addEventListener("click", () => {
        filters.blackAndWhite(canvas);
        cloneCanvas();
    });

};

