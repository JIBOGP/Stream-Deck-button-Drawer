//Miscelaneo

//Random Color
export function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//Entero a hexagecimal
export function intToHex(intValue) {
    let hexString = intValue.toString(16);
    if (hexString.length < 2) {
        hexString = '0' + hexString;
    }
    return hexString.toUpperCase();
}

//Hexagecimal a entero
export function hexToInt(hexString) {
    if (hexString.startsWith('0x') || hexString.startsWith('0X')) {
        hexString = hexString.slice(2);
    }
    return parseInt(hexString, 16);
}
