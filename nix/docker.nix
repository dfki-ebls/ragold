{
  dockerTools,
  cacert,
  tzdata,
  lib,
  server,
}:
dockerTools.streamLayeredImage {
  name = "ragold";
  tag = "latest";
  created = "now";
  contents = [
    cacert
    tzdata
    dockerTools.fakeNss
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
  };
}
