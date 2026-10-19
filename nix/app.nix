{
  buildNpmPackage,
  importNpmLock,
  lib,
}:
buildNpmPackage (finalAttrs: {
  inherit (finalAttrs.npmDeps) pname version;
  inherit (importNpmLock) npmConfigHook;
  npmDeps = importNpmLock { npmRoot = finalAttrs.src; };

  src = ./..;

  installPhase = ''
    runHook preInstall

    cp -r "dist" "$out"

    runHook postInstall
  '';

  meta = with lib; {
    homepage = "https://github.com/dfki-ebls/ragold";
    license = licenses.mit;
    maintainers = with maintainers; [ mirkolenz ];
  };
})
