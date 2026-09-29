import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
const resources = {
  en: {
    translation: {
      "weather_advisory": "Weather & Crop Advisory",
      "temp": "Temp",
      "rainfall": "Rainfall",
      "humidity": "Humidity",
      "wind": "Wind",
      "soil_moisture": "Soil Moisture",
      "active_advisories": "Active Advisories",
      "7_day_trend": "7-Day Trend",
      "action_required": "ACTION REQUIRED:",
      "valid": "Valid:",
      "risk": "RISK"
    }
  },
  hi: {
    translation: {
      "weather_advisory": "मौसम और फसल सलाह",
      "temp": "तापमान",
      "rainfall": "वर्षा",
      "humidity": "नमी",
      "wind": "हवा",
      "soil_moisture": "मिट्टी की नमी",
      "active_advisories": "सक्रिय सलाह",
      "7_day_trend": "7-दिन का रुझान",
      "action_required": "आवश्यक कार्रवाई:",
      "valid": "मान्य:",
      "risk": "जोखिम"
    }
  },
  mr: {
    translation: {
      "weather_advisory": "हवामान आणि पीक सल्ला",
      "temp": "तापमान",
      "rainfall": "पाऊस",
      "humidity": "आर्द्रता",
      "wind": "वारा",
      "soil_moisture": "मातीतील ओलावा",
      "active_advisories": "सक्रिय सल्ले",
      "7_day_trend": "7-दिवसांचा कल",
      "action_required": "आवश्यक कृती:",
      "valid": "वैध:",
      "risk": "धोका"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
