{
  writeShellApplication,
  writeText,
  app,
  lib,
  caddy,
  caddyPort ? 8080,
}:
let
  caddyfile = writeText "Caddyfile" ''
    {
      admin off
      auto_https off
      persist_config off
    }

    :${toString caddyPort} {
      root * ${app}
      encode gzip

      handle {
        try_files {path} /index.html
        file_server
      }
    }
  '';
in
writeShellApplication {
  name = "server";
  text = ''
    ${lib.getExe caddy} run --config ${caddyfile} --adapter caddyfile
  '';
  derivationArgs = {
    passthru.port = caddyPort;
  };
  meta = app.meta // {
    inherit (caddy.meta) platforms;
  };
}
