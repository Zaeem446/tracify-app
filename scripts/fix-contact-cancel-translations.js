const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'public', 'translations');

// Contact and Cancel page translations for the 8 languages that need fixing
const translations = {
    de: {
        contact: {
            title: "Kontakt",
            subtitle: "Unser Support-Team ist 24/7 für Sie da.",
            cardTitle: "Wir sind für Sie da",
            cardSubtitle: "Unser Support-Team ist 24/7 für Sie da.",
            form: {
                name: "Name",
                namePlaceholder: "Ihr Name",
                email: "E-Mail",
                emailPlaceholder: "ihre.email@beispiel.com",
                subject: "Betreff",
                selectSubject: "Betreff auswählen",
                technical: "Technischer Support",
                billing: "Rechnungsfrage",
                feature: "Funktionsanfrage",
                feedback: "Allgemeines Feedback",
                other: "Sonstiges",
                message: "Nachricht",
                messagePlaceholder: "Teilen Sie uns mit, wie wir helfen können...",
                notRobot: "Ich bin kein Roboter",
                send: "Nachricht senden"
            },
            footer: { home: "Startseite" }
        },
        cancel: {
            title: "Abonnement kündigen",
            subtitle: "Geben Sie Ihre E-Mail ein, um Ihr Abonnement zu kündigen. Dies deaktiviert die automatische Verlängerung.",
            form: {
                emailLabel: "E-Mail-Adresse",
                emailPlaceholder: "hallo@email.com",
                submitBtn: "Abonnement kündigen",
                helpText: "Falls Sie sich nicht erinnern, welche E-Mail Sie verwendet haben, überprüfen Sie Ihren Posteingang nach einer Willkommens-E-Mail von Tracify.",
                contactSupport: "Support kontaktieren"
            },
            whyCharged: { title: "Warum wurde ich belastet?" },
            needHelp: {
                title: "Brauchen Sie Hilfe?",
                description: "Bei Problemen oder Fragen ist unser Support-Team 24/7 für Sie da.",
                contactBtn: "Support kontaktieren"
            }
        }
    },
    el: {
        contact: {
            title: "Επικοινωνία",
            subtitle: "Η ομάδα υποστήριξής μας είναι εδώ 24/7 για να σας βοηθήσει.",
            cardTitle: "Είμαστε εδώ για εσάς",
            cardSubtitle: "Η ομάδα υποστήριξής μας είναι εδώ 24/7 για να σας βοηθήσει.",
            form: {
                name: "Όνομα",
                namePlaceholder: "Το όνομά σας",
                email: "Email",
                emailPlaceholder: "to.email@sas.com",
                subject: "Θέμα",
                selectSubject: "Επιλέξτε θέμα",
                technical: "Τεχνική Υποστήριξη",
                billing: "Ερώτηση Χρέωσης",
                feature: "Αίτημα Λειτουργίας",
                feedback: "Γενικά Σχόλια",
                other: "Άλλο",
                message: "Μήνυμα",
                messagePlaceholder: "Πείτε μας πώς μπορούμε να βοηθήσουμε...",
                notRobot: "Δεν είμαι ρομπότ",
                send: "Αποστολή Μηνύματος"
            },
            footer: { home: "Αρχική" }
        },
        cancel: {
            title: "Ακύρωση Συνδρομής",
            subtitle: "Εισάγετε το email σας για να ακυρώσετε τη συνδρομή σας.",
            form: {
                emailLabel: "Διεύθυνση Email",
                emailPlaceholder: "hello@email.com",
                submitBtn: "Ακύρωση Συνδρομής",
                helpText: "Αν δεν θυμάστε ποιο email χρησιμοποιήσατε, ελέγξτε τα εισερχόμενά σας για ένα email καλωσορίσματος από το Tracify.",
                contactSupport: "επικοινωνήστε με την υποστήριξη"
            },
            whyCharged: { title: "Γιατί χρεώθηκα;" },
            needHelp: {
                title: "Χρειάζεστε βοήθεια;",
                description: "Αν αντιμετωπίζετε πρόβλημα, η ομάδα υποστήριξής μας είναι εδώ 24/7.",
                contactBtn: "Επικοινωνία με Υποστήριξη"
            }
        }
    },
    id: {
        contact: {
            title: "Hubungi Kami",
            subtitle: "Tim dukungan kami siap 24/7 untuk membantu Anda.",
            cardTitle: "Kami Siap Membantu",
            cardSubtitle: "Tim dukungan kami siap 24/7 untuk membantu Anda.",
            form: {
                name: "Nama",
                namePlaceholder: "Nama Anda",
                email: "Email",
                emailPlaceholder: "email.anda@contoh.com",
                subject: "Subjek",
                selectSubject: "Pilih subjek",
                technical: "Dukungan Teknis",
                billing: "Pertanyaan Tagihan",
                feature: "Permintaan Fitur",
                feedback: "Umpan Balik Umum",
                other: "Lainnya",
                message: "Pesan",
                messagePlaceholder: "Ceritakan bagaimana kami dapat membantu...",
                notRobot: "Saya bukan robot",
                send: "Kirim Pesan"
            },
            footer: { home: "Beranda" }
        },
        cancel: {
            title: "Batalkan Langganan Anda",
            subtitle: "Masukkan email Anda untuk membatalkan langganan.",
            form: {
                emailLabel: "Alamat Email",
                emailPlaceholder: "halo@email.com",
                submitBtn: "Batalkan Langganan",
                helpText: "Jika Anda tidak ingat email mana yang digunakan, periksa kotak masuk Anda untuk email selamat datang dari Tracify.",
                contactSupport: "hubungi dukungan"
            },
            whyCharged: { title: "Mengapa saya ditagih?" },
            needHelp: {
                title: "Butuh bantuan?",
                description: "Jika Anda mengalami masalah, tim dukungan kami siap 24/7.",
                contactBtn: "Hubungi Dukungan"
            }
        }
    },
    sv: {
        contact: {
            title: "Kontakta oss",
            subtitle: "Vårt supportteam finns här dygnet runt för att hjälpa dig.",
            cardTitle: "Vi finns här för dig",
            cardSubtitle: "Vårt supportteam finns här dygnet runt för att hjälpa dig.",
            form: {
                name: "Namn",
                namePlaceholder: "Ditt namn",
                email: "E-post",
                emailPlaceholder: "din.email@exempel.com",
                subject: "Ämne",
                selectSubject: "Välj ett ämne",
                technical: "Teknisk support",
                billing: "Faktureringsfråga",
                feature: "Funktionsförfrågan",
                feedback: "Allmän feedback",
                other: "Övrigt",
                message: "Meddelande",
                messagePlaceholder: "Berätta hur vi kan hjälpa...",
                notRobot: "Jag är inte en robot",
                send: "Skicka meddelande"
            },
            footer: { home: "Hem" }
        },
        cancel: {
            title: "Avsluta din prenumeration",
            subtitle: "Ange din e-post för att avsluta din prenumeration.",
            form: {
                emailLabel: "E-postadress",
                emailPlaceholder: "hej@email.com",
                submitBtn: "Avsluta prenumeration",
                helpText: "Om du inte kommer ihåg vilken e-post du använde, kontrollera din inkorg efter ett välkomstmail från Tracify.",
                contactSupport: "kontakta support"
            },
            whyCharged: { title: "Varför debiterades jag?" },
            needHelp: {
                title: "Behöver du hjälp?",
                description: "Om du har problem finns vårt supportteam här dygnet runt.",
                contactBtn: "Kontakta support"
            }
        }
    },
    th: {
        contact: {
            title: "ติดต่อเรา",
            subtitle: "ทีมสนับสนุนของเราพร้อมให้บริการตลอด 24 ชั่วโมง",
            cardTitle: "เราพร้อมช่วยเหลือคุณ",
            cardSubtitle: "ทีมสนับสนุนของเราพร้อมให้บริการตลอด 24 ชั่วโมง",
            form: {
                name: "ชื่อ",
                namePlaceholder: "ชื่อของคุณ",
                email: "อีเมล",
                emailPlaceholder: "อีเมล@ตัวอย่าง.com",
                subject: "หัวข้อ",
                selectSubject: "เลือกหัวข้อ",
                technical: "การสนับสนุนทางเทคนิค",
                billing: "คำถามเกี่ยวกับการเรียกเก็บเงิน",
                feature: "คำขอฟีเจอร์",
                feedback: "ข้อเสนอแนะทั่วไป",
                other: "อื่นๆ",
                message: "ข้อความ",
                messagePlaceholder: "บอกเราว่าเราจะช่วยได้อย่างไร...",
                notRobot: "ฉันไม่ใช่หุ่นยนต์",
                send: "ส่งข้อความ"
            },
            footer: { home: "หน้าแรก" }
        },
        cancel: {
            title: "ยกเลิกการสมัครสมาชิก",
            subtitle: "กรอกอีเมลของคุณเพื่อยกเลิกการสมัครสมาชิก",
            form: {
                emailLabel: "ที่อยู่อีเมล",
                emailPlaceholder: "สวัสดี@email.com",
                submitBtn: "ยกเลิกการสมัครสมาชิก",
                helpText: "หากคุณจำไม่ได้ว่าใช้อีเมลใด ให้ตรวจสอบกล่องจดหมายเข้าสำหรับอีเมลต้อนรับจาก Tracify",
                contactSupport: "ติดต่อฝ่ายสนับสนุน"
            },
            whyCharged: { title: "ทำไมฉันถูกเรียกเก็บเงิน?" },
            needHelp: {
                title: "ต้องการความช่วยเหลือ?",
                description: "หากคุณประสบปัญหา ทีมสนับสนุนของเราพร้อมให้บริการตลอด 24 ชั่วโมง",
                contactBtn: "ติดต่อฝ่ายสนับสนุน"
            }
        }
    },
    tr: {
        contact: {
            title: "Bize Ulaşın",
            subtitle: "Destek ekibimiz size yardımcı olmak için 7/24 burada.",
            cardTitle: "Size Yardımcı Olmak İçin Buradayız",
            cardSubtitle: "Destek ekibimiz size yardımcı olmak için 7/24 burada.",
            form: {
                name: "Ad",
                namePlaceholder: "Adınız",
                email: "E-posta",
                emailPlaceholder: "email@ornek.com",
                subject: "Konu",
                selectSubject: "Bir konu seçin",
                technical: "Teknik Destek",
                billing: "Fatura Sorusu",
                feature: "Özellik Talebi",
                feedback: "Genel Geri Bildirim",
                other: "Diğer",
                message: "Mesaj",
                messagePlaceholder: "Size nasıl yardımcı olabileceğimizi anlatın...",
                notRobot: "Robot değilim",
                send: "Mesaj Gönder"
            },
            footer: { home: "Ana Sayfa" }
        },
        cancel: {
            title: "Aboneliğinizi İptal Edin",
            subtitle: "Aboneliğinizi iptal etmek için e-postanızı girin. Bu, otomatik yenilemeyi kapatacaktır.",
            form: {
                emailLabel: "E-posta Adresi",
                emailPlaceholder: "merhaba@email.com",
                submitBtn: "Aboneliği İptal Et",
                helpText: "Hangi e-postayı kullandığınızı hatırlamıyorsanız, gelen kutunuzu Tracify'dan gelen hoş geldiniz e-postası için kontrol edin.",
                contactSupport: "destek ile iletişime geçin"
            },
            whyCharged: { title: "Neden ücret alındı?" },
            needHelp: {
                title: "Yardıma mı ihtiyacınız var?",
                description: "Bir sorun yaşıyorsanız, destek ekibimiz 7/24 burada.",
                contactBtn: "Destek ile İletişime Geçin"
            }
        }
    },
    vi: {
        contact: {
            title: "Liên hệ với chúng tôi",
            subtitle: "Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7 để giúp bạn.",
            cardTitle: "Chúng tôi ở đây để giúp bạn",
            cardSubtitle: "Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7 để giúp bạn.",
            form: {
                name: "Tên",
                namePlaceholder: "Tên của bạn",
                email: "Email",
                emailPlaceholder: "email.cua.ban@vidu.com",
                subject: "Chủ đề",
                selectSubject: "Chọn chủ đề",
                technical: "Hỗ trợ kỹ thuật",
                billing: "Câu hỏi về thanh toán",
                feature: "Yêu cầu tính năng",
                feedback: "Phản hồi chung",
                other: "Khác",
                message: "Tin nhắn",
                messagePlaceholder: "Cho chúng tôi biết chúng tôi có thể giúp gì...",
                notRobot: "Tôi không phải robot",
                send: "Gửi tin nhắn"
            },
            footer: { home: "Trang chủ" }
        },
        cancel: {
            title: "Hủy đăng ký của bạn",
            subtitle: "Nhập email của bạn để hủy đăng ký.",
            form: {
                emailLabel: "Địa chỉ Email",
                emailPlaceholder: "xin.chao@email.com",
                submitBtn: "Hủy đăng ký",
                helpText: "Nếu bạn không nhớ đã sử dụng email nào, hãy kiểm tra hộp thư đến để tìm email chào mừng từ Tracify.",
                contactSupport: "liên hệ hỗ trợ"
            },
            whyCharged: { title: "Tại sao tôi bị tính phí?" },
            needHelp: {
                title: "Cần trợ giúp?",
                description: "Nếu bạn gặp sự cố, đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7.",
                contactBtn: "Liên hệ hỗ trợ"
            }
        }
    },
    "zh-TW": {
        contact: {
            title: "聯繫我們",
            subtitle: "我們的支援團隊全天候為您服務。",
            cardTitle: "我們隨時為您服務",
            cardSubtitle: "我們的支援團隊全天候為您服務。",
            form: {
                name: "姓名",
                namePlaceholder: "您的姓名",
                email: "電子郵件",
                emailPlaceholder: "您的郵件@範例.com",
                subject: "主題",
                selectSubject: "選擇主題",
                technical: "技術支援",
                billing: "帳單問題",
                feature: "功能請求",
                feedback: "一般反饋",
                other: "其他",
                message: "訊息",
                messagePlaceholder: "告訴我們如何幫助您...",
                notRobot: "我不是機器人",
                send: "發送訊息"
            },
            footer: { home: "首頁" }
        },
        cancel: {
            title: "取消訂閱",
            subtitle: "輸入您的電子郵件以取消訂閱。",
            form: {
                emailLabel: "電子郵件地址",
                emailPlaceholder: "你好@email.com",
                submitBtn: "取消訂閱",
                helpText: "如果您不記得使用了哪個電子郵件，請檢查收件箱中來自 Tracify 的歡迎郵件。",
                contactSupport: "聯繫客服"
            },
            whyCharged: { title: "為什麼我被收費？" },
            needHelp: {
                title: "需要幫助？",
                description: "如果您遇到問題，我們的支援團隊全天候為您服務。",
                contactBtn: "聯繫客服"
            }
        }
    }
};

// Process each language file that needs fixing
Object.keys(translations).forEach(lang => {
    const fileName = lang + '.json';
    const filePath = path.join(translationsDir, fileName);

    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${fileName}`);
        return;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Update contact section
    if (translations[lang].contact) {
        content.contact = translations[lang].contact;
    }

    // Update cancel section
    if (translations[lang].cancel) {
        content.cancel = translations[lang].cancel;
    }

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    console.log(`Updated ${fileName} with contact and cancel translations`);
});

console.log('\nDone! Fixed contact and cancel page translations.');
