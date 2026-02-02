
const calculateSessionCost = (startTime, endTime, hourlyRate) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);
    return Number((durationHours * hourlyRate).toFixed(2));
};

const calculateRemainingHours = (totalHours, usedHours) => {
    return Number((totalHours - usedHours).toFixed(2));
};

const calculateTotalTransaction = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

describe('Calculations Tests', () => {
    test('calculateSessionCost should calculate correct cost based on duration', () => {
        const start = '2023-01-01T10:00:00';
        const end = '2023-01-01T12:30:00'; // 2.5 hours
        const rate = 10;
        const cost = calculateSessionCost(start, end, rate);
        expect(cost).toBe(25.00);
    });

    test('calculateRemainingHours should return correct remaining balance', () => {
        const total = 100;
        const used = 25.5;
        const remaining = calculateRemainingHours(total, used);
        expect(remaining).toBe(74.50);
    });

    test('calculateTotalTransaction should sum up items correctly', () => {
        const items = [
            { price: 10, quantity: 2 }, // 20
            { price: 5, quantity: 1 }   // 5
        ];
        const total = calculateTotalTransaction(items);
        expect(total).toBe(25);
    });
});
