{
  dockerTools,
  cacert,
  tzdata,
  lib,
  linkFarm,
  writeText,
  spdx-license-list-data,
  stdenv,
  app,
  server,
  rev,
}:
let
  inherit (app.meta) homepage license;
  doc = "usr/share/doc/ragold";
  installable = "github:${lib.removePrefix "https://github.com/" homepage}/${rev}#packages.${stdenv.hostPlatform.system}.docker";
  notices = linkFarm "ragold-notices" {
    "${doc}/LICENSE" = "${app}/LICENSE";
    "usr/share/licenses" = "${spdx-license-list-data.text}/text";
    "${doc}/NOTICE" = writeText "NOTICE" ''
      RAGold is licensed under the ${license.fullName} in LICENSE.
      License texts of third-party components are in /usr/share/licenses and the web app at /licenses.txt.

      Corresponding source per GPL-3.0 section 6(d) and LGPL-3.0 section 4 is the repository at commit ${rev}, whose lockfiles pin every component:
        ${homepage}/tree/${rev}

      List all sources:
        nix derivation show --recursive '${installable}'
      Rebuild from source:
        nix build '${installable}' --option substitute false
    '';
  };
in
dockerTools.streamLayeredImage {
  name = "ragold";
  tag = "latest";
  created = "now";
  contents = [
    cacert
    tzdata
    dockerTools.fakeNss
    notices
  ];
  extraCommands = ''
    mkdir -m 1777 tmp data config srv
  '';
  config = {
    Entrypoint = [ (lib.getExe server) ];
    ExposedPorts = {
      "${toString server.passthru.port}/tcp" = { };
    };
    User = "nobody:nobody";
    Env = [
      "XDG_CONFIG_HOME=/config"
      "XDG_DATA_HOME=/data"
      "HOME=/root"
    ];
    WorkingDir = "/srv";
    # The license is RAGold's own, the third-party ones are in /usr/share/doc/ragold/NOTICE.
    Labels."org.opencontainers.image.licenses" = license.spdxId;
  };
}
