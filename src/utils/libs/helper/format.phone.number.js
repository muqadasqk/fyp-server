const formatPhoneNumber = (phoneNumber) => {
    return Number(String(phoneNumber).replace(/^(\+92|0)/, ""));
}

export default formatPhoneNumber;