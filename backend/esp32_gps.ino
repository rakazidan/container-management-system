#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>

const char* ssid = "TOP";
const char* password = "kucinghitam1";

// IP komputer yang menjalankan backend (sama network dengan ESP32)
const char* backendURL = "http://192.168.1.9:8001/api/v1/gps";

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

#define LED_HIJAU 25
#define LED_MERAH 26

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);

  pinMode(LED_HIJAU, OUTPUT);
  pinMode(LED_MERAH, OUTPUT);

  digitalWrite(LED_HIJAU, LOW);
  digitalWrite(LED_MERAH, HIGH);

  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP ESP32: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  if (gps.location.isValid()) {
    digitalWrite(LED_HIJAU, HIGH);
    digitalWrite(LED_MERAH, LOW);

    float lat = gps.location.lat();
    float lng = gps.location.lng();

    Serial.printf("GPS VALID → lat: %.6f, lng: %.6f\n", lat, lng);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(backendURL);
      http.addHeader("Content-Type", "application/json");

      // JSON body sesuai format API backend
      String json = "{\"lat\":" + String(lat, 6) +
                    ",\"lng\":" + String(lng, 6) +
                    ",\"device_id\":\"esp32-01\"}";

      int response = http.POST(json);

      if (response == 200 || response == 201) {
        Serial.println("✅ Data GPS terkirim!");
        String responseBody = http.getString();
        Serial.println(responseBody);
      } else {
        Serial.printf("❌ Gagal kirim, HTTP Response: %d\n", response);
      }

      http.end();
    } else {
      Serial.println("WiFi terputus, mencoba reconnect...");
      WiFi.reconnect();
    }

  } else {
    digitalWrite(LED_HIJAU, LOW);
    digitalWrite(LED_MERAH, HIGH);
    Serial.println("GPS belum valid...");
  }

  delay(3000);
}
