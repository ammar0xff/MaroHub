#!/bin/bash
set -e

# Build script for maro CLI tool
# Packages: deb, rpm, zst, AppImage, native executable

APP=maro
VERSION=1.0.0
MAINTAINER="Ammar <ammar0xff@github>"
DESC="MaroLinux GameHub CLI Package Manager"

SRC_DIR=$(pwd)
DIST_DIR="$SRC_DIR/dist"
BUILD_DIR="$SRC_DIR/build"
RELEASES_DIR="$SRC_DIR/releases"

# Colors
B="\033[1m"
C="\033[36m"
G="\033[32m"
Y="\033[33m"
R="\033[31m"
M="\033[35m"
END="\033[0m"

# Clean up
rm -rf "$DIST_DIR" "$BUILD_DIR" "$RELEASES_DIR"
mkdir -p "$DIST_DIR" "$BUILD_DIR" "$RELEASES_DIR"

# Check for required tools
missing_tools=()
for tool in python3 pip makepkg; do
  if ! command -v $tool >/dev/null 2>&1; then
    missing_tools+=("$tool")
  fi
done
if [ ${#missing_tools[@]} -ne 0 ]; then
  echo -e "${R}Missing required tools: ${missing_tools[*]}${END}"
  echo -e "${Y}Please install them and re-run the script.${END}"
  exit 1
fi

# Copy main script and requirements
cp "$APP" "$BUILD_DIR/$APP"
echo "libtorrent;python3;python3-pip" > "$BUILD_DIR/requirements.txt"
chmod +x "$BUILD_DIR/$APP"

# Post-install script (creates user dirs)
cat > "$BUILD_DIR/postinst.sh" <<EOF
#!/bin/sh
set -e
mkdir -p "$HOME/.maro"
mkdir -p "$HOME/Games"
exit 0
EOF
chmod +x "$BUILD_DIR/postinst.sh"

# 1. Build .deb
if command -v fpm >/dev/null 2>&1; then
  fpm -s dir -t deb -n "$APP" -v "$VERSION" \
    --description "$DESC" \
    --maintainer "$MAINTAINER" \
    --after-install "$BUILD_DIR/postinst.sh" \
    --deb-no-default-config-files \
    --depends python3 --depends python3-pip \
    --depends python3-libtorrent \
    -C "$BUILD_DIR" \
    -p "$DIST_DIR/${APP}_$VERSION.deb" \
    "$APP"=/usr/bin/$APP \
    requirements.txt=/usr/share/$APP/requirements.txt
  mv "$DIST_DIR/${APP}_$VERSION.deb" "$RELEASES_DIR/" 2>/dev/null || true
  echo -e "${G}[+] .deb package built and moved to releases.${END}"
  rm -rf "$BUILD_DIR" "$DIST_DIR"
  mkdir -p "$DIST_DIR" "$BUILD_DIR"
  cp "$APP" "$BUILD_DIR/$APP"
  echo "libtorrent;python3;python3-pip" > "$BUILD_DIR/requirements.txt"
  chmod +x "$BUILD_DIR/$APP"
  cat > "$BUILD_DIR/postinst.sh" <<EOF
#!/bin/sh
set -e
mkdir -p "$HOME/.maro"
mkdir -p "$HOME/Games"
exit 0
EOF
  chmod +x "$BUILD_DIR/postinst.sh"
else
  echo "[!] fpm not found, skipping .deb build. Install with: gem install --no-document fpm"
fi

# 2. Build .rpm
if command -v fpm >/dev/null 2>&1; then
  fpm -s dir -t rpm -n "$APP" -v "$VERSION" \
    --description "$DESC" \
    --maintainer "$MAINTAINER" \
    --after-install "$BUILD_DIR/postinst.sh" \
    --depends python3 --depends python3-pip \
    --depends python3-libtorrent \
    -C "$BUILD_DIR" \
    -p "$DIST_DIR/${APP}-$VERSION.rpm" \
    "$APP"=/usr/bin/$APP \
    requirements.txt=/usr/share/$APP/requirements.txt
  mv "$DIST_DIR/${APP}-$VERSION.rpm" "$RELEASES_DIR/" 2>/dev/null || true
  echo -e "${G}[+] .rpm package built and moved to releases.${END}"
  rm -rf "$BUILD_DIR" "$DIST_DIR"
  mkdir -p "$DIST_DIR" "$BUILD_DIR"
  cp "$APP" "$BUILD_DIR/$APP"
  echo "libtorrent;python3;python3-pip" > "$BUILD_DIR/requirements.txt"
  chmod +x "$BUILD_DIR/$APP"
  cat > "$BUILD_DIR/postinst.sh" <<EOF
#!/bin/sh
set -e
mkdir -p "$HOME/.maro"
mkdir -p "$HOME/Games"
exit 0
EOF
  chmod +x "$BUILD_DIR/postinst.sh"
else
  echo "[!] fpm not found, skipping .rpm build."
fi

# 3. Build .zst (Arch/Manjaro PKGBUILD)
echo -e "${C}[*] Building Arch/Manjaro .zst package...${END}"
if command -v makepkg >/dev/null 2>&1; then
  cat > "$BUILD_DIR/PKGBUILD" <<EOF
pkgname=$APP
pkgver=$VERSION
pkgrel=1
pkgdesc="$DESC"
arch=('any')
url="https://github.com/ammar0xff/MaroHub"
license=('MIT')
depends=('python' 'python-pip' 'libtorrent')
source=("$APP" "requirements.txt")
package() {
  install -Dm755 "${APP}" "${pkgdir}/usr/bin/${APP}"
  install -Dm644 requirements.txt "${pkgdir}/usr/share/${APP}/requirements.txt"
}
EOF
  (cd "$BUILD_DIR" && makepkg --force --nodeps --skipinteg --cleanbuild --nocheck) || echo -e "${R}[!] makepkg failed or not available.${END}"
  # After makepkg, find .zst in $SRC_DIR
  zst_file=$(find "$SRC_DIR" -maxdepth 1 -type f -name "*.zst" | sort -r | head -n1)
  if [ -n "$zst_file" ]; then
    mv "$zst_file" "$RELEASES_DIR/" && echo -e "${G}[+] .zst package built and moved to releases.${END}"
  else
    echo -e "${R}[!] .zst package not found in project directory.${END}"
  fi
  rm -rf "$BUILD_DIR" "$DIST_DIR"
  mkdir -p "$DIST_DIR" "$BUILD_DIR"
  cp "$APP" "$BUILD_DIR/$APP"
  echo "libtorrent;python3;python3-pip" > "$BUILD_DIR/requirements.txt"
  chmod +x "$BUILD_DIR/$APP"
  cat > "$BUILD_DIR/postinst.sh" <<EOF
#!/bin/sh
set -e
mkdir -p "$HOME/.maro"
mkdir -p "$HOME/Games"
exit 0
EOF
  chmod +x "$BUILD_DIR/postinst.sh"
else
  echo -e "${Y}[!] makepkg not found, skipping .zst build.${END}"
fi

# 4. Build AppImage
echo -e "${C}[*] Building AppImage...${END}"
if command -v appimagetool >/dev/null 2>&1; then
  APPDIR="$BUILD_DIR/AppDir"
  mkdir -p "$APPDIR/usr/bin" "$APPDIR/usr/share/applications" "$APPDIR/usr/share/icons/hicolor/256x256/apps"
  cp "$BUILD_DIR/$APP" "$APPDIR/usr/bin/$APP"
  cat > "$APPDIR/$APP.desktop" <<EOD
[Desktop Entry]
Type=Application
Name=MaroLinux GameHub CLI
Exec=$APP
Icon=maro
Categories=Game;
EOD
  cp "$APPDIR/$APP.desktop" "$APPDIR/usr/share/applications/"
  # Always create a 256x256 PNG icon as maro.png in AppDir
  if command -v convert >/dev/null 2>&1; then
    convert -size 256x256 xc:skyblue "$APPDIR/maro.png" 2>/dev/null || true
    cp "$APPDIR/maro.png" "$APPDIR/usr/share/icons/hicolor/256x256/apps/maro.png"
  else
    echo -e "${Y}[!] 'convert' not found, using no icon for AppImage.${END}"
    touch "$APPDIR/maro.png"
  fi
  (cd "$BUILD_DIR" && ARCH=x86_64 appimagetool AppDir "$DIST_DIR/${APP}.AppImage") && mv "$DIST_DIR/${APP}.AppImage" "$RELEASES_DIR/" && echo -e "${G}[+] AppImage built and moved to releases.${END}" || echo -e "${R}[!] AppImage build failed.${END}"
  rm -rf "$BUILD_DIR" "$DIST_DIR"
  mkdir -p "$DIST_DIR" "$BUILD_DIR"
  cp "$APP" "$BUILD_DIR/$APP"
  echo "libtorrent;python3;python3-pip" > "$BUILD_DIR/requirements.txt"
  chmod +x "$BUILD_DIR/$APP"
  cat > "$BUILD_DIR/postinst.sh" <<EOF
#!/bin/sh
set -e
mkdir -p "$HOME/.maro"
mkdir -p "$HOME/Games"
exit 0
EOF
  chmod +x "$BUILD_DIR/postinst.sh"
else
  echo -e "${Y}[!] appimagetool not found, skipping AppImage build.${END}"
fi

# 5. Native executable (PyInstaller)
echo -e "${C}[*] Building native executable (PyInstaller)...${END}"
if command -v pyinstaller >/dev/null 2>&1; then
  pyinstaller --onefile --name "$APP" "$SRC_DIR/$APP" --distpath "$DIST_DIR" --workpath "$SRC_DIR/pyi_build"
  mv "$DIST_DIR/$APP" "$RELEASES_DIR/$APP.bin" 2>/dev/null || true
  rm -rf "$SRC_DIR/pyi_build" "$SRC_DIR/__pycache__" "$SRC_DIR/$APP.spec" "$DIST_DIR"
  echo -e "${G}[+] Native executable built and moved to releases.${END}"
else
  echo -e "${Y}[!] pyinstaller not found, skipping native executable build.${END}"
fi

echo -e "\n${B}${C}All builds complete. Find packages in $RELEASES_DIR.${END}\n"
