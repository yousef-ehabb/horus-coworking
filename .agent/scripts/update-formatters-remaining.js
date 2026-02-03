/**
 * سكريبت لتحديث جميع ملفات العرض لاستخدام formatCurrency
 * 
 * الملفات المتبقية التي تحتاج تحديث:
 * - InvoiceDialog.jsx
 * - PackagesPage.jsx  
 * - CustomersPage.jsx
 * - AccountingPage.jsx
 */

// قائمة بالملفات والتغييرات المطلوبة
const filesToUpdate = {
    'InvoiceDialog.jsx': {
        imports: "import { formatCurrency } from '../../utils/formatters';",
        replacements: [
            { find: 'session.total_hours?.toFixed(2)', replace: 'Math.round(session.total_hours)' },
            { find: 'session.hours_cost?.toFixed(2)', replace: 'formatCurrency(session.hours_cost)' },
            { find: 'session.total_cost?.toFixed(2)', replace: 'formatCurrency(session.total_cost)' }
        ]
    },
    'PackagesPage.jsx': {
        imports: "import { formatCurrency } from '../../utils/formatters';",
        replacements: [
            { find: '(pkg.price / pkg.total_hours).toFixed(2)', replace: 'formatCurrency(pkg.price / pkg.total_hours)' },
            { find: 'cp.remaining_hours.toFixed(2)', replace: 'Math.round(cp.remaining_hours)' }
        ]
    },
    'CustomersPage.jsx': {
        imports: "import { formatCurrency } from '../../utils/formatters';",
        replacements: [
            { find: 'customer.total_hours_used?.toFixed(2)', replace: 'Math.round(customer.total_hours_used)' },
            { find: 'customer.total_amount_paid?.toFixed(2)', replace: 'formatCurrency(customer.total_amount_paid)' }
        ]
    }
};

console.log('التعديلات المطلوبة على الملفات المتبقية موثقة في هذا الملف.');
console.log('يرجى تطبيق التغييرات يدوياً أو استخدام أداة التحديث المناسبة.');
