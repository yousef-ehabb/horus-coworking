/**
 * دالة مساعدة لتنسيق الأرقام المالية كأعداد صحيحة
 * @param {number} value - القيمة المراد تنسيقها
 * @returns {string} - الرقم المنسق كعدد صحيح
 */
export const formatCurrency = (value) => {
    return Math.round(Number(value) || 0).toString();
};

/**
 * دالة مساعدة لتنسيق الساعات كأرقام صحيحة
 * @param {number} hours - عدد الساعات
 * @returns {string} - الساعات المنسقة
 */
export const formatHours = (hours) => {
    return Math.round(Number(hours) || 0).toString();
};

/**
 * حساب التكلفة المتوقعة للجلسة كعدد صحيح
 * @param {object} session - بيانات الجلسة
 * @returns {number} - التكلفة المتوقعة كعدد صحيح
 */
export const calculateExpectedCost = (session) => {
    const timeCost = ((Date.now() - new Date(session.start_time).getTime()) / 3600000) * session.hourly_rate;
    const beveragesCost = session.beverages_cost || 0;
    return Math.round(timeCost + beveragesCost);
};

/**
 * تحويل الساعات العشرية إلى نص (ساعات ودقائق)
 * @param {number} hours - عدد الساعات (عشري)
 * @returns {string} - الوقت بصيغة "س ساعة و د دقيقة"
 */
export const formatHoursToTime = (totalHours) => {
    if (!totalHours && totalHours !== 0) return '0 ساعة';
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    if (hours === 0) return `${minutes} دقيقة`;
    if (minutes === 0) return `${hours} ساعة`;
    return `${hours} ساعة و ${minutes} دقيقة`;
};

