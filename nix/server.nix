{
  runCommand,
  makeBinaryWrapper,
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
      encode zstd gzip

      try_files {path} /index.html
      file_server
    }
  '';
in
# A binary wrapper, so no shell ships in the docker image.
runCommand "server"
  {
    nativeBuildInputs = [ makeBinaryWrapper ];
    passthru.port = caddyPort;
    meta = app.meta // {
      inherit (caddy.meta) platforms;
      mainProgram = "server";
    };
  }
  ''
    makeBinaryWrapper ${lib.getExe caddy} $out/bin/server \
      --add-flags "run --config ${caddyfile} --adapter caddyfile"
  ''
