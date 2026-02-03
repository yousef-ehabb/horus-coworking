/**
 * Helper functions للعمليات الحسابية لضمان الدقة ومنع الأرقام العشرية
 */

/**
 * تقريب الرقم لأقرب عدد صحيح
 * @param {number} value - القيمة المراد تقريبها
 * @returns {number} - العدد الصحيح
 */
function roundToInteger(value) {
    return Math.round(value);
}

/**
 * حساب السعر الإجمالي وتقريبه لعدد صحيح
 * @param {number} unitPrice - سعر الوحدة
 * @param {number} quantity - الكمية
 * @returns {number} - السعر الإجمالي كعدد صحيح
 */
function calculateTotal(unitPrice, quantity) {
    return roundToInteger(unitPrice * quantity);
}

/**
 * حساب تكلفة الساعات وتقريبها لعدد صحيح
 * @param {number} hours - عدد الساعات
 * @param {number} hourlyRate - السعر بالساعة
 * @returns {number} - التكلفة الإجمالية كعدد صحيح
 */
function calculateHoursCost(hours, hourlyRate) {
    return roundToInteger(hours * hourlyRate);
}

module.exports = {
    roundToInteger,
    calculateTotal,
    calculateHoursCost
};
