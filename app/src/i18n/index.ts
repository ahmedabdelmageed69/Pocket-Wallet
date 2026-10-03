import { getLocales } from "expo-localization";
import { I18nManager } from "react-native";
import { create } from "zustand";

const en = {
  appName: "Pocket Wallet",
  loginSubtitle: "Log in to your wallet",
  email: "Email",
  password: "Password",
  passwordHint: "Password (8+ characters)",
  fullName: "Full name",
  login: "Log in",
  signup: "Sign up",
  noAccount: "No account? Sign up",
  haveAccount: "Have an account? Log in",
  createAccount: "Create account",
  hi: "Hi",
  balance: "Balance",
  topUpCard: "Top up with card",
  recent: "Recent activity",
  empty: "No transactions yet.",
  logout: "Log out",
  wallet: "Wallet",
  send: "Send",
  history: "History",
  recipient: "Recipient email",
  amount: "Amount (e.g. 25.00)",
  sendMoney: "Send money",
  confirmTransfer: "Confirm transfer",
  sent: "Sent",
  to: "to",
  topUp: "Top up",
  testCard: "Test card: 4242 4242 4242 4242, any future date, any CVC.",
  pay: "Pay",
  cancel: "Cancel",
  TOPUP: "Card top-up",
  TRANSFER_IN: "Received from",
  TRANSFER_OUT: "Sent to",
  language: "العربية",
};

const ar: typeof en = {
  appName: "محفظة الجيب",
  loginSubtitle: "سجّل الدخول إلى محفظتك",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  passwordHint: "كلمة المرور (8 أحرف على الأقل)",
  fullName: "الاسم الكامل",
  login: "تسجيل الدخول",
  signup: "إنشاء حساب",
  noAccount: "ليس لديك حساب؟ أنشئ حساباً",
  haveAccount: "لديك حساب؟ سجّل الدخول",
  createAccount: "إنشاء حساب",
  hi: "مرحباً",
  balance: "الرصيد",
  topUpCard: "شحن بالبطاقة",
  recent: "آخر العمليات",
  empty: "لا توجد عمليات بعد.",
  logout: "تسجيل الخروج",
  wallet: "المحفظة",
  send: "تحويل",
  history: "السجل",
  recipient: "بريد المستلم",
  amount: "المبلغ (مثال 25.00)",
  sendMoney: "إرسال المبلغ",
  confirmTransfer: "تأكيد التحويل",
  sent: "تم إرسال",
  to: "إلى",
  topUp: "شحن الرصيد",
  testCard: "بطاقة تجريبية: 4242 4242 4242 4242، أي تاريخ مستقبلي وأي CVC.",
  pay: "ادفع",
  cancel: "إلغاء",
  TOPUP: "شحن بالبطاقة",
  TRANSFER_IN: "مستلم من",
  TRANSFER_OUT: "مُرسل إلى",
  language: "English",
};

export type Lang = "en" | "ar";
const dicts = { en, ar };

const initial: Lang = getLocales()[0]?.languageCode === "ar" ? "ar" : "en";
I18nManager.allowRTL(true);

type I18nState = { lang: Lang; t: typeof en; isRTL: boolean; toggle: () => void };

export const useI18n = create<I18nState>((set, get) => ({
  lang: initial,
  t: dicts[initial],
  isRTL: initial === "ar",
  toggle: () => {
    const lang: Lang = get().lang === "en" ? "ar" : "en";
    // Layout direction is handled per-screen with `dir` styles so no app reload is needed.
    set({ lang, t: dicts[lang], isRTL: lang === "ar" });
  },
}));

/** Row/text alignment that follows the current language. */
export const useDir = () => {
  const isRTL = useI18n((s) => s.isRTL);
  return {
    isRTL,
    row: { flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse" },
    text: { textAlign: (isRTL ? "right" : "left") as "left" | "right", writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr" },
  };
};
