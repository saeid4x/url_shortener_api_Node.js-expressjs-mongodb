const { ApiError } = require('../../src/utils/ApiError'); // Adjust the path if you renamed the file

// 'describe' is used to group related tests together into a suite
describe('ApiError Utility', () => {

    // Test case 1: Testing a typical 'fail' scenario (4xx status code)
    it('should correctly create a 404 error object', () => {
        // 1. Create an instance of our error class
        const statusCode = 404;
        const message = 'Not Found';
        const error = new ApiError(statusCode, message);

        // 2. Assert (check) that its properties are correct
        expect(error).toBeInstanceOf(ApiError); // It should be an instance of ApiError
        expect(error).toBeInstanceOf(Error);    // It should also be an instance of the base Error class

        expect(error.statusCode).toBe(statusCode);
        expect(error.message).toBe(message);
        expect(error.status).toBe('fail'); // 4xx codes should result in 'fail'
        expect(error.isOperational).toBe(true);
    });

    // Test case 2: Testing a typical 'error' scenario (5xx status code)
    it('should correctly create a 500 error object', () => {
        // 1. Create an instance of our error class
        const statusCode = 500;
        const message = 'Internal Server Error';
        const error = new ApiError(statusCode, message);

        // 2. Assert that its properties are correct
        expect(error.statusCode).toBe(statusCode);
        expect(error.message).toBe(message);
        expect(error.status).toBe('error'); // 5xx codes should result in 'error'
        expect(error.isOperational).toBe(true);
    });

    // Test case 3: Checking the error stack trace
    it('should have a stack trace', () => {
        const error = new ApiError(400, 'Bad Request');

        // The stack trace is a string that should contain the name of the file where the error was created
        expect(typeof error.stack).toBe('string');
        expect(error.stack).toContain('ApiError.test.js');
    });
});