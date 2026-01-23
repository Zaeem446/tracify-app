const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'public', 'translations');

// Modal translations for remaining languages
const modalTranslations = {
    // Bulgarian
    bg: {
        signup: {
            title: "Въведете вашия имейл",
            subtitle: "Ще изпратим паролата за акаунта ви на този имейл адрес.",
            agreeText: "Съгласявам се да получавам промоционални имейли и актуализации от Tracify",
            continueBtn: "Продължи",
            termsText: "Продължавайки, вие се съгласявате с нашите",
            termsLink: "Условия за ползване",
            and: "и",
            privacyLink: "Политика за поверителност",
            or: "или",
            hasAccount: "Вече имате акаунт?",
            loginLink: "Влезте",
            creatingAccount: "Създаване на акаунт...",
            accountCreated: "Акаунтът е създаден!",
            yourPassword: "Вашата парола:",
            savePassword: "Запазете тази парола! Пренасочване към плащане..."
        },
        login: {
            title: "Добре дошли отново",
            subtitle: "Влезте в акаунта си в Tracify",
            passwordPlaceholder: "Парола",
            loginBtn: "Влезте",
            loggingIn: "Влизане...",
            loginSuccess: "Успешно влизане! Пренасочване...",
            or: "или",
            noAccount: "Нямате акаунт?",
            signupLink: "Регистрирайте се"
        },
        errors: {
            connectionError: "Грешка при връзката. Моля, опитайте отново.",
            accountCreationFailed: "Неуспешно създаване на акаунт",
            loginFailed: "Неуспешно влизане"
        }
    },
    // Bengali
    bn: {
        signup: {
            title: "আপনার ইমেল লিখুন",
            subtitle: "আমরা আপনার অ্যাকাউন্টের পাসওয়ার্ড এই ইমেল ঠিকানায় পাঠাব।",
            agreeText: "আমি Tracify থেকে প্রচারমূলক ইমেল এবং আপডেট পেতে সম্মত",
            continueBtn: "চালিয়ে যান",
            termsText: "চালিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের সাথে সম্মত হচ্ছেন",
            termsLink: "পরিষেবার শর্তাবলী",
            and: "এবং",
            privacyLink: "গোপনীয়তা নীতি",
            or: "অথবা",
            hasAccount: "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
            loginLink: "লগ ইন করুন",
            creatingAccount: "অ্যাকাউন্ট তৈরি হচ্ছে...",
            accountCreated: "অ্যাকাউন্ট তৈরি হয়েছে!",
            yourPassword: "আপনার পাসওয়ার্ড:",
            savePassword: "এই পাসওয়ার্ড সংরক্ষণ করুন! পেমেন্টে পুনঃনির্দেশিত হচ্ছে..."
        },
        login: {
            title: "আবার স্বাগতম",
            subtitle: "আপনার Tracify অ্যাকাউন্টে লগ ইন করুন",
            passwordPlaceholder: "পাসওয়ার্ড",
            loginBtn: "লগ ইন",
            loggingIn: "লগ ইন হচ্ছে...",
            loginSuccess: "লগ ইন সফল! পুনঃনির্দেশিত হচ্ছে...",
            or: "অথবা",
            noAccount: "অ্যাকাউন্ট নেই?",
            signupLink: "সাইন আপ করুন"
        },
        errors: {
            connectionError: "সংযোগ ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।",
            accountCreationFailed: "অ্যাকাউন্ট তৈরি ব্যর্থ",
            loginFailed: "লগ ইন ব্যর্থ"
        }
    },
    // Bosnian
    bs: {
        signup: {
            title: "Unesite vašu email adresu",
            subtitle: "Poslat ćemo lozinku vašeg računa na ovu email adresu.",
            agreeText: "Slažem se da primam promotivne emailove i ažuriranja od Tracify",
            continueBtn: "Nastavi",
            termsText: "Nastavljanjem se slažete s našim",
            termsLink: "Uvjetima korištenja",
            and: "i",
            privacyLink: "Politikom privatnosti",
            or: "ili",
            hasAccount: "Već imate račun?",
            loginLink: "Prijavite se",
            creatingAccount: "Kreiranje računa...",
            accountCreated: "Račun kreiran!",
            yourPassword: "Vaša lozinka:",
            savePassword: "Sačuvajte ovu lozinku! Preusmjeravanje na plaćanje..."
        },
        login: {
            title: "Dobrodošli nazad",
            subtitle: "Prijavite se na svoj Tracify račun",
            passwordPlaceholder: "Lozinka",
            loginBtn: "Prijava",
            loggingIn: "Prijavljivanje...",
            loginSuccess: "Prijava uspješna! Preusmjeravanje...",
            or: "ili",
            noAccount: "Nemate račun?",
            signupLink: "Registrujte se"
        },
        errors: {
            connectionError: "Greška u povezivanju. Molimo pokušajte ponovo.",
            accountCreationFailed: "Kreiranje računa nije uspjelo",
            loginFailed: "Prijava nije uspjela"
        }
    },
    // Czech
    cs: {
        signup: {
            title: "Zadejte svůj email",
            subtitle: "Heslo k účtu vám zašleme na tuto emailovou adresu.",
            agreeText: "Souhlasím se zasíláním propagačních emailů a aktualizací od Tracify",
            continueBtn: "Pokračovat",
            termsText: "Pokračováním souhlasíte s našimi",
            termsLink: "Podmínkami služby",
            and: "a",
            privacyLink: "Zásadami ochrany osobních údajů",
            or: "nebo",
            hasAccount: "Již máte účet?",
            loginLink: "Přihlásit se",
            creatingAccount: "Vytváření účtu...",
            accountCreated: "Účet vytvořen!",
            yourPassword: "Vaše heslo:",
            savePassword: "Uložte si toto heslo! Přesměrování na platbu..."
        },
        login: {
            title: "Vítejte zpět",
            subtitle: "Přihlaste se ke svému účtu Tracify",
            passwordPlaceholder: "Heslo",
            loginBtn: "Přihlásit",
            loggingIn: "Přihlašování...",
            loginSuccess: "Přihlášení úspěšné! Přesměrování...",
            or: "nebo",
            noAccount: "Nemáte účet?",
            signupLink: "Zaregistrovat se"
        },
        errors: {
            connectionError: "Chyba připojení. Zkuste to prosím znovu.",
            accountCreationFailed: "Vytvoření účtu selhalo",
            loginFailed: "Přihlášení selhalo"
        }
    },
    // Greek
    el: {
        signup: {
            title: "Εισάγετε το email σας",
            subtitle: "Θα στείλουμε τον κωδικό του λογαριασμού σας σε αυτή τη διεύθυνση email.",
            agreeText: "Συμφωνώ να λαμβάνω προωθητικά email και ενημερώσεις από το Tracify",
            continueBtn: "Συνέχεια",
            termsText: "Συνεχίζοντας, συμφωνείτε με τους",
            termsLink: "Όρους Χρήσης",
            and: "και",
            privacyLink: "Πολιτική Απορρήτου",
            or: "ή",
            hasAccount: "Έχετε ήδη λογαριασμό;",
            loginLink: "Σύνδεση",
            creatingAccount: "Δημιουργία λογαριασμού...",
            accountCreated: "Ο λογαριασμός δημιουργήθηκε!",
            yourPassword: "Ο κωδικός σας:",
            savePassword: "Αποθηκεύστε αυτόν τον κωδικό! Ανακατεύθυνση στην πληρωμή..."
        },
        login: {
            title: "Καλώς ήρθατε πίσω",
            subtitle: "Συνδεθείτε στον λογαριασμό σας Tracify",
            passwordPlaceholder: "Κωδικός",
            loginBtn: "Σύνδεση",
            loggingIn: "Σύνδεση...",
            loginSuccess: "Επιτυχής σύνδεση! Ανακατεύθυνση...",
            or: "ή",
            noAccount: "Δεν έχετε λογαριασμό;",
            signupLink: "Εγγραφή"
        },
        errors: {
            connectionError: "Σφάλμα σύνδεσης. Παρακαλώ δοκιμάστε ξανά.",
            accountCreationFailed: "Η δημιουργία λογαριασμού απέτυχε",
            loginFailed: "Η σύνδεση απέτυχε"
        }
    },
    // Estonian
    et: {
        signup: {
            title: "Sisestage oma e-post",
            subtitle: "Saadame teie konto parooli sellele e-posti aadressile.",
            agreeText: "Nõustun saama Tracify reklaamkirju ja uudiseid",
            continueBtn: "Jätka",
            termsText: "Jätkates nõustute meie",
            termsLink: "Teenuse tingimustega",
            and: "ja",
            privacyLink: "Privaatsuspoliitikaga",
            or: "või",
            hasAccount: "Kas teil on juba konto?",
            loginLink: "Logi sisse",
            creatingAccount: "Konto loomine...",
            accountCreated: "Konto loodud!",
            yourPassword: "Teie parool:",
            savePassword: "Salvestage see parool! Suunamine maksele..."
        },
        login: {
            title: "Tere tulemast tagasi",
            subtitle: "Logige sisse oma Tracify kontole",
            passwordPlaceholder: "Parool",
            loginBtn: "Logi sisse",
            loggingIn: "Sisselogimine...",
            loginSuccess: "Sisselogimine õnnestus! Suunamine...",
            or: "või",
            noAccount: "Pole kontot?",
            signupLink: "Registreeru"
        },
        errors: {
            connectionError: "Ühenduse viga. Palun proovige uuesti.",
            accountCreationFailed: "Konto loomine ebaõnnestus",
            loginFailed: "Sisselogimine ebaõnnestus"
        }
    },
    // Filipino
    fil: {
        signup: {
            title: "Ilagay ang iyong email",
            subtitle: "Ipapadala namin ang password ng iyong account sa email address na ito.",
            agreeText: "Sumasang-ayon akong tumanggap ng mga promotional na email at update mula sa Tracify",
            continueBtn: "Magpatuloy",
            termsText: "Sa pagpapatuloy, sumasang-ayon ka sa aming",
            termsLink: "Mga Tuntunin ng Serbisyo",
            and: "at",
            privacyLink: "Patakaran sa Privacy",
            or: "o",
            hasAccount: "May account ka na?",
            loginLink: "Mag-log in",
            creatingAccount: "Gumagawa ng account...",
            accountCreated: "Nagawa na ang account!",
            yourPassword: "Ang iyong password:",
            savePassword: "I-save ang password na ito! Nire-redirect sa pagbabayad..."
        },
        login: {
            title: "Maligayang pagbabalik",
            subtitle: "Mag-log in sa iyong Tracify account",
            passwordPlaceholder: "Password",
            loginBtn: "Mag-log in",
            loggingIn: "Nagla-log in...",
            loginSuccess: "Matagumpay na naka-log in! Nire-redirect...",
            or: "o",
            noAccount: "Wala pang account?",
            signupLink: "Mag-sign up"
        },
        errors: {
            connectionError: "Error sa koneksyon. Pakisubukang muli.",
            accountCreationFailed: "Hindi nagawa ang account",
            loginFailed: "Hindi makapag-log in"
        }
    },
    // Croatian
    hr: {
        signup: {
            title: "Unesite svoj email",
            subtitle: "Poslat ćemo lozinku vašeg računa na ovu email adresu.",
            agreeText: "Slažem se primati promotivne emailove i ažuriranja od Tracify",
            continueBtn: "Nastavi",
            termsText: "Nastavkom se slažete s našim",
            termsLink: "Uvjetima korištenja",
            and: "i",
            privacyLink: "Pravilima o privatnosti",
            or: "ili",
            hasAccount: "Već imate račun?",
            loginLink: "Prijavite se",
            creatingAccount: "Stvaranje računa...",
            accountCreated: "Račun stvoren!",
            yourPassword: "Vaša lozinka:",
            savePassword: "Spremite ovu lozinku! Preusmjeravanje na plaćanje..."
        },
        login: {
            title: "Dobrodošli natrag",
            subtitle: "Prijavite se na svoj Tracify račun",
            passwordPlaceholder: "Lozinka",
            loginBtn: "Prijava",
            loggingIn: "Prijava...",
            loginSuccess: "Prijava uspješna! Preusmjeravanje...",
            or: "ili",
            noAccount: "Nemate račun?",
            signupLink: "Registrirajte se"
        },
        errors: {
            connectionError: "Greška veze. Molimo pokušajte ponovno.",
            accountCreationFailed: "Stvaranje računa nije uspjelo",
            loginFailed: "Prijava nije uspjela"
        }
    },
    // Hungarian
    hu: {
        signup: {
            title: "Adja meg email címét",
            subtitle: "A fiók jelszavát erre az email címre küldjük.",
            agreeText: "Hozzájárulok, hogy promóciós emaileket és frissítéseket kapjak a Tracify-tól",
            continueBtn: "Folytatás",
            termsText: "A folytatással elfogadja a",
            termsLink: "Szolgáltatási feltételeket",
            and: "és",
            privacyLink: "Adatvédelmi irányelveket",
            or: "vagy",
            hasAccount: "Már van fiókja?",
            loginLink: "Bejelentkezés",
            creatingAccount: "Fiók létrehozása...",
            accountCreated: "Fiók létrehozva!",
            yourPassword: "Az Ön jelszava:",
            savePassword: "Mentse el ezt a jelszót! Átirányítás a fizetéshez..."
        },
        login: {
            title: "Üdvözöljük újra",
            subtitle: "Jelentkezzen be Tracify fiókjába",
            passwordPlaceholder: "Jelszó",
            loginBtn: "Bejelentkezés",
            loggingIn: "Bejelentkezés...",
            loginSuccess: "Sikeres bejelentkezés! Átirányítás...",
            or: "vagy",
            noAccount: "Nincs fiókja?",
            signupLink: "Regisztráció"
        },
        errors: {
            connectionError: "Kapcsolati hiba. Kérjük, próbálja újra.",
            accountCreationFailed: "Fiók létrehozása sikertelen",
            loginFailed: "Bejelentkezés sikertelen"
        }
    },
    // Indonesian
    id: {
        signup: {
            title: "Masukkan email Anda",
            subtitle: "Kami akan mengirimkan kata sandi akun Anda ke alamat email ini.",
            agreeText: "Saya setuju untuk menerima email promosi dan pembaruan dari Tracify",
            continueBtn: "Lanjutkan",
            termsText: "Dengan melanjutkan, Anda menyetujui",
            termsLink: "Ketentuan Layanan",
            and: "dan",
            privacyLink: "Kebijakan Privasi",
            or: "atau",
            hasAccount: "Sudah punya akun?",
            loginLink: "Masuk",
            creatingAccount: "Membuat akun...",
            accountCreated: "Akun dibuat!",
            yourPassword: "Kata sandi Anda:",
            savePassword: "Simpan kata sandi ini! Mengalihkan ke pembayaran..."
        },
        login: {
            title: "Selamat datang kembali",
            subtitle: "Masuk ke akun Tracify Anda",
            passwordPlaceholder: "Kata sandi",
            loginBtn: "Masuk",
            loggingIn: "Sedang masuk...",
            loginSuccess: "Berhasil masuk! Mengalihkan...",
            or: "atau",
            noAccount: "Belum punya akun?",
            signupLink: "Daftar"
        },
        errors: {
            connectionError: "Kesalahan koneksi. Silakan coba lagi.",
            accountCreationFailed: "Gagal membuat akun",
            loginFailed: "Gagal masuk"
        }
    },
    // Lithuanian
    lt: {
        signup: {
            title: "Įveskite savo el. paštą",
            subtitle: "Atsiųsime jūsų paskyros slaptažodį šiuo el. pašto adresu.",
            agreeText: "Sutinku gauti reklaminius el. laiškus ir naujienas iš Tracify",
            continueBtn: "Tęsti",
            termsText: "Tęsdami sutinkate su mūsų",
            termsLink: "Paslaugų teikimo sąlygomis",
            and: "ir",
            privacyLink: "Privatumo politika",
            or: "arba",
            hasAccount: "Jau turite paskyrą?",
            loginLink: "Prisijungti",
            creatingAccount: "Kuriama paskyra...",
            accountCreated: "Paskyra sukurta!",
            yourPassword: "Jūsų slaptažodis:",
            savePassword: "Išsaugokite šį slaptažodį! Nukreipiama į mokėjimą..."
        },
        login: {
            title: "Sveiki sugrįžę",
            subtitle: "Prisijunkite prie savo Tracify paskyros",
            passwordPlaceholder: "Slaptažodis",
            loginBtn: "Prisijungti",
            loggingIn: "Jungiamasi...",
            loginSuccess: "Prisijungimas sėkmingas! Nukreipiama...",
            or: "arba",
            noAccount: "Neturite paskyros?",
            signupLink: "Registruotis"
        },
        errors: {
            connectionError: "Ryšio klaida. Bandykite dar kartą.",
            accountCreationFailed: "Nepavyko sukurti paskyros",
            loginFailed: "Prisijungimas nepavyko"
        }
    },
    // Latvian
    lv: {
        signup: {
            title: "Ievadiet savu e-pastu",
            subtitle: "Mēs nosūtīsim jūsu konta paroli uz šo e-pasta adresi.",
            agreeText: "Es piekrītu saņemt reklāmas e-pastus un jaunumus no Tracify",
            continueBtn: "Turpināt",
            termsText: "Turpinot, jūs piekrītat mūsu",
            termsLink: "Pakalpojumu noteikumiem",
            and: "un",
            privacyLink: "Privātuma politikai",
            or: "vai",
            hasAccount: "Jau ir konts?",
            loginLink: "Pieteikties",
            creatingAccount: "Konta izveide...",
            accountCreated: "Konts izveidots!",
            yourPassword: "Jūsu parole:",
            savePassword: "Saglabājiet šo paroli! Novirzīšana uz maksājumu..."
        },
        login: {
            title: "Laipni lūdzam atpakaļ",
            subtitle: "Piesakieties savā Tracify kontā",
            passwordPlaceholder: "Parole",
            loginBtn: "Pieteikties",
            loggingIn: "Notiek pieteikšanās...",
            loginSuccess: "Pieteikšanās veiksmīga! Novirzīšana...",
            or: "vai",
            noAccount: "Nav konta?",
            signupLink: "Reģistrēties"
        },
        errors: {
            connectionError: "Savienojuma kļūda. Lūdzu, mēģiniet vēlreiz.",
            accountCreationFailed: "Konta izveide neizdevās",
            loginFailed: "Pieteikšanās neizdevās"
        }
    },
    // Malay
    ms: {
        signup: {
            title: "Masukkan e-mel anda",
            subtitle: "Kami akan menghantar kata laluan akaun anda ke alamat e-mel ini.",
            agreeText: "Saya bersetuju untuk menerima e-mel promosi dan kemas kini daripada Tracify",
            continueBtn: "Teruskan",
            termsText: "Dengan meneruskan, anda bersetuju dengan",
            termsLink: "Syarat Perkhidmatan",
            and: "dan",
            privacyLink: "Dasar Privasi",
            or: "atau",
            hasAccount: "Sudah mempunyai akaun?",
            loginLink: "Log masuk",
            creatingAccount: "Mencipta akaun...",
            accountCreated: "Akaun dicipta!",
            yourPassword: "Kata laluan anda:",
            savePassword: "Simpan kata laluan ini! Mengalihkan ke pembayaran..."
        },
        login: {
            title: "Selamat kembali",
            subtitle: "Log masuk ke akaun Tracify anda",
            passwordPlaceholder: "Kata laluan",
            loginBtn: "Log masuk",
            loggingIn: "Sedang log masuk...",
            loginSuccess: "Log masuk berjaya! Mengalihkan...",
            or: "atau",
            noAccount: "Tiada akaun?",
            signupLink: "Daftar"
        },
        errors: {
            connectionError: "Ralat sambungan. Sila cuba lagi.",
            accountCreationFailed: "Gagal mencipta akaun",
            loginFailed: "Gagal log masuk"
        }
    },
    // Romanian
    ro: {
        signup: {
            title: "Introduceți email-ul dvs.",
            subtitle: "Vom trimite parola contului dvs. la această adresă de email.",
            agreeText: "Sunt de acord să primesc email-uri promoționale și actualizări de la Tracify",
            continueBtn: "Continuă",
            termsText: "Continuând, sunteți de acord cu",
            termsLink: "Termenii și Condițiile",
            and: "și",
            privacyLink: "Politica de Confidențialitate",
            or: "sau",
            hasAccount: "Aveți deja un cont?",
            loginLink: "Conectați-vă",
            creatingAccount: "Se creează contul...",
            accountCreated: "Cont creat!",
            yourPassword: "Parola dvs.:",
            savePassword: "Salvați această parolă! Redirecționare către plată..."
        },
        login: {
            title: "Bine ați revenit",
            subtitle: "Conectați-vă la contul Tracify",
            passwordPlaceholder: "Parolă",
            loginBtn: "Conectare",
            loggingIn: "Se conectează...",
            loginSuccess: "Conectare reușită! Redirecționare...",
            or: "sau",
            noAccount: "Nu aveți cont?",
            signupLink: "Înregistrați-vă"
        },
        errors: {
            connectionError: "Eroare de conexiune. Vă rugăm să încercați din nou.",
            accountCreationFailed: "Crearea contului a eșuat",
            loginFailed: "Conectarea a eșuat"
        }
    },
    // Slovak
    sk: {
        signup: {
            title: "Zadajte svoj email",
            subtitle: "Heslo k účtu vám pošleme na túto emailovú adresu.",
            agreeText: "Súhlasím so zasielaním propagačných emailov a aktualizácií od Tracify",
            continueBtn: "Pokračovať",
            termsText: "Pokračovaním súhlasíte s našimi",
            termsLink: "Podmienkami služby",
            and: "a",
            privacyLink: "Zásadami ochrany osobných údajov",
            or: "alebo",
            hasAccount: "Už máte účet?",
            loginLink: "Prihlásiť sa",
            creatingAccount: "Vytvára sa účet...",
            accountCreated: "Účet vytvorený!",
            yourPassword: "Vaše heslo:",
            savePassword: "Uložte si toto heslo! Presmerovanie na platbu..."
        },
        login: {
            title: "Vitajte späť",
            subtitle: "Prihláste sa do svojho účtu Tracify",
            passwordPlaceholder: "Heslo",
            loginBtn: "Prihlásiť",
            loggingIn: "Prihlasovanie...",
            loginSuccess: "Prihlásenie úspešné! Presmerovanie...",
            or: "alebo",
            noAccount: "Nemáte účet?",
            signupLink: "Zaregistrovať sa"
        },
        errors: {
            connectionError: "Chyba pripojenia. Skúste to prosím znova.",
            accountCreationFailed: "Vytvorenie účtu zlyhalo",
            loginFailed: "Prihlásenie zlyhalo"
        }
    },
    // Slovenian
    sl: {
        signup: {
            title: "Vnesite svoj e-poštni naslov",
            subtitle: "Geslo za vaš račun bomo poslali na ta e-poštni naslov.",
            agreeText: "Strinjam se s prejemanjem promocijskih e-poštnih sporočil in posodobitev od Tracify",
            continueBtn: "Nadaljuj",
            termsText: "Z nadaljevanjem se strinjate z našimi",
            termsLink: "Pogoji uporabe",
            and: "in",
            privacyLink: "Pravilnikom o zasebnosti",
            or: "ali",
            hasAccount: "Že imate račun?",
            loginLink: "Prijavite se",
            creatingAccount: "Ustvarjanje računa...",
            accountCreated: "Račun ustvarjen!",
            yourPassword: "Vaše geslo:",
            savePassword: "Shranite to geslo! Preusmerjanje na plačilo..."
        },
        login: {
            title: "Dobrodošli nazaj",
            subtitle: "Prijavite se v svoj račun Tracify",
            passwordPlaceholder: "Geslo",
            loginBtn: "Prijava",
            loggingIn: "Prijavljanje...",
            loginSuccess: "Prijava uspešna! Preusmerjanje...",
            or: "ali",
            noAccount: "Nimate računa?",
            signupLink: "Registrirajte se"
        },
        errors: {
            connectionError: "Napaka povezave. Poskusite znova.",
            accountCreationFailed: "Ustvarjanje računa ni uspelo",
            loginFailed: "Prijava ni uspela"
        }
    },
    // Serbian
    sr: {
        signup: {
            title: "Унесите свој имејл",
            subtitle: "Послаћемо лозинку вашег налога на ову имејл адресу.",
            agreeText: "Слажем се да примам промотивне имејлове и ажурирања од Tracify",
            continueBtn: "Настави",
            termsText: "Настављањем се слажете са нашим",
            termsLink: "Условима коришћења",
            and: "и",
            privacyLink: "Политиком приватности",
            or: "или",
            hasAccount: "Већ имате налог?",
            loginLink: "Пријавите се",
            creatingAccount: "Креирање налога...",
            accountCreated: "Налог креиран!",
            yourPassword: "Ваша лозинка:",
            savePassword: "Сачувајте ову лозинку! Преусмеравање на плаћање..."
        },
        login: {
            title: "Добродошли назад",
            subtitle: "Пријавите се на свој Tracify налог",
            passwordPlaceholder: "Лозинка",
            loginBtn: "Пријава",
            loggingIn: "Пријављивање...",
            loginSuccess: "Пријава успешна! Преусмеравање...",
            or: "или",
            noAccount: "Немате налог?",
            signupLink: "Региструјте се"
        },
        errors: {
            connectionError: "Грешка у повезивању. Молимо покушајте поново.",
            accountCreationFailed: "Креирање налога није успело",
            loginFailed: "Пријава није успела"
        }
    },
    // Thai
    th: {
        signup: {
            title: "กรอกอีเมลของคุณ",
            subtitle: "เราจะส่งรหัสผ่านบัญชีของคุณไปยังอีเมลนี้",
            agreeText: "ฉันยินยอมรับอีเมลโปรโมชั่นและอัปเดตจาก Tracify",
            continueBtn: "ดำเนินการต่อ",
            termsText: "เมื่อดำเนินการต่อ คุณยอมรับ",
            termsLink: "ข้อกำหนดการให้บริการ",
            and: "และ",
            privacyLink: "นโยบายความเป็นส่วนตัว",
            or: "หรือ",
            hasAccount: "มีบัญชีอยู่แล้ว?",
            loginLink: "เข้าสู่ระบบ",
            creatingAccount: "กำลังสร้างบัญชี...",
            accountCreated: "สร้างบัญชีแล้ว!",
            yourPassword: "รหัสผ่านของคุณ:",
            savePassword: "บันทึกรหัสผ่านนี้! กำลังเปลี่ยนเส้นทางไปยังการชำระเงิน..."
        },
        login: {
            title: "ยินดีต้อนรับกลับ",
            subtitle: "เข้าสู่ระบบบัญชี Tracify ของคุณ",
            passwordPlaceholder: "รหัสผ่าน",
            loginBtn: "เข้าสู่ระบบ",
            loggingIn: "กำลังเข้าสู่ระบบ...",
            loginSuccess: "เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนเส้นทาง...",
            or: "หรือ",
            noAccount: "ยังไม่มีบัญชี?",
            signupLink: "สมัครสมาชิก"
        },
        errors: {
            connectionError: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
            accountCreationFailed: "สร้างบัญชีไม่สำเร็จ",
            loginFailed: "เข้าสู่ระบบไม่สำเร็จ"
        }
    },
    // Turkmen
    tk: {
        signup: {
            title: "E-poçtaňyzy giriziň",
            subtitle: "Hasabyňyzyň parolyny bu e-poçta salgysyna ibereris.",
            agreeText: "Tracify-dan mahabat e-poçtalaryny we täzelikleri almaga razylaşýaryn",
            continueBtn: "Dowam et",
            termsText: "Dowam etmek bilen, biziň",
            termsLink: "Hyzmat şertleri",
            and: "we",
            privacyLink: "Gizlinlik syýasaty",
            or: "ýa-da",
            hasAccount: "Eýýäm hasabyňyz barmy?",
            loginLink: "Giriň",
            creatingAccount: "Hasap döredilýär...",
            accountCreated: "Hasap döredildi!",
            yourPassword: "Siziň parolyňyz:",
            savePassword: "Bu paroly ýatda saklaň! Töleg sahypasyna geçirilýär..."
        },
        login: {
            title: "Hoş geldiňiz",
            subtitle: "Tracify hasabyňyza giriň",
            passwordPlaceholder: "Parol",
            loginBtn: "Giriş",
            loggingIn: "Girilýär...",
            loginSuccess: "Giriş üstünlikli! Geçirilýär...",
            or: "ýa-da",
            noAccount: "Hasabyňyz ýokmy?",
            signupLink: "Hasap açyň"
        },
        errors: {
            connectionError: "Baglanyşyk ýalňyşlygy. Täzeden synanyşyň.",
            accountCreationFailed: "Hasap döredilmedi",
            loginFailed: "Giriş şowsuz"
        }
    },
    // Ukrainian
    uk: {
        signup: {
            title: "Введіть вашу електронну пошту",
            subtitle: "Ми надішлемо пароль вашого облікового запису на цю адресу.",
            agreeText: "Я погоджуюсь отримувати рекламні листи та оновлення від Tracify",
            continueBtn: "Продовжити",
            termsText: "Продовжуючи, ви погоджуєтесь з нашими",
            termsLink: "Умовами використання",
            and: "та",
            privacyLink: "Політикою конфіденційності",
            or: "або",
            hasAccount: "Вже маєте обліковий запис?",
            loginLink: "Увійти",
            creatingAccount: "Створення облікового запису...",
            accountCreated: "Обліковий запис створено!",
            yourPassword: "Ваш пароль:",
            savePassword: "Збережіть цей пароль! Перенаправлення на оплату..."
        },
        login: {
            title: "З поверненням",
            subtitle: "Увійдіть до свого облікового запису Tracify",
            passwordPlaceholder: "Пароль",
            loginBtn: "Увійти",
            loggingIn: "Вхід...",
            loginSuccess: "Вхід успішний! Перенаправлення...",
            or: "або",
            noAccount: "Немає облікового запису?",
            signupLink: "Зареєструватися"
        },
        errors: {
            connectionError: "Помилка з'єднання. Будь ласка, спробуйте ще раз.",
            accountCreationFailed: "Не вдалося створити обліковий запис",
            loginFailed: "Не вдалося увійти"
        }
    },
    // Vietnamese
    vi: {
        signup: {
            title: "Nhập email của bạn",
            subtitle: "Chúng tôi sẽ gửi mật khẩu tài khoản đến địa chỉ email này.",
            agreeText: "Tôi đồng ý nhận email khuyến mãi và cập nhật từ Tracify",
            continueBtn: "Tiếp tục",
            termsText: "Bằng cách tiếp tục, bạn đồng ý với",
            termsLink: "Điều khoản Dịch vụ",
            and: "và",
            privacyLink: "Chính sách Bảo mật",
            or: "hoặc",
            hasAccount: "Đã có tài khoản?",
            loginLink: "Đăng nhập",
            creatingAccount: "Đang tạo tài khoản...",
            accountCreated: "Tài khoản đã được tạo!",
            yourPassword: "Mật khẩu của bạn:",
            savePassword: "Lưu mật khẩu này! Đang chuyển hướng đến thanh toán..."
        },
        login: {
            title: "Chào mừng trở lại",
            subtitle: "Đăng nhập vào tài khoản Tracify của bạn",
            passwordPlaceholder: "Mật khẩu",
            loginBtn: "Đăng nhập",
            loggingIn: "Đang đăng nhập...",
            loginSuccess: "Đăng nhập thành công! Đang chuyển hướng...",
            or: "hoặc",
            noAccount: "Chưa có tài khoản?",
            signupLink: "Đăng ký"
        },
        errors: {
            connectionError: "Lỗi kết nối. Vui lòng thử lại.",
            accountCreationFailed: "Không thể tạo tài khoản",
            loginFailed: "Đăng nhập thất bại"
        }
    },
    // Zulu
    zu: {
        signup: {
            title: "Faka i-imeyili yakho",
            subtitle: "Sizothumela iphasiwedi ye-akhawunti yakho kule kheli le-imeyili.",
            agreeText: "Ngiyavuma ukuthola ama-imeyili okukhangisa nezibuyekezo ezivela ku-Tracify",
            continueBtn: "Qhubeka",
            termsText: "Ngokuqhubeka, uyavuma",
            termsLink: "Imigomo Yenkonzo",
            and: "kanye",
            privacyLink: "Inqubomgomo Yobumfihlo",
            or: "noma",
            hasAccount: "Usunayo i-akhawunti?",
            loginLink: "Ngena ngemvume",
            creatingAccount: "Kwenziwa i-akhawunti...",
            accountCreated: "I-akhawunti yenziwe!",
            yourPassword: "Iphasiwedi yakho:",
            savePassword: "Londoloza le phasiwedi! Kuyiswa ekukhokheni..."
        },
        login: {
            title: "Siyakwamukela futhi",
            subtitle: "Ngena ngemvume ku-akhawunti yakho ye-Tracify",
            passwordPlaceholder: "Iphasiwedi",
            loginBtn: "Ngena ngemvume",
            loggingIn: "Kuyangena...",
            loginSuccess: "Ukungena kuphumelele! Kuyiswa...",
            or: "noma",
            noAccount: "Awunayo i-akhawunti?",
            signupLink: "Bhalisa"
        },
        errors: {
            connectionError: "Iphutha lokuxhumana. Sicela uzame futhi.",
            accountCreationFailed: "Ukwenza i-akhawunti kuhlulekile",
            loginFailed: "Ukungena kuhlulekile"
        }
    }
};

// Common fields that stay the same
const commonFields = {
    emailPlaceholder: "your@email.com",
    agreeRequired: "*"
};

// Process each language file
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
    const lang = file.replace('.json', '');

    // Skip English
    if (lang === 'en') return;

    // Only process files that need fixing
    if (!modalTranslations[lang]) {
        console.log(`Skipping ${file} - already has proper translations`);
        return;
    }

    const filePath = path.join(translationsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Update modal translations
    if (content.modal) {
        const trans = modalTranslations[lang];

        content.modal.signup = {
            ...content.modal.signup,
            title: trans.signup.title,
            subtitle: trans.signup.subtitle,
            emailPlaceholder: commonFields.emailPlaceholder,
            agreeText: trans.signup.agreeText,
            agreeRequired: commonFields.agreeRequired,
            continueBtn: trans.signup.continueBtn,
            termsText: trans.signup.termsText,
            termsLink: trans.signup.termsLink,
            and: trans.signup.and,
            privacyLink: trans.signup.privacyLink,
            or: trans.signup.or,
            hasAccount: trans.signup.hasAccount,
            loginLink: trans.signup.loginLink,
            creatingAccount: trans.signup.creatingAccount,
            accountCreated: trans.signup.accountCreated,
            yourPassword: trans.signup.yourPassword,
            savePassword: trans.signup.savePassword
        };

        content.modal.login = {
            ...content.modal.login,
            title: trans.login.title,
            subtitle: trans.login.subtitle,
            emailPlaceholder: commonFields.emailPlaceholder,
            passwordPlaceholder: trans.login.passwordPlaceholder,
            loginBtn: trans.login.loginBtn,
            loggingIn: trans.login.loggingIn,
            loginSuccess: trans.login.loginSuccess,
            or: trans.login.or,
            noAccount: trans.login.noAccount,
            signupLink: trans.login.signupLink
        };

        content.modal.errors = {
            connectionError: trans.errors.connectionError,
            accountCreationFailed: trans.errors.accountCreationFailed,
            loginFailed: trans.errors.loginFailed
        };
    }

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    console.log(`Updated ${file} with proper modal translations`);
});

console.log('\nDone! Fixed modal translations for remaining languages.');
