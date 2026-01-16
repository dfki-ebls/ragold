{
  buildNpmPackage,
  importNpmLock,
  lib,
  biome,
  urlPrefix ? "/",
}:
buildNpmPackage (finalAttrs: {
  inherit (finalAttrs.npmDeps) pname version;
  inherit (importNpmLock) npmConfigHook;
  npmDeps = importNpmLock { npmRoot = finalAttrs.src; };

  src = ./..;
  npmBuildFlags = [
    "--"
    "--base"
    urlPrefix
  ];
  installPhase = ''
    runHook preInstall

    cp -r "dist" "$out"

    runHook postInstall
  '';

  BIOME_BINARY = lib.getExe biome;

  meta = with lib; {
    license = licenses.mit;
    maintainers = with maintainers; [ mirkolenz ];
  };
})
