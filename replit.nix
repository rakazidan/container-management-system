# Replit Configuration
# File ini digunakan untuk konfigurasi Replit deployment

# Module yang akan digunakan
{ pkgs }: {
  deps = [
    pkgs.python310Full
    pkgs.postgresql
  ];
}
