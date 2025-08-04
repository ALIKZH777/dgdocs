# دستیار هوشمند قرارداد | Smart Contract Assistant

<div align="center">

![Contract Assistant](https://img.shields.io/badge/Version-2.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Persian](https://img.shields.io/badge/Language-Persian%20%28Farsi%29-red)
![Modern](https://img.shields.io/badge/Tech-Modern%20Web-purple)

**ابزار پیشرفته برای مدیریت و تولید خودکار قراردادها با قابلیت تشخیص هوشمند فیلدها**

*An advanced tool for automated contract management and generation with intelligent field detection*

[فارسی](#فارسی) | [English](#english)

</div>

---

## فارسی

### 📋 درباره پروژه

دستیار هوشمند قرارداد یک ابزار وب مدرن است که با استفاده از تکنولوژی‌های پیشرفته، فرآیند تولید و مدیریت قراردادها را خودکار می‌کند. این ابزار قابلیت تشخیص خودکار فیلدهای قرارداد، ویرایش انتخابی و تولید گروهی قراردادها را فراهم می‌کند.

### ✨ ویژگی‌های برجسته

- 🤖 **تشخیص هوشمند فیلدها**: تشخیص خودکار فیلدهای قرارداد از فایل‌های Word
- 🎯 **انتخاب انعطاف‌پذیر**: امکان انتخاب فیلدهای مورد نیاز برای ویرایش
- 🏭 **پردازش گروهی**: تولید چندین قرارداد به صورت همزمان
- 📁 **دانلود ZIP**: دریافت تمام قراردادها در یک فایل فشرده
- 🎨 **طراحی مدرن**: رابط کاربری زیبا و ریسپانسیو
- 🌙 **تم‌های متنوع**: پشتیبانی از تم روز، شب و خودکار
- 📱 **سازگاری موبایل**: بهینه‌سازی شده برای تمام دستگاه‌ها
- 🔒 **امنیت بالا**: پردازش محلی فایل‌ها بدون ارسال به سرور
- ✅ **اعتبارسنجی پیشرفته**: بررسی صحت اطلاعات وارد شده
- 📊 **آمار کاربری**: نمایش آمار استفاده و عملکرد

### 🛠️ تکنولوژی‌های استفاده شده

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Architecture**: Modular ES6 Modules
- **Libraries**: 
  - JSZip (پردازش فایل‌های Word)
  - FileSaver.js (دانلود فایل‌ها)
  - Font Awesome (آیکون‌ها)
  - Vazirmatn Font (فونت فارسی)
- **Features**: 
  - CSS Custom Properties
  - CSS Grid & Flexbox
  - Progressive Web App (PWA)
  - Local Storage
  - Intersection Observer API

### 🚀 نصب و راه‌اندازی

#### روش ۱: استفاده مستقیم

```bash
# کلون کردن پروژه
git clone https://github.com/your-username/contract-assistant.git

# ورود به پوشه پروژه
cd contract-assistant

# اجرا با سرور محلی (مثلاً با Python)
python -m http.server 8000

# یا با Node.js
npx serve .
```

#### روش ۲: استفاده از GitHub Pages

1. فایل‌ها را در مخزن GitHub خود قرار دهید
2. GitHub Pages را فعال کنید
3. به آدرس `https://your-username.github.io/contract-assistant` بروید

### 📖 راهنمای استفاده

#### مرحله ۱: آپلود فایل قرارداد

1. فایل قرارداد مرجع خود (.docx) را آپلود کنید
2. سیستم به طور خودکار فیلدهای موجود را تشخیص می‌دهد
3. نتایج تحلیل نمایش داده می‌شود

#### مرحله ۲: انتخاب فیلدها

1. فیلدهایی که می‌خواهید تغییر دهید را انتخاب کنید
2. فقط فیلدهای انتخاب شده در فرم نمایش داده می‌شوند

#### مرحله ۳: وارد کردن اطلاعات

1. اطلاعات جدید را در فرم وارد کنید
2. سیستم صحت اطلاعات را بررسی می‌کند
3. قرارداد را به صف اضافه کنید

#### مرحله ۴: تولید قراردادها

1. همه قراردادهای مورد نیاز را اضافه کنید
2. دکمه "ساخت همه قراردادها" را کلیک کنید
3. فایل ZIP شامل همه قراردادها دانلود می‌شود

### 🎯 فیلدهای پشتیبانی شده

- نام و نام خانوادگی مالک
- نام پدر
- کد ملی
- شماره شناسنامه
- شماره موبایل
- آدرس محل سکونت
- تاریخ شروع و پایان قرارداد
- مبلغ سفته/ضمانت

### 🔧 پیکربندی

#### تنظیمات فیلد جدید

برای اضافه کردن فیلد جدید، فایل `js/modules/fieldManager.js` را ویرایش کنید:

```javascript
fieldDefinitions: {
    new_field: {
        label: 'عنوان فیلد جدید',
        type: 'text',
        required: false,
        placeholder: 'متن راهنما',
        validation: {
            minLength: 2,
            maxLength: 50
        }
    }
}
```

#### تنظیمات الگوهای تشخیص

در فایل `js/modules/contractProcessor.js` الگوهای جدید اضافه کنید:

```javascript
patterns: [
    /الگوی جدید[:\s]*([^<\n\r]+)/i
]
```

### 📊 مدیریت آمار

سیستم به طور خودکار آمار استفاده را ردیابی می‌کند:

- تعداد فایل‌های آپلود شده
- تعداد قراردادهای ایجاد شده
- زمان پردازش
- فیلدهای پرکاربرد
- عملکرد سیستم

### 🎨 سفارشی‌سازی ظاهر

#### تغییر رنگ‌ها

در فایل `styles.css` متغیرهای CSS را تغییر دهید:

```css
:root {
    --primary-color: #1d3557;
    --secondary-color: #457b9d;
    --accent-color: #e63946;
}
```

#### اضافه کردن تم جدید

در فایل `js/modules/themeManager.js`:

```javascript
themes: {
    newTheme: {
        name: 'نام تم',
        icon: 'fas fa-icon',
        properties: {
            '--bg-primary': '#ffffff'
        }
    }
}
```

### 🔍 عیب‌یابی

#### مشکلات رایج:

1. **فایل آپلود نمی‌شود**
   - بررسی کنید فرمت فایل .docx باشد
   - حجم فایل کمتر از ۱۰ مگابایت باشد

2. **فیلدها تشخیص داده نمی‌شوند**
   - بررسی کنید فایل دارای جدول باشد
   - الگوهای تشخیص را بررسی کنید

3. **دانلود کار نمی‌کند**
   - مرورگر شما از FileSaver پشتیبانی می‌کند
   - پاپ‌آپ بلاکر غیرفعال باشد

### 🤝 مشارکت

برای مشارکت در پروژه:

1. پروژه را Fork کنید
2. شاخه جدید بسازید: `git checkout -b feature/new-feature`
3. تغییرات را commit کنید: `git commit -m 'Add new feature'`
4. به شاخه خود push کنید: `git push origin feature/new-feature`
5. Pull Request ایجاد کنید

### 📝 مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای جزئیات بیشتر فایل [LICENSE](LICENSE) را مطالعه کنید.

### 📞 تماس و پشتیبانی

- **Issues**: [GitHub Issues](https://github.com/your-username/contract-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/contract-assistant/discussions)

---

## English

### 📋 About the Project

Smart Contract Assistant is a modern web application that automates contract management and generation using advanced technologies. It provides intelligent field detection, selective editing, and batch contract generation capabilities.

### ✨ Key Features

- 🤖 **Intelligent Field Detection**: Automatic detection of contract fields from Word files
- 🎯 **Flexible Selection**: Choose specific fields for editing
- 🏭 **Batch Processing**: Generate multiple contracts simultaneously  
- 📁 **ZIP Download**: Download all contracts in a compressed file
- 🎨 **Modern Design**: Beautiful and responsive user interface
- 🌙 **Multiple Themes**: Support for light, dark, and auto themes
- 📱 **Mobile Compatibility**: Optimized for all devices
- 🔒 **High Security**: Local file processing without server uploads
- ✅ **Advanced Validation**: Input data verification
- 📊 **Usage Statistics**: Display usage and performance statistics

### 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Architecture**: Modular ES6 Modules
- **Libraries**: JSZip, FileSaver.js, Font Awesome, Vazirmatn Font
- **Features**: CSS Custom Properties, Grid & Flexbox, PWA, Local Storage

### 🚀 Installation & Setup

#### Method 1: Direct Usage

```bash
# Clone the project
git clone https://github.com/your-username/contract-assistant.git

# Navigate to project folder
cd contract-assistant

# Run with local server
python -m http.server 8000
# or with Node.js
npx serve .
```

#### Method 2: GitHub Pages

1. Upload files to your GitHub repository
2. Enable GitHub Pages
3. Visit `https://your-username.github.io/contract-assistant`

### 📖 Usage Guide

1. **Upload Contract File**: Upload your reference contract (.docx)
2. **Select Fields**: Choose fields you want to modify
3. **Enter Information**: Fill in new data in the form
4. **Generate Contracts**: Create and download all contracts as ZIP

### 🔧 Configuration

Add new fields in `js/modules/fieldManager.js`:

```javascript
fieldDefinitions: {
    new_field: {
        label: 'New Field Label',
        type: 'text',
        required: false,
        validation: { minLength: 2 }
    }
}
```

### 🤝 Contributing

1. Fork the project
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

### 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for Persian/Farsi speakers**

ساخته شده با ❤️ برای فارسی‌زبانان

</div>