{
  treefmt,
  mkShell,
  nodejs,
  uv,
}:
mkShell {
  shellHook = ''
    npm install
  '';
  packages = [
    nodejs
    treefmt
    uv
  ];
}
