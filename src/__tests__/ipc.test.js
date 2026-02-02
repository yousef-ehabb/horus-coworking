
// Mock database
const mockDb = {
    run: jest.fn(),
    all: jest.fn(),
    get: jest.fn()
};

describe('IPC Handlers Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Should query active sessions', async () => {
        const mockSessions = [{ id: 1, customer_name: 'Test' }];

        // Simulating the logic inside sessions.js ipc handler
        const getActiveSessions = () => {
            return new Promise((resolve) => {
                mockDb.all('SELECT * FROM sessions WHERE end_time IS NULL', (err, rows) => {
                    resolve(rows);
                });
            });
        };

        // Setup mock return
        mockDb.all.mockImplementation((query, callback) => {
            callback(null, mockSessions);
        });

        const result = await getActiveSessions();
        expect(result).toEqual(mockSessions);
        expect(mockDb.all).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM sessions'), expect.any(Function));
    });

    test('Should add beverage transaction logic', async () => {
        // Simulating logic for adding a beverage
        const addBeverage = (sessionId, amount) => {
            return new Promise((resolve) => {
                mockDb.run('INSERT INTO transactions (session_id, amount) VALUES (?, ?)', [sessionId, amount], function () {
                    resolve({ id: 1 });
                });
            });
        };

        mockDb.run.mockImplementation((query, params, callback) => {
            // Simulate "this.lastID" context if needed, or just callback
            callback.call({ lastID: 1 }, null);
        });

        const result = await addBeverage(123, 50);
        expect(result).toEqual({ id: 1 });
        expect(mockDb.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO transactions'),
            [123, 50],
            expect.any(Function)
        );
    });
});
