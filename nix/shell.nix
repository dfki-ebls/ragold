{
  treefmt,
  mkShell,
  nodejs,
  lib,
}:
mkShell {
  shellHook = ''
    ${lib.getExe' nodejs "npm"} install
  '';
  packages = [
    nodejs
    treefmt
  ];
}
