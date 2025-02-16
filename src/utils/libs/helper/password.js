import bcrypt from 'bcryptjs';

// method to compare password with hash
const verify = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}

// method to create hash of string
const createHash = async (password) => {
    return await bcrypt.hash(password, await bcrypt.genSalt());
}

// method to generate a rondom password; optionally shuffled string
const generateRandom = () => {
    const alphaChars = 'abcdefghijklmnopqrstuvwxyz';
    const upperAlphaChars = alphaChars.toUpperCase();
    const numChars = '1234567890';
    const specialChars = '@#$&';

    function getRandomChar(charSet) {
        return charSet.charAt(Math.floor(Math.random() * charSet.length));
    };

    return [
        getRandomChar(alphaChars),
        getRandomChar(upperAlphaChars),
        getRandomChar(numChars),
        getRandomChar(specialChars),
        ...Array(4).fill(0).map(() => getRandomChar(alphaChars + upperAlphaChars + numChars + specialChars)),
    ].join('');
}

export default { verify, createHash, generateRandom }