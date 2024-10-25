const appError = (message, statusCode) => {
    let error = new Error(message);
    return error
}

export default appError