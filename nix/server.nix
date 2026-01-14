{
  writeShellApplication,
  writeTextDir,
  app,
  lib,
  stdenv,
  caddy,
  runCommand,
  caddyPort ? 8080,
}:
let
  caddyfileRaw = writeTextDir "Caddyfile" ''
    {
      admin off
      auto_https off
      persist_config off
    }

    :${toString caddyPort} {
      root * ${app}
      encode gzip

      # Serve static files with SPA fallback
      handle {
        try_files {path} /index.html
        file_server
      }
    }
  '';

  caddyfileFormatted = runCommand "Caddyfile-formatted" { nativeBuildInputs = [ caddy ]; } /* bash */ ''
    mkdir -p $out
    cp --no-preserve=mode ${caddyfileRaw}/Caddyfile $out/Caddyfile
    caddy fmt --overwrite $out/Caddyfile
  '';

  caddyfile =
    if stdenv.buildPlatform == stdenv.hostPlatform then caddyfileFormatted else caddyfileRaw;
in
writeShellApplication {
  name = "server";
  text = ''
    echo "Starting Caddy server on port ${toString caddyPort}..."
    ${lib.getExe caddy} run --config ${caddyfile}/Caddyfile --adapter caddyfile
  '';
  derivationArgs = {
    passthru.port = caddyPort;
  };
  meta = app.meta // {
    inherit (caddy.meta) platforms;
  };
}
